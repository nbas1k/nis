const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { URL } = require('node:url');

try { process.loadEnvFile(path.join(__dirname, '.env')); } catch (error) { if (error.code !== 'ENOENT') console.error('Не удалось прочитать .env:', error.message); }

const HOST = '127.0.0.1';
const PORT = Number(process.env.PORT || 4174);
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
const ROOT = __dirname;
const MIME = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpeg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml'};
const JSON_HEADERS = {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const teacherSessions = new Set();
const loginAttempts = new Map();
function json(res,status,data){res.writeHead(status,JSON_HEADERS);res.end(JSON.stringify(data))}
async function body(req){let chunks=[],total=0;for await(const chunk of req){total+=chunk.length;if(total>24000)throw new Error('Слишком длинный запрос');chunks.push(chunk)}return JSON.parse(Buffer.concat(chunks).toString('utf8'))}
async function gemini({mode,message,history=[]}){
  const key=process.env.GEMINI_API_KEY;
  if(!key)throw Object.assign(new Error('Добавьте GEMINI_API_KEY в файл .env и перезапустите сервер.'),{status:503});
  const prompt=mode==='support'
    ? 'Ты доброжелательный помощник школьника НИШ. Отвечай по-русски кратко и бережно, помогай снизить учебный стресс с помощью дыхания, планирования и отдыха. Не выдавай себя за психолога и не ставь диагноз. При признаках опасности для себя или других мягко предложи сразу обратиться к доверенному взрослому или экстренной помощи.'
    : 'Ты академический тьютор для ученика 8 класса НИШ. Отвечай по-русски ясно и кратко, объясняй шагами, задавай вопросы для самопроверки. Известные демо-данные: СОР по биологии «Молекулярная биология и биохимия» 24.09.2026 — 15 из 20. Математика: модульная арифметика, теория чисел. Не придумывай личные оценки или расписание сверх этих данных.';
  const contents=history.slice(-8).filter(x=>x&&['user','model'].includes(x.role)&&typeof x.text==='string').map(x=>({role:x.role,parts:[{text:x.text.slice(0,3000)}]}));
  contents.push({role:'user',parts:[{text:message.slice(0,4000)}]});
  const upstream=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify({systemInstruction:{parts:[{text:prompt}]},contents,generationConfig:{maxOutputTokens:800,temperature:0.65}}),signal:AbortSignal.timeout(90000)});
  const result=await upstream.json();
  if(!upstream.ok){
    const message=upstream.status===503?'Gemini сейчас перегружен. Повторите запрос через минуту.':upstream.status===429?'Лимит запросов Gemini исчерпан. Попробуйте позже.':result.error?.message||`Gemini API: HTTP ${upstream.status}`;
    throw Object.assign(new Error(message),{status:upstream.status===429?429:upstream.status===503?503:502});
  }
  const answer=result.candidates?.[0]?.content?.parts?.map(x=>x.text||'').join('').trim();
  if(!answer)throw Object.assign(new Error('Gemini не вернул текстовый ответ. Попробуйте ещё раз.'),{status:502});
  return answer;
}
const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,`http://${HOST}:${PORT}`);
    if(req.method==='GET'&&url.pathname==='/api/status')return json(res,200,{configured:Boolean(process.env.GEMINI_API_KEY),model:MODEL});
    if(req.method==='GET'&&url.pathname==='/api/teacher/status'){
      const token=/nis_teacher=([a-f0-9]+)/.exec(req.headers.cookie||'')?.[1];
      return json(res,200,{teacher:Boolean(token&&teacherSessions.has(token))});
    }
    if(req.method==='POST'&&url.pathname==='/api/teacher/login'){
      const attempts=loginAttempts.get('local')||{count:0,until:0};
      if(Date.now()<attempts.until)return json(res,429,{error:'Слишком много попыток. Попробуйте через минуту.'});
      const data=await body(req);
      if(!process.env.TEACHER_PIN||typeof data.pin!=='string'||data.pin!==process.env.TEACHER_PIN){
        attempts.count++;
        if(attempts.count>=5){attempts.count=0;attempts.until=Date.now()+60000;}
        loginAttempts.set('local',attempts);
        return json(res,401,{error:'Неверный PIN учителя.'});
      }
      loginAttempts.delete('local');
      const token=crypto.randomBytes(24).toString('hex');teacherSessions.add(token);
      res.writeHead(200,{...JSON_HEADERS,'Set-Cookie':`nis_teacher=${token}; HttpOnly; SameSite=Strict; Path=/`});
      return res.end(JSON.stringify({teacher:true}));
    }
    if(req.method==='POST'&&url.pathname==='/api/teacher/logout'){
      const token=/nis_teacher=([a-f0-9]+)/.exec(req.headers.cookie||'')?.[1];
      if(token)teacherSessions.delete(token);
      res.writeHead(200,{...JSON_HEADERS,'Set-Cookie':'nis_teacher=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'});
      return res.end(JSON.stringify({teacher:false}));
    }
    if(req.method==='POST'&&url.pathname==='/api/chat'){
      const data=await body(req);
      if(typeof data.message!=='string'||!data.message.trim()||data.message.length>4000)return json(res,400,{error:'Сообщение должно содержать от 1 до 4000 символов.'});
      if(!['academic','support'].includes(data.mode))return json(res,400,{error:'Неизвестный режим.'});
      return json(res,200,{answer:await gemini(data)});
    }
    if(req.method!=='GET'&&req.method!=='HEAD')return json(res,405,{error:'Метод не поддерживается'});
    const file=url.pathname==='/'?'index.html':decodeURIComponent(url.pathname).replace(/^\/+/, '');
    if(!['index.html','app.js','gemini-client.js','features.js','timetables.js','style.css','redesign.css','nis-logo.jpeg'].includes(file))return json(res,404,{error:'Не найдено'});
    const filename=path.join(ROOT,file);
    res.writeHead(200,{'Content-Type':MIME[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});
    if(req.method==='HEAD')return res.end();
    fs.createReadStream(filename).pipe(res);
  }catch(error){console.error(error.status||500,error.message);json(res,error.status||500,{error:error.message||'Ошибка сервера'})}
});
server.listen(PORT,HOST,()=>console.log(`NIS Smart Hub: http://${HOST}:${PORT}`));

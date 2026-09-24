const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { URL } = require('node:url');

try { process.loadEnvFile(path.join(__dirname, '.env')); } catch (error) { if (error.code !== 'ENOENT') console.error('Не удалось прочитать .env:', error.message); }

const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number(process.env.PORT || 4174);
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const ROOT = __dirname;
const MIME = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpeg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml'};
const JSON_HEADERS = {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const teacherSessions = new Set();
const loginAttempts = new Map();
function json(res,status,data){res.writeHead(status,JSON_HEADERS);res.end(JSON.stringify(data))}
async function body(req){let chunks=[],total=0;for await(const chunk of req){total+=chunk.length;if(total>24000)throw new Error('Слишком длинный запрос');chunks.push(chunk)}return JSON.parse(Buffer.concat(chunks).toString('utf8'))}
function studyFallback({mode,message}){
  const text=message.toLowerCase();
  if(mode==='support')return '⚡ Учебный помощник работает в демо-режиме. Сделай паузу на 2 минуты: выпрями спину, сделай 4 медленных вдоха и выдоха, затем выбери одну маленькую задачу на ближайшие 25 минут. Ты справишься.';
  if(/биолог|биохим|молекул/.test(text))return '⚡ Демо-режим тьютора. Для СОР по молекулярной биологии повтори: строение ДНК и РНК, репликацию, роль белков и ферментов. Реши 3 задания: сравни ДНК и РНК, объясни комплементарность, назови этапы синтеза белка.';
  if(/матем|алгебр|модул|задач/.test(text))return '⚡ Демо-режим тьютора. Начни с условия и выпиши, что известно. Для модульной арифметики проверь остатки при делении и используй запись a ≡ b (mod n). Пришли конкретную задачу или фото условия — разберём по шагам.';
  if(/хими|реакц|оксид/.test(text))return '⚡ Демо-режим тьютора. Чтобы уравнять реакцию: 1) запиши формулы веществ; 2) посчитай атомы каждого элемента; 3) подбери коэффициенты; 4) перепроверь обе части. Начни с металла или сложного вещества, а кислород обычно оставь напоследок.';
  return '⚡ Учебный помощник работает в демо-режиме. Я могу помочь подготовить план к СОР, повторить тему по биологии, решить задачу по математике или уравнять реакцию по химии. Напиши предмет и конкретное задание.';
}
async function openai({mode,message,history=[]}){
  const key=process.env.OPENAI_API_KEY;
  if(!key)throw Object.assign(new Error('Добавьте OPENAI_API_KEY в переменные окружения Render.'),{status:503});
  const prompt=mode==='support'
    ? 'Ты доброжелательный помощник школьника НИШ. Отвечай по-русски кратко и бережно, помогай снизить учебный стресс с помощью дыхания, планирования и отдыха. Не выдавай себя за психолога и не ставь диагноз. При признаках опасности для себя или других мягко предложи сразу обратиться к доверенному взрослому или экстренной помощи.'
    : 'Ты академический тьютор для ученика 8 класса НИШ. Отвечай по-русски ясно и кратко, объясняй шагами, задавай вопросы для самопроверки. Известные демо-данные: СОР по биологии «Молекулярная биология и биохимия» 24.09.2026 — 15 из 20. Математика: модульная арифметика, теория чисел. Не придумывай личные оценки или расписание сверх этих данных.';
  const messages=[{role:'system',content:prompt},...history.slice(-8).filter(x=>x&&['user','assistant','model'].includes(x.role)&&typeof x.text==='string').map(x=>({role:x.role==='model'?'assistant':x.role,content:x.text.slice(0,3000)})),{role:'user',content:message.slice(0,4000)}];
  const upstream=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${key}`},body:JSON.stringify({model:MODEL,messages,max_tokens:800,temperature:0.65}),signal:AbortSignal.timeout(90000)});
  const result=await upstream.json();
  if(!upstream.ok){
    if(upstream.status===429)return studyFallback({mode,message});
    const message=upstream.status===503?'OpenAI сейчас перегружен. Повторите запрос через минуту.':upstream.status===429?'Для ключа OpenAI нет доступной квоты. Проверьте Billing и лимиты в OpenAI Platform.':result.error?.message||`OpenAI API: HTTP ${upstream.status}`;
    throw Object.assign(new Error(message),{status:upstream.status===429?429:upstream.status===503?503:502});
  }
  const answer=result.choices?.[0]?.message?.content?.trim();
  if(!answer)throw Object.assign(new Error('OpenAI не вернул текстовый ответ. Попробуйте ещё раз.'),{status:502});
  return answer;
}
const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,`http://${HOST}:${PORT}`);
    if(req.method==='GET'&&url.pathname==='/api/status')return json(res,200,{configured:Boolean(process.env.OPENAI_API_KEY),model:MODEL,provider:'openai'});
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
      return json(res,200,{answer:await openai(data)});
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

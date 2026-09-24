// Gemini requests always go through the local server; the API key never reaches this file.
const oldGrades = grades;
grades = function () {
  return oldGrades().replace('<div class="grid two-col">', `<div class="ai-hero"><div><span class="ai-hero-kicker">✦ GEMINI / NIS SMART HUB</span><h2>Знания становятся понятнее</h2><p>Спросите о сложной теме, составьте план подготовки или разберите результат СОР вместе с AI.</p><div class="ai-hero-links"><span>Биология · 15/20</span><span>Математика · СОЧ через 6 дней</span></div></div><div class="ai-orb">✦</div></div><div class="grid two-col">`);
};
if (state.page === 'grades') render();

async function askGemini(message, mode = 'academic', history = []) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, mode, history })
  });
  let data;
  try { data = await response.json(); } catch { throw new Error('Сервер не вернул ответ. Запустите сайт через START.cmd.'); }
  if (!response.ok) throw new Error(data.error || 'Не удалось получить ответ Gemini.');
  return data.answer;
}

document.addEventListener('submit', async event => {
  if (event.target.id !== 'chat-form') return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const input = document.querySelector('#chat-input');
  const question = input.value.trim();
  if (!question) return;
  const oldHistory = (state.chat || []).filter(m => m.role === 'user' || m.role === 'ai').map(m => ({ role: m.role === 'ai' ? 'model' : 'user', text: m.text }));
  state.chat.push({ role: 'user', text: question });
  save(); render();
  const messages = document.querySelector('#messages');
  const waiting = document.createElement('div');
  waiting.className = 'bubble ai-waiting';
  waiting.textContent = 'Gemini думает…';
  messages.append(waiting);
  messages.scrollTop = messages.scrollHeight;
  const send = document.querySelector('#chat-form button');
  send.disabled = true;
  try {
    const answer = await askGemini(question, state.aiMode || 'academic', oldHistory);
    state.chat.push({ role: 'ai', text: answer });
    save(); render();
    document.querySelector('#messages').scrollTop = document.querySelector('#messages').scrollHeight;
  } catch (error) {
    waiting.textContent = error.message;
    waiting.classList.add('ai-error');
    send.disabled = false;
  }
}, true);

document.addEventListener('click', async event => {
  if (event.target.id !== 'summary') return;
  event.preventDefault();
  event.stopImmediatePropagation();
  modal('<h2>Шпаргалка к СОЧ · Биология</h2><p id="summary-text">Gemini составляет краткий конспект…</p><div class="modal-actions"><button class="btn" data-close>Закрыть</button></div>');
  try {
    const answer = await askGemini('Сделай компактную шпаргалку для ученика 8 класса к СОЧ по разделу «Молекулярная биология и биохимия»: 6 ключевых понятий, 3 проверочных вопроса и план повторения. Учитывай результат СОР 15/20.', 'academic');
    const target = document.querySelector('#summary-text');
    if (target) { target.textContent = answer; target.style.whiteSpace = 'pre-wrap'; }
  } catch (error) {
    const target = document.querySelector('#summary-text');
    if (target) target.textContent = error.message;
  }
}, true);

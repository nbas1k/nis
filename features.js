// Additional prototype workflows. All records are local to this browser.
nav.splice(6, 0, ['lost', 'Бюро находок', '◇']);
state.grades = Array.isArray(state.grades) ? state.grades : [];
state.lostItems = Array.isArray(state.lostItems) ? state.lostItems : [];
state.studentClass = window.NIS_TIMETABLES?.[state.studentClass] ? state.studentClass : '8A';
if (!state.themeV2) { state.theme = 'dark'; state.themeV2 = true; save(); }

const students = ['Алия К.', 'Данияр С.', 'Айша Н.', 'Арман Т.', 'Мадина Е.'];
const teacherPlan = [
  [['8 «А»', 'Ж-201'], ['8 «Б»', 'Ж-201'], ['9 «А»', 'Ж-201'], ['8 «А»', 'Ж-201']],
  [['9 «Б»', 'Ж-201'], ['8 «А»', 'Ж-201'], ['8 «Б»', 'Ж-201']],
  [['8 «А»', 'Ж-201'], ['9 «А»', 'Ж-201'], ['9 «Б»', 'Ж-201'], ['8 «Б»', 'Ж-201']],
  [['8 «А»', 'Ж-201'], ['8 «Б»', 'Ж-201'], ['9 «А»', 'Ж-201'], ['9 «Б»', 'Ж-201']],
  [['9 «А»', 'Ж-201'], ['8 «А»', 'Ж-201'], ['8 «Б»', 'Ж-201']]
];
function teacherLesson(day, index) {
  const [klass, room] = teacherPlan[day][index];
  return `<div class="teacher-lesson"><div class="lesson-num">${index + 1}<small>урок</small></div><div><b>Математика · ${klass}</b><small>${times[index]}–${times[index].slice(0, 2)}:45 · ${room}</small></div><span class="tag">${index < 2 ? 'Утро' : 'По плану'}</span></div>`;
}
function teacherSchedule() {
  return `<div class="page">${title('Моё расписание', 'Гульжан Б. · математика · неделя 21–25 сентября 2026', '<span class="pill">Личный график учителя</span>')}<div class="card teacher-note"><b>Сегодня: ${teacherPlan[3].length} урока</b><span>Первый урок в 08:00 · кабинет Ж-201 · длинных окон нет</span></div><div class="teacher-week">${days.map((day, i) => `<section class="card teacher-day ${i === 3 ? 'is-today' : ''}"><div class="day-head">${day}<small>${21 + i} сентября ${i === 3 ? '· сегодня' : ''}</small></div>${teacherPlan[i].map((_, j) => teacherLesson(i, j)).join('')}</section>`).join('')}</div><p class="sub" style="margin-top:18px">Личное расписание учителя — демонстрационный пример. Оно видно только в режиме «Учитель».</p></div>`;
}
const previousSchedule = schedule;
const pdfTimes = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
// Transcribed from page 12 (8A) of students.pdf, compiled 08.09.2026.
const pdf8A = [
  [
    {slots:[1,2],subject:'Казахский язык и литература',room:'Д104',teacher:'Таскин К.'},
    {slots:[3,4],subject:'География',room:'Л102',teacher:'Жаман А.'},
    {slots:[5,6],subject:'Английский язык',room:'Д205',teacher:'Исат М.'},
    {slots:[7],subject:'Биология',room:'Г207',teacher:'Тем У.'},
    {slots:[8],subject:'ОснИН',room:'Л203',teacher:'Бакт Н.'}
  ],
  [
    {slots:[1],subject:'Физика',room:'Ж102',teacher:'Жармус С.'},
    {slots:[2],subject:'Русский язык и литература',room:'Д203',teacher:'Зияб Э.'},
    {slots:[3],subject:'Математика',room:'Д202',teacher:'Шойб А.'},
    {slots:[4],subject:'Казахский язык и литература',room:'Д104',teacher:'Таскин К.'},
    {slots:[5,6],subject:'Химия',room:'Л203',teacher:'Бакт Н.'},
    {slots:[7,8],subject:'Физическая культура',room:'—',teacher:'Даир Л.'}
  ],
  [
    {slots:[1,2],subject:'Русский язык и литература',room:'Д203',teacher:'Зияб Э.'},
    {slots:[3,4],subject:'Математика',room:'Д202',teacher:'Шойб А.'},
    {slots:[5],subject:'Всемирная история',room:'Г205',teacher:'Али А.'},
    {slots:[6,7],subject:'Биология',room:'Г207',teacher:'Тем У.'},
    {slots:[8],subject:'Классный час',room:'Д204',teacher:'Шак А.'},
    {slots:[9],subject:'8сынЭлк',room:'Ж102',teacher:'—'}
  ],
  [
    {slots:[1,2],subject:'Математика',room:'Д202',teacher:'Шойб А.'},
    {slots:[3,4],subject:'Физика',room:'Ж102',teacher:'Жармус С.'},
    {slots:[5,6],subject:'Информатика',room:'Г204',teacher:'Рыс Ж.'},
    {slots:[7,8],subject:'Английский язык',room:'Д203',teacher:'Исат М.'}
  ],
  [
    {slots:[1,2],subject:'Казахский язык и литература',room:'Д104',teacher:'Таскин К.'},
    {slots:[3,4],subject:'История Казахстана',room:'Л101',teacher:'Ибр А.'},
    {slots:[5,6],subject:'Искусство',room:'Г303',teacher:'Кулан Ф.'},
    {slots:[7],subject:'Химия',room:'Л203',teacher:'Бакт Н.'},
    {slots:[8],subject:'Математика · электив',room:'Ж102',teacher:'Шойб А.'}
  ]
];
function pdfSlotLabel(item) { return item.slots.length === 1 ? `${item.slots[0]} урок` : `${item.slots[0]}–${item.slots.at(-1)} уроки`; }
function pdfTimeLabel(item) { return `${pdfTimes[item.slots[0]-1]}–${pdfTimes[item.slots.at(-1)-1].slice(0,2)}:45`; }
function pdfLesson(item) { return `<div class="pdf-lesson"><div class="pdf-lesson-slot">${pdfSlotLabel(item)}<small>${pdfTimeLabel(item)}</small></div><div class="pdf-lesson-main"><b>${escapeHtml(item.subject)}</b><small>${escapeHtml(item.details || `${item.room} · ${item.teacher}`)}</small></div></div>`; }
function selectedTimetable() { return window.NIS_TIMETABLES?.[state.studentClass] || pdf8A; }
function classOptions() {
  const classes = Object.keys(window.NIS_TIMETABLES || {'8A':pdf8A});
  return [...new Set(classes.map(x => x.match(/^\d+/)?.[0]))].map(grade => `<optgroup label="${grade} класс">${classes.filter(x => x.startsWith(grade) && x.match(/^\d+/)?.[0] === grade).map(x => `<option value="${x}" ${state.studentClass === x ? 'selected' : ''}>${x}</option>`).join('')}</optgroup>`).join('');
}
function studentPdfSchedule() {
  const page = Object.keys(window.NIS_TIMETABLES || {}).indexOf(state.studentClass) + 1;
  return `<div class="page">${title(`Расписание ${state.studentClass}`, 'Выберите класс и смотрите расписание из students.pdf', `<label class="class-picker">Класс <select id="class-select" aria-label="Выбрать класс">${classOptions()}</select></label>`)}<div class="card pdf-source"><b>Расписание из школьного PDF${page ? ` · страница ${page}` : ''}</b><span>Составлено 08.09.2026. Указаны номера уроков, время, предметы, кабинеты и сокращённые фамилии преподавателей.</span></div><div class="pdf-week">${days.map((day, index) => `<section class="card pdf-day ${index === 3 ? 'is-today' : ''}"><div class="day-head">${day}<small>${21 + index} сентября ${index === 3 ? '· сегодня' : ''}</small></div>${selectedTimetable()[index].map(pdfLesson).join('')}</section>`).join('')}</div><p class="sub" style="margin-top:18px">Сокращения предметов, которые нельзя однозначно раскрыть, сохранены как в PDF. Пары уроков показаны одной карточкой.</p></div>`;
}
schedule = function () { return state.role === 'teacher' ? teacherSchedule() : studentPdfSchedule(); };

const previousRooms = rooms;
rooms = function () {
  const html = previousRooms();
  if (state.role === 'teacher') return html;
  return html.replace('Найдите место для проекта, консультации или командной работы', 'Посмотрите, какие кабинеты доступны · бронирование выполняет учитель')
    .replace('<div class="toolbar" id="room-filters">', '<div class="card booking-notice">Для бронирования кабинета обратитесь к учителю. Ученики могут просматривать занятость кабинетов.</div><div class="toolbar" id="room-filters">');
};
const previousRoomCards = roomCards;
roomCards = function (filter = 'all') {
  previousRoomCards(filter);
  if (state.role !== 'student') return;
  const bookedFilter = document.querySelector('[data-filter="booked"]');
  if (bookedFilter) bookedFilter.hidden = true;
  document.querySelectorAll('[data-book]').forEach(button => {
    const label = button.textContent;
    button.removeAttribute('data-book');
    button.disabled = true;
    button.textContent = label === 'Недоступен сейчас' ? 'Занят' : label === 'Отменить бронирование' ? 'Забронирован' : 'Только для учителя';
  });
  document.querySelectorAll('.room .tag').forEach(tag => {
    if (tag.textContent === 'Вы забронировали') tag.textContent = 'Забронирован';
  });
};

const previousHome = home;
home = function () {
  let html = previousHome();
  if (state.role !== 'teacher') {
    const start = html.indexOf('<div class="lesson">');
    const end = html.indexOf('</div><div class="grid"><div class="card">', start);
    if (start !== -1 && end !== -1) html = html.slice(0, start) + selectedTimetable()[3].map(pdfLesson).join('') + html.slice(end);
    const periods = selectedTimetable()[3].at(-1)?.slots.at(-1) || 0;
    return html.replace('Расписание на сегодня', `Расписание ${state.studentClass} на сегодня`).replace('<b>6</b><small>Уроков сегодня', `<b>${periods}</b><small>Уроков сегодня`).replace('Математика и физика — утром', 'По расписанию из PDF');
  }
  html = html.replace('Расписание на сегодня', 'Мои уроки сегодня');
  const start = html.indexOf('<div class="lesson">');
  const end = html.indexOf('</div><div class="grid"><div class="card">', start);
  if (start !== -1 && end !== -1) html = html.slice(0, start) + teacherPlan[3].map((_, i) => teacherLesson(3, i)).join('') + html.slice(end);
  return html;
};

function gradeRows() {
  const records = [{ id: 0, student: 'Алия К.', subject: 'Биология', kind: 'СОР', section: 'Молекулярная биология и биохимия', score: 15, max: 20, date: '24.09.2026' }, ...state.grades];
  const shown = state.role === 'teacher' ? records : records.filter(x => x.student === 'Алия К.');
  return shown.map(x => `<div class="grade-row"><div><b>${escapeHtml(x.subject)} · ${escapeHtml(x.kind)}</b><small>${escapeHtml(x.section)} · ${escapeHtml(x.date)}${state.role === 'teacher' ? ` · ${escapeHtml(x.student)}` : ''}</small></div><strong>${Number(x.score)} / ${Number(x.max)}</strong>${state.role === 'teacher' && x.id ? `<button class="remove-mini" data-delete-grade="${x.id}" aria-label="Удалить оценку">×</button>` : ''}</div>`).join('');
}
const previousGrades = grades;
grades = function () {
  const html = previousGrades();
  const journal = `<section class="card grade-journal"><div class="section-title"><h2>${state.role === 'teacher' ? 'Журнал оценок · 8 «А»' : 'Мои оценки'}</h2>${state.role === 'teacher' ? '<button class="btn small" id="add-grade">+ Выставить оценку</button>' : ''}</div><div>${gradeRows()}</div><p class="tiny muted">Оценки, добавленные в демо, сохраняются в этом браузере.</p></section>`;
  return html.slice(0, -6) + journal + '</div>';
};

homeworkPage = function () {
  const teacher = state.role === 'teacher';
  const assignments = [...homework, ...(state.extraTasks || [])].map((task, i) => ({task, i})).filter(({task}) => teacher || !task[3] || task[3] === '8 «А»');
  return `<div class="page">${title('Домашние задания', teacher ? 'Задания для классов и контроль выполнения' : 'Мои задания и заметки', teacher ? '<button class="btn" id="add-task">+ Задать домашнее задание</button>' : '')}<div class="card">${cardTitle(teacher ? 'Выданные задания' : 'Активные задания')}<div id="task-list">${assignments.map(({task:h,i}) => `<div class="task ${!teacher && state.done[i] ? 'done' : ''}">${teacher ? '' : `<input class="tasks-check" type="checkbox" data-done="${i}" ${state.done[i] ? 'checked' : ''} aria-label="Отметить выполнение ${h[0]}">`}<div class="circle">${subjects.find(x => x[0] === h[0])?.[3] || '✎'}</div><div class="task-body"><b>${escapeHtml(h[0])}</b><small>${escapeHtml(h[1])} · до ${escapeHtml(formatDue(h[2]))}</small>${teacher ? `<span class="tiny muted">Класс ${escapeHtml(h[3] || '8 «А»')} · ${i < 3 ? 'демо-задание' : 'добавлено учителем'}</span>` : `<textarea data-note="${i}" placeholder="Добавить заметку...">${escapeHtml(state.notes[i] || '')}</textarea><input type="file" data-file="${i}" aria-label="Прикрепить файл к заданию">`}</div><span class="tag ${!teacher && state.done[i] ? 'green' : 'orange'}">${!teacher && state.done[i] ? 'Готово' : teacher ? 'Назначено' : 'В работе'}</span>${teacher && i >= 3 ? `<button class="remove-mini" data-delete-task="${i}" aria-label="Удалить задание">×</button>` : ''}</div>`).join('')}</div></div></div>`;
};
function formatDue(value) { return /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(value + 'T12:00:00').toLocaleDateString('ru-RU') : value; }
function taskDialog() {
  modal(`<h2>Новое домашнее задание</h2><p>Выберите класс и укажите срок сдачи.</p><form id="task-form"><label>Класс</label><select class="input" name="klass"><option>8 «А»</option><option>8 «Б»</option><option>9 «А»</option><option>9 «Б»</option></select><label>Предмет</label><select class="input" name="subject">${subjects.map(x => `<option>${x[0]}</option>`).join('')}</select><label>Задание</label><textarea name="text" required maxlength="300" placeholder="Опишите задание"></textarea><label>Срок сдачи</label><input class="input" name="due" type="date" required><div class="modal-actions"><button type="button" class="btn ghost" data-close>Отмена</button><button class="btn">Опубликовать</button></div></form>`);
}

function lostPage() {
  return `<div class="page">${title('Бюро находок', 'Сфотографируйте вещь и помогите ей вернуться владельцу', '<button class="btn" id="add-lost">+ Разместить вещь</button>')}<div class="lost-intro"><span>◇</span><div><b>Потеряли или нашли?</b><p>Добавьте описание, место и фотографию. Объявление сразу появится на этой странице у ученика и учителя в этом браузере.</p></div></div><div class="lost-grid">${state.lostItems.length ? state.lostItems.map(x => `<article class="card lost-card"><img src="${x.photo}" alt="${escapeHtml(x.name)}"><div class="lost-card-content"><span class="tag ${x.type === 'Найдено' ? 'green' : 'orange'}">${escapeHtml(x.type)}</span><h3>${escapeHtml(x.name)}</h3><p>${escapeHtml(x.details)}</p><small>📍 ${escapeHtml(x.location)} · ${escapeHtml(x.date)}</small>${state.role === 'teacher' ? `<button class="remove-mini" data-delete-lost="${x.id}" aria-label="Удалить объявление">Удалить</button>` : ''}</div></article>`).join('') : '<div class="card lost-empty"><span>◇</span><h3>Пока нет объявлений</h3><p>Первым добавьте найденную или потерянную вещь с фотографией.</p></div>'}</div></div>`;
}
const previousRender = render;
render = function () {
  if (state.page === 'lost') {
    previousRender();
    document.querySelector('#content').innerHTML = lostPage();
    document.querySelector('#crumb').textContent = 'Бюро находок';
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.page === 'lost'));
  } else previousRender();
};

function gradeDialog() {
  modal(`<h2>Выставить оценку</h2><p>Оценка появится в журнале учителя и в профиле выбранного ученика.</p><form id="grade-form"><label>Ученик · 8 «А»</label><select class="input" name="student" required>${students.map(x => `<option>${x}</option>`).join('')}</select><label>Предмет</label><select class="input" name="subject" required>${subjects.map(x => `<option>${x[0]}</option>`).join('')}</select><label>Вид работы</label><select class="input" name="kind"><option>СОР</option><option>СОЧ</option><option>Контрольная</option><option>Текущая работа</option></select><label>Раздел / тема</label><input class="input" name="section" required maxlength="100" placeholder="Например, Теория чисел"><div class="grade-fields"><div><label>Балл</label><input class="input" name="score" type="number" min="0" step="1" required></div><div><label>Максимум</label><input class="input" name="max" type="number" min="1" step="1" required></div></div><div class="modal-actions"><button type="button" class="btn ghost" data-close>Отмена</button><button class="btn">Сохранить оценку</button></div></form>`);
}
function lostDialog() {
  modal(`<h2>Разместить вещь</h2><p>На телефоне кнопка выбора фото может открыть камеру.</p><form id="lost-form"><label>Что произошло?</label><select class="input" name="type"><option>Найдено</option><option>Потеряно</option></select><label>Название вещи</label><input class="input" name="name" required maxlength="70" placeholder="Например, синий пенал"><label>Где?</label><input class="input" name="location" required maxlength="80" placeholder="Коридор у кабинета Ж103"><label>Описание</label><textarea name="details" required maxlength="250" placeholder="Приметы вещи"></textarea><label>Фотография</label><input class="input" name="photo" type="file" accept="image/*" capture="environment" required><div class="modal-actions"><button type="button" class="btn ghost" data-close>Отмена</button><button class="btn">Опубликовать</button></div></form>`);
}
function compressPhoto(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) return reject(new Error('Выберите фотографию в формате изображения.'));
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      const scale = Math.min(1, 800 / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale);
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.68));
    };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Не удалось открыть фотографию.')); };
    image.src = url;
  });
}

document.addEventListener('click', event => {
  if (state.role === 'student' && event.target.closest('[data-book]')) { event.stopImmediatePropagation(); toast('Кабинет может бронировать только учитель'); return; }
  if (event.target.id === 'add-grade') { event.stopImmediatePropagation(); if (state.role !== 'teacher') return toast('Оценки может выставлять только учитель'); gradeDialog(); }
  if (event.target.id === 'add-lost') { event.stopImmediatePropagation(); lostDialog(); }
  if (event.target.id === 'add-task') { event.stopImmediatePropagation(); if (state.role !== 'teacher') return toast('Задания может задавать только учитель'); taskDialog(); }
  const removeGrade = event.target.closest('[data-delete-grade]');
  if (removeGrade) { event.stopImmediatePropagation(); if (state.role !== 'teacher') return; state.grades = state.grades.filter(x => x.id !== Number(removeGrade.dataset.deleteGrade)); save(); render(); toast('Оценка удалена'); }
  const removeLost = event.target.closest('[data-delete-lost]');
  if (removeLost) { event.stopImmediatePropagation(); if (state.role !== 'teacher') return; state.lostItems = state.lostItems.filter(x => x.id !== Number(removeLost.dataset.deleteLost)); save(); render(); toast('Объявление удалено'); }
  const removeTask = event.target.closest('[data-delete-task]');
  if (removeTask) { event.stopImmediatePropagation(); if (state.role !== 'teacher') return; const i = Number(removeTask.dataset.deleteTask); state.extraTasks.splice(i - homework.length, 1); save(); render(); toast('Задание удалено'); }
}, true);

document.addEventListener('submit', async event => {
  const form = event.target;
  if (form.id === 'booking-form' && state.role !== 'teacher') { event.preventDefault(); event.stopImmediatePropagation(); closeModal(); toast('Кабинет может бронировать только учитель'); return; }
  if (form.id === 'grade-form') {
    event.preventDefault(); event.stopImmediatePropagation();
    if (state.role !== 'teacher') return toast('Оценки может выставлять только учитель');
    const data = new FormData(form), score = Number(data.get('score')), max = Number(data.get('max'));
    if (!Number.isInteger(score) || !Number.isInteger(max) || score < 0 || max < 1 || score > max) return toast('Проверьте балл и максимальный балл');
    state.grades.unshift({ id: Date.now(), student: data.get('student'), subject: data.get('subject'), kind: data.get('kind'), section: data.get('section').trim(), score, max, date: new Date().toLocaleDateString('ru-RU') });
    save(); closeModal(); render(); toast('Оценка добавлена в журнал');
  }
  if (form.id === 'lost-form') {
    event.preventDefault(); event.stopImmediatePropagation();
    const data = new FormData(form);
    try {
      const photo = await compressPhoto(data.get('photo'));
      const item = { id: Date.now(), type: data.get('type'), name: data.get('name').trim(), location: data.get('location').trim(), details: data.get('details').trim(), photo, date: new Date().toLocaleDateString('ru-RU') };
      state.lostItems.unshift(item);
      try { save(); } catch { state.lostItems.shift(); return toast('Недостаточно места для фото. Выберите другое изображение.'); }
      closeModal(); render(); toast('Объявление с фотографией опубликовано');
    } catch (error) { toast(error.message); }
  }
  if (form.id === 'task-form') {
    event.preventDefault(); event.stopImmediatePropagation();
    if (state.role !== 'teacher') return toast('Задания может задавать только учитель');
    const data = new FormData(form);
    state.extraTasks = [...(state.extraTasks || []), [data.get('subject'), data.get('text').trim(), data.get('due'), data.get('klass')]];
    save(); closeModal(); render(); toast('Задание опубликовано для ' + data.get('klass'));
  }
}, true);

function teacherPinDialog() {
  modal(`<h2>Вход для учителя</h2><p>Введите PIN из локального файла .env, чтобы открыть журнал, задания и личное расписание.</p><form id="teacher-login-form"><label>PIN учителя</label><input class="input" name="pin" type="password" inputmode="numeric" autocomplete="off" required placeholder="Введите PIN"><div class="modal-actions"><button type="button" class="btn ghost" data-close>Отмена</button><button class="btn">Войти</button></div></form>`);
}
document.addEventListener('change', async event => {
  if (event.target.id === 'class-select') { state.studentClass = event.target.value; save(); render(); toast(`Показано расписание ${state.studentClass}`); return; }
  if (event.target.id !== 'role') return;
  event.stopImmediatePropagation();
  const requested = event.target.value;
  event.target.value = state.role;
  if (requested === state.role) return;
  if (requested === 'teacher') return teacherPinDialog();
  await fetch('/api/teacher/logout', {method:'POST'}).catch(() => {});
  state.role = 'student'; save(); render(); toast('Режим ученика');
}, true);
document.addEventListener('submit', async event => {
  if (event.target.id !== 'teacher-login-form') return;
  event.preventDefault(); event.stopImmediatePropagation();
  const button = event.target.querySelector('button[type="submit"], button:last-child');
  button.disabled = true;
  try {
    const response = await fetch('/api/teacher/login', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({pin:new FormData(event.target).get('pin')})});
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Вход не выполнен');
    state.role = 'teacher'; save(); closeModal(); render(); toast('Режим учителя открыт');
  } catch (error) { toast(error.message); button.disabled = false; }
}, true);

render();

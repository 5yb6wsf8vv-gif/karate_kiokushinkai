const COURSE_KEY='player-course';
const validCourse=value=>/^[1-4]$/.test(String(value??''));
const courseSelect=selected=>`<label>Курс обучения<select name="course" required><option value="">Выберите курс</option>${[1,2,3,4].map(n=>`<option value="${n}" ${String(selected)===String(n)?'selected':''}>${n} курс</option>`).join('')}</select></label>`;
export function createAccount(render,storage){
 let course='',message='';
 try{const saved=storage.getItem(COURSE_KEY);if(validCourse(saved))course=saved;}catch{}
 function view(){
  return `<h1>${course?'Мой аккаунт':'Вход по номеру курса'}</h1><p class="intro">${course?`Вы вошли: ${course} курс.`:'Выберите свой курс обучения, чтобы продолжить.'}</p><section class="card"><form id="account-course">${courseSelect(course)}<button class="primary">${course?'Сохранить курс':'Войти'}</button></form>${course?'<button class="text" data-action="account-logout">Выйти</button>':''}</section><p class="feedback" role="status">${message}</p><p class="muted">Курс, прогресс и покупки сохраняются в этом браузере. Выбор курса не создаёт отдельный онлайн-аккаунт. При смене курса или выходе учебный прогресс остаётся на устройстве.</p>`;
 }
 return {view,open(){},name:()=>course?`Игрок · ${course} курс`:'',handle(action){
  if(action!=='account-logout')return false;
  try{storage.removeItem(COURSE_KEY);course='';message='Вы вышли. Учебный прогресс сохранён.';}catch{message='Не удалось сохранить выход. Проверьте хранилище браузера.';}
  render();return true;
 },submit(form){
  if(form.id!=='account-course')return false;
  const next=String(new FormData(form).get('course')??'');
  if(!validCourse(next)){message='Выберите курс от 1 до 4.';render();return true;}
  try{storage.setItem(COURSE_KEY,next);course=next;message='Курс сохранён. Можно продолжать обучение.';}catch{message='Не удалось сохранить курс. Проверьте хранилище браузера.';}
  render();return true;
 }};
}

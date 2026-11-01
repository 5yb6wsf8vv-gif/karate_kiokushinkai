const COURSE_KEY='player-course', PROFILE_KEY='player-profile';
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cleanName=value=>String(value??'').trim().replace(/\s+/g,' ').slice(0,24);
const validCourse=value=>/^[1-4]$/.test(String(value??''));
const courseSelect=selected=>`<label>Курс обучения<select name="course" required><option value="">Выберите курс</option>${[1,2,3,4].map(n=>`<option value="${n}" ${String(selected)===String(n)?'selected':''}>${n} курс</option>`).join('')}</select></label>`;
export function createAccount(render,storage){
 let course='',name='',message='';
 try{const raw=storage.getItem(PROFILE_KEY);if(raw!==null){const saved=JSON.parse(raw);if(validCourse(saved?.course)){course=saved.course;name=cleanName(saved.name);}}else{const saved=storage.getItem(COURSE_KEY);if(validCourse(saved))course=saved;}}catch{}
 function view(){
  return `<h1>${course?'Мой аккаунт':'Вход по номеру курса'}</h1><p class="intro">${course?`Вы вошли: ${course} курс.`:'Укажите имя и выберите свой курс обучения, чтобы продолжить.'}</p><section class="card"><form id="account-course"><label>Имя<input name="name" maxlength="24" value="${esc(name)}" autocomplete="nickname" placeholder="Как вас зовут?"></label><p class="muted">До 24 символов · можно оставить пустым</p>${courseSelect(course)}<button class="primary">${course?'Сохранить профиль':'Войти'}</button></form>${course?'<button class="text" data-action="account-logout">Выйти</button>':''}</section><p class="feedback" role="status">${message}</p><p class="muted">Имя, курс, прогресс и покупки сохраняются в этом браузере. Выбор курса не создаёт отдельный онлайн-аккаунт. При смене курса или выходе учебный прогресс остаётся на устройстве.</p>`;
 }
 return {view,open(){},name:()=>course?(name||`Игрок · ${course} курс`):'',handle(action){
  if(action!=='account-logout')return false;
  try{storage.setItem(PROFILE_KEY,JSON.stringify({course:'',name:''}));course='';name='';message='Вы вышли. Учебный прогресс сохранён.';}catch{message='Не удалось сохранить выход. Проверьте хранилище браузера.';}
  render();return true;
 },submit(form){
  if(form.id!=='account-course')return false;
  const next=String(new FormData(form).get('course')??'');
  if(!validCourse(next)){message='Выберите курс от 1 до 4.';render();return true;}
  try{const nextName=cleanName(new FormData(form).get('name'));storage.setItem(PROFILE_KEY,JSON.stringify({course:next,name:nextName}));course=next;name=nextName;message='Профиль сохранён. Можно продолжать обучение.';}catch{message='Не удалось сохранить профиль. Проверьте хранилище браузера.';}
  render();return true;
 }};
}

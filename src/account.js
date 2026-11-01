const COURSE_KEY='player-course', PROFILE_KEY='player-profile';
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cleanName=value=>String(value??'').trim().replace(/\s+/g,' ').slice(0,24);
const validCourse=value=>/^[1-4]$/.test(String(value??''));
const courseSelect=selected=>`<label>Курс обучения<select name="course" required><option value="">Выберите курс</option>${[1,2,3,4].map(n=>`<option value="${n}" ${String(selected)===String(n)?'selected':''}>${n} курс</option>`).join('')}</select></label>`;
export function createAccount(render,storage){
 let course='',name='',message='';
 try{const raw=storage.getItem(PROFILE_KEY);if(raw!==null){const saved=JSON.parse(raw);if(validCourse(saved?.course)){course=saved.course;name=cleanName(saved.name);}}else{const saved=storage.getItem(COURSE_KEY);if(validCourse(saved))course=saved;}}catch{}
 const ready=()=>validCourse(course)&&Boolean(name);
 function view(){
  return `<h1>${ready()?'Мой аккаунт':'Настройка аккаунта'}</h1><p class="intro">${ready()?`Вы вошли: ${course} курс.`:'Укажите имя и выберите свой курс обучения, чтобы продолжить.'}</p><section class="card"><form id="account-course"><label>Имя<input name="name" maxlength="24" value="${esc(name)}" autocomplete="nickname" placeholder="Как вас зовут?" required></label><p class="muted">До 24 символов</p>${courseSelect(course)}<button class="primary">${ready()?'Сохранить профиль':'Начать обучение'}</button></form>${course?'<button class="text" data-action="account-logout">Выйти</button>':''}</section><p class="feedback" role="status">${message}</p><p class="muted">Имя, курс, прогресс и покупки сохраняются в этом браузере. Выбор курса не создаёт отдельный онлайн-аккаунт. При смене курса или выходе учебный прогресс остаётся на устройстве.</p>`;
 }
 return {view,ready,open(){},name:()=>course?(name||`Игрок · ${course} курс`):'',handle(action){
  if(action!=='account-logout')return false;
  try{storage.setItem(PROFILE_KEY,JSON.stringify({course:'',name:''}));course='';name='';message='Вы вышли. Учебный прогресс сохранён.';}catch{message='Не удалось сохранить выход. Проверьте хранилище браузера.';}
  render();return true;
 },submit(form){
  if(form.id!=='account-course')return false;
  const fields=new FormData(form),next=String(fields.get('course')??''),nextName=cleanName(fields.get('name'));
  if(!nextName){message='Введите имя, чтобы продолжить.';render();return true;}
  if(!validCourse(next)){message='Выберите курс от 1 до 4.';render();return true;}
  try{storage.setItem(PROFILE_KEY,JSON.stringify({course:next,name:nextName}));course=next;name=nextName;message='Профиль сохранён. Можно продолжать обучение.';}catch{message='Не удалось сохранить профиль. Проверьте хранилище браузера.';}
  render();return true;
 }};
}

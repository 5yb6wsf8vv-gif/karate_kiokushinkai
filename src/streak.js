import {changeXP,ensureEconomy} from './core.js';
const dayFormat=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit'});
export function visitDay(now=Date.now()){
 const parts=Object.fromEntries(dayFormat.formatToParts(new Date(now)).map(p=>[p.type,p.value]));
 return Math.floor(Date.UTC(Number(parts.year),Number(parts.month)-1,Number(parts.day))/86400000);
}
export function recordVisit(state,now=Date.now()){
 const today=visitDay(now),old=state.streak;
 if(old&&Number.isInteger(old.lastDay)&&old.lastDay>=today)return false;
 const count=Number.isInteger(old?.count)&&old.count>0?old.count:0;
 const gap=old&&Number.isInteger(old.lastDay)?today-old.lastDay:0;
 state.streak={lastDay:today,count:gap===1?count+1:1,...(gap===2&&count?{restore:{day:today,previousCount:count}}:{})};
 return true;
}
export function restoreStreak(state,now=Date.now()){
 recordVisit(state,now);
 const streak=state.streak,pending=streak?.restore;
 if(!pending||pending.day!==visitDay(now))return {ok:false,message:'Сейчас восстановление недоступно.'};
 if(ensureEconomy(state).xp<100)return {ok:false,message:'Для восстановления нужно 100 XP.'};
 changeXP(state,-100);streak.count=pending.previousCount+2;delete streak.restore;
 return {ok:true,message:'Фонарик снова горит. Серия восстановлена!'};
}
const lantern=`<svg class="lantern" viewBox="0 0 64 84" aria-hidden="true"><path d="M24 9V6C24 0 40 0 40 6V9M32 76V82" fill="none" stroke="#57535a" stroke-width="2.5"/><path class="lantern-paper" d="M20 14C5 19 5 63 20 69H44C59 63 59 19 44 14Z"/><ellipse class="lantern-light" cx="29" cy="41" rx="13" ry="25"/><g class="lantern-ribs" fill="none" stroke-width="1.2"><path d="M17 18Q32 21 47 18M13 24Q32 28 51 24M11 31Q32 35 53 31M10 38Q32 42 54 38M10 45Q32 49 54 45M12 52Q32 56 52 52M14 59Q32 63 50 59M18 65Q32 69 46 65"/></g><g fill="#202027" stroke="#b79d7c" stroke-width=".7"><rect x="17" y="8" width="30" height="7" rx="2"/><rect x="17" y="69" width="30" height="7" rx="2"/></g><text x="32" y="37" text-anchor="middle" class="lantern-kanji">空</text><text x="32" y="56" text-anchor="middle" class="lantern-kanji">手</text></svg>`;
export function createStreak(state,persist,onChange=()=>{}){
 let message='',dialog=null;
 function visit(now=Date.now()){
  const before=state.streak?structuredClone(state.streak):undefined;
  if(!recordVisit(state,now))return false;
  if(!persist()){if(before)state.streak=before;else delete state.streak;return false;}
  message='';return true;
 }
 function badge(){const s=state.streak;return `<button type="button" class="streak-badge ${s?.restore?'is-out':'is-lit'}" data-action="streak-open" aria-haspopup="dialog" aria-label="Фонарик: серия ${s?.count||1} дн.${s?.restore?', пропущен день':''}">${lantern}<b>${s?.restore?'Погас':(s?.count||1)+' дн.'}</b></button>`;}
 function view(){const s=state.streak||{count:1},pending=Boolean(s.restore);return `<section class="card streak-card ${pending?'is-out':'is-lit'}" aria-label="Фонарик регулярности">${lantern}<div><h2>${pending?'Фонарик погас':'Фонарик горит'}</h2><p>${pending?'Вы пропустили один день. Восстановите серию за 100 XP сегодня или продолжайте новую серию.':'Серия посещений: '+s.count+' дн. Заходите каждый день, чтобы фонарик продолжал светиться.'}</p>${pending?`<button class="primary" data-action="streak-restore" ${ensureEconomy(state).xp<100?'disabled':''}>Зажечь фонарик · 100 XP</button>${ensureEconomy(state).xp<100?'<p>Недостаточно XP.</p>':''}`:''}<p class="streak-rule">День считается по времени Москвы. После двух и более пропущенных дней начинается новая серия.</p>${message?`<p role="status">${message}</p>`:''}</div></section>`;}
 function refreshDialog(){if(dialog?.open)dialog.querySelector('[data-streak-content]').innerHTML=view();}
 function open(){
  if(dialog?.open)return;
  if(visit())onChange();
  dialog=document.createElement('dialog');dialog.className='streak-dialog';dialog.setAttribute('aria-label','Фонарик регулярности');
  dialog.innerHTML=`<button type="button" class="secondary streak-close" aria-label="Закрыть пояснение">✕</button><div data-streak-content>${view()}</div>`;
  dialog.addEventListener('click',event=>{
   if(event.target.closest('.streak-close')){dialog.close();return;}
   if(event.target.closest('[data-action="streak-restore"]')){handle('streak-restore');onChange();refreshDialog();dialog.querySelector('.streak-close').focus();}
  });
  const opened=dialog;
  opened.addEventListener('close',()=>{opened.remove();if(dialog===opened)dialog=null;document.querySelector('[data-streak-badge] button')?.focus();});document.body.append(opened);opened.showModal();
 }
 function handle(action){if(action==='streak-open'){open();return true;}if(action!=='streak-restore')return false;
  const before={streak:state.streak?structuredClone(state.streak):undefined,economy:{...ensureEconomy(state)}};
  const result=restoreStreak(state);message=result.message;
  if(!persist()){state.streak=before.streak;state.economy=before.economy;message='Не удалось сохранить восстановление. XP не списаны.';}
  return true;
 }
 return {visit,badge,view,handle,refreshDialog};
}

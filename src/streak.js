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
const lantern=`<svg class="lantern" viewBox="0 0 64 84" aria-hidden="true"><path d="M25 10V5h14v5M32 74v7" fill="none" stroke="currentColor" stroke-width="3"/><rect x="20" y="10" width="24" height="6" rx="2" fill="currentColor"/><path class="lantern-paper" d="M22 17Q7 41 22 67H42Q57 41 42 17Z"/><path d="M22 25H42M18 34H46M17 43H47M19 52H45M22 61H42M27 18Q20 42 27 66M37 18Q44 42 37 66" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".5"/><path class="lantern-flame" d="M32 31C35 38 40 40 37 47Q32 53 27 47C23 42 29 37 32 31Z"/><rect x="20" y="68" width="24" height="6" rx="2" fill="currentColor"/></svg>`;
export function createStreak(state,persist){
 let message='';
 function visit(now=Date.now()){
  const before=state.streak?structuredClone(state.streak):undefined;
  if(!recordVisit(state,now))return false;
  if(!persist()){if(before)state.streak=before;else delete state.streak;return false;}
  message='';return true;
 }
 function badge(){const s=state.streak;return `<a class="streak-badge ${s?.restore?'is-out':'is-lit'}" href="#account" data-action="page:account" aria-label="Фонарик: серия ${s?.count||1} дн.${s?.restore?', пропущен день':''}">${lantern}<b>${s?.restore?'Погас':(s?.count||1)+' дн.'}</b></a>`;}
 function view(){const s=state.streak||{count:1},pending=Boolean(s.restore);return `<section class="card streak-card ${pending?'is-out':'is-lit'}" aria-label="Фонарик регулярности">${lantern}<div><h2>${pending?'Фонарик погас':'Фонарик горит'}</h2><p>${pending?'Вы пропустили один день. Восстановите серию за 100 XP сегодня или продолжайте новую серию.':'Серия посещений: '+s.count+' дн. Заходите каждый день, чтобы фонарик продолжал светиться.'}</p>${pending?`<button class="primary" data-action="streak-restore" ${ensureEconomy(state).xp<100?'disabled':''}>Зажечь фонарик · 100 XP</button>${ensureEconomy(state).xp<100?'<p>Недостаточно XP.</p>':''}`:''}<p class="streak-rule">День считается по времени Москвы. После двух и более пропущенных дней начинается новая серия.</p>${message?`<p role="status">${message}</p>`:''}</div></section>`;}
 function handle(action){if(action!=='streak-restore')return false;
  const before={streak:state.streak?structuredClone(state.streak):undefined,economy:{...ensureEconomy(state)}};
  const result=restoreStreak(state);message=result.message;
  if(!persist()){state.streak=before.streak;state.economy=before.economy;message='Не удалось сохранить восстановление. XP не списаны.';}
  return true;
 }
 return {visit,badge,view,handle};
}

import {changeXP} from './core.js';
import {senpaiZhanna,setSensei,clearSensei} from './sensei.js';
import {illustrationForTechnique,techniqueIllustration,preloadIllustrations} from './technique-illustrations.js';
const relayMovements=[['age','Агэ-укэ'],['gedan','Гэдан-барай'],['hizageri','Хидза гаммэн-гэри'],['kingeri','Кин-гэри'],['maegeri','Маэ-гэри']];
export const relayTasks=Array.from({length:4},(_,stage)=>Array.from({length:10},(_,i)=>{
 const [technique,name]=relayMovements[(i+stage)%relayMovements.length];
 const mirror=i>=5;
 return {id:`${stage+1}-${i+1}`,name:name+(mirror?' · другая сторона':''),technique,leg:i%5>=2,mirror,steps:illustrationForTechnique(technique).map((step,j)=>({id:j,label:mirror?step.caption.replaceAll('лев','__SIDE__').replaceAll('прав','лев').replaceAll('__SIDE__','прав'):step.caption,pose:step.pose}))};
}));
export function relayPassed(results){return results.length===10&&results.filter(r=>r.correct).length>=7;}
export function validRelayOrder(task,order){return order.length===task.steps.length&&order.every((id,i)=>id===i);}
export function movementImage(task,step,timed=false){
 const html=techniqueIllustration([{pose:step.pose,mirror:task.mirror}]);
 return timed?html.replace(/<span class="pose-caption">[\s\S]*?<\/span>/g,'').replace(/<figcaption>[\s\S]*?<\/figcaption>/g,''):html;
}
export function createRelay(state,persist,render){
 state.course.relays??={};let stage=null,timer=null,loadEpoch=0;
 const attempt=()=>state.course.relays[stage];
 const stop=()=>{clearInterval(timer);timer=null;};
 function abort(a){if(!a||a.done)return;a.done=true;a.aborted=true;a.passed=false;a.closedAt=Date.now();persist();}
 // Незавершённая попытка с прошлого запуска больше не возобновляется.
 for(const a of Object.values(state.course.relays))abort(a);
 function leave(){loadEpoch++;abort(attempt());stop();stage=null;}
 if(typeof window!=='undefined')window.addEventListener('pagehide',leave);
 function finish(timeout=false){const a=attempt();if(!a||a.done||a.awaiting||a.loading||!a.deadline)return;const task=relayTasks[stage-1][a.results.length];const expired=timeout||Date.now()>=a.deadline;const correct=!expired&&validRelayOrder(task,a.order);a.results.push({id:task.id,order:[...a.order],correct,timeout:expired});a.awaiting=true;if(!correct)changeXP(state,-1);if(a.results.length===10){a.done=true;a.passed=relayPassed(a.results);stop();}setSensei(a.done?(a.passed?'finish':'wrong'):correct?'correct':expired?'timeout':'wrong');persist();}
 function tick(){const a=attempt();if(!a||a.awaiting||a.done||a.loading||!a.deadline)return;const left=Math.max(0,Math.ceil((a.deadline-Date.now())/1000));const el=document.querySelector('#relay-countdown');if(el)el.textContent=left;if(Date.now()>=a.deadline){finish(true);render();}}
 function loadCards(){
  const a=attempt(),epoch=++loadEpoch,task=relayTasks[stage-1][a.results.length];
  a.loading=true;a.loadError=false;a.deadline=null;persist();
  preloadIllustrations(task.steps.map(step=>step.pose)).then(()=>{
   if(epoch!==loadEpoch||attempt()!==a||a.done)return;
   a.loading=false;a.deadline=Date.now()+10000;persist();render();
  }).catch(()=>{
   if(epoch!==loadEpoch||attempt()!==a||a.done)return;
   a.loadError=true;persist();render();
  });
 }
 function next(){clearSensei();const a=attempt();a.order=[];a.awaiting=false;a.bank=shuffled(relayTasks[stage-1][a.results.length].steps.length);loadCards();}
 function shuffled(n){const ids=Array.from({length:n},(_,i)=>i);for(let i=n-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]];}if(ids.every((v,i)=>v===i))ids.push(ids.shift());return ids;}
 function view(){const a=attempt();const back='<button class="text" data-action="relay-back">← К маршруту</button>';
 if(!a)return `${back}<h1>Эстафета · этап ${stage}</h1>${senpaiZhanna('Десять коротких связок. Собирай карточки по порядку и проверяй ответ один раз.')}<section class="card"><h2>10 заданий · 10 секунд на каждое</h2><p>Нажимайте изображения в порядке выполнения движения. До отправки можно исправить порядок. После проверки или истечения времени задание закрывается навсегда, второй попытки нет. Выход из эстафеты, перезагрузка или закрытие страницы окончательно прерывают всю попытку.</p><p>Результат от 7 / 10 — эстафета пройдена. Ошибка или пропуск: −1 XP.</p><div class="notice">Схематические учебные связки кихон, не официальный кю-комплекс. Иллюстрации требуют проверки тренером и не предназначены для самостоятельного разучивания техники.</div><details><summary>Заучивание: последовательности эстафеты</summary>${relayTasks[stage-1].map(t=>`<h3>${t.name}</h3><div class="relay-study">${t.steps.map(s=>`<div>${movementImage(t,s)}<p>${s.label}</p></div>`).join('')}</div>`).join('')}</details><button class="primary" data-action="relay-start">Начать эстафету</button></section>`;
 if(a.done)return `${back}<h1>Эстафета ${a.aborted?'прервана':a.passed?'пройдена!':'завершена'}</h1>${senpaiZhanna(a.aborted?'Ты вышел из начатой эстафеты. Продолжить или завершить эту попытку уже нельзя.':a.passed?'Отличная работа на скорость!':'Посмотри разбор и закрепи движения с тренером.',a.passed?'laughter':'sadness')}<section class="card"><h2>${a.results.filter(r=>r.correct).length} / 10</h2><p>${a.aborted?'Попытка окончательно прервана после выхода. Продолжение и новый старт недоступны.':a.passed?'Проходной результат достигнут.':'Для прохождения нужно не менее 7 правильных заданий.'}</p><p>Все задания закрыты. Повторная попытка не предоставляется.</p></section>${a.results.map((r,i)=>`<details class="card"><summary>${r.correct?'✓':'×'} ${i+1}. ${relayTasks[stage-1][i].name}${r.timeout?' · время истекло':''}</summary><p>Правильный порядок:</p><ol>${relayTasks[stage-1][i].steps.map(s=>`<li>${s.label}</li>`).join('')}</ol></details>`).join('')}`;
 if(a.awaiting){const r=a.results.at(-1);return `${back}<h1>Задание ${a.results.length} / 10</h1>${senpaiZhanna()}<section class="card"><h2>${r.correct?'Верно!':r.timeout?'Время истекло':'Неверный порядок'}</h2><p>${r.correct?'Ответ засчитан.':'−1 XP. Это задание закрыто, повторной попытки нет.'}</p><button class="primary" data-action="relay-next">Следующее задание →</button></section>`;}
 if(a.loading)return `${back}<h1>Задание ${a.results.length+1} / 10</h1><section class="card" role="status"><h2>${a.loadError?'Карточки не загрузились':'Загружаем карточки…'}</h2><p>Таймер ещё не запущен. После загрузки у вас будет полных 10 секунд.</p>${a.loadError?'<button class="primary" data-action="relay-load">Повторить загрузку</button>':''}</section>`;
 const t=relayTasks[stage-1][a.results.length];return `${back}<div class="section-title"><span>ЭСТАФЕТА ${stage} · ${a.results.length+1} / 10</span><span class="countdown" id="relay-countdown" role="timer" aria-label="Секунд до конца задания">${Math.max(0,Math.ceil((a.deadline-Date.now())/1000))}</span></div>${senpaiZhanna('Собери фазы движения по порядку. У тебя десять секунд.','focus',true)}<h1>${t.name}</h1><p>Соберите движение из изображений: сначала исходная фаза, затем действие.</p><div class="relay-order" aria-label="Ваш порядок">${a.order.map((id,i)=>`<button class="secondary" data-action="relay-remove:${i}" aria-label="Убрать карточку ${i+1}"><b>${i+1}</b>${movementImage(t,t.steps[id],true)}</button>`).join('')}</div><div class="relay-bank">${a.bank.filter(id=>!a.order.includes(id)).map(id=>`<button class="secondary" data-action="relay-pick:${id}" aria-label="Карточка ${id+1}">${movementImage(t,t.steps[id],true)}</button>`).join('')}</div><button class="primary" data-action="relay-check" ${a.order.length!==t.steps.length?'disabled':''}>Проверить · одна попытка</button><p class="muted">Выход или перезагрузка прервут всю эстафету без возможности продолжения.</p>`;
 }
 return {active:()=>stage!==null,open(n){if(stage!==null&&stage!==n)leave();stop();clearSensei();stage=n;tick();timer=setInterval(tick,100);},leave,view,handle(action,value){if(!action.startsWith('relay-'))return false;if(action==='relay-back'){leave();return true;}if(stage===null)return true;const a=attempt();if(action==='relay-start'&&!a){state.course.relays[stage]={results:[],done:false,awaiting:true,order:[]};next();return true;}if(!a||a.done)return true;if(action==='relay-next'&&a.awaiting){next();return true;}if(a.loading){if(action==='relay-load'&&a.loadError)loadCards();return true;}if(a.awaiting)return true;if(Date.now()>=a.deadline){finish(true);return true;}const task=relayTasks[stage-1][a.results.length],id=Number(value);if(action==='relay-pick'&&Number.isInteger(id)&&task.steps[id]&&!a.order.includes(id)){a.order.push(id);persist();}if(action==='relay-remove'&&Number.isInteger(id)&&id>=0&&id<a.order.length){a.order.splice(id,1);persist();}if(action==='relay-check'&&a.order.length===task.steps.length)finish();return true;}};
}

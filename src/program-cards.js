import {program10Cards,program10Groups} from './program10.js';
import {schedule} from './core.js';
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createProgramCards(state,persist){
 let group='all',index=0,flipped=false;
 const cards=()=>program10Cards.filter(c=>group==='all'||(group==='due'?state.terms[c.id]?.due<=Date.now():c.group===group));
 function stop(){if('speechSynthesis' in window)window.speechSynthesis.cancel();}
 function status(message){const node=document.querySelector('#program-audio-status');if(node)node.textContent=message;}
 function speak(text){
  if(!('speechSynthesis'in window)||!('SpeechSynthesisUtterance'in window))return;
  stop();const utterance=new SpeechSynthesisUtterance(text);utterance.lang='ru-RU';utterance.rate=.85;
  const voice=window.speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith('ru'));
  if(voice)utterance.voice=voice;
  utterance.onerror=e=>{if(!['interrupted','canceled'].includes(e.error))status('Не удалось озвучить текст. Проверьте наличие русского голоса в настройках устройства.');};
  status('Озвучка: русский голос устройства.');window.speechSynthesis.speak(utterance);
 }
 function view(){
  const list=cards();if(index>=list.length)index=0;const card=list[index];
  const learned=program10Cards.filter(c=>state.terms[c.id]?.learned).length;
  const speech='speechSynthesis'in window&&'SpeechSynthesisUtterance'in window;
  return `<section class="program-cards" aria-label="Карточки программы 10 кю"><h2>Программа 10 кю</h2><p>Вся программа в карточках: прочитайте название, вспомните значение и откройте ответ. Требования своей организации уточняйте у тренера.</p><label>Тема программы 10 кю<select id="program-card-group">${[{id:'all',name:'Все темы'},{id:'due',name:'Пора повторить'},...program10Groups].map(g=>`<option value="${g.id}" ${g.id===group?'selected':''}>${g.name}</option>`).join('')}</select></label><p class="muted">Изучено ${learned} из ${program10Cards.length} карточек.</p>${card?`<article class="card program-flashcard"><span class="eyebrow">${escape(card.topic)} · ${index+1} / ${list.length}</span><h3>${escape(card.name)}</h3><button class="secondary" data-action="p10-speak:name" ${speech?'':'disabled'}>◖)) Название</button>${flipped?`<div class="translation">${escape(card.description)}</div><button class="secondary" data-action="p10-speak:description" ${speech?'':'disabled'}>◖)) Объяснение</button><div class="ratings"><button class="secondary" data-action="p10-rate:again">Не помню</button><button class="secondary" data-action="p10-rate:hard">С трудом</button><button class="primary" data-action="p10-rate:easy">Легко</button></div>`:`<button class="primary" data-action="p10-flip">Открыть значение</button>`}<p id="program-audio-status" class="muted" role="status">${speech?'Озвучка: русский голос устройства.':'Озвучка недоступна в этом браузере.'}</p>${card.video?`<button class="secondary" data-action="video-lesson:${card.video}">▷ Повторяй за тренером</button>`:''}<div class="card-footer"><button class="text" data-action="p10-prev">← Предыдущая карточка</button><button class="text" data-action="p10-next">Следующая карточка →</button></div></article>`:'<div class="notice">Пока нет карточек к повторению. Выберите любую тему для изучения.</div>'}</section>`;
 }
 return {view,leave:stop,select(value){if(!['all','due',...program10Groups.map(g=>g.id)].includes(value))return;stop();group=value;index=0;flipped=false;},handle(action,value){
  if(!action.startsWith('p10-'))return false;
  const list=cards(),card=list[index];if(!card)return true;
  if(action==='p10-speak'){if(value==='name')speak(card.name);if(value==='description'&&flipped)speak(card.description);return true;}
  stop();
  if(action==='p10-flip')flipped=true;
  if(action==='p10-next'||action==='p10-prev'){index=(index+(action==='p10-next'?1:list.length-1))%list.length;flipped=false;}
  if(action==='p10-rate'&&flipped&&['again','hard','easy'].includes(value)){state.terms[card.id]=schedule(state.terms[card.id],value);persist();if(group!=='due')index=(index+1)%list.length;flipped=false;}
  return true;
 }};
}

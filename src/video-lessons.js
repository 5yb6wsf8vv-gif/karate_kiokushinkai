import {techniques} from './data.js';
import {kihon10} from './program10.js';

// Fill with verified playable URLs when source videos are supplied.
// Keep the original host attribution alongside each URL.
export const lessonMedia = {};
const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lesson = id => id.startsWith('kihon-')
 ? (()=>{const row=kihon10[Number(id.slice(6))];return row&&{name:row[0],steps:[row[1],`Рабочая сторона: ${row[2].toLowerCase()}.`,'Вернитесь в исходное положение.']};})()
 : techniques.find(t=>t.id===id);
export function videoLessonButton(id){return `<button class="secondary video-lesson-open" data-action="video-lesson:${id}">▷ Повторяй за тренером</button>`;}
export function createVideoLessons(){
 let dialog, timer, objectURL;
 function stop(){clearInterval(timer);timer=null;dialog?.querySelector('video')?.pause();if(objectURL){URL.revokeObjectURL(objectURL);objectURL=null;}}
 function close(){stop();dialog?.remove();dialog=null;}
 function open(id){
  const item=lesson(id);if(!item)return;close();
  dialog=document.createElement('dialog');dialog.className='video-lesson-dialog';
  dialog.innerHTML=`<div class="video-lesson-shell"><div class="video-lesson-header"><div><p class="eyebrow">Повторяй за тренером</p><h2>${escape(item.name)}</h2></div><button type="button" class="secondary" data-video="close" aria-label="Закрыть видеоурок">✕</button></div><div class="follow-stage"><video controls playsinline preload="metadata" aria-label="Видео техники"></video><div class="follow-countdown" hidden role="status" aria-live="polite"></div><div class="follow-empty"><b>Видео ещё не подключено</b><p>Ожидаем ролик для этой техники. Можно открыть видеофайл с устройства на время этого урока.</p></div></div><p class="video-error" role="status"></p><div class="follow-controls"><button class="primary" data-video="start" disabled>Начать · 3, 2, 1</button><button class="secondary" data-video="mirror" aria-pressed="false">Зеркально</button><label>Скорость<select aria-label="Скорость видео"><option value="0.5">0,5×</option><option value="0.75">0,75×</option><option value="1" selected>1×</option></select></label><label class="check"><input type="checkbox" data-video="loop">Повторять видео</label></div><label class="video-file">Открыть свой видеофайл<input type="file" accept="video/*" aria-label="Видео с устройства"></label><p class="muted">Файл остаётся на устройстве и доступен до закрытия урока. Для видео по ссылке нужен интернет.</p><ol class="follow-cues">${item.steps.map(s=>`<li>${escape(s)}</li>`).join('')}</ol><p class="muted">Смотрите на тренера и повторяйте в удобном темпе. Приложение не оценивает движения камерой и не начисляет XP за просмотр.</p></div>`;
  document.body.append(dialog);dialog.showModal();
  const video=dialog.querySelector('video'),start=dialog.querySelector('[data-video="start"]'),error=dialog.querySelector('.video-error'),counter=dialog.querySelector('.follow-countdown');
  function source(url){clearInterval(timer);counter.hidden=true;video.pause();video.src=url;video.load();dialog.querySelector('.follow-empty').hidden=true;start.disabled=true;error.textContent='Загрузка видео…';}
  video.addEventListener('loadedmetadata',()=>{start.disabled=false;error.textContent='';});
  video.addEventListener('error',()=>{clearInterval(timer);counter.hidden=true;start.disabled=true;error.textContent='Не удалось открыть видео. Попробуйте другой файл или формат MP4/WebM.';});
  video.addEventListener('play',()=>{clearInterval(timer);counter.hidden=true;start.disabled=false;});
  dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  dialog.addEventListener('click',async e=>{
   const action=e.target.closest('[data-video]')?.dataset.video;
   if(action==='close'){close();return;}
   if(action==='mirror'){const pressed=e.target.getAttribute('aria-pressed')!=='true';e.target.setAttribute('aria-pressed',String(pressed));video.classList.toggle('mirrored',pressed);}
   if(action==='start'){
    clearInterval(timer);video.pause();start.disabled=true;let remaining=3;counter.textContent=remaining;counter.hidden=false;
    timer=setInterval(()=>{remaining--;if(remaining){counter.textContent=remaining;return;}clearInterval(timer);counter.hidden=true;start.disabled=false;video.play().catch(()=>{error.textContent='Нажмите воспроизведение на самом видео.';});},1000);
   }
  });
  dialog.addEventListener('change',e=>{
   if(e.target.type==='file'){const file=e.target.files[0];if(!file)return;stop();objectURL=URL.createObjectURL(file);source(objectURL);}
   if(e.target.tagName==='SELECT')video.playbackRate=Number(e.target.value);
   if(e.target.dataset.video==='loop')video.loop=e.target.checked;
  });
  const media=lessonMedia[id];if(media?.url){source(media.url);if(media.attribution){const credit=document.createElement('p');credit.className='muted';credit.textContent=media.attribution;dialog.querySelector('.video-lesson-shell').append(credit);}}
 }
 return {open,close};
}

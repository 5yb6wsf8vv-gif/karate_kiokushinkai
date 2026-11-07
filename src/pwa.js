import {registerSW} from 'virtual:pwa-register';
export function createPWA(isBusy=()=>false){
 let prompt=null,ready=false,needsUpdate=false,error=false,message='',installing=false,reloadPending=false;
 const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 const ios=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 let installed=standalone(),reloading=false;
 function installContent(){return `<h2>Приложение на вашем устройстве</h2><p>${installed?'Приложение установлено. Открывайте его с иконки на устройстве.':'Установите тренажёр: он будет открываться в отдельном окне.'}</p>${!installed&&prompt?`<button class="primary" data-action="pwa-install" ${installing?'disabled':''}>Установить приложение</button>`:''}${!installed?`<p class="muted">${ios?'В Safari нажмите «Поделиться» → «На экран Домой» → «Добавить».':'Chrome / Edge: меню браузера → «Установить приложение». На Mac в Safari: «Файл» → «Добавить в Dock». Если пункта установки нет, откройте сайт в Chrome или Edge.'}</p>`:''}<p class="muted">${ready?'Учебные материалы сохранены для работы без интернета.':error?'Офлайн-копию пока не удалось сохранить. Откройте приложение с интернетом и попробуйте позже.':'При первом открытии с интернетом дождитесь сохранения материалов. После этого уроки, термины, повторение и скины будут доступны офлайн.'} Онлайн-кумитэ нужен интернет и работающий сервер.</p>${message?`<p role="status">${message}</p>`:''}`;}
 function bannerContent(){return `${!navigator.onLine?'<p class="notice pwa-offline" role="status">Вы без интернета. Сохранённые уроки и повторение доступны; кумитэ — после подключения.</p>':''}${needsUpdate?`<section class="notice pwa-update" role="status"><b>Доступна новая версия приложения</b><p>Прогресс сохранится. ${isBusy()?'Завершите занятие или выйдите из кумитэ перед обновлением.':'Нажмите кнопку, чтобы перезапустить приложение.'}</p><button class="secondary" data-action="pwa-update" ${isBusy()?'disabled':''}>Обновить приложение</button></section>`:''}`;}
 function refresh(){document.querySelectorAll('[data-pwa-install]').forEach(el=>{el.innerHTML=installContent();});document.querySelectorAll('[data-pwa-status]').forEach(el=>{el.innerHTML=bannerContent();});}
 window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();prompt=event;refresh();});
 window.addEventListener('appinstalled',()=>{installed=true;prompt=null;refresh();});
 window.addEventListener('online',refresh);window.addEventListener('offline',refresh);
 matchMedia('(display-mode: standalone)').addEventListener('change',()=>{installed=standalone();refresh();});
 function reloadSafely(){if(isBusy()){reloadPending=true;needsUpdate=true;refresh();}else if(!reloading){reloading=true;location.reload();}}
 function start(){if(!import.meta.env.PROD||!('serviceWorker'in navigator))return;
  let previous=navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{const next=navigator.serviceWorker.controller;if(previous&&next!==previous)reloadSafely();previous=next;});
  registerSW({immediate:true,onOfflineReady(){ready=true;error=false;refresh();},onNeedRefresh(){needsUpdate=true;refresh();},onNeedReload:reloadSafely,onRegisteredSW(_,registration){if(registration){const check=()=>{if(navigator.onLine&&document.visibilityState==='visible')registration.update().catch(()=>{});};window.addEventListener('online',check);document.addEventListener('visibilitychange',check);}},onRegisterError(){error=true;refresh();}});
  // A reopened offline app already has its cached shell even if no new install event fires.
  navigator.serviceWorker.ready.then(registration=>{if(registration.active&&navigator.serviceWorker.controller){ready=true;refresh();}}).catch(()=>{});
 }
 return {start,view:()=>`<section class="card pwa-install" data-pwa-install>${installContent()}</section>`,banner:()=>`<div data-pwa-status>${bannerContent()}</div>`,handle(action){
  if(action==='pwa-install'){
   if(!prompt||installing)return true;const event=prompt;prompt=null;installing=true;message='';refresh();
   (async()=>{try{await event.prompt();const choice=await event.userChoice;message=choice.outcome==='accepted'?'Установка подтверждена. Следуйте подсказкам устройства.':'Установку можно выполнить позже через меню браузера.';}catch{message='Установите приложение через меню браузера.';}finally{installing=false;refresh();}})();return true;
  }
  if(action==='pwa-update'){
   if(!needsUpdate||isBusy())return true;
   if(reloadPending){reloadSafely();return true;}
   navigator.serviceWorker.getRegistration().then(registration=>{if(registration?.waiting)registration.waiting.postMessage({type:'SKIP_WAITING'});else reloadSafely();}).catch(()=>{message='Обновление не удалось. Откройте приложение с интернетом и попробуйте снова.';refresh();});return true;
  }
  return false;
 }};
}

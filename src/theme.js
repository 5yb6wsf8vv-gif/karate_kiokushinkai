const key='kihongo-theme';
export function createTheme(){
 let current=document.documentElement.dataset.theme==='dark'?'dark':'light';
 function button(){const next=current==='light'?'тёмную':'светлую';return `<button type="button" class="secondary theme-toggle" data-action="theme-toggle" aria-label="Включить ${next} тему">${current==='light'?'☾ Тёмная тема':'☀ Светлая тема'}</button>`;}
 function apply(value){
  current=value==='dark'?'dark':'light';document.documentElement.dataset.theme=current;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',current==='dark'?'#101720':'#f4f7fc');
  document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')?.setAttribute('content',current==='dark'?'black-translucent':'default');
  document.querySelectorAll('[data-theme-control]').forEach(el=>el.innerHTML=button());
 }
 apply(current);
 window.addEventListener('storage',event=>{if(event.key===key)apply(event.newValue);});
 return {view:()=>`<span data-theme-control>${button()}</span>`,handle(action){
  if(action!=='theme-toggle')return false;
  const focused=document.activeElement?.closest('[data-theme-control]');apply(current==='light'?'dark':'light');focused?.querySelector('button')?.focus({preventScroll:true});try{localStorage.setItem(key,current);}catch{}
  return true;
 }};
}

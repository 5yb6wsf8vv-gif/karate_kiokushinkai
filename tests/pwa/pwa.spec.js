import {navigate} from '../navigation.js';
import {test,expect} from '@playwright/test';
import http from 'node:http';
const base='/karate_kiokushinkai/';
async function cached(page){await page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));});}
async function profile(page){await page.getByLabel('Имя',{exact:true}).fill('Анна');await page.getByLabel('Курс обучения').selectOption('2');await page.getByRole('button',{name:'Начать обучение'}).click();}
test('production PWA installs under repository path and reopens offline with profile and progress',async({page,context})=>{
 await page.goto(base);const manifestLink=await page.locator('link[rel=manifest]').getAttribute('href');expect(manifestLink).toBe(base+'manifest.webmanifest');
 const manifest=await (await page.request.get(manifestLink)).json();expect(manifest.display).toBe('standalone');expect(new URL(manifest.start_url,new URL(manifestLink,page.url())).pathname).toBe(base);
 for(const icon of manifest.icons){const result=await page.evaluate(async(src)=>{const image=new Image();image.src=src;await image.decode();return {width:image.naturalWidth,height:image.naturalHeight};},base+icon.src);expect(`${result.width}x${result.height}`).toBe(icon.sizes);}
 await cached(page);expect(await page.evaluate(async()=>new URL((await navigator.serviceWorker.ready).scope).pathname)).toBe(base);
 await profile(page);await navigate(page,'Термины');await page.getByRole('button',{name:'Вспомнил(а) — открыть ответ'}).click();await page.getByRole('button',{name:'Легко',exact:true}).click();
 await context.setOffline(true);await page.reload();await expect(page.getByRole('heading',{name:'Японские термины'})).toBeVisible();await expect(page.getByText('Вы без интернета.',{exact:false})).toBeVisible();
 await page.evaluate(()=>{const NativeAudio=window.Audio;window.Audio=class extends NativeAudio{constructor(src){super(src);window.offlineJapanesePlayer=this;}};});
 await page.getByRole('button',{name:'◖)) Прослушать',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>window.offlineJapanesePlayer?.readyState)).toBeGreaterThanOrEqual(2);
 expect(await page.evaluate(()=>window.offlineJapanesePlayer.duration)).toBeGreaterThan(.2);
 await navigate(page,'История');await expect(page.getByRole('heading',{name:'История киокушинкай',exact:true})).toBeVisible();await expect(page.locator('.history-topic')).toHaveCount(8);await page.reload();await expect(page.getByRole('heading',{name:'История киокушинкай',exact:true})).toBeVisible();
 await navigate(page,'Прогресс');await expect(page.locator('.stats')).toContainText('1 / 79');await navigate(page,'Мой аккаунт');await expect(page.getByLabel('Имя',{exact:true})).toHaveValue('Анна');await expect(page.getByLabel('Курс обучения')).toHaveValue('2');
 await expect(page.getByText('Учебные материалы сохранены для работы без интернета.',{exact:false})).toBeVisible();
 await navigate(page,'Скины');const art=page.locator('.skin-art').first();const imageUrl=await art.evaluate(el=>getComputedStyle(el).backgroundImage.slice(5,-2));expect(await page.evaluate(async url=>(await fetch(url)).ok,imageUrl)).toBe(true);
 expect(await page.evaluate(()=>document.body.scrollWidth<=innerWidth)).toBe(true);
});
test('install prompt is optional; rejecting or accepting never loses profile form',async({page})=>{
 await page.goto(base);await cached(page);await page.getByLabel('Имя',{exact:true}).fill('Анна');
 await page.evaluate(()=>{const event=new Event('beforeinstallprompt',{cancelable:true});event.prompt=async()=>{};event.userChoice=Promise.resolve({outcome:'dismissed'});dispatchEvent(event);});
 await page.getByRole('button',{name:'Установить приложение',exact:true}).click();await expect(page.getByText('Установку можно выполнить позже через меню браузера.')).toBeVisible();await expect(page.getByLabel('Имя',{exact:true})).toHaveValue('Анна');
 await page.evaluate(()=>dispatchEvent(new Event('appinstalled')));await expect(page.getByText('Приложение установлено.',{exact:false})).toBeVisible();await expect(page.getByRole('button',{name:'Установить приложение',exact:true})).toHaveCount(0);
});
test('backend responses never enter offline cache',async({page,context})=>{
 const server=http.createServer((req,res)=>{res.writeHead(200,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});res.end(JSON.stringify({private:true}));});await new Promise(r=>server.listen(0,'127.0.0.1',r));const api='http://127.0.0.1:'+server.address().port+'/state';
 try{await page.goto(base);await cached(page);expect(await page.evaluate(async url=>(await (await fetch(url)).json()).private,api)).toBe(true);
  const urls=await page.evaluate(async()=>{const all=[];for(const key of await caches.keys()){const cache=await caches.open(key);all.push(...(await cache.keys()).map(req=>req.url));}return all;});expect(urls).not.toContain(api);expect(urls.every(url=>new URL(url).pathname.startsWith('/karate_kiokushinkai/'))).toBe(true);
  await context.setOffline(true);expect(await page.evaluate(async url=>{try{await fetch(url);return false;}catch{return true;}},api)).toBe(true);
 }finally{server.closeAllConnections();await new Promise(r=>server.close(r));}
});

test('dedicated application page supports installation and reopening offline',async({page,context})=>{
 await page.addInitScript(()=>localStorage.setItem('player-profile',JSON.stringify({name:'Анна',course:'2'})));
 await page.goto(base+'#install');await cached(page);
 await expect(page.getByRole('heading',{name:'Приложение KihonGo',exact:true})).toBeVisible();
 await expect(page.getByRole('link',{name:'Приложение',exact:true,includeHidden:true})).toHaveAttribute('aria-current','page');
 await page.evaluate(()=>{const event=new Event('beforeinstallprompt',{cancelable:true});event.prompt=async()=>{};event.userChoice=Promise.resolve({outcome:'accepted'});dispatchEvent(event);});
 await page.getByRole('button',{name:'Установить приложение',exact:true}).click();
 await expect(page.getByText('Установка подтверждена. Следуйте подсказкам устройства.',{exact:true})).toBeVisible();
 await context.setOffline(true);await page.reload();
 await expect(page.getByRole('heading',{name:'Приложение KihonGo',exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('download button opens native installation when browser prompt is available',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('player-profile',JSON.stringify({name:'Анна',course:'2'})));
 await page.goto(base);await cached(page);
 await expect(page.getByRole('button',{name:'Скачать приложение',exact:true})).toBeVisible();
 await page.evaluate(()=>{const event=new Event('beforeinstallprompt',{cancelable:true});event.prompt=async()=>{window.installPromptCalls=(window.installPromptCalls||0)+1;};event.userChoice=Promise.resolve({outcome:'accepted'});dispatchEvent(event);});
 await page.getByRole('button',{name:'Скачать приложение',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>window.installPromptCalls)).toBe(1);
 await page.evaluate(()=>dispatchEvent(new Event('appinstalled')));
 await expect(page.getByRole('button',{name:'Скачать приложение',exact:true})).toHaveCount(0);
});
test('download remains functional on iPhone without browser installation prompt',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('player-profile',JSON.stringify({name:'Анна',course:'2'}));
  Object.defineProperty(navigator,'userAgent',{get:()=> 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});
  addEventListener('beforeinstallprompt',event=>event.stopImmediatePropagation(),{capture:true});
 });
 await page.goto(base);await cached(page);
 const before=await page.evaluate(()=>localStorage.getItem('kyokushin-v1'));
 await page.getByRole('button',{name:'Скачать приложение',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'Установка приложения'});
 await expect(dialog).toBeVisible();await expect(dialog).toContainText('Safari');await expect(dialog).toContainText('На экран Домой');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await dialog.getByRole('button',{name:'Понятно',exact:true}).click();await expect(dialog).toHaveCount(0);
 expect(await page.evaluate(()=>localStorage.getItem('kyokushin-v1'))).toBe(before);
});

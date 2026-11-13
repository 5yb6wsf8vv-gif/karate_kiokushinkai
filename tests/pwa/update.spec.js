import {navigate} from '../navigation.js';
import {test,expect} from '@playwright/test';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
test('new version waits for consent and cannot interrupt a lesson; update preserves profile',async({page})=>{
 let revision=1;
 const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');const prefix='/karate_kiokushinkai/';if(!url.pathname.startsWith(prefix)){res.writeHead(404);res.end();return;}
  const relative=url.pathname.slice(prefix.length)||'index.html',path=resolve('dist',relative);if(!path.startsWith(resolve('dist')+'/'))throw Error();let content=await readFile(path);if(relative==='sw.js')content=Buffer.concat([content,Buffer.from('\n// revision '+revision)]);
  const mime={'.js':'application/javascript','.html':'text/html','.css':'text/css','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml'};
  res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream','Cache-Control':'no-store'});res.end(content);
 }catch{res.writeHead(404);res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 try{
  await page.goto('http://127.0.0.1:'+server.address().port+'/karate_kiokushinkai/');await page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(r=>navigator.serviceWorker.addEventListener('controllerchange',r,{once:true}));});
  await page.getByLabel('Имя',{exact:true}).fill('Анна');await page.getByLabel('Курс обучения').selectOption('2');await page.getByRole('button',{name:'Начать обучение'}).click();await page.getByRole('button',{name:/Урок 1:/}).click();
  revision=2;await page.evaluate(async()=>{await (await navigator.serviceWorker.ready).update();});await expect(page.getByRole('button',{name:'Обновить приложение',exact:true})).toBeDisabled();await expect(page.locator('.reading')).toBeVisible();
  await navigate(page,'Мой аккаунт');await expect(page.getByRole('button',{name:'Обновить приложение',exact:true})).toBeEnabled();
  await Promise.all([page.waitForEvent('load'),page.getByRole('button',{name:'Обновить приложение',exact:true}).click()]);await expect(page.getByLabel('Имя',{exact:true})).toHaveValue('Анна');await expect(page.getByLabel('Курс обучения')).toHaveValue('2');await expect(page.getByRole('button',{name:'Обновить приложение',exact:true})).toHaveCount(0);
 }finally{server.closeAllConnections();await new Promise(r=>server.close(r));}
});

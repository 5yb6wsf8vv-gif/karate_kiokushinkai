import {test,expect} from '@playwright/test';
test('production kumite uses published Cloudflare address and replaces stale Codespaces session',async({page})=>{
 const endpoint='https://kyokushin-duel.5yb6wsf8vv.workers.dev';
 await page.addInitScript(()=>{localStorage.setItem('player-profile',JSON.stringify({name:'Анна',course:'2'}));localStorage.setItem('duel-server','https://old.app.github.dev');sessionStorage.setItem('duel-session',JSON.stringify({endpoint:'https://old.app.github.dev',code:'DEAD00',token:'old-token'}));});
 const calls=[];await page.route(endpoint+'/**',async route=>{const req=route.request(),url=new URL(req.url());calls.push(url.pathname);if(url.pathname==='/health')return route.fulfill({json:{ok:true,service:'kyokushin-duel',version:3,pollIntervalMs:2500}});if(url.pathname==='/rooms'){expect(req.postDataJSON().name).toBe('Анна');expect(req.postDataJSON().format).toBe('recognition-v2');return route.fulfill({json:{code:'ABC123',token:'test-token'}});}if(url.pathname==='/state')return route.fulfill({json:{code:'ABC123',me:0,phase:'waiting',index:0,serverNow:Date.now(),players:[{name:'Анна',score:0,skinId:'default'}],results:[],winner:null,reason:null}});return route.fulfill({json:{ok:true}});});
 await page.goto('/karate_kiokushinkai/#duel');await expect(page.getByRole('heading',{name:'Начать кумитэ',exact:true})).toBeVisible();await expect(page.locator('#duel-server')).toHaveValue(endpoint);expect(await page.evaluate(()=>sessionStorage.getItem('duel-session'))).toBeNull();await page.getByRole('button',{name:'Создать комнату',exact:true}).click();await expect(page.getByRole('heading',{name:'Ждём второго игрока',exact:true})).toBeVisible();expect(calls).toContain('/health');expect(calls).toContain('/rooms');const session=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('duel-session')));expect(session.endpoint).toBe(endpoint);expect(session.pollInterval).toBe(2500);
});

test('old backend is not used for a recognition match',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('player-profile',JSON.stringify({name:'Анна',course:'2'})));
 let created=false;
 await page.route('https://kyokushin-duel.5yb6wsf8vv.workers.dev/**',async route=>{
  if(new URL(route.request().url()).pathname==='/health')return route.fulfill({json:{ok:true,service:'kyokushin-duel',version:1}});
  created=true;return route.fulfill({json:{error:'unexpected'}});
 });
 await page.goto('/karate_kiokushinkai/#duel');
 await page.getByRole('button',{name:'Создать комнату',exact:true}).click();
 await expect(page.getByText('Сервер кумитэ ещё обновляется. Попробуйте позже.',{exact:true})).toBeVisible();
 expect(created).toBe(false);
});

import {test,expect} from '@playwright/test';
import {DuelEngine} from '../../multiplayer/engine.js';
import {createDuelServer} from '../../multiplayer/server.js';
let server,serverURL;
test.beforeAll(async()=>{server=createDuelServer({engine:new DuelEngine({warmupMs:100,gapMs:100}),allowLocal:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));serverURL='http://127.0.0.1:'+server.address().port;});
test.afterAll(async()=>{server.closeAllConnections();await new Promise(r=>server.close(r));});
async function enter(page,name){await page.goto('/#duel');await page.getByLabel('HTTPS-адрес сервера поединков').fill(serverURL);await page.getByLabel('Ваше имя').fill(name);}
async function solve(page){await expect(page.locator('#duel-timer')).toContainText('сек');for(const box of ['0 0 100 100','100 0 100 100','0 100 100 100','100 100 100 100'])await page.locator('.duel-bank button').filter({has:page.locator(`svg[viewBox="${box}"]`)}).click();await page.getByRole('button',{name:'Отправить ответ',exact:true}).click();}
test('two browsers join one room and complete ten competitive rounds with one winner',async({browser},testInfo)=>{
 test.setTimeout(90000);const a=await browser.newContext({baseURL:'http://127.0.0.1:5173',viewport:testInfo.project.use.viewport,isMobile:testInfo.project.use.isMobile,hasTouch:testInfo.project.use.hasTouch}),b=await browser.newContext({baseURL:'http://127.0.0.1:5173',viewport:testInfo.project.use.viewport,isMobile:testInfo.project.use.isMobile,hasTouch:testInfo.project.use.hasTouch});try{const p=await a.newPage(),q=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));q.on('pageerror',e=>errors.push(e.message));
 await enter(p,'Алиса');await p.getByRole('button',{name:'Создать комнату',exact:true}).click();await expect(p.getByRole('heading',{name:'Ждём второго игрока'})).toBeVisible();
 const code=await p.locator('#duel-room-code').textContent();await enter(q,'Борис');await q.getByLabel('Код комнаты').fill(code);await q.getByRole('button',{name:'Войти по коду',exact:true}).click();
 for(let i=0;i<10;i++){const winner=i<7?p:q;await expect(winner.locator('.section-title')).toContainText('Задание '+(i+1)+' / 10');await solve(winner);}
 await expect(p.getByRole('heading',{name:'Вы победили!',exact:true})).toBeVisible();await expect(q.getByRole('heading',{name:'Победил соперник',exact:true})).toBeVisible();
 await expect(p.locator('.duel-score')).toContainText('Алиса (вы) 7');await expect(q.locator('.duel-score')).toContainText('Борис (вы) 3');expect(errors).toEqual([]);
 expect(await p.evaluate(()=>document.body.scrollWidth<=innerWidth)).toBe(true);
 }finally{await a.close();await b.close();}
});
test('invitation link joins on second device, wrong answer cannot repeat and leaving forfeits',async({browser},testInfo)=>{
 const a=await browser.newContext({baseURL:'http://127.0.0.1:5173',viewport:testInfo.project.use.viewport,isMobile:testInfo.project.use.isMobile,hasTouch:testInfo.project.use.hasTouch}),b=await browser.newContext({baseURL:'http://127.0.0.1:5173',viewport:testInfo.project.use.viewport,isMobile:testInfo.project.use.isMobile,hasTouch:testInfo.project.use.hasTouch});try{const p=await a.newPage(),q=await b.newPage();await enter(p,'Первый');await p.getByRole('button',{name:'Создать комнату',exact:true}).click();await expect(p.getByRole('heading',{name:'Ждём второго игрока'})).toBeVisible();const link=await p.getByLabel('Ссылка-приглашение').inputValue();await q.goto(link);await expect(q.getByLabel('HTTPS-адрес сервера поединков')).toHaveValue(serverURL);await q.getByRole('button',{name:'Войти по коду',exact:true}).click();await expect(p.locator('#duel-timer')).toContainText('сек');
 for(const box of ['100 100 100 100','0 100 100 100','100 0 100 100','0 0 100 100'])await p.locator('.duel-bank button').filter({has:p.locator(`svg[viewBox="${box}"]`)}).click();await p.getByRole('button',{name:'Отправить ответ',exact:true}).click();await expect(p.getByRole('button',{name:'Ответ принят. Ждём соперника'})).toBeDisabled();
 await q.getByRole('button',{name:'Выйти из поединка',exact:true}).click();await expect(p.getByRole('heading',{name:'Вы победили!',exact:true})).toBeVisible();
 }finally{await a.close();await b.close();}
});

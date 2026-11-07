import {exerciseName} from '../../src/kumite-tasks.js';
import {test,expect} from './fixtures.js';
import {DuelEngine} from '../../multiplayer/engine.js';
import {createDuelServer} from '../../multiplayer/server.js';
let server,serverURL;
test.beforeAll(async()=>{server=createDuelServer({engine:new DuelEngine({warmupMs:100,gapMs:100}),allowLocal:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));serverURL='http://127.0.0.1:'+server.address().port;});
test.afterAll(async()=>{server.closeAllConnections();await new Promise(r=>server.close(r));});
async function enter(page,name){await page.addInitScript(()=>{if(localStorage.getItem('player-profile')===null)localStorage.setItem('player-profile',JSON.stringify({name:'Игрок',course:'1'}));});await page.goto('/#duel');await page.getByLabel('HTTPS-адрес сервера кумитэ').fill(serverURL);await page.getByLabel('Ваше имя').fill(name);}
async function solve(page){await expect(page.locator('#duel-timer')).toContainText('сек');const index=Number((await page.locator('.section-title').innerText()).match(/Задание (\d+)/)[1])-1;for(let slot=0;slot<4;slot++)await page.getByRole('button',{name:'Выбрать: '+exerciseName(index,slot),exact:true}).click();await page.getByRole('button',{name:'Отправить ответ',exact:true}).click();}

test('two browsers join one room and complete ten competitive rounds with one winner',async({browser},testInfo)=>{
 test.setTimeout(90000);const a=await browser.newContext({baseURL:'http://127.0.0.1:5173',viewport:testInfo.project.use.viewport,isMobile:testInfo.project.use.isMobile,hasTouch:testInfo.project.use.hasTouch}),b=await browser.newContext({baseURL:'http://127.0.0.1:5173',viewport:testInfo.project.use.viewport,isMobile:testInfo.project.use.isMobile,hasTouch:testInfo.project.use.hasTouch});try{const p=await a.newPage(),q=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));q.on('pageerror',e=>errors.push(e.message));
 await enter(p,'Алиса');
 await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('kyokushin-v1'));s.economy.xp=100;localStorage.setItem('kyokushin-v1',JSON.stringify(s));});
 await p.getByRole('link',{name:'Скины',exact:true}).click();await p.reload();await p.getByRole('button',{name:'Купить за 50 XP',exact:true}).click();await p.getByRole('link',{name:'Кумитэ',exact:true}).click();
 await p.getByLabel('HTTPS-адрес сервера кумитэ').fill(serverURL);await p.getByLabel('Ваше имя').fill('Алиса');
 await p.getByRole('button',{name:'Создать комнату',exact:true}).click();await expect(p.getByRole('heading',{name:'Ждём второго игрока'})).toBeVisible();
 const code=await p.locator('#duel-room-code').textContent();await enter(q,'Борис');await q.getByLabel('Код комнаты').fill(code);await q.getByRole('button',{name:'Войти по коду',exact:true}).click();
 await expect(q.locator('.duel-score [data-skin="skin-1"]')).toBeVisible();
 await expect(p.locator('.duel-score [data-skin="default"]')).toBeVisible();
 await expect(p.locator('.kumite-exercise svg')).toHaveCount(4);await expect(p.locator('.duel-reference')).toHaveCount(0);
 for(let i=0;i<10;i++){const winner=i<7?p:q;await expect(winner.locator('.section-title')).toContainText('Задание '+(i+1)+' / 10');await solve(winner);}
 await expect(p.getByRole('heading',{name:'Вы победили!',exact:true})).toBeVisible();await expect(q.getByRole('heading',{name:'Победил соперник',exact:true})).toBeVisible();
 await expect(p.locator('.duel-score')).toContainText('Алиса (вы) 7');await expect(q.locator('.duel-score')).toContainText('Борис (вы) 3');expect(errors).toEqual([]);
 expect(await p.evaluate(()=>document.body.scrollWidth<=innerWidth)).toBe(true);
 }finally{await a.close();await b.close();}
});
test('invitation link joins on second device, wrong answer cannot repeat and leaving forfeits',async({browser},testInfo)=>{
 const a=await browser.newContext({baseURL:'http://127.0.0.1:5173',viewport:testInfo.project.use.viewport,isMobile:testInfo.project.use.isMobile,hasTouch:testInfo.project.use.hasTouch}),b=await browser.newContext({baseURL:'http://127.0.0.1:5173',viewport:testInfo.project.use.viewport,isMobile:testInfo.project.use.isMobile,hasTouch:testInfo.project.use.hasTouch});try{const p=await a.newPage(),q=await b.newPage();await enter(p,'Первый');await p.getByRole('button',{name:'Создать комнату',exact:true}).click();await expect(p.getByRole('heading',{name:'Ждём второго игрока'})).toBeVisible();const link=await p.getByLabel('Ссылка-приглашение').inputValue();await q.goto(link);await expect(q.getByRole('heading',{name:'Настройка аккаунта'})).toBeVisible();await q.getByLabel('Имя',{exact:true}).fill('Второй');await q.getByLabel('Курс обучения').selectOption('2');await q.getByRole('button',{name:'Начать обучение'}).click();await expect(q.getByLabel('HTTPS-адрес сервера кумитэ')).toHaveValue(serverURL);await q.getByRole('button',{name:'Войти по коду',exact:true}).click();await expect(p.locator('#duel-timer')).toContainText('сек');
 for(const slot of [3,2,1,0])await p.getByRole('button',{name:'Выбрать: '+exerciseName(0,slot),exact:true}).click();await p.getByRole('button',{name:'Отправить ответ',exact:true}).click();await expect(p.getByRole('button',{name:'Ответ принят. Ждём соперника'})).toBeDisabled();
 await q.getByRole('button',{name:'Выйти из кумитэ',exact:true}).click();await expect(p.getByRole('heading',{name:'Вы победили!',exact:true})).toBeVisible();
 }finally{await a.close();await b.close();}
});
test('player can close stale room after server restart and select a new avatar',async({page})=>{
 await page.goto('/#duel');await page.evaluate(endpoint=>sessionStorage.setItem('duel-session',JSON.stringify({endpoint,code:'DEAD00',token:'missing-token'})),serverURL);await page.reload();
 await expect(page.getByText(/Комната не найдена/)).toBeVisible();await page.getByRole('button',{name:'Выйти',exact:true}).click();
 await expect(page.getByLabel('HTTPS-адрес сервера кумитэ')).toBeVisible();expect(await page.evaluate(()=>sessionStorage.getItem('duel-session'))).toBeNull();
});

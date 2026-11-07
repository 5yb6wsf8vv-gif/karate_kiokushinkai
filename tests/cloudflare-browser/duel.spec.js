import {exerciseName} from '../../src/kumite-tasks.js';
import {test,expect} from '@playwright/test';
async function signup(page,name){await expect(page.getByRole('heading',{name:'Настройка аккаунта'})).toBeVisible();await page.getByLabel('Имя',{exact:true}).fill(name);await page.getByLabel('Курс обучения').selectOption('2');await page.getByRole('button',{name:'Начать обучение'}).click();}
async function solve(page,wrong=false){await expect(page.locator('#duel-timer')).toContainText('сек',{timeout:15000});const index=Number((await page.locator('.section-title').innerText()).match(/Задание (\d+)/)[1])-1;for(const slot of wrong?[3,2,1,0]:[0,1,2,3])await page.getByRole('button',{name:'Выбрать: '+exerciseName(index,slot),exact:true}).click();await page.getByRole('button',{name:'Отправить ответ',exact:true}).click();}

test('real Cloudflare runtime: two fresh players, invitation, one attempt, ten rounds and 7:3',async({browser},info)=>{
 const options={baseURL:'http://127.0.0.1:5173',viewport:info.project.use.viewport,isMobile:info.project.use.isMobile,hasTouch:info.project.use.hasTouch};const a=await browser.newContext(options),b=await browser.newContext(options);
 try{const p=await a.newPage(),q=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));q.on('pageerror',e=>errors.push(e.message));
  await p.goto('/#duel');await signup(p,'Анна');await p.getByLabel('HTTPS-адрес сервера кумитэ').fill('http://127.0.0.1:8787');await p.getByRole('button',{name:'Создать комнату',exact:true}).click();await expect(p.getByRole('heading',{name:'Ждём второго игрока'})).toBeVisible();
  const link=await p.getByLabel('Ссылка-приглашение').inputValue();await q.goto(link);await signup(q,'Борис');await q.getByRole('button',{name:'Войти по коду',exact:true}).click();await expect(p.locator('.duel-score')).toContainText('Борис',{timeout:10000});
  expect(await p.evaluate(()=>JSON.parse(sessionStorage.getItem('duel-session')).pollInterval)).toBe(2500);
  for(let index=0;index<10;index++){const winner=index<7?p:q;await expect(winner.locator('.section-title')).toContainText('Задание '+(index+1)+' / 10',{timeout:15000});if(index===0){await solve(q,true);await expect(q.getByRole('button',{name:'Ответ принят. Ждём соперника'})).toBeDisabled();}await solve(winner);}
  await expect(p.getByRole('heading',{name:'Вы победили!',exact:true})).toBeVisible({timeout:10000});await expect(q.getByRole('heading',{name:'Победил соперник',exact:true})).toBeVisible({timeout:10000});await expect(p.locator('.duel-score')).toContainText('Анна (вы) 7');await expect(q.locator('.duel-score')).toContainText('Борис (вы) 3');expect(errors).toEqual([]);expect(await p.evaluate(()=>document.body.scrollWidth<=innerWidth)).toBe(true);
 }finally{await a.close();await b.close();}
});

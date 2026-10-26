import {test,expect} from '@playwright/test';
import {lessons,examQuestions} from '../../src/curriculum.js';
async function ready(page){await page.goto('/');await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('kyokushin-v1'))||{version:1,terms:{},techniques:{},sessions:[],program:{organization:'Учебная программа',notes:'',enabled:[]}};s.course={lessons:Object.fromEntries(Array.from({length:32},(_,i)=>[i+1,{passed:true,reviewed:true}])),attempts:[],belt:null};localStorage.setItem('kyokushin-v1',JSON.stringify(s));});await page.reload();}
test('complete and repeat all 32 lessons to unlock exam',async({page})=>{
 await page.goto('/');await expect(page.getByRole('button',{name:'Пока закрыто'})).toBeDisabled();
 await expect(page.getByRole('button',{name:/Урок 2:/})).toBeDisabled();
 for(const l of lessons){
  if(l.id===1)await page.getByRole('button',{name:/Урок 1:/}).click();
  await expect(page.getByRole('heading',{name:l.title,exact:true})).toBeVisible();
  await page.getByRole('button',{name:l.answer,exact:true}).click();
  await page.getByRole('button',{name:'Повторить и закрепить'}).click();
  await page.getByRole('button',{name:l.answer,exact:true}).click();
  await page.getByRole('button',{name:l.id<32?'Следующий урок →':'К итоговому тесту'}).click();
 }
 await expect(page.getByRole('button',{name:'Начать кю-тест'})).toBeEnabled();await page.reload();
 await expect(page.getByRole('button',{name:'Начать кю-тест'})).toBeEnabled();
 await expect(page.getByText('32/32 повторено',{exact:true})).toBeVisible();
});
test('5-second deadline, failed block and retry with persisted belt',async({page})=>{
 await page.clock.install({time:new Date('2026-10-25T10:00:00Z')});await ready(page);
 await page.getByRole('button',{name:'Начать кю-тест'}).click();
 await expect(page.locator('#countdown')).toHaveText('5');
 await page.clock.fastForward(5000);await expect(page.locator('.section-title')).toContainText('2 / 9');
 await page.clock.fastForward(5000);
 for(let i=2;i<9;i++)await page.getByRole('button',{name:examQuestions[i].answer,exact:true}).click();
 await expect(page.getByRole('heading',{name:'Продолжим тренироваться'})).toBeVisible();
 await expect(page.getByText('Время истекло',{exact:true})).toHaveCount(2);
 await expect(page.getByRole('heading',{name:'Твой оранжевый пояс',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'Попробовать снова'}).click();
 for(const q of examQuestions)await page.getByRole('button',{name:q.answer,exact:true}).click();
 await expect(page.getByRole('heading',{name:'Твой оранжевый пояс',exact:true})).toBeVisible();
 await expect(page.getByText('Игровая награда · не присвоение 10 кю')).toBeVisible();
 await page.reload();await expect(page.getByText(/Виртуальный оранжевый пояс уже получен/)).toBeVisible();
});
test('sensei on every section, mobile layout and interrupted exam',async({page})=>{
 await ready(page);await page.getByRole('button',{name:'Начать кю-тест'}).click();
 for(const name of ['Термины','Техника','Повторение','Прогресс','Программа','Мой путь']){
  await page.getByRole('link',{name,exact:true}).click();
  await expect(page.getByRole('img',{name:/Сенсей Дмитрий:/})).toBeVisible();
  expect(await page.evaluate(()=>document.body.scrollWidth<=innerWidth)).toBe(true);
 }
 await page.getByRole('button',{name:'Начать кю-тест'}).click();
 await expect(page.locator('.section-title')).toContainText('1 / 9');
});

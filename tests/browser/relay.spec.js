import {test,expect} from '@playwright/test';
import {relayTasks} from '../../src/relay.js';
async function setup(page){await page.clock.install({time:new Date('2026-10-27T10:00:00Z')});await page.goto('/');await expect(page.locator('.relay-gate')).toHaveCount(4);await expect(page.locator('.relay-gate').first().getByRole('button')).toBeDisabled();await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('kyokushin-v1'));s.course.lessons=Object.fromEntries(Array.from({length:32},(_,i)=>[i+1,{passed:true}]));localStorage.setItem('kyokushin-v1',JSON.stringify(s));});await page.reload();}
async function open(page,stage){await page.locator('.relay-gate').nth(stage-1).getByRole('button').click();}
async function solve(page,stage,index){for(const step of relayTasks[stage-1][index].steps)await page.getByRole('button',{name:step.label,exact:true}).click();await page.getByRole('button',{name:'Проверить · одна попытка'}).click();}
test('relay passes at seven with ten-second deadlines and no retries after reload',async({page})=>{
 await setup(page);await open(page,1);await page.getByRole('button',{name:'Начать эстафету',exact:true}).click();
 await expect(page.locator('#relay-countdown')).toHaveText('10');
 for(let i=0;i<10;i++){
  if(i<7)await solve(page,1,i);else await page.clock.fastForward(10000);
  if(i===7){await expect(page.getByRole('heading',{name:'Время истекло',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Проверить · одна попытка'})).toHaveCount(0);}
  if(i<9)await page.getByRole('button',{name:'Следующее задание →'}).click();
 }
 await expect(page.getByRole('heading',{name:'Эстафета пройдена!',exact:true})).toBeVisible();await expect(page.getByRole('heading',{name:'7 / 10',exact:true})).toBeVisible();
 await page.reload();await open(page,1);await expect(page.getByRole('button',{name:'Начать эстафету',exact:true})).toHaveCount(0);
 const a=await page.evaluate(()=>JSON.parse(localStorage.getItem('kyokushin-v1')).course.relays[1]);expect(a.passed).toBe(true);expect(a.results).toHaveLength(10);
});
test('six correct fails; wrong submission closes task',async({page})=>{
 await setup(page);await open(page,2);await page.getByRole('button',{name:'Начать эстафету',exact:true}).click();
 await page.clock.fastForward(6000);await expect(page.locator('#relay-countdown')).toHaveText('4');
 for(const step of [...relayTasks[1][0].steps].reverse())await page.getByRole('button',{name:step.label,exact:true}).click();
 await page.getByRole('button',{name:'Проверить · одна попытка'}).click();await expect(page.getByRole('heading',{name:'Неверный порядок',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Проверить · одна попытка'})).toHaveCount(0);
 for(let i=1;i<10;i++){await page.getByRole('button',{name:'Следующее задание →'}).click();if(i<=6)await solve(page,2,i);else await page.clock.fastForward(10000);}
 await expect(page.getByRole('heading',{name:'Эстафета завершена',exact:true})).toBeVisible();await expect(page.getByRole('heading',{name:'6 / 10',exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.body.scrollWidth<=innerWidth)).toBe(true);
});

test('exit and reload permanently abort relay, even after seven correct answers',async({page})=>{
 await setup(page);await open(page,1);await page.getByRole('button',{name:'Начать эстафету',exact:true}).click();
 for(let i=0;i<7;i++){await solve(page,1,i);await page.getByRole('button',{name:'Следующее задание →'}).click();}
 await page.getByRole('button',{name:'← К маршруту'}).click();await open(page,1);
 await expect(page.getByRole('heading',{name:'Эстафета прервана',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Начать эстафету',exact:true})).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Следующее задание →'})).toHaveCount(0);
 await page.getByRole('button',{name:'← К маршруту'}).click();await open(page,2);await page.getByRole('button',{name:'Начать эстафету',exact:true}).click();
 await page.reload();await open(page,2);await expect(page.getByRole('heading',{name:'Эстафета прервана',exact:true})).toBeVisible();
 const relays=await page.evaluate(()=>JSON.parse(localStorage.getItem('kyokushin-v1')).course.relays);
 expect(relays[1].passed).toBe(false);expect(relays[1].aborted).toBe(true);expect(relays[2].aborted).toBe(true);
});
test('Zhanna has full-body transparent emotions in relay, Dmitry stays elsewhere',async({page})=>{
 await setup(page);await open(page,1);
 await expect(page.getByRole('img',{name:'Сенпай Жанна: Уверенность'})).toBeVisible();
 const portrait=page.locator('.sensei-portrait');await expect(portrait).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
 await expect(portrait).toHaveCSS('border-top-width','0px');await expect(portrait).toHaveCSS('box-shadow','none');
 for(const mood of ['Радость','Строгость','Удивление','Грусть','Уверенность','Смех']){await page.getByText('Эмоции сенсея',{exact:true}).click();await page.getByRole('button',{name:mood,exact:true}).click();await expect(page.getByRole('img',{name:'Сенпай Жанна: '+mood,exact:true})).toBeVisible();}
 await page.getByRole('button',{name:'Начать эстафету',exact:true}).click();
 await expect(page.getByRole('img',{name:'Сенпай Жанна: Строгость'})).toBeVisible();
 await solve(page,1,0);await expect(page.locator('[data-mascot="zhanna"]')).toBeVisible();await expect(page.locator('[data-mascot="dmitry"]')).toHaveCount(0);
 await page.getByRole('link',{name:'Термины',exact:true}).click();await expect(page.getByRole('img',{name:/Сенсей Дмитрий:/})).toBeVisible();
 await page.getByRole('link',{name:'Мой путь',exact:true}).click();await open(page,1);await expect(page.getByRole('heading',{name:'Эстафета прервана',exact:true})).toBeVisible();
});

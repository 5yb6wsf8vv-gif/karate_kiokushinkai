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
  if(i===7){await expect(page.getByRole('heading',{name:'Время истекло',exact:true})).toBeVisible();await page.reload();await open(page,1);await expect(page.getByRole('button',{name:'Проверить · одна попытка'})).toHaveCount(0);}
  if(i<9)await page.getByRole('button',{name:'Следующее задание →'}).click();
 }
 await expect(page.getByRole('heading',{name:'Эстафета пройдена!',exact:true})).toBeVisible();await expect(page.getByRole('heading',{name:'7 / 10',exact:true})).toBeVisible();
 await page.reload();await open(page,1);await expect(page.getByRole('button',{name:'Начать эстафету',exact:true})).toHaveCount(0);
 const a=await page.evaluate(()=>JSON.parse(localStorage.getItem('kyokushin-v1')).course.relays[1]);expect(a.passed).toBe(true);expect(a.results).toHaveLength(10);
});
test('six correct fails; one wrong submission closes task; leaving never resets deadline',async({page})=>{
 await setup(page);await open(page,2);await page.getByRole('button',{name:'Начать эстафету',exact:true}).click();
 await page.clock.fastForward(6000);await page.getByRole('button',{name:'← К маршруту'}).click();await open(page,2);await expect(page.locator('#relay-countdown')).toHaveText('4');
 for(const step of [...relayTasks[1][0].steps].reverse())await page.getByRole('button',{name:step.label,exact:true}).click();
 await page.getByRole('button',{name:'Проверить · одна попытка'}).click();await expect(page.getByRole('heading',{name:'Неверный порядок',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Проверить · одна попытка'})).toHaveCount(0);
 for(let i=1;i<10;i++){await page.getByRole('button',{name:'Следующее задание →'}).click();if(i<=6)await solve(page,2,i);else await page.clock.fastForward(10000);}
 await expect(page.getByRole('heading',{name:'Эстафета завершена',exact:true})).toBeVisible();await expect(page.getByRole('heading',{name:'6 / 10',exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.body.scrollWidth<=innerWidth)).toBe(true);
});

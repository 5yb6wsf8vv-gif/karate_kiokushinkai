import {test,expect} from '@playwright/test';
import {terms} from '../../src/data.js';
const stored=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('kyokushin-v1')));
test('lesson penalty once, no replay reward, one checkmark, memory separate',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Продолжить обучение →'}).click();
 await expect(page.locator('.reading')).toBeVisible();await expect(page.getByRole('button',{name:'Поклон',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'К заданиям →'}).click();await expect(page.locator('.reading')).toHaveCount(0);
 await page.getByRole('button',{name:'Удар',exact:true}).click();expect((await stored(page)).economy.xp).toBe(-1);
 await page.getByRole('button',{name:'Удар',exact:true}).dispatchEvent('click');expect((await stored(page)).economy.xp).toBe(-1);
 await page.getByRole('button',{name:'Попробовать ещё раз',exact:true}).click();await page.getByRole('button',{name:'Поклон',exact:true}).click();
 expect((await stored(page)).economy.xp).toBe(19);
 await expect(page.getByRole('button',{name:'Повторить и закрепить'})).toHaveCount(0);
 await page.getByRole('button',{name:'К маршруту',exact:true}).click();
 await expect(page.getByRole('button',{name:/Урок 1:/}).locator('span')).toHaveText('✓');
 await page.getByRole('button',{name:/Урок 1:/}).click();await expect(page.getByRole('button',{name:'К заданиям →'})).toHaveCount(0);
 await page.reload();expect((await stored(page)).economy.xp).toBe(19);
 await page.getByRole('link',{name:'Заучивание',exact:true}).click();await expect(page.getByRole('heading',{name:'Заучивание',exact:true})).toBeVisible();
});
test('ten correct review answers give 5 XP, mistakes cost 1, saved across reload',async({page})=>{
 await page.goto('/#review');await page.getByRole('button',{name:'Начать повторение',exact:true}).click();
 let question=await page.locator('.repetition h2').textContent();let t=terms.find(t=>question.startsWith(t.jp));
 const wrong=terms.find(other=>other.translation!==t.translation&&other.translation===terms[(terms.indexOf(t)+1)%terms.length].translation);
 await page.getByRole('button',{name:wrong.translation,exact:true}).click();expect((await stored(page)).economy.xp).toBe(-1);
 await page.getByRole('button',{name:'Следующее задание →'}).click();
 for(let i=1;i<=10;i++){
  question=await page.locator('.repetition h2').textContent();t=terms.find(t=>question.startsWith(t.jp));
  const answer=page.getByRole('button',{name:t.translation,exact:true});await answer.click();
  await answer.dispatchEvent('click');
  const e=(await stored(page)).economy;expect(e.reviewCorrect).toBe(i);expect(e.xp).toBe(i<10?-1:4);
  if(i<10)await page.getByRole('button',{name:'Следующее задание →'}).click();
 }
 await expect(page.locator('.repetition .feedback')).toContainText('+5 XP');await page.reload();
 const e=(await stored(page)).economy;expect(e.xp).toBe(4);expect(e.reviewCorrect).toBe(10);
});

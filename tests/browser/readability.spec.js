import {test,expect} from './fixtures.js';
test('larger text, no program settings and old topic filters do not hide techniques',async({page})=>{
 await page.goto('/');
 await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('kyokushin-v1'));s.program.enabled=['gedan'];localStorage.setItem('kyokushin-v1',JSON.stringify(s));});
 await page.goto('/#settings');await page.reload();
 await expect(page.getByRole('link',{name:'Программа',exact:true})).toHaveCount(0);
 await expect(page.locator('#program')).toHaveCount(0);
 expect(await page.evaluate(()=>parseFloat(getComputedStyle(document.body).fontSize))).toBeGreaterThanOrEqual(18);
 for(const route of ['tech','terms','review','account','install']){
  await page.goto('/#'+route);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 await page.goto('/#tech');
 await expect(page.locator('.grid>article')).toHaveCount(9);
 await expect(page.getByText('Черновик · требуется проверка тренером',{exact:true})).toHaveCount(0);
 await expect(page.getByText('Схематичная иллюстрация положения',{exact:true})).toHaveCount(0);
});

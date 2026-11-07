import {test,expect} from './fixtures.js';
test('10 kyu guide preserves practice progress and works on mobile',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/#tech');
 await expect(page.getByRole('heading',{name:'Программа 10 кю',exact:true})).toBeVisible();
 await page.getByText('Кихон · 10 движений',{exact:true}).click();
 await expect(page.locator('.kyu-movements>li')).toHaveCount(10);
 await expect(page.locator('.kyu-movements>li').nth(6)).toContainText('Левая');
 await page.getByText('Иппон-кумитэ · две связки',{exact:true}).click();
 await expect(page.locator('.kyu-pairs article')).toHaveCount(2);
 await page.getByText('Ката · Тайкёку соно ити',{exact:true}).click();
 await expect(page.getByText(/Первая базовая форма/)).toBeVisible();
 await page.getByRole('button',{name:'Блоки',exact:true}).click();
 await expect(page.locator('.video')).toHaveCount(2);
 await page.getByRole('button',{name:'Отметить «Повторено»'}).first().click();
 await page.reload();
 await expect(page.getByRole('button',{name:'✓ Повторено · отметить ещё раз'})).toHaveCount(1);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

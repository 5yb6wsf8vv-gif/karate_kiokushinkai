import {test,expect} from './fixtures.js';
test('theme switching preserves form drafts, updates browser color and persists after reload',async({page})=>{
 await page.goto('/#account');
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 const before=await page.evaluate(()=>localStorage.getItem('player-profile'));
 await page.getByLabel('Имя',{exact:true}).fill('Черновик имени');
 await page.getByRole('button',{name:'Включить тёмную тему',exact:true}).click();
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content','#101720');
 await expect(page.getByLabel('Имя',{exact:true})).toHaveValue('Черновик имени');
 expect(await page.evaluate(()=>localStorage.getItem('player-profile'))).toBe(before);
 expect(await page.evaluate(()=>getComputedStyle(document.body).backgroundColor)).toBe('rgb(16, 23, 32)');
 await page.reload();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.getByRole('link',{name:'Техника',exact:true}).click();
 await page.getByRole('button',{name:'Включить светлую тему',exact:true}).click();
 await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content','#eaf1fc');
 expect(await page.evaluate(()=>getComputedStyle(document.body).backgroundColor)).toBe('rgb(234, 241, 252)');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.reload();await expect(page.locator('html')).toHaveAttribute('data-theme','light');
});
test('theme switches during a timed exam without resetting its deadline',async({page})=>{
 await page.clock.install({time:new Date('2026-11-13T12:00:00Z')});await page.goto('/');
 await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('kyokushin-v1'));s.course.lessons=Object.fromEntries(Array.from({length:32},(_,i)=>[i+1,{passed:true}]));s.course.relays=Object.fromEntries([1,2,3,4].map(n=>[n,{startedAt:1,done:true,results:[]}]));localStorage.setItem('kyokushin-v1',JSON.stringify(s));});await page.reload();
 await page.getByRole('button',{name:'Начать кю-тест',exact:true}).click();
 await page.clock.fastForward(2000);await expect(page.locator('#countdown')).toHaveText('3');
 await page.getByRole('button',{name:'Включить тёмную тему',exact:true}).click();await expect(page.locator('#countdown')).toHaveText('3');
 await page.clock.fastForward(3000);await expect(page.locator('.section-title')).toContainText('2 / 9');
});

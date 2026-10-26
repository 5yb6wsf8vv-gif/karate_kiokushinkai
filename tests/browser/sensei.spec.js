import {test,expect} from '@playwright/test';

test('Dmitry portrait, six emotions, changing advice and lesson feedback',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');
 const avatar=page.locator('.sensei-portrait');
 await expect(page.getByRole('img',{name:'Сенсей Дмитрий: Уверенность'})).toBeVisible();
 await expect(avatar).toHaveCSS('background-size','300% 200%');
 const background=await avatar.evaluate(el=>getComputedStyle(el).backgroundImage);
 const assetURL=background.slice(5,-2);
 expect((await page.request.get(assetURL)).status()).toBe(200);
 const initial=await page.locator('.sensei-reply').textContent();
 await page.getByRole('button',{name:'Ещё совет ↻'}).click();
 await expect(page.locator('.sensei-reply')).not.toHaveText(initial);
 for(const mood of ['Радость','Строгость','Удивление','Грусть','Уверенность','Смех']){
  await page.getByText('Эмоции сенсея',{exact:true}).click();
  await page.getByRole('button',{name:mood,exact:true}).click();
  await expect(page.getByRole('img',{name:'Сенсей Дмитрий: '+mood,exact:true})).toBeVisible();
 }
 await page.getByRole('button',{name:'Продолжить обучение →'}).click();
 await page.getByRole('button',{name:'Удар',exact:true}).click();
 await expect(page.locator('.sensei')).toHaveAttribute('data-emotion','sadness');
 const wrong=await page.locator('.sensei-reply').textContent();
 await page.getByRole('button',{name:'Поклон',exact:true}).click();
 await expect(page.locator('.sensei-reply')).not.toHaveText(wrong);
 await expect(page.locator('.feedback')).toContainText('Верно!');
 await page.reload();await expect(page.getByText('1/32 пройдено',{exact:true})).toBeVisible();
 expect(errors).toEqual([]);
 expect(await page.evaluate(()=>document.body.scrollWidth<=innerWidth)).toBe(true);
});

test('sensei controls never reset the exam clock',async({page})=>{
 await page.clock.install({time:new Date('2026-10-26T10:00:00Z')});
 await page.goto('/');
 await page.evaluate(()=>{const s={version:1,terms:{},techniques:{},sessions:[],program:{organization:'Демо',notes:'',enabled:[]},course:{lessons:Object.fromEntries(Array.from({length:32},(_,i)=>[i+1,{passed:true,reviewed:true}])),attempts:[],belt:null}};localStorage.setItem('kyokushin-v1',JSON.stringify(s));});await page.reload();
 await page.getByRole('button',{name:'Начать кю-тест'}).click();
 await page.clock.fastForward(3000);
 await page.getByRole('button',{name:'Ещё совет ↻'}).click();
 await expect(page.locator('#countdown')).toHaveText('2');
 await page.clock.fastForward(2000);
 await expect(page.locator('.section-title')).toContainText('2 / 9');
 await expect(page.locator('.sensei')).toHaveAttribute('data-emotion','surprise');
});

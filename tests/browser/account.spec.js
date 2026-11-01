import {test,expect} from '@playwright/test';
test('setup blocks deep links and all features until name and course are saved',async({page})=>{
 const api=[];page.on('request',r=>{if(r.url().includes('/auth/')||r.url().endsWith('/health'))api.push(r.url());});
 await page.goto('/#duel');await expect(page.getByRole('heading',{name:'Настройка аккаунта'})).toBeVisible();await expect(page.locator('nav')).toHaveCount(0);await expect(page.locator('#duel-server')).toHaveCount(0);
 await page.evaluate(()=>{location.hash='shop';});await expect(page.locator('.skin-card')).toHaveCount(0);
 await page.getByLabel('Имя',{exact:true}).fill('   ');await page.getByLabel('Курс обучения').selectOption('2');await page.getByRole('button',{name:'Начать обучение'}).click();await expect(page.getByRole('heading',{name:'Настройка аккаунта'})).toBeVisible();
 await page.getByLabel('Имя',{exact:true}).fill('  Анна  ');await page.getByLabel('Курс обучения').selectOption('2');await page.getByRole('button',{name:'Начать обучение'}).click();await expect(page.locator('.skin-card')).toHaveCount(3);
 await page.getByRole('link',{name:'Поединок',exact:true}).click();await expect(page.getByLabel('Ваше имя')).toHaveValue('Анна');await page.reload();await expect(page.getByLabel('Ваше имя')).toHaveValue('Анна');expect(api).toEqual([]);
 expect(await page.evaluate(()=>document.body.scrollWidth<=innerWidth)).toBe(true);
});
test('setup from account opens learning; profile edit, exit and browser navigation preserve progress',async({page})=>{
 await page.goto('/#account');const progress=await page.evaluate(()=>localStorage.getItem('kyokushin-v1'));
 await page.context().setOffline(true);await page.getByLabel('Имя',{exact:true}).fill('Анна');await page.getByLabel('Курс обучения').selectOption('2');await page.getByRole('button',{name:'Начать обучение'}).click();await expect(page.getByRole('heading',{name:/Твой путь/})).toBeVisible();await page.context().setOffline(false);
 await page.getByRole('link',{name:'Мой аккаунт',exact:true}).click();await page.getByLabel('Курс обучения').selectOption('4');await page.getByRole('button',{name:'Сохранить профиль'}).click();await page.reload();await expect(page.getByLabel('Курс обучения')).toHaveValue('4');await expect(page.getByLabel('Имя',{exact:true})).toHaveValue('Анна');
 await page.getByRole('button',{name:'Выйти',exact:true}).click();await expect(page.locator('nav')).toHaveCount(0);await page.evaluate(()=>{location.hash='home';});await expect(page.getByRole('heading',{name:'Настройка аккаунта'})).toBeVisible();await page.reload();await expect(page.getByLabel('Курс обучения')).toHaveValue('');expect(await page.evaluate(()=>localStorage.getItem('kyokushin-v1'))).toBe(progress);
});
test('invalid course and unavailable storage cannot unlock application',async({page})=>{
 await page.addInitScript(()=>{localStorage.setItem('player-course','5');const set=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='player-profile')throw Error('Storage unavailable');return set.call(this,k,v);};});
 await page.goto('/');await expect(page.getByLabel('Курс обучения')).toHaveValue('');await page.getByLabel('Имя',{exact:true}).fill('Игрок');await page.getByLabel('Курс обучения').selectOption('1');await page.getByRole('button',{name:'Начать обучение'}).click();await expect(page.getByRole('status').filter({hasText:'Не удалось сохранить профиль'})).toBeVisible();await expect(page.locator('nav')).toHaveCount(0);
});
test('legacy course requires missing name, preserves course and safely renders name',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('player-course','3'));await page.goto('/');await expect(page.getByLabel('Курс обучения')).toHaveValue('3');await expect(page.locator('nav')).toHaveCount(0);
 await page.getByLabel('Имя',{exact:true}).fill('<b>Анна</b>');await page.getByRole('button',{name:'Начать обучение'}).click();await page.getByRole('link',{name:'Мой аккаунт',exact:true}).click();await expect(page.getByLabel('Имя',{exact:true})).toHaveValue('<b>Анна</b>');await expect(page.locator('#account-course b')).toHaveCount(0);
 await page.getByRole('button',{name:'Выйти',exact:true}).click();await page.reload();await expect(page.getByLabel('Курс обучения')).toHaveValue('');
});

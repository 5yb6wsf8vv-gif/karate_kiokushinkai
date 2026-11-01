import {test,expect} from '@playwright/test';
test('name and course entry works offline, persists and preserves progress on exit',async({page})=>{
 const requests=[];page.on('request',r=>{if(r.url().includes('/auth/'))requests.push(r.url());});
 await page.goto('/#account');
 await expect(page.getByRole('heading',{name:'Вход по номеру курса'})).toBeVisible();
 await expect(page.getByLabel('Курс обучения').locator('option')).toHaveCount(5);
 await page.getByRole('button',{name:'Войти',exact:true}).click();await expect(page.getByRole('heading',{name:'Вход по номеру курса'})).toBeVisible();
 const progress=await page.evaluate(()=>localStorage.getItem('kyokushin-v1'));
 await page.context().setOffline(true);
 await page.getByLabel('Имя',{exact:true}).fill('  Анна  ');await page.getByLabel('Курс обучения').selectOption('2');await page.getByRole('button',{name:'Войти',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Мой аккаунт'})).toBeVisible();await expect(page.getByText('Вы вошли: 2 курс.',{exact:true})).toBeVisible();
 await page.context().setOffline(false);await page.reload();await expect(page.getByLabel('Курс обучения')).toHaveValue('2');await expect(page.getByLabel('Имя',{exact:true})).toHaveValue('Анна');
 await page.getByLabel('Курс обучения').selectOption('4');await page.getByRole('button',{name:'Сохранить профиль'}).click();
 await page.getByRole('link',{name:'Поединок',exact:true}).click();await expect(page.getByLabel('Ваше имя')).toHaveValue('Анна');
 await page.getByRole('link',{name:'Мой аккаунт',exact:true}).click();await page.getByRole('button',{name:'Выйти',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Вход по номеру курса'})).toBeVisible();await page.reload();await expect(page.getByLabel('Курс обучения')).toHaveValue('');
 expect(await page.evaluate(()=>localStorage.getItem('kyokushin-v1'))).toBe(progress);expect(requests).toEqual([]);
 expect(await page.evaluate(()=>document.body.scrollWidth<=innerWidth)).toBe(true);
});
test('invalid saved course and unavailable storage cannot create a profile',async({page})=>{
 await page.addInitScript(()=>{localStorage.setItem('player-course','5');const set=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='player-profile')throw Error('Storage unavailable');return set.call(this,k,v);};});
 await page.goto('/#account');await expect(page.getByLabel('Курс обучения')).toHaveValue('');
 await page.getByLabel('Курс обучения').selectOption('1');await page.getByRole('button',{name:'Войти',exact:true}).click();await expect(page.getByRole('status').filter({hasText:'Не удалось сохранить профиль'})).toBeVisible();await expect(page.getByRole('heading',{name:'Вход по номеру курса'})).toBeVisible();
});

test('legacy course is retained; optional name is escaped and used in duel',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('player-course','3'));await page.goto('/#account');await expect(page.getByLabel('Курс обучения')).toHaveValue('3');
 await page.getByRole('link',{name:'Поединок',exact:true}).click();await expect(page.getByLabel('Ваше имя')).toHaveValue('Игрок · 3 курс');
 await page.getByRole('link',{name:'Мой аккаунт',exact:true}).click();await page.getByLabel('Имя',{exact:true}).fill('<b>Анна</b>');await page.getByRole('button',{name:'Сохранить профиль'}).click();await page.reload();await expect(page.getByLabel('Имя',{exact:true})).toHaveValue('<b>Анна</b>');await expect(page.locator('#account-course b')).toHaveCount(0);
 await page.getByRole('button',{name:'Выйти',exact:true}).click();await page.reload();await expect(page.getByLabel('Курс обучения')).toHaveValue('');
});

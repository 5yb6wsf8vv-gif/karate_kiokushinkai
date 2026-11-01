import {test,expect} from '@playwright/test';
test('email registration requires course 1–4, persists login and edits online profile',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('duel-server','https://accounts.example'));
 let profile={id:'1',email:'student@example.com',name:'Анна',course:'2',provider:'email'};
 await page.route('https://accounts.example/auth/**',async route=>{const req=route.request(),path=new URL(req.url()).pathname;let body={};if(path.endsWith('/config'))body={email:true,vk:false};else if(path.endsWith('/start'))body={ok:true,message:'Код отправлен'};else if(path.endsWith('/verify')){const data=req.postDataJSON();expect(data.course).toBe('2');body={token:'session-test',user:profile};}else if(path.endsWith('/profile')){profile={...profile,...req.postDataJSON()};body={user:profile};}else if(path.endsWith('/me'))body={user:profile};else body={ok:true};await route.fulfill({json:body});});
 await page.goto('/#account');await page.getByLabel('Электронная почта').fill('student@example.com');await page.getByRole('button',{name:'Получить код',exact:true}).click();
 await expect(page.getByLabel('Курс обучения').locator('option')).toHaveCount(5);
 await page.getByLabel('Имя',{exact:true}).fill('Анна');await page.getByLabel('Курс обучения').selectOption('2');await page.getByLabel('Код из письма').fill('123456');await page.getByRole('button',{name:'Подтвердить и войти',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Мой аккаунт'})).toBeVisible();await page.reload();await expect(page.getByLabel('Курс обучения')).toHaveValue('2');
 await page.getByLabel('Курс обучения').selectOption('4');await page.getByRole('button',{name:'Сохранить профиль'}).click();await expect(page.getByRole('status').filter({hasText:'Профиль сохранён'})).toBeVisible();
 await page.getByRole('button',{name:'Выйти из аккаунта'}).click();await expect(page.getByRole('heading',{name:'Вход и регистрация'})).toBeVisible();
 expect(await page.evaluate(()=>document.body.scrollWidth<=innerWidth)).toBe(true);
});
test('VK callback verifies browser state, removes authorization code and requests course',async({page})=>{
 await page.addInitScript(()=>{localStorage.setItem('duel-server','https://accounts.example');sessionStorage.setItem('vk-login',JSON.stringify({state:'valid-state',endpoint:'https://accounts.example'}));});
 await page.route('https://accounts.example/auth/**',async route=>{const path=new URL(route.request().url()).pathname;if(path.endsWith('/config'))return route.fulfill({json:{email:false,vk:true}});expect(path).toBe('/auth/vk/finish');expect(route.request().postDataJSON()).toEqual({state:'valid-state',code:'once',device_id:'device'});await route.fulfill({json:{token:'vk-session',user:{id:'2',name:'Дмитрий',course:'',provider:'vk',email:null}}});});
 await page.goto('/?state=valid-state&code=once&device_id=device');await expect(page.getByRole('heading',{name:'Мой аккаунт'})).toBeVisible();await expect(page.getByLabel('Курс обучения')).toHaveValue('');expect(page.url()).not.toContain('code=');await expect(page.getByRole('status').filter({hasText:'завершить регистрацию'})).toBeVisible();
});
test('VK callback with a different state never exchanges authorization code',async({page})=>{
 await page.addInitScript(()=>{localStorage.setItem('duel-server','https://accounts.example');sessionStorage.setItem('vk-login',JSON.stringify({state:'expected',endpoint:'https://accounts.example'}));});
 await page.route('https://accounts.example/auth/**',async route=>{expect(new URL(route.request().url()).pathname).toBe('/auth/config');await route.fulfill({json:{email:false,vk:true}});});
 await page.goto('/?state=unexpected&code=once&device_id=device');await expect(page.getByRole('status').filter({hasText:'Начните вход заново'})).toBeVisible();expect(page.url()).not.toContain('code=');
});

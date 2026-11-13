import {navigate} from '../navigation.js';
import {test,expect} from './fixtures.js';
test('navigation, learning and persistence without program settings',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await expect(page.getByRole('heading',{name:/Твой путь/})).toBeVisible();
 await navigate(page,'Термины');
 await page.getByRole('button',{name:'Вспомнил(а) — открыть ответ'}).click();
 await page.getByRole('button',{name:'Легко',exact:true}).click();
 await page.reload();await navigate(page,'Прогресс');
 await expect(page.locator('.stats')).toContainText('1 / 79');
 await navigate(page,'Техника');
 await page.getByRole('button',{name:'Блоки',exact:true}).click();
 await expect(page.locator('.video')).toHaveCount(2);
 await page.getByRole('button',{name:'Отметить «Повторено»'}).first().click();
 await navigate(page,'Повторение');
 await expect(page.getByRole('heading',{name:'План техники · 7'})).toBeVisible();
 await expect(page.getByRole('link',{name:'Программа',exact:true})).toHaveCount(0);
 await navigate(page,'Техника');await page.getByRole('button',{name:'Все',exact:true}).click();
 await expect(page.locator('.video')).toHaveCount(8);
 await expect(page.locator('body')).toHaveJSProperty('scrollWidth',await page.evaluate(()=>document.documentElement.clientWidth));
 expect(errors).toEqual([]);
});
test('lesson completion counted once and Japanese listening mode available',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Занятие на 10 минут →'}).click();
 for(let i=0;i<4;i++){await page.getByRole('button',{name:'Вспомнил(а) — открыть ответ'}).click();await page.getByRole('button',{name:'С трудом',exact:true}).click();}
 await expect(page.getByRole('heading',{name:'Одна техническая тема'})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Додзе кун',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'Завершить занятие'}).click();
 await expect(page.getByText(/Занятие ·/)).toHaveCount(1);await page.reload();
 await expect(page.getByText(/Занятие ·/)).toHaveCount(1);
 await navigate(page,'Термины');
 await expect(page.getByText(/Японская озвучка · синтез речи/)).toHaveCount(0);
 await page.getByRole('button',{name:'На слух',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Что вы услышали?'})).toBeVisible();
});
test('choice feedback, recall deadline and browser back navigation',async({page})=>{
 await page.clock.install({time:new Date('2026-10-16T12:00:00Z')});
 await page.goto('/#terms');
 await page.getByRole('button',{name:'Выбрать перевод',exact:true}).click();
 await page.getByRole('button',{name:'Поклон',exact:true}).click();
 await expect(page.getByText(/Правильный ответ:/)).toBeVisible();
 await page.getByRole('button',{name:'Не помню',exact:true}).click();
 await navigate(page,'Повторение');
 await expect(page.getByRole('heading',{name:'Термины · 0',exact:true})).toBeVisible();
 await page.clock.fastForward(600001);await page.reload();
 await expect(page.getByRole('heading',{name:'Термины · 1',exact:true})).toBeVisible();
 await navigate(page,'Техника');await page.goBack();
 await expect(page.getByRole('heading',{name:'Повторение',exact:true})).toBeVisible();
});

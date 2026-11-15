import {test,expect} from './fixtures.js';
import {visitDay} from '../../src/streak.js';
test('Japanese lantern restores a missed day once and survives reload',async({page})=>{
 await page.addInitScript(({day})=>{if(!localStorage.getItem('kyokushin-v1'))localStorage.setItem('kyokushin-v1',JSON.stringify({version:1,terms:{},techniques:{},sessions:[],program:{enabled:[]},economy:{xp:100,reviewCorrect:0},streak:{lastDay:day-2,count:5}}));},{day:visitDay()});
 await page.goto('/');const card=page.getByRole('region',{name:'Фонарик регулярности'});
 await expect(page.getByRole('heading',{name:'Фонарик погас',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Зажечь фонарик · 100 XP'}).click();
 await expect(page.getByRole('heading',{name:'Фонарик горит',exact:true})).toBeVisible();
 await expect(page.locator('[data-streak-badge]')).toContainText('7 дн.');
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('kyokushin-v1')).economy.xp)).toBe(0);
 await page.reload();await expect(page.locator('[data-streak-badge]')).toContainText('7 дн.');
 await expect(page.getByRole('button',{name:'Зажечь фонарик · 100 XP'})).toHaveCount(0);
 expect(await page.evaluate(()=>document.body.scrollWidth<=innerWidth)).toBe(true);
});

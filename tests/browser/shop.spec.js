import {navigate} from '../navigation.js';
import {test,expect} from './fixtures.js';
test('five animal skin slots, insufficient XP, buy, equip, reload and duel preview',async({page})=>{
 await page.goto('/#shop');await expect(page.locator('.skin-card')).toHaveCount(5);
 await expect(page.locator('[data-shop-skin="skin-1"]').getByRole('button',{name:'Купить за 170 XP',exact:true})).toBeDisabled();
 await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('kyokushin-v1'));s.economy.xp=400;localStorage.setItem('kyokushin-v1',JSON.stringify(s));});await page.reload();
 await page.locator('[data-shop-skin="skin-1"]').getByRole('button',{name:'Купить за 170 XP',exact:true}).click();await expect(page.locator('.shop-wallet')).toContainText('230 XP');
 await page.locator('[data-shop-skin="skin-2"]').getByRole('button',{name:'Купить за 170 XP',exact:true}).click();await expect(page.locator('.shop-wallet')).toContainText('60 XP');
 await page.locator('[data-shop-skin="skin-1"]').getByRole('button',{name:'Выбрать',exact:true}).click();await page.reload();
 await expect(page.locator('[data-shop-skin="skin-1"]').getByRole('button',{name:'Выбран',exact:true})).toBeDisabled();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('kyokushin-v1')));expect(saved.cosmetics.owned).toEqual(['skin-1','skin-2']);expect(saved.economy.xp).toBe(60);
 await navigate(page,'Кумитэ');await expect(page.locator('.duel-avatar-preview [data-skin="skin-1"]')).toBeVisible();
 expect(await page.evaluate(()=>document.body.scrollWidth<=innerWidth)).toBe(true);
});

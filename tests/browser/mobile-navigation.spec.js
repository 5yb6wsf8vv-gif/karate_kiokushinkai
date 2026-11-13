import {test,expect} from './fixtures.js';
test('phone sections open at the top and close after selection; desktop navigation remains visible',async({page})=>{
 await page.goto('/');const phone=page.viewportSize().width<=600;
 const toggle=page.getByRole('button',{name:'☰ Разделы',exact:true}),nav=page.getByRole('navigation',{name:'Основная навигация'});
 if(phone){
  await expect(toggle).toBeVisible();await expect(nav).toBeHidden();
  await toggle.click();await expect(toggle).toHaveAttribute('aria-expanded','true');await expect(nav).toBeVisible();
  expect(await nav.evaluate(el=>getComputedStyle(el).position)).toBe('static');
  await page.getByRole('link',{name:'Техника',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Техника',exact:true})).toBeVisible();await expect(nav).toBeHidden();
  await toggle.click();await toggle.press('Escape');await expect(nav).toBeHidden();
 }else{await expect(toggle).toBeHidden();await expect(nav).toBeVisible();}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

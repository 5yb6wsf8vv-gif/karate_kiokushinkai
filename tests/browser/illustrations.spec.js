import {test,expect} from './fixtures.js';
test('movement cards show complete pose sequences without revealing listening answers',async({page})=>{
 await page.goto('/#terms');
 await page.getByLabel('Тема карточек').selectOption('kihon');
 const poses=['moroteHigh','moroteMiddle','moroteLow','oiHigh','oiMiddle','oiLow','age','gedan','hiza','kin'];
 for(const pose of poses){
  await expect(page.locator('.term .pose-panel')).toHaveAttribute('data-pose',pose);
  const url=await page.locator('.term image').getAttribute('href');
  expect(await page.evaluate(async url=>{const img=new Image();img.src=url;await img.decode();return img.naturalWidth;},url)).toBeGreaterThan(1000);
  await page.getByRole('button',{name:'Следующий →',exact:true}).click();
 }
 await page.getByLabel('Тема карточек').selectOption('ippon');
 await expect(page.locator('.term .pose-panel')).toHaveCount(3);
 expect(await page.locator('.term .pose-panel').evaluateAll(nodes=>nodes.map(n=>n.dataset.pose))).toEqual(['highAttack','upperDefence','kin']);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('button',{name:'На слух',exact:true}).click();
 await expect(page.locator('.term .technique-illustration')).toHaveCount(0);
 await page.getByLabel('Тема карточек').selectOption('count');
 await page.getByRole('button',{name:'Карточки',exact:true}).click();
 await expect(page.locator('.term .technique-illustration')).toHaveCount(0);
});

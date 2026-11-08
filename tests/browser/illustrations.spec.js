import {test,expect} from './fixtures.js';
test('movement cards show complete pose sequences without revealing listening answers',async({page})=>{
 await page.goto('/#terms');
 await page.getByLabel('Тема карточек').selectOption('kihon');
 const poses=['moroteHigh','moroteMiddle','moroteLow','oiHigh','oiMiddle','oiLow','age','gedan','hiza','kin'];
 for(const pose of poses){
  if(['age','gedan','hiza','kin'].includes(pose)){
   await expect(page.locator('.term .pose-panel')).toHaveCount(4);
   await expect(page.locator('.term .pose-step')).toHaveText(['Шаг 1','Шаг 2','Шаг 3','Шаг 4']);
  }else await expect(page.locator('.term .pose-panel')).toHaveAttribute('data-pose',pose);
  const url=await page.locator('.term image').first().getAttribute('href');
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

test('both practice blocks have four ordered movement cards',async({page})=>{
 await page.goto('/#tech');
 await page.getByRole('button',{name:'Блоки',exact:true}).click();
 await expect(page.locator('.block-sequence')).toHaveCount(2);
 for(const sequence of await page.locator('.block-sequence').all()){
  await expect(sequence.locator('.pose-step')).toHaveText(['Шаг 1','Шаг 2','Шаг 3','Шаг 4']);
  await expect(sequence.locator('.pose-caption')).toHaveCount(4);
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('10 kyu kicks have four phases and age uke explicitly crosses arms',async({page})=>{
 await page.goto('/#tech');
 await page.getByRole('button',{name:'Удары ногами',exact:true}).click();
 await expect(page.locator('.block-sequence')).toHaveCount(3);
 await expect(page.getByRole('heading',{name:'Хидза гаммэн-гэри · левая',exact:true})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Кин-гэри · правая',exact:true})).toBeVisible();
 for(const sequence of await page.locator('.block-sequence').all())await expect(sequence.locator('.pose-step')).toHaveText(['Шаг 1','Шаг 2','Шаг 3','Шаг 4']);
 await page.getByRole('button',{name:'Блоки',exact:true}).click();
 await expect(page.locator('[data-pose="upperPrepare"] .pose-caption')).toContainText('Перекрестите предплечья');
 const src=await page.locator('[data-pose="upperPrepare"] image').getAttribute('href');
 expect(src).toContain('upper-cross');
});

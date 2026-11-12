import {test,expect} from './fixtures.js';
test('movement cards show complete pose sequences without revealing listening answers',async({page})=>{
 await page.goto('/#terms');
 await page.getByLabel('Тема карточек').selectOption('kihon');
 const poses=['moroteHigh','moroteMiddle','moroteLow','oiHigh','oiMiddle','oiLow','age','gedan','hiza','kin'];
 for(const pose of poses){
  if(['age','gedan','hiza','kin'].includes(pose)){
   await expect(page.locator('.term .pose-panel')).toHaveCount(4);
   await expect(page.locator('.term .step-progress')).toHaveText('Шаг 1 из 4');
   await expect(page.locator('.term .pose-panel:visible')).toHaveCount(1);
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
  await expect(sequence.locator('.step-progress')).toHaveText('Шаг 1 из 4');await expect(sequence.locator('.pose-panel:visible')).toHaveCount(1);
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
 for(const sequence of await page.locator('.block-sequence').all()){await expect(sequence.locator('.step-progress')).toHaveText('Шаг 1 из 4');await expect(sequence.locator('.pose-panel:visible')).toHaveCount(1);}
 await page.getByRole('button',{name:'Блоки',exact:true}).click();
 await expect(page.locator('[data-pose="upperPrepare"] .pose-caption')).toContainText('Перекрестите предплечья');
 const src=await page.locator('[data-pose="upperPrepare"] image').getAttribute('href');
 expect(src).toContain('upper-cross');
});

test('compact movement card advances by image or controls, reverses and loops with explanations',async({page})=>{
 await page.goto('/#tech');await page.getByRole('button',{name:'Блоки',exact:true}).click();
 const card=page.locator('.step-carousel').first();
 await expect(card.locator('.pose-panel:visible')).toHaveAttribute('data-pose','lowerStart');
 await expect(card.locator('[data-step-prev]')).toBeDisabled();
 await card.locator('.pose-panel:visible .step-card').click();
 await expect(card.locator('.step-progress')).toHaveText('Шаг 2 из 4');
 await expect(card.locator('.pose-panel:visible .pose-caption')).toContainText('правый кулак у левого плеча');
 await card.getByRole('button',{name:'Предыдущий шаг',exact:true}).click();
 await expect(card.locator('.step-progress')).toHaveText('Шаг 1 из 4');
 for(let i=0;i<3;i++)await card.locator('.step-controls [data-step-next]').click();
 await expect(card.locator('.step-progress')).toHaveText('Шаг 4 из 4');
 await card.getByRole('button',{name:'Сначала ↺',exact:true}).click();
 await expect(card.locator('.pose-panel:visible')).toHaveAttribute('data-pose','lowerStart');
 await page.getByRole('link',{name:'Термины',exact:true}).click();await page.getByLabel('Тема карточек').selectOption('kihon');
 for(let i=0;i<6;i++)await page.getByRole('button',{name:'Следующий →',exact:true}).click();
 const term=page.locator('.term .step-carousel');await term.locator('.pose-panel:visible .step-card').press('Enter');
 await expect(term.locator('.step-progress')).toHaveText('Шаг 2 из 4');
 await expect(term.locator('.pose-panel:visible .pose-caption')).toContainText('Перекрестите предплечья');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

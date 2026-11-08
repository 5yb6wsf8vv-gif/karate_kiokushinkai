import {test,expect} from './fixtures.js';
test('entire 10 kyu program moved to term cards with speech and preserved progress',async({page})=>{
 await page.addInitScript(()=>{
  const fake=new EventTarget();fake.getVoices=()=>[{lang:'ru-RU',name:'Test Russian'}];fake.cancel=()=>{};fake.speak=u=>{window.lastSpoken={text:u.text,lang:u.lang};};
  Object.defineProperty(window,'speechSynthesis',{value:fake,configurable:true});
  window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
 });
 await page.goto('/#tech');
 await expect(page.getByRole('heading',{name:'Программа 10 кю',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'Блоки',exact:true}).click();
 await page.getByRole('button',{name:'Отметить «Повторено»'}).first().click();
 await page.getByRole('link',{name:'Термины',exact:true}).click();
 const section=page.getByRole('region',{name:'Карточки программы 10 кю'});
 await expect(section.getByRole('heading',{name:'Программа 10 кю',exact:true})).toBeVisible();
 await expect(section).toContainText('Изучено 0 из 79');
 await section.getByLabel('Тема программы 10 кю').selectOption('count');
 const names=['Ичи','Ни','Сан','Ши','Го','Року','Сичи','Хачи','Кю','Дзю'];
 for(let i=0;i<10;i++){
  await expect(section.locator('h3')).toHaveText(names[i]);
  await section.getByRole('button',{name:'Открыть значение',exact:true}).click();
  await expect(section.locator('.translation')).toHaveText(String(i+1));
  await section.getByRole('button',{name:'Следующая карточка →',exact:true}).click();
 }
 await section.getByRole('button',{name:'◖)) Название',exact:true}).click();
 expect(await page.evaluate(()=>window.lastSpoken)).toEqual({text:'Ичи',lang:'ru-RU'});
 await section.getByRole('button',{name:'Открыть значение',exact:true}).click();
 await section.getByRole('button',{name:'◖)) Объяснение',exact:true}).click();
 expect(await page.evaluate(()=>window.lastSpoken)).toEqual({text:'1',lang:'ru-RU'});
 await section.getByRole('button',{name:'Легко',exact:true}).click();
 await expect(section).toContainText('Изучено 1 из 79');
 await page.reload();
 await expect(section).toContainText('Изучено 1 из 79');
 for(const topic of ['glossary','greetings','commands','vocabulary','stances','methods','kihon','ippon','kata']){
  await section.getByLabel('Тема программы 10 кю').selectOption(topic);
  await expect(section.locator('h3')).not.toBeEmpty();
  await section.getByRole('button',{name:'Открыть значение',exact:true}).click();
  await expect(section.locator('.translation')).not.toBeEmpty();
 }
 await expect(section.locator('h3')).toHaveText('Тайкиоку соно ичи');
 await page.getByRole('link',{name:'Техника',exact:true}).click();
 await expect(page.getByRole('button',{name:'✓ Повторено · отметить ещё раз'})).toHaveCount(1);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

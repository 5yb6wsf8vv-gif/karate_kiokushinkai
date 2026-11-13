import {navigate} from '../navigation.js';
import {test,expect} from './fixtures.js';
test('one Japanese deck merges duplicate progress and includes every 10 kyu topic',async({page})=>{
 await page.addInitScript(()=>{
  const now=Date.now();localStorage.setItem('kyokushin-v1',JSON.stringify({version:1,terms:{osu:{learned:true,reviews:1,interval:1,due:now+86400000},'p10-greetings-1':{learned:true,reviews:2,interval:3,due:now+3*86400000},'p10-count-1':{learned:true,reviews:1,interval:3,due:now+3*86400000}},techniques:{gedan:{last:now,due:now+86400000}},sessions:[],program:{organization:'Мой додзё',notes:'',enabled:[]}}));
  window.Audio=class{constructor(src){this.src=src;}play(){window.lastJapaneseAudio=this.src;return Promise.resolve();}pause(){}removeAttribute(){}load(){}};
 });
 await page.goto('/#terms');
 await expect(page.locator('.term')).toHaveCount(1);
 await expect(page.getByRole('heading',{name:'Базовые карточки',exact:true})).toHaveCount(0);
 await expect(page.getByRole('heading',{name:'Программа 10 кю',exact:true})).toHaveCount(0);
 await expect(page.getByText('Изучено 2 из 79 карточек.',{exact:true})).toBeVisible();
 const progress=await page.evaluate(()=>JSON.parse(localStorage.getItem('kyokushin-v1')).terms);
 expect(progress.osu.reviews).toBe(3);expect(progress['p10-greetings-1']).toBeUndefined();
 await page.getByLabel('Тема карточек').selectOption('count');
 const names=['Ичи','Ни','Сан','Ши','Го','Року','Сичи','Хачи','Кю','Дзю'];
 const kanji=['一','二','三','四','五','六','七','八','九','十'];
 for(let i=0;i<10;i++){
  await expect(page.locator('.term h2')).toHaveText(names[i]);await expect(page.locator('.term .japanese')).toHaveText(kanji[i]);
  await page.getByRole('button',{name:'Вспомнил(а) — открыть ответ'}).click();await expect(page.locator('.translation')).toHaveText(String(i+1));
  await page.getByRole('button',{name:'Следующий →',exact:true}).click();
 }
 await page.getByRole('button',{name:'◖)) Прослушать',exact:true}).click();
 expect(await page.evaluate(()=>window.lastJapaneseAudio)).toContain('/audio/ja/p10-count-1.mp3');
 await page.getByRole('button',{name:'Вспомнил(а) — открыть ответ'}).click();await page.getByRole('button',{name:'Легко',exact:true}).click();
 await page.reload();await expect(page.getByText('Изучено 2 из 79 карточек.',{exact:true})).toBeVisible();
 for(const topic of ['glossary','greetings','commands','vocabulary','stances','methods','kihon','ippon','kata']){
  await page.getByLabel('Тема карточек').selectOption(topic);await expect(page.locator('.term h2')).not.toBeEmpty();await expect(page.locator('.term .japanese')).not.toBeEmpty();await expect(page.locator('.term .kana')).not.toBeEmpty();
 }
 await expect(page.locator('.term h2')).toHaveText('Тайкиоку соно ичи');
 await page.getByRole('button',{name:'На слух',exact:true}).click();await expect(page.getByRole('heading',{name:'Что вы услышали?'})).toBeVisible();
 await expect(page.locator('.term .japanese[lang=ja]')).toHaveCount(0);
 await navigate(page,'Техника');await expect(page.getByRole('button',{name:'✓ Повторено · отметить ещё раз'})).toHaveCount(1);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('bundled Japanese MP3 decodes and plays without a system Japanese voice',async({page})=>{
 await page.addInitScript(()=>{const NativeAudio=window.Audio;window.Audio=class extends NativeAudio{constructor(src){super(src);window.japanesePlayer=this;}};});
 await page.goto('/#terms');await page.getByRole('button',{name:'◖)) Прослушать',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>window.japanesePlayer?.readyState)).toBeGreaterThanOrEqual(2);
 expect(await page.evaluate(()=>window.japanesePlayer.duration)).toBeGreaterThan(.2);
 await page.getByRole('button',{name:'Следующий →',exact:true}).click();
 expect(await page.evaluate(()=>window.japanesePlayer.paused)).toBe(true);
});

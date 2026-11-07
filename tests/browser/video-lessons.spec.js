import {test,expect} from './fixtures.js';
import {readFileSync} from 'node:fs';
const clip=readFileSync(new URL('../fixtures/technique-player.webm',import.meta.url));
test('video lesson plays a local file with countdown and controls, without awarding progress',async({page})=>{
 await page.goto('/#tech');
 const before=await page.evaluate(()=>localStorage.getItem('kyokushin-v1'));
 await page.locator('[data-action="video-lesson:zenkutsu"]').click();
 const dialog=page.getByRole('dialog');
 await expect(dialog.getByRole('heading',{name:'Дзэнкуцу-дати'})).toBeVisible();
 await expect(dialog.getByText('Видео ещё не подключено')).toBeVisible();
 await expect(dialog.getByRole('button',{name:'Начать · 3, 2, 1'})).toBeDisabled();
 await dialog.getByLabel('Видео с устройства').setInputFiles({name:'clip.webm',mimeType:'video/webm',buffer:clip});
 await expect(dialog.getByRole('button',{name:'Начать · 3, 2, 1'})).toBeEnabled();
 await dialog.getByRole('button',{name:'Зеркально'}).click();
 await expect(dialog.locator('video')).toHaveClass('mirrored');
 await dialog.getByLabel('Скорость видео').selectOption('0.5');
 await expect(dialog.locator('video')).toHaveJSProperty('playbackRate',0.5);
 await dialog.getByLabel('Повторять видео').check();
 await expect(dialog.locator('video')).toHaveJSProperty('loop',true);
 await dialog.getByRole('button',{name:'Начать · 3, 2, 1'}).click();
 await expect(dialog.locator('.follow-countdown')).toHaveText('3');
 await expect(dialog.locator('video')).toHaveJSProperty('paused',false,{timeout:6000});
 expect(await page.evaluate(()=>localStorage.getItem('kyokushin-v1'))).toBe(before);
 await dialog.getByRole('button',{name:'Закрыть видеоурок'}).click();
 await expect(page.getByRole('dialog')).toHaveCount(0);
 await page.getByText('Кихон · 10 движений',{exact:true}).click();
 await page.locator('[data-action="video-lesson:kihon-9"]').click();
 await expect(page.getByRole('dialog').getByRole('heading',{name:'Кин-гэри миги'})).toBeVisible();
 await page.evaluate(()=>location.hash='home');
 await expect(page.getByRole('dialog')).toHaveCount(0);
});
test('morote video is assigned to three levels and embeds only after countdown',async({page})=>{
 await page.route('https://www.youtube.com/embed/**',route=>route.fulfill({contentType:'text/html',body:'<p>Test player</p>'}));
 await page.goto('/#tech');
 await page.getByText('Кихон · 10 движений',{exact:true}).click();
 for(let i=0;i<3;i++){
  await page.locator(`[data-action="video-lesson:kihon-${i}"]`).click();
  const dialog=page.getByRole('dialog');
  await expect(dialog.getByRole('link',{name:'Открыть видео на YouTube'})).toHaveAttribute('href','https://www.youtube.com/watch?v=y4r1qAHXHwI');
  await expect(dialog.locator('iframe')).toHaveCount(0);
  if(i===0){await dialog.getByRole('button',{name:'Начать · 3, 2, 1'}).click();await expect(dialog.locator('iframe')).toHaveAttribute('src',/youtube.com\/embed\/y4r1qAHXHwI\?autoplay=1/,{timeout:6000});}
  await dialog.getByRole('button',{name:'Закрыть видеоурок'}).click();
 }
});
test('uploaded training clip plays with seek-synchronized cues and no completion reward',async({page})=>{
 await page.goto('/#tech');
 await page.locator('[data-action="video-lesson:training-1"]').click();
 const dialog=page.getByRole('dialog'),video=dialog.locator('video');
 await expect(dialog.getByRole('heading',{name:'Тайкиоку соно ичи'})).toBeVisible();
 await expect(dialog.getByRole('button',{name:'Начать · 3, 2, 1'})).toBeEnabled();
 await expect(video).toHaveJSProperty('duration',await video.evaluate(v=>v.duration));
 expect(await video.evaluate(v=>v.duration)).toBeGreaterThan(28);
 await expect(dialog.locator('.follow-track-card.is-current b')).toHaveText('Готовность');
 await video.evaluate(v=>{v.currentTime=8.8;});
 await expect(dialog.locator('.follow-track-card.is-current small')).toHaveText('8.6 с');
 await video.evaluate(v=>{v.currentTime=0;});
 await expect(dialog.locator('.follow-track-card.is-current b')).toHaveText('Готовность');
 await dialog.getByLabel('Скорость видео').selectOption('0.5');
 await expect(video).toHaveJSProperty('playbackRate',0.5);
 await dialog.getByRole('button',{name:'Начать · 3, 2, 1'}).click();
 await expect(video).toHaveJSProperty('paused',false,{timeout:6000});
 await video.evaluate(v=>{v.currentTime=v.duration-0.2;});
 await expect(dialog.locator('.video-error')).toContainText('Это конец фрагмента');
 expect(await dialog.evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
 await dialog.getByRole('button',{name:'Закрыть видеоурок'}).click();
});

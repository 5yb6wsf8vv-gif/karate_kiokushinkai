import {test as base,expect} from '@playwright/test';
export const test=base.extend({page:async({page},use)=>{
 await page.addInitScript(()=>{if(localStorage.getItem('player-profile')===null)localStorage.setItem('player-profile',JSON.stringify({name:'Игрок',course:'1'}));});
 await use(page);
}});
export {expect};

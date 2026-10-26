import {dojoKun} from '../../src/dojo.js';
export async function solveDojo(page){for(const phrase of dojoKun)await page.getByRole('button',{name:phrase,exact:true}).click();await page.getByRole('button',{name:'Проверить порядок',exact:true}).click();}

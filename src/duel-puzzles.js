export const duelPuzzles=[
 ['Пинан соно ити','M20 25H180M100 25V175M20 175H180M20 25V60M180 175V140'],
 ['Пинан соно ни','M25 25V65H175V25M100 65V140M25 140V175H175V140'],
 ['Пинан соно сан','M20 40H180M100 40V160M20 160H180M45 40V80M155 160V120'],
 ['Пинан соно ён','M25 30H175L100 85V155M25 155H175M25 155V180'],
 ['Пинан соно го','M20 35H180M100 35V100L60 140L100 180L140 140L100 100'],
 ['Кю-комплекс · прямая связка','M30 170V30H100V170H170V30'],
 ['Кю-комплекс · смена направления','M25 25H175V90H25V175H175'],
 ['Кю-комплекс · развороты','M25 175V30H175V175H100V95H60'],
 ['Кю-комплекс · диагонали','M30 30L170 170H30L170 30H30'],
 ['Кю-комплекс · объединение','M20 35H180M100 35V170M20 170H180M20 170L60 130M180 35L140 75']
].map(([name,path],id)=>({id,name,path}));
export function puzzleSVG(task,piece=null){
 const p=duelPuzzles[task];if(!p)return '';
 const boxes=['0 0 100 100','100 0 100 100','0 100 100 100','100 100 100 100'];
 return '<svg viewBox="'+(piece===null?'0 0 200 200':boxes[piece])+'" role="img" aria-label="'+(piece===null?'Образец рисунка':'Фрагмент рисунка')+'"><path d="M0 100H200M100 0V200" stroke="#425a7c" stroke-width="1" stroke-dasharray="3 5"/><path d="'+p.path+'" stroke="#aacaff" stroke-width="7" fill="none" stroke-linejoin="round" stroke-linecap="round"/></svg>';
}

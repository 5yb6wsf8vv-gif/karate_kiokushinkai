// Изображения будут добавлены позже; идентификаторы покупок остаются стабильными.
export const skinCatalog = [
 {id:'skin-1',name:'Скин 1',price:50,mark:'一',color:'#87b8ff'},
 {id:'skin-2',name:'Скин 2',price:100,mark:'二',color:'#b4a2ff'},
 {id:'skin-3',name:'Скин 3',price:150,mark:'三',color:'#6ed9d0'}
];
export const defaultSkin={id:'default',name:'Базовая аватарка',price:0,mark:'空',color:'#c5d6ef'};
export function skinById(id){return skinCatalog.find(s=>s.id===id)||defaultSkin;}
export function validSkinId(id){return id==='default'||skinCatalog.some(s=>s.id===id);}

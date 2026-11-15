// Existing slot IDs preserve ownership when the artwork changes.
export const skinCatalog = [
 {id:'skin-1',name:'Тигр',description:'Смелый каратист с тигриным характером.',price:170,position:'0% 0%',color:'#ffad43'},
 {id:'skin-2',name:'Рысь',description:'Внимательный боец с кисточками на ушах.',price:170,position:'50% 0%',color:'#e9b16e'},
 {id:'skin-3',name:'Волк',description:'Спокойствие, выдержка и уверенная стойка.',price:170,position:'100% 0%',color:'#b8c6d8'},
 {id:'skin-4',name:'Медведь',description:'Сила, добрый нрав и крепкая защита.',price:170,position:'0% 100%',color:'#bc8252'},
 {id:'skin-6',name:'Дракончик',description:'Маленькие рожки, длинные рукава и большой боевой дух.',price:170,position:'100% 100%',color:'#6ed9d0',art:'classic'},
 {id:'skin-7',name:'Чёрный кот',description:'Ловкий каратист с золотыми глазами и кошачьей выдержкой.',price:200,position:'50% 50%',color:'#454a55',art:'cat'},
 {id:'skin-5',name:'Обезьяна',description:'Ловкий мастер с золотой отделкой пояса.',price:1000,position:'50% 100%',color:'#f4c14c'}
];
export const defaultSkin={id:'default',name:'Онигири «Ос!»',description:'Рисовый каратист с крошечными кулаками и решительным взглядом.',price:0,position:'0% 0%',color:'#c5d6ef'};
export function skinById(id){return skinCatalog.find(s=>s.id===id)||defaultSkin;}
export function validSkinId(id){return id==='default'||skinCatalog.some(s=>s.id===id);}

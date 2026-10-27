// Стабильные идентификаторы сохраняют покупки при обновлении рисунков.
export const skinCatalog = [
 {id:'skin-1',name:'Тануки «Хитрый блок»',description:'Хитрый боец с пушистым хвостом и отличной стойкой.',price:50,position:'100% 0%',color:'#87b8ff'},
 {id:'skin-2',name:'Дарума «Несгибаемый»',description:'Всегда возвращается в стойку. Его сила — упорство.',price:100,position:'0% 100%',color:'#b4a2ff'},
 {id:'skin-3',name:'Дракончик «Тихий киай»',description:'Маленькие рожки, длинные рукава и большой боевой дух.',price:150,position:'100% 100%',color:'#6ed9d0'}
];
export const defaultSkin={id:'default',name:'Онигири «Ос!»',description:'Рисовый каратист с крошечными кулаками и решительным взглядом.',price:0,position:'0% 0%',color:'#c5d6ef'};
export function skinById(id){return skinCatalog.find(s=>s.id===id)||defaultSkin;}
export function validSkinId(id){return id==='default'||skinCatalog.some(s=>s.id===id);}

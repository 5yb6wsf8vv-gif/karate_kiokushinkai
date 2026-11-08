const sheets={
 blocks:{url:new URL('./assets/technique-silhouettes/block-steps.png',import.meta.url).href,width:1536,height:1024,columns:4,rows:2},
 stances:{url:new URL('./assets/technique-silhouettes/stances.png',import.meta.url).href,width:1536,height:1024,columns:3,rows:2},
 kihon:{url:new URL('./assets/technique-silhouettes/kihon.png',import.meta.url).href,width:1254,height:1254,columns:3,rows:3},
 extras:{url:new URL('./assets/technique-silhouettes/extras.png',import.meta.url).href,width:1536,height:1024,columns:3,rows:2},
 defence:{url:new URL('./assets/technique-silhouettes/defence.png',import.meta.url).href,width:1774,height:887,columns:2,rows:1}
};
export const illustrationPoses={
 fudo:{sheet:'stances',cell:0,label:'Фудо-дачи · стойка ожидания'},
 uchiHachiji:{sheet:'stances',cell:1,label:'Ути хатидзи-дачи · носки внутрь'},
 yoi:{sheet:'stances',cell:2,label:'Ёй · положение готовности'},
 zenkutsu:{sheet:'stances',cell:3,label:'Дзэнкуцу-дачи · переднее колено согнуто'},
 kamae:{sheet:'stances',cell:4,label:'Боевая стойка · руки в защите'},
 kiba:{sheet:'stances',cell:5,label:'Киба-дачи · широкая стойка'},
 moroteHigh:{sheet:'kihon',cell:0,label:'Моротэ-цуки · верхний уровень'},
 moroteMiddle:{sheet:'kihon',cell:1,label:'Моротэ-цуки · средний уровень'},
 moroteLow:{sheet:'kihon',cell:2,label:'Моротэ-цуки · нижний уровень'},
 oiHigh:{sheet:'kihon',cell:3,label:'Ой-цуки · правая рука, верхний уровень'},
 oiMiddle:{sheet:'kihon',cell:4,label:'Ой-цуки · левая рука, средний уровень'},
 oiLow:{sheet:'kihon',cell:5,label:'Ой-цуки · правая рука, нижний уровень'},
 age:{sheet:'kihon',cell:6,label:'Дзёдан-укэ · левая рука над головой'},
 gedan:{sheet:'kihon',cell:7,label:'Гэдан-барай · правая рука, нижний блок'},
 hiza:{sheet:'kihon',cell:8,label:'Хидза-гэри · поднято левое колено'},
 kin:{sheet:'extras',cell:0,label:'Кин-гэри · низкий удар правой ногой'},
 maeGeri:{sheet:'extras',cell:1,label:'Маэ-гэри · удар ногой вперёд'},
 bow:{sheet:'extras',cell:2,label:'Рэй · поклон от бедра с прямой спиной'},
 seiza:{sheet:'extras',cell:3,label:'Сэйдза · сидя на пятках'},
 highAttack:{sheet:'extras',cell:4,label:'Ой-цуки дзёдан · удар в передней стойке'},
 middleAttack:{sheet:'extras',cell:5,label:'Ой-цуки тюдан · удар в передней стойке'},
 upperDefence:{sheet:'defence',cell:0,label:'Дзёдан-укэ · верхний блок в передней стойке'},
 lowerDefence:{sheet:'defence',cell:1,label:'Гэдан-барай · нижний блок в передней стойке'}
};
const upperSteps=[
 {pose:'upperStart',caption:'Исходная стойка: стопы устойчивы, плечи опущены, кулаки у бёдер.'},
 {pose:'upperPrepare',caption:'Подготовка: правая рука впереди, левая готовится к подъёму.'},
 {pose:'upperTravel',caption:'Поднимайте левое предплечье перед лицом. Правый кулак возвращайте к поясу.'},
 {pose:'upperFinish',caption:'Завершение: левое предплечье над лбом под углом. Между рукой и головой остаётся пространство.'}
];
const lowerSteps=[
 {pose:'lowerStart',caption:'Исходная стойка: стопы устойчивы, плечи расслаблены, кулаки у бёдер.'},
 {pose:'lowerPrepare',caption:'Подготовка: правый кулак у левого плеча, левая рука направлена вперёд-вниз.'},
 {pose:'lowerTravel',caption:'Ведите правое предплечье по диагонали вниз. Левый кулак возвращайте к поясу.'},
 {pose:'lowerFinish',caption:'Завершение: правый кулак перед правым бедром, локоть слегка согнут. Левый кулак у пояса.'}
];
[...upperSteps,...lowerSteps].forEach((step,cell)=>{illustrationPoses[step.pose]={sheet:'blocks',cell,label:`${cell<4?'Верхний':'Нижний'} блок · шаг ${cell%4+1}`};});
const sequence=steps=>steps.map((item,i)=>({...item,step:i+1}));
const one=pose=>[{pose}];
const termPoses={
 rei:one('bow'),dachi:one('fudo'),tsuki:one('middleAttack'),geri:one('maeGeri'),uke:sequence(upperSteps),
 'p10-greetings-4':one('bow'),
 'p10-commands-2':one('seiza'),'p10-commands-3':one('yoi'),'p10-commands-4':one('seiza'),'p10-commands-5':one('seiza'),'p10-commands-6':one('yoi'),'p10-commands-10':one('kamae'),'p10-commands-11':one('middleAttack'),'p10-commands-12':one('fudo'),
 'p10-vocabulary-3':one('moroteMiddle'),'p10-vocabulary-6':one('middleAttack'),'p10-vocabulary-7':one('hiza'),'p10-vocabulary-12':one('moroteHigh'),'p10-vocabulary-13':one('moroteMiddle'),'p10-vocabulary-14':one('moroteLow'),'p10-vocabulary-15':one('kin'),'p10-vocabulary-16':[{pose:'middleAttack',caption:'Хикитэ · возвращённый к поясу кулак'}],
 'p10-stances-1':one('fudo'),'p10-stances-2':one('uchiHachiji'),'p10-stances-3':one('yoi'),'p10-stances-4':one('zenkutsu'),'p10-stances-5':one('kamae'),
 'p10-methods-1':one('middleAttack'),
 'p10-methods-2':[{pose:'moroteHigh',caption:'Верхний уровень'},{pose:'moroteMiddle',caption:'Средний уровень'},{pose:'moroteLow',caption:'Нижний уровень'}],
 'p10-methods-3':[{pose:'kamae',caption:'Первый партнёр'},{pose:'kamae',mirror:true,caption:'Второй партнёр'}],
 'p10-methods-4':[{pose:'highAttack',caption:'Атака'},{pose:'upperDefence',caption:'Защита'}],
 'p10-ippon-1':[{pose:'highAttack',caption:'1 · атака дзёдан'},{pose:'upperDefence',caption:'2 · верхний блок'},{pose:'kin',caption:'3 · кин-гэри'}],
 'p10-ippon-2':[{pose:'middleAttack',caption:'1 · атака тюдан'},{pose:'lowerDefence',caption:'2 · нижний блок'},{pose:'hiza',caption:'3 · хидза-гэри'}],
 'p10-kata-1':[{pose:'fudo',caption:'Начальное положение · полная форма показана в видео'}]
};
['moroteHigh','moroteMiddle','moroteLow','oiHigh','oiMiddle','oiLow','age','gedan','hiza','kin'].forEach((pose,i)=>{termPoses[`p10-kihon-${i+1}`]=one(pose);});
termPoses['p10-kihon-7']=sequence(upperSteps);
termPoses['p10-kihon-8']=sequence(lowerSteps);
const techniquePoses={zenkutsu:one('zenkutsu'),kiba:one('kiba'),seiken:one('middleAttack'),gedan:sequence(lowerSteps),age:sequence(upperSteps),maegeri:one('maeGeri')};
export const illustrationForTerm=id=>termPoses[id]||[];
export const illustrationForTechnique=id=>techniquePoses[id]||[];
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let unique=0;
export function techniqueIllustration(items){
 if(!items.length)return '';
 return `<figure class="technique-illustration ${items[0].step?'block-sequence':''}" aria-label="${items[0].step?'Блок по шагам':'Иллюстрация положения'}"><div class="pose-row" style="--pose-count:${items.length}">${items.map(item=>{
  const pose=illustrationPoses[item.pose],sheet=sheets[pose.sheet];
  const cellWidth=sheet.width/sheet.columns,cellHeight=sheet.height/sheet.rows;
  const x=(pose.cell%sheet.columns)*cellWidth,y=Math.floor(pose.cell/sheet.columns)*cellHeight;
  const filter=`pose-cutout-${++unique}`;
  return `<div class="pose-panel" data-pose="${item.pose}">${item.step?`<span class="pose-step">Шаг ${item.step}</span>`:''}<svg class="pose-picture ${item.mirror?'pose-mirrored':''}" viewBox="${x} ${y} ${cellWidth} ${cellHeight}" role="img" aria-label="${escape(pose.label)}"><defs><clipPath id="${filter}-clip"><rect x="${x}" y="${y}" width="${cellWidth}" height="${cellHeight}"/></clipPath><filter id="${filter}" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncA type="discrete" tableValues="0 0 0 0 0 0 0 0 0 1"/></feComponentTransfer></filter></defs><image href="${sheet.url}" x="0" y="0" width="${sheet.width}" height="${sheet.height}" filter="url(#${filter})" clip-path="url(#${filter}-clip)"/></svg><span class="pose-caption">${escape(item.caption||pose.label)}</span></div>`;
 }).join('')}</div><figcaption>Схематичная иллюстрация положения</figcaption></figure>`;
}
export const termIllustration=term=>techniqueIllustration(illustrationForTerm(term.id));
export const practiceIllustration=technique=>techniqueIllustration(illustrationForTechnique(technique.id));

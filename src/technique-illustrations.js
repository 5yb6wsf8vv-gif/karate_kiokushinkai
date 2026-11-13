const sheets={
 mawashi:{url:new URL('./assets/technique-silhouettes/mawashi-steps.png',import.meta.url).href,width:2172,height:724,columns:4,rows:1},
 upperCross:{url:new URL('./assets/technique-silhouettes/upper-cross.png',import.meta.url).href,width:2172,height:724,columns:4,rows:1},
 kicks:{url:new URL('./assets/technique-silhouettes/kick-steps.png',import.meta.url).href,width:1254,height:1254,columns:4,rows:3},
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
 {pose:'upperPrepare',caption:'Перекрестите предплечья перед верхней частью груди: левый кулак у правого плеча, правый — у левого. Локти ниже кулаков.'},
 {pose:'upperTravel',caption:'Раскройте перекрещивание: левое предплечье поднимается перед лицом, правый кулак возвращается к поясу.'},
 {pose:'upperFinish',caption:'Завершение: левое предплечье над лбом под углом. Между рукой и головой остаётся пространство.'}
];
const lowerSteps=[
 {pose:'lowerStart',caption:'Исходная стойка: стопы устойчивы, плечи расслаблены, кулаки у бёдер.'},
 {pose:'lowerPrepare',caption:'Подготовка: правый кулак у левого плеча, левая рука направлена вперёд-вниз.'},
 {pose:'lowerTravel',caption:'Ведите правое предплечье по диагонали вниз. Левый кулак возвращайте к поясу.'},
 {pose:'lowerFinish',caption:'Завершение: правый кулак перед правым бедром, локоть слегка согнут. Левый кулак у пояса.'}
];
[...upperSteps,...lowerSteps].forEach((step,cell)=>{illustrationPoses[step.pose]={sheet:cell<4?'upperCross':'blocks',cell,label:`${cell<4?'Верхний':'Нижний'} блок · шаг ${cell%4+1}`};});
const sequence=steps=>steps.map((item,i)=>({...item,step:i+1}));
const kickSteps={
 hiza:[
  'Исходная боевая стойка: руки в защите, вес распределён устойчиво.',
  'Поднимите левое колено перед собой, голень остаётся согнутой.',
  'Направьте согнутое левое колено вперёд-вверх. Держите корпус устойчиво, не разгибайте ногу в удар стопой.',
  'Опустите левую ногу под контролем и восстановите боевую стойку.'
 ],
 kin:[
  'Исходная боевая стойка: руки в защите, опора на левую ногу.',
  'Поднимите правое колено перед собой, сохраняя равновесие.',
  'Выполните невысокий удар правой ногой по восходящей траектории. Носок вытянут, ударная поверхность — подъём стопы.',
  'Согните колено и верните правую ногу в исходную стойку.'
 ],
 mae:[
  'Исходная боевая стойка: руки в защите, корпус устойчив.',
  'Поднимите правое колено перед собой. Подготовьте стопу: пальцы оттянуты на себя.',
  'Разогните ногу вперёд без запирания колена. Ударная поверхность — подушечка стопы под пальцами.',
  'Верните голень к поднятому колену, затем опустите ногу и восстановите стойку.'
 ]
};
Object.entries(kickSteps).forEach(([kind,captions],row)=>{kickSteps[kind]=captions.map((caption,i)=>{const pose=`${kind}Step${i+1}`;illustrationPoses[pose]={sheet:'kicks',cell:row*4+i,label:`${{hiza:'Хидза-гэри',kin:'Кин-гэри',mae:'Маэ-гэри'}[kind]} · шаг ${i+1}`};return {pose,caption,step:i+1};});});
const mawashiSteps=[
 {pose:'mawashiStart',step:1,caption:'Боевая стойка: руки в защите, корпус устойчив.'},
 {pose:'mawashiPrepare',step:2,caption:'Вынесите правое колено в сторону. Разверните опорную левую стопу и таз по направлению удара.'},
 {pose:'mawashiStrike',step:3,caption:'Направьте правую голень по круговой траектории на средний уровень. Удар наносится подъёмом стопы; руки остаются в защите.'},
 {pose:'mawashiRecover',step:4,caption:'Согните правую ногу обратно к вынесенному колену, затем опустите её и восстановите стойку.'}
];
mawashiSteps.forEach((item,cell)=>{illustrationPoses[item.pose]={sheet:'mawashi',cell,label:`Маваси-гэри · шаг ${cell+1}`,...(cell===2?{bounds:[1060,0,620,724]}:cell===3?{bounds:[1710,0,462,724]}:{})};});
const one=pose=>[{pose}];
const termPoses={
 mawashi:mawashiSteps,rei:one('bow'),dachi:one('fudo'),tsuki:one('middleAttack'),geri:one('maeGeri'),uke:sequence(upperSteps),
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
termPoses['p10-kihon-9']=kickSteps.hiza;
termPoses['p10-kihon-10']=kickSteps.kin;
const techniquePoses={mawashigeri:mawashiSteps,zenkutsu:one('zenkutsu'),kiba:one('kiba'),seiken:one('middleAttack'),gedan:sequence(lowerSteps),age:sequence(upperSteps),maegeri:kickSteps.mae,hizageri:kickSteps.hiza,kingeri:kickSteps.kin};
export const illustrationForTerm=id=>termPoses[id]||[];
export const illustrationForTechnique=id=>techniquePoses[id]||[];
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let unique=0;
export function techniqueIllustration(items,{compact=false}={}){
 compact=compact&&items.length>1;
 if(!items.length)return '';
 return `<figure class="technique-illustration ${compact?'step-carousel':''} ${items[0].step?'block-sequence':''}" aria-label="${items[0].step?'Движение по шагам':'Иллюстрация положения'}"><div class="pose-row" style="--pose-count:${items.length}">${items.map((item,index)=>{
  const pose=illustrationPoses[item.pose],sheet=sheets[pose.sheet];
  let cellWidth=sheet.width/sheet.columns,cellHeight=sheet.height/sheet.rows;
  let x=(pose.cell%sheet.columns)*cellWidth,y=Math.floor(pose.cell/sheet.columns)*cellHeight;if(pose.bounds)[x,y,cellWidth,cellHeight]=pose.bounds;
  const filter=`pose-cutout-${++unique}`;
  return `<div class="pose-panel" data-pose="${item.pose}" ${compact&&index>0?'hidden':''}>${!compact&&item.step?`<span class="pose-step">Шаг ${item.step}</span>`:''}${compact?'<button type="button" class="step-card" data-step-next aria-label="Показать следующий шаг">':''}<svg class="pose-picture ${item.mirror?'pose-mirrored':''}" viewBox="${x} ${y} ${cellWidth} ${cellHeight}" role="img" aria-label="${escape(pose.label)}"><defs><clipPath id="${filter}-clip"><rect x="${x}" y="${y}" width="${cellWidth}" height="${cellHeight}"/></clipPath><filter id="${filter}" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncA type="discrete" tableValues="0 0 0 0 0 0 0 0 0 1"/></feComponentTransfer></filter></defs><image href="${sheet.url}" x="0" y="0" width="${sheet.width}" height="${sheet.height}" filter="url(#${filter})" clip-path="url(#${filter}-clip)"/></svg>${compact?'</button>':''}<span class="pose-caption">${escape(item.caption||pose.label)}</span></div>`;
 }).join('')}</div>${compact?`<div class="step-controls"><button type="button" class="secondary" data-step-prev disabled aria-label="Предыдущий шаг">←</button><span class="step-progress" role="status" aria-live="polite">Шаг 1 из ${items.length}</span><button type="button" class="secondary" data-step-next>Далее →</button></div>`:''}</figure>`;
}
export const termIllustration=term=>techniqueIllustration(illustrationForTerm(term.id),{compact:true});
export const practiceIllustration=technique=>techniqueIllustration(illustrationForTechnique(technique.id),{compact:true});
// Quiz pictures describe their purpose without giving away the movement name.
export const questionIllustration=pose=>techniqueIllustration([{pose}]).replace(/aria-label="[^"]*"/g,'aria-label="Карточка движения"').replace(/<span class="pose-caption">[\s\S]*?<\/span>/g,'');

const decodedSheets=new Map();
export function preloadIllustrations(poses){
 const urls=[...new Set(poses.map(pose=>sheets[illustrationPoses[pose].sheet].url))];
 return Promise.all(urls.map(url=>{
  if(!decodedSheets.has(url)){
   const ready=new Promise((resolve,reject)=>{
    const img=new Image();
    img.onload=()=>img.decode().then(()=>resolve(img),reject);
    img.onerror=()=>reject(Error('Не удалось загрузить карточки.'));
    img.src=url;
   }).catch(error=>{decodedSheets.delete(url);throw error;});
   decodedSheets.set(url,ready);
  }
  return decodedSheets.get(url);
 }));
}

export function handleIllustrationStep(event){
 const button=event.target.closest('[data-step-next],[data-step-prev]');
 if(!button)return false;
 const carousel=button.closest('.step-carousel');if(!carousel)return false;
 event.preventDefault();
 const panels=[...carousel.querySelectorAll('.pose-panel')],current=panels.findIndex(panel=>!panel.hidden);
 const next=button.hasAttribute('data-step-prev')?Math.max(0,current-1):(current+1)%panels.length;
 panels.forEach((panel,index)=>panel.hidden=index!==next);
 carousel.querySelector('.step-progress').textContent=`Шаг ${next+1} из ${panels.length}`;
 carousel.querySelector('[data-step-prev]').disabled=next===0;
 carousel.querySelector('.step-controls [data-step-next]').textContent=next===panels.length-1?'Сначала ↺':'Далее →';
 if(button.classList.contains('step-card'))panels[next].querySelector('.step-card').focus({preventScroll:true});
 return true;
}

import {basicKicks} from './basic-kicks.js';
// Browser and server share stable movement IDs; illustration assets stay in the browser.
export const movementChoices=[
 {id:'zenkutsu',name:'Дзэнкуцу-дачи',pose:'zenkutsu'},
 {id:'kiba',name:'Киба-дачи',pose:'kiba'},
 {id:'tsuki',name:'Сэйкэн цуки',pose:'middleAttack'},
 {id:'gedan',name:'Гэдан-барай',pose:'lowerFinish'},
 {id:'age',name:'Агэ-укэ',pose:'upperFinish'},
 {id:'hiza',name:'Хидза гаммэн-гэри',pose:'hizaStep3'},
 {id:'kin',name:'Кин-гэри',pose:'kinStep3'},
 {id:'mae',name:'Маэ-гэри',pose:'maeStep3'},
 {id:'mawashi',name:'Маваси-гэри',pose:'mawashiStrike'},
 ...basicKicks.map(k=>({id:k.id,name:k.name,pose:`${k.id}Step3`}))
];
const sets=[['zenkutsu','kiba','tsuki','gedan'],['gedan','age','tsuki','kin'],['mae','hiza','kin','kiba'],['kin','mae','hiza','age'],['tsuki','zenkutsu','kiba','age'],['kiba','zenkutsu','mae','gedan'],['age','gedan','hiza','tsuki'],['hiza','kin','mae','zenkutsu'],['gedan','age','tsuki','kiba'],['mae','hiza','kin','tsuki']];
const targets=['zenkutsu','gedan','hiza','kin','tsuki','kiba','age','mae','gedan','hiza'];
export const legacyMovementQuiz=sets.map((options,id)=>({id,mode:id%2?'image-to-name':'name-to-image',target:targets[id],options}));
const updatedSets=sets.map(options=>[...options]);updatedSets[8]=['mawashi','age','tsuki','kiba'];updatedSets[9]=['hiza','mae','mawashi','kin'];
export const movementQuiz=legacyMovementQuiz.map((q,i)=>i<8?q:{...q,target:'mawashi',options:updatedSets[i]});
// New rooms draw five questions in each direction from the complete catalogue.
export const movementQuizPool=movementChoices.flatMap((target,i)=>{
 const others=movementChoices.filter(m=>m.id!==target.id);
 const options=[target.id,...Array.from({length:3},(_,j)=>others[(i+j*3)%others.length].id)];
 const shift=i%4,rotated=[...options.slice(shift),...options.slice(0,shift)];
 return ['name-to-image','image-to-name'].map((mode,j)=>({id:i*2+j,mode,target:target.id,options:rotated}));
});
export const quizForFormat=format=>format==='recognition-v1'?legacyMovementQuiz:format==='recognition-v2'?movementQuiz:movementQuizPool;
export function drawQuizTasks(random=Math.random){
 const shuffle=items=>{for(let i=items.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[items[i],items[j]]=[items[j],items[i]];}return items;};
 return shuffle(['name-to-image','image-to-name'].flatMap(mode=>shuffle(movementQuizPool.filter(q=>q.mode===mode).map(q=>q.id)).slice(0,5)));
}
export const movementById=id=>movementChoices.find(m=>m.id===id);
export const correctMovementPiece=(task,format='recognition-v2')=>{const q=quizForFormat(format)[task];return q?.options.indexOf(q.target);};

// Browser and server share stable movement IDs; illustration assets stay in the browser.
export const movementChoices=[
 {id:'zenkutsu',name:'Дзэнкуцу-дачи',pose:'zenkutsu'},
 {id:'kiba',name:'Киба-дачи',pose:'kiba'},
 {id:'tsuki',name:'Сэйкэн цуки',pose:'middleAttack'},
 {id:'gedan',name:'Гэдан-барай',pose:'lowerFinish'},
 {id:'age',name:'Агэ-укэ',pose:'upperFinish'},
 {id:'hiza',name:'Хидза гаммэн-гэри',pose:'hizaStep3'},
 {id:'kin',name:'Кин-гэри',pose:'kinStep3'},
 {id:'mae',name:'Маэ-гэри',pose:'maeStep3'}
];
const sets=[['zenkutsu','kiba','tsuki','gedan'],['gedan','age','tsuki','kin'],['mae','hiza','kin','kiba'],['kin','mae','hiza','age'],['tsuki','zenkutsu','kiba','age'],['kiba','zenkutsu','mae','gedan'],['age','gedan','hiza','tsuki'],['hiza','kin','mae','zenkutsu'],['gedan','age','tsuki','kiba'],['mae','hiza','kin','tsuki']];
const targets=['zenkutsu','gedan','hiza','kin','tsuki','kiba','age','mae','gedan','hiza'];
export const movementQuiz=sets.map((options,id)=>({id,mode:id%2?'image-to-name':'name-to-image',target:targets[id],options}));
export const movementById=id=>movementChoices.find(m=>m.id===id);
export const correctMovementPiece=task=>{const q=movementQuiz[task];return q?.options.indexOf(q.target);};

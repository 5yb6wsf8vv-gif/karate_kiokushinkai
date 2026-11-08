// Japanese forms: JMdict vocabulary, with composed karate technique names.
// Kana is explicit so audio never guesses an uncommon kanji reading.
export const japaneseProgram = {
 glossary:[['空手・空手道','からて、からてどう'],['極真会','きょくしんかい'],['道場','どうじょう'],['武道','ぶどう'],['武士道','ぶしどう'],['範士','はんし'],['師範','しはん'],['先生','せんせい'],['先輩','せんぱい'],['後輩','こうはい'],['取り','とり'],['受け','うけ'],['道場訓','どうじょうくん']],
 greetings:[['押忍','おす'],['気合','きあい'],['礼','れい'],['ありがとうございました','ありがとうございました']],
 commands:[['礼','れい'],['正座','せいざ'],['立て','たて'],['黙想','もくそう'],['黙想止め','もくそうやめ'],['用意','ようい'],['始め','はじめ'],['止め','やめ'],['不動立ち','ふどうだち'],['構えて','かまえて'],['無号令、始め','むごうれい、はじめ'],['直れ','なおれ'],['分かった？','わかった']],
 count:[['一','いち'],['二','に'],['三','さん'],['四','し'],['五','ご'],['六','ろく'],['七','しち'],['八','はち'],['九','きゅう'],['十','じゅう']],
 vocabulary:[['右','みぎ'],['左','ひだり'],['諸手','もろて'],['突き','つき'],['顔面','がんめん'],['正拳','せいけん'],['膝','ひざ'],['受け','うけ'],['蹴り','けり、げり'],['正面・前','しょうめん、まえ'],['下がり・後ろ','さがり、うしろ'],['上段','じょうだん'],['中段','ちゅうだん'],['下段','げだん'],['金的','きんてき'],['引き手','ひきて']],
 stances:[['不動立ち','ふどうだち'],['内八字立ち','うちはちじだち'],['用意立ち','よういだち'],['前屈立ち','ぜんくつだち'],['構え','かまえ']],
 methods:[['基本','きほん'],['基本型','きほんかた'],['組手','くみて'],['一本組手','いっぽんくみて'],['試し割り','ためしわり']],
 kihon:[['正拳諸手突き上段','せいけん、もろてづき、じょうだん'],['正拳諸手突き中段','せいけん、もろてづき、ちゅうだん'],['正拳諸手突き下段','せいけん、もろてづき、げだん'],['正拳追い突き上段・右','せいけん、おいづき、じょうだん、みぎ'],['正拳追い突き中段・左','せいけん、おいづき、ちゅうだん、ひだり'],['正拳追い突き下段・右','せいけん、おいづき、げだん、みぎ'],['正拳上段受け・左','せいけん、じょうだんうけ、ひだり'],['正拳前下段払い・右','せいけん、まえげだんばらい、みぎ'],['膝顔面蹴り・左','ひざ、がんめんげり、ひだり'],['金的蹴り・右','きんてきげり、みぎ']],
 ippon:[['一本組手・一','いっぽんくみて、いち'],['一本組手・二','いっぽんくみて、に']],
 kata:[['太極その一','たいきょくそのいち']]
};
export const termAliases={
 'p10-glossary-3':'dojo','p10-greetings-1':'osu','p10-greetings-3':'rei','p10-commands-1':'rei',
 'p10-commands-7':'hajime','p10-commands-8':'yame','p10-commands-9':'p10-stances-1',
 'p10-vocabulary-4':'tsuki','p10-vocabulary-8':'uke','p10-vocabulary-9':'geri'
};
export function mergeTermDeck(base,program){
 const result=base.map(t=>({...t,groups:['basics'],topics:['Базовые карточки']}));
 for(const card of program){
  const [jp,kana]=japaneseProgram[card.group][Number(card.id.split('-').at(-1))-1];
  const id=termAliases[card.id]||card.id;
  let target=result.find(t=>t.id===id);
  if(!target){target={id,jp,kana,reading:card.name,translation:card.description,groups:[],topics:[],video:card.video};result.push(target);}
  if(!target.groups.includes(card.group)){target.groups.push(card.group);target.topics.push(card.topic);}
  if(target.translation!==card.description){target.details??=[];if(!target.details.includes(card.description))target.details.push(card.description);}
  if(!target.kana)target.kana=kana;
 }
 return result;
}
export function migrateTermProgress(state){
 const lastReview=p=>p.due-(p.interval? p.interval*86400000:600000);
 for(const [oldId,newId]of Object.entries(termAliases)){
  const previous=state.terms[oldId];if(!previous)continue;
  const current=state.terms[newId];
  if(!current)state.terms[newId]={...previous};
  else{const latest=lastReview(previous)>lastReview(current)?previous:current;state.terms[newId]={...latest,reviews:(previous.reviews||0)+(current.reviews||0)};}
  delete state.terms[oldId];
 }
}

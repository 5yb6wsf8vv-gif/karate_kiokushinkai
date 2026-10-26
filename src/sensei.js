const atlas = new URL('./assets/sensei-dmitry.png', import.meta.url).href;
export const emotions = {
  joy: {label:'Радость', position:'0% 0%', replies:['Осу! Хороший шаг. Продолжим в том же духе!','Верно! Ты становишься увереннее с каждым ответом.','Отличная работа. Маленькие победы складываются в большой путь.']},
  focus: {label:'Строгость', position:'50% 0%', replies:['Соберёмся: сначала внимательно прочитай вопрос, потом выбирай ответ.','Не торопись. Точность важнее скорости — кроме заданий с таймером!','Дисциплина начинается с внимания к одной небольшой задаче.']},
  surprise: {label:'Удивление', position:'100% 0%', replies:['Вот это поворот! Давай разберём, что произошло, и попробуем ещё.','Пять секунд пролетают быстро! Закрепим знания перед новой попыткой.','Иногда неожиданная ошибка помогает лучше запомнить ответ.']},
  sadness: {label:'Грусть', position:'0% 100%', replies:['Не получилось? Я рядом. Ошибка — повод разобраться, а не сдаваться.','Сегодня непросто. Перечитай объяснение и сделай ещё одну попытку.','Неверный ответ не отменяет твой прогресс. Продолжаем спокойно.']},
  confidence: {label:'Уверенность', position:'50% 100%', replies:['Ты справишься. Один урок, одно повторение, один уверенный шаг.','Осу! Сначала пойми смысл, а затем проверь себя.','Я рядом. Практикуйся в своём темпе и береги себя.']},
  laughter: {label:'Смех', position:'100% 100%', replies:['Вот это результат! Улыбнись — ты хорошо поработал!','Осу! Отличный повод порадоваться своей настойчивости.','Мы сделали это! Теперь немного отдыха и новое повторение.']}
};
const reactions={correct:['joy','confidence','laughter'],wrong:['sadness','confidence','focus'],timeout:['surprise','focus','confidence'],finish:['laughter','joy','confidence'],review:['confidence','joy','focus'],start:['confidence','joy','focus']};
let reaction=null, adviceIndex=0, epoch=0;
export function setSensei(event){const list=reactions[event]||reactions.start;reaction={list,index:epoch++%list.length,event};adviceIndex=0;}
export function clearSensei(){reaction=null;adviceIndex=0;}
export function sensei(message='Осу! Один небольшой шаг сегодня — уверенность завтра.', fallback='confidence'){
 const mood=reaction?reaction.list[reaction.index]:fallback;
 const emotion=emotions[mood]||emotions.confidence;
 const text=reaction?emotion.replies[adviceIndex%emotion.replies.length]:message;
 return `<aside class="sensei" data-emotion="${mood}"><div class="sensei-portrait" role="img" aria-label="Сенсей Дмитрий: ${emotion.label}" style="background-image:url('${atlas}');background-position:${emotion.position}"></div><div class="sensei-bubble"><span class="eyebrow">СЕНСЕЙ ДМИТРИЙ</span><p class="sensei-reply" aria-live="polite">${text}</p><div class="sensei-tools"><span class="emotion-label">${emotion.label}</span><button class="advice-button" data-action="sensei-advice">Ещё совет ↻</button></div><details class="emotion-picker"><summary>Эмоции сенсея</summary><div>${Object.entries(emotions).map(([key,e])=>`<button data-action="sensei-mood:${key}" aria-pressed="${key===mood}">${e.label}</button>`).join('')}</div></details></div></aside>`;
}
export function handleSensei(action,value){
 if(action==='sensei-advice'){if(!reaction)reaction={list:reactions.start,index:0,event:'start'};reaction.index=(reaction.index+1)%reaction.list.length;adviceIndex++;return true;}
 if(action==='sensei-mood'&&emotions[value]){reaction={list:[value],index:0,event:'manual'};adviceIndex++;return true;}
 return false;
}

// Русский текст и последовательность с фотографии пользователя.
export const dojoKun = [
 'Мы будем тренировать наши сердца и тела для достижения твердого непоколебимого духа;',
 'Мы будем следовать истинному смыслу воинского пути, чтобы наши чувства все время были наготове;',
 'С истинным рвением мы будем стремиться культивировать дух самоотрицания;',
 'Мы будем соблюдать правила этикета, уважать старших и воздерживаться от насилия;',
 'Мы будем следовать нашим религиозным принципам и никогда не забудем истинную добродетель скромности;',
 'Мы будем стремиться к мудрости и силе, не ведая других желаний;',
 'Всю нашу жизнь через изучение каратэ мы будем стремиться выполнить истинное предназначение пути Киокушинкай.'
];
export function correctDojoOrder(order) {
 return Array.isArray(order) && order.length === dojoKun.length && order.every((id,i)=>id===i);
}
export function createDojoExercise(prefix,onPass) {
 let order=[],bank=[],checked=false,passed=false;
 function reset(){order=[];checked=false;passed=false;bank=dojoKun.map((_,i)=>i);for(let i=bank.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bank[i],bank[j]]=[bank[j],bank[i]];}if(correctDojoOrder(bank))bank.push(bank.shift());}
 reset();
 const button=(text,action,disabled=false)=>`<button class="secondary" data-action="${prefix}-${action}" ${disabled?'disabled':''}>${text}</button>`;
 return {reset,isPassed:()=>passed,view(){return `<section class="card dojo-section" aria-labelledby="dojo-title"><span class="eyebrow">ЗАВЕРШЕНИЕ ЭТАПА · 道場訓</span><h2 id="dojo-title">Додзе кун</h2><p>Семь принципов додзё. Прочитайте текст с фотографии, затем восстановите последовательность.</p><details class="dojo-reference"><summary>Прочитать додзе кун</summary><ol>${dojoKun.map(p=>`<li>${p}</li>`).join('')}</ol><p class="muted">Формулировки и порядок приведены по вашей фотографии.</p></details><h3>Расставьте фразы по порядку</h3><p class="muted">Нажимайте фразы снизу: первая выбранная займёт место №1. Можно убрать фразу и выбрать заново. Ограничения времени нет.</p><ol class="dojo-order" aria-label="Ваша последовательность">${order.map((id,i)=>`<li ${checked&&!passed?`class="${id===i?'dojo-correct':'dojo-wrong'}"`:''}><span>${dojoKun[id]}</span>${passed?'':`<button class="text" data-action="${prefix}-remove:${i}" aria-label="Убрать фразу ${i+1}">×</button>`}</li>`).join('')}</ol>${!order.length?'<p class="dojo-empty">Здесь появятся фразы в выбранном вами порядке.</p>':''}<p class="muted">Выбрано ${order.length} из 7</p><div class="dojo-bank">${bank.filter(id=>!order.includes(id)).map(id=>button(dojoKun[id],`pick:${id}`,passed)).join('')}</div><div class="ratings">${button('Проверить порядок','check',order.length!==7||passed)}${!passed?button('Начать заново','reset',!order.length):''}</div><p class="feedback" role="status">${passed?'Верно! Все семь фраз на своих местах. Додзе кун пройден.':checked?'Порядок пока неверный. Выделенные фразы стоят не на своём месте. Исправьте порядок или перечитайте текст.':'Соберите все семь фраз, затем проверьте порядок.'}</p></section>`;},handle(a,v){if(!a.startsWith(prefix+'-'))return false;const action=a.slice(prefix.length+1),id=Number(v);if(passed)return true;if(action==='pick'&&Number.isInteger(id)&&id>=0&&id<7&&!order.includes(id)){order.push(id);checked=false;}if(action==='remove'&&Number.isInteger(id)&&id>=0&&id<order.length){order.splice(id,1);checked=false;}if(action==='reset')reset();if(action==='check'&&order.length===7){checked=true;passed=correctDojoOrder(order);if(passed)onPass();}return true;}};
}

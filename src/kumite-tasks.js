const poses={
 ready:{name:'Ёй — готовность',kind:'Подготовка',arms:'M66 62L56 80L62 94M94 62L106 80L100 94',legs:'M67 105L58 149L48 153M93 105L102 149L113 153'},
 guard:{name:'Боевая стойка',kind:'Защита',arms:'M66 62L52 79L64 52M94 62L111 80L120 55',legs:'M67 105L49 148L36 153M93 105L107 145L126 150'},
 zenkutsu:{name:'Дзэнкуцу-дати',kind:'Стойка',arms:'M66 62L55 82L66 91M94 62L112 80L120 56',legs:'M67 105L45 132L35 152L18 152M93 105L118 149L139 153'},
 kiba:{name:'Киба-дати',kind:'Стойка',arms:'M66 62L50 80L65 88M94 62L110 80L95 88',legs:'M67 105L43 120L42 151L26 153M93 105L117 120L118 151L134 153'},
 tsuki:{name:'Сэйкэн цуки',kind:'Удар рукой',arms:'M66 62L51 79L68 87M94 62L118 68L146 66',legs:'M67 105L45 132L35 152L18 152M93 105L118 149L139 153'},
 'kiba-tsuki':{name:'Цуки в киба-дати',kind:'Удар рукой',arms:'M66 62L51 79L68 87M94 62L118 68L146 66',legs:'M67 105L43 120L42 151L26 153M93 105L117 120L118 151L134 153'},
 gedan:{name:'Гэдан-барай',kind:'Нижний блок',arms:'M66 62L54 81L37 107M94 62L111 80L91 88',legs:'M67 105L45 132L35 152L18 152M93 105L118 149L139 153'},
 age:{name:'Агэ-укэ',kind:'Верхний блок',arms:'M66 62L60 39L103 30M94 62L110 80L91 88',legs:'M67 105L45 132L35 152L18 152M93 105L118 149L139 153'},
 uchi:{name:'Ути-укэ',kind:'Блок',arms:'M66 62L53 80L68 88M94 62L114 79L118 49',legs:'M67 105L45 132L35 152L18 152M93 105L118 149L139 153',arrow:'M87 43Q104 28 127 42M120 34L127 42L118 44'},
 soto:{name:'Сото-укэ',kind:'Блок',arms:'M66 62L53 80L68 88M94 62L108 80L93 49',legs:'M67 105L45 132L35 152L18 152M93 105L118 149L139 153',arrow:'M129 39Q112 26 91 42M99 33L91 42L102 43'},
 knee:{name:'Подъём колена',kind:'Подготовка удара',arms:'M66 62L52 79L64 52M94 62L111 80L120 55',legs:'M67 105L61 150L47 153M93 105L112 88L115 120'},
 maegeri:{name:'Маэ-гэри',kind:'Удар ногой',arms:'M66 62L52 79L64 52M94 62L106 83L116 60',legs:'M67 105L61 150L47 153M93 105L116 105L146 86',arrow:'M118 124L150 110M141 108L150 110L146 119'},
 hiza:{name:'Хидза-гэри',kind:'Удар коленом',arms:'M66 62L55 78L67 55M94 62L111 76L118 53',legs:'M67 105L61 150L47 153M93 105L117 85L111 118',arrow:'M128 117L133 87M126 94L133 87L138 96'},
 recover:{name:'Возврат ноги',kind:'Завершение',arms:'M66 62L52 79L64 52M94 62L111 80L120 55',legs:'M67 105L61 150L47 153M93 105L108 116L104 140',arrow:'M139 102Q131 136 111 150M110 140L111 150L121 149'},
 step:{name:'Шаг вперёд',kind:'Перемещение',arms:'M66 62L52 79L64 52M94 62L111 80L120 55',legs:'M67 105L55 136L66 149M93 105L119 145L139 150',arrow:'M104 162H145M137 156L145 162L137 168'},
 sidestep:{name:'Шаг в сторону',kind:'Перемещение',arms:'M66 62L52 79L64 52M94 62L111 80L120 55',legs:'M67 105L48 145L31 151M93 105L113 145L130 151',arrow:'M54 165H19M27 158L19 165L27 172'},
 turn:{name:'Разворот',kind:'Смена направления',arms:'M66 62L50 79L55 53M94 62L108 78L95 91',legs:'M67 105L52 147L35 152M93 105L105 145L125 151',arrow:'M39 32C18 39 19 65 40 71M31 62L40 71L28 73'}
};
export const kumiteTasks=[
 ['Нижняя защита и контратака','Передняя стойка → нижний блок → прямой удар → боевая стойка.',['zenkutsu','gedan','tsuki','guard']],
 ['Верхняя защита и контратака','Передняя стойка → верхний блок → прямой удар → боевая стойка.',['zenkutsu','age','tsuki','guard']],
 ['Ути-укэ и прямой удар','Готовность → ути-укэ → прямой удар → боевая стойка.',['ready','uchi','tsuki','guard']],
 ['Сото-укэ и прямой удар','Готовность → сото-укэ → прямой удар → боевая стойка.',['ready','soto','tsuki','guard']],
 ['Четыре этапа маэ-гэри','Боевая стойка → подъём колена → удар вперёд → возврат ноги.',['guard','knee','maegeri','recover']],
 ['Удар ногой и рукой','Передняя стойка → маэ-гэри → прямой удар → боевая стойка.',['zenkutsu','maegeri','tsuki','guard']],
 ['Шаг и удар коленом','Готовность → шаг вперёд → хидза-гэри → боевая стойка.',['ready','step','hiza','guard']],
 ['Уход в сторону и контратака','Готовность → шаг в сторону → прямой удар → боевая стойка.',['ready','sidestep','tsuki','guard']],
 ['Работа в киба-дати','Готовность → киба-дати → прямой удар в этой стойке → боевая стойка.',['ready','kiba','kiba-tsuki','guard']],
 ['Разворот и защита','Передняя стойка → разворот → нижний блок → боевая стойка.',['zenkutsu','turn','gedan','guard']]
].map(([name,prompt,steps],id)=>({id,name,prompt,steps}));
export function exerciseCard(taskId,slot){
 const task=kumiteTasks[taskId],id=task?.steps[slot],pose=poses[id];if(!pose)return '';
 return `<span class="kumite-exercise" data-movement="${id}"><span class="kumite-kind">${pose.kind}</span><svg viewBox="0 0 160 176" role="img" aria-label="${pose.name}"><ellipse cx="80" cy="158" rx="65" ry="6" fill="#14233b"/><path d="M12 160H148" stroke="#425d87" stroke-width="2"/><path d="${pose.legs}" stroke="#cbdcf7" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M66 55L94 55L101 106L58 106Z" fill="#edf4ff" stroke="#a6bbd9" stroke-width="2"/><path d="M67 55L81 78L93 55" fill="none" stroke="#a6bbd9" stroke-width="2"/><path d="${pose.arms}" stroke="#e6efff" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M59 99H100M78 99L73 119M84 99L93 116" stroke="#0c1728" stroke-width="7" fill="none"/><circle cx="80" cy="34" r="15" fill="#e8ad80"/><path d="M65 31Q67 9 85 17Q98 17 96 32L89 26L76 27Z" fill="#26374f"/><circle cx="86" cy="34" r="2" fill="#182239"/><path d="M86 42H91" stroke="#9d6349" stroke-width="2" stroke-linecap="round"/>${pose.arrow?`<path d="${pose.arrow}" fill="none" stroke="#78b6ff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`:''}</svg><span class="kumite-exercise-name">${pose.name}</span></span>`;
}
export function exerciseName(taskId,slot){return poses[kumiteTasks[taskId]?.steps[slot]]?.name||'';}

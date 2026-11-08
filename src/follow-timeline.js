// Observation-based cues for IMG_1100.MOV. Times refer to the video clock.
export const trainingClip = {
 name:'Тайкиоку соно ичи',
 steps:['Посмотрите на направление движения тренера.','Следуйте подсказкам «сейчас» и «далее».','В конце добавлен плавный переход к начальной стойке; это монтажный возврат, а не показ недостающих шагов ката.'],
 url:`${import.meta.env.BASE_URL}videos/taikyoku-blue-outline.mp4`,
 cues:[
 [0,'Готовность','ready'],[2.4,'Поворот и нижний блок','gedan'],[3.6,'Шаг и прямой удар','tsuki',4.1],
 [4.8,'Разворот и нижний блок','gedan'],[6.2,'Шаг и прямой удар','tsuki',6.85],
 [7.4,'Смена направления и блок','gedan'],[8.6,'Шаг и прямой удар','tsuki',9.15],
 [9.9,'Ещё шаг и удар','tsuki',10.35],[11.2,'Шаг и прямой удар','tsuki',11.6],
 [12.5,'Разворот и нижний блок','gedan'],[13.8,'Шаг и прямой удар','tsuki',14.25],
 [15,'Разворот и нижний блок','gedan'],[16.5,'Шаг и прямой удар','tsuki',17.05],
 [17.8,'Смена направления и блок','gedan'],[19,'Шаг и прямой удар','tsuki',19.7],
 [20.3,'Ещё шаг и удар','tsuki',20.95],[21.6,'Шаг и прямой удар','tsuki',22.1],
 [22.9,'Разворот и нижний блок','gedan'],[24.2,'Шаг и прямой удар','tsuki',24.45],
 [25.6,'Разворот и нижний блок','gedan'],[27,'Шаг и прямой удар','tsuki',27.05],
 [28.53,'Возврат · плавный переход','ready'],[29.73,'Начальная стойка','ready']
 ].map(([time,label,pose,impactTime])=>({time,label,pose,...(impactTime===undefined?{}:{impactTime})}))
};
export function cueIndex(cues,time){let index=0;for(let i=0;i<cues.length;i++){if(cues[i].time>time)break;index=i;}return index;}

// Phase markers use the media clock, so seeking and playback-rate changes stay aligned.
// Only movements present in this kata are shown: preparation/lower block, straight punch, ready.
const blockPhases={
 '2.4':[2.4,2.55,2.75,3.0],
 '4.8':[4.8,5.15,5.4,5.65],
 '7.4':[7.4,7.65,7.85,8.1],
 '12.5':[12.5,12.75,13.0,13.25],
 '15':[15,15.3,15.55,15.85],
 '17.8':[17.8,18.05,18.3,18.55],
 '22.9':[22.9,23.15,23.4,23.65],
 '25.6':[25.6,25.85,26.1,26.4]
};
const blockLabels=['Поворот · подготовка к блоку','Гэдан-барай · рука к плечу','Гэдан-барай · движение вниз','Гэдан-барай · завершение'];
const blockImages=['lowerStart','lowerPrepare','lowerTravel','lowerFinish'];
export const trainingVisualCues=trainingClip.cues.flatMap(cue=>cue.pose==='gedan'
 ?blockPhases[String(cue.time)].map((time,i)=>({time,label:blockLabels[i],illustration:blockImages[i],movement:'gedan',phase:i+1}))
 :[{...cue,illustration:cue.pose==='tsuki'?'middleAttack':'fudo',movement:cue.pose}]);

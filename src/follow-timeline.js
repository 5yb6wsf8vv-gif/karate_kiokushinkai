// Observation-based cues for IMG_1100.MOV. Times refer to the video clock.
export const trainingClip = {
 name:'Учебный комплекс · видео 1',
 steps:['Посмотрите на направление движения тренера.','Следуйте подсказкам «сейчас» и «далее».','Запись обрывается: завершение комплекса в ней отсутствует.'],
 url:`${import.meta.env.BASE_URL}videos/training-combination-1.mp4`,
 cues:[
 [0,'Готовность','ready'],[2.4,'Поворот и нижний блок','gedan'],[3.6,'Шаг и прямой удар','tsuki'],
 [4.8,'Разворот и нижний блок','gedan'],[6.2,'Шаг и прямой удар','tsuki'],
 [7.4,'Смена направления и блок','gedan'],[8.6,'Шаг и прямой удар','tsuki'],
 [9.9,'Ещё шаг и удар','tsuki'],[11.2,'Шаг и прямой удар','tsuki'],
 [12.5,'Разворот и нижний блок','gedan'],[13.8,'Шаг и прямой удар','tsuki'],
 [15,'Разворот и нижний блок','gedan'],[16.5,'Шаг и прямой удар','tsuki'],
 [17.8,'Смена направления и блок','gedan'],[19,'Шаг и прямой удар','tsuki'],
 [20.3,'Ещё шаг и удар','tsuki'],[21.6,'Шаг и прямой удар','tsuki'],
 [22.9,'Разворот и нижний блок','gedan'],[24.2,'Шаг и прямой удар','tsuki'],
 [25.6,'Разворот и нижний блок','gedan'],[27,'Шаг и прямой удар','tsuki'],
 [28.25,'Конец записи','ready']
 ].map(([time,label,pose])=>({time,label,pose}))
};
export function cueIndex(cues,time){let index=0;for(let i=0;i<cues.length;i++){if(cues[i].time>time)break;index=i;}return index;}

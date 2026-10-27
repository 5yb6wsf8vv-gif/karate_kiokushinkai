import {validSkinId} from '../shared/skins.js';
import {randomBytes,randomUUID} from 'node:crypto';
const token=()=>randomBytes(24).toString('hex');
const code=()=>randomBytes(4).toString('hex').slice(0,6).toUpperCase();
export class DuelError extends Error {constructor(status,message){super(message);this.status=status;}}
export class DuelEngine {
 constructor({now=Date.now,roundMs=20000,warmupMs=5000,gapMs=2500}={}){Object.assign(this,{now,roundMs,warmupMs,gapMs});this.rooms=new Map();}
 clean(){for(const [id,r]of this.rooms)if(this.now()-r.touched>1800000)this.rooms.delete(id);}
 create(name,skinId='default'){this.clean();if(this.rooms.size>=500)throw new DuelError(503,'Сервер занят. Попробуйте позже.');let id;do{id=code();}while(this.rooms.has(id));const player={name:this.name(name),skinId:validSkinId(skinId)?skinId:'default',token:token(),lastSeen:this.now(),score:0};this.rooms.set(id,{code:id,players:[player],phase:'waiting',index:0,results:[],touched:this.now()});return {code:id,token:player.token};}
 name(value){return String(value||'Игрок').trim().slice(0,24)||'Игрок';}
 room(id){const key=String(id).toUpperCase();let r=this.rooms.get(key);if(r&&this.now()-r.touched>1800000){this.rooms.delete(key);r=null;}if(!r)throw new DuelError(404,'Комната не найдена или сервер перезапустился. Создайте новую.');return r;}
 auth(id,key){const r=this.room(id);const i=r.players.findIndex(p=>p.token===key);if(i<0)throw new DuelError(401,'Нет доступа к комнате.');return [r,i];}
 join(id,name,skinId='default'){const r=this.room(id);if(r.phase!=='waiting'||r.players.length!==1)throw new DuelError(409,'В комнате уже два игрока или поединок завершён.');const p={name:this.name(name),skinId:validSkinId(skinId)?skinId:'default',token:token(),lastSeen:this.now(),score:0};r.players.push(p);r.phase='playing';this.startRound(r,this.now()+this.warmupMs);return {code:r.code,token:p.token};}
 startRound(r,at){r.round={id:randomUUID(),task:r.index,start:at,deadline:at+this.roundMs,answers:[null,null],cards:[0,1,2,3].map(slot=>({id:token(),slot}))};r.round.cards.sort(()=>Math.random()-.5);}
 advance(r){const now=this.now();if(['playing','break'].includes(r.phase)&&r.players.some(p=>now-p.lastSeen>45000)){r.phase='finished';r.reason='disconnect';const away=r.players.map(p=>now-p.lastSeen>45000);r.winner=away.every(Boolean)?null:away[0]?1:0;return;}
 if(r.phase==='playing'&&now>=r.round.deadline)this.endRound(r,null,'timeout');
 if(r.phase==='break'&&now>=r.nextAt){r.index++;r.phase='playing';this.startRound(r,now+1000);}}
 endRound(r,winner,reason){if(r.phase!=='playing')return;if(winner!==null)r.players[winner].score++;r.results.push({task:r.index,winner,reason,elapsed:winner===null?null:this.now()-r.round.start});if(r.results.length===10){r.phase='finished';r.reason='completed';r.winner=r.players[0].score===r.players[1].score?null:r.players[0].score>r.players[1].score?0:1;}else{r.phase='break';r.nextAt=this.now()+this.gapMs;}}
 view(id,key){const [r,me]=this.auth(id,key);this.advance(r);r.players[me].lastSeen=this.now();r.touched=this.now();const out={code:r.code,me,phase:r.phase,index:r.index,serverNow:this.now(),players:r.players.map(p=>({name:p.name,score:p.score,skinId:p.skinId||'default'})),results:r.results,winner:r.winner??null,reason:r.reason||null,nextAt:r.nextAt};if(r.phase==='playing')out.round={id:r.round.id,task:r.round.task,start:r.round.start,deadline:r.round.deadline,answered:r.round.answers[me]!==null,cards:r.round.cards.map(c=>({id:c.id,piece:c.slot}))};return out;}
 answer(id,key,roundId,order){const [r,me]=this.auth(id,key);this.advance(r);r.players[me].lastSeen=this.now();if(r.phase!=='playing'||r.round.id!==roundId)throw new DuelError(409,'Это задание уже закрыто.');if(this.now()<r.round.start)throw new DuelError(409,'Раунд ещё не начался.');if(r.round.answers[me]!==null)throw new DuelError(409,'Ответ уже принят.');if(!Array.isArray(order)||order.length!==4||new Set(order).size!==4||order.some(id=>!r.round.cards.some(c=>c.id===id)))throw new DuelError(400,'Выберите четыре разные карточки.');
 const correct=order.every((id,i)=>r.round.cards.find(c=>c.id===id).slot===i);r.round.answers[me]={correct,at:this.now()};if(correct)this.endRound(r,me,'correct');else if(r.round.answers.every(Boolean))this.endRound(r,null,'both-wrong');return {...this.view(id,key),accepted:correct};}
 leave(id,key){const [r,me]=this.auth(id,key);if(r.phase!=='finished'){r.phase='finished';r.reason='left';r.winner=r.players.length===2?1-me:null;}return this.view(id,key);}
}

import {DuelEngine,DuelError} from '../../multiplayer/engine.js';
const MAX_BODY=8192,ROOM_LIFETIME=30*60*1000;
const validRoom=value=>typeof value==='string'&&/^[A-F0-9]{6}$/.test(value);
const fail=(status,message)=>{throw new DuelError(status,message);};
function json(value,status=200,headers={}){return new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});}
async function bodyOf(request){
 if(Number(request.headers.get('Content-Length'))>MAX_BODY)fail(413,'Слишком большой запрос.');
 const reader=request.body?.getReader();if(!reader)return {};
 const chunks=[];let size=0;
 for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_BODY){await reader.cancel();fail(413,'Слишком большой запрос.');}chunks.push(value);}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
 try{const value=JSON.parse(new TextDecoder().decode(bytes)||'{}');if(!value||Array.isArray(value)||typeof value!=='object')throw Error();return value;}catch{fail(400,'Неверный JSON.');}
}
function roomCode(){return [...crypto.getRandomValues(new Uint8Array(3))].map(n=>n.toString(16).padStart(2,'0')).join('').toUpperCase();}
function cors(request,env){const origin=request.headers.get('Origin');const allowed=(env.ALLOWED_ORIGINS||'https://5yb6wsf8vv-gif.github.io,https://kihongo.online,https://www.kihongo.online').split(',').map(v=>v.trim());const local=env.ALLOW_LOCAL_ORIGINS==='true'&&/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin||'');if(origin&&!allowed.includes(origin)&&!local)fail(403,'Этот адрес сайта не разрешён сервером.');return {'Vary':'Origin',...(origin?{'Access-Control-Allow-Origin':origin}:{}),'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization'};}
export default {
 async fetch(request,env){let headers={};try{
  headers=cors(request,env);const url=new URL(request.url),path=url.pathname;
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(request.method==='GET'&&path==='/health')return json({ok:true,service:'kyokushin-duel',version:1,pollIntervalMs:2500},200,headers);
  const get=request.method==='GET'&&path==='/state',post=request.method==='POST'&&['/rooms','/join','/answer','/leave'].includes(path);
  if(!get&&!post)fail(404,'Не найдено.');
  if(env.REQUEST_LIMITER){const result=await env.REQUEST_LIMITER.limit({key:request.headers.get('CF-Connecting-IP')||'local'});if(!result.success)fail(429,'Слишком много запросов. Подождите минуту.');}
  const body=post?await bodyOf(request):{};
  if(path==='/rooms'){
   if(env.CREATE_LIMITER){const result=await env.CREATE_LIMITER.limit({key:request.headers.get('CF-Connecting-IP')||'local'});if(!result.success)fail(429,'Слишком много новых комнат. Подождите минуту.');}
   for(let attempt=0;attempt<5;attempt++){const code=roomCode(),stub=env.ROOMS.get(env.ROOMS.idFromName(code));const response=await stub.fetch(new Request('https://room.internal/create',{method:'POST',body:JSON.stringify({...body,room:code})}));if(response.status===409)continue;return new Response(response.body,{status:response.status,headers:{...Object.fromEntries(response.headers),...headers}});}
   fail(503,'Не удалось создать комнату. Попробуйте ещё раз.');
  }
  const code=String(get?url.searchParams.get('room')||'':body.room||'').trim().toUpperCase();if(!validRoom(code))fail(400,'Код комнаты должен содержать 6 символов: 0–9 и A–F.');
  const stub=env.ROOMS.get(env.ROOMS.idFromName(code));const response=await stub.fetch(new Request('https://room.internal'+path,{method:'POST',headers:{Authorization:request.headers.get('Authorization')||''},body:JSON.stringify({...body,room:code})}));
  return new Response(response.body,{status:response.status,headers:{...Object.fromEntries(response.headers),...headers}});
 }catch(e){return json({error:e instanceof DuelError?e.message:'Ошибка сервера.'},e instanceof DuelError?e.status:500,headers);}}
};
// One named Durable Object owns each room; all state-changing requests are serialized.
export class DuelRoom {
 constructor(ctx,env){this.ctx=ctx;this.env=env;}
 async fetch(request){return this.ctx.blockConcurrencyWhile(async()=>{
  let record=await this.ctx.storage.get('record');let engine=null,code=null;
  try{
   const body=await bodyOf(request);code=body.room;if(!validRoom(code))fail(400,'Неверный код комнаты.');
   const path=new URL(request.url).pathname,now=Date.now();
   if(record&&now>=record.expiresAt){await this.ctx.storage.deleteAll();record=null;}
   if(path==='/create'){
    if(record)fail(409,'Комната уже существует.');
    engine=new DuelEngine({roundWarmupMs:4000});const created=engine.create(body.name,body.skinId),room=engine.rooms.get(created.code);engine.rooms.clear();room.code=code;engine.rooms.set(code,room);
    record={room,createdAt:now,expiresAt:now+ROOM_LIFETIME};await this.ctx.storage.setAlarm(record.expiresAt);await this.ctx.storage.put('record',record);
    return json({code,token:created.token},201);
   }
   if(!record||record.room.code!==code)fail(404,'Комната не найдена или время её действия истекло. Создайте новую.');
   engine=new DuelEngine({roundWarmupMs:4000});engine.rooms.set(code,record.room);const token=(request.headers.get('Authorization')||'').replace(/^Bearer /,'');let result;
   if(path==='/join')result=engine.join(code,body.name,body.skinId);
   else if(path==='/state')result=engine.view(code,token);
   else if(path==='/answer')result=engine.answer(code,token,body.round,body.order);
   else if(path==='/leave')result=engine.leave(code,token);
   else fail(404,'Не найдено.');
   await this.ctx.storage.put('record',record);return json(result);
  }catch(e){
   // advance() may close a round before rejecting a late answer; keep that transition.
   if(engine&&record&&engine.rooms.has(code))await this.ctx.storage.put('record',record);
   return json({error:e instanceof DuelError?e.message:'Ошибка комнаты.'},e instanceof DuelError?e.status:500);
  }
 });}
 async alarm(){await this.ctx.blockConcurrencyWhile(async()=>{const record=await this.ctx.storage.get('record');if(record&&Date.now()<record.expiresAt){await this.ctx.storage.setAlarm(record.expiresAt);return;}await this.ctx.storage.deleteAlarm();await this.ctx.storage.deleteAll();});}
}

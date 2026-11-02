import test from 'node:test';
import assert from 'node:assert/strict';
import worker,{DuelRoom} from '../deploy/cloudflare/worker.js';
function environment(){const records=new Map(),instances=new Map();return {records,instances,ALLOWED_ORIGINS:'https://example.com',ROOMS:{idFromName:name=>name,get(name){if(!instances.has(name)){let state=records.get(name);if(!state){state={data:new Map(),alarm:null};records.set(name,state);}let queue=Promise.resolve();const storage={async get(key){return structuredClone(state.data.get(key));},async put(key,value){state.data.set(key,structuredClone(value));},async deleteAll(){state.data.clear();},async setAlarm(at){state.alarm=at;},async deleteAlarm(){state.alarm=null;}};const ctx={storage,blockConcurrencyWhile(fn){const next=queue.then(fn);queue=next.catch(()=>{});return next;}};instances.set(name,new DuelRoom(ctx,{}));}return instances.get(name);}}};}
async function api(env,path,body,token){const request=new Request('https://duel.example.org'+path,{method:body?'POST':'GET',headers:{Origin:'https://example.com',...(token?{Authorization:'Bearer '+token}:{}),'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});const r=await worker.fetch(request,env);return {status:r.status,body:await r.json(),headers:r.headers};}
test('Cloudflare room survives object recreation and completes ten timed rounds with one winner',async()=>{
 const original=Date.now;let now=1000;Date.now=()=>now;const env=environment();
 try{
  const a=(await api(env,'/rooms',{name:'Анна',skinId:'skin-1'})).body,b=(await api(env,'/join',{room:a.code,name:'Борис',skinId:'skin-2'})).body;
  env.instances.clear();assert.equal((await api(env,'/state?room='+a.code,null,a.token)).body.players.length,2);
  for(let index=0;index<10;index++){
   await api(env,'/state?room='+a.code,null,b.token);
   let s=(await api(env,'/state?room='+a.code,null,a.token)).body;
   if(s.phase==='break'){now=s.nextAt;s=(await api(env,'/state?room='+a.code,null,a.token)).body;}
   now=s.round.start;const winner=index<7?a:b;const state=(await api(env,'/state?room='+a.code,null,winner.token)).body;
   const order=state.round.cards.slice().sort((x,y)=>x.piece-y.piece).map(c=>c.id);
   const result=await api(env,'/answer',{room:a.code,round:state.round.id,order},winner.token);assert.equal(result.body.accepted,true);
   assert.equal((await api(env,'/answer',{room:a.code,round:state.round.id,order},winner.token)).status,409);
   env.instances.clear();
  }
  const end=(await api(env,'/state?room='+a.code,null,a.token)).body;assert.equal(end.phase,'finished');assert.deepEqual(end.players.map(p=>p.score),[7,3]);assert.equal(end.winner,0);assert.equal(end.results.length,10);assert.equal(JSON.stringify(end).includes(a.token),false);assert.deepEqual(end.players.map(p=>p.skinId),['skin-1','skin-2']);
 }finally{Date.now=original;}
});
test('concurrent correct answers award one point; wrong answers get no second attempt',async()=>{
 const original=Date.now;let now=1000;Date.now=()=>now;const env=environment();
 try{const a=(await api(env,'/rooms',{name:'A'})).body,b=(await api(env,'/join',{room:a.code,name:'B'})).body;let s=(await api(env,'/state?room='+a.code,null,a.token)).body;now=s.round.start;
 const order=s.round.cards.slice().sort((x,y)=>x.piece-y.piece).map(c=>c.id);
 const results=await Promise.all([api(env,'/answer',{room:a.code,round:s.round.id,order},a.token),api(env,'/answer',{room:a.code,round:s.round.id,order},b.token)]);assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);
 s=(await api(env,'/state?room='+a.code,null,a.token)).body;assert.equal(s.players.reduce((n,p)=>n+p.score,0),1);now=s.nextAt;s=(await api(env,'/state?room='+a.code,null,a.token)).body;now=s.round.start;
 const wrong=s.round.cards.slice().sort((x,y)=>y.piece-x.piece).map(c=>c.id);assert.equal((await api(env,'/answer',{room:a.code,round:s.round.id,order:wrong},a.token)).body.accepted,false);assert.equal((await api(env,'/answer',{room:a.code,round:s.round.id,order:wrong},a.token)).status,409);
 }finally{Date.now=original;}
});
test('Worker enforces CORS, tokens, JSON/body size and rate limits before allocating rooms',async()=>{
 const env=environment();assert.equal((await worker.fetch(new Request('https://duel.example.org/health',{headers:{Origin:'https://evil.example'}}),env)).status,403);
 const a=await api(env,'/rooms',{name:'A'});assert.equal(a.headers.get('Access-Control-Allow-Origin'),'https://example.com');assert.equal((await api(env,'/state?room='+a.body.code,null,'bad')).status,401);
 assert.equal((await api(env,'/state?room=INVALID')).status,400);
 for(const raw of ['null','[]','invalid'])assert.equal((await worker.fetch(new Request('https://duel.example.org/rooms',{method:'POST',body:raw}),env)).status,400);
 assert.equal((await worker.fetch(new Request('https://duel.example.org/rooms',{method:'POST',body:'a'.repeat(9000)}),env)).status,413);
 const limited={...environment(),CREATE_LIMITER:{async limit(){return {success:false};}}};assert.equal((await api(limited,'/rooms',{name:'A'})).status,429);assert.equal(limited.records.size,0);
});
test('rooms expire absolutely after thirty minutes and alarms remove stored game state',async()=>{
 const original=Date.now;let now=1000;Date.now=()=>now;const env=environment();
 try{const a=(await api(env,'/rooms',{name:'A'})).body;const room=env.ROOMS.get(a.code),record=env.records.get(a.code);assert.equal(record.alarm,now+1800000);
  now+=1000;await room.alarm();assert.ok(record.data.has('record'));now+=1800000;await room.alarm();assert.equal(record.data.size,0);assert.equal((await api(env,'/state?room='+a.code,null,a.token)).status,404);
 }finally{Date.now=original;}
});

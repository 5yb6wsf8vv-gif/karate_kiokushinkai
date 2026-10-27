import test from 'node:test';
import assert from 'node:assert/strict';
import {DuelEngine,DuelError} from '../multiplayer/engine.js';
import {createDuelServer} from '../multiplayer/server.js';
test('ten server-timed rounds award only first correct, never client-provided scores',()=>{
 let now=0;const e=new DuelEngine({now:()=>now,warmupMs:0,gapMs:0});const a=e.create('A'),b=e.join(a.code,'B');
 for(let i=0;i<10;i++){
  let s=e.view(a.code,a.token);if(s.phase==='break'){now+=1000;s=e.view(a.code,a.token);now+=1000;s=e.view(a.code,a.token);}
  if(s.round&&now<s.round.start)now=s.round.start;
  const winner=i<7?a:b;const cards=e.view(winner.code,winner.token).round.cards;
  const order=cards.slice().sort((x,y)=>x.piece-y.piece).map(c=>c.id);
  e.answer(a.code,winner.token,s.round.id,order);
  assert.throws(()=>e.answer(a.code,winner.token,s.round.id,order),DuelError);
  now+=10;
 }
 const end=e.view(a.code,a.token);assert.equal(end.phase,'finished');assert.deepEqual(end.players.map(p=>p.score),[7,3]);assert.equal(end.winner,0);assert.equal(end.results.length,10);
 assert.throws(()=>e.view(a.code,'bad'),DuelError);assert.equal(JSON.stringify(end).includes(a.token),false);
});
test('wrong answer is final; timeout awards no point; explicit leave forfeits',()=>{
 let now=0;const e=new DuelEngine({now:()=>now,warmupMs:0});const a=e.create('A'),b=e.join(a.code,'B');const s=e.view(a.code,a.token);
 const order=s.round.cards.slice().sort((x,y)=>y.piece-x.piece).map(c=>c.id);
 e.answer(a.code,a.token,s.round.id,order);assert.throws(()=>e.answer(a.code,a.token,s.round.id,order),DuelError);
 now=20001;assert.equal(e.view(a.code,b.token).phase,'break');assert.deepEqual(e.view(a.code,a.token).players.map(p=>p.score),[0,0]);
 assert.equal(e.leave(a.code,a.token).winner,1);
});
test('HTTP service checks origins, room authentication and has functional health',async()=>{
 const server=createDuelServer({origins:['https://example.com']});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 try{const base='http://127.0.0.1:'+server.address().port;
 assert.equal((await fetch(base+'/health')).status,200);
 assert.equal((await fetch(base+'/health',{headers:{Origin:'https://bad.example'}})).status,403);
 const response=await fetch(base+'/rooms',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://example.com'},body:JSON.stringify({name:'A'})});
 assert.equal(response.status,201);const room=await response.json();
 assert.equal((await fetch(base+'/state?room='+room.code)).status,401);
 const state=await fetch(base+'/state?room='+room.code,{headers:{Authorization:'Bearer '+room.token}});assert.equal(state.status,200);assert.equal((await state.json()).phase,'waiting');
 }finally{await new Promise(r=>server.close(r));}
});
test('disconnect and expired rooms cannot be revived by a late poll',()=>{
 let now=0;const e=new DuelEngine({now:()=>now,warmupMs:0});const a=e.create('A'),b=e.join(a.code,'B');
 now=30000;e.view(a.code,a.token);now=46000;assert.equal(e.view(a.code,a.token).winner,0);
 const c=e.create('C'),d=e.join(c.code,'D');now+=46000;const ended=e.view(c.code,c.token);assert.equal(ended.phase,'finished');assert.equal(ended.winner,null);
 const waiting=e.create('Waiting');now+=1800001;assert.throws(()=>e.view(waiting.code,waiting.token),DuelError);
});

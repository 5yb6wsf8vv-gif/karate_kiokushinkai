import test from 'node:test';import assert from 'node:assert/strict';
import {movementQuiz,movementById,correctMovementPiece} from '../shared/movement-quiz.js';
import {DuelEngine} from '../multiplayer/engine.js';
import {illustrationPoses} from '../src/technique-illustrations.js';
test('recognition has ten rounds, both directions and four distinct illustrated choices',()=>{
 assert.equal(movementQuiz.length,10);assert.equal(new Set(movementQuiz.map(q=>q.target)).size,9);
 assert.equal(movementQuiz.filter(q=>q.mode==='name-to-image').length,5);
 for(const q of movementQuiz){assert.equal(new Set(q.options).size,4);assert.ok(q.options.includes(q.target));for(const id of q.options)assert.ok(illustrationPoses[movementById(id).pose]);}
});
test('recognition server scores ten single-choice rounds and never permits a second try',()=>{
 let now=100;const e=new DuelEngine({now:()=>now,warmupMs:0,gapMs:0,roundWarmupMs:0});
 const a=e.create('A','default','recognition-v2'),b=e.join(a.code,'B');
 for(let i=0;i<10;i++){
  const s=e.view(a.code,a.token),r=s.round;
  assert.equal(s.format,'recognition-v2');
  const piece=correctMovementPiece(i),wrong=r.cards.find(c=>c.piece!==piece).id,right=r.cards.find(c=>c.piece===piece).id;
  assert.equal(e.answer(a.code,a.token,r.id,[wrong]).accepted,false);
  assert.throws(()=>e.answer(a.code,a.token,r.id,[right]),/Ответ уже принят/);
  assert.equal(e.answer(b.code,b.token,r.id,[right]).accepted,true);now++;
 }
 const result=e.view(a.code,a.token);assert.equal(result.phase,'finished');assert.equal(result.winner,1);assert.equal(result.players[1].score,10);
});

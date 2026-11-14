import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {basicKicks} from '../shared/basic-kicks.js';
import {terms,techniques} from '../src/data.js';import {illustrationForTerm,illustrationForTechnique,illustrationPoses} from '../src/technique-illustrations.js';
import {relayTasks} from '../src/relay.js';import {examQuestions} from '../src/curriculum.js';
import {movementQuizPool,quizForFormat} from '../shared/movement-quiz.js';import {DuelEngine} from '../multiplayer/engine.js';
test('four basic leg raises share four steps, audio-backed terms and all exercise catalogues',()=>{
 for(const k of basicKicks){
  assert.ok(techniques.some(t=>t.id===k.id));assert.ok(terms.some(t=>t.id===k.id));
  const steps=illustrationForTechnique(k.id);assert.equal(steps.length,4);assert.deepEqual(illustrationForTerm(k.id),steps);
  assert.ok(illustrationPoses[steps[2].pose].motion);
  for(const stage of relayTasks)assert.ok(stage.some(t=>t.technique===k.id));
  assert.ok(examQuestions.some(q=>q.imageOptions?.includes(steps[2].pose)));
  assert.equal(movementQuizPool.filter(q=>q.target===k.id).length,2);
 }
});
test('expanded kumite draws ten unique questions, balanced directions and validates card choices',()=>{
 let now=100;const e=new DuelEngine({now:()=>now,warmupMs:0,gapMs:0,roundWarmupMs:0});
 const a=e.create('A','default','recognition-v3');e.join(a.code,'B');const ids=[];
 for(let i=0;i<10;i++){
  const s=e.view(a.code,a.token),q=quizForFormat(s.format)[s.round.task];ids.push(q.id);
  assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);
  const piece=q.options.indexOf(q.target),card=s.round.cards.find(c=>c.piece===piece);
  assert.equal(e.answer(a.code,a.token,s.round.id,[card.id]).accepted,true);now++;
 }
 assert.equal(new Set(ids).size,10);assert.equal(ids.filter(id=>movementQuizPool[id].mode==='name-to-image').length,5);
 assert.equal(e.view(a.code,a.token).players[0].score,10);
});
test('light theme uses flat surfaces with no CSS gradients',()=>{
 assert.ok(!readFileSync(new URL('../src/light.css',import.meta.url),'utf8').includes('gradient('));
});

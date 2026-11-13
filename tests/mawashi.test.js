import test from 'node:test';import assert from 'node:assert/strict';
import {terms,techniques} from '../src/data.js';
import {illustrationForTerm,illustrationForTechnique} from '../src/technique-illustrations.js';
import {relayTasks} from '../src/relay.js';import {examQuestions} from '../src/curriculum.js';
import {movementQuiz,legacyMovementQuiz,correctMovementPiece} from '../shared/movement-quiz.js';
import {DuelEngine} from '../multiplayer/engine.js';
test('mawashi has four shared steps across practice and terms, appears in every relay and both kumite directions',()=>{
 assert.equal(techniques.find(t=>t.id==='mawashigeri').category,'Удары ногами');
 assert.equal(terms.find(t=>t.id==='mawashi').kana,'まわしげり');
 const steps=illustrationForTechnique('mawashigeri');assert.equal(steps.length,4);assert.deepEqual(illustrationForTerm('mawashi'),steps);
 for(const stage of relayTasks)assert.ok(stage.some(t=>t.technique==='mawashigeri'));
 assert.ok(examQuestions.some(q=>q.image==='mawashiStrike'));
 assert.deepEqual(movementQuiz.filter(q=>q.target==='mawashi').map(q=>q.mode),['name-to-image','image-to-name']);
});
test('existing recognition-v1 rooms retain their original answers after catalogue update',()=>{
 let now=100;const engine=new DuelEngine({now:()=>now,warmupMs:0,gapMs:0,roundWarmupMs:0});
 const a=engine.create('A','default','recognition-v1');engine.join(a.code,'B');
 for(const q of legacyMovementQuiz){const state=engine.view(a.code,a.token);const id=state.round.cards.find(c=>c.piece===correctMovementPiece(q.id,'recognition-v1')).id;assert.equal(engine.answer(a.code,a.token,state.round.id,[id]).accepted,true);now++;}
 assert.equal(engine.view(a.code,a.token).players[0].score,10);
});

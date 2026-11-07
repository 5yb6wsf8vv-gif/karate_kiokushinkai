import test from 'node:test';import assert from 'node:assert/strict';
import {kumiteTasks,exerciseCard,exerciseName} from '../src/kumite-tasks.js';
import {DuelEngine} from '../multiplayer/engine.js';
test('ten movement combinations have four distinct illustrated exercise cards',()=>{
 assert.equal(kumiteTasks.length,10);assert.equal(new Set(kumiteTasks.map(t=>t.steps.join(','))).size,10);
 for(const task of kumiteTasks){assert.equal(task.steps.length,4);assert.equal(new Set(task.steps).size,4);for(let slot=0;slot<4;slot++){assert.ok(exerciseName(task.id,slot));assert.ok(exerciseCard(task.id,slot).includes('data-movement="'+task.steps[slot]+'"'));assert.ok(exerciseCard(task.id,slot).includes('<svg'));}}
 assert.equal(exerciseCard(99,0),'');
});
test('server starts each task with shuffled cards and checks the four movement positions',()=>{
 const engine=new DuelEngine({warmupMs:0});const a=engine.create('A');engine.join(a.code,'B');const state=engine.view(a.code,a.token);assert.equal(state.round.cards.length,4);assert.notDeepEqual(state.round.cards.map(c=>c.piece),[0,1,2,3]);const order=state.round.cards.slice().sort((a,b)=>a.piece-b.piece).map(c=>c.id);assert.equal(engine.answer(a.code,a.token,state.round.id,order).accepted,true);
});

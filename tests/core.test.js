import test from 'node:test';
import assert from 'node:assert/strict';
import {schedule,load,save,dueItems,DAY} from '../src/core.js';
test('grades schedule exact due dates and bounded increasing intervals',()=>{
 const now=1000000;
 assert.equal(schedule({},'again',now).due,now+600000);
 assert.equal(schedule({},'hard',now).due,now+DAY);
 const first=schedule({},'easy',now);assert.equal(first.interval,3);
 assert.equal(schedule(first,'easy',now).interval,6);
 assert.equal(schedule({interval:60},'easy',now).interval,60);
 assert.equal(schedule(first,'again',now).learned,false);
 assert.throws(()=>schedule({},'bad',now));
});
test('only reviewed, due items enter repeat queue including exact boundary',()=>{
 const items=[{id:'a'},{id:'b'},{id:'c'}];
 assert.deepEqual(dueItems(items,{a:{due:100},b:{due:101}},100),[{id:'a'}]);
});
test('progress round trip and corrupt storage recovery',()=>{
 let raw=null;const storage={getItem:()=>raw,setItem:(k,v)=>raw=v};
 const state=load(storage);state.terms.rei=schedule({},'easy',100);state.sessions.push({finished:200});
 assert.equal(save(storage,state),true);assert.deepEqual(load(storage),state);
 raw='{bad';assert.deepEqual(load(storage).terms,{});
 assert.equal(save({setItem(){throw Error('full');}},state),false);
});

import {lessons,examQuestions,examReady,examPassed,unlocked} from '../src/curriculum.js';
test('32 unique lessons, valid answers and sequential unlocks',()=>{
 assert.equal(lessons.length,32);assert.equal(new Set(lessons.map(l=>l.id)).size,32);
 for(const l of lessons){assert.equal(l.options.length,3);assert.ok(l.options.includes(l.answer));assert.equal(l.body.length,2);}
 assert.equal(unlocked({},1),true);assert.equal(unlocked({},2),false);assert.equal(unlocked({1:{passed:true}},2),true);
});
test('final exam requires every lesson passed AND reviewed',()=>{
 const p=Object.fromEntries(lessons.map(l=>[l.id,{passed:true,reviewed:true}]));
 assert.equal(examReady(p),true);p[32].reviewed=false;assert.equal(examReady(p),false);
 p[32].reviewed=true;p[1].passed=false;assert.equal(examReady(p),false);
});
test('exam requires two correct answers per block, not just total score',()=>{
 const results=examQuestions.map(q=>({block:q.block,correct:true}));assert.equal(examPassed(results),true);
 results[0].correct=false;assert.equal(examPassed(results),true);
 results[1].correct=false;assert.equal(examPassed(results),false);
 assert.equal(examPassed(results.slice(1)),false);
});

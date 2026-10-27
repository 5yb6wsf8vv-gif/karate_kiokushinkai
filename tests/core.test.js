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
test('final exam requires one pass without mandatory repeat',()=>{
 const p=Object.fromEntries(lessons.map(l=>[l.id,{passed:true,reviewed:true}]));
 assert.equal(examReady(p),true);p[32].reviewed=false;assert.equal(examReady(p),true);
 p[32].reviewed=true;p[1].passed=false;assert.equal(examReady(p),false);
});
test('exam requires two correct answers per block, not just total score',()=>{
 const results=examQuestions.map(q=>({block:q.block,correct:true}));assert.equal(examPassed(results),true);
 results[0].correct=false;assert.equal(examPassed(results),true);
 results[1].correct=false;assert.equal(examPassed(results),false);
 assert.equal(examPassed(results.slice(1)),false);
});

import {dojoKun,correctDojoOrder} from '../src/dojo.js';
test('dojo kun requires all seven unique phrases in photo order',()=>{
 assert.equal(dojoKun.length,7);
 assert.equal(correctDojoOrder([0,1,2,3,4,5,6]),true);
 for(const wrong of [[],[0,1,2],[1,0,2,3,4,5,6],[0,0,2,3,4,5,6],[0,1,2,3,4,5,6,7]])assert.equal(correctDojoOrder(wrong),false);
});


import {ensureEconomy,changeXP,recordReview} from '../src/core.js';
test('XP migration preserves legacy earnings once and penalties persist',()=>{
 const s={course:{lessons:{1:{passed:true,reviewed:true},2:{passed:true}}}};
 assert.equal(ensureEconomy(s).xp,50);changeXP(s,-1);s.course.lessons[3]={passed:true};
 assert.equal(ensureEconomy(s).xp,49);
 const storage={getItem:()=>null,setItem(){}};const fresh=load(storage);assert.equal(changeXP(fresh,-1),-1);
});
test('review awards five XP only on each tenth correct answer',()=>{
 const s={};for(let i=1;i<=9;i++)assert.equal(recordReview(s),0);assert.equal(s.economy.xp,0);
 assert.equal(recordReview(s),5);assert.equal(s.economy.xp,5);changeXP(s,-1);
 for(let i=11;i<=19;i++)assert.equal(recordReview(s),0);
 assert.equal(recordReview(s),5);assert.equal(s.economy.reviewCorrect,20);assert.equal(s.economy.xp,9);
});

import {relayTasks,relayPassed,validRelayOrder} from '../src/relay.js';
test('four relays have ten valid image-sequence tasks and threshold seven',()=>{
 assert.equal(relayTasks.length,4);
 for(const tasks of relayTasks){assert.equal(tasks.length,10);for(const task of tasks){assert.ok(task.steps.length>=3);assert.equal(validRelayOrder(task,task.steps.map(s=>s.id)),true);assert.equal(validRelayOrder(task,task.steps.map(()=>0)),false);}}
 assert.equal(relayPassed(Array.from({length:10},(_,i)=>({correct:i<7}))),true);
 assert.equal(relayPassed(Array.from({length:10},(_,i)=>({correct:i<6}))),false);
 assert.equal(relayPassed(Array.from({length:7},()=>({correct:true}))),false);
});

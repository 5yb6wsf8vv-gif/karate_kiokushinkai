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

import test from 'node:test';import assert from 'node:assert/strict';
import {recordVisit,restoreStreak,visitDay,createStreak} from '../src/streak.js';
const at=date=>Date.parse(date+'T12:00:00+03:00');
test('Moscow calendar boundaries count daily visits once across month/year changes',()=>{
 assert.equal(visitDay(Date.parse('2026-12-31T20:59:59Z'))+1,visitDay(Date.parse('2026-12-31T21:00:00Z')));
 const s={};assert.equal(recordVisit(s,at('2026-12-31')),true);assert.equal(recordVisit(s,at('2026-12-31')),false);recordVisit(s,at('2027-01-01'));assert.equal(s.streak.count,2);
});
test('one skipped day can be restored for 100 XP exactly once',()=>{
 const s={economy:{xp:100,reviewCorrect:0}};recordVisit(s,at('2026-11-01'));recordVisit(s,at('2026-11-02'));recordVisit(s,at('2026-11-04'));assert.ok(s.streak.restore);assert.equal(restoreStreak(s,at('2026-11-04')).ok,true);assert.equal(s.streak.count,4);assert.equal(s.economy.xp,0);assert.equal(restoreStreak(s,at('2026-11-04')).ok,false);assert.equal(s.economy.xp,0);
});
test('insufficient XP keeps recovery available; two missed days reset without recovery',()=>{
 const s={economy:{xp:99,reviewCorrect:0}};recordVisit(s,at('2026-11-01'));recordVisit(s,at('2026-11-03'));assert.equal(restoreStreak(s,at('2026-11-03')).ok,false);assert.equal(s.economy.xp,99);assert.ok(s.streak.restore);recordVisit(s,at('2026-11-04'));assert.equal(s.streak.count,2);assert.equal(s.streak.restore,undefined);recordVisit(s,at('2026-11-07'));assert.equal(s.streak.count,1);assert.equal(s.streak.restore,undefined);
});
test('failed persistence rolls back restore and its XP charge',()=>{
 const now=Date.now(),s={economy:{xp:100,reviewCorrect:0},streak:{lastDay:visitDay(now),count:1,restore:{day:visitDay(now),previousCount:5}}};const previous=structuredClone(s);const lantern=createStreak(s,()=>false);lantern.handle('streak-restore');assert.deepEqual(s,previous);
});

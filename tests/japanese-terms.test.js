import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {terms} from '../src/data.js';
import {migrateTermProgress,termAliases} from '../src/japanese-terms.js';
test('unified deck preserves base IDs, covers all program IDs and has bundled Japanese audio',()=>{
 assert.equal(terms.length,80);assert.equal(new Set(terms.map(t=>t.id)).size,80);
 assert.deepEqual(terms.slice(0,10).map(t=>t.id),['osu','rei','hajime','yame','dachi','tsuki','geri','uke','mae','dojo']);
 for(const term of terms){assert.match(term.jp,/[\u3040-\u30ff\u4e00-\u9fff]/);assert.match(term.kana,/^[\u3040-\u309f、ー]+$/);assert.ok(existsSync(new URL(`../public/audio/ja/${term.id}.mp3`,import.meta.url)));}
 for(const [id,target]of Object.entries(termAliases)){assert.ok(!terms.some(t=>t.id===id));assert.ok(terms.some(t=>t.id===target));}
 const sources=JSON.parse(readFileSync(new URL('../public/audio/japanese-sources.json',import.meta.url)));assert.equal(sources.terms.length,terms.length);
});
test('duplicate progress migration is idempotent and keeps the latest assessment',()=>{
 const state={terms:{osu:{reviews:1,interval:3,due:3*86400000,learned:true},'p10-greetings-1':{reviews:2,interval:0,due:600001,learned:false},'p10-count-1':{reviews:4,learned:true}}};
 migrateTermProgress(state);assert.equal(state.terms.osu.reviews,3);assert.equal(state.terms.osu.learned,false);assert.equal(state.terms.osu.due,600001);assert.equal(state.terms['p10-count-1'].reviews,4);assert.ok(!state.terms['p10-greetings-1']);
 const before=JSON.stringify(state);migrateTermProgress(state);assert.equal(JSON.stringify(state),before);
});

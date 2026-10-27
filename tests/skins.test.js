import test from 'node:test';
import assert from 'node:assert/strict';
import {buySkin,equipSkin,ensureCosmetics,createShop} from '../src/shop.js';
import {DuelEngine} from '../multiplayer/engine.js';
test('skin purchases spend XP once, reject insufficient funds and equip owned only',()=>{
 const s={economy:{xp:150,reviewCorrect:0}};ensureCosmetics(s);
 assert.equal(equipSkin(s,'skin-3'),false);assert.equal(buySkin(s,'skin-3').ok,true);assert.equal(s.economy.xp,0);assert.equal(s.cosmetics.equipped,'skin-3');
 assert.equal(buySkin(s,'skin-3').ok,false);assert.equal(s.economy.xp,0);assert.equal(buySkin(s,'skin-1').ok,false);assert.equal(buySkin(s,'missing').ok,false);
 assert.equal(equipSkin(s,'default'),true);assert.equal(s.economy.xp,0);assert.equal(equipSkin(s,'skin-3'),true);
});
test('failed storage transaction rolls back XP and ownership',()=>{
 const s={economy:{xp:100,reviewCorrect:0}};const shop=createShop(s,()=>false);
 shop.handle('skin-buy','skin-1');assert.equal(s.economy.xp,100);assert.deepEqual(s.cosmetics.owned,[]);assert.equal(s.cosmetics.equipped,'default');
});
test('server shares validated avatars for both players and supports old clients',()=>{
 const e=new DuelEngine();const a=e.create('A','skin-1'),b=e.join(a.code,'B','skin-2');
 assert.deepEqual(e.view(a.code,b.token).players.map(p=>p.skinId),['skin-1','skin-2']);
 const c=e.create('C','https://untrusted/image.png'),d=e.join(c.code,'D');
 assert.deepEqual(e.view(c.code,d.token).players.map(p=>p.skinId),['default','default']);
});

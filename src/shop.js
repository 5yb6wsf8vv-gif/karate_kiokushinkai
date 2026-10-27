const skinsImage = new URL('./assets/karate-skins.png', import.meta.url).href;
import {skinCatalog,skinById,defaultSkin} from '../shared/skins.js';
import {ensureEconomy,changeXP} from './core.js';
export function ensureCosmetics(state){
 state.cosmetics??={owned:[],equipped:'default'};
 const owned=Array.isArray(state.cosmetics.owned)?state.cosmetics.owned:[];
 state.cosmetics.owned=[...new Set(owned.filter(id=>skinCatalog.some(s=>s.id===id)))];
 if(state.cosmetics.equipped!=='default'&&!state.cosmetics.owned.includes(state.cosmetics.equipped))state.cosmetics.equipped='default';
 return state.cosmetics;
}
export function buySkin(state,id){
 const skin=skinCatalog.find(s=>s.id===id);const c=ensureCosmetics(state);
 if(!skin)return {ok:false,message:'Скин не найден.'};
 if(c.owned.includes(id))return {ok:false,message:'Этот скин уже куплен.'};
 if(ensureEconomy(state).xp<skin.price)return {ok:false,message:'Недостаточно XP.'};
 changeXP(state,-skin.price);c.owned.push(id);c.equipped=id;
 return {ok:true,message:skin.name+' куплен и выбран.'};
}
export function equipSkin(state,id){const c=ensureCosmetics(state);if(id!=='default'&&!c.owned.includes(id))return false;c.equipped=id;return true;}
export function avatar(id,cls=''){
 const skin=skinById(id);
 return `<span class="player-avatar ${cls}" role="img" aria-label="Аватар: ${skin.name}" data-skin="${skin.id}"><span class="skin-art" style="background-image:url('${skinsImage}');background-position:${skin.position}"></span></span>`;
}
export function createShop(state,persist){
 ensureCosmetics(state);let message='';
 function view(){const c=ensureCosmetics(state),xp=ensureEconomy(state).xp;
 return `<h1>Магазин скинов</h1><p class="intro">Покупайте аватарки за заработанные XP и выбирайте образ для поединков.</p><div class="shop-wallet"><b>${xp} XP</b><span>Доступно для покупок</span></div><div class="notice">Четыре бойца — один путь. Онигири доступен бесплатно, остальные образы можно открыть за XP.</div><div class="skin-grid">${skinCatalog.map(s=>{const owned=c.owned.includes(s.id),active=c.equipped===s.id;return `<article class="card skin-card" data-shop-skin="${s.id}"><div class="skin-placeholder">${avatar(s.id)}</div><h2>${s.name}</h2><p class="skin-description">${s.description}</p><p>${s.price} XP${owned?' · Куплен':''}</p><button class="${active?'selected':'primary'}" data-action="${owned?'skin-equip':'skin-buy'}:${s.id}" ${active||!owned&&xp<s.price?'disabled':''}>${active?'Выбран':owned?'Выбрать':'Купить за '+s.price+' XP'}</button>${!owned&&xp<s.price?`<p class="muted">Не хватает ${s.price-xp} XP</p>`:''}</article>`;}).join('')}</div><section class="card base-avatar">${avatar('default')}<div><h2>${defaultSkin.name}</h2><p class="muted">${defaultSkin.description}</p><p>Бесплатно</p><button class="secondary" data-action="skin-equip:default" ${c.equipped==='default'?'disabled':''}>${c.equipped==='default'?'Выбрана':'Выбрать базовую'}</button></div></section><p class="feedback" role="status">${message||'Выбранная аватарка передаётся сопернику при создании комнаты или входе в неё.'}</p><p class="muted">Покупки и XP хранятся в этом браузере. Скин не меняет счёт и скорость в поединке.</p>`;}
 return {view,handle(a,v){if(a!=='skin-buy'&&a!=='skin-equip')return false;const before={economy:{...ensureEconomy(state)},cosmetics:{owned:[...state.cosmetics.owned],equipped:state.cosmetics.equipped}};
 if(a==='skin-buy'){const r=buySkin(state,v);message=r.message;if(!r.ok)return true;}
 else{if(!equipSkin(state,v)){message='Сначала купите этот скин.';return true;}message='Аватарка выбрана.';}
 if(!persist()){state.economy=before.economy;state.cosmetics=before.cosmetics;message='Не удалось сохранить покупку или выбор. XP не списаны. Проверьте хранилище браузера.';}
 return true;}};
}

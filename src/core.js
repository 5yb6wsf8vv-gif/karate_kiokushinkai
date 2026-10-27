export const DAY = 86400000;
export function schedule(previous = {}, grade, now = Date.now()) {
  if (!['again','hard','easy'].includes(grade)) throw new Error('Unknown grade');
  const interval = grade === 'again' ? 0 : grade === 'hard' ? 1 : Math.min(60, Math.max(3, (previous.interval || 1) * 2));
  return { interval, due: now + (grade === 'again' ? 10 * 60000 : interval * DAY), reviews: (previous.reviews || 0) + 1, learned: grade !== 'again' };
}
export function load(storage) {
  try { const value = JSON.parse(storage.getItem('kyokushin-v1')); if (value?.version === 1 && value.terms && value.techniques && Array.isArray(value.sessions) && value.program) return value; } catch {}
  return {version:1,terms:{},techniques:{},sessions:[],program:{organization:'Демонстрационная программа',notes:'',enabled:[]}};
}
export function save(storage, state) { try { storage.setItem('kyokushin-v1', JSON.stringify(state)); return true; } catch { return false; } }
export function dueItems(items, progress, now = Date.now()) { return items.filter(item => progress[item.id] && progress[item.id].due <= now); }

// Разовая миграция сохраняет уже заработанные XP старой версии.
export function ensureEconomy(state) {
 if (!state.economy) {
  const entries=Object.values(state.course?.lessons||{});
  state.economy={xp:entries.filter(l=>l.passed).length*20+entries.filter(l=>l.reviewed).length*10,reviewCorrect:0};
 }
 return state.economy;
}
export function changeXP(state,delta) {const e=ensureEconomy(state);e.xp+=delta;return e.xp;}
export function recordReview(state) {
 const e=ensureEconomy(state);e.reviewCorrect++;
 const bonus=e.reviewCorrect%10===0?5:0;e.xp+=bonus;return bonus;
}

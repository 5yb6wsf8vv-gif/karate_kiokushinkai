import {DatabaseSync} from 'node:sqlite';
import {randomBytes,randomInt,createHash,timingSafeEqual} from 'node:crypto';
import {mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
const hash=s=>createHash('sha256').update(s).digest('hex');
const secret=()=>randomBytes(32).toString('base64url');
export class AuthError extends Error{constructor(status,message){super(message);this.status=status;}}
const fail=(status,message)=>{throw new AuthError(status,message);};
export function courseNumber(value){const n=String(value??'').trim();if(!/^[1-4]$/.test(n))fail(400,'Укажите номер курса от 1 до 4.');return n;}
export function createAuthService({filename='data/accounts.sqlite',appUrl='',vkClientId='',sendMail=null,fetcher=fetch,now=Date.now}={}){
 if(filename!==':memory:')mkdirSync(dirname(filename),{recursive:true});
 const db=new DatabaseSync(filename);db.exec(`PRAGMA journal_mode=WAL;
 CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,email TEXT UNIQUE,vk_id TEXT UNIQUE,name TEXT NOT NULL,course TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS codes(email TEXT PRIMARY KEY,digest TEXT NOT NULL,expires INTEGER NOT NULL,attempts INTEGER NOT NULL,sent INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS sessions(digest TEXT PRIMARY KEY,user_id TEXT NOT NULL,expires INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS oauth(digest TEXT PRIMARY KEY,verifier TEXT NOT NULL,expires INTEGER NOT NULL);
 `);
 let redirect='';if(appUrl){const u=new URL(appUrl);if(u.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(u.hostname))throw Error('PUBLIC_APP_URL requires HTTPS');u.hash='';u.search='';redirect=u.href;}
 const profile=row=>({id:row.id,email:row.email,name:row.name,course:row.course,provider:row.vk_id?'vk':'email'});
 function clean(){db.prepare('DELETE FROM sessions WHERE expires<?').run(now());db.prepare('DELETE FROM oauth WHERE expires<?').run(now());db.prepare('DELETE FROM codes WHERE expires<?').run(now()-86400000);}
 function session(row){clean();const token=secret();db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(hash(token),row.id,now()+30*86400000);return {token,user:profile(row)};}
 function user(token){const row=db.prepare('SELECT users.* FROM sessions JOIN users ON users.id=sessions.user_id WHERE digest=? AND expires>?').get(hash(String(token)),now());if(!row)fail(401,'Войдите в аккаунт заново.');return row;}
 function emailAddress(value){const email=String(value??'').trim().toLowerCase();if(email.length>254||!/^\S+@[^\s@]+\.[^\s@]+$/.test(email))fail(400,'Укажите корректную почту.');return email;}
 return {
 close(){db.close();},
 async handle(path,body,token){
  if(path==='/config')return {email:!!sendMail,vk:!!(vkClientId&&redirect)};
  if(path==='/email/start'){
   if(!sendMail)fail(503,'Вход по почте ещё не настроен администратором.');
   const email=emailAddress(body.email),old=db.prepare('SELECT * FROM codes WHERE email=?').get(email);
   if(old&&now()-old.sent<60000)fail(429,'Повторный код можно запросить через минуту.');
   clean();const code=String(randomInt(100000,1000000));db.prepare('INSERT OR REPLACE INTO codes VALUES(?,?,?,?,?)').run(email,hash(email+':'+code),now()+600000,0,now());
   try{await sendMail(email,code);}catch{db.prepare('DELETE FROM codes WHERE email=?').run(email);fail(502,'Не удалось отправить письмо. Попробуйте позже.');}
   return {ok:true,message:'Код отправлен. Проверьте входящие и папку «Спам».'};
  }
  if(path==='/email/verify'){
   const email=emailAddress(body.email),row=db.prepare('SELECT * FROM codes WHERE email=?').get(email),digest=hash(email+':'+String(body.code??''));
   if(!row||row.expires<=now()||row.attempts>=5)fail(400,'Код истёк или недоступен. Запросите новый.');
   db.prepare('UPDATE codes SET attempts=attempts+1 WHERE email=?').run(email);
   if(!timingSafeEqual(Buffer.from(digest),Buffer.from(row.digest)))fail(400,'Неверный код.');
   const course=courseNumber(body.course);let u=db.prepare('SELECT * FROM users WHERE email=?').get(email);
   db.prepare('DELETE FROM codes WHERE email=?').run(email);
   const name=String(body.name||u?.name||'Игрок').trim().slice(0,60)||'Игрок';
   if(!u){u={id:secret(),email,vk_id:null,name,course};db.prepare('INSERT INTO users VALUES(?,?,?,?,?)').run(u.id,email,null,name,course);}
   else{db.prepare('UPDATE users SET name=?,course=? WHERE id=?').run(name,course,u.id);u={...u,name,course};}
   return session(u);
  }
  if(path==='/vk/start'){
   if(!vkClientId||!redirect)fail(503,'VK ID ещё не настроен администратором.');
   clean();const state=secret(),verifier=secret();db.prepare('INSERT INTO oauth VALUES(?,?,?)').run(hash(state),verifier,now()+600000);
   const params=new URLSearchParams({response_type:'code',client_id:vkClientId,redirect_uri:redirect,state,code_challenge: createHash('sha256').update(verifier).digest('base64url'),code_challenge_method:'S256',scope:'vkid.personal_info'});
   return {state,url:'https://id.vk.com/authorize?'+params};
  }
  if(path==='/vk/finish'){
   if(!vkClientId||!redirect)fail(503,'VK ID ещё не настроен администратором.');
   const state=String(body.state??''),flow=db.prepare('SELECT * FROM oauth WHERE digest=?').get(hash(state));
   if(!flow||flow.expires<=now())fail(400,'Сеанс VK ID истёк. Начните вход заново.');
   if(!body.code||!body.device_id)fail(400,'VK ID не передал код или device_id.');
   db.prepare('DELETE FROM oauth WHERE digest=?').run(hash(state));
   const call=async(path,params)=>{const r=await fetcher('https://id.vk.com/oauth2/'+path,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(params),signal:AbortSignal.timeout(15000)});const data=await r.json();if(!r.ok||data.error)fail(502,'VK ID отклонил вход. Попробуйте ещё раз.');return data;};
   const tokens=await call('auth',{grant_type:'authorization_code',client_id:vkClientId,code:String(body.code),device_id:String(body.device_id),state,redirect_uri:redirect,code_verifier:flow.verifier});
   if(!tokens.access_token||!tokens.user_id)fail(502,'Не удалось подтвердить аккаунт VK ID.');
   const info=await call('user_info',{client_id:vkClientId,access_token:tokens.access_token});
   if(String(info.user?.user_id)!==String(tokens.user_id))fail(502,'Не удалось подтвердить профиль VK ID.');
   let u=db.prepare('SELECT * FROM users WHERE vk_id=?').get(String(tokens.user_id));
   if(!u){u={id:secret(),email:null,vk_id:String(tokens.user_id),name:String(info.user.first_name||'Игрок').slice(0,60),course:''};db.prepare('INSERT INTO users VALUES(?,?,?,?,?)').run(u.id,null,u.vk_id,u.name,'');}
   return session(u);
  }
  if(path==='/me')return {user:profile(user(token))};
  if(path==='/profile'){
   const u=user(token),course=courseNumber(body.course),name=String(body.name??'').trim();if(!name||name.length>60)fail(400,'Укажите имя длиной до 60 символов.');
   db.prepare('UPDATE users SET name=?,course=? WHERE id=?').run(name,course,u.id);return {user:profile({...u,name,course})};
  }
  if(path==='/logout'){db.prepare('DELETE FROM sessions WHERE digest=?').run(hash(String(token)));return {ok:true};}
  fail(404,'Не найдено.');
 }
 };
}
export function resendMailer(apiKey,from){if(!apiKey||!from)return null;return async(email,code)=>{const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+apiKey,'Content-Type':'application/json'},body:JSON.stringify({from,to:[email],subject:'Код входа · Киокушинкай',text:`Ваш код входа: ${code}\nОн действует 10 минут. Если вы не запрашивали код, проигнорируйте письмо.`}),signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('Mail delivery failed');};}

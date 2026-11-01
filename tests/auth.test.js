import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createAuthService} from '../multiplayer/auth/service.js';
import {createDuelServer} from '../multiplayer/server.js';
test('email codes expire, have bounded attempts and cannot be replayed; profiles and sessions survive restart',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'karate-auth-'));let code='',time=1000000;
 const options={filename:join(dir,'accounts.sqlite'),now:()=>time,sendMail:async(_,value)=>{code=value;}};
 let auth=createAuthService(options);
 try{
  await auth.handle('/email/start',{email:'PLAYER@example.com'});
  await assert.rejects(auth.handle('/email/start',{email:'player@example.com'}),/минуту/);
  await assert.rejects(auth.handle('/email/verify',{email:'player@example.com',code,course:'5'}),/от 1 до 4/);
  const account=await auth.handle('/email/verify',{email:'player@example.com',code,course:'2',name:'Анна'});
  assert.equal(account.user.course,'2');assert.equal(account.user.email,'player@example.com');
  await assert.rejects(auth.handle('/email/verify',{email:'player@example.com',code,course:'2'}),/недоступен/);
  await assert.rejects(auth.handle('/me',{},'wrong'),/Войдите/);
  auth.close();auth=createAuthService(options);
  assert.equal((await auth.handle('/me',{},account.token)).user.name,'Анна');
  await auth.handle('/profile',{name:'Аня',course:'4'},account.token);
  assert.equal((await auth.handle('/me',{},account.token)).user.course,'4');
  await auth.handle('/logout',{},account.token);await assert.rejects(auth.handle('/me',{},account.token),/Войдите/);
  await auth.handle('/email/start',{email:'new@example.com'});time+=600001;
  await assert.rejects(auth.handle('/email/verify',{email:'new@example.com',code,course:'1'}),/истёк/);
  await auth.handle('/email/start',{email:'new@example.com'});
  for(let i=0;i<5;i++)await assert.rejects(auth.handle('/email/verify',{email:'new@example.com',code:'000000',course:'1'}),/Неверный/);
  await assert.rejects(auth.handle('/email/verify',{email:'new@example.com',code,course:'1'}),/недоступен/);
 }finally{auth.close();rmSync(dir,{recursive:true,force:true});}
});
test('VK uses PKCE and one-use state; unverified email does not link identities',async()=>{
 const calls=[];const auth=createAuthService({filename:':memory:',appUrl:'https://example.com/app/',vkClientId:'123',fetcher:async(url,options)=>{calls.push({url,body:options.body});return {ok:true,json:async()=>url.endsWith('/auth')?{access_token:'private',user_id:'42'}:{user:{user_id:'42',first_name:'Дмитрий'}}};}});
 try{
  const flow=await auth.handle('/vk/start',{}),url=new URL(flow.url);assert.equal(url.searchParams.get('code_challenge_method'),'S256');
  await assert.rejects(auth.handle('/vk/finish',{state:'wrong',code:'code',device_id:'dev'}),/истёк/);
  const result=await auth.handle('/vk/finish',{state:flow.state,code:'code',device_id:'dev'});
  assert.equal(result.user.provider,'vk');assert.equal(result.user.course,'');assert.equal(result.user.email,null);
  assert.equal(calls[0].body.get('redirect_uri'),'https://example.com/app/');assert.ok(calls[0].body.get('code_verifier'));
  await assert.rejects(auth.handle('/vk/finish',{state:flow.state,code:'code',device_id:'dev'}),/истёк/);
  await auth.handle('/profile',{name:'Дмитрий',course:'1'},result.token);
 }finally{auth.close();}
});
test('HTTP auth is disabled explicitly, validates JSON and requires session for profiles',async()=>{
 const auth=createAuthService({filename:':memory:'});const server=createDuelServer({auth,allowLocal:true});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 try{
  assert.deepEqual(await (await fetch(base+'/auth/config')).json(),{email:false,vk:false});
  assert.equal((await fetch(base+'/auth/me')).status,401);
  assert.equal((await fetch(base+'/auth/profile',{method:'POST',body:'null'})).status,400);
  assert.equal((await fetch(base+'/auth/email/start',{method:'POST',body:JSON.stringify({email:'test@example.com'})})).status,503);
  assert.equal((await fetch(base+'/auth/config',{headers:{Origin:'https://evil.example'}})).status,403);
 }finally{await new Promise(r=>server.close(r));auth.close();}
});

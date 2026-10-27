import http from 'node:http';
import {pathToFileURL} from 'node:url';
import {DuelEngine,DuelError} from './engine.js';
export function createDuelServer({engine=new DuelEngine(),origins=['https://5yb6wsf8vv-gif.github.io'],allowLocal=false}={}){
 const rates=new Map();
 return http.createServer(async(req,res)=>{
  const origin=req.headers.origin;
  const local=allowLocal&&/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin||'');
  if(origin&&!origins.includes(origin)&&!local){res.writeHead(403,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Этот адрес сайта не разрешён сервером.'}));return;}
  const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Vary':'Origin'};
  if(origin)headers['Access-Control-Allow-Origin']=origin;
  headers['Access-Control-Allow-Headers']='Content-Type, Authorization';headers['Access-Control-Allow-Methods']='GET, POST, OPTIONS';
  const send=(status,data)=>{res.writeHead(status,headers);res.end(JSON.stringify(data));};
  if(req.method==='OPTIONS'){send(204,{});return;}
  const url=new URL(req.url,'http://localhost');
  try{
   if(req.method==='GET'&&url.pathname==='/health'){send(200,{ok:true,service:'kyokushin-duel',version:1});return;}
   const ip=req.socket.remoteAddress||'unknown';const now=Date.now();let rate=rates.get(ip);if(!rate||now-rate.at>60000){rate={at:now,n:0};rates.set(ip,rate);}if(++rate.n>600)throw new DuelError(429,'Слишком много запросов. Подождите минуту.');if(rates.size>10000)rates.clear();
   const key=(req.headers.authorization||'').replace(/^Bearer /,'');
   if(req.method==='GET'&&url.pathname==='/state'){send(200,engine.view(url.searchParams.get('room'),key));return;}
   if(req.method!=='POST')throw new DuelError(404,'Не найдено.');
   let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>8192)throw new DuelError(413,'Слишком большой запрос.');}
   let body;try{body=JSON.parse(raw||'{}');}catch{throw new DuelError(400,'Неверный JSON.');}
   if(url.pathname==='/rooms')send(201,engine.create(body.name));
   else if(url.pathname==='/join')send(200,engine.join(body.room,body.name));
   else if(url.pathname==='/answer')send(200,engine.answer(body.room,key,body.round,body.order));
   else if(url.pathname==='/leave')send(200,engine.leave(body.room,key));
   else throw new DuelError(404,'Не найдено.');
  }catch(e){send(e.status||500,{error:e instanceof DuelError?e.message:'Ошибка сервера.'});}
 });
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const origins=(process.env.ALLOWED_ORIGINS||'https://5yb6wsf8vv-gif.github.io').split(',').map(v=>v.trim()).filter(Boolean);
 const server=createDuelServer({origins,allowLocal:process.env.ALLOW_LOCAL_ORIGINS==='true'});
 server.listen(Number(process.env.PORT)||3001,'0.0.0.0',()=>console.log('Duel server listening'));
}

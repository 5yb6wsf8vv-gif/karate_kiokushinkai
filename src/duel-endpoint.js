export function resolveDuelEndpoint({configured='',saved='',invited='',hostname=''}={}){
 const value=configured||invited||saved;if(!value)return '';
 const url=new URL(value);const local=['localhost','127.0.0.1'].includes(hostname)&&['localhost','127.0.0.1'].includes(url.hostname);
 if(url.username||url.password||url.search||url.hash)throw Error('Адрес сервера должен быть без пароля, параметров и #.');
 if(url.protocol!=='https:'&&!(local&&url.protocol==='http:'))throw Error('Нужен HTTPS-адрес сервера.');
 return url.origin+url.pathname.replace(/\/$/,'');
}

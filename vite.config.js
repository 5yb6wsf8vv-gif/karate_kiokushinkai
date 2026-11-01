import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';
export default defineConfig({plugins:[VitePWA({
 registerType:'prompt',injectRegister:false,
 includeAssets:['icons/*.png','icons/icon.svg'],
 manifest:{id:'.',name:'Киокушинкай: тренажёр',short_name:'Киокушинкай',description:'Уроки карате, японские термины и повторение для начинающих.',lang:'ru',start_url:'.',scope:'.',display:'standalone',background_color:'#101720',theme_color:'#101720',icons:[
  {src:'icons/icon-192.png',sizes:'192x192',type:'image/png',purpose:'any'},
  {src:'icons/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any'},
  {src:'icons/maskable-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'}
 ]},
 workbox:{globPatterns:['**/*.{js,css,html,png,svg,webmanifest}'],maximumFileSizeToCacheInBytes:3*1024*1024,cleanupOutdatedCaches:true,clientsClaim:true,navigateFallback:'index.html',navigateFallbackDenylist:[/\/auth\//,/\/health$/,/\/state$/,/\/rooms$/,/\/join$/,/\/answer$/,/\/leave$/]}
})]});

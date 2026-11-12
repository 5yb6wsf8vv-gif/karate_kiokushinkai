import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';
export default defineConfig({plugins:[VitePWA({
 registerType:'prompt',injectRegister:false,
 includeAssets:['icons/*.png'],
 manifest:{id:'.',name:'KihonGo',short_name:'KihonGo',description:'Уроки карате, японские термины и повторение для начинающих.',lang:'ru',start_url:'.',scope:'.',display:'standalone',background_color:'#101720',theme_color:'#101720',icons:[
  {src:'icons/karate-192.png',sizes:'192x192',type:'image/png',purpose:'any'},
  {src:'icons/karate-512.png',sizes:'512x512',type:'image/png',purpose:'any'},
  {src:'icons/karate-maskable-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'}
 ]},
 workbox:{globPatterns:['**/*.{js,css,html,png,svg,webmanifest,mp3,txt,json}'],maximumFileSizeToCacheInBytes:3*1024*1024,cleanupOutdatedCaches:true,clientsClaim:true,navigateFallback:'index.html',navigateFallbackDenylist:[/\/auth\//,/\/health$/,/\/state$/,/\/rooms$/,/\/join$/,/\/answer$/,/\/leave$/]}
})]});

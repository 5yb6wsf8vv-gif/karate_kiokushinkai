export function createJapaneseAudio(feedback){
 let player=null,generation=0;
 function stop(){generation++;if(player){player.pause();player.removeAttribute('src');player.load();player=null;}if('speechSynthesis'in window)window.speechSynthesis.cancel();}
 function play(term){
  stop();const request=generation;let fallbackStarted=false;
  const fallback=()=>{if(request!==generation||fallbackStarted)return;fallbackStarted=true;
   const voice='speechSynthesis'in window?window.speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith('ja')):null;
   if(!voice||!('SpeechSynthesisUtterance'in window)){feedback('Не удалось загрузить японскую озвучку. Проверьте соединение или повторите позже.');return;}
   const utterance=new SpeechSynthesisUtterance(term.kana);utterance.lang='ja-JP';utterance.voice=voice;utterance.rate=.8;
   utterance.onerror=e=>{if(request===generation&&!['interrupted','canceled'].includes(e.error))feedback('Не удалось воспроизвести японскую озвучку.');};window.speechSynthesis.speak(utterance);
  };
  player=new Audio(`${import.meta.env.BASE_URL}audio/ja/${term.id}.mp3`);player.onerror=fallback;player.play().catch(fallback);
 }
 return {play,stop};
}

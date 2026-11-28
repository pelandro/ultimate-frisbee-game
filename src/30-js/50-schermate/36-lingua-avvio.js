/* ---- LINGUA AL PRIMO AVVIO: chi apre il gioco per la prima volta sceglie la lingua; poi si cambia da Impostazioni › Partita ----
   «Prima volta» = nel browser non c'e' ancora niente del gioco (LANG_NUOVO, 30-lingua.js): chi gioca gia' non vede la finestra.
   Il segno ultimate-lingua-chiedi la ripropone se si chiude il gioco senza scegliere. */
const LANG_ASK='ultimate-lingua-chiedi';
// then: quello che viene dopo la scelta (l'avviso delle statistiche, gia' nella lingua scelta)
function lgFirstStart(then){
  let ask=false;
  try{
    if(!navigator.webdriver||window.linguaTest){   // le prove automatiche partono senza finestre
      if(LANG_NUOVO)localStorage.setItem(LANG_ASK,'1');
      ask=localStorage.getItem(LANG_ASK)==='1'&&!localStorage.getItem(LANG_KEY);
    }
  }catch(e){}
  if(!ask)return then();
  $('lgFirstB').innerHTML=LANGS.map(([k,t],i)=>`<button type="button" class="${i?'sec':'go'}" data-lang="${k}" lang="${k}" translate="no">${t}</button>`).join('');
  $('lgFirst').classList.remove('hidden');
  $('lgFirstB').onclick=e=>{
    const b=e.target.closest('[data-lang]');if(!b)return;
    try{localStorage.removeItem(LANG_ASK);}catch(x){}
    $('lgFirst').classList.add('hidden');setLang(b.dataset.lang);then();
  };
}

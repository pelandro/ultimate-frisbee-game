/* ---- FINESTRE: fuoco e accessibilita' uguali per tutte ----
   Quando una finestra si apre, il fuoco va sul suo primo pulsante (chi usa tastiera o lettore di schermo sa dov'e');
   quando si chiude torna dove era. Le finestre non modali (fumetti, primi passi, rotazione) restano fuori. */
const WIN_SKIP={tip:1,pp:1,rot:1};
const winBack=new Map();
function winFocus(el){
  const b=el.querySelector('[autofocus]')||el.querySelector('.panel .go:not([disabled])')||el.querySelector('.panel button:not([disabled])');
  if(b)try{b.focus({preventScroll:true});}catch(e){}
}
for(const el of document.querySelectorAll('.overlay')){
  if(WIN_SKIP[el.id])continue;
  if(!el.hasAttribute('role'))el.setAttribute('role','dialog');
  el.setAttribute('aria-modal','true');
  new MutationObserver(()=>{
    const open=!el.classList.contains('hidden');
    if(open&&!winBack.has(el)){winBack.set(el,document.activeElement);if(G.inMatch&&!G.paused&&el.id!=='pause')return;if(el.id!=='cfm'&&!el.contains(document.activeElement))setTimeout(()=>{if(!el.classList.contains('hidden')&&!el.contains(document.activeElement))winFocus(el);},0);}
    else if(!open&&winBack.has(el)){
      const b=winBack.get(el);winBack.delete(el);
      // in partita il fuoco non deve restare su un pulsante: Spazio o Invio lo premerebbero (per esempio riaprendo la pausa)
      if(G.inMatch){const a=document.activeElement;if(a&&a!==document.body&&a.blur)a.blur();return;}
      if(b&&b!==document.body&&document.contains(b)&&b.offsetParent!==null&&b.closest('.screen,.overlay,#cshell')&&!document.querySelector('.overlay:not(.hidden):not(#tip):not(#pp):not(#rot)'))try{b.focus({preventScroll:true});}catch(e){}
    }
  }).observe(el,{attributes:true,attributeFilter:['class']});
}

/* ---- FINESTRE: fuoco e accessibilita' uguali per tutte ----
   Quando una finestra si apre, il fuoco va sul suo primo pulsante (chi usa tastiera o lettore di schermo sa dov'e');
   quando si chiude torna dove era. Le finestre non modali (fumetti, primi passi, rotazione) restano fuori. */
const WIN_SKIP={tip:1,pp:1,rot:1};
const winBack=new Map();
const windows=[...document.querySelectorAll('.overlay')].filter(el=>!WIN_SKIP[el.id]);
function activeWindow(){
  return windows.filter(el=>!el.classList.contains('hidden')&&getComputedStyle(el).display!=='none').reduce((top,el)=>{
    if(!top)return el;
    return (Number(getComputedStyle(el).zIndex)||0)>=(Number(getComputedStyle(top).zIndex)||0)?el:top;
  },null);
}
function windowControls(el){
  return [...el.querySelectorAll('button,input,select,textarea,a[href],[tabindex]')]
    .filter(b=>!b.disabled&&b.tabIndex>=0&&b.getClientRects().length);
}
function syncWindowBackground(){
  const top=activeWindow();
  for(const el of document.querySelectorAll('.screen,#cshell'))el.inert=!!top&&!el.contains(top);
  for(const el of windows)el.inert=!!top&&el!==top&&!el.contains(top);
}
const windowCloseIds={rpv:'rpX',qPick:'qpX',pause:'paGo',tut:'tuX',subs:'bSubGo',intro:'inGo',menu:'bGo'};
window.addEventListener('keydown',e=>{
  const top=activeWindow();
  if(!top)return;
  if(e.code==='Escape'&&windowCloseIds[top.id]){
    const close=$(windowCloseIds[top.id]);
    if(close&&top.contains(close)){
      e.preventDefault();e.stopImmediatePropagation();close.click();
    }
  }
  if(e.code!=='Tab')return;
  const controls=windowControls(top),first=controls[0],last=controls.at(-1),focused=document.activeElement;
  if(!first||!top.contains(focused)||focused===(e.shiftKey?first:last)){
    e.preventDefault();
    (e.shiftKey?last:first)?.focus({preventScroll:true});
  }
},true);
function winFocus(el){
  const b=el.querySelector('[autofocus]')||el.querySelector('.panel .go:not([disabled])')||windowControls(el)[0];
  if(b)try{b.focus({preventScroll:true});}catch(e){}
}
for(const el of document.querySelectorAll('.overlay')){
  if(WIN_SKIP[el.id])continue;
  if(!el.hasAttribute('role'))el.setAttribute('role','dialog');
  el.setAttribute('aria-modal','true');
  new MutationObserver(()=>{
    const open=!el.classList.contains('hidden');
    syncWindowBackground();
    if(open&&!winBack.has(el)){winBack.set(el,document.activeElement);if(el.id!=='cfm'&&!el.contains(document.activeElement))setTimeout(()=>{if(!el.classList.contains('hidden')&&!el.contains(document.activeElement))winFocus(el);},0);}
    else if(!open&&winBack.has(el)){
      const b=winBack.get(el);winBack.delete(el);
      // in partita il fuoco non deve restare su un pulsante: Spazio o Invio lo premerebbero (per esempio riaprendo la pausa)
      if(G.inMatch){const a=document.activeElement;if(a&&a!==document.body&&a.blur)a.blur();return;}
      if(b&&b!==document.body&&document.contains(b)&&b.offsetParent!==null&&b.closest('.screen,.overlay,#cshell')&&!activeWindow())try{b.focus({preventScroll:true});}catch(e){}
    }
  }).observe(el,{attributes:true,attributeFilter:['class']});
}

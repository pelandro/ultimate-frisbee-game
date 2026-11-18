/* Campionato Women (37-leghe/07-women.js): i testi parlano di «giocatrici». Le frasi del gioco sono scritte al maschile in centinaia di punti, quindi lo fa un
   osservatore sul testo (come la moneta dei crediti, 14-moneta-crediti.js): quando si e' nel mondo femminile (carriera Women, partita veloce Women, scelta di una
   squadra Women) volge al femminile «giocatore/giocatori» con articoli e aggettivi vicini; quando si torna al maschile rimette il testo originale.
   Guida e tutorial restano come sono (parlano del gioco in generale). I testi disegnati nel canvas e negli attributi non sono coperti. */
const FEM_PH=[   // prima le frasi (articoli, preposizioni articolate, aggettivi), poi le parole sole
  ['tutti i giocatori','tutte le giocatrici'],['i giocatori','le giocatrici'],['dei giocatori','delle giocatrici'],['ai giocatori','alle giocatrici'],['dai giocatori','dalle giocatrici'],
  ['nei giocatori','nelle giocatrici'],['sui giocatori','sulle giocatrici'],['coi giocatori','con le giocatrici'],['gli altri giocatori','le altre giocatrici'],
  ['il giocatore','la giocatrice'],['del giocatore','della giocatrice'],['al giocatore','alla giocatrice'],['dal giocatore','dalla giocatrice'],['nel giocatore','nella giocatrice'],
  ['sul giocatore','sulla giocatrice'],['un giocatore','una giocatrice'],['nessun giocatore','nessuna giocatrice'],['quel giocatore','quella giocatrice'],['questo giocatore','questa giocatrice'],
  ['nuovo giocatore','nuova giocatrice'],['nuovi giocatori','nuove giocatrici'],['altro giocatore','altra giocatrice'],['altri giocatori','altre giocatrici'],['pochi giocatori','poche giocatrici'],
  ['troppi giocatori','troppe giocatrici'],['molti giocatori','molte giocatrici'],['giocatori veri','giocatrici vere'],['giocatore vero','giocatrice vera'],
  ['giocatori generati','giocatrici generate'],['giocatore generato','giocatrice generata'],['giocatori infortunati','giocatrici infortunate'],['giocatore infortunato','giocatrice infortunata'],
  ['giocatori','giocatrici'],['giocatore','giocatrice'],['svincolati','svincolate'],['svincolato','svincolata'],['infortunati','infortunate'],['infortunato','infortunata']
].map(([a,b])=>[new RegExp('\\b'+a+'\\b','gi'),b]);
const FEM_HIT=/giocator|svincolat|infortunat/i,FEM_SKIP=/^(SCRIPT|STYLE|TEXTAREA|TITLE)$/;
const femCase=(m,b)=>m===m.toUpperCase()&&/[A-Z]/.test(m[1]||'')?b.toUpperCase():(m[0]!==m[0].toLowerCase()?b[0].toUpperCase()+b.slice(1):b);
const femTxt=s=>{for(const [re,b] of FEM_PH)s=s.replace(re,m=>femCase(m,b));return s;};
const femVis=id=>{const e=$(id);return !!e&&!e.classList.contains('hidden');};
function femNow(){   // siamo nel mondo femminile?
  try{
    if(QM.on)return isWomenClub(G.myName);
    if(femVis('quick'))return QM.div==='w';
    if(femVis('league')||femVis('team')||femVis('coachsel')||femVis('rpv'))return lgDiv==='w'||isWomenClub(rpTeam);
    return hasCareer()&&lnWomenNow();
  }catch(e){return false;}
}
let femBusy=false;
function femWalk(root,on){
  if(!root||femBusy)return;
  if(root.nodeType===1&&(root.closest('#guide,#tut')||(on&&!FEM_HIT.test(root.textContent))))return;
  const L=[];
  if(root.nodeType===3)L.push(root);
  else if(root.nodeType===1){const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);for(let n=w.nextNode();n;n=w.nextNode())L.push(n);}
  femBusy=true;
  for(const t of L){
    const p=t.parentNode;if(!p||FEM_SKIP.test(p.nodeName)||(p.closest&&p.closest('#guide,#tut')))continue;
    if(t.__fv!==undefined&&t.nodeValue!==t.__fv){t.__fo=undefined;t.__fv=undefined;}   // il gioco ha riscritto il testo: si riparte da quello nuovo
    if(on){if(t.__fo===undefined&&FEM_HIT.test(t.nodeValue)){const v=femTxt(t.nodeValue);if(v!==t.nodeValue){t.__fo=t.nodeValue;t.nodeValue=v;t.__fv=v;}}}
    else if(t.__fo!==undefined){t.nodeValue=t.__fo;t.__fo=undefined;t.__fv=undefined;}
  }
  femBusy=false;
}
let femLast=false;
function femPass(){const on=femNow();if(on||femLast)femWalk(document.body,on);femLast=on;}   // a ogni cambio di schermata o di divisione
new MutationObserver(ms=>{if(femBusy)return;const on=femNow();if(on!==femLast){femPass();return;}if(!on)return;for(const m of ms){if(m.type==='characterData')femWalk(m.target,true);else m.addedNodes.forEach(n=>femWalk(n,true));}})
  .observe(document.body,{childList:true,characterData:true,subtree:true});

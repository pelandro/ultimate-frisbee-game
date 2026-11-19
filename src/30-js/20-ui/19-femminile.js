/* Formulazioni Women per il contesto attivo e per i messaggi dei salvataggi precedenti. */
const FEM_PH=[   // prima le frasi (articoli, preposizioni articolate, aggettivi), poi le parole sole
  ['tutti i giocatori','tutte le giocatrici'],['i giocatori','le giocatrici'],['dei giocatori','delle giocatrici'],['ai giocatori','alle giocatrici'],['dai giocatori','dalle giocatrici'],
  ['nei giocatori','nelle giocatrici'],['sui giocatori','sulle giocatrici'],['coi giocatori','con le giocatrici'],['gli altri giocatori','le altre giocatrici'],
  ['il giocatore','la giocatrice'],['del giocatore','della giocatrice'],['al giocatore','alla giocatrice'],['dal giocatore','dalla giocatrice'],['nel giocatore','nella giocatrice'],
  ['sul giocatore','sulla giocatrice'],['un giocatore','una giocatrice'],['nessun giocatore','nessuna giocatrice'],['quel giocatore','quella giocatrice'],['questo giocatore','questa giocatrice'],
  ['nuovo giocatore','nuova giocatrice'],['nuovi giocatori','nuove giocatrici'],['altro giocatore','altra giocatrice'],['altri giocatori','altre giocatrici'],['pochi giocatori','poche giocatrici'],
  ['troppi giocatori','troppe giocatrici'],['molti giocatori','molte giocatrici'],['giocatori veri','giocatrici vere'],['giocatore vero','giocatrice vera'],
  ['giocatori generati','giocatrici generate'],['giocatore generato','giocatrice generata'],['giocatori infortunati','giocatrici infortunate'],['giocatore infortunato','giocatrice infortunata'],
  ['difensore dell’anno','difensora dell’anno'],
  ['re degli assist','regina degli assist'],['capocannoniere','capocannoniera'],['il difensore','la difensora'],['un difensore','una difensora'],
  ['del difensore','della difensora'],['i difensori','le difensore'],['ricevitore selezionato','ricevitrice selezionata'],
  ['i sette titolari','le sette titolari'],['i titolari','le titolari'],['i tuoi titolari','le tue titolari'],
  ['titolari selezionati','titolari selezionate'],
  ['giocatori stanchi','giocatrici stanche'],['giocatore stanco','giocatrice stanca'],
  ['giocatori selezionati','giocatrici selezionate'],['giocatore selezionato','giocatrice selezionata'],
  ['giocatori disponibili','giocatrici disponibili'],['giocatore disponibile','giocatrice disponibile'],
  ['i soli infortunati','le sole infortunate'],['gli infortunati','le infortunate'],
  ['gli svincolati','le svincolate'],['giocatori','giocatrici'],['giocatore','giocatrice'],['svincolati','svincolate'],['svincolato','svincolata'],['infortunati','infortunate'],['infortunato','infortunata']
].map(([a,b])=>[new RegExp('\\b'+a+'\\b','gi'),b]);
const FEM_HIT=/giocator|svincolat|infortunat|difensor|titolari|ricevitor|capocannonier|re degli assist/i,FEM_SKIP=/^(SCRIPT|STYLE|TEXTAREA|TITLE)$/;
const femCase=(m,b)=>m===m.toUpperCase()&&/[A-Z]/.test(m[1]||'')?b.toUpperCase():(m[0]!==m[0].toLowerCase()?b[0].toUpperCase()+b.slice(1):b);
const femTxt=s=>{for(const [re,b] of FEM_PH)s=s.replace(re,m=>femCase(m,b));return s;};
const femVis=id=>{const e=$(id);return !!e&&!e.classList.contains('hidden');};
function femNow(){
  if(femVis('quick'))return QM.div==='w';
  if(femVis('league')||femVis('team')||femVis('coachsel'))return lgDiv==='w';
  if(femVis('rpv'))return isWomenClub(rpTeam);
  if(femVis('tourn'))return isWomenClub(TOUR?.team||$('tnTeam')?.value);
  if(G.inMatch)return !G.drill&&!UT.on&&(QM.on?isWomenClub(G.myName):lnWomenNow());
  return ['home','roster','event','train','market','club','alerts'].some(femVis)&&hasCareer()&&lnWomenNow();
}
// Adatta anche i salvataggi precedenti. Gli attributi di controllo e i nomi dei club restano invariati.
const FEM_ATTR=['aria-label','title'];
const FEM_EXCLUDE='#guide,#tut,#school,.crest,.tn,.rn .nk,[data-verbatim]';
const femOriginal=new WeakMap();
function femApply(node,key,read,write,on){
  const value=read();
  if(value==null)return;
  const originals=femOriginal.get(node)||{};
  const old=originals[key];
  const original=old?.translated===value?old.original:value;
  const translated=on&&FEM_HIT.test(original)?femTxt(original):original;
  if(value!==translated)write(translated);
  if(translated!==original){originals[key]={original,translated};femOriginal.set(node,originals);}
  else delete originals[key];
}
function femElement(el,on){
  if(el.closest(FEM_EXCLUDE))return;
  for(const key of FEM_ATTR)femApply(el,key,()=>el.getAttribute(key),v=>el.setAttribute(key,v),on);
}
function femWalk(root,on){
  const element=root.nodeType===1?root:root.parentElement;
  if(!element||element.closest(FEM_EXCLUDE)||FEM_SKIP.test(element.nodeName))return;
  const translate=node=>{
    const parent=node.parentElement;
    if(parent&&!parent.closest(FEM_EXCLUDE)&&!FEM_SKIP.test(parent.nodeName))
      femApply(node,'text',()=>node.nodeValue,v=>{node.nodeValue=v;},on);
  };
  if(root.nodeType===3){translate(root);return;}
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  for(let node=walker.nextNode();node;node=walker.nextNode())translate(node);
  femElement(root,on);
  for(const el of root.querySelectorAll('[aria-label],[title]'))femElement(el,on);
}
let femLast=false;
function femPass(){
  const on=femNow();
  if(on!==femLast){femLast=on;femWalk(document.body,on);}
}
new MutationObserver(changes=>{
  const on=femNow();
  if(on!==femLast){femPass();return;}
  if(!on)return;
  for(const change of changes){
    if(change.type==='attributes')femElement(change.target,true);
    else if(change.type==='characterData')femWalk(change.target,true);
    else change.addedNodes.forEach(node=>femWalk(node,true));
  }
}).observe(document.body,{childList:true,characterData:true,attributes:true,attributeFilter:FEM_ATTR,subtree:true});

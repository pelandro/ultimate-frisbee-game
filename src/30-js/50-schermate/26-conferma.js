/* ---- CONFERMA: una finestra sola per le azioni importanti o irreversibili (acquisti, cessioni) ----
   askConfirm({title, html, ok, danger, onOk}): mostra il riepilogo, «Conferma» esegue, «Annulla», Esc o il tocco fuori chiudono senza fare nulla.
   Il fuoco va su «Annulla» (un Invio di troppo non compra niente) e torna al pulsante da cui si e' partiti. */
let cfmFn=null,cfmBack=null,cfmNoFn=null;
function askConfirm(o){
  cfmFn=o.onOk||null;cfmNoFn=o.onNo||null;cfmBack=document.activeElement;$('cfmNo').textContent=o.no||'Annulla';   // no/onNo: solo il pulsante, non Esc né il tocco fuori
  $('cfmH').textContent=o.title||'Confermi?';$('cfmBody').innerHTML=o.html||'';
  const ok=$('cfmOk');ok.textContent=o.ok||'Conferma';ok.className=o.danger?'go danger':'go';
  $('cfm').classList.remove('hidden');try{$('cfmNo').focus({preventScroll:true});}catch(e){}
}
function closeConfirm(run){
  const f=cfmFn;cfmFn=null;$('cfm').classList.add('hidden');
  if(run&&f)f();
  try{if(cfmBack&&document.contains(cfmBack))cfmBack.focus({preventScroll:true});}catch(e){}
  cfmBack=null;
}
$('cfmOk').addEventListener('click',()=>closeConfirm(true));
$('cfmNo').addEventListener('click',()=>{const f=cfmNoFn;closeConfirm(false);if(f)f();});
$('cfm').addEventListener('click',e=>{if(e.target===$('cfm'))closeConfirm(false);});
// Esc chiude la finestra in primo piano (conferma, Posta, Opzioni, Guida) come il suo pulsante «Chiudi»
const ESC_CLOSE=[['todoW',()=>$('todoX').click()],['tipW',()=>$('tipWX').click()],['cfm',()=>closeConfirm(false)],['alerts',()=>$('alX').click()],['opts',()=>$('opX').click()],['guide',()=>$('gdX').click()]];
window.addEventListener('keydown',e=>{
  if(e.defaultPrevented||e.code!=='Escape')return;
  for(const [id,fn] of ESC_CLOSE){const el=$(id);if(el&&activeWindow()===el){e.preventDefault();e.stopImmediatePropagation();fn();return;}}
},true);

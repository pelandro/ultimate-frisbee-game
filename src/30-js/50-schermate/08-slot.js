/* ---- SLOT CARRIERA: tre carriere separate sullo stesso dispositivo ----
   La carriera attiva resta in SAVE_KEY (come prima, cosi' i salvataggi vecchi funzionano); persist() ne tiene una copia anche nello slot SV.slot.
   Cambiare slot salva la carriera attuale nel suo slot e carica l'altra (o porta alla scelta della squadra, se lo slot e' vuoto). */
const SLOTS_N=3,slotKey=k=>'ultimate-carriera-'+k;
function slotInfo(k){
  if(SV&&SV.team&&(SV.slot||1)===k)return {team:SV.team,season:SV.season,sr:SV.sr,cur:true};
  try{const d=JSON.parse(localStorage.getItem(slotKey(k))||'null');if(d&&d.team)return {team:d.team,season:d.season,sr:d.sr};}catch(e){}
  return null;
}
function renderSlots(){
  const cur=(SV&&SV.slot)||1;
  $('opSlots').innerHTML=[1,2,3].map(k=>{const i=slotInfo(k);return `<button type="button" class="sec slotb${k===cur?' on':''}" data-slot="${k}"${k===cur?' disabled':''}><strong>Slot ${k}</strong><small>${i?esc(i.team)+' · '+SERIES_NAME[i.sr]+' · stagione '+i.season:'vuoto: nuova carriera'}</small></button>`;}).join('');
}
function switchSlot(k){
  if(!(k>=1&&k<=SLOTS_N)||(SV.slot||1)===k)return;
  if(SV&&SV.team)persist();   // la carriera attuale resta nel suo slot
  let d=null;try{d=JSON.parse(localStorage.getItem(slotKey(k))||'null');}catch(e){}
  $('opts').classList.add('hidden');
  if(d&&d.team){SV={};if(loadSave(d)){SV.slot=k;persist();showScreen('home');return;}}
  slotUndo=SV&&SV.team?(SV.slot||1):null;const help=SV.help;SV={help,slot:k};try{localStorage.removeItem(SAVE_KEY);}catch(e){}showScreen('team');   // slot vuoto: si sceglie la squadra (indietro: torna la carriera di prima)
}
$('opSlots').addEventListener('click',e=>{const b=e.target.closest('[data-slot]');if(!b||b.disabled)return;switchSlot(+b.dataset.slot);});
/* ---- SCHERMATA «CARRIERE» (dal menu iniziale) ----
   Prima per cambiare slot o iniziare una carriera nuova bisognava entrare nella carriera attuale, aprire le Opzioni e scegliere da li'.
   Ora il menu iniziale ha il tasto «Carriere»: tre schede, una per slot, con Continua e Nuova carriera. Se inizi una carriera nuova e poi torni
   indietro senza scegliere la squadra, la carriera di prima torna com'era (slotUndo). */
let slotUndo=null;
function slotData(k){
  if(SV&&SV.team&&(SV.slot||1)===k)return SV;
  try{const d=JSON.parse(localStorage.getItem(slotKey(k))||'null');if(d&&d.team)return d;}catch(e){}
  return null;
}
function renderCareers(){
  const cur=(SV&&SV.team)?(SV.slot||1):0;
  $('csBox').innerHTML=[1,2,3].map(k=>{
    const d=slotData(k);
    if(!d)return `<div class="ccard csl"><h3>Slot ${k}</h3><p class="cse">Vuoto</p><div class="schrow"><button type="button" class="go" data-cnew="${k}">Nuova carriera</button></div></div>`;
    const when=d.savedAt?new Date(d.savedAt).toLocaleDateString('it-IT',{day:'numeric',month:'short'}):'',tr=d.troph||{},cups=(tr.A|0)+(tr.B|0)+(tr.C|0)+(tr.eu|0);
    const pos=d.done&&d.next?d.next.rank+'° a fine stagione':(d.tab&&d.mem&&d.round>0?ranking(d.tab,d.mem[d.sr]).indexOf(d.team)+1+'° in classifica':'inizio stagione');
    return `<div class="ccard csl${k===cur?' on':''}"><h3>Slot ${k}${k===cur?' · in uso':''}</h3><div class="cst">${crest(d.team,30)}<span><b>${esc(d.team)}</b><small>${SERIES_NAME[d.sr]} · stagione ${d.season} · ${pos}${cups?` · ${cups} ${cups>1?'trofei':'trofeo'}`:''}${d.susp?' · partita sospesa':''}</small></span></div>${when?`<p class="csd">Ultimo salvataggio: ${when}</p>`:''}<div class="schrow"><button type="button" class="go" data-cgo="${k}">Continua</button><button type="button" class="sec danger" data-cnew="${k}">Nuova carriera</button></div></div>`;
  }).join('');
}
function careerGo(k){
  if(SV&&SV.team&&(SV.slot||1)===k){showScreen('home');return;}
  switchSlot(k);
}
function careerNew(k){
  const prev=SV&&SV.team?(SV.slot||1):null;
  if(prev)persist();   // la carriera attuale resta nel suo slot
  slotUndo=prev&&prev!==k?prev:null;
  try{localStorage.removeItem(slotKey(k));localStorage.removeItem(SAVE_KEY);}catch(e){}
  const help=SV&&SV.help;SV={help,slot:k};showScreen('team');
}
// indietro dalla scelta della squadra: se avevi lasciato un'altra carriera per iniziarne una nuova, torna quella
function teamBack(){
  if(!hasCareer()&&slotUndo){const k=slotUndo;slotUndo=null;let d=null;try{d=JSON.parse(localStorage.getItem(slotKey(k))||'null');}catch(e){}if(d&&d.team){SV={};if(loadSave(d)){SV.slot=k;persist();}}}
  showScreen(hasCareer()?'slots':'title');
}
$('csBox').addEventListener('click',e=>{
  const g=e.target.closest('[data-cgo]');if(g){careerGo(+g.dataset.cgo);return;}
  const n=e.target.closest('[data-cnew]');if(!n)return;
  const k=+n.dataset.cnew;
  if(slotData(k))armed(n,'Conferma: cancella lo slot '+k,'Nuova carriera',()=>careerNew(k));   // uno slot pieno si cancella solo con la conferma
  else careerNew(k);
});
$('csBack').addEventListener('click',()=>showScreen('title'));
$('tSlots').addEventListener('click',()=>showScreen('slots'));

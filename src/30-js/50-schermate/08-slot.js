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
  const help=SV.help;SV={help,slot:k};try{localStorage.removeItem(SAVE_KEY);}catch(e){}showScreen('team');   // slot vuoto: si sceglie la squadra
}
$('opSlots').addEventListener('click',e=>{const b=e.target.closest('[data-slot]');if(!b||b.disabled)return;switchSlot(+b.dataset.slot);});

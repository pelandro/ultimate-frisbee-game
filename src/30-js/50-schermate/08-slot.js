/* Tre slot di carriera e scelta dello slot attivo. */
const SLOTS_N=3,slotKey=k=>'ultimate-carriera-'+k;
function slotInfo(k){
  if(SV&&SV.team&&(SV.slot||1)===k)return {team:SV.team,season:SV.season,sr:SV.sr,cur:true};
  try{const d=JSON.parse(saveStore.getItem(slotKey(k))||'null');if(d&&d.team)return {team:d.team,season:d.season,sr:d.sr};}catch(e){}
  return null;
}
function renderSlots(){
  const cur=(SV&&SV.slot)||1;
  $('opSlots').innerHTML=[1,2,3].map(k=>{const i=slotInfo(k);return `<button type="button" class="sec slotb${k===cur?' on':''}" data-slot="${k}"${k===cur?' disabled':''}><strong>Slot ${k}</strong><small>${i?esc(i.team)+' · '+SERIES_NAME[i.sr]+' · stagione '+i.season:'vuoto: nuova carriera'}</small></button>`;}).join('');
}
function switchSlot(k){
  if(!(k>=1&&k<=SLOTS_N)||(SV.slot||1)===k)return;
  const d=slotData(k);
  if(!d){careerNew(k);return;}
  if(!archiveActiveCareer())return;
  const previous=SV, squad=squadData(), lineup=lineupIds();
  try{
    if(loadSave(d)){
      SV.slot=k;
      if(persist()){$('opts').classList.add('hidden');showScreen('home');return;}
    }
  }catch(e){}   // uno slot illeggibile non sostituisce la carriera aperta
  restoreCareerState(previous,squad,lineup);
  slotMessage('Impossibile aprire lo slot '+k+'. La carriera attuale è ancora aperta.');
}
$('opSlots').addEventListener('click',e=>{const b=e.target.closest('[data-slot]');if(!b||b.disabled)return;switchSlot(+b.dataset.slot);});
let careerDraft=null;
function slotMessage(message){
  const inOptions=!$('opts').classList.contains('hidden');
  $(inOptions?'opMsg':'csMsg').textContent=message;
}
function archiveActiveCareer(){
  if(!SV.team)return true;
  if(persist())return true;
  slotMessage('Impossibile conservare la carriera attuale. Libera spazio o esporta il salvataggio, poi riprova.');
  return false;
}
function restoreCareerState(previous,squad,lineup){
  SV=previous;
  setSquad(squad);
  setLineup(lineup);
}
function slotData(k){
  if(SV&&SV.team&&(SV.slot||1)===k)return SV;
  try{const d=JSON.parse(saveStore.getItem(slotKey(k))||'null');if(d&&d.team)return d;}catch(e){}
  return null;
}
function renderCareers(){
  $('csMsg').textContent='';
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
  if(SV.team&&(SV.slot||1)!==k&&!archiveActiveCareer())return;
  $('opts').classList.add('hidden');
  careerDraft={slot:k,back:SV.team?'slots':'title'};
  showScreen('league');
}
function commitCareerDraft(team,coach,relief,diff){
  const previous=SV,squad=squadData(),lineup=lineupIds();
  SV={help:previous.help,slot:careerDraft?.slot||previous.slot||1};
  try{
    startCareer(team,{coach,relief,deferSave:true});
    SV.diff=CAR_DIFF[diff]?diff:'easy';   // scelta con l'allenatore, non cambia piu' (12-allenatore-scelta.js)
    if(persist()){careerDraft=null;return true;}
  }catch(e){}
  restoreCareerState(previous,squad,lineup);
  return false;
}
function teamBack(){
  const back=careerDraft?.back||(hasCareer()?'slots':'title');
  careerDraft=null;
  showScreen(back);
}
$('csBox').addEventListener('click',e=>{
  const g=e.target.closest('[data-cgo]');if(g){careerGo(+g.dataset.cgo);return;}
  const n=e.target.closest('[data-cnew]');if(!n)return;
  const k=+n.dataset.cnew;
  if(slotData(k))askConfirm({title:'Sostituire la carriera nello slot '+k+'?',html:'<p>La sostituzione avviene quando inizi e salvi la nuova carriera.</p>',ok:'Scegli la nuova squadra',danger:true,onOk:()=>careerNew(k)});
  else careerNew(k);
});
$('csBack').addEventListener('click',()=>showScreen('title'));

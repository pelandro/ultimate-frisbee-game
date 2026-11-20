/* La cancellazione rimuove anche la copia di sicurezza, così uno slot eliminato non può ricomparire al riavvio. */
const renderCareersBeforeDelete=renderCareers;
renderCareers=function(){
  renderCareersBeforeDelete();
  $('csBox').querySelectorAll('.ccard').forEach(card=>{
    const create=card.querySelector('[data-cnew]'),row=create&&create.parentElement;
    if(!create||!row)return;
    create.className='sec';
    if(!slotData(+create.dataset.cnew)||row.querySelector('[data-cdelete]'))return;
    const button=document.createElement('button');
    button.type='button';button.className='sec danger';button.dataset.cdelete=create.dataset.cnew;
    button.textContent='Elimina carriera';row.append(button);
  });
};
function deleteCareerSlot(k){
  if(!Number.isInteger(k)||k<1||k>SLOTS_N||!slotData(k))return;
  const current=!!(SV&&SV.team&&(SV.slot||1)===k);
  const next=[1,2,3].find(n=>n!==k&&slotData(n));
  let primary=null,oldBackup=null;
  try{primary=JSON.parse(saveStore.getItem(SAVE_KEY)||'null');}catch(e){}
  try{oldBackup=JSON.parse(saveStore.getItem(SAVE_KEY+'-bak')||'null');}catch(e){}
  const primarySlot=primary&&primary.team?(primary.slot||1):0;
  const changes={[slotKey(k)]:null,[slotKey(k)+'-bak']:null};
  if(current||primarySlot===k)changes[SAVE_KEY]=next?{slot:slotKey(next)}:null;
  if(oldBackup&&oldBackup.team&&(oldBackup.slot||1)===k)changes[SAVE_KEY+'-bak']=null;
  try{saveStore.commit(changes);}catch(e){slotMessage('Impossibile eliminare la carriera. Libera spazio e riprova.');return;}
  if(current||primarySlot===k){
    const help=!!(SV&&SV.help);
    SV={help,slot:next||1};
    careerStorageVersion=undefined;careerStorageSlot=undefined;
  }
  renderCareers();
  slotMessage('Carriera eliminata.');
}
$('csBox').addEventListener('click',e=>{
  const button=e.target.closest('[data-cdelete]');if(!button)return;
  const k=+button.dataset.cdelete,team=slotData(k)?.team||'questa squadra';
  askConfirm({title:'Eliminare la carriera nello slot '+k+'?',html:`<p>La carriera di <b>${esc(team)}</b> e la sua copia precedente verranno eliminate definitivamente.</p>`,ok:'Elimina carriera',danger:true,onOk:()=>deleteCareerSlot(k)});
});

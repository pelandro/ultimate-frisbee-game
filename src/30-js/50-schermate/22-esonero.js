/* ---- ESONERO: dopo troppe partite con i conti in rosso la dirigenza ti manda via e devi ripartire da un altro club, piu' modesto (regole in 30-carriera/26-economia-partita.js) ---- */
function openFired(){
  const f=SV.fired;if(!f){return;}
  $('fdTitle').textContent=`${f.team} ti ha esonerato`;
  $('fdTxt').textContent='I conti sono rimasti in rosso troppo a lungo e la dirigenza ha perso la pazienza. La carriera continua, ma da un club meno forte: scegli quale. Storico, trofei e traguardi restano tuoi; la reputazione scende.';
  $('fdOpts').innerHTML=f.offers.map(n=>`<button type="button" class="sec" data-fc="${esc(n)}"><span class="tn">${crest(n,22)}<span>${esc(n)}<small class="tcity">${esc(clubLeagueTxt(n))} · forza ${Math.round(qPowOf(n))}</small></span></span></button>`).join('');
  $('fdOpts').classList.remove('hidden');$('fdRes').classList.add('hidden');$('fired').classList.remove('hidden');
}
$('fdOpts').addEventListener('click',e=>{
  const b=e.target.closest('[data-fc]');if(!b)return;
  const res=firedAccept(b.dataset.fc);if(!res)return;
  $('fired').classList.add('hidden');persist();showScreen('home');
});

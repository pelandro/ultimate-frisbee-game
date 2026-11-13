/* ---- INIZIO CARRIERA: squadra del cuore o subentrato, e il tuo allenatore ----
   Schermata «Scegli la tua squadra»: due modalita'. «Squadra del cuore» e' l'elenco di sempre; «Subentrato» propone una squadra in crisi
   (reliefOffer) a una giornata dalla fine. Poi la schermata «Il tuo allenatore»: nome, cognome e volto, con «Personaggio casuale».
   La stessa schermata serve per cambiare allenatore dopo (tocco sul volto, in alto a destra nel cruscotto). Le regole stanno in 24-allenatore.js. */
let teamMode='cuore',reliefName=null;
const TSR_IT=$('tSr').innerHTML;   // le linguette Serie A/B/C: tornano quando dal campionato USA si ripassa all'Italia
function renderTeams(){
  $('tLgName').textContent=lgOf().name;
  if(teamLg==='US')return renderTeamsUS();   // campionato USA: 15-usa-schermate.js
  $('tMode').classList.remove('hidden');$('tSr').innerHTML=TSR_IT;
  for(const b of $('tMode').children)b.classList.toggle('on',b.dataset.k===teamMode);
  const sub=teamMode==='sub';
  $('tTeams').classList.toggle('hidden',sub);$('tRelief').classList.toggle('hidden',!sub);
  if(!sub){$('tNote').textContent='Scegli la serie e tocca una squadra per vederne il roster, poi decidi se allenarla. Puoi partire dalla Serie C e salire, oppure direttamente dalla B o dalla A, dove le avversarie sono più forti. La rosa è quella vera della squadra (nomi ed età reali), ancora poco allenata. Il numero accanto al nome è la forza della squadra: la media dei suoi 7 migliori giocatori.';renderTeamList();return;}
  for(const b of $('tSr').children)b.classList.toggle('on',b.dataset.k===teamTab);
  $('tNote').textContent='Scegli la serie: una squadra in crisi ti chiama a una giornata dalla fine del campionato. Hai una sola partita per salvarla; poi comincia l’estate.';
  if(!reliefName||!TEAM[reliefName]||TEAM[reliefName].series!==teamTab)reliefName=reliefOffer(teamTab);
  const n=reliefName;
  $('tRelief').innerHTML=`<div class="ccard coffer"><div class="cof1">${crest(n,48)}<div><h3>${esc(n)}</h3><p>${SERIES_NAME[teamTab]} · forza ${Math.round(qPower(n))}</p></div></div><p>La squadra è in piena crisi: ha perso quasi tutto nelle ultime giornate e lotta per non retrocedere. Il presidente cerca un nuovo allenatore: tu hai <b>una sola partita</b> per salvarla, poi comincia l’estate.</p><div class="schrow"><button type="button" class="go" id="tReAcc">Accetta</button><button type="button" class="sec" id="tReAlt">Un’altra squadra</button></div></div>`;
}
$('tMode').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;teamMode=b.dataset.k;reliefName=null;renderTeams();});
$('tRelief').addEventListener('click',e=>{
  if(e.target.closest('#tReAcc')&&reliefName){openCoach({mode:'new',team:reliefName,relief:true});return;}
  if(e.target.closest('#tReAlt')){reliefName=reliefOffer(teamTab,reliefName);renderTeams();}
});
/* ---- schermata dell'allenatore ---- */
let coS=null;   // {mode:'new'|'edit', team, relief, n, s, lk}
function openCoach(o){
  const r=o.mode==='edit'&&SV.coach?SV.coach:coachRandom();
  coS=Object.assign({n:r.n,s:r.s,lk:Object.assign({},r.lk)},o);showScreen('coachsel');
}
function renderCoach(){
  if(!coS){showScreen(hasCareer()?'home':'team');return;}
  const nw=coS.mode==='new';
  $('coWhy').textContent=nw?(coS.relief?`${coS.team} ti ha scelto come nuovo allenatore. Come ti chiami?`:`Stai per allenare ${coS.team}. Come ti chiami e che faccia hai?`):'Cambia nome o volto quando vuoi: compari nel cruscotto, nelle notizie e nella Hall of Fame.';
  $('coN').value=coS.n;$('coS').value=coS.s;$('coGo').textContent=nw?'Inizia la carriera':'Salva';
  coPaint();
}
function coPaint(){   // anteprima e griglia dei volti (i campi di testo non si toccano mentre si scrive)
  $('coPrev').innerHTML=avatar({look:coS.lk,t:0},84);
  $('coName').textContent='Coach '+((coS.n||'')+' '+(coS.s||'')).trim();
  const sel=coachFace(coS.lk);
  $('coFaces').innerHTML=COACH_FACES.map((f,i)=>`<button type="button" class="cof${i===sel?' on':''}" data-f="${i}" aria-label="Volto ${i+1}">${avatar({look:f,t:0},46)}</button>`).join('');
}
$('coN').addEventListener('input',()=>{coS.n=$('coN').value;$('coName').textContent='Coach '+((coS.n||'')+' '+(coS.s||'')).trim();});
$('coS').addEventListener('input',()=>{coS.s=$('coS').value;$('coName').textContent='Coach '+((coS.n||'')+' '+(coS.s||'')).trim();});
$('coFaces').addEventListener('click',e=>{const b=e.target.closest('[data-f]');if(!b||!coS)return;coS.lk=Object.assign({},COACH_FACES[+b.dataset.f]);coPaint();});
$('coRnd').addEventListener('click',()=>{if(!coS)return;const r=coachRandom();coS.n=r.n;coS.s=r.s;coS.lk=r.lk;renderCoach();});
$('coBack').addEventListener('click',()=>{const nw=coS&&coS.mode==='new';coS=null;showScreen(nw?'team':'home');});
$('coGo').addEventListener('click',()=>{
  if(!coS)return;
  const c=coachNorm({n:$('coN').value,s:$('coS').value,lk:coS.lk}),s=coS;coS=null;
  if(s.mode==='new'){startCareer(s.team,{coach:c,relief:s.relief});showScreen('home');return;}
  SV.coach=c;persist();showScreen('home');
});
$('hCoach').addEventListener('click',()=>{if(SV.coach)openCoach({mode:'edit'});});

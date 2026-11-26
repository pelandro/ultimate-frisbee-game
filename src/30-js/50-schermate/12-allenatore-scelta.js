/* ---- INIZIO CARRIERA: squadra del cuore o subentrato, e il tuo allenatore ----
   Schermata «Scegli la tua squadra»: due modalita'. «Squadra del cuore» e' l'elenco di sempre; «Subentrato» propone una squadra in crisi
   (reliefOffer) a una giornata dalla fine. Poi la schermata «Il tuo allenatore»: nome, cognome e volto, con «Personaggio casuale».
   La stessa schermata serve per cambiare allenatore dopo (tocco sul volto, in alto a destra nel cruscotto). Le regole stanno in 24-allenatore.js. */
let teamMode='cuore',reliefName=null;
const TSR_IT=$('tSr').innerHTML;   // le linguette Serie A/B/C: tornano quando dal campionato USA si ripassa all'Italia
// formato di ogni serie italiana, nella scelta della squadra (stessa forma delle leghe europee: lnFormatTxt/lnMoveTxt)
const IT_FMT={A:'Serie A: girone unico, sola andata (15 partite); playoff fra le prime 4. Retrocedono le ultime 2. Prime 3 all’EUCF.',
  B:'Serie B: girone unico, sola andata (13 partite); 1ª promossa, 2ª-5ª spareggio per la promozione. Retrocedono le ultime 2.',
  C:'Serie C: girone unico, sola andata (15 partite); 1ª promossa, 2ª-5ª spareggio per la promozione.'};
function renderTeams(){
  $('tLgName').textContent=lgOf().name;
  if(usLeague(teamLg))return renderTeamsUS();   // campionato USA: 15-usa-schermate.js
  if(LN_DEF[teamLg])return renderTeamsLN();   // leghe europee: 19-leghe-schermate.js
  $('tMode').classList.remove('hidden');$('tSr').innerHTML=TSR_IT;
  for(const b of $('tMode').children)b.classList.toggle('on',b.dataset.k===teamMode);
  const sub=teamMode==='sub';
  $('tTeams').classList.toggle('hidden',sub);$('tRelief').classList.toggle('hidden',!sub);
  if(!sub){$('tNote').textContent=(IT_FMT[teamTab]||'')+' Tocca una squadra per vederne la rosa. Il numero accanto al nome è la forza della squadra (contano soprattutto i 7 migliori, poi la panchina).';renderTeamList();return;}
  for(const b of $('tSr').children)b.classList.toggle('on',b.dataset.k===teamTab);
  $('tNote').textContent='Scegli la serie: una squadra in crisi ti chiama a una giornata dalla fine. Hai una sola partita per salvarla; poi comincia l’estate.';
  if(!reliefName||!TEAM[reliefName]||TEAM[reliefName].series!==teamTab)reliefName=reliefOffer(teamTab);
  const n=reliefName;
  $('tRelief').innerHTML=`<div class="ccard coffer"><div class="cof1">${crest(n,48)}<div><h3>${esc(n)}</h3><p>${SERIES_NAME[teamTab]} · forza ${Math.round(qPower(n))}</p></div></div><p>La squadra è in piena crisi e lotta per non retrocedere. Il presidente cerca un nuovo allenatore: hai <b>una sola partita</b> per salvarla, poi comincia l’estate.</p><div class="schrow"><button type="button" class="go" id="tReAcc">Accetta</button><button type="button" class="sec" id="tReAlt">Un’altra squadra</button></div></div>`;
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
  $('coMsg').textContent='';
  const nw=coS.mode==='new';
  $('coWhy').textContent=nw?(coS.relief?`${coS.team} ti ha scelto come nuovo allenatore. Come ti chiami?`:`Stai per allenare ${coS.team}. Come ti chiami e che faccia hai?`):'Cambia nome o volto quando vuoi: compari nella schermata Partita, nelle notizie e nella Hall of Fame.';
  $('coN').value=coS.n;$('coS').value=coS.s;$('coGo').textContent=nw?'Inizia la carriera':'Salva';
  $('coDiffRow').classList.toggle('hidden',!nw);if(nw)coDiffPaint();
  coPaint();
}
// difficolta' della nuova carriera: quattro pulsanti e cosa cambia; si sceglie una volta sola
function coDiffPaint(){
  const cur=coS.diff||(coS.diff='easy');
  $('coDiff').innerHTML=['easy','med','hard','xtr'].map(k=>`<button type="button" class="sg${k===cur?' on':''}" data-k="${k}">${CAR_DIFF[k].name}</button>`).join('');
  $('coDiffN').textContent=CAR_DIFF[cur].txt+' Non potrai cambiarla durante la carriera.';
}
$('coDiff').addEventListener('click',e=>{const b=e.target.closest('[data-k]');if(!b||!coS)return;coS.diff=b.dataset.k;coDiffPaint();});
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
  const c=coachNorm({n:$('coN').value,s:$('coS').value,lk:coS.lk}),s=coS;
  if(s.mode==='new'&&!commitCareerDraft(s.team,c,s.relief,s.diff)){
    $('coMsg').textContent='Impossibile salvare la nuova carriera. Puoi riprovare o tornare indietro.';
    return;
  }
  coS=null;
  if(s.mode==='new'){showScreen('home');return;}
  SV.coach=c;persist();showScreen('home');
});
$('hCoach').addEventListener('click',()=>{if(SV.coach)openCoach({mode:'edit'});});

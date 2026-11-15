/* ---- CLUB > SOCIETA': sponsor con obiettivo, conti delle ultime partite, avviso del rosso (le regole sono in 30-carriera/26-economia-partita.js) ---- */
function sponsorCardHTML(){
  const d=SV.sp,o=SV.obj;
  const where=SV.event==='camp'&&SV.round>0?(isUS()?usObjNow():isLN()?lnObjNow():` · ora ${myRank()}ª`):'';
  const sp=d&&d.k?`<p><b>${esc(d.name)}</b> · ${SP_KIND[d.k].n.toLowerCase()}</p><p class="sub">${d.fix} crediti a ogni partita · bonus ${o?o.reward:0} a fine stagione</p>`:'<p>Sponsor da scegliere: si decide all’inizio della stagione.</p>';
  const ob=o?`<p>Obiettivo del contratto: <b>${esc(o.txt)}</b></p><p class="sub">Il bonus arriva solo se lo raggiungi${where}</p>`:'<p>Nessun obiettivo.</p>';
  const ch=SV.chal?`<h3 style="margin-top:8px">Sfida della dirigenza</h3><p><b>${esc(chalTxt())}</b></p><p class="sub">${SV.chal.done?(SV.chal.won?'Riuscita: premio incassato.':'Non riuscita in questa stagione.'):'Facoltativa: '+SV.chal.reward+' crediti e reputazione se riesce, niente se non riesce.'}</p>`:'';
  return `<div class="ccard"><h3>Sponsor e obiettivo</h3>${sp}${ob}${ch}</div>`;
}
function ledgerHTML(){
  const L=(SV.fin||[]).slice(0,8);
  if(!L.length)return '<div class="ccard"><h3>Conti delle partite</h3><p>Dopo la prima partita qui compaiono i conti di ogni giornata.</p></div>';
  const tot=L.reduce((a,x)=>a+x.n,0),vt={H:'casa',A:'trasf.',N:'neutro'};
  return `<div class="ccard"><h3>Conti delle partite</h3>${L.map(x=>`<div class="bgr"><span>${x.w?'V':'S'} · ${esc(x.o)} (${vt[x.v]})</span><b style="color:${x.n<0?'#ff6b70':'#8dffbd'}">${ecoSg(x.n)}</b></div>`).join('')}<div class="bgr ${tot<0?'bad':'tot'}"><span>Ultime ${L.length}</span><b>${ecoSg(tot)}</b></div></div>`;
}
function redNoteHTML(){
  if(SV.cash>=0)return '';
  const n=(SV.red&&SV.red.n)|0,lim=redLimit();
  return `<p class="bad">Conti in rosso da ${n} ${n===1?'partita':'partite'}: mercato, strutture e staff fermi, morale in calo. Se non rientri la dirigenza ti esonera (limite: ${lim} partite).</p>`;
}

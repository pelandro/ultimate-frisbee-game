/* ---- CLUB > SOCIETA': sponsor con obiettivo, conti delle ultime partite, avviso del rosso (le regole sono in 30-carriera/26-economia-partita.js) ---- */
function sponsorCardHTML(){
  const d=SV.sp,o=SV.obj;
  const where=SV.event==='camp'&&SV.round>0?(isUS()?usObjNow():isLN()?lnObjNow():` · ora ${myRank()}ª`):'';
  const choose=d?.off&&!SV.evt;
  const credits=n=>`<span class="credit-amount">${esc(n)} crediti<i class="coin" aria-hidden="true"></i></span>`;
  const bonus=o?spBonusTxt({...o,txt:esc(lc1(o.txt))},credits):'nessun bonus';
  const sp=d&&d.k?`<p>${spStripHTML(d.name)}</p><p class="sub">Contratto ${SP_KIND[d.k].n.toLowerCase()} · ${d.fix} crediti a ogni partita di campionato · ${bonus} · il marchio è sui cartelloni del tuo campo</p>`:`<p>Sponsor da scegliere.</p>${choose?'<button type="button" class="go" data-cl-sponsor>Scegli lo sponsor</button>':'<p class="sub">'+(d?.off?'Completa prima la decisione in sospeso.':'Le offerte arrivano a inizio stagione.')+'</p>'}`;
  const ob=o?`<p>Obiettivo del contratto: <b>${esc(o.txt)}</b></p><p class="sub">Il bonus dell’obiettivo arriva a fine stagione${where}</p>`:'<p>Nessun obiettivo.</p>';
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
  const remaining=Math.max(0,lim-n);
  const timing=remaining===0?'La dirigenza può intervenire alla prossima verifica.':remaining===1?'Resta una partita prima dell’esonero.':`Restano ${remaining} partite prima dell’esonero.`;
  return `<p class="bad">Saldo in rosso di ${Math.abs(SV.cash)} crediti. ${timing}</p><p class="sub">Per rientrare puoi cedere dalla rosa o incassare con le prossime partite.</p><button type="button" class="sec" data-cl-roster>Apri la rosa</button>`;
}

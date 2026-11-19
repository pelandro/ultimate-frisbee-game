// ---- fine stagione: una sola scheda per tutti i campionati (Italia, USA, leghe europee) ----
// Ordine di importanza: com'e' andata (titolo + pastiglie), poi il grande tasto per ripartire, poi i premi dietro un tasto e le spiegazioni dietro una «i».
// L'id #eReset resta quello di sempre: lo ascolta il gestore in 02-allenamenti.js.
const ordTxt=n=>n+'°';
function endSeasonHTML(o){
  const nx=SV.next,hx=SV.hist&&SV.hist[0];
  const title=String(nx.short||'').replace(' Per la prossima stagione si sblocca il Campionato europeo.','');   // la qualificazione europea e' una pastiglia a parte
  const pill=(k,v,cls)=>`<li${cls?` class="${cls}"`:''}><i>${k}</i><b>${v}</b></li>`;
  let pills='';
  if(nx.rank)pills+=pill(esc(o.rl||'Classifica'),ordTxt(nx.rank));
  if(nx.qual)pills+=pill('Qualificazione','EUCF','ok');
  if(nx.prize!==undefined)pills+=pill('Premio','+'+nx.prize+' crediti');
  if(SV.obj&&nx.prize!==undefined)pills+=pill('Sponsor',nx.objOk?'+'+(nx.objPay??SV.obj.reward)+' crediti':'nessun bonus',nx.objOk?'ok':'ko');
  if(Number.isFinite(SV.cash))pills+=pill('Saldo attuale',Math.round(SV.cash)+' crediti');
  if(hx&&hx.mvp)pills+=pill('MVP',esc(hx.mvp)+' ('+hx.mvpS+')');
  const aw=hx&&hx.aw&&hx.aw.length?`<div class="seas"><h3>Premi della stagione · ${esc(o.awTitle||SERIES_NAME[SV.sr])}</h3><ul class="awl">${hx.aw.map(awRow).join('')}</ul>${hx.best7&&hx.best7.length?`<p>Squadra ideale: ${hx.best7.map(q=>`${q.mine?'<b style="color:var(--gold)">':'<b>'}${esc(q.name)}</b> (${q.pos})`).join(', ')}</p>`:''}</div>`:'';
  const europe=euBeforeNewSeason();
  const action=europe
    ?`<button type="button" class="go endgo" id="eEurope">${euActive()?"Vai all’EUCF":"Gioca l’EUCF"}</button><p class="endn">Concludi l’EUCF per iniziare il prossimo campionato.</p>`
    :`<button type="button" class="go endgo" id="eReset">Inizia la nuova stagione</button><p class="endn">Tutti invecchiano di un anno ${infoB('endnew')}</p>`;
  return `<section class="endc${nx.tit?' tit':''}"><div class="endm"><small>Stagione ${SV.season} conclusa · ${esc(o.awTitle||SERIES_NAME[SV.sr])}</small><h2>${esc(title)}</h2>${pills?`<ul class="endp">${pills}</ul>`:''}</div>`
    +`<div class="endg">${action}</div></section>`
    +(europe?'':infoX('endnew','<p>La rosa torna in piena forma. Le giornate senza partita diventano allenamenti e in Posta trovi i maggiori progressi dell’estate.</p><p>Tutti invecchiano di un anno e il mercato si rinnova.</p>'))
    +(aw?`<button type="button" class="endtog${INFO_ON.has('endaw')?' on':''}" data-info="endaw" aria-expanded="${INFO_ON.has('endaw')}">Premi e squadra ideale</button>${infoX('endaw',aw)}`:'');
}

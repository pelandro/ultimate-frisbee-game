/* ---- MERCATO ---- */
let mkMsg='';
let mkTab='all';const mkOpen=new Set();
// ordinamento e filtro «solo chi posso prendere»: l'elenco arriva a 20 giocatori e i piu' interessanti non sono sempre in cima
let mkSort='def',mkOnly=false;
const MK_SORT={def:['Categoria',null],price:['Prezzo',(a,b)=>a.price-b.price],ovr:['Overall',(a,b)=>ovrX(b.o)-ovrX(a.o)],pot:['Potenziale',(a,b)=>{const x=potRange(a.o),y=potRange(b.o);return (y[0]+y[1])-(x[0]+x[1]);}],age:['Età',(a,b)=>a.o.age-b.o.age],val:['Qualità/prezzo',(a,b)=>ovrX(b.o)/Math.max(1,b.price)-ovrX(a.o)/Math.max(1,a.price)]};
const MK_TABS=[['all','Tutti'],['int','Internazionali'],['you','Giovani'],['free','Svincolati'],['sale','In vendita']];
const mkCat=m=>m.star?'int':(m.from?'sale':(m.kind==='Giovane promessa'?'you':'free'));
function renderMarket(){
  $('mkTop').innerHTML=`<span>Crediti <b>${SV.cash}</b></span><span>Rosa <b>${SQ.length}</b>/${SQ_MAX}</span><span>Reputazione <b>${Math.round(SV.rep)}</b>: firmano giocatori fino a OVR <b>${Math.floor(repCap())}</b></span>`;
  $('mkTabs').innerHTML=MK_TABS.map(t=>`<button type="button" data-k="${t[0]}" class="${mkTab===t[0]?'on':''}">${t[1]} <small>${t[0]==='all'?SV.market.length:SV.market.filter(m=>mkCat(m)===t[0]).length}</small></button>`).join('');
  const row=(m,i)=>{
    const o=m.o,why=canSign(m),v=ovr(o);
    return `<tr class="${m.star?'star':''}"><td><span class="rn">${avatar({look:makeLook(o.full||o.n,o.f),t:0},30)}<span>${esc(o.label||o.n)}${m.star?'<span class="stb">★</span>':''}${traitBadge(o)}<small class="rl">${o.ae?'circa ':''}${o.age} anni · ${POS_NAME[posOf(o)]} · ${m.kind}${m.from?' ('+esc(m.from)+')':(m.nat?' · '+esc(m.nat):'')}</small></span></span></td><td><b class="ov ${ovrCls(v)}">${v}</b></td><td class="pot">${potTxt(o)}</td><td>${m.price}</td><td class="mka"><button type="button" class="sec" data-sc="${i}"${(o.sk|0)>=3||SV.cash<scoutCost()?' disabled':''}>Osserva · ${scoutCost()}</button><button type="button" class="sec" data-rp="${i}">${mkOpen.has(o.full||o.n)?'Chiudi':'Rapporto'}</button><button type="button" class="go sm" data-buy="${i}"${why?' disabled':''} title="${esc(why)}">${why?(/Rosa/.test(why)?'Rosa piena':(/Crediti/.test(why)?'Crediti scarsi':'Poca reputazione')):'Acquista'}</button></td></tr>${mkOpen.has(o.full||o.n)?`<tr class="dt"><td colspan="5"><div class="dst scr">${scoutReport(o)}</div>${cmpTarget(o)?`<div class="dst"><b style="color:var(--gold);font-weight:400">Confronto con ${esc(pname(cmpTarget(o)))}</b>, il titolare più debole nel ruolo</div>${compareHTML(o,cmpTarget(o),o.label||o.n,pname(cmpTarget(o)))}`:''}</td></tr>`:''}`;
  };
  const rows=SV.market.map((m,i)=>[m,i]).filter(x=>(mkTab==='all'||mkCat(x[0])===mkTab)&&(!mkOnly||!canSign(x[0])));
  if(MK_SORT[mkSort][1])rows.sort((x,y)=>MK_SORT[mkSort][1](x[0],y[0]));
  const can=SV.market.filter(m=>!canSign(m)).length;
  const bar=`<div class="rbar"><label class="rchk"><input type="checkbox" data-mkonly="1"${mkOnly?' checked':''}> Solo chi posso prendere (${can})</label><label class="rsort">Ordina per <select class="qs" data-mksort="1">${Object.keys(MK_SORT).map(k=>`<option value="${k}"${mkSort===k?' selected':''}>${MK_SORT[k][0]}</option>`).join('')}</select></label></div>`;
  $('mkBox').innerHTML=(mkMsg?`<p class="rmsg">${mkMsg}</p>`:'')+bar+(rows.length?`<table class="rt"><tr><th>Giocatore</th><th>OVR</th><th>POT</th><th>Prezzo</th><th></th></tr>${rows.map(x=>row(x[0],x[1])).join('')}</table>`:`<p class="note">${mkOnly?'Nessuno che tu possa prendere adesso in questa categoria: servono più crediti, più reputazione o un posto in rosa.':'Nessun giocatore in questa categoria: il mercato si rinnova ogni 5 giornate.'}</p>`);
}
$('mkTabs').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;mkTab=b.dataset.k;mkMsg='';renderMarket();});
$('mkBox').addEventListener('change',e=>{if(e.target.closest('[data-mksort]')){mkSort=e.target.value;renderMarket();}else if(e.target.closest('[data-mkonly]')){mkOnly=e.target.checked;renderMarket();}});
$('mkBox').addEventListener('click',e=>{
  const rp=e.target.closest('[data-rp]');if(rp){const m=SV.market[+rp.dataset.rp],k=m&&(m.o.full||m.o.n);if(k){if(mkOpen.has(k))mkOpen.delete(k);else mkOpen.add(k);}renderMarket();return;}
  const sc=e.target.closest('[data-sc]'),by=e.target.closest('[data-buy]');
  if(sc){const m=SV.market[+sc.dataset.sc];if(m&&scoutPlayer(m.o)){mkMsg=`Osservato ${m.o.label||m.o.n}: potenziale ${potTxt(m.o)}.`;persist();}renderMarket();}
  else if(by){const m=SV.market[+by.dataset.buy];if(m){const nm=m.o.label||m.o.n;if(signPlayer(+by.dataset.buy)){mkMsg=`${nm} è un nuovo giocatore della squadra. Mettilo in una linea dalla Rosa.`;persist();}}renderMarket();}
});

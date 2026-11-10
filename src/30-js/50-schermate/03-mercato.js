/* ---- MERCATO ---- */
let mkMsg='';
let mkTab='all';
const MK_TABS=[['all','Tutti'],['int','Internazionali'],['you','Giovani'],['free','Svincolati'],['sale','In vendita']];
const mkCat=m=>m.star?'int':(m.from?'sale':(m.kind==='Giovane promessa'?'you':'free'));
function renderMarket(){
  $('mkTop').innerHTML=`<span>Crediti <b>${SV.cash}</b></span><span>Rosa <b>${SQ.length}</b>/${SQ_MAX}</span><span>Reputazione <b>${Math.round(SV.rep)}</b>: firmano giocatori fino a OVR <b>${Math.floor(repCap())}</b></span>`;
  $('mkTabs').innerHTML=MK_TABS.map(t=>`<button type="button" data-k="${t[0]}" class="${mkTab===t[0]?'on':''}">${t[1]} <small>${t[0]==='all'?SV.market.length:SV.market.filter(m=>mkCat(m)===t[0]).length}</small></button>`).join('');
  const row=(m,i)=>{
    const o=m.o,why=canSign(m),v=ovr(o);
    return `<tr class="${m.star?'star':''}"><td><span class="rn">${avatar({look:makeLook(o.full||o.n,o.f),t:0},30)}<span>${esc(o.label||o.n)}${m.star?'<span class="stb">★</span>':''}${traitBadge(o)}<small class="rl">${o.ae?'circa ':''}${o.age} anni · ${POS_NAME[posOf(o)]} · ${m.kind}${m.from?' ('+esc(m.from)+')':(m.nat?' · '+esc(m.nat):'')}</small></span></span></td><td><b class="ov ${ovrCls(v)}">${v}</b></td><td class="pot">${potTxt(o)}</td><td>${m.price}</td><td class="mka"><button type="button" class="sec" data-sc="${i}"${(o.sk|0)>=3||SV.cash<SCOUT_COST?' disabled':''}>Osserva · ${SCOUT_COST}</button><button type="button" class="go sm" data-buy="${i}"${why?' disabled':''} title="${esc(why)}">${why?(/Rosa/.test(why)?'Rosa piena':(/Crediti/.test(why)?'Crediti scarsi':'Poca reputazione')):'Acquista'}</button></td></tr>`;
  };
  const rows=SV.market.map((m,i)=>[m,i]).filter(x=>mkTab==='all'||mkCat(x[0])===mkTab);
  $('mkBox').innerHTML=(mkMsg?`<p class="rmsg">${mkMsg}</p>`:'')+(rows.length?`<table class="rt"><tr><th>Giocatore</th><th>OVR</th><th>POT</th><th>Prezzo</th><th></th></tr>${rows.map(x=>row(x[0],x[1])).join('')}</table>`:'<p class="note">Nessun giocatore in questa categoria: il mercato si rinnova ogni 5 giornate.</p>');
}
$('mkTabs').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;mkTab=b.dataset.k;mkMsg='';renderMarket();});
$('mkBox').addEventListener('click',e=>{
  const sc=e.target.closest('[data-sc]'),by=e.target.closest('[data-buy]');
  if(sc){const m=SV.market[+sc.dataset.sc];if(m&&scoutPlayer(m.o)){mkMsg=`Osservato ${m.o.label||m.o.n}: potenziale ${potTxt(m.o)}.`;persist();}renderMarket();}
  else if(by){const m=SV.market[+by.dataset.buy];if(m){const nm=m.o.label||m.o.n;if(signPlayer(+by.dataset.buy)){mkMsg=`${nm} è un nuovo giocatore della squadra. Mettilo in una linea dalla Rosa.`;persist();}}renderMarket();}
});

/* ---- MERCATO ---- */
let mkMsg='';
let mkTab='all';const mkOpen=new Set();
// ordinamento e filtro «solo chi posso prendere»: l'elenco arriva a 20 giocatori e i piu' interessanti non sono sempre in cima
let mkSort='def',mkOnly=false;
const MK_SORT={def:['Categoria',null],price:['Prezzo',(a,b)=>a.price-b.price],ovr:['Overall',(a,b)=>ovrX(b.o)-ovrX(a.o)],pot:['Potenziale',(a,b)=>{const x=potRange(a.o),y=potRange(b.o);return (y[0]+y[1])-(x[0]+x[1]);}],age:['Età',(a,b)=>a.o.age-b.o.age],val:['Qualità/prezzo',(a,b)=>ovrX(b.o)/Math.max(1,b.price)-ovrX(a.o)/Math.max(1,a.price)]};
const MK_TABS=[['all','Tutti'],['int','Internazionali'],['you','Giovani'],['free','Svincolati'],['sale','In vendita']];
const mkCat=m=>m.star||m.fc?'int':(m.kind==='Giovane promessa'?'you':(m.from?'sale':'free'));   // tutti giocatori veri: i giovani hanno un club (m.from), gli stranieri m.fc (33-mercato-veri.js)
function renderMarket(){
  mkReprice();
  $('mkTop').innerHTML=`${infoB('mk')}<span>Rosa <b>${SQ.length}</b>/${SQ_MAX}</span><span>Reputazione <b>${Math.round(SV.rep)}</b>: firmano giocatori fino a OVR <b>${Math.floor(repCap())}</b></span>`;
  $('mkTabs').innerHTML=MK_TABS.map(t=>`<button type="button" data-k="${t[0]}" class="${mkTab===t[0]?'on':''}">${t[1]} <small>${t[0]==='all'?SV.market.length:SV.market.filter(m=>mkCat(m)===t[0]).length}</small></button>`).join('');
  const row=(m,i)=>{
    const o=m.o,why=canSign(m),v=ovr(o),pos=posOf(o),open=mkOpen.has(o.full||o.n);
    const same=SQ.filter(p=>posOf(p)===pos).sort((x,y)=>ovr(x)-ovr(y))[0],d=same?v-ovr(same):0;   // chi sostituirebbe: il piu' debole del suo ruolo
    const rep=same?`<span class="mrp ${d>0?'up':(d<0?'dn':'')}">${d>0?'▲':(d<0?'▼':'=')} ${d>0?'+':''}${d} su ${esc(same.nick||same.name)}</span>`:'';
    const lock=why?(/Rosa/.test(why)?'Rosa piena':(/Fondi/.test(why)?'Fondi insufficienti':(/titolare/.test(why)?'Vuole giocare':(/Serie C/.test(why)?'Punta più in alto':'Poca reputazione')))):'';
    return `<div class="mcard${m.star?' star':''}${why?' lk':''}" style="--rc:${ROLE_COL[pos]||'#2f7bff'}"><div class="mch"><span class="mav">${avatar({look:makeLook(o.full||o.n,o.f),full:o.full,label:o.label,name:o.n,gen:o.gen,f:o.f,club:m.from||m.fc,t:0},40)}</span><div class="mn"><b>${esc(o.label||o.n)}${m.star?'<span class="stb">★</span>':''}${traitBadge(o)}</b><small>${POS_NAME[pos]} · ${o.age} anni · ${m.kind}${m.from?' ('+esc(m.from)+')':(m.nat?' · '+esc(m.nat):'')}</small>${motLineHTML(m)}</div><b class="ov ovbig ${ovrCls(v)}">${v}</b></div>
      <div class="mst"><span>Pot. <b>${potTxt(o)}</b></span>${rep}<span class="mwg" title="Stipendio a partita">stip. ${(Math.round(wageOf(o)/1.5)/10).toString().replace('.',',')}/partita</span><span class="mpr">${m.price} <i class="coin"></i></span></div>
      <div class="mka"><button type="button" class="sec" data-rp="${i}">${open?'Chiudi':'Dettagli'}</button><button type="button" class="go sm" data-buy="${i}"${why?' disabled':''} title="${esc(why)}">${why?lock:'Acquista'}</button></div>
      ${open?`<div class="mdt"><div class="dst"><b style="color:#7fd8ff;font-weight:400">Compatibilità tattica</b>: ${FIT_TXT[fitOf(o)]}.${m.mot&&MOT[m.mot]?` <b style="color:#7fd8ff;font-weight:400">Motivazione</b>: ${MOT[m.mot][0].toLowerCase()} (${MOT[m.mot][1]}).`:''}</div><div class="dst scr">${scoutReport(o)}</div><div class="dst"><button type="button" class="sec" data-sc="${i}"${(o.sk|0)>=3||SV.cash<scoutCost(o)?' disabled':''}>${(o.sk|0)>=3?'Osservato al massimo':'Osserva · '+scoutCost(o)+' crediti'}</button> <small>Ogni osservazione riduce l’incertezza sul potenziale.</small></div>${cmpTarget(o)?`<div class="dst"><b style="color:var(--gold);font-weight:400">Confronto con ${esc(pname(cmpTarget(o)))}</b>, il titolare più debole nel ruolo</div>${compareHTML(o,cmpTarget(o),o.label||o.n,pname(cmpTarget(o)))}`:''}</div>`:''}</div>`;
  };
  const rows=SV.market.map((m,i)=>[m,i]).filter(x=>(mkTab==='all'||mkCat(x[0])===mkTab)&&(!mkOnly||!canSign(x[0])));
  if(MK_SORT[mkSort][1])rows.sort((x,y)=>MK_SORT[mkSort][1](x[0],y[0]));
  const can=SV.market.filter(m=>!canSign(m)).length;
  const bar=`<div class="rbar"><label class="rchk"><input type="checkbox" data-mkonly="1"${mkOnly?' checked':''}> Solo chi posso prendere (${can})</label><label class="rsort">Ordina per <select class="qs" data-mksort="1">${Object.keys(MK_SORT).map(k=>`<option value="${k}"${mkSort===k?' selected':''}>${MK_SORT[k][0]}</option>`).join('')}</select></label></div>`;
  $('mkBox').innerHTML=infoX('mk',MK_INFO)+mkNewsHTML()+(mkMsg?`<p class="rmsg">${mkMsg}</p>`:'')+bar+(rows.length?`<div class="mgrid">${rows.map(x=>row(x[0],x[1])).join('')}</div>`:`<p class="note">${mkOnly?'Nessun acquisto disponibile con questi filtri. Prova un’altra categoria o togli «Solo chi posso prendere».':'Nessun giocatore in questa categoria: il mercato si rinnova ogni 5 giornate.'}</p>`);
}
$('mkTabs').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;mkTab=b.dataset.k;mkMsg='';renderMarket();});
$('mkBox').addEventListener('change',e=>{if(e.target.closest('[data-mksort]')){mkSort=e.target.value;renderMarket();}else if(e.target.closest('[data-mkonly]')){mkOnly=e.target.checked;renderMarket();}});
$('mkBox').addEventListener('click',e=>{
  const rp=e.target.closest('[data-rp]');if(rp){const m=SV.market[+rp.dataset.rp],k=m&&(m.o.full||m.o.n);if(k){if(mkOpen.has(k))mkOpen.delete(k);else mkOpen.add(k);}renderMarket();return;}
  const sc=e.target.closest('[data-sc]'),by=e.target.closest('[data-buy]');
  if(sc){const m=SV.market[+sc.dataset.sc];if(m&&scoutPlayer(m.o)){mkMsg=`Osservato ${m.o.label||m.o.n}: potenziale ${potTxt(m.o)}.`;persist();}renderMarket();}
  else if(by){const i=+by.dataset.buy,m=SV.market[i];if(m&&!canSign(m))askConfirm(mkBuySummary(m,()=>{const k=SV.market.indexOf(m),nm=m.o.label||m.o.n;if(k>=0&&signPlayer(k)){mkMsg=`${esc(nm)} entra in rosa. Assegna una linea da Squadra.`;persist();}renderMarket();}));}
});
// riepilogo prima di comprare: prezzo, crediti che restano, stipendio in piu' a ogni partita, posto in rosa e chi sostituirebbe nel suo ruolo
function mkBuySummary(m,onOk){
  const o=m.o,v=ovr(o),pos=posOf(o),w0=wageSeason(SQ)/15,w1=wageSeason(SQ.concat([o]))/15,dw=w1-w0,after=SV.cash-m.price;
  const f1=x=>(Math.round(x*10)/10).toString().replace('.',',');
  const same=SQ.filter(p=>posOf(p)===pos).sort((x,y)=>ovr(x)-ovr(y))[0],d=same?v-ovr(same):0;
  const row=(k,val,cls)=>`<tr><td>${k}</td><td${cls?` class="${cls}"`:''}>${val}</td></tr>`;
  const html=`<p><b>${esc(o.label||o.n)}</b> · ${POS_NAME[pos]} · ${o.age} anni · OVR <b>${v}</b> · pot. ${potTxt(o)}</p>`
    +`<table class="cfmt">${row('Prezzo',m.price+' crediti')}${row('Ti restano',after+' crediti',after<30?'bad':'')}${row('Stipendi a partita',`${Math.round(w0)} → ${Math.round(w1)} crediti (+${f1(dw)})`)}${row('Rosa',`${SQ.length} → ${SQ.length+1} su ${SQ_MAX}`)}${same?row('Nel suo ruolo',`${d>0?'+':''}${d} sul più debole (${esc(same.nick||same.name)}, ${ovr(same)})`,d>0?'ok':(d<0?'bad':'')):''}</table>`
    +(m.mot&&MOT[m.mot]?`<p>Motivazione: ${esc(MOT[m.mot][0].toLowerCase())}.</p>`:'');
  return {title:'Confermi l’acquisto?',html,ok:'Acquista per '+m.price,onOk};
}

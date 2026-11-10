/* ---- menu di inizio meta ---- */
const ATTS=[
  {id:'vert',name:'Verticale',desc:'Cutter in fila al centro: tagli profondi e di rientro.',pos:[[.1,.5],[.24,.15],[.24,.85],[.45,.5],[.58,.5],[.71,.5],[.84,.5]]},
  {id:'horz',name:'Orizzontale',desc:'Cutter in linea obliqua sul campo, handler dietro il disco.',pos:[[.1,.5],[.24,.12],[.24,.88],[.48,.1],[.56,.37],[.64,.63],[.72,.9]]},
  {id:'hex',name:'Esagono',desc:'Tutti spaziati: molti tagli corti e campo largo.',pos:[[.14,.25],[.14,.75],[.36,.08],[.36,.92],[.56,.5],[.8,.25],[.8,.75]]}
];
ATTS.push({id:'side',name:'Stack laterale',desc:'Cutter in fila su un lato: mezzo campo libero per i tagli in isolamento.',pos:[[.1,.5],[.24,.2],[.3,.36],[.46,.85],[.58,.85],[.7,.85],[.82,.84]]});
ATTS.push({id:'t1',name:'T1',desc:'Sequenza: un cutter taglia verso il disco, poi taglio in meta o di rientro. Si segue alla lettera con Visione alta.',pos:[[.19,.51],[.09,.13],[.09,.90],[.5,.06],[.5,.36],[.5,.63],[.5,.93]]});
const DEFS=[
  {id:'man_out',name:'Uomo, forza fuori',desc:'Il marcatore chiude il centro: il disco va verso la linea.',pos:[[.1,.5],[.26,.15],[.26,.85],[.46,.5],[.6,.5],[.74,.5],[.88,.5]]},
  {id:'man_in',name:'Uomo, forza dentro',desc:'Il marcatore chiude la linea: lanci verso il centro.',pos:[[.1,.5],[.26,.15],[.26,.85],[.46,.5],[.6,.5],[.74,.5],[.88,.5]]},
  {id:'zone',name:'Zona a coppa',desc:'Tre sul disco a coppa, quattro dietro per chiudere gli spazi.',pos:[[.2,.5],[.32,.22],[.32,.78],[.55,.16],[.55,.84],[.8,.34],[.8,.66]]},
  {id:'man_poach',name:'Uomo con aiuti',desc:'Chi marca un uomo lontano dal disco scala sulle linee di passaggio: più intercetti, ma un taglio improvviso lo trova in ritardo.',pos:[[.1,.5],[.26,.15],[.26,.85],[.42,.5],[.52,.5],[.62,.5],[.72,.5]]}
];
function icon(o,col){
  const dots=o.pos.map(p=>`<rect x="${(p[0]*100-2.6).toFixed(1)}" y="${(p[1]*50-4.2).toFixed(1)}" width="5.2" height="8.4" fill="${col}" stroke="#10131f" stroke-width="1.2"/>`).join('');
  return `<svg viewBox="0 0 100 50" preserveAspectRatio="none" aria-hidden="true"><rect x="1" y="1" width="98" height="48" fill="none" stroke="rgba(255,255,255,.55)"/>${dots}</svg>`;
}
function buildOpts(box,list,col,cur,set){
  box.innerHTML='';
  for(const o of list){
    const b=document.createElement('button');b.className='opt'+(o.id===cur?' on':'');b.type='button';
    b.innerHTML=icon(o,col)+`<strong>${o.name}</strong><span>${o.desc}</span>`;
    b.addEventListener('click',()=>{set(o.id);for(const x of box.children)x.classList.remove('on');b.classList.add('on');});
    box.appendChild(b);
  }
}
function openSchemes(first,fromHome){
  G.schemeOpen=true;$('menu').classList.remove('hidden');$('over').classList.add('hidden');
  $('mTitle').textContent='Schemi';
  $('mScore').textContent=`${G.myName||'Blu'} ${G.score[0]} – ${G.score[1]} ${G.oppName||'Rossi'}`;
  $('hAtt').textContent='Attacco';$('hDef').textContent='Difesa';
  // a inizio meta si sceglie solo lo schema che serve: se difendi (tiri tu il pull) quello difensivo, se attacchi quello d'attacco
  const role=(G.inMatch&&G.mode==='ready'&&!fromHome)?(G.pullTeam===0?'def':'att'):'both';
  $('hAtt').parentElement.classList.toggle('hidden',role==='def');$('hDef').parentElement.classList.toggle('hidden',role==='att');
  $('mSub').textContent=(role==='def'?'In questa meta difendi: scegli lo schema difensivo.':(role==='att'?'In questa meta attacchi: scegli lo schema d’attacco.':'Restano quelli scelti finché non li cambi.'))+(G.inMatch&&G.idn&&G.idn[1]&&G.idn[1].tags.length?' Stile degli avversari: '+G.idn[1].tags.join(', ')+'.':'');
  buildOpts($('optAtt'),ATTS,'#2f7bff',G.sch.att,v=>{G.sch.att=v;});
  buildOpts($('optDef'),DEFS,'#ff4b4b',G.sch.def,v=>{G.sch.def=v;});
  $('mTip').textContent=first?'Prima partita? Il tutorial è nel menu iniziale, alla voce Allenamento; la guida è nel menu di pausa (II).':'';
}
function showOver(){
  const w=G.score[0]>G.score[1],on=G.oppName||'Rossi';
  let msg='',grow=[];
  const hurt=QM.on?[]:SQ.filter(p=>p.injNew);
  if(G.inMatch&&!G.recorded){G.recorded=true;restoreForm();if(!QM.on){grow=matchGrowth(0);recordMatchStats();msg=recordResult(w,G.score[0],G.score[1])+incTxt();}else if(UT.on)msg=utRecord(w);else if(TN.on)msg=tnRecord(w,G.score[0],G.score[1]);else msg='Partita veloce: non cambia la carriera.';}
  // migliore in campo (più esperienza raccolta) e crescita, raggruppata per giocatore
  let gh='';
  if(!QM.on){
    const best=SQ.filter(p=>p.m&&p.m.pts>0).sort((a,b)=>(b.xpLast||0)-(a.xpLast||0))[0];
    if(best)gh+=`<div class="mvp">Migliore in campo: ${best.label||best.name} (${best.m.g|0} mete, ${best.m.a|0} assist, ${best.m.dif|0} difese)</div>`;
    const by=new Map();for(const g of grow){if(!by.has(g.p))by.set(g.p,[]);by.get(g.p).push(g);}
    if(by.size)gh+='<strong>Crescita in partita</strong>'+[...by].map(([p,l])=>`<div>${p.name}: ${l.map(g=>`${LONG[g.k]} ${g.from}→${g.to}`).join(', ')}</div>`).join('');
  }
  $('oGrow').innerHTML=gh;
  $('oTitle').textContent=w?'Vittoria!':'Sconfitta';
  $('oScore').textContent=`${G.myName||'Blu'} ${G.score[0]} – ${G.score[1]} ${on}`;
  $('oEvent').textContent=msg;
  $('oInj').textContent=hurt.length?'Infortuni: '+hurt.map(p=>`${p.name} (${p.inj} ${p.inj>1?'partite':'partita'} di stop)`).join(', ')+'.':'';
  const pct=t=>G.st.thr[t]?Math.round(G.st.cmp[t]/G.st.thr[t]*100)+'%':'–';
  const rows=[['',G.myName||'Blu',on],['Lanci riusciti',pct(0),pct(1)],['Turnover causati',G.st.to[1],G.st.to[0]],['Salti vinti',G.st.jump[0],G.st.jump[1]],['Tuffi riusciti',G.st.dive[0],G.st.dive[1]],['Handblock',G.st.hb[0],G.st.hb[1]],['Prese mancate',G.st.drop[0],G.st.drop[1]]];
  $('oStats').innerHTML=rows.map((r,i)=>r.map(c=>`<span class="${i===0?'hd':''}">${c}</span>`).join('')).join('');
  $('over').classList.remove('hidden');
}
$('bGo').addEventListener('click',()=>{
  $('menu').classList.add('hidden');G.schemeOpen=false;
  if(G.mode==='ready')placeTeams(G.poss);
});
$('bAgain').addEventListener('click',()=>{if(QM.on){exitQuick(quickNext());return;}$('over').classList.add('hidden');G.inMatch=false;showScreen('home');});


/* ===================== LEGHE EUROPEE: SCHERMATE =====================
   Tutto cio' che l'interfaccia mostra solo nelle carriere in Belgio, Francia, Germania e Regno Unito: scelta del livello e del club, cruscotto, linea delle giornate,
   cartello prima delle partite che contano e la schermata Classifica con tre viste (Girone, Fase finale, Livelli). Le regole stanno in 37-leghe/.
   Le schermate italiane le chiamano con una riga quando SV.lk e' uno dei campionati di LN_DEF. */
let lnTabSel='grp',lnPoolSel=-1,lnTabPh='',teamTier='';
const lnShort=()=>SV.ln.ph==='grp'?`Giornata ${SV.round+1} di ${totalRounds()}`:(SV.po&&SV.po.on?lnLabel():'Fase finale');
const lnInfo=()=>{
  if(SV.done)return `${SERIES_NAME[SV.sr]} · Stagione ${SV.season} · conclusa`;
  return `${SERIES_NAME[SV.sr]} · Stagione ${SV.season}`+(SV.ln.ph==='grp'?(SV.round>0?` · ${myRank()}° nel girone`:''):' · fase finale');
};
function lnHomeTab(){   // riquadro «classifica» del cruscotto durante le fasi finali
  const L=SV.ln;if(!L.F||!SV.po||!SV.po.on)return `<div class="me"><span>${esc(L.ph==='done'?'Stagione conclusa':'Fase finale')}</span><b></b></div>`;
  const lv=L.F.lv[SV.po.li],pos=lv?`${lv.base}°-${lv.base+lv.T.length-1}°`:'';
  return `<div class="me"><span>${esc(lnLabel())}</span><b></b></div><div><span>Posti in palio</span><b>${pos}</b></div>`;
}
const lnOppAt=r=>{const names=SV.mem[SV.sr],ui=names.indexOf(SV.team),m=SV.sched[r]&&SV.sched[r].find(x=>x[0]===ui||x[1]===ui);return m?names[m[0]===ui?m[1]:m[0]]:'';};
function lnTimelineHTML(node){
  const L=SV.ln,po=SV.po&&SV.po.on,R=SV.sched.length,last=SV.res[SV.res.length-1],lastN=SV.res.length;
  let prev;
  if(SV.po&&SV.po.last){const l=SV.po.last;prev=node(l.win?'w':'l',(l.win?'V ':'S ')+l.su+'–'+l.so,(l.label||'Fase finale')+' · '+shortN(l.opp));}
  else prev=last?node(last.su>last.so?'w':'l',(last.su>last.so?'V ':'S ')+last.su+'–'+last.so,'G'+lastN+' · '+shortN(last.opp)):node('f','Inizio','stagione '+SV.season);
  let cur,nxt;
  if(SV.done){cur=node('n','Fine','posto '+(SV.next?SV.next.rank:myRank())+'°');nxt=node('f','Nuova','stagione');}
  else if(po){cur=node('n',lnLabel(),shortN(SV.po.opp));nxt=node('f',L.F&&L.F.rd+1<L.F.rounds?'Turno dopo':'Fine','stagione');}
  else{
    const o=lnOppAt(SV.round);cur=node('n','G'+(SV.round+1)+' di '+R,shortN(o)+(o===SV.riv?' · derby':''));
    nxt=SV.round+1<R?node('f','G'+(SV.round+2),shortN(lnOppAt(SV.round+1))||'riposo'):node('f',lnTierDef().fin.length?'Fase finale':'Fine','stagione');
  }
  return `<div class="tline">${[prev,cur,nxt].join('')}</div>`;
}
// cartello prima delle partite che contano
function lnStakes(m){
  const L=SV.ln,po=SV.po,lines=[];let tag='',title='';
  if(po&&po.on){
    tag='Fase finale';title=lnLabel();
    const lv=L.F.lv[po.li],b=lv.base;
    if(lv.m==='k4'){lines.push('Chi perde è eliminato.');if(L.F.rd===L.F.rounds-1)lines.push(b>1?'Chi vince sale in Serie A insieme alla prima del girone.':'Chi vince è campione.');}
    else{
    lines.push(lv.m==='rr'?'Minigirone per le posizioni '+b+'°-'+(b+lv.T.length-1)+'°: ogni partita conta per il piazzamento.':'Si gioca per il piazzamento: nessuno è eliminato, ma ogni posizione vale premio e punti di reputazione.');
    if(L.F.rd===L.F.rounds-1&&lv.base===1&&lv.m!=='rr')lines.push(po.k===0?'Chi vince è campione.':'Posizione finale in palio.');}
  }else{
    const names=SV.mem[SV.sr],ord=ranking(SV.tab,names),rk=ord.indexOf(SV.team)+1,last=SV.round===SV.sched.length-1;
    if(m.name===SV.riv){tag='Rivalità';title='Derby';const rr=SV.rivRec||{w:0,l:0};lines.push(`Contro ${m.name} vale di più: incasso, morale e reputazione.${rr.w+rr.l?` Finora ${rr.w} ${rr.w===1?'vinto':'vinti'} e ${rr.l} ${rr.l===1?'perso':'persi'}.`:''}`);}
    if(last){tag=tag||'Ultima giornata';title=title||(lnTierDef().fin.length?'Il girone decide il tabellone':'Ultima giornata');lines.push(`Siete ${rk}° nel girone: ${lnTierDef().fin.length?'la posizione decide il tabellone e gli avversari delle fasi finali.':'è l’ultima partita della stagione.'}`);}
  }
  return {tag,title,lines};
}
// ---- scelta del livello e del club (schermata «Scegli la tua squadra») ----
const lnPrevCache={},lnPreview=n=>lnPrevCache[n]||(lnPrevCache[n]=Math.round(rosterPower(lnRoster(n,'preview|'+n))));   // forza con cui si parte davvero
function renderTeamsLN(){
  const lk=teamLg,D=LN_DEF[lk];
  $('tMode').classList.add('hidden');$('tRelief').classList.add('hidden');$('tTeams').classList.remove('hidden');
  if(!D.tiers.some(t=>t.id===teamTier))teamTier=D.tiers[0].id;
  $('tSr').innerHTML=D.tiers.map(t=>`<button type="button" data-k="${t.id}">${esc(t.name)}</button>`).join('');
  for(const b of $('tSr').children)b.classList.toggle('on',b.dataset.k===teamTier);
  const tr=D.tiers.find(t=>t.id===teamTier);
  $('tNote').textContent=`${tr.name}: ${lnFormatTxt(tr)}. ${lnMoveTxt(tr,lk)}`;
  const cl=lnClubRows(lk).filter(r=>r[1]===teamTier).map(r=>r[0]).sort((a,b)=>favFirst(a,b)||lnBasePower(b)-lnBasePower(a));
  $('tTeams').innerHTML=cl.map((n,i)=>`<button type="button" class="tteam" data-n="${n.replace(/"/g,'&quot;')}"><span class="tn">${crest(n,22)}<span>${favMark(n)}${esc(n)}<small class="tcity">${esc(D.cc)} · ${esc(tr.name)} · n° ${i+1}</small></span></span><b class="tp">${lnPreview(n)}</b></button>`).join('');
}
// descrizione breve di un livello: girone (con quante partite) e playoff
function lnFormatTxt(tr){
  const lk=LN_IDS.find(k=>LN_DEF[k].tiers.includes(tr)||(LN_OLD[k]&&LN_OLD[k].tiers.includes(tr))),tg=lk?lnTierGames(lk,tr):null;
  const legs=tg&&tg.one?Math.round(tg.g/tg.one):1,g=(tr.pools>1?`${tr.pools} gironi${tr.geo?' geografici (ovest ed est)':''}`:'girone unico')+(legs>1?', andata e ritorno':', sola andata')+(tg?` (${tg.g} partite)`:'');
  const f=tr.fin[0];
  const m={c4:tr.pools>1?'playoff promozione fra le prime 2 di ogni girone':'playoff fra le prime 4',b6:'playoff fra le prime 6',c8:'playoff fra le prime 8',
    x8:'turno incrociato e finali di piazzamento',p:'finali di piazzamento a coppie',rr:'minigirone',k4:f&&f.f>1?'1ª promossa, 2ª-5ª spareggio per la promozione':'playoff fra le prime 4'};
  return `${tr.comps>1?tr.comps+' competizioni, ':''}${g}${tr.fin.length?'; '+[...new Set(tr.fin.map(x=>m[x.m]))].join(' e '):''}`;
}
const lnCap=t=>t[0].toUpperCase()+t.slice(1);
// chi sale, chi scende e chi va all'EUCF da un livello (per la scelta della squadra e per la scheda del campionato)
function lnMoveTxt(tr,lk=SV&&SV.lk){
  const D=LN_DEF[lk];if(!D)return '';
  const T=D.tiers,i=T.indexOf(tr),f=tr.fin[0],out=[];if(i<0)return '';
  if(i>0&&!(f&&f.f>1))out.push(`${f&&f.m==='c4'?'Salgono le 2 finaliste':'Promosse le prime '+D.mv[i-1]}.`);
  if(i<T.length-1)out.push(`Retrocedono le ultime ${D.mv[i]}.`);
  if(i===0&&D.eu)out.push(`Prime ${D.eu} all’EUCF.`);
  return out.join(' ');
}
// colore di una posizione in classifica: verde = playoff, tabellone o promozione diretta; giallo = spareggio promozione; rosso = retrocessione
function lnZone(r,tr,n){
  const T=lnTiers(),i=T.findIndex(t=>t.id===tr.id),mv=lnSeasonDef(SV.lk,SV.ln.T).mv,f=tr.fin[0];
  if(i<T.length-1&&n&&r>n-(mv[i]||0))return 'dn';
  if(f&&f.f>1)return r<f.f?'up':(r<=f.t?'pi':'');
  if(f)return r>=f.f&&r<=f.t?'up':'';
  return i>0&&r<=(mv[i-1]||0)?'up':'';
}
function lnLegend(tr){
  const T=lnTiers(),i=T.findIndex(t=>t.id===tr.id),f=tr.fin[0],L=[];
  if(f&&f.f>1)L.push(['g','sale'],['y','spareggio promozione']);
  else if(f)L.push(['g',f.m==='c4'&&tr.pools>1?'semifinali promozione':(i===0?(f.m==='c8'?'tabellone':'playoff'):'fase finale')]);
  else if(i>0)L.push(['g','sale']);
  if(i<T.length-1)L.push(['r','scende']);
  return L.map(([c,t])=>`<span class="leg"><i class="${c}"></i>${t}</span>`).join('');
}
function lnPoolView(){
  const L=SV.ln,comp=lnComp(),tr=lnTierDef();
  if(lnPoolSel<0||lnPoolSel>=comp.pools.length)lnPoolSel=L.pi;
  let h=comp.pools.length>1?`<div class="seg" id="lnPools">${comp.pools.map((p,i)=>`<button type="button" class="sg${lnPoolSel===i?' on':''}" data-lp="${i}">Girone ${lnPoolName(tr,i)}${i===L.pi?' (tuo)':''}</button>`).join('')}</div>`:'';
  const i=lnPoolSel,names=comp.pools[i],t=lnPoolTab(i),ord=usRanking(t,names),Lg=i!==L.pi&&SV.lg[i];
  if(Lg||tr.comps>1)h+=`<p class="estat">${tr.comps>1?'Gruppo '+esc(comp.id):''}${Lg?`${tr.comps>1?' · ':''}giornata ${Lg.round} di ${Lg.sched.length}`:''}</p>`;   // il livello e la stagione sono già nella barra in alto
  h+=`<div class="legrow">${lnLegend(tr)}${infoB('lnleg')}</div>${infoX('lnleg','<p>'+esc(lnCap(lnFormatTxt(tr)))+'. A parità di vittorie contano gli scontri diretti, poi la differenza mete.</p>')}`;
  h+=`<div style="overflow-x:auto"><table class="rt">${usHead}${ord.map((nm,k)=>usRow(nm,t[nm],[nm===SV.team?'me':'',comp.pools.length===1?lnZone(k+1,tr,names.length):(k<tr.fin[0]?.t?'up':'')].filter(Boolean).join(' '))).join('')}</table></div>`;
  if(Lg&&Lg.last.length)h+=`<h3 class="eh">Ultima giornata</h3><ul class="elist">${Lg.last.map(m=>`<li class="${m[2]>m[3]?'w':'l'}"><span>${esc(m[0])} – ${esc(m[1])}</span><span>${m[2]} – ${m[3]}</span></li>`).join('')}</ul>`;
  if(i===L.pi){
    h+=leadersHTML();
    if(SV.riv)h+=`<p class="note" style="margin:8px 0 0">${derbyTxt()}.</p>`;
    const done=SV.res.slice(-7).map((r,k)=>{const g=SV.res.length-Math.min(7,SV.res.length)+k+1;return `<li class="${r.su>r.so?'w':'l'}"><span>Giornata ${g} contro ${esc(r.opp)}</span><span>${r.su} – ${r.so}</span></li>`;});
    const nm=SV.done?null:nextMatch();if(nm)done.push(`<li class="n"><span>${esc(nm.label)} contro ${esc(nm.name)}</span><span>Prossima</span></li>`);
    h+=`<ul class="elist" style="margin-top:10px">${done.join('')}</ul>`;
    if(SV.story&&SV.story.length)h+=`<h3 class="eh">Dal campionato</h3><ul class="elist">${SV.story.slice(0,6).map(x=>`<li><span>${esc(x.txt)}</span><span>S${x.s}·G${x.r}</span></li>`).join('')}</ul>`;
  }
  return h;
}
function lnFinView(){
  const L=SV.ln,tr=lnTierDef();
  if(!tr.fin.length)return `<p class="estat">Nessuna fase finale</p><p class="note">${esc(SERIES_NAME[SV.sr])}: la classifica finale è quella del girone.</p>`;
  if(!L.F)return `<p class="estat">Fasi finali</p><p class="note">${esc(lnCap(lnFormatTxt(tr)))}. Il tabellone si forma alla fine ${tr.fin[0].m==='k4'?'del girone: chi perde è eliminato':(tr.fin[0].m==='c8'?'del girone: nessuno è eliminato, ogni turno decide un piazzamento':'del girone: c’è anche la finale per il 3° posto')}.</p>`;
  const F=L.F;let h=`<p class="estat">Fasi finali · ${esc(SERIES_NAME[SV.sr])}${F.done?' · concluse':''}</p>`;
  F.lv.forEach(lv=>{
    h+=`<h3 class="eh">Posti ${lv.base}°-${lv.base+lv.T.length-1}°</h3>`;
    for(let rd=0;rd<lv.R.length;rd++){
      const rows=lv.R[rd].map((m,k)=>{
        if(m[0]===null&&m[1]===null)return '';
        const bye=m[0]===null||m[1]===null,w=m[4];
        return `<li class="${w===SV.team?'w':(m[0]===SV.team||m[1]===SV.team?(m[4]===null?'n':'l'):'')}"><span>${esc(lnLvLabel(lv,rd,k))}: ${esc(m[0]===null?'—':m[0])} – ${esc(m[1]===null?'—':m[1])}</span><span>${bye?'passa il turno':(m[2]===null?'da giocare':m[2]+' – '+m[3])}</span></li>`;
      }).join('');
      if(rows)h+=`<ul class="elist">${rows}</ul>`;
    }
    if(lv.order)h+=`<p class="note" style="margin:6px 0 0">Classifica: ${lv.order.map((n,i)=>`${lv.base+i}° ${n===SV.team?'<b style="color:var(--gold)">'+esc(n)+'</b>':esc(n)}`).join(' · ')}</p>`;
  });
  return h;
}
function lnTiersView(){
  const L=SV.ln,D=lnSeasonDef(SV.lk,L.T);
  const moves=D.mv.length?`Tra i livelli salgono e scendono squadre ogni stagione (${D.mv.map((n,i)=>D.tiers[i].name+'-'+D.tiers[i+1].name+': '+n).join(', ')}). `:'';
  let h=`<p class="estat">${esc(D.cc)} · ${D.mv.length?'tutti i livelli':'club'} ${infoB('lntiers')}</p>${infoX('lntiers',`<p>${moves}La cifra accanto al nome è la forza della rosa.</p>`)}`;
  D.tiers.forEach((tr,ti)=>{
    h+=`<h3 class="eh">${esc(tr.name)}${tr.id===L.tier?' · il tuo livello':''}</h3>`;
    for(const c of L.T[tr.id]){
      const rows=c.clubs.slice().sort((a,b)=>lnP(b)-lnP(a)).map(n=>`<tr${n===SV.team?' class="me"':''}><td>${crest(n,15)} ${esc(n)}<span class="tp">${Math.round(lnP(n))}</span></td></tr>`).join('');
      h+=`<div style="overflow-x:auto"><table class="rt">${tr.comps>1?`<tr><th>Gruppo ${esc(c.id)}</th></tr>`:''}${rows}</table></div>`;
    }
  });
  const a=leagueHonours();
  if(a.entries.length)h+=`<h3 class="eh">Albo d’oro · ${esc(a.name)}</h3>${albHTML(a.entries.slice(0,6))}`;
  return h;
}
function renderEventLN(){
  const L=SV.ln,D=LN_DEF[SV.lk],eu=SV.euUnlocked;
  $('eCards').innerHTML=`<button type="button" class="ecard${SV.event==='camp'?' on':''}" data-e="camp"><strong>${esc(D.name)}</strong><small>${esc(SERIES_NAME[SV.sr])}: ${esc(lnFormatTxt(lnTierDef()))}. ${esc(lnMoveTxt(lnTierDef()))} ${SV.done?'Stagione conclusa.':esc(lnShort())+'.'}</small></button>`+
    (eu?`<button type="button" class="ecard${SV.event==='eu'?' on':''}" data-e="eu"><strong>Campionato europeo (EUCF)</strong><small>${EU_FIELD_TXT} ${euCardSub()}</small></button>`
       :(D.eu?`<button type="button" class="ecard" data-e="eu" disabled><strong>Campionato europeo</strong><small>${euQualifiedPending()?'Qualificati: apri il torneo dal riepilogo.':`Per qualificarti: prime ${D.eu} della ${esc(D.tiers[0].name)} dopo i playoff, o quarta più forte fra i campionati.`}</small></button>`:''));   // il campionato Women non va all'EUCF
  $('eCards').classList.add('mini');   // due linguette piccole: le descrizioni stanno nelle «i» della classifica
  if(SV.event!=='camp'){$('eBody').innerHTML=euView();return;}   // EUCF: gironi e tabellone (18-eucf-schermate.js)
  if(lnTabPh!==L.ph){lnTabPh=L.ph;eventPage=L.ph==='grp'?'table':'final';}
  let body='';
  if(SV.done&&SV.next)body+=endSeasonHTML({});
  // una sola fila di schede (prima erano tre: viste, girone/fase finale/livelli, gironi)
  const pages=[['table','Classifica'],['calendar','Calendario'],['final','Fase finale'],['stats','Statistiche'],['tiers',lnTiers().length>1?'Livelli':'Club']];
  body+=`<nav class="seg evpages" aria-label="Viste della lega">${pages.map(([id,l])=>`<button type="button" class="sg${eventPage===id?' on':''}" data-evpage="${id}"${eventPage===id?' aria-current="page"':''}>${l}</button>`).join('')}</nav>`;
  if(eventPage!=='table'){
    const detail=eventPage==='calendar'?eventCalendar():eventPage==='stats'
      ?(leadersHTML()||'<p class="note">Le statistiche compariranno dopo le prime partite.</p>'):eventPage==='tiers'?lnTiersView():lnFinView();
    $('eBody').innerHTML=body+detail;
    return;
  }
  $('eBody').innerHTML=body+lnPoolView();
}
$('eBody').addEventListener('click',e=>{
  if(!isLN())return;
  const t=e.target.closest('#lnTabs [data-lt]');if(t){lnTabSel=t.dataset.lt;renderEvent();return;}
  const p=e.target.closest('#lnPools [data-lp]');if(p){lnPoolSel=+p.dataset.lp;renderEvent();}
});

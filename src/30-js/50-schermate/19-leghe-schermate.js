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
  $('tNote').textContent=D.txt+' ('+lnFormatTxt(tr)+')';
  const cl=lnClubRows(lk).filter(r=>r[1]===teamTier).map(r=>r[0]).sort((a,b)=>favFirst(a,b)||lnBasePower(b)-lnBasePower(a));
  $('tTeams').innerHTML=cl.map((n,i)=>`<button type="button" class="tteam" data-n="${n.replace(/"/g,'&quot;')}"><span class="tn">${crest(n,22)}<span>${favMark(n)}${esc(n)}<small class="tcity">${esc(D.cc)} · ${esc(tr.name)} · n° ${i+1}</small></span></span><b class="tp">${lnPreview(n)}</b></button>`).join('');
}
// descrizione breve di un livello: gironi e fasi finali
function lnFormatTxt(tr){
  const g=tr.pools>1?`${tr.pools} gironi`:'girone unico',m={c8:'tabellone a 8 con tutte le finali di piazzamento',c4:'semifinali e finali',x8:'turno incrociato e finali di piazzamento',p:'finali di piazzamento a coppie',rr:'minigirone'};
  for(const f of tr.fin)if(f.m==='k4')m.k4=f.f>1?'spareggio promozione tra la 2ª e la 5ª (semifinali e finale), la prima sale direttamente':'playoff scudetto tra le prime 4 (semifinali e finale)';
  const lk=LN_IDS.find(k=>LN_DEF[k].tiers.includes(tr)),tg=lk?lnTierGames(lk,tr):null,legs=tg&&tg.g>tg.one?` (nel gioco più giri: ${tg.g} partite a testa, per arrivare ad almeno ${LN_MIN} in stagione)`:'';
  return `${tr.comps>1?tr.comps+' competizioni, ':''}${g}, tutti contro tutti${legs}${tr.fin.length?', poi '+[...new Set(tr.fin.map(f=>m[f.m]))].join(' e '):''}`;
}
// ---- Classifica ----
const lnZone=(r,tr)=>{const i=tr.fin.findIndex(f=>r>=f.f&&r<=f.t);return i<0?'':(i===0?'up':'pi');};
function lnPoolView(){
  const L=SV.ln,comp=lnComp(),tr=lnTierDef();
  if(lnPoolSel<0||lnPoolSel>=comp.pools.length)lnPoolSel=L.pi;
  let h=comp.pools.length>1?`<div class="seg" id="lnPools">${comp.pools.map((p,i)=>`<button type="button" class="sg${lnPoolSel===i?' on':''}" data-lp="${i}">Girone ${'AB'[i]}${i===L.pi?' (tuo)':''}</button>`).join('')}</div>`:'';
  const i=lnPoolSel,names=comp.pools[i],t=lnPoolTab(i),ord=usRanking(t,names),Lg=i!==L.pi&&SV.lg[i];
  h+=`<p class="estat">${esc(SERIES_NAME[SV.sr])}${tr.comps>1?' · gruppo '+esc(comp.id):''}, stagione ${SV.season}${Lg?` · giornata ${Lg.round} di ${Lg.sched.length}`:''}</p>`;
  if(tr.fin.length)h+=`<div class="legrow"><span class="leg"><i class="g"></i>${tr.fin[0].m==='k4'?(tr.fin[0].f>1?'spareggio promozione':'playoff'):'tabellone'}</span>${tr.fin[0].m==='k4'?'':'<span class="leg"><i class="y"></i>finali di piazzamento</span>'}${infoB('lnleg')}</div>${infoX('lnleg','<p>A parità di vittorie contano gli scontri diretti, poi la differenza mete.</p>')}`;
  h+=`<div style="overflow-x:auto"><table class="rt">${usHead}${ord.map((nm,k)=>usRow(nm,t[nm],[nm===SV.team?'me':'',lnZone(k+1,tr)].filter(Boolean).join(' '))).join('')}</table></div>`;
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
  if(!L.F)return `<p class="estat">Fasi finali</p><p class="note">${esc(lnFormatTxt(tr))}. Il tabellone si forma alla fine ${tr.fin[0].m==='k4'?'del girone: chi perde è eliminato':'dei gironi, con la posizione di ognuno: nessuno è eliminato, ogni turno si gioca per il piazzamento'}.</p>`;
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
  $('eCards').innerHTML=`<button type="button" class="ecard${SV.event==='camp'?' on':''}" data-e="camp"><strong>${esc(D.name)}</strong><small>${esc(SERIES_NAME[SV.sr])}: ${esc(lnFormatTxt(lnTierDef()))}. ${SV.done?'Stagione conclusa.':esc(lnShort())+'.'}</small></button>`+
    (eu?`<button type="button" class="ecard${SV.event==='eu'?' on':''}" data-e="eu"><strong>Campionato europeo (EUCF)</strong><small>16 club in 4 gironi da 4, poi prequarti, quarti, semifinali e finale. ${euCardSub()}</small></button>`
       :(D.eu?`<button type="button" class="ecard" data-e="eu" disabled><strong>Campionato europeo</strong><small>${euQualifiedPending()?'Qualificati: apri il torneo dal riepilogo.':`Per qualificarti devi arrivare ${D.eu===1?'al primo posto':'tra le prime '+D.eu} del livello più alto.`}</small></button>`:''));   // il campionato Women non va all'EUCF
  if(SV.event!=='camp'){$('eBody').innerHTML=euView();return;}   // EUCF: gironi e tabellone (18-eucf-schermate.js)
  if(lnTabPh!==L.ph){lnTabPh=L.ph;lnTabSel=L.ph==='grp'?'grp':'fin';}
  let body='';
  if(SV.done&&SV.next)body+=endSeasonHTML({});
  body+=eventPages();
  if(eventPage!=='table'){
    const detail=eventPage==='calendar'?eventCalendar():eventPage==='stats'
      ?(leadersHTML()||'<p class="note">Le statistiche compariranno dopo le prime partite.</p>'):lnFinView();
    $('eBody').innerHTML=body+detail;
    return;
  }
  body+=`<div class="seg" id="lnTabs">${[['grp','Girone'],['fin','Fase finale'],['tiers',lnTiers().length>1?'Livelli':'Club']].map(([k,l])=>`<button type="button" class="sg${lnTabSel===k?' on':''}" data-lt="${k}">${l}</button>`).join('')}</div>`;
  body+=lnTabSel==='fin'?lnFinView():(lnTabSel==='tiers'?lnTiersView():lnPoolView());
  $('eBody').innerHTML=body;
}
$('eBody').addEventListener('click',e=>{
  if(!isLN())return;
  const t=e.target.closest('#lnTabs [data-lt]');if(t){lnTabSel=t.dataset.lt;renderEvent();return;}
  const p=e.target.closest('#lnPools [data-lp]');if(p){lnPoolSel=+p.dataset.lp;renderEvent();}
});

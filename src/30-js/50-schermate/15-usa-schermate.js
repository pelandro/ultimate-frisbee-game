/* ===================== USA MEN'S CLUB: SCHERMATE =====================
   Tutto cio' che l'interfaccia mostra solo nella carriera USA: scelta del campionato (Italia / USA) e della Conference, cruscotto, linea delle giornate,
   presentazione delle partite che contano e la schermata Classifica con tre viste: Conference (tabelle e Play-in), Nationals (gironi e tabellone) e Ranking
   nazionale. Le regole stanno in 35-usa/. Le schermate italiane le chiamano con una sola riga quando SV.lk==='US'. */
let usTabSel='conf',usConfSel='',usTabPh='';
const US_PHASE_NAME={reg:'Stagione regolare',pin:'Play-in',nat:'Nationals',done:'Stagione conclusa'};
function usShortLabel(){   // etichetta breve della partita di adesso
  const U=SV.us,po=SV.po;if(!po||!po.on)return '';
  if(po.kind==='pin')return 'Play-in';
  const rd=U.nat.rd;
  return rd<3?`Girone ${US_POOL[usNatPool(SV.team)]} · ${rd+1}/3`:['Prequarti','Quarti','Semifinale','Finale'][rd-3];
}
// la partita di adesso e le successive nel calendario di 12 (5 giornate di Conference e 7 interregionali): [titolo breve, sotto]
function usEv(i){
  const R=SV.sched.length;if(i>=US_CAL.length)return null;
  let nc=0,nx=0;for(let k=0;k<i;k++)US_CAL[k]==='c'?nc++:nx++;
  if(US_CAL[i]==='c'){const o=oppAt(nc);return ['G'+(nc+1)+' di '+R,shortN(o)+(o===SV.riv?' · derby':'')];}
  return ['Interreg. '+(nx+1)+'/7',shortN(usCrossOpp(nx))];
}
const usRegSub=()=>{const e=usEv(SV.us.ci|0);return e?(US_CAL[SV.us.ci|0]==='x'?'Interregionale '+((SV.us.xn|0)+1)+' di 7':'Giornata '+(SV.round+1)+' di '+SV.sched.length):'';};
const usInfo=()=>{
  const U=SV.us;
  if(SV.done)return `${usConfName(U.cf)} · Stagione ${SV.season} · conclusa`;
  if(U.ph==='reg')return `${usConfName(U.cf)} · Stagione ${SV.season}`+(SV.round>0?` · ${myRank()}° posto`:'');
  return `${US_PHASE_NAME[U.ph]} · Stagione ${SV.season}`;
};
const usEventSub=()=>{
  const U=SV.us;
  if(SV.done)return 'Stagione conclusa: premi e ripartenza';
  return U.ph==='reg'?usRegSub():(SV.po&&SV.po.on?usShortLabel():US_PHASE_NAME[U.ph]);
};
// righe del riquadro «classifica» del cruscotto durante Play-in e Nationals
function usHomeTab(){
  const U=SV.us,row=(t,b,me)=>`<div class="${me?'me':''}"><span>${t}</span><b>${b}</b></div>`;
  if(U.ph==='nat'&&U.nat&&!U.nat.ord&&usNatPool(SV.team)>=0){   // gironi in corso: il tuo girone
    const p=usNatPool(SV.team),pl=U.nat.pools[p],ord=usRanking(U.nat.tabs[p],pl);
    return ord.map((n,i)=>row(`${i+1}. ${esc(n)}`,`${U.nat.tabs[p][n].w}–${U.nat.tabs[p][n].l}`,n===SV.team)).join('');
  }
  return row(esc(SV.po&&SV.po.on?usLabel():US_PHASE_NAME[U.ph]),'',true);
}
// linea delle giornate (cruscotto): l'ultima partita, quella di adesso e la prossima
function usTimelineHTML(node){
  const U=SV.us,R=SV.sched.length,last=SV.res[SV.res.length-1],lastN=SV.res.length;
  const po=SV.po&&SV.po.on;
  const prevRes=r=>node(r.su>r.so?'w':'l',(r.su>r.so?'V ':'S ')+r.su+'–'+r.so,'G'+lastN+' · '+shortN(r.opp)),lx=U.xl&&U.xl[U.xl.length-1];
  let prev;
  if(SV.po&&SV.po.last){const l=SV.po.last;prev=node(l.win?'w':'l',(l.win?'V ':'S ')+l.su+'–'+l.so,(l.label?l.label.replace('Nationals · ',''):'Play-in')+' · '+shortN(l.opp));}
  else if(U.lp==='x'&&lx)prev=node(lx.su>lx.so?'w':'l',(lx.su>lx.so?'V ':'S ')+lx.su+'–'+lx.so,'Interreg. · '+shortN(lx.opp));
  else prev=last?prevRes(last):node('f','Inizio','stagione '+SV.season);
  let cur,nxt;
  if(SV.done){cur=node('n','Fine','posto '+(SV.next?SV.next.rank:myRank())+'°');nxt=node('f','Nuova','stagione');}
  else if(po){
    cur=node('n',usShortLabel(),shortN(SV.po.opp));
    const rd=U.ph==='nat'?U.nat.rd:-1;
    nxt=rd<0?node('f','Nationals','se vincete'):(rd===6?node('f','Fine','stagione'):node('f',rd<2?'Girone '+(rd+2)+'/3':['Quarti','Quarti','Semifinale','Finale'][rd-2],'se avanzate'));
  }else{
    const e=usEv(U.ci|0),e2=usEv((U.ci|0)+1);
    cur=e?node('n',e[0],e[1]):node('f','Fine','stagione regolare');
    nxt=e2?node('f',e2[0],e2[1]):node('f','Play-in','o Nationals');
  }
  return `<div class="tline">${[prev,cur,nxt].join('')}</div>`;
}
// cartello prima delle partite che contano
function usStakes(m){
  const U=SV.us,po=SV.po,lines=[];let tag='',title='';
  if(po&&po.on&&po.kind==='pin'){tag='Play-in';title='Gara secca';lines.push('Chi vince va ai Nationals, chi perde chiude la stagione.');}
  else if(po&&po.on){
    const rd=U.nat.rd;tag='Nationals';
    if(rd<3){title=`Girone ${US_POOL[usNatPool(SV.team)]} · partita ${rd+1} di 3`;lines.push(rd===2?'Ultima partita del girone: le prime vanno ai quarti, le seconde e le terze ai prequarti, le quarte sono fuori.':'Ogni vittoria conta per la classifica del girone: a parità decidono gli scontri diretti e la differenza mete.');}
    else{title=['Prequarti','Quarti di finale','Semifinale','Finale'][rd-3];lines.push(rd===6?'Chi vince è campione degli Stati Uniti: trofeo e reputazione.':'Eliminazione diretta: chi perde è fuori.');}
  }else if(usCrossPending()){
    tag='Interregionale';title=`Contro ${m.name} (${usConfName(usConfOf(m.name))})`;lines.push('Conta solo per il ranking nazionale: i risultati contro club di altre Conference decidono quanti posti ai Nationals ha ogni regione.');
  }else{
    const names=SV.mem.U,ord=ranking(SV.tab,names),rk=ord.indexOf(SV.team)+1,last=SV.round===SV.sched.length-1;
    if(m.name===SV.riv){tag='Rivalità';title='Derby';const rr=SV.rivRec||{w:0,l:0};lines.push(`Contro ${m.name} vale di più: incasso, morale e reputazione.${rr.w+rr.l?` Finora ${rr.w} ${rr.w===1?'vinto':'vinti'} e ${rr.l} ${rr.l===1?'perso':'persi'}.`:''}`);}
    if(last){tag=tag||'Ultima giornata';title=title||(rk===1?'Ai Nationals senza Play-in':(rk<=3?'Play-in in palio':'Ultima chiamata'));lines.push(rk===1?'Siete primi: una vittoria blinda la qualificazione diretta ai Nationals.':(rk<=3?'Siete in zona Play-in: una vittoria può valere il 1º posto, la sconfitta il 3º.':'Siete fuori dai Play-in: serve vincere e sperare.'));}
  }
  return {tag,title,lines};
}
// ---- scelta del campionato e della Conference (schermata «Scegli la tua squadra») ----
let teamLg='IT',teamCf='NE';
const usPrevCache={},usPreview=n=>usPrevCache[n]||(usPrevCache[n]=Math.round(rosterPower(usRoster(n,'preview|'+n))));   // forza con cui si parte davvero
function renderTeamsUS(){
  $('tMode').classList.add('hidden');$('tRelief').classList.add('hidden');$('tTeams').classList.remove('hidden');
  $('tSr').innerHTML=US_CK.map(c=>`<button type="button" data-k="${c}">${US_CONF[c]}</button>`).join('');
  for(const b of $('tSr').children)b.classList.toggle('on',b.dataset.k===teamCf);
  $('tNote').textContent='Men’s Club USA: 48 club veri in 8 Conference da 6. Giochi 5 partite nella tua Conference e 7 contro le altre (interregionali), poi Play-in e Nationals. Niente promozioni né retrocessioni. Il numero accanto al nome è la forza del club.';
  $('tTeams').innerHTML=US_BYCONF[teamCf].slice().sort((a,b)=>favFirst(a,b)||US_TEAM[a].rank-US_TEAM[b].rank).map(n=>`<button type="button" class="tteam" data-n="${n.replace(/"/g,'&quot;')}"><span class="tn">${crest(n,22)}<span>${favMark(n)}${esc(n)}<small class="tcity">${esc(US_TEAM[n].city)} · n° ${US_TEAM[n].rank}</small></span></span><b class="tp">${usPreview(n)}</b></button>`).join('');
}
// ---- Classifica ----
const usRow=(nm,t,cls)=>`<tr${cls?` class="${cls}"`:''}><td>${crest(nm,15)} ${esc(nm)}<span class="tp">${Math.round(teamPower(nm)||(typeof euPowOf==='function'?euPowOf(nm):0)||0)}</span></td><td>${t.w+t.l}</td><td>${t.w}</td><td>${t.l}</td><td>${t.pf-t.pa>0?'+':''}${t.pf-t.pa}</td></tr>`;
const usHead='<tr><th>Squadra e forza</th><th>G</th><th>V</th><th>S</th><th>Diff</th></tr>';
function usConfTable(c){
  const names=SV.us.conf[c],t=usTab(c),ord=usRanking(t,names),sp=usBidSplit(usBidsNow()[c]);   // dirette (verde), Play-in (giallo), fuori (rosso) secondo i posti della regione
  const rows=ord.map((nm,i)=>usRow(nm,t[nm],[nm===SV.team?'me':'',i<sp.d?'up':(i<sp.d+2*sp.k?'pi':'dn')].filter(Boolean).join(' '))).join('');
  return `<div style="overflow-x:auto"><table class="rt">${usHead}${rows}</table></div>`;
}
const usMatchRow=m=>`<li class="${m[4]===SV.team?'w':(m[0]===SV.team||m[1]===SV.team?'l':'')}"><span>${esc(m[0])} – ${esc(m[1])}</span><span>${m[2]===null?'da giocare':m[2]+' – '+m[3]}</span></li>`;
// «posti ai Nationals» della regione: 1 automatico + quelli di forza dal ranking nazionale (definitivi a fine stagione regolare, prima una proiezione)
function usBidsShort(c){   // una riga: quanti posti ai Nationals ha la regione e se sono saliti o scesi
  const U=SV.us,b=usBidsNow()[c],q=U.bids?null:(U.bq&&U.bq[c]),tr=q&&q!==b?` <b style="color:${b>q?'#4fe58f':'#ff7b80'}">${b>q?'▲':'▼'} era ${q}</b>`:'';
  return `<span class="legb"><b>${b} ${b===1?'posto':'posti'} ai Nationals</b>${tr}${U.bids?' · definitivi':''}</span>`;
}
function usBidsTxt(c){
  const U=SV.us,b=usBidsNow()[c],q=U.bids?null:(U.bq&&U.bq[c]),tr=q&&q!==b?` <b style="color:${b>q?'#4fe58f':'#ff7b80'}">${b>q?'▲':'▼'} era ${q}</b>`:'';
  return `<b>${b} ${b===1?'posto':'posti'} ai Nationals</b>${tr} (1 automatico${b>1?` + ${b-1} di forza`:''}${U.bids?', definitivi':', si aggiornano dopo ogni partita dal ranking'}) · i posti vanno alla regione: se li giocano le squadre della Conference`;
}
function usPinHTML(c){
  const U=SV.us,P=U.pin&&U.pin[c];if(!P)return '';
  const d=P.d||1,k=P.m.length,lab=P.m.map((m,i)=>`${d+i+1}ª contro ${d+2*k-i}ª`);
  return `<h3 class="eh">Play-in · ${usConfName(c)}</h3><ul class="elist">${P.m.map((m,i)=>{const r=P.r[i];return r?`<li class="${r[4]===SV.team?'w':(m.includes(SV.team)?'l':'')}"><span>${lab[i]}: ${esc(r[0])} – ${esc(r[1])}</span><span>${r[2]} – ${r[3]}</span></li>`:`<li class="${m.includes(SV.team)?'n':''}"><span>${lab[i]}: ${esc(m[0])} – ${esc(m[1])}</span><span>${m.includes(SV.team)?'Prossima':'da giocare'}</span></li>`;}).join('')}</ul>`;
}
function usConfView(){
  const U=SV.us;if(!usConfSel||!U.conf[usConfSel])usConfSel=U.cf;
  const c=usConfSel;let h=`<div class="seg" id="usConfs">${US_CK.map(k=>`<button type="button" class="sg${c===k?' on':''}" data-uc="${k}">${US_CONF[k]}${k===U.cf?' (tua)':''}</button>`).join('')}</div>`;
  const L=c!==U.cf&&SV.lg[c];
  h+=`<p class="estat">${usConfName(c)}, stagione ${SV.season}${L?` · giornata ${L.round} di ${L.sched.length}`:''} ${infoB('uconf')}</p><div class="legrow">${usBidsShort(c)}<span class="leg"><i class="g"></i>Nationals</span><span class="leg"><i class="y"></i>Play-in</span><span class="leg"><i class="r"></i>fuori</span></div>${infoX('uconf',`<p>${usBidsTxt(c)}</p><p><b style="color:#4fe58f">Verde</b>: Nationals diretti · <b style="color:#ffd23f">Giallo</b>: Play-in (gare secche, chi vince va ai Nationals) · <b style="color:#ff7b80">Rosso</b>: eliminate. A parità di vittorie contano gli scontri diretti, poi la differenza mete.</p>`)}`;
  h+=usConfTable(c)+usPinHTML(c);
  if(L&&L.last.length)h+=`<h3 class="eh">Ultima giornata in ${usConfName(c)}</h3><ul class="elist">${L.last.map(m=>`<li class="${m[2]>m[3]?'w':'l'}"><span>${esc(m[0])} – ${esc(m[1])}</span><span>${m[2]} – ${m[3]}</span></li>`).join('')}</ul>`;
  if(c===U.cf){
    if(U.ph==='reg'||(U.xl&&U.xl.length)){const xs=(U.xl||[]).map(x=>`<li class="${x.su>x.so?'w':'l'}"><span>Interregionale ${x.r} contro ${esc(x.opp)} (${usConfName(usConfOf(x.opp))})</span><span>${x.su} – ${x.so}</span></li>`);if(usCrossPending()){const m=usCrossMatch();xs.push(`<li class="n"><span>${esc(m.label)} contro ${esc(m.name)}</span><span>Prossima</span></li>`);}
      if(xs.length)h+=`<h3 class="eh">Interregionali (7 a stagione, contano per il ranking)</h3><ul class="elist">${xs.join('')}</ul>`;}
    h+=leadersHTML();
    if(SV.riv)h+=`<p class="note" style="margin:8px 0 0">${derbyTxt()}.</p>`;
    const done=SV.res.slice(-7).map((r,i)=>{const g=SV.res.length-Math.min(7,SV.res.length)+i+1;return `<li class="${r.su>r.so?'w':'l'}"><span>Giornata ${g} contro ${esc(r.opp)}</span><span>${r.su} – ${r.so}</span></li>`;});
    const nm=nextMatch();if(nm)done.push(`<li class="n"><span>${esc(nm.label)} contro ${esc(nm.name)}</span><span>Prossima</span></li>`);
    h+=`<ul class="elist" style="margin-top:10px">${done.join('')}</ul>`;
    if(SV.story&&SV.story.length)h+=`<h3 class="eh">Dal campionato</h3><ul class="elist">${SV.story.slice(0,6).map(x=>`<li><span>${esc(x.txt)}</span><span>S${x.s}·G${x.r}</span></li>`).join('')}</ul>`;
  }
  return h;
}
// tabellone: prequarti, quarti, semifinali e finale (si riempie man mano che i turni sono decisi)
function usBracketHTML(N){
  N=N||SV.us.nat;const row=(n,sc,w)=>`<div class="${w?'w':''}${n===SV.team?' me':''}"><span title="${esc(n)}">${crest(n,13)} ${esc(n)}</span><b>${sc===null||sc===undefined?'':sc}</b></div>`;
  const box=m=>`<div class="tnm${m[2]===null?' cur':''}">${row(m[0],m[2],m[4]===m[0])}${row(m[1],m[3],m[4]===m[1])}</div>`;
  const T=['Prequarti','Quarti','Semifinali','Finale'];
  const cols=N.ko.map((L,i)=>`<div class="tncol"><h3>${T[i]}</h3>${L.map(box).join('')}</div>`).join('');
  return `<div class="tncols">${cols}</div>`+(N.champ?`<p class="estat">Campione degli Stati Uniti: ${esc(N.champ)}</p>`:'');
}
function usPoolHTML(p,N){
  N=N||SV.us.nat;const pl=N.pools[p],t=N.tabs[p],ord=usRanking(t,pl);
  const rows=ord.map((nm,i)=>usRow(nm,t[nm],[nm===SV.team?'me':'',i===0?'up':(i<3?'pi':'dn')].filter(Boolean).join(' '))).join('');
  const games=[].concat(...N.pg[p]).map(m=>`<li class="${m[4]===SV.team?'w':(m[0]===SV.team||m[1]===SV.team?'l':'')}"><span>${esc(m[0])} – ${esc(m[1])}</span><span>${m[2]} – ${m[3]}</span></li>`).join('');
  return `<h3 class="eh">Girone ${US_POOL[p]}</h3><div style="overflow-x:auto"><table class="rt">${usHead}${rows}</table></div>${games?`<ul class="elist">${games}</ul>`:''}`;
}
function usNatView(){
  const U=SV.us,N=U.nat;
  if(!N){
    let h=`<p class="estat">Nationals · 16 squadre ${infoB('unat')}</p>${infoX('unat',`<p>16 squadre: per ogni Conference le qualificate dirette e le vincitrici dei Play-in, secondo i posti della regione (da 1 a 4). 4 gironi da 4, formati con le fasce del ranking nazionale (se possibile senza club della stessa Conference nello stesso girone). Le prime vanno ai quarti, le seconde e le terze ai prequarti (2ª contro 3ª di un altro girone), le quarte sono eliminate. Poi quarti, semifinali e finale.</p>`)}`;
    if(U.fin){
      h+=US_CK.map(c=>{const o=U.fin[c];return `<h3 class="eh">${usConfName(c)}</h3><ul class="elist"><li><span>Diretta: ${esc(o[0])}</span><span>${o[0]===SV.team?'Voi':''}</span></li></ul>`;}).join('');
    }else h+='<p class="note">I qualificati si conoscono alla fine della stagione regolare.</p>';
    return h;
  }
  let h=`<p class="estat">${N.out?(N.champ?'Nationals conclusi':'Non siete più in corsa'):'Nationals in corso'} · <b style="color:#4fe58f">verde</b>: quarti · <b style="color:#ffd23f">giallo</b>: prequarti · <b style="color:#ff7b80">rosso</b>: fuori</p>`;
  if(N.ord||N.rd>=3||N.ko.length)h+=usBracketHTML();
  h+=[0,1,2,3].map(p=>usPoolHTML(p)).join('');   // senza la freccia, map passerebbe l'indice come secondo argomento (la tabella N)
  return h;
}
function usRankView(){
  const U=SV.us,pos0={};US_NAMES.slice().sort((a,b)=>U.pr0[b]-U.pr0[a]||(a<b?-1:1)).forEach((n,i)=>{pos0[n]=i+1;});
  const arr=d=>`<td style="color:${d>0?'#4fe58f':(d<0?'#ff7b80':'inherit')}">${d>0?'▲'+d:(d<0?'▼'+(-d):'–')}</td>`,pl=U.ph==='reg'?U.pl:null;
  const rows=usRankList().map((n,i)=>{const d=pos0[n]-(i+1),cf=usConfOf(n),dl=pl&&pl[n]?pl[n]-(i+1):0;
    return `<tr class="${n===SV.team?'me':''}"><td>${i+1}. ${crest(n,15)} ${esc(n)}</td><td>${cf}</td><td>${Math.round(U.pr[n])}</td>${arr(dl)}${arr(d)}</tr>`;}).join('');
  return `<p class="estat">Ranking nazionale ${infoB('urank')}</p>${infoX('urank',`<p>Sale con le vittorie (di più contro avversarie forti e con margini larghi) e scende con le sconfitte. Si aggiorna dopo ogni partita, comprese le 7 interregionali. Decide quanti posti ai Nationals ha ogni regione, le teste di serie e i gironi. E = Eastern, W = Western, C = Central, S = Southern; le frecce mostrano il cambio dall’ultima giornata e da inizio stagione.</p>`)}<div style="overflow-x:auto"><table class="rt"><tr><th>Club</th><th>Conf.</th><th>Punti</th><th>Giorn.</th><th>Stag.</th></tr>${rows}</table></div>`;
}
function renderEventUS(){
  const U=SV.us,sub=SV.done?'Stagione conclusa.':(U.ph==='reg'?usRegSub()+'.':US_PHASE_NAME[U.ph]+'.');
  $('eCards').innerHTML=`<button type="button" class="ecard on" data-e="camp"><strong>Men’s Club USA</strong><small>48 club, 8 Conference da 6: 5 giornate di Conference + 7 interregionali, Play-in e Nationals a 16 squadre. ${sub}</small></button>`;
  if(usTabPh!==U.ph){usTabPh=U.ph;usTabSel=(U.ph==='nat'||U.ph==='done')?'nat':'conf';}
  let body='';
  if(SV.done&&SV.next)body+=endSeasonHTML({rl:'Conference',awTitle:usConfName(U.cf)});
  body+=eventPages();
  if(eventPage!=='table'){
    const detail=eventPage==='calendar'?eventCalendar():eventPage==='stats'
      ?(leadersHTML()||'<p class="note">Le statistiche compariranno dopo le prime partite.</p>'):usNatView();
    $('eBody').innerHTML=body+detail;
    return;
  }
  body+=`<div class="seg" id="usTabs">${[['conf','Conference'],['nat','Nationals'],['rank','Ranking']].map(([k,l])=>`<button type="button" class="sg${usTabSel===k?' on':''}" data-ut="${k}">${l}</button>`).join('')}</div>`;
  body+=usTabSel==='nat'?usNatView():(usTabSel==='rank'?usRankView():usConfView());
  if(usTabSel==='nat'&&SV.usAlb?.length)body+=`<h3 class="eh">Albo d’oro dei Nationals</h3>${albHTML(SV.usAlb.slice(0,6))}`;
  $('eBody').innerHTML=body;
}
$('eBody').addEventListener('click',e=>{
  const t=e.target.closest('#usTabs [data-ut]');if(t){usTabSel=t.dataset.ut;renderEvent();return;}
  const c=e.target.closest('#usConfs [data-uc]');if(c){usConfSel=c.dataset.uc;renderEvent();}
});

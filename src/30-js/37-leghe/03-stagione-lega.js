/* ===================== LEGHE EUROPEE: LA STAGIONE =====================
   Motore comune a Belgio, Francia, Germania e Regno Unito (i formati stanno in 01-formati.js). Le funzioni italiane (beginSeason, recordResult, endSeason, nextMatch...)
   lo chiamano solo quando SV.lk e' uno dei campionati di LN_DEF; tutto il resto del gioco (partita, rosa, mercato, allenamenti, economia) e' lo stesso.
   Stato: SV.ln={tier, ci, pi, T, ph, F, ord, nT, nTier}:
     T[livello] = lista di competizioni {id, clubs, pools:[[club]...]}; tier = livello in cui giochi; ci = la tua competizione; pi = il tuo girone;
     ph = 'grp' (gironi) | 'fin' (fasi finali) | 'done'; ord = classifiche dei gironi a fine girone; F = fasi finali {lv:[...livelli], rd, rounds, order, done};
     nT/nTier = la nuova composizione dopo promozioni e retrocessioni (si applica all'inizio della stagione dopo).
   SV.sr = lnKey(paese, livello) e SV.mem[SV.sr] = il tuo girone; SV.sched/SV.tab/SV.round = il tuo girone (tutti contro tutti, sola andata);
   SV.lg[i] = gli altri gironi della tua competizione (giocano le loro giornate quando giochi le tue). Le altre competizioni e gli altri livelli si simulano a fine stagione.
   Una fase finale ha una partita per squadra a ogni turno (classifica completa: nessuno e' eliminato), quindi giochi sempre tutti i turni del tuo livello. */
Object.assign(PO_NAME,{ln:'Fase finale'});
const lnP=n=>(SV.rost&&SV.rost[n])||n===SV.team?teamPow(n):lnBasePower(n);
function lnBasePower(club){
  if(LN_PL.IW[club])return powerOfVals(LN_PL.IW[club].map(r=>r[5]));
  return LN_BY[club]?LN_BY[club].p-PW_LV:50;
}
function lnSnake(clubs,k){   // k gironi con le teste di serie a serpentina secondo la forza
  const s=clubs.slice().sort((a,b)=>lnP(b)-lnP(a)||(a<b?-1:1)),pl=[...Array(k)].map(()=>[]);
  s.forEach((n,i)=>{const r=Math.floor(i/k),c=i%k;pl[r%2?k-1-c:c].push(n);});
  return pl;
}
// composizione iniziale (dai dati) e gironi di ogni competizione
function lnBuildT(lk){
  const T={};
  const clubs=lnClubRows(lk);
  for(const tr of LN_DEF[lk].tiers){
    const rows=clubs.filter(r=>r[1]===tr.id);
    if(tr.comps>1){const gs=[];for(const r of rows)if(!gs.includes(r[2]))gs.push(r[2]);T[tr.id]=gs.map(g=>({id:g,clubs:rows.filter(r=>r[2]===g).map(r=>r[0])}));}
    else T[tr.id]=[{id:'',clubs:rows.map(r=>r[0]),g:Object.fromEntries(rows.map(r=>[r[0],r[2]]))}];
  }
  return T;
}
function lnPools(T,lk,real){   // gironi: i veri dove si conoscono (prima stagione), altrimenti a serpentina
  for(const tr of lnSeasonDef(lk,T).tiers)for(const c of T[tr.id]){
    if(tr.pools<=1){c.pools=[c.clubs.slice().sort((a,b)=>lnP(b)-lnP(a)||(a<b?-1:1))];continue;}
    if(tr.geo){const o=c.clubs.slice().sort((a,b)=>lnGeoX(a)-lnGeoX(b)||(a<b?-1:1)),h=Math.ceil(o.length/2);c.pools=[o.slice(0,h),o.slice(h)];continue;}   // da ovest a est
    const A=c.g&&real?c.clubs.filter(n=>c.g[n]==='A'):[],B=c.g&&real?c.clubs.filter(n=>c.g[n]==='B'):[];
    c.pools=A.length&&B.length&&A.length+B.length===c.clubs.length?[A,B]:lnSnake(c.clubs,tr.pools);
  }
}
const lnTierDef=()=>lnTiers().find(t=>t.id===SV.ln.tier);
const lnComp=()=>SV.ln.T[SV.ln.tier][SV.ln.ci];
function lnLocate(club){
  const L=SV.ln;
  for(const tr of lnTiers())for(let ci=0;ci<L.T[tr.id].length;ci++){const c=L.T[tr.id][ci];const pi=c.pools.findIndex(p=>p.includes(club));if(pi>=0)return {tier:tr.id,ci,pi};}
  return null;
}
// all'inizio di ogni stagione (da beginSeason): applica promozioni e retrocessioni, rifa' i gironi e mette te nel tuo
function lnPrepSeason(){
  const L=SV.ln,first=!L.T;
  if(first)L.T=lnBuildT(SV.lk);
  else if(L.nT){L.T=L.nT;L.nT=null;}
  lnPools(L.T,SV.lk,first);
  const at=lnLocate(SV.team);L.tier=at.tier;L.ci=at.ci;L.pi=at.pi;
  SV.sr=lnKey(SV.lk,L.tier);SV.mem={[SV.sr]:L.T[L.tier][L.ci].pools[L.pi].slice()};
}
// a inizio stagione: se la composizione del salvataggio e' nel formato vecchio (LN_OLD), passa a quello nuovo. I club tengono il livello dove li hanno
// portati promozioni e retrocessioni dell'ultima stagione, tradotto con map (N1+N2 belghe = N1 nuova...); i gironi si rifanno da soli (lnPools).
// Il livello piu' vecchio (extra) si chiude come nel cambio precedente: l'Open Tour britannico entra nei Nationals, la N3 francese esce dal gioco.
function lnUpgradeFormat(){
  const L=SV.ln,lk=SV.lk,old=LN_OLD[lk],T=L?.nT;
  if(!old||!T||!lnIsOld(lk,T))return;
  const d=LN_DEF[lk],nT={};for(const t of d.tiers)nT[t.id]=[{id:'',clubs:[]}];
  for(const [id,cs] of Object.entries(T)){
    const to=old.map[id];
    if(to)nT[to][0].clubs.push(...cs.flatMap(c=>c.clubs));
    else if(lk==='UK')nT.N1[0].clubs.push(...cs.flatMap(c=>c.clubs));
  }
  let nTier=old.map[L.nTier]||(lk==='UK'?'N1':null);
  if(!nTier){   // eri nel livello che sparisce: il tuo club passa al livello piu' basso rimasto
    nTier=d.tiers[d.tiers.length-1].id;nT[nTier][0].clubs.push(SV.team);
  }
  L.nT=nT;L.nTier=nTier;
  const active=new Set(Object.values(nT).flatMap(cs=>cs.flatMap(c=>c.clubs)));
  for(const club of Object.keys(SV.rost))if(!active.has(club))delete SV.rost[club];
  SV.next.sr=lnKey(lk,nTier);
  SV.next.mem={[SV.next.sr]:[]};
  news(`Nuovo formato del campionato ${d.de}: ${d.txt}`);
}
function lnLeagueBegin(){   // chiamata da leagueBegin() a ogni inizio stagione
  const L=SV.ln,comp=lnComp(),g=lnCompMin(lnTierDef(),comp);SV.lg={};
  SV.sched=lnGrpSched(SV.mem[SV.sr].length,g);SV.round=0;   // piu' giri se servono per arrivare ad almeno 11 partite (06-partite-minime.js)
  comp.pools.forEach((n,i)=>{if(i!==L.pi)SV.lg[i]={sched:lnGrpSched(n.length,g),round:0,tab:usFreshTab(n),last:[],streak:{}};});
  L.ph='grp';L.F=null;L.ord=null;L.stage=0;
  lnSkipBye();
}
function lnLeagueAdvance(){   // gli altri gironi della tua competizione giocano la loro giornata quando giochi la tua
  if(!SV.lg||!SV.sched)return;
  const R=SV.sched.length,comp=lnComp();
  for(const i in SV.lg){
    const L=SV.lg[i],n=comp.pools[i],upto=SV.done||SV.round>=R||SV.ln.ph!=='grp'?L.sched.length:Math.min(L.sched.length,Math.floor(SV.round*L.sched.length/R));
    while(L.round<upto){
      const last=[];
      for(const [a,b] of L.sched[L.round]){
        const x=n[a],y=n[b],[sa,sb]=simPower(x,y);usAddRes(L.tab,x,y,sa,sb);last.push([x,y,sa,sb]);
        const w=sa>sb?x:y,l=sa>sb?y:x;L.streak[w]=(L.streak[w]|0)+1;L.streak[l]=0;
        if(teamPow(l)-teamPow(w)>=9&&Math.random()<0.5)story(`Sorpresa nel ${SERIES_NAME[SV.sr]}: ${w} batte ${l} ${Math.max(sa,sb)}–${Math.min(sa,sb)}.`,Math.random()<0.3);
      }
      L.last=last;L.round++;
    }
  }
}
const lnPoolTab=i=>i===SV.ln.pi?SV.tab:(SV.lg&&SV.lg[i]?SV.lg[i].tab:null);
function lnHalf(){
  const comp=lnComp(),L=SV.ln;
  comp.pools.forEach((p,i)=>{const t=lnPoolTab(i);if(!t)return;const o=usRanking(t,p);story(`Giro di boa${comp.pools.length>1?' nel girone '+lnPoolName(lnTierDef(),i):''}: capolista ${o[0]} (${t[o[0]].w}–${t[o[0]].l}), ultima ${o[o.length-1]}.`,false);});
}
// gironi con numero dispari di squadre: nei turni di riposo si gioca solo il resto del girone
function lnSkipBye(){
  const L=SV.ln;if(!L||L.ph!=='grp'||!SV.sched)return;
  const names=SV.mem[SV.sr],ui=names.indexOf(SV.team);
  while(SV.round<SV.sched.length&&!SV.sched[SV.round].some(m=>m[0]===ui||m[1]===ui)){
    for(const [i,j] of SV.sched[SV.round]){const a=names[i],b=names[j],[sa,sb]=simPower(a,b);usAddRes(SV.tab,a,b,sa,sb);}
    SV.round++;leagueAdvance();
  }
}
// ---- una tua partita (giocata o simulata) ----
function lnRecord(win,su,so){
  if(SV.ln.ph==='grp')return lnGrpRecord(win,su,so);
  return lnFinRecord(win,su,so);
}
function lnGrpRecord(win,su,so){
  const names=SV.mem[SV.sr],ui=names.indexOf(SV.team);let opp0='';
  for(const [i,j] of SV.sched[SV.round]){
    const a=names[i],b=names[j];
    if(i===ui){usAddRes(SV.tab,a,b,su,so);SV.res.push({opp:b,su,so});opp0=b;if(lsLive())lsMatch(b,so);}
    else if(j===ui){usAddRes(SV.tab,a,b,so,su);SV.res.push({opp:a,su,so});opp0=a;if(lsLive())lsMatch(a,so);}
    else{const [sa,sb]=simPower(a,b);usAddRes(SV.tab,a,b,sa,sb);if(lsLive()){lsMatch(a,sa);lsMatch(b,sb);}}
  }
  SV.round++;
  leagueAdvance();
  fansBump(win,SV.riv&&opp0===SV.riv?(win?1.5:-1):0);
  const dby=derbyAfter(opp0,win);
  if(SV.round===Math.floor(SV.sched.length/2)){retireCheck('mid');leagueRetAnnounce();lnHalf();}
  lnSkipBye();
  if(SV.round>=SV.sched.length)return lnGrpEnd(dby);
  return `Giornata ${SV.round} di ${SV.sched.length} conclusa: ${myRank()}° nel girone. Prossima: ${nextMatch().name}.`+dby;
}
// fine dei gironi: classifiche e, se il livello ha fasi finali, il tabellone
function lnGrpEnd(dby){
  const L=SV.ln,tr=lnTierDef(),comp=lnComp();leagueAdvance();
  L.ord=comp.pools.map((p,i)=>usRanking(lnPoolTab(i),p));
  const r=L.ord[L.pi].indexOf(SV.team)+1;
  if(!tr.fin.length)return lnClose(`Girone concluso al ${r}° posto.`+dby);
  L.ph='fin';L.F=lnFinBuild(tr.fin,L.ord,lnFinTag(tr));
  const t=lnFinNext();
  return `Gironi conclusi: ${r}° posto${comp.pools.length>1?' nel girone '+lnPoolName(tr,L.pi):''}. ${t}`+dby;
}
// ---- fasi finali: tabelloni con classifica completa ----
const lnFinTag=tr=>lnTiers()[0].id===tr.id?'Playoff':'Promozione';
const lnMk=(a,b)=>a===null&&b===null?[null,null,null,null,null]:(a===null||b===null?[a,b,null,null,a===null?b:a]:[a,b,null,null,null]);   // una squadra sola: passa il turno
const lnWin=m=>m[4],lnLos=m=>m[4]===null||m[0]===null||m[1]===null?null:(m[4]===m[0]?m[1]:m[0]);
const lnPad=(a,n)=>[...Array(n)].map((_,i)=>a[i]===undefined?null:a[i]);
function lnLvInit(sp,pools,base){
  const A=lnPad(pools[0]||[],(sp.m==='c8'||sp.m==='x8')&&pools.length>1?4:Math.max(2,pools[0].length)),B=pools[1]?lnPad(pools[1],A.length):lnPad([],A.length);
  const lv={m:sp.m,base,R:[],order:null,rounds:0,T:[].concat(...pools)};
  if(sp.m==='c8'&&pools.length===1){const S=lnPad(pools[0],8);lv.rounds=3;lv.R[0]=[lnMk(S[0],S[7]),lnMk(S[3],S[4]),lnMk(S[1],S[6]),lnMk(S[2],S[5])];}   // girone unico: 1ª-8ª, 4ª-5ª, 2ª-7ª, 3ª-6ª
  else if(sp.m==='b6'){const S=lnPad(pools[0],6);lv.rounds=3;lv.R[0]=[lnMk(S[0],null),lnMk(S[1],null),lnMk(S[2],S[5]),lnMk(S[3],S[4])];}   // 1ª e 2ª dirette in semifinale
  else if(sp.m==='c8'){lv.rounds=3;lv.R[0]=[lnMk(A[0],B[3]),lnMk(A[3],B[0]),lnMk(A[1],B[2]),lnMk(B[1],A[2])];}
  else if(sp.m==='x8'){lv.rounds=2;lv.R[0]=[lnMk(A[0],B[1]),lnMk(B[0],A[1]),lnMk(A[2],B[3]),lnMk(B[2],A[3])];}
  else if(sp.m==='c4'||sp.m==='k4'){lv.rounds=2;lv.R[0]=pools.length>1?[lnMk(A[0],B[1]),lnMk(B[0],A[1])]:[lnMk(A[0],A[3]),lnMk(A[1],A[2])];}
  else if(sp.m==='p'){lv.rounds=1;const t=pools[0],R=[];for(let k=0;k<t.length;k+=2)R.push(lnMk(t[k],t[k+1]===undefined?null:t[k+1]));lv.R[0]=R;}
  else{const t=lv.T;lv.sched=roundRobin(t.length);lv.rounds=lv.sched.length;lv.tab=usFreshTab(t);lv.R[0]=lv.sched[0].map(([i,j])=>lnMk(t[i],t[j]));}
  return lv;
}
function lnFinBuild(fin,ord,tag){
  const F={lv:[],rd:0,rounds:0,order:null,done:false,f0:fin[0]?fin[0].f:1};let base=F.f0;   // f0: prima posizione che entra nella fase (2 = la prima e' gia' promossa)
  for(const sp of fin){
    const pools=ord.map(o=>o.slice(sp.f-1,sp.t)).filter(p=>p.length);
    if(!pools.length)continue;
    const lv=lnLvInit(sp,sp.m==='p'?[ord[0].slice(sp.f-1,sp.t)]:pools,base);
    if(tag&&base===1&&(sp.m==='c4'||sp.m==='b6'))lv.tag=tag;
    F.lv.push(lv);base+=pools.reduce((a,p)=>a+p.length,0);
  }
  F.rounds=Math.max(0,...F.lv.map(l=>l.rounds));
  return F;
}
function lnPlay(a,b,rec){
  if(rec&&((rec[0]===a&&rec[1]===b)||(rec[0]===b&&rec[1]===a)))return rec[0]===a?rec:[a,b,rec[3],rec[2],rec[4]];
  const [sa,sb]=simPower(a,b);return [a,b,sa,sb,sa>sb?a:b];
}
// dopo un turno: prepara il successivo di un livello, oppure ne fissa la classifica
function lnLvNext(lv,rd){
  const R=lv.R[rd],W=R.map(lnWin),Lo=R.map(lnLos),fl=a=>a.filter(x=>x!==null);
  if(rd+1>=lv.rounds){   // classifica del livello
    if(lv.m==='k4'){   // finale (vincente e perdente), poi le due perdenti delle semifinali in ordine di classifica
      const sl=lv.R[0].map(lnLos).filter(x=>x!==null).sort((a,b)=>lv.T.indexOf(a)-lv.T.indexOf(b));
      lv.order=fl([lnWin(R[0]),lnLos(R[0])]).concat(sl);return;
    }
    if(lv.m==='b6'){   // finale, finale per il 3° posto, poi chi ha perso i quarti in ordine di classifica
      lv.order=fl([lnWin(R[0]),lnLos(R[0]),lnWin(R[1]),lnLos(R[1])]).concat(lv.R[0].slice(2).map(lnLos).filter(x=>x!==null).sort((a,b)=>lv.T.indexOf(a)-lv.T.indexOf(b)));return;
    }
    if(lv.m==='c8'||lv.m==='x8'||lv.m==='c4'||lv.m==='p')lv.order=fl([].concat(...R.map(m=>[lnWin(m),lnLos(m)])));
    else lv.order=usRanking(lv.tab,lv.T);
    return;
  }
  if(lv.m==='c8'){
    if(rd===0)lv.R[1]=[lnMk(W[0],W[3]),lnMk(W[1],W[2]),lnMk(Lo[0],Lo[3]),lnMk(Lo[1],Lo[2])];
    else lv.R[2]=[lnMk(W[0],W[1]),lnMk(Lo[0],Lo[1]),lnMk(W[2],W[3]),lnMk(Lo[2],Lo[3])];
  }else if(lv.m==='b6'){
    if(rd===0)lv.R[1]=[lnMk(W[0],W[3]),lnMk(W[1],W[2])];
    else lv.R[2]=[lnMk(W[0],W[1]),lnMk(Lo[0],Lo[1])];
  }else if(lv.m==='x8')lv.R[1]=[lnMk(W[0],W[1]),lnMk(Lo[0],Lo[1]),lnMk(W[2],W[3]),lnMk(Lo[2],Lo[3])];
  else if(lv.m==='c4')lv.R[1]=[lnMk(W[0],W[1]),lnMk(Lo[0],Lo[1])];
  else if(lv.m==='k4')lv.R[1]=[lnMk(W[0],W[1])];
  else lv.R[rd+1]=lv.sched[rd+1].map(([i,j])=>lnMk(lv.T[i],lv.T[j]));
}
// gioca il turno in corso di tutti i livelli: la tua partita (rec) e le altre, simulate
function lnFinRoundF(F,rec){
  const rd=F.rd;
  for(const lv of F.lv){
    if(rd>=lv.rounds)continue;
    const R=lv.R[rd];
    for(let k=0;k<R.length;k++){const m=R[k];if(m[4]!==null||m[0]===null||m[1]===null)continue;R[k]=lnPlay(m[0],m[1],rec);if(lv.tab)usAddRes(lv.tab,R[k][0],R[k][1],R[k][2],R[k][3]);}
    lnLvNext(lv,rd);
  }
  F.rd++;
  if(F.rd>=F.rounds){F.done=true;F.order=[].concat(...F.lv.map(l=>l.order||[]));}
}
const lnFinRound=rec=>lnFinRoundF(SV.ln.F,rec);
function lnFinUser(){
  const F=SV.ln.F,rd=F.rd;if(!F||rd>=F.rounds)return null;
  for(let li=0;li<F.lv.length;li++){
    const lv=F.lv[li];if(rd>=lv.rounds)continue;
    const k=lv.R[rd].findIndex(m=>m[4]===null&&(m[0]===SV.team||m[1]===SV.team));
    if(k>=0){const m=lv.R[rd][k];return {opp:m[0]===SV.team?m[1]:m[0],li,k};}
  }
  return null;
}
function lnLvLabel(lv,rd,k){
  const b=lv.base,pl=j=>`${b+j}°-${b+j+1}° posto`;
  if(lv.m==='c8')return rd===0?'Quarti di finale':(rd===1?(k<2?'Semifinale':`Semifinale ${b+4}°-${b+7}° posto`):'Finale '+pl(2*k));
  if(lv.m==='x8')return rd===0?'Turno incrociato':'Finale '+pl(2*k);
  const tg=lv.tag?lv.tag+' · ':'';   // Playoff (livello piu' alto) o Promozione
  if(lv.m==='b6')return tg+(rd===0?'Quarti di finale':(rd===1?'Semifinale':(k?'Finale per il 3° posto':'Finale')));
  if(lv.m==='c4')return tg+(rd===0?'Semifinale':(k?'Finale per il 3° posto':'Finale'));
  if(lv.m==='k4')return (b>1?'Spareggio promozione':'Playoff scudetto')+' · '+(rd===0?'Semifinale':'Finale');
  if(lv.m==='p')return 'Finale '+pl(2*k);
  return `Posti ${b}°-${b+lv.T.length-1}° · partita ${rd+1} di ${lv.rounds}`;
}
function lnLabel(){
  const L=SV.ln,po=SV.po;if(!L||!po||!L.F)return 'Fase finale';
  const F=L.F,rd=po.round,lv=F.lv[po.li];if(!lv)return 'Fase finale';
  return lnLvLabel(lv,rd,po.k);
}
// prepara la tua prossima partita delle fasi finali, simulando i turni in cui non giochi; se non ne hai piu' chiude la stagione
function lnFinNext(){
  const L=SV.ln,F=L.F;
  while(F.rd<F.rounds){
    const u=lnFinUser();
    if(u){SV.po={on:true,kind:'ln',round:F.rd,opp:u.opp,li:u.li,k:u.k,last:SV.po&&SV.po.last||null};L.stage=Math.max(L.stage|0,1);return `${lnLabel()}: ${u.opp}.`;}
    lnFinRound(null);
  }
  return lnClose('');
}
function lnFinRecord(win,su,so){
  const L=SV.ln,po=SV.po,opp=po.opp,lab=lnLabel(),rec=[SV.team,opp,su,so,win?SV.team:opp];
  po.on=false;po.last={opp,su,so,win,label:lab};
  lnFinRound(rec);
  return `${lab}: ${win?'vittoria':'sconfitta'} contro ${opp} (${su}–${so}). `+lnFinNext();
}
function lnClose(txt){   // girone o fasi finali concluse: si chiude la stagione
  SV.po=null;SV.ln.ph='done';
  endSeason();
  return (txt?txt+' ':'')+SV.next.short;
}
// ---- classifiche finali, simulazione delle altre competizioni, promozioni e retrocessioni ----
function lnRest(ord,used){   // le squadre fuori dalle fasi finali, per posizione nel girone (1ª A, 1ª B, 2ª A...)
  const out=[],mx=Math.max(0,...ord.map(o=>o.length));
  for(let r=0;r<mx;r++)for(const o of ord)if(o[r]!==undefined&&!used.has(o[r]))out.push(o[r]);
  return out;
}
function lnCompOrder(ord,F){
  const pre=F&&F.f0>1&&ord.length===1?ord[0].slice(0,F.f0-1):[];   // chi non entra nelle fasi finali perche' gia' sopra (la prima promossa direttamente) sta davanti
  const head=pre.concat(F&&F.order?F.order:[]),used=new Set(head);
  return head.concat(lnRest(ord,used));
}
function lnSimComp(tr,comp){   // simula una competizione intera: gironi, fasi finali, classifica
  const g=lnCompMin(tr,comp);
  const ord=comp.pools.map(p=>{const t=usFreshTab(p);for(const R of lnGrpSched(p.length,g))for(const [i,j] of R){const [sa,sb]=simPower(p[i],p[j]);usAddRes(t,p[i],p[j],sa,sb);}return usRanking(t,p);});
  let F=null;
  if(tr.fin.length){F=lnFinBuild(tr.fin,ord,lnFinTag(tr));while(!F.done&&F.rd<F.rounds)lnFinRoundF(F,null);}
  return {ord,F,order:lnCompOrder(ord,F)};
}
function lnTierOrder(tr,orders){   // un solo elenco per livello: le prime di ogni competizione per prime, a parita' la piu' forte
  if(orders.length===1)return orders[0];
  const out=[],mx=Math.max(...orders.map(o=>o.length));
  for(let r=0;r<mx;r++)out.push(...orders.map(o=>o[r]).filter(x=>x!==undefined).sort((a,b)=>lnP(b)-lnP(a)));
  return out;
}
// nuova composizione: le ultime n di un livello scambiano con le prime n del successivo
function lnMoves(lk,tierOrders){
  // il formato della stagione che finisce (tierOrders ha solo le classifiche)
  const {tiers,mv}=lnSeasonDef(lk,SV.ln?SV.ln.T:null),nm={};for(const t of tiers)nm[t.id]=tierOrders[t.id].slice();
  for(let i=0;i<tiers.length-1;i++){
    const n=Math.min(mv[i],Math.floor(tierOrders[tiers[i].id].length/2),Math.floor(tierOrders[tiers[i+1].id].length/2)),hi=tiers[i].id,lo=tiers[i+1].id;
    const down=tierOrders[hi].slice(-n),up=tierOrders[lo].slice(0,n);
    nm[hi]=nm[hi].filter(c=>!down.includes(c)).concat(up);nm[lo]=nm[lo].filter(c=>!up.includes(c)).concat(down);
  }
  return nm;
}
// le competizioni separate (N2 francese, 2. Liga...) tengono i loro club; i nuovi arrivati vanno dove c'e' posto
function lnRegroup(lk,T,nm){
  const out={};
  for(const tr of lnSeasonDef(lk,T).tiers){
    const old=T[tr.id],set=new Set(nm[tr.id]);
    if(tr.comps<=1){out[tr.id]=[{id:old[0].id,clubs:nm[tr.id].slice()}];continue;}
    const comps=old.map(c=>({id:c.id,clubs:c.clubs.filter(n=>set.has(n))})),placed=new Set([].concat(...comps.map(c=>c.clubs))),size=comps.map(c=>c.clubs.length);
    const target=old.map(c=>c.clubs.length);
    for(const n of nm[tr.id])if(!placed.has(n)){
      let bi=0,bd=-1e9;comps.forEach((c,i)=>{const d=target[i]-c.clubs.length;if(d>bd){bd=d;bi=i;}});comps[bi].clubs.push(n);
    }
    out[tr.id]=comps;
  }
  return out;
}
const LN_PRIZE=n=>Math.round(n*1.0);
function lnEndSeason(){
  const L=SV.ln,lk=SV.lk,tiers=lnTiers(),tr=lnTierDef(),comp=lnComp();
  chalEval();   // la sfida della dirigenza si giudica prima dei premi
  const mine=lnCompOrder(L.ord||[comp.pools[L.pi].slice()],L.F),rank=mine.indexOf(SV.team)+1,n=mine.length;
  // tutte le altre competizioni (stesso livello e altri livelli) si giocano adesso
  const tierOrders={},sim={};
  for(const t of tiers){
    const orders=L.T[t.id].map((c,ci)=>{
      if(t.id===L.tier&&ci===L.ci)return mine;
      const r=lnSimComp(t,c);sim[t.id+'|'+ci]=r;return r.order;
    });
    tierOrders[t.id]=lnTierOrder(t,orders);
  }
  const nm=lnMoves(lk,tierOrders),T2=lnRegroup(lk,L.T,nm);
  const nTier=tiers.find(t=>nm[t.id].includes(SV.team)).id,ni=tiers.findIndex(t=>t.id===nTier),ci=tiers.findIndex(t=>t.id===L.tier);
  L.nT=T2;L.nTier=nTier;
  const top=tiers[0].id,champ=tierOrders[top][0],tit=L.tier===top&&rank===1&&(!!mine[0]&&mine[0]===SV.team);
  const run=tierOrders[top][1];
  SV.lnAlb=[{s:SV.season,champ,run,lk,tier:top}].concat(SV.lnAlb||[]).slice(0,60);
  let short;
  if(tit)short=`Siete campioni ${LN_DEF[lk].de}!`;
  else if(ni<ci)short=`Promossi in ${tiers[ni].name}!`;
  else if(ni>ci)short=`Retrocessi in ${tiers[ni].name}.`;
  else short=`Restate in ${tr.name}: ${rank}° su ${n}.`;
  // premio, obiettivo, reputazione e tifosi
  const prize=Math.round(LN_PRIZE(Math.max(1,n-rank+1)*3)*SR_K[SV.sr]),ok=objMet(rank,{promoted:ni<ci,tit});SV.cash+=prize;
  const objPay=spPayout(ok,tit&&L.tier===top);SV.cash+=objPay;
  SV.lastRk={s:SV.season,t:SV.team,lk:SV.lk,sr:SV.sr,rank:tit?1:rank,n};   // per gli obiettivi della stagione dopo (objLast)
  if(SV.obj){if(ok||objPay){SV.rep=clamp(SV.rep+3+Math.min(4,Math.max(0,SV.obj.tgt-rank)*0.5),0,100);}else SV.rep=clamp(SV.rep-5,0,100);}
  if(ni<ci){SV.rep=clamp(SV.rep+6,0,100);const nk=lnKey(lk,nTier),pp=promoPrize(nk);SV.cash+=pp;news('Premio della lega per la promozione: +'+pp+' crediti per rinforzarvi in '+tiers[ni].name+'.');}else if(ni>ci)SV.rep=clamp(SV.rep-8,0,100);   // premio della lega: 30-carriera/05-economia.js
  if(tit)SV.rep=clamp(SV.rep+6,0,100);
  fansSeason(rank,nTier,L.tier);if(tit)SV.fans=clamp(fansOf()+6,0,100);
  const eu=LN_DEF[lk].eu,euQ=L.tier===top&&eu?euField(lk,mine.slice(0,eu),mine[eu]):[],qual=euQ.includes(SV.team);   // le prime eu dopo le fasi finali; la successiva puo' prendere il sedicesimo posto
  SV.done=true;SV.po=null;SV.poRes=null;
  SV.next={mem:{[lnKey(lk,nTier)]:[]},sr:lnKey(lk,nTier),rank,short,qual,euQ,tit,champs:{[lk]:champ},po:null,prize,objOk:!!objPay,objPay,ln:{tier:L.tier,n,champ,nTier}};
  seasonEndDyn(rank);   // sfida della dirigenza e obiettivi personali
  seasonAwards(rank,null);
  if(SV.hist[0]&&SV.hist[0].season===SV.season)SV.hist[0].ln={tier:L.tier,rank,n,champ};
  achCheck();
  news(`Stagione ${SV.season} conclusa: ${short} Premio di ${prize} crediti`+(SV.obj?(objPay?`, bonus dello sponsor (+${objPay})`:', lo sponsor non paga il bonus'):'')+'.');
}

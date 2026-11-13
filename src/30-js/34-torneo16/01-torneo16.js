/* ===================== TORNEO A 16 SQUADRE: gironi da 4, prequarti, quarti, semifinali, finale =====================
   Motore comune ai Nationals USA e agli EUCF europei (stesso formato): 16 squadre in 4 fasce di ranking, ogni girone ne prende una per fascia; 3 partite a girone;
   le prime ai quarti, le seconde e le terze ai prequarti (2ª contro 3ª di un altro girone), le quarte fuori dalla corsa al titolo. Nessun accoppiamento duplicato.
   Stato N: {seed, pools, tabs, sched, pg, rd, ord, ko, champ, out}: rd = turno (0-2 gironi, 3 prequarti, 4 quarti, 5 semifinali, 6 finale, 7 concluso);
   ko[0..3] = prequarti, quarti, semifinali, finale; ogni partita e' [a,b,punti a,punti b,vincitrice].
   Il contesto ctx collega il torneo al campionato che lo usa: ctx.rate(t) = forza per le fasce e i tabelloni, ctx.grp(t) = gruppo da tenere in gironi diversi
   (Conference, Paese), ctx.play(a,b) = simula la partita e aggiorna il ranking, ritorna [a,b,pa,pb,vincitrice]. */
function t16Perms(n){if(n===1)return [[0]];const out=[];for(const p of t16Perms(n-1))for(let i=0;i<=p.length;i++)out.push(p.slice(0,i).concat(n-1,p.slice(i)));return out;}
const T16_PERMS=t16Perms(4);
function t16Begin(ctx,q,me){
  const seed=q.slice().sort((x,y)=>ctx.rate(y)-ctx.rate(x)||(x<y?-1:1));
  // quattro fasce del ranking (1-4, 5-8, 9-12, 13-16): ogni girone ne prende una per fascia (le prime 4 sono le teste di serie).
  // Tra tutti i sorteggi possibili si sceglie quello con meno squadre dello stesso gruppo nello stesso girone e, a parita', i gironi piu' bilanciati
  let pools=null,bs=Infinity;
  for(const a of T16_PERMS)for(const b of T16_PERMS)for(const c of T16_PERMS){
    const pl=[0,1,2,3].map(i=>[seed[i]]);
    [[1,a],[2,b],[3,c]].forEach(([f,pm])=>seed.slice(f*4,f*4+4).forEach((t,i)=>pl[pm[i]].push(t)));
    let conf=0;for(const p of pl){const cs=p.map(ctx.grp);conf+=cs.length-new Set(cs).size;}
    const sums=pl.map(p=>p.reduce((x,t)=>x+ctx.rate(t),0)),m=(sums[0]+sums[1]+sums[2]+sums[3])/4,v=sums.reduce((x,y)=>x+(y-m)*(y-m),0),sc=conf*1e9+v;
    if(sc<bs){bs=sc;pools=pl;}
  }
  return {seed,pools,tabs:pools.map(pl=>usFreshTab(pl)),sched:roundRobin(4),pg:pools.map(()=>[]),rd:0,ord:null,ko:[],champ:null,out:!q.includes(me)};
}
const t16Pool=(N,t)=>N.pools.findIndex(pl=>pl.includes(t));
function t16User(N,me){   // la tua partita nel turno in corso: {opp} oppure null
  const rd=N.rd;if(rd>6||N.out)return null;
  if(rd<3){const p=t16Pool(N,me);if(p<0)return null;const pl=N.pools[p];for(const [i,j] of N.sched[rd])if(pl[i]===me||pl[j]===me)return {opp:pl[i]===me?pl[j]:pl[i]};return null;}
  const L=N.ko[rd-3];if(!L)return null;
  const m=L.find(x=>x[0]===me||x[1]===me);return m?{opp:m[0]===me?m[1]:m[0]}:null;
}
// gioca il turno in corso: la tua partita (rec, gia' giocata e gia' contata nel ranking) e tutte le altre, simulate
function t16Round(ctx,N,rec){
  const rd=N.rd,play=(a,b)=>rec&&((rec[0]===a&&rec[1]===b)||(rec[0]===b&&rec[1]===a))?(rec[0]===a?rec:[a,b,rec[3],rec[2],rec[4]]):ctx.play(a,b);   // l'ordine delle squadre resta quello del tabellone
  if(rd<3){
    N.pools.forEach((pl,p)=>{N.pg[p][rd]=N.sched[rd].map(([i,j])=>{const m=play(pl[i],pl[j]);usAddRes(N.tabs[p],m[0],m[1],m[2],m[3]);return m;});});
    if(rd===2){   // gironi finiti: prime ai quarti, seconde e terze ai prequarti (2ª contro 3ª di un altro girone), quarte fuori
      N.ord=N.pools.map((pl,p)=>usRanking(N.tabs[p],pl));
      N.ko=[[0,1,2,3].map(p=>[N.ord[p][1],N.ord[(p+1)%4][2],null,null,null])];
    }
  }else{
    const L=N.ko[rd-3];for(let k=0;k<L.length;k++)L[k]=play(L[k][0],L[k][1]);
    if(rd===3)t16Quarters(ctx,N);
    else if(rd===4)N.ko[2]=[[N.ko[1][0][4],N.ko[1][1][4],null,null,null],[N.ko[1][2][4],N.ko[1][3][4],null,null,null]];
    else if(rd===5)N.ko[3]=[[N.ko[2][0][4],N.ko[2][1][4],null,null,null]];
    else N.champ=N.ko[3][0][4];
  }
  N.rd++;
}
// quarti: le 4 prime dei gironi (teste di serie per punti e differenza mete) contro le vincitrici dei prequarti. Nessuna rivincita di girone;
// due vincitrici dei prequarti dello stesso girone finiscono in meta' tabellone diverse (non si incontrano prima della finale)
function t16Quarters(ctx,N){
  const pr={};for(const t of N.seed)pr[t]=ctx.rate(t);const heads=N.ord.map((o,p)=>({t:o[0],p,s:N.tabs[p][o[0]]})).sort((a,b)=>b.s.pts-a.s.pts||(b.s.pf-b.s.pa)-(a.s.pf-a.s.pa)||pr[b.t]-pr[a.t]).map(x=>x.t);
  const w=N.ko[0].map(m=>m[4]);let best=null,bs=Infinity;
  for(const pm of T16_PERMS){   // pm[i] = quale vincitrice dei prequarti incontra la testa di serie i; slot del tabellone: 1ª, 4ª, 3ª, 2ª
    const slot=[0,3,2,1];let c=0;
    heads.forEach((h,i)=>{if(t16Pool(N,h)===t16Pool(N,w[pm[i]]))c+=1e6;c+=pr[h]*pr[w[pm[i]]]/1e4;});
    for(let a=0;a<4;a++)for(let b=a+1;b<4;b++)if(t16Pool(N,w[pm[a]])===t16Pool(N,w[pm[b]])&&((slot[a]<2)===(slot[b]<2)))c+=1e3;
    if(c<bs){bs=c;best=pm;}
  }
  const q=[];[0,3,2,1].forEach((s,k)=>{const i=s;q[k]=[heads[i],w[best[i]],null,null,null];});   // slot 0: testa 1 · slot 1: testa 4 · slot 2: testa 3 · slot 3: testa 2
  N.ko[1]=q;
}

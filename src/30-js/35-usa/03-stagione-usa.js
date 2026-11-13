/* ===================== USA MEN'S CLUB: LA STAGIONE =====================
   Regole del campionato USA, separate da quelle italiane. Le funzioni italiane (beginSeason, recordResult, endSeason, nextMatch...) chiamano questo modulo solo
   quando SV.lk==='US'; tutto il resto del gioco (partita, rosa, mercato, allenamenti, economia) e' lo stesso.
   1) STAGIONE REGOLARE: 7 giornate nella propria Conference (8 club, sola andata). Classifica: vittorie, scontri diretti, differenza mete.
   2) PLAY-IN: 1ª e 2ª di ogni Conference vanno ai Nationals; 3ª-6ª e 4ª-5ª si sfidano in gara secca; 7ª e 8ª sono fuori.
   3) NATIONALS: 16 club in 4 gironi da 4 (fasce del ranking nazionale, club della stessa Conference in gironi diversi quando si puo'). Le prime vanno ai quarti,
      le seconde e le terze ai prequarti (2ª contro 3ª di un altro girone), le quarte sono fuori. Poi quarti, semifinali e finale.
   4) RANKING NAZIONALE (SV.us.pr): punteggio Elo aggiornato dopo ogni partita ufficiale, contro la forza dell'avversario e col margine di mete.
   Stato: SV.us={cf, conf, ph, pr, pr0, fin, pin, q, nat, stage}. SV.sr==='U', SV.mem.U = i club della tua Conference, SV.lg = le altre tre Conference.
   nat={pools, tabs, sched, pg, rd, ord, ko, champ, out}: rd = turno in corso (0-2 gironi, 3 prequarti, 4 quarti, 5 semifinali, 6 finale, 7 concluso);
   ko[0..3] = prequarti, quarti, semifinali, finale: ogni partita e' [a,b,punti a,punti b,vincitrice]. */
Object.assign(PO_NAME,{pin:'Play-in',nat:'Nationals'});
const US_POOL=['A','B','C','D'];
// ---- tabella e classifica: vittorie, scontri diretti tra i pari merito, differenza mete ----
const usFreshTab=names=>{const t=freshTab(names);for(const n of names)t[n].h={};return t;};   // h: saldo vittorie-sconfitte contro ogni avversaria
function usAddRes(tab,a,b,sa,sb){addRes(tab,a,b,sa,sb);const w=sa>sb?1:-1;tab[a].h[b]=(tab[a].h[b]|0)+w;tab[b].h[a]=(tab[b].h[a]|0)-w;}
function usRanking(tab,names){
  const g={};for(const n of names)(g[tab[n].w]=g[tab[n].w]||[]).push(n);
  const out=[];
  for(const w of Object.keys(g).map(Number).sort((a,b)=>b-a)){
    let grp=g[w];
    if(grp.length>1){   // pari merito: prima gli scontri diretti nel gruppo, poi la differenza mete, poi le mete fatte
      const hw=n=>grp.reduce((a,m)=>a+(m!==n&&(tab[n].h[m]|0)>0?1:0),0);
      grp=grp.slice().sort((a,b)=>hw(b)-hw(a)||(tab[b].pf-tab[b].pa)-(tab[a].pf-tab[a].pa)||tab[b].pf-tab[a].pf||(a<b?-1:1));
    }
    out.push(...grp);
  }
  return out;
}
// ---- ranking nazionale (Elo) ----
const usBaseRating=n=>1500+(teamPow(n)-82)*18;   // forza attuale della rosa (la tua compresa)
function usRate(a,b,sa,sb){   // dopo ogni partita ufficiale: conta chi hai battuto e di quanto
  const P=SV.us.pr;if(P[a]===undefined||P[b]===undefined)return;
  const e=1/(1+Math.pow(10,(P[b]-P[a])/400)),w=sa>sb?1:0,k=22*(1+Math.min(10,Math.abs(sa-sb))/10);
  P[a]+=k*(w-e);P[b]-=k*(w-e);
}
const usRankList=()=>US_NAMES.slice().sort((a,b)=>SV.us.pr[b]-SV.us.pr[a]||(a<b?-1:1));
const usPos=n=>usRankList().indexOf(n)+1;
function usOfficial(a,b){const [sa,sb]=simPower(a,b);usRate(a,b,sa,sb);return [a,b,sa,sb,sa>sb?a:b];}
// ---- inizio carriera e inizio stagione ----
function usInit(club){
  const conf={};for(const c of US_CK)conf[c]=US_BYCONF[c].slice();
  const pr={};for(const n of US_NAMES)pr[n]=1500+(US_TEAM[n].power-82)*18;
  SV.us={cf:US_TEAM[club].conf,conf,ph:'reg',pr,pr0:Object.assign({},pr),fin:null,pin:null,q:null,nat:null,stage:0};
  SV.mem={U:conf[SV.us.cf].slice()};
}
function usLeagueBegin(){   // chiamata da leagueBegin() a ogni inizio stagione
  const U=SV.us;SV.lg={};
  for(const c of US_CK)if(c!==U.cf){const n=U.conf[c];SV.lg[c]={sched:roundRobin(n.length),round:0,tab:usFreshTab(n),last:[],streak:{}};}
  if(SV.season>1)for(const n of US_NAMES)U.pr[n]=0.5*U.pr[n]+0.5*usBaseRating(n);   // d'estate il ranking si riavvicina alla forza delle rose
  U.ph='reg';U.pin=null;U.q=null;U.nat=null;U.fin=null;U.stage=0;U.pr0=Object.assign({},U.pr);
}
function usLeagueAdvance(){   // le altre Conference giocano la loro giornata quando giochi la tua
  if(!SV.lg||!SV.sched)return;
  const R=SV.sched.length;
  for(const c in SV.lg){
    const L=SV.lg[c],n=SV.us.conf[c],upto=SV.done||SV.round>=R?L.sched.length:Math.min(L.sched.length,Math.floor(SV.round*L.sched.length/R));
    while(L.round<upto){
      const last=[];
      for(const [i,j] of L.sched[L.round]){
        const a=n[i],b=n[j],[sa,sb]=simPower(a,b);usAddRes(L.tab,a,b,sa,sb);usRate(a,b,sa,sb);last.push([a,b,sa,sb]);
        const w=sa>sb?a:b,l=sa>sb?b:a;L.streak[w]=(L.streak[w]|0)+1;L.streak[l]=0;
        if(teamPow(l)-teamPow(w)>=9&&Math.random()<0.5)story(`Sorpresa in ${usConfName(c)}: ${w} batte ${l} ${Math.max(sa,sb)}–${Math.min(sa,sb)}.`,Math.random()<0.3);
      }
      L.last=last;L.round++;
    }
  }
}
const usTab=c=>c===SV.us.cf?SV.tab:(SV.lg&&SV.lg[c]?SV.lg[c].tab:null);
const usConfOrder=c=>{const t=usTab(c);return t?usRanking(t,SV.us.conf[c]):SV.us.conf[c].slice();};
function usHalf(){   // giro di boa: la fotografia delle quattro Conference
  for(const c of US_CK){const t=usTab(c);if(!t)continue;const o=usRanking(t,SV.us.conf[c]);story(`Giro di boa in ${usConfName(c)}: capolista ${o[0]} (${t[o[0]].w}–${t[o[0]].l}), ultima ${o[o.length-1]}.`,false);}
}
// ---- stagione regolare: una tua partita (giocata o simulata) ----
function usRecord(win,su,so){
  const U=SV.us;
  if(U.ph==='reg')return usRegRecord(win,su,so);
  if(U.ph==='pin')return usPinRecord(win,su,so);
  return usNatRecord(win,su,so);
}
function usRegRecord(win,su,so){
  const names=SV.mem.U,ui=names.indexOf(SV.team);let opp0='';
  for(const [i,j] of SV.sched[SV.round]){
    const a=names[i],b=names[j];
    if(i===ui){usAddRes(SV.tab,a,b,su,so);usRate(a,b,su,so);SV.res.push({opp:b,su,so});opp0=b;if(lsLive())lsMatch(b,so);}
    else if(j===ui){usAddRes(SV.tab,a,b,so,su);usRate(a,b,so,su);SV.res.push({opp:a,su,so});opp0=a;if(lsLive())lsMatch(a,so);}
    else{const [sa,sb]=simPower(a,b);usAddRes(SV.tab,a,b,sa,sb);usRate(a,b,sa,sb);if(lsLive()){lsMatch(a,sa);lsMatch(b,sb);}}
  }
  SV.round++;
  leagueAdvance();
  fansBump(win,SV.riv&&opp0===SV.riv?(win?1.5:-1):0);
  const dby=derbyAfter(opp0,win);
  if(SV.round===Math.floor(SV.sched.length/2)){retireCheck('mid');leagueRetAnnounce();usHalf();}
  if(SV.round>=SV.sched.length)return usRegEnd(dby);
  return `Giornata ${SV.round} di ${SV.sched.length} conclusa: ${myRank()}° nella ${usConfName(SV.us.cf)}. Prossima: ${nextMatch().name}.`+dby;
}
// fine della stagione regolare: classifiche, Play-in (o direttamente Nationals / fine stagione)
function usRegEnd(dby){
  const U=SV.us;leagueAdvance();
  U.fin={};for(const c of US_CK)U.fin[c]=usConfOrder(c);
  for(const c of US_CK){const o=U.fin[c];if(c!==U.cf)story(`${o[0]} chiude al primo posto la ${usConfName(c)}: diretta ai Nationals con ${o[1]}.`,false);}
  const mine=U.fin[U.cf],r=mine.indexOf(SV.team)+1;
  U.ph='pin';U.pin={};
  for(const c of US_CK){const o=U.fin[c];U.pin[c]={m:[[o[2],o[5]],[o[3],o[4]]],r:[null,null]};}   // 3ª contro 6ª, 4ª contro 5ª
  if(r>=3&&r<=6){
    const mi=(r===3||r===6)?0:1,pair=U.pin[U.cf].m[mi];
    SV.po={on:true,kind:'pin',round:0,mi,opp:pair[0]===SV.team?pair[1]:pair[0],last:null};U.stage=Math.max(U.stage,1);
    news(`Stagione regolare conclusa al ${r}° posto: Play-in contro ${SV.po.opp}.`);
    return `Stagione regolare conclusa: ${r}° nella ${usConfName(U.cf)}. Play-in: ${SV.po.opp} (gara secca, chi vince va ai Nationals).`+dby;
  }
  for(const c of US_CK)for(const mi of [0,1])usPinPlay(c,mi,null);
  if(r<=2){
    usNatBegin();
    const t=usNatNext();
    return `Stagione regolare conclusa: ${r}° posto, qualificati direttamente ai Nationals! ${t}`+dby;
  }
  return usEliminated(`Stagione regolare conclusa: ${r}° posto, fuori dai Play-in.`+dby);
}
// ---- Play-in ----
function usPinPlay(c,mi,rec){const P=SV.us.pin[c],m=P.m[mi];if(!P.r[mi])P.r[mi]=rec?(rec[0]===m[0]?rec:[m[0],m[1],rec[3],rec[2],rec[4]]):usOfficial(m[0],m[1]);}
function usPinRecord(win,su,so){
  const U=SV.us,po=SV.po,opp=po.opp,rec=[SV.team,opp,su,so,win?SV.team:opp];
  usRate(SV.team,opp,su,so);po.on=false;po.last={opp,su,so,win};
  usPinPlay(U.cf,po.mi,rec);
  for(const c of US_CK)for(const mi of [0,1])usPinPlay(c,mi,null);   // tutte le altre gare secche
  if(!win)return usEliminated(`Play-in perso contro ${opp}: la stagione finisce qui.`);
  usNatBegin();
  return `Play-in vinto contro ${opp}: siete ai Nationals! ${usNatNext()}`;
}
// ---- Nationals ----
function usPerms(n){if(n===1)return [[0]];const out=[];for(const p of usPerms(n-1))for(let i=0;i<=p.length;i++)out.push(p.slice(0,i).concat(n-1,p.slice(i)));return out;}
const US_PERMS4=usPerms(4);
function usNatBegin(){
  const U=SV.us,q=[];
  for(const c of US_CK){const o=U.fin[c],P=U.pin[c];q.push(o[0],o[1],P.r[0][4],P.r[1][4]);}
  U.q=q;U.ph='nat';
  const seed=q.slice().sort((x,y)=>U.pr[y]-U.pr[x]||(x<y?-1:1));
  // quattro fasce del ranking nazionale (1-4, 5-8, 9-12, 13-16): ogni girone ne prende una per fascia (le prime 4 sono le teste di serie).
  // Tra tutti i sorteggi possibili si sceglie quello con meno club della stessa Conference nello stesso girone e, a parita', i gironi piu' bilanciati
  let pools=null,bs=Infinity;
  for(const a of US_PERMS4)for(const b of US_PERMS4)for(const c of US_PERMS4){
    const pl=[0,1,2,3].map(i=>[seed[i]]);
    [[1,a],[2,b],[3,c]].forEach(([f,pm])=>seed.slice(f*4,f*4+4).forEach((t,i)=>pl[pm[i]].push(t)));
    let conf=0;for(const p of pl){const cs=p.map(usConfOf);conf+=cs.length-new Set(cs).size;}
    const sums=pl.map(p=>p.reduce((x,t)=>x+U.pr[t],0)),m=(sums[0]+sums[1]+sums[2]+sums[3])/4,v=sums.reduce((x,y)=>x+(y-m)*(y-m),0),sc=conf*1e9+v;
    if(sc<bs){bs=sc;pools=pl;}
  }
  const sched=roundRobin(4);
  SV.us.nat={seed,pools,tabs:pools.map(pl=>usFreshTab(pl)),sched,pg:pools.map(()=>[]),rd:0,ord:null,ko:[],champ:null,out:!q.includes(SV.team)};
  if(q.includes(SV.team))news(`Nationals: il sorteggio vi mette nel girone ${US_POOL[pools.findIndex(pl=>pl.includes(SV.team))]}.`);
}
const usNatPool=t=>SV.us.nat.pools.findIndex(pl=>pl.includes(t));
function usNatUser(){   // la tua partita nel turno in corso: {opp} oppure null
  const N=SV.us.nat,me=SV.team,rd=N.rd;if(rd>6||N.out)return null;
  if(rd<3){const p=usNatPool(me);if(p<0)return null;const pl=N.pools[p];for(const [i,j] of N.sched[rd])if(pl[i]===me||pl[j]===me)return {opp:pl[i]===me?pl[j]:pl[i]};return null;}
  const L=N.ko[rd-3];if(!L)return null;
  const m=L.find(x=>x[0]===me||x[1]===me);return m?{opp:m[0]===me?m[1]:m[0]}:null;
}
// gioca il turno in corso: la tua partita (rec, gia' giocata e gia' contata nel ranking) e tutte le altre, simulate
function usNatPlayRound(rec){
  const N=SV.us.nat,rd=N.rd,play=(a,b)=>rec&&((rec[0]===a&&rec[1]===b)||(rec[0]===b&&rec[1]===a))?(rec[0]===a?rec:[a,b,rec[3],rec[2],rec[4]]):usOfficial(a,b);   // l'ordine delle squadre resta quello del tabellone
  if(rd<3){
    N.pools.forEach((pl,p)=>{N.pg[p][rd]=N.sched[rd].map(([i,j])=>{const m=play(pl[i],pl[j]);usAddRes(N.tabs[p],m[0],m[1],m[2],m[3]);return m;});});
    if(rd===2){   // gironi finiti: prime ai quarti, seconde e terze ai prequarti (2ª contro 3ª di un altro girone), quarte fuori
      N.ord=N.pools.map((pl,p)=>usRanking(N.tabs[p],pl));
      N.ko=[[0,1,2,3].map(p=>[N.ord[p][1],N.ord[(p+1)%4][2],null,null,null])];
    }
  }else{
    const L=N.ko[rd-3];for(let k=0;k<L.length;k++)L[k]=play(L[k][0],L[k][1]);
    if(rd===3)usNatQuarters();
    else if(rd===4)N.ko[2]=[[N.ko[1][0][4],N.ko[1][1][4],null,null,null],[N.ko[1][2][4],N.ko[1][3][4],null,null,null]];
    else if(rd===5)N.ko[3]=[[N.ko[2][0][4],N.ko[2][1][4],null,null,null]];
    else N.champ=N.ko[3][0][4];
  }
  N.rd++;
}
// quarti: le 4 prime dei gironi (teste di serie per punti e differenza mete) contro le vincitrici dei prequarti. Nessuna rivincita di girone;
// due vincitrici dei prequarti dello stesso girone finiscono in meta' tabellone diverse (non si incontrano prima della finale)
function usNatQuarters(){
  const N=SV.us.nat,pr=SV.us.pr,heads=N.ord.map((o,p)=>({t:o[0],p,s:N.tabs[p][o[0]]})).sort((a,b)=>b.s.pts-a.s.pts||(b.s.pf-b.s.pa)-(a.s.pf-a.s.pa)||pr[b.t]-pr[a.t]).map(x=>x.t);
  const w=N.ko[0].map(m=>m[4]);let best=null,bs=Infinity;
  for(const pm of US_PERMS4){   // pm[i] = quale vincitrice dei prequarti incontra la testa di serie i; slot del tabellone: 1ª, 4ª, 3ª, 2ª
    const slot=[0,3,2,1];let c=0;
    heads.forEach((h,i)=>{if(usNatPool(h)===usNatPool(w[pm[i]]))c+=1e6;c+=pr[h]*pr[w[pm[i]]]/1e4;});
    for(let a=0;a<4;a++)for(let b=a+1;b<4;b++)if(usNatPool(w[pm[a]])===usNatPool(w[pm[b]])&&((slot[a]<2)===(slot[b]<2)))c+=1e3;
    if(c<bs){bs=c;best=pm;}
  }
  const q=[];[0,3,2,1].forEach((s,k)=>{const i=s;q[k]=[heads[i],w[best[i]],null,null,null];});   // slot 0: testa 1 · slot 1: testa 4 · slot 2: testa 3 · slot 3: testa 2
  N.ko[1]=q;
}
// prepara la tua prossima partita dei Nationals, simulando i turni in cui non giochi; ritorna il messaggio. Se non hai altre partite, chiude Nationals e stagione
function usNatNext(){
  const N=SV.us.nat;
  while(N.rd<=6){
    const u=usNatUser();
    if(u){
      SV.po={on:true,kind:'nat',round:N.rd,opp:u.opp,last:SV.po&&SV.po.last||null};SV.us.stage=Math.max(SV.us.stage,Math.max(2,N.rd));
      return `${usLabel()}: ${u.opp}.`;
    }
    usNatPlayRound(null);
  }
  return usSeasonClose();
}
function usSeasonClose(){   // Nationals conclusi (o tu non ci sei piu'): si chiude la stagione
  const N=SV.us.nat;SV.po=null;SV.us.ph='done';
  if(N.champ===SV.team)SV.us.stage=7;
  endSeason();
  return SV.next.short;
}
function usEliminated(txt){   // fuori dai Nationals prima di cominciare: il torneo si gioca lo stesso, tra le altre
  const U=SV.us;U.ph='nat';SV.po=null;
  if(!U.nat)usNatBegin();
  U.nat.out=true;
  while(U.nat.rd<=6)usNatPlayRound(null);
  return txt+' '+usSeasonClose();
}
function usNatRecord(win,su,so){
  const U=SV.us,N=U.nat,po=SV.po,opp=po.opp,rd=N.rd,rec=[SV.team,opp,su,so,win?SV.team:opp],lab=usLabel();
  usRate(SV.team,opp,su,so);po.on=false;po.last={opp,su,so,win,label:lab};
  usNatPlayRound(rec);
  let pre=`${lab}: ${win?'vittoria':'sconfitta'} contro ${opp} (${su}–${so}).`;
  if(rd===2){   // ultimo turno dei gironi: dove si finisce
    const p=usNatPool(SV.team),pos=N.ord[p].indexOf(SV.team)+1;
    if(pos===1)pre+=` Primi nel girone ${US_POOL[p]}: direttamente ai quarti.`;
    else if(pos<=3){const m=N.ko[0].find(x=>x[0]===SV.team||x[1]===SV.team);pre+=` ${pos}° nel girone ${US_POOL[p]}: prequarti contro ${m[0]===SV.team?m[1]:m[0]}.`;}
    else{pre+=` Ultimi nel girone ${US_POOL[p]}: fuori dalla corsa al titolo.`;N.out=true;}
  }else if(rd>=3&&!win){N.out=true;pre+=' Eliminati dai Nationals.';}
  return pre+' '+usNatNext();
}
// ---- etichette e testi ----
function usLabel(){
  const U=SV.us;if(!U||!SV.po)return '';
  if(SV.po.kind==='pin')return 'Play-in';
  const rd=U.nat?U.nat.rd:0;
  if(rd<3){const p=usNatPool(SV.team);return `Nationals · Girone ${US_POOL[p]} · partita ${rd+1} di 3`;}
  return `Nationals · ${['Prequarti','Quarti di finale','Semifinale','Finale'][rd-3]}`;
}

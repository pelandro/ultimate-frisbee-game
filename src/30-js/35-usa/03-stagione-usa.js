/* ===================== USA MEN'S CLUB: LA STAGIONE =====================
   Regole del campionato USA, separate da quelle italiane. Le funzioni italiane (beginSeason, recordResult, endSeason, nextMatch...) chiamano questo modulo solo
   quando SV.lk==='US'; tutto il resto del gioco (partita, rosa, mercato, allenamenti, economia) e' lo stesso.
   1) STAGIONE REGOLARE: 5 giornate nella propria Conference (6 club, sola andata). Classifica: vittorie, scontri diretti, differenza mete.
   2) PLAY-IN: la 1ª di ogni Conference va ai Nationals; la 2ª e la 3ª si sfidano in gara secca e la vincitrice va ai Nationals; dalla 4ª alla 6ª sono fuori.
   3) NATIONALS: 16 club in 4 gironi da 4 (fasce del ranking nazionale, club della stessa Conference in gironi diversi quando si puo'). Le prime vanno ai quarti,
      le seconde e le terze ai prequarti (2ª contro 3ª di un altro girone), le quarte sono fuori. Poi quarti, semifinali e finale.
   4) RANKING NAZIONALE (SV.us.pr): punteggio Elo aggiornato dopo ogni partita ufficiale, contro la forza dell'avversario e col margine di mete.
   5) PARTITE INTERREGIONALI: le Conference giocano solo al loro interno e un Elo aggiornato solo li' conserva la somma dei punti di ogni Conference, quindi i posti per
      regione non reagirebbero mai ai risultati. Perche' il ranking sia vivo, a ogni giornata ogni club gioca anche una partita fuori Conference (come i tornei interregionali
      veri): conta solo per il ranking (non per classifica, statistiche e giocatori) e quelle del tuo club si simulano da sole. Dopo ogni giornata i posti ai Nationals di ogni regione
      si ricalcolano dal ranking (usBids): sono definitivi alla fine della stagione regolare, ma si muovono giornata dopo giornata (SV.us.bq = prima di questa giornata).
   Stato: SV.us={cf, conf, ph, pr, pr0, fin, pin, bids, q, nat, stage, xn, xl, bq, pl}. SV.sr==='U', SV.mem.U = i club della tua Conference, SV.lg = le altre tre Conference.
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
  const e=1/(1+Math.pow(10,(P[b]-P[a])/400)),w=sa>sb?1:0,k=(SV.us.ph==='reg'?32:22)*(1+Math.min(10,Math.abs(sa-sb))/10);
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
  U.ph='reg';U.pin=null;U.q=null;U.nat=null;U.fin=null;U.bids=null;U.stage=0;U.pr0=Object.assign({},U.pr);
  U.xn=0;U.xl=[];U.bq=usBids();U.pl=usPosMap();   // interregionali giocate, quelle del tuo club, posti e posizioni prima della giornata
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
  usCrossAdvance(SV.done||SV.round>=R?R:SV.round);
}
// ---- partite interregionali (punto 5): una a giornata per ogni club, contro un club di un'altra Conference di livello vicino ----
const usPosMap=()=>{const m={};usRankList().forEach((n,i)=>{m[n]=i+1;});return m;};
function usCrossRound(r){
  const U=SV.us,free=US_NAMES.map(n=>[n,U.pr[n]+(Math.random()-0.5)*160]).sort((a,b)=>b[1]-a[1]).map(x=>x[0]);   // accoppiati per ranking, con un po' di caso (non sono tornei a teste di serie)
  while(free.length>1){
    const a=free.shift(),k=free.findIndex(x=>usConfOf(x)!==usConfOf(a));if(k<0)continue;   // senza avversarie di altre Conference (fine dell'elenco) resta a riposo
    const b=free.splice(k,1)[0],[sa,sb]=simPower(a,b);usRate(a,b,sa,sb);
    if(a===SV.team||b===SV.team){if(!U.xl)U.xl=[];U.xl.push({r:r+1,opp:a===SV.team?b:a,su:a===SV.team?sa:sb,so:a===SV.team?sb:sa});}
  }
}
function usCrossAdvance(upto){   // gioca le giornate interregionali che mancano fino a quella indicata (i salvataggi senza il campo ripartono da zero)
  const U=SV.us;if(!U||U.ph!=='reg')return;
  while((U.xn|0)<upto){usCrossRound(U.xn|0);U.xn=(U.xn|0)+1;}
}
// dopo una giornata: i posti ai Nationals delle regioni che cambiano (notizie del campionato) e il testo per la tua Conference
function usBidsReport(){
  const U=SV.us,nb=usBids(),bq=U.bq||nb,out=[];
  for(const c of US_CK)if(nb[c]!==bq[c])story(`Ranking: ${usConfName(c)} passa da ${bq[c]} a ${nb[c]} ${nb[c]===1?'posto':'posti'} ai Nationals.`,c===U.cf);
  const x=(U.xl||[]).slice(-1)[0];
  if(x&&x.r===SV.round)out.push(`Interregionale: ${x.su>x.so?'battuta':'sconfitta da'} ${x.opp} ${Math.max(x.su,x.so)}–${Math.min(x.su,x.so)}.`);
  const pl=U.pl||{},p=usPos(SV.team),d=pl[SV.team]?pl[SV.team]-p:0;
  out.push(`Ranking nazionale: ${p}°${d?` (${d>0?'▲':'▼'}${Math.abs(d)})`:''}.`);
  if(nb[U.cf]!==bq[U.cf])out.push(`${usConfName(U.cf)}: da ${bq[U.cf]} a ${nb[U.cf]} ${nb[U.cf]===1?'posto':'posti'} ai Nationals.`);
  return out.join(' ');
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
  SV.us.bq=usBids();SV.us.pl=usPosMap();   // posti e posizioni prima di questa giornata: servono per mostrare cosa cambia
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
  if(SV.round>=SV.sched.length)return usRegEnd(dby+' '+usBidsReport());
  return `Giornata ${SV.round} di ${SV.sched.length} conclusa: ${myRank()}° nella ${usConfName(SV.us.cf)}. ${usBidsReport()} Prossima: ${nextMatch().name}.`+dby;
}
// ---- posti ai Nationals (bid allocation di USA Ultimate) ----
// 16 posti: ogni regione (Conference) ne ha 1 automatico, gli altri 8 sono posti di forza assegnati dal ranking nazionale. Si scorre il ranking: la prima squadra di una regione
// e' il suo posto automatico, ogni altra squadra di quella regione che si incontra scendendo guadagna alla regione un posto di forza, finche' i posti di forza sono 8 (al massimo
// 4 per regione). I posti vanno alla regione, non alla squadra: se ne contendono le squadre della Conference (ritorna una mappa Conference -> numero di posti).
function usBids(){
  const b={};for(const c of US_CK)b[c]=1;
  const seen={};let extra=8;
  for(const t of usRankList()){const c=usConfOf(t);if(!seen[c]){seen[c]=1;continue;}if(b[c]>=4)continue;b[c]++;if(--extra<=0)break;}
  return b;
}
// come si assegnano i posti di una Conference: 1 posto = la 1ª va diretta; 2 = la 1ª diretta e la 2ª contro la 3ª; 3 = 1ª diretta, poi 2ª contro 5ª e 3ª contro 4ª;
// 4 = 1ª e 2ª dirette, poi 3ª contro 6ª e 4ª contro 5ª (gare secche, chi vince va ai Nationals). d = dirette, k = gare del Play-in
const usBidSplit=b=>{const d=b>=4?2:1;return {d,k:b-d};};
const usBidsNow=()=>SV.us.bids||usBids();   // dopo la stagione regolare quelli definitivi, prima quelli del ranking di adesso (si ricalcolano a ogni giornata)
function usPinPairs(o,s){const m=[];for(let i=0;i<s.k;i++)m.push([o[s.d+i],o[s.d+2*s.k-1-i]]);return m;}
// fine della stagione regolare: classifiche, posti per regione, Play-in (o direttamente Nationals / fine stagione)
function usRegEnd(dby){
  const U=SV.us;leagueAdvance();
  U.fin={};for(const c of US_CK)U.fin[c]=usConfOrder(c);
  U.bids=usBids();
  U.ph='pin';U.pin={};
  for(const c of US_CK){
    const o=U.fin[c],s=usBidSplit(U.bids[c]);
    U.pin[c]={d:s.d,m:usPinPairs(o,s),r:Array(s.k).fill(null)};
    if(c!==U.cf)for(let i=0;i<s.d;i++)story(`${o[i]} chiude ${i+1}ª la ${usConfName(c)}: diretta ai Nationals.`,false);
  }
  const mine=U.fin[U.cf],r=mine.indexOf(SV.team)+1,P=U.pin[U.cf],b=U.bids[U.cf],bt=`${usConfName(U.cf)}: ${b} ${b===1?'posto':'posti'} ai Nationals.`;
  const mi=P.m.findIndex(m=>m.includes(SV.team));
  if(mi>=0){
    const pair=P.m[mi];
    SV.po={on:true,kind:'pin',round:0,mi,opp:pair[0]===SV.team?pair[1]:pair[0],last:null};U.stage=Math.max(U.stage,1);
    news(`Stagione regolare conclusa al ${r}° posto: Play-in contro ${SV.po.opp}. ${bt}`);
    return `Stagione regolare conclusa: ${r}° nella ${usConfName(U.cf)}. ${bt} Play-in: ${SV.po.opp} (gara secca, chi vince va ai Nationals).`+dby;
  }
  for(const c of US_CK)usPinPlayAll(c);
  if(r<=P.d){
    usNatBegin();
    const t=usNatNext();
    return `Stagione regolare conclusa: ${r}° posto, qualificati direttamente ai Nationals! ${t}`+dby;
  }
  return usEliminated(`Stagione regolare conclusa: ${r}° posto, fuori dai Play-in. ${bt}`+dby);
}
// ---- Play-in ----
function usPinPlay(c,mi,rec){const P=SV.us.pin[c],m=P.m[mi];if(!P.r[mi])P.r[mi]=rec?(rec[0]===m[0]?rec:[m[0],m[1],rec[3],rec[2],rec[4]]):usOfficial(m[0],m[1]);}
function usPinPlayAll(c){const P=SV.us.pin[c];for(let i=0;i<P.m.length;i++)usPinPlay(c,i,null);}
function usPinRecord(win,su,so){
  const U=SV.us,po=SV.po,opp=po.opp,rec=[SV.team,opp,su,so,win?SV.team:opp];
  usRate(SV.team,opp,su,so);po.on=false;po.last={opp,su,so,win};
  usPinPlay(U.cf,po.mi,rec);
  for(const c of US_CK)usPinPlayAll(c);   // tutte le altre gare secche
  if(!win)return usEliminated(`Play-in perso contro ${opp}: la stagione finisce qui.`);
  usNatBegin();
  return `Play-in vinto contro ${opp}: siete ai Nationals! ${usNatNext()}`;
}
// ---- Nationals ----
const usCtx=()=>({rate:t=>SV.us.pr[t],grp:usConfOf,play:usOfficial});
function usNatBegin(){
  const U=SV.us,q=[];
  for(const c of US_CK){const o=U.fin[c],P=U.pin[c];q.push(...o.slice(0,P.d||1),...P.r.map(r=>r[4]));}
  U.q=q;U.ph='nat';
  U.nat=t16Begin(usCtx(),q,SV.team);
  if(q.includes(SV.team))news(`Nationals: il sorteggio vi mette nel girone ${US_POOL[usNatPool(SV.team)]}.`);
}
const usNatPool=t=>t16Pool(SV.us.nat,t);
const usNatUser=()=>t16User(SV.us.nat,SV.team);
const usNatPlayRound=rec=>t16Round(usCtx(),SV.us.nat,rec);
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

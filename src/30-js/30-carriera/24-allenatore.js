/* ---- IL TUO ALLENATORE E LA PARTENZA DA SUBENTRATO ----
   SV.coach={n,s,lk}: nome, cognome e volto (uno dei COACH_FACES) scelti a inizio carriera; si possono cambiare dal cruscotto.
   SV.start: 'cuore' (la squadra la scegli tu) oppure 'sub' (subentri a una squadra in crisi, a una giornata dalla fine del campionato).
   Nella partenza da subentrato le prime giornate sono gia' state giocate (reliefStart) e SV.w0 sono le vittorie che la squadra aveva
   prima del tuo arrivo: non contano come tue nei traguardi. Il resto della carriera e' identico alla partenza normale. */
const COACH_FACES=[[1,2,0],[0,3,1],[2,9,2],[3,0,3],[4,1,4],[5,13,0],[6,13,1],[1,6,3],[0,7,4],[2,12,2],[3,4,1],[5,10,3]]
  .map(([s,h,st])=>({hair:HAIR_COLORS[h],skin:SKIN_TONES[s],style:st,hs:1,bw:1,hd:1}));
const COACH_N=14,COACH_S=16;   // lunghezze massime di nome e cognome
const coachClean=(t,max)=>String(t==null?'':t).replace(/[^\p{L}' .-]/gu,'').replace(/\s+/g,' ').trim().slice(0,max);
function coachRandom(rnd){   // «Personaggio casuale»
  rnd=rnd||Math.random;
  return {n:NAME_POOL[Math.floor(rnd()*NAME_POOL.length)],s:SURN[Math.floor(rnd()*SURN.length)],lk:Object.assign({},COACH_FACES[Math.floor(rnd()*COACH_FACES.length)])};
}
function coachNorm(c,rnd){   // nome e cognome ripuliti; quello che manca o non e' valido viene scelto a caso
  const r=coachRandom(rnd);if(!c)return r;
  const n=coachClean(c.n,COACH_N),s=coachClean(c.s,COACH_S);
  return {n:n||r.n,s:s||r.s,lk:c.lk&&c.lk.hair&&c.lk.skin?Object.assign({},DEF_LOOK,c.lk):r.lk};
}
const coachName=()=>SV&&SV.coach?SV.coach.n+' '+SV.coach.s:'';
const coachTitle=()=>SV&&SV.coach?'Coach '+SV.coach.s:'';
const coachFace=lk=>COACH_FACES.findIndex(f=>lk&&f.hair===lk.hair&&f.skin===lk.skin&&f.style===lk.style);
// per i salvataggi di prima: un allenatore sempre uguale per la stessa carriera (lo si puo' cambiare quando si vuole)
function coachInit(){
  if(!SV.coach)SV.coach=coachNorm(null,mulberry32(hashStr('coach|'+SV.team+'|'+(SV.seed|0))));
  if(!SV.start)SV.start='cuore';
}
/* ---- subentro a una squadra in crisi ---- */
// una delle cinque squadre piu' deboli della serie (diversa da quella gia' proposta)
function reliefOffer(sr,not){
  const c=SERIES[sr].slice().sort((a,b)=>TEAM[a].power-TEAM[b].power).slice(0,5).filter(n=>n!==not);
  return c[Math.floor(Math.random()*c.length)];
}
// gioca «a vuoto» tutte le giornate tranne l'ultima, finche' la squadra non e' davvero in zona crisi (le ultime tre); poi imposta l'obiettivo salvezza
function reliefStart(){
  const names=SV.mem[SV.sr],n=names.length,R=SV.sched.length,ui=names.indexOf(SV.team);
  let rk=n;const len=carLen();
  for(let t=0;t<30;t++){
    SV.tab=freshTab(names);SV.res=[];
    const pl=Math.min(0.9,t/20);   // se la squadra non vuole proprio sprofondare, dai tentativi successivi perde qualche partita in piu'
    for(let r=0;r<R-1;r++)for(const [i,j] of SV.sched[r]){
      const a=names[i],b=names[j];let [sa,sb]=simPower(a,b);
      if((i===ui||j===ui)&&Math.random()<pl){const lo=Math.floor(Math.random()*(len-3)),lose=i===ui?[lo,len]:[len,lo];sa=lose[0];sb=lose[1];}
      addRes(SV.tab,a,b,sa,sb);
      if(i===ui)SV.res.push({opp:b,su:sa,so:sb});else if(j===ui)SV.res.push({opp:a,su:sb,so:sa});
    }
    rk=ranking(SV.tab,names).indexOf(SV.team)+1;
    if(rk>n-3)break;   // penultima, terzultima o ultima: abbastanza in crisi
  }
  SV.round=R-1;SV.w0=SV.tab[SV.team].w;
  leagueAdvance();   // le altre serie arrivano alla stessa altezza della stagione
  SV.mor=45;SV.chem=40;   // spogliatoio scosso
  SV.obj={tgt:n-PROMO,txt:'Salvezza: non finire tra le ultime '+PROMO,exp:rk,reward:Math.round((36+PROMO*4)*SR_K[SV.sr])};
  const pts=SV.tab[SV.team].pts,safe=ranking(SV.tab,names)[n-PROMO-1],gap=SV.tab[safe].pts-pts;
  news(`${SV.team} ha nominato ${coachName()} nuovo allenatore: ${rk}ª su ${n} a una giornata dalla fine${gap>0?`, ${gap} ${gap>1?'punti':'punto'} dalla salvezza`:', appena sopra la zona retrocessione'}.`);
  alertAdd('club',`${SV.team} ha nominato ${coachName()} nuovo allenatore. Siete ${rk}ª su ${n} a una giornata dalla fine: serve la salvezza.`);
}

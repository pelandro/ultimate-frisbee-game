/* Eseguito DENTRO la pagina del gioco (tools/test-bilanci.js): un «buon allenatore» che parte dall'ultima della Serie C a difficolta' facile.
   Compra (il migliore che si puo' permettere tra chi migliora i primi 9, o un giovane di grande potenziale), usa il programma di allenamento, le linee
   consigliate e simula le partite; «giocare bene» e' un vantaggio di P.skill punti di forza nelle SUE partite (non in quelle delle altre squadre) e un po'
   piu' di esperienza (P.xp). P = {seed, seasons, skill, xp, lk}: con lk ('US', 'BE', 'FR', 'DE', 'UK') parte dal club piu' debole della serie piu'
   bassa (tra quelle da cui si puo' partire) di quel campionato invece che dall'ultima della Serie C. Restituisce stagione per stagione serie, posizione, titolo, forza e migliore rivale. */
(P=>{const R0=Math.random,SM=simMatch,SP=simParts;let mine=false,W=0,N=0;
simMatch=function(a,b,ai,len){const k=mine?P.skill:0,u=mine;mine=false;const r=SM(a+k,b,ai,len);if(u){W+=r.a>r.b?1:0;N++;}return r;};   // solo la prima chiamata: la tua partita
simParts=function(x,sh){const o=SP(x,sh);if(P.xpOn)for(const k in o)o[k]*=P.xp;return o;};
const hide=()=>{for(const id of ['simres','alerts','evt','fired'])$(id)&&$(id).classList.add('hidden');};
const evt=()=>{let k=0;while(SV.evt&&k++<3){try{evtAnswer(SV.evt.id==='spons'?1:0);}catch(e){SV.evt=null;}}};
const r9=()=>SQ.map(p=>ovr(p)).sort((a,b)=>b-a)[8]||0;
function shop(){
  for(let k=0;k<4;k++){
    const L=(SV.market||[]).map((m,i)=>({m,i})).filter(x=>!canSign(x.m)&&SV.cash-x.m.price>60);if(!L.length)break;
    const lv=squadLevel(),val=m=>Math.max(ovr(m.o)-r9(),m.o.age<=20?(potX(m.o)-lv-8)*0.6:-99);
    const x=L.sort((a,b)=>val(b.m)-val(a.m))[0];if(val(x.m)<=0)break;
    if(SQ.length>=22){const w=SQ.slice().sort((a,b)=>(ovr(a)+(a.age<=21?(potX(a)-ovr(a))*0.5:0))-(ovr(b)+(b.age<=21?(potX(b)-ovr(b))*0.5:0)))[0];if(!sellPlayer(w.id))break;}
    signPlayer(x.i);hide();evt();
  }
}
function invest(){
  for(const k of ['camp','viv','stad'])if(SV.cash>facCost(k)+120&&facLv(k)<FAC_MAX){buyFac(k);break;}
  for(const k of ['coach','men','fit','ana']){if(staffLv(k)<1||!stPerson(k)){const cs=staffCands(k);let b=-1;for(let i=0;i<cs.length;i++)if(SV.cash>STAFF_HIRE[cs[i].lv]+150)b=i;if(b>=0){staffHire(k,b);break;}}else if(SV.cash>staffCost(k)+150&&buyStaff(k))break;}
}
const play=()=>{autoTrain();autoLines();fixLines();mine=true;P.xpOn=true;simCareerMatch();mine=false;P.xpOn=false;hide();evt();};
const C=SERIES.C.slice().sort((a,b)=>TEAM[a].power-TEAM[b].power);
const weakest=lk=>{if(lk==='US')return US_NAMES.slice().sort((a,b)=>US_TEAM[a].power-US_TEAM[b].power)[0];
  const ts=LN_DEF[lk].tiers;for(let i=ts.length-1;i>=0;i--){const L=LN_NAMES.filter(n=>LN_BY[n].lk===lk&&LN_BY[n].t===ts[i].id&&lnPlayable(n));if(L.length)return L.sort((a,b)=>LN_BY[a].p-LN_BY[b].p)[0];}};   // la serie piu' bassa da cui si puo' partire
const topTier=()=>isUS()||(isLN()?SV.ln.tier===LN_DEF[SV.lk].tiers[0].id:SV.sr==='A');
Math.random=mulberry32(P.seed);QM.on=true;startCareer(P.lk?weakest(P.lk):C[0],{});SV.diff='easy';progOf().on=true;hide();evt();
const rows=[];
for(let s=0;s<P.seasons;s++){
  const sr=SV.sr;shop();
  if(SV.euUnlocked&&SV.eu&&SV.eu.state==='on'&&!isUS()){SV.event='eu';try{euEnsure();let k=0;while(SV.event==='eu'&&SV.eu.state==='on'&&k++<14){if(!nextMatch())break;play();}}catch(e){}SV.event='camp';}
  let g=0;while(!SV.done&&g<50){if(g%5===0){invest();shop();}play();g++;}
  // la migliore delle altre in tutta la serie (in USA tutta la lega, nelle leghe europee tutto il livello, non solo il tuo girone)
  const x=SV.next,rv=ecoPeers().filter(n=>n!==SV.team&&SV.rost[n]).map(teamPow).sort((a,b)=>b-a);
  rows.push({s:SV.season,sr,top:topTier(),rank:x.rank,tit:!!x.tit,me:+squadPower().toFixed(1),riv:+(rv[0]||0).toFixed(1)});
  newSeason();hide();evt();
}
simMatch=SM;simParts=SP;Math.random=R0;QM.on=false;
return {seed:P.seed,win:N?W/N:0,rows};})

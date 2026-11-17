/* Eseguito DENTRO la pagina del gioco (tools/test-bilanci.js): una carriera economica, stagione per stagione, senza spendere.
   P = {team, mode: 0 (niente) | 'max' (strutture e staff al massimo), trim: 0 | dimensione della rosa a cui si vende a inizio stagione, seasons, seed}.
   Restituisce per ogni stagione: cassa all'inizio (dopo le vendite) e alla fine, minimo, giornate in rosso, esonero, vendite, entrate e saldo delle partite. */
(P=>{const hide=()=>{for(const id of ['simres','alerts','evt','fired'])$(id)&&$(id).classList.add('hidden');};
const evt=()=>{let k=0;while(SV.evt&&k++<3){try{evtAnswer(SV.evt.id==='spons'?1:0);}catch(e){SV.evt=null;}}};
const pick=x=>x==='midA'?SERIES.A.slice().sort((a,b)=>TEAM[a].power-TEAM[b].power)[8]:x==='midB'?SERIES.B.slice().sort((a,b)=>TEAM[a].power-TEAM[b].power)[7]:x==='lowC'?SERIES.C.slice().sort((a,b)=>TEAM[a].power-TEAM[b].power)[0]:x;
const t=pick(P.team);Math.random=mulberry32(P.seed||5);QM.on=true;startCareer(t,{});SV.diff='easy';progOf().on=true;hide();
if(!SV.evt&&SV.sp&&SV.sp.off)SV.evt={id:'spons',a:{}};evt();
const maxAll=()=>{for(const k of Object.keys(FAC))SV.fac[k]=FAC_MAX;SV.staff=SV.staff||{};for(const k of Object.keys(STAFF))SV.staff[k]=STAFF_MAX;};
if(P.mode==='max')maxAll();
const ss=[];
for(let s=0;s<P.seasons;s++){
  let sold=0;if(P.trim)while(SQ.length>P.trim){const w=SQ.slice().sort((a,b)=>ovr(a)-ovr(b))[0];const c=SV.cash;if(!sellPlayer(w.id))break;sold+=SV.cash-c;}
  const c0=SV.cash;let g=0,rev=0,net=0,mn=SV.cash,red=0,fired=false;
  while(!SV.done&&g<40){if(P.mode==='max')maxAll();autoTrain();autoLines();fixLines();simCareerMatch();hide();evt();
    const m=SV.lastMoney;rev+=m.gate+m.spon+m.wb;net+=m.net;mn=Math.min(mn,SV.cash);if(SV.cash<0)red++;if(SV.fired)fired=true;g++;}
  ss.push({sr:SV.sr,rank:SV.next&&SV.next.rank,c0,c1:SV.cash,min:mn,red,fired,sold,rev:Math.round(rev),net:Math.round(net)});
  newSeason();hide();evt();
}
QM.on=false;return {team:t,mode:P.mode||0,trim:P.trim||0,roster:SQ.length,seasons:ss};})

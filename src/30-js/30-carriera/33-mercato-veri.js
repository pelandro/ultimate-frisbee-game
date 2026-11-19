/* ---- MERCATO CON GIOCATORI VERI ----
   Tutti i giocatori del mercato (buildMarket, 06-mercato-internazionali.js) vengono dalle rose che esistono:
   - dalle altre squadre del tuo campionato (SV.rost): chi compri lascia la sua squadra (signPlayer). Non si vendono i 3 migliori di un club;
   - SVINCOLATI veri (SV.fa): chi le squadre del computer lasciano andare d'estate (rosa troppo lunga in evolveLeague, chi avanza dopo un acquisto
     in aiMarket). Restano liberi due estati al massimo (faYear), poi smettono; li prendono anche le squadre del computer (aiMarket);
   - dall'ESTERO: giocatori veri dei club degli altri campionati (foreignRoster), oltre alle stelle di STARS. Chi arriva in questo campionato
     (da te o da una squadra del computer) entra in SV.abroad e non compare piu' nel suo club straniero (mercato ed EUCF: euOpponent).
   Inventati restano solo i ragazzi del tuo vivaio e del provino e i giovani che ogni anno entrano nelle squadre del computer per chi si ritira:
   col tempo anche loro, stando nelle rose, possono arrivare nel mercato. L'Overall si sceglie come prima, attorno ai livelli di potRef. */
const MK_YOUNG=21;          // fino a questa eta' un giocatore di un club e' una «Giovane promessa»
const MK_KEEP=3;            // i migliori di ogni club che non si vendono
const MK_FA_MAX=40,MK_FA_AGE=34,MK_FA_YRS=2;   // svincolati: quanti ne restano liberi, fino a che eta', per quante estati
const MK_PRICE={club:1.2,est:1.15,fa:1};       // prezzo rispetto al valore (priceOf): cartellino di un club, trasferimento dall'estero, svincolato
// un giocatore lasciato libero da un club: entra tra gli svincolati (i piu' forti, se sono troppi)
function faAdd(o,club){
  if(!o||o.ret===1||(o.age|0)>MK_FA_AGE||lnWomenNow()!==!!o.f)return;
  if(!SV.fa)SV.fa=[];if(SV.fa.some(x=>x.full===o.full))return;
  o.faS=SV.season|0;o.faC=club||'';o.inj=0;SV.fa.push(o);
  if(SV.fa.length>MK_FA_MAX){SV.fa.sort((a,b)=>ovrX(b)-ovrX(a));SV.fa.length=MK_FA_MAX;}
}
// ogni estate gli svincolati invecchiano come tutti; chi e' libero da troppo o e' troppo anziano smette
function faYear(){
  if(!SV.fa)SV.fa=[];
  for(const o of SV.fa)agePlayer(o,Math.random);
  SV.fa=SV.fa.filter(o=>o.age<=MK_FA_AGE+1&&(SV.season|0)-(o.faS|0)<=MK_FA_YRS);
}
const mkMine=()=>new Set(SQ.map(p=>p.full));
// livello di un club di un altro campionato (per cercare all'estero giocatori dell'Overall giusto)
const mkClubLv=n=>US_TEAM[n]?US_TEAM[n].power:(LN_BY[n]?LN_BY[n].p:(TEAM[n]?TEAM[n].power:60));
// i giocatori delle altre squadre del tuo campionato che si possono comprare (v = Overall, gia' calcolato)
function mkClubPool(){
  const mine=mkMine(),out=[];
  for(const n in SV.rost){
    const ro=SV.rost[n];if(n===SV.team||!ro||ro.length<=12)continue;
    const top=new Set(ro.slice().sort((a,b)=>ovrX(b)-ovrX(a)).slice(0,MK_KEEP));
    for(const o of ro)if(!top.has(o)&&o.ret!==1&&!o.inj&&!mine.has(o.full))out.push({o,n,v:ovrX(o)});
  }
  return out;
}
// uno a caso tra i k piu' vicini all'Overall t (filtro f facoltativo), tolto dall'elenco; null se nessuno e' entro tol punti
function mkTake(pool,t,R,f,tol,k){
  const c=[];for(let i=0;i<pool.length;i++){const x=pool[i];if(f&&!f(x))continue;const d=Math.abs(x.v-t);if(d<=(tol||8))c.push([d,i]);}
  if(!c.length)return null;c.sort((a,b)=>a[0]-b[0]);
  const s=c.slice(0,k||5),i=s[Math.floor(R()*s.length)][1];return pool.splice(i,1)[0];
}
// prima i giocatori veri; quelli nati nel gioco (i giovani entrati nelle rose negli anni) solo se nessun vero ha l'Overall giusto
const mkTakeR=(pool,t,R,f,tol,k)=>mkTake(pool,t,R,x=>!x.o.gen&&(!f||f(x)),tol,k)||mkTake(pool,t,R,f,tol,k);
// club di altri campionati (stesso mondo: maschile o femminile) di livello vicino a t
function mkAbroadClubs(t){
  const lk=lgNow();return allClubs().filter(n=>clubLega(n)!==lk&&Math.abs(mkClubLv(n)-t)<=7);
}
// un giocatore vero di un club straniero, con l'Overall vicino a t: le eta' della rosa sono quelle del 2026, poi passano gli anni della carriera
function mkAbroad(t,R,skip){
  const cl=mkAbroadClubs(t),ab=new Set(SV.abroad||[]),mine=mkMine();
  for(let tries=0;tries<4&&cl.length;tries++){
    const n=cl.splice(Math.floor(R()*cl.length),1)[0];let ro;
    try{ro=foreignRoster(n,SV.seed+'|est|'+n);}catch(e){continue;}
    const top=new Set(ro.slice().sort((a,b)=>ovrX(b)-ovrX(a)).slice(0,MK_KEEP));
    const pool=ro.filter(o=>!o.gen&&!top.has(o)&&!ab.has(o.full)&&!mine.has(o.full)&&!(skip&&skip.has(o.full))).map(o=>({o,n,v:ovrX(o)}));
    const x=mkTake(pool,t,R,null,6,3);if(!x)continue;
    const o=x.o,rg=mulberry32(hashStr(SV.seed+'|estage|'+o.full));
    for(let y=1;y<(SV.season|0);y++)agePlayer(o,rg);
    if(o.age>MK_FA_AGE)continue;
    o.sk=o.sk|0;o.cond=100;o.car=null;
    return {o,club:n};
  }
  return null;
}
// chi arriva dall'estero non gioca piu' nel suo club straniero
function abroadAdd(o){if(!o||!o.full)return;if(!SV.abroad)SV.abroad=[];if(!SV.abroad.includes(o.full))SV.abroad.push(o.full);if(SV.abroad.length>300)SV.abroad.shift();}
const abroadDrop=ro=>{const ab=SV.abroad&&SV.abroad.length?new Set(SV.abroad):null;return ab?ro.filter(o=>!ab.has(o.full)):ro;};

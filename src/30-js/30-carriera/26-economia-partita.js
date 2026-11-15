/* ---- ECONOMIA DELLA PARTITA: casa e trasferta, spettatori, sponsor, premi, conti in rosso ----
   Ogni partita di carriera ha un conto suo (matchMoney), che recordResult applica alla cassa e che il giocatore vede nel dettaglio:
   - ENTRATE: biglietti (solo in casa; a campo neutro nei tornei se ne ha una quota), sponsor (una quota fissa a partita) e premio della lega per la vittoria,
     che vale di piu' nelle partite importanti (derby, fasi finali, avversarie piu' forti);
   - USCITE: stipendi, manutenzione e staff (come prima, fissi) e la trasferta (una cifra fissa quando non si gioca in casa).
   Gli spettatori dipendono da tifosi, importanza della partita, avversaria e forma recente (non dal meteo), entro la capienza data dalle Tribune.
   Lo SPONSOR si sceglie a inizio stagione tra tre offerte (sicuro, equilibrato, ambizioso) e prende il posto dell'obiettivo fisso: piu' soldi sicuri a partita
   oppure meno soldi a partita e un bonus grosso se a fine stagione si raggiunge l'obiettivo, che e' quello del contratto scelto (SV.obj, letto dai premi di fine stagione).
   Il ROSSO ha conseguenze graduali (SV.red): mercato fermo, avvisi della dirigenza, morale in calo sempre piu' forte e, se dura troppo, l'esonero (SV.fired). */
// PESO ECONOMICO DI UNA SERIE: le entrate (biglietti, sponsor, premi vittoria) seguono quanto costano in stipendi le rose delle altre squadre del tuo
// campionato (in USA tutta la lega, nelle leghe europee tutto il livello, in Italia la serie: le Conference e i gironi sono troppo diversi tra loro),
// non un valore fisso per campionato: dove i giocatori sono piu' forti costano e incassano di piu'. La rosa di riferimento ha 16 giocatori, uguale per tutti:
// le entrate non dipendono dalla tua rosa. La curva passa per i valori dell'Italia (Serie C 1, B 1,3, A 1,65), che restano come prima.
const ECO_REF=[[84,1],[253,1.3],[511,1.65]],ECO_RS=16;
function ecoPeers(){
  if(isUS())return US_NAMES;
  if(isLN()&&SV.ln&&SV.ln.T&&SV.ln.T[SV.ln.tier])return SV.ln.T[SV.ln.tier].flatMap(c=>c.pools?c.pools.flat():(c.clubs||[]));
  return (SV.mem&&SV.mem[SV.sr])||[];
}
const w16=ro=>{const v=ro.map(o=>wageOf(o)).sort((a,b)=>b-a),n=Math.min(ECO_RS,v.length);let s=0;for(let i=0;i<n;i++)s+=v[i];return n?s*ECO_RS/n:0;};
let ecoKC={key:'',v:1};
function ecoK(){
  if(!SV||!SV.sr)return 1;
  const key=SV.team+'|'+SV.season+'|'+SV.sr;if(ecoKC.key===key)return ecoKC.v;
  const ns=ecoPeers().filter(n=>n!==SV.team&&SV.rost&&SV.rost[n]&&SV.rost[n].length);
  if(!ns.length){ecoKC={key,v:SR_K[SV.sr]||1};return ecoKC.v;}
  ecoKC={key,v:ecoCurve(ns.reduce((a,n)=>a+w16(SV.rost[n]),0)/ns.length)};return ecoKC.v;
}
// dal costo medio di una rosa da 16 al peso economico: interpolazione sui punti italiani, fuori dai punti si prolunga il primo o l'ultimo tratto
function ecoCurve(W){
  const R=ECO_REF;let k;
  if(W<=R[0][0])k=R[0][1]+(W-R[0][0])*(R[1][1]-R[0][1])/(R[1][0]-R[0][0]);
  else if(W>=R[2][0])k=R[2][1]+(W-R[2][0])*(R[2][1]-R[1][1])/(R[2][0]-R[1][0]);
  else{const i=W<R[1][0]?0:1;k=R[i][1]+(W-R[i][0])*(R[i+1][1]-R[i][1])/(R[i+1][0]-R[i][0]);}
  return clamp(k,0.6,2.4);
}
const ECO={
  K:ecoK,
  SHARE_N:0.5,         // a campo neutro (tornei: Nationals, Campionato europeo, finali) meta' dei biglietti che avresti in casa (era 0,35)
  WB:4,                // premio della lega per una vittoria normale (prima di K e dell'importanza)
  TRV:2.2              // costo fisso di una trasferta (prima di K)
};
const VENUE_TXT={H:'In casa',A:'In trasferta',N:'Campo neutro'},VENUE_SHORT={H:'In casa',A:'Trasferta',N:'Neutro'};
// ---------- dove si gioca ----------
// in campionato casa e trasferta si alternano a ogni giornata; l'avversaria non conta (le altre partite si simulano senza campo), quindi basta un ritmo per squadra
const venueAlt=r=>((((r===undefined?SV.round:r)|0)+(hashStr(SV.team+'|'+SV.season)&1))%2===0)?'H':'A';
function venueOf(){
  if(SV.event==='eu')return 'N';   // EUCF: torneo in una sede sola
  if(isUS()){
    const U=SV.us;
    if(U.ph==='reg')return venueAlt(SV.sgp|0);   // casa e trasferta si alternano a ogni partita, interregionali comprese
    if(U.ph==='pin'){const P=U.pin&&U.pin[U.cf],m=P&&SV.po?P.m[SV.po.mi]:null;return m&&m[0]===SV.team?'H':'A';}   // Play-in: gara secca in casa della meglio piazzata
    return 'N';   // Nationals
  }
  if(isLN())return SV.ln.ph==='grp'?venueAlt():'N';   // fasi finali: tabellone in un weekend
  if(SV.po&&SV.po.on)return SV.po.round?'N':'H';      // playoff italiani: semifinale in casa, finale in campo neutro
  return venueAlt();
}
// quanto vale la partita per la lega: moltiplica il premio vittoria
function phaseImp(){
  if(SV.event==='eu')return 2;
  if(isUS())return SV.us.ph==='reg'?1:2;
  if(isLN())return SV.ln.ph==='grp'?1:1.8;
  if(SV.po&&SV.po.on)return SV.po.round?2.5:2;
  return 1;
}
const oppPowOf=n=>{const t=teamPower(n);if(t!=null)return t;if(typeof euPowOf==='function'){const e=euPowOf(n);if(e)return e;}return TEAM[n]?TEAM[n].power:squadPower();};
// ---------- spettatori ----------
const stadCap=()=>Math.round(450*Math.sqrt(ECO.K())*(1+0.55*facLv('stad')));   // le Tribune allargano lo stadio
const tixPrice=()=>0.07*Math.sqrt(ECO.K());                                   // crediti per spettatore
// interesse per la partita: derby, posta in gioco, avversaria di nome e forma recente (niente meteo)
function interestOf(m){
  let x=1;
  const reg=venueOf()!=='N';
  if(reg&&m.name===SV.riv)x+=0.3;
  else{let st=null;try{st=matchStakes(m);}catch(e){}if(st)x+=0.15;}
  x+=clamp((oppPowOf(m.name)-squadPower())*0.015,-0.05,0.15);
  let w=0;for(const r of (SV.res||[]).slice(-3))w+=r.su>r.so?1:-0.6;
  return x+clamp(w*0.05,-0.1,0.15);
}
function attendance(m,v){
  const K=ECO.K(),cap=stadCap();
  let dem=300*Math.sqrt(K)*(0.35+1.3*fansOf()/100)*interestOf(m);
  const R=mulberry32(hashStr(SV.seed+'|att|'+SV.season+'|'+(SV.played|0)));dem*=0.95+R()*0.1;   // un po' di variazione, ripetibile
  dem=Math.round(dem);
  return {dem,cap,att:Math.min(cap,dem),full:dem>=cap};
}
// spettatori attesi (senza forma, posta in gioco e variazione): servono al bilancio previsionale
const demandExp=n=>Math.round(300*Math.sqrt(ECO.K())*(0.35+1.3*fansOf()/100)*(1+(n&&n===SV.riv?0.3:0)+clamp(((n?oppPowOf(n):squadPower())-squadPower())*0.015,-0.05,0.15)));
// ---------- premio vittoria e trasferta ----------
function winBonus(m,v){
  const my=squadPower(),op=oppPowOf(m.name),up=clamp((op-my-2)/10,0,0.8);
  const derby=v!=='N'&&m.name===SV.riv&&SV.event==='camp';
  const imp=phaseImp()*(derby?1.5:1)*(1+up);
  return {v:Math.round(ECO.WB*ECO.K()*imp),tag:derby?'derby':(up>=0.3?'impresa':(phaseImp()>1?'partita decisiva':''))};
}
const travelCost=()=>Math.round(ECO.TRV*ECO.K());
// ---------- il conto di una partita ----------
function matchMoney(win,m){
  m=m||nextMatch();
  const v=venueOf(),a=attendance(m,v),pr=tixPrice();
  const gate=v==='H'?Math.round(a.att*pr):(v==='N'?Math.round(a.dem*pr*ECO.SHARE_N):0);
  const spon=SV.sp?SV.sp.fix:0,w=win?winBonus(m,v):{v:0,tag:''};
  const trv=v==='H'?0:travelCost(),wage=wageBill(),up=facUpkeep(),stf=staffWage();
  return {v,opp:m.name,win:!!win,att:v==='H'?a.att:0,cap:v==='H'?a.cap:0,dem:a.dem,full:v==='H'&&a.full,gate,spon,wb:w.v,wbTag:w.tag,trv,wage,up,stf,net:gate+spon+w.v-trv-wage-up-stf};
}
const ecoSg=v=>(v>=0?'+':'−')+Math.abs(Math.round(v));
function moneyRows(r){   // [etichetta, valore con segno] solo per le voci che ci sono
  const x=[];
  if(r.v==='H')x.push([`Biglietti (${r.att} spettatori su ${r.cap}${r.full?', tutto esaurito':''})`,r.gate]);
  else if(r.v==='N')x.push(['Quota biglietti del torneo',r.gate]);
  x.push([`Sponsor${SV.sp&&SV.sp.name?' · '+SV.sp.name:''}`,r.spon]);
  if(r.win)x.push([`Premio vittoria${r.wbTag?' ('+r.wbTag+')':''}`,r.wb]);
  if(r.trv)x.push(['Trasferta',-r.trv]);
  x.push(['Stipendi',-r.wage]);
  if(r.up+r.stf)x.push(['Manutenzione e staff',-(r.up+r.stf)]);
  return x;
}
function moneyHTML(r){
  if(!r)return '';
  return `<div class="mny"><strong>Conti della giornata · ${VENUE_TXT[r.v]}</strong>`+moneyRows(r).map(([l,v])=>`<div class="bgr"><span>${l}</span><b>${ecoSg(v)}</b></div>`).join('')+`<div class="bgr ${r.net<0?'bad':'tot'}"><span>Saldo</span><b>${ecoSg(r.net)}</b></div></div>`;
}
// registro delle ultime partite (Club > Società)
function ledgerAdd(r){
  if(!SV.fin)SV.fin=[];
  SV.fin.unshift({s:SV.season,r:(SV.played|0),o:r.opp,v:r.v,w:r.win?1:0,n:r.net,c:SV.cash,gt:r.gate,sp:r.spon,wb:r.wb,tr:r.trv,ex:r.wage+r.up+r.stf});
  if(SV.fin.length>30)SV.fin.length=30;
}
// ---------- sponsor ----------
const SP_NAMES=['Cassa Rurale Valli','Pastificio Moretti','Energia Verde','Birrificio del Borgo','Autotrasporti Riva','Assicurazioni Ferri','Tecnomar','Caffè Aurora','Officine Bruno','Gelati Dolcecuore','Idraulica Neri','Banca del Lago','Frutta Fresca Sud','Studio Legale Conti'];
const SP_KIND={
  sic:{n:'Sicuro',fix:1.2,rw:0.55,sh:2,d:'Più soldi a ogni partita, bonus piccolo per un obiettivo alla portata.'},
  bal:{n:'Equilibrato',fix:1,rw:1,sh:0,d:'Soldi a partita nella media, bonus per l’obiettivo che la dirigenza si aspetta.'},
  amb:{n:'Ambizioso',fix:0.7,rw:2.4,sh:-2,d:'Meno soldi a ogni partita, bonus grosso se fai meglio del previsto.'}
};
const spBase=()=>ECO.K()*(4+0.06*(SV.rep|0));
function spRankTxt(tgt,n){
  if(tgt<=1)return 'Vincere il campionato';
  if(tgt>=n-1)return 'Non chiudere ultimi';
  if(tgt===n-PROMO)return 'Salvezza: non finire tra le ultime '+PROMO;
  return 'Chiudere tra le prime '+tgt;
}
// il contratto scelto cambia l'obiettivo: ogni variante parte da quello che la dirigenza si aspetta (SV.obj calcolato da setObjective)
function spVariant(k,b){
  if(!b)return null;
  if(isUS())return usObjFor(k,b.exp);
  if(b.rel){   // subentrato: la dirigenza chiede la salvezza, i contratti si spostano di un paio di posti
    const S=SP_KIND[k],K=ECO.K(),n=SV.mem[SV.sr].length,tgt=clamp(b.tgt+S.sh,1,Math.max(1,n-1));
    return {rel:1,tgt,txt:spRankTxt(tgt,n),exp:b.exp,reward:Math.round((36+(n-tgt)*4)*K*S.rw)};
  }
  return k==='bal'?Object.assign({},b):objFor(k,b.exp);   // 27-obiettivi-sponsor.js
}
function spOffer(){
  const b=SV.obj;if(!b||SV.sp&&SV.sp.y===SV.season&&SV.sp.off)return;
  const base=spBase(),R=mulberry32(hashStr(SV.seed+'|spn|'+SV.season)),pool=SP_NAMES.slice(),off=[];
  for(const k of ['sic','bal','amb']){
    const i=Math.floor(R()*pool.length),name=pool.splice(i,1)[0],S=SP_KIND[k];
    off.push({k,name,fix:Math.max(2,Math.round(base*S.fix)),obj:spVariant(k,b)});
  }
  SV.sp={y:SV.season,off,k:null,name:'',fix:off[1].fix};   // finche' non scegli vale quello equilibrato
}
function spChoose(i){
  const d=SV.sp&&SV.sp.off&&SV.sp.off[i];if(!d)return '';
  SV.sp={y:SV.season,off:null,k:d.k,name:d.name,fix:d.fix};SV.obj=d.obj;
  news(`Sponsor della stagione: ${d.name} (${SP_KIND[d.k].n.toLowerCase()}), ${d.fix} crediti a partita. Bonus di ${d.obj.reward} crediti: ${d.obj.txt.toLowerCase()}.`);
  return `${d.name}: ${d.fix} crediti a partita e ${d.obj.reward} di bonus a fine stagione se: ${d.obj.txt.toLowerCase()}.`;
}
// partenza da subentrato e salvataggi di prima: un contratto equilibrato gia' firmato
function spDefault(){
  if(!SV.obj)return;
  const R=mulberry32(hashStr(SV.seed+'|spn|'+SV.season));
  SV.sp={y:SV.season,off:null,k:'bal',name:SP_NAMES[Math.floor(R()*SP_NAMES.length)],fix:Math.max(2,Math.round(spBase()))};
}
const spTxt=()=>SV.sp&&SV.sp.k?`${SV.sp.name} · ${SP_KIND[SV.sp.k].n.toLowerCase()}`:'Da scegliere';
// la scelta si fa con il riquadro degli imprevisti (si apre da solo sul cruscotto e non si puo' ignorare)
EVT.spons={w:0,ok:()=>false,mk:()=>({}),
  t:a=>['Gli sponsor della stagione','Tre aziende vogliono il loro nome sulle maglie. Scegli il contratto: i soldi a partita arrivano comunque, il bonus solo se a fine stagione raggiungi l’obiettivo del contratto.'],
  o:a=>(SV.sp&&SV.sp.off?SV.sp.off:[]).map((d,i)=>[`${SP_KIND[d.k].n} · ${d.name}: ${d.fix} a partita, bonus ${d.obj.reward} se ${d.obj.txt.charAt(0).toLowerCase()+d.obj.txt.slice(1)}`,()=>spChoose(i)])};
// ---------- premio a un giocatore (imprevisto) ----------
const perfScore=p=>p&&p.lm?p.lm.g*2+p.lm.a*2+p.lm.b*3:0;
const PERF_MIN=14;   // una partita fuori dal normale: nelle partite di 7 punti il migliore in campo arriva a 14 di rado, e solo per le squadre molto forti (mete e assist pesano 2, le difese 3, come nei premi di stagione)
EVT.bonus={w:0,ok:()=>false,mk:()=>({}),
  t:a=>{const p=byFull(a.f);return ['Partita straordinaria',`${p?pname(p):'Un giocatore'} ha giocato una partita fuori dal comune (${p&&p.lm?gaTxt(p.lm.g,p.lm.a)+(p.lm.b?` e ${p.lm.b} ${p.lm.b===1?'difesa':'difese'}`:''):'una prova super'}). La società ha deciso di riconoscerglielo con un premio di ${a.c} crediti.`];},
  o:a=>[[`Ottimo (−${a.c} crediti, +2 morale)`,()=>{SV.cash-=a.c;SV.mor=clamp(SV.mor+2,0,100);SV.chem=clamp(SV.chem+0.5,0,100);return `Premio pagato: −${a.c} crediti, spogliatoio contento.`;}]]};
function bonusRoll(){
  if(SV.evt||SV.event!=='camp'||SV.done||SV.fired)return;
  SV.bonusGap=(SV.bonusGap|0)+1;   // almeno 6 giornate tra un premio e l'altro
  if(SV.bonusGap<6)return;
  const L=SQ.filter(p=>perfScore(p)>=PERF_MIN*carLen()/MATCH_TARGET).sort((a,b)=>perfScore(b)-perfScore(a));
  if(!L.length||Math.random()>0.7)return;
  const p=L[0];SV.evt={id:'bonus',a:{f:p.full,c:Math.max(3,Math.round(wageOf(p)*0.45))}};SV.evtGap=0;SV.bonusGap=0;
}
// ---------- il rosso ----------
// SV.red={n:partite di fila in rosso senza migliorare, w:ultimo avviso della dirigenza}. Mercato, strutture, staff e colloqui chiedono tutti cassa sufficiente: in rosso restano fermi.
const redLimit=()=>clamp(Math.round((SV.sched?SV.sched.length:15)*0.55),6,9);
const redPen=()=>SV.cash<0?Math.min(18,3+2*((SV.red&&SV.red.n||1)-1)):0;   // punti di morale persi a ogni partita: sempre di piu' finche' il rosso dura
const RED_MSG=[
  [1,'La dirigenza è preoccupata: i conti sono in rosso. Finché non rientri il mercato è fermo, niente strutture né staff, e il morale ne risente. Vendi una riserva o aspetta i prossimi incassi.'],
  [0.5,'La dirigenza protesta: il rosso dura da troppo. Lo spogliatoio è nervoso e il morale cala a ogni partita. Serve rientrare subito.'],
  [-2,'Ultimo avvertimento della dirigenza: se i conti non rientrano nelle prossime partite sarai esonerato.']
];
function redUpdate(net){
  if(!SV.red)SV.red={n:0,w:0};
  const R=SV.red;
  if(SV.cash>=0){   // un incasso in casa non basta a cancellare il rosso: la pazienza della dirigenza torna piano, una partita alla volta
    if(R.n>0&&--R.n===0){R.w=0;news('I conti sono tornati in positivo: la dirigenza si calma.');}
    return;
  }
  if(net<0||!R.n)R.n++;   // se il saldo risale la dirigenza aspetta, ma il rosso resta un rosso
  const lim=redLimit();
  const lv=R.n>=lim-2?3:(R.n>=Math.ceil(lim/2)?2:1);
  if(lv>(R.w|0)){R.w=lv;alertAdd('dir',RED_MSG[lv-1][1]);}
  if(R.n>=lim&&!SV.fired)redFire();
}
// ---------- l'esonero ----------
// i club offerti sono piu' scarsi di quello da cui vieni mandato via: in qualunque lega, mai lo stesso club
function firedOffers(){
  const me=qPowOf(SV.team),all=allClubs().filter(n=>n!==SV.team),by=all.map(n=>({n,p:qPowOf(n)})).sort((a,b)=>b.p-a.p);
  let pool=by.filter(x=>x.p<me-1);
  if(pool.length<4)pool=by.slice(-6);
  const R=mulberry32(hashStr(SV.seed+'|fire|'+SV.season+'|'+(SV.played|0))),out=[];
  while(out.length<5&&pool.length){out.push(pool.splice(Math.floor(R()*pool.length),1)[0].n);}
  return out.sort((a,b)=>qPowOf(b)-qPowOf(a));
}
function qPowOf(n){   // forza di un club di qualunque lega, sulla stessa scala (tutte le leghe sono tarate tra circa 50 e 91)
  if(US_TEAM[n])return US_TEAM[n].power;
  if(LN_BY[n])return LN_BY[n].p;
  return TEAM[n]?TEAM[n].power:qPower(n);
}
function redFire(){
  SV.fired={team:SV.team,s:SV.season,r:SV.round|0,offers:firedOffers()};
  alertAdd('dir',`${SV.team} ti ha esonerato: i conti sono rimasti in rosso troppo a lungo. Dovrai ripartire da un altro club, più modesto.`);
}
function firedAccept(club){
  const f=SV.fired;if(!f||!f.offers.includes(club))return '';
  return switchLeague(club,true);
}
// ---------- dopo una partita: registro e rosso ----------
function econAfterMatch(mm){
  SV.lastMoney=mm;ledgerAdd(mm);
  redUpdate(mm.net);
  bonusRoll();
}

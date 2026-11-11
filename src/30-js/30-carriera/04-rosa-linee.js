/* ===================== CARRIERA: rosa, linee, economia, mercato, scouting, evoluzione, obiettivi, premi =====================
   Tutta logica senza interfaccia (si puo' provare da riga di comando). I dati stanno nel salvataggio SV (versione 3). */
const SAVE_V=3,SQ_MIN=12,SQ_MAX=28;
const SURN=['Rossi','Bianchi','Ferrari','Russo','Romano','Gallo','Costa','Fontana','Conti','Esposito','Ricci','Bruno','Greco','Marino','Giordano','Rinaldi','Lombardi','Moretti','Barbieri','Colombo','Mancini','Longo','Leone','Martinelli','Serra','Santoro','Mariani','Vitale','Coppola','De Luca','Ferri','Bianco','Grasso','Pellegrini','Caruso','Fabbri','Monti','Sala','Villa','Marchetti'];
const SR_K={C:1,B:1.3,A:1.65};
const teamPow=n=>n===SV.team?squadPower():(SV.rost[n]?rosterPower(SV.rost[n]):(TEAM[n]?TEAM[n].power:50));
// giocatore generato (giovane del vivaio, svincolato, rincalzo di una squadra): livello ed eta' richiesti, potenziale variabile
function genPlayer(level,age,seedStr,potB){
  const rng=mulberry32(hashStr(seedStr)),R=(a,b)=>a+rng()*(b-a);
  const nm=NAME_POOL[Math.floor(rng()*NAME_POOL.length)],sur=SURN[Math.floor(rng()*SURN.length)],full=sur+' '+nm+' '+String.fromCharCode(65+hashStr(seedStr)%26)+(hashStr(seedStr+'x')%90+10);
  const role=rng()<0.45?'H':'C',d=role==='H'?0.5:-0.5,pb0=potB===undefined?level+R(5,24):potB,pb=pb0>90?90+(pb0-90)*0.45:pb0;
  const tg=x=>clamp(Math.round(pb+x+R(-4,4)),60,99),tl=tg(4*d),tf=tg(-4*d),tv=tg(0),st={};
  KEYS.forEach(k=>{const g=(k==='lan'||k==='buc'||k==='spa')?'L':(k==='vis'?'V':'F'),off=g==='L'?9*d:(g==='V'?3*d:-7*d);st[k]=clamp(Math.round(level+off+R(-5,5)),25,capVal(full,k,g==='L'?tl:(g==='V'?tv:tf)));});
  return {n:nm,label:nm+' '+sur,full,sur,r:role,age,tl,tf,tv,s:st,gen:true,f:FEM_N.has(nm),trait:traitFor(full,st,role),dev:devOf(full),sk:0,cond:100,car:null};
}
// la rosa come dati (cio' che si salva): una scheda per giocatore
const squadData=()=>SQ.map(p=>({n:p.name,label:p.label,full:p.full,sur:p.sur||'',r:p.role,age:p.age,tl:p.tl,tf:p.tf,tv:p.tv,s:Object.assign({},p.b||p.s),gen:p.gen,f:!!p.f,trait:p.trait,dev:p.dev,sk:p.sk,cond:Math.round(p.cond),inj:p.inj|0,tr:!!p.tr,car:p.car||null,star:p.star||undefined,nat:p.nat||undefined,pos:p.pos||undefined,ae:p.ae||undefined,aw:p.aw&&p.aw.length?p.aw:undefined,ra:p.ra,ret:p.ret||undefined,retHold:p.retHold||undefined,injC:p.injC||undefined,injBig:p.injBig||undefined,idle:p.idle||undefined,mood:p.mood||undefined,prom:p.prom||undefined,rw:p.rw||undefined}));
const byFull=f=>SQ.find(p=>p.full===f);
const idsOf=names=>(names||[]).map(byFull).filter(Boolean).map(p=>p.id);
const namesOf=ids=>ids.map(id=>SQ[id]&&SQ[id].full).filter(Boolean);
// linee consigliate: attacco = 3 migliori handler + 4 migliori cutter; difesa = i 7 migliori difensori (almeno 2 handler per ripartire dopo un recupero)
function autoLines(){
  const ok=SQ.filter(p=>!p.inj),by=(r)=>(a,b)=>rate(b.s,r)-rate(a.s,r);
  const H=ok.filter(p=>p.role==='H').sort(by('H')),C=ok.filter(p=>p.role!=='H').sort(by('C'));
  let o=H.slice(0,3).concat(C.slice(0,4));if(o.length<7)o=o.concat(ok.filter(p=>!o.includes(p)).sort((a,b)=>ovrX(b)-ovrX(a)).slice(0,7-o.length));
  // in difesa si preferisce chi non gioca gia' in attacco (a parita' o quasi di valore): due linee diverse si stancano la meta'
  const dv=p=>rate(p.s,'D')-(o.includes(p)?4:0),byD=(a,b)=>dv(b)-dv(a);
  const dH=H.slice().sort(byD).slice(0,2);let d=dH.concat(ok.filter(p=>!dH.includes(p)).sort(byD).slice(0,5));
  SV.lineO=o.map(p=>p.full);SV.lineD=d.map(p=>p.full);
}
function fixLines(){   // linee sempre valide: 7 nomi presenti in rosa. Gli infortunati restano in linea: rientrano da soli quando guariscono
  for(const k of ['lineO','lineD']){
    const L=[...new Set((SV[k]||[]).filter(n=>byFull(n)))];
    const rest=SQ.filter(p=>!p.inj&&!L.includes(p.full)).sort((a,b)=>k==='lineD'?rate(b.s,'D')-rate(a.s,'D'):ovrX(b)-ovrX(a));
    while(L.length<7&&rest.length)L.push(rest.shift().full);
    SV[k]=L.slice(0,7);
  }
}
function matchLine(k){   // la linea di oggi: al posto di chi e' infortunato entra il migliore disponibile dello stesso ruolo (la linea salvata non cambia)
  const ids=idsOf(SV[k]),out=[];
  for(const id of ids){
    const p=SQ[id];
    if(!p.inj){out.push(id);continue;}
    const c=SQ.filter(q=>!q.inj&&!ids.includes(q.id)&&!out.includes(q.id)).sort((a,b)=>((b.role===p.role)-(a.role===p.role))||(k==='lineD'?rate(b.s,'D')-rate(a.s,'D'):ovrX(b)-ovrX(a)))[0];
    if(c)out.push(c.id);
  }
  return out;
}
function careerInit(){   // campi nuovi della carriera (anche per i salvataggi piu' vecchi)
  if(SV.cash===undefined)SV.cash=Math.round(70*SR_K[SV.sr]);
  if(SV.rep===undefined)SV.rep=SV.sr==='A'?60:(SV.sr==='B'?40:20);
  if(!SV.fac)SV.fac={camp:0,fis:0,viv:0};
  if(SV.tInt===undefined)SV.tInt=1;if(!SV.facKeep)SV.facKeep={};if(SV.dom===undefined)SV.dom=0;if(SV.facRnd===undefined){SV.facRnd=SV.event==='camp'?(SV.round|0):0;SV.facDays={};for(const k in (SV.fac||{}))if((SV.fac[k]|0)>=3)SV.facDays[k]=SV.facRnd;}   // salvataggi di prima: le strutture gia' al livello 3 contano come mantenute da inizio stagione   // carriera dinamica: intensita' normale, nessun premio di mantenimento maturato, nessun dominio
  if(SV.chem===undefined)SV.chem=50;if(SV.mor===undefined)SV.mor=60;
  if(!SV.alerts)SV.alerts=[];
  if(!SV.news)SV.news=[];if(!SV.hist)SV.hist=[];if(!SV.hof)SV.hof=[];if(!SV.rec)SV.rec={};if(!SV.troph)SV.troph={};if(!SV.former)SV.former=[];
  if(SV.autoSub===undefined)SV.autoSub=true;
  if(!SV.lineO||!SV.lineD)autoLines();fixLines();
  if(!SV.obj&&SV.tab)setObjective();
  if(!SV.market||SV.mkStars!==2){buildMarket();SV.mkStars=2;}
  leagueAnchors();
  for(const p of SQ)retAnchor(p);
  if(!SV.lifeV){SV.lifeV=1;if(SV.sched)retireCheck('start');}   // anche le carriere gia' avviate ricevono subito i primi avvisi
}
function news(txt){SV.news.unshift({s:SV.season,r:(SV.round|0)+1,txt});if(SV.news.length>40)SV.news.length=40;}

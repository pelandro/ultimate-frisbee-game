/* ===================== CARRIERA: rosa, linee, economia, mercato, scouting, evoluzione, obiettivi, premi =====================
   Tutta logica senza interfaccia (si puo' provare da riga di comando). I dati stanno nel salvataggio SV (versione 3). */
const SAVE_V=3,SQ_MIN=12,SQ_MAX=28;
const SURN=['Rossi','Bianchi','Ferrari','Russo','Romano','Gallo','Costa','Fontana','Conti','Esposito','Ricci','Bruno','Greco','Marino','Giordano','Rinaldi','Lombardi','Moretti','Barbieri','Colombo','Mancini','Longo','Leone','Martinelli','Serra','Santoro','Mariani','Vitale','Coppola','De Luca','Ferri','Bianco','Grasso','Pellegrini','Caruso','Fabbri','Monti','Sala','Villa','Marchetti'];
const SR_K={C:1,B:1.3,A:1.65};
const teamPow=n=>n===SV.team?squadPower():(SV.rost[n]?rosterPower(SV.rost[n]):(TEAM[n]?TEAM[n].power-PW_LV:50));   // potenza (12-allenamenti-rose.js); il livello statico dei club senza rosa si porta alla scala della potenza con PW_LV
const teamLevel=n=>n===SV.team?squadLevel():(SV.rost[n]?rosterLevel(SV.rost[n]):(TEAM[n]?TEAM[n].power:50));   // livello dei 7 titolari: riferimento di crescita e mercato
// giocatore generato (giovane del vivaio, svincolato, rincalzo di una squadra): livello ed eta' richiesti, potenziale variabile
function genPlayer(level,age,seedStr,potB){
  const rng=mulberry32(hashStr(seedStr)),R=(a,b)=>a+rng()*(b-a);
  const NP=isUS()?(lnWomenNow()?UW_FN:US_FN):(isLN()?LN_POOL[SV.lk].f:NAME_POOL),SP=isUS()?US_LN:(isLN()?LN_POOL[SV.lk].l:SURN),nm=NP[Math.floor(rng()*NP.length)],sur=SP[Math.floor(rng()*SP.length)],full=sur+' '+nm+' '+String.fromCharCode(65+hashStr(seedStr)%26)+(hashStr(seedStr+'x')%90+10);
  const role=rng()<0.45?'H':'C',d=role==='H'?0.5:-0.5,pb0=potB===undefined?level+R(5,24):potB,pb=pb0>90?90+(pb0-90)*0.45:pb0;
  const tg=x=>clamp(Math.round(pb+x+R(-4,4)),45,99),tl=tg(4*d),tf=tg(-4*d),tv=tg(0),st={};
  KEYS.forEach(k=>{const g=(k==='lan'||k==='buc'||k==='spa')?'L':(k==='vis'?'V':'F'),off=g==='L'?9*d:(g==='V'?3*d:-7*d);st[k]=clamp(Math.round(level+off+R(-5,5)),25,capVal(full,k,g==='L'?tl:(g==='V'?tv:tf)));});
  return {n:nm,label:nm+' '+sur,full,sur,r:role,age,tl,tf,tv,s:st,gen:true,f:lnWomenNow(),trait:traitFor(full,st,role),dev:devOf(full),sk:0,cond:100,car:null};
}
// la rosa come dati (cio' che si salva): una scheda per giocatore
const squadData=()=>SQ.map(p=>({n:p.name,label:p.label,full:p.full,sur:p.sur||'',r:p.role,age:p.age,tl:p.tl,tf:p.tf,tv:p.tv,s:Object.assign({},p.b||p.s),gen:p.gen,f:!!p.f,trait:p.trait,dev:p.dev,sk:p.sk,cond:Math.round(p.cond),inj:p.inj|0,tr:!!p.tr,car:p.car||null,star:p.star||undefined,nat:p.nat||undefined,pos:p.pos||undefined,ae:p.ae||undefined,aw:p.aw&&p.aw.length?p.aw:undefined,ra:p.ra,ret:p.ret||undefined,retHold:p.retHold||undefined,injC:p.injC||undefined,injBig:p.injBig||undefined,idle:p.idle||undefined,mood:p.mood||undefined,prom:p.prom||undefined,rw:p.rw||undefined,spec:p.spec||undefined,goal:p.goal||undefined,sad:p.sad||undefined,ex:p.ext||undefined,nk:p.nick||undefined,lm:p.lm||undefined,ti:p.ti||undefined,tk:p.tk||undefined,pri:p.pri||undefined,hi:p.hist&&p.hist.length?p.hist:undefined}));
const byFull=f=>SQ.find(p=>p.full===f);
const idsOf=names=>(names||[]).map(byFull).filter(Boolean).map(p=>p.id);
const namesOf=ids=>ids.map(id=>SQ[id]&&SQ[id].full).filter(Boolean);
// linee consigliate: attacco = 3 migliori handler + 4 migliori cutter; difesa = i 7 migliori difensori (almeno 2 handler per ripartire dopo un recupero)
function suggestedLines(){
  // valore di oggi: chi e' scarico rende meno (COND_PEN, come in partita), quindi a parita' entra il piu' fresco
  const ok=SQ.filter(p=>!p.inj),ef=(p,r)=>rate(p.s,r)-COND_PEN*(100-(p.cond===undefined?100:p.cond)),by=(r)=>(a,b)=>ef(b,r)-ef(a,r);
  const H=ok.filter(p=>p.role==='H').sort(by('H')),C=ok.filter(p=>p.role!=='H').sort(by('C'));
  let o=H.slice(0,3).concat(C.slice(0,4));if(o.length<7)o=o.concat(ok.filter(p=>!o.includes(p)).sort((a,b)=>ovrX(b)-ovrX(a)).slice(0,7-o.length));
  // in difesa si preferisce chi non gioca gia' in attacco: chi sta in entrambe le linee rende DBL_PEN in meno in tutte e due e si stanca il doppio
  const dv=p=>ef(p,'D')-(o.includes(p)?2*DBL_PEN+2:0),byD=(a,b)=>dv(b)-dv(a);
  const dH=H.slice().sort(byD).slice(0,2);let d=dH.concat(ok.filter(p=>!dH.includes(p)).sort(byD).slice(0,5));
  return {lineO:o.map(p=>p.full),lineD:d.map(p=>p.full)};
}
function autoLines(){
  Object.assign(SV,suggestedLines());
}
function fixLines(){   // linee sempre valide: 7 nomi presenti in rosa. Gli infortunati restano in linea: rientrano da soli quando guariscono
  for(const k of ['lineO','lineD']){
    const L=[...new Set((SV[k]||[]).filter(n=>byFull(n)))];
    const oth=SV[k==='lineO'?'lineD':'lineO']||[],dup=p=>oth.includes(p.full)?1:0;   // per completare si preferisce chi non e' gia' nell'altra linea
    const rest=SQ.filter(p=>!p.inj&&!L.includes(p.full)).sort((a,b)=>(dup(a)-dup(b))||(k==='lineD'?rate(b.s,'D')-rate(a.s,'D'):ovrX(b)-ovrX(a)));
    while(L.length<7&&rest.length)L.push(rest.shift().full);
    SV[k]=L.slice(0,7);
  }
}
function matchLine(k){   // la linea di oggi: al posto di chi e' infortunato entra il migliore disponibile dello stesso ruolo (la linea salvata non cambia)
  const ids=idsOf(SV[k]),out=[],oth=SV[k==='lineO'?'lineD':'lineO']||[],dup=q=>oth.includes(q.full)?1:0;   // a parita' di ruolo entra chi non gioca gia' nell'altra linea
  for(const id of ids){
    const p=SQ[id];
    if(!p.inj){out.push(id);continue;}
    const c=SQ.filter(q=>!q.inj&&!ids.includes(q.id)&&!out.includes(q.id)).sort((a,b)=>((b.role===p.role)-(a.role===p.role))||(dup(a)-dup(b))||(k==='lineD'?rate(b.s,'D')-rate(a.s,'D'):ovrX(b)-ovrX(a)))[0];
    if(c)out.push(c.id);
  }
  return out;
}
// salvataggi di prima: i giocatori inventati con un nome femminile nei campionati maschili (il vecchio elenco dei nomi li mescolava) prendono un nome
// maschile, sempre lo stesso per lo stesso giocatore (anche nel mercato e nelle rose delle altre squadre); full resta com'era: e' la chiave di statistiche e confronti
function menNames(d){
  if(!d||lnWomenNow())return;
  const fix=o=>{if(!o||(!o.gen&&o.sur))return;   // anche i giocatori senza cognome delle rose inventate (makeRoster)
    const fn=String(o.label||o.n||'').split(' ')[0];if(!o.f&&!FEM_N.has(fn))return;o.f=false;if(!FEM_N.has(fn))return;   // nella rosa salvata n e' il nome in campo (il cognome): il nome sta in label
    const nm=NAME_POOL[hashStr('m|'+(o.full||o.label||o.n))%NAME_POOL.length];if(o.label)o.label=nm+o.label.slice(fn.length);if(o.n===fn)o.n=nm;};
  (d.squad||[]).forEach(fix);(d.market||[]).forEach(m=>fix(m&&m.o));
  if(d.rost)for(const n in d.rost)(d.rost[n]||[]).forEach(fix);
}
function careerInit(){   // campi nuovi della carriera (anche per i salvataggi piu' vecchi)
  if(SV.cash===undefined)SV.cash=Math.max(Math.round(70*SR_K[SV.sr]),wageBill()*4);   // in cassa almeno quattro partite di stipendi: le rose lunghe di USA ed Europa altrimenti partivano in rosso
  if(SV.rep===undefined)SV.rep=isUS()?usRepStart():(isLN()?lnRepStart():(SV.sr==='A'?60:(SV.sr==='B'?40:20)));
  migrateFacilities();
  if(!SV.staff)SV.staff={};if(!SV.duo)SV.duo={};if(SV.tInt===undefined)SV.tInt=1;if(!SV.facKeep)SV.facKeep={};if(SV.dom===undefined)SV.dom=0;if(SV.facRnd===undefined){SV.facRnd=SV.event==='camp'?(SV.round|0):0;SV.facDays={};for(const k in (SV.fac||{}))if((SV.fac[k]|0)>=3)SV.facDays[k]=SV.facRnd;}   // salvataggi di prima: le strutture gia' al livello 3 contano come mantenute da inizio stagione   // carriera dinamica: intensita' normale, nessun premio di mantenimento maturato, nessun dominio
  if(SV.fans===undefined)SV.fans=SV.rep;
  if(!SV.tips)SV.tips={};
  if(SV.chem===undefined)SV.chem=50;if(SV.mor===undefined)SV.mor=60;
  if(!SV.alerts)SV.alerts=[];
  if(!SV.news)SV.news=[];if(!SV.hist)SV.hist=[];if(!SV.hof)SV.hof=[];if(!SV.rec)SV.rec={};if(!SV.troph)SV.troph={};if(!SV.former)SV.former=[];
  if(!SV.story)SV.story=[];
  if(!SV.lg&&SV.sched&&SV.mem){leagueBegin();leagueAdvance();}   // salvataggi di prima: le altre serie ripartono da dove e' arrivata la tua stagione
  if(SV.riv===undefined&&SV.mem&&SV.sched)pickRival();
  if(SV.goalsS!==SV.season&&SV.sched&&SV.cash!==undefined){goalsAssign();}   // carriere gia' avviate: gli obiettivi personali partono subito
  if(SV.autoSub===undefined)SV.autoSub=true;
  if(!SV.lineO||!SV.lineD)autoLines();fixLines();
  if(!SV.obj&&SV.tab)setObjective();
  if(!SV.sp&&SV.obj)spDefault();   // salvataggi di prima: un contratto equilibrato gia' firmato; dalla stagione dopo si sceglie
  if(!SV.red)SV.red={n:0,w:0};if(!SV.fin)SV.fin=[];
  if(!SV.fa)SV.fa=[];if(!SV.abroad)SV.abroad=[];   // svincolati veri e chi e' arrivato dall'estero (33-mercato-veri.js)
  if(!SV.market||SV.mkStars!==3){buildMarket();SV.mkStars=3;}   // 3: mercato di giocatori veri
  leagueAnchors();
  for(const p of SQ)retAnchor(p);
  coachInit();staffInit();
  if(!SV.ach){SV.ach={};if(SV.sched&&SV.mem)achCheck(true);}   // traguardi: quelli gia' raggiunti da una carriera vecchia si segnano senza premio
  achMigrate();
  if(!SV.alb)SV.alb=[];
  if(!SV.lifeV){SV.lifeV=1;if(SV.sched)retireCheck('start');}   // anche le carriere gia' avviate ricevono subito i primi avvisi
  wageWarn();   // inizio carriera: conti a rischio con la rosa di partenza (solo prima della prima giornata)
}
function news(txt){SV.news.unshift({s:SV.season,r:(SV.round|0)+1,txt});if(SV.news.length>40)SV.news.length=40;}

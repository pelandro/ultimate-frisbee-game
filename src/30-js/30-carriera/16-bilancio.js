/* ---- BILANCIO PREVISIONALE ----
   Che cosa succede ai conti da qui alla fine del campionato: incassi attesi (con la probabilita' di vincere ogni partita che resta, la stessa scala delle
   partite simulate), stipendi, manutenzione e staff, premio di classifica alla posizione di adesso e premio dell'obiettivo se oggi sarebbe raggiunto.
   Serve a decidere un acquisto o una struttura sapendo quanto resta dopo. E' una stima, non una promessa. */
function budgetForecast(){
  const out={left:0,inc:0,gate:0,rent:0,spon:0,wb:0,trv:0,wage:0,up:0,stf:0,prize:0,obj:0,now:SV.cash,winP:0};
  if(SV.event==='eu'||!SV.sched||SV.done)return out;
  const names=SV.mem[SV.sr],ui=names.indexOf(SV.team),me=matchPow(SV.team)+teamFormB()*0.8,pr=tixPrice(),cap=stadCap();
  let pw=0;
  const rest=[];   // le partite che restano: avversaria e dove si gioca
  if(isUS()&&SV.us.ph==='reg'){   // USA: giornate di Conference e interregionali nel loro ordine (US_CAL), casa e trasferta si alternano a ogni partita
    let nc=SV.round,nx=SV.us.xn|0,k=SV.sgp|0;
    for(let i=SV.us.ci|0;i<US_CAL.length;i++,k++){
      if(US_CAL[i]==='c'){const pa=SV.sched[nc]&&SV.sched[nc].find(m=>m[0]===ui||m[1]===ui);nc++;if(pa)rest.push([names[pa[0]===ui?pa[1]:pa[0]],venueAlt(k)]);}
      else{const o=usCrossOpp(nx++);if(o)rest.push([o,venueAlt(k)]);}
    }
  }else for(let r=SV.round;r<SV.sched.length;r++){
    const pa=SV.sched[r].find(m=>m[0]===ui||m[1]===ui);if(!pa)continue;
    rest.push([names[pa[0]===ui?pa[1]:pa[0]],venueAlt(r)]);
  }
  const nReg=regularGames();
  for(const [on,v] of rest){
    const edge=tacticPlan({name:on,roster:SV.rost[on]}).edge;
    const diff=me+edge-matchPow(on)-carDiff().plus+(SIM_DIFF[carDiff().ai|0]||0);
    const p=matchWinP(simPointP(diff),carLen());
    out.rent+=stadiumRent((SV.sgp|0)+out.left,nReg);
    out.left++;pw+=p;
    if(v==='H'){const d=demandExp(on);out.gate+=Math.min(cap,d)*pr;}else out.trv+=travelCost();
    out.spon+=SV.sp?SV.sp.fix:0;out.wb+=p*winBonus({name:on},v).v;
  }
  out.winP=out.left?pw/out.left:0;
  out.inc=Math.round(out.gate+out.rent+out.spon+out.wb);out.gate=Math.round(out.gate);out.wb=Math.round(out.wb);
  out.wage=wageBill()*out.left;out.up=facUpkeep()*out.left;
  out.stf=Object.keys(STAFF).reduce((a,k)=>a+staffRemaining(k,out.left),0);
  const n=names.length,rank=myRank();
  out.prize=Math.round((n-rank+1)*3*SR_K[SV.sr]);out.rank=rank;
  out.obj=objMet(rank)?SV.obj.reward:0;
  if(isLN()){out.prize=Math.round(Math.max(1,names.length-rank+1)*3*SR_K[SV.sr]);}   // leghe europee: come in Italia, secondo la posizione nel girone
  if(isUS()){const st=usExpectStage(rank);out.prize=Math.round(US_PRIZE[st]*SR_K.U);out.obj=SV.obj&&st>=SV.obj.lvl&&(!SV.obj.cr||rank<=SV.obj.cr)?SV.obj.reward:0;}   // USA: il premio dipende da quanto si va avanti, non dalla classifica
  out.end=Math.round(SV.cash+out.inc-out.trv-out.wage-out.up-out.stf);   // saldo all'ultima giornata (quello che guarda la sfida «Conti in ordine»)
  out.after=out.end+out.prize+out.obj;                          // dopo i premi di fine stagione
  return out;
}
function budgetHTML(){
  const f=budgetForecast(),sg=v=>(v>=0?'+':'−')+Math.abs(Math.round(v));
  if(!f.left)return `<div class="ccard"><h3>Bilancio previsionale</h3><p>${SV.event==='eu'?'Si calcola durante il campionato.':(isUS()&&!SV.done?'Stagione regolare conclusa: restano i Play-in e i Nationals.':(isLN()&&!SV.done?'Gironi conclusi: restano le fasi finali.':'Campionato concluso: i conti ripartono con la nuova stagione.'))}</p></div>`;
  const row=(l,v,c)=>`<div class="bgr${c?' '+c:''}"><span>${l}</span><b>${v}</b></div>`;
  return `<div class="ccard"><h3>Bilancio previsionale</h3><p>Da qui alla fine del campionato: ${f.left} ${f.left>1?'partite':'partita'}, con circa il ${Math.round(f.winP*100)}% di vittorie attese.</p>`+
    row('Saldo',f.now)+row('Biglietti attesi',sg(f.gate))+(f.rent?row('Affitti dell’impianto',sg(f.rent)):'')+row('Sponsor',sg(f.spon))+row('Premi vittoria attesi',sg(f.wb))+row('Trasferte',sg(-f.trv))+row('Stipendi giocatori',sg(-f.wage))+(f.up?row('Manutenzione',sg(-f.up)):'')+row('Stipendi staff',sg(-f.stf))+
    row('Saldo all’ultima giornata',f.end,f.end<0?'bad':'tot')+row(`Premio di classifica (da ${f.rank}°)`,sg(f.prize))+row('Bonus dello sponsor'+(f.obj?'':' (oggi mancato)'),sg(f.obj))+
    row('Dopo i premi',f.after,f.after<0?'bad':'tot')+
    `<p>${f.end<0?'<b>Attenzione</b>: a questo ritmo finisci in rosso prima dei premi (niente acquisti e morale in calo). ':''}È una stima: cambia con i risultati, gli acquisti e le strutture.</p></div>`;
}
// AVVISO D'INIZIO STAGIONE: se le previsioni dicono che con questa rosa la cassa va sotto zero prima dei premi di fine stagione, la dirigenza lo scrive
// subito nella Posta (una volta per stagione, SV.wWarn), invece di accorgersene a meta' campionato con il mercato gia' fermo
function wageWarn(){
  if(!SV||SV.cash===undefined||SV.wWarn===SV.season||!SQ.length||(SV.round|0)>0||SV.event==='eu')return;
  let f;try{f=budgetForecast();}catch(e){return;}
  if(!f.left||f.end>=0)return;
  SV.wWarn=SV.season;
  const lots=SQ.length>WAGE_FULL+2;
  alertAdd('dir',`Previsioni dei conti: a questo ritmo la stagione chiude in rosso, con la cassa intorno a ${f.end} crediti all’ultima giornata (prima dei premi). ${f.wage>f.inc?`Con ${lots?'una rosa di '+SQ.length+' giocatori ':'questa rosa '}gli stipendi (circa ${wageBill()} a partita) costano più di quanto entra dalle partite.`:'Le spese previste superano ciò che resta in cassa e che entrerà.'} Con i conti sotto zero il mercato si ferma e il morale cala: ${lots?'valuta di cedere qualche riserva (le prime cessioni rendono di più).':'valuta una cessione o rimanda le spese.'}`);
}

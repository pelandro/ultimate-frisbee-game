/* ---- BILANCIO PREVISIONALE ----
   Che cosa succede ai conti da qui alla fine del campionato: incassi attesi (con la probabilita' di vincere ogni partita che resta, la stessa scala delle
   partite simulate), stipendi, manutenzione e staff, premio di classifica alla posizione di adesso e premio dell'obiettivo se oggi sarebbe raggiunto.
   Serve a decidere un acquisto o una struttura sapendo quanto resta dopo, e quanto rende un investimento (budgetPayback). E' una stima, non una promessa. */
function budgetForecast(){
  const out={left:0,inc:0,wage:0,up:0,prize:0,obj:0,now:SV.cash,winP:0};
  if(SV.event==='eu'||!SV.sched||SV.done)return out;
  const names=SV.mem[SV.sr],ui=names.indexOf(SV.team),me=squadPower()+teamFormB()*0.8,iw=matchIncome(true),il=matchIncome(false);
  let pw=0;
  for(let r=SV.round;r<SV.sched.length;r++){
    const pr=SV.sched[r].find(m=>m[0]===ui||m[1]===ui);if(!pr)continue;
    const on=names[pr[0]===ui?pr[1]:pr[0]],p=matchWinP(simPointP(me-(teamPow(on)+carDiff().plus)+(SIM_DIFF[carDiff().ai|0]||0)),carLen());
    out.left++;pw+=p;out.inc+=il+p*(iw-il);
  }
  out.winP=out.left?pw/out.left:0;
  out.wage=wageBill()*out.left;out.up=(facUpkeep()+staffWage())*out.left;
  const n=names.length,rank=myRank();
  out.prize=Math.round((n-rank+1)*3*SR_K[SV.sr]);out.rank=rank;
  out.obj=SV.obj&&rank<=SV.obj.tgt?SV.obj.reward:0;
  out.inc=Math.round(out.inc);
  out.end=Math.round(SV.cash+out.inc-out.wage-out.up);          // saldo all'ultima giornata (quello che guarda la sfida «Conti in ordine»)
  out.after=out.end+out.prize+out.obj;                          // dopo i premi di fine stagione
  return out;
}
// in quante partite una struttura ripaga il suo prossimo livello (solo quelle che portano crediti: le Tribune). null = non si ripaga in crediti
function budgetPayback(k){
  if(k!=='stad'||facLv(k)>=FAC_MAX)return null;
  const f=budgetForecast(),base=(matchIncome(false)+f.winP*(matchIncome(true)-matchIncome(false)))/(1+0.07*facLv('stad'));
  const gain=base*0.07-((facLv(k)+1)*(facLv(k)+2)/2-facLv(k)*(facLv(k)+1)/2)*0.25;   // incasso in piu' a partita, meno la manutenzione in piu'
  return gain>0.05?{gain,n:Math.ceil(facCost(k)/gain)}:{gain,n:0};
}
function budgetHTML(){
  const f=budgetForecast(),sg=v=>(v>=0?'+':'−')+Math.abs(Math.round(v));
  if(!f.left)return `<div class="ccard"><h3>Bilancio previsionale</h3><p>${SV.event==='eu'?'Si calcola durante il campionato.':'Campionato concluso: i conti ripartono con la nuova stagione.'}</p></div>`;
  const row=(l,v,c)=>`<div class="bgr${c?' '+c:''}"><span>${l}</span><b>${v}</b></div>`;
  return `<div class="ccard"><h3>Bilancio previsionale</h3><p>Da qui alla fine del campionato: ${f.left} ${f.left>1?'partite':'partita'}, con circa il ${Math.round(f.winP*100)}% di vittorie attese.</p>`+
    row('Crediti adesso',f.now)+row('Incassi attesi',sg(f.inc))+row('Stipendi',sg(-f.wage))+row('Manutenzione e staff',sg(-f.up))+
    row('Saldo all’ultima giornata',f.end,f.end<0?'bad':'tot')+row(`Premio di classifica (da ${f.rank}°)`,sg(f.prize))+row('Premio dell’obiettivo'+(f.obj?'':' (oggi mancato)'),sg(f.obj))+
    row('Dopo i premi',f.after,f.after<0?'bad':'tot')+
    `<p>${f.end<0?'<b>Attenzione</b>: a questo ritmo finisci in rosso prima dei premi (niente acquisti e morale in calo). ':''}È una stima: cambia con i risultati, gli acquisti e le strutture.</p></div>`;
}

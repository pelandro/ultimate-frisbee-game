/* ---- DIAGNOSTICA: TEST DELLA CARRIERA ----
   Gioca molte stagioni di seguito su una carriera di prova, con partite simulate, allenamenti, strutture e imprevisti, e controlla che nulla
   vada fuori scala (statistiche, condizione, crediti, rosa, strutture, livello del campionato). La carriera vera non viene toccata:
   durante il test QM.on blocca il salvataggio (persist) e alla fine si rimette la carriera com'era. Seme fisso: risultati ripetibili. */
function careerSelfTest(seasons,seed){
  const bak=hasCareer()?(persist(),JSON.stringify(SV)):null,R0=Math.random,q0=QM.on,rows=[],row=(name,val,ok,note)=>({name,val,ok:!!ok,note:note||''});
  Math.random=mulberry32(seed||2026);QM.on=true;
  const hide=()=>{for(const id of ['simres','alerts','evt'])$(id).classList.add('hidden');};
  let err='',bad=[],inj=0,evts=0,champ=0,promo=0,seasonsDone=0,cashMax=-1e9,cashMin=1e9,pw=[],maxed=0,worn=0,keep=0;
  try{
    startCareer(SERIES.C[2]);
    for(let s=1;s<=seasons;s++){
      for(let r=0;r<40&&!SV.done;r++){
        const avg=SQ.reduce((x,p)=>x+p.cond,0)/SQ.length;
        if(trainOpen()&&!SV.tTeam){
          SV.tInt=avg>82?2:(avg>66?1:0);
          const opt=avg<58?TR_OPTS.find(c=>c.id==='rec'):TR_OPTS[r%4];
          for(const p of SQ)if(!p.inj||opt.id==='rec')trainApply(p,opt,false);SV.tTeam=true;
        }
        for(const k of Object.keys(FAC).sort((x,y)=>facCost(x)-facCost(y)))if(SV.cash>facCost(k)+60&&facLv(k)<FAC_MAX){buyFac(k);break;}
        const a0=SV.alN|0;simCareerMatch();hide();
        inj+=(SV.alerts||[]).filter(a=>a.id>a0&&a.k==='inj').length;   // gli infortuni di questa giornata (in partita e in allenamento)
        if(SV.evt){evts++;const e=SV.evt,ops=EVT[e.id].o(e.a),ok=ops.map((o,i)=>(!o[2]||o[2]())?i:-1).filter(i=>i>=0);evtAnswer(ok[Math.floor(Math.random()*ok.length)]);}
        cashMax=Math.max(cashMax,SV.cash);cashMin=Math.min(cashMin,SV.cash);
        // ogni giornata: niente valori impossibili
        for(const p of SQ){if(!isFinite(ovrX(p))||KEYS.some(k=>!(p.s[k]>=25&&p.s[k]<=99))||!(p.cond>=0&&p.cond<=100))bad.push(`S${s}: ${pname(p)}`);}
        if(SQ.length<7||SQ.length>28||SV.lineO.length!==7||SV.lineD.length!==7)bad.push(`S${s}: rosa o linee non valide (${SQ.length})`);
        if(Object.keys(FAC).some(k=>facLv(k)<0||facLv(k)>FAC_MAX))bad.push(`S${s}: livello di una struttura fuori scala`);
        if(!isFinite(SV.cash))bad.push(`S${s}: crediti non validi`);
      }
      if(!SV.done){bad.push(`S${s}: la stagione non finisce`);break;}
      if(SV.sr==='A'&&SV.next.rank===1)champ++;if(SV.next.sr<SV.sr)promo++;
      pw.push(squadPower());
      const n0=SV.news.length;newSeason();hide();seasonsDone++;
      worn+=SV.news.filter(x=>/Usura estiva/.test(x.txt)&&x.s===SV.season).length;keep+=SV.news.filter(x=>/Premi di mantenimento/.test(x.txt)&&x.s===SV.season).length;
      for(const a of SV.alerts)a.seen=1;
    }
    maxed=SQ.filter(p=>ovrX(p)>=90).length/Math.max(1,SQ.length);
    const others=Object.values(SV.rost).filter(r=>r&&r.length).map(r=>rosterPower(r));
    rows.push(row('Stagioni giocate fino in fondo',seasonsDone+' su '+seasons,seasonsDone===seasons));
    rows.push(row('Valori sempre validi (statistiche, condizione, rosa, linee, strutture, crediti)',bad.length?bad.slice(0,3).join('; '):'sì',!bad.length));
    rows.push(row('Forza della squadra nelle stagioni',pw.map(v=>v.toFixed(0)).join(' → '),pw.every(v=>v>=35&&v<=97),'tra 35 e 97'));
    rows.push(row('Giocatori della rosa con Overall 90 o più alla fine',Math.round(maxed*100)+'%',maxed<=0.5,'al massimo metà: la crescita non deve appiattire tutti'));
    rows.push(row('Forza delle altre squadre',Math.min(...others).toFixed(0)+'–'+Math.max(...others).toFixed(0),Math.min(...others)>=30&&Math.max(...others)<=95,'tra 30 e 95'));
    rows.push(row('Crediti: minimo e massimo',Math.round(cashMin)+' e '+Math.round(cashMax),cashMin>=-300&&cashMax<=6000,'né bancarotta né accumulo senza limiti'));
    rows.push(row('Infortuni per stagione (partite simulate)',(inj/Math.max(1,seasonsDone)).toFixed(1),inj/Math.max(1,seasonsDone)>=0.3&&inj/Math.max(1,seasonsDone)<=12,'tra 0,3 e 12'));
    rows.push(row('Imprevisti per stagione',(evts/Math.max(1,seasonsDone)).toFixed(1),evts/Math.max(1,seasonsDone)>=0.4&&evts/Math.max(1,seasonsDone)<=4,'tra 0,4 e 4'));
    rows.push(row('Scudetti e promozioni',champ+' e '+promo,champ<=Math.ceil(seasons*0.6),'nessun dominio automatico'));
    rows.push(row('Premi di mantenimento e usura estiva',keep+' e '+worn,true));
  }catch(e){err=e&&e.message||String(e);rows.push(row('Errore durante il test',err,false));}
  finally{
    Math.random=R0;QM.on=q0;hide();
    if(bak){SV={};loadSave(JSON.parse(bak));}else{SV={};initTeams();}
    lookKey='x';G.inMatch=false;
  }
  return rows;
}
function runCareerDiag(seasons){
  if(diagBusy)return;diagBusy=true;
  $('dgOut').innerHTML='';$('dgState').textContent=`Carriera di prova: ${seasons} stagioni…`;
  setTimeout(()=>{
    const rows=careerSelfTest(seasons,2026),ok=rows.filter(r=>r.ok).length;diagBusy=false;
    $('dgOut').innerHTML=`<div class="ccard" style="margin-bottom:6px"><h3>Carriera di ${seasons} stagioni</h3><ul class="nlist">${rows.map(r=>`<li><i style="color:${r.ok?'var(--good)':'var(--bad)'}">${r.ok?'OK':'NO'}</i>${esc(r.name)}: <b style="color:#fff;font-weight:400">${esc(r.val)}</b>${r.note?` <small>(${esc(r.note)})</small>`:''}</li>`).join('')}</ul></div>`;
    $('dgState').textContent=`Finito: ${ok} controlli superati su ${rows.length}.`;
  },60);
}
$('dgCar').addEventListener('click',()=>runCareerDiag(12));

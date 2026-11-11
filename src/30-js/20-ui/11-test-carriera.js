/* ---- DIAGNOSTICA: TEST DELLA CARRIERA ----
   Gioca molte stagioni di seguito su una carriera di prova, con partite simulate, allenamenti, strutture e imprevisti, e controlla che nulla
   vada fuori scala (statistiche, condizione, crediti, rosa, strutture, livello del campionato). La carriera vera non viene toccata:
   durante il test QM.on blocca il salvataggio (persist) e alla fine si rimette la carriera com'era. Seme fisso: risultati ripetibili. */
function careerSelfTest(seasons,seed){
  const bak=hasCareer()?(persist(),JSON.stringify(SV)):null,R0=Math.random,q0=QM.on,rows=[],row=(name,val,ok,note)=>({name,val,ok:!!ok,note:note||''});
  Math.random=mulberry32(seed||2026);QM.on=true;talentGrow.n=0;
  const hide=()=>{for(const id of ['simres','alerts','evt'])$(id).classList.add('hidden');};
  let lgBad=[],stories=0,derby=0,spec=0,goalsOk=0,goalsKo=0,duoMax=0,err='',bad=[],inj=0,evts=0,champ=0,promo=0,seasonsDone=0,cashMax=-1e9,cashMin=1e9,pw=[],maxed=0,worn=0,keep=0,signed=0;
  try{
    startCareer(SERIES.C[2]);
    // gerarchie di inizio carriera: calcolate con la rosa scelta, non con quella rimasta in memoria
    const eo0=SV.mem[SV.sr].slice().sort((a,b)=>teamPow(b)-teamPow(a)),expOk=!!SV.expOrd&&SV.expOrd.indexOf(SV.team)===eo0.indexOf(SV.team);
    // sfida «Conti in ordine»: deve essere giudicata prima dei premi di fine stagione (SV.next nasce subito dopo il giudizio e prima dei premi)
    const bilOk0=BCHAL.bil.ok;let chalWhen=[];BCHAL.bil.ok=c=>{chalWhen.push(SV.next?'dopo':'prima');return bilOk0(c);};
    for(let s=1;s<=seasons;s++){
      if(s%2===0&&!SV.chal)SV.chal={id:'bil',base:SV.cash,x:30,reward:10};   // a stagioni alterne una sfida economica, per controllarne il giudizio
      for(let r=0;r<40&&!SV.done;r++){
        const avg=SQ.reduce((x,p)=>x+p.cond,0)/SQ.length;
        if(trainOpen()&&!SV.tTeam){
          SV.tInt=avg>82?2:(avg>66?1:0);
          const opt=avg<58?TR_OPTS.find(c=>c.id==='rec'):TR_OPTS[r%4];
          for(const p of SQ)if(!p.inj||opt.id==='rec')trainApply(p,opt,false);SV.tTeam=true;
        }
        if(r===0&&s>1){   // come farebbe chi gioca: ogni estate rinnova la rosa con giovani promesse e libera il posto ai piu' anziani
          for(let n=0;n<2&&SQ.length<20;n++){let bi=-1,bs=-1;(SV.market||[]).forEach((m,i)=>{if(canSign(m)||m.o.age>24)return;const v=potX(m.o);if(v>bs){bs=v;bi=i;}});if(bi>=0){signPlayer(bi);signed++;}}
          while(SQ.length>16){const old=SQ.map((p,i)=>[p,i]).sort((a,b)=>(b[0].age-a[0].age)||(ovrX(a[0])-ovrX(b[0])))[0];if(!sellPlayer(old[1]))break;}
        }
        for(const k of Object.keys(FAC).sort((x,y)=>facCost(x)-facCost(y)))if(SV.cash>facCost(k)+60&&facLv(k)<FAC_MAX){buyFac(k);break;}
        for(const k of Object.keys(STAFF))if(SV.cash>staffCost(k)+90&&staffLv(k)<STAFF_MAX){buyStaff(k);break;}   // staff e indirizzi personali: si comprano quando c'e' margine
        for(const p of SQ)if(!p.spec&&p.age<=26&&SV.cash>specCost(p)+120){setSpec(p,Object.keys(SPECS)[Math.floor(Math.random()*6)]);spec++;break;}
        duoMax=Math.max(duoMax,...Object.values(SV.duo||{}),0);
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
      for(const sr in SV.lg){const L=SV.lg[sr],w=Object.values(L.tab).reduce((a,x)=>a+x.w,0),l=Object.values(L.tab).reduce((a,x)=>a+x.l,0);if(L.round!==L.sched.length||w!==l)lgBad.push(`S${s} ${sr}: giornate ${L.round}/${L.sched.length}, V ${w} S ${l}`);}
      stories+=SV.story.filter(x=>x.s===SV.season).length;derby+=((SV.rivRec&&SV.rivRec.w)|0)+((SV.rivRec&&SV.rivRec.l)|0);
      for(const p of SQ)if(p.goal&&p.goal.s===SV.season){if(goalOk(p))goalsOk++;else goalsKo++;}
      if(SV.sr==='A'&&SV.next.rank===1)champ++;if(SV.next.sr<SV.sr)promo++;
      pw.push(squadPower());
      const n0=SV.news.length;newSeason();hide();seasonsDone++;
      worn+=SV.news.filter(x=>/Usura estiva/.test(x.txt)&&x.s===SV.season).length;keep+=SV.news.filter(x=>/Premi di mantenimento/.test(x.txt)&&x.s===SV.season).length;
      for(const a of SV.alerts)a.seen=1;
    }
    maxed=SQ.filter(p=>ovrX(p)>=90).length/Math.max(1,SQ.length);
    const top7=pickSeven(SQ,p=>p.role,mean9);let atCap=0,nst=0,ageS=0;for(const p of top7){ageS+=p.age;for(const k of KEYS){nst++;if(p.s[k]>=capOf(p,k)-1)atCap++;}}
    const capRow=Math.round(100*atCap/Math.max(1,nst))+'% al massimo, età media '+(ageS/Math.max(1,top7.length)).toFixed(1);
    const others=Object.values(SV.rost).filter(r=>r&&r.length).map(r=>rosterPower(r));
    BCHAL.bil.ok=bilOk0;
    rows.push(row('Gerarchie di inizio carriera calcolate con la rosa scelta',expOk?'sì':'no',expOk));
    rows.push(row('Sfida «Conti in ordine» giudicata prima dei premi',chalWhen.length?(chalWhen.every(x=>x==='prima')?'sì':'no')+' ('+chalWhen.length+' volte)':'mai capitata',chalWhen.length>0&&chalWhen.every(x=>x==='prima')));
    rows.push(row('Stagioni giocate fino in fondo',seasonsDone+' su '+seasons,seasonsDone===seasons));
    rows.push(row('Valori sempre validi (statistiche, condizione, rosa, linee, strutture, crediti)',bad.length?bad.slice(0,3).join('; '):'sì',!bad.length));
    rows.push(row('Forza della squadra nelle stagioni',pw.map(v=>v.toFixed(0)).join(' → '),pw.every(v=>v>=35&&v<=97),'tra 35 e 97'));
    rows.push(row('I 7 migliori: statistiche al massimo del talento',capRow,true,'informativo: se quasi tutto è al massimo la crescita si ferma'));
    {const L=pw.length,m=x=>x.reduce((a,v)=>a+v,0)/Math.max(1,x.length);
    rows.push(row('Dopo 10 stagioni la forza non crolla né si ferma del tutto (media delle ultime 5 contro le stagioni 8-10)',L>=16?m(pw.slice(-5)).toFixed(1)+' contro '+m(pw.slice(7,10)).toFixed(1):'serve un test da 16 stagioni',L<16||m(pw.slice(-5))>=m(pw.slice(7,10))-1,'rinnovando la rosa non si scende; con i giovani giusti si continua a salire'));}
    rows.push(row('Giocatori della rosa con Overall 90 o più alla fine',Math.round(maxed*100)+'%',maxed<=0.5,'al massimo metà: la crescita non deve appiattire tutti'));
    rows.push(row('Forza delle altre squadre',Math.min(...others).toFixed(0)+'–'+Math.max(...others).toFixed(0),Math.min(...others)>=30&&Math.max(...others)<=99,'tra 30 e 99'));
    rows.push(row('Crediti: minimo e massimo',Math.round(cashMin)+' e '+Math.round(cashMax),cashMin>=-300&&cashMax<=6000,'né bancarotta né accumulo senza limiti'));
    rows.push(row('Infortuni per stagione (partite simulate)',(inj/Math.max(1,seasonsDone)).toFixed(1),inj>=1&&inj/Math.max(1,seasonsDone)<=12,'almeno uno in tutto il test, al massimo 12 a stagione (la squadra del test si riposa quasi sempre: ne servono pochi)'));
    rows.push(row('Imprevisti per stagione',(evts/Math.max(1,seasonsDone)).toFixed(1),evts/Math.max(1,seasonsDone)>=0.4&&evts/Math.max(1,seasonsDone)<=4,'tra 0,4 e 4'));
    rows.push(row('Scudetti e promozioni',champ+' e '+promo,champ<=Math.ceil(seasons*0.6),'nessun dominio automatico'));
    rows.push(row('Premi di mantenimento e usura estiva',keep+' e '+worn,true));
    rows.push(row('Altre serie: tutte le giornate giocate, vittorie = sconfitte',lgBad.length?lgBad.slice(0,2).join('; '):'sì',!lgBad.length));
    rows.push(row('Storie dal campionato per stagione',(stories/Math.max(1,seasonsDone)).toFixed(1),stories/Math.max(1,seasonsDone)>=2,'almeno 2'));
    rows.push(row('Derby giocati nelle stagioni',String(derby),derby>=seasons*0.5,'almeno uno ogni due stagioni'));
    rows.push(row('Obiettivi personali raggiunti e mancati',goalsOk+' e '+goalsKo,goalsOk+goalsKo>=seasons&&goalsOk>0&&goalsKo>0,'né tutti né nessuno'));
    rows.push(row('Intesa massima tra due giocatori (partite insieme)',String(duoMax),duoMax>=6&&duoMax<=DUO_FULL*2));
    rows.push(row('Giocatori che hanno superato il proprio limite (maturità)',String(talentGrow.n|0),(talentGrow.n|0)>=1,'almeno uno in tutto il test'));
    rows.push(row('Giovani promesse ingaggiate nel test',String(signed),true));
    rows.push(row('Indirizzi personali assegnati nel test',String(spec),spec>=1));
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

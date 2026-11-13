/* ---- DIAGNOSTICA: TEST DELLA CARRIERA ----
   Gioca molte stagioni di seguito su una carriera di prova, con partite simulate, allenamenti, strutture e imprevisti, e controlla che nulla
   vada fuori scala (statistiche, condizione, crediti, rosa, strutture, livello del campionato). La carriera vera non viene toccata:
   durante il test QM.on blocca il salvataggio (persist) e alla fine si rimette la carriera com'era. Seme fisso: risultati ripetibili. */
function careerSelfTest(seasons,seed){
  const bak=hasCareer()?(persist(),JSON.stringify(SV)):null,R0=Math.random,q0=QM.on,rows=[],row=(name,val,ok,note)=>({name,val,ok:!!ok,note:note||''});
  Math.random=mulberry32(seed||2026);QM.on=true;talentGrow.n=0;
  const hide=()=>{for(const id of ['simres','alerts','evt'])$(id).classList.add('hidden');};
  let lgBad=[],stories=0,derby=0,spec=0,goalsOk=0,goalsKo=0,duoMax=0,err='',bad=[],inj=0,evts=0,champ=0,promo=0,seasonsDone=0,cashMax=-1e9,cashMin=1e9,pw=[],maxed=0,worn=0,keep=0,signed=0,poDays=0,poTit=0,sizeBad=[],sz0=null;
  try{
    startCareer(SERIES.C[2]);
    sz0={A:SV.mem.A.length,B:SV.mem.B.length,C:SV.mem.C.length};
    // gerarchie di inizio carriera: calcolate con la rosa scelta, non con quella rimasta in memoria
    const eo0=SV.mem[SV.sr].slice().sort((a,b)=>teamPow(b)-teamPow(a)),expOk=!!SV.expOrd&&SV.expOrd.indexOf(SV.team)===eo0.indexOf(SV.team);
    // sfida «Conti in ordine»: deve essere giudicata prima dei premi di fine stagione (SV.next nasce subito dopo il giudizio e prima dei premi)
    const bilOk0=BCHAL.bil.ok;let chalWhen=[],lsChk=[],anc0=null;BCHAL.bil.ok=c=>{chalWhen.push(SV.next?'dopo':'prima');return bilOk0(c);};
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
        for(const k of Object.keys(STAFF)){   // staff: si assume il migliore che ci si puo' permettere nei ruoli vacanti, poi si migliora; indirizzi personali: quando c'e' margine
          if(staffLv(k)<1||!stPerson(k)){const cs=staffCands(k);let b=-1;for(let i=0;i<cs.length;i++)if(SV.cash>STAFF_HIRE[cs[i].lv]+90)b=i;if(b>=0){staffHire(k,b);break;}}
          else if(SV.cash>staffCost(k)+90&&buyStaff(k))break;
        }
        for(const p of SQ)if(!p.spec&&p.age<=26&&SV.cash>specCost(p)+120){setSpec(p,Object.keys(SPECS)[Math.floor(Math.random()*6)]);spec++;break;}
        duoMax=Math.max(duoMax,...Object.values(SV.duo||{}),0);
        if(SV.po&&SV.po.on)poDays++;
        const a0=SV.alN|0;simCareerMatch();hide();
        inj+=(SV.alerts||[]).filter(a=>a.id>a0&&a.k==='inj').length;   // gli infortuni di questa giornata (in partita e in allenamento)
        if(SV.evt){evts++;const e=SV.evt,ops=EVT[e.id].o(e.a),ok=ops.map((o,i)=>(!o[2]||o[2]())?i:-1).filter(i=>i>=0);evtAnswer(ok[Math.floor(Math.random()*ok.length)]);}
        cashMax=Math.max(cashMax,SV.cash);cashMin=Math.min(cashMin,SV.cash);
        // ogni giornata: niente valori impossibili
        for(const p of SQ){if(!isFinite(ovrX(p))||KEYS.some(k=>!(p.s[k]>=25&&p.s[k]<=99))||!(p.cond>=0&&p.cond<=100))bad.push(`S${s}: ${pname(p)}`);}
        if(!(fansOf()>=0&&fansOf()<=100)||!isFinite(fansOf()))bad.push(`S${s}: tifosi fuori scala`);
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
      if(SV.next&&SV.next.tit&&SV.sr==='A')poTit++;
      {const nxt=SV.next.mem,all=[].concat(nxt.A,nxt.B,nxt.C);if(nxt.A.length!==sz0.A||nxt.B.length!==sz0.B||nxt.C.length!==sz0.C||new Set(all).size!==all.length)sizeBad.push('S'+s);}   // promozioni e retrocessioni (anche dopo i playoff): nessuna squadra persa o doppia
      // statistiche individuali del girone: le mete dei giocatori di una squadra avversaria devono tornare con quelle in classifica (salvo chi e' stato ceduto durante l'anno)
      {const on=SV.mem[SV.sr].find(n=>n!==SV.team),sg=(SV.rost[on]||[]).reduce((a,o)=>a+(o.ss?o.ss.g:0),0),pf=SV.tab[on].pf;lsChk.push(lsLive()&&sg<=pf&&sg>=pf*0.8);}
      if(s===1)anc0=Object.assign({},SV.anc||{});
      const n0=SV.news.length;newSeason();hide();seasonsDone++;
      worn+=SV.news.filter(x=>/Usura estiva/.test(x.txt)&&x.s===SV.season).length;keep+=SV.news.filter(x=>/Premi di mantenimento/.test(x.txt)&&x.s===SV.season).length;
      for(const a of SV.alerts)a.seen=1;
    }
    maxed=SQ.filter(p=>ovrX(p)>=90).length/Math.max(1,SQ.length);
    const top7=pickSeven(SQ,p=>p.role,mean9);let atCap=0,nst=0,ageS=0;for(const p of top7){ageS+=p.age;for(const k of KEYS){nst++;if(p.s[k]>=capOf(p,k)-1)atCap++;}}
    const capRow=Math.round(100*atCap/Math.max(1,nst))+'% al massimo, età media '+(ageS/Math.max(1,top7.length)).toFixed(1);
    const others=Object.values(SV.rost).filter(r=>r&&r.length).map(r=>rosterPower(r));
    BCHAL.bil.ok=bilOk0;
    // tifosi: una vittoria li alza piu' di quanto una sconfitta li abbassi con Tribune alte, e a parita' di risultato le Tribune aiutano
    {const st0=SV.fac.stad,f0=SV.fans,bump=(lv,win)=>{SV.fac.stad=lv;SV.fans=50;fansBump(win);return SV.fans-50;};
     const w0=bump(0,true),w5=bump(5,true),l0=bump(0,false),l5=bump(5,false);SV.fac.stad=st0;SV.fans=f0;
     const ok=w5>w0&&l5>l0&&l5<=0&&l0<-1&&w0>1;
     rows.push(row('Tifosi: vittoria e sconfitta con Tribune al livello 0 e al livello 5',`+${w0.toFixed(1)}/${l0.toFixed(1)} e +${w5.toFixed(1)}/${l5.toFixed(1)}`,ok,'le Tribune alzano le vittorie e ammorbidiscono le sconfitte'));}
    // programma automatico, bilancio previsionale, storico dei progressi (la stagione nuova e' appena cominciata: c'e' una sessione disponibile)
    SV.prog={on:true,team:'auto'};for(const p of SQ)p.tr=false;SV.tTeam=false;SV.played=0;
    const at=autoTrain(),progOk=!!at&&SV.tTeam&&SQ.filter(p=>p.tr).length===Math.min(3,SQ.length)&&autoTrain()===null;
    const bf=budgetForecast(),bOk=isFinite(bf.end)&&bf.left===SV.sched.length-SV.round&&bf.end===Math.round(SV.cash+bf.inc-bf.wage-bf.up)&&bf.winP>0&&bf.winP<1&&bf.after===bf.end+bf.prize+bf.obj;
    const hOk=seasons<3||(SQ.some(p=>(p.hist||[]).length>=2)&&SQ.every(p=>(p.hist||[]).length<=14));
    rows.push(row('Programma automatico: fa la seduta di squadra e i 3 lavori individuali, una volta sola',progOk?'sì':'no'+(at?'':' (non parte)'),progOk));
    rows.push(row('Bilancio previsionale: partite rimaste, vittorie attese e saldo finale coerenti',bOk?`sì (${bf.left} partite, ${Math.round(bf.winP*100)}% vittorie, saldo ${bf.end})`:'no',bOk));
    // conferenza stampa: tre risposte per ogni tipo di partita, effetti contenuti e nei limiti
    {const cs=[{win:true,su:7,so:3,opp:'x',diff:4,derby:false,upset:false,heavy:true,close:false,last:false,big:false,seed:3},{win:false,su:5,so:7,opp:'y',diff:2,derby:true,upset:false,heavy:false,close:true,last:false,big:false,seed:4},{win:true,su:7,so:6,opp:'z',diff:1,derby:false,upset:true,heavy:false,close:true,last:true,big:false,seed:5}];
     const m0=SV.mor,f0=SV.fans;let ok=true,eff=[];
     for(const c of cs){const pr=pressFor(c);if(pr.opts.length!==3||!pr.q)ok=false;for(const o of pr.opts){SV.mor=60;SV.fans=50;pressApply(o);if(!(SV.mor>=58&&SV.mor<=62&&SV.fans>=50&&SV.fans<=53.5))ok=false;eff.push(o.k+':'+(SV.mor-60)+'/'+(SV.fans-50));}}
     SV.mor=m0;SV.fans=f0;rows.push(row('Conferenza stampa: tre risposte per ogni partita, con effetti piccoli e dichiarati',ok?'sì':'no',ok,'morale ±2, tifosi fino a +3'));}
    rows.push(row('Storico dei progressi dei giocatori',hOk?'sì':'no',hOk));
    // presentazioni: un derby e una partita europea sono «partite che contano», una giornata qualunque no
    {const nm=nextMatch(),riv0=SV.riv;SV.riv='';const plain=matchStakes(nm);SV.riv=nm.name;const dby=matchStakes(nm);SV.riv=riv0;
     const ev0=SV.event,eu0=SV.eu;SV.event='eu';SV.eu=newEu(SV.season);euEnsure();for(let k=0;k<12&&SV.eu.state==='on'&&SV.eu.nat.rd<6;k++)euRecord(true,7,0);const fin=matchStakes(nextMatch());SV.event=ev0;SV.eu=eu0;
     const ok=plain===null&&dby&&dby.title==='Derby'&&fin&&fin.title==='Finale'&&fin.lines.length>0;
     rows.push(row('Presentazioni: derby e finale europea sì, giornata normale no',ok?'sì':'no',ok));}
    rows.push(row('Statistiche individuali del girone: mete dei giocatori coerenti con la classifica',lsChk.filter(Boolean).length+' stagioni su '+lsChk.length,lsChk.length>0&&lsChk.every(Boolean)));
    {const ks=Object.keys(anc0||{}).filter(k=>SV.anc&&SV.anc[k]!==undefined),mv=ks.filter(k=>Math.abs(SV.anc[k]-anc0[k])>=1).length;
     rows.push(row('Livello storico delle squadre che si sposta negli anni',seasons>=4?mv+' squadre su '+ks.length+' cambiate di almeno 1 punto':'serve un test da 4 stagioni',seasons<4||mv>=ks.length*0.4,'le gerarchie non restano quelle di partenza'));}
    {mkReprice();const mm=SV.market||[],withMot=mm.filter(m=>m.mot).length,bad=mm.filter(m=>m.mot==='min'&&!wouldStart(m.o)&&!canSign(m)).length+mm.filter(m=>m.price!==Math.round(m.base*motMul(m))).length;
     rows.push(row('Mercato: motivazioni dei giocatori rispettate',withMot+' con una motivazione su '+mm.length+(bad?', '+bad+' non rispettate':''),mm.length>0&&bad===0));}
    rows.push(row('Gerarchie di inizio carriera calcolate con la rosa scelta',expOk?'sì':'no',expOk));
    rows.push(row('Sfida «Conti in ordine» giudicata prima dei premi',chalWhen.length?(chalWhen.every(x=>x==='prima')?'sì':'no')+' ('+chalWhen.length+' volte)':'mai capitata',chalWhen.length>0&&chalWhen.every(x=>x==='prima')));
    rows.push(row('Playoff: squadre sempre complete dopo promozioni e retrocessioni, albo d\u2019oro aggiornato',sizeBad.length?'problemi: '+sizeBad.join(', '):`sì (${poDays} partite di playoff giocate dalla tua squadra, ${(SV.alb||[]).length} edizioni nell\u2019albo)`,!sizeBad.length&&(SV.alb||[]).length>=Math.min(seasonsDone,60)));
    {const c0=SV.cash,n0=Object.keys(SV.ach||{}).length;achCheck();achCheck();const g=achPct(),pg=ACH.map(achState),html=achHTML()+albHTML()+hofHTML()+(SV.hof||[]).slice(0,12).map(hofCard).join('');
     const okA=SV.cash===c0&&Object.keys(SV.ach).length===n0&&g.n===ACH.filter(a=>SV.ach[a[0]]).length&&pg.every(a=>a.pct>=0&&a.pct<=100&&(a.done?a.pct===100:a.pct<100))&&!/undefined|NaN|null/.test(html)&&roman(14)==='XIV'&&roman(1994)==='MCMXCIV';
     rows.push(row('Traguardi, albo d\u2019oro e Hall of Fame: percentuali giuste, premi dati una sola volta, schede complete',okA?`sì (${g.n} traguardi su ${g.tot}, ${(SV.hof||[]).length} nella Hall of Fame)`:'problemi',okA));}
    {const bs=[];
     for(const k of Object.keys(STAFF)){const lv=staffLv(k),s=stPerson(k);
       if(lv<1){if(s)bs.push(k+': persona senza livello');continue;}
       if(!s){bs.push(k+': livello senza persona');continue;}
       if(!s.n||!(s.a>=20&&s.a<STAFF_RETIRE)||s.pot<lv||lv>STAFF_MAX||(s.tr&&(!STAFF_TR[s.tr]||STAFF_TR[s.tr].r!==k))||!s.lk||!s.lk.hair)bs.push(k+': dati non validi');}
     const cs=staffCands('coach'),csOk=cs.length===3&&cs.every(c=>c.lv>=1&&c.lv<=STAFF_MAX&&c.pot>=c.lv&&c.pot<=STAFF_MAX&&c.n&&c.a>=20&&(!c.tr||STAFF_TR[c.tr].r==='coach'));
     // salvataggio di prima dell'ondata 3 (senza allenatore e senza persone nello staff): careerInit li ricostruisce, sempre uguali, coi livelli gia' pagati
     let migOk=true;{const lv0=Object.keys(STAFF).map(k=>staffLv(k)).join();SV.coach=undefined;SV.start=undefined;SV.stp=undefined;SV.cand=undefined;SV.candN=undefined;careerInit();const c1=JSON.stringify(SV.coach);SV.coach=undefined;careerInit();   // l'allenatore di default e' sempre lo stesso per la stessa carriera
       migOk=!!SV.coach&&JSON.stringify(SV.coach)===c1&&SV.start==='cuore'&&Object.keys(STAFF).map(k=>staffLv(k)).join()===lv0&&Object.keys(STAFF).every(k=>staffLv(k)<1?!stPerson(k):(!!stPerson(k)&&stPerson(k).pot>=staffLv(k)&&stPerson(k).a>=34));}
     // chi se ne va: perde un livello e, se ne resta uno, subentra un assistente; senza livello il posto e' vacante
     const k0=Object.keys(STAFF).find(k=>staffLv(k)>=1),l0=k0?staffLv(k0):0;let lvOk=true;
     if(k0){staffLeave(k0);const l1=staffLv(k0);lvOk=l1===l0-1&&(l1>=1?!!stPerson(k0)&&stPerson(k0).pot>=l1:!stPerson(k0));}
     const hired=Object.keys(STAFF).filter(k=>stPerson(k)).length;
     rows.push(row('Staff come persone: ruoli e livelli coerenti, candidati validi, chi se ne va viene sostituito, salvataggi vecchi',bs.length||!csOk||!lvOk||!migOk?(bs.slice(0,2).join('; ')||(csOk?'':'candidati non validi')||(lvOk?'salvataggio vecchio non ricostruito bene':'sostituzione non corretta')):`sì (${hired} ruoli su 4 coperti, salvataggi vecchi ricostruiti)`,!bs.length&&csOk&&lvOk&&migOk));}
    {const bad3=[],c1=coachNorm({n:'  <b>Gi0>  ',s:'De  Santis!!',lk:null}),c2=coachNorm({n:'',s:'',lk:{hair:'#000000',skin:'#f0c9a4',style:2}});
     if(!SV.coach||!SV.coach.n||!SV.coach.s||!SV.coach.lk||!SV.coach.lk.hair)bad3.push('allenatore mancante');
     if(!/^[\p{L}' .-]+$/u.test(c1.n+c1.s)||c1.s!=='De Santis')bad3.push('nome non ripulito: '+c1.n+'|'+c1.s);
     if(!c2.n||!c2.s||c2.lk.style!==2)bad3.push('valori mancanti non sostituiti');
     if(coachFace(COACH_FACES[5])!==5)bad3.push('volto non riconosciuto');
     if(!/^<svg/.test(avatar({look:SV.coach.lk,t:0},46))||/NaN|undefined/.test(avatar({look:SV.coach.lk,t:0},46)))bad3.push('ritratto non valido');
     rows.push(row('Il tuo allenatore: nome e volto sempre validi, nomi ripuliti, ritratto in pixel art',bad3.length?bad3.join('; '):'sì ('+coachName()+')',!bad3.length));}
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
    // partenza da subentrato: una squadra in crisi a una giornata dalla fine; si gioca l'ultima partita e si passa all'estate (cambia la carriera di prova: va per ultimo)
    {const rb=[];
     for(const sr of ['A','B','C'])for(let t=0;t<3;t++){
       const nm=reliefOffer(sr);startCareer(nm,{relief:true,coach:{n:'Prova',s:'Test'}});
       const names=SV.mem[SV.sr],R=SV.sched.length,rk=ranking(SV.tab,names).indexOf(SV.team)+1,tag=sr+t+' '+nm;
       if(SV.start!=='sub'||SV.round!==R-1)rb.push(tag+': non a una giornata dalla fine');
       if(rk<names.length-2)rb.push(tag+': non in crisi ('+rk+'ª)');
       if(!SV.obj||SV.obj.tgt!==names.length-PROMO)rb.push(tag+': obiettivo');
       if(Object.values(SV.tab).some(r=>r.w+r.l!==R-1))rb.push(tag+': giornate giocate sbagliate');
       if(winsTot()!==0)rb.push(tag+': vittorie ereditate contate come tue ('+winsTot()+')');
       if(!(SV.news[0]&&/ha nominato Prova Test/.test(SV.news[0].txt)))rb.push(tag+': manca la notizia di nomina');
       if(t===0){simCareerMatch();hide();if(!SV.done)rb.push(tag+': la stagione non si chiude dopo l\u2019ultima partita');else{newSeason();if(SV.season!==2||SV.round!==0)rb.push(tag+': l\u2019estate non parte');}}
     }
     rows.push(row('Partenza da subentrato (A, B, C): a una giornata dalla fine, in crisi, vittorie ereditate non contate, poi si gioca e parte l\u2019estate',rb.length?rb.slice(0,3).join('; '):'sì (9 partenze)',!rb.length));}
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

/* ---- DIAGNOSTICA: TEST DELLE LEGHE EUROPEE ----
   Controlla i dati (club distinti, livelli, forza), le rose (giocatori veri, eta', forza del club) e il formato di ogni campionato giocando piu' stagioni in carriere di
   prova (un club forte, uno medio e uno debole per paese): gironi, fasi finali, classifica completa, promozioni e retrocessioni senza doppioni e a dimensione costante.
   Poi salvataggio a meta' stagione, le tre viste della Classifica in ogni fase, la coppa europea con i club dei nuovi paesi e il fatto che Italia e USA restano come erano.
   La carriera vera non viene toccata (QM.on blocca persist e alla fine si rimette com'era). Seme fisso: risultati ripetibili. */
function lnSelfTest(seasons,seed){
  const bak=hasCareer()?(persist(),JSON.stringify(SV)):null,R0=Math.random,q0=QM.on,rows=[],row=(name,val,ok,note)=>({name,val,ok:!!ok,note:note||''});
  Math.random=mulberry32(seed||2026);QM.on=true;
  const bad={},chk=(k,c,m)=>{if(!c)(bad[k]=bad[k]||[]).push(m||'');};
  let err='',seasonsDone=0,games=0,titles=new Set(),moved=0,nReal=0,nExact=0,nAll=0;
  const hide=()=>{for(const id of ['simres','alerts','evt'])$(id).classList.add('hidden');};
  const play=()=>{let g=0;while(!SV.done&&g++<40){const m=nextMatch();if(!m){chk('flusso',false,'partita mancante in '+SV.ln.ph);break;}const r=simPower(SV.team,m.name);recordResult(r[0]>r[1],r[0],r[1]);hide();games++;
    for(const v of ['grp','fin','tiers']){lnTabSel=v;try{renderEvent();}catch(e){chk('viste',false,v+' fase '+SV.ln.ph+': '+e.message);}}}   // le tre viste della Classifica si aprono in ogni fase
    chk('flusso',SV.done&&g<=20,'stagione non chiusa o troppo lunga '+g);
    if(SV.done&&SV.next&&SV.next.rank===1)chk('minime',(SV.sgp|0)>=LN_MIN,`${SV.sr}: la vincitrice ha giocato ${SV.sgp|0} partite`);};
  try{
    // ---- dati ----
    const all=LN_NAMES.concat(Object.keys(TEAM),US_NAMES,EU_CLUBS.map(x=>x[0]));
    chk('dati',new Set(all).size===all.length,'nomi di club ripetuti tra le leghe');
    const want={BE:46,FR:36,DE:49,UK:11,IW:17};
    for(const lk of LN_IDS){
      chk('dati',lnClubs(lk).length===want[lk],lk+': '+lnClubs(lk).length+' club');
      chk('dati',LN_CL[lk].every(r=>r[3]>=30&&r[3]<=95&&LN_TIER[lnKey(lk,r[1])]),'forza o livello fuori misura in '+lk);
      for(const club in LN_PL[lk])chk('dati',!!LN_BY[club]&&LN_BY[club].lk===lk,'giocatori di un club sconosciuto: '+club);
    }
    for(const k in LN_STAR_CLUB)chk('dati',!!STARS.find(r=>usStarKey(r)===k)&&!!LN_BY[LN_STAR_CLUB[k]],'stella o club inesistente: '+k);
    // ---- almeno 11 partite per chi arriva in fondo, in ogni livello e competizione (06-partite-minime.js) ----
    {const S0=SV;SV={team:'',lk:'BE'};
     for(const lk of LN_IDS){SV.lk=lk;const T=lnBuildT(lk);lnPools(T,lk,true);
       for(const tr of LN_DEF[lk].tiers)for(const c of T[tr.id]){const g=lnCompMin(tr,c),sz=c.pools.map(p=>p.length);
         for(const p of c.pools){const cnt=Array(p.length).fill(0);for(const R of lnGrpSched(p.length,g))for(const [a,b] of R){cnt[a]++;cnt[b]++;}chk('minime',p.length<2||Math.min(...cnt)>=g,`${lk} ${tr.id}: girone da ${p.length} con ${Math.min(...cnt)} partite`);}
         chk('minime',g+lnFinR(tr,sz)>=LN_MIN,`${lk} ${tr.id}${c.id}: la vincitrice gioca ${g}+${lnFinR(tr,sz)}`);
         if(Math.max(...sz)-1+lnFinR(tr,sz)>=LN_MIN)chk('minime',g===Math.max(...sz)-1,`${lk} ${tr.id}: giri aggiunti senza bisogno`);}}
     SV=S0;}
    // ---- rose: ogni club, con la forza dei dati ----
    for(const n of LN_NAMES){
      const ro=lnRoster(n,'t'),pw=rosterLevel(ro),sv=ro.some(o=>o.star);
      const women=isWomenClub(n);
      chk('rose',ro.length>=(women?SQ_MIN:14)&&ro.length<=SQ_MAX,'rosa di '+n+': '+ro.length+' giocatori');
      chk('rose',new Set(ro.map(o=>usNameKey(o.label||o.n))).size===ro.length,'giocatore ripetuto in '+n);
      chk('rose',ro.every(o=>ovr(o)>=36&&ovr(o)<=99&&o.age>=(women?14:16)&&(women||o.age<=45)),'giocatore fuori misura in '+n);
      chk('rose',Math.abs(pw-LN_BY[n].p)<=(sv?7:2),'forza di '+n+': '+pw.toFixed(1)+' contro '+LN_BY[n].p);
      for(const o of ro){nAll++;if(!o.gen){nReal++;if(!o.ae)nExact++;}}   // eta' esatta: le stelle del mercato e le poche schede pubbliche
    }
    // forza dei giocatori coerente con quella del club: dentro ogni livello, chi ha un club piu' forte ha giocatori piu' forti (anche in fondo alla rosa)
    {const by={};for(const n of LN_NAMES){const ro=lnRoster(n,'t').map(ovr).sort((a,b)=>b-a);(by[LN_BY[n].lk+LN_BY[n].t]=by[LN_BY[n].lk+LN_BY[n].t]||[]).push([LN_BY[n].p,ro.reduce((a,b)=>a+b,0)/ro.length,ro.slice(7,14).reduce((a,b)=>a+b,0)/7]);}
     const cor=(a,b)=>{const n=a.length,ma=a.reduce((x,y)=>x+y,0)/n,mb=b.reduce((x,y)=>x+y,0)/n;let c=0,va=0,vb=0;for(let i=0;i<n;i++){c+=(a[i]-ma)*(b[i]-mb);va+=(a[i]-ma)**2;vb+=(b[i]-mb)**2;}return va&&vb?c/Math.sqrt(va*vb):1;};
     for(const k in by)if(by[k].length>=5){const rm=cor(by[k].map(x=>x[0]),by[k].map(x=>x[1])),rd=cor(by[k].map(x=>x[0]),by[k].map(x=>x[2]));chk('profondita',rm>=0.6&&rd>=0.7,k+': media rosa '+rm.toFixed(2)+', fondo '+rd.toFixed(2));}}
    // chi gioca sia in Europa sia in America: solo in Europa (con il valore piu' alto fissato in LN_DUAL), tranne Orion Cable che resta in America
    for(const n in LN_DUAL){const k=usNameKey(n);let f=0;for(const c of LN_NAMES){const o=lnRoster(c,'t').find(x=>usNameKey(x.label||x.n)===k);if(o){f++;chk('doppioni',ovr(o)>=LN_DUAL[n]-1.5,n+': '+Math.round(ovr(o))+' invece di '+LN_DUAL[n]);}}chk('doppioni',f===1,n+' in '+f+' club europei');}
    for(const c of US_NAMES)for(const o of usRoster(c,'t')){const k=usNameKey(o.label||o.n);chk('doppioni',OVR_OTHER.has(c+'|'+k)||(!US_OUT.has(k)&&!Object.keys(LN_DUAL).some(n=>usNameKey(n)===k)),(o.label||o.n)+' e\' in un club USA');}
    {const k=usNameKey('Orion Cable');let eu=0,us=0;for(const c of LN_NAMES)if(lnRoster(c,'t').some(x=>usNameKey(x.label||x.n)===k))eu++;for(const c of US_NAMES)if(usRoster(c,'t').some(x=>usNameKey(x.label||x.n)===k))us++;chk('doppioni',eu===0&&us===1,'Orion Cable: '+eu+' club europei e '+us+' USA');}
    chk('rose',nReal>=800,'pochi giocatori veri in rosa: '+nReal);
    chk('eta',nExact>=1,'nessuna eta\' esatta applicata');
    // ---- stagioni: un club forte, uno medio e uno debole per paese ----
    const picks=[];
    for(const lk of LN_IDS){const pl=lnClubs(lk).sort((a,b)=>LN_BY[b].p-LN_BY[a].p);picks.push(pl[0],pl[Math.floor(pl.length/2)],pl[pl.length-1]);}
    for(const club of picks){
      startCareer(club,{});const lk=SV.lk,t0={};for(const t of lnTiers(lk))t0[t.id]=SV.ln.T[t.id].reduce((a,c)=>a+c.clubs.length,0);
      chk('lega',isLN()&&SV.lk===LN_BY[club].lk&&SV.sr===lnKey(lk,LN_BY[club].t)&&SV.mem[SV.sr].includes(club),'avvio '+club);
      chk('lega',SQ.length>=14&&Object.keys(SV.rost).length===want[lk]-1,'rose di '+club);
      for(let s=0;s<seasons;s++){
        play();seasonsDone++;
        const N=SV.next;chk('flusso',N&&N.rank>=1&&N.rank<=N.ln.n,'posizione fuori misura '+club);
        const comp=[],sz={};for(const t of lnTiers(lk)){sz[t.id]=SV.ln.nT[t.id].reduce((a,c)=>a+c.clubs.length,0);for(const c of SV.ln.nT[t.id])comp.push(...c.clubs);}
        chk('promozioni',new Set(comp).size===comp.length&&comp.length===want[lk],'doppioni o club persi dopo le promozioni');
        for(const t in sz)chk('promozioni',sz[t]===t0[t],'dimensione del livello '+t+': '+sz[t]+' invece di '+t0[t]);
        if(N.ln.tier!==N.ln.nTier)moved++;
        titles.add(N.ln.champ);
        if(s===1||s<seasons-1)finishEuropeForDiagnostics();
        if(s===1){   // salvataggio a meta' della stagione dopo
          newSeason();chk('flusso',SV.mem[SV.sr].includes(club)||SV.mem[SV.sr].includes(SV.team),'non sei nel tuo girone');
          const m=nextMatch();const r=simPower(SV.team,m.name);recordResult(r[0]>r[1],r[0],r[1]);hide();
          const snap=JSON.stringify(SV);SV={};chk('salvataggio',loadSave(JSON.parse(snap))&&isLN()&&SV.sched&&SV.ln.T&&SV.round>=1,'ricarica a meta\' stagione '+club);
          play();seasonsDone++;
        }else if(s<seasons-1)newSeason();
      }
    }
    // ---- coppa europea con i club dei nuovi paesi ----
    for(const club of [LN_NAMES.filter(n=>LN_BY[n].lk==='BE').sort((a,b)=>LN_BY[b].p-LN_BY[a].p)[0],'Grem']){
      startCareer(club,{});SV.euUnlocked=true;SV.eu=newEu(SV.season);SV.eu.it=null;SV.event='eu';const N=euEnsure(),teams=N.pools.flat();
      const cc={};for(const t of teams)cc[euCountry(t)]=(cc[euCountry(t)]|0)+1;
      chk('eucf',teams.length===16&&new Set(teams).size===16&&teams.includes(SV.team),'campo della coppa europea');
      chk('eucf',['ITA','BEL','FRA','GBR','GER'].every(c=>cc[c]===EU_SLOTS[{ITA:'IT',BEL:'BE',FRA:'FR',GBR:'UK',GER:'DE'}[c]]),'club per paese: '+JSON.stringify(cc));
      let k=0;while(SV.event==='eu'&&SV.eu.state==='on'&&k++<12){const m=nextMatch();if(!m)break;const r=simPower(SV.team,m.name);recordResult(r[0]>r[1],r[0],r[1]);hide();}
      chk('eucf',SV.eu.state!=='on','coppa non conclusa');
    }
    // ---- mercato: le stelle dei club delle nuove leghe non sono in vendita nel loro campionato ----
    startCareer('Mooncatchers',{});let onMk=0;for(let i=0;i<25;i++){buildMarket();for(const m of SV.market)if(m.star){const r=STARS.find(x=>x[0]+' '+x[1]===m.o.full);if(r&&lnStarTaken(r))onMk++;}}
    chk('mercato',onMk===0,'stelle dei club sul mercato: '+onMk);
    // ---- offerte di lavoro e scambi tra tutte le leghe (35-usa/05-lega-incrociata.js): da ognuna delle sei verso le altre cinque ----
    {const st={IT:SERIES.B[3],US:'Seattle Sockeye',BE:lnClubs('BE')[0],FR:lnClubs('FR')[0],DE:lnClubs('DE')[0],UK:lnClubs('UK')[0]},lgs=Object.keys(st);
      for(const a of lgs){
        startCareer(st[a],{});SV.hist=[{obj:1,rank:1}];SV.rep=70;
        chk('offerte',lgNow()===a,'lega di partenza '+a+' letta come '+lgNow());
        const fc=foreignClubs(),dest=new Set(fc.map(clubLega));
        chk('offerte',dest.size===5&&!dest.has(a),'club offerti da '+a+': '+[...dest].join(','));
        const got=new Set();for(let i=0;i<400&&got.size<5;i++){SV.job=null;SV.jobLast=0;crossLgOffer();if(SV.job){got.add(SV.job.lk);chk('offerte',clubLega(SV.job.club)===SV.job.lk&&SV.job.lk!==a,'offerta incoerente da '+a+': '+JSON.stringify(SV.job));}}
        chk('offerte',got.size===5,'da '+a+' le offerte di lavoro arrivano solo da: '+[...got].join(',')+' (servono tutte e 5 le altre leghe)');
        for(const b of lgs)if(b!==a){
          startCareer(st[a],{});const coach=SV.coach,tr=SV.troph,hist=SV.hist,club=fc.filter(n=>clubLega(n)===b).sort((x,y)=>clubLvl(y)-clubLvl(x))[1];
          SV.job={club,lk:b,season:SV.season,round:0};crossLgAnswer({act:'job'},'yes');
          chk('offerte',lgNow()===b&&SV.team===club&&SV.coach.n===coach.n&&SV.coach.s===coach.s&&SV.troph===tr&&SV.hist===hist,a+'→'+b+': lega '+lgNow()+', club '+SV.team);
          chk('offerte',SQ.length>=9&&SV.lineO.length===7&&SV.lineD.length===7&&!!nextMatch(),a+'→'+b+': rosa, linee o prima partita non validi');
          if(b==='IT')chk('offerte',!isUS()&&!isLN()&&['A','B','C'].includes(SV.sr),a+'→IT: serie non valida '+SV.sr);
          if(isLN())chk('offerte',!!SV.ln&&SV.sr===lnKey(b,LN_BY[club].t),a+'→'+b+': livello non valido '+SV.sr);
          if(isUS())chk('offerte',SV.sr==='U'&&!!SV.us,a+'→'+b+': campionato USA non valido');
        }
        // scambio di giocatori: da un'altra lega o dalla tua; la rosa resta della stessa dimensione, le linee valide e nessun giocatore e' in due squadre
        startCareer(st[a],{});SV.event='camp';SV.done=false;SV.trade=null;SV.job=null;
        const tl=new Set();let same=0;for(let i=0;i<300&&(tl.size<5||same<2);i++){SV.trade=null;crossLgTrade();if(SV.trade){tl.add(clubLega(SV.trade.club));if(clubLega(SV.trade.club)===a)same++;}}
        chk('offerte',tl.has(a)&&tl.size>=3,'da '+a+' gli scambi arrivano solo da: '+[...tl].join(',')+' (servono la stessa lega e altre)');
        for(const k of [0,1]){   // k=0: un club della stessa lega, k=1: di un'altra
          let ok=false;for(let i=0;i<300&&!ok;i++){SV.trade=null;crossLgTrade();ok=!!SV.trade&&(clubLega(SV.trade.club)===a)===(k===0);}
          if(!ok){chk('offerte','nessuno scambio '+(k?'da un’altra lega':'dalla stessa lega')+' per '+a);continue;}
          const n0=SQ.length,t=SV.trade,r0=SV.rost[t.club]?SV.rost[t.club].length:0,mineFull=t.mine,inRost=f=>Object.keys(SV.rost).filter(n=>SV.rost[n].some(o=>o.full===f)).length,c0=inRost(t.theirs.full);crossLgAnswer({act:'trade'},'yes');
          chk('offerte',SQ.length===n0&&!!byFull(t.theirs.full)&&!byFull(mineFull)&&SV.lineO.length===7&&SV.lineD.length===7&&Number.isFinite(squadPower()),'scambio da '+a+' non coerente');
          if(k===0){const ro=SV.rost[t.club];chk('offerte',ro.length===r0&&ro.some(o=>o.full===mineFull)&&!ro.some(o=>o.full===t.theirs.full),'scambio in '+a+': la rosa del club non e\' stata aggiornata');
            chk('offerte',inRost(t.theirs.full)===c0-1,'scambio in '+a+': '+t.theirs.full+' era in '+c0+' rose, ora in '+inRost(t.theirs.full));}
        }
      }
    }
    // ---- campionato Women (07-women.js): un mondo a parte, solo giocatrici ----
    {const S0=SV;SV={};chk('women',!allClubs().some(isWomenClub),'club femminili tra quelli maschili (mercato, offerte, carte)');
     startCareer('Tequila Boom Boom',{});chk('women',allClubs().length===LN_CL.IW.length&&allClubs().every(isWomenClub)&&!foreignClubs().length,'nella carriera Women ci sono club maschili');
     chk('women',SQ.every(p=>p.f)&&Object.values(SV.rost).every(r=>r.every(o=>o.f)),'giocatori maschi nel campionato Women');
     buildMarket();chk('women',SV.market.every(m=>m.o.f),'mercato del campionato Women con giocatori maschi');
     const pw=t=>LN_CL.IW.filter(r=>r[1]===t).map(r=>rosterPower(lnRoster(r[0],'t')));
     chk('women',Math.min(...pw('A'))>Math.max(...pw('B')),'gerarchia tra Serie A e Serie B');
     SV=S0;}
    // ---- Italia e USA restano come erano ----
    startCareer(SERIES.C[2],{});
    chk('italia',!isLN()&&!isUS()&&SV.sr==='C'&&SV.sched.length===15&&Object.keys(SV.mem).join()==='A,B,C'&&!SV.ln,'carriera italiana invariata');
    startCareer('Seattle Sockeye',{});
    chk('usa',isUS()&&SV.sr==='U'&&SV.sched.length===5&&!SV.ln,'carriera USA invariata');
    {const tot=()=>SQ.reduce((a,p)=>a+KEYS.reduce((x,k)=>x+p.s[k],0),0);
     SV.sgp=regularGames()+T16_MAX_GAMES;SV.played=SV.sgp;
     let t0=tot();offTrain(offTrainSessions());chk('fuori',tot()===t0,'allenamenti extra anche con la stagione completa');
     SV.sgp=regularGames();SV.played=SV.sgp;t0=tot();const sessions=offTrainSessions();offTrain(sessions);
     chk('fuori',sessions>0&&tot()>t0,'nessun allenamento dopo l’eliminazione prima dei Nationals');}
  }catch(e){err=e&&e.message||String(e);rows.push(row('Errore durante il test',err,false));}
  finally{
    Math.random=R0;QM.on=q0;hide();
    if(bak){SV={};loadSave(JSON.parse(bak));}else{SV={};initTeams();}
    G.inMatch=false;
  }
  const r=(name,k,okTxt)=>rows.push(row(name,bad[k]?bad[k].slice(0,2).join('; '):okTxt,!bad[k]));
  r('Dati: 46 club belgi, 36 francesi, 49 tedeschi, 11 britannici, 17 Women, nomi distinti da Italia, USA ed EUCF, forza e livelli validi','dati','sì');
  r('Campionato Women: solo giocatrici e club femminili (mercato compreso), forza secondo serie e classifica, nessun club femminile nel mondo maschile','women','sì');
  r('Rose di tutti i club: 14-28 giocatori (20 dove non c’è il foglio di revisione 2026), Overall e età nei limiti, forza uguale a quella dei dati (stelle escluse)','rose','sì');
  r('Età esatte dove note e giocatori veri presenti','eta',`sì (${nExact} esatte)`);
  r('Forza dei giocatori coerente con quella del club (media della rosa e fondo della rosa) in ogni livello','profondita','sì');
  r('Giocatori in Europa e in America: solo in Europa con il valore piu\' alto (Orion Cable solo in America)','doppioni','sì');
  r('Formati: gironi e fasi finali di ogni livello, stagione chiusa in al massimo 20 partite tue, posizione valida','flusso',`sì (${seasonsDone} stagioni, ${games} partite)`);
  r('Promozioni e retrocessioni: nessun doppione, nessun club perso, dimensione costante dei livelli','promozioni',`sì (${moved} cambi di livello del tuo club)`);
  rows.push(row('Campioni diversi tra le stagioni (le gerarchie cambiano)',titles.size+' campioni',titles.size>=3));
  r('Classifica: Girone, Fase finale e Livelli si aprono in ogni fase della stagione','viste','sì');
  r('Salvataggio: ricarica a metà stagione','salvataggio','sì');
  r('Avvio carriera: livello e girone giusti, rose di tutti i club','lega','sì');
  r('Campionato europeo: 16 club con 3 italiani, 3 belgi, 2 francesi, 2 britannici e 1 tedesco, in gironi','eucf','sì');
  r('Mercato: le stelle che giocano nei club della lega non sono in vendita','mercato','sì');
  r('Offerte tra tutte le leghe: lavoro e scambi da ognuna delle sei verso le altre cinque (gli scambi anche dalla stessa lega), con allenatore, storico e trofei conservati','offerte','sì');
  r('Almeno 11 partite per chi arriva in fondo in ogni livello europeo (più giri nei gironi solo dove servono)','minime','sì');
  r('Eliminati presto (USA): le settimane senza partite diventano allenamenti, una volta sola','fuori','sì');
  r('Campionato italiano invariato','italia','sì');r('Campionato USA invariato','usa','sì');
  return rows;
}
function runLnDiag(){
  if(diagBusy)return;diagBusy=true;
  $('dgOut').innerHTML='';$('dgState').textContent='Carriere di prova nelle leghe europee…';
  setTimeout(()=>{
    const rows=lnSelfTest(3,2026),ok=rows.filter(r=>r.ok).length;diagBusy=false;
    $('dgOut').innerHTML=`<div class="ccard" style="margin-bottom:6px"><h3>Leghe europee: 12 carriere da 3 stagioni</h3><ul class="nlist">${rows.map(r=>`<li><i style="color:${r.ok?'var(--good)':'var(--bad)'}">${r.ok?'OK':'NO'}</i> ${esc(r.name)}: <b>${esc(String(r.val))}</b></li>`).join('')}</ul></div>`;
    $('dgState').textContent=`Finito: ${ok} controlli superati su ${rows.length}.`;
  },60);
}
$('dgLn').addEventListener('click',runLnDiag);

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
    chk('flusso',SV.done&&g<=20,'stagione non chiusa o troppo lunga '+g);};
  try{
    // ---- dati ----
    const all=LN_NAMES.concat(Object.keys(TEAM),US_NAMES,EU_CLUBS.map(x=>x[0]));
    chk('dati',new Set(all).size===all.length,'nomi di club ripetuti tra le leghe');
    const want={BE:46,FR:54,DE:49,UK:11};
    for(const lk of LN_IDS){
      chk('dati',LN_CL[lk].length===want[lk],lk+': '+LN_CL[lk].length+' club');
      chk('dati',LN_CL[lk].every(r=>r[3]>=30&&r[3]<=95&&LN_TIER[lnKey(lk,r[1])]),'forza o livello fuori misura in '+lk);
      for(const club in LN_PL[lk])chk('dati',!!LN_BY[club]&&LN_BY[club].lk===lk,'giocatori di un club sconosciuto: '+club);
    }
    for(const k in LN_STAR_CLUB)chk('dati',!!STARS.find(r=>usStarKey(r)===k)&&!!LN_BY[LN_STAR_CLUB[k]],'stella o club inesistente: '+k);
    // ---- rose: ogni club, con la forza dei dati ----
    for(const n of LN_NAMES){
      const ro=lnRoster(n,'t'),pw=rosterPower(ro),sv=ro.some(o=>o.star);
      chk('rose',ro.length>=14&&ro.length<=20,'rosa di '+n+': '+ro.length+' giocatori');
      chk('rose',new Set(ro.map(o=>usNameKey(o.label||o.n))).size===ro.length,'giocatore ripetuto in '+n);
      chk('rose',ro.every(o=>ovr(o)>=36&&ovr(o)<=99&&o.age>=16&&o.age<=45),'giocatore fuori misura in '+n);
      chk('rose',Math.abs(pw-LN_BY[n].p)<=(sv?7:2),'forza di '+n+': '+pw.toFixed(1)+' contro '+LN_BY[n].p);
      for(const o of ro){nAll++;if(!o.gen){nReal++;if(!o.ae)nExact++;}}   // eta' esatta: le stelle del mercato e le poche schede pubbliche
    }
    chk('rose',nReal>=800,'pochi giocatori veri in rosa: '+nReal);
    chk('eta',nExact>=1,'nessuna eta\' esatta applicata');
    // ---- stagioni: un club forte, uno medio e uno debole per paese ----
    const picks=[];
    for(const lk of LN_IDS){const pl=lnClubs(lk,true).sort((a,b)=>LN_BY[b].p-LN_BY[a].p);picks.push(pl[0],pl[Math.floor(pl.length/2)],pl[pl.length-1]);}
    for(const club of picks){
      startCareer(club,{});const lk=SV.lk,t0={};for(const t of lnTiers(lk))t0[t.id]=SV.ln.T[t.id].reduce((a,c)=>a+c.clubs.length,0);
      chk('lega',isLN()&&SV.lk===LN_BY[club].lk&&SV.sr===lnKey(lk,LN_BY[club].t)&&SV.mem[SV.sr].includes(club),'avvio '+club);
      chk('lega',SQ.length>=14&&Object.keys(SV.rost).length===LN_CL[lk].length-1,'rose di '+club);
      for(let s=0;s<seasons;s++){
        play();seasonsDone++;
        const N=SV.next;chk('flusso',N&&N.rank>=1&&N.rank<=N.ln.n,'posizione fuori misura '+club);
        const comp=[],sz={};for(const t of lnTiers(lk)){sz[t.id]=SV.ln.nT[t.id].reduce((a,c)=>a+c.clubs.length,0);for(const c of SV.ln.nT[t.id])comp.push(...c.clubs);}
        chk('promozioni',new Set(comp).size===comp.length&&comp.length===LN_CL[lk].length,'doppioni o club persi dopo le promozioni');
        for(const t in sz)chk('promozioni',sz[t]===t0[t],'dimensione del livello '+t+': '+sz[t]+' invece di '+t0[t]);
        if(N.ln.tier!==N.ln.nTier)moved++;
        titles.add(N.ln.champ);
        if(s===1){   // salvataggio a meta' della stagione dopo
          newSeason();chk('flusso',SV.mem[SV.sr].includes(club)||SV.mem[SV.sr].includes(SV.team),'non sei nel tuo girone');
          const m=nextMatch();const r=simPower(SV.team,m.name);recordResult(r[0]>r[1],r[0],r[1]);hide();
          const snap=JSON.stringify(SV);SV={};chk('salvataggio',loadSave(JSON.parse(snap))&&isLN()&&SV.sched&&SV.ln.T&&SV.round>=1,'ricarica a meta\' stagione '+club);
          play();seasonsDone++;
        }else if(s<seasons-1)newSeason();
      }
    }
    // ---- coppa europea con i club dei nuovi paesi ----
    for(const club of [LN_NAMES.find(n=>LN_BY[n].lk==='BE'&&LN_BY[n].p>85),'Grem']){
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
    // ---- Italia e USA restano come erano ----
    startCareer(SERIES.C[2],{});
    chk('italia',!isLN()&&!isUS()&&SV.sr==='C'&&SV.sched.length===15&&Object.keys(SV.mem).join()==='A,B,C'&&!SV.ln,'carriera italiana invariata');
    startCareer('Seattle Sockeye',{});
    chk('usa',isUS()&&SV.sr==='U'&&SV.sched.length===5&&!SV.ln,'carriera USA invariata');
  }catch(e){err=e&&e.message||String(e);rows.push(row('Errore durante il test',err,false));}
  finally{
    Math.random=R0;QM.on=q0;hide();
    if(bak){SV={};loadSave(JSON.parse(bak));}else{SV={};initTeams();}
    G.inMatch=false;
  }
  const r=(name,k,okTxt)=>rows.push(row(name,bad[k]?bad[k].slice(0,2).join('; '):okTxt,!bad[k]));
  r('Dati: 46 club belgi, 54 francesi, 49 tedeschi, 11 britannici, nomi distinti da Italia, USA ed EUCF, forza e livelli validi','dati','sì');
  r('Rose di tutti i club: 14-20 giocatori, Overall e età nei limiti, forza uguale a quella dei dati (stelle escluse)','rose','sì');
  r('Età esatte dove note e giocatori veri presenti','eta',`sì (${nExact} esatte)`);
  r('Formati: gironi e fasi finali di ogni livello, stagione chiusa in al massimo 20 partite tue, posizione valida','flusso',`sì (${seasonsDone} stagioni, ${games} partite)`);
  r('Promozioni e retrocessioni: nessun doppione, nessun club perso, dimensione costante dei livelli','promozioni',`sì (${moved} cambi di livello del tuo club)`);
  rows.push(row('Campioni diversi tra le stagioni (le gerarchie cambiano)',titles.size+' campioni',titles.size>=3));
  r('Classifica: Girone, Fase finale e Livelli si aprono in ogni fase della stagione','viste','sì');
  r('Salvataggio: ricarica a metà stagione','salvataggio','sì');
  r('Avvio carriera: livello e girone giusti, rose di tutti i club','lega','sì');
  r('Coppa europea: 16 club con 3 italiani, 3 belgi, 2 francesi, 2 britannici e 1 tedesco, in gironi','eucf','sì');
  r('Mercato: le stelle che giocano nei club della lega non sono in vendita','mercato','sì');
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

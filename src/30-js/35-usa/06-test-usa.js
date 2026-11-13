/* ---- DIAGNOSTICA: TEST DEL CAMPIONATO USA ----
   Gioca piu' stagioni di seguito in carriere USA di prova (club forte, medio e debole) e controlla il formato: 32 club, 4 Conference da 8, 7 giornate,
   8 qualificate dirette + 8 dal Play-in = 16 ai Nationals, 4 gironi da 4 (una squadra per fascia, Conference separate), 3 partite a girone,
   prequarti 2ª-3ª di gironi diversi, quarti, semifinali e finale senza accoppiamenti duplicati. Poi salvataggio, cambio di lega e stelle tolte dal mercato.
   La carriera vera non viene toccata (QM.on blocca persist e alla fine si rimette com'era). Seme fisso: risultati ripetibili. */
function usaSelfTest(seasons,seed){
  const bak=hasCareer()?(persist(),JSON.stringify(SV)):null,R0=Math.random,q0=QM.on,rows=[],row=(name,val,ok,note)=>({name,val,ok:!!ok,note:note||''});
  Math.random=mulberry32(seed||2026);QM.on=true;
  const bad={},chk=(k,c,m)=>{if(!c)(bad[k]=bad[k]||[]).push(m||'');};
  let err='',conflicts=0,pools=0,seasonsDone=0,champs=new Set(),stages=new Set(),games=0;
  const hide=()=>{for(const id of ['simres','alerts','evt'])$(id).classList.add('hidden');};
  try{
    chk('club',US_NAMES.length===32&&new Set(US_NAMES).size===32,'32 club distinti');
    for(const c of US_CK)chk('conf',US_BYCONF[c].length===8,'Conference '+c);
    chk('conf',US_CK.length===4,'4 Conference');
    const clubs=['Cincinnati Omen','Raleigh Ring of Fire','Austin Doublewide','Boston DiG'];
    for(const club of clubs){
      startCareer(club,{});
      chk('lega',SV.lk==='US'&&SV.sr==='U'&&SV.sched.length===7,'avvio '+club);
      for(let s=0;s<seasons;s++){
        let g=0;
        while(!SV.done&&g++<40){const m=nextMatch();if(!m){chk('flusso',false,'partita mancante');break;}const r=simPower(SV.team,m.name);recordResult(r[0]>r[1],r[0],r[1]);hide();games++;}
        chk('flusso',SV.done&&g<=20,'stagione non chiusa o troppo lunga '+g);
        const U=SV.us,N=U.nat;if(!N||!U.q){chk('flusso',false,'Nationals mancanti');break;}
        chk('qualif',U.q.length===16&&new Set(U.q).size===16,'16 ai Nationals');
        const dir=[],pin=[];for(const c of US_CK){const o=U.fin[c];dir.push(o[0],o[1]);pin.push(U.pin[c].r[0][4],U.pin[c].r[1][4]);
          chk('playin',U.pin[c].m[0][0]===o[2]&&U.pin[c].m[0][1]===o[5]&&U.pin[c].m[1][0]===o[3]&&U.pin[c].m[1][1]===o[4],'3ª-6ª e 4ª-5ª');
          chk('playin',!U.q.includes(o[6])&&!U.q.includes(o[7]),'7ª e 8ª fuori');}
        chk('qualif',dir.length===8&&pin.length===8&&dir.every(t=>U.q.includes(t))&&pin.every(t=>U.q.includes(t)),'8 dirette + 8 Play-in');
        chk('gironi',N.pools.length===4&&N.pools.every(p=>p.length===4)&&new Set(N.pools.flat()).size===16,'4 gironi da 4');
        N.pools.forEach((pl,i)=>{pools++;chk('gironi',pl.map(t=>Math.floor(N.seed.indexOf(t)/4)).sort().join('')==='0123','una squadra per fascia');
          const cs=pl.map(usConfOf);conflicts+=cs.length-new Set(cs).size;
          chk('gironi',pl.every(t=>N.tabs[i][t].w+N.tabs[i][t].l===3),'3 partite a girone');});
        chk('tabellone',N.ko[0].length===4&&N.ko[1].length===4&&N.ko[2].length===2&&N.ko[3].length===1,'4-4-2-1');
        const seen=new Set();for(let r=0;r<4;r++)for(const m of N.ko[r]){const k=[m[0],m[1]].sort().join('|');chk('tabellone',!seen.has(k),'accoppiamento duplicato');seen.add(k);chk('tabellone',m[2]!==m[3]&&m[4]===(m[2]>m[3]?m[0]:m[1]),'vincitrice coerente');}
        for(let r=0;r<2;r++)for(const m of N.ko[r])chk('tabellone',usNatPool(m[0])!==usNatPool(m[1]),'rivincita di girone');
        N.ko[0].forEach(m=>{const a=usNatPool(m[0]),b=usNatPool(m[1]);chk('tabellone',a!==b&&N.ord[a][1]===m[0]&&N.ord[b][2]===m[1],'prequarti 2ª-3ª di gironi diversi');});
        chk('tabellone',N.ko[1].every(m=>N.ord.map(o=>o[0]).includes(m[0])&&N.ko[0].map(x=>x[4]).includes(m[1])),'quarti: prime dei gironi contro vincitrici dei prequarti');
        chk('tabellone',N.champ===N.ko[3][0][4],'campione');champs.add(N.champ);stages.add(U.stage);
        chk('storico',!!(SV.hist[0]&&SV.hist[0].us),'storico della stagione');
        chk('ranking',US_NAMES.every(n=>typeof U.pr[n]==='number'&&isFinite(U.pr[n])),'ranking numerico');
        if(s<seasons-1){newSeason();hide();chk('flusso',!SV.done&&SV.round===0&&U.ph==='reg'&&Object.keys(SV.rost).length===31,'nuova stagione');}
      }
      seasonsDone+=seasons;
    }
    // salvataggio: ricaricare una carriera USA a meta' stagione la ritrova com'era
    startCareer('Denver Johnny Bravo',{});{const m=nextMatch(),r=simPower(SV.team,m.name);recordResult(r[0]>r[1],r[0],r[1]);}
    const snap=JSON.parse(JSON.stringify(SV));SV={};loadSave(snap);
    chk('salvataggio',SV.lk==='US'&&SV.round===1&&SV.us.ph==='reg'&&SQ.length>=12&&!!nextMatch(),'ricarica a meta\' stagione');
    // stelle del mercato che giocano nei club USA: nei club, mai sul mercato USA
    let onMk=0,inClub=0;for(const r of STARS)if(US_STAR_CLUB[usStarKey(r)]){inClub++;chk('stelle',US_TEAM[US_STAR_CLUB[usStarKey(r)]]!==undefined,'club inesistente');chk('stelle',usRoster(US_STAR_CLUB[usStarKey(r)],'t').some(o=>o.full===r[0]+' '+r[1]),'manca nel club: '+r[0]);}
    for(let i=0;i<25;i++){buildMarket();for(const m of SV.market)if(m.star){const r=STARS.find(x=>x[0]+' '+x[1]===m.o.full);if(r&&usStarTaken(r))onMk++;}}
    chk('stelle',onMk===0,'stelle dei club sul mercato USA');
    // cambio di lega e ritorno
    SV.job={club:SERIES.A[0],lk:'IT',season:SV.season,round:0};const t1=SV.troph;crossLgAnswer({act:'job'},'yes');
    chk('lega',!isUS()&&SV.sr==='A'&&SV.troph===t1&&!!SV.coach,'da USA a Italia');
    SV.job={club:'Seattle Sockeye',lk:'US',season:SV.season,round:0};crossLgAnswer({act:'job'},'yes');
    chk('lega',isUS()&&SV.team==='Seattle Sockeye','da Italia a USA');
    // l'Italia e' com'era
    startCareer(SERIES.C[2],{});
    chk('italia',!isUS()&&SV.sr==='C'&&SV.sched.length===15&&Object.keys(SV.mem).join()==='A,B,C'&&!SV.us,'carriera italiana invariata');
  }catch(e){err=e&&e.message||String(e);rows.push(row('Errore durante il test',err,false));}
  finally{
    Math.random=R0;QM.on=q0;hide();
    if(bak){SV={};loadSave(JSON.parse(bak));}else{SV={};initTeams();}
    G.inMatch=false;
  }
  const r=(name,k,okTxt)=>rows.push(row(name,bad[k]?bad[k].slice(0,2).join('; '):okTxt,!bad[k]));
  r('Formato: 32 club distinti in 4 Conference da 8','club','sì');rows[rows.length-1].ok=rows[rows.length-1].ok&&!bad.conf;
  r('Stagione regolare: 7 giornate, stagione che si chiude in al massimo 20 partite tue','flusso',`sì (${seasonsDone} stagioni, ${games} partite)`);
  r('Qualificate: 8 dirette (1ª e 2ª) + 8 dal Play-in (3ª-6ª, 4ª-5ª) = 16 ai Nationals, 7ª e 8ª fuori','qualif','sì');
  r('Play-in: 3ª contro 6ª e 4ª contro 5ª in ogni Conference','playin','sì');
  r('Nationals: 4 gironi da 4, una squadra per fascia del ranking, 3 partite a girone','gironi',`sì (${pools} gironi)`);
  rows.push(row('Nationals: Conference diverse nello stesso girone quando si puo\'',conflicts+' accoppiamenti della stessa Conference su '+pools+' gironi',conflicts<=Math.ceil(pools*0.1)));
  r('Tabellone: prequarti 2ª-3ª di altri gironi, quarti, semifinali e finale senza accoppiamenti duplicati','tabellone','sì');
  rows.push(row('Titoli e percorsi diversi tra le stagioni (le gerarchie cambiano)',champs.size+' campioni, '+stages.size+' esiti per il tuo club',champs.size>=2&&stages.size>=2));
  r('Ranking nazionale numerico e storico di stagione','ranking','sì');r('Storico della stagione con esito USA','storico','sì');
  r('Salvataggio: ricarica a metà stagione','salvataggio','sì');
  r('Stelle del mercato presenti nei club USA: nel club, non sul mercato','stelle','sì');
  r('Cambio di lega Italia ↔ USA: allenatore e trofei restano','lega','sì');
  r('Campionato italiano invariato','italia','sì');
  return rows;
}
function runUsaDiag(){
  if(diagBusy)return;diagBusy=true;
  $('dgOut').innerHTML='';$('dgState').textContent='Carriere USA di prova…';
  setTimeout(()=>{
    const rows=usaSelfTest(6,2026),ok=rows.filter(r=>r.ok).length;diagBusy=false;
    $('dgOut').innerHTML=`<div class="ccard" style="margin-bottom:6px"><h3>Campionato USA: 4 carriere da 6 stagioni</h3><ul class="nlist">${rows.map(r=>`<li><i style="color:${r.ok?'var(--good)':'var(--bad)'}">${r.ok?'OK':'NO'}</i> ${esc(r.name)}: <b>${esc(r.val)}</b></li>`).join('')}</ul></div>`;
    $('dgState').textContent=`Finito: ${ok} controlli superati su ${rows.length}.`;
  },60);
}
$('dgUs').addEventListener('click',runUsaDiag);

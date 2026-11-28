/* ---- DIAGNOSTICA: TEST DEL CAMPIONATO USA ----
   Gioca piu' stagioni di seguito in carriere USA di prova (club forte, medio e debole) e controlla il formato: 48 club, 8 Conference da 6, 5 giornate,
   posti ai Nationals per regione (1 automatico + 8 di forza dal ranking, 16 in tutto) con Play-in variabile, 4 gironi da 4 (una squadra per fascia, Conference separate), 3 partite a girone,
   prequarti 2ª-3ª di gironi diversi, quarti, semifinali e finale senza accoppiamenti duplicati. Poi salvataggio, cambio di lega, stelle tolte dal mercato Overall dai dati Fantasy ed età/premi UFA.
   La carriera vera non viene toccata (QM.on blocca persist e alla fine si rimette com'era). Seme fisso: risultati ripetibili. */
function usaSelfTest(seasons,seed){
  const bak=hasCareer()?(persist(),JSON.stringify(SV)):null,R0=Math.random,q0=QM.on,rows=[],row=(name,val,ok,note)=>({name,val,ok:!!ok,note:note||''});
  Math.random=mulberry32(seed||2026);QM.on=true;
  const bad={},chk=(k,c,m)=>{if(!c)(bad[k]=bad[k]||[]).push(m||'');};
  let err='',conflicts=0,pools=0,seasonsDone=0,champs=new Set(),stages=new Set(),games=0,bidChg=0,bidSeas=0,prevB=null;
  const hide=()=>{for(const id of ['simres','alerts','evt'])$(id).classList.add('hidden');};
  try{
    chk('club',US_NAMES.length===48&&new Set(US_NAMES).size===48,'48 club distinti');
    for(const c of US_CK)chk('conf',US_BYCONF[c].length===6,'Conference '+c);
    chk('conf',US_CK.length===8&&Object.keys(US_CONF).length===8,'8 Conference');
    const clubs=['Toronto GOAT','Raleigh Ring of Fire','Austin Doublewide','Boston DiG'];
    for(const club of clubs){
      startCareer(club,{});
      chk('lega',SV.lk==='US'&&SV.sr==='U'&&SV.sched.length===5,'avvio '+club);
      for(let s=0;s<seasons;s++){
        let g=0;
        prevB=null;let chgS=0;
        while(!SV.done&&g++<40){
          if(SV.us.ph==='reg'){const nb=JSON.stringify(usBids());if(prevB&&prevB!==nb)chgS++;prevB=nb;}   // i posti si ricalcolano dopo ogni giornata
          const m=nextMatch();if(!m){chk('flusso',false,'partita mancante');break;}const r=simPower(SV.team,m.name);recordResult(r[0]>r[1],r[0],r[1]);hide();games++;
          // le tre viste della Classifica si aprono in ogni fase (i gironi dei Nationals esistono solo dopo la stagione regolare)
          for(const v of ['nat','rank','conf']){usTabSel=v;try{renderEvent();}catch(e){chk('viste',false,v+' fase '+SV.us.ph+': '+e.message);}}}
        chk('flusso',SV.done&&g<=24,'stagione non chiusa o troppo lunga '+g);
        bidChg+=chgS;bidSeas++;
        const U=SV.us,N=U.nat;
        chk('interreg',U.xn===7&&!!U.xl&&U.xl.length===7&&new Set(U.xl.map(x=>usConfOf(x.opp))).size===7&&U.xl.every((x,i)=>x.r===i+1&&usConfOf(x.opp)!==U.cf),'interregionali del tuo club: '+(U.xl?U.xl.map(x=>usConfOf(x.opp)).join(','):'nessuna'));
        {const per={};for(const L of U.xp){chk('interreg',L.length===24,'strato di '+L.length+' partite');for(const [a,b] of L){(per[a]=per[a]||[]).push(usConfOf(b));(per[b]=per[b]||[]).push(usConfOf(a));}}
          chk('interreg',US_NAMES.every(n=>per[n]&&per[n].length===7&&new Set(per[n]).size===7&&!per[n].includes(usConfOf(n))),'ogni club deve incontrare una volta ciascuna delle altre 7 Conference');}
        chk('interreg',SV.res.length===5&&SV.round===5,'le interregionali non devono contare come giornate di Conference');
        chk('qualif',U.q.length===16&&new Set(U.q).size===16,'16 ai Nationals');
        // posti per regione (bid allocation USAU): 1 automatico + 8 di forza dal ranking, 16 in tutto, al massimo 4 per regione; ogni regione manda esattamente i suoi posti
        const B=U.bids;let tot=0;chk('posti',!!B&&US_CK.every(c=>B[c]>=1&&B[c]<=4),'posti per regione fuori misura');
        for(const c of US_CK){
          const o=U.fin[c],P=U.pin[c],s=usBidSplit(B[c]);tot+=B[c];
          chk('playin',P.d===s.d&&P.m.length===s.k&&P.r.length===s.k&&P.r.every(r=>!!r),'gare del Play-in di '+c);
          P.m.forEach((m,i)=>chk('playin',m[0]===o[s.d+i]&&m[1]===o[s.d+2*s.k-1-i],'accoppiamento del Play-in di '+c));
          chk('qualif',o.filter(t=>U.q.includes(t)).length===B[c]&&o.slice(0,s.d).every(t=>U.q.includes(t)),'qualificate di '+c+' diverse dai posti');
          chk('playin',o.length===6&&o.slice(s.d+2*s.k).every(t=>!U.q.includes(t)),'fuori dal Play-in qualificate in '+c);}
        chk('posti',tot===16,'16 posti in tutto: '+tot);
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
        if(s<seasons-1){newSeason();hide();chk('flusso',!SV.done&&SV.round===0&&U.ph==='reg'&&Object.keys(SV.rost).length===47,'nuova stagione');}
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
    // Overall dai dati Fantasy (senza chi gioca solo in Europa, US_OUT): ogni giocatore dei dati e' nella rosa del suo club (o fuori dal tetto di 20), chi ha reso di piu' sta davanti a chi non ha reso
    let ffIn=0,ffAll=0;
    for(const t in US_FF){const c=US_NAMES.find(n=>n.endsWith(t));chk('fantasy',!!c,'club dei dati inesistente: '+t);if(!c)continue;
      const ros=usRoster(c,'t'),by=o=>ovr(o),keys=new Set(ros.map(o=>usNameKey(o.label||o.n)));
      const ffl=US_FF[t].filter(f=>!US_OUT.has(usNameKey(f[0]))),best=ffl.slice().sort((a,b)=>usFFval(b)-usFFval(a))[0],bo=ros.find(o=>usNameKey(o.label||o.n)===usNameKey(best[0]));
      ffAll++;chk('fantasy',!!bo&&ros.filter(o=>by(o)>by(bo)).length<=4,'il migliore di '+t+' non e\' tra i primi 5: '+best[0]);
      for(const f of ffl)if(usFFval(f)>0.45){ffAll++;if(keys.has(usNameKey(f[0])))ffIn++;}
      chk('fantasy',ros.length>=20&&ros.length<=SQ_MAX&&ros.every(o=>ovr(o)>=36&&ovr(o)<=99),'rosa '+t+' fuori misura');
      // fama: una stella con un torneo storto non scende molto sotto il suo Overall di mercato; i club con i campioni non perdono il loro rating
      for(const o of ros)if(o.star){const r=STARS.find(x=>x[0]+' '+x[1]===o.full);chk('fantasy',!r||ovr(o)>=r[4]-4,'stella troppo sotto il mercato: '+o.full);}
      chk('fantasy',Math.abs(rosterLevel(ros)-US_TEAM[c].power)<=4.5,'forza della rosa lontana dal rating: '+t);}
    // eta' e fama dai dati pubblici UFA: l'eta' delle tabelle arriva in rosa, i convocati giovanili non superano il limite, i premiati All-UFA non restano in fondo
    let agN=0,awN=0;
    for(const c of US_NAMES){const ros=usRoster(c,'t'),ord=ros.map(ovr).sort((x,y)=>y-x),med=ord[Math.floor(ord.length/2)];
      if(US_ROSTER_ADD[c]){
        const names=new Set(ros.filter(o=>!o.gen).map(o=>usNameKey(o.label||o.n)));
        chk('roster',names.size===ros.length,'nomi generati o ripetuti in '+c);
        for(const name of US_ROSTER_ADD[c])chk('roster',names.has(usNameKey(name)),name+' manca in '+c);
      }
      for(const o of ros){if(o.gen)continue;const k=usNameKey(o.label||o.n),ex=US_ROSTER_AGE[k]||US_AGE[k],hi=US_AGE_HI[k];   // i riempimenti generati possono avere il nome di un giocatore vero: non contano
        if(ex){agN++;chk('eta',o.age===ex,'eta\' diversa dalla scheda: '+o.label);chk('eta',!o.ae,'eta\' esatta segnata come stima: '+o.label);}
        else if(hi)chk('eta',o.age<=hi,'oltre il limite giovanile: '+o.label+' '+o.age+'>'+hi);
        if(US_UFA_AWARD[k]){awN++;chk('premi',ovr(o)>=med-8,'premiato All-UFA molto sotto la mediana: '+o.label);}}}
    // internazionali del mercato: la provenienza non e' mai una squadra UFA (solo club dei Nationals USA, club europei del gioco o un paese), niente doppioni, e l'Overall non sta sotto ai premi
    const PAESI=new Set(['USA','Nord America','Paesi Bassi','Lettonia','Repubblica Ceca','Germania']),starKeys=new Set();
    for(const r of STARS){const k=usNameKey(r[1]+' '+r[0]);chk('stelle',!starKeys.has(k),'stella ripetuta: '+r[1]+' '+r[0]);starKeys.add(k);
      chk('stelle',US_NAMES.includes(r[5])||LN_NAMES.includes(r[5])||PAESI.has(r[5]),'provenienza non valida (squadra UFA?): '+r[1]+' '+r[0]+' -> '+r[5]);
      chk('stelle',r[4]>=usAward(r[0],r[1])||ovrAssigned(r[1]+' '+r[0]),'Overall sotto ai premi: '+r[1]+' '+r[0]);   // chi e' nel foglio di revisione 2026 vale quel valore
      const cl=US_STAR_CLUB[usStarKey(r)]||LN_STAR_CLUB[usStarKey(r)];if(cl)chk('stelle',r[5]===cl,'provenienza diversa dal club del gioco: '+r[1]+' '+r[0]+' '+r[5]+' / '+cl);}
    chk('eta',agN>=60,'poche eta\' dalle schede UFA: '+agN);chk('premi',awN>=15,'pochi premiati in rosa: '+awN);
    chk('fantasy',ffIn>=ffAll*0.88,'giocatori di rendimento mancanti nelle rose: '+ffIn+'/'+ffAll);
    // cambio di lega e ritorno
    SV.job={club:SERIES.A[0],lk:'IT',season:SV.season,round:0};const t1=SV.troph;crossLgAnswer({act:'job'},'yes');
    chk('lega',!isUS()&&SV.sr==='A'&&SV.troph===t1&&!!SV.coach,'da USA a Italia');
    SV.job={club:'Seattle Sockeye',lk:'US',season:SV.season,round:0};crossLgAnswer({act:'job'},'yes');
    chk('lega',isUS()&&SV.team==='Seattle Sockeye','da Italia a USA');
    // Dieci atlete a SCINNY: anche la distinta più corta può finire una stagione.
    startCareer('Omega Continuum',{});
    chk('women',SV.sr==='UW'&&SQ.length===10&&SQ.every(p=>p.f)&&foreignClubs().every(n=>isWomenClub(n)&&clubLega(n)!=='UW'),'avvio o mercato Women');
    for(let g=0;!SV.done&&g<24;g++){
      const m=nextMatch();
      chk('women',m&&UW_ROSTERS[m.name],'avversaria in carriera Women');
      const [a,b]=simPower(SV.team,m.name);recordResult(a>b,a,b);hide();
      if(g===2){
        const snap=Object.assign({},SV,{squad:squadData(),lineup:lineupIds()});
        chk('women',loadSave(snap)&&SV.lk==='UW'&&SQ.length===10,'ricarica Women');
      }
    }
    chk('women',SV.done&&SV.us.q.length===16&&SV.us.q.every(n=>UW_ROSTERS[n])&&SV.next.champs.UW===SV.us.nat.champ,'Nationals Women');
    chk('women',newSeason()&&SV.sr==='UW'&&usRankList().length===48&&SV.market.every(m=>m.o.f),'seconda stagione Women');
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
  r('Formato: 48 club distinti in 8 Conference (regioni USAU) da 6','club','sì');rows[rows.length-1].ok=rows[rows.length-1].ok&&!bad.conf;
  r('Stagione regolare: 5 giornate, stagione che si chiude in al massimo 20 partite tue','flusso',`sì (${seasonsDone} stagioni, ${games} partite)`);
  r('Posti ai Nationals per regione (bid allocation USAU): 1 automatico + 8 di forza dal ranking = 16, da 1 a 4 per Conference','posti','sì');
  r('Interregionali: 7 a stagione (una contro ogni altra Conference), 12 partite in tutto, che legano le Conference nel ranking','interreg','sì');
  rows.push(row('Posti ai Nationals che cambiano durante la stagione regolare (ranking vivo)',bidChg+' cambi in '+bidSeas+' stagioni',bidChg>=bidSeas));
  r('Qualificate: ogni Conference manda esattamente i suoi posti (dirette + vincitrici del Play-in), 16 ai Nationals','qualif','sì');
  r('Play-in: gare secche tra le squadre dopo le dirette (2ª-3ª, oppure 2ª-5ª e 3ª-4ª, 3ª-6ª e 4ª-5ª), le altre fuori','playin','sì');
  r('Nationals: 4 gironi da 4, una squadra per fascia del ranking, 3 partite a girone','gironi',`sì (${pools} gironi)`);
  rows.push(row('Nationals: Conference diverse nello stesso girone quando si puo\'',conflicts+' accoppiamenti della stessa Conference su '+pools+' gironi',conflicts<=Math.ceil(pools*0.1)));
  r('Tabellone: prequarti 2ª-3ª di altri gironi, quarti, semifinali e finale senza accoppiamenti duplicati','tabellone','sì');
  rows.push(row('Titoli e percorsi diversi tra le stagioni (le gerarchie cambiano)',champs.size+' campioni, '+stages.size+' esiti per il tuo club',champs.size>=2&&stages.size>=2));
  r('Ranking nazionale numerico e storico di stagione','ranking','sì');r('Storico della stagione con esito USA','storico','sì');
  r('Salvataggio: ricarica a metà stagione','salvataggio','sì');
  r('Stelle del mercato presenti nei club USA: nel club, non sul mercato','stelle','sì');
  r('Overall dai dati Fantasy dei Nationals: il migliore di ogni club sta tra i primi 5, i giocatori di rendimento sono in rosa, le stelle non scendono sotto la fama, rose da 20 (fino a 28 dove il foglio di revisione ha più giocatori)','fantasy','sì');
  r('I giocatori delle iscrizioni USA Ultimate entrano nelle rose dei club senza dati Fantasy','roster','sì');
  r('Età dalle schede pubbliche UFA e dai limiti delle convocazioni giovanili U20/U24: in rosa, esatte dove note, mai oltre il limite','eta','sì');
  r('Premiati All-UFA 2026 almeno a metà della propria rosa','premi','sì');
  r('Internazionali del mercato: provenienza solo da club dei Nationals/europei o paese (mai squadre UFA), senza doppioni, Overall coerente con i premi','stelle',`sì (${STARS.length} giocatori)`);
  r('Classifica USA: le viste Conference, Nationals (gironi e tabellone) e Ranking si aprono in ogni fase della stagione','viste','sì');
  r('Cambio di lega Italia ↔ USA: allenatore e trofei restano','lega','sì');
  r('USA Women: rosa corta, mercato, salvataggio, Nationals e stagione successiva','women','sì');
  r('Campionato italiano invariato','italia','sì');
  return rows;
}
function runUsaDiag(){
  if(diagBusy)return;diagBusy=true;
  $('dgOut').innerHTML='';$('dgState').textContent='Carriere USA di prova…';
  setTimeout(()=>{
    const rows=usaSelfTest(6,2026),ok=rows.filter(r=>r.ok).length;diagBusy=false;
    $('dgOut').innerHTML=`<div class="ccard" style="margin-bottom:6px"><h3>Campionato USA: carriere Men’s e Women’s</h3><ul class="nlist">${rows.map(r=>`<li><i style="color:${r.ok?'var(--good)':'var(--bad)'}">${r.ok?'OK':'NO'}</i> ${esc(r.name)}: <b>${esc(r.val)}</b></li>`).join('')}</ul></div>`;
    $('dgState').textContent=`Finito: ${ok} controlli superati su ${rows.length}.`;
  },60);
}
$('dgUs').addEventListener('click',runUsaDiag);

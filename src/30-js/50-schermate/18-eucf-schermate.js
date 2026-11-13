/* ===================== EUCF: SCHERMATE =====================
   Cruscotto, linea delle giornate, presentazione e Classifica del campionato europeo (regole in 36-europa/01-eucf.js). Gironi e tabellone usano gli stessi
   pezzi dei Nationals USA (usPoolHTML, usBracketHTML). */
const euRoundNames=['Prequarti','Quarti','Semifinale','Finale'];
function euHomeTab(){
  const E=SV.eu,row=(t,b,me)=>`<div class="${me?'me':''}"><span>${t}</span><b>${b}</b></div>`;
  if(E.state==='champ')return row('Campioni d’Europa','',true);
  if(E.state==='out'&&E.nat&&E.nat.rd>=3&&!E.nat.out)return row('Torneo in corso senza di voi','',true);
  const N=euEnsure();
  if(E.state==='on'&&N.rd<=2&&!N.ord){const p=t16Pool(N,SV.team);if(p>=0)return usRanking(N.tabs[p],N.pools[p]).map((n,i)=>row(`${i+1}. ${esc(n)}`,`${N.tabs[p][n].w}–${N.tabs[p][n].l}`,n===SV.team)).join('');}
  return row(E.state==='on'&&E.cur?esc(E.cur.label):'Eliminati','',true);
}
const euEventSub=()=>{const E=SV.eu;if(E.state==='on'){euEnsure();return 'EUCF: '+(E.cur?E.cur.label.toLowerCase():'in corso');}return E.state==='champ'?'EUCF: campioni d’Europa':'EUCF concluso';};
const euCardSub=()=>{const E=SV.eu;return E.state==='champ'?'Campioni.':(E.state==='out'?'Eliminati.':(E.cur?E.cur.label+'.':''));};
function euTimeline(node){
  const E=SV.eu;euEnsure();
  const prev=E.lastRes?node(E.lastRes.win?'w':'l',(E.lastRes.win?'V ':'S ')+E.lastRes.su+'–'+E.lastRes.so,shortN(E.lastRes.opp)):node('f','Inizio','EUCF');
  const cur=E.state==='on'&&E.cur?node('n',E.cur.label.replace(/ · partita /,' · ').replace(' di 3','/3'),shortN(E.cur.opp)):node('n',E.state==='champ'?'Campioni':'Fuori','EUCF');
  const nxt=E.state==='on'&&E.nat.rd<6?node('f',E.nat.rd<2?'Girone '+(E.nat.rd+2)+'/3':euRoundNames[Math.min(3,Math.max(0,E.nat.rd-2))],'se avanzate'):node('f','Fine','torneo');
  return `<div class="tline">${[prev,cur,nxt].join('')}</div>`;
}
function euStakes(){
  const E=SV.eu,N=euEnsure(),rd=N.rd,lines=[];let title;
  if(rd<3){title=E.cur.label;lines.push(rd===2?'Ultima partita del girone: le prime vanno ai quarti, le seconde e le terze ai prequarti, le quarte sono fuori.':'Tre partite a girone: a parità decidono gli scontri diretti e la differenza mete.');}
  else{title=['Prequarti','Quarti di finale','Semifinale','Finale'][rd-3];lines.push(rd===6?'Chi vince è campione d’Europa: trofeo, reputazione e '+Math.round(EU_PRIZE[4]*SR_K.A)+' crediti.':'Eliminazione diretta: chi perde è fuori. In palio '+Math.round(EU_PRIZE[rd-2]*SR_K.A)+' crediti.');}
  return {tag:'EUCF',title,lines};
}
function euView(){
  const E=SV.eu,N=euEnsure();let h='';
  const st=E.state==='champ'?'Siete campioni d’Europa!':(E.state==='out'?(N.rd>=7?'Siete fuori dall’EUCF.':'Eliminati.'):(E.cur?`${E.cur.label}: ${esc(E.cur.opp)}.`:''));
  h+=`<p class="estat">EUCF · stagione ${E.s} · ${st}</p>`;
  h+=`<p class="note" style="margin:0 0 6px">${E.state==='on'?'16 club in 4 gironi da 4 (fasce del ranking europeo): tre partite a girone, le prime vanno ai quarti, le seconde e le terze ai prequarti (2ª contro 3ª di un altro girone), le quarte sono fuori. Poi quarti, semifinali e finale. ':''}Tre club italiani e 13 club europei inventati. <b style="color:#4fe58f">Verde</b>: quarti · <b style="color:#ffd23f">giallo</b>: prequarti · <b style="color:#ff7b80">rosso</b>: fuori.</p>`;
  if(N.ko.length)h+=usBracketHTML(N);
  h+=[0,1,2,3].map(p=>usPoolHTML(p,N)).join('');
  if(E.state!=='on')h+=`${E.cash?`<p class="estat">Premi del torneo: ${E.cash} crediti</p>`:''}<p class="note" style="margin:0 0 8px">L’EUCF si gioca una volta a stagione: la prossima edizione è nella stagione dopo, se chiudete la Serie A tra le prime 3.</p><button type="button" class="go" id="eCamp">${SV.done?'Vai al campionato: nuova stagione':'Torna al campionato'}</button>`;
  else h+=`<p class="note" style="margin:8px 0 0">Premi: ${EU_PRIZE.map((v,i)=>Math.round(v*SR_K.A)+' crediti ('+['qualificazione ai quarti','prequarti','quarti','semifinale','finale'][i]+')').join(', ')}. Una sola edizione a stagione.</p>`;
  return h;
}

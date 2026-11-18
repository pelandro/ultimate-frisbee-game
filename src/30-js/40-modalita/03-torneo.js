/* ===================== TORNEO PERSONALIZZATO: eliminazione diretta a 4, 8 o 16 squadre vere, scelte da te ===================== */
const TN_KEY='ultimate-torneo';
const tnOk=n=>!!(TEAM[n]||US_TEAM[n]||LN_BY[n]);   // un club che esiste ancora (italiano, USA o di una lega europea)
let TOUR=null;try{TOUR=JSON.parse(localStorage.getItem(TN_KEY)||'null');if(TOUR&&(!Array.isArray(TOUR.rounds)||!tnOk(TOUR.team)||TOUR.rounds.some(r=>r.some(n=>!tnOk(n)))))TOUR=null;}catch(e){TOUR=null;}
const tnSave=()=>{try{if(TOUR)localStorage.setItem(TN_KEY,JSON.stringify(TOUR));else localStorage.removeItem(TN_KEY);}catch(e){}};
const TN_SET={team:'',size:8,pool:'lg',d:0,len:7};   // pool: 'lg' il campionato della tua squadra, 'grp' la sua serie, 'all' tutti i campionati della divisione
const tnRoundName=n=>n>=16?'Ottavi di finale':(n>=8?'Quarti di finale':(n>=4?'Semifinale':'Finale'));
const tnCur=()=>TOUR.rounds[TOUR.rounds.length-1];
function tnOpp(){const t=tnCur(),i=t.indexOf(TOUR.team);return i<0?null:t[i^1];}
function tnPools(team,kind){
  const league=qLgOf(team).clubs().filter(n=>n!==team);
  const division=qDivAll(qDivOf(team)).filter(n=>n!==team);
  const series=league.filter(n=>qGrp(n)===qGrp(team));
  if(kind==='all')return [[division,'della divisione']];
  const others=[division.filter(n=>!league.includes(n)),'di altri campionati'];
  if(kind==='lg')return [[league,'del campionato'],others];
  return [[series,'della serie'],[league.filter(n=>!series.includes(n)),'di altre serie'],others];
}
function tnCreate(){
  const me=TN_SET.team,shuffle=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(x=>x[1]);
  const pool=tnPools(me,TN_SET.pool).flatMap(([clubs])=>shuffle(clubs));
  TOUR={team:me,size:TN_SET.size,d:TN_SET.d,len:lenOk(TN_SET.len|0),rounds:[shuffle([me].concat(pool.slice(0,TN_SET.size-1)))],res:[],st:'play',champ:''};tnSave();
}
function tnSimRound(t,su,so){   // risultati di un turno: la tua partita e' quella giocata, le altre sono simulate
  const res=[],next=[];
  for(let i=0;i<t.length;i+=2){
    const a=t[i],b=t[i+1];let sa,sb;
    if(su!==undefined&&a===TOUR.team){sa=su;sb=so;}else if(su!==undefined&&b===TOUR.team){sa=so;sb=su;}
    else{const r=simMatch(qPower(a),qPower(b),0,lenOk(TOUR.len|0));sa=r.a;sb=r.b;}
    res.push([sa,sb]);next.push(sa>sb?a:b);
  }
  TOUR.res.push(res);return next;
}
function tnRecord(win,su,so){
  const t=tnCur();let next=tnSimRound(t,su,so),msg;
  if(!win){TOUR.st='out';msg=`Eliminati: ${tnRoundName(t.length).toLowerCase()} persa.`;while(next.length>1){TOUR.rounds.push(next);next=tnSimRound(next);}TOUR.champ=next[0];msg+=` Il torneo va a ${TOUR.champ}.`;}
  else if(next.length===1){TOUR.st='won';TOUR.champ=TOUR.team;msg='Avete vinto il torneo!';}
  else{TOUR.rounds.push(next);msg=`Si avanza: ${tnRoundName(next.length).toLowerCase()} contro ${tnOpp()}.`;}
  tnSave();return msg;
}
function startTourn(sim){
  if(!TOUR||TOUR.st!=='play')return;
  const a=TOUR.team,b=tnOpp();if(!b)return;
  if(sim){const r=simMatch(qPower(a),qPower(b)+(DIFF_PLUS[clamp(TOUR.d|0,0,3)]||0),TOUR.d,lenOk(TOUR.len|0)),w=r.a>r.b,msg=tnRecord(w,r.a,r.b);showSim(w,`${a} ${r.a} – ${r.b} ${b}`,msg,()=>renderTourn());return;}
  if(hasCareer()){persist();QM.bak=JSON.stringify(SV);}else QM.bak=null;   // la carriera resta com'e': viene rimessa alla fine
  QM.on=true;TN.on=true;UT.on=false;
  setSquad(qRoster(a,9));applyRoster(qRoster(b,7));oppBoost(DIFF_PLUS[clamp(TOUR.d|0,0,3)]);
  SQ.forEach(p=>{p.injNew=false;p.inj=0;p.cond=100;});
  G.formB=0;G.lines=null;G.injK=1;applyForm();
  G.oppName=b;G.myName=a;G.matchLabel='Torneo · '+tnRoundName(tnCur().length);
  newGame();G.target=lenOk(TOUR.len|0);rollWind();G.lvl=[0,clamp(TOUR.d|0,0,3)];G.oppPlus=DIFF_PLUS[clamp(TOUR.d|0,0,3)];G.idn=[null,teamIdentity(b,T[1])];G.xtr=(TOUR.d|0)===3;G.hint=(TOUR.d|0)===0;G.routes=(TOUR.d|0)<=1;G.inMatch=true;G.recorded=false;
  hideScreens();$('over').classList.add('hidden');
  startPoint(G.nextRec);cam.snap=true;
}
function renderTourn(){
  if(!TOUR){
    if(!TN_SET.team||!qClubOk(TN_SET.team))TN_SET.team=hasCareer()&&qClubOk(SV.team)?SV.team:'Grem';
    const opts=LEAGUES.flatMap(l=>qGrps(l).map(g=>[l,g])).map(([l,g])=>`<optgroup label="${esc(qLgTab(l)+' · '+g)}">${l.clubs().filter(n=>qGrp(n)===g).map(n=>`<option value="${esc(n)}"${n===TN_SET.team?' selected':''}>${esc(n)} (${Math.round(qPower(n))})</option>`).join('')}</optgroup>`).join('');
    const sel=(id,l,o,v)=>`<div><label for="${id}">${l}</label><select class="qs" id="${id}">${o.map(x=>`<option value="${x[0]}"${String(x[0])===String(v)?' selected':''}>${x[1]}</option>`).join('')}</select></div>`;
    $('tnBox').innerHTML=`<p class="note" style="margin:0 0 10px">Crea un torneo a eliminazione diretta con le squadre vere: scegli la tua (di qualsiasi campionato), quante partecipano e da dove arrivano le avversarie: le squadre femminili giocano solo tra loro. Le tue partite le giochi (o le simuli), le altre vengono simulate. Il torneo resta salvato finché non ne crei un altro.</p>
      <div class="tnset"><div><label for="tnSearch">Cerca squadra</label><input type="search" id="tnSearch" class="qs" autocomplete="off"> <label for="tnTeam">La tua squadra</label><select class="qs" id="tnTeam">${opts}</select></div>${sel('tnSize','Squadre',[[4,'4 · semifinali e finale'],[8,'8 · dai quarti'],[16,'16 · dagli ottavi']],TN_SET.size)}${sel('tnPool','Avversarie',[['lg','Dal suo campionato'],['grp','Dalla sua serie'],['all','Da tutti i campionati']],TN_SET.pool)}${sel('tnD','Difficoltà',[[0,'Facile'],[1,'Medio'],[2,'Difficile'],[3,'Estrema']],TN_SET.d)}${sel('tnLen','Durata',LEN_OPTS.map(o=>[o.n,o.name+' · '+o.n+' punti']),TN_SET.len)}</div>
      <p class="note" role="status" id="tnPoolNote"></p>
      <div class="schrow" style="margin-top:12px"><button type="button" class="go" id="tnGo">Crea il torneo</button></div>`;
    tnPoolPreview();
    return;
  }
  const cols=TOUR.rounds.map((t,ri)=>{
    const res=TOUR.res[ri],ms=[];
    for(let i=0;i<t.length;i+=2){
      const a=t[i],b=t[i+1],r=res&&res[i/2],mine=a===TOUR.team||b===TOUR.team,row=(n,sc,w)=>`<div class="${w?'w':''}${n===TOUR.team?' me':''}"><span>${crest(n,13)} ${esc(n)}</span><b>${sc}</b></div>`;
      ms.push(`<div class="tnm${mine&&!r?' cur':''}">${row(a,r?r[0]:'',r&&r[0]>r[1])}${row(b,r?r[1]:'',r&&r[1]>r[0])}</div>`);
    }
    return `<div class="tncol"><h3>${tnRoundName(t.length)}</h3>${ms.join('')}</div>`;
  }).join('');
  const opp=TOUR.st==='play'?tnOpp():null;
  const head=TOUR.st==='play'?`<div class="hrow" style="max-width:560px;margin-bottom:10px"><button class="hbtn hp" id="tnPlay" type="button"><span><strong>Gioca: ${tnRoundName(tnCur().length)}</strong><small>Contro ${esc(opp)} · forza ${Math.round(qPower(opp))} (tu ${Math.round(qPower(TOUR.team))})</small></span></button><button class="hbtn hsim" id="tnSim" type="button"><span><strong>Simula</strong><small>partita</small></span></button></div>`
    :`<p class="estat">${TOUR.st==='won'?'Hai vinto il torneo con '+esc(TOUR.team)+'!':'Eliminati. Vince '+esc(TOUR.champ)+'.'}</p>`;
  $('tnBox').innerHTML=head+`<div class="tncols">${cols}</div><div class="hlinks" style="margin-top:8px"><button class="hlink" id="tnNew" type="button">Nuovo torneo</button><span class="note" style="margin:0">Difficoltà: ${['Facile','Medio','Difficile','Estrema'][TOUR.d|0]} · si vince a ${lenOk(TOUR.len|0)} punti</span></div>`;
}
function tnPoolPreview(){
  const team=$('tnTeam').value;
  if(!team){$('tnPoolNote').textContent='Nessuna squadra trovata.';return;}
  let remaining=+$('tnSize').value-1;
  const parts=[];
  for(const [pool,label] of tnPools(team,$('tnPool').value)){
    const count=Math.min(remaining,pool.length);
    if(count)parts.push(count+' '+label);
    remaining-=count;
  }
  $('tnPoolNote').textContent='Avversarie: '+parts.join(' · ');
}
$('tnBox').addEventListener('change',e=>{
  if(['tnTeam','tnPool','tnSize'].includes(e.target.id))tnPoolPreview();
});
$('tnBox').addEventListener('input',e=>{
  if(e.target.id!=='tnSearch')return;
  const query=clubSearchText(e.target.value),select=$('tnTeam'),previous=select.value;
  for(const group of select.children){
    for(const option of group.children)option.hidden=!clubSearchText(option.value).includes(query);
    group.hidden=[...group.children].every(o=>o.hidden);
  }
  const match=[...select.options].find(o=>!o.hidden&&o.value===previous)||[...select.options].find(o=>!o.hidden);
  select.value=match?.value||'';
  $('tnGo').disabled=!match;
  tnPoolPreview();
});
$('tnBox').addEventListener('click',e=>{
  if(e.target.closest('#tnGo')){TN_SET.team=$('tnTeam').value;TN_SET.size=+$('tnSize').value;TN_SET.pool=$('tnPool').value;TN_SET.d=+$('tnD').value;TN_SET.len=+$('tnLen').value;tnCreate();renderTourn();}
  else if(e.target.closest('#tnPlay'))startTourn(false);
  else if(e.target.closest('#tnSim'))startTourn(true);
  else if(e.target.closest('#tnNew')){const b=e.target.closest('#tnNew');armed(b,TOUR.st==='play'?'Conferma: abbandona questo torneo':'Conferma','Nuovo torneo',()=>{TOUR=null;tnSave();renderTourn();});}
});
$('tnBack').addEventListener('click',()=>showScreen('title'));
$('tTourn').addEventListener('click',()=>showScreen('tourn'));

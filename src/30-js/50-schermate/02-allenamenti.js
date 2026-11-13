const trainSel=new Set();let trainRes=null;
// cinque indirizzi: quattro fanno crescere (e costano condizione), il Recupero la restituisce
const TR_OPTS=CATS.concat([{id:'rec',name:'Recupero',keys:[]}]);
const TR_SUB={tec:'Lancio, Buco, Sparo, Presa',atl:'Velocità, Scatto, Agilità, Salto, Resistenza',dif:'Difesa, Tuffo',tat:'Visione; di squadra anche affiatamento',rec:'Ridà condizione, nessuna crescita'};
function trainApply(p,opt,single){
  if(opt.id==='rec'){
    const before=p.cond;p.cond=clamp(p.cond+REST_GAIN+(single?8:0)+2*facLv('fis')+2*staffLv('fit'),0,100);
    let heal=false;if(single&&p.inj>1){p.inj--;heal=true;}   // il lavoro individuale di recupero accorcia di una partita uno stop lungo
    return {p,c:opt,changes:[],gain:0,rest:Math.round(p.cond-before),heal};
  }
  const it=trInt(),r=trainCategory(p,opt,trainMul(p)*(single?1.5:1)*it.g);   // il lavoro individuale rende il 50% in piu'; il campo di allenamento il 10% per livello; l'intensita' scelta fa il resto
  p.cond=clamp(p.cond-Math.round((single?TRAIN_COST1:TRAIN_COST)*it.c*(r.spec?1.15:1)),0,100);   // le sedute dell'indirizzo personale costano un po' di piu'
  if(Math.random()<(trainRisk(p)*it.r+(it.r>1?0.004:0))*(1-0.12*facLv('fis'))*(1-0.1*staffLv('fit'))){p.inj=1+Math.floor(Math.random()*2);r.hurt=p.inj;alertAdd('inj',`${pname(p)} si è infortunat${oa(p)} in allenamento: ${p.inj} ${p.inj>1?'partite':'partita'} di stop.`,{full:p.full,seen:1});}
  return r;
}
// riquadro del programma automatico (le regole sono in 30-carriera/15-programma-allenamenti.js)
function progHTML(){
  const pr=progOf(),pk=progTeamPick(),np=SQ.filter(p=>p.pri).length;
  return `<div class="tprog"><div class="tpr"><span>Programma automatico</span><button type="button" class="sg${pr.on?' on':''}" data-prog="1">${pr.on?'Acceso':'Spento'}</button><label>Squadra <select class="qs" data-progteam="1">${[['auto','Automatico']].concat(TR_OPTS.filter(c=>c.id!=='rec').map(c=>[c.id,c.name])).map(o=>`<option value="${o[0]}"${pr.team===o[0]?' selected':''}>${o[1]}</option>`).join('')}</select></label></div><small>${pr.on?`A ogni sessione il gioco fa da solo la seduta di squadra (adesso sceglierebbe ${pk.name}) e i 3 lavori individuali, e te lo scrive negli Avvisi.`:'Acceso, a ogni sessione il gioco fa da solo la seduta di squadra e i 3 lavori individuali: Recupero se la squadra è scarica, altrimenti l’indirizzo scelto qui.'} Priorità individuali: ${np?np+' su 3':'nessuna'} (si segnano nella scheda del giocatore, parte Sviluppo).</small></div>`;
}
function renderTrain(){
  const left=3-SQ.filter(p=>p.tr).length,open=trainOpen();
  $('tList').innerHTML=SQ.slice().sort((a,b)=>ovrX(b)-ovrX(a)).map(p=>{
    const blocked=p.tr||!open;
    return `<button type="button" class="prow${trainSel.has(p.id)?' on':''}${blocked?' dis':''}" data-i="${p.id}"${blocked?' disabled':''}><span class="chk"></span><span class="pn"><b>${esc(p.label||p.name)}</b><small>${POS_NAME[posOf(p)]} · ${p.age} anni · OVR ${ovr(p)} · pot. ${potTxt(p)}</small></span>${condBar(p.cond)}${p.inj?`<em class="bad">Inf. ${p.inj}</em>`:(p.tr?'<em>Fatto</em>':(p.pri?'<em class="pri">★ priorità</em>':''))}</button>`;
  }).join('');
  const one=trainSel.size===1?SQ[[...trainSel][0]]:null;
  const avgC=Math.round(SQ.reduce((a,p)=>a+p.cond,0)/SQ.length);
  $('tTeamBox').innerHTML=`<div class="tteam2"><strong>Tutta la squadra</strong><small>${!open?`Bloccato: prossima sessione tra ${trainWait()} ${trainWait()>1?'partite':'partita'}.`:(SV.tTeam?'Già fatto in questa giornata.':`Una volta a giornata. Ogni seduta costa ${Math.round(TRAIN_COST*trInt().c)} di condizione a tutti (media attuale ${avgC}); il Recupero ne ridà ${REST_GAIN}.`)}</small><div class="tint"><span>Intensità</span><div class="seg">${TR_INT.map((t,i)=>`<button type="button" class="sg${(SV.tInt|0)===i?' on':''}" data-int="${i}">${t.n}</button>`).join('')}</div><small>${trInt().n}: ${trInt().t}.</small></div><div class="ttypes t5">${TR_OPTS.map(c=>`<button type="button" class="ttype" data-team="${c.id}"${SV.tTeam||!open?' disabled':''}><strong>${c.name}</strong>${SV.tTeam||!open?'':`<small class="fc">${forecastTxt(trainForecast(SQ,c,false),c)}</small>`}</button>`).join('')}</div>${progHTML()}</div><strong class="tsing">Lavoro individuale: ${left} su 3 rimasti</strong>`;
  $('tTypes').className='ttypes t5';
  $('tTypes').innerHTML=TR_OPTS.map(c=>`<button type="button" class="ttype" data-k="${c.id}"${trainSel.size?'':' disabled'}><strong>${c.name}</strong><small>${TR_SUB[c.id]}</small>${one&&c.keys.length?`<small class="mt">livello ${catLevel(one,c)}</small>`:''}${trainSel.size?`<small class="fc">${forecastTxt(trainForecast([...trainSel].map(i=>SQ[i]),c,true),c)}</small>`:''}</button>`).join('');
  $('tHint').textContent=!open?`Allenamenti bloccati in questa difficoltà: la prossima sessione è tra ${trainWait()} ${trainWait()>1?'partite':'partita'}.`:left===0?'Hai già usato i 3 lavori individuali di questa giornata. Tornano dopo la prossima partita.':(trainSel.size?`${trainSel.size} ${trainSel.size>1?'giocatori selezionati':'giocatore selezionato'}: scegli l’indirizzo. Il lavoro individuale rende il 50% in più e costa ${Math.round(TRAIN_COST1*trInt().c)} di condizione.`:`Seleziona fino a ${left} giocatori per il lavoro individuale. I giovani e chi è lontano dal proprio potenziale crescono di più. Con la condizione sotto 45 allenarsi può causare infortuni (di più con l’intensità alta): fai recuperare chi è scarico. Gli infortunati possono fare solo Recupero.`);
  if(trainRes){
    const ups=trainRes.filter(r=>r.gain>0),flat=trainRes.filter(r=>!r.gain&&!r.rest&&r.c.keys.length),rest=trainRes.filter(r=>r.rest!==undefined),hurt=trainRes.filter(r=>r.hurt);
    $('tRes').innerHTML=`<div class="tres">${ups.map(r=>`<div class="up">${r.p.name}: ${r.changes.map(x=>`${LONG[x.k]} ${x.from}→${x.to}`).join(', ')}</div>`).join('')}${rest.length?`<div class="rs">Recupero: ${rest.length===1?rest[0].p.name+' +'+rest[0].rest:rest.length+' giocatori, in media +'+Math.round(rest.reduce((a,r)=>a+r.rest,0)/rest.length)} di condizione${rest.some(r=>r.heal)?', stop per infortunio accorciato di una partita':''}</div>`:''}${flat.length?`<div class="no">${flat.length===1?flat[0].p.name+': nessun progresso':flat.length+' giocatori senza progressi'} in questa seduta</div>`:''}${hurt.map(r=>`<div class="bad">${r.p.name} si è infortunato in allenamento: ${r.hurt} ${r.hurt>1?'partite':'partita'} di stop</div>`).join('')}${trainRes.note?`<div class="rs">${trainRes.note}</div>`:''}</div>`;
  }else $('tRes').innerHTML='';
}
$('tList').addEventListener('click',e=>{
  const b=e.target.closest('.prow');if(!b||b.disabled||!trainOpen())return;
  const i=+b.dataset.i;
  if(trainSel.has(i))trainSel.delete(i);
  else if(trainSel.size<3-SQ.filter(p=>p.tr).length)trainSel.add(i);
  trainRes=null;renderTrain();
});
$('tTypes').addEventListener('click',e=>{
  const b=e.target.closest('.ttype');if(!b||b.disabled||!trainOpen())return;
  const opt=TR_OPTS.find(c=>c.id===b.dataset.k),out=[];
  for(const i of trainSel){const p=SQ[i];if(p.tr||(p.inj&&opt.id!=='rec'))continue;out.push(trainApply(p,opt,true));p.tr=true;}
  if(!out.length)out.note='Gli infortunati possono fare solo Recupero.';
  trainSel.clear();trainRes=out;fixLines();persist();renderTrain();
});
$('tTeamBox').addEventListener('change',e=>{if(e.target.closest('[data-progteam]')){progOf().team=e.target.value;persist();renderTrain();}});
$('tTeamBox').addEventListener('click',e=>{
  if(e.target.closest('[data-prog]')){const pr=progOf();pr.on=!pr.on;trainRes=null;if(pr.on){const t=autoTrain();if(t){trainRes=[];trainRes.note=t;}}persist();renderTrain();return;}
  const it=e.target.closest('[data-int]');if(it){SV.tInt=+it.dataset.int;trainRes=null;persist();renderTrain();return;}   // intensita': vale per le sedute di squadra e per i lavori individuali
  const b=e.target.closest('.ttype');if(!b||b.disabled||SV.tTeam||!trainOpen())return;
  const opt=TR_OPTS.find(c=>c.id===b.dataset.team),out=[];
  for(const p of SQ){if(!p.inj||opt.id==='rec')out.push(trainApply(p,opt,false));}
  SV.tTeam=true;
  if(opt.id==='tat'){SV.chem=clamp(SV.chem+3,0,100);out.note='Affiatamento +3.';}
  if(opt.id==='rec'){SV.mor=clamp(SV.mor+2,0,100);out.note='Morale +2.';}
  trainSel.clear();trainRes=out;fixLines();persist();renderTrain();
});
$('tSr').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(teamLg==='US')teamCf=b.dataset.k;else teamTab=b.dataset.k;reliefName=null;renderTeams();});
$('tTeams').addEventListener('click',e=>{
  const b=e.target.closest('.tteam');if(!b)return;
  openCoach({mode:'new',team:b.dataset.n,relief:false});   // prima del via: nome e volto dell'allenatore
});
$('eCards').addEventListener('click',e=>{const b=e.target.closest('.ecard');if(!b)return;SV.event=b.dataset.e;persist();renderEvent();});
$('eBody').addEventListener('click',e=>{
  if(e.target.closest('#eCamp')){SV.event='camp';persist();renderEvent();return;}   // coppa conclusa: si torna al campionato (non riparte)
  if(!e.target.closest('#eReset'))return;
  if(SV.event!=='camp'||!SV.done||!SV.next)return;   // la nuova stagione parte solo a campionato concluso
  newSeason();
  persist();renderEvent();
});
for(const [b,sc] of [['rBack','home'],['eBack','home'],['tBack','home']])$(b).addEventListener('click',()=>showScreen(sc));
$('rBox').addEventListener('click',e=>{
  const rv=e.target.closest('[data-rv]');if(rv){rView=rv.dataset.rv;cardOpen=null;try{localStorage.setItem('ultimate-vista-rosa',rView);}catch(_){}renderRoster();return;}
  const cd=e.target.closest('[data-card]');if(cd){cardOpen=+cd.dataset.card;sellArm=null;nickEdit=null;rosterMsg='';renderRoster();return;}
  if(e.target.closest('.pcx')||(e.target.classList&&e.target.classList.contains('pcov'))){cardOpen=null;sellArm=null;nickEdit=null;rosterMsg='';renderRoster();return;}
  const rs=e.target.closest('[data-rest]');if(rs){const p=SQ[+rs.dataset.rest];if(p){rosterMsg=restPlayer(p);persist();}renderRoster();return;}
  const tk=e.target.closest('[data-talk]');if(tk){const p=SQ[+tk.dataset.talk];if(p){rosterMsg=talkPlayer(p);persist();}renderRoster();return;}
  const nk=e.target.closest('[data-nick]');if(nk){nickEdit=nickEdit===+nk.dataset.nick?null:+nk.dataset.nick;renderRoster();const i=$('nkIn');if(i){i.focus();i.select();}return;}
  const nx=e.target.closest('[data-nkx]');if(nx){nickEdit=null;renderRoster();return;}
  const no=e.target.closest('[data-nkok]');if(no){const p=SQ[+no.dataset.nkok],i=$('nkIn');if(p&&i){setNick(p,i.value);rosterMsg=p.nick?`Da adesso ${pname(p)} è «${p.nick}» in campo.`:`${pname(p)} torna a chiamarsi per cognome.`;persist();}nickEdit=null;renderRoster();return;}
  const pri=e.target.closest('[data-pri]');if(pri){const p=SQ[+pri.dataset.pri];if(p){if(p.pri)p.pri=0;else if(SQ.filter(q=>q.pri).length>=3)rosterMsg='Le priorità di allenamento sono già 3: togline una prima di aggiungerne un’altra.';else p.pri=1;persist();}renderRoster();return;}
  const rf=e.target.closest('[data-rf]');if(rf){rFilt=rf.dataset.rf;renderRoster();return;}
  const dt=e.target.closest('[data-dtab]');if(dt){const p=SQ[+dt.dataset.pid];if(p)detTab[p.full]=dt.dataset.dtab;renderRoster();return;}
  const sp=e.target.closest('[data-spec]');
  if(sp){const p=SQ[+sp.dataset.pid];if(p){rosterMsg=setSpec(p,sp.dataset.spec);persist();}renderRoster();return;}
  const lb=e.target.closest('.lb');
  if(lb){rosterMsg=lineToggle(SQ[+lb.dataset.id],lb.dataset.line);persist();renderRoster();return;}
  const sc=e.target.closest('[data-scout]');
  if(sc){if(scoutPlayer(SQ[+sc.dataset.scout]))persist();renderRoster();return;}
  const se=e.target.closest('[data-sell]');
  if(se){
    const id=+se.dataset.sell;if(sellArm!==id){sellArm=id;renderRoster();return;}
    sellArm=null;cardOpen=null;const nm=SQ[id].label||SQ[id].name,v=sellValue(SQ[id]);openDet.clear();
    if(sellPlayer(id)){rosterMsg=`${nm} ceduto per ${v} crediti.`;persist();}
    renderRoster();return;
  }
  const r=e.target.closest('tr.pl');if(!r)return;
  const id=+r.dataset.id;if(openDet.has(id))openDet.delete(id);else openDet.add(id);sellArm=null;renderRoster();
});
$('rTop').addEventListener('click',e=>{
  if(e.target.closest('#rAuto')){autoLines();fixLines();rosterMsg='Linee impostate: attacco con i migliori handler e cutter, difesa con i migliori difensori.';persist();renderRoster();}
  else if(e.target.closest('#rSmart')){SV.autoSub=!SV.autoSub;persist();renderRoster();}
});

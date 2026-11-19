/* ---- PROGRESSIONE E CLUB (P2): staff tecnico, intesa tra coppie, obiettivi personali, rapporti di scouting, specializzazioni ----
   Campi nuovi della carriera (tutti con valore predefinito in careerInit): SV.staff, SV.duo, e sui giocatori p.spec, p.goal, p.sad.
   Gli effetti si sommano con quelli delle strutture ma con un tetto (trainMul): nessuna combinazione rende gli allenamenti piu' di una volta e mezza. */
Object.assign(AL_KIND,{goal:['Obiettivo','#7fd8ff']});
/* ---- STAFF ---- */
const STAFF={
  fit:{n:'Preparatore atletico',d:'Fa rendere di più gli allenamenti',
    steps:['Crescita più rapida','Meno fatica nelle sedute intense','Lavoro individuale più efficace']},
  fis:{n:'Fisioterapista',d:'Previene gli infortuni e accelera il recupero',
    steps:['Meno infortuni','Recupero più rapido e stop brevi','Stop più brevi anche negli infortuni seri']},
  ana:{n:'Analista tattico',d:'Sblocca schemi per la carriera',
    steps:['Stack laterale e Zona a coppa','Esagono, Weave e Uomo con aiuti','T1, 1 in 3-4 e un consiglio in Posta per i derby']}
};
const STAFF_MAX=3,STAFF_WAGE=[0,24,80,190];
const staffLv=k=>(SV&&SV.staff&&SV.staff[k])|0;
const staffCost=k=>stPerson(k)?.x>=2?0:50*(staffLv(k)+1);
const trCostK=()=> (1-0.04*facLv('camp'))*(1-(SV.tInt===2?[0,0,0.1,0.15][staffLv('fit')]:0)-(hasTr('fit','res')?0.04:0));
const TRAIN_CAP=1.5;
function trainMul(p,single=false){
  const lv=staffLv('fit'),team=1+0.06*lv,individual=single&&lv===3?1.08:1;
  const youth=p.age<22&&hasTr('fit','young')?1.08:1;
  return carGrowK()*Math.min(TRAIN_CAP,(1+0.05*facLv('camp'))*team*individual*youth);
}
const physRecovery=()=>[0,0,3,5][staffLv('fis')]+(hasTr('fis','rec')?1:0);
const staffInjuryK=()=>Math.max(0.45,facInjuryK()*(1-0.1*staffLv('fis')));
function injuryStop(days){
  const lv=staffLv('fis');
  const cut=lv===3&&days>=5?2:lv>=2&&days>=2?1:0;
  return Math.max(1,days-cut-(days>=3&&hasTr('fis','fis')?1:0),Math.ceil(days/2));
}
/* ---- SPECIALIZZAZIONI (le regole stanno in 10-sim/11b-specializzazioni.js) ---- */
const specCost=p=>Math.round((40+2*Math.max(0,ovrX(p)-50))*(p.spec?1.5:1));
function setSpec(p,id){
  if(!SPECS[id]||p.spec===id)return '';
  const c=specCost(p);if(SV.cash<c)return 'Servono '+c+' crediti.';
  SV.cash-=c;const was=p.spec;p.spec=id;
  news(pname(p)+(was?' cambia indirizzo':' sceglie un indirizzo')+': '+SPECS[id].n+'.');
  return pname(p)+': indirizzo «'+SPECS[id].n+'» ('+c+' crediti).';
}
/* ---- INTESA ---- */
function duoBump(){
  if(!SV.duo)SV.duo={};
  for(const k of ['lineO','lineD']){
    const ids=matchLine(k).map(id=>SQ[id]).filter(p=>p&&!p.inj),H=ids.filter(p=>posOf(p)==='H'),C=ids.filter(p=>posOf(p)!=='H');
    for(const h of H)for(const c of C){const key=duoKey(h.full,c.full);SV.duo[key]=Math.min(DUO_FULL*2,(SV.duo[key]|0)+1);}
  }
}
const duoMap=()=>{const m={};for(const k in (SV.duo||{})){const n=SV.duo[k]|0;if(n>=2)m[k]=clamp(n/DUO_FULL,0,1);}return m;};
function duoDecay(){   // d'estate l'intesa si raffredda; chi non c'e' piu' sparisce
  const names=new Set(SQ.map(p=>p.full));
  for(const k in (SV.duo||{})){const [a,b]=k.split('|');const n=Math.floor((SV.duo[k]|0)*0.7);if(n<=0||!names.has(a)||!names.has(b))delete SV.duo[k];else SV.duo[k]=n;}
}
function duoList(p){   // i compagni con cui ha piu' intesa
  const out=[];for(const k in (SV.duo||{})){const [a,b]=k.split('|'),o=a===p.full?b:(b===p.full?a:null),n=SV.duo[k]|0;if(o&&n>=3){const q=byFull(o);if(q)out.push({q,n});}}
  return out.sort((x,y)=>y.n-x.n).slice(0,2);
}
/* ---- OBIETTIVI PERSONALI ---- */
const GOALS={
  play:{txt:(g)=>`giocare almeno ${g.tgt} partite`,cur:p=>p.car?p.car.ss.mp:0},
  g:{txt:g=>`segnare almeno ${g.tgt} mete`,cur:p=>p.car?p.car.ss.g:0},
  a:{txt:g=>`servire almeno ${g.tgt} assist`,cur:p=>p.car?p.car.ss.a:0},
  b:{txt:g=>`fare almeno ${g.tgt} difese`,cur:p=>p.car?p.car.ss.b:0},
  grow:{txt:g=>`arrivare a Overall ${g.tgt}`,cur:p=>ovrX(p)}
};
function goalFor(p){
  const R=SV.sched?SV.sched.length:15,ls=p.car&&p.car.ls,pos=posOf(p),top=SQ.slice().sort((a,b)=>ovrX(b)-ovrX(a)).slice(0,9).includes(p);
  if(p.age<=24&&ovrX(p)<capOvr(p)-3)return {id:'grow',tgt:Math.round(ovrX(p))+3};
  if(!top)return {id:'play',tgt:Math.ceil(R*0.6)};
  if(pos==='H')return {id:'a',tgt:Math.max(4,Math.ceil((ls?ls.a:3)*1.15)+1)};
  if(pos==='D')return {id:'b',tgt:Math.max(4,Math.ceil((ls?ls.b:3)*1.15)+1)};
  return {id:'g',tgt:Math.max(3,Math.ceil((ls?ls.g:2)*1.15)+1)};
}
const capOvr=p=>{const c={};for(const k of KEYS)c[k]=Math.max(p.s[k],capX(p,k));return rate(c,posOf(p));};   // Overall massimo raggiungibile (a statistiche tutte al massimo)
function goalsAssign(){
  if(!SV.sched)return;
  SV.goalsS=SV.season;for(const p of SQ)p.goal=undefined;
  const pick=SQ.filter(p=>!p.inj&&p.ret!==1).sort((a,b)=>ovrX(b)-ovrX(a));
  const chosen=pick.slice(0,2);const young=pick.find(p=>p.age<=22&&!chosen.includes(p));if(young)chosen.push(young);
  const lines=[];
  for(const p of chosen){const g=goalFor(p);g.s=SV.season;g.rw=Math.round(6*SR_K[SV.sr]);p.goal=g;lines.push(pname(p)+' vuole '+GOALS[g.id].txt(g));}
  if(lines.length)alertAdd('goal','Obiettivi personali di questa stagione: '+lines.join('; ')+'. Se li raggiungono sono più motivati; se restano delusi più volte, chiederanno di andare via.');
}
const goalOk=p=>!!(p.goal&&GOALS[p.goal.id]&&GOALS[p.goal.id].cur(p)>=p.goal.tgt);
function goalsEnd(){   // fine stagione: premio o delusione
  const ok=[],ko=[];
  for(const p of SQ){
    const g=p.goal;if(!g||g.done)continue;
    g.done=1;
    if(goalOk(p)){
      p.sad=0;p.dev=Math.min(1.5,(p.dev||1)+0.04);SV.cash+=g.rw;SV.mor=clamp(SV.mor+2,0,100);ok.push(pname(p));
      alertAdd('up',pname(p)+' ha raggiunto il suo obiettivo ('+GOALS[g.id].txt(g)+'): più motivat'+oa(p)+' e +'+g.rw+' crediti di premio. La sua crescita ne beneficerà.',{full:p.full,seen:1});
    }else{
      p.sad=(p.sad|0)+1;ko.push(pname(p));
      if(p.sad>=2&&!p.prom&&p.mood!==2&&SQ.length>SQ_MIN+1){p.mood=2;alertAdd('mood',pname(p)+' non ha raggiunto l’obiettivo per la seconda stagione di fila e chiede di essere cedut'+oa(p)+'.',{full:p.full,act:'unhappy'});}
      else alertAdd('mood',pname(p)+' ha mancato il suo obiettivo ('+GOALS[g.id].txt(g)+') ed è delus'+oa(p)+(p.sad>=2?': una terza delusione e se ne va':'')+'.',{full:p.full,seen:1});
    }
  }
}
/* ---- RAPPORTO DI SCOUTING: cio' che si sa di un giocatore dipende da quante volte e' stato osservato (sk 0-3) ---- */
function roleKeys(o){const w=ROLE_W[posOf(o)==='H'?'H':(posOf(o)==='D'?'D':'C')]||{};return KEYS.filter(k=>(w[k]||0)>=0.06);}
function scoutReport(o){
  const sk=o.sk|0,keys=roleKeys(o).sort((a,b)=>o.s[b]-o.s[a]),pos=posOf(o);
  if(sk<1)return '<span class="note">Osservalo almeno una volta per leggere il rapporto.</span>';
  const str=keys.slice(0,2).map(k=>`${LONG[k]} ${o.s[k]}`).join(', '),weak=keys.slice(-2).reverse().map(k=>`${LONG[k]} ${o.s[k]}`).join(', ');
  let h=`<b>Punti di forza</b>: ${str}.`;
  if(sk>=2){h+=` <b>Punti deboli</b>: ${weak}.`+(o.trait&&TRAITS[o.trait]?` <b>${TRAITS[o.trait][0]}</b>: ${TRAITS[o.trait][1].toLowerCase()}.`:'');}
  else h+=' <span class="note">Con una seconda osservazione: punti deboli e tratto.</span>';
  if(sk>=3){
    const deep=(o.s.vel+o.s.sal+o.s.spa)/3,short=(o.s.agi+o.s.pre+o.s.vis)/3,wide=(o.s.sca+o.s.vel)/2;
    const best=Math.max(deep,short,wide),sch=best===deep?'Verticale o T1 (gioco lungo)':(best===short?'Esagono o Weave (gioco corto)':'Orizzontale (campo largo)');
    const idn=teamIdentity('club|'+SV.team,bestSeven(squadData())),styl=idn.deep>0.3?'lungo':(idn.deep<-0.3?'corto':'misto');
    const same=(best===deep&&idn.deep>0.3)||(best===short&&idn.deep<-0.3);
    h+=` <b>Schemi adatti</b>: ${sch}. Il vostro gioco è ${styl}: ${same?'si inserisce bene':'porterebbe qualcosa di diverso'}.`;
    const same2=SQ.filter(p=>posOf(p)===pos).sort((a,b)=>ovrX(b)-ovrX(a)),slot=pos==='H'?3:4,cut=same2[slot-1],v=ovrX(o);
    h+=cut&&v>ovrX(cut)?` <b>In squadra</b>: prenderebbe il posto di ${esc(pname(cut))} (Overall ${ovr(cut)}).`:` <b>In squadra</b>: sarebbe una riserva${cut?' (il titolare più debole ha Overall '+ovr(cut)+')':''}.`;
  }else if(sk===2)h+=' <span class="note">Alla terza osservazione: schemi adatti e posto in squadra.</span>';
  return h;
}
// dopo ogni partita: intesa; a inizio stagione: obiettivi, decadimento dell'intesa
function progAfterMatch(){duoBump();}
function progSeasonStart(){duoDecay();goalsAssign();}
// pannelli (usati dal Club e dalla Rosa; lo staff e' disegnato in 04-club.js)
function goalsHTML(){
  const L=SQ.filter(p=>p.goal&&p.goal.s===SV.season);
  if(!L.length)return '<h3>Obiettivi dei giocatori</h3><p>Nessun obiettivo in questa stagione.</p>';
  return `<h3>Obiettivi dei giocatori</h3><ul class="nlist">${L.map(p=>{const g=p.goal,cur=Math.round(GOALS[g.id].cur(p)),ok=goalOk(p);return `<li><i style="color:${g.done?(ok?'var(--good)':'var(--bad)'):'#c2cbe6'}">${g.done?(ok?'OK':'NO'):cur+'/'+g.tgt}</i>${esc(pname(p))}: ${GOALS[g.id].txt(g)}${p.sad?` · deluso ${p.sad} volt${p.sad>1?'e':'a'}`:''}</li>`;}).join('')}</ul>`;
}
function specHTML(p){
  const S=p.spec?SPECS[p.spec]:null,c=specCost(p),room=Math.round(specRoom(p)*100);
  return `<div class="dspec"><b>Indirizzo di sviluppo</b>: ${S?`${S.n} (${S.d.split(':')[0]}) · margine ${room}%`:'nessuno'}<small>Orienta gli allenamenti su poche statistiche (fino a +${Math.round(SPEC_B*100)}%, meno con l’età e vicino al potenziale); le sedute dell’indirizzo costano il 15% di condizione in più. ${p.spec?'Cambiarlo costa di più.':''}</small><div class="schrow">${Object.keys(SPECS).map(id=>`<button type="button" class="sec${p.spec===id?' on':''}" data-spec="${id}" data-pid="${p.id}"${p.spec===id||SV.cash<c?' disabled':''} title="${esc(SPECS[id].d)}">${SPECS[id].n}</button>`).join('')}</div><small>Costo: ${c} crediti.</small></div>`;
}
const duoHTML=p=>{const L=duoList(p);return L.length?`<div class="dst"><b style="color:#7fd8ff;font-weight:400">Intesa</b>: ${L.map(x=>esc(pname(x.q))+' ('+Math.min(DUO_FULL,x.n)+'/'+DUO_FULL+' partite)').join(', ')}</div>`:'';};
const goalLineHTML=p=>p.goal&&p.goal.s===SV.season?`<div class="dst"><b style="color:#7fd8ff;font-weight:400">Obiettivo</b>: ${GOALS[p.goal.id].txt(p.goal)} (${Math.round(GOALS[p.goal.id].cur(p))}/${p.goal.tgt})${p.sad?' · deluso '+p.sad+' volte':''}</div>`:'';
/* ---- CONFRONTO TRA DUE GIOCATORI: statistiche una per una con la differenza, Overall, potenziale, eta', stipendio e valore ---- */
function compareHTML(a,b,la,lb){
  const cell=(k,va,vb)=>{const d=va-vb;return `<span>${k}</span><b>${va}</b><b>${vb}</b><i class="${d>0?'up':(d<0?'dn':'')}">${d>0?'+':''}${d||'='}</i>`;};
  const cap=s=>s.length>14?s.slice(0,13)+'…':s;
  let h=`<div class="cmp"><span></span><b>${esc(cap(la))}</b><b>${esc(cap(lb))}</b><i></i>`;
  h+=cell('Overall',ovr(a),ovr(b))+`<span>Potenziale</span><b>${potTxt(a)}</b><b>${potTxt(b)}</b><i></i>`+cell('Età',a.age,b.age);
  h+=`<span>Ruolo</span><b>${POS_NAME[posOf(a)]}</b><b>${POS_NAME[posOf(b)]}</b><i></i>`;
  for(const k of SHOW)h+=cell(LBL[k],a.s[k],b.s[k]);
  h+=cell('Stipendio',Math.round(wageOf(a)),Math.round(wageOf(b)))+cell('Valore',priceOf(a),priceOf(b));
  return h+'</div>';
}
// per il Mercato: il titolare piu' debole del ruolo (quello che il nuovo giocatore sostituirebbe), o il migliore se e' una riserva
function cmpTarget(o){
  const pos=posOf(o),same=SQ.filter(p=>posOf(p)===pos).sort((a,b)=>ovrX(b)-ovrX(a)),slot=pos==='H'?3:4;
  return same[Math.min(slot,same.length)-1]||same[0]||null;
}

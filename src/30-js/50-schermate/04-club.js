/* ---- SOCIETA': bilancio, obiettivo, strutture, albo d'oro, notizie, salvataggio ---- */
let clMsg='';
let clTab='man';const clInfo=new Set();
const awRow=a=>`<li class="${a.mine?'me':''}"><i>${a.k}</i><b>${esc(a.name)}</b> · ${esc(a.team)}${a.txt?' · '+a.txt:''}</li>`;
function renderClub(){
  const bach=clTab==='hon'||clTab==='ach'||clTab==='rec';   // Bacheca: albo d'oro, traguardi e record stanno insieme
  for(const b of $('clTabs').children)b.classList.toggle('on',b.dataset.k===(bach?'hon':clTab));
  let h='';
  if(clTab==='man'||clTab==='str'||clTab==='stf'){
    // Gestione divisa in tre pagine (Società, Strutture, Staff): prima erano tutte insieme e la schermata era troppo piena. Le spiegazioni lunghe stanno dietro al tasto «i» di ciascuna voce
    const inf=(k,txt)=>`<button type="button" class="inf${clInfo.has(k)?' on':''}" data-inf="${k}" aria-expanded="${clInfo.has(k)}" aria-label="${esc(k==='soc'?'Entrate e uscite della società':(k[0]==='f'&&FAC[k.slice(1)]?FAC[k.slice(1)][0]:k))}">i</button>${clInfo.has(k)?`<p class="infp">${txt}</p>`:''}`;
    const tick=(lv,max)=>`<span class="tk" aria-label="livello ${lv} su ${max}">${Array.from({length:max},(_,i)=>`<i class="${i<lv?'on':''}"></i>`).join('')}</span>`;
    const cSoc=`<div class="ccard"><h3>Società ${inf('soc',`<p><b>Entrate</b>. In casa incassi i biglietti: lo stadio ha <b>${stadCap()}</b> posti e i tifosi, la posta in gioco e la forma decidono quanti ne riempi. In trasferta niente biglietti e <b>${travelCost()}</b> di viaggio; in campo neutro (tornei, finali) i biglietti si dividono a metà. Lo sponsor paga a ogni partita e la lega premia ogni vittoria, di più nelle partite importanti.</p><p><b>Uscite</b>. Gli stipendi costano <b>${wageBill()}</b> a partita, la manutenzione delle strutture <b>${facUpkeep()}</b>.</p><p>La reputazione decide chi accetta di venire; morale e affiatamento spostano un poco la forma dei tuoi in partita.</p>`)}</h3><div class="dcash"><span>Crediti</span><b>${SV.cash}</b></div>${redNoteHTML()}${statBar('Tifosi',fansOf(),'#ff9a3a','%')}${statBar('Reputazione',SV.rep,'#ffd23f')}<div class="dbar"><span>Morale</span><span class="cbar"><i style="width:${Math.round(SV.mor)}%;background:#4fe58f"></i></span><b>${moodFace(teamMoodKey())}</b></div>${statBar('Affiatamento',SV.chem,'#5ac8ff')}</div>`;
    const cObj=sponsorCardHTML(),cLed=ledgerHTML();
    const cBud=budgetHTML();
    const cStr=`<div class="ccard"><h3>Strutture</h3>${Object.keys(FAC).map(k=>{const lv=facLv(k),c=facCost(k),dd=(SV.facDays&&SV.facDays[k])|0,rn=SV.facRnd|0,pb=budgetPayback(k);return `<div class="fbar"><span class="fn">${FAC[k][0]}${inf('f'+k,`${FAC[k][1]}.${pb?(pb.n?` Il prossimo livello rende circa ${pb.gain.toFixed(1).replace('.',',')} crediti a partita: si ripaga in ${pb.n} partite.`:' Al prossimo livello la manutenzione in più supera l’incasso in più.'):''} Premio estivo (livello ${KEEP_LV}+ per almeno metà stagione): ${FAC_KEEP[k]}.${rn?` Finora ${dd} giornate su ${rn}.`:''}`)}</span>${tick(lv,FAC_MAX)}<button type="button" class="sec" data-fac="${k}"${lv>=FAC_MAX||SV.cash<c?' disabled':''} title="${lv>=FAC_MAX?'Livello massimo':(SV.cash<c?'Servono '+c+' crediti':'Migliora per '+c+' crediti')}">${lv>=FAC_MAX?'Massimo':'Migliora · '+c}</button></div>`;}).join('')}<p class="sub">Manutenzione ${facUpkeep()} a partita. D’estate una struttura avanzata può perdere un livello.</p></div>`;
    const cStf=clTab==='stf'?staffHTML(inf):'',cGoal=`<div class="ccard">${goalsHTML()}</div>`;
    const cNews=`<div class="ccard" style="grid-column:1/-1"><h3>Notizie</h3>${SV.news.length?`<ul class="nlist">${SV.news.slice(0,8).map(n=>`<li><i>S${n.s}·G${n.r}</i>${esc(n.txt)}</li>`).join('')}</ul>`:'<p>Nessuna notizia.</p>'}</div>`;
    h='<div class="cgrid">'+(clTab==='man'?cSoc+cObj+cLed+cGoal+cNews:(clTab==='str'?cStr+cBud:cStf))+'</div>';
  }else if(clTab==='hon'){
    // bacheca: i trofei si accendono quando li vinci
    const t=SV.troph,tile=(v,l)=>`<div class="trt${v?' on':''}"><b>${v|0}</b><span>${l}</span></div>`;
    h=`<div class="trgrid">${tile(t.A,'Scudetti<br>Serie A')}${tile(t.B,'Titoli<br>Serie B')}${tile(t.C,'Titoli<br>Serie C')}${tile(t.promo,'Promozioni')}${tile(t.eu,'Titoli<br>europei')}${tile(t.aw,'Premi<br>individuali')}${tile(t.b7,'Presenze in<br>squadra ideale')}</div>`;
    h+=`<div class="ccard"><h3>Albo d’oro · Serie A</h3>${albHTML()}</div>`;
    h+=SV.hist.length?SV.hist.map(x=>{
      const aw=(x.aw||[]).map(awRow).join(''),b7=(x.best7||[]).map(q=>`${q.mine?'<b style="color:var(--gold)">':'<b>'}${esc(q.name)}</b> (${q.pos}, ${esc(q.team)})`).join(', ');
      const ch=x.champs?['A','B','C'].filter(k=>x.champs[k]).map(k=>`Serie ${k}: <b${x.champs[k]===SV.team?' style="color:var(--gold)"':''}>${esc(x.champs[k])}</b>`).join(' · '):'';
      return `<div class="seas"><h3>Stagione ${x.season} · Serie ${x.sr} · ${x.rank}° posto${x.n?' su '+x.n:''}</h3><p>${x.w} vinte, ${x.l} perse${x.obj?' · bonus dello sponsor':''}${x.short?' · '+esc(x.short):''}</p>${ch?`<p>Campioni: ${ch}</p>`:''}${aw?`<ul class="awl">${aw}</ul>`:''}${b7?`<p>Squadra ideale: ${b7}</p>`:''}${x.mvp?`<p>MVP della tua squadra: <b>${esc(x.mvp)}</b>${x.mvpS?' ('+x.mvpS+')':''}</p>`:''}</div>`;
    }).join(''):'<p class="note">Qui compariranno, stagione per stagione, la tua posizione, i campioni delle tre serie, i premi del campionato (MVP, attaccante, difensore, capocannoniere, re degli assist, rivelazione, allenatore dell’anno) e la squadra ideale.</p>';
  }else if(clTab==='ach'){
    h=achHTML();
  }else{
    // classifiche di sempre del club: giocatori in rosa piu' chi e' stato ceduto o si e' ritirato
    const all=SQ.filter(p=>p.car&&p.car.mp>0).map(p=>({name:p.label||p.name,mp:p.car.mp,g:p.car.g,a:p.car.a,b:p.car.b,aw:(p.aw||[]).length,cur:true})).concat(SV.former||[]);
    const lb=(k,l)=>{const r=all.filter(q=>q[k]>0).sort((a,b)=>b[k]-a[k]).slice(0,6);return `<div class="ccard"><h3>${l}</h3>${r.length?`<ol>${r.map(q=>`<li><div class="lbr"><span${q.cur?'':' style="color:#7f8db8"'}>${esc(q.name)}</span><b>${q[k]}</b></div></li>`).join('')}</ol>`:'<p>Ancora nessun dato.</p>'}</div>`;};
    h=`<div class="lbg">${lb('g','Mete di sempre')}${lb('a','Assist di sempre')}${lb('b','Difese di sempre')}${lb('mp','Presenze')}${lb('aw','Premi vinti')}</div>`;
    const rec=['g','a','b'].filter(k=>SV.rec[k]).map(k=>`<li><i>Record di ${SV.rec[k].lab} in una stagione</i>${SV.rec[k].v} · ${esc(SV.rec[k].name)} (stagione ${SV.rec[k].season})</li>`).join('');
    h+=`<div class="ccard" style="margin-top:10px"><h3>Record di una stagione</h3>${rec?`<ul class="nlist">${rec}</ul>`:'<p>I record di una stagione compariranno qui. In grigio, nelle classifiche, chi non è più in rosa.</p>'}</div>`;
    h+=`<div class="ccard hofbox" style="margin-top:10px"><h3>Hall of Fame</h3>${hofHTML()}</div>`;
  }
  if(bach)h=`<div class="seg csub" id="clSub">${[['hon','Albo d’oro'],['ach','Traguardi'],['rec','Record']].map(([k,l])=>`<button type="button" class="sg${clTab===k?' on':''}" data-k="${k}">${l}</button>`).join('')}</div>`+h;
  $('clBox').innerHTML=h;
}
$('clTabs').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;clTab=b.dataset.k;renderClub();});
const backupExtras=()=>[[UT_KEY,'Ultimate Team contro l’IA'],[UTR_KEY,'Collezione sfide online'],
  [UTH_KEY,'Superpoteri'],[TN_KEY,'Torneo'],[TUT_KEY,'Allenamento']];
function exportSave(){
  try{
    const extra={},slots={};
    for(const [key] of backupExtras()){
      const raw=localStorage.getItem(key);
      if(raw!==null)extra[key]=JSON.parse(raw);
    }
    const career={...SV,squad:squadData(),lineup:lineupIds()};
    for(let i=1;i<=SLOTS_N;i++){
      const slot=i===(SV.slot||1)?career:slotData(i);
      if(slot)slots[i]=slot;
    }
    const data=JSON.stringify({app:'ultimate-frisbee',v:SAVE_V,when:new Date().toISOString(),career,slots,extra});
    const a=document.createElement('a'),url=URL.createObjectURL(new Blob([data],{type:'application/json'}));
    a.href=url;a.download='ultimate-frisbee-backup.json';
    document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);
    return 'Backup esportato nei file scaricati.';
  }catch(e){return 'Esportazione non riuscita su questo dispositivo.';}
}
function readSaveBackup(txt){
  let d;try{d=JSON.parse(txt);}catch(e){return null;}
  const envelope=d?.app==='ultimate-frisbee';
  if(envelope&&d.v>SAVE_V)return null;
  const career=envelope?d.career:d;
  if(!careerSaveShape(career))return null;
  const slots=envelope?Object.entries(d.slots||{}):[];
  if(slots.some(([slot,save])=>!['1','2','3'].includes(slot)||!careerSaveShape(save)))return null;
  const extra=envelope?backupExtras().filter(([key])=>d.extra&&Object.hasOwn(d.extra,key)):[];
  if(extra.some(([key])=>{
    const item=d.extra[key];
    if(!item||typeof item!=='object'||Array.isArray(item))return true;
    if(key===TN_KEY)return !tnOk(item.team)||!['play','won','out'].includes(item.st)
      ||!Array.isArray(item.rounds)||!item.rounds.length
      ||!item.rounds.every(round=>Array.isArray(round)&&round.length>=2&&round.length%2===0&&round.every(tnOk))
      ||!Array.isArray(item.res);
    if(key===TUT_KEY)return (item.lv!==undefined&&!Number.isInteger(item.lv))||!item.best||typeof item.best!=='object';
    return !Array.isArray(item.col)||!item.col.every(card=>card&&typeof card.s==="object"&&card.s)||![item.sel,item.packs].every(Array.isArray);
  }))return null;
  return {career,slots,extra:extra.map(([key,label])=>[key,label,d.extra[key]])};
}
function importSave(txt,destination=SV.slot||1,all=false,withExtras=true){
  const backup=readSaveBackup(txt);
  if(!backup)return 'File non valido o incompatibile con questa versione. Controlla calendario, rosa e versione.';
  const previous=SV,squad=squadData(),lineup=lineupIds(),written=[];
  const restore=()=>{
    restoreCareerState(previous,squad,lineup);
    for(const [key,raw,attempt] of written.reverse()){
      try{if(localStorage.getItem(key)===attempt){if(raw===null)localStorage.removeItem(key);else localStorage.setItem(key,raw);}}catch(e){}
    }
  };
  try{
    const write=(key,value)=>{
      const raw=localStorage.getItem(key),attempt=JSON.stringify(value);
      localStorage.setItem(key,attempt);written.push([key,raw,attempt]);
    };
    if(careerStorageVersion!==undefined&&localStorage.getItem(SAVE_KEY)!==careerStorageVersion)
      return 'La carriera è stata aggiornata in un’altra scheda. Ricarica il gioco prima di importare.';
    if(all)destination=backup.career.slot||1;
    const slots=[];
    if(all)for(const [slot,save] of backup.slots){
      if(!loadSave(save))throw new Error('Slot incompatibile');
      if(+slot!==destination)slots.push([+slot,{...SV,slot:+slot}]);
    }
    if(!loadSave(backup.career))throw new Error('Carriera incompatibile');
    SV.slot=destination;
    if(previous.team&&(previous.slot||1)!==destination&&!slots.some(([slot])=>slot===(previous.slot||1)))
      write(slotKey(previous.slot||1),{...previous,squad,lineup});
    for(const [slot,save] of slots){
      const key=slotKey(slot),old=localStorage.getItem(key);
      if(old)write(key+'-bak',JSON.parse(old));
      write(key,save);
    }
    if(withExtras)for(const [key,,value] of backup.extra)write(key,value);
    if(!persist())throw new Error('Scrittura carriera');
  }catch(e){
    restore();
    return 'Import non riuscito. Controlla il file, lo spazio disponibile e le altre schede aperte.';
  }
  if(withExtras&&backup.extra.length){
    utLoad();
    try{
      TOUR=JSON.parse(localStorage.getItem(TN_KEY)||'null');
      const progress=JSON.parse(localStorage.getItem(TUT_KEY)||'null');
      if(progress)SCH={tut:!!progress.tut,lv:progress.lv|0,best:progress.best||{}};
    }catch(e){}
  }
  return '';
}
function previewSaveImport(txt,message,onSuccess){
  const backup=readSaveBackup(txt);
  if(!backup){message.textContent='File non valido o incompatibile con questa versione.';return;}
  const c=backup.career;
  const options=[1,2,3].map(i=>{
    const slot=slotInfo(i);
    return '<option value="'+i+'"'+(i===(SV.slot||1)?' selected':'')+'>Slot '+i+' · '+(slot?esc(slot.team):'vuoto')+'</option>';
  }).join('');
  const slots=backup.slots.length>1?'<option value="all">Tutti gli slot presenti nel file</option>':'';
  const contents=backup.slots.map(([i,slot])=>'Slot '+i+' · '+esc(slot.team)+' · stagione '+slot.season).join('<br>');
  const extras=backup.extra.length?'<p><label><input id="importExtras" type="checkbox"> Ripristina anche '+backup.extra.map(([,label])=>label).join(', ')+'</label></p>':'';
  askConfirm({title:'Importare il salvataggio?',danger:true,ok:'Importa',html:
    '<p>'+esc(c.team)+' · stagione '+c.season+'</p>'+(contents?'<p>'+contents+'</p>':'')+
    '<p><label for="importSlot">Destinazione</label> <select id="importSlot">'+options+slots+'</select></p>'+
    '<p>Il file sostituisce la carriera negli slot selezionati.</p>'+extras,onOk:()=>{
      const target=$('importSlot').value;
      const error=importSave(txt,+target,target==='all',!!$('importExtras')?.checked);
      message.textContent=error||'Carriera importata: '+SV.team+' · stagione '+SV.season+'.';
      if(!error)onSuccess();
    }});
}
$('clBox').addEventListener('click',e=>{
  if(e.target.closest('[data-cl-sponsor]')){
    if(SV.sp?.off&&!SV.evt){SV.evt={id:'spons',a:{}};openEvt();}
    return;
  }
  if(e.target.closest('[data-cl-roster]')){showScreen('roster');return;}
  const sb=e.target.closest('#clSub [data-k]');if(sb){clTab=sb.dataset.k;renderClub();return;}
  const ib=e.target.closest('[data-inf]');if(ib){const k=ib.dataset.inf;if(clInfo.has(k))clInfo.delete(k);else clInfo.add(k);renderClub();return;}
  const f=e.target.closest('[data-fac]');
  if(f){const k=f.dataset.fac,c=facCost(k),lv=facLv(k);if(lv>=FAC_MAX||SV.cash<c){renderClub();return;}
    const levels=Object.keys(FAC).reduce((sum,key)=>sum+facLv(key),0),upkeep=Math.round((levels+1)*.2);
    askConfirm({title:'Migliorare '+FAC[k][0]+'?',html:`<p>${esc(FAC[k][1])}.</p><table class="cfmt"><tr><td>Livello</td><td>${lv} → ${lv+1} su ${FAC_MAX}</td></tr><tr><td>Costo</td><td>${c} crediti</td></tr><tr><td>Crediti dopo</td><td${SV.cash-c<30?' class="bad"':''}>${SV.cash-c} crediti</td></tr></table><p>Manutenzione totale per partita: ${facUpkeep()} → ${upkeep} crediti.</p>`,ok:'Migliora per '+c,onOk:()=>{if(buyFac(k)){clMsg='';persist();}renderClub();}});
    return;}
  const sf=e.target.closest('[data-staff]');
  if(sf){
    const k=sf.dataset.staff,lv=staffLv(k),cost=staffCost(k);
    askConfirm({title:'Migliorare '+STAFF[k].n.toLowerCase()+'?',ok:'Migliora',html:
      `<p>${STAFF[k].d}.</p><p>Livello ${lv} → ${lv+1} · costo ${cost} crediti · stipendio ${STAFF_WAGE[lv+1]} a partita.</p><p>Saldo dopo l’operazione: ${SV.cash-cost} crediti.</p>`,
      onOk:()=>{if(buyStaff(k))persist();renderClub();$('clBox').querySelector('[data-staff="'+k+'"]:not([disabled])')?.focus();}});
    return;
  }
  const hb=e.target.closest('[data-hire]');if(hb){openHire(hb.dataset.hire);return;}
});
$('clExp').addEventListener('click',()=>{$('opMsg').textContent=exportSave();});
$('clImp').addEventListener('click',()=>{$('clFile').value='';$('clFile').click();});
$('clBak').addEventListener('click',()=>armed($('clBak'),'Conferma: torna al salvataggio precedente','Ripristina la copia precedente',()=>{
  let r=null;try{r=localStorage.getItem(slotKey(SV.slot||1)+'-bak');const legacy=localStorage.getItem(SAVE_KEY+'-bak');if(!r&&legacy&&(JSON.parse(legacy).slot||1)===(SV.slot||1))r=legacy;}catch(e2){}
  const error=r?importSave(r):'Nessuna copia precedente disponibile.';
  $('opMsg').textContent=error||'Copia precedente ripristinata.';
  if(!error){renderOpts();renderHome();}
}));
$('clFile').addEventListener('change',e=>{
  const f=e.target.files&&e.target.files[0];if(!f)return;
  const rd=new FileReader();
  rd.onload=()=>previewSaveImport(String(rd.result||''),$('opMsg'),()=>{renderOpts();renderHome();});
  rd.onerror=()=>{$('opMsg').textContent='Lettura del file non riuscita.';};
  rd.readAsText(f);
});

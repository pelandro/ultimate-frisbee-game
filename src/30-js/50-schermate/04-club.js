/* ---- SOCIETA': bilancio, obiettivo, strutture, albo d'oro, notizie, salvataggio ---- */
let clMsg='';
let clTab='man';const clInfo=new Set();
const awRow=a=>`<li class="${a.mine?'me':''}"><i>${a.k}</i><b>${esc(a.name)}</b> · ${esc(a.team)}${a.txt?' · '+a.txt:''}</li>`;
function renderClub(){
  for(const b of $('clTabs').children)b.classList.toggle('on',b.dataset.k===clTab);
  let h='';
  if(clTab==='man'){
    // Gestione: poche schede pulite. Le spiegazioni lunghe stanno dietro al tasto «i» di ciascuna voce
    const inf=(k,txt)=>`<button type="button" class="inf${clInfo.has(k)?' on':''}" data-inf="${k}" aria-label="Spiegazione">i</button>${clInfo.has(k)?`<p class="infp">${txt}</p>`:''}`;
    const tick=(lv,max)=>`<span class="tk" aria-label="livello ${lv} su ${max}">${Array.from({length:max},(_,i)=>`<i class="${i<lv?'on':''}"></i>`).join('')}</span>`;
    h='<div class="cgrid">';
    h+=`<div class="ccard"><h3>Società ${inf('soc',`Ogni partita porta <b>${matchIncome(true)}</b> crediti se vinci e <b>${matchIncome(false)}</b> se perdi, quanto più i tifosi sono tanti. Gli stipendi costano <b>${wageBill()}</b> a partita e la manutenzione delle strutture <b>${facUpkeep()}</b>. La reputazione decide chi accetta di venire; morale e affiatamento spostano un poco la forma dei tuoi in partita.`)}</h3><div class="dcash"><span>Crediti</span><b>${SV.cash}</b></div>${SV.cash<0?'<p class="bad">Conti in rosso: niente acquisti e il morale scende.</p>':''}${statBar('Tifosi',fansOf(),'#ff9a3a','%')}${statBar('Reputazione',SV.rep,'#ffd23f')}<div class="dbar"><span>Morale</span><span class="cbar"><i style="width:${Math.round(SV.mor)}%;background:#4fe58f"></i></span><b>${moodFace(teamMoodKey())}</b></div>${statBar('Affiatamento',SV.chem,'#5ac8ff')}</div>`;
    h+=`<div class="ccard"><h3>Obiettivo</h3>${SV.obj?`<p><b>${SV.obj.txt}</b></p><p class="sub">Premio ${SV.obj.reward} crediti${SV.event==='camp'&&SV.round>0?` · ora ${myRank()}ª`:''}</p>`:'<p>Nessun obiettivo.</p>'}${SV.chal?`<h3 style="margin-top:8px">Sfida della dirigenza</h3><p><b>${esc(chalTxt())}</b></p><p class="sub">${SV.chal.done?(SV.chal.won?'Riuscita: premio incassato.':'Non riuscita in questa stagione.'):'Facoltativa: '+SV.chal.reward+' crediti e reputazione se riesce, niente se non riesce.'}</p>`:''}</div>`;
    h+=budgetHTML();
    h+=`<div class="ccard"><h3>Strutture</h3>${Object.keys(FAC).map(k=>{const lv=facLv(k),c=facCost(k),dd=(SV.facDays&&SV.facDays[k])|0,rn=SV.facRnd|0,pb=budgetPayback(k);return `<div class="fbar"><span class="fn">${FAC[k][0]}${inf('f'+k,`${FAC[k][1]}.${pb?(pb.n?` Il prossimo livello rende circa ${pb.gain.toFixed(1).replace('.',',')} crediti a partita: si ripaga in ${pb.n} partite.`:' Al prossimo livello la manutenzione in più supera l’incasso in più.'):''} Premio estivo (livello ${KEEP_LV}+ per almeno metà stagione): ${FAC_KEEP[k]}.${rn?` Finora ${dd} giornate su ${rn}.`:''}`)}</span>${tick(lv,FAC_MAX)}<button type="button" class="sec" data-fac="${k}"${lv>=FAC_MAX||SV.cash<c?' disabled':''}>${lv>=FAC_MAX?'Massimo':c}</button></div>`;}).join('')}<p class="sub">Manutenzione ${facUpkeep()} a partita. D’estate una struttura avanzata può perdere un livello.</p></div>`;
    h+=`<div class="ccard"><h3>Staff ${inf('stf','Gli effetti sugli allenamenti non si sommano oltre +50% in totale (con il campo di allenamento).')}</h3><div class="staffg">${Object.keys(STAFF).map(k=>{const lv=staffLv(k),c=staffCost(k);return `<div class="scard"><b class="sr">${STAFF[k].n}</b>${starsHTML(lv/STAFF_MAX*5)}<small>${STAFF[k].d}</small><small class="sw">stipendio ${STAFF_WAGE[lv]} a partita</small><button type="button" class="sec" data-staff="${k}"${lv>=STAFF_MAX||SV.cash<c?' disabled':''}>${lv>=STAFF_MAX?'Massimo':(lv?'Migliora · ':'Ingaggia · ')+c}</button></div>`;}).join('')}</div><p class="sub">Stipendi dello staff: ${staffWage()} a partita.</p></div>`;
    h+=`<div class="ccard">${goalsHTML()}</div>`;
    h+=`<div class="ccard" style="grid-column:1/-1"><h3>Notizie</h3>${SV.news.length?`<ul class="nlist">${SV.news.slice(0,8).map(n=>`<li><i>S${n.s}·G${n.r}</i>${esc(n.txt)}</li>`).join('')}</ul>`:'<p>Nessuna notizia.</p>'}</div></div>`;
  }else if(clTab==='hon'){
    // bacheca: i trofei si accendono quando li vinci
    const t=SV.troph,tile=(v,l)=>`<div class="trt${v?' on':''}"><b>${v|0}</b><span>${l}</span></div>`;
    h=`<div class="trgrid">${tile(t.A,'Scudetti<br>Serie A')}${tile(t.B,'Titoli<br>Serie B')}${tile(t.C,'Titoli<br>Serie C')}${tile(t.promo,'Promozioni')}${tile(t.eu,'Titoli<br>europei')}${tile(t.aw,'Premi<br>individuali')}${tile(t.b7,'Presenze in<br>squadra ideale')}</div>`;
    h+=`<div class="ccard"><h3>Albo d’oro · Serie A</h3>${albHTML()}</div>`;
    h+=SV.hist.length?SV.hist.map(x=>{
      const aw=(x.aw||[]).map(awRow).join(''),b7=(x.best7||[]).map(q=>`${q.mine?'<b style="color:var(--gold)">':'<b>'}${esc(q.name)}</b> (${q.pos}, ${esc(q.team)})`).join(', ');
      const ch=x.champs?['A','B','C'].filter(k=>x.champs[k]).map(k=>`Serie ${k}: <b${x.champs[k]===SV.team?' style="color:var(--gold)"':''}>${esc(x.champs[k])}</b>`).join(' · '):'';
      return `<div class="seas"><h3>Stagione ${x.season} · Serie ${x.sr} · ${x.rank}° posto${x.n?' su '+x.n:''}</h3><p>${x.w} vinte, ${x.l} perse${x.obj?' · obiettivo raggiunto':''}${x.short?' · '+esc(x.short):''}</p>${ch?`<p>Campioni: ${ch}</p>`:''}${aw?`<ul class="awl">${aw}</ul>`:''}${b7?`<p>Squadra ideale: ${b7}</p>`:''}${x.mvp?`<p>MVP della tua squadra: <b>${esc(x.mvp)}</b>${x.mvpS?' ('+x.mvpS+')':''}</p>`:''}</div>`;
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
  $('clBox').innerHTML=h;
}
$('clTabs').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;clTab=b.dataset.k;renderClub();});
function exportSave(){
  persist();
  const extra={};for(const k of [UT_KEY,TN_KEY,TUT_KEY]){try{const v=localStorage.getItem(k);if(v)extra[k]=JSON.parse(v);}catch(e){}}
  const data=JSON.stringify({app:'ultimate-frisbee',v:SAVE_V,when:new Date().toISOString(),career:SV,extra});   // carriera, Ultimate Team, torneo e progressi dell'allenamento
  try{
    const a=document.createElement('a'),url=URL.createObjectURL(new Blob([data],{type:'application/json'}));
    a.href=url;a.download=`ultimate-frisbee-${SV.team.replace(/[^a-z0-9]+/gi,'-').toLowerCase()}-stagione${SV.season}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);
    return 'Salvataggio esportato nei file scaricati.';
  }catch(e){return 'Esportazione non riuscita su questo dispositivo.';}
}
// importazione: il file viene controllato prima di sostituire la carriera; se qualcosa non va resta quella attuale
function importSave(txt){
  let d;try{d=JSON.parse(txt);}catch(e){return 'Il file non è un salvataggio valido.';}
  const c=d&&d.app==='ultimate-frisbee'?d.career:d;
  if(!c||typeof c!=='object'||!c.team||!c.mem||!c.sched||!c.tab)return 'Il file non contiene una carriera.';
  if((c.v|0)>SAVE_V)return 'Salvataggio creato con una versione più recente del gioco.';
  const bak=JSON.stringify(SV);let ok=false;
  try{ok=loadSave(JSON.parse(JSON.stringify(c)));}catch(e){ok=false;}
  if(!ok){SV={};try{loadSave(JSON.parse(bak));}catch(e){}return 'Salvataggio non leggibile: la carriera attuale non è stata toccata.';}
  persist();
  if(d&&d.extra&&typeof d.extra==='object'){   // anche Ultimate Team, torneo e allenamento, se il file li contiene
    for(const k of [UT_KEY,TN_KEY,TUT_KEY])if(d.extra[k]){try{localStorage.setItem(k,JSON.stringify(d.extra[k]));}catch(e){}}
    utLoad();try{TOUR=JSON.parse(localStorage.getItem(TN_KEY)||'null');const o=JSON.parse(localStorage.getItem(TUT_KEY)||'null');if(o)SCH={tut:!!o.tut,lv:o.lv|0,best:o.best||{}};}catch(e){}
  }
  return '';
}
$('clBox').addEventListener('click',e=>{
  const ib=e.target.closest('[data-inf]');if(ib){const k=ib.dataset.inf;if(clInfo.has(k))clInfo.delete(k);else clInfo.add(k);renderClub();return;}
  const f=e.target.closest('[data-fac]');
  if(f){if(buyFac(f.dataset.fac)){clMsg='';persist();}renderClub();return;}
  const sf=e.target.closest('[data-staff]');
  if(sf){if(buyStaff(sf.dataset.staff)){clMsg='';persist();}renderClub();return;}
});
$('clExp').addEventListener('click',()=>{$('opMsg').textContent=exportSave();});
$('clImp').addEventListener('click',()=>{$('clFile').value='';$('clFile').click();});
$('clBak').addEventListener('click',()=>armed($('clBak'),'Conferma: torna al salvataggio precedente','Ripristina la copia precedente',()=>{
  let r=null;try{r=localStorage.getItem(SAVE_KEY+'-bak');}catch(e2){}
  $('opMsg').textContent=r?(importSave(r)||'Copia precedente ripristinata.'):'Nessuna copia precedente disponibile.';renderOpts();renderHome();
}));
$('clFile').addEventListener('change',e=>{
  const f=e.target.files&&e.target.files[0];if(!f)return;
  const rd=new FileReader();
  rd.onload=()=>{const err=importSave(String(rd.result||''));$('opMsg').textContent=err||`Carriera importata: ${SV.team}, ${SERIES_NAME[SV.sr]}, stagione ${SV.season}.`;renderOpts();renderHome();};
  rd.onerror=()=>{$('opMsg').textContent='Lettura del file non riuscita.';};
  rd.readAsText(f);
});

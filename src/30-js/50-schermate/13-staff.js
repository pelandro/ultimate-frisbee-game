/* ---- SOCIETÀ: schede dello staff e candidati ---- */
let hireK=null,hireMsg='';
// l'abilita' speciale della persona: nome e che cosa fa, scritti per esteso (prima il nome era un'etichetta minuscola e l'effetto stava dentro la «i»)
const habHTML=tr=>tr?`<div class="hab"><span>Specialità</span><b>${tr.n}</b><em>${tr.d}.</em></div>`:'';
const stTicks=lv=>`<span class="tk" aria-label="Livello ${lv} su ${STAFF_MAX}">${Array.from({length:STAFF_MAX},(_,i)=>`<i class="${i<lv?'on':'no'}"></i>`).join('')}</span>`;
function staffCardHTML(k){
  const lv=staffLv(k),s=stPerson(k),r=STAFF[k];
  if(!lv||!s)return `<div class="scard empty"><div class="sp"><span class="spav vac"></span><span class="spt"><b class="sr">${r.n}</b><small>Posto vacante</small></span></div><small class="sd">${r.d}</small><div class="sb"><button type="button" class="sec" data-hire="${k}">Scegli chi assumere</button></div></div>`;
  const on=clInfo.has('s'+k),tr=STAFF_TR[s.tr];
  return `<div class="scard"><div class="sp"><span class="spav">${avatar({look:s.lk,full:s.n,gen:true,t:0},48)}</span><span class="spt"><b class="sr">${esc(s.n)}</b><small>${r.n} · ${s.a} anni</small></span><button type="button" class="inf${on?' on':''}" data-inf="s${k}" aria-label="Effetto di ${esc(r.n.toLowerCase())}" aria-expanded="${on}">i</button></div>
    <div class="sl">${stTicks(lv)}<small>Livello ${lv}</small>${moodFace(staffMoodKey())}</div>
    <p class="sub">${r.steps[lv-1]}. ${staffAnnual(k)} crediti a stagione.${legacyStaffRate(k)?' Il vecchio stipendio vale fino a fine stagione.':''}</p>
    ${habHTML(tr)}
    ${on?`<p class="infp">${r.steps.slice(0,lv).map(text=>text+'.').join(' ')}</p>`:''}
    <div class="sb"><button type="button" class="sec" data-hire="${k}">Cambia</button><button type="button" class="sec" data-staff-cut="${k}">Rescindi</button></div></div>`;
}
function staffHTML(inf){
  return `<div class="ccard" style="grid-column:1/-1"><h3>Staff ${inf('stf','Il contratto resta attivo finché lo rescindi o cambi persona. Paghi gli stipendi durante il campionato.')}</h3><div class="staffg">${Object.keys(STAFF).map(staffCardHTML).join('')}</div><p class="sub">Stipendi dello staff · ${staffSeasonWage()} crediti a stagione.</p></div>`;
}
function staffQuoteHTML(k,level,cost){
  const f=budgetForecast();
  const delta=cost-staffRemaining(k);
  const row=(label,value)=>`<tr><td>${label}</td><td${value<0?' class="bad"':''}>${value} crediti</td></tr>`;
  return `<table class="cfmt">${cost?row('Costo della firma',cost):''}${row('Stipendio a stagione',staffAnnual(k,level))}${f.left?row('Cassa prevista prima dei premi',f.end-delta)+row('Cassa prevista dopo i premi',f.after-delta):row('Cassa dopo la firma',SV.cash-cost)}</table>`;
}
/* ---- finestra dei candidati ---- */
function openHire(k){hireK=k;hireMsg='';renderHire();$('hire').classList.remove('hidden');}
function closeHire(){hireK=null;$('hire').classList.add('hidden');}
function renderHire(){
  const k=hireK;if(!k)return;
  const old=stPerson(k);
  $('hireT').textContent='Assumi: '+STAFF[k].n;
  $('hireSub').textContent=(old&&staffLv(k)>=1?`Chi assumi prende il posto di ${old.n}. `:'')+STAFF[k].d+'.';
  $('hireList').innerHTML=staffCands(k).map((c,i)=>{
    const cost=staffHireCost(k,c.lv),tr=STAFF_TR[c.tr];
    return `<div class="hcn"><span class="spav">${avatar({look:c.lk,full:c.n,gen:true,t:0},48)}</span><b class="sr">${esc(c.n)}</b><small>${c.a} anni</small>${stTicks(c.lv)}<small>Livello ${c.lv}</small><small>${STAFF[k].steps[c.lv-1]}.</small>${habHTML(tr)}<small>${staffAnnual(k,c.lv)} crediti a stagione</small><button type="button" class="go sm" data-hirei="${i}"${SV.cash<cost?' disabled':''}>Assumi · ${cost}</button></div>`;
  }).join('');
  $('hireMsg').textContent=hireMsg||`Saldo: ${SV.cash}.`;
  $('hireRenew').textContent=`Altri candidati · ${STAFF_RENEW}`;$('hireRenew').disabled=SV.cash<STAFF_RENEW;
}
$('hireList').addEventListener('click',e=>{
  const b=e.target.closest('[data-hirei]');if(!b||!hireK)return;
  const k=hireK,i=+b.dataset.hirei,c=staffCands(k)[i];if(!c)return;const cost=staffHireCost(k,c.lv);
  askConfirm({title:'Assumere '+c.n+'?',html:`<p>Livello ${c.lv} · ${STAFF[k].steps[c.lv-1]}.</p>`+staffQuoteHTML(k,c.lv,cost)+
    (staffLv(k)?'<p>Chi ricopre ora il ruolo lascia il posto.</p>':''),ok:'Assumi per '+cost,onOk:()=>{
    const t=staffHire(k,i);if(!t){hireMsg='Fondi insufficienti.';renderHire();return;}
    persist();closeHire();renderClub();}});
});
$('hireRenew').addEventListener('click',()=>{if(hireK&&staffRenew(hireK)){hireMsg='';persist();}renderHire();});
$('hireX').addEventListener('click',closeHire);

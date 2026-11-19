/* ---- CLUB: lo staff come persone ----
   Una scheda per ruolo (ritratto in pixel art, nome, eta', livello, caratteristica speciale, umore) con «Migliora» e «Cambia».
   Un ruolo vacante mostra «Scegli chi assumere»; «Cambia» e quello aprono la finestra dei tre candidati (staffCands, 25-staff-persone.js). */
let hireK=null,hireMsg='';
// l'abilita' speciale della persona: nome e che cosa fa, scritti per esteso (prima il nome era un'etichetta minuscola e l'effetto stava dentro la «i»)
const habHTML=tr=>tr?`<div class="hab"><span>Abilità speciale</span><b>${tr.n}</b><em>${tr.d}.</em></div>`:'<div class="hab no"><span>Abilità speciale</span><em>Nessuna: conta solo il livello.</em></div>';
// tacche del livello: oro = livello attuale, azzurro = fin dove puo' arrivare, spente = oltre il suo massimo
const stTicks=(lv,pot)=>`<span class="tk" aria-label="livello ${lv} su ${STAFF_MAX}, può arrivare a ${pot}">${Array.from({length:STAFF_MAX},(_,i)=>`<i class="${i<lv?'on':(i<pot?'pt':'no')}"></i>`).join('')}</span>`;
function staffCardHTML(k){
  const lv=staffLv(k),s=stPerson(k),r=STAFF[k];
  if(!lv||!s)return `<div class="scard empty"><div class="sp"><span class="spav vac"></span><span class="spt"><b class="sr">${r.n}</b><small>Posto vacante</small></span></div><small class="sd">${r.d}</small><div class="sb"><button type="button" class="sec" data-hire="${k}">Scegli chi assumere</button></div></div>`;
  const c=staffCost(k),top=Math.min(STAFF_MAX,s.pot),on=clInfo.has('s'+k),tr=STAFF_TR[s.tr];
  return `<div class="scard"><div class="sp"><span class="spav">${avatar({look:s.lk,full:s.n,gen:true,t:0},48)}</span><span class="spt"><b class="sr">${esc(s.n)}</b><small>${r.n} · ${s.a} anni</small></span><button type="button" class="inf${on?' on':''}" data-inf="s${k}" aria-label="Effetto di ${esc(r.n.toLowerCase())}" aria-expanded="${on}">i</button></div>
    <div class="sl">${stTicks(lv,top)}<small>${lv<top?`può arrivare a ${top}`:'al suo massimo'}</small>${moodFace(staffMoodKey())}</div>
    <p class="sub">${r.d}. Stipendio: ${STAFF_WAGE[lv]} crediti a partita.</p>
    ${habHTML(tr)}
    ${on?`<p class="infp">${tr?` <b>${tr.n}</b>: ${tr.d.toLowerCase()}.`:''} Ogni due stagioni nel ruolo cresce da solo, fino al suo massimo.</p>`:''}
    <div class="sb"><button type="button" class="sec" data-staff="${k}"${lv>=top||SV.cash<c?' disabled':''}>${lv>=top?'Al massimo':'Migliora · '+c}</button><button type="button" class="sec" data-hire="${k}">Cambia</button></div></div>`;
}
function staffHTML(inf){
  return `<div class="ccard" style="grid-column:1/-1"><h3>Staff ${inf('stf','Quattro persone, una per ruolo. Gli effetti sugli allenamenti non si sommano oltre +50% in totale (con il campo di allenamento). Chi è bravo può essere chiamato da un altro club.')}</h3><div class="staffg">${Object.keys(STAFF).map(staffCardHTML).join('')}</div><p class="sub">Stipendi dello staff: ${staffWage()} a partita.</p></div>`;
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
    const cost=STAFF_HIRE[c.lv],tr=STAFF_TR[c.tr];
    return `<div class="hcn"><span class="spav">${avatar({look:c.lk,full:c.n,gen:true,t:0},48)}</span><b class="sr">${esc(c.n)}</b><small>${c.a} anni</small>${stTicks(c.lv,c.pot)}<small>Livello ${c.lv}${c.pot>c.lv?`, può arrivare a ${c.pot}`:' (al massimo)'}</small>${habHTML(tr)}<small>${STAFF_WAGE[c.lv]} crediti a partita</small><button type="button" class="go sm" data-hirei="${i}"${SV.cash<cost?' disabled':''}>Assumi · ${cost}</button></div>`;
  }).join('');
  $('hireMsg').textContent=hireMsg||`Hai ${SV.cash} crediti.`;
  $('hireRenew').textContent=`Altri candidati · ${STAFF_RENEW}`;$('hireRenew').disabled=SV.cash<STAFF_RENEW;
}
$('hireList').addEventListener('click',e=>{
  const b=e.target.closest('[data-hirei]');if(!b||!hireK)return;
  const k=hireK,i=+b.dataset.hirei,c=staffCands(k)[i];if(!c)return;const cost=STAFF_HIRE[c.lv];
  askConfirm({title:'Assumere '+c.n+'?',html:`<table class="cfmt"><tr><td>Livello</td><td>${c.lv}${c.pot>c.lv?` (può arrivare a ${c.pot})`:''}</td></tr><tr><td>Costo dell’assunzione</td><td>${cost} crediti</td></tr><tr><td>Stipendio</td><td>${STAFF_WAGE[c.lv]} a partita</td></tr><tr><td>Crediti dopo</td><td${SV.cash-cost<30?' class="bad"':''}>${SV.cash-cost} crediti</td></tr></table>${staffLv(k)?'<p>Chi ricopre ora il ruolo lascia il posto.</p>':''}`,ok:'Assumi per '+cost,onOk:()=>{
    const t=staffHire(k,i);if(!t){hireMsg='Servono più crediti.';renderHire();return;}
    persist();closeHire();renderClub();}});
});
$('hireRenew').addEventListener('click',()=>{if(hireK&&staffRenew(hireK)){hireMsg='';persist();}renderHire();});
$('hireX').addEventListener('click',closeHire);

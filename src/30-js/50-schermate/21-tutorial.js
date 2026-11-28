/* ---- TUTORIAL COMPLETO: capitoli e lezioni (contenuti in 20-tutorial-contenuti.js) ----
   E' il manuale che si legge a pezzi: ogni capitolo ha lezioni brevi (cosa fa, dove lo trovi, come si usa, un trucco). Si apre dal menu iniziale, dal cruscotto,
   dalla Guida a schede e dal tasto «Scopri di più» dei fumetti di primo accesso. Il gioco ricorda le lezioni lette (chiave «ultimate-tutorial» sul dispositivo,
   non nel salvataggio: vale per tutte le carriere). Non cambia nessuna regola: e' solo interfaccia. */
const TM_KEY='ultimate-tutorial';
let TD={};   // lezioni lette: {idLezione:1}
try{const o=JSON.parse(localStorage.getItem(TM_KEY)||'null');if(o&&typeof o==='object')for(const k in o)if(o[k]===1)TD[k]=1;}catch(e){}
const tutSave=()=>{try{localStorage.setItem(TM_KEY,JSON.stringify(TD));}catch(e){}};
let tutBack=null,tutCh=null,tutLs=null;
const tutLessons=()=>TUT.flatMap(c=>c.les.map(l=>({c,l})));
const tutRead=c=>c.les.filter(l=>TD[l.id]).length;
const tutBlock=b=>Array.isArray(b)?`<ul>${b.map(x=>`<li>${x}</li>`).join('')}</ul>`:`<p>${b}</p>`;
function tutRender(){
  const all=tutLessons(),done=all.filter(x=>TD[x.l.id]).length;let h='';
  const c=TUT.find(x=>x.id===tutCh),i=c?c.les.findIndex(l=>l.id===tutLs):-1,l=i>=0?c.les[i]:null;
  $('tuH').textContent=l?l.t:c?c.t:'Tutorial completo';
  if(l){
    TD[l.id]=1;tutSave();   // aprirla vale come averla letta
    const gi=all.findIndex(x=>x.l.id===l.id),pv=all[gi-1],nx=all[gi+1];
    h+=`<div class="tubody"><p class="tun">${esc(c.t)} · lezione ${i+1} di ${c.les.length}${l.w?' · '+l.w:''}</p>`+l.b.map(tutBlock).join('')+(l.tip?`<div class="tutip"><b>Trucco.</b> ${l.tip}</div>`:'')+'</div>';
    h+=`<div class="tunav"><button type="button" class="sec" data-tu="${pv?'l:'+pv.c.id+':'+pv.l.id:''}"${pv?'':' disabled'}>‹ Prima</button><button type="button" class="sec" data-tu="c:${c.id}">Elenco</button><button type="button" class="go" data-tu="${nx?'l:'+nx.c.id+':'+nx.l.id:'h'}">${nx?(nx.c===c?'Dopo ›':'Capitolo dopo ›'):'Fine'}</button></div>`;
  }else if(c){
    h+=`<p class="tupr">${c.intro}</p><div class="tuls">`+c.les.map((x,k)=>`<button type="button" class="tul${TD[x.id]?' done':''}" data-tu="l:${c.id}:${x.id}"><b>${TD[x.id]?'✓':k+1}</b><span>${x.t}</span></button>`).join('')+'</div>';
    h+='<div class="tufoot"><button type="button" class="sec" data-tu="h">‹ Tutti i capitoli</button></div>';
  }else{
    const nxt=all.find(x=>!TD[x.l.id]);
    h+=`<p class="tupr">${done?`Hai letto ${done} lezioni su ${all.length}.`:`${all.length} lezioni brevi, in ordine, per scoprire tutto il gioco.`} Ogni capitolo si legge da solo: parti dall’inizio oppure vai dritto a ciò che ti serve.</p><div class="tubar"><i style="width:${Math.round(done/all.length*100)}%"></i></div><div class="tuchs">`;
    h+=TUT.map(x=>`<button type="button" class="tuc" data-tu="c:${x.id}"><strong>${x.t}</strong><span>${x.sub}</span><em>${tutRead(x)===x.les.length?'✓ ':''}${tutRead(x)} di ${x.les.length} lezioni</em></button>`).join('')+'</div>';
    h+=`<div class="tufoot">${nxt?`<button type="button" class="go" data-tu="l:${nxt.c.id}:${nxt.l.id}">${done?'Continua da dove eri':'Comincia'}</button>`:''}<button type="button" class="sec" data-tu="g">Guida</button>${done?'<button type="button" class="sec" data-tu="r">Azzera i progressi</button>':''}</div>`;
  }
  $('tuBody').innerHTML=h;$('tuBody').scrollTop=0;
}
// ch/ls: capitolo e lezione da mostrare (senza: l'indice); back: cosa fare alla chiusura (per tornare dov'eri)
function openTut(ch,ls,back){
  tutBack=back||null;tutCh=ch||null;tutLs=ls||null;
  if(tutCh&&!TUT.some(c=>c.id===tutCh)){tutCh=tutLs=null;}
  if(tutLs&&!TUT.find(c=>c.id===tutCh).les.some(l=>l.id===tutLs))tutLs=null;
  tutRender();$('tut').classList.remove('hidden');
}
// apre direttamente una lezione dal suo id (per i collegamenti dalle altre schermate)
function openTutLesson(id,back){const x=tutLessons().find(y=>y.l.id===id);if(x)openTut(x.c.id,id,back);else openTut(null,null,back);}
function closeTut(){$('tut').classList.add('hidden');const f=tutBack;tutBack=null;if(f)f();}
$('tuBody').addEventListener('click',e=>{
  const b=e.target.closest('[data-tu]');if(!b||b.disabled)return;
  const [k,c,l]=b.dataset.tu.split(':');
  if(k==='h'){tutCh=tutLs=null;}
  else if(k==='c'){tutCh=c;tutLs=null;}
  else if(k==='l'){tutCh=c;tutLs=l;}
  else if(k==='g'){$('tut').classList.add('hidden');const f=tutBack;tutBack=null;openGuide(0,f);return;}
  else if(k==='r'){if(!b.dataset.sure){b.dataset.sure='1';b.textContent='Tocca ancora per azzerare';return;}TD={};tutSave();tutCh=tutLs=null;}   // due tocchi: niente finestre del browser
  tutRender();
});
$('tuX').addEventListener('click',closeTut);
// «indietro» del telefono/tastiera: Esc chiude il tutorial
window.addEventListener('keydown',e=>{if(e.code==='Escape'&&!$('tut').classList.contains('hidden')){e.stopImmediatePropagation();closeTut();}},true);
$('tTut').addEventListener('click',()=>openTut(null,null,null));
$('gdTut').addEventListener('click',()=>{$('guide').classList.add('hidden');const f=guideBack;guideBack=null;openTut(null,null,f);});
// fumetti di primo accesso: «Scopri di più» porta alla lezione della schermata
const TIP_LES={home:'car-cruscotto',roster:'car-rosa',market:'car-mercato',club:'car-club',train:'car-allenamenti',event:'car-classifica'};
$('tipMore').addEventListener('click',()=>{$('tip').classList.add('hidden');const f=tipAfter;tipAfter=null;openTutLesson(TIP_LES[tipKey]||'',f);});

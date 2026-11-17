/* ---- GUSCIO DELLA CARRIERA: barra in alto, navigazione laterale, «Questa settimana» ----
   Le sei schermate della carriera (Partita, Squadra, Settimana, Mercato, Campionato, Societa') hanno la stessa cornice: in alto stemma, stagione, crediti, posta e menu;
   a sinistra una colonna con le sei sezioni (con i bollini di cio' che richiede attenzione). showScreen() la mostra solo li' e hideScreens() la nasconde in partita.
   «Questa settimana» (cruscotto) elenca cio' che serve adesso e ogni riga porta alla schermata giusta: sostituisce le tessere e la barra scorrevole di prima. */
const CSC=['home','roster','train','market','club','event'];
let csCur='';   // la schermata di carriera aperta (vuoto fuori dalla carriera)
function shellShow(id){
  csCur=CSC.includes(id)?id:'';
  $('cshell').classList.toggle('hidden',!csCur);
  $('cmenu').classList.add('hidden');$('hMenu').setAttribute('aria-expanded','false');
  if(!csCur)return;
  for(const b of $('rail').children)b.classList.toggle('on',b.dataset.s===id);
  if(SV&&SV.team)renderShell();
}
// intestazione sempre aggiornata: stemma e nome del club, stagione e posizione, crediti, posta, volto dell'allenatore
function renderShell(){
  if(!SV||!SV.team||!csCur)return;
  const key=SV.team+'|'+SV.season;
  if($('hEvt').dataset.k!==key){$('hCrest').innerHTML=crest(SV.team,26);$('hEvt').textContent=SV.team;$('hEvt').dataset.k=key;}
  if(SV.coach&&$('hCoach').dataset.k!==JSON.stringify(SV.coach)){$('hCoach').innerHTML=avatar({look:SV.coach.lk,t:0},28);$('hCoach').dataset.k=JSON.stringify(SV.coach);$('hCoach').title=`${coachTitle()}: tocca per cambiare nome o volto`;$('hCoach').setAttribute('aria-label',`Il tuo allenatore, ${coachName()}: cambia nome o volto`);}
  $('hInfo').textContent=isUS()?usInfo():isLN()?lnInfo():`${SERIES_NAME[SV.sr]} · Stagione ${SV.season}`+(SV.event==='camp'?(SV.done?' · conclusa':(SV.round>0?` · ${myRank()}° posto`:'')):' · Campionato europeo');
  const cash=$('hCash'),v=String(Math.round(SV.cash));
  if(cash.textContent!==v){cash.textContent=v;cash.parentNode.classList.remove('bump');void cash.parentNode.offsetWidth;cash.parentNode.classList.add('bump');}   // il numero «saltella» quando cambia
  const nw=(SV.alerts||[]).filter(a=>!a.seen).length,pd=pendingAlerts();
  $('hBellB').textContent=nw||pd;$('hBellB').classList.toggle('hidden',!(nw||pd));
}
// ---- menu ----
$('hMenu').addEventListener('click',e=>{e.stopPropagation();const o=$('cmenu').classList.toggle('hidden');$('hMenu').setAttribute('aria-expanded',String(!o));});
document.addEventListener('click',e=>{if(!$('cmenu').classList.contains('hidden')&&!e.target.closest('#cmenu')&&!e.target.closest('#hMenu')){$('cmenu').classList.add('hidden');$('hMenu').setAttribute('aria-expanded','false');}});
$('cmenu').addEventListener('click',()=>{$('cmenu').classList.add('hidden');$('hMenu').setAttribute('aria-expanded','false');});   // qualsiasi voce chiude il menu
window.addEventListener('keydown',e=>{if(e.code==='Escape'&&!$('cmenu').classList.contains('hidden')){e.stopImmediatePropagation();$('cmenu').classList.add('hidden');$('hMenu').setAttribute('aria-expanded','false');}},true);
// ---- navigazione laterale ----
$('hHome').addEventListener('click',()=>showScreen('home'));
$('hClubBtn').addEventListener('click',()=>showScreen('club'));
// ---- Questa settimana ----
// [classe, testo, destinazione]: warn = da sistemare, bad = urgente, ok = una buona notizia
function todoItems(){
  const L=[],trained=SQ.filter(p=>p.tr).length,left=3-trained,hurt=SQ.filter(p=>p.inj),low=SQ.filter(p=>p.cond<50&&!p.inj);
  const lineBad=SV.lineO.length<7||SV.lineD.length<7||SQ.some(p=>p.inj&&(SV.lineO.includes(p.full)||SV.lineD.includes(p.full)));
  const pd=pendingAlerts(),nw=(SV.alerts||[]).filter(a=>!a.seen).length;
  if(SV.cash<0)L.push(['bad','Conti in rosso: niente acquisti','club']);
  if(pd)L.push(['bad',`${pd} ${pd>1?'decisioni da prendere':'decisione da prendere'}`,'alerts']);
  if(lineBad)L.push(['bad','Sistema le linee: ce n’è una incompleta o con un infortunato','roster']);
  if(hurt.length)L.push(['warn',`Infortunati: ${hurt.length} (${hurt.slice(0,2).map(p=>pname(p)).join(', ')}${hurt.length>2?'…':''})`,'roster']);
  if(low.length>=2)L.push(['warn',`${low.length} giocatori scarichi: un recupero li rimette in forma`,'train']);
  if(trainOpen()&&(!SV.tTeam||left>0))L.push(['warn',!SV.tTeam?'Allenamento della settimana da fare':`Restano ${left} lavori individuali`,'train']);
  if(SV.mkSeen!==SV.mkN)L.push(['ok','Il mercato si è rinnovato','market']);
  if(nw&&!pd)L.push(['ok',`${nw} ${nw>1?'novità':'novità'} nella Posta`,'alerts']);
  if(SV.chal&&!SV.chal.done)L.push(['ok','Sfida della dirigenza in corso','club']);
  return L;
}
function renderTodo(){
  const L=todoItems(),m=nextMatch();
  $('hTodo').innerHTML=L.length?L.map(([c,t,g])=>`<li><button type="button" class="tdi ${c}" data-go="${g}"><i></i><span>${esc(t)}</span></button></li>`).join(''):`<li class="tdok">${m?'Tutto in ordine: puoi giocare.':'Niente da sistemare per ora.'}</li>`;
}
$('hTodo').addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(!b)return;const g=b.dataset.go;if(g==='alerts')openAlerts();else showScreen(g);});

// ---- informazioni a scomparsa: le spiegazioni lunghe stanno dietro un pulsante «i» (chiuse all'apertura della pagina), cosi' si vede subito cio' che serve ----
// infoB(k) = il pulsante, infoX(k,html) = il riquadro che si apre sotto; lo stato (aperto/chiuso) resta anche quando la schermata si ridisegna
const INFO_ON=new Set();
const infoB=k=>`<button type="button" class="infb${INFO_ON.has(k)?' on':''}" data-info="${k}" aria-label="Informazioni" aria-expanded="${INFO_ON.has(k)}">i</button>`;
const infoX=(k,html)=>`<div class="infbox${INFO_ON.has(k)?'':' hidden'}" data-infobox="${k}">${html}</div>`;
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-info]');if(!b)return;const k=b.dataset.info,on=!INFO_ON.has(k);
  if(on)INFO_ON.add(k);else INFO_ON.delete(k);
  for(const x of document.querySelectorAll('[data-info="'+k+'"]')){x.classList.toggle('on',on);x.setAttribute('aria-expanded',String(on));}
  for(const x of document.querySelectorAll('[data-infobox="'+k+'"]'))x.classList.toggle('hidden',!on);
});

// testi delle spiegazioni lunghe di Squadra e Mercato (prima erano paragrafi in fondo alla pagina)
const ROST_INFO=`<p><b>OVR</b>: il valore del giocatore nel suo ruolo migliore. Per un Handler contano lanci e visione, per un Cutter presa, velocità, scatto, agilità e salto, per un Defender difesa e atletismo.</p><p><b>POT</b>: il potenziale stimato. All’inizio è un intervallo che si stringe osservando il giocatore o tenendolo in rosa (dopo tre stagioni è certo).</p><p><b>Cond</b>: la condizione fisica. Scende con partite e allenamenti, risale con il riposo e il Recupero; chi è scarico rende meno e si infortuna più facilmente.</p><p><b>ATT</b> e <b>DIF</b>: le due linee. ATT gioca le mete in cui ricevi il pull, DIF quelle in cui lo tiri. Chi sta in entrambe non riposa mai: in partita rende ${DBL_PEN} punti in meno e si stanca il doppio (con meno di 14 giocatori qualcuno deve farlo per forza).</p><p>Con i cambi intelligenti chi è stanco esce da solo per una meta. Tocca un giocatore per aprire la scheda: ruolo, tratto, statistiche, numeri della stagione, osservazione e cessione.</p>`,MK_INFO=`<p>Sul mercato trovi giovani promesse, svincolati, giocatori in vendita da altre squadre (costano il 30% in più) e, con la stella, giocatori internazionali veri: campioni della lega americana e d’Europa, buoni giocatori e veterani.</p><p>Del potenziale vedi solo un intervallo: ogni osservazione lo stringe. I più forti arrivano solo se la società ha abbastanza reputazione.</p><p>L’elenco si rinnova ogni 5 giornate e a ogni nuova stagione. Per cedere un giocatore apri la sua scheda in Squadra.</p>`;

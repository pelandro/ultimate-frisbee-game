/* ---- CRUSCOTTO: LINEA DELLE GIORNATE, BARRA «CONSIGLIO», FUMETTI DI PRIMO ACCESSO ----
   Linea delle giornate (timelineHTML): l'ultima partita con il risultato, quella di adesso e la prossima, come la striscia gialla di Retro Bowl.
   Barra «Consiglio» (adviceList): una riga che scorre in fondo al cruscotto, scelta in base a cio' che serve davvero adesso (crediti da spendere, giocatori scarichi,
   linee incomplete, tifosi in calo) e, se non c'e' niente di urgente, un consiglio di gioco; a ogni giornata ne esce uno diverso.
   Fumetti (tipOnce): la prima volta che apri una schermata della carriera un riquadro con «OK» spiega a che cosa serve. Ciascuno compare una volta (SV.tips),
   si possono spegnere o rivedere dalle Opzioni (Suggerimenti). */
function oppAt(r){
  const names=SV.mem[SV.sr],ui=names.indexOf(SV.team),pr=SV.sched[r]&&SV.sched[r].find(m=>m[0]===ui||m[1]===ui);
  return pr?names[pr[0]===ui?pr[1]:pr[0]]:'';
}
const shortN=n=>{const s=String(n).replace(/ \([ABC]\)$/,'');return s.length>14?s.slice(0,13)+'…':s;};
function timelineHTML(){
  const node=(cls,top,bot)=>`<span class="tl ${cls}"><i></i><b>${esc(top)}</b><small>${esc(bot)}</small></span>`;
  let nodes;
  if(SV.event==='eu'){
    return euTimeline(node);   // EUCF: 18-eucf-schermate.js
  }else if(isUS()){
    return usTimelineHTML(node);   // campionato USA: 15-usa-schermate.js
  }else{
    if(SV.po&&SV.po.on){   // playoff: l'ultima partita, il turno di adesso e quello dopo
      const l=SV.po.last,r0=SV.res[SV.res.length-1];
      const prev=l?node(l.win?'w':'l',(l.win?'V ':'S ')+l.su+'–'+l.so,l.label+' · '+shortN(l.opp)):(r0?node(r0.su>r0.so?'w':'l',(r0.su>r0.so?'V ':'S ')+r0.su+'–'+r0.so,'G'+SV.res.length+' · '+shortN(r0.opp)):node('f','Giornate','finite'));
      return `<div class="tline">${[prev,node('n',SV.po.round===0?'Semifinale':'Finale',shortN(SV.po.opp)),SV.po.round===0?node('f','Finale',SV.po.kind==='tit'?'scudetto':'promozione'):node('f','Fine','stagione')].join('')}</div>`;
    }
    const R=SV.sched.length,last=SV.res[SV.res.length-1],lastN=SV.res.length;
    const prev=last?node(last.su>last.so?'w':'l',(last.su>last.so?'V ':'S ')+last.su+'–'+last.so,'G'+lastN+' · '+shortN(last.opp)):node('f','Inizio','stagione '+SV.season);
    const cur=SV.done?node('n','Fine','posto '+(SV.next?SV.next.rank:myRank())+'°'):node('n','G'+(SV.round+1)+' di '+R,shortN(oppAt(SV.round))+(oppAt(SV.round)===SV.riv?' · derby':''));
    const nxt=SV.done?node('f','Nuova','stagione'):(SV.round+1<R?node('f','G'+(SV.round+2),shortN(oppAt(SV.round+1))):node('f','Ultima','giornata'));
    nodes=[prev,cur,nxt];
  }
  return `<div class="tline">${nodes.join('')}</div>`;
}
// consigli: [testo, urgenza] ; i piu' urgenti prima
function adviceList(){
  const L=[],hurt=SQ.filter(p=>p.inj&&!p.abs),low=SQ.filter(p=>p.cond<50&&!p.inj),lineBad=SV.lineO.length<7||SV.lineD.length<7||SQ.some(p=>p.inj&&(SV.lineO.includes(p.full)||SV.lineD.includes(p.full)));
  if(lineBad)L.push(['Una linea è incompleta o ha un infortunato: sistema le linee dalla Rosa (o «Linee consigliate»).',9]);
  if(SV.cash<0)L.push(['Conti in rosso: niente acquisti e il morale cala. Vendi una riserva o aspetta le prossime partite.',9]);
  if(low.length>=2)L.push([`${low.length} giocatori sono scarichi: un Recupero negli Allenamenti o un Riposo dalla scheda li rimette in forma.`,7]);
  if(trainOpen()&&!SV.tTeam)L.push(['C’è una sessione di allenamento da fare: la squadra cresce solo se la usi (o accendi il Programma automatico).',6]);
  if(fansOf()<35)L.push([`I tifosi sono pochi (${Math.round(fansOf())}%): le vittorie li riportano allo stadio e le Tribune ammorbidiscono le sconfitte.`,5]);
  if(SV.mor<45)L.push(['Il morale è basso: una vittoria, un premio o il Recupero lo alzano; un colloquio aiuta un singolo giocatore.',5]);
  const af=Object.keys(FAC).filter(k=>facLv(k)<FAC_MAX&&SV.cash>=facCost(k)+30).sort((a,b)=>facLv(a)-facLv(b))[0];
  if(af)L.push([`Hai ${SV.cash} crediti: ${FAC[af][0]} al livello ${facLv(af)+1} costa ${facCost(af)}. ${FAC[af][1]}.`,4]);
  if(SV.mkSeen!==SV.mkN)L.push(['Il mercato si è rinnovato: guarda le giovani promesse e chi è alla tua portata.',3]);
  if(hurt.length)L.push([`${esc(pname(hurt[0]))} è infortunat${oa(hurt[0])}: ${hurt[0].inj} ${hurt[0].inj>1?'partite':'partita'} di stop.`,3]);
  const base=['Tocca un compagno per chiamargli il taglio: lancia dove sta correndo, non dove si trova.','Il timeout (uno a partita) azzera lo stall e fa recuperare energia.','Con più Sparo il lanciatore arriva più lontano: lo vedi dall’arco rosso mentre mira.','Controlla il meteo prima di partire: con vento forte i lanci lunghi sono più difficili.','Un giocatore che resta fuori troppo a lungo diventa scontento: ruota le linee.','Le Tribune portano più tifosi e più incasso a ogni partita.','Il programma automatico degli Allenamenti fa le sedute al posto tuo.','Nel derby si guadagna di più, ma si perde di più.'];
  if(SV.obj)L.push([`Obiettivo della stagione: ${SV.obj.txt} (premio ${SV.obj.reward} crediti).`,2]);
  base.forEach(t=>L.push([t,0]));
  return L;
}
function adviceText(){
  const L=adviceList(),urgent=L.filter(x=>x[1]>=3).sort((a,b)=>b[1]-a[1]),rest=L.filter(x=>x[1]<3);
  const pool=urgent.length?urgent.concat(rest.filter(x=>x[1]===2),rest.slice(0,2)):rest.filter(x=>x[1]===2).concat(rest);
  return pool[((SV.round|0)+(SV.season|0))%pool.length][0];
}
function renderTicker(){
  const un=(SV.alerts||[]).filter(a=>!a.seen&&!(AL_URGENT[a.k]||a.act)),el=$('hTick'),sp=el.firstElementChild;
  const txt=un.length?'Novità: '+un[0].txt+(un.length>1?` (+${un.length-1} negli Avvisi)`:''):'Consiglio: '+adviceText();
  if(sp.dataset.t!==txt){sp.dataset.t=txt;sp.textContent=txt;sp.style.animationDuration=Math.max(14,txt.length*0.2)+'s';}
  el.classList.toggle('nw',un.length>0);
}
/* ---- fumetti ---- */
const TIPS={
  home:'Benvenuto nella tua carriera! Dal cruscotto vedi la prossima partita, la classifica e come stanno squadra e tifosi. Il tasto giallo fa giocare la partita, «Simula» la fa giocare al posto tuo. In basso scorre un consiglio.',
  roster:'Qui conosci i tuoi giocatori. Le stelle dicono quanto sono forti, la barra verde la condizione, la faccina l’umore. Tocca una carta per aprire la scheda: attributi, prestazioni e sviluppo, e le azioni Riposo, Colloquio e Soprannome. Con A e D scegli chi gioca in attacco e in difesa.',
  market:'Il mercato si rinnova ogni 5 giornate. Giovani promesse, svincolati e giocatori in vendita: osservali per scoprirne il potenziale. Alcuni hanno una motivazione (vuole giocare, ambizioso…) scritta sotto il nome. «Solo chi posso prendere» nasconde chi costa troppo.',
  club:'Il Club è la tua società: strutture (campo, fisio, vivaio, tribune, osservatori, sede), staff e conti. Ogni livello costa di più ma dà un vantaggio che si vede. Con il tasto «i» accanto a ogni voce leggi cosa fa.',
  train:'Allenarsi è il modo per far crescere la squadra. Scegli l’intensità e l’indirizzo: sopra i tasti vedi quanti punti ti aspetti e quanta condizione costa. Il programma automatico lo fa al posto tuo.',
  event:'In Classifica trovi la tua serie, le altre e i migliori marcatori. A fine stagione qui ci sono premi e riepilogo, e da qui parte la stagione nuova.'
};
const tipsOn=()=>{try{return localStorage.getItem('ultimate-suggerimenti')!=='0';}catch(e){return true;}};
let tipAfter=null;
// un fumetto non copre mai un altro riquadro (avvisi, imprevisti, risultati, pausa): se ce n'e' uno aperto aspetta la prossima volta
const overlayBusy=()=>['alerts','evt','simres','over','pause','opts','guide','intro','press','hire','pp'].some(id=>{const e=$(id);return e&&!e.classList.contains('hidden');});
function tipOnce(key,after){
  if(!tipsOn()||!SV||!SV.team||QM.on||!TIPS[key]||(SV.tips&&SV.tips[key])||overlayBusy())return false;
  if(!SV.tips)SV.tips={};SV.tips[key]=1;persist();
  $('tipTxt').textContent=TIPS[key];tipAfter=after||null;$('tip').classList.remove('hidden');return true;
}
$('tipOk').addEventListener('click',()=>{$('tip').classList.add('hidden');const f=tipAfter;tipAfter=null;if(f)f();});

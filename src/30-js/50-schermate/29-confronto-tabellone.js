/* ---- CONFRONTO E TABELLONE ----
   Il confronto «contro» della Partita veloce non c'e' piu': stemmi, serie e forza stanno nei riquadri delle squadre (updateQuick, 10-partita-avvio.js).
   Pausa: sotto «Riprendi» la colonna era vuota. Ora c'e' il tabellone della partita con le statistiche fin qui. */
function pauseBoard(){
  const el=$('paBoard');if(!el)return;
  if(G.drill){el.innerHTML='';return;}
  const my=G.myName||'Blu',on=G.oppName||'Rossi',pct=t=>G.st&&G.st.thr[t]?Math.round(G.st.cmp[t]/G.st.thr[t]*100)+'%':'–';
  const st=G.st?[['Lanci riusciti',pct(0),pct(1)],['Turnover causati',G.st.to[1],G.st.to[0]],['Prese mancate',G.st.drop[0],G.st.drop[1]]]:[];
  el.innerHTML=`<div class="osb"><span class="ot">${crest(my,28)}<b>${esc(teamAbbr(my))}</b></span><em>${G.score[0]}</em><i>–</i><em>${G.score[1]}</em><span class="ot r"><b>${esc(teamAbbr(on))}</b>${crest(on,28)}</span></div>`+
    `<p class="pabm">Meta ${G.pointNo}${G.target?' · si vince a '+G.target:''}</p>`+
    st.map(r=>`<div class="pabr"><span>${r[1]}</span><span>${r[0]}</span><span>${r[2]}</span></div>`).join('');
}

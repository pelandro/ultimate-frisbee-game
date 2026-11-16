/* ---- CONFRONTO E TABELLONE ----
   Partita veloce: sotto le scelte restava mezzo schermo vuoto. Ora c'e' il confronto «contro»: stemmi, divise che le squadre indosseranno in campo
   (le stesse di matchLook) e la forza a barre, con la favorita.
   Pausa: sotto «Riprendi» la colonna era vuota. Ora c'e' il tabellone della partita con le statistiche fin qui. */
const kitOf=(n,t)=>KITS[t][hashStr('kit|'+n)%KITS[t].length];
// divisa a pixel: maglia, pantaloncini e calzettoni, per la scheda del confronto
const kitHTML=k=>`<span class="qkit" aria-hidden="true"><i style="background:${k.shirt}"></i><i style="background:${k.shorts}"></i><i style="background:${k.socks}"></i></span>`;
function quickVs(){
  const el=$('qVs');if(!el)return;
  const a=QM.a,b=QM.b;if(!a||!b||a===b){el.innerHTML='';return;}
  const pa=Math.round(qPower(a)),pb=Math.round(qPower(b)),lo=Math.max(0,Math.min(pa,pb)-15),hi=Math.max(pa,pb)+3,w=p=>Math.round(clamp((p-lo)/Math.max(1,hi-lo),0.06,1)*100);
  const d=pa-pb,fav=Math.abs(d)<3?'Sfida equilibrata':`Favorita: ${esc(d>0?a:b)} (${Math.abs(d)} punti di forza in più)`;
  const side=(n,p,t)=>`<div class="qvt${t?' r':''}">${crest(n,44)}<b>${esc(n)}</b>${kitHTML(kitOf(n,t))}<span class="qvp"><i class="qvb ${t?'r':''}" style="width:${w(p)}%"></i><em>${p}</em></span></div>`;
  el.innerHTML=`${side(a,pa,0)}<div class="qvx">VS</div>${side(b,pb,1)}<p class="qvf">${fav}</p>`;
}
function pauseBoard(){
  const el=$('paBoard');if(!el)return;
  if(G.drill){el.innerHTML='';return;}
  const my=G.myName||'Blu',on=G.oppName||'Rossi',pct=t=>G.st&&G.st.thr[t]?Math.round(G.st.cmp[t]/G.st.thr[t]*100)+'%':'–';
  const st=G.st?[['Lanci riusciti',pct(0),pct(1)],['Turnover causati',G.st.to[1],G.st.to[0]],['Prese mancate',G.st.drop[0],G.st.drop[1]]]:[];
  el.innerHTML=`<div class="osb"><span class="ot">${crest(my,28)}<b>${esc(teamAbbr(my))}</b></span><em>${G.score[0]}</em><i>–</i><em>${G.score[1]}</em><span class="ot r"><b>${esc(teamAbbr(on))}</b>${crest(on,28)}</span></div>`+
    `<p class="pabm">Meta ${G.pointNo}${G.target?' · si vince a '+G.target:''}</p>`+
    st.map(r=>`<div class="pabr"><span>${r[1]}</span><span>${r[0]}</span><span>${r[2]}</span></div>`).join('');
}

/* ---- STATISTICHE INDIVIDUALI PERSISTENTI DEL TUO CAMPIONATO ----
   Prima le statistiche degli avversari venivano ricostruite a fine stagione dai gol in classifica: durante l'anno non esistevano, e un giocatore
   trasferito o infortunato non lasciava traccia. Ora ogni partita del tuo girone assegna mete, assist e difese ai giocatori che scendono in campo
   (o.ss = stagione, o.cs = carriera), con la stessa regola di prima (ruolo e qualita'). Cosi' in Classifica c'e' la graduatoria dei marcatori
   aggiornata a ogni giornata, i premi di fine stagione leggono numeri veri e la carriera di un avversario si accumula negli anni.
   I tuoi giocatori usano le loro statistiche vere (p.car). Le carriere iniziate prima di questa versione ripiegano sulla ricostruzione finche' la stagione non ricomincia. */
const LS_TOP=11;   // i giocatori che ruotano in una partita
const lsOf=o=>o.ss||(o.ss={mp:0,g:0,a:0,b:0});
function lsMatch(team,goals){
  const all=SV.rost[team];if(!all||!all.length)return;
  const ro=all.filter(o=>!o.out).sort((x,y)=>ovrX(y)-ovrX(x)).slice(0,LS_TOP);if(!ro.length)return;
  const pick=(w,skip)=>{let tot=0;const ws=ro.map((o,i)=>{const v=i===skip?0:Math.max(0.1,w(o))*(i<7?1:0.45);tot+=v;return v;});let r=Math.random()*tot;for(let i=0;i<ro.length;i++){r-=ws[i];if(r<=0)return i;}return 0;};
  for(const o of ro)lsOf(o).mp++;
  for(let i=0;i<goals;i++){const sc=pick(o=>(o.r==='H'?0.5:1.5)*(rate(o.s,'C')-30),-1);lsOf(ro[sc]).g++;lsOf(ro[pick(o=>(o.r==='H'?1.6:0.6)*(rate(o.s,'H')-30),sc)]).a++;}
  const nb=Math.round(BLK_MATCH*carLen()/MATCH_TARGET);
  for(let i=0;i<nb;i++)lsOf(ro[pick(o=>rate(o.s,'D')-35,-1)]).b++;
}
// inizio stagione: la stagione appena finita entra nella carriera di ciascuno e il contatore riparte
function lsSeasonStart(){
  for(const n in SV.rost)for(const o of SV.rost[n]||[]){
    if(o.ss&&o.ss.mp){const c=o.cs||(o.cs={mp:0,g:0,a:0,b:0,yrs:0});c.mp+=o.ss.mp;c.g+=o.ss.g;c.a+=o.ss.a;c.b+=o.ss.b;c.yrs++;}
    if(o.ss)delete o.ss;
  }
  SV.lsOn=SV.season;   // da questa stagione i numeri sono quelli veri
}
const lsLive=()=>SV.lsOn===SV.season;
// elenco per le graduatorie del tuo campionato: i tuoi (statistiche vere) e gli avversari
function lsAll(sr){
  const out=[];
  for(const n of SV.mem[sr||SV.sr]){
    if(n===SV.team){for(const p of SQ){const c=p.car;if(c&&c.ss.mp>0)out.push({name:p.label||p.name,team:n,age:p.age,pos:posOf(p),g:c.ss.g,a:c.ss.a,b:c.ss.b,mp:c.ss.mp,mine:true,full:p.full});}continue;}
    for(const o of SV.rost[n]||[])if(o.ss&&o.ss.mp>0)out.push({name:o.label||o.n,team:n,age:o.age,pos:posOf(o),g:o.ss.g,a:o.ss.a,b:o.ss.b,mp:o.ss.mp,mine:false});
  }
  return out;
}
// le graduatorie mostrate in Classifica: mete, assist, difese
function leadersHTML(){
  if(!lsLive())return '';
  const all=lsAll();if(!all.length)return '';
  const col=(k,l)=>{const r=all.filter(x=>x[k]>0).sort((a,b)=>b[k]-a[k]||a.mp-b.mp||a.name.localeCompare(b.name)).slice(0,5);
    return `<div class="ccard"><h3>${l}</h3>${r.length?`<ol>${r.map(q=>`<li><div class="lbr"><span${q.mine?' style="color:var(--gold)"':''}>${esc(q.name)} <small>${esc(q.team)}</small></span><b>${q[k]}</b></div></li>`).join('')}</ol>`:'<p>Ancora nessun dato.</p>'}</div>`;};
  return `<h3 class="eh">I migliori di ${SERIES_NAME[SV.sr]}</h3><div class="lbg lb3">${col('g','Mete')}${col('a','Assist')}${col('b','Difese')}</div>`;
}

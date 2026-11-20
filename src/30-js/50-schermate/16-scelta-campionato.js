Warning: truncated output (original token count: 1700)
Total output lines: 59

/* ===================== SCELTA DEL CAMPIONATO, ROSTER DEI CLUB E SQUADRA DEL CUORE =====================
   Nuova carriera: schermata «Scegli il campionato» (una scheda per lega, in LEAGUES), poi «Scegli la tua squadra» solo con i club di quella lega. Toccando un club
   si apre il suo roster (la rosa con cui partiresti) con i tasti «Squadra del cuore» e «Allena questa squadra». Per aggiungere un campionato: una voce in
   LEAGUES (id, nome, testo, clubs, roster) e le sue schermate di scelta dei club; il resto della scelta (roster, cuore, allenatore) e' gia' comune.
   La squadra del cuore (una per campionato) e' una preferenza del dispositivo, non della carriera: chiave «ultimate-cuore» = {IT:nome, US:nome}.
   Compare per prima nell'elenco, con una stella. */
const LEAGUES=[
  {id:'IT',name:'Campionato italiano',sub:'Serie A, B e C · 46 squadre',ser:()=>'Serie A · Serie B · Serie C',txt:'Le squadre vere dei Campionati Italiani Ultimate Open 2026. Serie A, B e C a girone unico di sola andata: playoff in A, spareggi per la promozione in B e C, prime 3 all’EUCF. Si può anche subentrare a una squadra in crisi.',
    clubs:()=>[].concat(SERIES.A,SERIES.B,SERIES.C),roster:n=>realRoster(REAL[n]||[],'preview|'+n,realOpt(n,9)),sub2:n=>SERIES_NAME[TEAM[n].series]},
  {id:'US',name:'USA Men’s Club',sub:'48 club · 8 Conference',ser:()=>US_CK.length+' Conference',txt:'I club veri della divisione Men’s di USA Ultimate: 8 Conference (le regioni vere) da 6, Play-in e Nationals a 16 squadre. Niente promozioni né retrocessioni.',
    clubs:()=>US_NAMES,roster:n=>usRoster(n,'preview|'+n),sub2:n=>`${US_TEAM[n].city} · ${usConfName(US_TEAM[n].conf)}`}
].concat(LN_IDS.map(lk=>({id:lk,name:LN_DEF[lk].name,sub:LN_DEF[lk].sub,txt:LN_DEF[lk].txt,ser:()=>LN_DEF[lk].tiers.map(t=>t.name).join(' · '),
    clubs:()=>lnClubs(lk),roster:n=>lnRoster(n,'preview|'+n),sub2:n=>`${LN_DEF[lk].cc} · ${LN_TIER[lnKey(lk,LN_BY[n].t)].name}`})));   // leghe europee (37-leghe/): una …700 tokens truncated…ass();return;}
  const b=e.target.closest('[data-lg]');if(!b)return;teamLg=b.dataset.lg;teamMode='cuore';reliefName=null;showScreen('team');});
$('lgBack').addEventListener('click',()=>{if(lgDiv){lgDiv='';drawLeagues();femPass();}else teamBack();});
// ---- roster del club, prima di sceglierlo ----
let rpTeam='';
function openRosterPreview(n){
  rpTeam=n;const L=lgOf(),ro=L.roster(n).slice().sort((a,b)=>ovrX(b)-ovrX(a)),pw=Math.round(rosterPower(ro)),age=Math.round(ro.reduce((a,o)=>a+o.age,0)/Math.max(1,ro.length));
  $('rpT').innerHTML=`${crest(n,28)} ${esc(n)}`;
  $('rpS').textContent=`${L.sub2(n)} · forza ${pw} · ${ro.length} giocatori · età media ${age}`;
  const posN={H:'Handler',C:'Cutter',D:'Difensore'},gen=ro.some(o=>o.gen);
  $('rpBody').innerHTML=`<table class="rt"><tr><th>Giocatore</th><th>Ruolo</th><th>Età</th><th>Overall</th></tr>${ro.map(o=>`<tr><td>${esc(o.label||o.n)}${o.star?' <span class="tp" title="Giocatore internazionale del mercato">★ int.</span>':''}${o.gen?' <span class="tp" title="Giocatore generato dal gioco">gen.</span>':''}</td><td>${posN[posOf(o)]||''}</td><td>${o.age}</td><td><b>${Math.round(ovrX(o))}</b></td></tr>`).join('')}</table>`+`<p class="note" style="margin:6px 0 0">Questa è la rosa con cui parti.${L.id==='UW'?' Gli Overall e i ruoli con pochi dati sono stimati.':''}${gen?' «gen.» = giocatore generato dal gioco, non presente nelle fonti.':''}</p>`;
  $('rpFav').textContent=favGet()===n?'★ Squadra del cuore (togli)':'☆ Segna come squadra del cuore';
  $('rpv').classList.remove('hidden');$('rpBody').scrollTop=0;
}
$('rpX').addEventListener('click',()=>$('rpv').classList.add('hidden'));
$('rpFav').addEventListener('click',()=>{favSet(teamLg,favGet()===rpTeam?'':rpTeam);$('rpFav').textContent=favGet()===rpTeam?'★ Squadra del cuore (togli)':'☆ Segna come squadra del cuore';renderTeams();});
$('rpGo').addEventListener('click',()=>{$('rpv').classList.add('hidden');openCoach({mode:'new',team:rpTeam,relief:false});});

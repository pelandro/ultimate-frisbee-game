/* ===================== SCELTA DEL CAMPIONATO, ROSTER DEI CLUB E SQUADRA DEL CUORE =====================
   Nuova carriera: schermata «Scegli il campionato» (una scheda per lega, in LEAGUES), poi «Scegli la tua squadra» solo con i club di quella lega. Toccando un club
   si apre il suo roster (la rosa con cui partiresti) con i tasti «Squadra del cuore» e «Allena questa squadra». Per aggiungere un campionato: una voce in
   LEAGUES (id, nome, testo, clubs, roster) e le sue schermate di scelta dei club; il resto della scelta (roster, cuore, allenatore) e' gia' comune.
   La squadra del cuore (una per campionato) e' una preferenza del dispositivo, non della carriera: chiave «ultimate-cuore» = {IT:nome, US:nome}.
   Compare per prima nell'elenco, con una stella. */
const LEAGUES=[
  {id:'IT',name:'Campionato italiano',sub:'Serie A, B e C · 46 squadre',txt:'Le squadre vere dei Campionati Italiani Ultimate Open 2026. Si sale e si scende, con playoff scudetto e Coppa europea; si può anche subentrare a una squadra in crisi.',
    clubs:()=>[].concat(SERIES.A,SERIES.B,SERIES.C),roster:n=>realRoster(REAL[n]||[],'preview|'+n,Object.assign(realOpt(n,9),{low:true})),sub2:n=>SERIES_NAME[TEAM[n].series]},
  {id:'US',name:'USA Men’s Club',sub:'32 club · 4 Conference',txt:'I club veri della divisione Men’s di USA Ultimate: 4 Conference da 8, Play-in e Nationals a 16 squadre. Niente promozioni né retrocessioni.',
    clubs:()=>US_NAMES,roster:n=>usRoster(n,'preview|'+n,{low:true}),sub2:n=>`${US_TEAM[n].city} · ${usConfName(US_TEAM[n].conf)}`}
];
const lgOf=id=>LEAGUES.find(l=>l.id===(id||teamLg))||LEAGUES[0];
const FAV_KEY='ultimate-cuore';
function favAll(){try{return JSON.parse(localStorage.getItem(FAV_KEY)||'{}')||{};}catch(e){return {};}}
const favGet=lg=>{const n=favAll()[lg||teamLg];return n&&lgOf(lg).clubs().includes(n)?n:'';};
function favSet(lg,n){const f=favAll();if(n)f[lg]=n;else delete f[lg];try{localStorage.setItem(FAV_KEY,JSON.stringify(f));}catch(e){}}
const favMark=n=>n===favGet()?'★ ':'';
const favFirst=(a,b)=>(b===favGet())-(a===favGet());   // la squadra del cuore sta in cima
function renderLeagues(){
  $('lgList').innerHTML=LEAGUES.map(l=>{const f=favGet(l.id);return `<button type="button" class="ecard lgcard" data-lg="${l.id}"><strong>${esc(l.name)}</strong><small>${esc(l.sub)}</small><span class="lgtxt">${esc(l.txt)}</span>${f?`<span class="lgfav">★ Squadra del cuore: ${esc(f)}</span>`:''}</button>`;}).join('');
}
$('lgList').addEventListener('click',e=>{const b=e.target.closest('[data-lg]');if(!b)return;teamLg=b.dataset.lg;teamMode='cuore';reliefName=null;showScreen('team');});
$('lgBack').addEventListener('click',teamBack);
// ---- roster del club, prima di sceglierlo ----
let rpTeam='';
function openRosterPreview(n){
  rpTeam=n;const L=lgOf(),ro=L.roster(n).slice().sort((a,b)=>ovrX(b)-ovrX(a)),pw=Math.round(rosterPower(ro)),age=Math.round(ro.reduce((a,o)=>a+o.age,0)/Math.max(1,ro.length));
  $('rpT').innerHTML=`${crest(n,28)} ${esc(n)}`;
  $('rpS').textContent=`${L.sub2(n)} · forza ${pw} · ${ro.length} giocatori · età media ${age}`;
  const posN={H:'Handler',C:'Cutter',D:'Difensore'},gen=ro.some(o=>o.gen);
  $('rpBody').innerHTML=`<table class="rt"><tr><th>Giocatore</th><th>Ruolo</th><th>Età</th><th>Overall</th></tr>${ro.map(o=>`<tr><td>${esc(o.label||o.n)}${o.star?' <span class="tp" title="Giocatore internazionale del mercato">★ int.</span>':''}${o.gen?' <span class="tp" title="Giocatore generato dal gioco">gen.</span>':''}</td><td>${posN[posOf(o)]||''}</td><td>${o.ae?'~':''}${o.age}</td><td><b>${Math.round(ovrX(o))}</b></td></tr>`).join('')}</table>`+`<p class="note" style="margin:6px 0 0">Questa è la rosa con cui parti (un po' meno allenata di quella delle avversarie).${gen?' «gen.» = giocatore generato dal gioco, non presente nelle fonti.':''} ~ = età stimata.</p>`;
  $('rpFav').textContent=favGet()===n?'★ Squadra del cuore (togli)':'☆ Segna come squadra del cuore';
  $('rpv').classList.remove('hidden');$('rpBody').scrollTop=0;
}
$('rpX').addEventListener('click',()=>$('rpv').classList.add('hidden'));
$('rpFav').addEventListener('click',()=>{favSet(teamLg,favGet()===rpTeam?'':rpTeam);$('rpFav').textContent=favGet()===rpTeam?'★ Squadra del cuore (togli)':'☆ Segna come squadra del cuore';renderTeams();});
$('rpGo').addEventListener('click',()=>{$('rpv').classList.add('hidden');openCoach({mode:'new',team:rpTeam,relief:false});});

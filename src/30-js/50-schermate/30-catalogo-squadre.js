/* ===================== SQUADRE DELLE PARTITE FUORI CARRIERA (partita veloce, Superpoteri, torneo) =====================
   L'elenco viene dai campionati della carriera (LEAGUES, 16-scelta-campionato.js): un campionato o un club nuovo entra da solo anche qui.
   Per ogni club: il campionato (qLgOf), la categoria (qGrp: serie, livello o Conference, da clubLeagueTxt) e la rosa (qRoster, con foreignRoster
   per i club esteri). La divisione (maschile o femminile) resta separata come in carriera: le squadre femminili giocano solo tra loro. */
let qCat=null;   // nome del club -> id del campionato (gli elenchi non cambiano durante la sessione)
function qCatMap(){if(!qCat){qCat={};for(const l of LEAGUES)for(const n of l.clubs())if(!qCat[n])qCat[n]=l.id;}return qCat;}
const qLgOf=n=>lgOf(qCatMap()[n]||'IT');
const qClubOk=n=>!!qCatMap()[n];
const qLgs=d=>LEAGUES.filter(l=>lgW(l)===(d==='w'));   // campionati della divisione
const qDivOf=n=>lgW(qLgOf(n))?'w':'m';
const qGrp=n=>{const t=clubLeagueTxt(n),i=Math.max(t.lastIndexOf(', ')+2,t.lastIndexOf(' · ')+3);return i>2?t.slice(i):t;};   // «Serie A», «N1», «Northeast Conference»
const qLgTab=l=>l.id==='IT'?'Italia':(l.id==='US'?'USA':(LN_DEF[l.id]?LN_DEF[l.id].cc:l.name));
function qGrps(l){const g=[];for(const n of l.clubs()){const k=qGrp(n);if(!g.includes(k))g.push(k);}return g;}

function catalogClubs({division='',league='',group='',search=''}={}){
  const query=clubSearchText(search);
  return LEAGUES.flatMap(l=>{
    if(league&&l.id!==league||division&&lgW(l)!==(division==='w'))return [];
    return l.clubs().filter(n=>(!group||qGrp(n)===group)&&clubSearchText(n).includes(query));
  });
}
const clubSearchText=text=>text.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().trim();

/* ---- salvataggio (nel browser), squadre, serie ed eventi ---- */
const SAVE_KEY='ultimate-prototipo-v2';
let SV={};
const oppN=$('oppN'),myN=$('myN'),bExit=$('bExit');
const LONG={};for(const [k,l] of TRAIN_TYPES)LONG[k]=l;
const SERIES_RAW={
  A:['BFD La Fotta Offence','BFD La Fotta Defense','DiscoBolo','Cotarica Runners','One Tribe','Cotarica Grandes','CUS Padova Barbastreji','360 Milano','BFD Redbulls','UFO ','One Tribe Next Gen','RAMS BLUE','Donkey Divers','METACARPI','AUT BeeFree','BFD Zero51'],
  B:['Canieporci','Frisbaobab','KISS - Ultimate Cremona','Frasba dal Lac','DISCOVER-CUS VERONA','VOLADORA','Cotarica J','DiscoBolo Rookies','CUS BERGAMO','Disc&Disc','BFD NextGen','One Tribe U20','CUS Padova Barbados','BID ROMA'],
  C:['Ultimate Frisbee Fano','CUS Padova Barbafighto','One Tribe U17','Grem','ExtraFut','NoMad Goose','DiscoBolo NewGen','Discover CUS Verona','Brigata Treseizero','Donkey Divers','UFO','AUT Hive','De’Cavaliers','RAMS WHITE','One Tribe Wise','SBILF CUS Udine']
};
const SERIES_NAME={A:'Serie A',B:'Serie B',C:'Serie C'},PROMO=2;
const SERIES={A:[],B:[],C:[]},TEAM={};
// Squadre vere dei Campionati Italiani Ultimate Open 2026 (fogli ufficiali Flying Disc Italia, flyingdisc.it/campionati-2026), nell'ordine della classifica finale di ogni serie.
// I nomi che compaiono in piu' serie prendono la serie tra parentesi; la forza dipende dalla posizione (la prima di ogni lista e' la piu' forte, A piu' forte di B, B di C)
(function(){
  const norm=n=>n.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim(),cnt={};
  for(const sr of ['A','B','C'])for(const n of SERIES_RAW[sr])cnt[norm(n)]=(cnt[norm(n)]||0)+1;
  let rank=0;
  for(const sr of ['A','B','C'])for(const n0 of SERIES_RAW[sr]){
    const n=n0.trim(),nm=cnt[norm(n)]>1?`${n} (${sr})`:n;
    rank++;SERIES[sr].push(nm);TEAM[nm]={series:sr,rank,power:Math.round((88-(rank-1)*40/45)*10)/10};
  }
})();
// ROSTER UFFICIALI 2026: per ogni squadra di Serie A, B e C tutti i giocatori scesi in campo almeno una volta, presi dai roster dei report partita
// (fogli «Schedule» di Flying Disc Italia), con assist e mete della stagione e l'eta' compiuta nel 2026. {serie:{squadra:[[cognome, nome, assist, mete, eta', 1 se donna], ...]}}

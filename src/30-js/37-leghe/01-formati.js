/* ===================== LEGHE EUROPEE NAZIONALI: BELGIO, FRANCIA, GERMANIA, REGNO UNITO =====================
   Quattro campionati Open outdoor veri, con i loro formati ricostruiti dalle partite e dalle classifiche 2026 (le federazioni non pubblicano tutto: dove il formato
   ufficiale non si conosce, i numeri sono stime, indicate qui sotto). Un solo motore (05-stagione-lega.js) per tutti: ogni campionato e' una lista di LIVELLI;
   un livello e' fatto di una o piu' COMPETIZIONI (gironi geografici separati, come la N2 francese); una competizione ha uno o due GIRONI (tutti contro tutti, sola
   andata) e le FASI FINALI a tabellone con classifica completa:
     c8 = 8 squadre: quarti incrociati (1ª A contro 4ª B...), semifinali, poi le finali per il 1°-2°, 3°-4°, 5°-6° e 7°-8° posto (come BUOC, Top 8 francese, 1. Liga)
     c4 = 4 squadre: semifinali incrociate, finale 1°-2° e 3°-4°
     x8 = 8 squadre, solo turno incrociato e finali di piazzamento (UKU Nationals: 3 partite di girone + 2)
     p  = coppie di piazzamento dopo il girone unico (1ª-2ª, 3ª-4ª... una partita ciascuna: N2 francese, 7 + 1 partite come nei dati)
     rr = minigirone tra le squadre del livello (4 squadre, 3 partite: posti 5-8 della 2. Liga)
     k4 = come il playoff del campionato italiano maschile: 4 squadre, semifinali (1ª-4ª, 2ª-3ª) e finale, chi perde e' eliminato (niente finale per il 3° posto); con f>1 e' lo
          spareggio promozione (la prima sale direttamente, dal 2° al 5° posto si gioca il playoff)
   f..t = quali posizioni dei gironi entrano nella fase (da f a t). Le squadre che non hanno un avversario (gironi da 3 o 7) passano il turno senza giocare.
   Salgono e scendono n squadre tra un livello e il successivo (mv): sono stime dove il regolamento non e' pubblico (Francia: 3 tra N1 e N2 e 6 tra N2 e N3, come nei
   numeri dei gironi; Germania: 2 e 3; Belgio: 2 per livello; Regno Unito: 1). Le prime squadre di ciascun paese vanno all'EUCF (eu). Livelli con play:false sono
   quelli di cui le fonti hanno solo una parte delle squadre: ci sono e si giocano, ma non si puo' partire da li'.
   Nel gioco i gironi hanno piu' giri dove servono, perche' chi arriva in fondo giochi almeno 11 partite (06-partite-minime.js). */
const LN_DEF={
  BE:{id:'BE',cc:'Belgio',de:'del Belgio',name:'Belgio · BUOC',sub:'Belgian Ultimate Outdoor Championship · 6 livelli, 46 squadre',eu:3,mv:[2,2,2,2,2],
    txt:'Campionato Open outdoor (BUOC): 46 squadre su 6 livelli (N1-N6), con due gironi per livello, poi tabellone con finali di piazzamento. Salgono e scendono due squadre per livello. Nella carriera le prime tre della N1 si qualificano all’EUCF.',
    tiers:[
      {id:'N1',name:'N1',k:1.5,comps:1,pools:2,fin:[{f:1,t:4,m:'c8'}]},{id:'N2',name:'N2',k:1.3,comps:1,pools:2,fin:[{f:1,t:4,m:'c8'}]},
      {id:'N3',name:'N3',k:1.15,comps:1,pools:2,fin:[{f:1,t:4,m:'c8'}]},{id:'N4',name:'N4',k:1,comps:1,pools:2,fin:[{f:1,t:4,m:'c8'}]},
      {id:'N5',name:'N5',k:0.9,comps:1,pools:2,fin:[{f:1,t:4,m:'c8'}]},{id:'N6',name:'N6',k:0.8,comps:1,pools:2,fin:[{f:1,t:4,m:'c8'}]}]},
  FR:{id:'FR',cc:'Francia',de:'della Francia',name:'Francia · Championnat',sub:'Championnat de France outdoor · N1, N2, N3 · 54 squadre, 36 selezionabili all’avvio',eu:2,mv:[3,6],
    txt:'Championnat de France Open outdoor: la N1 ha 12 squadre in due poule da 6 e un Top 8; la N2 tre gironi da 8; la N3 solo le prime tre di ogni girone. Nella carriera, le prime due della N1 si qualificano all’EUCF.',
    tiers:[
      {id:'N1',name:'N1',k:1.5,comps:1,pools:2,fin:[{f:1,t:4,m:'c8'},{f:5,t:6,m:'c4'}]},
      {id:'N2',name:'N2',k:1.2,comps:3,pools:1,fin:[{f:1,t:8,m:'p'}]},
      {id:'N3',name:'N3',k:1,comps:6,pools:1,fin:[],play:false}]},
  DE:{id:'DE',cc:'Germania',de:'della Germania',name:'Germania · DFV',sub:'DFV Outdoor · 1., 2. e 3. Liga · 49 squadre',eu:1,mv:[2,3],
    txt:'La 1. Liga ha 16 squadre in due gironi da 8, con fasi finali per tutte le posizioni; sotto ci sono la 2. Liga (Nord e Süd) e la 3. Liga. Nella carriera, la prima della 1. Liga si qualifica all’EUCF.',
    tiers:[
      {id:'D1',name:'1. Liga',k:1.5,comps:1,pools:2,fin:[{f:1,t:4,m:'c8'},{f:5,t:8,m:'c8'}]},
      {id:'D2',name:'2. Liga',k:1.15,comps:2,pools:2,fin:[{f:1,t:2,m:'c4'},{f:3,t:4,m:'rr'}]},
      {id:'D3',name:'3. Liga',k:1,comps:3,pools:1,fin:[{f:1,t:4,m:'c4'}]}]},
  UK:{id:'UK',cc:'Regno Unito',de:'del Regno Unito',name:'Regno Unito · UKU',sub:'UKU Nationals e Open Tour · 11 squadre, 8 selezionabili all’avvio',eu:2,mv:[1],
    txt:'I Nationals (8 club: due gironi da 4 e tabellone) e, sotto, l’Open Tour: nella carriera un club sale dall’Open Tour a fine stagione. Le prime due dei Nationals si qualificano all’EUCF nel gioco.',
    tiers:[
      {id:'N1',name:'Nationals',k:1.4,comps:1,pools:2,fin:[{f:1,t:4,m:'x8'}]},
      {id:'N2',name:'Open Tour',k:1,comps:1,pools:1,fin:[],play:false}]},
  // campionato femminile (w): le sue squadre giocano solo tra loro, anche nella partita veloce (allClubs, 37-leghe/07-women.js); niente EUCF
  IW:{id:'IW',cc:'Italia Women',de:'italiano femminile',name:'Italia · Women',w:true,eu:0,sub:'Campionato italiano femminile · Serie A e Serie B · 17 squadre',mv:[2],
    txt:'Il campionato italiano Women, con lo stesso formato di quello maschile: girone unico, in Serie A playoff scudetto tra le prime 4 (semifinali e finale), in Serie B la prima sale direttamente e dal 2° al 5° posto c’è lo spareggio per la seconda promozione. Salgono due squadre e ne scendono due.',
    tiers:[
      {id:'A',name:'Serie A',k:1.3,comps:1,pools:1,fin:[{f:1,t:4,m:'k4'}]},
      {id:'B',name:'Serie B',k:1,comps:1,pools:1,fin:[{f:2,t:5,m:'k4'}]}]}
};
const LN_IDS=Object.keys(LN_DEF);
const LN_BY={};   // club -> {lk, t (livello), g (girone dei dati), p (forza iniziale)}
for(const lk of LN_IDS)for(const [n,t,g,p] of LN_CL[lk])LN_BY[n]={lk,t,g,p:OVR_POW[n]||LN_POW_FIX[n]||p};   // OVR_POW: forza delle rose rivedute (00-ovr-2026.js); LN_POW_FIX: correzioni a mano (00-dati-integrazioni.js)
const LN_NAMES=LN_IDS.reduce((a,lk)=>a.concat(LN_CL[lk].map(r=>r[0])),[]);
const lnKey=(lk,t)=>lk+'.'+t;   // valore di SV.sr: una voce per livello (nome e coefficiente economico in SERIES_NAME e SR_K)
const LN_TIER={};   // 'BE.N1' -> {lk, i (posizione), ...livello}
for(const lk of LN_IDS)LN_DEF[lk].tiers.forEach((t,i)=>{LN_TIER[lnKey(lk,t.id)]=Object.assign({lk,i},t);SERIES_NAME[lnKey(lk,t.id)]=LN_DEF[lk].cc+' · '+t.name;SR_K[lnKey(lk,t.id)]=t.k;});
const isLN=()=>!!(SV&&SV.lk&&LN_DEF[SV.lk]);
const lnTiers=lk=>LN_DEF[lk||SV.lk].tiers;
const lnClubs=(lk,play)=>LN_CL[lk].filter(r=>!play||LN_TIER[lnKey(lk,r[1])].play!==false).map(r=>r[0]);   // play: solo i club da cui si puo' partire

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
   Salgono e scendono mv squadre tra livelli. Le prime squadre di ciascun paese vanno all'EUCF (eu).
   Nel gioco i gironi hanno piu' giri dove servono, perche' chi arriva in fondo giochi almeno 11 partite (06-partite-minime.js). */
const LN_DEF={
  BE:{id:'BE',cc:'Belgio',de:'del Belgio',name:'Belgio · BUOC',sub:'Belgian Ultimate Outdoor Championship · 6 livelli, 46 squadre',eu:3,mv:[2,2,2,2,2],
    txt:'Campionato Open outdoor (BUOC): 46 squadre su 6 livelli (N1-N6), con due gironi per livello, poi tabellone con finali di piazzamento. Salgono e scendono due squadre per livello. Nella carriera le prime tre della N1 si qualificano all’EUCF.',
    tiers:[
      {id:'N1',name:'N1',k:1.5,comps:1,pools:2,fin:[{f:1,t:4,m:'c8'}]},{id:'N2',name:'N2',k:1.3,comps:1,pools:2,fin:[{f:1,t:4,m:'c8'}]},
      {id:'N3',name:'N3',k:1.15,comps:1,pools:2,fin:[{f:1,t:4,m:'c8'}]},{id:'N4',name:'N4',k:1,comps:1,pools:2,fin:[{f:1,t:4,m:'c8'}]},
      {id:'N5',name:'N5',k:0.9,comps:1,pools:2,fin:[{f:1,t:4,m:'c8'}]},{id:'N6',name:'N6',k:0.8,comps:1,pools:2,fin:[{f:1,t:4,m:'c8'}]}]},
  FR:{id:'FR',cc:'Francia',de:'della Francia',name:'Francia · Championnat',sub:'Championnat de France outdoor · N1 e N2 · 36 squadre',eu:2,mv:[3],
    txt:'La N1 ha 12 squadre in due gironi e un tabellone a 8. La N2 ha tre gironi. Tre squadre salgono e tre scendono. Le prime due della N1 si qualificano all’EUCF.',
    tiers:[
      {id:'N1',name:'N1',k:1.5,comps:1,pools:2,fin:[{f:1,t:4,m:'c8'},{f:5,t:6,m:'c4'}]},
      {id:'N2',name:'N2',k:1.2,comps:3,pools:1,fin:[{f:1,t:8,m:'p'}]}]},
  DE:{id:'DE',cc:'Germania',de:'della Germania',name:'Germania · DFV',sub:'DFV Outdoor · 1., 2. e 3. Liga · 49 squadre',eu:1,mv:[2,3],
    txt:'La 1. Liga ha 16 squadre in due gironi da 8, con fasi finali per tutte le posizioni; sotto ci sono la 2. Liga (Nord e Süd) e la 3. Liga. Nella carriera, la prima della 1. Liga si qualifica all’EUCF.',
    tiers:[
      {id:'D1',name:'1. Liga',k:1.5,comps:1,pools:2,fin:[{f:1,t:4,m:'c8'},{f:5,t:8,m:'c8'}]},
      {id:'D2',name:'2. Liga',k:1.15,comps:2,pools:2,fin:[{f:1,t:2,m:'c4'},{f:3,t:4,m:'rr'}]},
      {id:'D3',name:'3. Liga',k:1,comps:3,pools:1,fin:[{f:1,t:4,m:'c4'}]}]},
  UK:{id:'UK',cc:'Regno Unito',de:'del Regno Unito',name:'Regno Unito · UKU',sub:'UKU Nationals · 11 squadre',eu:2,mv:[],
    txt:'Un campionato con 11 club in due gironi. Le prime quattro di ogni girone giocano le finali di piazzamento. Le prime due dei Nationals si qualificano all’EUCF.',
    tiers:[
      {id:'N1',name:'Nationals',k:1.4,comps:1,pools:2,fin:[{f:1,t:4,m:'x8'}]}]},
  // campionato femminile (w): le sue squadre giocano solo tra loro, anche nella partita veloce (allClubs, 37-leghe/07-women.js); niente EUCF
  IW:{id:'IW',cc:'Italia Women',de:'italiano femminile',name:'Italia · Women',w:true,eu:0,sub:'Campionato italiano femminile · Serie A e Serie B · 17 squadre',mv:[2],
    txt:'Club italiani Women dei CIU 2026. Formato nel gioco: girone unico, in Serie A playoff scudetto tra le prime 4 (semifinali e finale), in Serie B la prima sale direttamente e dal 2° al 5° posto c’è lo spareggio per la seconda promozione. Salgono due squadre e ne scendono due.',
    tiers:[
      {id:'A',name:'Serie A',k:1.3,comps:1,pools:1,fin:[{f:1,t:4,m:'k4'}]},
      {id:'B',name:'Serie B',k:1,comps:1,pools:1,fin:[{f:2,t:5,m:'k4'}]}]}
};
const LN_IDS=Object.keys(LN_DEF);
// Questi livelli servono a finire la stagione dei salvataggi precedenti e a leggere lo storico.
const LN_OLD={
  FR:{mv:[3,6],extra:{id:'N3',name:'N3',k:1,comps:6,pools:1,fin:[]}},
  UK:{mv:[1],extra:{id:'N2',name:'Open Tour',k:1,comps:1,pools:1,fin:[]}}
};
const lnInitialTier=(lk,t)=>lk==='UK'&&t==='N2'?'N1':t;
const lnClubRows=lk=>LN_CL[lk].flatMap(r=>{
  const t=lnInitialTier(lk,r[1]);
  return LN_DEF[lk].tiers.some(tr=>tr.id===t)?[[r[0],t,r[2],r[3]]]:[];
});
const LN_BY={};   // club -> {lk, t (livello), g (girone dei dati), p (forza iniziale)}
for(const lk of LN_IDS)for(const [n,t,g,p] of LN_CL[lk])LN_BY[n]={lk,t:lnInitialTier(lk,t),g,p:OVR_POW[n]||LN_POW_FIX[n]||p};
const LN_NAMES=LN_IDS.reduce((a,lk)=>a.concat(LN_CL[lk].map(r=>r[0])),[]);
const lnKey=(lk,t)=>lk+'.'+t;   // valore di SV.sr: una voce per livello (nome e coefficiente economico in SERIES_NAME e SR_K)
const LN_TIER={};   // 'BE.N1' -> {lk, i (posizione), ...livello}
for(const lk of LN_IDS)LN_DEF[lk].tiers.concat(LN_OLD[lk]?.extra||[]).forEach((t,i)=>{LN_TIER[lnKey(lk,t.id)]=Object.assign({lk,i},t);SERIES_NAME[lnKey(lk,t.id)]=LN_DEF[lk].cc+' · '+t.name;SR_K[lnKey(lk,t.id)]=t.k;});
const isLN=()=>!!(SV&&SV.lk&&LN_DEF[SV.lk]);
function lnSeasonDef(lk,T){
  const d=LN_DEF[lk],old=LN_OLD[lk];
  return old&&T?.[old.extra.id]?{...d,tiers:d.tiers.concat(old.extra),mv:old.mv}:d;
}
const lnTiers=(lk=SV.lk)=>lnSeasonDef(lk,lk===SV.lk?SV.ln?.T:null).tiers;
const lnClubs=lk=>lnClubRows(lk).map(r=>r[0]);

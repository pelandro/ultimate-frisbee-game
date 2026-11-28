/* ===================== LEGHE EUROPEE NAZIONALI: BELGIO, FRANCIA, GERMANIA, REGNO UNITO (E ITALIA WOMEN) =====================
   I club e le rose sono quelli veri del 2026; i formati sono quelli del gioco, scelti perche' ogni stagione sia pulita: un girone unico (o due gironi
   geografici), dove ogni avversaria si incontra lo stesso numero di volte (sola andata, oppure andata e ritorno), e chi arriva in fondo gioca almeno 11
   partite (06-partite-minime.js). Un solo motore (03-stagione-lega.js) per tutti: ogni campionato e' una lista di LIVELLI; un livello ha una COMPETIZIONE
   con uno o due GIRONI e le FASI FINALI:
     c4 = 4 squadre: semifinali (1ª-4ª e 2ª-3ª nel girone unico; 1ª A contro 2ª B e 1ª B contro 2ª A con due gironi), finale e finale per il 3° posto
     b6 = 6 squadre: la 1ª e la 2ª vanno dirette in semifinale, quarti 3ª-6ª e 4ª-5ª, poi semifinali, finale e finale per il 3° posto (N1 francese)
     c8 = 8 squadre: quarti (1ª-8ª, 4ª-5ª, 2ª-7ª, 3ª-6ª), semifinali, poi le finali per tutti i posti dal 1° all'8° (Regno Unito)
     k4 = spareggio promozione come in Italia: dal 2° al 5° posto (2ª-5ª, 3ª-4ª, finale), la prima e' gia' promossa; chi perde e' eliminato
   f..t = quali posizioni del girone entrano nella fase (da f a t). geo = gironi geografici, rifatti ogni stagione da ovest a est (lnGeoX).
   legs = giri fissi (2 = andata e ritorno). Salgono e scendono mv squadre tra livelli. All'EUCF vanno le prime eu del livello piu' alto dopo le fasi
   finali; la sedicesima squadra dell'EUCF e' la quarta classificata piu' forte tra i campionati (36-europa/01-eucf.js, euField).
   I formati delle stagioni precedenti stanno in LN_OLD: servono a finire una stagione gia' iniziata, poi lnUpgradeFormat passa al formato nuovo. */
const LN_DEF={
  BE:{id:'BE',cc:'Belgio',de:'del Belgio',name:'Belgio · BUOC',sub:'Belgian Ultimate Outdoor Championship · 3 livelli, 46 squadre',eu:3,mv:[2,2],
    txt:'Tre livelli (N1, N2, N3), girone unico di sola andata. N1: playoff fra le prime 4, prime 3 all’EUCF. N2 e N3: 1ª promossa, 2ª-5ª spareggio per la promozione. Due promosse e due retrocesse per livello.',
    tiers:[
      {id:'N1',name:'N1',k:1.5,comps:1,pools:1,fin:[{f:1,t:4,m:'c4'}]},
      {id:'N2',name:'N2',k:1.1,comps:1,pools:1,fin:[{f:2,t:5,m:'k4'}]},
      {id:'N3',name:'N3',k:0.85,comps:1,pools:1,fin:[{f:2,t:5,m:'k4'}]}]},
  FR:{id:'FR',cc:'Francia',de:'della Francia',name:'Francia · Championnat',sub:'Championnat de France outdoor · N1 e N2 · 36 squadre',eu:3,mv:[2],
    txt:'N1: 12 squadre, girone unico di sola andata, playoff fra le prime 6, prime 3 all’EUCF, retrocedono le ultime 2. N2: due gironi geografici da 12, playoff promozione fra le prime 2 di ogni girone, salgono le 2 finaliste.',
    tiers:[
      {id:'N1',name:'N1',k:1.5,comps:1,pools:1,fin:[{f:1,t:6,m:'b6'}]},
      {id:'N2',name:'N2',k:1.2,comps:1,pools:2,geo:true,fin:[{f:1,t:2,m:'c4'}]}]},
  DE:{id:'DE',cc:'Germania',de:'della Germania',name:'Germania · DFV',sub:'DFV Outdoor · 1., 2. e 3. Liga · 49 squadre',eu:3,mv:[2,3],
    txt:'Tre livelli a girone unico di sola andata. 1. Liga: playoff fra le prime 4, prime 3 all’EUCF, retrocedono le ultime 2. 2. Liga: promosse le prime 2, retrocedono le ultime 3. 3. Liga: promosse le prime 3.',
    tiers:[
      {id:'D1',name:'1. Liga',k:1.5,comps:1,pools:1,fin:[{f:1,t:4,m:'c4'}]},
      {id:'D2',name:'2. Liga',k:1.15,comps:1,pools:1,fin:[]},
      {id:'D3',name:'3. Liga',k:1,comps:1,pools:1,fin:[]}]},
  UK:{id:'UK',cc:'Regno Unito',de:'del Regno Unito',name:'Regno Unito · UKU',sub:'UKU Nationals · 11 squadre',eu:3,mv:[],
    txt:'11 club, girone unico di sola andata, playoff fra le prime 8 e Lower pool per i posti 9–11. Prime 3 all’EUCF.',
    tiers:[
      {id:'N1',name:'Nationals',k:1.4,comps:1,pools:1,fin:[{f:1,t:8,m:'c8'},{f:9,t:11,m:'rr',tag:'Lower pool',independent:true}]}]},
  // campionato femminile (w): le sue squadre giocano solo tra loro, anche nella partita veloce (allClubs, 37-leghe/07-women.js); niente EUCF
  IW:{id:'IW',cc:'Italia Women',de:'italiano femminile',name:'Italia · Women',w:true,eu:3,sub:'Campionato italiano femminile · Serie A e Serie B · 17 squadre',mv:[2],
    txt:'Club italiani Women dei CIU 2026. Serie A: girone unico di sola andata, playoff fra le prime 4. Serie B: andata e ritorno, 1ª promossa, 2ª-5ª spareggio per la promozione. Due promosse e due retrocesse.',
    tiers:[
      {id:'A',name:'Serie A',k:1.3,comps:1,pools:1,fin:[{f:1,t:4,m:'k4'}]},
      {id:'B',name:'Serie B',k:1,comps:1,pools:1,legs:2,fin:[{f:2,t:5,m:'k4'}]}]},
  UKW:{id:'UKW',cc:'Regno Unito Women',de:'del Regno Unito',name:'Regno Unito · Women',sub:'UKU Nationals Women · 8 squadre',w:true,eu:3,mv:[],
    txt:'Girone unico di sola andata. Poi Upper e Lower pool di andata e ritorno. 13 partite per squadra.',
    tiers:[{id:'N1',name:'Nationals',k:1.4,comps:1,pools:1,groupGames:7,fin:[{f:1,t:4,m:'rr',legs:2,tag:'Upper pool'},{f:5,t:8,m:'rr',legs:2,tag:'Lower pool'}]}]},
  BEW:{id:'BEW',cc:'Belgio Women',de:'del Belgio',name:'Belgio · Women',sub:'BUOC Women · 8 squadre',w:true,eu:3,mv:[],
    txt:'Girone unico di sola andata. Poi Upper e Lower pool di andata e ritorno. 13 partite per squadra.',
    tiers:[{id:'N1',name:'N1',k:1.4,comps:1,pools:1,groupGames:7,fin:[{f:1,t:4,m:'rr',legs:2,tag:'Upper pool'},{f:5,t:8,m:'rr',legs:2,tag:'Lower pool'}]}]},
  FRW:{id:'FRW',cc:'Francia Women',de:'della Francia',name:'Francia · Women',sub:'Championnat de France Women · 13 squadre',w:true,eu:3,mv:[],
    txt:'Girone unico di sola andata. Le prime quattro giocano semifinali e finali. 12 partite per tutte, 14 per le prime quattro.',
    tiers:[{id:'N1',name:'N1',k:1.4,comps:1,pools:1,fin:[{f:1,t:4,m:'c4'}]}]},
  DEW:{id:'DEW',cc:'Germania Women',de:'della Germania',name:'Germania · Women',sub:'DFV Women · 16 squadre',w:true,eu:3,mv:[],
    txt:'Due gironi, poi quattro pool incrociati con uno scontro diretto riportato. Quarti, semifinali e finali per tutti i piazzamenti. 12 partite per squadra.',
    tiers:[{id:'N1',name:'1. Liga',k:1.4,comps:1,pools:2,groupGames:7,fin:[
      {f:1,t:2,m:'cross',tag:'Upper pool'},{f:3,t:4,m:'cross',tag:'Medium pool'},
      {f:5,t:6,m:'cross',tag:'Lower pool A'},{f:7,t:8,m:'cross',tag:'Lower pool B'}]}]}
};
const LN_IDS=Object.keys(LN_DEF);
// I formati delle stagioni precedenti (fino al 2026): servono a finire una stagione gia' iniziata e a leggere lo storico. extra = un livello ancora
// piu' vecchio (la N3 francese, l'Open Tour britannico), che si toglie insieme al cambio di formato. map = livello nuovo di ogni livello vecchio.
const LN_OLD={
  BE:{mv:[2,2,2,2,2],map:{N1:'N1',N2:'N1',N3:'N2',N4:'N2',N5:'N3',N6:'N3'},tiers:[
    {id:'N1',name:'N1',k:1.5,comps:1,pools:2,fin:[{f:1,t:4,m:'c8'}]},{id:'N2',name:'N2',k:1.3,comps:1,pools:2,fin:[{f:1,t:4,m:'c8'}]},
    {id:'N3',name:'N3',k:1.15,comps:1,pools:2,fin:[{f:1,t:4,m:'c8'}]},{id:'N4',name:'N4',k:1,comps:1,pools:2,fin:[{f:1,t:4,m:'c8'}]},
    {id:'N5',name:'N5',k:0.9,comps:1,pools:2,fin:[{f:1,t:4,m:'c8'}]},{id:'N6',name:'N6',k:0.8,comps:1,pools:2,fin:[{f:1,t:4,m:'c8'}]}]},
  FR:{mv:[3],mvX:[3,6],map:{N1:'N1',N2:'N2'},tiers:[
    {id:'N1',name:'N1',k:1.5,comps:1,pools:2,fin:[{f:1,t:4,m:'c8'},{f:5,t:6,m:'c4'}]},
    {id:'N2',name:'N2',k:1.2,comps:3,pools:1,fin:[{f:1,t:8,m:'p'}]}],extra:{id:'N3',name:'N3',k:1,comps:6,pools:1,fin:[]}},
  DE:{mv:[2,3],map:{D1:'D1',D2:'D2',D3:'D3'},tiers:[
    {id:'D1',name:'1. Liga',k:1.5,comps:1,pools:2,fin:[{f:1,t:4,m:'c8'},{f:5,t:8,m:'c8'}]},
    {id:'D2',name:'2. Liga',k:1.15,comps:2,pools:2,fin:[{f:1,t:2,m:'c4'},{f:3,t:4,m:'rr'}]},
    {id:'D3',name:'3. Liga',k:1,comps:3,pools:1,fin:[{f:1,t:4,m:'c4'}]}]},
  UK:{mv:[],mvX:[1],map:{N1:'N1'},tiers:[
    {id:'N1',name:'Nationals',k:1.4,comps:1,pools:2,fin:[{f:1,t:4,m:'x8'}]}],extra:{id:'N2',name:'Open Tour',k:1,comps:1,pools:1,fin:[]}}
};
// la composizione T di un salvataggio e' nel formato vecchio? (livelli che non ci sono piu', competizioni o gironi in numero diverso)
function lnIsOld(lk,T){
  const d=LN_DEF[lk];if(!T||!LN_OLD[lk])return false;
  if(Object.keys(T).some(id=>!d.tiers.some(t=>t.id===id)))return true;
  return d.tiers.some(t=>!T[t.id]||T[t.id].length!==t.comps||T[t.id].some(c=>c.pools&&c.pools.length!==t.pools));
}
// nella composizione dei dati: N1+N2, N3+N4 e N5+N6 belgi diventano N1, N2 e N3; l'Open Tour britannico entra nei Nationals
const lnInitialTier=(lk,t)=>lk==='UK'&&t==='N2'?'N1':(lk==='BE'?LN_OLD.BE.map[t]||t:t);
// gironi geografici: longitudine indicativa della citta' di ogni club (da ovest a est), per dividere il livello in due meta'
const LN_GEO_X={'Tchac':-2.3,'Tchac 2':-2.3,'Jets':-1.9,'Roazhon Ultimate':-1.7,'Frisbeurs':-1.55,'Fus\'Yon':-1.4,'RFO':-1.3,'NLSU':2.45,'Stade Bordelais':-0.6,
  'Magic Disc':-0.55,'Magic Disc 2':-0.55,'Manchots':0.2,'Disc\'Gestifs':0.5,'Power Rouengers':1.1,'Freezgo':1.33,'Freezgo 2':1.33,'BTR':1.44,'Ouf':1.5,
  'Zérogêne':1.95,'Friselis':2.13,'F5':2.3,'Phoenix':2.32,'PUC Ultimate':2.35,'Révolution\'Air':2.35,'Friz\'Toi':2.42,'Sun':2.46,'Tsunami':2.7,
  'Clapas':3.88,'Les Gones':4.84,'A.S.U.L. Ultimate':4.88,'Discjonctés':5.04,'Les Marsiens':5.37,'Monkey':5.7,'Chamber\'':5.92,'Friz\'Bisontins':6.02,'Sesquidistus':7.75};
const lnPoolName=(tr,i)=>tr&&tr.geo?['Ovest','Est'][i]:'AB'[i];   // nome del girone: A e B, oppure Ovest ed Est
const lnGeoX=n=>LN_GEO_X[n]===undefined?3:LN_GEO_X[n];
const lnClubRows=lk=>LN_CL[lk].flatMap(r=>{
  const t=lnInitialTier(lk,r[1]);
  return LN_DEF[lk].tiers.some(tr=>tr.id===t)?[[r[0],t,r[2],r[3]]]:[];
});
const LN_BY={};   // club -> {lk, t (livello), g (girone dei dati), p (forza iniziale)}
for(const lk of LN_IDS)for(const [n,t,g,p] of LN_CL[lk])LN_BY[n]={lk,t:lnInitialTier(lk,t),g,p:OVR_POW[n]||LN_POW_FIX[n]||p};
const LN_NAMES=LN_IDS.reduce((a,lk)=>a.concat(LN_CL[lk].map(r=>r[0])),[]);
const lnKey=(lk,t)=>lk+'.'+t;   // valore di SV.sr: una voce per livello (nome e coefficiente economico in SERIES_NAME e SR_K)
const LN_TIER={};   // 'BE.N1' -> {lk, i (posizione), ...livello}; prima i livelli vecchi (per lo storico), poi quelli di adesso
const lnRegTier=(lk,t,i)=>{LN_TIER[lnKey(lk,t.id)]=Object.assign({lk,i},t);SERIES_NAME[lnKey(lk,t.id)]=LN_DEF[lk].cc+' · '+t.name;SR_K[lnKey(lk,t.id)]=t.k;};
for(const lk of LN_IDS){const o=LN_OLD[lk];if(o)o.tiers.concat(o.extra||[]).forEach((t,i)=>lnRegTier(lk,t,i));LN_DEF[lk].tiers.forEach((t,i)=>lnRegTier(lk,t,i));}
const isLN=()=>!!(SV&&SV.lk&&LN_DEF[SV.lk]);
function lnSeasonDef(lk,T){
  const d=LN_DEF[lk],o=LN_OLD[lk];
  if(!o||!lnIsOld(lk,T))return d;
  const x=o.extra&&T[o.extra.id];
  return {...d,tiers:o.tiers.concat(x?o.extra:[]),mv:x?o.mvX:o.mv};
}
const lnTiers=(lk=SV.lk)=>lnSeasonDef(lk,lk===SV.lk?SV.ln?.T:null).tiers;
const lnClubs=lk=>lnClubRows(lk).map(r=>r[0]);

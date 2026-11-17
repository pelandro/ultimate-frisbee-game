/* ===================== OVERALL 2026: REVISIONE DEI ROSTER (regole e modifiche volute) =====================
   I dati del foglio di revisione sono in 00-dati-ovr-2026.js (generato). Qui stanno le modifiche volute a mano, che valgono sopra i dati, e le funzioni che servono
   gia' al caricamento (le rose italiane si compongono in 03-calendario-stagione.js): chi e' nel foglio ha l'Overall esatto, il ruolo e, se verificata, l'eta' del foglio;
   chi non c'e' resta com'era. Per i club europei e americani la correzione sta in 38-ovr/01-applica.js (ovrFix). */
// ritorna la chiave di un nome senza accenti, maiuscole e ordine («Mattia Brini» = «Brini Mattia»): e' la stessa di usNameKey (35-usa/02-roster-usa.js), definita qui perche' serve prima
const ovrKey=s=>String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z ]/g,' ').split(/\s+/).filter(Boolean).sort().join(' ');
// chi non fa piu' parte del club (richiesta del progetto, o trasferito altrove dal foglio): «nome cognome» per club. Vale anche per i giocatori che il gioco aveva di suo
const OVR_OUT={
  'NLSU':['Filipo Lipari'],            // resta ai Donkey Divers (Serie A)
  'UFO (A)':['David Barzasi'],         // gioca nei Mooncatchers
  'Jetset Open':['Emiel De Rieck'],    // per il foglio gioca nei Gentle Open
  'Éclipse Solaire':['Louis Dawans'],  // ... nei Mooncatchers
  'Magic Disc':['Léo Stanguennec','Enzo Stanguennec']   // ... nel Tchac
};
// Overall voluto a mano, sopra quello del foglio: «nome cognome» per club
const OVR_FORCE={
  'Cotarica Grandes':{'Pietro Puppi':87}
};
// giocatori aggiunti a mano, nello stesso formato delle righe di OVR_2026. H = portatore; il segno d lo mette nella linea di difesa (piu' difesa, sempre handler)
const OVR_ADD={
  'CUS Padova Barbastreji':[['Mazzo','Carlo',86,26,'H','e','a'],['Ragusa','Marco',86,25,'H','ed','a']]
};
// giocatori del foglio presenti in due club (stessa persona): nei club americani non compaiono, restano in Europa (scelta del progetto, vedi US_OUT)
const OVR_DUAL_US=new Set(['Washington DC Truck Stop|Sofiene Bontemps','Washington DC Truck Stop|Louis Betrancourt','Toronto GOAT|Gael Ancelin','Chicago Machine|Daan De Marree'].map(s=>{const i=s.indexOf('|');return s.slice(0,i)+'|'+ovrKey(s.slice(i+1));}));
// FORZA DEI CLUB DEL FOGLIO: la forza reale delle loro rose (3 handler + 4 cutter migliori, come in partita), che sostituisce quella dichiarata dalla classifica o dal rating.
// Si ricalcola con «node tools/test-ovr.js --calcola» dopo ogni cambio ai dati o alle modifiche volute; la prova (tools/test-ovr.js) controlla che coincida.
// SCARTO DI CLUB: punti sommati all'Overall delle righe del foglio di un club stimate dalla forza del club (affidabilita' bassa; meta' per la media; niente per l'alta, che ha riscontri
// individuali: nazionali maggiori, premi, eventi di alto livello) e non ai forzati di OVR_FORCE e agli aggiunti di OVR_ADD, che hanno il valore chiesto. Serve a
// mettere la forza dei club sulla stessa scala dei risultati veri (EUCF 2024-2026, WUCC 2026, Serie A 2024-2026) e del prestigio di giocare l'EUCF: chi c'era e' stimato dai
// piazzamenti delle ultime stagioni, chi non c'era non supera chi del suo paese c'era. Vedi docs/OVERALL-2026.md. Dopo ogni cambio: «node tools/test-ovr.js --calcola» e si incolla OVR_POW.
const OVR_SHIFT={
  "Gentle Open":5,
  "Chevron Action Flash":7,
  "NLSU":4,
  "Cotarica Grandes":1,
  "One Tribe":-4,
  "DiscoBolo":-3,
  "CUS Padova Barbastreji":-6
};
const OVR_POW={
  "BFD La Fotta Offence":89.9,
  "BFD La Fotta Defense":88.9,
  "DiscoBolo":84,
  "Cotarica Runners":87.3,
  "One Tribe":84.8,
  "Cotarica Grandes":86.3,
  "CUS Padova Barbastreji":83.8,
  "360 Milano":81.2,
  "BFD Redbulls":80.5,
  "UFO (A)":79.4,
  "One Tribe Next Gen":79.4,
  "RAMS BLUE":78.2,
  "Donkey Divers (A)":78,
  "METACARPI":76.1,
  "AUT BeeFree":76.1,
  "BFD Zero51":74.6,
  "New York PoNY":92.2,
  "Boston DiG":91.6,
  "Washington DC Truck Stop":87.4,
  "Philadelphia Pacmen":87,
  "Raleigh Ring of Fire":89.5,
  "Atlanta Chain Lightning":88.3,
  "Chicago Machine":91.2,
  "Toronto GOAT":86.4,
  "Minneapolis Sub Zero":88.2,
  "Denver Johnny Bravo":86.6,
  "Portland Rhino Slam!":90.2,
  "Seattle Sockeye":86.2,
  "San Francisco Revolver":91.6,
  "Mooncatchers":91.5,
  "Gentle Open":87.6,
  "Tchac":89.7,
  "NLSU":85.3,
  "Bad Skid":82.6,
  "Wall City":91.1,
  "Clapham Ultimate":90.2,
  "Chevron Action Flash":87.2
};
// CORREZIONI SINGOLE ai club che NON sono nel foglio (stesso formato delle righe di OVR_2026): chi ha statistiche enormi nella sua serie ma nessun riscontro individuale
// (nazionali, premi, tornei internazionali) non supera la forza della sua squadra di piu' di 8 punti. Nel foglio chi e' stimato senza prove supera la media dei primi 7 della
// squadra al massimo di 5,4 punti (in media 1,4); le serie italiane B e C arrivavano a +19 (un diciannovenne di Serie B a 91, piu' di quasi tutta la Serie A). Un
// riscontro pubblico di valore (nazionale maggiore, premio) rialzerebbe il tetto: per questi giocatori le ricerche non ne hanno trovati. Affidabilita' bassa: sono stime prudenti
const OVR_PART={
  'KISS - Ultimate Cremona':[['Conti','Carlo',80,0,'','','b']],            // 63 punti a 19 anni nella B (era 91)
  'Frisbaobab':[['Mcgraw','Taylor',80,0,'','','b']],                        // 53 punti a 33 anni (era 86)
  'Cotarica J':[['Nanni','Simone',76,0,'','','b']],                         // 46 punti a 18 anni (era 79)
  'Donkey Divers (C)':[['Sangalli','Lorenzo',58,0,'','','b']],
  'CUS Padova Barbafighto':[['Buso','Davide',60,0,'','','b']],              // 53 punti a 17 anni nella C
  'NoMad Goose':[['Bidogia','Leonardo',62,0,'','','b']],
  'Discover CUS Verona (C)':[['Cevoli','Gianmarco',58,0,'','','b']],
  'SBILF CUS Udine':[['Campagna','Francesco',57,0,'','','b']],
  'Grem':[['Maioli','Andrea',58,0,'','','b']],
  'Hardfisch':[['Spanuth','Malte',75,0,'','','b']]
};
// persone diverse con lo stesso nome di un doppio club (il foglio non le unisce): «club|nome» che puo' stare in un club USA anche se il nome e' in US_OUT
const OVR_OTHER=new Set(['Philadelphia Pacmen|'+ovrKey('Sam Hill')]);   // il Sam Hill dei Pacmen (82) non e' quello dei Clapham (90)
// il giocatore ha un Overall assegnato dal foglio (in un club qualsiasi): vale quello, non i pavimenti dei premi
let ovrAllKeys=null;
const ovrAssigned=name=>{if(!ovrAllKeys){ovrAllKeys=new Set();for(const c in OVR_2026)for(const r of OVR_2026[c])ovrAllKeys.add(ovrKey(r[1]+' '+r[0]));for(const c in OVR_ADD)for(const r of OVR_ADD[c])ovrAllKeys.add(ovrKey(r[1]+' '+r[0]));}return ovrAllKeys.has(ovrKey(name));};
const ovrOutSet=club=>new Set((OVR_OUT[club]||[]).map(ovrKey));
let ovrCache={},ovrPartCache={};
// le correzioni singole di un club fuori dal foglio (OVR_PART); [] se non ce ne sono
function ovrPart(club){
  if(ovrPartCache[club])return ovrPartCache[club];
  return ovrPartCache[club]=(OVR_PART[club]||[]).map(r=>({sur:r[0],nm:r[1],k:ovrKey(r[1]+' '+r[0]),ov:r[2],age:r[3],rl:r[4],ex:r[5].includes('e'),est:r[5].includes('a'),ld:r[5].includes('d'),conf:r[6],part:true}));
}
// le righe di un club dopo le modifiche volute: tolti i giocatori usciti, Overall forzati, aggiunti i nuovi; [] se il club non e' nel foglio
function ovrEntries(club){
  if(ovrCache[club])return ovrCache[club];
  const out=ovrOutSet(club),fo={};for(const n in (OVR_FORCE[club]||{}))fo[ovrKey(n)]=OVR_FORCE[club][n];
  // scarto di club e ritocco dai tornei: valgono solo per le righe del foglio e solo per chi e' stimato (affidabilita' media o bassa): chi ha riscontri individuali forti (nazionali maggiori,
  // premi, eventi di alto livello: affidabilita' alta) tiene il valore del foglio, qualunque sia il suo club. I forzati (OVR_FORCE) e gli aggiunti a mano (OVR_ADD) hanno il valore chiesto.
  const sh=OVR_SHIFT[club]||0,ad=OVR_ADJ[club]||{},nS=(OVR_2026[club]||[]).length;
  const dl=r=>r[6]==='a'?0:(r[6]==='m'?Math.round(sh/2):sh)+(ad[r[1]+' '+r[0]]||0);
  const rows=(OVR_2026[club]||[]).concat(OVR_ADD[club]||[]).map((r,i)=>[r,i<nS?dl(r):0]).filter(([r])=>!out.has(ovrKey(r[1]+' '+r[0]))).map(([r,d])=>{const k=ovrKey(r[1]+' '+r[0]);return {sur:r[0],nm:r[1],k,ov:fo[k]||Math.max(25,Math.min(99,r[2]+d)),age:r[3],rl:r[4],ex:r[5].includes('e'),est:r[5].includes('a'),ld:r[5].includes('d'),conf:r[6]};});
  return ovrCache[club]=rows;
}
// rose italiane: le righe di REAL_ALL di un club con l'Overall (ov), il ruolo (rl) e l'eta' del foglio; chi il gioco non aveva si aggiunge (assist e mete a 0)
function ovrMergeIT(club,rows){
  const E0=ovrEntries(club),out=ovrOutSet(club),P=E0.length?[]:ovrPart(club),E=E0.length?E0:P;   // club non nel foglio: solo le correzioni singole, senza aggiungere nessuno
  if(!E.length&&!out.size)return rows;
  const by={};for(const e of E)by[e.k]=e;
  const used=new Set(),res=[];
  for(const r of rows){
    const k=ovrKey(r.nm+' '+r.sur);if(out.has(k))continue;
    const e=by[k];if(e&&used.has(k))continue;   // riga doppia dei dati originali: il foglio ha gia' un solo giocatore
    if(!e){res.push(r);continue;}
    used.add(k);res.push(Object.assign({},r,{ov:e.ov,rl:e.rl||'',age:e.ex&&e.age?e.age:r.age,ld:e.ld}));
  }
  if(!P.length)for(const e of E)if(!used.has(e.k))res.push({sur:e.sur,nm:e.nm,a:0,g:0,age:e.age||0,f:false,ov:e.ov,rl:e.rl||'',ae:!e.ex,ld:e.ld});
  return res;
}

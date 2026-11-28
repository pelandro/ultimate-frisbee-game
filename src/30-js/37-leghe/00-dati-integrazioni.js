/* ===================== LEGHE EUROPEE: INTEGRAZIONI AI ROSTER (a mano) =====================
   Giocatori veri che mancavano nei dati generati (00-dati-giocatori.js), aggiunti dopo di essi: [cognome, nome, eta', limite, ruolo, bonus]. Fonti pubbliche:
   - i tabellini dell'EUCF 2026 (Breslavia) e dell'Elite Invite 2026 (Lovanio) sui portali Live! by BULA: mete e assist per giocatore; il bonus segue la stessa formula dei dati
     generati (da -4 a +8 dai punti a partita), con 6 partite come minimo;
   - le convocazioni della nazionale Open tedesca (Foerderkader 2026 e squadra dei Mondiali 2024, sito della federazione tedesca) per i club tedeschi che non hanno altri nomi
     nei dati: la societa' di appartenenza dice il club (ESV Monaco = M.U.C., FSV Ars Ludendi Darmstadt = Ars Ludendi, Fischbees Amburgo = Hardfisch, MTV Karlsruhe = Bad Skid);
     per loro non ci sono statistiche, quindi bonus +2 (livello da nazionale).
   I roster completi dei campionati tedeschi sono sul portale della federazione solo per gli utenti registrati: i club senza nomi restano a riempimento generato. */
const LN_PL_PLUS={
  BE:{
    'Gentle Open':[['De Rieck','Emiel',0,0,'H',3.0],['Ongenaet','Stern',0,0,'C',1.5],['Pisano','Han',0,0,'C',-0.5],['Vandamme','Bono',0,0,'H',-1.0],['Pannemans','Leon',0,0,'C',-1.5],['Declerck','Stan',0,0,'C',-2.0]],
    'Mooncatchers':[['Dawans','Louis',0,0,'C',-3.0]],
    'Freezzz Beezzz one':[['Van Mullem','Kamiel',0,0,'H',3.0],['Coppejans','Stan',0,0,'C',0.0],['Delanote','Bavo',0,0,'H',0.0]]
  },
  FR:{
    'Tchac':[['Stanguennec','Léo',0,0,'C',4.5],['Stanguennec','Enzo',0,0,'C',2.5],['Gréau','Corentin',0,0,'C',0.0],['Chevalier','Bastien',0,0,'C',-2.0],['Broussard','Benjamin',0,0,'D',-3.0]]
  },
  DE:{
    'Wall City':[['Sither','Ted',0,0,'H',3.0],['Eichler','Léo',0,0,'C',1.5],['Rickerts','Paul',0,0,'H',-2.0],['Clutton','Joel',0,0,'C',-2.5],['Dieckmann','Jakob',0,0,'C',-1.5],['Kaye','Phillip',0,0,'D',-3.0]],
    'Heidees':[['Ossmann','Franz',0,0,'C',7.0],['Meienburg','Florian',0,0,'C',-2.0],['Boehm','Konrad',0,0,'C',-2.5],['Teichert','Lars',0,0,'C',-3.0],['Geißler','Till',0,0,'C',-3.0]],
    'M.U.C.':[['Basov','Vladislav',0,0,'C',2.0],['Holzer','Denis',0,0,'C',2.0],['Hörnschemeyer','Torben',0,0,'C',2.0],['Maierhofer','Tobias',0,0,'C',2.0],['Wagner','Vincent',0,0,'C',2.0],['Stops','Michael',0,0,'C',2.0],['Wallace','Justin',0,0,'C',2.0]],
    'Ars Ludendi':[['Datum','Julian',0,0,'C',2.0],['Huyeng','Tim',0,0,'C',2.0],['Mock','Markus',0,0,'C',2.0],['Klein','Lucas',0,0,'C',2.0]],
    'Hardfisch':[['Marquardt','Kenichiro',0,0,'C',2.0],['Spanuth','Malte',0,0,'C',2.0]],
    'Bad Skid':[['Stepniak','Filip',0,0,'C',2.0],['Kücholl','Severin',0,0,'C',2.0]]
  },
  UK:{
    'Chevron Action Flash':[['Criddle','Sam',0,0,'H',2.5],['Jackson','Will',0,0,'C',2.5],['Pantling','Rupert',0,0,'C',0.5],['Allen','Seb',0,0,'C',0.0],['Pantling','Robert',0,0,'C',-1.5],['Tempest','Ben',0,0,'H',-2.0],['Beavan','Matthew',0,0,'C',-3.0],['Haines','Robbie',0,0,'C',-2.0],['Haywood','Luke',0,0,'C',-3.0]]
  }
};
// si aggiungono solo i nomi che non ci sono gia' (in nessun club del paese: chi cambia club resta dove i dati lo mettono)
for(const lk in LN_PL_PLUS){
  const seen=new Set();for(const c in LN_PL[lk])for(const r of LN_PL[lk][c])seen.add(usNameKey(r[1]+' '+r[0]));
  for(const c in LN_PL_PLUS[lk])for(const r of LN_PL_PLUS[lk][c]){const k=usNameKey(r[1]+' '+r[0]);if(seen.has(k))continue;seen.add(k);(LN_PL[lk][c]=LN_PL[lk][c]||[]).push(r);}
}
// Livello dei 7 titolari (come LN_CL, vedi 01-formati.js) corretto a mano rispetto ai dati generati, per i club fuori dal foglio Overall (quelli del foglio usano OVR_SHIFT, 30-carriera/00-ovr-2026.js).
// Due regole, per tutte le leghe: (1) chi gioca gli eventi piu' importanti e' di norma piu' forte di chi non li gioca. EUCF Breslavia e WUCC Limerick 2026 (Freezzz Beezzz, Heidees) con il rating dai
// punteggi (rating = media tra WUCC e EUCF, potenza attesa = 84,3 + 0,83 x rating, piu' 1,5 punti di prestigio) e piazzamenti 2024-2026. (2) Una serie piu' alta e' di norma piu' forte di una piu' bassa:
// nessun club di una serie supera di oltre 3 punti la potenza del club piu' debole della serie sopra meno 0,5 (Belgio, Francia, Germania; chi supera il tetto ci va sotto in fila, nello stesso ordine di prima): erano al contrario club come Eclipse Solaire (3º livello belga, 10 punti sopra
// l'ultimo del 2º). Jetset Open (4º belga) resta sotto Freezzz Beezzz.
// Revisione Open su tutti gli eventi EUCS 2026. Metodo e fonti in docs/OPEN-EUCS-2026.md.
const LN_EUCS_OPEN_LEVEL={
  "SMASH'D":80,
  "SMOG Open":81,
  "Bristol Open":81.5,
  "Alba":78.5,
  "SOLENT Open":77.5,
  "Ka-Pow!":77.5,
  "Magic Disc":79.5,
  "PUC Ultimate":78.5,
  "Roazhon Ultimate":77,
  "BORA":75,
  "Hardfisch":76.5,
};
const LN_POW_FIX={
  ...LN_EUCS_OPEN_LEVEL,
  'M.U.C.':84,
  'Freezzz Beezzz one':87.5,
  'Heidees':84,
  'Helgtre Open':69.8,
  'Éclipse Solaire':65.3,
  'Bremen Ultimate':58.5,
  'Gummibärchen':58.4
};
// livello (bonus) dei giocatori corretto a mano, con la fonte: Freezzz Beezzz one. I bonus dei dati generati seguivano poco le statistiche (correlazione 0,54 con mete+assist a partita del
// WUCC 2026, contro 0,76-0,87 degli altri club Open) e Victor Weller (2,0 punti a partita, terzo della squadra) era fuori dalla rosa; con le 10 partite Open del WUCC 2026 (Limerick, portali
// WFDF) il bonus e' la media tra il vecchio e la retta ricavata dagli altri club (bonus = -3,14 + 2,41 x punti a partita), solo la retta per chi non aveva dati; a meta' interi.
const LN_BONUS_FIX={'Freezzz Beezzz one':{'Lucca Rogissart':4,'Kamiel Van Mullem':2.5,'Corneel Descan':2,'Arthur Moyersoen':2,'Victor Weller':1.5,'Arne Geernaert':1,'Stan Vanhecke':1,'Tom Van Quathem':0.5,'August Smessaert':0.5,'Adrien Aurousseau':0.5,'Raf De Vlaemynck':-0.5,'Raven Proot':-0.5,'Ewoud Delanote':-0.5,'Stan Coppejans':-1,'Emile Willems':-1.5,'William Dumon':-1.5,'Bavo Delanote':-1.5,'Broes Delanote':-2,'Robbe Wets':-2,'Joseph Delachat':-2,'Lars Vanderbeck':-2.5,'Seppe Demeulemeester':-2.5}};


// M.U.C. 2026: riscontri Mixed nelle finali EUCF (Tiefseetaucher e Zamperl) e ai WUCC.
// https://eucf.ultimatefederation.eu/?view=teamcard&team=1184
// https://eucf.ultimatefederation.eu/?view=teamcard&team=1227
LN_PL.DE['M.U.C.']=[
  ...(LN_PL.DE['M.U.C.']||[]),
  ['Rincker','Yannik',0,0,'C',6],
  ['Wolf','Aaron',0,0,'C',7],
  ['Walker','Simon',0,0,'C',4],
  ['Klimesch','Moritz',0,0,'C',5],
  ['Bernecker','Henri',0,0,'H',3],
  ['Maierhofer','Fabian',0,0,'H',3]
];

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

/* ===================== USA MEN'S CLUB: REPUTAZIONE SU PIU' ANNI =====================
   L'Overall dei Nationals 2026 (Fantasy Ultimate) misura un solo torneo, e un torneo puo' andare storto anche a un fuoriclasse. Questa tabella da' un livello minimo (Overall)
   a chi ha un curriculum di premi su piu' stagioni, dalle fonti pubbliche: All-UFA 2024 e 2025 (watchufa.com: Babbitt in una squadra All-UFA 7 stagioni su 9, Dunn e Jagt 7 di fila,
   Brandt, Magsig e Martin due anni di fila), Giocatore dell'anno e squadre All-Club di Ultiworld 2024-2026 (Hayes nel 2024; Boxley, Fairfax, Hecht, Randolph e Glass nel 2025;
   Dameron, De Morgan e Glass nel 2026); Raekwon Adkins (Ultiworld Breakout Player of the Year 2025, nazionale USA, Oakland Spiders in UFA) e Orion Cable (candidato al Block of the Year 2025 di Ultiworld, preso come giovane di punta dei Nationals) valgono piu' dei costi bassi dei dati Fantasy; Tobias Brooks (21 anni, tra i migliori lanciatori della UFA: primo per yard lanciate a partita nel 2025). Europei: McHale e Stanguennec sono nei migliori 25 Open d'Europa 2026 (Ultiworld), Derks e' il miglior emergente europeo e ha segnato 30 punti all'Elite Invite, Karklins e' tra i migliori d'Europa; Robert ha segnato piu' mete di tutti in UFA nel 2026. Non abbassa mai nessuno: il livello vero e' il piu' alto tra Fantasy, mercato, premi All-UFA 2026 e questa tabella.
   Le stelle del mercato (STARS) alzano il loro Overall qui sotto (reputazione e premi All-UFA 2026), cosi' hanno lo stesso livello sul mercato e nel club USA. */
const US_REP={
  'Jack Williams':88,'Jeff Babbitt':93,'Ben Jagt':91,'Travis Dunn':90,'Will Brandt':87,'Evan Magsig':87,'Garrett Martin':88,
  'Raphy Hayes':88,'Christian Boxley':87,'Jacob Fairfax':87,'Malcolm Hecht':86,'John Randolph':89,'Will Selfridge':85,
  'Mica Glass':87,'Ben Dameron':87,'Nathan De Morgan':87,
  'Raekwon Adkins':90,'Orion Cable':88,'Tobias Brooks':90,
  'Connor McHale':84,'Léo Stanguennec':83,'Jelte Derks':86,'Arvids Karklins':86,'Pieran Robert':85
};
let usRepMap=null;
function usRepFloor(k){   // k = chiave di usNameKey
  if(!usRepMap){usRepMap={};for(const n in US_REP)usRepMap[usNameKey(n)]=US_REP[n];}
  return usRepMap[k]|0;
}
for(const r of STARS)r[4]=Math.max(r[4],usAward(r[0],r[1]));   // anche i premi All-UFA 2026: stesso Overall sul mercato e nel club USA

/* ===================== USA MEN'S CLUB: i 32 club, le 4 Conference e le costanti =====================
   Seconda competizione della carriera, alternativa al campionato italiano (che resta com'e'): SV.lk==='US', SV.sr==='U'.
   I club sono quelli veri della divisione Men's del circuito USA Ultimate (non UFA; Toronto GOAT, Vancouver Furious George e Montréal Mephisto sono canadesi ma giocano nei campionati di USA Ultimate), con il rating dei Postseason Rankings USAU 2026 (proiezione Ultiworld dove manca;
   per Shrimp e Mephisto il rating e' stimato). Le Conference sono geografiche e fisse: niente promozioni ne' retrocessioni.
   Struttura della stagione (regole in 02-stagione-usa.js): 7 giornate nella propria Conference, Play-in, Nationals a 16 squadre. */
const US_CONF={E:'Eastern',W:'Western',C:'Central',S:'Southern'},US_CK=['E','W','C','S'];
// [nome, citta', Conference, rating USAU 2026]: rating dei Postseason Rankings USAU 2026 (o proiezione Ultiworld). Stimati: Salt Lake City Shrimp (nessun dato 2026) e Montréal Mephisto (non ha rating nella tabella ricevuta). Conference geografiche da 8: Eastern (Nord-Est e Ontario/Quebec), Southern (Sud-Est e Mid-Atlantic del Sud), Central (Midwest, Pianure, Texas, Colorado), Western (costa del Pacifico, Utah, Columbia Britannica)
const US_RAW=[
  ['New York PoNY','New York (NY)','E',2200],['Boston DiG','Boston (MA)','E',2152],['Philadelphia Pacmen','Philadelphia (PA)','E',2030],
  ['Portland Red Tide','Portland (ME)','E',1762],['Amherst Sprout','Amherst (MA)','E',1625],['New York Blueprint','New York (NY)','E',1584],
  ['Montréal Mephisto','Montréal (QC, Canada)','E',1790],['Toronto GOAT','Toronto (ON, Canada)','E',1991],['San Francisco Revolver','San Francisco (CA)','W',2172],
  ['Portland Rhino Slam!','Portland (OR)','W',2173],['Seattle Sockeye','Seattle (WA)','W',1977],['Eugene Dark Star','Eugene (OR)','W',1625],
  ['SoCal Condors','California del Sud (CA)','W',1709],['Bay Area Wavestorms','Santa Cruz (CA)','W',1293.45],['Salt Lake City Shrimp','Salt Lake City (UT)','W',1450],
  ['Vancouver Furious George','Vancouver (BC, Canada)','W',1809],['Chicago Machine','Chicago (IL)','C',2219],['Minneapolis Sub Zero','Minneapolis (MN)','C',1993],
  ['Minneapolis Mallard','Minneapolis (MN)','C',1268.86],['Madison Mad Men','Madison (WI)','C',1717],['Chicago Haymaker','Chicago (IL)','C',1675],
  ['Indianapolis I-69','Indianapolis (IN)','C',1456.39],['Denver Johnny Bravo','Denver (CO)','C',1916],['Austin Doublewide','Austin (TX)','C',1676],
  ['Raleigh Ring of Fire','Raleigh (NC)','S',2205],['Atlanta Chain Lightning','Atlanta (GA)','S',2043],['Washington DC Truck Stop','Washington (DC)','S',2023],
  ['Raleigh-Durham United','Raleigh-Durham (NC)','S',1703],['Florida Untied','Florida (FL)','S',1552.07],['Charlotte baNC','Charlotte (NC)','S',1529],
  ['Chattanooga Tanasi','Chattanooga (TN)','S',1447.34],['Virginia Vault','Virginia (VA)','S',1545.24]
];
const US_TEAM={},US_BYCONF={E:[],W:[],C:[],S:[]},US_NAMES=[];
const US_ORD=US_RAW.slice().sort((a,b)=>b[3]-a[3]),US_RMAX=US_ORD[0][3],US_RMIN=US_ORD[31][3];
US_ORD.forEach(([n,city,cf,rt],i)=>{   // forza di partenza dal rating: dal 94 del primo al 72 dell'ultimo (la Serie A italiana va da 88 a 75)
  US_TEAM[n]={series:'U',conf:cf,city,rank:i+1,rating:rt,power:Math.round((72+(rt-US_RMIN)/(US_RMAX-US_RMIN)*22)*10)/10};
});
for(const [n,,cf] of US_RAW){US_BYCONF[cf].push(n);US_NAMES.push(n);}   // l'ordine delle Conference resta quello dell'elenco
// la Serie italiana e' 'A'|'B'|'C'; per il campionato USA la serie del giocatore e' 'U' (un solo livello, le Conference non si sale e non si scende)
SERIES_NAME.U='USA Men’s Club';SR_K.U=1.65;
const isUS=()=>!!(SV&&SV.lk==='US');
const usConfOf=n=>US_TEAM[n]?US_TEAM[n].conf:null;
const usConfName=c=>US_CONF[c]+' Conference';
// fasi della stagione USA (SV.us.ph): reg = stagione regolare, pin = Play-in, nat = Nationals, done = stagione conclusa
const US_STAGE=['Fuori dai Play-in','Play-in','Nationals: girone','Prequarti','Quarti','Semifinale','Finale','Campioni'];   // il punto piu' lontano raggiunto (0..7)
const US_NATROUND=['Girone · 1ª partita','Girone · 2ª partita','Girone · 3ª partita','Prequarti','Quarti di finale','Semifinale','Finale'];

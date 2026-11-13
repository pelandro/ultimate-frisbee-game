/* ===================== USA MEN'S CLUB: i 32 club, le 4 Conference e le costanti =====================
   Seconda competizione della carriera, alternativa al campionato italiano (che resta com'e'): SV.lk==='US', SV.sr==='U'.
   I club sono quelli veri della divisione Men's del circuito USA Ultimate (non UFA; Toronto GOAT e Vancouver Furious George sono canadesi: giocano nelle regioni Great Lakes e Northwest di USA Ultimate), con il rating dei Postseason Rankings USAU 2026 (proiezione Ultiworld dove manca;
   per Shrimp e Cowtown Cannons, senza dati 2026, il rating e' stimato). Le Conference sono geografiche e fisse: niente promozioni ne' retrocessioni.
   Struttura della stagione (regole in 02-stagione-usa.js): 7 giornate nella propria Conference, Play-in, Nationals a 16 squadre. */
const US_CONF={E:'Eastern',W:'Western',C:'Central',S:'Southern'},US_CK=['E','W','C','S'];
// [nome, citta', Conference, rating USAU 2026]: rating dei Postseason Rankings USAU 2026 (o proiezione Ultiworld); Shrimp e Cowtown Cannons non ne hanno: stimato
const US_RAW=[
  ['Raleigh Ring of Fire','Raleigh (NC)','S',2205],['San Francisco Revolver','San Francisco (CA)','W',2172],['Chicago Machine','Chicago (IL)','C',2219],
  ['Portland Rhino Slam!','Portland (OR)','W',2173],['New York PoNY','New York (NY)','E',2200],['Atlanta Chain Lightning','Atlanta (GA)','S',2043],
  ['Boston DiG','Boston (MA)','E',2152],['Minneapolis Sub Zero','Minneapolis (MN)','C',1993],['Minneapolis Mallard','Minneapolis (MN)','C',1268.86],
  ['Denver Johnny Bravo','Denver (CO)','W',1916],['Philadelphia Pacmen','Philadelphia (PA)','E',2030],['Washington DC Truck Stop','Washington (DC)','E',2023],
  ['Seattle Sockeye','Seattle (WA)','W',1977],['Austin Doublewide','Austin (TX)','S',1676],['Vancouver Furious George','Vancouver (BC, Canada)','C',1809],
  ['Toronto GOAT','Toronto (ON, Canada)','C',1991],['Eugene Dark Star','Eugene (OR)','W',1625],['Madison Mad Men','Madison (WI)','C',1717],
  ['SoCal Condors','California del Sud (CA)','W',1709],['Charlotte baNC','Charlotte (NC)','S',1529],['Florida Untied','Florida (FL)','S',1552.07],
  ['Raleigh-Durham United','Raleigh-Durham (NC)','S',1703],['Portland Red Tide','Portland (ME)','E',1762],['Amherst Sprout','Amherst (MA)','E',1625],
  ['Virginia Vault','Virginia (VA)','E',1545.24],['Chicago Haymaker','Chicago (IL)','C',1675],['New York Blueprint','New York (NY)','E',1584],
  ['Salt Lake City Shrimp','Salt Lake City (UT)','W',1285],['Bay Area Wavestorms','Santa Cruz (CA)','W',1293.45],['Indianapolis I-69','Indianapolis (IN)','C',1456.39],
  ['Chattanooga Tanasi','Chattanooga (TN)','S',1447.34],['Fort Worth Cowtown Cannons','Fort Worth (TX)','S',1275]
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

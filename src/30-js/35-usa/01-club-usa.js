/* ===================== USA MEN'S CLUB: i 32 club, le 4 Conference e le costanti =====================
   Seconda competizione della carriera, alternativa al campionato italiano (che resta com'e'): SV.lk==='US', SV.sr==='U'.
   I club sono quelli veri della divisione Men's del circuito USA Ultimate (non UFA; Toronto GOAT e Vancouver Furious George, canadesi, giocano nella regione Great Lakes di USA Ultimate), nell'ordine di forza della classifica Ultiworld/USAU di
   novembre 2026; dove la classifica non arriva, la posizione e' stimata. Le Conference sono geografiche e fisse: niente promozioni ne' retrocessioni.
   Struttura della stagione (regole in 02-stagione-usa.js): 7 giornate nella propria Conference, Play-in, Nationals a 16 squadre. */
const US_CONF={E:'Eastern',W:'Western',C:'Central',S:'Southern'},US_CK=['E','W','C','S'];
// [nome, citta', Conference], dal piu' forte al meno forte
const US_RAW=[
  ['Raleigh Ring of Fire','Raleigh (NC)','S'],['San Francisco Revolver','San Francisco (CA)','W'],['Chicago Machine','Chicago (IL)','C'],['Portland Rhino Slam!','Portland (OR)','W'],
  ['New York PoNY','New York (NY)','E'],['Atlanta Chain Lightning','Atlanta (GA)','S'],['Boston DiG','Boston (MA)','E'],['Minneapolis Sub Zero','Minneapolis (MN)','C'],
  ['Minneapolis Mallard','Minneapolis (MN)','C'],['Denver Johnny Bravo','Denver (CO)','W'],['Philadelphia Pacmen','Philadelphia (PA)','E'],['Washington DC Truck Stop','Washington (DC)','E'],
  ['Seattle Sockeye','Seattle (WA)','W'],['Austin Doublewide','Austin (TX)','S'],['Vancouver Furious George','Vancouver (BC, Canada)','C'],['Toronto GOAT','Toronto (ON, Canada)','C'],['Eugene Dark Star','Eugene (OR)','W'],['Madison Mad Men','Madison (WI)','C'],
  ['SoCal Condors','California del Sud (CA)','W'],['Charlotte baNC','Charlotte (NC)','S'],['Florida Untied','Florida (FL)','S'],['Raleigh-Durham United','Raleigh-Durham (NC)','S'],
  ['Portland Red Tide','Portland (ME)','E'],['Amherst Sprout','Amherst (MA)','E'],['Virginia Vault','Virginia (VA)','E'],['Chicago Haymaker','Chicago (IL)','C'],
  ['New York Blueprint','New York (NY)','E'],['Salt Lake City Shrimp','Salt Lake City (UT)','W'],['Bay Area Wavestorms','Bay Area (CA)','W'],['Indianapolis I-69','Indianapolis (IN)','C'],
  ['Chattanooga Tanasi','Chattanooga (TN)','S'],['Fort Worth Cowtown Cannons','Fort Worth (TX)','S']
];
const US_TEAM={},US_BYCONF={E:[],W:[],C:[],S:[]},US_NAMES=[];
US_RAW.forEach(([n,city,cf],i)=>{   // forza di partenza: dal 94 del primo al 72 dell'ultimo (la Serie A italiana va da 88 a 75)
  US_TEAM[n]={series:'U',conf:cf,city,rank:i+1,power:Math.round((94-i*22/31)*10)/10};
  US_BYCONF[cf].push(n);US_NAMES.push(n);
});
// la Serie italiana e' 'A'|'B'|'C'; per il campionato USA la serie del giocatore e' 'U' (un solo livello, le Conference non si sale e non si scende)
SERIES_NAME.U='USA Men’s Club';SR_K.U=1.65;
const isUS=()=>!!(SV&&SV.lk==='US');
const usConfOf=n=>US_TEAM[n]?US_TEAM[n].conf:null;
const usConfName=c=>US_CONF[c]+' Conference';
// fasi della stagione USA (SV.us.ph): reg = stagione regolare, pin = Play-in, nat = Nationals, done = stagione conclusa
const US_STAGE=['Fuori dai Play-in','Play-in','Nationals: girone','Prequarti','Quarti','Semifinale','Finale','Campioni'];   // il punto piu' lontano raggiunto (0..7)
const US_NATROUND=['Girone · 1ª partita','Girone · 2ª partita','Girone · 3ª partita','Prequarti','Quarti di finale','Semifinale','Finale'];

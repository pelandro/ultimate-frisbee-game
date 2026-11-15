/* ===================== USA MEN'S CLUB: i 48 club, le 8 Conference e le costanti =====================
   Seconda competizione della carriera, alternativa al campionato italiano (che resta com'e'): SV.lk==='US', SV.sr==='U'.
   I club sono quelli veri della divisione Men's del circuito USA Ultimate (non UFA; Toronto GOAT, Vancouver Furious George e Montréal Mephisto sono canadesi ma giocano nei campionati di USA Ultimate),
   con il rating dei Postseason Rankings USAU 2026 finali (dopo i Nationals). Le 8 Conference sono le regioni vere di USA Ultimate (Northeast, Mid-Atlantic, Southeast, Great Lakes, North Central,
   South Central, Northwest, Southwest), 6 club ciascuna. I 32 club della prima versione sono rimasti dove la regione USAU li colloca; per arrivare a 6 per regione si sono aggiunti i 16 club
   meglio classificati nel ranking nazionale tra quelli che mancavano. Fanno eccezione Salt Lake City Shrimp (nessun dato 2026: rating stimato). Le Conference non cambiano mai: niente
   promozioni ne' retrocessioni. Struttura della stagione (regole in 03-stagione-usa.js): 5 giornate nella propria Conference e 7 interregionali (una contro ogni altra Conference), Play-in, Nationals a 16 squadre. */
const US_CONF={NE:'Northeast',MA:'Mid-Atlantic',SE:'Southeast',GL:'Great Lakes',NC:'North Central',SC:'South Central',NW:'Northwest',SW:'Southwest'},US_CK=['NE','MA','SE','GL','NC','SC','NW','SW'];
// [nome, citta', Conference, rating USAU 2026]: rating dei Postseason Rankings USAU 2026 (o proiezione Ultiworld). Stimati: Salt Lake City Shrimp (nessun dato 2026) e Montréal Mephisto (non ha rating nella tabella ricevuta). Conference geografiche da 8: Eastern (Nord-Est e Ontario/Quebec), Southern (Sud-Est e Mid-Atlantic del Sud), Central (Midwest, Pianure, Texas, Colorado), Western (costa del Pacifico, Utah, Columbia Britannica)
const US_RAW=[
  ['New York PoNY','New York (NY)','NE',2343],['Boston DiG','Boston (MA)','NE',2358],['Portland Red Tide','Portland (ME)','NE',1922],
  ['Amherst Sprout','Amherst (MA)','NE',1700],['New York Blueprint','New York (NY)','NE',1759],['Montréal Mephisto','Montréal (QC, Canada)','NE',1895],
  ['Washington DC Truck Stop','Washington (DC)','MA',2209],['Philadelphia Pacmen','Philadelphia (PA)','MA',2190],['Virginia Vault','Virginia (VA)','MA',1689],
  ['Oak Grove Boys','Capital (VA/MD)','MA',1663],['Pittsburgh Temper','Pittsburgh (PA)','MA',1612],['Garden State Ultimate','New Jersey (NJ)','MA',1353],
  ['Raleigh Ring of Fire','Raleigh (NC)','SE',2244],['Atlanta Chain Lightning','Atlanta (GA)','SE',2167],['Raleigh-Durham United','Raleigh-Durham (NC)','SE',1896],
  ['Florida Untied','Florida (FL)','SE',1727],['Charlotte baNC','Charlotte (NC)','SE',1549],['Chattanooga Tanasi','Chattanooga (TN)','SE',1434],
  ['Chicago Machine','Chicago (IL)','GL',2380],['Toronto GOAT','Toronto (ON, Canada)','GL',2160],['Chicago Haymaker','Chicago (IL)','GL',1894],
  ['Indianapolis I-69','Indianapolis (IN)','GL',1454],['Flying Dutchmen','Great Lakes','GL',1464],['Trident','Great Lakes','GL',1395],
  ['Minneapolis Sub Zero','Minneapolis (MN)','NC',2258],['Madison Mad Men','Madison (WI)','NC',1815],['Minneapolis Mallard','Minneapolis (MN)','NC',1424],
  ['Lounar','North Central','NC',1519],['Kansas City Smokestack','Kansas City (MO)','NC',1424],['Knights of Ni','North Central','NC',1275],
  ['Denver Johnny Bravo','Denver (CO)','SC',2061],['Austin Doublewide','Austin (TX)','SC',1927],['Fungi','South Central','SC',1440],
  ['Alamode','South Central','SC',1174],['Boulder ISO Atmo','Boulder (CO)','SC',1097],['ZOO','South Central','SC',965],
  ['Portland Rhino Slam!','Portland (OR)','NW',2344],['Seattle Sockeye','Seattle (WA)','NW',2142],['Vancouver Furious George','Vancouver (BC, Canada)','NW',2019],
  ['Eugene Dark Star','Eugene (OR)','NW',1770],['Salt Lake City Shrimp','Salt Lake City (UT)','NW',1400],['SOUF','Northwest','NW',1543],
  ['San Francisco Revolver','San Francisco (CA)','SW',2414],['SoCal Condors','California del Sud (CA)','SW',1781],['Bay Area Wavestorms','Santa Cruz (CA)','SW',1472],
  ['Arizona Nighthawk','Phoenix (AZ)','SW',1532],['Zodiac','Southwest','SW',1345],['Hazard','Southwest','SW',1188]
];
const US_TEAM={},US_BYCONF={},US_NAMES=[];for(const c of US_CK)US_BYCONF[c]=[];
const US_ORD=US_RAW.slice().sort((a,b)=>b[3]-a[3]),US_RMAX=US_ORD[0][3],US_RMIN=US_ORD[US_ORD.length-1][3];
US_ORD.forEach(([n,city,cf,rt],i)=>{   // forza di partenza dal rating: dal 94 del primo al 72 dell'ultimo (la Serie A italiana va da 88 a 75)
  US_TEAM[n]={series:'U',conf:cf,city,rank:i+1,rating:rt,power:Math.round((72+(rt-US_RMIN)/(US_RMAX-US_RMIN)*19.5)*10)/10};
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

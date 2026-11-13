/* ===================== USA MEN'S CLUB: ROSTER =====================
   Giocatori veri della stagione 2026, da due tabelle ricevute: i roster dei Nationals 2026 (16 club, circa 25 giocatori ciascuno, con mete, assist, difese) e
   i giocatori identificati nelle fonti pubbliche per gli altri club. Non sono roster ufficiali completi: 8 club hanno pochi nomi o nessuno. Dove manca, la rosa
   e' completata con giocatori generati (gen:true, nomi americani), tarati sulla forza del club. Una rosa ha al massimo 20 giocatori (i primi per rendimento).
   Eta' e ruolo dei giocatori di US_CORE sono stime (compaiono con «circa»; il ruolo e' handler se hanno piu' assist che mete); il quinto numero e' il bonus di
   livello rispetto al club (da -4 a +6) in base al rendimento ai Nationals 2026 (mete + assist + 1,5 difese). Per i 16 club dei Nationals prevalgono pero' i dati
   di Fantasy Ultimate (00-fantasy.js): livello assoluto (usFFabs, da punti a partita, costo e, per le stelle, fama di mercato) e ruolo (usFFrole, dai punteggi per ruolo) valgono anche per le stelle del
   mercato, e chi e' nei dati ma non in US_CORE entra in rosa se rende abbastanza (usFFextra). Per le stelle di un club senza dati vale l'Overall del mercato.
   Le eta' possono essere esatte (schede pubbliche UFA), limitate dalle convocazioni giovanili U20/U24 o stimate: vedi 00-eta-ufa.js e usAgeOf. I premi All-UFA 2026
   danno un pavimento di livello (usAward).
   US_CORE = giocatori veri non presenti tra i «giocatori internazionali» del mercato: [cognome, nome, eta', ruolo H|C|D, bonus]. */
const US_CORE={
  'New York PoNY':[['Dameron','Ben',27,'H',6],['Whitlock','Nicholas',27,'C',5],['Little','Samuel',25,'C',3],['Cowan','Jacob',26,'C',2],['Miller','Declan',25,'H',2],['LaBar','Matt',23,'C',0],['Valsaraj','Vinay',25,'C',-1],['Stevens-Stein','Joshua',26,'H',-1],['Kaplan','Isaac',23,'H',-1],['Lhamo','Nima',26,'C',-2],['Alladi','Shashank',23,'H',-2],['Lieman','Ethan',28,'H',-2]],
  'Boston DiG':[['Boerth','Peter',27,'H',6],['Graff','Oscar',25,'H',5],['Stoughton','Calvin',26,'H',4],['Ruelle','Simon',29,'H',3],['Yuan','Albert',29,'H',3],['Dinger','Ryan',25,'H',2],['Carapella','Simon',27,'C',1],['Davis-Brand','Cole',27,'H',1],['Conroy','Jack',23,'C',1],['McCann','Brendan',29,'C',0],['Parinella','Christopher',25,'C',0],['Cable','Orion',24,'C',0],['Kaplan','Jacob',29,'D',-1],['Kotz','Peter',31,'H',-1],['Levine','Cameron',31,'C',-1]],
  'Philadelphia Pacmen':[['Pigeon','Ethan',26,'H',6],['Beidler-Shenk','Ezra',23,'H',5],['Piercy','Logan',31,'D',5],['Erdman','Owen',28,'C',4],['Duncan','Reid',28,'C',4],['Grossberg','Adam',26,'H',3],['Barry','Luke',32,'H',2],['Hill','Sam',28,'H',2],['Tran','Maxwell',30,'H',2],['Rosenthal','Aaron',29,'H',1],['Holmgren','Ethan',32,'H',1],['White','Colin',28,'C',1],['Helenski','Will',29,'H',0],['Joseph','Becker',25,'H',-1],['Hanna','Matthew',27,'H',-1]],
  'Washington DC Truck Stop':[['Grovic','Miles',31,'C',6],['Nissen','Jacques',25,'C',6],['Fall','Alexandre',31,'C',5],['Wagner','Micah',26,'C',5],['Lee','Isaac',32,'H',4],['Loveranes','Jacob',24,'H',4],['Betrancourt','Louis',24,'C',4],['Monroe','Tyler',29,'H',4],['Dia','Moussa',23,'H',4],['Tom','Jasper',24,'D',3],['Hess','Jeremy',28,'D',3],['Bontemps','Sofiene',26,'H',2],['Downey','Aidan',24,'C',2],['Greenberg','Benjamin',30,'H',0],['Norbom','Gus',28,'H',0]],
  'Portland Red Tide':[['Kelley','Stewart',25,'H',0]],
  'Amherst Sprout':[['Stang-Osborne','Jonah',26,'C',0]],
  'San Francisco Revolver':[['Adkins','Raekwon',31,'H',6],['Clyburn','Dexter',29,'C',3],['Whited','Dillon',32,'C',3],['Lew','Kyle',23,'H',2],['Vallee','Jason',31,'C',2],['Robinson','Seamus',23,'H',2],['Higgins','Simon',28,'C',2],['Vickers Batzdorf','Robin',32,'C',1],['Zwerin','Max',23,'C',0],['Nelson','Alex',28,'C',0],['Orme','Anton',30,'H',-1]],
  'Portland Rhino Slam!':[['Glass','Mica',29,'H',6],['Hall-Witt','Alex',30,'C',3],['Moren','Felix',29,'C',2],['Sealand','David',31,'H',1],['Bosworth','Callahan',27,'C',0],['Lohre','Will',30,'H',0],['Ing','Henry',31,'H',0],['Lee','Daniel',28,'H',0],['Smith','Trevor',30,'C',0],['Hatchett','Jack',31,'H',0],['Stuart','Nick',30,'H',-1],['Kaplan','Aaron',30,'H',-2],['Hornisberger','Ben',26,'C',-2],['Boyd-Fliegel','Chander',26,'C',-2],['Strub','Christopher',31,'C',-2],['Marmerstein','Joseph',31,'H',-2],['Knutson','Nathan',32,'C',-2],['Anderson','Sam',29,'H',-2]],
  'Denver Johnny Bravo':[['Min-Fink','Nanda',24,'H',6],['Agee','Mathieu',28,'H',3],['Tucker Kalmus','Geoffrey',28,'H',3],['Jackson','Matt',31,'H',2],['Piper','Alex',24,'C',2],['Tatum','Alex',30,'H',2],['Buchholz','Nathan',29,'H',2],['Landesman','Daniel',31,'C',2],['Bechis','Dennison',24,'C',2],['May','Hunter',26,'C',1],['Ponzio','Kuochuan',29,'C',-1],['Pew','Sammy',23,'C',-1],['Rifaat','Rami',32,'H',-1],['Hotaling','Erik',29,'H',-2],['Pew','Kimball',25,'C',-2],['Cochran','Jackson',32,'C',-2]],
  'Seattle Sockeye':[['Fuzat','Xavier',25,'H',6],['Ramstad','Max',26,'H',6],['Hines','Cedar',28,'H',6],['Diamond','Elijah',25,'H',5],['Bayer','Carter',32,'C',4],['Shigley','Ryan',32,'H',3],['Gade','Max',32,'C',2],['Kulczak','Mitch',31,'H',2],['Brown','Chackgarin',29,'H',2],['Mourad','Derek',32,'H',1],['Ishikawa-Szabo','Zoli',29,'H',1],['Chen','Daniel',30,'D',1],['Howard','Parker',29,'H',0],['Belfiore','Alexander',26,'H',-1],['Lantz','Asher',25,'H',-1],['Chen','Dongyang',28,'C',-1]],
  'Eugene Dark Star':[['Petrus','Braedon',25,'C',0],['Thoennes','Ben',25,'C',0],['Casper','Eli',27,'C',0],['Impas','Orlando',28,'H',0]],
  'SoCal Condors':[['Koo','KJ',24,'C',0],['Combs','Max',32,'C',0],['Gibson','Max',31,'C',0]],
  'Bay Area Wavestorms':[['Shargel','Bodie',26,'H',0],['Warren','Toby',24,'H',0]],
  'Chicago Machine':[['Hawkins','Elliot',31,'H',6],['Bartlett','Aaron',32,'C',5],['Smith','Rutledge',29,'H',5],['Arters','Paul',26,'H',5],['Bansfield','Johnny',26,'H',4],['Thoreson','Zeke',28,'C',4],['McGuckin','Samuel',30,'C',3],['Gao','Jeffrey',30,'H',2],['Schoch','Timothy',31,'D',2],['Matthews','Wilson',25,'C',2],['Rutledge','Kyle',27,'C',1],['Astrom','Nathaniel',32,'H',1],['Stautberg','Adam',26,'D',1],['North','Keegan',29,'C',1],['Artemakis','Eli',28,'H',1],['Steslicki','Jake',28,'H',0]],
  'Minneapolis Sub Zero':[['De Morgan','Nathan',31,'H',6],['Davis','Micah',28,'H',3],['Mans','Peter',25,'H',2],['Morton','Zach',23,'C',2],['duSaire','Ryan',29,'D',1],['Shope','Thomas',26,'H',1],['Sovell-Fernandez','Leo',29,'H',0],['Crosby Lehmann','Eric',28,'H',0],['King','Austin',32,'H',-1],['Casperson','Will',24,'C',-1],['Farley','Leo',26,'C',-1],['Lomen','Aiden',23,'H',-2],['Brauer','Sebastian',29,'H',-2],['Krapfl','Blake',32,'H',-3],['Hobday','Danny',23,'C',-3],['Ode','Ethan',23,'H',-3],['Hanscom','Max',24,'C',-3]],
  'Madison Mad Men':[['Carne','Arthur',27,'C',0],['Sjostrom','Eric',27,'C',0],['Ranhabat','Nico',23,'C',0]],
  'Chicago Haymaker':[['Cercello','Joe',25,'C',0]],
  'Toronto GOAT':[['MacKenzie','Michael',27,'C',6],['Gallant','Martin',29,'H',6],['Podnar','Justin',29,'H',5],['Lewis','James',27,'H',5],['Sehgal','Araav',28,'H',5],['Stonehouse','Oscar',29,'H',4],['Pettenuzzo','Max',26,'H',3],['Ancelin','Gaël',24,'H',2],['McRae','Keith',31,'C',2],['Turner','Philip',30,'C',2],['Turcotte','Adam',30,'H',0],['Hsieh','Nathan',23,'H',0],['Miller','John',25,'C',-1],['Zlatic','Marijo',30,'H',-1],['McHale','Connor',30,'C',-1],['Robinson','Owen',30,'H',-1],['O’Donnell','Adam',25,'H',-1],['Comire','Luc',32,'C',-2],['Ayad','Maxime',32,'H',-2],['Zhuang','Eric',23,'C',-2]],
  'Vancouver Furious George':[['Auger-Semmar','Malik',25,'H',6],['Debroux','Neo',26,'H',4],['Yuen','Rex',24,'H',4],['Underhill','Kevin',28,'H',4],['Lebbell','Nyle',31,'C',4],['Bulloch','Vincent',28,'C',4],['O’Donnell','Kai',31,'C',3],['Mcleod','Richard',28,'D',3],['Snider','Quinn',27,'H',2],['Ramirez Ortiz','Simon',24,'H',2],['Tran','Ricky',32,'C',2],['Tsang','Tim',32,'H',2],['Bringeland-Powell','Devon',31,'D',1],['Lavoie','Landon',26,'H',1],['McColl','Bryn',25,'C',0],['Yu','Peter',27,'H',0],['Bryson','Malcolm',31,'H',-1],['McGregor','Jordan',23,'H',-1],['van den Driesen','Andrew',24,'H',-2],['Ponton','Jack',28,'H',-2]],
  'Raleigh Ring of Fire':[['Barcellos','Matthew',24,'H',6],['Belus','Christian',24,'H',5],['Singleton','Josh',27,'H',4],['Williams','Justin-Cooper',29,'H',4],['Hawkins','Dylan',25,'C',3],['Pignone','Kevin',32,'H',2],['Li','Andrew',26,'H',2],['Fried','Eli',25,'C',2],['Lessard','Henri',28,'H',1],['Lynch','Trevor',28,'C',1],['McDonnell','John',30,'H',0],['Stout','Owen',24,'H',0],['Trowbridge','Brian',29,'C',0],['Morrison','Brayden',24,'H',0],['Searles-Bohs','Liam',23,'H',0],['Madiraju','Suhas',27,'C',-1],['Matthews','Walker',29,'H',-1]],
  'Atlanta Chain Lightning':[['McCall','Stefan',32,'C',6],['Poe','Michael',27,'C',5],['Austin-Knab','Hayden',26,'H',4],['Evans','Jason',28,'D',3],['Spiva','Nick',24,'H',3],['Richman','Grady',30,'C',1],['Thai','Andrew',30,'H',1],['Landry','Ryan',30,'H',1],['Haberfield','Liam',29,'C',0],['Spanuth','Malte',31,'D',0],['Greene','Ki',25,'C',0],['Ellard','Walter',24,'H',-1],['Johnson','Matt',25,'H',-1],['Tappero','Coleman',32,'H',-1],['Humm','Michael-Angelo',30,'C',-1],['Munnis','Samuel',24,'H',-2]],
  'Austin Doublewide':[['Armour','Matthew',26,'H',6],['Weston','Bodhi',27,'C',5],['Barcio','Aaron',29,'C',5],['Gauger','Jannis',24,'D',5],['Potts','Jackson',31,'H',4],['Fitzgerald','Duncan',28,'H',4],['White','Cade',30,'C',3],['Moore','Elliott',29,'H',3],['Gust','George',28,'C',3],['Mosher','Timothy',31,'C',2],['Cruz-Garcia','Rafael',24,'H',2],['Jones','Stephen',31,'H',2],['Cassella','Christopher',32,'H',1],['Matthis','Michael',31,'H',1],['Swiatek','Evan',30,'H',0],['Powell','Noah',27,'C',0],['Doubrava','Dillon',24,'C',0],['Tucker','Harrison',23,'C',0],['Khan','Farhan',29,'C',-1]],
  'Raleigh-Durham United':[['Laberteaux','Bailey',30,'C',0]],
  'Montréal Mephisto':[['Dubé','Antoine',29,'C',6],['Sauvé','Victor',25,'C',6],['Brissette','Jakob',24,'H',5],['Duplaix','Thomas',25,'H',4],['Le Marois','Nathanaël',25,'H',4],['Bernat','Julien',25,'H',3],['St-Pierre','William',25,'C',3],['Bevan','Geoff',24,'H',3],['Breton','Isaac',24,'D',3],['Lemieux','Vincent',24,'H',1],['Brichet','Melvyn',27,'H',1],['Lalonde-Landry','Thomas',23,'H',1],['Giard','Jérémie',30,'C',0],['Salvas','Raphael',23,'H',0],['Cohonner','Ywan',32,'H',0],['Roy','Alexis',28,'C',-1],['Baril','Jonathan',30,'C',-1],['Monfette','Gabriel',30,'C',-1]]
};
// giocatori internazionali del mercato (STARS, 06-mercato-internazionali.js) che giocano anche per questi club: nelle carriere USA stanno nel club e non
// compaiono piu' sul mercato. La chiave e' «cognome|nome» come in STARS.
const US_STAR_CLUB={
  'Juengst|Anders':'New York PoNY',
  'Jagt|Ben':'New York PoNY',
  'Wariner|Cameron':'New York PoNY',
  'Kocher|Chris':'New York PoNY',
  'Mickle|Jimmy':'New York PoNY',
  'Randolph|John':'New York PoNY',
  'Brownlee|Marques':'New York PoNY',
  'Heyman|Scott':'New York PoNY',
  'Babbitt|Jeff':'Boston DiG',
  'Janas|Pawel':'Boston DiG',
  'Bonnaud|Quentin':'Boston DiG',
  'Edmonds|Thomas':'Boston DiG',
  'Decraene|Tobe':'Boston DiG',
  'Atkins|Alex':'Philadelphia Pacmen',
  'Davis|Antoine':'Philadelphia Pacmen',
  'Barzasi|David':'Philadelphia Pacmen',
  'Little|Nate':'Philadelphia Pacmen',
  'Grossberg|Sam':'Philadelphia Pacmen',
  'Merriman|AJ':'Washington DC Truck Stop',
  'Boxley|Christian':'Washington DC Truck Stop',
  'Jurek|Cole':'Washington DC Truck Stop',
  'Bonnet|Elliot':'Washington DC Truck Stop',
  'Mott|Sean':'Washington DC Truck Stop',
  'Rees|Adam':'San Francisco Revolver',
  'Hulsmeyer|Brett':'San Francisco Revolver',
  'Lankford|Carter':'San Francisco Revolver',
  'Ritthaler|Daniel':'San Francisco Revolver',
  'Kerns|Elijah':'San Francisco Revolver',
  'Gordon|Leo':'San Francisco Revolver',
  'Hecht|Malcolm':'San Francisco Revolver',
  'Ing|Michael':'San Francisco Revolver',
  'Frankenberg|Walker':'San Francisco Revolver',
  'Freechild|Dylan':'Portland Rhino Slam!',
  'Hayes|Raphy':'Portland Rhino Slam!',
  'Froude|Jay':'Denver Johnny Bravo',
  'Nethercutt|Jonathan':'Denver Johnny Bravo',
  'Kerr|Jordan':'Denver Johnny Bravo',
  'Finer|Quinn':'Denver Johnny Bravo',
  'Martin|Garrett':'Seattle Sockeye',
  'Coolman|Noah':'Seattle Sockeye',
  'Dillon|Trent':'Seattle Sockeye',
  'Holland|Troy':'Seattle Sockeye',
  'De Marrée|Daan':'Chicago Machine',
  'Goff|Nate':'Chicago Machine',
  'Wettengel|William':'Chicago Machine',
  'Payne|Xavier':'Chicago Machine',
  'Larson|Gordon':'Minneapolis Sub Zero',
  'Hanson|Noah':'Minneapolis Sub Zero',
  'Krenik|Paul':'Minneapolis Sub Zero',
  'Fisher|Henry':'Raleigh Ring of Fire',
  'Gouchoe-Hanas|Matt':'Raleigh Ring of Fire',
  'Yanuck|Solomon':'Raleigh Ring of Fire',
  'Miller|Adam':'Atlanta Chain Lightning',
  'McClamrock|Lukas':'Atlanta Chain Lightning',
  'Randall|Tyler':'Atlanta Chain Lightning',
  'Selfridge|Will':'Atlanta Chain Lightning',
  'Henke|Mark':'Austin Doublewide',
  'Laviolette|Allan':'Raleigh-Durham United',
  'Guay|Charles':'Montréal Mephisto',
  'Tremblay-Joncas|Christophe':'Montréal Mephisto'
};
const usStarKey=r=>r[0]+'|'+r[1];
const usStarTaken=r=>isUS()&&!!US_STAR_CLUB[usStarKey(r)];   // usato dal mercato (buildMarket)
const US_FN=['Alex','Andrew','Ben','Brian','Cameron','Chris','Colin','Connor','Dan','David','Drew','Eli','Ethan','Evan','Gabe','Greg','Henry','Isaac','Jack','Jake','James','Jason','Jeff','Joe','John','Jon','Josh','Justin','Kevin','Kyle','Liam','Luke','Marcus','Mark','Matt','Max','Mike','Nate','Nick','Noah','Owen','Pat','Peter','Ryan','Sam','Sean','Seth','Tim','Tom','Tyler','Will','Zach'];
const US_LN=['Adams','Allen','Baker','Barnes','Bell','Bennett','Brooks','Brown','Bryant','Butler','Campbell','Carter','Clark','Coleman','Collins','Cook','Cooper','Cox','Cruz','Davis','Diaz','Edwards','Evans','Fisher','Foster','Gray','Green','Griffin','Hall','Harris','Hayes','Henderson','Hill','Howard','Hughes','Jackson','James','Jenkins','Johnson','Jones','Kelly','King','Lee','Lewis','Long','Martin','Miller','Mitchell','Moore','Morgan','Morris','Murphy','Nelson','Parker','Patterson','Perry','Powell','Price','Reed','Richardson','Rivera','Roberts','Robinson','Rogers','Ross','Russell','Sanders','Scott','Simmons','Smith','Stewart','Sullivan','Taylor','Thomas','Thompson','Turner','Walker','Ward','Washington','Watson','White','Williams','Wilson','Wood','Wright','Young'];
// una scheda da ruolo e Overall (le statistiche seguono utStats, lo stesso profilo delle carte): cap = massimo raggiungibile, un po' sopra la statistica piu' alta
function usCard(sur,nm,age,role,ovr0,rng,extra){
  const st=utStats(role,ovr0,rng),top=Math.max(...KEYS.map(k=>st[k])),cap=clamp(top+(age<=24?8:(age<=29?4:2))+Math.floor(rng()*4),60,99),full=sur+' '+nm+(extra&&extra.gen?' '+String.fromCharCode(65+hashStr(sur+nm)%26)+(hashStr(sur+nm+'x')%90+10):''),rr=role==='H'?'H':'C';
  return Object.assign({n:sur,label:nm+' '+sur,full,sur,r:rr,age,tl:cap,tf:cap,tv:cap,s:st,gen:false,f:false,trait:traitFor(full,st,rr),dev:age<=24?1.2:1,sk:0,cond:100,car:null,pos:role==='D'?'D':undefined},extra||{});
}
// ---- Fantasy Ultimate (00-fantasy.js): Overall e ruolo dal rendimento ai Nationals 2026 ----
// i nomi si confrontano senza accenti, maiuscole e ordine (le fonti scrivono «Tim Schoch» o «Schoch, Timothy» in modi diversi)
const usNameKey=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z ]/g,' ').split(/\s+/).filter(Boolean).sort().join(' ');
let usFFmap=null;   // club -> {chiave nome: voce}, costruita alla prima lettura
function usFFof(club,sur,nm){
  if(!usFFmap){usFFmap={};for(const t in US_FF){const c=US_NAMES.find(n=>n.endsWith(t));if(!c)continue;usFFmap[c]={};for(const f of US_FF[t])usFFmap[c][usNameKey(f[0])]=f;}}
  const m=usFFmap[club];return m?m[usNameKey(nm+' '+sur)]||null:null;
}
// valore 0..1,3: 70% rendimento (punti a partita, radice per non far dominare i pochi fuoriclasse) e 30% costo (la stima di prima del torneo). Il costo
// e' anche un pavimento (80%): chi ha un costo alto e ha reso poco ai Nationals e' di solito una stella con un torneo storto, non un giocatore mediocre.
function usFFval(f){
  const pg=f[3]/Math.max(1,f[2]),perf=pg>0?Math.sqrt(pg/15):pg/20,cost=Math.min(1.3,Math.sqrt(Math.max(0,f[1]-3)/19));
  return Math.max(0.7*Math.min(1.25,perf)+0.3*cost,0.8*cost);
}
// Overall assoluto (uguale per tutti i club, non relativo al club): un fuoriclasse in una squadra scarsa resta un fuoriclasse. Le stelle del mercato hanno
// anche la fama del loro Overall di mercato (m), che fa da pavimento (-3) quando il torneo e' andato male.
// Il premio All-UFA 2026 (US_UFA_AWARD, 1-3) da' un altro pavimento: chi e' tra i migliori della lega non e' un giocatore mediocre nemmeno se ai Nationals ha reso poco.
const usAward=(sur,nm)=>US_UFA_AWARD[usNameKey(nm+' '+sur)]|0;
const usFFabs=(f,m,aw)=>{const a=62+30*usFFval(f);return clamp(Math.max(a,m?m-3:0,[0,92,89,82][aw|0]),40,98);};
// eta' nel 2026: esatta se e' nelle schede UFA, altrimenti il limite delle convocazioni giovanili quando la stima lo supera, altrimenti la stima. Ritorna [eta', esatta?]
function usAgeOf(sur,nm,def){
  const k=usNameKey(nm+' '+sur),h=US_AGE_HI[k];
  if(US_AGE[k])return [US_AGE[k],true];
  return h&&def>h?[h-1,false]:[def,false];
}
// ruolo dai punteggi per ruolo: si cambia solo se uno e' nettamente avanti e il campione non e' minuscolo
function usFFrole(f){
  const a=[['C',f[4]],['H',f[5]],['D',f[6]]].sort((x,y)=>y[1]-x[1]);
  return a[0][1]>=10&&a[0][1]>=1.4*a[1][1]?a[0][0]:null;
}
// cognome e nome da «nome cognome»: il cognome parte da una particella (van, de, di...) oppure e' l'ultima parola
function usFFsplit(full){
  const w=full.split(' '),i=w.findIndex((x,k)=>k>0&&/^(van|von|de|del|della|da|di|le|la|st)$/i.test(x)),k=i>0?i:w.length-1;
  return [w.slice(k).join(' '),w.slice(0,k).join(' ')];
}
// chi e' nei dati Fantasy del club ma non tra i giocatori che abbiamo gia' (stelle del mercato o US_CORE)
function usFFextra(club){
  const t=Object.keys(US_FF).find(x=>club.endsWith(x));if(!t)return[];
  const have=new Set([...STARS.filter(r=>US_STAR_CLUB[usStarKey(r)]===club),...(US_CORE[club]||[])].map(r=>usNameKey(r[1]+' '+r[0])));
  return US_FF[t].filter(f=>!have.has(usNameKey(f[0]))).map(f=>{const [sur,nm]=usFFsplit(f[0]);return {f,sur,nm};});
}
// quanto i migliori 7 di un club (Overall assoluto dei dati Fantasy) stanno sopra o sotto il suo rating, meno la media di tutti i club con dati: positivo = piu'
// talento di quanto dica il rating. Serve a dare a un club con campioni un po' piu' di forza e a uno con pochi un po' meno.
let usFFdev=null;
function usFFskew(club){
  if(!usFFdev){
    usFFdev={};let sum=0,n=0;
    for(const c of US_NAMES){
      const ab=[...STARS.filter(r=>US_STAR_CLUB[usStarKey(r)]===c).map(r=>{const f=usFFof(c,r[0],r[1]);return f&&usFFabs(f,r[4],usAward(r[0],r[1]));}),
        ...(US_CORE[c]||[]).map(r=>{const f=usFFof(c,r[0],r[1]);return f&&usFFabs(f,0,usAward(r[0],r[1]));}),...usFFextra(c).map(x=>usFFabs(x.f,0,usAward(x.sur,x.nm)))].filter(a=>a).sort((a,b)=>b-a);
      if(ab.length>=7){usFFdev[c]=ab.slice(0,7).reduce((x,y)=>x+y,0)/7-US_TEAM[c].power;sum+=usFFdev[c];n++;}
    }
    for(const c in usFFdev)usFFdev[c]-=sum/n;
  }
  return usFFdev[club]||0;
}
// la rosa di un club: giocatori internazionali del mercato che ci giocano, giocatori veri e riempimento generato, poi si sposta il livello di tutti tranne le stelle
// finche' la media dei 7 migliori e' quella del club (power). opt.low: la rosa che parte tua, un po' meno allenata; opt.n: giocatori in rosa
function usRoster(club,seedStr,opt){
  opt=opt||{};const P=opt.low?US_TEAM[club].power*0.9+5.5:US_TEAM[club].power,rg=mulberry32(hashStr(seedStr+'|usr|'+club));
  const specs=[];
  // le stelle del mercato che hanno i dati Fantasy (k:'sf') prendono livello e ruolo dal rendimento come gli altri, ma restano loro (tratto, aspetto, eta');
  // le altre (k:'s') tengono l'Overall del mercato
  for(const r of STARS)if(US_STAR_CLUB[usStarKey(r)]===club){const f=usFFof(club,r[0],r[1]);specs.push(f?{k:'sf',row:r,ab:usFFabs(f,r[4],usAward(r[0],r[1])),role:usFFrole(f)}:{k:'s',row:r});}
  // giocatori veri: dove ci sono i dati Fantasy contano quelli (livello assoluto e ruolo), altrimenti il bonus di US_CORE rispetto al club
  const real=[];
  (US_CORE[club]||[]).forEach(r=>{const f=usFFof(club,r[0],r[1]),ro=f&&usFFrole(f);const ag=usAgeOf(r[0],r[1],r[2]);real.push({k:'r',row:[r[0],r[1],ag[0],ro||r[3],r[4]],ex:ag[1],ab:f?usFFabs(f,0,usAward(r[0],r[1])):null,base:-1+(r[4]|0)});});
  usFFextra(club).forEach(x=>{const ag=usAgeOf(x.sur,x.nm,22+hashStr(x.f[0])%12);real.push({k:'r',row:[x.sur,x.nm,ag[0],usFFrole(x.f)||'C',0],ex:ag[1],ab:usFFabs(x.f,0,usAward(x.sur,x.nm)),base:0});});
  // una rosa ha al massimo 20 giocatori: le stelle restano sempre, poi i veri migliori
  const key=s=>s.ab!=null?s.ab:P+s.base;
  real.sort((a,b)=>key(b)-key(a)).slice(0,Math.max(0,20-specs.length)).forEach(s=>specs.push(s));
  const N=Math.min(20,Math.max(opt.n||16,specs.length));
  const used=new Set(specs.map(s=>s.row[0]+s.row[1]));
  for(let i=0;specs.length<N;i++){   // riempimento: nomi americani, ruoli bilanciati (almeno 6 handler), livello decrescente
    let sur,nm;do{sur=US_LN[Math.floor(rg()*US_LN.length)];nm=US_FN[Math.floor(rg()*US_FN.length)];}while(used.has(sur+nm));used.add(sur+nm);
    const h=specs.filter(s=>s.row[3]==='H').length,role=h<6?'H':(rg()<0.2?'D':'C');
    specs.push({k:'g',row:[sur,nm,19+Math.floor(rg()*13),role],base:-2-i*1.3-rg()*3});
  }
  // obiettivo del club: la sua forza (power) spostata di meta' verso il talento vero dei suoi migliori 7 (al massimo 4 punti, vedi usFFskew): una squadra
  // con campioni e' un po' piu' forte del suo rating, una con pochi un po' piu' debole. Il resto della differenza resta nel rating.
  const T=P+clamp(0.5*usFFskew(club),-4,4);
  const lv=(s,off)=>clamp(s.ab!=null?s.ab+off:P+s.base+off,36,95);
  let off=0,out=[];
  for(let it=0;it<7;it++){
    out=specs.map((s,j)=>{
      const [sur,nm,age,role]=s.row,rng=mulberry32(hashStr(seedStr+'|'+club+'|'+sur+nm));
      if(s.k==='s'||s.k==='sf'){const row=s.k==='sf'?s.row.slice():s.row;if(s.k==='sf'){row[3]=s.role||row[3];row[4]=Math.round(lv(s,off));}const o=starPlayer(row,rng);if(US_AGE[usNameKey(o.label)])o.ae=undefined;o.nat=club;o.n=o.sur;return o;}   // in partita si legge il cognome
      return usCard(sur,nm,age,role,lv(s,off),rng,s.k==='g'?{gen:true}:(s.ex?{}:{ae:1}));
    });
    const d=T-rosterPower(out);if(Math.abs(d)<0.35)break;off=clamp(off+d,-34,16);
  }
  const cnt={};for(const o of out)cnt[o.n]=(cnt[o.n]||0)+1;
  for(const o of out)if(cnt[o.n]>1)o.n=o.sur+' '+(o.label||'?')[0]+'.';   // due compagni con lo stesso cognome: si aggiunge l'iniziale
  return out;
}

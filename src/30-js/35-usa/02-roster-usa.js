/* ===================== USA MEN'S CLUB: ROSTER =====================
   Giocatori veri: i nomi sono quelli identificati nelle fonti pubbliche della stagione 2026 (anteprime Ultiworld dei Regionals e dei Nationals, classifiche USAU),
   ricevuti in una tabella. Non sono i roster ufficiali completi: 9 club non hanno nomi verificati e gli altri ne hanno solo alcuni. Dove manca, la rosa e' completata
   con giocatori generati (gen:true, nomi americani), tarati sulla forza del club. Eta' e ruolo dei giocatori di US_CORE sono stime (compaiono con «circa»);
   il quinto numero e' un bonus di livello per chi e' tra i leader dei Nationals 2026 (mete, assist o difese).
   US_CORE = giocatori veri non presenti tra i «giocatori internazionali» del mercato: [cognome, nome, eta', ruolo H|C|D, bonus]. */
const US_CORE={
  'New York PoNY':[['Dameron','Ben',27,'H',0],['Miller','Declan',25,'C',0],['Labar','Matt',25,'H',0],['Little','Sam',30,'H',0],['Alladi','Shashank',23,'C',0]],
  'Boston DiG':[['Yuan','Albert',29,'H',0],['Stoughton','Calvin',26,'H',0],['Decraene','Lander',25,'H',0],['Cable','Orion',24,'C',0],['Graff','Oscar',25,'C',0],['Boerth','Peter',27,'C',0],['Carapella','Simon',27,'C',0]],
  'Philadelphia Pacmen':[['Beidler-Shenk','Ezra',23,'C',0],['Piercy','Logan',31,'D',4],['Tran','Max',31,'C',0],['Erdman','Owen',28,'C',0]],
  'Washington DC Truck Stop':[['Fall','Alexandre',31,'C',0],['Nissen','Jacques',25,'C',0],['Betrancourt','Louis',24,'C',0],['Bontemps','Sofiene',26,'H',0]],
  'Portland Red Tide':[['Kelley','Stewart',25,'H',0]],
  'Amherst Sprout':[['Stang-Osborne','Jonah',26,'C',0]],
  'San Francisco Revolver':[['Nelson','Alex',28,'C',0],['Orme','Anton',30,'C',0],['Vallee','Jason',31,'C',0],['Prior','Nathan',27,'H',0],['Adkins','Raekwon',31,'H',0],['Vickers-Batzdorf','Robin',29,'H',0],['Higgins','Simon',28,'C',0]],
  'Portland Rhino Slam!':[['Hall-Witt','Alex',30,'C',0],['Bosworth','Callahan',27,'C',0],['Boyd-Fliegel','Chander',26,'C',0],['Lee','Daniel',28,'H',0],['Sealand','David',31,'C',0],['Ing','Henry',31,'H',0],['Glass','Mica',29,'H',4]],
  'Denver Johnny Bravo':[['Tatum','Alex',30,'H',0],['Bechis','Dennison',24,'C',0],['Min-Fink','Nanda',24,'H',0],['Kalmus','Tucker',23,'C',0]],
  'Seattle Sockeye':[['Bayer','Carter',32,'C',4],['Hines','Cedar',28,'H',0],['Chen','DY',32,'C',0],['Diamond','Elijah',25,'C',0],['Stone','Mason',25,'H',0],['Shigley','Ryan',32,'C',0],['Fuzat','Xavier',25,'C',0],['Ishikawa-Szabo','Zoli',29,'H',0]],
  'Eugene Dark Star':[['Thoennes','Ben',25,'C',0],['Casper','Eli',27,'C',0],['Impas','Orlando',28,'H',0]],
  'SoCal Condors':[['Koo','KJ',24,'C',0],['Combs','Max',32,'C',0],['Gibson','Max',31,'C',0]],
  'Bay Area Wavestorms':[['Shargel','Bodie',26,'H',0],['Warren','Toby',24,'H',0]],
  'Chicago Machine':[['Bartlett','Aaron',32,'C',0],['Hawkins','Elliot',31,'C',0],['Bansfield','Johnny',26,'H',0],['Smith','Rutledge',29,'H',0],['Schoch','Tim',27,'H',0],['Thoreson','Zeke',28,'C',0]],
  'Minneapolis Sub Zero':[['Lacy','Cam',26,'C',0],['Davis','Micah',28,'C',0],['De Morgan','Nathan',31,'H',4],['Mans','Peter',25,'H',0],['Morton','Zach',23,'C',4]],
  'Madison Mad Men':[['Carne','Arthur',27,'C',0],['Sjostrom','Eric',27,'C',0],['Ranhabat','Nico',23,'C',0]],
  'Chicago Haymaker':[['Cercello','Joe',25,'C',0]],
  'Toronto GOAT':[['Sehgal','Araav',28,'C',0],['McHale','Connor',30,'C',0],['Ancelin','Gaël',24,'C',0],['Lewis','James',27,'C',0],['Podnar','Justin',29,'C',0],['Comire','Luc',32,'C',0],['Gallant','Marty',27,'C',0],['Pettenuzzo','Max',26,'C',0],['MacKenzie','Mike',27,'C',0],['Stonehouse','Oscar',29,'H',0],['Turner','Phil',25,'H',0]],
  'Vancouver Furious George':[['O’Donnell','Kai',31,'C',0],['Underhill','Kevin',28,'C',0],['Bryson','Malcolm',31,'H',0],['Auger-Semmar','Malik',25,'C',0],['Hibbert','Morgon',31,'H',0],['Debroux','Neo',26,'C',0],['Lebbell','Nyle',31,'C',0],['Snider','Quinn',27,'H',0],['Yuen','Rex',24,'H',0],['Ramirez Ortiz','Simon',24,'C',0],['Tsang','Tim',32,'C',0],['Vasiliyev','Toly',29,'C',0]],
  'Raleigh Ring of Fire':[['Morrison','Brayden',24,'H',0],['Belus','Christian',24,'C',0],['Fried','Eli',25,'C',0],['Lessard','Henri',28,'H',0],['McDonnell','John',30,'H',0],['Singleton','Josh',27,'H',0],['Williams','Justin-Cooper',29,'D',4],['Searles-Bohs','Liam',23,'H',0],['Barcellos','Matthew',24,'H',0],['Stout','Owen',24,'C',0],['Brooks','Tobias',24,'C',0]],
  'Atlanta Chain Lightning':[['Richman','Grady',30,'C',0],['Austin-Knab','Hayden',26,'C',0],['Evans','Jason',28,'D',4],['Poe','Michael',27,'C',0],['Spiva','Nicky',29,'C',0],['McCall','Stefan',32,'C',4]],
  'Austin Doublewide':[['Armour','Matthew',26,'H',0]],
  'Raleigh-Durham United':[['Laberteaux','Bailey',30,'C',0]]
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
  'Heyman|Scott':'New York PoNY',
  'Babbitt|Jeff':'Boston DiG',
  'Janas|Pawel':'Boston DiG',
  'Bonnaud|Quentin':'Boston DiG',
  'Edmonds|Thomas':'Boston DiG',
  'Decraene|Tobe':'Boston DiG',
  'Atkins|Alex':'Philadelphia Pacmen',
  'Grossberg|Sam':'Philadelphia Pacmen',
  'Merriman|AJ':'Washington DC Truck Stop',
  'Boxley|Christian':'Washington DC Truck Stop',
  'Bonnet|Elliot':'Washington DC Truck Stop',
  'Rees|Adam':'San Francisco Revolver',
  'Hulsmeyer|Brett':'San Francisco Revolver',
  'Ritthaler|Daniel':'San Francisco Revolver',
  'Kerns|Elijah':'San Francisco Revolver',
  'Gordon|Leo':'San Francisco Revolver',
  'Hecht|Malcolm':'San Francisco Revolver',
  'Ing|Michael':'San Francisco Revolver',
  'Frankenberg|Walker':'San Francisco Revolver',
  'Ambrose|Lukas':'Portland Rhino Slam!',
  'Hayes|Raphy':'Portland Rhino Slam!',
  'Nethercutt|Jonathan':'Denver Johnny Bravo',
  'Kerr|Jordan':'Denver Johnny Bravo',
  'Finer|Quinn':'Denver Johnny Bravo',
  'Martin|Garrett':'Seattle Sockeye',
  'Dillon|Trent':'Seattle Sockeye',
  'De Marrée|Daan':'Chicago Machine',
  'Goff|Nate':'Chicago Machine',
  'Wettengel|William':'Chicago Machine',
  'Larson|Gordon':'Minneapolis Sub Zero',
  'Hanson|Noah':'Minneapolis Sub Zero',
  'Krenik|Paul':'Minneapolis Sub Zero',
  'Brandt|Will':'Minneapolis Sub Zero',
  'Gouchoe-Hanas|Matt':'Raleigh Ring of Fire',
  'Yanuck|Solomon':'Raleigh Ring of Fire',
  'Miller|Adam':'Atlanta Chain Lightning',
  'Selfridge|Will':'Atlanta Chain Lightning',
  'Henke|Mark':'Austin Doublewide',
  'Laviolette|Allan':'Raleigh-Durham United'
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
// la rosa di un club: giocatori internazionali del mercato che ci giocano, giocatori veri e riempimento generato, poi si sposta il livello di tutti tranne le stelle
// finche' la media dei 7 migliori e' quella del club (power). opt.low: la rosa che parte tua, un po' meno allenata; opt.n: giocatori in rosa
const specs0=club=>STARS.filter(r=>US_STAR_CLUB[usStarKey(r)]===club).length+(US_CORE[club]||[]).length;
function usRoster(club,seedStr,opt){
  opt=opt||{};const P=opt.low?US_TEAM[club].power*0.9+5.5:US_TEAM[club].power,nReal=specs0(club),N=Math.min(22,Math.max(opt.n||16,nReal+2)),rg=mulberry32(hashStr(seedStr+'|usr|'+club));
  const specs=[];
  for(const r of STARS)if(US_STAR_CLUB[usStarKey(r)]===club)specs.push({k:'s',row:r});
  (US_CORE[club]||[]).forEach(r=>specs.push({k:'r',row:r,base:-1+(r[4]|0)}));
  const used=new Set(specs.map(s=>s.row[0]+s.row[1]));
  for(let i=0;specs.length<N;i++){   // riempimento: nomi americani, ruoli bilanciati (almeno 6 handler), livello decrescente
    let sur,nm;do{sur=US_LN[Math.floor(rg()*US_LN.length)];nm=US_FN[Math.floor(rg()*US_FN.length)];}while(used.has(sur+nm));used.add(sur+nm);
    const h=specs.filter(s=>s.row[3]==='H').length,role=h<6?'H':(rg()<0.2?'D':'C');
    specs.push({k:'g',row:[sur,nm,19+Math.floor(rg()*13),role],base:-2-i*1.3-rg()*3});
  }
  let off=0,out=[];
  for(let it=0;it<7;it++){
    out=specs.map((s,j)=>{
      const [sur,nm,age,role]=s.row,rng=mulberry32(hashStr(seedStr+'|'+club+'|'+sur+nm));
      if(s.k==='s'){const o=starPlayer(s.row,rng);o.nat=club;o.n=o.sur;return o;}   // in partita si legge il cognome
      return usCard(sur,nm,age,role,clamp(P+s.base+off,36,93),rng,s.k==='g'?{gen:true}:{ae:1});
    });
    const d=P-rosterPower(out);if(Math.abs(d)<0.35)break;off=clamp(off+d,-34,16);
  }
  const cnt={};for(const o of out)cnt[o.n]=(cnt[o.n]||0)+1;
  for(const o of out)if(cnt[o.n]>1)o.n=o.sur+' '+(o.label||'?')[0]+'.';   // due compagni con lo stesso cognome: si aggiunge l'iniziale
  return out;
}

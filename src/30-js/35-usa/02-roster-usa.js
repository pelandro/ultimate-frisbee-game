/* ===================== USA MEN'S CLUB: ROSTER =====================
   Giocatori veri: nome, eta' e ruolo. Le fonti pubbliche (annunci dei roster 2024-2025 di Ultiworld e classifiche USAU/Ultiworld) non danno una lista
   completa e aggiornata per tutti i 32 club: dove manca, la rosa e' completata con giocatori generati (gen:true, nomi americani), tarati sulla forza del club.
   Le eta' dei giocatori di US_CORE sono stime (compaiono con «circa»); i ruoli sono stimati dal gioco. Per aggiornare un club basta modificare la sua riga.
   US_CORE = giocatori veri non presenti tra i «giocatori internazionali» del mercato: [cognome, nome, eta', ruolo H|C|D], dal migliore al meno forte. */
const US_CORE={
  'San Francisco Revolver':[['Orme','Anton',27,'C'],['Liu','Byron',26,'H'],['Chuck','Colby',27,'C'],['Lew','Kyle',29,'H']],
  'Raleigh Ring of Fire':[['Li','Andrew',27,'C'],['McKelvey','Andrew',28,'H'],['Davis','Alex',27,'C'],['Dameron','Ben',26,'H'],['Snell','Ben',28,'C']],
  'Chicago Machine':[['White','Joe',29,'H'],['Arters','Paul',30,'C'],['Luo','Vic',25,'H']],
  'Portland Rhino Slam!':[['Hall-Witt','Alex',26,'C'],['Massey','Max',27,'H'],['Stuart','Nick',26,'C'],['Kaplan','Aaron',28,'H'],['McNichols','Adam',27,'C'],['Boyd-Fliegel','Chander',27,'H'],['Hancock','Kyle',27,'C']],
  'Seattle Sockeye':[['Dixon','Brice',27,'H'],['Hines','Cedar',26,'C'],['Beidler','Marcus',26,'H'],['Lantz','Asher',25,'C'],['Foster','Christian',27,'C'],['Zhou','David',25,'H']],
  'Denver Johnny Bravo':[['Olson','Connor',29,'C'],['Marshall','Kai',27,'H']],
  'Atlanta Chain Lightning':[['Downey','Aidan',27,'C'],['Thai','Andrew',26,'H'],['Taylor','Kenni',28,'H']],
  'Minneapolis Sub Zero':[['Lomen','Aiden',26,'C'],['King','Austin',28,'H'],['Krapfl','Blake',27,'C'],['Macho','Brandon',27,'H']]
};
// giocatori internazionali del mercato (STARS, 06-mercato-internazionali.js) che giocano anche per questi club: nelle carriere USA stanno nel club e non
// compaiono piu' sul mercato. La chiave e' «cognome|nome» come in STARS.
const US_STAR_CLUB={
  'Juengst|Anders':'Raleigh Ring of Fire','Gouchoe-Hanas|Matt':'Raleigh Ring of Fire','Yanuck|Solomon':'Raleigh Ring of Fire','Laviolette|Allan':'Raleigh Ring of Fire',
  'Boxley|Christian':'Washington DC Truck Stop','Malks|Jonny':'Washington DC Truck Stop','Holland|Troy':'Washington DC Truck Stop','Merriman|AJ':'Washington DC Truck Stop',
  'Nethercutt|Jonathan':'Denver Johnny Bravo','Kerr|Jordan':'Denver Johnny Bravo','Dillon|Trent':'Seattle Sockeye',
  'Ing|Michael':'San Francisco Revolver','Kerns|Elijah':'San Francisco Revolver','Rees|Adam':'San Francisco Revolver','Ritthaler|Daniel':'San Francisco Revolver','Magsig|Evan':'San Francisco Revolver',
  'Mieser|Jibran':'New York PoNY','Wariner|Cameron':'New York PoNY','Kocher|Chris':'New York PoNY',
  'De Marrée|Daan':'Chicago Machine','Goff|Nate':'Chicago Machine','Gibson|Kurt':'Chicago Machine','Wettengel|William':'Chicago Machine','Payne|Xavier':'Chicago Machine',
  'Hecht|Malcolm':'Boston DiG','Decraene|Tobe':'Boston DiG','Hayes|Raphy':'Portland Rhino Slam!','Ambrose|Lukas':'Portland Rhino Slam!',
  'Hulsmeyer|Brett':'Atlanta Chain Lightning','Miller|Adam':'Atlanta Chain Lightning','Taylor|Austin':'Atlanta Chain Lightning','McClamrock|Lukas':'Atlanta Chain Lightning','Randall|Tyler':'Atlanta Chain Lightning'
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
function usRoster(club,seedStr,opt){
  opt=opt||{};const P=opt.low?US_TEAM[club].power*0.9+5.5:US_TEAM[club].power,N=opt.n||16,rg=mulberry32(hashStr(seedStr+'|usr|'+club));
  const specs=[];
  for(const r of STARS)if(US_STAR_CLUB[usStarKey(r)]===club)specs.push({k:'s',row:r});
  (US_CORE[club]||[]).forEach((r,i)=>specs.push({k:'r',row:r,base:4-i*1.4}));
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
      return usCard(sur,nm,age,role,clamp(P+s.base+off,36,97),rng,s.k==='g'?{gen:true}:{ae:1});
    });
    const d=P-rosterPower(out);if(Math.abs(d)<0.35)break;off=clamp(off+d,-34,16);
  }
  const cnt={};for(const o of out)cnt[o.n]=(cnt[o.n]||0)+1;
  for(const o of out)if(cnt[o.n]>1)o.n=o.sur+' '+(o.label||'?')[0]+'.';   // due compagni con lo stesso cognome: si aggiunge l'iniziale
  return out;
}

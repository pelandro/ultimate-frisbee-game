/* ---- GIOCATORI INTERNAZIONALI VERI: sul mercato compaiono giocatori dell'ultimate mondiale. Fonti: squadre All-UFA, All-Defense e All-Rookie 2024 e 2025
   e statistiche ufficiali della lega (ruolo: handler se prevalgono assist e passaggi, cutter se prevalgono le mete, defender se gioca quasi solo in linea di difesa),
   nazionale USA ai Mondiali 2024, protagonisti dei club europei (Mooncatchers, Wall City, Clapham, Bad Skid, GRUT), piu' alcuni nomi storici.
   Non sono tutti fuoriclasse: il livello segue i riconoscimenti ricevuti. [cognome, nome, eta' nel 2026, ruolo, Overall, squadra, tratto, 1 = eta' verificata]
   Le eta' senza l'1 finale sono stime (nel gioco compaiono con «circa»).
   La squadra (campo 6) non e' mai una squadra UFA: e' il club dei Nationals USA o europeo dove il giocatore gioca nel gioco (US_STAR_CLUB, LN_STAR_CLUB), altrimenti il suo paese (e' svincolato). ---- */
const STARS=[
  ['De Marrée','Daan',25,'C',96,'Chicago Machine','sky',1],['Decraene','Tobe',23,'C',95,'Boston DiG','explosive',1],['Babbitt','Jeff',32,'D',93,'Boston DiG','sky'],
  ['Laviolette','Allan',35,'H',91,'Raleigh-Durham United','general'],['Frankenberg','Walker',24,'C',90,'San Francisco Revolver','deep'],['Randolph','John',25,'C',89,'New York PoNY',null],
  ['Taylor','Austin',32,'H',89,'USA','break'],['Jagt','Ben',33,'C',89,'New York PoNY','deep'],['Williams','Jack',31,'H',88,'USA','break'],
  ['Mickle','Jimmy',35,'H',88,'New York PoNY','general'],['Gutowsky','Anthony',27,'C',88,'USA','deep'],['Dunn','Travis',35,'H',88,'USA','general'],
  ['Johnson-Go','Tannor',29,'D',88,'USA','sky'],['Schlör','Conrad',27,'C',88,'Wall City','sky'],['Kerr','Jordan',30,'H',87,'Denver Johnny Bravo','break'],
  ['Yorgason','Chad',27,'H',87,'USA',null],['Hulsmeyer','Brett',31,'C',87,'San Francisco Revolver','lock'],['Abeltins','Toms',27,'C',86,'Mooncatchers','lock'],
  ['Osgar','Ryan',32,'H',86,'USA',null],['Freechild','Dylan',34,'H',86,'Portland Rhino Slam!','break'],['Miller','Adam',27,'H',86,'Atlanta Chain Lightning',null],
  ['Martin','Garrett',26,'C',86,'Seattle Sockeye','hands'],['Juengst','Anders',28,'C',86,'New York PoNY','explosive'],['Ambrose','Lukas',25,'D',86,'USA','lock'],
  ['Bonnaud','Quentin',30,'C',85,'Boston DiG','deep'],['Coolman','Noah',25,'D',85,'Seattle Sockeye','lock'],['Brandt','Will',26,'H',85,'USA',null],
  ['Henke','Mark',27,'C',85,'Austin Doublewide','sky'],['Magsig','Evan',28,'H',85,'USA','general'],['Rees','Adam',27,'C',85,'San Francisco Revolver','explosive'],
  ['Yorgason','McKay',25,'H',84,'USA',null],['Davis','Antoine',33,'D',84,'Philadelphia Pacmen','lock'],['El-Salaam','Khalif',32,'C',84,'USA','sky'],
  ['Burnett','Justin',31,'D',84,'USA','lock'],['Fairfax','Jacob',29,'C',84,'USA','deep'],['Finer','Quinn',28,'C',84,'Denver Johnny Bravo',null],
  ['McDonnell','Rowan',37,'H',84,'USA','general'],['Nethercutt','Jonathan',34,'H',84,'Denver Johnny Bravo','break'],['Herkens','Paul',27,'D',84,'Wall City','lock'],
  ['Foord','Justin',35,'C',84,'Clapham Ultimate','deep'],['Felton','Jake',28,'H',83,'USA','general'],['Henke','Kyle',29,'C',83,'USA',null],
  ['McClamrock','Lukas',29,'D',83,'Atlanta Chain Lightning','lock'],['Atkins','Alex',27,'D',83,'Philadelphia Pacmen',null],['Jurek','Cole',28,'C',83,'Washington DC Truck Stop','hands'],
  ['Vohnoutka','Bryan',33,'C',83,'USA',null],['Gouchoe-Hanas','Matt',28,'H',83,'Raleigh Ring of Fire',null],['Boxley','Christian',29,'C',83,'Washington DC Truck Stop','explosive'],
  ['Barzasi','David',26,'C',83,'Philadelphia Pacmen',null],['Abrams','Tom',32,'H',83,'Clapham Ultimate',null],['Müller','Nico',31,'C',83,'Bad Skid',null],
  ['Poitte-Sokolsky','Sacha',30,'C',83,'Tchac','sky'],['Lindsley','Grant',37,'C',82,'USA','hands'],['Blasman','Tom',24,'H',82,'Paesi Bassi',null],
  ['Heyman','Scott',27,'H',82,'New York PoNY',null],['Krenik','Paul',27,'C',82,'Minneapolis Sub Zero',null],['Larson','Gordon',27,'H',82,'Minneapolis Sub Zero',null],
  ['Mott','Sean',30,'H',82,'Washington DC Truck Stop','break'],['Selfridge','Will',26,'C',82,'Atlanta Chain Lightning',null],['Tremblay-Joncas','Christophe',29,'H',82,'Montréal Mephisto',null],
  ['Hanson','Noah',26,'D',82,'Minneapolis Sub Zero','lock'],['Fisher','Henry',26,'D',82,'Raleigh Ring of Fire','sky'],['Wilson Holliday','Alec',27,'C',82,'USA','deep'],
  ['Sadok','Ben',31,'H',82,'USA','general'],['Yanuck','Solomon',28,'H',82,'Raleigh Ring of Fire',null],['Hecht','Malcolm',29,'H',82,'San Francisco Revolver',null],
  ['Hayes','Raphy',30,'C',82,'Portland Rhino Slam!','deep'],['Malks','Jonny',28,'H',82,'USA',null],['Merriman','AJ',25,'D',82,'Washington DC Truck Stop','explosive'],
  ['Mueller','Mathieu',26,'C',82,'Mooncatchers','hands'],['Yeo','Ashley',33,'H',82,'Clapham Ultimate',null],['Beuttenmüller','Holger',34,'H',82,'Bad Skid',null],
  ['Orlovskis','Arvīds',31,'H',82,'Lettonia',null],['Wettengel','William',26,'D',81,'Chicago Machine',null],['Payne','Xavier',27,'D',81,'Chicago Machine',null],
  ['Lyle','Jonathan',24,'H',81,'USA',null],['Edmonds','Thomas',30,'C',81,'Boston DiG',null],['Dillon','Trent',34,'D',81,'Seattle Sockeye','lock'],
  ['Rýdlo','Ondřej',26,'C',81,'Repubblica Ceca',null],['Champoux','Nathan',28,'D',80,'USA',null],['Goff','Nate',30,'D',80,'Chicago Machine',null],
  ['Holland','Troy',29,'D',80,'Seattle Sockeye',null],['Ing','Michael',27,'C',80,'San Francisco Revolver',null],['Kerns','Elijah',27,'D',80,'San Francisco Revolver',null],
  ['Mieser','Jibran',26,'D',80,'USA',null],['Wariner','Cameron',29,'D',80,'New York PoNY',null],['Kocher','Chris',37,'C',80,'New York PoNY',null],
  ['Janas','Pawel',32,'H',80,'Boston DiG','break'],['Guay','Charles',27,'D',80,'Montréal Mephisto',null],['Little','Nate',28,'D',80,'Philadelphia Pacmen',null],
  ['Marks','Luke',26,'D',80,'USA',null],['Ritthaler','Daniel',28,'D',80,'San Francisco Revolver',null],['Gordon','Leo',23,'H',80,'San Francisco Revolver',null],
  ['Karklins','Arvids',24,'H',80,'Mooncatchers',null],['McDougall','Sean',30,'C',80,'USA','sky'],['Langdon','Jeremy',31,'C',80,'USA',null],
  ['Bonnet','Elliot',23,'C',80,'Washington DC Truck Stop','explosive'],['Derks','Jelte',22,'C',79,'Paesi Bassi',null],['Lankford','Carter',23,'D',79,'San Francisco Revolver',null],
  ['Randall','Tyler',28,'D',79,'Atlanta Chain Lightning',null],['Grossberg','Sam',23,'C',79,'Philadelphia Pacmen',null],['Sheppard','Max',31,'C',79,'USA',null],
  ['Froude','Jay',34,'C',78,'Denver Johnny Bravo','explosive'],['Gibson','Kurt',41,'H',76,'USA',  'general'],['Kittredge','Beau',44,'C',76,'USA','deep',1],
  ['Smith','Brodie',39,'H',74,'USA','break'],['Brownlee','Marques',33,'D',72,'New York PoNY','hands',1],
  // giocatori senza squadra nel gioco (premiati UFA 2024-2025 che non giocano in nessun club dei Nationals): compaiono solo sul mercato
  ['Matis','Brandon',34,'C',80,'USA',null,1],
  ['Knoche','Sterling',33,'D',80,'USA','lock',1],
  ['McCarthy','Mitchell',31,'D',79,'USA',null,1],
  ['Lacy','Cameron',23,'D',78,'USA',null,1],
  ['Rubin-Miller','Jake',27,'D',79,'USA',null,1],
  ['Wellers','John',24,'D',78,'USA',null],
  ['Dean','Jasper',24,'C',78,'USA',null],
  ['Robert','Pieran',24,'C',77,'USA',null],
  ['Vordick','Gabe',24,'C',79,'USA','deep'],
  ['Wolf','Aaron',24,'H',82,'Germania',null],
  ['Chan','Tyler',26,'D',77,'USA',null],
  ['Fitzpatrick','Langley',23,'D',79,'USA',null],
  ['Mounga','Tony',27,'D',76,'USA',null],
  ['Pew','Sam',23,'D',77,'USA',null],
  ['Pollard','James',30,'D',76,'USA',null,1],
  ['Ramsey','Dean',31,'D',76,'USA',null,1],
  ['Turner','Phil',31,'D',77,'Nord America',null,1],
  ['Van de Moortele','Tristan',31,'C',78,'USA',null,1],
  ['Weinberg','Kyle',27,'D',76,'USA',null],
  ['Armstrong','Carson',20,'C',78,'USA',null],
  ['Belfield','Conor',23,'C',77,'USA',null],
  ['Wildavsky','Saul',23,'C',78,'USA',null],
  ['Wisner','Jack',25,'C',75,'USA',null,1]
];
function starPlayer(r,rng){   // scheda del giocatore vero: statistiche dal ruolo e dall'Overall, eta' vera piu' le stagioni di carriera gia' passate
  const [sur,nm,age1,role,ov,from,trait]=r,age0=usAgeOf(sur,nm,age1)[0],st=utStats(role,ov,rng),rr=role==='H'?'H':'C',full=sur+' '+nm,age=age0+Math.max(0,(SV.season|0)-1);
  const top=Math.max(...KEYS.map(k=>st[k])),cap=clamp(top+(age0<=25?7:(age0<=29?3:1)),60,99);
  const o={n:nm,label:nm+' '+sur,full,sur,r:rr,age:age0,tl:cap,tf:cap,tv:cap,s:st,gen:false,star:true,f:false,trait,dev:age0<=25?1.3:1,sk:2,cond:100,car:null,nat:from,pos:role==='D'?'D':undefined,ae:r[7]?undefined:1};
  for(let y=age0;y<age;y++)agePlayer(o,rng);   // gli anni passano anche per loro
  return o;
}
const MARKET_N=15;   // giocatori sul mercato
function buildMarket(){
  // 15 giocatori in tutto, di livello vicino al tuo: giovani (4, fino a 6 col vivaio), 3 in vendita da altre squadre, da 1 a 3 internazionali veri (di piu' con
  // reputazione), il resto svincolati. Prima i fuoriclasse erano 5-6 su 20 e poi 2-3 su 15, a ogni livello e con potenziali molto alti: ora i campioni sono rari
  // (le stelle solo se alla portata del tuo livello, i giovani di talento sono pochi, gli svincolati adulti hanno poco margine, chi e' in vendita e' di un club del tuo livello).
  const lv=squadPower(),sd=SV.seed+'|mk|'+SV.season+'|'+(SV.mkN=(SV.mkN||0)+1),R=mulberry32(hashStr(sd)),out=[],viv=SV.fac.viv|0,nY=4+Math.min(viv,2),nSale=3,nStar=1+(SV.rep>=40?1:0)+(SV.rep>=70&&R()<0.4?1:0),nFree=MARKET_N-nY-nSale-nStar;
  for(let i=0;i<nY;i++){const o=genPlayer(lv-11+R()*7+viv,16+Math.floor(R()*4),sd+'y'+i,lv+3+Math.pow(R(),2)*20+viv*2);out.push({o,kind:'Giovane promessa',from:null});}   // pochi giovani di vero talento
  for(let i=0;i<nFree;i++){const l0=lv-5+R()*9,o=genPlayer(l0,23+Math.floor(R()*11),sd+'f'+i,l0+1+R()*8);out.push({o,kind:'Svincolato',from:null});}   // un adulto ha poco margine
  const teams=Object.keys(SV.rost).filter(n=>SV.rost[n]&&SV.rost[n].length>14&&teamPow(n)>=lv-14&&teamPow(n)<=lv+12);   // club del tuo livello, non i migliori della lega
  for(let i=0;i<nSale&&teams.length;i++){
    const n=teams[Math.floor(R()*teams.length)],ro=SV.rost[n].slice().sort((a,b)=>ovrX(b)-ovrX(a)),o=ro[4+Math.floor(R()*Math.max(1,ro.length-4))];
    if(o&&ovrX(o)<=lv+9&&!out.some(m=>m.o===o)){if(o.sk===undefined)o.sk=0;out.push({o,kind:'In vendita',from:n});}
  }
  // internazionali veri: mai gli stessi, chi e' gia' in rosa non ricompare; si scelgono tra quelli piu' vicini al livello a cui puoi aspirare (il tuo piu' 5)
  const have=new Set(SQ.map(p=>p.full)),pool=STARS.filter(r=>!have.has(r[0]+' '+r[1])&&!usStarTaken(r)&&!lnStarTaken(r)&&r[4]<=lv+10+(SV.rep>=60?3:0)&&r[2]+Math.max(0,(SV.season|0)-1)<=starLimit(r)).sort((a,b)=>Math.abs(a[4]-(lv+5))-Math.abs(b[4]-(lv+5))).slice(0,14);
  for(let i=0;i<nStar&&pool.length;i++){
    const r=pool.splice(Math.floor(R()*pool.length),1)[0],o=starPlayer(r,mulberry32(hashStr(SV.seed+'|star|'+r[0]+r[1])));
    out.push({o,kind:ovr(o)>=86?'Stella internazionale':'Giocatore internazionale',from:null,nat:r[5],star:true});
  }
  for(let i=0;out.length<MARKET_N;i++){const o=genPlayer(lv-5+R()*9,23+Math.floor(R()*11),sd+'x'+i);out.push({o,kind:'Svincolato',from:null});}   // se una squadra non ha dato il suo giocatore, si completa con uno svincolato
  for(const m of out){m.price=Math.round(priceOf(m.o)*(m.from?1.3:(m.star?1.15:1)));m.base=m.price;motAssign(m,R);}
  SV.market=out;mkReprice();   // motivazioni e prezzi che ne dipendono (18-motivazioni.js)
}
function canSign(m){return SV.cash<0?'Crediti insufficienti':SQ.length>=SQ_MAX?'Rosa al completo ('+SQ_MAX+')':(SV.cash<m.price?'Crediti insufficienti':(ovr(m.o)>repCap()?'Non interessato: serve più reputazione':motBlock(m)));}
function signPlayer(i){
  const m=SV.market[i];if(!m||canSign(m))return false;
  SV.cash-=m.price;SV.market.splice(i,1);
  if(m.from&&SV.rost[m.from]){const ro=SV.rost[m.from],k=ro.findIndex(x=>x===m.o||(x.full&&x.full===m.o.full));if(k>=0)ro.splice(k,1);if(ro.length<14)ro.push(genPlayer(rosterPower(ro)-8,17+Math.floor(Math.random()*4),SV.seed+'|rep|'+m.from+'|'+SV.season+'|'+ro.length));}
  const o=Object.assign({},m.o,{sk:Math.max(1,m.o.sk|0),cond:100,car:null,s:Object.assign({},m.o.s)});
  const list=squadData();list.push(o);const lO=SV.lineO,lD=SV.lineD;setSquad(list);SV.lineO=lO;SV.lineD=lD;fixLines();
  SV.chem=Math.max(0,SV.chem-(4-2*fitOf(o)));news('Acquistato '+o.label+' ('+POS_NAME[posOf(o)]+', '+ovr(o)+') per '+m.price+' crediti'+(m.from?' da '+m.from:'')+'.');
  return true;
}
// chi lascia la squadra (ceduto o ritirato) resta nelle classifiche di sempre del club
function keepFormer(p){const c=p.car;if(!c||!c.mp)return;SV.former.push({name:(p.label||p.name)+(p.nick?' «'+p.nick+'»':''),mp:c.mp,g:c.g,a:c.a,b:c.b,aw:(p.aw||[]).length});if(SV.former.length>80)SV.former.sort((a,b)=>(b.g+b.a+b.b)-(a.g+a.a+a.b)).length=80;}
function sellPlayer(id){
  const p=SQ[id];if(!p||SQ.length<=SQ_MIN)return false;
  keepFormer(p);
  const v=sellValue(p);SV.cash+=v;
  const list=squadData();list.splice(id,1);setSquad(list);fixLines();SV.chem=Math.max(0,SV.chem-2);
  news('Ceduto '+(p.label||p.name)+' per '+v+' crediti.');return true;
}
const SCOUT_COST=6;
function scoutPlayer(x){if(!x||(x.sk|0)>=3||SV.cash<scoutCost())return false;SV.cash-=scoutCost();x.sk=(x.sk|0)+1;return true;}

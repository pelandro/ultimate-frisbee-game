/* ---- GIOCATORI INTERNAZIONALI VERI: sul mercato compaiono giocatori dell'ultimate mondiale. Fonti: squadre All-UFA, All-Defense e All-Rookie 2024 e 2025
   e statistiche ufficiali della lega (ruolo: handler se prevalgono assist e passaggi, cutter se prevalgono le mete, defender se gioca quasi solo in linea di difesa),
   nazionale USA ai Mondiali 2024, protagonisti dei club europei (Mooncatchers, Wall City, Clapham, Bad Skid, GRUT), piu' alcuni nomi storici.
   Non sono tutti fuoriclasse: il livello segue i riconoscimenti ricevuti. [cognome, nome, eta' nel 2026, ruolo, Overall, squadra, tratto, 1 = eta' verificata]
   Le eta' senza l'1 finale sono stime, salvo riscontro nelle tabelle di verifica.
   La squadra (campo 6) non e' mai una squadra UFA: e' il club dei Nationals USA o europeo dove il giocatore gioca nel gioco (US_STAR_CLUB, LN_STAR_CLUB), altrimenti il suo paese (e' svincolato). ---- */
const STARS=[
  ['De Marrée','Daan',25,'C',97,'Mooncatchers','sky',1],['Decraene','Tobe',23,'C',93,'Boston DiG','explosive',1],['Babbitt','Jeff',32,'D',92,'Boston DiG','sky'],
  ['Laviolette','Allan',35,'H',91,'Raleigh-Durham United','general'],['Frankenberg','Walker',24,'C',90,'San Francisco Revolver','deep'],['Randolph','John',25,'C',90,'New York PoNY',null],
  ['Taylor','Austin',32,'H',90,'USA','break'],['Jagt','Ben',33,'C',90,'New York PoNY','deep'],['Williams','Jack',31,'H',89,'USA','break'],
  ['Mickle','Jimmy',35,'H',89,'New York PoNY','general'],['Gutowsky','Anthony',27,'C',89,'USA','deep'],['Dunn','Travis',35,'H',89,'USA','general'],
  ['Johnson-Go','Tannor',29,'D',89,'USA','sky'],['Schlör','Conrad',27,'C',89,'Wall City','sky'],['Kerr','Jordan',30,'H',88,'Denver Johnny Bravo','break'],
  ['Yorgason','Chad',27,'H',88,'USA',null],['Hulsmeyer','Brett',31,'C',88,'San Francisco Revolver','lock'],['Abeltins','Toms',27,'C',87,'Mooncatchers','lock'],
  ['Osgar','Ryan',32,'H',87,'USA',null],['Freechild','Dylan',34,'H',87,'Portland Rhino Slam!','break'],['Miller','Adam',27,'H',87,'Atlanta Chain Lightning',null],
  ['Martin','Garrett',26,'C',87,'Seattle Sockeye','hands'],['Juengst','Anders',28,'C',87,'New York PoNY','explosive'],['Ambrose','Lukas',25,'D',87,'USA','lock'],
  ['Bonnaud','Quentin',30,'C',86,'Boston DiG','deep'],['Coolman','Noah',25,'D',86,'Seattle Sockeye','lock'],['Brandt','Will',26,'H',86,'USA',null],
  ['Henke','Mark',27,'C',86,'Austin Doublewide','sky'],['Magsig','Evan',28,'H',86,'USA','general'],['Rees','Adam',27,'C',86,'San Francisco Revolver','explosive'],
  ['Yorgason','McKay',25,'H',86,'USA',null],['Davis','Antoine',33,'D',86,'Philadelphia Pacmen','lock'],['El-Salaam','Khalif',32,'C',86,'USA','sky'],
  ['Burnett','Justin',31,'D',86,'USA','lock'],['Fairfax','Jacob',29,'C',86,'USA','deep'],['Finer','Quinn',28,'C',86,'Denver Johnny Bravo',null],
  ['McDonnell','Rowan',37,'H',86,'USA','general'],['Nethercutt','Jonathan',34,'H',86,'Denver Johnny Bravo','break'],['Herkens','Paul',27,'D',86,'Wall City','lock'],
  ['Foord','Justin',35,'C',86,'Clapham Ultimate','deep'],['Felton','Jake',28,'H',85,'USA','general'],['Henke','Kyle',29,'C',85,'USA',null],
  ['McClamrock','Lukas',29,'D',85,'Atlanta Chain Lightning','lock'],['Atkins','Alex',27,'D',85,'Philadelphia Pacmen',null],['Jurek','Cole',28,'C',85,'Washington DC Truck Stop','hands'],
  ['Vohnoutka','Bryan',33,'C',85,'USA',null],['Gouchoe-Hanas','Matt',28,'H',85,'Raleigh Ring of Fire',null],['Boxley','Christian',29,'C',85,'Washington DC Truck Stop','explosive'],
  ['Barzasi','David',26,'C',85,'Mooncatchers',null],['Abrams','Tom',32,'H',85,'Clapham Ultimate',null],['Müller','Nico',31,'C',85,'Bad Skid',null],
  ['Poitte-Sokolsky','Sacha',30,'C',85,'Tchac','sky'],['Lindsley','Grant',37,'C',84,'USA','hands'],['Blasman','Tom',24,'H',84,'Paesi Bassi',null],
  ['Heyman','Scott',27,'H',84,'New York PoNY',null],['Krenik','Paul',27,'C',84,'Minneapolis Sub Zero',null],['Larson','Gordon',27,'H',84,'Minneapolis Sub Zero',null],
  ['Mott','Sean',30,'H',84,'Washington DC Truck Stop','break'],['Selfridge','Will',26,'C',84,'Atlanta Chain Lightning',null],['Tremblay-Joncas','Christophe',29,'H',84,'Montréal Mephisto',null],
  ['Hanson','Noah',26,'D',84,'Minneapolis Sub Zero','lock'],['Fisher','Henry',26,'D',84,'Raleigh Ring of Fire','sky'],['Wilson Holliday','Alec',27,'C',84,'USA','deep'],
  ['Sadok','Ben',31,'H',84,'USA','general'],['Yanuck','Solomon',28,'H',84,'Raleigh Ring of Fire',null],['Hecht','Malcolm',29,'H',84,'San Francisco Revolver',null],
  ['Hayes','Raphy',30,'C',84,'Portland Rhino Slam!','deep'],['Malks','Jonny',28,'H',84,'USA',null],['Merriman','AJ',25,'D',84,'Washington DC Truck Stop','explosive'],
  ['Mueller','Mathieu',26,'C',84,'Mooncatchers','hands'],['Yeo','Ashley',33,'H',84,'Clapham Ultimate',null],['Beuttenmüller','Holger',34,'H',84,'Bad Skid',null],
  ['Orlovskis','Arvīds',31,'H',84,'Lettonia',null],['Wettengel','William',26,'D',83,'Chicago Machine',null],['Payne','Xavier',27,'D',83,'Chicago Machine',null],
  ['Lyle','Jonathan',24,'H',83,'USA',null],['Edmonds','Thomas',30,'C',83,'Mooncatchers',null],['Dillon','Trent',34,'D',83,'Seattle Sockeye','lock'],
  ['Rýdlo','Ondřej',26,'C',83,'Wall City',null],['Champoux','Nathan',28,'D',82,'USA',null],['Goff','Nate',30,'D',82,'Chicago Machine',null],
  ['Holland','Troy',29,'D',82,'Seattle Sockeye',null],['Ing','Michael',27,'C',82,'San Francisco Revolver',null],['Kerns','Elijah',27,'D',82,'San Francisco Revolver',null],
  ['Mieser','Jibran',26,'D',82,'USA',null],['Wariner','Cameron',29,'D',82,'New York PoNY',null],['Kocher','Chris',37,'C',82,'New York PoNY',null],
  ['Janas','Pawel',32,'H',82,'Boston DiG','break'],['Guay','Charles',27,'D',82,'Montréal Mephisto',null],['Little','Nate',28,'D',82,'Philadelphia Pacmen',null],
  ['Marks','Luke',26,'D',82,'USA',null],['Ritthaler','Daniel',28,'D',82,'San Francisco Revolver',null],['Gordon','Leo',23,'H',82,'San Francisco Revolver',null],
  ['Karklins','Arvids',24,'H',82,'Mooncatchers',null],['McDougall','Sean',30,'C',82,'USA','sky'],['Langdon','Jeremy',31,'C',82,'USA',null],
  ['Bonnet','Elliot',23,'C',82,'Tchac','explosive'],['Derks','Jelte',22,'C',81,'Paesi Bassi',null],['Lankford','Carter',23,'D',81,'San Francisco Revolver',null],
  ['Randall','Tyler',28,'D',81,'Atlanta Chain Lightning',null],['Grossberg','Sam',23,'C',81,'Philadelphia Pacmen',null],['Sheppard','Max',31,'C',81,'USA',null],
  ['Froude','Jay',34,'C',80,'Denver Johnny Bravo','explosive'],['Brownlee','Marques',33,'D',74,'New York PoNY','hands',1],
  // giocatori senza squadra nel gioco (premiati UFA 2024-2025 che non giocano in nessun club dei Nationals): compaiono solo sul mercato
  ['Matis','Brandon',34,'C',82,'USA',null,1],
  ['Knoche','Sterling',33,'D',82,'USA','lock',1],
  ['McCarthy','Mitchell',31,'D',81,'USA',null,1],
  ['Lacy','Cameron',23,'D',80,'USA',null,1],
  ['Rubin-Miller','Jake',27,'D',81,'USA',null,1],
  ['Wellers','John',24,'D',80,'USA',null],
  ['Dean','Jasper',24,'C',80,'USA',null],
  ['Robert','Pieran',24,'C',79,'USA',null],
  ['Vordick','Gabe',24,'C',81,'USA','deep'],
  ['Wolf','Aaron',24,'H',84,'Germania',null],
  ['Chan','Tyler',26,'D',79,'USA',null],
  ['Fitzpatrick','Langley',23,'D',81,'USA',null],
  ['Pew','Sam',23,'D',79,'USA',null],
  ['Turner','Phil',31,'D',79,'Nord America',null,1],
  ['Van de Moortele','Tristan',31,'C',80,'USA',null,1],
  ['Armstrong','Carson',20,'C',80,'USA',null],
  ['Belfield','Conor',23,'C',79,'USA',null],
  ['Wildavsky','Saul',23,'C',80,'USA',null]
  // Tobias Brooks (Carolina Flyers in UFA, Raleigh Ring of Fire nei club): 21 anni a gennaio 2026, tra i migliori lanciatori e ricevitori della lega (watchufa.com)
  ,['Brooks','Tobias',22,'H',90,'Raleigh Ring of Fire','general']
];
function starPlayer(r,rng){   // scheda del giocatore vero: statistiche dal ruolo e dall'Overall, eta' vera piu' le stagioni di carriera gia' passate
  const [sur,nm,age1,role,ov,from,trait]=r,[age0,exact]=usAgeOf(sur,nm,age1,!!r[7]),st=utStats(role,ov,rng),rr=role==='H'?'H':'C',full=sur+' '+nm,age=age0+Math.max(0,(SV.season|0)-1);
  const top=Math.max(...KEYS.map(k=>st[k])),cap=clamp(top+(age0<=25?7:(age0<=29?3:1)),60,99);
  const o={n:nm,label:nm+' '+sur,full,sur,r:rr,age:age0,tl:cap,tf:cap,tv:cap,s:st,gen:false,star:true,f:false,trait,dev:age0<=25?1.3:1,sk:2,cond:100,car:null,nat:from,pos:role==='D'?'D':undefined,ae:exact?undefined:1};
  for(let y=age0;y<age;y++)agePlayer(o,rng);   // gli anni passano anche per loro
  return o;
}
const MARKET_N=15;   // giocatori sul mercato
function buildMarket(){
  // 15 giocatori veri (33-mercato-veri.js), di livello vicino al tuo: giovani promesse dei club del tuo campionato (4, fino a 6 col vivaio), 3 in vendita
  // da club alla tua portata, circa 3 dall'estero (stelle di STARS e giocatori dei club stranieri: di piu' con la reputazione), fino a 3 svincolati veri,
  // il resto dalle altre squadre del tuo campionato attorno al livello degli adulti. I campioni restano rari: le stelle solo se alla portata del tuo livello.
  const lv=squadLevel(),sd=SV.seed+'|mk|'+SV.season+'|'+(SV.mkN=(SV.mkN||0)+1),R=mulberry32(hashStr(sd)),out=[],viv=SV.fac.viv|0,nY=4+Math.min(viv,2),nSale=3,
    women=lnWomenNow(),nAb=women?0:3+(SV.rep>=70&&R()<0.4?1:0),nStar=women?0:Math.min(nAb,1+(SV.rep>=40?1:0)),nFree=3;
  const ry=potRef('mkt'),la=potRef('adult'),pool=mkClubPool(),add=(x,kind)=>{if(x.o.sk===undefined)x.o.sk=0;out.push({o:x.o,kind,from:x.n});};
  // giovani: i ragazzi delle rose attorno al livello dei giovani della tua serie (il loro potenziale e' quello che hanno)
  for(let i=0;i<nY;i++){const x=mkTakeR(pool,ry-8+R()*5+viv,R,y=>y.o.age<=MK_YOUNG,9);if(x)add(x,'Giovane promessa');}
  // in vendita: club alla tua portata, giocatori fino a 9 punti sopra il tuo livello
  for(let i=0;i<nSale;i++){const x=mkTakeR(pool,lv-4+R()*12,R,y=>y.o.age>MK_YOUNG&&y.v<=lv+9,8);if(x)add(x,'In vendita');}
  // internazionali: le stelle vere (niente giocatori troppo anziani, oltre i 37 anni, o troppo deboli, sotto 78; chi e' gia' in rosa non ricompare;
  // si scelgono tra le piu' vicine al livello a cui puoi aspirare, il tuo piu' 5), poi giocatori dei club stranieri
  const have=mkMine(),ab=new Set(SV.abroad||[]),spool=STARS.filter(r=>!have.has(r[0]+' '+r[1])&&!ab.has(r[0]+' '+r[1])&&!usStarTaken(r)&&!lnStarTaken(r)&&r[4]<=lv+10+(SV.rep>=60?3:0)&&r[4]>=78&&usAgeOf(r[0],r[1],r[2])[0]+Math.max(0,(SV.season|0)-1)<=Math.min(37,starLimit(r))).sort((a,b)=>Math.abs(a[4]-(lv+5))-Math.abs(b[4]-(lv+5))).slice(0,14);
  for(let i=0;i<nStar&&spool.length;i++){
    const r=spool.splice(Math.floor(R()*spool.length),1)[0],o=starPlayer(r,mulberry32(hashStr(SV.seed+'|star|'+r[0]+r[1])));
    out.push({o,kind:ovr(o)>=86?'Stella internazionale':'Giocatore internazionale',from:null,nat:r[5],star:true});
  }
  const seen=new Set(out.map(m=>m.o.full));
  while(out.filter(m=>m.star||m.fc).length<nAb){const x=mkAbroad(la-3+R()*9,R,seen);if(!x)break;seen.add(x.o.full);out.push({o:x.o,kind:'Giocatore internazionale',from:null,fc:x.club,nat:x.club+' · '+lgName(clubLega(x.club)).replace(/^campionato /,'')});}
  // svincolati veri: chi le squadre hanno lasciato libero, attorno al livello degli adulti
  const fa=(SV.fa||[]).filter(o=>!have.has(o.full)).map(o=>({o,n:null,v:ovrX(o)}));
  for(let i=0;i<nFree;i++){const x=mkTakeR(fa,la-5+R()*9,R,null,6);if(!x)break;if(x.o.sk===undefined)x.o.sk=0;out.push({o:x.o,kind:'Svincolato',from:null,fa:true});}
  // il resto dalle squadre del tuo campionato, attorno al livello degli adulti (se non basta, da tutte le rose)
  for(let i=0;out.length<MARKET_N&&i<MARKET_N*3;i++){const x=mkTakeR(pool,la-5+R()*9,R,y=>y.o.age>MK_YOUNG,i<MARKET_N?8:40);if(x)add(x,'In vendita');}
  for(const m of out){m.price=Math.round(priceOf(m.o)*(m.from?MK_PRICE.club:(m.star||m.fc?MK_PRICE.est:MK_PRICE.fa)));m.base=m.price;motAssign(m,R);}
  SV.market=out;mkReprice();   // motivazioni e prezzi che ne dipendono (18-motivazioni.js)
}
function canSign(m){return SV.cash<0?'Crediti insufficienti':SQ.length>=SQ_MAX?'Rosa al completo ('+SQ_MAX+')':(SV.cash<m.price?'Crediti insufficienti':(ovr(m.o)>repCap()?'Non interessato: serve più reputazione':motBlock(m)));}
function signPlayer(i){
  const m=SV.market[i];if(!m||canSign(m))return false;
  SV.cash-=m.price;SV.market.splice(i,1);
  if(m.fa&&SV.fa){const k=SV.fa.findIndex(x=>x===m.o||x.full===m.o.full);if(k>=0)SV.fa.splice(k,1);}   // svincolato: non e' piu' libero
  if(m.star||m.fc)abroadAdd(m.o);   // dall'estero: non gioca piu' nel suo club straniero (33-mercato-veri.js)
  if(m.from&&SV.rost[m.from]){const ro=SV.rost[m.from],k=ro.findIndex(x=>x===m.o||(x.full&&x.full===m.o.full));if(k>=0)ro.splice(k,1);if(ro.length<14){const lv0=rosterPower(ro);ro.push(genPlayer(lv0-8,17+Math.floor(Math.random()*4),SV.seed+'|rep|'+m.from+'|'+SV.season+'|'+ro.length,potB(potDraw('mkt',lv0,Math.random,0).p)));}}
  const o=Object.assign({},m.o,{sk:Math.max(1,m.o.sk|0),cond:100,car:null,s:Object.assign({},m.o.s)});
  const list=squadData();list.push(o);const lO=SV.lineO,lD=SV.lineD;setSquad(list);SV.lineO=lO;SV.lineD=lD;fixLines();
  SV.chem=Math.max(0,SV.chem-(4-2*fitOf(o)));news('Acquistato '+o.label+' ('+POS_NAME[posOf(o)]+', '+ovr(o)+') per '+m.price+' crediti'+(m.from?' da '+m.from:(m.fc?' da '+m.fc:''))+'.');
  return true;
}
// chi lascia la squadra (ceduto o ritirato) resta nelle classifiche di sempre del club
function keepFormer(p){const c=p.car;if(!c||!c.mp)return;SV.former.push({name:(p.label||p.name)+(p.nick?' «'+p.nick+'»':''),mp:c.mp,g:c.g,a:c.a,b:c.b,aw:(p.aw||[]).length});if(SV.former.length>80)SV.former.sort((a,b)=>(b.g+b.a+b.b)-(a.g+a.a+a.b)).length=80;}
function sellPlayer(id){
  const p=SQ[id];if(!p||SQ.length<=SQ_MIN)return false;
  keepFormer(p);
  const v=sellValue(p);SV.cash+=v;SV.sellN=(SV.sellN|0)+1;
  const list=squadData();list.splice(id,1);setSquad(list);fixLines();SV.chem=Math.max(0,SV.chem-2);
  news('Ceduto '+(p.label||p.name)+' per '+v+' crediti.');return true;
}
const SCOUT_COST=4;   // parte fissa del costo di un'osservazione (scoutCost, 11-carriera-dinamica.js)
function scoutPlayer(x){if(!x||(x.sk|0)>=3||SV.cash<scoutCost(x))return false;SV.cash-=scoutCost(x);x.sk=(x.sk|0)+1;return true;}

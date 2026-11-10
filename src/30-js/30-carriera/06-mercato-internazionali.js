/* ---- GIOCATORI INTERNAZIONALI VERI: sul mercato compaiono giocatori dell'ultimate mondiale. Fonti: squadre All-UFA, All-Defense e All-Rookie 2024 e 2025
   e statistiche ufficiali della lega (ruolo: handler se prevalgono assist e passaggi, cutter se prevalgono le mete, defender se gioca quasi solo in linea di difesa),
   nazionale USA ai Mondiali 2024, protagonisti dei club europei (Mooncatchers, Wall City, Clapham, Bad Skid, GRUT), piu' alcuni nomi storici.
   Non sono tutti fuoriclasse: il livello segue i riconoscimenti ricevuti. [cognome, nome, eta' nel 2026, ruolo, Overall, squadra, tratto, 1 = eta' verificata]
   Le eta' senza l'1 finale sono stime (nel gioco compaiono con «circa»). ---- */
const STARS=[
  ['De Marrée','Daan',25,'C',96,'New York Empire','sky',1],['Decraene','Tobe',23,'C',95,'Boston Glory','explosive',1],['Babbitt','Jeff',32,'D',93,'Boston Glory','sky'],
  ['Laviolette','Allan',35,'H',91,'Carolina Flyers','general'],['Frankenberg','Walker',24,'C',90,'Oakland Spiders','deep'],['Randolph','John',25,'C',89,'New York Empire',null],
  ['Taylor','Austin',32,'H',89,'Atlanta Hustle','break'],['Jagt','Ben',33,'C',89,'New York Empire','deep'],['Williams','Jack',31,'H',88,'New York Empire','break'],
  ['Mickle','Jimmy',35,'H',88,'USA','general'],['Gutowsky','Anthony',27,'C',88,'Madison Radicals','deep'],['Dunn','Travis',35,'H',88,'San Diego Growlers','general'],
  ['Johnson-Go','Tannor',29,'D',88,'Boston Glory','sky'],['Schlör','Conrad',27,'C',88,'Wall City','sky'],['Kerr','Jordan',30,'H',87,'Salt Lake Shred','break'],
  ['Yorgason','Chad',27,'H',87,'Salt Lake Shred',null],['Hulsmeyer','Brett',31,'C',87,'Atlanta Hustle','lock'],['Abeltins','Toms',27,'C',86,'Mooncatchers','lock'],
  ['Osgar','Ryan',32,'H',86,'USA',null],['Freechild','Dylan',34,'H',86,'USA','break'],['Miller','Adam',27,'H',86,'Atlanta Hustle',null],
  ['Martin','Garrett',26,'C',86,'Seattle Cascades','hands'],['Juengst','Anders',28,'C',86,'Raleigh Ring of Fire','explosive'],['Ambrose','Lukas',25,'D',86,'Seattle Cascades','lock'],
  ['Bonnaud','Quentin',30,'C',85,'Montreal Royal','deep'],['Coolman','Noah',25,'D',85,'Colorado Summit','lock'],['Brandt','Will',26,'H',85,'Minnesota Wind Chill',null],
  ['Henke','Mark',27,'C',85,'Austin Sol','sky'],['Magsig','Evan',28,'H',85,'Oakland Spiders','general'],['Rees','Adam',27,'C',85,'Oakland Spiders','explosive'],
  ['Yorgason','McKay',25,'H',84,'Salt Lake Shred',null],['Davis','Antoine',33,'D',84,'New York Empire','lock'],['El-Salaam','Khalif',32,'C',84,'San Diego Growlers','sky'],
  ['Burnett','Justin',31,'D',84,'Minnesota Wind Chill','lock'],['Fairfax','Jacob',29,'C',84,'Carolina Flyers','deep'],['Finer','Quinn',28,'C',84,'Colorado Summit',null],
  ['McDonnell','Rowan',37,'H',84,'DC Breeze','general'],['Nethercutt','Jonathan',34,'H',84,'Denver Johnny Bravo','break'],['Herkens','Paul',27,'D',84,'Wall City','lock'],
  ['Foord','Justin',35,'C',84,'Clapham','deep'],['Felton','Jake',28,'H',83,'Detroit Mechanix','general'],['Henke','Kyle',29,'C',83,'Austin Sol',null],
  ['McClamrock','Lukas',29,'D',83,'Atlanta Hustle','lock'],['Atkins','Alex',27,'D',83,'Colorado Summit',null],['Jurek','Cole',28,'C',83,'DC Breeze','hands'],
  ['Vohnoutka','Bryan',33,'C',83,'Minnesota Wind Chill',null],['Gouchoe-Hanas','Matt',28,'H',83,'Raleigh Ring of Fire',null],['Boxley','Christian',29,'C',83,'Washington Truck Stop','explosive'],
  ['Barzasi','David',26,'C',83,'Mooncatchers',null],['Abrams','Tom',32,'H',83,'Clapham',null],['Müller','Nico',31,'C',83,'Bad Skid',null],
  ['Poitte-Sokolsky','Sacha',30,'C',83,'Francia','sky'],['Lindsley','Grant',37,'C',82,'USA','hands'],['Blasman','Tom',24,'H',82,'Toronto Rush',null],
  ['Heyman','Scott',27,'H',82,'Philadelphia Phoenix',null],['Krenik','Paul',27,'C',82,'Minnesota Wind Chill',null],['Larson','Gordon',27,'H',82,'Minnesota Wind Chill',null],
  ['Mott','Sean',30,'H',82,'Philadelphia Phoenix','break'],['Selfridge','Will',26,'C',82,'Salt Lake Shred',null],['Tremblay-Joncas','Christophe',29,'H',82,'Montreal Royal',null],
  ['Hanson','Noah',26,'D',82,'Minnesota Wind Chill','lock'],['Fisher','Henry',26,'D',82,'Carolina Flyers','sky'],['Wilson Holliday','Alec',27,'C',82,'Dallas Legion','deep'],
  ['Sadok','Ben',31,'H',82,'Boston Glory','general'],['Yanuck','Solomon',28,'H',82,'Raleigh Ring of Fire',null],['Hecht','Malcolm',29,'H',82,'Boston DiG',null],
  ['Hayes','Raphy',30,'C',82,'Salem Rhino Slam','deep'],['Malks','Jonny',28,'H',82,'Washington Truck Stop',null],['Merriman','AJ',25,'D',82,'Washington Truck Stop','explosive'],
  ['Mueller','Mathieu',26,'C',82,'Mooncatchers','hands'],['Yeo','Ashley',33,'H',82,'Clapham',null],['Beuttenmüller','Holger',34,'H',82,'Bad Skid',null],
  ['Orlovskis','Arvīds',31,'H',82,'Lettonia',null],['Wettengel','William',26,'D',81,'Chicago Union',null],['Payne','Xavier',27,'D',81,'Chicago Union',null],
  ['Lyle','Jonathan',24,'H',81,'Los Angeles Aviators',null],['Edmonds','Thomas',30,'C',81,'DC Breeze',null],['Dillon','Trent',34,'D',81,'Seattle Sockeye','lock'],
  ['Rýdlo','Ondřej',26,'C',81,'Europa',null],['Champoux','Nathan',28,'D',80,'Michigan Hybrid',null],['Goff','Nate',30,'D',80,'Chicago Machine',null],
  ['Holland','Troy',29,'D',80,'Washington Truck Stop',null],['Ing','Michael',27,'C',80,'San Francisco Revolver',null],['Kerns','Elijah',27,'D',80,'San Francisco Revolver',null],
  ['Mieser','Jibran',26,'D',80,'New York PoNY',null],['Wariner','Cameron',29,'D',80,'New York PoNY',null],['Kocher','Chris',37,'C',80,'New York PoNY',null],
  ['Janas','Pawel',32,'H',80,'Chicago Union','break'],['Guay','Charles',27,'D',80,'Montreal Royal',null],['Little','Nate',28,'D',80,'Philadelphia Phoenix',null],
  ['Marks','Luke',26,'D',80,'Madison Radicals',null],['Ritthaler','Daniel',28,'D',80,'Oakland Spiders',null],['Gordon','Leo',23,'H',80,'Oakland Spiders',null],
  ['Karklins','Arvids',24,'H',80,'Toronto Rush',null],['McDougall','Sean',30,'C',80,'Los Angeles Aviators','sky'],['Langdon','Jeremy',31,'C',80,'Atlanta Hustle',null],
  ['Bonnet','Elliot',23,'C',80,'Belgio','explosive'],['Derks','Jelte',22,'C',79,'GRUT',null],['Lankford','Carter',23,'D',79,'Oakland Spiders',null],
  ['Randall','Tyler',28,'D',79,'Atlanta Hustle',null],['Grossberg','Sam',23,'C',79,'Philadelphia Phoenix',null],['Sheppard','Max',31,'C',79,'New York Empire',null],
  ['Froude','Jay',34,'C',78,'Colorado Summit','explosive'],['Gibson','Kurt',41,'H',76,'USA',  'general'],['Kittredge','Beau',44,'C',76,'USA','deep',1],
  ['Smith','Brodie',39,'H',74,'USA','break'],['Brownlee','Marques',33,'D',72,'New York Empire','hands',1]
];
function starPlayer(r,rng){   // scheda del giocatore vero: statistiche dal ruolo e dall'Overall, eta' vera piu' le stagioni di carriera gia' passate
  const [sur,nm,age0,role,ov,from,trait]=r,st=utStats(role,ov,rng),rr=role==='H'?'H':'C',full=sur+' '+nm,age=age0+Math.max(0,(SV.season|0)-1);
  const top=Math.max(...KEYS.map(k=>st[k])),cap=clamp(top+(age0<=25?7:(age0<=29?3:1)),60,99);
  const o={n:nm,label:nm+' '+sur,full,sur,r:rr,age:age0,tl:cap,tf:cap,tv:cap,s:st,gen:false,star:true,f:false,trait,dev:age0<=25?1.3:1,sk:2,cond:100,car:null,nat:from,pos:role==='D'?'D':undefined,ae:r[7]?undefined:1};
  for(let y=age0;y<age;y++)agePlayer(o,rng);   // gli anni passano anche per loro
  return o;
}
function buildMarket(){
  const lv=squadPower(),sd=SV.seed+'|mk|'+SV.season+'|'+(SV.mkN=(SV.mkN||0)+1),R=mulberry32(hashStr(sd)),out=[],viv=SV.fac.viv|0;
  for(let i=0;i<4+viv;i++){const o=genPlayer(lv-11+R()*7+viv,16+Math.floor(R()*4),sd+'y'+i,lv+6+R()*26+viv*2);out.push({o,kind:'Giovane promessa',from:null});}
  for(let i=0;i<4;i++){const o=genPlayer(lv-5+R()*9,23+Math.floor(R()*11),sd+'f'+i);out.push({o,kind:'Svincolato',from:null});}
  const teams=Object.keys(SV.rost).filter(n=>SV.rost[n]&&SV.rost[n].length>14);
  for(let i=0;i<6&&teams.length;i++){
    const n=teams[Math.floor(R()*teams.length)],ro=SV.rost[n].slice().sort((a,b)=>ovrX(b)-ovrX(a)),o=ro[4+Math.floor(R()*Math.max(1,ro.length-4))];
    if(o&&!out.some(m=>m.o===o)){if(o.sk===undefined)o.sk=0;out.push({o,kind:'In vendita',from:n});}
  }
  // due o tre giocatori internazionali veri (quattro con molta reputazione), mai gli stessi: chi e' gia' in rosa non ricompare
  const have=new Set(SQ.map(p=>p.full)),pool=STARS.filter(r=>!have.has(r[0]+' '+r[1])&&r[2]+Math.max(0,(SV.season|0)-1)<=starLimit(r)),nS=Math.min(pool.length,(SV.rep>=60?6:5));
  for(let i=0;i<nS;i++){
    const r=pool.splice(Math.floor(R()*pool.length),1)[0],o=starPlayer(r,mulberry32(hashStr(SV.seed+'|star|'+r[0]+r[1])));
    out.push({o,kind:ovr(o)>=86?'Stella internazionale':'Giocatore internazionale',from:null,nat:r[5],star:true});
  }
  for(const m of out)m.price=Math.round(priceOf(m.o)*(m.from?1.3:(m.star?1.15:1)));
  SV.market=out;
}
function canSign(m){return SV.cash<0?'Crediti insufficienti':SQ.length>=SQ_MAX?'Rosa al completo ('+SQ_MAX+')':(SV.cash<m.price?'Crediti insufficienti':(ovr(m.o)>repCap()?'Non interessato: serve più reputazione':''));}
function signPlayer(i){
  const m=SV.market[i];if(!m||canSign(m))return false;
  SV.cash-=m.price;SV.market.splice(i,1);
  if(m.from&&SV.rost[m.from]){const ro=SV.rost[m.from],k=ro.findIndex(x=>x===m.o||(x.full&&x.full===m.o.full));if(k>=0)ro.splice(k,1);if(ro.length<14)ro.push(genPlayer(rosterPower(ro)-8,17+Math.floor(Math.random()*4),SV.seed+'|rep|'+m.from+'|'+SV.season+'|'+ro.length));}
  const o=Object.assign({},m.o,{sk:Math.max(1,m.o.sk|0),cond:100,car:null,s:Object.assign({},m.o.s)});
  const list=squadData();list.push(o);const lO=SV.lineO,lD=SV.lineD;setSquad(list);SV.lineO=lO;SV.lineD=lD;fixLines();
  SV.chem=Math.max(0,SV.chem-4);news('Acquistato '+o.label+' ('+POS_NAME[posOf(o)]+', '+ovr(o)+') per '+m.price+' crediti'+(m.from?' da '+m.from:'')+'.');
  return true;
}
// chi lascia la squadra (ceduto o ritirato) resta nelle classifiche di sempre del club
function keepFormer(p){const c=p.car;if(!c||!c.mp)return;SV.former.push({name:p.label||p.name,mp:c.mp,g:c.g,a:c.a,b:c.b,aw:(p.aw||[]).length});if(SV.former.length>80)SV.former.sort((a,b)=>(b.g+b.a+b.b)-(a.g+a.a+a.b)).length=80;}
function sellPlayer(id){
  const p=SQ[id];if(!p||SQ.length<=SQ_MIN)return false;
  keepFormer(p);
  const v=sellValue(p);SV.cash+=v;
  const list=squadData();list.splice(id,1);setSquad(list);fixLines();SV.chem=Math.max(0,SV.chem-2);
  news('Ceduto '+(p.label||p.name)+' per '+v+' crediti.');return true;
}
const SCOUT_COST=6;
function scoutPlayer(x){if(!x||(x.sk|0)>=3||SV.cash<SCOUT_COST)return false;SV.cash-=SCOUT_COST;x.sk=(x.sk|0)+1;return true;}

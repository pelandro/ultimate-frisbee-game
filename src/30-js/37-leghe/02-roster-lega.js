/* ===================== LEGHE EUROPEE: ROSTER DEI CLUB =====================
   La rosa di un club e' fatta come quella dei club USA: i giocatori veri delle tabelle (LN_PL: nome, eta', ruolo e un bonus di livello dal rendimento 2026), le stelle del
   mercato che ci giocano (LN_STAR_CLUB: tengono l'Overall del mercato, anche se il club e' piccolo), e un riempimento generato con nomi del paese per arrivare a 16 giocatori
   (nella Rosa compaiono come «non in elenco»). Poi si sposta il livello di tutti tranne le stelle finche' la media dei 7 migliori e' quella del club (forza).
   Le fonti sono elenchi di tornei, non rose ufficiali: dove un club ha pochi nomi, il riempimento fa il resto. */
// stelle del mercato che giocano in un club di queste leghe (le altre stelle restano sul mercato). Un giocatore puo' stare anche in un club USA (US_STAR_CLUB): le carriere di
// leghe diverse sono separate, quindi non c'e' conflitto; la lista dei doppioni e' LN_DUAL piu' sotto.
const LN_STAR_CLUB={
  'De Marrée|Daan':'Mooncatchers','Barzasi|David':'Mooncatchers','Abeltins|Toms':'Mooncatchers','Mueller|Mathieu':'Mooncatchers','Karklins|Arvids':'Mooncatchers','Edmonds|Thomas':'Mooncatchers',
  'Schlör|Conrad':'Wall City','Herkens|Paul':'Wall City','Müller|Nico':'Bad Skid','Beuttenmüller|Holger':'Bad Skid',
  'Rýdlo|Ondřej':'Wall City','Foord|Justin':'Clapham Ultimate','Abrams|Tom':'Clapham Ultimate','Yeo|Ashley':'Clapham Ultimate','Poitte-Sokolsky|Sacha':'Tchac','Bonnet|Elliot':'Tchac'
};
const lnStarTaken=r=>isLN()&&!!LN_STAR_CLUB[usStarKey(r)]&&!!LN_BY[LN_STAR_CLUB[usStarKey(r)]]&&LN_BY[LN_STAR_CLUB[usStarKey(r)]].lk===SV.lk;   // usato dal mercato (buildMarket)
// contesto europeo: chi in Europa e' un punto di riferimento non diventa mediocre in America per un torneo storto. Per chi compare in un club di queste leghe (stella o dalle
// tabelle) si stima l'Overall europeo; le carriere USA lo usano come livello minimo (usRoster). I nomi comuni non si uniscono: sono persone diverse.
const LN_HOMONYM=US_HOMONYM;
// chi gioca sia in Europa sia in America: il gioco lo tiene in Europa (scelta del progetto), tranne Orion Cable che resta in America (LN_OUT: non compare nei club europei).
// LN_DUAL = Overall del giocatore in Europa: il piu' alto tra il valore europeo e quello americano (Fantasy dei Nationals), ma l'America non lo alza di piu' di 5 punti e
// nessuno supera 92 tranne De Marrée (97: il migliore del mondo) (un solo torneo non fa un fuoriclasse: la regola e' la stessa di US_REP). McHale e Hill sono stati assegnati ai Clapham per scelta del progetto. I quattro che erano stelle del mercato alzano anche il loro Overall in STARS.
const LN_OUT=new Set(['Orion Cable'].map(usNameKey));
const LN_DUAL={'Lander Decraene':90,'Sofiène Bontemps':92,'Louis Betrancourt':89,'Gael Ancelin':90,'Daan De Marrée':97,'David Barzasi':92,'Thomas Edmonds':81,'Elliot Bonnet':94,'Connor McHale':90,'Sam Hill':90};   // Overall del foglio di revisione 2026 (00-dati-ovr-2026.js)
let lnDualMap=null;
const lnDual=(sur,nm)=>{if(!lnDualMap){lnDualMap={};for(const n in LN_DUAL)lnDualMap[usNameKey(n)]=LN_DUAL[n];}return lnDualMap[usNameKey(nm+' '+sur)]|0;};
for(const r of STARS)r[4]=Math.max(r[4],lnDual(r[0],r[1]));
let lnKeyClub=null;const lnCtxRo={};
function lnCtxOvr(k){
  if(LN_HOMONYM.has(k))return 0;
  if(!lnKeyClub){
    lnKeyClub={};
    for(const lk of LN_IDS)for(const club in LN_PL[lk])for(const r of LN_PL[lk][club]){const key=usNameKey(r[1]+' '+r[0]);if(!lnKeyClub[key]&&!LN_OUT.has(key))lnKeyClub[key]=club;}
    for(const r of STARS){const club=LN_STAR_CLUB[usStarKey(r)];if(club)lnKeyClub[usNameKey(r[1]+' '+r[0])]=club;}
  }
  const club=lnKeyClub[k];if(!club)return 0;
  const ro=lnCtxRo[club]||(lnCtxRo[club]=lnRoster(club,'ctx')),o=ro.find(x=>usNameKey(x.label||x.n)===k);   // l'Overall che ha davvero nel suo club europeo
  return o?ovr(o):0;
}
// nomi per il riempimento
const LN_POOL={
  BE:{f:['Thomas','Maxime','Lucas','Nathan','Arthur','Simon','Louis','Jules','Hugo','Victor','Noah','Milan','Arne','Bram','Jens','Senne','Wout','Tuur','Lars','Pieter','Jonas','Stijn','Robbe','Matthias','Quentin','Florian'],
      l:['Peeters','Janssens','Maes','Jacobs','Mertens','Willems','Claes','Goossens','Wouters','De Smet','Dubois','Lambert','Dupont','Lefebvre','Renard','Hermans','Vandenberghe','Van Damme','De Backer','Claeys','Declercq','Pauwels','Michiels','Aerts']},
  FR:{f:['Lucas','Hugo','Louis','Jules','Léo','Gabriel','Raphaël','Arthur','Nathan','Théo','Maxime','Antoine','Baptiste','Clément','Romain','Valentin','Quentin','Adrien','Mathis','Paul','Tom','Nicolas','Pierre','Alexandre'],
      l:['Martin','Bernard','Dubois','Thomas','Robert','Richard','Petit','Durand','Leroy','Moreau','Simon','Laurent','Lefebvre','Michel','Garcia','David','Bertrand','Roux','Vincent','Fournier','Morel','Girard','André','Mercier']},
  DE:{f:['Lukas','Felix','Jonas','Leon','Maximilian','Paul','Tim','Jan','Niklas','Tobias','Moritz','Florian','Philipp','Sebastian','Fabian','David','Simon','Julian','Marcel','Lennart','Hannes','Jakob','Ole','Finn'],
      l:['Müller','Schmidt','Schneider','Fischer','Weber','Meyer','Wagner','Becker','Schulz','Hoffmann','Koch','Richter','Klein','Wolf','Neumann','Schwarz','Zimmermann','Braun','Krüger','Hartmann','Lange','Werner','Krause','Lehmann']},
  UK:{f:['Oliver','George','Harry','Jack','Jacob','Noah','Charlie','Thomas','Oscar','William','James','Henry','Alfie','Joshua','Freddie','Archie','Ethan','Isaac','Joseph','Samuel','Callum','Ryan','Liam','Connor'],
      l:['Smith','Jones','Taylor','Brown','Williams','Wilson','Johnson','Davies','Robinson','Wright','Thompson','Evans','Walker','White','Roberts','Green','Hall','Wood','Jackson','Clarke','Patel','Khan','Lewis','Harrison']}
};
// eta': esatta se nota (anche dalle schede UFA, se il giocatore gioca pure in America); altrimenti la stima USA se c'e', o 22-33; se c'e' un limite delle nazionali giovanili
// (U17/U20/U24, di qui o di la') e la stima lo supera, un valore tra il limite meno tre e il limite meno uno. Chi gioca in entrambe le leghe ha cosi' la stessa eta' in tutte e due. Ritorna [eta', esatta?]
let lnUsAge=null,lnHiMap=null;
function lnHiOf(k){   // limite d'eta' dalle convocazioni giovanili nei dati europei (0 = nessuno)
  if(!lnHiMap){lnHiMap={};for(const lk of LN_IDS)for(const club in LN_PL[lk])for(const r of LN_PL[lk][club])if(r[3]>0){const key=usNameKey(r[1]+' '+r[0]);lnHiMap[key]=Math.min(lnHiMap[key]||99,r[3]);}
    for(const n in LN_AGE_HI){const key=usNameKey(n);lnHiMap[key]=Math.min(lnHiMap[key]||99,LN_AGE_HI[n]);}}   // + i tornei giovanili (00-eta-giovanili.js)
  return lnHiMap[k]||0;
}
// sotto il limite dei tornei giovanili: tra limite-3 e limite-1 (almeno 16; hh = hash del nome), cosi' chi ha giocato lo stesso torneo non ha tutti la stessa eta'
const ageCap=(h,hh)=>Math.max(16,h-1-Math.floor(hh/625)%3);
function lnAgeOf(full,age,hi){
  if(age>0)return [age,true];
  const k=usNameKey(full);
  if(US_AGE[k])return [US_AGE[k],true];
  if(!lnUsAge){lnUsAge={};for(const c in US_CORE)for(const r of US_CORE[c])lnUsAge[usNameKey(r[1]+' '+r[0])]=r[2];}
  const hh=hashStr('ln|'+full),est=lnUsAge[k]||20+hh%5+Math.floor(hh/5)%5+Math.floor(hh/25)%5+Math.floor(hh/125)%4,h=Math.min(hi>0?hi:99,US_AGE_HI[k]||99,lnHiOf(k)||99);   // 20-35 anni, con la media intorno ai 27
  return [h<99&&est>h?ageCap(h,hh):est,false];
}
// forma della rosa: il giocatore al posto j (0 = il migliore) sta a P + lnShape(j). I primi 7 hanno media 0, cosi' la forza della rosa e' quella del club; il fondo scende piano.
// I giocatori fissi (stelle del mercato e doppioni) tengono il loro Overall e occupano meta' dei posti in alto: chi gioca con loro non scende sotto il livello del club.
// rinforzi a mano: i migliori giocatori di un club prendono qualche punto in piu' sul loro posto (per scelta del progetto: i Freezzz Beezzz, 13ª all'EUCF 2026 ma con campioni piu' forti di quanto dicano i dati)
const LN_BOOST={'Freezzz Beezzz one':[4,4,3,3,2,2]};
const lnShape=j=>j<7?4.2-1.45*j:-4.5-0.65*(j-6);
function lnRoster(club,seedStr,opt){
  opt=opt||{};const B=LN_BY[club],P=opt.p!==undefined?opt.p:B.p,rg=mulberry32(hashStr(seedStr+'|lnr|'+club)),specs=[];
  for(const r of STARS)if(LN_STAR_CLUB[usStarKey(r)]===club)specs.push({k:'s',row:r});
  const star=new Set(specs.map(s=>usNameKey(s.row[1]+' '+s.row[0])));   // chi e' gia' una stella non si ripete dalle tabelle
  const gone=ovrOutSet(club),real=(LN_PL[B.lk][club]||[]).filter(r=>{const k=usNameKey(r[1]+' '+r[0]);return !star.has(k)&&!LN_OUT.has(k)&&!gone.has(k);}).map(r=>{const ag=lnAgeOf(r[1]+' '+r[0],r[2],r[3]);const bf=(LN_BONUS_FIX[club]||{})[r[1]+' '+r[0]];return {k:'r',row:[r[0],r[1],ag[0],r[4],0],ex:ag[1],base:-1+(bf!==undefined?bf:r[5]),fx:lnDual(r[0],r[1])};});
  real.sort((a,b)=>(b.fx>0?100:b.base)-(a.fx>0?100:a.base)).slice(0,Math.max(0,20-specs.length)).forEach(s=>specs.push(s));   // una rosa ha al massimo 20 giocatori
  const N=Math.min(20,Math.max(opt.n||16,specs.length)),used=new Set(specs.map(s=>s.row[0]+s.row[1])),pool=LN_POOL[B.lk];
  for(let i=0;specs.length<N;i++){   // riempimento: nomi del paese, ruoli bilanciati (almeno 6 handler), livello decrescente
    let sur,nm;do{sur=pool.l[Math.floor(rg()*pool.l.length)];nm=pool.f[Math.floor(rg()*pool.f.length)];}while(used.has(sur+nm));used.add(sur+nm);
    const h=specs.filter(s=>s.row[3]==='H').length,role=h<6?'H':(rg()<0.2?'D':'C');
    specs.push({k:'g',row:[sur,nm,19+Math.floor(rg()*5)+Math.floor(rg()*5)+Math.floor(rg()*5)+Math.floor(rg()*4),role],base:-2-i*1.3-rg()*3});   // eta' 19-34 a campana (media 27)
  }
  // posti: i fissi (stelle e doppioni) tengono il loro livello; gli altri si ordinano per rendimento (base) e prendono il livello del loro posto, a partire da meta' dei fissi
  // Senza statistiche (bonus sotto -3: niente mete ne' assist nei dati) l'ordine non dice nulla: le differenze si accorciano e l'ordine e' sorteggiato dal nome; i
  // generati vengono sempre dopo i veri. Con almeno 5 giocatori con statistiche le differenze sono intere.
  const fixed=s=>s.k==='s'||s.fx>0,jr=mulberry32(hashStr(seedStr+'|jit|'+club)),nFix=specs.filter(fixed).length,j0=Math.floor(nFix/2);
  const rl=specs.filter(s=>!fixed(s)&&s.k==='r'),kn=rl.filter(s=>s.base>-4).length,sc=kn>=5?1:0.5+0.1*kn;
  rl.forEach(s=>{s.jk=s.base+(s.base>-4?0:3*(jr()-0.5));});
  const free=rl.sort((a,b)=>b.jk-a.jk).concat(specs.filter(s=>s.k==='g'));
  free.forEach((s,j)=>{const jj=j0+j;s.lv=(jj<7?sc:1)*lnShape(jj)+(jj<7&&s.k==='r'&&s.base>-4?clamp(0.12*s.base,-1,1):0)+((LN_BOOST[club]||[])[j]||0);});   // il fondo della rosa segue sempre la stessa curva: club piu' forte = fondo piu' forte
  // la stella migliore del club resta la migliore: chi non e' fisso non la supera (un buon dato statistico non fa di un giocatore il numero uno del club)
  const capFree=nFix?Math.max(...specs.filter(fixed).map(s=>s.k==='s'?Math.max(Math.round(s.row[4]),Math.min(95,Math.round(P+1))):s.fx))-1:99;
  let off=0,out=[];
  for(let it=0;it<7;it++){
    out=specs.map(s=>{
      const [sur,nm,age,role]=s.row,rng=mulberry32(hashStr(seedStr+'|'+club+'|'+sur+nm));
      // una stella tiene l'Overall del mercato, ma in un club forte non sta sotto la media dei compagni (a Elliot Bonnet un torneo storto in America non toglie il ruolo di leader in Francia)
      if(s.k==='s'){const row=s.row.slice();row[4]=Math.max(Math.round(row[4]),Math.min(95,Math.round(P+1)));const o=starPlayer(row,rng);o.nat=club;o.n=o.sur;return o;}   // in partita si legge il cognome
      if(s.fx>0)return usCard(sur,nm,age,role,s.fx,rng,s.ex?{}:{ae:1});
      return usCard(sur,nm,age,role,Math.min(capFree,Math.max(clamp(P+s.lv+off,36,95),usAward(sur,nm))),rng,s.k==='g'?{gen:true}:(s.ex?{}:{ae:1}));
    });
    const d=P-rosterLevel(out);if(Math.abs(d)<0.35)break;
    off=nFix?clamp(off+d,0,4):clamp(off+d,-8,8);   // con i fissi si puo' solo alzare (se i fissi portano la rosa sopra il club, resta sopra)
  }
  out=ovrFix(club,out,seedStr,'LN');   // rosa del foglio di revisione 2026 (38-ovr/01-applica.js)
  if(LN_DEF[B.lk].w)for(const o of out)o.f=true;   // campionato Women (07-women.js): aspetto e accordi nei testi
  const cnt={};for(const o of out)cnt[o.n]=(cnt[o.n]||0)+1;
  for(const o of out)if(cnt[o.n]>1)o.n=o.sur+' '+(o.label||'?')[0]+'.';   // due compagni con lo stesso cognome: si aggiunge l'iniziale
  return out;
}

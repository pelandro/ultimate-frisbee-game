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
  'Foord|Justin':'Clapham Ultimate','Abrams|Tom':'Clapham Ultimate','Yeo|Ashley':'Clapham Ultimate','Poitte-Sokolsky|Sacha':'Tchac','Bonnet|Elliot':'Tchac'
};
const lnStarTaken=r=>isLN()&&!!LN_STAR_CLUB[usStarKey(r)]&&!!LN_BY[LN_STAR_CLUB[usStarKey(r)]]&&LN_BY[LN_STAR_CLUB[usStarKey(r)]].lk===SV.lk;   // usato dal mercato (buildMarket)
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
// eta': esatta se nota; se c'e' un limite delle nazionali giovanili (U20/U24) e la stima lo supera, il limite meno uno; altrimenti stima 22-33. Ritorna [eta', esatta?]
function lnAgeOf(full,age,hi){
  if(age>0)return [age,true];
  const est=22+hashStr('ln|'+full)%12;
  return [hi>0&&est>hi?Math.max(16,hi-1):est,false];
}
function lnRoster(club,seedStr,opt){
  opt=opt||{};const B=LN_BY[club],P=opt.low?B.p*0.9+5.5:B.p,rg=mulberry32(hashStr(seedStr+'|lnr|'+club)),specs=[];
  for(const r of STARS)if(LN_STAR_CLUB[usStarKey(r)]===club)specs.push({k:'s',row:r});
  const real=(LN_PL[B.lk][club]||[]).map(r=>{const ag=lnAgeOf(r[1]+' '+r[0],r[2],r[3]);return {k:'r',row:[r[0],r[1],ag[0],r[4],0],ex:ag[1],base:-1+r[5]};});
  real.sort((a,b)=>b.base-a.base).slice(0,Math.max(0,20-specs.length)).forEach(s=>specs.push(s));   // una rosa ha al massimo 20 giocatori
  const N=Math.min(20,Math.max(opt.n||16,specs.length)),used=new Set(specs.map(s=>s.row[0]+s.row[1])),pool=LN_POOL[B.lk];
  for(let i=0;specs.length<N;i++){   // riempimento: nomi del paese, ruoli bilanciati (almeno 6 handler), livello decrescente
    let sur,nm;do{sur=pool.l[Math.floor(rg()*pool.l.length)];nm=pool.f[Math.floor(rg()*pool.f.length)];}while(used.has(sur+nm));used.add(sur+nm);
    const h=specs.filter(s=>s.row[3]==='H').length,role=h<6?'H':(rg()<0.2?'D':'C');
    specs.push({k:'g',row:[sur,nm,19+Math.floor(rg()*14),role],base:-2-i*1.3-rg()*3});
  }
  let off=0,out=[];
  for(let it=0;it<7;it++){
    out=specs.map(s=>{
      const [sur,nm,age,role]=s.row,rng=mulberry32(hashStr(seedStr+'|'+club+'|'+sur+nm));
      if(s.k==='s'){const o=starPlayer(s.row,rng);o.nat=club;o.n=o.sur;return o;}   // in partita si legge il cognome
      return usCard(sur,nm,age,role,clamp(P+s.base+off,36,95),rng,s.k==='g'?{gen:true}:(s.ex?{}:{ae:1}));
    });
    const d=P-rosterPower(out);if(Math.abs(d)<0.35)break;off=clamp(off+d,-34,16);
  }
  const cnt={};for(const o of out)cnt[o.n]=(cnt[o.n]||0)+1;
  for(const o of out)if(cnt[o.n]>1)o.n=o.sur+' '+(o.label||'?')[0]+'.';   // due compagni con lo stesso cognome: si aggiunge l'iniziale
  return out;
}

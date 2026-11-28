/* ===================== CAMPIONATI WOMEN EUROPEI =====================
   Sono leghe come le altre di 37-leghe (w:true in LN_DEF), con una regola in piu': le squadre femminili giocano solo tra loro.
   - allClubs (35-usa/05-lega-incrociata.js) separa i due mondi: in una carriera Women ci sono solo i club Women, altrove (e senza carriera, come per le carte di
     Ultimate Team) solo quelli maschili. Cosi' mercato, scambi e offerte di lavoro non attraversano mai il confine.
   - la partita veloce ha le sue linguette Women e abbina una squadra femminile solo a un'altra femminile (qWomen, 30-carriera/10-partita-avvio.js).
   - l’EUCF Women si disputa tra i club delle cinque leghe europee della divisione. */
const lnWomen=lk=>lk==='UW'||!!(LN_DEF[lk]&&LN_DEF[lk].w);
const lnWomenNow=()=>!!(SV&&SV.lk&&lnWomen(SV.lk));
const isWomenClub=n=>!!UW_ROSTERS[n]||!!(LN_BY[n]&&lnWomen(LN_BY[n].lk));
function womenRoster(club,seedStr){
  const league=LN_BY[club].lk;
  if(league!=='IW'){
    const out=LN_PL[league][club].map(([name,role,level,generated,hi])=>{
      const split=name.indexOf(' '),nm=name.slice(0,split),sur=name.slice(split+1);
      const rng=mulberry32(hashStr(seedStr+'|women|'+club+'|'+name));
      const [age,exact]=lnAgeOf(name,0,hi);
      return usCard(sur,nm,age,role,level,rng,{f:true,gen:!!generated,ae:exact?undefined:1});
    });
    return lnRosterNames(out);
  }
  const out=LN_PL.IW[club].slice(0,SQ_MAX).map(([sur,nm,age,hi,role,level])=>{
    const name=nm+' '+sur,rng=mulberry32(hashStr(seedStr+'|women|'+club+'|'+name));
    const [years,exact]=age<0?[-age,false]:lnAgeOf(name,age,hi);
    return usCard(sur,nm,years,role,level,rng,exact?{f:true}:{f:true,ae:1});
  });
  return lnRosterNames(out);
}
LN_POOL.IW={f:['Giulia','Sofia','Martina','Chiara','Francesca','Sara','Alice','Giorgia','Elisa','Federica','Valentina','Alessia','Silvia','Elena','Marta','Beatrice','Camilla','Arianna','Ilaria','Laura','Gaia','Matilde','Aurora','Greta','Noemi','Irene','Caterina','Benedetta','Rebecca','Lucia','Nicole','Anna','Emma','Agata','Margherita','Ludovica','Bianca','Viola','Asia','Eleonora'],
  l:['Rossi','Bianchi','Ferrari','Russo','Romano','Gallo','Costa','Fontana','Conti','Esposito','Ricci','Bruno','Moretti','Marino','Greco','Barbieri','Lombardi','Giordano','Colombo','Mancini','Longo','Leone','Martinelli','Serra','Vitale','Santoro','Fabbri','Benedetti','Gentile','Rinaldi','Pellegrini','Bassi','Neri','Galli','Monti','Zanetti','Bernardi','Grassi','Cattaneo','Sartori']};

for(const country of ['UK','BE','FR','DE']){
  LN_POOL[country+'W']={f:LN_WOMEN_FIRST_NAMES[country],l:LN_POOL[country].l};
}

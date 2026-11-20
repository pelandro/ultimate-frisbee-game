/* ===================== CAMPIONATO ITALIANO WOMEN =====================
   E' una lega come le altre di 37-leghe (LN_DEF.IW, dati in 00-dati-women.js), con una regola in piu': le squadre femminili giocano solo tra loro.
   - allClubs (35-usa/05-lega-incrociata.js) separa i due mondi: in una carriera Women ci sono solo i club Women, altrove (e senza carriera, come per le carte di
     Ultimate Team) solo quelli maschili. Cosi' mercato, scambi e offerte di lavoro non attraversano mai il confine.
   - la partita veloce ha le sue linguette Women e abbina una squadra femminile solo a un'altra femminile (qWomen, 30-carriera/10-partita-avvio.js).
   - le rose iniziali del CIU sono quelle documentate, con Overall assegnati come per i club Open revisionati. */
const lnWomen=lk=>lk==='UW'||!!(LN_DEF[lk]&&LN_DEF[lk].w);
const lnWomenNow=()=>!!(SV&&SV.lk&&lnWomen(SV.lk));
const isWomenClub=n=>!!UW_ROSTERS[n]||!!(LN_BY[n]&&lnWomen(LN_BY[n].lk));
function womenRoster(club,seedStr){
  const out=LN_PL.IW[club].slice(0,SQ_MAX).map(([sur,nm,age,hi,role,level])=>{
    const name=nm+' '+sur,rng=mulberry32(hashStr(seedStr+'|women|'+club+'|'+name));
    const [years,exact]=age<0?[-age,false]:lnAgeOf(name,age,hi);
    return usCard(sur,nm,years,role,level,rng,exact?{f:true}:{f:true,ae:1});
  });
  return lnRosterNames(out);
}
LN_POOL.IW={f:['Giulia','Sofia','Martina','Chiara','Francesca','Sara','Alice','Giorgia','Elisa','Federica','Valentina','Alessia','Silvia','Elena','Marta','Beatrice','Camilla','Arianna','Ilaria','Laura','Gaia','Matilde','Aurora','Greta','Noemi','Irene','Caterina','Benedetta','Rebecca','Lucia','Nicole','Anna','Emma','Agata','Margherita','Ludovica','Bianca','Viola','Asia','Eleonora'],
  l:['Rossi','Bianchi','Ferrari','Russo','Romano','Gallo','Costa','Fontana','Conti','Esposito','Ricci','Bruno','Moretti','Marino','Greco','Barbieri','Lombardi','Giordano','Colombo','Mancini','Longo','Leone','Martinelli','Serra','Vitale','Santoro','Fabbri','Benedetti','Gentile','Rinaldi','Pellegrini','Bassi','Neri','Galli','Monti','Zanetti','Bernardi','Grassi','Cattaneo','Sartori']};

// Stessa scheda delle altre leghe. Età e profilo sono stabili anche cambiando modalità.
const UW_FN=['Alex','Anna','Ashley','Brooke','Carmen','Claire','Dawn','Ella','Emily','Emma','Grace','Hannah','Jade','Jamie','Jasmine','Jordan','Julia','Kate','Kelly','Lauren','Leah','Maya','Morgan','Rachel','Riley','Robin','Sam','Sarah','Taylor','Zoe'];
// Cognomi composti che il parser dei nomi dei Nationals abbrevia all'ultima parola.
const UW_SURNAMES={'Laura Ospina Gómez':'Ospina Gómez','María Angélica Forero Becerra':'Forero Becerra',
  'Brittney Dos Santos':'Dos Santos','Krystal Dos Santos':'Dos Santos'};
function uwRoster(club,seed){
  const roster=UW_ROSTERS[club].map(([name,role,overall,age])=>{
    const surname=UW_SURNAMES[name];
    const [sur,nm]=surname?[surname,name.slice(0,-surname.length-1)]:usFFsplit(name);
    const rng=mulberry32(hashStr(seed+'|'+club+'|'+name));
    return usCard(sur,nm,Math.abs(age),role,overall,rng,age<0?{f:true,ae:1}:{f:true});
  });
  return lnRosterNames(roster);
}

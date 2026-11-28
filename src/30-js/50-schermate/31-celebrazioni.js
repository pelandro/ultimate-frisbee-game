// Si confronta lo stato prima e dopo il risultato: tornare al riepilogo non rilancia la festa.
// kind sceglie la festa (32-alza-coppa.js): 'camp' campionato, 'eu' EUCF, 'us' Nationals.
function careerTitleAfter(wasDone,wasEuropeanChampion){
  if(SV.event==='eu'&&!wasEuropeanChampion&&SV.eu.state==='champ'){
    return {text:euChampions()+' d’Europa',europe:true,kind:'eu'};
  }
  if(SV.event!=='camp'||wasDone||!SV.done||!SV.next?.tit)return null;
  if(isUS())return {text:lnWomenNow()?'Campionesse dei Nationals':'Campioni dei Nationals',kind:'us'};
  const title=lnWomenNow()?'Campionesse':'Campioni';
  return {text:title+(isLN()?' · ':' di ')+SERIES_NAME[SV.sr],kind:'camp'};
}

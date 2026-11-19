// Si confronta lo stato prima e dopo il risultato: tornare al riepilogo non rilancia la festa.
function careerTitleAfter(wasDone,wasEuropeanChampion){
  if(SV.event==='eu'&&!wasEuropeanChampion&&SV.eu.state==='champ'){
    return {text:'Campioni d’Europa',europe:true};
  }
  if(SV.event!=='camp'||wasDone||!SV.done||!SV.next?.tit)return null;
  if(isUS())return {text:'Campioni dei Nationals'};
  const title=SV.lk==='IW'?'Campionesse':'Campioni';
  return {text:title+(isLN()?' · ':' di ')+SERIES_NAME[SV.sr]};
}

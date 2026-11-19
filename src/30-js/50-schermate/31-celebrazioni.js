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

function renderTitleCelebration(heading,title){
  const previous=heading.previousElementSibling;
  if(previous?.classList.contains('title-fanfare'))previous.remove();
  if(!title)return;
  heading.textContent=title.text;
  const colors=title.europe?['#ffdc79','#85bfff','#d6edff']:['#ffdc79','#f3a94c','#a6e9b1'];
  // Le posizioni fisse danno la stessa scena su ogni schermo, senza usare il caso della carriera.
  const pieces=Array.from({length:title.europe?24:16},(_,i)=>{
    const x=7+(i*37)%87,y=12+(i*23)%70;
    return `<i style="--x:${x}%;--y:${y}%;--c:${colors[i%3]};--d:${(i%6)*65}ms"></i>`;
  }).join('');
  heading.insertAdjacentHTML('beforebegin',`<div class="title-fanfare${title.europe?' europe':''}" aria-hidden="true">${pieces}<span></span></div>`);
}

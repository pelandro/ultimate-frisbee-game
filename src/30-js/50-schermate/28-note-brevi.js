/* ---- NOTE BREVI: le spiegazioni lunghe in cima alle schermate di scelta mostrano due righe; un tocco le apre per intero ----
   (la nota della scelta della squadra occupava tre righe piene prima ancora di vedere le squadre). Il testo lo scrivono le schermate (#tNote): qui solo il comportamento */
for(const id of ['tNote']){
  const el=$(id);if(!el)continue;
  el.classList.add('nbrief');el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-expanded','false');
  const tg=()=>{const on=!el.classList.contains('open');el.classList.toggle('open',on);el.setAttribute('aria-expanded',String(on));};
  el.addEventListener('click',tg);
  el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();tg();}});
}

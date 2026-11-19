/* Schermata iniziale: Guida, Guida passo passo, Audio e Impostazioni stanno in un riquadro che si apre con «Altro», cosi' la schermata resta pulita.
   Si chiude toccando una voce (tranne l'audio, che si accende e si spegne restando nel riquadro), toccando fuori o con Esc. */
const tMenuOpen=on=>{$('tMenu').classList.toggle('hidden',!on);$('tMore').setAttribute('aria-expanded',on?'true':'false');$('tMore').classList.toggle('on',on);};
$('tMore').addEventListener('click',e=>{e.stopPropagation();tMenuOpen($('tMenu').classList.contains('hidden'));});
$('tMenu').addEventListener('click',e=>{const b=e.target.closest('button');if(b&&b.id!=='tSnd')tMenuOpen(false);});
document.addEventListener('click',e=>{if(!$('tMenu').classList.contains('hidden')&&!e.target.closest('#tBar'))tMenuOpen(false);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('tMenu').classList.contains('hidden'))tMenuOpen(false);});

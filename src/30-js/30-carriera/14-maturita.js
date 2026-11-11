/* ---- MATURITA': OLTRE IL PROPRIO LIMITE ----
   Il talento di un giocatore (tl, tf, tv) fissa il massimo di ogni statistica. Senza altro la squadra si ferma attorno a 86-87 dopo 9-10 stagioni:
   tutti i titolari sono al limite e non c'e' piu' niente da inseguire. Ogni estate chi ha gia' raggiunto il limite in almeno meta' delle statistiche, ha tra 21 e 31 anni
   e non e' infortunato puo' «maturare»: il talento sale di 1 (e con lui il massimo di tutte le statistiche), fino a EXT_MAX volte in carriera (p.ext).
   Piu' probabile con l'Allenatore, il Campo di allenamento, un indirizzo personale e i giocatori che crescono in fretta. Dopo l'estate le statistiche ci arrivano allenandosi. */
const EXT_MAX=2;
function talentGrow(p){
  if((p.ext|0)>=EXT_MAX||p.age<21||p.age>31||p.inj)return false;
  let at=0;for(const k of KEYS)if(p.s[k]>=capX(p,k)-1)at++;
  if(at<KEYS.length/2)return false;
  const pr=0.07*(p.dev||1)*(1+0.25*staffLv('coach')+0.12*facLv('camp')+(p.spec?0.15:0));
  if(Math.random()>=pr)return false;
  p.tl=Math.min(99,p.tl+1);p.tf=Math.min(99,p.tf+1);p.tv=Math.min(99,p.tv+1);p.tal=Math.round((p.tl+p.tf+p.tv)/3);p.ext=(p.ext|0)+1;talentGrow.n=(talentGrow.n|0)+1;
  alertAdd('up',`${pname(p)} ha superato il proprio limite: il suo talento cresce (${p.ext} su ${EXT_MAX}).`,{full:p.full,seen:1});
  return true;
}

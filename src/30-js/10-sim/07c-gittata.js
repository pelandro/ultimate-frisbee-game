/* ---- GITTATA DEL LANCIATORE e FIDUCIA DEI COMPAGNI ----
   Lo Sparo decide quanto lontano si puo' lanciare davvero:
   - throwComf: fino a questa distanza il lancio e' preciso come al solito; oltre, la precisione crolla (vedi planThrow);
   - throwMax: oltre questa distanza il disco non arriva: cade corto. Sparo 20 -> 30 m, Sparo 60 -> 65 m, Sparo 99 -> tutto il campo.
   Il vento in coda o contrario sposta entrambi i limiti (planThrow).
   I compagni lo sanno: un cutter non parte per un taglio lungo se il lanciatore non ci arriva, e piu' ci hanno giocato insieme (intesa, G.duo) o piu' l'IA e' esperta,
   piu' si fidano e partono anche per tagli di 50-60 m. Allo stesso modo la difesa avversaria non protegge il profondo da chi non ha il braccio per sfruttarlo. */
const throwComf=p=>14+p.s.spa*0.55;
const throwMax=p=>12+p.s.spa*0.88;
// fiducia 0..1 del compagno c nel lanciatore th: la tua squadra la costruisce con l'intesa, l'IA ha una fiducia base che cresce col livello
function trustOf(c,th){
  if(!c||!th)return 0.5;
  if(th.t===0&&!G.auto)return clamp(0.3+0.7*duoOf(c,th),0.3,1);
  return clamp(0.45+0.45*AIK(th.t).smart,0.45,0.9);
}
// fin dove il cutter c pensa che il lanciatore th possa arrivare: da una stima prudente (la gittata comoda) al massimo vero, secondo la fiducia
function reachSeen(c,th){return lerp(throwComf(th),throwMax(th),trustOf(c,th));}
// quanto in profondita' (m davanti al disco) il cutter e' disposto a spingersi: il minimo tra la sua corsa e cio' che il lanciatore puo' servire
function deepRun(c,th){
  const speedy=(c.s.vel+c.s.sal)/2,run=28+speedy*0.45;
  return th&&th.s?Math.max(14,Math.min(run,reachSeen(c,th)-3)):Math.min(run,40);
}
// peso della probabilita' di tagliare lungo: lanciatore che non spara = quasi nessuno parte, lanciatore e intesa da tutto campo = partono di piu'
const deepAppetite=(c,th)=>th&&th.s?clamp(0.45+(reachSeen(c,th)-30)/42,0.3,1.7):1;

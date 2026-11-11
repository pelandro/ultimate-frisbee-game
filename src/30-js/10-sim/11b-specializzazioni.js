/* ---- SPECIALIZZAZIONI: un giocatore puo' avere un indirizzo di sviluppo personale (p.spec) ----
   Orienta la crescita dei punti di allenamento verso poche statistiche e ne aumenta un po' il rendimento, a patto che ci sia ancora margine:
   il bonus cala con l'eta' (growLeft), con la vicinanza al potenziale (statistiche gia' vicine al loro massimo) e con il livello della statistica (lvlF).
   Il prezzo: le sedute che toccano l'indirizzo costano il 15% di condizione in piu'. Nessun effetto diretto in partita: conta solo cio' che si e' allenato. */
const SPECS={
  reg:{n:'Regista',keys:['lan','buc'],d:'Lancio e Buco: il playmaker che si libera dal marcatore'},
  huck:{n:'Lanciatore lungo',keys:['spa','lan'],d:'Sparo e Lancio: per gli huck che arrivano in meta'},
  sal:{n:'Saltatore',keys:['sal','pre','tuf'],d:'Salto, Presa e Tuffo: le prese contese e i layout'},
  vel:{n:'Scattista',keys:['vel','sca','agi'],d:'Velocità, Scatto e Agilità: il cutter che brucia il marcatore'},
  gua:{n:'Guardiano',keys:['dif','tuf','res'],d:'Difesa, Tuffo e Resistenza: il difensore che non molla mai'},
  let:{n:'Lettore di gioco',keys:['vis','pre'],d:'Visione e Presa: la scelta giusta, le mani sicure'}
};
const SPEC_B=0.3;   // bonus massimo ai punti di una seduta che tocca l'indirizzo (giovane, tanto margine)
// margine residuo dell'indirizzo (0..1): media di (massimo - valore)/12 sulle sue statistiche, per la fascia d'eta'
function specRoom(p){
  const S=SPECS[p.spec];if(!S)return 0;
  const room=S.keys.reduce((a,k)=>a+clamp((capX(p,k)-p.s[k])/12,0,1)*lvlF(p.s[k]),0)/S.keys.length;
  return room*growLeft(p.age);
}
const specBonus=(p,keys)=>p.spec&&SPECS[p.spec]&&keys.some(k=>SPECS[p.spec].keys.includes(k))?SPEC_B*specRoom(p):0;

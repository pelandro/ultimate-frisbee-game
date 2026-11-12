/* ---- VENTO ----
   Ogni partita ha il suo vento (G.wind): calma, brezza, vento o vento forte, con una direzione. Vale per tutti allo stesso modo e, siccome le squadre
   cambiano campo a ogni meta, il vantaggio si alterna. Che cosa fa:
   - sposta il punto d'arrivo del disco nella direzione del vento, tanto di piu' quanto piu' il lancio resta in aria (sparo, hammer, blade) e quanto meno
     sa lanciare chi tira: chi ha Lancio o Sparo alti compensa quasi tutto da solo;
   - allarga la dispersione, soprattutto dei lanci alti;
   - cambia la gittata: col vento alle spalle si lancia piu' lungo senza perdere precisione, controvento meno;
   - sposta il pull di qualche metro (vedi pullPlan): le zone delle barre si muovono con il vento.
   Nei test automatici e in allenamento c'e' sempre calma (newGame azzera il vento; poi ogni modalita' lo sorteggia).
   Il vento si puo' spegnere dalle Impostazioni (G.opt.wind): allora il sorteggio da' sempre calma, in tutte le modalita'. */
const WIND_V=[0,2,4,6.5],WIND_N=['Calma','Brezza','Vento','Vento forte'];   // metri al secondo
const WIND_K=0.45,WIND_SIG=0.07,WIND_RANGE=1.2,PULL_WK=1.3;
function setWind(lv,a){lv=clamp(lv|0,0,3);G.wind={lv,a:a||0,v:WIND_V[lv],x:Math.cos(a||0)*WIND_V[lv],y:Math.sin(a||0)*WIND_V[lv]};}
// sorteggio con un generatore dato (in carriera ha il seme della partita: il meteo si conosce prima di giocare). Calma 35%, brezza 35%, vento 22%, vento forte 8%
function windFor(r){if(G.opt.wind===false)return [0,0];const u=r(),lv=u<0.35?0:(u<0.7?1:(u<0.92?2:3));return [lv,r()*Math.PI*2];}
function rollWind(r){const w=windFor(r||Math.random);setWind(w[0],w[1]);setWx(weatherFor(r||Math.random));}
/* METEO: oltre al vento puo' piovere o nevicare (G.wx: 0 sereno, 1 pioggia, 2 neve). Il disco e' bagnato o gelato: le prese sono un po' piu' difficili (WX_CATCH, in catchInfo)
   e i lanci un po' meno precisi (WX_SIG, in planThrow). Sereno 62%, pioggia 26%, neve 12%. Segue lo stesso interruttore del vento (G.opt.wind). */
const WX_N=['Sereno','Pioggia','Neve'],WX_CATCH=[0,0.03,0.04],WX_SIG=[1,1.05,1.07];
function weatherFor(r){if(G.opt.wind===false)return 0;const u=r();return u<0.62?0:(u<0.88?1:2);}
function setWx(v){G.wx=clamp(v|0,0,2);}
function windOn(skill,dx,dy,dist,T,hi,scoob){
  const W=G.wind;if(!W||!W.lv)return null;
  const expo=T*(hi?1.5:(scoob?1.2:1)),res=1-clamp(0.25+0.6*skill/100,0,0.88);   // res: la parte di deriva che il lanciatore non riesce a compensare
  return {x:W.x*WIND_K*expo*res,y:W.y*WIND_K*expo*res,k:1+WIND_SIG*W.lv*(hi?1.6:1),along:(dx*W.x+dy*W.y)/dist};
}

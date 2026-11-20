/* ---- PAVIMENTO DEL GIOCO DI SQUADRA ----
   In partita le statistiche che fanno girare il disco (Lancio, Buco, Sparo, Visione, Resistenza) non scendono sotto un pavimento morbido:
   sotto FLOW_F la distanza dal pavimento si accorcia (FLOW_K), cosi' chi e' piu' scarso resta piu' scarso ma il gioco non si inceppa.
   Senza, tra squadre deboli (Serie C, Ultimate Team con carte basse) una meta durava quasi un minuto, con 3-4 turnover e giocatori sfiniti.
   Le statistiche degli scontri uno contro uno (Velocita', Scatto, Agilita', Salto, Difesa, Tuffo, Presa) restano quelle vere.
   Vale solo in partita: applyForm e loadOpp lo mettono in p.s, l'originale resta in p.b (restoreForm) e l'Overall non cambia. */
const FLOW_KEYS=new Set(['lan','buc','spa','vis','res']),FLOW_F=60,FLOW_K=0.4;
const flowFloor=(k,v)=>FLOW_KEYS.has(k)&&v<FLOW_F?Math.round(FLOW_F-(FLOW_F-v)*FLOW_K):v;
// per le modalita' che non passano da applyForm (Ultimate Team): stessa cosa su una copia, ripristinata da restoreForm a fine partita
function flowAll(){
  for(const p of SQ.concat(T[1])){
    if(!p.b){p.b=Object.assign({},p.s);p.s=Object.assign({},p.s);}
    for(const k of FLOW_KEYS)p.s[k]=flowFloor(k,p.s[k]);
  }
}

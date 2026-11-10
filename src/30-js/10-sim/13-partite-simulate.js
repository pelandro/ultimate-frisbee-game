/* ---- partite simulate (carriera, tornei, Ultimate Team): stessa scala di forza delle partite giocate ---- */
// Ricalibrato sul motore attuale (240 partite IA contro IA tra squadre con 0-16 punti di differenza): ogni punto di forza vale 0,27 fino a 6 di scarto, 0,12 oltre
const SIM_K=0.27,SIM_KS=0.12,SIM_CAP=6,SIM_DIFF=[0,-1.3,-1.8,-1.8];
function simPointP(diff){const c=clamp(diff,-SIM_CAP,SIM_CAP);return 1/(1+Math.exp(-(SIM_K*c+SIM_KS*(diff-c))));}
function simMatch(myP,oppP,dlv){
  const p=simPointP(myP-oppP+(SIM_DIFF[dlv|0]||0));let a=0,b=0;
  while(a<MATCH_TARGET&&b<MATCH_TARGET){if(Math.random()<p)a++;else b++;}
  return {a,b,p};
}
// probabilita' di vincere la partita (ai 7 punti) data quella di vincere un punto
function matchWinP(p){
  const N=MATCH_TARGET,f=[];for(let a=0;a<=N;a++){f.push([]);for(let b=0;b<=N;b++)f[a].push(0);}
  for(let a=N;a>=0;a--)for(let b=N;b>=0;b--){if(a===N&&b===N)continue;f[a][b]=a===N?1:(b===N?0:p*f[a+1][b]+(1-p)*f[a][b+1]);}
  return f[0][0];
}

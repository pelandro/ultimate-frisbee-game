/* ---- partite simulate (carriera, tornei, Ultimate Team): stessa scala di forza delle partite giocate ---- */
// Ricalibrato dopo la P1 (intercetti lungo il volo, tagli coordinati, aperture del playbook): 6 coppie di rose diverse per ogni scarto (0-12 punti),
// circa 280 punti per scarto. Una sola pendenza spiega tutto: 0,185 per punto di forza (il gioco di squadra rende la sola forza un po' meno decisiva).
// Difficolta' dell'IA avversaria misurata allo stesso modo su circa 1200 punti per livello: Medio vale 1,5 punti di forza, Difficile 2,7.
const SIM_K=0.185,SIM_KS=0.185,SIM_CAP=12,SIM_DIFF=[0,-1.5,-2.7,-2.7];
function simPointP(diff){const c=clamp(diff,-SIM_CAP,SIM_CAP);return 1/(1+Math.exp(-(SIM_K*c+SIM_KS*(diff-c))));}
function simMatch(myP,oppP,dlv){
  const p=simPointP(myP-oppP+(SIM_DIFF[dlv|0]||0));let a=0,b=0;
  while(a<MATCH_TARGET&&b<MATCH_TARGET){if(Math.random()<p)a++;else b++;}
  return {a,b,p};
}
// infortuni nelle partite simulate: lo stesso rischio delle giocate (misurato per condizione di partenza), dimezzato perche' in carriera le due linee si alternano.
// Basso finche' la condizione resta sopra 55, poi sale fino al 3% sotto 25. inj = fattore della fisioterapia (G.injK)
const simInjP=(cond,inj)=>(0.0018+0.028*clamp((55-cond)/30,0,1))*(inj===undefined?1:inj);
function simInjuries(list,inj){
  const out=[];
  for(const p of list){if(p.inj||Math.random()>=simInjP(p.cond===undefined?100:p.cond,inj))continue;
    p.inj=Math.random()<0.1+(p.age>=32?0.07:0)?5+Math.floor(Math.random()*4):1+Math.floor(Math.random()*3);p.injNew=true;out.push(p);}   // stessa durata di checkInjuries
  return out;
}
// probabilita' di vincere la partita (ai 7 punti) data quella di vincere un punto
function matchWinP(p){
  const N=MATCH_TARGET,f=[];for(let a=0;a<=N;a++){f.push([]);for(let b=0;b<=N;b++)f[a].push(0);}
  for(let a=N;a>=0;a--)for(let b=N;b>=0;b--){if(a===N&&b===N)continue;f[a][b]=a===N?1:(b===N?0:p*f[a+1][b]+(1-p)*f[a][b+1]);}
  return f[0][0];
}

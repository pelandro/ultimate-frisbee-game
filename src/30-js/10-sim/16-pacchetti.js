/* ---- PACCHETTI DI ULTIMATE TEAM: modello delle rarita' (puro calcolo, lo usano l'interfaccia e i test) ----
   Qualita' del pacchetto q: 0 iniziale o base, 1 comprato con i gettoni, 2-5 premio del turno superato (piu' si va avanti, meglio e'), 6 vittoria del torneo.
   Ogni carta pesca prima la rarita' (tabella UT_PQ), poi l'Overall dentro la fascia della rarita' (UT_BAND). Due garanzie riducono il caso:
   - dal pacchetto di qualita' 2 c'e' sempre almeno un Raro, in quello dei campioni almeno un Epico;
   - «paracadute»: dopo UT_PITY pacchetti senza Epici o Leggende, il successivo ne contiene di sicuro uno. */
const UT_TIER=['com','unc','rar','epi','leg'];
const UT_BAND={com:[38,49],unc:[50,64],rar:[65,79],epi:[80,89],leg:[90,96]};
const UT_PQ=[   // probabilita' (%) di Comune, Non comune, Raro, Epico, Leggenda per qualita'
  [72,16,9,2.5,0.5],[60,24,12,3.2,0.8],[50,28,16,5,1],[40,30,21,7,2],[30,30,28,10,2],[20,30,34,13,3],[0,25,45,24,6]];
const UT_PITY=6;
const UT_PQN=['Pacchetto base','Pacchetto acquistato','Pacchetto bronzo','Pacchetto argento','Pacchetto oro','Pacchetto platino','Pacchetto dei campioni'];
function utTier(q,rng){const t=UT_PQ[clamp(q|0,0,6)];let r=rng()*100;for(let i=0;i<5;i++){r-=t[i];if(r<0)return i;}return 0;}
// rarita' delle n carte di un pacchetto di qualita' q; pity = pacchetti consecutivi senza Epici (ritorna anche il nuovo valore)
function utPackTiers(q,n,pity,rng){
  const out=[];for(let i=0;i<n;i++)out.push(utTier(q,rng));
  const raise=(min)=>{if(Math.max(...out)<min){let k=0;for(let i=1;i<n;i++)if(out[i]<out[k])k=i;out[k]=min;}};   // la carta peggiore sale alla rarita' garantita
  if(q>=2)raise(2);
  if(q>=6||(pity|0)+1>=UT_PITY)raise(3);
  const np=Math.max(...out)>=3?0:(pity|0)+1;
  return {tiers:out.sort((a,b)=>a-b),pity:np};
}
const utTierOvr=(t,rng)=>{const b=UT_BAND[UT_TIER[t]];return Math.round(b[0]+(b[1]-b[0])*Math.pow(rng(),1.6));};   // dentro la fascia, i valori bassi sono piu' comuni
// POTENZIAMENTI SPECIALIZZATI: ogni carta ha al massimo UT_UP_MAX potenziamenti, al massimo UT_UP_LINE per ogni linea. Ogni potenziamento alza un gruppo di
// statistiche (a meta' sopra 85), cosi' due carte della stessa forza restano diverse: una e' un lanciatore, l'altra un saltatore, l'altra un difensore.
const UT_LINES={t:{n:'Tiro',keys:['lan','buc','spa'],g:4},a:{n:'Atletico',keys:['vel','sca','agi','sal','res'],g:3},d:{n:'Difesa',keys:['dif','tuf'],g:4},m:{n:'Mani e testa',keys:['pre','vis'],g:4}};
const UT_UP_MAX=4,UT_UP_LINE=2;
const utUpCost=p=>Math.round(12+Math.max(0,p.ovr-50)*2.2+(p.up|0)*10);
const utUpWhy=(p,l)=>(p.up|0)>=UT_UP_MAX?'carta al massimo':(((p.ul&&p.ul[l])|0)>=UT_UP_LINE?'linea al massimo':'');
function utDoUp(p,l){
  const L=UT_LINES[l];if(!p.ul)p.ul={t:0,a:0,d:0,m:0};
  for(const k of L.keys)p.s[k]=Math.min(99,p.s[k]+(p.s[k]>=85?Math.max(1,Math.floor(L.g/2)):L.g));
  p.ul[l]++;p.up=(p.up|0)+1;p.ovr=ovr(p);
}

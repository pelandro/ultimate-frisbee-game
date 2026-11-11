/* ---- INTERCETTI LUNGO IL VOLO ----
   Prima l'intercetto sulla linea di passaggio veniva deciso all'arrivo del disco, con le posizioni dei difensori al momento del lancio.
   Ora si guarda il disco fotogramma per fotogramma: un difensore puo' toccarlo solo se il disco gli passa davvero a portata di braccio
   (distanza in pianta) e ad altezza raggiungibile (con il Salto). La probabilita' dipende da Difesa, distanza, altezza, velocita' del disco
   e da quanto il difensore ha avuto il tempo di reagire. Chi e' vicino alla traiettoria e la legge in tempo prova anche a tagliarla (laneRead).
   Vicino al lanciatore decide l'handblock, vicino all'arrivo la presa o il duello (landDisc): li' il volo non viene controllato. */
// tarati su 20 partite per schema perche' gli intercetti restino quelli di prima (circa 2 a partita contro la difesa a uomo, 7-9 contro la zona)
const LANE_P=0.9,LANE_ZONE=2.3,LANE_SEE=5,LANE_END=2.2;   // probabilita' di base, bonus della zona (sa dove passano i lanci), raggio di lettura (m), zone escluse agli estremi (m)
const discZ=(f,s)=>lerp(1.1,0.3,s)+4*f.H*s*(1-s);   // altezza del disco (m) nel punto s del volo: la stessa che disegna l'interfaccia
const reachZ=q=>2.15+0.8*q.s.sal/100+(hasT(q,'sky')?0.2:0);   // fin dove arriva con la mano, saltando
const laneR=(q,zone)=>(0.55+0.45*q.s.agi/100)*(zone?1.8:1);   // quanto si allunga di lato (la zona copre gli spazi tra i ricevitori)
const reactOf=q=>clamp(0.32-q.s.dif*0.0015+(0.6-q.s.vis/100)*0.4,0.1,0.6)*AIK(q.t).react;   // secondi prima di reagire a un lancio
const sToU=(f,s)=>f.e>=1?1-Math.pow(1-s,1/f.e):Math.pow(s,f.e);   // inverso di flightS: in che momento il disco e' al punto s
const zoneDef=f=>((f.team===0?G.opp.def:G.sch.def)==='zone');
// al lancio: chi vede passare il disco vicino e fa in tempo ad arrivarci si sposta sulla traiettoria (chi lo insegue verso l'arrivo resta com'e')
function laneRead(f){
  const zone=zoneDef(f);
  for(const q of T[1-f.team]){
    if(q.fl||(q===G.ctrl&&G.cdir))continue;
    const rq=reactOf(q),rz=reachZ(q);
    for(let i=2;i<=8;i++){
      const s=i/10,P=flightAt(f,s),t=sToU(f,s)*f.T;
      if(hyp(P.x-f.sx,P.y-f.sy)<LANE_END||hyp(P.x-f.tx,P.y-f.ty)<LANE_END||discZ(f,s)>rz)continue;
      if(hyp(P.x-q.x,P.y-q.y)>LANE_SEE*(zone?1.3:1))continue;
      if(rq+ttr(q,P.x,P.y)<=t+0.05){if(Math.random()<(0.3+0.5*q.s.vis/100)*(zone?1.25:1)){q.fl={x:P.x,y:P.y};q.flD=rq;}break;}
    }
  }
}
// per la mira: il difensore che farebbe in tempo a mettersi sulla traiettoria di questo lancio (stesso criterio di laneRead, senza il caso), e dove.
// Non decide nulla: serve solo a far vedere il rischio a chi sta mirando. pl = progetto del lancio (planThrow)
function aimThreat(th,pl){
  const f={sx:pl.sx,sy:pl.sy,tx:pl.tx,ty:pl.ty,cx:pl.cx,cy:pl.cy,e:pl.e,T:pl.T,H:pl.H,team:th.t},zone=zoneDef(f);
  let best=null,bm=-1;
  for(const q of T[1-th.t]){
    if(q===G.marker)continue;const rq=reactOf(q),rz=reachZ(q);
    for(let i=2;i<=8;i++){
      const s=i/10,P=flightAt(f,s),t=sToU(f,s)*f.T;
      if(hyp(P.x-f.sx,P.y-f.sy)<LANE_END||hyp(P.x-f.tx,P.y-f.ty)<LANE_END||discZ(f,s)>rz)continue;
      if(hyp(P.x-q.x,P.y-q.y)>LANE_SEE*(zone?1.3:1))continue;
      const mg=t+0.05-rq-ttr(q,P.x,P.y);
      if(mg>=0&&mg>bm){bm=mg;best={q,x:P.x,y:P.y};}
    }
  }
  return best;
}
// durante il volo: ogni difensore ha una sola occasione, nel punto in cui il disco gli passa piu' vicino
function laneCheck(f,P,z){
  if(f.t<0.12||hyp(P.x-f.sx,P.y-f.sy)<LANE_END||hyp(P.x-f.tx,P.y-f.ty)<LANE_END)return false;
  const zone=zoneDef(f),M=f.lnm||(f.lnm=new Map());
  for(const q of T[1-f.team]){
    const e=M.get(q);if(e&&e.done)continue;
    const R=laneR(q,zone),rz=reachZ(q),dh=hyp(q.x-P.x,q.y-P.y),inside=dh<=R&&z<=rz;
    if(inside&&(!e||dh<e.d)){M.set(q,{d:dh,z,t:f.t,R,rz});continue;}   // si sta ancora avvicinando
    if(!e)continue;
    e.done=true;   // il disco si allontana: e' il momento di provarci
    const fd=0.55+0.5*clamp((q.s.dif-40)/60,0,1),close=1-0.6*e.d/e.R,high=e.z>e.rz-0.45?0.55:1,fast=clamp(1.3-f.sp.v/40,0.55,1),late=e.t<reactOf(q)?0.5:1;
    if(Math.random()<LANE_P*fd*close*high*fast*late*(zone?LANE_ZONE:1)){
      G.st.lane[q.t]++;G.diveWin=null;G.dive=null;G.hold=false;G.sprint=null;G.aiSprint=[];
      finishTurn(f,q,e.z>2.3?'Intercetto in salto!':'Intercetto!',{x:P.x,y:P.y});
      return true;
    }
  }
  return false;
}

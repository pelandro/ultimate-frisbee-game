/* ===================== OBIETTIVI DELLO SPONSOR =====================
   I tre contratti (26-economia-partita.js) hanno tre obiettivi diversi, tarati sulla forza del club nella sua divisione:
   ambizioso = fare meglio di quanto ci si aspetta, equilibrato = vicino alla posizione attesa, sicuro = alla portata ma mai banale
   (per un club di meta' classifica non e' la sola salvezza). Il club che ha il Campionato europeo da giocare, nel contratto ambizioso ha anche il risultato europeo.
   La posizione attesa mescola la forza vera della rosa e l'ordine che si vede nella scelta della squadra: il secondo pesa sempre meno, perche' dopo qualche anno
   conta solo la rosa che hai costruito. Dalla seconda stagione si sposta anche verso il piazzamento dell'ultimo campionato (objLast). Il giudizio a fine stagione e' qui (objMet), usato da Italia, leghe europee e bilancio previsionale. */
function objExp(names,cat,pow){
  const w=Math.max(0,0.5-0.1*((SV.season|0)-1)),P=pow||teamPow;
  const zf=f=>{const v=names.map(f),m=v.reduce((a,b)=>a+b,0)/v.length,s=Math.sqrt(v.reduce((a,b)=>a+(b-m)*(b-m),0)/v.length)||1;return n=>(f(n)-m)/s;};
  const zr=zf(P),zc=zf(n=>{const c=cat?cat(n):NaN;return isFinite(c)?c:P(n);});
  const sc=n=>w*zc(n)+(1-w)*zr(n);
  return names.slice().sort((a,b)=>sc(b)-sc(a)).indexOf(SV.team)+1;
}
// i tre traguardi (posizioni) per un club che ci si aspetta chiuda `exp`-esimo su n; `safe` = la posizione piu' bassa che ha ancora senso chiedere (salvezza)
function objTargets(exp,n,safe){
  let amb=Math.max(1,Math.round(exp*(0.5+0.2*exp/n))),bal=exp+(exp>=5?1:0),   // la tua rosa parte un po' sotto quella delle altre (userRoster): dal quinto posto in giu' si chiede un posto in meno
      sic=Math.min(exp+Math.max(2,Math.round(exp*0.3)),safe);
  bal=Math.max(bal,amb+1);sic=Math.max(sic,bal+1);   // tre obiettivi diversi, dal piu' difficile al piu' facile
  sic=Math.min(sic,n-1);bal=Math.min(bal,sic-1);amb=Math.max(1,Math.min(amb,bal-1));
  return {sic,bal,amb};
}
const euOn=()=>!!(SV.euUnlocked&&SV.eu&&SV.eu.state==='on'&&!isUS()&&(isLN()?lnTiers().findIndex(t=>t.id===SV.ln.tier)===0:SV.sr==='A'));
const euStageNow=()=>SV.eu&&SV.eu.nat?(SV.eu.stage|0):-1;   // 0 girone, 1 prequarti, 2 quarti, 3 semifinale, 4 finale (e titolo)
// com'e' fatta la divisione in cui giochi: quante squadre, chi sale, chi scende, quanti posti per l'Europa
function objCtx(){
  if(isLN()){
    const comp=lnComp(),D=lnSeasonDef(SV.lk,SV.ln.T),tiers=D.tiers,ti=tiers.findIndex(t=>t.id===SV.ln.tier),n=comp.clubs.length,down=ti<tiers.length-1?D.mv[ti]:0,up=ti>0?D.mv[ti-1]:0;
    return {names:comp.clubs,n,cat:x=>LN_BY[x]?LN_BY[x].p:NaN,pow:lnP,up,safe:n-(down||1),
      title:ti===0?`Titolo ${D.de}`:`Primo posto in ${tiers[ti].name}`,upTxt:ti>0?`Promozione in ${tiers[ti-1].name}`:'',eu:ti===0?D.eu:0,
      low:t=>down?`Salvezza (non tra le ultime ${down})`:'Non chiudere ultimi'};
  }
  const names=SV.mem[SV.sr],n=names.length,top=SV.sr==='A';
  return {names,n,cat:x=>TEAM[x]?TEAM[x].power:NaN,pow:teamPow,up:top?0:PROMO,safe:n-PROMO,
    title:top?'Scudetto':`Primo posto in ${SERIES_NAME[SV.sr]}`,upTxt:`Promozione in ${SERIES_NAME[SV.sr==='C'?'B':'A']}`,eu:top?3:0,
    low:t=>t>=n-1?'Non chiudere ultimi':(SV.sr==='C'?'Fuori dalle ultime '+PROMO:'Salvezza (non tra le ultime '+PROMO+')')};
}
function objMk(t,c,exp,k){
  const o={tgt:t,exp};
  if(t<=1)o.txt=c.title;
  else if(c.up>=2&&t===c.up){o.promo=1;o.txt=c.upTxt;}
  else if(c.eu&&t===c.eu)o.txt=`Posto all’EUCF (prime ${t})`;
  else if(t>=c.safe)o.txt=c.low(t);
  else o.txt=`Prime ${t} in classifica`;
  let rw=(36+(c.n-t)*4)*ECO.K()*SP_KIND[k].rw;
  if(k==='amb'&&euOn()&&c.eu){   // chi ha l'Europa da giocare: il contratto ambizioso chiede anche la strada nel torneo
    o.eu=exp<=2?3:2;o.txt+=` + ${o.eu===3?'semifinale':'quarti di finale'} all’EUCF`;rw*=1.35;
  }
  o.reward=Math.round(rw);
  return o;
}
function objFor(k,exp){
  const c=objCtx(),T=objTargets(exp,c.n,c.safe);
  return objMk(T[k],c,exp,k);
}
// l'ultimo campionato conta: se l'hai giocato nella stessa divisione (SV.lastRk, scritto da endSeason, lnEndSeason e usEndSeason), la posizione attesa si sposta
// verso dove sei arrivato. Chi vince con una rosa normale riceve comunque obiettivi ambiziosi; dopo una stagione storta lo sponsor e' piu' cauto,
// ma ricorda la rosa che hai (verso il basso si sposta di meno). Dopo una promozione, una retrocessione o un cambio di club conta solo la rosa.
const OBJ_LAST_UP=0.65,OBJ_LAST_DN=0.35;
function objLast(exp,n){
  const L=SV.lastRk;
  if(!L||L.s!==(SV.season|0)-1||L.t!==SV.team||L.lk!==SV.lk||L.sr!==SV.sr||!(L.n>1))return exp;
  const r=clamp(Math.round(1+(L.rank-1)*(n-1)/(L.n-1)),1,n);   // se il numero di squadre e' cambiato, la stessa posizione in proporzione
  return clamp(Math.round(exp+(r-exp)*(r<exp?OBJ_LAST_UP:OBJ_LAST_DN)),1,n);
}
// l'obiettivo "della dirigenza" = quello equilibrato; gli altri due si ricavano dalla stessa posizione attesa
function objBase(){
  const c=objCtx(),exp=objLast(objExp(c.names,c.cat,c.pow),c.n);
  SV.obj=objFor('bal',exp);
}
// raggiunto? (fine stagione, o stima nel bilancio). x.promoted: salito di serie; x.tit: campione (in Serie A lo decidono i playoff)
function objMet(rank,x){
  const o=SV.obj;if(!o)return false;
  let ok=o.title?!!x?.tit:o.promo?(x&&x.promoted!==undefined?!!x.promoted:rank<=o.tgt):(rank<=o.tgt||(o.tgt===1&&!!(x&&x.tit)));
  if(ok&&o.eu)ok=euStageNow()>=o.eu;
  return ok;
}
// ---- USA: la scala va dalla Conference ai Nationals ----
const US_RUNG=[
  {id:'c5',lvl:0,cr:5,txt:'Prime 5 della Conference',tgt:5,rw:14},
  {id:'c4',lvl:0,cr:4,txt:'Prime 4 della Conference',tgt:4,rw:20},
  {id:'c3',lvl:0,cr:3,txt:'Prime 3 della Conference',tgt:3,rw:26},
  {id:'pin',lvl:1,txt:'Play-in (i posti dipendono dalla regione)',tgt:3,rw:30},
  {id:'nat',lvl:2,txt:'Qualificazione ai Nationals',tgt:4,rw:44},
  {id:'qf',lvl:4,txt:'Quarti di finale ai Nationals',tgt:3,rw:54},
  {id:'sf',lvl:5,txt:'Semifinale ai Nationals',tgt:2,rw:62},
  {id:'tit',lvl:7,txt:'Titolo nazionale',tgt:1,rw:90}
];
const usRungBal=exp=>exp<=2?6:(exp<=6?5:(exp<=14?4:(exp<=24?3:(exp<=36?2:1))));   // gradino equilibrato secondo la posizione attesa tra i 48 club
function usObjFor(k,exp){
  const j=clamp(usRungBal(exp)+(k==='sic'?-1:(k==='amb'?1:0)),0,US_RUNG.length-1),o=US_RUNG[j];
  return {id:o.id,lvl:o.lvl,cr:o.cr,tgt:o.tgt,txt:o.txt,exp,reward:Math.round(o.rw*SR_K.U/1.65*SP_KIND[k].rw)};
}

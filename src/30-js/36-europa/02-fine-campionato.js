// I salvataggi precedenti possono avere già un'edizione da finire. La qualifica appena ottenuta
// resta valida anche in quel caso, senza sovrascrivere il torneo già sorteggiato.
const euActive=()=>!!(SV.euUnlocked&&SV.eu?.state==='on');
const euQualifiedPending=()=>!!(SV.next?.qual&&!SV.eu?.postSeason);
const euBeforeNewSeason=()=>!!(SV.done&&(euActive()||euQualifiedPending()));

function openSeasonEurope(){
  if(!euBeforeNewSeason())return false;
  if(!euActive()){
    SV.eu={...newEu(SV.season),postSeason:true};
    SV.euUnlocked=true;
  }
  SV.event='eu';
  euEnsure();
  persist();
  return true;
}


// Una stagione Women già chiusa prima dell'introduzione dell'EUCF ha ancora la classifica finale.
function euRestoreWomenQualification(){
  if(!SV.done||!SV.next||SV.next.euQ?.length||SV.euUnlocked||!lnWomenNow()||!euTier()||!SV.ln?.ord)return;
  const order=lnCompOrder(SV.ln.ord,SV.ln.F),quota=LN_DEF[SV.lk].eu;
  SV.next.euQ=euField(SV.lk,order.slice(0,quota),order[quota]);
  SV.next.qual=SV.next.euQ.includes(SV.team);
}

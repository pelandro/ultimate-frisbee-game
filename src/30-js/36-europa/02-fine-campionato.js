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

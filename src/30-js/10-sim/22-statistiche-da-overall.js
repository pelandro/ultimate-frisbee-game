/* ---- STATISTICHE DA UN OVERALL: un giocatore con l'Overall voluto, esatto ----
   Il ruolo da' il profilo (handler = lanci, cutter = fisico, defender = difesa e agilita'), che a livelli alti si appiattisce; si cerca per bisezione la media
   che da' proprio quell'Overall. Serve a Ultimate Team, ai giocatori veri dei club europei e americani e, qui sotto, ai giocatori italiani con un Overall assegnato
   (rows con `ov` in realRoster). Il rumore usa il generatore del giocatore: stesso seme, stesse statistiche. */
const UT_OFF={D:{lan:-8,buc:-9,spa:-9,vis:1,dif:13,sal:6,sca:5,tuf:8,vel:6,res:5,pre:-3,agi:6},H:{lan:8,buc:8,spa:8,vis:5,dif:-7,sal:-7,sca:-7,tuf:-7,vel:-7,res:-7,pre:-2,agi:-5},C:{lan:-9,buc:-9,spa:-9,vis:-3,dif:7,sal:7,sca:7,tuf:7,vel:7,res:7,pre:6,agi:7}};
// statistiche di un giocatore con media (ovr) data: il ruolo da' il profilo (handler = lanci, cutter = fisico), che a livelli alti si appiattisce
function utStats(role,ovr,rng){
  const sc=ovr>=60?Math.max(0.2,1-(ovr-60)/45):1,off=UT_OFF[role],noise={};
  for(const k of KEYS)noise[k]=(rng()-0.5)*8;
  const mk=b=>{const st={};for(const k of KEYS)st[k]=clamp(Math.round(b+off[k]*sc+noise[k]),25,99);return st;};
  let lo=0,hi=150;
  const rr=role==='H'?'H':'C';   // il valore della carta e' l'Overall nel ruolo (come in carriera), non la media di tutte le statistiche
  for(let i=0;i<26;i++){const mid=(lo+hi)/2,st=mk(mid);if(ovrX({s:st,r:rr})<ovr)lo=mid;else hi=mid;}
  return mk((lo+hi)/2);
}
// handler che gioca soprattutto nella linea di difesa (un «portatore» della difesa): stesso Overall da handler, ma difesa, agilita' e velocita' piu' alte e meno lanci,
// cosi' le linee consigliate lo mettono in difesa (tra gli handler e' quello col valore piu' alto da difensore). L'Overall resta quello voluto
function statsLineaDifesa(st,ovr){
  const target=ovr-1.2;
  for(let i=0;i<40&&rate(st,'D')<target;i++){
    for(const k of ['dif','agi','vel','tuf','sca'])st[k]=Math.min(99,st[k]+1);
    for(let g=0;g<40&&rate(st,'H')>ovr+0.4;g++){const k=['lan','buc','spa'].sort((a,b)=>st[b]-st[a])[0];st[k]=Math.max(25,st[k]-1);}
  }
  for(let g=0;g<40&&rate(st,'H')<ovr-0.4;g++){const k=['lan','buc','spa'].sort((a,b)=>st[a]-st[b])[0];st[k]=Math.min(99,st[k]+1);}
  return st;
}

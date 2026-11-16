/* ---- STADI E PUBBLICO DELLE PARTITE DI CARRIERA ----
   Che campo e quanta gente si vedono in partita: chi gioca in casa (venueOf), l'impianto (la serie, e per il tuo stadio le Tribune) e il pubblico,
   con gli stessi spettatori dei conti della partita (attendance) quando giochi in casa. Lo disegna 20-ui/17-stadi-pubblico.js (G.vn) e lo riassume
   la riga «Pubblico» della schermata Partita. Niente di salvato: tutto si ricalcola dalla carriera, quindi ogni campo e' sempre uguale a se stesso. */
// impianto tipico della serie: 0 campo comunale, 1 campo con tribuna, 2 stadio
function lgStadTier(){
  if(isUS())return 1;
  if(isLN()){const i=lnTiers().findIndex(t=>t.id===SV.ln.tier);return i<=0?2:(i===1?1:0);}
  return SV.sr==='A'?2:(SV.sr==='B'?1:0);
}
const myStadTier=()=>{const l=facLv('stad');return l>=4?2:(l>=2?1:0);};   // il tuo impianto cresce con le Tribune: gradoni dal livello 2, stadio dal 4
// in campo neutro a centrocampo c'e' il nome della manifestazione
const neutralName=()=>SV.event==='eu'?'EUCF':(isUS()?'NATIONALS':(isLN()?'FINALI':'FINALE'));
function careerVenue(m){
  m=m||nextMatch();if(!m)return null;
  const v=venueOf(),K=Math.sqrt(ECO.K()),imp=phaseImp(),derby=v!=='N'&&m.name===SV.riv&&SV.event==='camp';
  const o={v,home:null,tier:0,n:0,cap:0,my:0.5,big:derby||imp>1,ev:'',spon:'',care:-1};
  if(v==='H'){
    const a=attendance(m,'H');Object.assign(o,{home:SV.team,tier:myStadTier(),n:a.att,cap:a.cap,my:0.1,care:facLv('camp')});   // my: i pochi tifosi ospiti
    if(SV.sp&&SV.sp.name)o.spon=SV.sp.name;   // il tuo sponsor sui cartelloni di casa
  }else if(v==='A'){
    // lo stadio avversario: quello della serie, piu' grande per i club di nome; si riempie di piu' per i club di nome e le partite che contano
    const lv=clamp(clubLvl(m.name),0,1),tier=clamp(lgStadTier()+(lv>0.75?1:0)-(lv<0.25?1:0),0,2),cap=Math.round(450*K*(1+0.8*tier));
    const n=Math.round(cap*clamp(0.3+0.45*lv+(interestOf(m)-1)*0.9,0.2,1));
    Object.assign(o,{home:m.name,tier,n,cap,my:clamp(0.05+fansOf()/100*0.22,0.05,0.27)});   // i tuoi tifosi in trasferta: pochi, di piu' con tanti tifosi
  }else{
    const cap=Math.round(450*K*3.2),fill=clamp(0.5+0.22*(imp-1),0.5,1);
    Object.assign(o,{tier:2,cap,n:Math.round(cap*fill),my:clamp(0.3+fansOf()/100*0.25,0.3,0.55),ev:neutralName()});
  }
  o.fill=o.cap?clamp(o.n/o.cap,0.04,1):0.4;
  return o;
}
// riga della schermata Partita: quanta gente aspettarsi
function crowdTxt(m){
  const c=careerVenue(m);if(!c)return '';
  if(c.v==='H')return `Pubblico: circa ${c.n} su ${c.cap} posti${c.n>=c.cap?' (tutto esaurito)':''}`;
  if(c.v==='A')return `Pubblico: circa ${c.n}, di cui ${Math.max(1,Math.round(c.n*c.my))} tuoi tifosi`;
  return `Pubblico: circa ${c.n} (campo neutro)`;
}

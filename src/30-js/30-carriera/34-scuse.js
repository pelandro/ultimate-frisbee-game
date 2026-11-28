/* ---- SCUSE: con il morale basso i giocatori trovano scuse per non giocare o arrivano in cattive condizioni ----
   Sono imprevisti (stessa finestra, SV.evt) ma con un sorteggio a parte: nessun intervallo fisso, la probabilita' cresce quando il morale scende ed e' piu' alta
   nelle serie minori. Ogni scusa compare solo sotto la sua soglia di morale: le piu' leggere per prime.
   Effetti: p.inj/p.abs (salta le partite), p.hang (statistiche ridotte nella prossima partita), p.raise (stipendio piu' alto fino a fine stagione). */
const SCUSE_MOR=55,SCUSE_P=0.08,SCUSE_STEP=0.01,SCUSE_MAX=0.5,SCUSE_FIT=10,SCUSE_RAISE=0.2,SCUSE_NO=6;
const HANG_RAVE=0.15,HANG_FUMO=0.2;
// quanto pesa il livello del campionato: 1 nell'ultima serie, 0,8 in quelle di mezzo, 0,6 nella principale (e nei campionati a un solo livello)
function scuseTierK(){
  if(isUS())return 0.6;
  if(isLN()){const t=lnTiers(),i=t.findIndex(x=>x.id===SV.ln.tier);return t.length<2||i<=0?0.6:(i===t.length-1?1:0.8);}
  return SV.sr==='C'?1:(SV.sr==='B'?0.8:0.6);
}
const scuseChance=()=>SV.mor<SCUSE_MOR?Math.min(SCUSE_MAX,SCUSE_P+(SCUSE_MOR-SV.mor)*SCUSE_STEP)*scuseTierK():0;
// a chi puo' capitare: di preferenza a chi e' in una linea (una scusa di una riserva non si sentirebbe); chi salta partite solo se ne restano abbastanza
function scuseChi(o){
  if(o.salta&&SQ.filter(p=>!p.inj).length<SCUSE_FIT)return null;
  const ok=SQ.filter(p=>!p.inj&&!p.hang&&(!o.adulti||p.age>=18)&&(!o.f||o.f(p))),inL=ok.filter(p=>SV.lineO.includes(p.full)||SV.lineD.includes(p.full)),L=inL.length?inL:ok;
  return L.length?{f:L[Math.floor(Math.random()*L.length)].full}:null;
}
const scusaNome=a=>{const p=byFull(a.f);return p?pname(p):'Un giocatore';};
function scusaFuori(a,n,abs){const p=byFull(a.f);if(p){p.inj=n;p.abs=abs?1:0;p.injNew=false;fixLines();}}
function scusaGiu(a,k){const p=byFull(a.f);if(p)p.hang=k;return `Nella prossima partita le sue statistiche calano del ${Math.round(k*100)}%.`;}
const SCUSE={
  rave:{mor:55,adulti:true,t:a=>['Notte lunga',`${scusaNome(a)} la sera prima della partita era a un rave.`],
    o:a=>[['Capito',()=>scusaGiu(a,HANG_RAVE)]]},
  judo:{mor:50,salta:true,t:a=>['Lezione di judo',`${scusaNome(a)} ha una lezione di judo proprio il giorno della prossima partita.`],
    o:a=>[['Capito',()=>{scusaFuori(a,1,true);return 'Salta la prossima partita.';}]]},
  basket:{mor:45,salta:true,t:a=>['Basket al parchetto',`${scusaNome(a)} ha preso una storta giocando a basket con gli amici al parchetto.`],
    o:a=>[['Capito',()=>{scusaFuori(a,2,false);return 'Infortunio: salta due partite.';}]]},
  fumo:{mor:40,adulti:true,t:a=>['Riflessi lenti',`${scusaNome(a)} ha fumato troppe canne prima di giocare.`],
    o:a=>[['Capito',()=>scusaGiu(a,HANG_FUMO)]]},
  ferie:{mor:35,adulti:true,f:p=>!p.raise,t:a=>{const p=byFull(a.f);return ['Vacanze in coppia',`${scusaNome(a)} deve andare in vacanza con ${p&&p.f?'il fidanzato':'la fidanzata'} e chiede un aumento di stipendio del ${Math.round(SCUSE_RAISE*100)}%.`];},
    o:a=>[[`Accetta: stipendio +${Math.round(SCUSE_RAISE*100)}% fino a fine stagione`,()=>{const p=byFull(a.f);if(p)p.raise=SCUSE_RAISE;return 'Aumento concesso: resta sereno fino a fine stagione.';}],
      [`Rifiuta: −${SCUSE_NO} morale`,()=>{SV.mor=clamp(SV.mor-SCUSE_NO,0,100);return 'Aumento rifiutato: lo spogliatoio mormora.';}]]}
};
for(const k in SCUSE){const s=SCUSE[k];EVT['sc_'+k]={w:0,ok:()=>false,mk:()=>scuseChi(s),t:s.t,o:s.o};}   // peso 0: non escono dal sorteggio degli imprevisti normali
// dopo ogni partita di campionato, se non c'e' gia' un imprevisto in attesa
function rollScusa(force){
  if(SV.evt||SV.event!=='camp'||SV.done||SV.fired)return;
  const pr=scuseChance();if(!force&&(!pr||Math.random()>=pr))return;   // con il morale alto non si tira nemmeno il dado: la carriera resta quella di prima
  const ids=Object.keys(SCUSE).filter(k=>SV.mor<SCUSE[k].mor&&scuseChi(SCUSE[k]));if(!ids.length)return;
  const k=ids[Math.floor(Math.random()*ids.length)],a=scuseChi(SCUSE[k]);
  SV.evt={id:'sc_'+k,a};
}

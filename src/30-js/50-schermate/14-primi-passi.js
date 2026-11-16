/* ---- PRIMI PASSI: il tutorial nelle prime partite ----
   Nelle prime tre partite (di qualsiasi modalita', allenamento escluso) compaiono schede che spiegano come si gioca, una per volta e nel momento in cui servono:
   obiettivo, pull, ricezione, lancio, chiamate ai compagni, stall, lancio alto, difesa, isolamento, schemi, cambi e simulazione, dopo la meta. Ogni scheda ferma il gioco (G.paused) finche' non si preme
   «Capito» (o Invio/Spazio); «Salta il tutorial» le spegne tutte. Cio' che hai gia' visto resta segnato sul dispositivo (chiave «ultimate-primi»).
   Si riaccendono dalle Opzioni (Suggerimenti: no, poi sì); con Suggerimenti spenti non compaiono. Le regole del gioco non cambiano: e' solo interfaccia. */
const PP_KEY='ultimate-primi',PP_MAXM=3;
let PP={d:[],m:0,off:0};   // d: schede viste, m: partite iniziate con il tutorial, off: spento (saltato o finito)
try{const o=JSON.parse(localStorage.getItem(PP_KEY)||'null');if(o&&Array.isArray(o.d))PP={d:o.d.filter(x=>typeof x==='string').slice(0,20),m:o.m|0,off:o.off?1:0};}catch(e){}
const ppSave=()=>{try{localStorage.setItem(PP_KEY,JSON.stringify(PP));}catch(e){}};
function ppReset(){PP={d:[],m:0,off:0};ppSave();}
const ppHold=()=>{const h=G.holder;return !!(h&&h.t===0&&!G.flight&&G.mode==='play'&&G.freeze<=0&&!G.zoomHold&&!G.walk&&!G.pull);};   // il disco e' tuo e puoi lanciare
const PP_STEPS=[
  {id:'goal',t:'Come si gioca',x:'Si segna prendendo il disco dentro la meta avversaria. Chi ha il disco non può correre: si avanza solo passandolo. Vince chi arriva prima a 7 mete (11 o 15 nelle partite più lunghe).',when:()=>G.mode==='ready'},
  {id:'pull',t:'Il pull',x:'Ogni punto comincia con il pull: lanci il disco lungo agli avversari, che poi attaccano. Tocca due volte: la prima ferma la POTENZA nel verde, la seconda la DIREZIONE al centro. Più il disco cade in fondo, più la tua difesa parte avvantaggiata.',when:()=>pullMineNow()},
  {id:'recv',t:'Ricevi il pull',x:'Stavolta il pull lo tira l’avversario: attacchi tu. Appena un tuo giocatore ha il disco puoi lanciare; i compagni si smarcano da soli.',when:()=>G.mode==='ready'&&G.pullTeam===1&&!G.schemeOpen},
  {id:'throw',t:'Lanciare',x:'Appoggia il dito dove vuoi, trascinalo all’indietro come una fionda e rilascia. L’arco mostra dove arriva il disco, il cerchio tratteggiato di quanto può sbagliare. Lancia dove il compagno sta correndo, non dove si trova.',when:()=>ppHold()},
  {id:'calls',t:'Chiamare i compagni',x:'Tocca un compagno, senza trascinare, per chiamargli un taglio: si smarca e tu gli lanci. Tocca chi ha il disco per rimettere tutti in posizione.',when:()=>ppHold()&&(G.st.thr[0]|0)>=1&&G.holdT>0.8},
  {id:'stall',t:'Il conteggio (stall)',x:'Quando un difensore ti marca, conta fino a 10: lo vedi scritto in alto («Stall 3»…). A 10 perdi il disco, quindi quando il numero sale passa subito, anche corto.',when:()=>ppHold()&&G.stallT>=2.5&&!!G.marker},
  {id:'alto',t:'Lancio alto',x:'Per il lancio alto tocca due volte in un punto libero del campo e tieni giù il secondo tocco per mirare (oppure usa due dita). Scavalca il marcatore; sui lanci lunghi è più lento e meno preciso.',when:()=>ppHold()&&(G.st.thr[0]|0)>=3&&G.holdT>1.2},
  {id:'def',t:'In difesa',x:()=>defMan()?'Ora attacca l’avversario. Trascina il dito per guidare il difensore con l’anello azzurro. Quando compare un cerchio che si stringe, premi la mano (handblock) o TUFFO mentre arriva sull’anello interno.':'Ora attacca l’avversario e i tuoi difendono da soli. «Marcatura» sceglie se stare dietro o davanti all’uomo; «Salta» fa giocare il loro attacco in un attimo. Se il gioco rallenta e compare un cerchio, tocca quando si chiude per tuffarti.',when:()=>G.mode==='play'&&inDefense()&&!!G.holder&&G.holder.t===1&&!G.diveWin},
  {id:'iso',t:'Isolamento',x:'Tieni premuto su un compagno: taglia solo lui e gli altri gli liberano lo spazio. Usalo con il tuo giocatore più veloce.',when:()=>ppHold()&&(G.st.thr[0]|0)>=2&&G.holdT>1.5},
  {id:'schemi',t:'Gli schemi',x:'A inizio meta «Schemi» sceglie come attaccare e come difendere. Nessuno schema vince sempre: nel menu trovi cosa batte e cosa soffre ognuno (la zona, per esempio, ferma il Verticale ma soffre l’Orizzontale).',when:()=>G.mode==='ready'&&G.pointNo>=3&&!G.schemeOpen},
  {id:'sim',t:'Cambi, Simula e Pausa',x:'Accanto a «Schemi» trovi «Cambi» (chi gioca) e «Simula meta» (la gioca il computer). Il tasto II in alto ferma la partita: da lì «Sospendi» la salva per continuare più tardi. Tutto il resto lo trovi nel Tutorial completo, dal menu.',when:()=>G.mode==='ready'&&G.pointNo>=4&&!G.schemeOpen},
  {id:'next',t:'Dopo la meta',x:'Dopo ogni meta si cambia campo e chi ha segnato tira il pull. Quando hai il disco puoi chiamare un Timeout (uno a partita, in basso a sinistra): azzera lo stall e fa riprendere fiato.',when:()=>G.mode==='ready'&&G.pointNo>=2}
];
let ppCur=null,ppWas=false;
const ppOkNow=()=>tipsOn()&&!PP.off&&PP.d.length<PP_STEPS.length&&!!G.inMatch&&!G.drill&&!DR.on&&!G.skip;
function ppShow(s){
  ppCur=s;G.paused=true;drag=null;aimPid=null;ddrag=null;G.cdir=null;G.high=false;G.hold=false;
  $('ppN').textContent=`Primi passi · ${Math.min(PP.d.length+1,PP_STEPS.length)} di ${PP_STEPS.length}`;
  $('ppT').textContent=s.t;$('ppX').textContent=typeof s.x==='function'?s.x():s.x;
  $('pp').classList.remove('hidden');
}
function ppClose(all){
  $('pp').classList.add('hidden');
  if(ppCur&&!PP.d.includes(ppCur.id))PP.d.push(ppCur.id);
  if(all||PP.d.length>=PP_STEPS.length)PP.off=1;
  ppSave();ppCur=null;G.paused=false;
}
function ppTick(){
  const inM=!!G.inMatch&&!G.drill&&!DR.on;
  if(ppCur&&!G.inMatch){$('pp').classList.add('hidden');ppCur=null;}   // la partita e' finita o abbandonata con la scheda aperta
  if(inM&&!ppWas&&!PP.off){PP.m++;if(PP.m>PP_MAXM)PP.off=1;ppSave();}   // il tutorial dura le prime tre partite
  ppWas=inM;
  if(ppCur||!ppOkNow()||G.paused||G.mode==='cine'||G.mode==='banner'||RP.on||overlayBusy())return;
  for(const s of PP_STEPS)if(!PP.d.includes(s.id)&&s.when()){ppShow(s);return;}
}
$('ppOk').addEventListener('click',()=>ppClose(false));
$('ppSkip').addEventListener('click',()=>ppClose(true));
// con la scheda aperta Invio e Spazio la chiudono e nessun altro tasto arriva al gioco
window.addEventListener('keydown',e=>{
  if(!ppCur)return;
  e.stopImmediatePropagation();e.preventDefault();
  if(!e.repeat&&(e.code==='Enter'||e.code==='Space'||e.code==='NumpadEnter'))ppClose(false);
},true);

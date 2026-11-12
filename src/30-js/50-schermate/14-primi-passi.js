/* ---- PRIMI PASSI: il tutorial nelle prime partite ----
   Nelle prime tre partite (di qualsiasi modalita', allenamento escluso) compaiono schede che spiegano come si gioca, una per volta e nel momento in cui servono:
   obiettivo, pull, ricezione, lancio, chiamate ai compagni, stall, lancio alto, difesa, dopo la meta. Ogni scheda ferma il gioco (G.paused) finche' non si preme
   «Capito» (o Invio/Spazio); «Salta il tutorial» le spegne tutte. Cio' che hai gia' visto resta segnato sul dispositivo (chiave «ultimate-primi»).
   Si riaccendono dalle Opzioni (Suggerimenti: no, poi sì); con Suggerimenti spenti non compaiono. Le regole del gioco non cambiano: e' solo interfaccia. */
const PP_KEY='ultimate-primi',PP_MAXM=3;
let PP={d:[],m:0,off:0};   // d: schede viste, m: partite iniziate con il tutorial, off: spento (saltato o finito)
try{const o=JSON.parse(localStorage.getItem(PP_KEY)||'null');if(o&&Array.isArray(o.d))PP={d:o.d.filter(x=>typeof x==='string').slice(0,20),m:o.m|0,off:o.off?1:0};}catch(e){}
const ppSave=()=>{try{localStorage.setItem(PP_KEY,JSON.stringify(PP));}catch(e){}};
function ppReset(){PP={d:[],m:0,off:0};ppSave();}
const ppHold=()=>{const h=G.holder;return !!(h&&h.t===0&&!G.flight&&G.mode==='play'&&G.freeze<=0&&!G.zoomHold&&!G.walk&&!G.brickWait&&!G.pull);};   // il disco e' tuo e puoi lanciare
const PP_STEPS=[
  {id:'goal',t:'Come si gioca',x:'Per segnare porta il disco nella meta avversaria passandolo ai compagni: chi ha il disco non può correre. Vince chi arriva per primo al punteggio scritto in alto.',when:()=>G.mode==='ready'},
  {id:'pull',t:'Il pull',x:'Ogni punto comincia con un pull, un lancio lungo. Tocca lo schermo due volte: la prima ferma la POTENZA nel verde, la seconda la DIREZIONE al centro. Se il disco cade in fondo alla meta è un GRAN PULL e la difesa parte avvantaggiata.',when:()=>pullMineNow()},
  {id:'recv',t:'Ricevi il pull',x:'Ora tira l’avversario. Quando il disco arriva nelle mani di un tuo giocatore puoi lanciarlo: i compagni si muovono da soli per farsi trovare.',when:()=>G.mode==='ready'&&G.pullTeam===1&&!G.schemeOpen},
  {id:'throw',t:'Lanciare',x:'Appoggia il dito, trascinalo all’indietro e rilascia: il disco parte nella direzione opposta, tanto più lontano quanto più trascini. Il mirino ti mostra dove arriva e di quanto può sbagliare.',when:()=>ppHold()},
  {id:'calls',t:'Chiamare i compagni',x:'Tocca un compagno per mandarlo in taglio; tieni premuto per l’isolamento (gli altri gli liberano lo spazio); tocca il portatore per far ripartire tutti. Un breve tratto verde mostra da che parte parte ciascuno.',when:()=>ppHold()&&(G.st.thr[0]|0)>=1&&G.holdT>0.8},
  {id:'stall',t:'Il conteggio (stall)',x:'Il marcatore conta ad alta voce: arrivato a 10 perdi il disco. Se il numero sale, passa subito, anche corto.',when:()=>ppHold()&&G.stallT>=2.5&&!!G.marker},
  {id:'alto',t:'Lancio alto',x:'Appoggia due dita insieme e trascina: è il lancio alto (il rovesciato). Passa sopra il marcatore, ma è più lento e meno preciso.',when:()=>ppHold()&&(G.st.thr[0]|0)>=3&&G.holdT>1.2},
  {id:'def',t:'In difesa',x:()=>defMan()?'Il disco è dell’avversario. Trascina il dito per guidare il difensore azzurro; quando sul tuo marcatore compare un cerchio che si stringe, tocca il pulsante a destra (la mano) per bloccare il lancio.':'Il disco è dell’avversario. I tuoi difendono da soli: con «Marcatura» scegli se contenere o anticipare, con «Salta» fai scorrere il possesso. Quando compare il cerchio, tocca per il tuffo.',when:()=>G.mode==='play'&&inDefense()&&!!G.holder&&G.holder.t===1&&!G.diveWin},
  {id:'next',t:'Dopo la meta',x:'Dopo ogni meta le squadre cambiano campo e si ricomincia dal pull. Il Timeout, una volta a partita, ferma lo stall e fa recuperare un po’ di energia.',when:()=>G.mode==='ready'&&G.pointNo>=2}
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

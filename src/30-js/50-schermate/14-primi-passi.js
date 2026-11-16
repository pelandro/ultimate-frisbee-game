/* ---- PRIMI PASSI: il tutorial dentro la prima partita, imparando facendo ----
   Prima erano schede da leggere che fermavano il gioco. Ora quasi ogni passo e' una prova: il riquadro in alto dice che cosa fare
   («Lancia a un compagno», «Chiama un taglio», «Fai un lancio alto»...), la partita continua e il passo si chiude solo quando l'hai fatto davvero,
   con un riscontro («Passaggio riuscito!»). Se sbagli lo dice e ti fa riprovare; se dopo un po' non ci riesci compare un suggerimento in piu'.
   Mentre impari a lanciare il conteggio dello stall e' fermo o rallentato (G.stallK, letto dal motore); si rimette normale nel passo che lo spiega.
   Restano poche schede da leggere (obiettivo, dopo la meta, schemi, cambi e pausa): quelle fermano il gioco finche' non premi «Capito».
   Vale per le prime tre partite di qualsiasi modalita' (allenamento escluso); «Salta questo passo» passa oltre, «Esci dal tutorial» lo spegne.
   Cio' che hai gia' fatto resta segnato sul dispositivo (chiave «ultimate-primi»). Si riaccende dalle Impostazioni (Partita › Suggerimenti: no, poi sì). */
const PP_KEY='ultimate-primi',PP_MAXM=3;
let PP={d:[],m:0,off:0};   // d: passi fatti o visti, m: partite iniziate con il tutorial, off: spento (saltato o finito)
try{const o=JSON.parse(localStorage.getItem(PP_KEY)||'null');if(o&&Array.isArray(o.d))PP={d:o.d.filter(x=>typeof x==='string').slice(0,30),m:o.m|0,off:o.off?1:0};}catch(e){}
const ppSave=()=>{try{localStorage.setItem(PP_KEY,JSON.stringify(PP));}catch(e){}};
function ppReset(){PP={d:[],m:0,off:0};ppSave();}
// gesti che il motore non conta da solo: li segnala l'interfaccia (chiamate rapide in 05-input-impostazioni.js)
const ppEv={};
function tutEv(k){ppEv[k]=(ppEv[k]|0)+1;}
const ppHold=()=>{const h=G.holder;return !!(h&&h.t===0&&!G.flight&&G.mode==='play'&&G.freeze<=0&&!G.zoomHold&&!G.walk&&!G.pull);};   // il disco e' tuo e puoi lanciare
const ppSeen=id=>PP.d.includes(id);
const ppMy=f=>!!(f&&f.team===0);
/* passi: info = scheda da leggere (ferma il gioco); gli altri sono prove con done(b) (b = fotografia dei contatori all'inizio della prova).
   sk = velocita' dello stall durante la prova (0 fermo, 1 normale); h = suggerimento se dopo 14 s non ci sei ancora riuscito; ok = riscontro */
const PP_STEPS=[
  {id:'goal',info:1,t:'Come si gioca',x:'Si segna prendendo il disco dentro la meta avversaria. Chi ha il disco non può correre: si avanza solo passandolo. In questa partita impari giocando: in alto ti dico che cosa provare e aspetto che tu lo faccia.',when:()=>G.mode==='ready'},
  {id:'pull',t:'Prova: tira il pull',x:'Ogni punto comincia con il pull, il lancio lungo agli avversari. Tocca una volta per fermare la POTENZA nel verde, poi una seconda per la DIREZIONE al centro.',h:'Guarda le due barre in basso: il primo tocco quando la potenza è nel verde, il secondo quando la direzione è al centro.',
    when:()=>pullMineNow(),done:()=>!!G.pull||G.mode==='play',ok:'Pull tirato! Più cade in fondo al campo, più la tua difesa parte avvantaggiata.'},
  {id:'throw',side:0,t:'Prova: passa il disco',x:'Appoggia il dito, trascinalo all’indietro come una fionda verso un compagno e rilascia: l’arco mostra dove arriva il disco. Finché non riesci il conteggio è fermo.',sk:0,
    h:'Lancia dove il compagno sta andando, non dove si trova. Più trascini, più il lancio va lontano: per i primi passaggi bastano pochi centimetri.',
    when:()=>ppHold(),done:b=>(G.st.cmp[0]|0)>b.cmp,fail:b=>(G.st.thr[0]|0)>b.thr+b.miss,retry:'Quasi! Il disco non è arrivato: riprova con un passaggio più corto, verso un compagno libero.',ok:'Passaggio riuscito! È così che si avanza.'},
  {id:'calls',side:0,t:'Prova: chiama un taglio',x:'Tocca un compagno senza trascinare: gli chiedi di smarcarsi («VIENI!» o «LUNGO!»). Poi lancia a lui.',sk:0.5,h:'Un tocco breve sopra un tuo compagno, non sul portatore.',
    when:()=>ppHold()&&ppSeen('throw'),done:b=>(ppEv.call|0)>b.call,ok:'Chiamata fatta: il compagno taglia e ti offre il passaggio. Toccando chi ha il disco rimetti tutti in posizione.'},
  {id:'iso',side:0,t:'Prova: isolamento',x:'Tieni premuto il dito su un compagno: taglia solo lui e gli altri gli liberano lo spazio. Usalo con il tuo giocatore più veloce.',sk:0.5,h:'Tieni il dito fermo sul compagno per circa mezzo secondo, finché compare «ISO!».',
    when:()=>ppHold()&&ppSeen('calls'),done:b=>(ppEv.iso|0)>b.iso,ok:'Isolamento chiamato: ha tutto lo spazio per lui.'},
  {id:'alto',side:0,t:'Prova: lancio alto',x:'Il lancio alto scavalca il marcatore: tocca due volte un punto libero del campo e tieni giù il secondo tocco per mirare (oppure usa due dita).',sk:0.5,h:'Due tocchi veloci nello stesso punto, lontano dai giocatori, e al secondo resta giù col dito mentre miri.',
    when:()=>ppHold()&&ppSeen('iso'),done:()=>!!(G.flight&&ppMy(G.flight)&&G.flight.high),ok:'Lancio alto! Scavalca la difesa, ma sui lanci lunghi è più lento e meno preciso.'},
  {id:'stall',side:0,t:'Prova: passa prima del 10',x:'Ora il conteggio è vero: quando il difensore ti marca conta fino a 10 (lo vedi in alto, «Stall 3»…). A 10 perdi il disco: passa prima, anche corto.',sk:1,h:'Non aspettare il lancio perfetto: un passaggio corto a un compagno vicino azzera il conteggio.',
    when:()=>ppHold()&&ppSeen('alto')&&G.stallT>=2&&!!G.marker,done:b=>(G.st.thr[0]|0)>b.thr,ok:'Passato in tempo: ogni passaggio fa ripartire il conteggio da zero.'},
  {id:'def',side:1,t:()=>defMan()?'Prova: difendi':'In difesa',x:()=>defMan()?'Ora attacca l’avversario. Trascina il dito per guidare il difensore con l’anello azzurro; quando compare un cerchio che si stringe, premi la mano (handblock) o TUFFO mentre arriva sull’anello interno. Prova a riprenderti il disco.':'Ora attacca l’avversario e i tuoi difendono da soli. Ogni tanto arriva un momento a tempo: tocca quando il cerchio si stringe sull’anello. Aspetta che il disco torni a te.',
    h:()=>defMan()?'Stai vicino all’uomo che hai davanti: l’handblock riesce solo se sei addosso a chi lancia.':'Puoi anche premere «Salta» per far giocare il loro attacco in un attimo.',
    when:()=>G.mode==='play'&&G.poss===1&&!G.pull&&ppSeen('goal'),done:b=>G.score[1]>b.sc1||G.poss===0||G.pointNo!==b.pno,ok:()=>ppB&&G.score[1]>ppB.sc1?'Meta subita: capita. Al prossimo punto riprovaci.':'Disco recuperato! Ora attacchi tu.'},
  {id:'score',side:0,t:'Prova: segna una meta',x:'Porta il disco nella meta avversaria (il rettangolo in fondo): un compagno che lo prende là dentro segna. Avanza a passaggi, senza fretta.',sk:1,h:'Lancia verso un compagno che corre verso la meta: chiamagli un taglio «LUNGO!» toccandolo quando è lontano.',
    when:()=>G.mode==='play'&&G.poss===0&&ppSeen('stall'),done:b=>G.score[0]>b.sc0,ok:'META! Prima meta segnata. Dopo ogni meta si cambia campo e chi ha segnato tira il pull.'},
  {id:'next',info:1,t:'Il timeout',x:'Quando hai il disco puoi chiamare un Timeout (uno a partita, in basso a sinistra): azzera lo stall e fa riprendere fiato. Usalo quando il conteggio è alto e nessuno è libero.',when:()=>G.mode==='ready'&&G.pointNo>=2},
  {id:'schemi',info:1,t:'Gli schemi',x:'A inizio meta «Schemi» sceglie come attaccare e come difendere. Nessuno schema vince sempre: nel menu trovi cosa batte e cosa soffre ognuno (la zona, per esempio, ferma il Verticale ma soffre l’Orizzontale).',when:()=>G.mode==='ready'&&G.pointNo>=3&&!G.schemeOpen},
  {id:'sim',info:1,t:'Cambi, Simula e Pausa',x:()=>'Accanto a «Schemi» trovi «Cambi» (chi gioca) e «Simula meta» (la gioca il computer). Il tasto II in alto ferma la partita: da lì «Sospendi» la salva per continuare più tardi.'+(PP.d.length>=PP_STEPS.length-1?' Hai finito i Primi passi: il resto è nel Tutorial completo, dal menu.':''),when:()=>G.mode==='ready'&&G.pointNo>=4&&!G.schemeOpen&&(ppSeen('score')||G.pointNo>=7)}
];
const ppTxt=v=>typeof v==='function'?v():v;
let ppCur=null,ppWas=false,ppB=null,ppT0=0,ppOkT=0,ppHintOn=false,ppAway=0;
const ppOkNow=()=>tipsOn()&&!PP.off&&PP.d.length<PP_STEPS.length&&!!G.inMatch&&!G.drill&&!DR.on&&!G.skip;
function ppPaint(sub,cls){
  const s=ppCur;if(!s)return;
  $('ppN').textContent=`Primi passi · ${Math.min(PP.d.length+1,PP_STEPS.length)} di ${PP_STEPS.length}`+(s.info?'':' · prova');
  $('ppT').textContent=ppTxt(s.t);$('ppX').textContent=ppTxt(s.x);
  const h=$('ppH');h.textContent=sub||'';h.classList.toggle('hidden',!sub);
  const box=$('pp').firstElementChild;box.classList.toggle('ok',cls==='ok');box.classList.toggle('try',!s.info&&cls!=='ok');
  $('ppOk').textContent=s.info?'Capito':'Salta questo passo';$('ppOk').className=s.info?'go':'sec';
  $('ppOk').classList.toggle('hidden',cls==='ok');$('ppSkip').classList.toggle('hidden',cls==='ok');
}
function ppShow(s){
  ppCur=s;ppT0=G.tick;ppOkT=0;ppHintOn=false;ppAway=0;
  ppB={thr:G.st.thr[0]|0,cmp:G.st.cmp[0]|0,miss:0,call:ppEv.call|0,iso:ppEv.iso|0,sc0:G.score[0],sc1:G.score[1],pno:G.pointNo};
  if(s.info){G.paused=true;drag=null;aimPid=null;ddrag=null;G.cdir=null;G.high=false;G.hold=false;}   // solo le schede da leggere fermano il gioco
  ppPaint();$('pp').classList.remove('hidden');
}
function ppClose(all){
  $('pp').classList.add('hidden');
  if(ppCur&&!PP.d.includes(ppCur.id))PP.d.push(ppCur.id);
  if(all||PP.d.length>=PP_STEPS.length)PP.off=1;
  if(ppCur&&ppCur.info)G.paused=false;
  ppSave();ppCur=null;ppOkT=0;G.stallK=1;
}
function ppTick(){
  const inM=!!G.inMatch&&!G.drill&&!DR.on;
  if(ppCur&&!G.inMatch){$('pp').classList.add('hidden');ppCur=null;ppOkT=0;}   // la partita e' finita o abbandonata con il riquadro aperto
  if(inM&&!ppWas&&!PP.off){PP.m++;if(PP.m>PP_MAXM)PP.off=1;ppSave();}   // il tutorial dura le prime tre partite
  ppWas=inM;
  if(!inM){if(G.stallK!==1)G.stallK=1;return;}
  // prova in corso: stall rallentato, riscontro quando la fai, «riprova» se sbagli, un suggerimento se non ci riesci
  if(ppCur&&!ppCur.info){
    if(ppOkT){G.stallK=1;if(G.tick-ppOkT>2.4)ppClose(false);return;}
    G.stallK=ppCur.sk==null?1:ppCur.sk;
    if(ppCur.done(ppB)){ppOkT=G.tick;G.stallK=1;HOOKS.sfx('ui');ppPaint('✓ '+ppTxt(ppCur.ok),'ok');return;}
    if(ppCur.fail&&ppCur.fail(ppB)&&!G.flight){ppB.miss++;ppPaint(ppCur.retry);return;}
    // il disco e' passato all'altra squadra (o il punto e' finito) durante una prova: la prova resta da fare e torna quando il disco e' di nuovo tuo
    if(ppCur.side!=null&&(G.mode!=='play'||G.poss!==ppCur.side)){if(!ppAway)ppAway=G.tick;else if(G.tick-ppAway>1.2){$('pp').classList.add('hidden');ppCur=null;G.stallK=1;}return;}
    ppAway=0;
    if(!ppHintOn&&ppCur.h&&G.tick-ppT0>14&&!G.paused){ppHintOn=true;ppPaint('Suggerimento: '+ppTxt(ppCur.h));}
    return;
  }
  G.stallK=1;
  if(ppCur||!ppOkNow()||G.paused||G.mode==='cine'||G.mode==='banner'||RP.on||overlayBusy())return;
  for(const s of PP_STEPS)if(!PP.d.includes(s.id)&&s.when()){ppShow(s);return;}
}
$('ppOk').addEventListener('click',()=>ppClose(false));
$('ppSkip').addEventListener('click',()=>ppClose(true));
// con una scheda da leggere aperta Invio e Spazio la chiudono e nessun altro tasto arriva al gioco; durante le prove i tasti servono per giocare
window.addEventListener('keydown',e=>{
  if(!ppCur||!ppCur.info)return;
  e.stopImmediatePropagation();e.preventDefault();
  if(!e.repeat&&(e.code==='Enter'||e.code==='Space'||e.code==='NumpadEnter'))ppClose(false);
},true);

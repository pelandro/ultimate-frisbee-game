/* ---- TRAGUARDI: obiettivi di lungo periodo del club, con avanzamento in percentuale ----
   Ognuno ha un numero da raggiungere e un piccolo premio in crediti, dato una volta sola. SV.ach = {id: stagione in cui e' stato raggiunto}.
   I traguardi si ricalcolano da soli dai dati che la carriera gia' conserva (storico, trofei, statistiche): niente contatori nuovi da tenere allineati. */
Object.assign(AL_KIND,{ach:['Traguardo','#ffd23f']});
const clubTot=k=>{let n=0;for(const p of SQ)if(p.car)n+=p.car[k]|0;for(const q of SV.former||[])n+=q[k]|0;return n;};   // mete/assist/difese di sempre: rosa attuale + chi ha lasciato
const winsTot=()=>{let n=0;for(const x of SV.hist||[])n+=x.w|0;const t=SV.tab&&SV.tab[SV.team];if(t&&!SV.done)n+=t.w|0;return Math.max(0,n-(SV.w0|0));};   // a stagione chiusa la tabella e' gia' nello storico: non si conta due volte; SV.w0 = vittorie avute prima del subentro
const trTot=()=>{const t=SV.troph||{};return (t.A|0)+(t.B|0)+(t.C|0)+(t.U|0);};
const ACH=[
  ['w10','Si comincia','Vinci 10 partite',10,15,winsTot],
  ['w50','Squadra rodata','Vinci 50 partite',50,40,winsTot],
  ['w150','Macchina da vittorie','Vinci 150 partite',150,100,winsTot],
  ['ss3','Il club cresce','Gioca 3 stagioni',3,20,()=>(SV.hist||[]).length],
  ['ss10','Dieci anni insieme','Gioca 10 stagioni',10,80,()=>(SV.hist||[]).length],
  ['pro','Si sale','Ottieni una promozione',1,30,()=>SV.troph.promo|0],
  ['pro3','Scalata','Ottieni 3 promozioni',3,80,()=>SV.troph.promo|0],
  ['tit','Campioni','Vinci un titolo, in qualsiasi serie',1,40,trTot],
  ['scu','Scudetto','Vinci lo scudetto in Serie A',1,100,()=>SV.troph.A|0],
  ['scu3','Dinastia','Vinci 3 scudetti',3,150,()=>SV.troph.A|0],
  ['eu','Re d’Europa','Vinci il Campionato europeo',1,100,()=>SV.troph.eu|0],
  ['g100','Cento mete','100 mete segnate dal club',100,40,()=>clubTot('g')],
  ['a100','Cento assist','100 assist del club',100,40,()=>clubTot('a')],
  ['b100','Muro difensivo','100 difese del club',100,40,()=>clubTot('b')],
  ['aw3','Premiati','Tre premi individuali ai tuoi giocatori',3,40,()=>SV.troph.aw|0],
  ['fan','Stadio pieno','Porta i tifosi all’80%',80,50,()=>Math.round(SV.fans|0)],
  ['fac','Club moderno','Porta una struttura al livello massimo',1,40,()=>Object.keys(FAC).filter(k=>facLv(k)>=FAC_MAX).length],
  ['stf','Staff al completo','Porta ogni ruolo dello staff al livello massimo',Object.keys(STAFF).length,60,()=>Object.keys(STAFF).filter(k=>staffLv(k)>=STAFF_MAX).length],
  ['der','Re del derby','Vinci 5 derby contro la rivale',5,40,()=>(SV.rivRec&&SV.rivRec.w)|0],
  ['hof','Hall of Fame','Porta un tuo campione nella Hall of Fame',1,40,()=>(SV.hof||[]).length]
];
// avanzamento di un traguardo: valore, obiettivo, percentuale (0-100) e se e' gia' stato ottenuto
function achState(a){
  const v=a[5](),done=!!(SV.ach&&SV.ach[a[0]]);
  return {id:a[0],name:a[1],txt:a[2],goal:a[3],rw:a[4],v:Math.min(v,a[3]),pct:done?100:Math.min(99,Math.floor(100*v/a[3])),done,s:done?SV.ach[a[0]]:0};
}
function achPct(){const n=ACH.filter(a=>SV.ach&&SV.ach[a[0]]).length;return {n,tot:ACH.length,pct:Math.round(100*n/ACH.length)};}
// controllo dei traguardi: dopo ogni partita e a ogni fine stagione. «silent» (salvataggi vecchi): si segnano senza premio, per non regalare tutto in blocco
function achCheck(silent){
  if(!SV.ach)SV.ach={};
  for(const a of ACH){
    if(SV.ach[a[0]])continue;
    let v=0;try{v=a[5]();}catch(e){v=0;}
    if(v<a[3])continue;
    SV.ach[a[0]]=SV.season;
    if(!silent){SV.cash+=a[4];alertAdd('ach',`Traguardo raggiunto: ${a[1]}. Premio ${a[4]} crediti.`);}
  }
}

/* ---- CARRIERA DINAMICA: cio' che tiene viva la carriera dopo le prime stagioni ----
   1) INTENSITA' degli allenamenti (SV.tInt): leggero, normale, intenso. Piu' intenso = piu' crescita, ma piu' condizione spesa e piu' rischio.
   2) STRUTTURE: sei, fino al livello 5. Costano una manutenzione a ogni partita, d'estate possono perdere un livello per usura, e chi le tiene
      almeno al livello 3 riceve ogni estate un premio di mantenimento, proporzionato alle giornate di campionato in cui l'ha tenuta li'
      (SV.facDays: giornate al livello 3+ per struttura, SV.facRnd: giornate giocate nella stagione).
   3) IMPREVISTI (SV.evt): ogni tanto, dopo una partita, succede qualcosa: a volte aiuta, a volte no, spesso chiede una scelta.
   4) SFIDA DELLA DIRIGENZA (SV.chal): per i club affermati, un traguardo facoltativo a stagione, senza penalita' se lo si manca.
   5) DOMINIO (SV.dom): chi vince la Serie A vede le rivali rinforzarsi, e l'Europa si fa piu' dura a ogni coppa vinta.
   Tutti i campi nuovi hanno un valore predefinito in careerInit(): i salvataggi vecchi continuano a funzionare. */
Object.assign(AL_KIND,{club:['Club','#5ac8ff'],evt:['Imprevisto','#ffb347'],tired:['Fatica','#ff9a3a']});
const TR_INT=[{n:'Leggero',g:0.6,c:0.5,r:0.5,t:'metà fatica, crescita ridotta'},{n:'Normale',g:1,c:1,r:1,t:'l’equilibrio di sempre'},{n:'Intenso',g:1.45,c:1.7,r:1.8,t:'si cresce di più, ma costa molta condizione e aumenta il rischio di infortuni'}];
const trInt=()=>TR_INT[clamp(SV.tInt===undefined?1:SV.tInt|0,0,2)];
const TIRED_AT=35;   // sotto questa condizione un giocatore e' «molto affaticato»: rischia l'infortunio anche in partita
const scoutCost=()=>Math.max(2,SCOUT_COST-facLv('oss'));
// manutenzione a partita: cresce piu' che in proporzione, cosi' tenere tutto al massimo e' una scelta e non un obbligo
const facUpkeep=()=>Math.round(Object.keys(FAC).reduce((a,k)=>a+facLv(k)*(facLv(k)+1)/2,0)*0.25);
const KEEP_LV=3;
const FAC_KEEP={camp:'ritiro estivo: i giocatori fino a 23 anni migliorano',fis:'prevenzione: i primi due infortuni della stagione durano la metà',viv:'un giovane del vivaio sale in prima squadra',
  stad:'abbonamenti: crediti a inizio stagione',oss:'rapporto estivo: potenziale già noto per tutto il mercato',sede:'ambiente: reputazione e morale in più'};
function youthFromAcademy(tag,bonus){   // un ragazzo cresciuto in casa (vivaio o provino): entra in rosa se c'e' posto
  if(SQ.length>=28)return null;
  const lv=squadPower(),o=genPlayer(lv-13+Math.random()*6+(bonus||0),16+Math.floor(Math.random()*3),SV.seed+'|'+tag+'|'+SV.season+'|'+SV.round+'|'+SQ.length,lv+4+Math.random()*22+(bonus||0)*2);
  o.sk=1;setSquad(squadData().concat([o]));fixLines();return o;
}
function boostYoung(maxAge,n){   // +1 in n statistiche a caso, sotto il proprio massimo
  let c=0;for(const p of SQ){if(p.age>maxAge)continue;const ks=KEYS.filter(k=>p.s[k]<capX(p,k)).sort(()=>Math.random()-0.5).slice(0,n);for(const k of ks)p.s[k]++;if(ks.length)c++;}
  return c;
}
// quota della stagione appena finita in cui la struttura e' rimasta al livello del premio (0..1)
const keepShare=k=>SV.facRnd?clamp(((SV.facDays&&SV.facDays[k])|0)/SV.facRnd,0,1):0;
const KEEP_MIN=0.5;   // sotto meta' stagione niente premio; da li' cresce fino al premio pieno
// inizio stagione: premi di mantenimento, usura delle strutture, nuova sfida della dirigenza
function seasonStartDyn(){
  if(!SV.facKeep)SV.facKeep={};
  const got=[],worn=[];
  for(const k of Object.keys(FAC)){
    const lv=facLv(k),f=keepShare(k),full=f>=0.9,pc=Math.round(f*100)+'% della stagione';
    SV.facKeep[k]=f>=KEEP_MIN?(SV.facKeep[k]|0)+1:0;   // stagioni di fila in cui e' stata mantenuta
    if(f>=KEEP_MIN){
      if(k==='camp'){const c=boostYoung(23,full?2:1);if(c)got.push('ritiro estivo ('+c+' giovani migliorati, '+pc+')');}
      else if(k==='fis'){SV.fisShield=full?2:1;got.push('prevenzione degli infortuni ('+SV.fisShield+(SV.fisShield>1?' infortuni dimezzati':' infortunio dimezzato')+')');}
      else if(k==='viv'){if(f>=0.75){const o=youthFromAcademy('viv',Math.round((Math.max(KEEP_LV,lv)-2)*f));if(o)got.push('dal vivaio arriva '+(o.label||o.n)+' ('+o.age+' anni)');}}
      else if(k==='stad'){const c=Math.round(12*Math.max(KEEP_LV,lv)*SR_K[SV.sr]*f);SV.cash+=c;got.push('abbonamenti (+'+c+' crediti, '+pc+')');}
      else if(k==='oss'){for(const m of SV.market||[])m.o.sk=Math.max(m.o.sk|0,full?3:2);got.push('rapporto degli osservatori sul mercato'+(full?'':' (parziale)'));}
      else if(k==='sede'){const r=Math.round(2*f),m=Math.round(5*f);SV.rep=clamp(SV.rep+r,0,100);SV.mor=clamp(SV.mor+m,0,100);got.push('ambiente sereno (+'+r+' reputazione, +'+m+' morale)');}
    }else if(k==='fis')SV.fisShield=0;
    // usura: piu' una struttura e' avanzata, piu' e' facile che d'estate perda un livello
    if(lv>=2&&Math.random()<0.06+0.03*lv){SV.fac[k]=lv-1;worn.push(FAC[k][0]+' (ora livello '+(lv-1)+')');}
  }
  if(got.length)alertAdd('club','Premi di mantenimento delle strutture: '+got.join('; ')+'.');
  if(worn.length)alertAdd('club','Usura estiva: '+worn.join(', ')+'. Per riavere il livello serve un nuovo investimento.');
  SV.facDays={};SV.facRnd=0;   // si ricomincia a contare
  pickChallenge();
}
/* ---- sfida della dirigenza ---- */
const BCHAL={
  imb:{txt:()=>'Quasi imbattibili: chiudi il campionato con al massimo 2 sconfitte',ok:()=>SV.tab[SV.team].l<=2},
  gio:{txt:()=>'Largo ai giovani: almeno 3 giocatori fino a 21 anni con 8 presenze in stagione',ok:()=>SQ.filter(p=>p.age<=21&&p.car&&p.car.ss.mp>=8).length>=3},
  bil:{txt:c=>'Conti in ordine: arriva all’ultima giornata con almeno '+(c.base+c.x)+' crediti (ora '+c.base+')',ok:c=>SV.cash>=c.base+c.x},
  att:{txt:c=>'Spettacolo: segna almeno '+c.x+' mete in campionato',ok:c=>SV.tab[SV.team].pf>=c.x}
};
function pickChallenge(){
  SV.chal=null;
  if(!(SV.sr==='A'||SV.rep>=55)||!SV.sched)return;   // solo per i club affermati: prima c'e' gia' abbastanza da fare
  const ids=Object.keys(BCHAL),id=ids[Math.floor(Math.random()*ids.length)],n=SV.sched.length;
  SV.chal={id,base:SV.cash,x:id==='bil'?Math.round(45*SR_K[SV.sr]):Math.round(n*6.2),reward:Math.round(45*SR_K[SV.sr])};
}
const chalTxt=()=>SV.chal&&BCHAL[SV.chal.id]?BCHAL[SV.chal.id].txt(SV.chal):'';
// fine stagione (prima dei premi di classifica): esito della sfida e reazione del campionato al tuo dominio
function seasonEndDyn(rank){
  const c=SV.chal;
  if(c&&BCHAL[c.id]&&!c.done){
    c.done=1;c.won=BCHAL[c.id].ok(c)?1:0;
    if(c.won){SV.cash+=c.reward;SV.rep=clamp(SV.rep+3,0,100);SV.troph.chal=(SV.troph.chal|0)+1;news('Sfida della dirigenza vinta: +'+c.reward+' crediti e reputazione in più.');}
    else news('Sfida della dirigenza non riuscita: nessuna penalità.');
  }
  const d0=SV.dom|0;
  if(SV.sr==='A'&&rank===1)SV.dom=Math.min(6,d0+1);else if(SV.sr!=='A'||rank>3)SV.dom=Math.max(0,d0-1);
  if((SV.dom|0)>d0)news('Dopo il vostro scudetto le rivali di Serie A investono per fermarvi: la prossima stagione sarà più dura.');
}
// quanto si alza il livello a cui tendono le squadre di Serie A quando domini
const domBoost=n=>SV.mem&&SV.mem.A&&SV.mem.A.includes(n)?1.3*(SV.dom|0):0;
const euPlus=()=>Math.min(8,2*(SV.troph&&SV.troph.eu|0));
/* ---- IMPREVISTI ----
   SV.evt={id,a}: l'imprevisto in sospeso (a = dati sorteggiati). Ogni voce: w = peso, ok() = puo' capitare adesso, mk() = dati, t(a) = [titolo, testo],
   o(a) = scelte [etichetta, funzione che applica l'effetto e ritorna il testo dell'esito, (facoltativo) disponibile?]. */
const evK=()=>SR_K[SV.sr];
const pickP=f=>{const L=SQ.filter(p=>!p.inj&&(!f||f(p)));return L.length?L[Math.floor(Math.random()*L.length)]:null;};
const allCond=d=>{for(const p of SQ)p.cond=clamp(p.cond+d,0,100);};
const EVT={
  sponsor:{w:3,mk:()=>({c:Math.round((18+Math.random()*16)*evK())}),t:a=>['Uno sponsor in più','Un’azienda della zona vuole il suo nome sulle vostre maglie per qualche partita.'],
    o:a=>[['Incassa '+a.c+' crediti',()=>{SV.cash+=a.c;return '+'+a.c+' crediti.';}]]},
  sponsor2:{w:2,mk:()=>({c:Math.round(55*evK())}),t:a=>['Uno sponsor ingombrante','Una società di scommesse offre '+a.c+' crediti. Non a tutti nell’ambiente piacerà.'],
    o:a=>[['Accetta: +'+a.c+' crediti, −4 reputazione',()=>{SV.cash+=a.c;SV.rep=clamp(SV.rep-4,0,100);return '+'+a.c+' crediti, reputazione in calo.';}],['Rifiuta: +1 reputazione',()=>{SV.rep=clamp(SV.rep+1,0,100);return 'Scelta apprezzata: +1 reputazione.';}]]},
  flu:{w:3,ok:()=>SQ.length>=10,mk:()=>({n:SQ.filter(p=>!p.inj).sort(()=>Math.random()-0.5).slice(0,3).map(p=>p.full)}),
    t:a=>['Influenza nello spogliatoio',a.n.map(f=>{const p=byFull(f);return p?pname(p):'';}).filter(Boolean).join(', ')+' sono a letto con la febbre: torneranno scarichi.'],
    o:a=>[['Capito',()=>{for(const f of a.n){const p=byFull(f);if(p)p.cond=clamp(p.cond-30,0,100);}return 'Tre giocatori perdono 30 di condizione: falli recuperare.';}]]},
  guasto:{w:3,ok:()=>Object.keys(FAC).some(k=>facLv(k)>=1),mk:()=>{const ks=Object.keys(FAC).filter(k=>facLv(k)>=1),k=ks[Math.floor(Math.random()*ks.length)];return {k,c:Math.round(facCost(k)*0.3)};},
    t:a=>['Guasto: '+FAC[a.k][0],'Serve una riparazione da '+a.c+' crediti. Senza, la struttura scende al livello '+(facLv(a.k)-1)+'.'],
    o:a=>[['Ripara ('+a.c+' crediti)',()=>{SV.cash-=a.c;return 'Riparato: il livello resta '+facLv(a.k)+'.';},()=>SV.cash>=a.c],['Lascia perdere',()=>{SV.fac[a.k]=Math.max(0,facLv(a.k)-1);return FAC[a.k][0]+' scende al livello '+facLv(a.k)+'.';}]]},
  provino:{w:2,ok:()=>SQ.length<28,mk:()=>({}),t:a=>['Un provino','Un ragazzo del posto, mai visto prima, chiede di allenarsi con voi. Di lui non si sa nulla.'],
    o:a=>[['Prendilo in rosa',()=>{const o=youthFromAcademy('prov',Math.random()<0.25?4:0);return o?(o.label||o.n)+' ('+o.age+' anni) entra in rosa: il suo potenziale è tutto da scoprire.':'Rosa piena: non c’è posto.';}],['No, grazie',()=>'Il ragazzo proverà altrove.']]},
  amichevole:{w:3,mk:()=>({c:Math.round(14*evK())}),t:a=>['Torneo amichevole','Vi invitano a un torneo sulla sabbia nel fine settimana libero: un piccolo gettone e tanto gioco insieme, ma si torna stanchi.'],
    o:a=>[['Partecipa: +'+a.c+' crediti, +3 affiatamento, −12 condizione',()=>{SV.cash+=a.c;SV.chem=clamp(SV.chem+3,0,100);allCond(-12);return 'Bel torneo: gruppo più unito, gambe più pesanti.';}],['Riposo: +6 condizione',()=>{allCond(6);return 'Un fine settimana di riposo: +6 di condizione a tutti.';}]]},
  tifosi:{w:2,ok:()=>SV.res.length>=2&&SV.res.slice(-2).every(r=>r.su>r.so),mk:()=>({}),t:a=>['Entusiasmo','Due vittorie di fila: al campo arriva più gente e la squadra lo sente.'],
    o:a=>[['Bene!',()=>{SV.mor=clamp(SV.mor+8,0,100);return '+8 morale.';}]]},
  multa:{w:2,mk:()=>({c:Math.round(12*evK())}),t:a=>['Multa della federazione','Documenti di iscrizione consegnati in ritardo: '+a.c+' crediti di multa.'],
    o:a=>[['Paga',()=>{SV.cash-=a.c;return '−'+a.c+' crediti.';}]]},
  esame:{w:3,ok:()=>SQ.filter(p=>!p.inj).length>=10,mk:()=>{const p=pickP(q=>q.age<=27);return p?{f:p.full}:null;},
    t:a=>{const p=byFull(a.f);return ['Impegni fuori dal campo',(p?pname(p):'Un giocatore')+' ha un esame (o un turno di lavoro) proprio nel giorno della prossima partita.'];},
    o:a=>[['Va bene, salta una partita',()=>{const p=byFull(a.f);if(p){p.inj=1;p.abs=1;}return 'Assente alla prossima partita.';}],['Chiedigli di esserci: −5 morale',()=>{SV.mor=clamp(SV.mor-5,0,100);return 'Ci sarà, ma lo spogliatoio non ha gradito.';}]]},
  stage:{w:2,mk:()=>({c:Math.round(22*evK())}),t:a=>['Un allenatore ospite','Un tecnico di fama passa in città e propone uno stage per i più giovani.'],
    o:a=>[['Organizza lo stage ('+a.c+' crediti)',()=>{SV.cash-=a.c;const n=boostYoung(24,2);return n+' giovani migliorano in due statistiche.';},()=>SV.cash>=a.c],['Solo una chiacchierata: +3 affiatamento',()=>{SV.chem=clamp(SV.chem+3,0,100);return '+3 affiatamento.';}]]},
  aumento:{w:2,ok:()=>SQ.length>=7,mk:()=>{const p=SQ.slice().sort((x,y)=>ovrX(y)-ovrX(x))[Math.floor(Math.random()*3)];return {f:p.full,c:Math.round(wageOf(p)*0.6)+3};},
    t:a=>{const p=byFull(a.f);return ['Richiesta di un premio',(p?pname(p):'Un titolare')+' ritiene di meritare un riconoscimento per quanto sta dando.'];},
    o:a=>[['Premio di '+a.c+' crediti: +4 morale',()=>{SV.cash-=a.c;SV.mor=clamp(SV.mor+4,0,100);return 'Premio pagato: l’ambiente apprezza.';},()=>SV.cash>=a.c],['Non ora: −5 morale',()=>{SV.mor=clamp(SV.mor-5,0,100);return 'Richiesta respinta: qualche muso lungo.';}]]},
  maltempo:{w:2,ok:()=>!SV.tTeam&&trainOpen(),mk:()=>({}),t:a=>['Campo allagato','Ha piovuto tutta la settimana: l’allenamento di squadra di questa giornata salta. Restano i lavori individuali.'],
    o:a=>[['Pazienza',()=>{SV.tTeam=true;return 'Niente seduta di squadra fino alla prossima partita.';}]]},
  spirito:{w:2,mk:()=>({}),t:a=>['Premio Spirit of the Game','Le avversarie vi hanno votato come la squadra più corretta dell’ultimo turno.'],
    o:a=>[['Grazie!',()=>{SV.rep=clamp(SV.rep+3,0,100);return '+3 reputazione.';}]]}
};
const EVT_GAP=4,EVT_P=0.16;   // almeno 4 giornate tra un imprevisto e l'altro, poi 16% a giornata: in media uno o due a stagione
function rollEvent(force){
  if(SV.evt||SV.event!=='camp'||SV.done)return;
  SV.evtGap=(SV.evtGap|0)+1;
  if(!force&&(SV.evtGap<EVT_GAP||Math.random()>EVT_P))return;
  const ids=Object.keys(EVT).filter(id=>id!==SV.evtLast&&(!EVT[id].ok||EVT[id].ok()));let tot=0;for(const id of ids)tot+=EVT[id].w;
  let r=Math.random()*tot,pick=ids[0];for(const id of ids){r-=EVT[id].w;if(r<=0){pick=id;break;}}
  const a=pick&&EVT[pick].mk();if(!a)return;
  SV.evt={id:pick,a};SV.evtGap=0;SV.evtLast=pick;
}
function evtAnswer(i){   // applica la scelta e ritorna il testo dell'esito
  const e=SV.evt;if(!e||!EVT[e.id])return '';
  const op=EVT[e.id].o(e.a)[i];if(!op||(op[2]&&!op[2]()))return '';
  const res=op[1](),t=EVT[e.id].t(e.a)[0];SV.evt=null;
  alertAdd('evt',t+': '+res,{seen:1});return res;
}
// dopo ogni partita: manutenzione, avviso sulla fatica, eventuale imprevisto
function dynAfterMatch(){
  if(SV.event==='camp'){SV.facRnd=(SV.facRnd|0)+1;if(!SV.facDays)SV.facDays={};for(const k of Object.keys(FAC))if(facLv(k)>=KEEP_LV)SV.facDays[k]=(SV.facDays[k]|0)+1;}   // giornate di campionato al livello del premio
  const up=facUpkeep();if(up){SV.cash-=up;SV.lastInc=(SV.lastInc|0)-up;}SV.lastUp=up;
  const tired=SQ.filter(p=>!p.inj&&p.cond<TIRED_AT);
  const tn=tired.length,more=tn>(SV.tiredN|0);SV.tiredN=tn;   // l'avviso arriva quando la situazione peggiora, non a ogni giornata
  if(more)alertAdd('tired',(tired.length===1?pname(tired[0])+' è molto affaticat'+oa(tired[0]):tired.slice(0,4).map(pname).join(', ')+(tired.length>4?' e altri':'')+' sono molto affaticati')+': con il Recupero o una partita in panchina il rischio di infortunio rientra.');
  rollEvent();
}

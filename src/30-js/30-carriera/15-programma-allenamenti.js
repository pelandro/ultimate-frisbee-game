/* ---- ALLENAMENTI: ANTEPRIMA e PROGRAMMA AUTOMATICO ----
   Anteprima (trainForecast): prima di confermare una seduta si vedono i punti attesi, la condizione che costa (o ridà) e quanti rischiano l'infortunio.
   Programma automatico (SV.prog): dopo molte stagioni scegliere ogni settimana la seduta di squadra e i tre lavori individuali diventa una ripetizione.
   Con il programma acceso, a ogni sessione disponibile il gioco li fa da solo:
   - seduta di squadra: Recupero se la squadra e' scarica (condizione media sotto PROG_REST), altrimenti l'indirizzo fissato da te oppure, in «Automatico»,
     quello che promette piu' punti;
   - lavoro individuale: prima chi hai segnato come PRIORITA' (p.pri, fino a 3), poi chi puo' crescere di piu'; chi e' scarico o infortunato fa Recupero.
   L'intensita' resta quella scelta da te. Il risultato arriva come notizia (non interrompe). Si puo' sempre spegnere e fare tutto a mano. */
const PROG_REST=62,PROG_LOW=48;   // sotto 62 di media la squadra recupera; sotto 48 un giocatore fa Recupero invece del lavoro individuale
const progOf=()=>SV.prog||(SV.prog={on:false,team:'auto'});
function trainForecast(list,opt,single){
  const it=trInt(),fis=(1-0.12*facLv('fis'))*(1-0.1*staffLv('fit'));
  let pts=0,cond=0,risk=0,n=0,atRisk=0;
  for(const p of list){
    if(p.inj&&opt.id!=='rec')continue;n++;
    if(opt.id==='rec'){cond+=Math.min(100-p.cond,REST_GAIN+(single?8:0)+2*facLv('fis')+2*staffLv('fit'));continue;}
    pts+=trainExpect(p,opt,trainMul(p)*(single?1.5:1)*it.g);
    cond-=Math.round((single?TRAIN_COST1:TRAIN_COST)*it.c*(specBonus(p,opt.keys)>0?1.15:1));
    const r=(trainRisk(p)*it.r+(it.r>1?0.004:0))*fis;risk=1-(1-risk)*(1-r);if(trainRisk(p)>0)atRisk++;
  }
  return {pts,cond:n?cond/n:0,risk,n,atRisk};
}
// testo breve dell'anteprima, per i tasti degli indirizzi
function forecastTxt(f,opt){
  if(!f.n)return 'nessuno disponibile';
  if(opt.id==='rec')return `+${Math.round(f.cond)} condizione`;
  return `+${f.pts<9.95?f.pts.toFixed(1).replace('.',','):Math.round(f.pts)} punti · ${Math.round(f.cond)} cond.${f.risk>=0.005?` · rischio ${Math.max(1,Math.round(f.risk*100))}%`:''}`;
}
// la seduta di squadra che il programma sceglierebbe adesso
function progTeamPick(){
  const ok=SQ.filter(p=>!p.inj),avg=SQ.reduce((a,p)=>a+p.cond,0)/Math.max(1,SQ.length),pr=progOf();
  if(avg<PROG_REST)return TR_OPTS.find(c=>c.id==='rec');
  if(pr.team&&pr.team!=='auto'){const c=TR_OPTS.find(x=>x.id===pr.team);if(c)return c;}
  let best=CATS[0],bs=-1;for(const c of CATS){const v=trainForecast(ok,c,false).pts;if(v>bs){bs=v;best=c;}}
  return best;
}
// i lavori individuali: [giocatore, indirizzo]
function progSinglePick(n){
  const out=[],used=new Set(),rec=TR_OPTS.find(c=>c.id==='rec');
  const bestCat=p=>{let b=CATS[0],bs=-1;for(const c of CATS){const v=trainExpect(p,c,trainMul(p)*1.5);if(v>bs){bs=v;b=c;}}return [b,bs];};
  const add=(p,c)=>{if(out.length<n&&!used.has(p)&&!p.tr){used.add(p);out.push([p,c]);}};
  for(const p of SQ.filter(q=>q.pri))add(p,p.inj||p.cond<PROG_LOW?rec:bestCat(p)[0]);                      // le tue priorita'
  for(const p of SQ.filter(q=>q.inj>1).sort((a,b)=>b.inj-a.inj))add(p,rec);                                 // stop lunghi: il Recupero li accorcia
  for(const p of SQ.filter(q=>!q.inj&&q.cond<PROG_LOW&&(SV.lineO.includes(q.full)||SV.lineD.includes(q.full))).sort((a,b)=>a.cond-b.cond))add(p,rec);   // titolari scarichi
  for(const x of SQ.filter(q=>!q.inj).map(p=>[p,bestCat(p)]).sort((a,b)=>b[1][1]-a[1][1]))add(x[0],x[1][0]);   // poi chi cresce di piu'
  return out;
}
// esegue il programma (se acceso e se c'e' una sessione disponibile). Ritorna il riepilogo, oppure null
function autoTrain(){
  const pr=progOf();if(!pr.on||SV.done||!trainOpen())return null;
  const left=3-SQ.filter(p=>p.tr).length;if(SV.tTeam&&left<=0)return null;
  const parts=[];let gain=0,hurt=0;
  if(!SV.tTeam){
    const opt=progTeamPick();for(const p of SQ)if(!p.inj||opt.id==='rec'){const r=trainApply(p,opt,false);gain+=r.gain||0;if(r.hurt)hurt++;}
    SV.tTeam=true;if(opt.id==='tat')SV.chem=clamp(SV.chem+3,0,100);if(opt.id==='rec')SV.mor=clamp(SV.mor+2,0,100);
    parts.push('squadra: '+opt.name);
  }
  const sg=progSinglePick(left);
  for(const [p,opt] of sg){const r=trainApply(p,opt,true);p.tr=true;gain+=r.gain||0;if(r.hurt)hurt++;}
  if(sg.length)parts.push('individuale: '+sg.map(x=>(x[0].name)+' ('+x[1].name+')').join(', '));
  if(!parts.length)return null;
  fixLines();
  const txt='Programma di allenamento · '+parts.join(' · ')+(gain?' · +'+gain+(gain>1?' punti':' punto'):'')+(hurt?' · '+hurt+(hurt>1?' infortunati':' infortunato'):'')+'.';
  alertAdd('club',txt);
  return txt;
}

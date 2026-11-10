/* ===================== ULTIMATE TEAM =====================
   Si parte aprendo un pacchetto da 10 giocatori casuali (piu' sono forti, piu' sono rari), si sceglie la rosa e si gioca un torneo a eliminazione diretta
   di 64 squadre (6 turni). Le avversarie crescono di forza a ogni turno. Dopo ogni vittoria si apre un nuovo pacchetto (sempre migliore). */
const UT_KEY='ultimate-ut',UT_POWERS=[50,58,64,72,84,98],UT_ROUNDS=['Trentaduesimi','Sedicesimi','Ottavi','Quarti','Semifinale','Finale'];
const UT_OFF={D:{lan:-8,buc:-9,spa:-9,vis:1,dif:13,sal:6,sca:5,tuf:8,vel:6,res:5,pre:-3,agi:6},H:{lan:8,buc:8,spa:8,vis:5,dif:-7,sal:-7,sca:-7,tuf:-7,vel:-7,res:-7,pre:-2,agi:-5},C:{lan:-9,buc:-9,spa:-9,vis:-3,dif:7,sal:7,sca:7,tuf:7,vel:7,res:7,pre:6,agi:7}};
const UT_LETTERS='ABCDEFGHILMNOPRSTVZ';
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
function utPlayer(role,ovr,rng){
  const nm=NAME_POOL[Math.floor(rng()*NAME_POOL.length)]+' '+UT_LETTERS[Math.floor(rng()*UT_LETTERS.length)]+'.',st=utStats(role,ovr,rng);
  const r=role==='H'?'H':'C';   // carte specializzate: Handler, Cutter e Defender (un cutter costruito per difendere); circa una su quattro ha un tratto
  return {n:nm,full:nm,label:nm,gen:true,r,age:18+Math.floor(rng()*14),tl:99,tf:99,tv:99,s:st,ovr:Math.round(ovrX({s:st,r})),trait:traitFor(nm,st,r),up:0};
}
const utRar=o=>o>=90?['Leggenda','leg']:(o>=80?['Epico','epi']:(o>=65?['Raro','rar']:(o>=50?['Non comune','unc']:['Comune','com'])));
// rarita': ovr = 38 + 58*U^UT_E (UT_E=6): media 46, il 5,4% dei giocatori supera 80, il 2,0% supera 90, lo 0,4% supera 95. Rarita' uguale per tutti i pacchetti (niente piu' pacchetti migliori man mano).
// Il primo pacchetto in assoluto ha 10 giocatori (4 handler + 6 cutter), tutti i successivi 5 (2 handler + 3 cutter)
const UT_E=6;
const utPackOvr=()=>Math.round(38+58*Math.pow(Math.random(),UT_E));
const utPackSize=()=>UT.col.length?5:10;
function utMakePack(){const roles=utPackSize()===10?['H','H','H','H','C','C','C','C','D','D']:['H','H','C','C','D'];return roles.map(r=>utPlayer(r,utPackOvr(),Math.random)).sort((a,b)=>a.ovr-b.ovr);}
// squadra avversaria del turno: 7 titolari con media esatta = forza del turno, 7 di panchina piu' deboli
function utOppRoster(power,seed){
  const rng=mulberry32(hashStr(seed)),v=[],roles=['H','H','H','C','C','C','C'];let tot=0;
  for(let i=0;i<7;i++){const x=(rng()+rng()+rng()-1.5)*3;v.push(x);tot+=x;}
  const out=v.map((x,i)=>utPlayer(roles[i],clamp(power+x-tot/7,30,99),rng));
  for(let i=0;i<7;i++)out.push(utPlayer(i<3?'H':'C',clamp(power-12+(rng()-0.5)*10,30,99),rng));
  return out;
}
const UT_DIFF=[{name:'Facile',txt:'L’IA avversaria gioca come sempre.'},{name:'Medio',txt:'L’IA avversaria sceglie e reagisce un po’ meglio.'},{name:'Difficile',txt:'L’IA avversaria sceglie e reagisce molto meglio.'},{name:'Estrema',txt:'Come Difficile, ma la traiettoria del lancio si vede solo all’inizio (un breve tratto tratteggiato).'}];
const UT={on:false,d:0,manual:false,col:[],sel:[],round:0,tid:0,packs:[],st:'play',res:'',opp:[],stage:'closed',cur:[],coins:0,stat:{w:0,t:0,up:0},claimed:{},mode:'sel'};   // col: giocatori; sel: indici dei 7 titolari; packs: qualita' dei pacchetti da aprire
function utSave(){try{localStorage.setItem(UT_KEY,JSON.stringify({v:2,d:UT.d,manual:UT.manual,col:UT.col,sel:UT.sel,round:UT.round,tid:UT.tid,packs:UT.packs,st:UT.st,res:UT.res,coins:UT.coins,stat:UT.stat,claimed:UT.claimed}));}catch(e){}}
function utOpps(){   // 6 avversarie del torneo: squadre vere scelte con un seme
  const names=Object.keys(TEAM),rng=mulberry32(hashStr('utopp|'+UT.tid)),pick=[];
  while(pick.length<6){const n=names[Math.floor(rng()*names.length)];if(!pick.includes(n))pick.push(n);}
  UT.opp=pick.map((n,i)=>({name:n,power:UT_POWERS[i]}));
}
function utLoad(){
  try{const o=JSON.parse(localStorage.getItem(UT_KEY)||'null');if(o&&Array.isArray(o.col)){for(const c of o.col)if(c&&c.s)fillStats(c.s);for(const pk of (o.packs||[]))for(const c of (Array.isArray(pk)?pk:[]))if(c&&c.s)fillStats(c.s);UT.col=o.col;UT.d=(o.d>=0&&o.d<4)?o.d|0:0;UT.manual=!!o.manual;UT.sel=(o.sel||[]).filter(i=>o.col[i]);UT.round=o.round|0;UT.tid=o.tid|0;UT.packs=o.packs||[];UT.st=o.st||'play';UT.res=o.res||'';UT.coins=o.coins|0;UT.stat=Object.assign({w:0,t:0,up:0},o.stat||{});UT.claimed=o.claimed||{};
    for(const c of UT.col){c.ovr=ovr(c);if(c.trait===undefined)c.trait=traitFor(c.full||c.n,c.s,c.r);c.up=c.up|0;}}}catch(e){}   // salvataggi precedenti: il valore delle carte diventa l'Overall nel ruolo
  if(UT.tid)utOpps();
}
function utEnter(){
  if(!UT.col.length&&!UT.packs.length){UT.tid=1;UT.round=0;UT.st='play';UT.packs=[0];UT.res='';utOpps();utSave();}
  showScreen('ut');
}
function utAuto(){   // i 3 migliori handler e i 4 migliori cutter
  const idx=UT.col.map((p,i)=>i).sort((a,b)=>UT.col[b].ovr-UT.col[a].ovr),H=idx.filter(i=>UT.col[i].r==='H'),C=idx.filter(i=>UT.col[i].r==='C');
  let sel=H.slice(0,3).concat(C.slice(0,4));
  if(sel.length<7)sel=sel.concat(idx.filter(i=>!sel.includes(i)).slice(0,7-sel.length));
  UT.sel=sel;
}
const utPower=()=>UT.sel.length?Math.round(UT.sel.reduce((a,i)=>a+ovrX(UT.col[i]),0)/UT.sel.length):0;
function renderUT(){
  const has=UT.col.length>0,pend=UT.packs.length,playing=UT.st==='play'&&!pend&&UT.sel.length===7;
  $('uStats').innerHTML=has?`Rosa: <b>${UT.col.length}</b> giocatori · Forza: <b>${utPower()}</b> (titolari ${UT.sel.length}/7) · Gettoni: <b>${UT.coins}</b>`:'Apri il tuo primo pacchetto per iniziare.';
  $('uBuy').textContent=`Compra un pacchetto (${UT_PACK_COST} gettoni)`;$('uBuy').classList.toggle('hidden',!has);$('uBuy').disabled=UT.coins<UT_PACK_COST;
  $('uObj').innerHTML=has?UT_OBJ.filter(o=>!UT.claimed[o.id]).slice(0,3).map(o=>`<div class="chal"><div><b>${o.txt}</b><small>${o.pr()} · premio ${o.rw} gettoni</small></div><button type="button" class="go" data-obj="${o.id}"${o.ok()?'':' disabled'}>${o.ok()?'Riscuoti':'In corso'}</button></div>`).join(''):'';
  $('uRounds').innerHTML=UT_ROUNDS.map((n,i)=>{const c=(UT.st==='won'||i<UT.round)?'done':(i===UT.round?(UT.st==='out'?'lost':'cur'):'');return `<span class="uchip ${c}"><small>${n}</small><b>${UT_POWERS[i]}</b></span>`;}).join('');
  $('uPack').classList.toggle('hidden',!pend);
  $('uPackT').textContent=UT.packs[0]===0&&!has?'Apri il pacchetto iniziale':`Apri pacchetto${pend>1?' ('+pend+')':''}`;
  $('uPackS').textContent=pend?`${utPackSize()} giocatori casuali: più sono forti, più sono rari`:'';
  const r=Math.min(UT.round,5),o=UT.opp[r];
  $('uPlayRow').classList.toggle('hidden',UT.st!=='play'||!!pend||!has);
  $('uPlay').disabled=!playing;$('uSim').disabled=!playing;
  $('uPlayT').textContent=`Gioca: ${UT_ROUNDS[r]}`;
  $('uPlayS').textContent=o?(UT.sel.length===7?`Contro ${o.name} · forza ${o.power} (tu ${utPower()})`:'Scegli 7 titolari nella tua squadra'):'';
  $('uTeam').classList.toggle('hidden',!has);
  $('uTeamS').textContent=has?`${UT.col.length} giocatori · scegli i 7 titolari`:'';
  $('uNew').classList.toggle('hidden',UT.st==='play');
  $('uDiff').innerHTML=UT_DIFF.map((d,i)=>`<button type="button" class="sg${i===UT.d?' on':''}" data-d="${i}">${d.name}</button>`).join('');$('uDiffN').textContent=UT_DIFF[UT.d].txt+' Le avversarie hanno sempre la forza del turno.';
  $('uMsg').textContent=UT.res||'';
}
$('tUT').addEventListener('click',utEnter);
$('uBack').addEventListener('click',()=>showScreen('title'));
$('uPack').addEventListener('click',()=>{UT.stage='closed';showScreen('utPack');});
$('uTeam').addEventListener('click',()=>showScreen('utTeam'));
$('uPlay').addEventListener('click',startUT);
$('uDiff').addEventListener('click',e=>{const b=e.target.closest('.sg');if(!b)return;UT.d=+b.dataset.d;utSave();renderUT();});
$('uSim').addEventListener('click',simUTMatch);
$('uBuy').addEventListener('click',()=>{if(UT.coins<UT_PACK_COST)return;UT.coins-=UT_PACK_COST;UT.packs.push(1);utSave();renderUT();});
$('uObj').addEventListener('click',e=>{const b=e.target.closest('[data-obj]');if(!b||b.disabled)return;const o=UT_OBJ.find(x=>x.id===b.dataset.obj);if(!o||UT.claimed[o.id]||!o.ok())return;UT.claimed[o.id]=true;UT.coins+=o.rw;UT.res=`Obiettivo raggiunto: +${o.rw} gettoni.`;utSave();renderUT();});
$('uNew').addEventListener('click',()=>{UT.tid++;UT.round=0;UT.st='play';UT.res='';UT.packs.push(0);utOpps();utSave();renderUT();});
// ---- apertura del pacchetto ----
const utPos=p=>POS_NAME[posOf(p)];
const utCard=(p,i)=>{const [rn,rc]=utRar(p.ovr);return `<div class="ucard ${rc}" style="animation-delay:${(i*0.3).toFixed(2)}s"><b>${p.ovr}</b><span>${p.n}</span><i>${utPos(p)} · ${rn}</i>${p.trait&&TRAITS[p.trait]?`<i style="color:#e0b3ff">${TRAITS[p.trait][0]}</i>`:''}</div>`;};
function renderPack(){
  const open=UT.stage==='open';
  $('pkTitle').textContent=open?'Ecco i tuoi giocatori':(!UT.col.length?'Pacchetto iniziale':'Pacchetto premio');
  $('pkBody').innerHTML=open?`<div class="ucards">${UT.cur.map(utCard).join('')}</div>`:`<div class="pack"><b>${utPackSize()}</b><span>GIOCATORI</span></div>`;
  $('pkGo').textContent=open?(UT.packs.length?`Prossimo pacchetto (${UT.packs.length})`:'Continua'):'Apri';
}
$('pkGo').addEventListener('click',()=>{
  if(UT.stage==='closed'){
    UT.packs.shift();UT.cur=utMakePack();UT.cur.forEach(p=>{p.isNew=true;UT.col.push(p);});
    if(UT.sel.length<7||!UT.manual)utAuto();   // finche' non scegli tu i titolari, restano i migliori 7
    utSave();UT.stage='open';renderPack();
  }else if(UT.packs.length){UT.stage='closed';renderPack();}
  else showScreen('ut');
});
// ---- la tua squadra: scegli i 7 titolari ----
function renderTeamUT(){
  const idx=UT.col.map((p,i)=>i).sort((a,b)=>UT.col[b].ovr-UT.col[a].ovr);
  for(const b of $('tmMode').children)b.classList.toggle('on',b.dataset.m===UT.mode);
  const tip=UT.mode==='sel'?'tocca un giocatore per metterlo o toglierlo dai titolari':(UT.mode==='up'?'tocca una carta per potenziarla (+1 a tutte le statistiche, fino a 5 volte): il prezzo è accanto al nome':'tocca una riserva per scartarla e recuperare gettoni (i titolari non si scartano)');
  $('tmInfo').innerHTML=`Titolari: <b>${UT.sel.length}/7</b> · Forza: <b>${utPower()}</b> · Gettoni: <b>${UT.coins}</b> — ${tmMsg||tip}`;
  const hdr=`<div class="urow hd"><span></span><span>Giocatore</span><span></span>${SHOW.map(k=>`<span class="sv">${k.toUpperCase()}</span>`).join('')}</div>`;
  $('tmList').innerHTML=hdr+idx.map(i=>{const p=UT.col[i],rc=utRar(p.ovr)[1],ex=UT.mode==='up'?((p.up|0)>=5?'max':utUpCost(p)+'g'):(UT.mode==='del'&&!UT.sel.includes(i)?'+'+UT_SELL[rc]+'g':'');
    return `<div class="urow ${rc}${UT.sel.includes(i)?' sel':''}" data-i="${i}"><b class="uo">${p.ovr}</b><span class="un">${p.n}${p.isNew?'<span class="nw">NEW</span>':''}${p.up?`<span class="upb">+${p.up}</span>`:''}${ex?`<span class="upb" style="color:var(--gold)">${ex}</span>`:''}</span><em title="${p.trait&&TRAITS[p.trait]?TRAITS[p.trait][0]:''}">${posOf(p)}${p.trait?'*':''}</em>${SHOW.map(k=>`<span class="sv">${p.s[k]}</span>`).join('')}</div>`;}).join('');
  UT.col.forEach(p=>{p.isNew=false;});utSave();
}
let tmMsg='';
$('tmMode').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;UT.mode=b.dataset.m;tmMsg='';renderTeamUT();});
$('tmList').addEventListener('click',e=>{
  const r=e.target.closest('.urow[data-i]');if(!r)return;const i=+r.dataset.i,k=UT.sel.indexOf(i),p=UT.col[i];tmMsg='';
  if(UT.mode==='up'){
    const c=utUpCost(p);
    if((p.up|0)>=5)tmMsg='questa carta è già al massimo dei potenziamenti.';
    else if(UT.coins<c)tmMsg=`servono ${c} gettoni per potenziare ${p.n}.`;
    else{UT.coins-=c;p.up=(p.up|0)+1;for(const q of KEYS)p.s[q]=Math.min(99,p.s[q]+1);p.ovr=ovr(p);UT.stat.up++;tmMsg=`${p.n} potenziato: ora vale ${p.ovr}.`;}
    renderTeamUT();return;
  }
  if(UT.mode==='del'){
    if(k>=0)tmMsg='i titolari non si scartano: toglilo prima dai titolari.';
    else if(UT.col.length<=7)tmMsg='servono almeno 7 giocatori.';
    else{const g=UT_SELL[utRar(p.ovr)[1]];UT.coins+=g;UT.col.splice(i,1);UT.sel=UT.sel.map(x=>x>i?x-1:x);tmMsg=`${p.n} scartato: +${g} gettoni.`;}
    renderTeamUT();return;
  }
  UT.manual=true;
  if(k>=0)UT.sel.splice(k,1);else if(UT.sel.length<7)UT.sel.push(i);else tmMsg='hai già 7 titolari: togline uno prima di aggiungerne un altro.';
  renderTeamUT();
});
$('tmAuto').addEventListener('click',()=>{UT.manual=false;utAuto();utSave();renderTeamUT();});
$('tmBack').addEventListener('click',()=>showScreen('ut'));
// ---- partita del torneo ----
// ---- SIMULA PARTITA (carriera e Ultimate Team): il risultato dipende dalla forza delle due squadre. Calibrato con 630 partite del motore di gioco tra squadre di forza diversa:
//  la probabilita' di vincere un punto segue una logistica della differenza di forza (0,15 per punto di differenza fino a 12, 0,09 oltre); a pari forza vince il 53% delle partite.
//  Difficolta' dell'IA (solo Ultimate Team): equivale a una squadra avversaria piu' forte di 1,3 (Medio) o 1,8 (Difficile ed Estrema) punti. Si gioca ai 7 punti, come la partita vera.
let simAfter=null;
function showSim(win,score,msg,after){
  $('srTitle').textContent=win?'Vittoria!':'Sconfitta';$('srScore').textContent=score;$('srEvent').textContent=msg;simAfter=after;$('simres').classList.remove('hidden');
}
$('srOk').addEventListener('click',()=>{$('simres').classList.add('hidden');const f=simAfter;simAfter=null;if(f)f();});
function simCareerMatch(){
  const m=nextMatch();if(!m)return;
  SQ.forEach(p=>{p.injNew=false;});fixLineup();   // gli infortunati non giocano, come nella partita vera
  fixLines();
  const lo=matchLine('lineO').map(id=>SQ[id]),ld=matchLine('lineD').map(id=>SQ[id]),all=lo.concat(ld),avg=l=>l.reduce((a,p)=>a+mean9(p),0)/Math.max(1,l.length);
  const tired=all.reduce((a,p)=>a+(100-p.cond),0)/Math.max(1,all.length);
  // forza = media delle due linee, con gli stessi effetti di una partita giocata: affiatamento e morale, condizione fisica
  const opp=(m.roster?rosterPower(m.roster):m.power)+carDiff().plus,my=(avg(lo)+avg(ld))/2+teamFormB()*0.8-tired*0.04;
  const r=simMatch(my,opp,0),w=r.a>r.b;
  // una partita simulata vale come una giocata: stessa esperienza media, statistiche personali, fatica
  const on=new Set(matchLine('lineO').concat(matchLine('lineD')));
  for(const p of SQ){p.m=newCounters();if(on.has(p.id)&&!p.inj){p.m.pts=1;growBy(p,simParts(p,1),XP_ROLE[posOf(p)]);}}
  simMatchStats(r.a);
  const msg=recordResult(w,r.a,r.b)+incTxt();
  showSim(w,`${SV.team} ${r.a} – ${r.b} ${m.name}`,msg,()=>renderHome());
}
function simUTMatch(){
  if(UT.sel.length!==7||UT.st!=='play'||UT.packs.length)return;
  const o=UT.opp[UT.round],my=UT.sel.reduce((a,i)=>a+mean9(UT.col[i]),0)/7;
  const r=simMatch(my,o.power,UT.d),w=r.a>r.b,msg=utRecord(w);
  showSim(w,`Ultimate Team ${r.a} – ${r.b} ${o.name}`,msg,()=>renderUT());
}
function startUT(){
  if(UT.sel.length!==7||UT.st!=='play')return;
  const r=UT.round,opp=UT.opp[r];
  if(hasCareer()){persist();QM.bak=JSON.stringify(SV);}else QM.bak=null;   // la carriera resta com'e': viene rimessa alla fine
  QM.on=true;UT.on=true;
  setSquad(UT.col);setLineup(UT.sel.slice());
  applyRoster(utOppRoster(UT_POWERS[r],'ut|'+UT.tid+'|'+r));
  SQ.forEach(p=>{p.injNew=false;p.inj=0;p.cond=100;});
  G.formB=0;G.lines=null;G.injK=1;
  G.oppName=opp.name;G.myName='Ultimate Team';G.matchLabel='Ultimate Team · '+UT_ROUNDS[r];
  newGame();G.lvl=[0,Math.min(2,UT.d|0)];G.oppPlus=0;G.idn=[null,teamIdentity(opp.name,T[1])];G.xtr=(UT.d|0)===3;G.hint=(UT.d|0)===0;G.routes=(UT.d|0)<=1;G.inMatch=true;G.recorded=false;   // difficolta': IA come in partita veloce, Estrema = traiettoria nascosta
  hideScreens();$('over').classList.add('hidden');
  startPoint(G.nextRec);cam.snap=true;
}
// gettoni: si guadagnano giocando (di piu' vincendo e andando avanti), si spendono in pacchetti e potenziamenti; scartando i doppioni se ne recuperano
const UT_PACK_COST=90,UT_SELL={com:4,unc:8,rar:20,epi:55,leg:140};
const utUpCost=p=>12+Math.max(0,p.ovr-50)*2+(p.up|0)*6;
const UT_OBJ=[
  {id:'w3',txt:'Vinci 3 partite',rw:60,ok:()=>UT.stat.w>=3,pr:()=>Math.min(3,UT.stat.w)+'/3'},
  {id:'w10',txt:'Vinci 10 partite',rw:150,ok:()=>UT.stat.w>=10,pr:()=>Math.min(10,UT.stat.w)+'/10'},
  {id:'rare7',txt:'Schiera 7 titolari Rari o migliori',rw:80,ok:()=>UT.sel.length===7&&UT.sel.every(i=>UT.col[i]&&UT.col[i].ovr>=65),pr:()=>UT.sel.filter(i=>UT.col[i]&&UT.col[i].ovr>=65).length+'/7'},
  {id:'col25',txt:'Colleziona 25 giocatori',rw:50,ok:()=>UT.col.length>=25,pr:()=>Math.min(25,UT.col.length)+'/25'},
  {id:'up5',txt:'Potenzia le tue carte 5 volte',rw:60,ok:()=>UT.stat.up>=5,pr:()=>Math.min(5,UT.stat.up)+'/5'},
  {id:'cup',txt:'Vinci un torneo',rw:200,ok:()=>UT.stat.t>=1,pr:()=>Math.min(1,UT.stat.t)+'/1'}
];
function utRecord(win){
  const r=UT.round,gain=win?40+15*r:15;UT.coins+=gain;if(win){UT.stat.w++;if(r>=5)UT.stat.t++;}
  if(win){
    if(r>=5){UT.st='won';UT.round=6;UT.packs.push(6);UT.res='Campioni! Hai vinto il torneo e ottieni un pacchetto speciale.';}
    else{UT.round=r+1;UT.packs.push(r+1);UT.res=`Passi ai ${UT_ROUNDS[r+1]}: hai ottenuto un nuovo pacchetto.`;}
  }else{UT.st='out';UT.res=`Eliminati ai ${UT_ROUNDS[r]}. Puoi iniziare un nuovo torneo e tenere i tuoi giocatori.`;}
  UT.res+=` +${gain} gettoni.`;
  utSave();return UT.res;
}
utLoad();

const quickNext=()=>DR.on?'school':(TN.on?'tourn':(UT.on?'ut':'quick'));
function exitQuick(next){
  DR.on=false;TN.on=false;G.drill=null;$('coach').classList.add('hidden');$('drEnd').classList.add('hidden');
  QM.on=false;UT.on=false;G.inMatch=false;G.schemeOpen=false;$('menu').classList.add('hidden');$('over').classList.add('hidden');
  if(QM.bak){SV={};loadSave(JSON.parse(QM.bak));}else{SV={};initTeams();}   // rimetto la rosa della carriera (o quella iniziale)
  QM.bak=null;showScreen(next||'title');
}


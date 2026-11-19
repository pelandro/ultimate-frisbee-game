/* ===================== ULTIMATE TEAM · REAL PLAYER =====================
   Partite a distanza contro le squadre di altri giocatori, senza che siano online insieme: ognuno carica la propria squadra (7 titolari e le migliori
   7 riserve) su Firebase Realtime Database; «Inizia partita» sceglie la squadra di un giocatore con punti Elo vicini ai tuoi e la fa giocare all'IA.
   I punti cambiano solo a chi gioca (logica in 10-sim/19-ut-classifica.js) e finiscono nella classifica online.
   La squadra di Real player e' separata da quella del torneo contro il computer (utUse): ha i suoi giocatori, i suoi gettoni e i suoi pacchetti.
   Il nome si sceglie una volta sola.
   Solo richieste web semplici (fetch, nessuna libreria): senza connessione il resto del gioco funziona come sempre.
   Per attivarlo servono il progetto Firebase e le regole di sicurezza: docs/ULTIMATE-TEAM-ONLINE.md e docs/firebase-rules.json. */
const UTO_CFG={db:'https://ultimate-frisbee-e640e-default-rtdb.europe-west1.firebasedatabase.app',key:'AIzaSyC3r-oo8RQ5__-428NDT-PdzjTaiUoGbFg'};   // databaseURL e apiKey del progetto Firebase: per natura pubblici, la sicurezza sta nelle regole del database
const UTO_KEY='ultimate-ut-online',UTH_OKEY='ultimate-ut-eroi-online';
// i Superpoteri (UT.hm) giocano online come Real player, ma con un profilo, una classifica e squadre loro: radice «uh» invece di «ut» nel database
const uoKey=()=>UT.hm?UTH_OKEY:UTO_KEY,uoRoot=()=>UT.hm?'uh':'ut',uoMode=()=>UT.hm?'Superpoteri':'Sfide online';
const UO={on:false,opp:null,busy:false,flush:false,tried:0,msg:''};
// profilo locale: id (utente anonimo di Firebase), nome, punti, partite, token di rinnovo; dirty = risultato non ancora inviato; fresh = il nodo online non esiste ancora;
// op = punti dell'avversario di una partita iniziata e non finita (se chiudi il gioco a meta' conta come sconfitta)
function uoReadP(k){
  try{const o=JSON.parse(localStorage.getItem(k)||'null');if(o&&typeof o.id==='string'&&o.id)return {id:o.id,name:utoName(o.name),p:clamp(o.p|0,0,UTO_MAXP),w:o.w|0,l:o.l|0,g:o.g|0,rt:String(o.rt||''),dirty:!!o.dirty,fresh:!!o.fresh,last:String(o.last||''),op:typeof o.op==='number'?o.op:null};}catch(e){}
  return null;
}
let UOP=uoReadP(UTO_KEY);
const uoSaveP=()=>{try{localStorage.setItem(uoKey(),JSON.stringify(UOP));}catch(e){}};
// profilo della modalita' caricata (dopo utUse). Il nome e l'accesso anonimo sono gli stessi nelle due: chi ha gia' scelto il nome in una lo ritrova
// nell'altra, con i punti che ripartono da quelli iniziali
function uoUseP(){
  UOP=uoReadP(uoKey());uoTok='';uoExp=0;
  if(!UOP){const o=uoReadP(UT.hm?UTO_KEY:UTH_OKEY);if(o){UOP={id:o.id,name:o.name,p:UTO_START,w:0,l:0,g:0,rt:o.rt,dirty:false,fresh:true,last:'',op:null};uoSaveP();}}
}
const uoOk=()=>!!(UTO_CFG.db&&UTO_CFG.key);
const uoOffline=()=>typeof navigator!=='undefined'&&navigator.onLine===false;
// ---- rete ----
async function uoJson(url,opt){
  const r=await fetch(url,opt);let j=null;try{j=await r.json();}catch(e){}
  if(!r.ok){const m=j&&j.error,e=new Error(typeof m==='string'?m:(m&&m.message)||('HTTP '+r.status));e.status=r.status;throw e;}
  return j;
}
let uoTok='',uoExp=0;
const uoLife=s=>Date.now()+Math.max(60,(s|0)-60)*1000;
async function uoSignUp(){   // accesso anonimo: l'utente non vede niente, serve solo a legare la tua squadra al tuo dispositivo (le regole del database lo chiedono)
  const j=await uoJson('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key='+encodeURIComponent(UTO_CFG.key),{method:'POST',headers:{'Content-Type':'application/json'},body:'{"returnSecureToken":true}'});
  uoTok=j.idToken;uoExp=uoLife(j.expiresIn);return {id:j.localId,rt:j.refreshToken};
}
async function uoToken(){
  if(uoTok&&Date.now()<uoExp)return uoTok;
  if(!UOP||!UOP.rt)throw new Error('Nessun accesso: scegli il nome');
  const j=await uoJson('https://securetoken.googleapis.com/v1/token?key='+encodeURIComponent(UTO_CFG.key),{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=refresh_token&refresh_token='+encodeURIComponent(UOP.rt)});
  uoTok=j.id_token;uoExp=uoLife(j.expires_in);
  if(j.refresh_token&&j.refresh_token!==UOP.rt){UOP.rt=j.refresh_token;uoSaveP();}
  return uoTok;
}
// le letture sono pubbliche (classifica e squadre); le scritture servono l'accesso e valgono solo per il proprio nodo
async function uoDb(method,path,body,q){
  const base=UTO_CFG.db.replace(/\/+$/,'')+'/'+path+'.json',tok=method==='GET'?'':'auth='+encodeURIComponent(await uoToken());
  const qs=[tok,q].filter(Boolean).join('&');
  return uoJson(base+(qs?'?'+qs:''),body===undefined?{method}:{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
}
function uoErr(e){
  if(uoOffline()||e instanceof TypeError)return `Nessuna connessione: ${uoMode()} ha bisogno di internet. Il resto del gioco funziona anche offline.`;
  if(e&&(e.status===401||e.status===403))return `Il server di ${uoMode()} ha rifiutato la richiesta: riprova più tardi.`;   // per chi sviluppa: regole di sicurezza e accesso anonimo in docs/ULTIMATE-TEAM-ONLINE.md
  return 'Errore online: '+((e&&e.message)||'sconosciuto')+'. Riprova tra poco.';
}
const uoNode=pw=>({n:UOP.name,p:UOP.p,w:UOP.w,l:UOP.l,g:UOP.g,pw,u:Date.now()});
// riga della classifica / candidato: il dato arriva da internet, quindi si controlla
function uoRow(id,v){
  if(!v||typeof v!=='object')return null;
  const p=Number(v.p),pw=Number(v.pw);if(!isFinite(p)||!isFinite(pw)||pw<=0)return null;
  return {id,n:utoName(v.n)||'Giocatore',p:clamp(Math.round(p),0,UTO_MAXP),pw:Math.round(pw),w:v.w|0,l:v.l|0,g:v.g|0};
}
const uoRows=j=>Object.keys(j||{}).map(id=>uoRow(id,j[id])).filter(Boolean);
// carica la tua squadra e i tuoi punti (se un risultato non e' ancora partito, parte adesso)
let uoWrites=Promise.resolve();
function uoWrite(task){
  const pending=uoWrites.then(task);
  uoWrites=pending.catch(()=>{});
  return pending;
}
async function uoSync(){
  if(!UOP||UT.sel.length!==7)return null;
  if(UT.hm)utHeroFix();
  const profile=UOP,root=uoRoot();
  const pk=utoPack(UT.col.map(p=>eqApply(p,UT.eq)),UT.sel,UT.hm?UT.hc:null);   // online la squadra va con l'equipaggiamento che indossi: e' quella che gli altri affrontano
  return uoWrite(async()=>{
    if(UOP!==profile)return null;
    const p=profile,g=p.g;
    if(p.fresh){
      await uoDb('PUT',root+'/players/'+p.id,uoNode(pk.pw));
      p.fresh=false;
    }else{
      const patch={n:p.name,pw:pk.pw,u:Date.now()};
      if(p.dirty){patch.p=p.p;patch.w=p.w;patch.l=p.l;patch.g=g;}
      await uoDb('PATCH',root+'/players/'+p.id,patch);
    }
    if(p.g===g)p.dirty=false;
    if(UOP===profile)uoSaveP();
    if(UOP===profile)await uoDb('PUT',root+'/teams/'+p.id,{m:pk.m});
    return pk;
  });
}
async function uoFindOpp(current){
  const root=uoRoot(),profile=UOP;
  const seen=new Map(),add=j=>{for(const r of uoRows(j))seen.set(r.id,r);};
  for(const w of UTO_WIN){
    add(await uoDb('GET',root+'/players',undefined,`orderBy=%22p%22&startAt=${Math.max(0,profile.p-w)}&endAt=${profile.p+w}&limitToFirst=40`));
    if(!current())return null;
    const o=utoPickOpp([...seen.values()],profile.id,profile.p,profile.last,Math.random);if(o)return o;
  }
  add(await uoDb('GET',root+'/players',undefined,'orderBy=%22p%22&limitToLast=40'));   // nessuno vicino: il piu' vicino tra gli ultimi arrivati in classifica
  if(!current())return null;
  return utoPickOpp([...seen.values()],profile.id,profile.p,profile.last,Math.random);
}
// invio del risultato in sospeso (in secondo piano: se fallisce resta da inviare e riparte alla prossima occasione)
async function uoPush(){
  if(!UOP||!UOP.dirty||UOP.fresh||UO.flush||uoOffline()||!uoOk())return;
  UO.flush=true;UO.tried=Date.now();
  const profile=UOP,root=uoRoot();
  try{
    await uoWrite(async()=>{
      if(UOP!==profile)return;
      const p=profile,g=p.g;
      if(!p.dirty)return;
      await uoDb('PATCH',root+'/players/'+p.id,{p:p.p,w:p.w,l:p.l,g,u:Date.now()});
      if(p.g===g)p.dirty=false;
      if(UOP===profile)uoSaveP();
    });
  }catch(e){}
  finally{UO.flush=false;if(!UOP.dirty&&!$('utReal').classList.contains('hidden'))renderUtReal();}
}
// ---- partita ----
function uoLaunch(o,ros){
  if(hasCareer()){persist();QM.bak=JSON.stringify(SV);}else QM.bak=null;   // la carriera resta com'e': viene rimessa alla fine
  QM.on=true;UT.on=true;UO.on=true;UO.opp=o;
  UOP.op=o.p;uoSaveP();   // se il gioco si chiude prima della fine, alla prossima apertura conta come sconfitta (come abbandonare)
  setSquad(UT.col.map(p=>eqApply(p,UT.eq)));setLineup(UT.sel.slice());
  applyRoster(ros);oppBoost(DIFF_PLUS[UTO_DIFF]);
  SQ.forEach(p=>{p.injNew=false;p.inj=0;p.cond=100;});
  G.formB=0;G.lines=null;G.injK=1;
  G.oppName=o.n;G.myName=UOP.name;G.matchLabel=uoMode()+' · '+UOP.p+' punti';
  // difficolta' fissa (Difficile, come nelle altre modalita': IA e bonus alle statistiche) uguale per tutti, cosi' i punti sono confrontabili; la squadra avversaria e' quella vera dell'altro giocatore
  newGame();rollWind();G.lvl=[0,UTO_DIFF];G.oppPlus=DIFF_PLUS[UTO_DIFF];G.idn=[null,teamIdentity(o.n,T[1])];G.xtr=false;G.hint=false;G.routes=false;G.inMatch=true;G.recorded=false;
  if(UT.hm)utHeroMatch(ros);   // Superpoteri: i tuoi eroi (carte assegnate ai titolari) e quelli della squadra avversaria
  hideScreens();$('over').classList.add('hidden');
  startPoint(G.nextRec);cam.snap=true;
}
let uoSearchVersion=0;
function uoCancelSearch(){uoSearchVersion++;UO.busy=false;UO.msg='';}
async function uoStart(){
  if(UO.busy)return;
  if(!UOP){UO.msg='Scegli prima il tuo nome.';renderUtReal();return;}
  if(UT.sel.length!==7){UO.msg='Servono 7 titolari: completa la tua squadra.';renderUtReal();return;}
  const version=++uoSearchVersion;
  const current=()=>version===uoSearchVersion&&!$('utReal').classList.contains('hidden');
  UO.busy=true;UO.msg='Cerco un avversario con i tuoi punti…';renderUtReal();
  try{
    await uoSync();
    if(!current())return;
    const o=await uoFindOpp(current);
    if(!current())return;
    if(!o&&UT.hm){UO.msg='';uoLaunch(utHeroBot(),utHeroBotRoster());return;}   // Superpoteri senza altri giocatori: una squadra del computer con i suoi eroi
    if(!o){UO.msg='Non ci sono ancora altri giocatori: invita un amico a creare la sua squadra.';return;}
    const tm=await uoDb('GET',uoRoot()+'/teams/'+o.id),ros=tm&&utoUnpack(tm.m,o.id);
    if(!current())return;
    if(!ros){UO.msg='La squadra di '+o.n+' non è valida: riprova e ti abbino a un’altra.';UOP.last=o.id;uoSaveP();return;}
    UOP.last=o.id;UO.msg='';uoLaunch(o,ros);
  }catch(e){if(current())UO.msg=uoErr(e);}
  finally{if(version===uoSearchVersion){UO.busy=false;if(current())renderUtReal();}}
}
// fine partita (chiamata da showOver, anche per l'abbandono): punti Elo contro i punti che l'avversario aveva quando e' stato scelto
function uoRecord(win){
  const d=utoDelta(UOP.p,UO.opp.p,win),np=clamp(UOP.p+d,0,UTO_MAXP),real=np-UOP.p;
  const c=utoCoins(UOP.p,UO.opp.p,win);   // il bonus guarda i punti di prima della partita
  UOP.p=np;UOP.g++;if(win)UOP.w++;else UOP.l++;UOP.dirty=true;UOP.op=null;uoSaveP();
  UT.coins+=c.base+c.bonus;if(win)UT.stat.w++;
  const grown=utGrowCards(),pk=uoMiles();utSave();
  const msg=`${uoMode()} · ${win?'vittoria':'sconfitta'} contro ${UO.opp.n} (${UO.opp.p} punti): ${real>=0?'+':''}${real} punti, ora ne hai ${np}. +${c.base+c.bonus} gettoni${c.bonus?` (${c.bonus} in più perché l’avversario aveva più punti di te)`:''}.`
    +(pk?` Traguardo dei ${utoMilePts(UT.ms)} punti raggiunto: ${UT.hm?(pk>1?pk+' pacchetti eroi':'un pacchetto eroi')+' da aprire':(pk>1?pk+' serie di pacchetti premio (giocatori e accessori)':'un pacchetto di giocatori e uno di accessori')+' da aprire'+(UT.ms===pk?', e da ora puoi potenziare le carte':'')}.`:'')
    +(grown.length?` ${grown.length===1?grown[0]+' è cresciuto':grown.length+' carte sono cresciute'} giocando.`:'');
  UO.msg=msg;uoPush();return msg;
}
// traguardi di punti non ancora premiati: un pacchetto per ognuno. Contano una volta sola (UT.ms sale e basta): se scendi e risali non si ripetono
function uoMiles(){
  if(!UOP||!UT.rp)return 0;
  let n=0;
  if(UT.hm){while((UT.ms|0)<utoMiles(UOP.p)){UT.ms=(UT.ms|0)+1;UT.msh=UT.ms;UT.packs.push(utHeroMile(UT.ms));n++;}return n;}   // Superpoteri: i giocatori arrivano da Real player, qui solo pacchetti eroi (sempre migliori)
  while((UT.ms|0)<utoMiles(UOP.p)){UT.ms=(UT.ms|0)+1;UT.packs.push(utoMilePack(UT.ms));n++;}
  while((UT.mse|0)<(UT.ms|0)){UT.mse=(UT.mse|0)+1;UT.packs.push(utoMileEq(UT.mse));}
  // e gli accessori dello stesso traguardo (anche quelli gia' raggiunti prima che esistesse l'equipaggiamento)
  return n;
}
// ingresso in Real player: si carica la sua squadra (quella del torneo resta salvata com'e') e, la prima volta, arriva il pacchetto iniziale
function uoEnter(hm){
  utUse(true,hm);uoUseP();
  if(hm){if(!Object.keys(UT.hc).length&&!UT.packs.length&&!(UT.ms|0))UT.packs=[HERO_START_PK];}   // Superpoteri: la squadra e' quella di Real player, all'inizio arrivano tre eroi diversi
  else if(!UT.col.length&&!UT.packs.length)UT.packs=[0];
  uoMiles();utSave();
}
function uoSettle(){   // partita lasciata a meta' (gioco chiuso): sconfitta
  if(!UOP||UOP.op===null||UOP.op===undefined||UO.on)return;
  const d=utoDelta(UOP.p,UOP.op,false),np=clamp(UOP.p+d,0,UTO_MAXP);
  UO.msg=`La partita lasciata a metà conta come sconfitta: ${np-UOP.p} punti.`;
  UOP.p=np;UOP.g++;UOP.l++;UOP.dirty=true;UOP.op=null;uoSaveP();
}
// ---- schermate ----
// i traguardi di punti, dal piu' alto in cima: disco del premio, punti, quante carte; il segno «Tu» sta tra l'ultimo raggiunto e il prossimo
function renderMiles(){
  const p=UOP?UOP.p:UTO_START,got=UT.ms|0,N=UTO_MILE_PK.length,nx=got+1;
  let h='<div class="urmh">Traguardi</div>',me=false;
  const you=()=>{me=true;return `<div class="urmy">Tu: <b>${p}</b> punti</div>`;};
  for(let i=N;i>=1;i--){
    const pk=utoMilePack(i),q=utPkQ(pk),n=utPackSize(pk),pt=utoMilePts(i),st=i<=got?'done':(i===nx?'next':'');
    if(!me&&p>=pt)h+=you();
    const hp=utHeroMile(i);
    h+=`<div class="urmr ${st}">${UT.hm?utDisc(utPkQ(hp),utPackSize(hp),'S'):utDisc(q,n,'')}<span><b>${pt} punti</b><small>${UT.hm?utHeroPackName(hp)+' · '+utPackSize(hp)+' eroi':`${q===6?'Super pacchetto':UT_PQN[q]} · ${n} giocatori + ${utPackSize(utoMileEq(i))} accessori${i===1?' · potenziamenti':''}`}</small></span><em>${st==='done'?'✓ ottenuto':(st==='next'?'mancano '+Math.max(0,pt-p):'')}</em></div>`;
  }
  if(!me)h+=you();
  h+=got>=N?`<p class="urmf">Poi un ${UT.hm?utHeroPackName(utHeroMile(got+1)):'Super pacchetto'} ogni ${UTO_MILE} punti: il prossimo a ${utoMilePts(got+1)}.</p>`:'';
  $('urMiles').innerHTML=h;
}
function renderUtReal(){
  uoSettle();
  const off=!uoOk(),has=UT.col.length>0&&UT.sel.length===7,net=uoOffline(),pend=UT.packs.length,nx=(UT.ms|0)+1;
  $('urNameBox').classList.toggle('hidden',!!UOP||off);   // il nome si sceglie una volta sola: poi il riquadro non torna piu'
  $('urH').textContent=uoMode();if(UT.hm)utHeroFix();
  $('urHero').classList.toggle('hidden',!UT.hm||!UT.col.length);if(UT.hm)$('urHeroS').textContent=utHeroSub();
  $('urInfo').innerHTML=off?uoMode()+' non è disponibile in questa versione del gioco.':(UOP?`<b>${esc(UOP.name)}</b> · Punti: <b>${UOP.p}</b> · Vittorie ${UOP.w} · Sconfitte ${UOP.l}${has?` · Forza: <b>${utPower()}</b>`:''}${UT.col.length?` · Gettoni: <b>${UT.coins}</b>`:''}${UOP.dirty?' · risultato da inviare':''}`:'Scegli il tuo nome per entrare in classifica. Attenzione: una volta confermato non si può più cambiare.');
  $('urPlay').disabled=off||!UOP||!has||UO.busy||net;
  $('urPlayS').textContent=net?'Serve internet':(!has?(UT.hm?'Gioca con la squadra di Sfide online: prima completala lì (7 titolari)':'Prima completa la tua squadra (7 titolari)'):'Contro un giocatore con punti simili ai tuoi');
  $('urPack').classList.toggle('hidden',!pend);
  $('urPackT').textContent=pend?(utPkQ(UT.packs[0])===0&&!UT.col.length?'Apri il pacchetto iniziale':`Apri: ${utPackName(UT.packs[0])}${pend>1?' (+'+(pend-1)+')':''}`):'';
  $('urPackS').textContent=pend?`${utPackSize(UT.packs[0])} ${utPackContents(UT.packs[0])} · ${utPackTip(UT.packs[0])}`:'';
  $('urTeam').classList.toggle('hidden',!UT.col.length);
  $('urTeamS').textContent=`${UT.col.length} giocatori · titolari ${UT.sel.length}/7`;
  $('urEquip').classList.toggle('hidden',!UT.col.length);$('urEquipS').textContent=eqSubTxt();
  $('urShop').classList.toggle('hidden',!UT.col.length);
  renderMiles();
  $('urGoal').textContent=UT.col.length?`Vittoria ${UTO_COIN_W} gettoni (fino a +${UTO_UPSET[0][1]} se l’avversario ha più punti), sconfitta ${UTO_COIN_L}.`:'';
  $('urBoard').disabled=off||net;
  $('urMsg').textContent=net&&!UO.msg?`Nessuna connessione: ${uoMode()} ha bisogno di internet. Il resto del gioco funziona anche offline.`:UO.msg||(UOP?.dirty?'Risultato in attesa di sincronizzazione.':'');
  if(UOP&&UOP.dirty&&!UO.busy&&Date.now()-UO.tried>15000)uoPush();   // ogni tanto, non in continuazione se la rete non risponde
}
$('umBack').addEventListener('click',()=>showScreen('title'));
$('umCpu').addEventListener('click',()=>{utUse(false,false);utEnter();});
$('umReal').addEventListener('click',()=>{UO.msg='';uoEnter(false);showScreen('utReal');});
$('umHero').addEventListener('click',()=>{UO.msg='';uoEnter(true);showScreen('utReal');});   // Superpoteri: stessa schermata di Real player, con gli eroi (08-ut-superpoteri.js)
$('urBack').addEventListener('click',()=>showScreen('utMode'));
$('urPlay').addEventListener('click',uoStart);
$('urTeam').addEventListener('click',()=>{utTeamBack='utReal';showScreen('utTeam');});
$('urPack').addEventListener('click',()=>{if(!UT.packs.length)return;UT.stage='closed';showScreen('utPack');});
$('urShop').addEventListener('click',()=>showScreen('utShop'));
$('urBoard').addEventListener('click',()=>{showScreen('utBoard');});
$('urNameOk').addEventListener('click',async()=>{
  if(UOP){renderUtReal();return;}   // il nome non si cambia
  const nm=utoName($('urName').value);
  if(nm.length<2){UO.msg='Il nome deve avere almeno 2 lettere.';renderUtReal();return;}
  if(UO.busy)return;
  if(!uoOk()){renderUtReal();return;}
  UO.busy=true;UO.msg='Salvo il nome…';renderUtReal();
  try{
    const a=await uoSignUp();UOP={id:a.id,name:nm,p:UTO_START,w:0,l:0,g:0,rt:a.rt,dirty:false,fresh:true,last:'',op:null};
    uoSaveP();
    try{await uoSync();UO.msg='Nome salvato: '+nm+'.';}catch(e){UO.msg=UT.sel.length===7?uoErr(e):'Nome salvato. Completa la tua squadra per giocare.';}
  }catch(e){UO.msg=uoErr(e);}
  finally{UO.busy=false;renderUtReal();}
});
// ---- classifica online ----
async function renderUtBoard(){
  const box=$('ubList');box.innerHTML='<p class="qp">Carico la classifica…</p>';
  try{
    const rows=uoRows(await uoDb('GET',uoRoot()+'/players',undefined,'orderBy=%22p%22&limitToLast=50')).sort((a,b)=>b.p-a.p||b.w-a.w);
    box.innerHTML=rows.length?rows.map((r,i)=>`<div class="ubrow${UOP&&r.id===UOP.id?' me':''}"><b>${i+1}</b><span class="un">${esc(r.n)}</span><small>${r.w}V ${r.l}S · forza ${r.pw}</small><b>${r.p}</b></div>`).join(''):'<p class="qp">Nessun giocatore in classifica: sii il primo!</p>';
  }catch(e){box.innerHTML='<p class="qp">'+esc(uoErr(e))+'</p>';}
}
$('ubBack').addEventListener('click',()=>showScreen('utReal'));
$('ubRef').addEventListener('click',renderUtBoard);

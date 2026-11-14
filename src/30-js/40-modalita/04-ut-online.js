/* ===================== ULTIMATE TEAM · REAL PLAYER =====================
   Partite a distanza contro le squadre di altri giocatori, senza che siano online insieme: ognuno carica la propria squadra (7 titolari e le migliori
   7 riserve) su Firebase Realtime Database; «Inizia partita» sceglie la squadra di un giocatore con punti Elo vicini ai tuoi e la fa giocare all'IA.
   I punti cambiano solo a chi gioca (logica in 10-sim/19-ut-classifica.js) e finiscono nella classifica online.
   Solo richieste web semplici (fetch, nessuna libreria): senza connessione il resto del gioco funziona come sempre.
   Per attivarlo servono il progetto Firebase e le regole di sicurezza: docs/ULTIMATE-TEAM-ONLINE.md e docs/firebase-rules.json. */
const UTO_CFG={db:'https://ultimate-frisbee-e640e-default-rtdb.europe-west1.firebasedatabase.app',key:''};   // databaseURL e apiKey del progetto Firebase: per natura pubblici, la sicurezza sta nelle regole del database
const UTO_KEY='ultimate-ut-online';
const UO={on:false,opp:null,busy:false,flush:false,tried:0,msg:'',nameEdit:false};
// profilo locale: id (utente anonimo di Firebase), nome, punti, partite, token di rinnovo; dirty = risultato non ancora inviato; fresh = il nodo online non esiste ancora;
// op = punti dell'avversario di una partita iniziata e non finita (se chiudi il gioco a meta' conta come sconfitta)
let UOP=null;
try{const o=JSON.parse(localStorage.getItem(UTO_KEY)||'null');if(o&&typeof o.id==='string'&&o.id)UOP={id:o.id,name:utoName(o.name),p:clamp(o.p|0,0,UTO_MAXP),w:o.w|0,l:o.l|0,g:o.g|0,rt:String(o.rt||''),dirty:!!o.dirty,fresh:!!o.fresh,last:String(o.last||''),op:typeof o.op==='number'?o.op:null};}catch(e){}
const uoSaveP=()=>{try{localStorage.setItem(UTO_KEY,JSON.stringify(UOP));}catch(e){}};
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
  if(uoOffline()||e instanceof TypeError)return 'Nessuna connessione: Real player ha bisogno di internet. Il resto del gioco funziona anche offline.';
  if(e&&(e.status===401||e.status===403))return 'Il database ha rifiutato la richiesta: controlla le regole di sicurezza e l’accesso anonimo (docs/ULTIMATE-TEAM-ONLINE.md).';
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
async function uoSync(){
  if(!UOP||UT.sel.length!==7)return null;
  const pk=utoPack(UT.col,UT.sel);
  if(UOP.fresh){await uoDb('PUT','ut/players/'+UOP.id,uoNode(pk.pw));UOP.fresh=false;UOP.dirty=false;}
  else{
    const patch={n:UOP.name,pw:pk.pw,u:Date.now()};
    if(UOP.dirty){patch.p=UOP.p;patch.w=UOP.w;patch.l=UOP.l;patch.g=UOP.g;}
    await uoDb('PATCH','ut/players/'+UOP.id,patch);UOP.dirty=false;
  }
  await uoDb('PUT','ut/teams/'+UOP.id,{m:pk.m});
  uoSaveP();return pk;
}
async function uoFindOpp(){
  const seen=new Map(),add=j=>{for(const r of uoRows(j))seen.set(r.id,r);};
  for(const w of UTO_WIN){
    add(await uoDb('GET','ut/players',undefined,`orderBy=%22p%22&startAt=${Math.max(0,UOP.p-w)}&endAt=${UOP.p+w}&limitToFirst=40`));
    const o=utoPickOpp([...seen.values()],UOP.id,UOP.p,UOP.last,Math.random);if(o)return o;
  }
  add(await uoDb('GET','ut/players',undefined,'orderBy=%22p%22&limitToLast=40'));   // nessuno vicino: il piu' vicino tra gli ultimi arrivati in classifica
  return utoPickOpp([...seen.values()],UOP.id,UOP.p,UOP.last,Math.random);
}
// invio del risultato in sospeso (in secondo piano: se fallisce resta da inviare e riparte alla prossima occasione)
async function uoPush(){
  if(!UOP||!UOP.dirty||UOP.fresh||UO.flush||uoOffline()||!uoOk())return;
  UO.flush=true;UO.tried=Date.now();
  try{await uoDb('PATCH','ut/players/'+UOP.id,{p:UOP.p,w:UOP.w,l:UOP.l,g:UOP.g,u:Date.now()});UOP.dirty=false;uoSaveP();}catch(e){}
  finally{UO.flush=false;if(!UOP.dirty&&!$('utReal').classList.contains('hidden'))renderUtReal();}
}
// ---- partita ----
function uoLaunch(o,ros){
  if(hasCareer()){persist();QM.bak=JSON.stringify(SV);}else QM.bak=null;   // la carriera resta com'e': viene rimessa alla fine
  QM.on=true;UT.on=true;UO.on=true;UO.opp=o;
  UOP.op=o.p;uoSaveP();   // se il gioco si chiude prima della fine, alla prossima apertura conta come sconfitta (come abbandonare)
  setSquad(UT.col);setLineup(UT.sel.slice());
  applyRoster(ros);
  SQ.forEach(p=>{p.injNew=false;p.inj=0;p.cond=100;});
  G.formB=0;G.lines=null;G.injK=1;
  G.oppName=o.n;G.myName=UOP.name;G.matchLabel='Real player · '+UOP.p+' punti';
  // difficolta' uguale per tutti (Medio) cosi' i punti sono confrontabili; la squadra avversaria e' quella vera dell'altro giocatore
  newGame();rollWind();G.lvl=[0,1];G.oppPlus=0;G.idn=[null,teamIdentity(o.n,T[1])];G.xtr=false;G.hint=false;G.routes=true;G.inMatch=true;G.recorded=false;
  hideScreens();$('over').classList.add('hidden');
  startPoint(G.nextRec);cam.snap=true;
}
async function uoStart(){
  if(UO.busy)return;
  if(!UOP){UO.msg='Scegli prima il tuo nome.';renderUtReal();return;}
  if(UT.sel.length!==7){UO.msg='Servono 7 titolari: completa la tua squadra.';renderUtReal();return;}
  UO.busy=true;UO.msg='Cerco un avversario con i tuoi punti…';renderUtReal();
  try{
    await uoSync();
    const o=await uoFindOpp();
    if(!o){UO.msg='Non ci sono ancora altri giocatori: invita un amico a creare la sua squadra.';return;}
    const tm=await uoDb('GET','ut/teams/'+o.id),ros=tm&&utoUnpack(tm.m,o.id);
    if(!ros){UO.msg='La squadra di '+o.n+' non è valida: riprova, ne cerco un’altra.';UOP.last=o.id;uoSaveP();return;}
    UOP.last=o.id;UO.msg='';uoLaunch(o,ros);
  }catch(e){UO.msg=uoErr(e);}
  finally{UO.busy=false;renderUtReal();}
}
// fine partita (chiamata da showOver, anche per l'abbandono): punti Elo contro i punti che l'avversario aveva quando e' stato scelto
function uoRecord(win){
  const d=utoDelta(UOP.p,UO.opp.p,win),np=clamp(UOP.p+d,0,UTO_MAXP),real=np-UOP.p;
  UOP.p=np;UOP.g++;if(win)UOP.w++;else UOP.l++;UOP.dirty=true;UOP.op=null;uoSaveP();
  const msg=`Real player · ${win?'vittoria':'sconfitta'} contro ${UO.opp.n} (${UO.opp.p} punti): ${real>=0?'+':''}${real} punti, ora ne hai ${np}.`;
  UO.msg=msg;uoPush();return msg;
}
function uoSettle(){   // partita lasciata a meta' (gioco chiuso): sconfitta
  if(!UOP||UOP.op===null||UOP.op===undefined||UO.on)return;
  const d=utoDelta(UOP.p,UOP.op,false),np=clamp(UOP.p+d,0,UTO_MAXP);
  UO.msg=`La partita lasciata a metà conta come sconfitta: ${np-UOP.p} punti.`;
  UOP.p=np;UOP.g++;UOP.l++;UOP.dirty=true;UOP.op=null;uoSaveP();
}
// ---- schermate ----
function renderUtReal(){
  uoSettle();
  const off=!uoOk(),has=UT.col.length>0&&UT.sel.length===7,net=uoOffline(),need=!UOP||UO.nameEdit;
  $('urNameBox').classList.toggle('hidden',!need);$('urRename').classList.toggle('hidden',need||off);
  if(need&&!$('urName').value)$('urName').value=UOP?UOP.name:'';
  $('urInfo').innerHTML=off?'Real player non è ancora attivo: manca la configurazione online (docs/ULTIMATE-TEAM-ONLINE.md).':(UOP?`<b>${esc(UOP.name)}</b> · Punti: <b>${UOP.p}</b> · Vittorie ${UOP.w} · Sconfitte ${UOP.l}${has?` · Forza: <b>${utPower()}</b>`:''}${UOP.dirty?' · risultato da inviare':''}`:'Scegli il tuo nome per entrare in classifica.');
  $('urPlay').disabled=off||!UOP||!has||UO.busy||net||UO.nameEdit;
  $('urPlayS').textContent=net?'Serve internet':(!has?'Prima completa la tua squadra (7 titolari)':'Contro un giocatore con punti simili ai tuoi');
  $('urTeamT').textContent=UT.col.length?'La tua squadra':'Crea la tua squadra';
  $('urTeamS').textContent=UT.col.length?`${UT.col.length} giocatori · titolari ${UT.sel.length}/7`:'Apri il pacchetto iniziale';
  $('urBoard').disabled=off||net;
  $('urMsg').textContent=net&&!UO.msg?'Nessuna connessione: Real player ha bisogno di internet. Il resto del gioco funziona anche offline.':UO.msg;
  if(UOP&&UOP.dirty&&!UO.busy&&Date.now()-UO.tried>15000)uoPush();   // ogni tanto, non in continuazione se la rete non risponde
}
$('umBack').addEventListener('click',()=>showScreen('title'));
$('umCpu').addEventListener('click',utEnter);
$('umReal').addEventListener('click',()=>{UO.msg='';UO.nameEdit=false;showScreen('utReal');});
$('urBack').addEventListener('click',()=>showScreen('utMode'));
$('urPlay').addEventListener('click',uoStart);
$('urTeam').addEventListener('click',()=>{if(!UT.col.length){utEnter();return;}utTeamBack='utReal';showScreen('utTeam');});
$('urBoard').addEventListener('click',()=>{showScreen('utBoard');});
$('urRename').addEventListener('click',()=>{UO.nameEdit=true;$('urName').value=UOP?UOP.name:'';renderUtReal();$('urName').focus();});
$('urNameOk').addEventListener('click',async()=>{
  const nm=utoName($('urName').value);
  if(nm.length<2){UO.msg='Il nome deve avere almeno 2 lettere.';renderUtReal();return;}
  if(UO.busy)return;
  if(!uoOk()){renderUtReal();return;}
  UO.busy=true;UO.msg='Salvo il nome…';renderUtReal();
  try{
    if(!UOP){const a=await uoSignUp();UOP={id:a.id,name:nm,p:UTO_START,w:0,l:0,g:0,rt:a.rt,dirty:false,fresh:true,last:'',op:null};}
    else UOP.name=nm;
    uoSaveP();UO.nameEdit=false;
    try{await uoSync();UO.msg='Nome salvato: '+nm+'.';}catch(e){UO.msg=UT.sel.length===7?uoErr(e):'Nome salvato. Completa la tua squadra per giocare.';}
  }catch(e){UO.msg=uoErr(e);}
  finally{UO.busy=false;renderUtReal();}
});
// ---- classifica online ----
async function renderUtBoard(){
  const box=$('ubList');box.innerHTML='<p class="qp">Carico la classifica…</p>';
  try{
    const rows=uoRows(await uoDb('GET','ut/players',undefined,'orderBy=%22p%22&limitToLast=50')).sort((a,b)=>b.p-a.p||b.w-a.w);
    box.innerHTML=rows.length?rows.map((r,i)=>`<div class="ubrow${UOP&&r.id===UOP.id?' me':''}"><b>${i+1}</b><span class="un">${esc(r.n)}</span><small>${r.w}V ${r.l}S · forza ${r.pw}</small><b>${r.p}</b></div>`).join(''):'<p class="qp">Nessun giocatore in classifica: sii il primo!</p>';
  }catch(e){box.innerHTML='<p class="qp">'+esc(uoErr(e))+'</p>';}
}
$('ubBack').addEventListener('click',()=>showScreen('utReal'));
$('ubRef').addEventListener('click',renderUtBoard);

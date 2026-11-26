/* ===================== ULTIMATE TEAM · REAL PLAYER =====================
   Partite a distanza contro le squadre di altri giocatori, senza che siano online insieme: ognuno carica la propria squadra (7 titolari e le migliori
   7 riserve) su Firebase Realtime Database; «Inizia partita» sceglie la squadra di un giocatore con punti Elo vicini ai tuoi e la fa giocare all'IA.
   I punti cambiano solo a chi gioca (logica in 10-sim/19-ut-classifica.js) e finiscono nella classifica online.
   La squadra di Real player e' separata da quella del torneo contro il computer (utUse): ha i suoi giocatori, i suoi gettoni e i suoi pacchetti.
   Il nome si sceglie una volta sola.
   Stagioni mensili (solo Sfide online): ogni mese ha la sua classifica in ut/seasons/<AAAA-MM>, scritta subito dopo il profilo (le regole del database
   controllano che i punti siano gli stessi). Al cambio di mese si riparte con 200 punti in meno (utoSeasonStart) e, chi ha chiuso il mese tra i primi
   10 con almeno 10 partite, riceve il badge nei Riconoscimenti (ricUtGive). Se il database non ha ancora le regole delle stagioni (risposta 401/403)
   le stagioni si spengono per la sessione (UO.noSeason) e il resto funziona come prima.
   Amministratore: chi conosce il codice (ut/adminKey, scritto a mano dalla console di Firebase) lo inserisce una volta per dispositivo (bottone
   «Amministratore» nella Classifica) e vede statistiche d'uso e «nuova stagione»: chiude la stagione quando vuole scrivendo ut/meta = {s: stagione nuova 'AAAA-MM.NN', p: quella chiusa, at}. Tutti gli altri la leggono (uoSeasonMeta) e,
   al primo accesso, ripartono con 200 punti in meno come a inizio mese; il primo del mese si torna comunque alla stagione del mese (utoSeasonNow).
   Solo richieste web semplici (fetch, nessuna libreria): senza connessione il resto del gioco funziona come sempre.
   Per attivarlo servono il progetto Firebase e le regole di sicurezza: docs/ULTIMATE-TEAM-ONLINE.md e docs/firebase-rules.json. */
const UTO_CFG={db:'https://ultimate-frisbee-e640e-default-rtdb.europe-west1.firebasedatabase.app',key:'AIzaSyC3r-oo8RQ5__-428NDT-PdzjTaiUoGbFg'};   // databaseURL e apiKey del progetto Firebase: per natura pubblici, la sicurezza sta nelle regole del database
const UTO_KEY='ultimate-ut-online',UTH_OKEY='ultimate-ut-eroi-online';
// i Superpoteri (UT.hm) giocano online come Real player, ma con un profilo, una classifica e squadre loro: radice «uh» invece di «ut» nel database
const uoKey=()=>UT.hm?UTH_OKEY:UTO_KEY,uoRoot=()=>UT.hm?'uh':'ut',uoMode=()=>UT.hm?'Superpoteri':'Sfide online';
const UO={on:false,opp:null,busy:false,flush:false,tried:0,msg:'',meta:null,metaT:0};   // meta: stagione aperta a mano (ut/meta)
// profilo locale: id (utente anonimo di Firebase), nome, punti, partite, token di rinnovo; dirty = risultato non ancora inviato; fresh = il nodo online non esiste ancora;
// op = punti dell'avversario di una partita iniziata e non finita (se chiudi il gioco a meta' conta come sconfitta)
function uoReadP(k){
  try{const o=JSON.parse(localStorage.getItem(k)||'null');if(o&&typeof o.id==='string'&&o.id)return {id:o.id,name:utoName(o.name),p:clamp(o.p|0,0,UTO_MAXP),w:o.w|0,l:o.l|0,g:o.g|0,rt:String(o.rt||''),dirty:!!o.dirty,fresh:!!o.fresh,last:String(o.last||''),op:typeof o.op==='number'?o.op:null,
    // stagione: s = mese in corso per questo profilo, sw/sl/sg = vittorie, sconfitte e partite del mese, b = record di punti, pw = ultima forza caricata,
    // prev = il mese chiuso {s, p, g, w, rank, done}: done quando il badge e' stato deciso
    s:utoSeasonOk(o.s)?o.s:'',sw:o.sw|0,sl:o.sl|0,sg:o.sg|0,b:Math.max(o.b|0,o.p|0),pw:o.pw|0,
    prev:o.prev&&utoSeasonOk(o.prev.s)?{s:o.prev.s,p:o.prev.p|0,g:o.prev.g|0,w:o.prev.w|0,rank:o.prev.rank|0,done:!!o.prev.done}:null};}catch(e){}
  return null;
}
let UOP=uoReadP(UTO_KEY);
const uoSaveP=()=>{try{localStorage.setItem(uoKey(),JSON.stringify(UOP));}catch(e){}};
const uoNewP=(id,name,rt)=>({id,name,p:UTO_START,w:0,l:0,g:0,rt,dirty:false,fresh:true,last:'',op:null,s:UT.hm?'':utoSeason(Date.now()),sw:0,sl:0,sg:0,b:UTO_START,pw:0,prev:null});
const uoSeasonsOn=()=>!UT.hm&&!UO.noSeason;   // le stagioni sono solo di Sfide online
const uoDenied=e=>!!e&&(e.status===401||e.status===403);
// profilo della modalita' caricata (dopo utUse). Il nome e l'accesso anonimo sono gli stessi nelle due: chi ha gia' scelto il nome in una lo ritrova
// nell'altra, con i punti che ripartono da quelli iniziali
function uoUseP(){
  UOP=uoReadP(uoKey());uoTok='';uoExp=0;
  if(!UOP){const o=uoReadP(UT.hm?UTO_KEY:UTH_OKEY);if(o){UOP=uoNewP(o.id,o.name,o.rt);uoSaveP();}}
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
const uoNode=pw=>Object.assign({n:UOP.name,p:UOP.p,w:UOP.w,l:UOP.l,g:UOP.g,pw,u:Date.now()},uoSeasonsOn()&&UOP.s?{s:UOP.s}:{});
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
      try{await uoDb('PUT',root+'/players/'+p.id,uoNode(pk.pw));}
      catch(e){if(!uoDenied(e)||!uoNode(pk.pw).s)throw e;UO.noSeason=true;p.s='';await uoDb('PUT',root+'/players/'+p.id,uoNode(pk.pw));}   // database senza le regole delle stagioni: si entra nel mese piu' avanti
      p.fresh=false;
    }else{
      const patch={n:p.name,pw:pk.pw,u:Date.now()};
      if(p.dirty){patch.p=p.p;patch.w=p.w;patch.l=p.l;patch.g=g;}
      await uoDb('PATCH',root+'/players/'+p.id,patch);
    }
    if(p.g===g)p.dirty=false;
    p.pw=pk.pw;
    if(UOP===profile)uoSaveP();
    if(UOP===profile)await uoSeasonSync(p);
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
    const o=utoPickOpp([...seen.values()],profile.id,profile.p,profile.last,Math.random,profile.name);if(o)return o;
  }
  add(await uoDb('GET',root+'/players',undefined,'orderBy=%22p%22&limitToLast=40'));   // nessuno vicino: il piu' vicino tra gli ultimi arrivati in classifica
  if(!current())return null;
  return utoPickOpp([...seen.values()],profile.id,profile.p,profile.last,Math.random,profile.name);
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
      if(UOP===profile&&!p.dirty)await uoSeasonSync(p);
    });
  }catch(e){}
  finally{UO.flush=false;if(!UOP.dirty&&!$('utReal').classList.contains('hidden'))renderUtReal();}
}
// ---- stagioni mensili (solo Sfide online; si chiama dentro uoWrite, dopo che il profilo e' stato scritto) ----
// cambio di mese: prima i punti ripartono (le regole controllano il conto), poi la riga della classifica del mese, poi il badge del mese chiuso
// la stagione aperta a mano dall'amministratore (ut/meta), riletta al massimo ogni 30 secondi; null se non c'e' o non si legge
async function uoSeasonMeta(force){
  if(!force&&Date.now()-UO.metaT<30000)return UO.meta;
  try{const m=await uoDb('GET','ut/meta');UO.meta=m&&utoSeasonOk(m.s)?{s:m.s,p:utoSeasonOk(m.p)?m.p:'',at:Number(m.at)||0}:null;}catch(e){if(!uoDenied(e))throw e;UO.meta=null;}
  UO.metaT=Date.now();return UO.meta;
}
const uoSeasonCur=()=>utoSeasonNow(Date.now(),UO.meta&&UO.meta.s);
async function uoSeasonSync(p){
  if(!uoSeasonsOn()||p.fresh||p.dirty||UOP!==p)return;
  const root=uoRoot();
  try{
    await uoSeasonMeta();
    const cur=uoSeasonCur();if(UOP!==p||p.dirty)return;
    if(p.s!==cur){
      const np=p.s?utoSeasonStart(p.p):p.p;   // senza stagione (profili di prima): si entra nel mese con i punti che si hanno
      await uoDb('PATCH',root+'/players/'+p.id,p.s?{s:cur,p:np,u:Date.now()}:{s:cur,u:Date.now()});
      if(p.s){p.prev={s:p.s,p:p.p,g:p.sg|0,w:p.sw|0,rank:0,done:false};UO.msg=`È iniziata la nuova stagione (${utoSeasonName(cur)}): ripartite da ${np} punti (prima ${p.p}).`;}
      p.s=cur;p.p=np;p.sw=0;p.sl=0;p.sg=0;uoSaveP();
    }
    if(p.pw>=25){
      const row={n:p.name,p:p.p,w:p.sw|0,l:p.sl|0,g:p.sg|0,pw:p.pw},key=p.id+'|'+p.s+'|'+JSON.stringify(row);   // si riscrive solo se e' cambiata
      const put=()=>uoDb('PUT',root+'/seasons/'+p.s+'/'+p.id,Object.assign({u:Date.now()},row));
      if(UO.sKey!==key){try{await put();}catch(e){if(!uoDenied(e))throw e;await uoDb('PATCH',root+'/players/'+p.id,{s:p.s,u:Date.now()});await put();}   // il profilo online non aveva ancora la stagione
        UO.sKey=key;}
    }
    await uoSeasonAward(p);
  }catch(e){if(uoDenied(e))UO.noSeason=true;else throw e;}
}
// il badge del mese chiuso: si guarda la classifica finale un'ora dopo la mezzanotte, cosi' arrivano anche i risultati delle ultime partite
async function uoSeasonAward(p){
  const v=p.prev;if(!v||v.done)return;
  if(v.g<UTO_SEASON_G){v.done=true;uoSaveP();return;}
  const m=UO.meta,byAdmin=!!m&&m.s>v.s&&m.s.slice(0,7)===v.s.slice(0,7);   // chiusa a mano: si aspettano 2 minuti; a fine mese un'ora
  if(byAdmin?Date.now()<m.at+120000:utoSeason(Date.now()-3600000)===v.s.slice(0,7))return;
  const rk=utoSeasonRank(uoRows(await uoDb('GET',uoRoot()+'/seasons/'+v.s,undefined,'orderBy=%22p%22&limitToLast=60'))),pos=rk.ok.findIndex(r=>r.id===p.id)+1;
  v.rank=pos;v.done=true;uoSaveP();
  const b=utoSeasonBadge(pos);
  if(b&&ricUtGive(b,v.s,p.name))UO.msg=`Stagione di ${utoSeasonName(v.s)} chiusa al ${pos}° posto: nuovo badge nei Riconoscimenti!`;
}
let uoSeasonT=0;
function uoSeasonKick(){   // entrando in Sfide online: cambio di mese e badge senza aspettare la prossima partita
  const p=UOP;if(!p||p.fresh||p.dirty||!uoSeasonsOn()||UO.busy||uoOffline()||!uoOk()||Date.now()-uoSeasonT<30000)return;   // rilegge anche la stagione aperta a mano
  uoSeasonT=Date.now();uosFlush().catch(()=>{});
  uoWrite(()=>uoSeasonSync(p)).catch(()=>{}).then(()=>{if(!$('utReal').classList.contains('hidden'))renderUtReal();});
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
  const dv0=utoDiv(UOP.p).n;
  UOP.p=np;UOP.g++;if(win)UOP.w++;else UOP.l++;UOP.dirty=true;UOP.op=null;uoSeasonCount(win);uoSaveP();
  UT.coins+=c.base+c.bonus;if(win)UT.stat.w++;
  const ob=UT.hm?{coins:0,done:[]}:uoObjStep(win),dv1=utoDiv(np).n;UT.coins+=ob.coins;
  const grown=utGrowCards(),pk=uoMiles();utSave();
  const msg=`${uoMode()} · ${win?'vittoria':'sconfitta'} contro ${UO.opp.n} (${UO.opp.p} punti): ${real>=0?'+':''}${real} punti, ora ne hai ${np}. +${c.base+c.bonus} gettoni${c.bonus?` (${c.bonus} in più perché l’avversario aveva più punti di te)`:''}.`
    +(pk?` Traguardo dei ${utoMilePts(UT.ms)} punti raggiunto: ${UT.hm?(pk>1?pk+' pacchetti eroi':'un pacchetto eroi')+' da aprire':(pk>1?pk+' serie di pacchetti premio (giocatori e accessori)':'un pacchetto di giocatori e uno di accessori')+' da aprire'+(UT.ms===pk?', e da ora puoi potenziare le carte':'')}.`:'')
    +(dv1<dv0?` Promosso in ${utoDivName(dv1)}!`:(dv1>dv0?` Retrocesso in ${utoDivName(dv1)}.`:''))
    +(ob.done.length?` Obiettivo completato: ${ob.done.join(', ')} (+${ob.coins} gettoni).`:'')
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
  UOP.p=np;UOP.g++;UOP.l++;UOP.dirty=true;UOP.op=null;uoSeasonCount(false);uoSaveP();
}
function uoSeasonCount(win){UOP.b=Math.max(UOP.b|0,UOP.p);if(!UOP.s)return;UOP.sg=(UOP.sg|0)+1;if(win)UOP.sw=(UOP.sw|0)+1;else UOP.sl=(UOP.sl|0)+1;}   // partite del mese
// ---- obiettivi giornalieri e settimanali (sul dispositivo: chiave nuova ultimate-ut-obiettivi), solo Sfide online ----
const UOO_KEY='ultimate-ut-obiettivi';
function uooLoad(){try{const o=JSON.parse(localStorage.getItem(UOO_KEY)||'{}');return o&&typeof o==='object'?o:{};}catch(e){return {};}}
function uoObjStep(win){
  const st=uooLoad(),r=utoObjAdd(st,Date.now(),{g:1,w:win?1:0,m:Math.max(0,G.score&&G.score[0]|0)});
  try{localStorage.setItem(UOO_KEY,JSON.stringify(st));}catch(e){}
  return r;
}
function renderObj(){
  const st=uooLoad();utoObjAdd(st,Date.now(),{});   // solo per azzerare i periodi scaduti
  const row=o=>{const [k,,,n,c,tx]=o,v=Math.min(n,st.c[k]|0),ok=!!st.r[k];
    return `<div class="uoob${ok?' ok':''}"><span>${tx}</span><i style="--v:${Math.round(v/n*100)}%"></i><b>${ok?'✓':v+'/'+n}</b><small>+${c}</small></div>`;};
  $('urObj').innerHTML='<div class="urmh">Obiettivi di oggi</div>'+UTO_OBJ.filter(o=>o[1]==='d').map(row).join('')+'<div class="urmh">Della settimana</div>'+UTO_OBJ.filter(o=>o[1]==='w').map(row).join('');
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
  $('urInfo').innerHTML=off?uoMode()+' non è disponibile in questa versione del gioco.':(UOP?`<b>${esc(UOP.name)}</b> · ${esc(utoDivName(utoDiv(UOP.p).n))} · Punti: <b>${UOP.p}</b> · Vittorie ${UOP.w} · Sconfitte ${UOP.l}${has?` · Forza: <b>${utPower()}</b>`:''}${UT.col.length?` · Gettoni: <b>${UT.coins}</b>`:''}${UOP.dirty?' · risultato da inviare':''}`:'Scegli il tuo nome per entrare in classifica. Attenzione: una volta confermato non si può più cambiare.');
  // la stagione del mese (solo Sfide online)
  const ss=!off&&UOP&&!UT.hm&&!UO.noSeason&&UOP.s;$('urSeason').classList.toggle('hidden',!ss);
  if(ss){const now=new Date(),left=Math.max(1,Math.ceil((new Date(now.getFullYear(),now.getMonth()+1,1)-now)/86400000)),sg=UOP.sg|0;
    $('urSeason').innerHTML=`Stagione: <b>${utoSeasonName(UOP.s)}</b> · finisce ${left<=1?'oggi':'tra '+left+' giorni'} · partite della stagione: <b>${sg}</b>${sg<UTO_SEASON_G?` (ne servono ${UTO_SEASON_G} per la classifica)`:''} · record: ${Math.max(UOP.b|0,UOP.p)} punti`;}
  if(UOP&&!UT.hm&&!off&&!net)uoSeasonKick();
  $('urPlay').disabled=off||!UOP||!has||UO.busy||net;
  $('urPlayS').textContent=net?'Serve internet':(!has?(UT.hm?'Gioca con la squadra di Sfide online: prima completala lì (7 titolari)':'Prima completa la tua squadra (7 titolari)'):'Contro un giocatore con punti simili ai tuoi');
  $('urTeam').classList.toggle('hidden',!UT.col.length);
  $('urTeamS').textContent=`${UT.col.length} giocatori · titolari ${UT.sel.length}/7`;
  $('urEquip').classList.toggle('hidden',!UT.col.length);$('urEquipS').textContent=eqSubTxt();
  $('urShop').classList.toggle('hidden',!UT.col.length);
  renderMiles();
  $('urObj').classList.toggle('hidden',!UOP||UT.hm||off);if(UOP&&!UT.hm&&!off)renderObj();
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
$('urShop').addEventListener('click',()=>showScreen('utShop'));
$('urBoard').addEventListener('click',()=>{ubTab='cur';showScreen('utBoard');});
$('urNameOk').addEventListener('click',async()=>{
  if(UOP){renderUtReal();return;}   // il nome non si cambia
  const nm=utoName($('urName').value);
  if(nm.length<2){UO.msg='Il nome deve avere almeno 2 lettere.';renderUtReal();return;}
  if(UO.busy)return;
  if(!uoOk()){renderUtReal();return;}
  UO.busy=true;UO.msg='Salvo il nome…';renderUtReal();
  try{
    const a=await uoSignUp();UOP=uoNewP(a.id,nm,a.rt);
    uoSaveP();
    try{await uoSync();UO.msg='Nome salvato: '+nm+'.';}catch(e){UO.msg=UT.sel.length===7?uoErr(e):'Nome salvato. Completa la tua squadra per giocare.';}
  }catch(e){UO.msg=uoErr(e);}
  finally{UO.busy=false;renderUtReal();}
});
// ---- classifica online ----
// Sfide online: la classifica del mese (o del mese scorso, finale) da ut/seasons; prima chi ha almeno UTO_SEASON_G partite, con il badge che
// riceverebbe a fine mese, poi gli altri senza posizione. Superpoteri, o database senza le stagioni: la classifica dei punti di sempre
let ubTab='cur';
const ubRow=(r,pos,txt)=>`<div class="ubrow${UOP&&r.id===UOP.id?' me':''}${pos?'':' wait'}"><b class="ubp">${pos?(utoSeasonBadge(pos)?badgeSVG('UT'+utoSeasonBadge(pos),'',false,26):'')+pos:'–'}</b><span class="un">${esc(r.n)}</span><small>${txt}</small><b>${r.p}</b></div>`;
async function renderUtBoard(){
  const box=$('ubList'),seas=uoSeasonsOn();box.innerHTML='<p class="qp">Carico la classifica…</p>';
  $('ubTabs').classList.toggle('hidden',!seas);$('ubAdmin').classList.add('hidden');
  if(seas)$('ubTabs').innerHTML=[['cur','Questa stagione'],['prev','Stagione scorsa']].map(([k,t])=>`<button type="button" class="sg${ubTab===k?' on':''}" data-ub="${k}">${t}</button>`).join('');
  try{
    if(seas){
      const m=await uoSeasonMeta(true),cur=uoSeasonCur(),sid=ubTab==='prev'?utoSeasonBefore(cur,m&&m.s,m&&m.p):cur;
      $('ubNote').textContent=ubTab==='prev'?`Classifica finale: ${utoSeasonName(sid)}.`:`${utoSeasonName(sid)}: la classifica riparte ogni mese. Badge ai primi 10 con almeno ${UTO_SEASON_G} partite.`;
      uoAdminCheck();
      try{
        const rk=utoSeasonRank(uoRows(await uoDb('GET',uoRoot()+'/seasons/'+sid,undefined,'orderBy=%22p%22&limitToLast=60')));
        box.innerHTML=rk.ok.length||rk.wait.length?rk.ok.slice(0,50).map((r,i)=>ubRow(r,i+1,`${r.w}V ${r.l}S · forza ${r.pw}`)).join('')
          +(rk.wait.length?`<p class="ubh">Meno di ${UTO_SEASON_G} partite</p>`+rk.wait.slice(0,20).map(r=>ubRow(r,0,`${r.g} partite · forza ${r.pw}`)).join(''):'')
          :`<p class="qp">${ubTab==='prev'?'Nessuno ha giocato in quella stagione.':'Nessuno ha ancora giocato in questa stagione: sii il primo!'}</p>`;
        return;
      }catch(e){if(!uoDenied(e))throw e;UO.noSeason=true;$('ubTabs').classList.add('hidden');$('ubNote').textContent='';}   // database senza le stagioni
    }
    const rows=uoRows(await uoDb('GET',uoRoot()+'/players',undefined,'orderBy=%22p%22&limitToLast=50')).sort((a,b)=>b.p-a.p||b.w-a.w);
    box.innerHTML=rows.length?rows.map((r,i)=>`<div class="ubrow${UOP&&r.id===UOP.id?' me':''}"><b>${i+1}</b><span class="un">${esc(r.n)}</span><small>${r.w}V ${r.l}S · forza ${r.pw}</small><b>${r.p}</b></div>`).join(''):'<p class="qp">Nessun giocatore in classifica: sii il primo!</p>';
  }catch(e){box.innerHTML='<p class="qp">'+esc(uoErr(e))+'</p>';}
}
$('ubTabs').addEventListener('click',e=>{const b=e.target.closest('[data-ub]');if(!b)return;ubTab=b.dataset.ub;renderUtBoard();});
// ---- amministratore: un codice (ut/adminKey, scritto a mano nella console di Firebase) da inserire una volta per dispositivo ----
// Una pagina web non riconosce il dispositivo, ma ricorda il codice (localStorage): lo si inserisce una volta su ogni dispositivo o browser.
// Per scrivere ut/meta il codice viaggia insieme a un'ora del server (ut/ctl): le regole controllano entrambi, cosi' una vecchia scrittura non basta.
const UOA_KEY='ultimate-ut-admin';
const uoaGet=()=>{try{return localStorage.getItem(UOA_KEY)||'';}catch(e){return '';}};
const uoaSet=c=>{try{c?localStorage.setItem(UOA_KEY,c):localStorage.removeItem(UOA_KEY);}catch(e){}};
const uoaCtl=c=>({k:c,at:{'.sv':'timestamp'}});
const UOA_MODES=[['carriera','Carriera'],['veloce','Partita veloce'],['utteam','Ultimate Team'],['sfide','Sfide online'],['poteri','Superpoteri'],['torneo','Torneo'],['allenam','Allenamento']];
function uoAdminCheck(){$('ubAdmin').classList.toggle('hidden',!uoSeasonsOn()||!UOP||UOP.fresh);}
async function admStats(){
  const box=$('admSt'),now=Date.now(),d0=utoDay(now-6*86400000);box.textContent='Carico i numeri…';$('admModes').innerHTML='';
  try{
    const [tot,day,hour,st]=await Promise.all([uoDb('GET','ut/players',undefined,'shallow=true'),
      uoDb('GET','ut/players',undefined,'orderBy=%22u%22&startAt='+(now-86400000)+'&limitToLast=500'),
      uoDb('GET','ut/players',undefined,'orderBy=%22u%22&startAt='+(now-900000)+'&limitToLast=500'),
      uoDb('GET','ut/stats',undefined,'orderBy=%22%24key%22&startAt=%22'+d0+'%22')]);
    const cnt=o=>o&&typeof o==='object'?Object.keys(o).length:0,sum={};
    for(const d in st||{})for(const m in st[d])sum[m]=(sum[m]|0)+(Number(st[d][m])||0);
    box.innerHTML=`Giocatori con un profilo online: <b>${cnt(tot)}</b> · attivi nelle ultime 24 ore: <b>${cnt(day)}</b> · in questo momento (ultimi 15 minuti): <b>${cnt(hour)}</b>`;
    const g=k=>sum[k]|0,pc=(a,b)=>{const t=g(a)+g(b);return t?Math.round(g(a)/t*100)+'%':'–';};
    const pl=UOA_MODES.reduce((a,[k])=>a+g(k),0),sm=UOA_MODES.reduce((a,[k])=>a+g('x'+k),0),dt=g('dauto')+g('dmanual')+g('dsalta');
    const row=(t,a,b)=>`<tr><td>${t}</td><td>${a}</td><td>${b}</td><td><b>${a+b}</b></td></tr>`;
    $('admModes').innerHTML=`<p class="ubh">Partite degli ultimi 7 giorni</p><table class="admt"><tr><th></th><th>Giocate</th><th>Simulate</th><th>Totale</th></tr>`
      +UOA_MODES.map(([k,t])=>row(t,g(k),g('x'+k))).join('')+row('<b>Tutte</b>',pl,sm)+'</table>'
      +`<p class="ubh">Come si gioca (percentuale di giocatori, contati una volta al giorno)</p><p class="qp">Difesa: automatica <b>${dt?Math.round(g('dauto')/dt*100):'–'}%</b> · manuale <b>${dt?Math.round(g('dmanual')/dt*100):'–'}%</b> · saltata <b>${dt?Math.round(g('dsalta')/dt*100):'–'}%</b><br>Scene laterali: accese <b>${pc('lato','nolato')}</b> · spente <b>${pc('nolato','lato')}</b></p>`
      +'<p class="qp">Contano solo i dispositivi con un profilo online (chi non ha mai usato Sfide online non viene contato). «Attivi» = chi ha giocato online di recente.</p>';
  }catch(e){box.textContent=uoErr(e);}
}
function admShow(){
  const c=uoaGet();$('admLogin').classList.toggle('hidden',!!c);$('admMenu').classList.toggle('hidden',!c);$('admMsg').textContent='';
  $('uAdm').classList.remove('hidden');if(c)admStats();else try{$('admCode').focus({preventScroll:true});}catch(e){}
}
$('ubAdmin').addEventListener('click',admShow);
$('admX').addEventListener('click',()=>$('uAdm').classList.add('hidden'));
$('admIn').addEventListener('click',async()=>{
  const c=$('admCode').value.trim();if(!c)return;
  $('admMsg').textContent='Controllo…';
  try{await uoWrite(()=>uoDb('PATCH','ut',{ctl:uoaCtl(c)}));uoaSet(c);$('admCode').value='';admShow();}   // le regole accettano la scrittura solo con il codice giusto
  catch(e){$('admMsg').textContent=uoDenied(e)?'Codice non valido (o regole non ancora pubblicate).':uoErr(e);}
});
$('admOut').addEventListener('click',()=>{uoaSet('');admShow();});
$('admReset').addEventListener('click',()=>{
  const cur=uoSeasonCur(),ns=utoSeasonNext(cur);
  askConfirm({title:'Chiudere la stagione?',ok:'Nuova stagione',danger:true,
    html:`<p>Si chiude «${esc(utoSeasonName(cur))}» per tutti: la classifica finale resta in «Stagione scorsa», i primi 10 con almeno ${UTO_SEASON_G} partite ricevono il badge e ognuno, al prossimo accesso, riparte con ${UTO_SEASON_DROP} punti in meno (mai sotto i ${UTO_START}). Il primo del mese ne parte comunque una nuova.</p>`,
    onOk:async()=>{
      try{await uoWrite(()=>uoDb('PATCH','ut',{meta:{s:ns,p:cur,at:Date.now()},ctl:uoaCtl(uoaGet())}));await uoSeasonMeta(true);UO.msg='';
        await uoWrite(()=>uoSeasonSync(UOP)).catch(()=>{});$('admMsg').textContent='Fatto: è iniziata «'+utoSeasonName(ns)+'».';renderUtBoard();}
      catch(e){$('admMsg').textContent=uoDenied(e)?'Non autorizzato: controlla il codice (esci e rientra).':uoErr(e);}
    }});
});
// ---- conteggio anonimo delle partite per modalita' (nessun nome, nessun id: solo «oggi, carriera, +1»), inviato quando c'e' un profilo online ----
const UOS_KEY='ultimate-ut-stat';
const uosMode=()=>DR.on?'allenam':TN.on?'torneo':UT.on?(UT.hm?'poteri':(UO.on?'sfide':'utteam')):QM.on?'veloce':hasCareer()?'carriera':'altro';
let uosT=0,uosBusy=false;
function uosLoad(){try{const o=JSON.parse(localStorage.getItem(UOS_KEY)||'{}');return o&&typeof o==='object'?o:{};}catch(e){return {};}}
function uosSave(o){try{localStorage.setItem(UOS_KEY,JSON.stringify(o));}catch(e){}}
async function uosFlush(){
  const p=UOP;if(!p||p.fresh||uosBusy||UO.noStat||uoOffline()||!uoOk()||Date.now()-uosT<60000)return;
  const o=uosLoad(),sent={};if(!Object.keys(o).length)return;
  uosT=Date.now();uosBusy=true;
  try{
    for(const d in o){
      if(!/^\d{4}-\d{2}-\d{2}$/.test(d))continue;
      const body={};sent[d]={};
      for(const m in o[d]){const n=Math.min(100,o[d][m]|0);if(n>0&&/^[a-z]{3,12}$/.test(m)){body[m]={'.sv':{increment:n}};sent[d][m]=n;}}   // le regole accettano al massimo +100 per volta
      if(Object.keys(body).length)await uoDb('PATCH','ut/stats/'+d,body);
    }
  }catch(e){if(uoDenied(e))UO.noStat=true;sent={};}   // senza le regole nuove si smette per la sessione
  finally{   // si toglie solo quello inviato: le partite giocate nel frattempo restano
    uosBusy=false;const n=uosLoad();
    for(const d in sent)for(const m in sent[d]){if(n[d]&&n[d][m]){n[d][m]-=sent[d][m];if(n[d][m]<=0)delete n[d][m];}if(n[d]&&!Object.keys(n[d]).length)delete n[d];}
    uosSave(n);
  }
}
// mode: modalita' (uosMode() se manca); sim: 1 = partita simulata (chiave 'x'+modalita'). Una volta al giorno per dispositivo si conta anche come si gioca:
// difesa automatica, manuale o saltata (dauto, dmanual, dsalta) e scene laterali accese o spente (lato, nolato): servono per le percentuali di giocatori.
function uosCount(mode,sim){
  try{const o=uosLoad(),d=utoDay(Date.now()),m=(mode||uosMode()),k=sim?'x'+m:m;o[d]=o[d]||{};o[d][k]=(o[d][k]|0)+1;
    if(!sim&&localStorage.getItem(UOS_KEY+'-g')!==d){localStorage.setItem(UOS_KEY+'-g',d);
      for(const x of [['dauto','dmanual','dsalta'][G.opt.def|0]||'dauto',G.opt.cine?'lato':'nolato'])o[d][x]=(o[d][x]|0)+1;}
    uosSave(o);uosFlush().catch(()=>{});}catch(e){}
}
{const nm=HOOKS.newMatch;HOOKS.newMatch=()=>{if(nm)nm();uosCount();};}
$('ubBack').addEventListener('click',()=>showScreen('utReal'));
$('ubRef').addEventListener('click',renderUtBoard);

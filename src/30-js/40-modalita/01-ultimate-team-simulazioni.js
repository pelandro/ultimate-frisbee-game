/* ===================== ULTIMATE TEAM =====================
   Si parte aprendo un pacchetto da 10 giocatori casuali (piu' sono forti, piu' sono rari), si sceglie la rosa e si gioca un torneo a eliminazione diretta
   di 64 squadre (6 turni). Le avversarie crescono di forza a ogni turno. Dopo ogni vittoria si apre un nuovo pacchetto (sempre migliore). */
const UT_KEY='ultimate-ut',UTR_KEY='ultimate-ut-real',UT_POWERS=[50,58,64,72,84,98],UT_ROUNDS=['Trentaduesimi','Sedicesimi','Ottavi','Quarti','Semifinale','Finale'],UT_TO=['ai trentaduesimi di finale','ai sedicesimi di finale','agli ottavi di finale','ai quarti di finale','in semifinale','in finale'];   // UT_TO: «passi …», «eliminati …»
const UT_LETTERS='ABCDEFGHILMNOPRSTVZ';
function utPlayer(role,ovr,rng){
  const nm=NAME_POOL[Math.floor(rng()*NAME_POOL.length)]+' '+UT_LETTERS[Math.floor(rng()*UT_LETTERS.length)]+'.',st=utStats(role,ovr,rng);
  const r=role==='H'?'H':'C';   // carte specializzate: Handler, Cutter e Defender (un cutter costruito per difendere); circa una su quattro ha un tratto
  return {n:nm,full:nm,label:nm,gen:true,r,age:18+Math.floor(rng()*14),tl:99,tf:99,tv:99,s:st,ovr:Math.round(ovrX({s:st,r})),trait:traitFor(nm,st,r),up:0};
}
const utRar=o=>o>=90?['Leggenda','leg']:(o>=80?['Epico','epi']:(o>=65?['Raro','rar']:(o>=50?['Non comune','unc']:['Comune','com'])));
// rarita': dipende dalla qualita' del pacchetto (modello in 10-sim/16-pacchetti.js: tabella, fasce, garanzie e «paracadute»).
// Il primo pacchetto in assoluto ha 10 giocatori (4 handler, 4 cutter, 2 defender), tutti i successivi 5 (2 handler, 2 cutter, 1 defender)
// Un pacchetto in attesa e' un numero: la qualita' (0-6) piu' 10 volte il numero di carte quando non e' quello solito (i premi dei traguardi di
// Real player ne hanno da 5 a 9): cosi' i salvataggi vecchi, che hanno solo la qualita', restano validi
// e 100 volte il ruolo dei pacchetti del Negozio (1 = solo Handler, 2 = solo Cutter, 0 = misto)
const utPkQ=v=>clamp((v|0)%10,0,6),utPackSize=v=>Math.floor(((v|0)%100)/10)||(UT.col.length?5:10),utPkRole=v=>Math.floor((v|0)/100)%10;
const UT_PK_ROLES=['H','C','H','C','D','H','C','C','D'];
function utMakePack(v){
  const q=utPkQ(v),n=utPackSize(v),pr=utPkRole(v),roles=pr?Array(n).fill(pr===1?'H':'C'):n===10?['H','H','H','H','C','C','C','C','D','D']:UT_PK_ROLES.slice(0,n),pk=utPackTiers(q,roles.length,UT.pity,Math.random);
  UT.pity=pk.pity;
  const tiers=pk.tiers.sort(()=>Math.random()-0.5);   // la rarita' non dipende dal ruolo
  const taken=new Set(UT.col.map(c=>c.full));   // giocatori veri dei campionati (06-ut-carte-reali.js): non si ripete chi hai gia'
  return roles.map((r,i)=>utCardFor(r,utTierOvr(tiers[i],Math.random),Math.random,taken)).sort((a,b)=>a.ovr-b.ovr);
}
const utPackName=v=>utPkRole(v)===EQ_PK?(utPkQ(v)>=6?'Super pacchetto equipaggiamento':(utPkQ(v)>=2?'Pacchetto equipaggiamento '+UT_PQN[utPkQ(v)].split(' ')[1]:'Pacchetto equipaggiamento')):utPkRole(v)?(utPkRole(v)===1?'Pacchetto Handler':'Pacchetto Cutter'):utPkQ(v)===0&&!UT.col.length?'Pacchetto iniziale':(UT.rp&&utPkQ(v)===6?'Super pacchetto':UT_PQN[utPkQ(v)]);
const utPackTip=v=>{const q=utPkQ(v);if(utPkRole(v)===EQ_PK)return q>=6?'almeno un Epico garantito':(q>=3?'almeno un Raro garantito':'accessori per tutta la squadra');if(utPkRole(v))return utPkRole(v)===1?'solo carte Handler':'solo carte Cutter';return q>=6?'almeno un Epico garantito':(q>=2?'almeno un Raro garantito':((UT.pity|0)+1>=UT_PITY?'questo contiene di sicuro un Epico':'più sono forti, più sono rari'));};
// squadra avversaria del turno: 7 titolari con media esatta = forza del turno, 7 di panchina piu' deboli
function utOppRoster(power,seed){
  const rng=mulberry32(hashStr(seed)),v=[],roles=['H','H','H','C','C','C','C'];let tot=0;
  for(let i=0;i<7;i++){const x=(rng()+rng()+rng()-1.5)*3;v.push(x);tot+=x;}
  const out=v.map((x,i)=>utPlayer(roles[i],clamp(power+x-tot/7,30,99),rng));
  for(let i=0;i<7;i++)out.push(utPlayer(i<3?'H':'C',clamp(power-12+(rng()-0.5)*10,30,99),rng));
  return out;
}
const UT_DIFF=[{name:'Facile',txt:'L’IA avversaria gioca come sempre.'},{name:'Medio',txt:'L’IA avversaria sceglie e reagisce un po’ meglio.'},{name:'Difficile',txt:'L’IA avversaria sceglie e reagisce molto meglio.'},{name:'Estrema',txt:'Ancora più attenta del Difficile, e la traiettoria del lancio si vede solo all’inizio (un breve tratto tratteggiato).'}];
const UT={on:false,d:0,manual:false,col:[],sel:[],round:0,tid:0,packs:[],st:'play',res:'',opp:[],stage:'closed',cur:[],coins:0,stat:{w:0,t:0,up:0},claimed:{},mode:'sel',pity:0,rp:false,ms:0,mse:0,eq:eqInit()};   // mse: traguardi di cui hai gia' avuto gli accessori   // pity: pacchetti di fila senza Epici   // rp: e' caricata la squadra di Real player (false = quella del torneo contro il computer); ms: traguardi di punti gia' premiati (solo Real player)   // col: giocatori; sel: indici dei 7 titolari; packs: qualita' dei pacchetti da aprire
function utSave(){try{localStorage.setItem(UT.rp?UTR_KEY:UT_KEY,JSON.stringify({v:2,ms:UT.ms|0,d:UT.d,manual:UT.manual,col:UT.col,sel:UT.sel,round:UT.round,tid:UT.tid,packs:UT.packs,st:UT.st,res:UT.res,coins:UT.coins,stat:UT.stat,claimed:UT.claimed,pity:UT.pity|0,eq:UT.eq,mse:UT.mse|0}));}catch(e){}}
function utOpps(){   // 6 avversarie del torneo: squadre vere scelte con un seme
  const names=Object.keys(TEAM),rng=mulberry32(hashStr('utopp|'+UT.tid)),pick=[];
  while(pick.length<6){const n=names[Math.floor(rng()*names.length)];if(!pick.includes(n))pick.push(n);}
  UT.opp=pick.map((n,i)=>({name:n,power:UT_POWERS[i]}));
}
// Le due squadre (torneo contro il computer e Real player) sono separate: giocatori, gettoni, pacchetti e potenziamenti dell'una non toccano l'altra.
// In memoria ce n'e' una alla volta, sempre nello stesso oggetto UT: utUse salva quella caricata e legge l'altra dalla sua chiave
function utLoad(){
  Object.assign(UT,{d:0,manual:false,col:[],sel:[],round:0,tid:0,packs:[],st:'play',res:'',opp:[],stage:'closed',cur:[],coins:0,stat:{w:0,t:0,up:0},claimed:{},mode:'sel',pity:0,ms:0,upSel:undefined,eq:eqInit(),mse:0});
  try{const o=JSON.parse(localStorage.getItem(UT.rp?UTR_KEY:UT_KEY)||'null');if(o&&Array.isArray(o.col)){for(const c of o.col)if(c&&c.s)fillStats(c.s);for(const pk of (o.packs||[]))for(const c of (Array.isArray(pk)?pk:[]))if(c&&c.s)fillStats(c.s);UT.col=o.col;UT.d=(o.d>=0&&o.d<4)?o.d|0:0;UT.manual=!!o.manual;UT.sel=(o.sel||[]).filter(i=>o.col[i]);UT.round=o.round|0;UT.tid=o.tid|0;UT.packs=o.packs||[];UT.st=o.st||'play';UT.res=o.res||'';UT.coins=o.coins|0;UT.stat=Object.assign({w:0,t:0,up:0},o.stat||{});UT.claimed=o.claimed||{};
    UT.pity=o.pity|0;UT.ms=o.ms|0;UT.eq=eqInit(o.eq);UT.mse=o.mse|0;   // equipaggiamento (10-sim/25-ut-equipaggiamento.js)
    for(const c of UT.col){c.ovr=ovr(c);if(c.trait===undefined)c.trait=traitFor(c.full||c.n,c.s,c.r);c.up=c.up|0;}}}catch(e){}   // salvataggi precedenti: il valore delle carte diventa l'Overall nel ruolo
  if(UT.tid)utOpps();
}
function utUse(rp){rp=!!rp;if(UT.rp===rp)return;utSave();UT.rp=rp;utLoad();}
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
const utPower=()=>UT.sel.length?Math.round(UT.sel.reduce((a,i)=>a+ovrX(eqApply(UT.col[i],UT.eq)),0)/UT.sel.length):0;   // con l'equipaggiamento indossato
function renderUT(){
  const has=UT.col.length>0,pend=UT.packs.length,playing=UT.st==='play'&&!pend&&UT.sel.length===7;
  $('uStats').innerHTML=has?`Rosa: <b>${UT.col.length}</b> giocatori · Forza: <b>${utPower()}</b> (titolari ${UT.sel.length}/7) · Gettoni: <b>${UT.coins}</b>`:'Apri il tuo primo pacchetto per iniziare.';
  $('uShop').classList.toggle('hidden',!has);
  $('uObj').innerHTML=has?UT_OBJ.filter(o=>!UT.claimed[o.id]).slice(0,3).map(o=>`<div class="chal"><div><b>${o.txt}</b><small>${o.pr()} · premio ${o.rw} gettoni</small></div><button type="button" class="go" data-obj="${o.id}"${o.ok()?'':' disabled'}>${o.ok()?'Riscuoti':'In corso'}</button></div>`).join(''):'';
  $('uRounds').innerHTML=UT_ROUNDS.map((n,i)=>{const c=(UT.st==='won'||i<UT.round)?'done':(i===UT.round?(UT.st==='out'?'lost':'cur'):'');return `<span class="uchip ${c}"><small>${n}</small><b>${UT_POWERS[i]}</b></span>`;}).join('');
  $('uPack').classList.toggle('hidden',!pend);
  $('uPackT').textContent=UT.packs[0]===0&&!has?'Apri il pacchetto iniziale':`Apri: ${utPackName(UT.packs[0])}${pend>1?' (+'+(pend-1)+')':''}`;
  $('uPackS').textContent=pend?`${utPackSize(UT.packs[0])} ${utPkRole(UT.packs[0])===EQ_PK?'accessori':'giocatori'} · ${utPackTip(UT.packs[0])}`:'';
  const r=Math.min(UT.round,5),o=UT.opp[r];
  $('uPlayRow').classList.toggle('hidden',UT.st!=='play'||!!pend||!has);
  $('uPlay').disabled=!playing;$('uSim').disabled=!playing;
  $('uPlayT').textContent=`Gioca: ${UT_ROUNDS[r]}`;
  $('uPlayS').textContent=o?(UT.sel.length===7?`Contro ${o.name} · forza ${o.power} (tu ${utPower()})`:'Scegli 7 titolari nella tua squadra'):'';
  $('uTeam').classList.toggle('hidden',!has);
  $('uTeamS').textContent=has?`${UT.col.length} giocatori · scegli i 7 titolari`:'';
  $('uEquip').classList.toggle('hidden',!has);$('uEquipS').textContent=eqSubTxt();
  $('uNew').classList.toggle('hidden',UT.st==='play');
  $('uDiff').innerHTML=UT_DIFF.map((d,i)=>`<button type="button" class="sg${i===UT.d?' on':''}" data-d="${i}">${d.name}</button>`).join('');$('uDiffN').textContent=UT_DIFF[UT.d].txt+' Le avversarie hanno la forza del turno'+(DIFF_PLUS[UT.d|0]?', con +'+DIFF_PLUS[UT.d|0]+' a tutte le statistiche.':'.');
  $('uMsg').textContent=UT.res||'';
}
$('tUT').addEventListener('click',()=>showScreen('utMode'));   // prima si sceglie: Computer (questa pagina) o Real player (04-ut-online.js)
$('uBack').addEventListener('click',()=>showScreen('utMode'));
$('uPack').addEventListener('click',()=>{UT.stage='closed';showScreen('utPack');});
let utTeamBack='ut';   // la squadra si apre sia dal torneo contro il computer sia da Real player: «Indietro» torna da dove sei venuto
$('uTeam').addEventListener('click',()=>{utTeamBack='ut';showScreen('utTeam');});
$('uPlay').addEventListener('click',startUT);
$('uDiff').addEventListener('click',e=>{const b=e.target.closest('.sg');if(!b)return;UT.d=+b.dataset.d;utSave();renderUT();});
$('uSim').addEventListener('click',simUTMatch);
$('uShop').addEventListener('click',()=>showScreen('utShop'));   // il Negozio (05-ut-negozio.js) e' lo stesso per il torneo contro il computer e per Real player
$('uObj').addEventListener('click',e=>{const b=e.target.closest('[data-obj]');if(!b||b.disabled)return;const o=UT_OBJ.find(x=>x.id===b.dataset.obj);if(!o||UT.claimed[o.id]||!o.ok())return;UT.claimed[o.id]=true;UT.coins+=o.rw;UT.res=`Obiettivo raggiunto: +${o.rw} gettoni.`;utSave();renderUT();});
$('uNew').addEventListener('click',()=>{UT.tid++;UT.round=0;UT.st='play';UT.res='';UT.packs.push(0);utOpps();utSave();renderUT();});
// ---- apertura del pacchetto ----
const utPos=p=>POS_NAME[posOf(p)];
const utCard=(p,i)=>{const [rn,rc]=utRar(p.ovr);return `<div class="ucard ${rc}" style="animation-delay:${(Math.min(i,8)*0.08).toFixed(2)}s"><b>${p.ovr}</b><span>${p.n}</span><i>${utPos(p)} · ${rn}</i>${p.cl?`<i>${p.cl}</i>`:''}${p.trait&&TRAITS[p.trait]?`<i style="color:#e0b3ff">${TRAITS[p.trait][0]}</i>`:''}</div>`;};
function renderPack(){
  const open=UT.stage==='open';
  $('pkTitle').textContent=open?(UT.cur[0]&&UT.cur[0].eq?'Ecco i tuoi accessori':'Ecco i tuoi giocatori'):utPackName(UT.packs[0]);
  const v=UT.packs[0],eq=utPkRole(v)===EQ_PK;
  $('pkBody').innerHTML=open?`<div class="ucards">${UT.cur.map((p,i)=>p.eq?eqCard(p,i):utCard(p,i)).join('')}</div>${UT.eqMsg?`<p class="qp" style="text-align:center">${UT.eqMsg}</p>`:''}`:`<div class="dpk">${utDisc(utPkQ(v),utPackSize(v),eq?'E':(utPkRole(v)===1?'H':(utPkRole(v)===2?'C':'')))}<b>${eq?'accessori':'giocatori'}</b><small>${utPackTip(v)}</small></div>`;
  $('pkGo').textContent=open?(UT.packs.length?`Prossimo pacchetto (${UT.packs.length})`:'Continua'):'Apri';
}
$('pkGo').addEventListener('click',()=>{
  if(UT.stage==='closed'){
    const v=UT.packs.shift();UT.eqMsg='';
    if(utPkRole(v)===EQ_PK)UT.cur=utEqOpen(v);   // accessori (07-ut-equipaggiamento.js)
    else{UT.cur=utMakePack(v);UT.cur.forEach(p=>{p.isNew=true;UT.col.push(p);});
    if(UT.sel.length<7||!UT.manual)utAuto();}   // finche' non scegli tu i titolari, restano i migliori 7
    utSave();UT.stage='open';renderPack();
  }else if(UT.packs.length){UT.stage='closed';renderPack();}
  else showScreen(UT.rp?'utReal':'ut');
});
// ---- la tua squadra: scegli i 7 titolari ----
function renderTeamUT(){
  const idx=UT.col.map((p,i)=>i).sort((a,b)=>UT.col[b].ovr-UT.col[a].ovr);
  for(const b of $('tmMode').children){b.classList.toggle('on',b.dataset.m===UT.mode);if(b.dataset.m==='up')b.textContent=utUpLock()?'Potenzia (da 1100 punti)':'Potenzia';}
  const tip=UT.mode==='sel'?'tocca un giocatore per metterlo o toglierlo dai titolari':(UT.mode==='up'?'tocca una carta e scegli il potenziamento: ogni carta ne ha al massimo 4 (2 per linea), il prezzo è accanto al nome':'tocca una riserva per scartarla e recuperare gettoni (i titolari non si scartano)');
  $('tmInfo').innerHTML=`Titolari: <b>${UT.sel.length}/7</b> · Forza: <b>${utPower()}</b> · Gettoni: <b>${UT.coins}</b> — ${tmMsg||tip}`;
  const hdr=`<div class="urow hd"><span></span><span>Giocatore</span><span></span>${SHOW.map(k=>`<span class="sv">${k.toUpperCase()}</span>`).join('')}</div>`;
  $('tmList').innerHTML=hdr+idx.map(i=>{const p=UT.col[i],rc=utRar(p.ovr)[1],ex=UT.mode==='up'?((p.up|0)>=UT_UP_MAX?'max':utUpCost(p)+'g'):(UT.mode==='del'&&!UT.sel.includes(i)?'+'+UT_SELL[rc]+'g':'');
    return `<div class="urow ${rc}${UT.sel.includes(i)?' sel':''}${UT.mode==='up'&&UT.upSel===i?' sel2':''}" data-i="${i}"><b class="uo">${p.ovr}</b><span class="un"${p.cl?` title="${p.label||p.n} · ${p.cl}"`:''}>${p.n}${p.isNew?'<span class="nw">NEW</span>':''}${p.up?`<span class="upb">${p.ul?Object.keys(UT_LINES).filter(l=>p.ul[l]).map(l=>UT_LINES[l].n[0]+(p.ul[l]>1?p.ul[l]:'')).join(' '):'+'+p.up}</span>`:''}${ex?`<span class="upb" style="color:var(--gold)">${ex}</span>`:''}</span><em title="${p.trait&&TRAITS[p.trait]?TRAITS[p.trait][0]:''}">${posOf(p)}${p.trait?'*':''}</em>${SHOW.map(k=>`<span class="sv">${p.s[k]}</span>`).join('')}</div>`;}).join('');
  renderUp();
  UT.col.forEach(p=>{p.isNew=false;});utSave();
}
let tmMsg='';
// in Real player i potenziamenti si sbloccano al primo traguardo (1100 punti): all'inizio i gettoni rendono molto di piu' in pacchetti,
// e chi e' appena arrivato non li spreca
const utUpLock=()=>UT.rp&&(UT.ms|0)<1,UT_UP_LOCK='i potenziamenti si sbloccano quando arrivi a 1100 punti: fino ad allora usa i gettoni per i pacchetti';
function renderUp(){
  const p=UT.mode==='up'&&UT.upSel!==undefined?UT.col[UT.upSel]:null,box=$('tmUp');
  box.classList.toggle('hidden',!p);if(!p)return;
  const c=utUpCost(p);
  box.innerHTML=`<b>${p.n}</b> · ${p.ovr} · potenziamenti ${p.up|0}/${UT_UP_MAX} · prezzo ${c} gettoni<div class="schrow">${Object.keys(UT_LINES).map(l=>{const L=UT_LINES[l],why=utUpWhy(p,l),n=(p.ul&&p.ul[l])|0;return `<button type="button" class="sec" data-ul="${l}"${why||UT.coins<c?' disabled':''} title="${esc(L.keys.map(k=>LBL[k]).join(', '))}"><strong>${L.n}</strong> +${L.g}<small>${L.keys.map(k=>k.toUpperCase()).join(' ')}${n?' · '+n+'/'+UT_UP_LINE:''}${why?' · '+why:''}</small></button>`;}).join('')}</div>`;
}
$('tmUp').addEventListener('click',e=>{
  const b=e.target.closest('[data-ul]');if(!b||b.disabled)return;
  const p=UT.col[UT.upSel];if(!p)return;const c=utUpCost(p),l=b.dataset.ul;
  if(utUpLock()||utUpWhy(p,l)||UT.coins<c)return;
  UT.coins-=c;utDoUp(p,l);UT.stat.up++;tmMsg=`${p.n} potenziato (${UT_LINES[l].n}): ora vale ${p.ovr}.`;renderTeamUT();
});
$('tmMode').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;tmMsg='';if(b.dataset.m==='up'&&utUpLock()){tmMsg=UT_UP_LOCK;renderTeamUT();return;}UT.mode=b.dataset.m;UT.upSel=undefined;renderTeamUT();});
$('tmList').addEventListener('click',e=>{
  const r=e.target.closest('.urow[data-i]');if(!r)return;const i=+r.dataset.i,k=UT.sel.indexOf(i),p=UT.col[i];tmMsg='';
  if(UT.mode==='up'){UT.upSel=i;renderTeamUT();return;}   // si sceglie la carta, poi il potenziamento nel riquadro
  if(UT.mode==='del'){
    if(k>=0)tmMsg='i titolari non si scartano: toglilo prima dai titolari.';
    else if(UT.col.length<=7)tmMsg='servono almeno 7 giocatori.';
    else{const g=UT_SELL[utRar(p.ovr)[1]];UT.coins+=g;UT.col.splice(i,1);UT.upSel=undefined;UT.sel=UT.sel.map(x=>x>i?x-1:x);tmMsg=`${p.n} scartato: +${g} gettoni.`;}
    renderTeamUT();return;
  }
  UT.manual=true;
  if(k>=0)UT.sel.splice(k,1);else if(UT.sel.length<7)UT.sel.push(i);else tmMsg='hai già 7 titolari: togline uno prima di aggiungerne un altro.';
  renderTeamUT();
});
$('tmAuto').addEventListener('click',()=>{UT.manual=false;utAuto();utSave();renderTeamUT();});
$('tmBack').addEventListener('click',()=>showScreen(utTeamBack));
// ---- partita del torneo ----
// ---- SIMULA PARTITA (carriera, torneo, Ultimate Team): il risultato dipende dalla forza delle due squadre e dalla difficolta' dell'IA,
//  con la scala misurata sulle partite giocate (simPointP e SIM_DIFF in 10-sim/13-partite-simulate.js). Si gioca ai 7 punti, come la partita vera.
let simAfter=null;
function showSim(win,score,msg,after){
  $('srMoney').innerHTML='';$('srTitle').textContent=win?'Vittoria!':'Sconfitta';$('srScore').textContent=score;$('srEvent').textContent=msg;simAfter=after;$('simres').classList.remove('hidden');
}
$('srOk').addEventListener('click',()=>{$('simres').classList.add('hidden');const f=simAfter;simAfter=null;if(f)f();});
function simCareerMatch(){
  const m=nextMatch();if(!m)return;
  SQ.forEach(p=>{p.injNew=false;});fixLineup();   // gli infortunati non giocano, come nella partita vera
  fixLines();
  const lo=matchLine('lineO').map(id=>SQ[id]),ld=matchLine('lineD').map(id=>SQ[id]);
  // potenza di oggi della tua squadra con la formula unica (myPow, 10-partita-avvio.js): infortunati fuori, DBL_PEN per chi sta in entrambe le linee e condizione
  // fisica, con gli stessi effetti di una partita giocata; poi affiatamento e morale. L'avversario: la potenza della sua rosa (il livello statico, se non ce l'ha, va portato alla stessa scala)
  const opp=(m.roster?rosterPower(m.roster):m.power-PW_LV)+carDiff().plus,my=myPow(true)+teamFormB()*0.8;
  const r=simMatch(my,opp,carDiff().ai|0,carLen()),w=r.a>r.b;   // la difficolta' scelta vale anche qui: l'IA migliore vale qualche punto di forza in piu'
  // una partita simulata vale come una giocata: stessa esperienza media, statistiche personali, fatica e (ora) anche gli infortuni
  const on=new Set(matchLine('lineO').concat(matchLine('lineD')));
  const gk=carGrowK();   // crescita secondo la serie e il distacco (29-potenziali.js), come nelle partite giocate
  for(const p of SQ){p.m=newCounters();if(on.has(p.id)&&!p.inj){p.m.pts=1;p.m.sh=((lo.includes(p)?1:0)+(ld.includes(p)?1:0))/2;growBy(p,simParts(p,1),XP_ROLE[posOf(p)]*gk);}}   // sh: quota di mete giocate (fatShare)
  simMatchStats(r.a);
  simInjuries([...on].map(id=>SQ[id]).filter(Boolean),1-0.12*facLv('fis'));   // dopo la crescita: chi si fa male in partita la partita l'ha giocata
  const msg=recordResult(w,r.a,r.b);
  showSim(w,`${SV.team} ${r.a} – ${r.b} ${m.name}`,msg,()=>renderHome());$('srMoney').innerHTML=moneyHTML(SV.lastMoney);
}
function simUTMatch(){
  if(UT.sel.length!==7||UT.st!=='play'||UT.packs.length)return;
  const o=UT.opp[UT.round],my=UT.sel.reduce((a,i)=>a+mean9(eqApply(UT.col[i],UT.eq)),0)/7;
  const r=simMatch(my,o.power+(DIFF_PLUS[clamp(UT.d|0,0,3)]||0),UT.d),w=r.a>r.b,msg=utRecord(w);
  showSim(w,`Ultimate Team ${r.a} – ${r.b} ${o.name}`,msg,()=>renderUT());
}
function startUT(){
  if(UT.sel.length!==7||UT.st!=='play')return;
  const r=UT.round,opp=UT.opp[r];
  if(hasCareer()){persist();QM.bak=JSON.stringify(SV);}else QM.bak=null;   // la carriera resta com'e': viene rimessa alla fine
  QM.on=true;UT.on=true;
  setSquad(UT.col.map(p=>eqApply(p,UT.eq)));setLineup(UT.sel.slice());   // l'equipaggiamento vale solo in partita: le carte restano com'erano
  applyRoster(utOppRoster(UT_POWERS[r],'ut|'+UT.tid+'|'+r));oppBoost(DIFF_PLUS[clamp(UT.d|0,0,3)]);
  SQ.forEach(p=>{p.injNew=false;p.inj=0;p.cond=100;});
  G.formB=0;G.lines=null;G.injK=1;
  G.oppName=opp.name;G.myName='Ultimate Team';G.matchLabel='Ultimate Team · '+UT_ROUNDS[r];
  newGame();rollWind();G.lvl=[0,clamp(UT.d|0,0,3)];G.oppPlus=DIFF_PLUS[clamp(UT.d|0,0,3)];G.idn=[null,teamIdentity(opp.name,T[1])];G.xtr=(UT.d|0)===3;G.hint=(UT.d|0)===0;G.routes=(UT.d|0)<=1;G.inMatch=true;G.recorded=false;   // difficolta': IA come in partita veloce, Estrema = traiettoria nascosta
  hideScreens();$('over').classList.add('hidden');
  startPoint(G.nextRec);cam.snap=true;
}
// gettoni: si guadagnano giocando (di piu' vincendo e andando avanti), si spendono in pacchetti e potenziamenti; scartando i doppioni se ne recuperano
const UT_SELL={com:4,unc:8,rar:20,epi:55,leg:140};
// crescita lenta delle carte che giocano: ogni 4 partite da titolare +1 alla loro statistica migliore ancora sotto il massimo (fino a +4 in tutto)
function utGrowCards(){
  const out=[];
  for(const i of UT.sel){const p=UT.col[i];if(!p)continue;p.gm=(p.gm|0)+1;
    if(p.gm%4===0&&(p.gu|0)<4){const ks=KEYS.filter(k=>p.s[k]<90).sort((a,b)=>p.s[b]-p.s[a]);if(ks.length){p.s[ks[0]]++;p.gu=(p.gu|0)+1;p.ovr=ovr(p);out.push(p.n);}}}
  return out;
}
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
  const grown=utGrowCards();
  if(win){
    if(r>=5){UT.st='won';UT.round=6;UT.packs.push(6,eqCode(4,2));UT.res='Campioni! Hai vinto il torneo e ottieni il Super pacchetto e un pacchetto equipaggiamento.';}
    else{UT.round=r+1;UT.packs.push(r+1);UT.res=`Passi ${UT_TO[r+1]}: hai ottenuto un nuovo pacchetto.`;}
  }else{UT.st='out';UT.res=`Eliminati ${UT_TO[r]}. Puoi iniziare un nuovo torneo e tenere i tuoi giocatori.`;}
  UT.res+=` +${gain} gettoni.`+(grown.length?` ${grown.length===1?grown[0]+' è cresciuto':grown.length+' carte sono cresciute'} giocando.`:'');
  utSave();return UT.res;
}
utLoad();

const quickNext=()=>DR.on?'school':(TN.on?'tourn':(UT.on?(UO.on?'utReal':'ut'):'quick'));
function exitQuick(next){
  DR.on=false;TN.on=false;G.drill=null;$('coach').classList.add('hidden');$('drEnd').classList.add('hidden');
  QM.on=false;UT.on=false;UO.on=false;G.inMatch=false;G.schemeOpen=false;$('menu').classList.add('hidden');$('over').classList.add('hidden');
  if(QM.bak){SV={};loadSave(JSON.parse(QM.bak));}else{SV={};initTeams();}   // rimetto la rosa della carriera (o quella iniziale)
  QM.bak=null;showScreen(next||'title');
}


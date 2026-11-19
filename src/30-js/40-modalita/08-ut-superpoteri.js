/* ===================== ULTIMATE TEAM · SUPERPOTERI =====================
   La terza squadra di Ultimate Team (UT.hm, salvata in ultimate-ut-eroi). Si gioca online come Real player (04-ut-online.js, ma con la radice «uh»:
   profilo, classifica e squadre loro) e gli eroi si trovano nei pacchetti. Una carta eroe e' un potere: si da' a un titolare (p.hk sulla carta),
   al massimo HERO_N in campo. I doppioni fanno salire l'eroe di livello (UT.hc[eroe] = copie trovate = livello, fino a HERO_LV_MAX: trasformazione piu'
   lunga e ricarica piu' corta, 10-sim/27-superpoteri.js); oltre il massimo diventano gettoni.
   Pacchetti eroi: ruolo HERO_PK (codice = qualita' + 10 x carte + 400). Il primo, insieme al pacchetto iniziale, ha tre eroi diversi; dalla qualita' 4
   uno degli eroi e' uno che non hai ancora (se ce ne sono). Si comprano nel Negozio (05-ut-negozio.js) e arrivano a ogni traguardo di punti (utHeroMile).
   Senza altri giocatori online si gioca contro una squadra del computer con tre eroi (utHeroBot). */
const HERO_PK=4,HERO_START_PK=430,HERO_DUP=40;   // HERO_DUP: gettoni per un doppione di un eroe gia' al livello massimo
const UT_HERO_MILE=[[2,2],[3,2],[4,3],[5,3],[6,3]];   // traguardi: [qualita', carte], sempre migliori
function utHeroMile(i){const m=UT_HERO_MILE[clamp(i,1,UT_HERO_MILE.length)-1];return m[0]+m[1]*10+HERO_PK*100;}
function utHeroHc(o){const h={};if(o&&typeof o==='object')for(const k of HERO_K)if(o[k]>0)h[k]=clamp(o[k]|0,1,HERO_LV_MAX);return h;}   // dal salvataggio: solo eroi veri e livelli validi
function utHeroPackName(v){const q=utPkQ(v);return q===0?'Pacchetto eroi iniziale':(q>=6?'Super pacchetto eroi':(q>=2?'Pacchetto eroi '+UT_PQN[q].split(' ')[1]:'Pacchetto eroi'));}
function utHeroPackTip(v){const q=utPkQ(v);return q===0?'tre eroi diversi':(q>=4?'almeno un eroe che non hai ancora':'eroi nuovi o livelli in più');}
// apertura: le carte eroe non entrano nella rosa, vanno nella collezione degli eroi
function utHeroOpen(v){
  const q=utPkQ(v),n=utPackSize(v),out=[],first=q===0&&!Object.keys(UT.hc).length,pool=HERO_K.slice().sort(()=>Math.random()-0.5);let g=0;
  for(let i=0;i<n;i++){
    let k;
    if(first)k=pool[i%pool.length];
    else{const miss=HERO_K.filter(x=>!UT.hc[x]&&!out.some(c=>c.hk===x));k=q>=4&&i===0&&miss.length?miss[Math.floor(Math.random()*miss.length)]:HERO_K[Math.floor(Math.random()*HERO_K.length)];}
    const had=UT.hc[k]|0;
    if(had>=HERO_LV_MAX){g+=HERO_DUP;out.push({hk:k,lv:had,max:true});}
    else{UT.hc[k]=had+1;out.push({hk:k,lv:had+1,nw:!had});}
  }
  if(g){UT.coins+=g;UT.eqMsg=`Eroi già al livello massimo: +${g} gettoni.`;}
  if(!UT.col.some(c=>c.hk))utHeroAuto();   // i primi eroi vanno subito in campo
  return out;
}
const heroLvDots=lv=>`<span class="hlv">${Array.from({length:HERO_LV_MAX},(_,i)=>`<i class="${i<lv?'on':''}"></i>`).join('')}</span>`;
function heroUCard(c,i){
  return `<div class="ucard hcard${c.nw?' hnw':''}" style="animation-delay:${(i*0.3).toFixed(2)}s"><span class="hico">${heroIconSvg(c.hk)}</span><span>${HERO[c.hk].n}</span><i>${c.nw?'Nuovo eroe!':(c.max?'Livello massimo · +'+HERO_DUP+' gettoni':'Sale al livello '+c.lv)}</i>${heroLvDots(c.lv)}</div>`;
}
// gli eroi stanno solo sui titolari, uno per eroe, al massimo HERO_N: chi esce dai titolari lo perde
function utHeroFix(){
  const seen=new Set();
  UT.col.forEach((c,i)=>{if(!c.hk)return;if(!UT.sel.includes(i)||!UT.hc[c.hk]||seen.has(c.hk)||seen.size>=HERO_N){delete c.hk;return;}seen.add(c.hk);});
}
// assegna da solo: i tre eroi di livello piu' alto, ognuno al titolare piu' adatto (le stesse regole dei Superpoteri, su copie delle carte)
function utHeroAuto(){
  if(UT.sel.length<7)return;
  UT.col.forEach(c=>{delete c.hk;});
  const ks=Object.keys(UT.hc).sort((a,b)=>UT.hc[b]-UT.hc[a]||Math.random()-0.5).slice(0,HERO_N),cp=UT.sel.map(i=>Object.assign({},UT.col[i]));
  heroAssign(cp,ks);cp.forEach((c,j)=>{if(c.hero)UT.col[UT.sel[j]].hk=c.hero;});
}
const utHeroSub=()=>{utHeroFix();const n=UT.col.filter(c=>c.hk).length,o=Object.keys(UT.hc).length;return `${n} in campo su ${HERO_N} · ${o} trovati su ${HERO_K.length}`;};
// in partita: i tuoi eroi sono le carte assegnate ai titolari (con il loro livello), quelli avversari arrivano con la squadra scaricata
function utHeroMatch(ros){
  G.heroOn=true;const mine=[],opp=[],sum=p=>KEYS.reduce((a,k)=>a+p.s[k],0);
  SQ.forEach((p,i)=>{p.hero=null;p.hlv=0;const c=UT.col[i];if(c&&c.hk&&UT.hc[c.hk]&&UT.sel.includes(i)&&mine.length<HERO_N&&!mine.includes(c.hk)){p.hero=c.hk;p.hlv=UT.hc[c.hk];mine.push(c.hk);}});
  for(const p of T[1]){p.hero=null;p.hlv=0;}
  for(const o of (ros||[]).filter(o=>o&&o.hero)){
    if(opp.length>=HERO_N||opp.includes(o.hero))continue;
    const s=T[1].find(p=>p.ro===o&&!p.hero)||T[1].filter(p=>!p.hero).sort((a,b)=>sum(a)-sum(b))[0];   // se la sua carta non e' tra i 7 in campo, l'eroe va al piu' debole
    if(s){s.hero=o.hero;s.hlv=o.hlv||1;opp.push(o.hero);}
  }
  heroInit(mine,opp);
}
// nessun altro giocatore online: una squadra del computer della tua forza, con tre eroi a caso di livello che cresce con i tuoi punti
function utHeroBot(){return {id:'cpu',n:'Squadra del computer',p:UOP?UOP.p:UTO_START,pw:utPower(),w:0,l:0,g:0};}
function utHeroBotRoster(){
  const pts=UOP?UOP.p:UTO_START,ros=utOppRoster(clamp(utPower(),40,95),'uhbot|'+pts+'|'+Date.now()),lv=clamp(1+Math.floor((pts-UTO_START)/150),1,HERO_LV_MAX);
  heroAssign(ros.slice(0,7),heroRand());for(const o of ros)if(o.hero)o.hlv=lv;
  return ros;
}
// ---- schermata «I tuoi eroi»: tocca un eroe, poi il titolare a cui darlo; toccando un titolare con un eroe glielo togli ----
let uhSel=null,uhMsg='';
function renderUtHero(){
  utHeroFix();
  const on=UT.col.filter(c=>c.hk).length;
  $('uhInfo').innerHTML=`Eroi in campo: <b>${on}/${HERO_N}</b> · Trovati: <b>${Object.keys(UT.hc).length}/${HERO_K.length}</b> — ${uhSel?'ora tocca il titolare a cui darlo':'tocca un eroe che hai, poi il titolare a cui darlo'}`;
  $('uhList').innerHTML=HERO_K.map(k=>{const lv=UT.hc[k]|0,who=UT.col.find(c=>c.hk===k);
    return `<button type="button" class="qhe${lv?' on':''}${uhSel===k?' sel':''}" data-k="${k}"${lv?'':' disabled'}><i>${heroIconSvg(k)}</i><span><strong>${HERO[k].n}${lv?heroLvDots(lv):''}</strong><small>${lv?(who?'In campo: '+esc(who.n):'Non in campo'):'Non ancora trovato'} · ${HERO[k].txt}</small></span></button>`;}).join('');
  $('uhSt').innerHTML=UT.sel.length<7?'<p class="qp">Scegli prima i 7 titolari nella tua squadra.</p>':UT.sel.map(i=>{const c=UT.col[i];return `<button type="button" class="uhp${c.hk?' has':''}" data-i="${i}"><b>${c.ovr}</b><span>${esc(c.n)}</span><em>${posOf(c)}</em><i>${c.hk?heroIconSvg(c.hk):''}</i></button>`;}).join('');
  $('uhMsg').textContent=uhMsg;$('uhAuto').disabled=UT.sel.length<7||!Object.keys(UT.hc).length;
}
$('uhList').addEventListener('click',e=>{const b=e.target.closest('.qhe');if(!b||b.disabled)return;uhSel=uhSel===b.dataset.k?null:b.dataset.k;uhMsg='';renderUtHero();});
$('uhSt').addEventListener('click',e=>{
  const b=e.target.closest('.uhp');if(!b)return;const c=UT.col[+b.dataset.i];if(!c)return;
  if(uhSel){
    const on=UT.col.filter(x=>x.hk&&x!==c).filter(x=>x.hk!==uhSel).length;
    if(!c.hk&&!UT.col.some(x=>x.hk===uhSel)&&on>=HERO_N)uhMsg=`Hai già ${HERO_N} eroi in campo: togline uno toccando il titolare che lo ha.`;
    else{for(const x of UT.col)if(x.hk===uhSel)delete x.hk;c.hk=uhSel;uhMsg=`${HERO[uhSel].n}: ora è ${c.n}.`;uhSel=null;}
  }else if(c.hk){uhMsg=`${HERO[c.hk].n} tolto a ${c.n}.`;delete c.hk;}
  else uhMsg='Tocca prima un eroe nell’elenco.';
  utSave();renderUtHero();
});
$('uhAuto').addEventListener('click',()=>{utHeroAuto();uhSel=null;uhMsg='Eroi assegnati: i più forti, ognuno al titolare più adatto.';utSave();renderUtHero();});
$('uhBack').addEventListener('click',()=>showScreen('utReal'));
$('urHero').addEventListener('click',()=>showScreen('utHero'));

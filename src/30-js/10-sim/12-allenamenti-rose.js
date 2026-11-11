/* ---- ALLENAMENTI: cinque indirizzi. Ognuno migliora un gruppo di statistiche (stesso totale di punti per tutti i gruppi: niente piu' statistiche
   che crescono tre volte piu' in fretta) ma costa condizione fisica; con la condizione bassa cresce il rischio di infortunio. Il Recupero la restituisce. ---- */
const CATS=[{id:'tec',name:'Tecnica',keys:['lan','buc','spa','pre']},{id:'atl',name:'Atletismo',keys:['vel','sca','agi','sal','res']},{id:'dif',name:'Difesa',keys:['dif','tuf']},{id:'tat',name:'Tattica',keys:['vis']}];
const catLevel=(p,c)=>Math.round(c.keys.reduce((a,k)=>a+p.s[k],0)/c.keys.length);
const TRAIN_COST=7,TRAIN_COST1=5,REST_GAIN=18;   // condizione persa con l'allenamento di squadra, con quello singolo, e recuperata col Recupero
function trainGain(t){return t>=90?3:(t>=80?2:1);}
function trainCategory(p,c,boost){
  // punti: in media 1,6 a seduta per un talento normale a 24-27 anni, di piu' per i giovani e per chi cresce in fretta, quasi nulla vicino al massimo.
  // Tattica e Difesa hanno meno statistiche: meta' dei punti, cosi' nessuna statistica corre piu' delle altre
  const tal=c.keys.reduce((a,k)=>a+talX(p,k),0)/c.keys.length,gained={};
  const sb=specBonus(p,c.keys),sp=p.spec&&SPECS[p.spec]?SPECS[p.spec].keys:null;   // indirizzo personale: piu' punti, e i punti vanno alle sue statistiche
  let pts=(0.8+trainGain(tal)*0.4)*(p.dev||1)*Math.sqrt(ageMul(p.age))*(c.keys.length<3?0.55:1)*(boost||1)*(1+sb),n=Math.floor(pts);if(Math.random()<pts-n)n++;
  for(let i=0;i<n;i++){
    const el=c.keys.filter(k=>p.s[k]<capX(p,k));if(!el.length)break;
    let t=0;const ws=el.map(k=>{const r=clamp((capX(p,k)-p.s[k])/10,0.08,1)*(sp&&sp.includes(k)?1+2*specRoom(p):1);t+=r;return r;});
    let r=Math.random()*t,k=el[0];for(let j=0;j<el.length;j++){r-=ws[j];if(r<=0){k=el[j];break;}}
    if(Math.random()>clamp((capX(p,k)-p.s[k])/6,0.2,1)*lvlF(p.s[k]))continue;   // vicino al massimo il punto puo' non arrivare
    gained[k]=(gained[k]||0)+1;p.s[k]++;
  }
  const changes=Object.keys(gained).map(k=>({k,to:p.s[k],from:p.s[k]-gained[k],gain:gained[k]}));
  const gain=changes.reduce((a,x)=>a+x.gain,0);
  return {p,c,changes,gain,spec:sb>0,why:gain>0?'ok':(c.keys.every(k=>p.s[k]>=capX(p,k))?'cap':'none')};
}
function trainPlayer(p,k){return trainCategory(p,CATS.find(c=>c.keys.includes(k))||CATS[0]);}
// rischio di infortunio in allenamento: nullo con buona condizione, fino al 6% a condizione zero
const trainRisk=p=>clamp((45-(p.cond===undefined?100:p.cond))/45,0,1)*0.06;
// aspetto dei giocatori: capelli, pelle e corporatura diversi, stabili per nome (stile: 0 corti, 1 medi, 2 lunghi, 3 coda, 4 rasati)
const HAIR_COLORS=['#1c1410','#2b1b12','#3d2616','#5a3a1e','#7a4a21','#a8742f','#c9964a','#d9b873','#e6cf98','#8a2f1c','#b8452a','#4a4a52','#a9a9b0','#101010'];
const SKIN_TONES=['#f6d7ba','#f0c9a4','#e6b995','#d9a47a','#c28a5e','#a56e45','#8a5a3a'];
// aspetto dedicato dei giocatori internazionali veri: capelli, carnagione, taglio, barba, fascia. Solo tratti generali, quanto basta a un omino di 20 pixel
const LOOKS={
  'De Marrée Daan':{hair:'#5a3a1e',skin:'#f0c9a4',style:0},'Decraene Tobe':{hair:'#a8742f',skin:'#f6d7ba',style:0},
  'Babbitt Jeff':{hair:'#8a2f1c',skin:'#f6d7ba',style:0,beard:1},'Jagt Ben':{hair:'#d9b873',skin:'#f6d7ba',style:2,band:'#f4f4f4'},
  'Williams Jack':{hair:'#5a3a1e',skin:'#f0c9a4',style:0},'Mickle Jimmy':{hair:'#5a3a1e',skin:'#f0c9a4',style:1,beard:1},
  'Osgar Ryan':{hair:'#a8742f',skin:'#f6d7ba',style:0},'Freechild Dylan':{hair:'#5a3a1e',skin:'#f0c9a4',style:3,band:'#1a1c2c'},
  'Davis Antoine':{hair:'#101010',skin:'#8a5a3a',style:2},'El-Salaam Khalif':{hair:'#101010',skin:'#8a5a3a',style:2,band:'#ffd23f'},
  'McDonnell Rowan':{hair:'#5a3a1e',skin:'#f0c9a4',style:0,beard:1},'Janas Pawel':{hair:'#2b1b12',skin:'#f0c9a4',style:0},
  'Juengst Anders':{hair:'#d9b873',skin:'#f6d7ba',style:0},'Dunn Travis':{hair:'#2b1b12',skin:'#f0c9a4',style:0,beard:1},
  'Schlör Conrad':{hair:'#c9964a',skin:'#f6d7ba',style:1},'Kittredge Beau':{hair:'#5a3a1e',skin:'#f0c9a4',style:0},
  'Smith Brodie':{hair:'#5a3a1e',skin:'#f0c9a4',style:0,beard:1},'Gibson Kurt':{hair:'#2b1b12',skin:'#f0c9a4',style:4,beard:1},
  'Brownlee Marques':{hair:'#101010',skin:'#8a5a3a',style:0,beard:1}
};
function makeLook(key,f){
  const r=mulberry32(hashStr('look|'+key)),pick=a=>a[Math.floor(r()*a.length)];
  if(LOOKS[key])return Object.assign({hs:1,bw:1,hd:1},LOOKS[key]);
  return {hair:pick(HAIR_COLORS),skin:pick(SKIN_TONES),style:f?2+Math.floor(r()*2):Math.floor(r()*5),hs:0.95+r()*0.1,bw:0.9+r()*0.22,hd:0.94+r()*0.14};
}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const NAME_POOL=['Alessandro','Andrea','Antonio','Beatrice','Camilla','Carlo','Chiara','Claudia','Daniele','Davide','Edoardo','Elisa','Emma','Federico','Francesca','Gabriele','Giorgia','Giulio','Ilaria','Jacopo','Laura','Leonardo','Lorenzo','Marco','Marta','Martina','Matteo','Michele','Nicola','Paola','Pietro','Riccardo','Sara','Simone','Stefano','Tommaso','Valentina','Vittoria','Alice','Giada'];
// ---- rose delle squadre avversarie: ogni giocatore ha eta', talenti e statistiche ----
function agePen(a,rng){   // i giovanissimi (16-18) sono meno forti, con qualche eccezione
  if(a>=19)return a===19?-3:(a===20?-1:0);
  if(rng()<0.1)return 0;
  return a===16?-14:(a===17?-10:-6);
}
const ROLES14=['H','H','H','H','H','H','C','C','C','C','C','C','C','C'],SEL=1.5;   // SEL: i migliori 7 su 14 sono un po' sopra la media
function makeRoster(power,seedStr){
  const rng=mulberry32(hashStr(seedStr)),R=(a,b)=>a+rng()*(b-a),pool=NAME_POOL.slice(),out=[],base=power-SEL;
  ROLES14.forEach(role=>{
    const hand=role==='H',u=rng();
    const age=u<0.14?16+Math.floor(rng()*3):(u<0.66?19+Math.floor(rng()*7):26+Math.floor(rng()*5));
    const pen=agePen(age,rng),tg=()=>clamp(Math.round(power+14+R(-3,6)),70,99);
    const o={n:pool.splice(Math.floor(rng()*pool.length),1)[0],r:role,age,tl:tg(),tf:tg(),tv:tg(),s:{}};
    KEYS.forEach(k=>{
      const g=(k==='lan'||k==='buc'||k==='spa')?'L':(k==='vis'?'V':'F');
      const off=hand?(g==='L'?8:(g==='V'?5:-7)):(g==='L'?-9:(g==='V'?-3:7));
      o.s[k]=clamp(Math.round(base+off+pen+R(-6,6)),28,capVal(o.n,k,g==='L'?o.tl:(g==='V'?o.tv:o.tf)));
    });
    out.push(o);
  });
  return out;
}
const mean9=o=>ovrX(o);   // forza di un giocatore = Overall nel suo ruolo (prima era la media semplice di tutte le statistiche)
// in campo vanno i migliori 3 handler e i migliori 4 cutter (se ne mancano, i migliori rimasti)
function pickSeven(list,roleOf,meanOf){
  const byM=(a,b)=>meanOf(b)-meanOf(a);
  let pick=list.filter(o=>roleOf(o)==='H').sort(byM).slice(0,3).concat(list.filter(o=>roleOf(o)==='C').sort(byM).slice(0,4));
  if(pick.length<7)pick=pick.concat(list.filter(o=>!pick.includes(o)).sort(byM).slice(0,7-pick.length));
  return pick;
}
const bestSeven=list=>pickSeven(list,o=>o.r,mean9).sort((a,b)=>(a.r==='H'?0:1)-(b.r==='H'?0:1));
// rosa completa dell'avversario: i 7 in campo e la panchina, ognuno con la propria energia. I cambi sono veri.
const OPP={list:[]};
function loadOpp(p,o,sub){
  p.name=o.n;p.look=makeLook(o.full||o.n,o.f);p.age=o.age;p.role=o.r;p.tl=o.tl;p.tf=o.tf;p.tv=o.tv;p.tal=Math.round((o.tl+o.tf+o.tv)/3);p.ro=o;p.trait=o.trait!==undefined?o.trait:traitFor(o.full||o.n,o.s,o.r);
  for(const k of KEYS)p.s[k]=sub?Math.min(99,o.s[k]+(G.oppPlus||0)):o.s[k];
  if(sub){p.b=Object.assign({},p.s);p.st=o.st===undefined?100:o.st;p.run=0;p.miss=0;p.hot=p.cold=false;}
}
function applyRoster(list){
  OPP.list=list;for(const o of list)o.st=100;
  bestSeven(list).forEach((o,i)=>loadOpp(T[1][i],o,false));
}
function applyTeam(power,seedStr){applyRoster(makeRoster(power,seedStr));}
// ---- rose reali (roster ufficiali 2026) ----
// piu' assist e mete = giocatore piu' forte. Tante mete e pochi assist = cutter (piu' fisico), il contrario = handler (piu' lanci),
// valori simili = giocatore bilanciato in tutto. Nomi ed eta' sono quelli veri; nessun giocatore viene inventato se il roster basta.
const REAL_MIN=14,REAL_MAX=55;
const flavorAge=(fl,rng)=>fl==='u17'?15+Math.floor(rng()*3):(fl==='u20'?17+Math.floor(rng()*3):(fl==='newgen'?17+Math.floor(rng()*5):(fl==='wise'?35+Math.floor(rng()*20):19+Math.floor(rng()*12))));
function realRoster(rows,seedStr,opt){
  if(opt.target!==undefined&&opt.off===undefined){   // forza fissata (Serie A e B): si sposta il livello di tutti finche' la media dei 7 migliori e' quella voluta
    let off=0,r=null;const o0=Object.assign({},opt,{low:false});
    for(let i=0;i<4;i++){r=realRoster(rows,seedStr,Object.assign({},o0,{off}));const d=opt.target-rosterPower(r);if(Math.abs(d)<0.4)break;off+=d;}
    return opt.low?realRoster(rows,seedStr,Object.assign({},opt,{off})):r;
  }
  const list=rows.map(r=>({sur:r.sur,nm:r.nm,a:r.a,g:r.g,age:r.age||0,f:!!r.f,gen:false}));
  const ages=list.map(o=>o.age).filter(Boolean).sort((x,y)=>x-y);
  // GIOCATORI INVENTATI: solo se il roster vero non arriva al minimo (7 per giocare, 9 per la tua squadra). Sono coerenti con i compagni:
  // l'eta' e' quella di un compagno vero (piu' o meno un anno) e il livello e' da riserva, tra il compagno piu' debole e quello a meta' classifica
  if(list.length<opt.min){
    const rng=mulberry32(hashStr(seedStr+'|gen')),pool=NAME_POOL.slice(),taken=new Set(list.map(o=>o.nm.split(' ')[0]));
    const tots=list.map(o=>o.a+o.g).sort((x,y)=>x-y),lo=tots.length?tots[0]:4,mid=tots.length?tots[tots.length>>1]:10;
    while(list.length<opt.min){
      const tot=Math.round(lo+(mid-lo)*rng()),g=clamp(Math.round(tot*(0.5+(rng()-0.5)*0.5)),0,tot),a=tot-g;
      let nm;do{nm=pool.splice(Math.floor(rng()*pool.length),1)[0];}while(taken.has(nm)&&pool.length);
      taken.add(nm);
      const base=ages.length?ages[Math.floor(rng()*ages.length)]+Math.round(rng()*2-1):flavorAge(opt.flavor,rng);
      list.push({sur:'',nm,a,g,age:clamp(base,14,65),f:false,gen:true});
    }
  }
  // in partita si legge il COGNOME (i giocatori inventati non ce l'hanno: restano col nome); se due compagni lo condividono si aggiunge l'iniziale del nome
  const first=o=>o.nm.split(' ')[0],sn=o=>o.sur||first(o),cnt={},used={};
  list.forEach(o=>{cnt[sn(o)]=(cnt[sn(o)]||0)+1;});
  return list.map((o,idx)=>{
    const full=((o.sur+' '+o.nm).trim())+(o.gen?' (g'+idx+')':'');
    const rng=mulberry32(hashStr(seedStr+'|'+full)),R=(a,b)=>a+rng()*(b-a);   // un generatore per giocatore: il suo talento non cambia se cambia il resto del roster
    const tot=o.a+o.g,d=tot?(o.a-o.g)/tot:0,lvl=44+(tot-REAL_MIN)/(REAL_MAX-REAL_MIN)*22+(opt.off||0),Rv=opt.low?lvl*0.9+5.5:lvl;
    const role=d>0.15?'H':(d<-0.15?'C':(rng()<0.5?'H':'C'));
    const age=o.age||(ages.length?ages[ages.length>>1]:flavorAge(opt.flavor,rng));   // eta' vera; se manca (un solo caso nei fogli) quella mediana della squadra
    // talento (il massimo raggiungibile): dipende dal livello, un po' dalla serie e dall'eta' vera (i giovani hanno piu' margine, dai 30 anni in su meno)
    const ageT=age>=30?-Math.min(8,(age-29)*0.6):(age<=20?3:0);
    const tg=x=>clamp(Math.round(lvl-(opt.off||0)*0.45+24+x+R(0,12)+ageT),72,99);
    const tl=tg(4*d),tf=tg(-4*d),tv=tg(0);
    const s={};
    KEYS.forEach(k=>{
      const g=(k==='lan'||k==='buc'||k==='spa')?'L':(k==='vis'?'V':'F');
      const off=g==='L'?9*d:(g==='V'?3*d:-7*d);
      s[k]=clamp(Math.round(Rv+off+R(-4,4)),28,capVal(full,k,g==='L'?tl:(g==='V'?tv:tf)));
    });
    let disp=sn(o);
    if(cnt[disp]>1){disp=sn(o)+' '+first(o)[0]+'.';if(used[disp])disp=sn(o)+' '+first(o);}
    used[disp]=1;
    return {n:disp,label:o.gen?first(o):(o.nm+' '+o.sur),full,sur:o.sur,r:role,age,tl,tf,tv,s,a:o.a,g:o.g,gen:o.gen,f:o.f,tot,trait:traitFor(full,s,role),dev:devOf(full)};
  });
}
// nome mostrato in partita = cognome. Vale anche per i salvataggi vecchi, che hanno ancora il solo nome: si ricalcola dal cognome (con l'iniziale se due compagni lo condividono)
function applySurnames(list){
  const cnt={};for(const p of list)if(p.sur)cnt[p.sur]=(cnt[p.sur]||0)+1;
  for(const p of list){
    if(!p.sur)continue;
    const lb=p.label||'',fn=(lb.endsWith(p.sur)?lb.slice(0,lb.length-p.sur.length):lb).trim().split(' ')[0]||'';
    p.name=cnt[p.sur]>1&&fn?p.sur+' '+fn[0]+'.':p.sur;
  }
}
// la tua squadra: 7 in campo scelti tra i migliori, gli altri in panchina
function setSquad(list){
  SQ.length=0;
  list.forEach((o,i)=>{const p=newPlayer(0,i,{name:o.n,label:o.label,full:o.full,gen:o.gen,f:o.f,role:o.r,tl:o.tl,tf:o.tf,tv:o.tv,age:o.age,s:Object.assign({},o.s),trait:o.trait,dev:o.dev,cond:o.cond,sk:o.sk,car:o.car,pos:o.pos});p.sur=o.sur;p.inj=o.inj|0;p.tr=!!o.tr;if(o.star){p.star=true;p.nat=o.nat;}if(o.ae)p.ae=1;p.aw=o.aw||[];p.ra=o.ra;p.ret=o.ret|0;p.retHold=o.retHold|0;p.injC=o.injC|0;p.injBig=o.injBig|0;p.idle=o.idle|0;p.mood=o.mood|0;p.prom=o.prom|0;p.rw=o.rw|0;if(o.spec&&SPECS[o.spec])p.spec=o.spec;if(o.goal)p.goal=o.goal;p.sad=o.sad|0;p.ext=o.ex|0;SQ.push(p);});
  applySurnames(SQ);
  setLineup(pickSeven(SQ,p=>p.role,mean9).map(p=>p.id));
}
const rosterPower=list=>{const b=bestSeven(list);return b.reduce((a,o)=>a+mean9(o),0)/b.length;};
// un anno in piu': fino a 25 anni le statistiche crescono un po', da 26 a 29 restano uguali, da 30 in su calano (i lanci no). Mai oltre il talento
function agePlayer(o,R){
  const a=o.age;
  for(const k of KEYS){
    const lan=(k==='lan'||k==='buc'||k==='spa'),cap=capVal(o.full||o.name||o.n,k,lan?o.tl:(k==='vis'?o.tv:o.tf));
    let d=0;
    // la crescita vera ora arriva da partite e allenamenti (XP): con l'eta' resta solo una piccola maturazione dei giovani e il declino fisico dei veterani.
    // Eccezioni credibili: chi ha il tratto Ironman o cresce in fretta declina la meta' delle volte; oltre i 36 calano un poco anche tecnica e visione
    const slow=(o.trait==='iron'||(o.dev||1)>=1.25)&&R()<0.5;
    if(a<20)d=Math.floor(R()*2);
    else if(a<23)d=R()<0.35?1:0;
    else if(a>=30&&!lan&&k!=='vis'&&k!=='pre')d=slow?0:-(1+Math.floor(R()*2));   // le mani (Presa) non calano con l'eta'
    else if(a>=36&&R()<0.3)d=-1;
    o.s[k]=clamp(o.s[k]+d,25,cap);
  }
  o.age++;
}
// inizio carriera: la tua rosa parte con statistiche tutte basse (il talento resta quello fissato)
function lowStats(p,i){
  KEYS.forEach(k=>{p.s[k]=Math.min(Math.round(37+statOrig(ROSTERS[0].list[i],k)*0.2),capOf(p,k));});
  p.tr=false;p.age=ROSTERS[0].list[i][14]||22;
}
function startLow(){SQ.forEach((p,i)=>lowStats(p,i));}
// formazione: 7 giocatori in campo (prima gli handler), gli altri in panchina
function setLineup(ids){
  const L=ids.map(id=>SQ[id]).sort((a,b)=>(a.role==='H'?0:1)-(b.role==='H'?0:1)||a.id-b.id);
  T[0]=L;L.forEach((p,i)=>{p.t=0;p.i=i;p.slot=i;});
}
const lineupIds=()=>T[0].map(p=>p.id);
// infortuni: a fine meta, chi e' in campo ed e' stanco (energia sotto 50) rischia; stop di 1-3 partite
const INJ_K=0.045;
function checkInjuries(){
  const out=[];
  for(const p of T[0]){
    const cd=p.cond===undefined?100:p.cond;   // rischio: energia finita in partita (di piu' se la condizione e' bassa) e, a parte, la fatica accumulata: sotto 40 di condizione c'e' sempre un po' di rischio; la fisioterapia riduce tutto
    const f=(clamp((50-p.st)/50,0,1)*(1+clamp((60-cd)/60,0,1))+0.25*clamp((40-cd)/40,0,1))*(G.injK===undefined?1:G.injK);
    if(f>0&&Math.random()<INJ_K*f){   // di solito 1-3 partite; ogni tanto un infortunio serio (5-8 partite), piu' probabile dopo i 32 anni
      p.inj=Math.random()<0.1+(p.age>=32?0.07:0)?5+Math.floor(Math.random()*4):1+Math.floor(Math.random()*3);p.injNew=true;out.push(p);}
  }
  G.injured=out;return out;
}
// prima della partita gli infortunati in formazione vengono sostituiti dai migliori disponibili
function fixLineup(){
  const ids=lineupIds().slice(),healthy=SQ.filter(p=>!p.inj);
  ids.forEach((id,i)=>{
    if(!SQ[id].inj)return;
    const used=new Set(ids),role=SQ[id].role;
    const cand=healthy.filter(q=>!used.has(q.id)).sort((a,b)=>((b.role===role)-(a.role===role))||(b.st-a.st)||(b.tal-a.tal))[0];
    if(cand)ids[i]=cand.id;
  });
  setLineup(ids);
}
// forma del giorno: a ogni partita ogni statistica devia da -3 a +3; con talento alto la devianza e' piu' spesso positiva, con talento basso negativa
function formDev(t){const b=clamp((t-85)/14,-1,1);return clamp(Math.round(rnd(-3,3)+b*1.5),-3,3);}
function applyForm(){
  for(const p of SQ.concat(T[1])){
    p.b=Object.assign({},p.s);
    // affiatamento e morale (solo carriera, G.formB da -1,5 a +1,5) spostano di poco la forma del giorno della tua squadra
    const fb=p.t===0?(G.formB||0):0;
    for(const k of KEYS)p.s[k]=clamp(p.b[k]+formDev(talOf(p,k))+(fb?Math.trunc(fb)+(Math.random()<Math.abs(fb%1)?Math.sign(fb):0):0),1,Math.max(p.b[k],Math.min(99,capOf(p,k))));
  }
}
function restoreForm(){for(const p of SQ.concat(T[1]))if(p.b){p.s=p.b;p.b=null;}}
function newGame(){G.injured=[];for(const p of SQ.concat(T[1])){p.st=p.t===0&&p.cond!==undefined?Math.round(62+0.38*p.cond):100;   // chi arriva stanco dalla settimana parte con meno energia
  p.spr=false;p.run=0;p.miss=0;p.hot=false;p.cold=false;p.m=newCounters();}G.score=[0,0];G.pointNo=1;G.nextRec=1;G.startRec=1;G.halfDone=false;G.dir=[1,-1];G.seen={att:{},def:{}};G.obs={u:0,d:0,n:0};G.resetH=null;G.duo={};G.forfeit=false;setWind(0,0);resetStats();}


/* ---- obiettivo stagionale e reputazione ---- */
function setObjective(){
  const names=SV.mem[SV.sr],ord=names.slice().sort((a,b)=>teamPow(b)-teamPow(a)),exp=ord.indexOf(SV.team)+1,n=names.length;
  let tgt,txt;
  if(exp<=3){tgt=3;txt=SV.sr==='A'?'Podio: finisci tra le prime 3':'Zona promozione: finisci tra le prime 3';}
  else if(exp<=n/2){tgt=Math.ceil(n/2);txt='Parte alta della classifica: finisci tra le prime '+tgt;}
  else{tgt=n-PROMO;txt=SV.sr==='C'?'Stagione dignitosa: non finire tra le ultime 2':'Salvezza: non finire tra le ultime 2';}
  SV.obj={tgt,txt,exp,reward:Math.round((36+(n-tgt)*4)*SR_K[SV.sr])};
}
/* ---- statistiche personali, premi, record, Hall of Fame ---- */
const carOf=p=>p.car||(p.car={mp:0,g:0,a:0,b:0,ss:{mp:0,g:0,a:0,b:0},yrs:0});
function addStats(p,g,a,b){const c=carOf(p);c.mp++;c.g+=g;c.a+=a;c.b+=b;c.ss.mp++;c.ss.g+=g;c.ss.a+=a;c.ss.b+=b;}
const seasonScore=c=>c?c.ss.g*2+c.ss.a*2+c.ss.b*3:0;
function recordMatchStats(){   // dopo una partita giocata: mete, assist e difese vere
  for(const p of SQ){if(p.m.pts>0){addStats(p,p.m.g|0,p.m.a|0,p.m.dif|0);p.lm={g:p.m.g|0,a:p.m.a|0,b:p.m.dif|0};}else p.lm=null;}   // lm: l'ultima partita, per la scheda
}
const BLK_MATCH=5;
function simMatchStats(goals){   // dopo una partita simulata: mete e assist distribuiti tra chi sarebbe sceso in campo, secondo ruolo e qualita'
  const line=matchLine('lineO').concat(matchLine('lineD')).map(id=>SQ[id]),set=[...new Set(line)];if(!set.length)return;
  const g={},a={},wp=(arr,w)=>{let t=0;const ws=arr.map(x=>{const v=Math.max(0.1,w(x));t+=v;return v;});let r=Math.random()*t;for(let i=0;i<arr.length;i++){r-=ws[i];if(r<=0)return arr[i];}return arr[0];};
  for(let i=0;i<goals;i++){const sc=wp(set,p=>(p.role==='H'?0.5:1.5)*(rate(p.s,'C')-30)),as=wp(set.filter(p=>p!==sc),p=>(p.role==='H'?1.6:0.6)*(rate(p.s,'H')-30));g[sc.full]=(g[sc.full]||0)+1;a[as.full]=(a[as.full]||0)+1;}
  const b={};for(let i=0;i<Math.round(BLK_MATCH*carLen()/MATCH_TARGET);i++){const d=wp(set,p=>rate(p.s,'D')-35);b[d.full]=(b[d.full]||0)+1;}   // difese: in media quante in una partita giocata
  for(const p of SQ)p.lm=null;
  for(const p of set){addStats(p,g[p.full]|0,a[p.full]|0,b[p.full]|0);p.lm={g:g[p.full]|0,a:a[p.full]|0,b:b[p.full]|0};}
}
/* ---- PREMI DI FINE STAGIONE (del tuo campionato) ----
   Le statistiche dei tuoi giocatori sono quelle vere (partite giocate e simulate); quelle delle altre squadre vengono ricostruite dai risultati:
   ogni meta segnata in classifica ha un marcatore e un assistman, scelti secondo ruolo e qualita' tra i giocatori che scendono in campo. */
function seriesStats(sr){
  if(lsLive()&&sr===SV.sr)return lsAll(sr);   // numeri veri, accumulati partita per partita (17-statistiche-campionato.js)
  const out=[];
  for(const n of SV.mem[sr]){
    const t=SV.tab[n]||{pf:0,w:0,l:0},mp=t.w+t.l;
    if(n===SV.team){for(const p of SQ){const c=p.car;if(c&&c.ss.mp>0)out.push({name:p.label||p.name,team:n,age:p.age,pos:posOf(p),g:c.ss.g,a:c.ss.a,b:c.ss.b,mine:true,full:p.full});}continue;}
    const ro=(SV.rost[n]||[]).slice().sort((x,y)=>ovrX(y)-ovrX(x)).slice(0,11);if(!ro.length)continue;
    const R=mulberry32(hashStr(SV.seed+'|st|'+SV.season+'|'+n)),st=ro.map(()=>({g:0,a:0,b:0}));
    const pick=(w,skip)=>{let tot=0;const ws=ro.map((o,i)=>{const v=i===skip?0:Math.max(0.1,w(o))*(i<7?1:0.45);tot+=v;return v;});let r=R()*tot;for(let i=0;i<ro.length;i++){r-=ws[i];if(r<=0)return i;}return 0;};
    for(let i=0;i<t.pf;i++){const sc=pick(o=>(o.r==='H'?0.5:1.5)*(rate(o.s,'C')-30),-1);st[sc].g++;st[pick(o=>(o.r==='H'?1.6:0.6)*(rate(o.s,'H')-30),sc)].a++;}
    for(let i=0;i<Math.round(mp*BLK_MATCH*carLen()/MATCH_TARGET);i++)st[pick(o=>rate(o.s,'D')-35,-1)].b++;
    ro.forEach((o,i)=>out.push({name:o.label||o.n,team:n,age:o.age,pos:posOf(o),g:st[i].g,a:st[i].a,b:st[i].b,mine:false}));
  }
  return out;
}
const AW_LIST=['MVP del campionato','Attaccante dell’anno','Difensore dell’anno','Capocannoniere','Re degli assist','Rivelazione dell’anno','Allenatore dell’anno'];
function seasonAwards(rank,order){   // a fine stagione: premi del campionato, squadra ideale, campioni delle tre serie, MVP della tua squadra, record, bacheca
  let mvp=null,bs=0;for(const p of SQ){const v=seasonScore(p.car);if(v>bs){bs=v;mvp=p;}}
  for(const [k,lab] of [['g','mete'],['a','assist'],['b','difese']])for(const p of SQ){const v=p.car?p.car.ss[k]:0;if(v>((SV.rec[k]&&SV.rec[k].v)||0))SV.rec[k]={v,name:p.label||p.name,season:SV.season,lab};}
  const t=SV.tab[SV.team]||{w:0,l:0},names=SV.mem[SV.sr],ord=ranking(SV.tab,names),n=names.length,rk=x=>ord.indexOf(x)+1;
  const all=seriesStats(SV.sr),aw=[];
  const val=x=>(x.g*2+x.a*2+x.b*3)*(1+0.3*(n-rk(x.team))/Math.max(1,n-1));   // il valore conta di piu' se la squadra e' andata bene
  const top=(f,flt)=>all.filter(x=>(!flt||flt(x))&&f(x)>0).sort((a,b)=>f(b)-f(a)||a.name.localeCompare(b.name))[0];
  const add=(k,x,txt)=>{if(x)aw.push({k,name:x.name,team:x.team,txt,mine:!!x.mine,full:x.full});};
  let x=top(val);add(AW_LIST[0],x,x?`${x.g} mete, ${x.a} assist, ${x.b} difese`:'');
  const mv=x;x=top(q=>q.g+q.a,q=>q!==mv);add(AW_LIST[1],x,x?`${x.g+x.a} tra mete e assist`:'');   // i due premi maggiori vanno a giocatori diversi
  x=top(q=>q.b*3+(q.pos==='D'?4:0),q=>q!==mv);add(AW_LIST[2],x,x?`${x.b} difese`:'');
  x=top(q=>q.g);add(AW_LIST[3],x,x?`${x.g} mete`:'');
  x=top(q=>q.a);add(AW_LIST[4],x,x?`${x.a} assist`:'');
  x=top(val,q=>q.age<=21);add(AW_LIST[5],x,x?`${x.age} anni: ${x.g} mete, ${x.a} assist, ${x.b} difese`:'');
  // allenatore dell'anno: la squadra che ha superato di piu' le attese di inizio stagione
  const eo=SV.expOrd&&SV.expOrd.length===n?SV.expOrd:names.slice().sort((a,b)=>teamPow(b)-teamPow(a));
  const co=names.slice().sort((a,b)=>((eo.indexOf(b)+1-rk(b))-(eo.indexOf(a)+1-rk(a)))||rk(a)-rk(b))[0];
  if(co&&eo.indexOf(co)+1-rk(co)>0)aw.push({k:AW_LIST[6],name:co===SV.team?'Il tuo staff':'Staff tecnico',team:co,txt:`dal ${eo.indexOf(co)+1}° posto previsto al ${rk(co)}°`,mine:co===SV.team});
  // squadra ideale: tre handler e quattro tra cutter e defender
  const by=all.slice().sort((a,b)=>val(b)-val(a)),best7=by.filter(q=>q.pos==='H').slice(0,3).concat(by.filter(q=>q.pos!=='H').slice(0,4)).map(q=>({name:q.name,team:q.team,pos:q.pos,mine:!!q.mine,full:q.full}));
  // premi ai tuoi: restano nella scheda del giocatore, portano reputazione e un piccolo premio in crediti
  let mine=0;
  for(const a of aw)if(a.mine){mine++;SV.rep=clamp(SV.rep+2,0,100);SV.cash+=10;const p=a.full?byFull(a.full):null;if(p){p.aw=p.aw||[];p.aw.push({s:SV.season,k:a.k});}}
  for(const q of best7)if(q.mine){const p=byFull(q.full);if(p){p.aw=p.aw||[];p.aw.push({s:SV.season,k:'Squadra ideale'});}}
  if(rank===1)for(const p of SQ)if(p.car&&p.car.ss.mp>=3)p.ti=(p.ti|0)+1;   // chi ha contribuito al titolo lo porta nella scheda
  const tr=SV.troph;if(rank===1)tr[SV.sr]=(tr[SV.sr]|0)+1;if(SV.next&&SV.next.sr<SV.sr)tr.promo=(tr.promo|0)+1;tr.aw=(tr.aw|0)+mine;tr.b7=(tr.b7|0)+best7.filter(q=>q.mine).length;
  const champs={};if(order)for(const sr of ['A','B','C'])champs[sr]=order[sr][0];
  SV.hist.unshift({season:SV.season,sr:SV.sr,rank,n,w:t.w,l:t.l,mvp:mvp?(mvp.label||mvp.name):'',mvpS:mvp&&mvp.car?`${mvp.car.ss.g} mete, ${mvp.car.ss.a} assist, ${mvp.car.ss.b} difese`:'',obj:SV.obj?rank<=SV.obj.tgt:false,short:SV.next?SV.next.short:'',aw,best7,champs});
  if(SV.hist.length>40)SV.hist.length=40;
  const w0=aw[0];if(w0)news(`MVP del campionato: ${w0.name} (${w0.team}).`+(mine?` Premi vinti dai tuoi: ${mine}.`:''));
  if(mvp)news('MVP della tua squadra: '+(mvp.label||mvp.name)+'.');
}

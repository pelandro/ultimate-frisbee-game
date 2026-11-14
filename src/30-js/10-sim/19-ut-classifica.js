/* ===================== ULTIMATE TEAM · REAL PLAYER: logica pura =====================
   Punti Elo, scelta dell'avversario e (de)compressione delle squadre caricate online. Niente rete e niente pagina: si prova nei test.
   La rete e le schermate stanno in 40-modalita/04-ut-online.js. I dati che arrivano da internet non si fidano mai: ogni numero rientra nei limiti
   delle carte vere e ogni nome viene ripulito. */
const UTO_START=1000,UTO_K=32,UTO_MAXP=5000,UTO_WIN=[150,500,2000];   // punti iniziali, peso di una partita, tetto, finestre di ricerca dell'avversario
const utoExp=(a,b)=>1/(1+Math.pow(10,(b-a)/400));
// punti guadagnati o persi (Elo): contro un avversario piu' forte si vince di piu' e si perde di meno. Cambiano solo i punti di chi gioca:
// l'avversario e' una squadra guidata dall'IA, il suo proprietario non sta giocando. Mai zero: ogni partita sposta almeno 1 punto
function utoDelta(mine,opp,win){
  const d=Math.round(UTO_K*((win?1:0)-utoExp(mine,opp)));
  return win?Math.max(1,d):Math.min(-1,d);
}
const utoName=(s,max)=>String(s==null?'':s).replace(/[\u0000-\u001f<>&"'`\\]/g,'').replace(/\s+/g,' ').trim().slice(0,max||16);
// scelta dell'avversario tra i candidati {id,p,pw,...}: prima chi ha punti vicini ai tuoi, poi la finestra si allarga. Mai te stesso;
// l'ultimo avversario si evita se c'e' un'alternativa
function utoPickOpp(list,me,pts,last,rng){
  const c=list.filter(o=>o&&o.id!==me&&typeof o.p==='number'&&o.pw>0);
  if(!c.length)return null;
  const pick=r=>{const alt=r.filter(o=>o.id!==last);if(alt.length)r=alt;return r[Math.min(r.length-1,Math.floor(rng()*r.length))];};
  for(const w of UTO_WIN){const r=c.filter(o=>Math.abs(o.p-pts)<=w);if(r.length)return pick(r);}
  const near=c.slice().sort((a,b)=>Math.abs(a.p-pts)-Math.abs(b.p-pts));
  return pick(near.slice(0,Math.min(5,near.length)));
}
// la tua squadra come si carica online: 7 titolari e fino a 7 riserve (le migliori), statistiche per nome
function utoPack(col,sel){
  const st=sel.map(i=>col[i]).filter(Boolean);
  const bench=col.map((p,i)=>i).filter(i=>!sel.includes(i)).sort((a,b)=>ovrX(col[b])-ovrX(col[a])).slice(0,7).map(i=>col[i]);
  const m=st.concat(bench).map(p=>{const s={};for(const k of KEYS)s[k]=clamp(Math.round(p.s[k]),25,99);const o={n:utoName(p.n,20)||'Giocatore',r:p.r==='H'?'H':'C',a:clamp(p.age|0,16,60),s};if(p.trait&&TRAITS[p.trait])o.x=p.trait;return o;});
  return {m,pw:st.length?Math.round(st.reduce((a,p)=>a+ovrX(p),0)/st.length):0};
}
// squadra scaricata -> rosa per applyRoster (14 giocatori: i 7 titolari dichiarati e la panchina). null se non e' una squadra valida
function utoUnpack(m,seed){
  const arr=Array.isArray(m)?m:(m&&typeof m==='object'?Object.values(m):[]),out=[];
  for(const e of arr.slice(0,14)){
    if(!e||typeof e!=='object'||!e.s||typeof e.s!=='object')continue;
    const s={};let ok=true;for(const k of KEYS){const v=Number(e.s[k]);if(!isFinite(v)){ok=false;break;}s[k]=clamp(Math.round(v),25,99);}
    if(!ok)continue;
    const r=e.r==='H'?'H':'C',n=utoName(e.n,20)||'Giocatore';
    out.push({n,full:n,label:n,gen:true,r,age:clamp(e.a|0,16,60),tl:99,tf:99,tv:99,s,ovr:Math.round(ovrX({s,r})),trait:TRAITS[e.x]?e.x:null,up:0});
  }
  if(out.length<7)return null;
  if(out.length<14){   // panchina incompleta: riserve piu' deboli di circa 12 punti, sempre le stesse per quel seme
    const pw=out.slice(0,7).reduce((a,p)=>a+p.ovr,0)/7,fill=makeRoster(Math.max(30,Math.round(pw)-12),'uto|'+seed);
    for(const o of fill){if(out.length>=14)break;out.push(o);}
  }
  return out;
}

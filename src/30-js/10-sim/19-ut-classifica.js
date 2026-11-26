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
// scelta dell'avversario tra i candidati {id,p,pw,...}: prima chi ha punti vicini ai tuoi, poi la finestra si allarga. Mai te stesso:
// ne' il tuo profilo (id) ne' una squadra con il tuo nome (my), che e' un tuo profilo vecchio rimasto in classifica (altro dispositivo, dati cancellati);
// l'ultimo avversario si evita se c'e' un'alternativa
const utoSame=(a,b)=>!!a&&!!b&&utoName(a).toLowerCase()===utoName(b).toLowerCase();
function utoPickOpp(list,me,pts,last,rng,my){
  const c=list.filter(o=>o&&o.id!==me&&!utoSame(o.n,my)&&typeof o.p==='number'&&o.pw>0);
  if(!c.length)return null;
  const pick=r=>{const alt=r.filter(o=>o.id!==last);if(alt.length)r=alt;return r[Math.min(r.length-1,Math.floor(rng()*r.length))];};
  for(const w of UTO_WIN){const r=c.filter(o=>Math.abs(o.p-pts)<=w);if(r.length)return pick(r);}
  const near=c.slice().sort((a,b)=>Math.abs(a.p-pts)-Math.abs(b.p-pts));
  return pick(near.slice(0,Math.min(5,near.length)));
}
// PREMI DI REAL PLAYER. Gettoni a ogni partita; chi batte un avversario con piu' punti ne riceve di piu' (le fasce stanno dentro la finestra di
// ricerca dell'avversario, 150 punti: oltre capita solo con pochi iscritti). Il pacchetto costa piu' che contro il computer: misurato con i pacchetti
// veri, vincendo sempre si arriva a una media di 70 in circa 12 partite (con 90 gettoni erano 8)
const UTO_DIFF=2;   // difficolta' fissa di Real player: Difficile (indice di DIFF_AI e DIFF_PLUS), uguale per tutti
const UTO_PACK=130,UTO_COIN_W=40,UTO_COIN_L=15,UTO_UPSET=[[150,60],[100,40],[50,20],[25,10]];
function utoCoins(mine,opp,win){
  if(!win)return {base:UTO_COIN_L,bonus:0};
  const d=opp-mine,f=UTO_UPSET.find(x=>d>=x[0]);
  return {base:UTO_COIN_W,bonus:f?f[1]:0};
}
// traguardi di punti: uno ogni UTO_MILE punti sopra quelli iniziali. Ognuno regala un pacchetto, sempre migliore e con piu' carte; dal quinto
// (1500 punti) e' la «super pacchetto» dei campioni. Il valore e' nel formato dei pacchetti in attesa: qualita' + 10 x numero di carte
const UTO_MILE=100,UTO_MILE_PK=[[2,5],[3,6],[4,7],[5,8],[6,9]];
const utoMiles=p=>Math.max(0,Math.floor((p-UTO_START)/UTO_MILE));
const utoMilePts=i=>UTO_START+i*UTO_MILE;                                  // punti del traguardo numero i (1 = il primo)
const utoMilePack=i=>{const m=UTO_MILE_PK[clamp(i,1,UTO_MILE_PK.length)-1];return m[0]+m[1]*10;};
// e un pacchetto equipaggiamento, anche lui sempre migliore (qualita', accessori): dal quinto traguardo il super, con un Epico garantito
const UTO_MILE_EQ=[[2,2],[3,2],[4,2],[5,3],[6,3]];
const utoMileEq=i=>{const m=UTO_MILE_EQ[clamp(i,1,UTO_MILE_EQ.length)-1];return m[0]+m[1]*10+300;};
// la tua squadra come si carica online: 7 titolari e fino a 7 riserve (le migliori), statistiche per nome.
// hl (solo Superpoteri): livelli delle tue carte eroe {chiave: livello}; i titolari con un eroe (p.hk) lo portano in h = chiave + livello, al massimo HERO_N
function utoPack(col,sel,hl){
  const st=sel.map(i=>col[i]).filter(Boolean);let nh=0;
  const bench=col.map((p,i)=>i).filter(i=>!sel.includes(i)).sort((a,b)=>ovrX(col[b])-ovrX(col[a])).slice(0,7).map(i=>col[i]);
  const m=st.concat(bench).map(p=>{const s={};for(const k of KEYS)s[k]=clamp(Math.round(p.s[k]),25,99);const o={n:utoName(p.n,20)||'Giocatore',r:p.r==='H'?'H':'C',a:clamp(p.age|0,16,60),s};if(p.trait&&TRAITS[p.trait])o.x=p.trait;
    if(hl&&p.hk&&HERO[p.hk]&&hl[p.hk]&&st.includes(p)&&nh<HERO_N){o.h=p.hk+clamp(hl[p.hk]|0,1,HERO_LV_MAX);nh++;}
    return o;});
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
    const o={n,full:n,label:n,gen:true,r,age:clamp(e.a|0,16,60),tl:99,tf:99,tv:99,s,ovr:Math.round(ovrX({s,r})),trait:TRAITS[e.x]?e.x:null,up:0};
    const hm=typeof e.h==='string'&&/^([a-z]+)([1-9])$/.exec(e.h);   // eroe dei Superpoteri: uno per chiave, al massimo HERO_N
    if(hm&&HERO[hm[1]]&&out.filter(x=>x.hero).length<HERO_N&&!out.some(x=>x.hero===hm[1])){o.hero=hm[1];o.hlv=clamp(+hm[2],1,HERO_LV_MAX);}
    out.push(o);
  }
  if(out.length<7)return null;
  if(out.length<14){   // panchina incompleta: riserve piu' deboli di circa 12 punti, sempre le stesse per quel seme
    const pw=out.slice(0,7).reduce((a,p)=>a+p.ovr,0)/7,fill=makeRoster(Math.max(30,Math.round(pw)-12),'uto|'+seed);
    for(const o of fill){if(out.length>=14)break;out.push(o);}
  }
  return out;
}
// STAGIONI MENSILI di Sfide online (non dei Superpoteri): ogni mese ha la sua classifica (ut/seasons/<stagione> nel database). La stagione cambia a
// mezzanotte del primo del mese, ora italiana; si riparte con 200 punti in meno (non sotto i 1000; chi era sotto i 1000 riparte da 1000). Nella
// classifica del mese entra chi ha giocato almeno UTO_SEASON_G partite; i primi 10 a fine mese ricevono un badge (1°, 2°, 3°, dal 4° al 10°).
// Nessun premio in gettoni o pacchetti: renderebbe piu' forti i piu' forti
const UTO_SEASON_DROP=200,UTO_SEASON_G=10,UTO_SEASON_TOP=10;
const UTO_MONTHS=['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];
// la stagione di un istante (millisecondi): 'AAAA-MM' secondo il calendario italiano
function utoSeason(t){
  const d=new Date(t);
  try{const s=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit'}).format(d);if(/^\d{4}-\d{2}$/.test(s))return s;}catch(e){}
  const r=new Date(d.getTime()+3600000);return r.getUTCFullYear()+'-'+String(r.getUTCMonth()+1).padStart(2,'0');   // senza Intl: ora solare italiana
}
const utoSeasonOk=s=>typeof s==='string'&&/^20\d{2}-(0[1-9]|1[0-2])$/.test(s);
const utoSeasonName=s=>utoSeasonOk(s)?UTO_MONTHS[+s.slice(5)-1]+' '+s.slice(0,4):'';
function utoSeasonPrev(s){const y=+s.slice(0,4),m=+s.slice(5);return m>1?y+'-'+String(m-1).padStart(2,'0'):(y-1)+'-12';}
const utoSeasonStart=p=>Math.max(UTO_START,p-UTO_SEASON_DROP);   // punti con cui si riparte (le regole del database fanno lo stesso conto)
// classifica di una stagione: chi ha giocato almeno UTO_SEASON_G partite, per punti, poi vittorie; le altre righe dopo, senza posizione
function utoSeasonRank(rows){
  const by=(a,b)=>b.p-a.p||b.w-a.w||a.g-b.g||(a.id<b.id?-1:1);
  const ok=rows.filter(r=>r.g>=UTO_SEASON_G).sort(by),wait=rows.filter(r=>r.g<UTO_SEASON_G).sort(by);
  return {ok,wait};
}
// badge di fine stagione per una posizione: 1, 2, 3, oppure 10 (dal 4° al 10°); 0 = nessuno
const utoSeasonBadge=pos=>pos>=1&&pos<=3?pos:(pos>=4&&pos<=UTO_SEASON_TOP?10:0);
// prove delle stagioni (14-test.js, «Real player di Ultimate Team»)
function utoSeasonRows(row){
  const st=[900,1000,1150,1199,1200,1300,2050].map(utoSeasonStart),stOk=st.join()==='1000,1000,1000,1000,1000,1100,1850';
  // mezzanotte del primo dicembre in Italia: alle 23:30 (UTC) del 30 novembre e' gia' dicembre; d'estate l'ora legale
  const t=[Date.UTC(2026,10,30,22,59),Date.UTC(2026,10,30,23,0),Date.UTC(2027,6,31,21,59),Date.UTC(2027,6,31,22,0)].map(utoSeason),tOk=t.join()==='2026-11,2026-12,2027-07,2027-08';
  const nm=utoSeasonName('2026-11'),prOk=utoSeasonPrev('2027-01')==='2026-12'&&utoSeasonPrev('2026-11')==='2026-10'&&nm==='novembre 2026'&&!utoSeasonOk('2026-13')&&!utoSeasonOk(null);
  const rows=[{id:'a',p:1300,w:9,g:12},{id:'b',p:1500,w:3,g:4},{id:'c',p:1300,w:10,g:14},{id:'d',p:1100,w:6,g:10}],rk=utoSeasonRank(rows);
  const rkOk=rk.ok.map(r=>r.id).join()==='c,a,d'&&rk.wait.map(r=>r.id).join()==='b';
  const bd=[1,2,3,4,10,11,0].map(utoSeasonBadge),bdOk=bd.join()==='1,2,3,10,10,0,0';
  return [row('Stagioni: punti con cui si riparte (900, 1000, 1150, 1199, 1200, 1300, 2050)',st.join(', '),stOk,'200 in meno, mai sotto 1000'),
    row('Stagioni: il mese cambia a mezzanotte, ora italiana (anche con l’ora legale)',t.join(', '),tOk&&prOk),
    row('Stagioni: classifica del mese solo con almeno '+UTO_SEASON_G+' partite; a parità di punti più vittorie',rk.ok.map(r=>r.id).join(' ')+' | fuori: '+rk.wait.map(r=>r.id).join(' '),rkOk),
    row('Stagioni: badge di fine mese per il 1°, 2°, 3° e dal 4° al 10°',bd.join(', '),bdOk)];
}

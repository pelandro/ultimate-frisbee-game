/* ---- ULTIMATE TEAM · EQUIPAGGIAMENTO: modello (puro calcolo, lo usano l'interfaccia e i test) ----
   Sei accessori, ognuno alza una statistica di TUTTA la squadra (titolari e riserve) finche' e' equipaggiato; ognuno esiste in tre rarita'
   (Comune, Raro, Epico) con bonus EQ_PLUS. Lo stato sta in UT.eq (una copia per squadra: torneo contro il computer e Real player sono separati):
     own: {chiave: maschera di bit delle rarita' possedute (bit 0 Comune, 1 Raro, 2 Epico)}
     on:  {chiave: rarita' equipaggiata} (assente = slot vuoto)
     kit: {s,p,c,b,m} colori di maglia, pantaloncini, calzettoni e secondo colore della maglia (tavolozza EQ_KIT_COL) e motivo della maglia (EQ_KIT_PAT).
          Con la maglia rossa o arancione (EQ_KIT_HOT) l'avversaria, che di solito e' in rosso, si cambia (matchLook in 20-ui/02-pixel-art.js)
   I pacchetti equipaggiamento stanno in UT.packs come gli altri, con il ruolo 3: qualita' + 10 x accessori + 300. */
const EQ_ITEMS=[
  {k:'boot',n:'Scarpini',st:'sca'},
  {k:'drink',n:'Energy drink',st:'res'},
  {k:'coach',n:'Coach',st:'vis'},
  {k:'glove',n:'Guantini',st:'lan'},
  {k:'band',n:'Fascia da braccio',st:'spa'},
  {k:'prep',n:'Preparatore atletico',st:'sal'}
];
const EQ_RAR=[['Comune','com'],['Raro','rar'],['Epico','epi']];
const EQ_PLUS=[3,6,9];        // bonus alla statistica per rarita': un set completo di Epici vale circa +5 di Overall
const EQ_DUP=[15,40,100];     // gettoni per un doppione (un accessorio con la stessa rarita' che hai gia')
// probabilita' (%) di Comune, Raro, Epico per qualita' del pacchetto (1 = Negozio, 2-6 = premi sempre migliori); dalla 3 almeno un Raro, dalla 6 almeno un Epico
const EQ_PQ=[[85,14,1],[75,22,3],[62,31,7],[50,39,11],[38,46,16],[25,52,23],[0,60,40]];
const EQ_PK=3;                // ruolo dei pacchetti equipaggiamento nel numero del pacchetto
const eqCode=(q,n)=>clamp(q|0,0,6)+10*clamp(n|0,1,9)+100*EQ_PK;
const EQ_KIT_COL=['#2f7bff','#e8383d','#ff8a1f','#2fbf5a','#9be22d','#ffd23f','#8a4dff','#f2f5fa','#8d97ab','#101827'];
const EQ_KIT_HOT=['#e8383d','#ff8a1f'];
const EQ_KIT_PAT=[['uni','Tinta unita'],['str','Strisce'],['rig','Righe'],['fas','Fascia'],['dia','Diagonale'],['met','Metà']];
const EQ_KIT0={s:'#2f7bff',p:'#f2f5fa',c:'#2f7bff',b:'#f2f5fa',m:'uni'};
function eqInit(o){   // stato valido anche da un salvataggio vecchio o rovinato
  const e={own:{},on:{},kit:Object.assign({},EQ_KIT0)};
  if(o&&typeof o==='object'){
    for(const it of EQ_ITEMS){
      const m=o.own&&o.own[it.k]|0;if(m&7)e.own[it.k]=m&7;
      const r=o.on&&o.on[it.k];if(r>=0&&r<3&&(e.own[it.k]>>r)&1)e.on[it.k]=r|0;
    }
    if(o.kit){for(const z of ['s','p','c','b'])if(EQ_KIT_COL.includes(o.kit[z]))e.kit[z]=o.kit[z];if(EQ_KIT_PAT.some(x=>x[0]===o.kit.m))e.kit.m=o.kit.m;}
  }
  return e;
}
const eqHas=(e,k,r)=>!!(e&&e.own&&((e.own[k]|0)>>r)&1);
// bonus alle statistiche degli accessori equipaggiati: {sca:9, vis:3, ...}
function eqBonus(e){
  const b={};if(!e||!e.on)return b;
  for(const it of EQ_ITEMS){const r=e.on[it.k];if(r>=0&&r<3&&eqHas(e,it.k,r))b[it.st]=(b[it.st]||0)+EQ_PLUS[r];}
  return b;
}
// copia del giocatore con il bonus (la carta resta com'e': il bonus vale solo finche' l'accessorio e' equipaggiato)
function eqApply(p,e){
  const b=eqBonus(e),ks=Object.keys(b);if(!ks.length)return p;
  const s=Object.assign({},p.s);for(const k of ks)s[k]=Math.min(99,s[k]+b[k]);
  return Object.assign({},p,{s});
}
// pesca gli accessori di un pacchetto: n diversi tra loro, con le rarita' della qualita' q
function eqDraw(q,n,rng){
  const t=EQ_PQ[clamp(q|0,0,6)],keys=EQ_ITEMS.map(it=>it.k),out=[];
  n=clamp(n|0,1,EQ_ITEMS.length);
  for(let i=0;i<n;i++){
    const k=keys.splice(Math.floor(rng()*keys.length),1)[0];
    let x=rng()*100,r=0;while(r<2&&x>=t[r]){x-=t[r];r++;}
    out.push({eq:true,k,r});
  }
  const raise=min=>{if(Math.max(...out.map(o=>o.r))<min){let j=0;for(let i=1;i<n;i++)if(out[i].r<out[j].r)j=i;out[j].r=min;}};
  if(q>=3)raise(1);
  if(q>=6)raise(2);
  return out;
}
// mette gli accessori nella collezione: un doppione diventa gettoni; un accessorio nuovo si equipaggia da solo se e' meglio di quello che indossi.
// Ritorna i gettoni dei doppioni; su ogni accessorio scrive dup (era un doppione) e wear (e' stato equipaggiato)
function eqGain(e,items){
  let coins=0;
  for(const o of items){
    if(eqHas(e,o.k,o.r)){o.dup=true;coins+=EQ_DUP[o.r];continue;}
    e.own[o.k]=(e.own[o.k]|0)|(1<<o.r);
    const cur=e.on[o.k];if(cur===undefined||cur<o.r){e.on[o.k]=o.r;o.wear=true;}
  }
  return coins;
}
// motivo della maglia: il punto (u da sinistra a destra, v dalle spalle in giu', entrambi 0-1) e' del secondo colore? Lo usano il manichino,
// gli omini in campo e quelli delle scene laterali, ognuno con la sua griglia di pixel
function eqPatHit(m,u,v){
  if(m==='str')return Math.floor(u*6)%2===1;
  if(m==='rig')return Math.floor(v*6)%2===1;
  if(m==='fas')return v>=0.34&&v<0.62;
  if(m==='dia')return Math.abs(u-v)<0.17;
  if(m==='met')return u>=0.5;
  return false;
}

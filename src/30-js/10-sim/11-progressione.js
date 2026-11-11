/* ---- talento, limite (cap) e allenamenti ---- */
const TRAIN_TYPES=[['lan','Lancio'],['buc','Buco'],['spa','Sparo'],['pre','Presa'],['dif','Difesa'],['sal','Salto'],['sca','Scatto'],['agi','Agilità'],['tuf','Tuffo'],['vel','Velocità'],['res','Resistenza'],['vis','Visione']];
function hashStr(str){let h=0;for(let i=0;i<str.length;i++)h=(h*31+str.charCodeAt(i))|0;return Math.abs(h);}
function newCounters(){return {lan:[0,0],spa:[0,0],buc:[0,0],dif:0,sal:0,tuf:0,sca:0,vel:0,vis:0,res:0,pre:0,agi:0,mk:0,cut:0,rst:0,dec:0,g:0,a:0,pts:0};}
// tre talenti: lanci (Lan, Buc, Spa), fisico (Dif, Sal, Sca, Tuf, Vel) e visione (Vis). Il talento e' il limite massimo delle sue statistiche
function talOf(p,k){return (k==='lan'||k==='buc'||k==='spa')?p.tl:(k==='vis'?p.tv:p.tf);}
const capVal=(name,k,t)=>clamp(t+((hashStr(name+'|'+k)%7)-3),50,99);   // massimo = talento del gruppo +-3, fisso per giocatore e statistica
function capOf(p,k){return capVal(p.full||p.name,k,talOf(p,k));}
const talX=(x,k)=>(k==='lan'||k==='buc'||k==='spa')?x.tl:(k==='vis'?x.tv:x.tf);
const capX=(x,k)=>capVal(x.full||x.name||x.n,k,talX(x,k));          // massimo di una statistica, per giocatori in campo e schede di rosa
// POTENZIALE: l'Overall che avrebbe con tutte le statistiche al massimo. All'inizio se ne conosce solo un intervallo, che si stringe
// con l'osservazione (sk: 0 mai visto, 1 conosciuto, 2 osservato a lungo, 3 certo). Il centro dell'intervallo non e' il valore vero.
// Conta anche l'eta': a 20 anni si puo' arrivare fino al proprio massimo, a 30 resta poco margine, a 35 quasi nulla.
const growLeft=a=>a<=20?1:(a<=23?0.85:(a<=26?0.65:(a<=29?0.4:(a<=32?0.2:0.07))));
function potX(x){const c={};for(const k of KEYS)c[k]=Math.max(x.s[k],capX(x,k));const top=Math.max(rate(c,roleR(x)),rate(c,'D')),now=ovrX(x);return now+(top-now)*growLeft(x.age);}
const POT_W=[9,5,3,0];
function potRange(x){
  const w=Math.round(POT_W[clamp(x.sk===undefined?1:x.sk,0,3)]*clamp(growLeft(x.age)*1.4,0.25,1)),v=potX(x),h=hashStr('pot|'+(x.full||x.name||x.n));
  if(!w)return [Math.round(v),Math.round(v)];
  const off=((h%1000)/1000*2-1)*(w-1.5);
  return [Math.max(ovr(x),Math.round(v+off-w)),Math.min(99,Math.round(v+off+w))];
}
const devLabel=d=>d>=1.2?'rapida':(d>=0.95?'normale':'lenta');
// eta': i giovani crescono in fretta, gli adulti si stabilizzano, i veterani quasi non crescono piu'
// oltre 70 ogni punto costa di piu': arrivare a 95 richiede anni, non mesi
const lvlF=v=>v<70?1:(v<80?0.8:(v<88?0.6:(v<94?0.36:0.22)));
const ageMul=a=>a<=19?1.5:(a<=23?1.25:(a<=27?1:(a<=30?0.65:(a<=33?0.4:0.22))));
/* ---- ESPERIENZA (XP): la crescita nasce dalla qualita' della prestazione, non da soglie fisse.
   Ogni azione vale punti, anche quelle senza statistica: buone marcature, tagli efficaci, reset. I pesi sono tarati perche' handler, cutter e difensori
   guadagnino in media gli stessi punti a partita. I punti diventano miglioramenti nelle statistiche usate, con rendimenti decrescenti vicino al massimo. ---- */
const XP_STAT={lan:['lan'],spa:['spa'],buc:['buc'],dif:['dif'],sal:['sal'],tuf:['tuf'],sca:['sca','agi'],vel:['vel'],vis:['vis'],pre:['pre'],mk:['dif','agi'],cut:['sca','vel','agi'],rst:['vis','lan'],res:['res']};
function xpParts(m){   // punti esperienza per tipo di azione
  return {lan:Math.max(0,m.lan[0]*1.0-m.lan[1]*0.4+(m.dec||0)*0.5),spa:Math.max(0,m.spa[0]*2.6-m.spa[1]*0.5),buc:Math.max(0,m.buc[0]*1.8-m.buc[1]*0.5),dif:m.dif*2.6,sal:m.sal*0.9,tuf:m.tuf*2.2,
    sca:m.sca*0.45,vel:m.vel*0.9,vis:m.vis*1.3,pre:m.pre*1.2,mk:(m.mk||0)*1.4,cut:(m.cut||0)*0.8,rst:(m.rst||0)*1.6,res:Math.min(4,m.res*0.05)};
}
const xpTotal=m=>{const q=xpParts(m);let t=0;for(const k in q)t+=q[k];return t;};
const XP_RATE=0.024;   // punti statistica per punto esperienza (a 24-27 anni, crescita normale): circa 0,75 punti a partita
const XP_ROLE={H:1.3,C:0.95,D:0.82};   // in campo gli handler raccolgono meno esperienza di cutter e difensori: il peso la pareggia (misurato su 560 prestazioni)
function growBy(x,parts,mult){   // applica la crescita a un giocatore (in campo o in scheda): ritorna i cambi [{k,from,to}]
  let tot=0;const w={};
  for(const e in parts){const v=parts[e];if(v<=0)continue;tot+=v;for(const k of XP_STAT[e]){const room=clamp((capX(x,k)-x.s[k])/10,0,1);w[k]=(w[k]||0)+v/XP_STAT[e].length*room;}}   // rendimenti decrescenti vicino al potenziale
  let pts=tot*XP_RATE*(x.dev||1)*ageMul(x.age)*(mult||1),n=Math.floor(pts);if(Math.random()<pts-n)n++;
  const ks=Object.keys(w).filter(k=>w[k]>0),out={};
  for(let i=0;i<n&&ks.length;i++){
    let t=0;for(const k of ks)t+=w[k];if(t<=0)break;
    let r=Math.random()*t,pk=ks[0];for(const k of ks){r-=w[k];if(r<=0){pk=k;break;}}
    if(x.s[pk]<capX(x,pk)){if(Math.random()>lvlF(x.s[pk]))continue;out[pk]=out[pk]||{k:pk,from:x.s[pk]};x.s[pk]++;out[pk].to=x.s[pk];w[pk]*=0.6;}
    else w[pk]=0;
  }
  return Object.values(out);
}
// esperienza media di una partita per ruolo (misurata in simulazione): serve alle partite simulate e alla crescita delle altre squadre,
// cosi' simulare o giocare da' lo stesso sviluppo medio
const XP_SIM={H:{lan:7.5,buc:1.2,spa:1.5,vis:1.6,rst:1.2,sca:1.2,mk:1,cut:1,res:2},C:{sca:3.2,cut:3,vel:1.4,pre:1.6,sal:1.6,vis:2,lan:2.2,mk:1.2,dif:1,res:2.4},D:{dif:3.4,mk:3.6,tuf:1.4,sal:1.4,sca:2,cut:1.6,lan:1.6,res:2.4}};
function simParts(x,share){const b=XP_SIM[posOf(x)],o={};let t=0;for(const k in b)t+=b[k];const f=30/t*(share===undefined?1:share)*(0.6+0.8*Math.random());for(const k in b)o[k]=b[k]*f;return o;}   // 30 punti a partita, come la media delle partite giocate (misurata)
function matchGrowth(team){   // dopo una partita giocata: crescita a XP di chi e' sceso in campo
  const out=[];
  for(const p of (team===0?SQ:T[team])){
    const parts=xpParts(p.m),lk=lenK();if(lk<1)for(const k in parts)parts[k]*=lk;   // partita lunga: stessa esperienza di una partita ai 7
    p.xpLast=Math.round(xpTotal(p.m)*lk*10)/10;
    for(const c of growBy(p,parts,XP_ROLE[posOf(p)]))out.push({p,k:c.k,from:c.from,to:c.to,gain:c.to-c.from});
  }
  return out;
}

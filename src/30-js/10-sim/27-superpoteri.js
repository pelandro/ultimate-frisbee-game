/* ---- MODALITA' SUPERPOTERI (motore) ----
   Ogni squadra ha 4 eroi tra i suoi giocatori: Lupo mannaro, Giraffa, Polpo e Telecinetico. Ognuno ha il suo pulsante e il suo timer (G.hz[squadra][eroe] = secondi di
   ricarica che mancano): quando e' pronto, il giocatore si trasforma in campo per HERO[k].dur secondi.
   - Lupo mannaro: statistiche fisiche molto piu' alte (HERO_LUPO). Si sostituisce p.s con una copia maggiorata, come fa il tratto Poser: l'originale sta in
     p.hrb e torna al suo posto a fine trasformazione, a ogni punto (heroReset in placeTeams) e a fine partita (restoreForm).
   - Giraffa: vince tutti i duelli in aria (heroDuel in duelScore) e arriva piu' in alto e piu' lontano a prendere il disco (heroReach, heroZ).
   - Polpo: braccia lunghissime per gli intercetti (heroLane in laneR, heroZ in reachZ).
   - Telecinetico: guida il disco lanciato dalla sua squadra (heroSteer): la direzione cambia, la durata del volo e la strada che manca no (un lancio da 50 m
     ne fa comunque 50). Il nuovo tratto parte dal punto in cui e' il disco (f.st, letto da flightAt) e la direzione gira al massimo di HERO_TK_ROT al secondo.
     Il punto verso cui guidare e' G.tkp (il tuo dito, dall'interfaccia) o, per l'IA, il ricevitore.
   - Clone: si sdoppia (G.dec[squadra], cloneMake): il vero riceve e lancia, la copia corre da sola e serve solo a distrarre. Chi non e' della sua squadra
     non sa qual e' il vero: il marcatore del clone a volte segue la copia (heroMarkOf in updateDefenders) e, in difesa, il lanciatore avversario conta la
     copia come un difensore (heroSeen in aiPick). La copia non e' in T: non prende dischi, non intercetta, non entra nelle statistiche.
   In campo ogni squadra ha al massimo HERO_N eroi (G.hk[squadra] = quali): i tuoi li scegli prima della partita (QM.hk), quelli del computer sono a caso.
   p.hero = eroe del giocatore (sui giocatori della tua rosa e sui posti in campo dell'avversaria), p.hx = secondi di trasformazione che restano.
   Vale solo con G.heroOn (startQuick con QM.hero); l'IA usa i poteri della sua squadra (e della tua nelle mete simulate) con heroAI. */
const HERO={
  lupo:{n:'Lupo mannaro',dur:8,cd:22,txt:'Velocità, scatto, salto e resistenza molto più alti'},
  giraffa:{n:'Giraffa',dur:9,cd:24,txt:'Vince tutti i duelli in aria e prende i dischi più alti'},
  polpo:{n:'Polpo',dur:8,cd:22,txt:'Braccia lunghissime: intercetta molto più facilmente'},
  tele:{n:'Telecinetico',dur:7,cd:22,txt:'Guida il disco in volo col dito: cambia la direzione, non la distanza'},
  clone:{n:'Clone',dur:8,cd:24,txt:'Si sdoppia: tu sai qual è il vero, gli avversari no. La copia serve solo a distrarre'}
};
const HERO_K=['lupo','giraffa','polpo','tele','clone'];
const HERO_N=3;   // eroi in campo per squadra: di piu' sono troppi pulsanti e troppi timer da seguire
const heroRand=()=>HERO_K.slice().sort(()=>Math.random()-0.5).slice(0,HERO_N);
const HERO_TK_ROT=2.4;   // radianti al secondo: quanto in fretta il telecinetico puo' girare il disco
const HERO_LUPO={vel:18,sca:18,agi:15,sal:12,res:15,tuf:10,dif:6};
const HERO_START=8;   // secondi di gioco prima del primo potere: nessuno si trasforma al pull
const heroOn=(p,k)=>!!(G.heroOn&&p&&p.hx>0&&(!k||p.hero===k));
const heroDuel=p=>heroOn(p,'giraffa')?400:0;                  // in duelScore: la giraffa vince (contro un'altra giraffa decide il resto)
const heroReach=p=>heroOn(p,'giraffa')?0.9:0;                 // in reachOf: il collo lungo arriva prima sul disco
const heroZ=p=>heroOn(p,'giraffa')?1.2:(heroOn(p,'polpo')?0.8:0);   // in reachZ: fin dove arriva con la mano
const heroLane=p=>heroOn(p,'polpo')?2.4:1;                     // in laneR: quanto si allunga di lato per intercettare
// sceglie gli eroi (keys) tra una lista di giocatori: il telecinetico a un handler, il lupo al piu' veloce, la giraffa a chi salta di piu', il polpo al miglior
// difensore, il clone a un cutter rapido (la copia deve sembrare un taglio vero)
function heroAssign(list,keys){
  keys=keys||HERO_K;
  const free=list.filter(Boolean).slice();for(const p of free){p.hero=null;p.hx=0;}
  const pick=(k,f)=>{if(!free.length||!keys.includes(k))return;free.sort((a,b)=>f(b)-f(a));const p=free.shift();p.hero=k;if(p.trait==='poser')p.trait=null;};   // il Poser cambia p.s come il lupo: un eroe non lo ha
  pick('tele',p=>p.s.lan+p.s.vis+(p.role==='H'||p.r==='H'?20:0));pick('lupo',p=>p.s.vel+p.s.sca+p.s.agi);pick('giraffa',p=>p.s.sal*2+p.s.pre);pick('polpo',p=>p.s.dif*2+p.s.agi);pick('clone',p=>p.s.vel+p.s.agi+(p.role==='C'||p.r==='C'?20:0));   // il telecinetico e' un handler
}
const heroOf=(t,k)=>T[t].find(p=>p.hero===k)||null;
function heroInit(k0,k1){G.hz=[{},{}];G.dec=[null,null];G.hk=[k0||HERO_K,k1||HERO_K];for(const t of [0,1])for(const k of HERO_K)G.hz[t][k]=HERO_START;}
const heroReady=(t,k)=>!!(G.heroOn&&G.hz&&G.mode==='play'&&!G.pull&&G.hz[t][k]<=0&&heroOf(t,k));
function heroUse(t,k){
  if(!heroReady(t,k))return false;
  const p=heroOf(t,k),H=HERO[k];
  p.hx=H.dur;G.hz[t][k]=H.dur+H.cd;
  if(k==='clone')cloneMake(p);
  if(k==='lupo'&&!p.hrb){p.hrb=p.s;p.s=Object.assign({},p.s);for(const s in HERO_LUPO)p.s[s]=Math.min(99,p.s[s]+HERO_LUPO[s]);}
  (G.st.hero||(G.st.hero=[0,0]))[t]++;
  HOOKS.hero(p,k,true);
  return true;
}
function heroEnd(p){
  if(p.hrb){p.s=p.hrb;p.hrb=null;}
  const c=G.dec&&G.dec[p.t];if(c&&c.o===p){G.dec[p.t]=null;HOOKS.hero(c,'clone',false);}   // la copia sparisce in una nuvola
  const was=p.hx>0;p.hx=0;if(was)HOOKS.hero(p,p.hero,false);
}
function heroReset(){for(const p of T[0].concat(T[1]))if(p.hx>0||p.hrb)heroEnd(p);}
function heroTick(dt){
  if(!G.heroOn||!G.hz)return;
  for(const t of [0,1])for(const k of HERO_K)G.hz[t][k]=Math.max(0,G.hz[t][k]-dt);
  for(const p of T[0].concat(T[1]))if(p.hx>0){p.hx-=dt;if(p.hx<=0)heroEnd(p);}
  if(G.dec)for(const t of [0,1]){const c=G.dec[t];if(!c)continue;if(!T[t].includes(c.o)||!(c.o.hx>0)){G.dec[t]=null;continue;}cloneTick(c,dt);}
  heroAI(dt);
  const f=G.flight;
  if(f&&!G.pull&&heroOn(heroOf(f.team,'tele'),'tele')){
    const ai=f.team===1||G.auto,rc=[...T[f.team]].find(p=>p.fl&&p!==f.thrower),pt=ai?(rc?{x:rc.x+(rc.vx||0)*0.4,y:rc.y+(rc.vy||0)*0.4}:null):G.tkp;
    if(pt)heroSteer(f,pt,dt);
  }
}
// guida il disco verso pt: la strada che manca resta la stessa, cambia solo la direzione (al massimo HERO_TK_ROT rad/s)
function heroSteer(f,pt,dt){
  const s=flightS(f,Math.min(1,f.t/f.T));if(s>0.94)return false;
  const P=flightAt(f,s),d=hyp(f.tx-P.x,f.ty-P.y);if(d<0.6)return false;
  const a=Math.atan2(f.ty-P.y,f.tx-P.x),w=Math.atan2(pt.y-P.y,pt.x-P.x);
  let da=w-a;while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;
  da=clamp(da,-HERO_TK_ROT*dt,HERO_TK_ROT*dt);if(Math.abs(da)<1e-4)return false;
  const b=a+da,old={x:f.tx,y:f.ty};
  f.st={s,x:P.x,y:P.y};f.tx=P.x+Math.cos(b)*d;f.ty=P.y+Math.sin(b)*d;f.tk=(f.tk|0)+1;
  for(const p of T[0].concat(T[1]))if(p.fl&&p.fl.x===old.x&&p.fl.y===old.y){p.fl.x=f.tx;p.fl.y=f.ty;}   // chi correva verso il punto d'arrivo segue il nuovo
  return true;
}
// IA: la giraffa quando un disco sta per arrivarle vicino, il polpo in difesa, il lupo quando c'e' un possesso da giocare. Piu' alta la difficolta', piu' svelta
function heroAI(dt){
  for(const t of [0,1]){
    if(t===0&&!G.auto)continue;   // i tuoi eroi li usi tu (nelle mete simulate li usa il computer)
    const lv=t===1?((G.lvl&&G.lvl[1])|0):1,k1=(0.6+0.25*lv)*dt,f=G.flight;
    const g=heroOf(t,'giraffa');
    if(g&&heroReady(t,'giraffa')&&f&&!G.pull&&hyp(g.x-f.tx,g.y-f.ty)<6)heroUse(t,'giraffa');
    if(heroReady(t,'polpo')&&G.holder&&G.holder.t!==t&&Math.random()<0.35*k1)heroUse(t,'polpo');
    if(heroReady(t,'lupo')&&(G.holder||f)&&Math.random()<0.3*k1)heroUse(t,'lupo');
    if(heroReady(t,'tele')&&G.holder&&G.holder.t===t&&G.stallT>2&&Math.random()<0.5*k1)heroUse(t,'tele');   // prima di lanciare: il disco partira' gia' guidato
    const c=heroOf(t,'clone');if(c&&heroReady(t,'clone')&&G.holder&&G.holder!==c&&Math.random()<0.35*k1)heroUse(t,'clone');   // in attacco libera il clone, in difesa copre un altro uomo
  }
}
/* ---- CLONE ----
   La copia e' un oggetto che eredita dal giocatore (Object.create): nome, statistiche, aspetto ed eroe sono i suoi; posizione, velocita' e corsa sono della copia.
   In attacco corre in uno spazio libero lontano dal vero (sembra un taglio), in difesa si mette davanti all'attaccante piu' libero. */
const CLONE_FOOL=0.6;   // quanto spesso un marcatore segue la copia (meno con Visione alta)
function cloneMake(p){
  const side=p.y<MID?1:-1;
  G.dec[p.t]=Object.assign(Object.create(p),{fake:true,o:p,x:p.x,y:clamp(p.y+side*1.2,1,FIELD_W-1),vx:p.vx,vy:p.vy,mark:null,fl:null,flD:0,cmd:null,dv:null,cfx:null,armT:0,
    m:{},st:p.st,spr:false,_brk:0,cs:'cut',tx:p.x,ty:p.y,rT:0,md:null,fool:new Map()});
}
function cloneTick(c,dt){
  const o=c.o,P=G.poss,atk=o.t===P,md=atk?'a':'d';
  c.rT-=dt;
  if(c.md!==md||c.rT<=0||(atk&&hyp(c.x-c.tx,c.y-c.ty)<1.5)){
    c.md=md;
    const ref=G.holder||G.ref||o,real=T[1-o.t];
    if(atk){   // un punto libero, avanti e lontano dal vero: la difesa deve credere a un taglio
      const d=dirOf(o.t);let best=null,bs=-1e9;
      for(let i=0;i<12;i++){
        const x=clamp(ref.x+d*rnd(4,22),1,FIELD_L-1),y=rnd(4,FIELD_W-4);if(hyp(x-o.x,y-o.y)<7)continue;
        let op=12;for(const q of real)op=Math.min(op,hyp(q.x-x,q.y-y));
        const sc=op-Math.abs(hyp(x-ref.x,y-ref.y)-14)*0.15+rnd(0,2);if(sc>bs){bs=sc;best={x,y};}
      }
      if(best){c.tx=best.x;c.ty=best.y;}c.rT=rnd(2.2,3.2);c.cs='cut';
    }else{   // davanti all'attaccante piu' libero, dalla parte del disco: chi lancia lo crede marcato
      const H=G.holder;let a=null,bo=-1;
      for(const q of real){if(q===H)continue;let op=99;for(const df of T[o.t])op=Math.min(op,hyp(df.x-q.x,df.y-q.y));if(op>bo){bo=op;a=q;}}
      if(a){const hx=(H||ref).x-a.x,hy=(H||ref).y-a.y,hl=hyp(hx,hy)||1;c.tx=clamp(a.x+hx/hl*1.3,0.5,FIELD_L-0.5);c.ty=clamp(a.y+hy/hl*1.3,0.5,FIELD_W-0.5);}
      c.rT=0.5;c.cs='set';
    }
  }
  moveTo(c,c.tx,c.ty,dt);
}
// per updateDefenders: chi marca il clone (che non ha il disco) a volte segue la copia, e continua a seguirla finche' dura
function heroMarkOf(q){
  const a=q.mark;if(!a||!G.dec)return a;
  const c=G.dec[a.t];if(!c||c.o!==a||a===G.holder)return a;
  if(!c.fool.has(q))c.fool.set(q,Math.random()<clamp(CLONE_FOOL-(q.s.vis-60)*0.008,0.35,0.8));
  return c.fool.get(q)?c:a;
}
// i difensori della squadra t come li vede chi attacca: con la copia del clone, che non sa riconoscere
const heroSeen=t=>{const c=G.dec&&G.dec[t];return c?T[t].concat([c]):T[t];};

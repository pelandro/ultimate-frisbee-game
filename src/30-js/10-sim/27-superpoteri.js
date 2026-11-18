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
   p.hero = eroe del giocatore (sui giocatori della tua rosa e sui posti in campo dell'avversaria), p.hx = secondi di trasformazione che restano.
   Vale solo con G.heroOn (startQuick con QM.hero); l'IA usa i poteri della sua squadra (e della tua nelle mete simulate) con heroAI. */
const HERO={
  lupo:{n:'Lupo mannaro',dur:8,cd:22,txt:'Velocità, scatto, salto e resistenza molto più alti'},
  giraffa:{n:'Giraffa',dur:9,cd:24,txt:'Vince tutti i duelli in aria e prende i dischi più alti'},
  polpo:{n:'Polpo',dur:8,cd:22,txt:'Braccia lunghissime: intercetta molto più facilmente'},
  tele:{n:'Telecinetico',dur:7,cd:22,txt:'Guida il disco in volo col dito: cambia la direzione, non la distanza'}
};
const HERO_K=['lupo','giraffa','polpo','tele'];
const HERO_TK_ROT=2.4;   // radianti al secondo: quanto in fretta il telecinetico puo' girare il disco
const HERO_LUPO={vel:18,sca:18,agi:15,sal:12,res:15,tuf:10,dif:6};
const HERO_START=8;   // secondi di gioco prima del primo potere: nessuno si trasforma al pull
const heroOn=(p,k)=>!!(G.heroOn&&p&&p.hx>0&&(!k||p.hero===k));
const heroDuel=p=>heroOn(p,'giraffa')?400:0;                  // in duelScore: la giraffa vince (contro un'altra giraffa decide il resto)
const heroReach=p=>heroOn(p,'giraffa')?0.9:0;                 // in reachOf: il collo lungo arriva prima sul disco
const heroZ=p=>heroOn(p,'giraffa')?1.2:(heroOn(p,'polpo')?0.8:0);   // in reachZ: fin dove arriva con la mano
const heroLane=p=>heroOn(p,'polpo')?2.4:1;                     // in laneR: quanto si allunga di lato per intercettare
// sceglie i 3 eroi di una lista di giocatori: il lupo al piu' veloce, la giraffa a chi salta di piu', il polpo al miglior difensore
function heroAssign(list){
  const free=list.filter(Boolean).slice();for(const p of free){p.hero=null;p.hx=0;}
  const pick=(k,f)=>{if(!free.length)return;free.sort((a,b)=>f(b)-f(a));const p=free.shift();p.hero=k;if(p.trait==='poser')p.trait=null;};   // il Poser cambia p.s come il lupo: un eroe non lo ha
  pick('tele',p=>p.s.lan+p.s.vis+(p.role==='H'||p.r==='H'?20:0));pick('lupo',p=>p.s.vel+p.s.sca+p.s.agi);pick('giraffa',p=>p.s.sal*2+p.s.pre);pick('polpo',p=>p.s.dif*2+p.s.agi);   // il telecinetico e' un handler
}
const heroOf=(t,k)=>T[t].find(p=>p.hero===k)||null;
function heroInit(){G.hz=[{},{}];for(const t of [0,1])for(const k of HERO_K)G.hz[t][k]=HERO_START;}
const heroReady=(t,k)=>!!(G.heroOn&&G.hz&&G.mode==='play'&&!G.pull&&G.hz[t][k]<=0&&heroOf(t,k));
function heroUse(t,k){
  if(!heroReady(t,k))return false;
  const p=heroOf(t,k),H=HERO[k];
  p.hx=H.dur;G.hz[t][k]=H.dur+H.cd;
  if(k==='lupo'&&!p.hrb){p.hrb=p.s;p.s=Object.assign({},p.s);for(const s in HERO_LUPO)p.s[s]=Math.min(99,p.s[s]+HERO_LUPO[s]);}
  (G.st.hero||(G.st.hero=[0,0]))[t]++;
  HOOKS.hero(p,k,true);
  return true;
}
function heroEnd(p){
  if(p.hrb){p.s=p.hrb;p.hrb=null;}
  const was=p.hx>0;p.hx=0;if(was)HOOKS.hero(p,p.hero,false);
}
function heroReset(){for(const p of T[0].concat(T[1]))if(p.hx>0||p.hrb)heroEnd(p);}
function heroTick(dt){
  if(!G.heroOn||!G.hz)return;
  for(const t of [0,1])for(const k of HERO_K)G.hz[t][k]=Math.max(0,G.hz[t][k]-dt);
  for(const p of T[0].concat(T[1]))if(p.hx>0){p.hx-=dt;if(p.hx<=0)heroEnd(p);}
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
  }
}

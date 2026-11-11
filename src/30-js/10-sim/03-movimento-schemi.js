/* ---- movimento ---- */
const fatigue=p=>0.82+0.18*clamp(p.st/70,0,1);   // stanco = piu' lento
const vmaxOf=p=>(5.2+p.s.vel*0.045)*fatigue(p);     // velocità: scatti lunghi
const accOf=p=>(3.5+p.s.sca*0.085)*fatigue(p)*(hasT(p,'explosive')?1.08:1);
const SPRINT_COST=1.8,REST_FIELD=5,REST_BENCH=12;   // con i cambi di direzione netti gli scatti sono piu' frequenti: ognuno costa un po' meno
// scatto sui lanci lunghi (sparo): il corridore (ricevitore in attacco, difensore piu' vicino in difesa) scatta tenendo premuto, ma si stanca in fretta
const SPRINT_VM=1.15,SPRINT_AM=1.25,SPRINT_DRAIN=7;
const sprinting=p=>!!(G.flight&&p.st>3&&((G.sprint&&G.sprint.p===p&&G.hold)||(G.aiSprint&&G.aiSprint.includes(p))));
const sprintCost=p=>SPRINT_COST*(1.5-p.s.res/100)*(hasT(p,'iron')?0.65:1);      // scatto: accelerazione, scatti corti
function moveTo(p,tx,ty,dt,am=1,vm=1){
  const dx=tx-p.x,dy=ty-p.y,d=hyp(dx,dy),vmax=vmaxOf(p)*vm,acc=accOf(p)*am;
  let braking=false;
  // cambio di direzione netto: se la nuova direzione e' molto diversa da quella di corsa il giocatore frena in linea retta (senza curvare),
  // poi gira di colpo e riaccelera. Piu' e' ampio il cambio, piu' deve rallentare; con Scatto alto frena meglio e gira a velocita' piu' alta.
  const sp0=hyp(p.vx,p.vy);
  if(d>1.2&&sp0>0.8){
    const ux=dx/d,uy=dy/d,cosA=(p.vx*ux+p.vy*uy)/sp0;
    if(cosA<0.9){
      const c=Math.max(0,cosA),vAllow=(0.3+p.s.agi*0.036)+(hasT(p,'explosive')?0.6:0)+c*c*vmax*0.5;   // Agilita' alta: gira a velocita' piu' alta e frena in meno spazio
      if(sp0>vAllow){const k=Math.max(vAllow,sp0-acc*(1.1+p.s.agi*0.026)*dt)/sp0;p.vx*=k;p.vy*=k;braking=true;if(!p._brk){p._brk=1;p.m.agi++;}}
      else{p.vx=ux*sp0;p.vy=uy*sp0;p._brk=0;}   // abbastanza lento: cambio di direzione netto
    }
  }
  if(!braking){
    let dvx=0,dvy=0;
    if(d>0.05){const sp=Math.min(vmax,Math.sqrt(2*acc*0.8*d));dvx=dx/d*sp;dvy=dy/d*sp;}
    let ax=dvx-p.vx,ay=dvy-p.vy;const al=hyp(ax,ay),md=acc*dt;
    if(al>md){ax*=md/al;ay*=md/al;}
    p.vx+=ax;p.vy+=ay;
    const sp=hyp(p.vx,p.vy);if(sp>vmax){p.vx*=vmax/sp;p.vy*=vmax/sp;}
  }
  const spd=hyp(p.vx,p.vy);
  if(!p.spr&&spd>0.78*vmax){p.spr=true;p.m.res++;p.st=Math.max(0,p.st-sprintCost(p));}   // inizia uno scatto
  else if(p.spr&&spd<0.5*vmax)p.spr=false;
  p.x=clamp(p.x+p.vx*dt,0,FIELD_L);p.y=clamp(p.y+p.vy*dt,0,FIELD_W);
}
function ttr(p,x,y){const d=hyp(p.x-x,p.y-y),v=vmaxOf(p),a=accOf(p),da=v*v/(2*a);return d<=da?Math.sqrt(2*d/a):v/a+(d-da)/v;}
function nearestTo(arr,x,y){let b=null,bd=1e9;for(const q of arr){const d=hyp(q.x-x,q.y-y);if(d<bd){bd=d;b=q;}}return b;}

/* ---- schemi di attacco: [spostamento in avanti, 'r' relativo al disco / 'a' assoluto, y] ---- */
const SLOTS={
  vert:[[-7,'r',0],[-2,'r',12],[0,'r',-10],[13,'a',MID],[19,'a',MID],[25,'a',MID],[31,'a',MID]],
  horz:[[-8,'r',0],[-3,'r',11],[-3,'r',-11],[14,'a',5],[20,'a',15],[26,'a',23],[32,'a',32]],   // linea obliqua: i cutter sono sfalsati in profondita' (14-32 m), cosi' c'e' sempre un bersaglio lungo
  hex:[[-7,'r',9],[-7,'r',-9],[5,'r',17],[5,'r',-17],[15,'r',0],[24,'r',11],[24,'r',-11]]
};
const ZSLOTS=[[7,-7],[7,7],[15,-12],[15,12],[24,-4],[34,5]];
// ---- schemi a sequenza: i giocatori eseguono i movimenti dello schema, alla lettera tanto piu' quanto e' alta la loro Visione ----
// u = metri in avanti dalla propria linea di meta (dentro la propria meta u<0), y = metri sulla larghezza del campo.
// Ruoli: H1 = chi ha il disco all'inizio, H2 e H3 = altri handler (dietro), C1..C4 = cutter (davanti). Fase 0: formazione ('set') e primo movimento ('go'); fase 1: dopo la presa.
const PLAYBOOK={
  t1:{phases:[
    {pass:['C4'],ready:'C4',
     set:{H2:[-8.3,4.6],H3:[-8.3,33],C1:[30.7,2.2],C2:[30.7,13.5],C3:[30.7,23.5],C4:[30.7,34.5]},
     go:{C1:[[44.7,2.0]],C2:[[45.8,13.2]],C3:[[46.8,23.1]],C4:[[27.2,35.2],[15.8,15.1]]}},
    {pass:['C1','C2','C3'],ready:null,
     go:{H1:[[1.9,18.6]],H2:[[39.7,1.9]],H3:[[13.1,33]],C1:[[70.9,11.6]],C2:[[36.6,6.9]],C3:[[33.2,25.1]]}}
  ]}
};
SLOTS.side=[[-7,'r',0],[-2,'r',-10],[2,'r',-5],[13,'r',13],[18,'r',13],[24,'r',13],[30,'r',12]];   // stack laterale: i cutter in fila su un lato lasciano libero mezzo campo per il taglio in isolamento
SLOTS.t1=[[-7,'r',0],[-9,'a',4.6],[-9,'a',33],[30,'a',2.2],[30,'a',13.5],[30,'a',23.5],[30,'a',34.5]];   // formazione di riserva: chi non segue lo schema torna qui
const PB_ROLES=['H1','H2','H3','C1','C2','C3','C4'];
const adhOf=p=>clamp(0.3+0.75*visOf(p),0.35,0.99);   // quanto segue lo schema: Visione 45 -> 64%, 60 -> 75%, 90 -> 97%
// posizione di uno schema: [u, y] si sposta con il punto di partenza del portatore; [u, y, 'a'] e' assoluta (per esempio dentro la meta);
// [du, dy, 'h'] e' relativa a dove il portatore ha iniziato lo schema (handler di sostegno)
function pbPos(pb,team,u,y,m){const d=dirOf(team),own=d>0?EZ:FIELD_L-EZ;
  const uu=m==='a'?u:(m==='h'?pb.hu+u:u+pb.shift),yy=m==='h'?pb.hy+y:y;
  return {x:clamp(own+d*uu,1,FIELD_L-1),y:clamp(yy,2.5,FIELD_W-2.5)};}
function startPlay(team,force){   // force: avvia uno schema preciso (l'attacco in meta) invece di quello scelto
  const sch=force||(team===0?G.sch.att:G.opp.att),book=PLAYBOOK[sch];
  if(!force){if(!G.ezUsed)G.ezUsed=[false,false];G.ezUsed[team]=false;}   // nuovo possesso: l'attacco in meta si puo' usare di nuovo
  if(!G.pb)G.pb=[null,null];
  const h=G.holder;
  if(!book||!h||h.t!==team){G.pb[team]=null;return;}
  const d=dirOf(team),own=d>0?EZ:FIELD_L-EZ,uh=(h.x-own)*d;   // dove parte il portatore: la formazione si muove con lui
  const pb={id:sch,phase:0,stage:'go',stageT:0,shift:clamp(uh,-2,30)-0.6,hu:uh,hy:h.y,follow:{},role:{},rp:{},wp:{},post:{},active:true,ready:false};   // se si riparte lontano dalla linea di meta si parte subito in corsa
  const others=T[team].filter(p=>p!==h),roles=PB_ROLES.slice(1),setPos={};
  for(const r of roles){const sp=book.phases[0].set[r];setPos[r]=sp?pbPos(pb,team,sp[0],sp[1],sp[2]):{x:h.x,y:h.y};}
  const pairs=[];
  for(const p of others)for(const r of roles)pairs.push([hyp(p.x-setPos[r].x,p.y-setPos[r].y)+((p.role==='H')===(r[0]==='H')?0:25),p,r]);   // handler agli handler, cutter ai cutter
  pairs.sort((a,b)=>a[0]-b[0]);const up=new Set(),ur=new Set();
  for(const [c,p,r] of pairs){if(up.has(p)||ur.has(r))continue;up.add(p);ur.add(r);pb.role[p.id]=r;pb.rp[r]=p;}
  pb.role[h.id]='H1';pb.rp.H1=h;
  for(const p of T[team])pb.follow[p.id]=Math.random()<adhOf(p);
  G.pb[team]=pb;
}
function pbTarget(team,p){
  const pb=G.pb&&G.pb[team];if(!pb||!pb.active||!pb.follow[p.id])return null;
  const r=pb.role[p.id],ph=PLAYBOOK[pb.id].phases[pb.phase];if(!r)return null;
  if(pb.phase===0&&pb.stage==='set'){const sp=ph.set[r];if(!sp)return {hold:true};const t=pbPos(pb,team,sp[0],sp[1],sp[2]);return {x:t.x,y:t.y,am:1,vm:0.9};}
  const way=ph.go[r];if(!way){if(!pb.post[p.id]){const sp=pb.phase===0&&ph.set&&ph.set[r];pb.post[p.id]=sp?pbPos(pb,team,sp[0],sp[1],sp[2]):{x:p.x,y:p.y};}return {free:true,post:pb.post[p.id]};}   // handler dietro: vanno al loro posto e li' cercano di liberarsi
  if(pb.wp[p.id]===undefined){const t0=pbPos(pb,team,way[0][0],way[0][1],way[0][2]);pb.wp[p.id]=(way.length>1&&hyp(p.x-t0.x,p.y-t0.y)>12)?1:0;}   // se parte lontano dal punto della finta, va direttamente al taglio
  let i=pb.wp[p.id],tg=pbPos(pb,team,way[i][0],way[i][1],way[i][2]);
  if(i<way.length-1&&hyp(p.x-tg.x,p.y-tg.y)<2.5){i++;pb.wp[p.id]=i;tg=pbPos(pb,team,way[i][0],way[i][1],way[i][2]);}
  return {x:tg.x,y:tg.y,am:1,vm:1};
}
function updatePlay(dt){
  for(const team of [0,1]){
    const pb=G.pb&&G.pb[team];if(!pb||!pb.active)continue;
    if(G.poss!==team){pb.active=false;continue;}   // possesso perso: finito
    pb.stageT+=dt;
    const book=PLAYBOOK[pb.id],ph=book.phases[pb.phase];
    if(pb.stage==='set'){
      if(G.brickWait||G.walk||G.pull)continue;
      let ok=true;
      for(const p of T[team]){if(!pb.follow[p.id]||p===G.holder)continue;const sp=ph.set[pb.role[p.id]];if(sp){const t=pbPos(pb,team,sp[0],sp[1],sp[2]);if(hyp(p.x-t.x,p.y-t.y)>3.5)ok=false;}}
      if(ok||pb.stageT>1.2){pb.stage='go';pb.stageT=0;}
    }else if(ph.ready){
      const rp=pb.rp[ph.ready];
      if(!rp||!pb.follow[rp.id])pb.ready=true;
      else{const way=ph.go[ph.ready],w1=way[way.length-1],f=pbPos(pb,team,w1[0],w1[1],w1[2]);pb.ready=hyp(rp.x-f.x,rp.y-f.y)<10||pb.stageT>3.2;}
    }else pb.ready=pb.stageT>0.8;
  }
}
// il portatore aspetta che lo schema sia pronto, ma non oltre lo stall 3: da li' lo schema si abbandona e si gioca libero (PB_STALL)
const PB_STALL=3;
const pbWait=h=>{const pb=G.pb&&G.pb[h.t];return !!(pb&&pb.active&&pb.follow[h.id]&&G.stallT<PB_STALL&&(pb.stage==='set'||!pb.ready));};
function pbAllowed(th){   // a chi puo' lanciare chi segue lo schema
  const pb=G.pb&&G.pb[th.t];if(!pb||!pb.active||!pb.follow[th.id]||pb.stage==='set'||G.stallT>=PB_STALL)return null;
  const ph=PLAYBOOK[pb.id].phases[pb.phase];if(!ph.pass)return null;
  const al=ph.pass.map(r=>pb.rp[r]).filter(q=>q&&pb.follow[q.id]);
  return al.length?al:null;
}
function playOnCatch(team,p){
  const pb=G.pb&&G.pb[team];if(!pb||!pb.active)return;
  const book=PLAYBOOK[pb.id],ph=book.phases[pb.phase],nxt=book.phases[pb.phase+1];
  if(nxt&&ph.pass&&pb.role[p.id]===ph.pass[0]){pb.phase++;pb.stage='go';pb.stageT=0;pb.ready=false;pb.wp={};}   // il ricevitore previsto ha preso: parte la fase successiva
  else pb.active=false;
}
function anchor(sch,slot,H,d,side){
  const s=SLOTS[sch][slot];
  return {x:clamp(H.x+d*s[0],1,FIELD_L-1),y:clamp(s[1]==='a'?s[2]:H.y+side*s[2],2.5,FIELD_W-2.5)};
}
function assignMarks(){
  const atk=T[G.poss],def=T[1-G.poss],pairs=[];
  for(const a of atk)for(const q of def){pairs.push([hyp(a.x-q.x,a.y-q.y),a,q]);}
  pairs.sort((u,v)=>u[0]-v[0]);
  const ua=new Set(),ud=new Set();
  for(const [,a,q] of pairs){if(ua.has(a)||ud.has(q))continue;ua.add(a);ud.add(q);q.mark=a;}
  dangerMark(atk,def);
}
// la difesa dell'IA mette il suo difensore migliore sull'attaccante che in questa partita le sta facendo piu' male (mete, tagli riusciti, prese contese).
// Succede a ogni ripresa con probabilita' pari a quanto l'IA e' attenta (smart): al livello facile di rado, al difficile quasi sempre
function dangerMark(atk,def){
  const dT=def.length&&def[0].t;if(!def.length||!aiTeam(dT)||Math.random()>AIK(dT).smart*0.7)return;
  const thr=a=>a.m.g*3+a.m.cut+a.m.pre+a.m.sal*0.5;let ta=null,tv=2.5;
  for(const a of atk){if(a===G.holder)continue;const v=thr(a);if(v>tv){tv=v;ta=a;}}
  if(!ta)return;
  const best=def.filter(q=>!(G.holder&&q.mark===G.holder)).sort((x,y)=>(y.s.dif*0.6+y.s.vel*0.4)-(x.s.dif*0.6+x.s.vel*0.4))[0],cur=def.find(q=>q.mark===ta);
  if(!best||!cur||best===cur)return;
  cur.mark=best.mark;best.mark=ta;G.st.dm[dT]++;
}
function placeTeams(rec){
  G.poss=rec;const d=dirOf(rec),atk=T[rec],def=T[1-rec],pt=1-rec;
  const hx=d>0?EZ:FIELD_L-EZ,px=dirOf(pt)>0?EZ:FIELD_L-EZ;
  G.ref={x:hx,y:MID};
  const sch=rec===0?G.sch.att:G.opp.att;
  // al pull i ricevitori partono tutti sulla propria linea di meta, sparsi in larghezza: poi corrono a disporsi nello schema
  const LY=[MID,MID-5,MID+5,MID-15,MID-10,MID+10,MID+15];   // handler al centro, cutter verso le linee laterali, a 5 m l'uno dall'altro
  atk.forEach(p=>{p.x=hx;p.y=LY[p.slot%LY.length];});
  const puller=def.slice().sort((a,b)=>b.s.spa-a.s.spa)[0];
  const ys=[4,9,14,23,28,33];let k=0;
  for(const q of def){q.x=px;q.y=q===puller?MID:ys[k++];}
  for(const p of atk.concat(def)){p.vx=p.vy=0;p.fl=null;p.flD=0;p.boost=0;p.cs='set';p.cutT=rnd(0.6,2);p.mark=null;p.ph=0;p.wT=0;p.nT=0;p.nx=0;p.ny=0;p.cmd=null;}
  G.puller=puller;G.pullTeam=pt;G.pull=null;G.holder=null;G.flight=null;G.marker=null;
  G.stallT=0;G.zoneH=null;G.zoneT=0;G.call=null;G.iso=null;G.ctrl=null;G.cdir=null;G.ctrlH=null;G.hold=false;G.sprint=null;G.aiSprint=[];G.brickWait=false;G.walk=null;G.diveWin=null;G.dive=null;G.slowTail=0;G.pb=[null,null];
  G.disc.x=puller.x;G.disc.y=puller.y;G.disc.z=1;
  G.readyT=G.auto?0.3:3.2;G.freeze=0;G.high=false;G.mode='ready';
  assignMarks();
}
// tra una meta e l'altra si recupera: in panchina molto di piu'. Gli avversari ruotano i giocatori stanchi
function restPlayers(){
  const on=new Set(T[0].map(p=>p.id));
  for(const p of SQ)p.st=Math.min(100,p.st+(on.has(p.id)?REST_FIELD+0.1*p.s.res:REST_BENCH+0.2*p.s.res));
  // avversari: stesso recupero dei tuoi (in campo poco, in panchina di piu'); chi e' stanco esce davvero per il compagno piu' fresco dello stesso ruolo
  const onO=new Set(T[1].map(q=>q.ro).filter(Boolean));
  for(const o of OPP.list)if(!onO.has(o))o.st=Math.min(100,(o.st===undefined?100:o.st)+REST_BENCH+0.2*o.s.res);
  for(const q of T[1]){q.st=Math.min(100,q.st+REST_FIELD+0.1*q.s.res);if(q.ro)q.ro.st=q.st;}
  for(const q of T[1]){
    if(q.st>=52||!q.ro||!onO.has(q.ro))continue;
    const cand=OPP.list.filter(o=>!onO.has(o)&&(o.st||0)>=75).sort((a,b)=>((b.r===q.role)-(a.r===q.role))||mean9(b)-mean9(a))[0];
    if(!cand)continue;
    onO.delete(q.ro);onO.add(cand);loadOpp(q,cand,true);
  }
}
// % di possessi che finiscono in meta per ogni attacco contro ogni difesa (misurata con migliaia di partite simulate: serve all'IA per scegliere gli schemi).
// Ogni schema ha un controgioco: la Zona ferma Verticale ed Esagono ma subisce Orizzontale e T1; l'Esagono rende meno ma e' il piu' sicuro contro la zona stretta
// misurata con le aperture del playbook, i tagli coordinati e gli intercetti lungo il volo: 30 partite per casella, 3 coppie di rose (mete / (mete + turnover)).
// Il T1 resta il piu' efficace, soprattutto contro la zona: l'IA dei livelli alti lo sa e gli risponde con la difesa a uomo, dove il margine e' piccolo
const SCH_EFF={vert:{man_out:41,man_in:39,zone:32,man_poach:40},horz:{man_out:37,man_in:35,zone:41,man_poach:38},hex:{man_out:39,man_in:41,zone:32,man_poach:42},t1:{man_out:43,man_in:44,zone:54,man_poach:48},side:{man_out:41,man_in:41,zone:37,man_poach:41},weave:{man_out:40,man_in:39,zone:41,man_poach:37}};
const SCH_ATT=['vert','horz','hex','t1','side','weave'],SCH_DEF=['man_out','man_in','zone','man_poach'];
// L'avversario non legge piu' lo schema che hai scelto per questa meta: ricorda quelli che ti ha VISTO usare nelle mete precedenti (G.seen).
// Facile: sceglie a caso; Medio e Difficile: sempre piu' spesso prende il controgioco dello schema che usi di piu'. L'identita' della squadra pesa sulle scelte a caso.
function seenTop(o){let b=null,bn=0;for(const k in o)if(o[k]>bn){bn=o[k];b=k;}return bn>=1?b:null;}
function oppSchemes(){
  if(G.fix){Object.assign(G.sch,G.fix.sch);Object.assign(G.opp,G.fix.opp);return;}   // test: schemi fissati
  const lv=AIK(1),idn=idOf(1),sa=G.seen?seenTop(G.seen.att):null,sd=G.seen?seenTop(G.seen.def):null;
  const wA=k=>1+(k==='vert'||k==='t1'||k==='side'?idn.deep*0.6:-idn.deep*0.6),wD=k=>k==='man_poach'?0.4+idn.poach:(k==='zone'?0.8+Math.max(0,idn.pat)*0.5:1);
  const wpick=(arr,w)=>{let t=0;const ws=arr.map(k=>{const x=Math.max(0.1,w(k));t+=x;return x;});let r=Math.random()*t;for(let i=0;i<arr.length;i++){r-=ws[i];if(r<=0)return arr[i];}return arr[arr.length-1];};
  // schema d'attacco che in questa partita le fa perdere troppi dischi: l'IA lo usa sempre meno (G.aiRec: [mete, turnover] per schema)
  const rec=G.aiRec||{},bad=k=>{const r=rec[k];return r&&r[1]-2*r[0]>=3;};
  const wA2=k=>wA(k)*(bad(k)?0.2:1);
  G.opp.att=sd&&Math.random()<lv.adapt?SCH_ATT.filter(k=>!bad(k)).sort((a,b)=>SCH_EFF[b][sd]-SCH_EFF[a][sd])[0]:wpick(SCH_ATT,wA2);
  G.opp.def=sa&&Math.random()<lv.adapt?SCH_DEF.slice().sort((a,b)=>SCH_EFF[sa][a]-SCH_EFF[sa][b])[0]:wpick(SCH_DEF,wD);
  // marcatura dell'IA: parte dall'identita' e si corregge con cio' che ha osservato (tanti passaggi corti riusciti: anticipo; tanti lanci lunghi: contenimento)
  let pr=idn.press;const o=G.obs;
  if(o&&o.n>=5&&lv.adapt>0)pr=clamp(pr+lv.adapt*((o.u/o.n-0.5)*1.3-(o.d/o.n-0.15)*2.2),0.03,0.95);
  G.dmode[1]=Math.random()<pr?1:0;
  if(G.auto)G.dmode[0]=Math.random()<idOf(0).press?1:0;
}
// LINEE: in carriera hai una linea d'attacco (gioca le mete in cui ricevi il pull) e una di difesa (quelle in cui lo tiri).
// Con i cambi intelligenti chi e' stanco esce da solo per il compagno piu' fresco dello stesso ruolo, solo per quella meta.
function useLines(rec){
  const L=G.lines;if(!L)return;
  G.lineK=rec===0?'o':'d';
  let ids=(rec===0?L.o:L.d).filter(id=>SQ[id]&&!SQ[id].inj);
  const pool=()=>SQ.filter(p=>!p.inj&&!ids.includes(p.id));
  while(ids.length<7){const c=pool().sort((a,b)=>b.st-a.st||ovrX(b)-ovrX(a))[0];if(!c)break;ids.push(c.id);}
  if(L.auto)ids=ids.map(id=>{
    const p=SQ[id];if(p.st>=46)return id;
    const c=pool().filter(q=>q.st>=70).sort((a,b)=>((b.role===p.role)-(a.role===p.role))||ovrX(b)-ovrX(a))[0];
    if(!c)return id;const out=c.id;ids=ids.map(x=>x===id?out:x);return out;
  });
  if(ids.length===7)setLineup(ids.slice(0,7));
}
function startPoint(rec){
  restPlayers();
  useLines(rec);
  for(const p of T[0])p.m.pts++;for(const q of T[1])q.m.pts++;
  oppSchemes();
  placeTeams(rec);
}


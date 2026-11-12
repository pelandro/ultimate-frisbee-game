/* ===================== SIMULAZIONE (nessun riferimento al DOM) ===================== */
const FIELD_L=100,FIELD_W=37,EZ=18,MID=FIELD_W/2;
const KEYS=['lan','buc','spa','dif','sal','sca','tuf','vel','vis','res','pre','agi'];   // pre = Presa (ricezioni difficili), agi = Agilita' (frenate e cambi di direzione)
const SHOW=['lan','buc','spa','pre','dif','sal','sca','agi','tuf','vel','res','vis'];   // ordine di visualizzazione
const SPARO_D=30;   // da 30 m in su si usa lo sparo
const clamp=(v,a,b)=>v<a?a:(v>b?b:v);
const lerp=(a,b,t)=>a+(b-a)*t;
const rnd=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const randn=()=>{let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(6.2831853*v);};
const hyp=Math.hypot;
const dirOf=t=>G.dir[t];
const inEZ=(p,team)=>dirOf(team)>0?p.x>=FIELD_L-EZ:p.x<=EZ;
function segDist(px,py,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy;let t=l2?((px-ax)*dx+(py-ay)*dy)/l2:0;t=clamp(t,0,1);return hyp(px-(ax+dx*t),py-(ay+dy*t));}

// nome, ruolo, lancio, buco, sparo, difesa, salto, scatto, tuffo, velocità
const ROSTERS=[
 {name:'BLU',list:[
  ['Giulia','H',88,80,72,58,52,70,58,68,84,94,78,90,27,64],
  ['Matteo','H',82,74,86,62,58,66,60,64,78,91,74,85,24,62],
  ['Sofia','H',78,84,66,70,55,78,64,72,90,89,84,95,21,70],
  ['Luca','C',64,58,60,74,88,84,78,80,62,75,93,80,25,82],
  ['Marco','C',60,55,58,80,72,90,70,86,48,72,92,76,29,86],
  ['Elena','C',66,60,62,68,80,76,92,74,70,78,97,84,18,78],
  ['Andrea','C',58,52,55,84,94,72,66,90,56,70,99,74,30,90],
  ['Beatrice','H',80,76,70,52,48,60,50,58,80,88,72,86,22,60],
  ['Tommaso','H',74,70,78,56,54,62,54,60,72,85,76,80,26,62],
  ['Alice','H',70,78,64,50,46,58,52,56,76,82,72,84,17,58],
  ['Lorenzo','C',56,50,52,70,76,80,66,78,58,72,88,74,23,80],
  ['Valentina','C',54,52,50,76,70,74,82,72,60,70,90,78,20,76],
  ['Davide','C',52,48,50,66,84,70,72,76,54,72,91,72,28,74],
  ['Nicola','C',50,46,48,72,68,86,64,84,52,70,94,76,29,88]]},
 {name:'ROSSI',list:[
  ['Davide','H',84,78,76,60,54,70,56,66,82,90,76,84,26,74],
  ['Chiara','H',80,82,64,66,56,74,62,70,86,88,78,88,22],
  ['Paolo','H',76,70,82,64,60,68,58,66,74,86,74,80,28],
  ['Nico','C',62,56,58,76,86,82,74,82,66,76,90,82,24],
  ['Fabio','C',60,54,56,78,70,88,68,84,52,74,88,76,27],
  ['Irene','C',64,58,60,70,78,74,88,76,72,78,92,84,20],
  ['Sara','C',56,50,54,82,90,70,64,88,58,72,94,78,23]]}
];
const T=[[],[]],SQ=[];
const HOOKS={cine:null,toast(){},menu(){},over(){},vibe(){},injury(){},sfx(){},half(){},shake(){},drill(){}};
const MATCH_TARGET=7,HALF_AT=4,HALF_REST=4;   // la partita arriva a 7 punti; quando una squadra segna il 4° c'e' l'half time, in cui si recupera pochissima energia (+4)
const G={mode:'menu',xtr:false,hint:false,routes:true,score:[0,0],target:MATCH_TARGET,halfDone:false,startRec:1,pointNo:1,poss:0,nextRec:1,holder:null,flight:null,
  disc:{x:0,y:0,z:1},ref:{x:EZ,y:MID},marker:null,closedSide:1,stallT:0,edge:null,freeze:0,think:1,high:false,
  sch:{att:'vert',def:'man_out'},opp:{att:'vert',def:'man_out'},opt:{cine:true,def:0,wind:true},banner:null,auto:false,
  zoneT:0,zoneH:null,st:null,ctrl:null,cdir:null,dmode:[0,0],iso:null,pullTeam:1,puller:null,pull:null,readyT:3,schemeOpen:false,dir:[1,-1],holdT:0,hbAtt:null,injured:[],wind:{lv:0,a:0,v:0,x:0,y:0}};
// DIFESA: G.opt.def = 0 automatica (predefinita: i tuoi difendono da soli, il gioco scorre piu' in fretta e restano pochi momenti a tempo),
// 1 manuale (guidi un difensore, handblock e tuffi a ogni occasione), 2 saltata (il possesso avversario si risolve in un istante).
// In allenamento la difesa e' sempre manuale: e' li' che si impara. G.skip: possesso avversario in corso di salto.
const defMan=()=>G.opt.def===1||!!G.drill;
function resetStats(){G.st={thr:[0,0],cmp:[0,0],blk:[0,0],dive:[0,0],jump:[0,0],to:[0,0],hb:[0,0],sp:[0,0],sh:[0,0],drop:[0,0],lane:[0,0],pair:[0,0],gg:[0,0],iso:[0,0],ez:[0,0],dm:[0,0]};G.aiRec={};G.ptLog=[];G.schR={};G.defR={};}
const statOrig=(r,k)=>k==='res'?(r[15]!==undefined?r[15]:60):(k==='pre'?Math.round(r[2]*0.35+r[6]*0.25+r[7]*0.4):(k==='agi'?Math.round(r[7]*0.7+r[9]*0.3):r[2+KEYS.indexOf(k)]));   // le rose di prova non hanno Presa e Agilita': si ricavano da lancio, salto, scatto e velocita'
// rose salvate prima che esistessero Presa e Agilita': le due statistiche si ricavano dalle altre
function fillStats(st){if(typeof st.pre!=='number')st.pre=Math.round(st.lan*0.3+st.sal*0.3+st.sca*0.4);if(typeof st.agi!=='number')st.agi=Math.round(st.sca*0.7+st.vel*0.3);return st;}
function newPlayer(t,i,o){
  return {t,i,id:i,slot:i,look:makeLook(o.full||o.name,o.f),f:!!o.f,pos:o.pos,name:o.name,full:o.full||o.name,label:o.label||o.name,gen:!!o.gen,role:o.role,tl:o.tl,tf:o.tf,tv:o.tv,age:o.age,tal:Math.round((o.tl+o.tf+o.tv)/3),tr:false,trait:o.trait!==undefined?o.trait:traitFor(o.full||o.name,o.s,o.role),dev:o.dev||devOf(o.full||o.name),cond:o.cond===undefined?100:o.cond,sk:o.sk===undefined?1:o.sk,car:o.car||null,m:newCounters(),st:100,spr:false,inj:0,injNew:false,s:o.s,x:0,y:0,vx:0,vy:0,cs:'set',cutT:0,tx:0,ty:0,fl:null,flD:0,boost:0,mark:null,zs:0,_t:0,cmd:null,run:0,miss:0,hot:false,cold:false,wx:0,wy:0,wT:0,nx:0,ny:0,nT:0};
}
function mkP(t,i,r){
  const s={};KEYS.forEach(k=>{s[k]=statOrig(r,k);});
  return newPlayer(t,i,{name:r[0],role:r[1],tl:r[11],tf:r[12],tv:r[13],age:r[14]||22,s});
}
function initTeams(){
  T[1]=ROSTERS[1].list.map((r,i)=>mkP(1,i,r));
  SQ.length=0;ROSTERS[0].list.forEach((r,i)=>SQ.push(mkP(0,i,r)));
  setLineup([0,1,2,3,4,5,6]);
}

/* ===================== SEGNALA UN PROBLEMA =====================
   Quando in partita succede qualcosa di strano (un giocatore fermo, uno schema che non parte, una regola sbagliata) la cosa piu' lenta era ricostruirla a parole.
   Questo registratore tiene gli ultimi SG_KEEP secondi:
   - istantanee del gioco (SG_HZ al secondo): posizioni e velocita' di tutti, disco, volo in corso, chi marca chi, ruolo nello schema, stall, punteggio;
   - un filmato dello schermo a bassa risoluzione (SG_FPS immagini al secondo, larghe SG_FW): salti, tuffi, replay ed esultanze sono disegnati mentre il motore
     e' fermo, quindi le istantanee del gioco non li vedono;
   - gli eventi: scene laterali (chi salta o si tuffa e con che esito), replay, cambi di fase.
   Tutto ha lo stesso orologio (SG.wt: secondi di partita visti dal giocatore, fermi in pausa). Il tasto «!» in alto a sinistra (o «Segnala un problema» nel
   menu di pausa) salva il file JSON da mandare a chi sviluppa: node tools/segnalazione.js <file> lo riassume e disegna tracce e filmato.
   Legge G e T e non scrive nulla: non cambia la partita. Dentro non ci sono dati personali (niente salvataggio, niente nome dell'allenatore). */
const SG_KEEP=15,SG_HZ=10,SG_FPS=4,SG_FW=320,SG_SHOT=900;   // secondi tenuti, istantanee al secondo, filmato: immagini al secondo e larghezza; foto finale
// salti, tuffi e replay durano 2-3 secondi: li si filma piu' fitto e piu' grande, per vedere i dettagli (il disco nella mano, la posa, la zona verde)
const SG_FPS_CINE=10,SG_FW_CINE=420;
const SG={buf:[],film:[],ev:[],pl:{},wt:0,next:0,fnext:0,live:false,mode:null,cv:null};
const sgKey=p=>p?p.t+'.'+p.id:null;
const sgR=v=>Math.round((v||0)*100)/100;
function sgReset(){SG.buf.length=0;SG.film.length=0;SG.ev.length=0;SG.pl={};SG.wt=SG.next=SG.fnext=0;SG.mode=null;}
function sgEvent(k,o){if(SG.live)SG.ev.push(Object.assign({w:sgR(SG.wt),k},o||{}));}
// a ogni fotogramma (anche durante salti, tuffi e replay): orologio, cambi di fase, filmato
function sgTick(dt){
  if(!G.inMatch){SG.live=false;return;}
  if(!SG.live){SG.live=true;sgReset();}   // partita nuova: si ricomincia
  if(G.paused)return;
  SG.wt+=Math.min(dt,0.1);
  if(G.mode!==SG.mode){sgEvent('fase',{m:G.mode});SG.mode=G.mode;}
  const sc=(G.mode==='cine'&&typeof cine!=='undefined'&&cine)||RP.on;   // scena laterale o replay in corso
  if(SG.wt>=SG.fnext){
    SG.fnext=Math.max(SG.fnext+1/(sc?SG_FPS_CINE:SG_FPS),SG.wt);
    const img=sgImg(sc?SG_FW_CINE:SG_FW,0.6),fr={w:sgR(SG.wt),m:G.mode};
    if(G.mode==='cine'&&cine)Object.assign(fr,{ph:cine.phase,ct:sgR(cine.t),q:cine.quality||''});   // fase della scena, per ritrovare l'istante
    if(RP.on)fr.rp=RP.on.lab;
    if(img){fr.img=img;SG.film.push(fr);}
  }
  const old=SG.wt-SG_KEEP;
  while(SG.buf.length&&SG.buf[0].w<old)SG.buf.shift();
  while(SG.film.length&&SG.film[0].w<old)SG.film.shift();
  while(SG.ev.length&&SG.ev[0].w<old)SG.ev.shift();
}
// a ogni passo del motore: istantanee del gioco
function sgRecord(step){
  if(!SG.live||G.paused||SG.wt+1e-8<SG.next)return;
  SG.next=Math.max(SG.next+1/SG_HZ,SG.wt);
  const all=T[0].concat(T[1]),f=G.flight,d=G.disc,pb=G.pb||[];
  for(const p of all){const k=sgKey(p);if(!SG.pl[k])SG.pl[k]={t:p.t,n:p.label||p.name,full:p.full,pos:p.pos,role:p.role,f:p.f?1:0,s:Object.assign({},p.s)};}
  SG.buf.push({
    w:sgR(SG.wt),m:G.mode,pt:G.pointNo,sc:G.score.slice(),po:G.poss,st:sgR(G.stallT),h:sgKey(G.holder),c:sgKey(G.ctrl),
    d:[sgR(d.x),sgR(d.y),sgR(d.z)],
    f:f?{k:f.kind,hi:f.high?1:0,s:[sgR(f.sx),sgR(f.sy)],e:[sgR(f.tx),sgR(f.ty)],th:sgKey(f.thrower),to:sgKey(f.intended),p:sgR(f.T?f.t/f.T:0)}:null,
    pull:G.pull?1:0,wk:G.walk?1:0,
    pb:[0,1].map(i=>pb[i]?{id:pb[i].id,ph:pb[i].phase,sg:pb[i].stage,pr:pb[i].prep?1:0}:null),
    p:all.map(p=>[sgKey(p),sgR(p.x),sgR(p.y),sgR(p.vx),sgR(p.vy),p.dv?1:0,sgKey(p.mark),(pb[p.t]&&pb[p.t].role&&pb[p.t].role[p.id])||''])
  });
}
// scene laterali (startCine/cineResolve in 03-stacchi.js) e replay delle mete (rpCheck in 12-replay.js)
function sgCine(spec){sgEvent('scena',{kind:spec.kind,a:sgKey(spec.a),d:sgKey(spec.d),diver:sgKey(spec.diver),timing:spec.timing||spec.kind==='jump'?1:0});}
function sgCineOut(c){sgEvent('esito scena',{kind:c.spec.kind,out:c.out&&typeof c.out==='object'?JSON.stringify(c.out):String(c.out),bonus:c.bonus===undefined?null:c.bonus});}
function sgReplay(lab){sgEvent('replay',{lab});}
// immagine rimpicciolita del campo (sempre la stessa tela di appoggio)
function sgImg(wd,q){
  try{
    const c=$('c');if(!c||!c.width)return null;
    const k=Math.min(1,wd/c.width),o=SG.cv||(SG.cv=document.createElement('canvas'));
    o.width=Math.round(c.width*k);o.height=Math.round(c.height*k);
    o.getContext('2d').drawImage(c,0,0,o.width,o.height);
    return o.toDataURL('image/jpeg',q);
  }catch(e){return null;}
}
function sgBuild(){
  return {app:'ultimate-frisbee',kind:'segnalazione',v:2,quando:new Date().toISOString(),ora:new Date().toLocaleString('it-IT'),build:document.lastModified,
    schermo:[innerWidth,innerHeight],campo:{L:FIELD_L,W:FIELD_W,EZ},fine:sgR(SG.wt),
    partita:{label:G.matchLabel||'',mia:G.myName||'',avv:G.oppName||'',target:G.target,score:G.score.slice(),meta:G.pointNo,poss:G.poss,mode:G.mode,
      sch:Object.assign({},G.sch),opp:Object.assign({},G.opp),lvl:G.lvl,oppPlus:G.oppPlus,dir:G.dir,wind:G.wind,wx:G.wx||null,def:G.opt.def,cine:G.opt.cine,
      modo:G.drill?'allenamento':(QM.on?'fuori carriera':'carriera'),lega:QM.on?null:(SV.lk||null),serie:QM.on?null:(SV.sr||null)},
    giocatori:SG.pl,fr:SG.buf,ev:SG.ev,film:SG.film,foto:sgImg(SG_SHOT,0.75)};
}
// tutto si prepara subito, senza attese prima di navigator.share: sul telefono il menu Condividi deve partire dal tocco
async function sgSave(){
  if(!SG.buf.length&&!SG.film.length)return 'Niente da salvare: gioca qualche secondo e riprova.';
  const st=new Date(),z=n=>String(n).padStart(2,'0');
  const name=`segnalazione-${st.getFullYear()}${z(st.getMonth()+1)}${z(st.getDate())}-${z(st.getHours())}${z(st.getMinutes())}.json`;
  const blob=new Blob([JSON.stringify(sgBuild())],{type:'application/json'});
  // sul telefono si apre il menu Condividi (per mandarlo subito in chat), altrimenti si scarica
  try{
    const file=typeof File==='function'?new File([blob],name,{type:'application/json'}):null;
    if(file&&navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:'Segnalazione Ultimate Frisbee'});return 'File pronto: mandalo in chat con due righe su cosa è successo.';}
  }catch(e){if(e&&e.name==='AbortError')return 'Invio annullato.';}
  try{
    const a=document.createElement('a'),url=URL.createObjectURL(blob);
    a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);
    return 'Salvato nei file scaricati: mandalo in chat con due righe su cosa è successo.';
  }catch(e){return 'Salvataggio non riuscito su questo dispositivo.';}
}
const sgSay=msg=>{const o=$('paSegT');o.textContent=msg;o.classList.remove('hidden');};
$('paSeg').addEventListener('click',async()=>{sgSay('Preparo il file');sgSay(await sgSave());});
// tasto «!» in alto a sinistra: ferma la partita (se si puo': non durante salti, tuffi e replay) e salva subito
$('bSeg').addEventListener('click',async()=>{
  if(G.mode==='play'||G.mode==='ready')openPause();
  const msg=await sgSave();
  if(!$('pause').classList.contains('hidden'))sgSay(msg);else HOOKS.toast(msg.split(':')[0],0);
});

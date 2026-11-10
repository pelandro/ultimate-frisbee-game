/* ---- audio: due musiche sintetizzate (schermata iniziale e partita) e il pubblico che tifa. Nessun file: tutto generato con Web Audio ---- */
function buildAudio(c,dest){
  const mtof=m=>440*Math.pow(2,(m-69)/12),rr=(a,b)=>a+Math.random()*(b-a);
  const master=c.createGain();master.gain.value=0.9;
  const comp=c.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;comp.attack.value=0.01;comp.release.value=0.25;
  master.connect(comp);comp.connect(dest);
  const musicBus=c.createGain();musicBus.gain.value=1.5;musicBus.connect(master);
  const crowdBus=c.createGain();crowdBus.gain.value=0.9;crowdBus.connect(master);
  // rumore bianco e rumore "marrone" (piu' cupo): base del brusio del pubblico, dei piatti e degli applausi
  const NS=c.sampleRate*3,wb=c.createBuffer(1,NS,c.sampleRate),bb=c.createBuffer(1,NS,c.sampleRate),wd=wb.getChannelData(0),bd=bb.getChannelData(0);
  let lastV=0;for(let i=0;i<NS;i++){const w=Math.random()*2-1;wd[i]=w;lastV=(lastV+0.02*w)/1.02;bd[i]=lastV*8;}
  const noise=(out,t,dur,type,f,q,vol,att)=>{
    const sr=c.createBufferSource();sr.buffer=wb;const fl=c.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;
    const g=c.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+(att||0.003));g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    sr.connect(fl);fl.connect(g);g.connect(out);sr.start(t,rr(0,1.5));sr.stop(t+dur+0.05);
  };
  const tone=(out,type,f,t,a,d,vol,lp)=>{
    const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f,t);
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+a+d);
    if(lp){const fl=c.createBiquadFilter();fl.type='lowpass';fl.frequency.value=lp;o.connect(fl);fl.connect(g);}else o.connect(g);
    g.connect(out);o.start(t);o.stop(t+a+d+0.05);
  };
  const pad=(out,notes,t,dur,vol)=>{
    for(const m of notes)for(const det of [-6,6]){
      const o=c.createOscillator(),g=c.createGain(),fl=c.createBiquadFilter();o.type='triangle';o.frequency.value=mtof(m);o.detune.value=det;fl.type='lowpass';fl.frequency.value=1500;
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+0.45);g.gain.setValueAtTime(vol,t+dur-0.5);g.gain.linearRampToValueAtTime(0,t+dur);
      o.connect(fl);fl.connect(g);g.connect(out);o.start(t);o.stop(t+dur+0.05);
    }
  };
  const kick=(out,t,vol)=>{const o=c.createOscillator(),g=c.createGain();o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(42,t+0.13);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.3);o.connect(g);g.connect(out);o.start(t);o.stop(t+0.35);};
  /* ---- effetti sonori del gioco (sintetizzati): lancio, presa, blocchi, tempismo, tuffo, meta ---- */
  const sfxBus=c.createGain();sfxBus.gain.value=0.8;sfxBus.connect(master);
  const sweep=(out,t,dur,f0,f1,q,vol)=>{   // rumore filtrato che sale o scende di frequenza: sibilo del disco, tuffi
    const sr=c.createBufferSource();sr.buffer=wb;const fl=c.createBiquadFilter();fl.type='bandpass';fl.Q.value=q;
    fl.frequency.setValueAtTime(f0,t);fl.frequency.exponentialRampToValueAtTime(f1,t+dur);
    const g=c.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+dur*0.35);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    sr.connect(fl);fl.connect(g);g.connect(out);sr.start(t,rr(0,1.5));sr.stop(t+dur+0.05);
  };
  const blip=(out,type,f0,f1,t,dur,vol)=>{   // tono che scivola da f0 a f1
    const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+0.006);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g);g.connect(out);o.start(t);o.stop(t+dur+0.03);
  };
  const SFX={
    throw(t,dist,high){const d=0.16+Math.min(0.34,dist/90);sweep(sfxBus,t,d,high?500:900,high?1800:3200,1.6,0.3);blip(sfxBus,'triangle',high?260:380,high?170:250,t,0.09,0.1);},
    pull(t){sweep(sfxBus,t,0.5,350,2200,1.2,0.34);blip(sfxBus,'sine',140,70,t,0.25,0.2);},
    catch(t,p){noise(sfxBus,t,0.07,'lowpass',1400,0.7,0.35*p,0.002);blip(sfxBus,'sine',230,110,t,0.12,0.3*p);},
    slap(t){noise(sfxBus,t,0.06,'highpass',2800,0.8,0.5,0.001);blip(sfxBus,'square',420,140,t,0.08,0.16);},
    block(t){noise(sfxBus,t,0.1,'bandpass',1800,0.9,0.42,0.001);blip(sfxBus,'sawtooth',300,90,t,0.16,0.18);},
    drop(t){blip(sfxBus,'sine',170,60,t,0.2,0.38);noise(sfxBus,t,0.05,'lowpass',500,0.6,0.25,0.002);},
    dive(t){sweep(sfxBus,t,0.32,1800,300,0.9,0.38);noise(sfxBus,t+0.3,0.12,'lowpass',420,0.6,0.4,0.003);},
    tick(t,n){blip(sfxBus,'triangle',n>1?1500:1000,n>1?1500:1000,t,0.06,0.16);if(n>1)blip(sfxBus,'triangle',2000,2000,t+0.06,0.07,0.14);},
    warn(t){blip(sfxBus,'square',210,200,t,0.09,0.12);blip(sfxBus,'square',210,200,t+0.12,0.09,0.12);},
    timing(t,q){   // tempismo: verde = due note che salgono, giallo = una nota, rosso = suono sordo
      if(q>=0.6){blip(sfxBus,'triangle',880,880,t,0.1,0.22);blip(sfxBus,'triangle',1320,1320,t+0.09,0.16,0.22);}
      else if(q>=0.25)blip(sfxBus,'triangle',660,660,t,0.14,0.2);
      else blip(sfxBus,'sawtooth',150,100,t,0.16,0.14);
    },
    ui(t){blip(sfxBus,'triangle',720,720,t,0.035,0.07);},
    whistle(t){blip(sfxBus,'sine',2700,2600,t,0.35,0.12);},
    goal(t){[523,659,784,1047].forEach((f,i)=>{blip(sfxBus,'triangle',f,f,t+i*0.09,0.34,0.17);blip(sfxBus,'square',f/2,f/2,t+i*0.09,0.2,0.04);});}
  };
  const hat=(out,t,vol,open)=>noise(out,t,open?0.16:0.05,'highpass',7000,0.7,vol,0.002);
  const snare=(out,t,vol)=>{noise(out,t,0.16,'bandpass',1900,0.8,vol,0.002);tone(out,'triangle',190,t,0.002,0.09,vol*0.6);};

  /* musica della schermata iniziale: calma e luminosa, 92 bpm, do maggiore (Do, La-, Fa, Sol) */
  const HOME={bpm:92,bars:[
    {root:36,chord:[60,64,67,71],mel:[76,0,79,0,76,74,72,0]},
    {root:33,chord:[57,60,64,67],mel:[72,0,76,0,81,0,79,76]},
    {root:41,chord:[53,57,60,64],mel:[81,0,79,0,76,0,74,72]},
    {root:43,chord:[55,59,62,64],mel:[74,0,79,0,74,0,76,74]},
    {root:36,chord:[60,64,67,71],mel:[79,0,76,0,72,0,76,79]},
    {root:33,chord:[57,60,64,67],mel:[81,0,79,76,72,0,74,76]},
    {root:41,chord:[53,57,60,64],mel:[84,0,81,0,79,0,76,74]},
    {root:43,chord:[55,59,62,64],mel:[74,76,74,0,71,0,67,0]}]};
  function homeStep(out,echo,i,t,sd,bar){
    if(i===0)pad(out,bar.chord.map(m=>m-12),t,sd*8,0.032);
    if(i===0||i===4){tone(out,'sine',mtof(bar.root),t,0.01,sd*3.3,0.17,500);tone(out,'triangle',mtof(bar.root+12),t,0.01,sd*2,0.03,700);}
    if(i%2===1)tone(out,'triangle',mtof(bar.chord[(i>>1)%4]),t,0.004,sd*1.4,0.03,2500);
    if(bar.mel[i]){const f=mtof(bar.mel[i]);tone(out,'triangle',f,t,0.006,sd*2.6,0.075,3200);tone(echo,'triangle',f,t,0.006,sd*2.6,0.05,3200);}
    if(i===0||i===4)kick(out,t,0.13);
    if(i%2===1)hat(out,t,0.018,false);
  }
  /* musica della partita: piu' tesa e veloce, 126 bpm, la minore (La-, Fa, Do, Sol, ..., Mi7) con basso pulsante e batteria */
  const MATCH={bpm:126,bars:[
    {root:45,chord:[57,60,64],lead:[76,0,76,74,72,0,69,0]},
    {root:41,chord:[53,57,60],lead:[77,0,77,76,72,0,69,0]},
    {root:48,chord:[55,60,64],lead:[72,0,76,0,79,0,76,72]},
    {root:43,chord:[55,59,62],lead:[74,0,74,76,79,0,74,71]},
    {root:45,chord:[57,60,64],lead:[81,0,81,79,76,0,72,0]},
    {root:41,chord:[53,57,60],lead:[81,0,81,79,77,0,72,0]},
    {root:43,chord:[55,59,62],lead:[79,0,79,76,74,0,71,74]},
    {root:40,chord:[56,59,62,64],lead:[76,0,80,0,83,0,80,76]}]};
  function matchStep(out,echo,i,t,sd,bar){
    if(i%2===0)kick(out,t,0.22);
    if(i===2||i===6)snare(out,t,0.09);
    hat(out,t,i%2?0.035:0.018,i%2===1);
    tone(out,'sawtooth',mtof(bar.root+((i===3||i===7)?12:0)),t,0.004,sd*0.8,0.11,520);
    if(i===3||i===7)for(const m of bar.chord)tone(out,'sawtooth',mtof(m),t,0.004,sd*0.7,0.03,2200);
    if(bar.lead[i]){const f=mtof(bar.lead[i]);tone(out,'square',f,t,0.005,sd*1.5,0.045,3400);tone(echo,'square',f,t,0.005,sd*1.5,0.03,3000);}
  }
  function makeScene(def,stepFn,vol){
    const out=c.createGain();out.gain.value=0;out.connect(musicBus);
    const sd=60/def.bpm/2,echo=c.createDelay(1.5),fb=c.createGain(),elp=c.createBiquadFilter();
    echo.delayTime.value=sd*3;fb.gain.value=0.3;elp.type='lowpass';elp.frequency.value=2200;echo.connect(elp);elp.connect(fb);fb.connect(echo);elp.connect(out);
    let next=null,step=0;
    return {
      start(t){out.gain.cancelScheduledValues(t);out.gain.setValueAtTime(0,t);out.gain.linearRampToValueAtTime(vol,t+1.2);next=t+0.1;step=0;},
      stop(t){out.gain.cancelScheduledValues(t);out.gain.setValueAtTime(out.gain.value,t);out.gain.linearRampToValueAtTime(0,t+0.8);next=null;},
      schedule(until,now){
        if(next===null)return;if(now&&next<now)next=now+0.05;     // dopo una pausa non recupera le note perse
        while(next<until){stepFn(out,echo,step%8,next,sd,def.bars[Math.floor(step/8)%def.bars.length]);step++;next+=sd;}
      }
    };
  }
  /* pubblico: brusio continuo, applausi ritmati ogni tanto e cori ("aaah" quando si segna, "ooh" quando va male) */
  const crowd={on:false,nodes:[],gain:null,nextClap:0};
  function crowdStart(t){
    if(crowd.on)return;crowd.on=true;
    const g=c.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(1,t+2);g.connect(crowdBus);crowd.gain=g;
    const layer=(buf,type,f,q,vol,lfoHz,depth)=>{
      const sr=c.createBufferSource();sr.buffer=buf;sr.loop=true;const fl=c.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;
      const v=c.createGain();v.gain.value=vol;sr.connect(fl);fl.connect(v);v.connect(g);sr.start(t,rr(0,2));
      const lfo=c.createOscillator(),ld=c.createGain();lfo.frequency.value=lfoHz;ld.gain.value=depth;lfo.connect(ld);ld.connect(v.gain);lfo.start(t);
      crowd.nodes.push(sr,lfo);
    };
    layer(bb,'bandpass',650,0.6,0.05,0.13,0.02);
    layer(wb,'bandpass',1500,0.8,0.007,0.21,0.004);
    layer(bb,'lowpass',250,0.5,0.018,0.07,0.006);
    crowd.nextClap=t+rr(4,9);
  }
  function crowdStop(t){
    if(!crowd.on)return;crowd.on=false;const g=crowd.gain,ns=crowd.nodes;crowd.nodes=[];
    g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(g.gain.value,t);g.gain.linearRampToValueAtTime(0,t+1);
    for(const n of ns){try{n.stop(t+1.1);}catch(e){}}
  }
  const clap=(t,vol)=>{for(let k=0;k<3;k++)noise(crowdBus,t+rr(0,0.025),0.07,'bandpass',rr(1500,2600),0.9,vol*rr(0.6,1),0.002);};
  function clapTrain(t,n,gap,vol){for(let i=0;i<n;i++)clap(t+i*gap+rr(-0.012,0.012),vol*rr(0.7,1));}
  function chant(t){const u=0.42;[0,1,2,2.5,3].forEach(k=>clap(t+k*u+rr(-0.01,0.01),0.05));[5,6,7,7.5,8].forEach(k=>clap(t+k*u+rr(-0.01,0.01),0.05));}
  function voices(t,dur,vol,f0,glide,F1,F2,count){
    const bus=c.createGain();bus.gain.setValueAtTime(0.0001,t);bus.gain.exponentialRampToValueAtTime(vol,t+0.25);bus.gain.setValueAtTime(vol,t+dur*0.45);bus.gain.exponentialRampToValueAtTime(0.0001,t+dur);bus.connect(crowdBus);
    const f1=c.createBiquadFilter(),f2=c.createBiquadFilter(),g2=c.createGain();f1.type=f2.type='bandpass';f1.frequency.value=F1;f2.frequency.value=F2;f1.Q.value=f2.Q.value=4;g2.gain.value=0.6;
    f1.connect(bus);f2.connect(g2);g2.connect(bus);
    for(let i=0;i<count;i++){
      const o=c.createOscillator(),f=f0*rr(0.9,1.12);o.type='sawtooth';o.frequency.setValueAtTime(f,t);o.frequency.linearRampToValueAtTime(f*glide,t+dur*0.6);
      const lfo=c.createOscillator(),ld=c.createGain();lfo.frequency.value=rr(4.5,6.5);ld.gain.value=f*0.012;lfo.connect(ld);ld.connect(o.frequency);lfo.start(t);lfo.stop(t+dur+0.1);
      o.connect(f1);o.connect(f2);o.start(t);o.stop(t+dur+0.1);
    }
  }
  function swell(t,dur,vol,f){noise(crowdBus,t,dur,'bandpass',f,0.5,vol,0.35);}
  function cheer(t,power){            // "aaah" di gioia e applauso
    swell(t,1.6+1.6*power,0.6*power,1300);
    voices(t,1.2+1.4*power,0.16*power,rr(170,200),1.15,750,1150,8);
    clapTrain(t+0.25,Math.round(6+10*power),0.11,0.1*power);
  }
  function groan(t,power){            // "ooooh" di delusione
    swell(t,1.4,0.3*power,900);
    voices(t,1.5,0.13*power,rr(190,215),0.8,500,850,7);
  }
  function tickCrowd(until){while(crowd.on&&crowd.nextClap<until){chant(crowd.nextClap);crowd.nextClap+=rr(10,18);}}
  return {sfx:SFX,master,musicBus,crowdBus,scenes:{home:makeScene(HOME,homeStep,0.6),match:makeScene(MATCH,matchStep,1.0)},crowdStart,crowdStop,tickCrowd,cheer,groan,clapTrain,chant};
}
const AUD=(function(){
  let A=null,eng=null,on=true,cur='none',lastSfx=-9;
  try{on=localStorage.getItem('ultimate-audio')!=='0';}catch(e){}
  function tick(){
    if(!A||!eng||!on||A.state!=='running')return;
    const now=A.currentTime,until=now+1.0,sc=eng.scenes[cur];
    if(sc)sc.schedule(until,now);
    eng.tickCrowd(until);
  }
  function init(){   // il browser consente l'audio solo dopo un gesto: parte al primo tocco
    if(A){if(A.state==='suspended')A.resume();return;}
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
    try{A=new AC();eng=buildAudio(A,A.destination);eng.master.gain.value=on?0.9:0;setInterval(tick,60);if(A.resume)A.resume();}catch(e){A=null;eng=null;}
    cur='none';
  }
  function sync(name){
    if(!A||!eng||name===cur)return;
    const t=A.currentTime;
    if(eng.scenes[cur])eng.scenes[cur].stop(t);
    cur=name;eng.scenes[name].start(t);
    if(name==='match')eng.crowdStart(t);else eng.crowdStop(t);
  }
  function sfx(type,a,b){
    if(!A||!eng||!on||A.state!=='running')return;
    if(type==='ui'){eng.sfx.ui(A.currentTime);return;}   // i clic dei menu suonano anche fuori partita
    if(cur!=='match')return;
    const t=A.currentTime+0.02;
    if(type==='goal'){eng.sfx.goal(t);if(a===0)eng.cheer(t,1);else eng.groan(t,0.9);}   // a = squadra che segna
    else if(type==='turn'){if(t-lastSfx<2)return;lastSfx=t;if(a===0)eng.cheer(t,0.28);else eng.groan(t,0.4);}
    else if(eng.sfx[type])eng.sfx[type](t,a,b);
  }
  function setOn(v){
    on=!!v;try{localStorage.setItem('ultimate-audio',on?'1':'0');}catch(e){}
    if(eng)eng.master.gain.setTargetAtTime(on?0.9:0,A.currentTime,0.08);
    syncToggles();
  }
  // pagina nascosta o chiusa (browser chiuso, altra app, altra scheda): la musica si ferma subito; torna da sola se si rientra e l'audio e' acceso
  function hold(){try{if(A&&A.state==='running')A.suspend().catch(()=>{});}catch(e){}}
  function back(){try{if(A&&on&&!document.hidden&&A.state!=='running'&&A.state!=='closed')A.resume().catch(()=>{});}catch(e){}}
  function close(){try{if(A&&A.state!=='closed')A.close().catch(()=>{});}catch(e){}A=null;eng=null;}
  return {init,sync,sfx,setOn,hold,back,close,isOn:()=>on};
})();
window.addEventListener('pointerdown',()=>AUD.init(),{capture:true});
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('button'))AUD.sfx('ui');},true);
window.addEventListener('keydown',()=>AUD.init(),{capture:true});
for(const id of ['tSnd','sSnd','opSnd','paSnd'])$(id).addEventListener('click',()=>AUD.setOn(!AUD.isOn()));
for(const id of ['sCine','opCine','paCine'])$(id).addEventListener('click',()=>{G.opt.cine=!G.opt.cine;try{localStorage.setItem('ultimate-stacchi',G.opt.cine?'1':'0');}catch(e){}syncToggles();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)AUD.hold();else AUD.back();});
window.addEventListener('pagehide',e=>{AUD.hold();if(!e.persisted)AUD.close();});
window.addEventListener('pageshow',()=>AUD.back());
try{if(localStorage.getItem('ultimate-stacchi')==='0')G.opt.cine=false;}catch(e){}
function syncToggles(){   // audio e stacchi laterali si cambiano da piu' punti (menu, impostazioni, opzioni, pausa): le etichette restano allineate
  const on=AUD.isOn(),c=G.opt.cine;
  $('tSnd').classList.toggle('off',!on);$('tSndT').textContent=on?'Audio sì':'Audio no';
  $('sSndS').textContent=on?'Acceso: musica, tifo ed effetti':'Spento';$('sCineS').textContent=c?'Accesi: salti e tuffi visti di lato':'Spenti';
  for(const id of ['opSnd','paSnd'])$(id).textContent='Audio: '+(on?'sì':'no');
  for(const id of ['opCine','paCine'])$(id).textContent='Stacchi laterali: '+(c?'sì':'no');
}
syncToggles();
HOOKS.sfx=(k,a,b)=>AUD.sfx(k,a,b);
function syncCall(){
  const h=G.holder;syncAimPoint();
  if(pdrag&&pdrag.sl&&pdrag.warn&&pullState(pdrag).c<=PULL_TH-0.04)pdrag.warn=0;
  if(pdrag&&pdrag.btn&&!pdrag.warn&&pullState(pdrag).c>PULL_TH){pdrag.warn=1;HOOKS.vibe(22);HOOKS.sfx('warn');}   // pull: troppo carico, finisce fuori
  if(drag&&G.mode==='play'&&h&&h.t===0&&!G.flight&&G.freeze<=0){const w=toWorld(drag.x,drag.y);updateCall(h,w.x,w.y,G.high);}
  else if(G.call)endCall();
}
function frame(now){
  const dt=Math.min(0.05,Math.max(0,(now-last)/1000));last=now;
  AUD.sync(G.inMatch&&G.mode!=='over'?'match':'home');
  if(!portrait()){
    G.tick+=dt;
    padPoll();vinPushDir();
    if(inDefense()&&!ddrag)G.cdir=VIN.ang!==null?{x:Math.cos(VIN.ang),y:Math.sin(VIN.ang)}:null;   // tastiera o stick: guida il difensore cerchiato
    if(drag&&drag.sl&&!drag.was&&!drag.iso&&G.tick-drag.s>0.5){drag.iso=true;quickCall(drag.tw,true);}   // pressione lunga su un compagno: isolamento
    syncCall();
    // con il disco in mano e lo zoom che sta cambiando l'azione aspetta: riparte quando lo zoom ha finito
    const zoomWait=G.mode==='play'&&!!G.holder&&!G.pull&&!G.flight&&(cam.zP<1||Math.abs(zoomTarget()-cam.zTo)>0.001);
    G.zoomHold=zoomWait;
    if(G.paused){}else if(G.mode==='cine')updateCine(dt);else if(!zoomWait)update(dt);
    updateCamera(dt);
    updateHUD(dt);
    render(dt);
    updTest();
  }
  requestAnimationFrame(frame);
}
window.addEventListener('resize',resize);
if(document.fonts&&document.fonts.load)for(const f of Object.values(PFONT))document.fonts.load(f.split(',')[0]).catch(()=>{});   // i font a pixel del campo si caricano subito
resize();
const hasSave=loadSave();
startPoint(G.nextRec);cam.snap=true;
showScreen('title');
requestAnimationFrame(frame);
})();

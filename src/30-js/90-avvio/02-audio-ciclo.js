/* ---- audio: tre musiche sintetizzate (schermata iniziale, partita e la canzoncina della festa del titolo) e il pubblico che tifa (brusio, cori, applausi in lontananza, trombette). Nessun file: tutto generato con Web Audio ---- */
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
    poof(t,on){noise(sfxBus,t,on?0.45:0.25,'lowpass',on?900:1300,0.7,on?0.55:0.3,0.004);blip(sfxBus,'sine',on?160:220,on?50:90,t,on?0.3:0.16,on?0.32:0.16);if(on)sweep(sfxBus,t+0.04,0.3,2400,600,1,0.12);},   // bomba di fumo dei superpoteri
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
  /* musica della partita: arcade morbido, adatto al sottofondo. 112 bpm, fa maggiore (Fa, Re-, Sib, Do): arpeggio triangolare filtrato,
     basso rotondo, batteria leggera e una melodia a domanda e risposta solo nella seconda meta' del giro (prima era a 126 bpm con dente di sega e
     melodia continua: stancava) */
  const soft=(out,t,vol)=>{const o=c.createOscillator(),g=c.createGain();o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(45,t+0.12);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.25);o.connect(g);g.connect(out);o.start(t);o.stop(t+0.3);};
  const brush=(out,t,vol)=>noise(out,t,0.22,'bandpass',2600,0.5,vol,0.02);
  const MATCH={bpm:112,bars:[
    {root:41,chord:[65,69,72],mel:[]},{root:38,chord:[62,65,69],mel:[]},{root:46,chord:[62,65,70],mel:[]},{root:48,chord:[64,67,72],mel:[]},
    {root:41,chord:[65,69,72],mel:[77,0,76,0,74,0,72,0]},{root:38,chord:[62,65,69],mel:[74,0,0,0,69,0,0,0]},{root:46,chord:[62,65,70],mel:[70,0,72,0,74,0,77,0]},{root:48,chord:[64,67,72],mel:[76,0,0,0,0,0,0,0]}]};
  function matchStep(out,echo,i,t,sd,bar){
    tone(out,'triangle',mtof(bar.chord[i%3]+(i>=4?12:0)),t,0.003,sd*0.8,0.022,2000);
    if(i%2===0)tone(out,'triangle',mtof(bar.root+(i===4?12:0)),t,0.005,sd*1.2,0.11,650);
    if(i===0||i===4)soft(out,t,0.13);
    if(i===4)brush(out,t,0.04);
    if(i%2===1)hat(out,t,0.008,false);
    const m=bar.mel[i];if(m){tone(out,'square',mtof(m),t,0.008,sd*1.8,0.022,1500);tone(echo,'square',mtof(m),t,0.008,sd*1.8,0.016,1300);}
  }
  /* ---- la canzoncina della vittoria (festa del titolo, 50-schermate/32-alza-coppa.js) ----
     Va al tempo del balletto: una croma = CUP_BEAT (0,24 s, 125 bpm). Rullo di tamburi mentre il capitano si carica; quando la coppa arriva
     in alto (CUP_LIFT) il colpo pieno: cassa, piatto, accordo di ottoni, boato e la trombetta della curva; due note di attacco e poi il giro
     di 8 battute in do maggiore, da capo finche' la festa resta aperta: cassa in quattro, basso a ottave, accordi in levare, melodia quadra con l'eco.
     Ogni due battute (passo 14 di 16, quando nel balletto saltano tutti) la squadra grida «Ehi!» con il battimani. */
  const FESTA_LEAD=0.08;   // margine per programmare le prime note
  const FESTA=[
    {root:36,chord:[60,64,67],mel:[72,0,76,79,0,79,81,79]},
    {root:41,chord:[60,65,69],mel:[77,0,81,0,79,0,0,0]},
    {root:43,chord:[59,62,67],mel:[74,0,79,0,79,77,76,74]},
    {root:36,chord:[60,64,67],mel:[76,0,72,0,74,0,0,0]},
    {root:45,chord:[60,64,69],mel:[81,0,84,0,83,81,79,0]},
    {root:41,chord:[60,65,69],mel:[77,0,81,0,79,0,0,0]},
    {root:43,chord:[59,62,67],mel:[79,79,81,79,77,76,74,71]},
    {root:36,chord:[60,64,67],mel:[72,0,76,0,72,0,0,0]}];
  const hey=(t,fem)=>{noise(crowdBus,t,0.06,'highpass',2500,0.7,0.07,0.002);voices(t,0.32,0.2,fem?rr(290,320):rr(175,200),0.88,fem?800:650,fem?2100:1850,7);clap(t+0.01,0.12);};   // «Ehi!»: voci piu' acute per le squadre femminili
  const brass=(out,notes,t,dur,vol)=>{for(const m of notes){tone(out,'sawtooth',mtof(m),t,0.02,dur,vol,2400);tone(out,'square',mtof(m)*1.003,t,0.02,dur*0.8,vol*0.5,1800);}};
  function festaIntro(out,t,lift,sd){
    for(let u=0;u<lift-0.05;u+=0.04)snare(out,t+u,0.015+0.1*Math.pow(u/lift,1.6));   // rullo che cresce
    sweep(out,t,lift,300,3600,1.1,0.08);kick(out,t,0.12);   // e un fruscio che sale
    const h=t+lift;
    kick(out,h,0.2);noise(out,h,1.8,'highpass',5200,0.6,0.14,0.003);   // la coppa in alto: cassa e piatto
    brass(out,[60,64,67,72],h,1.0,0.03);tone(out,'triangle',mtof(36),h,0.01,1.0,0.16,600);tone(out,'square',mtof(84),h,0.01,0.4,0.05,2600);
    tone(out,'square',mtof(67),h+sd,0.006,sd*0.45,0.05,2600);tone(out,'square',mtof(71),h+sd*1.5,0.006,sd*0.45,0.05,2600);   // le due note che portano al giro
    cheer(h,0.8);applause(h+0.4,0.8);horn(h+0.25,'carica',0.9);
  }
  function festaStep(out,echo,i,t,sd,bar,s){
    if(i%2===0)kick(out,t,0.15);
    if(i===2||i===6)snare(out,t,0.06);
    if(i%2===1)hat(out,t,i===7?0.035:0.025,i===7);
    tone(out,'triangle',mtof(bar.root+(i%2?12:0)),t,0.005,sd*0.9,0.12,750);   // basso a ottave
    if(i===1||i===5)for(const m of bar.chord)tone(out,'square',mtof(m),t,0.004,sd*0.5,0.016,2200);   // accordi in levare
    if(i===0&&s%64===0)noise(out,t,1.3,'highpass',6000,0.6,0.1,0.003);   // piatto a inizio giro
    const m=bar.mel[i];
    if(m){tone(out,'square',mtof(m),t,0.006,sd*1.5,0.045,2800);tone(out,'triangle',mtof(m-12),t,0.006,sd*1.5,0.03,1500);tone(echo,'square',mtof(m),t,0.006,sd*1.5,0.025,2400);}
    if(s%16===14)hey(t,!!(cup&&cup.fem));
  }
  function makeFesta(vol){
    const out=c.createGain();out.gain.value=0;out.connect(musicBus);
    const sd=CUP_BEAT,echo=c.createDelay(1.5),fb=c.createGain(),elp=c.createBiquadFilter();
    echo.delayTime.value=sd*3;fb.gain.value=0.25;elp.type='lowpass';elp.frequency.value=2400;echo.connect(elp);elp.connect(fb);fb.connect(echo);elp.connect(out);
    let next=null,step=0,t0=null;
    return {
      start(t){out.gain.cancelScheduledValues(t);out.gain.setValueAtTime(vol,t);t0=t+FESTA_LEAD;festaIntro(out,t0,CUP_LIFT,sd);next=t0+CUP_DANCE;step=0;},
      stop(t){out.gain.cancelScheduledValues(t);out.gain.setValueAtTime(out.gain.value,t);out.gain.linearRampToValueAtTime(0,t+0.8);next=null;},
      schedule(until,now){
        if(next===null)return;
        if(now&&next<now-0.02){const k=Math.ceil((now-next)/sd);next+=k*sd;step+=k;}   // dopo una pausa salta avanti, sempre a tempo con il balletto
        while(next<until){festaStep(out,echo,step%8,next,sd,FESTA[Math.floor(step/8)%FESTA.length],step);step++;next+=sd;}
      },
      t0:()=>t0
    };
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
  const crowd={on:false,nodes:[],gain:null,nextClap:0,nextAmb:0};
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
    crowd.nextClap=t+rr(4,9);crowd.nextAmb=t+rr(8,16);
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
  /* applausi leggeri in lontananza: tanti battiti di mani sparsi, smorzati e distribuiti a destra e a sinistra (il pubblico intorno al campo) */
  function applause(t,power){
    const n=Math.round(18+40*power),dur=1.2+2.2*power,bus=c.createGain(),lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2300;bus.gain.value=0.9;lp.connect(bus);bus.connect(crowdBus);
    for(let i=0;i<n;i++){
      const k=Math.pow(Math.random(),0.7),at=t+k*dur,v=0.05*power*(1-k*0.75)*rr(0.5,1);   // piu' fitti all'inizio, poi si spengono
      const pn=c.createStereoPanner?c.createStereoPanner():null;
      if(pn){pn.pan.value=rr(-0.8,0.8);pn.connect(lp);}
      noise(pn||lp,at,0.06,'bandpass',rr(1200,2400),0.8,v,0.002);
    }
  }
  /* trombette da stadio: tromba di plastica nasale (dente di sega e quadra filtrati, un po' di vibrato), lontana e con l'eco della curva.
     'blast' = una suonata lunga, 'doppia' = due brevi, 'carica' = la fanfara «ta-ta-ta-taaa, ta-taaa» */
  const hornOut=c.createGain(),hornEcho=c.createDelay(1),hornFb=c.createGain(),hornLp=c.createBiquadFilter();
  hornOut.gain.value=0.55;hornLp.type='lowpass';hornLp.frequency.value=3200;hornEcho.delayTime.value=0.23;hornFb.gain.value=0.28;
  hornLp.connect(hornOut);hornOut.connect(crowdBus);hornOut.connect(hornEcho);hornEcho.connect(hornFb);hornFb.connect(hornEcho);hornFb.connect(crowdBus);
  function hornNote(t,f,dur,vol,pan){
    const g=c.createGain(),bp=c.createBiquadFilter(),bp2=c.createBiquadFilter(),pn=c.createStereoPanner?c.createStereoPanner():null;
    bp.type='bandpass';bp.frequency.value=1150;bp.Q.value=1.4;bp2.type='bandpass';bp2.frequency.value=2600;bp2.Q.value=2;
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+0.025);g.gain.setValueAtTime(vol,t+dur*0.8);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    for(const [type,mul,v] of [['sawtooth',1,1],['square',1.005,0.5]]){
      const o=c.createOscillator(),og=c.createGain();o.type=type;o.frequency.setValueAtTime(f*mul*0.97,t);o.frequency.linearRampToValueAtTime(f*mul,t+0.04);o.frequency.setValueAtTime(f*mul,t+dur*0.75);o.frequency.linearRampToValueAtTime(f*mul*0.94,t+dur);   // attacco che sale, coda che cala
      const lfo=c.createOscillator(),ld=c.createGain();lfo.frequency.value=rr(5,7);ld.gain.value=f*0.008;lfo.connect(ld);ld.connect(o.frequency);
      og.gain.value=v;o.connect(og);og.connect(bp);og.connect(bp2);o.start(t);o.stop(t+dur+0.05);lfo.start(t);lfo.stop(t+dur+0.05);
    }
    bp.connect(g);bp2.connect(g);if(pn){pn.pan.value=pan;g.connect(pn);pn.connect(hornLp);}else g.connect(hornLp);
  }
  function horn(t,kind,vol){
    const v=0.22*(vol||1),pan=rr(-0.6,0.6),f0=rr(0.96,1.04)*392;   // sol, intonato un po' a caso: ogni tifoso ha la sua trombetta
    if(kind==='carica'){[[0,1,0.14],[0.16,4/3,0.14],[0.32,5/3,0.14],[0.48,2,0.34],[0.9,5/3,0.14],[1.06,2,0.6]].forEach(([d,m,l])=>hornNote(t+d,f0*m,l,v,pan));}
    else if(kind==='doppia'){hornNote(t,f0*1.5,0.22,v,pan);hornNote(t+0.3,f0*1.5,0.5,v,pan);}
    else hornNote(t,f0*rr(0.9,1.2),rr(0.9,1.4),v,pan);
  }
  function tickCrowd(until){
    while(crowd.on&&crowd.nextClap<until){chant(crowd.nextClap);crowd.nextClap+=rr(10,18);}
    while(crowd.on&&crowd.nextAmb<until){const t=crowd.nextAmb;if(Math.random()<0.6)applause(t,rr(0.12,0.22));else horn(t,'blast',rr(0.25,0.4));crowd.nextAmb+=rr(18,35);}   // ogni tanto, piano: qualcuno applaude o suona la trombetta in curva
  }
  return {sfx:SFX,master,musicBus,crowdBus,scenes:{home:makeScene(HOME,homeStep,0.6),match:makeScene(MATCH,matchStep,1.5),festa:makeFesta(1.3)},crowdStart,crowdStop,tickCrowd,cheer,groan,clapTrain,chant,applause,horn};
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
    if(name==='match'||name==='festa')eng.crowdStart(t);else eng.crowdStop(t);
  }
  // la festa del titolo: la canzoncina riparte sempre dall'inizio, anche se era gia' aperta (true = partita)
  function festa(){
    if(!A||!eng)return false;
    const t=A.currentTime;
    if(eng.scenes[cur])eng.scenes[cur].stop(t);
    cur='festa';eng.scenes.festa.start(t);eng.crowdStart(t);
    return true;
  }
  // secondi dall'inizio della canzoncina, come li sente chi gioca: il balletto li segue per restare a tempo (null senza audio)
  function festaT(){
    if(!A||!eng||!on||A.state!=='running'||cur!=='festa')return null;
    const t0=eng.scenes.festa.t0();
    return t0===null?null:A.currentTime-(A.outputLatency||A.baseLatency||0)-t0;
  }
  function sfx(type,a,b){
    if(!A||!eng||!on||A.state!=='running')return;
    if(type==='ui'){eng.sfx.ui(A.currentTime);return;}   // i clic dei menu suonano anche fuori partita
    if(cur!=='match')return;
    const t=A.currentTime+0.02;
    if(type==='goal'){eng.sfx.goal(t);if(a===0){eng.cheer(t,1);eng.applause(t+0.6,0.8);hornAt(t+0.4,Math.random()<0.6?'carica':'doppia',1);}else eng.groan(t,0.9);}   // a = squadra che segna
    else if(type==='turn'){if(t-lastSfx<2)return;lastSfx=t;if(a===0)eng.cheer(t,0.28);else eng.groan(t,0.4);}
    else if(type==='crowd'){eng.cheer(t,a||0.5);if((a||0)>=0.6)hornAt(t+0.3,'blast',0.8);}   // boato del pubblico nei momenti decisivi (a = intensita')
    else if(type==='catch'||type==='block'){eng.sfx[type](t,a,b);if(type==='block'||a>=1){eng.applause(t+0.15,type==='block'?0.45:0.6);if(Math.random()<0.35)hornAt(t+0.5,'doppia',0.8);}}   // prese in salto o in tuffo e blocchi: applauso leggero e a volte la trombetta
    else if(eng.sfx[type])eng.sfx[type](t,a,b);
  }
  let lastHorn=-9;   // le trombette non si accavallano: al massimo una ogni 5 secondi
  function hornAt(t,kind,vol){if(t-lastHorn<5)return;lastHorn=t;eng.horn(t,kind,vol);}
  function setOn(v){
    on=!!v;try{localStorage.setItem('ultimate-audio',on?'1':'0');}catch(e){}
    if(eng)eng.master.gain.setTargetAtTime(on?0.9:0,A.currentTime,0.08);
    syncToggles();
  }
  // pagina nascosta o chiusa (browser chiuso, altra app, altra scheda): la musica si ferma subito; torna da sola se si rientra e l'audio e' acceso
  function hold(){try{if(A&&A.state==='running')A.suspend().catch(()=>{});}catch(e){}}
  function back(){try{if(A&&on&&!document.hidden&&A.state!=='running'&&A.state!=='closed')A.resume().catch(()=>{});}catch(e){}}
  function close(){try{if(A&&A.state!=='closed')A.close().catch(()=>{});}catch(e){}A=null;eng=null;}
  return {init,sync,sfx,setOn,hold,back,close,festa,festaT,isOn:()=>on};
})();
window.addEventListener('pointerdown',()=>AUD.init(),{capture:true});
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('button'))AUD.sfx('ui');},true);
window.addEventListener('keydown',()=>AUD.init(),{capture:true});
for(const id of ['tSnd','sSnd','paSnd'])$(id).addEventListener('click',()=>AUD.setOn(!AUD.isOn()));
$('sRot').addEventListener('click',()=>{setRotPref(!rotPref);syncToggles();});
$('sTips').addEventListener('click',()=>{const on=!tipsOn();try{localStorage.setItem('ultimate-suggerimenti',on?'1':'0');}catch(e){}if(on&&SV&&SV.tips)SV.tips={};if(on)ppReset();syncToggles();});   // riaccesi, i fumetti si rivedono tutti
for(const id of ['sWind'])$(id).addEventListener('click',()=>{setWindOn(G.opt.wind===false);syncToggles();if(!$('home').classList.contains('hidden'))renderHome();});
$('paDef').addEventListener('click',()=>{setDefMode((G.opt.def+1)%3);syncToggles();});   // in pausa un tocco passa alla modalita' successiva
$('sDefSeg').addEventListener('click',e=>{const b=e.target.closest('[data-def]');if(!b)return;setDefMode(+b.dataset.def);syncToggles();});   // nelle Impostazioni le tre modalita' si vedono tutte
for(const id of ['sCine','paCine'])$(id).addEventListener('click',()=>{G.opt.cine=!G.opt.cine;try{localStorage.setItem('ultimate-stacchi',G.opt.cine?'1':'0');}catch(e){}syncToggles();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)AUD.hold();else AUD.back();});
window.addEventListener('pagehide',e=>{AUD.hold();if(!e.persisted)AUD.close();});
window.addEventListener('pageshow',()=>AUD.back());
try{if(localStorage.getItem('ultimate-stacchi')==='0')G.opt.cine=false;}catch(e){}
try{const d=+localStorage.getItem(DEF_KEY);if(d===1||d===2)G.opt.def=d;}catch(e){}
try{if(localStorage.getItem(WIND_KEY)==='0')G.opt.wind=false;}catch(e){}
function syncToggles(){   // audio, stacchi, meteo, difesa e suggerimenti si cambiano da piu' punti (menu, Impostazioni, pausa): stati ed etichette restano allineati
  const on=AUD.isOn(),c=G.opt.cine,wOn=G.opt.wind!==false,tp=tipsOn(),fs=fsOn();
  const sw=(id,v,txt)=>{const b=$(id);if(!b)return;b.setAttribute('aria-checked',String(!!v));b.classList.toggle('on',!!v);if(txt!==undefined){const s=b.querySelector('small');if(s)s.textContent=txt;}};
  $('tSnd').classList.toggle('off',!on);$('tSndT').textContent=on?'Audio sì':'Audio no';
  sw('sSnd',on,on?'Musica, tifo ed effetti':'Spento');
  sw('sCine',c,c?'Primo piano con tocco a tempo sui salti e sui tuffi, replay delle mete spettacolari':'Spento: salti e tuffi si risolvono da soli');
  sw('sWind',wOn,wOn?'Vento, pioggia e neve a ogni partita':'Sempre sereno e calmo');
  sw('sTips',tp,tp?'Fumetti alla prima visita delle schermate e Primi passi nelle prime partite':'Spenti: riaccendendoli si rivedono tutti');
  sw('sRot',rotPref,rotPref?'In verticale il gioco si gira da solo':'In verticale compare «Gira lo schermo»');
  sw('sFs',fs);
  $('paSnd').classList.toggle('off',!on);$('paCine').classList.toggle('off',!c);   // nella pausa l'interruttore mostra anche lo stato con il colore
  $('paSnd').textContent='Audio: '+(on?'sì':'no');$('paCine').textContent='Salti, tuffi e replay: '+(c?'sì':'no');
  $('paFs').textContent='Schermo intero: '+(fs?'sì':'no');$('paFs').classList.toggle('off',!fs);
  $('paDef').textContent='Difesa: '+DEF_LBL[G.opt.def].toLowerCase();
  $('sDefS').textContent=DEF_LBL[G.opt.def]+': '+DEF_TXT[G.opt.def];
  $('sDefSeg').innerHTML=DEF_LBL.map((n,i)=>`<button type="button" class="sg${G.opt.def===i?' on':''}" data-def="${i}" aria-pressed="${G.opt.def===i}">${n}</button>`).join('');
}
syncToggles();
HOOKS.sfx=(k,a,b)=>AUD.sfx(k,a,b);
function syncCall(){
  const h=G.holder;syncAimPoint();
  if(drag&&G.mode==='play'&&h&&h.t===0&&!G.flight&&G.freeze<=0){const w=toWorld(drag.x,drag.y);updateCall(h,w.x,w.y,G.high);}
  else if(G.call)endCall();
}
let simRemainder=0,menuDrawElapsed=0;
function frame(now){
  const dt=Math.min(0.05,Math.max(0,(now-last)/1000));last=now;
  AUD.sync(cup?'festa':(G.inMatch&&G.mode!=='over'?'match':'home'));   // cup: la festa del titolo e' aperta (32-alza-coppa.js)
  if(!portrait()||rotOn){   // in verticale il gioco si ferma, tranne quando si disegna ruotato da solo
    G.tick+=dt;
    padPoll();vinPushDir();
    pullTick();defTick();momentTick();ppTick();
    if(inDefense()&&!ddrag&&defMan())G.cdir=VIN.ang!==null?{x:Math.cos(VIN.ang),y:Math.sin(VIN.ang)}:null;   // tastiera o stick: guida il difensore cerchiato
    if(drag&&drag.sl&&!drag.was&&!drag.iso&&G.tick-drag.s>0.5){drag.iso=true;quickCall(drag.tw,true);}   // pressione lunga su un compagno: isolamento
    syncCall();
    // con il disco in mano e lo zoom che sta cambiando l'azione aspetta: riparte quando lo zoom ha finito
    const zoomWait=G.mode==='play'&&!!G.holder&&!G.pull&&!G.flight&&(cam.zP<1||Math.abs(zoomTarget()-cam.zTo)>0.001);
    G.zoomHold=zoomWait;
    capturePointCheckpoint();
    if(G.paused||zoomWait||G.schemeOpen)simRemainder=0;
    else if(G.mode==='cine'){simRemainder=0;updateCine(dt);}
    else simRemainder=advanceSimulation(simRemainder,dt,step=>{
      rpRecord(step);
      update(step);
      return !G.paused&&!G.schemeOpen&&G.mode!=='cine';
    });
    if(G.mode==='banner'&&Math.max(...G.score)>=G.target)recordFinishedMatch();
    rpCheck();
    const replayFrame=rpApply(dt);
    if(replayFrame){
      updateHUD(dt);
      renderReplay(replayFrame,dt);
    }else{
      updateCamera(dt);updateHUD(dt);
      menuDrawElapsed+=dt;
      if(G.inMatch||G.mode!=='home'||menuDrawElapsed>=1/30){
        render(Math.min(menuDrawElapsed,.05));menuDrawElapsed=0;
      }
    }
    updTest();
  }else simRemainder=0;
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

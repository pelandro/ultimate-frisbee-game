/* ---- IL TIFO CRESCE CON LO STADIO ----
   Il livello e' quello dell'impianto che si vede a bordo campo (G.vn.lv, 0-5: in carriera le Tribune in casa). Al livello 0 il pubblico resta quello di sempre
   (02-audio-ciclo.js); dal livello 1 in su si aggiungono tamburi, battimani, trombe e fischi. Sono effetti da stadio sopra la musica della partita:
   brevi, con pause in mezzo, senza melodie continue ne' rumori di fondo; niente voci nuove. Tutto sintetizzato.
   Ogni livello ha un suo carattere:
     1  un tamburo isolato in curva
     2  il tamburo chiama e il pubblico risponde battendo le mani
     3  la tromba suona la carica e il pubblico risponde; «bum-bum, clap»
     4  «bum-bum, clap» di tutto lo stadio, trombe a gas e carica a due trombe
     5  tutto piu' grosso: carica a tre trombe e battimani che accelerano fino all'esplosione di trombe a gas
   Tamburi e trombe vanno a tempo con la musica (cicli di 8 battute di 8 crome) e stanno nella sua tonalita' (fa maggiore). */
const TIFO_LV=[   // ogni quante battute un applauso e i fischi (0 = mai), quanta eco di stadio, frequenza dei battimani e delle trombette di sempre
  {app:0,fischi:0,eco:0,ritmo:1},
  {app:10,fischi:0,eco:0,ritmo:1.25},
  {app:8,fischi:0,eco:0,ritmo:1},
  {app:8,fischi:14,eco:0.05,ritmo:1},
  {app:8,fischi:10,eco:0.1,ritmo:1},
  {app:8,fischi:7,eco:0.12,ritmo:1}
];
const TIFO_CARICA=[[0,72,.7],[1,77,.7],[2,81,.7],[3,84,1.7],[5,81,.7],[6,84,2]];   // la carica: [croma, nota MIDI, durata in crome]
/* k: {c, out, noise(out,t,dur,tipo,f,q,vol,att), rr, snare(out,t,vol), applause(t,power), horn(t,tipo,vol)} */
function buildTifo(k){
  const {c,noise,rr}=k,mtof=m=>440*Math.pow(2,(m-69)/12);
  const bus=c.createGain();bus.gain.value=1.1;bus.connect(k.out);
  // l'eco delle tribune: piu' lo stadio e' grande, piu' il suono rimbalza
  const eco=c.createDelay(1),efb=c.createGain(),elp=c.createBiquadFilter(),wet=c.createGain();
  eco.delayTime.value=0.19;efb.gain.value=0.3;elp.type='lowpass';elp.frequency.value=2000;wet.gain.value=0;
  bus.connect(eco);eco.connect(elp);elp.connect(efb);efb.connect(eco);elp.connect(wet);wet.connect(k.out);
  const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=4200;lp.connect(bus);   // i suoni arrivano dalle tribune: un po' smorzati
  const lato=(p,verso)=>{const n=c.createStereoPanner?c.createStereoPanner():null;if(!n)return verso;n.pan.value=p;n.connect(verso);return n;};
  const curva=lato(-0.35,lp);   // i tamburi stanno in curva, un po' a sinistra
  // un colpo di pelle: l'altezza scende in fretta. Parte abbastanza acuto e con un'armonica, perche' le casse dei telefoni sotto i 200 Hz non si sentono
  const colpo=(t,f0,f1,dur,vol,forma,verso)=>{const o=c.createOscillator(),g=c.createGain();o.type=forma||'sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur*0.5);
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+0.004);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(g);g.connect(verso||curva);o.start(t);o.stop(t+dur+0.03);};
  const cassa=(t,v)=>{colpo(t,150,55,0.42,0.46*v);colpo(t,330,130,0.2,0.34*v,'triangle');noise(curva,t,0.045,'bandpass',1500,0.8,0.42*v,0.001);};   // corpo, armonica e botta della mazza
  const tamburo=(t,v)=>{colpo(t,260,150,0.26,0.34*v);colpo(t,520,300,0.12,0.14*v,'triangle');noise(curva,t,0.035,'bandpass',2000,0.9,0.25*v,0.001);};
  const rullante=(t,v)=>k.snare(curva,t,0.18*v);
  const rullata=(t,dur,v)=>{for(let u=0;u<dur;u+=0.052)rullante(t+u+rr(-0.004,0.004),v*(0.18+0.6*Math.pow(u/dur,1.5)));};
  const mani=(t,v,n)=>{for(let i=0;i<(n||6);i++)noise(lp,t+rr(0,0.035),0.06,'bandpass',rr(1300,2600),0.9,v*rr(0.5,1),0.002);};
  const folla=(t,v)=>mani(t,v,16);   // tutto il pubblico che batte le mani insieme
  function tromba(t,midi,dur,vol,pan){   // tromba da banda: due denti di sega appena scordati, filtro che si apre all'attacco e un filo di vibrato
    const g=c.createGain(),fl=c.createBiquadFilter(),f=mtof(midi);fl.type='lowpass';fl.Q.value=1.2;
    fl.frequency.setValueAtTime(900,t);fl.frequency.exponentialRampToValueAtTime(3400,t+0.05);fl.frequency.setValueAtTime(2800,t+Math.max(0.06,dur*0.7));
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+0.03);g.gain.setValueAtTime(vol*0.85,t+dur*0.8);g.gain.exponentialRampToValueAtTime(0.0001,t+dur+0.04);
    const lfo=c.createOscillator(),ld=c.createGain();lfo.frequency.value=rr(5,6);ld.gain.value=f*0.006;lfo.connect(ld);lfo.start(t);lfo.stop(t+dur+0.1);
    for(const det of [-7,7]){const o=c.createOscillator();o.type='sawtooth';o.frequency.value=f;o.detune.value=det;ld.connect(o.frequency);o.connect(fl);o.start(t);o.stop(t+dur+0.1);}
    fl.connect(g);g.connect(lato(pan,lp));
  }
  function trombaGas(t,dur,vol){   // la tromba a gas dello stadio: due note ferme e sparate, nasali
    const g=c.createGain(),bp=c.createBiquadFilter();bp.type='bandpass';bp.frequency.value=1100;bp.Q.value=0.8;
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+0.02);g.gain.setValueAtTime(vol,t+dur-0.05);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    for(const f of [349,440,352]){const o=c.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(f*0.95,t);o.frequency.linearRampToValueAtTime(f,t+0.05);o.connect(bp);o.start(t);o.stop(t+dur+0.05);}
    bp.connect(g);g.connect(lato(rr(-0.5,0.5),bus));
  }
  const gas=(t,vol)=>{trombaGas(t,0.22,vol);trombaGas(t+0.3,0.22,vol);trombaGas(t+0.6,0.7,vol);};   // «pe, pe, peee»
  function fischio(t,dur,vol,su){   // un tifoso che fischia: su = fischio di gioia (sale), se no di disapprovazione (lungo, che cala)
    const o=c.createOscillator(),g=c.createGain(),f=rr(2100,3100);o.type='sine';
    o.frequency.setValueAtTime(f*(su?0.7:1),t);o.frequency.exponentialRampToValueAtTime(f*(su?1.18:1.04),t+dur*0.35);o.frequency.exponentialRampToValueAtTime(f*(su?1:0.84),t+dur);
    const lfo=c.createOscillator(),ld=c.createGain();lfo.frequency.value=rr(7,12);ld.gain.value=f*0.012;lfo.connect(ld);ld.connect(o.frequency);lfo.start(t);lfo.stop(t+dur+0.05);
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+0.05);g.gain.setValueAtTime(vol,t+dur*0.7);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    const dove=lato(rr(-0.8,0.8),bus);o.connect(g);g.connect(dove);o.start(t);o.stop(t+dur+0.05);
    noise(dove,t,dur,'bandpass',f,12,vol*0.5,0.05);   // il soffio
  }
  const fischi=(t,n,dur,vol,su)=>{for(let i=0;i<n;i++)fischio(t+rr(0,0.5),dur*rr(0.6,1.1),vol*rr(0.6,1),su);};
  // la carica con una, due o tre trombe
  const carica=(t,sd,voci,vol)=>{for(const [s,m,d] of TIFO_CARICA){tromba(t+s*sd,m,d*sd*0.92,0.075*vol,0.4);if(voci>1)tromba(t+s*sd+0.012,m-(m%12===5?5:4),d*sd*0.92,0.045*vol,0);if(voci>2)tromba(t+s*sd+0.02,m-12,d*sd*0.92,0.045*vol,-0.5);}};
  // i disegni di una battuta
  // il «bum-bum, clap» dev'essere netto: colpi corti e secchi, mani tutte insieme, e fuori dall'eco e dal filtro delle tribune
  const secco=c.createGain();secco.gain.value=0.94;secco.connect(k.out);
  const bum=(t,v)=>{colpo(t,165,58,0.27,0.62*v,'sine',secco);colpo(t,350,140,0.13,0.46*v,'triangle',secco);noise(secco,t,0.028,'bandpass',1700,0.8,0.6*v,0.001);};
  const clap=(t,v)=>{
    for(const [d,a] of [[0,0.8],[0.009,0.75],[0.018,1]]){noise(secco,t+d,0.022,'bandpass',1500,0.8,0.76*a*v,0.001);noise(secco,t+d,0.018,'bandpass',2700,0.9,0.48*a*v,0.001);}
    noise(secco,t+0.02,0.13,'bandpass',1250,0.8,0.52*v,0.001);   // la coda corta
  };
  const chiama=(t,sd,v)=>{bum(t,v);bum(t+2*sd,v*0.95);for(const s of [4,5,6])clap(t+s*sd,v*0.85);};   // «bum, bum» e il pubblico: «clap clap clap»
  const bumClap=(t,sd,v)=>{bum(t,v);bum(t+2*sd,v);clap(t+4*sd,v);};   // «bum-bum, clap»
  const accelera=(t,v)=>{for(const u of [0,0.6,1.1,1.5,1.82,2.08,2.28,2.44,2.58,2.7]){cassa(t+u,0.8*v);folla(t+u,0.08*v);}};   // mani sempre piu' veloci

  let lv=0,ultima=-1,zitto=0,sd=60/112/2;
  // che cosa fa la curva nella battuta q del ciclo di 8: dove non c'e' niente, si sente solo la musica
  const GIRO=[null,
    (t,q)=>{if(q<2)for(const s of [0,2,4,5,6])cassa(t+s*sd,s===0?0.8:0.65);},
    (t,q)=>{if(q<2)chiama(t,sd,0.9);else if(q===5){cassa(t,0.8);cassa(t+sd,0.8);cassa(t+2*sd,1);}},
    (t,q)=>{if(q===0)carica(t,sd,1,1);else if(q===1)chiama(t,sd,1);else if(q===4||q===5)bumClap(t,sd,0.9);},
    (t,q)=>{if(q<2)bumClap(t,sd,1.1);else if(q===3)gas(t,0.075);else if(q===4)carica(t,sd,2,1.05);},
    (t,q)=>{
      if(q===0)carica(t,sd,3,1.15);
      else if(q<3)bumClap(t,sd,1.2);
      else if(q===4)accelera(t,1.1);
      else if(q===5){cassa(t+0.55,1.4);gas(t+0.6,0.095);k.horn(t+1.4,'doppia',1.1);}
    }
  ];
  // la festa della curva dopo una meta di casa: ritorna per quanti secondi copre il tifo normale
  const FESTE=[null,
    t=>{for(let i=0;i<3;i++)cassa(t+0.05+i*0.17,1);return 0;},
    t=>{accelera(t+0.1,1);k.applause(t+2.9,0.8);return 3.4;},
    t=>{rullata(t+0.2,0.8,1);cassa(t+1,1.2);carica(t+1.05,sd,1,1.15);chiama(t+1.05+8*sd,sd,1.1);fischi(t+1,3,0.5,0.016,true);k.applause(t+3.2,0.7);return 5.5;},
    t=>{rullata(t+0.1,0.6,1);cassa(t+0.75,1.3);gas(t+0.8,0.09);carica(t+2,sd,2,1.15);for(let i=0;i<2;i++)bumClap(t+2+(1+i)*sd*8,sd,1.2);fischi(t+0.8,4,0.5,0.016,true);k.applause(t+1.2,1);return 8.5;},
    t=>{gas(t+0.1,0.11);cassa(t+0.1,1.4);rullata(t+0.9,0.6,1.1);accelera(t+1.5,1.2);carica(t+4.5,sd,3,1.25);gas(t+6.8,0.11);cassa(t+6.8,1.4);
      fischi(t+0.8,5,0.5,0.016,true);fischi(t+4.3,6,0.6,0.016,true);k.horn(t+3,'carica',1.2);k.applause(t+0.6,1);k.applause(t+4.5,1);return 8.5;}
  ];
  return {
    get level(){return lv;},
    setLevel(l){l=Math.max(0,Math.min(TIFO_LV.length-1,l|0));if(l===lv)return false;lv=l;wet.gain.value=TIFO_LV[l].eco;bus.gain.value=l>=5?0.96:1.1;return true;},
    dati:()=>TIFO_LV[lv],
    start(){ultima=-1;zitto=0;},
    // programma le battute fino a «until»; rif = l'inizio di una battuta della musica e num il suo numero, cosi' la curva sta a tempo e in tonalita'
    tick(until,rif,passo,num){
      if(!lv||rif===null||rif===undefined)return;
      sd=passo||sd;const lunga=sd*8;
      let i=Math.ceil((Math.max(c.currentTime||0,ultima+lunga*0.5)-rif)/lunga);
      for(let t=rif+i*lunga;t<until;i++,t+=lunga){
        const n=Math.max(0,(num||0)+i),L=TIFO_LV[lv];ultima=t;
        if(t<zitto)continue;   // durante la festa o la delusione per una meta la curva non riparte da capo
        GIRO[lv](t,n%8);
        if(L.app&&n%L.app===L.app-2)k.applause(t,0.08+0.05*lv);
        if(L.fischi&&n%L.fischi===L.fischi-2)fischi(t,lv-2,0.7,0.014,Math.random()<0.5);
      }
    },
    // i momenti della partita: type 'goal'|'turn'|'crowd'|'catch'|'block'; mia = tocca la squadra di casa (la tua)
    event(type,t,mia){
      if(!lv)return;
      if(type==='goal'&&mia){
        zitto=t+FESTE[lv](t);
        k.applause(t+0.3,0.2+0.14*lv);
      }else if(type==='goal'){   // meta avversaria: fischi, poi la curva prova a rialzare la squadra
        if(lv<2)return;
        zitto=t+1.8;
        fischi(t+0.35,2+2*lv,1.3,0.012+0.002*lv,false);
        for(let i=0;i<4;i++)cassa(t+2+i*0.55,0.8);
        if(lv===3)carica(t+4.2,sd,1,0.9);else{folla(t+4.2,0.08);folla(t+4.45,0.08);}
      }else if(type==='turn'){
        if(mia&&lv>=2){cassa(t+0.1,0.9);cassa(t+0.28,0.9);tamburo(t+0.46,1);if(lv>=4)k.applause(t+0.3,0.3);}
        else if(!mia&&lv>=3)fischi(t+0.15,lv-1,0.7,0.012,false);
      }else if(type==='crowd'){
        if(lv===2)for(let i=0;i<6;i++)folla(t+i*0.2,0.08);
        else if(lv===3)carica(t,sd,1,1);
        else if(lv>=4){rullata(t,0.9,1);cassa(t+0.95,1.3);gas(t+1,lv>=5?0.09:0.07);}
      }else if(type==='catch'||type==='block'){
        if(lv>=2){cassa(t+0.2,0.9);cassa(t+0.4,1);if(lv>=5)tamburo(t+0.55,1);}
      }
    }
  };
}

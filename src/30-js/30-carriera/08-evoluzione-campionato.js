/* ---- evoluzione del campionato: tutte le altre squadre crescono, invecchiano, perdono i veterani, lanciano giovani e si scambiano giocatori ---- */
function leagueAnchors(){   // livello storico di ogni squadra (quello di inizio carriera) e ciclo: annate buone e anni di ricostruzione
  if(!SV.anc)SV.anc={};if(!SV.cyc)SV.cyc={};
  for(const n in SV.rost)if(SV.anc[n]===undefined&&SV.rost[n]&&SV.rost[n].length){
    const sr=TEAM[n]?TEAM[n].series:'C';
    SV.anc[n]=(SV.season|0)<=1?Math.round(rosterPower(SV.rost[n])*10)/10:(TEAM[n]&&sr!=='C'?TEAM[n].power:Math.min(rosterPower(SV.rost[n]),62));
  }
}
// POLITICA DEL CLUB (fissa per squadra): chi punta sui giovani sforna piu' promesse e piu' forti, chi punta sull'esperienza ne promuove poche.
// Con il livello storico che ora si sposta negli anni (vedi sotto), le squadre non restano inchiodate ai valori di partenza.
const CLUB_POL=[['giovani','punta sul vivaio'],['equilibrio','rosa equilibrata'],['esperienza','punta sui veterani']];
const clubPol=n=>CLUB_POL[hashStr('pol|'+n)%3];
// quanto un giocatore servirebbe a una rosa: differenza tra lui e il titolare piu' debole nel suo ruolo
function aiNeed(ro,o){
  const pos=posOf(o)==='H'?'H':'C',same=ro.filter(x=>(posOf(x)==='H'?'H':'C')===pos).sort((a,b)=>ovrX(b)-ovrX(a)),slot=pos==='H'?3:4,w=same[Math.min(slot,same.length)-1];
  return w?ovrX(o)-ovrX(w):12;
}
function evolveLeague(){
  const R=Math.random;let ret=[],moves=0,up=[],dn=[];
  leagueAnchors();
  for(const n in SV.rost){
    const ro=SV.rost[n];if(!ro||!ro.length)continue;
    const top=ro.slice().sort((a,b)=>ovrX(b)-ovrX(a)),starters=new Set(top.slice(0,9));
    for(const o of ro){   // una stagione di partite: crescita a XP come per i tuoi (chi gioca meno cresce meno)
      const parts=simParts(o,starters.has(o)?1:0.4);for(const k in parts)parts[k]*=14;
      growBy(o,parts,XP_ROLE[posOf(o)]);
    }
    let out=0;   // ritiri: dai 34 anni in su, al massimo due a stagione per squadra
    const pw=rosterPower(ro);   // come per i tuoi: chi rende ancora continua, chi e' ai margini smette prima; chi l'aveva annunciato smette di sicuro
    for(const o of ro.slice().sort((a,b)=>b.age-a.age)){
      if(out>=2||ro.length<=10)break;
      const sc=aiRetScore(o,pw,starters.has(o));
      if(o.ret||(sc>0&&R()<clamp(0.3+sc*0.3,0,0.95))){ro.splice(ro.indexOf(o),1);out++;if(ovr(o)>=pw-3)ret.push((o.label||o.n)+' ('+n+', '+o.age+' anni)');}
    }
  }
  const names=Object.keys(SV.rost).filter(n=>SV.rost[n]&&SV.rost[n].length>12);   // trasferimenti tra squadre: una riserva passa a una squadra di livello simile
  for(let i=0;i<14&&names.length>2;i++){
    const a=names[Math.floor(R()*names.length)];if(SV.rost[a].length<=12)continue;
    const ro=SV.rost[a].slice().sort((x,y)=>ovrX(y)-ovrX(x)),o=ro[5+Math.floor(R()*Math.max(1,ro.length-5))];if(!o)continue;
    // il mercato segue i bisogni: tra tre squadre di livello simile lo prende quella a cui serve di piu' in quel ruolo (prima la destinazione era a caso)
    let b=null,bn=-99;for(let k=0;k<3;k++){const c=names[Math.floor(R()*names.length)];if(c===a||Math.abs(teamPow(a)-teamPow(c))>12||SV.rost[c].length>=22)continue;const nd=aiNeed(SV.rost[c],o);if(nd>bn){bn=nd;b=c;}}
    if(!b)continue;
    SV.rost[a].splice(SV.rost[a].indexOf(o),1);SV.rost[b].push(o);moves++;
  }
  for(const n in SV.rost){
    const ro=SV.rost[n];if(!ro||!ro.length)continue;
    const acad=0.5+(hashStr(n+'|acad|'+SV.season)%100)/100;   // annata del vivaio: buona o scarsa
    const lvl=rosterPower(ro);
    const pol=clubPol(n)[0],ny=pol==='giovani'?3:(pol==='esperienza'?1:2),pk=pol==='giovani'?1.2:(pol==='esperienza'?0.85:1);
    for(let i=0;i<ny||ro.length<14;i++){if(ro.length>=22)break;ro.push(genPlayer(lvl-9+R()*5,16+Math.floor(R()*4),SV.seed+'|yo|'+n+'|'+SV.season+'|'+i,lvl+2+R()*20*acad*pk));}
    while(ro.length>20){const w=ro.slice().sort((a,b)=>ovrX(a)-ovrX(b))[0];ro.splice(ro.indexOf(w),1);}
    // la squadra tende al proprio livello storico, spostato dal ciclo del momento: cosi' il campionato resta credibile per decenni, con squadre che salgono e che scendono
    const prev=SV.cyc[n]||0;SV.cyc[n]=clamp(prev*0.75+(R()*2-1)*2.6,-7,7);
    const gap=clamp(SV.anc[n]+SV.cyc[n]+domBoost(n)-rosterPower(ro),-3,3)*0.8,best=ro.slice().sort((a,b)=>ovrX(b)-ovrX(a)).slice(0,11);
    if(Math.abs(gap)>0.3)for(const o of best){
      if(gap>0&&o.age>29)continue;if(gap<0&&o.age<24&&R()<0.4)continue;   // crescono i giovani e chi e' nel pieno, calano soprattutto i meno giovani
      const g=gap*(gap>0?1.5:1.7);
      for(const k of KEYS){const d=Math.trunc(g)+(R()<Math.abs(g%1)?Math.sign(g):0);if(d)o.s[k]=clamp(o.s[k]+d,25,99);}
      if(gap>0){const mx=ks=>Math.max(...ks.map(k=>o.s[k]));o.tl=Math.max(o.tl,Math.min(99,mx(['lan','buc','spa'])+3));o.tv=Math.max(o.tv,Math.min(99,o.s.vis+3));o.tf=Math.max(o.tf,Math.min(99,mx(['dif','sal','sca','tuf','vel','res','pre','agi'])+3));}
    }
    if(SV.cyc[n]-prev>2.2)up.push(n);else if(SV.cyc[n]-prev<-2.2)dn.push(n);
    // il livello storico non e' piu' fisso: ogni anno si sposta un poco verso cio' che la squadra e' diventata. In 10-20 stagioni le gerarchie cambiano davvero
    SV.anc[n]=clamp(SV.anc[n]+(rosterPower(ro)-SV.anc[n])*0.18+(R()*2-1)*0.5,36,94);
  }
  if(ret.length)news('Si ritirano: '+ret.slice(0,4).join(', ')+(ret.length>4?' e altri':'')+'.');
  const mine=new Set(SV.mem[SV.sr]),u=up.filter(n=>mine.has(n)).slice(0,2),d=dn.filter(n=>mine.has(n)).slice(0,2);
  if(u.length||d.length)news('Voci dal campionato: '+(u.length?u.join(' e ')+' in crescita':'')+(u.length&&d.length?'; ':'')+(d.length?d.join(' e ')+' in fase di ricostruzione':'')+'.');
  news('Mercato delle altre squadre: '+moves+' trasferimenti, nuovi giovani in ogni rosa.');
}

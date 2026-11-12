/* ===================== VITA DEI GIOCATORI: avvisi, ritiro, infortuni seri, minutaggio e umore, offerte, sbalzi d'estate =====================
   Ogni cosa che succede a un giocatore diventa un avviso (campanella nel cruscotto; si apre da solo quando c'e' qualcosa di nuovo) e, se serve, una scelta.
   RITIRO: ogni giocatore ha una sua eta' di soglia (33-39, mai prima di quella a cui gia' giocava a inizio carriera). La soglia si alza se rende ancora
   (vale piu' dei titolari, gioca tanto, fa numeri), se ha il tratto Ironman, se l'ambiente e' buono; si abbassa se e' ai margini, gioca poco o ha avuto
   infortuni seri. Un campione che rende gioca fino a 40 anni e oltre; una riserva che non vede il campo puo' smettere poco dopo i 30.
   Prima dice che ci sta pensando, poi annuncia l'ultima stagione (a inizio o a meta' campionato), e solo a fine stagione lascia: puoi chiedergli un altro anno. */
const AL_KIND={ret:['Ritiro','#c9a0ff'],inj:['Infortunio','#ff6b70'],ok:['Rientro','#4fe58f'],mood:['Spogliatoio','#ff9a3a'],off:['Offerta','#ffd23f'],dec:['Declino','#9fb0de'],up:['Crescita','#4fe58f'],bye:['Addio','#e8ecf8']};
const pname=p=>p.label||p.name||p.n;
// concordanza: «infortunato» o «infortunata» secondo il giocatore
const FEM_N=new Set(['Beatrice','Camilla','Chiara','Claudia','Elisa','Emma','Francesca','Giorgia','Ilaria','Laura','Marta','Martina','Paola','Sara','Valentina','Vittoria','Alice','Giada']);
const oa=p=>(p.f||FEM_N.has(p.name||p.n))?'a':'o';
function alertAdd(k,txt,o){
  o=o||{};if(!SV.alerts)SV.alerts=[];
  SV.alerts.unshift({id:(SV.alN=(SV.alN|0)+1),s:SV.season,r:(SV.round|0)+1,k,txt,full:o.full||'',act:o.act||'',data:o.data||null,seen:o.seen?1:0,done:0});
  if(SV.alerts.length>60)SV.alerts.length=60;
  news(txt);
}
const retBase=x=>33+hashStr('rit|'+(x.full||x.name||x.n))%7;
function retAnchor(x){if(x.ra===undefined)x.ra=Math.max(retBase(x),x.age+1+hashStr('ra|'+(x.full||x.name||x.n))%4);return x.ra;}   // chi a 45 anni gioca ancora non smette domani
function retScore(p){   // sopra zero: e' il momento in cui pensa di smettere
  const c=p.car,rel=ovrX(p)-squadPower(),tot=SV.sched?SV.sched.length:15;
  const half=SV.event==='camp'&&(SV.round|0)>=Math.floor(tot/2),st=c?(half?c.ss:c.ls):null,share=st?st.mp/Math.max(1,half?SV.round:tot):0.5;
  let thr=retAnchor(p)+clamp(rel/3,-2.5,3)+(p.trait==='iron'?2:0)+(share>=0.7?1:(share<=0.25?-1.5:0))-(p.injC|0)*0.7+clamp((SV.mor-60)/40,-0.7,0.7);
  if(st&&st.mp>=4&&(st.g*2+st.a*2+st.b*3)/st.mp>=3.2)thr+=1;   // stagione da protagonista: la voglia resta
  return p.age-Math.max(30,thr);
}
function aiRetScore(o,pw,starter){return o.age-Math.max(30,retAnchor(o)+clamp((ovrX(o)-pw)/3,-2.5,3)+(o.trait==='iron'?2:0)+(starter?0.7:-1.2));}
function retireCheck(when){   // a inizio e a meta' stagione: chi ci sta pensando lo fa sapere, chi ha deciso lo annuncia
  let n=SQ.filter(p=>p.ret===1).length;
  for(const p of SQ.slice().sort((a,b)=>retScore(b)-retScore(a))){
    if(p.ret===1||p.retHold===SV.season)continue;
    const sc=retScore(p);
    if(sc>0&&n<3&&Math.random()<clamp(0.3+sc*0.3,0,0.97)){p.ret=1;n++;alertAdd('ret',`${pname(p)} (${p.age} anni, Overall ${ovr(p)}) ha annunciato che questa sarà la sua ultima stagione.`,{full:p.full,act:'stay'});}
    else if(when==='start'&&sc>-1.5&&!p.rw){p.rw=1;alertAdd('ret',`${pname(p)} (${p.age} anni) comincia a pensare al ritiro: se gioca poco o cala, potrebbe smettere già a fine stagione.`,{full:p.full});}
  }
}
const stayCost=p=>Math.round(wageOf(p)*0.5)+5;
function retPersuade(p){   // un solo tentativo: piu' facile se rende ancora e se l'ambiente e' buono
  const cost=stayCost(p);if(SV.cash<cost)return {ok:false,again:true,txt:`Servono ${cost} crediti per il premio di permanenza.`};
  const sc=retScore(p),ch=clamp(0.6-sc*0.18+(ovrX(p)>=squadPower()?0.15:0)+(SV.mor-60)/200,0.08,0.92);
  if(Math.random()<ch){SV.cash-=cost;p.ret=0;p.retHold=SV.season+1;news(`${pname(p)} ci ripensa: giocherà un’altra stagione.`);return {ok:true,txt:`${pname(p)} ci ripensa: resta ancora una stagione (premio di ${cost} crediti).`};}
  return {ok:false,txt:`${pname(p)} ringrazia ma ha deciso: a fine stagione smette.`};
}
function leagueRetAnnounce(){   // anche nelle altre squadre del tuo campionato i titolari piu' anziani annunciano l'addio
  const out=[];
  for(const n of SV.mem[SV.sr]){
    if(n===SV.team)continue;const ro=SV.rost[n]||[],pw=rosterPower(ro);
    for(const o of ro.slice().sort((a,b)=>ovrX(b)-ovrX(a)).slice(0,7))if(!o.ret&&aiRetScore(o,pw,true)>0.5&&Math.random()<0.6){o.ret=1;out.push(`${o.label||o.n} (${n}, ${o.age} anni)`);}
  }
  if(out.length)news('Annunciano il ritiro a fine stagione: '+out.slice(0,4).join(', ')+(out.length>4?' e altri':'')+'.');
}
const starLimit=r=>Math.max(r[2]+2,37+Math.round((r[4]-76)/4));   // i giocatori internazionali: i piu' forti restano in attivita' piu' a lungo
function starsRetire(){const y=Math.max(0,(SV.season|0)-1),out=STARS.filter(r=>r[2]+y===starLimit(r)+1).map(r=>r[1]+' '+r[0]);if(out.length)news('Lasciano l’ultimate giocato: '+out.slice(0,4).join(', ')+'.');}
function healed(p){   // rientro da un infortunio; dopo uno stop lungo si puo' perdere un po' di smalto
  let extra='';
  if(p.injBig){
    p.injBig=0;const ks=['vel','sca','agi','sal'].sort(()=>Math.random()-0.5).slice(0,2),loss=[];
    for(const k of ks){const d=1+(Math.random()<0.4?1:0);p.s[k]=Math.max(25,p.s[k]-d);loss.push(`${LBL[k]} −${d}`);}
    extra=` Lo stop lungo ha lasciato il segno: ${loss.join(', ')}.`;
  }
  alertAdd('ok',`${pname(p)} è guarit${oa(p)} ed è di nuovo disponibile.${extra}`,{full:p.full});
}
function leaveSquad(list){if(!list.length)return;setSquad(squadData().filter(o=>!list.some(p=>p.full===o.full)));fixLines();}
function lifeAfterMatch(){   // dopo ogni partita: minutaggio e umore, offerte
  talkCool();
  if(SV.offer&&SV.round>SV.offer.round){const a=SV.alerts.find(x=>x.act==='offer'&&!x.done&&x.full===SV.offer.full);if(a){a.done=1;a.res='Offerta scaduta.';}SV.offer=null;}
  const ref=squadPower(),gone=[];
  for(const p of SQ){
    if(p.m&&p.m.pts>0){if(p.mood)alertAdd('mood',`${pname(p)} è tornat${oa(p)} in campo e ha ritrovato il sorriso.`,{full:p.full,seen:1});p.idle=0;p.mood=0;p.prom=0;continue;}
    if(p.inj)continue;
    p.idle=(p.idle|0)+1;
    if(!(ovrX(p)>=ref-5&&p.age<34&&p.ret!==1))continue;   // si lamenta solo chi meriterebbe di giocare
    if(p.idle>=6&&!p.mood){p.mood=1;alertAdd('mood',`${pname(p)} (Overall ${ovr(p)}) non gioca da ${p.idle} partite ed è scontent${oa(p)}: trovagli posto in una linea, o finirà per chiedere la cessione.`,{full:p.full});}
    else if(p.idle>=10&&p.mood===1){
      if(p.prom&&SQ.length-gone.length>SQ_MIN)gone.push(p);
      else if(!p.prom){p.mood=2;alertAdd('mood',`${pname(p)} chiede di essere cedut${oa(p)}: non gioca da ${p.idle} partite.`,{full:p.full,act:'unhappy'});}
    }else if(p.idle>=14&&p.mood===2&&SQ.length-gone.length>SQ_MIN)gone.push(p);
  }
  if(SQ.some(p=>p.mood===2))SV.mor=clamp(SV.mor-1,0,100);   // un caso aperto pesa sullo spogliatoio
  for(const p of gone){keepFormer(p);SV.mor=clamp(SV.mor-4,0,100);alertAdd('bye',`${pname(p)} ha lasciato la squadra senza indennizzo: non trovava spazio${p.prom?' nonostante la promessa':''}.`);}
  leaveSquad(gone);
  // offerte: ogni tanto una squadra di serie superiore (o della Serie A) chiede uno dei tuoi migliori
  if(SV.event==='camp'&&!SV.done&&!SV.offer&&SQ.length>SQ_MIN+1&&Math.random()<0.07){
    const c=SQ.filter(p=>!p.inj&&p.ret!==1&&p.age<=31&&p.car&&p.car.ss.mp>=3).sort((a,b)=>seasonScore(b.car)-seasonScore(a.car)).slice(0,4);
    const up=SV.sr==='C'?'B':'A',teams=SV.mem[up].filter(n=>n!==SV.team&&SV.rost[n]&&SV.rost[n].length<22);
    if(c.length&&teams.length){
      const p=c[Math.floor(Math.random()*c.length)],team=teams[Math.floor(Math.random()*teams.length)],price=Math.round(priceOf(p)*1.35)+5;
      SV.offer={full:p.full,team,price,round:SV.round};
      alertAdd('off',`${team} (${SERIES_NAME[up]}) offre ${price} crediti per ${pname(p)} (Overall ${ovr(p)}). L’offerta vale fino alla prossima partita.`,{full:p.full,act:'offer',data:{team,price}});
    }
  }
}
function offerAnswer(yes){
  const of=SV.offer,p=of?byFull(of.full):null;SV.offer=null;if(!of||!p)return 'L’offerta non è più valida.';
  if(yes){
    if(SQ.length<=SQ_MIN)return 'La rosa è al minimo: non puoi cedere nessuno.';
    SV.cash+=of.price;keepFormer(p);const rec=squadData().find(o=>o.full===p.full);
    if(rec&&SV.rost[of.team]){rec.car=null;rec.ret=rec.mood=rec.idle=rec.prom=undefined;SV.rost[of.team].push(rec);}   // lo ritroverai da avversario
    leaveSquad([p]);SV.chem=Math.max(0,SV.chem-3);news(`${pname(p)} passa a ${of.team} per ${of.price} crediti.`);
    return `Affare fatto: ${pname(p)} passa a ${of.team} per ${of.price} crediti.`;
  }
  if(TEAM[of.team]&&TEAM[of.team].series<SV.sr&&p.age<29&&Math.random()<0.3){p.mood=1;p.idle=Math.max(p.idle|0,4);alertAdd('mood',`${pname(p)} ci è rimast${oa(p)} male per il no a ${of.team}: vuole sentirsi importante.`,{full:p.full,seen:1});return `Offerta rifiutata. ${pname(p)} sperava di salire di categoria e ci è rimast${oa(p)} male.`;}
  return `Offerta rifiutata: ${pname(p)} resta.`;
}
function unhappyAnswer(p,sell){
  if(sell){const nm=pname(p),v=sellValue(p);if(!sellPlayer(p.id))return 'La rosa è al minimo: non puoi cederlo.';return `${nm}: cessione conclusa per ${v} crediti.`;}
  p.mood=1;p.prom=1;p.idle=5;return `${pname(p)} accetta di aspettare: se entro 5 partite non gioca, se ne andrà.`;
}
function summerChanges(was){   // dopo l'estate: chi e' cresciuto, chi accusa l'eta', e ogni tanto un giovane che esplode
  for(const p of SQ){
    if(p.age<=22&&potX(p)-ovrX(p)>=6&&Math.random()<0.1){const ks=KEYS.slice().sort(()=>Math.random()-0.5).slice(0,6);for(const k of ks)p.s[k]=Math.min(capX(p,k),p.s[k]+2);p.boom=1;}
    talentGrow(p);
    const a=was.get(p.full),b=ovr(p);if(a===undefined)continue;
    if(p.boom){p.boom=0;alertAdd('up',`${pname(p)} (${p.age} anni) è esplos${oa(p)} durante l’estate: Overall da ${a} a ${b}.`,{full:p.full});}
    else if(b-a>=2)alertAdd('up',`${pname(p)} è cresciut${oa(p)} durante l’estate: Overall da ${a} a ${b}.`,{full:p.full});
    else if(a-b>=2)alertAdd('dec',`${pname(p)} (${p.age} anni) accusa l’età: Overall da ${a} a ${b}.`,{full:p.full});
  }
}
function retireOwn(){   // a fine stagione lascia chi aveva annunciato l'addio; chi ha lasciato il segno entra nella Hall of Fame
  const gone=[];
  for(const p of SQ.slice().sort((a,b)=>b.age-a.age)){
    if(p.ret!==1)continue;
    if(SQ.length-gone.length<=SQ_MIN){p.ret=0;p.retHold=SV.season;alertAdd('ret',`${pname(p)} rimanda il ritiro di un anno: la rosa è troppo corta per lasciarla adesso.`,{full:p.full});continue;}
    gone.push(p);
  }
  if(!gone.length)return;
  for(const p of gone){
    const c=p.car,hof=!!(c&&((c.mp>=60&&c.g+c.a>=60)||c.g+c.a>=150||(p.aw||[]).length>=2||(p.ti|0)>=3));keepFormer(p);
    if(hof){SV.hof.unshift({name:pname(p),yrs:c.yrs+1,mp:c.mp,g:c.g,a:c.a,b:c.b,season:SV.season-1,aw:(p.aw||[]).length,pos:posOf(p),v:ovr(p),lk:p.look||null,t:p.t|0,nk:p.nick||'',md:medalsOf(p).slice(0,4)});SV.rep=clamp(SV.rep+1,0,100);}   // pos/v/lk/t/nk/md servono alla carta dorata (11-traguardi-albo.js)
    alertAdd('bye',`${pname(p)} si è ritirat${oa(p)} a ${p.age} anni`+(c&&c.mp?` dopo ${c.mp} partite, ${c.g} mete e ${c.a} assist con la squadra`:'')+(hof?': entra nella Hall of Fame.':'.'));
  }
  leaveSquad(gone);
}

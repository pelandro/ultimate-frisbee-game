/* ---- MERCATO TRA LE SQUADRE DEL COMPUTER (solo d'estate) ----
   Nel passaggio alla stagione nuova, dopo invecchiamento, ritiri e giovani (evolveLeague), alcune squadre del computer fanno un'operazione
   (di rado due) per sistemare la rosa: un ACQUISTO da un altro club, uno SCAMBIO Handler contro Cutter o un giocatore SVINCOLATO.
   Si fa solo cio' che conviene a entrambe, misurato con la forza dei 7 titolari che decide i risultati (rosterPower):
   - chi compra deve migliorare davvero (AIM.gain); chi vende non deve peggiorare quasi per niente (AIM.loss: una riserva o un giocatore
     che ha gia' chi lo sostituisce) e incassa il cartellino. Un club in ricostruzione o che punta sui giovani puo' vendere un veterano anche
     se perde di piu' (AIM.vetLoss): incassa e fa giocare i suoi;
   - nello scambio migliorano tutte e due (AIM.tradeG), perche' a ciascuna manca il ruolo che l'altra ha in piu'.
   Il budget non si salva (nessun campo nuovo nella carriera): ogni estate un club puo' spendere una parte del suo monte stipendi, di piu'
   se e' prestigioso (clubLvl) o in crescita, piu' quello che incassa vendendo; dopo la mossa gli stipendi non salgono oltre AIM.wUp.
   Cosi' i club ricchi comprano e quelli piccoli vendono. Niente mercato compulsivo: e' attiva circa una squadra su tre, al massimo AIM.max
   mosse per squadra (di solito una) e una mossa ogni AIM.cap squadre in tutto. La tua squadra non e' mai coinvolta.
   I trasferimenti casuali di riserve di evolveLeague restano com'erano; questi sono le operazioni vere, raccontate nella Posta. */
Object.assign(AL_KIND,{mkt:['Mercato','#8fe3b0']});
const AIM={
  act:0.28, actTop:0.2, actReb:0.08,   // probabilita' di essere attiva: base, piu' se e' in crescita o prestigiosa, piu' se ricostruisce
  max:2, again:0.3, cap:4,             // mosse al massimo per squadra; probabilita' di cercarne una seconda; una mossa ogni 4 squadre in tutto
  gain:0.3, loss:0.15, vetLoss:1.2, vetAge:30, tradeG:0.2,   // soglie sulla forza dei 7 titolari (media degli Overall)
  dPow:12,                             // solo tra squadre di forza simile, come i trasferimenti di riserve
  bud:0.22, budLv:0.3, budTop:1.25,    // budget estivo = monte stipendi x (bud + budLv x prestigio), x budTop se e' in crescita
  wUp:0.1, wUpLv:0.08,                 // gli stipendi dopo la mossa possono salire al massimo del 10% (+8% per i club piu' prestigiosi)
  fa:2, faLv:9, minRo:12, minRole:4, maxRo:20, // svincolati provati da chi compra e quanto sotto la forza del club; rosa minima, giocatori minimi per ruolo, rosa massima
  show:4                               // operazioni raccontate nella Posta
};
const aimTop=n=>(SV.cyc&&SV.cyc[n]||0)>=1||clubLvl(n)>=0.8;   // punta al vertice: in un ciclo buono o tra i club piu' importanti
const aimReb=n=>(SV.cyc&&SV.cyc[n]||0)<=-1.5;                  // in ricostruzione: vende volentieri i veterani
// valutazioni veloci con i valori dell'estate in memoria (le statistiche non cambiano durante il mercato): aimPow da' lo stesso risultato
// di rosterPower (3 Handler e 4 Cutter migliori, poi i migliori rimasti) e aimWage di wageSeason, per la rosa con un giocatore in piu' (add)
// e/o uno in meno (rem), senza costruire rose nuove. Con rosterPower e wageSeason il mercato di una lega costava fino a quasi un secondo
const aimDesc=(a,b)=>b-a;
function aimPow(ro,add,rem,M){
  const h=[],c=[],x=[],put=o=>{(o.r==='H'?h:(o.r==='C'?c:x)).push(M(o));};
  for(const o of ro)if(o!==rem)put(o);if(add)put(add);
  h.sort(aimDesc);c.sort(aimDesc);let s=0,n=0;
  for(let i=0;i<3&&i<h.length;i++){s+=h[i];n++;}for(let i=0;i<4&&i<c.length;i++){s+=c[i];n++;}
  if(n<7){const r=h.slice(3).concat(c.slice(4),x).sort(aimDesc);for(let i=0;n<7&&i<r.length;i++){s+=r[i];n++;}}
  return n?s/n:0;
}
function aimWage(ro,add,rem,W){
  const v=[];for(const o of ro)if(o!==rem)v.push(W(o));if(add)v.push(W(add));v.sort(aimDesc);
  let s=0;for(let i=0;i<v.length;i++)s+=i<WAGE_FULL?v[i]:v[i]*0.5;return s;   // il mercato delle squadre del computer e' tarato cosi': il quarto oltre il ventesimo (wageW) vale solo per la tua rosa
}
function aimRoleOk(ro,add,rem){let n=0,h=0;for(const o of ro)if(o!==rem){n++;if(o.r==='H')h++;}if(add){n++;if(add.r==='H')h++;}return n>=AIM.minRo&&h>=AIM.minRole&&n-h>=AIM.minRole;}
function aimWeak(ro,r,M){   // il titolare piu' debole del ruolo (3 Handler, 4 Cutter): chi non lo supera non cambia la forza
  const v=ro.filter(o=>o.r===r).map(M).sort(aimDesc),k=r==='H'?3:4;return v.length<k?0:v[k-1];
}
function aiMarket(){
  const R=Math.random,names=Object.keys(SV.rost||{}).filter(n=>n!==SV.team&&SV.rost[n]&&SV.rost[n].length>=AIM.minRo);
  if(names.length<3)return [];
  const c9=new Map(),cw=new Map(),cp=new Map();
  const M=o=>{let v=c9.get(o);if(v===undefined){v=mean9(o);c9.set(o,v);}return v;},W=o=>{let v=cw.get(o);if(v===undefined){v=wageOf(o);cw.set(o,v);}return v;},
    PR=o=>{let v=cp.get(o);if(v===undefined){v=priceOf(o);cp.set(o,v);}return v;};
  const st={},pw={};
  for(const n of names){const ro=SV.rost[n],w=aimWage(ro,null,null,W),lv=clubLvl(n);pw[n]=aimPow(ro,null,null,M);
    st[n]={bud:Math.round(w*(AIM.bud+AIM.budLv*lv)*(aimTop(n)?AIM.budTop:1)),wcap:w*(1+AIM.wUp+AIM.wUpLv*lv),mv:0};}
  const moved=new Set(),free=o=>o&&o.ret!==1&&!o.inj&&!moved.has(o),cap=Math.ceil(names.length/AIM.cap),done=[];
  const act=names.filter(n=>R()<AIM.act+(aimTop(n)?AIM.actTop:0)+(aimReb(n)?AIM.actReb:0));
  for(let i=act.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[act[i],act[j]]=[act[j],act[i]];}
  const best=b=>{   // l'operazione migliore per il club b (quella che lo migliora di piu' tra quelle che convengono anche all'altro)
    const rb=SV.rost[b],p0=pw[b],sb=st[b];let pick=null;
    const take=(m,g)=>{if(g>(pick?pick.g:-1))pick=Object.assign(m,{g});};
    const wk={H:aimWeak(rb,'H',M),C:aimWeak(rb,'C',M)},nh=r=>wk[r]||0;
    for(const a of names){
      if(a===b||st[a].mv>=AIM.max||Math.abs(pw[a]-p0)>AIM.dPow)continue;
      const ra=SV.rost[a],pa=pw[a],reb=aimReb(a)||clubPol(a)[0]==='giovani',wa={H:aimWeak(ra,'H',M),C:aimWeak(ra,'C',M)};
      for(const o of ra){   // acquisto
        if(!free(o)||M(o)<=nh(o.r))continue;
        const fee=PR(o);if(fee>sb.bud)continue;
        const g=aimPow(rb,o,null,M)-p0;if(g<AIM.gain||aimWage(rb,o,null,W)>sb.wcap||!aimRoleOk(ra,null,o)||!aimRoleOk(rb,o,null))continue;   // anche chi compra deve restare con una rosa valida (una squadra rimasta con un solo Handler non ne esce comprando un Cutter)
        const loss=pa-aimPow(ra,null,o,M);if(loss>AIM.loss&&!(reb&&o.age>=AIM.vetAge&&loss<=AIM.vetLoss))continue;
        take({k:'buy',o,a,b,fee},g);
      }
      for(const x of rb){   // scambio: b da' x (un ruolo in piu') e riceve y (il ruolo che gli manca)
        if(!free(x)||M(x)<=(wa[x.r]||0))continue;
        for(const y of ra){
          if(!free(y)||y.r===x.r||M(y)<=nh(y.r))continue;
          if(!aimRoleOk(rb,y,x)||!aimRoleOk(ra,x,y))continue;
          const g=aimPow(rb,y,x,M)-p0;if(g<AIM.tradeG)continue;
          const ga=aimPow(ra,x,y,M)-pa;if(ga<AIM.tradeG)continue;
          const d=PR(y)-PR(x);if(d>sb.bud||-d>st[a].bud)continue;   // la differenza di valore la paga chi riceve il giocatore che vale di piu'
          if(aimWage(rb,y,x,W)>sb.wcap||aimWage(ra,x,y,W)>st[a].wcap)continue;
          take({k:'swap',o:y,x,a,b,fee:d},Math.min(g,ga));
        }
      }
    }
    for(let i=0;i<AIM.fa;i++){   // svincolato: un adulto un po' sotto il livello del club (chi resta libero non e' un titolare da vertice), senza cartellino
      const l0=p0-AIM.faLv+R()*5,ag=24+Math.floor(R()*8),o=genPlayer(l0,ag,SV.seed+'|aifa|'+b+'|'+SV.season+'|'+st[b].mv+'|'+i,adultPot(l0,ag,R));
      const g=aimPow(rb,o,null,M)-p0;if(g>=AIM.gain&&aimWage(rb,o,null,W)<=sb.wcap&&aimRoleOk(rb,o,null))take({k:'fa',o,b,fee:0},g);
    }
    return pick;
  };
  const trim=(n,n0)=>{const ro=SV.rost[n];while(ro.length>Math.max(AIM.maxRo,n0)){const w=ro.slice().sort((a,b)=>M(a)-M(b)).find(o=>aimRoleOk(ro,null,o));if(!w)break;ro.splice(ro.indexOf(w),1);}};   // come evolveLeague: chi avanza lascia la rosa
  for(const b of act){
    if(done.length>=cap)break;
    for(let t=0;t<AIM.max&&st[b].mv<AIM.max&&done.length<cap;t++){
      if(t>0&&R()>=AIM.again)break;
      const m=best(b);if(!m)break;
      const rb=SV.rost[b],n0=rb.length;   // la rosa non supera la misura che aveva (o AIM.maxRo): chi compra lascia andare il piu' debole
      if(m.k==='fa')rb.push(m.o);
      else{const ra=SV.rost[m.a];ra.splice(ra.indexOf(m.o),1);rb.push(m.o);
        if(m.k==='swap'){rb.splice(rb.indexOf(m.x),1);ra.push(m.x);}
        st[m.a].bud+=m.fee;st[m.a].mv++;pw[m.a]=aimPow(ra,null,null,M);}
      st[b].bud-=m.fee;st[b].mv++;trim(b,n0);pw[b]=aimPow(rb,null,null,M);
      moved.add(m.o);if(m.x)moved.add(m.x);   // chi ha cambiato squadra quest'estate resta dov'e': niente acquisti rivenduti subito
      done.push(Object.assign(m,{ov:Math.max(ovr(m.o),m.x?ovr(m.x):0)}));
    }
  }
  aiMarket.last={k:['buy','swap','fa'].map(k=>done.filter(m=>m.k===k).length),n:done.length,cap,clubs:names.length,act:act.length,per:Math.max(0,...Object.values(st).map(s=>s.mv)),bud:Object.values(st).every(s=>s.bud>=0),ros:done.every(m=>[m.a,m.b].filter(Boolean).every(n=>aimRoleOk(SV.rost[n],null,null)))};   // per il test della carriera
  return done;
}
// la notizia della Posta: le operazioni con l'Overall piu' alto, con un segno per la tua serie e la tua rivale
function aiMarketNews(done){
  if(!done||!done.length)return;
  const mine=new Set(SV.mem&&SV.mem[SV.sr]||[]),tag=(...cs)=>cs.includes(SV.riv)?' (la tua rivale)':(cs.some(c=>mine.has(c))?' (tua serie)':'');
  const who=o=>`${pname(o)} (${POS_NAME[posOf(o)]}, ${ovr(o)})`;
  const line=m=>m.k==='buy'?`Acquisto · ${pname(m.o)} (${POS_NAME[posOf(m.o)]}, ${ovr(m.o)}, ${m.o.age} anni) da ${m.a} a ${m.b} per ${m.fee} crediti${tag(m.a,m.b)}`
    :m.k==='swap'?`Scambio · ${who(m.x)} va a ${m.a}, ${who(m.o)} a ${m.b}${tag(m.a,m.b)}`
    :`Svincolato · ${pname(m.o)} (${POS_NAME[posOf(m.o)]}, ${ovr(m.o)}, ${m.o.age} anni) firma con ${m.b}${tag(m.b)}`;
  const top=done.slice().sort((a,b)=>b.ov-a.ov).slice(0,AIM.show),n=done.length;
  const kn=[['buy','acquisto','acquisti'],['swap','scambio','scambi'],['fa','svincolato','svincolati']].map(([k,s1,s2])=>{const c=done.filter(m=>m.k===k).length;return c?c+' '+(c===1?s1:s2):'';}).filter(Boolean).join(', ');
  alertAdd('mkt',n===1?'Mercato d’estate: un’operazione tra le altre squadre.':`Mercato d’estate: ${n} operazioni tra le altre squadre (${kn}). I colpi più grandi:`,{data:{mv:top.map(line)}});
}

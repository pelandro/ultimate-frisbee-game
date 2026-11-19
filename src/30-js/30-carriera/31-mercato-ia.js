/* ---- MERCATO TRA LE SQUADRE DEL COMPUTER (solo d'estate) ----
   Nel passaggio alla stagione nuova, dopo invecchiamento, ritiri e giovani (evolveLeague), alcune squadre del computer fanno un'operazione
   (di rado due) per sistemare la rosa: un ACQUISTO da un altro club, uno SCAMBIO Handler contro Cutter o un giocatore SVINCOLATO
   (vero: chi un club ha lasciato libero, SV.fa; chi insegue la tua squadra prende un giocatore vero di un club straniero, 33-mercato-veri.js).
   Si fa solo cio' che conviene a entrambe, misurato con la potenza di squadra (rosterPower: 60% i 7 migliori, 35% dal 8º al 14º, 5% dal 15º al 21º):
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
  show:4,                              // operazioni raccontate nella Posta
  // INSEGUIMENTO: se la tua squadra e' piu' forte della migliore delle altre della serie piu' alta di oltre chGap punti, le chN piu' forti investono
  // per inseguirti: sempre attive, budget e tetto degli stipendi piu' alti, possono comprare da club di ogni livello e trovare all'estero un giocatore
  // sopra il loro livello (chFa: quanto sopra, per ogni punto di distacco, fino a chMax). Non frena la tua crescita: rende il campionato conteso
  chGap:3, chN:3, chBud:0.35, chBudMax:3, chWage:0.25, chFa:0.5, chMax:6, chMoves:3
};
const aimTop=n=>(SV.cyc&&SV.cyc[n]||0)>=1||clubLvl(n)>=0.8;   // punta al vertice: in un ciclo buono o tra i club piu' importanti
const aimReb=n=>(SV.cyc&&SV.cyc[n]||0)<=-1.5;                  // in ricostruzione: vende volentieri i veterani
// i club della serie piu' alta del tuo campionato (in Italia la Serie A, negli USA tutta la lega, nelle leghe europee il primo livello)
function aimTopTier(){
  if(isUS())return US_NAMES.slice();
  if(isLN()){const t=SV.ln&&SV.ln.T&&SV.ln.T[LN_DEF[SV.lk].tiers[0].id];return t?t.flatMap(c=>c.pools?c.pools.flat():(c.clubs||[])):[];}
  return (SV.mem&&SV.mem.A)||SERIES.A.slice();
}
// chi ti insegue quest'estate: le piu' forti della serie piu' alta, se le stacchi di oltre AIM.chGap (lead = il distacco dalla migliore)
function aimChase(names,pw){
  if(!SV.team||!SQ.length)return {set:new Set(),lead:0};
  const tt=new Set(aimTopTier()),c=names.filter(n=>tt.has(n)).sort((a,b)=>pw[b]-pw[a]);
  const lead=c.length?squadPower()-pw[c[0]]:0;
  return {set:lead>AIM.chGap?new Set(c.slice(0,AIM.chN)):new Set(),lead};
}
// valutazioni veloci con i valori dell'estate in memoria (le statistiche non cambiano durante il mercato): aimPow da' lo stesso risultato
// di rosterPower e aimWage di wageSeason, per la rosa con un giocatore in piu' (add) e/o uno in meno (rem), senza costruire rose nuove. Con rosterPower e wageSeason il mercato di una lega costava fino a quasi un secondo
const aimDesc=(a,b)=>b-a;
function aimPow(ro,add,rem,M){   // potenza (12-allenamenti-rose.js) della rosa con un giocatore in piu' (add) e/o in meno (rem), con i valori in memoria
  const v=[];for(const o of ro)if(o!==rem)v.push(M(o));if(add)v.push(M(add));
  return powerOfVals(v);
}
function aimWage(ro,add,rem,W){
  const v=[];for(const o of ro)if(o!==rem)v.push(W(o));if(add)v.push(W(add));v.sort(aimDesc);
  let s=0;for(let i=0;i<v.length;i++)s+=i<WAGE_FULL?v[i]:v[i]*0.5;return s;   // il mercato delle squadre del computer e' tarato cosi': il quarto oltre il ventesimo (wageW) vale solo per la tua rosa
}
function aimRoleOk(ro,add,rem){let n=0,h=0;for(const o of ro)if(o!==rem){n++;if(o.r==='H')h++;}if(add){n++;if(add.r==='H')h++;}return n>=AIM.minRo&&h>=AIM.minRole&&n-h>=AIM.minRole;}
function aimWeak(ro,r,M){   // il 14º della rosa (r non conta: nessun vincolo di ruolo): chi non lo supera cambia la potenza di meno di un decimo, non vale la pena provarlo
  const v=ro.map(M).sort(aimDesc);return v.length<14?(v.length?v[v.length-1]:0):v[13];
}
function aiMarket(){
  const R=Math.random,names=Object.keys(SV.rost||{}).filter(n=>n!==SV.team&&SV.rost[n]&&SV.rost[n].length>=AIM.minRo);
  if(names.length<3)return [];
  const c9=new Map(),cw=new Map(),cp=new Map();
  const M=o=>{let v=c9.get(o);if(v===undefined){v=mean9(o);c9.set(o,v);}return v;},W=o=>{let v=cw.get(o);if(v===undefined){v=wageOf(o);cw.set(o,v);}return v;},
    PR=o=>{let v=cp.get(o);if(v===undefined){v=priceOf(o);cp.set(o,v);}return v;};
  const st={},pw={};
  for(const n of names){const ro=SV.rost[n];pw[n]=aimPow(ro,null,null,M);}
  const ch=aimChase(names,pw),chK=Math.min(AIM.chBudMax,1+AIM.chBud*Math.max(0,ch.lead-AIM.chGap));
  for(const n of names){const ro=SV.rost[n],w=aimWage(ro,null,null,W),lv=clubLvl(n),c=ch.set.has(n);
    st[n]={bud:Math.round(w*(AIM.bud+AIM.budLv*lv)*(aimTop(n)?AIM.budTop:1)*(c?chK:1)),wcap:w*(1+AIM.wUp+AIM.wUpLv*lv+(c?AIM.chWage:0)),mv:0,ch:c};}
  const moved=new Set(),free=o=>o&&o.ret!==1&&!o.inj&&!moved.has(o),cap=Math.ceil(names.length/AIM.cap),done=[],fa=SV.fa||[],estSeen=new Set();
  const act=names.filter(n=>st[n].ch||R()<AIM.act+(aimTop(n)?AIM.actTop:0)+(aimReb(n)?AIM.actReb:0));
  for(let i=act.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[act[i],act[j]]=[act[j],act[i]];}
  const best=b=>{   // l'operazione migliore per il club b (quella che lo migliora di piu' tra quelle che convengono anche all'altro)
    const rb=SV.rost[b],p0=pw[b],sb=st[b];let pick=null;
    const take=(m,g)=>{if(g>(pick?pick.g:-1))pick=Object.assign(m,{g});};
    const wk={H:aimWeak(rb,'H',M),C:aimWeak(rb,'C',M)},nh=r=>wk[r]||0;
    for(const a of names){
      if(a===b||st[a].mv>=AIM.max||(!sb.ch&&Math.abs(pw[a]-p0)>AIM.dPow)||st[a].ch)continue;   // chi insegue compra anche da club di altro livello; tra inseguitrici non ci si vende i giocatori
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
    // svincolati veri (SV.fa, 33-mercato-veri.js): chi le squadre hanno lasciato libero, senza cartellino
    // come prima con gli svincolati inventati: chi resta libero non e' un titolare da vertice, al massimo AIM.faLv-5 punti sotto la forza del club
    // (senza questo limite i club di vertice si prendevano i buoni giocatori lasciati liberi dagli altri e la serie piu' alta cresceva troppo)
    if(!sb.ch)for(const o of fa){if(!free(o)||M(o)<=nh(o.r)||M(o)>p0-AIM.faLv+5)continue;const g=aimPow(rb,o,null,M)-p0;if(g>=AIM.gain&&aimWage(rb,o,null,W)<=sb.wcap&&aimRoleOk(rb,o,null))take({k:'fa',o,b,fee:0},g);}
    // chi insegue cerca all'estero, sopra il suo livello, un giocatore vero di un club straniero: il cartellino lo paga (meta' del valore), cosi' il budget conta
    else for(let i=0;i<AIM.fa;i++){
      const l0=Math.min(TAL_AI,p0+Math.min(AIM.chMax,AIM.chFa*ch.lead)-1+R()*3),x=mkAbroad(l0,R,estSeen);if(!x)continue;estSeen.add(x.o.full);const o=x.o;
      const g=aimPow(rb,o,null,M)-p0,fee=Math.round(PR(o)*0.5);if(g>=AIM.gain&&fee<=sb.bud&&aimWage(rb,o,null,W)<=sb.wcap&&aimRoleOk(rb,o,null))take({k:'est',o,b,fee,fc:x.club},g);
    }
    return pick;
  };
  const trim=(n,n0)=>{const ro=SV.rost[n];while(ro.length>Math.max(AIM.maxRo,n0)){const w=ro.slice().sort((a,b)=>M(a)-M(b)).find(o=>aimRoleOk(ro,null,o));if(!w)break;ro.splice(ro.indexOf(w),1);faAdd(w,n);}};   // come evolveLeague: chi avanza lascia la rosa e resta svincolato
  act.sort((a,b)=>st[b].ch-st[a].ch);   // chi insegue per primo, e fuori dal tetto di operazioni (cap) del resto del campionato
  let nN=0;const lim=b=>st[b].ch?AIM.chMoves:AIM.max;
  for(const b of act){
    if(!st[b].ch&&nN>=cap)break;
    for(let t=0;t<lim(b)&&st[b].mv<lim(b)&&(st[b].ch||nN<cap);t++){
      if(t>0&&!st[b].ch&&R()>=AIM.again)break;
      const m=best(b);if(!m)break;
      const rb=SV.rost[b],n0=rb.length;   // la rosa non supera la misura che aveva (o AIM.maxRo): chi compra lascia andare il piu' debole
      if(!st[b].ch)nN++;
      if(m.k==='fa'||m.k==='est'){rb.push(m.o);if(m.k==='fa'){const k=fa.indexOf(m.o);if(k>=0)fa.splice(k,1);}else abroadAdd(m.o);}
      else{const ra=SV.rost[m.a];ra.splice(ra.indexOf(m.o),1);rb.push(m.o);
        if(m.k==='swap'){rb.splice(rb.indexOf(m.x),1);ra.push(m.x);}
        st[m.a].bud+=m.fee;st[m.a].mv++;pw[m.a]=aimPow(ra,null,null,M);}
      st[b].bud-=m.fee;st[b].mv++;trim(b,n0);pw[b]=aimPow(rb,null,null,M);
      moved.add(m.o);if(m.x)moved.add(m.x);   // chi ha cambiato squadra quest'estate resta dov'e': niente acquisti rivenduti subito
      done.push(Object.assign(m,{ov:Math.max(ovr(m.o),m.x?ovr(m.x):0)}));
    }
  }
  if(ch.set.size&&done.some(m=>st[m.b].ch))news(`Le rivali vi inseguono: ${[...ch.set].join(', ')} investono sul mercato per accorciare il distacco.`);
  aiMarket.last={k:['buy','swap','fa','est'].map(k=>done.filter(m=>m.k===k).length),n:nN,nCh:done.length-nN,cap,clubs:names.length,act:act.length,per:Math.max(0,...Object.values(st).filter(s=>!s.ch).map(s=>s.mv)),perCh:Math.max(0,...Object.values(st).filter(s=>s.ch).map(s=>s.mv)),bud:Object.values(st).every(s=>s.bud>=0),ros:done.every(m=>[m.a,m.b].filter(Boolean).every(n=>aimRoleOk(SV.rost[n],null,null)))};   // per il test della carriera
  return done;
}
// la notizia della Posta: le operazioni con l'Overall piu' alto, con un segno per la tua serie e la tua rivale
function aiMarketNews(done){
  if(!done||!done.length)return;
  const mine=new Set(SV.mem&&SV.mem[SV.sr]||[]),tag=(...cs)=>cs.includes(SV.riv)?' (la tua rivale)':(cs.some(c=>mine.has(c))?' (tua serie)':'');
  const who=o=>`${pname(o)} (${POS_NAME[posOf(o)]}, ${ovr(o)})`;
  const line=m=>m.k==='buy'?`Acquisto · ${pname(m.o)} (${POS_NAME[posOf(m.o)]}, ${ovr(m.o)}, ${m.o.age} anni) da ${m.a} a ${m.b} per ${m.fee} crediti${tag(m.a,m.b)}`
    :m.k==='swap'?`Scambio · ${who(m.x)} va a ${m.a}, ${who(m.o)} a ${m.b}${tag(m.a,m.b)}`
    :m.k==='est'?`Dall’estero · ${pname(m.o)} (${POS_NAME[posOf(m.o)]}, ${ovr(m.o)}, ${m.o.age} anni)${m.fc?' da '+m.fc:''} firma con ${m.b} per ${m.fee} crediti${tag(m.b)}`
    :`Svincolato · ${pname(m.o)} (${POS_NAME[posOf(m.o)]}, ${ovr(m.o)}, ${m.o.age} anni) firma con ${m.b}${tag(m.b)}`;
  const top=done.slice().sort((a,b)=>b.ov-a.ov).slice(0,AIM.show),n=done.length;
  const kn=[['buy','acquisto','acquisti'],['swap','scambio','scambi'],['fa','svincolato','svincolati'],['est','dall’estero','dall’estero']].map(([k,s1,s2])=>{const c=done.filter(m=>m.k===k).length;return c?c+' '+(c===1?s1:s2):'';}).filter(Boolean).join(', ');
  alertAdd('mkt',n===1?'Mercato d’estate: un’operazione tra le altre squadre.':`Mercato d’estate: ${n} operazioni tra le altre squadre (${kn}). I colpi più grandi:`,{data:{mv:top.map(line)}});
}

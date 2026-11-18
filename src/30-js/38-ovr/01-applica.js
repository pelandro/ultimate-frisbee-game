/* ===================== OVERALL 2026: APPLICAZIONE AI CLUB EUROPEI E AMERICANI =====================
   La rosa di un club di queste leghe nasce da dati, stelle del mercato e riempimento, calibrati sulla forza del club (lnRoster, usRoster). Per i club del foglio di revisione
   (00-dati-ovr-2026.js) la rosa e' quella del foglio: ogni giocatore ha l'Overall, il ruolo e, se verificata, l'eta' del foglio, esatti e fuori dalla calibrazione; chi il gioco
   non aveva viene aggiunto; il riempimento inventato esce (il foglio ha gia' una rosa vera); fino a SQ_MAX giocatori, i piu' forti. Le rose italiane si compongono prima (ovrMergeIT). */
// il giocatore del foglio sovrascrive le statistiche di quello generato (stesso nome): Overall esatto nel ruolo del foglio, potenziale come per gli altri giocatori veri
function ovrSet(o,e,rng){
  const role=e.rl||(o.pos==='D'?'D':o.r),L=e.ov,st=utStats(role,L,rng);   // Overall esatto anche nella rosa che parte tua: l'abbassamento di partenza (low) non tocca chi e' nel foglio
  if(e.ld&&role==='H')statsLineaDifesa(st,L);
  const age=e.ex&&e.age?e.age+(o.star?Math.max(0,(SV.season|0)-1):0):o.age,top=Math.max(...KEYS.map(k=>st[k])),cap=clamp(top+(age<=24?8:(age<=29?4:2))+Math.floor(rng()*4),60,99);
  o.s=st;o.r=role==='H'?'H':'C';if(role==='D')o.pos='D';else delete o.pos;
  o.tl=o.tf=o.tv=cap;o.age=age;if(e.ex)delete o.ae;
  if(!o.star)o.trait=traitFor(o.full,st,o.r);   // le stelle tengono il loro tratto
}
// correzione finale della rosa di un club (kind: 'US' o 'LN'); club e rose che non sono nel foglio restano come sono, a parte chi e' uscito (OVR_OUT)
function ovrFix(club,out,seedStr,kind){
  const E=ovrEntries(club),gone=ovrOutSet(club),P=E.length?[]:ovrPart(club);
  if(!E.length&&!gone.size&&!P.length)return out;
  let res=out.filter(o=>!gone.has(ovrKey(o.full)));
  if(P.length){   // club non nel foglio: solo le correzioni singole sui giocatori che ci sono (OVR_PART), il resto della rosa resta com'e'
    const by=new Map(res.map(o=>[ovrKey(o.full),o]));
    for(const e of P){const o=by.get(e.k);if(o)ovrSet(o,e,mulberry32(hashStr(seedStr+'|ovp|'+club+'|'+e.k)));}
    return res;
  }
  if(!E.length)return res;
  if(E.length>=14)res=res.filter(o=>!o.gen);   // la rosa del foglio e' vera: niente riempimento inventato
  const have=new Map(res.map(o=>[ovrKey(o.full),o])),us=kind==='US';
  for(const e of E){
    if(us&&OVR_DUAL_US.has(club+'|'+e.k))continue;
    const rng=mulberry32(hashStr(seedStr+'|ovr|'+club+'|'+e.k)),o=have.get(e.k);
    if(o){ovrSet(o,e,rng);continue;}
    const role=e.rl||'C';
    const a0=us?usAgeOf(e.sur,e.nm,e.age||22+hashStr(e.k)%12):lnAgeOf(e.sur+' '+e.nm,0,0);
    const ag=e.ex&&e.age?[e.age,true]:(a0[1]||ROSTER_AGE_EST_2026[e.k]||!e.age||us?a0:[e.age,false]);
    const c=usCard(e.sur,e.nm,ag[0],role,e.ov,rng,ag[1]?{}:{ae:1});
    if(e.ld&&role==='H'){statsLineaDifesa(c.s,e.ov);const top=Math.max(...KEYS.map(k=>c.s[k]));c.tl=c.tf=c.tv=clamp(top+(ag[0]<=24?8:(ag[0]<=29?4:2)),60,99);}
    c.nat=club;res.push(c);have.set(e.k,c);
  }
  if(res.length>SQ_MAX)res=res.sort((a,b)=>ovrX(b)-ovrX(a)).slice(0,SQ_MAX);   // il limite di rosa del gioco: restano i piu' forti
  return res;
}
// le carte «internazionali» del mercato (STARS) valgono quanto nel foglio, cosi' lo stesso giocatore ha lo stesso Overall sul mercato e nel suo club
(function(){
  const by={};
  for(const club in OVR_2026)for(const e of ovrEntries(club))(by[e.k]||(by[e.k]=[])).push({club,ov:e.ov});
  for(const r of STARS){
    const k=ovrKey(r[1]+' '+r[0]),club=US_STAR_CLUB[usStarKey(r)]||LN_STAR_CLUB[usStarKey(r)],l=by[k];if(!l)continue;
    const m=l.find(x=>x.club===club)||(l.every(x=>x.ov===l[0].ov)?l[0]:null);   // due persone con lo stesso nome e livelli diversi: si guarda il club
    if(m)r[4]=m.ov;
  }
})();

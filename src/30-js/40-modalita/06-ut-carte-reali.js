/* ---- Ultimate Team: le carte dei pacchetti sono giocatori veri dei campionati della carriera (Italia, USA, Belgio, Francia, Germania, Regno Unito) ----
   Il catalogo si costruisce una volta sola dalle rose di tutti i club (le stesse di foreignRoster, con lo stesso seme: un giocatore ha sempre le stesse statistiche),
   scartando i giocatori inventati per riempire le rose. Ogni pacchetto sceglie, per ruolo e rarita', un giocatore vero con l'Overall piu' vicino a quello estratto. */
let utCat=null;
function utCatalog(){
  if(utCat)return utCat;
  const sv=SV,seen=new Map();
  SV={};   // le rose dei club non devono dipendere dalla carriera aperta (stagione, campionato): il catalogo e' lo stesso per tutti
  try{
    for(const n of allClubs()){
      let ro;try{ro=foreignRoster(n,'utcat');}catch(e){continue;}
      for(const o of ro){
        if(!o||o.gen||!o.s||/\(g\d+\)/.test(o.full||''))continue;
        const k=o.full||o.label||o.n;if(seen.has(k))continue;   // chi sta in due leghe compare una volta sola
        const r=o.r==='H'?'H':'C',c={n:o.n,full:k,label:o.label||o.n,sur:o.sur,gen:false,r,age:o.age|0||24,tl:99,tf:99,tv:99,s:Object.assign({},o.s),trait:o.trait,pos:o.pos,up:0,cl:n,f:!!o.f};
        fillStats(c.s);c.ovr=ovr(c);
        seen.set(k,{c,ps:posOf(c),ov:c.ovr});
      }
    }
  }finally{SV=sv;}
  return utCat=[...seen.values()];
}
// un giocatore vero di ruolo ps (H, C o D) con l'Overall vicino a target: uno a caso tra i 5 piu' vicini che non hai gia' (taken = nomi completi gia' in squadra o nel pacchetto)
function utRealPick(ps,target,rng,taken){
  const cand=utCatalog().filter(x=>x.ps===ps&&!taken.has(x.c.full));
  if(!cand.length)return null;
  cand.sort((a,b)=>Math.abs(a.ov-target)-Math.abs(b.ov-target)||(a.c.full<b.c.full?-1:1));
  const x=cand[Math.floor(rng()*Math.min(5,cand.length))];
  return Object.assign({},x.c,{s:Object.assign({},x.c.s)});
}
// la carta di un pacchetto: giocatore vero; se il catalogo non basta (tutti gia' posseduti) resta quella inventata
function utCardFor(role,ovr0,rng,taken){
  const c=utRealPick(role==='H'?'H':(role==='D'?'D':'C'),ovr0,rng,taken)||utPlayer(role,ovr0,rng);
  taken.add(c.full);return c;
}

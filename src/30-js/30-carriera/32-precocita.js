/* ===================== PRECOCITA' DEI GIOVANI VERI =====================
   Prima la fascia del margine di crescita (realGap) di un giocatore vero era estratta a caso: un diciassettenne gia' titolare in Serie C poteva
   pescare «nella media» e fermarsi a 70, mentre un coetaneo qualunque pescava «talento». Ora per chi ha fino a PREC_AGE anni la fascia dipende
   soprattutto da quanto e' avanti rispetto ai coetanei (un anno in piu' o in meno): il suo livello di oggi meno il livello della sua serie, cosi'
   un ragazzo che spicca in Serie C conta come uno che spicca in Serie A. Una parte resta a caso (seme della carriera), per non rendere ogni
   carriera uguale. Le proporzioni delle fasce (14/44/28/11/3) restano le stesse: cambia chi ci finisce, non quanti. */
const PREC_AGE=23,PREC_W=0.7;   // eta' massima e peso della precocita' (il resto e' caso)
let precMap=null;
function realPrec(full,age){
  if(age>PREC_AGE)return undefined;
  if(!precMap){
    precMap={};   // vuota mentre si costruisce: le rose di prova qui sotto usano la fascia a caso
    const all=[];
    for(const sr of ['A','B','C'])for(const n of SERIES[sr]){
      if(!REAL[n])continue;
      const r=realRoster(REAL[n],'prec|'+n,realOpt(n,7)),lv=rosterLevel(r);
      for(const o of r)if(!o.gen&&o.age<=PREC_AGE)all.push({k:o.full+'|'+o.age,age:o.age,z:ovrX(o)-lv});
    }
    const m={};
    for(const x of all){
      const peers=all.filter(y=>Math.abs(Math.max(y.age,15)-Math.max(x.age,15))<=1);   // sotto i 15 anni sono pochissimi: contano come quindicenni
      let lo=0,eq=0;for(const y of peers){if(y.z<x.z)lo++;else if(y.z===x.z)eq++;}
      m[x.k]=(lo+eq/2)/peers.length;
    }
    precMap=m;
  }
  return precMap[full+'|'+age];
}
// mescola precocita' (p) e caso (h), entrambi tra 0 e 1, e riporta il risultato a una distribuzione uniforme (somma pesata di due uniformi:
// la sua funzione di ripartizione e' un trapezio): cosi' realGap trova le fasce nelle stesse proporzioni di prima
function precMix(p,h){
  const a=PREC_W,b=1-PREC_W,x=a*p+b*h;
  return x<b?x*x/(2*a*b):(x<=a?(x-b/2)/a:1-(1-x)*(1-x)/(2*a*b));
}

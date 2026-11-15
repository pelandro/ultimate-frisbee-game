/* ===================== POTENZIALE DEI GIOVANI: UNA SCOMMESSA =====================
   Prima il potenziale di ogni giovane (mercato, vivaio, provino) stava da +3 a +26 sopra la forza della TUA squadra, in modo uniforme: nessuno deludeva
   e ogni nuova leva superava quella prima, cosi' la rosa saliva da sola. Ora il riferimento e' soprattutto il livello della serie in cui giochi
   (le altre squadre della tua divisione), un po' la tua squadra e la reputazione; e il potenziale cade in una fascia, quasi sempre quelle di mezzo.
   Il ragazzo del provino e' il piu' prevedibile: e' del posto, conta solo la serie, e i talenti (come le delusioni) sono rarissimi.
   Anche i giovani delle squadre del computer (08-evoluzione-campionato.js) usano le fasce, attorno al livello della loro rosa. */
const POT_BANDS={   // [peso %, da, a] = scarto del potenziale dal riferimento: delusione, nella media, buono, talento, fenomeno
  mkt:[[14,-9,-3],[44,-3,4],[28,4,10],[11,10,16],[3,16,24]],
  prov:[[6,-8,-3],[67,-3,4],[22,4,9],[4.5,9,15],[0.5,15,22]]
};
const POT_VIV=[-1.4,-1.6,1.6,1,0.4];   // ogni livello del vivaio sposta un po' di probabilita' verso le fasce alte (mercato e vivaio, non il provino)
function seriesPow(){   // forza media delle altre squadre della tua divisione (girone o Conference)
  const ns=((SV.mem&&SV.mem[SV.sr])||[]).filter(n=>n!==SV.team);
  return ns.length?ns.reduce((a,n)=>a+teamPow(n),0)/ns.length:squadPower();
}
// riferimento: il livello della serie conta piu' della tua squadra. Sotto la media della serie (per esempio appena promosso) il mercato ti offre giocatori
// della categoria, cosi' puoi rinforzarti spendendo; sopra la media cresce molto meno della tua forza: prima seguiva la tua squadra e ogni anno
// arrivavano giocatori piu' forti dei tuoi, fino a rose da 95 anche in Italia
function potRef(kind){
  const S=seriesPow(),T=squadPower(),rp=kind==='adult'?0:clamp(((SV.rep|0)-50)*0.04,-2,2);
  if(kind==='prov')return S;
  const wT=kind==='viv'?0.4:(kind==='adult'?0.2:0.3);   // sotto la media: quanto conta ancora la tua forza (poco: chi sale trova giocatori della categoria, se li paga)
  return (T<=S?S+wT*(T-S):S+0.4*(T-S))+rp;
}
// adulto del mercato: livello l0, potenziale con il margine dell'eta' (come i giocatori veri, realGap)
const adultPot=(l0,age,R)=>potB(l0+1.5+Math.max(0,realGap(age,R())));
function potDraw(kind,ref,R,viv){   // ritorna il potenziale (Overall) estratto e la fascia
  const B=POT_BANDS[kind==='prov'?'prov':'mkt'],w=B.map((b,i)=>Math.max(0.2,b[0]+(kind==='prov'?0:(viv||0)*POT_VIV[i])));
  let t=w.reduce((a,b)=>a+b,0),r=R()*t,i=0;for(;i<w.length-1;i++){r-=w[i];if(r<=0)break;}
  return {p:clamp(ref+B[i][1]+R()*(B[i][2]-B[i][1]),45,99),band:i};
}
// da potenziale voluto a base dei talenti di genPlayer (che sopra 90 li comprime): POT_OFF e' lo scarto medio misurato tra la base e il potenziale che ne esce
const POT_OFF=1.1;
const potB=P=>{const b=P-POT_OFF;return b>90?90+(b-90)/0.45:b;};
function potNews(){   // dopo l'estate: le sorprese (20-sorprese-crescita.js) dei tuoi diventano notizie; quelle delle altre squadre restano silenziose
  for(const p of SQ){
    if(!p.pvx)continue;
    if(p.pvx<0)alertAdd('dec',`${pname(p)} (${p.age} anni) sembra essersi fermat${oa(p)}: il suo potenziale è più basso di quanto si pensava.`,{full:p.full});
    else alertAdd('up',`${pname(p)} (${p.age} anni) ha sorpreso tutti: il suo potenziale è più alto di quanto si pensava.`,{full:p.full});
    delete p.pvx;
  }
  for(const n in SV.rost)for(const o of SV.rost[n]||[])if(o.pvx)delete o.pvx;
}

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
  return ns.length?ns.reduce((a,n)=>a+teamLevel(n),0)/ns.length:squadLevel();   // livello dei titolari, non potenza
}
// riferimento: il livello della serie conta piu' della tua squadra. Sotto la media della serie (per esempio appena promosso) il mercato ti offre giocatori
// della categoria, cosi' puoi rinforzarti spendendo; sopra la media cresce molto meno della tua forza: prima seguiva la tua squadra e ogni anno
// arrivavano giocatori piu' forti dei tuoi, fino a rose da 95 anche in Italia
// LIVELLO EUROPEO: chi gioca nella serie piu' alta di un campionato che manda squadre al Campionato europeo non si misura solo con le rivali di casa.
// In Inghilterra o in Germania le migliori sono gia' sopra tutte le altre (Clapham 82,5 contro 77,5; Wall City 86 contro 74), ma le migliori d'Europa
// stanno intorno a 88: senza questo il freno per chi domina (carGrowK) le avrebbe fermate prima di diventare competitive in Europa.
let euTopC=0;
const euTop=()=>euTopC||(euTopC=Math.max(...SERIES.A.map(n=>TEAM[n].power),...LN_IDS.filter(k=>LN_DEF[k].eu).flatMap(k=>LN_NAMES.filter(n=>LN_BY[n].lk===k&&LN_BY[n].t===LN_DEF[k].tiers[0].id).map(n=>LN_BY[n].p))));
const euTier=()=>!!SV&&!isUS()&&(isLN()?!!(LN_DEF[SV.lk]&&LN_DEF[SV.lk].eu&&SV.ln&&lnTiers().findIndex(t=>t.id===SV.ln.tier)===0):SV.sr==='A');
const EU_GAP=8;   // nel mercato di queste serie la media non scende sotto il livello europeo meno 8 (la Serie A, a 81, non cambia)
function potRef(kind){
  let S=seriesPow();if(kind!=='prov'&&euTier())S=Math.max(S,euTop()-EU_GAP);
  const T=squadLevel(),rp=kind==='adult'?0:clamp(((SV.rep|0)-50)*0.04,-2,2);
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
/* ---- CRESCITA SECONDO LA SERIE: piu' facile in basso, via via piu' dura ----
   Moltiplica allenamenti ed esperienza dei tuoi giocatori: Serie C 1,35, Serie B 1,15, Serie A 0,9 (USA e leghe europee secondo SR_K, cioe' il peso
   della categoria). In piu', se la tua squadra e' gia' piu' forte della migliore delle altre della tua divisione (e, nelle serie con posti europei,
   anche delle migliori d'Europa: euTop), si cresce meno (fino alla meta'):
   prima chi dominava continuava a staccarsi (97 contro 92 della seconda). Le squadre del computer non lo usano. */
const srGrowK=sr=>clamp(1.35-((SR_K[sr]||1)-1)*0.7,0.9,1.35);
const LEAD_K=0.08;   // per ogni punto di forza sopra la migliore delle altre, l'8% di crescita in meno (al massimo la meta')
let cgk={key:'',v:1};   // calcolo una volta a giornata: trainMul lo chiede per ogni giocatore e ogni anteprima
function carGrowK(){
  if(!SV||!SV.team)return 1;
  const key=SV.team+'|'+SV.season+'|'+SV.sr+'|'+(SV.played|0);if(cgk.key===key)return cgk.v;
  const k=srGrowK(SV.sr);
  const ns=((SV.mem&&SV.mem[SV.sr])||[]).filter(n=>n!==SV.team);
  const lead=ns.length?matchLevel(SV.team)-Math.max(...ns.map(matchLevel),euTier()?euTop():0):0;   // nelle serie con posti europei il riferimento e' anche il livello europeo
  cgk={key,v:k*(lead>0?clamp(1-LEAD_K*lead,0.5,1):1)};return cgk.v;
}

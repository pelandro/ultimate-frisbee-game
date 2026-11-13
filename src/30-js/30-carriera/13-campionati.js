/* ---- CAMPIONATI PERSISTENTI, RIVALITA' E STORIE ----
   Le due serie in cui non giochi (SV.lg[A|B|C]) hanno ora un calendario vero: a ogni tua giornata giocano la loro, con classifica, risultati e serie
   consultabili in Classifica. A fine stagione le promozioni e le retrocessioni usano quelle classifiche, non piu' un campionato simulato in un colpo.
   Le storie (SV.story): sorprese, serie di vittorie, giro di boa, vincitori delle serie. La rivalita' (SV.riv) e' con la squadra del tuo girone
   piu' vicina per forza: sfidarla vale di piu' (incasso, morale, reputazione), perderla pesa di piu'. */
function story(txt,toNews){
  if(!SV.story)SV.story=[];
  SV.story.unshift({s:SV.season,r:(SV.round|0)+1,txt});if(SV.story.length>24)SV.story.length=24;
  if(toNews)news(txt);
}
function leagueBegin(){
  if(isUS())return usLeagueBegin();
  SV.lg={};
  for(const sr of ['A','B','C'])if(sr!==SV.sr&&SV.mem[sr]&&SV.mem[sr].length){const n=SV.mem[sr];SV.lg[sr]={sched:roundRobin(n.length),round:0,tab:freshTab(n),last:[],streak:{}};}
}
function leagueNote(sr,L,a,b,sa,sb){
  const w=sa>sb?a:b,l=sa>sb?b:a,gap=teamPow(l)-teamPow(w);
  L.streak[w]=(L.streak[w]|0)+1;L.streak[l]=0;
  if(gap>=9&&Math.random()<0.6)story(`Sorpresa in ${SERIES_NAME[sr]}: ${w} batte ${l} ${Math.max(sa,sb)}–${Math.min(sa,sb)}.`,Math.random()<0.3);
  if(L.streak[w]===5)story(`${w} è a cinque vittorie di fila in ${SERIES_NAME[sr]}.`,false);
}
// porta le altre serie al punto della stagione che hai raggiunto tu
function leagueAdvance(){
  if(isUS())return usLeagueAdvance();
  if(!SV.lg||!SV.sched)return;
  const R=SV.sched.length;
  for(const sr in SV.lg){
    const L=SV.lg[sr],n=SV.mem[sr],upto=SV.done||SV.round>=R?L.sched.length:Math.min(L.sched.length,Math.floor(SV.round*L.sched.length/R));
    while(L.round<upto){
      const last=[];
      for(const [i,j] of L.sched[L.round]){const a=n[i],b=n[j],[sa,sb]=simPower(a,b);addRes(L.tab,a,b,sa,sb);last.push([a,b,sa,sb]);leagueNote(sr,L,a,b,sa,sb);}
      L.last=last;L.round++;
    }
  }
}
const lgTab=sr=>sr===SV.sr?SV.tab:(SV.lg&&SV.lg[sr]?SV.lg[sr].tab:null);
function leagueHalf(){   // giro di boa: la fotografia delle tre serie
  for(const sr of ['A','B','C']){
    const t=lgTab(sr);if(!t)continue;const o=ranking(t,SV.mem[sr]);
    story(`Giro di boa in ${SERIES_NAME[sr]}: capolista ${o[0]} (${t[o[0]].pts} punti), ultima ${o[o.length-1]}.`,false);
  }
}
function leagueEndStories(order,res){
  for(const sr of ['A','B','C']){
    if(sr===SV.sr)continue;
    const o=order[sr];if(!o)continue;
    const w0=sr==='A'&&res&&res.A?res.A.win:o[0];
    if(res&&res[sr])story(sr==='A'?`${res[sr].win} è campione d’Italia: batte ${res[sr].runner} in finale ${Math.max(res[sr].fin[2],res[sr].fin[3])}–${Math.min(res[sr].fin[2],res[sr].fin[3])}.`:`Spareggio promozione in ${SERIES_NAME[sr]}: sale ${res[sr].win}.`,false);
    story(`${w0} vince la ${SERIES_NAME[sr]}; ${sr==='A'?'':'sale'+(PROMO>1?'no':'')+' con '+o.slice(1,PROMO).join(' e ')+(PROMO>1?'':'')+'. '}${sr==='C'?'':'In coda: '+o.slice(-PROMO).join(' e ')+'.'}`.replace(/; \. /,'. ').replace(/ con \./,'.'),false);
  }
}
/* ---- rivalita' ---- */
function pickRival(){
  const names=(SV.mem[SV.sr]||[]).filter(n=>n!==SV.team);
  if(SV.riv&&names.includes(SV.riv)&&Math.random()<0.75)return;   // le rivalita' durano
  const me=teamPow(SV.team),pw=teamPow;
  SV.riv=names.slice().sort((a,b)=>Math.abs(pw(a)-me)-Math.abs(pw(b)-me))[Math.floor(Math.random()*3)]||null;
  SV.rivRec={w:0,l:0};
  if(SV.riv)news('Nasce una rivalità con '+SV.riv+': sfidarla vale di più.');
}
function derbyAfter(opp,win){   // dopo una partita del tuo campionato
  if(!SV.riv||opp!==SV.riv)return '';
  if(!SV.rivRec)SV.rivRec={w:0,l:0};
  if(win){SV.rivRec.w++;SV.rep=clamp(SV.rep+1.5,0,100);SV.mor=clamp(SV.mor+4,0,100);const c=Math.round(10*SR_K[SV.sr]);SV.cash+=c;story(`Derby vinto contro ${opp}: +${c} crediti, morale e reputazione in crescita.`,true);return ` Derby vinto: +${c} crediti.`;}
  SV.rivRec.l++;SV.mor=clamp(SV.mor-3,0,100);story(`Derby perso contro ${opp}: lo spogliatoio ci è rimasto male.`,true);return ' Derby perso: morale in calo.';
}
const derbyTxt=()=>SV.riv?`Rivalità con ${esc(SV.riv)}: ${(SV.rivRec&&SV.rivRec.w)|0} vittorie, ${(SV.rivRec&&SV.rivRec.l)|0} sconfitte`:'';

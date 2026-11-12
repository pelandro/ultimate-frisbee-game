/* ---- TIFOSI, FACCINE DELL'UMORE e STELLE ----
   Tifosi (SV.fans, 0-100): salgono con le vittorie e calano con le sconfitte; le Tribune li fanno salire di piu' dopo una vittoria e scendere di meno dopo una sconfitta
   (a livello 5 una sconfitta quasi non pesa). Sono loro, non la reputazione, a decidere l'incasso delle partite: la reputazione resta per chi accetta di venire.
   Nelle carriere gia' avviate partono dalla reputazione, cosi' i conti non cambiano di colpo.
   Faccine: l'umore di un giocatore (moodKey) e della squadra (teamMoodKey) in quattro stati: contento, cosi' cosi', deluso, arrabbiato.
   Stelle: da mezza a cinque, dall'Overall (starsOf): colpo d'occhio sulle carte della rosa; il numero resta nella scheda. */
const fansOf=()=>clamp(SV&&SV.fans!==undefined?SV.fans:(SV&&SV.rep)||0,0,100);
function fansBump(win,extra){
  const st=facLv('stad'),f=fansOf();
  const d=(win?2.6+0.7*st:Math.min(-0.4,-3.2+0.7*st))+(extra||0)+(win&&hasTr('coach','fan')?0.4:0)+(50-f)*0.02;   // il piatto della bilancia si sposta piano verso il centro: i tifosi non salgono all'infinito
  SV.fans=clamp(f+d,0,100);
}
function fansSeason(rank,nsr,sr){   // a fine stagione: scudetto, promozione, retrocessione
  let d=0;if(sr==='A'&&rank===1)d+=6;if(nsr<sr)d+=5;else if(nsr>sr)d-=7;
  SV.fans=clamp(fansOf()+d,0,100);
}
const starsOf=ovr=>Math.round(clamp((ovr-36)/12,0.5,5)*2)/2;
function starsHTML(n){let h='';for(let i=1;i<=5;i++)h+=`<i class="st ${n>=i?'f':(n>=i-0.5?'h':'e')}"></i>`;return `<span class="stars" aria-label="${n} stelle">${h}</span>`;}
function moodKey(p){
  if(p.mood===2)return 'a';
  if(p.mood===1)return 's';
  if((p.idle|0)>=3||SV.mor<40)return 'o';
  return 'g';
}
const teamMoodKey=()=>SV.mor>=70?'g':(SV.mor>=45?'o':(SV.mor>=25?'s':'a'));
const MOOD_TXT={g:'contento',o:'così così',s:'deluso',a:'arrabbiato'};
const MOOD_COL={g:'#ffd23f',o:'#ff9a3a',s:'#ff7a5c',a:'#e03a3a'};
// faccina a pixel 12x12: testa, occhi e bocca secondo l'umore
function moodFace(k){
  const c=MOOD_COL[k]||MOOD_COL.o,o='#1a1020';
  const mouth={g:'<rect x="3" y="8" width="1" height="1"/><rect x="4" y="9" width="4" height="1"/><rect x="8" y="8" width="1" height="1"/>',o:'<rect x="3" y="9" width="6" height="1"/>',s:'<rect x="3" y="9" width="1" height="1"/><rect x="4" y="8" width="4" height="1"/><rect x="8" y="9" width="1" height="1"/>',a:'<rect x="3" y="9" width="1" height="1"/><rect x="4" y="8" width="4" height="1"/><rect x="8" y="9" width="1" height="1"/><rect x="2" y="3" width="3" height="1"/><rect x="7" y="3" width="3" height="1"/>'}[k]||'';
  return `<svg class="mf" viewBox="0 0 12 12" width="14" height="14" shape-rendering="crispEdges" role="img" aria-label="${MOOD_TXT[k]}"><title>${MOOD_TXT[k]}</title><rect x="2" y="1" width="8" height="10" fill="${o}"/><rect x="1" y="2" width="10" height="8" fill="${o}"/><rect x="2" y="2" width="8" height="8" fill="${c}"/><g fill="${o}"><rect x="3" y="5" width="2" height="2"/><rect x="7" y="5" width="2" height="2"/>${mouth}</g></svg>`;
}

/* ---- MOMENTI DECISIVI ----
   1) Cartello di presentazione prima delle partite che contano (carriera): finali e semifinali europee, derby, ultima giornata con qualcosa in palio,
      ultima partita di un veterano. Si chiude con un tocco; la partita aspetta (G.schemeOpen).
   2) Match point e universe point: quando una squadra e' a un punto dalla vittoria una fascia lo annuncia all'inizio della meta;
      se lo sono tutte e due e' UNIVERSE POINT, con il boato del pubblico. */
function showIntro(m){
  const st=matchStakes(m);if(!st)return false;
  $('inTag').textContent=st.tag;$('inTitle').textContent=st.title;
  $('inVs').innerHTML=`<span>${crest(SV.team,34)}<b>${esc(SV.team)}</b></span><i>contro</i><span>${crest(m.name,34)}<b>${esc(m.name)}</b></span>`;
  $('inLines').innerHTML=st.lines.map(l=>`<li>${esc(l)}</li>`).join('');
  G.schemeOpen=true;$('intro').classList.remove('hidden');return true;
}
$('inGo').addEventListener('click',()=>{$('intro').classList.add('hidden');if($('menu').classList.contains('hidden'))G.schemeOpen=false;});
let momPt=-1;
function momentTick(){
  if(!G.inMatch||G.drill||G.mode!=='ready'||G.schemeOpen||momPt===G.pointNo)return;
  momPt=G.pointNo;
  const a=G.score[0],b=G.score[1],t=G.target-1;
  if(a===t&&b===t){band={txt:'UNIVERSE POINT',t:2.4,max:2.4,c:PAL.gold};HOOKS.sfx('crowd',0.8);HOOKS.vibe(30);}
  else if(a===t||b===t){band={txt:a===t?'MATCH POINT':'MATCH POINT PER LORO',t:1.7,max:1.7,c:a===t?PAL.green:PAL.red};HOOKS.sfx('crowd',0.35);}
}

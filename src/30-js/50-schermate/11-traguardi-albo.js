/* ---- SOCIETA': traguardi, albo d'oro della lega (numeri romani) e Hall of Fame a carte dorate ---- */
function roman(n){
  n=Math.max(1,n|0);let s='';
  for(const [v,r] of [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']])while(n>=v){s+=r;n-=v;}
  return s;
}
function achHTML(){
  const g=achPct(),st=ACH.map(achState).sort((a,b)=>(a.done-b.done)||(b.pct-a.pct));   // prima quelli in corso, i più vicini in alto; gli ottenuti in fondo
  return `<div class="ccard achtop"><h3>Traguardi</h3><div class="achbig"><b>${g.pct}%</b><span>${g.n} su ${g.tot} completati</span></div><div class="achbar"><i style="width:${g.pct}%"></i></div></div>
  <div class="achg">${st.map(a=>`<div class="ach${a.done?' on':''}"><h4>${a.done?'<em>✓</em> ':''}${esc(a.name)}</h4><p>${esc(a.txt)}</p><div class="achbar"><i style="width:${a.pct}%"></i></div><span>${a.done?`Raggiunto · stagione ${a.s}`:`${a.v} / ${a.goal} · premio ${a.rw}`}</span></div>`).join('')}</div>`;
}
// albo d'oro della Serie A: un'edizione per riga, in numeri romani; la tua squadra è in oro
function albHTML(){
  const a=SV.alb||[];
  if(!a.length)return '<p class="note">Qui comparirà l’albo d’oro della Serie A: a fine stagione, dopo la finale dei playoff, si aggiunge il nome della campione, scritto in numeri romani.</p>';
  return `<ul class="albl">${a.map(e=>`<li class="${e.champ===SV.team?'me':''}"><i>${roman(e.s)}</i>${crest(e.champ,18)}<b>${esc(e.champ)}</b><span class="sc">${e.ft?e.ft[0]+'–'+e.ft[1]+' su ':'finale su '}${esc(e.run)}</span></li>`).join('')}</ul>`;
}
// Hall of Fame: una carta dorata per ogni grande ritirato (le voci di prima del cambio hanno solo i numeri: niente ruolo né volto)
function hofCard(x){
  const pos=x.pos&&ROLE_ABB[x.pos]?x.pos:'',md=(x.md||[]).map(m=>`<span class="md2" style="--mc:${m.c}"><i>${m.n}</i>${m.lab}</span>`).join('');
  return `<div class="hcard"><span class="hch"><b>HALL OF FAME</b><b>${pos?ROLE_ABB[pos]:''}</b></span>
    <span class="pca">${avatar({look:x.lk,t:x.t|0},46)}</span>
    <span class="pcn">${esc(x.nk||x.name)}</span>${x.v?starsHTML(starsOf(x.v)):''}
    <span class="hcy">${x.yrs} ${x.yrs>1?'stagioni':'stagione'} · ${x.mp} partite</span>
    <span class="hcs"><span>Mete<i>${x.g}</i></span><span>Assist<i>${x.a}</i></span><span>Difese<i>${x.b}</i></span></span>
    ${md?`<span class="medals">${md}</span>`:''}</div>`;
}
// la carta dell'allenatore, prima dei ritirati: stagioni in panchina, vittorie, titoli, promozioni
function coachCard(){
  if(!SV.coach)return '';
  return `<div class="hcard"><span class="hch"><b>IN PANCHINA</b><b>COACH</b></span><span class="pca">${avatar({look:SV.coach.lk,t:0},46)}</span><span class="pcn">${esc(coachName())}</span><span class="hcy">${SV.season} ${SV.season>1?'stagioni':'stagione'} con ${esc(SV.team)}</span><span class="hcs"><span>Vittorie<i>${winsTot()}</i></span><span>Titoli<i>${trTot()}</i></span><span>Promoz.<i>${(SV.troph&&SV.troph.promo)|0}</i></span></span></div>`;
}
function hofHTML(){
  const none=!SV.hof||!SV.hof.length;
  return `<div class="hofg">${coachCard()}${none?'':SV.hof.slice(0,12).map(hofCard).join('')}</div>${none?'<p class="note">I grandi giocatori che si ritirano dopo una carriera speciale (molte partite e mete, due premi o tre titoli) entrano qui, con una carta dorata.</p>':''}`;
}

/* ---- AZIONI SUL GIOCATORE: RIPOSO, COLLOQUIO, SOPRANNOME + ultima partita e titoli ----
   Riposo: salta la prossima partita e recupera molta condizione (come un'assenza: non e' un infortunio e non ne ha le conseguenze).
   Colloquio: costa qualche credito e solleva l'umore (da arrabbiato a deluso, da deluso a sereno, o azzera il «gioca poco»); se lo usi spesso con lo stesso
   giocatore funziona sempre meno (p.tk si riempie a ogni colloquio e cala di un quarto a ogni partita).
   Soprannome (p.nick, fino a 10 caratteri): compare in campo al posto del cognome e nella Hall of Fame.
   Anche qui: p.lm = mete, assist e difese dell'ultima partita (colonna «Partita» della scheda), p.ti = titoli di campionato vinti. */
const RIPOSO_COND=25,TALK_COST=4,NICK_MAX=10;
function restPlayer(p){
  if(p.inj)return p.abs?`${pname(p)} è già a riposo per la prossima partita.`:`${pname(p)} è infortunat${oa(p)}: il Recupero negli Allenamenti lo aiuta, il riposo non serve.`;
  if(p.cond>=95)return `${pname(p)} è in piena forma: non serve riposo.`;
  p.inj=1;p.abs=1;p.cond=clamp(p.cond+RIPOSO_COND,0,100);fixLines();
  return `${pname(p)} salta la prossima partita e recupera condizione (${Math.round(p.cond)}).`;
}
function talkPlayer(p){
  if(!p.mood&&(p.idle|0)<2&&SV.mor>=40)return `${pname(p)} è già sereno: non serve un colloquio.`;
  if(SV.cash<TALK_COST)return `Servono ${TALK_COST} crediti per il colloquio.`;
  SV.cash-=TALK_COST;
  const tk=p.tk||0,ok=Math.random()<0.88/(1+0.7*tk);p.tk=tk+1;
  if(!ok)return `Colloquio con ${pname(p)}: ascolta, ma stavolta non basta (ne hai già fatti${tk>=1?' diversi':''} da poco).`;
  if(p.mood===2){p.mood=1;return `${pname(p)} si calma: non chiede più la cessione, ma vuole giocare.`;}
  if(p.mood===1){p.mood=0;p.idle=Math.max(0,(p.idle|0)-3);p.prom=0;return `${pname(p)} ritrova il sorriso: il colloquio ha funzionato.`;}
  p.idle=0;SV.mor=clamp(SV.mor+1,0,100);return `${pname(p)} si sente ascoltat${oa(p)}: umore migliore.`;
}
const nickClean=s=>String(s||'').replace(/[^A-Za-zÀ-ÿ0-9 .'-]/g,'').trim().slice(0,NICK_MAX);
function setNick(p,s){p.nick=nickClean(s);applySurnames(SQ);}
// a ogni partita il colloquio «si consuma» meno: si ricomincia a ascoltare
function talkCool(){for(const p of SQ)if(p.tk)p.tk=Math.max(0,p.tk-0.25);}
// medaglie: quante volte ha vinto ciascun premio (dalla bacheca del giocatore) e quanti titoli
const MEDALS=[['ti','Titoli','#ffd23f'],['MVP del campionato','MVP','#ff9a3a'],['Attaccante dell’anno','Attacco','#5ac8ff'],['Difensore dell’anno','Difesa','#4fe58f'],['Capocannoniere','Mete','#ff7a5c'],['Re degli assist','Assist','#c9a0ff'],['Rivelazione dell’anno','Rivelaz.','#7fd8ff'],['Squadra ideale','Squadra','#e8ecf8']];
function medalsOf(p){
  const out=[];
  for(const m of MEDALS){const n=m[0]==='ti'?(p.ti|0):(p.aw||[]).filter(a=>a.k===m[0]).length;if(n)out.push({lab:m[1],n,c:m[2]});}
  return out;
}

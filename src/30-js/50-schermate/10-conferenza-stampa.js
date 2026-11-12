/* ---- CONFERENZA STAMPA ----
   Dopo una partita di carriera che ha un po' di storia (derby, vittoria a sorpresa, risultato largo, finale, ultima giornata, e ogni tanto una qualunque) un giornalista
   fa una domanda e tu scegli tra tre risposte, che sono sempre tre tipi di scelta:
   - SQUADRA: parli del gruppo; morale +2 dopo una vittoria, +1 dopo una sconfitta; la scelta sicura;
   - TIFOSI: parli ai tifosi; piu' tifosi (+3 dopo una vittoria, +1,5 dopo una sconfitta) ma un po' di pressione sul gruppo (morale −1);
   - GIOCATORE: nomini il migliore in campo (o chi ha dato di piu'); a lui l'umore migliora (da deluso a sereno, o azzera il «gioca poco») e il gruppo +1.
   Dura pochi secondi e si puo' saltare con un tocco: «Salta» non cambia niente. Le regole stanno qui, senza caso: la stessa risposta ha sempre lo stesso effetto. */
let pressPending=null,pressNext=null;
// contesto della partita appena finita (lo costruisce showOver)
function pressCtxOf(win,su,so,opp){
  const my=squadPower(),op=teamPow(opp);
  const diff=Math.abs(su-so),last=!!(SV.sched&&SV.round>=SV.sched.length),big=!!(SV.po&&SV.po.wasFinal);
  return {win,su,so,opp,diff,derby:opp===SV.riv,upset:win&&op-my>=5,heavy:diff>=4,close:diff<=2,last,big,seed:(SV.played|0)};
}
const pressWorthy=c=>c.derby||c.upset||c.heavy||c.big||c.last||((c.seed*37+11)%100)<40;   // niente a caso: ogni giornata e' deterministica
// migliore in campo della partita appena giocata (mete e assist pesano piu' delle difese)
function pressStar(){
  let b=null,bs=-1;for(const p of SQ){const m=p.lm||(p.m&&p.m.pts>0?{g:p.m.g|0,a:p.m.a|0,b:p.m.dif|0}:null);if(!m)continue;const v=m.g*3+m.a*3+m.b*2+(p.m&&p.m.pts>0?0.1:0);if(v>bs){bs=v;b=p;}}
  return b;
}
function pressFor(c){
  const star=pressStar(),sn=star?pname(star):'il gruppo';
  let q;
  if(c.derby)q=c.win?'Derby vinto contro '+c.opp+': che cosa dice ai tifosi?':'Un derby perso fa male: come reagisce lo spogliatoio?';
  else if(c.big)q=c.win?'Vittoria in una partita decisiva: la squadra è pronta per il salto?':'Sconfitta in una partita decisiva: è finita qui?';
  else if(c.upset)q='Avete battuto una squadra più forte sulla carta: sorpresi?';
  else if(c.win&&c.heavy)q='Una vittoria larga, '+c.su+'–'+c.so+': possiamo parlare di dominio?';
  else if(c.win&&c.close)q='Partita punto a punto, '+c.su+'–'+c.so+': che cosa ha fatto la differenza?';
  else if(c.win)q='Un’altra vittoria: qual è il segreto di questo gruppo?';
  else if(c.close)q='Solo '+(c.so-c.su)+(c.so-c.su===1?' punto':' punti')+' di scarto: ha dei rimpianti?';
  else if(c.heavy)q='Una sconfitta pesante, '+c.su+'–'+c.so+': che cosa non ha funzionato?';
  else q='Una sconfitta: che cosa porta a casa da questa partita?';
  const w=c.win;
  return {q,opts:[
    {k:'sq',tag:'Squadra',t:w?'Il merito è di tutto il gruppo.':'Abbiamo sbagliato insieme, ripartiamo da qui.',fx:{mor:w?2:1,fans:0},pid:null},
    {k:'ti',tag:'Tifosi',t:w?'Siamo i più forti: i tifosi possono sognare.':'Ai tifosi prometto una reazione: il carattere non ci manca.',fx:{mor:-1,fans:w?3:1.5},pid:null},
    {k:'gi',tag:'Giocatore',t:star?(w?sn+' è stato decisivo.':sn+' ha dato tutto, non ha colpe.'):'Voglio ringraziare chi è sceso in campo.',fx:{mor:1,fans:0},pid:star?star.full:null}
  ]};
}
// applica una risposta; ritorna il testo dell'effetto («Morale +2 · Tifosi +3»)
function pressApply(o){
  const out=[];
  if(o.fx.mor){SV.mor=clamp(SV.mor+o.fx.mor,0,100);out.push('Morale '+(o.fx.mor>0?'+':'−')+Math.abs(o.fx.mor));}
  if(o.fx.fans){SV.fans=clamp(fansOf()+o.fx.fans,0,100);out.push('Tifosi +'+(Math.round(o.fx.fans*10)/10).toString().replace('.',','));}
  const p=o.pid?byFull(o.pid):null;
  if(p){if(p.mood>0){p.mood--;out.push(pname(p)+' si sente meglio');}else if((p.idle|0)>0){p.idle=0;out.push(pname(p)+' si sente valorizzat'+oa(p));}else out.push(pname(p)+' apprezza');}
  return out.join(' · ');
}
function openPress(c){
  if(!c||!pressWorthy(c)||overlayBusy())return false;
  const pr=pressFor(c);pressPending=pr;
  $('prQ').textContent='«'+pr.q+'»';$('prRes').textContent='';$('prRes').classList.add('hidden');
  $('prOpts').classList.remove('hidden');$('prSkip').textContent='Salta';
  $('prOpts').innerHTML=pr.opts.map((o,i)=>`<button type="button" class="pro" data-pr="${i}"><small>${o.tag}</small><span>${esc(o.t)}</span></button>`).join('');
  $('press').classList.remove('hidden');return true;
}
$('prOpts').addEventListener('click',e=>{
  const b=e.target.closest('[data-pr]');if(!b||!pressPending)return;
  const o=pressPending.opts[+b.dataset.pr];pressPending=null;
  const r=pressApply(o);persist();
  $('prOpts').classList.add('hidden');$('prRes').textContent=r||'Nessun effetto';$('prRes').classList.remove('hidden');$('prSkip').textContent='OK';
  if(!$('home').classList.contains('hidden'))renderHome();
});
$('prSkip').addEventListener('click',()=>{$('press').classList.add('hidden');pressPending=null;});

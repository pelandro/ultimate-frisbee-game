/* ---- PLAYOFF ----
   Dopo le 15 giornate:
   - Serie A: le prime 4 giocano le semifinali (1ª contro 4ª, 2ª contro 3ª) e la finale: chi vince e' campione d'Italia (non piu' chi chiude primo);
   - Serie B e C: il 1° sale direttamente, dal 2° al 5° posto si gioca uno spareggio (2ª contro 5ª, 3ª contro 4ª, finale) per la seconda promozione.
   Le promozioni sono sempre due e le retrocessioni sempre due: cambia solo chi sale e chi vince il titolo. Premi di classifica e obiettivo restano quelli della stagione regolare.
   Se la tua squadra e' nella zona playoff le partite le giochi (o le simuli) una alla volta, con la presentazione delle partite che contano; altrimenti, come per le altre
   serie, il tabellone si simula alla fine della stagione. SV.po = tabellone in corso (on = ci sono partite da giocare), SV.poRes = esito del tuo tabellone da usare in endSeason.
   Forma di un esito (poRes): {kind:'tit'|'pro', teams:[4 squadre per testa di serie], semi:[[a,b,sa,sb,vincitore],[...]], fin:[a,b,sa,sb,vincitore], win, runner}. */
const PO_NAME={tit:'Playoff scudetto',pro:'Spareggio promozione'};
function poZone(sr,order){
  const o=order[sr]||[];
  if(sr==='A')return o.length>=8?{kind:'tit',teams:o.slice(0,4)}:null;
  return o.length>=8?{kind:'pro',teams:o.slice(1,5)}:null;
}
function poPlay(a,b){const r=simMatch(teamPow(a),teamPow(b),0,carLen());return [a,b,r.a,r.b,r.a>r.b?a:b];}
function poSimFinal(semi,kind,teams){
  const f=poPlay(semi[0][4],semi[1][4]);
  return {kind,teams,semi,fin:f,win:f[4],runner:f[4]===f[0]?f[1]:f[0]};
}
function poSimAll(z){const t=z.teams;return poSimFinal([poPlay(t[0],t[3]),poPlay(t[1],t[2])],z.kind,t);}
// il tabellone dell'altra serie, o del tuo se non ci sei dentro: sempre simulato
function poResolve(sr,order){
  if(sr===SV.sr&&SV.poRes)return SV.poRes;
  const z=poZone(sr,order);return z?poSimAll(z):null;
}
// fine delle giornate: se sei nella zona playoff parte il tabellone, altrimenti si chiude la stagione
function poBegin(){
  const names=SV.mem[SV.sr],order={[SV.sr]:ranking(SV.tab,names)},z=poZone(SV.sr,order);
  if(!z||!z.teams.includes(SV.team)){endSeason();return;}
  const t=z.teams,me=t.indexOf(SV.team),mi=me===0||me===3?0:1,pair=mi===0?[t[0],t[3]]:[t[1],t[2]],other=mi===0?[t[1],t[2]]:[t[0],t[3]];
  SV.po={on:true,kind:z.kind,teams:t,round:0,mi,opp:pair[0]===SV.team?pair[1]:pair[0],other:poPlay(other[0],other[1]),semi:[null,null],fin:null,last:null,need:mi===0||mi===3?'':''};
  SV.poRes=null;news(`${PO_NAME[z.kind]}: ${me+(z.kind==='tit'?1:2)}ª in classifica, la semifinale è contro ${SV.po.opp}.`);
}
function poLabel(){const po=SV.po;return PO_NAME[po.kind]+' · '+(po.round===0?'Semifinale':'Finale');}
// risultato di una tua partita di playoff (giocata o simulata); ritorna il messaggio
function poRecord(win,su,so){
  const po=SV.po,opp=po.opp,rec=[SV.team,opp,su,so,win?SV.team:opp];
  po.last={opp,su,so,win,label:po.round===0?'Semifinale':'Finale'};
  if(po.round===0){
    po.semi[po.mi]=rec;po.semi[1-po.mi]=po.other;
    if(win){po.round=1;po.opp=po.other[4];return `Semifinale vinta contro ${opp}: finale ${po.kind==='tit'?'per lo scudetto':'per la promozione'} contro ${po.opp}.`;}
    // eliminata: la finale la giocano le altre due
    po.on=false;SV.poRes=poSimFinal(po.semi,po.kind,po.teams);endSeason();
    return `Semifinale persa contro ${opp}: ${po.kind==='tit'?'lo scudetto sfuma':'niente promozione tramite spareggio'}. Stagione conclusa: ${SV.next.rank}° posto. ${SV.next.short}`;
  }
  po.on=false;
  const f=rec;SV.poRes={kind:po.kind,teams:po.teams,semi:po.semi,fin:f,win:f[4],runner:f[4]===f[0]?f[1]:f[0]};
  if(win)SV.po.wasFinal=true;endSeason();
  return win?`${po.kind==='tit'?'Siete campioni d’Italia!':'Spareggio vinto: siete promossi!'} ${SV.next.short}`:`Finale persa contro ${opp}. Stagione conclusa: ${SV.next.rank}° posto. ${SV.next.short}`;
}
// tabellone per la Classifica e per l'albo: due colonne (semifinali e finale)
function poBracketHTML(po,res){
  const t=res?res.teams:po.teams,semi=res?res.semi:[po.semi[0]||(po.mi===0?null:po.other),po.semi[1]||(po.mi===1?null:po.other)],fin=res?res.fin:po.fin;
  const pair=(i,a,b)=>[ [t[0],t[3]],[t[1],t[2]] ][i];
  const row=(n,sc,w)=>`<div class="${w?'w':''}${n===SV.team?' me':''}"><span title="${esc(n)}">${crest(n,13)} ${esc(n)}</span><b>${sc===undefined||sc===null?'':sc}</b></div>`;
  const m=(a,b,r)=>`<div class="tnm${r?'':' cur'}">${row(a,r?r[2]:'',r&&r[4]===a)}${row(b,r?r[3]:'',r&&r[4]===b)}</div>`;
  const semis=[0,1].map(i=>{const p=pair(i),r=semi[i]&&semi[i].length?semi[i]:null;return m(p[0],p[1],r);}).join('');
  const f=fin&&fin.length?m(fin[0],fin[1],fin):(()=>{const w=[0,1].map(i=>semi[i]&&semi[i].length?semi[i][4]:'?');return m(w[0],w[1],null);})();
  return `<div class="tncols"><div class="tncol"><h3>Semifinali</h3>${semis}</div><div class="tncol"><h3>Finale</h3>${f}</div></div>`;
}

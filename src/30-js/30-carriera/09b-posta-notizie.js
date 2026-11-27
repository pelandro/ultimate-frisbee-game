/* ---- POSTA E NOTIZIE ----
   Nella Posta resta solo cio' che chiede un'azione: le DECISIONI (offerte, ritiro annunciato, richiesta di cessione, offerte e scambi dall'altra lega)
   e le EMERGENZE (infortuni, addii, conti in rosso, giocatori molto affaticati o scontenti). Tutto il resto e' una NOTIZIA: non accende la campanella,
   si riassume in una riga di «Questa settimana», si legge nella scheda Notizie e dove serve (scheda del giocatore, Mercato, Societa').
   Gli avvisi salvati (SV.alerts) non cambiano: la divisione si ricava dal tipo, cosi' vale anche per i salvataggi vecchi. Ogni avviso si vede su una
   riga corta (alShort) e si apre al tocco; quelli uguali della stessa giornata stanno su una riga sola (alGroups). */
const AL_POSTA={inj:1,bye:1,dir:1,tired:1,off:1};
// decisione ancora aperta: ha una risposta da dare e la situazione c'e' ancora (il giocatore e' in rosa, l'offerta e' valida...)
function alOpen(a){
  if(a.done)return false;
  if(a.act==='job'||a.act==='trade')return true;
  const p=a.full?byFull(a.full):null;
  return !!p&&((a.act==='stay'&&p.ret===1)||(a.act==='offer'&&SV.offer&&SV.offer.full===a.full)||(a.act==='unhappy'&&p.mood===2));
}
const alPosta=a=>!!(a.act||a.imp||AL_POSTA[a.k]);
const alNow=a=>a.s===SV.season&&a.r===(SV.round|0)+1;   // della giornata in corso: dopo la partita un avviso gia' letto passa nell'archivio
// titolo corto: la frase senza parentesi, fino ai due punti o al primo punto (il mercato tiene il numero delle operazioni)
function alShort(a){
  let t=String(a.txt||'').replace(/\s*\([^)]*\)/g,'').replace(/\s+/g,' ').trim();
  if(a.k==='mkt')t=t.replace(/\s*I colpi più grandi:\s*$/,'').replace(/\.$/,'');
  else{const m=t.search(/[:.](\s|$)/);if(m>0)t=t.slice(0,m);}
  return t.length>72?t.slice(0,70).replace(/\s+\S*$/,'')+'…':t;
}
// dove si sistema: la schermata in cui portare chi legge
const AL_GO={inj:'roster',ok:'roster',tired:'roster',mood:'roster',up:'roster',dec:'roster',ret:'roster',goal:'roster',bye:'roster',staff:'roster',dir:'club',club:'club',ach:'club',evt:'club',mkt:'market'};
const AL_GO_TXT={roster:'Vai alla Squadra',club:'Vai alla Società',market:'Vai al Mercato'};
// gli avvisi dello stesso tipo e della stessa giornata stanno insieme; le decisioni restano una per una (ognuna ha la sua risposta)
function alGroups(L){
  const out=[],by=new Map();
  for(const a of L){
    if(a.act){out.push([a]);continue;}
    const key=a.k+'|'+a.s+'|'+a.r;let g=by.get(key);
    if(!g){g=[];by.set(key,g);out.push(g);}
    g.push(a);
  }
  return out;
}
const AL_PL={inj:'infortuni',ok:'rientri',up:'in crescita',dec:'in calo',mood:'notizie sull’umore',ret:'notizie sui ritiri',bye:'addii',club:'notizie del club',tired:'avvisi di stanchezza',ach:'traguardi',evt:'imprevisti',goal:'notizie sugli obiettivi',staff:'consigli dello staff',mkt:'notizie di mercato',dir:'avvisi della dirigenza'};
const alWho=a=>{const p=a.full?byFull(a.full):null;return p?pname(p):'';};
function alGroupTitle(g){
  if(g.length===1)return alShort(g[0]);
  const w=[...new Set(g.map(alWho).filter(Boolean))];
  return `${g.length} ${AL_PL[g[0].k]||'avvisi'}${w.length?': '+w.slice(0,4).join(', ')+(w.length>4?'…':''):''}`;
}
// riepilogo delle notizie non lette, per la riga di «Questa settimana»
const AL_SUM={up:['in crescita','in crescita'],dec:['in calo','in calo'],ok:['rientro','rientri'],mood:['notizia sull’umore','notizie sull’umore'],ret:['notizia sui ritiri','notizie sui ritiri'],club:['notizia del club','notizie del club'],ach:['traguardo','traguardi'],evt:['imprevisto','imprevisti'],goal:['notizia sugli obiettivi','notizie sugli obiettivi'],staff:['consiglio dello staff','consigli dello staff']};
function newsSummary(){
  const c={};for(const a of SV.alerts||[])if(!alPosta(a)&&!a.seen)c[a.k]=(c[a.k]||0)+1;
  const parts=Object.keys(c).sort((x,y)=>c[y]-c[x]).map(k=>k==='mkt'?'mercato':c[k]+' '+(AL_SUM[k]||['notizia','notizie'])[c[k]>1?1:0]);
  return parts.length?parts.slice(0,3).map(t=>lgTr(t)).join(', ')+(parts.length>3?'…':''):'';
}
const postaUnread=()=>(SV.alerts||[]).filter(a=>!a.seen&&alPosta(a)).length;
// sulla scheda del giocatore: le ultime notizie che lo riguardano (crescita, calo, infortuni, umore, obiettivi)
function pNewsHTML(p){
  const L=(SV.alerts||[]).filter(a=>a.full&&a.full===p.full).slice(0,4);
  return L.length?`<div class="dst pnews"><b style="color:#7fd8ff;font-weight:400">Ultime notizie</b><ul class="nlist">${L.map(a=>`<li><i>S${a.s}·G${a.r}</i>${esc(alShort(a))}</li>`).join('')}</ul></div>`:'';
}
// in Mercato: le operazioni d'estate tra le altre squadre (prima stavano solo nella Posta)
function mkNewsHTML(){
  const a=(SV.alerts||[]).find(x=>x.k==='mkt'&&x.s===SV.season);if(!a)return '';
  const mv=a.data&&a.data.mv||[];
  return `<details class="mknews"><summary>${esc(alShort(a))}</summary>${mv.length?`<ul class="almv">${mv.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>`:''}</details>`;
}

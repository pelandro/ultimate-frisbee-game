/* ---- MERCATO: MOTIVAZIONI DEI GIOCATORI e COMPATIBILITA' TATTICA ----
   Non tutti vengono solo per i crediti. Circa meta' dei giocatori sul mercato ha una motivazione (m.mot), scritta sotto il nome:
   - min «Vuole giocare»: firma solo se sarebbe titolare nel suo ruolo (forte almeno quanto il tuo titolare piu' debole);
   - amb «Ambizioso»: non scende in Serie C; a un club di Serie A costa il 10% in meno;
   - ric «Ingaggio alto»: costa il 20% in piu', senza altre condizioni;
   - pro «Cerca un progetto» (giovani): sconto del 15% se Vivaio o Campo di allenamento sono almeno al livello 2.
   La compatibilita' tattica (fitOf) confronta il giocatore con il gioco della tua squadra (lungo o corto): chi e' adatto si inserisce subito
   (l'affiatamento cala di 2 invece di 4), chi non lo e' fa piu' fatica (cala di 6). Poche regole, tutte visibili prima di comprare. */
const MOT={min:['Vuole giocare','firma solo se sarebbe titolare nel suo ruolo'],amb:['Ambizioso','non scende in Serie C; a un club di Serie A costa il 10% in meno'],
  ric:['Ingaggio alto','costa il 20% in più'],pro:['Cerca un progetto','sconto del 15% con Vivaio o Campo di allenamento almeno al livello 2']};
function motAssign(m,R){
  const u=R(),cat=m.star?'int':(m.from?'sale':(m.kind==='Giovane promessa'?'you':'free'));
  m.mot=cat==='int'?(u<0.5?'amb':(u<0.75?'ric':'')):(cat==='sale'?(u<0.35?'min':(u<0.5?'amb':(u<0.6?'ric':''))):(cat==='free'?(u<0.4?'min':(u<0.55?'ric':'')):(u<0.4?'pro':'')));
}
const wouldStart=o=>{const t=cmpTarget(o);return !t||ovrX(o)>=ovrX(t);};
// perche' non firma (stringa vuota = nessun ostacolo)
function motBlock(m){
  if(m.mot==='min'&&!wouldStart(m.o))return 'Vuole un posto da titolare';
  if(m.mot==='amb'&&SV.sr==='C')return 'Non scende in Serie C';
  return '';
}
const motMul=m=>m.mot==='ric'?1.2:(m.mot==='amb'&&SV.sr==='A'?0.9:(m.mot==='pro'&&(facLv('viv')>=2||facLv('camp')>=2)?0.85:1));
// i prezzi seguono le condizioni del momento (serie, strutture): si ricalcolano dal prezzo base
function mkReprice(){for(const m of SV.market||[]){if(m.base===undefined)m.base=m.price;m.price=Math.round(m.base*motMul(m));}}
// compatibilita' tattica: 1 adatto, 0 neutro, -1 poco adatto al gioco della tua squadra
function fitOf(o){
  const top=pickSeven(SQ,p=>p.role,mean9);if(top.length<7)return 0;
  const idn=teamIdentity(SV.team,top);if(Math.abs(idn.deep)<=0.3)return 0;
  const lng=posOf(o)==='H'?(o.s.spa-o.s.lan)/10:((o.s.vel+o.s.sal)-(o.s.agi+o.s.sca))/14;   // lanciatore da sparo o da lancio corto; cutter da profondita' o da rientro
  return Math.abs(lng)<0.35?0:(Math.sign(lng)===Math.sign(idn.deep)?1:-1);
}
const FIT_TXT={'1':'adatto al tuo gioco: si inserisce subito','0':'neutro','-1':'poco adatto al tuo gioco: ci metterà di più a inserirsi'};
const motLineHTML=m=>{const b=motBlock(m);return m.mot&&MOT[m.mot]?`<small class="rl mot${b?' no':''}" title="${MOT[m.mot][1]}">${MOT[m.mot][0]}${b?': '+b.toLowerCase():''}</small>`:'';};

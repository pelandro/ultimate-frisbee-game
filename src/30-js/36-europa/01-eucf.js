/* ===================== EUCF: IL CAMPIONATO EUROPEO PER CLUB =====================
   Format dei veri European Ultimate Club Finals (Open): 16 squadre in 4 gironi da 4 formati con le fasce del ranking, 3 partite a girone, le prime ai quarti,
   le seconde e le terze a un turno di prequarti (2ª contro 3ª di un altro girone) per trovare gli avversari delle prime, poi quarti, semifinali e finale. Le quarte
   sono fuori dalla corsa al titolo. E' lo stesso motore dei Nationals USA (34-torneo16/).
   Chi partecipa: il campo dell'EUCF Open 2026, 16 club: 3 italiani, 3 belgi, 2 francesi, 2 britannici e 1 tedesco (club veri dei campionati del gioco, i piu' forti di
   ogni paese con un po' di caso) piu' 5 club europei INVENTATI (EU_CLUBS: Spagna, Paesi Bassi, Cechia, Svizzera, Irlanda). I club del tuo paese sono i primi classificati
   dell'anno prima (SV.eu.it, scelti a fine stagione: Serie A in Italia, livello piu' alto in Belgio, Francia, Germania e Regno Unito); la forza di quelli che non
   giochi cambia da un'edizione all'altra (SV.eup). Si sblocca chiudendo il campionato tra i primi posti qualificanti e si gioca prima di avviare il campionato successivo (SV.eu.s). Stato: SV.eu={s, state:'on'|'out'|'champ', it, nat (stato del torneo, vedi 01-torneo16.js), rk (ranking), cur, stage, cash}.
   Salvataggi vecchi (coppa a 3 turni, senza nat): l'edizione riparte nel nuovo formato. */
// [nome, paese, forza]: club inventati, non corrispondono a squadre vere
const EU_CLUBS=[['Madrid Toros','ESP',91],['Amsterdam Windmills','NED',88],['Prague Golems','CZE',87],['Barcelona Mar','ESP',85],['Zurich Alpentraum','SUI',83],['Dublin Shamrocks','IRL',78]];
const EU_BY={};for(const [n,c,p] of EU_CLUBS)EU_BY[n]={c,p};
// campo reale: quanti club per paese (Italia, Belgio, Francia, Regno Unito, Germania) e codice usato per tenere i connazionali in gironi diversi
const EU_SLOTS={IT:3,BE:3,FR:2,UK:2,DE:1},EU_CC={IT:'ITA',BE:'BEL',FR:'FRA',UK:'GBR',DE:'GER'},EU_INV=['ESP','NED','CZE','SUI','IRL'];
const EU_PRIZE=[12,16,22,34,60];   // crediti (per il coefficiente della Serie A): qualificazione ai quarti o ai prequarti, poi prequarti, quarti, semifinale, finale vinti
const euNew=season=>({s:season|0,state:'on',nat:null,it:(SV&&SV.next&&SV.next.euQ)||null,cash:0});   // la lista dei club si costruisce al primo uso (euEnsure)
const euCountry=n=>LN_BY[n]?EU_CC[LN_BY[n].lk]:(EU_BY[n]?EU_BY[n].c:'ITA');
const euPowOf=n=>(n===SV.team||(SV.rost&&SV.rost[n]))?teamPow(n):(((SV.eup&&SV.eup[n])||(EU_BY[n]?EU_BY[n].p:70))-PW_LV);
function euRate(a,b,sa,sb){   // ranking del torneo (serve alle fasce e ai quarti)
  const P=SV.eu.rk;if(!P||P[a]===undefined||P[b]===undefined)return;
  const e=1/(1+Math.pow(10,(P[b]-P[a])/400)),w=sa>sb?1:0,k=22*(1+Math.min(10,Math.abs(sa-sb))/10);P[a]+=k*(w-e);P[b]-=k*(w-e);
}
function euPlay(a,b){const r=simMatch(euPowOf(a),euPowOf(b),0,carLen());euRate(a,b,r.a,r.b);return [a,b,r.a,r.b,r.a>r.b?a:b];}
const euCtx=()=>({rate:t=>SV.eu.rk[t],grp:euCountry,play:euPlay});
function euLabelAt(N){const rd=N.rd;return rd<3?`Girone ${US_POOL[t16Pool(N,SV.team)]} · partita ${rd+1} di 3`:['Prequarti','Quarti di finale','Semifinale','Finale'][rd-3];}
// i k club piu' forti di un paese in questa edizione (la forza cambia un po' di anno in anno, in SV.eup)
function euPick(lk,k,R){
  const pool=lk==='IT'?SERIES.A.map(n=>[n,TEAM[n].power]):lnClubRows(lk).filter(r=>r[1]===LN_DEF[lk].tiers[0].id).map(r=>[r[0],r[3]]);
  return pool.map(([n,p])=>{const v=clamp((SV.eup[n]===undefined?p:SV.eup[n])+R()*5-2.5,50,96);SV.eup[n]=v;return [n,v+R()*4-2];}).sort((a,b)=>b[1]-a[1]).slice(0,k).map(x=>x[0]);
}
// costruisce l'edizione al primo uso: i club del tuo paese (qualificati), quelli degli altri paesi e 5 europei inventati, sorteggio dei gironi
function euEnsure(){
  const E=SV.eu;if(E.nat)return E.nat;
  const old=E.state!=='on'?{state:E.state,cash:E.cash|0}:null;   // salvataggio vecchio con coppa gia' conclusa: si conserva l'esito
  if(!SV.eup)SV.eup={};
  const lk=isLN()?SV.lk:'IT',slots=EU_SLOTS[lk],R=mulberry32(hashStr(SV.seed+'|eu|'+(E.s|0)));
  let ita=(E.it||[]).filter(n=>n===SV.team||(SV.rost&&SV.rost[n])).slice(0,slots);
  if(!ita.includes(SV.team)){ita=ita.slice(0,slots-1);ita.push(SV.team);}
  if(ita.length<slots){
    const pool=isLN()?lnClubs(lk).filter(n=>LN_BY[n].t===LN_DEF[lk].tiers[0].id):(SV.mem&&SV.mem.A)||[];
    for(const n of pool.slice().sort((a,b)=>teamPow(b)-teamPow(a)))if(ita.length<slots&&!ita.includes(n)&&SV.rost&&SV.rost[n])ita.push(n);
  }
  const others=Object.keys(EU_SLOTS).filter(x=>x!==lk).reduce((a,x)=>a.concat(euPick(x,EU_SLOTS[x],R)),[]);
  const inv=EU_INV.map(c=>EU_CLUBS.filter(x=>x[1]===c).map(([n,cc,p])=>{const v=clamp((SV.eup[n]===undefined?p:SV.eup[n])+R()*5-2.5,66,96);SV.eup[n]=v;return [n,v+R()*6-3];}).sort((a,b)=>b[1]-a[1])[0][0]);
  const teams=ita.concat(others,inv);E.rk={};for(const t of teams)E.rk[t]=1500+(euPowOf(t)-82)*18;
  E.nat=t16Begin(euCtx(),teams,SV.team);E.stage=0;E.cur=null;
  if(old){E.state=old.state;E.cash=old.cash;E.nat.rd=7;}
  else{news(`EUCF: sorteggio fatto, siete nel girone ${US_POOL[t16Pool(E.nat,SV.team)]}.`);euAdvance();}
  return E.nat;
}
// prepara la tua prossima partita, simulando i turni in cui non giochi; se non ne hai altre chiude il torneo
function euAdvance(){
  const E=SV.eu,N=E.nat;
  while(N.rd<=6){
    const u=t16User(N,SV.team);
    if(u){E.cur={opp:u.opp,label:euLabelAt(N)};E.stage=Math.max(E.stage|0,N.rd<3?0:N.rd-2);return true;}
    t16Round(euCtx(),N,null);
  }
  E.cur=null;
  if(N.champ===SV.team&&E.state!=='champ'){E.state='champ';SV.troph.eu=(SV.troph.eu|0)+1;SV.rep=clamp(SV.rep+5,0,100);news('Campioni d’Europa nella stagione '+SV.season+'! Premi del torneo: '+(E.cash|0)+' crediti.');}
  else if(E.state==='on')E.state='out';
  return false;
}
function euOpponent(){   // l'avversaria del turno, per nextMatch()
  const E=SV.eu;if(E.state!=='on')return null;
  euEnsure();const c=E.cur;if(!c)return null;
  const pw=euPowOf(c.opp)+euPlus();   // ogni coppa vinta alza il livello dei club europei
  if(SV.rost&&SV.rost[c.opp])return {name:c.opp,roster:SV.rost[c.opp],label:c.label};
  return LN_BY[c.opp]?{name:c.opp,roster:abroadDrop(lnRoster(c.opp,SV.seed+'|eu|'+SV.season,{p:pw})),label:c.label}:{name:c.opp,power:pw,label:c.label};   // i club veri dei nuovi campionati hanno i loro giocatori
}
// una tua partita europea (giocata o simulata): ritorna il messaggio
function euRecord(win,su,so){
  const E=SV.eu,N=euEnsure(),c=E.cur,opp=c.opp,rd=N.rd,rec=[SV.team,opp,su,so,win?SV.team:opp];
  euRate(SV.team,opp,su,so);t16Round(euCtx(),N,rec);E.lastRes={opp,su,so,win};
  let pre=`${c.label}: ${win?'vittoria':'sconfitta'} contro ${opp} (${su}–${so}).`,pz=0;
  if(rd===2){
    const p=t16Pool(N,SV.team),pos=N.ord[p].indexOf(SV.team)+1;
    if(pos===1){pre+=` Primi nel girone ${US_POOL[p]}: direttamente ai quarti.`;pz=EU_PRIZE[0];}
    else if(pos<=3){const m=N.ko[0].find(x=>x[0]===SV.team||x[1]===SV.team);pre+=` ${pos}° nel girone ${US_POOL[p]}: prequarti contro ${m[0]===SV.team?m[1]:m[0]}.`;pz=EU_PRIZE[0];}
    else{pre+=` Ultimi nel girone ${US_POOL[p]}: fuori dalla corsa al titolo.`;N.out=true;}
  }else if(rd>=3){if(win)pz=EU_PRIZE[rd-2];else{N.out=true;pre+=' Eliminati dal torneo.';}}
  if(pz){pz=Math.round(pz*SR_K.A);SV.cash+=pz;E.cash=(E.cash|0)+pz;}
  return pre+(euAdvance()?` Prossima: ${E.cur.label} contro ${E.cur.opp}.`:' '+euEndTxt());
}
const euEndTxt=()=>{const E=SV.eu;return E.state==='champ'?'Siete campioni d’Europa!':(E.state==='out'?(E.nat&&E.nat.rd>=7?'Fuori dall’EUCF.':'Eliminati.'):'');};

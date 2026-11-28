/* ===================== EUCF: IL CAMPIONATO EUROPEO PER CLUB =====================
   16 club in 4 gironi da 4 formati con le fasce del ranking, 3 partite a girone, le prime ai quarti, le seconde e le terze a un turno di prequarti (2ª contro 3ª di
   un altro girone) per trovare gli avversari delle prime, poi quarti, semifinali, finale e finale per il 3° posto (dal 2026, le edizioni gia' sorteggiate
   finiscono senza). Le quarte sono fuori dalla corsa al titolo. E' lo stesso motore dei
   Nationals USA (34-torneo16/).
   Chi partecipa (euField, deciso alla fine del campionato): le prime 3 dopo i playoff di Italia, Belgio, Francia, Germania e Regno Unito (15 club) e, come
   sedicesima, la quarta classificata piu' forte (potenza di squadra) di quei cinque campionati. Il tuo campionato usa la classifica vera; per gli altri, che il
   gioco non simula, contano i club piu' forti del livello piu' alto, con un po' di caso (euPick). La forza dei club che non giochi cambia da un'edizione all'altra
   (SV.eup). Il torneo si sblocca chiudendo il campionato tra i qualificati e si gioca prima di avviare il campionato successivo (SV.eu.s).
   Stato: SV.eu={s, state:'on'|'out'|'champ', it (i 16 club), nat (stato del torneo, vedi 01-torneo16.js), rk (ranking), cur, stage, cash, lastRes}.
   Salvataggi vecchi: con `it` di 3 club (il vecchio campo con i club inventati) il campo si completa con la regola nuova; un'edizione gia' sorteggiata resta com'e'. */
// [nome, paese, forza]: club inventati del vecchio campo (fino al 2026), servono solo alle edizioni gia' sorteggiate nei salvataggi
const EU_CLUBS=[['Madrid Toros','ESP',91],['Amsterdam Windmills','NED',88],['Prague Golems','CZE',87],['Barcelona Mar','ESP',85],['Zurich Alpentraum','SUI',83],['Dublin Shamrocks','IRL',78]];
const EU_BY={};for(const [n,c,p] of EU_CLUBS)EU_BY[n]={c,p};
// quanti club per paese vanno all'EUCF (piu' la sedicesima, la quarta piu' forte) e codice usato per tenere i connazionali in gironi diversi
const EU_SLOTS={IT:3,BE:3,FR:3,UK:3,DE:3},EU_CC={IT:'ITA',BE:'BEL',FR:'FRA',UK:'GBR',DE:'GER',IW:'ITA',BEW:'BEL',FRW:'FRA',UKW:'GBR',DEW:'GER'};
const EU_PRIZE=[12,16,22,34,60];   // crediti (per il coefficiente della Serie A): qualificazione ai quarti o ai prequarti, poi prequarti, quarti, semifinale, finale vinti
const EU_BRONZE=18;   // finale per il 3° posto vinta
const euNew=season=>({s:season|0,state:'on',nat:null,it:(SV&&SV.next&&SV.next.euQ)||null,cash:0});   // la lista dei club si costruisce al primo uso (euEnsure)
const euCountry=n=>LN_BY[n]?EU_CC[LN_BY[n].lk]:(EU_BY[n]?EU_BY[n].c:'ITA');
const euPowOf=n=>(n===SV.team||(SV.rost&&SV.rost[n]))?teamPow(n):(((SV.eup&&SV.eup[n])||(EU_BY[n]?EU_BY[n].p:70))-PW_LV);
function euRate(a,b,sa,sb){   // ranking del torneo (serve alle fasce e ai quarti)
  const P=SV.eu.rk;if(!P||P[a]===undefined||P[b]===undefined)return;
  const e=1/(1+Math.pow(10,(P[b]-P[a])/400)),w=sa>sb?1:0,k=22*(1+Math.min(10,Math.abs(sa-sb))/10);P[a]+=k*(w-e);P[b]-=k*(w-e);
}
function euPlay(a,b){const r=simMatch(euPowOf(a),euPowOf(b),0,carLen());euRate(a,b,r.a,r.b);return [a,b,r.a,r.b,r.a>r.b?a:b];}
const euCtx=()=>({rate:t=>SV.eu.rk[t],grp:euCountry,play:euPlay,bronze:true});
// la tua partita del turno finale e' quella per il 3° posto (seconda di ko[3])?
const euBronzeMe=N=>!!(N&&N.br&&N.rd===6&&N.ko[3]&&N.ko[3][1]&&N.ko[3][1].slice(0,2).includes(SV.team));
function euLabelAt(N){const rd=N.rd;return rd<3?`Girone ${US_POOL[t16Pool(N,SV.team)]} · partita ${rd+1} di 3`:(euBronzeMe(N)?'Finale per il 3° posto':['Prequarti','Quarti di finale','Semifinale','Finale'][rd-3]);}
// i k club piu' forti di un paese in questa edizione (la forza cambia un po' di anno in anno, in SV.eup)
function euPick(lk,k,R){
  const pool=lk==='IT'?SERIES.A.map(n=>[n,TEAM[n].power]):lnClubRows(lk).filter(r=>r[1]===LN_DEF[lk].tiers[0].id).map(([name,,,level])=>[name,LN_EUCS_OPEN_LEVEL[name]??level]);
  return pool.map(([n,p])=>{const v=clamp((SV.eup[n]===undefined?p:SV.eup[n])+R()*5-2.5,50,96);SV.eup[n]=v;return [n,v+R()*4-2];}).sort((a,b)=>b[1]-a[1]).slice(0,k).map(x=>x[0]);
}
// il campo dell'EUCF alla fine del campionato: le prime 3 di ogni paese (top/fourth = classifica vera del tuo campionato) e la quarta piu' forte
const EU_LK=['IT','BE','FR','DE','UK'],EU_WOMEN_LK=['IW','BEW','FRW','DEW','UKW'];
const euLeagues=lk=>lnWomen(lk)?EU_WOMEN_LK:EU_LK;
const euChampions=()=>lnWomenNow()?'Campionesse':'Campioni';
const EU_WHO_TXT='Prime 3 delle classifiche finali di Italia, Belgio, Francia, Germania e Regno Unito, più la quarta più forte fra questi campionati.';
const EU_FIELD_TXT='16 club: prime 3 di Italia, Belgio, Francia, Germania e Regno Unito, più la quarta più forte. Gironi da 4, poi playoff.';
function euField(lk,top,fourth){
  if(!SV.eup)SV.eup={};
  const R=mulberry32(hashStr(SV.seed+'|euf|'+SV.season)),teams=[],cand=[];
  for(const c of euLeagues(lk)){
    const p=c===lk?top.slice(0,3).concat(fourth?[fourth]:[]):euPick(c,4,R);
    teams.push(...p.slice(0,3));if(p[3])cand.push(p[3]);
  }
  const ex=cand.filter(n=>!teams.includes(n)).sort((a,b)=>euPowOf(b)-euPowOf(a))[0];
  if(ex)teams.push(ex);
  return teams;
}
// Costruisce l'edizione e sorteggia i gironi al primo uso.
function euEnsure(){
  const E=SV.eu;if(E.nat)return E.nat;
  const old=E.state!=='on'?{state:E.state,cash:E.cash|0}:null;   // salvataggio vecchio con coppa gia' conclusa: si conserva l'esito
  if(!SV.eup)SV.eup={};
  const lk=isLN()?SV.lk:'IT';
  let teams=(E.it||[]).slice(0,16);
  if(teams.length<16){   // salvataggio vecchio: i club del tuo paese c'erano gia', il resto con la regola nuova
    const pool=(isLN()?lnClubs(lk).filter(n=>LN_BY[n].t===LN_DEF[lk].tiers[0].id):(SV.mem&&SV.mem.A)||[]).filter(n=>n===SV.team||(SV.rost&&SV.rost[n]));
    const mine=teams.concat(pool.filter(n=>!teams.includes(n)).sort((a,b)=>teamPow(b)-teamPow(a)));
    teams=euField(lk,mine.slice(0,3),mine[3]);
    if(lnWomen(lk))E.it=teams;
  }
  if(!teams.includes(SV.team))teams[teams.length-1]=SV.team;
  E.rk={};for(const t of teams)E.rk[t]=1500+(euPowOf(t)-82)*18;
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
    if(u){E.cur={opp:u.opp,label:euLabelAt(N)};E.stage=Math.max(E.stage|0,N.rd<3?0:(euBronzeMe(N)?3:N.rd-2));return true;}   // il 3° posto non e' la finale (obiettivi dello sponsor)
    t16Round(euCtx(),N,null);
  }
  E.cur=null;
  if(N.champ===SV.team&&E.state!=='champ'){E.state='champ';SV.troph.eu=(SV.troph.eu|0)+1;SV.rep=clamp(SV.rep+5,0,100);news(euChampions()+' d’Europa nella stagione '+SV.season+'! Premi del torneo: '+(E.cash|0)+' crediti.');ricGive('E1');}
  else if(E.state==='on'){E.state='out';const pl=euPlace(N,SV.team);if(pl===2||pl===3)ricGive('E'+pl);}   // podio: finale persa o 3° posto (34-riconoscimenti.js)
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
  const E=SV.eu,N=euEnsure(),c=E.cur,opp=c.opp,rd=N.rd,bz=euBronzeMe(N),rec=[SV.team,opp,su,so,win?SV.team:opp];
  euRate(SV.team,opp,su,so);t16Round(euCtx(),N,rec);E.lastRes={opp,su,so,win};
  let pre=`${c.label}: ${win?'vittoria':'sconfitta'} contro ${opp} (${su}–${so}).`,pz=0;
  if(rd===2){
    const p=t16Pool(N,SV.team),pos=N.ord[p].indexOf(SV.team)+1;
    if(pos===1){pre+=` ${lnWomenNow()?'Prime':'Primi'} nel girone ${US_POOL[p]}: direttamente ai quarti.`;pz=EU_PRIZE[0];}
    else if(pos<=3){const m=N.ko[0].find(x=>x[0]===SV.team||x[1]===SV.team);pre+=` ${pos}° nel girone ${US_POOL[p]}: prequarti contro ${m[0]===SV.team?m[1]:m[0]}.`;pz=EU_PRIZE[0];}
    else{pre+=` ${lnWomenNow()?'Ultime':'Ultimi'} nel girone ${US_POOL[p]}: fuori dalla corsa al titolo.`;N.out=true;}
  }else if(bz){if(win)pz=EU_BRONZE;N.out=true;}   // il piazzamento lo dice euEndTxt
  else if(rd>=3){if(win)pz=EU_PRIZE[rd-2];else if(!(rd===5&&N.br)){N.out=true;if(rd<6)pre+=' Eliminati dal torneo.';}}   // chi perde la semifinale gioca per il 3° posto
  if(pz){pz=Math.round(pz*SR_K.A);SV.cash+=pz;E.cash=(E.cash|0)+pz;}
  return pre+(euAdvance()?` Prossima: ${E.cur.label} contro ${E.cur.opp}.`:' '+euEndTxt());
}
const EU_PLACE_TXT=['Fuori dall’EUCF.','Siete campioni d’Europa!','Secondo posto all’EUCF.','Terzo posto all’EUCF: siete sul podio!','Quarto posto all’EUCF.'];
const euEndTxt=()=>{const E=SV.eu;return E.state==='champ'?'Siete '+euChampions().toLowerCase()+' d’Europa!':(E.state==='out'?(E.nat&&E.nat.rd>=7?EU_PLACE_TXT[euPlace(E.nat,SV.team)]:'Eliminati.'):'');};
// il tuo piazzamento alla fine del torneo: 1 campione, 2 finale persa, 3 terzo posto, 4 quarto, 0 uscito prima. Nelle edizioni senza finale per il 3° posto
// (sorteggiate prima del 2026) e' terzo chi ha perso la semifinale
function euPlace(N,me){
  if(!N||!N.ko||!N.ko[3])return 0;if(N.champ===me)return 1;
  const F=N.ko[3][0],B=N.ko[3][1];
  if(F&&F.slice(0,2).includes(me))return 2;
  if(B&&B.slice(0,2).includes(me))return B[4]===me?3:(B[4]?4:0);
  if(!N.br&&N.ko[2]&&N.ko[2].some(m=>m.slice(0,2).includes(me)))return 3;
  return 0;
}

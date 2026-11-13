/* ---- PRESENTAZIONI DELLE PARTITE CHE CONTANO ----
   Prima di una finale o di una semifinale europea, di un derby, dell'ultima giornata con qualcosa in palio o dell'ultima partita di un veterano
   compare un cartello breve: che partita e', che cosa c'e' in palio, chi tenere d'occhio. Le partite normali cominciano subito, come sempre.
   matchStakes(m) decide se la partita e' speciale e che cosa scrivere (null = partita normale). */
const gaTxt=(g,a)=>`${g} ${g===1?'meta':'mete'}, ${a} assist`;
function matchStakes(m){
  const lines=[];let tag='',title='';
  if(isUS()&&SV.event==='camp'){
    const u=usStakes(m);tag=u.tag;title=u.title;lines.push(...u.lines);   // campionato USA: 15-usa-schermate.js
  }else if(SV.po&&SV.po.on&&SV.event==='camp'){
    tag=PO_NAME[SV.po.kind];title=SV.po.round===0?'Semifinale':'Finale';
    lines.push(SV.po.kind==='tit'?(SV.po.round?'Chi vince è campione d’Italia: trofeo e reputazione.':'Chi vince va in finale per lo scudetto: partita secca.'):(SV.po.round?'Chi vince sale di categoria insieme alla prima della classe.':'Chi vince va alla finale per la seconda promozione: partita secca.'));
  }else if(SV.event==='eu'){
    const r=SV.eu.round;tag='Campionato europeo';title=EU_ROUND[r];
    lines.push(r===2?'Chi vince alza la coppa: trofeo, reputazione e '+Math.round(EU_PRIZE[2]*SR_K.A)+' crediti.':'Eliminazione diretta: chi perde è fuori. In palio '+Math.round(EU_PRIZE[r]*SR_K.A)+' crediti.');
  }else{
    const names=SV.mem[SV.sr],n=names.length,last=SV.round===SV.sched.length-1&&!(SV.po&&SV.po.on),ord=ranking(SV.tab,names),rk=ord.indexOf(SV.team)+1,pts=x=>SV.tab[x].pts,me=pts(SV.team);
    if(m.name===SV.riv){tag='Rivalità';title='Derby';const rr=SV.rivRec||{w:0,l:0};lines.push(`Contro ${m.name} vale di più: incasso, morale e reputazione.${rr.w+rr.l?` Finora ${rr.w} ${rr.w===1?'vinto':'vinti'} e ${rr.l} ${rr.l===1?'perso':'persi'}.`:''}`);}
    if(last){
      const near=i=>ord[i]&&Math.abs(me-pts(ord[i]))<=3;
      if(SV.sr==='A'&&rk<=3&&(rk===1?near(1):near(0))){tag=tag||'Ultima giornata';title=title||'Scudetto in palio';lines.push(rk===1?'Siete primi: una vittoria vale il titolo.':'Il primo posto è a un passo: bisogna vincere e sperare.');}
      else if(SV.sr!=='A'&&((rk<=PROMO&&near(PROMO))||(rk>PROMO&&near(PROMO-1)))){tag=tag||'Ultima giornata';title=title||'Promozione in palio';lines.push(rk<=PROMO?'Siete in zona promozione: non si può sbagliare.':'La promozione è a un passo: serve una vittoria.');}
      else if(SV.sr!=='C'&&((rk>n-PROMO&&near(n-PROMO-1))||(rk<=n-PROMO&&near(n-PROMO)))){tag=tag||'Ultima giornata';title=title||'Salvezza in palio';lines.push(rk>n-PROMO?'Siete in zona retrocessione: vincere per salvarsi.':'La zona retrocessione è vicina: serve un risultato.');}
      const vets=SQ.filter(p=>p.ret===1&&(SV.lineO.includes(p.full)||SV.lineD.includes(p.full)));
      for(const p of vets.slice(0,2)){tag=tag||'Ultima giornata';title=title||'L’ultima partita';const c=p.car;lines.push(`Ultima partita di ${pname(p)} (${p.age} anni${c&&c.mp?`: ${c.mp} partite, ${gaTxt(c.g,c.a)}`:''}).`);}
    }
  }
  if(!title)return null;
  // chi tenere d'occhio: il miglior realizzatore dell'avversaria e il tuo (dalle statistiche del girone)
  if(SV.event==='camp'&&lsLive()){
    const sc=x=>x.g*2+x.a*2+x.b*3,their=(m.roster||[]).filter(o=>o.ss&&o.ss.mp).sort((a,b)=>sc(b.ss)-sc(a.ss))[0],mine=SQ.filter(p=>p.car&&p.car.ss.mp).sort((a,b)=>seasonScore(b.car)-seasonScore(a.car))[0];
    if(their)lines.push(`Da tenere d’occhio: ${their.label||their.n} (${gaTxt(their.ss.g,their.ss.a)}).`);
    if(mine)lines.push(`Il vostro uomo in più: ${pname(mine)} (${gaTxt(mine.car.ss.g,mine.car.ss.a)}).`);
  }
  return {tag,title,lines};
}

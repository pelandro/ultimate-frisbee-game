/* ---- ULTIMATE TEAM · schermata EQUIPAGGIAMENTO ----
   Un manichino a pixel scuro che indossa la divisa scelta e gli accessori equipaggiati, con i sei posti intorno (tre per lato): tocchi un posto e
   scegli quale rarita' indossare (o lo togli). Sotto, i colori della divisa, che la tua squadra veste nelle partite di Ultimate Team.
   Il modello (accessori, rarita', bonus, pacchetti) e' in 10-sim/25-ut-equipaggiamento.js; i pacchetti si aprono con gli altri (utPack). */
const EQ_RC=['#9aa8a0','#4da3ff','#b36bff'];   // colori delle rarita' (come .com, .rar, .epi)
const EQ_SIDE=[['coach','band','glove'],['prep','drink','boot']];   // sinistra e destra del manichino
const EQ_COLN={'#2f7bff':'blu','#e8383d':'rosso','#ff8a1f':'arancione','#2fbf5a':'verde','#9be22d':'verde lime','#ffd23f':'giallo','#8a4dff':'viola','#f2f5fa':'bianco','#8d97ab':'grigio','#101827':'nero'};
// icone a pixel 12x12: o contorno, m colore della rarita', l sua luce, d suo scuro, w bianco, k grigio scuro, s pelle del manichino
const EQ_KIT_ORO={s:'#282331',p:'#282331',c:'#ffcb3d',b:'#ffcb3d',m:'oro'};   // la divisa Oro Nero sul manichino (KIT_ORO in campo)
const EQ_ICON={
  boot:['............','...oooo.....','...omlo.....','...ommo.....','...ommoooo..','...ommmmmmo.','..ommmlmmmmo','..ommmmmmmmo','..owwwwwwwwo','..oooooooooo','...k.k..k.k.','............'],
  drink:['....oooo....','...okkkko...','...oooooo...','...ommmmo...','...omwmlo...','...omwwmo...','...ommwwo...','...omwwmo...','...omwmmo...','...ommmmo...','...oddddo...','....oooo....'],
  coach:['....oooo....','..ooddddoo..','..owwwwwwo..','..owkwwmwo..','..owwkwwwo..','..owkwkwwo..','..owwwwwwo..','..owwmwwwo..','..owmwmwwo..','..owwmwwwo..','..oooooooo..','............'],
  glove:['............','..o.o.o.....','.omomomo....','.omomomo.o..','.omomomoomo.','.ommmmmmomo.','.omlmmmmmo..','.ommmmmmmo..','..ommmmmo...','..owwwwwo...','..oooooo....','............'],
  band:['............','...ssssss...','...ssssss...','..oooooooo..','..ommmmmmo..','..owwwwwwo..','..ommmmmmo..','..oooooooo..','...ssssss...','...ssssss...','...ssssss...','............'],
  prep:['.....oo.....','....owwo....','....oooo....','..oommmmoo..','.ommwwwwmmo.','.omwwwkwwmo.','.omwwwkwwmo.','.omwwwkkwmo.','.omwwwwwwmo.','.ommwwwwmmo.','..oommmmoo..','....oooo....']
};
const eqShade=(c,k)=>shade(c,k);
function eqIcon(k,r,px){   // r: 0-2 rarita', -1 posto vuoto (sagoma grigia)
  const m=r>=0?EQ_RC[r]:'#4a5068',M=r>=0?{o:'#0b0d12',m,l:eqShade(m,0.35),d:eqShade(m,-0.3),w:r>=0?'#f4f6fb':'#6a7088',k:'#3b4252',s:'#3d4352'}:{o:'#262b3d',m,l:m,d:m,w:'#5a6078',k:'#3b4252',s:'#33384a'};
  let s=`<svg viewBox="0 0 12 12" width="${px}" height="${px}" shape-rendering="crispEdges" aria-hidden="true">`;
  EQ_ICON[k].forEach((row,y)=>{for(let x=0;x<12;){const c=row[x];let n=1;while(x+n<12&&row[x+n]===c)n++;if(c!=='.')s+=`<rect x="${x}" y="${y}" width="${n}" height="1" fill="${M[c]}"/>`;x+=n;}});
  return s+'</svg>';
}
// il manichino: griglia di pixel con forme semplici, poi il contorno dove un pixel vuoto tocca la figura
function eqDoll(e){
  const W=32,H=54,g=Array.from({length:H},()=>Array(W).fill('')),kit=e.oro?EQ_KIT_ORO:(e.kit||EQ_KIT0),on=k=>e.on[k]!==undefined?EQ_RC[e.on[k]]:null;
  const C={b:'#2b2f3a',B:'#3d4352',b2:'#22252e',s:kit.s,s2:eqShade(kit.s,-0.22),t:kit.b,t2:eqShade(kit.b,-0.22),p:kit.p,p2:eqShade(kit.p,-0.22),c:kit.c,c2:eqShade(kit.c,-0.22),f:'#1a1d25',w:'#f4f6fb'};
  const boot=on('boot'),glove=on('glove'),band=on('band'),drink=on('drink');
  if(kit.m==='oro'){C.f=KIT_ORO.shoe;C.f2=eqShade(KIT_ORO.shoe,-0.3);C.m=KIT_ORO.man;C.m2=eqShade(KIT_ORO.man,-0.25);}
  if(boot){C.f=boot;C.f2=eqShade(boot,-0.3);}
  if(glove){C.g=glove;C.g2=eqShade(glove,-0.3);}
  if(band)C.a=band;
  if(drink){C.d=drink;C.d2=eqShade(drink,-0.3);}
  const R=(x,y,w,h,c)=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)if(j>=0&&j<H&&i>=0&&i<W)g[j][i]=c;};
  for(let y=0;y<14;y++)for(let x=0;x<W;x++){const dx=x+0.5-16,dy=y+0.5-7.5;if(dx*dx+dy*dy<=31)g[y][x]=dx>2.2?'b2':'b';}   // testa tonda, senza volto
  R(12,3,2,2,'B');R(11,5,1,2,'B');
  R(14,13,4,2,'b');R(17,13,1,2,'b2');
  R(10,15,12,13,'s');R(10,15,1,1,'');R(21,15,1,1,'');R(20,16,2,12,'s2');R(10,27,12,1,'s2');   // maglia
  R(7,16,3,4,'s');R(8,15,2,1,'s');R(22,16,3,4,'s2');R(22,15,2,1,'s2');                       // maniche
  R(7,20,3,9,'b');R(22,20,3,9,'b');R(24,20,1,9,'b2');R(9,20,1,9,'b2');                         // braccia
  if(kit.m&&kit.m!=='uni')for(let y=15;y<28;y++)for(let x=10;x<22;x++)if(g[y][x]==='s'||g[y][x]==='s2'){if(eqPatHit(kit.m,(x-9.5)/12,(y-14.5)/13))g[y][x]=g[y][x]==='s'?'t':'t2';}   // motivo della maglia
  if(kit.m==='oro'){R(7,16,3,4,'m');R(8,15,2,1,'m');R(22,16,3,4,'m2');R(22,15,2,1,'m2');R(10,28,1,6,'m');R(21,28,1,6,'m2');}   // maniche e filetto dorati
  if(band)R(7,21,3,2,'a');
  R(7,29,3,3,glove?'g':'b');R(22,29,3,3,glove?'g':'b');if(glove){R(9,29,1,3,'g2');R(24,29,1,3,'g2');}
  R(10,28,12,6,'p');R(20,28,2,6,'p2');R(15,32,2,2,'');R(10,33,5,1,'p2');R(17,33,5,1,'p2');   // pantaloncini
  R(11,34,4,8,'b');R(17,34,4,8,'b');R(14,34,1,8,'b2');R(20,34,1,8,'b2');                      // gambe
  R(11,42,4,6,'c');R(17,42,4,6,'c');R(14,42,1,6,'c2');R(20,42,1,6,'c2');R(11,44,4,1,'c2');R(17,44,4,1,'c2');   // calzettoni con la riga
  R(10,48,5,3,'f');R(17,48,5,3,'f');R(10,48,1,1,'');R(21,48,1,1,'');                          // scarpe (scarpini se equipaggiati)
  if(boot){R(10,50,5,1,'f2');R(17,50,5,1,'f2');R(11,49,2,1,'w');R(19,49,2,1,'w');}
  if(drink){R(23,26,4,7,'d');R(23,26,4,1,'w');R(26,27,1,6,'d2');R(24,28,1,3,'w');}            // lattina nella mano destra
  const o=Array.from({length:H},()=>Array(W).fill(false));
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(!g[y][x])for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const yy=y+b,xx=x+a;if(yy>=0&&yy<H&&xx>=0&&xx<W&&g[yy][xx]){o[y][x]=true;break;}}
  let s=`<svg viewBox="0 0 ${W} ${H+2}" shape-rendering="crispEdges" aria-hidden="true"><ellipse cx="16" cy="${H}" rx="11" ry="2" fill="#000" opacity=".35"/>`;
  for(let y=0;y<H;y++)for(let x=0;x<W;){
    const c=o[y][x]?'#0b0d12':(C[g[y][x]]||'');let n=1;
    while(x+n<W&&(o[y][x+n]?'#0b0d12':(C[g[y][x+n]]||''))===c)n++;
    if(c)s+=`<rect x="${x}" y="${y}" width="${n}" height="1" fill="${c}"/>`;x+=n;
  }
  return s+'</svg>';
}
// apertura di un pacchetto equipaggiamento (da pkGo in 01-ultimate-team-simulazioni.js): accessori nella collezione, doppioni in gettoni
function utEqOpen(v){
  const it=eqDraw(utPkQ(v),utPackSize(v),Math.random),c=eqGain(UT.eq,it);
  UT.coins+=c;
  const nw=it.filter(o=>o.wear).length;
  UT.eqMsg=(nw?`${nw===1?'Un accessorio nuovo è già':nw+' accessori nuovi sono già'} equipaggiat${nw===1?'o':'i'}: li trovi in Equipaggiamento.`:'')+(c?` Doppioni: +${c} gettoni.`:'');
  return it;
}
const eqItem=k=>EQ_ITEMS.find(it=>it.k===k);
function eqCard(o,i){
  const it=eqItem(o.k),[rn,rc]=EQ_RAR[o.r];
  return `<div class="ucard eqc ${rc}" style="animation-delay:${(i*0.3).toFixed(2)}s"><span class="eqci">${eqIcon(o.k,o.r,56)}</span><span>${it.n}</span><b>+${EQ_PLUS[o.r]}</b><i>${LBL[it.st]} · ${rn}</i><i>${o.dup?'doppione: +'+EQ_DUP[o.r]+' gettoni':(o.wear?'equipaggiato':'nella collezione')}</i></div>`;
}
// colori della divisa nelle partite di Ultimate Team (matchLook in 20-ui/02-pixel-art.js)
const utKitNow=()=>{if(!(UT.on&&UT.eq&&UT.eq.kit))return null;const k=UT.eq.kit;return {shirt:k.s,shorts:k.p,socks:k.c,shirtB:k.b,pat:k.m==='uni'?'':k.m,hot:EQ_KIT_HOT.includes(k.s)};};
const eqSumTxt=()=>{const b=eqBonus(UT.eq),ks=SHOW.filter(k=>b[k]);return ks.length?ks.map(k=>`${LBL[k]} <b>+${b[k]}</b>`).join(' · '):'nessun accessorio: li trovi nei pacchetti equipaggiamento';};
let eqSel='boot',eqMsgT='',eqBack='ut';
function renderEquip(){
  const e=UT.eq,slot=k=>{const it=eqItem(k),r=e.on[k],has=r!==undefined;
    return `<button type="button" class="eqs${has?' '+EQ_RAR[r][1]:''}${k===eqSel?' on':''}" data-k="${k}" aria-label="${it.n}">${eqIcon(k,has?r:-1,44)}<span><b>${it.n}</b><small>${has?'+'+EQ_PLUS[r]+' '+LBL[it.st]:LBL[it.st]+' · vuoto'}</small></span></button>`;};
  $('eqInfo').innerHTML=`Bonus a tutta la squadra: ${eqSumTxt()} · Gettoni: <b>${UT.coins}</b>`;
  $('eqL').innerHTML=EQ_SIDE[0].map(slot).join('');$('eqR').innerHTML=EQ_SIDE[1].map(slot).join('');
  $('eqFig').innerHTML=eqDoll({on:e.on,kit:e.kit,oro:!!premiKit()});
  const it=eqItem(eqSel),cur=e.on[eqSel];
  $('eqPick').innerHTML=`<div class="eqph">${it.n} · ${LBL[it.st]}</div><div class="eqrs">${EQ_RAR.map(([rn,rc],r)=>{const own=eqHas(e,eqSel,r),w=cur===r;
    return `<button type="button" class="eqr ${rc}${w?' on':''}" data-r="${r}"${own?'':' disabled'}>${eqIcon(eqSel,own?r:-1,32)}<span><b>${rn}</b><small>+${EQ_PLUS[r]} · ${w?'indossato':(own?'equipaggia':'da trovare')}</small></span></button>`;}).join('')}</div>${cur!==undefined?'<button type="button" class="sec" id="eqOff">Togli</button>':''}`;
  const sw=z=>EQ_KIT_COL.map(c=>`<button type="button" class="eqsw${e.kit[z]===c?' on':''}" data-z="${z}" data-c="${c}" style="background:${c}" aria-label="${EQ_COLN[c]}"></button>`).join('');
  const pat=`<div class="eqkr"><small>Motivo della maglia</small><div class="seg eqpat">${EQ_KIT_PAT.map(([m,n])=>`<button type="button" class="sg${e.kit.m===m?' on':''}" data-m="${m}">${n}</button>`).join('')}</div></div>`;
  // il secondo colore sta subito sotto quello della maglia (prima era in fondo, dopo calzettoni e motivo); il motivo segue la maglia
  const row=(z,n)=>`<div class="eqkr"><small>${n}</small><div class="eqsws">${sw(z)}</div></div>`;
  $('eqKit').innerHTML=`<div class="eqph">Divisa</div>${premiEqRow()}${row('s','Maglia')}${e.kit.m!=='uni'?row('b','Secondo colore della maglia'):''}${pat}${row('p','Pantaloncini')}${row('c','Calzettoni')}${EQ_KIT_HOT.includes(e.kit.s)?'<p class="qp" style="margin:6px 0 0">Con la maglia rossa o arancione l’avversaria gioca in bianco.</p>':''}`;
  $('eqMsg').textContent=eqMsgT;
  const sh=$('utEquip').querySelector('.shead');   // il manichino resta fermo sotto il titolo (che sugli schermi bassi resta fermo anche lui)
  $('utEquip').style.setProperty('--eqtop',(getComputedStyle(sh).position==='sticky'?sh.offsetHeight:0)+8+'px');
}
$('eqL').parentElement.addEventListener('click',e=>{const b=e.target.closest('.eqs');if(!b)return;eqSel=b.dataset.k;eqMsgT='';renderEquip();});
$('eqPick').addEventListener('click',e=>{
  if(e.target.closest('#eqOff')){delete UT.eq.on[eqSel];eqMsgT='Hai tolto: '+eqItem(eqSel).n+'.';utSave();renderEquip();return;}
  const b=e.target.closest('.eqr');if(!b||b.disabled)return;const r=+b.dataset.r;
  if(!eqHas(UT.eq,eqSel,r))return;UT.eq.on[eqSel]=r;eqMsgT=`${eqItem(eqSel).n} ${EQ_RAR[r][0].toLowerCase()}: +${EQ_PLUS[r]} ${LBL[eqItem(eqSel).st]} a tutta la squadra.`;utSave();renderEquip();
});
$('eqKit').addEventListener('click',e=>{if(e.target.closest('#eqOro')){premiWear(!premiKit());renderEquip();return;}
  if(e.target.closest('[data-m],.eqsw'))premiWear(false);   // scegli colori o motivo: la Oro Nero si toglie, cosi' li vedi
  const m=e.target.closest('[data-m]');if(m){UT.eq.kit.m=m.dataset.m;eqMsgT='';utSave();renderEquip();return;}
  const b=e.target.closest('.eqsw');if(!b)return;UT.eq.kit[b.dataset.z]=b.dataset.c;eqMsgT='';utSave();renderEquip();});
$('eqBack').addEventListener('click',()=>{eqMsgT='';showScreen(eqBack);});
$('uEquip').addEventListener('click',()=>{eqBack='ut';showScreen('utEquip');});
$('urEquip').addEventListener('click',()=>{eqBack='utReal';showScreen('utEquip');});
const eqSubTxt=()=>{const n=Object.keys(UT.eq.on).length;return n?`${n}/6 accessori · divisa`:'Accessori e divisa';};

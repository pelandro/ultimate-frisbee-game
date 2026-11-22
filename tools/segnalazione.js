#!/usr/bin/env node
/* Legge un file di «Segnala un problema» (menu di pausa del gioco) e lo rende leggibile.
   node tools/segnalazione.js <file.json> [--uscita <cartella>] [--pannelli <n>]
   Scrive nella cartella (di solito accanto al file):
   - <nome>-tracce.png: il campo visto dall'alto in <n> momenti (predefinito 6), ognuno con le scie dei secondi prima;
   - <nome>-filmato.png: tutte le immagini del filmato dello schermo, con il tempo (in giallo quelle di salti, tuffi e replay);
   - <nome>-scene.png: solo le immagini di salti, tuffi e replay, piu' grandi, con la fase della scena;
   - <nome>-filmato.html: il filmato da guardare nel browser, alla velocita' vera;
   - <nome>-schermo.jpg: la foto dello schermo al momento della segnalazione;
   e stampa un riassunto: partita, schemi, cronologia (lanci, prese, turnover, salti e tuffi con l'esito, replay, cambi di fase), i momenti in cui l'attacco
   si e' bloccato (tanti fermi insieme) e chi e' rimasto fermo a lungo.
   Blu = la tua squadra (0), rosso = gli avversari (1); B1, R3... sono i numeri della legenda in fondo all'immagine. */
'use strict';
const fs=require('fs'),path=require('path');
const args=process.argv.slice(2),file=args.find(a=>!a.startsWith('--'));
const opt=k=>{const i=args.indexOf(k);return i>=0?args[i+1]:null;};
if(!file){console.log('Uso: node tools/segnalazione.js <file.json> [--uscita <cartella>] [--pannelli <n>]');process.exit(1);}
const R=JSON.parse(fs.readFileSync(file,'utf8'));
if(R.kind!=='segnalazione'){console.log('Questo file non è una segnalazione del gioco.');process.exit(1);}
const out=opt('--uscita')||path.dirname(path.resolve(file)),base=path.join(out,path.basename(file).replace(/\.json$/i,''));
const NP=Math.max(1,Math.min(12,+(opt('--pannelli')||6)));
const F=R.fr.map(f=>Object.assign({t:f.w!==undefined?f.w:f.t},f)),P=R.partita,L=R.campo.L,W=R.campo.W,EZ=R.campo.EZ;   // v1 aveva t, v2 ha w (orologio comune)
const EV=(R.ev||[]).map(e=>Object.assign({t:e.w},e)),FILM=(R.film||[]).map(f=>Object.assign({t:f.w},f));
if(!F.length&&!FILM.length){console.log('La segnalazione non contiene istantanee.');process.exit(1);}

// numeri brevi per la legenda: B1.. per la squadra 0, R1.. per la 1, nell'ordine in cui compaiono
const tag={},cnt=[0,0];
for(const k of Object.keys(R.giocatori||{}).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true})))if(!tag[k]){const t=+k.split('.')[0];tag[k]=(t?'R':'B')+(++cnt[t]);}
for(const fr of F)for(const p of fr.p)if(!tag[p[0]]){const t=+p[0].split('.')[0];tag[p[0]]=(t?'R':'B')+(++cnt[t]);}
const G=R.giocatori,nm=k=>k?(tag[k]||k)+' '+((G[k]&&G[k].n)||''):'nessuno';
const f1=v=>(Math.round(v*10)/10).toFixed(1);
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const posOf=(fr,k)=>{const p=fr.p.find(q=>q[0]===k);return p?[p[1],p[2]]:null;};

// ---- riassunto ----
const tEnd=R.fine!==undefined?R.fine:(F.length?F[F.length-1].t:FILM[FILM.length-1].t),t0=Math.min(F.length?F[0].t:tEnd,FILM.length?FILM[0].t:tEnd),rel=t=>f1(t-tEnd)+' s';
const L1=[];
L1.push(`Segnalazione del ${R.ora||R.quando.replace('T',' ').slice(0,16)+' UTC'} · build ${R.build||'?'} · schermo ${R.schermo.join('×')}`);
L1.push(`${P.modo}${P.lega?' · '+P.lega+' '+(P.serie||''):''} · ${P.label||''}`);
L1.push(`${P.mia||'Blu'} ${P.score[0]} – ${P.score[1]} ${P.avv||'Rossi'} · meta ${P.meta} · si gioca ai ${P.target} · disco a ${P.poss===0?'Blu':'Rossi'}`);
L1.push(`Schemi Blu: attacco ${P.sch.att}, difesa ${P.sch.def} · Rossi: attacco ${P.opp.att}, difesa ${P.opp.def} · difesa ${P.def?'a tempo':'automatica'} · livello IA ${JSON.stringify(P.lvl)}${P.oppPlus?' +'+P.oppPlus:''}`);
L1.push(`Direzione d'attacco Blu ${P.dir&&P.dir[0]>0?'→':'←'} · vento ${P.wind?('livello '+P.wind.lv+', '+f1(P.wind.x)+'/'+f1(P.wind.y)):'nessuno'}${P.wx?' · meteo '+JSON.stringify(P.wx):''}`);
L1.push(`Registrati ${f1(tEnd-t0)} s: ${F.length} istantanee del gioco, ${FILM.length} immagini del filmato, ${EV.length} eventi. I tempi sono in secondi prima della segnalazione.`);
L1.push('');L1.push('Cronologia:');
const CR=[];
const kindTxt={jump:'duello in salto',dive:'tuffo',dive2:'tuffo a tempo'};
for(const e of EV){
  if(e.k==='fase')CR.push([e.t,'fase '+e.m]);
  else if(e.k==='scena')CR.push([e.t,`SCENA LATERALE: ${kindTxt[e.kind]||e.kind}${e.a?' · attacca '+nm(e.a):''}${e.d?' · difende '+nm(e.d):''}${e.diver?' · si tuffa '+nm(e.diver):''}${e.timing?' (a tempo)':''}`]);
  else if(e.k==='esito scena')CR.push([e.t,`esito della scena: ${e.out}${e.bonus!==null&&e.bonus!==undefined?' · tempismo '+f1(e.bonus):''}`]);
  else if(e.k==='replay')CR.push([e.t,'replay: '+e.lab]);
}
let prev=null,flight=null;
for(const fr of F){
  const ev=[];
  if(!EV.length&&(!prev||fr.m!==prev.m))ev.push('fase '+fr.m);
  if(prev&&fr.pt!==prev.pt)ev.push(`nuova meta (${fr.sc.join('-')})`);
  if(prev&&fr.po!==prev.po)ev.push('cambio di possesso: ora '+(fr.po===0?'Blu':'Rossi'));
  if(fr.f&&(!flight||flight.th!==fr.f.th||dist(flight.s,fr.f.s)>0.01)){flight=fr.f;ev.push(`lancio ${fr.f.k}${fr.f.hi?' alto':''} di ${nm(fr.f.th)} verso ${fr.f.to?nm(fr.f.to):'lo spazio'} (${f1(dist(fr.f.s,fr.f.e))} m)`);}
  if(!fr.f)flight=null;
  if(prev&&fr.h!==prev.h&&fr.h){const a=prev.h&&posOf(prev,prev.h),b=posOf(fr,fr.h);ev.push(`disco a ${nm(fr.h)}${a&&b?' ('+f1(dist(a,b))+' m)':''}`);}
  if(prev&&fr.h!==prev.h&&!fr.h&&!fr.f)ev.push('disco a terra o fuori');
  for(const i of [0,1]){const a=fr.pb[i],b=prev&&prev.pb[i];if(a&&(!b||a.id!==b.id||a.ph!==b.ph||a.sg!==b.sg))ev.push(`schema ${i?'Rossi':'Blu'}: ${a.id} fase ${a.ph} ${a.sg}${a.pr?' (preparazione al centro)':''}`);}
  if(prev&&fr.st>=7&&prev.st<7)ev.push('stall oltre 7');
  if(ev.length)CR.push([fr.t,ev.join(' · ')]);
  prev=fr;
}
CR.sort((a,b)=>a[0]-b[0]);for(const [t,x] of CR)L1.push(`  ${rel(t).padStart(8)}  ${x}`);
// fermi. Un cutter che aspetta il suo turno nello stack e' normale: conta quando l'attacco si blocca, cioe' quando stanno fermi in tanti insieme
// (almeno MANY attaccanti senza disco per MANY_T s). Chi resta fermo a lungo (LONG_T s) si elenca a parte, solo come informazione, con il ruolo nello schema.
const MANY=4,MANY_T=2,LONG_T=8,SLOW=0.4;
const liveOf=fr=>fr.m==='play'&&!fr.pull&&!(fr.wk!==undefined?fr.wk:fr.w&&fr.w===1)&&(fr.h||fr.f);
const slowOf=(fr,p)=>Math.hypot(p[3],p[4])<SLOW&&p[0]!==fr.h;
L1.push('');L1.push(`Attacco bloccato: almeno ${MANY} attaccanti senza disco fermi insieme per ${MANY_T} s o più:`);
let blk=null,anyBlk=false;
const blkEnd=()=>{if(blk&&blk.b-blk.a>=MANY_T){anyBlk=true;L1.push(`  ${blk.po?'Rossi':'Blu'} da ${rel(blk.a)} a ${rel(blk.b)}: fermi ${[...blk.who].map(k=>tag[k]||k).join(', ')}`);}blk=null;};
for(const fr of F){
  const st=liveOf(fr)?fr.p.filter(p=>p[0].startsWith(fr.po+'.')&&slowOf(fr,p)):[];
  if(st.length>=MANY){if(!blk||blk.po!==fr.po){blkEnd();blk={po:fr.po,a:fr.t,b:fr.t,who:new Set()};}blk.b=fr.t;st.forEach(p=>blk.who.add(p[0]));}
  else blkEnd();
}
blkEnd();if(!anyBlk)L1.push('  mai');
L1.push('');L1.push(`Fermi per ${LONG_T} s o più (può essere normale: guarda il ruolo nello schema):`);
const still={};let anyStill=false;
const stillOut=(k,v,tail)=>{if(v.b-v.a>=LONG_T){anyStill=true;L1.push(`  ${nm(k)}${v.r?' (ruolo '+v.r+')':''}: da ${rel(v.a)} ${tail?'fino alla segnalazione':'a '+rel(v.b)}`);}};
for(const fr of F){
  const live=liveOf(fr);
  for(const p of fr.p){
    const k=p[0];
    if(live&&p[0].startsWith(fr.po+'.')&&slowOf(fr,p)){if(!still[k])still[k]={a:fr.t,b:fr.t,r:p[7]};still[k].b=fr.t;}
    else if(still[k]){stillOut(k,still[k]);delete still[k];}
  }
}
for(const k in still)stillOut(k,still[k],true);
if(!anyStill)L1.push('  nessuno');
// ultimo istante
const last=F[F.length-1];
if(last){
L1.push('');L1.push(`Ultimo istante (${last.m}, stall ${f1(last.st)}, disco ${last.h?'a '+nm(last.h):(last.f?'in volo':'a terra')}):`);
for(const t of [0,1]){
  L1.push('  '+(t?'Rossi':'Blu')+':');
  for(const p of last.p.filter(q=>q[0].startsWith(t+'.'))){
    const g=G[p[0]]||{};
    L1.push(`    ${(tag[p[0]]||'').padEnd(3)} ${(g.n||'').padEnd(16)} ${(g.role||g.pos||'').toString().padEnd(7)} x ${f1(p[1]).padStart(5)} y ${f1(p[2]).padStart(4)} · ${f1(Math.hypot(p[3],p[4]))} m/s${p[7]?' · ruolo '+p[7]:''}${p[6]?' · marca '+(tag[p[6]]||p[6]):''}${p[5]?' · tuffo':''}`);
  }
}
}
const txt=L1.join('\n');console.log(txt);

// ---- foto dello schermo ----
if(R.foto&&R.foto.startsWith('data:image/jpeg;base64,')){fs.writeFileSync(base+'-schermo.jpg',Buffer.from(R.foto.split(',')[1],'base64'));console.log('\nFoto dello schermo: '+base+'-schermo.jpg');}

// ---- filmato da guardare nel browser ----
if(FILM.length){
  const fh=`<!doctype html><meta charset="utf-8"><title>Filmato della segnalazione</title><body style="margin:0;background:#111;color:#eee;font:14px monospace;text-align:center">
<img id="i" style="max-width:100%;image-rendering:pixelated"><p id="l"></p><button id="b">Pausa</button> <input id="r" type="range" min="0" max="${FILM.length-1}" value="0" style="width:60%">
<script>const F=${JSON.stringify(FILM.map(f=>({t:f.t,m:f.m,ph:f.ph||'',q:f.q||'',rp:f.rp||'',img:f.img})))},E=${tEnd};let k=0,on=true,acc=0,last=performance.now();
const show=()=>{const f=F[k];i.src=f.img;r.value=k;l.textContent=(f.t-E).toFixed(2)+' s · '+f.m+(f.ph?' · scena '+f.ph+(f.q?' '+f.q:''):'')+(f.rp?' · replay '+f.rp:'');};
b.onclick=()=>{on=!on;b.textContent=on?'Pausa':'Riproduci';};r.oninput=()=>{k=+r.value;show();};
(function loop(n){const d=(n-last)/1000;last=n;if(on){acc+=d;while(k<F.length-1&&acc>=F[k+1].t-F[k].t){acc-=F[k+1].t-F[k].t;k++;show();}if(k>=F.length-1&&acc>1){k=0;acc=0;show();}}requestAnimationFrame(loop);})(last);show();</script>`;
  fs.writeFileSync(base+'-filmato.html',fh);console.log('Filmato da guardare: '+base+'-filmato.html');
}

// ---- immagine con le tracce ----
let chromium;try{({chromium}=require('playwright'));}catch(e){console.log('\nPlaywright non è installato (npm install): niente immagine delle tracce.');process.exit(0);}
const span=(tEnd-(F.length?F[0].t:tEnd))/NP,panels=[],tF0=F.length?F[0].t:tEnd;
for(let i=0;i<NP;i++){const tb=tF0+span*(i+1),ta=tb-span;panels.push({ta,tb,fr:F.filter(f=>f.t>=ta-1e-6&&f.t<=tb+1e-6)});}
const legend=Object.keys(tag).sort((a,b)=>tag[a][0]===tag[b][0]?tag[a].slice(1)-tag[b].slice(1):(tag[a]<tag[b]?-1:1)).map(k=>`${tag[k]} ${(G[k]&&G[k].n)||''} (${(G[k]&&(G[k].role||G[k].pos))||''})`);
const html=`<!doctype html><meta charset="utf-8"><body style="margin:0;background:#1d2b1d;font:12px monospace;color:#eee"><canvas id="v"></canvas><script>
const D=${JSON.stringify({panels:panels.map(p=>({ta:p.ta,tb:p.tb,fr:p.fr})),tag,legend,L,W,EZ,tEnd,dir:P.dir||[1,-1]})};
const S=6,PW=D.L*S+20,PH=D.W*S+34,COLS=2,ROWS=Math.ceil(D.panels.length/COLS),LH=16,LEG=Math.ceil(D.legend.length/4)*LH+16;
const c=document.getElementById('v');c.width=COLS*PW;c.height=ROWS*PH+LEG;const g=c.getContext('2d');
const col=k=>k.startsWith('0.')?'#4aa3ff':'#ff5a4e';
D.panels.forEach((P,i)=>{
  const ox=(i%COLS)*PW+10,oy=Math.floor(i/COLS)*PH+24,X=x=>ox+x*S,Y=y=>oy+y*S;
  g.fillStyle='#2f6b2f';g.fillRect(X(0),Y(0),D.L*S,D.W*S);
  g.fillStyle='#285c28';g.fillRect(X(0),Y(0),D.EZ*S,D.W*S);g.fillRect(X(D.L-D.EZ),Y(0),D.EZ*S,D.W*S);
  g.strokeStyle='#e8f0e8';g.lineWidth=1;g.strokeRect(X(0),Y(0),D.L*S,D.W*S);
  g.beginPath();g.moveTo(X(D.EZ),Y(0));g.lineTo(X(D.EZ),Y(D.W));g.moveTo(X(D.L-D.EZ),Y(0));g.lineTo(X(D.L-D.EZ),Y(D.W));g.stroke();
  const fr=P.fr,last=fr[fr.length-1];
  g.fillStyle='#eee';g.fillText((P.ta-D.tEnd).toFixed(1)+' → '+(P.tb-D.tEnd).toFixed(1)+' s'+(last?'  · '+last.m+(last.sc?'  '+last.sc.join('-'):'')+'  stall '+last.st.toFixed(1):''),ox,oy-8);
  g.fillText('Blu '+(D.dir[0]>0?'→':'←'),ox+D.L*S-60,oy-8);
  if(!last)return;
  // scie
  const tr={};for(const f of fr)for(const p of f.p)(tr[p[0]]=tr[p[0]]||[]).push([p[1],p[2]]);
  for(const k in tr){const a=tr[k];g.strokeStyle=col(k);g.globalAlpha=.55;g.lineWidth=2;g.beginPath();a.forEach((q,j)=>j?g.lineTo(X(q[0]),Y(q[1])):g.moveTo(X(q[0]),Y(q[1])));g.stroke();g.globalAlpha=1;}
  // marcature e volo
  const pos={};for(const p of last.p)pos[p[0]]=p;
  g.setLineDash([2,3]);g.strokeStyle='rgba(255,255,255,.35)';
  for(const p of last.p)if(p[6]&&pos[p[6]]){g.beginPath();g.moveTo(X(p[1]),Y(p[2]));g.lineTo(X(pos[p[6]][1]),Y(pos[p[6]][2]));g.stroke();}
  if(last.f){g.strokeStyle='#fff';g.beginPath();g.moveTo(X(last.f.s[0]),Y(last.f.s[1]));g.lineTo(X(last.f.e[0]),Y(last.f.e[1]));g.stroke();}
  g.setLineDash([]);
  // giocatori e disco
  for(const p of last.p){
    const x=X(p[1]),y=Y(p[2]);
    if(p[0]===last.h){g.strokeStyle='#ffd23f';g.lineWidth=3;g.beginPath();g.arc(x,y,9,0,7);g.stroke();}
    g.fillStyle=col(p[0]);g.beginPath();g.arc(x,y,6.5,0,7);g.fill();
    g.fillStyle='#fff';g.font='bold 9px monospace';g.textAlign='center';g.fillText(D.tag[p[0]].slice(1),x,y+3);g.textAlign='left';g.font='12px monospace';
    if(p[7]){g.fillStyle='#ffe9a8';g.font='9px monospace';g.fillText(p[7],x+8,y-6);g.font='12px monospace';}
  }
  g.fillStyle='#fff';g.beginPath();g.arc(X(last.d[0]),Y(last.d[1]),3,0,7);g.fill();
});
g.fillStyle='#eee';D.legend.forEach((t,j)=>g.fillText(t,10+(j%4)*(c.width/4),ROWS*PH+16+Math.floor(j/4)*LH));
</script>`;
// fogli di immagini del filmato: tutte piccole, e quelle di salti, tuffi e replay piu' grandi
const sheet=(fr,w,cols)=>`<!doctype html><meta charset="utf-8"><body style="margin:0;background:#111;color:#eee;font:12px monospace"><div id="v" style="display:grid;grid-template-columns:repeat(${cols},${w}px);gap:4px;padding:4px;width:max-content">${fr.map(f=>{const sc=f.m==='cine'||f.rp;return `<figure style="margin:0"><img src="${f.img}" style="width:${w}px;display:block;outline:${sc?'2px solid #ffcc33':'none'}"><figcaption style="color:${sc?'#ffcc33':'#ccc'}">${(f.t-tEnd).toFixed(2)} s · ${f.m}${f.ph?' · '+f.ph+(f.q?' '+f.q:''):''}${f.rp?' · '+f.rp:''}</figcaption></figure>`;}).join('')}</div>`;
(async()=>{
  const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1300,height:900}});
  const snap=async(h,file,lab)=>{await pg.setContent(h);await pg.waitForTimeout(150);const el=await pg.$('#v');await el.screenshot({path:file});console.log(lab+': '+file);};
  if(F.length)await snap(html,base+'-tracce.png','Tracce dall\'alto');
  if(FILM.length)await snap(sheet(FILM,160,10),base+'-filmato.png','Filmato (tutte le immagini)');
  const SA=FILM.filter(f=>f.m==='cine'||f.rp),SC=SA.length>24?Array.from({length:24},(_,i)=>SA[Math.round(i*(SA.length-1)/23)]):SA;   // al massimo 24, a intervalli regolari
  if(SC.length)await snap(sheet(SC,360,4),base+'-scene.png','Salti, tuffi e replay'+(SA.length>SC.length?` (${SC.length} di ${SA.length}: tutte nel filmato)`:''));
  await b.close();
})().catch(e=>{console.log('Immagini non riuscite: '+e.message);});

/* ---- Ultimate Team: i pacchetti sono dischi (frisbee) e si comprano nel Negozio ---- */
// Colori per qualita' del pacchetto (0-6): [bordo, fianco, superficie, riflesso, anelli]. Piu' sale la rarita', piu' il disco e' ricco:
// base grigio liscio; acquistato blu con due anelli; bronzo, argento, oro e platino sempre piu' brillanti, con stelle, scintille e bagliore; il super disco e' arcobaleno.
const UT_DISC=[
  ['#5a6275','#9aa3b5','#e4e8f0','#ffffff','#b4bccb'],   // 0 base
  ['#244a86','#4f86cf','#bfdcff','#ffffff','#6f9fe0'],   // 1 acquistato
  ['#5e2f12','#a8663a','#e0a06a','#ffd9b0','#7a4320'],   // 2 bronzo
  ['#3d4659','#8d97ab','#e3e8f2','#ffffff','#6b7587'],   // 3 argento
  ['#7a4a00','#e0a000','#ffd23f','#fff7b0','#a86f00'],   // 4 oro
  ['#14566e','#4fb8dc','#c4f4ff','#ffffff','#2b8aa8'],   // 5 platino
  ['#3a1458','#8a3fd0','#ffffff','#ffffff','#ffffff']    // 6 super: la superficie e' un arcobaleno
];
let utDiscN=0;
const utStar=(x,y,r,f)=>`<path d="M${x} ${y-r}L${x+r*0.3} ${y-r*0.3}L${x+r} ${y}L${x+r*0.3} ${y+r*0.3}L${x} ${y+r}L${x-r*0.3} ${y+r*0.3}L${x-r} ${y}L${x-r*0.3} ${y-r*0.3}Z" fill="${f}" stroke="#000" stroke-width="1"/>`;
// n = numero di carte scritto al centro; role = 'H' o 'C' per i pacchetti dedicati (un distintivo sul bordo)
function utDisc(q,n,role){
  q=clamp(q|0,0,6);const c=UT_DISC[q],id='ud'+(utDiscN++);
  const rings=[1,2,2,3,3,4,4][q];
  let s=`<svg class="disc q${q}" viewBox="0 0 120 92" aria-hidden="true">`;
  if(q===6)s+=`<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff4d4d"/><stop offset=".17" stop-color="#ff9f1c"/><stop offset=".34" stop-color="#ffe94d"/><stop offset=".5" stop-color="#4dff88"/><stop offset=".67" stop-color="#4dd2ff"/><stop offset=".84" stop-color="#6b6bff"/><stop offset="1" stop-color="#e04dff"/></linearGradient></defs>`;
  s+=`<ellipse cx="60" cy="82" rx="46" ry="6" fill="#000" opacity=".35"/>`;
  s+=`<ellipse cx="60" cy="54" rx="54" ry="31" fill="${c[0]}" stroke="#000" stroke-width="4"/>`;     // fianco (spessore del disco)
  s+=`<ellipse cx="60" cy="48" rx="54" ry="31" fill="${c[1]}" stroke="#000" stroke-width="4"/>`;     // bordo superiore
  s+=`<ellipse cx="60" cy="48" rx="45" ry="25" fill="${q===6?`url(#${id})`:c[2]}" stroke="#000" stroke-width="2"/>`;
  for(let i=1;i<=rings;i++)s+=`<ellipse cx="60" cy="48" rx="${45-i*7.5}" ry="${25-i*4.2}" fill="none" stroke="${c[4]}" stroke-width="${q===6?1.6:2}" opacity="${q===6?.85:1}"/>`;
  s+=`<path d="M20 40Q26 26 44 21" fill="none" stroke="${c[3]}" stroke-width="3" stroke-linecap="round" opacity=".9"/>`;   // riflesso
  if(q>=4){for(const [x,y] of [[16,50],[104,50],[34,72],[86,72]])s+=utStar(x,y,q>=6?5:4,c[3]);}   // stelle sul bordo: oro e oltre
  if(q>=5){for(const [x,y] of [[60,19],[60,77]])s+=utStar(x,y,5,c[3]);s+=utStar(98,30,3,'#fff')+utStar(22,66,3,'#fff');}   // scintille: platino e oltre
  if(q===3)s+=utStar(100,32,3,'#fff');
  s+=`<text x="60" y="${role?47:53}" text-anchor="middle" font-size="26" font-weight="900" fill="#fff" stroke="#000" stroke-width="5" paint-order="stroke" font-family="inherit">${n}</text>`;
  if(role==='E')s+=`<circle cx="60" cy="64" r="10" fill="#ff6fb5" stroke="#000" stroke-width="2.5"/><path d="M55 57h4v5h3l4 2v3H55z" fill="#000"/><rect x="56" y="58" width="2" height="4" fill="#fff"/><rect x="55" y="68" width="11" height="1.6" fill="#000"/>`;   // pacchetto equipaggiamento: uno scarpino nel distintivo
  else if(role)s+=`<circle cx="60" cy="64" r="8" fill="${role==='H'?'#ff8a3d':'#3ddc97'}" stroke="#000" stroke-width="2.5"/><text x="60" y="68" text-anchor="middle" font-size="11" font-weight="900" fill="#000" font-family="inherit">${role}</text>`;
  return s+'</svg>';
}
// ---- il Negozio: tre pacchetti, con il prezzo per [torneo contro il computer, Real player] (i gettoni dell'una e dell'altra squadra sono separati) ----
// Il pacchetto normale costa come prima (90 e 130, quello di Real player e' piu' caro perche' i gettoni si guadagnano piu' in fretta). Gli altri due hanno solo 3 carte, tutte dello stesso
// ruolo: costano circa il 70% del normale (con il 60% delle carte), perche' si sceglie cosa comprare. La qualita' e' quella del pacchetto acquistato per tutti e tre.
const UT_SHOP=[
  {k:'std',n:'Pacchetto',cards:5,code:1,q:1,role:'',cost:[90,UTO_PACK],d:'5 carte: handler, cutter e defender. Più sono forti, più sono rare.'},
  {k:'han',n:'Pacchetto Handler',cards:3,code:131,q:1,role:'H',cost:[65,90],d:'3 carte, tutte Handler: per costruire il tuo gioco al disco.'},
  {k:'cut',n:'Pacchetto Cutter',cards:3,code:231,q:1,role:'C',cost:[65,90],d:'3 carte, tutte Cutter: per tagliare e correre in campo.'},
  {k:'eq',n:'Pacchetto equipaggiamento',cards:2,code:321,q:1,role:'E',cost:[120,160],d:'2 accessori diversi che potenziano tutta la squadra. I doppioni diventano gettoni.'}   // equipaggiamento: 10-sim/25-ut-equipaggiamento.js
];
let shMsg='';
function renderShop(){
  const rp=UT.rp?1:0,pend=UT.packs.length;
  $('shInfo').innerHTML=`Gettoni: <b>${UT.coins}</b>${pend?` · Da aprire: <b>${pend}</b>`:''}`;
  $('shList').innerHTML=UT_SHOP.map(it=>`<div class="shopi"><div class="dpk">${utDisc(it.q,it.cards,it.role)}<b>${it.n}</b><small>${it.d}</small></div><button type="button" class="go" data-k="${it.k}"${UT.coins<it.cost[rp]?' disabled':''}>Compra · ${it.cost[rp]} gettoni</button></div>`).join('');
  $('shMsg').textContent=shMsg;$('shOpen').classList.toggle('hidden',!pend);
}
$('shList').addEventListener('click',e=>{
  const b=e.target.closest('[data-k]');if(!b||b.disabled)return;
  const it=UT_SHOP.find(x=>x.k===b.dataset.k),c=it&&it.cost[UT.rp?1:0];if(!it||UT.coins<c)return;
  UT.coins-=c;UT.packs.push(it.code);utSave();shMsg=`${it.n} comprato: lo trovi tra i pacchetti da aprire.`;renderShop();
});
$('shBack').addEventListener('click',()=>{shMsg='';showScreen(UT.rp?'utReal':'ut');});
$('shOpen').addEventListener('click',()=>{shMsg='';UT.stage='closed';showScreen('utPack');});

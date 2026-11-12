/* ---- ROTAZIONE AUTOMATICA SUI TELEFONI ----
   Il campo si gioca in orizzontale. Se un telefono o un tablet e' tenuto in verticale (o ha la rotazione bloccata), invece di chiedere di girarlo
   il gioco si disegna da solo ruotato di 90 gradi: basta inclinare il telefono, senza togliere il blocco della rotazione. Quando lo schermo e'
   davvero orizzontale la rotazione si toglie da sola.
   Come funziona: html.rotp ruota il <body> (il suo lato sinistro va in alto). Le misure del CSS seguono il riquadro ruotato perche' il build
   trasforma media query e unita' vh/vw in container query (tools/build.js). Le coordinate dei tocchi vengono riportate nel riquadro ruotato
   prima che le leggano i gestori del gioco (rotPt). Su Android, in schermo intero, si blocca anche l'orientamento con l'API dello schermo.
   Si puo' spegnere dalle Impostazioni (chiave «ultimate-rotazione»): allora in verticale torna il messaggio «Gira lo schermo». */
const ROT_KEY='ultimate-rotazione';
let rotPref=true;try{rotPref=localStorage.getItem(ROT_KEY)!=='0';}catch(e){}
let rotOn=false;
const rotTouch=()=>typeof matchMedia==='function'&&(matchMedia('(pointer: coarse)').matches||matchMedia('(any-pointer: coarse)').matches);
const rotPortrait=()=>innerHeight>innerWidth;
function rotApply(){
  const want=rotPref&&rotTouch()&&rotPortrait(),root=document.documentElement,b=document.body;
  rotOn=want;root.classList.toggle('rotp',want);
  if(want){b.style.width=innerHeight+'px';b.style.height=innerWidth+'px';}
  else{b.style.width='';b.style.height='';}
}
function setRotPref(v){rotPref=!!v;try{localStorage.setItem(ROT_KEY,rotPref?'1':'0');}catch(e){}rotApply();if(typeof resize==='function')resize();}
// tocco: da coordinate dello schermo a coordinate del riquadro ruotato (il lato sinistro del gioco e' in alto sullo schermo)
const rotPt=(x,y)=>[y,innerWidth-x];
for(const t of ['pointerdown','pointermove','pointerup','pointercancel'])window.addEventListener(t,e=>{
  if(!rotOn||e.__rot)return;const p=rotPt(e.clientX,e.clientY);
  try{Object.defineProperty(e,'clientX',{value:p[0]});Object.defineProperty(e,'clientY',{value:p[1]});e.__rot=1;}catch(_){}
},{capture:true});
window.addEventListener('resize',rotApply);window.addEventListener('orientationchange',()=>{rotApply();setTimeout(()=>{rotApply();if(typeof resize==='function')resize();},250);});
rotApply();
// un rettangolo nelle coordinate del gioco (anche in rotazione): getBoundingClientRect da' quello dello schermo
function layRect(el){
  const r=el.getBoundingClientRect();if(!rotOn)return r;
  const a=rotPt(r.left,r.top),c=rotPt(r.right,r.bottom),l=Math.min(a[0],c[0]),t=Math.min(a[1],c[1]);
  return {left:l,top:t,width:Math.abs(c[0]-a[0]),height:Math.abs(c[1]-a[1]),right:l+Math.abs(c[0]-a[0]),bottom:t+Math.abs(c[1]-a[1])};
}

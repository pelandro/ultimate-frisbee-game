/* La scena usa un canvas separato: il risultato è già registrato e il campo non avanza
   durante la festa. Le pose a scatti si leggono anche sullo schermo di un telefono. */
let cupFrame=0,cupAfter=null;
const CUP_DURATION=2.8;
const CUP_PLAYERS=[
  [48,96],[77,94],[120,91],[163,94],[192,96],
  [107,102],[133,102]
];
function drawCupScene(canvas,looks,kit,europe,seconds,reduced){
  const c=canvas.getContext('2d');
  const box=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);};
  const t=Math.floor(seconds*20)/20;
  const ready=clamp((t-.4)/.8,0,1),raise=ready*ready*(3-2*ready);
  const liftTime=Math.max(0,t-1.2),bounce=reduced?0:Math.sin(liftTime*10)*Math.max(0,2-liftTime);
  const cupY=68-Math.round(25*raise+bounce);
  const accent=europe?'#7bb6ff':'#f3ba5b';
  box(0,0,240,116,europe?'#172949':'#1c2539');
  for(const x of [17,218]){
    box(x+2,10,2,34,'#374862');
    box(x-6,7,17,7,'#465c7b');box(x-4,9,13,3,'#f6e8af');
  }
  // I tifosi sono puntini fissi lontani dal podio, così la sagoma della squadra spicca.
  const crowd=['#344965','#3d5575','#526987','#7894ad',accent];
  for(let row=0;row<4;row++){
    box(0,37+row*8,240,7,row%2?'#20344b':'#263950');
    for(let i=0;i<34;i++){
      const seed=i*41+row*67;
      box(2+i*7+seed%3,38+row*8+seed%3,3,2,crowd[seed%crowd.length]);
    }
  }
  box(0,67,240,5,'#657f98');box(0,72,240,3,'#19243b');
  box(0,75,240,41,'#386c50');box(0,89,240,27,'#437c54');
  for(let i=0;i<22;i++)box((i*47)%238,83+(i*19)%32,4,1,'#589164');
  box(22,98,196,14,'#19243b');box(28,95,184,8,'#4a607e');
  box(24,102,192,2,accent);box(29,110,182,2,'#344763');

  const outline='#111827',dark=shade(kit.shirt,-.2),stripe=shade(kit.shirt,.18);
  const arm=(x,y,hx,hy,skin)=>{
    const length=Math.max(1,Math.abs(hx-x),Math.abs(hy-y));
    for(let i=0;i<=length;i++)box(x+(hx-x)*i/length-1,y+(hy-y)*i/length-1,5,5,outline);
    for(let i=0;i<=length;i++)box(x+(hx-x)*i/length,y+(hy-y)*i/length,3,3,i<length*.29?kit.shirt:skin);
    box(hx-1,hy,4,3,skin);
  };
  CUP_PLAYERS.forEach(([x,ground],i)=>{
    const holds=i>=5;
    const jump=reduced||holds?0:Math.max(0,Math.sin(liftTime*9-i*.58))*Math.max(0,1.8-liftTime)*2;
    const y=ground-Math.round(jump),{skin,hair}=looks[i];
    const up=clamp(raise*1.28-i*.035,0,1),shoulder=y-23;
    const near=x<120?1:-1;
    for(const side of [-1,1]){
      const grip=holds&&side===near;
      arm(x+side*6,shoulder,grip?x-1:x+side*11,grip?cupY+9:shoulder+6-17*up,skin);
    }
    box(x-7,y-27,14,18,outline);
    box(x-6,y-26,12,11,dark);
    box(x-5,y-26,10,8,kit.shirt);
    box(x-4,y-24,8,2,stripe);
    box(x-6,y-15,12,6,kit.shorts);
    for(const side of [-1,1]){
      const leg=x+(side<0?-5:2);
      box(leg-1,y-10,5,10,outline);box(leg,y-9,3,6,skin);
      box(leg,y-5,3,3,kit.socks);box(leg-1,y-3,5,2,'#f2f5fa');
    }
    box(x-6,y-37,12,12,outline);
    box(x-5,y-36,10,9,skin);box(x-5,y-36,10,3,hair);
    if(i%3===1)box(x-5,y-34,2,7,hair);
    if(i%3===2)box(x+3,y-34,2,6,hair);
    box(x-3,y-32,1,2,outline);box(x+2,y-32,1,2,outline);box(x-1,y-29,3,1,'#fff0da');
  });
  const gold='#ffc95b',light='#fff0a5',shadow='#a66425';
  box(105,cupY+3,30,9,outline);box(106,cupY+4,28,7,shadow);
  box(108,cupY+5,24,4,'#273853');
  box(111,cupY,18,11,outline);box(112,cupY+1,16,8,gold);
  box(114,cupY+9,12,4,gold);box(118,cupY+12,4,5,shadow);
  box(114,cupY+16,12,3,outline);box(115,cupY+16,10,2,gold);
  box(113,cupY+1,13,2,light);box(114,cupY+3,2,5,light);box(126,cupY+4,2,5,shadow);
  // Le mani dei due giocatori restano agganciate alle anse mentre la coppa sale.
  box(105,cupY+9,4,3,looks[5].skin);box(131,cupY+9,4,3,looks[6].skin);

  if(reduced||t<1||t>=CUP_DURATION)return;
  const colors=[accent,'#ffe797',europe?'#e7f3ff':kit.shirt,'#f8f3e9'];
  for(let i=0;i<40;i++){
    const age=t-1-(i%8)*.045;
    if(age<0)continue;
    const x=(i*47)%234+3+Math.sin(age*3+i)*7;
    const y=-12+(i*17)%34+age*(24+i%6*6);
    box(x,y,i%3===0?3:2,i%4===0?4:2,colors[i%colors.length]);
  }
}

function openCupScene(title,after){
  cancelAnimationFrame(cupFrame);
  const canvas=$('cupPark'),team=SV.team;
  const kit=KITS[0][hashStr('kit|'+team)%KITS[0].length];
  const ids=matchLine('lineO');
  const looks=CUP_PLAYERS.map((_,i)=>lookOf(SQ[ids[i]]||SQ[i]));
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  $('cupTitle').textContent=title.text;
  $('cupTeam').textContent=team;
  cupAfter=after;
  $('cupScene').classList.remove('hidden');
  const start=performance.now();
  const render=now=>{
    const t=reduced?CUP_DURATION:clamp((now-start)/1000,0,CUP_DURATION);
    drawCupScene(canvas,looks,kit,title.europe,t,reduced);
    if(t<CUP_DURATION)cupFrame=requestAnimationFrame(render);
  };
  render(start);
}

$('cupNext').addEventListener('click',()=>{
  if($('cupScene').classList.contains('hidden'))return;
  cancelAnimationFrame(cupFrame);
  $('cupScene').classList.add('hidden');
  const after=cupAfter;cupAfter=null;
  if(after)after();
});

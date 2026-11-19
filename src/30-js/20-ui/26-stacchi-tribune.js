/* ---- TRIBUNE NEI PRIMI PIANI ----
   La camera laterale ha una prospettiva propria. Le tribune replicano la struttura
   dell'impianto in campo, con materiali più spenti per far leggere giocatori e disco. */
const CINE_ROWS=[
  [],
  [3],
  [4],
  [5],
  [4,4],
  [5,7]
];
const CINE_TOP=[0,0,0.43,0.29,0.2,0.12];
const CINE_SKY=['#729bbb','#677487','#8b9aad'];
const CINE_CONCRETE=[['#737989','#858b9a'],['#7e8c98','#909eab']];
const CINE_EDGE='#292f42';

function cineRepeat(width,gap,offset,draw){
  const first=Math.floor((offset-gap)/gap),last=Math.ceil((offset+width+gap)/gap);
  for(let i=first;i<=last;i++)draw(ri(i*gap-offset),i);
}

function cineLandscape(w,h,y,shift,land,wx){
  px(-5,-5,w+10,h+10,CINE_SKY[wx]);
  const cloud=wx===1?'#798594':'#a6b8c8';
  cineRepeat(w,Math.max(110,w*0.34),shift*0.17,(x,i)=>{
    const cy=ri(h*(0.13+(ihash(i,2)%4)*0.065));
    px(x,cy+4,36,5,cloud);px(x+7,cy+1,22,3,cloud);px(x+15,cy-2,8,3,cloud);
  });
  if(y<20)return;
  px(-5,y-18,w+10,25,wx===2?'#a4b3bd':'#61766c');
  const step=Math.max(30,h*0.36);
  cineRepeat(w,step,shift*0.4,(x,i)=>{
    const seed=ihash(i,48),kind=treeKind(land,seed),high=ri(h*(0.23+(seed%4)*0.045));
    const low=y-2-seed%5,top=low-high,leaf=wx===2?'#617c77':'#41645b',light=wx===2?'#81968e':'#527664';
    if(kind==='abete'){
      for(let r=0;r<3;r++){
        const span=high*(0.23+r*0.1),hy=top+ri(high*r*0.23);
        for(let k=0;k<ri(high*0.48);k+=2){
          const half=ri(span*k/(high*0.48));
          px(x-half,hy+k,half*2+1,2,k===0&&wx===2?'#c4cfd9':leaf);
        }
      }
    }else{
      const tall=kind==='cipresso'||kind==='pioppo';
      const rx=tall?ri(high*0.17):ri(high*0.44),ry=tall?ri(high*0.48):ri(high*0.22);
      px(x-1,top+ry,3,high-ry,'#665b51');
      pell(x,top+ry,rx,ry,leaf);
      pell(x-2,top+ry-2,Math.max(2,rx-4),Math.max(1,ry-3),light);
      if(wx===2)px(x-3,top+1,6,2,'#c4cfd9');
    }
  });
}

function cineFans(a,b,y,row,offset,V,{standing=false,seated=false,aisle=0,mosaic=false,cheer=false,t=0}={}){
  const gap=standing?21:10,stagger=row%2?gap/2:0;
  const seat=cShade(UNI[vnSide(V)].shirt,-0.44);
  for(let i=Math.floor((a+offset-stagger)/gap);;i++){
    const x=ri(i*gap-offset+stagger),seed=ihash(i,row+801);
    if(x>b)break;
    if(x<a)continue;
    if(aisle&&Math.abs(x+offset-Math.round((x+offset)/aisle)*aisle)<8)continue;
    if(seed%1000>=1000*V.fill*(standing?0.72:0.88)){
      if(seated){
        const paint=mosaic&&((i>>2)+row)%3===0?'#8997ad':seat;
        px(x-3,y-4,7,4,CINE_EDGE);px(x-2,y-4,5,2,paint);px(x-2,y-1,5,1,paint);
      }
      continue;
    }
    const jump=cheer&&seed%3===0&&Math.sin(t*26+seed)>0?2:0;
    fanFigure(x,y-jump,seed,V,fanTeam(V,clamp((x/VW)*FIELD_L,0,FIELD_L+10),seed),standing,
      {dark:row>5?-0.39:-0.26,far:row>=3,arms:!!jump});
  }
}

function cineOutdoor(w,h,shift,V,lv,land,wx,cheer,t){
  const floor=h-5,back=ri(h*0.81);
  cineLandscape(w,h,back,shift,land,wx);
  const [wall,roof]=HOUSE[land]||HOUSE.IT;
  const ax=ri(w*(lv===0?0.68:0.12)-shift*0.24),wide=ri(Math.max(52,h*0.66)),roofY=back-ri(h*0.21);
  px(ax,roofY,wide,back-roofY,CINE_EDGE);px(ax+2,roofY+2,wide-4,back-roofY-2,cShade(wall,-0.22));
  for(let sl=0;sl<6;sl++)px(ax-7+sl*2,roofY-1-sl,wide+14-sl*4,1,wx===2?'#d9e1e9':cShade(roof,-0.1));
  for(let x=ax+10;x<ax+wide-10;x+=16){
    px(x,roofY+7,8,6,'#46596a');px(x+1,roofY+8,6,2,'#7891a3');
  }
  px(ax+wide-12,back-10,7,10,'#5e554d');
  px(-5,back,w+10,h-back,'#697e6e');
  const offset=shift*0.95;
  cineFans(-5,w+5,floor,0,offset,V,{standing:true,cheer,t});
  const fenceTop=floor-ri(h*0.17),postGap=Math.max(29,ri(h*0.31));
  for(let y=fenceTop+3;y<floor;y+=4){
    const start=-((ri(offset)+y)%8);
    for(let x=start;x<w+6;x+=8)px(x,y,1,1,'rgba(209,222,227,.37)');
  }
  px(-5,fenceTop,w+10,2,'#526268');px(-5,floor-1,w+10,2,'#526268');
  cineRepeat(w,postGap,offset,x=>{
    px(x,fenceTop-2,3,floor-fenceTop+4,'#43565e');
    px(x,fenceTop-2,1,floor-fenceTop+4,'#86999d');
  });
  if(lv===0)return;
  const span=ri(w*0.53),a=ri((w-span)/2-shift*0.69),b=a+span;
  const steps=CINE_ROWS[1][0],rise=Math.max(11,ri(h*0.1)),top=floor-(steps-1)*rise;
  const deck=land==='US'?'#9da8b6':'#9c8f76';
  px(a-3,top-7,span+6,floor-top+9,'#526268');
  for(let row=steps-1;row>=0;row--){
    const y=floor-row*rise;
    px(a,y-rise+5,span,rise+2,cShade(deck,-0.30));
    px(a,y-2,span,3,deck);
    px(a,y+1,span,2,'#4b535d');
    cineFans(a+6,b-6,y-2,row,offset,V,{cheer,t});
  }
  for(const x of [a,ri((a+b)/2),b]){
    pline(x-3,floor+2,x+5,top-7,'#3d4854',2);
    px(x,top-6,2,floor-top+8,'#a4aeb5');
  }
}

function cineGrandstand(w,h,shift,V,lv,land,wx,cheer,t){
  const top=ri(h*CINE_TOP[lv]),home=UNI[vnSide(V)].shirt;
  const col=CINE_CONCRETE[land==='US'&&lv===2?1:0];
  const rails=shift*0.75,gap=Math.max(100,ri(h*1.1));
  const two=lv>=4,roof=lv>=3,deckGap=two?Math.max(8,ri(h*0.09)):0;
  const roofH=roof?Math.max(6,ri(h*(lv===5?0.14:lv===3?0.105:0.075))):0;
  const front=h-5,roofY=top+roofH;
  cineLandscape(w,h,lv<=3?top:0,shift,land,wx);
  const support=lv===5?'#68748c':'#8d98a8';
  if(lv===5){   // tralicci dietro il tetto e batterie di fari
    cineRepeat(w,gap*1.6,rails*0.46,(x,i)=>{
      const y=2+(i&1)*4;
      px(x-2,y+5,5,top-y+4,'#586478');
      for(let j=y+6;j<top;j+=4)px(x-2,j,5,1,'#8892a3');
      px(x-11,y,23,7,CINE_EDGE);
      for(let k=0;k<4;k++)px(x-9+k*5,y+2,4,2,'#fff1c1');
    });
  }
  px(-5,roofY,w+10,front-roofY,col[0]);
  const lowerTop=two?ri(roofY+(front-roofY)*0.49)+deckGap:roofY;
  const groups=two?[[roofY,lowerTop-deckGap,CINE_ROWS[lv][1]],[lowerTop,front,CINE_ROWS[lv][0]]]
    :[[lowerTop,front,CINE_ROWS[lv][0]]];
  let index=0;
  for(const [start,end,rows] of groups){
    const rise=(end-start)/rows,offset=rails;
    for(let r=0;r<rows;r++){
      const y0=ri(start+r*rise),y1=ri(start+(r+1)*rise);
      const shaded=roof&&start===roofY&&(two||r===0);
      const paint=cShade(col[r%2],shaded?-0.27:-0.09);
      px(-5,y0,w+10,y1-y0,paint);
      px(-5,y1-2,w+10,1,wx===2?'#bdcad6':cShade(paint,0.30));
      cineFans(-5,w+5,y1-2,index++,offset,V,{seated:roof,aisle:gap,mosaic:lv===5,cheer,t});
    }
    cineRepeat(w,gap,rails,x=>{
      px(x-5,start,11,end-start,'#788291');px(x-5,start,1,end-start,'#495567');px(x+5,start,1,end-start,'#a7b1bf');
      for(let r=1;r<=rows;r++)px(x-3,ri(start+r*rise)-2,7,1,'#a0acbb');
    });
  }
  if(two){
    const y=lowerTop-deckGap;
    px(-5,y,w+10,deckGap,CINE_EDGE);
    px(-5,y,w+10,1,'#a2adba');px(-5,y+deckGap-1,w+10,1,'#141b2d');
    cineRepeat(w,27,shift*1.1,(x,i)=>px(x,y+ri(deckGap/2),25,2,i%4===0?'#d2a65b':cShade(home,-0.23)));
  }
  if(roof){
    cineRepeat(w,gap,rails,x=>{
      if(lv===3){
        px(x-2,roofY,4,front-roofY,'#566474');
        px(x-2,roofY,2,front-roofY,support);
        pline(x-1,roofY+7,x+9,roofY-2,'#566474',2);
      }
      else{
        px(x-3,roofY,6,front-roofY,'#454f65');px(x-2,roofY,2,front-roofY,support);
        if(lv===5)pline(x,roofY+2,x+20,top+4,'#8794a7',2);
      }
    });
    const fascia=lv===3?'#8091a2':cShade(home,-0.37);
    px(-5,top,w+10,roofH,CINE_EDGE);px(-5,top+2,w+10,Math.max(2,roofH-5),fascia);
    px(-5,top+1,w+10,1,wx===2?'#dae5ea':'#a4b0bf');
    if(lv===3){
      px(-5,roofY-4,w+10,1,'#a7b4bd');
      px(-5,roofY-2,w+10,2,'#434e60');
    }
    if(lv===5)cineRepeat(w,24,rails,x=>px(x,roofY-4,8,2,'#edd4a2'));
  }else{
    px(-5,top-5,w+10,6,'#9099a8');px(-5,top-5,w+10,1,'#bec6cf');
  }
  px(-5,front,w+10,h-front,CINE_EDGE);
}

function drawCineStands(w,y,boardH,u,travel,cheer,t){
  const V=venueNow(),lv=vnLv(V),land=vnLand(V),wx=G.wx|0,shift=travel*u;
  const bw=ri(u*(lv<=1?3.2:4.6)),seq=boardSeq();
  if(lv<=1)cineOutdoor(w,y+boardH,shift,V,lv,land,wx,cheer,t);
  else cineGrandstand(w,y,shift,V,lv,land,wx,cheer,t);
  const spacing=lv===0?bw*3:lv===1?ri(bw*1.65):bw;
  cineRepeat(w,spacing,shift*1.6,(x,i)=>{
    const height=lv<=1?ri(boardH*(lv===0?0.48:0.64)):boardH;
    const index=(i%seq.length+seq.length)%seq.length;
    cineBoard(x,y+boardH-height,lv>=2?bw-1:bw,height,seq[index]);
  });
}

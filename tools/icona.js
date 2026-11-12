/* Icona del gioco (scheda del browser, scorciatoia sulla Home di iPhone e Android): pixel art 32x32 disegnata qui e ingrandita senza sfumature.
   Un disco bianco e oro che vola sopra il campo, con la scia: lo stesso stile del gioco. Nessuna dipendenza: il PNG viene scritto a mano (zlib e CRC).
   Uso: require('./icona').png(lato) restituisce un Buffer PNG; build.js mette la 64x64 nell'HTML e scrive in dist/ le altre per la pagina web. */
const zlib=require('zlib');
const N=32,C={n:[29,43,83],N:[21,31,62],g:[58,138,58],G:[73,160,70],k:[10,12,20],w:[246,248,244],s:[185,198,216],y:[255,210,63],o:[214,150,30],d:[38,96,40],t:[255,255,255],b:[127,155,208]};
function grid(){
  const px=[];for(let y=0;y<N;y++){const r=[];for(let x=0;x<N;x++){let c=y<19?(y<10?'N':'n'):((Math.floor(x/4)%2)?'G':'g');r.push(c);}px.push(r);}
  const put=(x,y,c)=>{if(x>=0&&x<N&&y>=0&&y<N)px[y][x]=c;};
  for(let x=0;x<N;x++)put(x,19,'t');                                   // linea del campo
  for(let x=10;x<=26;x++){const dx=(x-18)/8.3;if(Math.abs(dx)<=1)for(let y=24;y<=26;y++){const dy=(y-25)/1.6;if(dx*dx+dy*dy<=1)put(x,y,'d');}}   // ombra sul prato
  const cx=17.5,cy=13,rx=11.2,ry=5.2,inD=(x,y)=>((x-cx)/rx)**2+((y-cy)/ry)**2<=1;   // disco: contorno chiuso (pixel dentro con un vicino fuori)
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){if(!inD(x,y))continue;const edge=!inD(x-1,y)||!inD(x+1,y)||!inD(x,y-1)||!inD(x,y+1);put(x,y,edge?'k':(y<cy-1?'w':(y<=cy?'s':'b')));}
  for(let x=8;x<=27;x++)if(inD(x,cy-1)&&inD(x-1,cy-1)&&inD(x+1,cy-1))put(x,cy-1,'y');   // bordo dorato
  for(let x=13;x<=19;x++)put(x,cy-3,'t');put(22,cy,'o');put(23,cy,'o');   // riflesso
  for(const [y,x0,x1] of [[10,3,6],[13,2,5],[16,3,6]]){for(let x=x0;x<=x1;x++)put(x,y,x>=x1-1?'y':'t');}   // scia
  return px;
}
const crcT=(()=>{const t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
const crc=b=>{let c=0xffffffff;for(const x of b)c=crcT[(c^x)&255]^(c>>>8);return (c^0xffffffff)>>>0;};
function chunk(type,data){const l=Buffer.alloc(4);l.writeUInt32BE(data.length);const td=Buffer.concat([Buffer.from(type),data]),c=Buffer.alloc(4);c.writeUInt32BE(crc(td));return Buffer.concat([l,td,c]);}
// lato: dimensione in pixel. Il disegno si ingrandisce di un fattore intero e il resto e' bordo del colore del cielo
function png(side){
  const g=grid(),k=Math.max(1,Math.floor(side/N)),pad=Math.floor((side-k*N)/2),raw=Buffer.alloc(side*(side*3+1));
  for(let y=0;y<side;y++){
    raw[y*(side*3+1)]=0;
    for(let x=0;x<side;x++){
      const gx=Math.floor((x-pad)/k),gy=Math.floor((y-pad)/k),c=C[(gx>=0&&gx<N&&gy>=0&&gy<N)?g[gy][gx]:(y<side*0.55?'n':'g')],o=y*(side*3+1)+1+x*3;
      raw[o]=c[0];raw[o+1]=c[1];raw[o+2]=c[2];
    }
  }
  const ih=Buffer.alloc(13);ih.writeUInt32BE(side,0);ih.writeUInt32BE(side,4);ih[8]=8;ih[9]=2;ih[10]=0;ih[11]=0;ih[12]=0;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ih),chunk('IDAT',zlib.deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0))]);
}
// file per la pagina web: icone e manifest (nome, schermo intero, orizzontale: su Android l'app aggiunta alla Home si apre gia' girata)
function webFiles(){
  const man={name:'Ultimate Frisbee',short_name:'Ultimate',start_url:'./',scope:'./',display:'fullscreen',orientation:'landscape',background_color:'#1d2b53',theme_color:'#1d2b53',
    icons:[{src:'icona-192.png',sizes:'192x192',type:'image/png',purpose:'any maskable'},{src:'icona-512.png',sizes:'512x512',type:'image/png',purpose:'any maskable'}]};
  return {'icona-192.png':png(192),'icona-512.png':png(512),'apple-touch-icon.png':png(180),'manifest.webmanifest':Buffer.from(JSON.stringify(man,null,1))};
}
module.exports={png,webFiles};

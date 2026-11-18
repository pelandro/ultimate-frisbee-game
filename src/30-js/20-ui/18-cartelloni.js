/* ---- CARTELLONI A BORDO CAMPO E MARCHI DEGLI SPONSOR ----
   Prima i cartelloni stavano solo sotto il campo, quasi sempre fuori dall'inquadratura, ed erano larghi 9 m: ci stavano soltanto sigle come «ULT»,
   «PM», «AB». Ora:
   - c'e' una fila di cartelloni anche in alto, davanti alla tribuna: e' il bordo che si vede sotto la barra a campo intero e ogni volta che il gioco
     sale verso l'alto. Ha dei varchi, cosi' il pubblico resta visibile (si capisce ancora se lo stadio e' pieno o vuoto);
   - ogni sponsor ha un marchio: colori, una piccola icona a pixel e uno slogan (SP_BRAND). Quando giochi in casa il tuo sponsor occupa un cartellone su
     due, con il nome e lo slogan; in trasferta ci sono gli sponsor del club di casa (SP_LOCAL), in campo neutro quelli della manifestazione, tuo compreso;
   - l'impianto conta: negli stadi (tier 2) sono LED che cambiano scritta ogni pochi secondi con un'onda che corre lungo il campo, e a ogni meta
     lampeggiano «META!» nel colore di chi ha segnato; sui campi con tribuna sono pannelli fissi; sul campo comunale striscioni di stoffa legati alla rete.
   Il marchio si vede anche fuori dal campo: nella scelta dello sponsor e nella scheda Societa' (spLogoSVG). Tutto deriva dai nomi: niente di salvato. */
// icone 5x5: 'a' colore della scritta, 'b' colore di dettaglio
const SP_ICON={
  wheat:['a.a.a','.aaa.','a.a.a','.aaa.','..a..'],fork:['a.a.a','a.a.a','aaaaa','.aaa.','..a..'],bolt:['..aaa','.aa..','aaaa.','..aa.','.a...'],
  mug:['bbb..','aaaa.','aaa.a','aaaa.','aaa..'],truck:['aaa..','aaabb','aaaab','aaaaa','.b.b.'],shield:['aaaaa','abbba','abbba','.aba.','..a..'],
  wave:['.a...','a.a.a','...a.','.a...','a.a.a'],cup:['.b.b.','..b..','aaaa.','aaa.a','.aa..'],gear:['.a.a.','aaaaa','aa.aa','aaaaa','.a.a.'],
  cone:['.bbb.','bbbbb','aaaaa','.aaa.','..a..'],drop:['..a..','.aaa.','aaaaa','abaaa','.aaa.'],bank:['..a..','.aaa.','a.a.a','a.a.a','aaaaa'],
  apple:['..b..','.aaa.','aaaaa','aaaaa','.a.a.'],scales:['..a..','aaaaa','a.a.a','b.a.b','.aaa.'],hammer:['aaaa.','aaaa.','..a..','..a..','..a..'],
  sun:['a.a.a','.aaa.','aaaaa','.aaa.','a.a.a'],glasses:['.....','aaaaa','ab.ab','aa.aa','.....'],slice:['aaaaa','.bab.','.aaa.','..a..','.....'],
  dumbbell:['.....','a...a','aaaaa','a...a','.....'],radio:['a....','.a...','aaaaa','ab.ba','aaaaa'],leaf:['..aaa','.aaaa','aaba.','ab...','b....'],
  disc:['.....','.aaa.','abbba','.aaa.','.....'],heart:['.a.a.','aaaaa','aaaaa','.aaa.','..a..'],trophy:['aaaaa','aaaaa','.aaa.','..a..','.aaa.']
};
// marchi: fondo, scritta, dettaglio, icona, nome breve (quando il nome intero non ci sta), slogan (al massimo 18 lettere: deve stare su un cartellone)
const SP_BRAND={
  'Cassa Rurale Valli':{bg:'#1f6b45',ink:'#f4f4f4',ac:'#ffd23f',ic:'wheat',sh:'CASSA RURALE',sl:'DALLE VALLI A TE'},
  'Pastificio Moretti':{bg:'#c8202c',ink:'#fff4d6',ac:'#ffd23f',ic:'fork',sh:'MORETTI',sl:'PASTA DA CAMPIONI'},
  'Energia Verde':{bg:'#159a46',ink:'#ffffff',ac:'#ffe14d',ic:'bolt',sh:'ENERGIA VERDE',sl:'ENERGIA PULITA'},
  'Birrificio del Borgo':{bg:'#5a2e0e',ink:'#ffc23d',ac:'#fff3d6',ic:'mug',sh:'BIRRA DEL BORGO',sl:'BRINDA ALLA META'},
  'Autotrasporti Riva':{bg:'#f2a900',ink:'#1a1c2c',ac:'#ffffff',ic:'truck',sh:'RIVA',sl:'SEMPRE IN META'},
  'Assicurazioni Ferri':{bg:'#13335f',ink:'#ffffff',ac:'#7fd8ff',ic:'shield',sh:'FERRI',sl:'AL TUO FIANCO'},
  'Tecnomar':{bg:'#0b7fa6',ink:'#ffffff',ac:'#bff4ff',ic:'wave',sh:'TECNOMAR',sl:'ROTTA SICURA'},
  'Caffè Aurora':{bg:'#3b2217',ink:'#ffb36b',ac:'#f4f4f4',ic:'cup',sh:'AURORA',sl:'CARICA PER IL PULL'},
  'Officine Bruno':{bg:'#4a4f5c',ink:'#ff8a2a',ac:'#d9dde6',ic:'gear',sh:'BRUNO',sl:'MOTORI IN FORMA'},
  'Gelati Dolcecuore':{bg:'#ffb3c7',ink:'#7a1f3d',ac:'#fff3e0',ic:'cone',sh:'DOLCECUORE',sl:'DOLCE COME LA META'},
  'Idraulica Neri':{bg:'#1d4ed8',ink:'#ffffff',ac:'#bfe3ff',ic:'drop',sh:'NERI',sl:'PRONTI IN 24 ORE'},
  'Banca del Lago':{bg:'#0f3b3a',ink:'#9be7d8',ac:'#ffd23f',ic:'bank',sh:'BANCA DEL LAGO',sl:'CRESCIAMO INSIEME'},
  'Frutta Fresca Sud':{bg:'#ff7a1a',ink:'#ffffff',ac:'#2fa84f',ic:'apple',sh:'FRUTTA SUD',sl:'IL SOLE IN TAVOLA'},
  'Studio Legale Conti':{bg:'#ece5d3',ink:'#2a2a2a',ac:'#8a6f2a',ic:'scales',sh:'CONTI',sl:'DIRITTO AL PUNTO'},
  // sponsor delle altre squadre (non ti vengono offerti: sui cartelloni di casa ci sei solo tu)
  'Ferramenta Gallo':{bg:'#e04e1b',ink:'#ffffff',ac:'#ffd23f',ic:'hammer',sh:'GALLO',sl:'TUTTO PER LA CASA'},
  'Panificio Sole':{bg:'#f6c453',ink:'#5a2e0e',ac:'#ffffff',ic:'sun',sh:'SOLE',sl:'PANE FRESCO'},
  'Ottica Blu':{bg:'#2563eb',ink:'#ffffff',ac:'#bfe3ff',ic:'glasses',sh:'OTTICA BLU',sl:'VEDI OGNI TAGLIO'},
  'Pizzeria Vesuvio':{bg:'#1f7a3a',ink:'#ffffff',ac:'#e11d2e',ic:'slice',sh:'VESUVIO',sl:'FORNO A LEGNA'},
  'Palestra Titan':{bg:'#111827',ink:'#ff4b4b',ac:'#f4f4f4',ic:'dumbbell',sh:'TITAN',sl:'ALLENATI CON NOI'},
  'Radio Onda':{bg:'#7c3aed',ink:'#ffffff',ac:'#ffd23f',ic:'radio',sh:'RADIO ONDA',sl:'TUTTO LO SPORT'},
  'Agriturismo Colle':{bg:'#6b8e23',ink:'#fffbea',ac:'#ffd23f',ic:'leaf',sh:'COLLE',sl:'CUCINA DI CAMPAGNA'},
  'Sport Ricci':{bg:'#fbbf24',ink:'#111827',ac:'#ffffff',ic:'disc',sh:'RICCI',sl:'DISCHI E SCARPE'}
};
const SP_LOCAL=['Ferramenta Gallo','Panificio Sole','Ottica Blu','Pizzeria Vesuvio','Palestra Titan','Radio Onda','Agriturismo Colle','Sport Ricci'];
const spBrand=n=>SP_BRAND[n]||{bg:'#f4f4f4',ink:'#1a1c2c',ac:'#ffd23f',ic:'disc',sh:'',sl:''};
// maiuscole per i caratteri a pixel, che non hanno le lettere accentate: «CAFFE' AURORA», come sulle insegne
const UPC=s=>String(s||'').toUpperCase().replace(/[’`]/g,"'").replace(/[ÀÁ]/g,"A'").replace(/[ÈÉ]/g,"E'").replace(/[ÌÍ]/g,"I'").replace(/[ÒÓ]/g,"O'").replace(/[ÙÚ]/g,"U'");
function spIconPx(x,y,ic,c,ac,sc){
  const rows=SP_ICON[ic]||SP_ICON.disc;sc=sc||1;
  for(let r=0;r<5;r++)for(let k=0;k<5;k++){const ch=rows[r][k];if(ch!=='.')px(x+k*sc,y+r*sc,sc,sc,ch==='a'?c:ac);}
}
// lo stesso marchio per le schermate: un quadratino 7x7 a pixel (fondo del marchio e icona), ingrandito senza sfumature
function spLogoSVG(n,sz){
  const b=spBrand(n),rows=SP_ICON[b.ic]||SP_ICON.disc;let r='';
  for(let y=0;y<5;y++)for(let x=0;x<5;x++){const ch=rows[y][x];if(ch!=='.')r+=`<rect x="${x+1}" y="${y+1}" width="1" height="1" fill="${ch==='a'?b.ink:b.ac}"/>`;}
  return `<svg class="splg" width="${sz||21}" height="${sz||21}" viewBox="0 0 7 7" shape-rendering="crispEdges" aria-hidden="true"><rect width="7" height="7" fill="${b.bg}"/>${r}</svg>`;
}
// il cartellone in piccolo, per le schermate: marchio, nome e slogan nei colori dello sponsor
function spStripHTML(n){
  const b=spBrand(n);
  return `<span class="spb" style="--sb:${b.bg};--si:${b.ink};--sa:${b.ac}">${spLogoSVG(n,24)}<span class="spt"><b>${esc(UPC(n))}</b>${b.sl?`<i>${esc(b.sl)}</i>`:''}</span></span>`;
}
// ---------- contenuti dei cartelloni ----------
const B_UF={bg:'#1d2b53',ink:'#ffd23f',ac:'#f4f4f4',ic:'disc',t:['ULTIMATE FRISBEE','ULTIMATE','UF'],nm:['ULTIMATE','UF'],s:'FRISBEE'};
const B_SPIRIT={bg:'#f4f4f4',ink:'#1d2b53',ac:'#ff6b70',ic:'heart',t:['SPIRITO DEL GIOCO','SPIRITO']};   // lo spirito del gioco: niente arbitri, il fair play e' una regola
function bSp(n,sl){   // sl: lo slogan al posto del nome (sui LED si alternano)
  const b=spBrand(n),N=UPC(n);
  return {bg:b.bg,ink:b.ink,ac:b.ac,ic:b.ic,t:sl&&b.sl?[UPC(b.sl),N,b.sh]:[N,b.sh],nm:[N,b.sh],s:UPC(b.sl)};   // nm e s: nome e slogan per i primi piani
}
function bClub(n,side){   // il nome intero, poi senza la sigla davanti («BFD La Fotta Defense»), poi le ultime due parole, poi la sigla
  const raw=String(n).replace(/ \([ABC]\)$/,''),w=raw.split(' ').filter(Boolean),c=[raw];
  if(w.length>2&&/^[A-Z0-9]{2,4}$/.test(w[0]))c.push(w.slice(1).join(' '));
  if(w.length>2)c.push(w.slice(-2).join(' '));
  c.push(teamAbbr(n));
  return {bg:UNI[side].shirt,ink:'#ffffff',crest:n,t:[...new Set(c.map(UPC))]};
}
const bComp=c=>({bg:'#1d2b53',ink:'#ffffff',ac:'#ffd23f',ic:'trophy',t:[UPC(c)]});
// gli sponsor del club di casa quando giochi fuori: due dal suo nome, mai il tuo
function homeSponsors(home){
  const mine=SV&&SV.sp&&SV.sp.name,pool=SP_LOCAL.concat(typeof SP_NAMES!=='undefined'?SP_NAMES:[]).filter(n=>n!==mine);
  const h=hashStr('spl|'+(home||'')),a=pool[h%pool.length],b=pool.filter(n=>n!==a)[(h>>6)%(pool.length-1)];
  return [a,b];
}
let bsKey='',bsSeq=null;
function boardSeq(){   // la sequenza dei cartelloni del campo di oggi: si ripete lungo il bordo
  const V=venueNow(),hs=vnSide(V),key=[V.v,V.home,V.ev,V.spon,V.comp,hs,G.myName,G.oppName,UNI[0].shirt,UNI[1].shirt].join('|');
  if(key===bsKey&&bsSeq)return bsSeq;
  const comp=V.comp?bComp(V.comp):B_UF;let s;
  if(V.ev){   // campo neutro: la manifestazione e i suoi sponsor; tra questi c'e' anche il tuo (un cartellone su otto)
    const [a,b]=homeSponsors(V.ev),ev={bg:'#1d2b53',ink:'#ffd23f',ac:'#f4f4f4',ic:'trophy',t:[V.ev]};
    s=[ev,bSp(a),B_UF,V.spon?bSp(V.spon):bSp(b),ev,bSp(b,1),B_SPIRIT,bSp(a,1)];
  }else if(V.spon){   // in casa con il tuo sponsor: un cartellone su due e' suo, con il nome e lo slogan
    const cl=bClub(V.home,hs);
    s=[bSp(V.spon),cl,bSp(V.spon,1),comp,bSp(V.spon),B_UF,bSp(V.spon,1),B_SPIRIT];
  }else{   // trasferta o partite fuori dalla carriera: il club di casa e i suoi sponsor
    const [a,b]=homeSponsors(V.home||'ultimate'),cl=V.home?bClub(V.home,hs):B_UF;
    s=[bSp(a),cl,bSp(b),comp,bSp(a,1),B_UF,bSp(b,1),B_SPIRIT];
  }
  bsKey=key;bsSeq=s;return s;
}
// ---------- disegno ----------
const twCache=new Map();
const tw=t=>{let w=twCache.get(t);if(w===undefined){w=ptw(t,'t');twCache.set(t,w);}return w;};
function miniCrest(x,y,name){   // stessa griglia del campo, adattata allo spazio del cartellone
  crestPx(x+2.5,y+3,5,name,1);
}
// il contenuto di un cartellone: icona (o stemma) e il testo piu' lungo che ci sta; se non ci sta niente, solo l'icona
function boardFace(it,a,w,y){
  const room=w-4,iw=it.ic||it.crest?7:0;
  let t=it.t.find(s=>tw(s)+iw<=room);
  if(!t&&iw)t=it.t.find(s=>tw(s)<=room),t&&(it={...it,ic:null,crest:null});
  const tot=(t?tw(t):0)+(it.ic||it.crest?(t?7:5):0),x=ri(a+(w-tot)/2);
  if(it.crest)miniCrest(x,y+1,it.crest);else if(it.ic)spIconPx(x,y+1,it.ic,it.ink,it.ac||it.ink);
  if(t)ptext(t,x+(it.ic||it.crest?7:0),y,{f:'t',c:it.ink,a:'l',o:false});
}
// un cartellone: st 2 LED, 1 pannello, 0 striscione di stoffa. k = posto nella fila (per l'onda dei LED e la sequenza)
const BOARD_H=7,LED_T=6,LED_ROLL=0.35;
function drawBoard(a,b,y,k,st,seq,off){
  const w=b-a;if(w<6)return;
  px(a-1,y-1,w+2,BOARD_H+2,PAL.out);
  const n=seq.length,i0=(((k+off)%n)+n)%n;
  if(st<2){   // pannello o stoffa: sempre lo stesso
    const it=seq[i0];px(a,y,w,BOARD_H,it.bg);px(a,y,w,1,st?'rgba(255,255,255,.22)':'rgba(255,255,255,.12)');
    boardFace(it,a,w,y);
    if(!st){px(a,y+3,w,1,'rgba(0,0,0,.08)');px(a-1,y-2,1,2,PAL.out);px(b,y-2,1,2,PAL.out);}   // la piega e i lacci alla rete
    return;
  }
  // LED: ogni LED_T secondi cambia scritta; il cambio scorre dal basso e parte un po' dopo per ogni cartellone (un'onda lungo il campo)
  const goal=G.mode==='banner'&&G.banner&&G.banner.team!==undefined;
  if(goal){
    const tm=G.banner.team,on=Math.floor(G.tick*4+k)%2===0,c=UNI[tm]?UNI[tm].shirt:PAL.gold;
    px(a,y,w,BOARD_H,on?c:'#101422');
    const ab=G.inMatch?UPC(teamAbbr(tm===0?G.myName:G.oppName)||''):'';
    boardFace({bg:c,ink:on?'#ffffff':c,t:ab?['META '+ab+'!','META!']:['META!']},a,w,y);
  }else{
    const tt=G.tick-k*0.12,ph=Math.floor(tt/LED_T),p=(tt-ph*LED_T)/LED_ROLL,cur=seq[(((i0+ph)%n)+n)%n];
    if(p<1){   // cambio: la scritta vecchia esce in alto, la nuova entra dal basso
      const prev=seq[(((i0+ph-1)%n)+n)%n],dy=ri(p*BOARD_H);
      ctx.save();ctx.beginPath();ctx.rect(a,y,w,BOARD_H);ctx.clip();
      px(a,y-dy,w,BOARD_H,prev.bg);boardFace(prev,a,w,y-dy);px(a,y+BOARD_H-dy,w,BOARD_H,cur.bg);boardFace(cur,a,w,y+BOARD_H-dy);
      ctx.restore();
    }else{px(a,y,w,BOARD_H,cur.bg);boardFace(cur,a,w,y);}
  }
  for(let r=1;r<BOARD_H;r+=2)px(a,y+r,w,1,'rgba(0,0,0,.10)');   // righe dei LED
  px(a,y,w,1,'rgba(255,255,255,.28)');
}
// fila in alto, davanti alla tribuna: lunghezza dei cartelloni e varchi secondo l'impianto (lo stadio quasi pieno di LED, il comunale pochi striscioni)
const TOP_ROW=[[16,16],[22,8],[24,4]];   // [cartellone, varco] in metri per tier 0, 1, 2: a campo intero (4 px al metro) 24 m bastano per il nome piu' lungo con l'icona
function drawTopBoards(y0){
  const V=venueNow(),st=clamp(V.tier|0,0,2),[bw,gap]=TOP_ROW[st],step=bw+gap,seq=boardSeq(),y=y0-9;
  const k0=Math.floor(toWorld(0,0).x/step)-1,k1=Math.ceil(toWorld(VW,0).x/step)+1;
  for(let k=k0;k<=k1;k++){
    const wx=k*step+gap/2-4,a=sxw(wx),b=sxw(wx+bw);if(b<0||a>VW)continue;
    drawBoard(a,b,y,k,st,seq,0);
  }
}
// fila in basso (davanti alle panchine niente cartelloni): gli stessi contenuti, sfasati rispetto a quella in alto
const BOT_ROW=[[16,10],[22,2],[24,2]];
function drawBottomBoards(y,skip){
  const V=venueNow(),st=clamp(V.tier|0,0,2),[bw,gap]=BOT_ROW[st],step=bw+gap,seq=boardSeq();
  const k0=Math.floor(toWorld(0,0).x/step)-1,k1=Math.ceil(toWorld(VW,0).x/step)+1;
  for(let k=k0;k<=k1;k++){
    const wx=k*step-4;if(skip&&wx+bw>skip[0]&&wx<skip[1])continue;
    const a=sxw(wx),b=sxw(wx+bw);if(b<0||a>VW)continue;
    drawBoard(a,b,y,k,st,seq,3);
  }
}
// i cartelloni dei primi piani di salti e tuffi (03-stacchi.js): grandi, quindi l'icona ingrandita, il nome con il carattere grande e sotto lo slogan
function cineBoard(x,y,w,h,it){
  px(x,y,w,h,PAL.out);px(x+1,y+1,w-2,h-2,it.bg);px(x+1,y+1,w-2,1,'rgba(255,255,255,.35)');
  const sc=clamp(Math.floor((h-8)/5),1,3),isz=5*sc,hasI=!!(it.ic||it.crest),room=w-8-(hasI?isz+4:0),nm=it.nm||it.t;
  let big=nm.find(t=>ptw(t,'p')<=room),f='p';
  if(!big){big=it.t.find(t=>tw(t)<=room);f='t';}
  const sub=big&&it.s&&tw(it.s)<=room&&h>=20?it.s:'';
  const tW=Math.max(big?ptw(big,f):0,sub?tw(sub):0),tot=(hasI?isz+(big?4:0):0)+tW,x0=ri(x+(w-tot)/2),cy=y+ri(h/2);
  if(it.crest)crestPx(x0+ri(isz/2),cy,isz,it.crest,1);else if(it.ic)spIconPx(x0,cy-ri(isz/2),it.ic,it.ink,it.ac||it.ink,sc);
  const tx=x0+(hasI?isz+4:0);
  if(big)ptext(big,tx,sub?cy-(f==='p'?8:7):cy-(f==='p'?4:3),{f,c:it.ink,a:'l',o:false});
  if(sub)ptext(sub,tx,cy+1,{f:'t',c:it.ac||it.ink,a:'l',o:false});
}

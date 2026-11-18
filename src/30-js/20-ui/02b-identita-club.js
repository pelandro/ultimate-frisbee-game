/* Identita' comune a HTML e canvas. Le griglie sono dati, non immagini da aspettare:
   stemmi e sigle funzionano al primo fotogramma, offline e con i vecchi salvataggi. */
const clubKey=n=>String(n||'').normalize('NFKD').replace(/ß/g,'ss').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const CLUB_ICON_CACHE=new Map(),CLUB_SVG_CACHE=new Map();
function clubAbbr(n){
  const k=clubKey(n);if(Object.prototype.hasOwnProperty.call(CLUB_ABBR,k))return CLUB_ABBR[k];
  const w=k.replace(/\b(ultimate|frisbee|flying disc|open|the|of|and|di|de|del|della|la|il|le|les|cus|asul|bfd|aut)\b/g,' ').trim().split(/\s+/).filter(Boolean);
  return (w.length>1?w.slice(0,4).map(x=>/^\d+$/.test(x)?x:x[0]).join(''):(w[0]||k||'UF').slice(0,3)).slice(0,4).toUpperCase();
}
function clubIcon(n){
  const k=clubKey(n);if(CLUB_ICON_CACHE.has(k))return CLUB_ICON_CACHE.get(k);
  const id=Object.prototype.hasOwnProperty.call(CLUB_MARK,k)?CLUB_MARK[k]:null;let art=CLUB_ART[id];
  if(!art){
    // Dove manca un simbolo, la sigla resta leggibile e usa solo i colori documentati disponibili.
    const ab=clubAbbr(n),col=CLUB_MONO[id]||'#dce5ec',run=[],u=ab.length*6-1,x0=Math.floor((32-u)/2);
    for(let i=0;i<ab.length;i++){
      const glyph=CLUB_FONT[ab[i]]||CLUB_FONT.X;
      for(let y=0;y<7;y++)for(let x=0;x<5;x++)if(glyph[y][x]==='1')run.push(x0+i*6+x,9+y*2,1,x0+i*6+x,10+y*2,1);
    }
    art={n:32,p:[col],r:[run]};
  }
  CLUB_ICON_CACHE.set(k,art);return art;
}
function clubSVG(n){
  const k=clubKey(n);if(CLUB_SVG_CACHE.has(k))return CLUB_SVG_CACHE.get(k);
  const a=clubIcon(n),s=a.r.map((r,i)=>{
    let d='';for(let j=0;j<r.length;j+=3)d+=`M${r[j]} ${r[j+1]}h${r[j+2]}v1h-${r[j+2]}Z`;
    return `<path fill="${a.p[i]}" d="${d}"/>`;
  }).join('');
  const html=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${a.n} ${a.n}" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${s}</svg>`;
  CLUB_SVG_CACHE.set(k,html);return html;
}
function clubCrest(n,w){
  const label=String(n||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  w=Math.max(1,Math.round(Number(w)||22));
  return `<span class="crest crest-art" role="img" aria-label="${label}" style="width:${w}px;height:${w}px">${clubSVG(n)}</span>`;
}
function clubDraw(cx,cy,w,n,alpha){
  const a=clubIcon(n),size=Math.max(1,Math.round(w)),x0=Math.round(cx-size/2),y0=Math.round(cy-size/2),k=size/a.n;
  ctx.save();ctx.globalAlpha*=alpha===undefined?1:Math.max(0,Math.min(1,alpha));
  for(let c=0;c<a.r.length;c++){
    ctx.fillStyle=a.p[c];const r=a.r[c];
    for(let j=0;j<r.length;j+=3){
      const x=Math.round(r[j]*k),y=Math.round(r[j+1]*k),rw=Math.round((r[j]+r[j+2])*k)-x,rh=Math.round((r[j+1]+1)*k)-y;
      if(rw&&rh)ctx.fillRect(x0+x,y0+y,rw,rh);
    }
  }
  ctx.restore();
}

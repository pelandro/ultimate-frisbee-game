/* ---- LINGUA: il gioco e' scritto in italiano; le altre lingue sostituiscono i testi gia' disegnati nella pagina ----
   Il traduttore guarda i nodi di testo (e title, aria-label, placeholder, alt) e li cerca per intero nel dizionario della lingua (LANG_TXT[lingua], 31-lingua-en.js):
   se non c'e', resta l'italiano. Le frasi con numeri o nomi sono modelli con {0}, {1}… (LANG_PAT). Il testo originale resta in una WeakMap, cosi' si torna all'italiano
   senza ricaricare. Un osservatore traduce anche cio' che il gioco disegna dopo (innerHTML, textContent): per aggiungere una frase basta aggiungerla al dizionario,
   senza toccare il codice che la scrive. I testi dipinti nel campo passano da lgC() (chiamata da ptext e ptw). */
const LANG_KEY='ultimate-lingua',LANGS=[['it','Italiano'],['en','English'],['fr','Français'],['de','Deutsch']];
const LANG_TXT={},LANG_PAT={};   // lingua -> {italiano: traduzione}, lingua -> [[modello italiano con {0}, modello tradotto]]
let LANG='it';
// letto subito al caricamento, prima che qualcosa scriva nel browser: serve a chiedere la lingua solo a chi apre il gioco per la prima volta
const LANG_NUOVO=(()=>{try{return !Object.keys(localStorage).some(k=>k.startsWith('ultimate'));}catch(e){return false;}})();
try{const s=localStorage.getItem(LANG_KEY);LANG=LANGS.some(l=>l[0]===s)?s:'it';}catch(e){}   // sempre italiano finche' la persona non sceglie (al primo avvio: 36-lingua-avvio.js): niente scelta automatica dalla lingua del browser
const LANG_ATTR=['title','aria-label','placeholder','alt'];
const lgOrig=new WeakMap(),lgOut=new WeakMap(),lgRx=new Map();
function lgPats(l){   // i modelli diventano espressioni regolari una volta sola
  if(lgRx.has(l))return lgRx.get(l);
  // {0} testo qualsiasi · {#0} solo un numero (così «{#0} mete» non cattura le frasi) · {^0} pezzo scritto in minuscolo nella frase ma con la maiuscola nel dizionario
  const r=(LANG_PAT[l]||[]).map(([a,b])=>{const n=[],up=[];const src=a.split(/(\{[#^]?\d+\})/).map(p=>{const m=/^\{([#^]?)(\d+)\}$/.exec(p);if(m){n.push(+m[2]);up.push(m[1]==='^');return m[1]==='#'?'(\\d+)':'(.+?)';}return p.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}).join('');return {rx:new RegExp('^'+src+'$'),n,up,to:b};});
  lgRx.set(l,r);return r;
}
function lgTr(s){   // un testo italiano -> la lingua scelta (invariato se non c'e')
  if(LANG==='it'||!s)return s;
  const t=s.replace(/\s+/g,' ').trim();if(!t||!/[A-Za-zÀ-ÿ]{2,}/.test(t))return s;   // a capo e rientri dell'HTML non contano: la chiave ha gli spazi compattati
  const d=LANG_TXT[LANG],lead=/^\s*/.exec(s)[0],tail=/\s*$/.exec(s)[0];
  if(d&&Object.prototype.hasOwnProperty.call(d,t))return lead+d[t]+tail;
  for(const p of lgPats(LANG)){const m=p.rx.exec(t);if(m){const v=[];p.n.forEach((k,i)=>{v[k]=lgTr(p.up[i]?m[i+1].charAt(0).toUpperCase()+m[i+1].slice(1):m[i+1]);});return lead+p.to.replace(/\{(\d+)\}/g,(x,k)=>v[+k]===undefined?x:v[+k])+tail;}}
  return s;
}
// date scritte nella lingua scelta (nomi dei mesi compresi)
const lgLoc=()=>({en:'en-GB',fr:'fr-FR',de:'de-DE'})[LANG]||'it-IT';
// sigle di una lettera scritte da sole (G = giornata, V = vinta, S = sconfitta): lgTr lascia stare le scritte di una lettera, quindi le chiede chi le scrive
const lgSigla=k=>({en:{G:'MD',V:'W',S:'L'},fr:{G:'J',V:'V',S:'D'},de:{G:'ST',V:'S',S:'N'}}[LANG]||{})[k]||k;
// testi dipinti nel campo (ptext/ptw in 02-pixel-art.js): non sono nella pagina, quindi passano di qui; la risposta si ricorda perche' si ridisegna a ogni fotogramma
const lgCache=new Map();
function lgC(s){
  if(LANG==='it'||typeof s!=='string')return s;
  const k=LANG+'|'+s;let v=lgCache.get(k);
  if(v===undefined){
    v=lgTr(s);
    if(v===s&&s===s.toUpperCase()&&/[A-Z]{2,}/.test(s)){const c=s.charAt(0)+s.slice(1).toLowerCase(),t=lgTr(c);if(t!==c)v=t.toUpperCase();}   // il campo scrive spesso in maiuscolo: si cerca la forma normale e si rimette in maiuscolo
    if(lgCache.size>4000)lgCache.clear();lgCache.set(k,v);
  }
  return v;
}
const lgSkip=n=>{const p=n.parentNode;return !p||/^(SCRIPT|STYLE|TEXTAREA|NOSCRIPT)$/.test(p.nodeName);};
// sigle di una lettera (G, V, S nelle classifiche): lgTr le lascia stare, quindi chi le scrive mette data-lgk e il dizionario ha la voce '@chiave'
const lgNode=(n,o)=>{const p=n.parentNode,k=p&&p.getAttribute&&p.getAttribute('data-lgk');return (k&&LANG_TXT[LANG]&&LANG_TXT[LANG]['@'+k])||lgTr(o);};
function lgText(n){   // n: nodo di testo
  if(lgSkip(n)||lgNew.has(n))return;
  const cur=n.nodeValue,had=lgOrig.has(n);
  if(had&&lgOut.get(n)===cur){const o=lgOrig.get(n),v=LANG==='it'?o:lgNode(n,o);if(v!==cur){n.nodeValue=v;lgOut.set(n,v);}return;}   // lo abbiamo scritto noi: solo cambio di lingua
  const v=LANG==='it'?cur:lgNode(n,cur);lgOrig.set(n,cur);lgOut.set(n,v);if(v!==cur)n.nodeValue=v;   // testo nuovo del gioco: e' l'originale
}
/* ---- Blocchi: paragrafi con grassetti e corsivi dentro (guida, tutorial, fumetti). Una frase con <b> sta in piu' nodi di testo e tradotta a pezzi suonerebbe male:
   una «fila» e' la sequenza di nodi di testo ed elementi in linea tra due elementi di blocco; la sua chiave e' l'HTML italiano con gli spazi compattati e
   LANG_BLK[lingua][chiave] e' l'HTML tradotto (stessi tag, nello stesso ordine: lo controlla il generatore). Se la chiave non c'e' si traduce a pezzi, come prima. */
const LANG_BLK={};
const lgInl=/^(B|I|STRONG|EM|CODE|SMALL|KBD|U|SUB|SUP|MARK|SPAN|BR)$/;
const lgNew=new WeakSet(),lgRepl=new WeakMap();let lgAnyRepl=false;
const lgEsc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function lgSer(n){   // HTML di un nodo come lo ha scritto il gioco (testi e attributi gia' tradotti da noi tornano all'originale)
  if(n.nodeType===3)return lgEsc(lgOut.get(n)===n.nodeValue&&lgOrig.has(n)?lgOrig.get(n):n.nodeValue);
  if(n.nodeType!==1)return '';
  if(n.nodeName==='BR')return '<br>';
  const t=n.nodeName.toLowerCase(),m=lgOrig.get(n),o=lgOut.get(n);let a='';
  for(const x of n.attributes){const v=m&&o&&x.name in m&&o[x.name]===x.value?m[x.name]:x.value;a+=' '+x.name+'="'+v.replace(/"/g,'&quot;')+'"';}
  return '<'+t+a+'>'+[...n.childNodes].map(lgSer).join('')+'</'+t+'>';
}
const lgHasId=n=>n.nodeType===1&&(!!n.id||[...n.children].some(lgHasId));
function lgFindRuns(el){   // le file di el con almeno un elemento in linea e abbastanza testo da meritare una traduzione intera
  const out=[];let cur=[];
  const flush=()=>{
    if(cur.some(n=>n.nodeType===1)&&cur.some(n=>n.nodeType===3&&/[A-Za-zÀ-ÿ]{3,}/.test(n.nodeValue))){   // prosa: almeno un pezzo di testo suo; le righe fatte solo di elementi (pulsanti, sigle, stemmi) si traducono a pezzi
      const tx=cur.map(n=>n.textContent||'').join('').replace(/\s+/g,' ').trim(),key=cur.map(lgSer).join('').replace(/\s+/g,' ').trim();
      if(tx.length>=12&&!cur.some(lgHasId)&&!key.includes('<svg'))out.push({nodes:cur,key});
    }
    cur=[];
  };
  for(const n of el.childNodes){
    if(lgNew.has(n))flush();
    else if(n.nodeType===3||n.nodeType===8||(n.nodeType===1&&lgInl.test(n.nodeName)))cur.push(n);
    else flush();
  }
  flush();return out;
}
function lgRuns(el){
  if(lgAnyRepl){   // blocchi gia' tradotti da noi: se la lingua e' cambiata tornano gli originali
    for(const n of [...el.childNodes]){const r=lgRepl.get(n);if(r&&n===r.fresh[0]&&r.lang!==LANG&&n.parentNode===el){r.fresh.slice(1).forEach(x=>x.remove());n.replaceWith(...r.orig);r.fresh.forEach(x=>lgRepl.delete(x));}}
  }
  if(LANG==='it'||!el.firstElementChild)return;
  const d=LANG_BLK[LANG];if(!d)return;
  for(const r of lgFindRuns(el)){
    const en=Object.prototype.hasOwnProperty.call(d,r.key)?d[r.key]:undefined;if(en===undefined)continue;
    const t=document.createElement('template');t.innerHTML=en;
    const fresh=[...t.content.childNodes];if(!fresh.length)continue;
    const rec={lang:LANG,orig:r.nodes,fresh};
    for(const f of fresh){lgRepl.set(f,rec);lgNew.add(f);const w=document.createTreeWalker(f,NodeFilter.SHOW_ALL);for(let x=w.nextNode();x;x=w.nextNode())lgNew.add(x);}
    r.nodes[0].replaceWith(...fresh);r.nodes.slice(1).forEach(x=>x.remove());lgAnyRepl=true;
  }
}
// per chi scrive i dizionari (tools/lingua-raccogli.js): che cosa manca nella pagina di adesso, per la lingua indicata
const lgIt=/\b(di|che|il|lo|gli|con|non|più|del|della|dei|nel|nella|sono|ogni|dopo|prima|chi|quando|anche|alla|prese|partita|partite|casa|tua|tuo|campo|squadra|giocatori|giocatore)\b/i;
function lgMissing(root,lang){
  const old=LANG;LANG=lang;const d=LANG_BLK[lang]||{},blk=new Set(),txt=new Set(),inBlk=new Set();
  const letters=s=>/[A-Za-zÀ-ÿ]{2,}/.test(s),norm=s=>s.replace(/\s+/g,' ').trim();
  const texts=n=>{const o=[];if(n.nodeType===3)o.push(n);else if(n.nodeType===1){const w=document.createTreeWalker(n,NodeFilter.SHOW_TEXT);for(let x=w.nextNode();x;x=w.nextNode())o.push(x);}return o;};
  const nome=t=>t.length<44&&t.split(' ').every(w=>/^[A-ZÀ-Þ0-9(][^a-z]*|^[A-ZÀ-Þ][\wÀ-ÿ’'.\-]*$/.test(w)||/^(del|di|de|da|van|von|dei|della|le|la|e|&|·|-)$/.test(w));   // nomi di persone e squadre: non si traducono
  const ok=n=>{const t=norm(lgOut.get(n)===n.nodeValue&&lgOrig.has(n)?lgOrig.get(n):n.nodeValue);if(!t||!letters(t)||nome(t))return true;const v=lgTr(t);return v!==t&&!lgIt.test(v);};   // tradotta a meta' (restano parole italiane) conta come mancante
  try{
    for(const el of [root,...root.querySelectorAll('*')]){
      if(lgNew.has(el))continue;
      for(const r of lgFindRuns(el)){
        const tn=r.nodes.flatMap(texts);
        if(Object.prototype.hasOwnProperty.call(d,r.key)){tn.forEach(x=>inBlk.add(x));continue;}   // il blocco ha la sua traduzione: i pezzi non vanno segnalati
        if(tn.every(ok))continue;   // ogni pezzo ha gia' la sua traduzione: va bene cosi'
        blk.add(r.key);tn.forEach(x=>inBlk.add(x));
      }
      for(const a of LANG_ATTR)if(el.getAttribute&&el.hasAttribute(a)){const m=lgOrig.get(el),o=lgOut.get(el),cur=el.getAttribute(a),t=norm(m&&o&&a in m&&o[a]===cur?m[a]:cur);if(t&&letters(t)&&lgTr(t)===t)txt.add(t);}
    }
    const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    for(let n=w.nextNode();n;n=w.nextNode()){if(lgSkip(n)||lgNew.has(n)||inBlk.has(n)||ok(n))continue;txt.add(norm(lgOut.get(n)===n.nodeValue&&lgOrig.has(n)?lgOrig.get(n):n.nodeValue));}
  }finally{LANG=old;}
  return {blk:[...blk],txt:[...txt]};
}
function lgAttrs(el){
  for(const a of LANG_ATTR){
    if(!el.hasAttribute||!el.hasAttribute(a))continue;
    let m=lgOrig.get(el);if(!m){m={};lgOrig.set(el,m);}let o=lgOut.get(el);if(!o){o={};lgOut.set(el,o);}
    const cur=el.getAttribute(a);
    if(a in m&&o[a]===cur){const v=LANG==='it'?m[a]:lgTr(m[a]);if(v!==cur){el.setAttribute(a,v);o[a]=v;}continue;}
    const v=LANG==='it'?cur:lgTr(cur);m[a]=cur;o[a]=v;if(v!==cur)el.setAttribute(a,v);
  }
}
function lgWalk(root){
  if(!root)return;
  if(root.nodeType===3){lgText(root);return;}
  if(root.nodeType!==1)return;
  lgAttrs(root);lgRuns(root);
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);
  for(let n=w.nextNode();n;n=w.nextNode()){if(n.nodeType===3)lgText(n);else if(!lgNew.has(n)){lgAttrs(n);lgRuns(n);}}
}
let lgObs=null;
function lgRun(fn){if(lgObs)lgObs.disconnect();try{fn();}finally{if(lgObs)lgObs.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:LANG_ATTR});}}
function lgStart(){
  document.documentElement.lang=LANG;
  if(typeof MutationObserver==='undefined')return;
  lgObs=new MutationObserver(ms=>lgRun(()=>{
    for(const m of ms){
      if(m.type==='childList'){m.addedNodes.forEach(lgWalk);if(m.target.nodeType===1)lgRuns(m.target);}
      else if(m.type==='characterData')lgText(m.target);
      else if(m.type==='attributes')lgAttrs(m.target);
    }
  }));
  lgRun(()=>{lgWalk(document.body);document.title=lgTitle();});
}
const lgTitle=()=>LANG==='it'?'Pixel Ultimate':(LANG_TXT[LANG]&&LANG_TXT[LANG]['@titolo'])||document.title;
function setLang(l){
  if(!LANGS.some(x=>x[0]===l))return;
  LANG=l;try{localStorage.setItem(LANG_KEY,l);}catch(e){}
  document.documentElement.lang=l;
  lgRun(()=>{lgWalk(document.body);document.title=lgTitle();});
  if(typeof syncToggles==='function')syncToggles();
}
// il selettore in Impostazioni › Gioco (i pulsanti si disegnano qui: nomi delle lingue sempre nella loro lingua, mai tradotti)
function lgSeg(){const b=document.getElementById('sLangSeg');if(!b)return;b.innerHTML=LANGS.map(([k,t])=>`<button type="button" class="sg${LANG===k?' on':''}" data-lang="${k}" lang="${k}" translate="no"><span>${t}</span></button>`).join('');}

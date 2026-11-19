/* Moneta pixelata al posto di «crediti» che compare nella pagina (cruscotto, mercato, avvisi, guida, tutorial...).
   Lo fa un osservatore sul testo, e non ogni schermata per conto suo, così anche le frasi scritte in futuro la ricevono da sole. */
const CR_RE=/\bcrediti insufficienti\b|\b(crediti|credito)\b/i,CR_SKIP=/^(SCRIPT|STYLE|TEXTAREA|OPTION|TITLE|INPUT)$/;
function coinWalk(root){
  if(!root||!(root.nodeType===3||root.nodeType===1))return;
  if(root.nodeType===1&&!/credit/i.test(root.textContent))return;   // controllo rapido (senza \b: textContent attacca i testi, «Crediti70»)
  const L=[];
  if(root.nodeType===3)L.push(root);
  else{const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);for(let n=w.nextNode();n;n=w.nextNode())L.push(n);}
  for(const t of L){
    const p=t.parentNode;
    if(!p||!CR_RE.test(t.nodeValue)||CR_SKIP.test(p.nodeName)||(p.closest&&p.closest('.cr,[contenteditable]')))continue;
    const f=document.createDocumentFragment();let s=t.nodeValue,m;
    while((m=CR_RE.exec(s))){
      if(m.index)f.appendChild(document.createTextNode(s.slice(0,m.index)));
      if(/insufficienti/i.test(m[0])){f.appendChild(document.createTextNode('Fondi insufficienti'));s=s.slice(m.index+m[0].length);continue;}
      const sp=document.createElement('span');sp.className='cr';
      const c=document.createElement('i');c.className='coin';c.setAttribute('role','img');c.setAttribute('aria-label','Moneta');sp.appendChild(c);f.appendChild(sp);
      s=s.slice(m.index+m[0].length);
    }
    if(s)f.appendChild(document.createTextNode(s));
    p.replaceChild(f,t);
  }
}
coinWalk(document.body);
new MutationObserver(ms=>{for(const m of ms){if(m.type==='characterData')coinWalk(m.target);else m.addedNodes.forEach(coinWalk);}})
  .observe(document.body,{childList:true,characterData:true,subtree:true});

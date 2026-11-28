/* ---- PREMI assegnati dall'amministratore a un profilo online: Sostenitore (badge, divisa Oro Nero e Stadio d'Oro) e badge Prima settimana ----
   Sul database stanno in ut/gifts/<id del profilo> = {k: divisa (uguale a d), d: sostenitore, w: prima settimana, at}: li scrive solo chi ha il codice amministratore
   (regole in docs/firebase-rules.json), li legge il giocatore a cui sono dati. Ogni dispositivo ne tiene una copia (PREMI_KEY), cosi' la divisa resta
   anche senza rete; off = chi ce l'ha ha scelto di non indossarla, knw = divisa appena arrivata e non ancora vista. I badge entrano nel registro dei
   Riconoscimenti (34-riconoscimenti.js). Se il database non ha ancora le regole (401/403) o non c'e' rete, tutto resta com'e'. */
const PREMI_KEY='ultimate-premi';
function premiLoad(){try{const o=JSON.parse(localStorage.getItem(PREMI_KEY)||'{}');return o&&typeof o==='object'?{k:!!o.k,d:!!o.d,w:!!o.w,off:!!o.off,knw:!!o.knw,so:!!o.so}:{};}catch(e){return {};}}
function premiSave(o){try{localStorage.setItem(PREMI_KEY,JSON.stringify(o));}catch(e){}}
let premiNow=null;const premiGet=()=>premiNow||(premiNow=premiLoad());
// la divisa da usare in campo (in tutte le modalita'), o null
const premiKit=()=>{const o=premiGet();return o.k&&!o.off?KIT_ORO:null;};
function premiWear(on){const o=premiGet();if(!o.k)return;o.off=!on;premiSave(o);lookKey='';}
// lo Stadio d'Oro (20-ui/33-stadio-oro.js) è di chi ha il premio Sostenitore; so = lo ha spento
function premiStadio(){const o=premiGet();return !!o.d&&!o.so;}
function premiStadioWear(on){const o=premiGet();if(!o.d)return;o.so=!on;premiSave(o);}
const premiCount=()=>{const o=premiGet();return (o.d?1:0)+(o.w?1:0);};
const premiNew=()=>{const r=ricLoad();return !!premiGet().knw||RIC_AL.comps.some(c=>r[c.k]&&r[c.k].nw);};
function premiSeen(){const o=premiGet();if(o.knw){o.knw=false;premiSave(o);}}
// applica quello che dice il database (g = null: nessun premio, anche se prima c'era: l'amministratore l'ha tolto). Dice se e' cambiato qualcosa
function premiApply(g){
  const o=premiGet(),n={k:!!(g&&g.d),d:!!(g&&g.d),w:!!(g&&g.w),off:!!o.off,knw:!!o.knw,so:!!o.so};
  const ch=n.k!==!!o.k||n.d!==!!o.d||n.w!==!!o.w;
  if(!ch)return false;
  if(n.k&&!o.k){n.off=false;n.knw=true;}   // appena arrivata: si indossa subito
  if(!n.k)n.knw=false;
  premiNow=n;premiSave(n);lookKey='';
  const r=ricLoad();
  for(const [id,v] of [['SOST',n.d],['PRIMA',n.w]]){if(v&&!r[id])r[id]={n:1,at:Date.now(),nw:1};else if(!v)delete r[id];}
  ricSave(r);ricBtn();
  return true;
}
// il codice che il giocatore comunica (per esempio nel messaggio della donazione): l'inizio dell'identificativo del suo profilo online
const premiCode=id=>String(id||'').slice(0,8);
const premiProfile=()=>uoReadP(UTO_KEY)||uoReadP(UTH_OKEY);
let premiT=0;
// legge i premi del proprio profilo (al massimo ogni 30 secondi). prova = true nei test, che simulano la rete
async function premiSync(prova){
  if(!prova&&(navigator.webdriver||Date.now()-premiT<30000))return false;
  const p=premiProfile();if(!uoOk()||uoOffline()||!p||!p.rt)return false;
  premiT=Date.now();
  try{
    const tok=await uoToken(),g=await uoJson(UTO_CFG.db.replace(/\/+$/,'')+'/ut/gifts/'+encodeURIComponent(p.id)+'.json?auth='+encodeURIComponent(tok));
    return premiApply(g);
  }catch(e){return false;}
}
// ---------- Riconoscimenti › Altro: la divisa e i due badge ----------
function premiRender(r){
  const o=premiGet(),p=premiProfile(),worn=!!premiKit();
  $('ricGrid').innerHTML=`<div class="prm"><div class="prkit${o.k?'':' lock'}"><div class="prfig">${eqDoll({on:{},oro:true})}</div><div><b>Divisa Oro Nero</b>${o.k
      ?`<button type="button" class="sg${worn?' on':''}" id="prWear" aria-pressed="${worn}">${worn?'Indossata':'Indossa'}</button>`:'<small>Per i sostenitori</small>'}<b class="prst">Stadio d'Oro</b>${o.d
      ?`<button type="button" class="sg${premiStadio()?' on':''}" id="prStad" aria-pressed="${premiStadio()}">${premiStadio()?'Acceso':'Spento'}</button>`:'<small>Per i sostenitori</small>'}<small>In carriera, al posto del campo di livello 6</small></div></div>
    <div class="prbadges">${RIC_AL.comps.map(c=>{const w=r[c.k];return `<button type="button" class="ricb${w?' on':''}${w&&w.nw?' nw':''}${ricSel===c.k?' sel':''}" data-ric="${c.k}" aria-label="${c.name}${w?'':' (da ottenere)'}">${badgeSVG(c.k,'',!w,80)}<small>${c.short}</small></button>`;}).join('')}</div></div>`;
  const c=RIC_BY[ricSel],w=c&&r[c.k];
  const come=p?`<span>Il tuo codice <b class="prcode">${esc(premiCode(p.id))}</b></span><span>Comunicalo a chi gestisce il gioco per ricevere i premi.</span>`
    :'<span>Per riceverli scegli il tuo nome in Ultimate Team › Sfide online e completa la squadra: qui comparirà il tuo codice.</span>';
  $('ricInfo').innerHTML=(c?`<b>${c.name}</b><span>${w?'Ottenuto':c.txt+'.'}</span>`:'<span>La divisa vale in tutte le modalità: la indossa la tua squadra.</span>')+come;
}
// in Equipaggiamento (Ultimate Team): chi ha la divisa la toglie o la rimette anche da li'
const premiEqRow=()=>premiGet().k?`<div class="eqkr"><small>Divisa Oro Nero</small><div class="seg"><button type="button" class="sg${premiKit()?' on':''}" id="eqOro" aria-pressed="${!!premiKit()}">${premiKit()?'Indossata':'Indossa'}</button></div></div>`:'';
// ---------- amministratore: l'elenco di chi ha un profilo online, con i premi da accendere e spegnere ----------
const ADM_PR=[['d','Sostenitore'],['w','Prima settimana']];   // la divisa (k) segue Sostenitore
const ADM_PAGE=30;
const ADM={tab:'S',all:null,rows:[],gifts:{},f:'all',max:ADM_PAGE,busy:false};
// l'elenco dei premi gia' dati lo puo' leggere solo l'amministratore: il suo profilo si registra (ut/admins) con il codice
async function admGifts(){
  try{
    await uoWrite(()=>uoDb('PATCH','ut',{['admins/'+UOP.id]:true,ctl:uoaCtl(uoaGet())}));
    const tok=await uoToken();
    return await uoJson(UTO_CFG.db.replace(/\/+$/,'')+'/ut/gifts.json?auth='+encodeURIComponent(tok))||{};
  }catch(e){if(uoDenied(e))throw new Error('Premi non ancora attivi: vanno pubblicate le regole nuove del database.');throw e;}
}
// le parole cercate: piu' nomi o codici separati da virgole; anche da spazi, se sono tutti codici (cosi' si incolla una lista)
function admToks(list,q){
  const code=x=>x.length>=6&&list.some(p=>p.id.toLowerCase().startsWith(x));
  return q.toLowerCase().split(/[,;]+/).map(s=>s.trim()).filter(Boolean).flatMap(part=>{const w=part.split(/\s+/);return w.length>1&&w.every(code)?w:[part];});
}
// nome (anche solo una parte) o codice (l'inizio dell'identificativo): maiuscole e minuscole non contano, il codice si ricopia a mano
function admMatch(list,q){
  const t=admToks(list,q);
  return t.length?list.filter(p=>t.some(s=>p.id.toLowerCase().startsWith(s)||p.n.toLowerCase().includes(s))):list;
}
const admWon=id=>{const g=ADM.gifts[id];return !!(g&&(g.d||g.w));};
const admNote=t=>{$('admRes').innerHTML='<p class="qp">'+esc(t)+'</p>';$('admBulk').classList.add('hidden');};
function admRender(){
  if(!ADM.all)return;
  const q=$('admQ').value.trim(),found=admMatch(ADM.all,q),l=ADM.rows=ADM.f==='won'?found.filter(p=>admWon(p.id)):found;
  $('admFAll').textContent=`Tutti (${found.length})`;$('admFWon').textContent=`Con premi (${found.filter(p=>admWon(p.id)).length})`;
  for(const [id,v] of [['admFAll','all'],['admFWon','won']]){$(id).classList.toggle('on',ADM.f===v);$(id).setAttribute('aria-pressed',ADM.f===v);}
  // dare un premio a tutti quelli mostrati: solo dopo una ricerca, mai a tutto l'elenco
  const bulk=q&&l.length>1;$('admBulk').classList.toggle('hidden',!bulk);
  $('admBulk').innerHTML=bulk?`<small>A tutti i ${l.length} mostrati:</small><span class="seg">${ADM_PR.map(([k,t])=>`<button type="button" class="sg" data-bulk="${k}">+ ${t}</button>`).join('')}</span>`:'';
  $('admRes').innerHTML=l.length?l.slice(0,ADM.max).map((p,i)=>{const g=ADM.gifts[p.id]||{};
      return `<div class="admp"><span class="un">${esc(p.n)}</span><span class="prcode">${esc(premiCode(p.id))}</span><small>${p.p?p.p+' pt':''}</small><span class="seg">${ADM_PR.map(([k,t])=>`<button type="button" class="sg${g[k]?' on':''}" data-p="${i}" data-g="${k}" aria-pressed="${!!g[k]}">${t}</button>`).join('')}</span></div>`;}).join('')
      +(l.length>ADM.max?`<button type="button" class="sec" id="admMore">Mostra altri (${l.length-ADM.max})</button>`:'')
    :'<p class="qp">Nessun giocatore trovato. Compare solo chi ha completato la squadra di Sfide online.</p>';
}
// carica una volta tutti i profili; poi la ricerca e i filtri lavorano qui, senza altre richieste
async function admLoad(){
  if(ADM.busy)return;ADM.busy=true;ADM.all=null;admNote('Carico i giocatori…');
  try{
    const gifts=await admGifts();
    const [a,b]=await Promise.all([uoDb('GET','ut/players'),uoDb('GET','uh/players').catch(()=>null)]);
    const seen=new Map();for(const r of uoRows(b).concat(uoRows(a)))seen.set(r.id,r);
    for(const id in gifts)if(!seen.has(id))seen.set(id,{id,n:'—',p:0});   // un premio dato a un profilo che non c'è più si deve poter togliere
    ADM.gifts=gifts;ADM.all=[...seen.values()].sort((x,y)=>x.n.localeCompare(y.n));ADM.max=ADM_PAGE;admRender();
  }catch(e){admNote(e.status?uoErr(e):e.message);}
  ADM.busy=false;
}
// scrive i premi di uno o piu' giocatori in un colpo solo (null = nessun premio)
async function admSave(list,change){
  const up={},vals={};
  for(const p of list){const g=Object.assign({d:false,w:false},ADM.gifts[p.id]);change(g);
    vals[p.id]=up['gifts/'+p.id]=g.d||g.w?{k:!!g.d,d:!!g.d,w:!!g.w,at:{'.sv':'timestamp'}}:null;}   // l'ora la mette il server
  $('admMsg').textContent='Salvo…';
  try{
    await uoWrite(()=>uoDb('PATCH','ut',Object.assign(up,{ctl:uoaCtl(uoaGet())})));
    for(const id in vals){if(vals[id])ADM.gifts[id]=vals[id];else delete ADM.gifts[id];if(id===UOP.id)premiApply(vals[id]);}
    $('admMsg').textContent=list.length>1?'Salvato: lo riceveranno alla prossima apertura del gioco.':'Salvato: lo riceverà alla prossima apertura del gioco.';
    admRender();
  }catch(e){$('admMsg').textContent=uoDenied(e)?'Non autorizzato: controlla il codice e le regole del database.':uoErr(e);}
}
const admToggle=(i,k)=>{const p=ADM.rows[i];if(p)return admSave([p],g=>g[k]=!g[k]);};
function admBulk(k){
  const l=ADM.rows.filter(p=>!(ADM.gifts[p.id]||{})[k]),t=ADM_PR.find(x=>x[0]===k)[1];
  if(!l.length){$('admMsg').textContent='Tutti quelli mostrati hanno già questo premio.';return;}
  askConfirm({title:'Assegnare il premio?',ok:'Assegna',
    html:`<p><b>${t}</b></p><p>Giocatori: ${l.length}</p><p>${l.slice(0,30).map(p=>esc(p.n)).join(', ')}${l.length>30?', …':''}</p>`,
    onOk:()=>admSave(l,g=>g[k]=true)});
}
// le due schede del menu amministratore: premi ai giocatori, stagione e numeri
function admTab(t){
  ADM.tab=t;
  for(const [id,v] of [['admTabP','P'],['admTabS','S']]){$(id).classList.toggle('on',t===v);$(id).setAttribute('aria-pressed',t===v);}
  $('admPrizes').classList.toggle('hidden',t!=='P');$('admSeason').classList.toggle('hidden',t!=='S');$('uAdm').classList.toggle('wide',t==='P');
  if(t==='P')admLoad();else admStats();
}
$('admTabP').addEventListener('click',()=>admTab('P'));
$('admTabS').addEventListener('click',()=>admTab('S'));
$('admFind').addEventListener('click',admLoad);
$('admQ').addEventListener('input',()=>{ADM.max=ADM_PAGE;$('admMsg').textContent='';admRender();});
$('admFAll').addEventListener('click',()=>{ADM.f='all';ADM.max=ADM_PAGE;admRender();});
$('admFWon').addEventListener('click',()=>{ADM.f='won';ADM.max=ADM_PAGE;admRender();});
$('admBulk').addEventListener('click',e=>{const b=e.target.closest('[data-bulk]');if(b)admBulk(b.dataset.bulk);});
$('admRes').addEventListener('click',e=>{
  if(e.target.closest('#admMore')){ADM.max+=ADM_PAGE;admRender();return;}
  const b=e.target.closest('[data-g]');if(b)admToggle(+b.dataset.p,b.dataset.g);
});

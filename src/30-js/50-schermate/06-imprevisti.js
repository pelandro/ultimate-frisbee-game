/* ---- IMPREVISTI: il riquadro che compare sul cruscotto quando c'e' un imprevisto in sospeso (le regole sono in 30-carriera/11-carriera-dinamica.js) ---- */
function openEvt(){
  const e=SV.evt;if(!e||!EVT[e.id]){SV.evt=null;return;}
  const t=EVT[e.id].t(e.a),ops=EVT[e.id].o(e.a);
  $('evTitle').textContent=t[0];$('evTxt').textContent=t[1];
  $('evOpts').innerHTML=ops.map((o,i)=>{const ok=!o[2]||o[2]();return `<button type="button" class="${i?'sec':'go'}" data-ev="${i}"${ok?'':' disabled'}>${esc(o[0])}${ok?'':' · crediti insufficienti'}</button>`;}).join('');
  $('evOpts').classList.remove('hidden');$('evRes').classList.add('hidden');$('evOk').classList.add('hidden');
  $('evt').classList.remove('hidden');
}
$('evOpts').addEventListener('click',e=>{
  const b=e.target.closest('[data-ev]');if(!b||b.disabled)return;
  const res=evtAnswer(+b.dataset.ev);if(!res)return;
  $('evRes').textContent=res;$('evRes').classList.remove('hidden');$('evOpts').classList.add('hidden');$('evOk').classList.remove('hidden');
  persist();
});
$('evOk').addEventListener('click',()=>{$('evt').classList.add('hidden');renderHome();});

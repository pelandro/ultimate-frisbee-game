/* ---- AVVISO «DIFESA ADATTATA» (#adw) ----
   L'unico avviso in partita su una meccanica nascosta (scelta di chi cura il gioco: le altre restano da scoprire). Dopo 2 break subiti di fila
   attaccando con lo stesso schema (G.adw, contato in scoreGoal), nei secondi prima del pull avversario compare un fumetto che non ferma niente e non
   si tocca. Sparisce quando parte il pull o se cambi schema. Non in Ultimate Team (UT.on) ne' in allenamento. */
const ADW_ART={vert:'il ',horz:"l'",hex:"l'",side:'lo ',t1:'il ',weave:'il ',i34:"l'"};
let adwK='';
function adwTick(){
  const a=G.adw,el=$('adw'),on=!!a&&a.n>=2&&G.mode==='ready'&&G.pullTeam===1&&!G.schemeOpen&&G.sch.att===a.k&&!G.drill&&!DR.on&&!UT.on&&!G.paused;
  if(on&&adwK!==a.k){adwK=a.k;$('adwT').textContent=`Ti hanno letto ${ADW_ART[a.k]||'lo schema '}${ATT_NAME[a.k]||a.k}: prova a cambiare schema`;}
  el.classList.toggle('on',on);
}

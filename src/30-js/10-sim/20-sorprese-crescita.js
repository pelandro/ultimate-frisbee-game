/* ---- SORPRESE DI CRESCITA: il potenziale di un giovane non e' una promessa ----
   Tra i 18 e i 22 anni, in una sola estate fissata per ogni giocatore (dal nome), il suo limite puo' cambiare: il 12% dei giovani generati
   si ferma (talenti da -3 a -7, ma mai sotto le statistiche che ha gia': nessuno perde punti), il 6% scopre di avere piu' margine (da +3 a +6).
   Vale per i tuoi e per quelli delle altre squadre: anche un grande club puo' ritrovarsi con un ragazzo che non diventa quello che sembrava.
   Chiamata da agePlayer, dopo il compleanno; o.pvx = di quanto e' cambiato (lo legge newSeason per la notizia, poi lo toglie). */
function potSurprise(o){
  if(!o.gen||o.age<18||o.age>22)return;
  const nm=o.full||o.name||o.n||'',h=hashStr('pv|'+nm);
  if(o.age!==18+h%5)return;
  const r=Math.floor(h/7)%100;let d=0;
  if(r<12)d=-(3+Math.floor(h/701)%5);else if(r>=94)d=3+Math.floor(h/1301)%4;
  if(!d)return;
  const grp={tl:['lan','buc','spa'],tv:['vis'],tf:['dif','sal','sca','agi','tuf','vel','res','pre']};
  for(const t in grp){const low=Math.max(...grp[t].map(k=>o.s[k]))+3;o[t]=clamp(d<0?Math.max(o[t]+d,Math.min(o[t],low)):o[t]+d,50,99);}
  if(o.tal!==undefined)o.tal=Math.round((o.tl+o.tf+o.tv)/3);
  o.pvx=d;
}

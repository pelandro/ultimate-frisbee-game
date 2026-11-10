/* ---- OVERALL PESATO PER RUOLO ----
   Non piu' la media di tutte le statistiche: ogni ruolo pesa quelle che gli servono. Handler: lanci e visione; Cutter: presa, velocita', scatto, agilita', salto;
   Defender: difesa, velocita', agilita', salto, tuffo. L'Overall di un giocatore e' quello nel suo ruolo migliore: uno specialista della difesa vale per come difende. */
const ROLE_W={H:{lan:.22,buc:.12,spa:.10,vis:.10,pre:.07,agi:.07,sca:.06,vel:.05,res:.03,dif:.10,sal:.05,tuf:.03},
  C:{pre:.14,vel:.13,sca:.13,agi:.12,sal:.13,res:.04,vis:.04,lan:.07,tuf:.05,dif:.12,buc:.02,spa:.01},
  D:{dif:.30,vel:.12,agi:.13,sal:.13,tuf:.09,sca:.10,res:.04,vis:.05,pre:.04}};
const rate=(st,r)=>{const w=ROLE_W[r];let t=0;for(const k in w)t+=w[k]*st[k];return t;};
const roleR=x=>x.role||x.r||'C';
const posOf=x=>x.pos||(rate(x.s,'D')>=rate(x.s,roleR(x))+2?'D':roleR(x));       // ruolo in cui rende di piu': H, C oppure D (difensore)
const ovrX=x=>Math.max(rate(x.s,roleR(x)),rate(x.s,'D'));                // overall (con decimali) nel ruolo migliore
const ovr=p=>Math.round(ovrX(p));
const POS_NAME={H:'Handler',C:'Cutter',D:'Defender'};
/* ---- TRATTI: pochi, con effetti reali ma moderati. Circa un giocatore su quattro ne ha uno, legato a cio' che sa fare meglio ---- */
const TRAITS={deep:['Deep Threat','Sui lanci lunghi parte prima e arriva più in alto'],break:['Break Specialist','Il marcatore lo disturba la metà quando lancia sul lato chiuso'],
  general:['Field General','Con lui al disco i compagni tagliano con i tempi giusti e lo stall pesa meno'],lock:['Lockdown','Segue il suo uomo più da vicino e vince più duelli in difesa'],
  sky:['Sky Dominator','Più forte nei duelli in aria'],hands:['Safe Hands','Perde molte meno prese difficili'],explosive:['Explosive Cutter','Accelera e cambia direzione più in fretta'],iron:['Ironman','Si stanca molto meno']};
function traitFor(name,st,role){
  if(hashStr('trait|'+name)%100>=42)return null;
  const m=KEYS.reduce((a,k)=>a+st[k],0)/KEYS.length,h=role==='H';
  const c=[['deep',(st.vel+st.sal)/2-m-(h?6:0)],['break',st.buc-m-(h?2:8)],['general',st.vis-m-(h?2:9)],['lock',st.dif-m-2],['sky',st.sal-m-3],['hands',st.pre-m-2],['explosive',(st.sca+st.agi)/2-m-2],['iron',st.res-m-3]].sort((a,b)=>b[1]-a[1]);
  return c[0][1]>=2?c[0][0]:null;
}
const hasT=(p,t)=>!!p&&p.trait===t;
const devOf=name=>0.7+(hashStr('dev|'+name)%71)/100;   // velocita' di crescita individuale: da 0,70 (lenta) a 1,40 (rapida)


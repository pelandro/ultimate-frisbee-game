/* ---- PLAYBOOK: aperture, weave e attacco in meta ----
   Ogni schema a sequenza parte a ogni ripresa del gioco (dopo il pull o un turnover): i giocatori si dispongono ('set'), eseguono i movimenti
   ('go') e chi ha il disco aspetta il taglio previsto ('ready'). Se il disco arriva al primo ricevitore previsto parte la fase dopo; altrimenti
   si torna al gioco libero dello schema (SLOTS). Coordinate: u = metri in avanti dalla propria linea di meta, y = larghezza del campo (0-37);
   [u,y,'a'] = punto assoluto, [du,dy,'h'] = relativo al portatore. Ruoli: H1 portatore, H2-H3 handler, C1-C4 cutter.
   Vantaggi e limiti (misurati in SCH_EFF):
   - Verticale: taglio sotto sul lato aperto e taglio lungo sull'altro lato nello stesso momento; poi continuazione lungo la linea.
     Forte contro la difesa a uomo che forza fuori, soffre la zona (i passaggi corti al centro finiscono nella coppa).
   - Orizzontale: il cutter interno attacca la profondita', quello accanto viene incontro; poi tagli in/out larghi.
     Allarga la zona e la batte sui lati; contro l'anticipo a uomo i tagli sotto sono contesi.
   - Weave: i tre handler si passano il disco correndosi davanti a vicenda; i cutter restano larghi e lontani.
     Guadagna metri con passaggi corti contro la marcatura aggressiva e gli aiuti; tanti passaggi = piu' handblock e piu' tempo.
   - Attacco in meta (scatta da solo ricevendo a 2-20 m dalla linea): stack orizzontale dentro la meta e tagli a L (incontro, poi via).
     Toglie il gioco ammassato davanti alla linea; contro la zona il primo taglio viene spesso chiuso. */
PLAYBOOK.vert={phases:[
  {pass:['C2','C4'],ready:'C2',
   set:{H2:[-6,MID+8],H3:[1,MID-11],C1:[12,MID],C2:[17,MID],C3:[22,MID],C4:[27,MID]},
   go:{C2:[[22,MID+2],[11,MID+11]],C4:[[44,MID-8]]}},
  {pass:['C3','H1'],ready:'C3',
   go:{C3:[[30,MID+12]],H1:[[4,MID+2]],C1:[[16,MID-6]]}}
]};
PLAYBOOK.horz={phases:[
  {pass:['C3','C2'],ready:'C3',
   set:{H2:[-1,MID-10],H3:[-1,MID+10],C1:[17,5],C2:[19,14],C3:[19,23],C4:[17,32]},
   go:{C2:[[38,MID-5]],C3:[[21,MID+3],[9,MID+6]]}},
  {pass:['C4','C1'],ready:'C4',
   go:{C4:[[14,30],[28,33]],C1:[[20,6],[12,MID-4]],H1:[[8,MID-2]]}}
]};
PLAYBOOK.weave={phases:[   // passaggi diagonali in avanti di circa 10 m: chi passa scavalca subito il ricevitore
  {pass:['H2'],ready:'H2',
   set:{H2:[-3,MID-11],H3:[-5,MID+9],C1:[16,5],C2:[22,14],C3:[28,23],C4:[34,32]},
   go:{H2:[[8,MID-8]]}},
  {pass:['H1','H3'],ready:'H1',
   go:{H1:[[18,MID-1]],H3:[[6,MID+6]]}},
  {pass:['H3','C2'],ready:'H3',
   go:{H3:[[28,MID+5]],H2:[[16,MID-11]],C2:[[42,MID-4]]}}
]};
SLOTS.weave=[[-6,'r',0],[2,'r',-10],[-2,'r',10],[16,'a',5],[22,'a',14],[28,'a',23],[34,'a',32]];   // gioco libero: tre handler sfalsati, cutter larghi e lontani
const EZ_LINE=FIELD_L-2*EZ;   // la linea di meta che si attacca, in metri dalla propria (64)
PLAYBOOK.ez={phases:[
  {pass:['C2','C3'],ready:'C2',
   set:{H2:[-4,8,'h'],H3:[-4,-8,'h'],C1:[EZ_LINE+6,6,'a'],C2:[EZ_LINE+6,14,'a'],C3:[EZ_LINE+6,23,'a'],C4:[EZ_LINE+6,31,'a']},
   go:{C2:[[EZ_LINE-4,MID-2,'a'],[EZ_LINE+9,8,'a']],C3:[[EZ_LINE+2,MID+2,'a'],[EZ_LINE+10,30,'a']]}}
]};
// dopo una presa vicino alla meta: una volta per possesso si chiama l'attacco in meta (se lo schema in corso e' finito)
function ezCheck(team,p){
  if(!G.ezUsed)G.ezUsed=[false,false];
  const pb=G.pb&&G.pb[team];if(G.ezUsed[team]||(pb&&pb.active)||inEZ(p,team))return;
  const u=(p.x-(dirOf(team)>0?EZ:FIELD_L-EZ))*dirOf(team);
  if(u<EZ_LINE-20||u>EZ_LINE-2)return;
  G.ezUsed[team]=true;startPlay(team,'ez');
  const nb=G.pb&&G.pb[team];if(nb){nb.stage='set';G.st.ez[team]++;}
}

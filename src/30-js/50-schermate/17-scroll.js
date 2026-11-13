/* ---- SCORRIMENTO: ridisegnare una schermata (tasto «i», acquisto, filtro) non riporta in cima alla pagina ----
   Le schermate si ridisegnano riscrivendo il loro contenuto, e il browser perdeva la posizione di scorrimento. Qui ogni funzione di disegno
   ricorda la posizione prima e la rimette dopo; quando si entra in una schermata da un'altra la posizione e' zero, quindi si parte dall'alto. */
const keepY=(id,f)=>function(...a){const el=$(id),y=el?el.scrollTop:0,r=f.apply(this,a);if(el&&y)el.scrollTop=y;return r;};
renderClub=keepY('club',renderClub);renderRoster=keepY('roster',renderRoster);renderMarket=keepY('market',renderMarket);renderTrain=keepY('train',renderTrain);renderEvent=keepY('event',renderEvent);

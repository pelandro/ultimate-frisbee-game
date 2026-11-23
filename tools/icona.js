/* Icona del gioco (scheda del browser, scorciatoia sulla Home di iPhone e Android): il tuffo con il disco, a pixel su sfondo verde.
   I PNG stanno in tools/icone/ (icona-64, 180, 192, 512) e si rigenerano da un'immagine con tools/icona-da-immagine.py: build e test li leggono soltanto,
   senza dipendenze (il gioco resta un file solo e la 64x64 finisce dentro l'HTML).
   Uso: require('./icona').png(lato) restituisce un Buffer PNG (lati disponibili: 64, 180, 192, 512); build.js mette la 64x64 nell'HTML e scrive in dist/
   le altre per la pagina web. */
const fs=require('fs'),path=require('path');
const DIR=path.join(__dirname,'icone'),LATI=[64,180,192,512];
function png(side){
  if(!LATI.includes(side))throw new Error('Icona '+side+'x'+side+' non disponibile (lati: '+LATI.join(', ')+'); si crea con tools/icona-da-immagine.py');
  return fs.readFileSync(path.join(DIR,`icona-${side}.png`));
}
// file per la pagina web: icone e manifest (nome, schermo intero, orizzontale: su Android l'app aggiunta alla Home si apre gia' girata).
// Il colore di fondo e' il verde dell'icona: e' quello che si vede attorno all'icona mentre l'app si apre.
function webFiles(){
  const man={name:'Ultimate Pixel',short_name:'Ultimate Pixel',start_url:'./',scope:'./',display:'fullscreen',orientation:'landscape',background_color:'#51ab34',theme_color:'#3d5779',
    icons:[{src:'icona-192.png',sizes:'192x192',type:'image/png',purpose:'any maskable'},{src:'icona-512.png',sizes:'512x512',type:'image/png',purpose:'any maskable'}]};
  return {'icona-192.png':png(192),'icona-512.png':png(512),'apple-touch-icon.png':png(180),'manifest.webmanifest':Buffer.from(JSON.stringify(man,null,1))};
}
module.exports={png,webFiles};

# Stemmi e sigle

Gli stemmi della revisione retro approvata sono incorporati in `02a-stemmi-dati.js`, come griglie con palette e corse orizzontali `[x,y,larghezza]`. `02b-identita-club.js` usa gli stessi dati per SVG nei menu e rettangoli interi nel canvas. Non servono file immagine, rete, caricamenti asincroni o librerie a runtime. Nessun contorno chiaro automatico viene aggiunto.

Il centrocampo continua a mostrare il club di casa, anche in trasferta; in campo neutro rimane la manifestazione. Gli stemmi nelle tribune, nei cartelloni e nelle scene laterali passano dagli stessi helper. Nei cartelloni da cinque pixel il simbolo e' necessariamente molto ridotto.

## Identita' e sigle

- Alle 108 voci della raccolta iniziale si aggiungono le 10 squadre di Serie A Women e i 48 club USA Ultimate Women. Cinque club USA Women usano la sigla perché manca uno stemma verificato: Komodos, Takedown, Magma, Omega Continuum e River Monsters. I marchi di sola sigla vengono composti dalla tabella delle sigle.
- Tequila Boom Boom e Tequila Junior hanno due bombe nere con la miccia accesa, orientate in direzioni opposte. Cheetahs, Tane Malefiche, DiscoBolo Women e One Tribe Women condividono gli stemmi delle rispettive società con alias espliciti.
- La Fotta Offence e Defense usano il nuovo glifo rosso a tre punte fornito dall'utente. Redbulls, Zero51 e NextGen mantengono il marchio BFD della societa'. La rana Clapham deriva dal riferimento classico allegato dall'utente.
- Le altre formazioni delle societa' gia' presenti condividono il loro simbolo solo attraverso alias espliciti. Non si usano confronti approssimativi per assegnare a club omonimi il logo sbagliato. Dove manca il marchio, resta una sigla originale su fondo trasparente.
- `docs/squadre-sigle.json` elenca le 319 squadre attuali con sigle e riferimenti agli stemmi. Le sigle (2-4 lettere/cifre) sono distinte dentro ogni campionato. Prevale il nome della squadra sulla societa': BAR Barbastreji, BBD Barbados, BFT Barbafighto; LFO e LFD distinguono le due La Fotta. Per le seconde formazioni restano numeri, categoria o soprannome.
- Non cambiano nomi o identificatori nei dati di campionato e nei salvataggi. I nomi personalizzati e le squadre future ricevono una sigla di ripiego.

## Fonti e attribuzioni

`docs/stemmi-fonti.json` conserva pagine e immagini della ricerca, con i casi basati su foto o ancora provvisori. I marchi sono reinterpretazioni semplificate per il gioco, non stemmi ufficiali certificati. Le palette derivano dai riferimenti; quelle senza un riscontro restano proposte. La Fotta e Clapham hanno i riferimenti allegati dall'utente durante la revisione, che prevalgono sulla prima ricerca.

Tsunami: adattamento da *Logo_tsunami.png*, autore **Regis Brouard / Régis Brouard**, Wikimedia Commons: https://commons.wikimedia.org/wiki/File:Logo_tsunami.png . Licenza **CC BY-SA 4.0**, https://creativecommons.org/licenses/by-sa/4.0/ . Modifiche: eliminazione di testo e anelli, semplificazione di onda e giocatore, conversione su griglia retro. Questo adattamento mantiene la stessa licenza. L'attribuzione e' inclusa anche nel modulo incorporato nel gioco; non estende la licenza agli altri marchi.

## Verifica

`node tools/test-stemmi.js` controlla copertura delle 319 squadre, sigle distinte per campionato, alias, simboli La Fotta, griglie e trasparenza del canvas. I test generali e di impaginazione continuano a verificare le schermate che usano `crest()` e il gioco compilato.

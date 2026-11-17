# Stile dei testi del gioco

Regole per chi scrive o cambia una scritta visibile al giocatore (tutorial, guida, fumetti, pulsanti, messaggi, notizie). Servono a tenere il gioco chiaro e coerente: leggile prima di aggiungere un testo.

## Come si scrive

- **Si parla al giocatore con «tu»** («Tocca un compagno», «La tua squadra»). Le notizie sul club possono usare «voi» («Siete campioni»), come già fanno.
- **Frasi corte, parole semplici.** Una frase = un'idea. Verbo all'imperativo per i comandi, indicativo presente per spiegare cosa succede.
- **Prima la cosa da fare, poi il perché.** Un testo di aiuto risponde a: che cos'è, cosa faccio, cosa succede.
- **Niente formule, tarature o conti interni** nei testi per il giocatore (numeri solo quando servono a scegliere: un prezzo, una soglia che si vede). I dettagli stanno nei documenti.
- **Fumetti e Primi passi**: al massimo tre frasi. **Tutorial**: lezioni brevi con un elenco al posto dei paragrafi lunghi. **Guida**: una voce per argomento, che comincia con il nome in grassetto (la guida contestuale cerca la voce dalla parola iniziale: `Rosa`, `Mercato`, `Allenamenti`, `Strutture`, `Campionati`).
- **Testo vero, non sensazioni**: ogni frase deve rispecchiare ciò che il gioco fa. Se cambi una regola, aggiorna nello stesso momento Tutorial (`TUT`), Guida, Primi passi (`PP_STEPS`), fumetti (`TIPS`) e `docs/CHANGELOG.md`.
- **Niente puntini «…»** per tagliare un testo (si riscrive più corto), niente maiuscole a caso, niente inglese dove c'è una parola italiana chiara.

## Quanto devono essere lunghi

Niente papiri: un testo si legge in pochi secondi. `npm run check` fa fallire la verifica se si superano questi limiti.

| Testo | Limite |
|---|---|
| Fumetto della carriera (`TIPS`), prova dei Primi passi | circa 250 caratteri (2-3 frasi) |
| Lezione del tutorial | 1000 caratteri in tutto, nessun paragrafo o punto elenco oltre 330 (di solito ne bastano 700) |
| Voce della Guida | 420 caratteri; se serve di più, una frase di apertura e un elenco annidato (`<ul>`) con un'idea per punto |
| Spiegazione dietro il pulsante «i» | 3 paragrafi brevi al massimo |
| Notizia, avviso, messaggio | una frase, due al massimo |

Se un testo non entra nel limite, di solito spiega troppe cose insieme: spezzalo, o lascia il dettaglio alla Guida.

## Parole da usare sempre allo stesso modo

| Parola | Significato |
|---|---|
| **meta** | il punto segnato; si vince a 7 mete (11 o 15 nelle partite più lunghe). Mai «punto» per il risultato |
| **Meta N** | il punto che si sta giocando (dal pull alla meta) |
| **pull** | il lancio lungo che fa iniziare ogni meta; **brick**: se esce, si riparte dalla × al centro |
| **stall** | conteggio fino a 10 di chi ha il disco marcato da vicino; a 10 perde il disco |
| **turnover** | il disco passa agli avversari |
| **handblock**, **tuffo**, **intercetto**, **Callahan**, **huck** | si usano questi nomi; «rovesciato» non si usa per il lancio alto |
| **lancio piatto / lancio alto** | i due tipi scelti con le dita; Rovescio, Dritto, Scoober, Hammer sono i lanci che ne derivano |
| **Handler, Cutter, Defender** | i tre ruoli |
| **Overall (OVR)** | il valore di un giocatore, da 1 a 99; **forza della squadra** = media dei 7 migliori |
| **linee ATT e DIF** | le due formazioni (in attacco e in difesa) |
| **Arcade, Competitiva, Lunga** | durata delle partite (7, 11, 15 mete) |
| **intervallo** | la pausa a metà partita (mai «half time») |
| **Salti, tuffi e replay** | l'impostazione dei primi piani a tempo e dei replay (mai «stacchi laterali») |
| **crediti** | la moneta della carriera; **gettoni** quella di Ultimate Team |
| **Posta, Squadra, Allena, Mercato, Lega, Società** | le sezioni della carriera (anche nei testi, con la maiuscola) |
| **EUCF** | Campionato europeo; **Nationals** quelli USA |

Le statistiche si chiamano come in `LBL` (`20-ui/01-base-camera.js`): Lancio, Buco, Sparo, Difesa, Salto, Scatto, Tuffo, Velocità, Visione, Resistenza, Presa, Agilità.

## Dove stanno i testi

| Cosa | Dove |
|---|---|
| Tutorial completo (capitoli e lezioni) | `src/30-js/50-schermate/20-tutorial-contenuti.js` (`TUT`) |
| Prove nelle prime partite | `src/30-js/50-schermate/14-primi-passi.js` (`PP_STEPS`) |
| Fumetti della carriera e consigli | `src/30-js/50-schermate/09-consigli-fumetti.js` (`TIPS`, `adviceList`) |
| Guida a schede | `src/20-html/07-guida.html` |
| Menu, impostazioni, pausa, fine partita | `src/20-html/*.html` e `src/30-js/90-avvio/02-audio-ciclo.js` |
| Messaggi in partita | `src/30-js/10-sim/` (`HOOKS.toast`) e `src/30-js/20-ui/` |
| Notizie, imprevisti, Posta | `src/30-js/30-carriera/` e `src/30-js/50-schermate/` |

# Ultimate Team · Real player: attivazione online

Real player usa **Firebase Realtime Database** con semplici richieste web (nessuna libreria: il gioco resta un solo file e il resto funziona offline).
Finché non si inseriscono i due valori qui sotto, la modalità mostra «Real player non è ancora attivo» e tutto il resto del gioco funziona come prima.

## Una volta sola (lo fa chi possiede il progetto Firebase)

1. Sulla console <https://console.firebase.google.com> apri il progetto (o creane uno).
2. **Build › Realtime Database › Crea database** (la regione più vicina, modalità «bloccata»).
3. **Build › Authentication › Inizia › Metodo di accesso › Anonimo › Attiva.** Il giocatore non vede nessun accesso: serve solo a legare la sua squadra al suo dispositivo.
4. **Realtime Database › Regole**: incolla il contenuto di [`firebase-rules.json`](firebase-rules.json) e premi *Pubblica*.
5. Copia due valori:
   - l'indirizzo del database (in Realtime Database › Dati, per esempio `https://nome-progetto-default-rtdb.europe-west1.firebasedatabase.app`);
   - la chiave API (Impostazioni progetto › Generali › La tua app › «Web API Key»).
6. Scrivili in `src/30-js/40-modalita/04-ut-online.js`, nella riga `const UTO_CFG={db:'',key:''};`, e consegna con una pull request come ogni altra modifica.

L'indirizzo e la chiave API **non sono segreti**: stanno in ogni sito che usa Firebase e il repository è pubblico. Quello che protegge i dati sono le regole del punto 4. Non scrivere mai nel repository password, account di servizio o altre chiavi.

## Come funziona

| Cosa | Dove sta |
|---|---|
| Profilo del giocatore (nome, punti, vittorie, sconfitte, forza, mese in corso `s`) | `ut/players/<id>` |
| Classifica del mese (gli stessi campi, con vittorie, sconfitte e partite del mese) | `ut/seasons/<AAAA-MM>/<id>` |
| Squadra (7 titolari e fino a 7 riserve, statistiche per carta) | `ut/teams/<id>` |
| Identità | utente anonimo di Firebase, salvato nel browser (`ultimate-ut-online`) |
| Superpoteri: profilo e squadra (la squadra di Real player, più l'eroe `h` dei titolari, per esempio `lupo3`) | `uh/players/<id>`, `uh/teams/<id>` (nel browser `ultimate-ut-eroi-online`) |

**Superpoteri** usa la radice `uh`, con regole uguali a `ut` più il campo `h` delle carte. Quando le regole cambiano (come all'arrivo dei Superpoteri), chi possiede il progetto Firebase deve incollare di nuovo [`firebase-rules.json`](firebase-rules.json) in **Realtime Database › Regole** e premere *Pubblica*: finché non lo fa, i Superpoteri rispondono «Il server di Superpoteri ha rifiutato la richiesta» e Real player continua a funzionare come prima. Il nome e l'accesso anonimo sono gli stessi delle due modalità; i punti no.

- **Stagioni mensili (solo Sfide online)**: il profilo ha il mese in corso (`s`, per esempio `2026-12`) e ogni mese ha la sua classifica in `ut/seasons/<mese>/<id>`. Al primo accesso del mese nuovo si riparte con 200 punti in meno (mai sotto i 1000): le regole accettano il cambio di mese solo con quel conto e la riga del mese solo con gli stessi punti del profilo. I primi 10 del mese con almeno 10 partite ricevono un badge (sul dispositivo). **Le regole nuove vanno pubblicate prima di unire la modifica**: finché mancano, il gioco se ne accorge (risposta 401/403) e continua senza stagioni.
- **Amministratore**: nella Classifica di Sfide online il pulsante «Amministratore» chiede un codice; una volta inserito (resta nel dispositivo, `ultimate-ut-admin`, finché non si preme «Esci») si apre un menu con i numeri d'uso e «Riparti con una nuova stagione». Una pagina web non riconosce il dispositivo: il codice va inserito una volta su ogni dispositivo o browser (se si cancellano i dati del browser, di nuovo). **Impostazione**: nella console, Realtime Database › Dati, in `ut` aggiungi il nodo `adminKey` con una frase lunga e segreta a tua scelta (nessuno la può leggere dal gioco). Per scrivere `ut/meta` (stagione aperta a mano: `s` 'AAAA-MM.NN', `p` quella chiusa, `at`) il gioco manda il codice in `ut/ctl` insieme all'ora del server, e le regole controllano entrambi (una vecchia scrittura non basta). Tutti gli altri ripartono con 200 punti in meno al prossimo accesso, i primi 10 ricevono il badge; il primo del mese ne parte comunque una nuova. Per togliere l'accesso a tutti basta cambiare `ut/adminKey`.
- **Divisioni e obiettivi (solo Sfide online)**: la divisione si calcola dai punti (`utoDiv`: 10 fino a 1099, poi una ogni 100, 1 da 1900) e non ha dati online. Gli obiettivi (`UTO_OBJ`: 3 del giorno e 2 della settimana, premio in gettoni una sola volta) stanno sul dispositivo (`ultimate-ut-obiettivi`) e non toccano le regole del database.
- **Statistiche anonime d'uso**: da **ogni** dispositivo (anche senza profilo online) il gioco manda solo contatori, senza nome, id né account: a ogni partita in campo +1 in `ut/stats/<AAAA-MM-GG>/<modalità>` (carriera, veloce, utteam, sfide, poteri, torneo, allenam; le simulate con una `x` davanti, per esempio `xcarriera`). Una volta al giorno per dispositivo conta anche come si gioca: difesa `dauto`/`dmanual`/`dsalta` e scene laterali `lato`/`nolato` (la somma `dauto+dmanual+dsalta` è il numero di dispositivi che hanno giocato quel giorno) e le aperture del gioco `apre`. Le richieste sono **senza accesso**: le regole di `ut/stats` le accettano con un tetto di +100 per scrittura (chi sa farlo può comunque falsare i numeri). La prima volta il gioco mostra un avviso («Va bene» / «Non inviare») e si spegne da Impostazioni › Gioco (`ultimate-stat-off`); le prove automatiche (`navigator.webdriver`) non inviano niente. Il menu amministratore unisce i dispositivi di oggi con i profili online attivi nelle ultime 24 ore (indice `u` in `ut/players`) per stimare chi gioca anche offline. **Vanno ripubblicate le regole**: senza, il conteggio si spegne da solo (401/403). Per Play Store: dichiararlo nella scheda sulla sicurezza dei dati e nell'informativa; l'IP lo vede Google come fornitore di Firebase.
- **Inizia partita**: il gioco carica la tua squadra, cerca tra i giocatori con punti vicini ai tuoi (prima ±150, poi ±500, poi ±2000, poi il più vicino) e fa giocare l'IA con la squadra scelta. L'ultimo avversario si evita se c'è un'alternativa.
- **Punti Elo**: si parte da 1000; a ogni partita si guadagna o perde da 1 a 32 punti, secondo la differenza di punti con l'avversario. Cambiano solo i punti di chi gioca.
- **Nome**: si sceglie una volta sola, poi non si può più cambiare (il blocco è nel gioco; le regole del database non lo impongono).
- **Squadra e premi**: la squadra di Real player è separata da quella del torneo contro il computer e resta nel browser (`ultimate-ut-real`). Gettoni a ogni partita, bonus contro chi ha più punti, pacchetti premio ai traguardi ogni 100 punti: i numeri sono in `10-sim/19-ut-classifica.js`. Sono calcolati sul dispositivo di chi gioca: non c'è un server che li controlla.
- **Abbandono o chiusura a metà partita**: sconfitta a tavolino, come nel resto del gioco.
- **Senza internet**: Real player si spegne con un messaggio; un risultato che non è stato possibile inviare resta in coda e parte alla prima occasione.

## Limiti noti (per ora basta il nome)

- Un nome non è un account: se si cancellano i dati del browser si perde l'identità e si ricomincia da 1000 punti. Per salvare le carriere tra dispositivi servirà un vero accesso (email o Google).
- I nomi non sono unici.
- I punti li calcola il gioco sul dispositivo del giocatore. Le regole del database permettono al massimo una variazione di 32 punti e una partita in più per volta, e ogni giocatore scrive solo nel proprio nodo, ma chi manipola il proprio browser potrebbe comunque barare un po'. Per una classifica a prova di bari servirebbe un server (Cloud Functions) che calcoli i punti.
- Le statistiche delle carte hanno limiti 25-99 ma le regole non verificano che la squadra sia davvero stata costruita con i pacchetti.

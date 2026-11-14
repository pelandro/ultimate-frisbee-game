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
| Profilo del giocatore (nome, punti, vittorie, sconfitte, forza) | `ut/players/<id>` |
| Squadra (7 titolari e fino a 7 riserve, statistiche per carta) | `ut/teams/<id>` |
| Identità | utente anonimo di Firebase, salvato nel browser (`ultimate-ut-online`) |

- **Inizia partita**: il gioco carica la tua squadra, cerca tra i giocatori con punti vicini ai tuoi (prima ±150, poi ±500, poi ±2000, poi il più vicino) e fa giocare l'IA con la squadra scelta. L'ultimo avversario si evita se c'è un'alternativa.
- **Punti Elo**: si parte da 1000; a ogni partita si guadagna o perde da 1 a 32 punti, secondo la differenza di punti con l'avversario. Cambiano solo i punti di chi gioca.
- **Abbandono o chiusura a metà partita**: sconfitta a tavolino, come nel resto del gioco.
- **Senza internet**: Real player si spegne con un messaggio; un risultato che non è stato possibile inviare resta in coda e parte alla prima occasione.

## Limiti noti (per ora basta il nome)

- Un nome non è un account: se si cancellano i dati del browser si perde l'identità e si ricomincia da 1000 punti. Per salvare le carriere tra dispositivi servirà un vero accesso (email o Google).
- I nomi non sono unici.
- I punti li calcola il gioco sul dispositivo del giocatore. Le regole del database permettono al massimo una variazione di 32 punti e una partita in più per volta, e ogni giocatore scrive solo nel proprio nodo, ma chi manipola il proprio browser potrebbe comunque barare un po'. Per una classifica a prova di bari servirebbe un server (Cloud Functions) che calcoli i punti.
- Le statistiche delle carte hanno limiti 25-99 ma le regole non verificano che la squadra sia davvero stata costruita con i pacchetti.

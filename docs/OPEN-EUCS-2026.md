# Revisione della forza Open sui risultati EUCS 2026

La revisione usa tutte le 15 voci 2026 del selettore EUCS. Dieci eventi contengono partite Open. Sono state raccolte **270 partite** con punteggio e collegamento al referto. Il Summer Tour di Wrocław rileva direttamente Hardfisch fra i club coinvolti. Alba è invece nel Summer Tour di Southampton. [Partite raccolte](OPEN-EUCS-2026-RISULTATI.csv) · [Portale EUCS](https://eucs-schedule.ultimatefederation.eu/index.php?view=games&season=26SUMWROC&filter=tournaments&group=all&selseason=26SUMWROC)

## Effetto nel gioco

La potenza è quella della rosa iniziale mostrata nella scelta della squadra, misurata con `rosterPower` e il medesimo seme prima e dopo. L’Overall è il valore di un singolo giocatore. La prima cifra nella colonna dei giocatori era il suo Overall precedente.

| Paese | Club | Gare / eventi | Stima dai risultati | Potenza prima → dopo | Primi due Overall prima → dopo |
|---|---|---:|---:|---:|---|
| UK | SMASH'D | 11 / 2 | 79,0 | 71,9 → **76,8** | Cam Rowland 79 → 85, Tristan Mercer 78 → 83 |
| UK | SMOG Open | 10 / 2 | 80,4 | 70,8 → **77,9** | Tom Jackson 79 → 86, Jack Slater 77 → 84 |
| UK | Bristol Open | 11 / 2 | 81,7 | 70,0 → **78,5** | Sam Cameron 78 → 87, Andrew Warnock 76 → 85 |
| UK | Alba | 6 / 1 | 79,3 | 69,0 → **75,5** | Matthew Miller 77 → 83, Greg Stewart 75 → 82 |
| UK | SOLENT Open | 10 / 2 | 77,9 | 68,2 → **75,2** | Albie Marriott 76 → 83, Andy Watt 74 → 81 |
| UK | Ka-Pow! | 10 / 2 | 78,0 | 67,2 → **74,8** | Sean Jagger 75 → 83, Casimir Chanteau-Gedrich 73 → 81 |
| FR | Magic Disc | 5 / 1 | 79,6 | 69,8 → **76,3** | Quentin Peschard 78 → 84, Aubin Laurent Beaulieu 76 → 83 |
| FR | PUC Ultimate | 6 / 1 | 78,3 | 68,7 → **75,1** | Tony Dimnet 76 → 82, Quentin Falligan 75 → 81 |
| FR | Roazhon Ultimate | 10 / 2 | 77,2 | 66,6 → **74,3** | Mathis Bréhin 74 → 82, Oscar Lebertre 73 → 80 |
| DE | BORA | 6 / 1 | 74,9 | 66,0 → **71,9** | Nick Schulz 74 → 80, Florian Grüter 72 → 78 |
| DE | Hardfisch | 11 / 2 | 76,2 | 63,2 → **73,1** | Robin Zell 70 → 80, Christian Hacker 68 → 79 |

Alba ha chiuso **quarta su undici** a Southampton (4–2), battendo Bristol 13–9 e SMASH’D 11–10. Ha perso 10–15 contro Heidees e 11–15 contro Ranelagh. I primi due giocatori del roster del gioco sono anche i primi per mete più assist nella distinta del torneo, Matthew Miller (17) e Greg Stewart (16). [Piazzamento EUF](https://eucs.ultimatefederation.eu/2026summertours) · [Distinta e risultati Alba](https://eucs-schedule.ultimatefederation.eu/index.php?team=1132&view=teamcard)

## Stima e limiti

- Per ogni gara si converte il rapporto fra le mete in differenza di potenza con `ln((mete A + 1) / (mete B + 1)) / 0,185`, sulla scala della simulazione. L’effetto di una singola gara è limitato a ±8. EUCF, Elite Invite e Bad Skid Invite hanno peso 1,5, gli altri eventi peso 1.
- Si stima la forza della rete di avversarie con minimi quadrati e una regolarizzazione equivalente a 0,8 partite verso un valore iniziale prudente. Per i club del gioco il valore iniziale è la forza precedente limitata all’intervallo 72–80, per gli altri è 74. Le squadre con Overall individuali già revisionati e i riferimenti italiani, oltre a Heidees e Freezzz Beezzz, ancorano la scala. Hardfisch e BORA si collegano ai riferimenti passando per gli avversari di Hornsyld, Wrocław e Rimini.
- Si applica il 65% dello scarto positivo con un solo torneo o il 72% con più tornei. Il livello di riferimento del club viene arrotondato al mezzo punto. La generazione della rosa conserva i profili, i bonus individuali e gli Overall fissati a mano. Gli undici livelli rivisti valgono anche per la stima delle qualificate Open all’EUCF nelle leghe esterne alla carriera.
- Per i club privi di risultati Open nel menu, la ricerca non basta per una correzione. Reading Ultimate compare nel 2026 in Mixed e quel piazzamento riguarda un’altra divisione. Un risultato vicino in un torneo estivo è un riscontro di competitività, ma presenze parziali e rotazioni possono spostare i margini. Le rose dei club restano quelle già integrate nel gioco. [Finali europee per divisione](https://eucs.ultimatefederation.eu/2026results)

## Eventi del selettore

| Evento | Gare Open |
|---|---:|
| [2026 EUCF Wroclaw](https://eucs-schedule.ultimatefederation.eu/index.php?view=games&season=26EUCFWRO&filter=tournaments&group=all&selseason=26EUCFWRO) | 52 |
| [2026 Summer Tour Bordeaux](https://eucs-schedule.ultimatefederation.eu/index.php?view=games&season=26SUMBORD&filter=tournaments&group=all&selseason=26SUMBORD) | 0 |
| [2026 Summer Tour Wroclaw](https://eucs-schedule.ultimatefederation.eu/index.php?view=games&season=26SUMWROC&filter=tournaments&group=all&selseason=26SUMWROC) | 30 |
| [2026 Summer Tour Warsaw](https://eucs-schedule.ultimatefederation.eu/index.php?view=games&season=26SUMWARS&filter=tournaments&group=all&selseason=26SUMWARS) | 0 |
| [2026 Summer Tour Southampton](https://eucs-schedule.ultimatefederation.eu/index.php?view=games&season=26SUMSOUT&filter=tournaments&group=all&selseason=26SUMSOUT) | 30 |
| [2026 Summer Tour Rimini](https://eucs-schedule.ultimatefederation.eu/index.php?view=games&season=26SUMRIMI&filter=tournaments&group=all&selseason=26SUMRIMI) | 24 |
| [2026 Summer Tour Copenhagen](https://eucs-schedule.ultimatefederation.eu/index.php?view=games&season=26SUMCOPE&filter=tournaments&group=all&selseason=26SUMCOPE) | 0 |
| [2026 Bad Skid Invite](https://eucs-schedule.ultimatefederation.eu/index.php?view=games&season=26BADSKID&filter=tournaments&group=all&selseason=26BADSKID) | 20 |
| [2026 Elite Invite Leuven](https://eucs-schedule.ultimatefederation.eu/index.php?view=games&season=26ELITLEU&filter=tournaments&group=all&selseason=26ELITLEU) | 20 |
| [2026 Spring Tour Hornsyld](https://eucs-schedule.ultimatefederation.eu/index.php?view=games&season=26SPRIHOR&filter=tournaments&group=all&selseason=26SPRIHOR) | 14 |
| [2026 Spring Tour Grenoble](https://eucs-schedule.ultimatefederation.eu/index.php?view=games&season=26SPRIGRE&filter=tournaments&group=all&selseason=26SPRIGRE) | 0 |
| [2026 Spring Tour Birmingham](https://eucs-schedule.ultimatefederation.eu/index.php?view=games&season=26SPRIBIR&filter=tournaments&group=all&selseason=26SPRIBIR) | 0 |
| [2026 Spring Tour Padova](https://eucs-schedule.ultimatefederation.eu/index.php?view=games&season=26SPRIPAD&filter=tournaments&group=all&selseason=26SPRIPAD) | 36 |
| [2026 Spring Tour Angers](https://eucs-schedule.ultimatefederation.eu/index.php?view=games&season=26SPRIANG&filter=tournaments&group=all&selseason=26SPRIANG) | 30 |
| [2026 Spring Tour Budweis](https://eucs-schedule.ultimatefederation.eu/index.php?view=games&season=26SPRIBUD&filter=tournaments&group=all&selseason=26SPRIBUD) | 14 |

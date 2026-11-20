# USA Ultimate Club Women 2026 — rose e valutazioni

La carriera parte con 48 club e 1.141 giocatrici. La stagione di riferimento è il 2026, conclusa con la vittoria di Boston Brute Squad su Washington Scandal per 15–11. La data di riferimento per età e fonti è il 20 novembre 2026. [Risultati USA Ultimate](https://usaultimate.org/2026-national-championships/) · [Ricerca e copertura](USA-WOMEN-2026-RICERCA.md)

## Dalla distinta al gioco

Il campionato reale è aperto. Per la carriera si prendono i primi sei club di ciascuna delle otto regioni nella selezione della ricerca, escluse le squadre esplicitamente U20. Entrano tutte le 16 qualificate ai Nationals. Per queste valgono le 399 iscrizioni delle distinte dei Nationals. Per gli altri 32 club si usano 746 iscrizioni da un evento identificato per squadra, di norma i Regionals. Le due eccezioni sono River Monsters (Northwest Plains Sectionals) e Omega Continuum (SCINNY). Le dieci atlete di Omega costituiscono la rosa iniziale più corta. Una distinta di torneo documenta l'iscrizione a quell'evento, anche quando il tempo giocato è sconosciuto. [Fonti delle distinte per squadra](USA-WOMEN-2026-OVERALL.csv) · [Registro delle fonti con URL e anno](USA-WOMEN-2026-DATI.json)

Quattro delle 1.145 iscrizioni hanno uno stato diverso da `in rosa`. Irene Scazzieri (Fury) e Martina Kmecová (Flipside) iniziano con BFD Shout, dove hanno già rispettivamente 93 e 89 nell'attuale gioco. Le distinte di Colorado Kelp e Zephyr riportano entrambe Maia Nguyen. Entrambe le righe sono sospese finché una fonte permetterà di distinguere un trasferimento da un'omonimia. I due numeri calcolati su quelle righe sono stime condizionate al club e non entrano in gioco.

**Identità.** La maglia 88 di Denver e il profilo del club collegano Veronica Eder a Ronnie Eder, convocata per il WUC 2024. Per Toronto le corrispondenze di cognome e maglia di Ouyang e Lewis non bastano a trasferire le statistiche fra nomi diversi. L'elenco `issues` conserva anche le maglie discordanti, le presenze solo WUCC e le affiliazioni cambiate rispetto all'anno della convocazione. [Denver](https://tct.usaultimate.org/team/denver-molly-brown/) · [Convocazioni USA](https://usaultimate.org/team-usa/world-championships/2024-wuc-women/) · [Casi individuali](USA-WOMEN-2026-DATI.json)

## Calcolo degli Overall

1. **Livello del club.** Per 25 squadre si usa il rating finale USA Ultimate e per 23 la proiezione Ultiworld. Il rating, normalizzato fra minimo e massimo dei 48, fornisce una base individuale da 71 a 87. La forma la sposta al massimo di 1,5. Per ogni gara si confronta lo scarto relativo `(mete fatte − subite) / mete totali` con lo scarto atteso `(rating proprio − rating avversario) / 2200`, entrambi limitati a ±0,6. Il peso vale 1 in stagione, 1,5 ai Regionals e 2 ai Nationals. La correzione è sei volte la somma ponderata delle differenze divisa per la somma dei pesi più sei. Servono entrambi i rating e un punteggio utilizzabile. Risultano da 6 a 32 incontri per club. [Rating USAU](https://usaultimate.org/club/rankings/) · [Projected Rankings](https://new.projectedrankings.ultiworld.com/usau/club/women) · [Calcolo per club](USA-WOMEN-2026-CLUB.csv)
2. **Rendimento ai Nationals.** L'indice è mete + assist + 1,7 × blocchi. L'eccesso di turnover sopra mete + assist + 3 costa 0,2 per unità. Al totale si sottrae 1,25 per gara del club, poi si moltiplica per 3 e si divide per gare del club + 3. Il contributo va da −2 a +7. Per una prestazione contro una delle prime quattro teste di serie si aggiunge 0,1 volte l'indice offensivo e difensivo del singolo referto, fino a +1,5 complessivi. I minuti individuali sono sconosciuti. In assenza contemporanea di mete, assist e blocchi la correzione è zero. Se la fonte pubblica solo alcune colonne, pesano i soli contributi osservati. Il dato grezzo conserva i vuoti. [USA Ultimate Score Reporter](https://play.usaultimate.org/events/2026-USA-Ultimate-Club-Nationals/schedule/Women/Club-Women/) · [Tabellini disponibili](USA-WOMEN-2026-NATIONALS-PARTITE.csv)
3. **Competizioni internazionali.** Ai WUCC un totale individuale di torneo sostituisce i referti parziali dello stesso evento. Il bonus vale `2 × max(0, mete + assist − gare) / (gare + 4)`, al massimo 4. Una convocazione documentata fissa una soglia di 90 ai World Games 2025, 86 ai World Games 2022, 87 ai WUC senior, 80 in U24 e 75 in U20. Le riserve annunciate hanno soglia 84. La convocazione è evidenza di selezione, mentre la produzione in partita richiede un referto. [WFDF](https://results.wfdf.sport/wucc-2026/teams/final-placements) · [World Games](https://wfdf.sport/wp-content/uploads/2025/08/Ultimate-Flying-Disc.pdf)
4. **Premi, stampa e professionismo.** Player of the Year fissa 95. I primi premi offensivo e difensivo fissano 94, il Breakout 90, con due punti in meno per ogni posizione successiva sul podio. Le due All-Club valgono 93 e 90. La Top 25 individuale vale 92 ai primi cinque, 90 ai successivi cinque e 87 agli altri. I premi PUL/WUL danno soglie da 79 a 90. Le dieci pagine PUL della stagione regolare danno 120 corrispondenze nelle distinte, di cui 105 con presenze. Per queste ultime la soglia è il minore fra 88 e `75 + 32 × (mete + assist + 1,7 × blocchi) / (punti giocati in O e D + 24)`, arrotondato. Per sei giocatrici i profili All-WUL pubblicano anche totali stagionali. Sono conservati nel JSON con la maglia professionistica e le sole metriche riportate. Il premio fissa già una soglia, perciò quei totali non aggiungono un secondo bonus. [Ultiworld All-Club](https://ultiworld.com/2026/11/09/all-club-2026-first-team-womens-div/) · [Statistiche PUL](https://pul-stats-hub.pages.dev/teams/DC%20Shadow?season=2026) · [All-WUL](https://westernultimateleague.com/blogs/news/2026-all-wul-teams)
5. **Valore finale.** Si sommano base del club, Nationals, avversarie e WUCC, con tetto a 93. Si prende il massimo tra questa stima e le soglie personali documentate, quindi si arrotonda. Premi e selezioni sovrapposti danno una sola soglia. Il metodo riprende dalla lega maschile il livello di partenza della squadra, il peso delle difese e le soglie per i riconoscimenti individuali. I coefficienti Women sono scelte di bilanciamento. [Metodo maschile](USA-WOMEN-2026-RICERCA.md#metodo-già-usato-per-la-lega-maschile) · [Metodo del CIU Women](OVERALL-WOMEN-2026.md)

**Affidabilità.** La colonna `confidence` indica la copertura. È alta per 124 atlete con contributi numerici ai Nationals e almeno un riscontro esterno usato nella valutazione, media per 350 con uno dei due, bassa per 667 con nessuno dei due. Per queste ultime il riferimento è la stima del club. Un invito giovanile isolato può spostarla di un punto pur lasciando bassa l’affidabilità. I pari merito riflettono l'informazione disponibile. Un minutaggio limitato, un ruolo difensivo poco misurato o un calendario con pochi referti possono rendere impreciso anche un Overall con più fonti.

**Ruoli ed età.** I ruoli provengono da 15 profili o riconoscimenti pubblicati e da 260 inferenze statistiche. Per le altre 866 atlete si usa il profilo bilanciato o handler. Per formare le linee, tra i soli casi incerti si assegnano handler fino a circa il 32% della rosa quando possibile, con un ordine stabile basato sul nome e senza cambiare l'Overall. Le 17 età esatte vengono dal libro dei World Games. Per 96 atlete si aggiungono cinque anni all'età pubblicata nella guida dei Nationals 2021. Per Anneke Vermaak si usa l’età della guida 2016 più dieci anni. Per 60 atlete si usa il vincolo della categoria giovanile. Per le altre 967 il motore riceve un'età di gioco fra 19 e 32 anni. Tutte le età ricostruite o simulate sono contrassegnate come stime e la scheda mostra «circa». [Guida Nationals 2021](https://usaultimate.org/wp-content/uploads/2021/10/2021-Nationals_Guide.pdf) · [Registro individuale](USA-WOMEN-2026-OVERALL.csv)

## Distribuzione e confronto con il gioco

| Overall iniziale | Giocatrici USA |
| --- | ---: |
| 71–74 | 111 |
| 75–79 | 488 |
| 80–84 | 365 |
| 85–89 | 131 |
| 90–95 | 46 |
| **Totale** | **1.141** |

La mediana è 79. Levke Walczak ha 95, Quincy Booth e Kai Agueros hanno 94. Per la potenza di club si applica la ponderazione del gioco sui migliori 21 Overall, 60% ai primi sette, 35% ai successivi sette e 5% agli ultimi sette. I posti vacanti valgono il minimo di rosa meno otto con un minimo assoluto di 25. Il CSV usa gli Overall interi. Nel motore la potenza dipende dagli attributi con decimali e può differire di qualche decimo. Il livello dei sette titolari (`top7`) tiene conto di tre handler e quattro non-handler, con completamento per Overall se necessario.

| Club | Potenza iniziale da Overall interi |
| --- | ---: |
| Boston Brute Squad | 91,1 |
| Washington Scandal | 91,0 |
| San Francisco Fury | 89,7 |
| Denver Molly Brown | 88,5 |
| Toronto 6ixers | 87,7 |

Per confronto, il motore misura circa 89,6 per BFD Shout e 86,2 per Tequila Boom Boom. Nel gioco la rosa corta di Omega incide sulla profondità e porta il club a circa 73. Il controllo confronta le potenze, la profondità e l'ordine di grandezza dei migliori club fra le due leghe. [Regole comuni sulla potenza](REVISIONE-POTENZE.md)

## Formato di carriera e limiti

Cinque incontri nella propria Conference e sette interregionali alimentano il ranking. Per i Nationals ogni regione ha un posto automatico, gli altri otto dipendono dal ranking e determinano i Play-in. Seguono quattro gironi da quattro, prequarti, quarti, semifinali e finale. La carriera condensa la stagione nello stesso formato usato dalla divisione maschile. I tornei reali di preparazione, i Sectionals e le partite di piazzamento restano consultabili nella ricerca. Nel gioco le sigle identificano i club per i quali manca uno stemma.

Il dataset comprende 826 risultati di stagione e Regionals più 53 incontri dei Nationals. Sono disponibili 49 tabellini individuali su 53. Mancano Nightlock–Phoenix, Phoenix–Starling, Pop–Dimes e Starling–Dimes. Le distinte di Minneapolis Pop attribuiscono 75 delle 76 mete di squadra. Le gare senza referto restano utilizzabili per la forma del club quando hanno un punteggio. I totali aggregati dei Nationals coprono anche le gare con referto individuale mancante. [Risultati per evento](USA-WOMEN-2026-RISULTATI.csv) · [Copertura per fonte](USA-WOMEN-2026-RICERCA.md)

## Riesame storico delle rose senza tabellini

Il confronto parte dal commit locale `2248db7`. Sono state incrociate tutte le 744 schede giocabili dei 32 club esterni ai Nationals 2026 con le liste pubbliche USA senior, beach, U24 e U20, i risultati canadesi WFDF senior e U24 e le analisi regionali di più stagioni. Le due iscrizioni irrisolte di Maia Nguyen restano sospese. Per 74 atlete di 20 club il riesame ha prodotto un riscontro nominativo. Gli Overall aumentano per 65 atlete di 18 club. Il [confronto individuale](USA-WOMEN-2026-RIESAME.csv) riporta anche i nove casi riesaminati a valore invariato. La media per club è la media aritmetica degli Overall iniziali di tutte le atlete giocabili della squadra. La potenza usata in partita segue invece la ponderazione sui migliori 21.

La colonna `history_offset` esprime un possibile scarto dalla base del club. La stima storica compete con la stima precedente e con le soglie individuali: si conserva il massimo. Gli indizi della stessa carriera non si sommano. La candidatura universitaria di Wisconsin e l’invito al raduno U24 del 2017 di Anneke Vermaak, insieme ai dati PUL 2026, valgono un punto sulla base di Madison (79,73). Il suo Overall sale da 80 a 81, con media di rosa 80,31. Il ruolo D riflette la stagione professionistica più recente. La guida dei Nationals 2016 le attribuisce 21 anni e porta la stima 2026 a circa 31. [Invito USAU](https://nationalteam.usaultimate.org/2017/06/2018-u-24-national-team-tryout-attendees-announced/) · [Callahan 2017](https://ultiworld.com/livewire/wisconsins-anneke-vermaak-callahan/) · [Guida 2016](https://play.usaultimate.org/assets/1/7/2016_Nationals_Guide_FA.pdf)

| Riscontro | Scarto sulla base del club | Soglia personale |
| --- | ---: | ---: |
| Invito senior o giovanile per evento fino al 2020, o candidatura Callahan 2017 | +1 con presenze PUL 2026, altrimenti 0 | — |
| Invito giovanile recente, compreso il raduno 2026 per il ciclo U24 2027 | +1 | — |
| Invito senior recente, prato o beach | +2 | 82 |
| Rosa U20, U24, senior beach o senior prato | +2 / +3 / +3 / +4 | 75 / 80 / 84 / 87 |
| Rosa senior annunciata nel 2020 | +2 | 84 |
| Profilo di club individuale in stagioni precedenti | +1 | — |
| Analisi di club 2026 o All-American D-III Second Team 2026 | +2 | — |
| Profilo di punta dedicato ai Regionals 2026 | +3 | — |
| Sola affiliazione storica | 0 | — |

I referti individuali WFDF con almeno cinque gare e almeno 1,5 mete più assist per partita aggiungono un punto allo scarto e alla soglia della relativa convocazione. La selezione annunciata e il referto con presenze hanno campi distinti. Il JSON conserva anno del torneo, stato e fonte. Per un raduno si usa l’anno del ciclo nel campo `eventYear`; l’anno di pubblicazione della lista è in `sources`. Gli inviti non provano che l’atleta si sia presentata. Per Emma Smith di Colorado Kelp sono state usate le liste con l’ateneo Colorado. Sono escluse le voci UC San Diego e Vienna (Virginia). Per Maggie O’Connor il solo nome nell’elenco del raduno senior di Long Beach non dà punti. Mijoo Lee compare nella rosa annunciata U24 canadese 2025 e le vengono attribuite solo la selezione e la relativa soglia. [Referti WFDF senior](https://results.wfdf.sport/wuc/?team=9&view=teamcard) · [Referti WFDF U24](https://results.wfdf.sport/wu24/index.php?team=50&view=teamcard) · [Convocazioni canadesi](https://ultiworld.com/2024/12/16/here-are-the-2025-u24-team-canada-rosters/)

I due aumenti maggiori interessano Julia Zhou e Zellema Mot di Komodos (77 → 87). A entrambe si applica la soglia senior. Al WUC 2024 Zhou ha 10 gare, 2 assist e 6 mete, Mot ha 4 gare e zero assist e mete riportati. La base documentale di Zhou è quindi più ampia anche a parità di Overall. [Referto Canada Mixed](https://results.wfdf.sport/wuc/?team=10&view=teamcard)

Per Agency e Wicked il riscontro acquisito non supera il valore precedente. Per Compact Disc, Drift, FAB, Indy Rogue, Magma, Omega Continuum, River Monsters, Solstice, Sureshot, Takedown, Trainwreck e Zephyr questo confronto non ha prodotto riscontri individuali utilizzabili. I risultati di squadra rimangono nella ricerca. La ricerca per nome può perdere soprannomi, cambi di cognome e raduni privi di elenchi pubblici.

## Come rivedere una valutazione

Cercare il nome nel [CSV individuale](USA-WOMEN-2026-OVERALL.csv). La riga riporta club, stato, Overall, componenti numeriche, soglia personale, motivi, ruolo, età e fonte di iscrizione. Le chiavi di `sources`, `roster_source` e `age_source` si risolvono nella mappa `sources` del [JSON di ricerca](USA-WOMEN-2026-DATI.json), salvo le etichette esplicite di stima. Le colonne `games_used`, `form` e `prior` sono nel [CSV dei club](USA-WOMEN-2026-CLUB.csv). Per correggere il dato, aggiornare prima il record di ricerca con URL, anno, nome pubblicato e tipo di evidenza. Dalla radice della repository eseguire:

```sh
python3 tools/usa-women-2026.py
npm run build
npm test
```

Il generatore opera offline. Ricrea entrambi i CSV di valutazione e il modulo che alimenta le rose. L'età negativa nel modulo identifica una stima, mentre il valore assoluto è l'età iniziale di carriera.

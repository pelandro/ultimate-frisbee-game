# Revisione degli Overall 2026

Come sono stati uniformati roster e Overall a una scala realistica. Il foglio di partenza è «Ultimate Frisbee 2D · Audit Overall 2024-2026 (prima revisione)»
(848 giocatori: 16 squadre di Serie A, 8 club europei, 13 club USA).

## Che cosa entra nel gioco

| Dato | Dove sta | Chi lo legge |
|---|---|---|
| Overall, ruolo, età (se verificata) di 848 giocatori | `src/30-js/30-carriera/00-dati-ovr-2026.js` (generato dal foglio) | `ovrMergeIT` (Serie A), `ovrFix` (club europei e USA) |
| Modifiche volute a mano (`OVR_OUT`, `OVR_FORCE`, `OVR_ADD`, `OVR_PART`, `OVR_POW`) | `src/30-js/30-carriera/00-ovr-2026.js` | stesso |
| Costruzione delle rose con Overall esatto | `10-sim/22-statistiche-da-overall.js` (`utStats`), `10-sim/12-allenamenti-rose.js` (righe con `ov`), `38-ovr/01-applica.js` | rose di ogni lega |
| Prova | `node tools/test-ovr.js` (in `npm test`) | Overall esatti, uscite, doppioni, forza dei club |

Del foglio entrano solo nome, ruolo, età e Overall. **Nessuna data di nascita**, nessun altro dato personale (il repository è pubblico).

## Regole

1. **Il foglio è definitivo** per i suoi giocatori: l'Overall è esatto, fuori da ogni calibrazione di club e dai tetti (c'è chi supera 94: Mica Glass 96, De Marrée 97).
2. Il valore di «OVR proposto» è già quello consolidato (le tre differenze con i fogli Revisioni/Rettifiche/Premi sono rettifiche successive).
3. **Età**: si prende dal foglio solo dove è verificata (data o anno di nascita pubblici, articoli): 41 casi (di cui 19 diversi da quelli che il gioco aveva). Le altre restano com'erano e il giocatore mostra «circa N anni». I nuovi giocatori senza età hanno il limite delle nazionali giovanili meno uno, o una stima.
4. **Ruolo**: H, C o D dove il foglio lo sa («incerto» = quello che il gioco già ha). D è un cutter dal profilo difensivo.
5. **Giocatori nuovi** (circa 150 non c'erano): sono aggiunti ai loro club, salvo i doppi club (De Marrée, Bontemps, Betrancourt, Ancelin), che restano solo in Europa come prima (`US_OUT`). Il Sam Hill dei Pacmen (82) è un'altra persona di quello dei Clapham (90).
6. **Trasferimenti** del foglio: Léo ed Enzo Stanguennec (Tchac), Emiel De Rieck (Gentle Open), Louis Dawans (Mooncatchers) escono dai club vecchi. La forza del club vecchio resta quella dei dati: la rosa si ricompone.
7. **Limite di rosa**: 28 giocatori (`SQ_MAX`). Cinque club del foglio ne hanno di più (Bad Skid 36, Gentle Open 34, Wall City 32, Clapham 31, Chevron 30, ...): restano i più forti. **Fuori dal gioco per il limite: 23 giocatori**, tutti tra 47 e 73 (Bad Skid 8, Gentle Open 6, Wall City 4, Clapham 3, Chevron 2), quasi tutti di affidabilità bassa.
8. **La tua rosa**: i giocatori del foglio hanno l'Overall esatto anche quando scegli il loro club per iniziare la carriera. Prima la rosa che parte tua era «un po' meno allenata» (opzione `low`, tolta): portava i giocatori del foglio 1-4 punti sotto il valore voluto, e quelli dei club fuori dal foglio da mezzo punto a poco più di uno. Ora la tua rosa è costruita come quella delle avversarie. `tools/test-ovr.js` controlla anche la rosa che parte tua.
10. **Forza dei club, prestigio dell'EUCF e riscontri individuali** (`OVR_SHIFT` in `00-ovr-2026.js`, `OVR_ADJ` in `00-ovr-eventi.js`). Principio: le squadre che giocano le competizioni maggiori (EUCF, WUCC) sono di norma più forti delle altre, ma un giocatore non prende il livello dalla squadra: chi ha riscontri individuali forti (nazionali maggiori, premi, eventi di alto livello: affidabilità «alta» del foglio, 113 giocatori) tiene il valore del foglio qualunque sia il suo club (esempio: Alberto Girotto, 92, nei Barbastreji, a metà classifica in Serie A). Lo scarto di club (un intero) vale solo per chi è stimato dalla forza del club: tutto per l'affidabilità bassa, metà per la media. Metodo per i club europei che hanno giocato l'EUCF: piazzamento medio pesato all'EUCF Open (2026 peso 1, 2025 0,85, 2024 0,7; per il 2026 media con l'ordine dei soli club europei al WUCC; semifinalisti 3,5, anni senza dato 10,5; fonti EUF ed EUCS) con 1 punto di prestigio. Gentle Open +5, Chevron +7 (semifinalista 2025, 7ª nel 2026, giocatori tutti stimati dal club), NLSU +4, Cotarica Grandes +1. In Italia La Fotta (Offence e Defense) e Cotarica (Grandes e Runners) giocano l'EUCF come una squadra sola e restano ai valori del foglio; One Tribe (84,8), DiscoBolo (84) e Barbastreji (83,8), che non c'erano, scendono di 1-2 punti per avere un margine più ampio dai club dell'EUCF (scarti −4, −3, −6 sui giocatori stimati: le punte con riscontri individuali, quasi tutte nazionali, non cambiano, per questo i Barbastreji scendono meno) e le altre squadre di Serie A non cambiano. I club fuori dal foglio con `LN_POW_FIX`: Freezzz Beezzz 85,5 (14-15 con Clapham e 13-15 con Cotarica), Heidees 82. Bad Skid resta quello del foglio (ha due giocatori a 91 e 88 con riscontri alti). `OVR_ADJ`: per i giocatori stimati degli 11 club che hanno giocato EUCF e WUCC 2026 (Open, i tornei più forti a cui un club europeo partecipa) il livello cambia da −2 a +4 secondo mete e assist a partita (da almeno 8 partite) rispetto ai compagni, a parità di ruolo: circa 4 punti di Overall per ogni punto a partita, misurati sui giocatori con affidabilità alta; meta' della distanza dal valore atteso. I tornei giovanili (U17, U20, U24) e quelli domestici non contano per gli Overall, solo per le età. Dopo ogni cambio: `node tools/test-ovr.js --calcola` e si incolla `OVR_POW`.
9. **Forza dei club del foglio** (`OVR_POW`): quella delle loro rose, con la formazione del gioco (3 handler + 4 cutter). Differisce di 1-2 punti dal «top 7» del foglio dove ci sono molti cutter di punta o doppi club tolti dai club USA.

## Giocatori fuori dal foglio

Il foglio stima senza riscontri individuali l'80% dei giocatori (posizione nel roster e forza del club). Per gli altri club:

- **Prove cercate** (pagine ufficiali WFDF e EUC): rose WUC 2024 Open di Italia, Belgio, Francia, Germania, Gran Bretagna, Canada, USA; Italia Mixed WUC 2024; WU24 2025 e EUC 2023 Italia (Open e Mixed); World Games 2025 Germania. Incrocio con i 1.290 giocatori veri dei club non coperti: 24 convocati. Con il modello dell'Excel (Overall ≈ forza del club − 10 + 0,42 × punti ai mondiali, scarto 6) i loro valori già nel gioco sono uguali o più alti: **nessuna sottovalutazione sistematica**.
- **Eccessi di scala** (le serie italiane B e C: il migliore di una squadra arrivava a +19 sopra la media dei primi 7, un diciannovenne di Serie B a 91): nel foglio chi è stimato senza prove supera la media dei primi 7 al massimo di 5,4 punti (in media 1,4). Per 10 giocatori senza riscontri pubblici il tetto è «forza della squadra + 8» (`OVR_PART`). Il Cremona Conti (63 punti a 19 anni) passa da 91 a 80.
- Non toccati: la scala delle serie (la B più forte, 73,9, è sotto la A più debole, 74,6) e le forze dei club non coperti.

- **Convocati assenti da gioco e foglio**: 45 giocatori delle rose WUC 2024 Open (Belgio 6, Francia 12 tra cui Roblet e Combret, Germania 5 con Meyer-Bothling, Gran Bretagna 6, Canada 10, USA 5 con Malks e McDonnell) più John Greenwald (World Games 2025). **Non sono stati aggiunti**: il loro club 2026 non risulta da fonti pubbliche raggiungibili e non si inventano appartenenze. Sono i candidati da inserire in `OVR_ADD` quando il club è noto.
- **Scala belga confermata dai risultati**: ai WUCC 2026 i Gentle Open sono arrivati settimi battendo i Wall City (4°), Clapham terzo ha battuto i Mooncatchers; coerente con i valori del foglio, quindi i Jetset Open (82) non sono stati riallineati.

## Giocatori più incerti

- I 23 tagliati dal limite di rosa e, in generale, i 643 con affidabilità bassa (su 848) (stima dalla profondità del club): Bad Skid, Chevron Action Flash, NLSU e Gentle Open sono quasi tutti di questo tipo.
- Le età stimate (`ae`): i giocatori nuovi e quelli senza data verificata.
- I 10 di `OVR_PART`: stime statistiche senza riscontri pubblici.
- Identità: Sam Hill (due persone), Aaron Vlieghe (One Tribe 83, Gentle Open 79, non unificati), Francesco Rossi (BFD Redbulls nel foglio; un omonimo gioca nel NoMad Goose).
- Luca Bruni (BFD NextGen): convocato U24 nel progetto di inclusione di Bologna; non è valutato come un titolare di nazionale.

## Aspetto dei giocatori famosi

`10-sim/23-aspetti-veri.js`: 32 giocatori della lega americana con capelli, carnagione approssimata e barba ricavati dalle foto ufficiali pubbliche delle schede UFA (watchufa.com). Dove la foto è vuota (7 giocatori) o il cappello copre i capelli (3) restano com'erano. Solo tratti generali.

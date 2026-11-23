# Contratti del gioco

I contratti sono i punti in cui due modifiche indipendenti possono rompersi a vicenda **senza alcun conflitto Git**.
Le regole che valgono sempre sono riassunte in `CLAUDE.md`; qui c'è il dettaglio, area per area.

- **Prima di cambiare un'area**, leggi la sua sezione.
- **Quando integri** (`/sincronizza`, `/integra`), ricontrolla le sezioni delle aree toccate da entrambi: `npm run confronto` (`tools/overlap.js`) le segnala.
- La mappa dei moduli e delle funzioni è in `docs/ARCHITETTURA.md`.

Indice: [Salvataggio](#salvataggio) · [Economia della carriera](#economia-della-carriera) · [Mercato, staff e stagione](#mercato-staff-e-stagione) · [Ultimate Team](#ultimate-team) · [Campionati](#campionati) · [Partita e motore](#partita-e-motore) · [Forza, crescita e bilanciamento](#forza-crescita-e-bilanciamento) · [Interfaccia](#interfaccia) · [Testi, tutorial e ritratti](#testi-tutorial-e-ritratti)

## Salvataggio

- Ogni campo nuovo di un giocatore va aggiunto sia in `squadData()` (scrittura) sia in `setSquad()` (lettura), con un valore predefinito per i salvataggi vecchi in `careerInit()`.
- Un campo nuovo di `G` che deve sopravvivere a una sospensione va aggiunto anche in `suspSnap`/`resumeMatch`.
- Se il formato cambia in modo non compatibile, aumenta `SAVE_V` e aggiungi la conversione in `loadSave()`.
- `SV.susp` (partita sospesa) va azzerata quando la partita finisce o viene abbandonata. `SV.slot` è lo slot della carriera: `persist()` scrive anche `ultimate-carriera-<slot>`.
- **Le chiavi di `localStorage` non si riusano.** `ultimate-cuore` = squadra del cuore per campionato (`{IT:nome, US:nome}`); `ultimate-primi` = tutorial delle prime partite; `ultimate-eroi` non si usa più (era la scelta degli eroi della vecchia partita veloce con i Superpoteri); `ultimate-settings` ha anche `uz` e `rl` (colonna della carriera: 0 automatica, 1 a destra, 2 a sinistra, che mette `html[data-rail]`).

Campi aggiunti nel tempo (ognuno ha il suo valore predefinito per i salvataggi vecchi):

- **P2**: sui giocatori `spec`, `goal`, `sad`; nella carriera `SV.staff`, `SV.duo`, `SV.lg` (calendari delle altre serie), `SV.story`, `SV.riv`.
- **Maturità**: `p.ext` (salvato come `ex`).
- **Revisione della carriera**: `p.pri` (priorità di allenamento), `p.hist` (storico dell'Overall, salvato come `hi`), `SV.prog` (programma automatico), `SV.lsOn`; sui giocatori delle altre squadre `o.ss`/`o.cs` (statistiche di stagione e carriera); sul mercato `m.mot` e `m.base`.
- **Ondata 1**: `SV.fans` (tifosi), `SV.tips` (fumetti visti); sui giocatori `nk` (soprannome), `lm` (ultima partita), `ti` (titoli), `tk` (colloqui); in partita `G.tmo` (timeout usati, anche in `suspSnap`).
- **Ondata 2**: `SV.po` e `SV.poRes` (playoff in corso: si azzerano in `endSeason`), `SV.alb` (albo d'oro della Serie A), `SV.ach` (traguardi raggiunti, con la stagione). Le voci di `SV.hof` portano anche `pos`, `v`, `lk`, `t`, `nk`, `gn` (generato o giocatrice: niente ritratto disegnato), `fe` (giocatrice: volto femminile), `md` (carta dorata). In partita `G.wx` (meteo: si azzera in `newGame()`, vale per ogni modalità).
- **Ondata 3**: `SV.coach` (`{n,s,lk}`: nome, cognome, volto), `SV.start` (`'cuore'` o `'sub'`), `SV.w0` (vittorie ereditate nel subentro), `SV.stp` (persona per ruolo dello staff: `{n,a,lk,tr,hiredIn}`), `SV.cand` e `SV.candN` (candidati e rinnovi). I livelli restano in `SV.staff` e tutti gli effetti leggono `staffLv(k)`: chi scrive `SV.staff[k]` deve tenere coerente `SV.stp[k]` (usa `staffHire`, `staffLeave`). Valori predefiniti in `coachInit()` e `staffInit()` (chiamate da `careerInit()`). Gli avvisi di `SV.alerts` hanno anche `sh` (già mostrato nella Posta: l'apertura automatica avviene una volta sola).
- **Rivali che reagiscono**: `SV.hist` (blasone dei club del computer: il livello di partenza, fisso; `histFloor(n)` = sotto quanto non scende il loro livello storico `SV.anc`).
- **Economia a partita**: vedi [Economia della carriera](#economia-della-carriera).
- **Mercato di giocatori veri** e **partite minime**: vedi [Mercato, staff e stagione](#mercato-staff-e-stagione).
- **Obiettivi**: `SV.lastRk` (vedi [Economia della carriera](#economia-della-carriera)).

Il campo e l'impianto che si vedono in partita stanno in `G.vn` (**non salvato**): `G.vn.lv` (0-5) decide tribune e bordocampo (`20-ui/22-…24-…`), `G.vn.tier` (0-2) resta quello dei conti. Un campo nuovo di `G.vn` va messo sia in `careerVenue` sia in `venueNow`.

## Economia della carriera

Campi salvati: `SV.sp` (sponsor: offerte `off`, scelta `k`, `name`, `fix` a partita; l'obiettivo `SV.obj` è quello dello sponsor), `SV.red` (`{n,w}`: partite in rosso e avvisi), `SV.fin` (ultimi conti, max 30), `SV.lastMoney`, `SV.fired` (esonero in corso: `{team,s,r,offers}`), `SV.bonusGap`, `SV.sellN`, `SV.wWarn`, `SV.lastRk`.

- **Ogni partita di carriera passa da `matchMoney()` in `recordResult`**: non sommare entrate o costi altrove, aggiungi una voce al conto.
- **Stipendi**: `wageOf` è la spesa più grande, tarata con stagioni simulate per serie in ogni campionato (vertice: 1-2 acquisti a stagione; metà classifica: in pari). La spesa passa sempre da `wageSeason`/`wageBill` (quote di `wageW`: i 14 più alti per intero, fino al 20° a metà, poi un quarto).
- **Entrate**: da `ECO.K()` (`ecoK`): segue gli stipendi di una rosa di riferimento da 16 delle altre squadre del campionato e sale con la forza dei tuoi 7 migliori sopra la media (`ECO_OWN`). Non dipende dalla lunghezza della tua rosa, così vendere le riserve non cambia le entrate.
- **Manutenzione e staff**: `facUpkeep` (0,2 per livello) e `STAFF_WAGE` sono tarati perché solo i club che vincono con continuità possano sostenere tutto al massimo. `staffWage()` ripartisce gli ingaggi dello staff sulle partite regolari; `staffInit()` migra i vecchi ruoli mantenendo il costo precedente fino a fine stagione, se già iniziata.
- **Cessioni**: la cessione immediata è `sellValue` (40% la prima della stagione, poi 4 punti in meno a ogni vendita fino al 16%: `SV.sellN`, azzerato in `beginSeason`); le offerte dei club pagano di più.
- **Avvisi**: a inizio stagione `wageWarn()` avvisa nella Posta se le previsioni danno la cassa sotto zero (`SV.wWarn` = stagione già avvisata). `AL_KIND.dir` (dirigenza) è urgente.
- `scoutCost(x)` vuole sempre il giocatore osservato; chi sale riceve `promoPrize`.
- `venueOf()` dice casa/trasferta/neutro anche per le leghe nuove; `switchLeague(club,fired)` serve anche all'esonero.
- `EVT.spons` e `EVT.bonus` sono imprevisti speciali (peso 0 o a chiamata).
- Gli schemi della carriera seguono `SCHEME_LV`; `useCareerSchemes` filtra anche i salvataggi sospesi.
- **Obiettivi**: l'obiettivo `SV.obj` può avere `promo` (si giudica sulla promozione), `eu` (stage minimo nell'EUCF), `cr` (posizione in Conference, USA) o `rel` (subentrato: salvezza), e si giudica sempre con `objMet(rank,{promoted,tit})`, mai con `rank<=tgt` a mano. `SV.lastRk` (`{s,t,lk,sr,rank,n}`) è il piazzamento dell'ultimo campionato: lo scrivono a fine stagione `endSeason`/`lnEndSeason`/`usEndSeason`, lo legge `objLast` per la posizione attesa degli obiettivi; in USA è la posizione nel ranking nazionale e chi vince il titolo è primo.

## Mercato, staff e stagione

- **Mercato di giocatori veri** (`30-carriera/33-mercato-veri.js`): `SV.fa` (svincolati veri, oggetti giocatore con `faS` = stagione in cui sono stati lasciati liberi), `SV.abroad` (`full` di chi è arrivato dall'estero: non compare più nel suo club straniero), `SV.mkStars` = 3 (versione del mercato: i salvataggi con un numero diverso lo ricostruiscono). Chi lascia una rosa del computer passa da `faAdd`, gli stranieri presi da `abroadAdd`. Nel mercato non entrano giocatori inventati finché c'è un vero con l'Overall giusto (`mkTakeR`).
- **Partite minime**: `SV.sgp` (giornate di campionato della stagione, azzerato in `beginSeason`; da subentrato parte dalle giornate già giocate; `offTrain()` lo legge in `newSeason` e lo cancella). In Europa i gironi vengono da `lnGrpSched` (più giri finché chi arriva in fondo gioca almeno `SEASON_MIN` partite): non usare `roundRobin` a mano per i gironi delle leghe europee.
- **Staff**: vedi Ondata 3 in [Salvataggio](#salvataggio) (`staffLv`, `staffHire`, `staffLeave`).

## Ultimate Team

- **Due squadre separate e tre modalità nello stesso oggetto `UT`** (`UT.rp`/`UT.hm`):
  - torneo contro il computer in `ultimate-ut`;
  - Real player in `ultimate-ut-real`;
  - Superpoteri (`hm`), che gioca online come Real player con radice `uh` e profilo `ultimate-ut-eroi-online`, con la squadra di Real player: giocatori, titolari ed equipaggiamento si leggono e si scrivono in `ultimate-ut-real` (`utLoadSq`, `utLoadHero`); in `ultimate-ut-eroi` restano gettoni e risultati (portafoglio separato), eroi, traguardi, pacchetti eroi e `ha` (a chi sono dati). Nei Superpoteri la schermata della squadra ha solo «Titolari»: potenziare e scartare si fa in Real player.
- Un campo nuovo di `UT` va aggiunto in `utSave()`, in `utLoad()` e nel suo azzeramento iniziale; se è della squadra, anche nel ramo `hm` di `utSave` e in `utLoadSq`.
- Si cambia modalità solo con `utUse(rp,hm)` (poi `uoUseP()` per il profilo online).
- Nei Superpoteri: `UT.hc` (copie = livello degli eroi), `UT.ms` (traguardi premiati, solo con pacchetti eroi) e, sulle carte, `hk` (l'eroe del titolare, solo in memoria: `utCardSig` lo ritrova al caricamento, non entra nel salvataggio di Real player). Il Negozio vende solo eroi (`utShopList`).
- Un campo nuovo delle squadre online va anche nelle regole `docs/firebase-rules.json` (che chi possiede il progetto Firebase deve ripubblicare).
- Un pacchetto in attesa (`UT.packs`) è un numero = qualità + 10 × carte (0 carte = quelle solite) + 100 × ruolo (0 misto, 1 solo Handler, 2 solo Cutter, 3 equipaggiamento, 4 eroi dei Superpoteri). I pacchetti del Negozio sono in `UT_SHOP` (`40-modalita/05-ut-negozio.js`), uguale per le due squadre, disegnati con `utDisc`.
- L'equipaggiamento (`UT.eq`, `UT.mse`: `10-sim/25-ut-equipaggiamento.js`) vale solo in partita: chi fa giocare o misura la squadra di Ultimate Team passa le carte da `eqApply(p,UT.eq)`, senza scrivere il bonus nelle carte.
- Le carte dei pacchetti sono giocatori veri dei campionati (`40-modalita/06-ut-carte-reali.js`: `utCatalog`, `utCardFor`; la carta ha anche `cl` = club). Un campionato nuovo entra da solo se è coperto da `allClubs`/`foreignRoster`. Le avversarie del torneo restano generate (`utOppRoster`).

## Campionati

### Regole comuni

- Un campionato nuovo = una voce in `LEAGUES` (`50-schermate/16-scelta-campionato.js`: id, nome, testo, `clubs`, `roster`) più la sua schermata di scelta dei club; la scelta del campionato, il roster dei club e la squadra del cuore sono comuni.
- Partita veloce, Superpoteri e torneo leggono le squadre solo da `LEAGUES` (`50-schermate/30-catalogo-squadre.js`: `qDivAll`, `qLgOf`, `qGrp` da `clubLeagueTxt`, linguetta `qLgTab`; rosa con `qRoster` → `foreignRoster` per i club esteri), quindi un campionato o un club nuovo entra da solo anche lì: non scrivere elenchi di serie a mano in quelle modalità. Le squadre femminili giocano solo tra loro anche lì (`qDivOf`).
- Le funzioni italiane delegano con `isUS()` e `isLN()`: non scrivere regole USA o delle leghe europee dentro quelle italiane. Un'altra lega = un altro file nello stile di `35-usa/`, non rami `if` sparsi.
- Ogni elenco di club per mercato, scambi, offerte o carte passa da `allClubs()`, che separa i club maschili da quelli femminili (`lnWomenNow`, `isWomenClub`): non leggere `LN_NAMES` a mano per queste cose.
- **Offerte tra tutte le leghe** (`SV.job`/`SV.jobLast`/`SV.trade`, `35-usa/05-lega-incrociata.js`): un campionato nuovo entra da solo se lo coprono `clubLega`, `allClubs`, `clubLvl`, `foreignRoster`, `clubLeagueTxt` e `lgName`; `switchLeague` porta con sé gli albi d'oro `alb`, `usAlb`, `lnAlb`.
- I nomi dei club sono unici in tutto il gioco (lo controlla il Test leghe europee).
- **Giocatori presenti in più leghe**: le carriere di leghe diverse sono separate, ma un giocatore presente in entrambe le leghe sta in una sola. Chi è in `LN_DUAL` (Overall europeo fissato: il più alto dei due, ma l'America non lo alza di oltre 5 punti e nessuno supera 94) è in `US_OUT` (`35-usa/02-roster-usa.js`: non compare nei club USA, vale anche per `US_FF`); chi è in `LN_OUT` (Orion Cable) non compare nei club europei. Per spostare un giocatore da una lega all'altra aggiornali, e togli la voce da `US_STAR_CLUB`/`LN_STAR_CLUB` se è una stella.

### Campionato USA (`SV.lk==='US'`, `SV.sr==='U'`)

- **Struttura**: `SV.mem.U` = i club della tua Conference (48 club in 8 Conference da 6: chiavi `US_CK` = NE, MA, SE, GL, NC, SC, NW, SW; 5 giornate); `SV.lg` = le altre sette. I salvataggi del vecchio formato a 32 club ripartono con `usMigrate()` (chiamata da `loadSave`).
- **Posti ai Nationals** per regione con `usBids()` = 1 automatico + 8 di forza dal ranking nazionale `SV.us.pr`, da 1 a 4 per Conference, 16 in tutto; `usBidSplit(b)` dà dirette e gare del Play-in (`SV.us.bids` e `SV.us.pin[c]={d,m,r}`). I posti si ricalcolano dopo ogni partita con `usBids()`; `usBidsReport()` li segnala.
- **Stato** `SV.us` = `{cf, conf, ph, pr, pr0, fin, pin, bids, q, nat, stage, ci, xn, xp, xl, lp, bq, pl}`: `ci` = posizione nel calendario `US_CAL` (12 partite: 5 giornate di Conference `c` + 7 interregionali `x`, finisce con una `c`), `xn` = strati interregionali giocati, `xp` = i loro accoppiamenti (`usCrossPlan`), `xl` = le tue interregionali, `lp` = ultima partita (`c`/`x`), `bq`/`pl` = posti e posizioni prima dell'ultima partita. I salvataggi senza `xp` si ricostruiscono con `usCrossFix()`. Albo d'oro: `SV.usAlb`.
- **Partite interregionali** (una contro ogni altra Conference, `usCrossPending`/`usCrossRecord`): sono partite vere (conti di `matchMoney`, allenamento, eventi, `SV.sgp`) ma non entrano nella classifica della Conference, nelle sue statistiche e nel mercato (`xm` in `recordResult`). Servono a legare le Conference: un Elo aggiornato solo dentro la Conference ne conserva la somma e i posti non reagirebbero ai risultati. Con 12 partite il USA supera sempre `SEASON_MIN`, quindi `offTrain` non scatta mai.
- Le tabelle USA portano `h` (scontri diretti): `ranking()` le riconosce da lì.
- **Livelli dei giocatori**: le stelle di `STARS` che giocano in un club USA stanno in `US_STAR_CLUB`. I livelli minimi (Overall) vengono da `usAward()`: premio All-UFA 2026, `US_REP` (`35-usa/03-reputazione.js`, a mano, con la fonte nel commento), `US_UFA_ROSTER` (essere in una rosa UFA = 78) e `US_UFA_HIST` (`35-usa/00-storia-ufa.js`, punti dai premi UFA 2022-2026, generato dalle pagine «Season Index» di watchufa.com); valgono anche per le stelle di `STARS` e per i giocatori delle leghe europee. Aggiungi lì chi ha un curriculum solido, non toccare gli Overall a mano.
- I livelli minimi sono valori finali (`fl` in `usRoster`: dopo la calibrazione del club il giocatore non scende sotto di loro); il livello «puro» viene dai dati Fantasy (50% rendimento, 50% costo di prima del torneo). Sopra 90 i valori si comprimono e il massimo è 94: il migliore del mondo è De Marrée (97, in `LN_DUAL`). `US_CAP` (`03-reputazione.js`) limita chi i calcoli spingono troppo in alto. La forza dei club USA va da 72 a 91,5 (`01-club-usa.js`).

### USA Women's Club (`SV.lk==='UW'`, `SV.sr==='UW'`)

- Condivide il motore stagionale USA e seleziona i 48 club femminili. Nei calendari usa `usClubs()` e `SV.mem[SV.sr]`, nella scelta squadra `usGroups(teamLg)`.
- Il mercato femminile usa `allClubs()` per Italia e USA (club Women italiani e USA insieme).
- Le rose iniziali e i fogli di revisione si rigenerano con `python3 tools/usa-women-2026.py` dai dati in `docs/`. Criteri ed eccezioni: [USA-WOMEN-2026-VALUTAZIONI.md](USA-WOMEN-2026-VALUTAZIONI.md).

### Leghe europee nazionali (Belgio, Francia, Germania, Regno Unito: `SV.lk` in `LN_DEF`, `isLN()`)

- **Stato**: `SV.sr=lnKey(paese,livello)` (es. `BE.N1`, con voce in `SERIES_NAME` e `SR_K`), `SV.mem[SV.sr]` = il tuo girone, `SV.lg[i]` = gli altri gironi della tua competizione, `SV.ln={tier,ci,pi,T,ph,F,ord,nT,nTier}` (composizione dei livelli e fasi finali), `SV.lnAlb` (albo d'oro).
- **Un campionato nuovo** = una voce in `LN_DEF` (livelli, competizioni, gironi, `geo` = gironi geografici con `LN_GEO_X`, `legs` = giri fissi, fasi finali `c4`/`b6`/`c8`/`k4`, promozioni `mv`, posti EUCF `eu`) + le sue righe in `LN_CL` (club e forza) e `LN_PL` (giocatori). Il motore (`37-leghe/03-stagione-lega.js`) e le schermate (`19-leghe-schermate.js`) sono già comuni.
- I gironi si giocano solo a giri completi (ogni avversaria lo stesso numero di volte: `lnGrpMin`).
- **Formato cambiato**: il vecchio resta in `LN_OLD` (con `map` dai livelli vecchi ai nuovi; lì compaiono anche le fasi finali vecchie `x8`, `p`, `rr`), perché la stagione in corso finisca con le sue regole e `lnUpgradeFormat` converta la composizione alla stagione dopo.
- **Dati**: i file `00-dati-*.js` sono generati da tabelle di risultati 2026: non si modificano a mano riga per riga, si rigenerano. Le integrazioni a mano ai roster (giocatori veri che mancano nei dati generati) stanno in `37-leghe/00-dati-integrazioni.js` (`LN_PL_PLUS`), i rinforzi per club in `LN_BOOST`; nello stesso file, con la fonte nel commento, le correzioni a mano della forza di un club fuori dal foglio Overall (`LN_POW_FIX`) e del livello dei suoi giocatori (`LN_BONUS_FIX`, letto da `lnRoster`).
- **Età**: i limiti d'età di chi ha giocato le nazionali giovanili (U17/U20/U24, dai portali dei risultati WFDF e EUF) stanno in `37-leghe/00-eta-giovanili.js` (`LN_AGE_HI`, letto da `lnHiOf` per tutte le leghe, anche per i club USA): si rigenerano dai portali, non si ritoccano a mano; l'età esatta, dove nota, vince sempre.
- **Livelli in rosa**: il livello dei giocatori di un club (`lnRoster`) segue `lnShape`: i fissi (stelle e doppioni) tengono il loro Overall, gli altri prendono il livello del loro posto in rosa (rendimento dai dati), a metà dei posti dei fissi; dove mancano le statistiche le differenze si dimezzano.

### Campionato Women (`LN_DEF.IW`, `w:true`)

- Dati in `37-leghe/00-dati-women.js` (generato dalle schede dei Campionati Italiani Women 2026), regole in `37-leghe/07-women.js`. Le squadre femminili giocano solo tra loro; gli elenchi di club passano da `allClubs()` (vedi Regole comuni).
- **Formato**: quello del campionato italiano maschile. Girone unico per serie (in B andata e ritorno, `legs:2`), playoff scudetto tra le prime 4 in A e spareggio promozione dal 2° al 5° posto in B (fase `k4` di `LN_DEF`, `f:2` = la prima sale direttamente: `lnCompOrder` la mette davanti); salgono e scendono 2 squadre. Una fase `f>1` non conta per le partite minime (`lnFinR`).
- Le giocatrici hanno `f=true` (anche le generate). In Carriera si sceglie prima la divisione (`lgDiv`), nella partita veloce `QM.div`.
- I testi diventano femminili da soli (`20-ui/19-femminile.js`, osservatore: «giocatore/giocatori» con articoli e aggettivi vicini): una frase nuova con altre parole al maschile riferite a chi gioca va aggiunta a `FEM_PH`.

### EUCF e tornei a 16

- **Chi partecipa**: 16 club veri decisi a fine campionato da `euField` (`SV.next.euQ` = il campo intero): le prime 3 dopo i playoff di Italia, Belgio, Francia, Germania e Regno Unito (`EU_SLOTS`) e la quarta classificata più forte di quei campionati. Il tuo campionato usa la classifica vera (in Italia campione, finalista e vincitrice della finale per il 3° posto, `poRes.third`), gli altri i club più forti del livello più alto (`euPick`). `EU_CLUBS` (club inventati) resta solo per le edizioni già sorteggiate nei salvataggi vecchi.
- **Stato**: `SV.eu` (`{s, state, it, nat, rk, cur, stage, cash, lastRes}`) e `SV.eup` (forza dei club europei che non giochi). Le partite europee passano da `euRecord`/`euOpponent` (`36-europa/`).
- Il motore dei gironi da 4 e del tabellone sta in `34-torneo16/` (`t16Begin`, `t16Round`, `t16User`) ed è lo stesso dei Nationals USA: non duplicarlo. I salvataggi con la vecchia coppa a 3 turni ripartono con l'edizione nel nuovo formato.

## Partita e motore

- **Stato della partita**: i campi di `G` valgono per tutte le modalità (carriera, veloce, torneo, Ultimate Team, allenamento).
  - Un campo nuovo va azzerato in ogni avvio partita (`startMatch`, `startQuick`, `startUT`, `startTourn`, `startDrill`).
  - Ciò che vale per tutta la partita (per esempio il vento `G.wind`, o il campo e il pubblico `G.vn`, che in carriera `startMatch` riscrive con `careerVenue`) si azzera in `newGame()`, che tutte le modalità chiamano.
  - Ciò che vale per un solo punto (come `G.edge`, il vantaggio del pull) si azzera in `placeTeams()`.
  - Un tuffo in corso (`G.dive`, `p.dv`) si chiude sempre con `endDive()`, mai azzerando `G.dive` a mano (il giocatore resterebbe a terra).
  - I compagni in attacco si muovono con `mvA` (aggirano il portatore, `SKIRT_R`); `TEAM_R` è la distanza minima da lui.
  - Il tipo di lancio in corso di mira è `G.high` (0 piatto, 1 alto) e si sceglie con le dita (`fingerAdd` in `05-input-impostazioni.js`).
- **Motore ↔ interfaccia**: il motore chiama `HOOKS.nome(...)`; se aggiungi un gancio, definiscilo anche nell'oggetto `HOOKS` iniziale (funzione vuota) e spegnilo nei test (`selfTestRun`).
- **Statistiche**: `KEYS` elenca le 12 statistiche; i pesi di `ROLE_W` devono sommare 1 per ogni ruolo (lo controlla il test).
  - In partita Lancio, Buco, Sparo, Visione e Resistenza hanno il pavimento morbido `flowFloor` (`10-sim/28-pavimento.js`, applicato da `applyForm`, `loadOpp` e `flowAll`): chi scrive in `p.s` a inizio partita passa da lì.
  - Durante un punto `p.s` di chi ha il disco può essere una copia maggiorata (tratto Poser, `10-sim/24-poser.js`: l'originale sta in `p.pzb`, si ripristina con `poserReset()`): in partita leggi sempre `p.s` di nuovo a ogni fotogramma, non tenerne il riferimento, e non scriverci dentro (i cambi permanenti si fanno fuori dal punto, come `applyForm`/`oppBoost`).
  - Un tratto nuovo entra in `TRAITS` (e nei candidati di `traitFor`), in guida e tutorial.
  - Nei Superpoteri anche il Lupo mannaro sostituisce `p.s` (originale in `p.hrb`, `10-sim/27-superpoteri.js`): `heroReset()` va chiamato prima di ogni cambio che riscrive `p.s` (`startPoint`, `loadOpp`) e a fine partita; un eroe non ha il tratto Poser. La copia del Clone (`G.dec`) non è in `T`: chi deve farsi ingannare la legge da `heroMarkOf`/`heroSeen`, tutto il resto la ignora.
- **Schemi e difesa**:
  - `G.rep` (`[{k,n},{k,n}]`: schema e possessi di fila per squadra, azzerato in `newGame()`, salvato in `suspSnap`/`resumeMatch`; `startPlay` lo aggiorna solo a ogni possesso vero, non per timeout o attacco in meta) alimenta `adaptOf(P)` (0-1: quanto la difesa ha preso le misure dell'attacco di P; l'IA in base al suo `adapt`, i tuoi compagni a `ADAPT_MY`), letto da `updateDefenders`, `playRead`, `reactOf` e dagli intercetti.
  - `SCH_FIT[attacco][difesa]` (da -1 a +1) è il controgioco, letto da `schFit(P)` (non `fitOf`: è già dei giocatori nel mercato) con i pesi `FIT_*`. `SCH_EFF` è solo la tabella misurata (serve all'IA per scegliere): dopo aver toccato `SCH_FIT`, `ADAPT_*` o `FIT_*` va rimisurata (30+ partite per casella con `G.fix`).
  - **Niente avvisi in partita sull'adattamento né su altre meccaniche nascoste** (chi cura il gioco non vuole che se ne sappia troppo). L'unica eccezione è il fumetto «Difesa adattata» (`#adw`, `20-ui/21-avviso-adattamento.js`): dopo 2 break subiti di fila con lo stesso schema (`G.adw` = `{k,n}`, contato in `scoreGoal`, azzerato in `newGame()`, salvato in `suspSnap`/`resumeMatch`) compare prima del pull avversario, senza fermare nulla e mai in Ultimate Team.
  - Ogni schema a sequenza parte dal centro: `startPlay` mette tutti in formazione (stage `'set'`) e, se chi ha il disco è oltre `PB_CENTER` m dal centro, sceglie un handler centrale (`pb.prep`, `pb.cspot`: il primo passaggio va a lui, `pbAllowed`/`pbWait`); `playOnCatch` chiude la preparazione e i tagli partono. Una fase può chiedere che il taglio arrivi quasi in fondo prima del passaggio (`readyR`, `readyT`).
  - Uno schema a sequenza può avere varianti (`PB_VAR[sch]` = `[[libro, probabilità]…]`, scelte da `pbBook` in `startPlay`: `pb.id` è il libro, la chiave dello schema resta in `G.sch`/`G.rep`), fasi che avanzano da sole quando il taglio è pronto (`auto`), cambi di variante se il disco va a un altro ricevitore (`alt:{ruolo:[libro,fase]}` in `playOnCatch`) e uno stall massimo suo (`stall`, letto da `pbStall`).
  - **Uno schema nuovo**: un file in `10-sim/` dopo `03b` (vedi `03c-schema-1in34.js`) con `PLAYBOOK`, `SLOTS`, `SCH_ATT.push`, `SCH_FIT` e `SCH_EFF` misurata, più `ATT_NAME` (`04-hud.js`) e `ATTS` (`08-schemi-fine-partita.js`).
  - `adhOf(p)` (`03-movimento-schemi.js`) è l'aderenza allo schema: alta anche con Visione bassa, 1 con Visione alta. Il lanciatore passa al ricevitore previsto se nessun difensore è più vicino di `PB_FREE` (3,5 m, fino a 0,8 m con Visione alta: `PB_FREE_D`) in `aiPick`.
- **Cambi**: il pannello `#subs` cambia la formazione con il tocco su due giocatori (`tapSwap`) o con «Cambia tutti e 7» (`swapAll`, che usa `blockIds(def)` del motore: i 7 migliori sani della panchina; `blockDef()` dice se la meta è di difesa). Entrambi aggiornano `G.lines[G.lineK]` in carriera: chi cambia la formazione in partita deve fare lo stesso.
- **Scene laterali** (`20-ui/03-stacchi.js`): gli omini sono disegnati a pixel da `athlete` (scheletro delle pose `skelOf` in unità hu dall'anca; teste `PX_HEAD` per gli stili di `makeLook`). Il disco tenuto passa sempre da `heldAt`/`heldDisc` e il punto d'arrivo del volo è `heldAt` di chi prende, così il disco arriva nella mano: una posa nuova o un braccio spostato restano allineati da soli. Il duello in salto riceve `runA`/`runD` dal motore (`jumpRun` in `08-prese-duelli.js`, soglia `JUMP_STILL`): chi corre arriva da sinistra.

## Forza, crescita e bilanciamento

- **Potenza di squadra, profondità e fatica** (`rosterPower`/`powerOfVals` in `10-sim/12-allenamenti-rose.js`, `10-sim/21-due-linee.js`):
  - C'è **una sola formula** per tutte le squadre di tutte le leghe: potenza = 60% media dei 7 migliori + 35% media dall'8º al 14º + 5% media dal 15º al 21º, per Overall decrescente e senza vincoli di ruolo; oltre il 21º non conta nessuno. Ogni posto vuoto di una rosa corta vale il più debole che c'è meno `PW_GAP` (almeno 25): una penalità moderata e mai un vantaggio.
  - Partite simulate, classifiche, anteprime, mercato tra i club (`aimPow`), economia e carriera la leggono da `rosterPower` (altre squadre) e `teamPow`/`squadPower`/`matchPow` (la tua: `matchPow(SV.team)` = `myPow()` in `10-partita-avvio.js`, con infortunati fuori, `DBL_PEN` a chi sta in entrambe le linee, che occupa due posti sui 14 delle linee, e con `cond` anche `COND_PEN`; `PW_MY` è l'unica taratura).
  - **Non scrivere un'altra formula di forza e non confrontare una potenza con un livello.** `rosterLevel`/`squadLevel`/`teamLevel`/`matchLevel` (media dei 7 titolari, 3 handler e 4 cutter, con `LINE_REF` per le due linee) restano il LIVELLO con cui si costruiscono le rose (`TEAM[n].power`, `US_TEAM.power`, `LN_BY.p`, `OVR_POW` sono livelli: l'ultima taratura di rose e Overall), si generano i giovani e si misurano crescita (`carGrowK`, `potRef`), mercato e ritiri. Una forza statica senza rosa (club inventati, `m.power`) si porta alla scala della potenza con `PW_LV`.
  - Chi sta in entrambe le linee rende `DBL_PEN` in meno sia nella partita giocata (`applyForm(dbl)`) sia in quella simulata, e la fatica dopo la partita segue `fatShare` (quota di mete giocate); la condizione pesa `COND_PEN` in entrambe. `DBL_PEN` e `PW_MY` sono tarati con le carriere simulate (punti fissi G1-G6): se li tocchi, o tocchi la formula, rimisura con `node tools/test-bilanci.js`.
- **Potenziali** (`30-carriera/29-potenziali.js`):
  - Ogni giocatore generato con un potenziale (mercato, vivaio, provino, giovani delle squadre del computer, rimpiazzi) passa da `potDraw`/`potB` con il riferimento di `potRef`, mai da `squadPower()` più un numero a caso: era la spirale che faceva salire ogni rosa da sola.
  - Gli adulti usano `adultPot`, i giocatori veri italiani `realGap` in `realRoster`, con la fascia che fino a 23 anni viene soprattutto dalla precocità rispetto ai coetanei (`realPrec`/`precMix`, `30-carriera/32-precocita.js`: le proporzioni delle fasce non cambiano, non sostituirla con un'estrazione a caso).
  - La crescita è tarata con carriere simulate (`TRAIN_K`, `XP_RATE`, `lvlF`, `srGrowK`, `LEAD_K`): se la tocchi, rimisura. Ogni crescita dei tuoi giocatori in carriera passa da `carGrowK()` (già dentro `trainMul`; per l'esperienza `matchGrowth(0,carGrowK())`).
  - Nella serie più alta di un campionato con posti europei (`euTier()`) freno e mercato guardano anche il livello europeo (`euTop()`, `EU_GAP`): un campionato nuovo con posti EUCF entra da solo se ha `eu` in `LN_DEF`.
- **Revisione Overall 2026** (`30-carriera/00-dati-ovr-2026.js` generato dal foglio di revisione, `00-ovr-2026.js`, `38-ovr/`, metodo in `docs/OVERALL-2026.md`):
  - Chi è in `OVR_2026` ha l'Overall esatto, fuori da calibrazioni e tetti (fino a 97). Non si ritoccano a mano le righe generate: le modifiche volute stanno in `OVR_OUT`/`OVR_FORCE`/`OVR_ADD`/`OVR_PART`.
  - La forza di un club del foglio si sposta con `OVR_SHIFT`: un intero sommato solo alle righe con affidabilità bassa (stimate dalla forza del club); niente per la media e per l'alta, né ai forzati né agli aggiunti. Un giocatore con riscontri individuali forti tiene il suo valore qualunque sia la squadra (`tools/test-ovr.js` lo controlla).
  - Il rendimento a EUCF e WUCC (europei e italiani) o ai Nationals (Fantasy, USA) ritocca i giocatori stimati con `OVR_ADJ` (`30-carriera/00-ovr-eventi.js`, generato dai portali, non a mano); uno stimato non supera `OVR_CAP_EST` (90) per scarto o ritocco.
  - La gerarchia dei club non si conserva per inerzia: chi gioca gli eventi maggiori è di norma più forte di chi non li gioca, e una serie più alta di una più bassa (`LN_POW_FIX`, e `US_POW_FIX` in `35-usa/00-forza-club.js` per i club fuori dal foglio); metodo in `docs/OVERALL-2026.md`, punto 10.
  - Dopo ogni cambio ai dati o a queste liste: `node tools/test-ovr.js --calcola` e incolla `OVR_POW` (il livello dei 7 titolari dichiarato per i club del foglio deve coincidere con quello delle rose; la prova `tools/test-ovr.js`, in `npm test`, lo controlla).
  - Dei giocatori reali entrano solo nome, ruolo, età e Overall (mai date di nascita). Le rose dei club del foglio arrivano a `SQ_MAX` (28) senza riempitivi; i doppi club stanno solo in Europa (`OVR_DUAL_US`); la rosa che parte tua si costruisce come quella delle avversarie (nessun abbassamento di partenza: non esiste più l'opzione `low`) e ha il loro Overall esatto, come controlla `tools/test-ovr.js`.
- **Punti fissi del bilanciamento** (`tools/bilanci/punti-fissi.js`, prova `npm run bilanci` = `tools/test-bilanci.js`):
  - Economia di tutti i campionati: nessuno in rosso senza spendere; vertice con tutto al massimo in attivo; metà classifica in pari; vertice 1-2 acquisti a stagione, non di più; rose lunghe ridotte a 16 senza guadagni eccessivi.
  - Crescita dalla Serie C: in Serie A entro la 6ª stagione, scudetto di solito all'8ª-10ª giocando bene, mai troppo presto, niente fughe. Negli altri campionati i ritmi possono essere diversi, ma nessuna fuga oltre 8 punti sopra la migliore delle altre (G6).
  - **Ogni modifica a Overall, economia, strutture, staff, mercato o crescita va provata con `node tools/test-bilanci.js --se-serve origin/main` prima di consegnare** (la verifica di GitHub la lancia da sola sulle pull request che toccano i file elencati in `files`). Se non li rispetta si corregge la modifica; le soglie si cambiano solo se viene chiesto esplicitamente di rendere il gioco più facile o più difficile, scrivendo il motivo nel commento. Uno strumento nuovo che tocca questi equilibri va aggiunto a `files`.
- **Costanti del motore**: sono tarate con i test (`tools/test-sim.js`). Se due modifiche toccano la stessa meccanica (stanchezza, precisione, IA), dopo l'unione i numeri vanno rimisurati, non sommati alla cieca.

## Interfaccia

- **Schermate**: ogni schermata nuova va in `SCREENS` e in `showScreen()`; gli `id` degli elementi sono unici in tutto il gioco (lo controlla `npm run check`).
- **Dimensioni dello schermo**: l'interfaccia si adatta con `resize()` (`--ui`, `--bz`, `html[data-big]`, scelta del giocatore `SETT.uz`). Un elemento fuori da `.screen`/`.overlay` che deve crescere sugli schermi grandi va aggiunto all'elenco `zoom:var(--ui)` di `05-schermi-grandi-e-tocco.css` oppure deve usare `--bz` (come i pulsanti di gioco).
- **Rotazione e tocchi**: il build trasforma il CSS per la rotazione automatica; per le coordinate dei tocchi si usa `layRect(el)` al posto di `getBoundingClientRect()`.
- **Margini sicuri**: per gli angoli arrotondati dei telefoni non si scrive `env(safe-area-inset-*)` a mano: si usano `--sal`/`--sar`/`--sat`/`--sab` (sinistra, destra, alto, basso del gioco), che in rotazione (`html.rotp`) vengono rimappate sui lati fisici giusti. Il ritaglio dello schermo (isola dinamica, notch) si legge in `05-rotazione.js` (`cutApply` → `html[data-cut]`, `cutSide`): si riserva solo quel lato, e la colonna «Automatica» va dall'altra parte.
- **Colonna `#rail`**: può stare a sinistra o a destra (`html[data-rail]`, regole in `10-carriera-ui.css`): ciò che si aggancia a `--rail` funziona per entrambi i lati, mai un `left:` a mano.
- **Interfaccia ingrandita**: con `--ui` le media query non vedono lo spazio vero. Per le disposizioni compatte si usa `html[data-ew]` (`'s'` sotto 800 px, `'xs'` sotto 640 px di larghezza utile, da `resize()`), con le regole in `12-leggibilita.css`. I testi, anche quelli lunghi, crescono con `--ui` come il resto (niente tetti fissi: il testo restava piccolo mentre le caselle crescevano).
- **Dimensione del testo su iOS**: `html{text-size-adjust:100%}` (in `12-leggibilita.css`) non va tolto: senza, iOS Safari in orizzontale ingrandisce da solo i testi lunghi. Con quella percentuale WebKit però perde lo zoom sul carattere (sull'iPad le caselle crescevano e il testo no): `tszFix` (`01-base-camera.js`) lo misura e, se serve, scrive `--tsa` (la percentuale che lo compensa, letta da `.screen`, `.overlay` e `#cshell`). Non toccare il sistema a mano e controlla i cambiamenti dell'ingrandimento anche con `tools/test-layout.js` (iPad compreso).
- **Spiegazioni lunghe**: non sono paragrafi fissi: `infoB(k)`+`infoX(k,html)` (`24-guscio-carriera.js`) le mettono dietro un pulsante «i».
- **Fine stagione**: ogni campionato passa da `endSeasonHTML` (`25-fine-stagione.js`); il tasto `#eReset` deve restare ben visibile in cima.
- In partita la barra mostra le sigle (`teamAbbr`).
- **HUD della partita sulla griglia dei pixel**: le scritte a pixel sopra il campo (barra, stall, suggerimenti, pulsanti di `#ctrl`, `#skip`) si misurano in multipli di `--gpz` (8 per `UFPress` e `UFTiny`), con `font-size-adjust:none`; bordi di 1 `--gpz`. Una misura in px fissi rimette pixel di grandezza diversa da quelli del campo (`27-hud-pixel.css`).
- **Omini**: i rettangoli di `puppet` passano da `psShade` (`02c-ombre-16bit.js`); le ombre non si dipingono a mano con un colore piu' scuro (diventerebbe un materiale a parte con i suoi bordi): si usano `PS_FAR`/`PS_NEAR` e il gruppo.
- **Conferme e stati**: un'azione importante o irreversibile (acquisto, spesa grossa) passa da `askConfirm` (`26-conferma.js`) con un riepilogo, mai da `confirm()`; per le cancellazioni resta `armed()` (doppio tocco). Una finestra nuova con classe `overlay` riceve da sola fuoco e ruolo (`27-finestre.js`); se deve chiudersi con Esc va in `ESC_CLOSE`. Gli stati comuni dei controlli stanno in `13-sistema-ui.css`.
- In Allena una seduta parte solo con «Avvia» (`trPick`). Nella Posta «Chiudi» non segna come letto (`a.seen`); l'apertura automatica usa `a.sh` (già mostrato). Nella Posta vanno solo gli avvisi con una scelta (`act`), quelli importanti (`imp`, da `alertAdd(...,{imp:1})`) e i tipi di `AL_POSTA` (`alPosta`, `30-carriera/09b-posta-notizie.js`); tutto il resto è una notizia: scheda Notizie, riepilogo in `todoItems()` (`newsSummary`), niente campanella. Un avviso con `full` non entra in `SV.news` (le notizie del club in Società): si vede nella scheda del giocatore (`pNewsHTML`).
- **Impostazioni**: quattro schede piatte (`setSView('game'|'ctl'|'scr'|'adv')`, `14-impostazioni.css`). Un'opzione nuova del gioco va nella scheda giusta: un acceso/spento come interruttore `.swr` (`role="switch"`, stato in `syncToggles`), una scelta fra più valori come `.seg`. Le Opzioni della carriera (`#opts`) tengono solo ciò che riguarda la carriera.
- **Cornice della carriera** (`04b-guscio-carriera.html`, `24-guscio-carriera.js`): una schermata di carriera nuova entra in `CSC` (e nella colonna `#rail`) e ha la classe `csc` per lasciare lo spazio alla barra in alto e alla colonna. Niente pulsanti «‹ Indietro» (si usa la colonna); le azioni globali (Guida, Tutorial, Opzioni, Menu principale) stanno nel menu `#cmenu`. Ciò che richiede attenzione va in `todoItems()` («Questa settimana»), non in barre che scorrono. Un pannello a tutto schermo aperto da una schermata `csc` (come `.pcov`) deve lasciare libere la barra e la colonna (`top:var(--ctop);left:var(--rail)`).
- **Prove dell'interfaccia**: `npm test` comprende la prova di impaginazione (`tools/test-layout.js`, 5 risoluzioni): una schermata nuova della carriera va aggiunta al suo percorso. I test del browser aprono Opzioni/Guida/Tutorial/Menu principale con `menu(id)`.
- **Moneta**: il testo «crediti»/«credito» nelle schermate è sostituito automaticamente dalla moneta pixelata (`20-ui/14-moneta-crediti.js`, osservatore del DOM). Non aggiungere monete a mano; nei `title` e negli `aria-label` usa invece parole come «saldo» o «fondi».

## Testi, tutorial e ritratti

- **Testi**: la guida del gioco (`src/20-html/07-guida.html`), il tutorial, i Primi passi e `docs/CHANGELOG.md` descrivono ciò che c'è davvero: aggiornali con la modifica. Tono, lunghezze e parole fisse (meta, pull, stall, intervallo, Overall…) sono in `docs/STILE-TESTI.md`: leggilo prima di scrivere una scritta nuova.
- **Tutorial completo** (`50-schermate/20-tutorial-contenuti.js` = dati `TUT`, `21-tutorial.js` = finestra `#tut`):
  - Una funzione o regola nuova che il giocatore deve conoscere entra come riga di una lezione esistente nel capitolo giusto, non come lezione nuova: il tutorial è corto di proposito (6 capitoli, circa 26 lezioni). Se due lezioni si uniscono resta l'`id` della prima e si aggiorna `TIP_LES`.
  - Il tutorial spiega che cosa il giocatore vede e fa (schermate, scelte, effetti che nota), non i retroscena del bilanciamento: niente percentuali di taratura, formule o il perché di una regola (i numeri solo quando servono a scegliere, come quanto rende una struttura). I dettagli stanno nella guida e nei documenti.
  - Gli `id` delle lezioni non si cambiano (progresso salvato in `ultimate-tutorial`, collegamenti dei fumetti in `TIP_LES`). Un nuovo fumetto di `TIPS` va collegato a una lezione con `TIP_LES`. Una schermata che nasconde i fumetti va in `overlayBusy()`.
- **Primi passi in partita** (`PP_STEPS`, `14-primi-passi.js`): il tutorial del gameplay si fa giocando, con prove che si chiudono quando il giocatore fa davvero il gesto (`done`), non con schede da leggere; una meccanica nuova di partita entra lì come prova. `G.stallK` (rallenta lo stall del giocatore durante le prove) vale 1 fuori dal tutorial e si rimette a 1 in `newGame()`.
- **Ritratti** (`30-carriera/10b-avatar-dati.js` generato da `tools/avatar-da-zip.py`, `10c-avatar-retro.js`):
  - I giocatori veri del foglio Overall (848) hanno un ritratto disegnato a mano nel foglio di sprite; tutti gli altri sono disegnati nello stesso stile da `avGrid(avLook(p))`.
  - Chi disegna un volto passa sempre da `avatar(p,px)` con `full`/`label`/`name`, `gen`, `f` e, se lo conosce, `club` (la maglia): un generato o una giocatrice non prende mai un ritratto per omonimia, per questo `gen`/`f` vanno passati.
  - Con `f` il volto è femminile (mascella stretta, ciglia, labbra rosa, mento a V, acconciature che incorniciano il viso: `bob`/`bangs`/`curtain`/`bun`/coda/`pixie`, sobrie: niente colori o tagli vistosi), sempre nello stesso stile.
  - Non rigenerare a mano il file dei dati; i ritratti nuovi arrivano dal pacchetto originale (nel repository entrano solo nome, cognome e colore della maglia: niente foto, link o fonti).

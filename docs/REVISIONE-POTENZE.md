# Revisione delle potenze di squadra e degli Overall (formula unica)

Documento di lavoro della revisione: formula, regole, effetto su tutte le squadre e giocatori modificati. Il metodo degli Overall del foglio è in `docs/OVERALL-2026.md`.

## Formula

**Potenza = 60% × media dei 7 migliori + 35% × media dei giocatori dall'8º al 14º + 5% × media dal 15º al 21º**, con i giocatori ordinati per Overall decrescente e senza vincoli di ruolo (`rosterPower` / `powerOfVals`, `src/30-js/10-sim/12-allenamenti-rose.js`).

- Oltre il 21º giocatore nessuno conta: chi sta in fondo alla rosa non abbassa la potenza.
- Rose corte: ogni posto vuoto vale il giocatore più debole che c'è meno 8 punti (almeno 25). La penalità è moderata e mai un vantaggio: una rosa corta non rende mai più della stessa con dei rincalzi.
- Una sola funzione per tutte le squadre (Italia, Europa, USA), per carriera, simulazioni, classifiche, anteprime, mercato tra i club, economia ed ultimate. Per la tua squadra i valori sono quelli di oggi: infortunati fuori, `DBL_PEN` (-7) a chi sta in entrambe le linee (che occupa due dei 14 posti delle linee) e, in partita simulata, `COND_PEN` per la condizione. Le penalità dinamiche restano.
- Il **livello dei 7 titolari** (`rosterLevel`: 3 handler e 4 cutter) resta come riferimento per costruire le rose, generare i giovani e misurare crescita e mercato: non è una potenza. Le forze statiche dei club (`TEAM[n].power`, `US_TEAM.power`, `LN_BY.p`, `OVR_POW`) sono livelli: la potenza si calcola sempre dalla rosa. Per le poche forze statiche usate senza rosa c'è la conversione `PW_LV` (2 punti).
- Taratura: con la formula unica le carriere simulate (punti fissi G1-G6) perdevano circa 1,5 punti di forza nelle Serie A; metà si recupera facendo occupare due posti a chi gioca in entrambe le linee e 0,6 punti (`PW_MY`) sono l'unica costante aggiunta.

## Regole della revisione (per tutte le squadre)

1. **Non si mantiene la gerarchia di prima.** Chi gioca gli eventi più importanti e prestigiosi (WUCC, EUCF, Nationals USA) è di norma più forte di chi non li gioca. Per i club con risultati internazionali si è calcolato un rating dai punteggi veri: WUCC 2026 (77 partite Open tra 24 club di 4 continenti: Revolver 9,2, PoNY 6,4, Chicago Machine 4,5, La Fotta 4,2, GOAT 4,0, Mooncatchers 3,2, Clapham 3,1…) ed EUCF 2026 (55 partite). Potenza attesa = 84,3 + 0,83 × rating (regressione sui 16 club presenti nel gioco), più 1,5 punti di prestigio per chi gioca. Dove il valore è a bassa affidabilità e la potenza era sotto, si è alzato; dove i giocatori hanno riscontri individuali (affidabilità alta) non si è toccato nulla, anche se la squadra risulta sopra l'atteso (Mooncatchers, Clapham, Wall City, Tchac).
2. **Valori bloccati**: affidabilità alta (111 giocatori), forzati (Puppi, Martini, Spiritigliozzi) e aggiunti a mano (Mazzo, Ragusa) non cambiano (lo controlla `tools/test-ovr.js`). Un giocatore stimato non supera 90 per effetto di uno scarto o di un ritocco (`OVR_CAP_EST`), salvo valore già più alto nel foglio.
3. **Scarto di club** (solo affidabilità bassa, `OVR_SHIFT`): Gentle Open +7, Chevron +7, NLSU +7, Cotarica Grandes +3, Toronto GOAT +4, Bad Skid +5, New York PoNY +3, San Francisco Revolver +5.
4. **Ritocco da rendimento** (`OVR_ADJ`, da -2 a +4, affidabilità media solo da 2 punti): club europei e italiani con EUCF e WUCC 2026; club USA con le statistiche Fantasy dei Nationals 2026 (punti a partita e costo di prima del torneo, uguali per tutti i club).
5. **Club fuori dal foglio** (`LN_POW_FIX`, `US_POW_FIX`): Freezzz Beezzz e Heidees salgono (EUCF e WUCC); Mephisto (WUCC e Nationals), Furious George e Doublewide (Nationals) escono dal fondo della classifica dei qualificati; una serie più alta è di norma più forte di una più bassa: Éclipse Solaire (3º livello belga, 10 punti sopra l'ultimo del 2º), Helgtre Open, Bremen Ultimate e Gummibärchen scendono sotto il tetto della serie sopra (meno di 0,5 sotto il club più debole).
6. **Serie italiane**: nessun ritocco ai giocatori stimati. Le statistiche di Serie A 2026 e quelle delle nazionali giovanili (WU24 2023/2025, WJUC 2024/2026, EYUC) non danno scarti coerenti: la pendenza tra rendimento e Overall cambia da una squadra all'altra e ha segno opposto in una; le Serie B e C si costruiscono già dalle statistiche dei singoli.

## Effetto su tutte le squadre

Prima = forza con la formula precedente (media dei 3 handler e 4 cutter migliori) nello stato di partenza di questa revisione; dopo = potenza con la formula unica e con gli Overall rivisti. La tabella completa di tutte le squadre è in fondo.

### Italia, Serie A

| # | Squadra | Prima | Dopo | Rosa |
|---|---|---|---|---|
| 1 | BFD La Fotta Offence | 89,9 | **88** | 14 |
| 2 | BFD La Fotta Defense | 88,9 | **86,1** | 14 |
| 3 | Cotarica Runners | 87,3 | **85,3** | 15 |
| 4 | Cotarica Grandes | 86,3 | **85,1** | 16 |
| 5 | One Tribe | 84,8 | **84,9** | 20 |
| 6 | DiscoBolo | 84 | **83,5** | 19 |
| 7 | CUS Padova Barbastreji | 83,9 | **82,5** | 19 |
| 8 | 360 Milano | 81,1 | **78,7** | 20 |
| 9 | BFD Redbulls | 80,5 | **77,3** | 23 |
| 10 | One Tribe Next Gen | 79,5 | **76,7** | 16 |
| 11 | UFO (A) | 79,4 | **75,5** | 16 |
| 12 | Donkey Divers (A) | 78 | **75,3** | 16 |
| 13 | RAMS BLUE | 78,2 | **74,3** | 15 |
| 14 | METACARPI | 76,2 | **73,9** | 18 |
| 15 | AUT BeeFree | 76,1 | **72,8** | 19 |
| 16 | BFD Zero51 | 74,6 | **70,7** | 14 |

### Europa

| # | Squadra | Prima | Dopo | Rosa |
|---|---|---|---|---|
| 1 | Mooncatchers | 91,6 | **89,4** | 27 |
| 2 | Clapham Ultimate | 90,1 | **88,6** | 28 |
| 3 | Wall City | 91,1 | **88,4** | 28 |
| 4 | Tchac | 89,7 | **87,1** | 27 |
| 5 | Gentle Open | 87,5 | **86,9** | 28 |
| 6 | Freezzz Beezzz one | 85,5 | **84,9** | 20 |
| 7 | NLSU | 85,3 | **83,9** | 26 |
| 8 | Chevron Action Flash | 87,1 | **83,7** | 28 |
| 9 | Bad Skid | 82,5 | **83** | 28 |
| 10 | Jetset Open | 82 | **81,8** | 16 |
| 11 | Heidees | 82 | **81,1** | 20 |
| 12 | Gentle Open Too | 77 | **75,4** | 16 |
| 13 | Stade Bordelais | 75,6 | **74,5** | 16 |
| 14 | Freezgo | 74,8 | **73,7** | 16 |
| 15 | Monkey | 74 | **72,9** | 16 |
| 16 | M.U.C. | 73,9 | **71,6** | 16 |

### USA, i 16 club dei Nationals

| # | Squadra | Prima | Dopo | Rosa |
|---|---|---|---|---|
| 1 | New York PoNY | 92,2 | **90,9** | 26 |
| 2 | San Francisco Revolver | 91,6 | **90,3** | 26 |
| 3 | Boston DiG | 91,6 | **89,6** | 23 |
| 4 | Raleigh Ring of Fire | 89,6 | **89,2** | 27 |
| 5 | Portland Rhino Slam! | 90,1 | **89,1** | 26 |
| 6 | Chicago Machine | 91,1 | **88,8** | 26 |
| 7 | Toronto GOAT | 86,4 | **87,1** | 24 |
| 8 | Minneapolis Sub Zero | 88,3 | **86,1** | 25 |
| 9 | Philadelphia Pacmen | 87 | **85,4** | 25 |
| 10 | Atlanta Chain Lightning | 88,3 | **85,3** | 26 |
| 11 | Washington DC Truck Stop | 87,5 | **85** | 22 |
| 12 | Seattle Sockeye | 86,2 | **84,2** | 26 |
| 13 | Denver Johnny Bravo | 86,5 | **83,6** | 25 |
| 14 | Vancouver Furious George | 84,7 | **82,9** | 20 |
| 15 | Montréal Mephisto | 83,8 | **82,7** | 20 |
| 16 | Austin Doublewide | 84,3 | **82,6** | 20 |

## Overall modificati (club del foglio)

Su 111 giocatori con affidabilità **alta** ne sono toccati 0; su 93 con affidabilità **media** 19; su 642 con affidabilità **bassa** 239. Forzati 3 e aggiunti a mano 2: nessuno toccato.

| Club | Giocatore | Affid. | Prima → dopo | Motivo |
|---|---|---|---|---|
| Atlanta Chain Lightning | Michael Poe | bassa | 90 → 88 | rendimento -2 |
| Atlanta Chain Lightning | Stefan McCall | bassa | 89 → 87 | rendimento -2 |
| Atlanta Chain Lightning | Jason Evans | bassa | 87 → 85 | rendimento -2 |
| Atlanta Chain Lightning | Michael-Angelo Humm | bassa | 74 → 76 | rendimento +2 |
| Atlanta Chain Lightning | Liam Haberfield | bassa | 73 → 75 | rendimento +2 |
| Bad Skid | Holger Beuttenmüller | bassa | 84 → 89 | scarto di club +5 |
| Bad Skid | Steffen Döscher | bassa | 83 → 86 | scarto di club +5 · rendimento -2 |
| Bad Skid | Antonino Bonfilgio | bassa | 80 → 85 | scarto di club +5 |
| Bad Skid | Severin Kücholl | bassa | 79 → 84 | scarto di club +5 |
| Bad Skid | Filip Stepniak | bassa | 78 → 83 | scarto di club +5 |
| Bad Skid | Samuel Beuttenmüller | bassa | 76 → 81 | scarto di club +5 |
| Bad Skid | Pascal Schwan | bassa | 74 → 79 | scarto di club +5 |
| Bad Skid | Benjamin Schenk | bassa | 75 → 78 | scarto di club +5 · rendimento -2 |
| Bad Skid | Arne Flügel | bassa | 73 → 78 | scarto di club +5 |
| Bad Skid | Mohammad Alsaleh | bassa | 72 → 77 | scarto di club +5 |
| Bad Skid | Tim Stuhlert | bassa | 70 → 75 | scarto di club +5 |
| Bad Skid | Marc Pritsch | bassa | 71 → 74 | scarto di club +5 · rendimento -2 |
| Bad Skid | Tobias Herre | bassa | 69 → 74 | scarto di club +5 |
| Bad Skid | Jannik Volk | bassa | 68 → 71 | scarto di club +5 · rendimento -2 |
| Bad Skid | Benjamin Schlechter | bassa | 67 → 71 | scarto di club +5 · rendimento -1 |
| Bad Skid | Elias Keppele | bassa | 64 → 69 | scarto di club +5 |
| Bad Skid | Felix Meyer | bassa | 62 → 69 | scarto di club +5 · rendimento +2 |
| Bad Skid | Maximilian Olbert | bassa | 65 → 68 | scarto di club +5 · rendimento -2 |
| Bad Skid | Jörg Reinert | bassa | 63 → 68 | scarto di club +5 |
| Bad Skid | Christoph Schäuffele | bassa | 61 → 66 | scarto di club +5 |
| Bad Skid | Kevin Schanz | bassa | 59 → 66 | scarto di club +5 · rendimento +2 |
| Bad Skid | Jonathan Schall | bassa | 58 → 66 | scarto di club +5 · rendimento +3 |
| Bad Skid | Marvin Waldvogel | bassa | 60 → 65 | scarto di club +5 |
| Bad Skid | Johannes Schlechter | bassa | 56 → 64 | scarto di club +5 · rendimento +3 |
| Bad Skid | Jonah Beiglböck | bassa | 57 → 62 | scarto di club +5 |
| Bad Skid | Lennart Vollmer | bassa | 53 → 62 | scarto di club +5 · rendimento +4 |
| Bad Skid | Leo Grimmig | bassa | 51 → 60 | scarto di club +5 · rendimento +4 |
| Bad Skid | Michael Beuttenmüller | bassa | 54 → 59 | scarto di club +5 |
| Bad Skid | Leon Bohn | bassa | 52 → 57 | scarto di club +5 |
| Bad Skid | Simon Hiller | bassa | 47 → 56 | scarto di club +5 · rendimento +4 |
| Bad Skid | Jonas Hager | bassa | 50 → 55 | scarto di club +5 |
| Bad Skid | Julius Schenk | bassa | 49 → 54 | scarto di club +5 |
| Bad Skid | Matthias Weberruß | bassa | 48 → 53 | scarto di club +5 |
| BFD La Fotta Offence | Kaïs Mathè | media | 85 → 88 | rendimento +3 |
| Boston DiG | Pawel Janas | media | 89 → 87 | rendimento -2 |
| Boston DiG | Quentin Bonnaud | bassa | 87 → 85 | rendimento -2 |
| Chevron Action Flash | Andrew Sweetnam | bassa | 85 → 90 | scarto di club +7 · rendimento -2 |
| Chevron Action Flash | Ethan Morrell | bassa | 85 → 90 | scarto di club +7 · rendimento -2 |
| Chevron Action Flash | Cameron Weir | bassa | 83 → 88 | scarto di club +7 · rendimento -2 |
| Chevron Action Flash | Sam Criddle | bassa | 82 → 87 | scarto di club +7 · rendimento -2 |
| Chevron Action Flash | Will Jackson | bassa | 81 → 86 | scarto di club +7 · rendimento -2 |
| Chevron Action Flash | Rhodri Williams | bassa | 78 → 85 | scarto di club +7 |
| Chevron Action Flash | Thomas Oliver | bassa | 79 → 84 | scarto di club +7 · rendimento -2 |
| Chevron Action Flash | Marcus Kalsi Stølen | bassa | 77 → 82 | scarto di club +7 · rendimento -2 |
| Chevron Action Flash | Rupert Pantling | bassa | 75 → 82 | scarto di club +7 |
| Chevron Action Flash | Kody Edwards | bassa | 74 → 81 | scarto di club +7 |
| Chevron Action Flash | Seb Allen | bassa | 73 → 80 | scarto di club +7 |
| Chevron Action Flash | Robert Pantling | bassa | 72 → 79 | scarto di club +7 |
| Chevron Action Flash | Edward Graham | bassa | 71 → 76 | scarto di club +7 · rendimento -2 |
| Chevron Action Flash | Tom Bennett | bassa | 70 → 75 | scarto di club +7 · rendimento -2 |
| Chevron Action Flash | Ben Tennant | bassa | 69 → 75 | scarto di club +7 · rendimento -1 |
| Chevron Action Flash | Ben Burak | bassa | 68 → 74 | scarto di club +7 · rendimento -1 |
| Chevron Action Flash | Ben Tempest | bassa | 67 → 74 | scarto di club +7 |
| Chevron Action Flash | Robbie Haines | bassa | 66 → 73 | scarto di club +7 |
| Chevron Action Flash | Declan Cartwright | bassa | 64 → 72 | scarto di club +7 · rendimento +1 |
| Chevron Action Flash | Ben Wilson | bassa | 63 → 72 | scarto di club +7 · rendimento +2 |
| Chevron Action Flash | Seb Hart | bassa | 61 → 72 | scarto di club +7 · rendimento +4 |
| Chevron Action Flash | Josh Hanham | bassa | 62 → 69 | scarto di club +7 |
| Chevron Action Flash | Andrew Turner | bassa | 59 → 69 | scarto di club +7 · rendimento +3 |
| Chevron Action Flash | Tom Hodgett | bassa | 58 → 69 | scarto di club +7 · rendimento +4 |
| Chevron Action Flash | Alex Hately | bassa | 57 → 68 | scarto di club +7 · rendimento +4 |
| Chevron Action Flash | Matthew Beavan | bassa | 60 → 67 | scarto di club +7 |
| Chevron Action Flash | Steve Kolthammer | bassa | 56 → 67 | scarto di club +7 · rendimento +4 |
| Chevron Action Flash | Issa Dualeh | bassa | 55 → 66 | scarto di club +7 · rendimento +4 |
| Chevron Action Flash | Hari Tidswell | bassa | 53 → 64 | scarto di club +7 · rendimento +4 |
| Chevron Action Flash | Luke Haywood | bassa | 52 → 59 | scarto di club +7 |
| Chicago Machine | Paul Arters | media | 89 → 87 | rendimento -2 |
| Chicago Machine | Xavier Payne | media | 86 → 84 | rendimento -2 |
| Clapham Ultimate | Josh Awcock | media | 91 → 89 | rendimento -2 |
| Clapham Ultimate | Felix Martin | media | 90 → 88 | rendimento -2 |
| Clapham Ultimate | Rana Sarin | bassa | 84 → 83 | rendimento -1 |
| Clapham Ultimate | Oscar Modiano | bassa | 83 → 82 | rendimento -1 |
| Clapham Ultimate | Neil McCulloch | bassa | 79 → 80 | rendimento +1 |
| Clapham Ultimate | Ross Nugent | bassa | 76 → 78 | rendimento +2 |
| Clapham Ultimate | Charlie Butt | bassa | 74 → 77 | rendimento +3 |
| Clapham Ultimate | Steven Chang | bassa | 73 → 77 | rendimento +4 |
| Cotarica Grandes | Lorenzo Turci | bassa | 89 → 90 | scarto di club +3 · rendimento -2 |
| Cotarica Grandes | Nicolò Mazzola | bassa | 85 → 88 | scarto di club +3 |
| Cotarica Grandes | Nicolò Zavattini | bassa | 84 → 87 | scarto di club +3 |
| Cotarica Grandes | Arturo Benzi | bassa | 83 → 85 | scarto di club +3 · rendimento -1 |
| Cotarica Grandes | Nicolò Bellofiore | bassa | 82 → 85 | scarto di club +3 |
| Cotarica Grandes | Francesco Sbrighi | bassa | 81 → 84 | scarto di club +3 |
| Cotarica Grandes | Alberto Pompizii | bassa | 79 → 84 | scarto di club +3 · rendimento +2 |
| Cotarica Grandes | Alessandro Pari | bassa | 77 → 83 | scarto di club +3 · rendimento +3 |
| Cotarica Grandes | Luca Contini | bassa | 74 → 81 | scarto di club +3 · rendimento +4 |
| Cotarica Grandes | Stefano Diotallevi | bassa | 76 → 79 | scarto di club +3 |
| Cotarica Grandes | Giuseppe Farruggio | bassa | 75 → 78 | scarto di club +3 |
| Cotarica Runners | Andrea Bulgarelli | bassa | 86 → 87 | rendimento +1 |
| Denver Johnny Bravo | Quinn Finer | media | 91 → 89 | rendimento -2 |
| Denver Johnny Bravo | Jonathan Nethercutt | media | 89 → 87 | rendimento -2 |
| Denver Johnny Bravo | Jordan Kerr | bassa | 88 → 86 | rendimento -2 |
| Gentle Open | Staf Decraene | bassa | 86 → 90 | scarto di club +7 · rendimento -2 |
| Gentle Open | Emiel De Rieck | bassa | 85 → 90 | scarto di club +7 · rendimento -2 |
| Gentle Open | Adrian Collantes | bassa | 84 → 89 | scarto di club +7 · rendimento -2 |
| Gentle Open | Stern Ongenaet | bassa | 83 → 89 | scarto di club +7 · rendimento -1 |
| Gentle Open | Arthur Fieuws | bassa | 81 → 86 | scarto di club +7 · rendimento -2 |
| Gentle Open | Bono Vandamme | bassa | 78 → 86 | scarto di club +7 · rendimento +1 |
| Gentle Open | Han Pisano | bassa | 79 → 85 | scarto di club +7 · rendimento -1 |
| Gentle Open | Aäron Vlieghe | bassa | 79 → 84 | scarto di club +7 · rendimento -2 |
| Gentle Open | Wolf Oosterlinck | bassa | 75 → 84 | scarto di club +7 · rendimento +2 |
| Gentle Open | Benjamin Zwarts | bassa | 77 → 83 | scarto di club +7 · rendimento -1 |
| Gentle Open | Dante Simoens | bassa | 77 → 83 | scarto di club +7 · rendimento -1 |
| Gentle Open | Sebastiaan Moons | bassa | 76 → 83 | scarto di club +7 |
| Gentle Open | Leon Pannemans | bassa | 74 → 82 | scarto di club +7 · rendimento +1 |
| Gentle Open | Lorenz Jordi | bassa | 75 → 81 | scarto di club +7 · rendimento -1 |
| Gentle Open | Louis Corthout | bassa | 73 → 80 | scarto di club +7 |
| Gentle Open | Stan Declerck | bassa | 73 → 80 | scarto di club +7 |
| Gentle Open | Mathias Middernacht | bassa | 72 → 80 | scarto di club +7 · rendimento +1 |
| Gentle Open | Broes Cottyn | bassa | 70 → 80 | scarto di club +7 · rendimento +3 |
| Gentle Open | Benjamin Vereecken | bassa | 69 → 80 | scarto di club +7 · rendimento +4 |
| Gentle Open | Kasper Kindekens | bassa | 68 → 79 | scarto di club +7 · rendimento +4 |
| Gentle Open | Guiseppe Depotter | bassa | 71 → 78 | scarto di club +7 |
| Gentle Open | Samir Boumalal | bassa | 71 → 78 | scarto di club +7 |
| Gentle Open | Jelle Vandermoere | bassa | 67 → 78 | scarto di club +7 · rendimento +4 |
| Gentle Open | Maarten Vanlerberghe | bassa | 66 → 77 | scarto di club +7 · rendimento +4 |
| Gentle Open | Sam Ds | bassa | 69 → 76 | scarto di club +7 |
| Gentle Open | Roel Dekoninck | bassa | 64 → 75 | scarto di club +7 · rendimento +4 |
| Gentle Open | Artuur Desloover | bassa | 67 → 74 | scarto di club +7 |
| Gentle Open | Nathan Deman | bassa | 65 → 72 | scarto di club +7 |
| Gentle Open | Robin De Rocker | bassa | 65 → 72 | scarto di club +7 |
| Minneapolis Sub Zero | Paul Krenik | bassa | 88 → 90 | rendimento +2 |
| Minneapolis Sub Zero | Noah Hanson | bassa | 87 → 89 | rendimento +2 |
| Minneapolis Sub Zero | Ryan duSaire | media | 87 → 85 | rendimento -2 |
| Minneapolis Sub Zero | Max Hanscom | bassa | 74 → 76 | rendimento +2 |
| Mooncatchers | Benjamin Jonkers | bassa | 90 → 89 | rendimento -1 |
| Mooncatchers | Diego Nothomb | bassa | 86 → 84 | rendimento -2 |
| Mooncatchers | Arthur Feller | bassa | 85 → 84 | rendimento -1 |
| Mooncatchers | Jérôme Deridder | bassa | 85 → 84 | rendimento -1 |
| Mooncatchers | Matthieu Muller | bassa | 83 → 84 | rendimento +1 |
| Mooncatchers | Andrew Delhaisse | bassa | 82 → 81 | rendimento -1 |
| Mooncatchers | Corentin Schiettecatte | bassa | 80 → 81 | rendimento +1 |
| Mooncatchers | Gregoire Peterkenne | bassa | 79 → 80 | rendimento +1 |
| Mooncatchers | Gaetan Vanden Broeck | bassa | 77 → 80 | rendimento +3 |
| Mooncatchers | John Beeckmans | bassa | 77 → 80 | rendimento +3 |
| Mooncatchers | Nicolas Hoquez | bassa | 76 → 80 | rendimento +4 |
| Mooncatchers | Louis Dawans | bassa | 78 → 79 | rendimento +1 |
| Mooncatchers | Cedric Feller | bassa | 75 → 79 | rendimento +4 |
| New York PoNY | John Randolph | media | 96 → 94 | rendimento -2 |
| New York PoNY | Cameron Wariner | media | 88 → 90 | rendimento +2 |
| New York PoNY | Jimmy Mickle | bassa | 88 → 90 | scarto di club +3 |
| New York PoNY | Samuel Little | bassa | 87 → 90 | scarto di club +3 |
| New York PoNY | Jacob Cowan | bassa | 86 → 90 | scarto di club +3 · rendimento +2 |
| New York PoNY | Vinay Valsaraj | bassa | 86 → 90 | scarto di club +3 · rendimento +2 |
| New York PoNY | Nicholas Whitlock | bassa | 85 → 90 | scarto di club +3 · rendimento +2 |
| New York PoNY | Matt LaBar | bassa | 84 → 87 | scarto di club +3 |
| New York PoNY | Isaac Kaplan | bassa | 84 → 87 | scarto di club +3 |
| New York PoNY | Drew Schnaudigel | bassa | 83 → 86 | scarto di club +3 |
| New York PoNY | Oliver Fay | bassa | 83 → 86 | scarto di club +3 |
| New York PoNY | Joshua Stevens-Stein | bassa | 82 → 85 | scarto di club +3 |
| New York PoNY | Alex Davis | bassa | 82 → 85 | scarto di club +3 |
| New York PoNY | Tristan Yarter | bassa | 81 → 84 | scarto di club +3 |
| New York PoNY | Nima Lhamo | bassa | 80 → 83 | scarto di club +3 |
| New York PoNY | Shashank Alladi | bassa | 79 → 82 | scarto di club +3 |
| New York PoNY | Solomon Rueschemeyer-Bailey | bassa | 79 → 82 | scarto di club +3 |
| New York PoNY | Harper Garvey | bassa | 78 → 81 | scarto di club +3 |
| New York PoNY | Ethan Lieman | bassa | 77 → 80 | scarto di club +3 |
| NLSU | Clément Giffard | bassa | 85 → 90 | scarto di club +7 |
| NLSU | Lucas Bouchon | bassa | 85 → 90 | scarto di club +7 |
| NLSU | Olivier Gibert | bassa | 85 → 90 | scarto di club +7 · rendimento -2 |
| NLSU | Romain Couturier | bassa | 81 → 88 | scarto di club +7 |
| NLSU | Rémy Dauvois | bassa | 82 → 87 | scarto di club +7 · rendimento -2 |
| NLSU | Rapahël Chareix | bassa | 78 → 85 | scarto di club +7 |
| NLSU | Arthur Oudomphong | bassa | 79 → 84 | scarto di club +7 · rendimento -2 |
| NLSU | Raphaël Caudron | bassa | 77 → 82 | scarto di club +7 · rendimento -2 |
| NLSU | Eric Becker-Chagneux | bassa | 75 → 80 | scarto di club +7 · rendimento -2 |
| NLSU | Arthur Negre | bassa | 74 → 80 | scarto di club +7 · rendimento -1 |
| NLSU | Jules Lamare | bassa | 73 → 79 | scarto di club +7 · rendimento -1 |
| NLSU | Roger Michael | bassa | 72 → 77 | scarto di club +7 · rendimento -2 |
| NLSU | Raphaël Chareix | bassa | 71 → 77 | scarto di club +7 · rendimento -1 |
| NLSU | Gaspard Calligaro | bassa | 68 → 77 | scarto di club +7 · rendimento +2 |
| NLSU | Amaury Davy | bassa | 70 → 76 | scarto di club +7 · rendimento -1 |
| NLSU | Benjamin Fenrich | bassa | 69 → 76 | scarto di club +7 |
| NLSU | Célian Martin | bassa | 66 → 73 | scarto di club +7 |
| NLSU | Yoann Cocquebert | bassa | 64 → 72 | scarto di club +7 · rendimento +1 |
| NLSU | Paul Marques | bassa | 63 → 72 | scarto di club +7 · rendimento +2 |
| NLSU | Raphaël Melin | bassa | 62 → 71 | scarto di club +7 · rendimento +2 |
| NLSU | Reiyu Rakotomamonjy | bassa | 59 → 69 | scarto di club +7 · rendimento +3 |
| NLSU | Jules Quinton | bassa | 58 → 69 | scarto di club +7 · rendimento +4 |
| NLSU | Ulysse Rouillard | bassa | 61 → 68 | scarto di club +7 |
| NLSU | Hugo Donatien | bassa | 57 → 68 | scarto di club +7 · rendimento +4 |
| NLSU | Willem Garnier | bassa | 60 → 67 | scarto di club +7 |
| NLSU | Barnabé Earl-Anstee | bassa | 56 → 67 | scarto di club +7 · rendimento +4 |
| Portland Rhino Slam! | Felix Moren | bassa | 85 → 88 | rendimento +3 |
| Portland Rhino Slam! | Alex Hall-Witt | media | 85 → 87 | rendimento +2 |
| Portland Rhino Slam! | Callahan Bosworth | media | 86 → 84 | rendimento -2 |
| Raleigh Ring of Fire | Matt Gouchoe-Hanas | media | 94 → 92 | rendimento -2 |
| Raleigh Ring of Fire | Andrew Swanson | bassa | 83 → 85 | rendimento +2 |
| Raleigh Ring of Fire | Henry Fisher | bassa | 84 → 82 | rendimento -2 |
| San Francisco Revolver | Daniel Ritthaler | bassa | 86 → 90 | scarto di club +5 · rendimento +2 |
| San Francisco Revolver | Seamus Robinson | bassa | 88 → 90 | scarto di club +5 · rendimento +2 |
| San Francisco Revolver | Sean Liston | bassa | 86 → 90 | scarto di club +5 |
| San Francisco Revolver | Raekwon Adkins | media | 90 → 88 | rendimento -2 |
| San Francisco Revolver | Carter Lankford | media | 90 → 88 | rendimento -2 |
| San Francisco Revolver | Dillon Whited | media | 90 → 88 | rendimento -2 |
| San Francisco Revolver | Robin Vickers Batzdorf | bassa | 83 → 88 | scarto di club +5 |
| San Francisco Revolver | Nathan Prior | bassa | 81 → 86 | scarto di club +5 |
| San Francisco Revolver | Max Zwerin | bassa | 79 → 86 | scarto di club +5 · rendimento +2 |
| Seattle Sockeye | Garrett Martin | bassa | 88 → 86 | rendimento -2 |
| Seattle Sockeye | Asher Lantz | bassa | 82 → 84 | rendimento +2 |
| Seattle Sockeye | Cedar Hines | media | 84 → 82 | rendimento -2 |
| Tchac | Enzo Stanguennec | bassa | 89 → 87 | rendimento -2 |
| Tchac | Némo Courtil | bassa | 84 → 86 | rendimento +2 |
| Tchac | Thomas Lelièvre | bassa | 87 → 85 | rendimento -2 |
| Tchac | Marco Delalle | bassa | 85 → 84 | rendimento -1 |
| Tchac | Axel Roger | bassa | 83 → 84 | rendimento +1 |
| Tchac | Mathieu Begouen Demeaux | bassa | 81 → 80 | rendimento -1 |
| Tchac | Benjamin Broussard | bassa | 78 → 80 | rendimento +2 |
| Tchac | Vincent Lepagnol | bassa | 81 → 79 | rendimento -2 |
| Tchac | Quentin Moneuse | bassa | 75 → 79 | rendimento +4 |
| Tchac | Hélie Chestier | bassa | 77 → 78 | rendimento +1 |
| Tchac | Thybaud Brazeau | bassa | 74 → 77 | rendimento +3 |
| Tchac | Antoine Liron | bassa | 73 → 77 | rendimento +4 |
| Tchac | Simon Madiot | bassa | 73 → 76 | rendimento +3 |
| Toronto GOAT | Martin Gallant | bassa | 89 → 90 | scarto di club +4 · rendimento -2 |
| Toronto GOAT | Oscar Stonehouse | bassa | 88 → 90 | scarto di club +4 |
| Toronto GOAT | Keith McRae | bassa | 87 → 90 | scarto di club +4 |
| Toronto GOAT | Philip Turner | bassa | 86 → 90 | scarto di club +4 |
| Toronto GOAT | James Lewis | bassa | 85 → 89 | scarto di club +4 |
| Toronto GOAT | Araav Sehgal | bassa | 83 → 87 | scarto di club +4 |
| Toronto GOAT | Nathan Hsieh | bassa | 82 → 86 | scarto di club +4 |
| Toronto GOAT | Justin Podnar | bassa | 81 → 85 | scarto di club +4 |
| Toronto GOAT | Max Pettenuzzo | bassa | 81 → 85 | scarto di club +4 |
| Toronto GOAT | Eric Zhuang | bassa | 80 → 84 | scarto di club +4 |
| Toronto GOAT | James McClean | bassa | 80 → 84 | scarto di club +4 |
| Toronto GOAT | Adam O’Donnell | bassa | 79 → 83 | scarto di club +4 |
| Toronto GOAT | Luc Comire | bassa | 77 → 83 | scarto di club +4 · rendimento +2 |
| Toronto GOAT | John Miller | bassa | 78 → 82 | scarto di club +4 |
| Toronto GOAT | Marijo Zlatic | bassa | 78 → 82 | scarto di club +4 |
| Toronto GOAT | Adam Turcotte | bassa | 77 → 81 | scarto di club +4 |
| Toronto GOAT | Samuel Lewis | bassa | 76 → 80 | scarto di club +4 |
| Toronto GOAT | Owen Robinson | bassa | 75 → 79 | scarto di club +4 |
| Toronto GOAT | Jaret Meron | bassa | 74 → 78 | scarto di club +4 |
| Toronto GOAT | Geoff Powell | bassa | 73 → 77 | scarto di club +4 |
| Toronto GOAT | David Petsinis | bassa | 73 → 77 | scarto di club +4 |
| Toronto GOAT | Maxime Ayad | bassa | 71 → 77 | scarto di club +4 · rendimento +2 |
| Toronto GOAT | Nam Ho | bassa | 72 → 76 | scarto di club +4 |
| Wall City | Frederick Pollmeier | bassa | 89 → 88 | rendimento -1 |
| Wall City | Ted Sither | bassa | 88 → 86 | rendimento -2 |
| Wall City | Timon Eggenberg | bassa | 86 → 84 | rendimento -2 |
| Wall City | Edward Garvey | bassa | 85 → 84 | rendimento -1 |
| Wall City | Yannick Marburg | bassa | 84 → 83 | rendimento -1 |
| Wall City | Jan Schmidt | bassa | 81 → 82 | rendimento +1 |
| Wall City | Wieland Freimark | bassa | 79 → 81 | rendimento +2 |
| Wall City | Stefan Kuhn | bassa | 81 → 80 | rendimento -1 |
| Wall City | Vladislav Basov | bassa | 79 → 80 | rendimento +1 |
| Wall City | Steffen Linnemannstöns | bassa | 77 → 79 | rendimento +2 |
| Wall City | Joel Clutton | bassa | 76 → 78 | rendimento +2 |
| Wall City | Krzysztof Zając | bassa | 74 → 78 | rendimento +4 |
| Wall City | Lucas Johnson | bassa | 72 → 76 | rendimento +4 |
| Wall City | Jannis Wenderholm | bassa | 71 → 75 | rendimento +4 |
| Washington DC Truck Stop | Christian Boxley | media | 94 → 92 | rendimento -2 |
| Washington DC Truck Stop | Aidan Downey | bassa | 87 → 89 | rendimento +2 |
| Washington DC Truck Stop | Jeremy Hess | bassa | 77 → 79 | rendimento +2 |

## Anomalie rimaste (dati insufficienti, non forzate)

- **One Tribe (84,9)** resta sopra Chevron e NLSU: le sue punte hanno affidabilità alta (nazionali) e non si toccano.
- **Chevron (83,7)** non arriva al valore atteso (85,8): il tetto di 90 ai giocatori stimati lo impedisce senza prove individuali per portarli oltre.
- **Cotarica e La Fotta giocano l'EUCF come squadra unica**; il gioco le tratta come squadre separate (anche per i posti all'EUCF: `euPick` prende le prime tre per potenza). Unendo le rose: Cotarica 87,4 e La Fotta 89,8 (la squadra unita di Cotarica al WUCC e all'EUCF ha reso come una da circa 84).
- **Rose italiane di 14-16 giocatori** contro i 27-28 dei club europei del foglio: oltre il 14º la profondità italiana non è documentata.
- **Nazionali maggiori** (WUC 2024, EUC, World Games): nessun roster o statistica su portali pubblici raggiungibili; contano solo come affidabilità alta del foglio.
- **Mephisto, Furious George, Doublewide** (qualificati ai Nationals) restano a pari di Portland Red Tide (non qualificato, 82,9): i loro giocatori hanno valori assoluti dai dati Fantasy e il livello del club li sposta poco.
- **Club non coperti da dati di alto livello** (Serie B e C, club europei di livelli bassi, club USA fuori dai Nationals): il livello viene dai risultati nazionali già usati per le forze.

## Test

- `npm test` (statici, motore, prova nel browser: carriera di 12 stagioni, mercato, salvataggi, leghe europee e USA): superato.
- `node tools/test-ovr.js`: superato, con il controllo che affidabilità alta, forzati e aggiunti non cambino.
- `node tools/test-bilanci.js` (economia di tutti i campionati, crescita dalla Serie C G1-G6, altre leghe): rispettati.
- Caricamento di un salvataggio della versione precedente, 10 partite e cambio stagione: nessun errore.

## Tutte le squadre

| Lega | Squadra | Prima | Dopo |
|---|---|---|---|
| Belgio N1 | Mooncatchers | 91,6 | 89,4 |
| Belgio N1 | Gentle Open | 87,5 | 86,9 |
| Belgio N1 | Freezzz Beezzz one | 85,5 | 84,9 |
| Belgio N1 | Jetset Open | 82 | 81,8 |
| Belgio N1 | Gentle Open Too | 77 | 75,4 |
| Belgio N1 | Armada Open | 73,9 | 71,8 |
| Belgio N1 | Eulchtimate Open 1 | 70,1 | 68,4 |
| Belgio N1 | Blackbirds Open 1 | 69 | 67 |
| Belgio N2 | Jetset Open 2 | 70,1 | 67,6 |
| Belgio N2 | Helgtre Open | 71,9 | 66,5 |
| Belgio N2 | Diabolic Heaven Open 1 | 69 | 66 |
| Belgio N2 | Les Hiboux Glorieux | 67,9 | 65,3 |
| Belgio N2 | Flying Rabbits Katch-up | 66 | 64 |
| Belgio N2 | Freezzz Beezzz HIVE | 66,7 | 63,6 |
| Belgio N2 | Antwerp Ultimate Open | 65 | 62,8 |
| Belgio N3 | Oufti-Ké-Rêve | 64,7 | 63,7 |
| Belgio N3 | Gentle Rockets | 65,4 | 62,2 |
| Belgio N3 | Éclipse Solaire | 75,5 | 62 |
| Belgio N3 | VOS Open | 61,7 | 61,7 |
| Belgio N3 | XL Open 1 | 63,3 | 60,2 |
| Belgio N3 | Disco Duro | 62,6 | 59,4 |
| Belgio N3 | KUFC | 60,8 | 59,1 |
| Belgio N3 | Flywin open 1 | 59,9 | 58,5 |
| Belgio N4 | Ultimate Delux O | 62 | 59,3 |
| Belgio N4 | Stoemps Burrata | 60,2 | 58,2 |
| Belgio N4 | Blackbirds Open 2 | 61 | 57,9 |
| Belgio N4 | Les Chouettes Glorieuses | 59,4 | 57,6 |
| Belgio N4 | Zero Gravity | 58,4 | 57,1 |
| Belgio N4 | Red Nuts | 57,5 | 55,4 |
| Belgio N4 | Freespect | 55,7 | 53,5 |
| Belgio N4 | Flywin open 2 | 56,5 | 53,3 |
| Belgio N5 | Mighty DUCs | 56,6 | 54,6 |
| Belgio N5 | Jetset Propellers | 57,6 | 54,4 |
| Belgio N5 | White Foxes Open | 54 | 53,1 |
| Belgio N5 | XL Open 2 | 55,6 | 52,4 |
| Belgio N5 | Diabolic Heaven Open 2 | 54,9 | 51,9 |
| Belgio N5 | Helgtre Knallers | 51,2 | 50,3 |
| Belgio N5 | Lievegem Frisbee Team | 52,9 | 50,3 |
| Belgio N5 | Eulchtimate Open 2 | 52 | 48,8 |
| Belgio N6 | Éclipse Lunaire | 52 | 51,7 |
| Belgio N6 | Frisco Duro | 51,2 | 51,5 |
| Belgio N6 | Area 51 | 53 | 49,8 |
| Belgio N6 | PUF | 49,4 | 49,3 |
| Belgio N6 | Cerfs de Bure | 50,3 | 49,1 |
| Belgio N6 | Jetset Zeppelins | 48,5 | 45,9 |
| Belgio N6 | Stoemps Antipasti | 47,6 | 45 |
| Germania D1 | Wall City | 91,1 | 88,4 |
| Germania D1 | Bad Skid | 82,5 | 83 |
| Germania D1 | Heidees | 82 | 81,1 |
| Germania D1 | M.U.C. | 73,9 | 71,6 |
| Germania D1 | Late Game | 69,9 | 68,8 |
| Germania D1 | Frizzly Bears | 67,9 | 66,8 |
| Germania D1 | BORA | 69,2 | 66 |
| Germania D1 | 7Schwaben | 66,1 | 64,9 |
| Germania D1 | Werfwölfe | 65,1 | 64 |
| Germania D1 | Hardfisch | 66,9 | 63,2 |
| Germania D1 | Disckick | 64 | 62,9 |
| Germania D1 | Hard2fisch | 61,9 | 60,8 |
| Germania D1 | Frühsport 02 | 60,9 | 59,8 |
| Germania D1 | Ars Ludendi | 62,9 | 59,6 |
| Germania D1 | bff | 59,9 | 58,9 |
| Germania D1 | Sturm und Drang I | 59,1 | 57,9 |
| Germania D2 | Funatics | 60 | 58,9 |
| Germania D2 | Wurstkultur | 59,6 | 58,5 |
| Germania D2 | Bonnsai | 58,9 | 57,8 |
| Germania D2 | Bremen Ultimate | 61,2 | 57,4 |
| Germania D2 | Gummibärchen | 60,8 | 57,4 |
| Germania D2 | Lahntalknaben | 58,4 | 57,3 |
| Germania D2 | NU Open | 57,6 | 56,4 |
| Germania D2 | Paradisco | 57,1 | 56,1 |
| Germania D2 | Goldfingers | 56,3 | 55,3 |
| Germania D2 | Unwucht Erlangen | 56,1 | 54,9 |
| Germania D2 | EazyEastKoast | 55,2 | 54,1 |
| Germania D2 | Air Support | 54,8 | 53,7 |
| Germania D2 | Hucks Ultimate Club Berlin | 53,9 | 52,8 |
| Germania D2 | THW | 53,6 | 52,5 |
| Germania D2 | Windhosen Wilhelmshaven | 52,8 | 51,7 |
| Germania D2 | Feldrenner | 52,4 | 51,3 |
| Germania D3 | Family Ultimate | 52,3 | 51,1 |
| Germania D3 | Ars Ludendi Discendi | 52 | 50,9 |
| Germania D3 | Ratisbona Eagles | 51,8 | 50,7 |
| Germania D3 | DJ Dahlem | 51 | 49,9 |
| Germania D3 | Bad Raps | 50,8 | 49,7 |
| Germania D3 | Schwabinger Frisbee Buam & UaS | 50,5 | 49,4 |
| Germania D3 | Ultimate Lions Essen | 49,6 | 48,5 |
| Germania D3 | Gummibärchen 2 | 49,4 | 48,3 |
| Germania D3 | GinPANsen | 49,2 | 48,1 |
| Germania D3 | Late Game II | 48,3 | 47,1 |
| Germania D3 | Heidees II | 48 | 46,9 |
| Germania D3 | FT Würzburg Ultimate | 47,9 | 46,8 |
| Germania D3 | Sturm und Drang II | 46,9 | 45,7 |
| Germania D3 | 2MUCL | 46,6 | 45,5 |
| Germania D3 | ULMtimates | 45,5 | 44,4 |
| Germania D3 | NXT Nürnberg | 45,2 | 44,1 |
| Germania D3 | MINT - MENT | 44,1 | 42,9 |
| Francia N1 | Tchac | 89,7 | 87,1 |
| Francia N1 | NLSU | 85,3 | 83,9 |
| Francia N1 | Stade Bordelais | 75,6 | 74,5 |
| Francia N1 | Freezgo | 74,8 | 73,7 |
| Francia N1 | Monkey | 74 | 72,9 |
| Francia N1 | F5 | 71,2 | 70,1 |
| Francia N1 | Magic Disc | 72,8 | 69,7 |
| Francia N1 | RFO | 70,3 | 69,1 |
| Francia N1 | PUC Ultimate | 72,1 | 68,9 |
| Francia N1 | Tsunami | 69,3 | 68,2 |
| Francia N1 | BTR | 68,5 | 67,4 |
| Francia N1 | Sun | 67,6 | 66,5 |
| Francia N2 | Discjonctés | 69 | 67,9 |
| Francia N2 | Friselis | 68,7 | 67,6 |
| Francia N2 | Ouf | 68,1 | 67 |
| Francia N2 | Roazhon Ultimate | 69,3 | 66,7 |
| Francia N2 | Sesquidistus | 67,6 | 66,5 |
| Francia N2 | Tchac 2 | 67,4 | 66,3 |
| Francia N2 | Frisbeurs | 66,8 | 65,6 |
| Francia N2 | Friz'Bisontins | 66,4 | 65,3 |
| Francia N2 | Jets | 66,1 | 65 |
| Francia N2 | Révolution'Air | 65,3 | 64,2 |
| Francia N2 | A.S.U.L. Ultimate | 65 | 63,9 |
| Francia N2 | Manchots | 64,7 | 63,6 |
| Francia N2 | Zérogêne | 64,1 | 63 |
| Francia N2 | Les Marsiens | 63,8 | 62,7 |
| Francia N2 | Disc'Gestifs | 63,4 | 62,4 |
| Francia N2 | Phoenix | 62,8 | 61,7 |
| Francia N2 | Clapas | 62,6 | 61,5 |
| Francia N2 | Freezgo 2 | 62,3 | 61,1 |
| Francia N2 | Power Rouengers | 61,5 | 60,4 |
| Francia N2 | Les Gones | 61,2 | 60,1 |
| Francia N2 | Fus'Yon | 61 | 59,9 |
| Francia N2 | Magic Disc 2 | 60,2 | 59,1 |
| Francia N2 | Chamber' | 60 | 58,8 |
| Francia N2 | Friz'Toi | 59,5 | 58,5 |
| Serie A | BFD La Fotta Offence | 89,9 | 88 |
| Serie A | BFD La Fotta Defense | 88,9 | 86,1 |
| Serie A | Cotarica Runners | 87,3 | 85,3 |
| Serie A | Cotarica Grandes | 86,3 | 85,1 |
| Serie A | One Tribe | 84,8 | 84,9 |
| Serie A | DiscoBolo | 84 | 83,5 |
| Serie A | CUS Padova Barbastreji | 83,9 | 82,5 |
| Serie A | 360 Milano | 81,1 | 78,7 |
| Serie A | BFD Redbulls | 80,5 | 77,3 |
| Serie A | One Tribe Next Gen | 79,5 | 76,7 |
| Serie A | UFO (A) | 79,4 | 75,5 |
| Serie A | Donkey Divers (A) | 78 | 75,3 |
| Serie A | RAMS BLUE | 78,2 | 74,3 |
| Serie A | METACARPI | 76,2 | 73,9 |
| Serie A | AUT BeeFree | 76,1 | 72,8 |
| Serie A | BFD Zero51 | 74,6 | 70,7 |
| Serie B | Canieporci | 73,7 | 70,5 |
| Serie B | Frisbaobab | 72,5 | 69,9 |
| Serie B | KISS - Ultimate Cremona | 71,9 | 69,4 |
| Serie B | Frasba dal Lac | 70,9 | 66,8 |
| Serie B | VOLADORA | 69,3 | 66 |
| Serie B | DISCOVER-CUS VERONA (B) | 70,1 | 65,7 |
| Serie B | Cotarica J | 68,1 | 65,2 |
| Serie B | DiscoBolo Rookies | 67,3 | 63,7 |
| Serie B | CUS BERGAMO | 66,4 | 63,7 |
| Serie B | BFD NextGen | 64,9 | 61,6 |
| Serie B | One Tribe U20 | 64 | 61,5 |
| Serie B | Disc&Disc | 65,8 | 61,4 |
| Serie B | CUS Padova Barbados | 62,9 | 60,3 |
| Serie B | BID ROMA | 62,3 | 60,1 |
| Serie C | Ultimate Frisbee Fano | 53,6 | 49,7 |
| Serie C | One Tribe U17 | 53,9 | 49 |
| Serie C | CUS Padova Barbafighto | 51,4 | 48,9 |
| Serie C | NoMad Goose | 53,7 | 48,6 |
| Serie C | Grem | 50 | 47,5 |
| Serie C | ExtraFut | 49,3 | 47,5 |
| Serie C | DiscoBolo NewGen | 48,8 | 46,7 |
| Serie C | Brigata Treseizero | 48,6 | 46,6 |
| Serie C | AUT Hive | 49,5 | 46,6 |
| Serie C | Discover CUS Verona (C) | 49,9 | 46 |
| Serie C | UFO (C) | 48,3 | 45,9 |
| Serie C | De’Cavaliers | 48,2 | 45,8 |
| Serie C | Donkey Divers (C) | 49,1 | 45,6 |
| Serie C | One Tribe Wise | 46,9 | 44,4 |
| Serie C | RAMS WHITE | 47,6 | 44,3 |
| Serie C | SBILF CUS Udine | 48,4 | 44,1 |
| Regno Unito N1 | Clapham Ultimate | 90,1 | 88,6 |
| Regno Unito N1 | Chevron Action Flash | 87,1 | 83,7 |
| Regno Unito N1 | SMASH'D | 75 | 71,9 |
| Regno Unito N1 | SMOG Open | 74 | 70,9 |
| Regno Unito N1 | Bristol Open | 73,2 | 70 |
| Regno Unito N1 | Alba | 72 | 69 |
| Regno Unito N1 | SOLENT Open | 70,6 | 68,2 |
| Regno Unito N1 | Manchester Ultimate | 69,1 | 67,9 |
| USA | New York PoNY | 92,2 | 90,9 |
| USA | San Francisco Revolver | 91,6 | 90,3 |
| USA | Boston DiG | 91,6 | 89,6 |
| USA | Raleigh Ring of Fire | 89,6 | 89,2 |
| USA | Portland Rhino Slam! | 90,1 | 89,1 |
| USA | Chicago Machine | 91,1 | 88,8 |
| USA | Toronto GOAT | 86,4 | 87,1 |
| USA | Minneapolis Sub Zero | 88,3 | 86,1 |
| USA | Philadelphia Pacmen | 87 | 85,4 |
| USA | Atlanta Chain Lightning | 88,3 | 85,3 |
| USA | Washington DC Truck Stop | 87,5 | 85 |
| USA | Seattle Sockeye | 86,2 | 84,2 |
| USA | Denver Johnny Bravo | 86,5 | 83,6 |
| USA | Portland Red Tide | 84,8 | 82,9 |
| USA | Vancouver Furious George | 84,7 | 82,9 |
| USA | Montréal Mephisto | 83,8 | 82,7 |
| USA | Austin Doublewide | 84,3 | 82,6 |
| USA | Raleigh-Durham United | 84,4 | 81,6 |
| USA | Chicago Haymaker | 84,4 | 81,4 |
| USA | New York Blueprint | 82,8 | 80,5 |
| USA | Florida Untied | 82,3 | 80,4 |
| USA | Virginia Vault | 81,7 | 79,7 |
| USA | Madison Mad Men | 83,4 | 79,5 |
| USA | SoCal Condors | 83 | 79,5 |
| USA | Oak Grove Boys | 81,4 | 79,3 |
| USA | Amherst Sprout | 81,8 | 79,2 |
| USA | Eugene Dark Star | 82,7 | 79 |
| USA | Pittsburgh Temper | 80,8 | 78,8 |
| USA | Charlotte baNC | 79,9 | 77,9 |
| USA | Arizona Nighthawk | 79,5 | 77,7 |
| USA | SOUF | 79,8 | 77,6 |
| USA | Lounar | 79,5 | 77,4 |
| USA | Bay Area Wavestorms | 78,9 | 76,7 |
| USA | Indianapolis I-69 | 78,6 | 76,6 |
| USA | Flying Dutchmen | 78,7 | 76,5 |
| USA | Chattanooga Tanasi | 78,3 | 76,4 |
| USA | Minneapolis Mallard | 78,2 | 76,3 |
| USA | Fungi | 78,3 | 76 |
| USA | Kansas City Smokestack | 78,2 | 75,9 |
| USA | Salt Lake City Shrimp | 77,9 | 75,9 |
| USA | Zodiac | 77,2 | 75,5 |
| USA | Trident | 77,9 | 75,2 |
| USA | Garden State Ultimate | 77,1 | 75,1 |
| USA | Knights of Ni | 76,1 | 74 |
| USA | Alamode | 74,8 | 72,8 |
| USA | Hazard | 74,9 | 72,8 |
| USA | Boulder ISO Atmo | 73,7 | 71,7 |
| USA | ZOO | 72,1 | 69,9 |

# Revisione delle potenze di squadra e degli Overall (formula unica)

Documento di lavoro della revisione: formula, effetti sulle squadre e giocatori modificati. Il metodo degli Overall del foglio è in `docs/OVERALL-2026.md`.

## Formula

**Potenza = 60% × media dei 7 migliori + 35% × media dei giocatori dall'8º al 14º + 5% × media dal 15º al 21º**, con i giocatori ordinati per Overall decrescente e senza vincoli di ruolo (`rosterPower` / `powerOfVals`, `src/30-js/10-sim/12-allenamenti-rose.js`).

- Oltre il 21º giocatore nessuno conta: chi sta in fondo alla rosa non abbassa la potenza.
- Rose corte: ogni posto vuoto vale il giocatore più debole che c'è meno 8 punti (almeno 25). La penalità è moderata e mai un vantaggio: una rosa corta non rende mai più della stessa con dei rincalzi.
- Una sola funzione per tutte le squadre (Italia, Europa, USA), per carriera, simulazioni, classifiche, anteprime, mercato tra i club, economia e ultimate. Per la tua squadra i valori sono quelli di oggi: infortunati fuori, `DBL_PEN` (-7) a chi sta in entrambe le linee (che occupa due dei 14 posti delle linee) e, in partita simulata, `COND_PEN` per la condizione. Le penalità dinamiche restano.
- Il **livello dei 7 titolari** (`rosterLevel`: 3 handler e 4 cutter) resta come riferimento per costruire le rose, generare i giovani e misurare crescita e mercato: non è una potenza. Le forze statiche dei club (`TEAM[n].power`, `US_TEAM.power`, `LN_BY.p`, `OVR_POW`) sono livelli: la potenza si calcola sempre dalla rosa. Per le poche forze statiche usate senza rosa (club europei inventati) c'è la conversione `PW_LV` (2 punti, la differenza media misurata su 233 club).
- Taratura: con la formula unica le carriere simulate (punti fissi G1-G6) perdevano circa 1,5 punti di forza nelle Serie A; metà si recupera facendo occupare due posti a chi gioca in entrambe le linee e 0,6 punti (`PW_MY`) sono l'unica costante aggiunta.

## Effetto sulle principali squadre

Prima = forza con la formula precedente (media dei 3 handler e 4 cutter migliori) nello stato di partenza di questa revisione; dopo = potenza con la formula unica e con gli Overall rivisti.

### Italia, Serie A

| # | Squadra | Prima (7 per ruolo) | Dopo (formula unica) | Rosa |
|---|---|---|---|---|
| 1 | BFD La Fotta Offence | 89,9 | **88** | 14 |
| 2 | BFD La Fotta Defense | 88,9 | **86,1** | 14 |
| 3 | Cotarica Runners | 87,3 | **85,3** | 15 |
| 4 | One Tribe | 84,8 | **84,9** | 20 |
| 5 | DiscoBolo | 84 | **83,5** | 19 |
| 6 | Cotarica Grandes | 86,3 | **83,3** | 16 |
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

| # | Squadra | Prima (7 per ruolo) | Dopo (formula unica) | Rosa |
|---|---|---|---|---|
| 1 | Mooncatchers | 91,6 | **89,4** | 27 |
| 2 | Clapham Ultimate | 90,1 | **88,6** | 28 |
| 3 | Wall City | 91,1 | **88,4** | 28 |
| 4 | Tchac | 89,7 | **87,1** | 27 |
| 5 | Gentle Open | 87,5 | **85,5** | 28 |
| 6 | Chevron Action Flash | 87,1 | **83,7** | 28 |
| 7 | NLSU | 85,3 | **83,2** | 26 |
| 8 | Freezzz Beezzz one | 85,5 | **82,7** | 20 |
| 9 | Jetset Open | 82 | **81,8** | 16 |
| 10 | Bad Skid | 82,5 | **79,2** | 28 |
| 11 | Heidees | 82 | **78,7** | 20 |
| 12 | Gentle Open Too | 77 | **75,4** | 16 |
| 13 | Stade Bordelais | 75,6 | **74,5** | 16 |
| 14 | Freezgo | 74,8 | **73,7** | 16 |
| 15 | Monkey | 74 | **72,9** | 16 |
| 16 | M.U.C. | 73,9 | **71,6** | 16 |

### USA, le prime 12

| # | Squadra | Prima (7 per ruolo) | Dopo (formula unica) | Rosa |
|---|---|---|---|---|
| 1 | San Francisco Revolver | 91,6 | **90** | 26 |
| 2 | New York PoNY | 92,2 | **89,9** | 26 |
| 3 | Boston DiG | 91,6 | **89,8** | 23 |
| 4 | Raleigh Ring of Fire | 89,6 | **89,3** | 27 |
| 5 | Chicago Machine | 91,1 | **89** | 26 |
| 6 | Portland Rhino Slam! | 90,1 | **88,9** | 26 |
| 7 | Minneapolis Sub Zero | 88,3 | **86** | 25 |
| 8 | Atlanta Chain Lightning | 88,3 | **85,8** | 26 |
| 9 | Philadelphia Pacmen | 87 | **85,4** | 25 |
| 10 | Washington DC Truck Stop | 87,5 | **85** | 22 |
| 11 | Seattle Sockeye | 86,2 | **84,3** | 26 |
| 12 | Denver Johnny Bravo | 86,5 | **84,1** | 25 |

## Overall modificati

Regola: i valori con affidabilità **alta** (111 giocatori del foglio), quelli **forzati** (Puppi, Martini, Spiritigliozzi) e gli **aggiunti a mano** (Mazzo, Ragusa) non sono toccati da scarti, ritocchi o ricalibrazioni; `tools/test-ovr.js` lo controlla a ogni verifica. Su 93 giocatori con affidabilità **media** sono toccati 3 (solo con ritocco individuale di almeno 2 punti dal rendimento a EUCF e WUCC); su 642 con affidabilità **bassa** sono toccati 150.

Motivazioni:
- **Scarto di club** (solo affidabilità bassa): la stima del foglio per questi giocatori viene dalla forza del club e dalla posizione in rosa; per Gentle Open (+5), Chevron (+7) e NLSU (+6) la forza del club era sottostimata rispetto ai risultati (EUCF 2026: 6ª, 7ª e 8ª; Chevron semifinalista nel 2025, Gentle semifinalista nel 2021 e 2023; WUCC 2026: Gentle 7º tra tutti). Per questi club quasi tutta la rosa è stimata dal club.
- **Ritocco da rendimento** (affidabilità bassa e, con almeno 2 punti, media): mete e assist a partita (da almeno 8 partite) a EUCF e WUCC 2026, i tornei Open più forti, rispetto ai compagni e a parità di ruolo; circa 4 punti di Overall per ogni punto a partita, misurati sui 50 giocatori con affidabilità alta; metà della distanza dal valore atteso, da -2 a +4.

| Club | Giocatore | Affid. | Prima → dopo | Motivo |
|---|---|---|---|---|
| Bad Skid | Steffen Döscher | bassa | 83 → 81 | rendimento EUCF/WUCC -2 |
| Bad Skid | Benjamin Schenk | bassa | 75 → 73 | rendimento EUCF/WUCC -2 |
| Bad Skid | Marc Pritsch | bassa | 71 → 69 | rendimento EUCF/WUCC -2 |
| Bad Skid | Jannik Volk | bassa | 68 → 66 | rendimento EUCF/WUCC -2 |
| Bad Skid | Benjamin Schlechter | bassa | 67 → 66 | rendimento EUCF/WUCC -1 |
| Bad Skid | Felix Meyer | bassa | 62 → 64 | rendimento EUCF/WUCC +2 |
| Bad Skid | Maximilian Olbert | bassa | 65 → 63 | rendimento EUCF/WUCC -2 |
| Bad Skid | Kevin Schanz | bassa | 59 → 61 | rendimento EUCF/WUCC +2 |
| Bad Skid | Jonathan Schall | bassa | 58 → 61 | rendimento EUCF/WUCC +3 |
| Bad Skid | Johannes Schlechter | bassa | 56 → 59 | rendimento EUCF/WUCC +3 |
| Bad Skid | Lennart Vollmer | bassa | 53 → 57 | rendimento EUCF/WUCC +4 |
| Bad Skid | Leo Grimmig | bassa | 51 → 55 | rendimento EUCF/WUCC +4 |
| Bad Skid | Simon Hiller | bassa | 47 → 51 | rendimento EUCF/WUCC +4 |
| BFD La Fotta Offence | Kaïs Mathè | media | 85 → 88 | rendimento EUCF/WUCC +3 |
| Chevron Action Flash | Andrew Sweetnam | bassa | 85 → 90 | scarto di club +7 · rendimento EUCF/WUCC -2 |
| Chevron Action Flash | Ethan Morrell | bassa | 85 → 90 | scarto di club +7 · rendimento EUCF/WUCC -2 |
| Chevron Action Flash | Cameron Weir | bassa | 83 → 88 | scarto di club +7 · rendimento EUCF/WUCC -2 |
| Chevron Action Flash | Sam Criddle | bassa | 82 → 87 | scarto di club +7 · rendimento EUCF/WUCC -2 |
| Chevron Action Flash | Will Jackson | bassa | 81 → 86 | scarto di club +7 · rendimento EUCF/WUCC -2 |
| Chevron Action Flash | Rhodri Williams | bassa | 78 → 85 | scarto di club +7 |
| Chevron Action Flash | Thomas Oliver | bassa | 79 → 84 | scarto di club +7 · rendimento EUCF/WUCC -2 |
| Chevron Action Flash | Marcus Kalsi Stølen | bassa | 77 → 82 | scarto di club +7 · rendimento EUCF/WUCC -2 |
| Chevron Action Flash | Rupert Pantling | bassa | 75 → 82 | scarto di club +7 |
| Chevron Action Flash | Kody Edwards | bassa | 74 → 81 | scarto di club +7 |
| Chevron Action Flash | Seb Allen | bassa | 73 → 80 | scarto di club +7 |
| Chevron Action Flash | Robert Pantling | bassa | 72 → 79 | scarto di club +7 |
| Chevron Action Flash | Edward Graham | bassa | 71 → 76 | scarto di club +7 · rendimento EUCF/WUCC -2 |
| Chevron Action Flash | Tom Bennett | bassa | 70 → 75 | scarto di club +7 · rendimento EUCF/WUCC -2 |
| Chevron Action Flash | Ben Tennant | bassa | 69 → 75 | scarto di club +7 · rendimento EUCF/WUCC -1 |
| Chevron Action Flash | Ben Burak | bassa | 68 → 74 | scarto di club +7 · rendimento EUCF/WUCC -1 |
| Chevron Action Flash | Ben Tempest | bassa | 67 → 74 | scarto di club +7 |
| Chevron Action Flash | Robbie Haines | bassa | 66 → 73 | scarto di club +7 |
| Chevron Action Flash | Declan Cartwright | bassa | 64 → 72 | scarto di club +7 · rendimento EUCF/WUCC +1 |
| Chevron Action Flash | Ben Wilson | bassa | 63 → 72 | scarto di club +7 · rendimento EUCF/WUCC +2 |
| Chevron Action Flash | Seb Hart | bassa | 61 → 72 | scarto di club +7 · rendimento EUCF/WUCC +4 |
| Chevron Action Flash | Josh Hanham | bassa | 62 → 69 | scarto di club +7 |
| Chevron Action Flash | Andrew Turner | bassa | 59 → 69 | scarto di club +7 · rendimento EUCF/WUCC +3 |
| Chevron Action Flash | Tom Hodgett | bassa | 58 → 69 | scarto di club +7 · rendimento EUCF/WUCC +4 |
| Chevron Action Flash | Alex Hately | bassa | 57 → 68 | scarto di club +7 · rendimento EUCF/WUCC +4 |
| Chevron Action Flash | Matthew Beavan | bassa | 60 → 67 | scarto di club +7 |
| Chevron Action Flash | Steve Kolthammer | bassa | 56 → 67 | scarto di club +7 · rendimento EUCF/WUCC +4 |
| Chevron Action Flash | Issa Dualeh | bassa | 55 → 66 | scarto di club +7 · rendimento EUCF/WUCC +4 |
| Chevron Action Flash | Hari Tidswell | bassa | 53 → 64 | scarto di club +7 · rendimento EUCF/WUCC +4 |
| Chevron Action Flash | Luke Haywood | bassa | 52 → 59 | scarto di club +7 |
| Clapham Ultimate | Josh Awcock | media | 91 → 89 | rendimento EUCF/WUCC -2 |
| Clapham Ultimate | Felix Martin | media | 90 → 88 | rendimento EUCF/WUCC -2 |
| Clapham Ultimate | Rana Sarin | bassa | 84 → 83 | rendimento EUCF/WUCC -1 |
| Clapham Ultimate | Oscar Modiano | bassa | 83 → 82 | rendimento EUCF/WUCC -1 |
| Clapham Ultimate | Neil McCulloch | bassa | 79 → 80 | rendimento EUCF/WUCC +1 |
| Clapham Ultimate | Ross Nugent | bassa | 76 → 78 | rendimento EUCF/WUCC +2 |
| Clapham Ultimate | Charlie Butt | bassa | 74 → 77 | rendimento EUCF/WUCC +3 |
| Clapham Ultimate | Steven Chang | bassa | 73 → 77 | rendimento EUCF/WUCC +4 |
| Cotarica Grandes | Lorenzo Turci | bassa | 89 → 87 | rendimento EUCF/WUCC -2 |
| Cotarica Grandes | Arturo Benzi | bassa | 83 → 82 | rendimento EUCF/WUCC -1 |
| Cotarica Grandes | Alberto Pompizii | bassa | 79 → 81 | rendimento EUCF/WUCC +2 |
| Cotarica Grandes | Alessandro Pari | bassa | 77 → 80 | rendimento EUCF/WUCC +3 |
| Cotarica Grandes | Luca Contini | bassa | 74 → 78 | rendimento EUCF/WUCC +4 |
| Cotarica Runners | Andrea Bulgarelli | bassa | 86 → 87 | rendimento EUCF/WUCC +1 |
| Gentle Open | Staf Decraene | bassa | 86 → 89 | scarto di club +5 · rendimento EUCF/WUCC -2 |
| Gentle Open | Emiel De Rieck | bassa | 85 → 88 | scarto di club +5 · rendimento EUCF/WUCC -2 |
| Gentle Open | Adrian Collantes | bassa | 84 → 87 | scarto di club +5 · rendimento EUCF/WUCC -2 |
| Gentle Open | Stern Ongenaet | bassa | 83 → 87 | scarto di club +5 · rendimento EUCF/WUCC -1 |
| Gentle Open | Arthur Fieuws | bassa | 81 → 84 | scarto di club +5 · rendimento EUCF/WUCC -2 |
| Gentle Open | Bono Vandamme | bassa | 78 → 84 | scarto di club +5 · rendimento EUCF/WUCC +1 |
| Gentle Open | Han Pisano | bassa | 79 → 83 | scarto di club +5 · rendimento EUCF/WUCC -1 |
| Gentle Open | Aäron Vlieghe | bassa | 79 → 82 | scarto di club +5 · rendimento EUCF/WUCC -2 |
| Gentle Open | Wolf Oosterlinck | bassa | 75 → 82 | scarto di club +5 · rendimento EUCF/WUCC +2 |
| Gentle Open | Benjamin Zwarts | bassa | 77 → 81 | scarto di club +5 · rendimento EUCF/WUCC -1 |
| Gentle Open | Dante Simoens | bassa | 77 → 81 | scarto di club +5 · rendimento EUCF/WUCC -1 |
| Gentle Open | Sebastiaan Moons | bassa | 76 → 81 | scarto di club +5 |
| Gentle Open | Leon Pannemans | bassa | 74 → 80 | scarto di club +5 · rendimento EUCF/WUCC +1 |
| Gentle Open | Lorenz Jordi | bassa | 75 → 79 | scarto di club +5 · rendimento EUCF/WUCC -1 |
| Gentle Open | Louis Corthout | bassa | 73 → 78 | scarto di club +5 |
| Gentle Open | Stan Declerck | bassa | 73 → 78 | scarto di club +5 |
| Gentle Open | Mathias Middernacht | bassa | 72 → 78 | scarto di club +5 · rendimento EUCF/WUCC +1 |
| Gentle Open | Broes Cottyn | bassa | 70 → 78 | scarto di club +5 · rendimento EUCF/WUCC +3 |
| Gentle Open | Benjamin Vereecken | bassa | 69 → 78 | scarto di club +5 · rendimento EUCF/WUCC +4 |
| Gentle Open | Kasper Kindekens | bassa | 68 → 77 | scarto di club +5 · rendimento EUCF/WUCC +4 |
| Gentle Open | Guiseppe Depotter | bassa | 71 → 76 | scarto di club +5 |
| Gentle Open | Samir Boumalal | bassa | 71 → 76 | scarto di club +5 |
| Gentle Open | Jelle Vandermoere | bassa | 67 → 76 | scarto di club +5 · rendimento EUCF/WUCC +4 |
| Gentle Open | Maarten Vanlerberghe | bassa | 66 → 75 | scarto di club +5 · rendimento EUCF/WUCC +4 |
| Gentle Open | Sam Ds | bassa | 69 → 74 | scarto di club +5 |
| Gentle Open | Roel Dekoninck | bassa | 64 → 73 | scarto di club +5 · rendimento EUCF/WUCC +4 |
| Gentle Open | Artuur Desloover | bassa | 67 → 72 | scarto di club +5 |
| Gentle Open | Nathan Deman | bassa | 65 → 70 | scarto di club +5 |
| Gentle Open | Robin De Rocker | bassa | 65 → 70 | scarto di club +5 |
| Mooncatchers | Benjamin Jonkers | bassa | 90 → 89 | rendimento EUCF/WUCC -1 |
| Mooncatchers | Diego Nothomb | bassa | 86 → 84 | rendimento EUCF/WUCC -2 |
| Mooncatchers | Arthur Feller | bassa | 85 → 84 | rendimento EUCF/WUCC -1 |
| Mooncatchers | Jérôme Deridder | bassa | 85 → 84 | rendimento EUCF/WUCC -1 |
| Mooncatchers | Matthieu Muller | bassa | 83 → 84 | rendimento EUCF/WUCC +1 |
| Mooncatchers | Andrew Delhaisse | bassa | 82 → 81 | rendimento EUCF/WUCC -1 |
| Mooncatchers | Corentin Schiettecatte | bassa | 80 → 81 | rendimento EUCF/WUCC +1 |
| Mooncatchers | Gregoire Peterkenne | bassa | 79 → 80 | rendimento EUCF/WUCC +1 |
| Mooncatchers | Gaetan Vanden Broeck | bassa | 77 → 80 | rendimento EUCF/WUCC +3 |
| Mooncatchers | John Beeckmans | bassa | 77 → 80 | rendimento EUCF/WUCC +3 |
| Mooncatchers | Nicolas Hoquez | bassa | 76 → 80 | rendimento EUCF/WUCC +4 |
| Mooncatchers | Louis Dawans | bassa | 78 → 79 | rendimento EUCF/WUCC +1 |
| Mooncatchers | Cedric Feller | bassa | 75 → 79 | rendimento EUCF/WUCC +4 |
| NLSU | Clément Giffard | bassa | 85 → 91 | scarto di club +6 |
| NLSU | Lucas Bouchon | bassa | 85 → 91 | scarto di club +6 |
| NLSU | Olivier Gibert | bassa | 85 → 89 | scarto di club +6 · rendimento EUCF/WUCC -2 |
| NLSU | Romain Couturier | bassa | 81 → 87 | scarto di club +6 |
| NLSU | Rémy Dauvois | bassa | 82 → 86 | scarto di club +6 · rendimento EUCF/WUCC -2 |
| NLSU | Rapahël Chareix | bassa | 78 → 84 | scarto di club +6 |
| NLSU | Arthur Oudomphong | bassa | 79 → 83 | scarto di club +6 · rendimento EUCF/WUCC -2 |
| NLSU | Raphaël Caudron | bassa | 77 → 81 | scarto di club +6 · rendimento EUCF/WUCC -2 |
| NLSU | Eric Becker-Chagneux | bassa | 75 → 79 | scarto di club +6 · rendimento EUCF/WUCC -2 |
| NLSU | Arthur Negre | bassa | 74 → 79 | scarto di club +6 · rendimento EUCF/WUCC -1 |
| NLSU | Jules Lamare | bassa | 73 → 78 | scarto di club +6 · rendimento EUCF/WUCC -1 |
| NLSU | Roger Michael | bassa | 72 → 76 | scarto di club +6 · rendimento EUCF/WUCC -2 |
| NLSU | Raphaël Chareix | bassa | 71 → 76 | scarto di club +6 · rendimento EUCF/WUCC -1 |
| NLSU | Gaspard Calligaro | bassa | 68 → 76 | scarto di club +6 · rendimento EUCF/WUCC +2 |
| NLSU | Amaury Davy | bassa | 70 → 75 | scarto di club +6 · rendimento EUCF/WUCC -1 |
| NLSU | Benjamin Fenrich | bassa | 69 → 75 | scarto di club +6 |
| NLSU | Célian Martin | bassa | 66 → 72 | scarto di club +6 |
| NLSU | Yoann Cocquebert | bassa | 64 → 71 | scarto di club +6 · rendimento EUCF/WUCC +1 |
| NLSU | Paul Marques | bassa | 63 → 71 | scarto di club +6 · rendimento EUCF/WUCC +2 |
| NLSU | Raphaël Melin | bassa | 62 → 70 | scarto di club +6 · rendimento EUCF/WUCC +2 |
| NLSU | Reiyu Rakotomamonjy | bassa | 59 → 68 | scarto di club +6 · rendimento EUCF/WUCC +3 |
| NLSU | Jules Quinton | bassa | 58 → 68 | scarto di club +6 · rendimento EUCF/WUCC +4 |
| NLSU | Ulysse Rouillard | bassa | 61 → 67 | scarto di club +6 |
| NLSU | Hugo Donatien | bassa | 57 → 67 | scarto di club +6 · rendimento EUCF/WUCC +4 |
| NLSU | Willem Garnier | bassa | 60 → 66 | scarto di club +6 |
| NLSU | Barnabé Earl-Anstee | bassa | 56 → 66 | scarto di club +6 · rendimento EUCF/WUCC +4 |
| Tchac | Enzo Stanguennec | bassa | 89 → 87 | rendimento EUCF/WUCC -2 |
| Tchac | Némo Courtil | bassa | 84 → 86 | rendimento EUCF/WUCC +2 |
| Tchac | Thomas Lelièvre | bassa | 87 → 85 | rendimento EUCF/WUCC -2 |
| Tchac | Marco Delalle | bassa | 85 → 84 | rendimento EUCF/WUCC -1 |
| Tchac | Axel Roger | bassa | 83 → 84 | rendimento EUCF/WUCC +1 |
| Tchac | Mathieu Begouen Demeaux | bassa | 81 → 80 | rendimento EUCF/WUCC -1 |
| Tchac | Benjamin Broussard | bassa | 78 → 80 | rendimento EUCF/WUCC +2 |
| Tchac | Vincent Lepagnol | bassa | 81 → 79 | rendimento EUCF/WUCC -2 |
| Tchac | Quentin Moneuse | bassa | 75 → 79 | rendimento EUCF/WUCC +4 |
| Tchac | Hélie Chestier | bassa | 77 → 78 | rendimento EUCF/WUCC +1 |
| Tchac | Thybaud Brazeau | bassa | 74 → 77 | rendimento EUCF/WUCC +3 |
| Tchac | Antoine Liron | bassa | 73 → 77 | rendimento EUCF/WUCC +4 |
| Tchac | Simon Madiot | bassa | 73 → 76 | rendimento EUCF/WUCC +3 |
| Wall City | Frederick Pollmeier | bassa | 89 → 88 | rendimento EUCF/WUCC -1 |
| Wall City | Ted Sither | bassa | 88 → 86 | rendimento EUCF/WUCC -2 |
| Wall City | Timon Eggenberg | bassa | 86 → 84 | rendimento EUCF/WUCC -2 |
| Wall City | Edward Garvey | bassa | 85 → 84 | rendimento EUCF/WUCC -1 |
| Wall City | Yannick Marburg | bassa | 84 → 83 | rendimento EUCF/WUCC -1 |
| Wall City | Jan Schmidt | bassa | 81 → 82 | rendimento EUCF/WUCC +1 |
| Wall City | Wieland Freimark | bassa | 79 → 81 | rendimento EUCF/WUCC +2 |
| Wall City | Stefan Kuhn | bassa | 81 → 80 | rendimento EUCF/WUCC -1 |
| Wall City | Vladislav Basov | bassa | 79 → 80 | rendimento EUCF/WUCC +1 |
| Wall City | Steffen Linnemannstöns | bassa | 77 → 79 | rendimento EUCF/WUCC +2 |
| Wall City | Joel Clutton | bassa | 76 → 78 | rendimento EUCF/WUCC +2 |
| Wall City | Krzysztof Zając | bassa | 74 → 78 | rendimento EUCF/WUCC +4 |
| Wall City | Lucas Johnson | bassa | 72 → 76 | rendimento EUCF/WUCC +4 |
| Wall City | Jannis Wenderholm | bassa | 71 → 75 | rendimento EUCF/WUCC +4 |

## Anomalie rimaste (dati insufficienti, non forzate)

- **One Tribe (84,9)** resta sopra Chevron (83,7) e NLSU (83,2): le sue punte hanno affidabilità alta (nazionali) e non si toccano, e non ci sono prove sufficienti per rivedere gli altri. Se la gerarchia europea deve venire prima, serve una fonte che documenti quei giocatori.
- **Cotarica e La Fotta giocano l'EUCF come squadra unica** (Grandes + Runners, Offence + Defense): la potenza si calcola per rosa. Unendo le due rose con la formula si ottengono 87,4 (Cotarica) e 89,8 (La Fotta). Il gioco le tratta ancora come squadre separate (anche per i posti all'EUCF: `euPick` prende le prime tre per potenza).
- **Rose italiane di 14-16 giocatori** (ne conosciamo solo i giocatori elencati) contro i 27-28 dei club europei del foglio: oltre il 14º la profondità italiana non è documentata e vale al più il 5%; il posto vuoto costa poco (fill di 8 punti sotto il più debole).
- **Nazionali maggiori** (WUC 2024, EUC, World Games): non ho trovato roster e statistiche su portali pubblici raggiungibili; contano solo come affidabilità alta del foglio.
- **Bad Skid (79,2)** sta appena sopra Heidees (78,7) senza aver giocato l'EUCF: ha due giocatori a 91 e 88 con affidabilità alta. Non si abbassa senza prove.
- **Club fuori dal foglio** (Freezzz Beezzz one, Jetset Open, Heidees, club francesi e tedeschi): il livello viene dai dati statistici e da `LN_POW_FIX`/`LN_BONUS_FIX` (revisione precedente); in questo giro non sono stati toccati i singoli Overall.
- **USA**: nessun Overall modificato; le potenze cambiano solo per la formula. L'ordine delle prime (San Francisco Revolver, New York PoNY, Boston DiG, Raleigh, Chicago Machine) è coerente con i WUCC 2026 (1º, 2º e 5º posto di Revolver, PoNY e Chicago Machine), ma non c'è un confronto diretto per gli altri club.

## Test

- `npm test` (controlli statici, motore, prova nel browser comprese carriera di 12 stagioni, mercato, salvataggi, leghe europee e USA): superato.
- `node tools/test-ovr.js`: superato, con il nuovo controllo che affidabilità alta, forzati e aggiunti a mano non siano alterati.
- `node tools/test-bilanci.js` (economia di tutti i campionati, crescita dalla Serie C G1-G6, altre leghe): rispettati. Crescita: Serie A entro la 6ª stagione 18 su 18, primo scudetto entro la 10ª 12 su 18 (prima 11), vittorie 71% (prima 70%).
- Nuova prova «Potenza di squadra» nella carriera di prova: ordine per profondità, rose corte (7, 10, 12, 14), oltre il 21º nessuno conta, un rincalzo debole non alza mai la potenza.

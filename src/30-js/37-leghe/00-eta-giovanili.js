/* ===================== ETA': LIMITI DALLE CONVOCAZIONI GIOVANILI (U17, U20, U24) =====================
   Chi ha giocato una nazionale giovanile non ha piu' dell'eta' del torneo piu' gli anni passati: qui sta l'eta' massima nel 2026 (limite) di 232 giocatori dei club del gioco
   la cui eta' non e' nota. Si legge in lnHiOf (37-leghe/02-roster-lega.js): se la stima casuale supera il limite, l'eta' diventa un valore tra limite-3 e limite-1.
   Fonti pubbliche (liste di giocatori di ogni partita, solo nome e nazionale; nessuna data di nascita): WFDF World Under-24 2023 (limite 27) e 2025 (25), WFDF World Junior U20 2024 (22) e 2026 (20),
   EYUC U20 2023 (23) e 2025 (21), EYUC U17 2024 (19) e 2026 (17), dai portali dei risultati WFDF e EUF. Contano le squadre Open e miste (non le femminili) e solo la nazionale del paese del club
   (per i club USA anche il Canada), cosi' un omonimo straniero non abbassa l'eta' di nessuno. Ai giocatori con eta' esatta non cambia nulla. Si rigenera dai portali, non si ritocca a mano. */
const LN_AGE_HI={
   'Aaron Bartlett':25,'Aäron Vlieghe':25,'Adam Grossberg':25,'Adam Miller':27,'Aidan Downey':27,'Albert Yuan':27,'Alex Bradshaw':25,'Alex Nelson':25,
   'Alexandre Leroutier':22,'Andrew Sweetnam':27,'Antoine Dubé':25,'Anton Franz':23,'Anton Orme':25,'Araav Sehgal':25,'Archie Ainsworth':25,'Arne Geernaert':25,
   'Arthur Moyersoen':27,'Arthur Negre':21,'Arthur Oudomphong':25,'Aubin Laurent Beaulieu':22,'Auriel Vaultier':20,'Barnabé Earl-Anstee':21,'Bavo Delanote':19,
   'Bela Luksch':27,'Ben Hudson':20,'Ben Korte':22,'Ben Skelton':25,'Ben Tempest':27,'Ben Tennant':25,'Benjamin Jonkers':27,'Benjamin Schenk':19,'Benjamin Schlechter':25,
   'Benjamin Steinhoff':19,'Bodhi Weston':20,'Bono Vandamme':19,'Brayden Morrison':22,'Broes Delanote':22,'Bryn McColl':25,'Calvin Stoughton':27,'Cameron Levine':22,
   'Cameron Weir':25,'Carl Christensen':27,'Carter Bayer':22,'Casper Thijs':25,'Castor Gruwez':19,'Cedar Hines':22,'Cedric Feller':25,'Célian Martin':23,
   'Chackgarin Brown':27,'Charles Guay':27,'Charles Willems':22,'Charlie Dighero':27,'Christian Belus':25,'Corentin Schiettecatte':27,'Corentin Wilkin':19,
   'Cullen Baker':25,'Daan De Marrée':27,'Daniel Landesman':27,'Declan Miller':25,'Devon Bringeland-Powell':27,'Dexter Clyburn':25,'Diego Wilkin':20,'Ebe Abts':23,
   'Eli Fried':25,'Elliot Hawkins':22,'Emil Fernkorn':20,'Emile De Staercke':20,'Enrique Albarracin':21,'Enzo Stanguennec':22,'Ethan Austin-Cruse':20,'Ethan Lieman':22,
   'Ethan Morrell':27,'Ethan Petit':19,'Felix Henning':20,'Felix Meyer':25,'Felix Moren':25,'Finn Leiner':22,'Frederick Farah':27,'Gaetan Vanden Broeck':27,
   'Gaspard Calligaro':21,'Gaspard Terrier':22,'Gero Böhm':23,'Gregoire Peterkenne':21,'Gustav Arnold':27,'Han Pisano':19,'Hayden Austin-Knab':27,'Henry Brooking':27,
   'Henry Ing':27,'Isaac Lee':25,'Jack Slater':25,'Jacob Cowan':27,'Jacques Nissen':27,'Jacques Odenkirchen':21,'Jakob Brissette':27,'Jakob Faß':23,'Jasper Linde':27,
   'Jelle Eeckelaerts':22,'Jérémie Giard':25,'Jérôme Deridder':25,'John Petersen':22,'Jona Beatse':21,'Jonas Taquin':25,'Jonas Vileikis Lopez':22,'Jonny Evans':27,
   'Joppe Schevenels':20,'Josh Hanham':27,'Josh Singleton':25,'Jules Lamare':22,'Julien Bernat':27,'Justin Podnar':25,'Kai O’Donnell':22,'Kalle Fernkorn':17,
   'Kamiel Van Mullem':25,'Kevin Pignone':27,'Kobe Ongena':19,'Konrad Boehm':20,'Kyle Lew':25,'Lander Decraene':25,'Landon Lavoie':27,'Lars Vanderbeck':27,
   'Léo Cheret':25,'Leo Gordon':27,'Leo Sovell-Fernandez':27,'Leon Pannemans':19,'Leopold Boehm':23,'Linus Ameeuw':21,'Linus Luksch':27,'Lochlan Margison':25,
   'Lorenzo Lateur':21,'Loris Coeckelberghs':20,'Louis Betrancourt':25,'Louis Corthout':25,'Louis Dawans':25,'Louis Fernandes':20,'Lucas Coniaris':27,'Lucas Dippel':27,
   'Lucca Rogissart':25,'Martin Gallant':27,'Mason Stone':22,'Matisse Claes':22,'Matt Claes':20,'Max Pettenuzzo':25,'Maxime Ayad':25,'Maximilian Matschulat':25,
   'Melvyn Brichet':25,'Mica Glass':25,'Micah Davis':22,'Micah Wagner':22,'Michael Poe':25,'Miles Grovic':25,'Miles Wong':22,'Milo Lafitte':19,'Moritz Lehmann':23,
   'Nathan Buchholz':27,'Nathan De Morgan':22,'Nathanaël Le Marois':22,'Neal Zeng':22,'Neo Debroux':25,'Nicolas Hoquez':27,'Ninon Crombez':19,'Nis-Julius Sontag':27,
   'Nyle Lebbell':25,'Olivier Gibert':21,'Orion Cable':27,'Oscar Graff':25,'Oscar Stonehouse':25,'Owen Erdman':20,'Paul Herkens':27,'Paul Krenik':25,'Paul Rickerts':27,
   'Peter Boerth':25,'Pierjan Deforce':20,'Pollie Baert':19,'Quentin Peltier':25,'Quentin Peschard':22,'Raekwon Adkins':25,'Raf De Vlaemynck':22,'Rana Sarin':25,
   'Raphaël Caudron':22,'Raphaël Chareix':20,'Raphaël Lalonde-Landry':27,'Raven Proot':23,'Reiyu Rakotomamonjy':20,'Rex Yuen':22,'Rhodri Williams':27,'Richard Mcleod':27,
   'Ricky Tran':25,'Robbe Wets':25,'Robert Pantling':21,'Robin Vickers Batzdorf':25,'Ronan Kelly':25,'Rupert Pantling':21,'Rutledge Smith':25,'Ryan duSaire':22,
   'Ryan Shigley':25,'Ryley Ross':25,'Sam Criddle':27,'Sam Grossberg':22,'Sam Hill':21,'Sam Leggott':25,'Samir Boumalal':25,'Scott Heyman':27,'Sofiène Bontemps':25,
   'Staf Decraene':21,'Stan Coppejans':19,'Stan De Clercq':20,'Stan Vanhecke':25,'Stefan McCall':20,'Stern Ongenaet':19,'Thomas Beernaert':23,'Thomas Oliver':27,
   'Thomas Shope':22,'Thorben Haag':27,'Tobias Brooks':25,'Tobias Maierhofer':27,'Tristan Yarter':27,'Tuur Geernaert':22,'Vadim Andrien':20,'Vincent Wagner':27,
   'Warre Feys':19,'Warre Van Hulle':21,'Wesse Thijs':22,'Wieland Freimark':27,'Wil Moore':22,'Will Jackson':25,'William St-Pierre':27,'William Wettengel':25,
   'Wolf Oosterlinck':25,'Wolf Pannemans':21,'Yannick Marburg':25,'Ywan Cohonner':27,'Zeke Thoreson':25,
};

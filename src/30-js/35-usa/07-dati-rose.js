/* Nelle rose senza dati dei Nationals, le schede di Ultirzr riportano chi era iscritto in USA Ultimate.
   Si dà precedenza ai giocatori UFA recenti e a chi torna da più stagioni. Una rosa di gioco da 16 tiene
   i nomi già presenti e usa queste iscrizioni per i posti rimanenti. Le rose 2025 sono indicate accanto al club.
   Per questi giocatori il ruolo e il livello seguono il profilo del posto in rosa. */
const US_ROSTER_ADD={
  // https://www.ultirzr.app/team/43904/roster
  "Portland Red Tide":[
    "Cole Moore","Henry Babcock","Noah Backer","Kai DeLorenzo",
    "Ian Engler","Nicholas Dunbar","Olin Rhoads","Chuck Cantone",
    "Ryan Woodhouse","Aidan Hayes","Benjamin Payson","Boden Iris",
    "Cole Fairfield","Daniel Bronshvayg","Daniel Snider"
  ],
  // https://www.ultirzr.app/team/42767/roster
  "Amherst Sprout":[
    "Gavin Abrahamsson","Luca Harwood","Rustin Ingold-Smith","William Thornton",
    "Ben Ayres","Gabriel Franklin","Jeff Graham","Caelan McSweeney",
    "Galen Harwood","Jonah Barry","Kristof Rohaly-Medved","Leo Narbonne",
    "Nadav Berkman","Tomo Liou","Carl Crawford"
  ],
  // https://www.ultirzr.app/team/43765/roster
  "New York Blueprint":[
    "Sam Alston","Gavin May","Charlie Panarella","Kai Schniedergers",
    "Owen Marschall","Evan Ma","Ruozhou Ye","Jeffrey Voss",
    "Jesse Gan","Samuel Ross","Walter Roosa","Andrés Rodríguez Hernández",
    "Daniel Meiland","Noam Fisherman","Benjamin Elliott","Danny Klein"
  ],
  // https://www.ultirzr.app/team/43488/roster
  "Virginia Vault":[
    "Jarrod Banks","Kevin Healey","Leo Pierson","Xavier Schafer",
    "Joshua Lightner","Zachary Burpee","Jeff Wodatch","Kevin O'Malley",
    "Alex Turney","Dane Warner","Kees Humes","Rami Paust",
    "Sean Plunkett","Adam Norrbom","Casey Mann"
  ],
  // https://www.ultirzr.app/team/41958/roster
  "Oak Grove Boys":[
    "Rhys Bergeron","Couper Kerns","Dennis Maclaine","Joe Novak",
    "Joseph Evans","Nicholas Albright","Mike Vignali","Charles Stimpson",
    "Christopher Selwood","Ian Connerney","Travis Terrell","Hunter Lang",
    "Alex Pistolesi","Daniel Gribbin","Leif Hansen","Sean Phippen"
  ],
  // https://www.ultirzr.app/team/42345/roster
  "Pittsburgh Temper":[
    "Michael Dillard","Connor Newell","Noah Celuch","Dan Nichols",
    "Aiden Landis","Marcel Oliart","Will Hoffenkamp","Maxwell Olesen",
    "Joe Molder","Henry Everett","Lucas Storm","Drew Girard",
    "Thomas Mazur","Alexander Kirages","Ethan Campion","Jacob Rollins"
  ],
  // https://www.ultirzr.app/team/41891/roster
  "Garden State Ultimate":[
    "Dyllon Jeng","Aidan Magee","Tyler Mackey","Alexander Cretella",
    "Alec Bakholdin","Donovan Hugel","Michael Dzelzgalvis","Matt Krauss",
    "Gianluca Pagano","Tanner Yuhas","Christopher Iglesias","Julius Clyburn",
    "Cole Salomon","Cole Stevens","Eddie Kim","Evan Sapirman"
  ],
  // https://www.ultirzr.app/team/43449/roster
  "Raleigh-Durham United":[
    "Clint McSherry","Andrew Vande Berg","Dillon Bruer","Cam Bellando",
    "Jacob Louie","Angelo Olcese","William Coffin","Seth Weaver",
    "Ethan Baughman","Noah Bush","Caleb Louie","Myles Grady",
    "Nathaniel Donaher","Houston Parks"
  ],
  // https://www.ultirzr.app/team/41895/roster
  "Florida Untied":[
    "Jaime Perez","Ryan Hiser","Ryan Thomas","Michael Arbutine",
    "Unmil Patel","Clayton Partlow","David Witte","Garrett Knobel",
    "August Specht","Bhagya Patel","Bodie Cole","Jacob Gaines",
    "Joshua Webb","Justin Montalbano","Moses Jaffa","Ricardo DeLeon"
  ],
  // https://www.ultirzr.app/team/43479/roster
  "Charlotte baNC":[
    "Rudy Jimenez","Sean Wiles","Wesley Dudas","Dylan Lipps",
    "Samuel Lee","Damian Delgado","Tejas Sivarajakumar","Mason Cary",
    "Alex Ballentine","Nick Talone","Sathvik Avulapati","Jordan Perry",
    "Ryan Manuel","John Shelley","Addison Carnow","Carter Rathur"
  ],
  // https://www.ultirzr.app/team/41878/roster
  "Chattanooga Tanasi":[
    "Alex Stevenson","Jared Beazley","Yanni Killebrew","Daniel Robinson",
    "Colin Flowers","Neil Taylor","Braden Beebe","David Wilkins",
    "Pryce Bevins","Timothy Lumsdaine","William Fleming","Zeke Plewniak",
    "Charles Wheeler","Conor Coakley","Graham Barrett","Jacob Guzi"
  ],
  // https://www.ultirzr.app/team/42814/roster
  "Chicago Haymaker":[
    "Milan Rivas","Gabe Schoepke","Ian Falck","Malachi Neil",
    "John Marsh","Ray Mauntel","Jayden Feagans","Cam Copeland",
    "Tyler McCarthy","Ben Brink","Joseph Sifakis","Kyle Bayes",
    "Hunter Latson","Joel Willison","Dean Gottlieb"
  ],
  // https://www.ultirzr.app/team/41808/roster
  "Indianapolis I-69":[
    "Jake Wahl","Jason Kempe","Joel Close","Noah Wahl",
    "Jack Kempe","Mace Chope","Matthew Weaver","Hank Havlin",
    "Richard Ware","CJ Knarr","Owen Woodward","Bradley Kennis",
    "Samuel Ingham","Seth Gudeman","Benjamin Close","Sedrik Sweet"
  ],
  // https://www.ultirzr.app/team/43874/roster
  "Flying Dutchmen":[
    "Michael Ames","Nicholas Betsch","Jason Wherry","David Braden",
    "Dylan Hall","Eric Wright","Ian Vilevac","Joshua Venegas",
    "Aaron Lott","Alex Rudy","Anthony Sanderell","Brady Aneshansel",
    "Calvin Caldwell","Camron Chambers","Cooper Carson","Dalton Muck"
  ],
  // https://www.ultirzr.app/team/44195/roster
  "Trident":[
    "Nate Boddy","Reid Martin","Jacob Cuthbert","Nicholas Golini",
    "Cal Tornabene","Brian Rathunde","Reno Brinn","Asa Bowen",
    "Josh Deeman","Christian Holzl","Erikas Paulauskas","Joey Kennedy",
    "Aidan Wonderling","Alex Paulauskas","Elliot Shin","Jack Daenzer"
  ],
  // https://www.ultirzr.app/team/41645/roster
  "Madison Mad Men":[
    "John Tan","Shane Otis","Ted Schewe","Jack Nelson",
    "Mac Weber","Kelsen Alexander","Henry Goldenberg","Noah Petersen",
    "Branavan Yogarajah","Liam McDonald"
  ],
  // https://www.ultirzr.app/team/43797/roster
  "Minneapolis Mallard":[
    "Matthew Gunter","Kaiden Thiers","Josh Kautz","Anthony Jirele",
    "Akos Konkoly","John Helgeson","Alex Tsvetkov","Eli Schaberg",
    "Kenji Her","Alex Kraft","Evan Ellis","Jack Karlen",
    "Jedidiah Pratt","Johnny Haas","Leland Engelking","Max Posner"
  ],
  // https://www.ultirzr.app/team/42583/roster
  "Lounar":[
    "Evan Sebastian","Bryan Dunbar","Ryan Hays","Steven Ladenberger",
    "Drew Law","Dylan Doherty","Jacob Geisen","Joel Brown",
    "Michael Lahmeyer","Wilson Tryon","Ben Fuguet","Dillon Lee",
    "Dillon McGinnis","Hector Chaidez","Jackson Freeman","Jesse Zawitkowski"
  ],
  // https://www.ultirzr.app/team/42811/roster
  "Kansas City Smokestack":[
    "Anthony Chartier","Matthew Price","Mark Stedem","Spencer Roberts",
    "John Aucar","Luke Grieger","Aaron Johnson","Benton Habel",
    "Brock Hicks","Matthew Beers","Sam Habel","Tim Robbins",
    "Diego Butron","Joe Young","Jordan Becquer","JT Stancil"
  ],
  // https://www.ultirzr.app/team/42496/roster
  "Knights of Ni":[
    "Brendan Gessner","Justin Wollin","Joe Simonelli","Ashton Robinson",
    "Danny Gollin","Jason Finkelstein","Samuel Bumsted","Grayson Pangburn",
    "Bif Reiser","Cody Rondeau","Holden Fahnhorst","Jakob Yedo",
    "Max Wolpert","Michael Ruble","Samuel Fronek","Alex Kozitza"
  ],
  // https://www.ultirzr.app/team/43440/roster
  "Fungi":[
    "Nick Banks","Spencer Hawkins","Jeremy Knopf","Seth Faris",
    "Theodore Watkins","Nathan Ploeger","Timothy Elliott","Austin Gould",
    "Daniel Williams","Jorge Delgado","Dexter Luecke","Flynn Nyman",
    "James Miller","Morgan Scott","Rory Lenny","Sam Keller"
  ],
  // https://www.ultirzr.app/team/41870/roster
  "Alamode":[
    "Jordan Salazar","Benjamin Andrade","Gavin Hart","Axel Anderson",
    "Christian Paterka","Chase Stegall","Kevin McGloin","Blake Marlowe",
    "Drew Gullahorn","Joshua Gammon","Beau Fournet","Ben Stone",
    "Brandon Chow","Graham Hazlewood","Jaedron Mueller","James Crosnoe"
  ],
  // https://www.ultirzr.app/team/43408/roster
  "Boulder ISO Atmo":[
    "Ryan Allenson","Noah Sullivan","Conrad Hougen","Chris Fox",
    "Tyler Carr","Brian Ward","Caleb Bevers","Preston Goulson",
    "Andrew Soto","Matthew Pollard","Sam Sincere","Anthony Rice",
    "Brandon Garcia","Brett Prill","Alexander Brewster","Aston Horton"
  ],
  // https://www.ultirzr.app/team/43982/roster
  "ZOO":[
    "Mark Baldauf","Jon DeAmicis","Brian Street","David Hammer",
    "Matthew Sutton","Ashton Lewis","Akul Kadyan","Alex Perez",
    "Andrew Dorf","Ben Street","Cerdic Atwood","Eian Brent",
    "Evan Garner","Gavin Davis","Geoffrey Cheng","George Neely"
  ],
  // https://www.ultirzr.app/team/42332/roster
  "Eugene Dark Star":[
    "Conner Stillwell","Dan Baumgartner","Cole Eustis","Emmett Warner",
    "Will Dillender-Kinast","Zac Scheuerman","Archer Gordon","Julian Reeves",
    "Thomas Riedl","Kyle Hancock","Scott Radlauer","Kaenan Combs"
  ],
  // https://www.ultirzr.app/team/38974/roster (ultima rosa pubblica trovata, stagione 2025)
  "Salt Lake City Shrimp":[
    "Jace Duennebeil","Kyle Weinberg","Alex Forsberg","Nathan Huff",
    "Grayson Rettberg","Oscar Brown","Cole Stenseth","Ethan Wimmer",
    "Karl Staber","Porter Oyler","Derik Knighton","Porter Stobbe",
    "Jacob Miller","Braden Eberhard","Jensen Wells","Reed Browning"
  ],
  // https://www.ultirzr.app/team/41999/roster
  "SOUF":[
    "Austin Hasbrook","Marcus Beidler","Hai Trang","Joshua Robancho",
    "Justin Jones","Matthew Liu","Martin Le","Abraham Gebreyesus",
    "Victor Ramirez","Jordan Smith","Isaac Woldemariam","Zhi Chen",
    "Akash Shrestha","Alan Huang","Alan Walker II"
  ],
  // https://www.ultirzr.app/team/42134/roster
  "SoCal Condors":[
    "Bryce Lozinski","Matt Miller","Clark Wang","Mateo Dominguez",
    "Daniel Brunker","Jonathan McGurrin","Shun Iwata","Spencer Sih",
    "Kevin Goldberg","Jeff Silverman","Bailey Prochaska","Ryan Carmichael",
    "Dan Cunningham"
  ],
  // https://www.ultirzr.app/team/43679/roster
  "Bay Area Wavestorms":[
    "Jackson Waite-Himmelwright","Xavier Prochaska","Ben McAuliffe","Benjamin Pratt",
    "Billy Peir","Chris Kaspar","Colby Downs","Connor McGinley",
    "Cullen Keefe","Elliot Mok","Ethan McLaughlin","Finnegan Barr",
    "Hayden King","Henry Bellevin"
  ],
  // https://www.ultirzr.app/team/43439/roster
  "Arizona Nighthawk":[
    "Elijah Salmon","Shane Davidson","Adam Whitton","Jonah Rominski",
    "Mario Verdugo","Connor Garrison","Alex Van Der Geest","Jeremy Harris",
    "Joshua Saad","Caden Sigerud","Brandon Watabe","Jake Hageman",
    "Jake Paulson","Joshua Walsh","Nathan Paauw"
  ],
  // https://www.ultirzr.app/team/40585/roster (ultima rosa pubblica trovata, stagione 2025)
  "Hazard":[
    "Cy Toriello","James Ivey","Royce Grundy","Victor Zhivich",
    "Andrew Padula","Hudson Stuck","Francesco Russo","Isaac Hsu",
    "Liam Bestian","Thomas Anderson","Tucker Lemos","David Gardiner",
    "Remy Smith","Adam Paicely","Garrett Yung","Jason Paul"
  ]
};

// Età compiute nel 2026 dalle schede pubbliche WatchUFA. Si conservano solo le età.
const US_ROSTER_AGE={
  "aiden landis":27,   // https://www.watchufa.com/league/players/alandis
  "alex stevenson":32,   // https://www.watchufa.com/league/players/astevenso
  "alexander kirages":22,   // https://www.watchufa.com/league/players/akirages
  "alston sam":29,   // https://www.watchufa.com/league/players/salston
  "ames michael":36,   // https://www.watchufa.com/league/players/mames
  "andrew padula":34,   // https://www.watchufa.com/league/players/apadula
  "angelo olcese":30,   // https://www.watchufa.com/league/players/aolcese
  "anthony jirele":26,   // https://www.watchufa.com/league/players/ajirele1
  "archer gordon":29,   // https://www.watchufa.com/league/players/agordon
  "baumgartner dan":29,   // https://www.watchufa.com/league/players/dbaumgart
  "bergeron rhys":30,   // https://www.watchufa.com/league/players/rbergeron
  "bestian liam":31,   // https://www.watchufa.com/league/players/lbestian
  "betsch nicholas":30,   // https://www.watchufa.com/league/players/nbetsch
  "brendan gessner":32,   // https://www.watchufa.com/league/players/bgessner
  "brunker daniel":28,   // https://www.watchufa.com/league/players/dbrunker
  "bryce lozinski":29,   // https://www.watchufa.com/league/players/blozinski
  "caden sigerud":26,   // https://www.watchufa.com/league/players/csigerud
  "cal tornabene":29,   // https://www.watchufa.com/league/players/ctornaben
  "campion ethan":27,   // https://www.watchufa.com/league/players/ecampion
  "cary mason":29,   // https://www.watchufa.com/league/players/mcary
  "celuch noah":29,   // https://www.watchufa.com/league/players/nceluch
  "chope mace":24,   // https://www.watchufa.com/league/players/mchope
  "clark wang":30,   // https://www.watchufa.com/league/players/cwang
  "clayton partlow":29,   // https://www.watchufa.com/league/players/cpartlow
  "clint mcsherry":33,   // https://www.watchufa.com/league/players/cmcsherry
  "close joel":24,   // https://www.watchufa.com/league/players/jclose
  "coffin william":33,   // https://www.watchufa.com/league/players/wcoffin
  "cole eustis":26,   // https://www.watchufa.com/league/players/ceustis
  "combs kaenan":25,   // https://www.watchufa.com/league/players/kcombs
  "conner stillwell":27,   // https://www.watchufa.com/league/players/cstillwel
  "connor newell":28,   // https://www.watchufa.com/league/players/cnewell
  "cy toriello":26,   // https://www.watchufa.com/league/players/ctoriello
  "dan nichols":26,   // https://www.watchufa.com/league/players/dnichols
  "david hammer":32,   // https://www.watchufa.com/league/players/dhammer
  "david witte":28,   // https://www.watchufa.com/league/players/dwitte
  "davidson shane":27,   // https://www.watchufa.com/league/players/sdavidson
  "deamicis jon":34,   // https://www.watchufa.com/league/players/jdeamicis
  "dillard michael":30,   // https://www.watchufa.com/league/players/mdillard
  "dominguez mateo":25,   // https://www.watchufa.com/league/players/mdomingue
  "dunbar nicholas":30,   // https://www.watchufa.com/league/players/ndunbar
  "dunn travis":35,   // https://www.watchufa.com/league/players/tdunn
  "elijah salmon":24,   // https://www.watchufa.com/league/players/esalmon
  "elliott timothy":21,   // https://www.watchufa.com/league/players/telliott
  "emmett warner":23,   // https://www.watchufa.com/league/players/ewarner1
  "everett henry":22,   // https://www.watchufa.com/league/players/heverett
  "falck ian":23,   // https://www.watchufa.com/league/players/ifalck
  "faris seth":28,   // https://www.watchufa.com/league/players/sfaris
  "francesco russo":24,   // https://www.watchufa.com/league/players/frusso
  "gabe schoepke":22,   // https://www.watchufa.com/league/players/gschoepke
  "goldberg kevin":31,   // https://www.watchufa.com/league/players/kgoldberg
  "goldenberg henry":28,   // https://www.watchufa.com/league/players/hgoldenbe
  "grayson pangburn":38,   // https://www.watchufa.com/league/players/gpangburn
  "grundy royce":27,   // https://www.watchufa.com/league/players/rgrundy
  "gudeman seth":28,   // https://www.watchufa.com/league/players/sgudeman
  "hawkins spencer":28,   // https://www.watchufa.com/league/players/shawkins
  "hiser ryan":30,   // https://www.watchufa.com/league/players/rhiser
  "hoffenkamp will":28,   // https://www.watchufa.com/league/players/whoffenka
  "houston parks":32,   // https://www.watchufa.com/league/players/hparks
  "hsu isaac":28,   // https://www.watchufa.com/league/players/ihsu
  "hudson stuck":30,   // https://www.watchufa.com/league/players/hstuck
  "ingham samuel":23,   // https://www.watchufa.com/league/players/singham
  "ivey james":34,   // https://www.watchufa.com/league/players/jivey
  "iwata shun":25,   // https://www.watchufa.com/league/players/siwata
  "jack kempe":22,   // https://www.watchufa.com/league/players/jkempe1
  "jacob rollins":21,   // https://www.watchufa.com/league/players/jrollins
  "jake wahl":22,   // https://www.watchufa.com/league/players/jwahl
  "jason kempe":25,   // https://www.watchufa.com/league/players/jkempe
  "jason wherry":28,   // https://www.watchufa.com/league/players/jwherry
  "jeremy knopf":30,   // https://www.watchufa.com/league/players/jknopf
  "joe simonelli":34,   // https://www.watchufa.com/league/players/jsimonell
  "joel willison":29,   // https://www.watchufa.com/league/players/jwillison
  "joey kennedy":27,   // https://www.watchufa.com/league/players/jkennedy
  "jonah rominski":23,   // https://www.watchufa.com/league/players/jrominski
  "jonathan mcgurrin":22,   // https://www.watchufa.com/league/players/jmcgurrin
  "jordan perry":28,   // https://www.watchufa.com/league/players/jperry
  "jordan smith":24,   // https://www.watchufa.com/league/players/jsmith2
  "josh kautz":34,   // https://www.watchufa.com/league/players/jkautz
  "julian reeves":26,   // https://www.watchufa.com/league/players/jreeves
  "lemos tucker":30,   // https://www.watchufa.com/league/players/tlemos
  "lucas storm":23,   // https://www.watchufa.com/league/players/lstorm
  "mackey tyler":23,   // https://www.watchufa.com/league/players/tmackey
  "malachi neil":23,   // https://www.watchufa.com/league/players/mneil
  "marcel oliart":28,   // https://www.watchufa.com/league/players/moliart
  "martin reid":27,   // https://www.watchufa.com/league/players/rmartin
  "matt miller":27,   // https://www.watchufa.com/league/players/mmiller1
  "mauntel ray":26,   // https://www.watchufa.com/league/players/rmauntel
  "maxwell olesen":26,   // https://www.watchufa.com/league/players/molesen
  "mccarthy tyler":23,   // https://www.watchufa.com/league/players/tmccarthy
  "milan rivas":29,   // https://www.watchufa.com/league/players/mrivas
  "noah wahl":25,   // https://www.watchufa.com/league/players/nwahl
  "owen woodward":21,   // https://www.watchufa.com/league/players/owoodward
  "porter stobbe":23,   // https://www.watchufa.com/league/players/pstobbe
  "radlauer scott":32,   // https://www.watchufa.com/league/players/sradlauer
  "scheuerman zac":30,   // https://www.watchufa.com/league/players/zscheuerm
  "seth weaver":28,   // https://www.watchufa.com/league/players/sweaver
  "sih spencer":25,   // https://www.watchufa.com/league/players/ssih
  "victor zhivich":35,   // https://www.watchufa.com/league/players/vzhivich
};

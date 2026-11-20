/* Riserve e titolari dai tornei Open, per coprire i posti privi di nomi nei dati di partenza.
   Se l'outdoor non basta, si usa la stessa squadra nelle iscrizioni indoor o negli altri tornei.
   Le fonti accanto ai nomi permettono di ricontrollare i passaggi fra squadre dello stesso club. */
const LN_BE_ADD={
  "Jetset Open":[
    // https://ultie.org/tt26/teams/5306/roster
    ["Deslypere","Mathias"],
    ["Ravier","Elias"],
    ["Jacques","Tieme"],
    ["Geyens","Mil"],
  ],
  "Armada Open":[
    // https://ultie.org/tt26/teams/5349/roster
    ["Stasse","Arcady"],
  ],
  "Eulchtimate Open 1":[
    // https://ultie.org/buoc-2026-adult/teams/5181/roster
    ["Souquière","François"],
    ["Dectot","Basile"],
    ["Plou","Clément"],
    ["Benmussa","Etienne"],
    ["Bloch","Frédéric"],
    // https://ultie.org/buic-2627-adults/teams/6026/roster
    ["Beauchemin","Siméon"],
    // Il club pubblica il cognome per esteso: https://www.eulchtimate.fr/
    ["Le Cloirec","Gildas"],
  ],
  "Gentle Open Too":[
    // https://ultie.org/buoc-2026-adult/teams/5132/roster
    ["Vertongen","Boris"],
  ],
  "Blackbirds Open 1":[
    // https://ultie.org/buoc-2026-adult/teams/5072/roster
    ["Paulus","Juan"],
    ["Morel de Westgaver","Quentin"],
    ["Bouffard","Alistair"],
    ["Innocente","Marco"],
    ["Wehrheim","Felix"],
    ["Schoofs","Victor"],
    ["Magerat","Alexandre"],
    ["Gilleman","Corentin"],
    ["Brousmiche","Simon"],
  ],
  "Jetset Open 2":[
    // https://ultie.org/buoc-2026-adult/teams/4900/roster
    ["Kennes","Robbe"],
    ["Vandesompele","Jorben"],
    ["Van Noten","Pieter"],
  ],
  "Flying Rabbits Katch-up":[
    // https://ultie.org/buoc-2026-adult/teams/5093/roster
    ["Legat","Guillaume"],
    ["Dayez","Matthieu"],
    ["Prischl","Andreas"],
    ["Verstraeten","Nathan"],
    ["Amrom","Victor"],
    ["Vanwijck","Linus"],
    ["Leroy","Maxime"],
    ["Messens","Maxime"],
    ["Geron","Melih"],
    ["Estandarte","Allan"],
    ["Gladsteen","Theo"],
    ["Tagliaferri","Mathieu"],
    ["Canon","Martin"],
    // https://ultie.org/buic-2627-adults/teams/5956/roster
    ["Antonelli","Enea"],
  ],
  "Antwerp Ultimate Open":[
    // https://ultie.org/buoc-2026-adult/teams/4894/roster
    ["Smith","Gregory"],
    ["Van Boxelaere","Toon"],
    ["Häggblom","Erasmus"],
    ["Hoedemaekers","Bart"],
    ["Laporte","Jord"],
    ["Pinxten","Wouter"],
    ["Palm","Samuel"],
    ["Marchal","Daan"],
    ["Peeters","Jeroen"],
    ["Bos","Thomas"],
    // https://ultie.org/buic-2627-adults/teams/5845/roster
    ["Van Cleempoel","Natan"],
    ["Maes","Kai"],
  ],
  "Les Hiboux Glorieux":[
    // https://ultie.org/buic-2627-adults/teams/5983/roster
    ["Rovai","Antonin"],
    ["Renard","Inti"],
    ["Pham","Phuong"],
    ["Sohier","Julien"],
    ["Vanhorle","Sam"],
    ["Damuseau","Matthieu"],
    // https://ultie.org/buic-2526/teams/4356/roster
    ["Gatineau","Edouard"],
    ["Tarrant","Duncan"],
    ["Legrand","Antoine"],
  ],
  "Freezzz Beezzz HIVE":[
    // https://ultie.org/buoc-2026-adult/teams/4831/roster
    ["De Meyere","Obe"],
  ],
  "XL Open 1":[
    // https://ultie.org/buoc-2026-adult/teams/4833/roster
    ["Desmet","Mitja"],
    ["Vanden Bemden","Max"],
    ["Burgher","Maxime"],
  ],
  "KUFC":[
    // https://ultie.org/buoc-2026-adult/teams/4970/roster
    ["Coeman","Maarten"],
  ],
  "Oufti-Ké-Rêve":[
    // https://ultie.org/buic-2627-adults/teams/5928/roster
    ["Lombart","Martin"],
    ["Debande","Vivien"],
  ],
  "VOS Open":[
    // https://ultie.org/buic-2526/teams/4426/roster
    ["Drumont","Nienke"],
    ["Hapers","Jenthe"],
    ["Claeys","Liesbeth"],
    ["Cattoor","Ralphie"],
  ],
  "Flywin open 1":[
    // https://ultie.org/buoc-2026-adult/teams/5081/roster
    ["De Bouw","Jonathan"],
    ["Stasse","Quentin"],
    ["Mudioko","Pierre-Emmanuel"],
    ["Dupriez","Damien"],
    ["Masscheleyn","Pierre-Antoine"],
    ["Claude","Damien"],
    ["Dupriez","Maël"],
    ["Albers","Pieter"],
    ["Berwart","Martin"],
    ["Fostier","Adrien"],
    ["Verkenne","Martin"],
    // https://ultie.org/buic-2627-adults/teams/5825/roster
    ["Bottequin","Clémence"],
    ["Quevrin","Emile"],
    // https://ultie.org/buic-2526/teams/4441/roster
    ["Mortiaux","Noé"],
    ["Widart","Emile"],
  ],
  "Stoemps Burrata":[
    // https://ultie.org/buoc-2026-adult/teams/4967/roster
    ["Cumps","Youri"],
    ["Péro Nussbaum","Alexandre"],
    ["Vandermeersch","Cédric"],
    ["Picard","Jonathan"],
    ["Perignon","Laurent"],
    ["Berckmans","Pascal"],
    ["Detollenaere","Siméon"],
    ["Crul","Thibaut"],
    ["Coene","Donra-Chaï"],
    ["Theunissen","Guillaume"],
    ["De Vadder","Simon"],
    // https://ultie.org/buic-2627-adults/teams/5878/roster
    ["Concha","Yvan"],
    // https://ultie.org/buic-2526/teams/4434/roster
    ["Rappe","Alexandre"],
    ["Delacroix","Harold"],
  ],
  "Zero Gravity":[
    // https://ultie.org/buoc-2026-adult/teams/4837/roster
    ["Bauweraerts","Aleksander"],
    ["Aerts","Kelly"],
    // https://ultie.org/buic-2627-adults/teams/5889/roster
    ["Valcke","Noah"],
  ],
  "Ultimate Delux O":[
    // https://ultie.org/buoc-2026-adult/teams/4911/roster
    ["Kršek","Lukáš"],
    ["Fella","Yannick"],
    ["Sharma","Sparsh"],
    ["Le Lann","Erwan"],
    ["Becker","Björn"],
    ["Krebs","Bob"],
    ["Mailloux-Labrousse","Marc-Antoine"],
    ["Raphael","Matthieu"],
    ["Karttunen","Arvi"],
    ["Fulconis","Thierry"],
    ["Trapella","Michele"],
  ],
  "Les Chouettes Glorieuses":[
    // https://ultie.org/buic-2627-adults/teams/5985/roster
    ["Ledent","Raphael"],
    ["Patz","Michel"],
    ["Hulet","Brice"],
    ["Pollet","Victoria"],
    ["Burattini","Massi"],
    // https://ultie.org/buic-2627-adults/teams/5984/roster
    ["Jesuran","Elie"],
    ["Maes","Philippe"],
    ["Manneback","Nicolas"],
    ["Boisse-Despiaux","Nicolas"],
    ["Black","Gautier"],
    ["Di Ciccio","Francesco"],
    ["Wiberg","Max"],
  ],
  "Red Nuts":[
    // https://ultie.org/buic-2627-adults/teams/5839/roster
    ["Desguin","Benoît"],
  ],
  "Freespect":[
    // https://ultie.org/buoc-2026-adult/teams/4982/roster
    ["Geutjes","Fedor"],
    ["Balemans","Xander"],
    ["Sleebus","Quinten"],
    ["Xu","Tjang"],
    ["Lefebvre","Jarmo"],
    ["Janssens","Toon"],
    ["Verbist","Willem"],
  ],
  "Mighty DUCs":[
    // https://ultie.org/buic-2627-adults/teams/5935/roster
    ["Lybeert","Daan"],
    ["Segers","Lennert"],
    ["Mettepenningen","Lars"],
    ["Van Biesen","Glenn"],
    ["Gheyssens","Sander"],
    ["Hurckmans","Alex"],
    // https://ultie.org/buic-2526/teams/4463/roster
    ["Van Biesen","Paulin"],
    ["Mertens","Marte"],
    ["Basyn","Karen"],
    ["Bernauw","Koen"],
    ["Dessein","Niels"],
    ["Nobels","Dafne"],
    ["Vervaet","Alexander"],
  ],
  "White Foxes Open":[
    // https://ultie.org/buic-2627-adults/teams/5891/roster
    ["Boi","Stefano"],
    // https://ultie.org/buic-2627-adults/teams/5890/roster
    ["Nowé","Sylvain"],
    ["Vancompernolle","Amaury"],
    // https://ultie.org/buic-2526/teams/4374/roster
    ["Gomez","Gaetan"],
    ["Meirlaen","Matthias"],
    ["Denotte","Mathieu"],
    // https://ultie.org/buic-2526/teams/4375/roster
    ["Alvarez","David"],
  ],
  "Helgtre Knallers":[
    // https://ultie.org/buoc-2026-adult/teams/4964/roster
    ["Wynants","Liam"],
    ["Kelchtermans","Tristan"],
    ["Lemmens","Robbe"],
    ["Vaes","Bieke"],
    ["Vandendries","Maxim"],
    ["Fransen","Zander"],
    ["Stesmans","Cas"],
  ],
  "Diabolic Heaven Open 2":[
    // https://ultie.org/buoc-2026-adult/teams/4824/roster
    ["De Cleene","Jan"],
    ["Mouton","Mathias"],
    ["Mentens","Bavo"],
    ["Ballet","Ruben"],
    ["Donckers","Freek"],
    ["Fuertes","Osel"],
    ["Mouton","Steve"],
    ["Swinnen","Jani"],
  ],
  "Lievegem Frisbee Team":[
    // https://ultie.org/buoc-2026-adult/teams/5001/roster
    ["Verheughe","Vincent"],
    ["Delanote","Jonas"],
    ["Stuyck","Felix"],
  ],
  "Eulchtimate Open 2":[
    // https://ultie.org/buic-2627-adults/teams/6027/roster
    ["Lespagnol","Rémy"],
  ],
  "Frisco Duro":[
    // https://ultie.org/buoc-2026-adult/teams/5010/roster
    ["Mihakova","Eliska"],
    ["Morobe","Casimir"],
    ["Gaeremynck","Florian"],
  ],
  "PUF":[
    // https://ultie.org/buoc-2026-adult/teams/4922/roster
    ["Roelandt","Stef"],
    // https://ultie.org/buic-2627-adults/teams/5801/roster
    ["Zenner","Dimitri"],
    ["Brants","Mike"],
    ["De Bruyn","Kieran"],
  ],
  "Stoemps Antipasti":[
    // https://ultie.org/buoc-2026-adult/teams/4968/roster
    ["Comte-Offenbach","Elioth"],
    ["De Changy","Louise"],
    ["Brown","Andreas"],
    ["Comte-Offenbach","Clara"],
    ["Hallali","Dana"],
    ["Horth","Emilie"],
    ["Janssens","Antoine"],
    ["Marneffe","Oriane"],
    ["Noach","Magali"],
    ["Van der Auwera","Maarten"],
    ["Eichinger","Clara"],
  ],
  "Cerfs de Bure":[
    // https://ultie.org/buic-2627-adults/teams/6060/roster
    ["Lisse","Julien"],
  ],
  "Jetset Zeppelins":[
    // https://ultie.org/buoc-2026-adult/teams/4829/roster
    ["Scheepmans","Wouter"],
    ["Punter","Feye"],
    ["Thiry","Christophe"],
    ["Dubois","Florian"],
    ["Deprez","Bert"],
    ["Van der Perren","Wannes"],
    ["Ronsmans","Joris"],
    ["Sterckx","Lukas"],
    ["Cockaerts","Kwinten"],
    ["Gurung","Pabitra"],
    ["Dannaux","Jolan"],
  ],
};
/* Intervalli al 2026, chiavi compatibili con usNameKey. Zero indica un estremo non documentato.
   Una convocazione permette di correggere la stima. Le età esatte hanno precedenza. */
const LN_BE_AGE={
  // https://emuc-schedule.ultimatefederation.eu/?team=52&view=teamcard
  "alexandre detiffe":[30,0],
  "damuseau matthieu":[30,0],
  "duncan tarrant":[30,0],
  "edouard gatineau":[30,0],
  "emmanuel mudioko pierre":[30,0],
  "fery vanhemelryck":[30,0],
  "hancisse olivier":[30,0],
  "inti renard":[30,0],
  "julien sohier":[30,0],
  "lacko paul":[30,0],
  "pham phuong":[30,0],
  "pinxten wouter":[30,0],
  // https://emuc-schedule.ultimatefederation.eu/?team=72&view=teamcard
  "adrien andre":[30,0],
  "alain pierre zapha":[30,0],
  "antoine legrand":[30,0],
  "bobby clements":[30,0],
  "brice vanhee":[30,0],
  "de mesmaeker nicolas":[30,0],
  "koen verpoorten":[30,0],
  "lombart martin":[30,0],
  // https://emuc-schedule.ultimatefederation.eu/?team=79&view=teamcard
  "adil nahjari":[37,0],
  "arnaud evrard":[37,0],
  "baets de nathan":[37,0],
  "bernard laere van":[37,0],
  "bert desmet":[37,0],
  "boi stefano":[37,0],
  "cedric pasque":[37,0],
  "garcia gomez martin":[37,0],
  "geoffrey use":[37,0],
  "heiderscheidt jerome":[37,0],
  "henri verkenne":[37,0],
  "schevenels willem":[37,0],
  // https://emucc-schedule.ultimatefederation.eu/index.php?team=39&view=teamcard
  "bloch frederic":[36,0],
  "cloirec gildas le":[36,0],
  "francois souquiere":[36,0],
  // https://eyuc-schedule.ultimatefederation.eu/?team=86&view=teamcard
  "ameeuw linus":[0,20],
  "beatse jona":[0,20],
  "boris vertongen":[0,20],
  "lateur lorenzo":[0,20],
  // https://results.wfdf.sport/wjuc-2026/?view=teamcard&team=3
  "andrien vadim":[0,19],
  "claes matt":[0,19],
  "cleempoel natan van":[0,19],
  "clercq de stan":[0,19],
  "coeckelberghs loris":[0,19],
  "de emile staercke":[0,19],
  "deforce pierjan":[0,19],
  "diego wilkin":[0,19],
  "dumon william":[0,19],
  "joppe schevenels":[0,19],
  "kai maes":[0,19],
  // https://www.guido.be/fr/News/ArticleDetail/tabid/225/ArticleId/8437/modid/904/page/469/Default.aspx
  "arthur vande weghe":[29,30],
};

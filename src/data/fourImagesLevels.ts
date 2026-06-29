export interface Level {
  word: string;
  charKeywords: string[];
  hint: string;
}

export const LEVELS: Level[] = [
  {
    word: "AMIRAL",
    charKeywords: ["Akainu", "Aokiji", "Kizaru", "Fujitora"],
    hint: "Les plus hauts dirigeants militaires de la Marine, symboles de la Justice absolue."
  },
  {
    word: "CORSAIRE",
    charKeywords: ["Mihawk", "Crocodile", "Doflamingo", "Kuma"],
    hint: "Les capitaines pirates qui ont pactisé avec le Gouvernement Mondial pour être graciés."
  },
  {
    word: "EMPEREUR",
    charKeywords: ["Kaido", "Big Mom", "Shanks", "Barbe Blanche"],
    hint: "Les seigneurs légendaires qui régnaient en maîtres absolus sur le Nouveau Monde."
  },
  {
    word: "SUPERNOVA",
    charKeywords: ["Luffy", "Law", "Eustass Kid", "Capone Bege"],
    hint: "Les célèbres pirates rookies de la Pire Génération qui font trembler le monde."
  },
  {
    word: "MARINE",
    charKeywords: ["Garp", "Sengoku", "Smoker", "Koby"],
    hint: "Les officiers et héros militaires dévoués à la défense des citoyens et de l'ordre."
  },
  {
    word: "EPEISTE",
    charKeywords: ["Zoro", "Mihawk", "Rayleigh", "Kozuki Oden"],
    hint: "Les maîtres incontestés du sabre capables de fendre des montagnes d'un seul coup."
  },
  {
    word: "CUISINIER",
    charKeywords: ["Sanji", "Zeff", "Charlotte Pudding", "Streusen"],
    hint: "Les experts culinaires hors pair qui concoctent des plats aussi délicieux que vitaux."
  },
  {
    word: "MEDECIN",
    charKeywords: ["Chopper", "Law", "Marco", "Crocus"],
    hint: "Ceux qui possèdent l'art de guérir, de soigner les blessures et de sauver des vies."
  },
  {
    word: "CHARPENTIER",
    charKeywords: ["Franky", "Iceburg", "Tom", "Paulie"],
    hint: "Les artisans légendaires et ingénieurs navals capables de bâtir les plus grands navires."
  },
  {
    word: "NAVIGATEUR",
    charKeywords: ["Nami", "Bepo", "Lafitte", "Carrot"],
    hint: "Ceux qui savent lire les cartes et guider un équipage à travers les pires tempêtes."
  },
  {
    word: "OHARA",
    charKeywords: ["Nico Robin", "Professeur Clover", "Nico Olvia", "Jaguar D. Saul"],
    hint: "Les archéologues et martyrs de l'île du savoir détruite par le Buster Call."
  },
  {
    word: "ALABASTA",
    charKeywords: ["Vivi", "Cobra", "Pell", "Chaka"],
    hint: "Les figures royales et protecteurs du royaume du désert sous la dynastie Nefertari."
  },
  {
    word: "ZOAN",
    charKeywords: ["Kaido", "Rob Lucci", "Chopper", "Jack"],
    hint: "Les utilisateurs de Fruits du Démon qui peuvent se transformer en animaux ou bêtes hybrides."
  },
  {
    word: "LOGIA",
    charKeywords: ["Smoker", "Crocodile", "Enel", "Ace"],
    hint: "Les possesseurs de fruits leur conférant le pouvoir de devenir un élément naturel intangible."
  },
  {
    word: "PARAMECIA",
    charKeywords: ["Luffy", "Law", "Robin", "Doflamingo"],
    hint: "Ceux dont les Fruits du Démon modifient le corps ou accordent des pouvoirs physiques uniques."
  },
  {
    word: "SAMOURAI",
    charKeywords: ["Kozuki Oden", "Kinemon", "Ryuma", "Ashura Doji"],
    hint: "Les fiers et courageux guerriers de Wano qui manient le sabre avec honneur."
  },
  {
    word: "MINK",
    charKeywords: ["Carrot", "Nekomamushi", "Inuarashi", "Wanda"],
    hint: "Les fiers guerriers animaux de l'île de Zou capables de canaliser l'électricité d'Electro."
  },
  {
    word: "GEANT",
    charKeywords: ["Dorry", "Broggy", "Hajrudin", "Oimo"],
    hint: "Les colosses guerriers venus d'Elbaph ou d'autres mers, célèbres pour leur force brute."
  },
  {
    word: "CHARLOTTE",
    charKeywords: ["Katakuri", "Smoothie", "Cracker", "Perospero"],
    hint: "Les redoutables fils et filles de la famille impériale de Big Mom."
  },
  {
    word: "GOROSEI",
    charKeywords: ["Saturn", "Mars", "Warcury", "Ju Peter"],
    hint: "Les cinq doyens qui dirigent secrètement le monde sous les ordres directs d'Imu."
  },
  {
    word: "SWORD",
    charKeywords: ["Koby", "Helmeppo", "X Drake", "Prince Grus"],
    hint: "La force secrète de la Marine composée de soldats ayant officiellement démissionné."
  },
  {
    word: "SCIENTIFIQUE",
    charKeywords: ["Vegapunk", "Caesar Clown", "Vinsmoke Judge", "Queen"],
    hint: "Les scientifiques de génie hors-la-loi qui ont percé le secret du facteur de lignage."
  },
  {
    word: "CP9",
    charKeywords: ["Rob Lucci", "Kaku", "Jabra", "Kalifa"],
    hint: "Les agents secrets assassins du Gouvernement maîtrisant le Rokushiki à la perfection."
  },
  {
    word: "ROGER",
    charKeywords: ["Shanks", "Baggy", "Rayleigh", "Crocus"],
    hint: "Les membres légendaires qui ont navigué sur le navire du Roi des Pirates."
  },
  {
    word: "WANO",
    charKeywords: ["Momonosuke", "Hiyori", "Yamato", "Kaido"],
    hint: "Le pays des samouraïs, fermé au monde extérieur et jadis tyrannisé."
  },
  {
    word: "SKYPIEA",
    charKeywords: ["Enel", "Gan Fall", "Wiper", "Montblanc Noland"],
    hint: "L'île céleste suspendue dans les nuages et chargée d'histoire et de mystères."
  },
  {
    word: "PRISON",
    charKeywords: ["Magellan", "Hannyabal", "Shiryu", "Domino"],
    hint: "Les gardiens et anciens hauts dignitaires de la prison sous-marine d'Impel Down."
  },
  {
    word: "SULONG",
    charKeywords: ["Carrot", "Pekoms", "Nekomamushi", "Inuarashi"],
    hint: "La forme bestiale ultime et sauvage que les Minks réveillent les nuits de pleine lune."
  },
  {
    word: "HAKI",
    charKeywords: ["Shanks", "Garp", "Rayleigh", "Mihawk"],
    hint: "Les plus grands maîtres du fluide spirituel, capables d'intimider ou de briser sans fruit."
  },
  {
    word: "REVOLUTION",
    charKeywords: ["Dragon", "Sabo", "Koala", "Emporio Ivankov"],
    hint: "Les leaders de l'armée clandestine dévouée à renverser la tyrannie des Nobles Célestes."
  },
  {
    word: "KUJA",
    charKeywords: ["Boa Hancock", "Boa Sandersonia", "Boa Marigold", "Marguerite"],
    hint: "Les guerrières amazones de l'île d'Amazon Lily qui maîtrisent toutes le Haki."
  },
  {
    word: "BAROQUE",
    charKeywords: ["Crocodile", "Nico Robin", "Mr. 1 (Daz Bonez)", "Mr. 2 (Bon Clay)"],
    hint: "Les agents de l'organisation criminelle secrète qui visait à s'emparer d'Alabasta."
  },
  {
    word: "CYBORG",
    charKeywords: ["Franky", "Bartholomew Kuma", "Queen", "Sanji"],
    hint: "Ceux dont le corps biologique a été modifié par la technologie et la cybernétique."
  },
  {
    word: "SNIPER",
    charKeywords: ["Usopp", "Yasopp", "Van Augur", "Izo"],
    hint: "Les tireurs d'élite légendaires dotés d'une précision absolue à très longue distance."
  },
  {
    word: "SABRE",
    charKeywords: ["Zoro", "Kuina", "Tashigi", "Ryuma"],
    hint: "Ceux dont le destin, l'honneur et le style de combat tournent autour de la voie du sabre."
  },
  {
    word: "DRAGON",
    charKeywords: ["Kaido", "Momonosuke", "Monkey D. Dragon", "Ryuma (Légende)"],
    hint: "Les figures légendaires associées au pouvoir, au nom ou au mythe de la créature reptilienne."
  },
  {
    word: "SOLEIL",
    charKeywords: ["Jinbe", "Fisher Tiger", "Arlong", "Koala"],
    hint: "Les membres ou alliés des Pirates du Soleil arborant la marque de la libération."
  },
  {
    word: "TOBIROPPO",
    charKeywords: ["Ulti", "Page One", "Who's Who", "Black Maria"],
    hint: "Les six officiers d'élite de l'équipage des Cent Bêtes, juste sous les Calamités."
  },
  {
    word: "SERAPHIN",
    charKeywords: ["S-Hawk", "S-Bear", "S-Snake", "S-Shark"],
    hint: "Les armes humaines ultimes créées par la Marine, clones miniatures des Corsaires."
  },
  {
    word: "TRAITRE",
    charKeywords: ["Kanjuro", "Scratchmen Apoo", "X Drake", "Denjiro"],
    hint: "Ceux qui ont joué un double jeu, infiltré des rangs ou trahi pour leur propre cause."
  },
  {
    word: "MUSICIEN",
    charKeywords: ["Brook", "Uta", "Scratchmen Apoo", "Queen"],
    hint: "Les artistes et mélomanes capables d'utiliser le son et le rythme en plein combat."
  },
  {
    word: "POISON",
    charKeywords: ["Magellan", "Vinsmoke Reiju", "Caesar Clown", "Crocodile (Crochet)"],
    hint: "Ceux qui manipulent, absorbent ou sécrètent des substances toxiques mortelles."
  },
  {
    word: "GLACE",
    charKeywords: ["Aokiji (Kuzan)", "Brook", "Monet", "Yamato"],
    hint: "Ceux dont les pouvoirs, techniques ou tempérament sont associés au froid glacial."
  },
  {
    word: "FEU",
    charKeywords: ["Portgas D. Ace", "Sabo", "Sanji", "King"],
    hint: "Ceux qui embrasent le champ de bataille avec des flammes ardentes et destructrices."
  },
  {
    word: "FOUDRE",
    charKeywords: ["Enel", "Nami", "Big Mom (Zeus)", "Carrot (Sulong)"],
    hint: "Les maîtres de la foudre et de l'électricité capables de terrasser par le choc électrique."
  },
  {
    word: "LUNARIA",
    charKeywords: ["King", "S-Hawk", "S-Bear", "S-Snake"],
    hint: "La race divine disparue originaire de Red Line capable de manipuler le feu et de résister à tout."
  },
  {
    word: "SMILE",
    charKeywords: ["Kozuki Momonosuke", "Killer (Kamazo)", "Tama", "Holdem"],
    hint: "Ceux dont la vie a été bouleversée ou qui contrôlent les fruits artificiels de Caesar Clown."
  },
  {
    word: "GERMA",
    charKeywords: ["Vinsmoke Judge", "Vinsmoke Reiju", "Vinsmoke Ichiji", "Vinsmoke Niji"],
    hint: "La famille royale scientifique de la sinistre armée du Germa 66."
  },
  {
    word: "ZOMBIE",
    charKeywords: ["Odz", "Shimotsuki Ryuma", "Absalom", "Victoria Cindry"],
    hint: "Les cadavres ranimés par les ombres sur Thriller Bark sous le commandement de Moria."
  },
  {
    word: "NINJA",
    charKeywords: ["Raizo", "Shinobu", "Kanjuro", "Fukurokuju"],
    hint: "Les maîtres du ninjutsu et de l'infiltration originaires du pays de Wano."
  },
  {
    word: "CIGARE",
    charKeywords: ["Crocodile", "Smoker", "Capone Bege", "Shiryu"],
    hint: "Les durs à cuire et fumeurs invétérés qui ne se séparent jamais de leur cigare."
  },
  {
    word: "LUNETTES",
    charKeywords: ["Don Quijote Doflamingo", "Silvers Rayleigh", "Koby", "Tashigi"],
    hint: "Les pirates et soldats reconnaissables à leurs lunettes de vue ou solaires fétiches."
  },
  {
    word: "CHAPEAU",
    charKeywords: ["Monkey D. Luffy", "Tony Tony Chopper", "Trafalgar D. Water Law", "Portgas D. Ace"],
    hint: "Les personnages dont le couvre-chef est devenu un symbole iconique de leur design."
  },
  {
    word: "MASQUE",
    charKeywords: ["King", "Killer", "Sogeking", "Karasu"],
    hint: "Ceux qui dissimulent leur véritable visage derrière un masque mystérieux."
  },
  {
    word: "TATOUAGE",
    charKeywords: ["Trafalgar D. Water Law", "Nami", "Portgas D. Ace", "Sakazuki (Akainu)"],
    hint: "Les figures arborant des marques d'encre distinctives pleines de sens sur la peau."
  },
  {
    word: "COLISEE",
    charKeywords: ["Lucy (Luffy/Sabo)", "Rebecca", "Bartolomeo", "Jesus Burgess"],
    hint: "Les gladiateurs et combattants ayant lutté pour le fruit d'Ace au Colisée Corrida."
  },
  {
    word: "ROI",
    charKeywords: ["Neptune", "Nefertari Cobra", "Riku Dold III", "Elizabello II"],
    hint: "Les souverains légitimes qui gouvernent les différents royaumes du monde."
  },
  {
    word: "PRINCESSE",
    charKeywords: ["Nefertari Vivi", "Shirahoshi", "Rebecca", "Mansherry"],
    hint: "Les nobles héritières des royaumes alliés de l'équipage du Chapeau de Paille."
  },
  {
    word: "ESCLAVE",
    charKeywords: ["Boa Hancock", "Fisher Tiger", "Koala", "Jean Bart"],
    hint: "Ceux qui ont connu les fers des Nobles Célestes avant de regagner leur liberté."
  },
  {
    word: "SAVANT",
    charKeywords: ["Vegapunk", "Caesar Clown", "Tony Tony Chopper", "Dr. Hogback"],
    hint: "Les grands esprits scientifiques et médicaux excellant dans leurs disciplines respectives."
  },
  {
    word: "VOLONTE",
    charKeywords: ["Monkey D. Luffy", "Gol D. Roger", "Trafalgar D. Law", "Marshall D. Teach"],
    hint: "Ceux qui portent fièrement le mystérieux 'D.' et l'héritage de la Volonté du D."
  },
  {
    word: "ESPION",
    charKeywords: ["Donquixote Rosinante (Corazon)", "X Drake", "Stussy", "Kanjuro"],
    hint: "Les agents secrets infiltrés opérant dans l'ombre pour le compte d'une autre faction."
  },
  {
    word: "SIRENE",
    charKeywords: ["Shirahoshi", "Otohime", "Kokoro", "Camie"],
    hint: "Les femmes de la mer de l'Île des Hommes-Poissons dotées de magnifiques queues de poisson."
  },
  {
    word: "CAPITAINE",
    charKeywords: ["Monkey D. Luffy", "Eustass Kid", "Trafalgar D. Law", "Capone Bege"],
    hint: "Les meneurs d'équipage audacieux de la Pire Génération qui commandent leur propre navire."
  },
  {
    word: "FRERE",
    charKeywords: ["Portgas D. Ace", "Sabo", "Monkey D. Luffy", "Charlotte Katakuri"],
    hint: "Ceux liés par les coupes de saké fraternelles ou par le sang familial."
  },
  {
    word: "MERE",
    charKeywords: ["Bellemere", "Portgas D. Rouge", "Otohime", "Vinsmoke Sora"],
    hint: "Les figures maternelles héroïques qui ont tout sacrifié pour protéger l'avenir de leurs enfants."
  },
  {
    word: "PERE",
    charKeywords: ["Monkey D. Dragon", "Vinsmoke Judge", "Kyros", "Yasopp"],
    hint: "Les figures paternelles marquantes, absentes ou protectrices, qui guident le destin de leurs enfants."
  },
  {
    word: "ROUX",
    charKeywords: ["Shanks", "Eustass Kid", "Calgara", "Vinsmoke Ichiji"],
    hint: "Les guerriers redoutables caractérisés par leur chevelure flamboyante rousse."
  },
  {
    word: "BLOND",
    charKeywords: ["Vinsmoke Sanji", "Sabo", "Cavendish", "Don Quijote Doflamingo"],
    hint: "Les figures d'One Piece reconnaissables à leur éclatante chevelure blonde."
  },
  {
    word: "ROSE",
    charKeywords: ["Big Mom", "Jewelry Bonney", "Koby", "Vinsmoke Reiju"],
    hint: "Les personnages hauts en couleur arborant des cheveux roses mémorables."
  },
  {
    word: "BLEU",
    charKeywords: ["Franky", "Baggy", "Nefertari Vivi", "Denjiro"],
    hint: "Ceux qui se distinguent par leurs légendaires cheveux bleus ou coiffures azur."
  },
  {
    word: "CICATRICE",
    charKeywords: ["Monkey D. Luffy", "Roronoa Zoro", "Shanks", "Issho (Fujitora)"],
    hint: "Ceux dont le visage ou le corps porte les stigmates de combats légendaires."
  },
  {
    word: "BARBE",
    charKeywords: ["Edward Newgate", "Marshall D. Teach", "Barbe Brune", "Dorry"],
    hint: "Les pirates célèbres dont la barbe est l'élément central de leur nom et charisme."
  },
  {
    word: "MOUSTACHE",
    charKeywords: ["Gol D. Roger", "Vista", "Monkey D. Garp", "Sengoku"],
    hint: "Les hommes d'honneur arborant des moustaches légendaires et mémorables."
  },
  {
    word: "ANIMAL",
    charKeywords: ["Tony Tony Chopper", "Bepo", "Karoo", "Hattori"],
    hint: "Les fidèles compagnons ou membres d'équipage d'apparence animale."
  },
  {
    word: "CHASSEUR",
    charKeywords: ["Roronoa Zoro", "Johnny", "Yosaku", "Jean Ango"],
    hint: "Ceux qui traquent les hors-la-loi pour empocher leurs primes à travers les mers."
  },
  {
    word: "OKAMA",
    charKeywords: ["Bentham (Bon Clay)", "Emporio Ivankov", "Inazuma", "Morley"],
    hint: "Les flamboyants membres de la communauté Okama et du Royaume de Kamabakka."
  },
  {
    word: "AILES",
    charKeywords: ["King", "Marco", "Pell", "Urouge"],
    hint: "Ceux capables de s'élever dans les airs grâce à des ailes naturelles ou acquises."
  },
  {
    word: "BOUCLIER",
    charKeywords: ["Bartolomeo", "Jozu", "Charlotte Cracker", "Bartholomew Kuma"],
    hint: "Ceux réputés pour posséder des défenses absolues ou des barrières infranchissables."
  },
  {
    word: "PISTOLET",
    charKeywords: ["Yasopp", "Lucky Roux", "Benn Beckman", "Marshall D. Teach"],
    hint: "Les tireurs et capitaines qui utilisent des armes à feu pour asseoir leur suprématie."
  },
  {
    word: "TRIDENT",
    charKeywords: ["Charlotte Katakuri", "Hody Jones", "Roi Neptune", "Enel"],
    hint: "Les combattants d'exception qui manient la lance à trois dents avec dextérité."
  },
  {
    word: "COMMANDANT",
    charKeywords: ["Marco", "Charlotte Katakuri", "King", "Shiryu"],
    hint: "Les seconds et lieutenants suprêmes des plus grands équipages de pirates du monde."
  },
  {
    word: "ENFANT",
    charKeywords: ["Tama", "Kozuki Momonosuke", "Toko", "Sugar"],
    hint: "Les jeunes pousses de Wano ou d'ailleurs qui jouent un rôle crucial dans le scénario."
  },
  {
    word: "LEGENDE",
    charKeywords: ["Gol D. Roger", "Edward Newgate", "Monkey D. Garp", "Sengoku"],
    hint: "Les géants de l'ancienne ère dont les noms résonnent à jamais dans l'histoire."
  },
  {
    word: "HOMIE",
    charKeywords: ["Zeus", "Prométhée", "Napoléon", "King Baum"],
    hint: "Les objets et éléments dotés d'une âme grâce au pouvoir de Big Mom."
  },
  {
    word: "DIEU",
    charKeywords: ["Enel", "Usopp", "Gan Fall", "Nika"],
    hint: "Ceux proclamés divinités, adorés par des fidèles ou incarnant des divinités mythologiques."
  },
  {
    word: "PEGRE",
    charKeywords: ["Stussy", "Morgans", "Du Feld", "Giberson"],
    hint: "Les puissants Empereurs du Monde Souterrain régnant sur le marché noir."
  },
  {
    word: "ALCOOL",
    charKeywords: ["Roronoa Zoro", "Kaido", "Vasco Shot", "Kokoro"],
    hint: "Les plus grands amateurs de saké et de boisson de Grand Line."
  },
  {
    word: "GOURMAND",
    charKeywords: ["Monkey D. Luffy", "Big Mom", "Jewelry Bonney", "Lucky Roux"],
    hint: "Les estomacs insatiables d'One Piece réputés pour leur appétit gargantuesque."
  },
  {
    word: "TEMPS",
    charKeywords: ["Kozuki Toki", "Kozuki Momonosuke", "Kinemon", "Raizo"],
    hint: "Ceux qui ont voyagé 20 ans dans le futur grâce au pouvoir du Toki Toki no Mi."
  },
  {
    word: "MYTHIQUE",
    charKeywords: ["Monkey D. Luffy", "Kaido", "Marco", "Yamato"],
    hint: "Les possesseurs de Fruits du Démon de type Zoan Mythique extrêmement rares."
  },
  {
    word: "SABREUR",
    charKeywords: ["Roronoa Zoro", "Dracule Mihawk", "Shanks", "Brook"],
    hint: "Les maîtres d'armes emblématiques se battant principalement au sabre."
  },
  {
    word: "GENIE",
    charKeywords: ["Dr. Vegapunk (Stella)", "Nico Robin", "Nami", "Chopper"],
    hint: "Les intellects hors du commun de l'équipage et du monde d'One Piece."
  },
  {
    word: "INFILTRE",
    charKeywords: ["X Drake", "Rob Lucci", "Stussy", "Kaku"],
    hint: "Les agents secrets double jeu opérant en mission d'infiltration de longue durée."
  },
  {
    word: "KARATE",
    charKeywords: ["Jinbe", "Fisher Tiger", "Hack", "Koala"],
    hint: "Les pratiquants du karaté des Hommes-Poissons, art martial redoutable."
  },
  {
    word: "JAMBES",
    charKeywords: ["Vinsmoke Sanji", "Zeff", "Ivankov", "Dellinger"],
    hint: "Les combattants d'exception dont les jambes sont l'arme principale."
  },
  {
    word: "EVADE",
    charKeywords: ["Luffy", "Baggy le Clown", "Crocodile", "Bentham (Bon Clay)"],
    hint: "Les légendes qui ont orchestré la grande évasion de la prison d'Impel Down."
  },
  {
    word: "LOGPOSE",
    charKeywords: ["Nami", "Lafitte", "Bepo", "Crocodile"],
    hint: "Les navigateurs et stratèges qui guident leur flotte grâce au Log Pose de Grand Line."
  },
  {
    word: "SKELETTE",
    charKeywords: ["Brook", "Odz", "Ryuma", "Jack (Forme Mammouth)"],
    hint: "Les figures d'One Piece associées à l'apparence ou à la structure d'un squelette."
  },
  {
    word: "COURONNE",
    charKeywords: ["Imu", "Roi Neptune", "Riku Dold III", "Perona"],
    hint: "Les détenteurs de couronnes royales ou d'accessoires de tête en forme de couronne."
  },
  {
    word: "MANTEAU",
    charKeywords: ["Don Quijote Doflamingo", "Crocodile", "Barbe Blanche", "Corazon"],
    hint: "Les personnages charismatiques caractérisés par leurs amples manteaux de fourrure ou d'apparat."
  },
  {
    word: "SABREURS",
    charKeywords: ["Vista", "Shiryu", "Tashigi", "Kinemon"],
    hint: "Les combattants émérites de la lame réputés dans le monde entier."
  },
  {
    word: "JOURNAL",
    charKeywords: ["Morgans", "Kozuki Oden", "Nico Robin", "Luffy"],
    hint: "Les personnages dont l'aventure est immortalisée dans des journaux de bord ou d'actualité."
  },
  {
    word: "DENTELLE",
    charKeywords: ["Charlotte Pudding", "Stussy", "Perona", "Rebecca"],
    hint: "Les femmes élégantes et guerrières portant des parures en dentelle raffinée."
  },
  {
    word: "BOUTEILLE",
    charKeywords: ["Kaido", "Zoro", "Vasco Shot", "Franky (Cola)"],
    hint: "Les personnages très souvent représentés une bouteille ou une gourde à la main."
  },
  {
    word: "ECLAIRS",
    charKeywords: ["Enel", "Shanks", "Luffy (Gear 5)", "Nami"],
    hint: "Ceux dont les attaques s'accompagnent d'éclairs fulgurants de foudre ou de Haki des Rois."
  },
  {
    word: "MUGIWARA",
    charKeywords: ["Luffy", "Zoro", "Nami", "Sanji"],
    hint: "Les membres historiques et originaux de l'équipage au Chapeau de Paille."
  },
  {
    word: "SOMBRE",
    charKeywords: ["Marshall D. Teach", "Shiryu", "Imu", "Gecko Moria"],
    hint: "Les maîtres de l'ombre, des ténèbres et du vide maléfique."
  },
  {
    word: "MEDECINS",
    charKeywords: ["Chopper", "Trafalgar D. Law", "Marco", "Dr. Hogback"],
    hint: "Les praticiens de la médecine capables de guérir l'impossible."
  },
  {
    word: "REINES",
    charKeywords: ["Boa Hancock", "Otohime", "Big Mom", "Vinsmoke Sora"],
    hint: "Les femmes monarques ou reines légendaires de leurs royaumes respectifs."
  },
  {
    word: "LIGNAGE",
    charKeywords: ["Luffy", "Sabo", "Ace", "Yamato"],
    hint: "Les descendants de lignées prestigieuses ou de figures légendaires de la piraterie et du monde."
  },
  {
    word: "VAPEUR",
    charKeywords: ["Luffy (Gear 4/5)", "Rob Lucci (Éveillé)", "Yamato", "Kaku (Éveillé)"],
    hint: "Les formes divines ou éveillées entourées d'un ruban de vapeur céleste."
  },
  {
    word: "ARMEE",
    charKeywords: ["Sabo", "Dragon", "Koala", "Karasu"],
    hint: "Les hauts commandants de l'Armée Révolutionnaire."
  },
  {
    word: "ESPADON",
    charKeywords: ["Arlong", "Jinbe", "Fisher Tiger", "Hody Jones"],
    hint: "Les puissants guerriers Hommes-Poissons de l'océan."
  },
  {
    word: "COLIER",
    charKeywords: ["Ace", "Hancock", "Yamato", "Enel"],
    hint: "Ceux portant des colliers ou des ornements de cou massifs et distinctifs."
  },
  {
    word: "SOUVENIR",
    charKeywords: ["Charlotte Pudding", "Nico Robin", "Luffy", "Law"],
    hint: "Ceux dont l'enfance et le passé tragique sont gravés dans l'histoire."
  },
  {
    word: "REVE",
    charKeywords: ["Luffy", "Gol D. Roger", "Marshall D. Teach", "Nami"],
    hint: "Ceux portés par un rêve immense et indomptable qui défie les mers."
  },
  {
    word: "BOULE",
    charKeywords: ["Buggy", "Enel (Tambours)", "Ace (Dai Enkai)", "Caesar Clown"],
    hint: "Ceux manipulant des sphères d'énergie, de feu, de gaz ou de bombes rondes explosives."
  },
  {
    word: "CHAPEAUX",
    charKeywords: ["Law", "Ace", "Sabo", "Luffy"],
    hint: "Les grands chapeaux d'One Piece, éléments indissociables de l'identité de leurs porteurs."
  },
  {
    word: "OR",
    charKeywords: ["Enel", "Gild Tesoro", "Nami", "Crocodile (Crochet)"],
    hint: "Les amateurs du métal jaune précieux, qu'il s'agisse de richesse ou d'armes en or."
  }
];

export const CHARACTER_NAME_MAP: Record<string, string> = {
  "akainu": "Akainu [Sakazuki]",
  "sakazuki (akainu)": "Akainu [Sakazuki]",
  "aokiji": "Aokiji [Kuzan]",
  "aokiji (kuzan)": "Aokiji [Kuzan]",
  "kizaru": "Kizaru [Borsalino]",
  "fujitora": "Fujitora [Issho]",
  "issho (fujitora)": "Fujitora [Issho]",
  "mihawk": "Dracule Mihawk",
  "dracule mihawk": "Dracule Mihawk",
  "s-hawk": "Dracule Mihawk",
  "crocodile": "Crocodile",
  "crocodile (crochet)": "Crocodile",
  "doflamingo": "Donquixote Doflamingo",
  "don quijote doflamingo": "Donquixote Doflamingo",
  "kuma": "Bartholomew Kuma",
  "bartholomew kuma": "Bartholomew Kuma",
  "s-bear": "Bartholomew Kuma",
  "pacifista": "Bartholomew Kuma",
  "kaido": "Kaidou",
  "big mom": "Big Mom [Charlotte Linlin]",
  "big mom (zeus)": "Big Mom [Charlotte Linlin]",
  "shanks": "Shanks",
  "barbe blanche": "Edward Newgate [Barbe Blanche]",
  "edward newgate": "Edward Newgate [Barbe Blanche]",
  "luffy": "Monkey D. Luffy",
  "monkey d. luffy": "Monkey D. Luffy",
  "lucy (luffy/sabo)": "Monkey D. Luffy",
  "luffy (gear 5)": "Monkey D. Luffy",
  "luffy (gear 4/5)": "Monkey D. Luffy",
  "nika": "Monkey D. Luffy",
  "law": "Trafalgar D. Water Law",
  "trafalgar d. law": "Trafalgar D. Water Law",
  "trafalgar d. water law": "Trafalgar D. Water Law",
  "eustass kid": "Eustass Kid",
  "capone bege": "Capone Bege",
  "garp": "Monkey D. Garp",
  "monkey d. garp": "Monkey D. Garp",
  "sengoku": "Sengoku",
  "smoker": "Smoker",
  "koby": "Koby",
  "zoro": "Roronoa Zoro",
  "roronoa zoro": "Roronoa Zoro",
  "rayleigh": "Silvers Rayleigh",
  "silvers rayleigh": "Silvers Rayleigh",
  "kozuki oden": "Kouzuki Oden",
  "sanji": "Sanji",
  "vinsmoke sanji": "Sanji",
  "zeff": "Zeff",
  "charlotte pudding": "Charlotte Pudding",
  "streusen": "Streusen",
  "chopper": "Tony Tony Chopper",
  "tony tony chopper": "Tony Tony Chopper",
  "marco": "Marco",
  "crocus": "Crocus",
  "franky": "Franky",
  "iceburg": "Iceburg",
  "tom": "Tom",
  "paulie": "Paulie",
  "nami": "Nami",
  "bepo": "Bepo",
  "lafitte": "Laffitte",
  "carrot": "Carrot",
  "carrot (sulong)": "Carrot",
  "nico robin": "Nico Robin",
  "robin": "Nico Robin",
  "professeur clover": "Clou D. Clover",
  "nico olvia": "Nico Olvia",
  "jaguar d. saul": "Jaguar D. Saul",
  "vivi": "Nefertari Vivi",
  "nefertari vivi": "Nefertari Vivi",
  "cobra": "Nefertari Cobra",
  "nefertari cobra": "Nefertari Cobra",
  "pell": "Pell",
  "chaka": "Chaka",
  "rob lucci": "Rob Lucci",
  "rob lucci (éveillé)": "Rob Lucci",
  "jack": "Jack",
  "enel": "Enel",
  "enel (tambours)": "Enel",
  "ace": "Portgas D. Ace",
  "portgas d. ace": "Portgas D. Ace",
  "ace (dai enkai)": "Portgas D. Ace",
  "kinemon": "Kinemon",
  "ryuma": "Shimotsuki Ryuma",
  "ryuma (légende)": "Shimotsuki Ryuma",
  "shimotsuki ryuma": "Shimotsuki Ryuma",
  "ashura doji": "Ashura Doji",
  "nekomamushi": "Nekomamushi",
  "inuarashi": "Inuarashi",
  "wanda": "Wanda",
  "dorry": "Dorry",
  "broggy": "Broggy",
  "hajrudin": "Hajrudin",
  "oimo": "Oimo",
  "katakuri": "Charlotte Katakuri",
  "charlotte katakuri": "Charlotte Katakuri",
  "smoothie": "Charlotte Smoothie",
  "cracker": "Charlotte Cracker",
  "charlotte cracker": "Charlotte Cracker",
  "perospero": "Charlotte Perospero",
  "saturn": "Jaygarcia Saturn",
  "mars": "Marcus Mars",
  "warcury": "Topman Warcury",
  "ju peter": "Shepherd Ju Peter",
  "helmeppo": "Helmeppo",
  "x drake": "X Drake",
  "prince grus": "Prince Grus",
  "vegapunk": "Vegapunk",
  "dr. vegapunk (stella)": "Vegapunk",
  "caesar clown": "Caesar Clown",
  "vinsmoke judge": "Vinsmoke Judge",
  "queen": "Queen [Scien]",
  "kaku": "Kaku",
  "kaku (éveillé)": "Kaku",
  "jabra": "Jabra",
  "kalifa": "Kalifa",
  "baggy": "Buggy",
  "baggy le clown": "Buggy",
  "buggy": "Buggy",
  "momonosuke": "Kouzuki Momonosuke",
  "kozuki momonosuke": "Kouzuki Momonosuke",
  "hiyori": "Kouzuki Hiyori",
  "kozuki hiyori": "Kouzuki Hiyori",
  "yamato": "Yamato",
  "gan fall": "Gan Fall",
  "wiper": "Wyper",
  "montblanc noland": "Mont Blanc Noland",
  "magellan": "Magellan",
  "hannyabal": "Hannyabal",
  "shiryu": "Shiryu",
  "domino": "Domino",
  "pekoms": "Pekoms",
  "dragon": "Monkey D. Dragon",
  "monkey d. dragon": "Monkey D. Dragon",
  "sabo": "Sabo",
  "koala": "Koala",
  "emporio ivankov": "Emporio Ivankov",
  "ivankov": "Emporio Ivankov",
  "boa hancock": "Boa Hancock",
  "hancock": "Boa Hancock",
  "s-snake": "Boa Hancock",
  "boa sandersonia": "Boa Sandersonia",
  "boa marigold": "Boa Marigold",
  "marguerite": "Marguerite",
  "mr. 1 (daz bonez)": "Mr. 1 [Daz Bonez]",
  "mr. 2 (bon clay)": "Bentham (Bon Clay) [Mr. 2]",
  "bentham (bon clay)": "Bentham (Bon Clay) [Mr. 2]",
  "usopp": "Usopp",
  "sogeking": "Usopp",
  "yasopp": "Yasopp",
  "van augur": "Van Augur",
  "izo": "Izo",
  "kuina": "Kuina",
  "tashigi": "Tashigi",
  "jinbe": "Jinbe",
  "s-shark": "Jinbe",
  "fisher tiger": "Fisher Tiger",
  "arlong": "Arlong",
  "ulti": "Ulti",
  "page one": "Page One",
  "who's who": "Whos-Who",
  "black maria": "Black Maria",
  "kanjuro": "Kurozumi Kanjuro",
  "scratchmen apoo": "Scratchmen Apoo",
  "denjiro": "Denjiro",
  "uta": "Uta",
  "vinsmoke reiju": "Vinsmoke Reiju",
  "monet": "Monet",
  "king": "King",
  "killer": "Killer",
  "killer (kamazo)": "Killer",
  "tama": "Tama",
  "holdem": "Holdem",
  "vinsmoke ichiji": "Vinsmoke Ichiji",
  "vinsmoke niji": "Vinsmoke Niji",
  "odz": "Odz",
  "absalom": "Absalom",
  "victoria cindry": "Victoria Cindry",
  "raizo": "Raizo",
  "shinobu": "Shinobu",
  "fukurokuju": "Fukurokuju",
  "karasu": "Karasu",
  "rebecca": "Rebecca",
  "bartolomeo": "Bartolomeo",
  "jesus burgess": "Jesus Burgess",
  "neptune": "Neptune",
  "roi neptune": "Neptune",
  "riku dold iii": "Riku Dold III",
  "elizabello ii": "Elizabello II",
  "shirahoshi": "Shirahoshi",
  "mansherry": "Mansherry",
  "jean bart": "Jean Bart",
  "dr. hogback": "Hogback",
  "gol d. roger": "Gol D. Roger",
  "donquixote rosinante (corazon)": "Donquixote Rosinante",
  "corazon": "Donquixote Rosinante",
  "stussy": "Stussy",
  "otohime": "Otohime",
  "kokoro": "Kokoro",
  "camie": "Camie",
  "bellemere": "Bell-mère",
  "portgas d. rouge": "Portgas D. Rouge",
  "vinsmoke sora": "Vinsmoke Sora",
  "kyros": "Kyros",
  "calgara": "Kalgara",
  "cavendish": "Cavendish",
  "jewelry bonney": "Jewelry Bonney",
  "barbe brune": "Barbe Brune",
  "vista": "Vista",
  "karoo": "Karoo",
  "hattori": "Hattori",
  "johnny": "Johnny",
  "yosaku": "Yosaku",
  "jean ango": "Jean Ango",
  "inazuma": "Inazuma",
  "morley": "Morley",
  "urouge": "Urouge",
  "jozu": "Jozu",
  "lucky roux": "Lucky Roux",
  "benn beckman": "Benn Beckman",
  "hody jones": "Hody Jones",
  "toko": "Toko",
  "sugar": "Sugar",
  "zeus": "Zeus",
  "prometheus": "Prometheus",
  "prométhée": "Prometheus",
  "napoleon": "Napoleon",
  "napoléon": "Napoleon",
  "king baum": "Kingbaum",
  "morgans": "Morgans",
  "du feld": "Lu Feld",
  "giberson": "Giberson",
  "vasco shot": "Vasco Shot",
  "kozuki toki": "Kouzuki Toki",
  "hack": "Hack",
  "dellinger": "Dellinger",
  "imu": "Imu",
  "perona": "Perona",
  "gild tesoro": "Gild Tesoro"
};

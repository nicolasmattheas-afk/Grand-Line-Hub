import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Trophy, HelpCircle, RefreshCw, Coins, ArrowRight, Download, Brain, 
  Volume2, VolumeX, CheckCircle, AlertCircle, Gamepad2, Info
} from "lucide-react";

// ==========================================
// 1. DICTIONNAIRE ONE PIECE (Thèmes & Persos)
// ==========================================
interface WordItem {
  word: string;
  clue: string;
}
const DICTIONARY: WordItem[] = [
  { word: "LUFFY", clue: "Il cherche la liberté suprême au-delà des mers et ne recule devant aucun empereur pour un morceau de viande." },
  { word: "ZORO", clue: "Ses trois lames tracent un chemin de sang, bien que ses pieds ne sachent jamais distinguer la gauche de la droite." },
  { word: "NAMI", clue: "Ses cartes guident vers l'avenir tandis que ses yeux reflètent la lueur dorée des pièces de monnaie." },
  { word: "USOPP", clue: "Un conteur d'histoires dont le long nez trahit la peur, mais dont le projectile ne rate jamais sa cible." },
  { word: "SANJI", clue: "Cuisinier à la jambe ardente, il refuse de souiller ses mains ou de blesser une dame, peu importe le danger." },
  { word: "CHOPPER", clue: "Un médecin au nez bleu et à la candeur d'enfant, souvent confondu avec un simple animal de compagnie ou une ration." },
  { word: "ROBIN", clue: "Seule survivante d'un grand savoir détruit, elle cherche les textes de pierre sous le regard fuyant du monde." },
  { word: "FRANKY", clue: "Un ingénieur excentrique de métal et de cola qui pleure facilement face aux récits héroïques." },
  { word: "BROOK", clue: "Un squelette gentleman dont les accords musicaux résonnent, demandant poliment à voir ce qui est caché." },
  { word: "JINBE", clue: "Un maître des vagues au code d'honneur inébranlable, loyal envers celui qui libérera son peuple." },
  { word: "ROGER", clue: "Il a conquis la dernière mer, a tout laissé derrière lui et a lancé un âge d'or d'un simple sourire sur l'échafaud." },
  { word: "SHANKS", clue: "Un souverain flamboyant d'une seule main, gardien d'un chapeau légendaire et d'un équilibre fragile." },
  { word: "KAIDO", clue: "Un dragon indestructible cherchant une fin grandiose, trônant au-dessus d'une terre de fer et d'usines." },
  { word: "BIGMOM", clue: "Une reine titan capricieuse dont la fureur gourmande arrache la vie et les âmes de ses propres enfants." },
  { word: "TEACH", clue: "Un conspirateur de l'ombre qui ne dort jamais, accumulant les fruits maudits au nom du destin." },
  { word: "NEWGATE", clue: "Le colosse des séismes qui n'avait pour seul désir que d'offrir un foyer et le nom de père à ses compagnons." },
  { word: "BUGGY", clue: "Un clown chanceux dont les erreurs successives ont forgé une légende auprès des plus grands criminels." },
  { word: "LAW", clue: "Le médecin au chapeau tacheté capable d'échanger les cœurs et de découper le monde dans sa zone d'opération." },
  { word: "KID", clue: "Un capitaine rebelle au bras de fer magnétique, consumé par la colère et le désir d'écraser les puissants." },
  { word: "ACE", clue: "Fils d'une légende, porteur de flammes indomptables, son sacrifice a éteint le brasier de Marineford." },
  { word: "SABO", clue: "Un frère retrouvé sous le chapeau haut-de-forme, brandissant le feu de la révolte contre les nobles." },
  { word: "GARP", clue: "Le vieux héros de fer de la justice, tiraillé entre son devoir d'officier et l'amour de sa famille rebelle." },
  { word: "DRAGON", clue: "Le visage le plus recherché du globe, soufflant le vent de la révolution sur les royaumes opprimés." },
  { word: "AKAINU", clue: "Une force implacable de magma fondu qui carbonise toute nuance au nom d'une justice absolue." },
  { word: "AOKIJI", clue: "Un amiral paresseux au souffle glacial, parti chercher sa propre voie dans les brumes de la piraterie." },
  { word: "KIZARU", clue: "Un esprit insaisissable qui s'interroge avec lenteur tout en frappant à la vitesse fulgurante de la lumière." },
  { word: "FUJITORA", clue: "Un bretteur aveugle qui préfère ne pas voir les horreurs du monde, invoquant des météores du ciel." },
  { word: "RYOKUGYU", clue: "Un défenseur acharné de l'ordre mondial, tirant sa force d'une nature végétale impitoyable." },
  { word: "SENGOKU", clue: "Le stratège suprême qui se change en bouddha d'or pour préserver les secrets d'un gouvernement tyrannique." },
  { word: "COBY", clue: "Un lâche timoré métamorphosé en l'espoir héroïque d'une nouvelle génération de soldats." },
  { word: "HANCOCK", clue: "L'impératrice de pierre dont la beauté fige les cœurs, impitoyable sauf devant son idole élastique." },
  { word: "MIHAWK", clue: "Un solitaire au regard de faucon qui attend sur son trône de ruines celui qui surpassera sa lame noire." },
  { word: "DOFLAMINGO", clue: "Un démon céleste déchu qui manipule les êtres comme des marionnettes derrière un sourire cruel." },
  { word: "CROCODILE", clue: "Un parrain du désert qui dissimulait ses complots sous le sable chaud d'un royaume en crise." },
  { word: "RAYLEIGH", clue: "Le second du Roi, devenu un simple artisan de revêtements qui observe la nouvelle ère avec nostalgie." },
  { word: "ODEN", clue: "Un esprit libre et indomptable qui a dansé dans l'huile bouillante pour sauver ses fidèles vassaux." },
  { word: "YAMATO", clue: "L'héritier des cornes de dragon qui a choisi de porter le nom et la volonté d'un ancien héros de Wano." },
  { word: "VIVI", clue: "Une princesse courageuse qui a bravé le sable et la guerre pour faire entendre sa voix auprès de son peuple." },
  { word: "CARROT", clue: "Une jeune guerrière de la lune capable de libérer une force sauvage sous l'éclat de l'astre nocturne." },
  { word: "KATAKURI", clue: "Le gardien imbattable au visage caché, dont le regard perçoit le futur immédiat à travers ses esquives." },
  { word: "SMOKER", clue: "Un traqueur tenace enveloppé d'un brouillard blanc, guidé par son propre sens de la droiture." },
  { word: "TASHIGI", clue: "Une épéiste déterminée qui cherche à arracher les lames célèbres des mains des hors-la-loi." },
  { word: "LUCCI", clue: "Un assassin sans pitié au service secret des dieux, trouvant sa joie dans le sang et la traque fauve." },
  { word: "PERONA", clue: "La maîtresse des ectoplasmes mélancoliques qui cherche à rendre les plus fiers guerriers dépressifs." },
  { word: "MORIA", clue: "Un géant déchu rassemblant des armées d'ombres pour éviter de souffrir à nouveau de la perte de ses proches." },
  { word: "BEPO", clue: "Un ours polaire karateka et sensible qui s'excuse au moindre reproche de son capitaine." },
  { word: "BONNEY", clue: "Une gloutonne insatiable capable de manipuler les âges et de rêver d'avenirs alternatifs déformés." },
  { word: "REJU", clue: "La rose empoisonnée d'une fratrie de fer, dotée d'un cœur secret derrière l'armure de la science." },
  { word: "MARCO", clue: "Le phénix céleste dont les flammes bleues soignent les blessures au lieu de consumer les chairs." },
  { word: "JOZU", clue: "Un guerrier à la carrure de forteresse capable de changer sa propre peau en diamant brut indomptable." },
  { word: "VISTA", clue: "Un bretteur élégant de l'ancien équipage blanc, maniant les sabres dans une tempête de pétales de roses." },
  { word: "IVANKOV", clue: "Le faiseur de miracles hormonaux régnant sur les secrets de la grande prison et du monde révolutionnaire." },
  { word: "KOALA", clue: "Une jeune fille sauvée des chaînes qui combat désormais aux côtés des opprimés par l'art martial marin." },
  { word: "BARTOLOMEO", clue: "Un barbare provocateur qui dresse des remparts invisibles pour protéger ses idoles divines." },
  { word: "CAVENDISH", clue: "Un prince narcissique au sabre étincelant, hanté par un alter ego sanguinaire dès que le sommeil vient." },
  { word: "KRIEG", clue: "Un usurpateur d'acier qui régnait sur East Blue par le nombre et l'arsenal d'armes déloyales." },
  { word: "ARLONG", clue: "Un tyran aux dents de scie persuadé de la supériorité raciale de son peuple sous l'écume des mers." },
  { word: "KURO", clue: "Un esprit machiavélique aux griffes de velours qui a planifié sa propre mort pour vivre dans l'ombre." },
  { word: "BELLAMY", clue: "Un pirate aux ressorts brisés par la réalité, cherchant l'approbation d'un maître qui le méprisait." },
  { word: "ENEL", clue: "Un tyran autoproclamé dieu qui régnait par la foudre avant de s'envoler vers son rêve lunaire." },
  { word: "WAPOL", clue: "Un roi égoïste à la mâchoire de fer capable de tout dévorer, même son propre royaume enneigé." },
  { word: "KUREHA", clue: "Une guérisseuse centenaire au tempérament de feu qui détient les secrets médicaux de l'île enneigée." },
  { word: "HILULUK", clue: "Un médecin excentrique convaincu que la beauté des cerisiers peut guérir les cœurs malades." },
  { word: "TOM", clue: "Le légendaire bâtisseur de trains maritimes qui a donné sa vie pour avoir construit le navire du Roi." },
  { word: "REBECCA", clue: "Une gladiatrice qui refuse de verser le sang, luttant dans l'arène sous la huée de la foule." },
  { word: "KYROS", clue: "Un héros oublié changé en un jouet de fer à une jambe, veillant sur sa fille sans pouvoir l'embrasser." },
  { word: "NEPTUNE", clue: "Le souverain des profondeurs, gardien d'un palais de nacre et d'un secret antique sur la fin des temps." },
  { word: "SHIRAHOSHI", clue: "Une sirène géante et craintive dont les larmes cachent le pouvoir de commander aux monstres marins." },
  { word: "HODY", clue: "Un monstre né de la haine pure des hommes-poissons, carburant aux pilules d'énergie destructrices." },
  { word: "CAESAR", clue: "Un scientifique démoniaque au corps de gaz, créateur de substances de destruction massive." },
  { word: "VERGO", clue: "Un vice-amiral infiltré dont la maîtrise du fluide durcit le corps comme l'acier le plus noir." },
  { word: "MONET", clue: "La femme des neiges aux ailes de harpie, fidèle gardienne des secrets d'un laboratoire stérile." },
  { word: "TREBOL", clue: "Un conseiller gluant et ricanant qui a placé la couronne du Démon sur la tête de son jeune maître." },
  { word: "DIAMANTE", clue: "Le héros de l'arène de Dressrosa, capable d'assouplir l'acier comme un simple morceau d'étoffe." },
  { word: "PICA", clue: "Un colosse de pierre géant dissimulant une voix cristalline derrière les remparts de la forteresse." },
  { word: "SENORPINK", clue: "Un homme en habit de nourrisson qui plonge sous terre, portant le deuil secret d'un amour perdu." },
  { word: "BABYFIVE", clue: "Une femme-arsenal incapable de refuser une requête par besoin maladif d'être utile à autrui." },
  { word: "PEKOMS", clue: "Un lion mink en costume de parrain, capable de se réfugier dans sa carapace de tortue incassable." },
  { word: "TAMAGO", clue: "Un combattant de haut rang au corps d'œuf qui renaît sous des formes de volailles successives." },
  { word: "CRACKER", clue: "Un général de Big Mom qui se cache derrière d'infinies armures de biscuits croustillants." },
  { word: "SMOOTHIE", clue: "Une géante de jus capable de presser toute créature vivante pour en extraire l'essence pure." },
  { word: "PEROSPERO", clue: "L'aîné d'une grande fratrie sucrée, manipulant le caramel durci avec un sadisme affiché." },
  { word: "OVEN", clue: "Un colosse bouillant capable de faire monter la température des mers par sa simple volonté." },
  { word: "DAIFUKU", clue: "Un combattant robuste qui invoque un génie de fumée destructeur d'un simple frottement de ceinture." },
  { word: "PUDDING", clue: "Une fiancée aux trois yeux tiraillée entre son rôle cruel et son amour pour un cuisinier galant." },
  { word: "KING", clue: "L'ultime survivant d'une race divine de feu, second fidèle d'un souverain cornu." },
  { word: "QUEEN", clue: "Un savant excentrique et corpulent qui conçoit des virus mortels tout en dansant sur scène." },
  { word: "JACK", clue: "Un colosse destructeur surnommé la sécheresse, écrasant les îles sous la forme d'un mammouth d'acier." },
  { word: "ULTI", clue: "Une guerrière féroce au crâne durci qui exprime son affection par des colères explosives." },
  { word: "PAGESONE", clue: "Un prédateur silencieux du jurassique qui subit les caprices bruyants de sa sœur aînée." },
  { word: "BLACKMARIA", clue: "Une maîtresse d'illusions à corps d'araignée géante qui piège les hommes dans sa toile dorée." },
  { word: "WHOOSWHO", clue: "Un ancien agent gouvernemental déchu pour avoir perdu le fruit divin du caoutchouc." },
  { word: "SASAKI", clue: "Un colosse au blindage de tricératops capable de faire tourner sa collerette comme un hélicoptère." },
  { word: "OROCHI", clue: "Un tyran lâche et cruel aux huit têtes de serpent qui a vendu son pays pour se venger du passé." },
  { word: "KANJURO", clue: "Un artiste sans âme dont les dessins médiocres cachaient le pinceau d'un traître parfait." },
  { word: "KINEMON", clue: "Le meneur des sabreurs de Wano, capable de trancher les flammes et d'habiller ses alliés d'une feuille." },
  { word: "DENJIRO", clue: "Un samouraï dont la fureur silencieuse a transformé le visage, infiltré chez l'ennemi pendant vingt ans." },
  { word: "ASHURA", clue: "Le plus redoutable brigand de Kuri rallié par la force et la grandeur d'un seigneur hors-norme." },
  { word: "NEKOMAMUSHI", clue: "Le roi félin de la nuit qui adore les lasagnes et combat avec une férocité indomptable." },
  { word: "INUARASHI", clue: "Le roi canin du jour, maniant l'épée avec l'élégance d'un chevalier fidèle au clan Kozuki." },
  { word: "RAIZO", clue: "Un ninja de la brume au grand cœur capable de sceller les flammes d'un incendie dans ses parchemins." },
  { word: "KAWAMATSU", clue: "Un poisson-combattant sumo qui a survécu dans l'ombre en se nourrissant de poissons pourris." },
  { word: "OKIKU", clue: "Une lame délicate cachée derrière un masque de démon, luttant pour l'honneur de sa famille." },
  { word: "IZO", clue: "Un commandant au fusil élégant qui a quitté la scène du théâtre pour suivre les pirates blancs." },
  { word: "TOKI", clue: "Une voyageuse du temps née au Siècle Oublié qui s'est arrêtée là où les cerisiers s'épanouissent." },
  { word: "SUKIYAKI", clue: "L'ancien Shogun calligraphe qui préservait le secret de l'écriture des stèles de pierre." },
  { word: "KUINA", clue: "Une jeune fille au sabre blanc dont le rêve de devenir la plus forte s'est éteint dans un escalier." },
  { word: "KOSHIRO", clue: "Un maître de dojo serein qui a enseigné l'art de couper le fer sans rien endommager." },
  { word: "ZEFF", clue: "Un pirate à la jambe de bois qui a abandonné sa carrière pour bâtir un restaurant sur l'eau." },
  { word: "BELLEMERE", clue: "Une ancienne soldate devenue mère adoptive, sacrifiée pour préserver les sourires de ses filles." },
  { word: "NOJIKO", clue: "Une sœur loyale aux bras tatoués qui cultivait les mandarines pour garder espoir." },
  { word: "SHAKKY", clue: "Une barmaid élégante aux secrets infinis, autrefois traquée par le héros légendaire de la Marine." },
  { word: "DUVAL", clue: "Un motard dont le visage maudit ressemblait à un avis de recherche avant d'être remodelé à coups de pied." },
  { word: "HATCHAN", clue: "Un poulpe maladroit au grand cœur qui cuisine des takoyakis pour racheter ses fautes passées." },
  { word: "CAMIE", clue: "Une jeune sirène candide qui se fait capturer à la moindre occasion dans l'archipel des bulles." },
  { word: "PAPPAG", clue: "Une étoile de mer créatrice de mode qui a appris à parler en pensant qu'elle était un humain." },
  { word: "KONG", clue: "Le haut commandant qui supervise l'ensemble des forces de l'ordre mondiales depuis Marie-Joie." },
  { word: "SPANDAM", clue: "Un chef lâche et incompétent qui utilisait une épée-éléphant pour masquer sa faiblesse." },
  { word: "JAYGARCIA", clue: "Un des cinq doyens, gardien du savoir scientifique et de la terreur noire." },
  { word: "MARCUS", clue: "Un doyen capable de survoler les îles sous l'aspect d'un oiseau monstrueux de l'environnement." },
  { word: "TOPMAN", clue: "Un doyen de la justice représenté sous la forme d'un sanglier colossal destructeur." },
  { word: "ETHANBARON", clue: "Un doyen squelettique maniant un sabre antique avec la rapidité d'un étalon de givre." },
  { word: "SHEPHERD", clue: "Un doyen de l'agriculture capable de creuser la terre sous l'aspect d'un ver géant dévorant." },
  { word: "FIGARLAND", clue: "Le champion des arènes devenu le chef des Chevaliers Divins chargés de purifier les impies." },
  { word: "ROSWARD", clue: "Un noble céleste hautain qui collectionne les capitaines esclaves comme de simples jouets." },
  { word: "CHARLOS", clue: "Le noble arrogant dont le masque à bulle a volé en éclats sous le poing d'un pirate élastique." },
  { word: "SHALRIA", clue: "Une noble impitoyable de la Terre Sainte qui considère les humains ordinaires comme des nuisibles." },
  { word: "FOUSHA", clue: "Le petit port paisible d'East Blue où un garçon a juré de surpasser son mentor manchot." },
  { word: "ALABASTA", clue: "Un royaume de sable et de mirages où un complot d'usurpation s'est dissous sous la pluie." },
  { word: "SKYPIEA", clue: "Une terre de nuages et d'anges où les cloches d'or ont résonné après quatre cents ans de silence." },
  { word: "WATERSEVEN", clue: "Une métropole flottante de charpentiers menacée chaque année par une vague gigantesque." },
  { word: "SABAODY", clue: "Un archipel de mangroves et de bulles géantes où les destins se brisent sous le marteau des esclaves." },
  { word: "IMPELDOWN", clue: "L'enfer sous-marin divisé en cercles de tortures glaciales et brûlantes sous la mer." },
  { word: "MARINEFORD", clue: "La place forte de la justice où la mer s'est brisée pour sauver un fils condamné." },
  { word: "PUNKHAZARD", clue: "Une île coupée en deux par le duel des éléments, devenue un laboratoire interdit." },
  { word: "DRESSROSA", clue: "Un royaume festif et tragique où les jouets oubliés pleuraient dans l'ombre d'un roi marionnettiste." },
  { word: "ZOU", clue: "Une cité de fourrure et de brume portée au-dessus des vagues par un colosse millénaire." },
  { word: "WHOLECAKE", clue: "Un archipel de confiseries et de miroirs régné par la fureur d'une impératrice gourmande." },
  { word: "WANO", clue: "Un pays fermé de cerisiers et de forteresses où la liberté s'est conquise au son des tambours." },
  { word: "ERBAF", clue: "Le royaume légendaire des guerriers titans sous l'ombre d'un arbre immense." },
  { word: "LAUGHTALE", clue: "La dernière étape d'un voyage maritime, où le trésor final arrache un éclat de rire à ses visiteurs." },
  { word: "LOGUETOWN", clue: "La cité des potences où le premier et le futur Roi ont défié la mort avec un sourire." },
  { word: "ENIESLOBBY", clue: "La porte du non-retour judiciaire où un pavillon mondial a été transpercé par le feu." },
  { word: "OHARA", clue: "La patrie des archéologues consumée par le feu pour avoir voulu déchiffrer le nom du Siècle Oublié." },
  { word: "THRILLERBARK", clue: "Un gigantesque navire-île voguant dans le brouillard, volant l'ombre des marins égarés." },
  { word: "AMAZONLILY", clue: "L'île sauvage des guerrières au parfum de lotus, interdite à tout être masculin." },
  { word: "PRIME", clue: "L'évaluation chiffrée de la menace qu'un pirate fait peser sur la tranquillité des dieux." },
  { word: "MARINE", clue: "Le bras armé du pouvoir qui fait régner l'ordre tout en fermant les yeux sur les vices de Marie-Joie." },
  { word: "GOUVERNEMENT", clue: "L'organisation centenaire qui efface l'histoire pour maintenir sa couronne sur le monde." },
  { word: "DOYEN", clue: "L'un des cinq vieillards immortels qui tirent les ficelles de la justice mondiale depuis leur palais." },
  { word: "PIRATE", clue: "Un aventurier arborant le crâne blanc, recherchant la liberté ou la richesse aux dépens des lois." },
  { word: "CHEVALIER", clue: "Un gardien céleste de la Terre Sainte chargé d'exécuter la volonté des Nobles." },
  { word: "REVOLUTIONNAIRE", clue: "Un insurgé de l'ombre qui combat les tyrans pour libérer les peuples enchaînés." },
  { word: "CORSAIRE", clue: "Un capitaine pirate qui a vendu son indépendance pour s'offrir le pardon officiel des amiraux." },
  { word: "BUSTERCALL", clue: "Le signal destructeur de dix navires de guerre rasant toute vie d'une carte géographique." },
  { word: "ALLIANCE", clue: "Un pacte temporaire de méfiance entre capitaines visant à faire tomber un Empereur." },
  { word: "GRANDLINE", clue: "La route maritime de tous les périls où les boussoles ordinaires perdent le nord." },
  { word: "REDLINE", clue: "Le mur de roche rouge s'élevant jusqu'aux cieux pour diviser les mers du monde." },
  { word: "PONEGLYPHE", clue: "Une stèle de pierre sombre et indestructible gravée de l'histoire effacée du monde." },
  { word: "BERRYS", clue: "La monnaie qui s'accumule dans les coffres des marchands et s'échange contre des têtes de pirates." },
  { word: "NIKA", clue: "Le libérateur mythique dont le rire résonne pour briser les chaînes de l'oppression." },
  { word: "VEGAPUNK", clue: "L'esprit le plus brillant du monde divisé en six corps pour accélérer ses découvertes." },
];

// ==========================================
// 2. TYPES DE STRUCTURE DE GRILLE
// ==========================================
interface PlacedWord {
  word: string;
  clue: string;
  x: number; // Coordonnées globales (0..29)
  y: number;
  direction: "across" | "down";
  number?: number;
}

interface GridCell {
  x: number; // Coordonnées locales cropped (0..cols-1)
  y: number;
  globalX: number; // Coordonnées absolues dans le solveur
  globalY: number;
  letter: string; // La lettre correcte
  guess: string;  // Saisie joueur
  isRevealed: boolean; // Révélée d'office ou par indice
  isPlayable: boolean; // Fait partie d'un mot
  number?: number; // Numéro d'indice
  acrossWords: PlacedWord[]; // Mots horizontaux passant par là
  downWords: PlacedWord[];   // Mots verticaux passant par là
}

interface MotsCroisesProps {
  onUpdateBounty: (amount: number) => void;
  globalBounty: number;
}

export default function MotsCroises({ onUpdateBounty, globalBounty }: MotsCroisesProps) {
  // --- États du jeu ---
  const [placedWords, setPlacedWords] = useState<PlacedWord[]>([]);
  const [grid, setGrid] = useState<GridCell[][]>([]);
  const [rowsCount, setRowsCount] = useState(0);
  const [colsCount, setColsCount] = useState(0);
  const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null);
  const [activeDirection, setActiveDirection] = useState<"across" | "down">("across");
  
  const [hasWon, setHasWon] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notification, setNotification] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [wrongCells, setWrongCells] = useState<Record<string, boolean>>({});

  // Refs pour les éléments d'input
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // --- Sons synthétisés ---
  const playSound = (type: "coin" | "win" | "click" | "error") => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = ctx.currentTime;
      
      if (type === "coin") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.08); // A5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === "win") {
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C Majeur arpège crescendo
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.08, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.4);
        });
      } else if (type === "click") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === "error") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {
      console.warn("L'AudioContext du navigateur a été bloqué ou n'est pas supporté :", e);
    }
  };

  const showNotification = (text: string, type: "success" | "error" | "info" = "info") => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // --- GÉNÉRATEUR PROCEDURAL DE MOTS CROISÉS (ALGORITHME COHÉRENT) ---
  const generateNewCrossword = () => {
    // 1. Piocher et trier 15 mots pour maximiser les chances de placement
    const shuffled = [...DICTIONARY].sort(() => Math.random() - 0.5);
    const candidateWords = shuffled.slice(0, 15);

    // Initialiser une grande matrice temporaire 32x32
    const boardSize = 32;
    const tempBoard = Array(boardSize).fill(null).map(() => Array(boardSize).fill(""));
    const placedList: PlacedWord[] = [];

    // Helper: Vérifier si le placement est valide (collisions et contacts indésirables)
    const canPlaceWord = (word: string, startX: number, startY: number, direction: "across" | "down") => {
      const len = word.length;
      
      // Sortie de grille ?
      if (direction === "across") {
        if (startX < 0 || startX + len > boardSize || startY < 0 || startY >= boardSize) return false;
        // Case immédiatement avant et après le mot
        if (startX - 1 >= 0 && tempBoard[startY][startX - 1] !== "") return false;
        if (startX + len < boardSize && tempBoard[startY][startX + len] !== "") return false;
      } else {
        if (startY < 0 || startY + len > boardSize || startX < 0 || startX >= boardSize) return false;
        if (startY - 1 >= 0 && tempBoard[startY - 1][startX] !== "") return false;
        if (startY + len < boardSize && tempBoard[startY + len][startX] !== "") return false;
      }

      let intersections = 0;

      for (let i = 0; i < len; i++) {
        const x = direction === "across" ? startX + i : startX;
        const y = direction === "across" ? startY : startY + i;

        const currentLetter = tempBoard[y][x];

        if (currentLetter !== "") {
          // Si occupé, la lettre doit correspondre parfaitement
          if (currentLetter !== word[i]) return false;
          intersections++;
        } else {
          // Si vide, s'assurer de ne pas toucher de mot parallèle
          if (direction === "across") {
            // Vérifier au-dessus et en dessous
            if (y - 1 >= 0 && tempBoard[y - 1][x] !== "") return false;
            if (y + 1 < boardSize && tempBoard[y + 1][x] !== "") return false;
          } else {
            // Vérifier à gauche et à droite
            if (x - 1 >= 0 && tempBoard[y][x - 1] !== "") return false;
            if (x + 1 < boardSize && tempBoard[y][x + 1] !== "") return false;
          }
        }
      }

      // Pour tous les mots suivants le premier, on exige au moins une intersection croisée
      return placedList.length === 0 || intersections > 0;
    };

    // Helper: Placer physiquement un mot sur la matrice
    const placeWord = (wordItem: WordItem, startX: number, startY: number, direction: "across" | "down") => {
      const len = wordItem.word.length;
      for (let i = 0; i < len; i++) {
        const x = direction === "across" ? startX + i : startX;
        const y = direction === "across" ? startY : startY + i;
        tempBoard[y][x] = wordItem.word[i];
      }
      placedList.push({
        word: wordItem.word,
        clue: wordItem.clue,
        x: startX,
        y: startY,
        direction,
      });
    };

    // Trier les candidats par longueur décroissante (les longs d'abord)
    const sortedCandidates = [...candidateWords].sort((a, b) => b.word.length - a.word.length);

    // Placer le premier mot horizontalement au centre de la grille
    const firstItem = sortedCandidates[0];
    const firstX = Math.floor(boardSize / 2) - Math.floor(firstItem.word.length / 2);
    const firstY = Math.floor(boardSize / 2);
    placeWord(firstItem, firstX, firstY, "across");

    // Tenter de croiser les mots restants
    for (let wIdx = 1; wIdx < sortedCandidates.length; wIdx++) {
      const candidate = sortedCandidates[wIdx];
      const word = candidate.word;
      let bestPlacement: { x: number; y: number; direction: "across" | "down"; score: number } | null = null;

      // Chercher des lettres communes avec des mots déjà placés
      for (const placed of placedList) {
        for (let i = 0; i < word.length; i++) {
          const letter = word[i];
          const matchedIdx = placed.word.indexOf(letter);
          
          if (matchedIdx !== -1) {
            // Un croisement potentiel est identifié!
            const intersectionX = placed.direction === "across" ? placed.x + matchedIdx : placed.x;
            const intersectionY = placed.direction === "across" ? placed.y : placed.y + matchedIdx;
            
            // Le nouveau mot prend la direction opposée
            const newDirection = placed.direction === "across" ? "down" : "across";
            const startX = newDirection === "across" ? intersectionX - i : intersectionX;
            const startY = newDirection === "across" ? intersectionY : intersectionY - i;

            if (canPlaceWord(word, startX, startY, newDirection)) {
              // Calculer un score simple de centralité et compacité
              const distToCenter = Math.abs(startX - 16) + Math.abs(startY - 16);
              const score = 100 - distToCenter; // Préfère le centre

              if (!bestPlacement || score > bestPlacement.score) {
                bestPlacement = { x: startX, y: startY, direction: newDirection, score };
              }
            }
          }
        }
      }

      // Si un croisement optimal a été trouvé, on l'ajoute
      if (bestPlacement) {
        placeWord(candidate, bestPlacement.x, bestPlacement.y, bestPlacement.direction);
      }
    }

    // --- CONTRAINTE NOMBRE DE MOTS (5 à 10) ---
    // Si nous n'en avons pas assez ou trop, on relance récursivement
    if (placedList.length < 5 || placedList.length > 10) {
      // Retenter de façon autonome
      generateNewCrossword();
      return;
    }

    // --- CADRAGE OPTIMAL DE LA GRILLE (CROP) ---
    // Trouver les limites géographiques de la grille pour supprimer les marges vides
    let minX = boardSize, maxX = 0, minY = boardSize, maxY = 0;
    for (let y = 0; y < boardSize; y++) {
      for (let x = 0; x < boardSize; x++) {
        if (tempBoard[y][x] !== "") {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // Ajuster avec un padding de 1 cellule
    minX = Math.max(0, minX - 1);
    maxX = Math.min(boardSize - 1, maxX + 1);
    minY = Math.max(0, minY - 1);
    maxY = Math.min(boardSize - 1, maxY + 1);

    const croppedRows = maxY - minY + 1;
    const croppedCols = maxX - minX + 1;

    // Repositionner les coordonnées de départ des mots placés par rapport au recadrage
    const finalPlacedWords = placedList.map(item => ({
      ...item,
      x: item.x - minX,
      y: item.y - minY
    }));

    // Ordonner les positions de départ des mots croisés de haut en bas et gauche à droite pour affecter les petits numéros d'indices
    const sortedStarts = [...finalPlacedWords].sort((a, b) => {
      if (a.y !== b.y) return a.y - b.y;
      return a.x - b.x;
    });

    // Assigner les numéros d'indices uniques (en fusionnant les coordonnées de départ confondues)
    let currentNum = 1;
    const numberMapping: Record<string, number> = {};
    const numberedWords = finalPlacedWords.map((word) => {
      const coordKey = `${word.x},${word.y}`;
      if (numberMapping[coordKey]) {
        return { ...word, number: numberMapping[coordKey] };
      } else {
        numberMapping[coordKey] = currentNum;
        const updated = { ...word, number: currentNum };
        currentNum++;
        return updated;
      }
    });

    // Construire la structure 2D finale recadrée
    const finalGrid: GridCell[][] = Array(croppedRows).fill(null).map((_, y) => 
      Array(croppedCols).fill(null).map((_, x) => {
        const absX = minX + x;
        const absY = minY + y;
        const correctLetter = tempBoard[absY][absX];
        const isPlayable = correctLetter !== "";

        // Trouver les mots qui traversent cette case
        const cellAcrossWords = numberedWords.filter(w => 
          w.direction === "across" && y === w.y && x >= w.x && x < w.x + w.word.length
        );
        const cellDownWords = numberedWords.filter(w => 
          w.direction === "down" && x === w.x && y >= w.y && y < w.y + w.word.length
        );

        // Numéro d'indice de départ de mot ?
        const cellNumber = numberMapping[`${x},${y}`] || undefined;

        return {
          x,
          y,
          globalX: absX,
          globalY: absY,
          letter: correctLetter,
          guess: "",
          isRevealed: false,
          isPlayable,
          number: cellNumber,
          acrossWords: cellAcrossWords,
          downWords: cellDownWords,
        };
      })
    );

    // --- PAS DE RÉVÉLATION INITIALE ---
    // Les lettres de départ ont été retirées selon les préférences utilisateur (grille 100% vide au départ).

    // Mettre à jour l'état
    setPlacedWords(numberedWords);
    setGrid(finalGrid);
    setRowsCount(croppedRows);
    setColsCount(croppedCols);
    setSelectedCell(null);
    setHasWon(false);
  };

  // Lancer une partie au premier rendu
  useEffect(() => {
    generateNewCrossword();
  }, []);

  // --- INTERACTION DU CLAVIER & AUTO-FOCUS DE LA GRILLE ---
  const handleCellChange = (r: number, c: number, value: string) => {
    if (hasWon) return;

    const char = value.toUpperCase().slice(-1);
    const updatedGrid = [...grid.map(row => [...row])];
    const cell = updatedGrid[r][c];

    // Ignorer si la case est déjà verrouillée/révélée d'office
    if (cell.isRevealed) return;

    cell.guess = char;
    setGrid(updatedGrid);
    playSound("click");

    // Effacer l'état d'erreur de cette case si elle était marquée fausse
    if (wrongCells[`${r}-${c}`]) {
      setWrongCells(prev => {
        const next = { ...prev };
        delete next[`${r}-${c}`];
        return next;
      });
    }

    // Recherche de la saisie automatique du caractère suivant
    if (char !== "") {
      moveToNextCell(r, c, "forward");
    }
  };

  const handleKeyDown = (r: number, c: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (hasWon) return;

    if (e.key === "Backspace") {
      const updatedGrid = [...grid.map(row => [...row])];
      const cell = updatedGrid[r][c];

      // Si la case actuelle est vide, reculer d'un pas et effacer la case précédente
      if (cell.guess === "" && !cell.isRevealed) {
        e.preventDefault();
        moveToNextCell(r, c, "backward");
      } else if (!cell.isRevealed) {
        cell.guess = "";
        setGrid(updatedGrid);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveFocus(r - 1, c, "down", -1, 0);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      moveFocus(r + 1, c, "down", 1, 0);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      moveFocus(r, c - 1, "across", 0, -1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      moveFocus(r, c + 1, "across", 0, 1);
    }
  };

  const moveFocus = (targetR: number, targetC: number, preferredDir?: "across" | "down", deltaR: number = 0, deltaC: number = 0) => {
    let currR = targetR;
    let currC = targetC;
    let stepR = deltaR;
    let stepC = deltaC;

    // Si on clique sur un indice (pas de delta directionnel explicite) et que la case cible est révélée,
    // on avance dans le sens du mot pour trouver la première case jouable non-révélée.
    if (stepR === 0 && stepC === 0 && preferredDir) {
      stepR = preferredDir === "down" ? 1 : 0;
      stepC = preferredDir === "across" ? 1 : 0;
    }

    while (currR >= 0 && currR < rowsCount && currC >= 0 && currC < colsCount) {
      const targetCell = grid[currR][currC];
      if (targetCell && targetCell.isPlayable) {
        if (!targetCell.isRevealed) {
          setSelectedCell({ x: currC, y: currR });
          if (preferredDir) {
            setActiveDirection(preferredDir);
          }
          const inputId = `cell-${currR}-${currC}`;
          setTimeout(() => {
            inputRefs.current[inputId]?.focus();
          }, 10);
          break;
        } else {
          if (stepR !== 0 || stepC !== 0) {
            currR += stepR;
            currC += stepC;
          } else {
            break;
          }
        }
      } else {
        break;
      }
    }
  };

  const moveToNextCell = (r: number, c: number, direction: "forward" | "backward") => {
    const step = direction === "forward" ? 1 : -1;
    let nextR = r;
    let nextC = c;

    // Rechercher la prochaine case jouable non-révélée
    while (true) {
      if (activeDirection === "across") {
        nextC += step;
      } else {
        nextR += step;
      }

      if (nextR >= 0 && nextR < rowsCount && nextC >= 0 && nextC < colsCount) {
        const target = grid[nextR][nextC];
        if (target && target.isPlayable) {
          if (!target.isRevealed) {
            moveFocus(nextR, nextC, activeDirection);
            // Si on recule, effacer aussi le contenu de la case précédente (si non révélée)
            if (direction === "backward") {
              const updatedGrid = [...grid.map(row => [...row])];
              updatedGrid[nextR][nextC].guess = "";
              setGrid(updatedGrid);
            }
            break;
          } else {
            continue;
          }
        } else {
          break;
        }
      } else {
        break;
      }
    }
  };

  // --- ACTIONS ÉCONOMIQUES : RÉVÉLER UNE LETTRE CONTRE DES BERRYS ---
  const handleRevealLetter = () => {
    if (hasWon) return;

    // Vérifier si le joueur dispose d'assez de prime (au moins 1 000 Berrys)
    if (globalBounty < 1000) {
      playSound("error");
      showNotification("Votre prime de Berrys est insuffisante pour acheter un indice ! (-1 000 ฿ requis)", "error");
      return;
    }

    // Trouver toutes les cases jouables non encore révélées ni correctement devinées
    const unrevealedCells: { r: number; c: number }[] = [];
    for (let r = 0; r < rowsCount; r++) {
      for (let c = 0; c < colsCount; c++) {
        const cell = grid[r][c];
        if (cell.isPlayable && !cell.isRevealed && cell.guess !== cell.letter) {
          unrevealedCells.push({ r, c });
        }
      }
    }

    if (unrevealedCells.length === 0) {
      showNotification("Toutes les lettres en jeu ont déjà été trouvées ou révélées !", "info");
      return;
    }

    // Retirer 1 000 Berrys de la prime globale directement
    onUpdateBounty(-1000);
    playSound("coin");

    // Choisir une cellule au hasard
    const randomTarget = unrevealedCells[Math.floor(Math.random() * unrevealedCells.length)];
    const updatedGrid = [...grid.map(row => [...row])];
    const cell = updatedGrid[randomTarget.r][randomTarget.c];
    
    cell.isRevealed = true;
    cell.guess = cell.letter;
    
    setGrid(updatedGrid);
    showNotification(`La lettre '${cell.letter}' a été révélée dans la grille ! (-1 000 ฿)`, "success");

    // Vérifier la victoire après cette révélation d'aide
    let allCorrect = true;
    for (let r = 0; r < rowsCount; r++) {
      for (let c = 0; c < colsCount; c++) {
        const gridCell = updatedGrid[r][c];
        if (gridCell.isPlayable && gridCell.guess !== gridCell.letter) {
          allCorrect = false;
          break;
        }
      }
    }

    if (allCorrect) {
      setHasWon(true);
      playSound("win");
      onUpdateBounty(10000);
      showNotification("FÉLICITATIONS PIRATE ! Grille de Mots Croisés complétée à 100% avec succès ! (+10 000 ฿ de prime)", "success");
    }
  };

  // --- CLASSEMENT DES INDICES PAR DIRECTION ---
  const getAcrossClues = () => {
    const list = placedWords.filter(w => w.direction === "across");
    return list.sort((a, b) => (a.number || 0) - (b.number || 0));
  };

  const getDownClues = () => {
    const list = placedWords.filter(w => w.direction === "down");
    return list.sort((a, b) => (a.number || 0) - (b.number || 0));
  };

  // --- VALIDATION ET EXPÉRIENCE DE VICTOIRE ---
  const handleValidateGrid = () => {
    if (hasWon) return;

    let hasErrors = false;
    let emptyCount = 0;
    let errorCount = 0;
    const newWrongCells: Record<string, boolean> = {};

    for (let r = 0; r < rowsCount; r++) {
      for (let c = 0; c < colsCount; c++) {
        const cell = grid[r][c];
        if (cell.isPlayable) {
          if (cell.guess === "") {
            emptyCount++;
          } else if (cell.guess !== cell.letter) {
            hasErrors = true;
            errorCount++;
            newWrongCells[`${r}-${c}`] = true;
          }
        }
      }
    }

    setWrongCells(newWrongCells);

    if (emptyCount > 0 && !hasErrors) {
      playSound("error");
      showNotification(`La grille n'est pas complète ! Il vous reste ${emptyCount} case(s) à remplir.`, "info");
    } else if (hasErrors) {
      playSound("error");
      showNotification(`Validation échouée : Vous avez ${errorCount} erreur(s) (indiquées en rouge dans la grille).`, "error");
      
      // Effacer les erreurs après 3 secondes
      setTimeout(() => {
        setWrongCells({});
      }, 3000);
    } else {
      // Tout est correct !
      setHasWon(true);
      playSound("win");
      onUpdateBounty(10000);
      showNotification("FÉLICITATIONS PIRATE ! Grille de Mots Croisés complétée à 100% avec succès ! (+10 000 ฿ de prime)", "success");
    }
  };

  // --- EXPORTATEUR ET TÉLÉCHARGEMENT DE FICHIER HTML AUTONOME (SINGLE-FILE) ---
  const handleExportHTML = () => {
    playSound("click");
    
    // Contenu HTML/CSS/JS complet et élégant
    const htmlTemplate = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mots Croisés One Piece - Grand Line Hub</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Space+Grotesk:wght@500;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Inter', sans-serif;
      background-color: #0b0d1e;
      color: #cbd5e1;
    }
    .heading-font {
      font-family: 'Space Grotesk', sans-serif;
    }
    .mono-font {
      font-family: 'JetBrains Mono', sans-serif;
    }
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  </style>
</head>
<body class="min-h-screen py-8 px-4 flex flex-col justify-between">

  <div class="max-w-4xl mx-auto w-full">
    <!-- Header -->
    <header class="text-center mb-8">
      <div class="inline-flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-full mb-3">
        <span class="text-amber-400 text-sm heading-font font-bold">MINI-JEU D'ÉCONOMIE INDÉPENDANT</span>
      </div>
      <h1 class="text-3xl md:text-4xl heading-font font-extrabold text-white tracking-tight uppercase">
        ☠️ MOTS CROISÉS <span class="text-amber-400">GRAND LINE</span>
      </h1>
      <p class="text-slate-400 text-sm mt-1 max-w-lg mx-auto">
        Trouvez les mots cachés tirés du lore d'One Piece et gérez intelligemment votre cagnotte de Berrys.
      </p>
    </header>

    <!-- Infos & Économie -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
        <div>
          <span class="text-xs text-slate-400 uppercase tracking-widest block font-bold">Cagnotte Fictive</span>
          <span class="text-2xl font-black text-amber-400 heading-font mt-1 inline-flex items-center gap-1.5" id="wallet-display">
            ฿ 15,000
          </span>
        </div>
        <div class="bg-amber-400/10 p-3 rounded-xl border border-amber-500/20">
          <svg class="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex gap-3 items-center justify-between shadow-lg">
        <button onclick="revealRandomLetter()" class="w-1/2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold py-3.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 text-xs shadow-md cursor-pointer" id="reveal-btn">
          <span>💡 Indice (-1K ฿)</span>
        </button>
        <button onclick="manualValidate()" class="w-1/2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold py-3.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 text-xs shadow-md cursor-pointer" id="validate-btn">
          <span>✅ Valider la grille</span>
        </button>
      </div>
    </div>

    <!-- Container Jeu Principal -->
    <div class="bg-slate-950 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8">
      
      <!-- Zone Notification -->
      <div id="notification" class="hidden mb-6 p-4 rounded-xl text-sm font-semibold transition-all flex items-center gap-3"></div>

      <!-- Zone Victoire -->
      <div id="victory-card" class="hidden mb-8 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/50 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden">
        <h3 class="text-2xl font-extrabold text-amber-400 heading-font uppercase">🎉 VICTOIRE ÉPIQUE !</h3>
        <p class="text-slate-200 mt-2 text-sm">
          Vous avez résolu toute la grille de Mots Croisés de Grand Line ! Votre prime a été créditée de <strong class="text-amber-400">+10 000 Berrys</strong>.
        </p>
        <button onclick="restartGame()" class="mt-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-widest transition-all shadow-md active:scale-95">
          Relever un autre défi
        </button>
      </div>

      <!-- Grille Crossword -->
      <div class="flex justify-center overflow-x-auto pb-4 mb-8 no-scrollbar">
        <div class="p-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-inner inline-block" id="crossword-grid-container">
          <!-- Injecté dynamiquement par JS -->
        </div>
      </div>

      <!-- Indices/Clues -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-800/80 pt-6">
        <div>
          <h4 class="text-sm uppercase tracking-widest text-emerald-400 font-extrabold flex items-center gap-2 mb-3">
            <span>➡️ HORIZONTAL (ACROSS)</span>
          </h4>
          <ul class="space-y-2.5 text-xs text-slate-300" id="clues-across">
            <!-- Injecté par JS -->
          </ul>
        </div>
        <div>
          <h4 class="text-sm uppercase tracking-widest text-indigo-400 font-extrabold flex items-center gap-2 mb-3">
            <span>⬇️ VERTICAL (DOWN)</span>
          </h4>
          <ul class="space-y-2.5 text-xs text-slate-300" id="clues-down">
            <!-- Injecté par JS -->
          </ul>
        </div>
      </div>

    </div>
  </div>

  <footer class="text-center text-xs text-slate-500 mt-12 py-4">
    <p>Grand Line Hub - Mini-jeu autonome de Mots Croisés procéduraux © 2026</p>
  </footer>

  <!-- SCRIPT DE JEU INDÉPENDANT -->
  <script>
    const DICTIONARY = ${JSON.stringify(DICTIONARY)};

    let placedWords = [];
    let grid = [];
    let rowsCount = 0;
    let colsCount = 0;
    let selectedCell = null;
    let activeDirection = "across";
    let gameWallet = 15000;
    let hasWon = false;

    // Sonneries de jeu synthétiques
    function playAudio(type) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const now = ctx.currentTime;
        if (type === "coin") {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(587.33, now);
          osc.frequency.setValueAtTime(880, now + 0.08);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.3);
        } else if (type === "win") {
          const notes = [261.63, 329.63, 392, 523.25, 659.25, 783.99, 1046.5];
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);
            gain.gain.setValueAtTime(0.08, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.4);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.4);
          });
        } else if (type === "click") {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(440, now);
          gain.gain.setValueAtTime(0.02, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.05);
        } else if (type === "error") {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(150, now);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.2);
        }
      } catch(e) {}
    }

    function showToast(text, type = "info") {
      const toast = document.getElementById("notification");
      toast.classList.remove("hidden", "bg-emerald-500/10", "border-emerald-500/30", "text-emerald-400", "bg-rose-500/10", "border-rose-500/30", "text-rose-400", "bg-indigo-500/10", "border-indigo-500/30", "text-indigo-400");
      
      if (type === "success") {
        toast.classList.add("bg-emerald-500/10", "border", "border-emerald-500/30", "text-emerald-400");
      } else if (type === "error") {
        toast.classList.add("bg-rose-500/10", "border", "border-rose-500/30", "text-rose-400");
      } else {
        toast.classList.add("bg-indigo-500/10", "border", "border-indigo-500/30", "text-indigo-400");
      }
      toast.innerText = text;
      toast.classList.remove("hidden");
      setTimeout(() => toast.classList.add("hidden"), 4000);
    }

    // Algorithme procédural
    function buildCrossword() {
      const shuffled = [...DICTIONARY].sort(() => Math.random() - 0.5);
      const candidates = shuffled.slice(0, 15);
      const size = 32;
      const board = Array(size).fill(null).map(() => Array(size).fill(""));
      const placedList = [];

      function checkFit(word, x, y, dir) {
        const len = word.length;
        if (dir === "across") {
          if (x < 0 || x + len > size || y < 0 || y >= size) return false;
          if (x - 1 >= 0 && board[y][x - 1] !== "") return false;
          if (x + len < size && board[y][x + len] !== "") return false;
        } else {
          if (y < 0 || y + len > size || x < 0 || x >= size) return false;
          if (y - 1 >= 0 && board[y - 1][x] !== "") return false;
          if (y + len < size && board[y + len][x] !== "") return false;
        }

        let crossCount = 0;
        for (let i = 0; i < len; i++) {
          const cx = dir === "across" ? x + i : x;
          const cy = dir === "across" ? y : y + i;
          const letter = board[cy][cx];
          if (letter !== "") {
            if (letter !== word[i]) return false;
            crossCount++;
          } else {
            if (dir === "across") {
              if (cy - 1 >= 0 && board[cy - 1][cx] !== "") return false;
              if (cy + 1 < size && board[cy + 1][cx] !== "") return false;
            } else {
              if (cx - 1 >= 0 && board[cy][cx - 1] !== "") return false;
              if (cx + 1 < size && board[cy][cx + 1] !== "") return false;
            }
          }
        }
        return placedList.length === 0 || crossCount > 0;
      }

      function place(item, x, y, dir) {
        for (let i = 0; i < item.word.length; i++) {
          const cx = dir === "across" ? x + i : x;
          const cy = dir === "across" ? y : y + i;
          board[cy][cx] = item.word[i];
        }
        placedList.push({ word: item.word, clue: item.clue, x, y, direction: dir });
      }

      // Trier les candidats par taille
      const sorted = candidates.sort((a,b) => b.word.length - a.word.length);
      const first = sorted[0];
      place(first, 16 - Math.floor(first.word.length / 2), 16, "across");

      for (let i = 1; i < sorted.length; i++) {
        const item = sorted[i];
        const word = item.word;
        let best = null;

        for (const placed of placedList) {
          for (let wIdx = 0; wIdx < word.length; wIdx++) {
            const letter = word[wIdx];
            const matchIdx = placed.word.indexOf(letter);
            if (matchIdx !== -1) {
              const ix = placed.direction === "across" ? placed.x + matchIdx : placed.x;
              const iy = placed.direction === "across" ? placed.y : placed.y + matchIdx;
              const nextDir = placed.direction === "across" ? "down" : "across";
              const sx = nextDir === "across" ? ix - wIdx : ix;
              const sy = nextDir === "across" ? iy : iy - wIdx;

              if (checkFit(word, sx, sy, nextDir)) {
                const dist = Math.abs(sx - 16) + Math.abs(sy - 16);
                const score = 100 - dist;
                if (!best || score > best.score) {
                  best = { x: sx, y: sy, direction: nextDir, score };
                }
              }
            }
          }
        }
        if (best) place(item, best.x, best.y, best.direction);
      }

      if (placedList.length < 5 || placedList.length > 10) {
        return buildCrossword();
      }

      // Bounding box recadrée
      let minX = size, maxX = 0, minY = size, maxY = 0;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          if (board[y][x] !== "") {
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
          }
        }
      }

      minX = Math.max(0, minX - 1);
      maxX = Math.min(size - 1, maxX + 1);
      minY = Math.max(0, minY - 1);
      maxY = Math.min(size - 1, maxY + 1);

      rowsCount = maxY - minY + 1;
      colsCount = maxX - minX + 1;

      placedWords = placedList.map(item => ({
        ...item,
        x: item.x - minX,
        y: item.y - minY
      }));

      const numMap = {};
      let numCounter = 1;
      placedWords.forEach((word) => {
        const key = word.x + "," + word.y;
        if (numMap[key]) {
          word.number = numMap[key];
        } else {
          numMap[key] = numCounter;
          word.number = numCounter;
          numCounter++;
        }
      });

      grid = Array(rowsCount).fill(null).map((_, y) => 
        Array(colsCount).fill(null).map((_, x) => {
          const letter = board[minY + y][minX + x];
          const isPlayable = letter !== "";
          const num = numMap[x + "," + y] || null;

          return {
            x, y, letter, guess: "", isRevealed: false, isPlayable, number: num
          };
        })
      );
    }

    function renderGrid() {
      const container = document.getElementById("crossword-grid-container");
      container.innerHTML = "";
      
      const gridEl = document.createElement("div");
      gridEl.className = "grid gap-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800";
      gridEl.style.gridTemplateColumns = "repeat(" + colsCount + ", minmax(0, 1fr))";

      for (let r = 0; r < rowsCount; r++) {
        for (let c = 0; c < colsCount; c++) {
          const cell = grid[r][c];
          const cellDiv = document.createElement("div");
          
          if (!cell.isPlayable) {
            cellDiv.className = "w-7 h-7 sm:w-9 sm:h-9 bg-transparent";
          } else {
            cellDiv.className = "w-7 h-7 sm:w-9 sm:h-9 relative bg-white border border-slate-900 rounded-sm flex items-center justify-center shadow-sm";
            
            if (cell.number) {
              const numSpan = document.createElement("span");
              numSpan.className = "absolute top-0.5 left-0.5 text-[7px] sm:text-[9px] font-bold text-slate-950";
              numSpan.innerText = cell.number;
              cellDiv.appendChild(numSpan);
            }

            const input = document.createElement("input");
            input.id = "cell-" + r + "-" + c;
            input.type = "text";
            // Retrait de maxLength pour éviter le blocage lors du changement de lettre
            input.className = "w-full h-full text-center font-black text-sm sm:text-base uppercase bg-transparent text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 border-none pt-2";
            input.value = cell.guess;
            
            if (cell.isRevealed) {
              input.disabled = true;
              cellDiv.classList.add("bg-amber-100");
            }

            input.addEventListener("input", (e) => {
              const char = e.target.value.toUpperCase().slice(-1);
              cell.guess = char;
              input.value = char;
              playAudio("click");
              
              // Effacer le rouge si on écrit
              cellDiv.classList.remove("bg-rose-100", "border-rose-500");
              input.classList.remove("text-rose-600");

              if (char !== "") {
                focusNext(r, c, 1);
              }
            });

            input.addEventListener("keydown", (e) => {
              if (e.key === "Backspace" && cell.guess === "" && !cell.isRevealed) {
                focusNext(r, c, -1);
              }
            });

            cellDiv.appendChild(input);
          }
          gridEl.appendChild(cellDiv);
        }
      }
      container.appendChild(gridEl);
    }=== "" && !cell.isRevealed) {
                focusNext(r, c, -1);
              }
            });

            cellDiv.appendChild(input);
          }
          gridEl.appendChild(cellDiv);
        }
      }
      container.appendChild(gridEl);
    }

    function focusNext(r, c, step) {
      let nc = c;
      let nr = r;
      
      while (true) {
        if (activeDirection === "across") {
          nc += step;
        } else {
          nr += step;
        }
        
        if (nr >= 0 && nr < rowsCount && nc >= 0 && nc < colsCount) {
          const targetCell = grid[nr][nc];
          if (targetCell && targetCell.isPlayable) {
            if (!targetCell.isRevealed) {
              const input = document.getElementById("cell-" + nr + "-" + nc);
              if (input) {
                input.focus();
                if (step === -1) {
                  targetCell.guess = "";
                  input.value = "";
                }
              }
              break;
            } else {
              continue; // Skip revealed cells
            }
          } else {
            break;
          }
        } else {
          break;
        }
      }
    }

    function focusFirstUnrevealed(r, c, dir) {
      let nr = r;
      let nc = c;
      const stepR = dir === "down" ? 1 : 0;
      const stepC = dir === "across" ? 1 : 0;
      
      while (nr >= 0 && nr < rowsCount && nc >= 0 && nc < colsCount) {
        const cell = grid[nr][nc];
        if (cell && cell.isPlayable) {
          if (!cell.isRevealed) {
            const input = document.getElementById("cell-" + nr + "-" + nc);
            if (input) {
              input.focus();
              selectedCell = { x: nc, y: nr };
            }
            break;
          } else {
            nr += stepR;
            nc += stepC;
          }
        } else {
          break;
        }
      }
    }

    function renderClues() {
      const hClues = document.getElementById("clues-across");
      const vClues = document.getElementById("clues-down");
      hClues.innerHTML = "";
      vClues.innerHTML = "";

      placedWords.forEach((word) => {
        const li = document.createElement("li");
        li.className = "flex gap-2.5 items-start bg-slate-900/40 hover:bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60 transition-all cursor-pointer";
        li.innerHTML = '<span class="bg-indigo-900/60 border border-indigo-500/30 text-indigo-300 font-bold px-1.5 py-0.5 rounded text-[10px] mono-font shrink-0">' + word.number + '</span><span class="leading-relaxed">' + word.clue + ' <strong class="text-indigo-400 font-mono text-[10px]">(' + word.word.length + ' l.)</strong></span>';
        
        li.onclick = () => {
          activeDirection = word.direction;
          focusFirstUnrevealed(word.y, word.x, word.direction);
        };

        if (word.direction === "across") {
          hClues.appendChild(li);
        } else {
          vClues.appendChild(li);
        }
      });
    }

    function updateWalletDisplay() {
      document.getElementById("wallet-display").innerText = "฿ " + gameWallet.toLocaleString();
    }

    function revealRandomLetter() {
      if (hasWon) return;
      if (gameWallet < 1000) {
        playAudio("error");
        showToast("Cagnotte insuffisante ! (-1 000 Berrys requis)", "error");
        return;
      }

      const options = [];
      for (let r = 0; r < rowsCount; r++) {
        for (let c = 0; c < colsCount; c++) {
          const cell = grid[r][c];
          if (cell.isPlayable && !cell.isRevealed && cell.guess !== cell.letter) {
            options.push({ r, c });
          }
        }
      }

      if (options.length === 0) {
        showToast("Toutes les lettres sont déjà complétées ou trouvées !");
        return;
      }

      gameWallet -= 1000;
      updateWalletDisplay();
      playAudio("coin");

      const choice = options[Math.floor(Math.random() * options.length)];
      const cell = grid[choice.r][choice.c];
      cell.isRevealed = true;
      cell.guess = cell.letter;

      renderGrid();
      showToast("La lettre '" + cell.letter + "' a été révélée dans la grille !", "success");
    }

    function manualValidate() {
      if (hasWon) return;

      let hasErrors = false;
      let emptyCount = 0;
      let errorCount = 0;
      const wrongList = [];

      for (let r = 0; r < rowsCount; r++) {
        for (let c = 0; c < colsCount; c++) {
          const cell = grid[r][c];
          if (cell.isPlayable) {
            if (cell.guess === "") {
              emptyCount++;
            } else if (cell.guess !== cell.letter) {
              hasErrors = true;
              errorCount++;
              wrongList.push({r, c});
            }
          }
        }
      }

      // Highlight wrong cells in red
      wrongList.forEach(item => {
        const input = document.getElementById("cell-" + item.r + "-" + item.c);
        if (input) {
          input.parentElement.classList.add("bg-rose-100", "border-rose-500");
          input.classList.add("text-rose-600");
        }
      });

      // Clear highlights after 3 seconds
      setTimeout(() => {
        wrongList.forEach(item => {
          const input = document.getElementById("cell-" + item.r + "-" + item.c);
          if (input) {
            input.parentElement.classList.remove("bg-rose-100", "border-rose-500");
            input.classList.remove("text-rose-600");
          }
        });
      }, 3000);

      if (emptyCount > 0 && !hasErrors) {
        playAudio("error");
        showToast("La grille n'est pas complète ! " + emptyCount + " case(s) vide(s).", "info");
      } else if (hasErrors) {
        playAudio("error");
        showToast("Validation échouée : " + errorCount + " erreur(s) trouvée(s) (marquée(s) en rouge) !", "error");
      } else {
        // Victory!
        hasWon = true;
        gameWallet += 10000;
        updateWalletDisplay();
        playAudio("win");
        document.getElementById("victory-card").classList.remove("hidden");
        document.getElementById("reveal-btn").disabled = true;
        document.getElementById("validate-btn").disabled = true;
        showToast("FÉLICITATIONS ! Grille complétée avec succès ! (+10 000 Berrys)", "success");
      }
    }

    function restartGame() {
      hasWon = false;
      document.getElementById("victory-card").classList.add("hidden");
      document.getElementById("reveal-btn").disabled = false;
      document.getElementById("validate-btn").disabled = false;
      buildCrossword();
      renderGrid();
      renderClues();
      showToast("Nouvelle grille de Mots Croisés générée de manière procédurale !", "success");
    }

    // Premier lancement
    window.onload = () => {
      buildCrossword();
      renderGrid();
      renderClues();
      updateWalletDisplay();
    };
  </script>
</body>
</html>`;

    const blob = new Blob([htmlTemplate], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `mots_croises_one_piece.html`;
    link.click();
    showNotification("Téléchargement lancé ! Le fichier HTML autonome est prêt à être testé.", "success");
  };

  return (
    <div className="bg-[#0B0D1E]/40 border border-white/5 rounded-3xl p-6 backdrop-blur-sm relative overflow-hidden" id="mots-croises-box">
      
      {/* 1. Header du module */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold px-3 py-1 rounded-full text-xs font-heading mb-3 tracking-wider uppercase">
            <Brain className="w-3.5 h-3.5" />
            Mots Croisés Procéduraux
          </div>
          <h2 className="text-2xl md:text-3xl font-heading font-black text-[#F8FAFC] tracking-tight flex items-center gap-3">
            ☠️ LA GRILLE DE <span className="text-amber-400">GRAND LINE</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1 max-w-xl">
            Saisissez les réponses en lettres majuscules. Les petits numéros indiquent le début des indices. 
            Utilisez vos Berrys pour acheter des révélations de lettres si nécessaire !
          </p>
        </div>

        {/* Boutons d'options généraux */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl border border-white/5 transition-all cursor-pointer"
            title={soundEnabled ? "Couper le son" : "Activer le son"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
          <button
            onClick={generateNewCrossword}
            className="flex items-center gap-2 px-4 py-3 bg-[#151D3A] hover:bg-indigo-950 text-[#F8FAFC] rounded-xl border border-indigo-500/30 text-xs font-bold transition-all cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-4 h-4 text-amber-400 animate-spin-slow" />
            RÉGÉNÉRER
          </button>
        </div>
      </div>

      {/* 2. Notifications de jeu */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-6 p-4 rounded-xl text-sm font-heading font-bold border flex items-center gap-3 shadow-md ${
              notification.type === "success" 
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                : notification.type === "error"
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                  : "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
            }`}
          >
            {notification.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {notification.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Panel Économie (Cagnotte de Berrys) & Boutons d'action */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        
        {/* Votre Prime globale */}
        <div className="bg-[#10142C] border border-white/5 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Votre Prime (Bounty)</span>
            <span className="text-xl font-black text-amber-400 font-heading mt-1 flex items-center gap-1.5">
              ฿ {globalBounty.toLocaleString()}
            </span>
          </div>
          <div className="bg-amber-400/10 p-3 rounded-xl border border-amber-500/20">
            <Coins className="w-5 h-5 text-amber-400" />
          </div>
        </div>

        {/* Bouton Révéler une lettre */}
        <button
          onClick={handleRevealLetter}
          disabled={hasWon}
          className="bg-gradient-to-r from-indigo-700 to-indigo-900 hover:from-indigo-600 hover:to-indigo-800 disabled:opacity-50 text-white font-extrabold px-5 py-4 rounded-2xl transition-all shadow-md flex items-center justify-between cursor-pointer active:scale-[0.98] border border-indigo-500/30"
        >
          <span className="flex items-center gap-2 text-xs uppercase font-heading">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            Indices : Révéler (-1 000 ฿)
          </span>
        </button>

        {/* Bouton Valider la grille */}
        <button
          onClick={handleValidateGrid}
          disabled={hasWon}
          className="bg-gradient-to-r from-emerald-700 to-emerald-900 hover:from-emerald-600 hover:to-emerald-800 disabled:opacity-50 text-white font-extrabold px-5 py-4 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] border border-emerald-500/30 font-heading text-xs uppercase"
        >
          <CheckCircle className="w-4 h-4 text-emerald-300" />
          Valider la grille
        </button>
      </div>

      {/* 4. Tableau d'affichage de Victoire */}
      <AnimatePresence>
        {hasWon && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-6 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-2 border-amber-400/50 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>
            <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-3 animate-bounce" />
            <h3 className="text-xl md:text-2xl font-heading font-black text-amber-300 uppercase">🏆 GRILLE ENTIÈREMENT CONQUISE !</h3>
            <p className="text-slate-200 mt-2 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
              Vos connaissances en lore d'One Piece vous ont permis d'aligner chaque caractère à la perfection.
              Votre cagnotte locale grimpe de <strong className="text-amber-400 font-black">+10 000 Berrys</strong>, 
              et votre prime de combat pirate de recherche globale est mise à jour avec fierté !
            </p>
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center mt-5">
              <button
                onClick={generateNewCrossword}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3 rounded-xl text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Générer une nouvelle grille
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. ZONE DE GRILLE DE MOTS CROISÉS (BLANCHE CLASSIQUE / RESPONSIVE) */}
      <div className="bg-[#121634] border border-white/5 rounded-3xl p-4 md:p-6 mb-8 flex flex-col items-center justify-center shadow-inner">
        <div className="w-full overflow-x-auto flex justify-center pb-2 no-scrollbar">
          
          {/* Grille HTML pure pour un style papier blanc */}
          <div className="bg-slate-950 p-4 rounded-2xl shadow-2xl border border-slate-800/80 inline-block">
            <div 
              style={{ gridTemplateColumns: `repeat(${colsCount}, minmax(0, 1fr))` }}
              className="grid gap-1 bg-slate-900/60"
            >
              {grid.map((row, rIdx) => 
                row.map((cell, cIdx) => {
                  const isFocused = selectedCell && selectedCell.x === cIdx && selectedCell.y === rIdx;
                  
                  // Mettre en surbrillance si la case fait partie d'un mot actif
                  let isPartOfActiveWord = false;
                  if (selectedCell) {
                    const activeCell = grid[selectedCell.y][selectedCell.x];
                    if (activeDirection === "across" && cell.isPlayable) {
                      isPartOfActiveWord = cell.acrossWords.some(w => activeCell.acrossWords.includes(w));
                    } else if (activeDirection === "down" && cell.isPlayable) {
                      isPartOfActiveWord = cell.downWords.some(w => activeCell.downWords.includes(w));
                    }
                  }

                  if (!cell.isPlayable) {
                    return (
                      <div 
                        key={`cell-${rIdx}-${cIdx}`} 
                        className="w-8 h-8 sm:w-10 sm:h-10 bg-transparent transition-all"
                      />
                    );
                  }

                  return (
                    <div 
                      key={`cell-${rIdx}-${cIdx}`}
                      onClick={() => {
                        // Cliquer une deuxième fois change la direction
                        if (selectedCell?.x === cIdx && selectedCell?.y === rIdx) {
                          setActiveDirection(prev => prev === "across" ? "down" : "across");
                        } else {
                          setSelectedCell({ x: cIdx, y: rIdx });
                          // Mettre une direction par défaut qui existe sur cette case
                          if (cell.acrossWords.length > 0 && cell.downWords.length === 0) {
                            setActiveDirection("across");
                          } else if (cell.downWords.length > 0 && cell.acrossWords.length === 0) {
                            setActiveDirection("down");
                          }
                        }
                      }}
                      className={`w-8 h-8 sm:w-10 sm:h-10 relative border rounded-sm flex items-center justify-center shadow-sm cursor-pointer transition-all ${
                        wrongCells[`${rIdx}-${cIdx}`]
                          ? "bg-rose-100 border-rose-500 ring-2 ring-rose-500 z-10"
                          : isFocused 
                            ? "bg-white border-slate-950 ring-2 ring-amber-500 z-10" 
                            : isPartOfActiveWord 
                              ? "bg-amber-100/90 border-slate-950" 
                              : cell.isRevealed 
                                ? "bg-amber-50 border-slate-950" 
                                : "bg-white border-slate-950 hover:bg-slate-50"
                      }`}
                    >
                      {/* Petit numéro d'indice */}
                      {cell.number && (
                        <span className="absolute top-0.5 left-0.5 text-[8px] sm:text-[10px] font-black text-slate-900 select-none leading-none">
                          {cell.number}
                        </span>
                      )}

                      {/* Input de saisie */}
                      <input
                        id={`cell-${rIdx}-${cIdx}`}
                        ref={(el) => { inputRefs.current[`cell-${rIdx}-${cIdx}`] = el; }}
                        type="text"
                        // Retrait de maxLength pour éviter de bloquer l'édition
                        value={cell.guess}
                        disabled={cell.isRevealed || hasWon}
                        onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(rIdx, cIdx, e)}
                        className={`w-full h-full text-center font-black text-sm sm:text-base uppercase bg-transparent border-none focus:outline-none pt-2 font-sans ${
                          wrongCells[`${rIdx}-${cIdx}`] ? "text-rose-600" : "text-slate-900"
                        }`}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
        
        {/* Petite légende des contrôles */}
        <div className="flex flex-wrap gap-4 items-center justify-center text-slate-400 text-[10px] sm:text-xs mt-3 border-t border-white/5 pt-3 w-full">
          <span className="flex items-center gap-1.5"><kbd className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-white text-[9px]">Tab</kbd> Navigation</span>
          <span className="flex items-center gap-1.5"><kbd className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-white text-[9px]">Backspace</kbd> Effacer</span>
          <span className="flex items-center gap-1.5"><kbd className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-white text-[9px]">Clic ×2</kbd> Pivoter sens</span>
          <span className="flex items-center gap-1.5"><kbd className="bg-amber-400/20 text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded text-[9px]">Jaune</kbd> Mot Actif</span>
        </div>
      </div>

      {/* 6. INDICES ET THÉMATIQUES DU JEU (HORIZONTAL / VERTICAL) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#10142C]/40 border border-white/5 p-6 rounded-3xl mb-8">
        
        {/* Across Clues */}
        <div>
          <h3 className="text-sm font-heading font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
            <span className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px]">A</span>
            ➡️ HORIZONTAL (ACROSS)
          </h3>
          <ul className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1 no-scrollbar">
            {getAcrossClues().map((word) => (
              <li 
                key={`across-${word.number}`}
                onClick={() => moveFocus(word.y, word.x, "across")}
                className={`flex gap-3 items-start p-3 rounded-2xl border transition-all cursor-pointer ${
                  selectedCell && grid[word.y][word.x].acrossWords.some(w => w.word === word.word)
                    ? "bg-emerald-950/40 border-emerald-500/30 text-white"
                    : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:border-white/10"
                }`}
              >
                <span className="bg-[#121634] border border-emerald-500/30 text-emerald-300 font-bold px-2 py-0.5 rounded-lg text-xs font-mono shrink-0">
                  {word.number}
                </span>
                <span className="text-xs leading-relaxed">
                  {word.clue} <strong className="text-emerald-500 text-[10px] font-mono">({word.word.length} l.)</strong>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Down Clues */}
        <div>
          <h3 className="text-sm font-heading font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
            <span className="bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded text-[10px]">B</span>
            ⬇️ VERTICAL (DOWN)
          </h3>
          <ul className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1 no-scrollbar">
            {getDownClues().map((word) => (
              <li 
                key={`down-${word.number}`}
                onClick={() => moveFocus(word.y, word.x, "down")}
                className={`flex gap-3 items-start p-3 rounded-2xl border transition-all cursor-pointer ${
                  selectedCell && grid[word.y][word.x].downWords.some(w => w.word === word.word)
                    ? "bg-indigo-950/40 border-indigo-500/30 text-white"
                    : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:border-white/10"
                }`}
              >
                <span className="bg-[#121634] border border-indigo-500/30 text-indigo-300 font-bold px-2 py-0.5 rounded-lg text-xs font-mono shrink-0">
                  {word.number}
                </span>
                <span className="text-xs leading-relaxed">
                  {word.clue} <strong className="text-indigo-400 text-[10px] font-mono">({word.word.length} l.)</strong>
                </span>
              </li>
            ))}
          </ul>
        </div>

      </div>



    </div>
  );
}

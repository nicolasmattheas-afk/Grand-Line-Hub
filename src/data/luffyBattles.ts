export interface LuffyBattle {
  id: number;
  opponent: string;
  opponentsList: string[]; // Liste des noms individuels pour le mapping de la base de données
  result: string;
  outcomeType: "victoire" | "defaite" | "interrompu" | "fuite" | "autre";
  sagaOrContext: string;
  isCanon: boolean;
}

export const LUFFY_BATTLES: LuffyBattle[] = [
  {
    id: 1,
    opponent: "Portgas D. Ace",
    opponentsList: ["Portgas D. Ace"],
    result: "Défaite (combats d'entraînement durant leur enfance)",
    outcomeType: "defaite",
    sagaOrContext: "Enfance",
    isCanon: true
  },
  {
    id: 2,
    opponent: "Sabo",
    opponentsList: ["Sabo"],
    result: "Défaite (combats d'entraînement durant leur enfance)",
    outcomeType: "defaite",
    sagaOrContext: "Enfance",
    isCanon: true
  },
  {
    id: 3,
    opponent: "Higuma",
    opponentsList: ["Higuma"],
    result: "Victoire (sauvé par Shanks mais Higuma a été éliminé)",
    outcomeType: "victoire",
    sagaOrContext: "Enfance",
    isCanon: true
  },
  {
    id: 4,
    opponent: "Monstre de la Baie",
    opponentsList: ["Monstre de la Baie"],
    result: "Victoire (premier coup de poing de son voyage au départ de Fushia)",
    outcomeType: "victoire",
    sagaOrContext: "East Blue",
    isCanon: true
  },
  {
    id: 5,
    opponent: "Équipage d'Alvida",
    opponentsList: ["Alvida"],
    result: "Victoire facile",
    outcomeType: "victoire",
    sagaOrContext: "East Blue",
    isCanon: true
  },
  {
    id: 6,
    opponent: "Alvida",
    opponentsList: ["Alvida"],
    result: "Victoire (propulsée au loin avec un Gomu Gomu no Pistol)",
    outcomeType: "victoire",
    sagaOrContext: "East Blue",
    isCanon: true
  },
  {
    id: 7,
    opponent: "Morgan",
    opponentsList: ["Morgan", "Roronoa Zoro"],
    result: "Victoire (Luffy et Zoro l'ont terrassé ensemble)",
    outcomeType: "victoire",
    sagaOrContext: "East Blue",
    isCanon: true
  },
  {
    id: 8,
    opponent: "Kobby",
    opponentsList: ["Koby"],
    result: "Victoire (combat stratégique pour aider Kobby à rejoindre la Marine)",
    outcomeType: "victoire",
    sagaOrContext: "East Blue",
    isCanon: true
  },
  {
    id: 9,
    opponent: "Freaky Domingos",
    opponentsList: ["Freaky Domingos"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "East Blue",
    isCanon: false
  },
  {
    id: 10,
    opponent: "Morge & Richy",
    opponentsList: ["Mohji", "Richie"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "East Blue",
    isCanon: true
  },
  {
    id: 11,
    opponent: "Baggy",
    opponentsList: ["Buggy"],
    result: "Victoire (avec l'aide précieuse de Nami)",
    outcomeType: "victoire",
    sagaOrContext: "East Blue",
    isCanon: true
  },
  {
    id: 12,
    opponent: "Kuro",
    opponentsList: ["Kuro"],
    result: "Victoire (Gomu Gomu no Kane)",
    outcomeType: "victoire",
    sagaOrContext: "East Blue",
    isCanon: true
  },
  {
    id: 13,
    opponent: "Don Krieg",
    opponentsList: ["Don Krieg"],
    result: "Victoire (Gomu Gomu no Ozuchi)",
    outcomeType: "victoire",
    sagaOrContext: "East Blue",
    isCanon: true
  },
  {
    id: 14,
    opponent: "Meuh-Meuh",
    opponentsList: ["Meuh-Meuh", "Mohmoh"],
    result: "Victoire (Luffy et Sanji l'ont balancé)",
    outcomeType: "victoire",
    sagaOrContext: "East Blue",
    isCanon: true
  },
  {
    id: 15,
    opponent: "l'Équipage d'Arlong",
    opponentsList: ["Arlong"],
    result: "Victoire collective",
    outcomeType: "victoire",
    sagaOrContext: "East Blue",
    isCanon: true
  },
  {
    id: 16,
    opponent: "Arlong",
    opponentsList: ["Arlong"],
    result: "Victoire éclatante (Gomu Gomu no Ono détruisant Arlong Park)",
    outcomeType: "victoire",
    sagaOrContext: "East Blue",
    isCanon: true
  },
  {
    id: 17,
    opponent: "Smoker",
    opponentsList: ["Smoker"],
    result: "Interrompu par Monkey D. Dragon qui sauve Luffy de la capture",
    outcomeType: "interrompu",
    sagaOrContext: "East Blue",
    isCanon: true
  },
  {
    id: 18,
    opponent: "Mr 5 & Miss Valentine",
    opponentsList: ["Mr 5", "Miss Valentine", "Roronoa Zoro"],
    result: "Victoire (avec Zoro)",
    outcomeType: "victoire",
    sagaOrContext: "Alabasta",
    isCanon: true
  },
  {
    id: 19,
    opponent: "Zoro",
    opponentsList: ["Roronoa Zoro"],
    result: "Interrompu par Nami à Whiskey Peak",
    outcomeType: "interrompu",
    sagaOrContext: "Alabasta",
    isCanon: true
  },
  {
    id: 20,
    opponent: "Mr. 3 & Miss GoldenWeek",
    opponentsList: ["Mr 3", "Miss Goldenweek"],
    result: "Victoire avec l'aide d'Usopp, Zoro, Nami & Vivi",
    outcomeType: "victoire",
    sagaOrContext: "Alabasta",
    isCanon: true
  },
  {
    id: 21,
    opponent: "Wapol",
    opponentsList: ["Wapol"],
    result: "Victoire (propulsé hors du château avec un Gomu Gomu no Bazooka)",
    outcomeType: "victoire",
    sagaOrContext: "Alabasta",
    isCanon: true
  },
  {
    id: 22,
    opponent: "Crocodile",
    opponentsList: ["Crocodile", "sircrocodile"],
    result: "Victoire finale (après deux défaites marquantes)",
    outcomeType: "victoire",
    sagaOrContext: "Alabasta",
    isCanon: true
  },
  {
    id: 23,
    opponent: "Bellamy",
    opponentsList: ["Bellamy"],
    result: "Victoire retentissante en un seul coup de poing à Jaya",
    outcomeType: "victoire",
    sagaOrContext: "Skypiea",
    isCanon: true
  },
  {
    id: 24,
    opponent: "les Bérets Blancs",
    opponentsList: ["Bérets Blancs"],
    result: "Victoire facile",
    outcomeType: "victoire",
    sagaOrContext: "Skypiea",
    isCanon: true
  },
  {
    id: 25,
    opponent: "Satori",
    opponentsList: ["Satori"],
    result: "Victoire (avec Sanji et Usopp)",
    outcomeType: "victoire",
    sagaOrContext: "Skypiea",
    isCanon: true
  },
  {
    id: 26,
    opponent: "Wiper",
    opponentsList: ["Wiper"],
    result: "Interrompu par le serpent géant",
    outcomeType: "interrompu",
    sagaOrContext: "Skypiea",
    isCanon: true
  },
  {
    id: 27,
    opponent: "Ener",
    opponentsList: ["Ener", "enel"],
    result: "Victoire (Gomu Gomu no Golden Rifle)",
    outcomeType: "victoire",
    sagaOrContext: "Skypiea",
    isCanon: true
  },
  {
    id: 28,
    opponent: "Foxy",
    opponentsList: ["Foxy"],
    result: "Victoire au Davy Back Fight",
    outcomeType: "victoire",
    sagaOrContext: "Water 7",
    isCanon: true
  },
  {
    id: 29,
    opponent: "Aokiji",
    opponentsList: ["Kuzan"],
    result: "Défaite écrasante (Luffy se fait totalement geler)",
    outcomeType: "defaite",
    sagaOrContext: "Water 7",
    isCanon: true
  },
  {
    id: 30,
    opponent: "Franky Family",
    opponentsList: ["Franky"],
    result: "Victoire collective (destruction de la House of Franky)",
    outcomeType: "victoire",
    sagaOrContext: "Water 7",
    isCanon: true
  },
  {
    id: 31,
    opponent: "Usopp",
    opponentsList: ["Usopp"],
    result: "Victoire déchirante sur la plage de Water Seven pour le Vogue Merry",
    outcomeType: "victoire",
    sagaOrContext: "Water 7",
    isCanon: true
  },
  {
    id: 32,
    opponent: "les Charpentiers de Galley-La Company",
    opponentsList: ["Galley-La"],
    result: "Interrompu / Fuite",
    outcomeType: "fuite",
    sagaOrContext: "Water 7",
    isCanon: true
  },
  {
    id: 33,
    opponent: "CP9",
    opponentsList: ["Rob Lucci", "Kaku", "Blueno", "Kalifa"],
    result: "Défaite à Water Seven (projetés à travers les bâtiments)",
    outcomeType: "defaite",
    sagaOrContext: "Water 7",
    isCanon: true
  },
  {
    id: 34,
    opponent: "Marines",
    opponentsList: ["Marine"],
    result: "Victoire collective",
    outcomeType: "victoire",
    sagaOrContext: "Enies Lobby",
    isCanon: true
  },
  {
    id: 35,
    opponent: "Blueno",
    opponentsList: ["Blueno"],
    result: "Victoire (première apparition du Gear 2)",
    outcomeType: "victoire",
    sagaOrContext: "Enies Lobby",
    isCanon: true
  },
  {
    id: 36,
    opponent: "Rob Lucci",
    opponentsList: ["Rob Lucci"],
    result: "Victoire épique (Gomu Gomu no Jet Gatling final en Gear 2)",
    outcomeType: "victoire",
    sagaOrContext: "Enies Lobby",
    isCanon: true
  },
  {
    id: 37,
    opponent: "Campacino et Brindo",
    opponentsList: ["Campacino", "Brindo"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Ice Hunter",
    isCanon: false
  },
  {
    id: 38,
    opponent: "Don Accino",
    opponentsList: ["Don Accino"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Ice Hunter",
    isCanon: false
  },
  {
    id: 39,
    opponent: "les Zombies de la forêt",
    opponentsList: ["Zombies"],
    result: "Victoire facile",
    outcomeType: "victoire",
    sagaOrContext: "Thriller Bark",
    isCanon: true
  },
  {
    id: 40,
    opponent: "Tapis-Ours",
    opponentsList: ["Tapis-Ours"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Thriller Bark",
    isCanon: true
  },
  {
    id: 41,
    opponent: "Gecko Moria",
    opponentsList: ["Gecko Moria", "geckomoria"],
    result: "Victoire (grâce à Nightmare Luffy et la défaite de ses ombres)",
    outcomeType: "victoire",
    sagaOrContext: "Thriller Bark",
    isCanon: true
  },
  {
    id: 42,
    opponent: "Odz & Gecko Moria",
    opponentsList: ["Odz", "Gecko Moria"],
    result: "Victoire collective",
    outcomeType: "victoire",
    sagaOrContext: "Thriller Bark",
    isCanon: true
  },
  {
    id: 43,
    opponent: "Odz",
    opponentsList: ["Odz"],
    result: "Victoire collective de l'Équipage",
    outcomeType: "victoire",
    sagaOrContext: "Thriller Bark",
    isCanon: true
  },
  {
    id: 44,
    opponent: "Exocet Riders",
    opponentsList: ["Duval"],
    result: "Victoire / Accord conclu avec Duval après remodelage facial",
    outcomeType: "victoire",
    sagaOrContext: "Archipel Sabaody",
    isCanon: true
  },
  {
    id: 45,
    opponent: "Chasseur de primes",
    opponentsList: ["Chasseurs"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Archipel Sabaody",
    isCanon: false
  },
  {
    id: 46,
    opponent: "Saint Charlos",
    opponentsList: ["Charlos"],
    result: "Victoire éclatante (coup de poing légendaire dans la salle des ventes)",
    outcomeType: "victoire",
    sagaOrContext: "Archipel Sabaody",
    isCanon: true
  },
  {
    id: 47,
    opponent: "Eustass Kidd & Trafalgar Law",
    opponentsList: ["Eustass Kid", "Trafalgar D. Water Law"],
    result: "Victoire contre les Marines devant la maison des enchères",
    outcomeType: "victoire",
    sagaOrContext: "Archipel Sabaody",
    isCanon: true
  },
  {
    id: 48,
    opponent: "PX-4",
    opponentsList: ["Pacifista"],
    result: "Victoire collective extrêmement difficile",
    outcomeType: "victoire",
    sagaOrContext: "Archipel Sabaody",
    isCanon: true
  },
  {
    id: 49,
    opponent: "Sentômaru",
    opponentsList: ["Sentomaru"],
    result: "Fuite obligatoire / Interrompu",
    outcomeType: "fuite",
    sagaOrContext: "Archipel Sabaody",
    isCanon: true
  },
  {
    id: 50,
    opponent: "Kuma",
    opponentsList: ["Bartholomew Kuma"],
    result: "Défaite totale (séparation traumatisante de l'équipage)",
    outcomeType: "defaite",
    sagaOrContext: "Archipel Sabaody",
    isCanon: true
  },
  {
    id: 51,
    opponent: "Bacura",
    opponentsList: ["Bacura"],
    result: "Victoire instantanée d'un seul coup",
    outcomeType: "victoire",
    sagaOrContext: "Amazon Lily",
    isCanon: true
  },
  {
    id: 52,
    opponent: "Boa Sandersonia & Boa Marigold",
    opponentsList: ["Boa Sandersonia", "Boa Marigold"],
    result: "Victoire dans l'arène de combat en libérant son Haki",
    outcomeType: "victoire",
    sagaOrContext: "Amazon Lily",
    isCanon: true
  },
  {
    id: 53,
    opponent: "Blue Gorillas",
    opponentsList: ["Buggy"],
    result: "Victoire (coopération amusante avec Baggy au niveau 1)",
    outcomeType: "victoire",
    sagaOrContext: "Impel Down",
    isCanon: true
  },
  {
    id: 54,
    opponent: "Basilic",
    opponentsList: ["Basilic"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Impel Down",
    isCanon: true
  },
  {
    id: 55,
    opponent: "le Sphinx",
    opponentsList: ["Sphinx"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Impel Down",
    isCanon: true
  },
  {
    id: 56,
    opponent: "Blue Gorilles",
    opponentsList: ["Blugori"],
    result: "Victoire (coopération avec Mr. 2 Bon Clay)",
    outcomeType: "victoire",
    sagaOrContext: "Impel Down",
    isCanon: true
  },
  {
    id: 57,
    opponent: "Minotaure",
    opponentsList: ["Minotaure", "Buggy", "Mr 3"],
    result: "Victoire collective (Luffy, Baggy, Mr. 3 & Mr. 2)",
    outcomeType: "victoire",
    sagaOrContext: "Impel Down",
    isCanon: true
  },
  {
    id: 58,
    opponent: "Magellan",
    opponentsList: ["Magellan"],
    result: "Défaite cuisante (Luffy se fait lourdement empoisonner)",
    outcomeType: "defaite",
    sagaOrContext: "Impel Down",
    isCanon: true
  },
  {
    id: 59,
    opponent: "Minorhinocéros, Minokoala & Minozèbre",
    opponentsList: ["Minorhinoceros", "Minokoala", "Minozebre", "Crocodile", "Jinbe"],
    result: "Victoire collective rapide avec Crocodile et Jinbe",
    outcomeType: "victoire",
    sagaOrContext: "Impel Down",
    isCanon: true
  },
  {
    id: 60,
    opponent: "Hannyabal",
    opponentsList: ["Hannyabal"],
    result: "Victoire (interrompue par l'arrivée impromptue de Barbe Noire)",
    outcomeType: "victoire",
    sagaOrContext: "Impel Down",
    isCanon: true
  },
  {
    id: 61,
    opponent: "Barbe Noire",
    opponentsList: ["Marshall D. Teach [Blackbeard]"],
    result: "Interrompu par Jinbe pour continuer l'évasion",
    outcomeType: "interrompu",
    sagaOrContext: "Impel Down",
    isCanon: true
  },
  {
    id: 62,
    opponent: "Gardes Démons",
    opponentsList: ["Gardes Demons"],
    result: "Victoire collective",
    outcomeType: "victoire",
    sagaOrContext: "Impel Down",
    isCanon: true
  },
  {
    id: 63,
    opponent: "Magellan",
    opponentsList: ["Magellan", "Mr 3"],
    result: "Fuite réussie d'Impel Down grâce à la cire de Mr. 3",
    outcomeType: "fuite",
    sagaOrContext: "Impel Down",
    isCanon: true
  },
  {
    id: 64,
    opponent: "Hina",
    opponentsList: ["Hina"],
    result: "Victoire (esquive facile en Gear 2)",
    outcomeType: "victoire",
    sagaOrContext: "Marineford",
    isCanon: true
  },
  {
    id: 65,
    opponent: "Mihawk",
    opponentsList: ["Dracule Mihawk"],
    result: "Fuite tactique (sauvé par Baggy puis l'arrivée de Vista)",
    outcomeType: "fuite",
    sagaOrContext: "Marineford",
    isCanon: true
  },
  {
    id: 66,
    opponent: "Aokiji, Kizaru & Akainu",
    opponentsList: ["Aokiji [Kuzan]", "Kizaru [Borsalino]", "Akainu [Sakazuki]"],
    result: "Fuite / Les trois Amiraux le bloquent",
    outcomeType: "fuite",
    sagaOrContext: "Marineford",
    isCanon: true
  },
  {
    id: 67,
    opponent: "Momonga & Dalmatian",
    opponentsList: ["Momonga", "Dalmatian"],
    result: "Défaite / Neutralisé et sauvé de justesse",
    outcomeType: "defaite",
    sagaOrContext: "Marineford",
    isCanon: true
  },
  {
    id: 68,
    opponent: "Monkey D. Garp",
    opponentsList: ["Monkey D. Garp"],
    result: "Victoire (Garp s'est laissé frapper volontairement par amour pour sa famille)",
    outcomeType: "victoire",
    sagaOrContext: "Marineford",
    isCanon: true
  },
  {
    id: 69,
    opponent: "Sengoku",
    opponentsList: ["Sengoku", "Mr 3"],
    result: "Sauvetage réussi d'Ace avec l'aide de la clé en cire de Mr. 3",
    outcomeType: "victoire",
    sagaOrContext: "Marineford",
    isCanon: true
  },
  {
    id: 70,
    opponent: "Marines",
    opponentsList: ["Marine", "Portgas D. Ace"],
    result: "Victoire collective / Combat en duo iconique de Luffy & Ace",
    outcomeType: "victoire",
    sagaOrContext: "Marineford",
    isCanon: true
  },
  {
    id: 71,
    opponent: "Kizaru & Aokiji",
    opponentsList: ["Aokiji [Kuzan]", "Kizaru [Borsalino]", "Jinbe"],
    result: "Fuite réussie d'extrême justesse via le sous-marin de Law",
    outcomeType: "fuite",
    sagaOrContext: "Marineford",
    isCanon: true
  },
  {
    id: 72,
    opponent: "Jinbe",
    opponentsList: ["Jinbe"],
    result: "Interrompu / Calmé par Rayleigh sur Amazon Lily",
    outcomeType: "interrompu",
    sagaOrContext: "Post-War",
    isCanon: true
  },
  {
    id: 73,
    opponent: "Marines",
    opponentsList: ["Marine", "Jinbe"],
    result: "Victoire (Retour à Marineford pour faire sonner la cloche d'Ox)",
    outcomeType: "victoire",
    sagaOrContext: "Post-War",
    isCanon: true
  },
  {
    id: 74,
    opponent: "Demalo Black, Fausse Nami, Faux Usopp & Faux Franky",
    opponentsList: ["Demalo Black"],
    result: "Victoire immédiate (utilisation inconsciente du Haki des Rois)",
    outcomeType: "victoire",
    sagaOrContext: "Retour à Sabaody",
    isCanon: true
  },
  {
    id: 75,
    opponent: "PX-5",
    opponentsList: ["Pacifista"],
    result: "Victoire instantanée spectaculaire (Gear 2 Jet Pistol imprégné de Haki)",
    outcomeType: "victoire",
    sagaOrContext: "Retour à Sabaody",
    isCanon: true
  },
  {
    id: 76,
    opponent: "Surume",
    opponentsList: ["Surume"],
    result: "Victoire (Le Kraken est apprivoisé après un Gear 3 Elephant Gun)",
    outcomeType: "victoire",
    sagaOrContext: "Île des Hommes-Poissons",
    isCanon: true
  },
  {
    id: 77,
    opponent: "Hammond, Hyouzou & Kasagoba",
    opponentsList: ["Hammond", "Hyouzou"],
    result: "Victoire facile",
    outcomeType: "victoire",
    sagaOrContext: "Île des Hommes-Poissons",
    isCanon: true
  },
  {
    id: 78,
    opponent: "Vander Decken IX",
    opponentsList: ["Vander Decken"],
    result: "Victoire facile",
    outcomeType: "victoire",
    sagaOrContext: "Île des Hommes-Poissons",
    isCanon: true
  },
  {
    id: 79,
    opponent: "Wadatsumi",
    opponentsList: ["Wadatsumi"],
    result: "Victoire (coopération avec Sanji)",
    outcomeType: "victoire",
    sagaOrContext: "Île des Hommes-Poissons",
    isCanon: true
  },
  {
    id: 80,
    opponent: "l'Équipage des Nouveaux Hommes-Poissons",
    opponentsList: ["Hody Jones"],
    result: "Victoire (élimine 50 000 opposants en un clin d'œil avec le Haki)",
    outcomeType: "victoire",
    sagaOrContext: "Île des Hommes-Poissons",
    isCanon: true
  },
  {
    id: 81,
    opponent: "Hody Jones",
    opponentsList: ["Hody Jones"],
    result: "Victoire finale (Red Hawk puis Elephant Gatling)",
    outcomeType: "victoire",
    sagaOrContext: "Île des Hommes-Poissons",
    isCanon: true
  },
  {
    id: 82,
    opponent: "Dragon",
    opponentsList: ["Dragon", "Roronoa Zoro"],
    result: "Victoire (coopération avec Zoro, Robin & Usopp)",
    outcomeType: "victoire",
    sagaOrContext: "Punk Hazard",
    isCanon: true
  },
  {
    id: 83,
    opponent: "Barbe Brune et Centaures",
    opponentsList: ["Barbe Brune"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Punk Hazard",
    isCanon: true
  },
  {
    id: 84,
    opponent: "Yéti Cool Brothers",
    opponentsList: ["Yeti Cool Brothers"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Punk Hazard",
    isCanon: true
  },
  {
    id: 85,
    opponent: "César Clown",
    opponentsList: ["César Clown"],
    result: "Victoire éclatante (Gomu Gomu no Grizzly Magnum)",
    outcomeType: "victoire",
    sagaOrContext: "Punk Hazard",
    isCanon: true
  },
  {
    id: 86,
    opponent: "Run",
    opponentsList: ["Run"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Punk Hazard",
    isCanon: true
  },
  {
    id: 87,
    opponent: "Mone",
    opponentsList: ["Mone"],
    result: "Interrompu / Fuite",
    outcomeType: "fuite",
    sagaOrContext: "Punk Hazard",
    isCanon: true
  },
  {
    id: 88,
    opponent: "Spartan",
    opponentsList: ["Spartan"],
    result: "Victoire facile en un coup au Colisée Corrida",
    outcomeType: "victoire",
    sagaOrContext: "Dressrosa",
    isCanon: true
  },
  {
    id: 89,
    opponent: "Don Chinjao & Cavendish",
    opponentsList: ["Don Chinjao", "Cavendish"],
    result: "Interrompu",
    outcomeType: "interrompu",
    sagaOrContext: "Dressrosa",
    isCanon: true
  },
  {
    id: 90,
    opponent: "Gladiateurs",
    opponentsList: ["Gladiateurs"],
    result: "Victoire collective (avec l'aide de Fighting Bull)",
    outcomeType: "victoire",
    sagaOrContext: "Dressrosa",
    isCanon: true
  },
  {
    id: 91,
    opponent: "Hajrudin",
    opponentsList: ["Hajrudin"],
    result: "Victoire éclatante en un coup (Gear 2)",
    outcomeType: "victoire",
    sagaOrContext: "Dressrosa",
    isCanon: true
  },
  {
    id: 92,
    opponent: "Jean Ango",
    opponentsList: ["Jean Ango"],
    result: "Victoire facile",
    outcomeType: "victoire",
    sagaOrContext: "Dressrosa",
    isCanon: true
  },
  {
    id: 93,
    opponent: "Sai",
    opponentsList: ["Sai"],
    result: "Victoire (Sai est propulsé hors du ring)",
    outcomeType: "victoire",
    sagaOrContext: "Dressrosa",
    isCanon: true
  },
  {
    id: 94,
    opponent: "Don Chinjao",
    opponentsList: ["Don Chinjao"],
    result: "Victoire (remet sa tête pointue droite avec Thor Elephant Gun)",
    outcomeType: "victoire",
    sagaOrContext: "Dressrosa",
    isCanon: true
  },
  {
    id: 95,
    opponent: "Cavendish",
    opponentsList: ["Cavendish"],
    result: "Interrompu",
    outcomeType: "interrompu",
    sagaOrContext: "Dressrosa",
    isCanon: true
  },
  {
    id: 96,
    opponent: "Rebecca",
    opponentsList: ["Rebecca"],
    result: "Victoire (Luffy la bloque calmement au sol sans combat réel)",
    outcomeType: "victoire",
    sagaOrContext: "Dressrosa",
    isCanon: true
  },
  {
    id: 97,
    opponent: "Gardes de Doflamingo",
    opponentsList: ["Donquixote Doflamingo", "Roronoa Zoro"],
    result: "Victoire facile (avec Zoro)",
    outcomeType: "victoire",
    sagaOrContext: "Dressrosa",
    isCanon: true
  },
  {
    id: 98,
    opponent: "Pica",
    opponentsList: ["Pica", "Roronoa Zoro"],
    result: "Interrompu",
    outcomeType: "interrompu",
    sagaOrContext: "Dressrosa",
    isCanon: true
  },
  {
    id: 99,
    opponent: "Gladius",
    opponentsList: ["Gladius"],
    result: "Interrompu",
    outcomeType: "interrompu",
    sagaOrContext: "Dressrosa",
    isCanon: true
  },
  {
    id: 100,
    opponent: "Doflamingo et Pica",
    opponentsList: ["Donquixote Doflamingo", "Pica"],
    result: "Interrompu / Retraite stratégique avec Kyros",
    outcomeType: "interrompu",
    sagaOrContext: "Dressrosa",
    isCanon: true
  },
  {
    id: 101,
    opponent: "Machvise, Senor Pink et Dellinger",
    opponentsList: ["Machvise", "Senor Pink", "Dellinger"],
    result: "Interrompu",
    outcomeType: "interrompu",
    sagaOrContext: "Dressrosa",
    isCanon: true
  },
  {
    id: 102,
    opponent: "Pica",
    opponentsList: ["Pica"],
    result: "Interrompu (Luffy laisse Zoro gérer le combat)",
    outcomeType: "interrompu",
    sagaOrContext: "Dressrosa",
    isCanon: true
  },
  {
    id: 103,
    opponent: "Gardes de Doflamingo",
    opponentsList: ["Donquixote Doflamingo"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Dressrosa",
    isCanon: true
  },
  {
    id: 104,
    opponent: "marionnettes",
    opponentsList: ["Donquixote Doflamingo", "Cavendish"],
    result: "Victoire (coopération avec Cavendish)",
    outcomeType: "victoire",
    sagaOrContext: "Dressrosa",
    isCanon: true
  },
  {
    id: 105,
    opponent: "Doflamingo",
    opponentsList: ["Donquixote Doflamingo"],
    result: "Victoire légendaire (première apparition du Gear 4 Bounce-Man et King Kong Gun final)",
    outcomeType: "victoire",
    sagaOrContext: "Dressrosa",
    isCanon: true
  },
  {
    id: 106,
    opponent: "clone de Doflamingo",
    opponentsList: ["Donquixote Doflamingo"],
    result: "Victoire (détruit)",
    outcomeType: "victoire",
    sagaOrContext: "Dressrosa",
    isCanon: true
  },
  {
    id: 107,
    opponent: "Doflamingo et Trébol",
    opponentsList: ["Donquixote Doflamingo", "Trebol", "Trafalgar D. Water Law"],
    result: "Interrompu / Law blesse gravement Trébol",
    outcomeType: "interrompu",
    sagaOrContext: "Dressrosa",
    isCanon: true
  },
  {
    id: 108,
    opponent: "Trébol",
    opponentsList: ["Trebol"],
    result: "Victoire (Trebol s'autodétruit désespérément)",
    outcomeType: "victoire",
    sagaOrContext: "Dressrosa",
    isCanon: true
  },
  {
    id: 109,
    opponent: "Issho",
    opponentsList: ["Fujitora"],
    result: "Interrompu / Fuite respectueuse d'adieu",
    outcomeType: "interrompu",
    sagaOrContext: "Dressrosa",
    isCanon: true
  },
  {
    id: 110,
    opponent: "Rody",
    opponentsList: ["Rody"],
    result: "Interrompu par Wanda sur l'île de Zou",
    outcomeType: "interrompu",
    sagaOrContext: "Zou",
    isCanon: true
  },
  {
    id: 111,
    opponent: "Charlotte Brûlée",
    opponentsList: ["Charlotte Brulee"],
    result: "Victoire (Luffy la capture pour pouvoir naviguer dans le Miro-monde)",
    outcomeType: "victoire",
    sagaOrContext: "Whole Cake Island",
    isCanon: true
  },
  {
    id: 112,
    opponent: "Homies",
    opponentsList: ["Homies"],
    result: "Victoire facile",
    outcomeType: "victoire",
    sagaOrContext: "Whole Cake Island",
    isCanon: true
  },
  {
    id: 113,
    opponent: "Charlotte Cracker",
    opponentsList: ["Charlotte Cracker"],
    result: "Victoire (Gear 4 Tankman version Satiné, avec l'aide de Nami après 11 heures de combat)",
    outcomeType: "victoire",
    sagaOrContext: "Whole Cake Island",
    isCanon: true
  },
  {
    id: 114,
    opponent: "Vinsmoke Sanji",
    opponentsList: ["Sanji"],
    result: "Défaite (Luffy refuse catégoriquement de riposter par loyauté)",
    outcomeType: "defaite",
    sagaOrContext: "Whole Cake Island",
    isCanon: true
  },
  {
    id: 115,
    opponent: "L'armée enragée de Big Mom",
    opponentsList: ["Big Mom [Charlotte Linlin]"],
    result: "Défaite (Luffy finit totalement épuisé et capturé avec Nami)",
    outcomeType: "defaite",
    sagaOrContext: "Whole Cake Island",
    isCanon: true
  },
  {
    id: 116,
    opponent: "Soldats Chess",
    opponentsList: ["Chess Soldiers"],
    result: "Victoire facile",
    outcomeType: "victoire",
    sagaOrContext: "Whole Cake Island",
    isCanon: true
  },
  {
    id: 117,
    opponent: "Charlotte Opera",
    opponentsList: ["Charlotte Opera"],
    result: "Victoire rapide",
    outcomeType: "victoire",
    sagaOrContext: "Whole Cake Island",
    isCanon: true
  },
  {
    id: 118,
    opponent: "Mont d'Or, Counter et Cadenza",
    opponentsList: ["Mont d'Or", "Counter", "Cadenza"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Whole Cake Island",
    isCanon: true
  },
  {
    id: 119,
    opponent: "Gardes du Château",
    opponentsList: ["Gardes"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Whole Cake Island",
    isCanon: true
  },
  {
    id: 120,
    opponent: "Charlotte Katakuri",
    opponentsList: ["Charlotte Katakuri"],
    result: "Victoire d'anthologie (première apparition du Gear 4 Snakeman et King Cobra final)",
    outcomeType: "victoire",
    sagaOrContext: "Whole Cake Island",
    isCanon: true
  },
  {
    id: 121,
    opponent: "Big Mom et Prométhée",
    opponentsList: ["Big Mom [Charlotte Linlin]"],
    result: "Interrompu / Fuite tactique",
    outcomeType: "fuite",
    sagaOrContext: "Whole Cake Island",
    isCanon: true
  },
  {
    id: 122,
    opponent: "Big Mom et Zeus",
    opponentsList: ["Big Mom [Charlotte Linlin]", "Sanji"],
    result: "Interrompu / Fuite",
    outcomeType: "interrompu",
    sagaOrContext: "Whole Cake Island",
    isCanon: true
  },
  {
    id: 123,
    opponent: "Prométhée",
    opponentsList: ["Prométhée", "Jinbe"],
    result: "Interrompu (coopération avec Jinbe)",
    outcomeType: "interrompu",
    sagaOrContext: "Whole Cake Island",
    isCanon: true
  },
  {
    id: 124,
    opponent: "deux pirates de équipage aux Cent Bêtes",
    opponentsList: ["Kaidou"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Pays de Wa",
    isCanon: true
  },
  {
    id: 125,
    opponent: "Basil Hawkins et ses hommes",
    opponentsList: ["Basil Hawkins", "Roronoa Zoro"],
    result: "Fuite tactique (avec Zoro pour amener Komachiyo à l'abri)",
    outcomeType: "fuite",
    sagaOrContext: "Pays de Wa",
    isCanon: true
  },
  {
    id: 126,
    opponent: "Urashima",
    opponentsList: ["Urashima"],
    result: "Victoire (propulsé hors du ring par une claque géante de sumo)",
    outcomeType: "victoire",
    sagaOrContext: "Pays de Wa",
    isCanon: true
  },
  {
    id: 127,
    opponent: "des pirates de équipage aux Cent Bêtes",
    opponentsList: ["Kaidou", "Roronoa Zoro"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Pays de Wa",
    isCanon: true
  },
  {
    id: 128,
    opponent: "Holdem et Kamijiro",
    opponentsList: ["Holdem"],
    result: "Victoire (Red Hawk en plein visage)",
    outcomeType: "victoire",
    sagaOrContext: "Pays de Wa",
    isCanon: true
  },
  {
    id: 129,
    opponent: "Kaidou",
    opponentsList: ["Kaidou"],
    result: "Défaite cuisante au premier Round (Luffy K.O. en Gear 4 d'un seul coup)",
    outcomeType: "defaite",
    sagaOrContext: "Pays de Wa",
    isCanon: true
  },
  {
    id: 130,
    opponent: "Dobon",
    opponentsList: ["Dobon", "Eustass Kid"],
    result: "Victoire facile (Luffy et Kid coopèrent à la prison d'Udon)",
    outcomeType: "victoire",
    sagaOrContext: "Pays de Wa",
    isCanon: true
  },
  {
    id: 131,
    opponent: "Daifugo",
    opponentsList: ["Daifugo"],
    result: "Victoire facile à Udon",
    outcomeType: "victoire",
    sagaOrContext: "Pays de Wa",
    isCanon: true
  },
  {
    id: 132,
    opponent: "Babanuki",
    opponentsList: ["Babanuki"],
    result: "Victoire (Udon libérée de la peste)",
    outcomeType: "victoire",
    sagaOrContext: "Pays de Wa",
    isCanon: true
  },
  {
    id: 133,
    opponent: "Madilloman",
    opponentsList: ["Madilloman"],
    result: "Victoire (entraînement au Ryo)",
    outcomeType: "victoire",
    sagaOrContext: "Pays de Wa",
    isCanon: true
  },
  {
    id: 134,
    opponent: "des pirates de équipage aux Cent Bêtes",
    opponentsList: ["Kaidou"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Pays de Wa",
    isCanon: true
  },
  {
    id: 135,
    opponent: "Daifugo",
    opponentsList: ["Daifugo", "Tony Tony Chopper"],
    result: "Victoire (avec Chopper)",
    outcomeType: "victoire",
    sagaOrContext: "Pays de Wa",
    isCanon: true
  },
  {
    id: 136,
    opponent: "Des pirates de L'Équipage aux Cent Bêtes",
    opponentsList: ["Kaidou", "Eustass Kid", "Trafalgar D. Water Law"],
    result: "Victoire (coopération amusante avec Kid et Law)",
    outcomeType: "victoire",
    sagaOrContext: "Pays de Wa",
    isCanon: true
  },
  {
    id: 137,
    opponent: "Ulti & Page One",
    opponentsList: ["Ulti", "Page One"],
    result: "Interrompu par l'arrivée surprise de Yamato",
    outcomeType: "interrompu",
    sagaOrContext: "Pays de Wa",
    isCanon: true
  },
  {
    id: 138,
    opponent: "Number (Goki)",
    opponentsList: ["Goki"],
    result: "Victoire d'un seul coup (Gear 4 Bounce-Man)",
    outcomeType: "victoire",
    sagaOrContext: "Pays de Wa",
    isCanon: true
  },
  {
    id: 139,
    opponent: "Kaidou & Big Mom",
    opponentsList: ["Kaidou", "Big Mom [Charlotte Linlin]", "Roronoa Zoro", "Trafalgar D. Water Law", "Eustass Kid", "Killer"],
    result: "Combat sur le toit d'Onigashima (Alliance Supernovas)",
    outcomeType: "interrompu",
    sagaOrContext: "Pays de Wa",
    isCanon: true
  },
  {
    id: 140,
    opponent: "Dragon Holographique",
    opponentsList: ["Dragon Holographique"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Egghead",
    isCanon: true
  },
  {
    id: 141,
    opponent: "S-Hawk et S-Bear",
    opponentsList: ["S-Hawk", "S-Bear", "Rob Lucci", "Kaku", "Roronoa Zoro"],
    result: "Victoire (Alliance temporaire avec Lucci & Kaku)",
    outcomeType: "victoire",
    sagaOrContext: "Egghead",
    isCanon: true
  },
  {
    id: 142,
    opponent: "Kizaru",
    opponentsList: ["Kizaru [Borsalino]"],
    result: "Victoire (met Kizaru hors de combat temporairement avec un White Star Gun en Gear 5)",
    outcomeType: "victoire",
    sagaOrContext: "Egghead",
    isCanon: true
  },
  {
    id: 143,
    opponent: "Kizaru et Saturn",
    opponentsList: ["Kizaru [Borsalino]", "Jaygarcia Saturn"],
    result: "Victoire (les écrase littéralement comme des crêpes avec un Dawn Cymbal en Gear 5)",
    outcomeType: "victoire",
    sagaOrContext: "Egghead",
    isCanon: true
  },
  {
    id: 144,
    opponent: "Saturn, Warcury et Ju Peter",
    opponentsList: ["Jaygarcia Saturn", "Topman Warcury", "Shepherd Ju Peter"],
    result: "Interrompu / Fuite réussie d'Egghead grâce aux Géants Dorry et Brogy",
    outcomeType: "fuite",
    sagaOrContext: "Egghead",
    isCanon: true
  },
  {
    id: 145,
    opponent: "Saturn",
    opponentsList: ["Jaygarcia Saturn", "Jewelry Bonney"],
    result: "Victoire (attaque combinée en Gear 5 avec Bonney)",
    outcomeType: "victoire",
    sagaOrContext: "Egghead",
    isCanon: true
  },
  {
    id: 146,
    opponent: "Tigre géant",
    opponentsList: ["Portgas D. Ace", "Sabo"],
    result: "Victoire collective",
    outcomeType: "victoire",
    sagaOrContext: "Enfance",
    isCanon: true
  },
  {
    id: 147,
    opponent: "les hommes de Bluejam",
    opponentsList: ["Portgas D. Ace", "Sabo"],
    result: "Victoire collective et sauvetage",
    outcomeType: "victoire",
    sagaOrContext: "Enfance",
    isCanon: true
  },
  {
    id: 148,
    opponent: "Ganzack",
    opponentsList: ["Ganzack"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 149,
    opponent: "El Drago",
    opponentsList: ["El Drago"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 150,
    opponent: "Bear King",
    opponentsList: ["Bear King"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 151,
    opponent: "Eric",
    opponentsList: ["Eric"],
    result: "Victoire (projeté dans la mer de Calm Belt)",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 152,
    opponent: "un Dragon Millénaire",
    opponentsList: ["Dragon Millenaire"],
    result: "Victoire et sauvetage réussi",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 153,
    opponent: "les Billions",
    opponentsList: ["Portgas D. Ace"],
    result: "Victoire facile (avec Ace)",
    outcomeType: "victoire",
    sagaOrContext: "Alabasta",
    isCanon: false
  },
  {
    id: 154,
    opponent: "Wetton",
    opponentsList: ["Wetton"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 155,
    opponent: "Butler",
    opponentsList: ["Butler"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 156,
    opponent: "L'Équipage de Gasparde",
    opponentsList: ["Gasparde"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 157,
    opponent: "Gasparde",
    opponentsList: ["Gasparde"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 158,
    opponent: "Saga",
    opponentsList: ["Saga", "Roronoa Zoro"],
    result: "Victoire (coopération avec Zoro)",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 159,
    opponent: "Omatsuri",
    opponentsList: ["Omatsuri"],
    result: "Victoire très ardue",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 160,
    opponent: "Ratchet",
    opponentsList: ["Ratchet"],
    result: "Victoire (activation accidentelle de la pompe de sang du Gear 2)",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 161,
    opponent: "Bayan",
    opponentsList: ["Bayan"],
    result: "Victoire collective",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 162,
    opponent: "Governor",
    opponentsList: ["Governor"],
    result: "Victoire collective",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 163,
    opponent: "Octo et Gedatsu",
    opponentsList: ["Octo", "Gedatsu"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 164,
    opponent: "L'Équipage des Fanged Toad",
    opponentsList: ["Fanged Toad"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 165,
    opponent: "L'Équipage de Foxy et Porche",
    opponentsList: ["Foxy", "Porche"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 166,
    opponent: "Brindo, Campacino, Arbell et Salchow",
    opponentsList: ["Brindo", "Campacino", "Arbell", "Salchow"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 167,
    opponent: "Musshuru",
    opponentsList: ["Musshuru"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 168,
    opponent: "Octo, Gedatsu et Baggy",
    opponentsList: ["Octo", "Gedatsu", "Buggy", "Sanji"],
    result: "Victoire avec Sanji",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 169,
    opponent: "Foxy et Baggy",
    opponentsList: ["Foxy", "Buggy", "Roronoa Zoro", "Usopp", "Sanji"],
    result: "Victoire collective",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 170,
    opponent: "L'Équipage des Pirates Amigo",
    opponentsList: ["Amigo", "Roronoa Zoro", "Sanji"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 171,
    opponent: "Largo",
    opponentsList: ["Largo"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 172,
    opponent: "Boss",
    opponentsList: ["Boss"],
    result: "Match nul (interrompu)",
    outcomeType: "interrompu",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 173,
    opponent: "Fullbody et Jango",
    opponentsList: ["Fullbody", "Jango"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 174,
    opponent: "Kibin",
    opponentsList: ["Kibin"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 175,
    opponent: "Shiki",
    opponentsList: ["Shiki", "Roronoa Zoro", "Usopp", "Sanji", "Tony Tony Chopper"],
    result: "Défaite collective initiale",
    outcomeType: "defaite",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 176,
    opponent: "l’Équipage du Lion d'Or",
    opponentsList: ["Shiki"],
    result: "Victoire collective",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 177,
    opponent: "Shiki",
    opponentsList: ["Shiki"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 178,
    opponent: "Shiki",
    opponentsList: ["Shiki"],
    result: "Victoire finale (Gomu Gomu no Gigant Thor Axe)",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 179,
    opponent: "Byrnndi World",
    opponentsList: ["Byrnndi World"],
    result: "Défaite initiale",
    outcomeType: "defaite",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 180,
    opponent: "Sebastian",
    opponentsList: ["Sebastian", "Boa Hancock"],
    result: "Victoire (coopération avec Hancock)",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 181,
    opponent: "Byrnndi World",
    opponentsList: ["Byrnndi World"],
    result: "Victoire finale",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 182,
    opponent: "Gairam",
    opponentsList: ["Gairam"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 183,
    opponent: "World",
    opponentsList: ["Byrnndi World"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 184,
    opponent: "Momonga",
    opponentsList: ["Momonga", "Roronoa Zoro"],
    result: "Interrompu (coopération avec Zoro)",
    outcomeType: "interrompu",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 185,
    opponent: "Momonga vs. Shuzo",
    opponentsList: ["Momonga", "Shuzo"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 186,
    opponent: "Zephyr",
    opponentsList: ["Zephyr"],
    result: "Victoire finale (intense duel d'égal à égal)",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 187,
    opponent: "Kung-Fu Dugong",
    opponentsList: ["Kung-Fu Dugong"],
    result: "Victoire amicale de retrouvailles après l'ellipse",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 188,
    opponent: "Poulpe Boxer",
    opponentsList: ["Poulpe Boxer"],
    result: "Victoire facile",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 189,
    opponent: "Kung-Fu Dugong",
    opponentsList: ["Kung-Fu Dugong", "Trafalgar D. Water Law"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 190,
    opponent: "Breed",
    opponentsList: ["Breed", "Kung-Fu Dugong"],
    result: "Victoire (en duo avec Kung-Fu Dugong)",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 191,
    opponent: "Fighting Bull",
    opponentsList: ["Fighting Bull"],
    result: "Victoire (Luffy apprivoise instantanément le taureau combattant)",
    outcomeType: "victoire",
    sagaOrContext: "Dressrosa",
    isCanon: true
  },
  {
    id: 192,
    opponent: "Ideo",
    opponentsList: ["Ideo"],
    result: "Interrompu au Colisée Corrida",
    outcomeType: "interrompu",
    sagaOrContext: "Dressrosa",
    isCanon: true
  },
  {
    id: 193,
    opponent: "Fujitora",
    opponentsList: ["Fujitora", "Roronoa Zoro"],
    result: "Interrompu",
    outcomeType: "interrompu",
    sagaOrContext: "Dressrosa",
    isCanon: true
  },
  {
    id: 194,
    opponent: "Abellon",
    opponentsList: ["Abellon", "Bartolomeo"],
    result: "Victoire (coopération avec Bartolomeo)",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 195,
    opponent: "Bill",
    opponentsList: ["Bill"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 196,
    opponent: "L'Équipage de Mad Treasure",
    opponentsList: ["Mad Treasure"],
    result: "Victoire collective",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 197,
    opponent: "Mad Treasure",
    opponentsList: ["Mad Treasure"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 198,
    opponent: "Long Long",
    opponentsList: ["Long Long"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 199,
    opponent: "Gild Tesoro",
    opponentsList: ["Gild Tesoro"],
    result: "Victoire (Gear 4 Gomu Gomu no Leo Rex Bazooka)",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 200,
    opponent: "Spandam",
    opponentsList: ["Spandam"],
    result: "Victoire facile",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 201,
    opponent: "Grant",
    opponentsList: ["Grant"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 202,
    opponent: "Bonam",
    opponentsList: ["Bonam"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 203,
    opponent: "Zappa",
    opponentsList: ["Zappa"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 204,
    opponent: "Prody",
    opponentsList: ["Prody"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 205,
    opponent: "Bonam & Zappa",
    opponentsList: ["Bonam", "Zappa"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 206,
    opponent: "2 Rois des Mers Centipèdes",
    opponentsList: ["Roi des Mers"],
    result: "Victoire facile",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 207,
    opponent: "Charlotte Cabalette",
    opponentsList: ["Charlotte Cabalette"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Whole Cake Island",
    isCanon: true
  },
  {
    id: 208,
    opponent: "Charlotte Counter",
    opponentsList: ["Charlotte Counter"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Whole Cake Island",
    isCanon: true
  },
  {
    id: 209,
    opponent: "Charlotte Laurin & Charlotte Compo",
    opponentsList: ["Charlotte Laurin", "Charlotte Compo"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Whole Cake Island",
    isCanon: true
  },
  {
    id: 210,
    opponent: "Charlotte Effilée",
    opponentsList: ["Charlotte Effilée"],
    result: "Fuite",
    outcomeType: "fuite",
    sagaOrContext: "Whole Cake Island",
    isCanon: true
  },
  {
    id: 211,
    opponent: "Charlotte Mondée",
    opponentsList: ["Charlotte Mondée"],
    result: "Interrompu",
    outcomeType: "interrompu",
    sagaOrContext: "Whole Cake Island",
    isCanon: true
  },
  {
    id: 212,
    opponent: "Ginger",
    opponentsList: ["Ginger", "Boa Hancock"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 213,
    opponent: "Cidre",
    opponentsList: ["Cidre"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 214,
    opponent: "Douglas Bullet",
    opponentsList: [
      "Douglas Bullet",
      "Eustass Kid",
      "Jewelry Bonney",
      "Basil Hawkins",
      "Capone Bege",
      "Scratchmen Apoo",
      "Urouge",
      "Killer"
    ],
    result: "Défaite collective initiale face à l'incroyable puissance de Bullet",
    outcomeType: "defaite",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 215,
    opponent: "Douglas Bullet",
    opponentsList: [
      "Douglas Bullet",
      "Trafalgar D. Water Law",
      "Boa Hancock",
      "Smoker",
      "Buggy",
      "Sabo",
      "Rob Lucci",
      "Crocodile"
    ],
    result: "Victoire de l'Alliance unie pour affaiblir et fissurer son armure",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 216,
    opponent: "Douglas Bullet",
    opponentsList: ["Douglas Bullet"],
    result: "Victoire de Luffy en un contre un (Gear 4 King Cobra déchaîné)",
    outcomeType: "victoire",
    sagaOrContext: "Films / HS",
    isCanon: false
  },
  {
    id: 217,
    opponent: "Batman & Gazelleman",
    opponentsList: ["Batman", "Gazelleman"],
    result: "Victoire rapide",
    outcomeType: "victoire",
    sagaOrContext: "Pays de Wa",
    isCanon: true
  },
  {
    id: 218,
    opponent: "Bearman",
    opponentsList: ["Bearman"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Pays de Wa",
    isCanon: true
  }
];

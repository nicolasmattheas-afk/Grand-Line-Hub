export interface LuffyBattle {
  id: number;
  opponent: string;
  opponentsList: string[]; // List of individual names parsed for database mapping
  result: string;
  outcomeType: "victoire" | "defaite" | "interrompu" | "fuite" | "autre";
  sagaOrContext: string;
  isCanon: boolean;
}

export const LUFFY_BATTLES: LuffyBattle[] = [
  // === Passé & Entraînement ===
  {
    id: 1,
    opponent: "Portgas D. Ace (plusieurs fois)",
    opponentsList: ["Portgas D. Ace"],
    result: "Défaites",
    outcomeType: "defaite",
    sagaOrContext: "Enfance / Passé",
    isCanon: true
  },
  {
    id: 2,
    opponent: "Sabo (plusieurs fois)",
    opponentsList: ["Sabo"],
    result: "Défaites",
    outcomeType: "defaite",
    sagaOrContext: "Enfance / Passé",
    isCanon: true
  },
  {
    id: 3,
    opponent: "Higuma",
    opponentsList: ["Higuma"],
    result: "Interrompue par Shanks, avantage à Higuma",
    outcomeType: "interrompu",
    sagaOrContext: "Enfance / Passé",
    isCanon: true
  },
  {
    id: 4,
    opponent: "Monstre de la Baie",
    opponentsList: ["Monstre de la Baie", "Lord of the Coast"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Enfance / Passé",
    isCanon: true
  },

  // === Saga East Blue ===
  {
    id: 5,
    opponent: "Équipage d'Alvida",
    opponentsList: ["Alvida", "Koby"],
    result: "Victoire éclair",
    outcomeType: "victoire",
    sagaOrContext: "Saga East Blue",
    isCanon: true
  },
  {
    id: 6,
    opponent: "Alvida",
    opponentsList: ["Alvida"],
    result: "Victoire en un coup",
    outcomeType: "victoire",
    sagaOrContext: "Saga East Blue",
    isCanon: true
  },
  {
    id: 7,
    opponent: "Morgan",
    opponentsList: ["Morgan", "Axe-Hand Morgan"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga East Blue",
    isCanon: true
  },
  {
    id: 8,
    opponent: "Kobby (après avoir vaincu Morgan)",
    opponentsList: ["Koby"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga East Blue",
    isCanon: true
  },
  {
    id: 9,
    opponent: "Freaky Domingos",
    opponentsList: ["Freaky Domingos"],
    result: "Victoire éclair",
    outcomeType: "victoire",
    sagaOrContext: "Saga East Blue",
    isCanon: true
  },
  {
    id: 10,
    opponent: "Morge & Richy",
    opponentsList: ["Mohji", "Richie"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga East Blue",
    isCanon: true
  },
  {
    id: 11,
    opponent: "Baggy",
    opponentsList: ["Buggy"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga East Blue",
    isCanon: true
  },
  {
    id: 12,
    opponent: "Kuro",
    opponentsList: ["Kuro", "Klahadore"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga East Blue",
    isCanon: true
  },
  {
    id: 13,
    opponent: "Don Krieg",
    opponentsList: ["Don Krieg"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga East Blue",
    isCanon: true
  },
  {
    id: 14,
    opponent: "Meuh-Meuh",
    opponentsList: ["Mohmoh", "Meuh-Meuh"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga East Blue",
    isCanon: true
  },
  {
    id: 15,
    opponent: "l'Équipage d'Arlong",
    opponentsList: ["Arlong", "Hatchan", "Kuroobi", "Chew"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga East Blue",
    isCanon: true
  },
  {
    id: 16,
    opponent: "Arlong",
    opponentsList: ["Arlong"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga East Blue",
    isCanon: true
  },
  {
    id: 17,
    opponent: "Smoker (Loguetown)",
    opponentsList: ["Smoker"],
    result: "Interruption de Monkey D. Dragon, sinon défaite",
    outcomeType: "interrompu",
    sagaOrContext: "Saga East Blue",
    isCanon: true
  },

  // === Saga Baroque Works ===
  {
    id: 18,
    opponent: "Mr 5 & Miss Valentine",
    opponentsList: ["Mr. 5", "Miss Valentine", "Gem"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Baroque Works",
    isCanon: true
  },
  {
    id: 19,
    opponent: "Zoro",
    opponentsList: ["Roronoa Zoro"],
    result: "Interrompu par Nami",
    outcomeType: "interrompu",
    sagaOrContext: "Saga Baroque Works",
    isCanon: true
  },
  {
    id: 20,
    opponent: "Mr. 3 & Miss GoldenWeek",
    opponentsList: ["Galdino", "Mr. 3", "Marianne", "Miss Goldenweek"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Baroque Works",
    isCanon: true
  },
  {
    id: 21,
    opponent: "Wapol",
    opponentsList: ["Wapol"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Baroque Works",
    isCanon: true
  },
  {
    id: 22,
    opponent: "Crocodile (Désert)",
    opponentsList: ["Crocodile"],
    result: "Défaite / Introduit au crochet de sable",
    outcomeType: "defaite",
    sagaOrContext: "Saga Baroque Works",
    isCanon: true
  },
  {
    id: 23,
    opponent: "Crocodile (Palais d'Alabasta)",
    opponentsList: ["Crocodile"],
    result: "Défaite",
    outcomeType: "defaite",
    sagaOrContext: "Saga Baroque Works",
    isCanon: true
  },
  {
    id: 24,
    opponent: "Crocodile (Crypte)",
    opponentsList: ["Crocodile"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Baroque Works",
    isCanon: true
  },

  // === Saga Skypiea ===
  {
    id: 25,
    opponent: "Bellamy",
    opponentsList: ["Bellamy"],
    result: "Victoire en un coup",
    outcomeType: "victoire",
    sagaOrContext: "Saga Skypiea",
    isCanon: true
  },
  {
    id: 26,
    opponent: "les Bérets Blancs",
    opponentsList: ["Mckinley", "McKinley"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Skypiea",
    isCanon: true
  },
  {
    id: 27,
    opponent: "Satori",
    opponentsList: ["Satori"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Skypiea",
    isCanon: true
  },
  {
    id: 28,
    opponent: "Wiper",
    opponentsList: ["Wiper"],
    result: "Interrompu",
    outcomeType: "interrompu",
    sagaOrContext: "Saga Skypiea",
    isCanon: true
  },
  {
    id: 29,
    opponent: "Ener",
    opponentsList: ["Enel", "Eneru"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Skypiea",
    isCanon: true
  },

  // === Saga Water 7 ===
  {
    id: 30,
    opponent: "Foxy",
    opponentsList: ["Foxy"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Water 7 / Enies Lobby",
    isCanon: true
  },
  {
    id: 31,
    opponent: "Aokiji",
    opponentsList: ["Kuzan", "Aokiji"],
    result: "Défaite",
    outcomeType: "defaite",
    sagaOrContext: "Saga Water 7 / Enies Lobby",
    isCanon: true
  },
  {
    id: 32,
    opponent: "Franky Family",
    opponentsList: ["Zambai", "Franky House"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Water 7 / Enies Lobby",
    isCanon: true
  },
  {
    id: 33,
    opponent: "Usopp",
    opponentsList: ["Usopp"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Water 7 / Enies Lobby",
    isCanon: true
  },
  {
    id: 34,
    opponent: "les Charpentiers de Galley-La Company / Tilestone, Lulu, Pauly",
    opponentsList: ["Paulie", "Peeply Lulu", "Tilestone"],
    result: "Non fini",
    outcomeType: "interrompu",
    sagaOrContext: "Saga Water 7 / Enies Lobby",
    isCanon: true
  },
  {
    id: 35,
    opponent: "CP9",
    opponentsList: ["Rob Lucci", "Kaku", "Kalifa", "Blueno", "Jabra", "Kumadori", "Fukurou"],
    result: "Défaite",
    outcomeType: "defaite",
    sagaOrContext: "Saga Water 7 / Enies Lobby",
    isCanon: true
  },
  {
    id: 36,
    opponent: "Marines (Enies Lobby)",
    opponentsList: ["Marine"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Water 7 / Enies Lobby",
    isCanon: true
  },
  {
    id: 37,
    opponent: "Blueno",
    opponentsList: ["Blueno"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Water 7 / Enies Lobby",
    isCanon: true
  },
  {
    id: 38,
    opponent: "Rob Lucci",
    opponentsList: ["Rob Lucci"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Water 7 / Enies Lobby",
    isCanon: true
  },
  {
    id: 39,
    opponent: "Kobby (Water 7)",
    opponentsList: ["Koby"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Water 7 / Enies Lobby",
    isCanon: true
  },
  {
    id: 40,
    opponent: "Campacino et Brindo",
    opponentsList: ["Campacino", "Brindo"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Water 7 / Enies Lobby",
    isCanon: false
  },
  {
    id: 41,
    opponent: "Don Accino",
    opponentsList: ["Don Accino"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Water 7 / Enies Lobby",
    isCanon: false
  },

  // === Saga Thriller Bark ===
  {
    id: 42,
    opponent: "les Zombies de la forêt",
    opponentsList: ["Lola", "Zombie"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Thriller Bark",
    isCanon: true
  },
  {
    id: 43,
    opponent: "Tapis-Ours",
    opponentsList: ["Tapis-Ours", "Bearsy"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Thriller Bark",
    isCanon: true
  },
  {
    id: 44,
    opponent: "Gecko Moria (utilisant son clone)",
    opponentsList: ["Gecko Moria"],
    result: "Fuite de Moria",
    outcomeType: "fuite",
    sagaOrContext: "Saga Thriller Bark",
    isCanon: true
  },
  {
    id: 45,
    opponent: "Gecko Moria (poursuite dans le château)",
    opponentsList: ["Gecko Moria"],
    result: "Fuite de Moria",
    outcomeType: "fuite",
    sagaOrContext: "Saga Thriller Bark",
    isCanon: true
  },
  {
    id: 46,
    opponent: "Odz & Gecko Moria",
    opponentsList: ["Oars", "Gecko Moria"],
    result: "Défaite",
    outcomeType: "defaite",
    sagaOrContext: "Saga Thriller Bark",
    isCanon: true
  },
  {
    id: 47,
    opponent: "Odz",
    opponentsList: ["Oars"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Thriller Bark",
    isCanon: true
  },
  {
    id: 48,
    opponent: "Gecko Moria",
    opponentsList: ["Gecko Moria"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Thriller Bark",
    isCanon: true
  },

  // === Saga Guerre au Sommet ===
  {
    id: 49,
    opponent: "Exocet Riders",
    opponentsList: ["Duval"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Guerre au Sommet",
    isCanon: true
  },
  {
    id: 50,
    opponent: "Chasseur de primes",
    opponentsList: ["Chasseur de primes"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Guerre au Sommet",
    isCanon: true
  },
  {
    id: 51,
    opponent: "Saint Charlos",
    opponentsList: ["Charlos"],
    result: "Victoire en un coup",
    outcomeType: "victoire",
    sagaOrContext: "Saga Guerre au Sommet",
    isCanon: true
  },
  {
    id: 52,
    opponent: "Eustass Kidd & Trafalgar Law (vs Marines)",
    opponentsList: ["Kid", "Eustass Kid", "Eustass Kidd", "Law", "Trafalgar Law"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Guerre au Sommet",
    isCanon: true
  },
  {
    id: 53,
    opponent: "PX-4",
    opponentsList: ["Pacifista"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Guerre au Sommet",
    isCanon: true
  },
  {
    id: 54,
    opponent: "Sentômaru",
    opponentsList: ["Sentomaru"],
    result: "Interrompu",
    outcomeType: "interrompu",
    sagaOrContext: "Saga Guerre au Sommet",
    isCanon: true
  },
  {
    id: 55,
    opponent: "Kuma",
    opponentsList: ["Bartholomew Kuma"],
    result: "Défaite",
    outcomeType: "defaite",
    sagaOrContext: "Saga Guerre au Sommet",
    isCanon: true
  },
  {
    id: 56,
    opponent: "Bacura",
    opponentsList: ["Bacura"],
    result: "Victoire écrasante",
    outcomeType: "victoire",
    sagaOrContext: "Saga Guerre au Sommet",
    isCanon: true
  },
  {
    id: 57,
    opponent: "Boa Sandersonia & Boa Marigold",
    opponentsList: ["Boa Sandersonia", "Boa Marigold"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Guerre au Sommet",
    isCanon: true
  },
  {
    id: 58,
    opponent: "Blue Gorillas",
    opponentsList: ["Blue Gorilla"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Guerre au Sommet",
    isCanon: true
  },
  {
    id: 59,
    opponent: "Basilic",
    opponentsList: ["Basilic", "Basilisk"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Guerre au Sommet",
    isCanon: true
  },
  {
    id: 60,
    opponent: "le Sphinx",
    opponentsList: ["le Sphinx", "Sphinx"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Guerre au Sommet",
    isCanon: true
  },
  {
    id: 61,
    opponent: "Blue Gorilles (avec Mr. 2)",
    opponentsList: ["Blue Gorilla"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Guerre au Sommet",
    isCanon: true
  },
  {
    id: 62,
    opponent: "Minotaure (avec Baggy, Mr. 3 & Mr. 2)",
    opponentsList: ["Minotaurus", "Minotaure"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Guerre au Sommet",
    isCanon: true
  },
  {
    id: 63,
    opponent: "Magellan",
    opponentsList: ["Magellan"],
    result: "Défaite",
    outcomeType: "defaite",
    sagaOrContext: "Saga Guerre au Sommet",
    isCanon: true
  },
  {
    id: 64,
    opponent: "Minorhinocéros, Minokoala & Minozèbre",
    opponentsList: ["Minorhinoceros", "Minokoala", "Minozebra", "Minorhinocéros", "Minozèbre"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Guerre au Sommet",
    isCanon: true
  },
  {
    id: 65,
    opponent: "Hannyabal",
    opponentsList: ["Hannyabal"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Guerre au Sommet",
    isCanon: true
  },
  {
    id: 66,
    opponent: "Barbe Noire",
    opponentsList: ["Marshall D. Teach", "Teetch", "Blackbeard", "Barbe Noire"],
    result: "Interrompue",
    outcomeType: "interrompu",
    sagaOrContext: "Saga Guerre au Sommet",
    isCanon: true
  },
  {
    id: 67,
    opponent: "Gardes Démons (avec Jinbe)",
    opponentsList: ["Gardes Démons"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Guerre au Sommet",
    isCanon: true
  },
  {
    id: 68,
    opponent: "Magellan (avec Mr. 3 & Prisonniers)",
    opponentsList: ["Magellan"],
    result: "Victoire (car ils sont restés en vie et se sont évadés)",
    outcomeType: "victoire",
    sagaOrContext: "Saga Guerre au Sommet",
    isCanon: true
  },
  {
    id: 69,
    opponent: "Hina",
    opponentsList: ["Hina"],
    result: "Fuite",
    outcomeType: "fuite",
    sagaOrContext: "Saga Guerre au Sommet",
    isCanon: true
  },
  {
    id: 70,
    opponent: "Smoker (Marineford)",
    opponentsList: ["Smoker"],
    result: "Interrompu par Hancock",
    outcomeType: "interrompu",
    sagaOrContext: "Saga Guerre au Sommet",
    isCanon: true
  },
  {
    id: 71,
    opponent: "Mihawk",
    opponentsList: ["Dracule Mihawk", "Mihawk"],
    result: "Fuite (avec Baggy servant de bouclier)",
    outcomeType: "fuite",
    sagaOrContext: "Saga Guerre au Sommet",
    isCanon: true
  },
  {
    id: 72,
    opponent: "Aokiji, Kizaru & Akainu",
    opponentsList: ["Kuzan", "Aokiji", "Borsalino", "Kizaru", "Sakazuki", "Akainu"],
    result: "Fuite",
    outcomeType: "fuite",
    sagaOrContext: "Saga Guerre au Sommet",
    isCanon: true
  },
  {
    id: 73,
    opponent: "Momonga & Dalmatian",
    opponentsList: ["Momonga", "Dalmatian"],
    result: "Interrompu",
    outcomeType: "interrompu",
    sagaOrContext: "Saga Guerre au Sommet",
    isCanon: true
  },
  {
    id: 74,
    opponent: "Kobby (Marineford)",
    opponentsList: ["Koby"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Guerre au Sommet",
    isCanon: true
  },
  {
    id: 75,
    opponent: "Monkey D. Garp",
    opponentsList: ["Monkey D. Garp", "Garp"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Guerre au Sommet",
    isCanon: true
  },
  {
    id: 76,
    opponent: "Sengoku (avec Mr. 3)",
    opponentsList: ["Sengoku"],
    result: "Victoire (car ils ont réussi à libérer Ace)",
    outcomeType: "victoire",
    sagaOrContext: "Saga Guerre au Sommet",
    isCanon: true
  },
  {
    id: 77,
    opponent: "Marines (avec Ace)",
    opponentsList: ["Marine"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Guerre au Sommet",
    isCanon: true
  },
  {
    id: 78,
    opponent: "Kizaru & Aokiji (avec Jinbe)",
    opponentsList: ["Borsalino", "Kizaru", "Kuzan", "Aokiji"],
    result: "Fuite",
    outcomeType: "fuite",
    sagaOrContext: "Saga Guerre au Sommet",
    isCanon: true
  },
  {
    id: 79,
    opponent: "Jinbe (Amazon Lily)",
    opponentsList: ["Jinbe"],
    result: "Interrompu",
    outcomeType: "interrompu",
    sagaOrContext: "Saga Guerre au Sommet",
    isCanon: true
  },
  {
    id: 80,
    opponent: "Marines (avec Jinbe & Rayleigh)",
    opponentsList: ["Marine"],
    result: "Victoire facile (renvoi du message 3D2Y)",
    outcomeType: "victoire",
    sagaOrContext: "Saga Guerre au Sommet",
    isCanon: true
  },

  // === Saga Île des Hommes-Poissons ===
  {
    id: 81,
    opponent: "Demalo Black, Fausse Nami, Faux Usopp & Faux Franky",
    opponentsList: ["Demalo Black"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Île des Hommes-Poissons",
    isCanon: true
  },
  {
    id: 82,
    opponent: "PX-5",
    opponentsList: ["Pacifista"],
    result: "Victoire en un coup",
    outcomeType: "victoire",
    sagaOrContext: "Saga Île des Hommes-Poissons",
    isCanon: true
  },
  {
    id: 83,
    opponent: "Surume (avec Zoro et Sanji)",
    opponentsList: ["Surume", "Kraken"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Île des Hommes-Poissons",
    isCanon: true
  },
  {
    id: 84,
    opponent: "Hammond, Hyouzou & Kasagoba",
    opponentsList: ["Hammond", "Hyouzou", "Kasagoba", "Hyouzou"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Île des Hommes-Poissons",
    isCanon: true
  },
  {
    id: 85,
    opponent: "Vander Decken IX",
    opponentsList: ["Vander Decken IX"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Île des Hommes-Poissons",
    isCanon: true
  },
  {
    id: 86,
    opponent: "Wadatsumi",
    opponentsList: ["Wadatsumi"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Île des Hommes-Poissons",
    isCanon: true
  },
  {
    id: 87,
    opponent: "Jinbe (Forêt Maritime)",
    opponentsList: ["Jinbe"],
    result: "Interrompu",
    outcomeType: "interrompu",
    sagaOrContext: "Saga Île des Hommes-Poissons",
    isCanon: true
  },
  {
    id: 88,
    opponent: "l'Équipage des Nouveaux Hommes-Poissons (avec Alliance)",
    opponentsList: ["Hody Jones", "Hyouzou", "Zeo", "Daruma", "Dosun", "Ikaros Much"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Île des Hommes-Poissons",
    isCanon: true
  },
  {
    id: 89,
    opponent: "Hody Jones",
    opponentsList: ["Hody Jones", "Hodi Jones"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Île des Hommes-Poissons",
    isCanon: true
  },

  // === Saga Dressrosa ===
  {
    id: 90,
    opponent: "Dragon (Punk Hazard)",
    opponentsList: ["Dragon"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Dressrosa / Punk Hazard",
    isCanon: true
  },
  {
    id: 91,
    opponent: "Barbe Brune et Centaures",
    opponentsList: ["Brownbeard", "Chadros Higelyges"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Dressrosa / Punk Hazard",
    isCanon: true
  },
  {
    id: 92,
    opponent: "Yéti Cool Brothers (Rock & Scotch)",
    opponentsList: ["Rock", "Scotch"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Dressrosa / Punk Hazard",
    isCanon: true
  },
  {
    id: 93,
    opponent: "César Clown (1er round - extérieur du labo)",
    opponentsList: ["Caesar Clown", "César Clown"],
    result: "Défaite (asphyxie)",
    outcomeType: "defaite",
    sagaOrContext: "Saga Dressrosa / Punk Hazard",
    isCanon: true
  },
  {
    id: 94,
    opponent: "Run",
    opponentsList: ["Run"],
    result: "Victoire facile",
    outcomeType: "victoire",
    sagaOrContext: "Saga Dressrosa / Punk Hazard",
    isCanon: true
  },
  {
    id: 95,
    opponent: "César Clown (2e round)",
    opponentsList: ["Caesar Clown", "César Clown"],
    result: "Interrompu par Mone (avantage pour Luffy)",
    outcomeType: "interrompu",
    sagaOrContext: "Saga Dressrosa / Punk Hazard",
    isCanon: true
  },
  {
    id: 96,
    opponent: "Mone",
    opponentsList: ["Monet", "Mone"],
    result: "Interrompu (Luffy tombe dans une déchetterie)",
    outcomeType: "interrompu",
    sagaOrContext: "Saga Dressrosa / Punk Hazard",
    isCanon: true
  },
  {
    id: 97,
    opponent: "César Clown (3e round)",
    opponentsList: ["Caesar Clown", "César Clown"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Dressrosa / Punk Hazard",
    isCanon: true
  },
  {
    id: 98,
    opponent: "Spartan",
    opponentsList: ["Spartan"],
    result: "Victoire rapide",
    outcomeType: "victoire",
    sagaOrContext: "Saga Dressrosa",
    isCanon: true
  },
  {
    id: 99,
    opponent: "Don Chinjao (avec Cavendish)",
    opponentsList: ["Chinjao"],
    result: "Interrompu par Sai et Boo",
    outcomeType: "interrompu",
    sagaOrContext: "Saga Dressrosa",
    isCanon: true
  },
  {
    id: 100,
    opponent: "Gladiateurs (avec Fighting Bull)",
    opponentsList: ["Ucy", "Fighting Bull"],
    result: "Victoire plutôt facile",
    outcomeType: "victoire",
    sagaOrContext: "Saga Dressrosa",
    isCanon: true
  },
  {
    id: 101,
    opponent: "Hajrudin",
    opponentsList: ["Hajrudin"],
    result: "Victoire rapide",
    outcomeType: "victoire",
    sagaOrContext: "Saga Dressrosa",
    isCanon: true
  },
  {
    id: 102,
    opponent: "Jean Ango",
    opponentsList: ["Jean Ango"],
    result: "Interrompu par Don Chinjao",
    outcomeType: "interrompu",
    sagaOrContext: "Saga Dressrosa",
    isCanon: true
  },
  {
    id: 103,
    opponent: "Sai",
    opponentsList: ["Sai"],
    result: "Victoire en un coup",
    outcomeType: "victoire",
    sagaOrContext: "Saga Dressrosa",
    isCanon: true
  },
  {
    id: 104,
    opponent: "Don Chinjao",
    opponentsList: ["Chinjao", "Don Chinjao"],
    result: "Victoire (aplatissement du crâne)",
    outcomeType: "victoire",
    sagaOrContext: "Saga Dressrosa",
    isCanon: true
  },
  {
    id: 105,
    opponent: "Cavendish",
    opponentsList: ["Cavendish"],
    result: "Interrompu par Don Chinjao",
    outcomeType: "interrompu",
    sagaOrContext: "Saga Dressrosa",
    isCanon: true
  },
  {
    id: 106,
    opponent: "Rebecca",
    opponentsList: ["Rebecca"],
    result: "Victoire facile",
    outcomeType: "victoire",
    sagaOrContext: "Saga Dressrosa",
    isCanon: true
  },
  {
    id: 107,
    opponent: "Gardes de Doflamingo (avec Zoro)",
    opponentsList: ["Donquixote Doflamingo"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Dressrosa",
    isCanon: true
  },
  {
    id: 108,
    opponent: "Pica (avec Zoro & Viola)",
    opponentsList: ["Pica"],
    result: "Fuite de Luffy et Viola (pour atteindre le palais)",
    outcomeType: "fuite",
    sagaOrContext: "Saga Dressrosa",
    isCanon: true
  },
  {
    id: 109,
    opponent: "Gladius (avec Kyros & Viola)",
    opponentsList: ["Gladius"],
    result: "Interrompu, fuite",
    outcomeType: "interrompu",
    sagaOrContext: "Saga Dressrosa",
    isCanon: true
  },
  {
    id: 110,
    opponent: "Doflamingo et Pica (avec Kyros)",
    opponentsList: ["Donquixote Doflamingo", "Pica"],
    result: "Interrompu (avantage à Doflamingo)",
    outcomeType: "interrompu",
    sagaOrContext: "Saga Dressrosa",
    isCanon: true
  },
  {
    id: 111,
    opponent: "Machvise, Senor Pink et Dellinger (avec Zoro & Law)",
    opponentsList: ["Machvise", "Señor Pink", "Senor Pink", "Dellinger"],
    result: "Interrompu",
    outcomeType: "interrompu",
    sagaOrContext: "Saga Dressrosa",
    isCanon: true
  },
  {
    id: 112,
    opponent: "Pica",
    opponentsList: ["Pica"],
    result: "Interrompu par Zoro (malgré l'attaque Grizzly Magnum de Luffy sur Pica)",
    outcomeType: "interrompu",
    sagaOrContext: "Saga Dressrosa",
    isCanon: true
  },
  {
    id: 113,
    opponent: "Gardes de Doflamingo",
    opponentsList: ["Donquixote Doflamingo"],
    result: "Victoire Facile",
    outcomeType: "victoire",
    sagaOrContext: "Saga Dressrosa",
    isCanon: true
  },
  {
    id: 114,
    opponent: "marionnettes casse-noisettes (avec Cavendish)",
    opponentsList: ["Sugar"],
    result: "Interrompu par Bartolomeo",
    outcomeType: "interrompu",
    sagaOrContext: "Saga Dressrosa",
    isCanon: true
  },
  {
    id: 115,
    opponent: "Doflamingo (Round de combat initial)",
    opponentsList: ["Donquixote Doflamingo"],
    result: "Interrompu (avantage à Doflamingo)",
    outcomeType: "interrompu",
    sagaOrContext: "Saga Dressrosa",
    isCanon: true
  },
  {
    id: 116,
    opponent: "clone de Doflamingo",
    opponentsList: ["Donquixote Doflamingo"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Dressrosa",
    isCanon: true
  },
  {
    id: 117,
    opponent: "Bellamy",
    opponentsList: ["Bellamy"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Dressrosa",
    isCanon: true
  },
  {
    id: 118,
    opponent: "Doflamingo et Trébol (avec Law)",
    opponentsList: ["Donquixote Doflamingo", "Trebol", "Trébol"],
    result: "Interrompu",
    outcomeType: "interrompu",
    sagaOrContext: "Saga Dressrosa",
    isCanon: true
  },
  {
    id: 119,
    opponent: "Trébol",
    opponentsList: ["Trebol", "Trébol"],
    result: "Victoire / Brûlé par lui-même",
    outcomeType: "victoire",
    sagaOrContext: "Saga Dressrosa",
    isCanon: true
  },
  {
    id: 120,
    opponent: "Doflamingo (Dernier Round)",
    opponentsList: ["Donquixote Doflamingo"],
    result: "Victoire éclatante (Gear 4 Bounce-Man / K.O. final)",
    outcomeType: "victoire",
    sagaOrContext: "Saga Dressrosa",
    isCanon: true
  },
  {
    id: 121,
    opponent: "Issho (Fujitora)",
    opponentsList: ["Issho", "Fujitora"],
    result: "Interrompu par Hajrudin",
    outcomeType: "interrompu",
    sagaOrContext: "Saga Dressrosa",
    isCanon: true
  },

  // === Saga Whole Cake Island ===
  {
    id: 122,
    opponent: "Rody",
    opponentsList: ["Roddy"],
    result: "Interrompu (aucun des deux n'a pris l'avantage)",
    outcomeType: "interrompu",
    sagaOrContext: "Saga Whole Cake Island",
    isCanon: true
  },
  {
    id: 123,
    opponent: "Charlotte Brûlée (déguisée en Luffy)",
    opponentsList: ["Brulee", "Charlotte Brulee", "Charlotte Brûlée"],
    result: "Interrompu",
    outcomeType: "interrompu",
    sagaOrContext: "Saga Whole Cake Island",
    isCanon: true
  },
  {
    id: 124,
    opponent: "Homies (Seducing Woods)",
    opponentsList: ["Kingbaum"],
    result: "Victoire écrasante",
    outcomeType: "victoire",
    sagaOrContext: "Saga Whole Cake Island",
    isCanon: true
  },
  {
    id: 125,
    opponent: "Charlotte Cracker (avec Nami)",
    opponentsList: ["Charlotte Cracker", "Cracker"],
    result: "Victoire (après 11h de combat, Gear 4 Tank-Man)",
    outcomeType: "victoire",
    sagaOrContext: "Saga Whole Cake Island",
    isCanon: true
  },
  {
    id: 126,
    opponent: "Vinsmoke Sanji",
    opponentsList: ["Sanji", "Vinsmoke Sanji"],
    result: "Défaite (Luffy s'est laissé faire sans riposter)",
    outcomeType: "defaite",
    sagaOrContext: "Saga Whole Cake Island",
    isCanon: true
  },
  {
    id: 127,
    opponent: "L'armée enragée de Big Mom (épuisé, avec Nami)",
    opponentsList: ["Charlotte Linlin", "Big Mom", "Charlotte Amande", "Charlotte Opera", "Charlotte Mont-d'Or"],
    result: "Défaite",
    outcomeType: "defaite",
    sagaOrContext: "Saga Whole Cake Island",
    isCanon: true
  },
  {
    id: 128,
    opponent: "Soldats Chess",
    opponentsList: ["Chess Solider"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Whole Cake Island",
    isCanon: true
  },
  {
    id: 129,
    opponent: "Charlotte Opera",
    opponentsList: ["Charlotte Opera"],
    result: "Défaite (embastillé)",
    outcomeType: "defaite",
    sagaOrContext: "Saga Whole Cake Island",
    isCanon: true
  },
  {
    id: 130,
    opponent: "Mont d'Or, Counter et Cadenza",
    opponentsList: ["Charlotte Mont-d'Or", "Charlotte Counter", "Charlotte Cadenza"],
    result: "Défaite",
    outcomeType: "defaite",
    sagaOrContext: "Saga Whole Cake Island",
    isCanon: true
  },
  {
    id: 131,
    opponent: "Gardes du Château",
    opponentsList: ["Chess Soldier"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Whole Cake Island",
    isCanon: true
  },
  {
    id: 132,
    opponent: "Soldats Chess",
    opponentsList: ["Chess Soldier"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Whole Cake Island",
    isCanon: true
  },
  {
    id: 133,
    opponent: "Charlotte Katakuri (Début du combat)",
    opponentsList: ["Charlotte Katakuri", "Katakuri"],
    result: "Interrompu",
    outcomeType: "interrompu",
    sagaOrContext: "Saga Whole Cake Island",
    isCanon: true
  },
  {
    id: 134,
    opponent: "Big Mom et Prométhée (avec Jinbe)",
    opponentsList: ["Charlotte Linlin", "Big Mom", "Prometheus", "Prométhée"],
    result: "Interrompu par Brook",
    outcomeType: "interrompu",
    sagaOrContext: "Saga Whole Cake Island",
    isCanon: true
  },
  {
    id: 135,
    opponent: "Big Mom et Zeus (avec Sanji)",
    opponentsList: ["Charlotte Linlin", "Big Mom", "Zeus"],
    result: "Interrompu",
    outcomeType: "interrompu",
    sagaOrContext: "Saga Whole Cake Island",
    isCanon: true
  },
  {
    id: 136,
    opponent: "Prométhée (avec Jinbe)",
    opponentsList: ["Prométhée", "Prometheus"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Whole Cake Island",
    isCanon: true
  },
  {
    id: 137,
    opponent: "Charlotte Katakuri (Thousand Sunny)",
    opponentsList: ["Charlotte Katakuri", "Katakuri"],
    result: "Interrompu (Luffy l'entraîne dans le Monde des Miroirs)",
    outcomeType: "interrompu",
    sagaOrContext: "Saga Whole Cake Island",
    isCanon: true
  },
  {
    id: 138,
    opponent: "Charlotte Katakuri (Monde des Miroirs)",
    opponentsList: ["Charlotte Katakuri", "Katakuri"],
    result: "Victoire (Gear 4 Snakeman, respect mutuel légendaire)",
    outcomeType: "victoire",
    sagaOrContext: "Saga Whole Cake Island",
    isCanon: true
  },

  // === Saga Pays des Wa ===
  {
    id: 139,
    opponent: "Deux pirates de l'équipage aux Cent Bêtes",
    opponentsList: ["Kaido"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Pays des Wa",
    isCanon: true
  },
  {
    id: 140,
    opponent: "Basil Hawkins et ses hommes",
    opponentsList: ["Basil Hawkins"],
    result: "Interrompu",
    outcomeType: "interrompu",
    sagaOrContext: "Saga Pays des Wa",
    isCanon: true
  },
  {
    id: 141,
    opponent: "Urashima",
    opponentsList: ["Urashima"],
    result: "Victoire (propulsion hors de l'arène)",
    outcomeType: "victoire",
    sagaOrContext: "Saga Pays des Wa",
    isCanon: true
  },
  {
    id: 142,
    opponent: "Pirates aux Cent Bêtes",
    opponentsList: ["Kaido"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Pays des Wa",
    isCanon: true
  },
  {
    id: 143,
    opponent: "Holdem et Kamijiro",
    opponentsList: ["Holdem"],
    result: "Victoire (Red Hawk foudroyant)",
    outcomeType: "victoire",
    sagaOrContext: "Saga Pays des Wa",
    isCanon: true
  },
  {
    id: 144,
    opponent: "Kaidou (Round 1 - Kuri)",
    opponentsList: ["Kaido", "Kaidou"],
    result: "Défaite (assommé en un coup par le Kanabo)",
    outcomeType: "defaite",
    sagaOrContext: "Saga Pays des Wa",
    isCanon: true
  },
  {
    id: 145,
    opponent: "Dobon (avec Kid, prisonniers)",
    opponentsList: ["Dobon"],
    result: "Victoire (hors écran)",
    outcomeType: "victoire",
    sagaOrContext: "Saga Pays des Wa",
    isCanon: true
  },
  {
    id: 146,
    opponent: "Daifugo (avec menottes)",
    opponentsList: ["Daifugo"],
    result: "Victoire rapide",
    outcomeType: "victoire",
    sagaOrContext: "Saga Pays des Wa",
    isCanon: true
  },
  {
    id: 147,
    opponent: "Babanuki (première rencontre)",
    opponentsList: ["Babanuki"],
    result: "Défaite écrasante",
    outcomeType: "defaite",
    sagaOrContext: "Saga Pays des Wa",
    isCanon: true
  },
  {
    id: 148,
    opponent: "Madilloman",
    opponentsList: ["Madilloman"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Pays des Wa",
    isCanon: true
  },
  {
    id: 149,
    opponent: "des pirates de l'équipage aux Cent Bêtes",
    opponentsList: ["Kaido"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Pays des Wa",
    isCanon: true
  },
  {
    id: 150,
    opponent: "Daifugo (avec Chopper)",
    opponentsList: ["Daifugo"],
    result: "Victoire éclair",
    outcomeType: "victoire",
    sagaOrContext: "Saga Pays des Wa",
    isCanon: true
  },
  {
    id: 151,
    opponent: "Babanuki (Prison d'Udon)",
    opponentsList: ["Babanuki"],
    result: "Écrasante victoire éclair (virus retourné)",
    outcomeType: "victoire",
    sagaOrContext: "Saga Pays des Wa",
    isCanon: true
  },
  {
    id: 152,
    opponent: "Destruction d'un navire de Kaido (avec Kid & Law)",
    opponentsList: ["Kaido"],
    result: "Destruction du navire de l'Équipage aux Cent Bêtes",
    outcomeType: "victoire",
    sagaOrContext: "Saga Pays des Wa",
    isCanon: true
  },
  {
    id: 153,
    opponent: "Ulti & Page One",
    opponentsList: ["Ulti", "Page One"],
    result: "Interrompu, avantage à l'Alliance",
    outcomeType: "interrompu",
    sagaOrContext: "Saga Pays des Wa",
    isCanon: true
  },
  {
    id: 154,
    opponent: "Number Goki",
    opponentsList: ["Goki"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Pays des Wa",
    isCanon: true
  },
  {
    id: 155,
    opponent: "Kaidou & Big Mom (Toit d'Onigashima, Alliance Supernovas)",
    opponentsList: ["Kaido", "Kaidou", "Charlotte Linlin", "Big Mom"],
    result: "Interrompu",
    outcomeType: "interrompu",
    sagaOrContext: "Saga Pays des Wa",
    isCanon: true
  },
  {
    id: 156,
    opponent: "Kaidou (Round 2)",
    opponentsList: ["Kaido", "Kaidou"],
    result: "Défaite (Luffy chute d'Onigashima dans la mer)",
    outcomeType: "defaite",
    sagaOrContext: "Saga Pays des Wa",
    isCanon: true
  },
  {
    id: 157,
    opponent: "Kaidou (Round 3)",
    opponentsList: ["Kaido", "Kaidou"],
    result: "Défaite (interrompu par le CP0)",
    outcomeType: "defaite",
    sagaOrContext: "Saga Pays des Wa",
    isCanon: true
  },
  {
    id: 158,
    opponent: "Kaidou (Round 4)",
    opponentsList: ["Kaido", "Kaidou"],
    result: "Victoire (Éveil du Hito Hito no Mi, Model: Nika / GEAR 5)",
    outcomeType: "victoire",
    sagaOrContext: "Saga Pays des Wa",
    isCanon: true
  },

  // === Saga Finale ===
  {
    id: 159,
    opponent: "Dragon Holographique",
    opponentsList: ["Vegaforce-01", "Dragon Holographique"],
    result: "Match nul",
    outcomeType: "interrompu",
    sagaOrContext: "Saga Finale / Egghead",
    isCanon: true
  },
  {
    id: 160,
    opponent: "Rob Lucci (Egghead)",
    opponentsList: ["Rob Lucci"],
    result: "Victoire (Gear 5 vs Éveil du Lucci)",
    outcomeType: "victoire",
    sagaOrContext: "Saga Finale / Egghead",
    isCanon: true
  },
  {
    id: 161,
    opponent: "S-Hawk et S-Bear (avec Zoro, Lucci, Kaku)",
    opponentsList: ["S-Hawk", "S-Bear"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Finale / Egghead",
    isCanon: true
  },
  {
    id: 162,
    opponent: "Kizaru",
    opponentsList: ["Borsalino", "Kizaru"],
    result: "Victoire (hors de combat temporairement)",
    outcomeType: "victoire",
    sagaOrContext: "Saga Finale / Egghead",
    isCanon: true
  },
  {
    id: 163,
    opponent: "Kizaru et Saturn",
    opponentsList: ["Borsalino", "Kizaru", "Jaygarcia Saturn", "Saturn"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Finale / Egghead",
    isCanon: true
  },
  {
    id: 164,
    opponent: "Saturn, Warcury et Ju Peter (avec Dorry & Brogy)",
    opponentsList: ["Jaygarcia Saturn", "Saturn", "Topman Warcury", "Warcury", "Shepherd Ju Peter", "Ju Peter"],
    result: "Fuite stratégique",
    outcomeType: "fuite",
    sagaOrContext: "Saga Finale / Egghead",
    isCanon: true
  },
  {
    id: 165,
    opponent: "Saturn (avec Bonney)",
    opponentsList: ["Jaygarcia Saturn", "Saturn", "Jewelry Bonney"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Saga Finale / Egghead",
    isCanon: true
  },

  // === Batailles Hors-Série et Films ===
  {
    id: 166,
    opponent: "Tigre géant (avec Ace & Sabo)",
    opponentsList: ["Tigre géant"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 167,
    opponent: "les hommes de Bluejam dont Porchemy (avec Ace & Sabo)",
    opponentsList: ["Porchemy", "Bluejam"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 168,
    opponent: "Ganzack (Premier Round)",
    opponentsList: ["Ganzack"],
    result: "Fuite de Ganzack",
    outcomeType: "fuite",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 169,
    opponent: "Ganzack (Second Round)",
    opponentsList: ["Ganzack"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 170,
    opponent: "El Drago",
    opponentsList: ["El Drago"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 171,
    opponent: "Bear King",
    opponentsList: ["Bear King"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 172,
    opponent: "Eric the Whirlwind",
    opponentsList: ["Eric", "Erik"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 173,
    opponent: "un Dragon Millénaire",
    opponentsList: ["Ryuryu"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 174,
    opponent: "les Billions (avec Ace)",
    opponentsList: ["Billion"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 175,
    opponent: "Wetton",
    opponentsList: ["Wetton"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 176,
    opponent: "Butler",
    opponentsList: ["Butler"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 177,
    opponent: "L'Équipage de Gasparde",
    opponentsList: ["Gasparde"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 178,
    opponent: "Gasparde",
    opponentsList: ["Gasparde"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 179,
    opponent: "Saga (avec Zoro)",
    opponentsList: ["Saga"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 180,
    opponent: "Omatsuri",
    opponentsList: ["Omatsuri", "Baron Omatsuri"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 181,
    opponent: "Ratchet",
    opponentsList: ["Ratchet"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 182,
    opponent: "Bayan (avec l'Équipage)",
    opponentsList: ["Bayan"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 183,
    opponent: "Governor (avec l'Équipage)",
    opponentsList: ["Governor"],
    result: "Défaite (aidés par les hommes de Governor)",
    outcomeType: "defaite",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 184,
    opponent: "Octo et Gedatsu",
    opponentsList: ["Hatchan", "Octo", "Gedatsu"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 185,
    opponent: "L'Équipage des Fanged Toad",
    opponentsList: ["Fanged Toad"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 186,
    opponent: "L'Équipage de Foxy et Porche",
    opponentsList: ["Foxy", "Porche"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 187,
    opponent: "Brindo, Campacino, Arbell et Salchow",
    opponentsList: ["Brindo", "Campacino", "Arbell", "Salchow"],
    result: "Défaite",
    outcomeType: "defaite",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 188,
    opponent: "Don Accino",
    opponentsList: ["Don Accino"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 189,
    opponent: "Musshuru",
    opponentsList: ["Musshuru"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 190,
    opponent: "Octo, Gedatsu et Baggy (avec Sanji)",
    opponentsList: ["Hatchan", "Octo", "Gedatsu", "Buggy"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 191,
    opponent: "Foxy et Baggy (avec Zoro, Usopp & Sanji)",
    opponentsList: ["Foxy", "Buggy"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 192,
    opponent: "L'Équipage des Pirates Amigo (avec Zoro & Sanji)",
    opponentsList: ["Largo"],
    result: "Défaite",
    outcomeType: "defaite",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 193,
    opponent: "Largo",
    opponentsList: ["Largo"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 194,
    opponent: "Boss",
    opponentsList: ["Boss"],
    result: "Match nul",
    outcomeType: "interrompu",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 195,
    opponent: "Fullbody et Jango",
    opponentsList: ["Fullbody", "Jango"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 196,
    opponent: "Kibin",
    opponentsList: ["Kibin"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 197,
    opponent: "Shiki (avec Zoro, Usopp, Sanji & Chopper)",
    opponentsList: ["Shiki"],
    result: "Défaite",
    outcomeType: "defaite",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 198,
    opponent: "l’Équipage du Lion d'Or",
    opponentsList: ["Shiki"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 199,
    opponent: "Shiki (avec Billy)",
    opponentsList: ["Shiki"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 200,
    opponent: "Shiki",
    opponentsList: ["Shiki"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 201,
    opponent: "Byrnndi World (premier affrontement)",
    opponentsList: ["Byrnndi World"],
    result: "Défaite écrasante",
    outcomeType: "defaite",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 202,
    opponent: "Sebastian (avec Hancock)",
    opponentsList: ["Sebastian"],
    result: "Interrompue par Perona (fort avantage à l'Alliance)",
    outcomeType: "interrompu",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 203,
    opponent: "Byrnndi World (Deuxième Round)",
    opponentsList: ["Byrnndi World"],
    result: "Défaite",
    outcomeType: "defaite",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 204,
    opponent: "Gairam",
    opponentsList: ["Gairam"],
    result: "Interrompu par Baggy puis Hancock",
    outcomeType: "interrompu",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 205,
    opponent: "Byrnndi World (Dernier Round)",
    opponentsList: ["Byrnndi World"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 206,
    opponent: "Momonga (affrontement direct)",
    opponentsList: ["Momonga"],
    result: "Interrompu",
    outcomeType: "interrompu",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 207,
    opponent: "Shuzo / Momonga (Mêlée à trois)",
    opponentsList: ["Momonga", "Shuzo"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 208,
    opponent: "Zephyr (combats cumulés)",
    opponentsList: ["Zephyr", "Z"],
    result: "2 Défaites puis 1 Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 209,
    opponent: "Kung-Fu Dugong d'Alabasta",
    opponentsList: ["Kung-Fu Dugong"],
    result: "Victoire écrasante (après ellipse)",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 210,
    opponent: "Poulpe Boxer",
    opponentsList: ["Poulpe Boxer"],
    result: "Victoire écrasante de Luffy",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 211,
    opponent: "Breed (Luffy & Law sous contrôle)",
    opponentsList: ["Breed"],
    result: "Défaite (immobilisés par Breed)",
    outcomeType: "defaite",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 212,
    opponent: "Breed (avec Kung-Fu Dugong)",
    opponentsList: ["Breed"],
    result: "Victoire en un coup",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 213,
    opponent: "Fighting Bull",
    opponentsList: ["Ucy", "Fighting Bull"],
    result: "Victoire (sans le toucher)",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 214,
    opponent: "Ideo",
    opponentsList: ["Ideo"],
    result: "Interrompu",
    outcomeType: "interrompu",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 215,
    opponent: "Fujitora (avec Zoro)",
    opponentsList: ["Fujitora", "Issho"],
    result: "Interrompu par l'arrivée de Pica",
    outcomeType: "interrompu",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 216,
    opponent: "Abellon (avec Bartolomeo)",
    opponentsList: ["Abellon"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 217,
    opponent: "Bill",
    opponentsList: ["Bill"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 218,
    opponent: "L'Équipage de Mad Treasure (avec Équipage)",
    opponentsList: ["Mad Treasure"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 219,
    opponent: "Mad Treasure",
    opponentsList: ["Mad Treasure"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 220,
    opponent: "Long Long",
    opponentsList: ["Long Long"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 221,
    opponent: "Gild Tesoro (1er Round)",
    opponentsList: ["Gild Tesoro"],
    result: "Défaite",
    outcomeType: "defaite",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 222,
    opponent: "Spandam (avec Rikka)",
    opponentsList: ["Spandam"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 223,
    opponent: "Gild Tesoro (Dernier Round)",
    opponentsList: ["Gild Tesoro"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 224,
    opponent: "Grant (premier combat)",
    opponentsList: ["All-Hunt Grount", "Grant"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 225,
    opponent: "Bonam",
    opponentsList: ["Bonham", "Bonam"],
    result: "Fuite de Luffy",
    outcomeType: "fuite",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 226,
    opponent: "Zappa",
    opponentsList: ["Zappa"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 227,
    opponent: "Prody",
    opponentsList: ["Prody"],
    result: "Victoire rapide",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 228,
    opponent: "Bonam & Zappa (Cumul)",
    opponentsList: ["Bonham", "Bonam", "Zappa"],
    result: "Victoire rapide",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 229,
    opponent: "Grant (combat final)",
    opponentsList: ["All-Hunt Grount", "Grant"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 230,
    opponent: "2 Rois des Mers Centipèdes",
    opponentsList: ["Roi des Mers"],
    result: "Victoire facile",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 231,
    opponent: "Charlotte Cabalette",
    opponentsList: ["Charlotte Cabalette"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 232,
    opponent: "Charlotte Counter",
    opponentsList: ["Charlotte Counter"],
    result: "Victoire difficile",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 233,
    opponent: "Charlotte Laurin & Charlotte Compo",
    opponentsList: ["Charlotte Laurin", "Charlotte Compo"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 234,
    opponent: "Charlotte Effilée",
    opponentsList: ["Charlotte Effilée", "Charlotte Effilee"],
    result: "Fuite de Luffy",
    outcomeType: "fuite",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 235,
    opponent: "Charlotte Mondée",
    opponentsList: ["Charlotte Mondée", "Charlotte Mondee"],
    result: "Interrompu",
    outcomeType: "interrompu",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 236,
    opponent: "Ginger (avec Hancock)",
    opponentsList: ["Ginger"],
    result: "Interrompu",
    outcomeType: "interrompu",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 237,
    opponent: "Cidre",
    opponentsList: ["Cidre"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 238,
    opponent: "Douglas Bullet (Mêlée Supernovas)",
    opponentsList: ["Douglas Bullet"],
    result: "Défaite écrasante (Gear 4 inutile)",
    outcomeType: "defaite",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 239,
    opponent: "Douglas Bullet (Mêlée Multilatérale)",
    opponentsList: ["Douglas Bullet"],
    result: "Affaiblissement de Bullet par l'Alliance",
    outcomeType: "interrompu",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 240,
    opponent: "Douglas Bullet (Combat Final)",
    opponentsList: ["Douglas Bullet"],
    result: "Victoire (Gear 4 King Cobra déchaîné)",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 241,
    opponent: "Batman & Gazelleman",
    opponentsList: ["Batman", "Gazelleman"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  },
  {
    id: 242,
    opponent: "Bearman",
    opponentsList: ["Bearman"],
    result: "Victoire",
    outcomeType: "victoire",
    sagaOrContext: "Films / Hors-Série",
    isCanon: false
  }
];

// Returns a Set of normalized name strings that represent unique opponents
export const getLuffyOpponentsSet = (): Set<string> => {
  const s = new Set<string>();
  LUFFY_BATTLES.forEach((b) => {
    b.opponentsList.forEach((opp) => {
      const normalized = opp
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");
      s.add(normalized);
    });
  });
  return s;
};

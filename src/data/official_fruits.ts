export interface OfficialFruit {
  name: string;
  fruitType: "Paramecia" | "Zoan" | "Logia";
  zoanSubtype?: "Zoan Classique" | "Zoan Antique" | "Zoan Mythique" | "SMILE (Gifter)";
}

// Official lists provided by the user.
export const OFFICIAL_FRUITS_LIST: OfficialFruit[] = [
  // --- PARAMECIA ---
  { "name": "Absalom", "fruitType": "Paramecia" },
  { "name": "Alvida", "fruitType": "Paramecia" },
  { "name": "Artur Bacca", "fruitType": "Paramecia" },
  { "name": "Avalo Pizarro", "fruitType": "Paramecia" },
  { "name": "Baby 5", "fruitType": "Paramecia" },
  { "name": "Baggy", "fruitType": "Paramecia" },
  { "name": "Bartholomew Kuma", "fruitType": "Paramecia" },
  { "name": "Bartolomeo", "fruitType": "Paramecia" },
  { "name": "Basil Hawkins", "fruitType": "Paramecia" },
  { "name": "Bellamy", "fruitType": "Paramecia" },
  { "name": "Belo Betty", "fruitType": "Paramecia" },
  { "name": "Bentham", "fruitType": "Paramecia" },
  { "name": "Biblo", "fruitType": "Paramecia" },
  { "name": "Blamenco", "fruitType": "Paramecia" },
  { "name": "Bluegrass", "fruitType": "Paramecia" },
  { "name": "Blueno", "fruitType": "Paramecia" },
  { "name": "Boa Hancock", "fruitType": "Paramecia" },
  { "name": "Bobby Funk", "fruitType": "Paramecia" },
  { "name": "Brook", "fruitType": "Paramecia" },
  { "name": "Buffalo", "fruitType": "Paramecia" },
  { "name": "Capone Bege", "fruitType": "Paramecia" },
  { "name": "Caramel", "fruitType": "Paramecia" },
  { "name": "Charlotte Brûlée", "fruitType": "Paramecia" },
  { "name": "Charlotte Cracker", "fruitType": "Paramecia" },
  { "name": "Charlotte Daifuku", "fruitType": "Paramecia" },
  { "name": "Charlotte Décuplés", "fruitType": "Paramecia" },
  { "name": "Charlotte Galette", "fruitType": "Paramecia" },
  { "name": "Charlotte Katakuri", "fruitType": "Paramecia" },
  { "name": "Charlotte Linlin", "fruitType": "Paramecia" },
  { "name": "Charlotte Mont d'Or", "fruitType": "Paramecia" },
  { "name": "Charlotte Opéra", "fruitType": "Paramecia" },
  { "name": "Charlotte Oven", "fruitType": "Paramecia" },
  { "name": "Charlotte Perospero", "fruitType": "Paramecia" },
  { "name": "Charlotte Pudding", "fruitType": "Paramecia" },
  { "name": "Charlotte Smoothie", "fruitType": "Paramecia" },
  { "name": "Daz Bonez", "fruitType": "Paramecia" },
  { "name": "Diamante", "fruitType": "Paramecia" },
  { "name": "Doc Q", "fruitType": "Paramecia" },
  { "name": "Don Quichotte Doflamingo", "fruitType": "Paramecia" },
  { "name": "Don Quichotte Rossinante", "fruitType": "Paramecia" },
  { "name": "Edward Newgate", "fruitType": "Paramecia" },
  { "name": "Emporio Ivankov", "fruitType": "Paramecia" },
  { "name": "Eustass Kid", "fruitType": "Paramecia" },
  { "name": "Foxy", "fruitType": "Paramecia" },
  { "name": "Galdino", "fruitType": "Paramecia" },
  { "name": "Ganzui", "fruitType": "Paramecia" },
  { "name": "Gecko Moria", "fruitType": "Paramecia" },
  { "name": "Gem", "fruitType": "Paramecia" },
  { "name": "Gill Bastar", "fruitType": "Paramecia" },
  { "name": "Gladius", "fruitType": "Paramecia" },
  { "name": "Herz", "fruitType": "Paramecia" },
  { "name": "Hina", "fruitType": "Paramecia" },
  { "name": "Inazuma", "fruitType": "Paramecia" },
  { "name": "Issho", "fruitType": "Paramecia" },
  { "name": "Jesus Burgess", "fruitType": "Paramecia" },
  { "name": "Jewelry Bonney", "fruitType": "Paramecia" },
  { "name": "John", "fruitType": "Paramecia" },
  { "name": "Jora", "fruitType": "Paramecia" },
  { "name": "Joy Boy", "fruitType": "Paramecia" },
  { "name": "Joz", "fruitType": "Paramecia" },
  { "name": "Kalifa", "fruitType": "Paramecia" },
  { "name": "Kelly Funk", "fruitType": "Paramecia" },
  { "name": "Kinemon", "fruitType": "Paramecia" },
  { "name": "Kozuki Toki", "fruitType": "Paramecia" },
  { "name": "Kujaku", "fruitType": "Paramecia" },
  { "name": "Kurozumi Higurashi", "fruitType": "Paramecia" },
  { "name": "Kurozumi Kanjuro", "fruitType": "Paramecia" },
  { "name": "Kurozumi Semimaru", "fruitType": "Paramecia" },
  { "name": "Kurozumi Tama", "fruitType": "Paramecia" },
  { "name": "Léo", "fruitType": "Paramecia" },
  { "name": "Machvise", "fruitType": "Paramecia" },
  { "name": "Magellan", "fruitType": "Paramecia" },
  { "name": "Mansherry", "fruitType": "Paramecia" },
  { "name": "Marshall D. Teach", "fruitType": "Paramecia" },
  { "name": "Mikita", "fruitType": "Paramecia" },
  { "name": "Morley", "fruitType": "Paramecia" },
  { "name": "Nico Robin", "fruitType": "Paramecia" },
  { "name": "Perona", "fruitType": "Paramecia" },
  { "name": "Pica", "fruitType": "Paramecia" },
  { "name": "Riku Viola", "fruitType": "Paramecia" },
  { "name": "S-Hawk", "fruitType": "Paramecia" },
  { "name": "Sainte Manmeyer Gunko", "fruitType": "Paramecia" },
  { "name": "Sanjuan Wolf", "fruitType": "Paramecia" },
  { "name": "Scratchmen Apoo", "fruitType": "Paramecia" },
  { "name": "Señor Pink", "fruitType": "Paramecia" },
  { "name": "Sharinguru", "fruitType": "Paramecia" },
  { "name": "Shiki", "fruitType": "Paramecia" },
  { "name": "Shinobu", "fruitType": "Paramecia" },
  { "name": "Shiryu", "fruitType": "Paramecia" },
  { "name": "Shû", "fruitType": "Paramecia" },
  { "name": "Streusen", "fruitType": "Paramecia" },
  { "name": "Sugar", "fruitType": "Paramecia" },
  { "name": "Trafalgar D. Water Law", "fruitType": "Paramecia" },
  { "name": "Trébol", "fruitType": "Paramecia" },
  { "name": "Tsuru", "fruitType": "Paramecia" },
  { "name": "Urban", "fruitType": "Paramecia" },
  { "name": "Urouge", "fruitType": "Paramecia" },
  { "name": "Van Augur", "fruitType": "Paramecia" },
  { "name": "Vander Decken IX", "fruitType": "Paramecia" },
  { "name": "Vasco Shot", "fruitType": "Paramecia" },
  { "name": "Vegapunk", "fruitType": "Paramecia" },
  { "name": "Ven Vendler", "fruitType": "Paramecia" },
  { "name": "Very Good", "fruitType": "Paramecia" },
  { "name": "Wapol", "fruitType": "Paramecia" },
  { "name": "Zala", "fruitType": "Paramecia" },

  // --- ZOAN ---
  { "name": "Boa Marigold", "fruitType": "Zoan", "zoanSubtype": "Zoan Classique" },
  { "name": "Boa Sandersonia", "fruitType": "Zoan", "zoanSubtype": "Zoan Classique" },
  { "name": "Chaka", "fruitType": "Zoan", "zoanSubtype": "Zoan Classique" },
  { "name": "Dalmatien", "fruitType": "Zoan", "zoanSubtype": "Zoan Classique" },
  { "name": "Dalton", "fruitType": "Zoan", "zoanSubtype": "Zoan Classique" },
  { "name": "Drophy", "fruitType": "Zoan", "zoanSubtype": "Zoan Classique" },
  { "name": "Epoida", "fruitType": "Zoan", "zoanSubtype": "Zoan Classique" },
  { "name": "Hound", "fruitType": "Zoan", "zoanSubtype": "Zoan Classique" },
  { "name": "Jabra", "fruitType": "Zoan", "zoanSubtype": "Zoan Classique" },
  { "name": "Kaku", "fruitType": "Zoan", "zoanSubtype": "Zoan Classique" },
  { "name": "Minochihuahua", "fruitType": "Zoan", "zoanSubtype": "Zoan Classique" },
  { "name": "Minokoala", "fruitType": "Zoan", "zoanSubtype": "Zoan Classique" },
  { "name": "Minorhinocéros", "fruitType": "Zoan", "zoanSubtype": "Zoan Classique" },
  { "name": "Minotaure", "fruitType": "Zoan", "zoanSubtype": "Zoan Classique" },
  { "name": "Minozèbre", "fruitType": "Zoan", "zoanSubtype": "Zoan Classique" },
  { "name": "Morgans", "fruitType": "Zoan", "zoanSubtype": "Zoan Classique" },
  { "name": "Onigumo", "fruitType": "Zoan", "zoanSubtype": "Zoan Classique" },
  { "name": "Pekoms", "fruitType": "Zoan", "zoanSubtype": "Zoan Classique" },
  { "name": "Pell", "fruitType": "Zoan", "zoanSubtype": "Zoan Classique" },
  { "name": "Pierre", "fruitType": "Zoan", "zoanSubtype": "Zoan Classique" },
  { "name": "Pomsky", "fruitType": "Zoan", "zoanSubtype": "Zoan Classique" },
  { "name": "Ragnir", "fruitType": "Zoan", "zoanSubtype": "Zoan Classique" },
  { "name": "Rob Lucci", "fruitType": "Zoan", "zoanSubtype": "Zoan Classique" },
  { "name": "Tamago", "fruitType": "Zoan", "zoanSubtype": "Zoan Classique" },
  { "name": "Tony Tony Chopper", "fruitType": "Zoan", "zoanSubtype": "Zoan Classique" },
  { "name": "Alber", "fruitType": "Zoan", "zoanSubtype": "Zoan Antique" },
  { "name": "Black Maria", "fruitType": "Zoan", "zoanSubtype": "Zoan Antique" },
  { "name": "Jack", "fruitType": "Zoan", "zoanSubtype": "Zoan Antique" },
  { "name": "Page One", "fruitType": "Zoan", "zoanSubtype": "Zoan Antique" },
  { "name": "Sasaki", "fruitType": "Zoan", "zoanSubtype": "Zoan Antique" },
  { "name": "Scien", "fruitType": "Zoan", "zoanSubtype": "Zoan Antique" },
  { "name": "Ulti", "fruitType": "Zoan", "zoanSubtype": "Zoan Antique" },
  { "name": "Who's-Who", "fruitType": "Zoan", "zoanSubtype": "Zoan Antique" },
  { "name": "X Drake", "fruitType": "Zoan", "zoanSubtype": "Zoan Antique" },
  { "name": "Catarina Devon", "fruitType": "Zoan", "zoanSubtype": "Zoan Mythique" },
  { "name": "Cerbère (épée)", "fruitType": "Zoan", "zoanSubtype": "Zoan Mythique" },
  { "name": "Dieu Guerrier", "fruitType": "Zoan", "zoanSubtype": "Zoan Mythique" },
  { "name": "Joy Boy", "fruitType": "Zoan", "zoanSubtype": "Zoan Mythique" },
  { "name": "Kaidou", "fruitType": "Zoan", "zoanSubtype": "Zoan Mythique" },
  { "name": "Kozuki Momonosuke", "fruitType": "Zoan", "zoanSubtype": "Zoan Mythique" },
  { "name": "Kurozumi Orochi", "fruitType": "Zoan", "zoanSubtype": "Zoan Mythique" },
  { "name": "Loki", "fruitType": "Zoan", "zoanSubtype": "Zoan Mythique" },
  { "name": "Marco", "fruitType": "Zoan", "zoanSubtype": "Zoan Mythique" },
  { "name": "Monkey D. Luffy", "fruitType": "Zoan", "zoanSubtype": "Zoan Mythique" },
  { "name": "Onimaru", "fruitType": "Zoan", "zoanSubtype": "Zoan Mythique" },
  { "name": "Saint Ethanbaron V. Nusjuro", "fruitType": "Zoan", "zoanSubtype": "Zoan Mythique" },
  { "name": "Saint Jaygarcia Saturn", "fruitType": "Zoan", "zoanSubtype": "Zoan Mythique" },
  { "name": "Saint Limoshiv Killingham", "fruitType": "Zoan", "zoanSubtype": "Zoan Mythique" },
  { "name": "Saint Marcus Mars", "fruitType": "Zoan", "zoanSubtype": "Zoan Mythique" },
  { "name": "Saint Shepherd Ju Peter", "fruitType": "Zoan", "zoanSubtype": "Zoan Mythique" },
  { "name": "Saint Topman Warcury", "fruitType": "Zoan", "zoanSubtype": "Zoan Mythique" },
  { "name": "Sengoku", "fruitType": "Zoan", "zoanSubtype": "Zoan Mythique" },
  { "name": "Stronger", "fruitType": "Zoan", "zoanSubtype": "Zoan Mythique" },
  { "name": "Yamato", "fruitType": "Zoan", "zoanSubtype": "Zoan Mythique" },
  { "name": "Ageha Woman", "fruitType": "Zoan", "zoanSubtype": "SMILE (Gifter)" },
  { "name": "Alpagaman", "fruitType": "Zoan", "zoanSubtype": "SMILE (Gifter)" },
  { "name": "Batman", "fruitType": "Zoan", "zoanSubtype": "SMILE (Gifter)" },
  { "name": "Battaman", "fruitType": "Zoan", "zoanSubtype": "SMILE (Gifter)" },
  { "name": "Bearman", "fruitType": "Zoan", "zoanSubtype": "SMILE (Gifter)" },
  { "name": "Beegirl", "fruitType": "Zoan", "zoanSubtype": "SMILE (Gifter)" },
  { "name": "Beetleman", "fruitType": "Zoan", "zoanSubtype": "SMILE (Gifter)" },
  { "name": "Bishonure-Onna", "fruitType": "Zoan", "zoanSubtype": "SMILE (Gifter)" },
  { "name": "Caimanlady", "fruitType": "Zoan", "zoanSubtype": "SMILE (Gifter)" },
  { "name": "Caucasusman", "fruitType": "Zoan", "zoanSubtype": "SMILE (Gifter)" },
  { "name": "Chochinman", "fruitType": "Zoan", "zoanSubtype": "SMILE (Gifter)" },
  { "name": "Dachoman", "fruitType": "Zoan", "zoanSubtype": "SMILE (Gifter)" },
  { "name": "Gazelleman", "fruitType": "Zoan", "zoanSubtype": "SMILE (Gifter)" },
  { "name": "Hawkman", "fruitType": "Zoan", "zoanSubtype": "SMILE (Gifter)" },
  { "name": "Horseman", "fruitType": "Zoan", "zoanSubtype": "SMILE (Gifter)" },
  { "name": "Jumper", "fruitType": "Zoan", "zoanSubtype": "SMILE (Gifter)" },
  { "name": "Kamakirigirl", "fruitType": "Zoan", "zoanSubtype": "SMILE (Gifter)" },
  { "name": "Koshi Falcon", "fruitType": "Zoan", "zoanSubtype": "SMILE (Gifter)" },
  { "name": "Madilloman", "fruitType": "Zoan", "zoanSubtype": "SMILE (Gifter)" },
  { "name": "Mouseman", "fruitType": "Zoan", "zoanSubtype": "SMILE (Gifter)" },
  { "name": "Nightcrab Girl", "fruitType": "Zoan", "zoanSubtype": "SMILE (Gifter)" },
  { "name": "Nure-Onna", "fruitType": "Zoan", "zoanSubtype": "SMILE (Gifter)" },
  { "name": "Rabbitman", "fruitType": "Zoan", "zoanSubtype": "SMILE (Gifter)" },
  { "name": "Redwolf", "fruitType": "Zoan", "zoanSubtype": "SMILE (Gifter)" },
  { "name": "Saitank", "fruitType": "Zoan", "zoanSubtype": "SMILE (Gifter)" },
  { "name": "Sarahebi", "fruitType": "Zoan", "zoanSubtype": "SMILE (Gifter)" },
  { "name": "Scorpionlady", "fruitType": "Zoan", "zoanSubtype": "SMILE (Gifter)" },
  { "name": "Snakeman (Gifter)", "fruitType": "Zoan", "zoanSubtype": "SMILE (Gifter)" },
  { "name": "Tenjo-Sagari", "fruitType": "Zoan", "zoanSubtype": "SMILE (Gifter)" },
  { "name": "Trio the Grip", "fruitType": "Zoan", "zoanSubtype": "SMILE (Gifter)" },
  { "name": "Wanyudo", "fruitType": "Zoan", "zoanSubtype": "SMILE (Gifter)" },
  { "name": "Yamanba", "fruitType": "Zoan", "zoanSubtype": "SMILE (Gifter)" },

  // --- LOGIA ---
  { "name": "Aramaki", "fruitType": "Logia" },
  { "name": "Borsalino", "fruitType": "Logia" },
  { "name": "Caribou", "fruitType": "Logia" },
  { "name": "Crocodile", "fruitType": "Logia" },
  { "name": "César Clown", "fruitType": "Logia" },
  { "name": "Ener", "fruitType": "Logia" },
  { "name": "Karasu", "fruitType": "Logia" },
  { "name": "Kuzan", "fruitType": "Logia" },
  { "name": "Marshall D. Teach", "fruitType": "Logia" },
  { "name": "Monet", "fruitType": "Logia" },
  { "name": "Portgas D. Ace", "fruitType": "Logia" },
  { "name": "Sabo", "fruitType": "Logia" },
  { "name": "Sakazuki", "fruitType": "Logia" },
  { "name": "Smoker", "fruitType": "Logia" }
];

export function normalizeFruitName(nameStr: string): string {
  let normalized = nameStr
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

  // Handlers for specific aliases to match user list names to db names
  if (normalized === "baggy" || normalized === "bogy" || normalized === "buggyclown" || normalized === "baggyleclown") {
    return "buggy";
  }
  if (normalized.includes("donquichotte") || normalized.includes("donquixote")) {
    normalized = normalized.replace("donquichotte", "donquixote");
  }
  if (normalized.includes("rossinante") || normalized.includes("rosinante")) {
    normalized = normalized.replace("rossinante", "rosinante");
  }
  if (normalized === "jora" || normalized === "giolla") {
    return "giolla";
  }
  if (normalized.includes("dalmatien") || normalized.includes("dalmatian")) {
    return "dalmatien";
  }
  if (normalized.includes("drophy") || normalized.includes("missmerrychristmas")) {
    return "drophy"; // Drophy is Miss Merry Christmas
  }
  if (normalized.includes("alber") || normalized.includes("king")) {
    return "king"; // Alber is King
  }
  if (normalized.includes("scien") || normalized.includes("queen")) {
    return "queen"; // Scien is Queen
  }
  if (normalized.includes("bobbypunk") || normalized.includes("bobbyfunk")) {
    return "bobbyfunk";
  }
  if (normalized.includes("kellypunk") || normalized.includes("kellyfunk")) {
    return "kellyfunk";
  }
  if (normalized.includes("cesarclown") || normalized.includes("caesarclown") || normalized === "cesar" || normalized === "caesar") {
    return "caesarclown";
  }
  if (normalized === "ener" || normalized === "eneru" || normalized === "enel") {
    return "enel";
  }
  return normalized;
}

/**
 * Returns the official Devil Fruit type for a given character name if it exists in the official list.
 */
export function getOfficialDevilFruitOverride(dbName: string): "Logia" | "Paramecia" | "Zoan" | "Zoan Mythique" | "Aucun" | null {
  const normDb = normalizeFruitName(dbName);

  // Split of brackets contents, e.g., "Edward Newgate [Whitebeard]" -> "Edward Newgate"
  const simplifiedDb = dbName.split(/[([]/)[0].trim();
  const normSimplified = normalizeFruitName(simplifiedDb);

  for (const item of OFFICIAL_FRUITS_LIST) {
    const normOfficial = normalizeFruitName(item.name);
    if (normOfficial === normDb || normOfficial === normSimplified) {
      if (item.fruitType === "Zoan") {
        return item.zoanSubtype === "Zoan Mythique" ? "Zoan Mythique" : "Zoan";
      }
      return item.fruitType as "Logia" | "Paramecia" | "Zoan" | "Zoan Mythique";
    }
    // Substring contains check for safety (e.g., "Edward Newgate" in "Edward Newgate [Whitebeard]")
    if (normDb.includes(normOfficial) && normOfficial.length >= 4) {
      if (item.fruitType === "Zoan") {
        return item.zoanSubtype === "Zoan Mythique" ? "Zoan Mythique" : "Zoan";
      }
      return item.fruitType as "Logia" | "Paramecia" | "Zoan" | "Zoan Mythique";
    }
    if (normOfficial.includes(normSimplified) && normSimplified.length >= 4) {
      if (item.fruitType === "Zoan") {
        return item.zoanSubtype === "Zoan Mythique" ? "Zoan Mythique" : "Zoan";
      }
      return item.fruitType as "Logia" | "Paramecia" | "Zoan" | "Zoan Mythique";
    }
  }
  return null;
}

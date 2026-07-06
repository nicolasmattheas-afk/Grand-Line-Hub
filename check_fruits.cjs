const fs = require('fs');

function normalizeFruitName(nameStr) {
  return nameStr
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

const characters = [
  "Akainu [Sakazuki]",
  "Jaygarcia Saturn",
  "Big Mom [Charlotte Linlin]",
  "Vander Decken",
  "Kizaru [Borsalino]",
  "Morgan",
  "Morgans"
];

const officialFruits = [
  "Sakazuki",
  "Saint Jaygarcia Saturn",
  "Charlotte Linlin",
  "Vander Decken IX",
  "Borsalino",
  "Morgans"
];

for (const dbName of characters) {
  const normDb = normalizeFruitName(dbName);
  const simplifiedDb = dbName.split(/[([]/)[0].trim();
  const normSimplified = normalizeFruitName(simplifiedDb);
  const bracketMatch = dbName.match(/\[(.*?)\]/);
  const aliasDb = bracketMatch ? normalizeFruitName(bracketMatch[1]) : "";

  let matched = null;

  for (const offName of officialFruits) {
    const normOfficial = normalizeFruitName(offName);
    
    // Custom matching logic
    const isMatch = 
      normOfficial === normDb || 
      normOfficial === normSimplified || 
      (aliasDb && normOfficial === aliasDb) ||
      normOfficial === "saint" + normSimplified ||
      normSimplified === "saint" + normOfficial ||
      normOfficial === normSimplified + "ix" ||
      normSimplified === normOfficial + "ix";

    if (isMatch) {
      matched = offName;
      break;
    }
  }

  console.log(`${dbName} -> ${matched}`);
}

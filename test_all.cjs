const fs = require('fs');

function normalizeFruitName(nameStr) {
  return nameStr
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

const content = fs.readFileSync('src/data/characters.ts', 'utf8');
const charRegex = /"name"\s*:\s*"([^"]+)"/g;
let match;
let charsWithFruits = [];
while ((match = charRegex.exec(content)) !== null) {
  charsWithFruits.push(match[1]);
}

const fruitsStr = fs.readFileSync('src/data/official_fruits.ts', 'utf8');
const fruitsMatch = fruitsStr.match(/export const OFFICIAL_FRUITS_LIST[^=]*=\s*(\[[^\]]*\])/s);
let officialNames = [];
if (fruitsMatch) {
  const lines = fruitsMatch[1].split('\n');
  for (const line of lines) {
    const m = line.match(/"name"\s*:\s*"([^"]+)"/);
    if (m) officialNames.push(m[1]);
  }
}

let countIncludes = 0;
let countNew = 0;

for (const dbName of charsWithFruits) {
  const normDb = normalizeFruitName(dbName);
  const simplifiedDb = dbName.split(/[([]/)[0].trim();
  const normSimplified = normalizeFruitName(simplifiedDb);
  const bracketMatch = dbName.match(/\[(.*?)\]/);
  const aliasDb = bracketMatch ? normalizeFruitName(bracketMatch[1]) : "";

  let includeMatch = null;
  let newMatch = null;

  for (const offName of officialNames) {
    const normOfficial = normalizeFruitName(offName);
    
    // Includes match
    if (normOfficial === normDb || normOfficial === normSimplified) {
      includeMatch = offName;
    } else if ((normDb.includes(normOfficial) && normOfficial.length >= 4) ||
               (normOfficial.includes(normSimplified) && normSimplified.length >= 4)) {
      if (!includeMatch) includeMatch = offName;
    }

    // New match
    const isMatch = 
      normOfficial === normDb || 
      normOfficial === normSimplified || 
      (aliasDb && normOfficial === aliasDb) ||
      normOfficial === "saint" + normSimplified ||
      normSimplified === "saint" + normOfficial ||
      normOfficial === normSimplified + "ix" ||
      normSimplified === normOfficial + "ix";

    if (isMatch && !newMatch) {
      newMatch = offName;
    }
  }

  if (includeMatch !== newMatch) {
    console.log(`DIFF: ${dbName} | old: ${includeMatch} | new: ${newMatch}`);
  }
}

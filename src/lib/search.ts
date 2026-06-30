// Lightweight search utility to avoid importing the massive characters list in components

export function searchCharacters(query: string, charactersList: any[]) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  
  // Filter matching characters
  const matched = charactersList.filter(c => 
    (c.name && c.name.toLowerCase().includes(q)) || 
    (c.crew && c.crew.toLowerCase().includes(q))
  );

  // Score them to rank best matches first
  const scored = matched.map(c => {
    let score = 0;
    const nameLower = (c.name || "").toLowerCase();
    const crewLower = (c.crew || "").toLowerCase();

    // 1. Exact name match gets the highest score
    if (nameLower === q) {
      score += 10000;
    }
    // Name exact prefix
    else if (nameLower.startsWith(q)) {
      score += 5000;
    }
    // Word boundary start
    else if (nameLower.includes(" " + q)) {
      score += 4000;
    }
    // Substring name match
    else if (nameLower.includes(q)) {
      score += 1000;
    }
    // Crew match gets less score
    else if (crewLower.includes(q)) {
      score += 100;
    }

    // 2. Specific main character boosts
    // "kid" -> Eustass Kid
    if (q === "kid" && nameLower === "eustass kid") {
      score += 20000;
    }
    // "franky" -> Franky [Cutty Flam]
    if (q === "franky" && nameLower.includes("franky")) {
      score += 20000;
    }

    // 3. Global priority for important/main characters (high bounty, major name)
    const majorNames = [
      "monkey d. luffy", "roronoa zoro", "vinsmoke sanji", "nami", "nicorobin", 
      "tony tony chopper", "god usopp", "franky [cutty flam]", "brook", "jinbe",
      "eustass kid", "trafalgar d. water law", "shanks", "kaidou", "marshall d. teach",
      "charlotte linlin", "gol d. roger", "edward newgate", "buggy"
    ];

    if (majorNames.some(m => nameLower === m || nameLower.startsWith(m))) {
      score += 500;
    }

    if (c.bounty && typeof c.bounty === "number") {
      score += Math.min(c.bounty / 1000000, 300);
    }

    return { char: c, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.map(item => item.char).slice(0, 10);
}

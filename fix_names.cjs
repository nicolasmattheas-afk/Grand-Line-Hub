const fs = require('fs');
let code = fs.readFileSync('src/components/Boutique.tsx', 'utf8');

const productsTxt = fs.readFileSync('products.txt', 'utf8');
const lines = productsTxt.split('\n');

const nameMap = {};
for (const line of lines) {
  if (line.includes('id: "f_')) {
    const matchId = line.match(/id: "([^"]+)"/);
    const matchName = line.match(/name: "([^"]+)"/);
    if (matchId && matchName) {
      // Decode URI components
      let name = decodeURIComponent(matchName[1]);
      // Remove Plastoy, PVC, and cm (e.g. 15 cm, 15cm)
      name = name.replace(/Plastoy/gi, '').trim();
      name = name.replace(/PVC/gi, '').trim();
      name = name.replace(/\b\d+\s*cm\b/gi, '').trim();
      name = name.replace(/Standard Polyrésine/gi, '').trim();
      name = name.replace(/Produit dérivé/gi, '').trim(); // if any
      name = name.replace(/\s+/g, ' ').trim();
      nameMap[matchId[1]] = name;
    }
  }
}

let newCode = code.replace(/{ id: "f_(\d+)", name: "([^"]+)", category: "produits dérivés"/g, (match, id, oldName) => {
  const newName = nameMap["f_" + id] || oldName;
  return `{ id: "f_${id}", name: "${newName}", category: "produits dérivés"`;
});

fs.writeFileSync('src/components/Boutique.tsx', newCode);
console.log("Done");

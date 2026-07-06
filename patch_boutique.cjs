const fs = require('fs');
let code = fs.readFileSync('src/components/Boutique.tsx', 'utf8');

const target = /const PRODUCTS: Product\[\] = \[\n  \/\/ Mangas \(Coffrets\)/;
const replacement = `const PRODUCTS: Product[] = [
  // Nouveautés
  { id: "m_new_1", name: "One Piece Édition Originale - Tome 114", category: "mangas", link: "https://amzn.to/4vjdmcv", image: "https://m.media-amazon.com/images/P/234407113X.01._SCLZZZZZZZ_.jpg", price: "NOUVEAU" },
  { id: "m_new_2", name: "One Piece Édition Originale - Tome 113", category: "mangas", link: "https://amzn.to/3SIrZs9", image: "https://m.media-amazon.com/images/P/2344071121.01._SCLZZZZZZZ_.jpg", price: "NOUVEAU" },
  { id: "m_new_3", name: "One Piece Édition Originale - Tome 109", category: "mangas", link: "https://amzn.to/4viYgDM", image: "https://m.media-amazon.com/images/P/2344068929.01._SCLZZZZZZZ_.jpg", price: "NOUVEAU" },

  // Mangas (Coffrets)`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/Boutique.tsx', code, 'utf8');
console.log("Patched Boutique.tsx");

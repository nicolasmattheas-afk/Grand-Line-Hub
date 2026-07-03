const fs = require('fs');

let code = fs.readFileSync('src/components/Boutique.tsx', 'utf8');

code = code.replace(/"Figurine One Piece Trafalgar Law"/g, '"Peluche One Piece Trafalgar Law"');
code = code.replace(/"Figurine One Piece Ace"/g, '"Peluche One Piece Zoro"');
code = code.replace(/"Figurine One Piece Sabo"/g, '"Peluche One Piece Luffy"');
code = code.replace(/"Tirelire Escargophone Trafalgar Law"/g, '"Tirelire Escargophone Thousand Sunny"');

fs.writeFileSync('src/components/Boutique.tsx', code);
console.log('done');

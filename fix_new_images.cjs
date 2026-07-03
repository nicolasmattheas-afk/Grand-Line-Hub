const fs = require('fs');

let code = fs.readFileSync('src/components/Boutique.tsx', 'utf8');

const replacements = {
  "B07YZM1YS4.01._SCLZZZZZZZ_.jpg": "I/51baGK6jn-L._AC_SL1000_.jpg",
  "B0DZXT7GQH.01._SCLZZZZZZZ_.jpg": "I/71xfe0z2i7L._AC_SL1300_.jpg",
  "B0G36C7FF1.01._SCLZZZZZZZ_.jpg": "I/71l2M26r2rL._AC_SL1300_.jpg",
  "B0DZXQLL5D.01._SCLZZZZZZZ_.jpg": "I/71r67VsKLSL._AC_SL1300_.jpg",
  "B0GPR6F2SC.01._SCLZZZZZZZ_.jpg": "I/71aJod8yuiL._AC_SL1300_.jpg",
  "B0DYK7N5LN.01._SCLZZZZZZZ_.jpg": "I/81EkZSqki+L._AC_SL1500_.jpg",
  "B09B2ZVPVW.01._SCLZZZZZZZ_.jpg": "I/81Lyh6TZK9L._AC_SL1500_.jpg"
};

for (const [oldName, newPath] of Object.entries(replacements)) {
  code = code.replace(`P/${oldName}`, newPath);
}

fs.writeFileSync('src/components/Boutique.tsx', code);
console.log('done');

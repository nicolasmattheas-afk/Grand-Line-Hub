const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/<span>BOUTIQUE<\/span>/g, '<span>BOUTIQUE ✨ NEW</span>');
code = code.replace(/uppercase">Boutique<\/span>/g, 'uppercase">Boutique ✨ NEW</span>');

fs.writeFileSync('src/App.tsx', code, 'utf8');
console.log("Patched Boutique tab name");

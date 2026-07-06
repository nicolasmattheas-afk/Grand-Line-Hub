const fs = require('fs');
let code = fs.readFileSync('api/index.ts', 'utf8');

// replace the first ADMIN_EMAIL declaration
code = code.replace(/const ADMIN_EMAIL = "nicolasmattheas@gmail\.com";/, '');

fs.writeFileSync('api/index.ts', code, 'utf8');
console.log("Fixed ADMIN_EMAIL");

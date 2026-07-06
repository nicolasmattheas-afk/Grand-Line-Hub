const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = /orderBy\("createdAt", "desc"\)/;
code = code.replace(target, 'orderBy("updatedAt", "desc")');

const targetTime = /const latestTime = latestPost\.createdAt\?\.toMillis \? latestPost\.createdAt\.toMillis\(\) : Date\.now\(\);/;
const replacementTime = 'const latestTime = latestPost.updatedAt?.toMillis ? latestPost.updatedAt.toMillis() : (latestPost.createdAt?.toMillis ? latestPost.createdAt.toMillis() : Date.now());';
code = code.replace(targetTime, replacementTime);

fs.writeFileSync('src/App.tsx', code, 'utf8');
console.log("Patched App.tsx to use updatedAt");

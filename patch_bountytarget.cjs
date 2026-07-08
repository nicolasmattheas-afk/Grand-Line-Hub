const fs = require('fs');
let code = fs.readFileSync('src/components/BountyTargetGame.tsx', 'utf8');

const target = `  const handleVerify = (customSelected?: (Character | null)[]) => {
    const listToCheck = customSelected || selectedChars;
    const activeCount = listToCheck.filter(Boolean).length;
    if (activeCount < gameSize) return;`;

const replacement = `  const handleVerify = (customSelected?: (Character | null)[]) => {
    if (hasChecked) return;
    const listToCheck = customSelected || selectedChars;
    const activeCount = listToCheck.filter(Boolean).length;
    if (activeCount < gameSize) return;`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/BountyTargetGame.tsx', code, 'utf8');
console.log("Patched BountyTargetGame.tsx");

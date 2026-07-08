const fs = require('fs');
let code = fs.readFileSync('src/components/BountyDuel.tsx', 'utf8');

const target = `      if (newStreak >= pool.length - 1 && pool.length > 2) {
        setTimeout(() => {
          setShowWinModal(true);
          const hasReceivedBonus = localStorage.getItem("hasCompletedBountyDuelSecretBonus") === "true";
          if (!hasReceivedBonus) {
            onUpdateBounty(20000000); // Bonus secret de 20M Berries
            localStorage.setItem("hasCompletedBountyDuelSecretBonus", "true");
          }
        }, 1200);
      } else {`;

const replacement = `      if (newStreak >= pool.length - 1 && pool.length > 2) {
        setTimeout(() => {
          setShowWinModal(true);
        }, 1200);
      } else {`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/BountyDuel.tsx', code, 'utf8');
console.log("Patched BountyDuel.tsx");

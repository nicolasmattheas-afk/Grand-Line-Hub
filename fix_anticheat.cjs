const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/\/\/ Validation anti-triche renforcée[\s\S]*?if \(!hasNewWins && bountyDiff > 15000000\) \{[\s\S]*?isLocalLegit = false;\s*\}\s*\}\s*\}/g, 
`// Validation anti-triche : on garde seulement la vérif admin (tous les modes sont égaux, pas de plafond par mode principal)
          let isLocalLegit = true;

          if (isLocalLegit && localBounty > cloudBounty) {
            if (cloudBounty === 0 && localBounty > 200000) {
              // Reset administratif du Cloud à 0, l'état local doit s'y conformer et ne doit pas essayer d'écraser
              console.warn("⚠️ [Anti-Cheat] La prime sur le Cloud a été réinitialisée à 0 par un administrateur. Alignement de la session.");
              isLocalLegit = false;
            }
          }`);
          
code = code.replace(/\/\/ Plafond absolu théorique[\s\S]*?if \(!hasNewWins && bountyDiff > 15000000\) \{[\s\S]*?isLocalLegit = false;\s*\}\s*\}\s*\}/g, 
`let isLocalLegit = true;

            if (isLocalLegit && playerBounty > cloudBounty) {
              if (cloudBounty === 0 && playerBounty > 200000) {
                // Reset administratif détecté sur le Cloud
                console.warn("⚠️ [Anti-Cheat] Reset administratif à 0 détecté sur le Cloud. Sauvegarde locale annulée.");
                isLocalLegit = false;
              }
            }`);

fs.writeFileSync('src/App.tsx', code);

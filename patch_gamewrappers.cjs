const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import GameWrapper')) {
  code = code.replace(
    'import { useNavigate, useLocation } from "react-router-dom";',
    'import { useNavigate, useLocation } from "react-router-dom";\nimport GameWrapper from "./components/GameWrapper";'
  );
}

const wrappers = [
  { id: 'grid', title: 'Grand Line Grid', tag: '<GrandLineGrid', endTag: '/>' },
  { id: 'tracker', title: 'Log Pose Tracker', tag: '<LogPoseTracker', endTag: '/>' },
  { id: 'duel', title: 'Bounty Duel', tag: '<BountyDuel', endTag: '/>' },
  { id: 'pyramid', title: 'Pyramide', tag: '<PiratePyramid', endTag: '/>' },
  { id: 'pirateShadow', title: 'L\\\'ombre du pirate', tag: '<PirateShadow', endTag: '/>' },
  { id: 'fusion', title: 'Fusion Mystère', tag: '<CharacterFusion', endTag: '/>' },
  { id: 'fourImages', title: '4 Pirates, 1 Mot', tag: '<FourImagesOneWord', endTag: '/>' },
  { id: 'timeline', title: 'Chronologie Pirate', tag: '<PirateTimeline', endTag: '/>' },
  { id: 'bountyTarget', title: 'Cible de Primes', tag: '<BountyTargetGame', endTag: '/>' },
  { id: 'alliances', title: 'Alliances Secrètes', tag: '<SecretAlliances', endTag: '/>' },
  { id: 'undercover', title: 'Mission Undercover', tag: '<UndercoverGame', endTag: '/>' },
  { id: 'crossword', title: 'Mots Croisés', tag: '<MotsCroises', endTag: '/>' }
];

wrappers.forEach(w => {
  const tabStr = `{activeTab === "${w.id}" && (\n              ${w.tag}`;
  if (code.includes(tabStr)) {
    // We need to wrap it. Find where the tag ends.
    const regex = new RegExp(`{activeTab === "${w.id}" && \\([\\s\\S]*?${w.endTag}\\s*\\)}`);
    const match = code.match(regex);
    if (match) {
      const originalBlock = match[0];
      const innerContent = originalBlock.substring(`{activeTab === "${w.id}" && (`.length, originalBlock.length - 2).trim();
      const newBlock = `{activeTab === "${w.id}" && (
              <GameWrapper gameId="${w.id}" title="${w.title}">
                ${innerContent}
              </GameWrapper>
            )}`;
      code = code.replace(originalBlock, newBlock);
    }
  }
});

fs.writeFileSync('src/App.tsx', code, 'utf8');
console.log("Patched App.tsx with GameWrappers");

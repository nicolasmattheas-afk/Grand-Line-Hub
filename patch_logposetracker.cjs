const fs = require('fs');
let code = fs.readFileSync('src/components/LogPoseTracker.tsx', 'utf8');

// Add useRef
code = code.replace('import { useState, useEffect, useRef } from "react";', 'import { useState, useEffect, useRef } from "react";');
if (!code.includes('import { useState, useEffect, useRef }')) {
    code = code.replace('import { useState, useEffect } from "react";', 'import { useState, useEffect, useRef } from "react";');
}

// Add isProcessingRef
code = code.replace('  const [gameOver, setGameOver] = useState(false);', '  const [gameOver, setGameOver] = useState(false);\n  const isProcessingRef = useRef(false);');

// Reset isProcessingRef in startNewGame
const resetTarget = `    setGameOver(false);
    setHasWon(false);
    setGuesses([]);`;
const resetReplacement = `    setGameOver(false);
    setHasWon(false);
    setGuesses([]);
    isProcessingRef.current = false;`;
code = code.replace(resetTarget, resetReplacement);

// Fix submitGuess
const guessTarget = `  const submitGuess = (char: Character) => {
    if (gameOver || guesses.some(g => g.id === char.id)) return;`;
const guessReplacement = `  const submitGuess = (char: Character) => {
    if (gameOver || isProcessingRef.current || guesses.some(g => g.id === char.id)) return;
    isProcessingRef.current = true;`;
code = code.replace(guessTarget, guessReplacement);

// In case it's not a game over, reset isProcessingRef
const guessElseTarget = `      setGameOver(true);
      onUpdateBounty(penalty); // Retrait dynamique si perdu
    }
  };`;
const guessElseReplacement = `      setGameOver(true);
      onUpdateBounty(penalty); // Retrait dynamique si perdu
    } else {
      isProcessingRef.current = false;
    }
  };`;
code = code.replace(guessElseTarget, guessElseReplacement);

fs.writeFileSync('src/components/LogPoseTracker.tsx', code, 'utf8');
console.log("Patched LogPoseTracker.tsx");

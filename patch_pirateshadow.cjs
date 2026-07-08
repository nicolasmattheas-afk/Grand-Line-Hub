const fs = require('fs');
let code = fs.readFileSync('src/components/PirateShadow.tsx', 'utf8');

if (!code.includes('isProcessingRef')) {
  // Add useRef
  code = code.replace('import { useState, useEffect, useMemo } from "react";', 'import { useState, useEffect, useMemo, useRef } from "react";');
  
  // Add the ref inside the component
  const refCode = `  const [scores, setScores] = useState({ wins: 0, losses: 0 });\n  const isProcessingRef = useRef(false);`;
  code = code.replace(`  const [scores, setScores] = useState({ wins: 0, losses: 0 });`, refCode);

  // Reset ref on resetGame
  const resetTarget = `    setRevealed(false);
    setGuessedCorrectly(false);`;
  const resetReplacement = `    setRevealed(false);
    setGuessedCorrectly(false);
    isProcessingRef.current = false;`;
  code = code.replace(resetTarget, resetReplacement);

  // Fix selectSuggestion
  const selectTarget = `  const selectSuggestion = (chosenChar: Character) => {
    if (!targetChar || revealed) return;`;
  const selectReplacement = `  const selectSuggestion = (chosenChar: Character) => {
    if (!targetChar || revealed || isProcessingRef.current) return;
    isProcessingRef.current = true;`;
  code = code.replace(selectTarget, selectReplacement);

  const selectFailureTarget = `      if (nextErrors >= 3) {
        setRevealed(true);`;
  const selectFailureReplacement = `      if (nextErrors >= 3) {
        setRevealed(true);`;
  // Wait, if it's a failure and < 3 errors, they can guess again.
  // So we must reset isProcessingRef if not fully revealed.
  
  // Let's rewrite the patch for the functions.
}

const fs = require('fs');
let code = fs.readFileSync('src/components/PirateShadow.tsx', 'utf8');

// Add useRef import
code = code.replace('import { useState, useEffect, useMemo } from "react";', 'import { useState, useEffect, useMemo, useRef } from "react";');

// Add isProcessingRef
code = code.replace('  const [scores, setScores] = useState({ wins: 0, losses: 0 });', '  const [scores, setScores] = useState({ wins: 0, losses: 0 });\n  const isProcessingRef = useRef(false);');

// Reset isProcessingRef in resetGame
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

const selectElseTarget = `    } else {
      const nextErrors = errors + 1;`;
const selectElseReplacement = `    } else {
      isProcessingRef.current = false;
      const nextErrors = errors + 1;`;
code = code.replace(selectElseTarget, selectElseReplacement);

// Fix verifyGuess
const verifyTarget = `  const verifyGuess = () => {
    if (!targetChar || revealed) return;`;
const verifyReplacement = `  const verifyGuess = () => {
    if (!targetChar || revealed || isProcessingRef.current) return;
    isProcessingRef.current = true;`;
code = code.replace(verifyTarget, verifyReplacement);

const verifyElseTarget = `    if (isCorrect) {
      setGuessedCorrectly(true);
      setRevealed(true);
      setScores((s) => ({ ...s, wins: s.wins + 1 }));
      if (onUpdateBounty) onUpdateBounty(10000); // +10k
      setGuessInput("");
      setShowSuggestions(false);
    } else {
      const nextErrors = errors + 1;`;
const verifyElseReplacement = `    if (isCorrect) {
      setGuessedCorrectly(true);
      setRevealed(true);
      setScores((s) => ({ ...s, wins: s.wins + 1 }));
      if (onUpdateBounty) onUpdateBounty(10000); // +10k
      setGuessInput("");
      setShowSuggestions(false);
    } else {
      isProcessingRef.current = false;
      const nextErrors = errors + 1;`;
code = code.replace(verifyElseTarget, verifyElseReplacement);

fs.writeFileSync('src/components/PirateShadow.tsx', code, 'utf8');
console.log("Patched PirateShadow.tsx");

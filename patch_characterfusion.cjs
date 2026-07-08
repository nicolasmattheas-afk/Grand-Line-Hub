const fs = require('fs');
let code = fs.readFileSync('src/components/CharacterFusion.tsx', 'utf8');

// Add useRef
code = code.replace('import { useState, useEffect, useMemo } from "react";', 'import { useState, useEffect, useMemo, useRef } from "react";');

// Add isProcessingRef
code = code.replace('  const [revealed, setRevealed] = useState<boolean>(false);', '  const [revealed, setRevealed] = useState<boolean>(false);\n  const isProcessingRef = useRef(false);');

// Reset isProcessingRef in startNewGame
const resetTarget = `    setSubmitted(false);
    setIsCorrect(false);
    setCorrectCount(0);
    setBountyEarned(0);
    setRevealed(false);
    setShowHint(false);`;
const resetReplacement = `    setSubmitted(false);
    setIsCorrect(false);
    setCorrectCount(0);
    setBountyEarned(0);
    setRevealed(false);
    setShowHint(false);
    isProcessingRef.current = false;`;
code = code.replace(resetTarget, resetReplacement);

// Fix handleGuess
const guessTarget = `  const handleGuess = () => {
    if (guesses.some(g => !g.trim())) return;`;
const guessReplacement = `  const handleGuess = () => {
    if (submitted || isProcessingRef.current) return;
    if (guesses.some(g => !g.trim())) return;
    isProcessingRef.current = true;`;
code = code.replace(guessTarget, guessReplacement);

fs.writeFileSync('src/components/CharacterFusion.tsx', code, 'utf8');
console.log("Patched CharacterFusion.tsx");

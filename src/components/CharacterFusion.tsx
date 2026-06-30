import React, { useState, useEffect, useRef } from "react";
import { Character } from "../types";
import { Search, RotateCcw, HelpCircle, Sparkles, Sliders, CheckCircle, XCircle, Info, HelpCircle as HelpIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CharacterFusionProps {
  characters: Character[];
  onUpdateBounty?: (amount: number) => void;
}

export default function CharacterFusion({ characters, onUpdateBounty }: CharacterFusionProps) {
  // Game configuration & targets
  const [targetChars, setTargetChars] = useState<Character[]>([]);
  const [guesses, setGuesses] = useState<string[]>(["", "", ""]);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [bountyEarned, setBountyEarned] = useState<number>(0);

  // Styling and visibility controls
  const opacities = [0.5, 0.6, 0.7];
  const mixMode = "multiply";
  const useParchmentBg = true;
  const [revealed, setRevealed] = useState<boolean>(false);

  // Suggestions state for the 3 input fields
  const [activeInputIndex, setActiveInputIndex] = useState<number | null>(null);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState<number>(-1);
  const containerRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  // Clean and filter candidate characters (top 200 popular characters with real images)
  const cleanCandidates = React.useMemo(() => {
    const clean = characters.filter((c) => {
      const hasRealPhoto = c.image && 
                           c.image.trim() !== "" && 
                           !c.image.toLowerCase().includes("placehold.co") && 
                           !c.image.toLowerCase().includes("dicebear") && 
                           !c.image.toLowerCase().includes("pixel-art") && 
                           !c.image.toLowerCase().includes("no_picture") && 
                           !c.image.toLowerCase().includes("no-picture") && 
                           !c.image.toLowerCase().includes("no picture") && 
                           !c.image.toLowerCase().includes("nopicture") && 
                           !c.image.toLowerCase().includes("no_image") && 
                           !c.image.toLowerCase().includes("no-image") && 
                           !c.image.toLowerCase().includes("noimage") && 
                           !c.image.toLowerCase().includes("nopic") && 
                           !c.image.toLowerCase().includes("placeholder") && 
                           !c.image.toLowerCase().includes("none") && 
                           !c.image.includes("?");
      return hasRealPhoto && !c.name.toLowerCase().includes("inconnu");
    });
    
    // Simple fame scoring
    const getPopularityScore = (c: Character) => {
      let score = 0;
      if (c.bounty) score += Math.min(c.bounty / 100000, 50000); 
      score += (c.description || "").length * 2;
      
      const nameLower = c.name.toLowerCase();
      const superFamous = [
        "luffy", "zoro", "nami", "usopp", "sanji", "chopper", "robin", "franky", "brook", "jinbe",
        "shanks", "roger", "whitebeard", "newgate", "rayleigh", "ace", "sabo", "yamato", "hancock",
        "mihawk", "crocodile", "doflamingo", "buggy", "lucci", "eneru", "enel", "bellamy",
        "law", "kid", "killer", "bonney", "bege", "hawkins", "drake", "apoo", "urouge",
        "garp", "sengoku", "sakazuki", "akainu", "borsalino", "kizaru", "kuzan", "aokiji", "issho", "fujitora",
        "ryokugyu", "coby", "koby", "smoker", "tashigi", "dragon", "ivankov", "koala",
        "katakuri", "king", "queen", "jack", "perospero", "yasopp", "beckman", "marco",
        "oden", "momonosuke", "kin'emon", "hiyori", "raizo", "nekomamushi", "inuarashi", "vivi"
      ];

      for (const name of superFamous) {
        if (nameLower.includes(name)) score += 30000;
      }
      return score;
    };

    const scored = clean.map(c => ({ char: c, s: getPopularityScore(c) }));
    scored.sort((a, b) => b.s - a.s);
    
    // We restrict to top 200 characters to have very recognizable and legendary figures
    return scored.slice(0, 200).map(s => s.char);
  }, [characters]);

  // Click outside suggestions logic
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const clickedOutsideAll = containerRefs.every(ref => {
        return ref.current && !ref.current.contains(event.target as Node);
      });
      if (clickedOutsideAll) {
        setShowSuggestions(false);
        setActiveInputIndex(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Helper to normalize strings for comparison
  const normalize = (val: string) => {
    return val
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "")
      .trim();
  };

  // Select 3 random unique characters
  const startNewGame = () => {
    if (cleanCandidates.length < 3) return;
    
    const selected: Character[] = [];
    const pool = [...cleanCandidates];
    
    while (selected.length < 3 && pool.length > 0) {
      const randIdx = Math.floor(Math.random() * pool.length);
      const chosen = pool.splice(randIdx, 1)[0];
      selected.push(chosen);
    }
    
    setTargetChars(selected);
    setGuesses(["", "", ""]);
    setSubmitted(false);
    setIsCorrect(false);
    setCorrectCount(0);
    setBountyEarned(0);
    setRevealed(false);
    setShowSuggestions(false);
    setActiveInputIndex(null);
    setFocusedSuggestionIndex(-1);
  };

  // Start on mount when candidates are loaded
  useEffect(() => {
    if (cleanCandidates.length >= 3 && targetChars.length === 0) {
      startNewGame();
    }
  }, [cleanCandidates]);

  // Handle autocomplete input changes
  const handleInputChange = (index: number, val: string) => {
    const updated = [...guesses];
    updated[index] = val;
    setGuesses(updated);
    setActiveInputIndex(index);
    setShowSuggestions(true);
    setFocusedSuggestionIndex(0); // Highlight first suggestion by default
  };

  // Filter list of character suggestions based on the active input value
  const filteredSuggestions = React.useMemo(() => {
    if (activeInputIndex === null) return [];
    const val = guesses[activeInputIndex];
    if (!val || val.trim().length === 0) return [];
    
    const query = normalize(val);
    return cleanCandidates
      .filter(c => {
        // Exclude characters that are already correctly selected or entered in other fields
        const isAlreadyEntered = guesses.some((g, idx) => idx !== activeInputIndex && normalize(g) === normalize(c.name));
        return normalize(c.name).includes(query) && !isAlreadyEntered;
      })
      .slice(0, 5); // Limit to 5 suggestions
  }, [guesses, activeInputIndex, cleanCandidates]);

  // Clicked a suggestion
  const handleSelectSuggestion = (index: number, charName: string) => {
    const updated = [...guesses];
    updated[index] = charName;
    setGuesses(updated);
    setShowSuggestions(false);
    setActiveInputIndex(null);
    setFocusedSuggestionIndex(-1);

    // Auto-focus next empty input
    const nextEmptyIndex = updated.findIndex((g) => !g.trim());
    if (nextEmptyIndex !== -1) {
      setTimeout(() => {
        const nextInput = document.getElementById(`fusion-input-${nextEmptyIndex}`) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      }, 50);
    }
  };

  // Handle keyboard events on inputs for suggestion navigation and Enter selection
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault();

      // Case 1: Suggestions are open and there are suggestions listed, select the active one
      if (showSuggestions && filteredSuggestions.length > 0) {
        const idx = focusedSuggestionIndex >= 0 && focusedSuggestionIndex < filteredSuggestions.length 
          ? focusedSuggestionIndex 
          : 0;
        if (filteredSuggestions[idx]) {
          handleSelectSuggestion(index, filteredSuggestions[idx].name);
          return;
        }
      }

      // Case 2: No active suggestion listed, check if what they typed matches a candidate character
      const currentVal = guesses[index].trim();
      if (currentVal.length > 0) {
        const bestMatch = cleanCandidates.find(c => normalize(c.name).includes(normalize(currentVal)));
        if (bestMatch) {
          handleSelectSuggestion(index, bestMatch.name);
          return;
        }
      }

      // Case 3: If all fields are filled, trigger guess submission
      const allFilled = guesses.every(g => g.trim().length > 0);
      if (allFilled) {
        handleGuess();
      } else {
        // If not all fields are filled, jump to the next empty one
        const nextEmptyIndex = guesses.findIndex((g, idx) => idx !== index && !g.trim());
        if (nextEmptyIndex !== -1) {
          const nextInput = document.getElementById(`fusion-input-${nextEmptyIndex}`) as HTMLInputElement;
          if (nextInput) {
            nextInput.focus();
          }
        }
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedSuggestionIndex(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedSuggestionIndex(prev => 
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveInputIndex(null);
      setFocusedSuggestionIndex(-1);
    }
  };

  // Verifying the player guesses
  const handleGuess = () => {
    if (guesses.some(g => !g.trim())) return;

    // We have 3 guesses and 3 targets. Let's find if we can form a perfect 1-to-1 match.
    const checkSingleMatch = (guess: string, target: Character) => {
      const userNormalized = normalize(guess);
      if (!userNormalized) return false;
      
      const normOfficial = normalize(target.name);
      
      // Check bracketed names (e.g. "Luffy [Monkey D. Luffy]")
      let bracketName = "";
      const bracketMatch = target.name.match(/\[(.*?)\]/);
      if (bracketMatch) {
        bracketName = bracketMatch[1];
      }
      const normBracket = bracketName ? normalize(bracketName) : "";

      // Also allow matching individual words of the name if the query is at least 3 chars long
      const nameParts = target.name.toLowerCase().split(/\s+/).map(p => normalize(p)).filter(p => p.length >= 3);
      const hasWordMatch = nameParts.some(part => userNormalized === part);

      return (
        userNormalized === normOfficial ||
        (normBracket && userNormalized === normBracket) ||
        hasWordMatch ||
        (normOfficial.includes(userNormalized) && userNormalized.length >= 4) ||
        (userNormalized.includes(normOfficial) && normOfficial.length >= 4)
      );
    };

    // Evaluate all 6 permutations (3!) to check how many correct matches we can get
    const permutations = [
      [0, 1, 2],
      [0, 2, 1],
      [1, 0, 2],
      [1, 2, 0],
      [2, 0, 1],
      [2, 1, 0]
    ];

    let maxCorrect = 0;
    permutations.forEach(p => {
      const matchCount = 
        (checkSingleMatch(guesses[0], targetChars[p[0]]) ? 1 : 0) +
        (checkSingleMatch(guesses[1], targetChars[p[1]]) ? 1 : 0) +
        (checkSingleMatch(guesses[2], targetChars[p[2]]) ? 1 : 0);
      if (matchCount > maxCorrect) {
        maxCorrect = matchCount;
      }
    });

    let reward = 0;
    if (maxCorrect === 1) {
      reward = 1000;
    } else if (maxCorrect === 2) {
      reward = 3000;
    } else if (maxCorrect === 3) {
      reward = 15000;
    } else {
      reward = -5000;
    }

    setSubmitted(true);
    setIsCorrect(maxCorrect === 3);
    setCorrectCount(maxCorrect);
    setBountyEarned(reward);
    setRevealed(true);

    if (onUpdateBounty) onUpdateBounty(reward);
  };

  if (targetChars.length < 3) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mb-4"></div>
        <p className="font-heading">Génération de la fusion mystère...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6" id="fusion-game-section">
      {/* Header section */}
      <div className="text-center mb-8">
        <span className="bg-gradient-to-r from-pink-500 to-violet-600 text-white text-[11px] font-heading font-black tracking-widest px-3.5 py-1.5 rounded-full uppercase border border-pink-400/20 shadow-md">
          🏴‍☠️ Mini-Jeu Inédit
        </span>
        <h1 className="text-3xl md:text-4xl font-heading font-black tracking-tight text-white mt-3.5 flex items-center justify-center gap-2 flex-wrap">
          <span>Personnage Mystère Fusionné</span>
          <span className="text-[10px] bg-pink-500 text-white font-mono font-bold tracking-widest px-2 py-1 rounded-md uppercase animate-pulse shrink-0 border border-pink-400/20">
            NEW
          </span>
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto mt-2 leading-relaxed">
          Trois visages légendaires d'One Piece ont été fusionnés. Observez attentivement leurs traits entremêlés, et devinez qui ils sont !
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Visual Fusion Canvas & Display Controls */}
        <div className="md:col-span-6 flex flex-col gap-5">
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/40 p-4 flex flex-col items-center">
            {/* Display Board */}
            <div 
              className={`w-full aspect-square rounded-xl relative overflow-hidden flex items-center justify-center transition-all duration-300 ${
                useParchmentBg 
                  ? "bg-amber-50/95 shadow-inner shadow-amber-900/10 border border-amber-900/20" 
                  : "bg-slate-900 border border-slate-800"
              }`}
              style={{ maxHeight: "360px" }}
            >
              {/* Parchment aesthetic overlays if active */}
              {useParchmentBg && (
                <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay bg-radial-at-c from-transparent via-amber-800/10 to-amber-950/30" />
              )}

              {/* Layered images stacked absolute */}
              {targetChars.map((char, index) => {
                // Determine CSS filter/mix behavior
                // With multiply on a light background, transparent PNG with dark lines creates beautiful overlay
                const mixStyle: React.CSSProperties = {
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  padding: "16px",
                  opacity: opacities[index],
                  mixBlendMode: mixMode as any,
                  transition: "opacity 0.2s ease, mix-blend-mode 0.2s ease",
                  filter: !useParchmentBg ? "brightness(1.1) contrast(1.1)" : "none",
                };

                return (
                  <motion.img
                    key={char.id + "-" + index}
                    src={char.image}
                    alt={`Fusion Layer ${index + 1}`}
                    style={mixStyle}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: opacities[index], scale: 1 }}
                    referrerPolicy="no-referrer"
                  />
                );
              })}

              {/* Grid overlay for a high-tech/cartographer vibe */}
              <div className="absolute inset-0 pointer-events-none border border-black/5 grid grid-cols-3 grid-rows-3 opacity-20" />
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Guessing Form */}
        <div className="md:col-span-6 flex flex-col gap-5">
          <div className="bg-slate-950/40 rounded-2xl border border-slate-900 p-6 flex flex-col gap-6">
            <h2 className="font-heading font-extrabold text-lg text-white border-b border-slate-900 pb-3 flex items-center justify-between">
              <span>Proposer vos Réponses</span>
              <span className="text-xs text-slate-400 font-normal">Ordre libre</span>
            </h2>

            {/* The 3 Input Fields with Autocomplete */}
            <div className="space-y-4">
              {guesses.map((guess, index) => (
                <div 
                  key={index} 
                  ref={containerRefs[index]} 
                  className="relative flex flex-col gap-1"
                >
                  <label className="text-xs text-slate-400 font-medium">
                    Personnage #{index + 1}
                  </label>
                  
                  <div className="relative">
                    <input
                      id={`fusion-input-${index}`}
                      data-index={index}
                      type="text"
                      placeholder="Ex: Luffy, Zoro, Shanks..."
                      value={guess}
                      disabled={submitted}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onFocus={() => {
                        setActiveInputIndex(index);
                        setShowSuggestions(true);
                        setFocusedSuggestionIndex(0);
                      }}
                      className={`w-full px-4 py-3 bg-slate-900/60 border rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none transition-all ${
                        submitted 
                          ? "border-slate-800 text-slate-400 cursor-not-allowed" 
                          : activeInputIndex === index 
                            ? "border-violet-500 ring-2 ring-violet-500/20" 
                            : "border-slate-800 hover:border-slate-700"
                      }`}
                    />
                    
                    {guess && (
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider">
                        Prêt
                      </span>
                    )}
                  </div>

                  {/* Autocomplete Suggestions Panel */}
                  <AnimatePresence>
                    {showSuggestions && activeInputIndex === index && filteredSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden z-50 shadow-xl max-h-48 overflow-y-auto"
                      >
                        {filteredSuggestions.map((char, sIndex) => (
                          <button
                            key={char.id}
                            type="button"
                            onClick={() => handleSelectSuggestion(index, char.name)}
                            className={`w-full px-4 py-2.5 text-left text-xs transition-colors border-b border-white/5 last:border-b-0 flex items-center gap-2 ${
                              focusedSuggestionIndex === sIndex 
                                ? "bg-violet-600/35 text-white font-medium" 
                                : "hover:bg-white/5 text-slate-200"
                            }`}
                          >
                            <img 
                              src={char.image} 
                              alt="" 
                              className="w-5 h-5 rounded-full object-cover border border-slate-700 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <span>{char.name}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Validation Buttons */}
            {!submitted ? (
              <button
                onClick={handleGuess}
                disabled={guesses.some(g => !g.trim())}
                className="w-full mt-2 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 disabled:from-slate-800 disabled:to-slate-800 text-white disabled:text-slate-500 font-heading font-black text-xs uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-violet-900/20 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Deviner
              </button>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Result Announcement Box */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-5 rounded-xl border flex flex-col gap-3 ${
                    correctCount === 3 
                      ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-300" 
                      : correctCount > 0
                        ? "bg-amber-950/20 border-amber-900/40 text-amber-300"
                        : "bg-rose-950/20 border-rose-900/40 text-rose-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {correctCount === 3 ? (
                      <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
                    ) : correctCount > 0 ? (
                      <Sparkles className="w-6 h-6 text-amber-400 shrink-0" />
                    ) : (
                      <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
                    )}
                    <div>
                      <h4 className="font-heading font-black text-sm uppercase tracking-wider">
                        {correctCount === 3 
                          ? "Victoire Éclatante !" 
                          : correctCount > 0 
                            ? "Victoire Partielle !" 
                            : "Défaite Honorable"}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        {correctCount === 3 
                          ? "Félicitations, vous avez démasqué les trois silhouettes fusionnées !" 
                          : correctCount > 0
                            ? `Pas mal ! Vous avez démasqué ${correctCount} personnage${correctCount > 1 ? "s" : ""} sur les 3.`
                            : "Aucun personnage trouvé... Entraînez votre regard et retentez votre chance !"}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs border-t border-white/5 pt-3 mt-1 font-mono">
                    <span className="text-slate-500">Ajustement Prime :</span>
                    <span className={`font-bold ${bountyEarned > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {bountyEarned > 0 ? "+" : ""}{bountyEarned.toLocaleString()} ฿
                    </span>
                  </div>
                </motion.div>

                {/* Show Targets reveals */}
                <div className="bg-slate-900/40 rounded-xl border border-slate-900 p-4 space-y-3">
                  <span className="text-[10px] uppercase font-mono text-slate-500 font-bold tracking-wider">
                    Réponses attendues :
                  </span>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {targetChars.map((char) => (
                      <div key={char.id} className="flex flex-col items-center text-center gap-2">
                        <div className="w-16 h-16 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden relative">
                          <img 
                            src={char.image} 
                            alt={char.name} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-200 line-clamp-2 max-w-full leading-normal">
                          {char.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Game Button */}
                <button
                  onClick={startNewGame}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-heading font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Nouvelle fusion
                </button>
              </div>
            )}
          </div>

          {/* Rules/Guide info card */}
          <div className="bg-slate-950/20 rounded-2xl border border-slate-900/60 p-4 flex gap-3 text-xs text-slate-400">
            <Info className="w-5 h-5 text-violet-400 shrink-0" />
            <div className="space-y-1">
              <p className="font-bold text-slate-300">Astuce de Piraterie</p>
              <p className="leading-normal">
                Les trois visages sont superposés à des opacités fixes (50%, 60% et 70%). Observez attentivement les contours croisés, les lignes de cheveux, les yeux et les accessoires pour deviner les personnages cachés !
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

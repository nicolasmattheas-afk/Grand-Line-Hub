import React, { useState, useEffect } from "react";
import { Character } from "../types";
import { 
  Trophy, 
  Sparkles, 
  RotateCcw, 
  Check, 
  Award, 
  Compass, 
  HelpCircle,
  TrendingDown,
  TrendingUp,
  Coins,
  ArrowRightLeft,
  ChevronUp,
  ChevronDown
} from "lucide-react";

interface PiratePyramidProps {
  characters: Character[];
  onUpdateBounty?: (amount: number) => void;
}

type ThemeType = "prime" | "âge" | "taille";

export default function PiratePyramid({ characters, onUpdateBounty }: PiratePyramidProps) {
  // Game Setup state
  const [gameSize, setGameSize] = useState<10 | 15 | 30>(10);
  const [theme, setTheme] = useState<ThemeType>("prime");
  const [earnedReward, setEarnedReward] = useState<number>(0);
  
  // Game State
  const [pyramidList, setPyramidList] = useState<Character[]>([]);
  const [correctOrder, setCorrectOrder] = useState<Character[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  
  const [checked, setChecked] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [hasUnlockingError, setHasUnlockingError] = useState<string | null>(null);

  // Parse specific attributes to strictly sortable numbers
  const parseAttributeValue = (char: Character, activeTheme: ThemeType): number => {
    if (activeTheme === "prime") {
      return Number(char.bounty || 0);
    }
    
    if (activeTheme === "âge") {
      const ageStr = String(char.age || "");
      const numMatch = ageStr.match(/\d+/);
      return numMatch ? parseInt(numMatch[0], 10) : 0;
    }
    
    if (activeTheme === "taille") {
      const heightStr = String(char.height || "");
      const numMatch = heightStr.match(/\d+/);
      return numMatch ? parseInt(numMatch[0], 10) : 0;
    }
    
    return 0;
  };

  const getAttributeLabel = (char: Character, activeTheme: ThemeType): string => {
    if (activeTheme === "prime") {
      return `฿ ${(char.bounty || 0).toLocaleString()}`;
    }
    if (activeTheme === "âge") {
      return char.age && String(char.age) !== "Inconnu" ? `${char.age} ans` : "Âge Inconnu";
    }
    if (activeTheme === "taille") {
      return char.height && String(char.height) !== "Inconnu" ? `${char.height} cm` : "Taille Inconnue";
    }
    return "";
  };

  const generatePyramid = (size: 10 | 15 | 30 = gameSize, activeTheme: ThemeType = theme) => {
    // Reset states
    setSelectedIdx(null);
    setChecked(false);
    setIsVictory(false);
    setScore(0);
    setEarnedReward(0);
    setHasUnlockingError(null);

    // Filter characters that possess a valid property for the theme
    const candidates = characters.filter((c) => {
      // Must have valid photo
      const hasRealPhoto = c.image && 
                           c.image.trim() !== "" && 
                           !c.image.toLowerCase().includes("placehold.co") && 
                           !c.image.toLowerCase().includes("placeholder") && 
                           !c.image.toLowerCase().includes("none") && 
                           !c.image.includes("?");
      if (!hasRealPhoto) return false;

      const numVal = parseAttributeValue(c, activeTheme);
      return numVal > 0;
    });

    if (candidates.length < size) {
      setHasUnlockingError(`Pas assez de personnages avec des données de ${activeTheme} valides (${candidates.length}/${size})`);
      return;
    }

    // Draw characters, verifying no duplicate/identical values exist in the set
    // to strictly prevent sorting ambiguity!
    const selected: Character[] = [];
    const shuffledCandidates = [...candidates].sort(() => Math.random() - 0.5);

    for (const cand of shuffledCandidates) {
      if (selected.length >= size) break;

      const value = parseAttributeValue(cand, activeTheme);
      const valExists = selected.some(s => parseAttributeValue(s, activeTheme) === value);
      const nameExists = selected.some(s => s.name === cand.name);

      if (!valExists && !nameExists) {
        selected.push(cand);
      }
    }

    // Fallback: If strict uniqueness was too selective, populate remaining slots with non-duplicate names
    if (selected.length < size) {
      for (const cand of shuffledCandidates) {
        if (selected.length >= size) break;
        const nameExists = selected.some(s => s.name === cand.name);
        if (!nameExists) {
          selected.push(cand);
        }
      }
    }

    if (selected.length < size) {
      setHasUnlockingError("Impossible de générer la pyramide. Veuillez réessayer.");
      return;
    }

    // Sort descending to get reference correct order (highest value at the summit #1)
    const sorted = [...selected].sort((a, b) => {
      return parseAttributeValue(b, activeTheme) - parseAttributeValue(a, activeTheme);
    });

    setCorrectOrder(sorted);

    // Shuffle the items
    let shuffled = [...selected].sort(() => Math.random() - 0.5);
    // Avoid double sort match on initial generate
    while (
      shuffled.map((c) => c.id).join(",") === sorted.map((c) => c.id).join(",") &&
      size > 1
    ) {
      shuffled = [...selected].sort(() => Math.random() - 0.5);
    }

    setPyramidList(shuffled);
  };

  // Run initial game generation on load or configuration changes
  useEffect(() => {
    if (characters && characters.length > 0) {
      generatePyramid(gameSize, theme);
    }
  }, [characters, gameSize, theme]);

  const handleCardClick = (idx: number) => {
    if (checked) return; // interactive state locked on check
    
    if (selectedIdx === null) {
      setSelectedIdx(idx);
    } else {
      if (selectedIdx === idx) {
        // Cancel selection
        setSelectedIdx(null);
      } else {
        // Swap slots
        const copy = [...pyramidList];
        const temp = copy[selectedIdx];
        copy[selectedIdx] = copy[idx];
        copy[idx] = temp;
        setPyramidList(copy);
        setSelectedIdx(null);
      }
    }
  };

  const handleVerify = () => {
    if (checked || pyramidList.length < gameSize) return;

    let correctCount = 0;
    for (let i = 0; i < gameSize; i++) {
      if (pyramidList[i].id === correctOrder[i].id) {
        correctCount++;
      }
    }

    setScore(correctCount);
    setChecked(true);

    const matchAll = correctCount === gameSize;
    if (matchAll) {
      setIsVictory(true);
      // Determine berry rewards requested by the user
      // 10 characters = 5 000
      // 15 characters = 10 000
      // 30 characters = 40 000
      let reward = 5000;
      if (gameSize === 15) {
        reward = 10000;
      } else if (gameSize === 30) {
        reward = 40000;
      }
      
      setEarnedReward(reward);
      if (onUpdateBounty) {
        onUpdateBounty(reward);
      }
    } else {
      setIsVictory(false);
    }
  };

  // Helper indices structure of rows for rendering
  const getRowsSlices = (): Character[][] => {
    const rows: Character[][] = [];
    let rowDefinitions: number[] = [];

    if (gameSize === 10) {
      rowDefinitions = [1, 2, 3, 4]; // sum = 10
    } else if (gameSize === 15) {
      rowDefinitions = [1, 2, 3, 4, 5]; // sum = 15
    } else { // 30
      rowDefinitions = [1, 2, 3, 4, 5, 5, 5, 5]; // sum = 30
    }

    let currentIndex = 0;
    for (const count of rowDefinitions) {
      if (currentIndex >= pyramidList.length) break;
      const slice = pyramidList.slice(currentIndex, currentIndex + count);
      rows.push(slice);
      currentIndex += count;
    }
    
    return rows;
  };

  // Calculate true flat array index of an item rendered in rows
  const getFlatIndex = (rowIdx: number, itemIdxInRow: number): number => {
    let rowDefinitions: number[] = [];
    if (gameSize === 10) {
      rowDefinitions = [1, 2, 3, 4];
    } else if (gameSize === 15) {
      rowDefinitions = [1, 2, 3, 4, 5];
    } else { // 30
      rowDefinitions = [1, 2, 3, 4, 5, 5, 5, 5];
    }

    let flatIdx = 0;
    for (let r = 0; r < rowIdx; r++) {
      flatIdx += rowDefinitions[r];
    }
    return flatIdx + itemIdxInRow;
  };

  const getRewardText = (size: number): string => {
    if (size === 10) return "5 000 ฿";
    if (size === 15) return "10 000 ฿";
    return "40 000 ฿";
  };

  const rows = getRowsSlices();

  return (
    <div className="section-container w-full max-w-full bg-slate-950/40 border-2 border-violet-950/70 p-4 sm:p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-2xl">
      {/* Decorative ambiance elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-pink-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main header block */}
      <div className="text-center mb-8 relative z-10 text-white">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-900/40 border border-violet-500/30 text-violet-300 font-mono text-[10px] md:text-xs rounded-full uppercase tracking-widest mb-3">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Jeu d'Aptitude Stratégique</span>
        </div>
        <h2 className="font-heading font-black text-2xl md:text-4xl text-white tracking-tight uppercase leading-none mb-3">
          Pyramide des Pirates
        </h2>
        <p className="text-slate-300 max-w-2xl mx-auto text-xs sm:text-sm font-medium">
          Ordonnez les pirates de haut en bas selon le thème choisi. <span className="text-amber-400 font-bold">Le sommet (1)</span> possède la valeur <span className="text-amber-400 font-bold">la plus élevée</span>, tandis que la <span className="text-amber-400 font-bold">base</span> contient les valeurs <span className="text-amber-400 font-bold">les plus faibles</span> !
        </p>
      </div>

      {/* Game Config Bar */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 md:p-6 mb-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-center">
          
          {/* Theme selection */}
          <div>
            <label className="block text-slate-400 font-mono text-xs uppercase tracking-wider mb-2.5">
              Thème de classement
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              {(["prime", "âge", "taille"] as ThemeType[]).map((t) => {
                const isActive = theme === t;
                return (
                  <button
                    key={t}
                    onClick={() => {
                      setTheme(t);
                      setSelectedIdx(null);
                    }}
                    className={`py-2 px-2 text-xs font-black uppercase rounded-lg transition-all ${
                      isActive
                        ? "bg-violet-700 text-white shadow-sm font-black"
                        : "text-slate-400 hover:text-white hover:bg-white/5 font-semibold"
                    }`}
                  >
                    {t === "prime" ? "Prime" : t === "âge" ? "Âge" : "Taille"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size selection */}
          <div>
            <label className="block text-slate-400 font-mono text-xs uppercase tracking-wider mb-2.5">
              Taille de la Pyramide & Récompense
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              {([10, 15, 30] as (10 | 15 | 30)[]).map((sz) => {
                const isActive = gameSize === sz;
                return (
                  <button
                    key={sz}
                    onClick={() => {
                      setGameSize(sz);
                      setSelectedIdx(null);
                    }}
                    className={`py-2 px-1 text-[10.5px] uppercase rounded-lg flex flex-col items-center justify-center transition-all ${
                      isActive
                        ? "bg-amber-400 text-slate-950 font-black shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-white/5 font-semibold"
                    }`}
                  >
                    <span className="font-extrabold">{sz} Persos</span>
                    <span className={`text-[8.5px] mt-0.5 ${isActive ? "text-slate-950/80 font-bold" : "text-amber-400/80 font-medium"}`}>
                      {getRewardText(sz)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Regénérer */}
          <div className="md:col-span-2 lg:col-span-1 flex items-end">
            <button
              onClick={() => generatePyramid(gameSize, theme)}
              className="w-full bg-violet-900 border-2 border-violet-700 hover:bg-violet-800 text-white font-heading font-black py-3 px-4 rounded-xl shadow-md transition-all uppercase text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg"
            >
              <RotateCcw className="w-4 h-4 text-violet-200" />
              Réinitialiser / Nouveau Défi
            </button>
          </div>

        </div>
      </div>

      {/* Error state */}
      {hasUnlockingError && (
        <div className="bg-rose-500/10 border-2 border-rose-500/30 text-rose-300 p-4 rounded-xl text-center font-semibold mb-6">
          {hasUnlockingError}
        </div>
      )}

      {/* Primary Pyramid Grid Stage */}
      {pyramidList.length > 0 && !hasUnlockingError && (
        <div className="pyramid-canvas bg-slate-900/40 border border-slate-800/80 rounded-3xl p-3 sm:p-4 md:p-8 flex flex-col items-center gap-6 relative z-10 w-full max-w-full overflow-hidden">
          
          {/* Pyramid Direction Indicators */}
          <div className="absolute top-4 left-4 flex flex-col items-center gap-0.5 text-slate-500 font-mono text-[9px] uppercase">
            <ChevronUp className="w-4 h-4 text-amber-500 animate-bounce" />
            <span>Max (1)</span>
          </div>

          <div className="absolute bottom-4 right-4 flex flex-col items-center gap-0.5 text-slate-500 font-mono text-[9px] uppercase">
            <span>Min</span>
            <ChevronDown className="w-4 h-4 text-amber-500 animate-bounce" />
          </div>

          {/* Render Row by Row */}
          <div className="flex flex-col gap-4 items-center w-full overflow-x-auto pb-4 no-scrollbar">
            {rows.map((rowItems, rowIdx) => {
              return (
                <div 
                  key={rowIdx} 
                  className="flex flex-row flex-nowrap items-center justify-center gap-2 sm:gap-3"
                  style={{ minWidth: "max-content" }}
                >
                  {rowItems.map((char, itemIdxInRow) => {
                    const flatIndex = getFlatIndex(rowIdx, itemIdxInRow);
                    const isSelected = selectedIdx === flatIndex;
                    const correctState = checked ? (char.id === correctOrder[flatIndex].id) : null;

                    return (
                      <div
                        key={char.id}
                        onClick={() => handleCardClick(flatIndex)}
                        className={`group relative flex flex-col items-center rounded-2xl p-2 md:p-3 select-none cursor-pointer border-2 transition-all duration-300 ${
                          gameSize === 30 
                            ? "w-[75px] sm:w-[85px] md:w-[95px] min-h-[100px] sm:min-h-[115px]" 
                            : gameSize === 15
                              ? "w-[110px] sm:w-[125px] md:w-[135px] min-h-[145px] sm:min-h-[160px]"
                              : "w-[120px] sm:w-[135px] md:w-[155px] min-h-[155px] sm:min-h-[175px]"
                        } ${
                          isSelected
                            ? "border-amber-400 bg-amber-500/10 ring-4 ring-amber-400/20 scale-102 shadow-lg"
                            : checked
                              ? correctState
                                ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                                : "border-rose-500/80 bg-rose-500/10 shadow-[0_0_12px_rgba(244,63,94,0.15)]"
                              : "border-slate-800 bg-[#0B0F19] hover:border-violet-500 hover:scale-102"
                        }`}
                      >
                        {/* Number tag */}
                        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-slate-950/80 text-[8px] md:text-[9.5px] font-mono font-black border border-white/5 text-slate-400 text-center shadow-sm z-15">
                          #{flatIndex + 1}
                        </div>

                        {/* Pirate Image */}
                        <div className={`rounded-full overflow-hidden bg-slate-950 border border-slate-800/80 mt-4 mb-2 pointer-events-none shadow-md ${
                          gameSize === 30
                            ? "w-7 h-7 sm:w-9 sm:h-9"
                            : "w-11 h-11 sm:w-16 sm:h-16"
                        }`}>
                          <img
                            src={char.image}
                            alt={char.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        {/* Text values */}
                        <div className="text-center w-full pointer-events-none mt-1 px-1">
                          <span className={`font-heading font-black text-white bg-slate-950 px-1.5 py-0.5 rounded-md block truncate uppercase leading-tight ${
                            gameSize === 30 ? "text-[8px] sm:text-[9.5px]" : "text-[10px] sm:text-xs"
                          }`}>
                            {char.name}
                          </span>
                          
                          {/* Checked state: reveal true value; unchecked: hidden unless requested or default */}
                          <div className="mt-1 flex items-center justify-center">
                            {checked ? (
                              <span className={`rounded-lg px-1.5 py-0.5 font-mono text-center font-bold tracking-tight ${
                                correctState ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                              } ${gameSize === 30 ? "text-[8px] sm:text-[9px]" : "text-[9.5px] sm:text-xs"}`}>
                                {getAttributeLabel(char, theme)}
                              </span>
                            ) : (
                              <span className="text-slate-500 group-hover:text-violet-400 transition-colors uppercase font-mono tracking-tight text-[8px] sm:text-[9.5px]">
                                ? ? ?
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status badge in bottom right corner after verification */}
                        {checked && (
                          <div className="absolute bottom-1 right-1">
                            {correctState ? (
                              <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center font-sans tracking-tight text-[10px] shadow-sm">
                                ✓
                              </div>
                            ) : (
                              <div className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center font-sans tracking-tight text-[10px] shadow-sm">
                                ✗
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Verification Call Action or Success Message */}
          <div className="w-full flex flex-col items-center mt-4">
            {!checked ? (
              <button
                onClick={handleVerify}
                className="bg-amber-400 hover:bg-amber-300 border-2 border-amber-500 hover:scale-[1.01] text-slate-950 font-heading font-black px-8 py-3 rounded-xl uppercase text-xs tracking-widest transition-all cursor-pointer shadow-lg hover:shadow-amber-400/10 flex items-center gap-2"
              >
                <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                Vérifier la Pyramide
              </button>
            ) : (
              <div className="w-full space-y-4">
                
                {/* Score Alert Frame */}
                <div className={`p-4 rounded-2xl border-2 text-center relative overflow-hidden ${
                  isVictory 
                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-100" 
                    : "bg-amber-500/10 border-amber-500/40 text-slate-300"
                }`}>
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    {isVictory ? (
                      <>
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-400 mb-1">
                          <Award className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h4 className="font-heading font-black text-lg sm:text-xl uppercase tracking-wider text-emerald-400">
                          Victoire Absolue !
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-300 max-w-lg">
                          Votre sens de l'observation est digne du Roi des Pirates. L'ordre de votre pyramide est irréprochable !
                        </p>
                        <div className="inline-flex items-center gap-2 mt-2 px-3  py-1.5 bg-amber-400 text-slate-950 font-black rounded-xl font-heading text-xs tracking-wider uppercase animate-pulse">
                          <Coins className="w-4 h-4 text-slate-950" />
                          <span>+{earnedReward.toLocaleString()} BERRYS AJOUTÉS !</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-slate-950 rounded-full flex items-center justify-center border border-slate-800 mb-1">
                          <ArrowRightLeft className="w-5 h-5 text-amber-400" />
                        </div>
                        <h4 className="font-heading font-black text-base uppercase text-slate-200">
                          Pyramide Mélangée
                        </h4>
                        <p className="font-heading font-extrabold text-[#F8FAFC] text-sm uppercase">
                          Score : {score} / {gameSize} correctement placés
                        </p>
                        <p className="text-[10px] sm:text-xs text-slate-400 max-w-lg mt-0.5">
                          Comparez les valeurs révélées pour identifier vos erreurs, puis réinitialisez pour tenter d'obtenir un score parfait !
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Show Golden Order Reveal */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
                  <h5 className="font-mono text-[10px] text-amber-400 uppercase tracking-widest text-center mb-3">
                    L'Ordre Idéal de la Pyramide (Du plus grand au plus petit)
                  </h5>
                  <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
                    {correctOrder.map((c, i) => (
                      <React.Fragment key={c.id}>
                        <div className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-center font-sans tracking-tight">
                          <span className="font-bold text-slate-300">{c.name}</span>{" "}
                          <span className="text-[9px] font-mono text-violet-400">({getAttributeLabel(c, theme)})</span>
                        </div>
                        {i < correctOrder.length - 1 && (
                          <span className="text-slate-600 font-mono text-[9px] font-bold">➔</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="w-full flex justify-center">
                  <button
                    onClick={() => generatePyramid(gameSize, theme)}
                    className="bg-violet-900 border border-violet-700 text-white font-heading font-black px-6 py-2.5 rounded-xl uppercase text-xs tracking-wider transition-all hover:bg-violet-800 cursor-pointer shadow-md flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-violet-300" />
                    Recommencer une pyramide
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}

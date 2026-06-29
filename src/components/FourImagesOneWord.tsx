import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Character } from "../types";
import { HelpCircle, Sparkles, RotateCcw, CheckCircle2, AlertTriangle, ArrowRight, Keyboard, Delete, Lock, Coins } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FourImagesOneWordProps {
  characters: Character[];
  onUpdateBounty?: (amount: number) => void;
  playerBounty?: number;
}

import { LEVELS, CHARACTER_NAME_MAP, Level } from "../data/fourImagesLevels";

export default function FourImagesOneWord({ characters, onUpdateBounty, playerBounty }: FourImagesOneWordProps) {
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(() => {
    const saved = localStorage.getItem("four_images_level_index");
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed < LEVELS.length) {
        return parsed;
      }
    }
    return 0;
  });
  const [userLetters, setUserLetters] = useState<(string | null)[]>([]);
  const [keyboardLetters, setKeyboardLetters] = useState<{ letter: string; used: boolean; id: string }[]>([]);
  const [shaking, setShaking] = useState<boolean>(false);
  const [solved, setSolved] = useState<boolean>(false);
  const [bountyReward, setBountyReward] = useState<number>(0);
  const [hintRevealed, setHintRevealed] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, string>>({});

  const currentLevel = LEVELS[currentLevelIndex];

  // Save progress whenever level index changes
  useEffect(() => {
    localStorage.setItem("four_images_level_index", currentLevelIndex.toString());
  }, [currentLevelIndex]);

  // Dynamically find character images from the characters database with absolute accuracy
  const levelImages = useMemo(() => {
    if (!characters || characters.length === 0) return Array(4).fill("");
    
    return currentLevel.charKeywords.map((kw) => {
      const lowerKw = kw.toLowerCase();
      
      // Override with official Seraphim images
      if (lowerKw === "s-snake") {
        return "https://static.wikia.nocookie.net/onepiece/images/3/30/S-Snake_Anime.png";
      }
      if (lowerKw === "s-hawk") {
        return "https://static.wikia.nocookie.net/onepiece/images/5/56/S-Hawk_Anime.png";
      }
      if (lowerKw === "s-bear") {
        return "https://static.wikia.nocookie.net/onepiece/images/2/28/S-Bear_Anime.png";
      }
      if (lowerKw === "s-shark") {
        return "https://static.wikia.nocookie.net/onepiece/images/1/17/S-Shark_Anime.png";
      }

      const mappedName = CHARACTER_NAME_MAP[kw.toLowerCase()];
      let match: Character | undefined;

      if (mappedName) {
        // Try exact match first
        match = characters.find(
          (c) =>
            c.name === mappedName &&
            c.image &&
            !c.image.toLowerCase().includes("no picture") &&
            !c.image.toLowerCase().includes("placeholder")
        );
      }

      // Fallback to strict substring mapping (avoiding false positives like Pinzoro or Dragon Thirteen)
      if (!match) {
        match = characters.find((c) => {
          const lowerName = c.name.toLowerCase();
          
          // Strict boundaries check or direct exclusions
          if (lowerKw === "zoro" && lowerName.includes("pinzoro")) return false;
          if (lowerKw === "dragon" && lowerName.includes("thirteen")) return false;
          if (lowerKw === "dragon" && lowerName.includes("dragon 13")) return false;
          if (lowerKw === "queen" && lowerName.includes("chanter")) return false;
          
          return (
            lowerName.includes(lowerKw) &&
            c.image &&
            !c.image.toLowerCase().includes("no picture") &&
            !c.image.toLowerCase().includes("placeholder")
          );
        });
      }

      return match ? match.image : "";
    });
  }, [characters, currentLevel]);

  // Initialize level
  useEffect(() => {
    const word = currentLevel.word;
    setUserLetters(Array(word.length).fill(null));
    setSolved(false);
    setShaking(false);
    setHintRevealed(false);
    setErrorMsg(null);
    setFailedImages({});

    // Create virtual keyboard letters (the correct letters + distractors)
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const targetLetters = word.split("");
    const neededPadding = 14 - targetLetters.length;
    
    const distractors: string[] = [];
    for (let i = 0; i < neededPadding; i++) {
      const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
      distractors.push(randomLetter);
    }

    const allLetters = [...targetLetters, ...distractors]
      .map((letter, index) => ({
        letter,
        used: false,
        id: `${letter}-${index}-${Math.random()}`
      }))
      // Simple shuffle
      .sort(() => Math.random() - 0.5);

    setKeyboardLetters(allLetters);
  }, [currentLevelIndex]);

  const nextLevel = useCallback(() => {
    setCurrentLevelIndex((prevIndex) => {
      if (prevIndex < LEVELS.length - 1) {
        return prevIndex + 1;
      } else {
        // Loop back or reset
        return 0;
      }
    });
  }, []);

  // Check word correctness when fully typed
  useEffect(() => {
    if (userLetters.length === 0) return;
    if (userLetters.some((l) => l === null)) return;

    const typedWord = userLetters.join("");
    if (typedWord === currentLevel.word) {
      handleSuccess();
    } else {
      handleFailure();
    }
  }, [userLetters]);

  // Support physical keyboard inputs
  useEffect(() => {
    const handlePhysicalKeyDown = (e: KeyboardEvent) => {
      if (solved) {
        if (e.key === "Enter") {
          e.preventDefault();
          nextLevel();
        }
        return;
      }
      const key = e.key.toUpperCase();

      // Backspace: remove last letter
      if (e.key === "Backspace") {
        e.preventDefault();
        // Find last non-null index
        let lastIndex = -1;
        for (let i = userLetters.length - 1; i >= 0; i--) {
          if (userLetters[i] !== null) {
            lastIndex = i;
            break;
          }
        }
        if (lastIndex !== -1) {
          handleRemoveLetter(lastIndex);
        }
        return;
      }

      // Check if it's an alphabetical letter
      if (/^[A-Z]$/.test(key)) {
        // Find an unused key in the virtual keyboard that matches
        const kbIndex = keyboardLetters.findIndex((item) => item.letter === key && !item.used);
        if (kbIndex !== -1) {
          e.preventDefault();
          handleSelectLetter(kbIndex);
        }
      }
    };

    window.addEventListener("keydown", handlePhysicalKeyDown);
    return () => {
      window.removeEventListener("keydown", handlePhysicalKeyDown);
    };
  }, [userLetters, keyboardLetters, solved, nextLevel]);

  const handleSelectLetter = (kbIndex: number) => {
    if (solved) return;
    const item = keyboardLetters[kbIndex];
    if (item.used) return;

    // Find first empty slot in userLetters
    const emptyIndex = userLetters.indexOf(null);
    if (emptyIndex === -1) return; // Full

    const updatedUserLetters = [...userLetters];
    updatedUserLetters[emptyIndex] = item.letter;

    const updatedKeyboard = [...keyboardLetters];
    updatedKeyboard[kbIndex] = { ...item, used: true };

    setUserLetters(updatedUserLetters);
    setKeyboardLetters(updatedKeyboard);
  };

  const handleRemoveLetter = (userIndex: number) => {
    if (solved) return;
    const letter = userLetters[userIndex];
    if (letter === null) return;

    // Find first corresponding used key on the virtual keyboard
    const kbIndex = keyboardLetters.findIndex((item) => item.letter === letter && item.used);
    if (kbIndex !== -1) {
      const updatedKeyboard = [...keyboardLetters];
      updatedKeyboard[kbIndex] = { ...updatedKeyboard[kbIndex], used: false };
      setKeyboardLetters(updatedKeyboard);
    }

    const updatedUserLetters = [...userLetters];
    updatedUserLetters[userIndex] = null;
    setUserLetters(updatedUserLetters);
  };

  const handleSuccess = () => {
    setSolved(true);
    const reward = 5000; // Reward per successfully solved level
    setBountyReward(reward);
    if (onUpdateBounty) onUpdateBounty(reward);
  };

  const handleFailure = () => {
    setShaking(true);
    setTimeout(() => {
      setShaking(false);
      // Clear all letters to let them try again
      const clearedUser = Array(currentLevel.word.length).fill(null);
      setUserLetters(clearedUser);

      // Mark all keyboard letters as unused
      const clearedKb = keyboardLetters.map((item) => ({ ...item, used: false }));
      setKeyboardLetters(clearedKb);
    }, 600);
  };

  const resetCurrentLevel = () => {
    setUserLetters(Array(currentLevel.word.length).fill(null));
    setKeyboardLetters(keyboardLetters.map((item) => ({ ...item, used: false })));
    setSolved(false);
    setShaking(false);
  };

  const handleBuyHint = () => {
    if (hintRevealed) return;
    const bounty = playerBounty ?? 0;
    if (bounty < 2500) {
      setErrorMsg("Solde de Berrys insuffisant pour révéler l'indice ! (Requis : 2 500 ฿)");
      setTimeout(() => setErrorMsg(null), 4000);
      return;
    }

    if (onUpdateBounty) {
      onUpdateBounty(-2500);
    }
    setHintRevealed(true);
    setErrorMsg(null);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 flex flex-col gap-4 overflow-x-hidden min-h-[calc(100vh-140px)] select-none" id="four-images-game">
      {/* Header Info */}
      <div className="text-center">
        <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-heading font-black tracking-widest px-3 py-1 rounded-full uppercase shadow-md inline-flex items-center gap-1">
          <Sparkles className="w-3 h-3 fill-slate-950" />
          Nouveau Mini-Jeu ✨
        </span>
        <h1 className="text-2xl md:text-3xl font-heading font-black tracking-tight text-white mt-2">
          4 Pirates, 1 Mot
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          Trouve le point commun ou le titre qui unit ces 4 figures légendaires d'One Piece !
        </p>
      </div>

      {/* Grid 2x2 of images (Aesthetic: Old Parchment Card frame) */}
      <div className="grid grid-cols-2 gap-2 bg-amber-50/95 p-2 rounded-2xl shadow-xl border border-amber-900/30 relative overflow-hidden">
        {/* Parchment background effect */}
        <div className="absolute inset-0 pointer-events-none opacity-45 mix-blend-overlay bg-radial-at-c from-transparent via-amber-800/20 to-amber-950/40" />
        
        {levelImages.map((img, i) => (
          <div 
            key={i} 
            className="aspect-square bg-amber-950/10 border border-amber-900/20 rounded-xl overflow-hidden relative shadow-inner flex items-center justify-center group"
          >
            {img ? (
              <img
                src={failedImages[img] || img}
                alt={`Pirate ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
                onError={() => {
                  const kw = currentLevel.charKeywords[i];
                  const lowerKw = kw ? kw.toLowerCase() : "";
                  if (lowerKw && ["s-snake", "s-hawk", "s-bear", "s-shark"].includes(lowerKw)) {
                    const mappedName = CHARACTER_NAME_MAP[lowerKw];
                    const match = characters.find((c) => c.name === mappedName);
                    if (match && match.image && failedImages[img] !== match.image) {
                      setFailedImages((prev) => ({ ...prev, [img]: match.image }));
                    }
                  }
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-amber-900/40 gap-1">
                <HelpCircle className="w-6 h-6 stroke-[1.5]" />
                <span className="text-[9px] font-mono font-bold">CHARGEMENT</span>
              </div>
            )}
            {/* Compass corners overlay */}
            <div className="absolute inset-0 pointer-events-none border border-amber-900/10" />
          </div>
        ))}
      </div>

      {/* Hint card */}
      {hintRevealed ? (
        <div className="bg-slate-950/40 rounded-xl border border-slate-900/60 p-3 flex gap-2.5 items-start text-xs text-slate-300 relative overflow-hidden">
          <div className="absolute right-2 top-2 bg-amber-500/10 text-amber-400 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border border-amber-500/20">
            PAYÉ
          </div>
          <HelpCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-heading font-bold text-[11px] uppercase tracking-wider text-amber-500 block mb-0.5">Indice Révélé :</span>
            <p className="leading-relaxed text-slate-100 text-[11px]">{currentLevel.hint}</p>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/90 rounded-xl border border-amber-950/40 p-3 flex flex-col md:flex-row gap-3 items-center justify-between text-xs relative overflow-hidden shadow-inner">
          <div className="flex gap-2.5 items-center w-full md:w-auto">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-heading font-bold text-[11px] uppercase tracking-wider text-amber-500 flex items-center gap-1">
                Indice Bloqué 🔒
              </span>
              <p className="text-[10px] text-slate-400">Révèle l'indice pour cet énigme de 4 pirates.</p>
            </div>
          </div>
          <button
            onClick={handleBuyHint}
            disabled={solved}
            className={`w-full md:w-auto px-4 py-2 text-slate-950 font-heading font-black text-[11px] uppercase tracking-widest rounded-lg transition-all shadow active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shrink-0 ${
              solved 
                ? "bg-slate-800 text-slate-500 cursor-not-allowed border-none"
                : (playerBounty ?? 0) >= 2500
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 border border-amber-400/20"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed border-none"
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            Acheter l'indice (2 500 ฿)
          </button>
        </div>
      )}

      {/* Error Message for insufficient funds */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="p-2.5 bg-rose-950/70 border border-rose-500/20 rounded-lg text-[10px] text-rose-300 flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Answer Boxes (Zone Saisie) */}
      <div className={`flex justify-center gap-1.5 py-1 flex-wrap ${shaking ? "animate-shake" : ""}`}>
        {userLetters.map((letter, idx) => (
          <motion.button
            key={idx}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleRemoveLetter(idx)}
            className={`w-9 h-11 md:w-11 md:h-13 rounded-lg border-2 font-heading font-extrabold text-lg md:text-xl flex items-center justify-center transition-all ${
              letter
                ? "bg-amber-500 border-amber-400 text-slate-950 shadow-md shadow-amber-500/20"
                : "bg-slate-900/80 border-slate-800 text-slate-600 hover:border-slate-700"
            }`}
          >
            {letter || ""}
          </motion.button>
        ))}
      </div>

      {/* Virtual Keyboard */}
      <div className="flex flex-col gap-1.5 mt-auto">
        <div className="grid grid-cols-7 gap-1.5 justify-center">
          {keyboardLetters.map((item, idx) => (
            <motion.button
              key={item.id}
              whileTap={!item.used && !solved ? { scale: 0.9 } : {}}
              onClick={() => handleSelectLetter(idx)}
              disabled={item.used || solved}
              className={`h-11 rounded-lg font-heading font-extrabold text-sm transition-all border ${
                item.used
                  ? "bg-slate-950/40 border-slate-900 text-slate-700 cursor-not-allowed opacity-30"
                  : "bg-slate-900 hover:bg-slate-850 active:bg-slate-800 border-slate-800 text-slate-100 cursor-pointer shadow hover:shadow-md"
              }`}
            >
              {item.letter}
            </motion.button>
          ))}
        </div>

        {/* Clear/Reset Action Button */}
        <div className="flex justify-between items-center text-xs px-1 text-slate-400 mt-1">
          <span className="font-mono text-[10px] text-slate-500 flex items-center gap-1">
            <Keyboard className="w-3.5 h-3.5" />
            Clavier physique supporté
          </span>
          <button
            onClick={resetCurrentLevel}
            disabled={solved}
            className="text-[10px] font-heading font-bold uppercase tracking-wider text-slate-400 hover:text-white disabled:text-slate-700 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Effacer tout
          </button>
        </div>
      </div>

      {/* Status Overlay Modal / Next Level Button */}
      <AnimatePresence>
        {solved && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="bg-emerald-950/80 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-4 text-center flex flex-col items-center gap-3 shadow-2xl shadow-emerald-950/50"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-heading font-black text-emerald-300 uppercase tracking-wide text-sm">
                Victoire Éclatante !
              </h3>
              <p className="text-[11px] text-slate-300">
                Tu as débloqué le point commun : <strong className="text-emerald-400 font-mono tracking-widest">{currentLevel.word}</strong>
              </p>
            </div>

            <div className="px-3 py-1 bg-emerald-900/30 rounded-full text-[11px] font-mono font-bold text-emerald-400 border border-emerald-500/20">
              +{bountyReward.toLocaleString()} ฿ Prime
            </div>

            <button
              onClick={nextLevel}
              className="w-full mt-1 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-heading font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
            >
              Niveau Suivant
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CSS Animation inject for shake effect */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%, 45%, 75% { transform: translateX(-4px); }
          30%, 60%, 90% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
}

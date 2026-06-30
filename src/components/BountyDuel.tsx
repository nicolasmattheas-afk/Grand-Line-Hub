import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Character } from "../types";
import { ShieldCheck, AlertCircle, RefreshCw, Trophy, Flame } from "lucide-react";
import { getNotranslateClass } from "../lib/translate";
import { handleImageError } from "../lib/images";

interface BountyDuelProps {
  characters: Character[];
  globalBounty: number;
  onUpdateBounty: (amount: number) => void;
}

export default function BountyDuel({ characters, globalBounty, onUpdateBounty }: BountyDuelProps) {
  const [leftChar, setLeftChar] = useState<Character | null>(null);
  const [rightChar, setRightChar] = useState<Character | null>(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(() => {
    return Number(localStorage.getItem("bestBountyDuelStreak") || "0");
  });
  const [revealed, setRevealed] = useState(false);
  const [selectedSide, setSelectedSide] = useState<"left" | "right" | null>(null);
  const [showLossModal, setShowLossModal] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [playedIds, setPlayedIds] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<"facile" | "moyen" | "difficile">("moyen");

  // Initialisation du duel (Jeu "Higher or Lower")
  const pickNewDuel = (currentRight?: Character, resetHistory = false, selectedDiff = difficulty) => {
    // Filtrage spécifique : seulement les personnages avec primes et de vraies photos disponibles
    const pool = characters.filter((c) => {
      if (!c || !c.bounty || c.bounty <= 0) return false;
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
      return hasRealPhoto;
    });

    if (pool.length < 2) return;

    // Filtrer par difficulté (Notoriété basé sur le montant de la prime)
    const filteredByDifficulty = pool.filter(c => {
      if (selectedDiff === "facile") {
        return c.bounty && c.bounty >= 150000000; // Légendes de grand chemin
      }
      if (selectedDiff === "moyen") {
        return c.bounty && c.bounty >= 30000000; // Pirates reconnus
      }
      return true; // Tous les flibustiers (experts)
    });

    const finalPool = filteredByDifficulty.length >= 2 ? filteredByDifficulty : pool;

    // Réinitialiser l'historique de session si demandé
    let currentPlayed = resetHistory ? [] : [...playedIds];

    let left: Character;
    if (currentRight && !resetHistory) {
      left = currentRight;
    } else {
      // Choisir un personnage aléatoire qui n'a pas encore été joué dans cette partie
      const unplayed = finalPool.filter(c => !currentPlayed.includes(c.id));
      const chosenPool = unplayed.length > 0 ? unplayed : finalPool;
      left = chosenPool[Math.floor(Math.random() * chosenPool.length)];
    }

    // Assurer que le personnage de gauche est enregistré dans l'historique
    if (!currentPlayed.includes(left.id)) {
      currentPlayed.push(left.id);
    }

    // Choisir un personnage de droite qui n'a pas été joué, différent de gauche, et avec une prime différente
    let unplayedRight = finalPool.filter(c => !currentPlayed.includes(c.id) && c.id !== left.id && c.bounty !== left.bounty);
    if (unplayedRight.length === 0) {
      // Si tout le monde a déjà été joué, on réinitialise l'historique avec seulement "left" pour la continuité
      unplayedRight = finalPool.filter(c => c.id !== left.id && c.bounty !== left.bounty);
      currentPlayed = [left.id];
    }

    const right = unplayedRight[Math.floor(Math.random() * unplayedRight.length)];
    currentPlayed.push(right.id);

    setLeftChar(left);
    setRightChar(right);
    setRevealed(false);
    setSelectedSide(null);
    setFeedback(null);
    setPlayedIds(currentPlayed);
  };

  useEffect(() => {
    pickNewDuel(undefined, true);
  }, [characters, difficulty]);

  const handleCardClick = (side: "left" | "right") => {
    if (!leftChar || !rightChar || revealed) return;

    setSelectedSide(side);
    setRevealed(true);

    const leftIsHigher = leftChar.bounty > rightChar.bounty;
    const correct = (side === "left" && leftIsHigher) || (side === "right" && !leftIsHigher);

    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
        localStorage.setItem("bestBountyDuelStreak", String(newStreak));
      }
      
      setFeedback({
        isCorrect: true,
        message: ""
      });

      // On continue d'enchaîner après un bref délai pour laisser voir la magnifique animation violette !
      setTimeout(() => {
        pickNewDuel(rightChar);
      }, 700);
    } else {
      // La prime grimpe à la fin du duel en fonction du résultat (sans plafond, 500 Berries / réponse)
      const totalGains = streak * 500;
      if (totalGains > 0) {
        onUpdateBounty(totalGains);
      }

      setFeedback({
        isCorrect: false,
        message: `Raté ! La prime de ${rightChar.name} était de ฿ ${rightChar.bounty.toLocaleString("fr-FR").replace(/\u202f/g, " ")}.`
      });

      // Afficher le modal de score de défaite
      setTimeout(() => {
        setShowLossModal(true);
      }, 1500);
    }
  };

  if (!leftChar || !rightChar) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500 font-sans">
        <RefreshCw className="h-8 w-8 mb-4 text-[#8b5cf6]" />
        <p>Génération de l'équipage en cours...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 font-sans">
      <div className="text-center mb-8 text-white relative">
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white font-heading mb-2 uppercase">
          BOUNTY DUEL
        </h2>
        <p className="text-violet-400 font-heading font-black tracking-widest text-xs uppercase mb-3">
          SÉLECTIONNEZ LE PIRATE DONT LA PRIME EST LA PLUS ÉLEVÉE !
        </p>
        <p className="text-slate-300 max-w-lg mx-auto text-xs md:text-sm font-medium">
          Cliquez directement sur l'affiche (Wanted Poster) du pirate que vous pensez être le plus recherché.
        </p>

        {/* Tableau d'affichage du score */}
        <div className="flex flex-col items-center justify-center gap-4 mt-6">
          <div className="flex items-center justify-center gap-6">
            <div className="bg-slate-900 border-2 border-slate-700 px-5 py-3 rounded-2xl flex items-center gap-2 shadow-xs text-white">
              <Flame className="w-5 h-5 text-orange-500" />
              <div className="text-left">
                <span className="text-[9px] text-gray-400 block font-heading font-extrabold uppercase tracking-widest">Série Actuelle</span>
                <span className="font-mono text-xl font-black text-white">{streak}</span>
              </div>
            </div>
            <div className="bg-slate-900 border-2 border-slate-700 px-5 py-3 rounded-2xl flex items-center gap-2 shadow-xs text-white">
              <Trophy className="w-5 h-5 text-amber-500" />
              <div className="text-left">
                <span className="text-[9px] text-gray-400 block font-heading font-extrabold uppercase tracking-widest">Record</span>
                <span className="font-mono text-xl font-black text-white">{bestStreak}</span>
              </div>
            </div>
          </div>

          {/* Sélecteur de Notoriété / Difficulté */}
          <div className="bg-slate-900/80 border border-slate-800 p-1.5 rounded-2xl flex items-center gap-1.5 max-w-sm w-full shadow-lg">
            <button
              onClick={() => {
                setDifficulty("facile");
                pickNewDuel(undefined, true, "facile");
              }}
              className={`flex-1 px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-heading font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                difficulty === "facile"
                  ? "bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.35)]"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              ⭐ Facile
            </button>
            <button
              onClick={() => {
                setDifficulty("moyen");
                pickNewDuel(undefined, true, "moyen");
              }}
              className={`flex-1 px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-heading font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                difficulty === "moyen"
                  ? "bg-amber-600 text-white shadow-[0_0_12px_rgba(245,158,11,0.35)]"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              🔥 Moyen
            </button>
            <button
              onClick={() => {
                setDifficulty("difficile");
                pickNewDuel(undefined, true, "difficile");
              }}
              className={`flex-1 px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-heading font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                difficulty === "difficile"
                  ? "bg-rose-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.35)]"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              💀 Expert
            </button>
          </div>
        </div>
      </div>

      {/* Duel Zone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-center my-6 relative">
        {/* VS Badge flottant */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-14 h-14 bg-gradient-to-r from-[#1A1A1A] to-[#1A1A1A] text-white rounded-full font-heading font-black border-4 border-white shadow-sm">
          VS
        </div>

        {/* Personnage de Gauche (Connu) */}
        <motion.div 
          onClick={() => handleCardClick("left")}
          initial={{ opacity: 0, x: -30 }}
          animate={
            revealed && selectedSide === "left"
              ? feedback?.isCorrect
                ? { opacity: 1, x: 0, scale: [1, 1.06, 1], borderColor: "#8b5cf6", boxShadow: "0 0 35px rgba(139, 92, 246, 0.9)" }
                : { opacity: 1, x: [0, -10, 10, -10, 10, 0], borderColor: "#ef4444", boxShadow: "0 0 35px rgba(239, 68, 68, 0.9)" }
              : { opacity: 1, x: 0, scale: 1, borderColor: "#1A1A1A" }
          }
          transition={{ duration: feedback?.isCorrect ? 0.6 : 0.4 }}
          className={`bg-white border-4 rounded-3xl p-3.5 sm:p-5 shadow-xs max-w-sm mx-auto w-full relative ${
            !revealed ? "cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300" : ""
          }`}
        >
          {/* Style Antique Wanted Poster */}
          <div className="border border-[#dfcfbd] p-3 sm:p-4 rounded-2xl flex flex-col h-full bg-[#FAFAFA]">
            <div className="text-center font-heading text-[#1A1A1A] tracking-tighter font-black text-xl min-[380px]:text-2xl sm:text-3xl uppercase mb-2 sm:mb-3">
              WANTED
            </div>
            
            <div className="h-40 min-[380px]:h-48 sm:h-56 md:h-64 rounded-xl overflow-hidden border-2 border-black bg-slate-100 mb-3 sm:mb-4 relative group">
              <img 
                src={leftChar.image} 
                alt={leftChar.name} 
                className="w-full h-full object-cover opacity-90 brightness-95 group-hover:grayscale-0 transition-all duration-555"
                referrerPolicy="no-referrer"
                onError={(e) => handleImageError(e, leftChar.affiliation)}
              />
              <div className="absolute top-2 right-2 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-[#1A1A1A] text-[8px] sm:text-[9px] text-white rounded font-mono uppercase font-bold tracking-wider max-w-[120px] truncate">
                {leftChar.crew}
              </div>
            </div>

            <div className="text-center">
              <div className="my-1.5">
                <h3 className={`font-heading text-lg min-[380px]:text-xl sm:text-2xl font-black text-white bg-[#1A1A1A] px-3.5 py-1 rounded-xl uppercase tracking-tighter truncate inline-block max-w-full ${getNotranslateClass()}`}>
                  {leftChar?.name}
                </h3>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500 italic line-clamp-2 mt-1 sm:mt-2 h-7 sm:h-8 px-1 sm:px-2 font-medium">
                "{leftChar.description}"
              </p>

              <div className={`mt-2 sm:mt-4 pt-2 sm:pt-4 border-t border-[#dfcfbd] text-center rounded-2xl transition-all duration-300 ${
                revealed && selectedSide === "left"
                  ? feedback?.isCorrect
                    ? "bg-violet-50 ring-4 ring-violet-500 font-bold p-1 sm:p-2 scale-102"
                    : "bg-red-50 ring-4 ring-red-500 font-bold p-1 sm:p-2 scale-102"
                  : ""
              }`}>
                <span className="text-[9px] sm:text-[10px] uppercase font-mono tracking-widest font-black text-gray-400 block mb-0.5 sm:mb-1">PRIME DU PIRATE</span>
                <span className="font-mono text-xl sm:text-2xl font-black text-emerald-600">
                  ฿ {leftChar.bounty.toLocaleString("fr-FR").replace(/\u202f/g, " ")}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Personnage de Droite (Inconnu ou à Deviner) */}
        <motion.div 
          onClick={() => handleCardClick("right")}
          initial={{ opacity: 0, x: 30 }}
          animate={
            revealed && selectedSide === "right"
              ? feedback?.isCorrect
                ? { opacity: 1, x: 0, scale: [1, 1.06, 1], borderColor: "#8b5cf6", boxShadow: "0 0 35px rgba(139, 92, 246, 0.9)" }
                : { opacity: 1, x: [0, -10, 10, -10, 10, 0], borderColor: "#ef4444", boxShadow: "0 0 35px rgba(239, 68, 68, 0.9)" }
              : { opacity: 1, x: 0, scale: 1, borderColor: "#1A1A1A" }
          }
          transition={{ duration: feedback?.isCorrect ? 0.6 : 0.4 }}
          className={`bg-white border-4 rounded-3xl p-3.5 sm:p-5 shadow-xs max-w-sm mx-auto w-full relative ${
            !revealed ? "cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300" : ""
          }`}
        >
          <div className="border border-[#dfcfbd] p-3 sm:p-4 rounded-2xl flex flex-col h-full bg-[#FAFAFA]">
            <div className="text-center font-heading text-[#1A1A1A] tracking-tighter font-black text-xl min-[380px]:text-2xl sm:text-3xl uppercase mb-2 sm:mb-3">
              WANTED
            </div>
            
            <div className="h-40 min-[380px]:h-48 sm:h-56 md:h-64 rounded-xl overflow-hidden border-2 border-black bg-slate-100 mb-3 sm:mb-4 relative">
              <img 
                src={rightChar.image} 
                alt={rightChar.name} 
                className="w-full h-full object-cover opacity-90 brightness-95"
                referrerPolicy="no-referrer"
                onError={(e) => handleImageError(e, rightChar.affiliation)}
              />
              <div className="absolute top-2 right-2 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-[#1A1A1A] text-[8px] sm:text-[9px] text-white rounded font-mono uppercase font-bold tracking-wider max-w-[120px] truncate">
                {rightChar.crew}
              </div>
            </div>

            <div className="text-center">
              <div className="my-1.5">
                <h3 className={`font-heading text-lg min-[380px]:text-xl sm:text-2xl font-black text-white bg-[#1A1A1A] px-3.5 py-1 rounded-xl uppercase tracking-tighter truncate inline-block max-w-full ${getNotranslateClass()}`}>
                  {rightChar?.name}
                </h3>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500 italic line-clamp-2 mt-1 sm:mt-2 h-7 sm:h-8 px-1 sm:px-2 font-medium">
                "{rightChar.description}"
              </p>

              <div className={`mt-2 sm:mt-4 pt-2 sm:pt-4 border-t border-[#dfcfbd] text-center rounded-2xl transition-all duration-300 ${
                revealed && selectedSide === "right"
                  ? feedback?.isCorrect
                    ? "bg-violet-50 ring-4 ring-violet-500 font-bold p-1 sm:p-2 scale-102"
                    : "bg-red-50 ring-4 ring-red-500 font-bold p-1 sm:p-2 scale-102"
                  : ""
              }`}>
                <span className="text-[9px] sm:text-[10px] uppercase font-mono tracking-widest font-black text-gray-400 block mb-0.5 sm:mb-1">PRIME DU PIRATE</span>
                
                <AnimatePresence mode="wait">
                  {!revealed ? (
                    <motion.div 
                      key="mystere"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="font-heading text-xl sm:text-2xl font-black text-violet-500 py-0.5 sm:py-1 tracking-widest"
                    >
                      ฿ ??? ??? ???
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="revelation"
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="font-mono text-2xl font-black text-emerald-600"
                    >
                      ฿ {rightChar.bounty.toLocaleString("fr-FR").replace(/\u202f/g, " ")}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Control / Feedback Subtext */}
      <div className="flex flex-col items-center justify-center my-8 min-h-[64px]">
        {revealed && feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-2xl flex items-center gap-3 border text-sm max-w-md w-full shadow-xs ${
              feedback.isCorrect 
                ? "bg-violet-50 text-violet-700 border-violet-200" 
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {feedback.isCorrect ? (
              <ShieldCheck className="w-5 h-5 shrink-0 text-violet-500" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            )}
            <div className="flex-1">
              <p className="font-heading font-black tracking-wide text-xs uppercase">{feedback.isCorrect ? "VICTOIRE !" : "DÉFAITE !"}</p>
              <p className="text-xs font-semibold mt-0.5">{feedback.message}</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Loss Modal / Fenêtre de Défaite */}
      <AnimatePresence>
        {showLossModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border-4 border-black rounded-3xl max-w-sm w-full p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-red-500" />
              
              <div className="text-center mt-2">
                <span className="inline-block p-4 bg-red-50 rounded-full text-red-500 mb-4">
                  <AlertCircle className="w-10 h-10" />
                </span>
                
                <h3 className="font-heading text-2xl font-black text-[#1A1A1A] uppercase tracking-tighter mb-2">
                  DUEL FINI !
                </h3>
                
                <p className="text-gray-500 text-xs mb-6 font-medium">
                  Votre série de victoires a sombré !
                </p>
                
                {/* Score display */}
                <div className="bg-[#FAFAFA] border-2 border-[#E5E7EB] rounded-2xl py-3 px-4 mb-4 flex justify-around items-center">
                  <div className="text-center">
                    <span className="text-[9px] uppercase font-mono tracking-widest text-gray-400 font-extrabold block">SÉRIE FINALE</span>
                    <span className="text-3xl font-mono font-black text-red-500">{streak}</span>
                  </div>
                  <div className="h-8 w-px bg-gray-200" />
                  <div className="text-center">
                    <span className="text-[9px] uppercase font-mono tracking-widest text-gray-400 font-extrabold block">MEILLEUR RECORD</span>
                    <span className="text-3xl font-mono font-black text-amber-500">{bestStreak}</span>
                  </div>
                </div>

                <div className="mb-6 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                  <span className="text-[9px] text-emerald-800 font-heading font-black uppercase block tracking-wider">Primes Gagnées (500 ฿ / rep, sans plafond)</span>
                  <span className="text-base font-mono font-bold text-emerald-600">
                    + ฿ {(streak * 500).toLocaleString("fr-FR").replace(/\u202f/g, " ")}
                  </span>
                </div>

                <p className="text-[10px] text-gray-400 mb-6 font-mono uppercase tracking-wider block">
                  Voulez-vous rejouer ?
                </p>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setStreak(0);
                      setShowLossModal(false);
                      pickNewDuel(undefined, true);
                    }}
                    className="flex-1 py-3 px-4 bg-[#8b5cf6] text-white font-heading font-black tracking-widest text-[10px] uppercase rounded-xl hover:bg-[#7c3aed] active:scale-95 transition-all text-center cursor-pointer shadow-sm border-2 border-transparent"
                  >
                    REJOUER
                  </button>
                  
                  <button
                    onClick={() => {
                      setStreak(0);
                      setShowLossModal(false);
                    }}
                    className="flex-1 py-3 px-4 bg-white border-2 border-black text-[#1A1A1A] hover:bg-gray-50 font-heading font-black tracking-widest text-[10px] uppercase rounded-xl active:scale-95 transition-all text-center cursor-pointer"
                  >
                    FERMER
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

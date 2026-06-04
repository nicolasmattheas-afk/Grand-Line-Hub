import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Character } from "../types";
import { Swords, RotateCcw, HelpCircle, Trophy, User, ArrowLeftRight, Flame, AlertCircle, ShieldCheck } from "lucide-react";

interface StatsBattleProps {
  characters: Character[];
  onUpdateBounty?: (amount: number, gameName?: string, resultString?: string) => void;
}

export default function StatsBattle({ characters, onUpdateBounty }: StatsBattleProps) {
  const [candidates, setCandidates] = useState<Character[]>([]);
  const [playerCard, setPlayerCard] = useState<Character | null>(null);
  const [opponentCard, setOpponentCard] = useState<Character | null>(null);
  const [chosenStat, setChosenStat] = useState<"age" | "height" | "bounty" | null>(null);
  const [reveal, setReveal] = useState<boolean>(false);
  const [result, setResult] = useState<"win" | "loss" | "draw" | null>(null);
  
  // Stats Battle Streak and Record
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(() => {
    return Number(localStorage.getItem("bestStatsBattleStreak") || "0");
  });
  const [showLossModal, setShowLossModal] = useState<boolean>(false);

  // Filter candidates once characters are loaded
  useEffect(() => {
    if (characters && characters.length > 0) {
      const filtered = characters.filter((c) => {
        const hasAge = c.age !== null && c.age !== undefined && c.age !== "Inconnu" && !isNaN(Number(c.age)) && Number(c.age) > 0;
        const hasHeight = c.height !== null && c.height !== undefined && c.height !== "Inconnu" && !isNaN(Number(c.height)) && Number(c.height) > 0;
        const hasBounty = c.bounty !== null && c.bounty !== undefined && typeof c.bounty === "number" && c.bounty > 0;
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
        return hasAge && hasHeight && hasBounty && hasRealPhoto;
      });
      setCandidates(filtered);
    }
  }, [characters]);

  // Start a new match
  const drawNewMatch = () => {
    if (candidates.length < 2) return;
    
    // Pick two different characters where at least one status of A is strictly greater than B
    let idx1 = 0;
    let idx2 = 0;
    let found = false;
    let attempts = 0;

    while (!found && attempts < 100) {
      idx1 = Math.floor(Math.random() * candidates.length);
      idx2 = Math.floor(Math.random() * candidates.length);
      while (idx2 === idx1) {
        idx2 = Math.floor(Math.random() * candidates.length);
      }

      const pChar = candidates[idx1];
      const oChar = candidates[idx2];

      const pBounty = Number(pChar.bounty || 0);
      const oBounty = Number(oChar.bounty || 0);
      const pAge = Number(pChar.age || 0);
      const oAge = Number(oChar.age || 0);
      const pHeight = Number(pChar.height || 0);
      const oHeight = Number(oChar.height || 0);

      if (pBounty > oBounty || pAge > oAge || pHeight > oHeight) {
        found = true;
      }
      attempts++;
    }

    setPlayerCard(candidates[idx1]);
    setOpponentCard(candidates[idx2]);
    setChosenStat(null);
    setReveal(false);
    setResult(null);
  };

  // Draw initial match when candidates are ready
  useEffect(() => {
    if (candidates.length >= 2 && !playerCard) {
      drawNewMatch();
    }
  }, [candidates]);

  const handleSelectStat = (stat: "age" | "height" | "bounty") => {
    if (chosenStat || !playerCard || !opponentCard) return;

    setChosenStat(stat);
    setReveal(true);

    const valA = Number(playerCard[stat]);
    const valB = Number(opponentCard[stat]);

    if (valA > valB) {
      setResult("win");
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
        localStorage.setItem("bestStatsBattleStreak", String(newStreak));
      }
    } else if (valA < valB) {
      setResult("loss");
      const totalGains = streak * 500;
      if (onUpdateBounty && totalGains > 0) {
        onUpdateBounty(totalGains, "Bataille de stats", "Défaite");
      }
      setTimeout(() => {
        setShowLossModal(true);
      }, 1500);
    } else {
      setResult("draw");
    }
  };

  const handleResetScores = () => {
    if (confirm("Voulez-vous réinitialiser votre record de combat ?")) {
      setBestStreak(0);
      localStorage.setItem("bestStatsBattleStreak", "0");
    }
  };

  const formatBounty = (val: number) => {
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(2)} Milliards ฿`;
    if (val >= 1000000) return `${(val / 1000000).toFixed(0)} Millions ฿`;
    return `${val.toLocaleString()} ฿`;
  };

  if (candidates.length < 2) {
    return (
      <div className="bg-white border border-gray-150 rounded-3xl p-8 text-center max-w-xl mx-auto shadow-xs">
        <Swords className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="font-heading font-black text-xl text-gray-800 uppercase">Préparation des Cartes</h3>
        <p className="text-sm text-gray-500 mt-2">
          Chargement de la base de données de combat d'One Piece...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      
      {/* Page Title & Description */}
      <div className="text-center mb-10 relative">
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white font-heading mb-2 uppercase">
          Bataille de Stats
        </h2>
        <p className="text-slate-300 max-w-2xl mx-auto text-sm md:text-base font-medium">
          Comparez l'un de vos attributs avec celui de votre adversaire mystère. Le plus grand attribut remporte le duel de cartes !
        </p>

        {/* Tableau des Scores */}
        <div className="flex items-center justify-center gap-3 mt-4 text-white">
          <div className="bg-[#11142A]/85 border border-white/10 px-5 py-3 rounded-2xl flex items-center gap-3.5 shadow-lg">
            <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
            <div className="text-left">
              <span className="text-[9px] text-slate-400 block font-heading font-extrabold uppercase tracking-widest leading-none">Série Actuelle</span>
              <span className="font-mono text-xl font-black text-white mt-1 block leading-none">{streak}</span>
            </div>
          </div>
          
          <div className="bg-[#11142A]/85 border border-white/10 px-5 py-3 rounded-2xl flex items-center gap-3.5 shadow-lg">
            <Trophy className="w-5 h-5 text-amber-500" />
            <div className="text-left">
              <span className="text-[9px] text-slate-400 block font-heading font-extrabold uppercase tracking-widest leading-none">Record</span>
              <span className="font-mono text-xl font-black text-amber-400 mt-1 block leading-none">{bestStreak}</span>
            </div>
          </div>

          <button
            onClick={handleResetScores}
            className="p-3 bg-white/10 text-slate-300 hover:text-rose-400 hover:bg-white/20 rounded-xl transition-all cursor-pointer border border-white/10 text-xs inline-flex items-center gap-2"
            title="Reset Record"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Duel Arena */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center max-w-4xl mx-auto">
        
        {/* CARTE JOUEUR (A) */}
        {playerCard && (
          <div className="md:col-span-5 flex flex-col items-center">
            <span className="text-xs font-mono font-black text-[#1A1A1A] uppercase tracking-widest mb-2 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-505 bg-indigo-500" /> VOTRE PIRATE
            </span>
            <div className="bg-white border-4 border-[#1A1A1A] rounded-3xl p-4 md:p-5 shadow-lg w-full max-w-sm transition-transform hover:scale-[1.01] flex flex-col items-stretch relative min-h-[420px] md:min-h-[540px]">
              
              <div className="flex justify-between items-center mb-2 md:mb-3">
                <span className="text-[10px] uppercase font-mono text-gray-450 tracking-wider font-extrabold truncate max-w-[65%]">
                  {playerCard.crew === "Inconnu" ? "Sans équipage" : playerCard.crew}
                </span>
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[9px] font-mono font-black uppercase">
                  {playerCard.affiliation}
                </span>
              </div>

              {/* Portrait */}
              <div className="h-44 min-[400px]:h-52 sm:h-60 md:h-64 rounded-xl overflow-hidden bg-slate-100 border-2 border-black mb-3 md:mb-4 relative">
                <img
                  src={playerCard.image}
                  alt={playerCard.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(playerCard.name)}`;
                  }}
                />
              </div>

              {/* Nom */}
              <h3 className="text-lg font-black font-heading text-center text-gray-900 uppercase tracking-tight truncate">
                {playerCard.name}
              </h3>

              {/* Stats cliquables */}
              <div className="mt-3 md:mt-5 space-y-2 md:space-y-2.5 flex-1">
                {[
                  { key: "bounty", label: "Prime (Bounty)", icon: "฿", display: formatBounty(playerCard.bounty) },
                  { key: "age", label: "Âge", icon: "🕒", display: `${playerCard.age} ans` },
                  { key: "height", label: "Taille", icon: "📏", display: `${playerCard.height} cm` },
                ].map((stat) => {
                  const isSelectable = !chosenStat;
                  const isThisChosen = chosenStat === stat.key;
                  return (
                    <button
                      key={stat.key}
                      disabled={!isSelectable}
                      onClick={() => handleSelectStat(stat.key as any)}
                      className={`w-full flex items-center justify-between p-2 md:p-3 rounded-xl md:rounded-2xl border text-left transition-all ${
                        isThisChosen
                          ? "bg-indigo-600 text-white border-indigo-700 font-extrabold shadow-md scale-102"
                          : isSelectable
                            ? "bg-slate-50 border-slate-150 text-gray-800 hover:bg-slate-100/80 hover:border-indigo-400 cursor-pointer"
                            : "bg-gray-50 border-gray-100 text-gray-450"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm shrink-0">{stat.icon}</span>
                        <div>
                          <span className={`text-[10px] uppercase font-mono block leading-none ${isThisChosen ? "text-indigo-200" : "text-gray-450"}`}>
                            {stat.label}
                          </span>
                          <span className="text-xs font-black font-heading mt-0.5 block tracking-tight">
                            {stat.display}
                          </span>
                        </div>
                      </div>
                      {isSelectable && (
                        <span className="text-[9px] font-mono border border-indigo-200 text-indigo-600 bg-indigo-50/50 px-2 py-0.5 rounded font-black opacity-0 group-hover:opacity-100 transition-opacity">
                          DÉFIER
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* COMPARATEUR CENTRAL */}
        <div className="md:col-span-2 flex flex-col items-center justify-center py-4">
          <div className="w-14 h-14 rounded-full bg-slate-900 border-4 border-white shadow-md flex items-center justify-center text-white shrink-0">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          
          {/* Résultats du Combat */}
          {result && (
            <div className="mt-4 text-center space-y-2 animate-in fade-in zoom-in duration-250">
              <span className={`px-4 py-1.5 rounded-full text-xs font-black font-heading tracking-widest uppercase shadow-sm block ${
                result === "win"
                  ? "bg-emerald-500 text-white"
                  : result === "loss"
                    ? "bg-red-500 text-white"
                    : "bg-gray-500 text-white"
              }`}>
                {result === "win" ? "VICTOIRE !" : result === "loss" ? "DÉFAITE" : "ÉGALITÉ"}
              </span>

              <p className="text-[11px] font-mono text-gray-450 leading-tight max-w-[124px] mx-auto">
                {result === "win" 
                  ? "Votre stat surpasse l'adversaire !" 
                  : result === "loss" 
                    ? "L'adversaire a une stat supérieure" 
                    : "Des attributs identiques"}
              </p>

              {result === "win" && (
                <p className="text-emerald-500 font-black font-mono text-[10px] uppercase tracking-wider animate-pulse pt-1">
                  +1 SÉRIE ! 🔥
                </p>
              )}
              {result === "loss" && (
                <p className="text-rose-500 font-black font-mono text-[10px] uppercase tracking-wider pt-1 animate-pulse">
                  SÉRIE BRISÉE ! 💀
                </p>
              )}
            </div>
          )}
        </div>

        {/* CARTE ADVERSAIRE (B) */}
        {opponentCard && (
          <div className="md:col-span-5 flex flex-col items-center">
            <span className="text-xs font-mono font-black text-[#1A1A1A] uppercase tracking-widest mb-2 flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${reveal ? "bg-amber-500" : "bg-gray-400"}`} /> ADVERSAIRE
            </span>

            {/* Carte Face Cachée ou Révélée */}
            <div className={`bg-white border-4 rounded-3xl p-4 md:p-5 shadow-lg w-full max-w-sm transition-all duration-300 min-h-[420px] md:min-h-[540px] flex flex-col relative overflow-hidden ${
              reveal 
                ? "border-[#1A1A1A] scale-100" 
                : "border-gray-200 bg-slate-50 scale-98"
            }`}>
              
              {/* Blurred / Normal card body */}
              <div 
                className={`flex-1 flex flex-col items-stretch ${reveal ? "transition-all duration-500 ease-out" : ""}`}
                style={{ 
                  filter: reveal ? "none" : "blur(24px)",
                  pointerEvents: reveal ? "auto" : "none",
                  userSelect: reveal ? "none" : "auto"
                }}
              >
                <div className="flex justify-between items-center mb-2 md:mb-3">
                  <span className="text-[10px] uppercase font-mono text-gray-450 tracking-wider font-extrabold truncate max-w-[65%]">
                    {opponentCard.crew === "Inconnu" ? "Sans équipage" : opponentCard.crew}
                  </span>
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[9px] font-mono font-black uppercase">
                    {opponentCard.affiliation}
                  </span>
                </div>

                {/* Portrait */}
                <div className="h-44 min-[400px]:h-52 sm:h-60 md:h-64 rounded-xl overflow-hidden bg-slate-100 border-2 border-black mb-3 md:mb-4">
                  <img
                    src={opponentCard.image}
                    alt={opponentCard.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(opponentCard.name)}`;
                    }}
                  />
                </div>

                {/* Nom */}
                <h3 className="text-lg font-black font-heading text-center text-gray-900 uppercase tracking-tight truncate">
                  {opponentCard.name}
                </h3>

                {/* Stats de l'adversaire (Statique pour comparaison) */}
                <div className="mt-3 md:mt-5 space-y-2 md:space-y-2.5 flex-1 font-sans">
                  {[
                    { key: "bounty", label: "Prime (Bounty)", icon: "฿", display: formatBounty(opponentCard.bounty) },
                    { key: "age", label: "Âge", icon: "🕒", display: `${opponentCard.age} ans` },
                    { key: "height", label: "Taille", icon: "📏", display: `${opponentCard.height} cm` },
                  ].map((stat) => {
                    const isThisChosen = chosenStat === stat.key;
                    return (
                      <div
                        key={stat.key}
                        className={`flex items-center justify-between p-2 md:p-3 rounded-xl md:rounded-2xl border text-left transition-all ${
                          isThisChosen
                            ? "bg-amber-600 text-white border-amber-700 font-extrabold shadow-sm"
                            : "bg-slate-50 border-slate-100 text-gray-500"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm shrink-0">{stat.icon}</span>
                          <div>
                            <span className={`text-[10px] uppercase font-mono block leading-none ${isThisChosen ? "text-amber-200" : "text-gray-400"}`}>
                              {stat.label}
                            </span>
                            <span className="text-xs font-black font-heading mt-0.5 block tracking-tight">
                              {stat.display}
                            </span>
                          </div>
                        </div>
                        {isThisChosen && (
                          <span className="text-[10px] font-mono uppercase bg-amber-750/30 text-amber-50 px-2 py-0.5 rounded font-black">
                            DÉFIÉ
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Barre de contrôle du match suivant */}
      <div className="flex justify-center pt-2 max-w-4xl mx-auto">
        <button
          onClick={drawNewMatch}
          className="px-8 py-3.5 bg-[#1A1A1A] hover:bg-amber-500 text-white font-sans font-black text-sm rounded-2xl cursor-pointer hover:scale-102 transition-all flex items-center gap-2 shadow-md uppercase tracking-wide border border-black"
        >
          <Swords className="w-4 h-4" />
          Match Suivant ⚓
        </button>
      </div>

      {/* Loss Modal / Fenêtre de Défaite */}
      <AnimatePresence>
        {showLossModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border-4 border-black rounded-3xl max-w-sm w-full p-6 shadow-2xl relative overflow-hidden text-gray-900"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-red-500" />
              
              <div className="text-center mt-2">
                <span className="inline-block p-4 bg-red-50 rounded-full text-red-500 mb-4">
                  <AlertCircle className="w-10 h-10" />
                </span>
                
                <h3 className="font-heading text-2xl font-black text-[#1A1A1A] uppercase tracking-tighter mb-2">
                  BATAILLE FINIE !
                </h3>
                
                <p className="text-gray-500 text-xs mb-6 font-medium">
                  Votre série de victoires s'est arrêtée face aux statistiques de votre adversaire !
                </p>
                
                {/* Score display */}
                <div className="bg-[#FAFAFA] border-2 border-[#E5E7EB] rounded-2xl py-3 px-4 mb-4 flex justify-around items-center">
                  <div className="text-center">
                    <span className="text-[9px] uppercase font-mono tracking-widest text-gray-400 font-extrabold block">SÉRIE FINALE</span>
                    <span className="text-3xl font-mono font-black text-red-500">{streak}</span>
                  </div>
                  <div className="h-8 w-px bg-gray-200" />
                  <div className="text-center">
                    <span className="text-[9px] uppercase font-mono tracking-widest text-gray-400 font-extrabold block">RECORD</span>
                    <span className="text-3xl font-mono font-black text-amber-500">{bestStreak}</span>
                  </div>
                </div>

                <div className="mb-6 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                  <span className="text-[9px] text-emerald-800 font-heading font-black uppercase block tracking-wider">Primes Gagnées (500 ฿ / série)</span>
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
                      drawNewMatch();
                    }}
                    className="flex-1 py-3 px-4 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-heading font-black tracking-widest text-[10px] uppercase rounded-xl active:scale-95 transition-all text-center cursor-pointer shadow-sm border-2 border-transparent"
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

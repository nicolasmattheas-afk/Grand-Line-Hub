import React, { useState, useEffect } from "react";
import { Character } from "../types";
import { Swords, RotateCcw, HelpCircle, Trophy, User, ArrowLeftRight } from "lucide-react";

interface StatsBattleProps {
  characters: Character[];
  onUpdateBounty?: (amount: number) => void;
}

interface BattleScores {
  wins: number;
  losses: number;
  draws: number;
}

export default function StatsBattle({ characters, onUpdateBounty }: StatsBattleProps) {
  const [candidates, setCandidates] = useState<Character[]>([]);
  const [playerCard, setPlayerCard] = useState<Character | null>(null);
  const [opponentCard, setOpponentCard] = useState<Character | null>(null);
  const [chosenStat, setChosenStat] = useState<"age" | "height" | "bounty" | null>(null);
  const [reveal, setReveal] = useState<boolean>(false);
  const [result, setResult] = useState<"win" | "loss" | "draw" | null>(null);
  
  // Save scores in local usage
  const [scores, setScores] = useState<BattleScores>(() => {
    try {
      const saved = localStorage.getItem("statsBattleScores");
      return saved ? JSON.parse(saved) : { wins: 0, losses: 0, draws: 0 };
    } catch {
      return { wins: 0, losses: 0, draws: 0 };
    }
  });

  useEffect(() => {
    localStorage.setItem("statsBattleScores", JSON.stringify(scores));
  }, [scores]);

  // Filter candidates once characters are loaded
  useEffect(() => {
    if (characters && characters.length > 0) {
      const filtered = characters.filter((c) => {
        const hasAge = c.age !== null && c.age !== undefined && c.age !== "Inconnu" && !isNaN(Number(c.age)) && Number(c.age) > 0;
        const hasHeight = c.height !== null && c.height !== undefined && c.height !== "Inconnu" && !isNaN(Number(c.height)) && Number(c.height) > 0;
        const hasBounty = c.bounty !== null && c.bounty !== undefined && typeof c.bounty === "number" && c.bounty > 0;
        return hasAge && hasHeight && hasBounty;
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
      setScores((s) => ({ ...s, wins: s.wins + 1 }));
      if (onUpdateBounty) onUpdateBounty(10000);
    } else if (valA < valB) {
      setResult("loss");
      setScores((s) => ({ ...s, losses: s.losses + 1 }));
      if (onUpdateBounty) onUpdateBounty(-3000);
    } else {
      setResult("draw");
      setScores((s) => ({ ...s, draws: s.draws + 1 }));
    }
  };

  const handleResetScores = () => {
    if (confirm("Voulez-vous réinitialiser vos scores de combat ?")) {
      setScores({ wins: 0, losses: 0, draws: 0 });
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
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="bg-[#11142A]/85 backdrop-blur-md border border-white/10 rounded-2xl p-2 px-4 flex items-center gap-4 text-white">
            <div className="text-center">
              <span className="text-[9px] uppercase font-mono text-slate-400 font-bold block">Victoires</span>
              <span className="text-sm font-black text-emerald-400 leading-none">{scores.wins}</span>
            </div>
            <div className="w-px h-5 bg-white/10" />
            <div className="text-center">
              <span className="text-[9px] uppercase font-mono text-slate-400 font-bold block">Défaites</span>
              <span className="text-sm font-black text-rose-455 leading-none text-rose-400">{scores.losses}</span>
            </div>
            <div className="w-px h-5 bg-white/10" />
            <div className="text-center">
              <span className="text-[9px] uppercase font-mono text-slate-400 font-bold block">Nuls</span>
              <span className="text-sm font-black text-slate-300 leading-none">{scores.draws}</span>
            </div>
          </div>
          <button
            onClick={handleResetScores}
            className="p-2.5 bg-white/10 text-slate-300 hover:text-rose-400 hover:bg-white/20 rounded-xl transition-all cursor-pointer border border-white/10 text-xs inline-flex items-center gap-2"
            title="Reset Scores"
          >
            <RotateCcw className="w-3.5 h-3.5" />
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
                  +10 000 ฿ 
                </p>
              )}
              {result === "loss" && (
                <p className="text-rose-500 font-black font-mono text-[10px] uppercase tracking-wider pt-1 animate-pulse">
                  -3 000 ฿
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

    </div>
  );
}

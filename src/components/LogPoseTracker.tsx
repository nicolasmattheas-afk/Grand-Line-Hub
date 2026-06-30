import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Character } from "../types";
import { searchCharacters } from "../lib/search";
import { HelpCircle, RefreshCw, Search, Sparkles, Compass, HelpCircle as HelpIcon, ArrowUp, ArrowDown } from "lucide-react";
import { getNotranslateClass } from "../lib/translate";

interface LogPoseTrackerProps {
  characters: Character[];
  onUpdateBounty: (amount: number) => void;
}

export default function LogPoseTracker({ characters, onUpdateBounty }: LogPoseTrackerProps) {
  const [difficulty, setDifficulty] = useState<"facile" | "moyen" | "difficile">("moyen");
  const [targetChar, setTargetChar] = useState<Character | null>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Character[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(0);
  const [guesses, setGuesses] = useState<Character[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [showCheatHint, setShowCheatHint] = useState(false);
  const [showClue, setShowClue] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [cluePaid, setCluePaid] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  const getMaxAttempts = () => {
    if (difficulty === "facile") return 12;
    if (difficulty === "moyen") return 8;
    return 6;
  };

  const getDifficultyReward = () => {
    if (difficulty === "facile") return 2500;
    if (difficulty === "moyen") return 5000;
    return 10000;
  };

  const getDifficultyLoss = () => {
    if (difficulty === "facile") return -1000;
    if (difficulty === "moyen") return -1500;
    return -3000;
  };
  
  // Choisir un personnage mystère selon la difficulté
  const startNewGame = (selectedDiff = difficulty) => {
    if (characters.length === 0) return;
    
    // Trier par prime descendante pour l'ordre de notoriété
    const sorted = [...characters].sort((a, b) => (b.bounty || 0) - (a.bounty || 0));
    
    let pool = sorted;
    if (selectedDiff === "facile") {
      pool = sorted.slice(0, 150); // les 150 plus connus
    } else if (selectedDiff === "moyen") {
      pool = sorted.slice(150, Math.min(350, sorted.length)); // les 200 d'après
    } else {
      pool = sorted.slice(350, Math.min(650, sorted.length)); // les 300 d'après
    }

    if (pool.length === 0) pool = sorted;

    const selected = pool[Math.floor(Math.random() * pool.length)];
    setTargetChar(selected);
    setGuesses([]);
    setGameOver(false);
    setHasWon(false);
    setQuery("");
    setSuggestions([]);
    setActiveSuggestionIndex(0);
    setShowClue(false);
    setCluePaid(false);
  };

  useEffect(() => {
    if (characters.length > 0) {
      startNewGame();
    }
  }, [characters]);

  // Gérer la frappe de recherche
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim()) {
      setSuggestions(searchCharacters(val, characters));
      setActiveSuggestionIndex(0);
    } else {
      setSuggestions([]);
      setActiveSuggestionIndex(0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const currentSelection = suggestions[activeSuggestionIndex];
      if (currentSelection) {
        const alreadyGuessed = guesses.some(g => g.id === currentSelection.id);
        if (!alreadyGuessed) {
          submitGuess(currentSelection);
        }
      }
    }
  };

  // Soumettre une proposition
  const submitGuess = (char: Character) => {
    if (gameOver || guesses.some(g => g.id === char.id)) return;

    const newGuesses = [char, ...guesses]; // Ordre inverse pour voir le plus récent en haut
    setGuesses(newGuesses);
    setQuery("");
    setSuggestions([]);
    setActiveSuggestionIndex(0);

    const maxAttempts = getMaxAttempts();
    const reward = getDifficultyReward();
    const penalty = getDifficultyLoss();

    if (char.id === targetChar?.id) {
      setHasWon(true);
      setGameOver(true);
      onUpdateBounty(reward); // Récompense dynamique selon la difficulté
    } else if (newGuesses.length >= maxAttempts) {
      setHasWon(false);
      setGameOver(true);
      onUpdateBounty(penalty); // Retrait dynamique si perdu
    }
  };

  // Obtenir le statut ou les couleurs des tuiles de comparaison
  const checkAttribute = (attr: keyof Character, guessVal: any) => {
    if (!targetChar) return { status: "red", text: "" };
    const targetVal = targetChar[attr];

    const parseNumber = (val: any): number => {
      if (val === null || val === undefined) return NaN;
      if (typeof val === "number") return val;
      const str = String(val).toLowerCase().replace(/,/g, ".").trim();
      if (str === "inconnu" || str === "unknown" || str === "") return NaN;
      const match = str.match(/\d+/);
      if (match) {
        return parseInt(match[0], 10);
      }
      return NaN;
    };

    if (attr === "name") {
      const match = String(guessVal).toLowerCase() === String(targetVal).toLowerCase();
      return { status: match ? "green" : "red", text: String(guessVal) };
    }

    if (attr === "gender") {
      const match = guessVal === targetVal;
      const displayVal = guessVal === "Homme" ? "H" : "F";
      return { status: match ? "green" : "red", text: displayVal };
    }

    if (attr === "crew") {
      if (guessVal === targetVal) return { status: "green", text: String(guessVal) };
      // Proche si même affiliation générale
      if (guesses[0]?.affiliation === targetChar.affiliation) {
        return { status: "yellow", text: String(guessVal) };
      }
      return { status: "red", text: String(guessVal) };
    }

    if (attr === "devilFruit") {
      if (guessVal === targetVal) {
        return { 
          status: "green", 
          text: String(guessVal)
        };
      }
      if (guessVal !== "Aucun" && targetVal !== "Aucun") {
        return { 
          status: "yellow", 
          text: String(guessVal)
        };
      }
      return { 
        status: "red", 
        text: String(guessVal)
      };
    }

    if (attr === "haki") {
      const gHaki = guessVal as string[];
      const tHaki = targetVal as string[];
      const common = gHaki.filter(h => tHaki.includes(h));
      
      const formatHakiNames = (hakiList: string[]): string => {
        return hakiList.map((h) => {
          if (h === "Haoshoku") return "HDR";
          if (h === "Kenbunshoku") return "HDO";
          if (h === "Busoshoku") return "HDA";
          return h;
        }).join(", ");
      };

      const exact = gHaki.length === tHaki.length && common.length === gHaki.length;
      if (exact) {
        return { 
          status: "green", 
          text: gHaki.length === 0 ? "Aucun" : formatHakiNames(gHaki) 
        };
      }
      if (common.length > 0 || (gHaki.length === 0 && tHaki.length === 0)) {
        return { 
          status: "yellow", 
          text: gHaki.length === 0 ? "Aucun (Cible en a)" : `Commun: ${formatHakiNames(common)}` 
        };
      }
      return { 
        status: "red", 
        text: gHaki.length === 0 ? "Aucun" : formatHakiNames(gHaki) 
      };
    }

    if (attr === "affiliation") {
      if (guessVal === targetVal) return { status: "green", text: String(guessVal) };
      // Liens Marine <=> Gouvernement
      if (
        (guessVal === "Marine" && targetVal === "Gouvernement") ||
        (guessVal === "Gouvernement" && targetVal === "Marine")
      ) {
        return { status: "yellow", text: String(guessVal) };
      }
      return { status: "red", text: String(guessVal) };
    }

    if (attr === "originArc") {
      if (guessVal === targetVal) return { status: "green", text: String(guessVal) };
      
      const isPostTimeskip = (arc: string) => [
        "Whole Cake Island", 
        "Wano", 
        "Dressrosa", 
        "Punk Hazard", 
        "Zou", 
        "Egghead"
      ].includes(arc);

      const guessPost = isPostTimeskip(String(guessVal));
      const targetPost = isPostTimeskip(String(targetVal));
      
      const ARC_ORDER = [
        "East Blue",
        "Alabasta",
        "Skypiea",
        "Water 7",
        "Enies Lobby",
        "Thriller Bark",
        "Sabaody",
        "Impel Down",
        "Marineford",
        "Île des Hommes-Poissons",
        "Punk Hazard",
        "Dressrosa",
        "Zou",
        "Whole Cake Island",
        "Wano",
        "Egghead"
      ];

      const getArcIndex = (arc: string) => {
        const lowerArc = String(arc).toLowerCase().trim();
        if (lowerArc.includes("homme-poisson") || lowerArc.includes("hommes-poissons") || lowerArc.includes("fishman")) {
          return 9;
        }
        if (lowerArc.includes("east")) return 0;
        if (lowerArc.includes("alabasta") || lowerArc.includes("jaya")) return 1;
        if (lowerArc.includes("skypiea")) return 2;
        if (lowerArc.includes("water")) return 3;
        if (lowerArc.includes("enies") || lowerArc.includes("lobby")) return 4;
        if (lowerArc.includes("thriller")) return 5;
        if (lowerArc.includes("sabaody") || lowerArc.includes("amazon")) return 6;
        if (lowerArc.includes("impel") || lowerArc.includes("down")) return 7;
        if (lowerArc.includes("marineford")) return 8;
        if (lowerArc.includes("punk") || lowerArc.includes("hazard")) return 10;
        if (lowerArc.includes("dressrosa")) return 11;
        if (lowerArc.includes("zou")) return 12;
        if (lowerArc.includes("cake") || lowerArc.includes("pudding") || lowerArc.includes("reverie") || lowerArc.includes("rêverie")) return 13;
        if (lowerArc.includes("wano")) return 14;
        if (lowerArc.includes("egghead")) return 15;
        
        const idx = ARC_ORDER.findIndex(a => a.toLowerCase().includes(lowerArc) || lowerArc.includes(a.toLowerCase()));
        return idx !== -1 ? idx : 8;
      };

      const guessIdx = getArcIndex(String(guessVal));
      const targetIdx = getArcIndex(String(targetVal));

      const dir = guessIdx < targetIdx ? "up" : "down";

      if (guessPost === targetPost) {
        return { status: "yellow", text: String(guessVal), direction: dir }; // Même ère (avant/après l'ellipse)
      }
      return { status: "red", text: String(guessVal), direction: dir };
    }

    if (attr === "bounty") {
      if (guessVal === "Inconnu" || targetVal === "Inconnu" || guessVal === null || targetVal === null || guessVal === undefined || targetVal === undefined) {
        const match = guessVal === targetVal;
        return { status: match ? "green" : "red", text: "Inconnu" };
      }
      const gBounty = Number(guessVal);
      const tBounty = Number(targetVal);
      if (isNaN(gBounty) || isNaN(tBounty)) {
        const match = guessVal === targetVal;
        return { status: match ? "green" : "red", text: String(guessVal) };
      }
      const diff = Math.abs(gBounty - tBounty);
      
      const formatBountyValue = (val: number) => {
        if (val === 0) return "0 ฿";
        if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}B ฿`;
        if (val >= 1000000) return `${(val / 1000000).toFixed(0)}M ฿`;
        return `${val.toLocaleString("fr-FR").replace(/\u202f/g, " ")} ฿`;
      };

      if (diff === 0) return { status: "green", text: formatBountyValue(gBounty) };
      if (diff <= 500000000) {
        return { 
          status: "yellow", 
          text: formatBountyValue(gBounty), 
          direction: gBounty < tBounty ? "up" : "down" 
        };
      }
      return { 
        status: "red", 
        text: formatBountyValue(gBounty), 
        direction: gBounty < tBounty ? "up" : "down" 
      };
    }

    if (attr === "age") {
      const gAge = parseNumber(guessVal);
      const tAge = parseNumber(targetVal);

      if (isNaN(gAge) || isNaN(tAge)) {
        const match = guessVal === targetVal;
        return { status: match ? "green" : "red", text: guessVal !== null && guessVal !== undefined && guessVal !== "" ? `${guessVal}${guessVal !== "Inconnu" ? " ans" : ""}` : "Inconnu" };
      }
      const diff = Math.abs(gAge - tAge);
      
      if (diff === 0) return { status: "green", text: `${gAge} ans` };
      if (diff <= 5) return { 
        status: "yellow", 
        text: `${gAge} ans`, 
        direction: gAge < tAge ? "up" : "down" 
      };
      return { 
        status: "red", 
        text: `${gAge} ans`, 
        direction: gAge < tAge ? "up" : "down" 
      };
    }

    if (attr === "height") {
      const gHeight = parseNumber(guessVal);
      const tHeight = parseNumber(targetVal);

      if (isNaN(gHeight) || isNaN(tHeight)) {
        const match = guessVal === targetVal;
        return { status: match ? "green" : "red", text: guessVal !== null && guessVal !== undefined && guessVal !== "" ? `${guessVal}${guessVal !== "Inconnu" ? " cm" : ""}` : "Inconnu" };
      }
      const diff = Math.abs(gHeight - tHeight);
      
      if (diff === 0) return { status: "green", text: `${gHeight} cm` };
      if (diff <= 20) return { 
        status: "yellow", 
        text: `${gHeight} cm`, 
        direction: gHeight < tHeight ? "up" : "down" 
      };
      return { 
        status: "red", 
        text: `${gHeight} cm`, 
        direction: gHeight < tHeight ? "up" : "down" 
      };
    }

    if (attr === "status") {
      const match = guessVal === targetVal;
      return { status: match ? "green" : "red", text: String(guessVal) };
    }

    return { status: "red", text: String(guessVal) };
  };

  const attributeStyle = (status: string) => {
    switch (status) {
      case "green":
        return "bg-emerald-500 text-white border-2 border-emerald-600 font-black uppercase tracking-wider shadow-2xs";
      case "yellow":
        return "bg-amber-500 text-white border-2 border-amber-600 font-black uppercase tracking-wider shadow-2xs";
      case "red":
      default:
        return "bg-red-500 text-white border-2 border-red-600 font-black uppercase tracking-wider shadow-2xs";
    }
  };

  return (
    <div className="w-full max-w-none px-4 py-6 font-sans">
      <div className="text-center mb-8 relative">
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white font-heading mb-2 uppercase">
          LOG POSE TRACKER
        </h2>
        <p className="text-slate-300 max-w-lg mx-auto text-sm md:text-base font-medium">
          Trouvez l'identité du personnage mystère du jour. Vous avez <span className="font-extrabold text-[#8b5cf6]">{getMaxAttempts()} tentatives</span>. À chaque essai, profitez d'indices précieux basés sur les attributs !
        </p>

        {/* Sélecteur de Difficulté */}
        <div className="flex justify-center items-center gap-2 mt-5 max-w-xs md:max-w-sm mx-auto bg-slate-100 p-1 rounded-2xl border border-gray-200">
          <button
            onClick={() => {
              setDifficulty("facile");
              startNewGame("facile");
            }}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-heading font-black tracking-wider transition-all uppercase cursor-pointer ${
              difficulty === "facile"
                ? "bg-emerald-500 text-white shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Facile
          </button>
          <button
            onClick={() => {
              setDifficulty("moyen");
              startNewGame("moyen");
            }}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-heading font-black tracking-wider transition-all uppercase cursor-pointer ${
              difficulty === "moyen"
                ? "bg-amber-500 text-white shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Moyen
          </button>
          <button
            onClick={() => {
              setDifficulty("difficile");
              startNewGame("difficile");
            }}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-heading font-black tracking-wider transition-all uppercase cursor-pointer ${
              difficulty === "difficile"
                ? "bg-red-500 text-white shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Difficile
          </button>
        </div>

        <div className="text-center text-[10px] text-gray-500 mt-2 font-mono uppercase tracking-wider">
          {difficulty === "facile" && "⭐ Mode Facile : 12 essais • Légendes culte • +2 500 ฿ / -1 000 ฿"}
          {difficulty === "moyen" && "🔥 Mode Moyen : 8 essais • Personnages connus • +5 000 ฿ / -1 500 ฿"}
          {difficulty === "difficile" && "💀 Mode Difficile : 6 essais • Tous les pirates • +10 000 ฿ / -3 000 ฿"}
        </div>

        {/* Clue and Help cards */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
          <button
            onClick={() => {
              if (!showClue) {
                if (!cluePaid) {
                  onUpdateBounty(-1000);
                  setCluePaid(true);
                }
                setShowClue(true);
              } else {
                setShowClue(false);
              }
            }}
            className="flex items-center gap-2 text-xs font-heading font-black bg-[#1A1A1A] hover:bg-[#8b5cf6] hover:border-[#8b5cf6] border-2 border-transparent text-white uppercase tracking-widest rounded-xl px-4 py-2 hover:scale-95 transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            {showClue ? "CACHER INDICES" : cluePaid ? "VOIR INDICES LOG POSE" : "OBTENIR INDICES LOG POSE (-1 000 ฿)"}
          </button>

          <button
            onClick={() => setViewMode(viewMode === "table" ? "cards" : "table")}
            className="flex items-center gap-2 text-xs font-heading font-black bg-indigo-600 hover:bg-indigo-700 border-2 border-transparent text-white uppercase tracking-widest rounded-xl px-4 py-2 hover:scale-95 transition-all cursor-pointer force-text-white"
          >
            <span className="force-text-white">{viewMode === "table" ? "📱 VUE FICHES (MOBILE)" : "📊 VUE TABLEAU (LARGE)"}</span>
          </button>
          
          <button
            onClick={() => setShowCheatHint(!showCheatHint)}
            className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono hover:text-black font-extrabold uppercase tracking-widest transition-all cursor-pointer"
          >
            <HelpIcon className="w-3.5 h-3.5" />
            COMMENT JOUER
          </button>
        </div>

        {/* Explication mécanique */}
        <AnimatePresence>
          {showCheatHint && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-6 bg-white max-w-2xl mx-auto p-5 rounded-3xl border-2 border-[#1A1A1A] text-left text-xs text-gray-600 leading-relaxed overflow-hidden shadow-sm"
            >
              <h4 className="font-black font-heading uppercase text-sm tracking-tight text-[#1A1A1A] mb-3">SIGNIFICATION DES COULEURS :</h4>
              <ul className="space-y-2">
                <li><span className="inline-block w-4 h-4 rounded-md bg-emerald-500 mr-2 align-middle" /> <span className="font-black text-emerald-800 uppercase text-[10px] tracking-wider">Vert :</span> Correspondance exacte pour l'attribut.</li>
                <li><span className="inline-block w-4 h-4 rounded-md bg-amber-500 mr-2 align-middle" /> <span className="font-black text-amber-800 uppercase text-[10px] tracking-wider">Orange :</span> Proche (Saga identique, Âge à +/- 5 ans, Taille de +/- 20cm, Prime <span className="lowercase">de +/- 500M ฿, même affiliation mais équipage différent).</span></li>
                <li><span className="inline-block w-4 h-4 rounded-md bg-red-500 mr-2 align-middle" /> <span className="font-black text-red-800 uppercase text-[10px] tracking-wider">Rouge :</span> Aucun point commun détecté.</li>
                <li><span className="inline-flex items-center gap-1 font-mono text-gray-900 font-extrabold ml-1 uppercase">▲ / ▼</span> Indique que l'âge, la taille ou la prime de la cible est plus élevé (▲) ou plus bas (▼) que votre proposition.</li>
              </ul>
            </motion.div>
          )}

          {showClue && targetChar && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="mt-4 bg-violet-50/60 max-w-xl mx-auto p-4 rounded-xl border border-violet-200 text-left"
            >
              <h4 className="font-bold font-heading text-violet-900 flex items-center gap-2 text-sm mb-1">
                <Sparkles className="w-4 h-4 text-violet-600" />
                Indication du Log Pose :
              </h4>
              <p className="text-xs text-violet-800 leading-relaxed">
                Le personnage mystère a été introduit lors de l'arc <span className="font-mono font-bold text-violet-950 bg-violet-100 px-1.5 py-0.5 rounded">{targetChar.originArc}</span>, s'identifie comme <span className="font-bold">{targetChar.gender}</span>, et s'affilie au groupe des <span className="font-bold">{targetChar.affiliation}s</span>.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Game State Control (Win/Loss) */}
      <AnimatePresence>
        {gameOver && targetChar && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`p-6 rounded-2xl max-w-xl mx-auto mb-8 text-center border-2 ${
              hasWon 
                ? "bg-emerald-50 border-emerald-300 text-emerald-900 shadow-lg shadow-emerald-100 align-middle" 
                : "bg-red-50 border-red-300 text-red-900 shadow-lg shadow-red-100 align-middle"
            }`}
          >
            <h3 className="font-heading text-2xl font-bold mb-2">
              {hasWon ? "🎉 LOG POSE ALIGNÉ !" : "☠️ PERDU DANS LA BRUME !"}
            </h3>
            <p className="text-sm mb-4">
              {hasWon 
                ? `Félicitations, vous avez identifié ${targetChar.name} en ${guesses.length} tentative(s) ! (+${getDifficultyReward().toLocaleString("fr-FR")} ฿)`
                : `Les courants vous ont égaré. Le pirate mystère était ${targetChar.name}. (${getDifficultyLoss().toLocaleString("fr-FR")} ฿)`
              }
            </p>

            <div className="flex items-center justify-center gap-4 bg-white/70 backdrop-blur-xs p-4 rounded-xl max-w-xs mx-auto border mb-6">
              <img 
                src={targetChar.image} 
                alt={targetChar.name} 
                className="w-16 h-16 rounded-full object-cover border-2 border-amber-400"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://placehold.co/200x300/1a1a1a/ffffff?text=?";
                }}
              />
              <div className="text-left">
                <p className="font-heading font-black text-gray-900 text-lg uppercase">{targetChar.name}</p>
                <p className="text-xs text-gray-500 font-mono mt-0.5">฿ {targetChar.bounty.toLocaleString()}</p>
              </div>
            </div>

            <button
              onClick={() => startNewGame()}
              className={`font-heading font-bold text-white px-6 py-2.5 rounded-xl text-sm transition-all shadow-md flex items-center gap-2 mx-auto cursor-pointer ${
                hasWon ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              Affronter un autre mystère
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input de Proposition */}
      {!gameOver && (
        <div className="w-full mb-8 relative px-2">
          <div className="bg-white border-2 border-black focus-within:ring-2 focus-within:ring-[#8b5cf6] rounded-2xl p-2.5 flex items-center gap-2 shadow-xs transition-all">
            <Search className="w-5 h-5 text-gray-400 ml-2" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Saisissez le nom d'un personnage..."
              value={query}
              onChange={handleQueryChange}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent py-2 px-1 outline-hidden text-sm font-sans text-[#1A1A1A] border-none placeholder-gray-400"
            />
            <span className="text-xs font-mono px-3 py-1 bg-[#1A1A1A] text-white rounded-lg font-bold shrink-0">
              {getMaxAttempts() - guesses.length} essais restants
            </span>
          </div>

          {/* Menu d'Autocomplétion */}
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-30 max-h-80 overflow-y-auto divide-y divide-gray-50"
              >
                {suggestions.map((char, idx) => {
                  const alreadyGuessed = guesses.some(g => g.id === char.id);
                  const isActive = idx === activeSuggestionIndex;
                  return (
                    <button
                      key={char.id}
                      onClick={() => !alreadyGuessed && submitGuess(char)}
                      disabled={alreadyGuessed}
                      className={`w-full text-left p-3 flex items-center gap-4 transition-all ${
                        alreadyGuessed 
                          ? "opacity-40 bg-gray-50" 
                          : isActive 
                            ? "bg-violet-50 border-l-4 border-violet-500 font-bold" 
                            : "hover:bg-slate-50 cursor-pointer"
                       }`}
                    >
                      <img 
                        src={char.image} 
                        alt={char.name} 
                        className="w-10 h-10 rounded-full object-cover border"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://placehold.co/200x300/1a1a1a/ffffff?text=?";
                        }}
                      />
                      <div className="flex-1">
                        <p className={`font-heading font-bold text-gray-950 text-sm ${getNotranslateClass()}`}>{char.name}</p>
                        <p className="text-xs text-gray-500 font-mono inline-block mr-2">{char.crew}</p>
                        {char.bounty > 0 && (
                          <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-mono font-bold">
                            ฿ {char.bounty.toLocaleString("fr-FR").replace(/\u202f/g, " ")}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-heading font-medium text-[#8b5cf6]">
                        {alreadyGuessed ? "Déjà proposé" : "Sélectionner →"}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Tableau ou Fiches des Attributs Comparés */}
      {viewMode === "cards" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {guesses.map((char, index) => {
              const genderCheck = checkAttribute("gender", char.gender);
              const crewCheck = checkAttribute("crew", char.crew);
              const fruitCheck = checkAttribute("devilFruit", char.devilFruit);
              const hakiCheck = checkAttribute("haki", char.haki);
              const affiliateCheck = checkAttribute("affiliation", char.affiliation);
              const originArcCheck = checkAttribute("originArc", char.originArc);
              const bountyCheck = checkAttribute("bounty", char.bounty);
              const ageCheck = checkAttribute("age", char.age);
              const heightCheck = checkAttribute("height", char.height);
              const statusCheck = checkAttribute("status", char.status);

              return (
                <motion.div
                  key={char.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white border-2 border-black rounded-3xl p-4 shadow-sm flex flex-col gap-3 relative overflow-hidden"
                >
                  {/* Header character portrait and name */}
                  <div className="flex items-center gap-3 border-b pb-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-[10px] text-white font-mono font-black flex items-center justify-center shrink-0">
                      #{guesses.length - index}
                    </span>
                    <img 
                      src={char.image} 
                      alt={char.name} 
                      className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-350"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(char.name)}`;
                      }}
                    />
                    <div className="truncate flex-1 text-left">
                      <span className={`font-heading font-black text-gray-900 block text-sm truncate leading-tight uppercase ${getNotranslateClass()}`}>{char.name}</span>
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">{char.originArc}</span>
                    </div>
                  </div>

                  {/* Quick attribute tags grid */}
                  <div className="grid grid-cols-2 min-[420px]:grid-cols-3 gap-2 text-[11px] font-sans">
                    <div className={`p-1.5 rounded-xl border text-center font-bold flex flex-col justify-center items-center ${attributeStyle(genderCheck.status)}`}>
                      <span className="text-[9px] font-mono opacity-65 uppercase block">Sexe</span>
                      <span className="truncate block leading-tight">{genderCheck.text}</span>
                    </div>

                    <div className={`p-1.5 rounded-xl border text-center font-bold flex flex-col justify-center items-center ${attributeStyle(crewCheck.status)}`}>
                      <span className="text-[9px] font-mono opacity-65 uppercase block">Équipage</span>
                      <span className="truncate block leading-tight w-full text-center">{crewCheck.text}</span>
                    </div>

                    <div className={`p-1.5 rounded-xl border text-center font-bold flex flex-col justify-center items-center ${attributeStyle(fruitCheck.status)}`}>
                      <span className="text-[9px] font-mono opacity-65 uppercase block">Fruit</span>
                      <span className="truncate block leading-tight w-full text-center">{fruitCheck.text}</span>
                    </div>

                    <div className={`p-1.5 rounded-xl border text-center font-bold flex flex-col justify-center items-center ${attributeStyle(hakiCheck.status)}`}>
                      <span className="text-[9px] font-mono opacity-65 uppercase block">Hakis</span>
                      <span className="truncate block leading-tight w-full text-center">{hakiCheck.text}</span>
                    </div>

                    <div className={`p-1.5 rounded-xl border text-center font-bold flex flex-col justify-center items-center ${attributeStyle(affiliateCheck.status)}`}>
                      <span className="text-[9px] font-mono opacity-65 uppercase block">Affiliation</span>
                      <span className="truncate block leading-tight w-full text-center">{affiliateCheck.text}</span>
                    </div>

                    <div className={`p-1.5 rounded-xl border text-center font-bold flex flex-col justify-center items-center ${attributeStyle(originArcCheck.status)}`}>
                      <span className="text-[9px] font-mono opacity-65 uppercase block">Apparition</span>
                      <span className="truncate block leading-none w-full text-center">{originArcCheck.text}</span>
                      {originArcCheck.direction && (
                        <span className="text-[8px] font-black px-1 rounded bg-black/10 mt-0.5 leading-none shrink-0">
                          {originArcCheck.direction === "up" ? "▲ APRÈS" : "▼ AVANT"}
                        </span>
                      )}
                    </div>

                    <div className={`p-1.5 rounded-xl border text-center font-bold flex flex-col justify-center items-center ${attributeStyle(bountyCheck.status)}`}>
                      <span className="text-[9px] font-mono opacity-65 uppercase block">Prime</span>
                      <span className="font-mono truncate block leading-none w-full text-center">{bountyCheck.text}</span>
                      {bountyCheck.direction && (
                        <span className="text-[8px] font-black px-1 rounded bg-black/10 mt-0.5 leading-none shrink-0">
                          {bountyCheck.direction === "up" ? "▲ PLUS" : "▼ MOINS"}
                        </span>
                      )}
                    </div>

                    <div className={`p-1.5 rounded-xl border text-center font-bold flex flex-col justify-center items-center ${attributeStyle(ageCheck.status)}`}>
                      <span className="text-[9px] font-mono opacity-65 uppercase block">Âge</span>
                      <span className="font-mono truncate block leading-none w-full text-center">{ageCheck.text}</span>
                      {ageCheck.direction && (
                        <span className="text-[8px] font-black px-1 rounded bg-black/10 mt-0.5 leading-none shrink-0">
                          {ageCheck.direction === "up" ? "▲ PLUS" : "▼ MOINS"}
                        </span>
                      )}
                    </div>

                    <div className={`p-1.5 rounded-xl border text-center font-bold flex flex-col justify-center items-center ${attributeStyle(heightCheck.status)}`}>
                      <span className="text-[9px] font-mono opacity-65 uppercase block">Taille</span>
                      <span className="font-mono truncate block leading-none w-full text-center">{heightCheck.text}</span>
                      {heightCheck.direction && (
                        <span className="text-[8px] font-black px-1 rounded bg-black/10 mt-0.5 leading-none shrink-0">
                          {heightCheck.direction === "up" ? "▲ PLUS" : "▼ MOINS"}
                        </span>
                      )}
                    </div>

                    <div className={`p-1.5 rounded-xl border text-center font-bold flex flex-col justify-center items-center ${attributeStyle(statusCheck.status)}`}>
                      <span className="text-[9px] font-mono opacity-65 uppercase block">Statut</span>
                      <span className="truncate block leading-tight w-full text-center">{statusCheck.text}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {guesses.length === 0 && (
            <div className="p-12 text-center text-gray-400 font-sans bg-white border-2 border-black rounded-3xl">
              <Compass className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              Préparez votre Log Pose ! Proposez un pirate dans la barre ci-dessus pour lancer la recherche.
            </div>
          )}
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-3xl border-2 border-black bg-white shadow-xs">
          <table className="w-full min-w-[1300px] border-collapse table-auto text-center">
            <thead>
              <tr className="bg-[#1A1A1A] text-white">
                <th className="p-4 font-heading text-[10px] font-black tracking-widest uppercase w-56 text-left">PROPOSITION</th>
                <th className="p-4 font-heading text-[10px] font-black tracking-widest uppercase w-16">SEXE</th>
                <th className="p-4 font-heading text-[10px] font-black tracking-widest uppercase w-48">ÉQUIPAGE</th>
                <th className="p-4 font-heading text-[10px] font-black tracking-widest uppercase w-48">FRUIT DU DÉMON</th>
                <th className="p-4 font-heading text-[10px] font-black tracking-widest uppercase w-44">HAKIS</th>
                <th className="p-4 font-heading text-[10px] font-black tracking-widest uppercase w-40">AFFILIATION</th>
                <th className="p-4 font-heading text-[10px] font-black tracking-widest uppercase w-44">APPARITION</th>
                <th className="p-4 font-heading text-[10px] font-black tracking-widest uppercase w-40">PRIME</th>
                <th className="p-4 font-heading text-[10px] font-black tracking-widest uppercase w-28">ÂGE</th>
                <th className="p-4 font-heading text-[10px] font-black tracking-widest uppercase w-28">TAILLE</th>
                <th className="p-4 font-heading text-[10px] font-black tracking-widest uppercase w-28">STATUT</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {guesses.map((char, index) => {
                  const genderCheck = checkAttribute("gender", char.gender);
                  const crewCheck = checkAttribute("crew", char.crew);
                  const fruitCheck = checkAttribute("devilFruit", char.devilFruit);
                  const hakiCheck = checkAttribute("haki", char.haki);
                  const affiliateCheck = checkAttribute("affiliation", char.affiliation);
                  const originArcCheck = checkAttribute("originArc", char.originArc);
                  const bountyCheck = checkAttribute("bounty", char.bounty);
                  const ageCheck = checkAttribute("age", char.age);
                  const heightCheck = checkAttribute("height", char.height);
                  const statusCheck = checkAttribute("status", char.status);

                  return (
                    <motion.tr
                      key={char.id}
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="border-b border-gray-50 bg-white hover:bg-slate-50/60"
                    >
                      {/* Colonne NOM */}
                      <td className="p-3 flex items-center gap-3 text-left w-56">
                        <img 
                        src={char.image} 
                        alt={char.name} 
                        className="w-9 h-9 rounded-full object-cover shrink-0 border"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://placehold.co/200x300/1a1a1a/ffffff?text=?";
                        }}
                        />
                        <div className="truncate text-left">
                          <span className={`font-heading font-black text-gray-900 block truncate text-sm ${getNotranslateClass()}`}>{char.name}</span>
                          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">{char.originArc}</span>
                        </div>
                      </td>

                      {/* SEXE (M ou F) */}
                      <td className="p-2 w-16">
                        <div className={`p-2.5 rounded-xl border text-xs font-heading font-black h-12 flex items-center justify-center text-center ${attributeStyle(genderCheck.status)}`}>
                          {genderCheck.text}
                        </div>
                      </td>

                      {/* ÉQUIPAGE */}
                      <td className="p-2 w-48">
                        <div className={`p-2.5 rounded-xl border text-xs font-heading font-bold h-12 flex items-center justify-center text-center ${attributeStyle(crewCheck.status)}`}>
                          {crewCheck.text}
                        </div>
                      </td>

                      {/* FRUIT DU DÉMON */}
                      <td className="p-2 w-48">
                        <div className={`p-2.5 rounded-xl border text-xs font-heading font-bold h-12 flex items-center justify-center text-center whitespace-pre-line leading-tight ${attributeStyle(fruitCheck.status)}`}>
                          {fruitCheck.text}
                        </div>
                      </td>

                      {/* HAKIS */}
                      <td className="p-2 w-44">
                        <div className={`p-2.5 rounded-xl border text-xs font-heading font-bold h-12 flex items-center justify-center text-center ${attributeStyle(hakiCheck.status)}`}>
                          {hakiCheck.text}
                        </div>
                      </td>

                      {/* AFFILIATION */}
                      <td className="p-2 w-40">
                        <div className={`p-2.5 rounded-xl border text-xs font-heading font-bold h-12 flex items-center justify-center text-center ${attributeStyle(affiliateCheck.status)}`}>
                          {affiliateCheck.text}
                        </div>
                      </td>

                      {/* APPARITION (ARC) */}
                      <td className="p-2 w-44">
                        <div className={`p-1 px-1.5 rounded-xl border text-xs font-heading font-bold h-12 flex flex-col items-center justify-center text-center ${attributeStyle(originArcCheck.status)}`}>
                          <span className="leading-tight">{originArcCheck.text}</span>
                          {originArcCheck.direction && (
                            <span className={`text-[9px] px-1 py-0.5 mt-0.5 rounded font-sans font-black flex items-center gap-0.5 leading-none shrink-0 ${
                              originArcCheck.status === "yellow"
                                ? "bg-amber-700/40 text-amber-50"
                                : originArcCheck.direction === "up"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : "bg-red-50 text-red-800 border border-red-200"
                            }`}>
                              {originArcCheck.direction === "up" ? "▲ APRÈS" : "▼ AVANT"}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* PRIME (BOUNTY) */}
                      <td className="p-2">
                        <div className={`p-1 px-1.5 rounded-xl border text-xs font-mono font-bold h-12 flex flex-col items-center justify-center text-center ${attributeStyle(bountyCheck.status)}`}>
                          <span className="leading-tight">{bountyCheck.text}</span>
                          {bountyCheck.direction && (
                            <span className={`text-[9px] px-1 py-0.5 mt-0.5 rounded font-sans font-black flex items-center gap-0.5 leading-none shrink-0 ${
                              bountyCheck.status === "yellow"
                                ? "bg-amber-700/40 text-amber-50"
                                : bountyCheck.direction === "up"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : "bg-red-50 text-red-800 border border-red-200"
                            }`}>
                              {bountyCheck.direction === "up" ? "▲ PLUS" : "▼ MOINS"}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* ÂGE */}
                      <td className="p-2 w-28">
                        <div className={`p-1 px-1.5 rounded-xl border text-xs font-mono font-bold h-12 flex flex-col items-center justify-center text-center ${attributeStyle(ageCheck.status)}`}>
                          <span className="leading-tight">{ageCheck.text}</span>
                          {ageCheck.direction && (
                            <span className={`text-[9px] px-1 py-0.5 mt-0.5 rounded font-sans font-black flex items-center gap-0.5 leading-none shrink-0 ${
                              ageCheck.status === "yellow"
                                ? "bg-amber-700/40 text-amber-50"
                                : ageCheck.direction === "up"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : "bg-red-50 text-red-800 border border-red-200"
                            }`}>
                              {ageCheck.direction === "up" ? "▲ PLUS" : "▼ MOINS"}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* TAILLE */}
                      <td className="p-2 w-28">
                        <div className={`p-1 px-1.5 rounded-xl border text-xs font-mono font-bold h-12 flex flex-col items-center justify-center text-center ${attributeStyle(heightCheck.status)}`}>
                          <span className="leading-tight">{heightCheck.text}</span>
                          {heightCheck.direction && (
                            <span className={`text-[9px] px-1 py-0.5 mt-0.5 rounded font-sans font-black flex items-center gap-0.5 leading-none shrink-0 ${
                              heightCheck.status === "yellow"
                                ? "bg-amber-700/40 text-amber-50"
                                : heightCheck.direction === "up"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : "bg-red-50 text-red-800 border border-red-200"
                            }`}>
                              {heightCheck.direction === "up" ? "▲ PLUS" : "▼ MOINS"}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* STATUT */}
                      <td className="p-2 w-24">
                        <div className={`p-2.5 rounded-xl border text-xs font-heading font-bold h-12 flex items-center justify-center text-center ${attributeStyle(statusCheck.status)}`}>
                          {statusCheck.text}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>

              {guesses.length === 0 && (
                <tr>
                  <td colSpan={11} className="p-12 text-center text-gray-400 font-sans">
                    <Compass className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    Préparez votre Log Pose ! Proposez un pirate dans la barre ci-dessus pour lancer la recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

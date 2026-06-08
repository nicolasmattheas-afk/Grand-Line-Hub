import React, { useState, useEffect, useRef } from "react";
import { Character } from "../types";
import { Search, RotateCcw, HelpCircle, Coins, Plus, X, Check, ShieldCheck, ShieldAlert, Sparkles, User } from "lucide-react";

interface BountyTargetGameProps {
  characters: Character[];
  onUpdateBounty?: (amount: number) => void;
}

export default function BountyTargetGame({ characters, onUpdateBounty }: BountyTargetGameProps) {
  const [bountyPool, setBountyPool] = useState<Character[]>([]);
  const [gameSize, setGameSize] = useState<5 | 10 | 15>(5);
  const [earnedBounty, setEarnedBounty] = useState<number>(0);

  // Secret characters and final target
  const [secretChars, setSecretChars] = useState<Character[]>([]);
  const [targetBounty, setTargetBounty] = useState<number>(0);
  
  // Player selection (at most gameSize)
  const [selectedChars, setSelectedChars] = useState<(Character | null)[]>(Array(5).fill(null));
  
  // Search component state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(-1);
  const [contractScore, setContractScore] = useState<number | null>(null);
  
  // Verification state
  const [verificationResult, setVerificationResult] = useState<"win" | "high" | "low" | null>(null);
  const [hasChecked, setHasChecked] = useState<boolean>(false);
  
  // Local notification state
  const [localToast, setLocalToast] = useState<{ message: string; type: "error" | "success" | "info" | "warning" } | null>(null);
  const showLocalToast = (message: string, type: "error" | "success" | "info" | "warning" = "info") => {
    setLocalToast({ message, type });
    setTimeout(() => {
      setLocalToast(prev => prev && prev.message === message ? null : prev);
    }, 4500);
  };

  const searchContainerRef = useRef<HTMLDivElement>(null);

  const changeSize = (newSize: 5 | 10 | 15) => {
    setGameSize(newSize);
    if (bountyPool.length >= newSize) {
      generateNewContract(newSize);
    }
  };

  // Filter pool to characters with a strictly positive bounty
  useEffect(() => {
    if (characters && characters.length > 0) {
      const filtered = characters.filter(
        (c) => typeof c.bounty === "number" && c.bounty > 0
      );
      setBountyPool(filtered);
    }
  }, [characters]);

  // Reset active suggestion index when query shifts
  useEffect(() => {
    setActiveSuggestionIndex(-1);
  }, [searchQuery]);

  // Handle click outside suggestions to close them
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Generate target
  const generateNewContract = (size: 5 | 10 | 15 = gameSize) => {
    if (bountyPool.length < size) return;

    // Adjust target bounty contract sizes so they are appropriately high and challenging
    // 15 characters should be up to 45 billion. 10 characters should be high too.
    let minBounty = 0;
    if (size === 5) {
      // 5 characters with high bounties, e.g. at least 150M each, averaging around 1.5B each (total ~5B-10B)
      minBounty = 150000000;
    } else if (size === 10) {
      // 10 characters with high bounties, e.g. at least 300M each, averaging around 1.8B each (total ~15B-25B)
      minBounty = 300000000;
    } else if (size === 15) {
      // 15 characters with very high bounties, e.g. at least 800M each, averaging around 2.5B each (total ~35B-45B)
      minBounty = 800000000;
    }

    let targetPool = bountyPool.filter(c => c.bounty >= minBounty);
    if (targetPool.length < size) {
      targetPool = bountyPool.filter(c => c.bounty >= 50000000); // fallback to 50M
    }
    if (targetPool.length < size) {
      targetPool = [...bountyPool];
    }

    // Secretly pick `size` distinct random characters
    const selected: Character[] = [];
    const tmpPool = [...targetPool];
    
    for (let i = 0; i < size; i++) {
      const randIdx = Math.floor(Math.random() * tmpPool.length);
      selected.push(tmpPool[randIdx]);
      tmpPool.splice(randIdx, 1);
    }

    const sum = selected.reduce((acc, c) => acc + c.bounty, 0);
    
    setSecretChars(selected);
    setTargetBounty(sum);
    setSelectedChars(Array(size).fill(null));
    setSearchQuery("");
    setShowSuggestions(false);
    setVerificationResult(null);
    setHasChecked(false);
    setContractScore(null);
    setEarnedBounty(0);
    setActiveSuggestionIndex(-1);
  };

  // Generate initial target when pool is parsed
  useEffect(() => {
    if (bountyPool.length >= gameSize && targetBounty === 0) {
      generateNewContract(gameSize);
    }
  }, [bountyPool, gameSize]);

  // Handle selection of a character
  const handleSelectCharacter = (char: Character) => {
    // Check if already selected
    if (selectedChars.some((c) => c && c.id === char.id)) {
      showLocalToast("Ce pirate fait déjà partie de vos suspects dans ce contrat !", "error");
      return;
    }

    // Find the first empty slot
    const firstEmptyIndex = selectedChars.indexOf(null);
    if (firstEmptyIndex === -1) {
      showLocalToast(`Vous avez déjà sélectionné ${gameSize} suspects ! Veuillez valider votre contrat.`, "info");
      return;
    }

    const newSelected = [...selectedChars];
    newSelected[firstEmptyIndex] = char;
    setSelectedChars(newSelected);
    setSearchQuery("");
    setShowSuggestions(false);
    
    // Auto-verify if all characters selected
    if (newSelected.filter(Boolean).length === gameSize) {
      handleVerify(newSelected);
    } else {
      setHasChecked(false);
      setVerificationResult(null);
      setContractScore(null);
      setEarnedBounty(0);
    }
  };

  // Prevent removals completely (empty operations as selection can never be removed)
  const handleRemoveCharacter = (index: number) => {
    // Left empty since character cannot be removed after choice as requested:
    // "après avoir sélectionner 1 personnages on ne puisse plus le retirer"
  };

  // Verify
  const handleVerify = (customSelected?: (Character | null)[]) => {
    const listToCheck = customSelected || selectedChars;
    const activeCount = listToCheck.filter(Boolean).length;
    if (activeCount < gameSize) return;

    const playerSum = listToCheck.reduce((acc, c) => acc + (c ? c.bounty : 0), 0);

    setHasChecked(true);
    
    // Scoring based on proximity
    const difference = Math.abs(playerSum - targetBounty);
    let finalScore = 0;
    if (difference === 0) {
      finalScore = 100;
      setVerificationResult("win");
    } else {
      const proximityRatio = difference / targetBounty;
      finalScore = Math.max(0, Math.floor((1 - proximityRatio) * 100));
      setVerificationResult(playerSum > targetBounty ? "high" : "low");
    }
    setContractScore(finalScore);

    let perfectReward = 10000;
    if (gameSize === 10) {
      perfectReward = 15000;
    } else if (gameSize === 15) {
      perfectReward = 20000;
    }

    const reward = finalScore === 100 ? perfectReward : finalScore >= 80 ? Math.floor((finalScore / 100) * perfectReward) : 0;
    setEarnedBounty(reward);

    if (onUpdateBounty && reward > 0) {
      onUpdateBounty(reward);
    }
  };

  // Live sum
  const currentPlayerSum = selectedChars.reduce((acc, c) => acc + (c ? c.bounty : 0), 0);

  // Auto-complete suggestion source
  const searchResults = searchQuery.trim() !== "" 
    ? bountyPool.filter((c) => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.crew.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 10)
    : [];

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (searchResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => 
        prev < searchResults.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => 
        prev > 0 ? prev - 1 : searchResults.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const targetIndex = activeSuggestionIndex >= 0 ? activeSuggestionIndex : 0;
      const chosenChar = searchResults[targetIndex];
      if (chosenChar) {
        const isAlreadySelected = selectedChars.some((c) => c && c.id === chosenChar.id);
        if (!isAlreadySelected) {
          handleSelectCharacter(chosenChar);
        } else {
          showLocalToast("Ce pirate fait déjà partie de vos suspects dans ce contrat !", "error");
        }
      }
    }
  };

  const getCharImage = (char: Character) => {
    if (!char.image) return "https://placehold.co/200x300/1a1a1a/ffffff?text=?";
    if (char.image.startsWith("http")) return char.image;
    return "https://oparchive.com" + char.image;
  };

  const formatBounty = (val: number) => {
    return val.toLocaleString("en-US").replace(/,/g, " ");
  };

  if (bountyPool.length < gameSize) {
    return (
      <div className="bg-white border border-gray-150 rounded-3xl p-8 text-center max-w-xl mx-auto shadow-xs">
        <Coins className="w-12 h-12 text-violet-500 mx-auto mb-4" />
        <h3 className="font-heading font-black text-xl text-gray-800 uppercase">Avis de recherche en cours de tri...</h3>
        <p className="text-sm text-gray-500 mt-2 font-mono">
          Veuillez patienter pendant le chargement des primes de la Marine.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans relative">
      
      {/* Toast de notification flottant */}
      {localToast && (
        <div 
          onClick={() => setLocalToast(null)}
          className={`fixed top-6 right-6 z-50 max-w-md p-4 rounded-2xl shadow-2xl border flex items-center gap-3 cursor-pointer select-none transition-all duration-300 transform translate-y-0 active:scale-95 ${
            localToast.type === "error" 
              ? "bg-red-900/90 border-red-500 text-white" 
              : localToast.type === "warning"
                ? "bg-amber-900/90 border-amber-500 text-white"
                : "bg-slate-900/95 border-violet-500 text-white"
          }`}
        >
          <span className="text-lg">
            {localToast.type === "error" ? "💀" : localToast.type === "warning" ? "⚠️" : "⚓"}
          </span>
          <p className="text-xs font-heading font-black tracking-wide uppercase leading-snug">
            {localToast.message}
          </p>
        </div>
      )}
      
      {/* Page Title & Description */}
      <div className="text-center mb-6 relative">
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white font-heading mb-2 uppercase">
          Le Compte est Bon !
        </h2>
        <p className="text-slate-300 max-w-2xl mx-auto text-sm md:text-base font-medium">
          Retrouvez exactement le montant total de la prime cible de la Marine en associant judicieusement les têtes de <span className="text-amber-400 font-bold">{gameSize}</span> pirates !
        </p>

        {/* Format Selection & New Contract triggers */}
        <div className="flex flex-col items-center justify-center gap-3 bg-[#11142A]/85 p-4 rounded-3xl max-w-xl mx-auto border border-white/10 mt-4 text-white">
          <span className="text-xs font-mono font-black uppercase text-slate-300 tracking-wider">
            Format de la Chasse :
          </span>
          <div className="grid grid-cols-3 gap-2 w-full">
            {[5, 10, 15].map((size) => {
              const isActive = gameSize === size;
              const bAmount = size === 5 ? "10 000" : size === 10 ? "15 000" : "20 000";
              const isLocked = selectedChars.filter(Boolean).length > 0 && !hasChecked;
              return (
                <button
                  key={size}
                  onClick={() => !isLocked && changeSize(size as 5 | 10 | 15)}
                  disabled={isLocked}
                  className={`py-2.5 px-3 rounded-xl border transition-all ${
                    isActive
                      ? "bg-amber-400 border-amber-400 text-slate-950 font-black shadow-sm"
                      : isLocked
                        ? "opacity-50 cursor-not-allowed bg-slate-800/50 border-slate-700 text-slate-500 font-bold"
                        : "bg-white/5 border-white/10 hover:border-white/30 text-white font-bold hover:bg-white/15 cursor-pointer"
                  } text-xs uppercase flex flex-col items-center gap-1`}
                >
                  <span>{size} Pirates</span>
                  <span className={`text-[9px] font-mono ${isActive ? "text-slate-950 block" : "text-amber-400 block"}`}>
                    ★ {bAmount} ฿
                  </span>
                </button>
              );
            })}
          </div>
          {selectedChars.filter(Boolean).length > 0 && !hasChecked && (
            <p className="text-[10px] text-amber-500 font-medium text-center">
              ⚠️ Finissez le contrat en cours ou réinitialisez-le pour changer de format !
            </p>
          )}

          <div className="flex justify-center mt-1">
            <button
              onClick={() => generateNewContract(gameSize)}
              className="px-4 py-2 bg-white/10 hover:bg-amber-400 hover:text-slate-950 text-white rounded-xl transition-all cursor-pointer border border-white/10 inline-flex items-center gap-2 text-xs font-heading font-black"
            >
              <RotateCcw className="w-3.5 h-3.5" /> NOUVEAU CONTRAT
            </button>
          </div>
        </div>
      </div>

      {/* Target display block */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 text-center relative overflow-hidden shadow-xl border-4 border-[#1A1A1A]">
        {/* Decorative background logo */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
          <Coins className="w-96 h-96" />
        </div>

        <div className="relative space-y-2">
          <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-black px-3 py-1 bg-amber-400/10 rounded-full inline-block">
            CONTRAT DE CHASSE CIBLE
          </span>
          <h1 className="text-3xl md:text-5xl font-black font-heading tracking-tight text-white uppercase mt-2">
            {formatBounty(targetBounty)} ฿
          </h1>
          <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
            Ce montant est l'addition exacte de la prime de {gameSize} suspects mystères. Retrouvez-les parmi la base de données de la Marine !
          </p>
        </div>
      </div>

      {/* Card Slots block - Player's active selections */}
      <div className="space-y-4">
        <h3 className="font-heading font-black text-sm text-[#1A1A1A] uppercase tracking-wider text-center flex items-center justify-center gap-2">
          🎯 VOS {gameSize} SUSPECTS RECRUTÉS
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {selectedChars.map((char, index) => {
            if (!char) {
              return (
                <div
                  key={index}
                  className="bg-[#FAFAFA] border-2 border-dashed border-gray-300 rounded-2xl p-4 flex flex-col items-center justify-center text-center min-h-[220px] transition-all hover:bg-slate-50/50"
                >
                  <div className="w-10 h-10 bg-white rounded-full border border-gray-200/60 shadow-xs flex items-center justify-center text-gray-300 mb-2 font-heading font-black text-sm">
                    {index + 1}
                  </div>
                  <span className="text-[10px] sm:text-xs font-heading font-black text-gray-400 uppercase tracking-widest block">
                    Emplacement Libre
                  </span>
                  <p className="text-[9px] text-gray-400 font-mono mt-1 max-w-[135px] mx-auto leading-normal">
                    Recherchez un suspect.
                  </p>
                </div>
              );
            }

            return (
              <div
                key={char.id}
                className="bg-white border-2 border-[#1A1A1A] rounded-2xl p-3 shadow-md flex flex-col justify-between items-stretch min-h-[220px] relative transition-transform hover:-translate-y-1 animate-in zoom-in-95 duration-200"
              >
                {/* Locked suspect banner */}
                <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-slate-900 text-white font-mono text-[7px] sm:text-[8px] rounded uppercase font-black flex items-center gap-0.5 shadow-xs border border-black">
                  🔒 Suspect {index + 1}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5 mt-3">
                    <span className="text-[8px] font-mono text-gray-400 font-bold block truncate max-w-[55%]">
                      {char.crew === "Inconnu" ? "Sans équipage" : char.crew}
                    </span>
                    <span className="px-1 py-0.5 bg-yellow-50 text-yellow-750 border border-yellow-100 rounded text-[7px] font-mono font-black uppercase">
                      {char.affiliation}
                    </span>
                  </div>

                  {/* Character image frame */}
                  <div className="h-24 sm:h-28 rounded-lg overflow-hidden bg-slate-100 mb-2 border border-gray-200">
                    <img
                      src={getCharImage(char)}
                      alt={char.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(char.name)}`;
                      }}
                    />
                  </div>

                  <h4 className="font-heading font-black text-gray-950 text-xs leading-tight text-center uppercase truncate">
                    {char.name}
                  </h4>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 text-center bg-slate-50 rounded-lg p-1.5">
                  <span className="text-[8px] font-mono uppercase text-gray-400 font-black block leading-none">
                    PRIME CONFIRMÉE
                  </span>
                  <span className="text-xs sm:text-sm font-heading font-black text-amber-600 block mt-0.5 tracking-tight">
                    {formatBounty(char.bounty)} ฿
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sum Indicator & Search action section */}
      <div className="bg-white border-2 border-[#1A1A1A] rounded-3xl p-6 md:p-8 shadow-md grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Search Engine field */}
        <div className="md:col-span-8 space-y-2 relative" ref={searchContainerRef}>
          <label className="text-xs uppercase font-mono tracking-widest text-[#1A1A1A] font-black block">
            🔍 RECHERCHER ET ASSIGNER DES SUSPECTS
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Saisissez le nom d'un pirate..."
              className="w-full bg-[#F9FAFB] border-2 border-slate-200 focus:border-[#1A1A1A] rounded-2xl py-3 px-4 pr-10 text-sm font-sans text-[#1A1A1A] outline-none transition-all font-semibold"
            />
            <Search className="w-5 h-5 text-gray-400 absolute right-4 top-3.5 pointer-events-none" />
          </div>

          {/* Autosearching dropdown list */}
          {showSuggestions && searchQuery.trim() !== "" && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white border-2 border-[#1A1A1A] rounded-2xl shadow-2xl overflow-hidden z-25 max-h-[280px] overflow-y-auto divide-y divide-gray-100 z-50 animate-in slide-in-from-top-2 duration-150">
              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs font-mono text-gray-400 uppercase">
                  Aucun pirate ne correspond à ce nom.
                </div>
              ) : (
                searchResults.map((char, index) => {
                  const isAlreadySelected = selectedChars.some((c) => c && c.id === char.id);
                  const isActive = index === activeSuggestionIndex;
                  return (
                    <div
                      key={char.id}
                      onClick={() => {
                        if (!isAlreadySelected) {
                          handleSelectCharacter(char);
                        }
                      }}
                      className={`p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                        isAlreadySelected 
                          ? "bg-slate-50 cursor-not-allowed" 
                          : isActive
                            ? "bg-violet-50/70 border-l-4 border-violet-500 pl-2.5 font-bold"
                            : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={getCharImage(char)}
                          alt={char.name}
                          className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0 bg-slate-100"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(char.name)}`;
                          }}
                        />
                        <div>
                          <span className={`text-xs font-heading font-black block leading-none uppercase ${isAlreadySelected ? "text-gray-400" : "text-gray-900"}`}>
                            {char.name}
                          </span>
                          <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block mt-0.5">
                            {char.crew === "Inconnu" ? "Sans équipage" : char.crew}
                          </span>
                        </div>
                      </div>

                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-black uppercase ${
                        isAlreadySelected 
                          ? "bg-gray-100 text-gray-400" 
                          : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      }`}>
                        {isAlreadySelected ? "Déjà mis" : isActive ? "⏎ Valider" : "+ Assigner"}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Calculated comparison counter */}
        <div className="md:col-span-4 bg-slate-50 border border-slate-150 rounded-2xl p-4 text-center space-y-1.5 self-stretch flex flex-col justify-center">
          <span className="text-[9.5px] uppercase font-mono text-gray-450 font-black block font-bold">
            SOMME DE VOS CHOIX ({selectedChars.filter(Boolean).length}/{gameSize})
          </span>
          <span className="text-xl font-heading font-black text-gray-900 block tracking-tight">
            {formatBounty(currentPlayerSum)} ฿
          </span>

          {currentPlayerSum > 0 && (
            <div className="text-xs font-mono font-bold py-1 px-2.5 rounded-lg bg-white border border-slate-200 inline-block mx-auto">
              <span className="text-gray-400">Écart : </span>
              <span className={currentPlayerSum === targetBounty ? "text-emerald-600 font-extrabold" : currentPlayerSum > targetBounty ? "text-rose-600 font-extrabold" : "text-amber-600 font-extrabold"}>
                {currentPlayerSum === targetBounty ? "0 ฿" : (currentPlayerSum > targetBounty ? `+${formatBounty(currentPlayerSum - targetBounty)}` : `-${formatBounty(targetBounty - currentPlayerSum)}`)} ฿
              </span>
            </div>
          )}
          
          {/* Target comparison live state indicator */}
          <div className="pt-1 flex justify-center">
            {currentPlayerSum > 0 && (
              <span className={`px-2 py-0.5 text-[8px] font-mono font-black rounded uppercase tracking-wider ${
                currentPlayerSum === targetBounty
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  : currentPlayerSum > targetBounty
                    ? "bg-rose-50 text-rose-600 border border-rose-100"
                    : "bg-yellow-50 text-yellow-600 border border-yellow-100 text-yellow-750"
              }`}>
                {currentPlayerSum === targetBounty ? "Exactement le compte !" : currentPlayerSum > targetBounty ? "Budget dépassé !" : "En dessous de la cible"}
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Live Checker Results & absolute overlay popup modal */}
      <div className="flex flex-col items-center gap-4">
        
        {/* Absolute overlay popup for modal results window */}
        {hasChecked && contractScore !== null && (
          <div className="fixed inset-0 bg-[#1A1A1A]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white border-3 border-[#1A1A1A] rounded-3xl max-w-lg w-full p-6 md:p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
              
              {/* Crown/Banner style emblem */}
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-md border-2 border-white ${
                contractScore === 100 
                  ? "bg-emerald-500 text-white" 
                  : contractScore >= 95 
                    ? "bg-teal-500 text-white" 
                    : contractScore >= 80 
                      ? "bg-yellow-500 text-black" 
                      : "bg-rose-500 text-white"
              }`}>
                {contractScore === 100 ? (
                  <ShieldCheck className="w-9 h-9" />
                ) : (
                  <Sparkles className="w-9 h-9" />
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-black block">
                  📜 CONTRAT COMPLÉTÉ & ÉVALUÉ
                </span>
                <h3 className="font-heading font-black text-2xl text-gray-900 uppercase">
                  Résultat de la Chasse
                </h3>
              </div>

              {/* Score circle */}
              <div className="bg-slate-50 border border-slate-150 py-4 px-6 rounded-2xl max-w-xs mx-auto text-center space-y-1">
                <span className="text-[9px] font-mono text-gray-400 uppercase block font-bold">
                  SCORE DE PRÉCISION
                </span>
                <span className="text-4xl font-heading font-black text-[#1A1A1A] block">
                  {contractScore} <span className="text-lg text-gray-500">/ 100 PTS</span>
                </span>
                {earnedBounty > 0 ? (
                  <span className="text-emerald-500 font-black font-mono text-[11px] uppercase tracking-wider block pt-1 animate-pulse" style={{ textShadow: "none" }}>
                    +{earnedBounty.toLocaleString("fr-FR").replace(/\u202f/g, " ")} ฿ Prime gagnée !
                  </span>
                ) : (
                  <span className="text-rose-500 font-zinc font-mono text-[11px] uppercase tracking-wider block pt-1">
                    Précision insuffisante (&lt; 80%) pour remporter la prime.
                  </span>
                )}
              </div>

              {/* Comparison detail values */}
              <div className="grid grid-cols-3 gap-2 text-xs font-mono max-w-md mx-auto p-3 bg-slate-50 border border-slate-105 border-slate-100 rounded-xl animate-in zoom-in-95">
                <div>
                  <span className="text-gray-400 block uppercase text-[8px] font-bold">CIBLE</span>
                  <span className="text-[#1A1A1A] font-extrabold text-[11px] sm:text-[12px] block mt-1 truncate">
                    {formatBounty(targetBounty)} ฿
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block uppercase text-[8px] font-bold">VOS CHOIX</span>
                  <span className={`font-extrabold text-[11px] sm:text-[12px] block mt-1 truncate ${contractScore === 100 ? "text-emerald-600 font-extrabold" : "text-rose-600"}`}>
                    {formatBounty(selectedChars.reduce((acc, c) => acc + (c ? c.bounty : 0), 0))} ฿
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block uppercase text-[8px] font-bold">DIFFÉRENCE</span>
                  <span className={`font-extrabold text-[11px] sm:text-[12px] block mt-1 truncate ${currentPlayerSum === targetBounty ? "text-emerald-600" : currentPlayerSum > targetBounty ? "text-rose-600" : "text-amber-600"}`}>
                    {currentPlayerSum === targetBounty ? "0" : (currentPlayerSum > targetBounty ? `+${formatBounty(currentPlayerSum - targetBounty)}` : `-${formatBounty(targetBounty - currentPlayerSum)}`)} ฿
                  </span>
                </div>
              </div>

              <p className="text-xs font-semibold text-gray-600 leading-relaxed max-w-md mx-auto">
                {contractScore === 100 ? (
                  "Contrat de Chasse Parfait ! Vous avez déduit exactement le montant recherché par la Marine ! Un coup d'éclat légendaire !"
                ) : contractScore >= 95 ? (
                  "Extrêmement proche ! Vos suspects sont presque parfaits, vous y êtes presque !"
                ) : contractScore >= 80 ? (
                  "Bonne estimation de la prime cible ! Vos doutes et vos pistes sont intelligents, mais il reste de légers ajustements de têtes."
                ) : (
                  "La prime cible est encore lointaine de vos suspects. Testez d'autres pirates de la Marine pour un meilleur compte !"
                )}
              </p>

              {/* Play Again (Rejouer) Controls */}
              <div className="pt-2">
                <button
                  onClick={() => generateNewContract(gameSize)}
                  className="w-full py-4 px-8 bg-[#1A1A1A] hover:bg-violet-600 text-white font-sans font-black text-sm rounded-2xl cursor-pointer transition-all uppercase tracking-wide shadow-md border border-black flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4.5 h-4.5" />
                  Rejouer un contrat
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Dynamic bottom hint instead of Verify button */}
        {!hasChecked && (
          <div className="text-center py-2 max-w-md pt-2">
            <span className="px-4 py-1.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-full text-[10px] font-mono uppercase font-black tracking-wider block">
              🔒 Remplissez les {gameSize} emplacements de suspects pour finaliser le contrat
            </span>
          </div>
        )}

      </div>

    </div>
  );
}

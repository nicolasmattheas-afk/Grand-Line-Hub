import React, { useState, useEffect } from "react";
import { Character } from "../types";
import { Clock, RotateCcw, ArrowRight, ArrowDown, CheckCircle2, AlertTriangle, Play, MoveLeft, MoveRight } from "lucide-react";
import { getNotranslateClass } from "../lib/translate";

interface PirateTimelineProps {
  characters: Character[];
  onUpdateBounty?: (amount: number) => void;
}

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
  const lower = String(arc || "").toLowerCase();
  if (lower.includes("homme-poisson") || lower.includes("hommes-poissons") || lower.includes("fishman")) return 9;
  if (lower.includes("east")) return 0;
  if (lower.includes("alabasta") || lower.includes("jaya")) return 1;
  if (lower.includes("skypiea")) return 2;
  if (lower.includes("water")) return 3;
  if (lower.includes("enies") || lower.includes("lobby")) return 4;
  if (lower.includes("thriller")) return 5;
  if (lower.includes("sabaody") || lower.includes("amazon")) return 6;
  if (lower.includes("impel") || lower.includes("down")) return 7;
  if (lower.includes("marineford")) return 8;
  if (lower.includes("punk") || lower.includes("hazard")) return 10;
  if (lower.includes("dressrosa")) return 11;
  if (lower.includes("zou")) return 12;
  if (lower.includes("cake") || lower.includes("pudding") || lower.includes("reverie") || lower.includes("rêverie")) return 13;
  if (lower.includes("wano")) return 14;
  if (lower.includes("egghead")) return 15;
  
  const idx = ARC_ORDER.findIndex(a => a.toLowerCase().includes(lower) || lower.includes(a.toLowerCase()));
  return idx !== -1 ? idx : 0;
};

export default function PirateTimeline({ characters, onUpdateBounty }: PirateTimelineProps) {
  const [timelineList, setTimelineList] = useState<Character[]>([]);
  const [correctOrder, setCorrectOrder] = useState<Character[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [selectedTapIdx, setSelectedTapIdx] = useState<number | null>(null);
  const [checked, setChecked] = useState<boolean>(false);
  const [scoreMessage, setScoreMessage] = useState<string>("");
  const [scores, setScores] = useState({ plays: 0, perfectWins: 0 });
  const [gameSize, setGameSize] = useState<5 | 10 | 15>(5);

  const changeSize = (newSize: 5 | 10 | 15) => {
    setGameSize(newSize);
    if (characters && characters.length >= newSize) {
      drawNewTimeline(newSize);
    }
  };

  const handleCardTap = (index: number) => {
    if (checked) return;
    if (selectedTapIdx === null) {
      setSelectedTapIdx(index);
    } else {
      if (selectedTapIdx === index) {
        setSelectedTapIdx(null);
      } else {
        const newList = [...timelineList];
        const temp = newList[selectedTapIdx];
        newList[selectedTapIdx] = newList[index];
        newList[index] = temp;
        setTimelineList(newList);
        setSelectedTapIdx(null);
      }
    }
  };

  // Mouse event handlers for smooth drag-and-swap with mouse button held
  const handleMouseDown = (e: React.MouseEvent, index: number) => {
    if (checked) return;
    // Support standard right-click (2) as requested, and left-click (0) to ensure high compatibility
    if (e.button === 0 || e.button === 2) {
      e.preventDefault();
      setDraggedIdx(index);
      setHoveredIdx(null);
    }
  };

  const handleMouseEnter = (index: number) => {
    if (draggedIdx === null || checked) return;
    setHoveredIdx(index);
  };

  const handleMouseLeave = () => {
    if (draggedIdx === null) {
      setHoveredIdx(null);
    }
  };

  const handleMouseUpCard = (e: React.MouseEvent, index: number) => {
    if (checked) return;
    e.stopPropagation();
    if (draggedIdx !== null && draggedIdx !== index) {
      const newList = [...timelineList];
      const temp = newList[draggedIdx];
      newList[draggedIdx] = newList[index];
      newList[index] = temp;
      setTimelineList(newList);
    }
    setDraggedIdx(null);
    setHoveredIdx(null);
  };

  // Safe global fallback if the user releases the mouse click outside of any cards
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setDraggedIdx(null);
      setHoveredIdx(null);
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, []);

  const drawNewTimeline = (size: 5 | 10 | 15 = gameSize) => {
    if (characters.length < size) return;

    // Filter characters among the 700 most famous ones to have a wide pool of candidates
    const sortedFamous = [...characters].sort((a, b) => (b.bounty || 0) - (a.bounty || 0)).slice(0, 700);

    // Characters with a valid first_appearance_arc chapter number and a valid photo
    let candidates = sortedFamous.filter((c) => {
      const hasChapter = c.apparitionChapter !== null && c.apparitionChapter !== undefined;
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
      return hasChapter && hasRealPhoto;
    });

    if (candidates.length < size) {
      candidates = sortedFamous.filter((c) => c.apparitionChapter !== null && c.apparitionChapter !== undefined);
    }

    if (candidates.length < size) return;

    // Draw random characters, ensuring we NEVER have two characters with the same appearance chapter inside the game
    const selected: Character[] = [];
    
    // Shuffle candidates first for fair randomness
    const shuffledCandidates = [...candidates].sort(() => Math.random() - 0.5);

    for (const cand of shuffledCandidates) {
      if (selected.length >= size) break;
      
      const nameExists = selected.some(c => c.name === cand.name);
      const chapterExists = selected.some(c => c.apparitionChapter === cand.apparitionChapter);
      
      if (!nameExists && !chapterExists) {
        selected.push(cand);
      }
    }

    // Secondary fallback in case unique chapter constraint returned fewer than required count
    if (selected.length < size) {
      const remaining = shuffledCandidates.filter(cand => !selected.some(c => c.name === cand.name));
      for (const cand of remaining) {
        if (selected.length >= size) break;
        selected.push(cand);
      }
    }

    // Sort by Chapter number for the reference order
    const sorted = [...selected].sort((a, b) => {
      const chA = a.apparitionChapter || 0;
      const chB = b.apparitionChapter || 0;
      return chA - chB;
    });

    // Shuffle the timeline list to guarantee a puzzle (keep shuffling if it accidentally generates sorted)
    let shuffled = [...selected].sort(() => Math.random() - 0.5);
    while (
      shuffled.map((c) => c.id).join(",") === sorted.map((c) => c.id).join(",") &&
      selected.length > 1
    ) {
      shuffled = [...selected].sort(() => Math.random() - 0.5);
    }

    setTimelineList(shuffled);
    setCorrectOrder(sorted);
    setDraggedIdx(null);
    setHoveredIdx(null);
    setSelectedTapIdx(null);
    setChecked(false);
    setScoreMessage("");
  };

  useEffect(() => {
    if (characters && characters.length >= gameSize && timelineList.length === 0) {
      drawNewTimeline(gameSize);
    }
  }, [characters, gameSize]);



  const handleVerify = () => {
    if (checked || timelineList.length < gameSize) return;

    // Check if correct (by comparing IDs as they form a strict, unique order by chapter)
    let correctCount = 0;
    for (let i = 0; i < gameSize; i++) {
      if (timelineList[i].id === correctOrder[i].id) {
        correctCount += 1;
      }
    }

    setChecked(true);
    setScores((s) => ({
      plays: s.plays + 1,
      perfectWins: s.perfectWins + (correctCount === gameSize ? 1 : 0)
    }));

    let perfectReward = 10000;
    let partialRate = 1500;
    if (gameSize === 10) {
      perfectReward = 15000;
      partialRate = 1000;
    } else if (gameSize === 15) {
      perfectReward = 20000;
      partialRate = 800;
    }

    const reward = correctCount === gameSize ? perfectReward : correctCount * partialRate;
    if (reward > 0 && onUpdateBounty) {
      onUpdateBounty(reward);
    }

    if (correctCount === gameSize) {
      setScoreMessage(`Parfait ! Tout l'équipage est ordonné de manière historique ! 🏴‍☠️✨ (+${perfectReward.toLocaleString("fr-FR").replace(/\u202f/g, " ")} ฿ !)`);
    } else if (correctCount >= Math.ceil(gameSize * 0.6)) {
      setScoreMessage(`Pas mal ! ${correctCount} sur ${gameSize} sont bien positionnés. (+${reward.toLocaleString("fr-FR").replace(/\u202f/g, " ")} ฿ !)`);
    } else if (correctCount > 0) {
      setScoreMessage(`Seulement ${correctCount} bien positionné(s) sur ${gameSize}. (+${reward.toLocaleString("fr-FR").replace(/\u202f/g, " ")} ฿) Échangez encore !`);
    } else {
      setScoreMessage("Dommage, aucun personnage n'est bien positionné. Entraînez-vous ! (0 ฿)");
    }
  };

  const isCardCorrect = (idx: number) => {
    if (!checked) return null;
    return timelineList[idx].id === correctOrder[idx].id;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans" onContextMenu={(e) => e.preventDefault()}>
      
      {/* Page Title & Description */}
      <div className="text-center mb-6 relative">
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white font-heading mb-2 uppercase">
          Chronologie de l'Aventure
        </h2>
        <p className="text-slate-300 max-w-2xl mx-auto text-sm md:text-base font-medium">
          Ordonnez chronologiquement les pirates de gauche à droite selon leur chapitre de première apparition. <span className="font-bold text-violet-400">Cliquez/Touchez deux personnages</span> pour échanger leurs places, ou <span className="font-bold text-violet-400">maintenez le clic droit</span> pour les faire glisser !
        </p>

        {/* Global summary stats */}
        <div className="flex justify-center mt-4">
          <div className="bg-[#11142A]/85 backdrop-blur-md border border-white/10 rounded-2xl p-2 px-4 flex items-center gap-4 text-white">
            <div className="text-center">
              <span className="text-[9px] uppercase font-mono text-slate-400 font-bold block">Parties</span>
              <span className="text-sm font-black leading-none">{scores.plays}</span>
            </div>
            <div className="w-px h-5 bg-white/10" />
            <div className="text-center">
              <span className="text-[9px] uppercase font-mono text-slate-400 font-bold block">Sans-Faute</span>
              <span className="text-sm font-black text-emerald-400 leading-none">{scores.perfectWins}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Format Switcher */}
      <div className="flex flex-col items-center justify-center gap-3 bg-[#11142A]/85 border border-white/10 p-4 rounded-3xl max-w-xl mx-auto text-white">
        <span className="text-xs font-mono font-black uppercase text-slate-300 tracking-wider">
          Format de la Chronologie :
        </span>
        <div className="grid grid-cols-3 gap-2 w-full">
          {[5, 10, 15].map((size) => {
            const isActive = gameSize === size;
            const bAmount = size === 5 ? "10 000" : size === 10 ? "15 000" : "20 000";
            return (
              <button
                key={size}
                onClick={() => !checked && changeSize(size as 5 | 10 | 15)}
                disabled={checked}
                className={`py-2.5 px-3 rounded-xl border transition-all ${
                  isActive
                    ? "bg-amber-500 border-amber-500 text-slate-950 font-black shadow-sm"
                    : checked
                      ? "opacity-50 cursor-not-allowed bg-slate-800/50 border-slate-700 text-slate-500 font-bold"
                      : "bg-white/5 border-white/10 hover:border-white/30 text-white font-bold hover:bg-white/15 cursor-pointer"
                } text-xs uppercase flex flex-col items-center gap-1`}
              >
                <span>{size} Personnages</span>
                <span className={`text-[9px] font-mono ${isActive ? "text-slate-950 block" : "text-amber-400 block"}`}>
                  ★ {bAmount} ฿
                </span>
              </button>
            );
          })}
        </div>
        {checked && (
          <p className="text-[10px] text-amber-500 font-medium text-center">
            ⚠️ Mélangez ou lancez un nouveau défi pour changer de format !
          </p>
        )}
      </div>

      {/* Timeline Board wrapper */}
      <div className="bg-white border-2 border-[#1A1A1A] rounded-3xl p-6 md:p-8 shadow-xl space-y-8">
        
        {/* Helper instructions */}
        <div className="text-center">
          <span className="px-3 py-1 bg-slate-100 text-[#1A1A1A] border border-gray-150 rounded-full text-[10px] font-mono uppercase font-black tracking-wider inline-flex items-center gap-2">
            ◀ APPARITION PLUS ANCIENNE &nbsp;|&nbsp; APPARITION PLUS RÉCENTE ▶
          </span>
        </div>

         {/* Symmetrical Grid layout for chronological cards */}
        <div className={`grid gap-4 py-2 w-full ${
          gameSize === 5 
            ? "grid-cols-2 md:grid-cols-5" 
            : gameSize === 10
              ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-5"
              : "grid-cols-2 sm:grid-cols-3 md:grid-cols-5"
        }`}>
          {timelineList.map((char, index) => {
            const isDraggedObj = draggedIdx === index;
            const isHoveredTarget = hoveredIdx === index && draggedIdx !== index;
            const isTapped = selectedTapIdx === index;
            const correctState = isCardCorrect(index);

            return (
              <div key={char.id} className="relative w-full">
                {/* Single card frame representing a case/slot */}
                <div
                  data-timeline-idx={index}
                  onMouseDown={(e) => handleMouseDown(e, index)}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                  onMouseUp={(e) => handleMouseUpCard(e, index)}
                  onClick={() => handleCardTap(index)}
                  onContextMenu={(e) => e.preventDefault()}
                  draggable="false"
                  onDragStart={(e) => e.preventDefault()}
                  style={{
                    cursor: checked ? "default" : isDraggedObj ? "grabbing" : "pointer"
                  }}
                  className={`w-full bg-white border-3 rounded-2xl p-3 flex flex-col items-center transition-all select-none min-h-[220px] sm:min-h-[240px] relative cursor-pointer active:scale-98 ${
                    isTapped
                      ? "border-amber-500 bg-amber-50/20 ring-4 ring-amber-300 scale-102 animate-pulse"
                      : isDraggedObj 
                        ? "border-violet-500 bg-violet-50/10 ring-4 ring-violet-200 -translate-y-2 opacity-55 scale-95 border-dashed"
                        : isHoveredTarget
                          ? "border-violet-500 bg-violet-500/10 scale-102 ring-4 ring-violet-200"
                          : correctState === true
                            ? "border-emerald-500 bg-emerald-500/5 ring-4 ring-emerald-200/40"
                            : correctState === false
                              ? "border-red-500 bg-red-500/5 ring-4 ring-red-200/40"
                              : "border-[#1A1A1A] hover:border-violet-500 hover:shadow-md"
                  }`}
                >
                  {/* Card Index Slot Stamp */}
                  <span className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-slate-900 text-[11px] text-white font-mono font-black flex items-center justify-center border border-white/20 shadow-sm z-10">
                    {index + 1}
                  </span>

                  {/* Character image */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-slate-50 border border-slate-150 mb-2 sm:mb-3 mt-4 shrink-0 pointer-events-none shadow-xs">
                    <img
                      src={char.image}
                      alt={char.name}
                      className="w-full h-full object-cover"
                      draggable="false"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(char.name)}`;
                      }}
                    />
                  </div>

                  {/* Character info text */}
                  <div className="text-center flex-1 flex flex-col justify-between pointer-events-none w-full">
                    <div>
                      <span className={`font-heading font-black text-gray-900 text-[11px] sm:text-xs md:text-sm block break-words leading-tight uppercase ${getNotranslateClass()}`}>
                        {char.name}
                      </span>
                      <span className="text-[7.5px] sm:text-[8px] md:text-[9.5px] font-mono text-gray-400 block truncate mt-0.5 uppercase tracking-widest max-w-full">
                        {char.crew === "Inconnu" ? "Équipage Libre" : char.crew}
                      </span>
                    </div>

                    {/* Reveal results or question block */}
                    <div className="mt-2 text-center w-full">
                      {checked ? (
                        <div className="space-y-0.5">
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] sm:text-[10px] font-mono text-gray-700 block truncate max-w-full font-black">
                            {String(char.apparitionChapterRaw || "Inconnu")
                              .replace(/Chapter/i, "Chapitre")
                              .replace(/chapitre/i, "Chapitre")}
                          </span>
                          <span className="text-[7.5px] sm:text-[8px] text-gray-400 block truncate font-mono uppercase tracking-tight max-w-full">
                            {char.originArc}
                          </span>
                          <span className={`text-[8px] sm:text-[9px] font-bold block uppercase tracking-wider pt-0.5 ${
                            correctState ? "text-emerald-600" : "text-red-500"
                          }`}>
                            {correctState ? "✅ Correct" : "❌ Mal placé"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[8.5px] sm:text-[9.5px] px-1.5 py-0.5 bg-violet-50 text-[#8b5cf6] border border-violet-100 rounded font-mono uppercase tracking-wider block font-black">
                          Chapitre ?
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Checked validation notice */}
        {checked && (
          <div className="p-4 rounded-2xl border text-center font-sans space-y-2 max-w-lg mx-auto animate-in zoom-in-95 duration-200 bg-slate-50 border-gray-150">
            <h4 className="font-heading font-black text-sm uppercase text-gray-800">
              {scoreMessage}
            </h4>
            <p className="text-[10px] text-gray-500 font-mono uppercase mt-1">
              Le bon ordre est : {correctOrder.map(c => {
                const formattedCh = String(c.apparitionChapterRaw || "Inconnu")
                  .replace(/Chapter/i, "Chapitre")
                  .replace(/chapitre/i, "Chapitre");
                return `"${c.name}" (${formattedCh})`;
              }).join(" ➔ ")}
            </p>
          </div>
        )}

        {/* Action button bar */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-gray-100 font-bold">
          {!checked ? (
            <button
              onClick={handleVerify}
              className="px-8 py-3.5 bg-slate-900 hover:bg-[#8b5cf6] text-white font-sans font-black text-xs rounded-2xl cursor-pointer transition-colors shadow-md uppercase tracking-wider border border-black"
            >
              Vérifier la Timeline ✔
            </button>
          ) : (
            <button
              onClick={() => drawNewTimeline(gameSize)}
              className="px-8 py-3.5 bg-amber-500 hover:bg-slate-900 hover:text-white text-black font-sans font-black text-xs rounded-2xl cursor-pointer transition-colors shadow-md uppercase tracking-wider border border-black"
            >
              Nouveau Défi Chrono ⚓
            </button>
          )}
        </div>

      </div>

    </div>
  );
}

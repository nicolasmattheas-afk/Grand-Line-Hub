import React, { useState, useEffect } from "react";
import { Character } from "../types";
import { Clock, RotateCcw, ArrowRight, ArrowDown, CheckCircle2, AlertTriangle, Play, MoveLeft, MoveRight } from "lucide-react";

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

  const drawNewTimeline = () => {
    if (characters.length < 5) return;

    // Filter characters among the 500 most famous ones (sorted by bounty descending)
    const sortedFamous = [...characters].sort((a, b) => (b.bounty || 0) - (a.bounty || 0)).slice(0, 500);

    // Filter characters with recognized arcs to make it super coherent
    // and ONLY include characters who have a real, valid photo
    const candidates = sortedFamous.filter((c) => {
      const arc = c.originArc || "";
      const hasRealPhoto = c.image && 
                           c.image.trim() !== "" && 
                           !c.image.includes("placehold.co") && 
                           !c.image.includes("dicebear") && 
                           !c.image.includes("pixel-art") && 
                           !c.image.includes("?");
      return arc !== "Grand Line" && arc !== "Inconnu" && hasRealPhoto;
    });

    if (candidates.length < 5) return;

    // Draw 5 random distinct characters
    const selected: Character[] = [];
    const usedIndices = new Set<number>();
    
    while (selected.length < 5) {
      const randIdx = Math.floor(Math.random() * candidates.length);
      if (!usedIndices.has(randIdx)) {
        usedIndices.add(randIdx);
        // Ensure no duplicated names
        if (!selected.some(c => c.name === candidates[randIdx].name)) {
          selected.push(candidates[randIdx]);
        }
      }
    }

    // Reference order
    const sorted = [...selected].sort((a, b) => {
      return getArcIndex(a.originArc) - getArcIndex(b.originArc);
    });

    // Shuffle the timeline list to guarantee a puzzle (keep shuffling if it accidentally generates sorted)
    let shuffled = [...selected].sort(() => Math.random() - 0.5);
    while (
      shuffled.map((c) => c.id).join(",") === sorted.map((c) => c.id).join(",")
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
    if (characters && characters.length >= 5 && timelineList.length === 0) {
      drawNewTimeline();
    }
  }, [characters]);



  const handleVerify = () => {
    if (checked || timelineList.length < 5) return;

    // Check if correct
    let correctCount = 0;
    for (let i = 0; i < 5; i++) {
      const characterArcIndex = getArcIndex(timelineList[i].originArc);
      const referenceArcIndex = getArcIndex(correctOrder[i].originArc);
      if (characterArcIndex === referenceArcIndex) {
        correctCount += 1;
      }
    }

    setChecked(true);
    setScores((s) => ({
      plays: s.plays + 1,
      perfectWins: s.perfectWins + (correctCount === 5 ? 1 : 0)
    }));

    const reward = correctCount === 5 ? 10000 : correctCount * 1500;
    if (reward > 0 && onUpdateBounty) {
      onUpdateBounty(reward);
    }

    if (correctCount === 5) {
      setScoreMessage(`Parfait ! Tout l'équipage est ordonné de manière historique ! 🏴‍☠️✨ (+10 000 ฿ !)`);
    } else if (correctCount >= 3) {
      setScoreMessage(`Pas mal ! ${correctCount} sur 5 sont bien positionnés. (+${reward.toLocaleString("fr-FR").replace(/\u202f/g, " ")} ฿ !)`);
    } else if (correctCount > 0) {
      setScoreMessage(`Seulement ${correctCount} bien positionné(s). (+${reward.toLocaleString("fr-FR").replace(/\u202f/g, " ")} ฿) Échangez encore !`);
    } else {
      setScoreMessage("Dommage, aucun personnage n'est bien positionné. Entraînez-vous ! (0 ฿)");
    }
  };

  const isCardCorrect = (idx: number) => {
    if (!checked) return null;
    return getArcIndex(timelineList[idx].originArc) === getArcIndex(correctOrder[idx].originArc);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-sans" onContextMenu={(e) => e.preventDefault()}>
      
      {/* Page Title & Description */}
      <div className="text-center mb-10 relative">
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white font-heading mb-2 uppercase">
          Chronologie de l'Aventure
        </h2>
        <p className="text-slate-300 max-w-2xl mx-auto text-sm md:text-base font-medium">
          Ordonnez chronologiquement les pirates de gauche à droite selon leur arc de première apparition. <span className="font-bold text-violet-400">Cliquez/Touchez deux personnages</span> pour échanger leurs places, ou <span className="font-bold text-violet-400">maintenez le clic droit</span> pour les faire glisser !
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

      {/* Timeline Board wrapper */}
      <div className="bg-white border-2 border-[#1A1A1A] rounded-3xl p-6 md:p-8 shadow-xl space-y-8">
        
        {/* Helper instructions */}
        <div className="text-center">
          <span className="px-3 py-1 bg-slate-100 text-[#1A1A1A] border border-gray-150 rounded-full text-[10px] font-mono uppercase font-black tracking-wider inline-flex items-center gap-2">
            ◀ APPARITION PLUS ANCIENNE &nbsp;|&nbsp; APPARITION PLUS RÉCENTE ▶
          </span>
        </div>

         {/* Horizontal scroll cards */}
        <div className="flex flex-row items-stretch justify-start md:justify-center gap-3 sm:gap-4 py-2 overflow-x-auto no-scrollbar pb-4 w-full">
          {timelineList.map((char, index) => {
            const isDraggedObj = draggedIdx === index;
            const isHoveredTarget = hoveredIdx === index && draggedIdx !== index;
            const isTapped = selectedTapIdx === index;
            const correctState = isCardCorrect(index);

            return (
              <div key={char.id} className="flex items-center gap-2 sm:gap-3 shrink-0 w-[140px] sm:w-[170px] md:flex-1 md:max-w-[170px]">
                
                {/* Single card frame */}
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
                  className={`w-full bg-white border-3 rounded-2xl p-2.5 sm:p-3 flex flex-col items-center transition-all select-none min-h-[230px] sm:min-h-[250px] relative cursor-pointer active:scale-98 ${
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
                  {/* Card Index */}
                  <span className="absolute top-2 left-2 w-5 h-5 rounded-full bg-slate-900 text-[10px] text-white font-mono font-black flex items-center justify-center">
                    {index + 1}
                  </span>

                  {/* Character image */}
                  <div className="w-16 h-16 sm:w-20 md:w-24 sm:h-20 md:h-24 rounded-full overflow-hidden bg-slate-50 border border-slate-150 mb-2 sm:mb-3 mt-4 shrink-0 pointer-events-none">
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
                      <span className="font-heading font-black text-gray-900 text-[10px] sm:text-xs block truncate leading-tight uppercase">
                        {char.name}
                      </span>
                      <span className="text-[7.5px] sm:text-[8px] font-mono text-gray-400 block truncate mt-0.5 uppercase tracking-widest max-w-full">
                        {char.crew === "Inconnu" ? "Équipage Libre" : char.crew}
                      </span>
                    </div>

                    {/* Reveal results or question block */}
                    <div className="mt-2.5 sm:mt-3 text-center w-full">
                      {checked ? (
                        <div className="space-y-1">
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[8px] sm:text-[9px] font-mono text-gray-600 block truncate max-w-full">
                            {char.originArc}
                          </span>
                          <span className={`text-[8px] sm:text-[8.5px] font-bold block uppercase tracking-wider ${
                            correctState ? "text-emerald-600" : "text-red-500"
                          }`}>
                            {correctState ? "✅ Correct" : "❌ Mal placé"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 bg-violet-50 text-[#8b5cf6] border border-violet-100 rounded font-mono uppercase tracking-wider block">
                          Apparition ?
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Arrow indicator between elements (horizontal for both) */}
                {index < 4 && (
                  <div className="flex items-center justify-center shrink-0 text-slate-300 pointer-events-none">
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </div>
                )}
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
            <p className="text-[10px] text-gray-400 font-mono uppercase">
              Le bon ordre est : {correctOrder.map(c => `"${c.name}" (Arc ${c.originArc})`).join(" ➔ ")}
            </p>
          </div>
        )}

        {/* Action button bar */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-gray-100">
          {!checked ? (
            <button
              onClick={handleVerify}
              className="px-8 py-3.5 bg-slate-900 hover:bg-[#8b5cf6] text-white font-sans font-black text-xs rounded-2xl cursor-pointer transition-colors shadow-md uppercase tracking-wider border border-black"
            >
              Vérifier la Timeline ✔
            </button>
          ) : (
            <button
              onClick={drawNewTimeline}
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

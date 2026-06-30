import React, { useState, useEffect, useRef } from "react";
import { Character } from "../types";
import { Search, RotateCcw, HelpCircle, Sparkles, Smile, ShieldAlert } from "lucide-react";
import { searchCharacters } from "../lib/search";
import { getNotranslateClass } from "../lib/translate";

interface PirateShadowProps {
  characters: Character[];
  onUpdateBounty?: (amount: number) => void;
}

export default function PirateShadow({ characters, onUpdateBounty }: PirateShadowProps) {
  const [targetChar, setTargetChar] = useState<Character | null>(null);
  const [guessInput, setGuessInput] = useState<string>("");
  const [errors, setErrors] = useState<number>(0);
  const [guessedCorrectly, setGuessedCorrectly] = useState<boolean>(false);
  const [revealed, setRevealed] = useState<boolean>(false);
  
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State for total scores
  const [scores, setScores] = useState({ wins: 0, losses: 0 });

  // Handle click outside suggestions to close them
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Select candidates that are real, recognizable, and limited to the top 550 most famous characters
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
    
    // Scoring function to evaluate the relative knowledge of a character in the One Piece universe
    const getPopularityScore = (c: Character) => {
      let score = 0;
      
      // 1. Bounty (millions represent high pirate reputation)
      if (c.bounty) {
        score += Math.min(c.bounty / 100000, 50000); 
      }
      
      // 2. Length of description (prominent characters have longer bio pages in the DB)
      score += (c.description || "").length * 2;
      
      // 3. Haki users (highly notable figures)
      if (c.haki && c.haki.length) {
        score += c.haki.length * 1000; 
      }

      // 4. Devil Fruit users
      if (c.devilFruitName && c.devilFruitName !== "Inconnu" && c.devilFruitName !== "Aucun") {
        score += 500;
      }
      
      // 5. Affiliation boosts
      if (c.affiliation === "Marine") score += 600;
      if (c.affiliation === "Révolutionnaire") score += 800;

      // 6. High boosts for instantly recognized characters to guarantee they stay in the top 550 subset
      const nameLower = c.name.toLowerCase();
      const superFamous = [
        "luffy", "zoro", "nami", "usopp", "sanji", "chopper", "robin", "franky", "brook", "jinbe",
        "shanks", "roger", "whitebeard", "newgate", "rayleigh", "ace", "sabo", "yamato", "hancock",
        "mihawk", "crocodile", "doflamingo", "buggy", "lucci", "eneru", "enel", "bellamy",
        "law", "kid", "killer", "bonney", "bege", "hawkins", "drake", "apoo", "urouge",
        "garp", "sengoku", "sakazuki", "akainu", "borsalino", "kizaru", "kuzan", "aokiji", "issho", "fujitora",
        "ryokugyu", "coby", "koby", "smoker", "tashigi", "dragon", "ivankov", "koala",
        "katakuri", "king", "queen", "jack", "perospero", "yasopp", "beckman", "marco",
        "oden", "momonosuke", "kin'emon", "hiyori", "raizo", "nekomamushi", "inuarashi", "vivi",
        "rebecca", "shirahoshi", "hina", "bartolomeo", "cavendish", "carrot", "pudding",
        "kuma", "moria", "arlong", "don krieg", "kuro", "alvida", "helmeppo", "vinsmoke"
      ];

      for (const name of superFamous) {
        if (nameLower.includes(name)) {
          score += 25000;
        }
      }

      return score;
    };

    const scored = clean.map(c => ({ char: c, s: getPopularityScore(c) }));
    scored.sort((a, b) => b.s - a.s);
    
    // Filter to top 300 characters
    return scored.slice(0, 300).map(s => s.char);
  }, [characters]);

  const drawNewCharacter = () => {
    if (cleanCandidates.length === 0) return;

    const randomChar = cleanCandidates[Math.floor(Math.random() * cleanCandidates.length)];
    setTargetChar(randomChar);
    setGuessInput("");
    setErrors(0);
    setGuessedCorrectly(false);
    setRevealed(false);
  };

  useEffect(() => {
    if (cleanCandidates && cleanCandidates.length > 0 && !targetChar) {
      drawNewCharacter();
    }
  }, [cleanCandidates]);

  // Normalizer to make guesses forgiving
  const normalize = (val: string) => {
    return val
      .toLowerCase()
      .normalize("NFD") // split accents
      .replace(/[\u0300-\u036f]/g, "") // strip accents
      .replace(/[^a-z0-9]/g, "") // strip spaces, brackets, custom signs
      .trim();
  };

  const searchResults = guessInput.trim() !== ""
    ? searchCharacters(guessInput, cleanCandidates)
    : [];

  useEffect(() => {
    setActiveSuggestionIndex(-1);
  }, [guessInput]);

  const selectSuggestion = (chosenChar: Character) => {
    if (!targetChar || revealed) return;

    const isCorrect = chosenChar.id === targetChar.id || normalize(chosenChar.name) === normalize(targetChar.name);

    if (isCorrect) {
      setGuessedCorrectly(true);
      setRevealed(true);
      setScores((s) => ({ ...s, wins: s.wins + 1 }));
      if (onUpdateBounty) onUpdateBounty(10000); // +10k
      setGuessInput("");
      setShowSuggestions(false);
    } else {
      const nextErrors = errors + 1;
      setErrors(nextErrors);
      setGuessInput("");
      setShowSuggestions(false);

      if (nextErrors >= 3) {
        setRevealed(true);
        setScores((s) => ({ ...s, losses: s.losses + 1 }));
        if (onUpdateBounty) onUpdateBounty(-3000); // -3k
      }
    }
  };

  const verifyGuess = () => {
    if (!targetChar || revealed) return;

    const userNormalized = normalize(guessInput);
    if (!userNormalized) return;

    const officialName = targetChar.name;
    const normOfficial = normalize(officialName);

    let bracketName = "";
    const bracketMatch = officialName.match(/\[(.*?)\]/);
    if (bracketMatch) {
      bracketName = bracketMatch[1];
    }
    const normBracket = bracketName ? normalize(bracketName) : "";

    const isCorrect = 
      userNormalized === normOfficial || 
      (normBracket && userNormalized === normBracket) || 
      (normOfficial.includes(userNormalized) && userNormalized.length >= 4) ||
      (userNormalized.includes(normOfficial) && normOfficial.length >= 4);

    if (isCorrect) {
      setGuessedCorrectly(true);
      setRevealed(true);
      setScores((s) => ({ ...s, wins: s.wins + 1 }));
      if (onUpdateBounty) onUpdateBounty(10000); // +10k
      setGuessInput("");
      setShowSuggestions(false);
    } else {
      const nextErrors = errors + 1;
      setErrors(nextErrors);
      setGuessInput("");
      setShowSuggestions(false);

      if (nextErrors >= 3) {
        setRevealed(true);
        setScores((s) => ({ ...s, losses: s.losses + 1 }));
        if (onUpdateBounty) onUpdateBounty(-3000); // -3k
      }
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (searchResults.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        verifyGuess();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setShowSuggestions(true);
      setActiveSuggestionIndex((prev) => 
        prev < searchResults.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setShowSuggestions(true);
      setActiveSuggestionIndex((prev) => 
        prev > 0 ? prev - 1 : searchResults.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const indexToSelect = activeSuggestionIndex >= 0 ? activeSuggestionIndex : 0;
      if (indexToSelect >= 0 && indexToSelect < searchResults.length) {
        selectSuggestion(searchResults[indexToSelect]);
      } else {
        verifyGuess();
      }
    }
  };

  // Give progressive clues based on error list
  const getClueMessage = () => {
    if (!targetChar) return "";
    if (errors === 1) {
      return `Ce personnage est affilié à/aux : "${targetChar.crew || "Inconnu"}".`;
    }
    if (errors === 2) {
      const fruitInfo = targetChar.devilFruitName && targetChar.devilFruitName !== "Inconnu" && targetChar.devilFruitName !== "Aucun"
        ? targetChar.devilFruitName
        : "Aucun";
      const hakiInfo = targetChar.haki && targetChar.haki.length > 0
        ? targetChar.haki.map(h => {
          if (h === "Haoshoku") return "Haki des rois";
          if (h === "Kenbunshoku") return "Haki de l'observation";
          if (h === "Busoshoku") return "Haki de l'armement";
          return h;
        }).join(", ")
        : "Aucun";

      return `Indice (Compétence) : Fruit du Démon: ${fruitInfo}. Maîtrise les hakis: ${hakiInfo}`;
    }
    return "";
  };

  // Calculate blur based on the number of errors if not revealed
  const getBlurStyle = () => {
    if (revealed) return "none";
    // 0 errors -> 30px, 1 error -> 16px, 2 errors -> 7px
    const px = Math.max(5, 30 - errors * 11.5);
    return `blur(${px}px)`;
  };

  if (!targetChar) {
    return (
      <div className="bg-white border border-gray-150 rounded-3xl p-8 text-center max-w-xl mx-auto shadow-xs">
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-6 h-6 text-slate-400" />
        </div>
        <h3 className="font-heading font-black text-lg text-gray-800 uppercase">Préparatif des silhouettes</h3>
        <p className="text-xs text-gray-400 mt-1">Génération du profil...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 font-sans">
      
      {/* Page Title & Description */}
      <div className="text-center mb-10 relative text-white">
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white font-heading mb-2 uppercase">
          L'Ombre du Pirate
        </h2>
        <p className="text-slate-300 max-w-2xl mx-auto text-xs sm:text-sm font-medium">
          Identifiez le personnage mystère caché derrière la silhouette. Évitez les erreurs sous peine de révéler sa véritable identité !
        </p>

        {/* Score Simple */}
        <div className="flex justify-center mt-4">
          <div className="bg-[#11142A]/85 backdrop-blur-md border border-white/10 rounded-2xl p-2 px-4 flex items-center gap-4 text-white">
            <div className="text-center">
              <span className="text-[9px] uppercase font-mono text-slate-400 font-bold block">Réussi</span>
              <span className="text-sm font-black text-emerald-400 leading-none">{scores.wins}</span>
            </div>
            <div className="w-px h-5 bg-white/10" />
            <div className="text-center">
              <span className="text-[9px] uppercase font-mono text-slate-400 font-bold block">Échoué</span>
              <span className="text-sm font-black text-rose-455 leading-none text-rose-400">{scores.losses}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Board */}
      <div className="bg-white border-2 border-[#1A1A1A] rounded-3xl p-6 md:p-8 shadow-xl flex flex-col items-center">
        
        {/* Silhouette Visual frame styled exactly like Bounty Duel */}
        <div className="bg-[#FAF6F0] w-full max-w-sm border-4 border-[#1A1A1A] rounded-2xl p-5 shadow-md flex flex-col items-stretch mb-6">
          <div className="border border-[#dbcfc0] p-4 rounded-xl flex flex-col bg-white">
            <div className="text-center font-heading text-[#1A1A1A] tracking-tighter font-black text-3xl uppercase mb-3">
              {revealed ? "WANTED" : "SILHOUETTE"}
            </div>
            
            <div className="h-64 rounded-xl overflow-hidden border-2 border-black bg-slate-100 mb-4 relative flex items-center justify-center">
              <img
                src={targetChar.image}
                alt="Silhouetted candidate"
                style={{
                  filter: getBlurStyle(),
                  transition: revealed ? "filter 0.4s ease-out" : "none"
                }}
                className="w-full h-full object-contain select-none pointer-events-none p-2 bg-slate-100"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(targetChar.name)}`;
                }}
              />
            </div>
            
            <div className="text-center">
              <h3 className={`font-heading text-2xl font-black text-[#1A1A1A] uppercase tracking-tighter ${getNotranslateClass()}`}>
                {revealed ? targetChar?.name : "? ? ?"}
              </h3>
            </div>
          </div>
        </div>

        {/* Input Interface */}
        <div className="w-full max-w-md space-y-4" ref={containerRef}>
          
          {!revealed ? (
            <div className="space-y-3 relative">
              <label className="text-[10px] uppercase font-mono tracking-widest text-gray-400 font-bold block text-center">
                Saisissez le nom exact ou le surnom :
              </label>
              
              <div className="flex gap-2.5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={guessInput}
                    onChange={(e) => {
                      setGuessInput(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Luffy, Zoro, Kaido, Robin..."
                    className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl py-3 px-4 pr-10 text-sm font-sans text-[#1A1A1A] outline-none focus:border-[#8b5cf6] transition-all font-semibold"
                  />
                  <Search className="w-4.5 h-4.5 text-gray-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
                <button
                  onClick={verifyGuess}
                  className="px-6 py-3 bg-[#1A1A1A] hover:bg-violet-600 text-white font-sans font-black text-xs rounded-2xl cursor-pointer transition-all border border-black uppercase"
                >
                  Valider
                </button>
              </div>

              {/* Suggestions dropdown list */}
              {showSuggestions && guessInput.trim() !== "" && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white border-2 border-[#1A1A1A] rounded-2xl shadow-2xl overflow-hidden z-20 max-h-[220px] overflow-y-auto divide-y divide-gray-100 animate-in slide-in-from-top-2 duration-150">
                  {searchResults.length === 0 ? (
                    <div className="p-3 text-center text-xs font-mono text-gray-400 uppercase">
                      Aucun pirate ne correspond
                    </div>
                  ) : (
                    searchResults.map((char, index) => {
                      const isActive = index === activeSuggestionIndex;
                      return (
                        <div
                          key={char.id}
                          onClick={() => selectSuggestion(char)}
                          className={`p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                            isActive
                              ? "bg-violet-50/70 border-l-4 border-violet-500 pl-2.5 font-bold"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <img 
                              src={char.image} 
                              alt={char.name}
                              className="w-6 h-6 rounded-full object-cover border border-gray-200"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(char.name)}`;
                              }}
                            />
                            <div>
                              <span className={`text-xs font-bold text-[#1A1A1A] block ${getNotranslateClass()}`}>{char.name}</span>
                              <span className="text-[9px] font-mono text-gray-400 uppercase leading-none">{char.crew || "Inconnu"}</span>
                            </div>
                          </div>
                          
                          <span className="text-[9px] font-mono px-1.5 py-0.5 bg-violet-100 text-violet-700 border border-violet-200 rounded">
                            {isActive ? "⏎ Choisir" : "Sélectionner"}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          ) : (
            // Results screen
            <div className="text-center p-4 bg-slate-50 rounded-2xl border border-gray-150 animate-in zoom-in-95 duration-200 space-y-3">
              {guessedCorrectly ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-1 text-emerald-600 font-heading font-black text-lg uppercase">
                    <Smile className="w-5 h-5" /> EXCELLENT !
                  </div>
                  <p className="text-sm font-semibold text-gray-800 flex flex-wrap items-center justify-center gap-1">
                    C'était bien <span className={`font-heading font-black text-white bg-slate-950 px-2.5 py-0.5 rounded-lg inline-block ${getNotranslateClass()}`}>{targetChar?.name}</span> !
                  </p>
                  <p className="text-xs text-gray-500 font-mono">
                    Trouvé avec {errors} {errors === 1 ? "erreur" : "erreurs"}.
                  </p>
                  <p className="text-emerald-500 font-black font-mono text-xs uppercase tracking-wider animate-pulse pt-1">
                    +10 000 ฿ Prime augmentée !
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-1 text-red-600 font-heading font-black text-lg uppercase">
                    <ShieldAlert className="w-5 h-5" /> RECHERCHE PERDUE
                  </div>
                  <p className="text-sm font-semibold text-gray-800 flex flex-wrap items-center justify-center gap-1">
                    Le pirate s'est échappé ! C'était <span className={`font-heading font-black text-white bg-slate-950 px-2.5 py-0.5 rounded-lg inline-block ${getNotranslateClass()}`}>{targetChar?.name}</span>.
                  </p>
                  <p className="text-rose-500 font-black font-mono text-xs uppercase tracking-wider animate-pulse pt-1">
                    -3 000 ฿ Prime réduite
                  </p>
                </div>
              )}
              
              <p className="text-xs italic text-gray-500 max-w-sm mx-auto leading-relaxed">
                "{targetChar.description}"
              </p>
            </div>
          )}

          {/* Clues field */}
          {errors > 0 && !revealed && (
            <div className="p-4 bg-violet-500/5 border border-violet-500/20 rounded-2xl text-xs text-violet-800 leading-relaxed font-sans animate-in slide-in-from-bottom-2">
              <span className="font-black text-[10px] tracking-wider uppercase block text-violet-600 mb-1">
                Indice obtenu :
              </span>
              {getClueMessage()}
            </div>
          )}

        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center pt-2">
        <button
          onClick={drawNewCharacter}
          className="px-8 py-3.5 bg-slate-900 hover:bg-violet-600 text-white font-sans font-black text-sm rounded-2xl cursor-pointer transition-all flex items-center gap-2 shadow-md uppercase tracking-wide border border-black"
        >
          <RotateCcw className="w-4 h-4" />
          Nouveau Pirate Mystère
        </button>
      </div>

    </div>
  );
}

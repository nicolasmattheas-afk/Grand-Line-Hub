import React, { useState, useEffect, useMemo } from "react";
import { Character } from "../types";
import { 
  HelpCircle, RotateCcw, Award, CheckCircle2, AlertOctagon,
  Eye, CornerRightDown, Map, Compass, Sparkles, Trash2, ArrowUpDown, Users
} from "lucide-react";

interface LogicPuzzleProps {
  characters: Character[];
  onUpdateBounty?: (amount: number) => void;
}

interface Clue {
  id: string;
  text: string;
  isCrossed: boolean;
}

const formatHakiName = (hName: string): string => {
  const h = hName.toLowerCase();
  if (h.includes("kenbunshoku") || h.includes("observation")) return "haki de l'observation";
  if (h.includes("busoshoku") || h.includes("armement")) return "haki de l'armement";
  if (h.includes("haoshoku") || h.includes("rois")) return "haki des rois";
  return hName;
};

const formatHakiList = (hakisList: string[]): string => {
  if (!hakisList || hakisList.length === 0) return "Aucun";
  return hakisList.map(formatHakiName).join(", ");
};

export default function LogicPuzzle({ characters, onUpdateBounty }: LogicPuzzleProps) {
  // Grille 4x4
  const [solutionGrid, setSolutionGrid] = useState<Character[][]>([]);
  const [userGrid, setUserGrid] = useState<(Character | null)[][]>(() => 
    Array(4).fill(null).map(() => Array(4).fill(null))
  );
  const [trayCharacters, setTrayCharacters] = useState<Character[]>([]);
  const [clues, setClues] = useState<Clue[]>([]);
  
  // États de sélection et d'interaction
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [selectedSource, setSelectedSource] = useState<{ row: number; col: number } | null>(null);
  
  // États de statut du jeu
  const [isGameWon, setIsGameWon] = useState<boolean>(false);
  const [validationRequested, setValidationRequested] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [rewardClaimed, setRewardClaimed] = useState<boolean>(false);

  // Filtrer les personnages bien renseignés pour la grille logic
  const candidatePool = useMemo(() => {
    const valid = characters.filter(
      (c) => c.image && !c.image.includes("placehold.co") && !c.image.includes("Inconnu") && c.name
    );
    
    // Trier pour donner priorité aux figures plus connues afin de faciliter les thématiques d'indices
    return valid.sort((a, b) => {
      let scoreA = (a.bounty || 0) + (a.haki?.length || 0) * 50000000;
      let scoreB = (b.bounty || 0) + (b.haki?.length || 0) * 50000000;
      return scoreB - scoreA;
    }).slice(0, 400); // N'utiliser que les 400 personnages les plus connus
  }, [characters]);

  // Initialiser une nouvelle partie
  const initGame = () => {
    if (candidatePool.length < 16) return;

    // Mélanger et sélectionner 16 personnages uniques de notre pool qualitatif
    const shuffledPool = [...candidatePool].sort(() => Math.random() - 0.5);
    const selected16 = shuffledPool.slice(0, 16);

    // Bâtir la solution secrète 4x4
    const newSolution: Character[][] = Array(4).fill(null).map(() => Array(4).fill(null));
    let index = 0;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        newSolution[r][c] = selected16[index++];
      }
    }

    setSolutionGrid(newSolution);
    setUserGrid(Array(4).fill(null).map(() => Array(4).fill(null)));
    
    // Le plateau de rechange avec le mélange des cartes de départ
    setTrayCharacters([...selected16].sort(() => Math.random() - 0.5));
    
    // Reset états
    setSelectedChar(null);
    setSelectedSource(null);
    setIsGameWon(false);
    setValidationRequested(false);
    setAttempts(0);
    setRewardClaimed(false);

    // Générer la liste d'indices uniques
    const generatedClues = buildProceduralClues(newSolution);
    setClues(generatedClues);
  };

  // Lancement à l'initialisation du composant
  useEffect(() => {
    if (candidatePool.length >= 16) {
      initGame();
    }
  }, [candidatePool]);

  // Générateur d'indices algorithmiques basés sur les structures réelles de la grille
  const buildProceduralClues = (grid: Character[][]): Clue[] => {
    const helperClues: Clue[] = [];
    let clueId = 1;

    // Détermine si le personnage appartient à la Marine, au Gouvernement ou au Cipher Pol (pas d'indice de prime pour eux)
    const isExcludedFromBounty = (char: Character): boolean => {
      const aff = (char.affiliation || "").toLowerCase();
      return (
        aff.includes("marine") ||
        aff.includes("gouvernement") ||
        aff.includes("cipher") ||
        aff.includes("cp9") ||
        aff.includes("cp0") ||
        aff.includes("cp-")
      );
    };

    // Fonction d'ajout pratique
    const addClue = (text: string) => {
      helperClues.push({
        id: `clue-${clueId++}`,
        text,
        isCrossed: false
      });
    };

    // 1. INDICES DE COIN (2 indices de coins)
    const corners = [
      { r: 0, c: 0, label: "supérieur gauche" },
      { r: 0, c: 3, label: "supérieur droit" },
      { r: 3, c: 0, label: "inférieur gauche" },
      { r: 3, c: 3, label: "inférieur droit" }
    ];
    // Shuffle corners to pick 2 differences
    const shuffledCorners = [...corners].sort(() => Math.random() - 0.5);
    
    // Premier coin : Identification directe d'un personnage célèbre ou de son affiliation
    const c1 = shuffledCorners[0];
    const charC1 = grid[c1.r][c1.c];
    if (Math.random() > 0.5) {
      addClue(`Le coin ${c1.label} de la grille est occupé par ${charC1.name}.`);
    } else {
      addClue(`Le coin ${c1.label} est occupé par un personnage de l'affiliation ${charC1.affiliation}.`);
    }

    // Deuxième coin : Caractéristiques
    const c2 = shuffledCorners[1];
    const charC2 = grid[c2.r][c2.c];
    if (charC2.devilFruit && charC2.devilFruit !== "Aucun") {
      addClue(`Le personnage dans le coin ${c2.label} possède un Fruit du Démon de type ${charC2.devilFruit}.`);
    } else if (charC2.haki && charC2.haki.length > 0) {
      const formattedHak = charC2.haki.map(formatHakiName).join(" et/ou ");
      addClue(`Le personnage dans le coin ${c2.label} maîtrise le ${formattedHak}.`);
    } else {
      addClue(`Un des 4 coins de la grille est occupé par ${charC2.name}.`);
    }

    // 2. INDICES ABSOLUS (2 indices de coordonnées exactes avec caractéristiques)
    const possibleCoords: { r: number; c: number }[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        // éviter de doubler sur les coins déjà donnés
        if ((r === 0 || r === 3) && (c === 0 || c === 3)) continue;
        possibleCoords.push({ r, c });
      }
    }
    const shuffledCoords = possibleCoords.sort(() => Math.random() - 0.5);

    // Coordonnée A
    if (shuffledCoords.length > 0) {
      const coordA = shuffledCoords[0];
      const charA = grid[coordA.r][coordA.c];
      const ligneNum = coordA.r + 1;
      const colNum = coordA.c + 1;
      
      const randType = Math.random();
      if (randType < 0.33 && charA.devilFruit && charA.devilFruit !== "Aucun") {
        addClue(`Le personnage situé en Ligne ${ligneNum}, Colonne ${colNum} possède le Fruit du Démon du type ${charA.devilFruit}.`);
      } else if (randType < 0.66 && charA.bounty > 0 && !isExcludedFromBounty(charA)) {
        addClue(`Le pirate en Ligne ${ligneNum}, Colonne ${colNum} a une prime exacte de ${charA.bounty.toLocaleString()} ฿.`);
      } else {
        addClue(`L'emplacement Ligne ${ligneNum}, Colonne ${colNum} est réservé à un membre ayant l'affiliation ${charA.affiliation}.`);
      }
    }

    // Coordonnée B
    if (shuffledCoords.length > 1) {
      const coordB = shuffledCoords[1];
      const charB = grid[coordB.r][coordB.c];
      const ligneNum = coordB.r + 1;
      const colNum = coordB.c + 1;
      if (charB.haki && charB.haki.length > 0) {
        addClue(`Le résident en Ligne ${ligneNum}, Colonne ${colNum} maîtrise le ${formatHakiList(charB.haki)}.`);
      } else {
        addClue(`Le personnage situé en Ligne ${ligneNum}, Colonne ${colNum} ne possède aucun Fruit du Démon.`);
      }
    }

    // 3. INDICES DE LIGNE / COLONNE (3 indices de comptages globaux)
    const selectLineIndex = Math.floor(Math.random() * 4);
    const selectColIndex = Math.floor(Math.random() * 4);

    // Analyser la ligne sélectionnée
    const rowChars = grid[selectLineIndex];
    const rowDevilFruitCount = rowChars.filter(ch => ch.devilFruit && ch.devilFruit !== "Aucun").length;
    const rowMarineCount = rowChars.filter(ch => ch.affiliation === "Marine").length;
    const rowHaoshokuCount = rowChars.filter(ch => ch.haki && ch.haki.includes("Haoshoku")).length;

    if (rowDevilFruitCount === 0) {
      addClue(`La Ligne ${selectLineIndex + 1} ne contient aucun utilisateur de Fruit du Démon.`);
    } else if (rowHaoshokuCount > 0) {
      addClue(`La Ligne ${selectLineIndex + 1} possède exactement ${rowHaoshokuCount} master(s) du haki des rois.`);
    } else {
      addClue(`La Ligne ${selectLineIndex + 1} contient exactement ${rowMarineCount} membre(s) de la Marine.`);
    }

    // Analyser la colonne sélectionnée
    const colChars = [grid[0][selectColIndex], grid[1][selectColIndex], grid[2][selectColIndex], grid[3][selectColIndex]];
    const colPirateCount = colChars.filter(ch => ch.affiliation === "Pirate").length;
    const colBountySum = colChars.reduce((sum, ch) => sum + (isExcludedFromBounty(ch) ? 0 : (ch.bounty || 0)), 0);
    const colFemalesCount = colChars.filter(ch => ch.gender === "Femme").length;

    if (colFemalesCount > 0) {
      addClue(`Dans la Colonne ${selectColIndex + 1}, il y a exactement ${colFemalesCount} personnage(s) féminin(s).`);
    } else if (colPirateCount === 4) {
      addClue(`La Colonne ${selectColIndex + 1} est exclusivement composée de flibustiers affiliés Pirates.`);
    } else {
      addClue(`La somme cumulée des primes (excluant Marine, Gouvernement et Cipher Pol) de la Colonne ${selectColIndex + 1} s'élève à ${colBountySum.toLocaleString()} ฿.`);
    }

    // Autre ligne ou colonne au hasard
    const altLineIndex = (selectLineIndex + 2) % 4;
    const altRowChars = grid[altLineIndex];
    const altRowPirates = altRowChars.filter(ch => ch.affiliation === "Pirate").length;
    addClue(`La Ligne ${altLineIndex + 1} compte exactement ${altRowPirates} pirate(s) dans ses rangs.`);

    // 4. INDICES DE VOISINAGE ORTHOGONAL (Adjacence spatiale - 3/4 indices clés)
    // Sélectionner des adjacences valides de manière aléatoire
    const directions = [
      { dr: -1, dc: 0, label: "juste au-dessus de" },
      { dr: 1, dc: 0, label: "juste en dessous de" },
      { dr: 0, dc: -1, label: "juste à gauche de" },
      { dr: 0, dc: 1, label: "juste à droite de" }
    ];

    let adjacencyCount = 0;
    // Parcourir la grille pour générer 3 indices de voisinage intéressants
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (adjacencyCount >= 4) break;

        const charA = grid[r][c];
        // Chercher une direction valide
        for (const dir of directions) {
          const nr = r + dir.dr;
          const nc = c + dir.dc;
          if (nr >= 0 && nr < 4 && nc >= 0 && nc < 4) {
            const charB = grid[nr][nc];
            // On a charA adjacent à charB
            const randChoose = Math.random();
            if (randChoose < 0.25) {
              addClue(`${charA.name} se trouve ${dir.label} ${charB.name}.`);
              adjacencyCount++;
              break;
            } else if (randChoose < 0.50 && charB.affiliation !== "Civil") {
              addClue(`${charA.name} est placé(e) ${dir.label} un membre dont l'affiliation est : ${charB.affiliation}.`);
              adjacencyCount++;
              break;
            } else if (randChoose < 0.75 && charB.devilFruit && charB.devilFruit !== "Aucun") {
              addClue(`${charA.name} se trouve côte à côte avec un utilisateur de fruit de type ${charB.devilFruit}.`);
              adjacencyCount++;
              break;
            } else if (charB.crew && charB.crew !== "Inconnu" && charB.crew !== "Aucun") {
              addClue(`${charA.name} est à côté d'un membre de l'équipage : ${charB.crew}.`);
              adjacencyCount++;
              break;
            }
          }
        }
      }
    }

    // S'assurer qu'au moins un indice montre qu'ils partagent la même ligne ou colonne
    const randomCharIdx1 = Math.floor(Math.random() * 16);
    let randomCharIdx2 = (randomCharIdx1 + 5) % 16;
    const cA_id = randomCharIdx1;
    const rA = Math.floor(cA_id / 4);
    const colA = cA_id % 4;
    
    const rB = Math.floor(randomCharIdx2 / 4);
    const colB = randomCharIdx2 % 4;
    
    const nameA = grid[rA][colA].name;
    const nameB = grid[rB][colB].name;

    if (rA === rB) {
      addClue(`Les célèbres ${nameA} et ${nameB} mangent à la même table (ils sont sur la même Ligne).`);
    } else if (colA === colB) {
      addClue(`Les redoutables ${nameA} et ${nameB} naviguent sur le même méridien (ils sont sur la même Colonne).`);
    } else {
      addClue(`${nameA} se situe plus haut dans la grille (ligne inférieure ou égale) que ${nameB}.`);
    }

    return helperClues;
  };

  // Basculer l'état rayé d'un indice au clic
  const toggleClueCrossed = (id: string) => {
    setClues(prev => prev.map(c => c.id === id ? { ...c, isCrossed: !c.isCrossed } : c));
  };

  // --- LOGIQUE DU COULISSER-DÉPOSER (DRAG & DROP NATIVE) ---

  const handleDragStart = (e: React.DragEvent, charId: string, source: "tray" | { row: number; col: number }) => {
    e.dataTransfer.setData("charId", charId);
    if (source === "tray") {
      e.dataTransfer.setData("sourceType", "tray");
    } else {
      e.dataTransfer.setData("sourceType", "grid");
      e.dataTransfer.setData("sourceRow", String(source.row));
      e.dataTransfer.setData("sourceCol", String(source.col));
    }
  };

  const handleDropOnCell = (e: React.DragEvent, targetRow: number, targetCol: number) => {
    e.preventDefault();
    const charId = e.dataTransfer.getData("charId");
    const sourceType = e.dataTransfer.getData("sourceType");

    // Retrouver le personnage déplacé
    let draggedChar: Character | null = null;
    
    if (sourceType === "tray") {
      draggedChar = trayCharacters.find(c => c.id === charId) || null;
      if (!draggedChar) return;

      // Logique de remplacement dans la case ciblée
      const occupant = userGrid[targetRow][targetCol];
      
      const newGrid = [...userGrid.map(row => [...row])];
      newGrid[targetRow][targetCol] = draggedChar;
      setUserGrid(newGrid);

      // Mettre à jour le ray/hand des personnages disponibles
      let newTray = trayCharacters.filter(c => c.id !== charId);
      if (occupant) {
        newTray.push(occupant); // Renvoie l'ancien occupant dans le plateau
      }
      setTrayCharacters(newTray);

    } else if (sourceType === "grid") {
      const sourceRow = parseInt(e.dataTransfer.getData("sourceRow"), 10);
      const sourceCol = parseInt(e.dataTransfer.getData("sourceCol"), 10);
      
      draggedChar = userGrid[sourceRow][sourceCol];
      if (!draggedChar) return;

      const occupant = userGrid[targetRow][targetCol];

      const newGrid = [...userGrid.map(row => [...row])];
      newGrid[targetRow][targetCol] = draggedChar;
      newGrid[sourceRow][sourceCol] = occupant; // Échange ou vide la case source
      
      setUserGrid(newGrid);
    }

    // Réinitialiser la sélection manuelle
    setSelectedChar(null);
    setSelectedSource(null);
  };

  const handleDropOnTray = (e: React.DragEvent) => {
    e.preventDefault();
    const charId = e.dataTransfer.getData("charId");
    const sourceType = e.dataTransfer.getData("sourceType");

    if (sourceType === "grid") {
      const sourceRow = parseInt(e.dataTransfer.getData("sourceRow"), 10);
      const sourceCol = parseInt(e.dataTransfer.getData("sourceCol"), 10);

      const draggedChar = userGrid[sourceRow][sourceCol];
      if (!draggedChar) return;

      // Enlever de la grille
      const newGrid = [...userGrid.map(row => [...row])];
      newGrid[sourceRow][sourceCol] = null;
      setUserGrid(newGrid);

      // Remettre dans le tray si pas déjà présent
      if (!trayCharacters.some(c => c.id === draggedChar.id)) {
        setTrayCharacters(prev => [...prev, draggedChar]);
      }
    }
    setSelectedChar(null);
    setSelectedSource(null);
  };

  // --- LOGIQUE INTERACTIVE AU CLIC (ALTERNATIVE SÉCURISÉE) ---

  const handleTrayCardClick = (char: Character) => {
    if (selectedChar && selectedChar.id === char.id) {
      // Déselectionner
      setSelectedChar(null);
      setSelectedSource(null);
    } else {
      setSelectedChar(char);
      setSelectedSource(null);
    }
  };

  const handleGridCellClick = (row: number, col: number) => {
    const clickedChar = userGrid[row][col];

    // Cas 1 : On a sélectionné un personnage depuis le plateau (Tray) et on clique sur une case de la grille
    if (selectedChar && !selectedSource) {
      const occupant = clickedChar;
      const newGrid = [...userGrid.map(r => [...r])];
      newGrid[row][col] = selectedChar;
      setUserGrid(newGrid);

      // Retirer du tray et y rajouter l'éventuel occupant précédent
      let newTray = trayCharacters.filter(c => c.id !== selectedChar.id);
      if (occupant) {
        newTray.push(occupant);
      }
      setTrayCharacters(newTray);

      setSelectedChar(null);
      setSelectedSource(null);
      return;
    }

    // Cas 2 : On a déjà sélectionné un personnage dans la grille (Source) et on clique sur une autre case
    if (selectedSource) {
      const sourceChar = userGrid[selectedSource.row][selectedSource.col];
      if (!sourceChar) return;

      const newGrid = [...userGrid.map(r => [...r])];
      newGrid[row][col] = sourceChar;
      newGrid[selectedSource.row][selectedSource.col] = clickedChar; // Échange ou vide la case source

      setUserGrid(newGrid);
      setSelectedChar(null);
      setSelectedSource(null);
      return;
    }

    // Cas 3 : Rien n'était sélectionné auparavant, et on clique sur une case occupée
    if (clickedChar) {
      // On sélectionne cette case pour pouvoir la déplacer ou la remettre à disposition
      setSelectedChar(clickedChar);
      setSelectedSource({ row, col });
    }
  };

  // Renvoyer manuellement une carte de la grille vers le plateau
  const handleRemoveFromGrid = (row: number, col: number) => {
    const char = userGrid[row][col];
    if (!char) return;

    const newGrid = [...userGrid.map(r => [...r])];
    newGrid[row][col] = null;
    setUserGrid(newGrid);

    if (!trayCharacters.some(c => c.id === char.id)) {
      setTrayCharacters(prev => [...prev, char]);
    }

    setSelectedChar(null);
    setSelectedSource(null);
  };

  // --- VÉRIFICATION & ATTRIBUTION DES SCORES ---

  const validateGrid = () => {
    if (!solutionGrid.length) return;

    let isAllCorrect = true;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const userChar = userGrid[r][c];
        const solChar = solutionGrid[r][c];
        if (!userChar || userChar.id !== solChar.id) {
          isAllCorrect = false;
        }
      }
    }

    setAttempts(a => a + 1);
    setValidationRequested(true);

    if (isAllCorrect) {
      setIsGameWon(true);
      // Récompense de 10 000 Berrys pour une victoire logique !
      if (onUpdateBounty && !rewardClaimed) {
        onUpdateBounty(10000);
        setRewardClaimed(true);
      }
    } else {
      setIsGameWon(false);
      // Petite pénalité de 500 Berrys en cas d'erreur tactique
      if (onUpdateBounty) {
        onUpdateBounty(-500);
      }
    }
  };

  // Compter le nombre correct d'éléments dans la grille globale
  const getCorrectCount = () => {
    let count = 0;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (userGrid[r][c]?.id === solutionGrid[r]?.[c]?.id) {
          count++;
        }
      }
    }
    return count;
  };

  return (
    <div id="logic-puzzle-container" className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#11142A]/85 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl">
        <div className="space-y-1.5">
          <span className="bg-amber-500/10 text-amber-400 text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-amber-500/20 inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3 animate-spin duration-3000" />
            Nouveau Défi
          </span>
          <h2 className="text-2xl font-black font-heading text-white uppercase tracking-tight flex items-center gap-2">
            <Compass className="w-6 h-6 text-amber-500 animate-pulse" />
            Le Puzzle Logique
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Un mystérieux document de la Marine a été découpé. Utilisez les indices d'affiliations,
            d'haki, de fruits du démon et de voisinage pour replacer les 16 pirates dans leurs cabines respectives (grille 4x4) !
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTutorial(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold font-heading bg-white/10 text-white border border-white/10 hover:bg-white/15 transition-all flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            Règles du Jeu
          </button>
          <button
            onClick={initGame}
            className="px-4 py-2 rounded-xl text-xs font-bold font-heading bg-amber-500 hover:bg-amber-600 text-[#11142A] transition-all flex items-center gap-2 shadow-lg shadow-amber-500/10"
          >
            <RotateCcw className="w-4 h-4" />
            Nouvelle Grille
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: THE GRID (8 cols on lg) */}
        <div className="lg:col-span-8 bg-[#11142A]/60 backdrop-blur-md rounded-3xl p-5 md:p-6 border border-white/5 flex flex-col justify-between space-y-6 shadow-inner relative">
          
          {/* Header Grid stats */}
          <div className="flex justify-between items-center px-2">
            <div className="text-xs md:text-sm font-mono text-slate-400">
              Essais : <span className="font-bold text-white bg-slate-800 px-2.5 py-1 rounded ml-1">{attempts}</span>
            </div>
            {validationRequested && (
              <div className="text-xs md:text-sm font-mono text-slate-400 flex items-center gap-2">
                <span>Placement exact :</span>
                <span className={`font-black uppercase px-2.5 py-1 rounded text-xs ${
                  getCorrectCount() === 16 ? "bg-emerald-500 text-white" : "bg-amber-500 text-slate-950"
                }`}>
                  {getCorrectCount()} / 16
                </span>
              </div>
            )}
          </div>

          {/* Grille de jeu 4x4 */}
          <div className="w-full max-w-[620px] mx-auto aspect-square bg-[#0b0d1b] rounded-2xl border-2 border-slate-700 p-2 md:p-4 grid grid-cols-5 grid-rows-5 gap-2 md:gap-3 justify-center items-center relative shadow-2xl">
            
            {/* Cellule d'angle vide (0,0) */}
            <div className="flex items-center justify-center text-xs font-mono text-slate-500 uppercase font-black">
              Grille
            </div>

            {/* En-tête de Colonne : C1 à C4 */}
            {[1, 2, 3, 4].map(cNum => (
              <div key={`col-head-${cNum}`} className="flex flex-col items-center justify-center text-center">
                <span className="text-[10px] md:text-xs font-mono text-amber-500 uppercase font-bold">Col {cNum}</span>
              </div>
            ))}

            {/* Les lignes de la grille */}
            {[0, 1, 2, 3].map(rowIdx => (
              <React.Fragment key={`row-items-${rowIdx}`}>
                
                {/* En-tête de Ligne : L1 à L4 */}
                <div className="flex items-center justify-center">
                  <span className="text-[10px] md:text-xs font-mono text-cyan-400 uppercase font-bold">Lig {rowIdx + 1}</span>
                </div>

                {/* Les 4 cellules de la ligne */}
                {[0, 1, 2, 3].map(colIdx => {
                  const char = userGrid[rowIdx][colIdx];
                  const isSelectedCell = selectedSource?.row === rowIdx && selectedSource?.col === colIdx;
                  
                  // Déterminer la couleur de validation si demandé
                  let borderStyle = "border-dashed border-slate-600 hover:border-slate-500 hover:bg-slate-800/20";
                  let bgIndicator = "bg-transparent";
                  
                  if (char && validationRequested) {
                    const isCorrect = char.id === solutionGrid[rowIdx]?.[colIdx]?.id;
                    borderStyle = isCorrect ? "border-emerald-500 border-2 shadow-md shadow-emerald-500/10" : "border-rose-500 border-2 shadow-md shadow-rose-500/10";
                    bgIndicator = isCorrect ? "bg-emerald-500/10" : "bg-rose-500/10";
                  } else if (isSelectedCell) {
                    borderStyle = "border-cyan-400 border-2 bg-cyan-400/10 shadow-lg animate-pulse";
                  } else if (char) {
                    borderStyle = "border-slate-500 border bg-slate-800/10 hover:border-slate-400";
                  }

                  return (
                    <div
                      key={`cell-${rowIdx}-${colIdx}`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDropOnCell(e, rowIdx, colIdx)}
                      onClick={() => handleGridCellClick(rowIdx, colIdx)}
                      className={`relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden ${borderStyle} ${bgIndicator}`}
                      title={char ? `${char.name} (Ligne ${rowIdx + 1}, Colonne ${colIdx + 1})` : "Case vide. Glissez ou cliquez pour placer."}
                    >
                      {char ? (
                        <div 
                          draggable
                          onDragStart={(e) => handleDragStart(e, char.id, { row: rowIdx, col: colIdx })}
                          className="w-full h-full flex flex-col items-center justify-between p-1 relative text-center group"
                        >
                          {/* Image miniature avec Dicebear fallback */}
                          <img
                            src={char.image || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(char.name)}`}
                            alt={char.name}
                            className="w-9 h-9 sm:w-12 sm:h-12 md:w-16 md:h-16 object-cover rounded-lg pointer-events-none border border-white/10 shadow-sm"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(char.name)}`;
                            }}
                          />
                          
                          {/* Nom court du personnage */}
                          <span className="text-[7.5px] sm:text-[9px] md:text-[11px] font-heading font-black text-white leading-tight uppercase truncate max-w-full block mt-0.5">
                            {char.name.split(" ")[0]}
                          </span>

                          {/* Bouton de retrait direct discret */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromGrid(rowIdx, colIdx);
                            }}
                            className="absolute top-0.5 right-0.5 p-1 bg-rose-600/95 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                            title="Retirer cette carte"
                          >
                            <Trash2 className="w-2.5 sm:w-3 md:w-3.5 h-2.5 sm:h-3 md:h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[16px] md:text-[24px] text-slate-500 hover:text-slate-400 font-black font-mono transition-colors">
                          +
                        </span>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>

          {/* Action validation block */}
          <div className="flex flex-col gap-3.5 border-t border-white/5 pt-4 w-full">
            <span className="text-[10.5px] md:text-xs font-mono text-slate-400 italic text-center sm:text-left">
              * Astuce : Cliquez sur une carte de la grille pour la renvoyer vers le plateau du bas, ou glissez-déposez pour réordonner.
            </span>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
              <div className="hidden sm:block text-[11px] font-mono text-amber-500/80">
                Placement libre ou automatique
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                {validationRequested && (
                  <button
                    onClick={() => setValidationRequested(false)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 transition whitespace-nowrap cursor-pointer border border-white/5"
                  >
                    Masquer Erreurs
                  </button>
                )}
                <button
                  onClick={validateGrid}
                  className="flex-1 sm:flex-none px-6 py-2.5 md:py-3 rounded-xl text-xs font-black font-heading bg-emerald-500 hover:bg-emerald-600 text-[#11142A] tracking-wider uppercase transition-all shadow-md shadow-emerald-500/15 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Valider la Grille
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: CLUES PANEL (4 cols on lg) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          
          {/* Indices panel card */}
          <div className="bg-[#11142A]/85 backdrop-blur-md border border-white/15 rounded-3xl p-5 shadow-xl flex flex-col justify-between flex-1 space-y-4 h-full">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="text-sm font-black font-heading text-amber-500 uppercase tracking-wider flex items-center gap-2">
                  <Map className="w-4 h-4" />
                  Journal des Indices ({clues.length})
                </h3>
                <span className="text-[9px] font-mono text-slate-400 uppercase bg-slate-800 px-2 py-1 rounded">
                  Clic pour barrer
                </span>
              </div>
              
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {clues.map((clue) => (
                  <div
                    key={clue.id}
                    onClick={() => toggleClueCrossed(clue.id)}
                    className={`p-3 rounded-xl border transition-all text-left cursor-pointer flex items-start gap-2.5 relative group select-none ${
                      clue.isCrossed
                        ? "bg-slate-900/40 border-slate-800 text-slate-500"
                        : "bg-white/[0.03] border-white/5 text-slate-200 hover:bg-white/[0.06] hover:border-slate-700"
                    }`}
                  >
                    {/* Tick status indicator */}
                    <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center border shrink-0 transition-colors ${
                      clue.isCrossed 
                        ? "bg-slate-700 border-slate-600 text-slate-400" 
                        : "border-slate-600 text-transparent"
                    }`}>
                      <span className="text-[10px] leading-none">✓</span>
                    </div>

                    <span className={`text-[11px] md:text-xs font-medium leading-relaxed ${clue.isCrossed ? "line-through opacity-60" : ""}`}>
                      {clue.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Victory Message Indicator */}
            {isGameWon && (
              <div className="bg-emerald-500/15 border border-emerald-500/50 rounded-2xl p-4 text-center space-y-2 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-center gap-2 text-emerald-400 font-extrabold text-sm uppercase font-heading">
                  <Award className="w-5 h-5 animate-bounce" />
                  Victoire Logique Absolue !
                </div>
                <p className="text-[11px] text-emerald-200 font-mono">
                  Vous avez résolu l'énigme de bord de la Marine !
                </p>
                <div className="text-emerald-400 font-black text-xs font-mono uppercase tracking-widest pt-1">
                  +10 000 ฿ de prime !
                </div>
              </div>
            )}

            {/* Incorrect notification */}
            {validationRequested && !isGameWon && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-3 text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-rose-400 font-bold text-xs uppercase font-heading">
                  <AlertOctagon className="w-4 h-4" />
                  Grille incorrecte !
                </div>
                <p className="text-[10px] text-slate-300">
                  Des cabines sont inadéquates. Les indices rouges indiquent les erreurs et les verts indiquent les placements parfaits !
                </p>
                <p className="text-rose-400 font-black font-mono text-[9px] uppercase tracking-wider">
                  -500 ฿ Prime réduite !
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* LOWER PANEL: CHARACTERS TRAY */}
      <div 
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropOnTray}
        className="bg-[#11142A]/85 backdrop-blur-md border border-white/10 rounded-3xl p-5 shadow-xl space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="space-y-1">
            <h3 className="text-sm font-black font-heading text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              Personnages à placer ({trayCharacters.length} restants)
            </h3>
            <p className="text-[10px] text-slate-400 leading-normal">
              Utilisez le glisser-déposer OU sélectionnez un personnage d'ici, puis cliquez sur une cabine de la grille pour l'installer.
            </p>
          </div>
          {selectedChar && (
            <div className="flex items-center gap-2 text-xs font-mono bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 rounded-xl text-cyan-400 animate-in fade-in">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Sélectionné : <strong>{selectedChar.name}</strong>
              <button
                onClick={() => {
                  setSelectedChar(null);
                  setSelectedSource(null);
                }}
                className="ml-2 hover:text-white bg-slate-800 rounded px-1.5 py-0.5 text-[9px]"
              >
                Annuler
              </button>
            </div>
          )}
        </div>

        {trayCharacters.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 font-mono italic">
            Tous les personnages ont été assignés à une cabine de la grille. Cliquez ci-dessus sur "Valider la Grille" pour vérifier votre logique !
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-3 max-h-[220px] overflow-y-auto p-1.5">
            {trayCharacters.map((char) => {
              const isSelected = selectedChar?.id === char.id;
              return (
                <div
                  key={char.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, char.id, "tray")}
                  onClick={() => handleTrayCardClick(char)}
                  className={`p-1.5 rounded-2xl w-[90px] md:w-[100px] flex flex-col items-center justify-between text-center border cursor-grab select-none transition-all duration-200 transform hover:-translate-y-0.5 active:cursor-grabbing ${
                    isSelected 
                      ? "border-cyan-400 bg-cyan-400/10 shadow-lg scale-95" 
                      : "border-white/10 bg-[#161a35] hover:bg-[#1D2248] hover:border-slate-500"
                  }`}
                  title={`${char.name}\nAffiliation: ${char.affiliation}\nFruit: ${char.devilFruitName || "Aucun"}\nHaki: ${formatHakiList(char.haki || [])}`}
                >
                  <img
                    src={char.image || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(char.name)}`}
                    alt={char.name}
                    className="w-10 h-10 md:w-12 md:h-12 object-cover rounded-xl border border-white/5 mb-1.5 pointer-events-none"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(char.name)}`;
                    }}
                  />
                  <div className="w-full text-[9px] font-heading font-black text-white uppercase truncate px-0.5 leading-none">
                    {char.name}
                  </div>
                  <div className="text-[7px] text-slate-400 font-mono uppercase mt-1 leading-none tracking-wider">
                    {char.affiliation}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* REGLES MODAL / DRAWER */}
      {showTutorial && (
        <div className="fixed inset-0 bg-[#0b0d1b]/95 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#11142A] border-2 border-slate-700 rounded-3xl max-w-lg w-full p-6 md:p-8 space-y-5 text-white shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black font-heading text-amber-500 uppercase flex items-center gap-2">
              <Compass className="w-5 h-5" />
              Règles : Le Puzzle Logique
            </h3>
            
            <div className="text-xs text-slate-300 space-y-3 font-medium leading-relaxed">
              <p>
                Le but du jeu est de positionner de manière ultra-précise les 16 personnages choisis au hasard de la database sur une grille de 4 lignes de 4 colonnes (les "cabines").
              </p>
              
              <div className="space-y-1.5 bg-white/5 p-3 rounded-2xl border border-white/5">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">Types d'indices proposés :</span>
                <ul className="list-disc pl-4 space-y-1.5 text-slate-200 font-mono text-[10px]">
                  <li><strong>Coin :</strong> Indique quel personnage ou caractéristique occupe l'un des 4 bords extérieurs.</li>
                  <li><strong>Absolu :</strong> Décrit le personnage en Ligne X et Colonne Y ainsi que ses caractéristiques ou sa prime.</li>
                  <li><strong>Comptage :</strong> Indique le nombre de possesseurs de Fruits, Hakis ou affiliés sur une ligne ou colonne entière.</li>
                  <li><strong>Voisinage :</strong> Indique si certains pirates sont côte à côte horizontalement/verticalement ou de manière relative (sur la même ligne ou colonne).</li>
                </ul>
              </div>

              <p>
                Pour jouer, vous pouvez <strong>glisser-déposer par souris</strong> des cartes ou bien faire un <strong>clic-sélection de carte (plateau du bas) puis cliquer sur la case cible</strong> de votre choix de la grille.
              </p>
              
              <p>
                Une fois satisfait de votre grille déduite, validez-la avec le bouton dédié. Chaque erreur vous vaudra une pénalité, mais un placement parfait vous rapportera <strong>+10 000 ฿</strong> à votre prime !
              </p>
            </div>

            <button
              onClick={() => setShowTutorial(false)}
              className="w-full py-2.5 rounded-xl text-xs font-bold font-heading bg-amber-500 text-[#11142A] hover:bg-amber-600 transition"
            >
              C'est compris, à l'abordage !
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

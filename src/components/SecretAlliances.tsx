import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Character } from "../types";
import { 
  Users, Sparkles, RefreshCw, X, Check, Award, 
  Trash2, Play, Info, AlertOctagon, HelpCircle, Trophy
} from "lucide-react";
import { getNotranslateClass } from "../lib/translate";
import { handleImageError } from "../lib/images";

interface SecretAlliancesProps {
  characters: Character[];
  onUpdateBounty?: (amount: number) => void;
}

interface AllianceCategory {
  id: string;
  label: string;
  description: string;
  characters: Character[];
  colorTheme: {
    bg: string;
    text: string;
    border: string;
    solvedBg: string;
    solvedText: string;
    solvedBorder: string;
  };
}

interface GroupTemplate {
  id: string;
  label: string;
  description: string;
  check: (c: Character) => boolean;
}

// Full array of One Piece connections
const GROUP_TEMPLATES: GroupTemplate[] = [
  {
    id: "swordsmen",
    label: "Épéistes & Sabreurs",
    description: "Fins bretteurs et maîtres du sabre de Grand Line.",
    check: (c) => !!c.isSwordsman
  },
  {
    id: "luffy_opponents",
    label: "Adversaires de Luffy",
    description: "Combattants courageux ou rivaux cruels ayant affronté Monkey D. Luffy.",
    check: (c) => !!c.isLuffyOpponent
  },
  {
    id: "haki_kings",
    label: "Haki des rois",
    description: "Combattants d'exception éveillés au fluide suprême des rois.",
    check: (c) => c.haki && c.haki.includes("Haoshoku")
  },
  {
    id: "fruit_logia",
    label: "Utilisateurs de Fruit Logia",
    description: "Personnages maîtrisant un fruit du démon de type élémentaire.",
    check: (c) => c.devilFruit === "Logia"
  },
  {
    id: "fruit_zoan",
    label: "Utilisateurs de Fruit Zoan",
    description: "Combattants capables de métamorphose animale ou mythique.",
    check: (c) => c.devilFruit === "Zoan" || c.devilFruit === "Zoan Mythique"
  },
  {
    id: "fruit_paramecia",
    label: "Utilisateurs de Fruit Paramecia",
    description: "Personnages dotés de pouvoirs physiques ou spatiaux singuliers.",
    check: (c) => c.devilFruit === "Paramecia"
  },
  {
    id: "race_mink",
    label: "Tribu des Minks (Zou)",
    description: "Combattants anthropomorphes à fourrure originaires de l'île de Zou.",
    check: (c) => c.race === "Mink" || (c.race && c.race.toLowerCase().includes("mink"))
  },
  {
    id: "race_fishman",
    label: "Hommes-Poissons & Sirènes",
    description: "Habitants aquatiques de l'Île des Hommes-Poissons et fiers combattants des mers.",
    check: (c) => c.race === "Fish-man" || c.race === "Merfolk" || (c.race && c.race.toLowerCase().includes("fish-man")) || (c.race && c.race.toLowerCase().includes("merfolk"))
  },
  {
    id: "race_giant",
    label: "Guerriers de la race des Géants",
    description: "Colosses légendaires issus d'Elbaf ou d'autres territoires.",
    check: (c) => c.race === "Giant" || (c.race && c.race.toLowerCase().includes("giant"))
  },
  {
    id: "race_cyborg",
    label: "Cyborgs & Modifiés du corps",
    description: "Personnages dotés d'améliorations cybernétiques ou de composants mécaniques.",
    check: (c: any) => {
      if (!c) return false;
      const name = (c.name || "").toLowerCase();
      const epithet = (c.epithet || "").toLowerCase();
      const desc = (c.description || "").toLowerCase();
      const affiliation = (c.affiliation || "").toLowerCase();
      const race = (c.race || "").toLowerCase();

      // Exclude human host of clone
      if (name.includes("buckingham")) return false;

      // Explicit race checks
      if (race === "robot" || race === "cyborg" || race.includes("cyborg") || race === "clone") return true;

      // Attribute key word checks
      if (epithet.includes("cyborg") || name.includes("cyborg") || name.includes("pacifista") || name.includes("seraphim")) return true;

      // Description text checks
      if (desc.includes("cyborg") || desc.includes("robot") || desc.includes("pacifista") || desc.includes("clon") || desc.includes("modifié")) {
        if (name === "kitton") return false; // Kitton is only human friend of Taroimo
        return true;
      }

      // Germa 66 siblings (Sanji, Ichiji, Niji, Reiju, Yonji)
      if (name.includes("vinsmoke")) {
        if (name.includes("sora") || name.includes("judge")) return false; // Sora & Judge are normal humans
        return true;
      }
      if (name === "sanji" || name.includes("vinsmoke sanji")) return true;

      // Bartholomew Kuma
      if (name.includes("bartholomew kuma") || name === "kuma") return true;

      // Seraphim models
      if (name.startsWith("s-bear") || name.startsWith("s-hawk") || name.startsWith("s-snake") || name.startsWith("s-shark") || name.startsWith("s-flamingo") || name.startsWith("s-bat") || name.startsWith("s-crocodile")) return true;

      // Queen [Scien]
      if (name.includes("queen") && (affiliation.includes("beasts") || desc.includes("all-star") || desc.includes("plague"))) return true;

      // Vegapunk & satellites
      if (name === "vegapunk" || name.includes("dr. vegapunk") || name === "shaka" || name === "lilith" || name === "edison" || name === "pythagoras" || name === "atlas" || name === "york" || name.includes("vegaforce")) return true;

      // Karakuri island and Egghead bots
      if (name === "taroimo" || name.includes("mecha-shark") || name.includes("recycle-wan") || name === "emet") return true;

      // Captain John Zombie
      if (name === "john" && desc.includes("modified into")) return true;

      return false;
    }
  },
  {
    id: "marine_corps",
    label: "Soldats de la Marine",
    description: "Officiers dévoués à la Justice Absolue du Gouvernement Mondial.",
    check: (c) => c.affiliation === "Marine"
  },
  {
    id: "revolutionaries",
    label: "Membres de l'Armée Révolutionnaire",
    description: "Combattants insurgés luttant sous le commandement de Dragon.",
    check: (c) => {
      const cl = c.crew.toLowerCase();
      const nameL = c.name.toLowerCase();
      if (cl.includes("god's army") || cl.includes("divine") || nameL.includes("hotori") || nameL.includes("kotori") || nameL.includes("satori")) {
        return false;
      }
      return (c.affiliation === "Révolutionnaire" || cl.includes("revolutionary") || cl.includes("révolutionnaire")) && !cl.includes("fake") && !cl.includes("faux");
    }
  },
  {
    id: "world_gov",
    label: "Forces du Gouvernement Mondial",
    description: "Affiliés au Cipher Pol (CP0, CP9) ou commanditaires directs de Marie-Joie.",
    check: (c) => {
      const cl = c.crew.toLowerCase();
      return (c.affiliation === "Gouvernement" || cl.includes("cp0") || cl.includes("cp9")) && !cl.includes("fake") && !cl.includes("faux");
    }
  },
  {
    id: "crew_beasts",
    label: "Équipage aux Cent Bêtes (Kaido)",
    description: "Pirates redoutables et fiers guerriers siégeant au pays de Wano.",
    check: (c) => {
      const cl = c.crew.toLowerCase();
      return (cl.includes("beasts") || cl.includes("kaido") || cl.includes("kaidou")) && !cl.includes("fake") && !cl.includes("faux");
    }
  },
  {
    id: "crew_bigmom",
    label: "Équipage de Big Mom",
    description: "Membres de la fratrie Charlotte et officiers de Totto Land.",
    check: (c) => {
      const cl = c.crew.toLowerCase();
      return (cl.includes("big mom") || cl.includes("charlotte linlin") || cl.includes("charlotte")) && !cl.includes("fake") && !cl.includes("faux");
    }
  },
  {
    id: "crew_whitebeard",
    label: "Flotte de Barbe Blanche",
    description: "Fiers compagnons de l'empereur légendaire Edward Newgate.",
    check: (c) => {
      const cl = c.crew.toLowerCase();
      return (cl.includes("whitebeard") || cl.includes("barbe blanche")) && !cl.includes("fake") && !cl.includes("faux");
    }
  },
  {
    id: "crew_strawhats",
    label: "Équipage au Chapeau de Paille",
    description: "Compagnons navigateurs directs de Monkey D. Luffy.",
    check: (c) => {
      const cl = c.crew.toLowerCase();
      return (cl.includes("straw") || cl.includes("chapeau")) && !cl.includes("fake") && !cl.includes("faux");
    }
  },
  {
    id: "crew_red_hair",
    label: "Équipage du Roux (Shanks)",
    description: "Guerriers valeureux de l'empereur Shanks le Roux.",
    check: (c) => {
      const cl = c.crew.toLowerCase();
      return (cl.includes("red hair") || cl.includes("shanks") || cl.includes("akagami")) && !cl.includes("fake") && !cl.includes("faux");
    }
  },
  {
    id: "crew_blackbeard",
    label: "Équipage de Barbe Noire",
    description: "Flotte des dix capitaines géants sous Marshall D. Teach.",
    check: (c) => {
      const cl = c.crew.toLowerCase();
      return (cl.includes("blackbeard") || cl.includes("barbe noire") || cl.includes("marshall d. teach")) && !cl.includes("fake") && !cl.includes("faux");
    }
  },
  {
    id: "crew_roger",
    label: "L'Équipage des Pirates de Roger",
    description: "Membres du seul équipage à avoir conquis la totalité de Grand Line.",
    check: (c) => {
      const cl = c.crew.toLowerCase();
      return cl.includes("roger") && !cl.includes("fake") && !cl.includes("faux");
    }
  },
  {
    id: "crew_baroque",
    label: "Membres de Baroque Works",
    description: "Agissants sous couverture ou comme agents de l'organisation criminelle de Crocodile.",
    check: (c) => {
      const cl = c.crew.toLowerCase();
      return cl.includes("baroque") || (c.description && c.description.toLowerCase().includes("baroque works"));
    }
  },
  {
    id: "crew_donquixote",
    label: "Membres de la Donquixote Family",
    description: "Subordonnés fidèles du grand corsaire Donquixote Doflamingo.",
    check: (c) => {
      const cl = c.crew.toLowerCase();
      return cl.includes("donquixote") || (c.description && c.description.toLowerCase().includes("donquixote family"));
    }
  },
  {
    id: "crew_cross_guild",
    label: "L'Équipage de la Cross Guild",
    description: "L'organisation qui place des primes sur la tête des soldats de la Marine.",
    check: (c) => {
      const cl = c.crew.toLowerCase();
      return cl.includes("cross guild") || (c.description && c.description.toLowerCase().includes("cross guild"));
    }
  },
  {
    id: "crew_heart_kid",
    label: "Équipages des Supernovas (Hors Mugi/BN)",
    description: "Membres d'équipages de Supernovas, à l'exclusion des Chapeaux de Paille et de l'équipage de Barbe Noire.",
    check: (c) => {
      const cl = c.crew.toLowerCase();
      return cl.includes("heart") || cl.includes("kid pirates") || cl.includes("on air") || cl.includes("bonney") || cl.includes("fire tank") || cl.includes("hawkins") || cl.includes("drake") || cl.includes("fallen monk");
    }
  },
  {
    id: "arc_skypiea",
    label: "Introduits ou Actifs à Skypiea",
    description: "Personnages clés de l'arc légendaire de l'Île Céleste.",
    check: (c) => c.originArc === "Skypiea"
  },
  {
    id: "arc_alabasta",
    label: "Introduits ou Actifs à Alabasta",
    description: "Acteurs de la révolte et de la libération du désert d'Alabasta.",
    check: (c) => c.originArc === "Alabasta"
  },
  {
    id: "arc_dressrosa",
    label: "Introduits ou Actifs à Dressrosa",
    description: "Combattants présents lors du tournoi du Colisée ou de la chute de Doflamingo.",
    check: (c) => c.originArc === "Dressrosa"
  },
  {
    id: "arc_wano",
    label: "Introduits ou Actifs au pays de Wano",
    description: "Samouraïs, Ninjas ou pirates impliqués dans la libération d'Onigashima.",
    check: (c) => c.originArc === "Wano Country"
  },
  {
    id: "arc_wholecake",
    label: "Introduits ou Actifs à Whole Cake Island",
    description: "Personnages croisés au cours de l'évasion festive de Totto Land.",
    check: (c) => c.originArc === "Whole Cake Island"
  },
  {
    id: "arc_eastblue",
    label: "Introduits ou Actifs sur East Blue",
    description: "Rencontrés au cours des prémices de l'aventure, sur la mer la plus paisible.",
    check: (c) => c.originArc === "East Blue"
  },
  {
    id: "arc_summit",
    label: "Acteurs de la Guerre au Sommet",
    description: "Combattants déployés sur Marineford ou évadés de la prison d'Impel Down.",
    check: (c) => (c.originArc === "Marineford" || c.originArc === "Impel Down" || c.originArc === "Amazon Lily") && c.name !== "Karasu"
  },
  {
    id: "bounty_giga",
    label: "Primes + 1 Milliard de Berrys",
    description: "Criminels d'élite dont la tête vaut une fortune colossale.",
    check: (c) => c.bounty >= 1000000000
  },
  {
    id: "bounty_zero",
    label: "Sans Prime Active (0 Berrys)",
    description: "Civils, nobles Célestes ou officiers d'État immunisés au système de primes.",
    check: (c) => c.bounty === 0
  },
  {
    id: "age_over_60",
    label: "Plus de 60 ans",
    description: "Figures légendaires et vétérans chevronnés de plus de 60 ans.",
    check: (c) => typeof c.age === "number" && c.age > 60
  },
  {
    id: "age_under_25",
    label: "Moins de 25 ans",
    description: "Jeunes pirates prometteurs et prodiges de moins de 25 ans.",
    check: (c) => typeof c.age === "number" && c.age < 25
  },
  {
    id: "height_under_3m",
    label: "Moins de 3 mètres",
    description: "Combattants à échelle humaine mesurant moins de 300 cm (3 mètres).",
    check: (c) => typeof c.height === "number" && c.height < 300
  },
  {
    id: "height_over_3m",
    label: "Plus de 3 mètres",
    description: "Colosses et détenteurs de physiques démesurés de 300 cm (3 mètres) ou plus.",
    check: (c) => typeof c.height === "number" && c.height >= 300
  }
];

// Aesthetic color palettes inspired by connections (Yellow, Green, Blue, Purple)
const THEMES = [
  { // Easy (Yellow)
    bg: "bg-amber-100 hover:bg-amber-150 border-amber-300",
    text: "text-amber-900",
    border: "border-amber-400",
    solvedBg: "bg-amber-500",
    solvedText: "text-white",
    solvedBorder: "border-amber-600"
  },
  { // Medium (Green)
    bg: "bg-emerald-100/90 hover:bg-emerald-150 border-emerald-300",
    text: "text-emerald-950",
    border: "border-emerald-400",
    solvedBg: "bg-emerald-600",
    solvedText: "text-white",
    solvedBorder: "border-emerald-700"
  },
  { // Hard (Blue)
    bg: "bg-sky-100/90 hover:bg-sky-150 border-sky-300",
    text: "text-sky-950",
    border: "border-sky-400",
    solvedBg: "bg-sky-600",
    solvedText: "text-white",
    solvedBorder: "border-sky-700"
  },
  { // Tricky (Purple)
    bg: "bg-purple-100/90 hover:bg-purple-150 border-purple-300",
    text: "text-purple-950",
    border: "border-purple-400",
    solvedBg: "bg-violet-600",
    solvedText: "text-white",
    solvedBorder: "border-violet-700"
  }
];

export default function SecretAlliances({ characters, onUpdateBounty }: SecretAlliancesProps) {
  const [allCategories, setAllCategories] = useState<AllianceCategory[]>([]);
  const [gridCharacters, setGridCharacters] = useState<Character[]>([]);
  const [solvedCategoryIds, setSolvedCategoryIds] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [errorsLeft, setErrorsLeft] = useState<number>(4);
  const [shakeIds, setShakeIds] = useState<string[]>([]);
  const [wasIncorrect, setWasIncorrect] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "info" | "error" | null }>({ text: "", type: null });
  const [scores, setScores] = useState({ plays: 0, wins: 0 });

  // Load scores on component mount
  useEffect(() => {
    const savedPlays = localStorage.getItem("alliance_plays");
    const savedWins = localStorage.getItem("alliance_wins");
    if (savedPlays || savedWins) {
      setScores({
        plays: Number(savedPlays || "0"),
        wins: Number(savedWins || "0")
      });
    }
  }, []);

  // Filter candidates and generate our first board when characters load
  useEffect(() => {
    if (characters.length > 0) {
      generateNewGrid();
    }
  }, [characters]);

  // Clean local state helper to empty selected states
  const resetSelection = () => {
    setSelectedIds([]);
  };

  const scoreCharacterPopularity = (c: Character): number => {
    let score = 0;

    // 1. Bounty score (Huge popularity/importance signal in One Piece)
    if (c.bounty > 0) {
      score += Math.log10(c.bounty) * 15;
      if (c.bounty >= 100000000) score += 50; 
      if (c.bounty >= 500000000) score += 80; 
    }

    // 2. Legendary teams or crews
    const crewLower = c.crew.toLowerCase();
    if ((crewLower.includes("straw") || crewLower.includes("chapeau")) && !crewLower.includes("fake") && !crewLower.includes("faux")) {
      score += 150;
    } else if (crewLower.includes("whitebeard") || crewLower.includes("barbe blanche")) {
      score += 80;
    } else if (crewLower.includes("beasts") || crewLower.includes("kaido") || crewLower.includes("big mom") || crewLower.includes("charlotte")) {
      score += 70;
    } else if (crewLower.includes("akagami") || crewLower.includes("shanks") || crewLower.includes("red hair")) {
      score += 100;
    } else if (crewLower.includes("blackbeard") || crewLower.includes("barbe noire")) {
      score += 80;
    }

    // 3. Affiliation status
    if (c.affiliation === "Marine") {
      score += 50;
    } else if (c.affiliation === "Révolutionnaire") {
      score += 60;
    } else if (c.affiliation === "Gouvernement") {
      score += 40;
    }

    // 4. Haki
    if (c.haki && c.haki.length > 0) {
      score += c.haki.length * 30;
      if (c.haki.includes("Haoshoku")) {
        score += 100;
      }
    }

    // 5. Devil Fruit
    if (c.devilFruit && c.devilFruit !== "Aucun") {
      score += 25;
      if (c.devilFruit === "Zoan Mythique" || c.devilFruit === "Logia") {
        score += 35;
      }
    }

    // 6. Detailed or custom description instead of simple placeholder
    const descLower = c.description.toLowerCase();
    const isGenericDesc = descLower.includes("associé") || descLower.includes("redoutable combattant") || descLower.includes("member of");
    if (!isGenericDesc && c.description.length > 30) {
      score += Math.min(c.description.length, 120) * 0.5;
    }

    // 7. Core prominent cast members & legendary figures
    const majorNames = [
      "luffy", "zoro", "nami", "usopp", "sanji", "chopper", "robin", "franky", "brook", "jinbe",
      "shanks", "buggy", "kaidou", "kaido", "linlin", "big mom", "newgate", "whitebeard", "blackbeard", "teach", "roger", "rayleigh", "reilly",
      "garp", "sengoku", "koby", "smoker", "tashigi", "kuzan", "aokiji", "sakazuki", "akainu", "borsalino", "kizaru", "ishsho", "fujitora", "aramaki", "ryokugyu",
      "mihawk", "hancock", "crocodile", "doflamingo", "moria", "kuma", "law", "kid", "weevil",
      "dragon", "sabo", "koala", "karasu", "morley", "lindbergh", "belo betty", "ivankov",
      "vivi", "rebecca", "shirahoshi", "yamato", "oden", "momonosuke", "kin'emon", "hiyori", "raizo", "nekomamushi", "inuarashi", "carrot", "perona", "pudding", "reiju", "ichiji", "niji", "yonji", "judge", "katakuri", "lucci", "kaku", "bon kurei", "mr.2", "ace", "marco", "vista", "jozu", "enel", "enell", "wyper", "gan fall", "bellamy", "wapol", "arlong", "don krieg", "kuro", "morgan", "alvida"
    ];
    const nameLower = c.name.toLowerCase();
    if (majorNames.some(m => nameLower.includes(m))) {
      score += 150;
    }

    return score;
  };

  const templatesAreCompatible = (t1Id: string, t2Id: string): boolean => {
    const incompatiblePairs = [
      ["crew_bigmom", "arc_wholecake"],
      ["crew_beasts", "arc_wano"],
      ["crew_whitebeard", "arc_summit"],
      ["marine_corps", "world_gov"],
      ["crew_strawhats", "arc_eastblue"],
      ["bounty_giga", "haki_kings"]
    ];
    for (const pair of incompatiblePairs) {
      if ((t1Id === pair[0] && t2Id === pair[1]) || (t1Id === pair[1] && t2Id === pair[0])) {
        return false;
      }
    }
    return true;
  };

  const selectedTemplatesAreCompatible = (templates: GroupTemplate[]): boolean => {
    for (let i = 0; i < templates.length; i++) {
      for (let j = i + 1; j < templates.length; j++) {
        if (!templatesAreCompatible(templates[i].id, templates[j].id)) {
          return false;
        }
      }
    }
    return true;
  };

  const generateNewGrid = () => {
    // 1. Filter out characters that don't have a real photo or high quality depiction
    const allCandidates = characters.filter((c) => {
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
      return hasRealPhoto && c.name && c.name !== "Inconnu";
    });

    // Score and select only the top 500 most well-known characters
    const validCandidates = [...allCandidates]
      .map(c => ({ character: c, score: scoreCharacterPopularity(c) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 500)
      .map(item => item.character);

    if (validCandidates.length < 30) {
      setMessage({
        text: "Données de pirates insuffisantes pour créer un puzzle d'alliances. Veuillez utiliser l'Encyclopédie pour charger plus de personnages.",
        type: "error"
      });
      return;
    }

    // 2. Clear state
    setSelectedIds([]);
    setSolvedCategoryIds([]);
    setErrorsLeft(4);
    setShakeIds([]);
    setWasIncorrect(false);
    setMessage({ text: "Grille d'alliances secrètes générée avec succès ! Trouvez les 4 liens.", type: "info" });

    // 3. Keep trying until we have exactly 4 disjoint categories of size 4
    let tries = 0;
    let selectedGroups: AllianceCategory[] = [];

    while (tries < 400) {
      tries++;
      // Shuffle our templates
      const availableTemplates = [...GROUP_TEMPLATES].sort(() => Math.random() - 0.5);
      const candidates = availableTemplates.slice(0, 4);

      if (!selectedTemplatesAreCompatible(candidates)) {
        continue;
      }

      const t0 = candidates[0];
      const t1 = candidates[1];
      const t2 = candidates[2];
      const t3 = candidates[3];

      // To prevent ambiguity, the characters for tX must satisfy tX but MUST NOT satisfy any of the other three active templates.
      const t0Exclusive = validCandidates.filter(c => t0.check(c) && !t1.check(c) && !t2.check(c) && !t3.check(c));
      const t1Exclusive = validCandidates.filter(c => t1.check(c) && !t0.check(c) && !t2.check(c) && !t3.check(c));
      const t2Exclusive = validCandidates.filter(c => t2.check(c) && !t0.check(c) && !t1.check(c) && !t3.check(c));
      const t3Exclusive = validCandidates.filter(c => t3.check(c) && !t0.check(c) && !t1.check(c) && !t2.check(c));

      if (t0Exclusive.length >= 4 && t1Exclusive.length >= 4 && t2Exclusive.length >= 4 && t3Exclusive.length >= 4) {
        const members0 = [...t0Exclusive].sort(() => Math.random() - 0.5).slice(0, 4);
        const members1 = [...t1Exclusive].sort(() => Math.random() - 0.5).slice(0, 4);
        const members2 = [...t2Exclusive].sort(() => Math.random() - 0.5).slice(0, 4);
        const members3 = [...t3Exclusive].sort(() => Math.random() - 0.5).slice(0, 4);

        selectedGroups = [
          { id: t0.id, label: t0.label, description: t0.description, characters: members0, colorTheme: THEMES[0] },
          { id: t1.id, label: t1.label, description: t1.description, characters: members1, colorTheme: THEMES[1] },
          { id: t2.id, label: t2.label, description: t2.description, characters: members2, colorTheme: THEMES[2] },
          { id: t3.id, label: t3.label, description: t3.description, characters: members3, colorTheme: THEMES[3] }
        ];
        break;
      }
    }

    // Fallback if random matching fails because pool is extremely constrained in this session
    if (selectedGroups.length < 4) {
      let tempPool = [...validCandidates];
      const BackupTemplates = [...GROUP_TEMPLATES].sort(() => Math.random() - 0.5);
      const backupCategories: AllianceCategory[] = [];

      for (const templ of BackupTemplates) {
        const matches = tempPool.filter(templ.check);
        if (matches.length >= 4) {
          const members = matches.slice(0, 4);
          tempPool = tempPool.filter(c => !members.some(m => m.id === c.id));
          backupCategories.push({
            id: templ.id,
            label: templ.label,
            description: templ.description,
            characters: members,
            colorTheme: THEMES[backupCategories.length]
          });
          if (backupCategories.length === 4) {
            selectedGroups = backupCategories;
            break;
          }
        }
      }
    }

    if (selectedGroups.length < 4) {
      setMessage({
        text: "⚠️ Échec de la génération des alliances disjointes. Veuillez regénérer un nouveau contrat !",
        type: "error"
      });
      return;
    }

    setAllCategories(selectedGroups);

    // Collect all 16 characters and shuffle them
    const all16 = selectedGroups.flatMap(g => g.characters);
    setGridCharacters(all16.sort(() => Math.random() - 0.5));
  };

  // Turn manual click on a character card
  const handleCardClick = (charId: string) => {
    if (isGameOver() || isSuccess() || isCategorySolved(charId)) return;

    if (selectedIds.includes(charId)) {
      setSelectedIds(selectedIds.filter(id => id !== charId));
    } else {
      if (selectedIds.length < 4) {
        setSelectedIds([...selectedIds, charId]);
      }
    }
  };

  const isCategorySolved = (charId: string) => {
    return allCategories.some(cat => 
      solvedCategoryIds.includes(cat.id) && 
      cat.characters.some(char => char.id === charId)
    );
  };

  // Verify selections
  const handleVerifyAlliance = () => {
    if (selectedIds.length !== 4) return;

    // Check if the 4 selected characters match any of our 4 categories
    let matchingCat: AllianceCategory | undefined = undefined;

    for (const cat of allCategories) {
      if (solvedCategoryIds.includes(cat.id)) continue;

      const matchedAll = selectedIds.every(id => 
        cat.characters.some(char => char.id === id)
      );

      if (matchedAll) {
        matchingCat = cat;
        break;
      }
    }

    if (matchingCat) {
      // Dynamic success actions
      const newSolveds = [...solvedCategoryIds, matchingCat.id];
      setSolvedCategoryIds(newSolveds);
      setSelectedIds([]);
      setMessage({
        text: `Alliance Légendaire ! Vous avez déduit : "${matchingCat.label}" (${matchingCat.description})`,
        type: "success"
      });

      // Shaking clear
      setShakeIds([]);
      setWasIncorrect(false);

      // Check for absolute victory
      if (newSolveds.length === 4) {
        const nextWins = scores.wins + 1;
        const nextPlays = scores.plays + 1;
        setScores({ plays: nextPlays, wins: nextWins });
        localStorage.setItem("alliance_plays", String(nextPlays));
        localStorage.setItem("alliance_wins", String(nextWins));
        
        if (onUpdateBounty) {
          onUpdateBounty(10000); // +10 000 Berries
        } else {
          const currentBounty = Number(localStorage.getItem("playerBountyValue") || "0");
          localStorage.setItem("playerBountyValue", String(currentBounty + 10000)); // +10 000 Berries
          window.dispatchEvent(new Event("storage"));
        }
      }
    } else {
      // Dynamic error penalty
      const nextErrors = errorsLeft - 1;
      setErrorsLeft(nextErrors);
      setShakeIds(selectedIds);
      setWasIncorrect(true);

      // Check if we spent our last mistake
      if (nextErrors === 0) {
        const nextPlays = scores.plays + 1;
        setScores(prev => ({ ...prev, plays: nextPlays }));
        localStorage.setItem("alliance_plays", String(nextPlays));
        setMessage({
          text: "Dommage ! Votre équipage est à court de boussoles. Les Alliances secrètes se sont dissoutes !",
          type: "error"
        });
      } else {
        setMessage({
          text: `Combinaison incorrecte ! -1 tentative (Tentatives restantes : ${nextErrors})`,
          type: "error"
        });
      }

      // Reset shake class after 600ms
      setTimeout(() => {
        setShakeIds([]);
        setWasIncorrect(false);
      }, 650);
    }
  };

  // Shuffle remaining grid items
  const handleShuffleGrid = () => {
    if (isGameOver() || isSuccess()) return;
    
    // Shuffle only characters belonging to categories that are not completed yet
    const unsolvedChars = gridCharacters.filter(c => !isCategorySolved(c.id));
    const solvedChars = gridCharacters.filter(c => isCategorySolved(c.id));
    
    const shuffledUnsolved = [...unsolvedChars].sort(() => Math.random() - 0.5);
    setGridCharacters([...solvedChars, ...shuffledUnsolved]);
  };

  const isGameOver = () => errorsLeft <= 0;
  const isSuccess = () => solvedCategoryIds.length === 4 && allCategories.length === 4;

  const getUnsolvedRemainingCount = () => {
    return gridCharacters.filter(c => !isCategorySolved(c.id)).length;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans">
      
      {/* Dynamic inline styles to prevent any dependency constraint for shake animation */}
      <style>{`
        @keyframes customConnectionsShake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .anim-alliance-shake {
          animation: customConnectionsShake 0.5s ease-in-out;
        }
      `}</style>

      {/* Page Title & Description */}
      <div className="text-center mb-10 relative text-white">
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white font-heading mb-2 uppercase">
          Les Alliances Secrètes
        </h2>
        <p className="text-slate-300 max-w-2xl mx-auto text-xs sm:text-sm font-medium leading-relaxed">
          Ce jeu vous défie de classer 16 personnages d'One Piece en 4 groupes secrets de 4 personnages partageant une caractéristique commune !
        </p>

        {/* Local Stat Box */}
        <div className="flex justify-center mt-4">
          <div className="bg-[#11142A]/85 backdrop-blur-md border border-white/10 rounded-2xl p-2 px-4 flex items-center gap-4 text-white">
            <div className="text-center">
              <span className="text-[9px] uppercase font-mono text-slate-400 font-bold block">Parties</span>
              <span className="text-sm font-black leading-none">{scores.plays}</span>
            </div>
            <div className="w-px h-5 bg-white/10" />
            <div className="text-center">
              <span className="text-[9px] uppercase font-mono text-slate-400 font-bold block">Victoires</span>
              <span className="text-sm font-black text-emerald-400 leading-none">{scores.wins}</span>
            </div>
            <div className="w-px h-5 bg-white/10" />
            <div className="text-center font-mono">
              <span className="text-[9px] uppercase text-slate-400 font-bold block">Ratio</span>
              <span className="text-xs font-bold text-slate-300">
                {scores.plays > 0 ? `${Math.round((scores.wins / scores.plays) * 100)}%` : "0%"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Connection Workspace */}
      <div className="bg-white border-2 border-[#1A1A1A] rounded-3xl p-5 md:p-8 shadow-xl space-y-6">
        
        {/* Game Stats & Errors header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4">
          
          {/* Instruction helper */}
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-violet-500 shrink-0" />
            <span className="text-xs font-medium text-gray-600">
              Faites des alliances de <strong className="font-bold text-gray-900">4 personnages</strong> pour révéler la catégorie secrète.
            </span>
          </div>

          {/* Error Counters */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-extrabold text-[#1A1A1A] uppercase tracking-wider">
              TENTATIVES RESTANTES :
            </span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((heart) => (
                <div 
                  key={heart}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    heart <= errorsLeft 
                      ? "bg-rose-500 text-white scale-100" 
                      : "bg-slate-100 text-slate-300 scale-90"
                  }`}
                >
                  <span className="text-[10px] font-mono">☠</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Solved category boards (Connections yellow/green/blue/purple lines) */}
        <div className="space-y-3">
          {allCategories.map((cat) => {
            const isSolved = solvedCategoryIds.includes(cat.id);
            if (!isSolved && !isGameOver()) return null;

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 md:p-5 rounded-2xl border-2 shadow-sm text-center transition-all ${
                  isSolved 
                    ? `${cat.colorTheme.solvedBg} ${cat.colorTheme.solvedText} ${cat.colorTheme.solvedBorder}`
                    : `bg-slate-100/90 text-slate-400 border-dashed border-slate-350 line-through`
                }`}
              >
                <div className="text-[10px] font-mono uppercase tracking-widest font-black opacity-80 mb-0.5">
                  Alliance débusquée : {cat.id === "haki_kings" ? "🔥 DÉFI EXTRA" : isSolved ? "✓ VALIDÉ" : "✗ RÉVÉLATION DE RECRUTE"}
                </div>
                <h4 className="font-heading font-black text-lg md:text-xl uppercase tracking-tight leading-tight">
                  {cat.label}
                </h4>
                <p className="text-xs font-mono font-medium opacity-90 max-w-2xl mx-auto my-1">
                  {cat.description}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-1.5 font-sans font-extrabold text-xs">
                  {cat.characters.map((char) => (
                    <span 
                      key={char.id} 
                      className={`px-3 py-1 bg-white/20 backdrop-blur-xs rounded-full border border-white/10 alliance-solved-char-name ${
                        isSolved ? "text-white" : "text-gray-400"
                      } ${getNotranslateClass()}`}
                    >
                      {char.name}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 4x4 Interactive Grid list and status */}
        {getUnsolvedRemainingCount() > 0 && !isGameOver() ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            {gridCharacters.map((char) => {
              if (isCategorySolved(char.id)) return null;

              const isSelected = selectedIds.includes(char.id);
              const shouldShake = shakeIds.includes(char.id) && wasIncorrect;

              return (
                <button
                  key={char.id}
                  onClick={() => handleCardClick(char.id)}
                  className={`relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-3 bg-slate-50 text-left transition-all duration-200 shadow-sm ${
                    isSelected 
                      ? "border-amber-500 scale-102 ring-2 sm:ring-4 ring-amber-100 shadow-md shadow-amber-200" 
                      : "border-slate-300 hover:border-slate-800 focus:outline-none"
                  } ${shouldShake ? "anim-alliance-shake border-rose-500 ring-2 sm:ring-4 ring-rose-100 bg-rose-50" : ""}`}
                >
                  {/* Character Illustration */}
                  <div className="w-full h-full relative">
                    <img
                      src={char.image}
                      alt={char.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover select-none pointer-events-none"
                      onError={(e) => handleImageError(e, char.affiliation)}
                    />

                    {/* Shading overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent p-1 sm:p-1.5 pt-4 pb-1 sm:pb-1.5 text-center flex flex-col justify-end">
                      <span className={`text-white font-heading font-black text-[9px] min-[320px]:text-[10px] sm:text-xs md:text-sm uppercase tracking-wide leading-tight drop-shadow-md select-none break-words text-wrap line-clamp-2 force-text-white alliance-grid-char-name ${getNotranslateClass()}`}>
                        {char.name}
                      </span>
                    </div>

                    {/* Selected Index Bubble marker */}
                    {isSelected && (
                      <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-5 h-5 sm:w-6 sm:h-6 bg-violet-600 text-white border-1.5 sm:border-2 border-white rounded-full flex items-center justify-center font-heading font-black text-[9px] sm:text-[11px] shadow-sm">
                        {selectedIds.indexOf(char.id) + 1}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}

        {/* Global Feedback messages */}
        {message.text && (
          <div className={`p-4 rounded-xl text-center text-xs font-semibold border-2 tracking-wide ${
            message.type === "success" 
              ? "bg-emerald-50 text-emerald-800 border-emerald-300" 
              : message.type === "error" 
                ? "bg-rose-50 text-rose-800 border-rose-300" 
                : "bg-slate-50 text-slate-700 border-slate-200"
          }`}>
            {message.type === "success" && "🎉 "}
            {message.type === "error" && "☠ "}
            {message.text}
          </div>
        )}

        {/* Dynamic Action Controls bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleShuffleGrid}
              disabled={isGameOver() || isSuccess()}
              className="px-4 py-3 border border-slate-350 text-slate-700 hover:bg-slate-50 text-xs font-heading font-black rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer w-1/2 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed select-none"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Mélanger
            </button>
            <button
              onClick={resetSelection}
              disabled={selectedIds.length === 0 || isGameOver() || isSuccess()}
              className="px-4 py-3 border border-slate-350 text-slate-700 hover:bg-slate-50 text-xs font-heading font-black rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer w-1/2 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed select-none"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              Réinitialiser
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {selectedIds.length === 4 ? (
              <button
                onClick={handleVerifyAlliance}
                className="w-full sm:w-auto px-6 py-3.5 bg-[#1A1A1A] hover:bg-[#8b5cf6] text-white font-heading font-black text-xs rounded-xl cursor-pointer transition-all uppercase tracking-widest text-center shadow-md border border-neutral-800 select-none"
              >
                Valider l'Alliance (4) ✔
              </button>
            ) : (
              <button
                disabled
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 text-gray-400 font-heading font-black text-xs rounded-xl cursor-not-allowed uppercase tracking-widest text-center border border-dashed border-gray-200 select-none"
              >
                Sélectionnez 4 pirates ({selectedIds.length}/4)
              </button>
            )}
          </div>

        </div>

        {/* Final Game Over modal popup or result window */}
        {(isGameOver() || isSuccess()) && (
          <div className="bg-slate-50 border-2 border-[#1A1A1A] rounded-2xl p-6 text-center space-y-4">
            <h3 className="font-heading font-black text-xl uppercase text-gray-900 flex flex-col items-center justify-center gap-1">
              {isSuccess() ? (
                <>
                  <span className="flex items-center gap-2">
                    <Award className="w-6 h-6 text-violet-600 animate-bounce" />
                    Victoire Absolue !
                  </span>
                  <span className="text-emerald-500 font-black font-mono text-[13px] uppercase tracking-wider block pt-1 animate-pulse">
                    +10 000 ฿ Prime augmentée !
                  </span>
                </>
              ) : (
                <span className="flex items-center gap-2">
                  <AlertOctagon className="w-6 h-6 text-rose-500" />
                  Compte à Rebours Terminé
                </span>
              )}
            </h3>
            
            <p className="text-xs text-gray-600 max-w-lg mx-auto leading-relaxed">
              {isSuccess() ? (
                "Quel sens stratégique ! Vous avez identifié l'intégralité des 4 Alliances Secrètes qui régissaient le destin de la Route de tous les périls ! Vous remportez +10 000 Berrys ฿ !"
              ) : (
                "Vous n'êtes pas parvenu à percer la totalité des tactiques secrètes avant vos 4 erreurs, mais persévérez ! Relancez l'aventure avec de nouvelles combinaisons pour parfaire votre culture pirate."
              )}
            </p>

            <div className="pt-2">
              <button
                onClick={generateNewGrid}
                className="mx-auto w-full sm:w-auto max-w-xs py-3.5 px-6 bg-[#1A1A1A] hover:bg-violet-600 text-white font-heading font-black text-xs rounded-xl cursor-pointer transition-all uppercase tracking-widest shadow-md border border-black flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Générer une nouvelle grille
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}

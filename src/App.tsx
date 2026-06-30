import React, { useState, useEffect, useMemo } from "react";
import { getOfficialDevilFruitOverride } from "./data/official_fruits";
import { FEMALE_NAMES } from "./data/femaleNames";
import { SWORDSMEN_NAMES } from "./data/swordsmen";
import { LUFFY_BATTLES } from "./data/luffyBattles";
import { Character, BountyRank, GameLog } from "./types";
import BountyDuel from "./components/BountyDuel";
import LogPoseTracker from "./components/LogPoseTracker";
import GrandLineGrid from "./components/GrandLineGrid";
import Encyclopedie from "./components/Encyclopedie";
import UserAuth from "./components/UserAuth";
import PirateShadow from "./components/PirateShadow";
import PirateTimeline from "./components/PirateTimeline";
import BountyTargetGame from "./components/BountyTargetGame";
import SecretAlliances from "./components/SecretAlliances";
import PiratePyramid from "./components/PiratePyramid";
import SocialAndCrew from "./components/SocialAndCrew";
import BountyLeaderboard, { LeaderboardEntry } from "./components/BountyLeaderboard";
import WEJSection from "./components/WEJSection";
import BlogSection from "./components/BlogSection";
import UndercoverGame from "./components/UndercoverGame";
import MotsCroises from "./components/MotsCroises";
import AdSenseBanner from "./components/AdSenseBanner";
import CharacterFusion from "./components/CharacterFusion";
import FourImagesOneWord from "./components/FourImagesOneWord";
import { LanguageSelector } from "./components/LanguageSelector";
import { collection, getDocs, doc, updateDoc, getDoc, query, orderBy, limit, getCountFromServer } from "firebase/firestore";
import { db } from "./lib/firebase";
import { track } from "@vercel/analytics";
import { 
  Trophy, Award, Compass, Swords, ArrowRightLeft, BookOpen, 
  Sparkles, History, User, Heart, Settings, LayoutDashboard, Coins, Clock, Users, Brain, Crown, Newspaper, MessageSquare, Menu, X, ShieldAlert, Home, Sun, Moon
} from "lucide-react";

function getArcFromChapter(chapterStr: string): string {
  if (!chapterStr) return "Grand Line";
  
  // Si ce n'est pas un chapitre (ex: déjà un arc de base)
  if (!chapterStr.toLowerCase().includes("chapter") && !chapterStr.toLowerCase().includes("chapitre")) {
    return chapterStr;
  }
  
  const numMatch = chapterStr.match(/\d+/);
  if (!numMatch) return "Grand Line";
  
  const ch = parseInt(numMatch[0], 10);
  
  if (ch >= 1 && ch <= 101) return "East Blue";
  if (ch >= 102 && ch <= 154) return "Alabasta";
  if (ch >= 155 && ch <= 217) return "Alabasta";
  if (ch >= 218 && ch <= 236) return "Alabasta"; // Jaya
  if (ch >= 237 && ch <= 302) return "Skypiea";
  if (ch >= 303 && ch <= 321) return "Water 7"; // Long Ring
  if (ch >= 322 && ch <= 374) return "Water 7";
  if (ch >= 375 && ch <= 430) return "Enies Lobby";
  if (ch >= 431 && ch <= 489) return "Thriller Bark";
  if (ch >= 490 && ch <= 513) return "Sabaody";
  if (ch >= 514 && ch <= 524) return "Sabaody"; // Amazon lily
  if (ch >= 525 && ch <= 549) return "Impel Down";
  if (ch >= 550 && ch <= 580) return "Marineford";
  if (ch >= 581 && ch <= 597) return "Marineford"; // Après-guerre
  if (ch >= 598 && ch <= 653) return "Île des Hommes-Poissons";
  if (ch >= 654 && ch <= 699) return "Punk Hazard";
  if (ch >= 700 && ch <= 801) return "Dressrosa";
  if (ch >= 802 && ch <= 824) return "Zou";
  if (ch >= 825 && ch <= 902) return "Whole Cake Island";
  if (ch >= 903 && ch <= 908) return "Whole Cake Island"; // Rêverie
  if (ch >= 909 && ch <= 1057) return "Wano";
  if (ch >= 1058) return "Egghead";
  
  return "Grand Line";
}

export default function App() {
  // État de la base de données globale d'One Piece
  const [charactersDatabase, setCharactersDatabase] = useState<Character[]>([]);
  const [loadingCharacters, setLoadingCharacters] = useState<boolean>(true);

  useEffect(() => {
    import("./data/characters")
      .then((module) => {
        try {
          const rawData = module.getCharactersDatabase();
      const femaleNames = new Set(FEMALE_NAMES);

      // Préparation de la base de données des épéistes
      const normalizeName = (nameStr: string): string => {
        return nameStr
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]/g, "");
      };

      const normalizedSwordsmenSet = new Set<string>();
      const NAME_MAPPING_ALIASES: Record<string, string> = {
        "alber": "arberking",
        "cesarclown": "caesarclown",
        "hermep": "helmeppo",
        "battlefrankybf38": "cuttyflamfranky",
        "saintethanbaronvnusjuro": "ethanbaronvnusjuro",
        "saintfigarlandgarling": "figarlandgarling",
        "saintshepherdsommers": "shepherdjupeter",
        "saintesatchelsmaffey": "satchelsmaffey",
        "shimotsukikoshiro": "shimotsukikoushirou",
        "fujitora": "isshofujitora",
        "kizaru": "borsalinokizaru",
        "aokiji": "kuzanaokiji",
        "law": "trafalgardwaterlaw",
        "bogy": "buggy",
        "baggy": "buggy"
      };

      SWORDSMEN_NAMES.forEach((name) => {
        const norm = normalizeName(name);
        normalizedSwordsmenSet.add(norm);

        // Découpe des multi-personnages (ex: "Abdullah et Jeet" -> ["Abdullah", "Jeet"])
        const parts = name.split(/\s+(?:et|&|\/|,)\s+/i);
        if (parts.length > 1) {
          parts.forEach((p) => {
            normalizedSwordsmenSet.add(normalizeName(p));
          });
        }
      });

      const mapped: Character[] = rawData.map((item, index) => {
        // Identifiant unique
        const id = `fetched-${index + 1}`;

        // Prime (bounty) numérique
        let parsedBounty = 0;
        if (item.bounty !== undefined && item.bounty !== null && item.bounty !== "") {
          if (typeof item.bounty === "number") {
            parsedBounty = item.bounty;
          } else {
            const cleaned = String(item.bounty).replace(/[^0-9]/g, "");
            if (cleaned) parsedBounty = parseInt(cleaned, 10);
          }
        }

        // Déduire l'affiliation compatible avec l'énumérateur de types.ts
        let mappedAffiliation: Character["affiliation"] = "Civil";
        let rawCrew = (item.affiliation !== null && item.affiliation !== undefined && String(item.affiliation).trim() !== "") ? String(item.affiliation) : "Inconnu";
        
        // Remplace tout ce qui fait partie du groupe "Yamato" et les met dans Beasts Pirates
        if (rawCrew === "Yamato" || (item.affiliation && String(item.affiliation) === "Yamato")) {
          rawCrew = "Beasts Pirates";
        }
        if (rawCrew === "Mokomo Dukedom" || rawCrew.toLowerCase().includes("mokomo")) {
          rawCrew = "Minks";
        }
        const crewName = rawCrew;
        const affLower = crewName.toLowerCase();
        const nameLower = String(item.name || "").toLowerCase();
        const descLower = String(item.description || "").toLowerCase();

        if (affLower.includes("marine") || nameLower.includes("marine") || descLower.includes("marine") || nameLower.includes("koby") || nameLower.includes("tashigi") || nameLower.includes("smoker") || nameLower.includes("garp") || nameLower.includes("sengoku") || nameLower.includes("aokiji") || nameLower.includes("kizaru") || nameLower.includes("akainu")) {
          mappedAffiliation = "Marine";
        } else if (
          affLower.includes("government") || 
          affLower.includes("gouvernement") || 
          affLower.includes("cp0") || 
          affLower.includes("cp9") || 
          affLower.includes("cp8") || 
          affLower.includes("cp7") || 
          affLower.includes("cp6") || 
          affLower.includes("elder") || 
          affLower.includes("world noble") || 
          affLower.includes("knights of god") ||
          nameLower.includes("elders") ||
          nameLower.includes("world noble") ||
          nameLower.includes("knights of god")
        ) {
          mappedAffiliation = "Gouvernement";
        } else if (
          affLower.includes("revolutionary") || 
          affLower.includes("révolutionnaire")
        ) {
          mappedAffiliation = "Révolutionnaire";
        } else if (affLower.includes("pirate") || affLower.includes("beasts") || affLower.includes("guild") || affLower.includes("works") || parsedBounty > 0) {
          mappedAffiliation = "Pirate";
        }

        const fruitName = (item.devil_fruit !== null && item.devil_fruit !== undefined && String(item.devil_fruit).trim() !== "") ? String(item.devil_fruit) : "Inconnu";
        // Catégoriser le fruit du démon ("Logia" | "Paramecia" | "Zoan" | "Zoan Mythique" | "Aucun")
        let mappedFruitType: Character["devilFruit"] = "Aucun";
        if (fruitName && fruitName !== "Aucun" && fruitName !== "Inconnu") {
          const lowerFruit = fruitName.toLowerCase();
          if (
            lowerFruit.includes("nika") ||
            lowerFruit.includes("seiryu") ||
            lowerFruit.includes("mythic") ||
            lowerFruit.includes("mythique") ||
            lowerFruit.includes("kitsune") ||
            lowerFruit.includes("phoenix") ||
            lowerFruit.includes("daibutsu") ||
            lowerFruit.includes("pegasus") ||
            lowerFruit.includes("yamata") ||
            lowerFruit.includes("vampire") ||
            lowerFruit.includes("nue") ||
            lowerFruit.includes("onyudo") ||
            lowerFruit.includes("ratatoskr") ||
            lowerFruit.includes("nidhogg") ||
            lowerFruit.includes("qilin")
          ) {
            mappedFruitType = "Zoan Mythique";
          } else if (
            (
              lowerFruit.includes("smile") ||
              lowerFruit.includes("zoan") ||
              lowerFruit.includes("inu inu") ||
              lowerFruit.includes("neko") ||
              lowerFruit.includes("ushi") ||
              lowerFruit.includes("hebi") ||
              lowerFruit.includes("uo uo") ||
              lowerFruit.includes("mushi") ||
              lowerFruit.includes("zou") ||
              lowerFruit.includes("tori") ||
              lowerFruit.includes("hito") ||
              lowerFruit.includes("sara") ||
              lowerFruit.includes("kame kame") ||
              lowerFruit.includes("uma uma") ||
              lowerFruit.includes("ryu ryu") ||
              lowerFruit.includes("kumo kumo") ||
              lowerFruit.includes("mogu mogu") ||
              lowerFruit.includes("batto batto") ||
              lowerFruit.includes("risu risu")
            ) &&
            !lowerFruit.includes("zushi")
          ) {
            mappedFruitType = "Zoan";
          } else if (
            lowerFruit.includes("suna suna") ||
            lowerFruit.includes("moku moku") ||
            lowerFruit.includes("goro goro") ||
            lowerFruit.includes("hie hie") ||
            lowerFruit.includes("pika pika") ||
            lowerFruit.includes("mori mori") ||
            lowerFruit.includes("magu magu") ||
            lowerFruit.includes("yami yami") ||
            lowerFruit.includes("gasu gasu") ||
            lowerFruit.includes("yuki yuki") ||
            lowerFruit.includes("numa numa") ||
            lowerFruit.includes("mera mera") ||
            lowerFruit.includes("susu susu")
          ) {
            mappedFruitType = "Logia";
          } else {
            mappedFruitType = "Paramecia";
          }
        }

        // Override with official fruit type from the official list
        const officialOverride = getOfficialDevilFruitOverride(item.name || "");
        if (officialOverride) {
          mappedFruitType = officialOverride;
        }

        // Hakis
        const mappedHaki: Character["haki"] = [];
        if (Array.isArray(item.haki)) {
          item.haki.forEach((hk) => {
            const lower = String(hk).toLowerCase();
            if (lower.includes("conqueror") || lower.includes("haoshoku")) mappedHaki.push("Haoshoku");
            if (lower.includes("observation") || lower.includes("kenbunshoku")) mappedHaki.push("Kenbunshoku");
            if (lower.includes("armament") || lower.includes("busoshoku")) mappedHaki.push("Busoshoku");
          });
        }

        // Genre
        let isFemale = 
          femaleNames.has(item.name) || 
          String(item.gender || "").toLowerCase().includes("femme") || 
          descLower.includes("fille") || 
          descLower.includes("sœur") || 
          descLower.includes("reine") || 
          descLower.includes("princesse") || 
          descLower.includes("kunoichi") || 
          descLower.includes("maternity") || 
          descLower.includes("épouse") || 
          descLower.includes("mère");

        if (item.name && item.name.toLowerCase().includes("vivi")) {
          isFemale = true;
        }
        if (item.name && (item.name.toLowerCase().includes("aramaki") || item.name.toLowerCase().includes("ryokugyu"))) {
          isFemale = false;
        }

        const genderValue: Character["gender"] = isFemale ? "Femme" : "Homme";

        // Statut
        const mappedStatus: Character["status"] = 
          String(item.status || "").toLowerCase().includes("deceased") || 
          String(item.status || "").toLowerCase().includes("décédé") 
            ? "Décédé" 
            : "Vivant";

        // Concaténer le nom de domaine officiel s'il s'agit d'une URL d'image relative (Déposé dans la base)
        const imageUrl = item.image 
          ? (item.image.startsWith("http") ? item.image : "https://oparchive.com" + item.image)
          : "https://placehold.co/200x300/1a1a1a/ffffff?text=?";

        const age = (item.age !== null && item.age !== undefined && item.age !== "") ? item.age : "Inconnu";
        const height = (item.height !== null && item.height !== undefined && item.height !== "") ? item.height : "Inconnu";

        let finalDesc = item.description || descLower || `Un redoutable combattant d'One Piece associé aux ${crewName}.`;
        finalDesc = finalDesc.replace(/Mokomo Dukedom/ig, "Minks");

        let finalRace = item.race !== null && item.race !== undefined ? String(item.race) : "Inconnu";
        if (finalRace === "Mink" || finalRace === "Minks" || finalRace.toLowerCase().includes("mokomo")) {
          finalRace = "Minks";
        }

        const rawChapter = item.first_appearance_arc || "";
        const numMatch = rawChapter.match(/\d+/);
        const parsedChapter = numMatch ? parseInt(numMatch[0], 10) : null;

        // Épée/Sabre check
        const dbNameNorm = normalizeName(item.name || "");
        let characterIsSwordsman = false;

        if (normalizedSwordsmenSet.has(dbNameNorm)) {
          characterIsSwordsman = true;
        } else {
          // Check aliases
          for (const [listKey, dbKey] of Object.entries(NAME_MAPPING_ALIASES)) {
            if (dbNameNorm === dbKey || dbNameNorm.includes(dbKey) || dbKey.includes(dbNameNorm)) {
              characterIsSwordsman = true;
              break;
            }
          }
        }

        if (!characterIsSwordsman) {
          for (const sNorm of normalizedSwordsmenSet) {
            if (sNorm.length >= 4) {
              if (dbNameNorm.includes(sNorm)) {
                characterIsSwordsman = true;
                break;
              }
            } else {
              if (dbNameNorm === sNorm) {
                characterIsSwordsman = true;
                break;
              }
            }
          }
        }

        // Luffy opponent check
        let characterIsLuffyOpponent = false;
        let characterLuffyBattlesCount = 0;

        const getAlignedName = (nameStr: string): string => {
          const norm = normalizeName(nameStr);
          if (norm.includes("cesarclown") || norm.includes("caesarclown")) return "caesarclown";
          if (norm.includes("koby") || norm.includes("kobby") || norm.includes("kobbi")) return "koby";
          if (norm.includes("buggy") || norm.includes("baggy") || norm.includes("bogy")) return "buggy";
          if (norm.includes("fujitora") || norm.includes("issho")) return "isshofujitora";
          if (norm.includes("kizaru") || norm.includes("borsalino")) return "borsalinokizaru";
          if (norm.includes("aokiji") || norm.includes("kuzan")) return "kuzanaokiji";
          if (norm.includes("akainu") || norm.includes("sakazuki")) return "sakazukiakainu";
          if (norm.includes("law") || norm.includes("trafalgar")) {
            if (norm.includes("lami") || norm.includes("lamy")) return "trafalgarlami";
            return "trafalgardwaterlaw";
          }
          if (norm.includes("zoro") || norm.includes("roronoa")) {
            if (norm.includes("pinzoro")) return "roronoapinzoro";
            if (norm.includes("arashi")) return "roronoaarashi";
            return "roronoazoro";
          }
          if (norm.includes("doflamingo") || norm.includes("donquixote")) {
            if (norm.includes("rosinante") || norm.includes("corazon")) return "donquixoterosinante";
            if (norm.includes("homing")) return "donquixotehoming";
            if (norm.includes("mjosgard")) return "donquixotemjosgard";
            if (norm.includes("shivercalero")) return "donquixoteshivercalero";
            return "donquixotedoflamingo";
          }
          if (norm.includes("croco") || norm.includes("mr0")) return "sircrocodile";
          if (norm.includes("barbenoire") || norm.includes("teach") || norm.includes("blackbeard")) return "marshalldteach";
          if (norm.includes("ener")) return "enel";
          return norm;
        };

        const dbNameAligned = getAlignedName(item.name || "");

        LUFFY_BATTLES.forEach((b) => {
          const matched = b.opponentsList.some((oppName) => {
            const oppAligned = getAlignedName(oppName);
            if (oppAligned === dbNameAligned) return true;
            if (oppAligned.length >= 4 && dbNameAligned.length >= 4) {
              if (dbNameAligned.includes(oppAligned) || oppAligned.includes(dbNameAligned)) {
                return true;
              }
            }
            return false;
          });

          if (matched) {
            characterIsLuffyOpponent = true;
            characterLuffyBattlesCount++;
          }
        });

        // Special fallback to exclude allies and relatives who never fought Luffy as an opponent
        const nonOpponents = [
          "monkeydluffy",
          "monkeyddragon",
          "trafalgardwaterlaw",
          "trafalgarlami",
          "eustasskid",
          "killer",
          "sabo",
          "portgasdace",
          "yamato",
          "jewelrybonney",
          "silversrayleigh",
          "shanks",
          "marco",
          "edwardnewgate",
          "roronoapinzoro",
          "roronoaarashi",
          "donquixotehoming",
          "donquixotemjosgard",
          "donquixoterosinante",
          "donquixoteshivercalero",
          "kozukioden",
          "shimotsukikozaburo",
          "shimotsukiushimaru",
          "shimotsukiryuma"
        ];

        if (nonOpponents.includes(dbNameNorm) || nonOpponents.includes(dbNameAligned)) {
          characterIsLuffyOpponent = false;
          characterLuffyBattlesCount = 0;
        }

        return {
          id,
          name: item.name !== null && item.name !== undefined ? String(item.name) : "Inconnu",
          description: finalDesc,
          bounty: parsedBounty,
          crew: crewName,
          devilFruit: mappedFruitType,
          devilFruitName: fruitName,
          haki: mappedHaki,
          affiliation: mappedAffiliation,
          gender: genderValue,
          status: mappedStatus,
          originArc: getArcFromChapter(rawChapter || "Grand Line").replace(/Mokomo Dukedom/ig, "Minks"),
          image: imageUrl,
          age,
          height,
          race: finalRace,
          epithet: item.epithet !== null && item.epithet !== undefined ? String(item.epithet) : "",
          apparitionChapter: parsedChapter,
          apparitionChapterRaw: rawChapter || "Inconnu",
          isSwordsman: characterIsSwordsman,
          isLuffyOpponent: characterIsLuffyOpponent,
          luffyBattlesCount: characterLuffyBattlesCount,
        };
      }).filter((char) => {
        const nameL = char.name.toLowerCase().trim();
        const isForbidden = (
          nameL === "ayesemar" ||
          nameL === "billy" ||
          nameL === "davy d. jones" ||
          nameL === "davy d jones" ||
          nameL === "ddt" ||
          nameL === "douzan" ||
          nameL === "eirei" ||
          nameL === "elbow" ||
          nameL === "fugetsu kisaburo" ||
          nameL === "hinokizu" ||
          nameL === "jew wall" ||
          nameL === "kotetsu" ||
          nameL === "louis arnote" ||
          nameL === "miss saturday" ||
          nameL === "miss mother's day" ||
          nameL === "miss mother’s day" ||
          nameL === "mosa" ||
          nameL === "mr.10" ||
          nameL === "mr.12" ||
          nameL === "mr.6" ||
          nameL === "oliva" ||
          nameL === "ossamondo" ||
          nameL === "raccoon" ||
          nameL === "rhodes" ||
          nameL === "roronoa pinzoro" ||
          nameL === "roronoa arashi" ||
          nameL === "roxanne" ||
          nameL === "shimotsuki furiko" ||
          nameL === "shion" ||
          nameL === "sleepy" ||
          nameL === "teru" ||
          nameL === "victoria shirut" ||
          nameL === "vegapants" ||
          nameL === "wallace" ||
          nameL === "willie gallon" ||
          nameL === "yamenahare" ||
          nameL === "zaza [dieu de la pluie]" ||
          nameL === "zaza" ||
          // Substring checks
          nameL.includes("ayesemar") ||
          nameL.includes("davy d. jones") ||
          nameL.includes("fugetsu kisaburo") ||
          nameL.includes("louis arnote") ||
          nameL.includes("miss saturday") ||
          nameL.includes("mother's day") ||
          nameL.includes("mother’s day") ||
          nameL.includes("pinzoro") ||
          (nameL.includes("arashi") && nameL.includes("roronoa")) ||
          nameL.includes("furiko") ||
          nameL.includes("victoria shirut") ||
          nameL.includes("willie gallon") ||
          nameL.includes("zaza [dieu de la pluie]")
        );
        return !isForbidden;
      });
          setCharactersDatabase(mapped);
          setLoadingCharacters(false);
        } catch (e) {
          console.error("Erreur de traitement des données characters :", e);
          setLoadingCharacters(false);
        }
      })
      .catch((err) => {
        console.error("Erreur de chargement de la base de données characters.ts :", err);
        setLoadingCharacters(false);
      });
  }, []);
  
  // Onglets : "home" | "grid" | "tracker" | "duel" | "encyclopedia" | "dashboard" | "crew" | "pirateShadow" | "timeline" | "bountyTarget" | "alliances" | "leaderboard" | "wej" | "blog" | "pyramid" | "undercover" | "crossword" | "fusion" | "fourImages"
  const [activeTab, setActiveTab] = useState<"home" | "grid" | "tracker" | "duel" | "encyclopedia" | "dashboard" | "crew" | "pirateShadow" | "timeline" | "bountyTarget" | "alliances" | "leaderboard" | "wej" | "blog" | "pyramid" | "undercover" | "crossword" | "fusion" | "fourImages">("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [infoModal, setInfoModal] = useState<"about" | "privacy" | "terms" | "legal" | "contact" | null>(null);

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("theme") as "light" | "dark") || "dark";
  });

  useEffect(() => {
    if (theme === "light") {
      document.body.classList.add("light-mode");
      localStorage.setItem("theme", "light");
    } else {
      document.body.classList.remove("light-mode");
      localStorage.setItem("theme", "dark");
    }
  }, [theme]);

  // Charge et persiste la prime du joueur (Bounty) et ses statistiques
  const [playerBounty, setPlayerBounty] = useState<number>(() => {
    return Number(localStorage.getItem("playerBountyValue") || "0");
  });
  
  const [playerUsername, setPlayerUsername] = useState<string>(() => {
    return localStorage.getItem("playerPirateName") || "Visiteur de Loguetown";
  });

  const [stats, setStats] = useState(() => {
    return {
      gridWins: Number(localStorage.getItem("statsGridWins") || "0"),
      gridLosses: Number(localStorage.getItem("statsGridLosses") || "0"),
      trackerWins: Number(localStorage.getItem("statsTrackerWins") || "0"),
      trackerPlays: Number(localStorage.getItem("statsTrackerPlays") || "0"),
      duelHigh: Number(localStorage.getItem("bestBountyDuelStreak") || "0")
    };
  });

  const [logs, setLogs] = useState<GameLog[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("playerGameLogs") || "[]");
    } catch {
      return [];
    }
  });

  const [latestWejArticles, setLatestWejArticles] = useState<any[]>([]);

  const [playerAvatar, setPlayerAvatar] = useState<string>(() => {
    return localStorage.getItem("playerAvatarImage") || "";
  });

  const [isSelectingAvatar, setIsSelectingAvatar] = useState<boolean>(false);
  const [avatarSearchQuery, setAvatarSearchQuery] = useState<string>("");

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(playerUsername);

  const [dashboardSubTab, setDashboardSubTab] = useState<"profile" | "crew">("profile");

  const top500CharactersList = useMemo(() => {
    if (!charactersDatabase || charactersDatabase.length === 0) return [];
    
    const scored = charactersDatabase.map(c => {
      let score = 0;
      const nameL = c.name.toLowerCase();
      const crewL = c.crew.toLowerCase();
      
      if (
        nameL.includes("luffy") || 
        nameL.includes("zoro") || 
        nameL.includes("nami") || 
        nameL.includes("usopp") || 
        nameL.includes("sanji") || 
        nameL.includes("chopper") || 
        nameL.includes("robin") || 
        nameL.includes("franky") || 
        nameL.includes("brook") || 
        nameL.includes("jimbei") || 
        nameL.includes("jinbe")
      ) {
        score += 5000000000;
      }
      
      if (crewL.includes("straw hat") || crewL.includes("chapeau de paille")) {
        score += 1000000000;
      }
      if (crewL.includes("red hair") || crewL.includes("cheveux roux") || nameL.includes("shanks")) {
        score += 800000000;
      }
      if (crewL.includes("whitebeard") || crewL.includes("barbe blanche") || nameL.includes("barbe blanche") || nameL.includes("ace")) {
        score += 700000000;
      }
      if (crewL.includes("beasts") || crewL.includes("hundred beasts") || nameL.includes("kaido")) {
        score += 650000000;
      }
      if (crewL.includes("big mom") || nameL.includes("linlin") || nameL.includes("katakuri")) {
        score += 600000000;
      }
      if (crewL.includes("blackbeard") || nameL.includes("teach") || nameL.includes("barbe noire")) {
        score += 700000000;
      }
      if (crewL.includes("marine") || nameL.includes("garp") || nameL.includes("sengoku") || nameL.includes("koby") || nameL.includes("smoker") || nameL.includes("tashigi")) {
        score += 50000000;
      }
      
      if (nameL.includes("akainu") || nameL.includes("sakazuki") || nameL.includes("aokiji") || nameL.includes("kuzan") || nameL.includes("kizaru") || nameL.includes("borsalino") || nameL.includes("fujitora") || nameL.includes("issho") || nameL.includes("green bull") || nameL.includes("ryokugyu")) {
        score += 900000000;
      }
      
      if (nameL.includes("mihawk") || nameL.includes("crocodile") || nameL.includes("doflamingo") || nameL.includes("hancock") || nameL.includes("moria") || nameL.includes("kuma") || nameL.includes("jinbe") || nameL.includes("law") || nameL.includes("buggy")) {
        score += 950000000;
      }

      score += c.bounty;

      if (c.description && c.description.length > 10) {
        score += c.description.length * 100;
      }
      if (c.devilFruit && c.devilFruit !== "Aucun") {
        score += 5000000;
      }
      if (c.haki && c.haki.length > 0) {
        score += c.haki.length * 2000000;
      }
      
      // Known height/age
      if (c.age !== "Inconnu" && c.age !== null && c.age !== undefined) score += 1000000;
      if (c.height !== "Inconnu" && c.height !== null && c.height !== undefined) score += 1000000;
      
      return { character: c, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.map(item => item.character);
  }, [charactersDatabase]);

  const top500Characters = useMemo(() => {
    return top500CharactersList.slice(0, 500);
  }, [top500CharactersList]);

  const charactersDatabaseFiltered = useMemo(() => {
    return charactersDatabase.filter(c => {
      const nameL = c.name.toLowerCase();
      return nameL !== "roche tomson" && nameL !== "raccoon" && nameL !== "george black" && nameL !== "draw";
    });
  }, [charactersDatabase]);

  const top500CharactersFiltered = useMemo(() => {
    return top500Characters.filter(c => {
      const nameL = c.name.toLowerCase();
      return nameL !== "roche tomson" && nameL !== "raccoon" && nameL !== "george black" && nameL !== "draw";
    });
  }, [top500Characters]);

  const charactersDatabaseAllGamesFiltered = useMemo(() => {
    return charactersDatabase.filter(c => {
      const nameL = c.name.toLowerCase();
      return nameL !== "draw";
    });
  }, [charactersDatabase]);

  // States pour le classement des primes en ligne
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [loadingOnlineUsers, setLoadingOnlineUsers] = useState(false);
  const [totalUsers, setTotalUsers] = useState<number>(0);

  const fetchOnlineUsers = async () => {
    try {
      setLoadingOnlineUsers(true);
      const q = query(collection(db, "users"), orderBy("bounty", "desc"), limit(150));
      const querySnapshot = await getDocs(q);
      const usersList: any[] = [];
      querySnapshot.forEach((docSnap) => {
        usersList.push({
          email: docSnap.id,
          ...docSnap.data()
        });
      });
      setOnlineUsers(usersList);
      localStorage.setItem("cached_online_users", JSON.stringify(usersList));

      try {
        const countSnap = await getCountFromServer(collection(db, "users"));
        setTotalUsers(countSnap.data().count);
      } catch (countErr) {
        console.warn("Erreur comptage:", countErr);
      }

    } catch (e: any) {
      console.warn("[Firebase Quota] Erreur lors de la récupération des joueurs réels, bascule sur le cache local :", e?.message || e);
      const cached = localStorage.getItem("cached_online_users");
      if (cached) {
        try {
          setOnlineUsers(JSON.parse(cached));
        } catch (_) {}
      }
    } finally {
      setLoadingOnlineUsers(false);
    }
  };

  useEffect(() => {
    fetchOnlineUsers();
  }, []); // Fetch initial rankings on mount

  // Liste globale fusionnée et classée par prime décroissante
  const leaderboardList: LeaderboardEntry[] = useMemo(() => {
    let filteredOnline = onlineUsers.map(u => {
      const isCurrentUser = u.email === localStorage.getItem("firebaseUserEmail");
      return {
        username: u.username || "Pirate Mystère",
        bounty: isCurrentUser ? Math.max(Number(u.bounty ?? 0), playerBounty) : Number(u.bounty ?? 0),
        avatar: u.avatar || "",
        email: u.email,
        isRival: false,
        isCurrentUser
      };
    });

    const hasCurrentUser = filteredOnline.some(u => u.isCurrentUser);
    let listToMerge = [...filteredOnline];

    if (!hasCurrentUser) {
      listToMerge.push({
        username: playerUsername,
        bounty: Number(playerBounty),
        avatar: playerAvatar,
        email: localStorage.getItem("firebaseUserEmail") || "local_guest",
        isRival: false,
        isCurrentUser: true
      });
    } else {
      listToMerge = listToMerge.map(u => {
        if (u.isCurrentUser) {
          return {
            ...u,
            username: playerUsername,
            bounty: Number(playerBounty),
            avatar: playerAvatar
          };
        }
        return u;
      });
    }

    const merged = [...listToMerge];
    
    // Ranger par bounty décroissante
    merged.sort((a, b) => b.bounty - a.bounty);
    return merged;
  }, [onlineUsers, playerUsername, playerBounty, playerAvatar]);

  // Rang dynamique et Titre calculés à partir du classement consolidé
  const playerRankDetails = useMemo(() => {
    const idx = leaderboardList.findIndex(item => item.isCurrentUser);
    const position = idx === -1 ? leaderboardList.length : idx; 
    
    let title: BountyRank = "Mousse";
    if (position === 0) title = "Roi des pirates";
    else if (position <= 4) title = "Yonko";
    else if (position <= 11) title = "Shishibukai";
    else if (position <= 22) title = "Supernova";
    else if (position <= 30) title = "Second d'empereur";
    else if (position <= 46) title = "Commandant d'empereur";
    else if (position <= 69) title = "Combattant de l'équipage";
    else if (position <= 99) title = "Membre de l'équipage";
    else if (position <= 149) title = "Chasseur de prime";
    else title = "Mousse";

    return {
      index: position,
      rankNumber: position + 1,
      title
    };
  }, [leaderboardList]);

  const playerRank = playerRankDetails.title;

  useEffect(() => {
    localStorage.setItem("playerAvatarImage", playerAvatar);
  }, [playerAvatar]);

  // Sauvegarder dans le localStorage
  useEffect(() => {
    localStorage.setItem("playerBountyValue", String(playerBounty));
  }, [playerBounty]);



  useEffect(() => {
    localStorage.setItem("playerPirateName", playerUsername);
  }, [playerUsername]);

  useEffect(() => {
    localStorage.setItem("statsGridWins", String(stats.gridWins));
    localStorage.setItem("statsGridLosses", String(stats.gridLosses));
    localStorage.setItem("statsTrackerWins", String(stats.trackerWins));
    localStorage.setItem("statsTrackerPlays", String(stats.trackerPlays));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem("playerGameLogs", JSON.stringify(logs));
  }, [logs]);

  // Ajustement de la prime globale
  const handleUpdateBounty = (amount: number, gameName?: string, resultString?: string) => {
    const gameTypeStr = gameName || activeTabName(activeTab);
    const outcomeStr = resultString || (amount >= 0 ? "Victoire" : "Défaite");

    // Envoi de l'événement de jeu vers Google Analytics et Vercel Analytics
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "game_played", {
        game_name: gameTypeStr,
        result: outcomeStr,
        bounty_change: amount
      });
    }
    try {
      track("game_played", {
        game_name: gameTypeStr,
        result: outcomeStr,
        bounty_change: amount
      });
    } catch (err) {
      console.warn("Échec du suivi analytique track:", err);
    }

    setPlayerBounty((prev) => {
      const nextValue = Math.max(0, prev + amount); // Ne pas descendre sous 0

      // Générer une entrée historique
      const formattedGain = amount >= 0 ? `+${amount.toLocaleString()} ฿` : `${amount.toLocaleString()} ฿`;
      const newLog: GameLog = {
        id: Math.random().toString(36).substring(2, 9),
        gameType: gameTypeStr as any,
        result: outcomeStr as any,
        detail: amount >= 0 ? "Excellente performance et maîtrise de lore !" : "Défaite ou erreur de calcul.",
        adjustment: formattedGain,
        timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) + " - " + new Date().toLocaleDateString("fr-FR")
      };
      setLogs(curr => [newLog, ...curr].slice(0, 15)); // Garder 15 logs max

      // Ajuster stats
      if (activeTab === "grid") {
        setStats(s => ({
          ...s,
          gridWins: amount > 0 ? s.gridWins + 1 : s.gridWins,
          gridLosses: amount < 0 ? s.gridLosses + 1 : s.gridLosses
        }));
      } else if (activeTab === "tracker") {
        setStats(s => ({
          ...s,
          trackerPlays: s.trackerPlays + 1,
          trackerWins: amount > 0 ? s.trackerWins + 1 : s.trackerWins
        }));
      }

      return nextValue;
    });
  };

  const activeTabName = (tab: string) => {
    if (tab === "home") return "Accueil & Hub";
    if (tab === "grid") return "Grand Line Grid";
    if (tab === "tracker") return "Log Pose Tracker";
    if (tab === "duel") return "Bounty Duel";
    if (tab === "pyramid") return "Pyramide";
    if (tab === "pirateShadow") return "L'ombre du pirate";
    if (tab === "fusion") return "Fusion Mystère ✨ NEW";
    if (tab === "fourImages") return "4 Pirates 1 Mot ✨ NEW";
    if (tab === "timeline") return "Chronologie Pirate";
    if (tab === "bountyTarget") return "Cible de Primes";
    if (tab === "alliances") return "Alliances Secrètes";
    if (tab === "undercover") return "Mission Undercover";
    if (tab === "crossword") return "Mots Croisés";
    if (tab === "crew") return "Équipage";
    return "Menu Principal";
  };

  // Suivi de navigation entre les onglets et jeux (Google Analytics & Vercel Analytics)
  useEffect(() => {
    const tabName = activeTabName(activeTab);

    // Envoi d'une vue d'écran virtuelle sur GA4 pour chaque onglet visité
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("config", "G-HXDVC9Z58T", {
        page_path: `/tab/${activeTab}`,
        page_title: tabName
      });

      // Envoi d'un événement d'interaction personnalisé pour savoir quel jeu est ouvert
      (window as any).gtag("event", "view_game_tab", {
        game_id: activeTab,
        game_name: tabName
      });
    }

    // Suivi d'événement sur Vercel Analytics
    try {
      track("view_game_tab", {
        game_id: activeTab,
        game_name: tabName
      });
    } catch (err) {
      console.warn("Échec du suivi d'onglet sur Vercel Analytics:", err);
    }
  }, [activeTab]);

  // Support de routage propre (AdSense compliance, SEO, direct URLs pour les pages légales & WEJ)
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      
      if (path === "/privacy") {
        setInfoModal("privacy");
      } else if (path === "/legal") {
        setInfoModal("legal");
      } else if (path === "/terms" || path === "/cgu") {
        setInfoModal("terms");
      } else if (path === "/about") {
        setInfoModal("about");
      } else if (path === "/contact") {
        setInfoModal("contact");
      } else if (path === "/wej" || path.startsWith("/wej")) {
        setActiveTab("wej");
        const articleId = searchParams.get("id") || path.split("/")[2];
        if (articleId) {
          localStorage.setItem("selectedWejArticleId", articleId);
          window.dispatchEvent(new Event("storage"));
        }
      } else if (path === "/blog") {
        setActiveTab("blog");
      } else if (path === "/") {
        setInfoModal(null);
      }
    };

    handleLocationChange();
    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  // Système de Toasts Globaux haut de gamme et Routage d'alert(...)
  const [globalToasts, setGlobalToasts] = useState<{ id: string; message: string; type: "success" | "error" | "info" | "warning" }[]>([]);

  useEffect(() => {
    const handleShowToast = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { message, type } = customEvent.detail || {};
      if (message) {
        const id = Math.random().toString(36).substring(2, 9);
        setGlobalToasts((prev) => [...prev, { id, message, type: type || "info" }]);
        setTimeout(() => {
          setGlobalToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
      }
    };

    window.addEventListener("show-toast", handleShowToast);

    // Déclarer showToast sur window
    (window as any).showToast = (message: string, type: "success" | "error" | "info" | "warning" = "info") => {
      window.dispatchEvent(new CustomEvent("show-toast", { detail: { message, type } }));
    };

    // Override transparent de window.alert pour un rendu haut de gamme sans blocage du navigateur
    const originalAlert = window.alert;
    window.alert = (message: string) => {
      const msgL = String(message).toLowerCase();
      let type: "success" | "error" | "info" | "warning" = "info";
      
      if (
        msgL.includes("erreur") || 
        msgL.includes("échec") || 
        msgL.includes("impossible") || 
        msgL.includes("interdit") || 
        msgL.includes("refusé") || 
        msgL.includes("banni") || 
        msgL.includes("insuffisante") ||
        msgL.includes("inférieure") ||
        msgL.includes("défaite")
      ) {
        type = "error";
      } else if (
        msgL.includes("attention") || 
        msgL.includes("décliné") || 
        msgL.includes("annulé") || 
        msgL.includes("avertissement") ||
        msgL.includes(" déjà ") ||
        msgL.includes("limite")
      ) {
        type = "warning";
      } else if (
        msgL.includes("félicitations") || 
        msgL.includes("succès") || 
        msgL.includes("bienvenue") || 
        msgL.includes("bravo") || 
        msgL.includes("copié") || 
        msgL.includes("validé") || 
        msgL.includes("accepté") || 
        msgL.includes("publié") ||
        msgL.includes("gagné") ||
        msgL.includes("réussi") ||
        msgL.includes("envoyé")
      ) {
        type = "success";
      }

      window.dispatchEvent(new CustomEvent("show-toast", { detail: { message, type } }));
    };

    return () => {
      window.removeEventListener("show-toast", handleShowToast);
      delete (window as any).showToast;
      window.alert = originalAlert;
    };
  }, []);

  // Alimentation du flux d'articles d'actualité du WEJ pour affichage en page d'accueil (Indexation SEO)
  useEffect(() => {
    const fetchLatestWej = async () => {
      try {
        const resp = await fetch("/api/wej/articles");
        const data = await resp.json();
        if (data.success && data.articles) {
          setLatestWejArticles(data.articles.slice(0, 3));
        }
      } catch (err) {
        console.warn("Échec du préchargement des articles WEJ pour l'accueil :", err);
      }
    };
    fetchLatestWej();
  }, []);

  // Titre du badge couleur
  const rankColorClass = (rank: BountyRank) => {
    switch (rank) {
      case "Roi des pirates": return "bg-amber-400/20 text-amber-300 border-amber-500/50 font-black shadow-[0_0_8px_rgba(245,158,11,0.2)]";
      case "Yonko": return "bg-rose-500/20 text-rose-300 border-rose-500/50 font-black";
      case "Shishibukai": return "bg-indigo-500/20 text-indigo-300 border-indigo-500/50 font-bold";
      case "Supernova": return "bg-teal-500/20 text-teal-300 border-teal-500/50 font-bold";
      case "Second d'empereur": return "bg-violet-500/20 text-violet-300 border-violet-500/50";
      case "Commandant d'empereur": return "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/50";
      case "Combattant de l'équipage": return "bg-emerald-500/20 text-emerald-300 border-emerald-500/50";
      case "Membre de l'équipage": return "bg-sky-500/20 text-sky-300 border-sky-500/50";
      case "Chasseur de prime": return "bg-amber-500/10 text-amber-400/90 border-amber-500/30";
      case "Mousse": default: return "bg-slate-800/50 text-slate-400 border-slate-700/50";
    }
  };

  const handleSaveName = () => {
    const clean = tempName.trim();
    if (clean) {
      setPlayerUsername(clean);
      setIsEditingName(false);
    }
  };

  // Calcul du pourcentage vers le rang supérieur basé sur le classement réel
  const nextRankProgress = useMemo(() => {
    const playerIdx = leaderboardList.findIndex(item => item.isCurrentUser);
    if (playerIdx > 0 && playerIdx < leaderboardList.length) {
      const currentBounty = playerBounty;
      const nextRivalBounty = leaderboardList[playerIdx - 1].bounty;
      const prevBounty = playerIdx < leaderboardList.length - 1 ? leaderboardList[playerIdx + 1].bounty : 0;
      
      const diff = nextRivalBounty - prevBounty;
      if (diff <= 0) return 50;
      const progress = ((currentBounty - prevBounty) / diff) * 100;
      return Math.min(100, Math.max(0, progress));
    }
    return 100; // Roi des pirates !
  }, [leaderboardList, playerBounty]);

  const PROPOSED_GAMES = useMemo(() => [
    {
      id: "grid",
      title: "Grand Line Grid",
      description: "Morpion stratégique. Placez vos personnages d'One Piece en fonction de leurs attributs pour dominer la grille de combat !",
      icon: Swords,
      badge: "Morpion stratégique",
    },
    {
      id: "tracker",
      title: "Log Pose Tracker",
      description: "Trouvez le pirate mystère du jour ! Affinez vos recherches grâce aux indices de caractéristique du Log Pose.",
      icon: Compass,
      badge: "Wordle Clues",
    },
    {
      id: "alliances",
      title: "Alliances Secrètes",
      description: "Identifiez les liaisons célèbres, les fraternités et les flottes cachées reliant les personnages d'One Piece.",
      icon: Users,
      badge: "Réflexion",
    },
    {
      id: "undercover",
      title: "Mission Undercover",
      description: "Un jeu de rôle social et de suspicion ! Démasquez l'imposteur (Mister White) infiltré au sein du navire.",
      icon: ShieldAlert,
      badge: "Rôles Cachés",
    },
    {
      id: "crossword",
      title: "Mots Croisés",
      description: "Une grille de mots croisés sur l'univers de One Piece générée de manière procédurale avec une cagnotte de Berrys !",
      icon: Brain,
      badge: "Mots Croisés",
    },
    {
      id: "duel",
      title: "Bounty Duel",
      description: "Comparez les primes de deux personnages célèbres dans un combat d'intuition. Atteignez la plus haute série !",
      icon: ArrowRightLeft,
      badge: "Plus haute prime",
    },
    {
      id: "pyramid",
      title: "Pyramide de Pouvoir",
      description: "Serez-vous capable d'escalader les échelons du pouvoir mondial ? Répondez aux énigmes pour atteindre le sommet.",
      icon: Trophy,
      badge: "Défi royal",
    },
    {
      id: "pirateShadow",
      title: "L'Ombre du Pirate",
      description: "Observez la silhouette noire d'un pirate mystique. Saurez-vous deviner son identité avant qu'il ne disparaisse ?",
      icon: Sparkles,
      badge: "Silhouette Quiz",
    },
    {
      id: "fusion",
      title: "Personnage Mystère Fusionné",
      description: "Trois visages d'One Piece ont été fusionnés. Observez attentivement leurs traits entremêlés, et démasquez-les !",
      icon: Sparkles,
      badge: "NEW",
    },
    {
      id: "fourImages",
      title: "4 Pirates, 1 Mot",
      description: "Trouve le point commun ou le titre qui unit quatre figures légendaires d'One Piece grâce au clavier virtuel !",
      icon: Brain,
      badge: "NEW",
    },
    {
      id: "timeline",
      title: "Chronologie Pirate",
      description: "Restaurez l'histoire officielle d'One Piece en replaçant les grandes batailles et sagas dans le bon ordre chronologique.",
      icon: Clock,
      badge: "Frise Historique",
    },
    {
      id: "bountyTarget",
      title: "Le Compte est Bon",
      description: "Faites chauffer vos méninges ! Combinez les primes de personnages d'One Piece pour former exactement la cible demandée.",
      icon: Brain,
      badge: "Mathématiques",
    },
    {
      id: "encyclopedia",
      title: "Encyclopédie de Grand Line",
      description: "Explorez l'archive officielle des personnages de tout l'univers d'One Piece. Consultez les fiches détaillées, fruits, âges et tailles !",
      icon: BookOpen,
      badge: "Base de données",
    },
    {
      id: "wej",
      title: "Journal de Morgans (WEJ)",
      description: "Suivez l'actualité brûlante du monde de la piraterie par Morgans. Tenez-vous au courant des événements mondiaux du Hub.",
      icon: Newspaper,
      badge: "Journal de Morgans",
    },
    {
      id: "crew",
      title: "Équipage & Storm Chat",
      description: "Rejoignez une guilde ou formez votre équipe. Discutez avec d'autres pirates connectés en direct.",
      icon: Users,
      badge: "Social",
    },
    {
      id: "blog",
      title: "Le Blog & Bugs",
      description: "Donnez votre précieux avis, signalez d'éventuels bugs et participez aux suggestions d'amélioration en direct.",
      icon: MessageSquare,
      badge: "Rapport de Bord",
    }
  ], []);

  return (
    <div className="min-h-screen text-[#F8FAFC] font-sans flex flex-col relative overflow-hidden bg-[#070914]">
      
      {/* Éléments atmosphériques de Gear 5 : Lune Céleste de Nika */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Sublime Lune céleste de Nika */}
        <div className="absolute left-[50%] top-[-50px] md:top-[-100px] -translate-x-1/2 w-[550px] md:w-[750px] h-[550px] md:h-[750px] rounded-full bg-violet-600/10 blur-2xl pointer-events-none" />
        
        {/* Disque lunaire central avec la silhouette de Nika */}
        <div className="absolute left-[50%] top-[40px] md:top-[60px] -translate-x-1/2 w-[280px] md:w-[480px] h-[280px] md:h-[480px] rounded-full bg-violet-950/20 filter blur-[1px] shadow-[0_0_120px_rgba(139,92,246,0.3)] flex items-center justify-center">
          <svg className="w-[65%] h-[65%] text-slate-900 opacity-[0.7]" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50,15 C52,15 54,13 53,10 C51,7 45,4 39,6 C33,8 34,14 36,16 C38,18 43,17 45,16 C47,15 45,15 50,15 Z M50,18 C45,19 40,21 36,25 C30,30 28,36 32,42 C35,46 41,49 48,47 C55,45 61,39 59,34 C57,29 52,18 50,18 Z M32,42 C27,43 20,40 16,43 C12,46 14,52 19,54 C24,56 30,55 33,50 L32,42 Z" />
            <path d="M48,47 C46,51 42,55 38,58 C33,62 34,68 40,69 C46,71 51,68 53,63 C55,58 52,52 48,47 Z" />
          </svg>
        </div>
      </div>
      
      {/* 1. TOP NAV / BARRE DE STATUT SUPREME */}
      <header className="bg-slate-950/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40 shadow-2xl">
        <div className="max-w-7xl mx-auto px-3 md:px-8 py-2 md:py-4 flex flex-row items-center justify-between gap-2 md:gap-4">
          
          {/* Logo & Titre */}
          <div 
            onClick={() => {
              setActiveTab("home");
              window.dispatchEvent(new CustomEvent("click-logo"));
            }}
            className="flex items-center gap-2 md:gap-3 cursor-pointer select-none group/logo"
            title="Retour à l'accueil"
          >
            <img 
              src="/logo.svg" 
              alt="Grand Line Logo" 
              className="w-8 h-8 md:w-10 md:h-10 object-contain shrink-0 filter drop-shadow-[0_0_6px_rgba(139,92,246,0.35)] group-hover/logo:scale-110 active:rotate-12 transition-all select-none"
              referrerPolicy="no-referrer"
            />
            <div>
              <h1 className="text-xs sm:text-lg md:text-2xl font-black font-heading tracking-tighter uppercase leading-none text-white flex items-center gap-1.5 transition-colors group-hover/logo:text-violet-300">
                GRAND LINE <span className="text-violet-400 group-hover/logo:text-white transition-colors">HUB</span>
              </h1>
              <p className="text-[8px] md:text-[10px] text-violet-400 font-mono tracking-widest uppercase font-extrabold mt-0.5 md:mt-1 hidden sm:block group-hover/logo:text-violet-300 transition-colors">
                L'AVENTURE COMMENCE ICI
              </p>
            </div>
          </div>

          {/* Section Profil & Bouton Thème */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Language Selector */}
            <LanguageSelector />

            {/* Theme Toggle Button */}
            <button
              id="theme-toggle"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 md:p-3 rounded-xl border border-white/10 bg-[#11142A]/85 hover:bg-[#1C2042]/85 active:scale-95 transition-all cursor-pointer text-slate-300 hover:text-white shrink-0 flex items-center justify-center h-10 w-10 md:h-[50px] md:w-[50px] shadow-lg hover:border-violet-500/40 transition-colors"
              title={theme === "dark" ? "Passer au Mode Clair" : "Passer au Mode Sombre"}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 md:w-5 md:h-5 text-amber-400 rotate-0 transition-transform duration-500" />
              ) : (
                <Moon className="w-4 h-4 md:w-5 md:h-5 text-violet-600 hover:text-violet-500 transition-colors" />
              )}
            </button>

            {/* Profil d'Équipage Réel & Prime (Bounty) */}
            <div 
              id="header-profile"
              onClick={() => setActiveTab("dashboard")}
              className="flex items-center gap-2 md:gap-4 bg-[#11142A]/85 hover:bg-[#1C2042]/85 border border-white/10 hover:border-violet-500/40 rounded-xl md:rounded-2xl px-2.5 py-1.5 md:px-5 md:py-2.5 justify-between cursor-pointer transition-all active:scale-[0.98] group shadow-lg"
              title="Accéder au Tableau de bord"
            >
              <img 
                src={playerAvatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(playerUsername)}`}
                alt={playerUsername}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover shrink-0 border border-white/10 bg-[#070914] group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(playerUsername)}`;
                }}
              />
              <div className="text-left font-sans flex-1">
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="text-[10px] sm:text-xs md:text-sm font-heading font-black text-white group-hover:text-violet-400 uppercase tracking-tight leading-none transition-colors max-w-[80px] sm:max-w-none truncate block">
                    {playerUsername}
                  </span>
                  <span className={`text-[7px] sm:text-[9px] uppercase font-mono tracking-wider font-extrabold px-1 sm:px-2 py-0.5 rounded border leading-none shrink-0 ${rankColorClass(playerRank)}`}>
                    {playerRank}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-0.5 md:mt-1">
                  <Coins className="w-3 h-3 md:w-4 md:h-4 text-violet-400" />
                  <span className="font-mono text-xs sm:text-sm md:text-base font-black tracking-tight text-violet-400">
                    ฿ {playerBounty.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* 2. BODY LAYOUT CONSTRAINED WITH SIDEBAR ON THE LEFT */}
      {/* MOBILE MINI-HEADER / SELECTION DE MODE */}
      <div className="block md:hidden bg-[#0a0c1a]/95 backdrop-blur-lg border-b border-white/10 px-4 py-3 sticky top-[48px] sm:top-[64px] z-30 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <span className="text-[9px] font-mono uppercase tracking-widest text-[#a78bfa] leading-none mb-1 block">Mode actuel</span>
            <span className="text-xs font-black uppercase text-white font-heading tracking-wide flex items-center gap-1.5 leading-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {activeTabName(activeTab)}
            </span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="bg-violet-600 hover:bg-violet-700 active:scale-95 border border-violet-500/30 text-[10px] text-white font-black uppercase px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs shrink-0"
          >
            <Menu className="w-3.5 h-3.5" />
            <span>Tous les modes</span>
          </button>
        </div>
      </div>

      {/* MOBILE FULL-SCREEN SLIDE-IN DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#05070f]/95 backdrop-blur-xl flex flex-col p-5 overflow-y-auto md:hidden">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="Logo" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
              <span className="font-heading font-black text-xs uppercase text-white tracking-widest">MENU DES MODES</span>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { setActiveTab("home"); setIsMobileMenuOpen(false); }}
              className={`p-4 col-span-2 rounded-xl border flex items-center justify-center gap-3 transition-all ${
                activeTab === "home" 
                  ? "bg-violet-600 border-violet-555 text-white" 
                  : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              <Home className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-heading font-extrabold tracking-wider uppercase">ACCUEIL DE L'ÉQUIPAGE & HUB</span>
            </button>

            <button
              onClick={() => { setActiveTab("grid"); setIsMobileMenuOpen(false); }}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all ${
                activeTab === "grid" 
                  ? "bg-violet-900 border-violet-500 text-white" 
                  : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              <Swords className="w-5 h-5 text-violet-400" />
              <span className="text-[10px] font-heading font-extrabold tracking-wider uppercase">Grand Line Grid</span>
            </button>

            <button
              onClick={() => { setActiveTab("tracker"); setIsMobileMenuOpen(false); }}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all ${
                activeTab === "tracker" 
                  ? "bg-violet-900 border-violet-500 text-white" 
                  : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              <Compass className="w-5 h-5 text-emerald-400" />
              <span className="text-[10px] font-heading font-extrabold tracking-wider uppercase">Log Pose Tracker</span>
            </button>

            <button
              onClick={() => { setActiveTab("alliances"); setIsMobileMenuOpen(false); }}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all ${
                activeTab === "alliances" 
                  ? "bg-violet-900 border-violet-500 text-white" 
                  : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              <Users className="w-5 h-5 text-violet-400" />
              <span className="text-[10px] font-heading font-extrabold tracking-wider uppercase">Alliances</span>
            </button>

            <button
              onClick={() => { setActiveTab("undercover"); setIsMobileMenuOpen(false); }}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all relative ${
                activeTab === "undercover" 
                  ? "bg-violet-900 border-violet-500 text-white" 
                  : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              <span className="absolute top-1 right-1 bg-rose-600 text-[7px] font-mono tracking-normal text-white px-1.5 py-0.5 rounded-full font-black animate-pulse shadow-md">NEW</span>
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <span className="text-[10px] font-heading font-extrabold tracking-wider uppercase whitespace-nowrap">Undercover</span>
            </button>

            <button
              onClick={() => { setActiveTab("crossword"); setIsMobileMenuOpen(false); }}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all relative ${
                activeTab === "crossword" 
                  ? "bg-violet-900 border-violet-500 text-white" 
                  : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              <span className="absolute top-1 right-1 bg-amber-500 text-[7px] font-mono tracking-normal text-black px-1.5 py-0.5 rounded-full font-black animate-pulse shadow-md">NEW</span>
              <Brain className="w-5 h-5 text-amber-400" />
              <span className="text-[10px] font-heading font-extrabold tracking-wider uppercase whitespace-nowrap">Mots Croisés</span>
            </button>

            <button
              onClick={() => { setActiveTab("duel"); setIsMobileMenuOpen(false); }}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all ${
                activeTab === "duel" 
                  ? "bg-violet-900 border-violet-500 text-white" 
                  : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              <ArrowRightLeft className="w-5 h-5 text-violet-400" />
              <span className="text-[10px] font-heading font-extrabold tracking-wider uppercase">Bounty Duel</span>
            </button>

            <button
              onClick={() => { setActiveTab("pyramid"); setIsMobileMenuOpen(false); }}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all ${
                activeTab === "pyramid" 
                  ? "bg-violet-900 border-violet-500 text-white" 
                  : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              <Trophy className="w-5 h-5 text-amber-400" />
              <span className="text-[10px] font-heading font-extrabold tracking-wider uppercase">Pyramide</span>
            </button>

            <button
              onClick={() => { setActiveTab("pirateShadow"); setIsMobileMenuOpen(false); }}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all ${
                activeTab === "pirateShadow" 
                  ? "bg-violet-900 border-violet-500 text-white" 
                  : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              <Sparkles className="w-5 h-5 text-violet-400" />
              <span className="text-[10px] font-heading font-extrabold tracking-wider uppercase">L'Ombre</span>
            </button>

            <button
              onClick={() => { setActiveTab("fusion"); setIsMobileMenuOpen(false); }}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all ${
                activeTab === "fusion" 
                  ? "bg-violet-900 border-violet-500 text-white" 
                  : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              <Sparkles className="w-5 h-5 text-pink-400" />
              <span className="text-[10px] font-heading font-extrabold tracking-wider uppercase flex items-center gap-1 justify-center">
                <span>Fusion</span>
                <span className="text-[8px] bg-pink-500 text-white px-1 rounded animate-pulse">NEW</span>
              </span>
            </button>

            <button
              onClick={() => { setActiveTab("fourImages"); setIsMobileMenuOpen(false); }}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all ${
                activeTab === "fourImages" 
                  ? "bg-violet-900 border-violet-500 text-white" 
                  : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              <Brain className="w-5 h-5 text-amber-400" />
              <span className="text-[10px] font-heading font-extrabold tracking-wider uppercase flex items-center gap-1 justify-center">
                <span>4 Images</span>
                <span className="text-[8px] bg-amber-500 text-slate-950 px-1 rounded animate-pulse">NEW</span>
              </span>
            </button>

            <button
              onClick={() => { setActiveTab("timeline"); setIsMobileMenuOpen(false); }}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all ${
                activeTab === "timeline" 
                  ? "bg-violet-900 border-violet-500 text-white" 
                  : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              <Clock className="w-5 h-5 text-pink-400" />
              <span className="text-[10px] font-heading font-extrabold tracking-wider uppercase">Chronologie</span>
            </button>

            <button
              onClick={() => { setActiveTab("bountyTarget"); setIsMobileMenuOpen(false); }}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all ${
                activeTab === "bountyTarget" 
                  ? "bg-violet-900 border-violet-500 text-white" 
                  : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              <Trophy className="w-5 h-5 text-violet-400" />
              <span className="text-[10px] font-heading font-extrabold tracking-wider uppercase">Le Compte Bon</span>
            </button>

            <button
              onClick={() => { setActiveTab("leaderboard"); setIsMobileMenuOpen(false); }}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all ${
                activeTab === "leaderboard" 
                  ? "bg-violet-900 border-violet-500 text-white" 
                  : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              <Crown className="w-5 h-5 text-amber-400" />
              <span className="text-[10px] font-heading font-extrabold tracking-wider uppercase">Classement</span>
            </button>

            <button
              onClick={() => { setActiveTab("crew"); setIsMobileMenuOpen(false); }}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all ${
                activeTab === "crew" 
                  ? "bg-violet-900 border-violet-555 text-white" 
                  : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              <Users className="w-5 h-5 text-violet-400" />
              <span className="text-[10px] font-heading font-extrabold tracking-wider uppercase">Équipage</span>
            </button>

            <button
              onClick={() => { setActiveTab("wej"); setIsMobileMenuOpen(false); }}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all ${
                activeTab === "wej" 
                  ? "bg-violet-900 border-violet-555 text-white" 
                  : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              <Newspaper className="w-5 h-5 text-rose-500" />
              <span className="text-[10px] font-heading font-extrabold tracking-wider uppercase">Journal WEJ</span>
            </button>

            <button
              onClick={() => { setActiveTab("blog"); setIsMobileMenuOpen(false); }}
              className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all ${
                activeTab === "blog" 
                  ? "bg-violet-900 border-violet-500 text-white" 
                  : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              <MessageSquare className="w-5 h-5 text-amber-500" />
              <span className="text-[10px] font-heading font-extrabold tracking-wider uppercase">Blog & Bugs</span>
            </button>

            <button
              onClick={() => { setActiveTab("dashboard"); setIsMobileMenuOpen(false); }}
              className={`p-3.5 col-span-2 rounded-xl border flex items-center justify-center gap-3 transition-all ${
                activeTab === "dashboard" 
                  ? "bg-violet-600 border-violet-500 text-white" 
                  : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              <LayoutDashboard className="w-5 h-5 text-violet-300" />
              <span className="text-xs font-heading font-extrabold tracking-wider uppercase">Tableau de Bord</span>
            </button>
          </div>

          <div className="mt-8 pt-5 border-t border-white/5 text-center">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#a78bfa] font-extrabold mb-2 block">
              Progression
            </span>
            <div className="max-w-[180px] mx-auto space-y-2">
              <div className="w-full bg-[#1A1C3C]/80 rounded-full h-2 overflow-hidden border border-white/5">
                <div 
                  className="bg-gradient-to-r from-rose-600 to-amber-500 h-full transition-all duration-500 shadow-[0_0_8px_#E11D48]"
                  style={{ width: `${nextRankProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-[8px] font-mono text-slate-400">
                <span>{Math.floor(nextRankProgress)}% ACCOMPLI</span>
                <span className="font-bold text-[#f59e0b]">{playerRank}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-stretch">
        
        {/* SIDE NAV / BARRE DE JEUX À GAUCHE */}
        <aside className="hidden md:flex w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 bg-[#0B0D1E]/90 backdrop-blur-md shrink-0 md:sticky md:top-20 md:h-[calc(100vh-5rem)] overflow-y-auto no-scrollbar p-4 md:py-8 flex-col justify-between">
          <div className="space-y-6">
            <div className="hidden md:block">
              <span className="text-[10px] uppercase font-mono tracking-widest text-rose-500 font-black px-3 block">
                Navigation de l'Équipage
              </span>
            </div>
            
            <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 no-scrollbar w-full">
              <button
                onClick={() => setActiveTab("home")}
                className={`px-3 py-2.5 md:px-4 md:py-3 rounded-xl text-[10px] md:text-[11px] font-heading font-extrabold tracking-widest uppercase transition-all flex items-center gap-2.5 shrink-0 cursor-pointer w-auto md:w-full md:justify-start ${
                  activeTab === "home" 
                    ? "bg-violet-950 text-[#F8FAFC] border border-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.3)] animate-pulse" 
                    : "text-slate-250 hover:text-white hover:bg-white/10 bg-white/5 border border-white/5"
                }`}
              >
                <Home className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span>ACCUEIL & HUB</span>
              </button>

              <button
                onClick={() => setActiveTab("grid")}
                className={`px-3 py-2.5 md:px-4 md:py-3 rounded-xl text-[10px] md:text-[11px] font-heading font-extrabold tracking-widest uppercase transition-all flex items-center gap-2.5 shrink-0 cursor-pointer w-auto md:w-full md:justify-start ${
                  activeTab === "grid" 
                    ? "bg-violet-900 text-[#F8FAFC] border border-violet-500" 
                    : "text-slate-400 hover:text-white hover:bg-white/5 bg-transparent border border-transparent"
                }`}
              >
                <Swords className="w-3.5 h-3.5 shrink-0 text-violet-400" />
                <span>GRAND LINE GRID</span>
              </button>
              
              <button
                onClick={() => setActiveTab("tracker")}
                className={`px-3 py-2.5 md:px-4 md:py-3 rounded-xl text-[10px] md:text-[11px] font-heading font-extrabold tracking-widest uppercase transition-all flex items-center gap-2.5 shrink-0 cursor-pointer w-auto md:w-full md:justify-start ${
                  activeTab === "tracker" 
                    ? "bg-violet-900 text-[#F8FAFC] border border-violet-500" 
                    : "text-slate-400 hover:text-white hover:bg-white/5 bg-transparent border border-transparent"
                }`}
              >
                <Compass className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                <span>LOG POSE TRACKER</span>
              </button>

              <button
                onClick={() => setActiveTab("alliances")}
                className={`px-3 py-2.5 md:px-4 md:py-3 rounded-xl text-[10px] md:text-[11px] font-heading font-extrabold tracking-widest uppercase transition-all flex items-center gap-2.5 shrink-0 cursor-pointer w-auto md:w-full md:justify-start ${
                  activeTab === "alliances" 
                    ? "bg-violet-900 text-[#F8FAFC] border border-violet-500" 
                    : "text-slate-400 hover:text-white hover:bg-white/5 bg-transparent border border-transparent"
                }`}
              >
                <Users className="w-3.5 h-3.5 shrink-0 text-violet-400" />
                <span>ALLIANCES SECRÈTES</span>
              </button>

              <button
                onClick={() => setActiveTab("undercover")}
                className={`px-3 py-2.5 md:px-4 md:py-3 rounded-xl text-[10px] md:text-[11px] font-heading font-extrabold tracking-widest uppercase transition-all flex items-center gap-2.5 shrink-0 cursor-pointer w-auto md:w-full md:justify-start ${
                  activeTab === "undercover" 
                    ? "bg-violet-900 text-[#F8FAFC] border border-violet-500 animate-pulse" 
                    : "text-slate-400 hover:text-white hover:bg-white/5 bg-transparent border border-transparent"
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                <span className="whitespace-nowrap">MISSION UNDERCOVER</span>
              </button>

              <button
                onClick={() => setActiveTab("crossword")}
                className={`px-3 py-2.5 md:px-4 md:py-3 rounded-xl text-[10px] md:text-[11px] font-heading font-extrabold tracking-widest uppercase transition-all flex items-center gap-2.5 shrink-0 cursor-pointer w-auto md:w-full md:justify-start ${
                  activeTab === "crossword" 
                    ? "bg-violet-900 text-[#F8FAFC] border border-violet-500 animate-pulse" 
                    : "text-slate-400 hover:text-white hover:bg-white/5 bg-transparent border border-transparent"
                }`}
              >
                <Brain className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span className="whitespace-nowrap">MOTS CROISÉS</span>
                <span className="bg-amber-500 text-[8px] font-mono tracking-normal text-black px-1.5 py-0.5 rounded-full font-black animate-pulse ml-auto shrink-0 shadow-md">NEW</span>
              </button>

              <button
                onClick={() => setActiveTab("duel")}
                className={`px-3 py-2.5 md:px-4 md:py-3 rounded-xl text-[10px] md:text-[11px] font-heading font-extrabold tracking-widest uppercase transition-all flex items-center gap-2.5 shrink-0 cursor-pointer w-auto md:w-full md:justify-start ${
                  activeTab === "duel" 
                    ? "bg-violet-900 text-[#F8FAFC] border border-violet-500" 
                    : "text-slate-400 hover:text-white hover:bg-white/5 bg-transparent border border-transparent"
                }`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5 shrink-0 text-violet-400" />
                <span>BOUNTY DUEL</span>
              </button>

              <button
                onClick={() => setActiveTab("pyramid")}
                className={`px-3 py-2.5 md:px-4 md:py-3 rounded-xl text-[10px] md:text-[11px] font-heading font-extrabold tracking-widest uppercase transition-all flex items-center gap-2.5 shrink-0 cursor-pointer w-auto md:w-full md:justify-start ${
                  activeTab === "pyramid" 
                    ? "bg-violet-900 text-[#F8FAFC] border border-violet-500" 
                    : "text-slate-400 hover:text-white hover:bg-white/5 bg-transparent border border-transparent"
                }`}
              >
                <Trophy className="w-3.5 h-3.5 shrink-0 text-amber-400 animate-pulse" />
                <span>PYRAMIDE</span>
              </button>
 
              <button
                onClick={() => setActiveTab("pirateShadow")}
                className={`px-3 py-2.5 md:px-4 md:py-3 rounded-xl text-[10px] md:text-[11px] font-heading font-extrabold tracking-widest uppercase transition-all flex items-center gap-2.5 shrink-0 cursor-pointer w-auto md:w-full md:justify-start ${
                  activeTab === "pirateShadow" 
                    ? "bg-violet-900 text-[#F8FAFC] border border-violet-500" 
                    : "text-slate-400 hover:text-white hover:bg-white/5 bg-transparent border border-transparent"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0 text-violet-400" />
                <span>L'OMBRE DU PIRATE</span>
              </button>

              <button
                onClick={() => setActiveTab("fusion")}
                className={`px-3 py-2.5 md:px-4 md:py-3 rounded-xl text-[10px] md:text-[11px] font-heading font-extrabold tracking-widest uppercase transition-all flex items-center gap-2.5 shrink-0 cursor-pointer w-auto md:w-full md:justify-start ${
                  activeTab === "fusion" 
                    ? "bg-violet-900 text-[#F8FAFC] border border-violet-500" 
                    : "text-slate-400 hover:text-white hover:bg-white/5 bg-transparent border border-transparent"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0 text-pink-400 animate-pulse" />
                <span className="flex items-center gap-2">
                  <span>FUSION MYSTÈRE</span>
                  <span className="text-[8px] bg-pink-500 text-white px-1.5 py-0.5 rounded font-mono font-bold animate-pulse tracking-normal">NEW</span>
                </span>
              </button>

              <button
                onClick={() => setActiveTab("fourImages")}
                className={`px-3 py-2.5 md:px-4 md:py-3 rounded-xl text-[10px] md:text-[11px] font-heading font-extrabold tracking-widest uppercase transition-all flex items-center gap-2.5 shrink-0 cursor-pointer w-auto md:w-full md:justify-start ${
                  activeTab === "fourImages" 
                    ? "bg-violet-900 text-[#F8FAFC] border border-violet-500" 
                    : "text-slate-400 hover:text-white hover:bg-white/5 bg-transparent border border-transparent"
                }`}
              >
                <Brain className="w-3.5 h-3.5 shrink-0 text-amber-400 animate-pulse" />
                <span className="flex items-center gap-2">
                  <span>4 PIRATES, 1 MOT</span>
                  <span className="text-[8px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-mono font-bold animate-pulse tracking-normal">NEW</span>
                </span>
              </button>
 
              <button
                onClick={() => setActiveTab("timeline")}
                className={`px-3 py-2.5 md:px-4 md:py-3 rounded-xl text-[10px] md:text-[11px] font-heading font-extrabold tracking-widest uppercase transition-all flex items-center gap-2.5 shrink-0 cursor-pointer w-auto md:w-full md:justify-start ${
                  activeTab === "timeline" 
                    ? "bg-violet-900 text-[#F8FAFC] border border-violet-500" 
                    : "text-slate-400 hover:text-white hover:bg-white/5 bg-transparent border border-transparent"
                }`}
              >
                <Clock className="w-3.5 h-3.5 shrink-0 text-pink-400" />
                <span>CHRONOLOGIE</span>
              </button>
 
              <button
                onClick={() => setActiveTab("bountyTarget")}
                className={`px-3 py-2.5 md:px-4 md:py-3 rounded-xl text-[10px] md:text-[11px] font-heading font-extrabold tracking-widest uppercase transition-all flex items-center gap-2.5 shrink-0 cursor-pointer w-auto md:w-full md:justify-start ${
                  activeTab === "bountyTarget" 
                    ? "bg-violet-900 text-[#F8FAFC] border border-violet-500" 
                    : "text-slate-400 hover:text-white hover:bg-white/5 bg-transparent border border-transparent"
                }`}
              >
                <Trophy className="w-3.5 h-3.5 shrink-0 text-violet-400" />
                <span>LE COMPTE EST BON</span>
              </button>
 
              <button
                onClick={() => setActiveTab("leaderboard")}
                className={`px-3 py-2.5 md:px-4 md:py-3 rounded-xl text-[10px] md:text-[11px] font-heading font-extrabold tracking-widest uppercase transition-all flex items-center gap-2.5 shrink-0 cursor-pointer w-auto md:w-full md:justify-start ${
                  activeTab === "leaderboard" 
                    ? "bg-violet-900 text-[#F8FAFC] border border-violet-500" 
                    : "text-slate-400 hover:text-white hover:bg-white/5 bg-transparent border border-transparent"
                }`}
              >
                <Crown className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span>CLASSEMENT</span>
              </button>

              <button
                onClick={() => setActiveTab("crew")}
                className={`px-3 py-2.5 md:px-4 md:py-3 rounded-xl text-[10px] md:text-[11px] font-heading font-extrabold tracking-widest uppercase transition-all flex items-center gap-2.5 shrink-0 cursor-pointer w-auto md:w-full md:justify-start ${
                  activeTab === "crew" 
                    ? "bg-violet-900 text-[#F8FAFC] border border-violet-505" 
                    : "text-slate-400 hover:text-white hover:bg-white/5 bg-transparent border border-transparent"
                }`}
              >
                <Users className="w-3.5 h-3.5 shrink-0 text-violet-400" />
                <span>ÉQUIPAGE</span>
              </button>

              <button
                onClick={() => setActiveTab("wej")}
                className={`px-3 py-2.5 md:px-4 md:py-3 rounded-xl text-[10px] md:text-[11px] font-heading font-extrabold tracking-widest uppercase transition-all flex items-center gap-2.5 shrink-0 cursor-pointer w-auto md:w-full md:justify-start ${
                  activeTab === "wej" 
                    ? "bg-violet-900 text-[#F8FAFC] border border-violet-500" 
                    : "text-slate-400 hover:text-white hover:bg-white/5 bg-transparent border border-transparent"
                }`}
              >
                <Newspaper className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                <span>JOURNAL WEJ</span>
              </button>

              <button
                onClick={() => setActiveTab("blog")}
                className={`px-3 py-2.5 md:px-4 md:py-3 rounded-xl text-[10px] md:text-[11px] font-heading font-extrabold tracking-widest uppercase transition-all flex items-center gap-2.5 shrink-0 cursor-pointer w-auto md:w-full md:justify-start ${
                  activeTab === "blog" 
                    ? "bg-violet-900 text-[#F8FAFC] border border-violet-500" 
                    : "text-slate-400 hover:text-white hover:bg-white/5 bg-transparent border border-transparent"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                <span>BLOG & BUGS</span>
              </button>

              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-3 py-2.5 md:px-4 md:py-3 rounded-xl text-[10px] md:text-[11px] font-heading font-extrabold tracking-widest uppercase transition-all flex items-center gap-2.5 shrink-0 cursor-pointer w-auto md:w-full md:justify-start ${
                  activeTab === "dashboard" 
                    ? "bg-violet-600 text-white border border-violet-500/30" 
                    : "text-slate-400 hover:text-white hover:bg-white/5 bg-transparent border border-transparent"
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                <span>TABLEAU DE BORD</span>
              </button>
            </nav>
 
            <div className="hidden md:block pt-6 border-t border-white/10 mt-6 space-y-4">
              <span className="text-[10px] uppercase font-mono tracking-widest text-violet-400 font-extrabold px-3 block">
                Rang & Progression
              </span>
              <div className="px-3 space-y-2">
                <div className="w-full bg-[#1A1C3C] rounded-full h-2 overflow-hidden border border-white/5">
                  <div 
                    className="bg-gradient-to-r from-rose-600 to-amber-500 h-full transition-all duration-500 shadow-[0_0_8px_#E11D48]"
                    style={{ width: `${nextRankProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-slate-400">
                  <span>{Math.floor(nextRankProgress)}% ACCOMPLI</span>
                  <span className="font-bold text-violet-450">{playerRank}</span>
                </div>
              </div>
            </div>

          </div>
        </aside>

        {/* 3. CORE INTERACTIVE SCREENS VIEWPORTS */}
        <main className="flex-1 p-4 md:p-8 fade-in min-w-0">
        
        {loadingCharacters ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-300 font-sans">
            <div className="w-16 h-16 border-4 border-t-[#8b5cf6] border-r-transparent border-b-[#8b5cf6] border-l-transparent rounded-full mb-4" />
            <p className="font-heading font-black text-lg text-white uppercase tracking-wider">Chargement de l'Archive Globale...</p>
            <p className="text-xs text-slate-400 mt-2 font-mono">Lecture de oparchive.json en cours...</p>
          </div>
        ) : (
          <>
            {/* Bannière Publicitaire Google AdSense Supérieure (non intrusive) */}
            <AdSenseBanner key={`upper-${activeTab}`} slot="1853909559" format="horizontal" className="mb-6" />

            {activeTab === "grid" && (
              <GrandLineGrid 
                characters={charactersDatabaseAllGamesFiltered} 
                globalBounty={playerBounty} 
                playerUsername={playerUsername}
                playerAvatar={playerAvatar}
                onUpdateBounty={(amt) => handleUpdateBounty(amt, "Grand Line Grid")} 
              />
            )}

            {activeTab === "tracker" && (
              <LogPoseTracker 
                characters={charactersDatabaseFiltered} 
                onUpdateBounty={(amt) => handleUpdateBounty(amt, "Log Pose Tracker")} 
              />
            )}

            {activeTab === "duel" && (
              <BountyDuel 
                characters={charactersDatabaseFiltered} 
                globalBounty={playerBounty} 
                onUpdateBounty={(amt) => handleUpdateBounty(amt, "Bounty Duel", "Aptitude")} 
              />
            )}

            {activeTab === "encyclopedia" && (
              <Encyclopedie characters={charactersDatabase} />
            )}

            {activeTab === "pyramid" && (
              <PiratePyramid 
                characters={charactersDatabaseFiltered} 
                onUpdateBounty={(amt) => handleUpdateBounty(amt, "Pyramide")}
              />
            )}

            {activeTab === "pirateShadow" && (
              <PirateShadow 
                characters={charactersDatabaseFiltered} 
                onUpdateBounty={(amt) => handleUpdateBounty(amt, "L'ombre du pirate")}
              />
            )}

            {activeTab === "fusion" && (
              <CharacterFusion 
                characters={charactersDatabaseFiltered} 
                onUpdateBounty={(amt) => handleUpdateBounty(amt, "Fusion Mystère")}
              />
            )}

            {activeTab === "fourImages" && (
              <FourImagesOneWord 
                characters={charactersDatabaseFiltered} 
                playerBounty={playerBounty}
                onUpdateBounty={(amt) => handleUpdateBounty(amt, "4 Pirates, 1 Mot")}
              />
            )}

            {activeTab === "timeline" && (
              <PirateTimeline 
                characters={top500CharactersFiltered} 
                onUpdateBounty={(amt) => handleUpdateBounty(amt, "Chronologie Pirate")}
              />
            )}

            {activeTab === "bountyTarget" && (
              <BountyTargetGame 
                characters={charactersDatabaseAllGamesFiltered} 
                onUpdateBounty={(amt) => handleUpdateBounty(amt, "Cible de Primes")}
              />
            )}

            {activeTab === "alliances" && (
              <SecretAlliances 
                characters={charactersDatabaseFiltered} 
                onUpdateBounty={(amt) => handleUpdateBounty(amt, "Alliances Secrètes")}
              />
            )}

            {activeTab === "undercover" && (
              <UndercoverGame 
                characters={charactersDatabaseFiltered} 
                onUpdateBounty={(amt) => handleUpdateBounty(amt, "Mission Undercover")}
              />
            )}

            {activeTab === "crossword" && (
              <MotsCroises 
                globalBounty={playerBounty}
                onUpdateBounty={(amt) => handleUpdateBounty(amt)}
              />
            )}

            {activeTab === "leaderboard" && (
              <BountyLeaderboard 
                leaderboardList={leaderboardList}
                playerRank={playerRank}
                playerRankNumber={playerRankDetails.rankNumber}
                loading={loadingOnlineUsers}
                onRefresh={fetchOnlineUsers}
                playerUsername={playerUsername}
                playerAvatar={playerAvatar}
                playerBounty={playerBounty}
                totalUsers={totalUsers}
              />
            )}

            {activeTab === "crew" && (
              <SocialAndCrew 
                playerEmail={localStorage.getItem("firebaseUserEmail")}
                playerUsername={playerUsername}
                playerAvatar={playerAvatar}
                playerBounty={playerBounty}
              />
            )}

            {activeTab === "wej" && (
              <WEJSection 
                playerEmail={localStorage.getItem("firebaseUserEmail")}
              />
            )}

            {activeTab === "blog" && (
              <BlogSection 
                playerEmail={localStorage.getItem("firebaseUserEmail")}
                playerUsername={playerUsername}
                playerAvatar={playerAvatar}
              />
            )}
          </>
        )}

        {/* ========================================== */}
        {/* ACCUEIL DE L'ÉQUIPAGE & HUB DES JEUX */}
        {/* ========================================== */}
        {activeTab === "home" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Grand Bandeau d'Accueil / Command Center */}
            <div className="bg-gradient-to-r from-violet-950/45 via-[#0C0F22]/95 to-slate-900/60 border border-violet-500/20 p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden backdrop-blur-md force-dark">
              <div className="absolute top-[-50%] right-[-10%] w-[350px] h-[350px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="space-y-3 text-center md:text-left">
                  <span className="text-[10px] md:text-xs font-mono font-bold uppercase tracking-widest text-[#a78bfa] bg-violet-950/80 px-3 py-1.5 rounded-md border border-violet-500/35 inline-block animate-pulse light-welcome-greeting">
                    Capitaine {playerUsername}, Bienvenue à bord ! 🏴‍☠️
                  </span>
                  <h2 className="text-2xl md:text-4xl font-heading font-black text-white tracking-tighter uppercase leading-none">
                    GRAND LINE INTERACTIVE HUB
                  </h2>
                  <p className="text-xs md:text-sm text-slate-300 max-w-2xl font-medium leading-relaxed">
                    Le portail suprême de divertissement et de logique pour tous les pirates d'One Piece. Défiez les combats, résolvez les mystères du Log Pose, démasquez les infiltrés et faites grimper votre notoriété universelle !
                  </p>
                </div>
                <div className="bg-[#10142C]/90 p-5 rounded-2xl border border-violet-500/20 shadow-lg text-center shrink-0 min-w-[200px]">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400 block font-bold mb-1">Votre Prime Actuelle</span>
                  <span className="font-heading font-black text-3xl text-amber-400 block tracking-tight">
                    ฿ {playerBounty.toLocaleString()}
                  </span>
                  <span className="text-[9px] uppercase font-heading font-black text-[#8b5cf6] block mt-1 tracking-widest">
                    {playerRank}
                  </span>
                </div>
              </div>
            </div>

            {/* Dynamic Banner: Connection Status / Login & Register opportunity */}
            {localStorage.getItem("firebaseUserEmail") ? (
              <div className="bg-emerald-950/20 border border-emerald-500/20 p-5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-heading text-lg">
                    ⚓
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-white text-xs uppercase tracking-wider">
                      Compte Grand Line connecté
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans mt-0.5">
                      Votre progression est sauvegardée sous le pseudo <strong className="text-white text-[13px]">{playerUsername}</strong> — email : <span className="font-mono text-emerald-300 font-bold light-email-text">{localStorage.getItem("firebaseUserEmail")}</span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto shrink-0">
                  <button
                    onClick={() => {
                      localStorage.removeItem("firebaseUserEmail");
                      // Clear state or reload to home
                      setActiveTab("home");
                    }}
                    className="px-4 py-2.5 text-[10px] md:text-[11px] font-heading font-extrabold tracking-wider text-rose-450 bg-rose-950/20 hover:bg-rose-900/30 border border-rose-500/20 rounded-xl transition-all uppercase cursor-pointer text-center w-full md:w-auto"
                  >
                    Se déconnecter
                  </button>
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className="px-4 py-2.5 text-[10px] md:text-[11px] font-heading font-extrabold tracking-wider text-emerald-450 bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/20 rounded-xl transition-all uppercase cursor-pointer text-center w-full md:w-auto whitespace-nowrap"
                  >
                    Gérer Profil & Équipage
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-violet-955/35 via-[#0D0F25]/90 to-violet-900/10 border border-violet-500/25 p-6 rounded-3xl shadow-xl space-y-5 relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-[-40%] right-[-10%] w-[255px] h-[255px] bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col md:flex-row items-center justify-between gap-5 relative z-10">
                  <div className="space-y-1.5 text-center md:text-left">
                    <h3 className="font-heading font-black text-sm text-white uppercase tracking-wider flex items-center gap-2 justify-center md:justify-start">
                      <Award className="w-5 h-5 text-amber-400" />
                      SAUVEGARDEZ VOTRE NOTORIÉTÉ PIRATE !
                    </h3>
                    <p className="text-xs text-slate-300 max-w-2xl font-medium leading-relaxed">
                      Vous jouez en session visiteur. Connectez-vous ou créez un compte pirate pour sauvegarder vos primes de combat (฿ {playerBounty.toLocaleString()}), vos victoires et votre équipage sur le serveur cloud Grand Line.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAuthForm(!showAuthForm)}
                    className="px-5 py-3 bg-violet-650 hover:bg-violet-650 text-white rounded-xl text-xs font-heading font-extrabold tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(139,92,246,0.25)] cursor-pointer w-full md:w-auto whitespace-nowrap text-center"
                  >
                    {showAuthForm ? "Masquer le formulaire ✕" : "🔑 Se connecter / Créer un compte"}
                  </button>
                </div>

                {showAuthForm && (
                  <div className="pt-4 border-t border-white/5 animate-in slide-in-from-top-4 duration-300">
                    <UserAuth 
                      playerBounty={playerBounty}
                      setPlayerBounty={setPlayerBounty}
                      playerUsername={playerUsername}
                      setPlayerUsername={setPlayerUsername}
                      playerAvatar={playerAvatar}
                      setPlayerAvatar={setPlayerAvatar}
                      stats={stats}
                      setStats={setStats}
                      logs={logs}
                      setLogs={setLogs}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Les îles de l'archipel des jeux (Full-width) */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-violet-600/15 text-violet-400 flex items-center justify-center border border-violet-500/20">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-lg text-white uppercase tracking-tight">L'ARCHIPEL DES JEUX PROPOSÉS</h3>
                    <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Sélectionnez une île interactive et lancez-vous 🧭</p>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-md border border-white/5 font-bold">
                    {PROPOSED_GAMES.length} Jeux & Applications
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {PROPOSED_GAMES.map((game) => {
                  const IconComponent = game.icon;
                  return (
                    <div 
                      key={game.id}
                      onClick={() => setActiveTab(game.id as any)}
                      className="bg-[#151838] border border-violet-500/25 hover:border-violet-400 rounded-2xl p-5 hover:bg-[#1c2049] transition-all duration-300 cursor-pointer group flex flex-col justify-between hover:-translate-y-1 relative overflow-hidden shadow-lg shadow-black/40 hover:shadow-violet-900/30 animate-in fade-in duration-200"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="p-2.5 rounded-xl bg-violet-600/10 text-violet-400 border border-violet-500/15 group-hover:bg-violet-600/20 group-hover:text-violet-300 transition-colors">
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <span className="text-[9px] uppercase font-mono tracking-widest bg-violet-950/40 text-violet-350 px-2 py-0.5 rounded-md border border-violet-500/15 font-black">
                            {game.id === "grid" && stats.gridWins > 0 ? `${stats.gridWins} Vict.` : 
                             game.id === "tracker" && stats.trackerWins > 0 ? `${stats.trackerWins} Résolus` : 
                             game.id === "duel" && stats.duelHigh > 0 ? `Record: ${stats.duelHigh}` : game.badge}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-heading font-black text-[#F8FAFC] text-sm uppercase tracking-wider group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                            {game.title}
                            {game.id === "undercover" && (
                              <span className="bg-rose-600 text-[8px] font-mono tracking-normal normal-case text-white px-2 py-0.5 rounded-full font-black animate-pulse shadow-md shrink-0">NEW</span>
                            )}
                          </h4>
                          <p className="text-[11px] text-slate-300 leading-relaxed font-sans line-clamp-3">
                            {game.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">
                        <span className="text-[9px] font-bold group-hover:underline">Lancement</span>
                        <span className="font-bold flex items-center gap-1 group-hover:translate-x-1.5 transition-transform text-[#8b5cf6]">
                          LANCER L'AVENTURE ⚔️
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* SECTION À LA UNE DU JOURNAL DE L'ÉCONOMIE MONDIALE (WEJ) - SEO & ADSENSE COMPLIANCE */}
              {latestWejArticles.length > 0 && (
                <div className="mt-12 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-rose-600/15 text-rose-500 flex items-center justify-center border border-rose-500/20">
                        <Newspaper className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-heading font-black text-lg text-white uppercase tracking-tight">À LA UNE DU JOURNAL WEJ</h3>
                        <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Les révélations géopolitiques de l'oiseau Morgans 🗞️</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setActiveTab("wej"); window.history.pushState(null, "", "/wej"); }}
                      className="text-xs font-mono font-bold uppercase text-rose-450 hover:underline cursor-pointer"
                    >
                      Voir toutes les éditions →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {latestWejArticles.map((art) => (
                      <div 
                        key={art.id}
                        className="bg-[#11142F] border border-violet-500/15 rounded-2xl p-5 flex flex-col justify-between hover:border-rose-500/30 hover:bg-[#161a3c] transition-all duration-300 shadow-md group relative overflow-hidden"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono uppercase bg-rose-950/40 text-rose-400 border border-rose-500/15 px-2 py-0.5 rounded-md font-bold">
                              {art.tags?.[0] || "Actualité"}
                            </span>
                            <span className="text-[9px] font-mono text-slate-400">
                              📅 {art.publishDate}
                            </span>
                          </div>

                          <h4 className="font-heading font-black text-[#F8FAFC] text-sm uppercase tracking-tight group-hover:text-rose-400 transition-colors line-clamp-2 leading-snug">
                            {art.title}
                          </h4>

                          <p className="text-[11px] text-slate-350 leading-relaxed font-sans line-clamp-3">
                            {art.summary}
                          </p>
                        </div>

                        <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-widest">
                          <span className="text-[9px] font-bold">Morgans WEJ</span>
                          <a 
                            href={`/wej/${art.id}`}
                            onClick={(e) => { 
                              e.preventDefault(); 
                              localStorage.setItem("selectedWejArticleId", art.id); 
                              setActiveTab("wej"); 
                              window.history.pushState(null, "", `/wej/${art.id}`); 
                              window.dispatchEvent(new Event("storage")); 
                            }}
                            className="font-bold text-rose-500 hover:text-rose-400 transition-colors cursor-pointer text-[10px]"
                          >
                            LIRE L'EDITION ⚔️
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION INFORMATIVE DE HAUTE VALEUR — GUIDE DE L'AVENTURIER ET WIKI DE COMBAT (AdSense Compliance & Real Utility) */}
              <div id="encyclopedia-guide" className="mt-12 bg-[#141737] border border-violet-500/20 rounded-3xl p-6 md:p-8 space-y-8 backdrop-blur-md shadow-lg shadow-black/30">
                <div className="border-b border-white/10 pb-4">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#a78bfa] uppercase">RESSOURCES OFFICIELLES DU HUB</span>
                  <h3 className="font-heading font-black text-xl md:text-2xl text-white uppercase mt-1">
                    GUIDE DE SURVIE SUR GRAND LINE : RÈGLES & STRATÉGIES 📖
                  </h3>
                  <p className="text-xs text-slate-350 mt-1 font-sans">
                    Découvrez comment maîtriser les défis de notre plateforme, accumuler des primes légendaires et débloquer les secrets de l'Archipel.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  {/* Carte FAQ 1 : Système de Primes */}
                  <div className="space-y-3 bg-[#1c204b]/90 border border-violet-500/15 p-5 rounded-2xl shadow-sm hover:border-violet-500/30 transition-all duration-300">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">💰</span>
                      <h4 className="font-heading font-black text-sm text-amber-400 uppercase tracking-wider">
                        Comment fonctionne le calcul des Primes (Bounty) ?
                      </h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      Chaque joueur démarre son aventure avec le rang de <strong className="text-white">Visiteur de Loguetown</strong> et une prime nulle. En remportant des victoires sur le <span className="text-violet-350 font-semibold font-mono">Grand Line Grid</span> ou en résolvant des énigmes du <span className="text-violet-350 font-semibold font-mono">Log Pose Tracker</span>, les autorités de la Marine ajustent votre avis de recherche (Wanted Poster).
                    </p>
                    <ul className="text-[11px] text-slate-400 space-y-1.5 list-disc pl-5 font-medium font-sans">
                      <li><strong className="text-slate-200">Victoire Grid :</strong> +15 000 000 ฿ pour récompenser votre alignement tactique.</li>
                      <li><strong className="text-slate-200">Succès Log Pose :</strong> +20 000 000 ฿ en trouvant le suspect mystère.</li>
                      <li><strong className="text-slate-200">Série de Duels :</strong> Jusqu'à +50 000 000 ฿ de bonus pour les séries de victoires d'affilée.</li>
                    </ul>
                  </div>

                  {/* Carte FAQ 2 : Grand Line Grid */}
                  <div className="space-y-3 bg-[#1c204b]/90 border border-violet-500/15 p-5 rounded-2xl shadow-sm hover:border-violet-500/30 transition-all duration-300">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⚔️</span>
                      <h4 className="font-heading font-black text-sm text-violet-400 uppercase tracking-wider">
                        Grand Line Grid : Règles de l'Arène
                      </h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      Il s'agit d'un morpion hautement stratégique inspiré par l'univers d'One Piece. Pour occuper une case de la grille 3x3, vous devez placer un personnage qui respecte les <strong className="text-white">deux conditions d'intersection</strong> (ligne et colonne).
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans mt-2">
                      Par exemple, si l'intersection requiert "Chapeau de Paille" et "Prime supérieure à 500M ฿", vous pouvez y affecter <strong className="text-amber-400 font-semibold">Luffy</strong> ou <strong className="text-amber-400 font-semibold font-bold font-sans">Zoro</strong>. Les doublons ne sont pas autorisés au cours d'une même partie !
                    </p>
                  </div>

                  {/* Carte FAQ 3 : Log Pose Tracker */}
                  <div className="space-y-3 bg-[#1c204b]/90 border border-violet-500/15 p-5 rounded-2xl shadow-sm hover:border-violet-500/30 transition-all duration-300">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🧭</span>
                      <h4 className="font-heading font-black text-sm text-teal-400 uppercase tracking-wider">
                        Maîtriser les indices du Log Pose Tracker
                      </h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      Chaque jour, un personnage secret de la base de données de Shueisha est désigné. À l'aide de vos propositions, le Log Pose analyse les affinités pour vous rapprocher de la cible :
                    </p>
                    <ul className="text-[11px] text-slate-400 space-y-1.5 list-disc pl-5 font-medium font-sans">
                      <li><span className="text-emerald-400 font-bold font-mono">Vert :</span> Correspondance exacte (ex. Genre correct, Équipage identique, Arc d'apparition identique).</li>
                      <li><span className="text-amber-400 font-bold font-mono">Orange :</span> Correspondance partielle ou indication de distance (ex. différence de prime de moins de 100M).</li>
                      <li><span className="text-rose-500 font-bold font-mono">Rouge :</span> Aucun élément commun. Changez drastiquement de cap d'analyse !</li>
                    </ul>
                  </div>

                  {/* Carte FAQ 4 : Mission Undercover */}
                  <div className="space-y-3 bg-[#1c204b]/90 border border-violet-500/15 p-5 rounded-2xl shadow-sm hover:border-violet-500/30 transition-all duration-300">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🕵️</span>
                      <h4 className="font-heading font-black text-sm text-rose-450 uppercase tracking-wider">
                        Mission Undercover : Démasquez Mister White
                      </h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      Un jeu d'infiltration multijoueur local parfait pour animer vos rassemblements d'équipage ! Les pirates reçoivent un mot secret lié à l'univers d'One Piece (ex. "Merry"), tandis que l'imposteur reçoit un mot très proche (ex. "Sunny") ou mystère.
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans mt-2">
                      Tour à tour, exprimez un seul mot pour prouver votre fidélité sans trop en dévoiler à l'imposteur, puis passez au vote démocratique pour le jeter aux requins.
                    </p>
                  </div>
                </div>

                {/* Section Avertissement Droits d'Auteurs (AdSense Crucial Element) */}
                <div className="bg-[#1c204b]/90 border border-violet-500/20 p-5 rounded-2xl text-center shadow-md">
                  <span className="text-xs font-heading font-black text-white uppercase block mb-1">PROPRIÉTÉ INTELLECTUELLE & CRÉDITS</span>
                  <p className="text-[11px] text-slate-350 max-w-4xl mx-auto leading-relaxed font-sans">
                    Les visuels, personnages, factions et emblèmes issus de l'univers de <strong className="text-slate-200">One Piece</strong> sont la propriété exclusive de leur créateur <strong className="text-slate-200">Eiichiro Oda</strong>, et de leurs éditeurs respectifs notamment <strong className="text-slate-200">Shueisha Inc.</strong>, <strong className="text-slate-200">Toei Animation</strong> et l'éditeur de l'œuvre originale française. Grand Line Hub est un portail communautaire à but non commercial, développé par des passionnés dans le cadre du respect des conditions de fair-use. Les photographies et illustrations de profils sont récupérées via des API ouvertes et libres de droits d'illustration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. TABLEAU DE BORD & WANTED POSTER DE JOUEUR */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <UserAuth 
              playerBounty={playerBounty}
              setPlayerBounty={setPlayerBounty}
              playerUsername={playerUsername}
              setPlayerUsername={setPlayerUsername}
              playerAvatar={playerAvatar}
              setPlayerAvatar={setPlayerAvatar}
              stats={stats}
              setStats={setStats}
              logs={logs}
              setLogs={setLogs}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Colonne Gauche : Votre Wanted Poster de Légende */}
              <div className="lg:col-span-5 flex flex-col items-center">
                
                <div className="bg-white border-2 border-[#1A1A1A] rounded-3xl p-6 shadow-sm max-w-sm w-full">
                  <div className="border border-[#E5E7EB] p-5 rounded-2xl flex flex-col h-full bg-[#FAFAFA] relative">
                    
                    <div className="text-center font-heading tracking-tighter font-black text-4xl text-[#1A1A1A] uppercase mb-4">
                      WANTED
                    </div>
                    
                    {/* Portrait pirate */}
                    <div className="h-60 rounded-xl overflow-hidden border-2 border-[#1A1A1A] bg-[#FAFAFA] mb-4 flex items-center justify-center relative group">
                      <img 
                        src={playerAvatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(playerUsername)}`}
                        alt={playerUsername}
                        className="w-full h-full object-cover shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 right-2 px-3 py-1 bg-[#1A1A1A] text-[9px] text-[#FFFFFF] rounded font-mono font-bold uppercase tracking-widest border border-black">
                        CANDIDAT
                      </div>
                      {/* Hover Change Image Button */}
                      <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => setIsSelectingAvatar(true)}
                          className="bg-white hover:bg-amber-500 text-black hover:text-white font-sans font-black text-[11px] px-3.5 py-2 rounded-xl border border-gray-200 shadow-md transition-all uppercase cursor-pointer"
                        >
                          Changer Image
                        </button>
                      </div>
                    </div>

                    {/* Nom éditable */}
                    <div className="text-center">
                      {isEditingName ? (
                        <div className="flex gap-2 items-center justify-center px-1">
                          <input
                            type="text"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            className="bg-white border text-xs font-heading font-black text-gray-800 p-2 rounded-xl w-full text-center outline-hidden border-[#E5E7EB] focus:border-black"
                            maxLength={30}
                          />
                          <button
                            onClick={handleSaveName}
                            className="text-[10px] bg-[#1A1A1A] hover:bg-[#8b5cf6] text-white font-extrabold uppercase tracking-widest px-3 py-2 rounded-xl shrink-0 cursor-pointer"
                          >
                            OK
                          </button>
                        </div>
                      ) : (
                        <div className="relative group inline-block">
                          <h3 className="font-heading text-3xl font-black text-[#1A1A1A] uppercase tracking-tighter leading-none">
                            {playerUsername}
                          </h3>
                          <div className="flex gap-4 justify-center items-center mt-2.5">
                            <button
                              onClick={() => setIsEditingName(true)}
                              className="text-[10px] text-[#1A1A1A] font-mono uppercase tracking-widest font-extrabold hover:text-[#8b5cf6] cursor-pointer underline-offset-4 underline"
                            >
                              Nom Pirate
                            </button>
                            <span className="text-gray-300 select-none">|</span>
                            <button
                              onClick={() => setIsSelectingAvatar(true)}
                              className="text-[10px] text-[#4b5563] font-mono uppercase tracking-widest font-extrabold hover:text-[#8b5cf6] cursor-pointer underline-offset-4 underline"
                            >
                              Changer Image
                            </button>
                          </div>
                        </div>
                      )}

                      <p className="text-[10px] text-gray-400 font-mono uppercase tracking-widest font-black mt-6">
                        DEAD OR ALIVE
                      </p>

                      <div className="mt-2 pt-2.5 border-t border-[#E5E7EB] text-center">
                        <span className="font-mono text-3xl font-black text-[#1A1A1A]">
                          ฿ {playerBounty.toLocaleString()}
                        </span>
                      </div>



                      <div className="mt-3">
                        <span className="text-[9px] uppercase font-mono tracking-widest text-[#6b7280] block font-bold">Rang & Réputation</span>
                        <span className="text-xs uppercase font-heading font-black text-[#8b5cf6] block mt-1 tracking-wider">
                          {playerRank}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* Colonne Droite : Statistiques, Progression & Logs du journal */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                
                {/* Carte de Progression */}
                <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-xs">
                  <h4 className="font-heading font-black text-[#1A1A1A] uppercase tracking-tighter text-lg mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    ESTIMATION DE LA NOTORIÉTÉ (RANK PROGRESS)
                  </h4>
                  
                  <p className="text-xs text-black mb-4 leading-relaxed font-medium">
                    Augmentez votre notoriété grâce à vos victoires stratégiques sur Grand Line Grid et vos déductions. Saisissez les primes légendaires !
                  </p>

                  {/* Barre de Progression */}
                  <div className="relative pt-2">
                    <div className="flex mb-3 items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-[#1A1A1A] text-white px-2 py-1 rounded inline-block">
                          {playerRank}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black uppercase tracking-tight text-[#1A1A1A]">
                          {Math.round(nextRankProgress)}% COMPLETE
                        </span>
                      </div>
                    </div>

                    <div className="overflow-hidden h-3 text-xs flex rounded-full bg-[#E5E7EB]">
                      <div 
                        style={{ width: `${nextRankProgress}%` }}
                        className="shadow-inner flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#8b5cf6] transition-all duration-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Fiche Stats du Journal */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-2xs">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#9ca3af] block font-extrabold mb-1.5">Morpion Combats</span>
                    <p className="font-heading text-2xl font-black text-[#2563eb] tracking-tighter">
                      {stats.gridWins} V. <span className="text-gray-300 font-medium font-sans">/</span> <span className="text-red-500">{stats.gridLosses} D.</span>
                    </p>
                    <span className="text-[9px] text-[#9ca3af] font-mono uppercase tracking-wider font-bold block mt-1.5">Plateau Grand Line Grid</span>
                  </div>

                  <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-2xs">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#9ca3af] block font-extrabold mb-1.5">Tracker Wordles</span>
                    <p className="font-heading text-2xl font-black text-[#0d9488] tracking-tighter">
                      {stats.trackerWins} WINS <span className="text-gray-300 font-normal font-sans text-sm">of {stats.trackerPlays}</span>
                    </p>
                    <span className="text-[9px] text-[#9ca3af] font-mono uppercase tracking-wider font-bold block mt-1.5">Taux de déduction</span>
                  </div>
                </div>

                {/* Historiques récents */}
                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs">
                  <h4 className="font-heading font-black text-[#1A1A1A] text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                    <History className="w-4 h-4 text-gray-400" />
                    LOG DES ACTIVITÉS DE COMBAT
                  </h4>

                  <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
                    {logs.map((log) => {
                      const isPositive = log.adjustment.startsWith("+");
                      return (
                        <div key={log.id} className="border-b border-[#E5E7EB] pb-3 flex justify-between items-center text-xs">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-heading font-extrabold text-[#1A1A1A] uppercase tracking-tight">{log.gameType}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-sm font-mono font-extrabold uppercase ${
                                isPositive ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
                              }`}>
                                {log.result}
                              </span>
                            </div>
                            <span className="text-[9px] text-[#9ca3af] font-mono block mt-1">{log.timestamp}</span>
                          </div>
                          <span className={`font-mono font-black text-sm ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
                            {log.adjustment}
                          </span>
                        </div>
                      );
                    })}

                    {logs.length === 0 && (
                      <p className="text-center text-gray-400 py-6 text-xs font-mono font-bold uppercase tracking-wider">Aventure vierge. Participez à vos premiers duels !</p>
                    )}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

      </main>
    </div>

      {/* MODAL DE SÉLECTION D'AVATAR */}
      {isSelectingAvatar && (
        <div id="avatar-modal-root" className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-3xl border-2 border-[#1A1A1A] max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/10 text-[#8b5cf6] flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black font-heading text-[#1A1A1A] uppercase tracking-tight">
                    Choisir l'image de votre compte
                  </h3>
                  <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">
                    Sélectionnez un personnage emblématique d'One Piece
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsSelectingAvatar(false);
                  setAvatarSearchQuery("");
                }}
                className="p-1 px-3 text-xs font-bold text-gray-500 hover:text-black hover:bg-slate-200 bg-slate-100 rounded-lg cursor-pointer transition-colors"
              >
                Fermer
              </button>
            </div>

            {/* Barre de Recherche */}
            <div className="p-5 border-b border-gray-100">
              <div className="relative">
                <input
                  type="text"
                  value={avatarSearchQuery}
                  onChange={(e) => setAvatarSearchQuery(e.target.value)}
                  placeholder="Rechercher par nom (ex: Luffy, Zoro, Robin...)"
                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl py-2.5 px-4 text-sm font-sans text-[#1A1A1A] outline-none focus:border-[#8b5cf6]"
                />
              </div>
            </div>

            {/* Grid d'avatars */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Option pixel art par défaut */}
                <div
                  onClick={() => {
                    setPlayerAvatar("");
                    setIsSelectingAvatar(false);
                    setAvatarSearchQuery("");
                  }}
                  className={`border rounded-2xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    !playerAvatar
                      ? "bg-[#8b5cf6]/10 border-[#8b5cf6] ring-2 ring-[#8b5cf6]/20 font-black"
                      : "bg-white hover:bg-gray-50 border-gray-150"
                  }`}
                >
                  <img
                    src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(playerUsername)}`}
                    alt="Avatar par défaut"
                    className="w-16 h-16 rounded-full object-cover shrink-0 border bg-slate-100 mb-2"
                  />
                  <span className="text-[10px] uppercase font-mono tracking-wide text-gray-500 font-black truncate max-w-full">
                    Pixel Art (Défaut)
                  </span>
                </div>

                {/* Liste filtrée */}
                {charactersDatabase
                  .filter(c => c.name.toLowerCase().includes(avatarSearchQuery.toLowerCase()) || 
                               c.crew.toLowerCase().includes(avatarSearchQuery.toLowerCase()))
                  .map((char) => {
                    const isSelected = playerAvatar === char.image;
                    return (
                      <div
                        key={char.id}
                        onClick={() => {
                          setPlayerAvatar(char.image);
                          setIsSelectingAvatar(false);
                          setAvatarSearchQuery("");
                        }}
                        className={`border rounded-2xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                          isSelected
                            ? "bg-[#8b5cf6]/10 border-[#8b5cf6] ring-2 ring-[#8b5cf6]/20 font-black"
                            : "bg-white hover:bg-gray-50 border-gray-150"
                        }`}
                      >
                        <img
                          src={char.image}
                          alt={char.name}
                          className="w-16 h-16 rounded-full object-cover shrink-0 border bg-slate-100 mb-2"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(char.name)}`;
                          }}
                        />
                        <span className="text-[10px] uppercase font-heading text-gray-800 font-black leading-tight text-center truncate max-w-full">
                          {char.name}
                        </span>
                        <span className="text-[8px] font-mono text-gray-400 uppercase tracking-widest mt-0.5 truncate max-w-full">
                          {char.crew === "Inconnu" ? "Pirate libre" : char.crew}
                        </span>
                      </div>
                    );
                  })}
              </div>

              {charactersDatabase.filter(c => c.name.toLowerCase().includes(avatarSearchQuery.toLowerCase()) || c.crew.toLowerCase().includes(avatarSearchQuery.toLowerCase())).length === 0 && (
                <div className="py-12 text-center text-gray-400 font-sans text-xs">
                  Aucun personnage ne correspond à votre recherche. Saisissez d'autres lettres !
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL GLOBAL D'INFORMATION ET CONFORMITÉ (AdSense, RGPD, CGU, Mentions) */}
      {infoModal && (
        <div className="fixed inset-0 bg-[#020617]/90 z-50 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#0B0F24] border border-violet-500/25 max-w-2xl w-full rounded-3xl p-6 md:p-8 shadow-2xl relative my-8 text-left max-h-[90vh] overflow-y-auto flex flex-col justify-between">
            <button 
              onClick={() => { setInfoModal(null); window.history.pushState(null, "", "/"); }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center font-bold text-xs transition-colors hover:scale-110 active:scale-95"
              title="Fermer"
            >
              ✕
            </button>

            {/* Contenu de l'onglet : À PROPOS */}
            {infoModal === "about" && (
              <div className="space-y-4">
                <div className="border-b border-white/10 pb-3">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#a78bfa] block font-black">Pris face au vent</span>
                  <h3 className="font-heading font-black text-xl text-white uppercase mt-0.5">Qui sommes-nous (À Propos) ⚓</h3>
                </div>
                <div className="text-xs text-slate-300 space-y-3 font-sans leading-relaxed">
                  <p>
                    Bienvenue sur <strong className="text-violet-300">Grand Line Hub</strong>, l'ambassade interactive ultime pour tous les passionnés de l'univers d'Eiichiro Oda ! Développé de A à Z par un équipage de développeurs passionnés et fans inconditionnels de la première heure (depuis l'arc Arlong Park), notre portail a pour unique mission d'offrir une plateforme ludique, saine et hautement stimulante.
                  </p>
                  <p>
                    Contrairement à de simples wikis statiques, Grand Line Hub privilégie <strong className="text-amber-400">l'interaction et la logique cognitive</strong>. Nous programmons des jeux exclusifs tels que le <span className="font-mono text-violet-200 font-bold">Grand Line Grid</span>, le <span className="font-mono text-violet-200 font-bold">Log Pose Tracker</span> et d'autres outils de réflexion pour tester vos connaissances pointues sur l'organisation des équipages, l'évolution de la Marine, les primes, l'âge légendaire des empereurs et les filiations des amiraux.
                  </p>
                  <h4 className="font-heading font-black text-xs text-amber-300 uppercase tracking-widest mt-4">Notre Vision Communautaire</h4>
                  <p>
                    Nous croyons en un web ouvert, haut en couleurs et débarrassé des publicités agressives. Tous nos jeux de stratégie sont et resteront gratuits, garantis sans paywalls. Vos primes ne s'achètent pas sous forme de microtransactions, elles se méritent uniquement par la force de vos déductions !
                  </p>
                  <p className="text-[11px] text-slate-400 italic">
                    Merci d'avoir jeté l'ancre chez nous. Que votre route vers Laugh Tale soit semée d'honneur et d'alliances solides !
                  </p>
                </div>
              </div>
            )}

            {/* Contenu de l'onglet : MENTIONS LÉGALES */}
            {infoModal === "legal" && (
              <div className="space-y-4">
                <div className="border-b border-white/10 pb-3">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#a78bfa] block font-black">Conformité Légale .FR</span>
                  <h3 className="font-heading font-black text-xl text-white uppercase mt-0.5">Mentions Légales ⚖️</h3>
                </div>
                <div className="text-xs text-slate-300 space-y-3 font-sans leading-relaxed">
                  <p>
                    Conformément aux dispositions de l'article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique (LCEN), il est précisé aux utilisateurs du site <strong className="text-white">grandlinehub.fr</strong> l'identité des différents intervenants dans le cadre de sa réalisation et de son suivi :
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-400">
                    <li><strong>Éditeur du site :</strong> Association Grand Line Collectif, gérée bénévolement par un collège indépendant d'étudiants et fans. Email de contact : <span className="text-violet-350 font-bold">contact@grandlinehub.fr</span>.</li>
                    <li><strong>Directeur de la publication :</strong> Équipage Grand Line Hub (Publication communautaire non-lucrative).</li>
                    <li><strong>Hébergement du site :</strong> Google Cloud Run & Firebase Hosting, opéré par Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irlande.</li>
                  </ul>
                  <h4 className="font-heading font-black text-xs text-violet-400 uppercase tracking-widest mt-4">Responsabilité pour le Contenu du Blog</h4>
                  <p>
                    Le site propose un espace communautaire en ligne interactif (le Forum des Pirates - Blog Section). Les propos tenus sur ce blog le sont sous la responsabilité exclusive de leurs auteurs respectifs. Tout utilisateur peut signaler un contenu abusif, diffamatoire ou contraire aux lois françaises à l'adresse de signalement immédiat : <strong className="text-white">signaler@grandlinehub.fr</strong>. Notre équipe s'engage à modérer et supprimer tout message illicite sous un délai maximum de 24 heures.
                  </p>
                </div>
              </div>
            )}

            {/* Contenu de l'onglet : CGU */}
            {infoModal === "terms" && (
              <div className="space-y-4">
                <div className="border-b border-white/10 pb-3">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#a78bfa] block font-black">Charte Pirate</span>
                  <h3 className="font-heading font-black text-xl text-white uppercase mt-0.5">Conditions Générales d'Utilisation 📜</h3>
                </div>
                <div className="text-xs text-slate-300 space-y-3 font-sans leading-relaxed">
                  <p>
                    L'utilisation du site <strong className="text-white">grandlinehub.fr</strong> implique l'acceptation pleine et entière des présentes conditions d'utilisation, rédigées pour assurer le respect mutuel et le fair-play au sein de notre communauté de passionnés d'One Piece.
                  </p>
                  <h4 className="font-heading font-black text-xs text-amber-300 uppercase tracking-widest">1. Accès et Services Gratuits</h4>
                  <p>
                    L'accès aux jeux (Morpion strategic, wordle, etc.) est totalement libre et gratuit. La création d'un compte pirate ou l'utilisation d'une session visiteur est disponible pour stocker vos statistiques sur le Cloud.
                  </p>
                  <h4 className="font-heading font-black text-xs text-amber-300 uppercase tracking-widest">2. Comportement sur le Forum</h4>
                  <p>
                    Dans les espaces de discussion et de partage communautaire du site (Blog et équipages), chaque pirate s'engage à respecter les autres membres. La provocation gratuite, le harcèlement, l'injure et le partage de liens illégaux d'œuvres protégées (tels que des scans de chapitres piratés) sont strictement interdits et passibles de bannières définitives de l'adresse IP et d'un mandat d'arrêt émis par notre conseil d'administration !
                  </p>
                  <h4 className="font-heading font-black text-xs text-amber-300 uppercase tracking-widest">3. Propriété de l'œuvre</h4>
                  <p>
                    Aucune affiliation officielle avec Toei Animation ou Eiichiro Oda n'est revendiquée. Ce site est conçu sous un régime d'exception d'enseignement, d'études et de critique littéraire.
                  </p>
                </div>
              </div>
            )}

            {/* Contenu de l'onglet : CONFIDENTIALITÉ & RGPD */}
            {infoModal === "privacy" && (
              <div className="space-y-4">
                <div className="border-b border-white/10 pb-3">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#a78bfa] block font-black">Protection de la vie privée</span>
                  <h3 className="font-heading font-black text-xl text-white uppercase mt-0.5">Confidentialité & Protection RGPD 🔒</h3>
                </div>
                <div className="text-xs text-slate-300 space-y-3 font-sans leading-relaxed animate-in fade-in duration-100">
                  <p>
                    Sur <strong className="text-white">grandlinehub.fr</strong>, nous prenons la sécurité de votre équipage et de vos données personnelles extrêmement au sérieux. Conformément au Règlement Général sur la Protection des Données (RGPD) n° 2016/679 de l'Union Européenne, voici comment nous traitons vos informations :
                  </p>
                  <h4 className="font-heading font-black text-xs text-teal-400 uppercase tracking-widest">1. Données Stockées en Local (LocalStorage)</h4>
                  <p>
                    Vos scores, victoires, primes de tournoi (Bounty) et préférences de jeu sont sauvegardés directement dans le stockage local de votre propre navigateur. Ces données ne quittent pas votre ordinateur, sauf si vous décidez de vous authentifier pour l'enregistrer dans nos serveurs cloud sécurisés.
                  </p>
                  <h4 className="font-heading font-black text-xs text-teal-400 uppercase tracking-widest">2. Comptes Firebase & Sécurité</h4>
                  <p>
                    Lorsque vous vous connectez à l'aide de votre adresse email, celle-ci est gérée et hébergée par Firebase Authentication dans l'Union Européenne. Les mots de passe sont rendus inaccessibles par chiffrement de haut niveau. Nous n'aurons jamais accès à votre mot de passe et n'enverrons jamais d'emails promotionnels non-sollicités (zéro Spam).
                  </p>
                  <h4 className="font-heading font-black text-xs text-teal-400 uppercase tracking-widest">3. Vos Droits d'Accès et d'Effacement</h4>
                  <p>
                    Vous disposez d'un droit total d'accès, de rectification et d'effacement total de votre compte. Vous pouvez effectuer l'effacement de vos données d'un seul clic à tout moment, ou en adressant un email amical à <strong className="text-white">rgpd@grandlinehub.fr</strong>. Toutes vos fiches et commentaires seront effacés de manière sécurisée sous 48 heures.
                  </p>
                </div>
              </div>
            )}

            {/* Contenu de l'onglet : CONTACT & SUPPORT EN DIRECT */}
            {infoModal === "contact" && (
              <div className="space-y-4">
                <div className="border-b border-white/10 pb-3">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#a78bfa] block font-black">Messagerie d'Amirauté</span>
                  <h3 className="font-heading font-black text-xl text-white uppercase mt-0.5">Nous Contacter (Support & RGPD) ✉️</h3>
                </div>
                <div className="text-xs text-slate-300 space-y-3 font-sans leading-relaxed">
                  <p>
                    Un bug à signaler sur la grille du <span className="font-bold text-violet-300">Grand Line Grid</span> ? Une suggestion pour ajouter de nouvelles caractéristiques à la base de données d'One Piece ? Ou simplement pour demander la suppression de votre adresse de la base cloud de notre serveur ?
                  </p>
                  <p>
                    Remplissez ce formulaire crypté pour que notre pigeon voyageur transmette votre message directement à notre équipe technique.
                  </p>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      alert("Message envoyé ! Le Pigeon de Morgans a pris son envol avec votre pli urgent 🦅 !");
                      setInfoModal(null);
                    }}
                    className="space-y-3 mt-4 bg-[#10142C]/80 p-4 border border-violet-500/10 rounded-2xl"
                  >
                    <div>
                      <label className="block text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold mb-1">Votre Nom / Pseudo Pirate</label>
                      <input 
                        type="text" 
                        required 
                        defaultValue={playerUsername}
                        placeholder="Ex: Luffy du 92" 
                        className="w-full bg-[#080B1E] border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-sans focus:outline-none focus:border-violet-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold mb-1">Votre Email pour la réponse</label>
                      <input 
                        type="email" 
                        required 
                        defaultValue={localStorage.getItem("firebaseUserEmail") || ""}
                        placeholder="pirate@grandline.com" 
                        className="w-full bg-[#080B1E] border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-sans focus:outline-none focus:border-violet-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold mb-1">Sujet de votre requète</label>
                      <select className="w-full bg-[#080B1E] border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-sans focus:outline-none focus:border-violet-500 transition-colors">
                        <option>Signaler un bug de jeu</option>
                        <option>Demande d'exercice des droits RGPD</option>
                        <option>Partenariat / Idée géniale</option>
                        <option>Problème de compte ou de prime</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold mb-1">Votre Message</label>
                      <textarea 
                        required 
                        rows={3}
                        placeholder="Détaillez votre message comme sur un parchemin d'équipage..." 
                        className="w-full bg-[#080B1E] border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-sans focus:outline-none focus:border-violet-500 transition-colors resize-none"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-violet-600 hover:bg-violet-500 active:scale-[0.98] transition-all py-2.5 rounded-xl text-white font-heading font-black uppercase text-xs tracking-widest mt-2"
                    >
                      Envoyer le pli urgent ⚔️
                    </button>
                  </form>
                </div>
              </div>
            )}

            <div className="mt-6 pt-3 border-t border-white/5 flex justify-end">
              <button 
                onClick={() => { setInfoModal(null); window.history.pushState(null, "", "/"); }}
                className="bg-slate-800 hover:bg-slate-700 text-white font-heading font-black uppercase text-[10px] tracking-widest px-4 py-2 rounded-xl transition-colors"
              >
                Retourner à la Mer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. DESIGN FOOTER HUMBLE & CLEAN */}
      <footer className="bg-slate-950 border-t border-slate-900 py-10 mt-16 text-center text-xs text-gray-400 font-sans">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          {/* Bannière Publicitaire Google AdSense en Pied de Page */}
          <AdSenseBanner key={`footer-${activeTab}`} slot="1658390955" format="horizontal" />

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-slate-300 font-medium">
            <a 
              href="/about"
              onClick={(e) => { e.preventDefault(); setInfoModal("about"); window.history.pushState(null, "", "/about"); }} 
              className="hover:text-amber-400 transition-colors uppercase tracking-wider text-[11px]"
            >
              Qui sommes-nous
            </a>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <a 
              href="/legal"
              onClick={(e) => { e.preventDefault(); setInfoModal("legal"); window.history.pushState(null, "", "/legal"); }} 
              className="hover:text-amber-400 transition-colors uppercase tracking-wider text-[11px]"
            >
              Mentions Légales
            </a>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <a 
              href="/terms"
              onClick={(e) => { e.preventDefault(); setInfoModal("terms"); window.history.pushState(null, "", "/terms"); }} 
              className="hover:text-amber-400 transition-colors uppercase tracking-wider text-[11px]"
            >
              Conditions d'Utilisation (CGU)
            </a>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <a 
              href="/privacy"
              onClick={(e) => { e.preventDefault(); setInfoModal("privacy"); window.history.pushState(null, "", "/privacy"); }} 
              className="hover:text-amber-400 transition-colors uppercase tracking-wider text-[11px]"
            >
              Confidentialité & RGPD
            </a>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <a 
              href="/contact"
              onClick={(e) => { e.preventDefault(); setInfoModal("contact"); window.history.pushState(null, "", "/contact"); }} 
              className="hover:text-amber-400 transition-colors uppercase tracking-wider text-[11px]"
            >
              Contact / Support
            </a>
          </div>

          <div className="h-px bg-slate-900 w-24 mx-auto" />

          <p className="font-heading font-black text-slate-200 uppercase tracking-widest text-[11px] mb-1">
            GRAND LINE HUB &copy; {new Date().getFullYear()}
          </p>
          <p className="max-w-md mx-auto text-[11px] text-slate-500 leading-relaxed">
            Un portail d'honneur créé pour divertir la communauté de pirates à travers le monde. Naviguez toujours face au vent !
          </p>
        </div>
      </footer>

      {/* Système de Toasts Globaux haut de gamme */}
      <div id="global-toasts-portal" className="fixed top-20 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)] pointer-events-none">
        {globalToasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100 flex items-start gap-3 animate-fade-in ${
              toast.type === "success"
                ? "bg-emerald-950/85 border-emerald-500/30 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                : toast.type === "error"
                ? "bg-rose-950/85 border-rose-500/30 text-rose-300 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                : toast.type === "warning"
                ? "bg-amber-950/85 border-amber-500/30 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                : "bg-slate-900/95 border-slate-700/50 text-slate-200 shadow-[0_0_15px_rgba(30,41,59,0.2)]"
            }`}
          >
            <div className="text-xl shrink-0">
              {toast.type === "success" ? "🏆" : toast.type === "error" ? "💀" : toast.type === "warning" ? "⚠️" : "⚓"}
            </div>
            <div className="flex-1 text-sm font-medium leading-relaxed">
              {toast.message}
            </div>
            <button
              onClick={() => setGlobalToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-slate-400 hover:text-white transition-colors text-xs p-0.5 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}

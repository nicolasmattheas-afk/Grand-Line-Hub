import React, { useState, useEffect, useMemo } from "react";
import { getCharactersDatabase } from "./data/characters";
import { getOfficialDevilFruitOverride } from "./data/official_fruits";
import { FEMALE_NAMES } from "./data/femaleNames";
import { SWORDSMEN_NAMES } from "./data/swordsmen";
import { LUFFY_BATTLES, getLuffyOpponentsSet } from "./data/luffyBattles";
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
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "./lib/firebase";
import { track } from "@vercel/analytics";
import { 
  Trophy, Award, Compass, Swords, ArrowRightLeft, BookOpen, 
  Sparkles, History, User, Heart, Settings, LayoutDashboard, Coins, Clock, Users, Brain, Crown, Newspaper, MessageSquare, Menu, X
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
    try {
      const rawData = getCharactersDatabase();
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
              if (dbNameNorm.includes(sNorm) || sNorm.includes(dbNameNorm)) {
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
          if (norm.includes("law") || norm.includes("trafalgar")) return "trafalgardwaterlaw";
          if (norm.includes("zoro") || norm.includes("roronoa")) return "roronoazoro";
          if (norm.includes("doflamingo") || norm.includes("donquixote")) return "donquixotedoflamingo";
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

        // Special fallback
        if (dbNameNorm === "monkeydluffy") {
          characterIsLuffyOpponent = false;
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
      });
      setCharactersDatabase(mapped);
      setLoadingCharacters(false);
    } catch (e) {
      console.error("Erreur d'importation de la base de données characters.ts :", e);
      setLoadingCharacters(false);
    }
  }, []);
  
  // Onglets : "grid" | "tracker" | "duel" | "encyclopedia" | "dashboard" | "crew" | "pirateShadow" | "timeline" | "bountyTarget" | "alliances" | "leaderboard" | "wej" | "blog" | "pyramid"
  const [activeTab, setActiveTab] = useState<"grid" | "tracker" | "duel" | "encyclopedia" | "dashboard" | "crew" | "pirateShadow" | "timeline" | "bountyTarget" | "alliances" | "leaderboard" | "wej" | "blog" | "pyramid">("grid");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // States pour le classement des primes en ligne
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [loadingOnlineUsers, setLoadingOnlineUsers] = useState(false);

  const fetchOnlineUsers = async () => {
    try {
      setLoadingOnlineUsers(true);
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList: any[] = [];
      querySnapshot.forEach((docSnap) => {
        usersList.push({
          email: docSnap.id,
          ...docSnap.data()
        });
      });
      setOnlineUsers(usersList);
      localStorage.setItem("cached_online_users", JSON.stringify(usersList));
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
  }, [playerBounty]); // Re-fetch quand notre prime change

  // Liste globale fusionnée et classée par prime décroissante
  const leaderboardList: LeaderboardEntry[] = useMemo(() => {
    let filteredOnline = onlineUsers.map(u => ({
      username: u.username || "Pirate Mystère",
      bounty: Number(u.bounty ?? 0),
      avatar: u.avatar || "",
      email: u.email,
      isRival: false,
      isCurrentUser: u.email === localStorage.getItem("firebaseUserEmail")
    }));

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
    else if (position <= 122) title = "Second d'empereur";
    else if (position <= 322) title = "Commandant d'empereur";
    else if (position <= 622) title = "Combattant de l'équipage";
    else if (position <= 1122) title = "Membre de l'équipage";
    else if (position <= 1922) title = "Chasseur de prime";
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

  // Synchronisation automatique et détection du compte nicolasmattheas@gmail.com
  useEffect(() => {
    const userEmail = localStorage.getItem("firebaseUserEmail");
    if (userEmail === "nicolasmattheas@gmail.com") {
      const hasReset = localStorage.getItem("hasResetBountyTo50M_v2");
      if (!hasReset) {
        setPlayerBounty(50000000);
        localStorage.setItem("playerBountyValue", "50000000");
        localStorage.setItem("hasResetBountyTo50M_v2", "true");

        // Mettre à jour directement la base de données Firestore pour que ça se reflète partout et instantanément sur grandlinehub.fr
        const syncBountyToFirestore = async () => {
          try {
            const userDocRef = doc(db, "users", "nicolasmattheas@gmail.com");
            await updateDoc(userDocRef, {
              bounty: 50000000
            });
            console.log("Synchronisation initiale de la prime à 50 000 000 ฿ réussie !");
            fetchOnlineUsers();
          } catch (e) {
            console.error("Échec de la synchronisation initiale de la prime vers Firestore :", e);
          }
        };
        syncBountyToFirestore();
      }
    }
  }, []);

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
    if (tab === "grid") return "Grand Line Grid";
    if (tab === "tracker") return "Log Pose Tracker";
    if (tab === "duel") return "Bounty Duel";
    if (tab === "pyramid") return "Pyramide";
    if (tab === "pirateShadow") return "L'ombre du pirate";
    if (tab === "timeline") return "Chronologie Pirate";
    if (tab === "bountyTarget") return "Cible de Primes";
    if (tab === "alliances") return "Alliances Secrètes";
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
          <div className="flex items-center gap-2 md:gap-3">
            <img 
              src="/logo.svg" 
              alt="Grand Line Logo" 
              className="w-8 h-8 md:w-10 md:h-10 object-contain shrink-0 filter drop-shadow-[0_0_6px_rgba(239,68,68,0.35)] hover:scale-110 active:rotate-12 transition-all cursor-pointer select-none"
              referrerPolicy="no-referrer"
              onClick={() => {
                // Secret easter egg: play a sound or trigger visual response if desired, or go back to main tab
                window.dispatchEvent(new CustomEvent("click-logo"));
              }}
            />
            <div>
              <h1 className="text-xs sm:text-lg md:text-2xl font-black font-heading tracking-tighter uppercase leading-none text-white flex items-center gap-1.5">
                GRAND LINE <span className="text-violet-400">HUB</span>
              </h1>
              <p className="text-[8px] md:text-[10px] text-violet-400 font-mono tracking-widest uppercase font-extrabold mt-0.5 md:mt-1 hidden sm:block">
                L'AVENTURE COMMENCE ICI
              </p>
            </div>
          </div>

          {/* Profil d'Équipage Réel & Prime (Bounty) */}
          <div 
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
            {activeTab === "grid" && (
              <GrandLineGrid 
                characters={charactersDatabase} 
                globalBounty={playerBounty} 
                playerUsername={playerUsername}
                playerAvatar={playerAvatar}
                onUpdateBounty={(amt) => handleUpdateBounty(amt, "Grand Line Grid")} 
              />
            )}

            {activeTab === "tracker" && (
              <LogPoseTracker 
                characters={charactersDatabase} 
                onUpdateBounty={(amt) => handleUpdateBounty(amt, "Log Pose Tracker")} 
              />
            )}

            {activeTab === "duel" && (
              <BountyDuel 
                characters={charactersDatabase} 
                globalBounty={playerBounty} 
                onUpdateBounty={(amt) => handleUpdateBounty(amt, "Bounty Duel", "Aptitude")} 
              />
            )}

            {activeTab === "encyclopedia" && (
              <Encyclopedie characters={charactersDatabase} />
            )}

            {activeTab === "pyramid" && (
              <PiratePyramid 
                characters={charactersDatabase} 
                onUpdateBounty={(amt) => handleUpdateBounty(amt, "Pyramide")}
              />
            )}

            {activeTab === "pirateShadow" && (
              <PirateShadow 
                characters={charactersDatabase} 
                onUpdateBounty={(amt) => handleUpdateBounty(amt, "L'ombre du pirate")}
              />
            )}

            {activeTab === "timeline" && (
              <PirateTimeline 
                characters={top500Characters} 
                onUpdateBounty={(amt) => handleUpdateBounty(amt, "Chronologie Pirate")}
              />
            )}

            {activeTab === "bountyTarget" && (
              <BountyTargetGame 
                characters={charactersDatabase} 
                onUpdateBounty={(amt) => handleUpdateBounty(amt, "Cible de Primes")}
              />
            )}

            {activeTab === "alliances" && (
              <SecretAlliances 
                characters={charactersDatabase} 
                onUpdateBounty={(amt) => handleUpdateBounty(amt, "Alliances Secrètes")}
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

      {/* 4. DESIGN FOOTER HUMBLE & CLEAN */}
      <footer className="bg-white border-t border-[#E5E7EB] py-8 mt-16 text-center text-xs text-gray-400 font-sans">
        <p className="font-heading font-black text-gray-500 uppercase tracking-widest text-[11px] mb-1">
          GRAND LINE HUB &copy; {new Date().getFullYear()}
        </p>
        <p className="max-w-md mx-auto text-[11px] text-gray-400 px-4 font-medium leading-relaxed">
          Un portail d'honneur créé pour divertir la communauté de pirates à travers le monde. Naviguez toujours face au vent !
        </p>
      </footer>

    </div>
  );
}

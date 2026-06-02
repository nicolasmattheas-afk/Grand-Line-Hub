import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Character } from "../types";
import { searchCharacters } from "../data/characters";
import { 
  Users, Globe, Compass, RefreshCw, X, Check, AlertTriangle, 
  HelpCircle, Trophy, UserCheck, Play, Swords, UserPlus, Send, Copy, Key
} from "lucide-react";
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, 
  deleteDoc, query, where, onSnapshot, serverTimestamp, arrayUnion, limit 
} from "firebase/firestore";
import { db } from "../lib/firebase";

interface GrandLineGridProps {
  characters: Character[];
  globalBounty: number;
  playerUsername: string;
  playerAvatar: string;
  onUpdateBounty: (amount: number) => void;
}

interface Category {
  id: string;
  label: string;
  check: (c: Character) => boolean;
}

// Catégories de validation de la grille
const CATEGORIES: { [key: string]: Category } = {
  pirate: { id: "pirate", label: "Pirate Affiliation", check: (c) => c.affiliation === "Pirate" },
  marine: { id: "marine", label: "Officier Marine", check: (c) => c.affiliation === "Marine" },
  revolutionary: { id: "revolutionary", label: "Révolutionnaire", check: (c) => c.affiliation === "Révolutionnaire" || c.crew.toLowerCase().includes("revolutionary") },
  government: { id: "government", label: "Gouv. Mondial / CP", check: (c) => c.affiliation === "Gouvernement" || c.crew.toLowerCase().includes("cp0") || c.crew.toLowerCase().includes("cp9") || c.crew.toLowerCase().includes("five elders") || c.crew.toLowerCase().includes("knights of god") },

  fruit: { id: "fruit", label: "Possède un Fruit", check: (c) => c.devilFruit !== "Aucun" },
  no_fruit: { id: "no_fruit", label: "Sans Fruit du Démon", check: (c) => c.devilFruit === "Aucun" },
  paramecia: { id: "paramecia", label: "Fruit Paramecia", check: (c) => c.devilFruit === "Paramecia" },
  logia: { id: "logia", label: "Fruit Logia", check: (c) => c.devilFruit === "Logia" },
  zoan: { id: "zoan", label: "Fruit Type Zoan", check: (c) => c.devilFruit === "Zoan" || c.devilFruit === "Zoan Mythique" },

  busoshoku: { id: "busoshoku", label: "Haki de l'armement", check: (c) => c.haki.includes("Busoshoku") },
  kenbunshoku: { id: "kenbunshoku", label: "Haki de l'observation", check: (c) => c.haki.includes("Kenbunshoku") },
  haoshoku: { id: "haoshoku", label: "Haki des rois", check: (c) => c.haki.includes("Haoshoku") },

  femme: { id: "femme", label: "Femme", check: (c) => c.gender === "Femme" },
  homme: { id: "homme", label: "Homme", check: (c) => c.gender === "Homme" },
  vivant: { id: "vivant", label: "Vivant", check: (c) => c.status === "Vivant" },
  decede: { id: "decede", label: "Décédé", check: (c) => c.status === "Décédé" },

  strawhat: { id: "strawhat", label: "Équip. Chapeau de Paille", check: (c) => {
    const cl = c.crew.toLowerCase();
    const nl = c.name.toLowerCase();
    return (cl.includes("straw hat") || cl.includes("chapeau de paille")) && !cl.includes("fake") && !cl.includes("faux") && !nl.includes("fake") && !nl.includes("faux");
  }},
  whitebeard: { id: "whitebeard", label: "Équip. Barbe Blanche", check: (c) => c.crew.toLowerCase().includes("whitebeard") || c.crew.includes("Barbe Blanche") },
  beasts: { id: "beasts", label: "Équip. Cent Bêtes (Kaido)", check: (c) => c.crew.toLowerCase().includes("beasts") || c.crew.toLowerCase().includes("kaido") },
  bigmom: { id: "bigmom", label: "Équip. de Big Mom", check: (c) => c.crew.toLowerCase().includes("big mom") || c.crew.toLowerCase().includes("charlotte linlin") },
  red_hair: { id: "red_hair", label: "Équip. de Shanks le Roux", check: (c) => {
    const cl = c.crew.toLowerCase();
    return (cl.includes("red hair") || cl.includes("shanks") || cl.includes("akagami")) && !cl.includes("fake") && !cl.includes("faux");
  }},
  blackbeard: { id: "blackbeard", label: "Équip. de Barbe Noire", check: (c) => {
    const cl = c.crew.toLowerCase();
    return (cl.includes("blackbeard") || cl.includes("barbe noire") || cl.includes("marshall d. teach")) && !cl.includes("fake") && !cl.includes("faux");
  }},
  roger: { id: "roger", label: "Pirates de Roger", check: (c) => {
    const cl = c.crew.toLowerCase();
    return cl.includes("roger") && !cl.includes("fake") && !cl.includes("faux");
  }},
  donquixote: { id: "donquixote", label: "Donquixote Family (Doflamingo)", check: (c) => {
    const cl = c.crew.toLowerCase();
    return cl.includes("donquixote") || (c.description && c.description.toLowerCase().includes("donquixote family"));
  }},
  crew_baroque: { id: "crew_baroque", label: "Baroque Works (Crocodile)", check: (c) => {
    const cl = c.crew.toLowerCase();
    return cl.includes("baroque") || (c.description && c.description.toLowerCase().includes("baroque works"));
  }},
  crew_cross_guild: { id: "crew_cross_guild", label: "Membre de la Cross Guild", check: (c) => {
    const cl = c.crew.toLowerCase();
    return cl.includes("cross guild") || (c.description && c.description.toLowerCase().includes("cross guild"));
  }},
  crew_heart_kid: { id: "crew_heart_kid", label: "Équip. de Kid ou Law", check: (c) => {
    const cl = c.crew.toLowerCase();
    return cl.includes("heart") || cl.includes("kid pirates") || cl.includes("on air") || cl.includes("bonney") || cl.includes("fire tank");
  }},

  race_mink: { id: "race_mink", label: "Tribu Mink (Zou)", check: (c) => c.race === "Mink" || (c.race && c.race.toLowerCase().includes("mink")) || false },
  race_fishman: { id: "race_fishman", label: "Homme-Poisson / Sirène", check: (c) => c.race === "Fish-man" || c.race === "Merfolk" || (c.race && (c.race.toLowerCase().includes("fish-man") || c.race.toLowerCase().includes("merfolk"))) || false },
  race_giant: { id: "race_giant", label: "Guerrier Géant", check: (c) => c.race === "Giant" || (c.race && c.race.toLowerCase().includes("giant")) || false },
  race_cyborg: { id: "race_cyborg", label: "Cyborg ou Humain Modifié", check: (c) => c.race === "Robot" || (c.description && c.description.toLowerCase().includes("cyborg")) || (c.name && c.name.toLowerCase().includes("cyborg")) || (c.race && c.race.toLowerCase().includes("cyborg")) || false },

  bounty_1b: { id: "bounty_1b", label: "Prime > 1 Milliard ฿", check: (c) => c.bounty > 1000000000 },
  bounty_100m: { id: "bounty_100m", label: "Prime 100M - 1B ฿", check: (c) => c.bounty >= 100000000 && c.bounty <= 1000000000 },
  bounty_under_100m: { id: "bounty_under_100m", label: "Prime < 100M ฿ (Bounty > 0)", check: (c) => c.bounty > 0 && c.bounty < 100000000 },
  bounty_zero: { id: "bounty_zero", label: "Pas de prime (0 ฿)", check: (c) => c.bounty === 0 },

  tall: { id: "tall", label: "Taille > 220 cm", check: (c) => {
    const h = typeof c.height === "number" ? c.height : parseInt(String(c.height || ""), 10);
    return !isNaN(h) && h > 220;
  } },
  short: { id: "short", label: "Taille ≤ 180 cm", check: (c) => {
    const h = typeof c.height === "number" ? c.height : parseInt(String(c.height || ""), 10);
    return !isNaN(h) && h <= 180;
  } },

  young: { id: "young", label: "Âge ≤ 25 ans", check: (c) => {
    const a = typeof c.age === "number" ? c.age : parseInt(String(c.age || ""), 10);
    return !isNaN(a) && a <= 25;
  } },
  old: { id: "old", label: "Âge ≥ 40 ans", check: (c) => {
    const a = typeof c.age === "number" ? c.age : parseInt(String(c.age || ""), 10);
    return !isNaN(a) && a >= 40;
  } },

  arc_east_blue: { id: "arc_east_blue", label: "Apparu à East Blue", check: (c) => c.originArc === "East Blue" },
  arc_alabasta: { id: "arc_alabasta", label: "Apparu à Alabasta", check: (c) => c.originArc === "Alabasta" },
  arc_marineford: { id: "arc_marineford", label: "Apparu à Marineford / ID", check: (c) => c.originArc === "Marineford" || c.originArc === "Impel Down" },
  arc_new_world: { id: "arc_new_world", label: "Apparu Nouveau Monde", check: (c) => ["Wano", "Whole Cake Island", "Egghead", "Dressrosa", "Zou", "Punk Hazard"].includes(c.originArc) },
};

const GRID_PRESETS = [
  { rows: ["strawhat", "pirate", "marine"], columns: ["busoshoku", "old", "homme"] },
  { rows: ["pirate", "marine", "fruit"], columns: ["kenbunshoku", "zoan", "tall"] },
  { rows: ["strawhat", "pirate", "vivant"], columns: ["haoshoku", "paramecia", "short"] },
  { rows: ["whitebeard", "bigmom", "donquixote"], columns: ["haoshoku", "fruit", "vivant"] },
  { rows: ["pirate", "marine", "revolutionary"], columns: ["bounty_1b", "no_fruit", "old"] },
  { rows: ["strawhat", "red_hair", "whitebeard"], columns: ["haoshoku", "busoshoku", "homme"] },
  { rows: ["pirate", "government", "marine"], columns: ["arc_east_blue", "no_fruit", "vivant"] },
  { rows: ["strawhat", "pirate", "decede"], columns: ["arc_marineford", "fruit", "homme"] },
  
  // Nouveaux presets riches et possibles
  { rows: ["race_fishman", "pirate", "fruit"], columns: ["busoshoku", "vivant", "homme"] },
  { rows: ["strawhat", "red_hair", "roger"], columns: ["haoshoku", "busoshoku", "homme"] },
  { rows: ["crew_baroque", "donquixote", "government"], columns: ["fruit", "vivant", "homme"] },
  { rows: ["race_cyborg", "race_giant", "pirate"], columns: ["tall", "no_fruit", "busoshoku"] },
  { rows: ["crew_cross_guild", "crew_heart_kid", "pirate"], columns: ["bounty_1b", "fruit", "homme"] },
  { rows: ["race_mink", "pirate", "femme"], columns: ["arc_new_world", "no_fruit", "vivant"] },
  { rows: ["blackbeard", "government", "marine"], columns: ["fruit", "old", "homme"] }
];

interface BotProfile {
  name: string;
  title: string;
  bounty: number;
}

const BOT_POOL: BotProfile[] = [
  { name: "Eustass_Kidd_67", title: "Supernova Fougeuse", bounty: 470000000 },
  { name: "Marine_Captain_Smoker", title: "Garde du G-5", bounty: 230000000 },
  { name: "NamiBellyLover", title: "Voleur de Coffres", bounty: 85000000 },
  { name: "YonkoShanksFan", title: "Flotte du Nouveau Monde", bounty: 1850000000 },
  { name: "AkainuJustice99", title: "Inquisiteur Suprême", bounty: 1200000000 },
  { name: "TonyChopperProtector", title: "Médecin Novice", bounty: 500000 }
];

export default function GrandLineGrid({ 
  characters, 
  globalBounty, 
  playerUsername, 
  playerAvatar, 
  onUpdateBounty 
}: GrandLineGridProps) {
  
  // États de navigation
  const [activeTab, setActiveTab] = useState<"practice" | "multiplayer">("multiplayer");
  const [gameState, setGameState] = useState<"lobby" | "searching" | "playing" | "ended">("lobby");
  const [gameMode, setGameMode] = useState<"local" | "online">("local");
  
  // États du joueur connecté
  const [myEmail, setMyEmail] = useState<string | null>(() => localStorage.getItem("firebaseUserEmail"));
  
  // Synchroniser l'e-mail si l'utilisateur se connecte/déconnecte d'un moment à l'autre
  useEffect(() => {
    const handleStorageChange = () => {
      setMyEmail(localStorage.getItem("firebaseUserEmail"));
    };
    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(handleStorageChange, 1000); // Check local storage change reliably
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Mode de jeu standard ou amis
  const [onlineOpponent, setOnlineOpponent] = useState<any | null>(null);
  const [activeOnlineGameId, setActiveOnlineGameId] = useState<string | null>(null);
  const [myRole, setMyRole] = useState<1 | 2>(1); // 1 = Créateur de salon, 2 = Joueur qui a rejoint
  const bountyUpdated = useRef<boolean>(false);
  
  // Offline Bot States
  const [botOpponent, setBotOpponent] = useState<BotProfile | null>(null);
  const [botDifficulty, setBotDifficulty] = useState<"normal" | "hard">("normal");
  const [isBotThinking, setIsBotThinking] = useState(false);

  // Matchmaking / Rounds States
  const [targetWinsSelection, setTargetWinsSelection] = useState<3 | 5>(3);
  const [targetWins, setTargetWins] = useState<number>(3);
  const [player1Wins, setPlayer1Wins] = useState<number>(0);
  const [player2Wins, setPlayer2Wins] = useState<number>(0);
  const [roundCount, setRoundCount] = useState<number>(1);
  const [drawProposedBy, setDrawProposedBy] = useState<number | null>(null);

  // Steal / Vol States
  const [myStealsLeft, setMyStealsLeft] = useState<number>(2);
  const [botStealsLeft, setBotStealsLeft] = useState<number>(2);
  const [player1Steals, setPlayer1Steals] = useState<number>(2);
  const [player2Steals, setPlayer2Steals] = useState<number>(2);

  // Forfait and confirmation States
  const [showForfeitConfirm, setShowForfeitConfirm] = useState(false);

  // Matchmaking Spinner Text
  const [searchTimer, setSearchTimer] = useState(3);
  const [searchTextAmis, setSearchTextAmis] = useState("");

  // Turn Timer for Online Mode - 30s per move
  const [turnTimeLeft, setTurnTimeLeft] = useState<number>(30);

  // Grille active
  const [columnKeys, setColumnKeys] = useState<string[]>([]);
  const [rowKeys, setRowKeys] = useState<string[]>([]);
  
  // Plateau (9 cases)
  const [board, setBoard] = useState<{ owner: 1 | 2 | null; character: Character | null }[]>(
    Array(9).fill(null).map(() => ({ owner: null, character: null }))
  );
  
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1); 
  const [usedCharacterIds, setUsedCharacterIds] = useState<Set<string>>(new Set());
  
  // Modals & inputs
  const [selectedCellIndex, setSelectedCellIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Character[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ isError: boolean; message: string } | null>(null);
  const [winner, setWinner] = useState<1 | 2 | "tie" | null>(null);

  // Amis & Salons par code
  const [friendsList, setFriendsList] = useState<string[]>([]);
  const [friendProfiles, setFriendProfiles] = useState<any[]>([]);
  const [searchFriendEmail, setSearchFriendEmail] = useState("");
  const [friendSearchError, setFriendSearchError] = useState<string | null>(null);
  const [friendSearchSuccess, setFriendSearchSuccess] = useState<string | null>(null);
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [privateRoomCode, setPrivateRoomCode] = useState<string | null>(null);
  const [isPrivateSearching, setIsPrivateSearching] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);

  // Réinitialiser la recherche privée quand on quitte l'état searching
  useEffect(() => {
    if (gameState !== "searching") {
      setIsPrivateSearching(false);
    }
  }, [gameState]);
  const [errorMsgAmis, setErrorMsgAmis] = useState<string | null>(null);

  // Système de notifications / toasts (remplace les alert(...) bloquants du navigateur)
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "info" | "success" | "warning" | "error" }[]>([]);

  const addToast = (message: string, type: "info" | "success" | "warning" | "error" = "info") => {
    const id = Math.random().toString(36).substring(2, 11);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  // Notification d'invitation reçue en direct
  const [incomingChallenge, setIncomingChallenge] = useState<any | null>(null);

  // Charger les amis au démarrage
  useEffect(() => {
    if (myEmail) {
      loadFriendsInfo();
    }
  }, [myEmail]);

  const loadFriendsInfo = async () => {
    if (!myEmail) return;
    try {
      const uDoc = await getDoc(doc(db, "users", myEmail));
      if (uDoc.exists()) {
        const uData = uDoc.data();
        const fList = uData.friends || [];
        setFriendsList(fList);
        fetchFriendDetails(fList);
      }
    } catch (e) {
      console.error("Erreur de chargement des amis:", e);
    }
  };

  const fetchFriendDetails = async (emails: string[]) => {
    if (!emails || emails.length === 0) {
      setFriendProfiles([]);
      return;
    }
    const list: any[] = [];
    for (const em of emails) {
      try {
        const snap = await getDoc(doc(db, "users", em));
        if (snap.exists()) {
          list.push(snap.data());
        }
      } catch (err) {
        console.error(err);
      }
    }
    setFriendProfiles(list);
  };

  // Écouté des invitations reçues en temps réel
  useEffect(() => {
    if (!myEmail) return;

    const q = query(
      collection(db, "gridGames"),
      where("invitedEmail", "==", myEmail),
      where("status", "==", "waiting"),
      where("type", "==", "private"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const docData = snapshot.docs[0].data();
        const gameId = snapshot.docs[0].id;
        setIncomingChallenge({
          id: gameId,
          hostEmail: docData.player1.email,
          hostName: docData.player1.name,
          hostAvatar: docData.player1.avatar,
          hostBounty: docData.player1.bounty,
          gameData: docData
        });
      } else {
        setIncomingChallenge(null);
      }
    }, (error) => {
      console.error("Erreur du listener de duels reçus:", error);
    });

    return () => unsubscribe();
  }, [myEmail]);

  // Turn Timer for Online Mode - 30 seconds per move
  const handleTurnTimeout = async () => {
    if (!activeOnlineGameId || !myEmail) return;
    setFeedback({
      isError: true,
      message: "⏰ Temps écoulé (30s) ! Votre tour passe !"
    });

    try {
      const oppEmail = onlineOpponent?.email || "";
      await updateDoc(doc(db, "gridGames", activeOnlineGameId), {
        currentPlayer: myRole === 1 ? 2 : 1,
        turnEmail: oppEmail,
        drawProposedBy: null,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Erreur de passement de tour par timeout:", e);
    }
  };

  useEffect(() => {
    if (gameState !== "playing" || gameMode !== "online" || !activeOnlineGameId || winner) {
      return;
    }

    setTurnTimeLeft(30);

    const timer = setInterval(() => {
      setTurnTimeLeft((prev) => {
        if (prev <= 1) {
          if (currentPlayer === myRole) {
            handleTurnTimeout();
          }
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, gameMode, activeOnlineGameId, currentPlayer, board, winner]);

  // Écouteur de l'état de la partie en ligne active
  useEffect(() => {
    if (!activeOnlineGameId) return;

    const gameDocRef = doc(db, "gridGames", activeOnlineGameId);
    const unsubscribe = onSnapshot(gameDocRef, (snapshot) => {
      if (!snapshot.exists()) {
        // Le salon a été fermé ou supprimé
        setGameState("lobby");
        setActiveOnlineGameId(null);
        return;
      }

      const data = snapshot.data();
      
      // Affecter la grille
      if (data.columns) setColumnKeys(data.columns);
      if (data.rows) setRowKeys(data.rows);

      // Affecter le plateau
      if (data.board) setBoard(data.board);

      // Personnages déjà joués
      if (data.usedCharacterIds) {
        setUsedCharacterIds(new Set(data.usedCharacterIds));
      }

      // Tour du joueur
      if (data.currentPlayer) {
        setCurrentPlayer(data.currentPlayer as 1 | 2);
      }

      // Sync attributes of Best-of rounds / Steals / Draw proposal
      if (data.targetWins !== undefined) setTargetWins(data.targetWins);
      if (data.player1Wins !== undefined) setPlayer1Wins(data.player1Wins);
      if (data.player2Wins !== undefined) setPlayer2Wins(data.player2Wins);
      if (data.roundCount !== undefined) setRoundCount(data.roundCount);
      
      if (data.player1Steals !== undefined) setPlayer1Steals(data.player1Steals);
      if (data.player2Steals !== undefined) setPlayer2Steals(data.player2Steals);
      
      if (data.drawProposedBy !== undefined) {
        setDrawProposedBy(data.drawProposedBy);
      } else {
        setDrawProposedBy(null);
      }

      // Statut de la partie
      if (data.status) {
        if (data.status === "playing") {
          setGameState("playing");
          
          // Identifier l'adversaire
          if (myRole === 1 && data.player2) {
            setOnlineOpponent(data.player2);
          } else if (myRole === 2 && data.player1) {
            setOnlineOpponent(data.player1);
          }
        } else if (data.status === "declined") {
          setGameState("lobby");
          setActiveOnlineGameId(null);
          addToast("L'invitation a été déclinée par votre ami(e).", "warning");
        } else if (data.status === "ended") {
          setGameState("ended");
          if (data.winner === "tie") {
            setWinner("tie");
          } else {
            const mappedWinnerNum = data.winner === data.player1.email ? 1 : 2;
            setWinner(mappedWinnerNum);

            // Mise à jour de la prime une seule fois
            if (!bountyUpdated.current) {
              bountyUpdated.current = true;
              const isWinner = data.winner === myEmail;
              if (isWinner) {
                onUpdateBounty(10000); // +10k pour la victoire
              } else {
                onUpdateBounty(-5000); // -5k pour la défaite
              }
            }
          }
        }
      }
    }, (error) => {
      console.error("Erreur de synchronisation du combat en ligne:", error);
    });

    return () => unsubscribe();
  }, [activeOnlineGameId, myRole, myEmail]);

  // Timer de recherche d'adversaire en matchmaking public sans Bot
  useEffect(() => {
    let interval: any;
    if (gameState === "searching" && gameMode === "online" && !isPrivateSearching) {
      setSearchTimer(3);
      // Nous allons réaliser un matchmaking Firestore
      const doMatchmaking = async () => {
        if (!myEmail) return;
        try {
          const q = query(
            collection(db, "gridGames"),
            where("status", "==", "waiting"),
            where("type", "==", "matchmaking"),
            limit(1)
          );
          const qs = await getDocs(q);

          if (!qs.empty) {
            // Un joueur attend ! Connexion en tant que Player 2
            const hostDoc = qs.docs[0];
            const hostData = hostDoc.data();

            if (hostData.player1.email === myEmail) {
              // Éviter de s'affronter soi-même en rechargeant
              return;
            }

            await updateDoc(doc(db, "gridGames", hostDoc.id), {
              player2: {
                email: myEmail,
                name: playerUsername,
                avatar: playerAvatar || "",
                bounty: Number(globalBounty)
              },
              status: "playing",
              currentPlayer: 1, // Le joueur 1 commence
              turnEmail: hostData.player1.email,
              updatedAt: serverTimestamp()
            });

            setMyRole(2);
            setOnlineOpponent(hostData.player1);
            setGameMode("online");
            setActiveOnlineGameId(hostDoc.id);
            bountyUpdated.current = false;
            setGameState("playing");
          } else {
            // Aucun salon : Créer un salon d'attente
            const preset = GRID_PRESETS[Math.floor(Math.random() * GRID_PRESETS.length)];
            const newGameRef = doc(collection(db, "gridGames"));
            
            await setDoc(newGameRef, {
              id: newGameRef.id,
              player1: {
                email: myEmail,
                name: playerUsername,
                avatar: playerAvatar || "",
                bounty: Number(globalBounty)
              },
              player2: null,
              columns: preset.columns,
              rows: preset.rows,
              board: Array(9).fill(null).map(() => ({ owner: null, character: null })),
              usedCharacterIds: [],
              currentPlayer: 1,
              turnEmail: myEmail,
              status: "waiting",
              type: "matchmaking",
              targetWins: targetWinsSelection,
              player1Wins: 0,
              player2Wins: 0,
              player1Steals: 2,
              player2Steals: 2,
              roundCount: 1,
              drawProposedBy: null,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });

            setMyRole(1);
            setGameMode("online");
            setActiveOnlineGameId(newGameRef.id);
            bountyUpdated.current = false;
          }
        } catch (e) {
          console.error("Matchmaking error:", e);
          setGameState("lobby");
        }
      };

      doMatchmaking();

      interval = setInterval(() => {
        setSearchTimer((prev) => (prev > 1 ? prev - 1 : 3));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, gameMode, isPrivateSearching]);

  // --- BOT ONLINE MATCHMAKING INTEGRATION ---
  // Liste de pseudos réalistes One Piece + prénoms avec nombres
  const BOT_NAMES = [
    "Luffy_556", "Zoro_99", "Nami_3", "AceFlame_777", "Sogeking_12", 
    "Shanks_4", "Nico_789", "Koby_102", "Mihawk_007", "Law_Room", 
    "Chopper_Doctor", "SanjiRage", "Bepo_Mink_8", "Arlong_Shark", "Croco_999", 
    "Franky_Super", "Brook_Soul_45", "Kid_Punk_0", "BonClay_Mr2", "Sabo_Rev", 
    "Reiju_6", "Katakuri_Mochi", "Yamato_Oni", "Jinbe_Sea_123", "Marco_Phoenix", 
    "Carrot_Mink", "Enel_God", "Rayleigh_Sil", "Vivi_Alabasta", "Lucas_412", 
    "Alex_998", "Max_304", "Mathieu_777", "Thomas_502", "Nicolas_124", "Sofiane_331",
    "Garp_Marine", "Smoker_Wild_38", "Uta_Diva_9", "Kalgara_Shandora", "Law_Corazon_13",
    "Perona_Horo_2", "Rebecca_Gladius", "Bartolomeo_Fan", "Cavendish_Hakuba",
    "Shirahoshi_Princess", "Drake_X_10", "Apu_Music_88", "Capone_Bege_44", "Kid_Magnet"
  ];

  interface OnlineBotUser {
    email: string;
    name: string;
    avatar: string;
    bounty: number;
    isBot: boolean;
    strategy: "hard-blocking" | "hard-nonblocking" | "medium-blocking";
  }

  const generateBotUser = (): OnlineBotUser => {
    const name = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
    const email = `bot_${name.toLowerCase().replace(/[^a-z0-9_]/g, "")}_${Math.floor(Math.random() * 900 + 100)}@grandline.bot`;
    const avatar = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${name}`;
    const bounty = Math.floor(Math.random() * 1400000000) + 100000000; // 100M à 1.5B Berrys
    
    const strategies: ("hard-blocking" | "hard-nonblocking" | "medium-blocking")[] = [
      "hard-blocking",
      "hard-nonblocking",
      "medium-blocking"
    ];
    const strategy = strategies[Math.floor(Math.random() * strategies.length)];
    
    return {
      email,
      name,
      avatar,
      bounty,
      isBot: true,
      strategy
    };
  };

  const spawnOnlineMatchmakingBot = async () => {
    if (!activeOnlineGameId || myRole !== 1 || privateRoomCode !== null) return;
    try {
      const gameRef = doc(db, "gridGames", activeOnlineGameId);
      const snap = await getDoc(gameRef);
      if (snap.exists()) {
        const data = snap.data();
        // Surtout pas de bot si le salon a un code de salon (roomCode) ou n'est pas public
        if (data.status === "waiting" && !data.player2 && !data.roomCode && data.type !== "private") {
          const bot = generateBotUser();
          console.log("Spawning matchmaking bot in online mode:", bot);
          
          await updateDoc(gameRef, {
            player2: {
              email: bot.email,
              name: bot.name,
              avatar: bot.avatar,
              bounty: bot.bounty,
              isBot: true,
              strategy: bot.strategy
            },
            status: "playing",
            currentPlayer: 1,
            turnEmail: myEmail,
            updatedAt: serverTimestamp()
          });
          
          setOnlineOpponent({
            email: bot.email,
            name: bot.name,
            avatar: bot.avatar,
            bounty: bot.bounty,
            isBot: true,
            strategy: bot.strategy
          } as any);
          setGameState("playing");
        }
      }
    } catch (e) {
      console.error("Matchmaking Bot join error:", e);
    }
  };

  // Déclencher le bot si personne n'est trouvé après 15 secondes (uniquement en matchmaking public sans code)
  useEffect(() => {
    let botTimeout: any;
    if (gameState === "searching" && gameMode === "online" && myRole === 1 && activeOnlineGameId && privateRoomCode === null) {
      botTimeout = setTimeout(() => {
        spawnOnlineMatchmakingBot();
      }, 15000);
    }
    return () => {
      if (botTimeout) clearTimeout(botTimeout);
    };
  }, [gameState, gameMode, myRole, activeOnlineGameId, privateRoomCode]);

  const handleOnlineBotTurn = async () => {
    if (!activeOnlineGameId || !onlineOpponent) return;

    const botObj = onlineOpponent as any;
    const botStrategy = botObj.strategy || "hard-blocking";
    const isHard = botStrategy === "hard-blocking" || botStrategy === "medium-blocking";
    const successRate = botStrategy === "medium-blocking" ? 0.90 : 1.0;
    
    const emptyIndices: number[] = [];
    board.forEach((cell, idx) => {
      if (cell.owner === null) emptyIndices.push(idx);
    });

    if (emptyIndices.length === 0) {
      setIsBotThinking(false);
      return;
    }

    const isSuccessful = Math.random() < successRate;
    setIsBotThinking(false);

    if (isSuccessful) {
      const winLines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], 
        [0, 3, 6], [1, 4, 7], [2, 5, 8], 
        [0, 4, 8], [2, 4, 6]             
      ];

      const getCellScore = (idx: number) => {
        let score = 0;
        winLines.forEach(line => {
          if (line.includes(idx)) {
            let countBot = 0;
            let countUser = 0;
            line.forEach(cellIdx => {
              if (board[cellIdx].owner === 2) countBot++;
              else if (board[cellIdx].owner === 1) countUser++;
            });

            if (isHard) {
              if (countBot === 2 && countUser === 0) {
                score += 10000;
              } else if (countUser === 2 && countBot === 0) {
                score += 5000;
              } else if (countBot === 1 && countUser === 0) {
                score += 100;
              } else if (countUser === 1 && countBot === 0) {
                score += 40;
              } else {
                score += 5;
              }
            } else {
              if (countBot === 2 && countUser === 0) {
                score += 1000;
              } else if (countBot === 1 && countUser === 0) {
                score += 100;
              } else if (countBot === 0 && countUser === 0) {
                score += 10;
              } else {
                score += 2;
              }
            }
          }
        });
        return score;
      };

      const scoredIndices = emptyIndices.map(idx => ({
        idx,
        score: getCellScore(idx) + Math.random() * 2
      })).sort((a, b) => b.score - a.score);

      const targetIndices = scoredIndices.map(item => item.idx);
      
      let chosenIndex = -1;
      let matchingChar: Character | null = null;

      for (const idx of targetIndices) {
        const { colIndex, rowIndex } = getCellCoords(idx);
        const colCategory = CATEGORIES[columnKeys[colIndex]];
        const rowCategory = CATEGORIES[rowKeys[rowIndex]];

        const possibleChar = characters.find(
          c => !usedCharacterIds.has(c.id) &&
               colCategory.check(c) &&
               rowCategory.check(c)
        );

        if (possibleChar) {
          chosenIndex = idx;
          matchingChar = possibleChar;
          break;
        }
      }

      if (chosenIndex !== -1 && matchingChar) {
        const updatedBoard = [...board];
        updatedBoard[chosenIndex] = {
          owner: 2,
          character: matchingChar
        };

        const updatedUsedList = Array.from(usedCharacterIds);
        updatedUsedList.push(matchingChar.id);

        setFeedback({
          isError: false,
          message: `🤖 ${onlineOpponent.name} a joué ${matchingChar.name} sur [${CATEGORIES[columnKeys[getCellCoords(chosenIndex).colIndex]].label} & ${CATEGORIES[rowKeys[getCellCoords(chosenIndex).rowIndex]].label}] !`
        });

        try {
          const gameDocRef = doc(db, "gridGames", activeOnlineGameId);
          const snap = await getDoc(gameDocRef);
          if (snap.exists()) {
            const data = snap.data();
            
            let p1Steals = data.player1Steals ?? 2;
            let p2Steals = data.player2Steals ?? 2;

            const isRoundWinner = checkWinCondition(updatedBoard, 2);
            const isFull = isBoardFull(updatedBoard);

            let nextStatus = "playing";
            let finalWinner = null;
            let p1Wins = data.player1Wins ?? 0;
            let p2Wins = data.player2Wins ?? 0;
            let nextBoard = updatedBoard;
            let nextUsedCharacters = updatedUsedList;
            let nextRoundCount = data.roundCount ?? 1;
            let nextColumns = null;
            let nextRows = null;

            if (isRoundWinner || isFull) {
              if (isRoundWinner) {
                p2Wins++;
              }

              const tWins = data.targetWins ?? 3;
              const reachedTarget = p1Wins >= tWins || p2Wins >= tWins;

              if (reachedTarget) {
                nextStatus = "ended";
                finalWinner = p1Wins >= tWins ? data.player1.email : data.player2.email;
              } else {
                nextRoundCount += 1;
                nextBoard = Array(9).fill(null).map(() => ({ owner: null, character: null }));
                nextUsedCharacters = [];
                p1Steals = 2;
                p2Steals = 2;
                
                // Sélectionner une nouvelle grille pour la manche suivante
                const nextPreset = GRID_PRESETS[Math.floor(Math.random() * GRID_PRESETS.length)];
                nextColumns = nextPreset.columns;
                nextRows = nextPreset.rows;
              }
            }

            const updatePayload: any = {
              board: nextBoard,
              usedCharacterIds: nextUsedCharacters,
              currentPlayer: 1,
              turnEmail: myEmail,
              player1Wins: p1Wins,
              player2Wins: p2Wins,
              player1Steals: p1Steals,
              player2Steals: p2Steals,
              roundCount: nextRoundCount,
              status: nextStatus,
              winner: finalWinner,
              drawProposedBy: null,
              updatedAt: serverTimestamp()
            };

            if (nextColumns && nextRows) {
              updatePayload.columns = nextColumns;
              updatePayload.rows = nextRows;
            }

            await updateDoc(gameDocRef, updatePayload);
          }
        } catch (e) {
          console.error("Erreur de transmission du coup de l'IA:", e);
        }
      } else {
        await simulateOnlineBotFailure(emptyIndices);
      }
    } else {
      await simulateOnlineBotFailure(emptyIndices);
    }
  };

  const simulateOnlineBotFailure = async (emptyIndices: number[]) => {
    if (!activeOnlineGameId || !onlineOpponent) return;
    const wrongChar = characters[Math.floor(Math.random() * characters.length)];

    setFeedback({
      isError: true,
      message: `❌ ${onlineOpponent.name} a tenté ${wrongChar.name} mais c'est faux ! C'est à vous !`
    });

    try {
      const gameDocRef = doc(db, "gridGames", activeOnlineGameId);
      await updateDoc(gameDocRef, {
        currentPlayer: 1,
        turnEmail: myEmail,
        drawProposedBy: null,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Erreur de transmission de l'échec de l'IA:", e);
    }
  };

  // Synchronisation du tour du bot en ligne
  useEffect(() => {
    let botTurnTimeout: any;
    
    const isBotTurn = 
      gameState === "playing" &&
      gameMode === "online" &&
      myRole === 1 &&
      activeOnlineGameId &&
      onlineOpponent &&
      ((onlineOpponent as any).isBot || onlineOpponent.email?.startsWith("bot_")) &&
      currentPlayer === 2 &&
      !winner;

    if (isBotTurn) {
      setIsBotThinking(true);
      setFeedback(null);
      
      botTurnTimeout = setTimeout(() => {
        handleOnlineBotTurn();
      }, 2500);
    } else {
      setIsBotThinking(false);
    }

    return () => {
      if (botTurnTimeout) clearTimeout(botTurnTimeout);
    };
  }, [gameState, gameMode, myRole, activeOnlineGameId, onlineOpponent, currentPlayer, winner, board, usedCharacterIds]);

  // Bot offline behavior (entraînement local)
  useEffect(() => {
    if (gameState === "playing" && gameMode === "local" && currentPlayer === 2 && !winner) {
      setIsBotThinking(true);
      setFeedback(null);
      
      const botTimeout = setTimeout(() => {
        handleBotTurnOffline();
      }, 2000); 

      return () => clearTimeout(botTimeout);
    }
  }, [gameState, currentPlayer, gameMode]);

  // Ajouter un pirate comme ami
  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    setFriendSearchError(null);
    setFriendSearchSuccess(null);

    const fEmail = searchFriendEmail.trim().toLowerCase();
    if (!fEmail || fEmail === myEmail) {
      setFriendSearchError("Adresse e-mail invalide ou identique à la vôtre.");
      return;
    }

    try {
      const friendDoc = await getDoc(doc(db, "users", fEmail));
      if (!friendDoc.exists()) {
        setFriendSearchError("Aucun pirate enregistré avec cet e-mail dans Loguetown.");
        return;
      }

      const friendData = friendDoc.data();
      // Ajouter ami dans notre Firestore document
      if (myEmail) {
        await updateDoc(doc(db, "users", myEmail), {
          friends: arrayUnion(fEmail)
        });
        setFriendSearchSuccess(`Ami ajouté avec succès : ${friendData.username} !`);
        setSearchFriendEmail("");
        // Recharger la liste d'amis
        loadFriendsInfo();
      }
    } catch (e) {
      setFriendSearchError("Une erreur est survenue lors de l'ajout.");
    }
  };

  // Relever le défi d'un ami (accepter)
  const handleAcceptChallenge = async () => {
    if (!incomingChallenge || !myEmail) return;
    try {
      const gameId = incomingChallenge.id;
      const hostEmail = incomingChallenge.hostEmail;

      await updateDoc(doc(db, "gridGames", gameId), {
        player2: {
          email: myEmail,
          name: playerUsername,
          avatar: playerAvatar || "",
          bounty: Number(globalBounty)
        },
        status: "playing",
        currentPlayer: 1,
        turnEmail: hostEmail,
        updatedAt: serverTimestamp()
      });

      setMyRole(2);
      setOnlineOpponent({
        email: hostEmail,
        name: incomingChallenge.hostName,
        avatar: incomingChallenge.hostAvatar,
        bounty: incomingChallenge.hostBounty
      });
      setGameMode("online");
      setActiveOnlineGameId(gameId);
      bountyUpdated.current = false;
      setGameState("playing");
      setIncomingChallenge(null);
    } catch (e) {
      console.error(e);
    }
  };

  // Refuser le défi d'un ami
  const handleDeclineChallenge = async () => {
    if (!incomingChallenge) return;
    try {
      await updateDoc(doc(db, "gridGames", incomingChallenge.id), {
        status: "declined",
        updatedAt: serverTimestamp()
      });
      setIncomingChallenge(null);
    } catch (e) {
      console.error(e);
    }
  };

  // Défier directement un ami
  const handleChallengeFriend = async (friend: any) => {
    if (!myEmail) return;
    setIsPrivateSearching(true);
    setGameState("searching");
    setGameMode("online");
    setSearchTextAmis(`Lancement du duel contre ${friend.username}...`);
    bountyUpdated.current = false;

    const preset = GRID_PRESETS[Math.floor(Math.random() * GRID_PRESETS.length)];
    const newRoomRef = doc(collection(db, "gridGames"));
    
    try {
      await setDoc(newRoomRef, {
        id: newRoomRef.id,
        player1: {
          email: myEmail,
          name: playerUsername,
          avatar: playerAvatar || "",
          bounty: Number(globalBounty)
        },
        player2: null,
        columns: preset.columns,
        rows: preset.rows,
        board: Array(9).fill(null).map(() => ({ owner: null, character: null })),
        usedCharacterIds: [],
        currentPlayer: 1,
        turnEmail: myEmail,
        status: "waiting",
        type: "private",
        invitedEmail: friend.email,
        targetWins: targetWinsSelection,
        player1Wins: 0,
        player2Wins: 0,
        player1Steals: 2,
        player2Steals: 2,
        roundCount: 1,
        drawProposedBy: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setMyRole(1);
      setOnlineOpponent(friend);
      setActiveOnlineGameId(newRoomRef.id);
    } catch (e) {
      console.error(e);
      setGameState("lobby");
    }
  };

  // Création d'un salon par code
  const handleCreateRoomWithCode = async () => {
    if (!myEmail) return;
    setIsPrivateSearching(true);
    setGameState("searching");
    setGameMode("online");
    setSearchTextAmis("Création d'un navire amical...");
    bountyUpdated.current = false;

    // Code de salon aléatoire à 5 lettres
    const alphabet = "ABCDEFGHJKLMNOPQRSTUVWXYZ23456789"; 
    let code = "";
    for (let i = 0; i < 5; i++) {
      code += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }

    const preset = GRID_PRESETS[Math.floor(Math.random() * GRID_PRESETS.length)];
    const newRoomRef = doc(collection(db, "gridGames"));

    try {
      await setDoc(newRoomRef, {
        id: newRoomRef.id,
        player1: {
          email: myEmail,
          name: playerUsername,
          avatar: playerAvatar || "",
          bounty: Number(globalBounty)
        },
        player2: null,
        columns: preset.columns,
        rows: preset.rows,
        board: Array(9).fill(null).map(() => ({ owner: null, character: null })),
        usedCharacterIds: [],
        currentPlayer: 1,
        turnEmail: myEmail,
        status: "waiting",
        type: "private",
        roomCode: code,
        targetWins: targetWinsSelection,
        player1Wins: 0,
        player2Wins: 0,
        player1Steals: 2,
        player2Steals: 2,
        roundCount: 1,
        drawProposedBy: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setMyRole(1);
      setPrivateRoomCode(code);
      setActiveOnlineGameId(newRoomRef.id);
    } catch (e) {
      console.error(e);
      setGameState("lobby");
    }
  };

  // Rejoindre un salon via code
  const handleJoinWithCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = roomCodeInput.trim().toUpperCase();
    if (!cleanCode || !myEmail) return;

    setJoinLoading(true);
    setErrorMsgAmis(null);

    try {
      const q = query(
        collection(db, "gridGames"),
        where("roomCode", "==", cleanCode),
        where("status", "==", "waiting"),
        limit(1)
      );
      const qs = await getDocs(q);

      if (qs.empty) {
        setErrorMsgAmis("Code invalide, salon inexistant ou bataille commencée.");
        setJoinLoading(false);
        return;
      }

      const matchDoc = qs.docs[0];
      const matchData = matchDoc.data();

      if (matchData.player1.email === myEmail) {
        setErrorMsgAmis("Vous ne pouvez pas embarquer sur votre propre navire !");
        setJoinLoading(false);
        return;
      }

      await updateDoc(doc(db, "gridGames", matchDoc.id), {
        player2: {
          email: myEmail,
          name: playerUsername,
          avatar: playerAvatar || "",
          bounty: Number(globalBounty)
        },
        status: "playing",
        currentPlayer: 1,
        turnEmail: matchData.player1.email,
        updatedAt: serverTimestamp()
      });

      setMyRole(2);
      setOnlineOpponent(matchData.player1);
      setGameMode("online");
      setActiveOnlineGameId(matchDoc.id);
      bountyUpdated.current = false;
      setGameState("playing");
    } catch (err) {
      setErrorMsgAmis("Erreur lors de la jonction au salon.");
    } finally {
      setJoinLoading(false);
    }
  };

  // Annuler la recherche / supprimer le salon d'attente
  const handleCancelSearch = async () => {
    if (activeOnlineGameId) {
      try {
        await deleteDoc(doc(db, "gridGames", activeOnlineGameId));
      } catch (e) {
        console.error(e);
      }
    }
    setGameState("lobby");
    setActiveOnlineGameId(null);
    setPrivateRoomCode(null);
    setSearchTextAmis("");
  };

  // Démarrer l'entraînement solo
  const handleStartPracticeGame = () => {
    setGameMode("local");
    const preset = GRID_PRESETS[Math.floor(Math.random() * GRID_PRESETS.length)];
    setColumnKeys(preset.columns);
    setRowKeys(preset.rows);
    setBoard(Array(9).fill(null).map(() => ({ owner: null, character: null })));
    setUsedCharacterIds(new Set());
    setCurrentPlayer(1);
    setBotOpponent(null);
    setMyStealsLeft(2);
    setBotStealsLeft(2);
    setFeedback(null);
    setWinner(null);
    setIsBotThinking(false);
    setGameState("playing");
  };

  // Démarrer l'entraînement contre l'IA Bot offline
  const handleStartBotPracticeGame = (difficulty: "normal" | "hard" = "normal") => {
    setGameMode("local");
    setBotDifficulty(difficulty);
    const preset = GRID_PRESETS[Math.floor(Math.random() * GRID_PRESETS.length)];
    setColumnKeys(preset.columns);
    setRowKeys(preset.rows);
    setBoard(Array(9).fill(null).map(() => ({ owner: null, character: null })));
    setUsedCharacterIds(new Set());
    setCurrentPlayer(1);
    setMyStealsLeft(2);
    setBotStealsLeft(2);
    
    const randomBot = BOT_POOL[Math.floor(Math.random() * BOT_POOL.length)];
    setBotOpponent(randomBot);

    setFeedback(null);
    setWinner(null);
    setIsBotThinking(false);
    setGameState("playing");
  };

  // Autocomplétion
  const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
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
        const isNameOrIdUsed = usedCharacterIds.has(currentSelection.id) || board.some(cell => {
          if (!cell || !cell.character) return false;
          const boardNameNorm = cell.character.name.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
          const selNameNorm = currentSelection.name.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
          return cell.character.id === currentSelection.id || boardNameNorm === selNameNorm;
        });
        if (!isNameOrIdUsed) {
          submitAnswer(currentSelection);
        }
      }
    }
  };

  // Clic sur cellule
  const handleCellClick = (index: number) => {
    if (gameState !== "playing" || isBotThinking) return;
    
    // Si c'est au tour de l'autre joueur en ligne
    if (activeOnlineGameId && currentPlayer !== myRole) return;

    const cell = board[index];
    const isOpponentOwned = cell.owner !== null && cell.owner !== (activeOnlineGameId ? myRole : 1);
    const stealsAvailable = activeOnlineGameId 
      ? (myRole === 1 ? player1Steals : player2Steals) 
      : myStealsLeft;

    // Si la case appartient à l'adversaire mais qu'on a aucun vol de disponible
    if (cell.owner !== null && (!isOpponentOwned || stealsAvailable <= 0)) {
      return;
    }

    setSelectedCellIndex(index);
    setSearchQuery("");
    setSuggestions([]);
    setActiveSuggestionIndex(0);
    setFeedback(null);
  };

  // Soumission de la proposition (Joueur actif)
  const submitAnswer = async (selectedChar: Character) => {
    if (selectedCellIndex === null) return;
    
    const isNameOrIdUsed = usedCharacterIds.has(selectedChar.id) || board.some(cell => {
      if (!cell || !cell.character) return false;
      const boardNameNorm = cell.character.name.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
      const selNameNorm = selectedChar.name.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
      return cell.character.id === selectedChar.id || boardNameNorm === selNameNorm;
    });

    if (isNameOrIdUsed) {
      setFeedback({
        isError: true,
        message: `HÉLAS ! ${selectedChar.name} est déjà sur le plateau ! Trouvez un autre pirate.`
      });
      return;
    }

    const { colIndex, rowIndex } = getCellCoords(selectedCellIndex);
    const colCategory = CATEGORIES[columnKeys[colIndex]];
    const rowCategory = CATEGORIES[rowKeys[rowIndex]];

    const matchesCol = colCategory.check(selectedChar);
    const matchesRow = rowCategory.check(selectedChar);

    const cellBefore = board[selectedCellIndex];
    const isSteal = cellBefore.owner !== null;

    if (matchesCol && matchesRow) {
      // Succès ! Remplir la case
      const updatedBoard = [...board];
      updatedBoard[selectedCellIndex] = {
        owner: activeOnlineGameId ? myRole : 1,
        character: selectedChar
      };

      const updatedUsedList = Array.from(usedCharacterIds);
      updatedUsedList.push(selectedChar.id);

      setSelectedCellIndex(null);
      
      const successMsg = isSteal 
        ? `💥 COMBAT TRIPLÉ ! Vous avez VOLÉ la case avec ${selectedChar.name} !`
        : `MAGNIFIQUE ! ${selectedChar.name} valide l'intersection.`;

      setFeedback({
        isError: false,
        message: successMsg
      });

      if (activeOnlineGameId) {
        // Enregistrer dans Firestore en lisant l'état le plus frais pour les manches
        try {
          const gameDocRef = doc(db, "gridGames", activeOnlineGameId);
          const snap = await getDoc(gameDocRef);
          if (snap.exists()) {
            const data = snap.data();
            
            // Calculer les vols restants
            let p1Steals = data.player1Steals ?? 2;
            let p2Steals = data.player2Steals ?? 2;
            if (isSteal) {
              if (myRole === 1) p1Steals = Math.max(0, p1Steals - 1);
              else p2Steals = Math.max(0, p2Steals - 1);
            }

            const isRoundWinner = checkWinCondition(updatedBoard, myRole);
            const isFull = isBoardFull(updatedBoard);

            let nextStatus = "playing";
            let finalWinner = null;
            let p1Wins = data.player1Wins ?? 0;
            let p2Wins = data.player2Wins ?? 0;
            let nextBoard = updatedBoard;
            let nextUsedCharacters = updatedUsedList;
            let nextRoundCount = data.roundCount ?? 1;
            let nextColumns = null;
            let nextRows = null;

            if (isRoundWinner || isFull) {
              // Fin de la manche active
              if (isRoundWinner) {
                if (myRole === 1) p1Wins++;
                else p2Wins++;
              }

              const tWins = data.targetWins ?? 3;
              const reachedTarget = p1Wins >= tWins || p2Wins >= tWins;

              if (reachedTarget) {
                nextStatus = "ended";
                finalWinner = p1Wins >= tWins ? data.player1.email : data.player2.email;
              } else {
                // Manche suivante !
                nextRoundCount += 1;
                nextBoard = Array(9).fill(null).map(() => ({ owner: null, character: null }));
                nextUsedCharacters = [];
                // On redonne 2 vols pour la nouvelle manche
                p1Steals = 2;
                p2Steals = 2;
                
                // Sélectionner une nouvelle grille pour la manche suivante
                const nextPreset = GRID_PRESETS[Math.floor(Math.random() * GRID_PRESETS.length)];
                nextColumns = nextPreset.columns;
                nextRows = nextPreset.rows;
              }
            }

            const oppEmail = onlineOpponent?.email || "";

            const updatePayload: any = {
              board: nextBoard,
              usedCharacterIds: nextUsedCharacters,
              currentPlayer: myRole === 1 ? 2 : 1,
              turnEmail: oppEmail,
              player1Wins: p1Wins,
              player2Wins: p2Wins,
              player1Steals: p1Steals,
              player2Steals: p2Steals,
              roundCount: nextRoundCount,
              status: nextStatus,
              winner: finalWinner,
              drawProposedBy: null, // Annuler toute proposition de nul en cours à chaque coup
              updatedAt: serverTimestamp()
            };

            if (nextColumns && nextRows) {
              updatePayload.columns = nextColumns;
              updatePayload.rows = nextRows;
            }

            await updateDoc(gameDocRef, updatePayload);
          }
        } catch (e) {
          console.error("Erreur de transmission du coup en ligne:", e);
        }
      } else {
        // Mode local hors-ligne
        setBoard(updatedBoard);
        const nextUsed = new Set(usedCharacterIds);
        nextUsed.add(selectedChar.id);
        setUsedCharacterIds(nextUsed);

        // Décrémenter son vol si local
        if (isSteal) {
          setMyStealsLeft(prev => Math.max(0, prev - 1));
        }

        // Si jeu contre bot local
        if (botOpponent) {
          if (checkWinCondition(updatedBoard, 1)) {
            handleGameEndOffline(1);
          } else if (isBoardFull(updatedBoard)) {
            handleGameEndOffline("tie");
          } else {
            setCurrentPlayer(2); // Passe au bot
          }
        } else {
          // Entraînement solo libre
          if (isBoardFull(updatedBoard)) {
            handleGameEndOffline(1);
          }
        }
      }

    } else {
      // Échec - Mauvais choix
      let explanation = "";
      if (!matchesCol && !matchesRow) {
        explanation = `ne répond ni à "${colCategory.label}" ni à "${rowCategory.label}".`;
      } else if (!matchesCol) {
        explanation = `ne répond pas au critère de colonne "${colCategory.label}".`;
      } else {
        explanation = `ne répond pas au critère de ligne "${rowCategory.label}".`;
      }

      setFeedback({
        isError: true,
        message: `ÉCHEC ! ${selectedChar.name} ${explanation} Votre tour passe !`
      });

      if (activeOnlineGameId) {
        // Permettre un tour instantané pour l'adversaire SANS consommer de vol
        const oppEmail = onlineOpponent?.email || "";
        try {
          await updateDoc(doc(db, "gridGames", activeOnlineGameId), {
            currentPlayer: myRole === 1 ? 2 : 1,
            turnEmail: oppEmail,
            drawProposedBy: null, // Annuler proposition de nul à chaque échec
            updatedAt: serverTimestamp()
          });
        } catch (e) {
          console.error("Passement de tour raté:", e);
        }
      } else {
        // Mode local
        if (botOpponent) {
          setTimeout(() => {
            setSelectedCellIndex(null);
            setFeedback(null);
            setCurrentPlayer(2); // Passe au bot
          }, 2500);
        } else {
          setTimeout(() => {
            setSelectedCellIndex(null);
            setFeedback(null);
          }, 2500);
        }
      }
    }
  };

  // Bot Turn offline
  const handleBotTurnOffline = () => {
    const emptyIndices: number[] = [];
    board.forEach((cell, idx) => {
      if (cell.owner === null) emptyIndices.push(idx);
    });

    if (emptyIndices.length === 0) return;

    // un bot niveau normal qui aura 75% de bonnes réponses et qui essaiera d'avoir un bingo
    // et un bot niveau hard qui aura 100% de bonnes réponse et qui essaiera d'avoir un bingo tout en bloquant l'adversaire
    const isHard = botDifficulty === "hard";
    const isSuccessful = isHard ? true : Math.random() < 0.75;
    setIsBotThinking(false);

    if (isSuccessful) {
      const winLines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], 
        [0, 3, 6], [1, 4, 7], [2, 5, 8], 
        [0, 4, 8], [2, 4, 6]             
      ];

      // Heureuse heuristique de score par cellule
      const getCellScore = (idx: number) => {
        let score = 0;
        winLines.forEach(line => {
          if (line.includes(idx)) {
            let countBot = 0;
            let countUser = 0;
            line.forEach(cellIdx => {
              if (board[cellIdx].owner === 2) countBot++;
              else if (board[cellIdx].owner === 1) countUser++;
            });

            if (isHard) {
              // Stratégie mode Hard : Gagner immédiatement > Bloquer l'adversaire > Construire une attaque > Gêner
              if (countBot === 2 && countUser === 0) {
                score += 10000; // Coup gagnant pour le bot !
              } else if (countUser === 2 && countBot === 0) {
                score += 5000;  // Bloquer absolument le coup gagnant de l'adversaire !
              } else if (countBot === 1 && countUser === 0) {
                score += 100;   // Construire son propre bingo
              } else if (countUser === 1 && countBot === 0) {
                score += 40;    // Gêner l'avancée de l'adversaire
              } else {
                score += 5;
              }
            } else {
              // Stratégie mode Normal : Chercher uniquement son propre bingo, sans bloquer l'adversaire
              if (countBot === 2 && countUser === 0) {
                score += 1000;  // Coup gagnant pour le bot
              } else if (countBot === 1 && countUser === 0) {
                score += 100;   // Développer le bingo
              } else if (countBot === 0 && countUser === 0) {
                score += 10;    // Ligne libre
              } else {
                score += 2;
              }
            }
          }
        });
        return score;
      };

      // Trier les index vides par score + un petit soupçon d'aléatoire pour plus de naturel
      const scoredIndices = emptyIndices.map(idx => ({
        idx,
        score: getCellScore(idx) + Math.random() * 2
      })).sort((a, b) => b.score - a.score);

      const targetIndices = scoredIndices.map(item => item.idx);
      
      let chosenIndex = -1;
      let matchingChar: Character | null = null;

      for (const idx of targetIndices) {
        const { colIndex, rowIndex } = getCellCoords(idx);
        const colCategory = CATEGORIES[columnKeys[colIndex]];
        const rowCategory = CATEGORIES[rowKeys[rowIndex]];

        const possibleChar = characters.find(
          c => !usedCharacterIds.has(c.id) &&
               colCategory.check(c) &&
               rowCategory.check(c)
        );

        if (possibleChar) {
          chosenIndex = idx;
          matchingChar = possibleChar;
          break;
        }
      }

      if (chosenIndex !== -1 && matchingChar) {
        const updatedBoard = [...board];
        updatedBoard[chosenIndex] = {
          owner: 2,
          character: matchingChar
        };
        setBoard(updatedBoard);

        const updatedUsed = new Set(usedCharacterIds);
        updatedUsed.add(matchingChar.id);
        setUsedCharacterIds(updatedUsed);

        setFeedback({
          isError: false,
          message: `🤖 Bot ${botOpponent?.name} (${isHard ? "Difficile" : "Normal"}) a joué ${matchingChar.name} sur [${CATEGORIES[columnKeys[getCellCoords(chosenIndex).colIndex]].label} & ${CATEGORIES[rowKeys[getCellCoords(chosenIndex).rowIndex]].label}] !`
        });

        if (checkWinCondition(updatedBoard, 2)) {
          handleGameEndOffline(2);
        } else if (isBoardFull(updatedBoard)) {
          handleGameEndOffline("tie");
        } else {
          setCurrentPlayer(1);
        }
      } else {
        simulateBotFailureOffline(emptyIndices);
      }
    } else {
      simulateBotFailureOffline(emptyIndices);
    }
  };

  const simulateBotFailureOffline = (emptyIndices: number[]) => {
    const randomCell = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    const wrongChar = characters[Math.floor(Math.random() * 25)]; // Un personnage pris au hasard
    
    setFeedback({
      isError: true,
      message: `❌ ${botOpponent?.name || "L'adversaire"} a tenté ${wrongChar.name} mais c'est faux ! C'est à vous !`
    });

    setCurrentPlayer(1);
  };

  // Fin de partie offline / local
  const handleGameEndOffline = (outcome: 1 | 2 | "tie") => {
    setWinner(outcome);
    setGameState("ended");

    if (botOpponent) {
      if (outcome === 1) {
        onUpdateBounty(10000); // 10k si bat le bot
      }
    } else {
      if (outcome === 1) {
        onUpdateBounty(5000); // 5k si termine la grille solo
      }
    }
  };

  // Abandonner/Forfait de la partie
  const handleForfeitGame = async () => {
    if (activeOnlineGameId && onlineOpponent) {
      try {
        const gameDocRef = doc(db, "gridGames", activeOnlineGameId);
        await updateDoc(gameDocRef, {
          status: "ended",
          winner: onlineOpponent.email, // L'adversaire gagne
          updatedAt: serverTimestamp()
        });
      } catch (e) {
        console.error("Erreur forfeit:", e);
      }
    } else {
      // Local game surrender
      handleGameEndOffline(2);
    }
    setShowForfeitConfirm(false);
  };

  // Proposer un match nul (passe son tour en échange)
  const handleProposeDraw = async () => {
    if (!activeOnlineGameId || !onlineOpponent) return;
    if (currentPlayer !== myRole) {
      addToast("Vous pouvez proposer un match nul uniquement pendant votre tour !", "warning");
      return;
    }

    try {
      const nextPlayer = myRole === 1 ? 2 : 1;
      const gameDocRef = doc(db, "gridGames", activeOnlineGameId);
      await updateDoc(gameDocRef, {
        drawProposedBy: myRole,
        currentPlayer: nextPlayer,
        turnEmail: onlineOpponent.email,
        updatedAt: serverTimestamp()
      });
      addToast("Proposition de match nul envoyée ! Votre tour passe.", "info");
    } catch (e) {
      console.error("Erreur proposition nul:", e);
    }
  };

  // Accepter le match nul proposé
  const handleAcceptDraw = async () => {
    if (!activeOnlineGameId) return;
    try {
      const gameDocRef = doc(db, "gridGames", activeOnlineGameId);
      await updateDoc(gameDocRef, {
        status: "ended",
        winner: "tie",
        drawProposedBy: null,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Erreur acceptation nul:", e);
    }
  };

  // Refuser le match nul proposé
  const handleDeclineDraw = async () => {
    if (!activeOnlineGameId) return;
    try {
      const gameDocRef = doc(db, "gridGames", activeOnlineGameId);
      await updateDoc(gameDocRef, {
        drawProposedBy: null,
        updatedAt: serverTimestamp()
      });
      addToast("Vous avez décliné le match nul. La bataille reprend !", "warning");
    } catch (e) {
      console.error("Erreur refus nul:", e);
    }
  };

  // Quit Game
  const handleQuitGame = async () => {
    if (activeOnlineGameId) {
      try {
        await deleteDoc(doc(db, "gridGames", activeOnlineGameId));
      } catch (e) {
        console.error(e);
      }
    }
    setGameState("lobby");
    setActiveOnlineGameId(null);
    setOnlineOpponent(null);
    setBotOpponent(null);
    setWinner(null);
    setFeedback(null);
  };

  const getCellCoords = (index: number) => {
    const rowIndex = Math.floor(index / 3);
    const colIndex = index % 3;
    return { colIndex, rowIndex };
  };

  const isBoardFull = (currBoard: typeof board) => {
    return currBoard.every(cell => cell.owner !== null);
  };

  const checkWinCondition = (currBoard: typeof board, player: 1 | 2) => {
    const winLines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], 
      [0, 3, 6], [1, 4, 7], [2, 5, 8], 
      [0, 4, 8], [2, 4, 6]             
    ];
    return winLines.some(line => 
      line.every(idx => currBoard[idx].owner === player)
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans relative">
      
      {/* Notifications / Toast Portal */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9, transition: { duration: 0.2 } }}
              className={`p-4 rounded-2xl shadow-xl flex items-center gap-3 border text-white pointer-events-auto ${
                t.type === "success" 
                  ? "bg-emerald-600 border-emerald-500" 
                  : t.type === "error" 
                  ? "bg-rose-600 border-rose-500" 
                  : t.type === "warning"
                  ? "bg-amber-600 border-amber-500"
                  : "bg-violet-600 border-violet-500"
              }`}
            >
              <div className="text-xl shrink-0">
                {t.type === "success" ? "⭐" : t.type === "error" ? "☠️" : t.type === "warning" ? "⚠️" : "⚓"}
              </div>
              <p className="text-xs font-black uppercase tracking-wider leading-snug">{t.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Page Title & Description */}
      <div className="text-center mb-10 relative">
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white font-heading mb-2 uppercase">
          GRAND LINE GRID
        </h2>
        <p className="text-slate-300 max-w-2xl mx-auto text-sm md:text-base font-medium">
          Défiez d'autres pirates ou entraînez-vous en plaçant stratégiquement les personnages correspondant aux critères requis !
        </p>
      </div>

      {/* SECTION INVITATION RECUE (BANNER FLOTTANTE) */}
      <AnimatePresence>
        {incomingChallenge && (
          <motion.div 
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            className="mb-8 p-5 bg-[#5b21b6] border-2 border-[#a78bfa] rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl"
          >
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-14 h-14 rounded-full border-2 border-white overflow-hidden shrink-0 hidden sm:block bg-slate-800">
                <img 
                  src={incomingChallenge.hostAvatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(incomingChallenge.hostName)}`} 
                  alt="Host" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-heading font-black text-lg tracking-wide uppercase text-amber-300">⚔️ UN DUEL EST DÉCLARÉ ! ⚔️</p>
                <p className="text-sm opacity-90 font-medium">
                  Le légendaire pirate <span className="font-bold underline">{incomingChallenge.hostName}</span> (฿ {incomingChallenge.hostBounty.toLocaleString()}) vous défie sur la Grand Line Grid !
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto shrink-0 justify-center">
              <button 
                onClick={handleAcceptChallenge}
                className="py-2.5 px-6 bg-amber-400 hover:bg-amber-500 text-slate-950 font-heading font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md transform active:scale-95 transition-all"
              >
                ACCEPTER LE DUEL
              </button>
              <button 
                onClick={handleDeclineChallenge}
                className="py-2.5 px-4 bg-white/15 hover:bg-white/25 text-white font-heading font-bold text-xs uppercase rounded-xl cursor-pointer transition-all"
              >
                Refuser
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION DUEL DRAW PROPOSAL */}
      <AnimatePresence>
        {gameState === "playing" && drawProposedBy !== null && drawProposedBy !== myRole && (
          <motion.div 
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            className="mb-8 p-5 bg-gradient-to-r from-blue-700 to-indigo-800 border-2 border-indigo-400 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl relative z-40"
          >
            <div className="flex items-center gap-4 text-center md:text-left">
              <span className="text-3xl">🤝</span>
              <div>
                <p className="font-heading font-black text-lg tracking-wide uppercase text-amber-300">PROPOSITION DE MATCH NUL !</p>
                <p className="text-sm opacity-90 font-medium">
                  Votre rival <span className="font-bold underline">{onlineOpponent?.name || "L'adversaire"}</span> vous propose de déclarer un match nul pour cette bataille de la Grand Line Grid !
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto shrink-0 justify-center">
              <button 
                onClick={handleAcceptDraw}
                className="py-2.5 px-6 bg-amber-400 hover:bg-amber-500 text-slate-950 font-heading font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md transform active:scale-95 transition-all"
              >
                ACCEPTER LE MATCH NUL
              </button>
              <button 
                onClick={handleDeclineDraw}
                className="py-2.5 px-4 bg-white/15 hover:bg-white/25 text-white font-heading font-bold text-xs uppercase rounded-xl cursor-pointer transition-all"
              >
                REFUSER ET CONTINUER
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOBBY / INTERFACES PRINCIPALES */}
      {gameState === "lobby" && (
        <div className="flex flex-col gap-8 max-w-5xl mx-auto relative">
          
          {/* Onglets Tactiques de Sélection de Mode */}
          <div className="bg-white/70 backdrop-blur-md p-1.5 rounded-2xl flex gap-2 max-w-md mx-auto w-full shadow-xs border border-violet-100/60 relative">
            <button
              onClick={() => setActiveTab("multiplayer")}
              className={`flex-1 py-3 text-center rounded-xl font-heading text-xs font-black tracking-wider uppercase transition-all cursor-pointer elastic-bouncy ${
                activeTab === "multiplayer" ? "bg-slate-900 text-white shadow-md border-violet-400" : "text-gray-500 hover:text-gray-905"
              }`}
            >
              <Swords className="w-4 h-4 inline-block mr-1.5 -mt-0.5 text-rose-500" />
              Multijoueur
            </button>
            <button
              onClick={() => setActiveTab("practice")}
              className={`flex-1 py-3 text-center rounded-xl font-heading text-xs font-black tracking-wider uppercase transition-all cursor-pointer elastic-bouncy ${
                activeTab === "practice" ? "bg-slate-900 text-white shadow-md border-violet-400" : "text-gray-500 hover:text-gray-905"
              }`}
            >
              <Compass className="w-4 h-4 inline-block mr-1.5 -mt-0.5 text-violet-500" />
              Entraînement
            </button>
          </div>

          {/* CONTENU SELON L'ONGLET RECONFIGURÉ */}
          {activeTab === "practice" && (
            <div className="bg-white/95 backdrop-blur-md rounded-3xl border-2 border-violet-100/80 p-12 md:p-16 shadow-lg flex flex-col items-center justify-center text-center gap-8 max-w-3xl mx-auto relative overflow-hidden">
              {/* Cute corner cloud */}
              <div className="absolute right-[-15px] top-[-10px] text-5xl opacity-15 select-none pointer-events-none rotate-12">☁️</div>
              <div className="absolute left-[10%] bottom-[-15px] text-6xl opacity-10 select-none pointer-events-none">☁️</div>
              
              <div className="max-w-2xl relative z-10 space-y-3">
                <h4 className="font-heading font-black text-[#1A1A1A] text-xl md:text-2xl uppercase tracking-wide flex items-center justify-center gap-2.5">
                  <Compass className="w-6.5 h-6.5 text-violet-500" />
                  ÉCOLE D'ALABASTA <span className="text-xs text-violet-600 font-mono tracking-widest font-bold bg-violet-50 px-2.5 py-1 rounded-md">ENTRAINEMENT</span>
                </h4>
                <p className="text-gray-500 text-base leading-relaxed font-semibold">
                  Perfectionnez vos connaissances sur l'univers d'One Piece sans pression. Posez vos candidats à votre propre rythme pour dompter les intersections du Nouveau Monde.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full justify-center relative z-10 flex-wrap">
                <button
                  onClick={handleStartPracticeGame}
                  className="py-4 px-6 bg-slate-900 hover:bg-amber-400 hover:text-slate-950 text-white font-heading font-black text-xs tracking-wider uppercase rounded-2xl active:scale-95 transition-all text-center flex items-center justify-center gap-2 cursor-pointer shadow-md flex-1 min-w-[180px] elastic-bouncy"
                >
                  <Compass className="w-4 h-4" />
                  SOLO HORS-LIGNE
                </button>
                <button
                  onClick={() => handleStartBotPracticeGame("normal")}
                  className="py-4 px-6 bg-white border border-slate-900 hover:bg-violet-50 hover:text-violet-600 text-slate-900 font-heading font-black text-xs tracking-wider uppercase rounded-2xl active:scale-95 transition-all text-center flex items-center justify-center gap-2 cursor-pointer shadow-md flex-1 min-w-[180px] elastic-bouncy"
                >
                  <Users className="w-4 h-4" />
                  NORMAL
                </button>
                <button
                  onClick={() => handleStartBotPracticeGame("hard")}
                  className="py-4 px-6 bg-white border border-rose-500 hover:bg-rose-50 hover:text-rose-600 text-slate-900 font-heading font-black text-xs tracking-wider uppercase rounded-2xl active:scale-95 transition-all text-center flex items-center justify-center gap-2 cursor-pointer shadow-md flex-1 min-w-[180px] elastic-bouncy"
                >
                  <Users className="w-4 h-4 text-rose-500" />
                  DIFFICILE
                </button>
              </div>
            </div>
          )}

          {activeTab === "multiplayer" && !myEmail && (
            <div className="bg-violet-600 backdrop-blur-md border-2 border-violet-500 rounded-3xl p-8 text-white max-w-xl mx-auto shadow-xl relative overflow-hidden">
              <div className="absolute right-[-10px] bottom-[-10px] text-5xl opacity-15 select-none hover:rotate-6 transition-transform">🥁</div>
              <div className="flex gap-3 mb-3 relative z-10 items-center">
                <AlertTriangle className="w-6 h-6 shrink-0 text-amber-300 animate-pulse" />
                <h4 className="font-heading font-black text-sm uppercase tracking-widest text-white">CONNECTEZ-VOUS POUR JOUER EN LIGNE</h4>
              </div>
              <p className="text-sm leading-relaxed font-medium mb-4 text-violet-100 relative z-10">
                Le Grand Line en ligne nécessite un équipage enregistré ! Vous devez vous connecter avec un e-mail dans l'onglet **COMPTE** de la barre latérale pour débloquer le classement, le matchmaking sans bot, et le salon d'amis.
              </p>
              <div className="p-3 bg-violet-750 border border-violet-500/60 rounded-xl text-center text-xs font-heading font-bold relative z-10 text-white shadow-inner">
                🗝️ Allez dans "TABLEAU DE BORD" et saisissez votre pseudo de pirate !
              </div>
            </div>
          )}

          {activeTab === "multiplayer" && myEmail && (
            <div className="flex flex-col gap-6">
              
              {/* SÉLECTEUR DE FORMAT DE COMBAT */}
              <div className="bg-white/95 backdrop-blur-md rounded-3xl border-2 border-dashed border-violet-200 p-6 shadow-sm max-w-xl mx-auto w-full">
                <h4 className="font-heading font-black text-slate-800 text-xs uppercase tracking-widest mb-3 text-center">
                  Format de la bataille en ligne
                </h4>
                <div className="flex gap-4">
                  <button
                    onClick={() => setTargetWinsSelection(3)}
                    type="button"
                    className={`flex-1 py-3 rounded-xl font-heading text-xs font-black uppercase border-2 transition-all cursor-pointer ${
                      targetWinsSelection === 3
                        ? "bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-200"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Premier à 3 victoires
                  </button>
                  <button
                    onClick={() => setTargetWinsSelection(5)}
                    type="button"
                    className={`flex-1 py-3 rounded-xl font-heading text-xs font-black uppercase border-2 transition-all cursor-pointer ${
                      targetWinsSelection === 5
                        ? "bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-200"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Premier à 5 victoires
                  </button>
                </div>
                <p className="text-center text-slate-400 text-[10px] font-semibold mt-3">
                  *Le format choisi s'appliquera pour vos lancements de matchmaking, créations de salons et défis d'amis.
                </p>
              </div>

              {/* 1. MATCHMAKING GLOBAL RAPIDE */}
              <div className="bg-white/95 backdrop-blur-md rounded-3xl border-2 border-violet-100/60 p-6 shadow-sm relative overflow-hidden">
                {/* Visual float clouds */}
                <span className="absolute -right-6 top-2 text-7xl opacity-[0.07] select-none pointer-events-none rotate-45">☁️</span>
                <span className="absolute left-[-20px] bottom-[-10px] text-8xl opacity-[0.06] select-none pointer-events-none -rotate-12">☁️</span>
                
                <div className="flex items-start gap-4 justify-between leading-tight mb-4 relative z-10">
                  <div>
                    <h4 className="font-heading font-black text-[#1A1A1A] text-lg uppercase tracking-wide flex items-center gap-2">
                      Commencez le combat
                      <span className="inline-block text-xs bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full font-bold">LIVE</span>
                    </h4>
                    <p className="text-gray-400 text-xs mt-0.5 font-medium">Rechercher instantanément un rival réel connecté sur la New Line.</p>
                  </div>
                  <span className="text-[10px] bg-violet-100 text-violet-800 font-bold px-2 py-1 rounded-md uppercase shrink-0">
                    VRAIS JOUEURS UNIQUEMENT
                  </span>
                </div>

                <p className="text-gray-500 text-xs leading-relaxed font-medium mb-6 relative z-10">
                  Batifolage banni : ce mode recherche un autre pirate qui vient de lancer une recherche de combat en même temps que vous. Le gagnant s'accapare un butin de **10 000 ฿ Berrys**, le perdant concède **5 000 ฿**.
                </p>

                <button
                  onClick={() => {
                    setGameMode("online");
                    setGameState("searching");
                  }}
                  className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white font-heading font-black text-xs tracking-widest uppercase rounded-2xl active:scale-95 transition-all text-center flex items-center justify-center gap-2 cursor-pointer shadow-md border-b-4 border-slate-950/20 elastic-bouncy relative z-10"
                >
                  <Globe className="w-4 h-4 text-white" />
                  LANCER LE MATCHMAKING REEL (SANS BOT)
                </button>
              </div>

              {/* 2. FRIEND & ROOM CODES */}
              <div className="max-w-md mx-auto w-full">
                
                {/* Créateur et rejoint par Code */}
                <div className="bg-white/95 backdrop-blur-md rounded-3xl border-2 border-violet-100/60 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
                  <span className="absolute right-[-10px] top-[-10px] text-4xl opacity-10 select-none">🗝️</span>
                  <div className="relative z-10">
                    <h4 className="font-heading font-black text-gray-900 text-sm uppercase mb-1">SALON PAR CODE</h4>
                    <p className="text-gray-400 text-xs mb-4">Créez un salon ou saisissez le code partagé par votre allié.</p>
                    
                    <form onSubmit={handleJoinWithCode} className="flex gap-2 mb-4">
                      <input
                        type="text"
                        placeholder="CODE (EX: LUF2Y)"
                        value={roomCodeInput}
                        onChange={(e) => setRoomCodeInput(e.target.value)}
                        maxLength={6}
                        className="flex-1 bg-gray-50 p-3 rounded-xl border border-slate-200 uppercase font-mono text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                      />
                      <button
                        type="submit"
                        disabled={joinLoading}
                        className="px-4 bg-gray-950 text-white font-heading font-black text-xs uppercase rounded-xl hover:bg-slate-800 cursor-pointer disabled:opacity-50 elastic-bouncy"
                      >
                        {joinLoading ? "En route..." : "REJOINDRE"}
                      </button>
                    </form>
                    {errorMsgAmis && (
                      <p className="text-red-500 text-[10px] font-bold mb-3">{errorMsgAmis}</p>
                    )}
                  </div>

                  <button
                    onClick={handleCreateRoomWithCode}
                    className="w-full py-3 bg-white border-2 border-dashed border-amber-400 text-amber-600 hover:bg-amber-50 text-xs font-heading font-black uppercase rounded-2xl flex items-center justify-center gap-2 cursor-pointer elastic-bouncy relative z-10"
                  >
                    <Key className="w-4 h-4" />
                    CRÉER UN SALON DE DUEL
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* MATCHMAKING MULTIJOUEUR RADAR */}
      {gameState === "searching" && (
        <div className="text-center py-20 max-w-xl mx-auto bg-white rounded-3xl border border-gray-100 p-8 shadow-md">
          <div className="relative w-36 h-36 mx-auto mb-8 flex items-center justify-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
              className="absolute inset-0 border-4 border-dashed border-[#8b5cf6] rounded-full"
            />
            <div className="w-24 h-24 bg-[#8b5cf6]/10 rounded-full flex items-center justify-center">
              <Swords className="w-10 h-10 text-[#8b5cf6]" />
            </div>
          </div>

          <h3 className="text-2xl font-bold font-heading text-gray-950 mb-2 uppercase">RECHERCHE DE COMBAT REEL</h3>
          
          {privateRoomCode ? (
            <div className="mb-6 p-4 bg-[#f5f3ff] border border-dashed border-[#8b5cf6] rounded-2xl max-w-xs mx-auto">
              <p className="text-[10px] text-gray-400 font-heading font-black uppercase tracking-wider mb-1">PARTAGEZ CE CODE SALON</p>
              <p className="text-3xl font-mono font-black text-[#8b5cf6] tracking-widest">{privateRoomCode}</p>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(privateRoomCode);
                  addToast("Code de salon copié dans le presse-papiers !", "success");
                }}
                className="mt-2 text-[10px] text-indigo-600 underline font-bold cursor-pointer hover:text-indigo-800"
              >
                Copier le code
              </button>
            </div>
          ) : (
            <p className="text-violet-600 font-mono text-xs max-w-xs mx-auto font-semibold mb-6">
              {searchTextAmis || `Recherche d'autres capitaines actifs sur le serveur... (Code radar: ${searchTimer})`}
            </p>
          )}

          <button
            onClick={handleCancelSearch}
            className="px-6 py-2 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-heading font-bold uppercase tracking-wider rounded-xl cursor-pointer"
          >
            Quitter le Matchmaking / Fermer le navire
          </button>
        </div>
      )}

      {/* PLATEAU DE JEU PRINCIPAL */}
      {(gameState === "playing" || gameState === "ended") && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Section Gauche : Infos Joueurs & Logs de tour */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Header info active */}
            <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-xs">
              <h4 className="font-heading font-bold text-gray-400 text-xs uppercase tracking-wider mb-4">
                {activeOnlineGameId ? "💥 BATAILLE MULTIJOUEUR LIGNE" : botOpponent ? `🤖 ENTRAÎNEMENT IA (${botDifficulty === "hard" ? "DIFFICILE" : "NORMAL"})` : "🏆 SOLO ACADÉMIE"}
              </h4>
              
              <div className="flex flex-col gap-4">
                {/* Joueur 1 (Bleu) */}
                <div className={`p-3 rounded-xl border flex items-center gap-3 ${
                  ((!activeOnlineGameId && currentPlayer === 1) || (activeOnlineGameId && currentPlayer === 1)) && !winner 
                    ? "border-[#2563eb] bg-[#2563eb]/5" 
                    : "border-gray-50"
                }`}>
                  <div className="w-4 h-4 rounded-full bg-[#2563eb] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-black text-sm text-gray-900 truncate uppercase">
                      {activeOnlineGameId ? (myRole === 1 ? playerUsername : onlineOpponent?.name) : `${playerUsername} (Bleu)`}
                    </p>
                    <p className="font-mono text-[9px] text-gray-400 font-semibold">฿ {globalBounty.toLocaleString()}</p>
                  </div>
                  {((!activeOnlineGameId && currentPlayer === 1) || (activeOnlineGameId && currentPlayer === 1)) && !winner && (
                    <span className="text-[10px] bg-[#2563eb] text-white px-2 py-0.5 rounded-sm font-heading font-bold">
                      {(activeOnlineGameId && myRole !== 1) ? "ATTENTE" : "SON TOUR"}
                    </span>
                  )}
                </div>

                <div className="text-center font-heading font-extrabold text-[#1a1a1a]/30 text-xs tracking-wider">VS</div>

                {/* Joueur 2 (Rouge) */}
                <div className={`p-3 rounded-xl border flex items-center gap-3 ${
                  ((!activeOnlineGameId && currentPlayer === 2) || (activeOnlineGameId && currentPlayer === 2)) && !winner 
                    ? "border-[#dc2626] bg-[#dc2626]/5" 
                    : "border-gray-50"
                }`}>
                  <div className="w-4 h-4 rounded-full bg-[#dc2626] shrink-0 font-bold" />
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-black text-sm text-gray-900 truncate uppercase">
                      {activeOnlineGameId 
                        ? (myRole === 2 ? playerUsername : onlineOpponent?.name) 
                        : (botOpponent ? `${botOpponent.name} (IA ${botDifficulty === "hard" ? "DIFF." : "NORM."})` : "Grille Rouge")}
                    </p>
                    <p className="font-mono text-[9px] text-gray-400 font-semibold">
                      ฿ {activeOnlineGameId 
                        ? (onlineOpponent?.bounty || 200000000).toLocaleString() 
                        : (botOpponent ? botOpponent.bounty : 0).toLocaleString()}
                    </p>
                  </div>
                  {((!activeOnlineGameId && currentPlayer === 2) || (activeOnlineGameId && currentPlayer === 2)) && !winner && (
                    <span className="text-[10px] bg-[#dc2626] text-white px-2 py-0.5 rounded-sm font-heading font-bold">
                      {activeOnlineGameId ? (myRole !== 2 ? "ATTENTE" : "VOTRE TOUR") : (isBotThinking ? "RÉFLEXION..." : "ACTIF")}
                    </span>
                  )}
                </div>
              </div>

              {/* HUD de scores de manches et vols restants */}
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                {activeOnlineGameId && (
                  <div className="bg-slate-50 p-3 rounded-2xl text-center space-y-1">
                    <p className="text-[10px] font-heading font-black text-slate-400 uppercase tracking-widest">
                      🏆 SCORE DES MANCHES ({roundCount > 0 ? `Manche ${roundCount}` : "En cours"})
                    </p>
                    <div className="flex justify-around items-center font-heading font-black text-sm text-slate-800">
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] text-slate-400">P1 {myRole === 1 && "(Vous)"}</span>
                        <span className="text-base text-indigo-650 font-black">{player1Wins}</span>
                      </div>
                      <span className="text-slate-300">/</span>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold">
                          Cible : {targetWins} victoires
                        </span>
                      </div>
                      <span className="text-slate-300">/</span>
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] text-slate-400">P2 {myRole === 2 && "(Vous)"}</span>
                        <span className="text-base text-rose-650 font-black">{player2Wins}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Turn Timer for Online mode */}
                {activeOnlineGameId && gameMode === "online" && (
                  <div className="bg-violet-50 border border-violet-100 p-3 rounded-2xl text-center space-y-1">
                    <p className="text-[10px] font-heading font-black text-violet-700 uppercase tracking-widest">
                      ⚡ TEMPS RESTANT
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`text-base font-mono font-black shrink-0 ${turnTimeLeft <= 10 ? "text-red-600 animate-pulse" : "text-violet-700"}`}>
                        {turnTimeLeft}s
                      </span>
                      <div className="flex-1 bg-violet-200/50 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${turnTimeLeft <= 10 ? "bg-red-500" : "bg-violet-600"}`} 
                          style={{ width: `${(turnTimeLeft / 30) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-3 text-center space-y-1">
                  <p className="text-[10px] font-heading font-black text-amber-700 uppercase tracking-wider">
                    ⚡ VOLS DISPONIBLES (2 MAX PAR PARTIE)
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium mb-1.5 leading-tight">
                    En cliquant sur une case rouge adverse, vous pouvez tenter de la VOLER en trouvant un nouveau pirate valide !
                  </p>
                  <div className="flex justify-around text-xs font-bold pt-1.5 border-t border-amber-100/50">
                    <div className="text-slate-600">
                      Vous : <span className="font-mono font-black text-amber-600">{activeOnlineGameId ? (myRole === 1 ? player1Steals : player2Steals) : myStealsLeft}</span> / 2
                    </div>
                    <div className="text-slate-600">
                      Adversaire : <span className="font-mono font-black text-slate-500">{activeOnlineGameId ? (myRole === 1 ? player2Steals : player1Steals) : (botOpponent ? botStealsLeft : "N/A")}</span> / 2
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Notification de coup ou erreur */}
            {feedback && feedback.isError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl flex items-start gap-3 border text-xs leading-relaxed bg-red-50 text-red-800 border-red-200"
              >
                <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
                <div className="flex-1">
                  <p className="font-bold">Critère non valide !</p>
                  <p className="mt-0.5 font-medium">{feedback.message}</p>
                </div>
              </motion.div>
            )}

            {/* Boutons de sortie */}
            <div className="flex flex-col gap-2.5">
              {gameState === "playing" && (
                <>
                  {activeOnlineGameId && currentPlayer === myRole && (
                    <button
                      onClick={handleProposeDraw}
                      className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-heading text-xs font-bold uppercase rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      🤝 Proposer Match Nul
                    </button>
                  )}

                  {!showForfeitConfirm ? (
                    <button
                      onClick={() => setShowForfeitConfirm(true)}
                      className="w-full py-3 bg-orange-50 hover:bg-orange-100 text-orange-700 font-heading text-xs font-bold uppercase rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      💀 Abandonner la partie
                    </button>
                  ) : (
                    <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl text-center space-y-2.5">
                      <p className="text-[11px] font-bold text-orange-900 leading-tight">
                        Êtes-vous sûr de vouloir de déclarer forfait ? Cela comptera comme une défaite.
                      </p>
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={handleForfeitGame}
                          className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-[10px] font-black uppercase cursor-pointer transition-all"
                        >
                          Confirmer
                        </button>
                        <button
                          onClick={() => setShowForfeitConfirm(false)}
                          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-[10px] font-black uppercase cursor-pointer hover:bg-slate-50 transition-all"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              <button
                onClick={handleQuitGame}
                className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-700 font-heading text-xs font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <X className="w-4 h-4 text-red-400" />
                Quitter ce combat
              </button>
            </div>

          </div>

          {/* Section Droite : La Grille Magique 3x3 */}
          <div className="lg:col-span-8 flex flex-col items-center">
            
            {/* Grand panneau en cas de fin de jeu */}
            {gameState === "ended" && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`w-full p-6 rounded-3xl text-center border-2 mb-6 ${
                  (activeOnlineGameId && winner === myRole) || (!activeOnlineGameId && winner === 1)
                    ? "bg-emerald-50 border-emerald-300 text-emerald-950" 
                    : winner === "tie" 
                      ? "bg-slate-50 border-slate-300 text-slate-950"
                      : "bg-red-50 border-red-300 text-red-950"
                }`}
              >
                <h3 className="text-2xl font-bold font-heading mb-1.5 uppercase tracking-wide">
                  {(activeOnlineGameId && winner === myRole) || (!activeOnlineGameId && winner === 1)
                    ? "🏆 VICTOIRE DU CHAPEAU DE PAILLE !" 
                    : winner === "tie" 
                      ? "🦈 MER D'ÉGALITÉ !" 
                      : "💀 DÉFAITE EN MER..."}
                </h3>
                <p className="text-xs mb-4 font-semibold">
                  {activeOnlineGameId ? (
                    winner === myRole 
                      ? `Vos compétences d'érudit des mers vous récompensent royalement ! (+10 000 ฿)`
                      : `Votre navire a coulé. Reconsidérer les fruits du démon et affiliations ! (-5 000 ฿)`
                  ) : (
                    winner === 1 
                      ? `Exceptionnel ! Vous avez su déceler toutes les intersections de la grille !`
                      : `L'adversaire ou le timer a triomphé. Recommencez pour accroître vos médailles.`
                  )}
                </p>
                <div className="flex justify-center items-center gap-3 flex-wrap">
                  <button
                    onClick={handleQuitGame}
                    className="px-6 py-2.5 bg-gray-900 font-heading text-xs font-bold text-white rounded-xl hover:bg-gray-800 transition-all cursor-pointer shadow-sm uppercase"
                  >
                    Retourner au Port
                  </button>
                  {botOpponent ? (
                    <button
                      onClick={() => handleStartBotPracticeGame(botDifficulty)}
                      className="px-6 py-2.5 bg-violet-600 font-heading text-xs font-black text-white rounded-xl hover:bg-violet-700 transition-all cursor-pointer shadow-sm uppercase"
                    >
                      Rejouer contre le Bot 🔁
                    </button>
                  ) : !activeOnlineGameId && gameMode === "local" ? (
                    <button
                      onClick={handleStartPracticeGame}
                      className="px-6 py-2.5 bg-violet-600 font-heading text-xs font-black text-white rounded-xl hover:bg-violet-700 transition-all cursor-pointer shadow-sm uppercase"
                    >
                      Recommencer Solo 🔁
                    </button>
                  ) : null}
                </div>
              </motion.div>
            )}

            {/* La Grille de Tic-Tac-Toe */}
            {columnKeys.length > 0 && rowKeys.length > 0 && (
              <div className="w-full max-w-[780px] bg-slate-50 p-6 md:p-8 rounded-3xl border-2 border-slate-900">
                
                {/* Ligne d'entête (Colonnes à croiser) */}
                <div className="grid grid-cols-4 gap-4 mb-4 text-center items-center">
                  <div className="font-heading font-black text-slate-400 text-[10px] md:text-2xs uppercase tracking-widest flex items-center justify-center p-2">
                    RECOUPEMENT
                  </div>
                  
                  {columnKeys.map((key) => {
                    const cat = CATEGORIES[key];
                    return (
                      <div 
                        key={key} 
                        className="bg-white py-2 px-1.5 rounded-xl text-[10px] md:text-xs font-heading font-black uppercase text-[#1A1A1A] border border-[#E5E7EB] flex items-center justify-center h-20 md:h-28 shadow-3xs"
                      >
                        {cat.label}
                      </div>
                    );
                  })}
                </div>

                {/* Les 3 lignes interactives */}
                {rowKeys.map((rowKey, rowIndex) => {
                  const catRow = CATEGORIES[rowKey];
                  return (
                    <div key={rowKey} className="grid grid-cols-4 gap-4 mb-4 items-center">
                      {/* Entête de ligne */}
                      <div className="bg-white py-2 px-1.5 rounded-xl text-[10px] md:text-xs font-heading font-black uppercase text-[#1A1A1A] border border-[#E5E7EB] flex items-center justify-center h-24 md:h-34 shadow-3xs text-center">
                        {catRow.label}
                      </div>

                      {/* Les 3 cellules d'intersections */}
                      {[0, 1, 2].map((colIndex) => {
                        const cellIndex = rowIndex * 3 + colIndex;
                        const cell = board[cellIndex];
                        const isMyTurn = activeOnlineGameId ? (currentPlayer === myRole) : (currentPlayer === 1);
                        
                        const isOwnerMe = cell.owner !== null && (activeOnlineGameId ? cell.owner === myRole : cell.owner === 1);
                        const stealsAvailable = activeOnlineGameId 
                          ? (myRole === 1 ? player1Steals : player2Steals) 
                          : myStealsLeft;
                        const canSteal = cell.owner !== null && !isOwnerMe && stealsAvailable > 0;
                        const isCellDisabled = gameState === "ended" || isBotThinking || !isMyTurn || (cell.owner !== null && !canSteal);

                        return (
                          <button
                            key={colIndex}
                            disabled={isCellDisabled}
                            onClick={() => handleCellClick(cellIndex)}
                            className={`h-24 md:h-34 rounded-2xl border-2 transition-all flex flex-col items-center justify-center p-2 focus:scale-95 cursor-pointer relative group overflow-hidden ${
                              cell.owner === 1
                                ? "bg-[#2563eb] border-[#2563eb] text-white font-black hover:opacity-90"
                                : cell.owner === 2
                                  ? "bg-[#dc2626] border-[#dc2626] text-white font-black hover:opacity-90"
                                  : isMyTurn 
                                    ? "bg-white border-dashed border-[#E5E7EB] hover:border-[#8b5cf6] hover:bg-violet-50/10 cursor-pointer"
                                    : "bg-gray-100 border-dashed border-gray-200 cursor-not-allowed opacity-60"
                            }`}
                          >
                            {cell.owner === null ? (
                              <span className="text-sm md:text-lg font-heading font-black text-gray-300 group-hover:text-[#8b5cf6]">
                                +
                              </span>
                            ) : (
                              <div className="text-center w-full min-w-0 px-1">
                                <span className="block font-heading font-black text-[10px] md:text-xs uppercase truncate">
                                  {cell.character?.name}
                                </span>
                                <span className="block font-mono text-[8px] md:text-[10px] opacity-75 truncate">
                                  {cell.character?.crew}
                                </span>
                              </div>
                            )}

                            {cell.owner !== null && (
                              <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${
                                cell.owner === 1 ? "bg-blue-300" : "bg-red-300"
                              }`} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}

              </div>
            )}

            {activeOnlineGameId && currentPlayer !== myRole && !winner && (
              <div className="mt-4 p-4 bg-indigo-50 text-indigo-900 border border-indigo-100 rounded-2xl flex items-center gap-3 max-w-sm">
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full shrink-0" />
                <p className="text-xs font-semibold">
                  C'est au tour de l'adversaire de jouer. Attente de la transmission de son coup...
                </p>
              </div>
            )}

          </div>

        </div>
      )}

      {/* MODAL DIALOG : Saisie de la proposition pour la capture */}
      <AnimatePresence>
        {selectedCellIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-lg w-full border border-gray-100 shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedCellIndex(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold font-heading text-gray-900 mb-1 uppercase tracking-wide">CAPTURER L'INTERSECTION</h3>
              <p className="text-xs text-gray-500 mb-6 font-medium">
                Saisissez un personnage d'One Piece répondant aux critères :
                <span className="block mt-1 font-heading text-xs text-[#8b5cf6] font-extrabold uppercase bg-violet-50/50 p-2 rounded-lg">
                  {CATEGORIES[rowKeys[getCellCoords(selectedCellIndex).rowIndex]].label} &times; {CATEGORIES[columnKeys[getCellCoords(selectedCellIndex).colIndex]].label}
                </span>
              </p>

              <div className="relative mb-6">
                <div className="bg-white border-2 border-slate-200 focus-within:border-[#8b5cf6] rounded-xl p-2.5 flex items-center gap-2">
                  <Play className="w-4 h-4 text-gray-400 ml-1 shrink-0" />
                  <input
                    type="text"
                    placeholder="Saisissez son nom exact (Ex: Luffy, Zoro, Shanks, ...) "
                    value={searchQuery}
                    onChange={handleSearchQueryChange}
                    onKeyDown={handleKeyDown}
                    className="flex-1 text-xs md:text-sm font-semibold outline-hidden text-gray-950 placeholder-gray-400 border-none"
                    autoFocus
                  />
                </div>

                <AnimatePresence>
                  {suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-gray-50"
                    >
                      {suggestions.map((char, idx) => {
                        const alreadyGuessed = usedCharacterIds.has(char.id) || board.some(cell => {
                          if (!cell || !cell.character) return false;
                          const boardNameNorm = cell.character.name.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
                          const selNameNorm = char.name.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
                          return cell.character.id === char.id || boardNameNorm === selNameNorm;
                        });
                        const isActive = idx === activeSuggestionIndex;
                        return (
                          <button
                            key={char.id}
                            onClick={() => !alreadyGuessed && submitAnswer(char)}
                            disabled={alreadyGuessed}
                            className={`w-full text-left p-2.5 flex items-center gap-3 transition-all ${
                              alreadyGuessed 
                                ? "opacity-35 bg-gray-50" 
                                : isActive 
                                  ? "bg-violet-50 border-l-4 border-violet-500 font-bold" 
                                  : "hover:bg-slate-50 cursor-pointer"
                            }`}
                          >
                            <img 
                              src={char.image} 
                              alt={char.name} 
                              className="w-8 h-8 rounded-full object-cover border bg-slate-100"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(char.name)}&backgroundColor=b59a7c`;
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-heading font-bold text-[#0f172a] text-xs truncate">{char.name}</p>
                              <p className="text-[10px] text-gray-400 font-mono truncate font-semibold">{char.crew}</p>
                            </div>
                            <span className="text-[10px] font-heading font-black text-violet-600 uppercase">
                              {alreadyGuessed ? "Déjà Posé" : "Choisir"}
                            </span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {feedback && feedback.isError && (
                <div className="p-3 bg-red-50 text-red-800 rounded-xl flex items-center gap-2 text-xs border border-red-100">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="font-bold">{feedback.message}</span>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

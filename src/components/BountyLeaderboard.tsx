import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Trophy, Search, Award, Crown, RefreshCw, Sparkles, UserCheck, 
  Coins, HelpCircle, Flame, ArrowUpRight, ShieldCheck, Zap, Compass, X, Check
} from "lucide-react";
import { BountyRank } from "../types";
import { collection, getDocs, query, onSnapshot, doc, updateDoc, getDoc, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useEffect } from "react";

export interface LeaderboardEntry {
  username: string;
  bounty: number;
  avatar: string;
  email?: string;
  isRival: boolean;
  isCurrentUser: boolean;
  gridWins?: number;
  gridLosses?: number;
  trackerWins?: number;
  duelHigh?: number;
}

interface BountyLeaderboardProps {
  leaderboardList: LeaderboardEntry[];
  playerRank: BountyRank;
  playerRankNumber: number;
  loading: boolean;
  onRefresh: () => void;
  playerUsername?: string;
  playerAvatar?: string;
  playerBounty?: number;
  totalUsers?: number;
}

export default function BountyLeaderboard({
  leaderboardList,
  playerRank,
  playerRankNumber,
  loading,
  onRefresh,
  playerUsername,
  playerAvatar,
  playerBounty,
  totalUsers = 0
}: BountyLeaderboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [leaderboardTab, setLeaderboardTab] = useState<"players" | "crews">("players");
  const [crews, setCrews] = useState<any[]>([]);
  const [crewsLoading, setCrewsLoading] = useState(false);
  const [crewSearchQuery, setCrewSearchQuery] = useState("");
  const [selectedCrew, setSelectedCrew] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  const playerEmail = localStorage.getItem("firebaseUserEmail");

  // Écouter le profil utilisateur pour savoir s'il a déjà un équipage ou non
  useEffect(() => {
    if (!playerEmail) return;

    const userDocRef = doc(db, "users", playerEmail);
    const unsubscribe = onSnapshot(userDocRef, (snap) => {
      if (snap.exists()) {
        setUserProfile(snap.data());
      } else {
        setUserProfile(null);
      }
    }, (error) => {
      console.warn("[Firebase Quota] Erreur du listener d'état de profil dans Leaderboard :", error.message || error);
    });
    return () => unsubscribe();
  }, [playerEmail]);

  // S'il y a un selectedCrew de chargé, on peut aussi l'écouter en temps réel !
  useEffect(() => {
    if (!selectedCrew) return;

    const crewDocRef = doc(db, "crews", selectedCrew.id);
    const unsubscribe = onSnapshot(crewDocRef, (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setSelectedCrew({
          id: snap.id,
          name: d.name,
          description: d.description,
          creatorEmail: d.creatorEmail,
          emblem: d.emblem,
          accessType: d.accessType,
          minBounty: d.minBounty || 0,
          members: d.members || [],
          totalBounty: d.totalBounty || 0,
          applications: d.applications || []
        });
      }
    }, (error) => {
      console.warn("[Firebase Quota] Erreur du listener d'équipage sélectionné dans Leaderboard :", error.message || error);
    });
    return () => unsubscribe();
  }, [selectedCrew?.id]);

  const loadLeaderboardCrews = async () => {
    setCrewsLoading(true);
    try {
      const q = query(collection(db, "crews"), orderBy("totalBounty", "desc"), limit(100));
      const snap = await getDocs(q);
      const list: any[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          name: d.name,
          description: d.description,
          creatorEmail: d.creatorEmail,
          emblem: d.emblem,
          accessType: d.accessType,
          minBounty: d.minBounty || 0,
          members: d.members || [],
          totalBounty: d.totalBounty || 0,
          applications: d.applications || []
        });
      });
      list.sort((a, b) => b.totalBounty - a.totalBounty);
      setCrews(list);
    } catch (err) {
      console.error(err);
    } finally {
      setCrewsLoading(false);
    }
  };

  // Rejoindre directement un équipage Open
  const handleJoinCrewOpen = async (crew: any) => {
    if (!playerEmail) {
      alert("Vous devez être connecté pour rejoindre un équipage !");
      return;
    }
    if (userProfile?.crewId) {
      alert("Vous faites déjà partie d'un équipage !");
      return;
    }

    if (crew.members.length >= 20) {
      alert("Cet équipage est complet (20 membres max) !");
      return;
    }

    const bounty = playerBounty || 0;
    if (bounty < (crew.minBounty || 0)) {
      alert(`Votre prime (${bounty.toLocaleString()} ฿) est inférieure au minimum de ${crew.minBounty.toLocaleString()} ฿.`);
      return;
    }

    try {
      const newMemberObj = {
        email: playerEmail,
        name: playerUsername || "Pirate Mystère",
        avatar: playerAvatar || "",
        bounty: bounty,
        role: "mousse"
      };
      const updatedMembers = [...crew.members, newMemberObj];
      const newTotal = (crew.totalBounty || 0) + bounty;

      await updateDoc(doc(db, "crews", crew.id), {
        members: updatedMembers,
        totalBounty: newTotal
      });

      await updateDoc(doc(db, "users", playerEmail), {
        crewId: crew.id,
        crewName: crew.name
      });

      alert(`Félicitations ! Vous avez rejoint l'équipage : ${crew.name} !`);
      
      const updatedCrew = { ...crew, members: updatedMembers, totalBounty: newTotal };
      setSelectedCrew(updatedCrew);
      loadLeaderboardCrews();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'intégration à l'équipage.");
    }
  };

  // Postuler à un équipage sur invitation
  const handleApplyToCrew = async (crew: any) => {
    if (!playerEmail) {
      alert("Vous devez être connecté pour postuler !");
      return;
    }
    if (userProfile?.crewId) {
      alert("Vous faites déjà partie d'un équipage !");
      return;
    }

    const currentApps = crew.applications || [];
    if (currentApps.some((app: any) => app.email === playerEmail)) {
      alert("Vous avez déjà une candidature en attente pour cet équipage.");
      return;
    }

    try {
      const bounty = playerBounty || 0;
      const newAppObj = {
        email: playerEmail,
        name: playerUsername || "Pirate Mystère",
        avatar: playerAvatar || "",
        bounty: bounty
      };
      
      const updatedApps = [...currentApps, newAppObj];

      await updateDoc(doc(db, "crews", crew.id), {
        applications: updatedApps
      });

      alert(`Votre candidature a bien été envoyée à l'équipage : ${crew.name}. Un officier va l'étudier !`);

      const updatedCrew = { ...crew, applications: updatedApps };
      setSelectedCrew(updatedCrew);
      loadLeaderboardCrews();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'envoi de la candidature.");
    }
  };

  // Quitter son équipage actuel directement depuis le classement/modal
  const handleLeaveCurrentCrew = async () => {
    if (!playerEmail || !userProfile?.crewId) return;

    if (confirm(`Voulez-vous vraiment quitter votre équipage actuel "${userProfile.crewName || "Équipage"}" ?`)) {
      try {
        const crewDocRef = doc(db, "crews", userProfile.crewId);
        const crewSnap = await getDoc(crewDocRef);
        
        if (crewSnap.exists()) {
          const crewData = crewSnap.data();
          
          if (crewData.creatorEmail === playerEmail) {
            alert("En tant que capitaine, vous ne pouvez pas simplement abandonner votre navire ! Dissolvez votre équipage depuis l'onglet ÉQUIPAGE ou transférez d'abord la couronne.");
            return;
          }

          const updatedMembers = (crewData.members || []).filter((m: any) => m.email !== playerEmail);
          const newTotal = (crewData.totalBounty || 0) - (playerBounty || 0);

          await updateDoc(crewDocRef, {
            members: updatedMembers,
            totalBounty: newTotal >= 0 ? newTotal : 0
          });
        }

        await updateDoc(doc(db, "users", playerEmail), {
          crewId: null,
          crewName: null
        });

        alert("Vous avez bien quitté votre équipage.");
        loadLeaderboardCrews();
        if (selectedCrew && selectedCrew.id === userProfile.crewId) {
          // Update selectedCrew representation if it was opened
          setSelectedCrew(null);
        }
      } catch (err) {
        console.error(err);
        alert("Erreur lors de la sortie de l'équipage.");
      }
    }
  };

  useEffect(() => {
    if (leaderboardTab === "crews") {
      loadLeaderboardCrews();
    }
  }, [leaderboardTab]);

  const filteredCrews = useMemo(() => {
    return crews.filter(c => 
      c.name.toLowerCase().includes(crewSearchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(crewSearchQuery.toLowerCase())
    );
  }, [crews, crewSearchQuery]);

  // Formatage des nombres
  const formatBounty = (num: number) => {
    return num.toLocaleString("fr-FR") + " ฿";
  };

  // Trouver l'utilisateur juste au-dessus du joueur actuel pour la gamification
  const targetNextRival = useMemo(() => {
    const playerIdx = leaderboardList.findIndex(item => item.isCurrentUser);
    if (playerIdx > 0) {
      return {
        rival: leaderboardList[playerIdx - 1],
        difference: leaderboardList[playerIdx - 1].bounty - leaderboardList[playerIdx].bounty + 1
      };
    }
    return null;
  }, [leaderboardList]);

  // Associer un titre de rang dynamique selon l'index
  const getRankTitle = (index: number): BountyRank => {
    if (index === 0) return "Roi des pirates";
    if (index <= 4) return "Yonko";
    if (index <= 11) return "Shishibukai";
    if (index <= 22) return "Supernova";
    if (index <= 30) return "Second d'empereur";
    if (index <= 46) return "Commandant d'empereur";
    if (index <= 69) return "Combattant de l'équipage";
    if (index <= 99) return "Membre de l'équipage";
    if (index <= 149) return "Chasseur de prime";
    return "Mousse";
  };

  // Badge couleur pour chaque titre
  const getBadgeColor = (title: BountyRank) => {
    switch (title) {
      case "Roi des pirates":
        return "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-[0_0_12px_rgba(245,158,11,0.5)] border-amber-300 animate-pulse";
      case "Yonko":
        return "bg-rose-500/20 text-rose-300 border-rose-500/50 font-black shadow-[0_0_8px_rgba(244,63,94,0.2)]";
      case "Shishibukai":
        return "bg-indigo-500/20 text-indigo-300 border-indigo-500/50 font-extrabold";
      case "Supernova":
        return "bg-teal-500/20 text-teal-300 border-teal-500/40 font-bold";
      case "Second d'empereur":
        return "bg-violet-500/20 text-violet-300 border-violet-500/40";
      case "Commandant d'empereur":
        return "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40";
      case "Combattant de l'équipage":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "Membre de l'équipage":
        return "bg-sky-500/20 text-sky-200 border-sky-500/30";
      case "Chasseur de prime":
        return "bg-amber-500/10 text-amber-400/90 border-amber-500/20";
      case "Mousse":
      default:
        return "bg-slate-800 text-slate-400 border-slate-700/60";
    }
  };

  // Filtrer la liste
  const filteredList = useMemo(() => {
    return leaderboardList
      .map((item, index) => ({ ...item, assignedRankTitle: getRankTitle(index), globalIndex: index }))
      .filter((item) => {
        // Filtre recherche par nom
        return item.username.toLowerCase().includes(searchQuery.toLowerCase());
      });
  }, [leaderboardList, searchQuery]);

  // Top 3 pour les bannières illustrées
  const topThree = useMemo(() => {
    return leaderboardList.slice(0, 3).map((item, index) => ({
      ...item,
      assignedRankTitle: getRankTitle(index),
      rank: index + 1
    }));
  }, [leaderboardList]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6" id="bounty-leaderboard-panel">
      
      {/* HEADER SECTION - BANNER */}
      <div className="relative rounded-3xl overflow-hidden border border-violet-500/20 bg-gradient-to-or from-[#121124] to-[#1a1835] p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-cyan-600/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 text-[10px] font-bold tracking-widest text-[#F8FAFC] uppercase bg-violet-600 rounded-full flex items-center gap-1 shadow-md shadow-violet-900/30">
                <Crown className="w-3 h-3 text-amber-300" /> CLASSEMENT GLOBAL
              </span>
              <span className="text-xs text-slate-400 font-mono">Real-time / Descente</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-heading font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-violet-300 uppercase">
              La Hiérarchie des Primes
            </h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
              Mesurez-vous à l'ensemble de la communauté de Grand Line Hub ainsi qu'aux plus grands monstres de l'ère pirate. Améliorez votre prime en résolvant des énigmes ou en dominant la grille !
            </p>
          </div>

          {/* Sync Button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="self-start md:self-center px-4 py-2.5 rounded-xl border border-violet-500/20 bg-white/5 hover:bg-white/10 active:scale-95 text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2 text-violet-300 shrink-0 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
            <span>{loading ? "Chargement..." : "Rafraîchir"}</span>
          </button>
        </div>

        {/* STATS HERO DU JOUEUR */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800">
          
          <div className="flex items-center gap-4 bg-slate-950/40 rounded-2xl p-4 border border-white/5">
            <div className="relative">
              <img 
                src={leaderboardList.find(i => i.isCurrentUser)?.avatar || "https://api.dicebear.com/7.x/pixel-art/svg?seed=guest"} 
                alt="Votre avatar"
                className="w-14 h-14 rounded-xl border-2 border-violet-400/50 bg-[#0c0d19] shadow-lg shadow-violet-900/10 object-cover"
              />
              <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-violet-600 border border-violet-400 text-[10px] font-black flex items-center justify-center text-white shadow-md">
                #{playerRankNumber}
              </span>
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-widest text-[#F8FAFC]/60 uppercase">VOTRE STATUT ACTUEL</div>
              <h3 className="text-lg font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-violet-200 to-white">{leaderboardList.find(i => i.isCurrentUser)?.username}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`text-[9px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-md border leading-none ${getBadgeColor(playerRank)}`}>
                  {playerRank}
                </span>
                <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1 bg-amber-400/5 px-2 py-0.5 rounded border border-amber-400/20">
                  <Coins className="w-3 h-3 text-amber-400 shrink-0" />
                  {formatBounty(leaderboardList.find(i => i.isCurrentUser)?.bounty || 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/40 rounded-2xl p-4 border border-white/5 flex flex-col justify-center">
            {targetNextRival ? (
              <div className="space-y-1">
                <div className="text-[10px] font-extrabold tracking-widest text-cyan-400 uppercase flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" /> PROCHAINE CIBLE
                </div>
                <p className="text-xs text-slate-300">
                  Dépassez <strong className="text-white">{targetNextRival.rival.username}</strong> ({formatBounty(targetNextRival.rival.bounty)})
                </p>
                <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5 pt-1">
                  <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  <span>Seulement <strong className="text-emerald-400 font-extrabold">{formatBounty(targetNextRival.difference)}</strong> de plus requis !</span>
                </div>
              </div>
            ) : (
              <div className="space-y-1 py-1 flex flex-col items-center justify-center text-center">
                <Crown className="w-5 h-5 text-amber-400 animate-bounce" />
                <p className="text-xs font-bold text-amber-300">Incroyable ! Vous êtes le Roi des Pirates et dominez le monde !</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* BANNER TAB SELECTOR */}
      <div className="flex bg-[#121124] p-1 rounded-2xl max-w-sm w-full mx-auto md:mx-0 border border-slate-800/80 mb-6 font-sans">
        <button
          onClick={() => setLeaderboardTab("players")}
          className={`flex-1 py-1 px-3.5 rounded-xl text-[10px] md:text-xs font-heading font-black uppercase text-center transition cursor-pointer flex items-center justify-center gap-1.5 ${
            leaderboardTab === "players" 
              ? "bg-violet-900 text-white font-extrabold border border-violet-500" 
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          👤 Pirates
        </button>
        <button
          onClick={() => setLeaderboardTab("crews")}
          className={`flex-1 py-1 px-3.5 rounded-xl text-[10px] md:text-xs font-heading font-black uppercase text-center transition cursor-pointer flex items-center justify-center gap-1.5 ${
            leaderboardTab === "crews" 
              ? "bg-violet-900 text-white font-extrabold border border-violet-500" 
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          🏴‍☠️ Équipages
        </button>
      </div>

      {leaderboardTab === "players" ? (
        <>
          {/* TOP 3 PODIUM PICTORIAL */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end pt-4">
        
        {/* En deuxième position */}
        {topThree[1] && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#121124] border border-slate-800 rounded-3xl p-5 text-center flex flex-col items-center order-2 sm:order-1 relative shadow-xl"
          >
            <div className="absolute top-3 left-3 w-7 h-7 bg-slate-800 border border-slate-700 rounded-full font-black text-xs text-slate-300 flex items-center justify-center shadow-md">
              2
            </div>
            <div className="relative my-2">
              <img 
                src={topThree[1].avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(topThree[1].username)}`} 
                alt={topThree[1].username}
                className="w-16 h-16 rounded-2xl border-2 border-slate-400 object-cover bg-slate-900"
              />
              <span className="absolute -bottom-1 right-0 px-1.5 py-0.5 rounded-md bg-slate-400 text-[8px] text-slate-950 font-black">
                SILVER
              </span>
            </div>
            <h4 className="font-bold text-sm truncate max-w-[130px] text-slate-200 mt-2">{topThree[1].username}</h4>
            <span className={`text-[8px] px-2 py-0.5 rounded-md mt-1 border leading-none font-bold scale-90 ${getBadgeColor(topThree[1].assignedRankTitle as BountyRank)}`}>
              {topThree[1].assignedRankTitle}
            </span>
            <div className="text-[#FFD700] font-mono text-xs font-extrabold mt-2 bg-[#FFD700]/5 px-2.5 py-0.5 rounded-full border border-[#FFD700]/10">
              {formatBounty(topThree[1].bounty)}
            </div>
          </motion.div>
        )}

        {/* Le premier rang - ROI DES PIRATES */}
        {topThree[0] && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-or from-[#1e1b4b]/80 to-[#311152]/80 border-2 border-amber-500 rounded-3xl p-6 text-center flex flex-col items-center order-1 sm:order-2 shadow-2xl relative min-h-[220px]"
          >
            <Crown className="w-8 h-8 text-amber-400 absolute -top-5 animate-bounce drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]" />
            <div className="absolute top-3 left-3 w-8 h-8 bg-amber-500 border border-amber-400 rounded-full font-black text-xs text-slate-950 flex items-center justify-center shadow-lg shadow-amber-900/20">
              1
            </div>
            <div className="relative my-3">
              <img 
                src={topThree[0].avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(topThree[0].username)}`} 
                alt={topThree[0].username}
                className="w-20 h-20 rounded-2xl border-2 border-amber-400 object-cover bg-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
              />
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-md bg-amber-400 text-[8px] text-slate-950 font-black tracking-widest uppercase">
                CHAMPION
              </span>
            </div>
            <h4 className="font-black text-base truncate max-w-[180px] text-amber-200 mt-1">{topThree[0].username}</h4>
            <span className={`text-[8px] tracking-wider uppercase px-2.5 py-0.5 rounded-md mt-1 border leading-none font-bold ${getBadgeColor(topThree[0].assignedRankTitle as BountyRank)}`}>
              {topThree[0].assignedRankTitle}
            </span>
            <div className="text-amber-300 font-mono text-xs font-black mt-2.5 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 shadow-md">
              {formatBounty(topThree[0].bounty)}
            </div>
          </motion.div>
        )}

        {/* En troisième position */}
        {topThree[2] && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#121124] border border-slate-800 rounded-3xl p-5 text-center flex flex-col items-center order-3 relative shadow-xl"
          >
            <div className="absolute top-3 left-3 w-7 h-7 bg-amber-800/20 border border-amber-800/40 rounded-full font-black text-xs text-amber-600 flex items-center justify-center shadow-md">
              3
            </div>
            <div className="relative my-2">
              <img 
                src={topThree[2].avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(topThree[2].username)}`} 
                alt={topThree[2].username}
                className="w-16 h-16 rounded-2xl border-2 border-amber-800 object-cover bg-slate-900"
              />
              <span className="absolute -bottom-1 right-0 px-1.5 py-0.5 rounded-md bg-amber-800 text-[8px] text-amber-100 font-black">
                BRONZE
              </span>
            </div>
            <h4 className="font-bold text-sm truncate max-w-[130px] text-slate-200 mt-2">{topThree[2].username}</h4>
            <span className={`text-[8px] px-2 py-0.5 rounded-md mt-1 border leading-none font-bold scale-90 ${getBadgeColor(topThree[2].assignedRankTitle as BountyRank)}`}>
              {topThree[2].assignedRankTitle}
            </span>
            <div className="text-amber-600 font-mono text-xs font-extrabold mt-2 bg-amber-800/5 px-2.5 py-0.5 rounded-full border border-[#FFD700]/10">
              {formatBounty(topThree[2].bounty)}
            </div>
          </motion.div>
        )}

      </div>

      {/* FILTER BUTTONS & SEARCH TAB */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        
        <div className="flex flex-col gap-0.5 px-1">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-bold tracking-wider text-slate-300 uppercase">
              TOP 150 ({totalUsers > 0 ? totalUsers : "..."} JOUEURS)
            </span>
          </div>
          {playerRankNumber > 0 && (
            <span className="text-[10px] text-violet-300/80 font-mono tracking-widest pl-6 uppercase">
              Votre Classement: #{playerRankNumber}
            </span>
          )}
        </div>

        {/* Input Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-[50%] -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un pirate..."
            className="w-full pl-10 pr-4 py-2 bg-[#0c0d19] border border-white/5 rounded-xl text-xs text-[#F8FAFC] placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all text-left"
          />
        </div>

      </div>

      {/* LEADERBOARD LIST CONTAINER */}
      <div className="bg-[#121124] rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-900/50 border-b border-slate-800 grid grid-cols-12 gap-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase font-heading">
          <span className="col-span-2 sm:col-span-1 text-center">Rang</span>
          <span className="col-span-7 sm:col-span-5 md:col-span-6 pl-2">Nom de Pirate</span>
          <span className="col-span-3 text-center hidden sm:block">Titre de prime</span>
          <span className="col-span-3 text-right">Prime (Berries)</span>
        </div>

        <div className="divide-y divide-slate-800/50 max-h-[500px] overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {filteredList.length === 0 ? (
              <div className="text-center py-12 text-slate-500 flex flex-col items-center justify-center gap-2">
                <HelpCircle className="w-8 h-8 text-slate-600" />
                <p className="text-sm font-semibold">Aucun corsaire ne correspond aux critères.</p>
                <p className="text-xs">Essayez d'ajuster votre recherche ou filtre.</p>
              </div>
            ) : (
              filteredList.map((player) => {
                const rankNum = player.globalIndex + 1;
                const isCurrentUser = player.isCurrentUser;
                
                return (
                  <motion.div
                    key={player.email || `${player.username}-${player.globalIndex}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`grid grid-cols-12 gap-2 items-center py-3 px-4 font-sans transition-all ${
                      isCurrentUser 
                        ? "bg-violet-900/15 border-y border-violet-500/20 active:bg-violet-900/20" 
                        : "hover:bg-white/[0.01]"
                    }`}
                  >
                    {/* Position */}
                    <div className="col-span-2 sm:col-span-1 flex justify-center items-center">
                      {rankNum === 1 ? (
                        <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center shadow shadow-amber-900/30">
                          1
                        </span>
                      ) : rankNum === 2 ? (
                        <span className="w-6 h-6 rounded-full bg-slate-400 text-slate-950 text-xs font-black flex items-center justify-center shadow shadow-slate-900/30">
                          2
                        </span>
                      ) : rankNum === 3 ? (
                        <span className="w-6 h-6 rounded-full bg-yellow-800/80 text-white text-xs font-black flex items-center justify-center shadow shadow-amber-950/30">
                          3
                        </span>
                      ) : (
                        <span className="text-xs font-mono font-bold text-slate-400">
                          #{rankNum}
                        </span>
                      )}
                    </div>

                    {/* Name & Avatar */}
                    <div className="col-span-7 sm:col-span-5 md:col-span-6 flex items-center gap-3 pl-2 truncate font-heading">
                      <img
                        src={player.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(player.username)}`}
                        alt={player.username}
                        className={`w-8 h-8 rounded-lg bg-slate-900 object-cover shrink-0 ${
                          isCurrentUser 
                            ? "border border-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.3)]" 
                            : "border border-slate-700/60"
                        }`}
                      />
                      <div className="truncate flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-black leading-tight truncate uppercase ${isCurrentUser ? "text-violet-200" : "text-slate-100"}`}>
                            {player.username}
                          </span>
                          {isCurrentUser && (
                            <span className="px-1.5 py-0.5 text-[7px] font-black tracking-wider uppercase text-slate-950 bg-violet-400 rounded">
                              VOUS
                            </span>
                          )}
                          {player.isRival && (
                            <span className="px-1 text-[7px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded">
                              IA
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="col-span-3 justify-center hidden sm:flex">
                      <span className={`text-[9px] tracking-wide uppercase px-2 py-0.5 rounded-md border leading-none font-extrabold shadow-sm ${getBadgeColor(player.assignedRankTitle as BountyRank)}`}>
                        {player.assignedRankTitle}
                      </span>
                    </div>

                    {/* Bounty */}
                    <div className="col-span-3 text-right font-mono font-black text-[10px] sm:text-xs text-amber-400 flex items-center justify-end gap-1.5">
                      <Coins className="w-3 h-3 text-amber-400 opacity-70 shrink-0" />
                      <span>{formatBounty(player.bounty)}</span>
                    </div>

                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
      </>
      ) : (
        <div className="bg-[#121124] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 font-sans text-left animate-in fade-in duration-300">
          <div className="flex items-center gap-3 bg-slate-950/40 p-3.5 border border-slate-800/80 rounded-2xl">
            <Search className="w-4 h-4 text-violet-400 shrink-0" />
            <input
              type="text"
              placeholder="Rechercher un équipage pirate par son nom ou sa devise..."
              value={crewSearchQuery}
              onChange={(e) => setCrewSearchQuery(e.target.value)}
              className="w-full bg-transparent outline-none text-xs text-slate-100 placeholder-slate-500 font-sans"
            />
            <button 
              onClick={loadLeaderboardCrews}
              className="p-1 px-3 bg-violet-900 hover:bg-violet-800 text-white border border-violet-500/30 rounded-lg text-[10px] font-mono uppercase font-black cursor-pointer tracking-wider shrink-0"
            >
              Actualiser 🔄
            </button>
          </div>

          <div className="bg-slate-950/20 rounded-2xl border border-slate-800/60 overflow-hidden">
            <div className="p-4 bg-slate-900/40 border-b border-slate-800/60 flex items-center justify-between">
              <h5 className="font-heading font-black text-slate-200 text-xs uppercase tracking-wider">Classement Général des Équipages</h5>
              <span className="text-[10px] font-mono font-bold text-violet-400 lowercase">{filteredCrews.length} équipages</span>
            </div>

            <div className="divide-y divide-slate-800/50 max-h-[600px] overflow-y-auto custom-scrollbar">
              {crewsLoading ? (
                <div className="text-center py-16 text-slate-400 font-mono text-xs">
                  Chargement du classement de la piraterie...
                </div>
              ) : filteredCrews.length === 0 ? (
                <div className="py-16 text-center text-slate-500 font-mono text-xs">
                  <Compass className="w-8 h-8 mx-auto mb-2 text-slate-650 shrink-0" />
                  Aucun équipage trouvé pour cette recherche.
                </div>
              ) : (
                filteredCrews.map((crew, idx) => {
                  const rankLevel = idx + 1;
                  let rankBadge = `${rankLevel}`;
                  if (rankLevel === 1) rankBadge = "🥇";
                  else if (rankLevel === 2) rankBadge = "🥈";
                  else if (rankLevel === 3) rankBadge = "🥉";

                  return (
                    <div 
                      key={crew.id} 
                      onClick={() => setSelectedCrew(crew)}
                      className="p-4 flex items-center justify-between gap-4 hover:bg-white/[0.05] cursor-pointer transition-all flex-wrap sm:flex-nowrap"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="font-heading font-black text-sm text-[#F8FAFC] w-6 text-center select-none shrink-0">
                          {rankLevel <= 3 ? rankBadge : `#${rankLevel}`}
                        </span>
                        {crew.emblem && crew.emblem.startsWith("http") ? (
                          <img 
                            src={crew.emblem} 
                            alt="Emblème" 
                            className="w-10 h-10 object-contain select-none shrink-0 rounded bg-slate-900/40 p-0.5 border border-slate-800"
                            referrerPolicy="no-referrer" 
                          />
                        ) : (
                          <span className="text-3xl select-none shrink-0">{crew.emblem || "🏴‍☠️"}</span>
                        )}
                        <div className="min-w-0">
                          <h6 className="font-heading font-black text-slate-100 text-xs uppercase tracking-tight truncate flex items-center gap-2">
                            {crew.name}
                            <span className="font-mono text-[9px] text-slate-500 normal-case">({crew?.members?.length || 0}/20 membres)</span>
                          </h6>
                          <p className="text-[10px] text-slate-400 italic truncate max-w-sm">"{crew.description}"</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <span className="block text-[9px] uppercase font-mono font-bold text-slate-500">PRIME GLOBALE</span>
                          <span className="font-mono font-black text-xs text-amber-500 block">฿ {crew.totalBounty.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* GAME EXPLANATION FOOTER CARD */}
      <div className="p-5 rounded-3xl border border-slate-800 bg-[#0e0c1b]/80 flex gap-4 items-start">
        <Zap className="w-6 h-6 text-violet-400 shrink-0 mt-1" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-100 uppercase font-heading">Lois de la Grand Line</h4>
          <p className="text-xs text-slate-400">
            Le classement de Grand Line Hub synchronise périodiquement votre score si vous êtes connecté à un profil de pirate. Les titres sont calculés en temps réel en classant toutes les primes dans l'ordre décroissant de magnitude.
            Plus vous résolvez des mystères de détective du Log Pose ou maîtrisez la bataille de statistiques, plus votre prime prend d'ampleur historique et élève votre équipage vers de légendaires sommets !
          </p>
        </div>
      </div>

      {/* Modal Détails Équipage */}
      {selectedCrew && (
        <div className="fixed inset-0 modal-overlay-backdrop backdrop-blur-md flex items-center justify-center z-[110] p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#121124] rounded-3xl w-full max-w-xl border border-slate-700/60 flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                {selectedCrew.emblem && selectedCrew.emblem.startsWith("http") ? (
                  <img
                    src={selectedCrew.emblem}
                    alt="Drapeau"
                    className="w-12 h-12 object-contain rounded-xl bg-slate-900 border border-slate-800 p-1"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-4xl">{selectedCrew.emblem || "🏴‍☠️"}</span>
                )}
                <div className="text-left">
                  <h4 className="font-heading font-black text-slate-100 text-sm uppercase tracking-wide leading-tight">
                    {selectedCrew.name}
                  </h4>
                  <p className="text-[10px] text-violet-400 font-mono font-bold tracking-widest uppercase mt-0.5">
                    {selectedCrew.accessType === "open" ? (selectedCrew.minBounty > 0 ? `฿ ${selectedCrew.minBounty.toLocaleString()} MIN` : "OUVERT") : "SUR INVITATION"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCrew(null)}
                className="p-1.5 rounded-xl hover:bg-slate-850 text-slate-400 hover:text-slate-200 transition cursor-pointer font-sans"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Corps */}
            <div className="p-6 overflow-y-auto max-h-[50vh] custom-scrollbar space-y-6 text-left">
              {/* Devise */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-mono tracking-widest font-extrabold text-[#747474]">Devise de l'Équipage</span>
                <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-950/40 p-3 rounded-xl border border-slate-800/50">
                  "{selectedCrew.description || "Pas de description renseignée."}"
                </p>
              </div>

              {/* Stats rapides */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-slate-950/30 p-3 rounded-xl border border-slate-800/40">
                  <span className="text-[9px] font-mono text-[#a5a5a5] block font-bold uppercase">Membres</span>
                  <span className="text-sm font-heading font-black text-slate-200">{selectedCrew.members?.length || 0} / 20</span>
                </div>
                <div className="bg-slate-950/30 p-3 rounded-xl border border-slate-800/40">
                  <span className="text-[9px] font-mono text-[#a5a5a5] block font-bold uppercase">Prime Cumulative</span>
                  <span className="text-sm font-heading font-black text-amber-500">฿ {selectedCrew.totalBounty?.toLocaleString()}</span>
                </div>
              </div>

              {/* Membres et leurs rôles */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-mono tracking-widest font-extrabold text-[#747474] block">L'ÉQUIPAGE DU NAVIRE ({selectedCrew.members?.length || 0})</span>
                <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar">
                  {selectedCrew.members?.map((member: any, idx: number) => {
                    const isCreator = member.email === selectedCrew.creatorEmail;
                    const rawRole = member.role || (isCreator ? "Capitaine" : "mousse");
                    
                    // Rendu joli des rôles
                    let roleBadgeColor = "bg-slate-850 text-slate-400 border-slate-855";
                    if (rawRole === "Capitaine") {
                      roleBadgeColor = "bg-amber-500/15 text-amber-500 border-amber-500/25 font-black uppercase";
                    } else if (rawRole === "Second") {
                      roleBadgeColor = "bg-violet-500/15 text-violet-300 border-violet-500/25 font-extrabold uppercase";
                    } else if (rawRole !== "mousse") {
                      roleBadgeColor = "bg-emerald-500/15 text-emerald-300 border-emerald-500/20";
                    }

                    return (
                      <div key={idx} className="p-3 bg-slate-950/20 border border-slate-800/40 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={member.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(member.name)}`}
                            alt={member.name}
                            className="w-8 h-8 rounded-lg object-cover bg-slate-900 border border-slate-800"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-250 truncate uppercase flex items-center gap-1.5">
                              {member.name}
                              {isCreator && <span className="text-amber-550">👑</span>}
                            </p>
                            <p className="text-[9px] font-mono text-amber-600">฿ {member.bounty?.toLocaleString()}</p>
                          </div>
                        </div>
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${roleBadgeColor}`}>
                          {rawRole}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer / Boutons Actions de Recrutement */}
            <div className="p-6 bg-slate-950/40 border-t border-slate-800/80 flex gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedCrew(null)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-750 border border-slate-700/60 rounded-xl text-xs font-black uppercase tracking-wider text-slate-300 transition duration-150 cursor-pointer text-center"
              >
                Fermer
              </button>

              {/* Bouton de recrutement/adhésion */}
              {(() => {
                if (!playerEmail) {
                  return (
                    <div className="w-full text-center text-[10px] text-slate-500 uppercase font-mono mt-2 flex items-center justify-center gap-2">
                      ⚠️ Connectez-vous sur votre compte pour rejoindre cet équipage
                    </div>
                  );
                }

                // Si déjà membre de cet équipage
                const isMemberOfThisCrew = selectedCrew.members.some((m: any) => m.email === playerEmail);
                if (isMemberOfThisCrew) {
                  return (
                    <span className="flex-1 py-3 bg-emerald-500/10 border border-emerald-300 text-emerald-400 rounded-xl text-xs font-black uppercase tracking-widest text-center flex items-center justify-center">
                      ✓ Déjà à Bord !
                    </span>
                  );
                }

                // Si déjà membre d'un autre équipage
                if (userProfile?.crewId) {
                  return (
                    <button
                      type="button"
                      onClick={handleLeaveCurrentCrew}
                      className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer text-center border border-red-500/50"
                    >
                      Quitter mon équipage actuel ⚓
                    </button>
                  );
                }

                // Limite de 20 membres
                if (selectedCrew.members.length >= 20) {
                  return (
                    <span className="flex-1 py-3 bg-red-500/10 text-red-400 rounded-xl text-xs font-black uppercase text-center border border-red-500/25 flex items-center justify-center">
                      Équipage Complet !
                    </span>
                  );
                }

                if (selectedCrew.accessType === "open") {
                  const bounty = playerBounty || 0;
                  const canJoin = bounty >= (selectedCrew.minBounty || 0);

                  if (canJoin) {
                    return (
                      <button
                        type="button"
                        onClick={() => handleJoinCrewOpen(selectedCrew)}
                        className="flex-1 py-3 bg-violet-600 hover:bg-violet-750 text-white rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer text-center border border-violet-500/50"
                      >
                        Rejoindre l'Équipage ⚓
                      </button>
                    );
                  } else {
                    return (
                      <button
                        type="button"
                        disabled
                        className="flex-1 py-3 bg-slate-800/50 text-slate-500 border border-slate-700/60 rounded-xl text-xs font-bold uppercase text-center opacity-60 flex flex-col items-center justify-center gap-0.5"
                      >
                        <span>Prime Insuffisante</span>
                        <span className="text-[9px] font-mono font-medium lowercase">(min: {selectedCrew.minBounty?.toLocaleString()} ฿)</span>
                      </button>
                    );
                  }
                } else {
                  // Mode "invite" / Candidature
                  const applications = selectedCrew.applications || [];
                  const alreadyApplied = applications.some((app: any) => app.email === playerEmail);

                  if (alreadyApplied) {
                    return (
                      <span className="flex-1 py-3 bg-amber-500/10 border border-amber-550 text-amber-500 rounded-xl text-xs font-black uppercase tracking-wide text-center flex items-center justify-center">
                        Candidature en Attente...
                      </span>
                    );
                  } else {
                    return (
                      <button
                        type="button"
                        onClick={() => handleApplyToCrew(selectedCrew)}
                        className="flex-1 py-3 bg-violet-600 hover:bg-violet-750 text-white rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer text-center border border-violet-500/50"
                      >
                        Déposer Candidature 📋
                      </button>
                    );
                  }
                }
              })()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export const LEGENDARY_RIVALS = [
  { username: "Gol D. Roger", bounty: 5564800000, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Roger", isRival: true },
  { username: "Edward Newgate", bounty: 5046000000, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Whitebeard", isRival: true },
  { username: "Kaido", bounty: 4611100000, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Kaido", isRival: true },
  { username: "Charlotte Linlin", bounty: 4388000000, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=BigMom", isRival: true },
  { username: "Shanks", bounty: 4048900000, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Shanks", isRival: true },
  { username: "Marshall D. Teach", bounty: 3996000000, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Teach", isRival: true },
  { username: "Dracule Mihawk", bounty: 3590000000, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Mihawk", isRival: true },
  { username: "Buggy le Clown", bounty: 3189000000, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Buggy", isRival: true },
  { username: "Monkey D. Luffy", bounty: 3000000000, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Luffy", isRival: true },
  { username: "Trafalgar Law", bounty: 3000000000, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Law", isRival: true },
  { username: "Eustass Kid", bounty: 3000000000, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Kid", isRival: true },
  { username: "Roronoa Zoro", bounty: 1111000000, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Zoro", isRival: true },
  { username: "Jinbe", bounty: 1100000000, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Jinbe", isRival: true },
  { username: "Sabo", bounty: 602000000, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Sabo", isRival: true },
  { username: "Portgas D. Ace", bounty: 550000000, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Ace", isRival: true },
  { username: "Nico Robin", bounty: 930000000, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Robin", isRival: true },
  { username: "Sanji Vinsmoke", bounty: 1032000000, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Sanji", isRival: true },
  { username: "Charlotte Katakuri", bounty: 1057000000, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Katakuri", isRival: true },
  { username: "Crocodile", bounty: 1965050000, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Crocodile", isRival: true },
  { username: "Boa Hancock", bounty: 1659000000, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Hancock", isRival: true },
  { username: "Marco le Phénix", bounty: 1374000000, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Marco", isRival: true },
  { username: "King le Feu Sauvage", bounty: 1390000000, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=King", isRival: true },
  { username: "Queen la Pandémie", bounty: 1320000000, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Queen", isRival: true },
  { username: "Jack la Sécheresse", bounty: 1000000000, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Jack", isRival: true },
  { username: "Yasopp", bounty: 960000000, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Yasopp", isRival: true },
  { username: "Lucky Roux", bounty: 920000000, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Lucky", isRival: true },
  { username: "Donquixote Doflamingo", bounty: 340000000, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Doflamingo", isRival: true },
  { username: "Capone Bege", bounty: 350000000, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Bege", isRival: true },
  { username: "Jewelry Bonney", bounty: 320000000, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Bonney", isRival: true },
  { username: "Basil Hawkins", bounty: 320000000, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Hawkins", isRival: true },
  { username: "Scratchmen Apoo", bounty: 350000000, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Apoo", isRival: true },
  { username: "Killer", bounty: 200000000, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Killer", isRival: true },
  { username: "Usopp", bounty: 500000000, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Usopp", isRival: true },
  { username: "Franky", bounty: 394000000, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Franky", isRival: true },
  { username: "Brook", bounty: 383000000, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Brook", isRival: true },
  { username: "Nami", bounty: 366000000, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Nami", isRival: true },
  { username: "Tony Tony Chopper", bounty: 1000, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Chopper", isRival: true },
  { username: "Bepo le Mink", bounty: 500, avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Bepo", isRival: true },
];

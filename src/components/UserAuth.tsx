import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { LogIn, User, Mail, ShieldAlert, CheckCircle, LogOut, Loader2, Coins, Trophy, Award, Activity } from "lucide-react";
import { GameLog } from "../types";

interface UserAuthProps {
  playerBounty: number;
  setPlayerBounty: React.Dispatch<React.SetStateAction<number>>;
  playerUsername: string;
  setPlayerUsername: React.Dispatch<React.SetStateAction<string>>;
  playerAvatar: string;
  setPlayerAvatar: React.Dispatch<React.SetStateAction<string>>;
  stats: {
    gridWins: number;
    gridLosses: number;
    trackerWins: number;
    trackerPlays: number;
    duelHigh: number;
  };
  setStats: React.Dispatch<React.SetStateAction<{
    gridWins: number;
    gridLosses: number;
    trackerWins: number;
    trackerPlays: number;
    duelHigh: number;
  }>>;
  logs: GameLog[];
  setLogs: React.Dispatch<React.SetStateAction<GameLog[]>>;
}

export default function UserAuth({
  playerBounty,
  setPlayerBounty,
  playerUsername,
  setPlayerUsername,
  playerAvatar,
  setPlayerAvatar,
  stats,
  setStats,
  logs,
  setLogs,
}: UserAuthProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [inputUsername, setInputUsername] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(() => {
    return localStorage.getItem("firebaseUserEmail");
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [step, setStep] = useState<"not_logged" | "logged">(
    localStorage.getItem("firebaseUserEmail") ? "logged" : "not_logged"
  );

  // Fonction de repli SHA-256 en pur JS si window.crypto n'est pas disponible (contextes non sécurisés HTTP)
  const sha256_fallback = (ascii: string): string => {
    function rightRotate(value: number, amount: number) {
      return (value >>> amount) | (value << (32 - amount));
    }
    
    const mathPow = Math.pow;
    const lengthProperty = 'length';
    let i, j;
    let result = '';

    const hash = [
      0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ];

    const k = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];

    const words_blocks: number[] = [];
    const asciiLength = ascii[lengthProperty];
    for (i = 0; i < asciiLength; i++) {
      words_blocks[i >> 2] |= (ascii.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
    }
    
    const totalBits = asciiLength * 8;
    words_blocks[totalBits >> 5] |= 0x80 << (24 - (totalBits % 32));
    const finalLen = ((totalBits + 64 >>> 9) << 4) + 15;
    while (words_blocks.length <= finalLen) {
      words_blocks.push(0);
    }
    words_blocks[finalLen] = totalBits;
    
    for (let blockIdx = 0; blockIdx < words_blocks.length; blockIdx += 16) {
      const w = words_blocks.slice(blockIdx, blockIdx + 16);
      let a = hash[0], b = hash[1], c = hash[2], d = hash[3], e = hash[4], f = hash[5], g = hash[6], h = hash[7];

      for (i = 0; i < 64; i++) {
        if (i < 16) {
          // Already loaded
        } else {
          const s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
          const s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
          w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
        }

        const s1_maj = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
        const ch = (e & f) ^ (~e & g);
        const temp1 = (h + s1_maj + ch + k[i] + (w[i] || 0)) | 0;
        const s0_min = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const temp2 = (s0_min + maj) | 0;

        h = g;
        g = f;
        f = e;
        e = (d + temp1) | 0;
        d = c;
        c = b;
        b = a;
        a = (temp1 + temp2) | 0;
      }

      hash[0] = (hash[0] + a) | 0;
      hash[1] = (hash[1] + b) | 0;
      hash[2] = (hash[2] + c) | 0;
      hash[3] = (hash[3] + d) | 0;
      hash[4] = (hash[4] + e) | 0;
      hash[5] = (hash[5] + f) | 0;
      hash[6] = (hash[6] + g) | 0;
      hash[7] = (hash[7] + h) | 0;
    }

    for (i = 0; i < 8; i++) {
      let hexVal = (hash[i] >>> 0).toString(16);
      while (hexVal.length < 8) hexVal = "0" + hexVal;
      result += hexVal;
    }
    return result;
  };

  // Fonction sécurisée de hachage de mot de passe à l'aide de Web Crypto API avec repli standard robuste
  const hashPassword = async (pwd: string): Promise<string> => {
    try {
      if (typeof window !== "undefined" && window.crypto && window.crypto.subtle && window.crypto.subtle.digest) {
        const msgUint8 = new TextEncoder().encode(pwd);
        const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
      }
    } catch (e) {
      console.warn("L'API Web Crypto est inaccessible ou restreinte, repli sur le hachage JS local :", e);
    }
    return sha256_fallback(pwd);
  };
  
  // Synchronisation automatique vers Firestore dès que local state change et qu'on est connecté !
  useEffect(() => {
    if (currentUserEmail && step === "logged") {
      const saveUserDataToCloud = async () => {
        try {
          const userDocRef = doc(db, "users", currentUserEmail);
          
          // Nettoyer les logs pour respecter la taille maximum permise dans l'entity schema (20 logs max)
          const cleanLogs = logs.slice(0, 20).map(log => ({
            id: String(log.id || ""),
            gameType: String(log.gameType || "Bounty Duel"),
            result: String(log.result || "Victoire"),
            detail: String(log.detail || ""),
            adjustment: String(log.adjustment || "0 ฿"),
            timestamp: String(log.timestamp || ""),
          }));

          await updateDoc(userDocRef, {
            username: playerUsername,
            avatar: playerAvatar || "",
            bounty: Number(playerBounty || 0),
            gridWins: Number(stats.gridWins || 0),
            gridLosses: Number(stats.gridLosses || 0),
            trackerWins: Number(stats.trackerWins || 0),
            trackerPlays: Number(stats.trackerPlays || 0),
            duelHigh: Number(stats.duelHigh || 0),
            logs: cleanLogs,
            updatedAt: serverTimestamp(),
          });

          // SYNCHRONISATION EN CASCADE : Mettre à jour les infos du joueur au sein de son équipage en tâche de fond (nom, avatar, prime)
          try {
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
              const userData = userSnap.data();
              const crewId = userData.crewId;
              if (crewId) {
                const crewDocRef = doc(db, "crews", crewId);
                const crewSnap = await getDoc(crewDocRef);
                if (crewSnap.exists()) {
                  const crewData = crewSnap.data();
                  const members = crewData.members || [];
                  let hasChanged = false;

                  const updatedMembers = members.map((member: any) => {
                    if (member.email === currentUserEmail) {
                      if (
                        member.name !== playerUsername ||
                        member.avatar !== (playerAvatar || "") ||
                        member.bounty !== Number(playerBounty || 0)
                      ) {
                        hasChanged = true;
                        return {
                          ...member,
                          name: playerUsername,
                          avatar: playerAvatar || "",
                          bounty: Number(playerBounty || 0)
                        };
                      }
                    }
                    return member;
                  });

                  if (hasChanged) {
                    const newTotalBounty = updatedMembers.reduce((sum: number, m: any) => sum + Number(m.bounty || 0), 0);
                    await updateDoc(crewDocRef, {
                      members: updatedMembers,
                      totalBounty: newTotalBounty
                    });
                    console.log(`[Sync Crew] Infos synchronisées pour ${currentUserEmail} dans l'équipage ${crewId}. Nouvelle prime totale : ${newTotalBounty}`);
                  }
                }
              }
            }
          } catch (syncErr) {
            console.warn("Échec mineur de la synchronisation en cascade de l'équipage:", syncErr);
          }
        } catch (error) {
          // Gérer gracieusement les erreurs selon les directives
          console.error("Échec de la synchronisation automatique en tâche de fond:", error);
        }
      };

      // Debounce la sauvegarde pour éviter d'inonder Firestore à chaque frappe d'édition de pseudo par exemple
      const delayDebounce = setTimeout(() => {
        saveUserDataToCloud();
      }, 2000);

      return () => clearTimeout(delayDebounce);
    }
  }, [currentUserEmail, playerBounty, playerUsername, playerAvatar, stats, logs, step]);

  // Validation email basique
  const isValidEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  // Traitement de la connexion avec e-mail + mot de passe
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const targetEmail = email.trim().toLowerCase();
    if (!targetEmail || !isValidEmail(targetEmail)) {
      setErrorMsg("Veuillez saisir une adresse e-mail valide.");
      return;
    }

    if (!password) {
      setErrorMsg("Veuillez saisir votre mot de passe.");
      return;
    }

    setLoading(true);
    try {
      const userDocRef = doc(db, "users", targetEmail);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const cloudData = userSnap.data();
        const inputHashed = await hashPassword(password);
        
        // Migration transparente pour les anciens comptes créés sans mot de passe
        if (!cloudData.password) {
          await updateDoc(userDocRef, {
            password: inputHashed,
            updatedAt: serverTimestamp()
          });
          cloudData.password = inputHashed;
        }

        if (cloudData.password !== inputHashed) {
          setErrorMsg("Mot de passe incorrect. Veuillez réessayer.");
          setLoading(false);
          return;
        }
        
        // Charger les statistiques existantes du cloud
        setPlayerUsername(cloudData.username || "Pirate Mystère");
        if (cloudData.avatar) {
          setPlayerAvatar(cloudData.avatar);
        }
        setPlayerBounty(Number(cloudData.bounty || 0));
        setStats({
          gridWins: Number(cloudData.gridWins || 0),
          gridLosses: Number(cloudData.gridLosses || 0),
          trackerWins: Number(cloudData.trackerWins || 0),
          trackerPlays: Number(cloudData.trackerPlays || 0),
          duelHigh: Number(cloudData.duelHigh || 0),
        });
        
        if (Array.isArray(cloudData.logs)) {
          setLogs(cloudData.logs);
        }

        // Connecter
        setCurrentUserEmail(targetEmail);
        localStorage.setItem("firebaseUserEmail", targetEmail);
        setStep("logged");
        setSuccessMsg("Connexion réussie ! Vos statistiques ont été récupérées.");
      } else {
        setErrorMsg("Aucun compte trouvé avec cette adresse e-mail. Si vous êtes nouveau, veuillez basculer sur l'onglet 'Créer un compte'.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Une erreur est survenue lors de l'accès au serveur sécurisé de connexion.");
      try {
        handleFirestoreError(err, OperationType.GET, `users/${targetEmail}`, targetEmail);
      } catch (logErr) {
        console.error("Firestore error logged natively:", logErr);
      }
    } finally {
      setLoading(false);
    }
  };

  // Traitement de la création de profil avec e-mail + mot de passe
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const targetEmail = email.trim().toLowerCase();
    if (!targetEmail || !isValidEmail(targetEmail)) {
      setErrorMsg("Veuillez saisir une adresse e-mail valide.");
      return;
    }

    const cleanName = inputUsername.trim();
    if (cleanName.length < 2 || cleanName.length > 32) {
      setErrorMsg("Votre nom d'équipage doit comporter entre 2 et 32 caractères.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Votre mot de passe doit contenir au moins 6 caractères pour sécuriser votre compte.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Les mots de passe saisis ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const userDocRef = doc(db, "users", targetEmail);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        setErrorMsg("Ce compte e-mail existe déjà. Veuillez vous connecter dans l'onglet approprié.");
        setLoading(false);
        return;
      }

      const hashedPassword = await hashPassword(password);

      const initialPayload = {
        email: targetEmail,
        password: hashedPassword,
        username: cleanName,
        avatar: playerAvatar || "",
        bounty: Number(playerBounty || 0),
        gridWins: Number(stats.gridWins || 0),
        gridLosses: Number(stats.gridLosses || 0),
        trackerWins: Number(stats.trackerWins || 0),
        trackerPlays: Number(stats.trackerPlays || 0),
        duelHigh: Number(stats.duelHigh || 0),
        logs: logs.slice(0, 20).map(log => ({
          id: String(log.id),
          gameType: String(log.gameType),
          result: String(log.result),
          detail: String(log.detail),
          adjustment: String(log.adjustment),
          timestamp: String(log.timestamp),
        })),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(userDocRef, initialPayload);

      setPlayerUsername(cleanName);
      setCurrentUserEmail(targetEmail);
      localStorage.setItem("firebaseUserEmail", targetEmail);
      setStep("logged");
      setSuccessMsg(`Félicitations, votre profil pirate "${cleanName}" a été sauvegardé sur notre base de données sécurisée !`);
    } catch (err: any) {
      setErrorMsg(err?.message || "Impossible de créer le profil pirate. Échec d'écriture sécurisée.");
      try {
        handleFirestoreError(err, OperationType.CREATE, `users/${targetEmail}`, targetEmail);
      } catch (logErr) {
        console.error("Firestore write error logged natively:", logErr);
      }
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion
  const handleLogout = () => {
    localStorage.removeItem("firebaseUserEmail");
    setCurrentUserEmail(null);
    setStep("not_logged");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setSuccessMsg("Déconnexion réussie. Données locales préservées.");
  };

  // Rendu de l'interface d'authentification simple
  return (
    <div id="account-root" className="bg-white border text-left border-gray-200 rounded-3xl p-6 shadow-xs max-w-xl mx-auto mb-8 transition-all">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-5">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-heading font-black">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-black font-heading text-[#1A1A1A] uppercase tracking-tight">
            Système de Compte Pirate
          </h2>
          <p className="text-xs text-gray-400 font-mono">
            SAUVEGARDE SECURE SUR LA BASE CLOUD GRAND LINE
          </p>
        </div>
      </div>

      {/* Messages de retour */}
      {errorMsg && (
        <div id="auth-error" className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div id="auth-success" className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Rendu dynamique basé sur l'étape de connexion */}
      {step === "not_logged" && (
        <div className="space-y-4">
          {/* Sélection de mode Connexion ou Création */}
          <div className="flex border-b border-gray-100 mb-4 gap-2">
            <button
              type="button"
              onClick={() => { setAuthMode("login"); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 pb-3 text-center text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                authMode === "login"
                  ? "text-violet-600 border-violet-600 font-extrabold"
                  : "text-gray-400 border-transparent hover:text-gray-650"
              }`}
            >
              🔑 Connexion
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode("register"); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 pb-3 text-center text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                authMode === "register"
                  ? "text-violet-600 border-violet-600 font-extrabold"
                  : "text-gray-400 border-transparent hover:text-gray-650"
              }`}
            >
              ⚓ Créer un compte
            </button>
          </div>

          {authMode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <p className="text-xs text-gray-500 leading-relaxed">
                Connectez-vous pour récupérer votre équipage, vos primes de combat et synchroniser votre progression.
              </p>
              
              <div className="space-y-3">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Votre e-mail pirate (ex: luffy@millions.com)"
                    required
                    className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl py-2.5 pl-10 pr-4 text-xs font-mono text-[#1A1A1A] outline-none focus:border-violet-500"
                  />
                </div>

                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 font-heading font-black">
                    🔑
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Votre mot de passe secret"
                    required
                    className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl py-2.5 pl-10 pr-4 text-xs font-mono text-[#1A1A1A] outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#1A1A1A] text-white hover:bg-violet-650 transition-colors rounded-2xl font-bold font-sans text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-55"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Se connecter à ma cabine
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <p className="text-xs text-gray-500 leading-relaxed">
                Rejoignez la piraterie ! Créez votre profil en fournissant votre e-mail, un mot de passe sécurisé et votre nom d'équipage.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-mono font-black text-[#1A1A1A] uppercase tracking-wider block mb-1">
                    Nom de Capitaine / Équipage
                  </label>
                  <input
                    type="text"
                    value={inputUsername}
                    onChange={(e) => setInputUsername(e.target.value)}
                    placeholder="Ex: Équipage Mugiwara, Shanks99, ..."
                    maxLength={32}
                    required
                    className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl py-2.5 px-4 text-xs font-sans font-black text-[#1A1A1A] outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono font-black text-[#1A1A1A] uppercase tracking-wider block mb-1">
                    Adresse E-mail
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Votre e-mail"
                      required
                      className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl py-2.5 pl-10 pr-4 text-xs font-mono text-[#1A1A1A] outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono font-black text-[#1A1A1A] uppercase tracking-wider block mb-1">
                      Mot de passe (min 6 car.)
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mot de passe"
                      minLength={6}
                      required
                      className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl py-2.5 px-4 text-xs font-mono text-[#1A1A1A] outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-black text-[#1A1A1A] uppercase tracking-wider block mb-1">
                      Confirmer le mot de passe
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirmer"
                      minLength={6}
                      required
                      className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl py-2.5 px-4 text-xs font-mono text-[#1A1A1A] outline-none focus:border-violet-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-violet-600 text-white hover:bg-violet-700 transition-colors rounded-2xl font-bold font-sans text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-55 shadow-xs"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Créer mon profil et hisser le pavillon !
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {step === "logged" && (
        <div className="space-y-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-emerald-500/5 border border-emerald-500/15 p-4 rounded-2xl">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h4 className="text-sm font-black font-heading text-emerald-900 uppercase">
                  Compte Cloud Synchronisé
                </h4>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                E-mail : <span className="font-mono text-gray-700 font-bold light-email-text">{currentUserEmail}</span>
              </p>
            </div>
            
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 bg-white border border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-100 transition-all rounded-xl font-bold font-mono text-[10px] flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              SE DECONNECTER
            </button>
          </div>

          {/* Sifflet abrégé des stats synchrones */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/15 text-yellow-600 flex items-center justify-center font-bold">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-mono text-gray-400 font-black leading-none">Berries</p>
                <p className="text-xs font-black font-heading text-gray-800 tracking-tight mt-1">
                  {playerBounty.toLocaleString()} ฿
                </p>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-600 flex items-center justify-center font-bold">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-mono text-gray-400 font-black leading-none">Grille G/P</p>
                <p className="text-xs font-black font-heading text-gray-800 tracking-tight mt-1">
                  {stats.gridWins}/{stats.gridLosses}
                </p>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 flex items-center justify-center font-bold">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-mono text-gray-400 font-black leading-none">Tracker G/P</p>
                <p className="text-xs font-black font-heading text-gray-800 tracking-tight mt-1">
                  {stats.trackerWins}/{stats.trackerPlays - stats.trackerWins}
                </p>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-500/15 text-orange-600 flex items-center justify-center font-bold">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-mono text-gray-400 font-black leading-none">Bounty Duel</p>
                <p className="text-xs font-black font-heading text-gray-800 tracking-tight mt-1">
                  Max: {stats.duelHigh}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

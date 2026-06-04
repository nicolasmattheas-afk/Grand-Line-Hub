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

  // Fonction sécurisée de hachage de mot de passe à l'aide de Web Crypto API (SHA-256)
  const hashPassword = async (pwd: string): Promise<string> => {
    const msgUint8 = new TextEncoder().encode(pwd);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
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
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `users/${targetEmail}`, targetEmail);
      setErrorMsg("Une erreur est survenue lors de l'accès au serveur.");
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
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${targetEmail}`, targetEmail);
      setErrorMsg("Impossible de créer le profil. Échec d'écriture sécurisée.");
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
                E-mail : <span className="font-mono text-gray-700 font-bold">{currentUserEmail}</span>
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

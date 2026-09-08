import React, { useState, useEffect } from "react";
import { Tv, Sparkles, Gift, Clock, ExternalLink, CheckCircle2, Play, ShieldAlert, X } from "lucide-react";

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardGranted: (amount: number) => void;
  currentBounty: number;
}

const DEFAULT_DIRECT_LINK = "https://nap5k.com/tag.min.js"; // URL par défaut
const COOLDOWN_SECONDS = 180; // 3 minutes de recharge entre 2 pubs
const REWARD_AMOUNT = 5000; // 5 000 ฿ de prime

export default function RewardedAdModal({
  isOpen,
  onClose,
  onRewardGranted,
  currentBounty,
}: RewardedAdModalProps) {
  const [adState, setAdState] = useState<"idle" | "watching" | "ready_to_claim" | "claimed" | "cooldown">("idle");
  const [timer, setTimer] = useState(15);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [customLink, setCustomLink] = useState(() => {
    return localStorage.getItem("monetag_direct_link") || "";
  });
  const [showConfig, setShowConfig] = useState(false);

  // Vérifier le cooldown au chargement
  useEffect(() => {
    const lastClaim = localStorage.getItem("last_rewarded_ad_claim");
    if (lastClaim) {
      const elapsed = Math.floor((Date.now() - Number(lastClaim)) / 1000);
      if (elapsed < COOLDOWN_SECONDS) {
        setCooldownRemaining(COOLDOWN_SECONDS - elapsed);
        setAdState("cooldown");
      }
    }
  }, [isOpen]);

  // Timer du cooldown
  useEffect(() => {
    let interval: any = null;
    if (adState === "cooldown" && cooldownRemaining > 0) {
      interval = setInterval(() => {
        setCooldownRemaining((prev) => {
          if (prev <= 1) {
            setAdState("idle");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [adState, cooldownRemaining]);

  // Timer de visionnage de pub (15s)
  useEffect(() => {
    let interval: any = null;
    if (adState === "watching" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setAdState("ready_to_claim");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [adState, timer]);

  if (!isOpen) return null;

  const handleStartWatch = () => {
    // 1. Ouvrir le lien sponsorisé / Monetag Direct Link dans un nouvel onglet s'il existe
    const targetUrl = customLink.trim() || DEFAULT_DIRECT_LINK;
    try {
      if (targetUrl && targetUrl !== "#") {
        window.open(targetUrl, "_blank", "noopener,noreferrer");
      }
    } catch (e) {
      console.warn("Impossible d'ouvrir le lien sponsorisé", e);
    }

    // 2. Tenter de déclencher Monetag s'il est déjà injecté sur la page
    try {
      if ((window as any).monetag) {
        (window as any).monetag();
      }
    } catch (err) {
      console.log("Monetag SDK trigger optionnel:", err);
    }

    // 3. Lancer le compte à rebours de 15 secondes
    setTimer(15);
    setAdState("watching");
  };

  const handleClaimReward = () => {
    onRewardGranted(REWARD_AMOUNT);
    localStorage.setItem("last_rewarded_ad_claim", String(Date.now()));
    setAdState("claimed");
    setTimeout(() => {
      setCooldownRemaining(COOLDOWN_SECONDS);
      setAdState("cooldown");
    }, 2000);
  };

  const handleSaveLink = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("monetag_direct_link", customLink.trim());
    setShowConfig(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0e1126] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden text-white">
        
        {/* Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-violet-500 to-amber-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Header Icon & Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10 mb-2">
              <Tv className="w-8 h-8 animate-pulse" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-heading uppercase tracking-wide text-amber-400">
              Cadeau de la Marine 📺
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
              Regardez une courte vidéo sponsorisée et gagnez <span className="font-bold text-emerald-400">+5 000 ฿</span> de prime instantanée !
            </p>
          </div>

          {/* Current Bounty Box */}
          <div className="bg-[#151936] border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Votre Prime Actuelle</span>
            <span className="text-base font-black font-mono text-amber-400">
              ฿ {currentBounty.toLocaleString()}
            </span>
          </div>

          {/* State 1: IDLE / READY TO WATCH */}
          {adState === "idle" && (
            <div className="space-y-4">
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" /> Instructions :
                </div>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  <li>Cliquez sur <span className="text-white font-semibold">"Lancer la vidéo"</span> ci-dessous.</li>
                  <li>Une page sponsorisée s'ouvrira (ou la vidéo se lancera).</li>
                  <li>Attendez le décompte de <span className="text-amber-400 font-bold">15 secondes</span> pour valider la prime.</li>
                </ul>
              </div>

              <button
                onClick={handleStartWatch}
                className="w-full py-4 px-6 rounded-xl font-heading font-black text-sm uppercase tracking-wider bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                Lancer la Vidéo (+5 000 ฿)
              </button>
            </div>
          )}

          {/* State 2: WATCHING (15s Countdown) */}
          {adState === "watching" && (
            <div className="space-y-4 text-center py-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-amber-300 animate-pulse">
                  Vidéo / Publicité en cours de visionnage...
                </p>
                <div className="text-4xl font-mono font-black text-amber-400">
                  {timer}s
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-white/10">
                <div
                  className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${((15 - timer) / 15) * 100}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-400 italic">
                Ne fermez pas cette fenêtre pendant le compte à rebours pour valider votre récompense.
              </p>
            </div>
          )}

          {/* State 3: READY TO CLAIM */}
          {adState === "ready_to_claim" && (
            <div className="space-y-4 text-center py-2 animate-in zoom-in-95 duration-300">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mb-1">
                <Gift className="w-7 h-7 animate-bounce" />
              </div>
              <h3 className="text-lg font-black font-heading text-emerald-400 uppercase">
                Visionnage Validé ! 🎉
              </h3>
              <button
                onClick={handleClaimReward}
                className="w-full py-4 px-6 rounded-xl font-heading font-black text-sm uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Réclamer +5 000 ฿
              </button>
            </div>
          )}

          {/* State 4: CLAIMED CONFIRMATION */}
          {adState === "claimed" && (
            <div className="space-y-3 text-center py-6">
              <div className="text-5xl">💰</div>
              <h3 className="text-xl font-black font-heading text-emerald-400 uppercase">
                +5 000 ฿ Crédités !
              </h3>
              <p className="text-xs text-slate-300">
                Votre nouvelle prime est désormais enregistrée sur votre compte pirate.
              </p>
            </div>
          )}

          {/* State 5: COOLDOWN */}
          {adState === "cooldown" && (
            <div className="space-y-4 text-center py-4 bg-slate-900/60 rounded-xl border border-white/5 p-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 text-slate-400">
                <Clock className="w-6 h-6 animate-spin" style={{ animationDuration: "10s" }} />
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase font-mono text-slate-400 tracking-wider">
                  Prochaine Vidéo Disponible Dans :
                </p>
                <p className="text-2xl font-mono font-black text-amber-400">
                  {formatTime(cooldownRemaining)}
                </p>
              </div>
              <p className="text-[11px] text-slate-400">
                Pour équilibrer le jeu, une pause de 3 minutes est appliquée entre chaque vidéo sponsorisée.
              </p>
            </div>
          )}

          {/* Config / Direct Link Settings Toggle for Admin */}
          <div className="border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="text-[10px] font-mono uppercase text-slate-400 hover:text-amber-400 flex items-center gap-1 mx-auto transition-colors"
            >
              ⚙️ {showConfig ? "Masquer la configuration du lien Direct" : "Configurer le lien Direct Link Monetag"}
            </button>

            {showConfig && (
              <form onSubmit={handleSaveLink} className="mt-3 space-y-2 text-left bg-slate-900/80 p-3 rounded-xl border border-white/10">
                <label className="block text-[10px] font-mono text-slate-300 uppercase">
                  URL de votre Direct Link Monetag (ou SmartLink) :
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={customLink}
                    onChange={(e) => setCustomLink(e.target.value)}
                    className="flex-1 bg-slate-950 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors"
                  >
                    Enregistrer
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Collez le lien direct généré depuis votre tableau de bord Monetag / Ad network pour rediriger vos joueurs vers vos vidéos/offres sponsorisées.
                </p>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

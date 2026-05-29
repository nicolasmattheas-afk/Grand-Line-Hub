import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { 
  BookOpen, Sparkles, AlertCircle, Edit, Trash2, Calendar, 
  Eye, Tag, RefreshCw, Feather, Check, X, ShieldAlert, Newspaper, Clock, Search
} from "lucide-react";

interface WEJArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  author: string;
  publishDate: string;
  views: number;
}

interface WEJSectionProps {
  playerEmail: string | null;
}

export default function WEJSection({ playerEmail }: WEJSectionProps) {
  const [articles, setArticles] = useState<WEJArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<WEJArticle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [botGenerating, setBotGenerating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Mode Édition pour l'Admin
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>("");
  const [editSummary, setEditSummary] = useState<string>("");
  const [editContent, setEditContent] = useState<string>("");
  const [editTagsStr, setEditTagsStr] = useState<string>("");

  const isAdmin = playerEmail === "nicolasmattheas@gmail.com";

  // Charger les articles historiques
  const loadArticles = async (selectLatest = true) => {
    try {
      const resp = await fetch("/api/wej/articles");
      const data = await resp.json();
      if (data.success) {
        setArticles(data.articles);
        if (selectLatest && data.articles.length > 0) {
          setSelectedArticle(data.articles[0]);
        }
      } else {
        setErrorMsg("Échec de chargement des éditions du WEJ.");
      }
    } catch (err: any) {
      setErrorMsg("Erreur réseau lors de la récupération des articles.");
    } finally {
      setLoading(false);
    }
  };

  // Lancer le bot automatique du jour
  const triggerBotDaily = async () => {
    setBotGenerating(true);
    setStatusMessage("Morgans déploie ses goélands d'information... Rédaction de l'édition du jour en cours...");
    setErrorMsg(null);
    try {
      const resp = await fetch("/api/wej/generate-daily");
      const data = await resp.json();
      if (data.success) {
        setStatusMessage(
          data.generatedNow 
            ? "Grande Nouvelle ! Morgans vient de publier le journal du jour !" 
            : "L'édition de ce jour est disponible et à jour."
        );
        // Recharger le flux
        await loadArticles(true);
      } else {
        setErrorMsg(data.error || "Morgans n'a pas pu imprimer l'édition d'aujourd'hui.");
      }
    } catch (err: any) {
      setErrorMsg("Impossible de contacter l'agence principale du WEJ.");
    } finally {
      setBotGenerating(false);
      setTimeout(() => setStatusMessage(""), 5000);
    }
  };

  useEffect(() => {
    // Étape 1 : Charger l'historique
    loadArticles(true);
    // Étape 2 : Lancer le bot automatique en sourdine pour s'assurer que l'édition du jour existe !
    triggerBotDaily();
  }, []);

  const handleSelectArticle = (art: WEJArticle) => {
    setSelectedArticle(art);
    setIsEditing(false);
    setConfirmDeleteId(null);
  };

  // Supprimer un article (Seul l'Admin peut réaliser cette action) - Garanti compatible Iframe sans confirm()
  const handleConfirmDelete = async (id: string) => {
    setErrorMsg(null);
    setStatusMessage("Archivage en cours...");
    try {
      const resp = await fetch("/api/wej/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, userEmail: playerEmail }),
      });
      const data = await resp.json();
      if (data.success) {
        setArticles(prev => prev.filter(art => art.id !== id));
        if (selectedArticle?.id === id) {
          // Trouver un autre article restant
          const remaining = articles.filter(art => art.id !== id);
          setSelectedArticle(remaining.length > 0 ? remaining[0] : null);
        }
        setStatusMessage(data.message || "L'édition a bien été archivée.");
        setConfirmDeleteId(null);
      } else {
        setErrorMsg("Erreur lors de l'archivage: " + data.error);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Erreur réseau lors de la communication avec le serveur.");
    } finally {
      setTimeout(() => setStatusMessage(""), 4000);
    }
  };

  // Activer l'édition d'un article
  const startEdit = () => {
    if (!selectedArticle) return;
    setEditTitle(selectedArticle.title);
    setEditSummary(selectedArticle.summary);
    setEditContent(selectedArticle.content);
    setEditTagsStr(selectedArticle.tags.join(", "));
    setIsEditing(true);
    setConfirmDeleteId(null);
  };

  // Enregistrer l'édition d'un article
  const saveEdit = async () => {
    if (!selectedArticle) return;
    setErrorMsg(null);
    setStatusMessage("Enregistrement de la mise à jour...");
    try {
      const tags = editTagsStr.split(",").map(t => t.trim()).filter(Boolean);
      const resp = await fetch("/api/wej/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedArticle.id,
          title: editTitle,
          summary: editSummary,
          content: editContent,
          tags,
          userEmail: playerEmail,
        }),
      });
      const data = await resp.json();
      if (data.success) {
        const updated = {
          ...selectedArticle,
          title: editTitle,
          summary: editSummary,
          content: editContent,
          tags,
        };
        setSelectedArticle(updated);
        setArticles(prev => prev.map(art => art.id === selectedArticle.id ? updated : art));
        setIsEditing(false);
        setStatusMessage("Mise à jour réussie avec succès !");
      } else {
        setErrorMsg("Erreur de mise à jour: " + data.error);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Erreur réseau lors de la mise à jour.");
    } finally {
      setTimeout(() => setStatusMessage(""), 4000);
    }
  };

  const filteredArticles = articles.filter(art => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      art.title.toLowerCase().includes(q) ||
      art.summary.toLowerCase().includes(q) ||
      art.content.toLowerCase().includes(q) ||
      art.tags.some(t => t.toLowerCase().includes(q)) ||
      art.publishDate.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full flex flex-col gap-6" id="wej-section-core">
      {/* Journal Header Banner */}
      <div className="w-full bg-linear-to-r from-slate-900 via-[#1A1C3C] to-slate-900 border border-violet-500/30 rounded-2xl p-6 relative overflow-hidden flex flex-col items-center text-center shadow-[0_4px_24px_rgba(139,92,246,0.15)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 rounded-full blur-2xl -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-600/5 rounded-full blur-2xl -z-10" />

        <div className="flex items-center gap-3 mb-2">
          <Newspaper className="w-8 h-8 text-rose-500 animate-pulse" />
          <span className="text-[11px] font-mono uppercase bg-rose-950 text-rose-400 border border-rose-900 rounded-full px-4.5 py-1 tracking-widest font-black">
            L'Information qui secoue Grand Line
          </span>
        </div>

        <h1 className="text-3xl md:text-5xl font-heading font-extrabold tracking-tight text-white uppercase mt-1 mb-2">
          Weekly Economy Journal
        </h1>
        <p className="text-xs md:text-sm text-slate-400 max-w-2xl leading-relaxed">
          Le journal officiel présidentiel dirigé par le célèbre <strong>Morgans</strong>. 
          Retrouvez chaque jour des analyses d'actualités chocs rédigées par notre robot-compagnon, optimisées aux questions et théories qui animent le monde de One Piece !
        </p>

        {/* Status bar */}
        <div className="mt-4 flex flex-col gap-1.5 items-center w-full max-w-lg">
          {botGenerating && (
            <div className="flex items-center gap-3 bg-violet-950/40 border border-violet-500/20 rounded-full px-5 py-2 text-xs text-violet-300">
              <RefreshCw className="w-4.5 h-4.5 animate-spin text-rose-400" />
              <span>{statusMessage}</span>
            </div>
          )}

          {statusMessage && !botGenerating && (
            <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/20 rounded-full px-5 py-2 text-xs text-emerald-300">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{statusMessage}</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 bg-rose-950/40 border border-rose-500/20 rounded-full px-5 py-2 text-xs text-rose-400">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Journal Workspace - Double Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: List of historical issues */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="text-xs font-mono font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              Archives Récentes ({articles.length})
            </h3>
            {isAdmin && (
              <button 
                onClick={() => triggerBotDaily()}
                disabled={botGenerating}
                className="text-[10px] font-mono text-violet-400 hover:text-white bg-violet-950/50 hover:bg-violet-900 border border-violet-800/60 rounded px-2.5 py-1 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${botGenerating ? "animate-spin" : ""}`} />
                Rélancer Bot
              </button>
            )}
          </div>

          {/* Barre de recherche intelligente */}
          <div className="relative w-full" id="wej-search-box">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
            <input
              type="text"
              placeholder="Rechercher un article ou sujet... (ex: luffy)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#11132a]/90 text-slate-100 placeholder-slate-400 text-xs rounded-xl pl-9 pr-8 py-2.5 border border-white/5 focus:outline-none focus:border-rose-500/50 transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                title="Effacer la recherche"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 bg-slate-900/40 border border-white/5 rounded-2xl">
              <RefreshCw className="w-8 h-8 animate-spin text-rose-500 mb-3" />
              <p className="text-xs text-slate-400">Impression des pages en cours...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center p-8 bg-[#101228] border border-dashed border-white/10 rounded-2xl">
              <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-xs text-slate-400">Aucun journal n'a été rédigé pour le moment.</p>
              {isAdmin && (
                <button
                  onClick={() => triggerBotDaily()}
                  className="mt-4 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-xs font-heading font-extrabold rounded-xl text-white tracking-widest uppercase cursor-pointer"
                >
                  Rédiger maintenant
                </button>
              )}
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center p-8 bg-[#101228]/60 border border-dashed border-white/5 rounded-xl">
              <AlertCircle className="w-6 h-6 text-rose-400/80 mx-auto mb-2 animate-bounce" />
              <p className="text-xs text-slate-300 font-medium">Aucun résultat trouvé pour votre recherche.</p>
              <p className="text-[10px] text-slate-400 mt-1">Réessayez avec un autre mot-clé ou effacez la recherche.</p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-3 px-3 py-1.5 bg-[#1f1a3e] hover:bg-violet-900 text-[10px] font-sans font-bold rounded-lg text-rose-400 hover:text-white cursor-pointer border border-rose-500/20 transition-all"
              >
                Tout réafficher
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1 no-scrollbar">
              {filteredArticles.map((art) => {
                const isSelected = selectedArticle?.id === art.id;
                return (
                  <motion.div
                    key={art.id}
                    onClick={() => handleSelectArticle(art)}
                    whileHover={{ scale: 1.01 }}
                    className={`cursor-pointer p-4 rounded-xl border transition-all relative ${
                      isSelected 
                        ? "bg-[#1f1a3e]/80 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.1)]" 
                        : "bg-[#11132a]/90 border-white/5 hover:border-violet-500/20"
                    }`}
                  >
                    {/* Selected Indicator */}
                    {isSelected && (
                      <div className="absolute top-0 right-0 bg-rose-500 text-[8px] font-mono text-white px-2 py-0.5 rounded-bl-lg font-black tracking-widest uppercase">
                        ACTIF
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-1.5">
                      <Calendar className="w-3 h-3 text-rose-400" />
                      <span className="text-[10px] font-mono text-slate-400">{art.publishDate}</span>
                    </div>

                    <h4 className={`text-sm font-heading font-bold leading-tight mb-2 ${isSelected ? "text-rose-400" : "text-white group-hover:text-rose-400"}`}>
                      {art.title}
                    </h4>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                      {art.summary}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-2">
                      <div className="flex gap-1">
                        {art.tags.slice(0, 2).map((tag, idx) => (
                          <span key={idx} className="text-[9px] bg-white/5 border border-white/10 text-slate-300 px-1.5 py-0.5 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-slate-500">
                        <Eye className="w-2.5 h-2.5" />
                        <span>{art.views || 0}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Full Reader panel */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {selectedArticle ? (
              <motion.div
                key={selectedArticle.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#0e1026] border border-violet-500/10 rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl"
              >
                {!isEditing ? (
                  <>
                    {/* Header Details */}
                    <div>
                      <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400 mb-2 border-b border-white/5 pb-4 justify-between">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1.5 text-rose-400">
                            <Feather className="w-4 h-4 text-rose-400 shrink-0" />
                            Auteur : <strong>{selectedArticle.author}</strong>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
                            Date : {selectedArticle.publishDate}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1.5 text-slate-400 bg-white/5 px-2.5 py-1 rounded">
                            <Eye className="w-3.5 h-3.5 text-violet-400" />
                            {selectedArticle.views || 0} lus
                          </span>
                          {isAdmin && (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={startEdit}
                                className="p-1.5 bg-violet-900/40 hover:bg-violet-800 border border-violet-700/50 text-violet-300 hover:text-white rounded-lg cursor-pointer flex items-center gap-1 text-[11px] h-8 align-middle"
                                title="Modifier l'article"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                Modifier
                              </button>
                              {confirmDeleteId === selectedArticle.id ? (
                                <div className="flex items-center gap-1 bg-[#100b1a] border border-rose-500/20 p-1 rounded-lg" id="delete-confirm-bar">
                                  <button
                                    onClick={() => handleConfirmDelete(selectedArticle.id)}
                                    className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-bold cursor-pointer flex items-center gap-0.5"
                                    title="Confirmer"
                                  >
                                    <Check className="w-3 h-3" />
                                    Confirmer?
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold cursor-pointer"
                                    title="Annuler"
                                  >
                                    Annuler
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDeleteId(selectedArticle.id)}
                                  className="p-1.5 bg-rose-950/40 hover:bg-rose-900 border border-rose-900/50 text-rose-400 hover:text-white rounded-lg cursor-pointer flex items-center gap-1 text-[11px] h-8 align-middle"
                                  title="Archiver l'article"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Archiver
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <h2 className="text-2xl md:text-3.5xl font-heading font-extrabold text-[#F8FAFC] tracking-tight leading-snug">
                        {selectedArticle.title}
                      </h2>
                    </div>

                    {/* Summary Callout Card */}
                    <div className="bg-[#1b1c34] border-l-4 border-rose-500 p-4 rounded-r-xl text-slate-300 text-xs md:text-sm italic leading-relaxed">
                      {selectedArticle.summary}
                    </div>

                    {/* Article Markdown Body */}
                    <div className="prose prose-invert prose-rose max-w-none text-slate-200 text-xs md:text-sm leading-relaxed space-y-4 font-sans border-b border-white/5 pb-6">
                      <ReactMarkdown>
                        {selectedArticle.content
                          .replace(/\\n/g, "\n")
                          .replace(/^###\s+(.*)/gm, "**$1**")
                          .replace(/^##\s+(.*)/gm, "**$1**")
                          .replace(/^#\s+(.*)/gm, "**$1**")}
                      </ReactMarkdown>
                    </div>

                    {/* Footer Tags */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mr-2">
                        Indexation :
                      </span>
                      {selectedArticle.tags.map((tag, idx) => (
                        <span key={idx} className="text-[10px] font-mono uppercase bg-[#141630] border border-white/10 text-rose-400 px-2.5 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  /* Admin Editing Mode */
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <h3 className="text-sm font-heading font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
                        <Edit className="w-4 h-4 text-rose-400" />
                        Édition Journalistique de Morgans
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={saveEdit}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Sauvegarder
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          Annuler
                        </button>
                      </div>
                    </div>

                    {/* Edit Form */}
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="text-[10px] uppercase font-mono tracking-widest text-slate-400 mb-1.5 block">
                          Titre Choc de l'Édition
                        </label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full bg-[#1b1c34] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-mono tracking-widest text-slate-400 mb-1.5 block">
                          Accroche / Méta-Résumé
                        </label>
                        <textarea
                          rows={2}
                          value={editSummary}
                          onChange={(e) => setEditSummary(e.target.value)}
                          className="w-full bg-[#1b1c34] border border-white/10 rounded-xl px-4 py-2.5 text-xs md:text-sm text-white focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-mono tracking-widest text-slate-400 mb-1.5 block">
                          Contenu de l'Article (Format Markdown)
                        </label>
                        <textarea
                          rows={12}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full bg-[#1b1c34] border border-white/10 rounded-xl px-4 py-3 text-xs md:text-sm text-white focus:outline-none focus:border-rose-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-mono tracking-widest text-slate-400 mb-1.5 block">
                          Mots-clés SEO (Séparés par des virgules)
                        </label>
                        <input
                          type="text"
                          value={editTagsStr}
                          onChange={(e) => setEditTagsStr(e.target.value)}
                          className="w-full bg-[#1b1c34] border border-white/10 rounded-xl px-4 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-rose-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="bg-[#0e1026] border border-white/5 rounded-2xl p-16 text-center text-slate-500">
                <BookOpen className="w-12 h-12 mx-auto text-slate-600 mb-4 animate-bounce" />
                <h3 className="text-sm font-heading font-bold text-slate-400 uppercase mb-1">
                  Sélectionnez un Journal
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Cliquez sur l'une des éditions récentes du Weekly Economy Journal sur la gauche pour en déplier les pages et déjouer les plans de la Marine !
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

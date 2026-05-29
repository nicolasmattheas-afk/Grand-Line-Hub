import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, MessageSquare, ShieldAlert, Pin, Trash2, HelpCircle, 
  Bug, User, Send, Filter, CheckCircle2, UserCheck, RefreshCw, AlertTriangle
} from "lucide-react";

interface Reply {
  replyId: string;
  content: string;
  authorEmail: string;
  authorName: string;
  authorAvatar: string;
  createdAt: string;
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
  type: "question" | "bug";
  authorEmail: string;
  authorName: string;
  authorAvatar: string;
  isPinned: boolean;
  replies: Reply[];
  createdAt: any;
  updatedAt: any;
}

interface BlogSectionProps {
  playerEmail: string | null;
  playerUsername: string;
  playerAvatar: string;
}

export default function BlogSection({ playerEmail, playerUsername, playerAvatar }: BlogSectionProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<"all" | "question" | "bug">("all");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // States pour la création d'un Post
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newType, setNewType] = useState<"question" | "bug">("question");
  const [submitting, setSubmitting] = useState(false);

  // States pour ajouter une réponse (reply) par postId
  const [replyInput, setReplyInput] = useState<{ [postId: string]: string }>({});

  const ADMIN_EMAIL = "nicolasmattheas@gmail.com";
  const isAdmin = playerEmail === ADMIN_EMAIL;

  const loadPosts = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const resp = await fetch("/api/blog/posts");
      const data = await resp.json();
      if (data.success) {
        setPosts(data.posts);
      } else {
        setErrorMsg("Impossible de charger les messages du forum.");
      }
    } catch (err) {
      setErrorMsg("Erreur de connexion avec le serveur d'alliances.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerEmail) {
      alert("Vous devez posséder un compte pirate et être connecté pour participer au forum.");
      return;
    }
    if (!newTitle.trim() || !newContent.trim()) {
      alert("Le titre et le contenu ne peuvent pas être vides.");
      return;
    }

    setSubmitting(true);
    try {
      const resp = await fetch("/api/blog/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          content: newContent.trim(),
          type: newType,
          authorEmail: playerEmail,
          authorName: playerUsername,
          authorAvatar: playerAvatar,
        }),
      });
      const data = await resp.json();
      if (data.success) {
        setNewTitle("");
        setNewContent("");
        setShowCreateForm(false);
        await loadPosts(); // Recharger tout le forum
      } else {
        alert("Erreur lors de la publication : " + data.error);
      }
    } catch (err: any) {
      alert("Échec réseau lors de l'expédition du parchemin.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddReply = async (postId: string) => {
    const text = replyInput[postId] || "";
    if (!playerEmail) {
      alert("La connexion à votre compte est nécessaire pour répondre aux flibustiers.");
      return;
    }
    if (!text.trim()) return;

    try {
      const resp = await fetch("/api/blog/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          content: text.trim(),
          authorEmail: playerEmail,
          authorName: playerUsername,
          authorAvatar: playerAvatar,
        }),
      });
      const data = await resp.json();
      if (data.success) {
        setReplyInput(prev => ({ ...prev, [postId]: "" }));
        await loadPosts(); // actualiser posts
      } else {
        alert("Impossible de poster la réponse: " + data.error);
      }
    } catch (err: any) {
      alert("Erreur de communication.");
    }
  };

  const handlePinPost = async (postId: string, currentPin: boolean) => {
    try {
      const resp = await fetch("/api/blog/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          userEmail: playerEmail,
          isPinned: !currentPin,
        }),
      });
      const data = await resp.json();
      if (data.success) {
        await loadPosts();
      } else {
        alert("Action interdite: " + data.error);
      }
    } catch (err) {
      alert("Erreur de requête.");
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Êtes-vous certain de vouloir jeter cette question aux requins ?")) {
      return;
    }

    try {
      const resp = await fetch("/api/blog/delete-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, userEmail: playerEmail }),
      });
      const data = await resp.json();
      if (data.success) {
        await loadPosts();
      } else {
        alert("Refusé: " + data.error);
      }
    } catch (err) {
      alert("Erreur lors de la suppression.");
    }
  };

  const handleDeleteReply = async (postId: string, replyId: string) => {
    if (!window.confirm("Détruire cette réponse ?")) {
      return;
    }

    try {
      const resp = await fetch("/api/blog/delete-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, replyId, userEmail: playerEmail }),
      });
      const data = await resp.json();
      if (data.success) {
        await loadPosts();
      } else {
        alert("Échec de suppression de la réponse: " + data.error);
      }
    } catch (err) {
      alert("Erreur réseau.");
    }
  };

  const filteredPosts = posts.filter(p => filterType === "all" || p.type === filterType);

  return (
    <div className="w-full flex flex-col gap-6" id="blog-community-center">
      {/* Blog/Forum Header with filter and write trigger */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-2xl font-heading font-black text-white flex items-center gap-2 tracking-tight uppercase">
            <MessageSquare className="w-6 h-6 text-violet-400" />
            Bouteilles à la mer & Tchats
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
            Posez vos questions sur le jeu, signalez des bugs techniques, échangez sur l'univers d'One Piece. 
            Vous devez posséder un compte connecté pour initier des sujets de discussion !
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-stretch md:self-auto">
          {/* Quick Filters */}
          <div className="bg-[#11132a] border border-white/5 rounded-xl p-1 flex items-center gap-1.5 text-xs text-slate-300">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all ${filterType === "all" ? "bg-violet-900 text-white font-black" : "hover:text-white"}`}
            >
              <Filter className="w-3.5 h-3.5" />
              Tous
            </button>
            <button
              onClick={() => setFilterType("question")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all ${filterType === "question" ? "bg-violet-900 text-white font-black" : "hover:text-white"}`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
              Questions
            </button>
            <button
              onClick={() => setFilterType("bug")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all ${filterType === "bug" ? "bg-[#e11d48]/40 text-[#ffffff] font-black" : "hover:text-white"}`}
            >
              <Bug className="w-3.5 h-3.5 text-rose-500" />
              Bugs
            </button>
          </div>

          <button
            onClick={() => {
              if (!playerEmail) {
                alert("Veuillez d'abord rejoindre l'aventure en créant ou connectant un compte dans l'onglet 'Tableau de bord' !");
              } else {
                setShowCreateForm(!showCreateForm);
              }
            }}
            className="px-4 py-2 bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-heading font-extrabold tracking-widest text-[11px] rounded-xl flex items-center gap-2 shadow-[0_4px_12px_rgba(225,29,72,0.2)] uppercase cursor-pointer transition-all shrink-0"
          >
            <Plus className="w-4 h-4 text-white" />
            Nouveau Sujet
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-950/40 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4.5 h-4.5 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Creation form dropdown modal-like card */}
      <AnimatePresence>
        {showCreateForm && playerEmail && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreatePost}
            className="bg-[#11132a] border border-violet-500/20 rounded-2xl p-5 md:p-6 flex flex-col gap-4 overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <h3 className="text-sm font-heading font-black text-[#F8FAFC] tracking-wider uppercase">
                Soumettre un nouveau sujet au Conseil de Marineford
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                Intégrer plus tard
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block mb-1">
                  Titre du sujet
                </label>
                <input
                  type="text"
                  placeholder="Ex : Problème d'affichage sur Bounty Duel / Comment activer son Haki ?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#1b1c34] border border-white/10 rounded-xl px-4 py-2.5 text-xs md:text-sm text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block mb-1">
                  Catégorie du Sujet
                </label>
                <select
                  value={newType}
                  onChange={(e: any) => setNewType(e.target.value)}
                  className="w-full bg-[#1b1c34] border border-white/10 rounded-xl px-4 py-2.5 text-xs md:text-sm text-slate-300 focus:outline-none focus:border-rose-500"
                >
                  <option value="question">❓ Poser une question</option>
                  <option value="bug">🐛 Signaler un bug technique</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block mb-1">
                Description / Corps de la bouteille
              </label>
              <textarea
                rows={4}
                placeholder="Décrivez précisément votre interrogation ou le bug rencontré..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full bg-[#1b1c34] border border-white/10 rounded-xl px-4 py-3 text-xs md:text-sm text-white focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div className="flex justify-end gap-3 mt-1">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-heading font-black tracking-widest rounded-xl flex items-center gap-2 uppercase disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Envoi par colombe...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Larguer les amarres
                  </>
                )}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Posts List & Details */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/40 border border-white/5 rounded-2xl">
          <RefreshCw className="w-10 h-10 animate-spin text-rose-500 mb-3" />
          <p className="text-xs text-slate-400 font-mono">Lecture de l'index des parchemins...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-16 bg-[#0f1021] border border-dashed border-white/10 rounded-2xl">
          <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-heading font-black text-slate-400 uppercase mb-1">
            Aucun message trouvé
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Soyez le tout premier de Grand Line à poser une question ou signaler un bug à notre administrateur Nicolas !
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6" id="blog-feeds-posts">
          {filteredPosts.map((post) => {
            const isPostOwner = playerEmail === post.authorEmail;
            const canDeletePost = isAdmin || isPostOwner;
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-[#0d0f23] border rounded-2xl overflow-hidden relative ${
                  post.isPinned 
                    ? "border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.06)]" 
                    : "border-white/5"
                }`}
              >
                {/* Pin Header / Category Tag bar */}
                <div className="bg-[#12142d] px-5 py-2.5 flex items-center justify-between border-b border-white/5">
                  <div className="flex items-center gap-2">
                    {post.type === "bug" ? (
                      <span className="text-[9px] font-mono uppercase bg-rose-950 text-rose-400 border border-rose-900 px-2 py-0.5 rounded flex items-center gap-1 font-black">
                        <Bug className="w-3 h-3 text-rose-500" />
                        Signalement de Bug
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-950 px-2 py-0.5 rounded flex items-center gap-1 font-black">
                        <HelpCircle className="w-3 h-3 text-emerald-400" />
                        Aide Communautaire
                      </span>
                    )}

                    {post.isPinned && (
                      <span className="text-[9px] font-mono uppercase bg-amber-950 text-amber-400 border border-amber-900 px-2.5 py-0.5 rounded flex items-center gap-1 font-black shadow-[0_0_4px_#F59E0B]">
                        <Pin className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                        Épinglé par l'Équipage
                      </span>
                    )}
                  </div>

                  {/* Moderator options ( Nicolas or Owner ) */}
                  <div className="flex items-center gap-3">
                    {isAdmin && (
                      <button
                        onClick={() => handlePinPost(post.id, post.isPinned)}
                        className={`text-[10px] font-mono flex items-center gap-1.5 px-2 py-0.5 rounded border transition-all cursor-pointer ${
                          post.isPinned 
                            ? "bg-amber-950/40 text-amber-400 border-amber-900" 
                            : "bg-[#141630] text-slate-400 border-white/5 hover:text-white"
                        }`}
                        title="Épingler ce sujet en tête du forum"
                      >
                        <Pin className="w-2.5 h-2.5" />
                        {post.isPinned ? "Désépingler" : "Épingler"}
                      </button>
                    )}

                    {canDeletePost && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="text-[10px] font-mono text-rose-400 hover:text-rose-300 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer"
                        title="Supprimer ce post"
                      >
                        <Trash2 className="w-3 h-3" />
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>

                {/* Question Details */}
                <div className="p-5 md:p-6 flex flex-col gap-4">
                  <div className="flex gap-4">
                    {/* Author badge layout */}
                    <div className="hidden md:flex flex-col items-center gap-1 shrink-0 bg-[#0e1026] border border-white/5 rounded-2xl p-3 w-28 text-center text-xs">
                      {post.authorAvatar ? (
                        <img 
                          src={post.authorAvatar} 
                          alt="avatar" 
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full border border-violet-500/30 object-cover" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
                          <User className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                      <span className="font-heading font-black text-slate-300 truncate w-full" title={post.authorName}>
                        {post.authorName}
                      </span>
                      {post.authorEmail === ADMIN_EMAIL ? (
                        <span className="text-[8px] bg-amber-950 text-amber-400 border border-amber-900 font-mono px-1 py-0.2 rounded font-black tracking-widest uppercase">
                          Admin
                        </span>
                      ) : (
                        <span className="text-[8px] bg-slate-900 text-slate-500 font-mono px-1 py-0.2 rounded">
                          Pirate
                        </span>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col gap-2.5">
                      {/* Mobile Profile bar */}
                      <div className="md:hidden flex items-center gap-2 mb-1 text-xs">
                        {post.authorAvatar ? (
                          <img src={post.authorAvatar} alt="avatar" className="w-5 h-5 rounded-full object-cover" />
                        ) : (
                          <User className="w-4.5 h-4.5 text-slate-400" />
                        )}
                        <span className="font-black text-slate-300">{post.authorName}</span>
                        {post.authorEmail === ADMIN_EMAIL && (
                          <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1 rounded">Admin</span>
                        )}
                      </div>

                      <h3 className="text-lg md:text-xl font-heading font-bold text-white tracking-tight">
                        {post.title}
                      </h3>
                      
                      <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                        {post.content}
                      </p>
                    </div>
                  </div>

                  {/* Replies segment */}
                  <div className="border-t border-white/5 mt-3 pt-4">
                    <h4 className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-3 block font-bold">
                      Réponses des flibustiers ({post.replies?.length || 0}) :
                    </h4>

                    {/* Replies stack */}
                    {post.replies && post.replies.length > 0 ? (
                      <div className="flex flex-col gap-3.5 mb-5 pl-0 md:pl-10">
                        {post.replies.map((reply) => {
                          const isReplyOwner = playerEmail === reply.authorEmail;
                          const canDeleteReply = isAdmin || isReplyOwner;
                          return (
                            <div 
                              key={reply.replyId} 
                              className={`p-3.5 rounded-xl border flex gap-3 relative ${
                                reply.authorEmail === ADMIN_EMAIL 
                                  ? "bg-[#1d1b33]/40 border-amber-500/20" 
                                  : "bg-[#0c0d1e] border-white/5"
                              }`}
                            >
                              {reply.authorAvatar ? (
                                <img 
                                  src={reply.authorAvatar} 
                                  alt="avatar" 
                                  referrerPolicy="no-referrer"
                                  className="w-7 h-7 rounded-full border border-white/10 shrink-0 object-cover mt-0.5" 
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/5 mt-0.5">
                                  <User className="w-4 h-4 text-slate-500" />
                                </div>
                              )}

                              <div className="flex-1 flex flex-col gap-1 text-xs">
                                <div className="flex items-center gap-2 justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="font-black text-slate-300">{reply.authorName}</span>
                                    {reply.authorEmail === ADMIN_EMAIL && (
                                      <span className="text-[8px] bg-amber-950 text-amber-400 border border-amber-900 font-mono px-1.5 py-0.2 rounded font-black uppercase">
                                        Administrateur
                                      </span>
                                    )}
                                  </div>

                                  {/* Delete reply helper */}
                                  {canDeleteReply && (
                                    <button
                                      onClick={() => handleDeleteReply(post.id, reply.replyId)}
                                      className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                                      title="Supprimer la réponse"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>

                                <p className="text-slate-300 font-sans mt-0.5 leading-relaxed whitespace-pre-wrap">
                                  {reply.content}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-xs text-slate-500 bg-white/1 px-4 rounded-xl mb-4 italic">
                        Aucun message d'aide posté ici... Soyez le premier à lui prêter secours !
                      </div>
                    )}

                    {/* Write a reply input field */}
                    <div className="flex items-center gap-3 bg-[#11132a] border border-white/5 rounded-2xl p-2 md:pl-4 pl-3">
                      <input
                        type="text"
                        placeholder={playerEmail ? "Saisir votre réponse utile..." : "Vérifiez votre connexion au hub pour répondre"}
                        disabled={!playerEmail}
                        value={replyInput[post.id] || ""}
                        onChange={(e) => setReplyInput(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddReply(post.id);
                        }}
                        className="flex-1 bg-transparent text-xs md:text-sm text-white focus:outline-none disabled:opacity-55"
                      />
                      <button
                        onClick={() => handleAddReply(post.id)}
                        disabled={!playerEmail || !(replyInput[post.id] || "").trim()}
                        className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-[#1b1c34] text-white font-mono uppercase font-black text-[10px] md:text-xs rounded-xl flex items-center gap-1.5 transition-all shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        <Send className="w-3 h-3 text-white" />
                        Répondre
                      </button>
                    </div>

                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

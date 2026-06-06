import React, { useState, useEffect, useRef } from "react";
import { 
  collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp 
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Send, MessageSquare, Anchor } from "lucide-react";

interface CrewChatProps {
  crewId: string;
  playerEmail: string;
  playerUsername: string;
  playerAvatar: string;
}

interface ChatMessage {
  id: string;
  senderEmail: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  createdAt: any;
}

export default function CrewChat({
  crewId,
  playerEmail,
  playerUsername,
  playerAvatar
}: CrewChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Écouter les messages en temps réel
  useEffect(() => {
    if (!crewId) return;

    const messagesRef = collection(db, "crews", crewId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"), limit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgList: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        msgList.push({
          id: doc.id,
          senderEmail: data.senderEmail,
          senderName: data.senderName,
          senderAvatar: data.senderAvatar,
          text: data.text,
          createdAt: data.createdAt
        });
      });
      setMessages(msgList);
      
      // Auto-scroll
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }, (error) => {
      console.warn("[Firebase Quota] Erreur de synchronisation du chat d'équipage :", error.message || error);
    });

    return () => unsubscribe();
  }, [crewId]);

  // 2. Envoyer un message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading || !playerEmail) return;

    setLoading(true);
    const textToSend = inputText.trim();
    setInputText("");

    try {
      const messagesRef = collection(db, "crews", crewId, "messages");
      await addDoc(messagesRef, {
        senderEmail: playerEmail,
        senderName: playerUsername,
        senderAvatar: playerAvatar,
        text: textToSend,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Erreur lors de l'envoi du message:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatMessageTime = (createdAt: any) => {
    if (!createdAt) return "...";
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-150 p-5 shadow-2xs flex flex-col h-[480px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-violet-600" />
          <h5 className="font-heading font-black text-gray-950 text-xs uppercase tracking-wider">
            Escargophone d'Équipage
          </h5>
        </div>
        <span className="flex items-center gap-1 text-[9px] font-mono bg-emerald-50 text-emerald-700 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200/50">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
          En Ligne (Nakamas)
        </span>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto pr-1 mb-4 space-y-3 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
            <Anchor className="w-8 h-8 text-gray-200 animate-spin duration-3000 mb-2" />
            <p className="text-xs font-bold font-sans uppercase">Le canal de communication est désert...</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Soyez le premier à saluer vos Nakamas sur le pont !</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderEmail === playerEmail;
            return (
              <div 
                key={msg.id} 
                className={`flex gap-2.5 max-w-[85%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto text-left"}`}
              >
                {/* Avatar */}
                <img 
                  src={msg.senderAvatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(msg.senderName)}`} 
                  alt="Avatar"
                  className="w-7 h-7 rounded-lg object-cover bg-slate-50 border border-gray-100 shrink-0 self-end"
                />

                {/* Bulle de message */}
                <div className="flex flex-col space-y-0.5">
                  {!isMe && (
                    <span className="text-[9px] font-mono font-extrabold uppercase text-violet-600 px-1 truncate">
                      {msg.senderName}
                    </span>
                  )}
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed break-words shadow-3xs ${
                    isMe 
                      ? "bg-violet-600 text-white rounded-br-none" 
                      : "bg-slate-150/80 text-gray-800 rounded-bl-none"
                  }`}>
                    {msg.text}
                  </div>
                  <span className={`text-[8px] font-mono text-gray-400 ${isMe ? "text-right" : "text-left"} px-1.5 mt-0.5`}>
                    {formatMessageTime(msg.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-gray-100 pt-3">
        <input
          type="text"
          maxLength={300}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Écrire un message à l'équipage..."
          className="flex-1 bg-slate-100 p-3 rounded-2xl text-xs font-black text-slate-950 placeholder-slate-450 border border-slate-200 focus:bg-white outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
        />
        <button
          type="submit"
          disabled={loading || !inputText.trim()}
          className="p-3 bg-violet-600 hover:bg-violet-750 text-white rounded-2xl transition disabled:opacity-50 flex items-center justify-center shrink-0 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

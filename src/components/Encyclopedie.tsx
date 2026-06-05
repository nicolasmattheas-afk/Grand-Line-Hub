import React, { useState, useMemo } from "react";
import { Character } from "../types";
import { Search, Filter, ShieldCheck, HelpCircle, Compass, Anchor, User, Bookmark } from "lucide-react";

interface EncyclopedieProps {
  characters: Character[];
}

export default function Encyclopedie({ characters }: EncyclopedieProps) {
  const [query, setQuery] = useState("");
  const [selectedAffiliation, setSelectedAffiliation] = useState<string>("All");
  const [selectedFruit, setSelectedFruit] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [showTop150, setShowTop150] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  // Filtrage intelligent
  const filteredCharacters = useMemo(() => {
    let result = [...characters];

    if (showTop150) {
      // Trier par prime descendante et prendre les 150 plus grands
      result = result.sort((a, b) => (b.bounty || 0) - (a.bounty || 0)).slice(0, 150);
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      const matched = result.filter(c => 
        (c.name && c.name.toLowerCase().includes(q)) || 
        (c.crew && c.crew.toLowerCase().includes(q))
      );

      const scored = matched.map(c => {
        let score = 0;
        const nameLower = (c.name || "").toLowerCase();
        const crewLower = (c.crew || "").toLowerCase();

        if (nameLower === q) {
          score += 10000;
        } else if (nameLower.startsWith(q)) {
          score += 5000;
        } else if (nameLower.includes(" " + q)) {
          score += 4000;
        } else if (nameLower.includes(q)) {
          score += 1000;
        } else if (crewLower.includes(q)) {
          score += 100;
        }

        if (q === "kid" && nameLower === "eustass kid") {
          score += 20000;
        }
        if (q === "franky" && nameLower.includes("franky")) {
          score += 20000;
        }

        const majorNames = [
          "monkey d. luffy", "roronoa zoro", "vinsmoke sanji", "nami", "nicorobin", 
          "tony tony chopper", "god usopp", "franky [cutty flam]", "brook", "jinbe",
          "eustass kid", "trafalgar d. water law", "shanks", "kaidou", "marshall d. teach",
          "charlotte linlin", "gol d. roger", "edward newgate", "buggy"
        ];

        if (majorNames.some(m => nameLower === m || nameLower.startsWith(m))) {
          score += 500;
        }

        if (c.bounty && typeof c.bounty === "number") {
          score += Math.min(c.bounty / 1000000, 300);
        }

        return { char: c, score };
      });

      scored.sort((a, b) => b.score - a.score);
      result = scored.map(item => item.char);
    }

    if (selectedAffiliation !== "All") {
      result = result.filter(c => c.affiliation === selectedAffiliation);
    }

    if (selectedFruit !== "All") {
      if (selectedFruit === "Aucun") {
        result = result.filter(c => c.devilFruit === "Aucun");
      } else {
        result = result.filter(c => c.devilFruit !== "Aucun");
      }
    }

    if (selectedStatus !== "All") {
      result = result.filter(c => c.status === selectedStatus);
    }

    setPage(1); // Reset page on filter change
    return result;
  }, [characters, query, selectedAffiliation, selectedFruit, selectedStatus, showTop150]);

  // Pagination
  const paginatedCharacters = useMemo(() => {
    const startIdx = (page - 1) * itemsPerPage;
    return filteredCharacters.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredCharacters, page]);

  const totalPages = Math.ceil(filteredCharacters.length / itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 font-sans">
      <div className="text-center mb-8 relative">
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white font-heading mb-2 uppercase">
          ENCYCLOPÉDIE DE GRAND LINE
        </h2>
        <p className="text-slate-300 max-w-2xl mx-auto text-sm md:text-base font-medium">
          Consultez et étudiez les fiches descriptives des <span className="font-extrabold text-[#8b5cf6]">{characters.length} personnages</span> de la base de données pour parfaire vos connaissances stratégiques.
        </p>
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="bg-white rounded-3xl border-2 border-black p-5 shadow-xs mb-8 flex flex-col md:flex-row gap-4 items-center">
        {/* Recherche par nom */}
        <div className="relative w-full md:flex-1 bg-white border border-gray-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black rounded-xl px-3.5 py-2.5 flex items-center gap-2 transition-all">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Rechercher par nom d'alliés, ennemis, équipages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent text-sm text-[#1A1A1A] placeholder-gray-400 outline-hidden w-full border-none"
          />
        </div>

        {/* Filtre Affiliation */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-400 shrink-0 hidden sm:block" />
          <select
            value={selectedAffiliation}
            onChange={(e) => setSelectedAffiliation(e.target.value)}
            className="w-full md:w-44 bg-white border-2 border-black p-2.5 rounded-xl text-xs font-heading font-black uppercase text-[#1A1A1A] outline-hidden cursor-pointer"
          >
            <option value="All">Toutes Affiliations</option>
            <option value="Pirate">Pirates</option>
            <option value="Marine">Marine</option>
            <option value="Révolutionnaire">Révolutionnaires</option>
            <option value="Gouvernement">Gouvernement / CP</option>
            <option value="Civil">Civils</option>
          </select>
        </div>

        {/* Filtre Fruit du Démon */}
        <select
          value={selectedFruit}
          onChange={(e) => setSelectedFruit(e.target.value)}
          className="w-full md:w-44 bg-white border-2 border-black p-2.5 rounded-xl text-xs font-heading font-black uppercase text-[#1A1A1A] outline-hidden cursor-pointer"
        >
          <option value="All">Tous Fruits</option>
          <option value="Possédé">Avec Fruit</option>
          <option value="Aucun">Sans Fruit</option>
        </select>

        {/* Filtre Statut */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full md:w-44 bg-white border-2 border-black p-2.5 rounded-xl text-xs font-heading font-black uppercase text-[#1A1A1A] outline-hidden cursor-pointer mr-2"
        >
          <option value="All">Tout Statut</option>
          <option value="Vivant">Vivant</option>
          <option value="Décédé">Décédé</option>
        </select>

        {/* Toggle Top 150 */}
        <button
          type="button"
          onClick={() => setShowTop150(!showTop150)}
          className={`w-full md:w-auto px-4 py-2.5 rounded-xl text-xs font-heading font-black uppercase border-2 border-black cursor-pointer transition-all ${
            showTop150 
              ? "bg-[#8b5cf6] text-white border-[#8b5cf6]" 
              : "bg-white text-[#1A1A1A] hover:bg-slate-50"
          }`}
        >
          {showTop150 ? "★ Tout Afficher" : "★ Top 150 Notoriétés"}
        </button>
      </div>

      {/* Grille de fiches Wanted */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {paginatedCharacters.map((char) => (
          <div 
            key={char.id} 
            className="bg-white border-2 border-black hover:border-[#8b5cf6] rounded-3xl p-4 shadow-3xs hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden"
          >
            {/* Antique style WANTED detail */}
            <div className="border border-[#E5E7EB] p-3 rounded-2xl bg-[#FAFAFA] flex flex-col h-full justify-between">
              <div>
                {/* Image */}
                <div className="h-44 rounded-xl overflow-hidden border border-[#E5E7EB] bg-slate-100 relative mb-3">
                  <img 
                    src={char.image} 
                    alt={char.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-555"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/200x300/1a1a1a/ffffff?text=?";
                    }}
                  />
                  {/* Tag Crew */}
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-[#1A1A1A]/95 text-[9px] text-white rounded font-mono uppercase font-bold tracking-wider">
                    {char.crew !== null && char.crew !== undefined && char.crew !== "" ? char.crew : "Inconnu"}
                  </div>
                </div>
 
                {/* Nom & Description */}
                <div>
                  <h3 className="font-heading font-black text-lg text-[#1A1A1A] uppercase tracking-tighter truncate leading-none">
                    {char.name}
                  </h3>
                  <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-3 mt-2 h-12 font-medium">
                    "{char.description}"
                  </p>
                </div>
              </div>
 
              {/* Attributs Badge */}
              <div className="mt-4 pt-3 border-t border-[#E5E7EB]">
                {/* Bounty */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-mono tracking-widest text-gray-400 uppercase font-black">Bounty</span>
                  <span className="font-mono text-sm font-black text-emerald-600">
                    {char.bounty !== null && char.bounty !== undefined && char.bounty > 0 
                      ? `${char.bounty.toLocaleString("fr-FR").replace(/\u202f/g, " ")} ฿` 
                      : (char.bounty === 0 ? "0 ฿" : "Inconnu")}
                  </span>
                </div>

                {/* Sub-details (Age, Taille, Fruit) */}
                <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-[9px] text-gray-500 font-semibold pt-1">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3 text-[#8b5cf6]" />
                    <span>{char.age !== null && char.age !== undefined && char.age !== "Inconnu" && char.age !== "" ? `${char.age} ans` : "Inconnu"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Anchor className="w-3 h-3 text-[#8b5cf6]" />
                    <span>{char.height !== null && char.height !== undefined && char.height !== "Inconnu" && char.height !== "" ? `${char.height} cm` : "Inconnu"}</span>
                  </div>
                  <div className="flex items-center gap-1 col-span-2 truncate">
                    <Bookmark className="w-3 h-3 text-[#8b5cf6]" />
                    <span className="truncate" title={char.devilFruitName}>
                      {char.devilFruitName !== null && char.devilFruitName !== undefined && char.devilFruitName !== "" && char.devilFruitName !== "Aucun" && char.devilFruitName !== "Inconnu"
                        ? char.devilFruitName
                        : (char.devilFruitName === "Aucun" ? "Sans Fruit" : "Inconnu")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Faction Emblem Watermark in corner */}
            <div className="absolute -top-3 -right-3 w-10 h-10 bg-slate-900/5 rotate-12 flex items-center justify-center font-heading text-xs uppercase font-black tracking-widest text-[#443525] select-none">
              OP
            </div>
          </div>
        ))}

        {filteredCharacters.length === 0 && (
          <div className="col-span-full py-16 text-center text-gray-500 font-sans">
            <Compass className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="font-heading font-bold text-gray-900 text-lg">Aucun pirate dans ces coordonnées maritimes !</p>
            <p className="text-sm text-gray-400 mt-1">Ajustez vos filtres de recherche.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-12 mb-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="px-4 py-2 bg-white text-gray-700 border border-gray-100 rounded-xl text-xs font-heading font-bold hover:bg-gray-50 disabled:opacity-40 cursor-pointer shadow-3xs"
          >
            ← Navire précédent
          </button>
          
          <span className="text-xs font-mono text-gray-500">
            Page <span className="font-bold text-gray-900">{page}</span> sur <span className="font-bold text-gray-900">{totalPages}</span>
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="px-4 py-2 bg-white text-gray-700 border border-gray-100 rounded-xl text-xs font-heading font-bold hover:bg-gray-50 disabled:opacity-40 cursor-pointer shadow-3xs"
          >
            Navire suivant →
          </button>
        </div>
      )}
    </div>
  );
}

import React, { useMemo } from "react";
import { Character } from "../types";
import { Link } from "react-router-dom";
import { ArrowLeft, Swords, ShieldCheck, Compass, Anchor, User } from "lucide-react";

interface CharacterPageProps {
  characters: Character[];
  characterId: string;
}

export default function CharacterPage({ characters, characterId }: CharacterPageProps) {
  const character = useMemo(() => {
    // Essayons de trouver par ID ou par nom "url-ifié"
    return characters.find(c => 
      c.id === characterId || 
      c.name.toLowerCase().replace(/[^a-z0-9]/g, '-') === characterId
    );
  }, [characters, characterId]);

  if (!character) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center font-sans">
        <Compass className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h1 className="text-3xl font-black text-white font-heading uppercase mb-2">Personnage Introuvable</h1>
        <p className="text-slate-400 mb-8">Ce pirate a échappé à nos radars ou n'existe pas dans notre base de données.</p>
        <Link to="/encyclopedia" className="bg-violet-600 hover:bg-violet-500 text-white font-heading font-black uppercase text-xs px-6 py-3 rounded-xl transition-all inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Retour à l'Encyclopédie
        </Link>
      </div>
    );
  }

  const getAffiliationIcon = (affiliation: string) => {
    switch (affiliation) {
      case "Pirate": return <Anchor className="w-5 h-5 text-gray-900" />;
      case "Marine": return <ShieldCheck className="w-5 h-5 text-gray-900" />;
      case "Gouvernement": return <Compass className="w-5 h-5 text-gray-900" />;
      default: return <User className="w-5 h-5 text-gray-900" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 font-sans">
      <Link to="/encyclopedia" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold mb-8 uppercase tracking-widest">
        <ArrowLeft className="w-4 h-4" /> Encyclopédie
      </Link>

      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-2xl border-4 border-black text-slate-900">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          {/* Colonne Image */}
          <div className="w-full md:w-1/3 shrink-0">
            <div className="rounded-2xl overflow-hidden border-4 border-black bg-slate-100 shadow-xl aspect-[3/4] relative">
              <img 
                src={character.image} 
                alt={character.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(character.name)}`;
                }}
              />
              <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-black/90 to-transparent pt-12 pb-4 px-4">
                <span className="bg-black/50 backdrop-blur-md border border-white/20 text-white text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full font-bold">
                  Dossier #{character.id.substring(0,6)}
                </span>
              </div>
            </div>
          </div>

          {/* Colonne Infos */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="flex items-center gap-1.5 bg-slate-100 border-2 border-black px-3 py-1 rounded-xl text-xs font-black uppercase tracking-widest">
                {getAffiliationIcon(character.affiliation)}
                {character.affiliation}
              </span>
              {character.isSwordsman && (
                <span className="bg-violet-100 text-violet-800 border-2 border-violet-800 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                  <Swords className="w-3.5 h-3.5" /> Sabreur
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-6xl font-black font-heading uppercase tracking-tighter mb-4 leading-none text-black">
              {character.name}
            </h1>

            {character.bounty ? (
              <div className="bg-amber-100 border-l-4 border-amber-500 p-4 mb-6">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-amber-700 font-bold mb-1">Dernière Prime Connue</span>
                <span className="text-2xl font-black font-mono tracking-tighter text-amber-900">
                  ฿ {character.bounty.toLocaleString("fr-FR").replace(/\u202f/g, " ")}
                </span>
              </div>
            ) : (
              <div className="bg-slate-100 border-l-4 border-slate-400 p-4 mb-6">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold mb-1">Dernière Prime Connue</span>
                <span className="text-xl font-black font-mono tracking-tighter text-slate-700">
                  Inconnue / Non applicable
                </span>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-2 border-b-2 border-slate-100 pb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  Rapport Classifié - Niveau de Menace
                </h3>
                
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-4 shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                  <p className="font-mono text-[10px] text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-200 pb-1">
                    [SOURCE : QUARTIER GÉNÉRAL DE LA MARINE / BASE DE DONNÉES SECRÈTE]
                  </p>
                  <p className="text-slate-800 leading-relaxed text-base font-medium whitespace-pre-wrap font-sans">
                    <strong>Sujet d'observation :</strong> {character.name}<br/>
                    <strong>Statut d'activité :</strong> {(character.status as string) === 'Vivant' || (character.status as string) === 'Alive' ? 'En circulation - À appréhender' : (character.status as string) === 'Décédé' || (character.status as string) === 'Deceased' ? 'Décédé(e)' : 'Inconnu'}<br/>
                    <strong>Menace financière évaluée :</strong> {character.bounty ? `฿ ${character.bounty.toLocaleString("fr-FR").replace(/\u202f/g, " ")}` : 'Non applicable / Cachée'}<br/>
                    <br/>
                    <span className="text-slate-600 italic">Extrait du dossier n°{character.id.substring(0,8).toUpperCase()} :</span><br/>
                    "{character.description}"
                  </p>
                </div>
                
                <div className="bg-[#fff9e6] border border-amber-200 rounded-xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                  <p className="font-heading font-black text-xs text-amber-600 uppercase tracking-widest mb-2 border-b border-amber-200/50 pb-1">
                    🗞️ ÉDITION SPÉCIALE - LE PETIT JOURNAL DE MORGANS 🗞️
                  </p>
                  <p className="text-slate-800 leading-relaxed text-sm font-serif">
                    <strong>BIG NEWS ! SCOOP EXCLUSIF !</strong> Nos journalistes de la <em>World Economy News Paper</em> viennent de mettre la main sur des informations brûlantes ! 
                    Il semblerait que le fameux <strong>{character.name}</strong>, tristement célèbre dans les rangs de {character.affiliation === 'Pirate' ? 'la dangereuse piraterie' : character.affiliation === 'Marine' ? 'la respectable Marine' : `l'organisation des ${character.affiliation}`}, fasse encore parler de lui ! 
                    {character.crew ? ` Des rumeurs le lient intimement aux manigances de l'équipage ${character.crew} !` : ''}
                    {character.devilFruit ? ' Sans parler de ses mystérieuses capacités liées aux Fruits du Démon qui terrifient les mers !' : ''}
                    Restez connectés sur Grand Line Hub pour suivre ses moindres faits et gestes et l'affronter virtuellement dans nos duels de primes !
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t-2 border-slate-100">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-1">Équipage / Organisation</span>
                  <span className="font-bold text-sm text-slate-800">{character.crew || "Solitaire / Inconnu"}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-1">Fruit du Démon</span>
                  <span className="font-bold text-sm text-slate-800">{character.devilFruit ? "Oui" : "Non ou Inconnu"}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-1">Statut Actuel</span>
                  <span className="font-bold text-sm text-slate-800">{(character.status as string) === "Vivant" || (character.status as string) === "Alive" ? "En vie" : (character.status as string) === "Décédé" || (character.status as string) === "Deceased" ? "Décédé(e)" : "Inconnu"}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

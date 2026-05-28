/**
 * Types globaux pour GRAND LINE HUB
 */

export interface Character {
  id: string; // Identifiant unique
  name: string; // Nom exact du personnage
  description: string; // Courte phrase explicative
  bounty: number; // Valeur numérique de la prime en Berrys (0 si aucune)
  crew: string; // Équipage ou groupe d'affiliation
  devilFruit: "Logia" | "Paramecia" | "Zoan" | "Zoan Mythique" | "Aucun";
  devilFruitName: string; // Nom exact du Fruit du démon ("" si aucun)
  haki: ("Kenbunshoku" | "Busoshoku" | "Haoshoku")[]; // Liste des hakis maîtrisés
  affiliation: "Pirate" | "Marine" | "Gouvernement" | "Révolutionnaire" | "Civil";
  gender: "Homme" | "Femme" | "Non-Binaire";
  status: "Vivant" | "Décédé";
  originArc: string; // Arc d'introduction
  image: string; // URL de l'image (CDN stable ou fallback illustré)
  age: number | string | null | undefined; // Âge actuel ou à la mort
  height: number | string | null | undefined; // Taille en cm
  race?: string; // Race du personnage
}

export type BountyRank = 
  | "Roi des pirates" 
  | "Yonko" 
  | "Shishibukai" 
  | "Supernova" 
  | "Second d'empereur" 
  | "Commandant d'empereur" 
  | "Combattant de l'équipage" 
  | "Membre de l'équipage" 
  | "Chasseur de prime" 
  | "Mousse";

export interface PlayerStats {
  bounty: number; // Prime globale du joueur
  rank: BountyRank; // Rang/Titre actuel
  duelHighScore: number; // High score dans le Bounty Duel
  gridWins: number; // Victoires dans la grille 3x3
  gridLosses: number; // Défaites dans la grille 3x3
  trackerWins: number; // Réussites de recherche mystère
  trackerPlays: number; // Nombre de parties du tracker
  history: GameLog[]; // Journal des parties
}

export interface GameLog {
  id: string;
  gameType: "Bounty Duel" | "Log Pose Tracker" | "Grand Line Grid";
  result: "Victoire" | "Défaite" | "Égalité" | "Score";
  detail: string;
  adjustment: string; // ex: "+50 000 000 ฿"
  timestamp: string;
}

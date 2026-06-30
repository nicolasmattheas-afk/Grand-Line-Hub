import React from "react";

/**
 * Gestionnaire d'erreur universel pour les images de personnages d'One Piece.
 * Évite les liens brisés (404 ou blocage hotlink de Fandom) en injectant
 * un placeholder haut de gamme assorti au thème sombre de Grand Line Hub.
 */
export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  affiliation?: string
) => {
  const target = e.currentTarget;
  if (target.dataset.fallback === "true") return; // Évite les boucles infinies
  target.dataset.fallback = "true";

  let label = "Flibustier";
  if (affiliation) {
    if (affiliation.toLowerCase().includes("marine")) label = "Marine";
    else if (affiliation.toLowerCase().includes("gouv") || affiliation.toLowerCase().includes("world")) label = "Gouvernement";
    else if (affiliation.toLowerCase().includes("revol") || affiliation.toLowerCase().includes("révol")) label = "Révolutionnaire";
    else if (affiliation.toLowerCase().includes("civil")) label = "Civil";
    else label = affiliation;
  }

  // Utilisation d'un placeholder stylisé sombre avec le label de la faction
  target.src = `https://placehold.co/200x300/0f172a/94a3b8?text=${encodeURIComponent(label)}`;
};

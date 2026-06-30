/**
 * Système de Toast Global pour GRAND LINE HUB
 * Permet de déclencher des notifications non-bloquantes haut de gamme
 */

export type ToastType = "success" | "error" | "info" | "warning";

export function showToast(message: string, type: ToastType = "info") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("show-toast", {
        detail: { message, type },
      })
    );
  }
}

// Remplacement transparent de alert(...)
export function pirateAlert(message: string, type: ToastType = "info") {
  showToast(message, type);
}

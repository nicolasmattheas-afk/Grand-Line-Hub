/**
 * Helper to determine if we should lock translation for specific elements.
 * Returns the "notranslate" CSS class for non-Oriental languages so Google Translate doesn't
 * translate character names to literal words.
 * Returns empty string for Japanese and Chinese to let Google Translate translate them.
 */
export function getNotranslateClass(): string {
  if (typeof window === "undefined") return "notranslate";
  const savedLang = localStorage.getItem("app-language");
  // If Japanese or Chinese (Mandarin), we want them translated to correct native characters
  if (savedLang === "ja" || savedLang === "zh-CN") {
    return "";
  }
  // Otherwise keep translation locked to prevent weird literal words translating character names
  return "notranslate";
}

import React, { useEffect, useState } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";

interface Language {
  code: string;
  name: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "zh-CN", name: "中文 (Mandarin)", flag: "🇨🇳" },
];

export const LanguageSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("fr");

  // Get direct cookie helper
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(";").shift() || null;
    }
    return null;
  };

  useEffect(() => {
    // 1. Try reading the saved user choice from localStorage first for maximum reliability
    const savedLang = localStorage.getItem("app-language");
    let activeLang = "";

    if (savedLang && LANGUAGES.some((l) => l.code === savedLang)) {
      activeLang = savedLang;
      setCurrentLang(savedLang);
    } else {
      // 2. Fallback to check standard googtrans translation cookie
      const googtrans = getCookie("googtrans");
      if (googtrans) {
        try {
          const decoded = decodeURIComponent(googtrans);
          const parts = decoded.split("/");
          const lang = parts[parts.length - 1];
          if (lang && LANGUAGES.some((l) => l.code === lang)) {
            activeLang = lang;
            setCurrentLang(lang);
            // Sync to local storage
            localStorage.setItem("app-language", lang);
          }
        } catch (e) {
          console.error("Error reading googtrans cookie:", e);
        }
      }

      // 3. Brand New Auto-Detect: If no previous choices exist, detect via browser default settings
      if (!activeLang) {
        const browserLang = (navigator.language || (navigator as any).userLanguage || "fr").toLowerCase();
        const primaryCode = browserLang.split("-")[0]; // e.g., "ja" from "ja-JP"

        // Check if the browser language is one of our fully supported languages
        if (LANGUAGES.some((l) => l.code === primaryCode)) {
          activeLang = primaryCode;
          setCurrentLang(primaryCode);
          localStorage.setItem("app-language", primaryCode);
        } else {
          // Absolute fallback default translates to standard French
          activeLang = "fr";
          setCurrentLang("fr");
          localStorage.setItem("app-language", "fr");
        }
      }
    }

    // Force synchronize choice to cookie so the Google translation script reads it and translates on boot
    const domain = window.location.hostname;
    document.cookie = `googtrans=/fr/${activeLang}; path=/; SameSite=None; Secure;`;
    document.cookie = `googtrans=/fr/${activeLang}; path=/; domain=${domain}; SameSite=None; Secure;`;
    if (domain.includes(".")) {
      const parts = domain.split(".");
      if (parts.length >= 2) {
        const rootDomain = parts.slice(-2).join(".");
        document.cookie = `googtrans=/fr/${activeLang}; path=/; domain=.${rootDomain}; SameSite=None; Secure;`;
      }
    }

    // Set up Google Translate callback
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: "fr",
          includedLanguages: "en,es,ja,de,fr,it,zh-CN",
          layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    // Inline loading of the official standard script safely with correct onload handler
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleLanguageChange = (langCode: string) => {
    setCurrentLang(langCode);
    setIsOpen(false);

    // Save to localStorage so state is persisted solidly across refreshes
    localStorage.setItem("app-language", langCode);

    // Write the necessary cookies for Google Translate element to apply on page load/redraw
    // Mandatorily include SameSite=None; Secure for secure iframe sandboxed environments in AI Studio
    const domain = window.location.hostname;
    document.cookie = `googtrans=/fr/${langCode}; path=/; SameSite=None; Secure;`;
    document.cookie = `googtrans=/fr/${langCode}; path=/; domain=${domain}; SameSite=None; Secure;`;
    // For cloud run and complex domain layers
    if (domain.includes(".")) {
      const parts = domain.split(".");
      if (parts.length >= 2) {
        const rootDomain = parts.slice(-2).join(".");
        document.cookie = `googtrans=/fr/${langCode}; path=/; domain=.${rootDomain}; SameSite=None; Secure;`;
      }
    }

    // Try programmatically trigger select element within Google Translate combo box for instant feedback
    const selectEl = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (selectEl) {
      selectEl.value = langCode;
      selectEl.dispatchEvent(new Event("change"));
    } else {
      // Prompt automatic page redraw/refresh to kick-off cookie transition instantly after cookie write
      window.location.reload();
    }
  };

  const activeLanguage = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  return (
    <div className="relative inline-block text-left z-50 shrink-0">
      
      {/* Invisible off-screen container (not display:none so browser DOM fully constructs the combo element) */}
      <div 
        id="google_translate_element" 
        style={{ 
          position: "absolute", 
          top: "-9999px", 
          left: "-9999px", 
          opacity: 0, 
          pointerEvents: "none",
          width: "1px",
          height: "1px",
          overflow: "hidden"
        }}
      ></div>

      {/* Trigger Button with styled One Piece theme styling */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 md:gap-2 h-10 px-2.5 md:px-4 rounded-xl border border-white/10 bg-[#11142A]/85 hover:bg-[#1C2042]/85 text-slate-300 hover:text-white transition-all shadow-lg text-xs md:text-sm font-sans font-semibold cursor-pointer select-none h-10 w-auto md:h-[50px] hover:border-violet-500/40"
        aria-expanded="true"
        aria-haspopup="true"
      >
        <Globe className="w-3.5 h-3.5 md:w-4 md:h-4 text-violet-400" />
        <span className="hidden sm:inline font-medium uppercase tracking-wider">{activeLanguage.flag} {activeLanguage.code}</span>
        <span className="sm:hidden">{activeLanguage.flag}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-2xl bg-[#0F1123] border border-violet-900/40 ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden transform opacity-100 scale-100 transition-all font-sans">
            <div className="py-1" role="menu" aria-orientation="vertical">
              <div className="px-3 py-2 border-b border-violet-950/40 text-[10px] font-mono tracking-widest text-violet-400 font-extrabold uppercase bg-[#0A0C17]/60">
                Choisir la langue
              </div>
              {LANGUAGES.map((lang) => {
                const isSelected = lang.code === currentLang;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-xs text-left cursor-pointer transition-all ${
                      isSelected
                        ? "bg-violet-900/40 text-violet-300 font-bold"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                    role="menuitem"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm shrink-0">{lang.flag}</span>
                      <span className="tracking-wide font-medium">{lang.name}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-violet-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

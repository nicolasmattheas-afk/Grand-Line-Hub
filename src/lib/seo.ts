/**
 * SEO Optimization Tool for Grand Line Hub
 * 100% Free, dynamic, and extremely effective for all search engines (Google, Yahoo!, Baidu, Bing, DuckDuckGo)
 */

interface LocalizedMetadata {
  title: string;
  description: string;
  keywords: string;
}

const METADATA: Record<string, LocalizedMetadata> = {
  fr: {
    title: "Grand Line Hub - Jeux de société One Piece & Encyclopédie en ligne",
    description: "La plateforme n°1 de jeux de société One Piece gratuits ! Testez vos connaissances de pirate avec Bounty Duel, Pirate Shadow, Secret Alliances, Grand Line Grid, et découvrez l'encyclopédie ultime des primes.",
    keywords: "One Piece, jeux de société, Bounty Duel, Pirate Shadow, Grand Line, Luffy, Zorro, primes One Piece, cartes de primes, encyclopédie, mini-jeux gratuit",
  },
  en: {
    title: "Grand Line Hub - One Piece Board Games & Online Encyclopedia",
    description: "The #1 platform for free One Piece web board games! Test your pirate knowledge with Bounty Duel, Pirate Shadow, Secret Alliances, Grand Line Grid, and discover the ultimate bounty encyclopedia.",
    keywords: "One Piece, board games, Bounty Duel, Pirate Shadow, Grand Line, Luffy, Zoro, One Piece bounties, bounty cards, encyclopedia, free web games",
  },
  es: {
    title: "Grand Line Hub - Juegos de mesa de One Piece y enciclopedia en línea",
    description: "¡La plataforma n°1 de juegos de mesa gratuitos de One Piece! Pon a prueba tus conocimientos sobre piratas con Bounty Duel, Pirate Shadow, Secret Alliances, Grand Line Grid y descubre la enciclopedia de recompensas.",
    keywords: "One Piece, juegos de mesa, Bounty Duel, Pirate Shadow, Grand Line, Luffy, Zoro, recompensas de One Piece, carteles de recompenza, enciclopedia, juegos gratis",
  },
  de: {
    title: "Grand Line Hub - One Piece Brettspiele & Online-Enzyklopädie",
    description: "Die Plattform Nr. 1 für kostenlose One Piece Brettspiele! Teste dein Piratenwissen mit Bounty Duel, Pirate Shadow, Secret Alliances und Grand Line Grid und entdecke das ultimative Kopfgeld-Lexikon.",
    keywords: "One Piece, Brettspiele, Bounty Duel, Pirate Shadow, Grand Line, Ruffy, Zoro, One Piece Kopfgelder, Steckbriefe, Enzyklopädie, kostenlose Webspiele",
  },
  ja: {
    title: "グランドラインハブ - ワンピースのボードゲーム＆オンラインキャラクター百科事典",
    description: "無料のワンピースボードゲームプラットフォーム！『バウンティデュエル（賞金対決）』、『パイレーツシャドウ（船長の影）』、『シークレットアライアンス』、『グランドライングリッド』であなたの海賊スキルと知識を試しましょう。",
    keywords: "ワンピース, ボードゲーム, バウンティデュエル, パイレーツシャドウ, 麦わらの一味, ルフィ, ゾロ, 手配書, 賞金金, 百科事典, 無料ゲーム, グランドラインハブ",
  },
  it: {
    title: "Grand Line Hub - Giochi da tavolo di One Piece ed enciclopedia online",
    description: "La piattaforma n. 1 di giochi da tavolo gratuiti di One Piece! Metti alla prova le tue conoscenze sui pirati con Bounty Duel, Pirate Shadow, Secret Alliances e Grand Line Grid e scopri l'enciclopedia delle taglie.",
    keywords: "One Piece, giochi da tavolo, Bounty Duel, Pirate Shadow, Grand Line, Luffy, Zoro, taglie One Piece, fogli ricercati, enciclopedia, giochi web gratuiti",
  },
  "zh-CN": {
    title: "伟大航路枢纽 - 航海王/海贼王桌游与在线角色百科全书",
    description: "第一名的免费航海王（海贼王）网页桌游平台！通过悬赏对决、海盗之影、秘密同盟、伟大航路网格测试您的航海王知识，并探索终极悬赏金百科全书。",
    keywords: "航海王, 海贼王, 网页游戏, 桌游, 悬赏对决, 海盗之影, 伟大航路, 路飞, 索隆, 悬赏金, 手配书, 百科全书, 免费桌游",
  },
};

/**
 * Updates all critical metadata, HTML attributes, hreflangs, and JSON-LD structured schema dynamically
 */
export function updateDynamicSEO(langCode: string): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const code = METADATA[langCode] ? langCode : "fr";
  const metaObj = METADATA[code];

  // 1. Sync HTML language attribute
  document.documentElement.lang = code;

  // 2. Set dynamic Title
  document.title = metaObj.title;

  // 3. Sync meta tags
  setOrCreateMetaTag("description", metaObj.description);
  setOrCreateMetaTag("keywords", metaObj.keywords);

  // 4. OpenGraph SEO (Facebook, Discord, LinkedIn)
  setOrCreateMetaTag("og:title", metaObj.title, "property");
  setOrCreateMetaTag("og:description", metaObj.description, "property");
  setOrCreateMetaTag("og:type", "website", "property");
  setOrCreateMetaTag("og:locale", getLocaleString(code), "property");
  
  const siteUrl = window.location.origin + window.location.pathname;
  setOrCreateMetaTag("og:url", siteUrl, "property");

  // Keep a reliable default fallback card image for social shares
  setOrCreateMetaTag("og:image", window.location.origin + "/logo.png", "property");

  // 5. Twitter Card SEO
  setOrCreateMetaTag("twitter:card", "summary_large_image");
  setOrCreateMetaTag("twitter:title", metaObj.title);
  setOrCreateMetaTag("twitter:description", metaObj.description);
  setOrCreateMetaTag("twitter:image", window.location.origin + "/logo.png");

  // 6. Multi-language hreflang implementation (Super powerful for Search indexing!)
  setupHreflangTags(siteUrl);

  // 7. Structured JSON-LD Data for Google Rich Snippets
  setupStructuredSchema(metaObj, siteUrl, code);
}

/**
 * Helpers to get or create a meta tag safely
 */
function setOrCreateMetaTag(nameOrProperty: string, content: string, attributeName: "name" | "property" = "name"): void {
  let element = document.querySelector(`meta[${attributeName}="${nameOrProperty}"]`);
  
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attributeName, nameOrProperty);
    document.head.appendChild(element);
  }
  
  element.setAttribute("content", content);
}

/**
 * Returns clean locale codes
 */
function getLocaleString(lang: string): string {
  switch (lang) {
    case "fr": return "fr_FR";
    case "en": return "en_US";
    case "es": return "es_ES";
    case "de": return "de_DE";
    case "ja": return "ja_JP";
    case "it": return "it_IT";
    case "zh-CN": return "zh_CN";
    default: return "fr_FR";
  }
}

/**
 * Generates alternative language canonical referencing (hreflangs) dynamically
 */
function setupHreflangTags(baseUrl: string): void {
  // Clear any existing hreflang tags to prevent duplicates
  const existing = document.querySelectorAll("link[rel='alternate'][hreflang]");
  existing.forEach((el) => el.parentNode?.removeChild(el));

  const langs = ["fr", "en", "es", "de", "ja", "it", "zh-CN"];

  // Add lang alternates
  langs.forEach((l) => {
    const link = document.createElement("link");
    link.rel = "alternate";
    link.hreflang = l;
    link.href = `${baseUrl}?lang=${l}`;
    document.head.appendChild(link);
  });

  // Default fallback hreflang
  const defLink = document.createElement("link");
  defLink.rel = "alternate";
  defLink.hreflang = "x-default";
  defLink.href = baseUrl; // Will default search engine to the main page (French or browser-detected root)
  document.head.appendChild(defLink);
}

/**
 * Schema.org Rich Interactive Game Website Markup for optimal visual SERP snippets
 */
function setupStructuredSchema(meta: LocalizedMetadata, url: string, lang: string): void {
  const existing = document.getElementById("grand-line-seo-schema");
  if (existing) {
    existing.parentNode?.removeChild(existing);
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Grand Line Hub",
    "url": url,
    "description": meta.description,
    "inLanguage": lang,
    "publisher": {
      "@type": "Organization",
      "name": "Grand Line Hub Games"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${url}?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  const script = document.createElement("script");
  script.id = "grand-line-seo-schema";
  script.type = "application/ld+json";
  script.innerHTML = JSON.stringify(schema);
  document.head.appendChild(script);
}

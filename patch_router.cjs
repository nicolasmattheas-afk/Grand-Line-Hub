const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add imports
code = code.replace(
  'import { Play, Trophy, Users, Shield, History, Skull, Lock, Compass, Swords, Search, Flame, Crown, Navigation, Book, Target, HeartHandshake, EyeOff, LayoutDashboard, Settings, User, Medal, Map, ArrowUpRight, LogOut, Loader2, Info, ChevronRight, Menu, X, Check, Brain, MessageSquare, Newspaper, ShoppingBag, Sun, Moon, Link as LinkIcon, Edit, Trash2, Mail, Bell, Triangle, Type, PenTool, Sparkles, Image as ImageIcon } from "lucide-react";',
  'import { Play, Trophy, Users, Shield, History, Skull, Lock, Compass, Swords, Search, Flame, Crown, Navigation, Book, Target, HeartHandshake, EyeOff, LayoutDashboard, Settings, User, Medal, Map, ArrowUpRight, LogOut, Loader2, Info, ChevronRight, Menu, X, Check, Brain, MessageSquare, Newspaper, ShoppingBag, Sun, Moon, Link as LinkIcon, Edit, Trash2, Mail, Bell, Triangle, Type, PenTool, Sparkles, Image as ImageIcon } from "lucide-react";\nimport { useNavigate, useLocation } from "react-router-dom";'
);

// Replace useState
const targetState = '  const [activeTab, setActiveTab] = useState<"home" | "grid" | "tracker" | "duel" | "encyclopedia" | "dashboard" | "crew" | "pirateShadow" | "timeline" | "bountyTarget" | "alliances" | "leaderboard" | "wej" | "blog" | "pyramid" | "undercover" | "crossword" | "fusion" | "fourImages" | "boutique">("home");';

const newState = `  const location = useLocation();
  const navigate = useNavigate();
  const activeTabRaw = location.pathname.slice(1);
  const validTabs = ["home", "grid", "tracker", "duel", "encyclopedia", "dashboard", "crew", "pirateShadow", "timeline", "bountyTarget", "alliances", "leaderboard", "wej", "blog", "pyramid", "undercover", "crossword", "fusion", "fourImages", "boutique"];
  const activeTab = validTabs.includes(activeTabRaw) ? activeTabRaw : "home";
  
  const setActiveTab = (tab: string) => {
    navigate(\`/\${tab}\`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };`;

code = code.replace(targetState, newState);
fs.writeFileSync('src/App.tsx', code, 'utf8');
console.log("Patched React Router in App.tsx");

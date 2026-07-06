const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const importFirebaseRegex = /import \{ collection, doc, onSnapshot, getDoc, updateDoc, setDoc, serverTimestamp \} from "firebase\/firestore";/;
code = code.replace(importFirebaseRegex, 'import { collection, doc, onSnapshot, getDoc, updateDoc, setDoc, serverTimestamp, query, orderBy, limit } from "firebase/firestore";');

const stateHookRegex = /const \[activeTab, setActiveTab\] = useState<[^>]+>\("home"\);/;
const notificationStateCode = `
  const [hasNewBlogMessage, setHasNewBlogMessage] = useState(false);

  useEffect(() => {
    const postsQuery = query(collection(db, "blogPosts"), orderBy("createdAt", "desc"), limit(1));
    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      if (!snapshot.empty) {
        const latestPost = snapshot.docs[0].data();
        const latestTime = latestPost.createdAt?.toMillis ? latestPost.createdAt.toMillis() : Date.now();
        const lastViewed = Number(localStorage.getItem("lastViewedBlogAt") || "0");
        if (latestTime > lastViewed && activeTab !== "blog") {
          setHasNewBlogMessage(true);
        } else if (activeTab === "blog") {
          localStorage.setItem("lastViewedBlogAt", String(Date.now()));
          setHasNewBlogMessage(false);
        }
      }
    });
    return () => unsubscribe();
  }, [activeTab]);
`;

code = code.replace(stateHookRegex, match => match + '\n' + notificationStateCode);

const mobileBtnTarget = `<button
              onClick={() => { setActiveTab("blog"); setIsMobileMenuOpen(false); }}
              className={\`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all \${
                activeTab === "blog" 
                  ? "bg-violet-900 border-violet-500 text-white" 
                  : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
              }\`}
            >
              <MessageSquare className="w-5 h-5 text-amber-500" />
              <span className="text-[10px] font-heading font-extrabold tracking-wider uppercase">Blog & Bugs</span>
            </button>`;

const mobileBtnReplacement = `<button
              onClick={() => { setActiveTab("blog"); setIsMobileMenuOpen(false); }}
              className={\`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all relative \${
                activeTab === "blog" 
                  ? "bg-violet-900 border-violet-500 text-white" 
                  : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
              }\`}
            >
              {hasNewBlogMessage && (
                <span className="absolute top-2 right-2 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
              )}
              <MessageSquare className="w-5 h-5 text-amber-500" />
              <span className="text-[10px] font-heading font-extrabold tracking-wider uppercase">Blog & Bugs</span>
            </button>`;

code = code.replace(mobileBtnTarget, mobileBtnReplacement);

const desktopBtnTarget = `<button
                onClick={() => setActiveTab("blog")}
                className={\`px-3 py-2.5 md:px-4 md:py-3 rounded-xl text-[10px] md:text-[11px] font-heading font-extrabold tracking-widest uppercase transition-all flex items-center gap-2.5 shrink-0 cursor-pointer w-auto md:w-full md:justify-start \${
                  activeTab === "blog" 
                    ? "bg-violet-900 text-[#F8FAFC] border border-violet-500" 
                    : "text-slate-400 hover:text-white hover:bg-white/5 bg-transparent border border-transparent"
                }\`}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                <span>BLOG & BUGS</span>
              </button>`;

const desktopBtnReplacement = `<button
                onClick={() => setActiveTab("blog")}
                className={\`px-3 py-2.5 md:px-4 md:py-3 rounded-xl text-[10px] md:text-[11px] font-heading font-extrabold tracking-widest uppercase transition-all flex items-center gap-2.5 shrink-0 cursor-pointer w-auto md:w-full md:justify-start relative \${
                  activeTab === "blog" 
                    ? "bg-violet-900 text-[#F8FAFC] border border-violet-500" 
                    : "text-slate-400 hover:text-white hover:bg-white/5 bg-transparent border border-transparent"
                }\`}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                <span>BLOG & BUGS</span>
                {hasNewBlogMessage && (
                  <span className="absolute top-1/2 -translate-y-1/2 right-3 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                )}
              </button>`;

code = code.replace(desktopBtnTarget, desktopBtnReplacement);

fs.writeFileSync('src/App.tsx', code, 'utf8');
console.log("Patched App.tsx");

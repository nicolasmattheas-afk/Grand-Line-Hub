const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const mobileBoutique = `            <button
              onClick={() => { setActiveTab("boutique"); setIsMobileMenuOpen(false); }}
              className={\`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all \${
                activeTab === "boutique" 
                  ? "bg-violet-900 border-violet-500 text-white" 
                  : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
              }\`}
            >
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <span className="text-[10px] font-heading font-extrabold tracking-wider uppercase flex items-center justify-center gap-1.5 w-full"><span>Boutique</span><span className="text-[8px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-mono font-bold animate-pulse tracking-normal">NEW</span></span>
            </button>`;

code = code.replace(mobileBoutique + '\n\n', '');
code = code.replace(mobileBoutique + '\n', '');
code = code.replace(mobileBoutique, '');

const desktopBoutique = `              <button
                onClick={() => setActiveTab("boutique")}
                className={\`px-3 py-2.5 md:px-4 md:py-3 rounded-xl text-[10px] md:text-[11px] font-heading font-extrabold tracking-widest uppercase transition-all flex items-center gap-2.5 shrink-0 cursor-pointer w-auto md:w-full md:justify-start \${
                  activeTab === "boutique" 
                    ? "bg-violet-900 text-[#F8FAFC] border border-violet-500" 
                    : "text-slate-400 hover:text-white hover:bg-white/5 bg-transparent border border-transparent"
                }\`}
              >
                <ShoppingBag className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                <span className="flex items-center gap-2"><span>BOUTIQUE</span><span className="text-[8px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-mono font-bold animate-pulse tracking-normal">NEW</span></span>
              </button>`;

code = code.replace(desktopBoutique + '\n\n', '');
code = code.replace(desktopBoutique + '\n', '');
code = code.replace(desktopBoutique, '');


// Insert Mobile Boutique
const mobileHome = `            <button
              onClick={() => { setActiveTab("home"); setIsMobileMenuOpen(false); }}
              className={\`p-3.5 col-span-2 rounded-xl border flex items-center justify-center gap-3 transition-all \${
                activeTab === "home" 
                  ? "bg-violet-600 border-violet-555 text-white" 
                  : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
              }\`}
            >
              <Home className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-heading font-extrabold tracking-wider uppercase">ACCUEIL DE L'ÉQUIPAGE & HUB</span>
            </button>`;

code = code.replace(mobileHome, mobileHome + '\n\n' + mobileBoutique);

// Insert Desktop Boutique
const desktopHome = `              <button
                onClick={() => setActiveTab("home")}
                className={\`px-3 py-2.5 md:px-4 md:py-3 rounded-xl text-[10px] md:text-[11px] font-heading font-extrabold tracking-widest uppercase transition-all flex items-center gap-2.5 shrink-0 cursor-pointer w-auto md:w-full md:justify-start \${
                  activeTab === "home" 
                    ? "bg-violet-950 text-[#F8FAFC] border border-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.3)] animate-pulse" 
                    : "text-slate-250 hover:text-white hover:bg-white/10 bg-white/5 border border-white/5"
                }\`}
              >
                <Home className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span>ACCUEIL & HUB</span>
              </button>`;

code = code.replace(desktopHome, desktopHome + '\n\n' + desktopBoutique);

fs.writeFileSync('src/App.tsx', code, 'utf8');
console.log("Patched Boutique tab position");

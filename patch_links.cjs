const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import { Link } from "react-router-dom"')) {
  code = code.replace(
    'import { useNavigate, useLocation } from "react-router-dom";',
    'import { useNavigate, useLocation, Link } from "react-router-dom";'
  );
}

// Replace the game card wrapper
const oldCardWrapper = `<div 
                      key={game.id}
                      onClick={() => setActiveTab(game.id as any)}
                      className="bg-[#151838] border border-violet-500/25 hover:border-violet-400 rounded-2xl p-5 hover:bg-[#1c2049] transition-all duration-300 cursor-pointer group flex flex-col justify-between hover:-translate-y-1 relative overflow-hidden shadow-lg shadow-black/40 hover:shadow-violet-900/30 animate-in fade-in duration-200"
                    >`;
                    
const newCardWrapper = `<Link 
                      key={game.id}
                      to={\`/\${game.id}\`}
                      className="bg-[#151838] border border-violet-500/25 hover:border-violet-400 rounded-2xl p-5 hover:bg-[#1c2049] transition-all duration-300 cursor-pointer group flex flex-col justify-between hover:-translate-y-1 relative overflow-hidden shadow-lg shadow-black/40 hover:shadow-violet-900/30 animate-in fade-in duration-200 block"
                    >`;

code = code.replace(oldCardWrapper, newCardWrapper);
// We also need to change the closing </div> of the card to </Link>
// The card ends after:
//                         <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
//                       </div>
//                     </div>

const oldCardEnd = `                        <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                      </div>
                    </div>`;

const newCardEnd = `                        <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                      </div>
                    </Link>`;

code = code.replace(oldCardEnd, newCardEnd);

fs.writeFileSync('src/App.tsx', code, 'utf8');
console.log("Patched App.tsx with links");

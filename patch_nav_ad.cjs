const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = /<\/nav>\n\n            <div className="hidden md:block pt-6 border-t border-white\/10 mt-6 space-y-4">/;
const replacement = `</nav>

            <div className="hidden md:block pt-4 border-t border-white/10 mt-4">
              <a href="https://amzn.to/4vjdmcv" target="_blank" rel="noopener noreferrer" className="block relative group overflow-hidden rounded-xl border border-amber-500/30 hover:border-amber-400 transition-all hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                <img src="https://m.media-amazon.com/images/P/234407113X.01._SCLZZZZZZZ_.jpg" alt="One Piece Tome 114" className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500 aspect-[2/3]" />
                <div className="absolute bottom-0 left-0 w-full p-2.5 z-20">
                  <span className="text-[9px] bg-amber-500 text-amber-950 font-black px-1.5 py-0.5 rounded uppercase tracking-wider mb-1 block w-fit">Précommande</span>
                  <p className="text-white text-xs font-bold leading-tight font-heading group-hover:text-amber-400 transition-colors">One Piece - Tome 114</p>
                </div>
              </a>
            </div>

            <div className="hidden md:block pt-4 border-t border-white/10 mt-4 space-y-4">`;

code = code.replace(target, replacement);

fs.writeFileSync('src/App.tsx', code, 'utf8');
console.log("Patched App.tsx with Tome 114 link");

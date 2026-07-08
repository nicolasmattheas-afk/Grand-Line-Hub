const fs = require('fs');
let code = fs.readFileSync('src/components/BountyDuel.tsx', 'utf8');

const target = `                <div className="mb-8 p-4 bg-violet-950/40 border border-violet-800 rounded-2xl text-center shadow-inner">
                  <span className="text-[10px] text-pink-400 font-heading font-black uppercase block tracking-widest mb-1">🎁 PRIME SECRÈTE DE L'EXPLOIT 🎁</span>
                  <span className="text-2xl font-mono font-black text-emerald-400 tracking-wider">
                    + ฿ 20 000 000
                  </span>
                </div>`;

const replacement = ``;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/BountyDuel.tsx', code, 'utf8');
console.log("Patched UI BountyDuel.tsx");

const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/<span className="text-\[10px\] font-heading font-extrabold tracking-wider uppercase">Boutique ✨ NEW<\/span>/g, '<span className="text-[10px] font-heading font-extrabold tracking-wider uppercase flex items-center justify-center gap-1.5 w-full"><span>Boutique</span><span className="text-[8px] bg-pink-500 text-white px-1.5 py-0.5 rounded font-mono font-bold animate-pulse tracking-normal">NEW</span></span>');
code = code.replace(/<span>BOUTIQUE ✨ NEW<\/span>/g, '<span className="flex items-center gap-2"><span>BOUTIQUE</span><span className="text-[8px] bg-pink-500 text-white px-1.5 py-0.5 rounded font-mono font-bold animate-pulse tracking-normal">NEW</span></span>');

fs.writeFileSync('src/App.tsx', code, 'utf8');
console.log("Patched Boutique tab name with blinking NEW");

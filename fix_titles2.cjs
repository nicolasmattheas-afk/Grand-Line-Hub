const fs = require('fs');

const map = {
  "B07QC85Y41": "Peluche One Piece Tony Chopper",
  "B0842CBRWZ": "Peluche One Piece Tony Chopper",
  "B07QB8DKQT": "Figurine One Piece Sanji",
  "B084YS3KCH": "Figurine One Piece Zoro",
  "B07TJZYJCH": "Figurine One Piece Trafalgar Law",
  "B09S4CSV1R": "Figurine One Piece Ace",
  "B07Z75QZMG": "Figurine One Piece Sabo",
  "B0D1VSV5RJ": "Peluche Fruit du Démon Gomu Gomu no Mi",
  "B0F3D8H84L": "Lampe Fruit du Démon",
  "B0GSZSC1G7": "Veilleuse Décoration Chambre",
  "B0CW9ZR8W9": "Tirelire Pyro-Fruit",
  "B0DQYRC8YX": "Tirelire Ope Ope no Mi",
  "B0GSZFVTCH": "Veilleuse Décoration",
  "B0CW9ZYWM6": "Tirelire Escargophone",
  "B0DQYRJKM5": "Tirelire Escargophone",
  "B0FX3CFXVW": "Chope Escargophone",
  "B0DQYQM854": "Tirelire Escargophone Doflamingo",
  "B0DQYQVNKB": "Tirelire Escargophone Trafalgar Law",
  "B0DKTSFX6Q": "Tirelire Escargophone Zoro",
  "B0DYJZMR3D": "Funko Pop Tony Chopper",
  "B0CVNM5L6F": "Funko Pop Monkey D. Luffy",
  "B0F44CHHR6": "Figurine Anime Heroes Luffy Gear 5",
  "B0CVNN3VY1": "Funko Pop Nami",
  "B08FMSC7NC": "Funko Pop Roronoa Zoro",
  "B0CDJQT8XJ": "Funko Pop Monkey D. Luffy",
  "B0CVNLPB83": "Funko Pop Roronoa Zoro",
  "B0CVNXJQ6Z": "Funko Pop Sanji",
  "B0B6GCZPKX": "Funko Pop Jumbo Kaido Dragon",
  "B0DWDR21CF": "LEGO One Piece",
  "B0DZXSZ51T": "Funko Pop Animation",
  "B0198KU8PY": "Funko Pop Portgas D. Ace",
  "B0CDJDCSDH": "Funko Pop Katakuri",
  "B0G36FKGH6": "Funko Pop"
};

let code = fs.readFileSync('src/components/Boutique.tsx', 'utf8');

for (const [asin, newName] of Object.entries(map)) {
  const regex = new RegExp(`({ id: "(f_\\d+)", name: ")[^"]+(", category: "produits dérivés", link: "[^"]+", image: "https:\\/\\/m\\.media-amazon\\.com\\/images\\/P\\/${asin}\\.)`, "g");
  code = code.replace(regex, `$1${newName}$3`);
}

fs.writeFileSync('src/components/Boutique.tsx', code);
console.log("Done");

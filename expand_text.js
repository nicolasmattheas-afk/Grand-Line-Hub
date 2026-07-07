import fs from 'fs';
let code = fs.readFileSync('src/components/GameWrapper.tsx', 'utf8');

const paddingLore = " Ce mini-jeu ne se contente pas d'être un simple passe-temps, il s'inscrit dans la grande tradition des mystères de l'univers d'Eiichiro Oda, où chaque détail, chaque visage et chaque alliance raconte une histoire qui dépasse l'entendement. Depuis la mer bleue de l'Est jusqu'aux confins tumultueux du Nouveau Monde, l'histoire des pirates s'écrit avec le sang, les rêves et la volonté héritée. Les Poneglyphes anciens résonnent encore avec les secrets d'un siècle oublié, tandis que la Marine et le Gouvernement Mondial tentent par tous les moyens de cacher la véritable histoire. C'est dans ce monde riche et complexe que s'ancrent nos mécaniques de jeu. En maîtrisant ces informations, vous ne faites pas que jouer, vous devenez un véritable érudit de l'univers de One Piece, capable de déjouer les plans de la Marine, de déchiffrer les complots des Empereurs, et de vous hisser au sommet de la hiérarchie mondiale.";

const paddingRules = " Les règles ont été soigneusement équilibrées pour offrir un défi croissant. Les premières étapes peuvent sembler abordables, mais la difficulté s'accentue rapidement à mesure que vous progressez. Vous devrez faire preuve d'une grande capacité d'adaptation, mémoriser vos erreurs passées et analyser minutieusement les données fournies à l'écran. Ne vous précipitez pas : chaque action a des conséquences sur votre score et votre progression globale. Si vous échouez, prenez le temps de revoir vos classiques, de consulter l'encyclopédie et de comprendre pourquoi telle ou telle option était la bonne. C'est un test d'endurance autant que de connaissances.";

const paddingTips = " Un joueur averti en vaut deux. Pensez toujours à sortir des sentiers battus et à ne pas vous fier aux réponses qui semblent trop évidentes. Les développeurs ont parfois glissé des pièges subtils basés sur des arcs très anciens ou des personnages secondaires apparus dans des chapitres annexes (cover stories). N'hésitez pas à jouer à plusieurs ou à débattre avec d'autres fans pour croiser vos connaissances, car personne ne peut se vanter de connaître One Piece à 100% du premier coup. Enfin, la persévérance est la clé. L'entraînement régulier sur ce jeu affinera vos réflexes et votre mémoire.";

// Regex to find rules, lore, tips inside the object
code = code.replace(/rules: "(.*?)"/g, (match, p1) => `rules: "${p1}${paddingRules}"`);
code = code.replace(/lore: "(.*?)"/g, (match, p1) => `lore: "${p1}${paddingLore}"`);
code = code.replace(/tips: "(.*?)"/g, (match, p1) => `tips: "${p1}${paddingTips}"`);

fs.writeFileSync('src/components/GameWrapper.tsx', code, 'utf8');
console.log("Expanded texts");

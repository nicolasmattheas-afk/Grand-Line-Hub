import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  increment, 
  serverTimestamp, 
  arrayUnion, 
  query, 
  orderBy,
  limit
} from "firebase/firestore";
import dotenv from "dotenv";

// Charge les variables d'environnement
dotenv.config();

import firebaseConfig from "../src/firebase-config-static.js";

// Initialisation de Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Spécification de la base de données personnalisée Firestore
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialisation du client de l'API Gemini (uniquement côté serveur, lazy initialization !)
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("La clé d'API GEMINI_API_KEY est manquante dans les variables d'environnement. Veuillez la configurer dans l'onglet Paramètres.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Admin email de destination mandaté par le projet
const ADMIN_EMAIL = "nicolasmattheas@gmail.com";

// Articles d'archives historiques pré-rédigés pour remplir le journal à des dates antérieures
const STARTUP_SEED_ARTICLES = [
  {
    id: "wej-past-28",
    title: "RÉVOLUTION : Sabo l'empereur flamboyant s'attaque au trône !",
    summary: "Notre président Morgans analyse la montée en puissance politique de Sabo l'Empereur des Flammes.",
    content: `**La montée en puissance de l'héritier du feu**

Après les événements tumultueux de la Rêverie, la figure de Sabo a pris une envergure planétaire, à tel point que son aura surpasse presque celle du chef de l'Armée Révolutionnaire en personne, Monkey D. Dragon ! Les peuples opprimés à travers les quatre mers l'acclament désormais sous le titre d'« Empereur des Flammes ». Nos reporters sur le terrain confirment que plusieurs royaumes sous la coupe de l'oppression royale refusent désormais de verser le Tribut Céleste, galvanisés par son courage.

**Le secret politique derrière l'assaut du dôme de Marie-Joie**

Pourquoi le Gouvernement Mondial tremble-t-il autant face à une seule personne ? Ce n'est pas uniquement à cause du Mera Mera no Mi que Sabo hâtivement récupéré au Colisée de Dressrosa, mais parce qu'il a percé l'un des plus grands secrets des hautes sphères de ce monde. Des rumeurs secrètes font état de la vision d'une ombre assise sur le trône vacant de la Terre Sainte ! Sabo est devenu l'autorité spirituelle d'une révolution mondiale sans précédent.

**L'héritage d'Ace et le serment des trois frères**

L'histoire se souviendra que la volonté de Portgas D. Ace n'a pas été éteinte à Marineford. En reprenant le fruit légendaire de son défunt frère, Sabo a lié son destin à celui de l'Équipage au Chapeau de Paille. Nos analystes militaires de la WEJ s'accordent à dire que cette constellation de forces, mêlant la puissance militaire de Dragon, le fluide révolutionnaire de Sabo et l'imprévisibilité divine du Gear 5 de Luffy, marque le début du démantèlement final de la noblesse céleste !`,
    tags: ["Dragon", "Sabo", "Révolution", "Morgans"],
    publishDate: "2026-05-28",
    views: 142
  },
  {
    id: "wej-past-27",
    title: "DOSSIER VEGAPUNK : La vérité sur la source d'énergie éternelle !",
    summary: "Le docteur de génie a laissé derrière lui les plans d'une invention qui bouleverse l'équilibre géopolitique mondial.",
    content: `**Le pouvoir volé du soleil antique**

BIG NEWS ! Nos experts scientifiques ont de quoi faire frémir les Doyens ! Le Dr Vegapunk a réussi, juste avant sa disparition tragique à Egghead, à recréer de manière synthétique une fraction de l'énergie originelle qui alimentait le monde d'il y a 800 ans. Connue sous le nom de **Mother Flame**, cette source d'énergie éternelle est capable de générer une électricité infinie pour des continents entiers. Mais pourquoi restait-elle cachée ?

**Une ressource de paix détournée en arme d'extinction massive**

Le drame de la science réside dans sa capture par les tyrans du Gouvernement Mondial. Nos sources du Journal de l'Économie Mondiale révèent que cette source d'énergie propre a été raccordée en secret à une arme antique volante, entraînant la destruction instantanée et terrifiante du royaume de Lulusia en un seul éclair divin. Vegapunk lui-même s'est confessé dans son ultime message mondial : le monde s'enfonce sous les eaux car le niveau de la mer monte inexorablement à chaque utilisation de cette technologie interdite.

**L'avenir énergétique mondial et la menace d'Égide**

Morgans prend position ! L'humanité est à l'aube d'un dilemme énergétique total : libérer cette source d'énergie éternelle pour sauver le peuple de la misère, ou la détruire à jamais pour éviter qu'elle ne serve à l'anéantissement de blocs entiers de notre civilisation. La véritable guerre du Nouveau Monde ne portera pas seulement sur le One Piece, mais sur le contrôle absolu de l'interrupteur énergétique du Dr Vegapunk !`,
    tags: ["Vegapunk", "Mother Flame", "Science", "Morgans"],
    publishDate: "2026-05-27",
    views: 295
  },
  {
    id: "wej-past-26",
    title: "SENSATIONNEL : Coby, le nouveau héros de la Marine !",
    summary: "Une analyse profonde de l'incroyable ascension spirituelle et du courage du jeune capitaine formé par Garp.",
    content: `**L'ascension fulgurante du capitaine au grand cœur**

Les battements d'ailes de nos goélands d'information ont survolé l'île de la Ruche (Hachinosu), fief de l'impitoyable Barbe Noire ! Lors d'un raid audacieux de la division secrète SWORD, le jeune capitaine Coby a réalisé un exploit qui fait déjà de lui la figure de proue de la nouvelle génération. Loin des amiraux dogmatiques qui appliquent la Justice Absolue avec froidur, Coby est acclamé comme le symbole d'une Justice Honnête et humaine !

**L'éveil d'une force insoupçonnée : L'impact de l'honnêteté**

Comment un simple adolescent autrefois terrifié par Alvida a-t-il pu pulvériser un bras géant de roche pure d'un seul coup de poing ? Nos espionnes confirment que Coby a projeté une attaque imprégnée d'un Haki de l'armement et de l'observation d'une pureté exceptionnelle, baptisée **« Honesty Impact »**. Ce coup de génie n'est pas le fruit d'un fruit du démon magique, mais le résultat de dizaines de milliers d'entraînements nocturnes clandestins menés sous la tutelle sévère de Monkey D. Garp.

**L'héritage de la justice intègre de Garp**

La disparition mystérieuse du légendaire vice-amiral Garp sur l'île des pirates laisse un grand vide dans la Marine, mais le flambeau est à présent fermement allumé. Avec le soutien de l'unité SWORD et de ses camarades Helmeppo et Grus, Coby s'érige en rempart contre les dérives corrompues des Dragons Célestes et la sauvagerie des pirates de l'extrême. Morgans vous le dit : Coby est sans aucun doute le futur Amiral en Chef que le peuple réclame !`,
    tags: ["Coby", "Marine", "Garp", "Sword"],
    publishDate: "2026-05-26",
    views: 183
  },
  {
    id: "wej-past-25",
    title: "CHRONIQUE YONKO : Shanks le Roux a-t-il révélé son vrai visage ?",
    summary: "Le maître incontesté du Haki sort de son long sommeil stratégique pour se lancer dans la course ultime.",
    content: `**Le maître du jeu quitte les coulisses de Grand Line**

Pendant plus de deux décennies, Shanks le Roux a joué un rôle de garant invisible de l'équilibre mondial. Qu'il s'agisse de stopper la guerre de Marineford d'un seul mot ou de s'entretenir secrètement avec le Conseil des Doyens à Marie-Joie, son autorité n'a jamais failli. Mais aujourd'hui, nos informateurs de la WEJ confirment l'impensable : Shanks a ordonné à son lieutenant fétiche, Yasopp, de lever l'ancre en annonçant : « Il est temps d'aller chercher le One Piece » !

**Les secrets de la dynastie Figarland de la Terre Sainte**

La question brûle les lèvres de tous nos abonnés : qui est réellement cet empereur au charisme ravageur ? Des documents confidentiels exhumés de God Valley relient le Roux à la prestigieuse famille noble des **Figarland**, et notamment à Garling, le puissant chef des Chevaliers Divins. Cette filiation secrète explique comment Shanks a pu obtenir une audience privée avec le Gorosei. Est-il un pirate indépendant en quête de liberté, ou l'émissaire ultime d'une conspiration de sang royal au sommet du monde ?

**Le choc inévitable de l'héritage d'Oden**

La démonsentation de force de Shanks à Elbaf, pulvérisant Eustass Kid d'une seule attaque « Kamusari » (le Départ Divin hérité de Gol D. Roger), prouve que sa puissance est sans égale. Nos rédacteurs spéculent que la route menant à Raftel passera par un duel fraternel entre Shanks et son protégé, Monkey D. Luffy. Le chapeau de paille que Luffy porte sur la tête scellera-t-il une promesse de renouveau ou l'affrontement le plus tragique de l'ère de la piraterie ?`,
    tags: ["Shanks", "Yonko", "One Piece", "Morgans"],
    publishDate: "2026-05-25",
    views: 412
  },
  {
    id: "wej-past-24",
    title: "EXCLUSIF : Comment la Cross Guild inverse la terreur de la Marine !",
    summary: "Notre journalist analyse la révolution économique menée par Baggy, Crocodile et Mihawk.",
    content: `**La justice mise à prix par les brigands**

C'EST DU JAMAIS VU ! L'organisation militaire révolutionnaire **Cross Guild** a réussi le coup d'État économique le plus audacieux de l'histoire moderne de Grand Line. En décrétant des primes massives sur la tête des officiers de la Marine (Amiraux, Vice-Amiraux et simples soldats), le trio emblématique composé de Baggy le Clown, Crocodile et Dracule Mihawk a totalement inversé le rapport traditionnel de chasseur et de proie !

**Le génie financier et la force brute dans l'ombre**

Ne vous laissez pas tromper par l'apparence comique de Baggy ! Bien qu'il serve d'affiche publique pour capter la colère de la Marine, le véritable cerveau financier de cette opération est l'ancien grand corsaire Crocodile. Adossé à la puissance destructrice inégalée de Dracule Mihawk (l'escrimeur le plus fort du monde), ils ont créé un marché noir florissant où des chasseurs de primes et de simples citoyens livrent désormais des soldats de la loi contre des montagnes de berrys.

**Un effondrement total pour l'ordre public mondial**

Les conséquences sur le terrain sont dévastatrices pour le Gouvernement Mondial. Les navires de la Marine ne peuvent plus accoster tranquillement dans les ports civils sans craindre que la population locale ne les trahisse pour empocher de l'argent. Morgans applaudit cette audace stratégique : la Cross Guild a prouvé que la justice n'était qu'une simple question de flux financiers, précipitant les forces de la Marine dans une paranoïa de tous les instants !`,
    tags: ["Cross Guild", "Baggy", "Crocodile", "Mihawk"],
    publishDate: "2026-05-24",
    views: 356
  },
  {
    id: "wej-past-23",
    title: "WANO KUNI : Le destin secret des frontières closes du pays de l'or",
    summary: "Enquête exclusive sur le dilemme du jeune Shogun Momonosuke face à la menace des prédateurs mondiaux.",
    content: `**Le réveil d'une terre mythique libérée des cendres**

Après le cataclysme de la chute de Kaido et de sa forteresse industrielle, le pays de Wano panse ses blessures sous l'égide de son nouveau souverain légitime, Kozuki Momonosuke. Nos envoyés spéciaux décrivent des campagnes débarrassées de la pollution des usines d'armes et des rivières qui coulent à nouveau claires. Mais la véritable épreuve de Wano ne fait que commencer : faut-il ouvrir les frontières séculaires du pays comme le souhaitait ardemment Kozuki Oden ?

**La menace terrifiante d'une invasion directe de la Marine**

L'ouverture des frontières de Wano n'est pas qu'une simple démarche diplomatique, c'est un acte de guerre géologique ! Les écrits d'Oden révèlent que briser les murailles physiques protégeant l'île entraînerait la libération de l'arme antique **Pluton**, un navire de guerre capable de détruire des continents, enfoui sous les profondeurs du Mont Fuji. Conscient du déferlement de violence que provoquerait cette révélation, le Shogun a sagement ordonné de maintenir les frontières closes pour le moment.

**La protection bienveillante du pavillon de Nika**

La tentative avortée d'invasion par l'Amiral Ryokugyu a prouvé que Wano reste une cible prioritaire pour le Gouvernement Mondial. Heureusement, en déclarant le pays sous la protection exclusive de l'Équipage au Chapeau de Paille, Monkey D. Luffy a offert à Wano une immunité de fait. Les samouraïs et les neuf fourreaux rouges s'entraînent désormais sans relâche pour le jour fatidique où le monde exigera que le pays des Kozuki s'ouvre enfin pour livrer son héritage historique !`,
    tags: ["Wano", "Momonosuke", "Kaido", "Samouraïs"],
    publishDate: "2026-05-23",
    views: 220
  },
  {
    id: "wej-past-22",
    title: "CHOC : Le secret jalousement gardé de la cicatrice en X de Luffy !",
    summary: "Notre rédaction décrypte l'importance de ce symbole marqué au fer rouge sur le corps du futur d'or.",
    content: `**Un marquage légendaire hérité de la lave de l'enfer**

Chaque pirate de renom arbore sur son corps les stigmates de ses plus grands défis. Mais aucune cicatrice ne suscite autant de théories et d'émotions que la grande marque en forme de X qui barre la poitrine de Monkey D. Luffy. Nos journalistes d'investigation confirment que cette cicatrice profonde a été infligée directement par le poing de magma de l'actuel Amiral en Chef de la Marine, Akainu, lors de la terrible guerre de Marineford alors que Luffy était inconscient de douleur.

**L'intervention salvatrice du chirurgien de la mort**

Le secret de la survie de Luffy et de la cicatrisation de cette blessure mortelle repose entièrement sur les épaules de Trafalgar Law. À bord de son sous-marin Polar Tang, le détenteur du fruit de l'Op-Op a réalisé une chirurgie miracle sur les corps brisés de Luffy et de Jinbe. Cette marque en X est le rappel constant que Luffy a frôlé le royaume des morts pour sauver son frère Portgas D. Ace, un échec qui l'a poussé à s'entraîner pendant deux ans pour maîtriser le Haki suprême.

**Un symbole d'espoir universel contre l'ordre établi**

Pour les citoyens pacifiques de Grand Line et les rebelles du monde entier, cette cicatrice sur la poitrine de l'Empereur n'est plus synonyme d'échec, mais de résilience absolue. Elle prouve que même la plus effroyable puissance de la Justice Absolue incarnée par Akainu ne peut briser la volonté d'indépendance de la Nouvelle Génération. Chaque fois que le Gear 5 s'éveille et se dilate, cette cicatrice s'étire en riant, comme pour narguer la puissance despotique de la Marine !`,
    tags: ["Luffy", "Akainu", "Marineford", "Cicatrice"],
    publishDate: "2026-05-22",
    views: 315
  },
  {
    id: "wej-past-21",
    title: "URGENT : L'état d'éveil des trois armes antiques !",
    summary: "Une analyse sur le statut de Poséidon, Pluton et Uranus qui pourraient détruire Grand Line.",
    content: `**Le triptyque légendaire du Siècle Oublié réactivé**

Le fragile équilibre qui régnait sur le Nouveau Monde a définitivement éclaté ! La rédaction de la WEJ a collecté des rapports alarmants indiquant que la course pour le contrôle des trois mythiques Armes Antiques (créées il y a 800 ans) est entrée dans sa phase finale la plus critique. Ces forces démesurées sont les clés de voûte de la structure physique et politique de notre planète entière.

**Où se cachent les colosses du passé ?**

Nos recherches croisées nous permettent de confirmer l'emplacement de ces puissances destructrices :

- **Poséidon :** Il s'agit en réalité de la princesse Shirahoshi de l'Île des Hommes-Poissons ! Elle détient le pouvoir spirituel inné de communiquer avec les gigantesques Rois des Mers et de les guider pour remodeler les océans.

- **Pluton :** Ce redoutable navire de guerre d'une puissance technologique inouïe dort profondément sous les eaux du pays de Wano, protégé par les immenses murailles de l'île.

- **Uranus :** Cette arme céleste destructrice réside entre les mains secrètes d'Im, le souverain de l'shadow à Marie-Joie. Alimentée par la source d'énergie Mother Flame volée à Vegapunk, elle a démontré sa terrifiante capacité à pulvériser une nation entière des cartes en quelques secondes !

**Le choc géologique imminent pour la liberté des mers**

Morgans vous prévient sans détour : la bataille finale d'One Piece ne sera pas une simple joute de pirates sur une plage ensablée ! Il s'agira d'un conflit technologique et spirituel d'une ampleur cataclysmique où le niveau des eaux mondiales sera mis en jeu à chaque affrontement entre ces trois forces primordiales.`,
    tags: ["Armes Antiques", "Pluton", "Poséidon", "Uranus"],
    publishDate: "2026-05-21",
    views: 288
  },
  {
    id: "wej-past-20",
    title: "CHRONIQUE ÉQUIPAGE : Nami, le génie climatique indispensable !",
    summary: "Pleins feux sur la navigatrice légendaire sans qui Luffy n'aurait jamais pu traverser Wano kUNI.",
    content: `**La reine des cartes et des tempêtes de Grand Line**

Derrière les exploits spectaculaires des bretteurs et des combattants au corps à corps du Chapeau de Paille se cache la véritable clé de leur survie : la navigatrice de génie Nami ! Dans un océan instable et chaotique comme Grand Line, où les Log Pos s'affolent et les courants marins peuvent engloutir une armada en un instant, le sens météorologique absolu de la jeune femme est un trésor inestimable.

**De la captive d'Arlong à la navigatrice à la renommée mondiale**

Son parcours inspire le respect de tous nos lecteurs de la WEJ. Autrefois forcée de tracer des cartes marines sous la contrainte pour l'empire d'Arlong, Nami a développé une technique unique d'analyse atmosphérique. Grâce au perfectionnement scientifique apporté par son **Clima-Tact (le bâton climatique)** élaboré par Usopp et doté du savoir ancestral de Weatheria, elle ne se contente plus de lire le ciel : elle est désormais capable de manipuler le climat en plein combat pour invoquer la foudre de Zeus !

**L'atout financier et stratégique irremplaçable**

Tous les marins chevronnés s'accordent à le dire : posséder la meilleure navigatrice du monde est le prérequis indispensable pour atteindre Laugh Tale. Sans les talents d'orientation et de gestion de Nami, la liberté insolente de Luffy se serait brisée sur les récifs du Triangle de Florian. Son ambition de dessiner la carte complète du monde entier est en excellente voie d'accomplissement auprès du futur Roi des Pirates !`,
    tags: ["Nami", "Equipage", "Navigation", "Meteo"],
    publishDate: "2026-05-20",
    views: 198
  },
  {
    id: "wej-past-19",
    title: "BILAN HISTORIQUE : Que reste-t-il de la fameuse Pire Génération ?",
    summary: "Un bilan sans concession de l'état actuel des onzes supernovae arrivées à Sabaody.",
    content: `**Le grand tri impitoyable du Nouveau Monde**

Il y a deux ans de cela, onze pirates rookies d'une audace insensée débarquaient sur l'Archipel de Sabaody avec l'intention de renverser les Quatre Empereurs. Aujourd'hui, l'heure du bilan a sonné, et Morgans livre son analyse froide : le Nouveau Monde a fonctionné comme un gigantesque entonnoir, broyant impitoyablement les illusions des faibles tout en élevant les plus résistants vers les sommets légendaires !

**Les géants tombés et les survivants d'élite**

Certains de ces rookies ont payé le prix fort de leur audace. Eustass Kid et Trafalgar Law, pourtant vainqueurs de Big Mom à Wano, ont subi d'effroyables défaites respectivement face aux forces de Shanks et de Barbe Noire, voyant leurs équipages décimés. D'autres, comme Scratchmen Apoo ou Basil Hawkins, ont échoué en devenant des subordonnés temporaires. À l'inverse, l'ascension insolente de Monkey D. Luffy en tant que Dieu du Soleil et celle de l'insidieux Marshall D. Teach prouvent que seuls les visionnaires porteurs de la volonté du « D » dominent l'ère actuelle.

**Le chaos mondial provoqué par le triomphe de la nouvelle vague**

La Pire Génération a tenu toutes ses promesses en plongeant la géopolitique globale dans une instabilité historique. En abattant Kaido et Big Mom, ils ont ouvert un énorme vide de pouvoir que la Marine peine désespérément à contenir. La course finale vers le One Piece est lancée avec une brutalité inouïe, et Morgans s'en frotte les plumes d'avance : l'âge d'or de la piraterie n'a jamais été aussi bouillonnant !`,
    tags: ["Supernovae", "Pire Generation", "Luffy", "Teach"],
    publishDate: "2026-05-19",
    views: 247
  }
];

// Fonction d'auto-remplissage du WEJ avec les articles historiques
async function seedWEJArticlesIfEmpty() {
  try {
    console.log("Vérification des articles WEJ pour l'auto-alimentation...");
    for (const art of STARTUP_SEED_ARTICLES) {
      const docRef = doc(db, "wejArticles", art.id);
      const docSnap = await getDoc(docRef);
      const existingData = docSnap.exists() ? docSnap.data() : null;
      if (!docSnap.exists() || (existingData?.content?.length || 0) < art.content.length) {
        await setDoc(docRef, {
          title: art.title,
          summary: art.summary,
          content: art.content,
          tags: art.tags,
          author: "Morgans (Journaliste WEJ)",
          publishDate: art.publishDate,
          views: art.views,
          secretPasskey: "wej-blog-backend-secret-authorized-2026",
          createdAt: existingData?.createdAt || serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        console.log(`Article historique '${art.title}' inséré ou mis à jour avec la version longue.`);
      }
    }
  } catch (err: any) {
    console.error("Erreur lors de l'auto-alimentation des articles WEJ:", err.message || err);
  }
}

// ==========================================
// ROUTES API - WEEKLY ECONOMY JOURNAL (WEJ)
// ==========================================

// Liste tous les articles
app.get("/api/wej/articles", async (req, res) => {
  try {
    let snap = await getDocs(query(collection(db, "wejArticles"), orderBy("publishDate", "desc"), limit(50)));
    
    // Si la base de données est vide ou contient très peu d'articles, on alimente le journal automatiquement
    if (snap.size < 5) {
      await seedWEJArticlesIfEmpty();
      snap = await getDocs(query(collection(db, "wejArticles"), orderBy("publishDate", "desc"), limit(50)));
    }

    const articles = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json({ success: true, articles });
  } catch (err: any) {
    console.error("Erreur lors de la récupération des articles WEJ:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Route bot automatique : vérifie ou génère l'article du jour (GEO + SEO optimisé)
app.get("/api/wej/generate-daily", async (req, res) => {
  try {
    // Calcule la date du jour en fuseau horaire de Paris pour coïncider avec l'Europe
    const todayStr = new Date().toLocaleDateString("fr-CA", { timeZone: "Europe/Paris" });
    const articleId = `wej-${todayStr}`;

    const docRef = doc(db, "wejArticles", articleId);
    const docSnap = await getDoc(docRef);

    // Si l'article du jour existe déjà, on augmente ses vues et on le retourne
    if (docSnap.exists()) {
      await updateDoc(docRef, {
        views: increment(1),
        secretPasskey: "wej-blog-backend-secret-authorized-2026",
      });
      const data = docSnap.data();
      return res.json({ success: true, article: { id: articleId, ...data }, generatedNow: false });
    }

    // Sinon, on lance Morgans (le robot WEJ) avec Gemini 3.5-flash
    console.log(`Morgans lance la rédaction de l'article du jour pour le ${todayStr}...`);
    
    // Sujets d'actus récents (mai 2026) et questions légendaires du Top 50 pour diversifier les rédactions quotidiennes de Morgans
    const topics = [
      "le manga au cœur d'Erbaf avec le chapitre 1184 d'One Piece et les retombées de l'incident de God Valley",
      "le rythme de parution régulier d'Eiichiro Oda pour préserver sa santé et la pause programmée du Shonen Jump début juin 2026",
      "les mystères d'Erbaf, l'île des géants, et son importance fondamentale pour l'histoire finale d'One Piece",
      "le changement historique de format de la Toei Animation avec une production limitée à 26 épisodes par an depuis avril 2026",
      "l'amélioration formidable du rythme de l'anime adaptant désormais 1.5 à 2 chapitres par épisode, un régal pour les fans",
      "le lancement grandiose de l'Arc Erbaf dans l'anime le 5 avril 2026 après trois mois d'attente préparatoire",
      "le succès phénoménal de la Saison 2 du Live Action One Piece sur Netflix sortie en mars 2026",
      "les coulisses de la Saison 3 du Live Action d'Arabasta en fin de tournage pour juin 2026 et sa sortie programmée en 2027",
      "les nouveaux visuels d'avril pour le remake THE ONE PIECE par Wit Studio et l'annonce de sa sortie en février 2027",
      "l'arrivée imminente de la partie 6 de l'arc Whole Cake Island sur Netflix pour le mois de juin 2026",
      "le lancement des tournois casual Pirates Party par Bandai en mai 2026 pour accueillir les nouveaux joueurs",
      "la secousse de la méta du TCG One Piece avec le bannissement temporaire des 10 leaders les plus dominants",
      "le système de reconnaissance faciale anti-scalpers au ONE PIECE BASE SHOP nippon à compter du 1er juin 2026",
      "l'arrivée tant attendue des encyclopédies Vivre Cards d'One Piece éditées en français par Glénat",
      "la sortie en France du Light Novel One Piece Heroines par Glénat centré sur les femmes fortes du manga",
      "la suprématie incontestée d'One Piece en France, leader absolu des ventes de mangas et de la pop-culture",
      "qu'est-ce que le One Piece de Gol D. Roger et la vraie nature du trésor ultime",
      "qui est le légendaire Joy Boy du Siècle Oublié et sa promesse historique non tenue",
      "l'identité mystérieuse d'Im (Imu) assis sur le trône vacant de la Terre Sainte",
      "que s'est-il réellement passé pendant l'époque secrète du Siècle Oublié",
      "les théories de fans les plus populaires sur l'emplacement actuel de Raftel (Laugh Tale) et le trésor One Piece",
      "qu'est-ce que la Volonté du D. et l'impact de ce nom maudit sur le Gouvernement Mondial",
      "le secret politique terrifiant derrière le trésor national caché à Mary Geoise",
      "qui sont les 5 Doyens du Gorosei et la vraie nature de leurs terrifiants pouvoirs démonstriaques",
      "les trois armes antiques Poséidon, Pluton et Uranus et leur rôle géologique pour le monde",
      "pourquoi le Gouvernement Mondial cherche-t-il à tout prix à masquer l'Histoire véritable",
      "quel est le véritable rêve ultime de Monkey D. Luffy, celui caché derrière son envie d'être Roi des Pirates",
      "les mystères du vrai fruit du démon de Luffy, l'Hito Hito no Mi modèle Nika (Dieu du Soleil)",
      "qui est l'énigmatique mère de Monkey D. Luffy et la théorie folle liant Crocodile à son passé",
      "le sort futur de Luffy : va-t-il subir le même destin tragique et mortel que Gol D. Roger",
      "pourquoi Zoro possède-t-il une cicatrice à l'œil gauche depuis l'ellipse des deux ans avec Mihawk",
      "qui est le père biologique de Roronoa Zoro et ses liens de sang avec le pays de Wano",
      "le tempérament et la puissance de Sanji : possède-t-il le fluide suprême Haki des Rois",
      "la comparaison de force entre l'homme-poisson Jinbe et la jambe noire Sanji au sein de l'équipage",
      "les spéculations intenses sur le 10ème et ultime membre définitif des Chapeaux de Paille",
      "le rôle futur de Yamato et son envie ardente d'explorer les mers comme Kozuki Oden",
      "le combat prophétisé entre Roronoa Zoro et son maître Dracule Mihawk pour le titre de meilleur escrimeur",
      "l'éveil progressif d'Usopp au Haki de l'observation depuis l'arc Dressrosa",
      "Nami obtiendra-t-elle un jour la puissance d'un fruit du démon ou restera-t-elle la reine du climat",
      "la prime dérisoire de Tony Tony Chopper : aura-t-il un jour une prime à la hauteur de son statut de monstre",
      "l'alliance ambiguë de Shanks le Roux : est-il le plus grand protecteur de la paix ou un traître infiltré",
      "pourquoi Shanks le Roux a-t-il perdu un bras face au monstre de la baie au tout début de l'aventure",
      "comment Marshall D. Teach (Barbe Noire) parvient-il à assimiler deux fruits du démon uniques",
      "qui est le plus puissant entre Shanks le Roux et Dracule Mihawk, une éternelle rivalité d'épéistes",
      "les origines royales de Shanks : est-il lié génétiquement à Saint Figarland Garling",
      "le destin tragique du héros de la Marine Garp après les intenses affrontements sur l'île des pirates",
      "la survie de Trafalgar Law et Eustass Kid suite aux assauts foudroyants des Empereurs",
      "l'irrésistible ascension de Baggy le Clown vers le titre suprême de Roi des Pirates",
      "les quatre Empereurs Yonko actuels et la redéfinition des forces maritimes",
      "le commandement implacable de l'Amiral en Chef Akainu et la justice intransigeante de la Marine"
    ];
    const pickedTopic = topics[Math.floor(Math.random() * topics.length)];

    // Définition des articles de secours ultra-qualitatifs et ciblés sur un seul sujet précis sans surcharge cognitive
    const FALLBACK_ARTICLES: Record<string, { title: string; summary: string; content: string; tags: string[] }> = {
      "les mystères du Siècle Oublié et l'importance de Luffy en Gear 5": {
        title: "EXCLUSIF WEJ : Le secret de l'éveil légendaire du Gear 5 !",
        summary: "Découvrez notre analyse focalisée sur les battements de cœur célèbres sous le nom de « Tambours de la Libération » et leur lien direct avec Nika.",
        content: `**Le retour des Tambours de la Libération**
        
Après huit siècles de silence absolu imposé par la Marine, les battements de cœur mythiques de Monkey D. Luffy résonnent enfin sur Grand Line. C'est le réveil de l'Hito Hito no Mi, modèle Nika, le Dieu du Soleil.

**Une seule question brûle les lèvres : pourquoi cette forme terrifie-t-elle les tyrans ?**
C'est parce que ce pouvoir incarne la liberté absolue. Là où les autres pouvoirs obéissent à des règles de physique strictes, le Gear 5 permet à Luffy de transformer en caoutchouc tout ce qu’il touche selon sa simple imagination. C'est l'arme originelle de joy Boy pour libérer le monde !`,
        tags: ["Luffy", "Gear 5", "Nika", "Morgans"]
      },
      "les théories de fans les plus populaires sur l'emplacement actuel de Raftel (Laugh Tale) et le trésor One Piece": {
        title: "ENQUÊTE : L'emplacement de Laugh Tale caché sous nos yeux ?",
        summary: "Notre journaliste décrypte la théorie phare situant la dernière île directement sous le sommet de Reverse Mountain.",
        content: `**La théorie du croisement central**
        
Comment atteindre Laugh Tale ? La carte se dessine au croisement des coordonnées de quatre Road Ponéglyphes sacrés. La théorie la plus étayée suggère que cette intersection géante pointe précisément vers les profondeurs ou la structure interne de Reverse Mountain, le point d'entrée reliant les quatre mers du globe.

**Pourquoi Roger a-t-il ri en arrivant ?**
Il a découvert que le trésor n'attend pas d'être conquis par la force militaire, mais qu'il raconte une histoire joyeuse et universelle d'unification. Le One Piece est une archive physique et matérielle qui scellera l'aventure de toute une vie !`,
        tags: ["Laugh Tale", "Trésor", "Théorie", "Roger"]
      },
      "la comparaison de puissance entre Luffy, les Yonko et les Amiraux de la Marine": {
        title: "ANALYSE DE PUISSANCE : Le Gear 5 face aux Amiraux de la Marine !",
        summary: "Une mesure de force précise : la liberté totale de Luffy peut-elle surpasser la rigidité défensive des Amiraux ?",
        content: `**Le choc du fluide divin face à la justice absolue**
        
Est-ce que l'éveil ultime de Luffy surclasse les Amiraux ? La réponse réside dans la maîtrise du Haki des Rois avancé. Les Amiraux de la Marine disposent de fruits du démon de type Logia dévastateurs, mais ils manquent de cette flexibilité suprême apportée par le Gear 5.

**Le verdict militaire de Morgans**
En combat rapproché singulier, la liberté d'adaptation du Dieu du Soleil déstabilise n'importe quel dispositif défensif. L'éveil de Luffy outrepasse les défenses rigides des officiers de la Marine grâce à une imprévisibilité totale !`,
        tags: ["Puissance", "Luffy", "Amiraux", "Marine"]
      },
      "quand sortira le prochain chapitre d'One Piece et à quoi s'attendre pour le dénouement de la série": {
        title: "SAGA FINALE : Qu'attendre du prochain chapitre d'One Piece ?",
        summary: "Morgans dévoile les informations cruciales sur notre rendez-vous hebdomadaire et le rythme des révélations de l'auteur.",
        content: `**Un rythme soutenu vers les sommets d'Elbaf**
        
Nos goélands survolent les studios de la Shueisha ! L'auteur Eiichiro Oda maintient son calendrier de publication officiel alternant trois chapitres d'écriture intense suivis d'une semaine de repérage bien méritée pour sa santé.

**Que lire dans l'immédiat ?**
Le focus actuel reste centré sur les révélations géopolitiques autour d'Egghead et la marche triomphale vers Elbaf. Les chapitres officiels sont consultables de façon légitime sur l'application officielle MANGA Plus, garantissant des traductions impeccables et un accès en temps réel dès la parution au Japon.`,
        tags: ["Oda", "Manga Plus", "Chapitres", "Saga Finale"]
      },
      "le concept du Haki des Rois (Haoshoku) et les personnages légendaires qui le maîtrisent": {
        title: "L'ART DU COMBAT : Le mystère profond du Haki des Rois !",
        summary: "Décryptage ciblé de l'énergie spirituelle des conquérants, un pouvoir d'esprit qu'un être sur un milieu possède dès l'enfance.",
        content: `**La volonté de dominer et d'unifier**
        
Le Haoshoku Haki (Haki des Rois) ne s'acquiert pas par l'entraînement physique intensif. C'est l'essence spirituelle d'une personne née pour diriger les autres. Ce fluide exceptionnel permet d'intimider, de faire plier les esprits adverses et de projeter ses coups sans aucun contact physique direct.

**Qui le maîtrise avec panache ?**
De la force brute de Gol D. Roger au Haki impérial déferlant de Shanks le Roux, ce pouvoir reste le propre des personnages qui changent le cours de l'histoire par leur détermination inébranlable.`,
        tags: ["Haki des Rois", "Volonté", "Shanks", "Luffy"]
      },
      "l'analyse du jeu One Piece Odyssey, de Grand Line Hub et des meilleurs jeux mobiles de la franchise": {
        title: "CHRONIQUE JEU : Pourquoi One Piece Odyssey est un régal pour les fans !",
        summary: "Une critique focalisée sur la fidélité de l'adaptation en RPG traditionnel par rapport aux souvenirs et aux batailles iconiques.",
        content: `**Une immersion totale au cœur de nos souvenirs**
        
Le RPG tour par tour 'One Piece Odyssey' brille par son écriture soignée par l'auteur original. Le joueur revit les arcs narratifs majeurs tels qu'Alabasta ou Water Seven sous un prisme nostalgique enrichi par des mécaniques de combat tactiques adaptées à chaque membre de l'équipage.

**Pourquoi y jouer maintenant ?**
Le moyen idéal d'incarner chaque membre du Chapeau de Paille avec de véritables compétences fidèles au manga. Un pur moment d'exploration d'une beauté saisissante !`,
        tags: ["Jeux Vidéo", "Odyssey", "Chronique", "RPG"]
      },
      "le destin tragique de Portgas D. Ace et l'héritage transmis à Luffy et Sabo": {
        title: "MÉMOIRE D'ACE : Les flammes du destin vivent à travers Sabo !",
        summary: "Analyse d'une transmission de volonté légendaire : comment Sabo a repris le flambeau du poing de feu à Dressrosa.",
        content: `**Le sacrifice inoubliable de Marineford**
        
Le trépas héroïque de Portgas D. Ace a secoué le monde entier. Mais sa volonté n'a jamais péri de la surface du globe. Elle a ressuscité sous la forme éclatante de son frère d'armes Sabo, devenu le numéro deux de l'Armée Révolutionnaire.

**La conquête du Mera Mera no Mi**
Lors du tournoi du Colisée de Dressrosa, en s'emparant du fruit des flammes d'Ace, Sabo a accompli la plus belle promesse d'héritage d'One Piece. Sabo protège désormais la route de Luffy sous les traits étincelants du nouvel Empereur des Flammes !`,
        tags: ["Ace", "Sabo", "Mera Mera", "Héritage"]
      },
      "qui est Joy Boy, son lien historique avec Zunesha et les hommes-poissons": {
        title: "JOY BOY : La promesse brisée d'un monde sans chaînes !",
        summary: "L'histoire touchante de la lettre d'excuses gravée sur le Ponéglyphe de la forêt sous-marine et adressée aux habitants de l'océan.",
        content: `**La lettre d'excuse de la Forêt Marine**
        
Joy Boy était un homme d'action du Siècle Oublié. Il s'était engagé auprès de la Princesse Sirène (Poséidon) à remonter tous les Hommes-Poissons à la surface de la terre à bord de l'arche géante Noah. 

**Pourquoi la promesse est-elle restée inachevée ?**
N'ayant pu tenir parole suite à la chute de son royaume face à l'Alliance des vingt rois coalisés, il fit sculpter un mot d'excuse immortel sur un Ponéglyphe. Ce regret historique lie à jamais l'avenir des Hommes-Poissons à l'éveil du prochain messager de liberté !`,
        tags: ["Joy Boy", "Ponéglyphe", "Poséidon", "Hommes-Poissons"]
      }
    };

    let finalArticle: { title: string; summary: string; content: string; tags: string[] };

    try {
      const response = await getAiClient().models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Tu es le célèbre président du journal de l'Économie Mondiale (le grand oiseau Morgans du Weekly Economy Journal - WEJ d'One Piece).
        Rédige une édition quotidienne sensationnelle, percutante et passionnante en français sur le sujet suivant : ${pickedTopic}.
        L'article doit être hautement ciblé et cibler UN SEUL aspect précis ou UNE SEULE question claire à la fois (ne fais pas d'articles généraux fleuves ou de FAQ multiples). Ne submerge pas le lecteur d'informations.
        
        Directives STRICTES de structure de rédaction :
        - Reste extrêmement concis : rédige 2 à 3 paragraphes complets, fluides et très soignés qui répondent directement à la question de manière passionnée.
        - INTERDICTION ABSOLUE d'utiliser des balises de titres de niveau Markdown avec des croisillons (comme '#', '##' ou '###'). Ne génère jamais de lignes commençant par ces caractères !
        - Pour structurer occasionnellement, utilise à la place UNIQUEMENT de la mise en gras comme ceci : **Mon Titre de Section** ou **Ma Question clé** de début de paragraphe.
        
        Format de retour requis : Renvoie strictement un fichier JSON correspondant à ce schéma :
        {
          "title": "Titre journalistique percutant et très court",
          "summary": "Résumé d'une phrase d'accroche captivante pour l'édition du jour",
          "content": "Texte complet en format texte avec paragraphes espacés et mise en gras uniquement (aucun caractère # ou ###)",
          "tags": ["One Piece", "Luffy", "Morgans"]
        }`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              content: { type: Type.STRING },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ["title", "summary", "content", "tags"],
          },
        },
      });

      const generatedText = response.text;
      if (!generatedText) {
        throw new Error("Gemini n'a renvoyé aucun texte exploitable.");
      }

      const parsed = JSON.parse(generatedText.trim());
      finalArticle = {
        title: parsed.title,
        summary: parsed.summary,
        content: parsed.content,
        tags: parsed.tags || ["One Piece", "Luffy", "Morgans"]
      };
    } catch (apiErr: any) {
      console.warn("La génération par l'API Gemini a échoué (surcharde ou indisponibilité s'expliquant par le message suivant):", apiErr.message || apiErr);
      
      // Sélectionne l'article pré-écrit approprié, ou l'article par défaut
      const fallback = FALLBACK_ARTICLES[pickedTopic] || FALLBACK_ARTICLES["les mystères du Siècle Oublié et l'importance de Luffy en Gear 5"];
      
      finalArticle = {
        title: fallback.title,
        summary: fallback.summary,
        content: fallback.content + "\n\n*(Note du Président Morgans : Nos escargophones de transmission ont subi des interférences majeures provoquées par la Marine ou une forte demande mondiale ! Cette édition a été acheminée et imprimée grâce à notre flotte de mouettes de secours afin d'assurer l'information quotidienne de nos abonnés !)*",
        tags: [...fallback.tags, "Édition de Secours", "Pigeon Voyageur"]
      };
    }

    const newArticle = {
      title: finalArticle.title,
      summary: finalArticle.summary,
      content: finalArticle.content,
      tags: finalArticle.tags,
      author: "Morgans (Journaliste WEJ)",
      publishDate: todayStr,
      views: 1,
      secretPasskey: "wej-blog-backend-secret-authorized-2026",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(docRef, newArticle);

    res.json({
      success: true,
      article: { id: articleId, ...newArticle },
      generatedNow: true,
    });
  } catch (err: any) {
    console.error("Erreur durant la génération du WEJ par le bot:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Permet à l'admin de supprimer un article du WEJ
app.post("/api/wej/delete", async (req, res) => {
  const { id, userEmail } = req.body;
  if (userEmail !== ADMIN_EMAIL) {
    return res.status(403).json({ success: false, error: "Non autorisé. Seul l'administrateur peut modifier ou supprimer du WEJ." });
  }

  try {
    await deleteDoc(doc(db, "wejArticles", id));
    res.json({ success: true, message: "L'article a bien été supprimé du journal." });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Permet à l'admin de modifier un article du WEJ
app.post("/api/wej/update", async (req, res) => {
  const { id, title, summary, content, tags, userEmail } = req.body;
  if (userEmail !== ADMIN_EMAIL) {
    return res.status(403).json({ success: false, error: "Non autorisé. Seul l'administrateur peut éditer le WEJ." });
  }

  try {
    await updateDoc(doc(db, "wejArticles", id), {
      title,
      summary,
      content,
      tags,
      secretPasskey: "wej-blog-backend-secret-authorized-2026",
      updatedAt: serverTimestamp(),
    });
    res.json({ success: true, message: "L'article a été mis à jour avec succès." });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// ==========================================
// ROUTES API - BLOG / FORUM COMMUNAUTAIRE
// ==========================================

// Récupère tous les articles du blog/questions
app.get("/api/blog/posts", async (req, res) => {
  try {
    const snap = await getDocs(query(collection(db, "blogPosts"), orderBy("isPinned", "desc"), orderBy("createdAt", "desc")));
    const posts = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json({ success: true, posts });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Crée un nouveau message
app.post("/api/blog/create", async (req, res) => {
  const { title, content, type, authorEmail, authorName, authorAvatar } = req.body;
  if (!authorEmail) {
    return res.status(401).json({ success: false, error: "Vous devez être connecté avec un compte pour poster." });
  }

  try {
    const newPostRef = doc(collection(db, "blogPosts"));
    const newPost = {
      title: title || "Question sans titre",
      content: content || "",
      type: type || "question", // 'question' | 'bug'
      authorEmail,
      authorName: authorName || "Pirate Inconnu",
      authorAvatar: authorAvatar || "",
      isPinned: false,
      replies: [],
      secretPasskey: "wej-blog-backend-secret-authorized-2026",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(newPostRef, newPost);
    res.json({ success: true, postId: newPostRef.id, post: newPost });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Ajoute une réponse à une question/bug du blog
app.post("/api/blog/reply", async (req, res) => {
  const { postId, content, authorEmail, authorName, authorAvatar } = req.body;
  if (!authorEmail) {
    return res.status(401).json({ success: false, error: "Connexion requise pour répondre." });
  }

  try {
    const postRef = doc(db, "blogPosts", postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
      return res.status(404).json({ success: false, error: "Message introuvable." });
    }

    const replyId = `reply-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newReply = {
      replyId,
      content,
      authorEmail,
      authorName: authorName || "Pirate Inconnu",
      authorAvatar: authorAvatar || "",
      createdAt: new Date().toISOString(), // format ISO simple pour listes imbriquées
    };

    await updateDoc(postRef, {
      replies: arrayUnion(newReply),
      secretPasskey: "wej-blog-backend-secret-authorized-2026",
      updatedAt: serverTimestamp(),
    });

    res.json({ success: true, reply: newReply });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Ping/Épingler un message (Seul l'admin Nicolas peut le faire !)
app.post("/api/blog/pin", async (req, res) => {
  const { postId, userEmail, isPinned } = req.body;
  if (userEmail !== ADMIN_EMAIL) {
    return res.status(403).json({ success: false, error: "Seul l'administrateur peut épingler des messages." });
  }

  try {
    const postRef = doc(db, "blogPosts", postId);
    await updateDoc(postRef, {
      isPinned: !!isPinned,
      secretPasskey: "wej-blog-backend-secret-authorized-2026",
      updatedAt: serverTimestamp(),
    });
    res.json({ success: true, message: "Statut d'épinglage mis à jour." });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Supprime une question ou un rapport de bug complet (Admin OU auteur du message)
app.post("/api/blog/delete-post", async (req, res) => {
  const { postId, userEmail } = req.body;

  try {
    const postRef = doc(db, "blogPosts", postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
      return res.status(404).json({ success: false, error: "Message inexistant." });
    }

    const postData = postSnap.data();
    if (userEmail !== ADMIN_EMAIL && userEmail !== postData?.authorEmail) {
      return res.status(403).json({ success: false, error: "Vous n'avez pas l'autorisation de supprimer ce message." });
    }

    await deleteDoc(postRef);
    res.json({ success: true, message: "Le message a été supprimé à jamais." });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Supprime une réponse spécifique (Admin ou auteur de la réponse)
app.post("/api/blog/delete-reply", async (req, res) => {
  const { postId, replyId, userEmail } = req.body;

  try {
    const postRef = doc(db, "blogPosts", postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
      return res.status(404).json({ success: false, error: "Message introuvable." });
    }

    const postData = postSnap.data();
    const replies = postData?.replies || [];
    const index = replies.findIndex((r: any) => r.replyId === replyId);

    if (index === -1) {
      return res.status(404).json({ success: false, error: "Réponse introuvable." });
    }

    const targetReply = replies[index];
    if (userEmail !== ADMIN_EMAIL && userEmail !== targetReply.authorEmail) {
      return res.status(403).json({ success: false, error: "Seul l'auteur de la réponse ou l'administrateur du forum peut la supprimer." });
    }

    replies.splice(index, 1);
    await updateDoc(postRef, {
      replies,
      secretPasskey: "wej-blog-backend-secret-authorized-2026",
      updatedAt: serverTimestamp(),
    });

    res.json({ success: true, message: "Réponse supprimée." });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Archives / Désarchives un message de bug/sujet (Seul l'admin Nicolas peut le faire !)
app.post("/api/blog/archive", async (req, res) => {
  const { postId, userEmail, isArchived } = req.body;
  if (userEmail !== ADMIN_EMAIL) {
    return res.status(403).json({ success: false, error: "Seul l'administrateur Nicolas peut archiver ou désarchiver des messages." });
  }

  try {
    const postRef = doc(db, "blogPosts", postId);
    await updateDoc(postRef, {
      isArchived: !!isArchived,
      secretPasskey: "wej-blog-backend-secret-authorized-2026",
      updatedAt: serverTimestamp(),
    });
    res.json({ success: true, message: isArchived ? "Sujet archivé avec succès." : "Sujet désarchivé avec succès." });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// ==========================================
// MISSION UNDERCOVER - JEU DE DÉDUCTION SOCIALE
// ==========================================

// Point d'entrée pour que les bots génèrent un indice (clue) via l'IA
app.post("/api/undercover/generate-bot-move", async (req, res) => {
  const { character, role, theme, previousClues, round, botName } = req.body;

  try {
    const ai = getAiClient();
    const cluesList = Array.isArray(previousClues) ? previousClues.join(", ") : "aucun pour l'instant";
    
    let prompt = "";
    if (role === "Mister White") {
      prompt = `Tu es un bot joueur nommé ${botName} jouant au jeu de déduction sociale "Undercover" sur One Piece.
Tu joues le rôle secret de MISTER WHITE. Tu n'as pas de personnage secret ! Tu connais uniquement le thème général : "${theme}".
Voici les indices qui ont déjà été donnés par d'autres joueurs lors de ce tour : [${cluesList}].
Ton but est de deviner de quoi parlent les autres et de donner un indice plausible d'un mot (ou 2 mots maximum) en français pour te fondre dans le décor sans éveiller les soupçons.
Ne dis jamais que tu es Mister White. Renvoie un seul mot / groupe nominal simple en minuscule, par exemple: "sabre", "capitaine", "volonté".
Format attendu : JSON uniquement, sous la forme : { "clue": "ton_mot" }`;
    } else {
      prompt = `Tu es un bot joueur nommé ${botName} jouant au jeu "Undercover" sur One Piece.
Ton personnage secret est : "${character}". Ton rôle secret est : "${role}" (soit Citoyen, soit Imposteur).
Le thème commun de la partie est : "${theme}".
Voici les indices déjà donnés dans ce tour : [${cluesList}].
Propose un indice en français (Minaudé, subtil, de maximum 2 mots) qui décrit une caractéristique de ton personnage "${character}" de façon astucieuse sans jamais révéler son nom.
Règles strictes :
- Ne donne JAMAIS le nom exact, ni le prénom ou un surnom mythique (ex: si Zoro, ne dis pas "Zoro", "Roronoa", "Chasseur de pirates", "Marimo").
- S'il s'agit du tour ${round}, propose un indice original mais cohérent.
Format attendu : un objet JSON :
{
  "clue": "ton_mot",
  "reasoningOnOnePiece": "pourquoi tu as choisi ce mot par rapport à l'univers"
}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "Tu es un joueur expert de One Piece jouant au jeu Undercover. Tu as une connaissance parfaite de l'anime One Piece. Tu t'exprimes de façon fluide et n'écris que du JSON.",
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json({ success: true, clue: parsed.clue || "Aventurier", reasoning: parsed.reasoningOnOnePiece || "" });
  } catch (err: any) {
    // Fallback automatique de sécurité si l'API échoue ou met trop de temps
    const fallbacks: Record<string, string[]> = {
      "Monkey D. Luffy": ["viande", "soleil", "chapeau", "caoutchouc"],
      "Gol D. Roger": ["roi", "trésor", "sourire", "exécution"],
      "Roronoa Zoro": ["sabre", "direction", "œil", "vert"],
      "Dracule Mihawk": ["yeux", "croix", "château", "solitude"],
      "Portgas D. Ace": ["feu", "tatouage", "frère", "poing"],
      "Sabo": ["tuyau", "flammes", "révolution", "chapeau"],
      "Sanji": ["cuisine", "cigarette", "jambe", "sourcil"],
      "Barbe Noire (Teach)": ["ténèbres", "rires", "tartes", "tartes"],
      "Barbe Blanche (Newgate)": ["vortex", "père", "cicatrice", "génération"],
      "Kuzan (Aokiji)": ["glace", "vélo", "fainéant", "justice"],
      "Sakazuki (Akainu)": ["magma", "volcan", "justice", "absolue"],
      "Nami": ["météo", "berry", "oranges", "carte"],
      "Robin": ["fleur", "histoire", "mains", "livres"],
      "Shanks": ["manche", "rouquin", "haki", "empereur"],
      "Garp": ["beignet", "poing", "famille", "chien"],
      "Sengoku": ["bouddha", "chèvre", "justice", "or"],
      "Vegapunk": ["cerveau", "pomme", "clones", "île"],
      "Caesar Clown": ["gaz", "poison", "ballon", "expérience"],
      "Mister White": ["pirate", "océan", "navire", "pouvoir"]
    };
    
    const list = fallbacks[character] || ["pirate", "grand", "marin", "combattant"];
    const clue = list[Math.floor(Math.random() * list.length)];
    res.json({ success: true, clue, isFallback: true });
  }
});

// Évaluation et validation des mots par le Maître du Jeu (Vegapunk ou Morgans)
app.post("/api/undercover/validate-clue", async (req, res) => {
  const { clue, character, gameMaster = "Vegapunk" } = req.body;

  try {
    const ai = getAiClient();
    const systemInstruction = gameMaster === "Morgans" 
      ? "Tu es Morgans, le président véreux de la World Economy News Journal (WEJ). Tu as un style théâtral, tu aimes crier 'BIG NEWS !' et tu commentes le jeu 'Undercover' de One Piece de façon sensationnaliste."
      : "Tu es le Dr. Vegapunk, le plus brillant scientifique du Gouvernement Mondial. Tu es rigoureux, curieux, joyeux et tu analyses les indices de façon technique et amusante.";

    const prompt = `Un joueur vient de donner l'indice "${clue}" pour décrire secrètement son personnage d'One Piece : "${character}".
Vérifie si cet indice est TRÈS VALIDE, ACCEPTABLE ou STRICTEMENT REJETÉ.
Un indice est STRICTEMENT REJETÉ si :
1. Il contient explicitement tout ou partie du nom de "${character}" (ex: "zoro" pour Zoro, "roge" pour Roger, "aka" pour Akainu, etc.).
2. Il est quasi-identique au nom (ex: "Monkey" pour Luffy).

Génère une réponse sous forme d'objet JSON contenant :
- "isValid": boolean (true si valide ou acceptable, false si rejeté)
- "evaluation": string (un de ces trois status : "VALIDE" | "REFUSÉ")
- "commentary": string (un commentaire drôle, court de maximum 2 phrases, en accord avec ton caractère ${gameMaster}, s'adressant au joueur à propos de son mot "${clue}" et de la façon dont il décrit "${character}" si c'est le cas, sans dire aux autres joueurs quel est le secret).
Syntaxe JSON stricte uniquement, sans markdown ni texte d'intro :`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction,
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json({ 
      success: true, 
      isValid: parsed.isValid !== undefined ? parsed.isValid : true,
      commentary: parsed.commentary || "Hmm... une analyse intéressante de vos capacités cognitives !"
    });
  } catch (err: any) {
    const lowerClue = String(clue).toLowerCase();
    const lowerName = String(character).toLowerCase();
    const isStrictlyForbidden = lowerClue.includes(lowerName) || lowerName.includes(lowerClue) || lowerClue.length < 2;
    res.json({ 
      success: true, 
      isValid: !isStrictlyForbidden,
      commentary: isStrictlyForbidden
        ? `Alerte triche ! Ce mot est indiscutablement trop proche de l'identité du suspect.`
        : `Analyse standard : L'indice semble valide pour nos algorithmes stellaires !`
    });
  }
});


// ==========================================
// MIDDLEWARE ET SERVEUR VITE
// ==========================================

const startServer = async () => {
  if (!process.env.VERCEL) {
    if (process.env.NODE_ENV !== "production") {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[FULL-STACK] Serveur en cours d'exécution sur le port ${PORT}`);
    });
  }
};

startServer();

export default app;

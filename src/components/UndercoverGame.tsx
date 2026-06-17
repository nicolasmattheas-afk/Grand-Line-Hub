import React, { useState, useEffect, useRef } from "react";
import { 
  Users, User, Shield, HelpCircle, Trophy, RefreshCw, Play, Check, AlertCircle, Eye, EyeOff, Award, ChevronRight, MessageSquare, Volume2, Star, Target, ShieldAlert, Copy, LogOut, Send, CheckCircle, Flame, Swords, Crown
} from "lucide-react";
import { 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  getDoc,
  deleteDoc
} from "firebase/firestore";
import { db, OperationType, handleFirestoreError } from "../lib/firebase";

interface RolePair {
  theme: string;
  citizen: string;
  imposter: string;
  citizenDesc: string;
  imposterDesc: string;
}

// Iconic, ultra-famous One Piece character pairings
const FAMOUS_UNDERCOVER_PAIRS: RolePair[] = [
  {
    theme: "Les Porteurs du Chapeau de Paille",
    citizen: "Monkey D. Luffy",
    imposter: "Gol D. Roger",
    citizenDesc: "Le chapeau de paille de la nouvelle génération, futur Roi des Pirates !",
    imposterDesc: "Le légendaire Roi des Pirates originel, possesseur initial du trésor !"
  },
  {
    theme: "Les Rivaux / Épéistes",
    citizen: "Roronoa Zoro",
    imposter: "Dracule Mihawk",
    citizenDesc: "L'épéiste aux trois sabres de l'équipage du Chapeau de Paille.",
    imposterDesc: "L'escrimeur le plus fort du monde, mentor et rival juré de Zoro."
  },
  {
    theme: "Les Frères de Cœur",
    citizen: "Portgas D. Ace",
    imposter: "Sabo",
    citizenDesc: "Le commandant aux poings ardents de l'équipage de Barbe Blanche.",
    imposterDesc: "Le chef d'état-major révolutionnaire à la griffe de dragon."
  },
  {
    theme: "Les Capitaines Rivaux",
    citizen: "Trafalgar D. Water Law",
    imposter: "Eustass Kid",
    citizenDesc: "Le Chirurgien de la Mort, capitaine du Heart détenteur du Ope Ope no Mi.",
    imposterDesc: "Le capitaine féroce des Kid Pirates capable de manipuler le magnétisme."
  },
  {
    theme: "Les Amiraux Originels (Glace / Feu)",
    citizen: "Kuzan (Aokiji)",
    imposter: "Sakazuki (Akainu)",
    citizenDesc: "L'ex-amiral de glace adepte de la justice tranquille et fainéante.",
    imposterDesc: "Le grand amiral de magma inflexible représentant de la justice absolue."
  },
  {
    theme: "Les Amiraux (Lumière / Gravité)",
    citizen: "Borsalino (Kizaru)",
    imposter: "Issho (Fujitora)",
    citizenDesc: "L'amiral éclatant voyageant à la vitesse de la lumière.",
    imposterDesc: "L'aveugle vertueux capable de contrôler la gravité des météorites."
  },
  {
    theme: "Les Divinités de Skypiea / Wano",
    citizen: "Enel",
    imposter: "Kaido",
    citizenDesc: "Le dieu autoproclamé de Skypiea, maître absolu de la foudre céleste.",
    imposterDesc: "La créature la plus forte du monde, détenteur du fruit du dragon d'azur."
  },
  {
    theme: "Les Mentors de Luffy",
    citizen: "Shanks",
    imposter: "Silvers Rayleigh",
    citizenDesc: "Le Yonko légendaire de la flotte du Roux au Haki de conquérant inégalable.",
    imposterDesc: "Le Roi Sombre, premier lieutenant légendaire des pirates du Roi Roger."
  },
  {
    theme: "Les Anciens Corsaires",
    citizen: "Crocodile",
    imposter: "Don Quijote Doflamingo",
    citizenDesc: "L'ex-président du Baroque Works manipulant le sable chaud du désert.",
    imposterDesc: "Le démon céleste, ancien roi de Dressrosa tirant les fils du destin."
  },
  {
    theme: "Les Souveraines",
    citizen: "Boa Hancock",
    imposter: "Charlotte Linlin (Big Mom)",
    citizenDesc: "L'impératrice pirate d'Amazon Lily d'une beauté pétrifiante.",
    imposterDesc: "L'effrayante matriarche Yonko capable de manipuler les âmes humaines."
  },
  {
    theme: "Les Cyborgs / Scientifiques",
    citizen: "Franky",
    imposter: "Bartholomew Kuma",
    citizenDesc: "Le charpentier ingénieur cybernétique carburant au cola frais.",
    imposterDesc: "Le révolutionnaire pacifique au pouvoir repoussant des coussinets."
  },
  {
    theme: "Les Monstres de la Marine",
    citizen: "Monkey D. Garp",
    imposter: "Sengoku",
    citizenDesc: "Le vice-amiral légendaire, héros de la Marine au poing dévastateur.",
    imposterDesc: "L'ancien amiral en chef possesseur du fruit divin du Bouddha d'or."
  },
  {
    theme: "Les Bras Droits des Yonko",
    citizen: "Marco",
    imposter: "Charlotte Katakuri",
    citizenDesc: "Le phénix de Barbe Blanche aux flammes bleues de régénération.",
    imposterDesc: "Le général de Big Mom doué pour prédire l'avenir avec son Kenbunshoku Haki."
  },
  {
    theme: "Les Épéistes de Wano",
    citizen: "Kozuki Oden",
    imposter: "Shimotsuki Ryuma",
    citizenDesc: "Le seigneur de Kuri ayant navigué avec Roger et Barbe Blanche.",
    imposterDesc: "Le légendaire samouraï tueur de dragon du pays de Wano."
  },
  {
    theme: "Les Infiltrés du CP9 / CP0",
    citizen: "Rob Lucci",
    imposter: "Kaku",
    citizenDesc: "L'arme humaine du gouvernement mondial, utilisateur féroce du léopard Rokushiki.",
    imposterDesc: "Le constructeur loufoque de Galley-La devenu girafe destructrice et agile."
  },
  {
    theme: "Le Duo Comique de Grand Line",
    citizen: "Baggy le Clown",
    imposter: "Bentham (Mr. 2 Bon Clay)",
    citizenDesc: "L'oracle burlesque devenu empereur grâce à des malentendus historiques.",
    imposterDesc: "Le maître de l'amitié (Okama Way) capable de copier n'importe quel visage."
  },
  {
    theme: "Les Archéologues / Savants",
    citizen: "Nico Robin",
    imposter: "Dr. Vegapunk (Stella)",
    citizenDesc: "La fleur rescapée d'Ohara vouée à la lecture des Poneglyphes sacrés.",
    imposterDesc: "Le plus brillant génie scientifique moderne à la tête élargie."
  },
  {
    theme: "Les Tireurs d'Élite",
    citizen: "Usopp",
    imposter: "Yasopp",
    citizenDesc: "Le sniper courageux (dans l'âme) des Chapeaux de Paille à l'adresse redoutable.",
    imposterDesc: "Le tireur d'élite infaillible de Shanks et fier père d'Usopp."
  },
  {
    theme: "Les Cuisiniers / Gentlemen",
    citizen: "Vinsmoke Sanji",
    imposter: "Zeff",
    citizenDesc: "Le cuisinier de la jambe noire refusant catégoriquement de frapper une femme.",
    imposterDesc: "Le légendaire chef pirate aux pieds rouges, mentor culinaire et paternel."
  },
  {
    theme: "Les Créatures Poilues",
    citizen: "Tony Tony Chopper",
    imposter: "Bepo",
    citizenDesc: "Le renne médecin adepte du Rumble Ball pour ses transformations géantes.",
    imposterDesc: "L'ours Mink karatéka et navigateur fidèle de l'équipage du Heart."
  },
  {
    theme: "Les Navires Sacrés",
    citizen: "Vogue Merry",
    imposter: "Thousand Sunny",
    citizenDesc: "La première caravelle bien-aimée abritant le Klabautermann protecteur.",
    imposterDesc: "Le navire de guerre solaire moderne construit à partir du bois d'Adam."
  },
  {
    theme: "Les Protecteurs de l'Ombre",
    citizen: "Monkey D. Dragon",
    imposter: "Emporio Ivankov",
    citizenDesc: "Le chef mystérieux de l'Armée Révolutionnaire, homme le plus recherché au monde.",
    imposterDesc: "La reine d'un royaume fabuleux dotée d'hormones de traitement physique."
  },
  {
    theme: "Les Douces Épéistes",
    citizen: "Tashigi",
    imposter: "Kuina",
    citizenDesc: "La lieutenante zélée de la Marine collectionneuse de sabres précieux (Meito).",
    imposterDesc: "L'amie d'enfance de Zoro dont le rêve de devenir le meilleur escrimeur fut brisé."
  },
  {
    theme: "La Nouvelle Génération de la Marine",
    citizen: "Koby",
    imposter: "Helmeppo",
    citizenDesc: "La recrue héroïque devenue la fierté de Garp par sa loyauté indéfectible.",
    imposterDesc: "Le fils gâté de Morgan devenu un bretteur aguerri aux côtés de Koby."
  },
  {
    theme: "Les Princesses Alliées",
    citizen: "Nefertari Vivi",
    imposter: "Shirahoshi",
    citizenDesc: "La princesse courageuse d'Alabasta ayant démasqué Baroque Works.",
    imposterDesc: "La princesse sirène géante aux pleurs capables d'invoquer Poséidon."
  },
  {
    theme: "Les Scientifiques Fous",
    citizen: "Caesar Clown",
    imposter: "Vinsmoke Judge",
    citizenDesc: "Le créateur du gaz toxique Smiile cherchant à surpasser son rival Vegapunk.",
    imposterDesc: "Le souverain cybernétique du Germa 66 adepte des modifications génétiques."
  },
  {
    theme: "Les Leaders Minks",
    citizen: "Nekomamushi",
    imposter: "Inuarashi",
    citizenDesc: "Le seigneur de la nuit sous forme de félin colossal adorateur de lasagnes.",
    imposterDesc: "Le noble duc canin de la journée, ancien compagnon de la flibuste d'Oden."
  },
  {
    theme: "Les Héros Terribles de Wano",
    citizen: "Yamato",
    imposter: "Kozuki Momonosuke",
    citizenDesc: "La digne fille de Kaido s'étant autoproclamée l'incarnation de Kozuki Oden.",
    imposterDesc: "L'héritier légitime du clan Kozuki capable de commander à Zunesha."
  },
  {
    theme: "Les Calamités de Kaido",
    citizen: "King",
    imposter: "Queen",
    citizenDesc: "Le bras droit de Kaido, dernier survivant de la race divine des Lunarias.",
    imposterDesc: "Le cyborg jovial et rondelet propageant des virus mortels."
  },
  {
    theme: "Les Maudits d'Impel Down",
    citizen: "Magellan",
    imposter: "Shiryu",
    citizenDesc: "Le directeur au corps empoisonné gardant le plus grand pénitencier du monde.",
    imposterDesc: "L'ancien gardien sadique au sabre invisible ayant rejoint Barbe Noire."
  },
  {
    theme: "Les Lieutenants du Nouveau Monde",
    citizen: "Benn Beckman",
    imposter: "Lucky Roux",
    citizenDesc: "Le bras droit ultra-intelligent de Shanks au calme implacable.",
    imposterDesc: "Le pirate enjoué et agile toujours muni d'un gigot de viande."
  },
  {
    theme: "Les Kamas de la Révolution",
    citizen: "Inazuma",
    imposter: "Morley",
    citizenDesc: "L'allié d'Ivankov capable de découper le sol dur comme s'il s'agissait de papier.",
    imposterDesc: "Le géant travesti manipulant la terre battue avec son harpon géant."
  },
  {
    theme: "Les Commandants de Sweet Three",
    citizen: "Charlotte Smoothie",
    imposter: "Charlotte Cracker",
    citizenDesc: "La géante impitoyable de Totto Land capable d'essorer tout liquide corporel.",
    imposterDesc: "Le guerrier biscuit capable de générer des armées infinies de clones armés."
  },
  {
    theme: "Les Monstres des Profondeurs",
    citizen: "Fisher Tiger",
    imposter: "Jinbe",
    citizenDesc: "Le libérateur légendaire des esclaves de Marie-Joie et fondateur des Soleils.",
    imposterDesc: "Le paladin des mers, maître du karaté des hommes-poissons rallié aux chapeaux de paille."
  },
  {
    theme: "Les Fantômes de Thriller Bark",
    citizen: "Gecko Moria",
    imposter: "Perona",
    citizenDesc: "L'ancien corsaire briseur d'ombres règnant sur une île-navire brumeuse.",
    imposterDesc: "La princesse gothique capable de rendre n'importe qui dépressif avec ses fantômes."
  },
  {
    theme: "Les Navigateurs Animaux",
    citizen: "Karoo",
    imposter: "Bepo",
    citizenDesc: "Le super colvert ultra-rapide et fidèle destrier de la princesse Vivi.",
    imposterDesc: "L'ours polaire Mink à la gentillesse légendaire et expert en navigation."
  },
  {
    theme: "Les Proches de Nami",
    citizen: "Bellemere",
    imposter: "Nojiko",
    citizenDesc: "La mère adoptive courageuse qui préférait mourir plutôt que de renier ses filles.",
    imposterDesc: "La sœur compréhensive cultivant les mandarines de Cocoyasi."
  },
  {
    theme: "Les Trésors Légendaires",
    citizen: "Gol D. Roger",
    imposter: "Rocks D. Xebec",
    citizenDesc: "Le Roi des Pirates respecté de tous ayant découvert Laugh Tale.",
    imposterDesc: "Le rival ténébreux d'une férocité sans limites terrassé à God Valley."
  },
  {
    theme: "Les Amis Secrets",
    citizen: "Donquixote Rosinante (Corazon)",
    imposter: "Trafalgar D. Water Law",
    citizenDesc: "Le protecteur bienveillant et silencieux infiltré chez Doflamingo pour sauver Law.",
    imposterDesc: "L'ancien enfant terrible de la cité blanche sauvé par le sacrifice d'amour de Corazon."
  },
  {
    theme: "Les Guerriers d'Elbaf",
    citizen: "Dorry",
    imposter: "Broggy",
    citizenDesc: "Le géant bleu combattant sur Little Garden depuis plus d'un siècle.",
    imposterDesc: "Le géant rouge s'opposant éternellement à son frère d'armes pour l'honneur d'Elbaf."
  },
  {
    theme: "Les Lieutenants Volants (Tobi Roppo)",
    citizen: "Ulti",
    imposter: "Page One",
    citizenDesc: "La sœurette surprotectrice dotée d'un terrible coup de boule dinosaurien.",
    imposterDesc: "Le combattant silencieux se transformant en spinosaure agile."
  },
  {
    theme: "Les Esprits de Wano",
    citizen: "Kin'emon",
    imposter: "Denjiro",
    citizenDesc: "Le leader dévoué des fourreaux rouges maître du style à deux sabres.",
    imposterDesc: "Le samouraï infiltré sous l'identité de Kyoshiro pour accumuler des richesses."
  },
  {
    theme: "Les Filles de Big Mom",
    citizen: "Charlotte Pudding",
    imposter: "Charlotte Brulee",
    citizenDesc: "La chocolatière aux trois yeux maîtresse de l'édition mémorielle (Memo Memo).",
    imposterDesc: "La sorcière aux miroirs loyale envers son grand frère Katakuri."
  },
  {
    theme: "Les Supernovas de l'Ombre",
    citizen: "Capone Bege",
    imposter: "Basil Hawkins",
    citizenDesc: "Le parrain de la pègre dont le propre corps renferme une forteresse humaine.",
    imposterDesc: "Le magicien adepte des prédictions de cartes de tarot manipulant la paille."
  },
  {
    theme: "Les Snipers de l'Ombre",
    citizen: "Van Augur",
    imposter: "Lafitte",
    citizenDesc: "Le sniper des pirates de Barbe Noire capable d'abattre des cibles hors de portée visuelle.",
    imposterDesc: "L'ex-sheriff hypnotiseur et navigateur aux manières théâtrales."
  },
  {
    theme: "La Technologie Vinsmoke",
    citizen: "Vinsmoke Reiju",
    imposter: "Vinsmoke Ichiji",
    citizenDesc: "La sœur aînée au grand cœur capable d'absorber n'importe quel poison toxique.",
    imposterDesc: "Le leader spartiate des sparkings froids et modifiés génétiquement."
  },
  {
    theme: "Les Charpentiers de Water Seven",
    citizen: "Iceburg",
    imposter: "Paulie",
    citizenDesc: "Le maire ultra-respecté de l'île aux canaux, disciple estimé du légendaire Tom.",
    imposterDesc: "Le contremaître de Galley-La agité utilisant des cordes pour se battre."
  },
  {
    theme: "Les Mythes du Passé",
    citizen: "Montblanc Noland",
    imposter: "Calgara",
    citizenDesc: "L'explorateur honnête exécuté à tort sous l'ignoble réputation de menteur.",
    imposterDesc: "Le fier guerrier Shandia gardien inflexible de la cloche d'or de Shandora."
  },
  {
    theme: "Les Dieux de la Vitesse",
    citizen: "Carrot",
    imposter: "Pedro",
    citizenDesc: "La lapine Mink dynamique à l'agilité débordante devenant une prédatrice sous la pleine lune.",
    imposterDesc: "L'ancien capitaine Mink jaguar prêt à se sacrifier pour le lever de l'aube."
  },
  {
    theme: "Les Officiers de la Don Quijote",
    citizen: "Senor Pink",
    imposter: "Gladius",
    citizenDesc: "Le combattant au style de bébé hardi mais doté d'un passé profondément tragique.",
    imposterDesc: "L'officier colérique capable d'exploser n'importe quelle matière inanimée."
  },
  {
    theme: "Le Sommet du Monde",
    citizen: "Imu",
    imposter: "Jaygarcia Saturn",
    citizenDesc: "Le souverain secret de l'ombre siégeant sur le trône vide du Nouveau Monde.",
    imposterDesc: "Le doyen de la science et de la défense ayant scellé le sort d'Egghead."
  },
  {
    theme: "Les Géants d'Elbaf (Garde Royale)",
    citizen: "Oimo",
    imposter: "Kashii",
    citizenDesc: "Le gardien géant d'Enies Lobby trompé par le gouvernement pendant cinquante ans.",
    imposterDesc: "Le compagnon d'armes géant armé d'une gigantesque massue cloutée."
  },
  {
    theme: "Les Rois des Mers / Monstres",
    citizen: "Laboon",
    imposter: "Monstre de la Baie",
    citizenDesc: "La baleine géante qui attend fidèlement l'équipage des Rumbar aux portes de Grand Line.",
    imposterDesc: "Le terrible monstre marin régnant sur la baie côtière côtoyée par Shanks."
  },
  {
    theme: "Les Figures d'Ohara",
    citizen: "Nico Robin",
    imposter: "Jaguar D. Saul",
    citizenDesc: "L'enfant rescapée du Buster Call protégeant les secrets de l'histoire du monde.",
    imposterDesc: "Le géant déserteur de la Marine ayant appris à Robin à rire dans la détresse."
  },
  {
    theme: "Les Rois d'Alabasta",
    citizen: "Nefertari Cobra",
    imposter: "Riku Dold III",
    citizenDesc: "Le sage dirigeant bienveillant d'Alabasta soucieux de la survie de son peuple.",
    imposterDesc: "L'ancien protecteur de Dressrosa trahi par les machinations de Doflamingo."
  },
  {
    theme: "Les Épéistes de l'Ombre",
    citizen: "Shiryu",
    imposter: "Vista",
    citizenDesc: "Le redoutable sabreur d'Impel Down adepte de la discrétion invisible.",
    imposterDesc: "Le fleurettiste aux moustaches légendaires de l'équipage de Barbe Blanche."
  },
  {
    theme: "Les Colosses d'Impel Down",
    citizen: "Magellan",
    imposter: "Hannyabal",
    citizenDesc: "L'implacable défenseur toxique capable de repousser des cohortes d'évadés.",
    imposterDesc: "L'ambitieux directeur adjoint obsédé par l'idée de prendre la place du chef."
  },
  {
    theme: "Les Forgerons / Armateurs de Légende",
    citizen: "Tom",
    imposter: "Iceburg",
    citizenDesc: "L'homme-poisson ayant construit l'Oro Jackson avec panache et fierté.",
    imposterDesc: "Le leader de Water Seven détenant les plans secrets de l'arme Pluton."
  },
  {
    theme: "Les Officiers de Baroque Works (Mr. 1 & 3)",
    citizen: "Daz Bonez (Mr. 1)",
    imposter: "Galdino (Mr. 3)",
    citizenDesc: "L'implacable tueur à gages au corps d'acier tranchant comme une lame.",
    imposterDesc: "L'astucieux sculpteur de cire ayant maintes fois sauvé ses alliés par sa ruse."
  },
  {
    theme: "Les Lieutenants du Roux",
    citizen: "Lucky Roux",
    imposter: "Yasopp",
    citizenDesc: "Le cuisinier virevoltant de Shanks, toujours souriant un morceau de viande en main.",
    imposterDesc: "L'archer des temps modernes, sniper infaillible de l'équipage du Roux."
  },
  {
    theme: "Les Doyens du Conseil",
    citizen: "Marcus Mars",
    imposter: "Topman Warcury",
    citizenDesc: "Le doyen volant capable de se transformer en un oiseau monstrueux de légende.",
    imposterDesc: "Le doyen à la défense absolue prenant l'apparence d'un sanglier divin."
  },
  {
    theme: "Les Doyens Épéistes / Scientifiques",
    citizen: "Ethanbaron V. Nusjuro",
    imposter: "Jaygarcia Saturn",
    citizenDesc: "Le squelette doyen de la finance maniant un sabre de glace dévastateur.",
    imposterDesc: "Le terrifiant doyen spider-démon maître de la création des puces d'Egghead."
  },
  {
    theme: "Les Dieux de la Révolution",
    citizen: "Belo Betty",
    imposter: "Karasu",
    citizenDesc: "La commandante révolutionnaire poussant les foules à la révolte avec son drapeau.",
    imposterDesc: "Le cadre mystérieux s'exprimant à travers des nuées de corbeaux de suie."
  },
  {
    theme: "Les Tobi Roppo (L'Ombre & Le Poison)",
    citizen: "Black Maria",
    imposter: "Who's Who",
    citizenDesc: "La maîtresse gigantesque de la maison close de Wano maniant l'araignée de feu.",
    imposterDesc: "L'ex-agent du CP9 emprisonné pour avoir perdu le fruit du Gum Gum."
  },
  {
    theme: "Les Tobi Roppo (Armure & Épée)",
    citizen: "Sasaki",
    imposter: "Page One",
    citizenDesc: "Le colosse à la cuirasse de tricératops capable de voler comme un hélicoptère.",
    imposterDesc: "Le plus jeune membre de l'unité d'élite doté du fruit du spinosaure."
  },
  {
    theme: "Les Sentinelles de la Marine",
    citizen: "Sentomaru",
    imposter: "Momonga",
    citizenDesc: "Le garde du corps armé d'une hache lourde se disant doté de la meilleure défense.",
    imposterDesc: "Le vice-amiral stoïque ayant résisté au charme pétrifiant de Boa Hancock."
  },
  {
    theme: "La Justice Absolue",
    citizen: "Sakazuki (Akainu)",
    imposter: "Tsuru",
    citizenDesc: "L'amiral destructeur brûlant tous les obstacles au nom de sa justice implacable.",
    imposterDesc: "La sage vice-amirale capable de laver le cœur des tyrans avec son pouvoir lessive."
  },
  {
    theme: "Les Amiraux Vert / Violet",
    citizen: "Aramaki (Ryokugyu)",
    imposter: "Issho (Fujitora)",
    citizenDesc: "L'amiral de la forêt voué corps et âmes à l'autorité des dragons célestes.",
    imposterDesc: "Le bretteur juste et parieur remettant en cause l'existence même des Corsaires."
  },
  {
    theme: "Les Capitaines de Barbe Noire (Sniper / Champion)",
    citizen: "Van Augur",
    imposter: "Jesus Burgess",
    citizenDesc: "Le dandy du télétransport capable d'ajuster une mouche à des kilomètres.",
    imposterDesc: "Le lutteur brutal fortifié par le fruit du pouvoir musculaire absolu."
  },
  {
    theme: "Les Capitaines de Barbe Noire (Infiltration / Géant)",
    citizen: "Lafitte",
    imposter: "Sanjuan Wolf",
    citizenDesc: "L'ange gardien ailé de la flotte ténébreuse, expert en hypnose royale.",
    imposterDesc: "Le cuirassé colossal, géant légendaire capable de marcher au milieu de l'océan."
  },
  {
    theme: "Les Évadés de l'Enfer (Vasco / Devon)",
    citizen: "Vasco Shot",
    imposter: "Catarina Devon",
    citizenDesc: "Le criminel ivrogne redoutable manipulant des flots de saké hautement alcoolisés.",
    imposterDesc: "La chasseuse de croissants de lune capable de prendre l'apparence de n'importe qui."
  },
  {
    theme: "Les Cadres de Big Mom (Frères d'Armes)",
    citizen: "Charlotte Oven",
    imposter: "Charlotte Daifuku",
    citizenDesc: "Le colosse réorganisant l'océan par sa chaleur bouillante digne d'un four.",
    imposterDesc: "Le féroce combattant générant un génie destructeur depuis sa ceinture dorée."
  },
  {
    theme: "Les Monstres d'Egghead (Vegapunk Lilith / Shaka)",
    citizen: "Lilith",
    imposter: "Shaka",
    citizenDesc: "Le satellite incarnant la malveillance (Evil) et la quête d'énergie vitale.",
    imposterDesc: "Le satellite masqué de la raison (Good) veillant sur l'éthique de la recherche."
  },
  {
    theme: "Les Satellites de Vegapunk (Edison / Atlas)",
    citizen: "Edison",
    imposter: "Atlas",
    citizenDesc: "Le petit robot incarnant la réflexion (Thinking) et la conception de projets.",
    imposterDesc: "Le robot géant incarnant la violence (Violence), prompte à cogner les intrus."
  },
  {
    theme: "Les Guerriers d'Élite Mink",
    citizen: "Wanda",
    imposter: "Carrot",
    citizenDesc: "La chienne Mink loyale et protectrice en chef de la principauté de Mokomo.",
    imposterDesc: "La lieutenante lapine dynamique ayant mené la garde royale de Zou."
  },
  {
    theme: "L'Équipage du Heart (Les Seconds)",
    citizen: "Shachi",
    imposter: "Penguin",
    citizenDesc: "Le pirate enjoué coiffé d'une casquette, farceur officiel de l'équipage de Law.",
    imposterDesc: "Le nageur d'élite arborant un chapeau de morse, fidèle lieutenant du Heart."
  },
  {
    theme: "Les Hommes de Confiance du Heart",
    citizen: "Bepo",
    imposter: "Jean Bart",
    citizenDesc: "L'ours Mink karatéka ultra-sensible s'excusant à la moindre remontrance.",
    imposterDesc: "L'ancien capitaine pirate colossal libéré de l'esclavage par Trafalgar Law."
  },
  {
    theme: "Les Monstres de la Don Quijote Family",
    citizen: "Pica",
    imposter: "Trebol",
    citizenDesc: "Le géant de pierre à la voix de fausset capable de fusionner avec la forteresse.",
    imposterDesc: "L'onctueux conseiller de Doflamingo collant ses cibles avec du mucus hautement inflammable."
  },
  {
    theme: "Les Lieutenants de Dressrosa",
    citizen: "Diamante",
    imposter: "Gladius",
    citizenDesc: "Le champion de l'arène au corps de drapeau flottant pouvant ramollir l'acier.",
    imposterDesc: "Le tireur d'élite hystérique explosant ses vêtements à la moindre contrariété."
  },
  {
    theme: "La Grande Flotte (Les Rois du Colisée)",
    citizen: "Sai",
    imposter: "Ideo",
    citizenDesc: "Le digne héritier de la marine Happo maniant le coup de pied destructeur de montagnes.",
    imposterDesc: "Le boxeur destructeur dont les épaules explosives génèrent des ondes de choc."
  },
  {
    theme: "La Grande Flotte (Les Capitaines Nobles)",
    citizen: "Cavendish",
    imposter: "Orlumbus",
    citizenDesc: "Le prince charmant narcissique victime de somnambulisme démoniaque (Hakuba).",
    imposterDesc: "Le pionnier de la flotte de Yonta Maria, expert en lancer de pirates."
  },
  {
    theme: "Les Protecteurs de Rebecca",
    citizen: "Kyros",
    imposter: "Viola",
    citizenDesc: "Le légendaire gladiateur unijambiste transformé en soldat de plomb pour veiller sur sa fille.",
    imposterDesc: "La princesse de Dressrosa douée de clairvoyance et capable de lire les cœurs."
  },
  {
    theme: "Les Survivants de Wano (Fourreaux Rouges)",
    citizen: "Raizo",
    imposter: "Kawamatsu",
    citizenDesc: "Le ninja fantasque capable de stocker et de renvoyer n'importe quelle attaque d'eau ou feu.",
    imposterDesc: "Le fier homme-poisson Sumo combatif se faisant passer pour un Kappa légendaire."
  },
  {
    theme: "Les Ombres de Wano (Ashura / Shinobu)",
    citizen: "Ashura Doji",
    imposter: "Shinobu",
    citizenDesc: "Le redoutable chef des bandits du mont Atama ayant autrefois tenu tête à Kaido.",
    imposterDesc: "La kunoichi mûre adepte des techniques d'infiltration et du mûrissement instantané."
  },
  {
    theme: "Les Rois Géants Originels",
    citizen: "Dorry",
    imposter: "Broggy",
    citizenDesc: "Le colosse guerrier d'Elbaf respectant les codes de l'honneur des combats séculaires.",
    imposterDesc: "L'autre pilier de la force herculéenne d'Elbaf combattant sans trêve ni haine."
  },
  {
    theme: "Les Idoles Légendaires",
    citizen: "Uta",
    imposter: "Shanks",
    citizenDesc: "La diva mondiale à la voix magique capable de piéger les esprits dans sa partition.",
    imposterDesc: "Le protecteur bienveillant et redoutable Yonko ayant sacrifié son bras pour Luffy."
  },
  {
    theme: "Les Génies d'East Blue (Kuro / Krieg)",
    citizen: "Kuro",
    imposter: "Don Krieg",
    citizenDesc: "Le machiavélique majordome d'East Blue aux griffes de chat ultra-rapides.",
    imposterDesc: "L'armure d'or d'East Blue comptant uniquement sur son arsenal d'armes technologiques."
  },
  {
    theme: "Les Tyrans d'East Blue",
    citizen: "Arlong",
    imposter: "Morgan",
    citizenDesc: "L'homme-poisson requin-scie méprisant profondément les humains et dominant Cocoyasi.",
    imposterDesc: "L'ancien capitaine de la marine corrompu doté d'une gigantesque hache greffée au bras."
  },
  {
    theme: "Les Pirates de la Première Heure",
    citizen: "Alvida",
    imposter: "Buggy le Clown",
    citizenDesc: "La capitaine au corps glissant de beauté ayant formé la première alliance avec Buggy.",
    imposterDesc: "Le pirate rigolard au nez rouge capable de séparer les membres de son corps."
  },
  {
    theme: "Les Souverains Excentriques (Wapol / Foxy)",
    citizen: "Wapol",
    imposter: "Foxy",
    citizenDesc: "Le roi glouton de Drum engloutissant des usines entières pour fusionner les métaux.",
    imposterDesc: "L'hôte fantasque du Davy Back Fight capable de ralentir le temps de trente secondes."
  },
  {
    theme: "Les Ombres de Thriller Bark (Savants / Monstres)",
    citizen: "Dr. Hogback",
    imposter: "Absalom",
    citizenDesc: "Le chirurgien de génie déchu recousant les cadavres pour fabriquer des zombies.",
    imposterDesc: "L'homme-bête invisible protégeant jalousement le manoir de Moria."
  },
  {
    theme: "Les Divinités des Mers (Hommes-Poissons)",
    citizen: "Hody Jones",
    imposter: "Fisher Tiger",
    citizenDesc: "L'extrémiste de l'île des hommes-poissons dopé aux drogues de combat énergétiques.",
    imposterDesc: "Le héros national ayant escaladé Red Line à mains nues pour libérer les siens."
  },
  {
    theme: "Les Royautés de l'Océan",
    citizen: "Roi Neptune",
    imposter: "Otohime",
    citizenDesc: "Le seigneur de l'île des hommes-poissons montant la baleine géante Hoe.",
    imposterDesc: "La reine militante au cœur d'or prêchant pour la réconciliation avec le monde terrestre."
  },
  {
    theme: "Les Secrets de Marie-Joie",
    citizen: "Imu",
    imposter: "Figarland Garling",
    citizenDesc: "L'entité entourée de mystères régnant sur le gouvernement mondial depuis le Trône Vide.",
    imposterDesc: "Le champion et souverain suprême des Chevaliers Dieux de la Terre Sainte."
  },
  {
    theme: "Les Infiltrés du CP (Jabra / Kalifa)",
    citizen: "Jabra",
    imposter: "Kalifa",
    citizenDesc: "L'agent féroce du CP9 adepte du mensonge se transformant en loup Rokushiki.",
    imposterDesc: "La secrétaire du CP9 capable de laver la force de ses détracteurs avec du savon."
  },
  {
    theme: "Les Ombres du CP0",
    citizen: "Guernica",
    imposter: "Stussy",
    citizenDesc: "Le courageux agent au masque fendu ayant immortalisé le Gear 5 d'One Piece.",
    imposterDesc: "Le clone parfait de MADS infiltré au cœur même du gouvernement mondial."
  },
  {
    theme: "Les Figures d'East Blue",
    citizen: "Kaya",
    imposter: "Makino",
    citizenDesc: "La jeune héritière de Sirop soignée par les fabuleuses histoires d'Usopp.",
    imposterDesc: "L'aimable tenancière du bar de Foosha ayant appris les bonnes manières à Luffy."
  },
  {
    theme: "Les Héros oubliés d'East Blue",
    citizen: "Kuina",
    imposter: "Zeff",
    citizenDesc: "L'héritière du dojo de Shimotsuki dont la disparition a marqué Zoro à jamais.",
    imposterDesc: "Le cuisinier pirate qui a donné sa jambe pour la survie du jeune Sanji."
  },
  {
    theme: "Les Supernovas du Ciel / De la Terre",
    citizen: "Urouge",
    imposter: "Capone Bege",
    citizenDesc: "Le moine fou céleste qui sourit toujours, même sous la torture des combats.",
    imposterDesc: "Le mafieux redoutable adepte d'une défense infaillible et d'un amour paternel exemplaire."
  },
  {
    theme: "Les Supernovas Musiciens",
    citizen: "Scratchmen Apoo",
    imposter: "Killer",
    citizenDesc: "Le pirate de la tribu des longs-bras transformant son corps en orchestre d'attaque.",
    imposterDesc: "Le bretteur masqué maniant des faux rotatives avec une agilité déconcertante."
  },
  {
    theme: "La Noblesse Mondiale",
    citizen: "Shepherd Ju Peter",
    imposter: "Jaygarcia Saturn",
    citizenDesc: "Le doyen de l'agriculture se métamorphosant en un gigantesque ver fouisseur.",
    imposterDesc: "L'un des cinq doyen suprêmes dirigeant le courroux scientifique mondial."
  },
  {
    theme: "Les Génies de la Navigation",
    citizen: "Nami",
    imposter: "Lafitte",
    citizenDesc: "La navigatrice de génie des Chapeaux de Paille capable de cartographier le monde entier.",
    imposterDesc: "L'élégant et mystérieux navigateur volant de l'équipage de Barbe Noire."
  },
  {
    theme: "Les Géants d'Elbaf (Les Rois Originels)",
    citizen: "Dorry",
    imposter: "Loki",
    citizenDesc: "Le légendaire co-capitaine des Guerriers Géants d'Elbaf.",
    imposterDesc: "Le prince excentrique d'Elbaf destiné à unifier son royaume."
  },
  {
    theme: "Les Sniper d'Élite des Empereurs",
    citizen: "Yasopp",
    imposter: "Van Augur",
    citizenDesc: "Le tireur d'élite infaillible des pirates du Roux.",
    imposterDesc: "Le sniper ténébreux de Barbe Noire capable de téléportation."
  },
  {
    theme: "Les Sabreurs de la Marine / SWORD",
    citizen: "Tashigi",
    imposter: "Momonga",
    citizenDesc: "La lieutenante zélée de la Marine, collectionneuse passionnée de sabres de légende.",
    imposterDesc: "Le rigide et Stoïque Vice-Amiral de la Marine maniant son sabre avec honneur."
  },
  {
    theme: "Les Scientifiques Légendaires MADS",
    citizen: "Dr. Vegapunk (Stella)",
    imposter: "Caesar Clown",
    citizenDesc: "Le plus grand cerveau de l'histoire, créateur des plus incroyables avancées technologiques.",
    imposterDesc: "Le savant fou adepte du gaz venimeux et créateur des fruits artificiels SMILE."
  },
  {
    theme: "La Famille Royale de Dressrosa",
    citizen: "Rebecca",
    imposter: "Viola",
    citizenDesc: "La gladiatrice sans épée de Dressrosa luttant pour protéger sa liberté.",
    imposterDesc: "La princesse danseuse douée de clairvoyance et capable de lire les cœurs."
  },
  {
    theme: "Les Officiers de la Flotte (Bartolomeo / Cavendish)",
    citizen: "Bartolomeo",
    imposter: "Cavendish",
    citizenDesc: "Le fan numéro un des Chapeaux de Paille doté du pouvoir des barrières indestructibles.",
    imposterDesc: "Le prince narcissique victime de somnambulisme démoniaque (Hakuba)."
  },
  {
    theme: "Les Infiltrés du CP9 (Jabra / Kaku)",
    citizen: "Jabra",
    imposter: "Kaku",
    citizenDesc: "L'agent féroce déguisé adepte des mensonges, se transformant en loup Rokushiki.",
    imposterDesc: "Le constructeur de navires de Galley-La devenu girafe destructrice et agile."
  },
  {
    theme: "Les Doyens Célestes (Warcury / Ju Peter)",
    citizen: "Topman Warcury",
    imposter: "Shepherd Ju Peter",
    citizenDesc: "Le Doyen de la Justice suprême capable de se transformer en un sanglier divin massif.",
    imposterDesc: "Le Doyen de l'Agriculture se métamorphosant en un gigantesque ver fouisseur."
  },
  {
    theme: "Les Doyens Célestes (Mars / Nusjuro)",
    citizen: "Marcus Mars",
    imposter: "Ethanbaron V. Nusjuro",
    citizenDesc: "Le Doyen de l'Environnement s'envolant sous l'apparence d'un oiseau géant légendaire.",
    imposterDesc: "Le squelette doyen de la finance maniant un sabre de glace dévastateur."
  },
  {
    theme: "Les Commandants de Barbe Blanche (Jozu / Vista)",
    citizen: "Jozu",
    imposter: "Vista",
    citizenDesc: "Le commandant colossal au corps de diamant d'une résistance absolue.",
    imposterDesc: "Le fleurettiste aux moustaches légendaires, rival respecté de Mihawk."
  },
  {
    theme: "Les Commandants de Barbe Blanche (Ace / Izo)",
    citizen: "Portgas D. Ace",
    imposter: "Izo",
    citizenDesc: "Le frère spirituel de Luffy doté du Logia du Feu (Mera Mera no Mi).",
    imposterDesc: "L'élégant tireur d'élite aux pistolets à silex originaire du pays de Wano."
  },
  {
    theme: "Les Monstres Masculins de Kaido",
    citizen: "King",
    imposter: "Jack",
    citizenDesc: "La terrible Calamité des Lunarias maîtrisant les flammes divines.",
    imposterDesc: "Le redoutable mammouth dévastateur d'une cruauté sans limite."
  },
  {
    theme: "Les Monstres Féminins de Kaido",
    citizen: "Ulti",
    imposter: "Black Maria",
    citizenDesc: "La sœurette impulsive au coup de boule tyrannique dinosaurien.",
    imposterDesc: "La maîtresse géante de la maison close de Wano maniant l'araignée de feu."
  },
  {
    theme: "Les Cadres de Doflamingo (Trébol / Diamante)",
    citizen: "Trebol",
    imposter: "Diamante",
    citizenDesc: "Le conseiller visqueux et collant manipulant le mucus hautement inflammable.",
    imposterDesc: "Le champion héroïque de l'arène au corps de drapeau flottant pouvant ramollir l'acier."
  },
  {
    theme: "Les Cadres de Doflamingo (Pica / Gladius)",
    citizen: "Pica",
    imposter: "Gladius",
    citizenDesc: "Le colosse de pierre à la voix aigue capable de fusionner avec la forteresse.",
    imposterDesc: "Le lieutenant colérique capable de faire exploser n'importe quelle matière solide."
  },
  {
    theme: "Les Guerriers Souverains de Wano",
    citizen: "Kozuki Momonosuke",
    imposter: "Kozuki Oden",
    citizenDesc: "Le jeune héritier légitime du clan Kozuki capable d'invoquer un grand dragon d'azur.",
    imposterDesc: "Le légendaire shogun aventurier ayant navigué avec Roger et Barbe Blanche."
  },
  {
    theme: "Les Protecteurs Minks Nocturnes / Diurnes",
    citizen: "Nekomamushi",
    imposter: "Inuarashi",
    citizenDesc: "Le colossal félin de la nuit régnant sur Zou et adorant les lasagnes.",
    imposterDesc: "Le noble k9 de la journée, ancien compagnon de la flibuste d'Oden."
  },
  {
    theme: "Les Tireurs d'East Blue",
    citizen: "Usopp",
    imposter: "Kuro",
    citizenDesc: "Le sniper inventif menteur du village de Sirop voulant devenir brave.",
    imposterDesc: "L'implacable cerveau lunatique aux griffes de chat et à l'astuce perfide."
  },
  {
    theme: "Les Souveraines Tyranniques",
    citizen: "Charlotte Linlin (Big Mom)",
    imposter: "Boa Hancock",
    citizenDesc: "La terrible impératrice de Totto Land manipulant l'âme et la faim dévastatrice.",
    imposterDesc: "L'impératrice d'Amazon Lily changeant ses détracteurs en pierre pétrifiée."
  },
  {
    theme: "Les Guerriers Liés au Haki des Rois",
    citizen: "Shanks",
    imposter: "Gol D. Roger",
    citizenDesc: "Le charismatique Yonko au chapeau de paille transmis dont le Haki fend les cieux.",
    imposterDesc: "Le légendaire Roi des Pirates ayant conquis toutes les mers avec son sabre."
  },
  {
    theme: "Les Amiraux du Changement (Aokiji / Fujitora)",
    citizen: "Kuzan (Aokiji)",
    imposter: "Issho (Fujitora)",
    citizenDesc: "L'ex-amiral de glace adepte de la justice tranquille et fainéante.",
    imposterDesc: "L'amiral aveugle vertueux contrôlant la gravité des météorites célestes."
  },
  {
    theme: "Les Amiraux de la Poigne (Akainu / Ryokugyu)",
    citizen: "Sakazuki (Akainu)",
    imposter: "Aramaki (Ryokugyu)",
    citizenDesc: "L'inflexible Amiral en Chef doté du terrible Logia de magma ultra-chaud.",
    imposterDesc: "L'amiral de la forêt fervent partisan du statu quo mondial et des dragons célestes."
  },
  {
    theme: "Les Esprits Libres de la Marine",
    citizen: "Monkey D. Garp",
    imposter: "Smoker",
    citizenDesc: "Le Vice-Amiral légendaire, héros de la Marine fuyant les promotions contraignantes.",
    imposterDesc: "L'officier rebelle de Loguetown doté de fumée indomptable et de cigares constants."
  },
  {
    theme: "La Jeune Garde de la Marine",
    citizen: "Koby",
    imposter: "Sentomaru",
    citizenDesc: "Le protégé courageux de Garp doté d'un sens aigu de l'éthique navale.",
    imposterDesc: "Le garde officiel au style de sumo doté de la meilleure défense au monde."
  },
  {
    theme: "Les Femmes de l'Armée Révolutionnaire",
    citizen: "Koala",
    imposter: "Belo Betty",
    citizenDesc: "L'experte en karaté des hommes-poissons, amie d'enfance dévouée de Sabo.",
    imposterDesc: "La commandante fougueuse inspirant les masses opprimées d'un coup de drapeau."
  },
  {
    theme: "Les Monstres de la Révolution",
    citizen: "Karasu",
    imposter: "Morley",
    citizenDesc: "L'officier aux ombres s'exprimant à travers des nuées de corbeaux de suie.",
    imposterDesc: "Le géant travesti manipulant la terre battue avec son harpon géant."
  },
  {
    theme: "Les Archéologues de la Destruction",
    citizen: "Nico Robin",
    imposter: "Imu",
    citizenDesc: "La fleur survivante déchiffrant les stèles de l'Ancien Royaume.",
    imposterDesc: "L'existence suprême et secrète trônant sur l'ombre du monde entier."
  },
  {
    theme: "Les Monstres Marins Légendaires",
    citizen: "Fisher Tiger",
    imposter: "Arlong",
    citizenDesc: "Le libérateur légendaire des esclaves ayant escaladé Red Line.",
    imposterDesc: "Le redoutable capitaine requin-scie assoiffé de vengeance contre l'humanité."
  },
  {
    theme: "Les Dieux de la Foudre / Vitesse",
    citizen: "Enel",
    imposter: "Borsalino (Kizaru)",
    citizenDesc: "Le dieu de la foudre autoproclamé régnant sur l'île céleste.",
    imposterDesc: "L'amiral de lumière étincelante se déplaçant à la vitesse absolue de l'éclair."
  },
  {
    theme: "Les Amis du Village de Fushia",
    citizen: "Monkey D. Luffy",
    imposter: "Makino",
    citizenDesc: "Le gamin élastique mangeur de viande destiné à devenir le Roi des Pirates.",
    imposterDesc: "La douce gérante de taverne ayant veillé sur Luffy et ses frères."
  },
  {
    theme: "Les Frères Vinsmoke (Ichiji / Niji)",
    citizen: "Vinsmoke Ichiji",
    imposter: "Vinsmoke Niji",
    citizenDesc: "L'aîné rouge du Germa 66, parfait soldat sans émotions doté de lasers.",
    imposterDesc: "Le frère bleu électrique ultra-rapide et impitoyable de la famille Vinsmoke."
  },
  {
    theme: "Les Frères Vinsmoke (Yonji / Sanji)",
    citizen: "Vinsmoke Yonji",
    imposter: "Vinsmoke Sanji",
    citizenDesc: "Le cadet vert muni d'un squelette d'acier trempé et d'une force robuste.",
    imposterDesc: "Le cuisinier passionné de la jambe noire au cœur protecteur de femmes."
  },
  {
    theme: "Les Lieutenants Terribles de Barbe Noire",
    citizen: "Shiryu",
    imposter: "Avalo Pizarro",
    citizenDesc: "Le terrible sabreur d'Impel Down maîtrisant le fruit de l'invisibilité.",
    imposterDesc: "Le terrifiant roi déchu capable de fusionner avec le relief d'une île entière."
  },
  {
    theme: "Les Colosses de Barbe Noire",
    citizen: "Jesus Burgess",
    imposter: "Sanjuan Wolf",
    citizenDesc: "Le catcheur féroce doté du fruit du muscle augmentant sa force physique.",
    imposterDesc: "Le colossal navire de guerre vivant marchant directement dans le lit de l'océan."
  },
  {
    theme: "Les Évadés du Niveau 6 (Doc Q / Devon)",
    citizen: "Doc Q",
    imposter: "Catarina Devon",
    citizenDesc: "Le sinistre médecin malade distribuant des pommes explosives du destin.",
    imposterDesc: "La cruelle chasseresse de têtes pouvant se métamorphoser en renard à neuf queues."
  },
  {
    theme: "Les Filles Maudites de Big Mom",
    citizen: "Charlotte Pudding",
    imposter: "Charlotte Perona",
    citizenDesc: "L'artiste chocolatière aux trois yeux capable d'altérer les mémoires.",
    imposterDesc: "La princesse rose des fantômes froids, reine autoproclamée du gothique romantique."
  },
  {
    theme: "Les Monstres Féminins de Thriller Bark",
    citizen: "Perona",
    imposter: "Gecko Moria",
    citizenDesc: "La maîtresse fantasque des Negative Hollows rendant ses cibles dépressives.",
    imposterDesc: "L'ex-corsaire géant collectant les ombres pour engendrer son armée de zombies."
  },
  {
    theme: "Les Animaux Célèbres de la Route",
    citizen: "Karoo",
    imposter: "Chouchou",
    citizenDesc: "Le super colvert ultra-rapide et destrier fétiche de la princesse d'Alabasta.",
    imposterDesc: "Le petit chien fidèle défendant férocement la boutique de croquettes à Orange."
  },
  {
    theme: "Les Passagers Célèbres du Heart",
    citizen: "Bepo",
    imposter: "Jean Bart",
    citizenDesc: "Le Mink ours polaire sensible s'excusant de sa simple existence.",
    imposterDesc: "Le colosse guerrier autrefois asservi racheté par l'équipage du Heart."
  },
  {
    theme: "Les Hommes de l'Ombre du Heart",
    citizen: "Shachi",
    imposter: "Penguin",
    citizenDesc: "Le pirate gai coiffé d'une casquette rouge, farceur du sous-marin.",
    imposterDesc: "Le fidèle lieutenant en habit de morse dévoué à Trafalgar Law."
  },
  {
    theme: "Les Charpentiers Rivaux",
    citizen: "Franky",
    imposter: "Paulie",
    citizenDesc: "Le charpentier cybernétique excentrique carburant au cola frais.",
    imposterDesc: "Le contremaître de Galley-La utilisant des cordages complexes combinés au combat."
  },
  {
    theme: "Les Monstres d'Egghead (Shaka / Lilith)",
    citizen: "Shaka",
    imposter: "Lilith",
    citizenDesc: "Le satellite masqué de la raison (Good) de Vegapunk.",
    imposterDesc: "Le satellite incarnant la malice rebelle (Evil) de Vegapunk."
  },
  {
    theme: "Les Monstres d'Egghead (Edison / Pythagoras)",
    citizen: "Edison",
    imposter: "Pythagoras",
    citizenDesc: "Le petit robot incarnant la vivacité d'esprit créative.",
    imposterDesc: "La structure robotique accumulant les données d'analyse chiffrées."
  },
  {
    theme: "Les Figures Sacrées d'Alabasta",
    citizen: "Nefertari Vivi",
    imposter: "Crocodile",
    citizenDesc: "La princesse courageuse d'Alabasta ayant sauvé son peuple.",
    imposterDesc: "Le chef machiavélique de Baroque Works manipulant le sable chaud."
  },
  {
    theme: "Les Corsaires Insolites",
    citizen: "Baggy le Clown",
    imposter: "Bartholomew Kuma",
    citizenDesc: "Le pirate burlesque devenu empereur suite à des malentendus insolites.",
    imposterDesc: "Le révolutionnaire cybernétique géant doté de coussinets téléporteurs."
  },
  {
    theme: "La Cyborg Family",
    citizen: "Bartholomew Kuma",
    imposter: "Stussy",
    citizenDesc: "Le colosse doté de coussinets ayant offert sa conscience à la science.",
    imposterDesc: "Le clone de MADS doté de petites ailes de démon masqué."
  },
  {
    theme: "Les Souverains Protecteurs des Profondeurs",
    citizen: "Shirahoshi",
    imposter: "Roi Neptune",
    citizenDesc: "La princesse sirène géante capable de murmurer à l'oreille de Poséidon.",
    imposterDesc: "Le vénérable roi de l'île des hommes-poissons armé de son trident royal."
  },
  {
    theme: "Les Épéistes Disciples de la Volonté",
    citizen: "Kuina",
    imposter: "Shimotsuki Ryuma",
    citizenDesc: "L'amie d'enfance regretée de Zoro l'ayant motivé à surpasser tous les sabreurs.",
    imposterDesc: "Le dieu de l'épée légendaire du pays de Wano ayant décapité un dragon volant."
  },
  {
    theme: "Les Nobles Rivaux de la Pire Génération",
    citizen: "Eustass Kid",
    imposter: "Basil Hawkins",
    citizenDesc: "Le redoutable capitaine manipulant la ferraille et le magnétisme.",
    imposterDesc: "Le bretteur magicien calculant les probabilités de survie à l'aide de ses cartes."
  }
];

interface Player {
  id: string; 
  name: string;
  email: string;
  avatar: string;
  role: "Citoyen" | "Imposteur" | "Mister White" | "";
  character: string;
  isReady: boolean;
  isEliminated: boolean;
  votedFor: string; 
  score?: number; 
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  createdAt: number;
}

interface RoomData {
  id: string;
  roomCode: string;
  creatorEmail: string;
  gameMaster: "Vegapunk" | "Morgans";
  status: "lobby" | "reveal" | "discussion" | "voting" | "mister_white_guess" | "end";
  players: Player[];
  theme: string;
  citizen: string;
  imposter: string;
  citizenDesc: string;
  imposterDesc: string;
  winnerMessage: string;
  chatMessages: ChatMessage[];
  roundScore: {
    citizens: number;
    imposters: number;
  };
  eliminatedPlayer: Player | null;
  misterWhiteGuess: string;
  createdAt: number;
  totalRounds?: number;
  currentRound?: number;
  speakingOrder?: string[];
}

interface UndercoverGameProps {
  characters: any[];
  onUpdateBounty: (amt: number) => void;
}

export default function UndercoverGame({ characters, onUpdateBounty }: UndercoverGameProps) {
  // Generate or retrieve a persistent browser session player id
  const [sessionPlayerId] = useState<string>(() => {
    const cached = sessionStorage.getItem("undercover_player_id");
    if (cached) return cached;
    const newId = "p_" + Math.random().toString(36).substring(2, 9);
    sessionStorage.setItem("undercover_player_id", newId);
    return newId;
  });

  // Client User defaults
  const clientName = localStorage.getItem("playerPirateName") || "Visiteur de Loguetown";
  const clientEmail = localStorage.getItem("firebaseUserEmail") || "guest_" + sessionPlayerId;
  const clientAvatar = localStorage.getItem("playerAvatarImage") || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(clientName)}`;

  // Find character's portrait/image in the Wiki database
  const getCharacterImage = (charName: string): string => {
    if (!charName) return "";
    if (charName === "Mister White") {
      return "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&auto=format&fit=crop"; 
    }
    if (characters && characters.length > 0) {
      const cleanSearch = charName.toLowerCase();
      
      // Attempt 1: Exact match or direct contains
      let found = characters.find(c => {
        const cName = c.name ? c.name.toLowerCase() : "";
        return cName === cleanSearch || cleanSearch.includes(cName) || cName.includes(cleanSearch);
      });
      
      // Attempt 2: Split and match name parts
      if (!found) {
        const parts = cleanSearch.replace(/[.\(\)]/g, "").split(" ");
        for (const part of parts) {
          if (part.length > 2 && part !== "the" && part !== "der" && part !== "don") {
            found = characters.find(c => {
              const cName = c.name ? c.name.toLowerCase() : "";
              return cName.includes(part);
            });
            if (found) break;
          }
        }
      }
      
      if (found && found.image) {
        return found.image;
      }
    }
    return "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop";
  };

  // UI States
  const [roomCodeInput, setRoomCodeInput] = useState<string>("");
  const [customName, setCustomName] = useState<string>(clientName);
  const [gameMaster, setGameMaster] = useState<"Vegapunk" | "Morgans">("Vegapunk");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorString, setErrorString] = useState<string | null>(null);
  const [successString, setSuccessString] = useState<string | null>(null);

  // Active sync states
  const [room, setRoom] = useState<RoomData | null>(null);
  const [isRevealOpen, setIsRevealOpen] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>("");

  // Refs
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Selector for game modes (Online vs Local Pass-the-phone)
  const [gameMode, setGameMode] = useState<"online" | "local" | null>(null);

  // Local game states
  const [localPlayers, setLocalPlayers] = useState<Player[]>([]);
  const [localStatus, setLocalStatus] = useState<"lobby" | "reveal" | "discussion" | "voting" | "mister_white_guess" | "end">("lobby");
  const [localTheme, setLocalTheme] = useState("");
  const [localCitizen, setLocalCitizen] = useState("");
  const [localImposter, setLocalImposter] = useState("");
  const [localCitizenDesc, setLocalCitizenDesc] = useState("");
  const [localImposterDesc, setLocalImposterDesc] = useState("");
  const [localWinnerMessage, setLocalWinnerMessage] = useState("");
  const [localEliminatedPlayer, setLocalEliminatedPlayer] = useState<Player | null>(null);
  const [localMisterWhiteGuess, setLocalMisterWhiteGuess] = useState("");
  const [localRoundScore, setLocalRoundScore] = useState({ citizens: 0, imposters: 0 });

  // Rounds and turn states
  const [localTotalRounds, setLocalTotalRounds] = useState<number>(3);
  const [localCurrentRound, setLocalCurrentRound] = useState<number>(1);
  const [localSpeakingOrder, setLocalSpeakingOrder] = useState<string[]>([]);
  
  // Online room configurations inputs by the creator
  const [roomTotalRoundsInput, setRoomTotalRoundsInput] = useState<number>(3);

  // Active revealing indices for pass-the-phone
  const [activeRevealIndex, setActiveRevealIndex] = useState(0);
  const [isLocalRoleVisible, setIsLocalRoleVisible] = useState(false);
  const [localConfirmEliminateId, setLocalConfirmEliminateId] = useState<string | null>(null);

  // New local players custom count and names
  const [localPlayerCount, setLocalPlayerCount] = useState<number>(4);
  const [localPlayerNames, setLocalPlayerNames] = useState<string[]>(["Luffy", "Zoro", "Nami", "Usopp", "Sanji", "Chopper", "Robin", "Franky"]);

  // Local Mode gameplay handlers (supports multiple rounds!)
  const handleStartLocalGame = () => {
    handleStartLocalRound(false);
  };

  const handleStartLocalRound = (isNextRound: boolean) => {
    setErrorString(null);
    setSuccessString(null);

    let nextRound = 1;
    if (isNextRound) {
      nextRound = localCurrentRound + 1;
    } else {
      // Starting fresh game from lobby: reset player scores in their names setup
    }
    setLocalCurrentRound(nextRound);

    // Pick pairing
    const selectedPair = FAMOUS_UNDERCOVER_PAIRS[Math.floor(Math.random() * FAMOUS_UNDERCOVER_PAIRS.length)];
    const swap = Math.random() < 0.5;
    const pair = {
      theme: selectedPair.theme,
      citizen: swap ? selectedPair.imposter : selectedPair.citizen,
      imposter: swap ? selectedPair.citizen : selectedPair.imposter,
      citizenDesc: swap ? selectedPair.imposterDesc : selectedPair.citizenDesc,
      imposterDesc: swap ? selectedPair.citizenDesc : selectedPair.imposterDesc,
    };
    const pCount = Math.min(Math.max(localPlayerCount, 3), 8);

    // Role Distribution Strategy
    let roles: ("Citoyen" | "Imposteur" | "Mister White")[] = [];
    if (pCount === 3) {
      roles = ["Citoyen", "Citoyen", "Imposteur"];
    } else if (pCount === 4) {
      roles = ["Citoyen", "Citoyen", "Citoyen", "Imposteur"];
    } else if (pCount === 5) {
      roles = ["Citoyen", "Citoyen", "Citoyen", "Imposteur", "Mister White"];
    } else if (pCount === 6) {
      roles = ["Citoyen", "Citoyen", "Citoyen", "Citoyen", "Imposteur", "Mister White"];
    } else if (pCount === 7) {
      roles = ["Citoyen", "Citoyen", "Citoyen", "Citoyen", "Citoyen", "Imposteur", "Mister White"];
    } else {
      roles = ["Citoyen", "Citoyen", "Citoyen", "Citoyen", "Citoyen", "Imposteur", "Imposteur", "Mister White"];
    }

    // Shrink and Shuffle Roles
    roles = roles.slice(0, pCount).sort(() => Math.random() - 0.5);

    // Build the players
    const configuredPlayers: Player[] = Array.from({ length: pCount }).map((_, idx) => {
      const assignedRole = roles[idx];
      let name = localPlayerNames[idx]?.trim();
      if (!name) name = `Moussaillon ${idx + 1}`;
      
      let assignedCharacter = pair.citizen;
      if (assignedRole === "Imposteur") assignedCharacter = pair.imposter;
      if (assignedRole === "Mister White") assignedCharacter = "Mister White";

      let previousScore = 0;
      let existingAvatar = "";
      if (isNextRound && localPlayers[idx]) {
        previousScore = localPlayers[idx].score || 0;
        existingAvatar = localPlayers[idx].avatar;
      }

      // Instead of pixel-art avatar seeds, choose a random character artwork image from the loaded database!
      let assignedAvatar = existingAvatar;
      if (!assignedAvatar) {
        if (characters && characters.length > 0) {
          const randCharIdx = (idx + Math.floor(Math.random() * characters.length)) % characters.length;
          assignedAvatar = characters[randCharIdx]?.image;
        }
        // Fallback to beautiful default portraits if characters aren't available yet
        if (!assignedAvatar) {
          const fallbackPortraits = [
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=150&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=150&auto=format&fit=crop"
          ];
          assignedAvatar = fallbackPortraits[idx % fallbackPortraits.length];
        }
      }

      return {
        id: `local_p_${idx}`,
        name: name,
        email: `local_p_${idx}@local.onepiece`,
        avatar: assignedAvatar,
        role: assignedRole,
        character: assignedCharacter,
        isReady: false,
        isEliminated: false,
        votedFor: "",
        score: previousScore
      };
    });

    // Generate random speaking turn order for alive players
    const randomizedOrder = [...configuredPlayers].sort(() => Math.random() - 0.5).map(p => p.id);
    setLocalSpeakingOrder(randomizedOrder);

    setLocalPlayers(configuredPlayers);
    setLocalTheme(pair.theme);
    setLocalCitizen(pair.citizen);
    setLocalImposter(pair.imposter);
    setLocalCitizenDesc(pair.citizenDesc);
    setLocalImposterDesc(pair.imposterDesc);
    setLocalStatus("reveal");
    setActiveRevealIndex(0);
    setIsLocalRoleVisible(false);
    setLocalWinnerMessage("");
    setLocalEliminatedPlayer(null);
    setLocalMisterWhiteGuess("");
    setLocalConfirmEliminateId(null);
  };

  const handleLocalEliminateSubmit = (targetPlayerId: string) => {
    const targetPlayer = localPlayers.find(p => p.id === targetPlayerId);
    if (!targetPlayer) return;

    // Eliminate target
    const updatedPlayers = localPlayers.map(p => {
      if (p.id === targetPlayerId) {
        return { ...p, isEliminated: true };
      }
      return p;
    });

    const isWhite = targetPlayer.role === "Mister White";
    const roleLabel = targetPlayer.role === "Citoyen" ? "Citoyen (Civil)" : targetPlayer.role === "Imposteur" ? "Imposteur" : "Mister White";

    if (isWhite) {
      setLocalPlayers(updatedPlayers);
      setLocalEliminatedPlayer(targetPlayer);
      setLocalStatus("mister_white_guess");
      setSuccessString(`🕵️ ${targetPlayer.name} a été éliminé ! C'était Mister White ! C'est à lui de deviner le mot d'équipage secret.`);
    } else {
      // Run normal check
      const checkRemaining = updatedPlayers.filter(p => !p.isEliminated);
      const aliveCitizens = checkRemaining.filter(p => p.role === "Citoyen");
      const aliveUndercovers = checkRemaining.filter(p => p.role === "Imposteur" || p.role === "Mister White");

      if (aliveUndercovers.length === 0) {
        // Citizens won !
        const scored = updatedPlayers.map(p => {
          let added = 0;
          if (p.role === "Citoyen") {
            added += 3;
            if (!p.isEliminated) added += 1;
          }
          return { ...p, score: (p.score || 0) + added };
        });
        setLocalPlayers(scored);
        setLocalStatus("end");
        setLocalWinnerMessage(`Les CITOYENS remportent la victoire avec brio ! L'infiltration a été entièrement neutralisée. Le dernier banni (${targetPlayer.name}) était ${roleLabel}.`);
        setLocalRoundScore(prev => ({ ...prev, citizens: prev.citizens + 1 }));

        // Award bounty if the active device user (clientName) was a Citizen and won!
        const selfInGame = scored.find(p => p.name.toLowerCase() === customName.toLowerCase());
        if (selfInGame && selfInGame.role === "Citoyen") {
          onUpdateBounty(50000);
          setSuccessString(`🎉 ÉQUIPAGE GAGNANT ! Votre prime augmente de +50 000 Berrys ! (${targetPlayer.name} était ${roleLabel})`);
        } else {
          setSuccessString(`🎉 Les Citoyens ont gagné ! Le dernier banni (${targetPlayer.name}) était ${roleLabel}.`);
        }
      } else if (aliveCitizens.length <= aliveUndercovers.length) {
        // Imposters win !
        const scored = updatedPlayers.map(p => {
          let added = 0;
          if (p.role === "Imposteur" || p.role === "Mister White") {
            added += 5;
            if (!p.isEliminated) added += 1;
          }
          return { ...p, score: (p.score || 0) + added };
        });
        setLocalPlayers(scored);
        setLocalStatus("end");
        setLocalWinnerMessage(`L'IMPOSTEUR triomphe ! La discorde s'est emparée du pouvoir. Le dernier banni (${targetPlayer.name}) était ${roleLabel}.`);
        setLocalRoundScore(prev => ({ ...prev, imposters: prev.imposters + 1 }));

        // Award bounty if device user was Imposter / Mister White and won!
        const selfInGame = scored.find(p => p.name.toLowerCase() === customName.toLowerCase());
        if (selfInGame && (selfInGame.role === "Imposteur" || selfInGame.role === "Mister White")) {
          onUpdateBounty(100000);
          setSuccessString(`🎉 ÉQUIPAGE GAGNANT ! Votre prime augmente de +100 000 Berrys ! (${targetPlayer.name} était ${roleLabel})`);
        } else {
          setSuccessString(`🎉 L'Imposteur a gagné ! Le banni (${targetPlayer.name}) était ${roleLabel}.`);
        }
      } else {
        // Keep debating
        setLocalPlayers(updatedPlayers);
        setLocalStatus("discussion");
        setSuccessString(`⛓️ ${targetPlayer.name} a été banni de la table de jeu ! C'était un ${roleLabel}.`);
      }
    }
  };

  const handleLocalMisterWhiteGuess = (guessWord: string) => {
    if (!guessWord.trim()) return;

    const matchAnswer = localCitizen.toLowerCase().trim();
    const cleanGuess = guessWord.toLowerCase().trim();

    const isCorrect = cleanGuess.includes(matchAnswer) || matchAnswer.includes(cleanGuess) ||
      (cleanGuess.length >= 4 && matchAnswer.includes(cleanGuess));

    let winMsg = "";
    let scored = [...localPlayers];

    if (isCorrect) {
      winMsg = `INCROYABLE ! Mister White (${localEliminatedPlayer?.name}) a deviné juste ! Le personnage secret était bien "${localCitizen}". Victoire de Mister White !`;
      setLocalRoundScore(prev => ({ ...prev, imposters: prev.imposters + 1 }));

      scored = localPlayers.map(p => {
        let added = 0;
        if (p.role === "Mister White") {
          added += 6;
        }
        return { ...p, score: (p.score || 0) + added };
      });
      setLocalPlayers(scored);

      if (localEliminatedPlayer?.name.toLowerCase() === customName.toLowerCase()) {
        onUpdateBounty(100000);
        setSuccessString(`🎉 ÉQUIPAGE GAGNANT ! Votre prime augmente de +100 000 Berrys !`);
      }
    } else {
      winMsg = `ÉCHEC ! Mister White s'est trompé. Son estimation était "${guessWord}", mais le personnage secret des Citoyens était d'observation : "${localCitizen}". Les Citoyens l'emportent !`;
      setLocalRoundScore(prev => ({ ...prev, citizens: prev.citizens + 1 }));

      scored = localPlayers.map(p => {
        let added = 0;
        if (p.role === "Citoyen") {
          added += 3;
          if (!p.isEliminated) added += 1;
        }
        return { ...p, score: (p.score || 0) + added };
      });
      setLocalPlayers(scored);

      const selfInGame = scored.find(p => p.name.toLowerCase() === customName.toLowerCase());
      if (selfInGame && selfInGame.role === "Citoyen") {
        onUpdateBounty(50000);
        setSuccessString(`🎉 ÉQUIPAGE GAGNANT ! Votre prime augmente de +50 000 Berrys !`);
      }
    }

    setLocalStatus("end");
    setLocalWinnerMessage(winMsg);
    setLocalMisterWhiteGuess(guessWord);
  };

  // 1. Listen in real-time to the current room if set
  useEffect(() => {
    if (!room?.id) return;

    const docRef = doc(db, "undercoverGames", room.id);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.data() as RoomData;
        setRoom(val);
      } else {
        // Room was deleted or closed by the host
        setRoom(null);
        setErrorString("Le salon a été fermé par l'hôte.");
      }
    }, (err) => {
      console.error(err);
      handleFirestoreError(err, OperationType.GET, `undercoverGames/${room?.id}`, clientEmail);
    });

    return () => unsubscribe();
  }, [room?.id]);

  // Adjust chat scroll
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [room?.chatMessages?.length]);

  // Check if player won of the last game and update bounty
  const [bountyAwardedForRoomId, setBountyAwardedForRoomId] = useState<string>("");
  useEffect(() => {
    if (room?.status === "end" && room.id !== bountyAwardedForRoomId) {
      const self = room.players.find(p => p.id === sessionPlayerId);
      if (self) {
        const didWin = 
          (room.winnerMessage.includes("CITOYENS") && self.role === "Citoyen") ||
          (room.winnerMessage.includes("IMPOSTEUR") && self.role === "Imposteur") ||
          (room.winnerMessage.includes("Mister White") && self.role === "Mister White") ||
          (room.winnerMessage.includes("MISTER WHITE") && self.role === "Mister White");

        if (didWin) {
          // Gagner une partie rapporte au maximum:
          // 100 000 Berrys pour les imposteurs / Mister White
          // 50 000 Berrys pour les civils
          const prizeAmt = (self.role === "Imposteur" || self.role === "Mister White") ? 100000 : 50000;
          onUpdateBounty(prizeAmt);
          setSuccessString(`🎉 ÉQUIPAGE GAGNANT ! Votre prime augmente de +${prizeAmt.toLocaleString()} Berrys !`);
          setBountyAwardedForRoomId(room.id);
        }
      }
    }
  }, [room?.status, room?.id]);

  // Local helper: Generate custom 4-letter room code
  const generateCode = (): string => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let res = "";
    for (let i = 0; i < 4; i++) {
      res += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return res;
  };

  // Create a lobby
  const handleCreateRoom = async () => {
    setIsLoading(true);
    setErrorString(null);
    setSuccessString(null);

    const code = generateCode();
    const roomId = `room_${code}`;

    const hostPlayer: Player = {
      id: sessionPlayerId,
      name: customName.trim() || clientName,
      email: clientEmail,
      avatar: clientAvatar,
      role: "",
      character: "",
      isReady: false,
      isEliminated: false,
      votedFor: ""
    };

    const newRoom: RoomData = {
      id: roomId,
      roomCode: code,
      creatorEmail: clientEmail,
      gameMaster: gameMaster,
      status: "lobby",
      players: [hostPlayer],
      theme: "",
      citizen: "",
      imposter: "",
      citizenDesc: "",
      imposterDesc: "",
      winnerMessage: "",
      chatMessages: [
        {
          id: "welcome",
          senderId: "system",
          senderName: "SYSTÈME",
          senderAvatar: "",
          text: `Bienvenue sur le salon ${code} ! Participez en partageant ce code avec vos camarades.`,
          createdAt: Date.now()
        }
      ],
      roundScore: {
        citizens: 0,
        imposters: 0
      },
      eliminatedPlayer: null,
      misterWhiteGuess: "",
      createdAt: Date.now(),
      totalRounds: roomTotalRoundsInput,
      currentRound: 1,
      speakingOrder: []
    };

    try {
      await setDoc(doc(db, "undercoverGames", roomId), newRoom);
      setRoom(newRoom);
      setBountyAwardedForRoomId("");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `undercoverGames/${roomId}`, clientEmail);
      setErrorString("Impossible de créer le salon.");
    } finally {
      setIsLoading(false);
    }
  };

  // Join a lobby
  const handleJoinRoom = async () => {
    const cleanCode = roomCodeInput.trim().toUpperCase();
    if (!cleanCode) {
      setErrorString("Veuillez saisir un code à 4 lettres.");
      return;
    }

    setIsLoading(true);
    setErrorString(null);
    setSuccessString(null);
    const roomId = `room_${cleanCode}`;

    try {
      const roomSnap = await getDoc(doc(db, "undercoverGames", roomId));
      if (!roomSnap.exists()) {
        setErrorString(`Le salon ${cleanCode} n'existe pas.`);
        setIsLoading(false);
        return;
      }

      const roomData = roomSnap.data() as RoomData;
      if (roomData.status !== "lobby") {
        setErrorString("La partie a déjà commencée dans ce salon !");
        setIsLoading(false);
        return;
      }

      if (roomData.players.length >= 8) {
        setErrorString("Le salon est complet (Max 8 joueurs).");
        setIsLoading(false);
        return;
      }

      // Add player (prevent duplicate session IDs)
      const existingPlayers = roomData.players.filter(p => p.id !== sessionPlayerId);
      const newPlayer: Player = {
        id: sessionPlayerId,
        name: customName.trim() || clientName,
        email: clientEmail,
        avatar: clientAvatar,
        role: "",
        character: "",
        isReady: false,
        isEliminated: false,
        votedFor: ""
      };

      const updatedPlayers = [...existingPlayers, newPlayer];
      
      await updateDoc(doc(db, "undercoverGames", roomId), {
        players: updatedPlayers,
        chatMessages: [
          ...roomData.chatMessages,
          {
            id: `join_${sessionPlayerId}_${Date.now()}`,
            senderId: "system",
            senderName: "REJOINDRE",
            senderAvatar: "",
            text: `🏴‍☠️ ${newPlayer.name} a rejoint le salon !`,
            createdAt: Date.now()
          }
        ]
      });

      setRoom({
        ...roomData,
        players: updatedPlayers
      });
      setBountyAwardedForRoomId("");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `undercoverGames/${roomId}`, clientEmail);
      setErrorString("Code de salon invalide ou erreur réseau.");
    } finally {
      setIsLoading(false);
    }
  };

  // Quit / Leave Lounge
  const handleLeaveRoom = async () => {
    if (!room) return;
    setIsLoading(true);
    const roomId = room.id;

    try {
      if (room.creatorEmail === clientEmail) {
        // Creator leaves -> delete room
        await deleteDoc(doc(db, "undercoverGames", roomId));
        setRoom(null);
      } else {
        // guest leaves
        const updatedPlayers = room.players.filter(p => p.id !== sessionPlayerId);
        await updateDoc(doc(db, "undercoverGames", roomId), {
          players: updatedPlayers,
          chatMessages: [
            ...room.chatMessages,
            {
              id: `leave_${sessionPlayerId}_${Date.now()}`,
              senderId: "system",
              senderName: "DÉPART",
              senderAvatar: "",
              text: `💤 ${room.players.find(p => p.id === sessionPlayerId)?.name || "Un joueur"} a quitté la table de jeu.`,
              createdAt: Date.now()
            }
          ]
        });
        setRoom(null);
      }
    } catch (err) {
      console.warn("Error leaving room:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Start game layout (Host trigger)
  const handleStartGameMatch = async () => {
    if (!room) return;
    const pCount = room.players.length;
    if (pCount < 3) {
      setErrorString("Il vous faut au moins 3 joueurs réels pour démarrer la mission d'infiltration ! En attendant vos amis, vous pouvez tester en ouvrant une deuxième fenêtre.");
      return;
    }

    setIsLoading(true);
    setErrorString(null);

    // Pick pairing
    const selectedPair = FAMOUS_UNDERCOVER_PAIRS[Math.floor(Math.random() * FAMOUS_UNDERCOVER_PAIRS.length)];
    const swap = Math.random() < 0.5;
    const pair = {
      theme: selectedPair.theme,
      citizen: swap ? selectedPair.imposter : selectedPair.citizen,
      imposter: swap ? selectedPair.citizen : selectedPair.imposter,
      citizenDesc: swap ? selectedPair.imposterDesc : selectedPair.citizenDesc,
      imposterDesc: swap ? selectedPair.citizenDesc : selectedPair.imposterDesc,
    };

    // Role Distribution Strategy
    let roles: ("Citoyen" | "Imposteur" | "Mister White")[] = [];
    if (pCount === 3) {
      roles = ["Citoyen", "Citoyen", "Imposteur"];
    } else if (pCount === 4) {
      roles = ["Citoyen", "Citoyen", "Citoyen", "Imposteur"];
    } else if (pCount === 5) {
      roles = ["Citoyen", "Citoyen", "Citoyen", "Imposteur", "Mister White"];
    } else if (pCount === 6) {
      roles = ["Citoyen", "Citoyen", "Citoyen", "Citoyen", "Imposteur", "Mister White"];
    } else if (pCount === 7) {
      roles = ["Citoyen", "Citoyen", "Citoyen", "Citoyen", "Citoyen", "Imposteur", "Mister White"];
    } else {
      // 8 players
      roles = ["Citoyen", "Citoyen", "Citoyen", "Citoyen", "Citoyen", "Imposteur", "Imposteur", "Mister White"];
    }

    // Shrink and Shuffle Roles
    roles = roles.slice(0, pCount).sort(() => Math.random() - 0.5);

    // Assign roles to real connected players while preserving their score
    const configuredPlayers = room.players.map((p, idx) => {
      const assignedRole = roles[idx];
      let assignedCharacter = pair.citizen;
      if (assignedRole === "Imposteur") assignedCharacter = pair.imposter;
      if (assignedRole === "Mister White") assignedCharacter = "Mister White";

      return {
        ...p,
        role: assignedRole,
        character: assignedCharacter,
        isReady: false,
        isEliminated: false,
        votedFor: "",
        score: p.score ?? 0
      };
    });

    const speakingOrder = [...configuredPlayers].sort(() => Math.random() - 0.5).map(p => p.id);

    let mjIntro = "";
    if (room.gameMaster === "Vegapunk") {
      mjIntro = `[Dr. Vegapunk] : Capteurs activés ! J'ai distribué les rôles pour faire face à cette infiltration. Révélez vos cartes en toute discrétion (Round ${room.currentRound || 1} / ${roomTotalRoundsInput || 3}).`;
    } else {
      mjIntro = `[Morgans WEJ] : BIG NEWS ! Des agents secrets infiltrés naviguent parmi nous (Round ${room.currentRound || 1} / ${roomTotalRoundsInput || 3}) ! Qui est l'intrus ? Révélez vos cartes en toute discrétion !`;
    }

    try {
      await updateDoc(doc(db, "undercoverGames", room.id), {
        status: "reveal",
        players: configuredPlayers,
        theme: pair.theme,
        citizen: pair.citizen,
        imposter: pair.imposter,
        citizenDesc: pair.citizenDesc,
        imposterDesc: pair.imposterDesc,
        totalRounds: roomTotalRoundsInput || 3,
        currentRound: 1,
        speakingOrder: speakingOrder,
        chatMessages: [
          ...room.chatMessages,
          {
            id: `start_${Date.now()}`,
            senderId: "system",
            senderName: "GRAND LINE",
            senderAvatar: "",
            text: mjIntro,
            createdAt: Date.now()
          }
        ]
      });
    } catch (err) {
      console.error(err);
      setErrorString("Échec du lancement de la partie sur la base de données.");
    } finally {
      setIsLoading(false);
    }
  };

  // Player checks role and clicks ready
  const handleMarkSelfAsReady = async () => {
    if (!room) return;
    const updatedPlayers = room.players.map(p => {
      if (p.id === sessionPlayerId) {
        return { ...p, isReady: true };
      }
      return p;
    });

    // Check if everyone is ready to jump into discussion
    const everyoneReady = updatedPlayers.every(p => p.isReady);
    const nextStatus = everyoneReady ? "discussion" : "reveal";

    let chatAppend: ChatMessage[] = [];
    if (everyoneReady) {
      const activeName = updatedPlayers.find(p => p.id === sessionPlayerId)?.name || "Pirate";
      let textLine = "";
      if (room.gameMaster === "Vegapunk") {
        textLine = `⚙️ Tous les scientifiques sont parés ! Lancement des communications. Débâtez pour démasquer l'intrus.`;
      } else {
        textLine = `📢 FLASH INFO ! L'équipage commence les accusations ! Débâtez d'urgence pour démasquer l'imposteur.`;
      }
      chatAppend = [
        {
          id: `ready_${Date.now()}`,
          senderId: "system",
          senderName: "SYSTEM",
          senderAvatar: "",
          text: `🔍 ${activeName} est paré à investiguer !`,
          createdAt: Date.now()
        },
        {
          id: `debate_${Date.now()}`,
          senderId: "system",
          senderName: room.gameMaster.toUpperCase(),
          senderAvatar: "",
          text: textLine,
          createdAt: Date.now()
        }
      ];
    } else {
      chatAppend = [
        {
          id: `ready_${sessionPlayerId}_${Date.now()}`,
          senderId: "system",
          senderName: "GRAND LINE",
          senderAvatar: "",
          text: `👍 ${room.players.find(p => p.id === sessionPlayerId)?.name} a pris connaissance de son rôle secret.`,
          createdAt: Date.now()
        }
      ];
    }

    try {
      await updateDoc(doc(db, "undercoverGames", room.id), {
        players: updatedPlayers,
        status: nextStatus,
        chatMessages: [...room.chatMessages, ...chatAppend]
      });
      setIsRevealOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Post chat message in discussion
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !room) return;

    const self = room.players.find(p => p.id === sessionPlayerId);
    if (!self || self.isEliminated) return;

    const newMsg: ChatMessage = {
      id: `chat_${sessionPlayerId}_${Date.now()}`,
      senderId: sessionPlayerId,
      senderName: self.name,
      senderAvatar: self.avatar,
      text: chatInput.trim(),
      createdAt: Date.now()
    };

    setChatInput("");

    try {
      await updateDoc(doc(db, "undercoverGames", room.id), {
        chatMessages: [...room.chatMessages, newMsg]
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Launch voting stage (Host only)
  const handleLaunchVoting = async () => {
    if (!room) return;
    
    // Reset all votes for clean voting
    const resetPlayers = room.players.map(p => ({
      ...p,
      votedFor: ""
    }));

    try {
      await updateDoc(doc(db, "undercoverGames", room.id), {
        status: "voting",
        players: resetPlayers,
        chatMessages: [
          ...room.chatMessages,
          {
            id: `voting_start_${Date.now()}`,
            senderId: "system",
            senderName: room.gameMaster.toUpperCase(),
            senderAvatar: "",
            text: `🗳️ L'accusation publique commence ! Veuillez voter confidentiellement pour la cible de votre choix !`,
            createdAt: Date.now()
          }
        ]
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Submit my vote against another player
  const handleSubmitVoteAgainst = async (targetId: string) => {
    if (!room) return;
    
    const updatedPlayers = room.players.map(p => {
      if (p.id === sessionPlayerId) {
        return { ...p, votedFor: targetId };
      }
      return p;
    });

    // Check if everyone (who is not eliminated) has voted
    const activePlayers = updatedPlayers.filter(p => !p.isEliminated);
    const everyoneVoted = activePlayers.every(p => p.votedFor !== "");

    if (everyoneVoted) {
      // Calculate tallies
      const tallies: Record<string, number> = {};
      activePlayers.forEach(p => {
        tallies[p.votedFor] = (tallies[p.votedFor] || 0) + 1;
      });

      // Find highest tally
      let maxVotes = -1;
      let votedOutId = "";

      activePlayers.forEach(p => {
        const votes = tallies[p.id] || 0;
        if (votes > maxVotes) {
          maxVotes = votes;
          votedOutId = p.id;
        }
      });

      const eliminatedP = updatedPlayers.find(p => p.id === votedOutId);
      if (!eliminatedP) return;

      // Mark as eliminated
      const nextPlayers = updatedPlayers.map(p => {
        if (p.id === votedOutId) {
          return { ...p, isEliminated: true };
        }
        return p;
      });

      let nextStatus: RoomData["status"] = "discussion";
      let winMsg = "";
      let logsAdded: ChatMessage[] = [
        {
          id: `voted_${votedOutId}_${Date.now()}`,
          senderId: "system",
          senderName: room.gameMaster.toUpperCase(),
          senderAvatar: "",
          text: `⛓️ Verdict ! L'équipage a voté massivement contre ${eliminatedP.name} (qui était : ${eliminatedP.role}) !`,
          createdAt: Date.now()
        }
      ];

      // If Mister White is voted out, they get a chance to guess
      if (eliminatedP.role === "Mister White") {
        nextStatus = "mister_white_guess";
        logsAdded.push({
          id: `mr_white_guess_info_${Date.now()}`,
          senderId: "system",
          senderName: "SYSTEM",
          senderAvatar: "",
          text: `⚠️ Alerte Mister White ! S'il devine le personnage secret des citoyens (${room.citizen}), il l'emporte instantanément !`,
          createdAt: Date.now()
        });
      } else {
        // Run victory requirements
        const checkRemaining = nextPlayers.filter(p => !p.isEliminated);
        const aliveCitizens = checkRemaining.filter(p => p.role === "Citoyen");
        const aliveUndercovers = checkRemaining.filter(p => p.role === "Imposteur" || p.role === "Mister White");

        if (aliveUndercovers.length === 0) {
          nextStatus = "end";
          winMsg = "Les CITOYENS remportent la victoire avec brio ! L'infiltration a été neutralisée.";
          logsAdded.push({
            id: `end_citizens_${Date.now()}`,
            senderId: "system",
            senderName: room.gameMaster.toUpperCase(),
            senderAvatar: "",
            text: `🏆 VICTOIRE DES CITOYENS ! L'imposteur a été jeté aux requins de Grand Line !`,
            createdAt: Date.now()
          });
        } else if (aliveCitizens.length <= aliveUndercovers.length) {
          nextStatus = "end";
          winMsg = "L'IMPOSTEUR triomphe ! La discorde s'est emparée du pouvoir.";
          logsAdded.push({
            id: `end_impostors_${Date.now()}`,
            senderId: "system",
            senderName: room.gameMaster.toUpperCase(),
            senderAvatar: "",
            text: `🔥 VICTOIRE DE L'IMPOSTEUR ! Le contrôle du navire a été saboté !`,
            createdAt: Date.now()
          });
        } else {
          // Keep debating
          nextStatus = "discussion";
          logsAdded.push({
            id: `continue_${Date.now()}`,
            senderId: "system",
            senderName: room.gameMaster.toUpperCase(),
            senderAvatar: "",
            text: `🔍 Un suspect a été banni, mais d'autres comploteurs rôdent peut-être. Le débat continue !`,
            createdAt: Date.now()
          });
        }
      }

      // Update round score if end
      let scoreUpdate = { ...room.roundScore };
      let scoredPlayers = [...nextPlayers];
      if (nextStatus === "end") {
        if (winMsg.includes("CITOYENS")) {
          scoreUpdate.citizens = (scoreUpdate.citizens || 0) + 1;
          scoredPlayers = nextPlayers.map(p => {
            let added = 0;
            if (p.role === "Citoyen") {
              added += 3;
              if (!p.isEliminated) added += 1;
            }
            return { ...p, score: (p.score ?? 0) + added };
          });
        } else {
          scoreUpdate.imposters = (scoreUpdate.imposters || 0) + 1;
          scoredPlayers = nextPlayers.map(p => {
            let added = 0;
            if (p.role === "Imposteur" || p.role === "Mister White") {
              added += 5;
              if (!p.isEliminated) added += 1;
            }
            return { ...p, score: (p.score ?? 0) + added };
          });
        }
      }

      try {
        await updateDoc(doc(db, "undercoverGames", room.id), {
          players: scoredPlayers,
          status: nextStatus,
          winnerMessage: winMsg,
          chatMessages: [...room.chatMessages, ...logsAdded],
          eliminatedPlayer: eliminatedP ?? null,
          roundScore: scoreUpdate
        });
      } catch (err) {
        console.error(err);
      }

    } else {
      // Just post player's vote
      try {
        await updateDoc(doc(db, "undercoverGames", room.id), {
          players: updatedPlayers
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Mister White guesses the word
  const handleGuessSubmit = async (guessWord: string) => {
    if (!room || !guessWord.trim()) return;

    setIsLoading(true);
    setErrorString(null);

    const matchAnswer = room.citizen.toLowerCase().trim();
    const cleanGuess = guessWord.toLowerCase().trim();

    // Flexible string check
    const isCorrect = cleanGuess.includes(matchAnswer) || matchAnswer.includes(cleanGuess) ||
      (cleanGuess.length >= 4 && matchAnswer.includes(cleanGuess));

    let winMsg = "";
    let logsAdded: ChatMessage[] = [];
    let scoreUpdate = { ...room.roundScore };
    let scoredPlayers = [...room.players];

    if (isCorrect) {
      winMsg = `INCROYABLE ! Mister White (${room.eliminatedPlayer?.name}) a deviné juste ! Le personnage secret était bien "${room.citizen}". Victoire de Mister White !`;
      scoreUpdate.imposters = (scoreUpdate.imposters || 0) + 1;
      scoredPlayers = room.players.map(p => {
        let added = 0;
        if (p.role === "Mister White") {
          added += 6;
        }
        return { ...p, score: (p.score ?? 0) + added };
      });
      logsAdded = [
        {
          id: `guess_correct_${Date.now()}`,
          senderId: "system",
          senderName: room.gameMaster.toUpperCase(),
          senderAvatar: "",
          text: `🔥 MISTER WHITE A GAGNÉ ! Il a estimé avec exactitude le rôle secret : ${room.citizen} !`,
          createdAt: Date.now()
        }
      ];
    } else {
      winMsg = `ÉCHEC ! Mister White s'est trompé. Son estimation était "${guessWord}", mais le personnage secret des citoyens était : "${room.citizen}". Les Citoyens l'emportent !`;
      scoreUpdate.citizens = (scoreUpdate.citizens || 0) + 1;
      scoredPlayers = room.players.map(p => {
        let added = 0;
        if (p.role === "Citoyen") {
          added += 3;
          if (!p.isEliminated) added += 1;
        }
        return { ...p, score: (p.score ?? 0) + added };
      });
      logsAdded = [
        {
          id: `guess_fail_${Date.now()}`,
          senderId: "system",
          senderName: room.gameMaster.toUpperCase(),
          senderAvatar: "",
          text: `🏆 VICTOIRE DES CITOYENS ! Mister White s'est trompé dans sa réponse (${guessWord}).`,
          createdAt: Date.now()
        }
      ];
    }

    try {
      await updateDoc(doc(db, "undercoverGames", room.id), {
        status: "end",
        players: scoredPlayers,
        winnerMessage: winMsg,
        misterWhiteGuess: guessWord,
        roundScore: scoreUpdate,
        chatMessages: [...room.chatMessages, ...logsAdded]
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Replay again (Lobby restart)
  const handlePlayAgain = async () => {
    if (!room) return;

    // Preserve players list but reset states, and reset score
    const resetPlayers = room.players.map(p => ({
      ...p,
      role: "" as const,
      character: "",
      isReady: false,
      isEliminated: false,
      votedFor: "",
      score: 0
    }));

    try {
      await updateDoc(doc(db, "undercoverGames", room.id), {
        status: "lobby",
        players: resetPlayers,
        winnerMessage: "",
        eliminatedPlayer: null,
        misterWhiteGuess: "",
        currentRound: 1,
        chatMessages: [
          ...room.chatMessages,
          {
            id: `replay_${Date.now()}`,
            senderId: "system",
            senderName: "SYSTEM",
            senderAvatar: "",
            text: `🔄 Une nouvelle partie à zéro a été initiée par le capitaine de salon. Invitez plus d'amis et préparez-vous !`,
            createdAt: Date.now()
          }
        ]
      });
      setBountyAwardedForRoomId("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleNextOnlineRound = async () => {
    if (!room) return;
    setIsLoading(true);
    setErrorString(null);

    const nextRound = (room.currentRound || 1) + 1;

    // Pick pairing
    const selectedPair = FAMOUS_UNDERCOVER_PAIRS[Math.floor(Math.random() * FAMOUS_UNDERCOVER_PAIRS.length)];
    const swap = Math.random() < 0.5;
    const pair = {
      theme: selectedPair.theme,
      citizen: swap ? selectedPair.imposter : selectedPair.citizen,
      imposter: swap ? selectedPair.citizen : selectedPair.imposter,
      citizenDesc: swap ? selectedPair.imposterDesc : selectedPair.citizenDesc,
      imposterDesc: swap ? selectedPair.citizenDesc : selectedPair.imposterDesc,
    };
    const pCount = room.players.length;

    // Role Distribution Strategy
    let roles: ("Citoyen" | "Imposteur" | "Mister White")[] = [];
    if (pCount === 3) {
      roles = ["Citoyen", "Citoyen", "Imposteur"];
    } else if (pCount === 4) {
      roles = ["Citoyen", "Citoyen", "Citoyen", "Imposteur"];
    } else if (pCount === 5) {
      roles = ["Citoyen", "Citoyen", "Citoyen", "Imposteur", "Mister White"];
    } else if (pCount === 6) {
      roles = ["Citoyen", "Citoyen", "Citoyen", "Citoyen", "Imposteur", "Mister White"];
    } else if (pCount === 7) {
      roles = ["Citoyen", "Citoyen", "Citoyen", "Citoyen", "Citoyen", "Imposteur", "Mister White"];
    } else {
      roles = ["Citoyen", "Citoyen", "Citoyen", "Citoyen", "Citoyen", "Imposteur", "Imposteur", "Mister White"];
    }

    // Shrink and Shuffle Roles
    roles = roles.slice(0, pCount).sort(() => Math.random() - 0.5);

    // Build the players preserving their scores
    const configuredPlayers = room.players.map((p, idx) => {
      const assignedRole = roles[idx];
      let assignedCharacter = pair.citizen;
      if (assignedRole === "Imposteur") assignedCharacter = pair.imposter;
      if (assignedRole === "Mister White") assignedCharacter = "Mister White";

      return {
        ...p,
        role: assignedRole,
        character: assignedCharacter,
        isReady: false,
        isEliminated: false,
        votedFor: "",
        score: p.score ?? 0
      };
    });

    // Random turn/speaking order
    const speakingOrder = [...configuredPlayers].sort(() => Math.random() - 0.5).map(p => p.id);

    let mjIntro = `[${room.gameMaster}] : Manche ${nextRound} / ${room.totalRounds || 3} activée ! Les rôles ont été redistribués.`;

    try {
      await updateDoc(doc(db, "undercoverGames", room.id), {
        status: "reveal",
        players: configuredPlayers,
        theme: pair.theme,
        citizen: pair.citizen,
        imposter: pair.imposter,
        citizenDesc: pair.citizenDesc,
        imposterDesc: pair.imposterDesc,
        currentRound: nextRound,
        speakingOrder: speakingOrder,
        winnerMessage: "",
        eliminatedPlayer: null,
        misterWhiteGuess: "",
        chatMessages: [
          ...room.chatMessages,
          {
            id: `start_round_${nextRound}_${Date.now()}`,
            senderId: "system",
            senderName: "MJ",
            senderAvatar: "",
            text: mjIntro,
            createdAt: Date.now()
          }
        ]
      });
    } catch (err) {
      console.error(err);
      setErrorString("Échec du lancement de la manche.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div id="undercover-game-wrapper" className="bg-[#0B0D1B] border border-violet-950 rounded-2xl p-4 md:p-6 shadow-2xl overflow-hidden min-h-[600px] flex flex-col justify-between">
      
      {/* HEADER SECTION */}
      <div className="bg-[#1A1A1A] border-2 border-black p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-3 text-white">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse shrink-0" />
            <h2 className="text-lg md:text-xl font-heading font-black text-white uppercase tracking-wider">
              Mission Undercover
            </h2>
            <span className="bg-rose-900/45 text-rose-400 text-[9px] px-2 py-0.5 rounded-full font-mono border border-rose-500/20 uppercase tracking-widest font-extrabold shrink-0">
              {gameMode === "local" ? "👥 Passe-Téléphone Local" : gameMode === "online" ? "📡 En Ligne (Salon)" : "Infiltration"}
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 font-sans">
            {gameMode === "local" 
              ? "Prêtez ou passez-vous le téléphone à tour de rôle ! Zéro bots, 100% de déduction orale."
              : "Infiltrez vos camarades en ligne. Pas de bots, uniquement de la déduction verbale et psychologique !"}
          </p>
        </div>

        {/* Change Mode selector button if not actively inside a game match */}
        {gameMode !== null && !room && localStatus === "lobby" && (
          <button
            onClick={() => {
              setGameMode(null);
              setErrorString(null);
              setSuccessString(null);
            }}
            className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-[10.5px] px-3 py-1.5 rounded-lg border border-white/5 duration-150 cursor-pointer uppercase flex items-center gap-1"
          >
            <span>⬅️ Changer de Mode</span>
          </button>
        )}

        {/* Online Scoring board */}
        {gameMode === "online" && room && (
          <div className="flex items-center gap-3 bg-slate-900/60 p-2 md:p-2.5 rounded-xl border border-white/5 font-mono text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Trophy className="w-3.5 h-3.5 shrink-0" />
              <span>Citoyens: {room.roundScore?.citizens || 0}</span>
            </div>
            <div className="text-white/20">|</div>
            <div className="flex items-center gap-1.5 text-rose-400 font-bold">
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>Imposteurs: {room.roundScore?.imposters || 0}</span>
            </div>
            
            <button 
              onClick={handleLeaveRoom}
              className="ml-2 bg-slate-800 hover:bg-rose-900/45 text-slate-400 hover:text-rose-400 px-2 py-1 rounded text-[10px] duration-150 flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Quitter</span>
            </button>
          </div>
        )}

        {/* Local Scoring board */}
        {gameMode === "local" && localStatus !== "lobby" && (
          <div className="flex items-center gap-3 bg-slate-900/60 p-2 md:p-2.5 rounded-xl border border-white/5 font-mono text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Trophy className="w-3.5 h-3.5 shrink-0" />
              <span>Citoyens: {localRoundScore.citizens}</span>
            </div>
            <div className="text-white/20">|</div>
            <div className="flex items-center gap-1.5 text-rose-400 font-bold">
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>Imposteurs: {localRoundScore.imposters}</span>
            </div>
            
            <button 
              onClick={() => {
                setLocalStatus("lobby");
                setGameMode(null);
                setErrorString(null);
                setSuccessString(null);
              }}
              className="ml-2 bg-slate-800 hover:bg-rose-900/45 text-slate-400 hover:text-rose-400 px-2 py-1 rounded text-[10px] duration-150 flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Quitter</span>
            </button>
          </div>
        )}
      </div>

      {/* RENDER VIEWS ACCORDING TO STATE */}
      <div className="flex-1 flex flex-col justify-center">

        {/* FEEDBACK STATUS BAR */}
        {errorString && (
          <div className="mb-4 bg-rose-950/40 border border-rose-500/30 text-rose-200 p-3.5 rounded-xl text-xs flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorString}</span>
            </div>
            <button onClick={() => setErrorString(null)} className="text-rose-400 hover:text-white font-mono font-bold">✕</button>
          </div>
        )}

        {successString && (
          <div className="mb-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 p-3.5 rounded-xl text-xs flex items-center gap-2 justify-between animate-bounce">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successString}</span>
            </div>
            <button onClick={() => setSuccessString(null)} className="text-emerald-400 hover:text-white font-mono font-bold">✕</button>
          </div>
        )}

        {gameMode === null ? (
          <div className="max-w-xl mx-auto w-full py-8 space-y-6 text-center">
            <div className="relative w-20 h-20 mx-auto bg-violet-950/40 rounded-full flex items-center justify-center border border-violet-500/20 mb-2">
              <ShieldAlert className="w-10 h-10 text-rose-500 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="font-heading font-black text-[#F8FAFC] text-2xl uppercase tracking-wider">
                Choisissez Votre Mode de Jeu
              </h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                Infiltrez, mentez, bluffez et débusquez l'intrus parmi l'équipage.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              {/* Mode Local Button */}
              <button
                onClick={() => setGameMode("local")}
                className="bg-slate-950/60 p-6 rounded-2xl border border-slate-900 hover:border-violet-500/50 flex flex-col items-center justify-between text-center space-y-4 group transition duration-200 cursor-pointer text-left"
              >
                <div className="space-y-2 flex flex-col items-center">
                  <div className="w-12 h-12 bg-rose-950/40 rounded-xl flex items-center justify-center border border-rose-500/20 text-rose-400 group-hover:scale-110 transition duration-150">
                    <User className="w-6 h-6" />
                  </div>
                  <h4 className="font-heading font-extrabold text-[#F8FAFC] text-sm group-hover:text-rose-400 uppercase tracking-wider text-center mt-2">
                    Mode Local (Passe-téléphone)
                  </h4>
                  <p className="text-xs text-slate-400 text-center">
                    Idéal en soirée. Jouez tous sur le même appareil sans connexion requise. Passez-vous l'appareil un par un.
                  </p>
                </div>
                <span className="bg-rose-950/45 text-rose-400 text-[9.5px] px-3 py-1 rounded font-mono border border-rose-500/10 uppercase font-black">
                  Pas de WiFi • 3 - 8 Joueurs
                </span>
              </button>

              {/* Mode En Ligne Button */}
              <button
                onClick={() => setGameMode("online")}
                className="bg-slate-950/60 p-6 rounded-2xl border border-slate-900 hover:border-violet-500/50 flex flex-col items-center justify-between text-center space-y-4 group transition duration-200 cursor-pointer text-left"
              >
                <div className="space-y-2 flex flex-col items-center">
                  <div className="w-12 h-12 bg-violet-950/40 rounded-xl flex items-center justify-center border border-violet-500/20 text-violet-400 group-hover:scale-110 transition duration-150">
                    <Users className="w-6 h-6" />
                  </div>
                  <h4 className="font-heading font-extrabold text-[#F8FAFC] text-sm group-hover:text-violet-400 uppercase tracking-wider text-center mt-2">
                    Mode En Ligne (Salon)
                  </h4>
                  <p className="text-xs text-slate-400 text-center">
                    Chacun joue sur son propre appareil en temps réel avec un code de salon secret d'équipage.
                  </p>
                </div>
                <span className="bg-violet-950/45 text-violet-400 text-[9.5px] px-3 py-1 rounded font-mono border border-violet-500/10 uppercase font-black">
                  Multijoueur • Temps Réel
                </span>
              </button>
            </div>
          </div>
        ) : gameMode === "local" ? (
          /* LOCAL GAMEPLAY ROOT CONTAINER */
          <div className="space-y-6 w-full">

            {/* A. LOCAL LOBBY (Setup names and player count) */}
            {localStatus === "lobby" && (
              <div className="max-w-xl mx-auto w-full space-y-5 py-4">
                <div className="bg-[#101223] p-5 rounded-2xl border border-violet-950 space-y-4">
                  <span className="text-xs text-violet-400 font-mono uppercase block font-bold">
                    👥 Configuration du Salon Local :
                  </span>

                  {/* Player Count Selector */}
                  <div className="space-y-2">
                    <label className="text-[11px] text-slate-400 font-bold block">
                      Nombre de joueurs (3 à 8) : {localPlayerCount}
                    </label>
                    <div className="flex gap-1.5 flex-wrap">
                      {[3, 4, 5, 6, 7, 8].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            setLocalPlayerCount(num);
                            const defaultNames = ["Luffy", "Zoro", "Nami", "Usopp", "Sanji", "Chopper", "Robin", "Franky"];
                            const newNames = [...localPlayerNames];
                            while (newNames.length < num) {
                              newNames.push(defaultNames[newNames.length % defaultNames.length]);
                            }
                            setLocalPlayerNames(newNames.slice(0, num));
                          }}
                          className={`flex-1 min-w-[55px] py-1.5 px-1.5 rounded font-mono text-xs uppercase font-extrabold border transition cursor-pointer ${
                            localPlayerCount === num 
                              ? "bg-rose-950 border-rose-500 text-white" 
                              : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                          }`}
                        >
                          {num} P.
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Player Names Array Inputs */}
                  <div className="space-y-2 pt-2">
                    <label className="text-[11px] text-slate-400 font-mono uppercase block">
                      📝 Noms des moussaillons à bord :
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Array.from({ length: localPlayerCount }).map((_, idx) => (
                        <div key={idx} className="flex gap-2 items-center bg-slate-950/50 p-2 rounded-lg border border-slate-900">
                          <span className="text-[10px] font-mono text-slate-500 w-5">#{idx + 1}</span>
                          <input
                            type="text"
                            value={localPlayerNames[idx] || ""}
                            onChange={(e) => {
                              const list = [...localPlayerNames];
                              list[idx] = e.target.value;
                              setLocalPlayerNames(list);
                            }}
                            placeholder={`Joueur ${idx + 1}`}
                            className="bg-transparent text-xs text-white border-none focus:outline-none w-full"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Round Selector */}
                  <div className="space-y-2 pt-2">
                    <label className="text-[11px] text-slate-400 font-bold block">
                      Nombre de manches (Rounds) : {localTotalRounds}
                    </label>
                    <div className="flex gap-1.5 flex-wrap">
                      {[1, 2, 3, 5, 8, 10].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setLocalTotalRounds(num)}
                          className={`flex-1 min-w-[50px] py-1.5 px-1 rounded font-mono text-xs uppercase font-extrabold border transition cursor-pointer ${
                            localTotalRounds === num 
                              ? "bg-violet-950 border-violet-500 text-white" 
                              : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                          }`}
                        >
                          {num} R.
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Button to start match */}
                  <button
                    onClick={handleStartLocalGame}
                    className="w-full bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-heading font-extrabold text-xs tracking-widest py-3.5 rounded-xl uppercase transition shadow-[0_0_15px_rgba(225,29,72,0.15)] flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                  >
                    <Play className="w-4 h-4" />
                    <span>Lancer la distribution locale</span>
                  </button>
                </div>
              </div>
            )}

            {/* B. LOCAL REVEAL CARD STATE (Pass the phone) */}
            {localStatus === "reveal" && (
              <div className="max-w-md mx-auto w-full py-6 text-center space-y-6">
                <span className="text-xs font-mono text-violet-400 uppercase tracking-widest block font-bold animate-pulse">
                  📱 MODE UNIQUE : PASSE-TÉLÉPHONE ({activeRevealIndex + 1} / {localPlayers.length})
                </span>
                
                <div className="bg-slate-950/80 rounded-2xl p-6 border border-white/5 space-y-5">
                  <div className="relative w-14 h-14 mx-auto bg-rose-950/45 rounded-full flex items-center justify-center border border-rose-500/20">
                    <User className="w-7 h-7 text-rose-400" />
                  </div>

                  <div className="space-y-1">
                    <p className="font-heading font-black text-emerald-400 text-lg uppercase tracking-wider">
                      Tour de : {localPlayers[activeRevealIndex]?.name}
                    </p>
                    <p className="text-slate-400 text-xs px-2 font-sans leading-relaxed">
                      Passez l'appareil à <span className="text-white font-bold">{localPlayers[activeRevealIndex]?.name}</span>. 
                      Cachez l'écran aux autres, puis cliquez ci-dessous pour révéler votre rôle.
                    </p>
                  </div>

                  {!isLocalRoleVisible ? (
                    <button
                      onClick={() => setIsLocalRoleVisible(true)}
                      className="w-full bg-violet-900/40 border border-violet-500/30 hover:bg-violet-900/60 text-white rounded-xl py-3.5 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-violet-400" />
                      <span>Révéler ma carte confidentielle</span>
                    </button>
                  ) : (
                    <div className="space-y-4 p-4 bg-slate-900/60 rounded-xl border border-violet-500/30 text-center">
                      <div className="space-y-3">
                        <span className="text-[10px] uppercase font-mono tracking-widest text-[#F1C40F] block">Rôle assigné :</span>
                        
                        {/* Character Image Display */}
                        {(() => {
                          const playerRole = localPlayers[activeRevealIndex]?.role;
                          const characterName = playerRole === "Mister White" ? "Mister White" : localPlayers[activeRevealIndex]?.character || "";
                          const characterImg = getCharacterImage(characterName);
                          return (
                            <div className="relative w-28 h-28 mx-auto rounded-xl overflow-hidden border-2 border-amber-500/40 bg-slate-950 flex items-center justify-center shadow-lg">
                              {playerRole === "Mister White" ? (
                                <div className="text-center p-2">
                                  <HelpCircle className="w-12 h-12 mx-auto text-rose-500 animate-pulse" />
                                </div>
                              ) : (
                                <img 
                                  src={characterImg} 
                                  alt={characterName} 
                                  className="w-full h-full object-cover object-top"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    e.currentTarget.src = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop";
                                  }}
                                />
                              )}
                            </div>
                          );
                        })()}

                        {localPlayers[activeRevealIndex]?.role === "Mister White" ? (
                          <p className="font-heading font-black text-rose-500 text-xl uppercase tracking-wider">MISTER WHITE</p>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-[10.5px] font-mono text-slate-400">Votre personnage :</p>
                            <p className="font-heading font-black text-emerald-400 text-xl uppercase tracking-wider">
                              {localPlayers[activeRevealIndex]?.character}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-300 leading-relaxed px-1 font-sans">
                        {localPlayers[activeRevealIndex]?.role === "Mister White" ? (
                          <p>Vous êtes Mister White ! Vous n'avez pas de personnage secret. Écoutez scrupuleusement les descriptions de vos camarades pour deviner leur personnage.</p>
                        ) : (
                          <p>Vous possédez une carte de personnage secret ! Décrivez-le de façon subtile et prudente sans jamais prononcer son nom pour déceler les imposteurs.</p>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setIsLocalRoleVisible(false);
                          if (activeRevealIndex + 1 < localPlayers.length) {
                            setActiveRevealIndex(prev => prev + 1);
                          } else {
                            setLocalStatus("discussion");
                          }
                        }}
                        className="w-full bg-[#1A1C3C] border border-[#F1C40F]/15 hover:border-[#F1C40F]/30 text-white rounded-lg py-2.5 text-xs font-mono font-extrabold cursor-pointer"
                      >
                        {activeRevealIndex + 1 < localPlayers.length 
                          ? "🤫 J'ai mémorisé mon rôle (Masquer)" 
                          : "🚀 Entrer dans le débat d'équipage !"}
                      </button>
                    </div>
                  )}

                  {/* Ready progress slots */}
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-[10px] text-slate-500 font-mono block uppercase mb-1">Confirmation d'attribution :</span>
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {localPlayers.map((p, pIdx) => (
                        <span key={p.id} className={`text-[10px] px-2 py-1 rounded-md border flex items-center gap-1 ${
                          pIdx < activeRevealIndex || (pIdx === activeRevealIndex && isLocalRoleVisible)
                            ? "bg-emerald-950/25 text-emerald-400 border-emerald-500/20 font-bold" 
                            : "bg-slate-900 text-slate-500 border-slate-800"
                        }`}>
                          {pIdx < activeRevealIndex ? "✔" : pIdx === activeRevealIndex && isLocalRoleVisible ? "👀" : "⏳"} {p.name}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* C. LOCAL DISCUSSION / VOTING CORE SCREEN */}
            {(localStatus === "discussion" || localStatus === "voting") && (
              <div className="max-w-2xl mx-auto w-full py-2 space-y-4">
                
                {/* Board header */}
                <div className="bg-[#101223] rounded-2xl p-5 border border-violet-950 text-center space-y-3">
                  <div className="flex items-center justify-center gap-1.5 border-b border-white/5 pb-2">
                    <Target className="w-4 h-4 text-violet-400 shrink-0" />
                    <span className="text-xs uppercase font-mono tracking-widest text-[#F1C40F] block font-extrabold">
                      INSTRUCTIONS DE MISSION
                    </span>
                  </div>

                  <div className="text-xs text-slate-100 leading-relaxed font-sans max-w-lg mx-auto bg-slate-950/50 p-4 rounded-xl border border-white/5 space-y-2">
                    {localStatus === "discussion" ? (
                      <p>
                        🗣️ <span className="font-extrabold text-[#F1C40F]">Débâtez librement de vive voix autour de la table !</span> Donner une courte description de votre mot secret sans l'énoncer directement. Une fois prêts, ouvrez les votes pour désigner le suspect. Spécifiez vos indices de manière subtile !
                      </p>
                    ) : (
                      <p>
                        ⚖️ <span className="font-extrabold text-rose-400">Tribunal Pirate Local !</span> Discutez et mettez-vous d'accord sur le suspect le plus louche, puis éliminez-le en un clic sur son profil.
                      </p>
                    )}
                  </div>

                  {/* Local Speaking Order */}
                  {localStatus === "discussion" && localSpeakingOrder && localSpeakingOrder.length > 0 && (
                    <div className="bg-slate-900 border border-violet-950/45 p-3.5 rounded-xl space-y-2">
                      <p className="text-[10px] uppercase font-mono text-amber-400 tracking-wider">
                        🎙️ Ordre de parole aléatoire (Manche {localCurrentRound} / {localTotalRounds}) :
                      </p>
                      <div className="flex flex-wrap gap-2 items-center justify-center">
                        {localSpeakingOrder
                          .map(pid => localPlayers.find(p => p.id === pid))
                          .filter((p): p is Player => !!p && !p.isEliminated)
                          .map((plr, idx) => (
                            <div key={plr.id} className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-white/5">
                              <span className="text-[10px] font-mono text-slate-500 font-extrabold">{idx + 1}.</span>
                              <img src={plr.avatar} alt="" className="w-4 h-4 rounded bg-slate-950 shrink-0" referrerPolicy="no-referrer" />
                              <span className="text-xs font-bold text-[#F8FAFC]">{plr.name}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center pt-2">
                    {localStatus === "discussion" ? (
                      <button
                        onClick={() => setLocalStatus("voting")}
                        className="bg-red-700 hover:bg-red-600 text-white font-heading font-black tracking-widest text-xs px-5 py-2.5 rounded-xl uppercase border border-red-500/30 cursor-pointer duration-150 animate-pulse"
                      >
                        Lancer le Tribunal d'Élimination 🗳️
                      </button>
                    ) : (
                      <button
                        onClick={() => setLocalStatus("discussion")}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] px-3 py-1.5 rounded-lg border border-white/5 cursor-pointer"
                      >
                        ⬅️ Reprendre le débat oral
                      </button>
                    )}
                  </div>
                </div>

                {/* Suspect list table */}
                <div className="bg-slate-950/80 rounded-2xl p-5 border border-white/5 space-y-4">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-widest block text-center font-bold">
                    🛡️ CONSTAT D'ÉQUIPAGE LOCAL (Vivant ou Mort)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {localPlayers.map((plr) => (
                      <div
                        key={plr.id}
                        className={`p-3.5 rounded-xl border flex justify-between items-center transition gap-2 ${
                          plr.isEliminated
                            ? "bg-rose-950/10 border-rose-950/20 opacity-40"
                            : "bg-slate-900 border-slate-800 hover:border-violet-500/30"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img src={plr.avatar} alt="" className="w-8 h-8 rounded-lg bg-slate-950" />
                          <div>
                            <p className="text-xs font-bold text-white flex items-center gap-1.5">
                              {plr.name}
                              {plr.isEliminated && <span className="text-[8px] bg-rose-950 text-rose-300 border border-rose-500/20 px-1 rounded font-mono">Banni</span>}
                            </p>
                            <p className="text-[10px] font-mono text-slate-500 uppercase">
                              {plr.isEliminated ? (
                                <span className="text-rose-400 font-bold">
                                  Banni 🦈 • Était {plr.role === "Citoyen" ? "Civil" : plr.role}
                                </span>
                              ) : (
                                "Suspect Actif 🎙️"
                              )}
                            </p>
                          </div>
                        </div>

                        {localStatus === "voting" && !plr.isEliminated && (
                          <div className="flex items-center gap-1">
                            {localConfirmEliminateId === plr.id ? (
                              <>
                                <button
                                  onClick={() => {
                                    handleLocalEliminateSubmit(plr.id);
                                    setLocalConfirmEliminateId(null);
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[9px] uppercase font-bold px-2.5 py-1.5 rounded border border-emerald-500/20 duration-150 cursor-pointer"
                                >
                                  Oui ✅
                                </button>
                                <button
                                  onClick={() => setLocalConfirmEliminateId(null)}
                                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[9px] uppercase font-bold px-2 py-1.5 rounded border border-white/5 duration-150 cursor-pointer"
                                >
                                  Non ❌
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => {
                                  setLocalConfirmEliminateId(plr.id);
                                }}
                                className="bg-red-950 hover:bg-red-900 text-red-400 font-mono text-[10px] uppercase font-bold px-3 py-1.5 rounded border border-red-500/20 duration-150 cursor-pointer"
                              >
                                Éliminer ⚔️
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            )}

            {/* D. LOCAL MISTER WHITE GUESS */}
            {localStatus === "mister_white_guess" && (
              <div className="max-w-md mx-auto w-full py-6 space-y-5">
                <span className="text-xs font-mono text-rose-400 uppercase tracking-widest block text-center font-bold animate-bounce">
                  🔮 PRÉDICTION FINALE DE MISTER WHITE
                </span>

                <div className="bg-slate-950/90 rounded-2xl p-6 border border-rose-950 space-y-4 text-center">
                  <div className="relative w-16 h-16 mx-auto bg-rose-950/20 rounded-full flex items-center justify-center border border-rose-500/20 mb-2">
                    <ShieldAlert className="w-8 h-8 text-rose-500" />
                  </div>

                  <div className="space-y-1">
                    <p className="font-heading font-black text-[#F8FAFC] text-base uppercase">Mister White démasqué !</p>
                    <p className="text-xs text-rose-200/70">
                      Mister White est : <strong>{localEliminatedPlayer?.name}</strong>.
                    </p>
                    <p className="text-xs text-slate-300 px-1 leading-relaxed font-sans">
                      L'équipage a banni Mister White ! Mais avant d'être écroué, Mister White possède un dernier coup d'éclat décisif. Passez-lui le téléphone pour qu'il saisisse sa prédiction. S'il devine le personnage secret des Citoyens, il remporte l'intégralité du match !
                    </p>
                  </div>

                  <MisterWhiteKeyboard onSubmit={handleLocalMisterWhiteGuess} isLoading={isLoading} />
                </div>
              </div>
            )}

            {/* E. LOCAL END RESULTS & REPLAY */}
            {localStatus === "end" && (
              <div className="max-w-xl mx-auto w-full py-6 space-y-6 text-center animate-fade-in">
                <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block font-bold">
                  🏆 CONCLUSION DE LA MISSION INFIDÈLE (LOCAL)
                </span>

                <div className="bg-gradient-to-b from-[#181A32] to-[#0A0B17] border border-amber-500/25 rounded-3xl p-6 md:p-8 space-y-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 to-transparent pointer-events-none" />

                  <div className="w-16 h-16 mx-auto bg-amber-950/40 border border-amber-500/20 rounded-full flex items-center justify-center">
                    <Award className="w-8 h-8 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-heading font-black text-amber-300 text-xl tracking-wider uppercase block">
                      Verdict Officiel Local
                    </h3>
                    <p className="text-xs text-slate-200 leading-relaxed font-bold font-sans max-w-md mx-auto text-balance">
                      {localWinnerMessage}
                    </p>
                  </div>

                  {/* Character allocations reveals */}
                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-white/5 text-left space-y-3">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block tracking-wider">
                      📋 Révélation Complète des Rôles Militaires de la Table :
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {localPlayers.map((plr) => {
                        const isWinner = 
                          (localWinnerMessage.includes("CITOYENS") && plr.role === "Citoyen") ||
                          (localWinnerMessage.includes("IMPOSTEUR") && plr.role === "Imposteur") ||
                          (localWinnerMessage.includes("Mister White") && plr.role === "Mister White") ||
                          (localWinnerMessage.includes("MISTER WHITE") && plr.role === "Mister White");

                        return (
                          <div 
                            key={plr.id} 
                            className={`p-3 rounded-xl border flex justify-between items-center gap-2.5 ${
                              isWinner 
                                ? "bg-emerald-950/30 border-emerald-500/20" 
                                : "bg-slate-900/40 border-slate-800"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <img src={plr.avatar} alt="" className="w-7 h-7 bg-slate-800 rounded" />
                              <div>
                                <p className="text-xs font-bold text-white flex items-center gap-1">
                                  {plr.name}
                                  {isWinner && <span className="text-[8px] bg-emerald-900 text-emerald-300 px-1 rounded">Vainqueur</span>}
                                </p>
                                <p className="text-[9.5px] font-mono text-slate-400 uppercase">
                                  {plr.role === "Citoyen" ? localCitizen : plr.role === "Imposteur" ? localImposter : "Mister White"}
                                </p>
                              </div>
                            </div>

                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                              plr.role === "Citoyen" 
                                ? "bg-cyan-950 text-cyan-400" 
                                : plr.role === "Imposteur"
                                  ? "bg-rose-950 text-rose-400"
                                  : "bg-purple-950 text-purple-400"
                            }`}>
                              {plr.role}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Leaderboard / Classement des scores */}
                  <div className="bg-slate-950/80 p-5 rounded-2xl border border-amber-500/20 text-left space-y-3">
                    <div className="flex items-center gap-1.5 border-b border-white/5 pb-2">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span className="text-[10px] uppercase font-mono text-amber-400 block tracking-wider font-extrabold">
                        🏆 Classement Général des Moussaillons (Manche {localCurrentRound} / {localTotalRounds}) :
                      </span>
                    </div>

                    <div className="space-y-2">
                      {[...localPlayers]
                        .sort((a, b) => (b.score || 0) - (a.score || 0))
                        .map((plr, index) => (
                          <div key={plr.id} className="flex justify-between items-center bg-slate-900/40 p-2.5 rounded-xl border border-white/5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-slate-500 w-5">#{index + 1}</span>
                              <img src={plr.avatar} alt="" className="w-6 h-6 rounded bg-slate-950" />
                              <span className="text-xs font-bold text-white">{plr.name}</span>
                            </div>
                            <span className="text-xs font-mono font-black text-amber-400">
                              {plr.score || 0} Pts
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {localMisterWhiteGuess && (
                    <div className="bg-slate-950/40 border border-white/5 p-3 rounded-xl font-mono text-[11px] text-slate-300 italic text-center">
                      Mister White a proposé la réponse : "{localMisterWhiteGuess}" (La réponse requise était : "{localCitizen}")
                    </div>
                  )}

                  {/* Play again / Next round buttons */}
                  {localCurrentRound < localTotalRounds ? (
                    <button
                      onClick={() => handleStartLocalRound(true)}
                      className="w-full bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-heading font-black tracking-widest text-xs py-3.5 rounded-xl uppercase transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>➡️ Passer à la Manche {localCurrentRound + 1} / {localTotalRounds}</span>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3 text-emerald-300 font-sans text-xs font-bold">
                        🏆 Partie Terminée ! Félicitations à {[...localPlayers].sort((a, b) => (b.score || 0) - (a.score || 0))[0]?.name} qui remporte le tournoi après {localTotalRounds} manches !
                      </div>
                      <button
                        onClick={() => {
                          setLocalStatus("lobby");
                          setLocalWinnerMessage("");
                          setLocalMisterWhiteGuess("");
                          setLocalCurrentRound(1);
                        }}
                        className="w-full bg-violet-700 hover:bg-violet-600 text-white font-heading font-black tracking-widest text-xs py-3.5 rounded-xl uppercase transition cursor-pointer"
                      >
                        🔄 Recommencer une nouvelle Partie
                      </button>
                    </div>
                  )}

                </div>
              </div>
            )}

          </div>
        ) : !room ? (
          <div className="max-w-xl mx-auto w-full space-y-6 py-4">
            
            {/* Concept Info Banner */}
            <div className="bg-gradient-to-r from-violet-950/40 to-indigo-950/40 border border-violet-500/15 rounded-xl p-4 flex gap-3.5 items-start">
              <Users className="w-10 h-10 text-violet-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 space-y-1">
                <p className="font-heading font-extrabold text-[#F8FAFC]">ZÉRO BOT — 100% BLUFF MUTUEL !</p>
                <p>Découvrez votre personnage secret, discutez en temps réel avec vos camarades via le salon, suspectez les anomalies tactiques et votez contre le traître. Si vous gagnez, votre prime de pirate augmente !</p>
              </div>
            </div>

            {/* Profile Setup Box */}
            <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 space-y-3">
              <span className="text-[10px] text-slate-400 font-mono block uppercase tracking-wider">Identité du Navigateur :</span>
              <div className="flex gap-3 items-center">
                <img src={clientAvatar} alt="Avatar profile" className="w-8 h-8 rounded-lg bg-slate-950 border border-white/10" />
                <div className="flex-1">
                  <input 
                    type="text" 
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Votre pseudo pirate..."
                    className="bg-slate-950 border border-slate-800 text-white text-xs px-3 py-1.5 rounded-lg w-full focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Box A : Create Salon */}
              <div id="create-salon-card" className="bg-slate-950/45 p-5 rounded-2xl border border-slate-900/80 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-violet-400">
                    <Crown className="w-4 h-4" />
                    <span className="font-heading text-xs font-black uppercase tracking-wider">Créer un Salon</span>
                  </div>
                  <p className="text-slate-400 text-xs">Devenez l'hôte de la table et distribuez les rôles en privé.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 font-mono block uppercase">Maître du Match :</label>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setGameMaster("Vegapunk")}
                      className={`flex-1 py-1 px-2 rounded font-mono text-[10px] uppercase font-bold border transition ${
                        gameMaster === "Vegapunk" 
                          ? "bg-violet-950 border-violet-500 text-white" 
                          : "bg-slate-900/40 border-slate-800 text-slate-500 hover:border-slate-700"
                      }`}
                    >
                      Vegapunk
                    </button>
                    <button
                      onClick={() => setGameMaster("Morgans")}
                      className={`flex-1 py-1 px-2 rounded font-mono text-[10px] uppercase font-bold border transition ${
                        gameMaster === "Morgans"
                          ? "bg-violet-950 border-violet-500 text-white"
                          : "bg-slate-900/40 border-slate-800 text-slate-500 hover:border-slate-700"
                      }`}
                    >
                      Morgans WEJ
                    </button>
                  </div>
                </div>

                {/* Online total rounds select */}
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 font-mono block uppercase text-left">Manches (Rounds) : {roomTotalRoundsInput}</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 5, 8].map(num => (
                      <button
                        key={num}
                        onClick={() => setRoomTotalRoundsInput(num)}
                        className={`flex-1 py-1 rounded font-mono text-[9px] uppercase font-extrabold border transition ${
                          roomTotalRoundsInput === num
                            ? "bg-violet-950 border-violet-500 text-white"
                            : "bg-slate-900/40 border-slate-800 text-slate-500 hover:border-slate-700"
                        }`}
                      >
                        {num} R
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCreateRoom}
                  disabled={isLoading}
                  className="w-full bg-violet-600 hover:bg-violet-500 text-white font-mono text-xs font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PlusSymbol className="w-3.5 h-3.5" />
                  <span>Démarrer un salon</span>
                </button>
              </div>

              {/* Box B : Join Salon */}
              <div id="join-salon-card" className="bg-slate-950/45 p-5 rounded-2xl border border-slate-900/80 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Play className="w-4 h-4" />
                    <span className="font-heading text-xs font-black uppercase tracking-wider">Rejoindre un Salon</span>
                  </div>
                  <p className="text-slate-400 text-xs">Entrez le code de vos camarades et asseyez-vous à bord.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 font-mono block uppercase">Code de Salon (4 lettres) :</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))}
                    placeholder="EX: KFZT"
                    className="bg-slate-950 border border-slate-800 text-white font-mono text-center text-sm font-black uppercase rounded-lg py-1.5 focus:outline-none focus:border-emerald-500 block w-full"
                  />
                </div>

                <button
                  onClick={handleJoinRoom}
                  disabled={isLoading}
                  className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-xs font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Rejoindre la table</span>
                </button>
              </div>

            </div>
          </div>
        ) : (
          /* 2. IN-ROOM EXPERIENCE SHELL */
          <div className="space-y-6">

            {/* STATUS LOBBY BANNER */}
            {room.status === "lobby" && (
              <div className="max-w-xl mx-auto w-full space-y-6 py-6 text-center">
                <span className="text-xs font-mono text-violet-400 uppercase tracking-widest block font-bold animate-pulse">
                  Salle d'Attente du Salon
                </span>

                {/* BIG CODE CARD */}
                <div className="bg-slate-950 border border-violet-900/30 rounded-2xl p-6 inline-block min-w-[280px]">
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Code à partager :</p>
                  <div className="flex items-center justify-center gap-3 mt-1">
                    <span className="text-3xl font-heading font-black text-rose-500 tracking-wider">
                      {room.roomCode}
                    </span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(room.roomCode);
                        setSuccessString("Code copié dans le presse-papier !");
                      }}
                      className="bg-slate-900 hover:bg-slate-800 p-1.5 rounded-md border border-white/5 cursor-pointer text-slate-400 hover:text-white"
                      title="Copier le code"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-500 mt-2 font-mono">
                    Partagez ce code de salon pour jouer avec des amis en ligne.
                  </p>
                </div>

                {/* Connected players list */}
                <div className="bg-slate-900/40 p-5 rounded-2xl border border-white/5 space-y-3 text-left">
                  <span className="text-xs text-slate-400 font-mono uppercase block">Équipage connecté ({room.players.length} / 8) :</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {room.players.map((plr) => (
                      <div key={plr.id} className="flex items-center gap-2.5 bg-slate-950/60 p-2.5 rounded-xl border border-white/5 justify-between">
                        <div className="flex items-center gap-2">
                          <img src={plr.avatar} alt="avatar" className="w-8 h-8 rounded-lg bg-slate-900" />
                          <div>
                            <p className="text-xs font-bold text-white flex items-center gap-1">
                              {plr.name}
                              {plr.id === sessionPlayerId && <span className="text-[8px] bg-slate-800 text-slate-400 px-1 rounded">Moi</span>}
                            </p>
                            <p className="text-[9.5px] font-mono text-slate-500">
                              {plr.email === room.creatorEmail ? "👑 Maître de Cérémonie" : "🏴‍☠️ Pirate de Bord"}
                            </p>
                          </div>
                        </div>

                        {plr.email === room.creatorEmail && (
                          <span className="bg-violet-900/45 text-violet-300 text-[8px] px-1.5 rounded font-mono border border-violet-500/20">HÔTE</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Start buttons */}
                {room.creatorEmail === clientEmail ? (
                  <button
                    onClick={handleStartGameMatch}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-heading font-extrabold text-xs tracking-widest py-3.5 rounded-xl uppercase transition shadow-[0_0_15px_rgba(225,29,72,0.15)] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-4 h-4" />
                    <span>Démarrer la Mission d'Infiltration</span>
                  </button>
                ) : (
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-white/5 text-xs text-slate-400 flex items-center justify-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 text-violet-400 animate-spin" />
                    <span>En attente de l'hôte pour lever l'ancre et démarrer la partie...</span>
                  </div>
                )}
              </div>
            )}

            {/* STATUS REVEAL */}
            {room.status === "reveal" && (
              <div className="max-w-md mx-auto w-full py-6 text-center space-y-6">
                <span className="text-xs font-mono text-violet-400 uppercase tracking-widest block font-bold">
                  DÉCOUVRIR VOTRE IDENTITÉ SECRÈTE
                </span>
                
                <div className="bg-slate-950/80 rounded-2xl p-6 border border-white/5 space-y-5">
                  <div className="relative w-14 h-14 mx-auto bg-violet-950/40 rounded-full flex items-center justify-center border border-violet-500/20">
                    <User className="w-7 h-7 text-violet-400" />
                  </div>

                  <div className="space-y-1">
                    <p className="font-heading font-extrabold text-[#F8FAFC] text-base">Tour de {room.players.find(p => p.id === sessionPlayerId)?.name}</p>
                    <p className="text-slate-400 text-xs px-2">Assurez-vous que personne ne regarde vos cartes secrètes, puis révélez votre rôle confidentiel.</p>
                  </div>

                  {!isRevealOpen ? (
                    <button
                      onClick={() => setIsRevealOpen(true)}
                      className="w-full bg-violet-900/40 border border-violet-500/30 hover:bg-violet-900/60 text-white rounded-xl py-3 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-violet-400" />
                      <span>Révéler ma carte confidentielle</span>
                    </button>
                  ) : (
                    <div className="space-y-4 p-4 bg-slate-900/50 rounded-xl border border-violet-500/30">
                      
                      {/* ROLE PRESENTATION */}
                      <div className="space-y-3">
                        <span className="text-[10px] uppercase font-mono tracking-widest text-[#F1C40F] block">Rôle assigné :</span>
                        
                        {/* Character Image Display */}
                        {(() => {
                          const playerObj = room.players.find(p => p.id === sessionPlayerId);
                          const playerRole = playerObj?.role;
                          const characterName = playerRole === "Mister White" ? "Mister White" : playerObj?.character || "";
                          const characterImg = getCharacterImage(characterName);
                          return (
                            <div className="relative w-28 h-28 mx-auto rounded-xl overflow-hidden border-2 border-amber-500/40 bg-slate-950 flex items-center justify-center shadow-lg">
                              {playerRole === "Mister White" ? (
                                <div className="text-center p-2">
                                  <HelpCircle className="w-12 h-12 mx-auto text-rose-500 animate-pulse" />
                                </div>
                              ) : (
                                <img 
                                  src={characterImg} 
                                  alt={characterName} 
                                  className="w-full h-full object-cover object-top"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    e.currentTarget.src = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop";
                                  }}
                                />
                              )}
                            </div>
                          );
                        })()}

                        {room.players.find(p => p.id === sessionPlayerId)?.role === "Mister White" ? (
                          <p className="font-heading font-black text-rose-500 text-xl uppercase tracking-wider">MISTER WHITE</p>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-[10.5px] font-mono text-slate-400">Votre personnage :</p>
                            <p className="font-heading font-black text-emerald-400 text-xl uppercase tracking-wider">
                              {room.players.find(p => p.id === sessionPlayerId)?.character}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-300 leading-relaxed px-1">
                        {room.players.find(p => p.id === sessionPlayerId)?.role === "Mister White" ? (
                          <p>Vous êtes Mister White ! Vous n'avez pas de personnage secret. Écoutez scrupuleusement les descriptions de vos camarades pour deviner leur personnage.</p>
                        ) : (
                          <p>Vous possédez une carte de personnage secret ! Décrivez-le de façon subtile et prudente sans jamais prononcer son nom pour déceler les imposteurs.</p>
                        )}
                      </div>

                      {/* Ready Action */}
                      <button
                        onClick={handleMarkSelfAsReady}
                        className="w-full bg-[#1A1C3C] border border-[#F1C40F]/15 hover:border-[#F1C40F]/30 text-white rounded-lg py-2.5 text-xs font-mono font-extrabold cursor-pointer"
                      >
                        J'ai bien compris (Bloquer l'état)
                      </button>
                    </div>
                  )}

                  {/* Ready Players tracking count */}
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-[10px] text-slate-500 font-mono block uppercase mb-1">Dossier de lecture des rôles :</span>
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {room.players.map(p => (
                        <span key={p.id} className={`text-[10px] font-sans px-2 py-1 rounded-md border flex items-center gap-1 ${
                          p.isReady 
                            ? "bg-emerald-950/25 text-emerald-400 border-emerald-500/20" 
                            : "bg-slate-900 text-slate-500 border-slate-800"
                        }`}>
                          {p.isReady ? "✔" : "⏳"} {p.name}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* STATUS DISCUSSION & STATUS VOTING CORE GRID */}
            {(room.status === "discussion" || room.status === "voting") && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-2">
                
                {/* COLUMN 1: INFORMATION BAR AND REAL-TIME SYNC CHAT */}
                <div className="space-y-4 lg:col-span-1">
                  
                  {/* Master instruction bubble */}
                  <div className="bg-[#101223] rounded-2xl p-4 border border-violet-950 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 border-b border-white/5 pb-2">
                        <Target className="w-4 h-4 text-violet-400 shrink-0" />
                        <span className="text-xs uppercase font-mono tracking-widest text-violet-400 block font-bold">
                          Instructions de Mission : {room.gameMaster}
                        </span>
                      </div>

                      <div className="text-xs text-slate-300 leading-relaxed italic bg-slate-950/45 p-3 rounded-lg border border-white/5">
                        {room.status === "discussion" ? (
                          <p>
                            "Débutez les hostilités de discussion ! Dialoguez de vive voix ou écrivez ci-dessous pour trouver l'anomalie de groupe. Soyez malins et discrets sur vos mots !"
                          </p>
                        ) : (
                          <p>
                            "Place au tribunal populaire ! Confrontez vos verdicts et votez confidentiellement pour bannir le pirate le plus louche."
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-1">
                      <span>TYPE : MULTI MEMBRES</span>
                      <span className="font-mono text-slate-500">ID DE SALON : {room.id}</span>
                    </div>
                  </div>

                  {/* Synchronized Real-time Chat Box */}
                  <div className="bg-slate-950/90 rounded-2xl border border-white/5 h-[340px] flex flex-col justify-between overflow-hidden">
                    <div className="bg-slate-900/60 p-3 border-b border-white/5 flex justify-between items-center">
                      <span className="text-xs font-mono font-bold text-slate-400 uppercase flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                        Lobby Discussion
                      </span>
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    </div>

                    {/* Messages feed */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[250px]">
                      {room.chatMessages.map((msg, index) => (
                        <div key={msg.id || index} className={`flex items-start gap-2 ${msg.senderId === "system" ? "justify-center" : ""}`}>
                          {msg.senderId === "system" ? (
                            <div className="bg-slate-900/40 text-[10px] text-slate-400 py-1 px-3 border border-white/5 rounded-full text-center text-balance max-w-[90%]">
                              {msg.text}
                            </div>
                          ) : (
                            <>
                              <img src={msg.senderAvatar} alt="" className="w-6 h-6 rounded bg-slate-800 shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <div className="flex items-center gap-1.5 justify-between">
                                  <span className="text-[10px] font-bold text-[#F8FAFC]">{msg.senderName}</span>
                                  <span className="text-[8px] text-slate-600 font-mono">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-300 bg-slate-900/40 p-1.5 rounded border border-white/5 mt-0.5 text-balance font-sans">
                                  {msg.text}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                      <div ref={chatBottomRef} />
                    </div>

                    {/* Send message input */}
                    <form onSubmit={handleSendChatMessage} className="p-2 border-t border-white/5 bg-slate-900/40 flex gap-1.5">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder={room.players.find(p => p.id === sessionPlayerId)?.isEliminated ? "🚫 Éliminé (mode spectateur)" : "Tapez un message..."}
                        disabled={!!room.players.find(p => p.id === sessionPlayerId)?.isEliminated}
                        className="bg-slate-950 border border-slate-800 rounded-lg text-xs px-2.5 py-1.5 flex-1 focus:outline-none focus:border-violet-500 text-white"
                      />
                      <button 
                        type="submit" 
                        disabled={!!room.players.find(p => p.id === sessionPlayerId)?.isEliminated}
                        className="bg-violet-700 disabled:opacity-40 hover:bg-violet-600 text-white p-2 rounded-lg cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>

                </div>

                {/* COLUMN 2 & 3: MAIN ACTIVE GAMEPLAY BOARD */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-slate-950/80 rounded-2xl p-4 md:p-5 border border-white/5 space-y-4">
                    
                    {/* CONFIDENTIAL CARD REMINDER DISPLAY */}
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-violet-500/10 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[#F1C40F] shrink-0" />
                        <div>
                          <p className="text-[9px] text-[#F1C40F] font-mono uppercase tracking-widest font-black">🔐 Votre Carte Confidentielle :</p>
                          <p className="text-xs font-bold text-white uppercase mt-0.5">
                            {room.players.find(p => p.id === sessionPlayerId)?.role === "Mister White" ? (
                              "MISTER WHITE"
                            ) : (
                              <span>{room.players.find(p => p.id === sessionPlayerId)?.character || "Calcul en cours..."}</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-slate-500">
                        {room.players.find(p => p.id === sessionPlayerId)?.role || "Calcul..."}
                      </span>
                    </div>

                    {/* LOBBY STATUS TITLE AND ACTIONS */}
                    <div className="flex justify-between items-center pb-2 border-b border-white/5 flex-wrap gap-2">
                      <span className="text-xs font-mono text-[#F8FAFC]/70 uppercase tracking-widest font-bold">
                        {room.status === "discussion" ? "🗣️ Phase de Libre Débat" : "🗳️ Tribunal Pirate : Votez Confidentiellement !"}
                      </span>

                      {/* Display Host action "Start voting" */}
                      {room.status === "discussion" && room.creatorEmail === clientEmail && (
                        <button
                          onClick={handleLaunchVoting}
                          className="bg-red-700 hover:bg-red-600 text-[#F8FAFC] font-heading font-black tracking-wider text-[10px] px-3.5 py-1.5 rounded-lg border border-red-500 uppercase cursor-pointer"
                        >
                          Lancer les Votes d'Élimination
                        </button>
                      )}
                    </div>

                    {/* Online Speaking Order */}
                    {room.status === "discussion" && room.speakingOrder && room.speakingOrder.length > 0 && (
                      <div className="bg-slate-900 border border-violet-950/45 p-3.5 rounded-xl space-y-2">
                        <p className="text-[10px] uppercase font-mono text-amber-400 font-extrabold tracking-wider text-left">
                          🎙️ Ordre de parole aléatoire (Manche {room.currentRound || 1} / {room.totalRounds || 3}) :
                        </p>
                        <div className="flex flex-wrap gap-2.5 items-center">
                          {room.speakingOrder
                            .map(pid => room.players.find(p => p.id === pid))
                            .filter((p): p is Player => !!p && !p.isEliminated)
                            .map((plr, idx) => (
                              <div key={plr.id} className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-white/5">
                                <span className="text-[10px] font-mono text-slate-500 font-extrabold">{idx + 1}.</span>
                                <img src={plr.avatar} alt="" className="w-5 h-5 rounded bg-slate-900 shrink-0" referrerPolicy="no-referrer" />
                                <span className="text-xs font-bold text-[#F8FAFC]">{plr.name}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* LIST OF PLAYERS UNDER INVESTIGATION OR VOTING */}
                    <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                      {room.players.map((plr) => {
                        const isSelf = plr.id === sessionPlayerId;
                        const hasVoted = plr.votedFor !== "";
                        
                        return (
                          <div 
                            key={plr.id}
                            className={`flex flex-col sm:flex-row justify-between sm:items-center p-3 rounded-xl border transition gap-3 ${
                              plr.isEliminated 
                                ? "bg-rose-950/10 border-rose-950/20 opacity-40" 
                                : room.status === "voting" && isSelf
                                  ? "bg-slate-900 border-indigo-900"
                                  : "bg-slate-900/50 border-slate-800"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <img src={plr.avatar} alt="" className="w-8 h-8 rounded-lg bg-slate-950" />
                              <div>
                                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                                  {plr.name}
                                  {isSelf && <span className="text-[8px] bg-slate-800 text-slate-400 px-1 rounded font-mono">Moi</span>}
                                  {plr.isEliminated && <span className="text-[8px] bg-rose-950 text-rose-300 border border-rose-500/20 px-1 rounded font-mono">Banni</span>}
                                </p>
                                <p className="text-[9.5px] text-slate-500 font-mono uppercase">
                                  {plr.id === room.creatorEmail ? "Capitaine" : "Matelot"} • {plr.isEliminated ? "Éliminé" : "Suspect Actif"}
                                </p>
                              </div>
                            </div>

                            {/* RIGHT ACTION: EITHER VOTE BUTTONS OR STATUS PROGRESS */}
                            <div className="flex items-center gap-2 self-start sm:self-center">
                              {room.status === "voting" ? (
                                <>
                                  {/* If I need to vote against others */}
                                  {!room.players.find(p => p.id === sessionPlayerId)?.isEliminated && !plr.isEliminated && !isSelf && (
                                    <button
                                      disabled={room.players.find(p => p.id === sessionPlayerId)?.votedFor !== ""}
                                      onClick={() => handleSubmitVoteAgainst(plr.id)}
                                      className={`px-3 py-1.5 rounded font-mono text-[10px] uppercase font-bold text-center duration-150 cursor-pointer ${
                                        room.players.find(p => p.id === sessionPlayerId)?.votedFor === plr.id
                                          ? "bg-rose-800 text-white border border-rose-500"
                                          : room.players.find(p => p.id === sessionPlayerId)?.votedFor !== ""
                                            ? "bg-slate-900 text-slate-600 border border-transparent cursor-not-allowed"
                                            : "bg-slate-800 text-slate-300 hover:bg-rose-900/40 hover:text-rose-400 border border-white/5"
                                      }`}
                                    >
                                      {room.players.find(p => p.id === sessionPlayerId)?.votedFor === plr.id ? "Ciblé ✔" : "Voter contre"}
                                    </button>
                                  )}

                                  {/* Realtime check of who has voted */}
                                  {!plr.isEliminated && (
                                    <span className={`text-[10px] px-2 py-1 rounded font-mono ${
                                      hasVoted 
                                        ? "bg-emerald-950/20 text-emerald-400 border border-emerald-500/20" 
                                        : "bg-slate-950/50 text-slate-500"
                                    }`}>
                                      {hasVoted ? "A VOTÉ ✔" : "VOTE EN COURS... ⏳"}
                                    </span>
                                  )}
                                </>
                              ) : (
                                /* Discussion phase: just helper states */
                                <>
                                  {!plr.isEliminated && (
                                    <span className="bg-violet-950/30 text-violet-400 text-[9px] px-2 py-0.5 rounded border border-violet-500/10 uppercase tracking-widest font-mono font-bold animate-pulse">
                                      Donne sa version 🎙️
                                    </span>
                                  )}
                                </>
                              )}
                            </div>

                          </div>
                        );
                      })}
                    </div>

                  </div>
                </div>

              </div>
            )}

            {/* STATUS MISTER WHITE GUESS SCENARIO */}
            {room.status === "mister_white_guess" && (
              <div className="max-w-md mx-auto w-full py-6 space-y-5">
                <span className="text-xs font-mono text-rose-400 uppercase tracking-widest block text-center font-bold">
                  🔮 LE SCORE DE SURVIE DE MISTER WHITE
                </span>

                <div className="bg-slate-950/90 rounded-2xl p-6 border border-rose-950 space-y-4 text-center">
                  <div className="relative w-16 h-16 mx-auto bg-rose-950/20 rounded-full flex items-center justify-center border border-rose-500/20 mb-2">
                    <ShieldAlert className="w-8 h-8 text-rose-500" />
                  </div>

                  <div className="space-y-1">
                    <p className="font-heading font-black text-[#F8FAFC] text-base uppercase">Mister White démasqué !</p>
                    <p className="text-xs text-rose-200/70">
                      Mister White était : <strong>{room.eliminatedPlayer?.name}</strong>.
                    </p>
                    <p className="text-xs text-slate-300 px-1 leading-relaxed">
                      L'équipage a banni Mister White ! Mais avant d'être écroué, Mister White possède un dernier coup d'éclat décisif. S'il devine le personnage secret des Citoyens, il remporte l'intégralité du match !
                    </p>
                  </div>

                  {/* Guessing console controller according to whether current user is Mister White */}
                  {room.eliminatedPlayer?.id === sessionPlayerId ? (
                    <MisterWhiteKeyboard onSubmit={handleGuessSubmit} isLoading={isLoading} />
                  ) : (
                    <div className="p-4 bg-slate-900/60 rounded-xl border border-white/5 space-y-2 text-xs">
                      <p className="text-rose-400 font-mono animate-pulse">MISTER WHITE ENTRAÎNE SES PRÉDICTIONS... 🎙️</p>
                      <p className="text-slate-400">
                        Veuillez patienter pendant que {room.eliminatedPlayer?.name} saisit sa réponse sur son écran confidentiel.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STATUS END MATCH REWARDS & REVEALS */}
            {room.status === "end" && (
              <div className="max-w-xl mx-auto w-full py-6 space-y-6 text-center">
                <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block font-bold">
                  🏆 CONCLUSION DE LA MISSION INFIDÈLE
                </span>

                {/* BIG PROUD CARD */}
                <div className="bg-gradient-to-b from-[#181A32] to-[#0A0B17] border border-amber-500/25 rounded-3xl p-6 md:p-8 space-y-4 relative overflow-hidden">
                  
                  {/* Decorative golden rays */}
                  <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 to-transparent pointer-events-none" />

                  <div className="w-16 h-16 mx-auto bg-amber-950/40 border border-amber-500/20 rounded-full flex items-center justify-center">
                    <Award className="w-8 h-8 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-heading font-black text-amber-300 text-xl tracking-wider uppercase block">
                      Verdict Officiel
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans max-w-md mx-auto text-balance">
                      {room.winnerMessage}
                    </p>
                  </div>

                  {/* Character allocations reveals */}
                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-white/5 text-left space-y-3">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block tracking-wider">
                      📋 Révélation Complète des Rôles Militaires de la Table :
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {room.players.map((plr) => {
                        const isWinner = 
                          (room.winnerMessage.includes("CITOYENS") && plr.role === "Citoyen") ||
                          (room.winnerMessage.includes("IMPOSTEUR") && plr.role === "Imposteur") ||
                          (room.winnerMessage.includes("Mister White") && plr.role === "Mister White") ||
                          (room.winnerMessage.includes("MISTER WHITE") && plr.role === "Mister White");

                        return (
                          <div 
                            key={plr.id} 
                            className={`p-3 rounded-xl border flex justify-between items-center gap-2.5 ${
                              isWinner 
                                ? "bg-emerald-950/30 border-emerald-500/20" 
                                : "bg-slate-900/40 border-slate-800"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <img src={plr.avatar} alt="" className="w-7 h-7 bg-slate-800 rounded" />
                              <div>
                                <p className="text-xs font-bold text-white flex items-center gap-1">
                                  {plr.name}
                                  {isWinner && <span className="text-[8px] bg-emerald-900 text-emerald-300 px-1 rounded">Vainqueur</span>}
                                </p>
                                <p className="text-[9.5px] font-mono text-slate-400 uppercase">
                                  {plr.role === "Citoyen" ? room.citizen : plr.role === "Imposteur" ? room.imposter : "Mister White"}
                                </p>
                              </div>
                            </div>

                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                              plr.role === "Citoyen" 
                                ? "bg-cyan-950 text-cyan-400" 
                                : plr.role === "Imposteur"
                                  ? "bg-rose-950 text-rose-400"
                                  : "bg-purple-950 text-purple-400"
                            }`}>
                              {plr.role}
                            </span>

                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Leaderboard / Classement des scores en ligne */}
                  <div className="bg-slate-950/80 p-5 rounded-2xl border border-amber-500/20 text-left space-y-3">
                    <div className="flex items-center gap-1.5 border-b border-white/5 pb-2">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span className="text-[10px] uppercase font-mono text-amber-400 block tracking-wider font-extrabold">
                        🏆 Classement Général du Salon (Manche {room.currentRound || 1} / {room.totalRounds || 3}) :
                      </span>
                    </div>

                    <div className="space-y-2">
                      {[...room.players]
                        .sort((a, b) => (b.score || 0) - (a.score || 0))
                        .map((plr, index) => (
                          <div key={plr.id} className="flex justify-between items-center bg-slate-900/40 p-2.5 rounded-xl border border-white/5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-slate-500 w-5">#{index + 1}</span>
                              <img src={plr.avatar} alt="" className="w-6 h-6 rounded bg-slate-950" />
                              <span className="text-xs font-bold text-white">
                                {plr.name} {plr.id === sessionPlayerId && <span className="text-[9px] text-slate-500">(Moi)</span>}
                              </span>
                            </div>
                            <span className="text-xs font-mono font-black text-amber-400">
                              {plr.score || 0} Pts
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Mister White's guess if played */}
                  {room.misterWhiteGuess && (
                    <div className="bg-slate-950/40 border border-white/5 p-3 rounded-xl font-mono text-[11px] text-slate-300 italic text-center">
                      Mister White a proposé la réponse : "{room.misterWhiteGuess}" (La réponse requise était : "{room.citizen}")
                    </div>
                  )}

                  {/* Play again or Next online round buttons */}
                  {(room.currentRound || 1) < (room.totalRounds || 3) ? (
                    room.creatorEmail === clientEmail ? (
                      <button
                        onClick={handleNextOnlineRound}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-heading font-black tracking-widest text-xs py-3.5 rounded-xl uppercase transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>➡️ Passer à la Manche {(room.currentRound || 1) + 1} / {room.totalRounds || 3}</span>
                      </button>
                    ) : (
                      <div className="bg-slate-950/45 p-3 rounded-xl text-xs text-slate-400">
                        En attente du Maître de salon pour lancer la manche {(room.currentRound || 1) + 1} / {room.totalRounds || 3}... 🚀
                      </div>
                    )
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3 text-emerald-300 font-sans text-xs font-bold">
                        🏆 Partie Terminée ! Félicitations à {[...room.players].sort((a, b) => (b.score || 0) - (a.score || 0))[0]?.name} qui remporte le tournoi après {room.totalRounds} manches !
                      </div>
                      {room.creatorEmail === clientEmail ? (
                        <button
                          onClick={handlePlayAgain}
                          disabled={isLoading}
                          className="w-full bg-violet-700 hover:bg-violet-600 text-white font-heading font-black tracking-widest text-xs py-3.5 rounded-xl uppercase transition cursor-pointer"
                        >
                          🔄 Recommencer à Zéro (Nouvelle Partie)
                        </button>
                      ) : (
                        <div className="bg-slate-950/45 p-3 rounded-xl text-xs text-slate-400">
                          Seul le maître de salon ({room.players.find(p => p.email === room.creatorEmail)?.name || "l'Hôte"}) peut relancer un nouveau tournoi.
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}

/**
 * Mister White custom guess typing box
 */
interface MisterWhiteKeyboardProps {
  onSubmit: (guess: string) => void;
  isLoading: boolean;
}
function MisterWhiteKeyboard({ onSubmit, isLoading }: MisterWhiteKeyboardProps) {
  const [typed, setTyped] = useState<string>("");

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typed.trim()) return;
    onSubmit(typed.trim());
  };

  return (
    <form onSubmit={handleApply} className="space-y-3">
      <div className="space-y-1 text-left">
        <label className="text-[10px] font-mono text-rose-400 block uppercase tracking-wider">Saisissez votre prédiction finale :</label>
        <input
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder="Ex: Chopper, Kaido, Shanks..."
          disabled={isLoading}
          className="bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-500 block w-full text-center tracking-wide uppercase font-black placeholder-slate-700"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || !typed.trim()}
        className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-mono font-black tracking-widest uppercase py-3 rounded-xl transition duration-150 cursor-pointer"
      >
        LIVRER MON ESTIMATION ULTIME
      </button>
    </form>
  );
}

/**
 * Standard Plus Symbol helper icon
 */
function PlusSymbol(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      viewBox="0 0 24 24" 
      className={props.className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

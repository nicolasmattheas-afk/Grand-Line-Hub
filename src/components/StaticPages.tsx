import React from "react";

export const PrivacyPage = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 font-sans text-slate-300">
    <h1 className="text-3xl font-black text-white uppercase mb-6 font-heading border-b border-white/10 pb-4">Politique de Confidentialité & RGPD 🔒</h1>
    <div className="space-y-6 text-sm leading-relaxed">
      <p>
        Sur <strong className="text-white">grandlinehub.fr</strong>, nous prenons la sécurité de votre équipage et de vos données personnelles extrêmement au sérieux. Conformément au Règlement Général sur la Protection des Données (RGPD) n° 2016/679 de l'Union Européenne, voici comment nous traitons vos informations :
      </p>
      
      <div>
        <h2 className="text-xl font-bold text-teal-400 mb-2 font-heading">1. Données Stockées en Local (LocalStorage)</h2>
        <p>
          Par défaut, et pour garantir une expérience fluide sans nécessiter de compte, la majorité de vos données de progression (statistiques des mini-jeux, historique des parties, préférences d'interface) sont stockées localement sur votre appareil via le <code>LocalStorage</code> de votre navigateur. Ces données ne quittent jamais votre navire et ne sont transmises à aucun serveur distant, assurant une confidentialité absolue.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-teal-400 mb-2 font-heading">2. Données Synchronisées (Firebase & Cloud)</h2>
        <p>
          Si vous choisissez de créer un compte (via Google, GitHub, ou Email), nous collectons et stockons de manière sécurisée les informations suivantes sur nos serveurs (hébergés par Google Firebase dans des centres de données européens) :
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li><strong>Adresse Email :</strong> Utilisée uniquement pour l'authentification et la récupération de compte. Nous ne vendrons jamais votre adresse à des courtiers en données.</li>
          <li><strong>Pseudo (Nom de Pirate) :</strong> Votre identifiant public affiché dans les classements (Bounty Leaderboard) et les commentaires du blog.</li>
          <li><strong>Prime (Bounty) & Statistiques :</strong> Synchronisées pour vous permettre de retrouver votre progression sur tous vos appareils.</li>
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-bold text-teal-400 mb-2 font-heading">3. Partage des Données et Tiers</h2>
        <p>
          Nous utilisons Google AdSense pour afficher des publicités non-intrusives qui financent les coûts de serveur. AdSense peut utiliser des cookies pour diffuser des annonces pertinentes en fonction de vos visites antérieures. Nous ne partageons aucune donnée d'identification personnelle avec nos partenaires publicitaires.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-teal-400 mb-2 font-heading">4. Vos Droits (Droit à l'oubli)</h2>
        <p>
          Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et d'effacement de vos données. Depuis votre tableau de bord (Dashboard), vous pouvez à tout moment cliquer sur "Supprimer mon compte", ce qui effacera irrévocablement toutes vos données de nos serveurs en moins de 24 heures. Pour toute demande spécifique, contactez notre DPO (Délégué à la Protection des Données) à l'adresse <a href="mailto:privacy@grandlinehub.fr" className="text-violet-400 hover:underline">privacy@grandlinehub.fr</a>.
        </p>
      </div>
    </div>
  </div>
);

export const TermsPage = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 font-sans text-slate-300">
    <h1 className="text-3xl font-black text-white uppercase mb-6 font-heading border-b border-white/10 pb-4">Conditions Générales d'Utilisation 📜</h1>
    <div className="space-y-6 text-sm leading-relaxed">
      <p>
        L'utilisation du site <strong className="text-white">grandlinehub.fr</strong> implique l'acceptation pleine et entière des présentes conditions d'utilisation, rédigées pour assurer le respect mutuel et le fair-play au sein de notre communauté de passionnés.
      </p>

      <div>
        <h2 className="text-xl font-bold text-amber-300 mb-2 font-heading">1. Accès et Services Gratuits</h2>
        <p>
          L'accès à l'ensemble de nos jeux stratégiques (Bounty Duel, Grand Line Grid, Pyramide, etc.) est totalement libre et gratuit. La création d'un compte pirate ou l'utilisation d'une session visiteur est disponible pour stocker vos statistiques. Nous nous engageons à maintenir l'expérience de jeu principale exempte de murs de paiement (paywalls).
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-amber-300 mb-2 font-heading">2. Comportement Communautaire</h2>
        <p>
          Dans les espaces de discussion (Blog, Alliances, Classements), chaque utilisateur s'engage à faire preuve de courtoisie. Sont strictement interdits sous peine de bannissement définitif :
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Le harcèlement, l'injure, ou la discrimination sous toutes ses formes.</li>
          <li>Le partage de liens vers des contenus illégaux ou protégés par le droit d'auteur (ex: scans piratés, streaming illégal).</li>
          <li>Le spam ou la promotion de services tiers non autorisés.</li>
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-bold text-amber-300 mb-2 font-heading">3. Propriété Intellectuelle</h2>
        <p>
          <strong>Avertissement Légal :</strong> Grand Line Hub est un projet de fans, créé par et pour la communauté. Nous ne revendiquons aucune affiliation officielle avec Toei Animation, Shueisha ou Eiichiro Oda. Les noms, images, et concepts liés à l'univers d'One Piece sont la propriété de leurs ayants droit respectifs. Ce site est conçu sous un régime d'exception pour parodie, hommage, et indexation encyclopédique.
        </p>
      </div>
      
      <div>
        <h2 className="text-xl font-bold text-amber-300 mb-2 font-heading">4. Modification des Conditions</h2>
        <p>
          L'équipage d'administration se réserve le droit de modifier les présentes CGU à tout moment pour les adapter aux évolutions du site ou de la législation. Les modifications entrent en vigueur dès leur publication.
        </p>
      </div>
    </div>
  </div>
);

export const AboutPage = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 font-sans text-slate-300">
    <h1 className="text-3xl font-black text-white uppercase mb-6 font-heading border-b border-white/10 pb-4">À Propos de Grand Line Hub ⛵</h1>
    <div className="space-y-6 text-sm leading-relaxed">
      <p>
        Bienvenue sur <strong className="text-white text-lg">Grand Line Hub</strong>, le portail ultime de jeux de stratégie et de connaissances dédié à l'univers du plus grand manga de tous les temps.
      </p>
      
      <div>
        <h2 className="text-xl font-bold text-violet-400 mb-2 font-heading">Notre Mission</h2>
        <p>
          Développé de A à Z par un équipage de développeurs passionnés et de fans inconditionnels (présents depuis l'arc Arlong Park !), notre portail a pour unique mission d'offrir une plateforme ludique, saine et hautement stimulante pour la communauté francophone et internationale.
        </p>
        <p className="mt-2">
          Contrairement à de simples wikis statiques, Grand Line Hub privilégie <strong>l'interaction et la logique cognitive</strong>. Nous programmons des mini-jeux exclusifs conçus pour tester vos connaissances pointues :
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li><strong>Grand Line Grid :</strong> Un jeu de croisement complexe où chaque cellule requiert un personnage précis.</li>
          <li><strong>Bounty Duel :</strong> Testez votre évaluation des menaces en devinant qui possède la prime la plus élevée.</li>
          <li><strong>Pyramide des Pirates :</strong> Un défi de mémoire visuelle et de liens hiérarchiques.</li>
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-bold text-violet-400 mb-2 font-heading">Notre Vision Communautaire</h2>
        <p>
          Nous croyons en un web ouvert, haut en couleurs et débarrassé des pratiques toxiques. Tous nos jeux de stratégie sont et resteront gratuits, garantis sans paywalls abusifs. Vos primes ne s'achètent pas sous forme de microtransactions ; elles se méritent uniquement par la force de vos déductions et votre connaissance de l'œuvre !
        </p>
      </div>

      <p className="text-center italic mt-8 text-amber-200">
        "Merci d'avoir jeté l'ancre chez nous. Que votre route vers Laugh Tale soit semée d'honneur et d'alliances solides !"
      </p>
    </div>
  </div>
);

export const ContactPage = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 font-sans text-slate-300">
    <h1 className="text-3xl font-black text-white uppercase mb-6 font-heading border-b border-white/10 pb-4">Contact & Support ✉️</h1>
    <div className="space-y-6 text-sm leading-relaxed">
      <p>
        Vous avez rencontré un bug sur le Grand Line Grid ? Vous souhaitez proposer une alliance, ou vous avez une question concernant la gestion de vos données ? Notre flotte de communication est à votre écoute !
      </p>

      <div className="bg-[#10142C]/80 p-6 border border-violet-500/20 rounded-2xl">
        <h2 className="text-xl font-bold text-white mb-4 font-heading">Envoyer un Pigeon de Morgans (Formulaire)</h2>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            alert("Message envoyé ! Le Pigeon de Morgans a pris son envol avec votre pli urgent 🦅 !");
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold mb-1">Votre Nom / Pseudo Pirate</label>
            <input type="text" required className="w-full bg-[#0A0D1F] border border-violet-500/30 rounded-xl p-3 text-white text-sm focus:border-violet-400 outline-none transition-colors" placeholder="Ex: Roronoa..." />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold mb-1">Email de réponse</label>
            <input type="email" required className="w-full bg-[#0A0D1F] border border-violet-500/30 rounded-xl p-3 text-white text-sm focus:border-violet-400 outline-none transition-colors" placeholder="votre@den-den-mushi.com" />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold mb-1">Motif du contact</label>
            <select className="w-full bg-[#0A0D1F] border border-violet-500/30 rounded-xl p-3 text-white text-sm focus:border-violet-400 outline-none transition-colors">
              <option>Signalement de Bug</option>
              <option>Suggestion de Jeu / Personnage</option>
              <option>Problème de Compte / Prime</option>
              <option>Partenariat / Alliance</option>
              <option>Autre motif</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold mb-1">Votre Message</label>
            <textarea required rows={4} className="w-full bg-[#0A0D1F] border border-violet-500/30 rounded-xl p-3 text-white text-sm focus:border-violet-400 outline-none transition-colors resize-none" placeholder="Rédigez votre missive ici..."></textarea>
          </div>
          <button type="submit" className="w-full bg-violet-600 hover:bg-violet-500 text-white font-heading font-black uppercase tracking-widest py-3 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]">
            Envoyer la missive
          </button>
        </form>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-white mb-2 font-heading">Contacts Directs</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Support Technique :</strong> support@grandlinehub.fr</li>
          <li><strong>Partenariats :</strong> contact@grandlinehub.fr</li>
          <li><strong>Données / RGPD :</strong> privacy@grandlinehub.fr</li>
        </ul>
      </div>
    </div>
  </div>
);

export const LegalPage = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 font-sans text-slate-300">
    <h1 className="text-3xl font-black text-white uppercase mb-6 font-heading border-b border-white/10 pb-4">Mentions Légales ⚖️</h1>
    <div className="space-y-6 text-sm leading-relaxed">
      <p>
        Conformément aux dispositions de l'article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique (LCEN), il est précisé aux utilisateurs du site <strong className="text-white">grandlinehub.fr</strong> l'identité des différents intervenants dans le cadre de sa réalisation et de son suivi :
      </p>

      <ul className="list-disc pl-5 space-y-2">
        <li><strong>Éditeur du site :</strong> Association Grand Line Collectif, gérée bénévolement par un collège indépendant d'étudiants et fans. Email de contact : <span className="text-violet-350 font-bold">contact@grandlinehub.fr</span>.</li>
        <li><strong>Directeur de la publication :</strong> Équipage Grand Line Hub (Publication communautaire non-lucrative).</li>
        <li><strong>Hébergement du site :</strong> Google Cloud Run & Firebase Hosting, opéré par Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irlande.</li>
      </ul>

      <div>
        <h2 className="text-xl font-bold text-violet-400 mb-2 font-heading">Responsabilité pour le Contenu Communautaire</h2>
        <p>
          Le site propose un espace communautaire en ligne interactif (le Forum des Pirates - Blog Section). Les propos tenus sur ce blog le sont sous la responsabilité exclusive de leurs auteurs respectifs. Tout utilisateur peut signaler un contenu abusif, diffamatoire ou contraire aux lois françaises à l'adresse de signalement immédiat : <strong className="text-white">signaler@grandlinehub.fr</strong>. Notre équipe s'engage à modérer et supprimer tout message illicite sous un délai maximum de 24 heures.
        </p>
      </div>
    </div>
  </div>
);

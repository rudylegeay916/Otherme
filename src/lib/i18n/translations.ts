export type Lang = 'fr' | 'en'

export interface Tr {
  lang: { fr: string; en: string }
  c: {
    continue: string; back: string; skip: string; cancel: string
    optional: string; generating: string; redirecting: string
    stepLabel: (step: number, total: number) => string
  }
  nav: {
    start: string; resume: string; restart: string
    restartTitle: string; restartMsg: string; restartConfirm: string
    resumeBannerTitle: string; resumeBannerSub: string
  }
  landing: {
    badge: string
    heroTitle: string; heroAccent: string; heroTitle2: string
    heroSub: string; heroCta: string
    statRating: string; statReports: string; statSpeed: string
    howTitle: string; howAccent: string; howSub: string
    steps: Array<{ icon: string; title: string; desc: string }>
    exTitle: string; exAccent: string; exSub: string
    exTrajLabel: string; exTrajTitle: string; exTrajTagline: string; exTrajDesc: string
    exSkills: string[]; exMore: string
    testiTitle: string; testiAccent: string; testiTitle2: string
    testimonials: Array<{ name: string; job: string; text: string; stars: number }>
    ctaTitle: string; ctaAccent: string; ctaTitle2: string
    ctaSub: string; ctaStart: string; ctaResume: string; ctaRestart: string; ctaNote: string
    faqTitle: string; faqAccent: string
    faqs: Array<{ q: string; a: string }>
    footerRights: string; footerPrivacy: string; footerTerms: string; footerContact: string
  }
  onb: {
    stepTitles: Record<number, { title: string; sub: string }>
    idTitle: string; idSub: string
    fieldFirstName: string; fieldAge: string; fieldEmail: string; fieldEmailNote: string
    fieldSituation: string; fieldCity: string; fieldGender: string
    cvTitle: string; cvSub: string
    cvSavedNote: string; cvDropTitle: string; cvDropSub: string
    cvLoaded: string; cvClickChange: string
    cvQuickTitle: string; fieldJob: string; fieldSector: string; fieldExp: string
    fieldEducLevel: string; fieldEducField: string; fieldLanguages: string
    chooseLabel: string
    readyAccent: string; readyText: string
    generateBtn: string
    loadingMessages: string[]
  }
  cp: {
    generic: Array<{ title: string; message: string; statLabel: string; statValue: string; icon: string; ctaLabel?: string }>
    liberty:     { title: string; message: string; statLabel: string; statValue: string; icon: string }
    creativity:  { title: string; message: string; statLabel: string; statValue: string; icon: string }
    meaning:     { title: string; message: string; statLabel: string; statValue: string; icon: string }
    money:       { title: string; message: string; statLabel: string; statValue: string; icon: string }
    progressive: { title: string; message: string; statLabel: string; statValue: string; icon: string }
    footer: string
  }
  paywall: {
    loading: string; notFound: string; notFoundSub: string; restartBtn: string
    reportReady: (name: string) => string
    paidSub: string; freeSub: string
    unlockBtn: string
    trajLabel: string; feasibility: string; actionPlan: string; skillsLabel: string
    locked: string; lockedSub: string
    ctaTitle: string; ctaSub: (email: string) => string; ctaUnlimited: string
    priceBadge: string; priceAmount: string; pricePeriod: string
    priceThen: string; priceThenAmount: string; priceThenSub: string
    features: string[]; ctaBtn: string; ctaNote: string; ctaRedirecting: string
  }
  auth: {
    loginSub: string; loginTitle: string
    emailLabel: string; passwordLabel: string; forgotLink: string
    loginBtn: string; loggingIn: string
    noAccount: string; createAccountLink: string
    signupSub: string; signupTitle: string
    firstNameLabel: string; passwordMin: string; confirmPwdLabel: string
    signupBtn: string; signingUp: string
    hasAccount: string; loginLink: string
    termsNote: string; termsLink: string
    emailSentTitle: string; emailSentSub: (email: string) => string; emailSentNote: string
    backToLogin: string
    pwdStrengthWeak: string; pwdStrengthMedium: string; pwdStrengthStrong: string
    pwdCheck8: string; pwdCheckUpper: string; pwdCheckDigit: string
    forgotTitle: string; forgotSub: string; forgotFormTitle: string; forgotFormSub: string
    sendLinkBtn: string; sending: string
    resetSentTitle: string; resetSentSub: (email: string) => string; resetSentNote: string
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FRANÇAIS
// ─────────────────────────────────────────────────────────────────────────────

const fr: Tr = {
  lang: { fr: 'FR', en: 'EN' },
  c: {
    continue: 'Continuer →', back: '← Retour', skip: 'Passer',
    cancel: 'Annuler', optional: 'optionnel', generating: 'Génération…',
    redirecting: 'Redirection…',
    stepLabel: (s, t) => `Étape ${s} / ${t}`,
  },
  nav: {
    start: 'Commencer', resume: 'Reprendre le test', restart: 'Recommencer',
    restartTitle: 'Recommencer depuis le début ?',
    restartMsg: 'Tes réponses actuelles seront supprimées. Cette action est irréversible.',
    restartConfirm: 'Recommencer',
    resumeBannerTitle: 'Ton exploration OtherMe est en cours.',
    resumeBannerSub: 'Tu peux reprendre là où tu t\'es arrêté, ou tout recommencer depuis le début.',
  },
  landing: {
    badge: 'Pas un test d\'orientation. Un plan de transition.',
    heroTitle: 'Découvre', heroAccent: '3 trajectoires professionnelles', heroTitle2: 'réalistes pour la suite de ta vie.',
    heroSub: 'OtherMe analyse ton parcours, tes compétences, tes contraintes et tes envies pour te proposer des métiers cibles atteignables, avec une timeline claire et un plan d\'action concret.',
    heroCta: 'Découvrir mes trajectoires →',
    statRating: 'Questionnaire en 5 min', statReports: 'CV optionnel pour affiner l\'analyse', statSpeed: 'Première analyse en quelques minutes',
    howTitle: 'Comment ça', howAccent: 'fonctionne', howSub: 'Concret. Personnalisé. Actionnable.',
    steps: [
      { icon: '📋', title: 'Tu décris ta situation actuelle', desc: 'Parcours, études, compétences, envies, contraintes personnelles et objectifs professionnels. Le CV reste optionnel pour affiner l\'analyse.' },
      { icon: '🔍', title: 'OtherMe croise tes envies avec tes contraintes réelles', desc: 'L\'analyse prend en compte ton niveau actuel, ton temps disponible, ton besoin de sécurité, ton objectif de revenu et tes compétences transférables.' },
      { icon: '🗺️', title: 'Tu obtiens 3 trajectoires professionnelles concrètes', desc: 'Chaque trajectoire inclut un métier cible, un score de faisabilité, les compétences à développer, les risques et les premières actions à lancer.' },
    ],
    exTitle: 'Un exemple de', exAccent: 'trajectoire', exSub: 'Exemple indicatif — les résultats varient selon chaque profil',
    exTrajLabel: 'Trajectoire #1', exTrajTitle: 'Chargé de projet digital junior',
    exTrajTagline: '"Une transition progressive, sans repartir de zéro"',
    exTrajDesc: 'Cette trajectoire convient à une personne organisée, capable de communiquer avec différents interlocuteurs et motivée par les projets digitaux. Elle permet une transition progressive sans repartir de zéro.',
    exSkills: ['Communication', 'Organisation', 'Gestion de projet'],
    exMore: '2 autres trajectoires personnalisées dans ton rapport complet',
    testiTitle: 'Exemples de', testiAccent: 'transitions', testiTitle2: 'possibles',
    testimonials: [
      { name: 'Comptable → Chargé de projet digital', job: 'Transition estimée : 6 à 9 mois', stars: 0, text: 'Une personne organisée, à l\'aise avec les données et les interlocuteurs multiples peut naturellement pivoter vers la gestion de projets digitaux. Les compétences en analyse et reporting sont directement transférables.' },
      { name: 'Développeur junior → Consultant no-code', job: 'Transition estimée : 3 à 6 mois', stars: 0, text: 'La maîtrise technique combinée à une vision produit permet de conseiller des entreprises sur l\'automatisation et les outils no-code. Un profil de plus en plus recherché avec des revenus souvent supérieurs.' },
      { name: 'Assistant RH → Responsable formation digitale', job: 'Transition estimée : 6 à 12 mois', stars: 0, text: 'L\'expérience en recrutement, onboarding et gestion des compétences est un socle solide pour piloter la formation digitale en entreprise. Rôle stratégique en forte croissance.' },
    ],
    ctaTitle: 'Prêt à construire', ctaAccent: 'ta prochaine trajectoire', ctaTitle2: ' ?',
    ctaSub: 'Réponds à quelques questions et obtiens une première vision claire des chemins professionnels réalistes pour toi.',
    ctaStart: 'Découvrir mes trajectoires →', ctaResume: 'Reprendre mon analyse →', ctaRestart: 'Recommencer',
    ctaNote: 'Questionnaire guidé · CV optionnel · Plan personnalisé',
    faqTitle: 'Questions', faqAccent: 'fréquentes',
    faqs: [
      { q: 'Est-ce que l\'IA choisit mon métier à ma place ?', a: 'Non. OtherMe te propose des trajectoires réalistes basées sur ton profil, mais la décision t\'appartient entièrement. L\'objectif est de t\'aider à clarifier tes options, pas de te dicter quoi faire.' },
      { q: 'Est-ce adapté si je veux me reconvertir ?', a: 'Oui, c\'est exactement le cas d\'usage principal. OtherMe est conçu pour les personnes qui veulent changer de voie sans repartir de zéro, en valorisant leur expérience existante.' },
      { q: 'Est-ce que mes données sont confidentielles ?', a: 'Oui. Tes données sont chiffrées et utilisées uniquement pour générer ton rapport personnalisé. Elles ne sont jamais revendues ni partagées avec des tiers.' },
      { q: 'Est-ce que le rapport remplace un bilan de compétences ?', a: 'Non. OtherMe ne remplace pas un bilan de compétences ou un accompagnement professionnel. Il t\'aide à clarifier tes options et à avancer avec une première feuille de route structurée, avant d\'aller plus loin si nécessaire.' },
    ],
    footerRights: 'Tous droits réservés', footerPrivacy: 'Confidentialité', footerTerms: 'CGV', footerContact: 'Contact',
  },
  onb: {
    stepTitles: {
      0: { title: 'Parle-nous de toi',                   sub: 'Quelques infos pour personnaliser ton analyse' },
      2: { title: 'Tes compétences',                     sub: 'Ce que tu sais faire et comment les autres te sollicitent' },
      3: { title: 'Ton énergie & tes domaines',          sub: "Ce qui t'anime et les domaines qui t'attirent" },
      4: { title: 'Ta direction & ton style de vie',     sub: "Tes envies et le cadre professionnel qui te correspond" },
      5: { title: 'Ton environnement & tes priorités',   sub: "Où tu veux travailler et l'importance de la stabilité" },
      6: { title: 'Tes contraintes & ton plan',          sub: "Ce que tu veux éviter et comment tu veux avancer" },
      7: { title: 'Questions adaptées à ton profil',     sub: 'Quelques questions personnalisées selon tes réponses' },
    },
    idTitle: 'Parle-nous de toi', idSub: 'Quelques infos pour personnaliser ton analyse',
    fieldFirstName: 'Prénom *', fieldAge: 'Âge *', fieldEmail: 'Email *',
    fieldEmailNote: 'Pour recevoir ton rapport PDF', fieldSituation: 'Situation actuelle *',
    fieldCity: 'Ville', fieldGender: 'Genre',
    cvTitle: 'Ton CV', cvSub: 'Ajoute ton CV pour permettre à OtherMe de personnaliser l\'analyse. C\'est optionnel, mais cela la rend beaucoup plus précise.',
    cvSavedNote: 'CV de la session précédente · Re-charge le fichier si tu veux l\'inclure',
    cvDropTitle: 'Glisser ou cliquer pour ajouter ton CV',
    cvDropSub: 'PDF, DOCX ou TXT · Max 10 Mo',
    cvLoaded: 'Cliquer pour changer',
    cvClickChange: 'Cliquer pour changer',
    cvQuickTitle: 'Ou renseigne ton parcours rapidement :',
    fieldJob: 'Métier actuel', fieldSector: 'Secteur', fieldExp: 'Années d\'expérience',
    fieldEducLevel: 'Niveau d\'études', fieldEducField: 'Domaine', fieldLanguages: 'Langues parlées',
    chooseLabel: 'Choisir…',
    readyAccent: 'Prêt à découvrir tes autres vies.',
    readyText: 'L\'IA va analyser ton profil complet et générer 3 trajectoires alternatives personnalisées. Résultat en ~30 secondes.',
    generateBtn: 'Générer mon rapport ✨',
    loadingMessages: [
      "L'IA analyse ton parcours...",
      "Exploration de tes potentiels cachés...",
      "Construction de tes trajectoires alternatives...",
      "Calcul des scores de faisabilité...",
      "Finalisation de ton rapport personnalisé...",
    ],
  },
  cp: {
    generic: [
      { title: 'Ton profil commence à se dessiner.', message: "Tes premières réponses permettent déjà à OtherMe de mieux comprendre ce qui te motive, ce qui t'attire et ce que tu veux éviter.", statLabel: 'Analyse', statValue: 'En cours', icon: 'layers' },
      { title: 'Tu avances mieux que tu ne le penses.', message: 'Chaque réponse affine tes trajectoires. OtherMe commence à distinguer les environnements, les secteurs et les rôles qui pourraient vraiment te correspondre.', statLabel: 'Personnalisation', statValue: '+ précise', icon: 'compass' },
      { title: 'Tes trajectoires deviennent plus précises.', message: 'Tes réponses ne servent pas à te mettre dans une case. Elles permettent de construire plusieurs chemins possibles à partir de ton parcours, tes envies et ta réalité.', statLabel: 'Trajectoires', statValue: '3 scénarios', icon: 'route' },
      { title: 'OtherMe va maintenant affiner ton profil.', message: 'Les prochaines questions sont adaptées à tes réponses. Elles servent à mieux distinguer les pistes réalistes, inspirantes et actionnables pour toi.', statLabel: 'Questions', statValue: 'Personnalisées', icon: 'sparkles', ctaLabel: 'Répondre aux questions personnalisées' },
    ],
    liberty:     { title: 'Ton envie de liberté ressort clairement.', message: "OtherMe va privilégier des trajectoires qui peuvent t'offrir plus d'autonomie, sans ignorer ton besoin de sécurité.", statLabel: 'Signal détecté', statValue: 'Autonomie', icon: 'wind' },
    creativity:  { title: 'Ton profil créatif commence à apparaître.', message: "OtherMe va chercher des trajectoires où tu peux créer, imaginer, produire ou transformer des idées en projets concrets.", statLabel: 'Signal détecté', statValue: 'Créativité', icon: 'palette' },
    meaning:     { title: 'Ton besoin de sens ressort dans tes réponses.', message: "OtherMe va explorer des pistes où ton travail peut avoir plus d'impact, d'utilité ou d'alignement personnel.", statLabel: 'Signal détecté', statValue: 'Sens & impact', icon: 'lightbulb' },
    money:       { title: 'Ton ambition est prise en compte.', message: "OtherMe va chercher des trajectoires qui valorisent mieux tes compétences, tout en restant réalistes selon ton parcours.", statLabel: 'Signal détecté', statValue: 'Ambition', icon: 'target' },
    progressive: { title: 'Ta transition peut se construire étape par étape.', message: "OtherMe ne va pas seulement proposer un métier final, mais aussi un chemin réaliste pour y arriver progressivement.", statLabel: 'Approche', statValue: 'Transition douce', icon: 'trending-up' },
    footer: 'OtherMe · Analyse en cours',
  },
  paywall: {
    loading: 'Chargement de ton rapport...', notFound: 'Rapport introuvable',
    notFoundSub: "Ce rapport n'existe pas ou a expiré.", restartBtn: 'Recommencer',
    reportReady: (name) => `Rapport généré pour ${name}`,
    paidSub: 'Ton rapport complet est débloqué. Tu recevras le PDF par email.',
    freeSub: "Voici un premier aperçu de tes 3 trajectoires. Débloque le rapport complet pour accéder aux analyses détaillées, à la timeline, aux risques et au plan d'action.",
    unlockBtn: 'Débloquer — 4,99 €',
    trajLabel: 'Trajectoire', feasibility: 'Faisabilité', actionPlan: "Plan d'action",
    skillsLabel: 'Compétences à développer',
    locked: 'Trajectoire verrouillée', lockedSub: 'Débloquez pour lire cette trajectoire',
    ctaTitle: 'Débloquer le rapport complet',
    ctaSub: (email) => `Accède aux analyses détaillées de tes 3 trajectoires, à la timeline, aux risques, aux compétences à développer et au plan d'action. PDF envoyé à ${email}.`,
    ctaUnlimited: '♾️ Tests illimités inclus — analysez autant de profils que vous voulez',
    priceBadge: 'Offre de lancement', priceAmount: '4,99 €', pricePeriod: '/ 1ère semaine',
    priceThen: 'puis', priceThenAmount: '14,99 € / semaine', priceThenSub: '· résiliable à tout moment',
    features: ['3 trajectoires complètes', 'Tests illimités', 'PDF par email', 'Paiement sécurisé', 'Sans engagement'],
    ctaBtn: 'Débloquer mon rapport complet →',
    ctaNote: 'Sans engagement · Résiliable à tout moment',
    ctaRedirecting: 'Redirection vers le paiement...',
  },
  auth: {
    loginSub: 'Connecte-toi pour accéder à tes rapports', loginTitle: 'Connexion',
    emailLabel: 'Email', passwordLabel: 'Mot de passe', forgotLink: 'Mot de passe oublié ?',
    loginBtn: 'Se connecter', loggingIn: 'Connexion…',
    noAccount: 'Pas encore de compte ?', createAccountLink: 'Créer mon compte',
    signupSub: 'Crée ton compte pour sauvegarder tes rapports', signupTitle: 'Créer mon compte',
    firstNameLabel: 'Prénom', passwordMin: '(min. 8 caractères)', confirmPwdLabel: 'Confirmer le mot de passe',
    signupBtn: 'Créer mon compte', signingUp: 'Création…',
    hasAccount: 'Déjà un compte ?', loginLink: 'Se connecter',
    termsNote: 'En créant un compte, tu acceptes nos', termsLink: 'CGU',
    emailSentTitle: 'Vérifie ton email',
    emailSentSub: (email) => `Un lien de confirmation a été envoyé à ${email}. Clique sur le lien pour activer ton compte.`,
    emailSentNote: 'Pense à vérifier tes spams.',
    backToLogin: 'Retour à la connexion',
    pwdStrengthWeak: 'Faible', pwdStrengthMedium: 'Moyen', pwdStrengthStrong: 'Fort',
    pwdCheck8: '8+ caractères', pwdCheckUpper: 'Majuscule', pwdCheckDigit: 'Chiffre',
    forgotTitle: 'Réinitialise ton mot de passe', forgotSub: 'Réinitialise ton mot de passe',
    forgotFormTitle: 'Mot de passe oublié', forgotFormSub: 'Entre ton email pour recevoir un lien de réinitialisation.',
    sendLinkBtn: 'Envoyer le lien', sending: 'Envoi…',
    resetSentTitle: 'Email envoyé',
    resetSentSub: (email) => `Un lien de réinitialisation a été envoyé à ${email}. Clique sur le lien pour choisir un nouveau mot de passe.`,
    resetSentNote: "Le lien expire dans 1 heure. Vérifie tes spams.",
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// ENGLISH
// ─────────────────────────────────────────────────────────────────────────────

const en: Tr = {
  lang: { fr: 'FR', en: 'EN' },
  c: {
    continue: 'Continue →', back: '← Back', skip: 'Skip',
    cancel: 'Cancel', optional: 'optional', generating: 'Generating…',
    redirecting: 'Redirecting…',
    stepLabel: (s, t) => `Step ${s} / ${t}`,
  },
  nav: {
    start: 'Get started', resume: 'Resume my test', restart: 'Start over',
    restartTitle: 'Start from scratch?',
    restartMsg: 'Your current answers will be deleted. This action cannot be undone.',
    restartConfirm: 'Start over',
    resumeBannerTitle: 'Your OtherMe exploration is in progress.',
    resumeBannerSub: 'You can pick up where you left off, or start fresh from the beginning.',
  },
  landing: {
    badge: 'Not a career aptitude test. A transition plan.',
    heroTitle: 'Discover', heroAccent: '3 realistic professional paths', heroTitle2: 'for the next chapter of your life.',
    heroSub: 'OtherMe analyses your background, skills, constraints and goals to propose reachable target careers, with a clear timeline and a concrete action plan.',
    heroCta: 'Discover my paths →',
    statRating: '5-minute questionnaire', statReports: 'Optional CV to refine results', statSpeed: 'First analysis in a few minutes',
    howTitle: 'How does it', howAccent: 'work', howSub: 'Concrete. Personalised. Actionable.',
    steps: [
      { icon: '📋', title: 'You describe your current situation', desc: 'Background, education, skills, goals, personal constraints and career objectives. Your CV is optional but helps refine the analysis.' },
      { icon: '🔍', title: 'OtherMe maps your goals against real constraints', desc: 'The analysis factors in your current level, available time, need for stability, income goals and transferable skills.' },
      { icon: '🗺️', title: 'You receive 3 concrete career paths', desc: 'Each path includes a target role, feasibility score, skills to develop, risks and first actions to take.' },
    ],
    exTitle: 'An example', exAccent: 'path', exSub: 'Indicative example — results vary by profile',
    exTrajLabel: 'Path #1', exTrajTitle: 'Junior Digital Project Manager',
    exTrajTagline: '"A gradual transition without starting from scratch"',
    exTrajDesc: 'This path suits an organised person, comfortable with different stakeholders and motivated by digital projects. It allows for a gradual transition without starting from zero.',
    exSkills: ['Communication', 'Organisation', 'Project management'],
    exMore: '2 more personalized trajectories in your full report',
    testiTitle: 'Example', testiAccent: 'transitions', testiTitle2: 'that are possible',
    testimonials: [
      { name: 'Accountant → Digital Project Manager', job: 'Estimated transition: 6 to 9 months', stars: 0, text: 'Someone organised, comfortable with data and multiple stakeholders can naturally pivot into digital project management. Analytical and reporting skills transfer directly.' },
      { name: 'Junior Developer → No-code Consultant', job: 'Estimated transition: 3 to 6 months', stars: 0, text: 'Technical skills combined with a product mindset allow advising companies on automation and no-code tools — an increasingly in-demand profile with often higher earnings.' },
      { name: 'HR Assistant → Digital Learning Manager', job: 'Estimated transition: 6 to 12 months', stars: 0, text: 'Experience in recruitment, onboarding and skills management is a strong foundation for leading digital L&D. A strategic role in high growth.' },
    ],
    ctaTitle: 'Ready to build', ctaAccent: 'your next career path', ctaTitle2: '?',
    ctaSub: 'Answer a few questions and get a clear first picture of the realistic career directions available to you.',
    ctaStart: 'Discover my paths →', ctaResume: 'Resume my analysis →', ctaRestart: 'Start over',
    ctaNote: 'Guided questionnaire · Optional CV · Personalised plan',
    faqTitle: 'Frequently asked', faqAccent: 'questions',
    faqs: [
      { q: 'Does the AI choose my career for me?', a: 'No. OtherMe suggests realistic paths based on your profile, but the decision is entirely yours. The goal is to help you clarify your options, not tell you what to do.' },
      { q: 'Is this suitable if I want to change career?', a: 'Yes — that\'s the primary use case. OtherMe is designed for people who want to change direction without starting from scratch, by leveraging their existing experience.' },
      { q: 'Is my data confidential?', a: 'Yes. Your data is encrypted and used solely to generate your personalised report. It is never sold or shared with third parties.' },
      { q: 'Does the report replace a career assessment?', a: 'No. OtherMe does not replace a professional career assessment or coaching. It helps you clarify your options and move forward with a first structured roadmap.' },
    ],
    footerRights: 'All rights reserved', footerPrivacy: 'Privacy', footerTerms: 'Terms', footerContact: 'Contact',
  },
  onb: {
    stepTitles: {
      0: { title: 'Tell us about yourself',               sub: 'A few details to personalize your analysis' },
      2: { title: 'Your skills',                          sub: 'What you can do and how others call on you' },
      3: { title: 'Your energy & interests',              sub: 'What drives you and the areas that attract you' },
      4: { title: 'Your direction & lifestyle',           sub: 'Your goals and the professional setting that suits you' },
      5: { title: 'Your environment & priorities',        sub: 'Where you want to work and your financial priorities' },
      6: { title: 'Your constraints & plan',              sub: 'What to avoid and how you want to move forward' },
      7: { title: 'Questions tailored to you',            sub: 'A few personalized questions based on your answers' },
    },
    idTitle: 'Tell us about yourself', idSub: 'A few details to personalize your analysis',
    fieldFirstName: 'First name *', fieldAge: 'Age *', fieldEmail: 'Email *',
    fieldEmailNote: 'To receive your PDF report', fieldSituation: 'Current situation *',
    fieldCity: 'City', fieldGender: 'Gender',
    cvTitle: 'Your CV', cvSub: 'Add your CV to let OtherMe personalize the analysis. Optional, but it makes results far more accurate.',
    cvSavedNote: 'CV from previous session · Re-upload the file to include it',
    cvDropTitle: 'Drag or click to upload your CV',
    cvDropSub: 'PDF, DOCX or TXT · Max 10 MB',
    cvLoaded: 'Click to change',
    cvClickChange: 'Click to change',
    cvQuickTitle: 'Or fill in your background quickly:',
    fieldJob: 'Current job', fieldSector: 'Sector', fieldExp: 'Years of experience',
    fieldEducLevel: 'Education level', fieldEducField: 'Field of study', fieldLanguages: 'Languages spoken',
    chooseLabel: 'Choose…',
    readyAccent: 'Ready to discover your other lives.',
    readyText: 'The AI will analyze your full profile and generate 3 personalized alternative trajectories. Results in ~30 seconds.',
    generateBtn: 'Generate my report ✨',
    loadingMessages: [
      'AI is analyzing your background...',
      'Exploring your hidden potential...',
      'Building your alternative trajectories...',
      'Calculating feasibility scores...',
      'Finalizing your personalized report...',
    ],
  },
  cp: {
    generic: [
      { title: 'Your profile is starting to take shape.', message: 'Your first answers are already helping OtherMe understand what motivates you, what attracts you, and what you want to avoid.', statLabel: 'Analysis', statValue: 'In progress', icon: 'layers' },
      { title: "You're making more progress than you think.", message: 'Every answer sharpens your trajectories. OtherMe is starting to identify the environments, sectors and roles that could truly suit you.', statLabel: 'Personalization', statValue: 'Getting sharper', icon: 'compass' },
      { title: 'Your trajectories are becoming more precise.', message: "Your answers aren't meant to put you in a box. They help build several possible paths based on your background, desires and reality.", statLabel: 'Trajectories', statValue: '3 scenarios', icon: 'route' },
      { title: 'OtherMe is about to refine your profile.', message: 'The next questions are tailored to your answers. They help distinguish the realistic, inspiring and actionable paths for you.', statLabel: 'Questions', statValue: 'Personalized', icon: 'sparkles', ctaLabel: 'Answer personalized questions' },
    ],
    liberty:     { title: 'Your desire for freedom stands out clearly.', message: "OtherMe will prioritize trajectories that can offer you more autonomy, without ignoring your need for security.", statLabel: 'Signal detected', statValue: 'Autonomy', icon: 'wind' },
    creativity:  { title: 'Your creative profile is starting to emerge.', message: "OtherMe will look for trajectories where you can create, imagine, produce or transform ideas into concrete projects.", statLabel: 'Signal detected', statValue: 'Creativity', icon: 'palette' },
    meaning:     { title: 'Your need for meaning shows in your answers.', message: "OtherMe will explore paths where your work can have more impact, purpose or personal alignment.", statLabel: 'Signal detected', statValue: 'Purpose', icon: 'lightbulb' },
    money:       { title: 'Your ambition is taken into account.', message: "OtherMe will look for trajectories that better leverage your skills, while staying realistic about your background.", statLabel: 'Signal detected', statValue: 'Ambition', icon: 'target' },
    progressive: { title: 'Your transition can be built step by step.', message: "OtherMe won't just suggest a final career — it will also map a realistic path to get there gradually.", statLabel: 'Approach', statValue: 'Gentle transition', icon: 'trending-up' },
    footer: 'OtherMe · Analysis in progress',
  },
  paywall: {
    loading: 'Loading your report...', notFound: 'Report not found',
    notFoundSub: 'This report does not exist or has expired.', restartBtn: 'Start over',
    reportReady: (name) => `Report generated for ${name}`,
    paidSub: 'Your full report is unlocked. You will receive the PDF by email.',
    freeSub: 'Here is a first preview of your 3 trajectories. Unlock the full report to access detailed analyses, timeline, risks and action plan.',
    unlockBtn: 'Unlock — €4.99',
    trajLabel: 'Trajectory', feasibility: 'Feasibility', actionPlan: 'Action plan',
    skillsLabel: 'Skills to develop',
    locked: 'Locked trajectory', lockedSub: 'Unlock to read this trajectory',
    ctaTitle: 'Unlock the full report',
    ctaSub: (email) => `Access the detailed analyses of your 3 trajectories, timeline, risks, skills to develop and action plan. PDF sent to ${email}.`,
    ctaUnlimited: '♾️ Unlimited analyses included — analyze as many profiles as you want',
    priceBadge: 'Launch offer', priceAmount: '€4.99', pricePeriod: '/ first week',
    priceThen: 'then', priceThenAmount: '€14.99 / week', priceThenSub: '· cancel anytime',
    features: ['3 full trajectories', 'Unlimited analyses', 'PDF by email', 'Secure payment', 'No commitment'],
    ctaBtn: 'Unlock my full report →',
    ctaNote: 'No commitment · Cancel anytime',
    ctaRedirecting: 'Redirecting to payment...',
  },
  auth: {
    loginSub: 'Sign in to access your reports', loginTitle: 'Sign in',
    emailLabel: 'Email', passwordLabel: 'Password', forgotLink: 'Forgot password?',
    loginBtn: 'Sign in', loggingIn: 'Signing in…',
    noAccount: 'No account yet?', createAccountLink: 'Create an account',
    signupSub: 'Create an account to save your reports', signupTitle: 'Create an account',
    firstNameLabel: 'First name', passwordMin: '(min. 8 characters)', confirmPwdLabel: 'Confirm password',
    signupBtn: 'Create my account', signingUp: 'Creating…',
    hasAccount: 'Already have an account?', loginLink: 'Sign in',
    termsNote: 'By creating an account, you agree to our', termsLink: 'Terms',
    emailSentTitle: 'Check your email',
    emailSentSub: (email) => `A confirmation link has been sent to ${email}. Click the link to activate your account.`,
    emailSentNote: 'Remember to check your spam folder.',
    backToLogin: 'Back to sign in',
    pwdStrengthWeak: 'Weak', pwdStrengthMedium: 'Fair', pwdStrengthStrong: 'Strong',
    pwdCheck8: '8+ characters', pwdCheckUpper: 'Uppercase', pwdCheckDigit: 'Number',
    forgotTitle: 'Reset your password', forgotSub: 'Reset your password',
    forgotFormTitle: 'Forgot password', forgotFormSub: 'Enter your email to receive a reset link.',
    sendLinkBtn: 'Send reset link', sending: 'Sending…',
    resetSentTitle: 'Email sent',
    resetSentSub: (email) => `A reset link has been sent to ${email}. Click the link to choose a new password.`,
    resetSentNote: 'The link expires in 1 hour. Check your spam folder.',
  },
}

export const translations: Record<Lang, Tr> = { fr, en }

export function useTr(lang: Lang): Tr {
  return translations[lang]
}

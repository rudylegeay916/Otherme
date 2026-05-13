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
    badge: 'Propulsé par GPT-4o',
    heroTitle: 'Et si une autre version', heroAccent: 'de toi', heroTitle2: 't\'attendait encore ?',
    heroSub: 'OtherMe analyse ton parcours, tes envies et tes choix pour révéler <strong>3 trajectoires de vie alternatives</strong> que tu peux encore construire.',
    heroCta: 'Découvrir mes autres vies →',
    statRating: '4.9/5', statReports: '+2 400 rapports générés', statSpeed: '⚡ Résultat en 30 sec',
    howTitle: 'Comment ça', howAccent: 'fonctionne', howSub: 'Simple. Rapide. Transformateur.',
    steps: [
      { icon: '📋', title: 'Tu remplis le formulaire', desc: 'Cinq minutes pour décrire ton parcours, tes aspirations et tes atouts. Un CV optionnel pour enrichir l\'analyse.' },
      { icon: '🤖', title: 'L\'IA analyse ton profil', desc: 'Notre IA entraînée sur des milliers de trajectoires analyse tes données et identifie tes potentiels cachés.' },
      { icon: '✨', title: 'Tu découvres tes autres vies', desc: '3 trajectoires alternatives personnalisées, avec plan d\'action, compétences à développer et score de faisabilité.' },
    ],
    exTitle: 'Un exemple de', exAccent: 'trajectoire', exSub: 'Extrait d\'un vrai rapport OtherMe',
    exTrajLabel: 'Trajectoire #1', exTrajTitle: 'Consultant en Transformation Digitale',
    exTrajTagline: '"Mettre ton expertise au service des entreprises qui en ont besoin"',
    exTrajDesc: 'Fort de tes 7 ans d\'expérience dans la tech et de ta capacité d\'analyse, tu peux naturellement pivoter vers le conseil. Les entreprises cherchent ce profil hybride qui comprend à la fois la technique et le business.',
    exSkills: ['Gestion de projet', 'Communication', 'Leadership'],
    exMore: '2 autres trajectoires personnalisées dans ton rapport complet',
    testiTitle: 'Ils ont', testiAccent: 'découvert', testiTitle2: 'leurs autres vies',
    testimonials: [
      { name: 'Camille R.', job: 'Comptable, 34 ans', stars: 5, text: 'J\'avais toujours rêvé de faire autre chose mais je ne savais pas quoi. OtherMe m\'a ouvert les yeux sur 3 trajectoires réalistes. J\'ai commencé à me former en UX Design.' },
      { name: 'Thomas M.', job: 'Développeur, 28 ans', stars: 5, text: 'Le rapport est bluffant de précision. Il a capté mes valeurs et m\'a suggéré une voie entrepreneuriale que j\'explore sérieusement.' },
      { name: 'Sophie L.', job: 'Infirmière, 41 ans', stars: 5, text: 'Je pensais qu\'il était trop tard pour changer. OtherMe m\'a prouvé le contraire avec un plan concret sur 3 ans.' },
    ],
    ctaTitle: 'Prêt à', ctaAccent: 'te découvrir', ctaTitle2: ' ?',
    ctaSub: 'Réponds à quelques questions et laisse l\'IA révéler tes autres vies possibles.',
    ctaStart: 'Commencer maintenant →', ctaResume: 'Reprendre mon test →', ctaRestart: 'Recommencer',
    ctaNote: '⚡ Résultat personnalisé en moins de 30 secondes',
    faqTitle: 'Questions', faqAccent: 'fréquentes',
    faqs: [
      { q: 'À qui s\'adresse OtherMe ?', a: 'À toute personne qui se demande si elle a fait les bons choix, qui cherche un changement de cap, ou qui veut simplement explorer son potentiel inexploité.' },
      { q: 'Les trajectoires sont-elles vraiment personnalisées ?', a: 'Oui. L\'IA utilise GPT-4o et analyse chaque détail de ton profil. Deux profils identiques n\'auront jamais le même rapport.' },
      { q: 'Puis-je faire plusieurs analyses ?', a: 'Oui ! Avec ton abonnement, tu peux générer autant d\'analyses que tu veux, à tout moment.' },
      { q: 'Mes données sont-elles sécurisées ?', a: 'Tes données sont chiffrées et ne sont jamais revendues. Elles sont utilisées uniquement pour générer ton rapport.' },
    ],
    footerRights: 'Tous droits réservés', footerPrivacy: 'Confidentialité', footerTerms: 'CGV', footerContact: 'Contact',
  },
  onb: {
    stepTitles: {
      0: { title: 'Parle-nous de toi',                sub: 'Quelques infos pour personnaliser ton analyse' },
      2: { title: 'Tes compétences & ton profil',     sub: 'Ce que tu sais faire et comment tu fonctionnes' },
      3: { title: 'Tes passions & ton énergie',       sub: "Ce qui t'anime naturellement" },
      4: { title: 'Ton style de vie idéal',           sub: 'Le cadre professionnel qui te correspond' },
      5: { title: 'Ta projection de vie',             sub: 'Ce que tu veux construire et éviter' },
      6: { title: 'Ton profil & tes blocages',        sub: 'Les derniers éléments pour affiner tes trajectoires' },
      7: { title: 'Questions adaptées à ton profil',  sub: 'Quelques questions personnalisées selon tes réponses' },
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
      { title: 'Ton profil commence à se dessiner.', message: "Tes premières réponses permettent déjà à OtherMe de mieux comprendre ce qui te motive, ce qui t'attire et ce que tu veux éviter.", statLabel: 'Analyse', statValue: 'En cours', icon: '🧩' },
      { title: 'Tu avances mieux que tu ne le penses.', message: 'Chaque réponse affine tes trajectoires. OtherMe commence à distinguer les environnements, les secteurs et les rôles qui pourraient vraiment te correspondre.', statLabel: 'Personnalisation', statValue: '+ précise', icon: '📡' },
      { title: 'Tes trajectoires deviennent plus précises.', message: 'Tes réponses ne servent pas à te mettre dans une case. Elles permettent de construire plusieurs chemins possibles à partir de ton parcours, tes envies et ta réalité.', statLabel: 'Trajectoires', statValue: '3 scénarios', icon: '🗺️' },
      { title: 'OtherMe va maintenant affiner ton profil.', message: 'Les prochaines questions sont adaptées à tes réponses. Elles servent à mieux distinguer les pistes réalistes, inspirantes et actionnables pour toi.', statLabel: 'Questions', statValue: 'Personnalisées', icon: '✨', ctaLabel: 'Répondre aux questions personnalisées' },
    ],
    liberty:     { title: 'Ton envie de liberté ressort clairement.', message: "OtherMe va privilégier des trajectoires qui peuvent t'offrir plus d'autonomie, sans ignorer ton besoin de sécurité.", statLabel: 'Signal détecté', statValue: 'Autonomie', icon: '🦅' },
    creativity:  { title: 'Ton profil créatif commence à apparaître.', message: "OtherMe va chercher des trajectoires où tu peux créer, imaginer, produire ou transformer des idées en projets concrets.", statLabel: 'Signal détecté', statValue: 'Créativité', icon: '🎨' },
    meaning:     { title: 'Ton besoin de sens ressort dans tes réponses.', message: "OtherMe va explorer des pistes où ton travail peut avoir plus d'impact, d'utilité ou d'alignement personnel.", statLabel: 'Signal détecté', statValue: 'Sens & impact', icon: '💡' },
    money:       { title: 'Ton ambition est prise en compte.', message: "OtherMe va chercher des trajectoires qui valorisent mieux tes compétences, tout en restant réalistes selon ton parcours.", statLabel: 'Signal détecté', statValue: 'Ambition', icon: '🎯' },
    progressive: { title: 'Ta transition peut se construire étape par étape.', message: "OtherMe ne va pas seulement proposer un métier final, mais aussi un chemin réaliste pour y arriver progressivement.", statLabel: 'Approche', statValue: 'Transition douce', icon: '🪜' },
    footer: 'OtherMe · Analyse en cours',
  },
  paywall: {
    loading: 'Chargement de ton rapport...', notFound: 'Rapport introuvable',
    notFoundSub: "Ce rapport n'existe pas ou a expiré.", restartBtn: 'Recommencer',
    reportReady: (name) => `Rapport généré pour ${name}`,
    paidSub: 'Ton rapport complet est débloqué. Tu recevras le PDF par email.',
    freeSub: 'La première trajectoire est offerte. Débloquez les 2 suivantes pour accéder au rapport complet.',
    unlockBtn: 'Débloquer — 4,99 €',
    trajLabel: 'Trajectoire', feasibility: 'Faisabilité', actionPlan: "Plan d'action",
    skillsLabel: 'Compétences à développer',
    locked: 'Trajectoire verrouillée', lockedSub: 'Débloquez pour lire cette trajectoire',
    ctaTitle: 'Débloquer le rapport complet',
    ctaSub: (email) => `Accédez à vos 3 trajectoires + PDF envoyé à ${email}`,
    ctaUnlimited: '♾️ Tests illimités inclus — analysez autant de profils que vous voulez',
    priceBadge: 'Offre de lancement', priceAmount: '4,99 €', pricePeriod: '/ 1ère semaine',
    priceThen: 'puis', priceThenAmount: '14,99 € / semaine', priceThenSub: '· résiliable à tout moment',
    features: ['3 trajectoires complètes', 'Tests illimités', 'PDF par email', 'Paiement sécurisé', 'Sans engagement'],
    ctaBtn: "S'abonner et débloquer — 4,99 €",
    ctaNote: 'Paiement sécurisé par Stripe · SSL · Résiliable à tout moment',
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
    badge: 'Powered by GPT-4o',
    heroTitle: 'What if another version', heroAccent: 'of you', heroTitle2: 'is still waiting ?',
    heroSub: 'OtherMe analyzes your background, desires and choices to reveal <strong>3 alternative life paths</strong> you can still build.',
    heroCta: 'Discover my other lives →',
    statRating: '4.9/5', statReports: '+2,400 reports generated', statSpeed: '⚡ Results in 30 sec',
    howTitle: 'How does it', howAccent: 'work', howSub: 'Simple. Fast. Transformative.',
    steps: [
      { icon: '📋', title: 'You fill in the form', desc: 'Five minutes to describe your background, aspirations and strengths. An optional CV to enrich the analysis.' },
      { icon: '🤖', title: 'AI analyzes your profile', desc: 'Our AI trained on thousands of career trajectories analyzes your data and identifies your hidden potential.' },
      { icon: '✨', title: 'You discover your other lives', desc: '3 personalized alternative paths, with action plan, skills to develop and feasibility score.' },
    ],
    exTitle: 'An example', exAccent: 'trajectory', exSub: 'Extract from a real OtherMe report',
    exTrajLabel: 'Trajectory #1', exTrajTitle: 'Digital Transformation Consultant',
    exTrajTagline: '"Put your expertise to work for companies that need it"',
    exTrajDesc: 'With 7 years of experience in tech and your exceptional analytical skills, you can naturally pivot to consulting. Companies are looking for exactly this hybrid profile: someone who understands both technology and business.',
    exSkills: ['Project management', 'Communication', 'Leadership'],
    exMore: '2 more personalized trajectories in your full report',
    testiTitle: 'They', testiAccent: 'discovered', testiTitle2: 'their other lives',
    testimonials: [
      { name: 'Camille R.', job: 'Accountant, 34', stars: 5, text: 'I always dreamed of doing something different but never knew what. OtherMe opened my eyes to 3 realistic trajectories. I started training in UX Design.' },
      { name: 'Thomas M.', job: 'Developer, 28', stars: 5, text: 'The report is strikingly accurate. It captured my values and suggested an entrepreneurial path I\'m seriously exploring.' },
      { name: 'Sophie L.', job: 'Nurse, 41', stars: 5, text: 'I thought it was too late to change. OtherMe proved me wrong with a concrete 3-year plan. I didn\'t expect such a personalized result.' },
    ],
    ctaTitle: 'Ready to', ctaAccent: 'discover yourself', ctaTitle2: '?',
    ctaSub: 'Answer a few questions and let the AI reveal your other possible lives.',
    ctaStart: 'Start now →', ctaResume: 'Resume my test →', ctaRestart: 'Start over',
    ctaNote: '⚡ Personalized result in under 30 seconds',
    faqTitle: 'Frequently asked', faqAccent: 'questions',
    faqs: [
      { q: 'Who is OtherMe for?', a: 'Anyone who wonders if they made the right choices, who is looking for a career change, or who simply wants to explore their untapped potential.' },
      { q: 'Are the trajectories really personalized?', a: 'Yes. The AI uses GPT-4o and analyzes every detail of your profile. Two identical profiles will never produce the same report.' },
      { q: 'Can I run multiple analyses?', a: 'Yes! With your subscription, you can generate as many analyses as you want, at any time.' },
      { q: 'Is my data secure?', a: 'Your data is encrypted and never sold. It is used solely to generate your report.' },
    ],
    footerRights: 'All rights reserved', footerPrivacy: 'Privacy', footerTerms: 'Terms', footerContact: 'Contact',
  },
  onb: {
    stepTitles: {
      0: { title: 'Tell us about yourself',           sub: 'A few details to personalize your analysis' },
      2: { title: 'Your skills & profile',            sub: 'What you know how to do and how you work' },
      3: { title: 'Your passions & energy',           sub: 'What naturally drives you' },
      4: { title: 'Your ideal work lifestyle',        sub: 'The professional environment that suits you' },
      5: { title: 'Your life vision',                 sub: 'What you want to build and avoid' },
      6: { title: 'Your profile & blockers',          sub: 'Final elements to refine your trajectories' },
      7: { title: 'Questions tailored to you',        sub: 'A few personalized questions based on your answers' },
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
      { title: 'Your profile is starting to take shape.', message: 'Your first answers are already helping OtherMe understand what motivates you, what attracts you, and what you want to avoid.', statLabel: 'Analysis', statValue: 'In progress', icon: '🧩' },
      { title: "You're making more progress than you think.", message: 'Every answer sharpens your trajectories. OtherMe is starting to identify the environments, sectors and roles that could truly suit you.', statLabel: 'Personalization', statValue: 'Getting sharper', icon: '📡' },
      { title: 'Your trajectories are becoming more precise.', message: "Your answers aren't meant to put you in a box. They help build several possible paths based on your background, desires and reality.", statLabel: 'Trajectories', statValue: '3 scenarios', icon: '🗺️' },
      { title: 'OtherMe is about to refine your profile.', message: 'The next questions are tailored to your answers. They help distinguish the realistic, inspiring and actionable paths for you.', statLabel: 'Questions', statValue: 'Personalized', icon: '✨', ctaLabel: 'Answer personalized questions' },
    ],
    liberty:     { title: 'Your desire for freedom stands out clearly.', message: "OtherMe will prioritize trajectories that can offer you more autonomy, without ignoring your need for security.", statLabel: 'Signal detected', statValue: 'Autonomy', icon: '🦅' },
    creativity:  { title: 'Your creative profile is starting to emerge.', message: "OtherMe will look for trajectories where you can create, imagine, produce or transform ideas into concrete projects.", statLabel: 'Signal detected', statValue: 'Creativity', icon: '🎨' },
    meaning:     { title: 'Your need for meaning shows in your answers.', message: "OtherMe will explore paths where your work can have more impact, purpose or personal alignment.", statLabel: 'Signal detected', statValue: 'Purpose', icon: '💡' },
    money:       { title: 'Your ambition is taken into account.', message: "OtherMe will look for trajectories that better leverage your skills, while staying realistic about your background.", statLabel: 'Signal detected', statValue: 'Ambition', icon: '🎯' },
    progressive: { title: 'Your transition can be built step by step.', message: "OtherMe won't just suggest a final career — it will also map a realistic path to get there gradually.", statLabel: 'Approach', statValue: 'Gentle transition', icon: '🪜' },
    footer: 'OtherMe · Analysis in progress',
  },
  paywall: {
    loading: 'Loading your report...', notFound: 'Report not found',
    notFoundSub: 'This report does not exist or has expired.', restartBtn: 'Start over',
    reportReady: (name) => `Report generated for ${name}`,
    paidSub: 'Your full report is unlocked. You will receive the PDF by email.',
    freeSub: 'The first trajectory is free. Unlock the next 2 to access the full report.',
    unlockBtn: 'Unlock — €4.99',
    trajLabel: 'Trajectory', feasibility: 'Feasibility', actionPlan: 'Action plan',
    skillsLabel: 'Skills to develop',
    locked: 'Locked trajectory', lockedSub: 'Unlock to read this trajectory',
    ctaTitle: 'Unlock the full report',
    ctaSub: (email) => `Access your 3 trajectories + PDF sent to ${email}`,
    ctaUnlimited: '♾️ Unlimited analyses included — analyze as many profiles as you want',
    priceBadge: 'Launch offer', priceAmount: '€4.99', pricePeriod: '/ first week',
    priceThen: 'then', priceThenAmount: '€14.99 / week', priceThenSub: '· cancel anytime',
    features: ['3 full trajectories', 'Unlimited analyses', 'PDF by email', 'Secure payment', 'No commitment'],
    ctaBtn: 'Subscribe & unlock — €4.99',
    ctaNote: 'Secure payment by Stripe · SSL · Cancel anytime',
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

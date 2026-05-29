import type { QuestionAnswer } from '../types'

export const EMPTY_ANSWER: QuestionAnswer = { selectedOptions: [], freeText: '' }

export const SITUATIONS = [
  'Salarié(e)', 'Cadre / Manager', 'Fonctionnaire', 'Indépendant(e) / Freelance',
  'Entrepreneur(e)', 'Étudiant(e)', 'En reconversion', 'En recherche d\'emploi',
  'Sans activité', 'En pause professionnelle', 'Retraité(e)',
]

export const GENDERS = ['Femme', 'Homme', 'Non-binaire', 'Préfère ne pas répondre']

export const SECTORS = [
  'Technologie & Digital', 'Finance & Banque', 'Santé & Médical',
  'Éducation & Formation', 'Art & Culture', 'Commerce & Vente',
  'Industrie & Manufacturing', 'Conseil & Management', 'Droit & Justice',
  'Marketing & Communication', 'Ressources humaines', 'Agriculture & Environnement',
  'Immobilier & Construction', 'Transport & Logistique', 'Autre',
]

export const EDUCATION_LEVELS = [
  'Bac', 'Bac+2 / BTS / DUT', 'Bac+3 / Licence',
  'Bac+4 / Master 1', 'Bac+5 / Master / Ingénieur', 'Bac+8 / Doctorat',
  'Formation professionnelle', 'Autodidacte',
]

export const LANGUAGES = [
  'Français', 'Anglais', 'Espagnol', 'Allemand', 'Italien',
  'Arabe', 'Mandarin', 'Portugais', 'Japonais', 'Autre',
]

export const LOADING_MESSAGES = [
  "L'IA analyse ton parcours...",
  "Exploration de tes potentiels cachés...",
  "Construction de tes trajectoires alternatives...",
  "Calcul des scores de faisabilité...",
  "Finalisation de ton rapport personnalisé...",
]

// ── Questions Q1–Q12 ──────────────────────────────────────────────

export interface QuestionDef {
  id: string
  title: string
  subtitle?: string
  bubbles: string[]
  allowMultiple: boolean
  placeholder: string
}

export const QUESTIONS: QuestionDef[] = [
  {
    id: 'skills',
    title: "Quelles compétences avez-vous déjà, même si elles vous semblent simples ?",
    subtitle: "Même celles qui vous semblent évidentes — elles comptent.",
    bubbles: [
      'Communiquer clairement', 'Écrire', 'Vendre', 'Organiser', 'Analyser',
      'Créer du contenu', 'Gérer un projet', 'Aider les autres', 'Expliquer simplement',
      'Utiliser des outils numériques', 'Prendre la parole', 'Résoudre des problèmes',
    ],
    allowMultiple: true,
    placeholder: "Listez vos compétences, même celles qui vous semblent simples ou évidentes.",
  },
  {
    id: 'askedFor',
    title: "Les autres vous sollicitent souvent pour…",
    subtitle: "Les talents que votre entourage a remarqués chez vous.",
    bubbles: [
      'Donner des conseils', 'Expliquer quelque chose', 'Organiser un projet',
      'Relire ou corriger', 'Trouver des idées', 'Motiver les autres',
      'Résoudre un problème', 'Aider avec le numérique', 'Créer quelque chose', 'Trouver une solution pratique',
    ],
    allowMultiple: true,
    placeholder: "Pour quoi vos proches, collègues ou amis vous demandent-ils souvent de l'aide ?",
  },
  {
    id: 'energy',
    title: "Qu'est-ce qui vous donne naturellement de l'énergie ?",
    subtitle: "Ce que vous aimez faire spontanément, même sans obligation.",
    bubbles: [
      'Créer', 'Aider les autres', 'Organiser', 'Convaincre', 'Apprendre', 'Transmettre',
      'Imaginer', 'Résoudre des problèmes', 'Analyser', 'Diriger', 'Communiquer', 'Construire',
    ],
    allowMultiple: true,
    placeholder: "Qu'est-ce que vous aimez faire spontanément, même sans obligation ?",
  },
  {
    id: 'drains',
    title: "Qu'est-ce qui t'épuise ou te pèse le plus dans ta situation actuelle ?",
    subtitle: "Pour éviter de reproduire les mêmes frustrations dans ta prochaine trajectoire.",
    bubbles: [
      'La pression ou le stress', 'Le manque de sens', 'La routine', 'La hiérarchie',
      "L'instabilité ou l'incertitude", 'Le manque de liberté', 'Les tâches répétitives',
      'Le manque de reconnaissance', 'Les relations difficiles', 'Le manque de temps libre',
      "L'absence de perspectives", 'Le salaire insuffisant',
    ],
    allowMultiple: true,
    placeholder: "Décris ce qui t'épuise ou te pèse vraiment dans ta situation actuelle.",
  },
  {
    id: 'interests',
    title: "Quels domaines vous attirent naturellement ?",
    subtitle: "Vos centres d'intérêt, même non professionnels.",
    bubbles: [
      'Technologie & Digital', 'Finance & Business', 'Santé & Bien-être',
      'Éducation & Formation', 'Art & Culture', 'Sport & Nature',
      'Communication & Médias', 'Environnement', 'Accompagnement & Psychologie',
      'Immobilier & Construction', 'Voyage & International', 'Cuisine & Mode de vie',
    ],
    allowMultiple: true,
    placeholder: "Ajoutez un domaine qui vous attire, même si vous ne savez pas encore pourquoi.",
  },
  {
    id: 'motivation',
    title: "Aujourd'hui, vous avez surtout envie de…",
    subtitle: "Votre envie principale du moment — pas de bonne ou mauvaise réponse.",
    bubbles: [
      'Changer de métier', 'Évoluer dans mon domaine', 'Gagner plus',
      'Avoir plus de liberté', 'Trouver plus de sens', 'Mieux utiliser mes talents',
      'Me reconvertir progressivement', 'Créer mon activité', 'Trouver une voie plus stable',
      'Me sentir plus aligné',
    ],
    allowMultiple: true,
    placeholder: "Expliquez ce que vous aimeriez changer ou améliorer dans votre vie professionnelle.",
  },
  {
    id: 'vision5y',
    title: "Dans 5 ans, à quoi aimerais-tu que ta vie professionnelle ressemble ?",
    subtitle: "Ta vision à moyen terme — même floue, elle oriente tes trajectoires.",
    bubbles: [
      'Indépendant(e) avec mon propre projet', 'Expert(e) reconnu(e) dans mon domaine',
      'Manager ou responsable d\'équipe', 'Freelance ou consultant(e)',
      'En reconversion dans un nouveau secteur', 'Avec un travail plus équilibré',
      'À l\'international', 'Entrepreneur(e) ou fondateur(rice)',
      'Avec un impact social ou environnemental', 'Je ne sais pas encore',
    ],
    allowMultiple: true,
    placeholder: "Décris à quoi tu aimerais que ta vie professionnelle ressemble dans 5 ans.",
  },
  {
    id: 'lifestyle',
    title: "Quel rythme de vie professionnelle vous conviendrait le mieux ?",
    subtitle: "Décrivez le cadre professionnel qui vous correspond.",
    bubbles: [
      'Stable et sécurisante', 'Libre et flexible', 'Créatif et varié',
      'Ambitieux et stimulant', 'Calme et équilibré', 'Indépendant',
      'Nomade / à distance', 'Social et humain', 'Entrepreneurial', 'Utile aux autres',
    ],
    allowMultiple: true,
    placeholder: "Décrivez le rythme de vie professionnelle qui vous conviendrait le mieux.",
  },
  {
    id: 'role',
    title: "Dans ton futur travail, quel rôle aimerais-tu plutôt avoir ?",
    subtitle: "Le type de poste ou de fonction qui te correspond le mieux.",
    bubbles: [
      'Expert / spécialiste', 'Coordinateur / chef de projet',
      'Créateur / entrepreneur', 'Accompagnant / formateur',
      'Analyste / stratège', 'Dirigeant / décideur',
      'Je ne sais pas encore',
    ],
    allowMultiple: false,
    placeholder: "Décris le rôle ou la fonction que tu aimerais avoir dans ton travail.",
  },
  {
    id: 'relation',
    title: "Quel rapport aimerais-tu avoir avec ton travail ?",
    subtitle: "Ta priorité principale dans ta vie professionnelle.",
    bubbles: [
      'Sécurité et stabilité', 'Liberté et autonomie', 'Impact et utilité',
      'Créativité', 'Progression financière', 'Équilibre de vie',
      'Reconnaissance professionnelle',
    ],
    allowMultiple: true,
    placeholder: "Décris le rapport que tu aimerais avoir avec ton travail.",
  },
  {
    id: 'workEnv',
    title: "Dans quel environnement vous imaginez-vous le mieux travailler ?",
    subtitle: "Le cadre dans lequel vous vous sentiriez bien au quotidien.",
    bubbles: [
      'Télétravail', 'Hybride', 'Bureau structuré', 'Terrain / Nomade',
      'Petite équipe', 'Grande entreprise', 'Start-up / Scale-up',
      'Association / ONG', 'International', 'Indépendant',
    ],
    allowMultiple: true,
    placeholder: "Décrivez l'environnement dans lequel vous vous imaginez bien travailler.",
  },
  {
    id: 'money',
    title: "Quelle place voulez-vous donner à l'argent et à la sécurité ?",
    subtitle: "Il n'y a pas de réponse juste — soyez honnête avec vous-même.",
    bubbles: [
      'Sécurité avant tout', 'Revenus confortables', 'Hauts revenus', 'Indépendance financière',
      'Argent important mais pas prioritaire', 'Je veux surtout être aligné',
      'Je veux mieux valoriser mes compétences', "Je suis prêt à apprendre pour gagner plus",
      "Je veux éviter l'instabilité financière", 'Je veux construire un revenu évolutif',
    ],
    allowMultiple: true,
    placeholder: "Expliquez votre rapport à l'argent, au confort ou à la sécurité financière.",
  },
  {
    id: 'risk',
    title: "Quel niveau de risque êtes-vous prêt à accepter ?",
    subtitle: "Ce qui vous semble réaliste dans votre situation actuelle.",
    bubbles: [
      'Très faible', 'Faible', 'Modéré', 'Élevé', 'Très élevé',
      'Je veux avancer progressivement', 'Je veux sécuriser avant de changer',
      'Je peux tester à côté de mon activité actuelle', 'Je suis prêt à quitter ma zone de confort',
      'Je veux une transition douce',
    ],
    allowMultiple: true,
    placeholder: "Précisez ce que vous seriez prêt à changer ou non dans votre vie actuelle.",
  },
  {
    id: 'timeActivity',
    title: "Combien de temps pourrais-tu consacrer chaque semaine à préparer ta transition ?",
    subtitle: "Pour adapter le plan d'action à ta réalité concrète.",
    bubbles: [
      'Moins de 2h par semaine', '2 à 5h par semaine',
      '5 à 10h par semaine', 'Plus de 10h par semaine',
      'Je peux y consacrer du temps à plein',
    ],
    allowMultiple: false,
    placeholder: "Précise le temps que tu pourrais vraiment dégager chaque semaine.",
  },
  {
    id: 'avoidNext',
    title: "Qu'aimeriez-vous éviter dans votre prochaine trajectoire ?",
    subtitle: "Ces éléments orienteront vos résultats vers ce qui vous correspond.",
    bubbles: [
      'Trop de stress', 'Trop de routine', "Trop d'administratif", 'Trop de hiérarchie',
      "Trop d'incertitude", 'Trop peu de liberté', "Trop peu d'argent", 'Trop peu de sens',
      'Le manque de reconnaissance', "Trop d'horaires fixes", 'Trop de solitude', 'Trop de déplacements',
    ],
    allowMultiple: true,
    placeholder: "Décrivez ce que vous ne voulez surtout pas retrouver dans votre futur métier.",
  },
  {
    id: 'blocks',
    title: "Qu'est-ce qui vous manque le plus aujourd'hui pour avancer ?",
    subtitle: "Identifier votre blocage principal pour adapter le plan d'action.",
    bubbles: [
      'Une idée claire', 'De la confiance', 'Des compétences', 'Du temps', "De l'argent",
      'Un réseau', 'Une méthode', 'Une formation', 'Un accompagnement', 'Un plan concret',
    ],
    allowMultiple: true,
    placeholder: "Expliquez ce qui vous bloque ou vous ralentit aujourd'hui.",
  },
  {
    id: 'realisticPath',
    title: "Quelle trajectoire te semble la plus réaliste aujourd'hui ?",
    subtitle: "Ta perception actuelle — elle guide l'équilibre entre les 3 voies proposées.",
    bubbles: [
      'Une évolution proche de mon parcours actuel',
      'Une reconversion progressive',
      'Un changement plus ambitieux mais risqué',
      'Je ne sais pas encore',
    ],
    allowMultiple: false,
    placeholder: "Décris quelle trajectoire te semble la plus réaliste ou souhaitable.",
  },
  {
    id: 'successCriteria',
    title: "Pour toi, à quoi ressemblerait une transition réussie ?",
    subtitle: "Ta définition personnelle du succès — elle oriente les recommandations.",
    bubbles: [
      'Un meilleur salaire', 'Plus de sens au quotidien', 'Plus de liberté et d\'autonomie',
      'Un métier qui me passionne', 'Plus de temps personnel',
      'Une meilleure reconnaissance', 'Un projet qui m\'appartient',
      'La sécurité à long terme',
    ],
    allowMultiple: true,
    placeholder: "Décris ce qui ferait qu'une transition professionnelle serait vraiment réussie pour toi.",
  },
  {
    id: 'profile',
    title: "Dans quelle phrase te reconnais-tu le plus aujourd'hui ?",
    subtitle: "Ton profil dominant — pour personnaliser les recommandations.",
    bubbles: [
      'Sécuritaire — je cherche la stabilité avant tout',
      'Explorateur — je veux découvrir de nouvelles voies',
      'Créatif — je veux créer et exprimer',
      'Indépendant — je veux construire ma propre voie',
      'Analytique — j\'aime analyser et résoudre des problèmes',
      'Accompagnant — je veux aider les autres à progresser',
      'Entrepreneur — je veux développer des projets ambitieux',
      'Expert — je veux me spécialiser et exceller',
    ],
    allowMultiple: false,
    placeholder: "Décris quel profil te correspond le mieux.",
  },
  {
    id: 'transitionTest',
    title: "Pour tester une nouvelle voie sans tout quitter, vous préféreriez…",
    subtitle: "La première action réaliste pour vous.",
    bubbles: [
      'Suivre une mini-formation', 'Faire un stage court', 'Parler à des professionnels',
      'Créer un projet test', 'Lancer une petite activité à côté', 'Faire du bénévolat',
      'Créer un portfolio', 'Publier du contenu', 'Faire une mission freelance', 'Me faire accompagner',
    ],
    allowMultiple: true,
    placeholder: "Quelle serait la première manière réaliste de tester une nouvelle voie pour vous ?",
  },
]

// ── Questions adaptatives ─────────────────────────────────────────

export interface AdaptiveQuestionDef extends QuestionDef {
  condition: (answers: Record<string, { selectedOptions: string[]; freeText: string }>, situation: string) => boolean
}

export const ADAPTIVE_QUESTIONS: AdaptiveQuestionDef[] = [
  {
    id: 'adap_student',
    title: "Vous êtes encore en construction : quelle trajectoire voulez-vous explorer en priorité ?",
    bubbles: [
      'Voie stable', 'Voie créative', 'Voie entrepreneuriale', 'Voie utile aux autres',
      'Voie très rémunératrice', 'Voie internationale', 'Voie liée à mes études',
      'Voie différente de mes études', 'Voie progressive', 'Voie courte et accessible',
    ],
    allowMultiple: true,
    placeholder: "Précisez la direction qui vous attire le plus.",
    condition: (_a, s) => ['Étudiant(e)'].includes(s),
  },
  {
    id: 'adap_tech',
    title: "La technologie vous attire surtout pour…",
    bubbles: [
      'Créer des outils', 'Résoudre des problèmes', 'Aider les autres', 'Automatiser des tâches',
      'Concevoir des sites', 'Expliquer le numérique', 'Travailler à distance',
      'Lancer un projet', 'Améliorer des entreprises', 'Apprendre en continu',
    ],
    allowMultiple: true,
    placeholder: "Précisez ce qui vous attire dans la technologie.",
    condition: (a) =>
      (a['interests']?.selectedOptions ?? []).includes('Technologie & Digital') ||
      (a['skills']?.selectedOptions ?? []).includes('Utiliser des outils numériques'),
  },
  {
    id: 'adap_sport',
    title: "Dans le sport et la nature, qu'est-ce qui vous attire le plus ?",
    bubbles: [
      'Pratiquer', 'Transmettre', 'Coacher', 'Organiser des événements',
      'Travailler avec des clubs', 'Vendre des services sportifs', 'Créer du contenu sport',
      'Accompagner des sportifs', 'Développer une marque sport', 'Créer une communauté',
    ],
    allowMultiple: true,
    placeholder: "Décrivez ce que vous aimeriez faire dans le domaine du sport ou de la nature.",
    condition: (a) => (a['interests']?.selectedOptions ?? []).includes('Sport & Nature'),
  },
  {
    id: 'adap_writing',
    title: "Vous aimeriez utiliser la communication et l'écriture pour…",
    bubbles: [
      'Informer', 'Vulgariser', 'Raconter', 'Convaincre', 'Créer du contenu',
      'Aider les autres', 'Écrire pour des marques', 'Écrire pour le web',
      'Écrire sur un sujet passion', 'Construire un média',
    ],
    allowMultiple: true,
    placeholder: "Précisez comment vous aimeriez utiliser la communication ou l'écriture.",
    condition: (a) =>
      (a['interests']?.selectedOptions ?? []).includes('Communication & Médias') ||
      (a['skills']?.selectedOptions ?? []).includes('Écrire') ||
      (a['energy']?.selectedOptions ?? []).includes('Communiquer'),
  },
  {
    id: 'adap_help',
    title: "Vous préférez aider les autres en…",
    bubbles: [
      'Conseillant', 'Écoutant', 'Formant', 'Accompagnant', 'Orientant', 'Motivant',
      'Simplifiant leurs problèmes', 'Créant des ressources utiles',
      'Travaillant dans le social', 'Travaillant dans la santé ou le bien-être',
    ],
    allowMultiple: true,
    placeholder: "Décrivez comment vous aimeriez aider les autres.",
    condition: (a) =>
      (a['energy']?.selectedOptions ?? []).some((s) => ['Aider les autres', 'Transmettre'].includes(s)) ||
      (a['interests']?.selectedOptions ?? []).some((s) =>
        ['Santé & Bien-être', 'Accompagnement & Psychologie', 'Éducation & Formation'].includes(s)
      ),
  },
  {
    id: 'adap_finance',
    title: "La finance et le business vous attirent surtout pour…",
    bubbles: [
      'Investir', "Créer ou gérer une entreprise", 'Analyser les marchés',
      'Gérer mon propre argent', 'Accompagner des entrepreneurs',
      'Conseiller en gestion', "Construire un patrimoine", "Comprendre l'économie",
      'Lever des fonds', 'Créer des produits financiers',
    ],
    allowMultiple: true,
    placeholder: "Précisez ce qui vous attire dans la finance ou le business.",
    condition: (a) => (a['interests']?.selectedOptions ?? []).includes('Finance & Business'),
  },
  {
    id: 'adap_entrepreneur',
    title: "Si vous lanciez votre activité, ce serait plutôt…",
    bubbles: [
      'Un service à la personne', 'Une formation ou du coaching', 'Un produit physique',
      'Un produit digital / SaaS', 'Un média ou du contenu', 'Un commerce',
      "Une agence ou un studio", 'Une startup à forte croissance',
      'Un projet à impact social', 'Une activité freelance',
    ],
    allowMultiple: true,
    placeholder: "Décrivez le type de projet ou d'activité que vous aimeriez lancer.",
    condition: (a) =>
      (a['motivation']?.selectedOptions ?? []).includes('Créer mon activité') ||
      (a['lifestyle']?.selectedOptions ?? []).some((s) => ['Entrepreneurial', 'Indépendant'].includes(s)),
  },
  {
    id: 'adap_money',
    title: "Pour augmenter vos revenus, vous seriez prêt à…",
    bubbles: [
      'Me former sérieusement', 'Changer de secteur', 'Prendre plus de responsabilités',
      'Faire du commercial', 'Me spécialiser', 'Tester une activité indépendante',
      'Travailler plus intensément temporairement', 'Développer un réseau',
      'Créer une offre', 'Chercher un poste mieux valorisé',
    ],
    allowMultiple: true,
    placeholder: "Précisez ce que vous seriez prêt à faire pour augmenter vos revenus.",
    condition: (a) =>
      (a['motivation']?.selectedOptions ?? []).includes('Gagner plus') ||
      (a['money']?.selectedOptions ?? []).some((s) =>
        ['Hauts revenus', 'Indépendance financière', "Je suis prêt à apprendre pour gagner plus"].includes(s)
      ),
  },
]

export function getAdaptiveQuestions(
  answers: Record<string, { selectedOptions: string[]; freeText: string }>,
  situation: string
): AdaptiveQuestionDef[] {
  return ADAPTIVE_QUESTIONS.filter((q) => q.condition(answers, situation)).slice(0, 4)
}

// ── Données localisées ────────────────────────────────────────────

import type { Lang } from '../lib/i18n/translations'
import {
  SITUATIONS_EN, GENDERS_EN, SECTORS_EN, EDUCATION_LEVELS_EN,
  LOADING_MESSAGES_EN, QUESTIONS_EN, ADAPTIVE_QUESTIONS_EN,
} from '../lib/i18n/onboarding-en'

export function getLocalizedData(lang: Lang) {
  if (lang === 'en') {
    return {
      SITUATIONS:      SITUATIONS_EN,
      GENDERS:         GENDERS_EN,
      SECTORS:         SECTORS_EN,
      EDUCATION_LEVELS: EDUCATION_LEVELS_EN,
      LANGUAGES,
      LOADING_MESSAGES: LOADING_MESSAGES_EN,
      QUESTIONS:       QUESTIONS_EN,
      getAdaptiveQuestions: (
        answers: Record<string, { selectedOptions: string[]; freeText: string }>,
        situation: string
      ) => ADAPTIVE_QUESTIONS_EN.filter((q) => q.condition(answers, situation)).slice(0, 4),
    }
  }
  return {
    SITUATIONS, GENDERS, SECTORS, EDUCATION_LEVELS, LANGUAGES,
    LOADING_MESSAGES, QUESTIONS,
    getAdaptiveQuestions,
  }
}

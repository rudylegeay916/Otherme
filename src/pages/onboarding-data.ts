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

// ── Questions Q1–Q20 ──────────────────────────────────────────────

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
    id: 'motivation',
    title: "Aujourd'hui, vous avez surtout envie de…",
    subtitle: "Votre envie principale du moment — pas de bonne ou mauvaise réponse.",
    bubbles: [
      'Changer de métier', 'Évoluer dans mon domaine', 'Gagner plus',
      'Avoir plus de liberté', 'Trouver plus de sens', 'Mieux utiliser mes talents',
      'Me reconvertir progressivement', 'Créer mon activité', 'Trouver une voie plus stable',
      'Explorer plusieurs options', 'Me sentir plus aligné', 'Sortir de la routine',
    ],
    allowMultiple: true,
    placeholder: "Expliquez ce que vous aimeriez changer ou améliorer dans votre vie professionnelle.",
  },
  {
    id: 'lifestyle',
    title: "Quel type de vie professionnelle vous attire le plus ?",
    subtitle: "Décrivez le rythme de vie qui vous conviendrait.",
    bubbles: [
      'Stable et sécurisante', 'Libre et flexible', 'Créative', 'Ambitieuse',
      'Calme et équilibrée', 'Intense et stimulante', 'Indépendante', 'Nomade / à distance',
      'Sociale et humaine', 'Structurée', 'Entrepreneuriale', 'Utile aux autres', 'Bien rémunérée',
    ],
    allowMultiple: true,
    placeholder: "Décrivez le rythme de vie professionnelle qui vous conviendrait le mieux.",
  },
  {
    id: 'energy',
    title: "Qu'est-ce qui vous donne naturellement de l'énergie ?",
    subtitle: "Ce que vous aimez faire spontanément, même sans obligation.",
    bubbles: [
      'Créer', 'Aider', 'Organiser', 'Convaincre', 'Apprendre', 'Transmettre',
      'Imaginer', 'Résoudre des problèmes', 'Analyser', 'Diriger', 'Communiquer',
      'Construire', 'Explorer', 'Conseiller', 'Rassembler les gens',
    ],
    allowMultiple: true,
    placeholder: "Qu'est-ce que vous aimez faire spontanément, même sans obligation ?",
  },
  {
    id: 'drains',
    title: "Qu'est-ce qui vous fatigue ou vous démotive rapidement ?",
    subtitle: "Ces éléments seront évités dans vos trajectoires.",
    bubbles: [
      'La routine', 'Les tâches répétitives', 'Le manque de liberté', 'La pression constante',
      'Les réunions inutiles', 'Le manque de sens', 'Le manque de reconnaissance',
      'Trop de solitude', 'Trop de contact humain', "L'instabilité", 'Les conflits',
      'Le flou permanent', "L'administratif", 'Le management trop rigide',
    ],
    allowMultiple: true,
    placeholder: "Précisez ce qui vous épuise ou vous bloque dans le travail.",
  },
  {
    id: 'interests',
    title: "Dans quels domaines avez-vous naturellement de l'intérêt ?",
    subtitle: "Vos centres d'intérêt, même non professionnels.",
    bubbles: [
      'Sport', 'Voyage', 'Technologie', 'Finance', 'Santé', 'Bien-être', 'Éducation',
      'Psychologie', 'Jeux vidéo', 'Mode', 'Beauté', 'Environnement', 'Culture',
      'Art', 'Musique', 'Cuisine', 'Business', 'Immobilier', 'Communication', 'Social / humanitaire',
    ],
    allowMultiple: true,
    placeholder: "Ajoutez un domaine qui vous attire, même si vous ne savez pas encore pourquoi.",
  },
  {
    id: 'skills',
    title: "Quelles compétences pensez-vous déjà avoir ?",
    subtitle: "Même celles qui vous semblent simples ou évidentes.",
    bubbles: [
      'Communiquer clairement', 'Écrire', 'Vendre', 'Organiser', 'Analyser',
      'Créer du contenu', 'Gérer un projet', 'Aider les autres', 'Expliquer simplement',
      'Négocier', 'Utiliser des outils numériques', 'Travailler en équipe',
      'Prendre la parole', 'Gérer des clients', 'Résoudre des problèmes', 'Être rigoureux',
    ],
    allowMultiple: true,
    placeholder: "Listez vos compétences, même celles qui vous semblent simples ou évidentes.",
  },
  {
    id: 'askedFor',
    title: "Les autres vous sollicitent souvent pour…",
    subtitle: "Les talents que votre entourage a remarqués.",
    bubbles: [
      'Donner des conseils', 'Expliquer quelque chose', 'Organiser un projet',
      'Relire ou corriger', 'Trouver des idées', 'Motiver les autres', 'Résoudre un problème',
      'Aider avec le numérique', 'Gérer une situation stressante', 'Prendre une décision',
      'Créer quelque chose', 'Comprendre une personne', 'Préparer un document',
      'Améliorer une présentation', 'Trouver une solution pratique',
    ],
    allowMultiple: true,
    placeholder: "Pour quoi vos proches, collègues ou amis vous demandent-ils souvent de l'aide ?",
  },
  {
    id: 'profile',
    title: "Quelle phrase vous ressemble le plus ?",
    subtitle: "Un seul choix possible — faites confiance à votre instinct.",
    bubbles: [
      "J'aime comprendre comment les choses fonctionnent",
      "J'aime aider les autres à avancer",
      "J'aime créer des choses concrètes",
      "J'aime convaincre et embarquer les gens",
      "J'aime organiser et structurer",
      "J'aime apprendre puis transmettre",
      "J'aime imaginer de nouvelles idées",
      "J'aime améliorer ce qui existe déjà",
      "J'aime résoudre des problèmes",
      "J'aime être autonome",
      "J'aime travailler avec des personnes",
      "J'aime avoir des objectifs clairs",
      "J'aime explorer plusieurs pistes",
      "J'aime transformer une idée en projet",
    ],
    allowMultiple: false,
    placeholder: "Décrivez en une phrase ce qui vous ressemble le plus.",
  },
  {
    id: 'workEnv',
    title: "Quel environnement de travail vous conviendrait le mieux ?",
    subtitle: "Le cadre dans lequel vous vous imaginez bien travailler.",
    bubbles: [
      'Télétravail', 'Hybride', 'Bureau structuré', 'Terrain', 'Nomade',
      'Petite équipe', 'Grande entreprise', 'Start-up', 'Association', 'Indépendant',
      'International', 'Créatif', 'Calme', 'Dynamique', 'Au contact du public', 'Avec peu de hiérarchie',
    ],
    allowMultiple: true,
    placeholder: "Décrivez l'environnement dans lequel vous vous imaginez bien travailler.",
  },
  {
    id: 'money',
    title: "Quelle place voulez-vous donner à l'argent dans votre trajectoire ?",
    subtitle: "Il n'y a pas de réponse juste — soyez honnête avec vous-même.",
    bubbles: [
      'Sécurité avant tout', 'Revenus confortables', 'Hauts revenus', 'Indépendance financière',
      'Argent important mais pas prioritaire', 'Je veux surtout être aligné',
      'Je veux mieux valoriser mes compétences', "Je suis prêt à apprendre pour gagner plus",
      "Je veux éviter l'instabilité financière", 'Je veux construire un revenu évolutif',
      'Je préfère progresser lentement mais sûrement', 'Je suis prêt à prendre des risques mesurés',
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
      'Je veux une transition douce', 'Je veux une reconversion rapide', 'Je veux éviter de tout recommencer',
    ],
    allowMultiple: true,
    placeholder: "Précisez ce que vous seriez prêt à changer ou non dans votre vie actuelle.",
  },
  {
    id: 'timeActivity',
    title: "Si vous pouviez consacrer plus de temps à une activité, ce serait…",
    subtitle: "Vos passions exploitables professionnellement.",
    bubbles: [
      'Créer du contenu', 'Faire du sport', 'Voyager', 'Apprendre', 'Écrire',
      'Aider les autres', 'Lancer un projet', 'Enseigner', 'Cuisiner', 'Créer visuellement',
      'Faire de la vidéo', 'Lire / rechercher', 'Investir / gérer de l\'argent',
      "Participer à des événements", 'Construire une communauté', 'Travailler avec les animaux ou la nature',
    ],
    allowMultiple: true,
    placeholder: "Quelle activité aimeriez-vous voir prendre plus de place dans votre vie ?",
  },
  {
    id: 'vision5y',
    title: "Dans 5 ans, vous aimeriez surtout avoir…",
    subtitle: "Décrivez votre vie idéale dans 5 ans, même de manière imparfaite.",
    bubbles: [
      'Plus de liberté', 'Plus de stabilité', "Plus d'argent", 'Plus de temps',
      'Plus de sens', 'Plus de reconnaissance', 'Plus de créativité', "Plus d'impact",
      "Plus d'équilibre", "Plus d'autonomie", 'Une activité à moi', 'Un meilleur cadre de vie',
      'Un métier plus utile', 'Une expertise reconnue',
    ],
    allowMultiple: true,
    placeholder: "Décrivez votre vie idéale dans 5 ans, même de manière imparfaite.",
  },
  {
    id: 'successCriteria',
    title: "Qu'est-ce qui vous ferait dire : \"ce métier est fait pour moi\" ?",
    subtitle: "Vos critères personnels de réussite professionnelle.",
    bubbles: [
      'Je me sens utile', 'Je gagne correctement ma vie', "J'apprends souvent",
      'Je suis libre dans mon organisation', 'Je suis reconnu', 'Je peux créer',
      'Je ne m\'ennuie pas', 'Je peux aider les autres', 'Je travaille avec des gens intéressants',
      'Je peux évoluer', 'Je garde un bon équilibre de vie', "J'en suis fier",
      'Je vois des résultats concrets', 'Je peux travailler d\'où je veux',
    ],
    allowMultiple: true,
    placeholder: "Qu'est-ce qui vous ferait sentir que vous êtes sur la bonne voie ?",
  },
  {
    id: 'avoidNext',
    title: "Qu'aimeriez-vous éviter dans votre prochaine trajectoire ?",
    subtitle: "Ces éléments seront filtrés dans vos résultats.",
    bubbles: [
      'Trop de stress', 'Trop de routine', 'Trop d\'administratif', 'Trop de hiérarchie',
      "Trop d'incertitude", 'Trop de solitude', 'Trop de relation client', 'Trop peu de liberté',
      "Trop peu d'argent", 'Trop peu de sens', 'Trop de formation longue',
      'Trop de pression commerciale', 'Trop de déplacements', "Trop d'horaires fixes",
    ],
    allowMultiple: true,
    placeholder: "Décrivez ce que vous ne voulez surtout pas retrouver dans votre futur métier.",
  },
  {
    id: 'transitionTest',
    title: "Pour tester une nouvelle voie sans tout quitter, vous préféreriez…",
    subtitle: "La première action réaliste pour vous.",
    bubbles: [
      'Suivre une mini-formation', 'Faire un stage court', 'Parler à des professionnels',
      'Créer un projet test', 'Lancer une petite activité à côté', 'Faire du bénévolat',
      'Créer un portfolio', 'Publier du contenu', 'Faire une mission freelance',
      'Chercher une alternance', 'Reprendre des études progressivement',
      'Tester pendant les week-ends', 'Demander une immersion', 'Me faire accompagner',
    ],
    allowMultiple: true,
    placeholder: "Quelle serait la première manière réaliste de tester une nouvelle voie pour vous ?",
  },
  {
    id: 'relation',
    title: "Quelle relation voulez-vous avoir avec les autres dans votre futur métier ?",
    subtitle: "La part de relationnel qui vous convient naturellement.",
    bubbles: [
      'Beaucoup de contact humain', 'Un peu de relationnel', 'Peu de contact direct',
      'Accompagner les autres', 'Conseiller', 'Enseigner', 'Vendre', 'Animer une communauté',
      'Travailler en équipe', 'Travailler surtout seul', 'Manager', 'Aider des clients',
      'Être au service d\'un public', 'Créer pour les autres',
    ],
    allowMultiple: true,
    placeholder: "Décrivez le type de relation humaine qui vous conviendrait dans un métier.",
  },
  {
    id: 'role',
    title: "Quel rôle aimeriez-vous jouer dans un projet ?",
    subtitle: "Votre posture professionnelle naturelle.",
    bubbles: [
      'Celui qui imagine', 'Celui qui organise', 'Celui qui exécute concrètement',
      'Celui qui vend', 'Celui qui explique', 'Celui qui conseille', 'Celui qui analyse',
      'Celui qui dirige', 'Celui qui améliore', 'Celui qui crée le contenu',
      "Celui qui coordonne l'équipe", 'Celui qui résout les problèmes',
      'Celui qui accompagne', 'Celui qui met en relation',
    ],
    allowMultiple: false,
    placeholder: "Dans un projet, quel rôle prenez-vous naturellement ?",
  },
  {
    id: 'blocks',
    title: "Qu'est-ce qui vous manque le plus aujourd'hui pour avancer ?",
    subtitle: "Identifier votre blocage principal pour adapter le plan d'action.",
    bubbles: [
      'Une idée claire', 'De la confiance', 'Des compétences', 'Du temps', "De l'argent",
      'Un réseau', 'Une méthode', 'Une formation', 'Un accompagnement', 'Un premier projet',
      'Une première expérience', 'Un portfolio', 'Une validation extérieure', 'Un plan concret',
    ],
    allowMultiple: true,
    placeholder: "Expliquez ce qui vous bloque ou vous ralentit aujourd'hui.",
  },
  {
    id: 'realisticPath',
    title: "Quelle trajectoire vous semble la plus réaliste pour commencer ?",
    subtitle: "Sans jugement — juste votre point de départ réel.",
    bubbles: [
      'Évoluer dans mon métier actuel', 'Changer de secteur sans changer de métier',
      'Changer progressivement de métier', 'Tester une activité à côté',
      'Me former pendant quelques mois', 'Chercher un poste junior',
      'Me lancer en indépendant plus tard', 'Créer un projet personnel',
      'Reprendre des études', 'Faire une alternance', 'Trouver un mentor',
      'Explorer plusieurs options avant de choisir',
    ],
    allowMultiple: true,
    placeholder: "Décrivez le chemin qui vous semble le plus réaliste pour commencer.",
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
    id: 'adap_employee',
    title: "Aujourd'hui, vous voulez plutôt…",
    bubbles: [
      'Évoluer dans mon domaine', 'Changer de secteur', 'Changer de métier',
      'Gagner en autonomie', 'Me rapprocher de mes passions', 'Me spécialiser',
      'Devenir indépendant', 'Trouver plus de sens', 'Gagner davantage', "Avoir un meilleur équilibre",
    ],
    allowMultiple: true,
    placeholder: "Précisez votre priorité du moment.",
    condition: (_a, s) => ['Salarié(e)', 'Cadre / Manager', 'Fonctionnaire'].includes(s),
  },
  {
    id: 'adap_reconversion',
    title: "Quelle forme de reconversion vous semble la plus réaliste ?",
    bubbles: [
      'Progressive', 'Rapide', 'Sécurisée', 'Ambitieuse', "À côté de mon travail actuel",
      'Avec une formation courte', 'Avec une formation longue', 'Avec un accompagnement',
      'Par un projet personnel', 'Par une première mission test',
    ],
    allowMultiple: true,
    placeholder: "Décrivez la forme de reconversion qui vous convient.",
    condition: (a, s) =>
      s === 'En reconversion' ||
      (a['realisticPath']?.selectedOptions ?? []).includes('Changer progressivement de métier'),
  },
  {
    id: 'adap_sport',
    title: "Dans le sport, qu'est-ce qui vous attire le plus ?",
    bubbles: [
      'Pratiquer', 'Transmettre', 'Coacher', 'Organiser des événements',
      'Travailler avec des clubs', 'Vendre des services sportifs', 'Créer du contenu sport',
      'Accompagner des sportifs', 'Développer une marque sport', 'Créer une communauté',
    ],
    allowMultiple: true,
    placeholder: "Décrivez ce que vous aimeriez faire dans le domaine du sport.",
    condition: (a) => (a['interests']?.selectedOptions ?? []).includes('Sport'),
  },
  {
    id: 'adap_writing',
    title: "Vous aimeriez utiliser l'écriture pour…",
    bubbles: [
      'Informer', 'Vulgariser', 'Raconter', 'Convaincre', 'Créer du contenu',
      'Aider les autres', 'Écrire pour des marques', 'Écrire pour le web',
      'Écrire sur un sujet passion', 'Construire un média',
    ],
    allowMultiple: true,
    placeholder: "Précisez comment vous aimeriez utiliser l'écriture.",
    condition: (a) =>
      (a['interests']?.selectedOptions ?? []).includes('Écriture') ||
      (a['energy']?.selectedOptions ?? []).includes('Écrire') ||
      (a['skills']?.selectedOptions ?? []).includes('Écrire') ||
      (a['timeActivity']?.selectedOptions ?? []).includes('Écrire'),
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
      (a['energy']?.selectedOptions ?? []).some((s) => ['Aider', 'Conseiller', 'Transmettre'].includes(s)),
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
      (a['interests']?.selectedOptions ?? []).includes('Technologie') ||
      (a['skills']?.selectedOptions ?? []).includes('Utiliser des outils numériques'),
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

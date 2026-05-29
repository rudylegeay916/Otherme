import type { QuestionDef, AdaptiveQuestionDef } from '../../pages/onboarding-data'

export const SITUATIONS_EN: string[] = [
  'Employee', 'Manager / Executive', 'Civil Servant', 'Freelancer / Independent',
  'Entrepreneur', 'Student', 'Career changer', 'Job seeker',
  'Not working', 'On a career break', 'Retired',
]

export const GENDERS_EN: string[] = ['Woman', 'Man', 'Non-binary', 'Prefer not to say']

export const SECTORS_EN: string[] = [
  'Technology & Digital', 'Finance & Banking', 'Health & Medical',
  'Education & Training', 'Arts & Culture', 'Retail & Sales',
  'Industry & Manufacturing', 'Consulting & Management', 'Law & Justice',
  'Marketing & Communications', 'Human Resources', 'Agriculture & Environment',
  'Real Estate & Construction', 'Transport & Logistics', 'Other',
]

export const EDUCATION_LEVELS_EN: string[] = [
  'High school diploma', 'Associate degree / 2-year degree', "Bachelor's degree",
  "Bachelor's degree + 1 year", "Master's degree / Engineering degree", 'PhD / Doctorate',
  'Vocational training', 'Self-taught',
]

export const LOADING_MESSAGES_EN: string[] = [
  'AI is analyzing your career path...',
  'Exploring your hidden potential...',
  'Building your alternative trajectories...',
  'Calculating feasibility scores...',
  'Finalizing your personalized report...',
]

export const QUESTIONS_EN: QuestionDef[] = [
  {
    id: 'skills',
    title: 'Which skills do you already have, even if they seem simple to you?',
    subtitle: 'Even the ones that feel obvious — they matter.',
    bubbles: [
      'Communicating clearly', 'Writing', 'Selling', 'Organizing', 'Analyzing',
      'Creating content', 'Managing a project', 'Helping others', 'Explaining simply',
      'Using digital tools', 'Public speaking', 'Solving problems',
    ],
    allowMultiple: true,
    placeholder: 'List your skills, even the ones that seem simple or obvious to you.',
  },
  {
    id: 'askedFor',
    title: 'People often come to you for…',
    subtitle: 'Talents your circle has noticed in you.',
    bubbles: [
      'Giving advice', 'Explaining something', 'Organizing a project',
      'Proofreading or editing', 'Coming up with ideas', 'Motivating others',
      'Solving a problem', 'Help with tech', 'Creating something', 'Finding a practical solution',
    ],
    allowMultiple: true,
    placeholder: 'What do your friends, colleagues, or family often ask for your help with?',
  },
  {
    id: 'energy',
    title: 'What naturally gives you energy?',
    subtitle: 'Things you love doing spontaneously, even without any obligation.',
    bubbles: [
      'Creating', 'Helping others', 'Organizing', 'Persuading', 'Learning', 'Teaching',
      'Imagining', 'Solving problems', 'Analyzing', 'Leading', 'Communicating', 'Building',
    ],
    allowMultiple: true,
    placeholder: 'What do you love doing spontaneously, even without any obligation?',
  },
  {
    id: 'drains',
    title: 'What exhausts or weighs on you most in your current situation?',
    subtitle: 'To avoid recreating the same frustrations in your next path.',
    bubbles: [
      'Pressure or stress', 'Lack of meaning', 'Routine', 'Hierarchy',
      'Instability or uncertainty', 'Lack of freedom', 'Repetitive tasks',
      'Lack of recognition', 'Difficult relationships', 'Lack of personal time',
      'No career prospects', 'Insufficient pay',
    ],
    allowMultiple: true,
    placeholder: 'Describe what truly exhausts or weighs on you in your current situation.',
  },
  {
    id: 'interests',
    title: 'Which areas are you naturally drawn to?',
    subtitle: 'Your interests — even non-professional ones.',
    bubbles: [
      'Technology & Digital', 'Finance & Business', 'Health & Wellness',
      'Education & Training', 'Art & Culture', 'Sport & Nature',
      'Communication & Media', 'Environment', 'Coaching & Psychology',
      'Real Estate & Construction', 'Travel & International', 'Food & Lifestyle',
    ],
    allowMultiple: true,
    placeholder: "Add a field that attracts you, even if you're not sure why yet.",
  },
  {
    id: 'motivation',
    title: 'Right now, what you want most is to…',
    subtitle: 'Your main desire at this moment — there are no right or wrong answers.',
    bubbles: [
      'Change careers', 'Grow within my field', 'Earn more',
      'Have more freedom', 'Find more meaning', 'Make better use of my talents',
      'Transition gradually', 'Start my own venture', 'Find a more stable path',
      'Feel more aligned',
    ],
    allowMultiple: true,
    placeholder: 'Describe what you would like to change or improve in your professional life.',
  },
  {
    id: 'vision5y',
    title: 'In 5 years, what would you like your professional life to look like?',
    subtitle: 'Your medium-term vision — even a vague one helps shape the trajectories.',
    bubbles: [
      'Independent with my own project', 'Recognized expert in my field',
      'Manager or team leader', 'Freelancer or consultant',
      'Having pivoted to a new sector', 'With a better work-life balance',
      'Working internationally', 'Entrepreneur or founder',
      'With social or environmental impact', "I don't know yet",
    ],
    allowMultiple: true,
    placeholder: "Describe what you'd like your professional life to look like in 5 years.",
  },
  {
    id: 'lifestyle',
    title: 'What professional pace would suit you best?',
    subtitle: 'Describe the professional setting that fits you.',
    bubbles: [
      'Stable and secure', 'Free and flexible', 'Creative and varied',
      'Ambitious and stimulating', 'Calm and balanced', 'Independent',
      'Remote / nomadic', 'Social and people-focused', 'Entrepreneurial', 'Serving others',
    ],
    allowMultiple: true,
    placeholder: 'Describe the professional lifestyle that would suit you best.',
  },
  {
    id: 'role',
    title: 'In your future work, which role would you prefer?',
    subtitle: 'The type of position or function that suits you best.',
    bubbles: [
      'Expert / specialist', 'Coordinator / project manager',
      'Creator / entrepreneur', 'Coach / trainer',
      'Analyst / strategist', 'Leader / decision-maker',
      "I don't know yet",
    ],
    allowMultiple: false,
    placeholder: "Describe the role or function you'd like to have in your work.",
  },
  {
    id: 'relation',
    title: 'What relationship would you like to have with your work?',
    subtitle: 'Your main priority in your professional life.',
    bubbles: [
      'Security and stability', 'Freedom and autonomy', 'Impact and purpose',
      'Creativity', 'Financial progression', 'Work-life balance',
      'Professional recognition',
    ],
    allowMultiple: true,
    placeholder: "Describe the relationship you'd like to have with your work.",
  },
  {
    id: 'workEnv',
    title: 'In which environment do you picture yourself working best?',
    subtitle: 'The setting in which you would feel good day-to-day.',
    bubbles: [
      'Remote', 'Hybrid', 'Traditional office', 'On the ground / nomadic',
      'Small team', 'Large company', 'Start-up / Scale-up',
      'Non-profit / NGO', 'International', 'Self-employed',
    ],
    allowMultiple: true,
    placeholder: 'Describe the environment in which you can picture yourself working well.',
  },
  {
    id: 'money',
    title: 'What role do you want money and security to play in your path?',
    subtitle: "There's no right answer — just be honest with yourself.",
    bubbles: [
      'Security above all', 'Comfortable income', 'High earnings', 'Financial independence',
      "Money matters but isn't my top priority", 'I mainly want to feel aligned',
      'I want my skills to be better rewarded', "I'm willing to upskill to earn more",
      'I want to avoid financial instability', 'I want to build a growing income',
    ],
    allowMultiple: true,
    placeholder: 'Describe your relationship with money, comfort, or financial security.',
  },
  {
    id: 'risk',
    title: 'What level of risk are you willing to accept?',
    subtitle: 'What feels realistic given your current situation.',
    bubbles: [
      'Very low', 'Low', 'Moderate', 'High', 'Very high',
      'I want to move forward gradually', 'I want stability before making changes',
      "I can test things alongside my current job", "I'm ready to step outside my comfort zone",
      'I want a smooth transition',
    ],
    allowMultiple: true,
    placeholder: 'Describe what you would or would not be willing to change in your current life.',
  },
  {
    id: 'timeActivity',
    title: 'How much time could you dedicate each week to preparing a transition?',
    subtitle: 'To tailor the action plan to your real-life situation.',
    bubbles: [
      'Less than 2 hours per week', '2 to 5 hours per week',
      '5 to 10 hours per week', 'More than 10 hours per week',
      'I can dedicate full time to it',
    ],
    allowMultiple: false,
    placeholder: 'Be honest about how much time you could realistically free up each week.',
  },
  {
    id: 'avoidNext',
    title: 'What would you like to avoid in your next career path?',
    subtitle: 'These elements will guide your results toward what suits you.',
    bubbles: [
      'Too much stress', 'Too much routine', 'Too much admin', 'Too much hierarchy',
      'Too much uncertainty', 'Too little freedom', 'Too little pay', 'Too little meaning',
      'Lack of recognition', 'Too many fixed hours', 'Too much solitude', 'Too much travel',
    ],
    allowMultiple: true,
    placeholder: "Describe what you absolutely don't want to find in your future career.",
  },
  {
    id: 'blocks',
    title: 'What do you feel is most missing today to move forward?',
    subtitle: 'Identifying your main obstacle helps tailor your action plan.',
    bubbles: [
      'A clear idea', 'Confidence', 'Skills', 'Time', 'Money',
      'A network', 'A method', 'Training', 'Coaching', 'A concrete plan',
    ],
    allowMultiple: true,
    placeholder: 'Describe what is blocking or slowing you down right now.',
  },
  {
    id: 'realisticPath',
    title: 'Which trajectory seems most realistic to you today?',
    subtitle: 'Your current perception — it guides the balance between the 3 proposed paths.',
    bubbles: [
      'An evolution close to my current background',
      'A gradual career change',
      'A more ambitious but riskier shift',
      "I don't know yet",
    ],
    allowMultiple: false,
    placeholder: 'Describe which trajectory feels most realistic or desirable to you.',
  },
  {
    id: 'successCriteria',
    title: 'For you, what would a successful transition look like?',
    subtitle: 'Your personal definition of success — it shapes the recommendations.',
    bubbles: [
      'A better salary', 'More meaning day-to-day', 'More freedom and autonomy',
      'A career I\'m passionate about', 'More personal time',
      'Better recognition', 'A project that belongs to me',
      'Long-term security',
    ],
    allowMultiple: true,
    placeholder: 'Describe what would make a professional transition truly successful for you.',
  },
  {
    id: 'profile',
    title: 'Which phrase resonates with you most today?',
    subtitle: 'Your dominant profile — to personalise the recommendations.',
    bubbles: [
      'Security-seeking — I want stability above all',
      'Explorer — I want to discover new paths',
      'Creative — I want to create and express',
      'Independent — I want to build my own way',
      'Analytical — I love analyzing and solving problems',
      'Supportive — I want to help others grow',
      'Entrepreneur — I want to build ambitious projects',
      'Expert — I want to specialize and excel',
    ],
    allowMultiple: false,
    placeholder: 'Describe which profile fits you best.',
  },
  {
    id: 'transitionTest',
    title: 'To test a new path without quitting everything, you would prefer to…',
    subtitle: 'The first realistic action step for you.',
    bubbles: [
      'Take a short course', 'Do a brief internship', 'Talk to professionals in the field',
      'Build a test project', 'Start a small side activity', 'Volunteer',
      'Build a portfolio', 'Publish content', 'Take on a freelance mission', 'Get coaching',
    ],
    allowMultiple: true,
    placeholder: 'What would be the first realistic way for you to test a new direction?',
  },
]

export const ADAPTIVE_QUESTIONS_EN: AdaptiveQuestionDef[] = [
  {
    id: 'adap_student',
    title: "You're still building your path: which direction do you want to explore first?",
    bubbles: [
      'A stable path', 'A creative path', 'An entrepreneurial path', 'A path that serves others',
      'A high-earning path', 'An international path', 'A path related to my studies',
      'A path different from my studies', 'A gradual path', 'A short and accessible path',
    ],
    allowMultiple: true,
    placeholder: 'Describe the direction that appeals to you most.',
    condition: (_a, s) => ['Étudiant(e)'].includes(s),
  },
  {
    id: 'adap_tech',
    title: 'Technology appeals to you mainly for…',
    bubbles: [
      'Building tools', 'Solving problems', 'Helping others', 'Automating tasks',
      'Designing websites', 'Making tech accessible', 'Working remotely',
      'Launching a project', 'Improving businesses', 'Continuous learning',
    ],
    allowMultiple: true,
    placeholder: 'Describe what draws you to technology.',
    condition: (a) =>
      (a['interests']?.selectedOptions ?? []).includes('Technologie & Digital') ||
      (a['skills']?.selectedOptions ?? []).includes('Utiliser des outils numériques'),
  },
  {
    id: 'adap_sport',
    title: 'In sport and nature, what appeals to you most?',
    bubbles: [
      'Practicing', 'Teaching', 'Coaching', 'Organizing events',
      'Working with clubs', 'Selling sports services', 'Creating sport content',
      'Supporting athletes', 'Developing a sports brand', 'Building a community',
    ],
    allowMultiple: true,
    placeholder: 'Describe what you would like to do in the world of sport or nature.',
    condition: (a) => (a['interests']?.selectedOptions ?? []).includes('Sport & Nature'),
  },
  {
    id: 'adap_writing',
    title: 'You would like to use communication and writing to…',
    bubbles: [
      'Inform', 'Simplify complex topics', 'Tell stories', 'Persuade', 'Create content',
      'Help others', 'Write for brands', 'Write for the web',
      'Write about a passion topic', 'Build a media outlet',
    ],
    allowMultiple: true,
    placeholder: 'Describe how you would like to use communication or writing.',
    condition: (a) =>
      (a['interests']?.selectedOptions ?? []).includes('Communication & Médias') ||
      (a['skills']?.selectedOptions ?? []).includes('Écrire') ||
      (a['energy']?.selectedOptions ?? []).includes('Communiquer'),
  },
  {
    id: 'adap_help',
    title: 'You prefer to help others by…',
    bubbles: [
      'Advising', 'Listening', 'Training', 'Coaching', 'Guiding', 'Motivating',
      'Simplifying their problems', 'Creating useful resources',
      'Working in the social sector', 'Working in health or wellness',
    ],
    allowMultiple: true,
    placeholder: 'Describe how you would like to help others.',
    condition: (a) =>
      (a['energy']?.selectedOptions ?? []).some((s) => ['Aider les autres', 'Transmettre'].includes(s)) ||
      (a['interests']?.selectedOptions ?? []).some((s) =>
        ['Santé & Bien-être', 'Accompagnement & Psychologie', 'Éducation & Formation'].includes(s)
      ),
  },
  {
    id: 'adap_finance',
    title: 'Finance and business attract you mainly for…',
    bubbles: [
      'Investing', 'Creating or running a business', 'Analyzing markets',
      'Managing my own money', 'Supporting entrepreneurs',
      'Financial consulting', 'Building wealth', 'Understanding the economy',
      'Fundraising', 'Creating financial products',
    ],
    allowMultiple: true,
    placeholder: 'Describe what draws you to finance or business.',
    condition: (a) => (a['interests']?.selectedOptions ?? []).includes('Finance & Business'),
  },
  {
    id: 'adap_entrepreneur',
    title: 'If you launched your own venture, it would most likely be…',
    bubbles: [
      'A personal service', 'Training or coaching', 'A physical product',
      'A digital product / SaaS', 'A media or content brand', 'A retail business',
      'An agency or studio', 'A startup with growth ambitions',
      'A social impact project', 'Freelance work',
    ],
    allowMultiple: true,
    placeholder: 'Describe the type of project or venture you would like to launch.',
    condition: (a) =>
      (a['motivation']?.selectedOptions ?? []).includes('Créer mon activité') ||
      (a['lifestyle']?.selectedOptions ?? []).some((s) => ['Entrepreneurial', 'Indépendant'].includes(s)),
  },
  {
    id: 'adap_money',
    title: 'To increase your income, you would be willing to…',
    bubbles: [
      'Seriously upskill', 'Change industry', 'Take on more responsibilities',
      'Do sales work', 'Specialize', 'Try freelancing',
      'Work more intensely for a period', 'Grow my network',
      'Create an offer or service', 'Find a better-paid position',
    ],
    allowMultiple: true,
    placeholder: 'Describe what you would be willing to do to increase your income.',
    condition: (a) =>
      (a['motivation']?.selectedOptions ?? []).includes('Gagner plus') ||
      (a['money']?.selectedOptions ?? []).some((s) =>
        ['Hauts revenus', 'Indépendance financière', "Je suis prêt à apprendre pour gagner plus"].includes(s)
      ),
  },
]

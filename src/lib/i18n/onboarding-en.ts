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
    id: 'motivation',
    title: 'Right now, what you want most is to…',
    subtitle: 'Your main desire at this moment — there are no right or wrong answers.',
    bubbles: [
      'Change careers', 'Grow within my field', 'Earn more',
      'Have more freedom', 'Find more meaning', 'Make better use of my talents',
      'Transition gradually', 'Start my own venture', 'Find a more stable path',
      'Explore multiple options', 'Feel more aligned', 'Break out of the routine',
    ],
    allowMultiple: true,
    placeholder: 'Describe what you would like to change or improve in your professional life.',
  },
  {
    id: 'lifestyle',
    title: 'What kind of professional life appeals to you most?',
    subtitle: 'Describe the work rhythm that would suit you.',
    bubbles: [
      'Stable and secure', 'Free and flexible', 'Creative', 'Ambitious',
      'Calm and balanced', 'Intense and stimulating', 'Independent', 'Remote / nomadic',
      'People-focused', 'Structured', 'Entrepreneurial', 'Serving others', 'Well paid',
    ],
    allowMultiple: true,
    placeholder: 'Describe the professional lifestyle that would suit you best.',
  },
  {
    id: 'energy',
    title: 'What naturally gives you energy?',
    subtitle: 'Things you love doing spontaneously, even without any obligation.',
    bubbles: [
      'Creating', 'Helping', 'Organizing', 'Persuading', 'Learning', 'Teaching',
      'Imagining', 'Solving problems', 'Analyzing', 'Leading', 'Communicating',
      'Building', 'Exploring', 'Advising', 'Bringing people together',
    ],
    allowMultiple: true,
    placeholder: 'What do you love doing spontaneously, even without any obligation?',
  },
  {
    id: 'drains',
    title: 'What drains or demotivates you quickly?',
    subtitle: 'These elements will be avoided in your suggested trajectories.',
    bubbles: [
      'Routine', 'Repetitive tasks', 'Lack of freedom', 'Constant pressure',
      'Pointless meetings', 'Lack of meaning', 'Lack of recognition',
      'Too much solitude', 'Too much human contact', 'Instability', 'Conflict',
      'Constant ambiguity', 'Admin work', 'Overly rigid management',
    ],
    allowMultiple: true,
    placeholder: 'Describe what exhausts you or holds you back at work.',
  },
  {
    id: 'interests',
    title: 'Which areas are you naturally drawn to?',
    subtitle: 'Your interests — even non-professional ones.',
    bubbles: [
      'Sport', 'Travel', 'Technology', 'Finance', 'Health', 'Wellness', 'Education',
      'Psychology', 'Video games', 'Fashion', 'Beauty', 'Environment', 'Culture',
      'Art', 'Music', 'Cooking', 'Business', 'Real estate', 'Communication', 'Social / humanitarian',
    ],
    allowMultiple: true,
    placeholder: 'Add a field that attracts you, even if you\'re not sure why yet.',
  },
  {
    id: 'skills',
    title: 'Which skills do you already feel you have?',
    subtitle: 'Even the ones that seem simple or obvious to you.',
    bubbles: [
      'Communicating clearly', 'Writing', 'Selling', 'Organizing', 'Analyzing',
      'Creating content', 'Managing a project', 'Helping others', 'Explaining simply',
      'Negotiating', 'Using digital tools', 'Working in a team',
      'Public speaking', 'Managing clients', 'Solving problems', 'Being thorough',
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
      'Proofreading or editing', 'Coming up with ideas', 'Motivating others', 'Solving a problem',
      'Help with tech', 'Handling a stressful situation', 'Making a decision',
      'Creating something', 'Understanding a person', 'Preparing a document',
      'Improving a presentation', 'Finding a practical solution',
    ],
    allowMultiple: true,
    placeholder: 'What do your friends, colleagues, or family often ask for your help with?',
  },
  {
    id: 'profile',
    title: 'Which phrase describes you best?',
    subtitle: 'One choice only — trust your instinct.',
    bubbles: [
      'I like understanding how things work',
      'I like helping others move forward',
      'I like creating tangible things',
      'I like convincing and bringing people on board',
      'I like organizing and structuring',
      'I like learning and then sharing knowledge',
      'I like coming up with new ideas',
      'I like improving what already exists',
      'I like solving problems',
      'I like being autonomous',
      'I like working with people',
      'I like having clear goals',
      'I like exploring different directions',
      'I like turning an idea into a project',
    ],
    allowMultiple: false,
    placeholder: 'Describe in one sentence what fits you best.',
  },
  {
    id: 'workEnv',
    title: 'What work environment would suit you best?',
    subtitle: 'The setting in which you can picture yourself working well.',
    bubbles: [
      'Remote', 'Hybrid', 'Traditional office', 'On the ground / in the field', 'Nomadic',
      'Small team', 'Large company', 'Start-up', 'Non-profit', 'Self-employed',
      'International', 'Creative', 'Calm', 'Dynamic', 'Client-facing', 'Flat hierarchy',
    ],
    allowMultiple: true,
    placeholder: 'Describe the environment in which you can picture yourself working well.',
  },
  {
    id: 'money',
    title: 'What role do you want money to play in your future path?',
    subtitle: 'There\'s no right answer — just be honest with yourself.',
    bubbles: [
      'Security above all', 'Comfortable income', 'High earnings', 'Financial independence',
      'Money matters but isn\'t my top priority', 'I mainly want to feel aligned',
      'I want my skills to be better rewarded', 'I\'m willing to upskill to earn more',
      'I want to avoid financial instability', 'I want to build a growing income',
      'I prefer steady progress over big leaps', 'I\'m willing to take calculated risks',
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
      'I can test things alongside my current job', 'I\'m ready to step outside my comfort zone',
      'I want a smooth transition', 'I want a fast career change', 'I want to avoid starting from scratch',
    ],
    allowMultiple: true,
    placeholder: 'Describe what you would or would not be willing to change in your current life.',
  },
  {
    id: 'timeActivity',
    title: 'If you could spend more time on one activity, it would be…',
    subtitle: 'Your passions that could potentially become professional.',
    bubbles: [
      'Creating content', 'Playing sport', 'Traveling', 'Learning', 'Writing',
      'Helping others', 'Launching a project', 'Teaching', 'Cooking', 'Creating visuals',
      'Making videos', 'Reading / researching', 'Investing / managing money',
      'Attending events', 'Building a community', 'Working with animals or nature',
    ],
    allowMultiple: true,
    placeholder: 'Which activity would you like to take up more space in your life?',
  },
  {
    id: 'vision5y',
    title: 'In 5 years, you would most like to have…',
    subtitle: 'Describe your ideal life in 5 years, even if imperfectly.',
    bubbles: [
      'More freedom', 'More stability', 'More money', 'More time',
      'More meaning', 'More recognition', 'More creativity', 'More impact',
      'More balance', 'More autonomy', 'My own venture', 'A better quality of life',
      'A more purposeful career', 'Recognized expertise',
    ],
    allowMultiple: true,
    placeholder: 'Describe your ideal life in 5 years, even if imperfectly.',
  },
  {
    id: 'successCriteria',
    title: 'What would make you say: "this job is made for me"?',
    subtitle: 'Your personal criteria for professional fulfillment.',
    bubbles: [
      'I feel useful', 'I earn a good living', 'I keep learning',
      'I\'m free to organize my time', 'I\'m recognized', 'I get to create',
      'I\'m never bored', 'I can help others', 'I work with interesting people',
      'I can grow', 'I maintain a healthy work-life balance', 'I\'m proud of what I do',
      'I see concrete results', 'I can work from anywhere',
    ],
    allowMultiple: true,
    placeholder: 'What would make you feel like you\'re on the right track?',
  },
  {
    id: 'avoidNext',
    title: 'What would you like to avoid in your next career path?',
    subtitle: 'These elements will be filtered out of your results.',
    bubbles: [
      'Too much stress', 'Too much routine', 'Too much admin', 'Too much hierarchy',
      'Too much uncertainty', 'Too much solitude', 'Too much client interaction', 'Too little freedom',
      'Too little pay', 'Too little meaning', 'Too long a training period',
      'Too much sales pressure', 'Too much travel', 'Too many fixed hours',
    ],
    allowMultiple: true,
    placeholder: 'Describe what you absolutely don\'t want to find in your future career.',
  },
  {
    id: 'transitionTest',
    title: 'To test a new path without quitting everything, you would prefer to…',
    subtitle: 'The first realistic action step for you.',
    bubbles: [
      'Take a short course', 'Do a brief internship', 'Talk to professionals in the field',
      'Build a test project', 'Start a small side activity', 'Volunteer',
      'Build a portfolio', 'Publish content', 'Take on a freelance mission',
      'Look for an apprenticeship', 'Go back to studying gradually',
      'Test things on weekends', 'Request a job shadow', 'Get coaching',
    ],
    allowMultiple: true,
    placeholder: 'What would be the first realistic way for you to test a new direction?',
  },
  {
    id: 'relation',
    title: 'What kind of relationship with others do you want in your future career?',
    subtitle: 'The level of human interaction that naturally suits you.',
    bubbles: [
      'Lots of human contact', 'Some interaction', 'Minimal direct contact',
      'Supporting others', 'Advising', 'Teaching', 'Selling', 'Running a community',
      'Working in a team', 'Mostly working alone', 'Managing people', 'Serving clients',
      'Serving a wider audience', 'Creating for others',
    ],
    allowMultiple: true,
    placeholder: 'Describe the type of human relationship that would suit you in a career.',
  },
  {
    id: 'role',
    title: 'What role would you like to play in a project?',
    subtitle: 'Your natural professional posture.',
    bubbles: [
      'The one who imagines', 'The one who organizes', 'The one who executes',
      'The one who sells', 'The one who explains', 'The one who advises', 'The one who analyzes',
      'The one who leads', 'The one who improves', 'The one who creates the content',
      'The one who coordinates the team', 'The one who solves problems',
      'The one who supports', 'The one who connects people',
    ],
    allowMultiple: false,
    placeholder: 'In a project, what role do you naturally take on?',
  },
  {
    id: 'blocks',
    title: 'What do you feel is most missing today to move forward?',
    subtitle: 'Identifying your main obstacle helps tailor your action plan.',
    bubbles: [
      'A clear idea', 'Confidence', 'Skills', 'Time', 'Money',
      'A network', 'A method', 'Training', 'Coaching', 'A first project',
      'A first experience', 'A portfolio', 'External validation', 'A concrete plan',
    ],
    allowMultiple: true,
    placeholder: 'Describe what is blocking or slowing you down right now.',
  },
  {
    id: 'realisticPath',
    title: 'Which path seems most realistic for you to start with?',
    subtitle: 'No judgment — just your real starting point.',
    bubbles: [
      'Grow within my current role', 'Change industry without changing job type',
      'Gradually change careers', 'Test a side activity',
      'Get trained over a few months', 'Look for a junior position',
      'Go freelance later on', 'Build a personal project',
      'Go back to school', 'Do an apprenticeship', 'Find a mentor',
      'Explore several options before committing',
    ],
    allowMultiple: true,
    placeholder: 'Describe the path that seems most realistic for you to start with.',
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
    id: 'adap_employee',
    title: 'Right now, what you mainly want is to…',
    bubbles: [
      'Grow within my field', 'Change industry', 'Change careers',
      'Gain more autonomy', 'Get closer to my passions', 'Specialize',
      'Go freelance', 'Find more meaning', 'Earn more', 'Achieve a better work-life balance',
    ],
    allowMultiple: true,
    placeholder: 'Describe your top priority right now.',
    condition: (_a, s) => ['Salarié(e)', 'Cadre / Manager', 'Fonctionnaire'].includes(s),
  },
  {
    id: 'adap_reconversion',
    title: 'What form of career change seems most realistic to you?',
    bubbles: [
      'Gradual', 'Fast', 'Secure', 'Ambitious', 'Alongside my current job',
      'With a short course', 'With a longer program', 'With coaching support',
      'Through a personal project', 'Through a first test mission',
    ],
    allowMultiple: true,
    placeholder: 'Describe the type of career change that works for you.',
    condition: (a, s) =>
      s === 'En reconversion' ||
      (a['realisticPath']?.selectedOptions ?? []).includes('Changer progressivement de métier'),
  },
  {
    id: 'adap_sport',
    title: 'In sport, what appeals to you most?',
    bubbles: [
      'Practicing', 'Teaching', 'Coaching', 'Organizing events',
      'Working with clubs', 'Selling sports services', 'Creating sport content',
      'Supporting athletes', 'Developing a sports brand', 'Building a community',
    ],
    allowMultiple: true,
    placeholder: 'Describe what you would like to do in the world of sport.',
    condition: (a) => (a['interests']?.selectedOptions ?? []).includes('Sport'),
  },
  {
    id: 'adap_writing',
    title: 'You would like to use writing to…',
    bubbles: [
      'Inform', 'Simplify complex topics', 'Tell stories', 'Persuade', 'Create content',
      'Help others', 'Write for brands', 'Write for the web',
      'Write about a passion topic', 'Build a media outlet',
    ],
    allowMultiple: true,
    placeholder: 'Describe how you would like to use writing.',
    condition: (a) =>
      (a['interests']?.selectedOptions ?? []).includes('Écriture') ||
      (a['energy']?.selectedOptions ?? []).includes('Écrire') ||
      (a['skills']?.selectedOptions ?? []).includes('Écrire') ||
      (a['timeActivity']?.selectedOptions ?? []).includes('Écrire'),
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
      (a['energy']?.selectedOptions ?? []).some((s) => ['Aider', 'Conseiller', 'Transmettre'].includes(s)),
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
      (a['interests']?.selectedOptions ?? []).includes('Technologie') ||
      (a['skills']?.selectedOptions ?? []).includes('Utiliser des outils numériques'),
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

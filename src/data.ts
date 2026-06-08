import { VocabularyItem, DialogueNode, ScrambledSentence, ErrorSentence, RoutineActivity } from './types';

export const VOCABULARY_ITEMS: VocabularyItem[] = [
  {
    phrase: 'brush my teeth',
    example: 'My doctor said I need to brush my teeth twice every day.',
    translationExplain: 'To clean teeth using a toothbrush and toothpaste.',
    category: 'health',
    imagePlaceholderColor: '#feebc8' // light amber
  },
  {
    phrase: 'watch TV',
    example: 'I like dramas, so I watch TV at night.',
    translationExplain: 'To look at television programs or broadcast channels.',
    category: 'leisure',
    imagePlaceholderColor: '#fed7d7' // light red
  },
  {
    phrase: 'go jogging',
    example: 'I go jogging every morning to stay healthy.',
    translationExplain: 'To run at a gentle, steady pace as a form of physical exercise.',
    category: 'health',
    imagePlaceholderColor: '#c6f6d5' // light green
  },
  {
    phrase: 'study',
    example: 'I am a student, so I study every day.',
    translationExplain: 'To acquire knowledge on a subject through reading or research.',
    category: 'study',
    imagePlaceholderColor: '#e9d8fd' // light purple
  },
  {
    phrase: 'go to work',
    example: 'Do you go to work or are you a student?',
    translationExplain: 'To travel or commute to ones occupational workplace.',
    category: 'work',
    imagePlaceholderColor: '#bef264' // lime-200
  },
  {
    phrase: 'cook',
    example: 'I don’t have a big kitchen, so I don’t cook often.',
    translationExplain: 'To prepare food or meals by combining and heating ingredients.',
    category: 'leisure',
    imagePlaceholderColor: '#fda4af' // rose-300
  },
  {
    phrase: 'sleep',
    example: 'I sleep from 11pm to about 7am.',
    translationExplain: 'To rest in a natural state of sleep at night or during bedtime.',
    category: 'sleep',
    imagePlaceholderColor: '#93c5fd' // blue-300
  },
  {
    phrase: 'read',
    example: 'I read a book at night to help me relax.',
    translationExplain: 'To look at and comprehend written text from a book or digital screen.',
    category: 'leisure',
    imagePlaceholderColor: '#a5f3fc' // cyan-200
  }
];

export const DIALOGUE_CHATS: DialogueNode[] = [
  {
    id: 'd1',
    character: 'Maya',
    text: 'So Rohan, what do you do every day?',
    translationExplain: 'Asking about another person’s daily habits using the Present Simple.',
    timeOfDay: 'morning'
  },
  {
    id: 'd2',
    character: 'Rohan',
    text: 'Hmm, a lot! In the mornings I cook breakfast and brush my teeth of course, and I go jogging too. After, I take a bus and go to work.',
    translationExplain: 'Rohan describes three consecutive routines in his morning and his daily commute.',
    timeOfDay: 'morning'
  },
  {
    id: 'd3',
    character: 'Rohan',
    text: 'What about you?',
    translationExplain: 'A brief, conversational way to turn the question back to the other speaker.',
    timeOfDay: 'morning'
  },
  {
    id: 'd4',
    character: 'Maya',
    text: 'Well, I’m a student, so I don’t go to work. I study in the mornings, and in the afternoon I read a book or watch TV. I sleep quite late.',
    translationExplain: 'Maya uses negative "don’t go to work" since she is a student, and outlines her study/leisure schedule.',
    timeOfDay: 'afternoon'
  },
  {
    id: 'd5',
    character: 'Rohan',
    text: 'Oh, I sleep quite early! I like to wake up before 6am.',
    translationExplain: 'Rohan compares his early bedtime and morning alarm with Maya’s late bedtime.',
    timeOfDay: 'night'
  }
];

export const VOCABULARY_GAP_QUESTIONS = [
  {
    id: 1,
    sentence: "My doctor said I need to ____________ twice every day.",
    correctAnswer: "brush my teeth",
    options: ["brush my teeth", "cook", "study", "go to work"]
  },
  {
    id: 2,
    sentence: "I ____________ from 11pm to about 7am.",
    correctAnswer: "sleep",
    options: ["read", "sleep", "go jogging", "watch TV"]
  },
  {
    id: 3,
    sentence: "Do you ____________ or are you a student?",
    correctAnswer: "go to work",
    options: ["go jogging", "brush my teeth", "go to work", "cook"]
  },
  {
    id: 4,
    sentence: "I ____________ every morning to stay healthy.",
    correctAnswer: "go jogging",
    options: ["sleep", "go to work", "read", "go jogging"]
  },
  {
    id: 5,
    sentence: "I am a student, so I ____________ every day.",
    correctAnswer: "study",
    options: ["study", "go to work", "watch TV", "cook"]
  },
  {
    id: 6,
    sentence: "I ____________ a book at night to help me relax.",
    correctAnswer: "read",
    options: ["sleep", "cook", "read", "go to work"]
  },
  {
    id: 7,
    sentence: "I like dramas, so I ____________ at night.",
    correctAnswer: "watch TV",
    options: ["study", "watch TV", "brush my teeth", "sleep"]
  },
  {
    id: 8,
    sentence: "I don’t have a big kitchen, so I don’t ____________ often.",
    correctAnswer: "cook",
    options: ["cook", "go jogging", "read", "study"]
  }
];

export const SCRAMBLED_SENTENCES: ScrambledSentence[] = [
  {
    id: 1,
    scrambledWords: ['watch', 'TV', 'every', 'morning', 'I'],
    correctSentence: 'I watch TV every morning.',
    hint: 'Start with the subject "I", then the action verb "watch", object "TV", and finally the time expression "every morning".'
  },
  {
    id: 2,
    scrambledWords: ['I', 'at', 'night', 'read', 'a', 'book'],
    correctSentence: 'I read a book at night.',
    hint: 'Subject is "I", verb is "read", followed by the object "a book", and the time setting "at night".'
  },
  {
    id: 3,
    scrambledWords: ['brush', 'my', 'teeth', 'I', 'in', 'the', 'morning'],
    correctSentence: 'I brush my teeth in the morning.',
    hint: 'Subject "I" goes first. The routine verb is "brush", followed by its object and then "in the morning".'
  },
  {
    id: 4,
    scrambledWords: ['I', 'cook', 'don’t', 'at', 'the', 'weekend'],
    correctSentence: 'I don’t cook at the weekend.',
    hint: 'Remember: negative marker "don’t" sits right before the primary verb "cook".'
  }
];

export const ERROR_SENTENCES: ErrorSentence[] = [
  {
    id: 1,
    incorrect: 'I my teeth in the morning.',
    correct: 'I brush my teeth in the morning.',
    explanation: 'The sentence is missing the action verb "brush". A complete present simple routine sentence needs Noun + Verb + Object.',
    hint: 'What action do you perform on your teeth? Think of the primary vocabulary verb.'
  },
  {
    id: 2,
    incorrect: 'I read don’t at the weekend.',
    correct: 'I don’t read at the weekend.',
    explanation: 'To express a negative action, the word "don’t" (do not) must be placed directly BEFORE the principal action verb ("read"), not after it.',
    hint: 'The pattern is: Noun/Pronoun + don’t + Verb.'
  },
  {
    id: 3,
    incorrect: 'I every day study.',
    correct: 'I study every day.',
    explanation: 'Frequency/time expressions like "every day" are normally placed at the end of the sentence. The primary verb ("study") must directly follow the subject "I".',
    hint: 'Move the time phrase "every day" to the absolute end of the sentence.'
  }
];

// Reference Schedules for D3.js plotting
export const ROHAN_ROUTINE: RoutineActivity[] = [
  { id: 'r1', phrase: 'sleep', startTime: 0, duration: 5.5, category: 'sleep' },
  { id: 'r2', phrase: 'brush my teeth', startTime: 5.5, duration: 0.5, category: 'health' },
  { id: 'r3', phrase: 'cook', startTime: 6, duration: 1, category: 'leisure' },
  { id: 'r4', phrase: 'go jogging', startTime: 7, duration: 1, category: 'health' },
  { id: 'r5', phrase: 'go to work', startTime: 9, duration: 8, category: 'work' },
  { id: 'r6', phrase: 'read', startTime: 18, duration: 1.5, category: 'leisure' },
  { id: 'r7', phrase: 'cook', startTime: 19.5, duration: 1, category: 'leisure' },
  { id: 'r8', phrase: 'sleep', startTime: 21.5, duration: 2.5, category: 'sleep' }
];

export const MAYA_ROUTINE: RoutineActivity[] = [
  { id: 'm1', phrase: 'sleep', startTime: 0, duration: 8, category: 'sleep' },
  { id: 'm2', phrase: 'brush my teeth', startTime: 8, duration: 0.5, category: 'health' },
  { id: 'm3', phrase: 'study', startTime: 9, duration: 4, category: 'study' },
  { id: 'm4', phrase: 'cook', startTime: 13, duration: 1, category: 'leisure' },
  { id: 'm5', phrase: 'read', startTime: 14.5, duration: 2, category: 'leisure' },
  { id: 'm6', phrase: 'watch TV', startTime: 16.5, duration: 3.5, category: 'leisure' },
  { id: 'm7', phrase: 'study', startTime: 20, duration: 2, category: 'study' },
  { id: 'm8', phrase: 'sleep', startTime: 22, duration: 2, category: 'sleep' }
];

export const INITIAL_USER_ROUTINE: RoutineActivity[] = [
  { id: 'u1', phrase: 'sleep', startTime: 0, duration: 7, category: 'sleep' },
  { id: 'u2', phrase: 'brush my teeth', startTime: 7, duration: 1, category: 'health' },
  { id: 'u3', phrase: 'study', startTime: 8, duration: 2, category: 'study' },
  { id: 'u4', phrase: 'go to work', startTime: 10, duration: 4, category: 'work' },
  { id: 'u5', phrase: 'cook', startTime: 14, duration: 1, category: 'leisure' },
  { id: 'u6', phrase: 'watch TV', startTime: 18, duration: 2, category: 'leisure' },
  { id: 'u7', phrase: 'read', startTime: 20, duration: 2, category: 'leisure' },
  { id: 'u8', phrase: 'sleep', startTime: 22, duration: 2, category: 'sleep' }
];

export type SessionMode = 'spark' | 'standard' | 'deep'; // 5 min, 15 min, 45 min

export interface VocabWord {
  id: string;
  term: string;
  translation: string;
  category: 'psychology' | 'emotional' | 'tv-slang' | 'conversational' | 'daily-life';
  contextSource?: string; // e.g. "TV: Valeria", "Podcast: Entiende Tu Mente", "Neighbor"
  exampleSentence: string;
  exampleTranslation: string;
  psychologyInsight?: string;
  personalReflectionPrompt?: string;
  masteryLevel: number;
  lastReviewed?: string;
  dateAdded: string;
  tags: string[];
  notes?: string;
}

export interface CommonWord {
  rank: number;
  word: string;
  translation: string;
  partOfSpeech: 'verb' | 'noun' | 'adjective' | 'adverb' | 'pronoun' | 'preposition' | 'conjunction' | 'other';
  exampleSentence: string;
  exampleTranslation: string;
}

export interface SRSCard {
  id: string;
  front: string;
  back: string;
  exampleSentence?: string;
  exampleTranslation?: string;
  source: 'top1000' | 'custom' | 'imported';
  rank?: number;
  interval: number;
  easeFactor: number;
  nextReview: string;
  lastReview?: string;
  state: 'new' | 'learning' | 'review';
  reviewCount: number;
  category?: string;
}

export type PronounKey = 'yo' | 'tu' | 'el' | 'nosotros' | 'vosotros' | 'ellos';

export type TenseKey = 'presente' | 'preterito' | 'imperfecto' | 'futuro' | 'subjuntivo';

export interface VerbConjugationTense {
  yo: string;
  tu: string;
  el: string;
  nosotros: string;
  vosotros: string;
  ellos: string;
}

export interface VerbData {
  infinitive: string;
  english: string;
  type: 'irregular' | 'regular-ar' | 'regular-er' | 'regular-ir' | 'stem-changing';
  hint?: string;
  tenses: {
    presente: VerbConjugationTense;
    preterito: VerbConjugationTense;
    imperfecto: VerbConjugationTense;
    futuro: VerbConjugationTense;
    subjuntivo: VerbConjugationTense;
  };
}

export interface ConjugationLevel {
  id: number;
  titleEn: string;
  titleEs: string;
  subtitleEn: string;
  subtitleEs: string;
  verbs: string[];
  tenses: TenseKey[];
  conceptIntroEn: string;
  conceptIntroEs: string;
  tipEn: string;
  tipEs: string;
}

export interface GrammarRule {
  label: string;
  labelEs: string;
  explanation: string;
  explanationEs: string;
  examples: Array<{
    es: string;
    en: string;
  }>;
}

export interface GrammarQuizQuestion {
  question: string;
  questionEs: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  explanationEs: string;
}

export interface GrammarTopic {
  id: string;
  title: string;
  titleEs: string;
  subtitle: string;
  subtitleEs: string;
  category: 'essential' | 'intermediate' | 'nuance';
  mentalModel: string;
  mentalModelEs: string;
  rules: GrammarRule[];
  comparison?: Array<{
    caseA: string;
    caseB: string;
    meaningA: string;
    meaningB: string;
  }>;
  quiz: GrammarQuizQuestion[];
}

export interface JournalEntry {
  id: string;
  date: string;
  rawText: string;
  polishedText?: string;
  polishExplanation?: string;
  extractedVocab?: Array<{
    term: string;
    meaning: string;
  }>;
  aiFeedback?: string;
  mood?: string;
  timeSpentMinutes?: number;
}

export interface MediaSnippet {
  id: string;
  sourceTitle: string;
  rawText: string;
  breakdown: Array<{
    phrase: string;
    literal: string;
    natural: string;
    nuance: string;
  }>;
  culturalNote?: string;
  dateAnalyzed: string;
}

export interface GeneratedStory {
  id: string;
  title: string;
  spanishText: string;
  englishSummary: string;
  targetWordsUsed: string[];
  comprehensionQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  dateCreated: string;
}

export interface UserProgress {
  currentStreak: number;
  lastActiveDate: string;
  totalDaysCompleted: number;
  completedToday: boolean;
  minutesSpentToday: number;
  favoriteWordsCount: number;
  masteredCommonWords: number[]; // Array of word ranks (1-1000)
  completedGrammarTopics: string[]; // Topic IDs
}

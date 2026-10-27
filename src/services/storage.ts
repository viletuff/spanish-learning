import { STARTER_CURIOSITIES } from '../data/starterCuriosities';
import { GeneratedStory, JournalEntry, MediaSnippet, SRSCard, UserProgress, VocabWord } from '../types';

const STORAGE_KEYS = {
  VOCAB: 'chispas_vocab_v1',
  JOURNAL: 'chispas_journal_v1',
  PROGRESS: 'chispas_progress_v1',
  MEDIA: 'chispas_media_v1',
  STORIES: 'chispas_stories_v1',
  API_KEY: 'chispas_gemini_key_v1',
  USER_PREFS: 'chispas_prefs_v1',
  MASTERED_1000: 'chispas_mastered_1000_v1',
  GRAMMAR_PROGRESS: 'chispas_grammar_prog_v1',
  SRS_CARDS: 'chispas_srs_cards_v1',
  CONJUGATION_LEVEL: 'chispas_conj_level_v1',
  COMPLETED_TABLES: 'chispas_conj_tables_v1',
};

export interface UserPrefs {
  playbackRate: number;
  autoSpeakTranslation: boolean;
  theme: 'warm-paper' | 'night-library';
}

const DEFAULT_PREFS: UserPrefs = {
  playbackRate: 0.9,
  autoSpeakTranslation: false,
  theme: 'warm-paper',
};

const getTodayDateStr = () => new Date().toISOString().split('T')[0];

export const storageService = {
  getVocab(): VocabWord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VOCAB);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.VOCAB, JSON.stringify(STARTER_CURIOSITIES));
        return STARTER_CURIOSITIES;
      }
      return JSON.parse(data);
    } catch {
      return STARTER_CURIOSITIES;
    }
  },

  saveVocab(words: VocabWord[]): void {
    localStorage.setItem(STORAGE_KEYS.VOCAB, JSON.stringify(words));
  },

  addVocabWord(word: Omit<VocabWord, 'id' | 'dateAdded'>): VocabWord {
    const words = this.getVocab();
    const newWord: VocabWord = {
      ...word,
      id: 'vocab-' + Date.now(),
      dateAdded: getTodayDateStr(),
    };
    const updated = [newWord, ...words];
    this.saveVocab(updated);
    return newWord;
  },

  updateVocabWord(id: string, updates: Partial<VocabWord>): void {
    const words = this.getVocab();
    const index = words.findIndex(w => w.id === id);
    if (index !== -1) {
      words[index] = { ...words[index], ...updates };
      this.saveVocab(words);
    }
  },

  deleteVocabWord(id: string): void {
    const words = this.getVocab().filter(w => w.id !== id);
    this.saveVocab(words);
  },

  getWordReviewStates(): Record<number, 'again' | 'okay' | 'mastered'> {
    try {
      const data = localStorage.getItem('chispas_word_states_1000_v1');
      if (data) return JSON.parse(data);
      const oldMastered = this.getMasteredCommonWords();
      const initial: Record<number, 'again' | 'okay' | 'mastered'> = {};
      oldMastered.forEach((r) => {
        initial[r] = 'mastered';
      });
      return initial;
    } catch {
      return {};
    }
  },

  setWordReviewState(rank: number, state: 'again' | 'okay' | 'mastered'): void {
    const states = this.getWordReviewStates();
    states[rank] = state;
    localStorage.setItem('chispas_word_states_1000_v1', JSON.stringify(states));

    const currentMastered = Object.keys(states)
      .filter((k) => states[Number(k)] === 'mastered')
      .map(Number);
    localStorage.setItem(STORAGE_KEYS.MASTERED_1000, JSON.stringify(currentMastered));
  },

  getMasteredCommonWords(): number[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MASTERED_1000);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  toggleMasterCommonWord(rank: number): boolean {
    const current = this.getMasteredCommonWords();
    let isMastered = false;
    let updated: number[];
    if (current.includes(rank)) {
      updated = current.filter(r => r !== rank);
      isMastered = false;
    } else {
      updated = [...current, rank];
      isMastered = true;
    }
    localStorage.setItem(STORAGE_KEYS.MASTERED_1000, JSON.stringify(updated));
    return isMastered;
  },

  getCompletedGrammarTopics(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GRAMMAR_PROGRESS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  markGrammarTopicCompleted(topicId: string): void {
    const current = this.getCompletedGrammarTopics();
    if (!current.includes(topicId)) {
      const updated = [...current, topicId];
      localStorage.setItem(STORAGE_KEYS.GRAMMAR_PROGRESS, JSON.stringify(updated));
      this.recordDailyActivity(10);
    }
  },

  getJournalEntries(): JournalEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.JOURNAL);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveJournalEntry(entry: Omit<JournalEntry, 'id'>): JournalEntry {
    const entries = this.getJournalEntries();
    const newEntry: JournalEntry = {
      ...entry,
      id: 'journal-' + Date.now(),
    };
    const updated = [newEntry, ...entries];
    localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(updated));
    this.recordDailyActivity(entry.timeSpentMinutes || 5);
    return newEntry;
  },

  getProgress(): UserProgress {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      const today = getTodayDateStr();
      const masteredWords = this.getMasteredCommonWords();
      const completedGrammar = this.getCompletedGrammarTopics();

      if (!data) {
        return {
          currentStreak: 1,
          lastActiveDate: today,
          totalDaysCompleted: 1,
          completedToday: false,
          minutesSpentToday: 0,
          favoriteWordsCount: STARTER_CURIOSITIES.length,
          masteredCommonWords: masteredWords,
          completedGrammarTopics: completedGrammar,
        };
      }
      const parsed: UserProgress = JSON.parse(data);
      if (parsed.lastActiveDate !== today) {
        parsed.completedToday = false;
        parsed.minutesSpentToday = 0;
      }
      parsed.masteredCommonWords = masteredWords;
      parsed.completedGrammarTopics = completedGrammar;
      return parsed;
    } catch {
      return {
        currentStreak: 1,
        lastActiveDate: getTodayDateStr(),
        totalDaysCompleted: 1,
        completedToday: false,
        minutesSpentToday: 0,
        favoriteWordsCount: 0,
        masteredCommonWords: [],
        completedGrammarTopics: [],
      };
    }
  },

  recordDailyActivity(minutes: number): UserProgress {
    const progress = this.getProgress();
    const today = getTodayDateStr();

    if (progress.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (progress.lastActiveDate === yesterday) {
        progress.currentStreak += 1;
      } else {
        progress.currentStreak = 1;
      }
      progress.lastActiveDate = today;
      progress.totalDaysCompleted += 1;
      progress.minutesSpentToday = minutes;
    } else {
      progress.minutesSpentToday += minutes;
    }

    progress.completedToday = true;
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    return progress;
  },

  getMediaSnippets(): MediaSnippet[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEDIA);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveMediaSnippet(snippet: Omit<MediaSnippet, 'id' | 'dateAnalyzed'>): MediaSnippet {
    const items = this.getMediaSnippets();
    const newItem: MediaSnippet = {
      ...snippet,
      id: 'media-' + Date.now(),
      dateAnalyzed: getTodayDateStr(),
    };
    const updated = [newItem, ...items];
    localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(updated));
    return newItem;
  },

  getStories(): GeneratedStory[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STORIES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveStory(story: GeneratedStory): void {
    const stories = this.getStories();
    const updated = [story, ...stories.filter(s => s.id !== story.id)];
    localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(updated));
  },

  getApiKey(): string {
    return localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
  },

  setApiKey(key: string): void {
    localStorage.setItem(STORAGE_KEYS.API_KEY, key.trim());
  },

  getPrefs(): UserPrefs {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PREFS);
      return data ? { ...DEFAULT_PREFS, ...JSON.parse(data) } : DEFAULT_PREFS;
    } catch {
      return DEFAULT_PREFS;
    }
  },

  savePrefs(prefs: Partial<UserPrefs>): void {
    const current = this.getPrefs();
    localStorage.setItem(STORAGE_KEYS.USER_PREFS, JSON.stringify({ ...current, ...prefs }));
  },

  // --- SRS (Spaced Repetition System) Cards ---
  getSRSCards(): SRSCard[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SRS_CARDS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveSRSCards(cards: SRSCard[]): void {
    localStorage.setItem(STORAGE_KEYS.SRS_CARDS, JSON.stringify(cards));
  },

  upsertSRSCard(card: SRSCard): void {
    const cards = this.getSRSCards();
    const idx = cards.findIndex(c => c.id === card.id);
    if (idx !== -1) {
      cards[idx] = card;
    } else {
      cards.unshift(card);
    }
    this.saveSRSCards(cards);
  },

  bulkAddSRSCards(newCards: SRSCard[]): number {
    const cards = this.getSRSCards();
    const existingIds = new Set(cards.map(c => c.id));
    const toAdd = newCards.filter(c => !existingIds.has(c.id));
    const merged = [...toAdd, ...cards];
    this.saveSRSCards(merged);
    return toAdd.length;
  },

  deleteSRSCard(id: string): void {
    const cards = this.getSRSCards().filter(c => c.id !== id);
    this.saveSRSCards(cards);
  },

  resetSRSCard(id: string): void {
    const cards = this.getSRSCards();
    const idx = cards.findIndex(c => c.id === id);
    if (idx !== -1) {
      cards[idx] = {
        ...cards[idx],
        interval: 1,
        easeFactor: 2.5,
        state: 'new',
        nextReview: getTodayDateStr(),
        reviewCount: 0,
      };
      this.saveSRSCards(cards);
    }
  },

  // --- Conjugation Progression & Mastery ---
  getConjugationLevel(): number {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.CONJUGATION_LEVEL);
      return val ? parseInt(val, 10) : 1;
    } catch {
      return 1;
    }
  },

  setConjugationLevel(level: number): void {
    localStorage.setItem(STORAGE_KEYS.CONJUGATION_LEVEL, level.toString());
  },

  getCompletedConjugationTables(): string[] {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.COMPLETED_TABLES);
      return val ? JSON.parse(val) : [];
    } catch {
      return [];
    }
  },

  markConjugationTableCompleted(tableKey: string): void {
    const list = this.getCompletedConjugationTables();
    if (!list.includes(tableKey)) {
      const updated = [...list, tableKey];
      localStorage.setItem(STORAGE_KEYS.COMPLETED_TABLES, JSON.stringify(updated));
      this.recordDailyActivity(5);
    }
  },

  exportAllData(): string {
    const fullBackup = {
      version: 2,
      exportDate: new Date().toISOString(),
      vocab: this.getVocab(),
      srsCards: this.getSRSCards(),
      journal: this.getJournalEntries(),
      media: this.getMediaSnippets(),
      stories: this.getStories(),
      progress: this.getProgress(),
      masteredCommonWords: this.getMasteredCommonWords(),
      completedGrammarTopics: this.getCompletedGrammarTopics(),
    };
    return JSON.stringify(fullBackup, null, 2);
  },

  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.vocab && Array.isArray(data.vocab)) {
        this.saveVocab(data.vocab);
      }
      if (data.srsCards && Array.isArray(data.srsCards)) {
        this.saveSRSCards(data.srsCards);
      }
      if (data.journal && Array.isArray(data.journal)) {
        localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(data.journal));
      }
      if (data.progress) {
        localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(data.progress));
      }
      if (data.masteredCommonWords && Array.isArray(data.masteredCommonWords)) {
        localStorage.setItem(STORAGE_KEYS.MASTERED_1000, JSON.stringify(data.masteredCommonWords));
      }
      if (data.completedGrammarTopics && Array.isArray(data.completedGrammarTopics)) {
        localStorage.setItem(STORAGE_KEYS.GRAMMAR_PROGRESS, JSON.stringify(data.completedGrammarTopics));
      }
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }
};

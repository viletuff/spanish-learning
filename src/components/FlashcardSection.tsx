import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Layers,
  Sparkles,
  RotateCcw,
  Plus,
  Upload,
  Search,
  CheckCircle2,
  Trash2,
  Volume2,
  ArrowRight,
  Filter,
  Flame,
  Check,
  BookOpen,
  Calendar,
  Clock,
  Shuffle
} from 'lucide-react';
import { SRSCard, CommonWord } from '../types';
import { storageService } from '../services/storage';
import { aiService } from '../services/aiService';
import { TOP_1000_WORDS } from '../data/top1000Words';
import { useTranslation } from '../services/i18n';
import { AudioButton } from './AudioButton';
import { AccentBar } from './AccentBar';

const getTodayDateStr = () => new Date().toISOString().split('T')[0];

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Convert a Top 1000 word into an SRSCard
function createSRSCardFromTop1000(word: CommonWord): SRSCard {
  return {
    id: `top1000-${word.rank}`,
    front: word.word,
    back: word.translation,
    exampleSentence: word.exampleSentence,
    exampleTranslation: word.exampleTranslation,
    source: 'top1000',
    rank: word.rank,
    interval: 1,
    easeFactor: 2.5,
    nextReview: getTodayDateStr(),
    state: 'new',
    reviewCount: 0,
    category: word.partOfSpeech,
  };
}

// SM-2 Spaced Repetition calculation
function calculateNextSRS(card: SRSCard, rating: 'again' | 'okay' | 'easy'): SRSCard {
  const today = getTodayDateStr();
  let interval = card.interval;
  let easeFactor = card.easeFactor;
  let state = card.state;
  const reviewCount = card.reviewCount + 1;

  if (rating === 'again') {
    interval = 1;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
    state = 'learning';
  } else if (rating === 'okay') {
    if (state === 'new' || state === 'learning') {
      interval = 1;
    } else if (interval === 1) {
      interval = 3;
    } else {
      interval = Math.max(2, Math.round(interval * easeFactor * 0.9));
    }
    state = 'review';
  } else {
    // easy / mastered
    if (state === 'new' || state === 'learning') {
      interval = 3;
    } else if (interval === 1) {
      interval = 5;
    } else {
      interval = Math.max(4, Math.round(interval * easeFactor * 1.3));
    }
    easeFactor = Math.min(3.0, easeFactor + 0.15);
    state = 'review';
  }

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);
  const nextReview = nextDate.toISOString().split('T')[0];

  return {
    ...card,
    interval,
    easeFactor,
    nextReview,
    lastReview: today,
    state,
    reviewCount,
  };
}

interface FlashcardSectionProps {
  onActivityDone?: () => void;
}

export const FlashcardSection: React.FC<FlashcardSectionProps> = ({ onActivityDone }) => {
  const { lang, t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'study' | 'cards' | 'create'>('study');

  // Study mode settings
  const [studyPool, setStudyPool] = useState<'mixed' | 'due' | 'new' | 'custom'>('mixed');
  const [batchSize, setBatchSize] = useState<number>(15);

  // Active study session
  const [sessionCards, setSessionCards] = useState<SRSCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState({ again: 0, okay: 0, easy: 0 });

  // Creation form state
  const [frontInput, setFrontInput] = useState('');
  const [backInput, setBackInput] = useState('');
  const [exampleInput, setExampleInput] = useState('');
  const [exampleTransInput, setExampleTransInput] = useState('');
  const [isEnriching, setIsEnriching] = useState(false);
  const [cardAddedNotice, setCardAddedNotice] = useState(false);

  // Bulk Import state
  const [importText, setImportText] = useState('');
  const [importReport, setImportReport] = useState<{ count: number } | null>(null);

  // Search & filter in deck
  const [searchTerm, setSearchTerm] = useState('');
  const [deckFilter, setDeckFilter] = useState<'all' | 'top1000' | 'custom' | 'imported' | 'due'>('all');

  // Helper to ensure deck is initialized
  const ensureDeckInitialized = useCallback((): SRSCard[] => {
    let cards = storageService.getSRSCards();
    if (cards.length === 0) {
      // Pre-seed with the first 50 top words to start immediately, plus starter curiosities
      const initialCards: SRSCard[] = TOP_1000_WORDS.slice(0, 100).map(createSRSCardFromTop1000);
      storageService.saveSRSCards(initialCards);
      cards = initialCards;
    }
    return cards;
  }, []);

  // Start or reload study session
  const startSession = useCallback((pool = studyPool, size = batchSize) => {
    const allCards = ensureDeckInitialized();
    const today = getTodayDateStr();

    let candidateCards: SRSCard[] = [];

    if (pool === 'due') {
      candidateCards = allCards.filter(c => c.nextReview <= today && c.state !== 'new');
      if (candidateCards.length === 0) {
        // Fallback to cards with smallest nextReview or new cards
        candidateCards = allCards.filter(c => c.state === 'new').slice(0, size);
      }
    } else if (pool === 'new') {
      // Find new cards from stored deck, or import more from TOP_1000_WORDS if needed
      const storedIds = new Set(allCards.map(c => c.id));
      candidateCards = allCards.filter(c => c.state === 'new');
      if (candidateCards.length < size) {
        // Fetch more from TOP_1000_WORDS
        const nextFrom1000: SRSCard[] = [];
        for (const w of TOP_1000_WORDS) {
          const id = `top1000-${w.rank}`;
          if (!storedIds.has(id)) {
            nextFrom1000.push(createSRSCardFromTop1000(w));
            if (nextFrom1000.length >= size * 2) break;
          }
        }
        if (nextFrom1000.length > 0) {
          storageService.bulkAddSRSCards(nextFrom1000);
          candidateCards = [...candidateCards, ...nextFrom1000];
        }
      }
    } else if (pool === 'custom') {
      candidateCards = allCards.filter(c => c.source === 'custom' || c.source === 'imported');
      if (candidateCards.length === 0) {
        candidateCards = allCards.slice(0, size);
      }
    } else {
      // 'mixed': Due reviews first, complemented with new cards
      const dueCards = allCards.filter(c => c.nextReview <= today);
      const otherCards = allCards.filter(c => c.nextReview > today || c.state === 'new');
      candidateCards = [...shuffleArray(dueCards), ...shuffleArray(otherCards)];
    }

    // Always randomize order!
    const randomized = shuffleArray(candidateCards).slice(0, size);

    setSessionCards(randomized);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsSessionComplete(randomized.length === 0);
    setSessionStats({ again: 0, okay: 0, easy: 0 });
  }, [batchSize, studyPool, ensureDeckInitialized]);

  // Initial load
  useEffect(() => {
    startSession('mixed', 15);
  }, [startSession]);

  const currentCard: SRSCard | undefined = sessionCards[currentIndex];

  // Handle rating a card
  const handleRateCard = (rating: 'again' | 'okay' | 'easy') => {
    if (!currentCard) return;

    const updated = calculateNextSRS(currentCard, rating);
    storageService.upsertSRSCard(updated);

    setSessionStats(prev => ({
      ...prev,
      [rating]: prev[rating] + 1,
    }));

    if (rating === 'again') {
      // Re-insert card ~3 positions later so the user sees it again during this session!
      const nextQueue = [...sessionCards];
      const insertPos = Math.min(currentIndex + 3, nextQueue.length);
      nextQueue.splice(insertPos, 0, currentCard);
      setSessionCards(nextQueue);
    }

    // Advance to next card
    if (currentIndex + 1 >= sessionCards.length) {
      setIsSessionComplete(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
      storageService.recordDailyActivity(5);
      if (onActivityDone) onActivityDone();
    } else {
      setCurrentIndex(i => i + 1);
      setIsFlipped(false);
    }
  };

  // Keyboard controls
  useEffect(() => {
    if (activeTab !== 'study' || isSessionComplete || !currentCard) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid firing if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (isFlipped) {
        if (e.key === '1') {
          e.preventDefault();
          handleRateCard('again');
        } else if (e.key === '2') {
          e.preventDefault();
          handleRateCard('okay');
        } else if (e.key === '3') {
          e.preventDefault();
          handleRateCard('easy');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, isSessionComplete, isFlipped, currentCard]);

  // Auto-fill / Enrich card with AI or local smart translation
  const handleAutoEnrich = async () => {
    if (!frontInput.trim() && !backInput.trim()) return;
    setIsEnriching(true);
    try {
      const res = await aiService.translateOrEnrichCard(frontInput, backInput);
      if (res) {
        setFrontInput(res.front);
        setBackInput(res.back);
        if (res.exampleSentence) setExampleInput(res.exampleSentence);
        if (res.exampleTranslation) setExampleTransInput(res.exampleTranslation);
      }
    } finally {
      setIsEnriching(false);
    }
  };

  // Save new custom card
  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontInput.trim() || !backInput.trim()) return;

    const newCard: SRSCard = {
      id: `custom-${Date.now()}`,
      front: frontInput.trim(),
      back: backInput.trim(),
      exampleSentence: exampleInput.trim() || undefined,
      exampleTranslation: exampleTransInput.trim() || undefined,
      source: 'custom',
      interval: 1,
      easeFactor: 2.5,
      nextReview: getTodayDateStr(),
      state: 'new',
      reviewCount: 0,
      category: 'personal',
    };

    storageService.upsertSRSCard(newCard);
    setFrontInput('');
    setBackInput('');
    setExampleInput('');
    setExampleTransInput('');
    setCardAddedNotice(true);
    setTimeout(() => setCardAddedNotice(false), 2500);
  };

  // Handle bulk import
  const handleBulkImport = () => {
    const lines = importText.split('\n').map(l => l.trim()).filter(Boolean);
    const newCards: SRSCard[] = [];
    const today = getTodayDateStr();

    for (const line of lines) {
      // Support comma, tab, or dash as separator
      let parts: string[] = [];
      if (line.includes('\t')) parts = line.split('\t');
      else if (line.includes(',')) parts = line.split(',');
      else if (line.includes(' - ')) parts = line.split(' - ');
      else parts = [line];

      const front = parts[0]?.trim();
      const back = parts[1]?.trim() || front;
      const example = parts[2]?.trim();

      if (front) {
        newCards.push({
          id: `imported-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          front,
          back,
          exampleSentence: example,
          source: 'imported',
          interval: 1,
          easeFactor: 2.5,
          nextReview: today,
          state: 'new',
          reviewCount: 0,
        });
      }
    }

    if (newCards.length > 0) {
      storageService.bulkAddSRSCards(newCards);
      setImportReport({ count: newCards.length });
      setImportText('');
      setTimeout(() => setImportReport(null), 3500);
    }
  };

  // Get statistics for Deck Manager
  const allCards = storageService.getSRSCards();
  const deckStats = useMemo(() => {
    const today = getTodayDateStr();
    const total = allCards.length;
    const due = allCards.filter(c => c.nextReview <= today).length;
    const mature = allCards.filter(c => c.interval >= 21).length;
    const custom = allCards.filter(c => c.source === 'custom' || c.source === 'imported').length;
    return { total, due, mature, custom };
  }, [allCards]);

  // Filtered deck for Deck tab
  const filteredDeck = useMemo(() => {
    const today = getTodayDateStr();
    return allCards.filter(card => {
      const matchesSearch =
        !searchTerm ||
        card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.back.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (deckFilter === 'all') return true;
      if (deckFilter === 'top1000') return card.source === 'top1000';
      if (deckFilter === 'custom') return card.source === 'custom';
      if (deckFilter === 'imported') return card.source === 'imported';
      if (deckFilter === 'due') return card.nextReview <= today;
      return true;
    });
  }, [allCards, searchTerm, deckFilter]);

  return (
    <div className="space-y-6">
      {/* Header and Sub-tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
              {lang === 'en' ? 'Spaced Repetition Flashcards' : 'Tarjetas con Repetición Espaciada'}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
              Anki SRS
            </span>
          </div>
          <p className="text-stone-500 text-sm mt-0.5">
            {lang === 'en'
              ? 'Randomized, habit-focused memory cards with native audio. Learn without burnout.'
              : 'Tarjetas aleatorias para consolidar tu vocabulario día a día con audio nativo.'}
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex flex-wrap items-center bg-stone-200/70 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto gap-1">
          <button
            onClick={() => setActiveTab('study')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'study' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span>{lang === 'en' ? 'Study' : 'Estudiar'}</span>
          </button>

          <button
            onClick={() => setActiveTab('cards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'cards' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>{lang === 'en' ? 'My Deck' : 'Mi Mazo'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-stone-100 text-[10px] text-stone-600 font-mono">
              {deckStats.total}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'create' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span>{lang === 'en' ? 'Add & Import' : 'Crear / Importar'}</span>
          </button>
        </div>
      </div>

      {/* ======================= TAB 1: STUDY ======================= */}
      {activeTab === 'study' && (
        <div className="space-y-6">
          {/* Quick study configuration bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-2xs text-xs">
            <div className="flex items-center gap-2">
              <span className="text-stone-500 font-medium">{lang === 'en' ? 'Focus:' : 'Enfoque:'}</span>
              <div className="flex items-center gap-1">
                {(
                  [
                    { id: 'mixed', labelEn: 'Mixed (Random)', labelEs: 'Mixto (Aleatorio)' },
                    { id: 'due', labelEn: `Due (${deckStats.due})`, labelEs: `Pendientes (${deckStats.due})` },
                    { id: 'new', labelEn: 'New Top 1000', labelEs: 'Nuevas Top 1000' },
                    { id: 'custom', labelEn: 'Personal Words', labelEs: 'Mis Palabras' },
                  ] as const
                ).map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setStudyPool(opt.id);
                      startSession(opt.id, batchSize);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                      studyPool === opt.id
                        ? 'bg-amber-100 text-amber-900 border border-amber-300/80 font-semibold'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    {lang === 'en' ? opt.labelEn : opt.labelEs}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-stone-500 font-medium">{lang === 'en' ? 'Batch size:' : 'Lote:'}</span>
              {[10, 15, 25].map(size => (
                <button
                  key={size}
                  onClick={() => {
                    setBatchSize(size);
                    startSession(studyPool, size);
                  }}
                  className={`px-2 py-0.8 rounded-md font-medium cursor-pointer transition ${
                    batchSize === size
                      ? 'bg-stone-800 text-white font-semibold'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                  }`}
                >
                  {size}
                </button>
              ))}
              <button
                onClick={() => startSession(studyPool, batchSize)}
                title={lang === 'en' ? 'Reshuffle cards' : 'Barajar tarjetas'}
                className="p-1 rounded-md text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer ml-1"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Session Finished State */}
          {isSessionComplete ? (
            <div className="bg-white border border-stone-200/90 rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm space-y-6">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="font-serif text-2xl font-bold text-stone-900">
                  {lang === 'en' ? 'Session Complete! 🎉' : '¡Sesión Completada! 🎉'}
                </h2>
                <p className="text-stone-500 text-sm">
                  {lang === 'en'
                    ? 'No backlogs, no debt. You showed up and reinforced your Spanish memory today.'
                    : 'Sin deudas ni culpas acumuladas. Hoy has reforzado tu memoria en español.'}
                </p>
              </div>

              {/* Stats summary */}
              <div className="grid grid-cols-3 gap-2 bg-stone-50 p-3.5 rounded-2xl border border-stone-200 text-xs">
                <div className="text-center">
                  <span className="block font-bold text-base text-red-600">{sessionStats.again}</span>
                  <span className="text-stone-500">{lang === 'en' ? 'Again' : 'Otra vez'}</span>
                </div>
                <div className="text-center border-x border-stone-200">
                  <span className="block font-bold text-base text-amber-600">{sessionStats.okay}</span>
                  <span className="text-stone-500">{lang === 'en' ? 'Okay' : 'Bien'}</span>
                </div>
                <div className="text-center">
                  <span className="block font-bold text-base text-emerald-600">{sessionStats.easy}</span>
                  <span className="text-stone-500">{lang === 'en' ? 'Mastered' : 'Fácil'}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  onClick={() => startSession(studyPool, batchSize)}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm transition shadow-xs cursor-pointer"
                >
                  {lang === 'en' ? 'Practice Another Batch' : 'Practicar otro lote'}
                </button>
                <button
                  onClick={() => setActiveTab('cards')}
                  className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-sm transition cursor-pointer"
                >
                  {lang === 'en' ? 'Browse Deck' : 'Ver Mazo'}
                </button>
              </div>
            </div>
          ) : currentCard ? (
            /* Active Flashcard */
            <div className="max-w-xl mx-auto space-y-4">
              {/* Progress counter & progress bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-stone-500 font-medium px-1">
                  <span>
                    {lang === 'en' ? 'Card' : 'Tarjeta'} {currentIndex + 1} {lang === 'en' ? 'of' : 'de'}{' '}
                    {sessionCards.length}
                  </span>
                  <span className="capitalize text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 font-semibold text-[10px]">
                    {currentCard.source === 'top1000'
                      ? `#${currentCard.rank} Top 1000`
                      : currentCard.source === 'custom'
                      ? (lang === 'en' ? 'Custom' : 'Personal')
                      : (lang === 'en' ? 'Imported' : 'Importada')}
                  </span>
                </div>
                <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / sessionCards.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Flashcard container */}
              <div
                onClick={() => setIsFlipped(f => !f)}
                className={`relative min-h-[300px] sm:min-h-[340px] bg-white rounded-3xl border-2 transition-all duration-200 p-6 sm:p-8 flex flex-col justify-between cursor-pointer select-none shadow-sm hover:shadow-md ${
                  isFlipped ? 'border-amber-400/80 bg-amber-50/20' : 'border-stone-200 hover:border-amber-300'
                }`}
              >
                {/* Top card bar */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                    {isFlipped
                      ? (lang === 'en' ? 'English & Context' : 'Significado y Contexto')
                      : (lang === 'en' ? 'Spanish' : 'Español')}
                  </span>
                  <div onClick={e => e.stopPropagation()}>
                    <AudioButton text={currentCard.front} rate={0.85} variant="pill" />
                  </div>
                </div>

                {/* Main Card Content */}
                <div className="text-center my-auto py-6 space-y-4">
                  {!isFlipped ? (
                    <div>
                      <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
                        {currentCard.front}
                      </h2>
                      <p className="text-stone-400 text-xs mt-3">
                        {lang === 'en' ? 'Click card or press Space to reveal answer' : 'Toca o pulsa Espacio para voltear'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-150">
                      <div>
                        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-amber-900">
                          {currentCard.back}
                        </h2>
                        <span className="text-xs text-stone-400 block mt-1">({currentCard.front})</span>
                      </div>

                      {/* Example sentence */}
                      {currentCard.exampleSentence && (
                        <div className="bg-stone-50 rounded-2xl p-4 text-left border border-stone-200/70 space-y-1.5 mt-3">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-stone-800 leading-relaxed italic">
                              «{currentCard.exampleSentence}»
                            </p>
                            <div onClick={e => e.stopPropagation()}>
                              <AudioButton text={currentCard.exampleSentence} rate={0.88} variant="minimal" />
                            </div>
                          </div>
                          {currentCard.exampleTranslation && (
                            <p className="text-xs text-stone-500 leading-relaxed">
                              {currentCard.exampleTranslation}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom hint / status */}
                <div className="flex items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-stone-100">
                  <span>
                    {currentCard.reviewCount > 0
                      ? `${lang === 'en' ? 'Reviewed' : 'Repasado'} ${currentCard.reviewCount}x · Int: ${currentCard.interval}d`
                      : (lang === 'en' ? 'New card' : 'Tarjeta nueva')}
                  </span>
                  <span>{isFlipped ? (lang === 'en' ? 'Rate below ↓' : 'Califica abajo ↓') : (lang === 'en' ? 'Flip card ↺' : 'Voltear ↺')}</span>
                </div>
              </div>

              {/* Action rating buttons */}
              {isFlipped ? (
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  {/* Rating 1: Again */}
                  <button
                    onClick={() => handleRateCard('again')}
                    className="flex flex-col items-center justify-center p-3 min-h-[44px] rounded-2xl bg-red-50 hover:bg-red-100 border border-red-200/90 text-red-800 transition active:scale-98 cursor-pointer group shadow-2xs"
                  >
                    <span className="font-semibold text-sm flex items-center gap-1">
                      <span className="hidden sm:inline text-xs text-red-400">[1]</span>
                      {lang === 'en' ? 'Again' : 'Otra vez'}
                    </span>
                    <span className="text-[11px] text-red-600/80 mt-0.5">&lt; 1 day</span>
                  </button>

                  {/* Rating 2: Okay */}
                  <button
                    onClick={() => handleRateCard('okay')}
                    className="flex flex-col items-center justify-center p-3 min-h-[44px] rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200/90 text-amber-900 transition active:scale-98 cursor-pointer group shadow-2xs"
                  >
                    <span className="font-semibold text-sm flex items-center gap-1">
                      <span className="hidden sm:inline text-xs text-amber-400">[2]</span>
                      {lang === 'en' ? 'Okay' : 'Bien'}
                    </span>
                    <span className="text-[11px] text-amber-700/80 mt-0.5">
                      {currentCard.interval <= 1 ? '2-3 days' : `${Math.round(currentCard.interval * 1.5)} days`}
                    </span>
                  </button>

                  {/* Rating 3: Easy */}
                  <button
                    onClick={() => handleRateCard('easy')}
                    className="flex flex-col items-center justify-center p-3 min-h-[44px] rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/90 text-emerald-900 transition active:scale-98 cursor-pointer group shadow-2xs"
                  >
                    <span className="font-semibold text-sm flex items-center gap-1">
                      <span className="hidden sm:inline text-xs text-emerald-400">[3]</span>
                      {lang === 'en' ? 'Mastered' : 'Fácil'}
                    </span>
                    <span className="text-[11px] text-emerald-700/80 mt-0.5">
                      {currentCard.interval <= 1 ? '4-5 days' : `${Math.round(currentCard.interval * 2.2)} days`}
                    </span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsFlipped(true)}
                  className="w-full py-3.5 rounded-2xl bg-stone-800 hover:bg-stone-900 text-white font-medium text-sm transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{lang === 'en' ? 'Show Answer' : 'Mostrar Respuesta'}</span>
                  <span className="text-xs text-stone-400 font-mono">[Space]</span>
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-stone-500">
              <p>{lang === 'en' ? 'No cards match this criteria.' : 'No hay tarjetas con este filtro.'}</p>
              <button
                onClick={() => startSession('mixed', batchSize)}
                className="mt-3 px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                {lang === 'en' ? 'Start Mixed Session' : 'Iniciar Sesión Mixta'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ======================= TAB 2: MY DECK ======================= */}
      {activeTab === 'cards' && (
        <div className="space-y-4">
          {/* Deck statistics overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 text-center shadow-2xs">
              <span className="block text-2xl font-bold font-serif text-stone-900">{deckStats.total}</span>
              <span className="text-xs text-stone-500">{lang === 'en' ? 'Total Cards' : 'Total Tarjetas'}</span>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 text-center shadow-2xs">
              <span className="block text-2xl font-bold font-serif text-amber-600">{deckStats.due}</span>
              <span className="text-xs text-stone-500">{lang === 'en' ? 'Due for Review' : 'Pendientes'}</span>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 text-center shadow-2xs">
              <span className="block text-2xl font-bold font-serif text-emerald-600">{deckStats.mature}</span>
              <span className="text-xs text-stone-500">{lang === 'en' ? 'Mature (21d+)' : 'Consolidadas'}</span>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 text-center shadow-2xs">
              <span className="block text-2xl font-bold font-serif text-indigo-600">{deckStats.custom}</span>
              <span className="text-xs text-stone-500">{lang === 'en' ? 'Custom / Saved' : 'Mis Palabras'}</span>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-2 bg-white p-3 rounded-2xl border border-stone-200">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder={lang === 'en' ? 'Search Spanish or English...' : 'Buscar en español o inglés...'}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {(
                [
                  { id: 'all', labelEn: 'All', labelEs: 'Todas' },
                  { id: 'due', labelEn: 'Due Now', labelEs: 'Pendientes' },
                  { id: 'custom', labelEn: 'Custom', labelEs: 'Personalizadas' },
                  { id: 'top1000', labelEn: 'Top 1000', labelEs: 'Top 1000' },
                ] as const
              ).map(f => (
                <button
                  key={f.id}
                  onClick={() => setDeckFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer whitespace-nowrap ${
                    deckFilter === f.id
                      ? 'bg-amber-100 text-amber-900 border border-amber-300/80 font-semibold'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                  }`}
                >
                  {lang === 'en' ? f.labelEn : f.labelEs}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Table / List */}
          <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100 max-h-[500px] overflow-y-auto">
            {filteredDeck.length === 0 ? (
              <div className="py-12 text-center text-stone-400 text-sm">
                {lang === 'en' ? 'No cards match this search.' : 'No hay tarjetas que coincidan.'}
              </div>
            ) : (
              filteredDeck.slice(0, 150).map(card => (
                <div key={card.id} className="p-3.5 sm:px-5 flex items-center justify-between hover:bg-stone-50/80 transition">
                  <div className="space-y-0.5 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-900 text-sm">{card.front}</span>
                      <AudioButton text={card.front} variant="minimal" />
                      <span className="text-stone-400 text-xs font-mono">→</span>
                      <span className="text-stone-600 text-sm font-medium">{card.back}</span>
                    </div>
                    {card.exampleSentence && (
                      <p className="text-xs text-stone-400 italic line-clamp-1">
                        {card.exampleSentence}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-xs">
                    <div className="text-right">
                      <span className="block font-medium text-stone-700">
                        {card.interval}d {lang === 'en' ? 'interval' : 'intervalo'}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {card.reviewCount} {lang === 'en' ? 'reviews' : 'repasos'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        storageService.resetSRSCard(card.id);
                        // trigger state update
                        setSearchTerm(s => s + ' ');
                        setTimeout(() => setSearchTerm(s => s.trim()), 10);
                      }}
                      title={lang === 'en' ? 'Reset progress' : 'Reiniciar progreso'}
                      className="p-1.5 text-stone-400 hover:text-amber-600 hover:bg-stone-100 rounded-lg transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    {card.source !== 'top1000' && (
                      <button
                        onClick={() => {
                          storageService.deleteSRSCard(card.id);
                          setSearchTerm(s => s + ' ');
                          setTimeout(() => setSearchTerm(s => s.trim()), 10);
                        }}
                        title={lang === 'en' ? 'Delete card' : 'Eliminar tarjeta'}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          {filteredDeck.length > 150 && (
            <p className="text-center text-stone-400 text-xs">
              {lang === 'en' ? `Showing first 150 of ${filteredDeck.length} cards` : `Mostrando las primeras 150 de ${filteredDeck.length} tarjetas`}
            </p>
          )}
        </div>
      )}

      {/* ======================= TAB 3: ADD & IMPORT ======================= */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Creator with AI Auto-Fill */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-sm space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  {lang === 'en' ? 'Create a Flashcard' : 'Crear una Tarjeta'}
                </h3>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {lang === 'en' ? 'AI Supported' : 'Con IA'}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                {lang === 'en'
                  ? 'Type a Spanish word, or an English concept you want to express, and let AI help fill in natural details.'
                  : 'Escribe una palabra en español o en inglés y deja que la IA complete los detalles naturales.'}
              </p>
            </div>

            <form onSubmit={handleSaveCard} className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-stone-700">
                    {lang === 'en' ? 'Spanish (Front):' : 'Español (Anverso):'}
                  </label>
                  <AccentBar onInsert={char => setFrontInput(f => f + char)} />
                </div>
                <input
                  type="text"
                  value={frontInput}
                  onChange={e => setFrontInput(e.target.value)}
                  placeholder={lang === 'en' ? 'e.g. Desahogarse' : 'ej. Desahogarse'}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {lang === 'en' ? 'English (Back):' : 'Inglés (Reverso):'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={backInput}
                    onChange={e => setBackInput(e.target.value)}
                    placeholder={lang === 'en' ? 'e.g. To vent / unburden emotionally' : 'ej. To vent / unburden'}
                    className="flex-1 px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={handleAutoEnrich}
                    disabled={isEnriching || (!frontInput.trim() && !backInput.trim())}
                    className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    title={lang === 'en' ? 'Auto-translate / Fill with AI' : 'Traducir / Completar con IA'}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isEnriching ? '...' : (lang === 'en' ? 'Auto-Fill' : 'Completar')}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {lang === 'en' ? 'Spanish Example Sentence (Optional):' : 'Frase de ejemplo en español (Opcional):'}
                </label>
                <input
                  type="text"
                  value={exampleInput}
                  onChange={e => setExampleInput(e.target.value)}
                  placeholder={lang === 'en' ? 'e.g. Necesitaba hablar para desahogarme.' : 'ej. Necesitaba hablar para desahogarme.'}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {lang === 'en' ? 'Example Translation (Optional):' : 'Traducción del ejemplo (Opcional):'}
                </label>
                <input
                  type="text"
                  value={exampleTransInput}
                  onChange={e => setExampleTransInput(e.target.value)}
                  placeholder={lang === 'en' ? 'e.g. I needed to talk to unburden myself.' : 'ej. I needed to talk to unburden myself.'}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                disabled={!frontInput.trim() || !backInput.trim()}
                className="w-full py-2.5 bg-stone-800 hover:bg-stone-900 disabled:opacity-40 text-white font-medium text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Add Flashcard to Deck' : 'Añadir Tarjeta al Mazo'}</span>
              </button>

              {cardAddedNotice && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
                  <Check className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Card added to your SRS queue!' : '¡Tarjeta añadida al mazo!'}</span>
                </div>
              )}
            </form>
          </div>

          {/* Bulk Import */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  {lang === 'en' ? 'Import Flashcards' : 'Importar Tarjetas'}
                </h3>
                <Upload className="w-4 h-4 text-stone-400" />
              </div>
              <p className="text-xs text-stone-500">
                {lang === 'en'
                  ? 'Paste comma-separated, tab-separated, or hyphenated lines (Spanish, English).'
                  : 'Pega líneas separadas por comas, tabuladores o guiones (Español, Inglés).'}
              </p>

              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 font-mono text-[11px] text-stone-600 space-y-0.5">
                <p>charlar, to chat / gossip</p>
                <p>tener buena pinta, to look good / appealing</p>
                <p>dar vueltas a la cabeza, to overthink</p>
              </div>

              <textarea
                value={importText}
                onChange={e => setImportText(e.target.value)}
                rows={6}
                placeholder={lang === 'en' ? 'Paste your list here...' : 'Pega tu lista aquí...'}
                className="w-full p-3 text-xs font-mono bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleBulkImport}
                disabled={!importText.trim()}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-medium text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Import Cards into Deck' : 'Importar Tarjetas al Mazo'}</span>
              </button>

              {importReport && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    {lang === 'en'
                      ? `Successfully imported ${importReport.count} cards!`
                      : `¡Se importaron ${importReport.count} tarjetas con éxito!`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

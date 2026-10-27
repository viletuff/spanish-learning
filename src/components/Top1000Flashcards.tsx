import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Layers,
  List,
  Search,
  CheckCircle2,
  Check,
  RotateCw,
  Trophy,
  Filter,
  Shuffle,
  ArrowRight,
  ArrowLeft,
  XCircle,
  HelpCircle,
  Award,
  Play
} from 'lucide-react';
import { TOP_1000_WORDS } from '../data/top1000Words';
import { CommonWord } from '../types';
import { AudioButton } from './AudioButton';
import { storageService } from '../services/storage';
import { useTranslation } from '../services/i18n';

interface Top1000FlashcardsProps {
  onActivityDone: () => void;
}

export const Top1000Flashcards: React.FC<Top1000FlashcardsProps> = ({ onActivityDone }) => {
  const { lang } = useTranslation();
  const [viewMode, setViewMode] = useState<'flashcard' | 'list'>('flashcard');
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | '1-100' | '101-250' | '251-500' | '501-1000'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'needs-review' | 'unseen' | 'mastered'>('all');
  
  // Randomization & session mode
  const [isRandomized, setIsRandomized] = useState(true);
  const [sessionBatchSize, setSessionBatchSize] = useState<number>(10); // 10, 25, or 0 (infinite)

  // Review states map: rank -> 'again' | 'okay' | 'mastered'
  const [wordStates, setWordStates] = useState<Record<number, 'again' | 'okay' | 'mastered'>>(() =>
    storageService.getWordReviewStates()
  );

  // Active study deck (queue of CommonWord)
  const [deck, setDeck] = useState<CommonWord[]>([]);
  const [currentDeckIndex, setCurrentDeckIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Session stats for the completed summary
  const [sessionStats, setSessionStats] = useState<{
    totalStudied: number;
    againCount: number;
    okayCount: number;
    masteredCount: number;
  }>({ totalStudied: 0, againCount: 0, okayCount: 0, masteredCount: 0 });

  const [isSessionFinished, setIsSessionFinished] = useState(false);

  // Filter pool based on filters
  const filteredPool = useMemo(() => {
    return TOP_1000_WORDS.filter((item) => {
      // Tier filter
      if (tierFilter === '1-100' && (item.rank < 1 || item.rank > 100)) return false;
      if (tierFilter === '101-250' && (item.rank < 101 || item.rank > 250)) return false;
      if (tierFilter === '251-500' && (item.rank < 251 || item.rank > 500)) return false;
      if (tierFilter === '501-1000' && (item.rank < 501 || item.rank > 1000)) return false;

      // Status filter
      const st = wordStates[item.rank];
      if (statusFilter === 'mastered' && st !== 'mastered') return false;
      if (statusFilter === 'needs-review' && st !== 'again' && st !== 'okay') return false;
      if (statusFilter === 'unseen' && st !== undefined) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.word.toLowerCase().includes(q) ||
          item.translation.toLowerCase().includes(q) ||
          item.exampleSentence.toLowerCase().includes(q) ||
          item.rank.toString() === q
        );
      }

      return true;
    });
  }, [tierFilter, statusFilter, searchQuery, wordStates]);

  // Build new study deck (shuffled or sequential)
  const initializeDeck = useCallback(() => {
    let list = [...filteredPool];

    if (isRandomized) {
      // Fisher-Yates shuffle
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
      }
    }

    if (sessionBatchSize > 0 && list.length > sessionBatchSize) {
      list = list.slice(0, sessionBatchSize);
    }

    setDeck(list);
    setCurrentDeckIndex(0);
    setIsFlipped(false);
    setIsSessionFinished(false);
    setSessionStats({ totalStudied: 0, againCount: 0, okayCount: 0, masteredCount: 0 });
  }, [filteredPool, isRandomized, sessionBatchSize]);

  // Rebuild deck whenever pool or settings change
  useEffect(() => {
    initializeDeck();
  }, [tierFilter, statusFilter, isRandomized, sessionBatchSize]);

  const currentWord: CommonWord | undefined = deck[currentDeckIndex];

  // Rating action handler (Again, Okay, Mastered)
  const handleRateCard = (rating: 'again' | 'okay' | 'mastered') => {
    if (!currentWord) return;

    // Save state to storage
    storageService.setWordReviewState(currentWord.rank, rating);
    setWordStates(storageService.getWordReviewStates());

    // Update session stats
    setSessionStats((prev) => ({
      ...prev,
      totalStudied: prev.totalStudied + 1,
      againCount: rating === 'again' ? prev.againCount + 1 : prev.againCount,
      okayCount: rating === 'okay' ? prev.okayCount + 1 : prev.okayCount,
      masteredCount: rating === 'mastered' ? prev.masteredCount + 1 : prev.masteredCount,
    }));

    if (rating === 'mastered') {
      try {
        confetti({
          particleCount: 20,
          spread: 40,
          origin: { y: 0.8 },
          colors: ['#10b981', '#f59e0b'],
        });
      } catch {}
      storageService.recordDailyActivity(1);
      onActivityDone();
    }

    // Smart Queue Logic: If rating is 'again', re-insert the card 3 positions ahead in current deck!
    if (rating === 'again') {
      setDeck((prev) => {
        const copy = [...prev];
        const reinsertIndex = Math.min(copy.length, currentDeckIndex + 4);
        copy.splice(reinsertIndex, 0, currentWord);
        return copy;
      });
    }

    // Move to next card or finish session
    if (currentDeckIndex + 1 >= deck.length) {
      setIsSessionFinished(true);
      storageService.recordDailyActivity(5);
      onActivityDone();
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#10b981', '#f59e0b'],
        });
      } catch {}
    } else {
      setIsFlipped(false);
      setCurrentDeckIndex((prev) => prev + 1);
    }
  };

  // Keyboard shortcuts (Space = flip, 1 = again, 2 = okay, 3 = mastered)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'flashcard' || isSessionFinished || !currentWord) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (isFlipped) {
        if (e.key === '1') {
          e.preventDefault();
          handleRateCard('again');
        } else if (e.key === '2') {
          e.preventDefault();
          handleRateCard('okay');
        } else if (e.key === '3') {
          e.preventDefault();
          handleRateCard('mastered');
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (currentDeckIndex + 1 < deck.length) {
          setCurrentDeckIndex((prev) => prev + 1);
          setIsFlipped(false);
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (currentDeckIndex > 0) {
          setCurrentDeckIndex((prev) => prev - 1);
          setIsFlipped(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, isFlipped, isSessionFinished, currentWord, currentDeckIndex, deck.length]);

  const masteredCount = Object.values(wordStates).filter((s) => s === 'mastered').length;
  const reviewCount = Object.values(wordStates).filter((s) => s === 'again' || s === 'okay').length;
  const percentMastered = Math.round((masteredCount / 1000) * 100);

  return (
    <div className="space-y-6">
      {/* Top Banner with Progress & Controls */}
      <div className="bg-gradient-to-br from-amber-500/10 via-amber-50 to-stone-50 border border-amber-200/80 rounded-3xl p-6 md:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-900 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                {lang === 'en' ? 'Top 1,000 Spanish Words' : 'Las 1.000 Palabras Más Comunes'}
              </span>
              {isRandomized && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-semibold flex items-center gap-1">
                  <Shuffle className="w-3 h-3 text-indigo-600" />
                  {lang === 'en' ? 'Randomized' : 'Aleatorio'}
                </span>
              )}
            </div>

            <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 tracking-tight mt-1 mb-2">
              {lang === 'en' ? 'Smart Spaced Flashcards' : 'Tarjetas con Repetición Inteligente'}
            </h1>
            <p className="text-stone-600 text-sm max-w-xl leading-relaxed">
              {lang === 'en'
                ? 'Randomized by default so you truly recognize words. Rate each card as "Hard", "Okay", or "Mastered". Tricky words loop back automatically during the session!'
                : 'Aleatorias por defecto para que las reconozcas de verdad. Califica cada palabra ("Difícil", "Duda", "Dominada"). Las difíciles reaparecen automáticamente hasta que las fijes.'}
            </p>
          </div>

          {/* Mastered & In Review Progress Dashboard */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs shrink-0 flex items-center gap-6">
            <div className="text-center">
              <span className="text-[11px] text-stone-500 font-medium block mb-0.5">
                {lang === 'en' ? 'Mastered' : 'Dominadas'}
              </span>
              <div className="font-serif text-2xl font-bold text-emerald-700">
                {masteredCount} <span className="text-xs text-stone-400 font-normal">/ 1000</span>
              </div>
              <span className="text-[10px] text-stone-400">
                {percentMastered}% {lang === 'en' ? 'unlocked' : 'completado'}
              </span>
            </div>

            <div className="h-8 w-px bg-stone-200" />

            <div className="text-center">
              <span className="text-[11px] text-stone-500 font-medium block mb-0.5">
                {lang === 'en' ? 'In Review' : 'En repaso'}
              </span>
              <div className="font-serif text-2xl font-bold text-amber-700">
                {reviewCount}
              </div>
              <span className="text-[10px] text-stone-400">
                {lang === 'en' ? 'active pool' : 'en práctica'}
              </span>
            </div>
          </div>
        </div>

        {/* Filters & Control Bar */}
        <div className="mt-6 pt-6 border-t border-amber-200/60 flex flex-wrap items-center justify-between gap-4">
          {/* Tiers & Randomize Toggle */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Randomize toggle */}
            <button
              type="button"
              onClick={() => setIsRandomized(!isRandomized)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                isRandomized
                  ? 'bg-amber-800 text-white shadow-2xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
              title={lang === 'en' ? 'Toggle shuffle order' : 'Alternar orden aleatorio'}
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>{isRandomized ? (lang === 'en' ? 'Shuffled' : 'Aleatorio') : (lang === 'en' ? 'Rank Order' : 'Por Rango')}</span>
            </button>

            {/* Session Batch Size Selector */}
            <div className="flex items-center gap-1 bg-stone-200/50 p-1 rounded-xl">
              <span className="text-stone-400 text-[11px] px-1 font-medium">
                {lang === 'en' ? 'Pack:' : 'Lote:'}
              </span>
              {[
                { size: 10, label: '10' },
                { size: 25, label: '25' },
                { size: 0, label: lang === 'en' ? 'All' : 'Todo' },
              ].map((b) => (
                <button
                  key={b.size}
                  type="button"
                  onClick={() => setSessionBatchSize(b.size)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    sessionBatchSize === b.size
                      ? 'bg-white text-stone-900 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>

            {/* Frequency Tiers */}
            <div className="flex items-center gap-1">
              {[
                { id: 'all', label: lang === 'en' ? '1-1000' : '1-1000' },
                { id: '1-100', label: '1-100 Core' },
                { id: '101-250', label: '101-250' },
                { id: '251-500', label: '251-500' },
                { id: '501-1000', label: '501-1000' },
              ].map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setTierFilter(tier.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition cursor-pointer ${
                    tierFilter === tier.id
                      ? 'bg-stone-900 text-white font-medium'
                      : 'bg-white/80 text-stone-600 hover:bg-white border border-stone-200'
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          {/* Flashcard vs Table Switch */}
          <div className="flex items-center gap-1 bg-stone-200/60 p-1 rounded-xl text-xs font-medium">
            <button
              type="button"
              onClick={() => setViewMode('flashcard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'flashcard'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              <span>{lang === 'en' ? 'Study Deck' : 'Mazo'}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <List className="w-3.5 h-3.5 text-indigo-600" />
              <span>{lang === 'en' ? 'Dictionary View' : 'Diccionario'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* FLASHCARD MODE */}
      {viewMode === 'flashcard' && (
        <div className="max-w-xl mx-auto space-y-4">
          {/* SESSION COMPLETED SUMMARY SCREEN */}
          {isSessionFinished ? (
            <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-8 text-center space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
                <Award className="w-8 h-8 text-amber-600" />
              </div>

              <div>
                <h3 className="font-serif text-3xl font-bold text-stone-900">
                  {lang === 'en' ? 'Session Complete! 🎉' : '¡Sesión Completada! 🎉'}
                </h3>
                <p className="text-sm text-stone-600 mt-1">
                  {lang === 'en'
                    ? `You reviewed ${sessionStats.totalStudied} cards in this randomized batch.`
                    : `Has revisado ${sessionStats.totalStudied} tarjetas en este lote aleatorio.`}
                </p>
              </div>

              {/* Stats breakdown */}
              <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/70">
                  <span className="text-xs text-rose-800 font-medium block">
                    {lang === 'en' ? 'Hard (Again)' : 'Difíciles'}
                  </span>
                  <span className="font-serif text-2xl font-bold text-rose-900">
                    {sessionStats.againCount}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/70">
                  <span className="text-xs text-amber-800 font-medium block">
                    {lang === 'en' ? 'Hesitant' : 'Dudosas'}
                  </span>
                  <span className="font-serif text-2xl font-bold text-amber-900">
                    {sessionStats.okayCount}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/70">
                  <span className="text-xs text-emerald-800 font-medium block">
                    {lang === 'en' ? 'Mastered' : 'Dominadas'}
                  </span>
                  <span className="font-serif text-2xl font-bold text-emerald-900">
                    {sessionStats.masteredCount}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={initializeDeck}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{lang === 'en' ? 'Start Another 10-Pack' : 'Comenzar otro lote de 10'}</span>
                </button>
              </div>
            </div>
          ) : currentWord ? (
            <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 space-y-6">
              {/* Card Meta & Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                      #{currentWord.rank} of 1,000
                    </span>
                    <span className="capitalize px-2 py-0.5 rounded-md bg-stone-100 font-medium text-stone-600">
                      {currentWord.partOfSpeech}
                    </span>
                  </div>

                  <span className="text-xs text-stone-500 font-medium">
                    {lang === 'en' ? 'Card' : 'Tarjeta'} {currentDeckIndex + 1} / {deck.length}
                  </span>
                </div>

                {/* Batch Progress Bar */}
                <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${((currentDeckIndex + 1) / deck.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* FLIP CARD AREA */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="min-h-[250px] p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-stone-50 to-stone-100/60 border border-stone-200 flex flex-col items-center justify-center text-center cursor-pointer hover:border-amber-400 transition select-none relative"
              >
                <span className="absolute top-3 right-3 text-[11px] text-stone-400 flex items-center gap-1">
                  <RotateCw className="w-3 h-3" />
                  <span>{lang === 'en' ? 'Tap or press [Space] to flip' : 'Toca o pulsa [Espacio]'}</span>
                </span>

                {!isFlipped ? (
                  <div className="space-y-4">
                    <h3 className="font-serif text-4xl sm:text-5xl font-bold text-stone-900 tracking-tight">
                      {currentWord.word}
                    </h3>

                    <div onClick={(e) => e.stopPropagation()}>
                      <AudioButton text={currentWord.word} variant="pill" label="Pronunciar" />
                    </div>

                    <p className="text-xs text-stone-400 pt-2">
                      {lang === 'en'
                        ? 'Do you recognize this word? Tap to check!'
                        : '¿Reconoces esta palabra? Toca para comprobar.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fade-in w-full">
                    <div className="space-y-1">
                      <p className="text-2xl sm:text-3xl font-bold text-amber-900 font-serif">
                        {currentWord.translation}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-white/90 border border-stone-200/80 text-left space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-serif text-stone-800 text-sm leading-relaxed">
                          «{currentWord.exampleSentence}»
                        </p>
                        <div onClick={(e) => e.stopPropagation()}>
                          <AudioButton text={currentWord.exampleSentence} rate={0.88} />
                        </div>
                      </div>
                      <p className="text-xs text-stone-500">
                        {currentWord.exampleTranslation}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* RATING BUTTONS (WHEN FLIPPED) */}
              {isFlipped ? (
                <div className="space-y-2 pt-1 animate-fade-in">
                  <div className="text-center text-[11px] text-stone-400 mb-1 font-medium">
                    {lang === 'en' ? 'How well did you know it?' : '¿Cómo te fue con esta palabra?'}
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {/* Again / Hard */}
                    <button
                      type="button"
                      onClick={() => handleRateCard('again')}
                      className="p-3 rounded-2xl border border-rose-200 bg-rose-50/80 hover:bg-rose-100 text-rose-900 font-medium text-xs sm:text-sm transition cursor-pointer flex flex-col items-center gap-1 shadow-2xs group"
                    >
                      <span className="font-bold flex items-center gap-1">
                        <RotateCw className="w-3.5 h-3.5 text-rose-600 group-hover:rotate-180 transition duration-300" />
                        {lang === 'en' ? 'Hard' : 'Difícil'}
                      </span>
                      <span className="text-[10px] text-rose-600 font-normal">
                        {lang === 'en' ? 'Repeat soon [1]' : 'Repetir [1]'}
                      </span>
                    </button>

                    {/* Okay / Hesitant */}
                    <button
                      type="button"
                      onClick={() => handleRateCard('okay')}
                      className="p-3 rounded-2xl border border-amber-200 bg-amber-50/80 hover:bg-amber-100 text-amber-900 font-medium text-xs sm:text-sm transition cursor-pointer flex flex-col items-center gap-1 shadow-2xs"
                    >
                      <span className="font-bold flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                        {lang === 'en' ? 'Okay' : 'Duda'}
                      </span>
                      <span className="text-[10px] text-amber-700 font-normal">
                        {lang === 'en' ? 'Hesitant [2]' : 'Revisar [2]'}
                      </span>
                    </button>

                    {/* Mastered / Easy */}
                    <button
                      type="button"
                      onClick={() => handleRateCard('mastered')}
                      className="p-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-900 font-medium text-xs sm:text-sm transition cursor-pointer flex flex-col items-center gap-1 shadow-2xs"
                    >
                      <span className="font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        {lang === 'en' ? 'I Know It!' : '¡Dominada!'}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-normal">
                        {lang === 'en' ? 'Mastered [3]' : 'Fácil [3]'}
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (currentDeckIndex > 0) {
                        setCurrentDeckIndex((prev) => prev - 1);
                        setIsFlipped(false);
                      }
                    }}
                    disabled={currentDeckIndex === 0}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-500 hover:bg-stone-100 disabled:opacity-30 transition cursor-pointer flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{lang === 'en' ? 'Previous' : 'Anterior'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsFlipped(true)}
                    className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition shadow-xs cursor-pointer"
                  >
                    {lang === 'en' ? 'Show Translation [Space]' : 'Ver Traducción [Espacio]'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (currentDeckIndex + 1 < deck.length) {
                        setCurrentDeckIndex((prev) => prev + 1);
                        setIsFlipped(false);
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-500 hover:bg-stone-100 transition cursor-pointer flex items-center gap-1"
                  >
                    <span>{lang === 'en' ? 'Skip' : 'Saltar'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 text-stone-500">
              {lang === 'en' ? 'No words found in this filter pool.' : 'No se encontraron palabras con este filtro.'}
            </div>
          )}
        </div>
      )}

      {/* DICTIONARY / TABLE VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden p-6 space-y-4">
          {/* Search bar & Status filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'en' ? 'Search by word, translation, or rank...' : 'Buscar por palabra, significado o rango...'}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              {[
                { id: 'all', label: lang === 'en' ? 'All' : 'Todas' },
                { id: 'needs-review', label: lang === 'en' ? 'In Review' : 'En repaso' },
                { id: 'unseen', label: lang === 'en' ? 'Unseen' : 'Sin ver' },
                { id: 'mastered', label: lang === 'en' ? 'Mastered' : 'Dominadas' },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatusFilter(st.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
                    statusFilter === st.id
                      ? 'bg-amber-900 text-white shadow-2xs font-semibold'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-stone-100 max-h-[600px] overflow-y-auto">
            {filteredPool.map((item) => {
              const state = wordStates[item.rank];
              return (
                <div
                  key={item.rank}
                  className="py-3 px-2 hover:bg-stone-50/80 rounded-xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="font-mono text-xs font-semibold text-stone-400 w-12 shrink-0">
                      #{item.rank}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-lg font-bold text-stone-900">
                          {item.word}
                        </span>
                        <AudioButton text={item.word} />
                        <span className="text-[11px] font-medium text-stone-400 px-1.5 py-0.5 rounded bg-stone-100">
                          {item.partOfSpeech}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-amber-900 mt-0.5">
                        {item.translation}
                      </p>
                      <p className="font-serif text-xs text-stone-500 mt-1 italic">
                        «{item.exampleSentence}»
                      </p>
                    </div>
                  </div>

                  {/* Status chip */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {state === 'mastered' && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {lang === 'en' ? 'Mastered' : 'Dominada'}
                      </span>
                    )}
                    {state === 'again' && (
                      <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-semibold">
                        {lang === 'en' ? 'Hard' : 'Difícil'}
                      </span>
                    )}
                    {state === 'okay' && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold">
                        {lang === 'en' ? 'Okay' : 'Duda'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

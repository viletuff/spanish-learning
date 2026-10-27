import React, { useState } from 'react';
import {
  Compass,
  Search,
  Plus,
  Sparkles,
  Layers,
  Trash2,
  X,
  Loader2,
  Tv
} from 'lucide-react';
import { VocabWord } from '../types';
import { AudioButton } from './AudioButton';
import { aiService } from '../services/aiService';
import { storageService } from '../services/storage';
import { useTranslation } from '../services/i18n';

interface CuriosityVaultProps {
  words: VocabWord[];
  onWordAdded: (word: VocabWord) => void;
  onWordUpdated: (id: string, updates: Partial<VocabWord>) => void;
  onWordDeleted: (id: string) => void;
}

export const CuriosityVault: React.FC<CuriosityVaultProps> = ({
  words,
  onWordAdded,
  onWordDeleted,
}) => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFlashcardMode, setIsFlashcardMode] = useState(false);

  // New Word Form State
  const [newTerm, setNewTerm] = useState('');
  const [newContext, setNewContext] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [newCategory, setNewCategory] = useState<VocabWord['category']>('psychology');
  const [newExample, setNewExample] = useState('');
  const [newExampleTr, setNewExampleTr] = useState('');
  const [newInsight, setNewInsight] = useState('');
  const [newPrompt, setNewPrompt] = useState('');
  const [isEnriching, setIsEnriching] = useState(false);

  // Flashcard Mode State
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const filteredWords = words.filter((w) => {
    const matchesCategory = activeCategory === 'all' || w.category === activeCategory;
    const matchesQuery =
      w.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.contextSource && w.contextSource.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (w.psychologyInsight && w.psychologyInsight.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  const handleEnrichWithAI = async () => {
    if (!newTerm.trim() || isEnriching) return;
    setIsEnriching(true);
    try {
      const enriched = await aiService.enrichWord(newTerm, newContext);
      if (enriched.translation) setNewTranslation(enriched.translation);
      if (enriched.category) setNewCategory(enriched.category);
      if (enriched.exampleSentence) setNewExample(enriched.exampleSentence);
      if (enriched.exampleTranslation) setNewExampleTr(enriched.exampleTranslation);
      if (enriched.psychologyInsight) setNewInsight(enriched.psychologyInsight);
      if (enriched.personalReflectionPrompt) setNewPrompt(enriched.personalReflectionPrompt);
    } catch (err) {
      console.error('Enrich word failed:', err);
    } finally {
      setIsEnriching(false);
    }
  };

  const handleSaveWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerm.trim() || !newTranslation.trim()) return;

    const saved = storageService.addVocabWord({
      term: newTerm.trim(),
      translation: newTranslation.trim(),
      category: newCategory,
      contextSource: newContext.trim() || 'Anotado manualmente',
      exampleSentence: newExample.trim() || `Suelo usar "${newTerm}" en mis reflexiones.`,
      exampleTranslation: newExampleTr.trim() || `I usually use "${newTerm}" in my reflections.`,
      psychologyInsight: newInsight.trim() || 'Concepto enriquecedor para pensar en español.',
      personalReflectionPrompt: newPrompt.trim() || '¿Cómo conecta esta palabra con tu vida hoy?',
      masteryLevel: 1,
      tags: [newCategory],
    });

    onWordAdded(saved);
    setIsAddModalOpen(false);

    // Reset fields
    setNewTerm('');
    setNewContext('');
    setNewTranslation('');
    setNewExample('');
    setNewExampleTr('');
    setNewInsight('');
    setNewPrompt('');
  };

  const currentFlashcard = filteredWords[cardIndex % (filteredWords.length || 1)];

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="bg-gradient-to-br from-amber-500/10 via-amber-50 to-stone-50 border border-amber-200/80 rounded-3xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-900 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-600" />
              {t.vault.badge} ({words.length})
            </span>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 tracking-tight mt-1 mb-2">
            {t.vault.title}
          </h1>
          <p className="text-stone-600 text-sm max-w-xl">
            {t.vault.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsFlashcardMode(!isFlashcardMode)}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer flex items-center gap-2 ${
              isFlashcardMode
                ? 'bg-amber-800 text-white shadow-xs'
                : 'bg-white text-stone-800 border border-stone-200 hover:bg-stone-50 shadow-2xs'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-600" />
            <span>{isFlashcardMode ? t.vault.fullListBtn : t.vault.memoryGardenBtn}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold transition cursor-pointer shadow-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t.vault.addWordBtn}</span>
          </button>
        </div>
      </div>

      {/* FLASHCARD RELAXED MEMORY GARDEN MODE */}
      {isFlashcardMode && currentFlashcard && (
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 md:p-8 space-y-6 max-w-xl mx-auto">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>
              {t.vault.cardOf} {cardIndex + 1} / {filteredWords.length}
            </span>
            <span className="capitalize px-2 py-0.5 rounded-md bg-stone-100 font-medium text-stone-600">
              {currentFlashcard.category}
            </span>
          </div>

          {/* Flip container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[220px] p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-stone-50 to-stone-100/60 border border-stone-200 flex flex-col items-center justify-center text-center cursor-pointer hover:border-amber-400 transition select-none relative"
          >
            <span className="absolute top-3 right-3 text-[11px] text-stone-400">
              {t.vault.tapToFlip}
            </span>

            {!isFlipped ? (
              <div className="space-y-3">
                <h3 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
                  {currentFlashcard.term}
                </h3>
                {currentFlashcard.contextSource && (
                  <p className="text-xs text-stone-500">
                    {t.vault.seenIn} {currentFlashcard.contextSource}
                  </p>
                )}
                <div onClick={(e) => e.stopPropagation()}>
                  <AudioButton text={currentFlashcard.term} variant="pill" />
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <p className="text-xl sm:text-2xl font-bold text-amber-900">
                  {currentFlashcard.translation}
                </p>
                <p className="font-serif text-base text-stone-700 italic">
                  «{currentFlashcard.exampleSentence}»
                </p>
                {currentFlashcard.psychologyInsight && (
                  <p className="text-xs text-stone-600 max-w-md bg-white/70 p-3 rounded-xl border border-stone-200/60">
                    {currentFlashcard.psychologyInsight}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                setIsFlipped(false);
                setCardIndex((prev) => (prev > 0 ? prev - 1 : filteredWords.length - 1));
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition cursor-pointer"
            >
              {t.vault.prevBtn}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsFlipped(false);
                setCardIndex((prev) => (prev + 1) % filteredWords.length);
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
            >
              {t.vault.nextBtn}
            </button>
          </div>
        </div>
      )}

      {/* LIST / GRID VIEW */}
      {!isFlashcardMode && (
        <>
          {/* Search & Category filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.vault.searchPlaceholder}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: t.vault.catAll },
                { id: 'psychology', label: t.vault.catPsych },
                { id: 'conversational', label: t.vault.catConv },
                { id: 'tv-slang', label: t.vault.catTv },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-amber-800 text-white shadow-2xs'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          {filteredWords.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-stone-200/80 space-y-3">
              <Compass className="w-8 h-8 text-stone-400 mx-auto" />
              <h3 className="font-serif text-lg font-bold text-stone-700">
                {t.vault.noResultsTitle}
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                {t.vault.noResultsDesc}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredWords.map((word) => (
                <div
                  key={word.id}
                  className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs p-5 hover:border-amber-300 hover:shadow-xs transition duration-200 flex flex-col justify-between space-y-4"
                >
                  <div>
                    {/* Top Row: Term + Audio + Category */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif text-2xl font-bold text-stone-900">
                            {word.term}
                          </h3>
                          <AudioButton text={word.term} />
                        </div>
                        <p className="text-base text-amber-900 font-semibold mt-0.5">
                          {word.translation}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-medium capitalize px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                          {word.category}
                        </span>
                        <button
                          type="button"
                          onClick={() => onWordDeleted(word.id)}
                          className="p-1 text-stone-300 hover:text-rose-500 rounded-md transition cursor-pointer"
                          title={t.vault.deleteTooltip}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {word.contextSource && (
                      <div className="mt-2 text-xs text-stone-500 flex items-center gap-1">
                        <Tv className="w-3 h-3 text-stone-400" />
                        <span>{t.vault.seenIn} {word.contextSource}</span>
                      </div>
                    )}

                    {/* Example Sentence */}
                    <div className="mt-3 p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs sm:text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-serif text-stone-800 leading-snug">
                          «{word.exampleSentence}»
                        </p>
                        <AudioButton text={word.exampleSentence} rate={0.88} />
                      </div>
                      <p className="text-stone-500 text-xs mt-1">
                        {word.exampleTranslation}
                      </p>
                    </div>

                    {/* Psychological insight */}
                    {word.psychologyInsight && (
                      <div className="mt-3 text-xs text-stone-600 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/50 leading-relaxed">
                        <span className="font-semibold text-amber-900 block mb-0.5">
                          {t.vault.insightHeading}
                        </span>
                        {word.psychologyInsight}
                      </div>
                    )}
                  </div>

                  {/* Reflection prompt */}
                  {word.personalReflectionPrompt && (
                    <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500 italic">
                      💡 {word.personalReflectionPrompt}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ADD WORD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-5 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif text-2xl font-bold text-stone-900">
                {t.vault.modalTitle}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWord} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
                  {t.vault.termLabel}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTerm}
                    onChange={(e) => setNewTerm(e.target.value)}
                    placeholder={t.vault.termPlaceholder}
                    required
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleEnrichWithAI}
                    disabled={!newTerm.trim() || isEnriching}
                    className="px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold transition flex items-center gap-1.5 shrink-0 disabled:opacity-40 cursor-pointer"
                  >
                    {isEnriching ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    )}
                    <span>{t.vault.enrichBtn}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
                  {t.vault.contextLabel}
                </label>
                <input
                  type="text"
                  value={newContext}
                  onChange={(e) => setNewContext(e.target.value)}
                  placeholder={t.vault.contextPlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
                  {t.vault.transLabel}
                </label>
                <input
                  type="text"
                  value={newTranslation}
                  onChange={(e) => setNewTranslation(e.target.value)}
                  placeholder={t.vault.transPlaceholder}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
                    {t.vault.categoryLabel}
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as VocabWord['category'])}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-800 text-xs"
                  >
                    <option value="psychology">Psicología & Mente</option>
                    <option value="conversational">Conversación & Amistad</option>
                    <option value="tv-slang">Series & Coloquial</option>
                    <option value="emotional">Emocional</option>
                    <option value="daily-life">Vida Cotidiana</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
                  {t.vault.exampleLabel}
                </label>
                <input
                  type="text"
                  value={newExample}
                  onChange={(e) => setNewExample(e.target.value)}
                  placeholder={t.vault.examplePlaceholder}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-800 text-xs font-serif"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
                  {t.vault.insightLabel}
                </label>
                <textarea
                  value={newInsight}
                  onChange={(e) => setNewInsight(e.target.value)}
                  placeholder={t.vault.insightPlaceholder}
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-800 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-medium cursor-pointer"
                >
                  {t.vault.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
                >
                  {t.vault.saveWordBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

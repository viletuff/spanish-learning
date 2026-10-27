import React, { useState } from 'react';
import {
  Wine,
  Tv,
  Sparkles,
  Loader2,
  Check,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';
import { VocabWord, GeneratedStory } from '../types';
import { AudioButton } from './AudioButton';
import { AccentBar } from './AccentBar';
import { aiService, MediaBreakdownResult } from '../services/aiService';
import { storageService } from '../services/storage';
import { useTranslation } from '../services/i18n';

interface DeepImmersionProps {
  vaultWords: VocabWord[];
  onWordAdded: (word: VocabWord) => void;
  onActivityDone: () => void;
}

export const DeepImmersion: React.FC<DeepImmersionProps> = ({
  vaultWords,
  onWordAdded,
  onActivityDone,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'media' | 'story'>('media');

  // Media Tab State
  const [sourceTitle, setSourceTitle] = useState('');
  const [mediaSnippet, setMediaSnippet] = useState('');
  const [isAnalyzingMedia, setIsAnalyzingMedia] = useState(false);
  const [mediaResult, setMediaResult] = useState<MediaBreakdownResult | null>(null);

  // Story Weaver State
  const [selectedWordIds, setSelectedWordIds] = useState<string[]>(
    vaultWords.slice(0, 3).map((w) => w.id)
  );
  const [isWeaving, setIsWeaving] = useState(false);
  const [currentStory, setCurrentStory] = useState<GeneratedStory | null>(() => {
    const existing = storageService.getStories();
    return existing.length > 0 ? existing[0] : null;
  });
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const handleInsertChar = (char: string) => {
    if (activeTab === 'media') setMediaSnippet((prev) => prev + char);
  };

  const handleAnalyzeMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaSnippet.trim() || isAnalyzingMedia) return;

    setIsAnalyzingMedia(true);
    try {
      const result = await aiService.analyzeMediaSnippet(mediaSnippet, sourceTitle || 'Serie o Podcast');
      setMediaResult(result);

      storageService.saveMediaSnippet({
        sourceTitle: sourceTitle || 'Serie / Podcast en español',
        rawText: mediaSnippet,
        breakdown: result.phrases,
        culturalNote: result.culturalNote,
      });

      storageService.recordDailyActivity(20);
      onActivityDone();
    } catch (err) {
      console.error('Media breakdown failed:', err);
    } finally {
      setIsAnalyzingMedia(false);
    }
  };

  const handleWeaveStory = async () => {
    if (isWeaving) return;
    setIsWeaving(true);
    try {
      const targetWords = vaultWords.filter((w) => selectedWordIds.includes(w.id));
      const story = await aiService.generateStory(targetWords);
      setCurrentStory(story);
      storageService.saveStory(story);
      setSelectedOption(null);
      setQuizSubmitted(false);

      storageService.recordDailyActivity(25);
      onActivityDone();
    } catch (err) {
      console.error('Story weaving failed:', err);
    } finally {
      setIsWeaving(false);
    }
  };

  const handleSavePhraseToVault = (item: { phrase: string; natural: string; nuance: string; literal: string }) => {
    const newWord = storageService.addVocabWord({
      term: item.phrase,
      translation: item.natural,
      category: 'tv-slang',
      contextSource: sourceTitle || 'Serie de televisión',
      exampleSentence: mediaSnippet,
      exampleTranslation: item.literal,
      psychologyInsight: item.nuance,
      personalReflectionPrompt: '¿En qué situación cotidiana podrías usar esta expresión?',
      masteryLevel: 1,
      tags: ['series', 'coloquial'],
    });

    onWordAdded(newWord);
  };

  const toggleSelectWord = (id: string) => {
    setSelectedWordIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="bg-gradient-to-br from-purple-500/10 via-purple-50 to-stone-50 border border-purple-200/80 rounded-3xl p-6 md:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-900 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Wine className="w-3.5 h-3.5 text-purple-600" />
            {t.deep.badge}
          </span>
        </div>

        <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 tracking-tight mt-1 mb-2">
          {t.deep.title}
        </h1>
        <p className="text-stone-600 text-sm max-w-xl">
          {t.deep.subtitle}
        </p>

        {/* Sub-tabs */}
        <div className="flex flex-wrap gap-2 mt-6">
          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'media'
                ? 'bg-purple-900 text-white shadow-xs'
                : 'bg-white/80 text-stone-700 hover:bg-white border border-stone-200'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>{t.deep.tabMedia}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('story')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'story'
                ? 'bg-purple-900 text-white shadow-xs'
                : 'bg-white/80 text-stone-700 hover:bg-white border border-stone-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{t.deep.tabStory}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: MEDIA BREAKDOWN */}
      {activeTab === 'media' && (
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 md:p-8 space-y-6">
          <div>
            <h3 className="font-serif text-2xl font-bold text-stone-900">
              {t.deep.mediaHeading}
            </h3>
            <p className="text-sm text-stone-600 mt-1">
              {t.deep.mediaSubtitle}
            </p>
          </div>

          <form onSubmit={handleAnalyzeMedia} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                  {t.deep.sourceLabel}
                </label>
                <input
                  type="text"
                  value={sourceTitle}
                  onChange={(e) => setSourceTitle(e.target.value)}
                  placeholder={t.deep.sourcePlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                  {t.deep.quoteLabel}
                </label>
                <textarea
                  value={mediaSnippet}
                  onChange={(e) => setMediaSnippet(e.target.value)}
                  placeholder={t.deep.quotePlaceholder}
                  rows={3}
                  className="w-full p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <AccentBar onInsert={handleInsertChar} />

              <button
                type="submit"
                disabled={!mediaSnippet.trim() || isAnalyzingMedia}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-medium text-sm transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isAnalyzingMedia ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.deep.analyzingBtn}</span>
                  </>
                ) : (
                  <>
                    <Tv className="w-4 h-4" />
                    <span>{t.deep.breakdownBtn}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Breakdown Results */}
          {mediaResult && (
            <div className="pt-6 border-t border-stone-200 space-y-5 animate-fade-in">
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-purple-900 block mb-0.5">
                    {t.deep.vibeLabel}
                  </span>
                  <span className="font-semibold text-purple-950 text-sm">
                    {mediaResult.vibe}
                  </span>
                </div>
                <AudioButton text={mediaSnippet} variant="pill" label={t.deep.listenFullQuote} />
              </div>

              {mediaResult.culturalNote && (
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs md:text-sm text-stone-700 leading-relaxed">
                  <span className="font-semibold text-stone-900 block mb-1">
                    {t.deep.culturalNoteHeading}
                  </span>
                  {mediaResult.culturalNote}
                </div>
              )}

              <div className="space-y-3">
                <h4 className="font-semibold text-stone-900 text-sm">
                  {t.deep.breakdownDetailHeading}
                </h4>
                {mediaResult.phrases.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-lg font-bold text-stone-900">
                            «{item.phrase}»
                          </span>
                          <AudioButton text={item.phrase} />
                        </div>
                        <p className="text-sm font-medium text-purple-900 mt-1">
                          {t.deep.realMeaning} {item.natural}
                        </p>
                        <p className="text-xs text-stone-500">
                          {t.deep.literalMeaning} {item.literal}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSavePhraseToVault(item)}
                        className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer shrink-0"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>{t.deep.addToVaultBtn}</span>
                      </button>
                    </div>

                    <p className="text-xs text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-100">
                      <strong>{t.deep.nuanceLabel}</strong> {item.nuance}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STORY WEAVER */}
      {activeTab === 'story' && (
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 md:p-8 space-y-6">
          <div>
            <h3 className="font-serif text-2xl font-bold text-stone-900">
              {t.deep.storyHeading}
            </h3>
            <p className="text-sm text-stone-600 mt-1">
              {t.deep.storySubtitle}
            </p>
          </div>

          {/* Word selectors */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              {t.deep.selectWordsLabel} ({selectedWordIds.length}/3 {t.deep.selectedCount}):
            </span>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-stone-50 rounded-2xl border border-stone-200">
              {vaultWords.map((word) => {
                const isSelected = selectedWordIds.includes(word.id);
                return (
                  <button
                    key={word.id}
                    type="button"
                    onClick={() => toggleSelectWord(word.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-purple-900 text-white shadow-xs'
                        : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
                    }`}
                  >
                    <span>{word.term}</span>
                    {isSelected && <Check className="w-3 h-3 text-purple-200" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleWeaveStory}
              disabled={isWeaving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-medium text-sm transition shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isWeaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.deep.weavingStoryBtn}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t.deep.weaveStoryBtn}</span>
                </>
              )}
            </button>
          </div>

          {/* Current Story Card */}
          {currentStory && (
            <div className="pt-6 border-t border-stone-200 space-y-6 animate-fade-in">
              <div className="bg-stone-50/70 rounded-3xl p-6 md:p-8 border border-stone-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-serif text-2xl font-bold text-stone-900">
                      {currentStory.title}
                    </h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {t.deep.integratedWords} {currentStory.targetWordsUsed.join(' · ')}
                    </p>
                  </div>

                  <AudioButton
                    text={currentStory.spanishText}
                    rate={0.88}
                    variant="button"
                    label={t.deep.listenStoryBtn}
                  />
                </div>

                <div className="my-4 text-stone-800 font-serif text-lg leading-relaxed space-y-3">
                  <p>{currentStory.spanishText}</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-stone-200/80 text-xs text-stone-600">
                  <span className="font-semibold text-stone-800 block mb-1">
                    {t.deep.englishSummaryHeading}
                  </span>
                  {currentStory.englishSummary}
                </div>
              </div>

              {/* Comprehension Quiz */}
              {currentStory.comprehensionQuestion && (
                <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
                  <h4 className="font-semibold text-stone-900 text-sm flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-purple-600" />
                    {t.deep.comprehensionHeading}
                  </h4>
                  <p className="font-serif text-base text-stone-900">
                    {currentStory.comprehensionQuestion.question}
                  </p>

                  <div className="space-y-2">
                    {currentStory.comprehensionQuestion.options.map((opt, idx) => {
                      const isCorrect = idx === currentStory.comprehensionQuestion.correctIndex;
                      const isChosen = selectedOption === idx;

                      let btnStyle = 'border-stone-200 hover:bg-stone-50';
                      if (quizSubmitted) {
                        if (isCorrect) {
                          btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-medium';
                        } else if (isChosen) {
                          btnStyle = 'border-rose-400 bg-rose-50 text-rose-950';
                        }
                      } else if (isChosen) {
                        btnStyle = 'border-purple-600 bg-purple-50';
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={quizSubmitted}
                          onClick={() => setSelectedOption(idx)}
                          className={`w-full p-3.5 rounded-xl border text-left text-sm transition cursor-pointer flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {quizSubmitted && isCorrect && (
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {!quizSubmitted ? (
                    <button
                      type="button"
                      disabled={selectedOption === null}
                      onClick={() => setQuizSubmitted(true)}
                      className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition disabled:opacity-40 cursor-pointer"
                    >
                      {t.deep.checkAnswerBtn}
                    </button>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                      <strong>{t.deep.explanationHeading}</strong> {currentStory.comprehensionQuestion.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  BookOpen,
  Loader2,
  Check,
  PlusCircle,
  MessageCircle,
  BookmarkPlus
} from 'lucide-react';
import { AccentBar } from './AccentBar';
import { AudioButton } from './AudioButton';
import { aiService, PolishResult } from '../services/aiService';
import { storageService } from '../services/storage';
import { DAILY_PROMPTS } from '../data/dailyPrompts';
import { VocabWord } from '../types';
import { useTranslation } from '../services/i18n';

interface MicroDiaryProps {
  onActivityDone: () => void;
  onWordAdded: (word: VocabWord) => void;
}

export const MicroDiary: React.FC<MicroDiaryProps> = ({ onActivityDone, onWordAdded }) => {
  const { lang, t } = useTranslation();
  const [diaryText, setDiaryText] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);
  const [result, setResult] = useState<PolishResult | null>(null);
  const [savedWordsMap, setSavedWordsMap] = useState<Record<string, boolean>>({});
  const [activePromptIndex, setActivePromptIndex] = useState(0);

  const currentPrompt = DAILY_PROMPTS[activePromptIndex % DAILY_PROMPTS.length];

  const handleInsertChar = (char: string) => {
    setDiaryText((prev) => prev + char);
  };

  const handleCyclePrompt = () => {
    setActivePromptIndex((prev) => prev + 1);
  };

  const handleUsePromptStarter = () => {
    setDiaryText((prev) => {
      if (!prev) return currentPrompt.suggestedStarter + ' ';
      return prev + ' ' + currentPrompt.suggestedStarter + ' ';
    });
  };

  const handlePolish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diaryText.trim() || isPolishing) return;

    setIsPolishing(true);
    try {
      const polishRes = await aiService.polishJournal(diaryText);
      setResult(polishRes);

      // Save to journal
      storageService.saveJournalEntry({
        date: new Date().toISOString().split('T')[0],
        rawText: diaryText,
        polishedText: polishRes.polishedText,
        polishExplanation: polishRes.explanation,
        extractedVocab: polishRes.extractedVocab,
        aiFeedback: polishRes.encouragement,
        timeSpentMinutes: 15,
      });

      onActivityDone();

      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#10b981', '#f59e0b', '#3b82f6'],
        });
      } catch {
        // ignore
      }
    } catch (err) {
      console.error('Error polishing journal:', err);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleSaveExtractedWord = (vocabItem: { term: string; meaning: string }) => {
    const newWord = storageService.addVocabWord({
      term: vocabItem.term,
      translation: vocabItem.meaning,
      category: 'conversational',
      contextSource: 'Mi diario personal',
      exampleSentence: result?.polishedText || diaryText,
      exampleTranslation: 'De mi propia entrada del diario.',
      psychologyInsight: 'Palabra extraída directamente de tu propia vida y reflexiones diarias.',
      personalReflectionPrompt: '¿Cómo podrías usar esta palabra en una conversación real esta semana?',
      masteryLevel: 1,
      tags: ['diario', 'vida real'],
    });

    setSavedWordsMap((prev) => ({ ...prev, [vocabItem.term]: true }));
    onWordAdded(newWord);
  };

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-50 to-stone-50 border border-emerald-200/80 rounded-3xl p-6 md:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-900 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            {t.diary.badge}
          </span>
        </div>

        <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 tracking-tight mt-1 mb-2">
          {t.diary.title}
        </h1>
        <p className="text-stone-600 text-sm max-w-xl">
          {t.diary.subtitle}
        </p>
      </div>

      {/* Writing Box & Prompt */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 md:p-8 space-y-5">
        {/* Prompt suggestion */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {t.diary.kickstarter}
            </div>
            <p className="text-sm font-medium text-stone-800">
              {currentPrompt.spanish}
            </p>
            <p className="text-xs text-stone-500 mt-0.5">
              {currentPrompt.english}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleUsePromptStarter}
              className="px-3 py-1.5 rounded-lg bg-emerald-100/70 hover:bg-emerald-200/80 text-emerald-900 text-xs font-medium transition cursor-pointer"
            >
              {t.diary.useStarterBtn}
            </button>
            <button
              type="button"
              onClick={handleCyclePrompt}
              className="px-3 py-1.5 rounded-lg bg-stone-200/70 hover:bg-stone-300 text-stone-700 text-xs font-medium transition cursor-pointer"
            >
              {t.diary.anotherIdeaBtn}
            </button>
          </div>
        </div>

        {/* Text area form */}
        <form onSubmit={handlePolish} className="space-y-4">
          <div className="relative">
            <textarea
              value={diaryText}
              onChange={(e) => setDiaryText(e.target.value)}
              placeholder={t.diary.placeholder}
              rows={5}
              className="w-full p-4 md:p-5 rounded-2xl border border-stone-200 bg-stone-50/40 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition text-base font-serif leading-relaxed"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <AccentBar onInsert={handleInsertChar} />

            <button
              type="submit"
              disabled={!diaryText.trim() || isPolishing}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPolishing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.diary.polishingBtn}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t.diary.polishBtn}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Polished Result Panel */}
        {result && (
          <div className="mt-8 pt-8 border-t border-stone-200/80 space-y-6 animate-fade-in">
            {/* Encouragement banner */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-medium flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{result.encouragement}</span>
            </div>

            {/* Side-by-side or comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original */}
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200">
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-2">
                  {t.diary.whatYouWrote}
                </span>
                <p className="font-serif text-base text-stone-700 italic">
                  «{diaryText}»
                </p>
              </div>

              {/* Polished native version */}
              <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
                    {t.diary.polishedNative}
                  </span>
                  <AudioButton text={result.polishedText} rate={0.88} variant="pill" />
                </div>
                <p className="font-serif text-base text-stone-900 font-medium leading-relaxed">
                  «{result.polishedText}»
                </p>
              </div>
            </div>

            {/* Explanation of nuances */}
            <div className="p-5 rounded-2xl bg-stone-50/80 border border-stone-200/80 text-sm text-stone-700 space-y-2">
              <h4 className="font-semibold text-stone-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                {t.diary.nuanceHeading}
              </h4>
              <p className="leading-relaxed">
                {result.explanation}
              </p>
            </div>

            {/* Extracted vocabulary chips */}
            {result.extractedVocab && result.extractedVocab.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-stone-900 text-sm flex items-center gap-2">
                  <BookmarkPlus className="w-4 h-4 text-emerald-600" />
                  {t.diary.keyWordsHeading}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {result.extractedVocab.map((item, idx) => {
                    const isSaved = savedWordsMap[item.term];
                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-stone-900 text-sm">
                              {item.term}
                            </span>
                            <AudioButton text={item.term} rate={0.9} />
                          </div>
                          <span className="text-xs text-stone-500 mt-0.5 block">
                            {item.meaning}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSaveExtractedWord(item)}
                          disabled={isSaved}
                          className={`mt-3 w-full py-1.5 px-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer ${
                            isSaved
                              ? 'bg-stone-100 text-stone-500 cursor-default'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {isSaved ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>{t.diary.savedInVault}</span>
                            </>
                          ) : (
                            <>
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>{t.diary.saveToVault}</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Conversational reflection question */}
            {result.conversationalQuestion && (
              <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200 text-indigo-950 text-sm space-y-2">
                <div className="flex items-center gap-2 font-semibold text-indigo-900">
                  <MessageCircle className="w-4 h-4 text-indigo-600" />
                  <span>{t.diary.keepThinkingHeading}</span>
                </div>
                <p className="font-serif text-base italic text-indigo-950">
                  «{result.conversationalQuestion}»
                </p>
                <div className="pt-1">
                  <AudioButton text={result.conversationalQuestion} variant="pill" label={t.diary.listenQuestion} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, CheckCircle2, ArrowRight, Heart } from 'lucide-react';
import { VocabWord, UserProgress } from '../types';
import { AudioButton } from './AudioButton';
import { AccentBar } from './AccentBar';
import { getTodayPrompt } from '../data/dailyPrompts';
import { storageService } from '../services/storage';
import { useTranslation } from '../services/i18n';

interface DailySparkProps {
  words: VocabWord[];
  progress: UserProgress;
  onActivityDone: () => void;
  onSwitchToMicroDiary: () => void;
}

export const DailySpark: React.FC<DailySparkProps> = ({
  words,
  progress,
  onActivityDone,
  onSwitchToMicroDiary,
}) => {
  const { lang, t } = useTranslation();
  const [reflectionInput, setReflectionInput] = useState('');
  const [completed, setCompleted] = useState(progress.completedToday);

  // Pick today's spark word reliably by date
  const dayIndex = Math.floor(Date.now() / 86400000) % (words.length || 1);
  const sparkWord = words[dayIndex] || words[0];
  const prompt = getTodayPrompt();

  const handleInsertChar = (char: string) => {
    setReflectionInput((prev) => prev + char);
  };

  const handleCompleteSpark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionInput.trim()) return;

    // Save as micro journal entry
    storageService.saveJournalEntry({
      date: new Date().toISOString().split('T')[0],
      rawText: reflectionInput,
      polishedText: reflectionInput,
      polishExplanation: `Chispa de 5 minutos sobre: ${sparkWord?.term || 'reflexión del día'}`,
      mood: 'chispazo',
      timeSpentMinutes: 5,
    });

    setCompleted(true);
    onActivityDone();

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#f59e0b', '#10b981', '#6366f1'],
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* Spark Header */}
      <div className="bg-gradient-to-br from-amber-500/10 via-amber-50 to-stone-50 border border-amber-200/80 rounded-3xl p-6 md:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-900 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            {t.spark.badge}
          </span>
          {completed && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {t.spark.doneBadge}
            </span>
          )}
        </div>

        <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 tracking-tight mt-1 mb-2">
          {t.spark.title}
        </h1>
        <p className="text-stone-600 text-sm max-w-xl">
          {t.spark.subtitle}
        </p>
      </div>

      {/* Main Spark Card */}
      {sparkWord && (
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900">
                  {sparkWord.term}
                </h2>
                <AudioButton text={sparkWord.term} variant="pill" label={t.spark.pronounceBtn} />
              </div>

              <p className="text-lg text-amber-800 font-medium mt-1">
                {sparkWord.translation}
              </p>

              {sparkWord.contextSource && (
                <span className="inline-block mt-2 text-xs font-medium text-stone-500 bg-stone-100 px-2.5 py-1 rounded-md">
                  {t.spark.seenIn} {sparkWord.contextSource}
                </span>
              )}
            </div>

            <div className="flex sm:flex-col items-center sm:items-end gap-2 text-xs text-stone-400">
              <span className="capitalize px-2.5 py-1 rounded-full bg-stone-100 font-medium text-stone-600">
                {sparkWord.category}
              </span>
            </div>
          </div>

          {/* Example Sentence with Audio */}
          <div className="my-6 p-4 md:p-5 rounded-2xl bg-stone-50 border border-stone-200/60">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <p className="font-serif text-lg md:text-xl text-stone-800 leading-snug">
                  «{sparkWord.exampleSentence}»
                </p>
                <p className="text-sm text-stone-500">
                  {sparkWord.exampleTranslation}
                </p>
              </div>
              <AudioButton text={sparkWord.exampleSentence} rate={0.85} />
            </div>
          </div>

          {/* Psychological / Cultural Nuance */}
          {sparkWord.psychologyInsight && (
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-xs md:text-sm text-amber-950 mb-6">
              <div className="flex items-center gap-1.5 font-semibold text-amber-900 mb-1">
                <Heart className="w-4 h-4 text-amber-700" />
                <span>{t.spark.whyMatters}</span>
              </div>
              <p className="leading-relaxed text-stone-700">
                {sparkWord.psychologyInsight}
              </p>
            </div>
          )}

          {/* Micro Reflection Form */}
          <div className="pt-2">
            <div className="mb-3">
              <h3 className="font-medium text-stone-900 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                {t.spark.todayPrompt}
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                {sparkWord.personalReflectionPrompt || prompt.spanish}
              </p>
              {lang === 'en' && prompt.english && (
                <p className="text-[11px] text-stone-400 italic mt-0.5">
                  ({prompt.english})
                </p>
              )}
            </div>

            <form onSubmit={handleCompleteSpark} className="space-y-3">
              <div className="relative">
                <textarea
                  value={reflectionInput}
                  onChange={(e) => setReflectionInput(e.target.value)}
                  placeholder={`${t.spark.placeholder}${prompt.suggestedStarter}`}
                  rows={3}
                  className="w-full p-4 rounded-2xl border border-stone-200 bg-stone-50/50 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition text-sm leading-relaxed"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <AccentBar onInsert={handleInsertChar} />

                <button
                  type="submit"
                  disabled={!reflectionInput.trim()}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t.spark.submitBtn}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Want to do more today? Gentle invitation */}
      <div className="p-5 rounded-2xl bg-white border border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-semibold text-stone-900 text-sm">
            {t.spark.moreTimePrompt}
          </h4>
          <p className="text-xs text-stone-500">
            {t.spark.moreTimeSub}
          </p>
        </div>
        <button
          onClick={onSwitchToMicroDiary}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium text-xs transition cursor-pointer shrink-0"
        >
          <span>{t.spark.goToDiaryBtn}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

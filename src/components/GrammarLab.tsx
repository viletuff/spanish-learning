import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Check,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { GRAMMAR_TOPICS } from '../data/grammarTopics';
import { GrammarTopic } from '../types';
import { AudioButton } from './AudioButton';
import { storageService } from '../services/storage';
import { useTranslation } from '../services/i18n';

interface GrammarLabProps {
  onActivityDone: () => void;
}

export const GrammarLab: React.FC<GrammarLabProps> = ({ onActivityDone }) => {
  const { lang } = useTranslation();
  const [selectedTopicId, setSelectedTopicId] = useState<string>(GRAMMAR_TOPICS[0].id);

  // Completed topics
  const [completedTopicIds, setCompletedTopicIds] = useState<string[]>(() =>
    storageService.getCompletedGrammarTopics()
  );

  // Quiz state for the active topic
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);

  const activeTopic = GRAMMAR_TOPICS.find((t) => t.id === selectedTopicId) || GRAMMAR_TOPICS[0];

  const handleSelectTopic = (id: string) => {
    setSelectedTopicId(id);
    setSelectedAnswers({});
    setSubmittedQuiz(false);
  };

  const handleChooseOption = (questionIdx: number, optionIdx: number) => {
    if (submittedQuiz) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionIdx]: optionIdx }));
  };

  const handleCheckQuiz = () => {
    setSubmittedQuiz(true);

    // Check if all correct
    const allCorrect = activeTopic.quiz.every(
      (q, idx) => selectedAnswers[idx] === q.correctIndex
    );

    if (allCorrect) {
      storageService.markGrammarTopicCompleted(activeTopic.id);
      setCompletedTopicIds(storageService.getCompletedGrammarTopics());
      onActivityDone();

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#6366f1', '#10b981', '#f59e0b'],
        });
      } catch {}
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setSubmittedQuiz(false);
  };

  const isCompleted = completedTopicIds.includes(activeTopic.id);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-indigo-500/10 via-indigo-50 to-stone-50 border border-indigo-200/80 rounded-3xl p-6 md:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-900 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
            {lang === 'en' ? 'Grammar Studio · Mental Models' : 'Laboratorio de Gramática Viva'}
          </span>
          {isCompleted && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {lang === 'en' ? 'Mastered!' : '¡Dominado!'}
            </span>
          )}
        </div>

        <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 tracking-tight mt-1 mb-2">
          {lang === 'en' ? 'Grammar without the headaches.' : 'Gramática sin agobios.'}
        </h1>
        <p className="text-stone-600 text-sm max-w-xl leading-relaxed">
          {lang === 'en'
            ? 'Clear mental models, TV dialogue examples, and minimal pairs so you understand the logic intuitively rather than memorizing dry conjugation charts.'
            : 'Modelos mentales claros, ejemplos de series y parejas mínimas para entender la lógica intuitiva sin memorizar tablas secas.'}
        </p>

        {/* Topic navigation pills */}
        <div className="mt-6 pt-6 border-t border-indigo-200/60 flex flex-wrap gap-2">
          {GRAMMAR_TOPICS.map((topic) => {
            const isTopicCompleted = completedTopicIds.includes(topic.id);
            const isSelected = selectedTopicId === topic.id;

            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => handleSelectTopic(topic.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-900 text-white shadow-xs'
                    : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                <span>{lang === 'en' ? topic.title.split(':')[0] : topic.titleEs.split(':')[0]}</span>
                {isTopicCompleted && <Check className="w-3.5 h-3.5 text-emerald-500" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE TOPIC CONTENT */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 space-y-8">
        {/* Title & Subtitle */}
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            {lang === 'en' ? activeTopic.title : activeTopic.titleEs}
          </h2>
          <p className="text-sm text-stone-600 mt-1">
            {lang === 'en' ? activeTopic.subtitle : activeTopic.subtitleEs}
          </p>
        </div>

        {/* Mental Model Callout */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-50 to-stone-50 border border-amber-200/80 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-amber-900 text-sm">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <span>{lang === 'en' ? 'The Golden Mental Model' : 'El Modelo Mental Clave'}</span>
          </div>
          <p className="text-stone-800 text-sm sm:text-base font-serif leading-relaxed">
            {lang === 'en' ? activeTopic.mentalModel : activeTopic.mentalModelEs}
          </p>
        </div>

        {/* Rules with Examples */}
        <div className="space-y-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            {lang === 'en' ? 'Rules in Action with Native Audio' : 'Reglas en Acción con Audio Nativo'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTopic.rules.map((rule, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-stone-50/70 border border-stone-200/80 space-y-3"
              >
                <div>
                  <h4 className="font-semibold text-stone-900 text-sm">
                    {lang === 'en' ? rule.label : rule.labelEs}
                  </h4>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    {lang === 'en' ? rule.explanation : rule.explanationEs}
                  </p>
                </div>

                <div className="space-y-2 pt-1 border-t border-stone-200/60">
                  {rule.examples.map((ex, eIdx) => (
                    <div
                      key={eIdx}
                      className="p-2.5 rounded-xl bg-white border border-stone-200/60 flex items-start justify-between gap-2"
                    >
                      <div>
                        <p className="font-serif text-sm font-medium text-stone-900">
                          «{ex.es}»
                        </p>
                        <p className="text-xs text-stone-500">
                          {ex.en}
                        </p>
                      </div>
                      <AudioButton text={ex.es} rate={0.88} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Minimal Pairs */}
        {activeTopic.comparison && activeTopic.comparison.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              {lang === 'en' ? 'Side-by-Side Minimal Pairs' : 'Pares Mínimos Comparativos'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeTopic.comparison.map((comp, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-stone-900 text-base">
                        «{comp.caseA}»
                      </span>
                      <AudioButton text={comp.caseA} />
                    </div>
                    <span className="text-xs text-stone-500 block">
                      👉 {comp.meaningA}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-stone-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-amber-900 text-base">
                        «{comp.caseB}»
                      </span>
                      <AudioButton text={comp.caseB} />
                    </div>
                    <span className="text-xs text-stone-500 block">
                      👉 {comp.meaningB}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Intuition Quiz */}
        <div className="pt-6 border-t border-stone-200 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
                <span>{lang === 'en' ? 'Test Your Intuition' : 'Pon a Prueba tu Intuición'}</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {lang === 'en' ? 'Answer without pressure to lock in the concept.' : 'Responde sin agobios para fijar el concepto.'}
              </p>
            </div>

            {submittedQuiz && (
              <button
                type="button"
                onClick={handleResetQuiz}
                className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Try Again' : 'Repetir'}</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            {activeTopic.quiz.map((q, qIdx) => {
              const chosen = selectedAnswers[qIdx];
              const isCorrect = chosen === q.correctIndex;

              return (
                <div
                  key={qIdx}
                  className="p-5 rounded-2xl bg-stone-50/70 border border-stone-200 space-y-3"
                >
                  <p className="font-serif text-base font-semibold text-stone-900">
                    {lang === 'en' ? q.question : q.questionEs}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => {
                      const isOptionChosen = chosen === optIdx;
                      let btnClass = 'border-stone-200 bg-white hover:bg-stone-50';

                      if (submittedQuiz) {
                        if (optIdx === q.correctIndex) {
                          btnClass = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold';
                        } else if (isOptionChosen) {
                          btnClass = 'border-rose-400 bg-rose-50 text-rose-950';
                        }
                      } else if (isOptionChosen) {
                        btnClass = 'border-indigo-600 bg-indigo-50 font-medium';
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={submittedQuiz}
                          onClick={() => handleChooseOption(qIdx, optIdx)}
                          className={`p-3 rounded-xl border text-left text-xs sm:text-sm transition cursor-pointer flex items-center justify-between ${btnClass}`}
                        >
                          <span>{opt}</span>
                          {submittedQuiz && optIdx === q.correctIndex && (
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {submittedQuiz && (
                    <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200/80 text-xs text-indigo-950">
                      <strong>{lang === 'en' ? 'Explanation:' : 'Explicación:'}</strong>{' '}
                      {lang === 'en' ? q.explanation : q.explanationEs}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!submittedQuiz && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={Object.keys(selectedAnswers).length < activeTopic.quiz.length}
                onClick={handleCheckQuiz}
                className="px-6 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-xs sm:text-sm transition shadow-xs disabled:opacity-40 cursor-pointer"
              >
                {lang === 'en' ? 'Check Answers' : 'Comprobar Respuestas'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

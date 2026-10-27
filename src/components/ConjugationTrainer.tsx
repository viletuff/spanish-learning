import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Flame,
  Zap,
  Sparkles,
  BookOpen,
  Volume2,
  Check,
  X,
  RotateCcw,
  Search,
  CheckCircle2,
  ChevronRight,
  Filter,
  Lightbulb,
  ArrowRight,
  Layers,
  Table,
  HelpCircle,
  GraduationCap,
  Eye,
  Trophy,
  Award
} from 'lucide-react';
import { PronounKey, TenseKey, VerbData, ConjugationLevel } from '../types';
import {
  VERB_LIST,
  PRONOUN_LABELS,
  TENSE_METADATA,
  CONJUGATION_LEVELS
} from '../data/conjugationData';
import { useTranslation } from '../services/i18n';
import { AudioButton } from './AudioButton';
import { storageService } from '../services/storage';

const PRONOUN_KEYS: PronounKey[] = ['yo', 'tu', 'el', 'nosotros', 'vosotros', 'ellos'];
const TENSE_KEYS: TenseKey[] = ['presente', 'preterito', 'imperfecto', 'futuro', 'subjuntivo'];

interface Question {
  verb: VerbData;
  tense: TenseKey;
  pronoun: PronounKey;
  correctAnswer: string;
  options: string[];
}

interface ConjugationTrainerProps {
  onActivityDone?: () => void;
}

export const ConjugationTrainer: React.FC<ConjugationTrainerProps> = ({ onActivityDone }) => {
  const { lang, t } = useTranslation();

  // Active Mode: 'flashcards' | 'drill' | 'fill-table' | 'tables'
  const [activeMode, setActiveMode] = useState<'flashcards' | 'drill' | 'fill-table' | 'tables'>('flashcards');

  // Progression Level (1 to 8)
  const [currentLevelId, setCurrentLevelId] = useState<number>(() => storageService.getConjugationLevel());
  const [completedTables, setCompletedTables] = useState<string[]>(() => storageService.getCompletedConjugationTables());

  // Beginner Guide Toggle
  const [showBeginnerGuide, setShowBeginnerGuide] = useState(false);

  // Active Level Data
  const currentLevel: ConjugationLevel = useMemo(() => {
    return CONJUGATION_LEVELS.find(l => l.id === currentLevelId) || CONJUGATION_LEVELS[0];
  }, [currentLevelId]);

  // Verbs available in the current level
  const levelVerbs: VerbData[] = useMemo(() => {
    return VERB_LIST.filter(v => currentLevel.verbs.includes(v.infinitive));
  }, [currentLevel]);

  // Handle level change
  const handleSelectLevel = (lvlId: number) => {
    setCurrentLevelId(lvlId);
    storageService.setConjugationLevel(lvlId);
  };

  // =========================================================================
  // MODE 1: FLASHCARDS (LEARN & FLIP)
  // =========================================================================
  const [fcVerbIndex, setFcVerbIndex] = useState(0);
  const [fcPronounIndex, setFcPronounIndex] = useState(0);
  const [fcIsFlipped, setFcIsFlipped] = useState(false);

  const activeFcVerb = levelVerbs[fcVerbIndex % levelVerbs.length] || levelVerbs[0] || VERB_LIST[0];
  const activeFcTense = currentLevel.tenses[0] || 'presente';
  const activeFcPronoun = PRONOUN_KEYS[fcPronounIndex % PRONOUN_KEYS.length];
  const activeFcAnswer = activeFcVerb?.tenses[activeFcTense]?.[activeFcPronoun] || '';

  const handleNextFlashcard = () => {
    setFcIsFlipped(false);
    if (fcPronounIndex + 1 < PRONOUN_KEYS.length) {
      setFcPronounIndex(p => p + 1);
    } else {
      setFcPronounIndex(0);
      setFcVerbIndex(v => (v + 1) % levelVerbs.length);
    }
  };

  const handlePrevFlashcard = () => {
    setFcIsFlipped(false);
    if (fcPronounIndex > 0) {
      setFcPronounIndex(p => p - 1);
    } else {
      setFcPronounIndex(PRONOUN_KEYS.length - 1);
      setFcVerbIndex(v => (v - 1 + levelVerbs.length) % levelVerbs.length);
    }
  };

  // Keyboard shortcut for flashcards (Space to flip, arrows to navigate)
  useEffect(() => {
    if (activeMode !== 'flashcards') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setFcIsFlipped(f => !f);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextFlashcard();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevFlashcard();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMode, fcPronounIndex, fcVerbIndex, levelVerbs.length]);

  // =========================================================================
  // MODE 2: SPEED DRILL (MULTIPLE CHOICE & TYPING)
  // =========================================================================
  const [drillInputMode, setDrillInputMode] = useState<'choice' | 'type'>('choice');
  const [drillIndex, setDrillIndex] = useState(0);
  const [totalDrills] = useState(10);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userTypedAnswer, setUserTypedAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [isRoundComplete, setIsRoundComplete] = useState(false);

  const generateDrillQuestion = useCallback((): Question => {
    const verbsPool = levelVerbs.length > 0 ? levelVerbs : VERB_LIST;
    const randomVerb = verbsPool[Math.floor(Math.random() * verbsPool.length)];
    const tensesPool: TenseKey[] = currentLevel.tenses.length > 0 ? currentLevel.tenses : ['presente'];
    const randomTense: TenseKey = tensesPool[Math.floor(Math.random() * tensesPool.length)];
    const randomPronoun = PRONOUN_KEYS[Math.floor(Math.random() * PRONOUN_KEYS.length)];
    const correct = randomVerb.tenses[randomTense][randomPronoun];

    // Generate distractors
    const distractorCandidates = new Set<string>();
    PRONOUN_KEYS.forEach(p => {
      if (p !== randomPronoun) {
        distractorCandidates.add(randomVerb.tenses[randomTense][p]);
      }
    });
    VERB_LIST.forEach(v => {
      if (distractorCandidates.size < 6) {
        distractorCandidates.add(v.tenses[randomTense][randomPronoun]);
      }
    });
    distractorCandidates.delete(correct);

    const candidateArray = Array.from(distractorCandidates).filter(Boolean);
    for (let i = candidateArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidateArray[i], candidateArray[j]] = [candidateArray[j], candidateArray[i]];
    }

    const wrongOptions = candidateArray.slice(0, 3);
    const allOptions = [correct, ...wrongOptions];
    for (let i = allOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
    }

    return {
      verb: randomVerb,
      tense: randomTense,
      pronoun: randomPronoun,
      correctAnswer: correct,
      options: allOptions,
    };
  }, [levelVerbs, currentLevel]);

  const startNewDrillRound = useCallback(() => {
    setDrillIndex(0);
    setScore(0);
    setIsRoundComplete(false);
    setIsAnswered(false);
    setSelectedOption(null);
    setUserTypedAnswer('');
    setCurrentQuestion(generateDrillQuestion());
  }, [generateDrillQuestion]);

  useEffect(() => {
    startNewDrillRound();
  }, [currentLevelId, startNewDrillRound]);

  const handleCheckDrill = (answerToCheck: string) => {
    if (isAnswered || !currentQuestion) return;
    const cleanInput = answerToCheck.trim().toLowerCase();
    const correct = cleanInput === currentQuestion.correctAnswer.toLowerCase();
    setIsAnswered(true);
    setIsCorrect(correct);
    setSelectedOption(cleanInput);
    if (correct) setScore(s => s + 1);
  };

  const handleNextDrill = () => {
    if (drillIndex + 1 >= totalDrills) {
      setIsRoundComplete(true);
      confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } });
      storageService.recordDailyActivity(5);
      if (onActivityDone) onActivityDone();
    } else {
      setDrillIndex(i => i + 1);
      setIsAnswered(false);
      setSelectedOption(null);
      setUserTypedAnswer('');
      setCurrentQuestion(generateDrillQuestion());
    }
  };

  // =========================================================================
  // MODE 3: FILL THE TABLE ("MASTERY MATRIX")
  // =========================================================================
  const [fillVerbInfinitive, setFillVerbInfinitive] = useState<string>(() => levelVerbs[0]?.infinitive || 'ser');
  const [fillTense, setFillTense] = useState<TenseKey>(() => currentLevel.tenses[0] || 'presente');
  const [tableInputs, setTableInputs] = useState<Record<PronounKey, string>>({
    yo: '',
    tu: '',
    el: '',
    nosotros: '',
    vosotros: '',
    ellos: '',
  });
  const [tableEvaluated, setTableEvaluated] = useState(false);
  const [showHintLetters, setShowHintLetters] = useState(false);

  // Keep target verb in sync with level
  useEffect(() => {
    if (levelVerbs.length > 0) {
      setFillVerbInfinitive(levelVerbs[0].infinitive);
      setFillTense(currentLevel.tenses[0] || 'presente');
      setTableInputs({ yo: '', tu: '', el: '', nosotros: '', vosotros: '', ellos: '' });
      setTableEvaluated(false);
      setShowHintLetters(false);
    }
  }, [currentLevelId, levelVerbs, currentLevel.tenses]);

  const activeFillVerb = useMemo(() => {
    return VERB_LIST.find(v => v.infinitive === fillVerbInfinitive) || levelVerbs[0] || VERB_LIST[0];
  }, [fillVerbInfinitive, levelVerbs]);

  const targetTableSolutions = useMemo(() => {
    return activeFillVerb.tenses[fillTense];
  }, [activeFillVerb, fillTense]);

  const handleTableInputChange = (pronoun: PronounKey, value: string) => {
    setTableInputs(prev => ({ ...prev, [pronoun]: value }));
    if (tableEvaluated) setTableEvaluated(false);
  };

  const handleCheckTable = () => {
    setTableEvaluated(true);
    let allCorrect = true;
    PRONOUN_KEYS.forEach(p => {
      const userVal = tableInputs[p]?.trim().toLowerCase();
      const targetVal = targetTableSolutions[p]?.toLowerCase();
      if (userVal !== targetVal) {
        allCorrect = false;
      }
    });

    if (allCorrect) {
      const tableKey = `${activeFillVerb.infinitive}-${fillTense}`;
      storageService.markConjugationTableCompleted(tableKey);
      setCompletedTables(storageService.getCompletedConjugationTables());
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      if (onActivityDone) onActivityDone();
    }
  };

  const handleRevealAllTable = () => {
    const revealed: Record<PronounKey, string> = {
      yo: targetTableSolutions.yo,
      tu: targetTableSolutions.tu,
      el: targetTableSolutions.el,
      nosotros: targetTableSolutions.nosotros,
      vosotros: targetTableSolutions.vosotros,
      ellos: targetTableSolutions.ellos,
    };
    setTableInputs(revealed);
    setTableEvaluated(true);
  };

  const isTableFullyMastered = completedTables.includes(`${activeFillVerb.infinitive}-${fillTense}`);

  // =========================================================================
  // MODE 4: FULL CONJUGATION TABLES (REFERENCE LIBRARY)
  // =========================================================================
  const [selectedReferenceVerb, setSelectedReferenceVerb] = useState<string>('ser');
  const [referenceSearchTerm, setReferenceSearchTerm] = useState('');

  const activeReferenceVerb = useMemo(() => {
    return VERB_LIST.find(v => v.infinitive === selectedReferenceVerb) || VERB_LIST[0];
  }, [selectedReferenceVerb]);

  const filteredReferenceVerbs = useMemo(() => {
    if (!referenceSearchTerm.trim()) return VERB_LIST;
    const q = referenceSearchTerm.toLowerCase();
    return VERB_LIST.filter(
      v => v.infinitive.toLowerCase().includes(q) || v.english.toLowerCase().includes(q)
    );
  }, [referenceSearchTerm]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
              {lang === 'en' ? 'Conjugation Trainer' : 'Entrenador de Conjugación'}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
              {lang === 'en' ? `Level ${currentLevel.id} of 8` : `Nivel ${currentLevel.id} de 8`}
            </span>
          </div>
          <p className="text-stone-500 text-sm mt-0.5">
            {lang === 'en'
              ? 'Start from zero, learn the patterns step-by-step, and fill in complete tables.'
              : 'Aprende desde cero paso a paso hasta dominar las tablas completas.'}
          </p>
        </div>

        {/* 4 Mode Switcher Tabs */}
        <div className="flex flex-wrap items-center bg-stone-200/70 p-1 rounded-xl text-xs font-semibold gap-1">
          <button
            onClick={() => setActiveMode('flashcards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
              activeMode === 'flashcards' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span>{lang === 'en' ? '1. Flashcards' : '1. Tarjetas'}</span>
          </button>

          <button
            onClick={() => setActiveMode('drill')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
              activeMode === 'drill' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-orange-600" />
            <span>{lang === 'en' ? '2. Speed Drill' : '2. Práctica'}</span>
          </button>

          <button
            onClick={() => setActiveMode('fill-table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
              activeMode === 'fill-table' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Table className="w-3.5 h-3.5 text-emerald-600" />
            <span>{lang === 'en' ? '3. Fill Table' : '3. Completar Tabla'}</span>
          </button>

          <button
            onClick={() => setActiveMode('tables')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
              activeMode === 'tables' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>{lang === 'en' ? 'Reference' : 'Referencia'}</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* PROGRESSION LEVEL PICKER & BEGINNER HELPER                          */}
      {/* =================================================================== */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
              {lang === 'en' ? 'Your Learning Level:' : 'Tu Nivel de Aprendizaje:'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowBeginnerGuide(g => !g)}
            className="text-xs text-amber-800 hover:text-amber-900 font-medium flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showBeginnerGuide ? (lang === 'en' ? 'Hide Beginner Guide' : 'Ocultar Guía') : (lang === 'en' ? 'New to Conjugations? Read 60s Guide' : '¿Nuevo en conjugación? Guía en 60s')}</span>
          </button>
        </div>

        {/* Level buttons (1 to 8) */}
        <div className="flex flex-wrap items-center gap-1.5 pb-1 text-xs">
          {CONJUGATION_LEVELS.map(lvl => {
            const isSelected = lvl.id === currentLevelId;
            return (
              <button
                key={lvl.id}
                onClick={() => handleSelectLevel(lvl.id)}
                className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-600 text-white font-bold shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                <span>{lang === 'en' ? `Lvl ${lvl.id}` : `Niv ${lvl.id}`}</span>
                <span className="text-[10px] opacity-80 hidden md:inline">
                  {lvl.verbs.slice(0, 2).join(', ')}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Level Header Banner */}
        <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-serif font-bold text-sm sm:text-base text-amber-950">
              {lang === 'en' ? currentLevel.titleEn : currentLevel.titleEs}
            </span>
            <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-300/60">
              {currentLevel.verbs.map(v => v.toUpperCase()).join(' · ')}
            </span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            {lang === 'en' ? currentLevel.conceptIntroEn : currentLevel.conceptIntroEs}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-900 pt-1 font-medium">
            <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{lang === 'en' ? currentLevel.tipEn : currentLevel.tipEs}</span>
          </div>
        </div>

        {/* 60-Second Beginner Guide Collapsible */}
        {showBeginnerGuide && (
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs text-stone-700 space-y-3 animate-in fade-in duration-150">
            <div className="font-bold text-stone-900 flex items-center gap-1.5 text-sm">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>{lang === 'en' ? 'How Spanish Conjugations Work (in 60 seconds)' : 'Cómo funcionan las conjugaciones (en 60 segundos)'}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-lg border border-stone-200 space-y-1">
                <span className="font-bold text-stone-900 block">1. The Stem & Ending</span>
                <p className="text-stone-500 leading-relaxed">
                  Every verb has an <strong>infinitive</strong> (e.g. <em>hablar</em> = to speak). Take off the <em>-ar</em> and you get the stem (<em>habl-</em>). You attach endings to show who is speaking: <em>habl</em> + <em>o</em> = I speak!
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-stone-200 space-y-1">
                <span className="font-bold text-stone-900 block">2. The 6 Persons</span>
                <p className="text-stone-500 leading-relaxed">
                  <strong>Yo</strong> (I), <strong>Tú</strong> (you), <strong>Él/Ella</strong> (he/she/you formal), <strong>Nosotros</strong> (we), <strong>Vosotros</strong> (you all in Spain), <strong>Ellos/Ellas</strong> (they).
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-stone-200 space-y-1">
                <span className="font-bold text-stone-900 block">3. Why it feels like magic</span>
                <p className="text-stone-500 leading-relaxed">
                  Because <em>-o</em> always means "I" and <em>-as</em> always means "you", Spanish speakers don't need to say "Yo" or "Tú" all the time. Saying <em>"Hablo español"</em> is 100% complete!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* MODE 1: FLASHCARDS (LEARN & FLIP)                                   */}
      {/* =================================================================== */}
      {activeMode === 'flashcards' && (
        <div className="max-w-xl mx-auto space-y-4">
          {/* Card header tracker */}
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium px-1">
            <span>
              {lang === 'en' ? 'Verb' : 'Verbo'} {fcVerbIndex + 1} of {levelVerbs.length} · Person {fcPronounIndex + 1} of 6
            </span>
            <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              {TENSE_METADATA[activeFcTense]?.nameEs || 'Presente'}
            </span>
          </div>

          {/* Flashcard container */}
          <div
            onClick={() => setFcIsFlipped(f => !f)}
            className={`relative min-h-[320px] bg-white rounded-3xl border-2 transition-all duration-200 p-6 sm:p-8 flex flex-col justify-between cursor-pointer select-none shadow-sm hover:shadow-md ${
              fcIsFlipped ? 'border-amber-400 bg-amber-50/20' : 'border-stone-200 hover:border-amber-300'
            }`}
          >
            {/* Top Card Bar */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                {fcIsFlipped ? (lang === 'en' ? 'Conjugated Form' : 'Forma Conjugada') : (lang === 'en' ? 'Prompt' : 'Desafío')}
              </span>
              <div onClick={e => e.stopPropagation()}>
                <AudioButton text={activeFcVerb.infinitive} rate={0.88} variant="minimal" />
              </div>
            </div>

            {/* Front vs Back Content */}
            <div className="text-center my-auto py-4 space-y-3">
              {!fcIsFlipped ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 capitalize">
                      {activeFcVerb.infinitive}
                    </h2>
                    <p className="text-xs text-stone-500 italic">({activeFcVerb.english})</p>
                  </div>

                  <div className="pt-2">
                    <span className="text-xs text-stone-400 block mb-1">
                      {lang === 'en' ? 'How do you conjugate for:' : '¿Cómo se conjuga para:'}
                    </span>
                    <span className="inline-block px-4 py-1.5 rounded-2xl bg-amber-100/70 border border-amber-200 text-amber-950 font-serif text-xl font-bold">
                      {PRONOUN_LABELS[activeFcPronoun].es}
                    </span>
                    <span className="block text-xs text-stone-400 mt-0.5">
                      ({PRONOUN_LABELS[activeFcPronoun].en})
                    </span>
                  </div>

                  <p className="text-xs text-stone-400 pt-3">
                    {lang === 'en' ? 'Click card or press Space to reveal answer' : 'Toca o pulsa Espacio para ver la respuesta'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-150">
                  <div className="space-y-1">
                    <span className="text-xs text-stone-400 font-serif">
                      {PRONOUN_LABELS[activeFcPronoun].es} + {activeFcVerb.infinitive}:
                    </span>
                    <h2 className="font-serif text-4xl font-bold text-amber-900 tracking-tight">
                      {activeFcAnswer}
                    </h2>
                  </div>

                  {/* Audio */}
                  <div className="flex justify-center" onClick={e => e.stopPropagation()}>
                    <AudioButton
                      text={`${PRONOUN_LABELS[activeFcPronoun].es} ${activeFcAnswer}`}
                      label={lang === 'en' ? 'Listen to full phrase' : 'Escuchar frase'}
                      variant="pill"
                    />
                  </div>

                  {/* Context Note / Hint */}
                  {activeFcVerb.hint && (
                    <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200/80 text-xs text-stone-600 text-left flex items-start gap-2">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{activeFcVerb.hint}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Card Navigation */}
            <div className="flex items-center justify-between text-xs text-stone-400 pt-3 border-t border-stone-100" onClick={e => e.stopPropagation()}>
              <button
                type="button"
                onClick={handlePrevFlashcard}
                className="px-3 py-1 rounded-lg hover:bg-stone-100 text-stone-600 font-medium cursor-pointer"
              >
                ← {lang === 'en' ? 'Previous' : 'Anterior'}
              </button>

              <button
                type="button"
                onClick={() => setFcIsFlipped(f => !f)}
                className="text-amber-800 font-semibold hover:underline cursor-pointer"
              >
                {fcIsFlipped ? (lang === 'en' ? 'Flip back' : 'Voltear') : (lang === 'en' ? 'Reveal answer' : 'Mostrar')}
              </button>

              <button
                type="button"
                onClick={handleNextFlashcard}
                className="px-3 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-medium cursor-pointer"
              >
                {lang === 'en' ? 'Next' : 'Siguiente'} →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODE 2: SPEED DRILL (CHOICE & TYPE)                                 */}
      {/* =================================================================== */}
      {activeMode === 'drill' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-stone-200 text-xs">
            <span className="text-stone-500 font-medium">
              {lang === 'en' ? `Level ${currentLevel.id} Drill` : `Práctica Nivel ${currentLevel.id}`}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-stone-400">{lang === 'en' ? 'Input:' : 'Entrada:'}</span>
              <button
                onClick={() => setDrillInputMode('choice')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  drillInputMode === 'choice' ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300' : 'bg-stone-100 text-stone-600'
                }`}
              >
                {lang === 'en' ? 'Multiple Choice' : 'Opciones'}
              </button>
              <button
                onClick={() => setDrillInputMode('type')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  drillInputMode === 'type' ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300' : 'bg-stone-100 text-stone-600'
                }`}
              >
                {lang === 'en' ? 'Type in' : 'Escribir'}
              </button>
            </div>
          </div>

          {/* Complete Round State */}
          {isRoundComplete ? (
            <div className="bg-white border border-stone-200 rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm space-y-6">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h2 className="font-serif text-2xl font-bold text-stone-900">
                  {lang === 'en' ? 'Drill Complete! 🎉' : '¡Práctica Completada! 🎉'}
                </h2>
                <p className="text-stone-500 text-sm">
                  {lang === 'en' ? 'You scored' : 'Puntuación:'}{' '}
                  <span className="font-bold text-stone-900">{score}</span> / {totalDrills}
                </p>
              </div>

              <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden border border-stone-200">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(score / totalDrills) * 100}%` }}
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={startNewDrillRound}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm rounded-xl transition cursor-pointer shadow-xs"
                >
                  {lang === 'en' ? 'Practice Another Round' : 'Practicar otra ronda'}
                </button>
                <button
                  onClick={() => setActiveMode('fill-table')}
                  className="px-6 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-sm rounded-xl transition cursor-pointer"
                >
                  {lang === 'en' ? 'Try Fill-the-Table Challenge →' : 'Probar Completar Tabla →'}
                </button>
              </div>
            </div>
          ) : currentQuestion ? (
            /* Active Drill Card */
            <div className="max-w-xl mx-auto space-y-4">
              {/* Progress counter */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-stone-500 font-medium px-1">
                  <span>
                    {lang === 'en' ? 'Question' : 'Pregunta'} {drillIndex + 1} of {totalDrills}
                  </span>
                  <span className="text-amber-800 font-semibold">
                    {score} {lang === 'en' ? 'correct' : 'aciertos'}
                  </span>
                </div>
                <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${((drillIndex + 1) / totalDrills) * 100}%` }}
                  />
                </div>
              </div>

              {/* Box */}
              <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 space-y-6">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200 uppercase tracking-wide">
                      {TENSE_METADATA[currentQuestion.tense].nameEs}
                    </span>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-center justify-center gap-2">
                      <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
                        {currentQuestion.verb.infinitive}
                      </h2>
                      <AudioButton text={currentQuestion.verb.infinitive} variant="minimal" />
                    </div>
                    <p className="text-xs text-stone-500 mt-1 italic">
                      ({currentQuestion.verb.english})
                    </p>
                  </div>

                  <div className="pt-3">
                    <span className="inline-block px-4 py-1.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 font-serif text-lg font-bold">
                      {PRONOUN_LABELS[currentQuestion.pronoun].es}
                    </span>
                    <span className="block text-xs text-stone-400 mt-1">
                      {PRONOUN_LABELS[currentQuestion.pronoun].en}
                    </span>
                  </div>
                </div>

                {/* Multiple Choice Mode */}
                {drillInputMode === 'choice' && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {currentQuestion.options.map((opt, i) => {
                      let buttonStyle = 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-800';
                      if (isAnswered) {
                        if (opt.toLowerCase() === currentQuestion.correctAnswer.toLowerCase()) {
                          buttonStyle = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold';
                        } else if (selectedOption === opt.toLowerCase()) {
                          buttonStyle = 'bg-red-50 border-red-300 text-red-900';
                        } else {
                          buttonStyle = 'opacity-40 border-stone-200 text-stone-400';
                        }
                      }

                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleCheckDrill(opt)}
                          disabled={isAnswered}
                          className={`p-4 min-h-[44px] rounded-2xl border-2 text-base font-medium transition cursor-pointer flex items-center justify-center gap-2 ${buttonStyle}`}
                        >
                          <span>{opt}</span>
                          {isAnswered && opt.toLowerCase() === currentQuestion.correctAnswer.toLowerCase() && (
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                          {isAnswered && selectedOption === opt.toLowerCase() && !isCorrect && (
                            <X className="w-4 h-4 text-red-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Typing Mode */}
                {drillInputMode === 'type' && (
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      handleCheckDrill(userTypedAnswer);
                    }}
                    className="space-y-3 pt-2"
                  >
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={userTypedAnswer}
                        onChange={e => setUserTypedAnswer(e.target.value)}
                        disabled={isAnswered}
                        placeholder={lang === 'en' ? 'Type conjugated form...' : 'Escribe la forma conjugada...'}
                        className="flex-1 px-4 py-3 text-base bg-stone-50 border border-stone-200 rounded-2xl focus:bg-white focus:outline-none focus:border-amber-400 text-center font-medium"
                        autoFocus
                      />
                      {!isAnswered && (
                        <button
                          type="submit"
                          disabled={!userTypedAnswer.trim()}
                          className="px-5 py-3 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white font-semibold text-sm rounded-2xl transition cursor-pointer"
                        >
                          {lang === 'en' ? 'Check' : 'Comprobar'}
                        </button>
                      )}
                    </div>

                    {!isAnswered && (
                      <div className="flex justify-center gap-1.5 pt-1">
                        {['á', 'é', 'í', 'ó', 'ú'].map(acc => (
                          <button
                            key={acc}
                            type="button"
                            onClick={() => setUserTypedAnswer(prev => prev + acc)}
                            className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-xs font-mono font-medium border border-stone-200 cursor-pointer"
                          >
                            {acc}
                          </button>
                        ))}
                      </div>
                    )}
                  </form>
                )}

                {/* Feedback Box */}
                {isAnswered && (
                  <div
                    className={`p-4 rounded-2xl border space-y-2 animate-in fade-in duration-200 ${
                      isCorrect
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                        : 'bg-amber-50/80 border-amber-200 text-amber-950'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm flex items-center gap-1.5">
                        {isCorrect ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600" />
                            {lang === 'en' ? '¡Correcto!' : '¡Muy bien!'}
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 text-amber-700" />
                            {lang === 'en' ? 'Correct answer:' : 'Respuesta correcta:'}{' '}
                            <span className="underline font-mono">{currentQuestion.correctAnswer}</span>
                          </>
                        )}
                      </span>

                      <AudioButton
                        text={`${PRONOUN_LABELS[currentQuestion.pronoun].es} ${currentQuestion.correctAnswer}`}
                        label={lang === 'en' ? 'Listen' : 'Escuchar'}
                        variant="pill"
                      />
                    </div>

                    {currentQuestion.verb.hint && (
                      <p className="text-xs text-stone-600 flex items-start gap-1 pt-1">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{currentQuestion.verb.hint}</span>
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={handleNextDrill}
                      className="w-full mt-3 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs sm:text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span>{drillIndex + 1 >= totalDrills ? (lang === 'en' ? 'Finish Round' : 'Ver Resultados') : (lang === 'en' ? 'Next Question' : 'Siguiente')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* =================================================================== */}
      {/* MODE 3: FILL THE ENTIRE CONJUGATION TABLE                           */}
      {/* =================================================================== */}
      {activeMode === 'fill-table' && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Target Verb Switcher */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                {lang === 'en' ? 'Select Verb to Fill:' : 'Elige el Verbo a Completar:'}
              </span>
              {isTableFullyMastered && (
                <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Table Mastered!' : '¡Tabla Dominada!'}</span>
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 pb-1 text-xs">
              {levelVerbs.map(v => (
                <button
                  key={v.infinitive}
                  onClick={() => {
                    setFillVerbInfinitive(v.infinitive);
                    setTableInputs({ yo: '', tu: '', el: '', nosotros: '', vosotros: '', ellos: '' });
                    setTableEvaluated(false);
                    setShowHintLetters(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer whitespace-nowrap ${
                    fillVerbInfinitive === v.infinitive
                      ? 'bg-amber-600 text-white font-bold shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  <span className="capitalize">{v.infinitive}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Fillable Matrix Container */}
          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-3xl font-bold text-stone-900 capitalize">
                    {activeFillVerb.infinitive}
                  </h2>
                  <AudioButton text={activeFillVerb.infinitive} variant="minimal" />
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                    {TENSE_METADATA[fillTense].nameEs}
                  </span>
                </div>
                <p className="text-xs text-stone-500 italic mt-0.5">({activeFillVerb.english})</p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowHintLetters(h => !h)}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium cursor-pointer transition"
                >
                  {showHintLetters ? (lang === 'en' ? 'Hide Hints' : 'Ocultar Pistas') : (lang === 'en' ? '💡 Show Hints' : '💡 Ver Pistas')}
                </button>
                <button
                  type="button"
                  onClick={handleRevealAllTable}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium cursor-pointer transition"
                >
                  <Eye className="w-3.5 h-3.5 inline mr-1" />
                  <span>{lang === 'en' ? 'Reveal All' : 'Mostrar Todo'}</span>
                </button>
              </div>
            </div>

            {/* 6 Pronoun Input Rows */}
            <div className="space-y-3">
              {PRONOUN_KEYS.map(pKey => {
                const userVal = tableInputs[pKey] || '';
                const targetVal = targetTableSolutions[pKey];
                const isItemCorrect = userVal.trim().toLowerCase() === targetVal.toLowerCase();

                return (
                  <div
                    key={pKey}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition ${
                      tableEvaluated
                        ? isItemCorrect
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : 'bg-red-50/70 border-red-300'
                        : 'bg-stone-50/70 border-stone-200'
                    }`}
                  >
                    {/* Pronoun Label */}
                    <div className="w-1/3 min-w-0 pr-2">
                      <span className="font-serif font-bold text-stone-900 text-sm block">
                        {PRONOUN_LABELS[pKey].es}
                      </span>
                      <span className="text-[10px] text-stone-400 block truncate">
                        {PRONOUN_LABELS[pKey].en}
                      </span>
                    </div>

                    {/* Input Field */}
                    <div className="flex-1 flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={userVal}
                          onChange={e => handleTableInputChange(pKey, e.target.value)}
                          placeholder={
                            showHintLetters
                              ? `${targetVal.slice(0, 2)}...`
                              : (lang === 'en' ? 'Conjugate...' : 'Conjuga...')
                          }
                          className={`w-full px-3 py-2 text-sm bg-white border rounded-xl font-medium focus:outline-none ${
                            tableEvaluated
                              ? isItemCorrect
                                ? 'border-emerald-400 text-emerald-950 font-bold'
                                : 'border-red-400 text-red-950 font-bold'
                              : 'border-stone-200 focus:border-amber-400'
                          }`}
                        />
                      </div>

                      {/* Evaluated Indicator & Audio */}
                      {tableEvaluated && (
                        <div className="flex items-center gap-1 shrink-0">
                          {isItemCorrect ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <div className="text-right">
                              <span className="text-xs font-mono font-bold text-red-700 block">
                                {targetVal}
                              </span>
                            </div>
                          )}
                          <AudioButton text={targetVal} variant="minimal" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Accent helper */}
            <div className="flex items-center justify-center gap-1.5 pt-1 text-xs text-stone-400">
              <span>{lang === 'en' ? 'Accents:' : 'Tildes:'}</span>
              {['á', 'é', 'í', 'ó', 'ú'].map(acc => (
                <button
                  key={acc}
                  type="button"
                  onClick={() => {
                    // Append to whichever row is currently active or last
                    const firstEmpty = PRONOUN_KEYS.find(k => !tableInputs[k]) || 'yo';
                    handleTableInputChange(firstEmpty, (tableInputs[firstEmpty] || '') + acc);
                  }}
                  className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-800 font-mono text-xs border border-stone-200 cursor-pointer"
                >
                  {acc}
                </button>
              ))}
            </div>

            {/* Check Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleCheckTable}
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm rounded-2xl transition cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{lang === 'en' ? 'Check My Table' : 'Comprobar Tabla'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODE 4: FULL CONJUGATION TABLES (REFERENCE LIBRARY)                 */}
      {/* =================================================================== */}
      {activeMode === 'tables' && (
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={referenceSearchTerm}
                onChange={e => setReferenceSearchTerm(e.target.value)}
                placeholder={lang === 'en' ? 'Search verb (e.g. tener, ser, ir)...' : 'Buscar verbo...'}
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-amber-400 shadow-2xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pb-1 text-xs">
              {filteredReferenceVerbs.map(v => (
                <button
                  key={v.infinitive}
                  onClick={() => setSelectedReferenceVerb(v.infinitive)}
                  className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer whitespace-nowrap ${
                    selectedReferenceVerb === v.infinitive
                      ? 'bg-amber-600 text-white font-semibold shadow-xs'
                      : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                  }`}
                >
                  <span>{v.infinitive}</span>
                  <span className="text-[10px] opacity-70 ml-1">({v.english.split(' ')[1] || v.english})</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-3xl font-bold text-stone-900 capitalize">
                    {activeReferenceVerb.infinitive}
                  </h2>
                  <AudioButton text={activeReferenceVerb.infinitive} variant="minimal" />
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-stone-100 text-stone-600 border border-stone-200">
                    {activeReferenceVerb.type}
                  </span>
                </div>
                <p className="text-sm text-stone-500 italic">{activeReferenceVerb.english}</p>
              </div>

              {activeReferenceVerb.hint && (
                <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3 max-w-sm text-xs text-amber-950 flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{activeReferenceVerb.hint}</span>
                </div>
              )}
            </div>

            <div className="overflow-x-auto -mx-4 px-4">
              <table className="min-w-[560px] w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Pronoun</th>
                    <th className="py-2.5 px-3">Presente</th>
                    <th className="py-2.5 px-3 text-amber-900 font-bold">Pretérito</th>
                    <th className="py-2.5 px-3">Imperfecto</th>
                    <th className="py-2.5 px-3">Futuro</th>
                    <th className="py-2.5 px-3">Subjuntivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800">
                  {PRONOUN_KEYS.map(pKey => (
                    <tr key={pKey} className="hover:bg-amber-50/30 transition">
                      <td className="py-3 px-3 font-semibold text-stone-600 whitespace-nowrap">
                        <span>{PRONOUN_LABELS[pKey].es}</span>
                        <span className="block text-[10px] text-stone-400 font-normal">
                          {PRONOUN_LABELS[pKey].en}
                        </span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{activeReferenceVerb.tenses.presente[pKey]}</span>
                          <AudioButton text={activeReferenceVerb.tenses.presente[pKey]} variant="minimal" />
                        </div>
                      </td>

                      <td className="py-3 px-3 font-medium bg-amber-50/40 text-amber-950 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{activeReferenceVerb.tenses.preterito[pKey]}</span>
                          <AudioButton text={activeReferenceVerb.tenses.preterito[pKey]} variant="minimal" />
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{activeReferenceVerb.tenses.imperfecto[pKey]}</span>
                          <AudioButton text={activeReferenceVerb.tenses.imperfecto[pKey]} variant="minimal" />
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{activeReferenceVerb.tenses.futuro[pKey]}</span>
                          <AudioButton text={activeReferenceVerb.tenses.futuro[pKey]} variant="minimal" />
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{activeReferenceVerb.tenses.subjuntivo[pKey]}</span>
                          <AudioButton text={activeReferenceVerb.tenses.subjuntivo[pKey]} variant="minimal" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

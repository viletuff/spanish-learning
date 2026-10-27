import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  PenLine,
  Sparkles,
  BookOpen,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  Plus,
  RefreshCw,
  Search,
  MessageCircle,
  HelpCircle
} from 'lucide-react';
import { JournalEntry, SRSCard } from '../types';
import { storageService } from '../services/storage';
import { aiService, PolishResult } from '../services/aiService';
import { useTranslation } from '../services/i18n';
import { AudioButton } from './AudioButton';
import { AccentBar } from './AccentBar';

const DAILY_PROMPTS_EN = [
  'What did you do today that brought you a bit of peace or joy?',
  'Describe something curious or surprising you noticed recently.',
  'What did you have for lunch or coffee today? How was it?',
  'What is on your mind right now that you would like to unburden?',
  'Describe a conversation you had with a friend, neighbor, or colleague.',
  'What are you looking forward to this upcoming weekend?',
  'Talk about a TV show, podcast, or song you encountered recently.',
  'Describe your morning routine today in 2 or 3 simple sentences.',
];

const DAILY_PROMPTS_ES = [
  '¿Qué hiciste hoy que te trajo un poco de paz o alegría?',
  'Describe algo curioso o que te haya llamado la atención recientemente.',
  '¿Qué tomaste para almorzar o merendar hoy? ¿Cómo estuvo?',
  '¿Qué pensamiento tienes en la cabeza ahora mismo que te gustaría desahogar?',
  'Describe una conversación que tuviste con un amigo, vecino o compañero.',
  '¿Qué plan te hace ilusión para este fin de semana?',
  'Habla sobre una serie, podcast o canción que hayas escuchado últimamente.',
  'Describe tu rutina de esta mañana en 2 o 3 frases sencillas.',
];

interface DiarySectionProps {
  onActivityDone?: () => void;
}

export const DiarySection: React.FC<DiarySectionProps> = ({ onActivityDone }) => {
  const { lang, t } = useTranslation();
  const [diaryText, setDiaryText] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

  // Active result of latest polish
  const [activeResult, setActiveResult] = useState<PolishResult | null>(null);
  const [addedVocabTerms, setAddedVocabTerms] = useState<Set<string>>(new Set());

  // Past journal entries
  const [entries, setEntries] = useState<JournalEntry[]>(() => storageService.getJournalEntries());
  const [historySearch, setHistorySearch] = useState('');
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

  const prompts = lang === 'en' ? DAILY_PROMPTS_EN : DAILY_PROMPTS_ES;

  const handleNextPrompt = () => {
    setCurrentPromptIndex(prev => (prev + 1) % prompts.length);
  };

  const handleInsertAccent = (char: string) => {
    setDiaryText(prev => prev + char);
  };

  // Submit and polish with AI
  const handlePolishDiary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diaryText.trim() || isPolishing) return;

    setIsPolishing(true);
    try {
      const result = await aiService.polishJournal(diaryText.trim());
      setActiveResult(result);

      // Save journal entry in storage
      const saved = storageService.saveJournalEntry({
        date: new Date().toISOString().split('T')[0],
        rawText: diaryText.trim(),
        polishedText: result.polishedText,
        polishExplanation: result.explanation,
        extractedVocab: result.extractedVocab,
        aiFeedback: result.encouragement,
        timeSpentMinutes: 10,
      });

      // Update entries list
      setEntries(storageService.getJournalEntries());
      setExpandedEntryId(saved.id);

      // Celebrate activity completion
      confetti({
        particleCount: 70,
        spread: 50,
        origin: { y: 0.7 },
      });

      if (onActivityDone) onActivityDone();
    } finally {
      setIsPolishing(false);
    }
  };

  // Add extracted word directly to SRS Flashcards!
  const handleAddVocabToFlashcards = (term: string, meaning: string) => {
    const today = new Date().toISOString().split('T')[0];
    const newCard: SRSCard = {
      id: `custom-diary-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      front: term,
      back: meaning,
      exampleSentence: activeResult?.polishedText,
      exampleTranslation: diaryText,
      source: 'custom',
      interval: 1,
      easeFactor: 2.5,
      nextReview: today,
      state: 'new',
      reviewCount: 0,
      category: 'diary-extracted',
    };

    storageService.upsertSRSCard(newCard);
    setAddedVocabTerms(prev => new Set(prev).add(term));
  };

  // Export all entries as Markdown
  const handleExportMarkdown = () => {
    if (entries.length === 0) return;

    let content = `# Mi Diario en Español · Chispas\nExported on ${new Date().toLocaleDateString()}\n\n---\n\n`;
    entries.forEach(entry => {
      content += `### ${entry.date}\n\n`;
      content += `**Mi borrador:**\n> ${entry.rawText}\n\n`;
      if (entry.polishedText) {
        content += `**Español fluido y natural:**\n> ${entry.polishedText}\n\n`;
      }
      if (entry.polishExplanation) {
        content += `*Detalles de estilo:* ${entry.polishExplanation}\n\n`;
      }
      if (entry.extractedVocab && entry.extractedVocab.length > 0) {
        content += `*Vocabulario extraído:*\n`;
        entry.extractedVocab.forEach(v => {
          content += `- **${v.term}**: ${v.meaning}\n`;
        });
        content += `\n`;
      }
      content += `---\n\n`;
    });

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `chispas-diario-${new Date().toISOString().split('T')[0]}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredEntries = entries.filter(e => {
    if (!historySearch.trim()) return true;
    const q = historySearch.toLowerCase();
    return (
      e.rawText.toLowerCase().includes(q) ||
      (e.polishedText && e.polishedText.toLowerCase().includes(q)) ||
      (e.polishExplanation && e.polishExplanation.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
              {lang === 'en' ? 'Daily Micro-Diary' : 'Micro-Diario Cotidiano'}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
              {lang === 'en' ? 'Real Life' : 'Vida Real'}
            </span>
          </div>
          <p className="text-stone-500 text-sm mt-0.5">
            {lang === 'en'
              ? 'Write simply about your day. AI provides fluent native phrasing and turns your words into flashcards.'
              : 'Escribe unas frases sobre tu día. La IA te mostrará el giro natural y guardará palabras útiles.'}
          </p>
        </div>

        {entries.length > 0 && (
          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium transition cursor-pointer shadow-2xs self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>{lang === 'en' ? 'Export Markdown (.md)' : 'Descargar Markdown (.md)'}</span>
          </button>
        )}
      </div>

      {/* Writing Box Container */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 space-y-5">
        {/* Prompt Kickstarter */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
              {lang === 'en' ? '💡 Inspiration prompt:' : '💡 Idea para arrancar:'}
            </span>
            <p className="text-sm text-amber-950 font-serif leading-snug">
              «{prompts[currentPromptIndex]}»
            </p>
          </div>
          <button
            onClick={handleNextPrompt}
            title={lang === 'en' ? 'Get another prompt' : 'Cambiar idea'}
            className="p-1.5 text-amber-700 hover:text-amber-900 hover:bg-amber-100/60 rounded-lg transition cursor-pointer shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handlePolishDiary} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-700">
                {lang === 'en' ? 'Write in your own words (Spanish):' : 'Escribe con tus propias palabras:'}
              </label>
              <AccentBar onInsert={handleInsertAccent} />
            </div>

            <textarea
              value={diaryText}
              onChange={e => setDiaryText(e.target.value)}
              rows={4}
              placeholder={
                lang === 'en'
                  ? 'Ex: Hoy me levanté un poco tarde porque estuve cansado. Tuve una reunión larga en el trabajo pero al final de la tarde salí a caminar...'
                  : 'Ej: Hoy me levanté un poco tarde porque estuve cansado. Tuve bastante trabajo pero al final pude desconectar...'
              }
              className="w-full p-4 text-sm bg-stone-50 border border-stone-200 rounded-2xl focus:bg-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/40 transition leading-relaxed resize-y"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-stone-400">
              {diaryText.trim().split(/\s+/).filter(Boolean).length} {lang === 'en' ? 'words' : 'palabras'}
            </span>

            <button
              type="submit"
              disabled={!diaryText.trim() || isPolishing}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition shadow-xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isPolishing
                  ? (lang === 'en' ? 'Polishing with care...' : 'Puliendo con cariño...')
                  : (lang === 'en' ? 'Polish with AI & Save' : 'Pulir con IA y Guardar')}
              </span>
            </button>
          </div>
        </form>

        {/* Active Polish Feedback */}
        {activeResult && (
          <div className="mt-6 pt-6 border-t border-stone-200/90 space-y-5 animate-in fade-in duration-300">
            {/* Native phrasing */}
            <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  {lang === 'en' ? '✨ Fluent Native Version' : '✨ Versión Nativa y Fluida'}
                </span>
                <AudioButton text={activeResult.polishedText} variant="pill" />
              </div>
              <p className="font-serif text-base sm:text-lg text-emerald-950 font-medium leading-relaxed">
                «{activeResult.polishedText}»
              </p>
            </div>

            {/* Nuances explained */}
            {activeResult.explanation && (
              <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  {lang === 'en' ? '💡 Style & Grammar Nuance' : '💡 Matiz de Estilo y Gramática'}
                </span>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                  {activeResult.explanation}
                </p>
              </div>
            )}

            {/* Extracted vocabulary to save to flashcards */}
            {activeResult.extractedVocab && activeResult.extractedVocab.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                  {lang === 'en' ? '📌 Extracted Idioms & Words for Your Flashcards:' : '📌 Palabras y Giros para tu Mazo de Tarjetas:'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeResult.extractedVocab.map((item, idx) => {
                    const isAdded = addedVocabTerms.has(item.term);
                    return (
                      <div
                        key={idx}
                        className="bg-white border border-stone-200 p-3 rounded-xl flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <div className="min-w-0">
                          <span className="block font-semibold text-stone-900 text-xs truncate">
                            {item.term}
                          </span>
                          <span className="text-[11px] text-stone-500 truncate block">
                            {item.meaning}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddVocabToFlashcards(item.term, item.meaning)}
                          disabled={isAdded}
                          className={`px-2 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer shrink-0 flex items-center gap-1 ${
                            isAdded
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                          }`}
                        >
                          {isAdded ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                          <span>{isAdded ? (lang === 'en' ? 'In Deck' : 'En Mazo') : (lang === 'en' ? 'Add' : 'Añadir')}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Conversational follow-up question to keep thinking in Spanish */}
            {activeResult.conversationalQuestion && (
              <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-2xl p-4 flex items-start gap-3">
                <MessageCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                    {lang === 'en' ? 'Question to keep thinking in Spanish:' : 'Para seguir pensando en español:'}
                  </span>
                  <div className="flex items-center gap-2">
                    <p className="text-xs sm:text-sm text-indigo-950 font-medium italic">
                      «{activeResult.conversationalQuestion}»
                    </p>
                    <AudioButton text={activeResult.conversationalQuestion} variant="minimal" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ======================= PAST DIARY ENTRIES ======================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-stone-600" />
            <h2 className="font-serif text-lg font-bold text-stone-900">
              {lang === 'en' ? 'Journal Archive' : 'Archivo de Reflexiones'}
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 bg-stone-200 text-stone-700 rounded-full">
              {entries.length}
            </span>
          </div>

          {entries.length > 0 && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={historySearch}
                onChange={e => setHistorySearch(e.target.value)}
                placeholder={lang === 'en' ? 'Search entries...' : 'Buscar en el diario...'}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-amber-400"
              />
            </div>
          )}
        </div>

        {filteredEntries.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200/90 p-8 text-center text-stone-400 text-sm">
            {entries.length === 0
              ? (lang === 'en'
                  ? 'No diary entries yet. Write your first reflection above!'
                  : 'Aún no tienes entradas. ¡Escribe tu primera reflexión arriba!')
              : (lang === 'en' ? 'No entries match your search.' : 'No hay entradas que coincidan.')}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEntries.map(entry => {
              const isExpanded = expandedEntryId === entry.id;
              return (
                <div
                  key={entry.id}
                  className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedEntryId(isExpanded ? null : entry.id)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-stone-50 transition cursor-pointer"
                  >
                    <div className="space-y-1 pr-3 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-stone-400 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" />
                        <span>{entry.date}</span>
                        <span>•</span>
                        <span>{entry.timeSpentMinutes || 5} min</span>
                      </div>
                      <p className="text-sm font-medium text-stone-800 truncate">
                        {entry.polishedText || entry.rawText}
                      </p>
                    </div>

                    <div className="shrink-0 text-stone-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 space-y-4 border-t border-stone-100 text-xs sm:text-sm">
                      {/* Original vs Polished */}
                      <div className="space-y-2">
                        <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/80">
                          <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                            {lang === 'en' ? 'Original text:' : 'Borrador original:'}
                          </span>
                          <p className="text-stone-700 italic">«{entry.rawText}»</p>
                        </div>

                        {entry.polishedText && (
                          <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/80 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                                {lang === 'en' ? 'Natural native Spanish:' : 'Español nativo natural:'}
                              </span>
                              <AudioButton text={entry.polishedText} variant="minimal" />
                            </div>
                            <p className="text-emerald-950 font-serif font-medium">
                              «{entry.polishedText}»
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Explanation */}
                      {entry.polishExplanation && (
                        <p className="text-stone-600 leading-relaxed bg-stone-50/50 p-3 rounded-xl">
                          {entry.polishExplanation}
                        </p>
                      )}

                      {/* Extracted words */}
                      {entry.extractedVocab && entry.extractedVocab.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {entry.extractedVocab.map((v, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium"
                            >
                              {v.term} — <span className="text-stone-600">{v.meaning}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

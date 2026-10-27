import React, { useState } from 'react';
import { BookOpen, Calendar, Clock, Download } from 'lucide-react';
import { JournalEntry } from '../types';
import { AudioButton } from './AudioButton';
import { useTranslation } from '../services/i18n';

interface JournalHistoryProps {
  entries: JournalEntry[];
}

export const JournalHistory: React.FC<JournalHistoryProps> = ({ entries }) => {
  const { t } = useTranslation();
  const [searchDate] = useState('');

  const filtered = entries.filter((e) => {
    if (!searchDate) return true;
    return e.date.includes(searchDate) || e.rawText.toLowerCase().includes(searchDate.toLowerCase());
  });

  const handleExportMarkdown = () => {
    let md = `# Mi Diario de Español · Chispas\n\n`;
    entries.forEach((e) => {
      md += `### ${e.date}\n`;
      md += `**Original:**\n> ${e.rawText}\n\n`;
      if (e.polishedText) {
        md += `**Español fluido y pulido:**\n> ${e.polishedText}\n\n`;
      }
      if (e.polishExplanation) {
        md += `*Nota:* ${e.polishExplanation}\n\n`;
      }
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mi-diario-espanol-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="bg-gradient-to-br from-indigo-500/10 via-indigo-50 to-stone-50 border border-indigo-200/80 rounded-3xl p-6 md:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-900 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              {t.history.badge} ({entries.length})
            </span>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 tracking-tight mt-1 mb-2">
            {t.history.title}
          </h1>
          <p className="text-stone-600 text-sm max-w-xl">
            {t.history.subtitle}
          </p>
        </div>

        {entries.length > 0 && (
          <button
            type="button"
            onClick={handleExportMarkdown}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 text-xs font-semibold transition cursor-pointer shadow-2xs flex items-center gap-2 shrink-0"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>{t.history.downloadMarkdown}</span>
          </button>
        )}
      </div>

      {/* Entries List */}
      {entries.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200/80 space-y-3">
          <BookOpen className="w-8 h-8 text-stone-300 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-stone-700">
            {t.history.emptyTitle}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {t.history.emptyDesc}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 text-xs text-stone-500">
                <div className="flex items-center gap-2 font-semibold text-stone-700">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>{entry.date}</span>
                </div>
                {entry.timeSpentMinutes && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{entry.timeSpentMinutes} {t.history.practiceTime}</span>
                  </div>
                )}
              </div>

              {/* Original & Polished */}
              <div className="space-y-3 font-serif">
                {entry.polishedText ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-amber-800">
                        {t.history.naturalSpanish}
                      </span>
                      <AudioButton text={entry.polishedText} variant="pill" />
                    </div>
                    <p className="text-stone-900 text-lg leading-relaxed font-medium">
                      «{entry.polishedText}»
                    </p>

                    <div className="pt-2 text-stone-500 text-sm italic font-serif">
                      {t.history.originalLabel} «{entry.rawText}»
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <AudioButton text={entry.rawText} variant="pill" />
                    </div>
                    <p className="text-stone-900 text-lg leading-relaxed">
                      «{entry.rawText}»
                    </p>
                  </div>
                )}
              </div>

              {/* Explanation or Feedback */}
              {entry.polishExplanation && (
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100 text-xs text-stone-600 leading-relaxed">
                  <strong>{t.history.styleNote}</strong> {entry.polishExplanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

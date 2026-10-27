import React, { useState, useEffect } from 'react';
import { Navbar, ActiveNavView } from './components/Navbar';
import { FlashcardSection } from './components/FlashcardSection';
import { ConjugationTrainer } from './components/ConjugationTrainer';
import { GrammarLab } from './components/GrammarLab';
import { DiarySection } from './components/DiarySection';
import { SettingsModal } from './components/SettingsModal';
import { storageService } from './services/storage';
import { I18nProvider, useTranslation } from './services/i18n';
import { UserProgress } from './types';
import { Sparkles, Heart } from 'lucide-react';

function AppContent() {
  const { lang, t } = useTranslation();
  const [activeView, setActiveView] = useState<ActiveNavView>('flashcards');
  const [progress, setProgress] = useState<UserProgress>(() => storageService.getProgress());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    setProgress(storageService.getProgress());
  }, []);

  const refreshData = () => {
    setProgress(storageService.getProgress());
  };

  const handleActivityDone = () => {
    const updated = storageService.getProgress();
    setProgress({ ...updated });
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col text-stone-800 selection:bg-amber-200 selection:text-amber-900">
      {/* Top Navigation Bar */}
      <Navbar
        progress={progress}
        activeView={activeView}
        onSelectView={setActiveView}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-20 sm:pb-8">
        {/* VIEW 1: FLASHCARDS (ANKI SRS + TOP 1000 + CUSTOM + IMPORT) */}
        {activeView === 'flashcards' && (
          <FlashcardSection onActivityDone={handleActivityDone} />
        )}

        {/* VIEW 2: CONJUGATION TRAINER */}
        {activeView === 'conjugations' && (
          <ConjugationTrainer onActivityDone={handleActivityDone} />
        )}

        {/* VIEW 3: GRAMMAR STUDIO */}
        {activeView === 'grammar' && (
          <GrammarLab onActivityDone={handleActivityDone} />
        )}

        {/* VIEW 4: DAILY MICRO-DIARY */}
        {activeView === 'diary' && (
          <DiarySection onActivityDone={handleActivityDone} />
        )}
      </main>

      {/* Philosophy Footer */}
      <footer className="mt-12 py-8 border-t border-stone-200/80 bg-stone-100/40 text-stone-500 text-xs text-center">
        <div className="max-w-2xl mx-auto px-4 space-y-2">
          <div className="flex items-center justify-center gap-1.5 font-medium text-stone-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{t.footer.title}</span>
          </div>
          <p className="leading-relaxed">
            {t.footer.description}
          </p>
          <div className="flex items-center justify-center gap-4 pt-1 text-[11px] text-stone-400">
            <span>{lang === 'en' ? '📚 Spaced Repetition' : '📚 Repetición Espaciada'}</span>
            <span>•</span>
            <span>{lang === 'en' ? '🎯 Top 1,000 Words' : '🎯 Top 1.000 Palabras'}</span>
            <span>•</span>
            <span>{lang === 'en' ? '✍️ Daily Expression' : '✍️ Expresión Diaria'}</span>
            <span>•</span>
            <span>{lang === 'en' ? '💾 100% Private on Your Mac' : '💾 100% Privado en tu Mac'}</span>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onDataRestored={refreshData}
      />
    </div>
  );
}

export function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}

export default App;

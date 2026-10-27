import React, { useState, useEffect } from 'react';
import { Flame, Sparkles, Layers, GraduationCap, PenLine, Settings, Languages, Zap, Cloud, CloudCheck, RefreshCw } from 'lucide-react';
import { UserProgress } from '../types';
import { useTranslation } from '../services/i18n';
import { syncManager, SyncStatus } from '../services/supabaseClient';

export type ActiveNavView = 'flashcards' | 'conjugations' | 'grammar' | 'diary';

interface NavbarProps {
  progress: UserProgress;
  activeView: ActiveNavView;
  onSelectView: (view: ActiveNavView) => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  progress,
  activeView,
  onSelectView,
  onOpenSettings,
}) => {
  const { lang, t, toggleLang } = useTranslation();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => syncManager.getStatus());

  useEffect(() => {
    return syncManager.subscribeStatus((newStatus) => {
      setSyncStatus(newStatus);
    });
  }, []);

  const handleManualSync = async () => {
    await syncManager.pullAllFromCloud();
  };

  const navItems: Array<{ id: ActiveNavView; label: string; icon: React.ElementType }> = [
    { id: 'flashcards', label: t.nav.flashcardsTab, icon: Layers },
    { id: 'conjugations', label: t.nav.conjugationsTab, icon: Zap },
    { id: 'grammar', label: t.nav.grammarTab, icon: GraduationCap },
    { id: 'diary', label: t.nav.diaryTab, icon: PenLine },
  ];

  return (
    <>
      {/* ── Top Header Bar ── */}
      <header className="sticky top-0 z-30 bg-[#faf7f2]/95 backdrop-blur-md border-b border-stone-200/80 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand / Logo */}
          <div
            onClick={() => onSelectView('flashcards')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 group-hover:scale-105 group-hover:bg-amber-500/20 transition duration-200 shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-xl font-bold tracking-tight text-stone-900">
                  {t.nav.title}
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200/60">
                  {t.nav.tag}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Nav Tabs — hidden on mobile */}
          <nav className="hidden sm:flex items-center bg-stone-200/70 p-1 rounded-xl text-xs font-semibold text-stone-600 shadow-2xs">
            {navItems.map(item => {
              const isActive = activeView === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectView(item.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-stone-950 shadow-xs font-bold'
                      : 'hover:text-stone-900 hover:bg-stone-200/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Cloud Sync Status Pill */}
            <button
              type="button"
              onClick={handleManualSync}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold transition cursor-pointer shadow-2xs"
              title={
                syncStatus === 'syncing'
                  ? 'Syncing with Supabase...'
                  : syncStatus === 'synced'
                  ? 'Synced with Supabase Cloud'
                  : 'Click to sync with cloud'
              }
            >
              {syncStatus === 'syncing' ? (
                <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />
              ) : syncStatus === 'synced' ? (
                <CloudCheck className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Cloud className="w-3.5 h-3.5 text-stone-500" />
              )}
              <span className="hidden sm:inline text-[11px] font-medium text-stone-600">
                {syncStatus === 'syncing' ? 'Syncing' : syncStatus === 'synced' ? 'Synced' : 'Sync'}
              </span>
            </button>

            {/* Language Toggle */}
            <button
              type="button"
              onClick={toggleLang}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold transition cursor-pointer shadow-2xs"
              title={lang === 'en' ? 'Cambiar a interfaz en español' : 'Switch UI to English'}
            >
              <Languages className="w-3.5 h-3.5 text-amber-700" />
              <span>{lang === 'en' ? '🇺🇸 EN' : '🇪🇸 ES'}</span>
            </button>

            {/* Daily Streak — desktop only */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold border transition select-none ${
                progress.completedToday
                  ? 'bg-orange-50 text-orange-700 border-orange-200 shadow-xs'
                  : 'bg-stone-100 text-stone-500 border-stone-200'
              }`}
              title={progress.completedToday ? t.nav.streakTooltipDone : t.nav.streakTooltipTodo}
            >
              <Flame
                className={`w-3.5 h-3.5 ${
                  progress.completedToday ? 'text-orange-500 fill-orange-500 animate-bounce' : 'text-stone-400'
                }`}
              />
              <span>
                {progress.currentStreak} {progress.currentStreak === 1 ? t.nav.streakDay : t.nav.streakDays}
              </span>
            </div>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 rounded-xl transition cursor-pointer"
              title={t.nav.settingsTooltip}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Bottom Tab Bar — visible only on small screens ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white border-t border-stone-200 pb-safe">
        <div className="flex">
          {navItems.map(tab => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectView(tab.id)}
                className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-[10px] font-medium transition-colors cursor-pointer ${
                  isActive ? 'text-amber-600' : 'text-stone-500'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

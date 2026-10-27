import React from 'react';
import { Zap, Coffee, Wine } from 'lucide-react';
import { SessionMode } from '../types';
import { useTranslation } from '../services/i18n';

interface ModeSelectorProps {
  currentMode: SessionMode;
  onSelectMode: (mode: SessionMode) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onSelectMode }) => {
  const { t } = useTranslation();

  const modes: Array<{
    id: SessionMode;
    title: string;
    duration: string;
    subtext: string;
    icon: React.ReactNode;
    badgeColor: string;
    activeBorder: string;
    bgHover: string;
  }> = [
    {
      id: 'spark',
      title: t.modes.sparkTitle,
      duration: t.modes.sparkDuration,
      subtext: t.modes.sparkDesc,
      icon: <Zap className="w-4 h-4 text-amber-600" />,
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
      activeBorder: 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/40',
      bgHover: 'hover:border-amber-300 hover:bg-amber-50/20',
    },
    {
      id: 'standard',
      title: t.modes.coffeeTitle,
      duration: t.modes.coffeeDuration,
      subtext: t.modes.coffeeDesc,
      icon: <Coffee className="w-4 h-4 text-emerald-600" />,
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40',
      bgHover: 'hover:border-emerald-300 hover:bg-emerald-50/20',
    },
    {
      id: 'deep',
      title: t.modes.wineTitle,
      duration: t.modes.wineDuration,
      subtext: t.modes.wineDesc,
      icon: <Wine className="w-4 h-4 text-purple-600" />,
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-200',
      activeBorder: 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/40',
      bgHover: 'hover:border-purple-300 hover:bg-purple-50/20',
    },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider">
            {t.modes.heading}
          </h2>
          <p className="text-xs text-stone-400">
            {t.modes.subheading}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {modes.map((mode) => {
          const isActive = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onSelectMode(mode.id)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer bg-white relative flex flex-col justify-between ${
                isActive ? mode.activeBorder : `border-stone-200 ${mode.bgHover}`
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-stone-100">
                      {mode.icon}
                    </div>
                    <span className="font-semibold text-stone-900 text-base">
                      {mode.title}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${mode.badgeColor}`}
                  >
                    {mode.duration}
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {mode.subtext}
                </p>
              </div>

              {isActive && (
                <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-stone-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span>{t.modes.activeMode}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

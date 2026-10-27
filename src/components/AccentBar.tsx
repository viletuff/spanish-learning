import React from 'react';
import { useTranslation } from '../services/i18n';

interface AccentBarProps {
  onInsert: (char: string) => void;
}

const ACCENT_CHARS = ['á', 'é', 'í', 'ó', 'ú', 'ñ', '¿', '¡'];

export const AccentBar: React.FC<AccentBarProps> = ({ onInsert }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-1.5 py-1 px-2 bg-stone-100 rounded-lg border border-stone-200 text-xs w-fit">
      <span className="text-stone-500 font-medium mr-1 select-none">{t.accentBar.label}</span>
      {ACCENT_CHARS.map((char) => (
        <button
          key={char}
          type="button"
          onClick={() => onInsert(char)}
          className="px-2 py-0.5 rounded bg-white hover:bg-amber-100 hover:text-amber-900 border border-stone-200 shadow-xs font-mono font-medium transition active:scale-95 cursor-pointer text-stone-700"
        >
          {char}
        </button>
      ))}
    </div>
  );
};

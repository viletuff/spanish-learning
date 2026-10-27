import React, { useState, useEffect } from 'react';
import { Settings, X, Key, Volume2, Download, Upload, Check } from 'lucide-react';
import { speechService } from '../services/speech';
import { storageService } from '../services/storage';
import { useTranslation } from '../services/i18n';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
}) => {
  const { t } = useTranslation();
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
  const [playbackRate, setPlaybackRate] = useState<number>(0.88);
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(storageService.getApiKey());
      const prefs = storageService.getPrefs();
      setPlaybackRate(prefs.playbackRate || 0.88);

      const voices = speechService.getAvailableSpanishVoices();
      setAvailableVoices(voices);
      const status = speechService.getStatus();
      setSelectedVoiceName(status.activeVoice);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.setApiKey(apiKey);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleVoiceChange = (voiceName: string) => {
    const voice = availableVoices.find((v) => v.name === voiceName);
    if (voice) {
      speechService.setVoice(voice);
      setSelectedVoiceName(voiceName);
    }
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    storageService.savePrefs({ playbackRate: rate });
  };

  const handleTestVoice = async () => {
    setIsTestingVoice(true);
    await speechService.speak(
      '¡Hola! Me alegro mucho de que estés aprendiendo español hoy. ¿Qué tal tu día?',
      playbackRate
    );
    setIsTestingVoice(false);
  };

  const handleExportJSON = () => {
    const dataStr = storageService.exportAllData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chispas-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = storageService.importData(content);
        if (success) {
          alert('¡Copia de seguridad restaurada con éxito!');
          onDataRestored();
          onClose();
        } else {
          alert('Hubo un error al procesar el archivo de copia de seguridad.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 animate-fade-in" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-stone-700" />
            <h3 className="font-serif text-2xl font-bold text-stone-900">
              {t.settings.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SECTION 1: Pronunciation & Audio */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-amber-600" />
            <h4 className="font-semibold text-stone-900 text-sm">
              {t.settings.audioHeading}
            </h4>
          </div>

          <div className="space-y-3 p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
                {t.settings.voiceLabel}
              </label>
              {availableVoices.length > 0 ? (
                <select
                  value={selectedVoiceName}
                  onChange={(e) => handleVoiceChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-stone-800 text-xs"
                >
                  {availableVoices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-stone-500">
                  {t.settings.defaultVoice}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-stone-600 mb-1">
                <span>{t.settings.speedLabel}</span>
                <span className="font-mono text-amber-800">{playbackRate.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.1"
                step="0.05"
                value={playbackRate}
                onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>{t.settings.speedSlower}</span>
                <span>{t.settings.speedNormal}</span>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={handleTestVoice}
                disabled={isTestingVoice}
                className="w-full py-2 rounded-xl bg-white hover:bg-amber-50 text-amber-900 border border-stone-200 text-xs font-medium transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                <span>{t.settings.testVoiceBtn}</span>
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 2: AI Configuration (Optional Gemini) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-600" />
            <h4 className="font-semibold text-stone-900 text-sm">
              {t.settings.aiHeading}
            </h4>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
            <p className="text-xs text-stone-600 leading-relaxed">
              {t.settings.aiNote}
            </p>

            <form onSubmit={handleSaveApiKey} className="space-y-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={t.settings.aiPlaceholder}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-stone-800 text-xs font-mono"
              />

              <div className="flex items-center justify-between">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-amber-700 hover:underline"
                >
                  {t.settings.aiGetFreeKey}
                </a>

                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
                >
                  {isSaved ? <Check className="w-3.5 h-3.5" /> : null}
                  <span>{isSaved ? t.settings.savedKeyBtn : t.settings.saveKeyBtn}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* SECTION 3: Backup & Data Export */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-indigo-600" />
            <h4 className="font-semibold text-stone-900 text-sm">
              {t.settings.backupHeading}
            </h4>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
            <p className="text-xs text-stone-600">
              {t.settings.backupNote}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExportJSON}
                className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t.settings.exportJsonBtn}</span>
              </button>

              <label className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>{t.settings.restoreJsonBtn}</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

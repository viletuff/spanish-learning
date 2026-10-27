import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { speechService } from '../services/speech';

interface AudioButtonProps {
  text: string;
  rate?: number;
  label?: string;
  className?: string;
  variant?: 'minimal' | 'pill' | 'button';
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  text,
  rate = 0.88,
  label,
  className = '',
  variant = 'minimal'
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const unsubscribe = speechService.subscribe((speaking, activeText) => {
      // Check if this button's text is the one currently being spoken
      if (speaking && activeText?.includes(text.slice(0, 20))) {
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    });
    return unsubscribe;
  }, [text]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      speechService.stop();
    } else {
      speechService.speak(text, rate);
    }
  };

  if (variant === 'pill') {
    return (
      <button
        onClick={handleToggle}
        type="button"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
          isPlaying
            ? 'bg-amber-600 text-white animate-pulse'
            : 'bg-amber-100/80 text-amber-900 hover:bg-amber-200/90'
        } ${className}`}
        title="Escuchar pronunciación"
      >
        {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        <span>{label || (isPlaying ? 'Detener' : 'Escuchar')}</span>
      </button>
    );
  }

  if (variant === 'button') {
    return (
      <button
        onClick={handleToggle}
        type="button"
        className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition cursor-pointer shadow-xs ${
          isPlaying
            ? 'bg-amber-700 text-white shadow-amber-900/20'
            : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
        } ${className}`}
      >
        {isPlaying ? <VolumeX className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4 text-amber-700" />}
        <span>{label || (isPlaying ? 'Pausar audio' : 'Escuchar en español')}</span>
      </button>
    );
  }

  // Minimal icon variant
  return (
    <button
      onClick={handleToggle}
      type="button"
      className={`p-1.5 rounded-lg text-stone-500 hover:text-amber-800 hover:bg-amber-100/70 transition cursor-pointer ${
        isPlaying ? 'text-amber-700 bg-amber-100 animate-pulse' : ''
      } ${className}`}
      title="Escuchar pronunciación nativa"
    >
      {isPlaying ? <VolumeX className="w-4 h-4 text-amber-700" /> : <Volume2 className="w-4 h-4" />}
    </button>
  );
};

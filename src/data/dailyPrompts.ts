export interface DailyPrompt {
  id: string;
  category: 'simple' | 'reflective' | 'sensory' | 'gratitude';
  spanish: string;
  english: string;
  suggestedStarter: string; // Helpful scaffold so they never face a blank page
  sampleResponse: string;
}

export const DAILY_PROMPTS: DailyPrompt[] = [
  {
    id: 'p-1',
    category: 'simple',
    spanish: '¿Cómo describirías tu nivel de energía hoy en tres palabras?',
    english: 'How would you describe your energy level today in three words?',
    suggestedStarter: 'Hoy mi energía se siente...',
    sampleResponse: 'Hoy mi energía se siente tranquila, un poco baja pero en paz.',
  },
  {
    id: 'p-2',
    category: 'sensory',
    spanish: '¿Cuál fue el mejor sabor o sonido que experimentaste hoy?',
    english: 'What was the best taste or sound you experienced today?',
    suggestedStarter: 'El mejor momento sensorial de hoy fue...',
    sampleResponse: 'El mejor sabor de hoy fue mi primer café caliente por la mañana.',
  },
  {
    id: 'p-3',
    category: 'reflective',
    spanish: '¿Qué palabra en español te gustaría usar más en tu vida real?',
    english: 'Which Spanish word would you like to use more in your real life?',
    suggestedStarter: 'Me encantaría usar más la palabra...',
    sampleResponse: 'Me gustaría usar más la palabra "desahogarme" cuando hablo con mis amistades.',
  },
  {
    id: 'p-4',
    category: 'gratitude',
    spanish: 'Una pequeña cosa que hiciste hoy solo por ti mismo/a:',
    english: 'One small thing you did today just for yourself:',
    suggestedStarter: 'Hoy me tomé diez minutos para...',
    sampleResponse: 'Hoy me tomé diez minutos para caminar sin mirar el teléfono.',
  },
  {
    id: 'p-5',
    category: 'reflective',
    spanish: '¿Qué pensamiento tuviste hoy que no dijiste en voz alta?',
    english: 'What thought did you have today that you didn’t say out loud?',
    suggestedStarter: 'Pensé en...',
    sampleResponse: 'Pensé en lo rápido que pasa el tiempo cuando estoy concentrado/a.',
  },
  {
    id: 'p-6',
    category: 'simple',
    spanish: 'Si el día de hoy fuera el título de una película o serie, ¿cómo se llamaría?',
    english: 'If today were the title of a movie or TV show, what would it be called?',
    suggestedStarter: 'El título de hoy sería...',
    sampleResponse: 'El título de hoy sería "Un martes sorprendentemente tranquilo".',
  }
];

export function getTodayPrompt(): DailyPrompt {
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  return DAILY_PROMPTS[dayOfYear % DAILY_PROMPTS.length];
}

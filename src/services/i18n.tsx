import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'es';

export interface Translations {
  nav: {
    title: string;
    tag: string;
    subtitle: string;
    flashcardsTab: string;
    conjugationsTab: string;
    habitTab: string;
    commonTab: string;
    grammarTab: string;
    vaultTab: string;
    diaryTab: string;
    streakDay: string;
    streakDays: string;
    streakTooltipDone: string;
    streakTooltipTodo: string;
    settingsTooltip: string;
    switchLang: string;
  };
  modes: {
    heading: string;
    subheading: string;
    activeMode: string;
    sparkTitle: string;
    sparkDuration: string;
    sparkDesc: string;
    coffeeTitle: string;
    coffeeDuration: string;
    coffeeDesc: string;
    wineTitle: string;
    wineDuration: string;
    wineDesc: string;
  };
  spark: {
    badge: string;
    doneBadge: string;
    title: string;
    subtitle: string;
    pronounceBtn: string;
    seenIn: string;
    whyMatters: string;
    todayPrompt: string;
    placeholder: string;
    submitBtn: string;
    moreTimePrompt: string;
    moreTimeSub: string;
    goToDiaryBtn: string;
  };
  diary: {
    badge: string;
    title: string;
    subtitle: string;
    kickstarter: string;
    useStarterBtn: string;
    anotherIdeaBtn: string;
    placeholder: string;
    polishBtn: string;
    polishingBtn: string;
    whatYouWrote: string;
    polishedNative: string;
    nuanceHeading: string;
    keyWordsHeading: string;
    savedInVault: string;
    saveToVault: string;
    keepThinkingHeading: string;
    listenQuestion: string;
  };
  deep: {
    badge: string;
    title: string;
    subtitle: string;
    tabMedia: string;
    tabStory: string;
    mediaHeading: string;
    mediaSubtitle: string;
    sourceLabel: string;
    sourcePlaceholder: string;
    quoteLabel: string;
    quotePlaceholder: string;
    breakdownBtn: string;
    analyzingBtn: string;
    vibeLabel: string;
    listenFullQuote: string;
    culturalNoteHeading: string;
    breakdownDetailHeading: string;
    realMeaning: string;
    literalMeaning: string;
    nuanceLabel: string;
    addToVaultBtn: string;
    storyHeading: string;
    storySubtitle: string;
    selectWordsLabel: string;
    selectedCount: string;
    weaveStoryBtn: string;
    weavingStoryBtn: string;
    integratedWords: string;
    listenStoryBtn: string;
    englishSummaryHeading: string;
    comprehensionHeading: string;
    checkAnswerBtn: string;
    explanationHeading: string;
  };
  vault: {
    badge: string;
    title: string;
    subtitle: string;
    memoryGardenBtn: string;
    fullListBtn: string;
    addWordBtn: string;
    searchPlaceholder: string;
    catAll: string;
    catPsych: string;
    catConv: string;
    catTv: string;
    noResultsTitle: string;
    noResultsDesc: string;
    seenIn: string;
    insightHeading: string;
    deleteTooltip: string;
    tapToFlip: string;
    cardOf: string;
    prevBtn: string;
    nextBtn: string;
    modalTitle: string;
    termLabel: string;
    termPlaceholder: string;
    enrichBtn: string;
    contextLabel: string;
    contextPlaceholder: string;
    transLabel: string;
    transPlaceholder: string;
    categoryLabel: string;
    exampleLabel: string;
    examplePlaceholder: string;
    insightLabel: string;
    insightPlaceholder: string;
    cancelBtn: string;
    saveWordBtn: string;
  };
  history: {
    badge: string;
    title: string;
    subtitle: string;
    downloadMarkdown: string;
    emptyTitle: string;
    emptyDesc: string;
    practiceTime: string;
    naturalSpanish: string;
    originalLabel: string;
    styleNote: string;
  };
  settings: {
    title: string;
    audioHeading: string;
    voiceLabel: string;
    defaultVoice: string;
    speedLabel: string;
    speedSlower: string;
    speedNormal: string;
    testVoiceBtn: string;
    aiHeading: string;
    aiNote: string;
    aiPlaceholder: string;
    aiGetFreeKey: string;
    saveKeyBtn: string;
    savedKeyBtn: string;
    backupHeading: string;
    backupNote: string;
    exportJsonBtn: string;
    restoreJsonBtn: string;
  };
  footer: {
    title: string;
    description: string;
    pill1: string;
    pill2: string;
    pill3: string;
  };
  accentBar: {
    label: string;
  };
}

const enTranslations: Translations = {
  nav: {
    title: 'Chispas',
    tag: 'Spanish',
    subtitle: 'Daily journal & curiosities without the Anki burnout',
    flashcardsTab: 'Flashcards',
    conjugationsTab: 'Conjugations',
    habitTab: 'Daily Practice',
    commonTab: 'Top 1,000 Words',
    grammarTab: 'Grammar',
    vaultTab: 'Curiosity Vault',
    diaryTab: 'Diary',
    streakDay: 'day',
    streakDays: 'days',
    streakTooltipDone: "Today's goal completed! Your flame is burning bright.",
    streakTooltipTodo: 'Spend a few minutes today to keep your spark alive.',
    settingsTooltip: 'Voice & AI Settings',
    switchLang: 'Español',
  },
  modes: {
    heading: 'How much time do you have today?',
    subheading: 'Adapt your practice to your real energy. Zero card backlogs, zero guilt.',
    activeMode: 'Active mode right now',
    sparkTitle: 'Chupito (Shot)',
    sparkDuration: '5 min',
    sparkDesc: 'Low time or energy today. 1 curiosity word and 1 quick thought.',
    coffeeTitle: 'Cafecito (Coffee)',
    coffeeDuration: '15 min',
    coffeeDesc: 'Your micro-journal. Describe your day and get gentle native polish with audio.',
    wineTitle: 'Sobremesa (Lingering Talk)',
    wineDuration: '45 min',
    wineDesc: 'Deep immersion: break down TV show dialogues or weave custom stories.',
  },
  spark: {
    badge: 'Spark of the Day · 5 Minutes',
    doneBadge: 'Completed today!',
    title: 'One word, one moment.',
    subtitle: 'No backlogs of 200 overdue flashcards. Today, simply immerse yourself in this concept and reflect in Spanish.',
    pronounceBtn: 'Pronounce',
    seenIn: 'Heard in:',
    whyMatters: 'Why does this word resonate?',
    todayPrompt: "Today's quick reflection:",
    placeholder: 'Ex: ',
    submitBtn: "Complete today's spark (5 min)",
    moreTimePrompt: 'Have extra motivation or a few more minutes?',
    moreTimeSub: 'Switch to Cafecito (15 min) to write freely in your micro-journal and get friendly AI feedback.',
    goToDiaryBtn: 'Open Micro-Diary',
  },
  diary: {
    badge: 'Cafecito · Micro-Diary (15 Minutes)',
    title: 'Describe your day in your own words.',
    subtitle: 'Write 2 or 3 simple sentences about what you did, thought, or felt today. The AI will show you how a native Spanish speaker would naturally phrase it.',
    kickstarter: 'Kickstarter prompt:',
    useStarterBtn: 'Use starter',
    anotherIdeaBtn: 'Another idea',
    placeholder: 'Today I woke up early and had a coffee. I had quite a bit of work, but in the afternoon I unplugged...',
    polishBtn: 'Polish with AI & Save',
    polishingBtn: 'Polishing with care...',
    whatYouWrote: 'What you wrote:',
    polishedNative: 'Fluent, native phrasing:',
    nuanceHeading: 'Nuances that make it sound natural:',
    keyWordsHeading: 'Key expressions to save to your Vault:',
    savedInVault: 'Saved to Vault',
    saveToVault: 'Save to Vault',
    keepThinkingHeading: 'To keep thinking in Spanish:',
    listenQuestion: 'Listen to question',
  },
  deep: {
    badge: 'Sobremesa · Deep Immersion (45 Minutes)',
    title: 'Learn with what you watch and feel.',
    subtitle: 'For days with curiosity and time. Break down Spanish TV show dialogues, generate stories using your saved words, or write a deep reflection.',
    tabMedia: 'TV & Podcast Catcher',
    tabStory: 'Story Weaver with Your Words',
    mediaHeading: 'TV Show & Podcast Dialogue Breakdown',
    mediaSubtitle: 'Heard a curious phrase on Netflix, a chat, or a psychology podcast? Paste it here to dissect idioms, emotional tone, and cultural subtleties.',
    sourceLabel: 'Source (optional):',
    sourcePlaceholder: 'Ex: Valeria, Money Heist, Entiende Tu Mente...',
    quoteLabel: 'Line or subtitle you heard:',
    quotePlaceholder: 'Ex: «A ver, no te rayes tanto, que al final te estás autosaboteando sin darte cuenta...»',
    breakdownBtn: 'Break down dialogue with AI',
    analyzingBtn: 'Analyzing dialogue...',
    vibeLabel: 'Vibe & Emotional Register:',
    listenFullQuote: 'Listen to full quote',
    culturalNoteHeading: 'Cultural & Colloquial Note:',
    breakdownDetailHeading: 'Idiom Breakdown:',
    realMeaning: 'Actual meaning:',
    literalMeaning: 'Literal translation:',
    nuanceLabel: 'Nuance:',
    addToVaultBtn: 'Add to my Vault',
    storyHeading: 'Living Story Weaver',
    storySubtitle: 'Select up to 3 words from your Vault. The AI will craft an introspective micro-story organically weaving them together, complete with audio and comprehension.',
    selectWordsLabel: 'Choose words for the story:',
    selectedCount: 'selected',
    weaveStoryBtn: 'Weave new story',
    weavingStoryBtn: 'Weaving story...',
    integratedWords: 'Integrated words:',
    listenStoryBtn: 'Listen to story read aloud',
    englishSummaryHeading: 'English summary:',
    comprehensionHeading: 'Comprehension question:',
    checkAnswerBtn: 'Check answer',
    explanationHeading: 'Explanation:',
  },
  vault: {
    badge: 'Your Curiosity Vault',
    title: 'The antidote to Anki coldness.',
    subtitle: 'Your saved words are not numbers that expire. They come with context, TV anecdotes, psychology insights, and native audio.',
    memoryGardenBtn: 'Memory Garden (Flip Cards)',
    fullListBtn: 'View Full List',
    addWordBtn: 'Add Word',
    searchPlaceholder: 'Search by word, meaning, TV show, or concept...',
    catAll: 'All',
    catPsych: 'Psychology',
    catConv: 'Conversation',
    catTv: 'TV & Colloquial',
    noResultsTitle: 'No words match your search',
    noResultsDesc: 'Try a different search term or add a new word you heard in your favorite show or podcast.',
    seenIn: 'Heard in:',
    insightHeading: 'Psychological / Cultural Nuance:',
    deleteTooltip: 'Delete word',
    tapToFlip: 'Tap to flip card',
    cardOf: 'Card',
    prevBtn: '← Previous',
    nextBtn: 'Next word →',
    modalTitle: 'Add to Curiosity Vault',
    termLabel: 'Spanish word or phrase:',
    termPlaceholder: 'Ex: desahogarse, apego ansioso...',
    enrichBtn: 'Autofill with AI',
    contextLabel: 'Where did you hear it? (TV show, podcast, neighbor...):',
    contextPlaceholder: 'Ex: Valeria S01E04, Psychology podcast...',
    transLabel: 'English translation or meaning:',
    transPlaceholder: 'Ex: To vent / to unburden emotionally',
    categoryLabel: 'Category:',
    exampleLabel: 'Spanish example sentence:',
    examplePlaceholder: 'Ex: Necesitaba hablar para desahogarme.',
    insightLabel: 'Psychological or cultural nuance:',
    insightPlaceholder: 'Why is this concept interesting or relatable?',
    cancelBtn: 'Cancel',
    saveWordBtn: 'Save to Vault',
  },
  history: {
    badge: 'Reflection History',
    title: 'The archive of your thoughts.',
    subtitle: 'Every sentence you write is a real step toward thinking directly in Spanish without mentally translating.',
    downloadMarkdown: 'Download Markdown (.md)',
    emptyTitle: 'No journal entries yet',
    emptyDesc: 'Complete your first "Chupito" (5 min) or "Cafecito" (15 min) today to see your first entry here.',
    practiceTime: 'min of practice',
    naturalSpanish: 'Fluent, natural Spanish:',
    originalLabel: 'Original:',
    styleNote: 'Style nuance:',
  },
  settings: {
    title: 'Settings',
    audioHeading: 'Pronunciation & Native Voice (Web Speech API)',
    voiceLabel: 'Spanish voice detected on your Mac:',
    defaultVoice: 'Using default system Spanish voice.',
    speedLabel: 'Playback speed:',
    speedSlower: 'Slower (0.7x)',
    speedNormal: 'Normal (1.0x)',
    testVoiceBtn: 'Test pronunciation now',
    aiHeading: 'AI Connection (Optional)',
    aiNote: 'Note: Chispas includes a smart local engine that works 100% offline without any API key. If you want live personalized AI responses, you can enter a free Google Gemini API key.',
    aiPlaceholder: 'Paste your Google Gemini API key here...',
    aiGetFreeKey: 'Get a free key at Google AI Studio →',
    saveKeyBtn: 'Save Key',
    savedKeyBtn: 'Saved',
    backupHeading: 'Backup & Data Ownership',
    backupNote: 'All your words, journals, and streaks are stored privately in your browser on your Mac. You can export a full JSON backup at any time.',
    exportJsonBtn: 'Export JSON',
    restoreJsonBtn: 'Restore JSON',
  },
  footer: {
    title: 'Chispas · Your Spanish Companion',
    description: 'Designed to rekindle your Spanish through curiosity, TV shows, psychology, and your daily life. No flashcard debt, no guilt.',
    pill1: '✨ Flexible 5 to 45 min',
    pill2: '🎙️ Built-in native audio',
    pill3: '💾 100% private on your Mac',
  },
  accentBar: {
    label: 'Accents:',
  },
};

const esTranslations: Translations = {
  nav: {
    title: 'Chispas',
    tag: 'Español',
    subtitle: 'Tu diario y curiosidades sin agobios',
    flashcardsTab: 'Tarjetas',
    conjugationsTab: 'Conjugación',
    habitTab: 'Práctica diaria',
    commonTab: 'Top 1.000 Palabras',
    grammarTab: 'Gramática',
    vaultTab: 'Baúl de curiosidades',
    diaryTab: 'Diario',
    streakDay: 'día',
    streakDays: 'días',
    streakTooltipDone: '¡Objetivo de hoy completado! Tu chispa está viva.',
    streakTooltipTodo: 'Dedica unos minutos hoy para mantener viva tu chispa.',
    settingsTooltip: 'Configuración de voz e IA',
    switchLang: 'English',
  },
  modes: {
    heading: '¿Cuánto tiempo tienes hoy?',
    subheading: 'Adapta tu práctica a tu energía. Sin deudas de tarjetas ni culpas.',
    activeMode: 'Modo activo ahora',
    sparkTitle: 'Chupito',
    sparkDuration: '5 min',
    sparkDesc: 'Poco tiempo o energía hoy. 1 palabra curiosa y una reflexión rápida.',
    coffeeTitle: 'Cafecito',
    coffeeDuration: '15 min',
    coffeeDesc: 'Tu micro-diario. Escribe tu día y recibe pulido nativo con audio.',
    wineTitle: 'Sobremesa',
    wineDuration: '45 min',
    wineDesc: 'Inmersión profunda: analiza diálogos de series o crea historias a medida.',
  },
  spark: {
    badge: 'Chispa del Día · 5 Minutos',
    doneBadge: '¡Completado hoy!',
    title: 'Una palabra, un instante.',
    subtitle: 'Sin listas de 200 tarjetas acumuladas. Hoy basta con sumergirte en este concepto y regalarte un pensamiento en español.',
    pronounceBtn: 'Pronunciar',
    seenIn: 'Visto en:',
    whyMatters: '¿Por qué resuena esta palabra?',
    todayPrompt: 'Reflexión rápida de hoy:',
    placeholder: 'Ej: ',
    submitBtn: 'Marcar chispa de hoy (5 min)',
    moreTimePrompt: '¿Tienes más motivación o unos minutos extra?',
    moreTimeSub: 'Pasa al Cafecito (15 min) para escribir libremente en tu micro-diario y recibir correcciones cariñosas de la IA.',
    goToDiaryBtn: 'Abrir micro-diario',
  },
  diary: {
    badge: 'Cafecito · Micro-Diario (15 Minutos)',
    title: 'Describe tu día con tus propias palabras.',
    subtitle: 'Escribe 2 o 3 frases sencillas sobre lo que hiciste, pensaste o sentiste hoy. La IA te mostrará cómo lo expresaría un hispanohablante de manera natural.',
    kickstarter: 'Idea para arrancar:',
    useStarterBtn: 'Usar inicio',
    anotherIdeaBtn: 'Otra idea',
    placeholder: 'Hoy me desperté temprano y tomé un café. Tuve bastante trabajo, pero por la tarde pude desconectar...',
    polishBtn: 'Pulir con IA y guardar',
    polishingBtn: 'Puliendo con cariño...',
    whatYouWrote: 'Lo que escribiste:',
    polishedNative: 'Versión nativa y fluida:',
    nuanceHeading: 'Detalles que hacen que suene más natural:',
    keyWordsHeading: 'Palabras o giros clave para tu Baúl:',
    savedInVault: 'Guardado en el Baúl',
    saveToVault: 'Guardar en Baúl',
    keepThinkingHeading: 'Para seguir pensando en español:',
    listenQuestion: 'Escuchar pregunta',
  },
  deep: {
    badge: 'Sobremesa · Inmersión Profunda (45 Minutos)',
    title: 'Aprende con lo que ves y sientes.',
    subtitle: 'Para los días con tiempo y curiosidad. Analiza diálogos de series españolas, genera historias usando tus palabras guardadas o escribe una reflexión profunda.',
    tabMedia: 'Cazador de Series y Podcasts',
    tabStory: 'Tejedor de Historias con tus Palabras',
    mediaHeading: 'Desglose de Diálogo de Serie o Podcast',
    mediaSubtitle: '¿Escuchaste una frase curiosa en Netflix, una conversación o un podcast de psicología? Pégala aquí para desgranar modismos, registro emocional y dobles sentidos.',
    sourceLabel: 'Fuente (opcional):',
    sourcePlaceholder: 'Ej: Valeria, Entiende Tu Mente...',
    quoteLabel: 'Frase o subtítulo que escuchaste:',
    quotePlaceholder: 'Ej: «A ver, no te rayes tanto, que al final te estás autosaboteando sin darte cuenta...»',
    breakdownBtn: 'Desgranar diálogo con IA',
    analyzingBtn: 'Analizando diálogo...',
    vibeLabel: 'Ambiente y tono:',
    listenFullQuote: 'Escuchar frase completa',
    culturalNoteHeading: 'Nota cultural y coloquial:',
    breakdownDetailHeading: 'Giro lingüístico desglosado:',
    realMeaning: 'Significado real:',
    literalMeaning: 'Literal:',
    nuanceLabel: 'Matiz:',
    addToVaultBtn: 'Añadir a mi Baúl',
    storyHeading: 'Tejedor de Historias Vivas',
    storySubtitle: 'Selecciona hasta 3 palabras de tu Baúl. La IA escribirá una micro-historia reflexiva que las entrelaza de forma orgánica, con audio y comprensión.',
    selectWordsLabel: 'Elige palabras para la historia:',
    selectedCount: 'seleccionadas',
    weaveStoryBtn: 'Tejer nueva historia',
    weavingStoryBtn: 'Tejiendo relato...',
    integratedWords: 'Palabras integradas:',
    listenStoryBtn: 'Escuchar lectura en voz alta',
    englishSummaryHeading: 'Resumen en inglés:',
    comprehensionHeading: 'Pregunta de comprensión:',
    checkAnswerBtn: 'Comprobar respuesta',
    explanationHeading: 'Explicación:',
  },
  vault: {
    badge: 'Tu Baúl de Curiosidades',
    title: 'El antídoto a la frialdad de Anki.',
    subtitle: 'Tus palabras guardadas no son números que caducan. Tienen contexto, anécdotas de series, notas de psicología y audio nativo.',
    memoryGardenBtn: 'Jardín de memoria (flip)',
    fullListBtn: 'Ver lista completa',
    addWordBtn: 'Añadir palabra',
    searchPlaceholder: 'Buscar por palabra, significado, serie o concepto...',
    catAll: 'Todas',
    catPsych: 'Psicología',
    catConv: 'Conversación',
    catTv: 'Series y Coloquial',
    noResultsTitle: 'No hay palabras que coincidan con la búsqueda',
    noResultsDesc: 'Prueba con otro término o añade una nueva palabra que hayas escuchado en tu serie o podcast favorito.',
    seenIn: 'Visto en:',
    insightHeading: 'Matiz psicológico / cultural:',
    deleteTooltip: 'Eliminar palabra',
    tapToFlip: 'Toca para voltear',
    cardOf: 'Tarjeta',
    prevBtn: '← Anterior',
    nextBtn: 'Siguiente palabra →',
    modalTitle: 'Añadir al Baúl de Palabras',
    termLabel: 'Palabra o expresión en español:',
    termPlaceholder: 'Ej: desahogarse, apego ansioso...',
    enrichBtn: 'Completar con IA',
    contextLabel: '¿Dónde la escuchaste? (serie, podcast, vecino...):',
    contextPlaceholder: 'Ej: Valeria T1E4, Podcast de psicología...',
    transLabel: 'Traducción o significado:',
    transPlaceholder: 'Ej: To vent / to unburden emotionally',
    categoryLabel: 'Categoría:',
    exampleLabel: 'Frase de ejemplo en español:',
    examplePlaceholder: 'Ej: Necesitaba hablar para desahogarme.',
    insightLabel: 'Matiz psicológico o cultural:',
    insightPlaceholder: '¿Por qué es especial o interesante este concepto?',
    cancelBtn: 'Cancelar',
    saveWordBtn: 'Guardar en mi Baúl',
  },
  history: {
    badge: 'Historial de Reflexiones',
    title: 'El archivo de tus pensamientos.',
    subtitle: 'Cada frase que escribes es un paso real hacia pensar directamente en español sin traducir mentalmente.',
    downloadMarkdown: 'Descargar en Markdown (.md)',
    emptyTitle: 'Aún no tienes entradas en tu diario',
    emptyDesc: 'Completa tu primer "Chupito" (5 min) o "Cafecito" (15 min) hoy para ver tu primera reflexión aquí.',
    practiceTime: 'min de práctica',
    naturalSpanish: 'Español fluido y natural:',
    originalLabel: 'Original:',
    styleNote: 'Detalle de estilo:',
  },
  settings: {
    title: 'Configuración',
    audioHeading: 'Pronunciación y Voz Nativa (Web Speech API)',
    voiceLabel: 'Voz en español detectada en tu Mac:',
    defaultVoice: 'Usando voz nativa por defecto del sistema.',
    speedLabel: 'Velocidad de reproducción:',
    speedSlower: 'Más pausado (0.7x)',
    speedNormal: 'Normal (1.0x)',
    testVoiceBtn: 'Probar pronunciación ahora',
    aiHeading: 'Conexión de IA (Opcional)',
    aiNote: 'Nota: Chispas incluye un motor inteligente local que funciona completamente offline sin ninguna clave. Si quieres respuestas de IA 100% personalizadas en vivo, puedes introducir una clave gratuita de Google Gemini API.',
    aiPlaceholder: 'Pega aquí tu clave de Google Gemini...',
    aiGetFreeKey: 'Conseguir clave gratuita en Google AI Studio →',
    saveKeyBtn: 'Guardar clave',
    savedKeyBtn: 'Guardada',
    backupHeading: 'Copia de Seguridad y Datos Propios',
    backupNote: 'Tus palabras, tu diario y tus rachas se guardan en tu navegador en tu Mac. Puedes exportar una copia completa en JSON en cualquier momento.',
    exportJsonBtn: 'Exportar JSON',
    restoreJsonBtn: 'Restaurar JSON',
  },
  footer: {
    title: 'Chispas · Tu Compañero de Español',
    description: 'Diseñado para reconectar con el español a través de la curiosidad, series, psicología y tu propio día a día. Sin deudas de tarjetas ni agobios.',
    pill1: '✨ 5 a 45 min flexibles',
    pill2: '🎙️ Audio nativo integrado',
    pill3: '💾 100% privado en tu Mac',
  },
  accentBar: {
    label: 'Tildes:',
  },
};

const I18nContext = createContext<{
  lang: Language;
  t: Translations;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
}>({
  lang: 'en',
  t: enTranslations,
  setLang: () => {},
  toggleLang: () => {},
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('chispas_lang_v1');
      if (saved === 'es' || saved === 'en') return saved;
    } catch {}
    // Default to English as requested since the user is new!
    return 'en';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('chispas_lang_v1', newLang);
    } catch {}
  };

  const toggleLang = () => {
    setLang(lang === 'en' ? 'es' : 'en');
  };

  const t = lang === 'en' ? enTranslations : esTranslations;

  return (
    <I18nContext.Provider value={{ lang, t, setLang, toggleLang }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => useContext(I18nContext);

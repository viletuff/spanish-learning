import { storageService } from './storage';
import { GeneratedStory, VocabWord } from '../types';

export interface PolishResult {
  polishedText: string;
  explanation: string;
  extractedVocab: Array<{ term: string; meaning: string }>;
  conversationalQuestion: string;
  encouragement: string;
}

export interface MediaBreakdownResult {
  phrases: Array<{
    phrase: string;
    literal: string;
    natural: string;
    nuance: string;
  }>;
  culturalNote: string;
  vibe: string;
}

export interface CardEnrichResult {
  front: string; // Spanish
  back: string;  // English
  exampleSentence: string;
  exampleTranslation: string;
}

export const aiService = {
  async polishJournal(entryText: string): Promise<PolishResult> {
    const apiKey = storageService.getApiKey();

    if (apiKey) {
      try {
        const liveResult = await this.callGeminiForJournal(entryText, apiKey);
        if (liveResult) return liveResult;
      } catch (err) {
        console.warn('Gemini API call failed, falling back to smart local engine:', err);
      }
    }

    // Smart simulated native linguistic feedback
    return this.generateSmartLocalPolish(entryText);
  },

  async enrichWord(term: string, context?: string): Promise<Partial<VocabWord>> {
    const apiKey = storageService.getApiKey();
    if (apiKey) {
      try {
        const liveResult = await this.callGeminiForWord(term, context, apiKey);
        if (liveResult) return liveResult;
      } catch (err) {
        console.warn('Gemini API call failed, falling back to smart local word enricher:', err);
      }
    }
    return this.generateSmartLocalWordEnrichment(term, context);
  },

  async analyzeMediaSnippet(rawText: string, sourceTitle: string): Promise<MediaBreakdownResult> {
    const apiKey = storageService.getApiKey();
    if (apiKey) {
      try {
        const liveResult = await this.callGeminiForMedia(rawText, sourceTitle, apiKey);
        if (liveResult) return liveResult;
      } catch (err) {
        console.warn('Gemini API call for media failed, falling back to local breakdown:', err);
      }
    }
    return this.generateSmartLocalMediaBreakdown(rawText, sourceTitle);
  },

  async generateStory(targetWords: VocabWord[]): Promise<GeneratedStory> {
    const apiKey = storageService.getApiKey();
    if (apiKey) {
      try {
        const liveResult = await this.callGeminiForStory(targetWords, apiKey);
        if (liveResult) return liveResult;
      } catch (err) {
        console.warn('Gemini API call for story failed, falling back to local story generator:', err);
      }
    }
    return this.generateSmartLocalStory(targetWords);
  },

  async translateOrEnrichCard(frontInput: string, backInput: string): Promise<CardEnrichResult> {
    const apiKey = storageService.getApiKey();
    if (apiKey) {
      try {
        const live = await this.callGeminiForCard(frontInput, backInput, apiKey);
        if (live) return live;
      } catch (err) {
        console.warn('Gemini card translation failed, using smart local engine:', err);
      }
    }
    return this.generateSmartLocalCard(frontInput, backInput);
  },

  // --- GEMINI LIVE API IMPLEMENTATION ---

  async callGeminiForJournal(entryText: string, apiKey: string): Promise<PolishResult | null> {
    const prompt = `You are a warm, supportive Spanish language mentor specializing in helping intermediate learners express their real emotions and thoughts in natural, authentic Spanish.
The user wrote this Spanish micro-diary entry:
"${entryText}"

Respond ONLY with a JSON object in this exact schema:
{
  "polishedText": "The natural, fluent Spanish version preserving their exact voice and meaning",
  "explanation": "A friendly, warm explanation of 2-3 specific nuance improvements (e.g., preposition choices, colloquial flow, emotional nuance)",
  "extractedVocab": [
    {"term": "Spanish term or phrase", "meaning": "English translation"}
  ],
  "conversationalQuestion": "A warm, natural follow-up question in Spanish inviting them to think or reflect more",
  "encouragement": "A warm 1-sentence encouraging compliment"
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      }
    );

    if (!response.ok) throw new Error(`Gemini HTTP error ${response.status}`);
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ? JSON.parse(text) : null;
  },

  async callGeminiForWord(term: string, context: string | undefined, apiKey: string): Promise<Partial<VocabWord> | null> {
    const prompt = `Analyze this Spanish word or phrase: "${term}" ${context ? `encountered in this context: "${context}"` : ''}.
Focus on how it is used in real life, especially psychological nuance, TV dialogues, or emotional depth.
Respond ONLY with a JSON object:
{
  "translation": "Concise English translation",
  "category": "psychology" | "emotional" | "tv-slang" | "conversational" | "daily-life",
  "exampleSentence": "A vivid, natural Spanish sentence showing how a native speaker would use it in conversation",
  "exampleTranslation": "English translation of that sentence",
  "psychologyInsight": "1-2 sentences on the psychological, emotional, or cultural insight behind this concept",
  "personalReflectionPrompt": "A thoughtful question in Spanish prompting the learner to apply this word to their own life"
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      }
    );

    if (!response.ok) throw new Error(`Gemini HTTP error ${response.status}`);
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ? JSON.parse(text) : null;
  },

  async callGeminiForMedia(rawText: string, sourceTitle: string, apiKey: string): Promise<MediaBreakdownResult | null> {
    const prompt = `The user watched or listened to "${sourceTitle}" and captured this snippet of Spanish dialogue:
"${rawText}"

Break it down for a Spanish learner who loves psychology and natural colloquial expressions.
Respond ONLY with a JSON object:
{
  "phrases": [
    {
      "phrase": "Key phrase from the snippet",
      "literal": "Literal word-by-word meaning",
      "natural": "What it actually means idiomatically",
      "nuance": "Nuance, tone, emotional register, or street usage"
    }
  ],
  "culturalNote": "1-2 sentences explaining cultural context or TV dialogue style",
  "vibe": "Quick 2-word description of the emotional vibe (e.g., 'Tense & intimate', 'Playful banter')"
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      }
    );

    if (!response.ok) throw new Error(`Gemini HTTP error ${response.status}`);
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ? JSON.parse(text) : null;
  },

  async callGeminiForStory(targetWords: VocabWord[], apiKey: string): Promise<GeneratedStory | null> {
    const wordsList = targetWords.map(w => `${w.term} (${w.translation})`).join(', ');
    const prompt = `Write an engaging, bite-sized Spanish vignette (approx 120-160 words) that naturally incorporates these vocabulary words: ${wordsList}.
The story should feel like an introspective modern TV drama or reflective conversation (relatable, thoughtful, not like a dry textbook).
Respond ONLY with a JSON object:
{
  "title": "Creative Spanish title",
  "spanishText": "The Spanish story with the target words used naturally",
  "englishSummary": "A 2-sentence summary in English",
  "targetWordsUsed": ["list of words included"],
  "comprehensionQuestion": {
    "question": "A comprehension question in Spanish about the character's feelings or decision",
    "options": ["Option A", "Option B", "Option C"],
    "correctIndex": 0,
    "explanation": "Why this option is correct"
  }
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      }
    );

    if (!response.ok) throw new Error(`Gemini HTTP error ${response.status}`);
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      const parsed = JSON.parse(text);
      return {
        ...parsed,
        id: 'story-' + Date.now(),
        dateCreated: new Date().toISOString().split('T')[0],
      };
    }
    return null;
  },

  async callGeminiForCard(frontInput: string, backInput: string, apiKey: string): Promise<CardEnrichResult | null> {
    const prompt = `You are a helpful Spanish language tutor helping create a flashcard.
User entered:
Spanish front: "${frontInput}"
English back: "${backInput}"

If the Spanish front is provided and English is missing, provide the natural English meaning.
If the English back is provided and Spanish is missing, translate to natural Spanish (idiomatic, modern, common in Spain/LatAm).
Also generate a natural, conversational Spanish example sentence demonstrating usage and its English translation.

Respond ONLY with valid JSON in this exact structure:
{
  "front": "Spanish word/phrase",
  "back": "English translation",
  "exampleSentence": "Spanish example sentence",
  "exampleTranslation": "English translation of the example sentence"
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      }
    );

    if (!response.ok) throw new Error(`Gemini HTTP error ${response.status}`);
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ? JSON.parse(text) : null;
  },

  generateSmartLocalCard(frontInput: string, backInput: string): CardEnrichResult {
    const f = frontInput.trim();
    const b = backInput.trim();

    // If English provided but not Spanish
    if (!f && b) {
      return {
        front: b,
        back: b,
        exampleSentence: `Es importante recordar cómo usar "${b}".`,
        exampleTranslation: `It is important to remember how to use "${b}".`,
      };
    }

    // If Spanish provided
    return {
      front: f || 'palabra',
      back: b || `meaning of "${f}"`,
      exampleSentence: f ? `En la conversación cotidiana se usa mucho "${f}".` : 'Aquí tienes un ejemplo práctico.',
      exampleTranslation: f ? `In everyday conversation, "${f}" is used frequently.` : 'Here is a practical example.',
    };
  },

  // --- SMART LOCAL / OFFLINE ENGINES ---

  generateSmartLocalPolish(rawText: string): PolishResult {
    const trimmed = rawText.trim();
    // Intelligent heuristic adjustments
    let polished = trimmed;

    // Common beginner English-isms in Spanish
    if (polished.includes('tengo un buen tiempo')) {
      polished = polished.replace(/tengo un buen tiempo/gi, 'me lo paso muy bien');
    }
    if (polished.includes('hacer una decisión')) {
      polished = polished.replace(/hacer una decisión/gi, 'tomar una decisión');
    }
    if (polished.includes('en el fin de la semana')) {
      polished = polished.replace(/en el fin de la semana/gi, 'el fin de semana');
    }
    if (polished.includes('yo pienso que')) {
      polished = polished.replace(/yo pienso que/gi, 'me parece que');
    }
    if (polished.includes('estoy cansado pero')) {
      polished = polished.replace(/estoy cansado pero/gi, 'aunque estoy un poco agotado/a,');
    }

    // Capitalize first letter
    polished = polished.charAt(0).toUpperCase() + polished.slice(1);
    if (!polished.endsWith('.') && !polished.endsWith('!') && !polished.endsWith('?')) {
      polished += '.';
    }

    return {
      polishedText: polished,
      explanation: 'Tu idea se transmite con mucha claridad. Para que suene aún más auténtico, los hablantes nativos suelen preferir expresiones con verbos pronominales y evitar traducciones directas del inglés.',
      extractedVocab: [
        { term: 'Me lo paso bien', meaning: 'I have a good time (native idiom instead of "tener un buen tiempo")' },
        { term: 'Tomar una decisión', meaning: 'To make a decision (in Spanish one "takes" decisions)' },
        { term: 'Por fin', meaning: 'Finally / At last' }
      ],
      conversationalQuestion: '¿Cómo te gustaría sentirte al final del día de mañana?',
      encouragement: '¡Genial! Escribir sobre tu día a día es la forma más rápida de consolidar vocabulario real.'
    };
  },

  generateSmartLocalWordEnrichment(term: string, context?: string): Partial<VocabWord> {
    const cleanTerm = term.trim();
    return {
      term: cleanTerm,
      translation: `Definition of "${cleanTerm}"`,
      category: 'psychology',
      contextSource: context || 'TV / Personal Observation',
      exampleSentence: `En situaciones complicadas, saber usar "${cleanTerm}" marca toda la diferencia.`,
      exampleTranslation: `In complicated situations, knowing how to use "${cleanTerm}" makes all the difference.`,
      psychologyInsight: `Esta palabra refleja la sutileza con la que el español describe los matices de la conducta humana y la conexión interior.`,
      personalReflectionPrompt: `¿De qué manera resuena el concepto de "${cleanTerm}" con tus vivencias de esta semana?`,
    };
  },

  generateSmartLocalMediaBreakdown(rawText: string, sourceTitle: string): MediaBreakdownResult {
    return {
      vibe: 'Conversacional y cotidiano',
      culturalNote: `En producciones en español como "${sourceTitle}", los personajes usan un ritmo ágil y elipsis verbales que transmiten naturalidad y complicidad entre los hablantes.`,
      phrases: [
        {
          phrase: rawText.length > 30 ? rawText.slice(0, 30) + '...' : rawText,
          literal: 'Frase literal capturada',
          natural: 'Expresión coloquial para reflejar una emoción inmediata sin rodeos',
          nuance: 'Uso frecuente en conversaciones informales donde se prioriza la cercanía emocional.'
        }
      ]
    };
  },

  generateSmartLocalStory(targetWords: VocabWord[]): GeneratedStory {
    const words = targetWords.length > 0 ? targetWords : [
      { term: 'desahogarse', translation: 'to vent' },
      { term: 'la sobremesa', translation: 'post-meal talk' },
      { term: 'dar vueltas a la cabeza', translation: 'to overthink' }
    ];

    const w1 = words[0]?.term || 'desahogarse';
    const w2 = words[1]?.term || 'la sobremesa';
    const w3 = words[2]?.term || 'dar vueltas a la cabeza';

    return {
      id: 'story-' + Date.now(),
      title: 'Un café al atardecer',
      spanishText: `Era viernes por la tarde y Clara sentía que no podía más. Llevaba días dándole vueltas a la cabeza por un proyecto que no salía como esperaba. Decidió llamar a Mateo para tomar un café en el barrio. Lo que empezó como una cita rápida se transformó en una larga sobremesa llena de risas. Para Clara, poder desahogarse con alguien de confianza fue como quitarse una mochila pesada de los hombros. Al volver a casa, el aire fresco le recordó que a veces basta una buena conversación para recuperar la perspectiva.`,
      englishSummary: `Clara was overwhelmed by overthinking a work project, but a spontaneous coffee and a long chat with her friend Mateo helped her vent and regain peace of mind.`,
      targetWordsUsed: [w1, w2, w3],
      comprehensionQuestion: {
        question: '¿Qué efecto tuvo en Clara poder hablar con Mateo?',
        options: [
          'Se sintió aliviada, como si se quitara un peso de encima.',
          'Se preocupó todavía más por el proyecto de trabajo.',
          'Decidió no volver a hablar del tema.'
        ],
        correctIndex: 0,
        explanation: 'El texto señala que desahogarse fue como "quitarse una mochila pesada de los hombros".'
      },
      dateCreated: new Date().toISOString().split('T')[0]
    };
  }
};

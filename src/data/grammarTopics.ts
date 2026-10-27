import { GrammarTopic } from '../types';

export const GRAMMAR_TOPICS: GrammarTopic[] = [
  {
    id: 'ser-vs-estar',
    title: 'Ser vs. Estar: The Two Faces of "To Be"',
    titleEs: 'Ser vs. Estar: Las dos caras del verbo "To Be"',
    subtitle: 'The single most famous Spanish distinction made crystal clear.',
    subtitleEs: 'La distinción más famosa del español explicada con claridad total.',
    category: 'essential',
    mentalModel: 'Think of SER as the "Identity & DNA" (what something is fundamentally) and ESTAR as the "Snapshot & State" (how or where something is right now).',
    mentalModelEs: 'Piensa en SER como la "Identidad y Esencia" (lo que algo es por naturaleza) y en ESTAR como la "Foto del Momento" (cómo o dónde se encuentra ahora mismo).',
    rules: [
      {
        label: 'When to use SER (Identity / DOCTOR)',
        labelEs: 'Cuándo usar SER (Identidad / DOCTOR)',
        explanation: 'Use SER for permanent traits, origin, profession, time, and relationships: Description, Occupation, Characteristic, Time, Origin, Relationship.',
        explanationEs: 'Usa SER para rasgos esenciales, origen, profesión, la hora y relaciones personales.',
        examples: [
          { es: 'Soy de Madrid, pero vivo en Barcelona.', en: 'I am from Madrid, but I live in Barcelona. (Origin)' },
          { es: 'Mi vecina es psicóloga.', en: 'My neighbor is a psychologist. (Profession)' },
          { es: 'Hoy es martes, son las cuatro.', en: 'Today is Tuesday, it is four o\'clock. (Time)' },
          { es: 'Ella es muy empática y tranquila.', en: 'She is very empathetic and calm as a person. (Core trait)' }
        ]
      },
      {
        label: 'When to use ESTAR (State & Location / PLACE)',
        labelEs: 'Cuándo usar ESTAR (Estado y Ubicación / PLACE)',
        explanation: 'Use ESTAR for temporary conditions, current location, immediate emotions, and ongoing actions: Position, Location, Action (-ndo), Condition, Emotion.',
        explanationEs: 'Usa ESTAR para condiciones temporales, ubicación actual, emociones del momento y acciones en curso (-ndo).',
        examples: [
          { es: 'Estoy cansado después del trabajo.', en: 'I am tired after work. (Temporary condition)' },
          { es: 'El café está en la mesa.', en: 'The coffee is on the table. (Location)' },
          { es: 'Estoy viendo una serie española.', en: 'I am watching a Spanish TV show. (Action in progress)' },
          { es: 'Hoy estoy de muy buen humor.', en: 'Today I am in a very good mood. (Emotion)' }
        ]
      }
    ],
    comparison: [
      {
        caseA: 'Soy aburrido / aburrida',
        caseB: 'Estoy aburrido / aburrida',
        meaningA: 'I am a boring person (personality trait)',
        meaningB: 'I am bored right now (temporary state)'
      },
      {
        caseA: 'Es listo / lista',
        caseB: 'Está listo / lista',
        meaningA: 'He/She is smart and clever (trait)',
        meaningB: 'He/She is ready to go (state)'
      },
      {
        caseA: 'La manzana es verde',
        caseB: 'La manzana está verde',
        meaningA: 'The apple is of green variety (color trait)',
        meaningB: 'The apple is unripe right now (condition)'
      },
      {
        caseA: 'El café es rico',
        caseB: 'El café está rico',
        meaningA: 'Coffee is delicious in general (concept)',
        meaningB: 'This specific cup of coffee tastes great right now'
      }
    ],
    quiz: [
      {
        question: 'Which verb fits best: "Hoy _______ un poco cansado, pero mañana tendré más energía."',
        questionEs: '¿Qué verbo encaja mejor: "Hoy _______ un poco cansado, pero mañana tendré más energía."',
        options: ['soy', 'estoy', 'era', 'sea'],
        correctIndex: 1,
        explanation: 'We use "estoy" because feeling tired is a temporary physical/emotional condition, not a permanent identity trait.',
        explanationEs: 'Usamos "estoy" porque estar cansado es un estado físico temporal, no un rasgo permanente.'
      },
      {
        question: 'Complete the sentence: "Mi amiga Laura _______ de Valencia, pero ahora _______ en Madrid."',
        questionEs: 'Completa la frase: "Mi amiga Laura _______ de Valencia, pero ahora _______ en Madrid."',
        options: ['está / es', 'es / está', 'es / es', 'está / está'],
        correctIndex: 1,
        explanation: 'Origin uses SER ("es de Valencia"), while current location uses ESTAR ("está en Madrid").',
        explanationEs: 'El origen requiere SER ("es de Valencia") y la ubicación geográfica usa ESTAR ("está en Madrid").'
      },
      {
        question: 'How do you say "Are you ready?" to a friend before leaving?',
        questionEs: '¿Cómo dices "¿Estás listo?" a un amigo antes de salir?',
        options: ['¿Eres listo?', '¿Estás listo?', '¿Tienes listo?', '¿Haces listo?'],
        correctIndex: 1,
        explanation: '"¿Estás listo?" means "Are you ready?". In contrast, "¿Eres listo?" means "Are you clever/smart?".',
        explanationEs: '"¿Estás listo?" significa preparado para salir. En cambio, "¿Eres listo?" pregunta si eres inteligente.'
      }
    ]
  },
  {
    id: 'por-vs-para',
    title: 'Por vs. Para: Cause vs. Destination',
    titleEs: 'Por vs. Para: Causa vs. Destino',
    subtitle: 'Master the two Spanish prepositions that both mean "for".',
    subtitleEs: 'Domina las dos preposiciones del español que en inglés se traducen como "for".',
    category: 'essential',
    mentalModel: 'POR looks BACKWARD at the cause, motive, exchange, or duration ("Because of / in exchange for / through"). PARA looks FORWARD toward the goal, recipient, deadline, or future destination ("Toward / in order to / intended for").',
    mentalModelEs: 'POR mira hacia ATRÁS (la causa, motivo, intercambio o duración). PARA mira hacia ADELANTE (el objetivo, destinatario, fecha límite o meta).',
    rules: [
      {
        label: 'When to use POR (Motive, Cause, Duration, Exchange)',
        labelEs: 'Cuándo usar POR (Motivo, Causa, Duración, Intercambio)',
        explanation: 'Use POR for the reason why something happens, duration of time, gratitude, means of communication, and cost/exchange.',
        explanationEs: 'Usa POR para la razón o causa, duración en el tiempo, agradecimientos, medio de transporte y precio/intercambio.',
        examples: [
          { es: 'Gracias por escucharme cuando necesitaba desahogarme.', en: 'Thank you for listening to me when I needed to vent. (Gratitude / Reason)' },
          { es: 'Hablamos por teléfono durante una hora.', en: 'We spoke by phone for an hour. (Means & Duration)' },
          { es: 'Pagué diez euros por este libro.', en: 'I paid ten euros for this book. (Exchange)' },
          { es: 'Paseamos por el parque al atardecer.', en: 'We strolled through / around the park at sunset. (Movement through)' }
        ]
      },
      {
        label: 'When to use PARA (Goal, Recipient, Deadline, Destination)',
        labelEs: 'Cuándo usar PARA (Objetivo, Destinatario, Plazo, Destino)',
        explanation: 'Use PARA when there is a clear destination, future recipient, strict deadline, or purpose ("in order to").',
        explanationEs: 'Usa PARA cuando hay un destino claro, un destinatario futuro, una fecha límite o un propósito ("para + infinitivo").',
        examples: [
          { es: 'Este cuaderno es para apuntar mis reflexiones.', en: 'This notebook is for writing down my reflections. (Purpose / In order to)' },
          { es: 'Tengo que terminar la entrada para las seis.', en: 'I have to finish the entry by six o\'clock. (Deadline)' },
          { es: 'Salgo para Madrid mañana temprano.', en: 'I am leaving for Madrid early tomorrow. (Destination)' },
          { es: 'Compré un regalo para mi amiga.', en: 'I bought a gift for my friend. (Recipient)' }
        ]
      }
    ],
    comparison: [
      {
        caseA: 'Trabajo por ti',
        caseB: 'Trabajo para ti',
        meaningA: 'I work in your place / on your behalf / because of you',
        meaningB: 'You are my boss / I work for your company'
      },
      {
        caseA: 'Estudié por dos horas',
        caseB: 'La tarea es para mañana',
        meaningA: 'Duration of time completed',
        meaningB: 'Future deadline constraint'
      }
    ],
    quiz: [
      {
        question: 'Which preposition fits: "Estudio español _______ poder conversar con mis vecinos."',
        questionEs: '¿Qué preposición encaja: "Estudio español _______ poder conversar con mis vecinos."',
        options: ['por', 'para', 'de', 'con'],
        correctIndex: 1,
        explanation: 'We use "para" because it expresses the purpose / goal ("in order to be able to talk").',
        explanationEs: 'Usamos "para" porque indica el objetivo o propósito ("para poder conversar").'
      },
      {
        question: 'Complete: "Muchas gracias _______ tu ayuda hoy."',
        questionEs: 'Completa: "Muchas gracias _______ tu ayuda hoy."',
        options: ['para', 'por', 'sobre', 'hacia'],
        correctIndex: 1,
        explanation: 'Gratitude always takes "por" because you are thanking someone for a reason that already happened.',
        explanationEs: 'El agradecimiento siempre lleva "por" porque agradeces la causa de la ayuda.'
      }
    ]
  },
  {
    id: 'preterito-vs-imperfecto',
    title: 'Preterite vs. Imperfect: Storytelling in the Past',
    titleEs: 'Pretérito vs. Imperfecto: Narrar en el Pasado',
    subtitle: 'The golden rule: setting the scene vs. the action that happened.',
    subtitleEs: 'La regla de oro: el escenario de fondo vs. la acción concreta.',
    category: 'intermediate',
    mentalModel: 'Think of a movie: the IMPERFECT is the backdrop, weather, ongoing feelings, and scenery (what was happening / used to happen). The PRETERITE is the specific snap action that occurred in the foreground (what happened at that exact moment).',
    mentalModelEs: 'Piensa en una película: el IMPERFECTO es el decorado, el clima, las emociones de fondo y las costumbres (lo que estaba pasando). El PRETÉRITO es el suceso concreto que interrumpe o avanza la trama.',
    rules: [
      {
        label: 'Pretérito Imperfecto (The Scenery & Habits)',
        labelEs: 'Pretérito Imperfecto (El Escenario y Costumbres)',
        explanation: 'Use Imperfect for ongoing background states, descriptions, habitual actions in the past ("used to / was doing"), age, and time in the past.',
        explanationEs: 'Usa el imperfecto para descripciones de fondo, acciones habituales ("solía / hacía"), edad y la hora en el pasado.',
        examples: [
          { es: 'Hacía sol y los pájaros cantaban.', en: 'It was sunny and the birds were singing. (Background scenery)' },
          { es: 'Cuando vivía en Valencia, iba a la playa cada tarde.', en: 'When I lived in Valencia, I used to go to the beach every afternoon. (Past habit)' },
          { es: 'Tenía muchas dudas sobre mi pronunciación.', en: 'I had many doubts about my pronunciation. (Ongoing state of mind)' }
        ]
      },
      {
        label: 'Pretérito Indefinido (The Snap Event)',
        labelEs: 'Pretérito Indefinido (El Suceso Concreto)',
        explanation: 'Use Preterite for completed, bounded actions that happened once or moved the storyline forward.',
        explanationEs: 'Usa el pretérito indefinido para acciones puntuales, terminadas, con principio y fin claros.',
        examples: [
          { es: 'De repente, sonó el teléfono.', en: 'Suddenly, the telephone rang. (Interruption event)' },
          { es: 'Ayer escribí tres frases en mi diario.', en: 'Yesterday I wrote three sentences in my journal. (Completed event)' },
          { es: 'Llegué a España el año pasado.', en: 'I arrived in Spain last year. (Specific milestone)' }
        ]
      }
    ],
    comparison: [
      {
        caseA: 'Llovía cuando salí de casa',
        caseB: 'Empezó a llover a las cinco',
        meaningA: 'Imperfect (ongoing background rain) + Preterite (action of leaving)',
        meaningB: 'Preterite (the discrete moment rain started)'
      }
    ],
    quiz: [
      {
        question: 'Complete: "Mientras yo _______ (leer) tranquilamente, mi amiga _______ (llamar) a la puerta."',
        questionEs: 'Completa: "Mientras yo _______ (leer) tranquilamente, mi amiga _______ (llamar) a la puerta."',
        options: ['leía / llamó', 'leí / llamaba', 'leía / llamaba', 'leí / llamó'],
        correctIndex: 0,
        explanation: '"Leía" is the ongoing background action (imperfect), and "llamó" is the specific interruption (preterite).',
        explanationEs: '"Leía" es la acción de fondo en curso (imperfecto) y "llamó" es el evento puntual (indefinido).'
      }
    ]
  },
  {
    id: 'gustar-verbs',
    title: 'Gustar & "Backwards" Emotion Verbs',
    titleEs: 'Gustar y Verbos de Emoción Invertida',
    subtitle: 'Why "Me gusta" literally means "It pleases me".',
    subtitleEs: 'Por qué "Me gusta" literalmente significa "Me agrada a mí".',
    category: 'essential',
    mentalModel: 'In English, you are the subject acting on the thing: "I like coffee." In Spanish, the thing is the subject acting on you: "El café me gusta a mí" (Coffee pleases me). You are the recipient of the feeling!',
    mentalModelEs: 'En español no eres tú quien realiza la acción, sino que la cosa o actividad te produce esa sensación a ti. Por eso el verbo coincide con lo que te gusta (singular o plural).',
    rules: [
      {
        label: 'The Golden Pronoun Grid (me, te, le, nos, os, les)',
        labelEs: 'La Tabla de Pronombres (me, te, le, nos, os, les)',
        explanation: 'The verb only has TWO common forms: gusta (singular thing or verb) / gustan (plural things). The person is indicated by the indirect pronoun.',
        explanationEs: 'El verbo casi siempre tiene solo dos formas: gusta (cosa singular o infinitivo) o gustan (cosas en plural).',
        examples: [
          { es: 'Me gusta escribir en mi diario.', en: 'I like writing in my journal. (Singular action -> gusta)' },
          { es: 'Me gustan las series españolas.', en: 'I like Spanish TV shows. (Plural noun -> gustan)' },
          { es: '¿Te gusta este método?', en: 'Do you like this method?' },
          { es: 'Nos encanta pasear al atardecer.', en: 'We love strolling at sunset.' }
        ]
      },
      {
        label: 'Sister Verbs that Work Identically',
        labelEs: 'Verbos Hermanos que Funcionan Igual',
        explanation: 'These vital psychology & emotion verbs follow the exact same structure: encantar (to love), costar (to find hard), doler (to hurt), preocupar (to worry), parecer (to seem).',
        explanationEs: 'Muchos verbos psicológicos funcionan igual: encantar, costar, doler, preocupar, parecer.',
        examples: [
          { es: 'Me cuesta recordar palabras sin contexto.', en: 'I find it hard to remember words without context. (Literally: It costs me)' },
          { es: 'Me parece una idea maravillosa.', en: 'It seems to me like a wonderful idea.' },
          { es: 'Me preocupa no tener tiempo.', en: 'It worries me not having time.' }
        ]
      }
    ],
    quiz: [
      {
        question: 'Which is correct: "A mí me _______ los modismos que aprendo en las series."',
        questionEs: '¿Cuál es correcto: "A mí me _______ los modismos que aprendo en las series."',
        options: ['gusta', 'gustan', 'gusto', 'gustas'],
        correctIndex: 1,
        explanation: 'We use "gustan" because the subject is plural: "los modismos".',
        explanationEs: 'Usamos "gustan" porque el sujeto es plural: "los modismos".'
      },
      {
        question: 'How do you say "I find it hard to speak without getting nervous"?',
        questionEs: '¿Cómo dices "Me cuesta hablar sin ponerme nervioso"?',
        options: [
          'Me cuesta hablar sin ponerme nervioso.',
          'Yo cuesto hablar sin ponerme nervioso.',
          'Cuesto de hablar sin nervios.',
          'Me gusto hablar sin nervios.'
        ],
        correctIndex: 0,
        explanation: '"Costar" functions like "gustar": "Me cuesta [infinitivo]" means "It is hard / takes effort for me".',
        explanationEs: '"Costar" funciona como "gustar": "Me cuesta hablar" significa que te requiere esfuerzo.'
      }
    ]
  },
  {
    id: 'pronombres-objeto',
    title: 'Direct vs. Indirect Pronouns & The Magic "Se Lo"',
    titleEs: 'Pronombres de Objeto Directo e Indirecto y el Mágico "Se Lo"',
    subtitle: 'Demystifying lo, la, le, and why "le lo" becomes "se lo".',
    subtitleEs: 'Desmitificando lo, la, le y por qué "le lo" se convierte en "se lo".',
    category: 'intermediate',
    mentalModel: 'DIRECT pronoun (lo / la / los / las) answers "WHAT is being acted upon?". INDIRECT pronoun (le / les) answers "TO WHOM / FOR WHOM?". When they collide, Spanish phonetics softens "le lo" into "se lo" for musical flow.',
    mentalModelEs: 'El pronombre DIRECTO (lo/la) responde a "¿QUÉ?". El pronombre INDIRECTO (le/les) responde a "¿A QUIÉN?". Cuando van juntos, el español convierte "le lo" en "se lo" para evitar la cacofonía.',
    rules: [
      {
        label: 'Direct Object (Lo, La, Los, Las)',
        labelEs: 'Objeto Directo (Lo, La, Los, Las)',
        explanation: 'Replaces the noun directly receiving the action. Must match gender and number.',
        explanationEs: 'Reemplaza al sustantivo que recibe directamente la acción. Concuerda en género y número.',
        examples: [
          { es: '¿Leíste el artículo? — Sí, lo leí esta mañana.', en: 'Did you read the article? — Yes, I read it this morning.' },
          { es: '¿Viste la serie? — Sí, la vi anoche.', en: 'Did you watch the series? — Yes, I watched it last night.' }
        ]
      },
      {
        label: 'Indirect Object (Le, Les) and the "Se" Transformation',
        labelEs: 'Objeto Indirecto (Le, Les) y la Transformación en "Se"',
        explanation: 'Indicates the recipient. When placed directly before "lo/la", "le" changes to "se".',
        explanationEs: 'Indica el destinatario. Cuando se coloca antes de "lo/la", "le" cambia obligatoriamente a "se".',
        examples: [
          { es: 'Le di el cuaderno a mi amiga -> Se lo di.', en: 'I gave the notebook to my friend -> I gave it to her. (Not "le lo")' },
          { es: '¿Le explicaste la regla? — Sí, se la expliqué.', en: 'Did you explain the rule to him? — Yes, I explained it to him.' }
        ]
      }
    ],
    quiz: [
      {
        question: 'Replace the nouns: "Escribí una carta (la) a mi amiga (le)" ->',
        questionEs: 'Reemplaza los sustantivos: "Escribí una carta (la) a mi amiga (le)" ->',
        options: ['Le la escribí', 'Se la escribí', 'Lo le escribí', 'La se escribí'],
        correctIndex: 1,
        explanation: '"Le la" transforms into "Se la" in Spanish phonetics to avoid the clash of two "l" sounds.',
        explanationEs: '"Le la" se transforma en "Se la" para evitar el choque de dos sonidos en "l".'
      }
    ]
  },
  {
    id: 'el-subjuntivo',
    title: 'The Subjunctive Spark: Hopes, Emotions & Doubts',
    titleEs: 'El Subjuntivo: Deseos, Emociones y Dudas',
    subtitle: 'The mood of the heart and the imagination, without fear.',
    subtitleEs: 'El modo del corazón y la imaginación, sin miedos.',
    category: 'nuance',
    mentalModel: 'The INDICATIVE is the camera recording objective facts ("Sé que tienes tiempo"). The SUBJUNCTIVE is the imagination wishing, feeling, or hoping ("Espero que tengas tiempo"). Whenever you step from fact into desire, the subjunctive awakens.',
    mentalModelEs: 'El INDICATIVO afirma hechos ("Tienes tiempo"). El SUBJUNTIVO expresa deseos, dudas o emociones sobre lo que no controlas ("Ojalá tengas tiempo").',
    rules: [
      {
        label: 'When does the Subjunctive trigger? (WEIRDO)',
        labelEs: '¿Cuándo se activa el Subjuntivo? (WEIRDO)',
        explanation: 'Triggers with Wishes, Emotions, Impersonal expressions, Requests, Doubt, and Ojalá.',
        explanationEs: 'Se activa con Deseos (Wishes), Emociones, Expresiones impersonales, Peticiones, Dudas y Ojalá.',
        examples: [
          { es: 'Espero que estés bien hoy.', en: 'I hope that you are well today. (Wish / Hope)' },
          { es: 'Me alegra que retomes el español.', en: 'It makes me glad that you are resuming Spanish. (Emotion)' },
          { es: 'Es importante que descanses.', en: 'It is important that you rest. (Impersonal judgment)' },
          { es: 'Ojalá podamos viajar juntos a España.', en: 'Hopefully we can travel to Spain together. (Ojalá wish)' }
        ]
      }
    ],
    quiz: [
      {
        question: 'Complete: "Espero que tú _______ (tener) un día muy tranquilo."',
        questionEs: 'Completa: "Espero que tú _______ (tener) un día muy tranquilo."',
        options: ['tienes', 'tengas', 'tenías', 'tuviste'],
        correctIndex: 1,
        explanation: '"Espero que..." expresses a wish/hope, which triggers the present subjunctive: "tengas".',
        explanationEs: '"Espero que..." expresa un deseo para el futuro, lo cual activa el presente de subjuntivo: "tengas".'
      }
    ]
  }
];

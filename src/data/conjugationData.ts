import { VerbData, ConjugationLevel, PronounKey, TenseKey } from '../types';

export const PRONOUN_LABELS = {
  yo: { es: 'Yo', en: 'I' },
  tu: { es: 'Tú', en: 'You (informal)' },
  el: { es: 'Él / Ella / Usted', en: 'He / She / You (formal)' },
  nosotros: { es: 'Nosotros / Nosotras', en: 'We' },
  vosotros: { es: 'Vosotros / Vosotras', en: 'You all (informal, Spain)' },
  ellos: { es: 'Ellos / Ellas / Ustedes', en: 'They / You all' },
};

export const TENSE_METADATA = {
  presente: {
    nameEn: 'Present',
    nameEs: 'Presente',
    usage: 'Current habits, facts, and actions happening now (e.g. "I speak / I am speaking")',
  },
  preterito: {
    nameEn: 'Preterite (Simple Past)',
    nameEs: 'Pretérito Indefinido',
    usage: 'Completed actions in the past with a specific timeline (e.g. "I spoke / I did")',
  },
  imperfecto: {
    nameEn: 'Imperfect (Past Continuous)',
    nameEs: 'Pretérito Imperfecto',
    usage: 'Habitual past actions, descriptions, background (e.g. "I used to speak / I was speaking")',
  },
  futuro: {
    nameEn: 'Future',
    nameEs: 'Futuro Simple',
    usage: 'Things that will happen, or probability (e.g. "I will speak")',
  },
  subjuntivo: {
    nameEn: 'Present Subjunctive',
    nameEs: 'Subjuntivo Presente',
    usage: 'Wishes, doubts, recommendations, uncertainty (e.g. "Espero que hables")',
  },
};

export const VERB_LIST: VerbData[] = [
  {
    infinitive: 'ser',
    english: 'to be (inherent, essence, identity, origin)',
    type: 'irregular',
    hint: 'Completely irregular in present, preterite, and imperfect!',
    tenses: {
      presente: { yo: 'soy', tu: 'eres', el: 'es', nosotros: 'somos', vosotros: 'sois', ellos: 'son' },
      preterito: { yo: 'fui', tu: 'fuiste', el: 'fue', nosotros: 'fuimos', vosotros: 'fuisteis', ellos: 'fueron' },
      imperfecto: { yo: 'era', tu: 'eras', el: 'era', nosotros: 'éramos', vosotros: 'erais', ellos: 'eran' },
      futuro: { yo: 'seré', tu: 'serás', el: 'será', nosotros: 'seremos', vosotros: 'seréis', ellos: 'serán' },
      subjuntivo: { yo: 'sea', tu: 'seas', el: 'sea', nosotros: 'seamos', vosotros: 'seáis', ellos: 'sean' },
    },
  },
  {
    infinitive: 'estar',
    english: 'to be (temporary state, mood, location)',
    type: 'irregular',
    hint: 'Notice accents on estás, está, están in present. Preterite stem is estuv-!',
    tenses: {
      presente: { yo: 'estoy', tu: 'estás', el: 'está', nosotros: 'estamos', vosotros: 'estáis', ellos: 'están' },
      preterito: { yo: 'estuve', tu: 'estuviste', el: 'estuvo', nosotros: 'estuvimos', vosotros: 'estuvisteis', ellos: 'estuvieron' },
      imperfecto: { yo: 'estaba', tu: 'estabas', el: 'estaba', nosotros: 'estábamos', vosotros: 'estabais', ellos: 'estaban' },
      futuro: { yo: 'estaré', tu: 'estarás', el: 'estará', nosotros: 'estaremos', vosotros: 'estaréis', ellos: 'estarán' },
      subjuntivo: { yo: 'esté', tu: 'estés', el: 'esté', nosotros: 'estemos', vosotros: 'estéis', ellos: 'estén' },
    },
  },
  {
    infinitive: 'tener',
    english: 'to have (possession, age, sensations like hunger/cold)',
    type: 'irregular',
    hint: 'Present has -go in yo (tengo) and e->ie (tienes). Preterite stem is tuv-!',
    tenses: {
      presente: { yo: 'tengo', tu: 'tienes', el: 'tiene', nosotros: 'tenemos', vosotros: 'tenéis', ellos: 'tienen' },
      preterito: { yo: 'tuve', tu: 'tuviste', el: 'tuvo', nosotros: 'tuvimos', vosotros: 'tuvisteis', ellos: 'tuvieron' },
      imperfecto: { yo: 'tenía', tu: 'tenías', el: 'tenía', nosotros: 'teníamos', vosotros: 'teníais', ellos: 'tenían' },
      futuro: { yo: 'tendré', tu: 'tendrás', el: 'tendrá', nosotros: 'tendremos', vosotros: 'tendréis', ellos: 'tendrán' },
      subjuntivo: { yo: 'tenga', tu: 'tengas', el: 'tenga', nosotros: 'tengamos', vosotros: 'tengáis', ellos: 'tengan' },
    },
  },
  {
    infinitive: 'ir',
    english: 'to go',
    type: 'irregular',
    hint: 'Shares the exact same preterite forms as ser (fui, fuiste, fue...)!',
    tenses: {
      presente: { yo: 'voy', tu: 'vas', el: 'va', nosotros: 'vamos', vosotros: 'vais', ellos: 'van' },
      preterito: { yo: 'fui', tu: 'fuiste', el: 'fue', nosotros: 'fuimos', vosotros: 'fuisteis', ellos: 'fueron' },
      imperfecto: { yo: 'iba', tu: 'ibas', el: 'iba', nosotros: 'íbamos', vosotros: 'ibais', ellos: 'iban' },
      futuro: { yo: 'iré', tu: 'irás', el: 'irá', nosotros: 'iremos', vosotros: 'iréis', ellos: 'irán' },
      subjuntivo: { yo: 'vaya', tu: 'vayas', el: 'vaya', nosotros: 'vayamos', vosotros: 'vayáis', ellos: 'vayan' },
    },
  },
  {
    infinitive: 'hacer',
    english: 'to do / to make (also used for weather: hace frío)',
    type: 'irregular',
    hint: 'Present yo hago. Preterite stem hic- / hiz- (hizo with z for él/ella)!',
    tenses: {
      presente: { yo: 'hago', tu: 'haces', el: 'hace', nosotros: 'hacemos', vosotros: 'hacéis', ellos: 'hacen' },
      preterito: { yo: 'hice', tu: 'hiciste', el: 'hizo', nosotros: 'hicimos', vosotros: 'hicisteis', ellos: 'hicieron' },
      imperfecto: { yo: 'hacía', tu: 'hacías', el: 'hacía', nosotros: 'hacíamos', vosotros: 'hacíais', ellos: 'hacían' },
      futuro: { yo: 'haré', tu: 'harás', el: 'hará', nosotros: 'haremos', vosotros: 'haréis', ellos: 'harán' },
      subjuntivo: { yo: 'haga', tu: 'hagas', el: 'haga', nosotros: 'hagamos', vosotros: 'hagáis', ellos: 'hagan' },
    },
  },
  {
    infinitive: 'poder',
    english: 'to be able / can',
    type: 'stem-changing',
    hint: 'Stem change o->ue in present (puedo). Preterite stem is pud- (pude)!',
    tenses: {
      presente: { yo: 'puedo', tu: 'puedes', el: 'puede', nosotros: 'podemos', vosotros: 'podéis', ellos: 'pueden' },
      preterito: { yo: 'pude', tu: 'pudiste', el: 'pudo', nosotros: 'pudimos', vosotros: 'pudisteis', ellos: 'pudieron' },
      imperfecto: { yo: 'podía', tu: 'podías', el: 'podía', nosotros: 'podíamos', vosotros: 'podíais', ellos: 'podían' },
      futuro: { yo: 'podré', tu: 'podrás', el: 'podrá', nosotros: 'podremos', vosotros: 'podréis', ellos: 'podrán' },
      subjuntivo: { yo: 'pueda', tu: 'puedas', el: 'pueda', nosotros: 'podamos', vosotros: 'podáis', ellos: 'puedan' },
    },
  },
  {
    infinitive: 'decir',
    english: 'to say / to tell',
    type: 'irregular',
    hint: 'Yo digo, tú dices. Preterite stem dij- (dije, dijo, dijeron)!',
    tenses: {
      presente: { yo: 'digo', tu: 'dices', el: 'dice', nosotros: 'decimos', vosotros: 'decís', ellos: 'dicen' },
      preterito: { yo: 'dije', tu: 'dijiste', el: 'dijo', nosotros: 'dijimos', vosotros: 'dijisteis', ellos: 'dijeron' },
      imperfecto: { yo: 'decía', tu: 'decías', el: 'decía', nosotros: 'decíamos', vosotros: 'decíais', ellos: 'decían' },
      futuro: { yo: 'diré', tu: 'dirás', el: 'dirá', nosotros: 'diremos', vosotros: 'diréis', ellos: 'dirán' },
      subjuntivo: { yo: 'diga', tu: 'digas', el: 'diga', nosotros: 'digamos', vosotros: 'digáis', ellos: 'digan' },
    },
  },
  {
    infinitive: 'ver',
    english: 'to see / to watch (e.g. series, TV)',
    type: 'irregular',
    hint: 'Short forms without accents in preterite: vi, viste, vio...',
    tenses: {
      presente: { yo: 'veo', tu: 'ves', el: 've', nosotros: 'vemos', vosotros: 'veis', ellos: 'ven' },
      preterito: { yo: 'vi', tu: 'viste', el: 'vio', nosotros: 'vimos', vosotros: 'visteis', ellos: 'vieron' },
      imperfecto: { yo: 'veía', tu: 'veías', el: 'veía', nosotros: 'veíamos', vosotros: 'veíais', ellos: 'veían' },
      futuro: { yo: 'veré', tu: 'verás', el: 'verá', nosotros: 'veremos', vosotros: 'veréis', ellos: 'verán' },
      subjuntivo: { yo: 'vea', tu: 'veas', el: 'vea', nosotros: 'veamos', vosotros: 'veáis', ellos: 'vean' },
    },
  },
  {
    infinitive: 'saber',
    english: 'to know (facts, information, how to do something)',
    type: 'irregular',
    hint: 'Present yo sé. Preterite stem sup- (supe, supo = found out)!',
    tenses: {
      presente: { yo: 'sé', tu: 'sabes', el: 'sabe', nosotros: 'sabemos', vosotros: 'sabéis', ellos: 'saben' },
      preterito: { yo: 'supe', tu: 'supiste', el: 'supo', nosotros: 'supimos', vosotros: 'supisteis', ellos: 'supieron' },
      imperfecto: { yo: 'sabía', tu: 'sabías', el: 'sabía', nosotros: 'sabíamos', vosotros: 'sabíais', ellos: 'sabían' },
      futuro: { yo: 'sabré', tu: 'sabrás', el: 'sabrá', nosotros: 'sabremos', vosotros: 'sabréis', ellos: 'sabrán' },
      subjuntivo: { yo: 'sepa', tu: 'sepas', el: 'sepa', nosotros: 'sepamos', vosotros: 'sepáis', ellos: 'sepan' },
    },
  },
  {
    infinitive: 'poner',
    english: 'to put / to place / to set',
    type: 'irregular',
    hint: 'Present yo pongo. Preterite stem pus- (puse, puso)!',
    tenses: {
      presente: { yo: 'pongo', tu: 'pones', el: 'pone', nosotros: 'ponemos', vosotros: 'ponéis', ellos: 'ponen' },
      preterito: { yo: 'puse', tu: 'pusiste', el: 'puso', nosotros: 'pusimos', vosotros: 'pusisteis', ellos: 'pusieron' },
      imperfecto: { yo: 'ponía', tu: 'ponías', el: 'ponía', nosotros: 'poníamos', vosotros: 'poníais', ellos: 'ponían' },
      futuro: { yo: 'pondré', tu: 'pondrás', el: 'pondrá', nosotros: 'pondremos', vosotros: 'pondréis', ellos: 'pondrán' },
      subjuntivo: { yo: 'ponga', tu: 'pongas', el: 'ponga', nosotros: 'pongamos', vosotros: 'pongáis', ellos: 'pongan' },
    },
  },
  {
    infinitive: 'querer',
    english: 'to want / to love',
    type: 'stem-changing',
    hint: 'Present e->ie (quiero). Preterite stem quis- (quise, quiso)!',
    tenses: {
      presente: { yo: 'quiero', tu: 'quieres', el: 'quiere', nosotros: 'queremos', vosotros: 'queréis', ellos: 'quieren' },
      preterito: { yo: 'quise', tu: 'quisiste', el: 'quiso', nosotros: 'quisimos', vosotros: 'quisisteis', ellos: 'quisieron' },
      imperfecto: { yo: 'quería', tu: 'querías', el: 'quería', nosotros: 'queríamos', vosotros: 'queríais', ellos: 'querían' },
      futuro: { yo: 'querré', tu: 'querrás', el: 'querrá', nosotros: 'querremos', vosotros: 'querréis', ellos: 'querrán' },
      subjuntivo: { yo: 'quiera', tu: 'quieras', el: 'quiera', nosotros: 'queramos', vosotros: 'queráis', ellos: 'quieran' },
    },
  },
  {
    infinitive: 'venir',
    english: 'to come / arrive',
    type: 'irregular',
    hint: 'Present yo vengo, tú vienes. Preterite stem vin- (vine, vino)!',
    tenses: {
      presente: { yo: 'vengo', tu: 'vienes', el: 'viene', nosotros: 'venimos', vosotros: 'venís', ellos: 'vienen' },
      preterito: { yo: 'vine', tu: 'viniste', el: 'vino', nosotros: 'vinimos', vosotros: 'vinisteis', ellos: 'vinieron' },
      imperfecto: { yo: 'venía', tu: 'venías', el: 'venía', nosotros: 'veníamos', vosotros: 'veníais', ellos: 'venían' },
      futuro: { yo: 'vendré', tu: 'vendrás', el: 'vendrá', nosotros: 'vendremos', vosotros: 'vendréis', ellos: 'vendrán' },
      subjuntivo: { yo: 'venga', tu: 'vengas', el: 'venga', nosotros: 'vengamos', vosotros: 'vengáis', ellos: 'vengan' },
    },
  },
  {
    infinitive: 'dar',
    english: 'to give',
    type: 'irregular',
    hint: 'Short preterite without written accents: di, diste, dio, dimos...',
    tenses: {
      presente: { yo: 'doy', tu: 'das', el: 'da', nosotros: 'damos', vosotros: 'dais', ellos: 'dan' },
      preterito: { yo: 'di', tu: 'diste', el: 'dio', nosotros: 'dimos', vosotros: 'disteis', ellos: 'dieron' },
      imperfecto: { yo: 'daba', tu: 'dabas', el: 'daba', nosotros: 'dábamos', vosotros: 'dabais', ellos: 'daban' },
      futuro: { yo: 'daré', tu: 'darás', el: 'dará', nosotros: 'daremos', vosotros: 'daréis', ellos: 'darán' },
      subjuntivo: { yo: 'dé', tu: 'des', el: 'dé', nosotros: 'demos', vosotros: 'deis', ellos: 'den' },
    },
  },
  {
    infinitive: 'hablar',
    english: 'to speak / to talk (prototype regular -AR verb)',
    type: 'regular-ar',
    hint: 'Master this and you know 80% of Spanish verbs! -o, -as, -a, -amos, -áis, -an',
    tenses: {
      presente: { yo: 'hablo', tu: 'hablas', el: 'habla', nosotros: 'hablamos', vosotros: 'habláis', ellos: 'hablan' },
      preterito: { yo: 'hablé', tu: 'hablaste', el: 'habló', nosotros: 'hablamos', vosotros: 'hablasteis', ellos: 'hablaron' },
      imperfecto: { yo: 'hablaba', tu: 'hablabas', el: 'hablaba', nosotros: 'hablábamos', vosotros: 'hablabais', ellos: 'hablaban' },
      futuro: { yo: 'hablaré', tu: 'hablarás', el: 'hablará', nosotros: 'hablaremos', vosotros: 'hablaréis', ellos: 'hablarán' },
      subjuntivo: { yo: 'hable', tu: 'hables', el: 'hable', nosotros: 'hablemos', vosotros: 'habléis', ellos: 'hablen' },
    },
  },
  {
    infinitive: 'comer',
    english: 'to eat (prototype regular -ER verb)',
    type: 'regular-er',
    hint: 'Standard -er pattern: -o, -es, -e, -emos, -éis, -en. Preterite has -í, -iste, -ió...',
    tenses: {
      presente: { yo: 'como', tu: 'comes', el: 'come', nosotros: 'comemos', vosotros: 'coméis', ellos: 'comen' },
      preterito: { yo: 'comí', tu: 'comiste', el: 'comió', nosotros: 'comimos', vosotros: 'comisteis', ellos: 'comieron' },
      imperfecto: { yo: 'comía', tu: 'comías', el: 'comía', nosotros: 'comíamos', vosotros: 'comíais', ellos: 'comían' },
      futuro: { yo: 'comeré', tu: 'comerás', el: 'comerá', nosotros: 'comeremos', vosotros: 'comeréis', ellos: 'comerán' },
      subjuntivo: { yo: 'coma', tu: 'comas', el: 'coma', nosotros: 'comamos', vosotros: 'comáis', ellos: 'coman' },
    },
  },
  {
    infinitive: 'vivir',
    english: 'to live (prototype regular -IR verb)',
    type: 'regular-ir',
    hint: 'Almost identical to -er verbs, except nosotros vivimos, vosotros vivís.',
    tenses: {
      presente: { yo: 'vivo', tu: 'vives', el: 'vive', nosotros: 'vivimos', vosotros: 'vivís', ellos: 'viven' },
      preterito: { yo: 'viví', tu: 'viviste', el: 'vivió', nosotros: 'vivimos', vosotros: 'vivisteis', ellos: 'vivieron' },
      imperfecto: { yo: 'vivía', tu: 'vivías', el: 'vivía', nosotros: 'vivíamos', vosotros: 'vivíais', ellos: 'vivían' },
      futuro: { yo: 'viviré', tu: 'vivirás', el: 'vivirá', nosotros: 'viviremos', vosotros: 'viviréis', ellos: 'vivirán' },
      subjuntivo: { yo: 'viva', tu: 'vivas', el: 'viva', nosotros: 'vivamos', vosotros: 'viváis', ellos: 'vivan' },
    },
  },
  {
    infinitive: 'pensar',
    english: 'to think (boot verb: e -> ie)',
    type: 'stem-changing',
    hint: 'Changes e->ie in the boot (yo, tú, él, ellos). Nosotros/vosotros stay normal (pensamos)!',
    tenses: {
      presente: { yo: 'pienso', tu: 'piensas', el: 'piensa', nosotros: 'pensamos', vosotros: 'pensáis', ellos: 'piensan' },
      preterito: { yo: 'pensé', tu: 'pensaste', el: 'pensó', nosotros: 'pensamos', vosotros: 'pensasteis', ellos: 'pensaron' },
      imperfecto: { yo: 'pensaba', tu: 'pensabas', el: 'pensaba', nosotros: 'pensábamos', vosotros: 'pensabais', ellos: 'pensaban' },
      futuro: { yo: 'pensaré', tu: 'pensarás', el: 'pensará', nosotros: 'pensaremos', vosotros: 'pensaréis', ellos: 'pensarán' },
      subjuntivo: { yo: 'piense', tu: 'pienses', el: 'piense', nosotros: 'pensemos', vosotros: 'penséis', ellos: 'piensen' },
    },
  },
  {
    infinitive: 'dormir',
    english: 'to sleep (boot verb: o -> ue)',
    type: 'stem-changing',
    hint: 'Changes o->ue in present (duermo). In preterite él durmió, ellos durmieron!',
    tenses: {
      presente: { yo: 'duermo', tu: 'duermes', el: 'duerme', nosotros: 'dormimos', vosotros: 'dormís', ellos: 'duermen' },
      preterito: { yo: 'dormí', tu: 'dormiste', el: 'durmió', nosotros: 'dormimos', vosotros: 'dormisteis', ellos: 'durmieron' },
      imperfecto: { yo: 'dormía', tu: 'dormías', el: 'dormía', nosotros: 'dormíamos', vosotros: 'dormíais', ellos: 'dormían' },
      futuro: { yo: 'dormiré', tu: 'dormirás', el: 'dormirá', nosotros: 'dormiremos', vosotros: 'dormiréis', ellos: 'dormirán' },
      subjuntivo: { yo: 'duerma', tu: 'duermas', el: 'duerma', nosotros: 'durmamos', vosotros: 'durmáis', ellos: 'duerman' },
    },
  },
];

export const CONJUGATION_LEVELS: ConjugationLevel[] = [
  {
    id: 1,
    titleEn: 'Level 1: The Absolute First Steps',
    titleEs: 'Nivel 1: Los Primeros Pasos',
    subtitleEn: 'Present Tense of Ser (to be), Estar (to be) & Hablar (regular -AR)',
    subtitleEs: 'Presente de Ser, Estar y Hablar (-AR regular)',
    verbs: ['ser', 'estar', 'hablar'],
    tenses: ['presente'],
    conceptIntroEn:
      'In Spanish, verb endings change to tell you WHO is doing the action. Because the ending shows the person, Spanish speakers usually drop the pronoun (yo, tú). "Hablo" already means "I speak"! Notice how regular -AR verbs end in -o, -as, -a, -amos, -áis, -an.',
    conceptIntroEs:
      'En español, la terminación del verbo indica QUIÉN hace la acción. Por eso los pronombres (yo, tú) no son obligatorios. "Hablo" ya significa "yo hablo".',
    tipEn: 'Remember: "Ser" is who you are; "Estar" is how you feel or where you are right now.',
    tipEs: 'Recuerda: "Ser" para identidad/origen; "Estar" para estado o lugar.',
  },
  {
    id: 2,
    titleEn: 'Level 2: Everyday Survival Trio',
    titleEs: 'Nivel 2: Trío de Supervivencia',
    subtitleEn: 'Present Tense of Tener (to have), Ir (to go) & Comer (regular -ER)',
    subtitleEs: 'Presente de Tener, Ir y Comer (-ER regular)',
    verbs: ['tener', 'ir', 'comer'],
    tenses: ['presente'],
    conceptIntroEn:
      'These three verbs appear in almost every daily conversation. "Comer" shows the blueprint for all regular -ER verbs (-o, -es, -e, -emos, -éis, -en). "Tener" has the common -go ending for Yo (tengo) and e->ie (tienes). "Ir" is completely unique (voy, vas, va).',
    conceptIntroEs:
      'Tres verbos indispensables. "Comer" es el modelo para todos los verbos en -ER. "Tener" y "Ir" son pilares cotidianos.',
    tipEn: 'In Spanish, you don\'t "be" 25 years old or hungry; you "have" them: "Tengo 25 años", "Tengo hambre"!',
    tipEs: 'En español decimos "tengo hambre" y "tengo 25 años" usando el verbo tener.',
  },
  {
    id: 3,
    titleEn: 'Level 3: Core Action Verbs',
    titleEs: 'Nivel 3: Acciones Fundamentales',
    subtitleEn: 'Present Tense of Hacer (to do/make), Poder (can) & Vivir (regular -IR)',
    subtitleEs: 'Presente de Hacer, Poder y Vivir (-IR regular)',
    verbs: ['hacer', 'poder', 'vivir'],
    tenses: ['presente'],
    conceptIntroEn:
      '"Vivir" shows how regular -IR verbs conjugate: almost identical to -ER verbs, except "nosotros vivimos" and "vosotros vivís". "Hacer" has the special Yo form "hago". "Poder" (can / to be able) changes o->ue in the stem (puedo, puedes, puede).',
    conceptIntroEs:
      '"Vivir" enseña el patrón regular de los verbos en -IR. "Hacer" tiene la forma especial "hago". "Poder" cambia la raíz a ue.',
    tipEn: '"Hacer" is also used for weather: "Hace frío" (It is cold), "Hace sol" (It is sunny)!',
    tipEs: '"Hacer" se usa también para el tiempo: "Hace calor", "Hace buen tiempo".',
  },
  {
    id: 4,
    titleEn: 'Level 4: Conversational Desires & Words',
    titleEs: 'Nivel 4: Deseos y Expresión Cotidiana',
    subtitleEn: 'Present Tense of Querer (to want/love), Decir (to say) & Ver (to see)',
    subtitleEs: 'Presente de Querer, Decir y Ver',
    verbs: ['querer', 'decir', 'ver'],
    tenses: ['presente'],
    conceptIntroEn:
      'Now you can express what you want ("Quiero café"), what you say ("Digo la verdad"), and what you see ("Veo una serie"). "Querer" changes e->ie (quiero). "Decir" has a -go form (digo) and changes e->i (dices, dice).',
    conceptIntroEs:
      'Aprende a expresar deseos con "querer" (quiero), palabras con "decir" (digo) y percepciones con "ver" (veo).',
    tipEn: '"Querer" means both "to want" (quiero un café) and "to love" a friend or partner (te quiero)!',
    tipEs: '"Te quiero" es una de las expresiones de cariño más naturales del español.',
  },
  {
    id: 5,
    titleEn: 'Level 5: Boot Verbs (Stem-Changers)',
    titleEs: 'Nivel 5: Verbos con Cambio de Raíz (La Bota)',
    subtitleEn: 'Present Tense of Pensar (e -> ie) & Dormir (o -> ue)',
    subtitleEs: 'Presente de Pensar (e -> ie) y Dormir (o -> ue)',
    verbs: ['pensar', 'dormir'],
    tenses: ['presente'],
    conceptIntroEn:
      'Spanish teachers call these "Boot Verbs" because if you look at a conjugation table, the forms that change vowel (yo, tú, él, ellos) look like a boot! Notice that "Nosotros" (pensamos, dormimos) and "Vosotros" (pensáis, dormís) stay outside the boot and keep their original vowel.',
    conceptIntroEs:
      'Se llaman verbos de bota porque el cambio vocálico solo ocurre en yo, tú, él y ellos. Nosotros y vosotros se mantienen regulares.',
    tipEn: 'Nosotros and Vosotros NEVER change stem in the present tense: pensamos, dormimos.',
    tipEs: 'Nosotros y vosotros nunca cambian la vocal en presente.',
  },
  {
    id: 6,
    titleEn: 'Level 6: The Storyteller Past (Preterite)',
    titleEs: 'Nivel 6: El Pasado Narrativo (Pretérito)',
    subtitleEn: 'Regular Preterite of Hablar, Comer & Vivir',
    subtitleEs: 'Pretérito regular de Hablar, Comer y Vivir',
    verbs: ['hablar', 'comer', 'vivir'],
    tenses: ['preterito'],
    conceptIntroEn:
      'The preterite is used to describe completed actions that happened at a specific moment in time (e.g. "Ayer hablé con mi amiga", "Anoche comí paella"). Notice the big win: regular -ER and -IR verbs share the EXACT SAME endings in the past (-í, -iste, -ió, -imos, -isteis, -ieron)!',
    conceptIntroEs:
      'El pretérito indefinido relata acciones puntuales y terminadas en el pasado. Los verbos en -ER e -IR comparten exactamente las mismas terminaciones.',
    tipEn: 'The written accent on "hablé" and "habló" is essential; "hablo" is present (I speak), while "habló" is past (he/she spoke)!',
    tipEs: 'El acento es clave: "hablo" (presente yo) frente a "habló" (pasado él).',
  },
  {
    id: 7,
    titleEn: 'Level 7: The Twin Past Twins (Ser & Ir)',
    titleEs: 'Nivel 7: Los Gemelos del Pasado (Ser e Ir)',
    subtitleEn: 'Preterite of Ser (to be) & Ir (to go) — identical forms!',
    subtitleEs: 'Pretérito de Ser e Ir — ¡formas idénticas!',
    verbs: ['ser', 'ir'],
    tenses: ['preterito'],
    conceptIntroEn:
      'One of the most famous quirks of Spanish: "Ser" (to be) and "Ir" (to go) share the EXACT SAME past tense forms! "Fui a España" (I went to Spain); "Fue una fiesta increíble" (It was an incredible party). Context makes it 100% obvious which one is meant.',
    conceptIntroEs:
      'Curiosidad fascinante: "Ser" e "Ir" tienen exactamente la misma conjugación en el pretérito indefinido: fui, fuiste, fue...',
    tipEn: 'If followed by "a" (to a place), it is almost always "Ir" (to go): "Fui a la playa" = I went to the beach.',
    tipEs: 'Si va seguido de la preposición "a", proviene de "ir": "Fui al cine".',
  },
  {
    id: 8,
    titleEn: 'Level 8: Tricky Past Stems',
    titleEs: 'Nivel 8: Raíces Irregulares del Pasado',
    subtitleEn: 'Preterite Stems of Estar (estuv-), Tener (tuv-) & Hacer (hic-/hiz-)',
    subtitleEs: 'Pretérito de Estar (estuv-), Tener (tuv-) y Hacer (hic-/hiz-)',
    verbs: ['estar', 'tener', 'hacer'],
    tenses: ['preterito'],
    conceptIntroEn:
      'These three super-common verbs have special irregular stems in the preterite: Estar becomes "estuv-", Tener becomes "tuv-", and Hacer becomes "hic-" (with "hizo" for él/ella). These irregular preterite stems do NOT take any written accents!',
    conceptIntroEs:
      'Verbos con raíz irregular en pasado: estuv-, tuv-, hic-. Un detalle vital: ¡estas formas irregulares no llevan tilde!',
    tipEn: 'Notice the rhythm: estuve, estuviste, estuvo / tuve, tuviste, tuvo / hice, hiciste, hizo. No accents needed!',
    tipEs: 'Siguen el mismo ritmo sin tildes: estuve/estuvo, tuve/tuvo, hice/hizo.',
  },
];


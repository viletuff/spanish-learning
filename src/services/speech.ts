class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private spanishVoice: SpeechSynthesisVoice | null = null;
  private isSpeaking = false;
  private listeners: Set<(speaking: boolean, currentText?: string) => void> = new Set();
  private currentText = '';

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prioritize Spain Spanish, then any Spanish voice
    const esES = voices.find(v => v.lang === 'es-ES');
    const anyEs = voices.find(v => v.lang.startsWith('es'));
    this.spanishVoice = esES || anyEs || null;
  }

  public getAvailableSpanishVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices().filter(v => v.lang.startsWith('es'));
  }

  public setVoice(voice: SpeechSynthesisVoice) {
    this.spanishVoice = voice;
  }

  public subscribe(listener: (speaking: boolean, currentText?: string) => void): () => void {
    this.listeners.add(listener);
    listener(this.isSpeaking, this.currentText);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => fn(this.isSpeaking, this.currentText));
  }

  public speak(text: string, rate: number = 0.88): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        console.warn('SpeechSynthesis is not supported in this browser.');
        resolve();
        return;
      }

      this.stop();

      // Clean markdown tags or bullets
      const cleaned = text
        .replace(/[*_#`~[\]()]/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .trim();

      if (!cleaned) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.rate = rate;
      utterance.pitch = 1.0;
      utterance.lang = this.spanishVoice?.lang || 'es-ES';
      if (this.spanishVoice) {
        utterance.voice = this.spanishVoice;
      }

      this.isSpeaking = true;
      this.currentText = cleaned;
      this.notify();

      utterance.onend = () => {
        this.isSpeaking = false;
        this.currentText = '';
        this.notify();
        resolve();
      };

      utterance.onerror = (e) => {
        console.error('Speech synthesis error:', e);
        this.isSpeaking = false;
        this.currentText = '';
        this.notify();
        resolve();
      };

      this.synth.speak(utterance);
    });
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.currentText = '';
      this.notify();
    }
  }

  public getStatus() {
    return {
      isSupported: Boolean(this.synth),
      isSpeaking: this.isSpeaking,
      currentText: this.currentText,
      activeVoice: this.spanishVoice?.name || 'Default Spanish',
    };
  }
}

export const speechService = new SpeechService();

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://fksplhordovnlqwpiyle.supabase.co';
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_HykfNFnM7fSr2kMIdlgq2g_oY0qQE9G';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

type SyncListener = (status: SyncStatus) => void;
type DataChangeListener = (key: string, data: any) => void;

class SyncManager {
  private status: SyncStatus = 'idle';
  private listeners: Set<SyncListener> = new Set();
  private dataListeners: Set<DataChangeListener> = new Set();
  private debounceTimers: Map<string, number> = new Map();

  getStatus(): SyncStatus {
    return this.status;
  }

  private setStatus(newStatus: SyncStatus) {
    this.status = newStatus;
    this.listeners.forEach((l) => l(newStatus));
  }

  subscribeStatus(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.status);
    return () => this.listeners.delete(listener);
  }

  subscribeData(listener: DataChangeListener): () => void {
    this.dataListeners.add(listener);
    return () => this.dataListeners.delete(listener);
  }

  private notifyDataChange(key: string, data: any) {
    this.dataListeners.forEach((l) => l(key, data));
  }

  /**
   * Save a key/value payload to Supabase user_settings asynchronously
   */
  queueSave(key: string, value: any, delayMs = 600) {
    const existingTimer = this.debounceTimers.get(key);
    if (existingTimer) {
      window.clearTimeout(existingTimer);
    }

    const timer = window.setTimeout(async () => {
      this.debounceTimers.delete(key);
      await this.saveToCloud(key, value);
    }, delayMs);

    this.debounceTimers.set(key, timer);
  }

  private async saveToCloud(key: string, value: any) {
    if (!navigator.onLine) {
      this.setStatus('offline');
      return;
    }

    try {
      this.setStatus('syncing');
      const { error } = await supabase.from('user_settings').upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.warn(`[SyncManager] Supabase upsert error for ${key}:`, error);
        this.setStatus('error');
      } else {
        this.setStatus('synced');
      }
    } catch (err) {
      console.warn(`[SyncManager] Cloud sync failed for ${key}:`, err);
      this.setStatus('error');
    }
  }

  /**
   * Fetch all cloud records and merge into local state
   */
  async pullAllFromCloud(): Promise<boolean> {
    if (!navigator.onLine) {
      this.setStatus('offline');
      return false;
    }

    try {
      this.setStatus('syncing');
      const { data, error } = await supabase.from('user_settings').select('*');

      if (error) {
        console.warn('[SyncManager] Failed to fetch settings from cloud:', error);
        this.setStatus('error');
        return false;
      }

      if (data && Array.isArray(data)) {
        for (const record of data) {
          if (record.key && record.value !== undefined) {
            try {
              // Write to localStorage
              const serialized =
                typeof record.value === 'string'
                  ? record.value
                  : JSON.stringify(record.value);
              localStorage.setItem(record.key, serialized);
              this.notifyDataChange(record.key, record.value);
            } catch (storageErr) {
              console.warn('[SyncManager] Failed to cache key locally:', record.key, storageErr);
            }
          }
        }
      }

      this.setStatus('synced');
      return true;
    } catch (err) {
      console.warn('[SyncManager] pullAllFromCloud error:', err);
      this.setStatus('error');
      return false;
    }
  }

  /**
   * Force push all current localStorage keys to Supabase (useful on first cloud migration)
   */
  async pushAllToCloud(): Promise<boolean> {
    if (!navigator.onLine) return false;

    try {
      this.setStatus('syncing');
      const keysToSync = [
        'chispas_srs_cards_v1',
        'chispas_journal_v1',
        'chispas_progress_v1',
        'chispas_vocab_v1',
        'chispas_conj_level_v1',
        'chispas_conj_tables_v1',
        'chispas_mastered_1000_v1',
        'chispas_grammar_prog_v1',
        'chispas_word_states_1000_v1',
        'chispas_prefs_v1',
      ];

      for (const k of keysToSync) {
        const raw = localStorage.getItem(k);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            await supabase.from('user_settings').upsert({
              key: k,
              value: parsed,
              updated_at: new Date().toISOString(),
            });
          } catch {
            await supabase.from('user_settings').upsert({
              key: k,
              value: raw,
              updated_at: new Date().toISOString(),
            });
          }
        }
      }

      this.setStatus('synced');
      return true;
    } catch (err) {
      console.warn('[SyncManager] pushAllToCloud failed:', err);
      this.setStatus('error');
      return false;
    }
  }
}

export const syncManager = new SyncManager();

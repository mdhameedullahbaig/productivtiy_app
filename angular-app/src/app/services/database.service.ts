import { Injectable } from '@angular/core';
import { CalendarEvent, Reminder, DailyStats, Quote } from '../models/productivity.models';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private readonly DB_NAME = 'chronos_productivity_db';
  private readonly DB_VERSION = 1;
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    this.initDatabase();
  }

  /**
   * Initializes or opens the IndexedDB database instance with stores and indexes
   */
  private initDatabase(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not available in this environment'));
        return;
      }

      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 1. Events Object Store
        if (!db.objectStoreNames.contains('events')) {
          const eventStore = db.createObjectStore('events', { keyPath: 'id' });
          eventStore.createIndex('startDate', 'startDate', { unique: false });
          eventStore.createIndex('category', 'category', { unique: false });
        }

        // 2. Reminders Object Store
        if (!db.objectStoreNames.contains('reminders')) {
          const reminderStore = db.createObjectStore('reminders', { keyPath: 'id' });
          reminderStore.createIndex('dueDate', 'dueDate', { unique: false });
          reminderStore.createIndex('completed', 'completed', { unique: false });
          reminderStore.createIndex('priority', 'priority', { unique: false });
        }

        // 3. Daily Stats Store
        if (!db.objectStoreNames.contains('daily_stats')) {
          db.createObjectStore('daily_stats', { keyPath: 'lastActiveDate' });
        }

        // 4. Quotes Store
        if (!db.objectStoreNames.contains('quotes')) {
          const quoteStore = db.createObjectStore('quotes', { keyPath: 'id' });
          quoteStore.createIndex('category', 'category', { unique: false });
          quoteStore.createIndex('favorite', 'favorite', { unique: false });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  // --- EVENTS DB OPERATIONS ---

  async getAllEvents(): Promise<CalendarEvent[]> {
    try {
      const db = await this.initDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('events', 'readonly');
        const store = tx.objectStore('events');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return [];
    }
  }

  async saveEvent(event: CalendarEvent): Promise<CalendarEvent> {
    const db = await this.initDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('events', 'readwrite');
      const store = tx.objectStore('events');
      const req = store.put(event);
      req.onsuccess = () => resolve(event);
      req.onerror = () => reject(req.error);
    });
  }

  async saveMultipleEvents(events: CalendarEvent[]): Promise<void> {
    if (!events || events.length === 0) return;
    const db = await this.initDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('events', 'readwrite');
      const store = tx.objectStore('events');
      for (const evt of events) {
        store.put(evt);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async deleteEvent(id: string): Promise<void> {
    const db = await this.initDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('events', 'readwrite');
      const store = tx.objectStore('events');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async deleteMultipleEvents(ids: string[]): Promise<void> {
    if (!ids || ids.length === 0) return;
    const db = await this.initDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('events', 'readwrite');
      const store = tx.objectStore('events');
      for (const id of ids) {
        store.delete(id);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // --- REMINDERS DB OPERATIONS ---

  async getAllReminders(): Promise<Reminder[]> {
    try {
      const db = await this.initDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('reminders', 'readonly');
        const store = tx.objectStore('reminders');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return [];
    }
  }

  async saveReminder(reminder: Reminder): Promise<Reminder> {
    const db = await this.initDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('reminders', 'readwrite');
      const store = tx.objectStore('reminders');
      const req = store.put(reminder);
      req.onsuccess = () => resolve(reminder);
      req.onerror = () => reject(req.error);
    });
  }

  async deleteReminder(id: string): Promise<void> {
    const db = await this.initDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('reminders', 'readwrite');
      const store = tx.objectStore('reminders');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- DAILY STATS DB OPERATIONS ---

  async getDailyStats(dateStr: string): Promise<DailyStats | null> {
    try {
      const db = await this.initDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('daily_stats', 'readonly');
        const store = tx.objectStore('daily_stats');
        const req = store.get(dateStr);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return null;
    }
  }

  async saveDailyStats(stats: DailyStats): Promise<void> {
    const db = await this.initDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('daily_stats', 'readwrite');
      const store = tx.objectStore('daily_stats');
      const req = store.put(stats);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- QUOTES DB OPERATIONS ---

  async getAllQuotes(): Promise<Quote[]> {
    try {
      const db = await this.initDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('quotes', 'readonly');
        const store = tx.objectStore('quotes');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return [];
    }
  }

  async saveQuote(quote: Quote): Promise<Quote> {
    const db = await this.initDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('quotes', 'readwrite');
      const store = tx.objectStore('quotes');
      const req = store.put(quote);
      req.onsuccess = () => resolve(quote);
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Syncs with remote REST / MySQL backend (e.g., http://localhost:8080/api) if available
   */
  async syncWithBackend(backendUrl = 'http://localhost:8080/api'): Promise<{ synced: boolean; error?: string }> {
    try {
      const response = await fetch(`${backendUrl}/events`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const remoteEvents = await response.json();
        for (const evt of remoteEvents) {
          await this.saveEvent(evt);
        }
        return { synced: true };
      }
      return { synced: false, error: `Backend responded with HTTP ${response.status}` };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return { synced: false, error: errorMessage };
    }
  }
}

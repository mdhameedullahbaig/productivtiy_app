import { Injectable, signal, computed } from '@angular/core';
import { CalendarEvent, Reminder, DailyStats, Quote, ViewTab } from '../models/productivity.models';

const INITIAL_QUOTES: Quote[] = [
  {
    id: 'q-1',
    text: 'You do not rise to the level of your goals. You fall to the level of your systems.',
    author: 'James Clear',
    category: 'Habits',
    reflectionPrompt: 'What system in your day needs a minor tweak to make good work effortless?'
  },
  {
    id: 'q-2',
    text: 'It is not that we have a short time to live, but that we waste a lot of it.',
    author: 'Seneca',
    category: 'Clarity',
    reflectionPrompt: 'Which activity today is consuming your finite attention without giving you value?'
  },
  {
    id: 'q-3',
    text: 'Focus is a matter of deciding what things you are NOT going to do.',
    author: 'John Carmack',
    category: 'Focus',
    reflectionPrompt: 'What is one task you can deliberately choose to ignore or delete today?'
  },
  {
    id: 'q-4',
    text: 'Deep work is the ability to focus without distraction on a cognitively demanding task.',
    author: 'Cal Newport',
    category: 'Focus',
    reflectionPrompt: 'Protect your next block of time like a sacred reservation.'
  },
  {
    id: 'q-5',
    text: 'Discipline equals freedom.',
    author: 'Jocko Willink',
    category: 'Discipline',
    reflectionPrompt: 'Where can a strict routine give you more free mental headspace later?'
  }
];

@Injectable({
  providedIn: 'root'
})
export class ProductivityService {
  private readonly STORAGE_EVENTS = 'chronos_angular_events';
  private readonly STORAGE_REMINDERS = 'chronos_angular_reminders';
  private readonly STORAGE_STATS = 'chronos_angular_stats';
  private readonly STORAGE_QUOTES = 'chronos_angular_quotes';

  // Signals
  events = signal<CalendarEvent[]>(this.loadEvents());
  reminders = signal<Reminder[]>(this.loadReminders());
  stats = signal<DailyStats>(this.loadStats());
  quotes = signal<Quote[]>(this.loadQuotes());
  currentTab = signal<ViewTab>('dashboard');

  // Computed signals
  unreadRemindersCount = computed(() => this.reminders().filter(r => !r.completed).length);
  quoteOfTheDay = computed(() => {
    const qList = this.quotes();
    const today = new Date().toISOString().split('T')[0];
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
      hash = (hash << 5) - hash + today.charCodeAt(i);
      hash |= 0;
    }
    return qList[Math.abs(hash) % qList.length] || INITIAL_QUOTES[0];
  });

  constructor() {}

  // Tab navigation
  setTab(tab: ViewTab) {
    this.currentTab.set(tab);
  }

  // Events management
  addEvent(event: Omit<CalendarEvent, 'id'>) {
    const newEvent: CalendarEvent = { ...event, id: `evt-${Date.now()}` };
    this.events.update(list => [newEvent, ...list]);
    this.saveToStorage(this.STORAGE_EVENTS, this.events());
  }

  deleteEvent(id: string) {
    this.events.update(list => list.filter(e => e.id !== id));
    this.saveToStorage(this.STORAGE_EVENTS, this.events());
  }

  // Reminders management
  addReminder(reminder: Omit<Reminder, 'id'>) {
    const newRem: Reminder = { ...reminder, id: `rem-${Date.now()}` };
    this.reminders.update(list => [newRem, ...list]);
    this.saveToStorage(this.STORAGE_REMINDERS, this.reminders());
  }

  toggleReminder(id: string) {
    this.reminders.update(list =>
      list.map(r => {
        if (r.id === id) {
          const nextCompleted = !r.completed;
          this.stats.update(st => ({
            ...st,
            remindersCompletedToday: nextCompleted ? st.remindersCompletedToday + 1 : Math.max(0, st.remindersCompletedToday - 1)
          }));
          this.saveToStorage(this.STORAGE_STATS, this.stats());
          return {
            ...r,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined
          };
        }
        return r;
      })
    );
    this.saveToStorage(this.STORAGE_REMINDERS, this.reminders());
  }

  deleteReminder(id: string) {
    this.reminders.update(list => list.filter(r => r.id !== id));
    this.saveToStorage(this.STORAGE_REMINDERS, this.reminders());
  }

  snoozeReminder(id: string, minutes: number) {
    this.reminders.update(list =>
      list.map(r => {
        if (r.id === id) {
          if (minutes === 1440) {
            const d = new Date();
            d.setDate(d.getDate() + 1);
            return { ...r, dueDate: d.toISOString().split('T')[0], snoozedUntil: 'Tomorrow' };
          }
          const now = new Date();
          now.setMinutes(now.getMinutes() + minutes);
          const hh = String(now.getHours()).padStart(2, '0');
          const mm = String(now.getMinutes()).padStart(2, '0');
          return { ...r, dueTime: `${hh}:${mm}`, snoozedUntil: `${hh}:${mm}` };
        }
        return r;
      })
    );
    this.saveToStorage(this.STORAGE_REMINDERS, this.reminders());
  }

  // Breaks and Stats
  logBreak(minutes: number) {
    this.stats.update(st => ({
      ...st,
      breaksCompletedToday: st.breaksCompletedToday + 1,
      focusMinutesToday: st.focusMinutesToday + minutes
    }));
    this.saveToStorage(this.STORAGE_STATS, this.stats());
  }

  logHydration() {
    this.stats.update(st => ({ ...st, waterGlasses: st.waterGlasses + 1 }));
    this.saveToStorage(this.STORAGE_STATS, this.stats());
  }

  // Quotes
  toggleFavoriteQuote(id: string) {
    this.quotes.update(list => list.map(q => q.id === id ? { ...q, favorite: !q.favorite } : q));
    this.saveToStorage(this.STORAGE_QUOTES, this.quotes());
  }

  addCustomQuote(quote: Omit<Quote, 'id'>) {
    const newQuote: Quote = { ...quote, id: `q-${Date.now()}` };
    this.quotes.update(list => [newQuote, ...list]);
    this.saveToStorage(this.STORAGE_QUOTES, this.quotes());
  }

  // Private storage loaders
  private loadEvents(): CalendarEvent[] {
    const raw = localStorage.getItem(this.STORAGE_EVENTS);
    if (raw) return JSON.parse(raw);
    const today = new Date().toISOString().split('T')[0];
    return [
      {
        id: 'evt-1',
        title: 'Morning Focus: Architecture & Core Engine',
        description: 'Deep work sprint on service layer and caching mechanisms.',
        startDate: today,
        startTime: '09:00',
        endTime: '11:00',
        category: 'deep-work',
        priority: 'high'
      },
      {
        id: 'evt-2',
        title: 'Sprint Retrospective & Sync',
        startDate: today,
        startTime: '14:00',
        endTime: '14:45',
        category: 'meeting',
        priority: 'medium'
      }
    ];
  }

  private loadReminders(): Reminder[] {
    const raw = localStorage.getItem(this.STORAGE_REMINDERS);
    if (raw) return JSON.parse(raw);
    const today = new Date().toISOString().split('T')[0];
    return [
      {
        id: 'rem-1',
        title: 'Submit quarterly performance self-assessment',
        dueDate: today,
        dueTime: '13:00',
        priority: 'high',
        category: 'work',
        completed: false
      },
      {
        id: 'rem-2',
        title: 'Hydrate and complete 2-minute posture break',
        dueDate: today,
        dueTime: '15:30',
        priority: 'medium',
        category: 'health',
        completed: true
      }
    ];
  }

  private loadStats(): DailyStats {
    const raw = localStorage.getItem(this.STORAGE_STATS);
    if (raw) return JSON.parse(raw);
    return {
      focusMinutesToday: 85,
      breaksCompletedToday: 3,
      remindersCompletedToday: 2,
      waterGlasses: 4,
      currentStreakDays: 6,
      lastActiveDate: new Date().toISOString().split('T')[0]
    };
  }

  private loadQuotes(): Quote[] {
    const raw = localStorage.getItem(this.STORAGE_QUOTES);
    return raw ? JSON.parse(raw) : INITIAL_QUOTES;
  }

  private saveToStorage(key: string, data: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }
  }
}

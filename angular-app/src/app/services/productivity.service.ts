import { Injectable, signal, computed, inject } from '@angular/core';
import { CalendarEvent, Reminder, DailyStats, Quote, ViewTab, FreeTimeSummary, FreeTimeSlot, NextEventInfo } from '../models/productivity.models';
import { DatabaseService } from './database.service';

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
  private db = inject(DatabaseService);

  private readonly STORAGE_EVENTS = 'chronos_angular_events';
  private readonly STORAGE_REMINDERS = 'chronos_angular_reminders';
  private readonly STORAGE_STATS = 'chronos_angular_stats';
  private readonly STORAGE_QUOTES = 'chronos_angular_quotes';

  // Reactive state signals
  events = signal<CalendarEvent[]>(this.loadInitialEvents());
  reminders = signal<Reminder[]>(this.loadInitialReminders());
  stats = signal<DailyStats>(this.loadInitialStats());
  quotes = signal<Quote[]>(this.loadInitialQuotes());
  currentTab = signal<ViewTab>('dashboard');
  isDbConnected = signal<boolean>(true);

  // 5-minute quote rotation state (300 seconds)
  currentQuoteIndex = signal<number>(0);
  quoteRotationSecondsLeft = signal<number>(300);
  private quoteTimerInterval: any = null;

  // Computed signals
  unreadRemindersCount = computed(() => this.reminders().filter(r => !r.completed).length);

  quoteOfTheDay = computed(() => {
    const qList = this.quotes();
    if (!qList || qList.length === 0) return INITIAL_QUOTES[0];
    const idx = Math.abs(this.currentQuoteIndex()) % qList.length;
    return qList[idx] || qList[0];
  });

  quoteCountdownFormatted = computed(() => {
    const totalSecs = this.quoteRotationSecondsLeft();
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  });

  // Live clock & next event tracking
  currentTime = signal<Date>(new Date());
  private clockInterval: any = null;

  // Auto-cleanup past events tracking
  autoCleanupEnabled = signal<boolean>(true);
  totalAutoCleanedEvents = signal<number>(0);
  lastAutoCleanedTimestamp = signal<string>('');

  nextEvent = computed<NextEventInfo | null>(() => {
    return this.computeNextEvent();
  });

  constructor() {
    this.hydrateFromDatabase();
    this.startQuoteRotationTimer();
    this.startClockTimer();
  }

  /**
   * Keep current time reactive for live event countdowns & next event tracking,
   * and automatically purge past elapsed events.
   */
  startClockTimer() {
    if (typeof window === 'undefined') return;
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
    this.clockInterval = setInterval(() => {
      this.currentTime.set(new Date());
      if (this.autoCleanupEnabled()) {
        this.autoRemovePastEvents();
      }
    }, 10000);
  }

  /**
   * Automatically rotates quote every 5 minutes (300 seconds)
   */
  startQuoteRotationTimer() {
    if (typeof window === 'undefined') return;
    if (this.quoteTimerInterval) {
      clearInterval(this.quoteTimerInterval);
    }

    this.quoteTimerInterval = setInterval(() => {
      if (this.quoteRotationSecondsLeft() > 1) {
        this.quoteRotationSecondsLeft.update(s => s - 1);
      } else {
        this.rotateQuote();
      }
    }, 1000);
  }

  /**
   * Rotates to the next quote and resets the 5-minute countdown
   */
  rotateQuote() {
    const qList = this.quotes();
    if (qList.length > 1) {
      this.currentQuoteIndex.update(idx => (idx + 1) % qList.length);
    }
    this.quoteRotationSecondsLeft.set(300);
  }

  /**
   * Asynchronously hydrate state from IndexedDB database and seed if empty
   */
  async hydrateFromDatabase() {
    try {
      const [dbEvents, dbReminders, dbQuotes] = await Promise.all([
        this.db.getAllEvents(),
        this.db.getAllReminders(),
        this.db.getAllQuotes(),
      ]);

      if (dbEvents && dbEvents.length > 0) {
        this.events.set(dbEvents);
      } else {
        // Seed database with initial events
        for (const evt of this.events()) {
          await this.db.saveEvent(evt);
        }
      }

      // Automatically purge any past events upon hydration
      if (this.autoCleanupEnabled()) {
        await this.autoRemovePastEvents();
      }

      if (dbReminders && dbReminders.length > 0) {
        this.reminders.set(dbReminders);
      } else {
        // Seed database with initial reminders
        for (const rem of this.reminders()) {
          await this.db.saveReminder(rem);
        }
      }

      if (dbQuotes && dbQuotes.length > 0) {
        this.quotes.set(dbQuotes);
      } else {
        // Seed database with initial quotes
        for (const q of this.quotes()) {
          await this.db.saveQuote(q);
        }
      }

      const today = new Date().toISOString().split('T')[0];
      const dbStats = await this.db.getDailyStats(today);
      if (dbStats) {
        this.stats.set(dbStats);
      } else {
        await this.db.saveDailyStats(this.stats());
      }

      // Check remote REST / MySQL backend sync in background
      this.db.syncWithBackend().catch(() => {});
    } catch {
      // Fallback stays active
    }
  }

  // Tab navigation
  setTab(tab: ViewTab) {
    this.currentTab.set(tab);
  }

  // Events management (Dynamic DB backed)
  async addEvent(event: Omit<CalendarEvent, 'id'>) {
    const newEvent: CalendarEvent = { ...event, id: `evt-${Date.now()}` };
    this.events.update(list => [newEvent, ...list]);
    this.saveToStorage(this.STORAGE_EVENTS, this.events());
    await this.db.saveEvent(newEvent);
    if (this.autoCleanupEnabled()) {
      await this.autoRemovePastEvents();
    }
  }

  async deleteEvent(id: string) {
    this.events.update(list => list.filter(e => e.id !== id));
    this.saveToStorage(this.STORAGE_EVENTS, this.events());
    await this.db.deleteEvent(id);
  }

  /**
   * Evaluates if an event takes place on targetDateStr (YYYY-MM-DD),
   * considering frequency recurrence ('none', 'daily', 'weekly', 'monthly').
   */
  isEventOnDate(event: CalendarEvent, targetDateStr: string): boolean {
    if (!event.startDate) return false;
    // An event cannot occur before its scheduled start date
    if (targetDateStr < event.startDate) return false;

    const freq = event.frequency || 'none';
    if (freq === 'none') {
      return event.startDate === targetDateStr;
    }

    if (freq === 'daily') {
      return true;
    }

    if (freq === 'weekly') {
      const startD = new Date(event.startDate + 'T00:00:00');
      const targetD = new Date(targetDateStr + 'T00:00:00');
      return startD.getDay() === targetD.getDay();
    }

    if (freq === 'monthly') {
      const startDayNum = parseInt(event.startDate.split('-')[2], 10);
      const targetDayNum = parseInt(targetDateStr.split('-')[2], 10);
      return startDayNum === targetDayNum;
    }

    return event.startDate === targetDateStr;
  }

  /**
   * Determines if a calendar event has already passed.
   * - Recurring events ('daily', 'weekly', 'monthly') continue in future cycles and are NOT past events.
   * - One-time events ('none' or undefined) are past if:
   *   1. Their startDate is before today's date (YYYY-MM-DD), OR
   *   2. Their startDate is today, and their endTime has elapsed relative to currentTime.
   */
  isPastEvent(event: CalendarEvent, referenceDate: Date = this.currentTime()): boolean {
    const freq = event.frequency || 'none';
    if (freq !== 'none') {
      return false;
    }

    if (!event.startDate) return false;

    const todayStr = this.getLocalDateString(referenceDate);
    if (event.startDate < todayStr) {
      return true;
    }

    if (event.startDate === todayStr) {
      const nowMinutes = referenceDate.getHours() * 60 + referenceDate.getMinutes();
      const startMinutes = this.parseTimeToMinutes(event.startTime);
      let endMinutes = this.parseTimeToMinutes(event.endTime);
      if (endMinutes <= startMinutes) {
        endMinutes = Math.min(1440, startMinutes + 60);
      }
      return endMinutes <= nowMinutes;
    }

    return false;
  }

  /**
   * Automatically identifies and deletes all elapsed one-time events from state,
   * local storage, and the persistent IndexedDB database.
   * Returns the count of removed past events.
   */
  async autoRemovePastEvents(): Promise<number> {
    const currentEvents = this.events();
    const now = this.currentTime();
    const pastIds = currentEvents
      .filter(e => this.isPastEvent(e, now))
      .map(e => e.id);

    if (pastIds.length === 0) {
      return 0;
    }

    // Filter out past events reactively
    const survivingEvents = currentEvents.filter(e => !pastIds.includes(e.id));
    this.events.set(survivingEvents);
    this.saveToStorage(this.STORAGE_EVENTS, survivingEvents);

    // Batch delete from IndexedDB
    try {
      await this.db.deleteMultipleEvents(pastIds);
    } catch (e) {
      console.warn('Failed to delete past events from database', e);
    }

    // Update cleanup statistics
    this.totalAutoCleanedEvents.update(total => total + pastIds.length);
    const nowTimeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    this.lastAutoCleanedTimestamp.set(nowTimeStr);

    return pastIds.length;
  }

  /**
   * Toggles automatic past event removal (default: enabled)
   */
  toggleAutoCleanup() {
    this.autoCleanupEnabled.update(enabled => !enabled);
    if (this.autoCleanupEnabled()) {
      this.autoRemovePastEvents();
    }
  }

  parseTimeToMinutes(t: string): number {
    if (!t) return 0;
    const parts = t.split(':');
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    return h * 60 + m;
  }

  getLocalDateString(d: Date = new Date()): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  /**
   * Identifies and computes the immediate next event (or current in-progress event)
   * to spotlight across dashboard and calendar views.
   */
  computeNextEvent(): NextEventInfo | null {
    const allEvents = this.events();
    if (!allEvents || allEvents.length === 0) return null;

    const now = this.currentTime();
    const todayStr = this.getLocalDateString(now);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    // 1. Check today's events first
    const todayEvents = allEvents
      .filter(e => this.isEventOnDate(e, todayStr))
      .sort((a, b) => this.parseTimeToMinutes(a.startTime) - this.parseTimeToMinutes(b.startTime));

    // Check if an event is happening right now
    for (const evt of todayEvents) {
      const startMin = this.parseTimeToMinutes(evt.startTime);
      let endMin = this.parseTimeToMinutes(evt.endTime);
      if (endMin <= startMin) endMin = Math.min(1440, startMin + 60);

      if (startMin <= nowMinutes && nowMinutes < endMin) {
        const remaining = Math.max(1, endMin - nowMinutes);
        return {
          event: evt,
          isHappeningNow: true,
          minutesUntilStart: 0,
          minutesRemaining: remaining,
          urgency: 'now',
          timeUntilFormatted: `Happening now · Ends in ${remaining}m`,
          countdownFormatted: `${remaining}m left`,
          statusLabel: 'Active Now'
        };
      }
    }

    // Check if there is an upcoming event today
    for (const evt of todayEvents) {
      const startMin = this.parseTimeToMinutes(evt.startTime);
      if (startMin > nowMinutes) {
        const diff = startMin - nowMinutes;
        const urgency = diff <= 30 ? 'imminent' : 'today';
        const countdown = diff < 60 ? `${diff}m` : `${Math.floor(diff / 60)}h ${diff % 60}m`;
        return {
          event: evt,
          isHappeningNow: false,
          minutesUntilStart: diff,
          urgency,
          timeUntilFormatted: diff < 60 ? `Starts in ${diff} min` : `Starts in ${Math.floor(diff / 60)}h ${diff % 60}m (${evt.startTime})`,
          countdownFormatted: `in ${countdown}`,
          statusLabel: diff <= 30 ? 'Starting Soon' : 'Next Up Today'
        };
      }
    }

    // 2. Check future days (up to 30 days ahead)
    for (let dayOffset = 1; dayOffset <= 30; dayOffset++) {
      const futureD = new Date(now);
      futureD.setDate(now.getDate() + dayOffset);
      const futureStr = this.getLocalDateString(futureD);
      const futureEvents = allEvents
        .filter(e => this.isEventOnDate(e, futureStr))
        .sort((a, b) => this.parseTimeToMinutes(a.startTime) - this.parseTimeToMinutes(b.startTime));

      if (futureEvents.length > 0) {
        const evt = futureEvents[0];
        const dayLabel = dayOffset === 1
          ? 'Tomorrow'
          : (dayOffset < 7
              ? futureD.toLocaleDateString('en-US', { weekday: 'long' })
              : futureD.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        return {
          event: evt,
          isHappeningNow: false,
          minutesUntilStart: dayOffset * 1440,
          urgency: 'upcoming',
          timeUntilFormatted: `${dayLabel} at ${evt.startTime}`,
          countdownFormatted: dayOffset === 1 ? 'Tomorrow' : `in ${dayOffset}d`,
          statusLabel: 'Upcoming Event'
        };
      }
    }

    return null;
  }

  /**
   * Computes comprehensive free time analysis for a given date,
   * factoring in regular and recurring events.
   */
  getFreeTimeSummary(dateStr: string): FreeTimeSummary {
    const dayEvents = this.events().filter(e => this.isEventOnDate(e, dateStr));

    const parseTimeToMinutes = (t: string): number => {
      if (!t) return 0;
      const parts = t.split(':');
      const h = parseInt(parts[0], 10) || 0;
      const m = parseInt(parts[1], 10) || 0;
      return h * 60 + m;
    };

    const formatMinutesToHuman = (mins: number): string => {
      if (mins <= 0) return '0m';
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      if (h === 0) return `${m}m`;
      if (m === 0) return `${h}h`;
      return `${h}h ${m}m`;
    };

    const minutesToTimeString = (mins: number): string => {
      const clamped = Math.max(0, Math.min(1439, mins));
      const h = Math.floor(clamped / 60);
      const m = clamped % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    // Build raw intervals
    const rawIntervals: { start: number; end: number }[] = [];
    for (const evt of dayEvents) {
      const s = parseTimeToMinutes(evt.startTime);
      let e = parseTimeToMinutes(evt.endTime);
      if (e <= s) e = Math.min(1440, s + 60);
      rawIntervals.push({ start: s, end: e });
    }

    // Sort by start
    rawIntervals.sort((a, b) => a.start - b.start);

    // Merge overlapping intervals
    const merged: { start: number; end: number }[] = [];
    for (const interval of rawIntervals) {
      if (merged.length === 0) {
        merged.push({ ...interval });
      } else {
        const last = merged[merged.length - 1];
        if (interval.start <= last.end) {
          last.end = Math.max(last.end, interval.end);
        } else {
          merged.push({ ...interval });
        }
      }
    }

    // Total busy across 24h
    let totalBusyMinutes = 0;
    for (const m of merged) {
      totalBusyMinutes += (m.end - m.start);
    }
    const totalFreeMinutes24h = Math.max(0, 1440 - totalBusyMinutes);

    // Active workday window: 05:00 (300 min) to 22:00 (1320 min) = 1020 minutes
    const WORKDAY_START = 300; // 05:00
    const WORKDAY_END = 1320;  // 22:00
    const WORKDAY_TOTAL = WORKDAY_END - WORKDAY_START;

    const workdayBusyIntervals: { start: number; end: number }[] = [];
    for (const m of merged) {
      const startClamped = Math.max(WORKDAY_START, Math.min(WORKDAY_END, m.start));
      const endClamped = Math.max(WORKDAY_START, Math.min(WORKDAY_END, m.end));
      if (endClamped > startClamped) {
        workdayBusyIntervals.push({ start: startClamped, end: endClamped });
      }
    }

    let busyWorkdayMinutes = 0;
    for (const w of workdayBusyIntervals) {
      busyWorkdayMinutes += (w.end - w.start);
    }
    const totalFreeMinutesWorkday = Math.max(0, WORKDAY_TOTAL - busyWorkdayMinutes);
    const freePercentageWorkday = Math.round((totalFreeMinutesWorkday / WORKDAY_TOTAL) * 100);

    // Calculate free slots in the active workday window
    const freeSlots: FreeTimeSlot[] = [];
    let cursor = WORKDAY_START;

    for (const b of workdayBusyIntervals) {
      if (b.start > cursor) {
        const dur = b.start - cursor;
        if (dur >= 15) {
          freeSlots.push({
            startTime: minutesToTimeString(cursor),
            endTime: minutesToTimeString(b.start),
            durationMinutes: dur,
            durationFormatted: formatMinutesToHuman(dur),
            isFocusBlock: dur >= 90
          });
        }
      }
      cursor = Math.max(cursor, b.end);
    }

    if (cursor < WORKDAY_END) {
      const dur = WORKDAY_END - cursor;
      if (dur >= 15) {
        freeSlots.push({
          startTime: minutesToTimeString(cursor),
          endTime: minutesToTimeString(WORKDAY_END),
          durationMinutes: dur,
          durationFormatted: formatMinutesToHuman(dur),
          isFocusBlock: dur >= 90
        });
      }
    }

    let status: 'open' | 'moderate' | 'busy' = 'open';
    let statusLabel = 'High Availability';
    if (freePercentageWorkday >= 65) {
      status = 'open';
      statusLabel = dayEvents.length === 0 ? 'Completely Open' : 'High Availability';
    } else if (freePercentageWorkday >= 30) {
      status = 'moderate';
      statusLabel = 'Moderate Schedule';
    } else {
      status = 'busy';
      statusLabel = 'Heavily Booked';
    }

    return {
      dateStr,
      totalBusyMinutes,
      totalFreeMinutesWorkday,
      freePercentageWorkday,
      totalFreeMinutes24h,
      busyFormatted: formatMinutesToHuman(totalBusyMinutes),
      freeWorkdayFormatted: formatMinutesToHuman(totalFreeMinutesWorkday),
      free24hFormatted: formatMinutesToHuman(totalFreeMinutes24h),
      freeSlots,
      status,
      statusLabel
    };
  }

  // Reminders management (Dynamic DB backed)
  async addReminder(reminder: Omit<Reminder, 'id'>) {
    const newRem: Reminder = { ...reminder, id: `rem-${Date.now()}` };
    this.reminders.update(list => [newRem, ...list]);
    this.saveToStorage(this.STORAGE_REMINDERS, this.reminders());
    await this.db.saveReminder(newRem);
  }

  async toggleReminder(id: string) {
    let updatedReminder: Reminder | null = null;
    this.reminders.update(list =>
      list.map(r => {
        if (r.id === id) {
          const nextCompleted = !r.completed;
          this.stats.update(st => ({
            ...st,
            remindersCompletedToday: nextCompleted ? st.remindersCompletedToday + 1 : Math.max(0, st.remindersCompletedToday - 1)
          }));
          this.saveToStorage(this.STORAGE_STATS, this.stats());
          this.db.saveDailyStats(this.stats());

          updatedReminder = {
            ...r,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined
          };
          return updatedReminder;
        }
        return r;
      })
    );
    this.saveToStorage(this.STORAGE_REMINDERS, this.reminders());
    if (updatedReminder) {
      await this.db.saveReminder(updatedReminder);
    }
  }

  async deleteReminder(id: string) {
    this.reminders.update(list => list.filter(r => r.id !== id));
    this.saveToStorage(this.STORAGE_REMINDERS, this.reminders());
    await this.db.deleteReminder(id);
  }

  async snoozeReminder(id: string, minutes: number) {
    let snoozedItem: Reminder | null = null;
    this.reminders.update(list =>
      list.map(r => {
        if (r.id === id) {
          if (minutes === 1440) {
            const d = new Date();
            d.setDate(d.getDate() + 1);
            snoozedItem = { ...r, dueDate: d.toISOString().split('T')[0], snoozedUntil: 'Tomorrow' };
            return snoozedItem;
          }
          const now = new Date();
          now.setMinutes(now.getMinutes() + minutes);
          const hh = String(now.getHours()).padStart(2, '0');
          const mm = String(now.getMinutes()).padStart(2, '0');
          snoozedItem = { ...r, dueTime: `${hh}:${mm}`, snoozedUntil: `${hh}:${mm}` };
          return snoozedItem;
        }
        return r;
      })
    );
    this.saveToStorage(this.STORAGE_REMINDERS, this.reminders());
    if (snoozedItem) {
      await this.db.saveReminder(snoozedItem);
    }
  }

  // Breaks and Stats (Dynamic DB backed)
  async logBreak(minutes: number) {
    this.stats.update(st => ({
      ...st,
      breaksCompletedToday: st.breaksCompletedToday + 1,
      focusMinutesToday: st.focusMinutesToday + minutes
    }));
    this.saveToStorage(this.STORAGE_STATS, this.stats());
    await this.db.saveDailyStats(this.stats());
  }

  async logHydration() {
    this.stats.update(st => ({ ...st, waterGlasses: st.waterGlasses + 1 }));
    this.saveToStorage(this.STORAGE_STATS, this.stats());
    await this.db.saveDailyStats(this.stats());
  }

  // Quotes (Dynamic DB backed)
  async toggleFavoriteQuote(id: string) {
    let favQuote: Quote | null = null;
    this.quotes.update(list =>
      list.map(q => {
        if (q.id === id) {
          favQuote = { ...q, favorite: !q.favorite };
          return favQuote;
        }
        return q;
      })
    );
    this.saveToStorage(this.STORAGE_QUOTES, this.quotes());
    if (favQuote) {
      await this.db.saveQuote(favQuote);
    }
  }

  async addCustomQuote(quote: Omit<Quote, 'id'>) {
    const newQuote: Quote = { ...quote, id: `q-${Date.now()}` };
    this.quotes.update(list => [newQuote, ...list]);
    this.saveToStorage(this.STORAGE_QUOTES, this.quotes());
    await this.db.saveQuote(newQuote);
  }

  // Initial fallbacks
  private loadInitialEvents(): CalendarEvent[] {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(this.STORAGE_EVENTS) : null;
    if (raw) {
      try { return JSON.parse(raw); } catch {}
    }
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
        priority: 'high',
        frequency: 'daily'
      },
      {
        id: 'evt-2',
        title: 'Sprint Retrospective & Sync',
        startDate: today,
        startTime: '14:00',
        endTime: '14:45',
        category: 'meeting',
        priority: 'medium',
        frequency: 'weekly'
      }
    ];
  }

  private loadInitialReminders(): Reminder[] {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(this.STORAGE_REMINDERS) : null;
    if (raw) {
      try { return JSON.parse(raw); } catch {}
    }
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

  private loadInitialStats(): DailyStats {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(this.STORAGE_STATS) : null;
    if (raw) {
      try { return JSON.parse(raw); } catch {}
    }
    return {
      focusMinutesToday: 85,
      breaksCompletedToday: 3,
      remindersCompletedToday: 2,
      waterGlasses: 4,
      currentStreakDays: 6,
      lastActiveDate: new Date().toISOString().split('T')[0]
    };
  }

  private loadInitialQuotes(): Quote[] {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(this.STORAGE_QUOTES) : null;
    if (raw) {
      try { return JSON.parse(raw); } catch {}
    }
    return INITIAL_QUOTES;
  }

  private saveToStorage(key: string, data: unknown) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(data));
      }
    } catch (e) {
      console.error(e);
    }
  }
}

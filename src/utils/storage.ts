import { CalendarEvent, Reminder, DailyStats, Quote } from '../types';
import { INITIAL_QUOTES } from './quotes';

const STORAGE_KEYS = {
  EVENTS: 'chronos_calendar_events_v1',
  REMINDERS: 'chronos_reminders_v1',
  STATS: 'chronos_daily_stats_v1',
  QUOTES: 'chronos_quotes_v1',
};

// Helper for dates relative to today
function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getRelativeDateStr(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return formatDate(d);
}

export function getInitialEvents(): CalendarEvent[] {
  const today = getRelativeDateStr(0);
  const tomorrow = getRelativeDateStr(1);
  const inTwoDays = getRelativeDateStr(2);
  const inThreeDays = getRelativeDateStr(3);
  const yesterday = getRelativeDateStr(-1);

  return [
    {
      id: 'evt-1',
      title: 'Morning Focus: Architecture & Core Engine',
      description: 'Deep work sprint on service layer and caching mechanisms without notifications.',
      startDate: today,
      startTime: '09:00',
      endTime: '11:00',
      category: 'deep-work',
      priority: 'high',
      locationOrLink: 'Study / Desk 1',
    },
    {
      id: 'evt-2',
      title: 'Productivity Review & Sync',
      description: 'Weekly team review of deliverables and sprint milestone health.',
      startDate: today,
      startTime: '14:00',
      endTime: '14:45',
      category: 'meeting',
      priority: 'medium',
      locationOrLink: 'Conference Room Alpha',
    },
    {
      id: 'evt-3',
      title: 'Movement & Mobility Session',
      description: '30-minute cardio and spinal decompression workout.',
      startDate: today,
      startTime: '17:30',
      endTime: '18:15',
      category: 'workout',
      priority: 'low',
      locationOrLink: 'Gym / Studio',
    },
    {
      id: 'evt-4',
      title: 'Technical Reading: Distributed Systems',
      description: 'Reviewing consensus algorithms and write-ahead log designs.',
      startDate: tomorrow,
      startTime: '10:00',
      endTime: '11:30',
      category: 'learning',
      priority: 'medium',
    },
    {
      id: 'evt-5',
      title: 'Sprint Retrospective & Next Cycle Planning',
      description: 'Reflect on bottlenecks and calibrate upcoming estimates.',
      startDate: tomorrow,
      startTime: '15:00',
      endTime: '16:00',
      category: 'review',
      priority: 'high',
    },
    {
      id: 'evt-6',
      title: 'Deep Work: Database Query Optimization',
      description: 'Profiling slow index queries and query plan analysis.',
      startDate: inTwoDays,
      startTime: '09:30',
      endTime: '11:30',
      category: 'deep-work',
      priority: 'high',
    },
    {
      id: 'evt-7',
      title: 'Family Dinner & Evening Walk',
      description: 'Unwind and offline recovery time.',
      startDate: inThreeDays,
      startTime: '19:00',
      endTime: '21:00',
      category: 'personal',
      priority: 'medium',
    },
    {
      id: 'evt-0',
      title: 'System Health Check & Backup Run',
      description: 'Automated verification of disaster recovery snapshots.',
      startDate: yesterday,
      startTime: '08:30',
      endTime: '09:00',
      category: 'review',
      priority: 'low',
    }
  ];
}

export function getInitialReminders(): Reminder[] {
  const today = getRelativeDateStr(0);
  const tomorrow = getRelativeDateStr(1);
  const inTwoDays = getRelativeDateStr(2);
  const yesterday = getRelativeDateStr(-1);

  return [
    {
      id: 'rem-1',
      title: 'Submit quarterly engineering performance review',
      description: 'Self-assessment and milestone accomplishments summary.',
      dueDate: today,
      dueTime: '13:00',
      priority: 'high',
      category: 'work',
      completed: false,
    },
    {
      id: 'rem-2',
      title: 'Hydrate with electrolytes and take posture break',
      description: 'Minimum 500ml water and 2-minute spinal extension.',
      dueDate: today,
      dueTime: '15:30',
      priority: 'medium',
      category: 'health',
      completed: true,
      completedAt: new Date().toISOString(),
    },
    {
      id: 'rem-3',
      title: 'Refactor calendar grid date navigation logic',
      description: 'Ensure month edge calculations and leap year checks handle all bounds cleanly.',
      dueDate: today,
      dueTime: '17:00',
      priority: 'high',
      category: 'work',
      completed: false,
    },
    {
      id: 'rem-4',
      title: 'Review investment ledger and monthly budget reconciliations',
      description: 'Audit automated savings and recurring subscription costs.',
      dueDate: tomorrow,
      dueTime: '18:00',
      priority: 'low',
      category: 'finance',
      completed: false,
    },
    {
      id: 'rem-5',
      title: 'Practice 20-minute cognitive reframing / journaling',
      description: 'Evening reflection on daily wins and tomorrow three priorities.',
      dueDate: tomorrow,
      dueTime: '21:30',
      priority: 'medium',
      category: 'personal',
      completed: false,
    },
    {
      id: 'rem-6',
      title: 'Read chapter 4 of Designing Data-Intensive Applications',
      description: 'Encoding and evolution, protocol buffers and Avro serialization.',
      dueDate: inTwoDays,
      dueTime: '20:00',
      priority: 'low',
      category: 'learning',
      completed: false,
    },
    {
      id: 'rem-7',
      title: 'Send project status digest to team leads',
      description: 'Include risk mitigation notes and blockers.',
      dueDate: yesterday,
      dueTime: '16:00',
      priority: 'high',
      category: 'work',
      completed: true,
      completedAt: new Date(Date.now() - 86400000).toISOString(),
    }
  ];
}

export function loadEvents(): CalendarEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load events from storage:', err);
  }
  const initial = getInitialEvents();
  saveEvents(initial);
  return initial;
}

export function saveEvents(events: CalendarEvent[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  } catch (err) {
    console.error('Failed to save events:', err);
  }
}

export function loadReminders(): Reminder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load reminders:', err);
  }
  const initial = getInitialReminders();
  saveReminders(initial);
  return initial;
}

export function saveReminders(reminders: Reminder[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  } catch (err) {
    console.error('Failed to save reminders:', err);
  }
}

export function loadStats(): DailyStats {
  const today = formatDate(new Date());
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    if (raw) {
      const parsed: DailyStats = JSON.parse(raw);
      // Reset daily counts if new day
      if (parsed.lastActiveDate !== today) {
        return {
          focusMinutesToday: 0,
          breaksCompletedToday: 0,
          remindersCompletedToday: 0,
          waterGlasses: 0,
          currentStreakDays: parsed.currentStreakDays + 1,
          lastActiveDate: today,
        };
      }
      return parsed;
    }
  } catch (err) {
    console.error('Failed to load stats:', err);
  }

  const initialStats: DailyStats = {
    focusMinutesToday: 85,
    breaksCompletedToday: 3,
    remindersCompletedToday: 2,
    waterGlasses: 4,
    currentStreakDays: 6,
    lastActiveDate: today,
  };
  saveStats(initialStats);
  return initialStats;
}

export function saveStats(stats: DailyStats) {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (err) {
    console.error('Failed to save stats:', err);
  }
}

export function loadQuotes(): Quote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUOTES);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load quotes:', err);
  }
  saveQuotes(INITIAL_QUOTES);
  return INITIAL_QUOTES;
}

export function saveQuotes(quotes: Quote[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
  } catch (err) {
    console.error('Failed to save quotes:', err);
  }
}

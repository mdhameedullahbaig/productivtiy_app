export type Priority = 'high' | 'medium' | 'low';

export type EventCategory = 
  | 'deep-work'
  | 'meeting'
  | 'workout'
  | 'learning'
  | 'personal'
  | 'review';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  category: EventCategory;
  priority: Priority;
  locationOrLink?: string;
}

export type ReminderCategory = 'work' | 'personal' | 'health' | 'finance' | 'learning';

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate: string;   // YYYY-MM-DD
  dueTime?: string;  // HH:mm
  priority: Priority;
  category: ReminderCategory;
  completed: boolean;
  completedAt?: string;
  snoozedUntil?: string;
}

export interface Quote {
  id: string;
  text: string;
  author: string;
  category: 'Focus' | 'Discipline' | 'Habits' | 'Resilience' | 'Clarity' | 'Mindset';
  reflectionPrompt?: string;
  favorite?: boolean;
}

export interface DailyStats {
  focusMinutesToday: number;
  breaksCompletedToday: number;
  remindersCompletedToday: number;
  waterGlasses: number;
  currentStreakDays: number;
  lastActiveDate: string;
}

export type ViewTab = 'dashboard' | 'calendar' | 'reminders' | 'breaks' | 'quotes';

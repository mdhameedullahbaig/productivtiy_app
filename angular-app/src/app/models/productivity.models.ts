export type Priority = 'high' | 'medium' | 'low';

export type EventCategory = 
  | 'deep-work'
  | 'meeting'
  | 'workout'
  | 'learning'
  | 'personal'
  | 'review';

export type EventFrequency = 'none' | 'daily' | 'weekly' | 'monthly';

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
  frequency?: EventFrequency;
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

export interface FreeTimeSlot {
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  durationMinutes: number;
  durationFormatted: string;
  isFocusBlock: boolean; // >= 90 mins
}

export interface FreeTimeSummary {
  dateStr: string;
  totalBusyMinutes: number;
  totalFreeMinutesWorkday: number; // 8:00 - 20:00 (720 min active window)
  freePercentageWorkday: number;
  totalFreeMinutes24h: number; // 1440 min
  busyFormatted: string;
  freeWorkdayFormatted: string;
  free24hFormatted: string;
  freeSlots: FreeTimeSlot[];
  status: 'open' | 'moderate' | 'busy';
  statusLabel: string;
}

export interface NextEventInfo {
  event: CalendarEvent;
  isHappeningNow: boolean;
  timeUntilFormatted: string;
  countdownFormatted: string;
  minutesUntilStart: number;
  minutesRemaining?: number;
  urgency: 'now' | 'imminent' | 'today' | 'upcoming';
  statusLabel: string;
}


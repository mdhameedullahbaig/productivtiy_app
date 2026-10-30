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
  seriesId?: string;
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

export type QuoteCategory = 'Focus' | 'Discipline' | 'Habits' | 'Resilience' | 'Clarity' | 'Mindset' | 'Time Mastery';

export interface Quote {
  id: string;
  text: string;
  author: string;
  category: QuoteCategory;
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

export type ViewTab = 'dashboard' | 'calendar' | 'reminders' | 'breaks' | 'quotes' | 'diet';

export interface MealTiming {
  id: string;
  name: string;
  timeRange: string;
  startMinutes: number; // minutes from midnight
  endMinutes: number;   // minutes from midnight
  icon: string;
  phase: 'Early Morning' | 'Morning' | 'Midday' | 'Afternoon' | 'Evening' | 'Night Fast';
  summary: string;
  idealFoods: string[];
  foodsToAvoid: string[];
  expertGuidance: string;
  caffeineAllowed: boolean;
  waterIntakeTargetMl: number;
}

export interface HealthExpertRecommendation {
  id: string;
  title: string;
  expert: string;
  roleAndInstitution: string;
  category: 'Circadian Fasting' | 'Cognitive Fuel' | 'Hydration Science' | 'Gut-Brain Axis' | 'Energy Crash Prevention';
  keyRule: string;
  actionableProtocol: string;
  scientificMechanism: string;
  impactBadge: string;
  icon: string;
  color: string;
}

export interface ProductivityTip {
  id: string;
  title: string;
  subtitle: string;
  source: string;
  category: 'Focus Mastery' | 'Time Architecture' | 'Cognitive Load' | 'Energy Cycles' | 'Execution Speed';
  mechanism: string;
  actionableSteps: string[];
  timeInvestment: string;
  impactRating: '10x Multiplier' | 'High Impact' | 'Daily Essential';
  icon: string;
  badgeText: string;
}

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
  totalFreeMinutesWorkday: number; // 05:00 - 22:00 (1020 min active daytime window)
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


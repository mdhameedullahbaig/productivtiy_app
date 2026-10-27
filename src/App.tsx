import React, { useState, useEffect } from 'react';
import { ViewTab, CalendarEvent, Reminder, DailyStats, Quote } from './types';
import { 
  loadEvents, 
  saveEvents, 
  loadReminders, 
  saveReminders, 
  loadStats, 
  saveStats, 
  loadQuotes, 
  saveQuotes 
} from './utils/storage';
import { getQuoteOfTheDay } from './utils/quotes';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { CalendarView } from './components/CalendarView';
import { RemindersView } from './components/RemindersView';
import { QuickBreaksView } from './components/QuickBreaksView';
import { QuotesView } from './components/QuotesView';
import { QuickAddModal } from './components/QuickAddModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');

  // Core application data states
  const [events, setEvents] = useState<CalendarEvent[]>(() => loadEvents());
  const [reminders, setReminders] = useState<Reminder[]>(() => loadReminders());
  const [stats, setStats] = useState<DailyStats>(() => loadStats());
  const [quotes, setQuotes] = useState<Quote[]>(() => loadQuotes());

  // Quick Add modal state
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);
  const [quickAddType, setQuickAddType] = useState<'event' | 'reminder'>('reminder');
  const [quickAddDate, setQuickAddDate] = useState<string | undefined>(undefined);

  // Sync to storage
  useEffect(() => {
    saveEvents(events);
  }, [events]);

  useEffect(() => {
    saveReminders(reminders);
  }, [reminders]);

  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  useEffect(() => {
    saveQuotes(quotes);
  }, [quotes]);

  // Handlers for Events
  const handleAddEvent = (newEventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...newEventData,
      id: `evt-${Date.now()}`,
    };
    setEvents((prev) => [newEvent, ...prev]);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  // Handlers for Reminders
  const handleAddReminder = (newReminderData: Omit<Reminder, 'id'>) => {
    const newReminder: Reminder = {
      ...newReminderData,
      id: `rem-${Date.now()}`,
    };
    setReminders((prev) => [newReminder, ...prev]);
  };

  const handleToggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextCompleted = !r.completed;
          // Update stats
          setStats((st) => ({
            ...st,
            remindersCompletedToday: nextCompleted
              ? st.remindersCompletedToday + 1
              : Math.max(0, st.remindersCompletedToday - 1),
          }));
          return {
            ...r,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
          };
        }
        return r;
      })
    );
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSnoozeReminder = (id: string, minutes: number) => {
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          if (minutes === 1440) {
            // Tomorrow
            const d = new Date();
            d.setDate(d.getDate() + 1);
            const tomorrowStr = d.toISOString().split('T')[0];
            return {
              ...r,
              dueDate: tomorrowStr,
              snoozedUntil: 'Tomorrow',
            };
          } else {
            // Minutes addition
            const now = new Date();
            now.setMinutes(now.getMinutes() + minutes);
            const hours = String(now.getHours()).padStart(2, '0');
            const mins = String(now.getMinutes()).padStart(2, '0');
            return {
              ...r,
              dueTime: `${hours}:${mins}`,
              snoozedUntil: `${hours}:${mins}`,
            };
          }
        }
        return r;
      })
    );
  };

  // Handlers for Breaks & Stats
  const handleLogBreakCompleted = (minutes: number) => {
    setStats((prev) => ({
      ...prev,
      breaksCompletedToday: prev.breaksCompletedToday + 1,
      focusMinutesToday: prev.focusMinutesToday + minutes,
    }));
  };

  const handleLogHydration = () => {
    setStats((prev) => ({
      ...prev,
      waterGlasses: prev.waterGlasses + 1,
    }));
  };

  // Handlers for Quotes
  const handleToggleFavoriteQuote = (id: string) => {
    setQuotes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, favorite: !q.favorite } : q))
    );
  };

  const handleAddCustomQuote = (newQuoteData: Omit<Quote, 'id'>) => {
    const newQuote: Quote = {
      ...newQuoteData,
      id: `q-${Date.now()}`,
    };
    setQuotes((prev) => [newQuote, ...prev]);
  };

  // Modal openers
  const openQuickAdd = (type: 'event' | 'reminder' = 'reminder', date?: string) => {
    setQuickAddType(type);
    setQuickAddDate(date);
    setIsQuickAddOpen(true);
  };

  const unreadRemindersCount = reminders.filter((r) => !r.completed).length;
  const quoteOfTheDay = getQuoteOfTheDay(quotes);

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 flex flex-col antialiased">
      {/* 3-Zone Top Bar Navigation */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenQuickAdd={() => openQuickAdd('reminder')}
        unreadRemindersCount={unreadRemindersCount}
      />

      {/* Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'dashboard' && (
          <DashboardView
            stats={stats}
            events={events}
            reminders={reminders}
            quoteOfTheDay={quoteOfTheDay}
            onNavigateTab={setCurrentTab}
            onToggleReminder={handleToggleReminder}
            onSnoozeReminder={handleSnoozeReminder}
            onOpenQuickAdd={(type) => openQuickAdd(type)}
            onLogHydration={handleLogHydration}
          />
        )}

        {currentTab === 'calendar' && (
          <CalendarView
            events={events}
            reminders={reminders}
            onAddEventClick={(dateStr) => openQuickAdd('event', dateStr)}
            onDeleteEvent={handleDeleteEvent}
            onToggleReminder={handleToggleReminder}
          />
        )}

        {currentTab === 'reminders' && (
          <RemindersView
            reminders={reminders}
            onToggleReminder={handleToggleReminder}
            onDeleteReminder={handleDeleteReminder}
            onSnoozeReminder={handleSnoozeReminder}
            onAddReminderClick={() => openQuickAdd('reminder')}
          />
        )}

        {currentTab === 'breaks' && (
          <QuickBreaksView
            onLogBreakCompleted={handleLogBreakCompleted}
            onLogHydration={handleLogHydration}
            waterGlasses={stats.waterGlasses}
          />
        )}

        {currentTab === 'quotes' && (
          <QuotesView
            quotes={quotes}
            onToggleFavorite={handleToggleFavoriteQuote}
            onAddCustomQuote={handleAddCustomQuote}
          />
        )}
      </main>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onAddEvent={handleAddEvent}
        onAddReminder={handleAddReminder}
        defaultType={quickAddType}
        defaultDate={quickAddDate}
      />

      {/* Clean human footer adhering strictly to Section 1B (no ornamental engines or telemetry tickers) */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Chronos Productivity Suite</span>
            <span aria-hidden="true">·</span>
            <span>Focus, Calendar, Tasks & Restorative Habits</span>
          </div>

          <div className="flex items-center gap-4">
            <span>Clean Architecture</span>
            <span aria-hidden="true">·</span>
            <span>Local Offline Persistence</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

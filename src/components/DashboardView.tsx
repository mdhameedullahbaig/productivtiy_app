import React from 'react';
import { CalendarEvent, Reminder, DailyStats, Quote, ViewTab } from '../types';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar, 
  Flame, 
  Coffee, 
  Sparkles, 
  Volume2, 
  Copy, 
  Check, 
  ArrowRight,
  TrendingUp,
  Droplets,
  Plus
} from 'lucide-react';
import { soundEngine, speakText } from '../utils/audio';

interface DashboardViewProps {
  stats: DailyStats;
  events: CalendarEvent[];
  reminders: Reminder[];
  quoteOfTheDay: Quote;
  onNavigateTab: (tab: ViewTab) => void;
  onToggleReminder: (id: string) => void;
  onSnoozeReminder: (id: string, minutes: number) => void;
  onOpenQuickAdd: (type: 'event' | 'reminder') => void;
  onLogHydration: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  events,
  reminders,
  quoteOfTheDay,
  onNavigateTab,
  onToggleReminder,
  onSnoozeReminder,
  onOpenQuickAdd,
  onLogHydration,
}) => {
  const [copiedQuote, setCopiedQuote] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const todayEvents = events.filter((e) => e.startDate === todayStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const todayReminders = reminders.filter((r) => r.dueDate === todayStr);
  const activeReminders = todayReminders.filter((r) => !r.completed);

  const handleCopyQuote = () => {
    navigator.clipboard.writeText(`"${quoteOfTheDay.text}" — ${quoteOfTheDay.author}`);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2000);
  };

  const handleSpeakQuote = () => {
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(`"${quoteOfTheDay.text}" by ${quoteOfTheDay.author}`, () => {
        setIsSpeaking(false);
      });
    }
  };

  const handleToggle = (id: string, completed: boolean) => {
    if (!completed) {
      soundEngine.playSuccessChime();
    }
    onToggleReminder(id);
  };

  const formattedToday = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Top Welcome & Date Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider font-mono">
            {formattedToday}
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            Daily Focus & Execution Center
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => onOpenQuickAdd('reminder')}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            + Reminder
          </button>
          <button
            onClick={() => onOpenQuickAdd('event')}
            className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            + Event
          </button>
        </div>
      </div>

      {/* 4-Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Focus Minutes */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Deep Focus Time</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-mono tabular-nums font-bold text-slate-900">
              {stats.focusMinutesToday}
            </span>
            <span className="text-xs text-slate-500 font-mono">minutes</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">Logged today</div>
        </div>

        {/* Metric 2: Reminders Completed */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Tasks Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-mono tabular-nums font-bold text-slate-900">
              {stats.remindersCompletedToday}
            </span>
            <span className="text-xs text-slate-500 font-mono">finished</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            {activeReminders.length} remaining today
          </div>
        </div>

        {/* Metric 3: Quick Breaks Taken */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Breaks Taken</span>
            <Coffee className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-mono tabular-nums font-bold text-slate-900">
              {stats.breaksCompletedToday}
            </span>
            <span className="text-xs text-slate-500 font-mono">sessions</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">Eye & stretch resets</div>
        </div>

        {/* Metric 4: Streak */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Streak</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-mono tabular-nums font-bold text-slate-900">
              {stats.currentStreakDays}
            </span>
            <span className="text-xs text-slate-500 font-mono">days</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">Daily consistency</div>
        </div>
      </div>

      {/* Quote of the Day Spotlight */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-600">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Quote of the Day</span>
              <span aria-hidden="true">·</span>
              <span>{quoteOfTheDay.category}</span>
            </div>

            <p className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed">
              "{quoteOfTheDay.text}"
            </p>

            <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
              <span>— {quoteOfTheDay.author}</span>
              {quoteOfTheDay.reflectionPrompt && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-600 italic hidden md:inline">
                    Reflection: {quoteOfTheDay.reflectionPrompt}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start shrink-0">
            <button
              onClick={handleSpeakQuote}
              className={`p-2 rounded-lg border text-xs font-mono transition-colors cursor-pointer flex items-center gap-1 ${
                isSpeaking
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
              }`}
              title="Listen aloud"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isSpeaking ? 'Stop' : 'Listen'}</span>
            </button>

            <button
              onClick={handleCopyQuote}
              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-mono transition-colors cursor-pointer flex items-center gap-1"
              title="Copy quote"
            >
              {copiedQuote ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedQuote ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={() => onNavigateTab('quotes')}
              className="px-3 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Library</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Today's Schedule & Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Today's Events */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Today's Scheduled Events</h3>
            </div>
            <button
              onClick={() => onNavigateTab('calendar')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>View Calendar</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {todayEvents.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No events scheduled for today.
            </div>
          ) : (
            <div className="space-y-2.5">
              {todayEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">{evt.title}</span>
                    <span className="text-[11px] font-mono tabular-nums text-slate-500">
                      {evt.startTime} - {evt.endTime}
                    </span>
                  </div>

                  {evt.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{evt.description}</p>
                  )}

                  {/* Clean unboxed metadata per Section 1A */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-1.5">
                    <span>{evt.category}</span>
                    {evt.locationOrLink && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="truncate max-w-[200px]">{evt.locationOrLink}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Active Reminders */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">Active Reminders & Deadlines</h3>
            </div>
            <button
              onClick={() => onNavigateTab('reminders')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>All Reminders</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {todayReminders.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No reminders due today.
            </div>
          ) : (
            <div className="space-y-2">
              {todayReminders.map((rem) => (
                <div
                  key={rem.id}
                  className={`p-3 rounded-lg border flex items-center justify-between gap-3 transition-colors ${
                    rem.completed
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <button
                      onClick={() => handleToggle(rem.id, rem.completed)}
                      className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer shrink-0"
                    >
                      {rem.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <p
                        className={`text-xs font-medium truncate ${
                          rem.completed ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {rem.title}
                      </p>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {rem.dueTime ? `Due ${rem.dueTime}` : 'Due today'} · {rem.category}
                      </div>
                    </div>
                  </div>

                  {!rem.completed && (
                    <button
                      onClick={() => onSnoozeReminder(rem.id, 60)}
                      className="text-[10px] font-mono text-slate-500 hover:text-slate-900 px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer shrink-0"
                      title="Snooze 1 hour"
                    >
                      +1h
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Launch Break Bar */}
      <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-indigo-950">Feeling Mental Friction or Eye Strain?</h4>
            <p className="text-[11px] text-indigo-700">Take a 20-second eye reset or a guided 2-minute desk stretch.</p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('breaks')}
          className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap self-start sm:self-auto"
        >
          Open Quick Breaks
        </button>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Reminder, Priority, ReminderCategory } from '../types';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertTriangle, 
  Trash2, 
  Search, 
  Filter, 
  RotateCcw,
  Sparkles,
  Calendar
} from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface RemindersViewProps {
  reminders: Reminder[];
  onToggleReminder: (id: string) => void;
  onDeleteReminder: (id: string) => void;
  onSnoozeReminder: (id: string, minutes: number) => void;
  onAddReminderClick: () => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  reminders,
  onToggleReminder,
  onDeleteReminder,
  onSnoozeReminder,
  onAddReminderClick,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'upcoming' | 'overdue' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  const todayStr = new Date().toISOString().split('T')[0];

  // Check if reminder is overdue
  const isOverdue = (rem: Reminder) => {
    if (rem.completed) return false;
    return rem.dueDate < todayStr;
  };

  const isToday = (rem: Reminder) => {
    return rem.dueDate === todayStr;
  };

  // Filter logic
  const filteredReminders = reminders.filter((rem) => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = rem.title.toLowerCase().includes(q) || (rem.description && rem.description.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Priority filter
    if (selectedPriority !== 'all' && rem.priority !== selectedPriority) {
      return false;
    }

    // Tab filter
    if (activeFilter === 'today') {
      return !rem.completed && isToday(rem);
    }
    if (activeFilter === 'upcoming') {
      return !rem.completed && rem.dueDate > todayStr;
    }
    if (activeFilter === 'overdue') {
      return isOverdue(rem);
    }
    if (activeFilter === 'completed') {
      return rem.completed;
    }
    return true; // 'all'
  });

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'high':
        return <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">High</span>;
      case 'medium':
        return <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Medium</span>;
      case 'low':
        return <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Low</span>;
    }
  };

  const getCategoryLabel = (c: ReminderCategory) => {
    switch (c) {
      case 'work': return 'Work';
      case 'personal': return 'Personal';
      case 'health': return 'Health & Habits';
      case 'finance': return 'Finance';
      case 'learning': return 'Learning';
    }
  };

  const handleToggle = (id: string, currentCompleted: boolean) => {
    if (!currentCompleted) {
      soundEngine.playSuccessChime();
    }
    onToggleReminder(id);
  };

  const counts = {
    all: reminders.length,
    today: reminders.filter((r) => !r.completed && isToday(r)).length,
    upcoming: reminders.filter((r) => !r.completed && r.dueDate > todayStr).length,
    overdue: reminders.filter(isOverdue).length,
    completed: reminders.filter((r) => r.completed).length,
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Productivity Reminders & Tasks
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Time-sensitive prompts, habits, and critical actions with smart snooze.
            </p>
          </div>

          <button
            onClick={onAddReminderClick}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <span>+ Add Reminder</span>
          </button>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {/* Segmented status filter tabs */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>All</span>
              <span className="font-mono tabular-nums text-[10px] text-slate-400">({counts.all})</span>
            </button>

            <button
              onClick={() => setActiveFilter('today')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'today'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Due Today</span>
              <span className="font-mono tabular-nums text-[10px] text-slate-400">({counts.today})</span>
            </button>

            <button
              onClick={() => setActiveFilter('upcoming')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'upcoming'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Upcoming</span>
              <span className="font-mono tabular-nums text-[10px] text-slate-400">({counts.upcoming})</span>
            </button>

            <button
              onClick={() => setActiveFilter('overdue')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'overdue'
                  ? 'bg-white text-rose-700 shadow-xs font-semibold'
                  : 'text-rose-600 hover:text-rose-800'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-rose-500" />
              <span>Overdue</span>
              <span className="font-mono tabular-nums text-[10px] text-rose-500">({counts.overdue})</span>
            </button>

            <button
              onClick={() => setActiveFilter('completed')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'completed'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Completed</span>
              <span className="font-mono tabular-nums text-[10px] text-slate-400">({counts.completed})</span>
            </button>
          </div>

          {/* Search bar & Priority dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reminders..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-44 sm:w-52"
              />
            </div>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reminders List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredReminders.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Clock className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium">No reminders in this view</p>
            <p className="text-xs text-slate-400 mt-1">
              You are caught up on everything scheduled under this filter.
            </p>
            <button
              onClick={onAddReminderClick}
              className="mt-4 px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              Add a New Reminder
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredReminders.map((rem) => {
              const overdue = isOverdue(rem);
              return (
                <div
                  key={rem.id}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors group ${
                    rem.completed ? 'bg-slate-50/60' : overdue ? 'bg-rose-50/20' : 'hover:bg-slate-50/70'
                  }`}
                >
                  {/* Left: Checkbox & Info */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <button
                      onClick={() => handleToggle(rem.id, rem.completed)}
                      className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer shrink-0"
                      aria-label={rem.completed ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {rem.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <Circle className="w-5 h-5 hover:stroke-indigo-600" />
                      )}
                    </button>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-sm font-medium leading-snug break-words ${
                            rem.completed
                              ? 'line-through text-slate-400'
                              : overdue
                              ? 'text-rose-950 font-semibold'
                              : 'text-slate-900'
                          }`}
                        >
                          {rem.title}
                        </span>
                        {getPriorityBadge(rem.priority)}
                      </div>

                      {rem.description && (
                        <p className={`text-xs ${rem.completed ? 'text-slate-400 line-through' : 'text-slate-500'}`}>
                          {rem.description}
                        </p>
                      )}

                      {/* Unboxed metadata row with typographic separators */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono pt-1">
                        <span className={`flex items-center gap-1 ${overdue ? 'text-rose-600 font-semibold' : ''}`}>
                          <Calendar className="w-3 h-3" />
                          <span className="tabular-nums">{rem.dueDate}</span>
                          {rem.dueTime && <span className="tabular-nums">· {rem.dueTime}</span>}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{getCategoryLabel(rem.category)}</span>
                        {overdue && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-rose-600 font-semibold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Past Due
                            </span>
                          </>
                        )}
                        {rem.snoozedUntil && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-indigo-600">Snoozed until {rem.snoozedUntil}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Snooze Shortcuts & Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {!rem.completed && (
                      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 text-xs text-slate-600">
                        <span className="px-1.5 text-[11px] font-medium text-slate-400 flex items-center gap-1">
                          <RotateCcw className="w-3 h-3" /> Snooze:
                        </span>
                        <button
                          onClick={() => onSnoozeReminder(rem.id, 15)}
                          className="px-2 py-1 text-[11px] font-mono hover:bg-white rounded transition-colors cursor-pointer hover:text-slate-900"
                          title="Snooze for 15 minutes"
                        >
                          +15m
                        </button>
                        <button
                          onClick={() => onSnoozeReminder(rem.id, 60)}
                          className="px-2 py-1 text-[11px] font-mono hover:bg-white rounded transition-colors cursor-pointer hover:text-slate-900"
                          title="Snooze for 1 hour"
                        >
                          +1h
                        </button>
                        <button
                          onClick={() => onSnoozeReminder(rem.id, 1440)}
                          className="px-2 py-1 text-[11px] font-mono hover:bg-white rounded transition-colors cursor-pointer hover:text-slate-900"
                          title="Snooze to tomorrow"
                        >
                          Tomorrow
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => onDeleteReminder(rem.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete reminder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

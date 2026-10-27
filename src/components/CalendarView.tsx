import React, { useState } from 'react';
import { CalendarEvent, Reminder, EventCategory } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  MapPin, 
  AlignLeft, 
  Trash2, 
  Calendar as CalendarIcon, 
  CheckCircle2,
  Circle
} from 'lucide-react';

interface CalendarViewProps {
  events: CalendarEvent[];
  reminders: Reminder[];
  onAddEventClick: (dateStr?: string) => void;
  onDeleteEvent: (id: string) => void;
  onToggleReminder: (id: string) => void;
}

type CalendarMode = 'month' | 'week' | 'agenda';

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  reminders,
  onAddEventClick,
  onDeleteEvent,
  onToggleReminder,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('month');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDayDetail, setSelectedDayDetail] = useState<string | null>(null);

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate calendar grid days
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const gridCells: { dateStr: string; dayNum: number; isCurrentMonth: boolean; isToday: boolean }[] = [];

  const todayStr = new Date().toISOString().split('T')[0];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevMonthDate = new Date(year, month - 1, day);
    const dateStr = prevMonthDate.toISOString().split('T')[0];
    gridCells.push({
      dateStr,
      dayNum: day,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  // Current month days
  for (let day = 1; day <= daysInCurrentMonth; day++) {
    const d = new Date(year, month, day);
    const dateStr = d.toISOString().split('T')[0];
    gridCells.push({
      dateStr,
      dayNum: day,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
    });
  }

  // Next month leading days to complete full 35 or 42 grid
  const remainingCells = 42 - gridCells.length;
  for (let day = 1; day <= remainingCells; day++) {
    const nextMonthDate = new Date(year, month + 1, day);
    const dateStr = nextMonthDate.toISOString().split('T')[0];
    gridCells.push({
      dateStr,
      dayNum: day,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  // Filter events by category
  const filteredEvents = events.filter((evt) => {
    if (selectedCategory === 'all') return true;
    return evt.category === selectedCategory;
  });

  // Category visual color helper
  const getCategoryClass = (cat: EventCategory) => {
    switch (cat) {
      case 'deep-work':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100';
      case 'meeting':
        return 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100';
      case 'workout':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
      case 'learning':
        return 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100';
      case 'personal':
        return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100';
      case 'review':
        return 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getCategoryLabel = (cat: EventCategory) => {
    switch (cat) {
      case 'deep-work': return 'Deep Work';
      case 'meeting': return 'Meeting';
      case 'workout': return 'Workout';
      case 'learning': return 'Learning';
      case 'personal': return 'Personal';
      case 'review': return 'Review';
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Month Navigation & Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-md hover:bg-white text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToToday}
              className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-white rounded-md transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-md hover:bg-white text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap">
            {monthNames[month]} {year}
          </h2>
        </div>

        {/* View Switcher & Category Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="deep-work">Deep Work</option>
            <option value="meeting">Meetings</option>
            <option value="workout">Workouts</option>
            <option value="learning">Learning</option>
            <option value="personal">Personal</option>
            <option value="review">Reviews</option>
          </select>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setCalendarMode('month')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                calendarMode === 'month'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setCalendarMode('week')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                calendarMode === 'week'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setCalendarMode('agenda')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                calendarMode === 'agenda'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Agenda
            </button>
          </div>

          <button
            onClick={() => onAddEventClick()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer ml-auto sm:ml-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Event</span>
          </button>
        </div>
      </div>

      {/* Main Calendar Render Area */}
      {calendarMode === 'month' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          {/* Day of Week Header */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center py-2.5">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-xs font-semibold text-slate-600 tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Month 7-Column Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
            {gridCells.map((cell, idx) => {
              const dayEvents = filteredEvents.filter((e) => e.startDate === cell.dateStr);
              const dayReminders = reminders.filter((r) => r.dueDate === cell.dateStr);

              return (
                <div
                  key={`${cell.dateStr}-${idx}`}
                  onClick={() => setSelectedDayDetail(cell.dateStr)}
                  className={`min-h-[110px] p-2 transition-colors group cursor-pointer relative ${
                    cell.isCurrentMonth ? 'bg-white hover:bg-slate-50/80' : 'bg-slate-50/40 text-slate-400'
                  } ${cell.isToday ? 'bg-indigo-50/20' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-mono tabular-nums inline-flex items-center justify-center w-6 h-6 rounded-full ${
                        cell.isToday
                          ? 'bg-indigo-600 text-white font-bold'
                          : cell.isCurrentMonth
                          ? 'text-slate-700 font-medium'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {/* Quick Add button on hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddEventClick(cell.dateStr);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-opacity cursor-pointer"
                      title="Add event on this date"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Day Events stack */}
                  <div className="space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((evt) => (
                      <div
                        key={evt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(evt);
                        }}
                        className={`text-[11px] px-1.5 py-0.5 rounded border truncate cursor-pointer transition-colors ${getCategoryClass(
                          evt.category
                        )}`}
                        title={`${evt.startTime} - ${evt.title}`}
                      >
                        <span className="font-mono tabular-nums mr-1 opacity-75">{evt.startTime}</span>
                        <span>{evt.title}</span>
                      </div>
                    ))}

                    {/* Reminders indicator */}
                    {dayReminders.length > 0 && (
                      <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 pt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                        <span>{dayReminders.length} reminder{dayReminders.length > 1 ? 's' : ''}</span>
                      </div>
                    )}

                    {dayEvents.length > 2 && (
                      <div className="text-[10px] text-slate-500 font-mono pl-1">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week View */}
      {calendarMode === 'week' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-xs p-4">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-7 gap-3 mb-4">
              {Array.from({ length: 7 }).map((_, i) => {
                const startOfWeek = new Date(currentDate);
                const dayOffset = startOfWeek.getDay();
                startOfWeek.setDate(startOfWeek.getDate() - dayOffset + i);
                const dStr = startOfWeek.toISOString().split('T')[0];
                const isCurrent = dStr === todayStr;

                const dayEvts = filteredEvents.filter((e) => e.startDate === dStr);

                return (
                  <div key={dStr} className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase">
                        {daysOfWeek[i]}
                      </span>
                      <span
                        className={`text-xs font-mono tabular-nums w-6 h-6 flex items-center justify-center rounded-full ${
                          isCurrent ? 'bg-indigo-600 text-white font-bold' : 'text-slate-800'
                        }`}
                      >
                        {startOfWeek.getDate()}
                      </span>
                    </div>

                    <div className="space-y-1.5 min-h-[160px]">
                      {dayEvts.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic pt-2">No events</p>
                      ) : (
                        dayEvts.map((evt) => (
                          <div
                            key={evt.id}
                            onClick={() => setSelectedEvent(evt)}
                            className={`p-2 rounded-md border text-xs cursor-pointer transition-colors ${getCategoryClass(
                              evt.category
                            )}`}
                          >
                            <div className="font-mono tabular-nums text-[10px] opacity-80 mb-0.5">
                              {evt.startTime} - {evt.endTime}
                            </div>
                            <div className="font-medium truncate">{evt.title}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Agenda View */}
      {calendarMode === 'agenda' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Chronological Agenda List
            </span>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              {filteredEvents.length} scheduled events
            </span>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <CalendarIcon className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium">No events found in this category.</p>
              <button
                onClick={() => onAddEventClick()}
                className="mt-3 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Create First Event
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredEvents
                .slice()
                .sort((a, b) => `${a.startDate} ${a.startTime}`.localeCompare(`${b.startDate} ${b.startTime}`))
                .map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedEvent(evt)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-slate-100 border border-slate-200 rounded-lg p-2.5 text-center min-w-[70px] shrink-0">
                        <div className="text-[10px] font-semibold text-slate-500 uppercase">
                          {new Date(evt.startDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                        <div className="text-lg font-bold font-mono tabular-nums text-slate-900 leading-none mt-1">
                          {new Date(evt.startDate + 'T00:00:00').getDate()}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {evt.title}
                          </h4>
                        </div>

                        {evt.description && (
                          <p className="text-xs text-slate-500 line-clamp-1">{evt.description}</p>
                        )}

                        {/* Unboxed metadata with typographic separators */}
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono pt-1">
                          <span>{evt.startTime} - {evt.endTime}</span>
                          <span aria-hidden="true">·</span>
                          <span>{getCategoryLabel(evt.category)}</span>
                          {evt.locationOrLink && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="truncate max-w-[200px]">{evt.locationOrLink}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteEvent(evt.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                        title="Delete event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Selected Day Details Drawer / Modal */}
      {selectedDayDetail && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {new Date(selectedDayDetail + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </h3>
                <span className="text-xs text-slate-500 font-mono">Day schedule breakdown</span>
              </div>
              <button
                onClick={() => setSelectedDayDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Day Events */}
              <div>
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Events ({events.filter((e) => e.startDate === selectedDayDetail).length})
                </h4>
                {events.filter((e) => e.startDate === selectedDayDetail).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No events scheduled.</p>
                ) : (
                  <div className="space-y-2">
                    {events
                      .filter((e) => e.startDate === selectedDayDetail)
                      .map((evt) => (
                        <div
                          key={evt.id}
                          className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 flex items-center justify-between"
                        >
                          <div>
                            <div className="text-xs font-semibold text-slate-900">{evt.title}</div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                              {evt.startTime} - {evt.endTime} · {getCategoryLabel(evt.category)}
                            </div>
                          </div>
                          <button
                            onClick={() => onDeleteEvent(evt.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Day Reminders */}
              <div>
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Reminders Due ({reminders.filter((r) => r.dueDate === selectedDayDetail).length})
                </h4>
                {reminders.filter((r) => r.dueDate === selectedDayDetail).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No reminders due.</p>
                ) : (
                  <div className="space-y-2">
                    {reminders
                      .filter((r) => r.dueDate === selectedDayDetail)
                      .map((rem) => (
                        <div
                          key={rem.id}
                          onClick={() => onToggleReminder(rem.id)}
                          className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                            rem.completed
                              ? 'bg-emerald-50/50 border-emerald-200 text-slate-500'
                              : 'bg-white border-slate-200 text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {rem.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-400" />
                            )}
                            <span className={`text-xs ${rem.completed ? 'line-through text-slate-400' : 'font-medium'}`}>
                              {rem.title}
                            </span>
                          </div>
                          {rem.dueTime && (
                            <span className="text-[11px] font-mono text-slate-500">{rem.dueTime}</span>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between">
              <button
                onClick={() => {
                  setSelectedDayDetail(null);
                  onAddEventClick(selectedDayDetail);
                }}
                className="w-full py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                + Add Item for this Date
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                {getCategoryLabel(selectedEvent.category)}
              </span>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">{selectedEvent.title}</h3>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="font-mono tabular-nums">
                    {selectedEvent.startDate} · {selectedEvent.startTime} - {selectedEvent.endTime}
                  </span>
                </div>

                {selectedEvent.locationOrLink && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{selectedEvent.locationOrLink}</span>
                  </div>
                )}

                {selectedEvent.description && (
                  <div className="pt-2 border-t border-slate-100 flex items-start gap-2">
                    <AlignLeft className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <p className="text-slate-700 leading-relaxed">{selectedEvent.description}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  onDeleteEvent(selectedEvent.id);
                  setSelectedEvent(null);
                }}
                className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Event</span>
              </button>

              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

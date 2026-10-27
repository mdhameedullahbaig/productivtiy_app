import React from 'react';
import { ViewTab } from '../types';
import { Plus, LayoutDashboard, Calendar, BellRing, Coffee, Quote as QuoteIcon } from 'lucide-react';

interface NavigationProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  onOpenQuickAdd: () => void;
  unreadRemindersCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  onOpenQuickAdd,
  unreadRemindersCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-indigo-600 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            C
          </span>
          <span>Chronos</span>
        </button>

        {/* Zone 2: Nav links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'dashboard'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-slate-500" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onSelectTab('calendar')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'calendar'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>Calendar</span>
          </button>

          <button
            onClick={() => onSelectTab('reminders')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'reminders'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BellRing className="w-4 h-4 text-slate-500" />
            <span>Reminders</span>
            {unreadRemindersCount > 0 && (
              <span className="ml-1 text-[11px] font-mono tabular-nums bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded border border-indigo-200">
                {unreadRemindersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('breaks')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'breaks'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Coffee className="w-4 h-4 text-slate-500" />
            <span>Quick Breaks</span>
          </button>

          <button
            onClick={() => onSelectTab('quotes')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'quotes'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <QuoteIcon className="w-4 h-4 text-slate-500" />
            <span>Quotes</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenQuickAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors whitespace-nowrap shrink-0 shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Plus className="w-4 h-4" />
            <span>Quick Add</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar row for small screens */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200 px-2 py-1.5 bg-slate-50 overflow-x-auto">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
            currentTab === 'dashboard' ? 'text-indigo-600 font-semibold' : 'text-slate-600'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onSelectTab('calendar')}
          className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
            currentTab === 'calendar' ? 'text-indigo-600 font-semibold' : 'text-slate-600'
          }`}
        >
          Calendar
        </button>
        <button
          onClick={() => onSelectTab('reminders')}
          className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
            currentTab === 'reminders' ? 'text-indigo-600 font-semibold' : 'text-slate-600'
          }`}
        >
          Reminders {unreadRemindersCount > 0 && `(${unreadRemindersCount})`}
        </button>
        <button
          onClick={() => onSelectTab('breaks')}
          className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
            currentTab === 'breaks' ? 'text-indigo-600 font-semibold' : 'text-slate-600'
          }`}
        >
          Breaks
        </button>
        <button
          onClick={() => onSelectTab('quotes')}
          className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
            currentTab === 'quotes' ? 'text-indigo-600 font-semibold' : 'text-slate-600'
          }`}
        >
          Quotes
        </button>
      </div>
    </header>
  );
};

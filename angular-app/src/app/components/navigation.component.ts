import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductivityService } from '../services/productivity.service';
import { ViewTab } from '../models/productivity.models';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        <!-- Zone 1: Wordmark -->
        <button
          (click)="service.setTab('dashboard')"
          class="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-indigo-600 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <span class="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            C
          </span>
          <span>Chronos</span>
        </button>

        <!-- Zone 2: Navigation Links -->
        <nav class="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            (click)="service.setTab('dashboard')"
            [class.bg-slate-100]="service.currentTab() === 'dashboard'"
            [class.text-slate-900]="service.currentTab() === 'dashboard'"
            [class.font-semibold]="service.currentTab() === 'dashboard'"
            class="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
          >
            Dashboard
          </button>

          <button
            (click)="service.setTab('calendar')"
            [class.bg-slate-100]="service.currentTab() === 'calendar'"
            [class.text-slate-900]="service.currentTab() === 'calendar'"
            [class.font-semibold]="service.currentTab() === 'calendar'"
            class="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
          >
            Calendar
          </button>

          <button
            (click)="service.setTab('reminders')"
            [class.bg-slate-100]="service.currentTab() === 'reminders'"
            [class.text-slate-900]="service.currentTab() === 'reminders'"
            [class.font-semibold]="service.currentTab() === 'reminders'"
            class="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
          >
            <span>Reminders</span>
            <span *ngIf="service.unreadRemindersCount() > 0" class="text-[11px] font-mono tabular-nums bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded border border-indigo-200">
              {{ service.unreadRemindersCount() }}
            </span>
          </button>

          <button
            (click)="service.setTab('breaks')"
            [class.bg-slate-100]="service.currentTab() === 'breaks'"
            [class.text-slate-900]="service.currentTab() === 'breaks'"
            [class.font-semibold]="service.currentTab() === 'breaks'"
            class="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
          >
            Quick Breaks
          </button>

          <button
            (click)="service.setTab('quotes')"
            [class.bg-slate-100]="service.currentTab() === 'quotes'"
            [class.text-slate-900]="service.currentTab() === 'quotes'"
            [class.font-semibold]="service.currentTab() === 'quotes'"
            class="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
          >
            Quotes
          </button>

          <button
            (click)="service.setTab('diet')"
            [class.bg-slate-100]="service.currentTab() === 'diet'"
            [class.text-slate-900]="service.currentTab() === 'diet'"
            [class.font-semibold]="service.currentTab() === 'diet'"
            class="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
          >
            <span>🥗 Diet & Health</span>
          </button>
        </nav>

        <!-- Zone 3: Primary Action -->
        <div class="flex items-center gap-2 shrink-0">
          <button
            (click)="openQuickAdd.emit()"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
          >
            <span>+ Quick Add</span>
          </button>
        </div>
      </div>
    </header>
  `
})
export class NavigationComponent {
  service = inject(ProductivityService);
  openQuickAdd = output<void>();
}

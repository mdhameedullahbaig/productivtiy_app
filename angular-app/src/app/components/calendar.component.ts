import { Component, inject, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductivityService } from '../services/productivity.service';
import { CalendarEvent, EventCategory } from '../models/productivity.models';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Toolbar -->
      <div class="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            <button (click)="prevMonth()" class="px-2 py-1 text-xs hover:bg-white rounded font-bold cursor-pointer">‹</button>
            <button (click)="today()" class="px-2.5 py-1 text-xs hover:bg-white rounded font-medium cursor-pointer">Today</button>
            <button (click)="nextMonth()" class="px-2 py-1 text-xs hover:bg-white rounded font-bold cursor-pointer">›</button>
          </div>
          <h2 class="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap">
            {{ monthNames[currentDate().getMonth()] }} {{ currentDate().getFullYear() }}
          </h2>
        </div>

        <div class="flex items-center gap-2">
          <button
            (click)="openAddEvent.emit()"
            class="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 cursor-pointer shadow-xs"
          >
            + New Event
          </button>
        </div>
      </div>

      <!-- Month Grid -->
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div class="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center py-2.5">
          <div *ngFor="let day of daysOfWeek" class="text-xs font-semibold text-slate-600 tracking-wider">
            {{ day }}
          </div>
        </div>

        <div class="grid grid-cols-7 divide-x divide-y divide-slate-100">
          <div
            *ngFor="let cell of gridDays()"
            (click)="selectDate(cell.dateStr)"
            class="min-h-[105px] p-2 hover:bg-slate-50/80 transition-colors cursor-pointer"
            [class.bg-slate-50]="!cell.isCurrentMonth"
            [class.bg-indigo-50]="cell.isToday"
          >
            <div class="flex justify-between items-center mb-1">
              <span
                class="text-xs font-mono tabular-nums w-5 h-5 flex items-center justify-center rounded-full"
                [class.bg-indigo-600]="cell.isToday"
                [class.text-white]="cell.isToday"
                [class.text-slate-400]="!cell.isCurrentMonth"
                [class.text-slate-700]="cell.isCurrentMonth && !cell.isToday"
              >
                {{ cell.dayNum }}
              </span>
            </div>

            <!-- Events inside day -->
            <div class="space-y-1">
              <div
                *ngFor="let evt of getEventsForDate(cell.dateStr)"
                class="text-[11px] px-1.5 py-0.5 rounded border border-indigo-200 bg-indigo-50 text-indigo-700 truncate"
              >
                <span class="font-mono">{{ evt.startTime }}</span> {{ evt.title }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CalendarComponent {
  service = inject(ProductivityService);
  openAddEvent = output<void>();

  currentDate = signal(new Date());

  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  gridDays = computed(() => {
    const d = this.currentDate();
    const year = d.getFullYear();
    const month = d.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const todayStr = new Date().toISOString().split('T')[0];

    const cells = [];
    // Prev month padding
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const dateStr = new Date(year, month - 1, day).toISOString().split('T')[0];
      cells.push({ dayNum: day, dateStr, isCurrentMonth: false, isToday: dateStr === todayStr });
    }
    // Current month
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = new Date(year, month, i).toISOString().split('T')[0];
      cells.push({ dayNum: i, dateStr, isCurrentMonth: true, isToday: dateStr === todayStr });
    }
    // Next month padding
    const remaining = 35 - cells.length;
    for (let i = 1; i <= (remaining > 0 ? remaining : 42 - cells.length); i++) {
      const dateStr = new Date(year, month + 1, i).toISOString().split('T')[0];
      cells.push({ dayNum: i, dateStr, isCurrentMonth: false, isToday: dateStr === todayStr });
    }
    return cells;
  });

  prevMonth() {
    const d = this.currentDate();
    this.currentDate.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  nextMonth() {
    const d = this.currentDate();
    this.currentDate.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  today() {
    this.currentDate.set(new Date());
  }

  getEventsForDate(dateStr: string): CalendarEvent[] {
    return this.service.events().filter(e => e.startDate === dateStr);
  }

  selectDate(dateStr: string) {
    this.openAddEvent.emit();
  }
}

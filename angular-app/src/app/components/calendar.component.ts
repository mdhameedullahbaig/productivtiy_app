import { Component, inject, signal, computed, output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ProductivityService } from '../services/productivity.service';
import { CalendarEvent, FreeTimeSummary } from '../models/productivity.models';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],
  templateUrl: './calendar.component.html'
})
export class CalendarComponent {
  service = inject(ProductivityService);
  datePipe = inject(DatePipe);
  openAddEvent = output<string | void>();

  currentDate = signal(new Date());
  todayStr = new Date().toISOString().split('T')[0];

  selectedDateStr = signal<string>(this.todayStr);

  selectedDaySummary = computed<FreeTimeSummary>(() => {
    return this.service.getFreeTimeSummary(this.selectedDateStr());
  });

  selectedDayEvents = computed<CalendarEvent[]>(() => {
    return this.service.events().filter(e => this.service.isEventOnDate(e, this.selectedDateStr()));
  });

  selectedDateFormatted = computed(() => {
    const parts = this.selectedDateStr().split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    }
    return this.selectedDateStr();
  });

  selectedDateShort = computed(() => {
    const parts = this.selectedDateStr().split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return this.selectedDateStr();
  });

  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  currentMonthName = computed(() => this.monthNames[this.currentDate().getMonth()]);
  currentYear = computed(() => this.currentDate().getFullYear());

  daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  gridDays = computed(() => {
    const d = this.currentDate();
    const year = d.getFullYear();
    const month = d.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const todayStr = this.todayStr;

    const cells = [];
    // Prev month padding
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const dateStr = this.datePipe.transform(new Date(year, month - 1, day), 'yyyy-MM-dd')!;
      cells.push({ dayNum: day, dateStr, isCurrentMonth: false, isToday: dateStr === todayStr });
    }
    // Current month
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = this.datePipe.transform(new Date(year, month, i), 'yyyy-MM-dd')!;
      cells.push({ dayNum: i, dateStr, isCurrentMonth: true, isToday: dateStr === todayStr });
    }
    // Next month padding
    const remaining = 35 - cells.length;
    for (let i = 1; i <= (remaining > 0 ? remaining : 42 - cells.length); i++) {
      const dateStr = this.datePipe.transform(new Date(year, month + 1, i), 'yyyy-MM-dd')!;
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
    this.selectedDateStr.set(this.todayStr);
  }

  selectToday() {
    this.selectedDateStr.set(this.todayStr);
    this.currentDate.set(new Date());
  }

  selectDate(dateStr: string) {
    this.selectedDateStr.set(dateStr);
  }

  scheduleOnSelectedDate() {
    this.openAddEvent.emit(this.selectedDateStr());
  }

  getEventsForDate(dateStr: string): CalendarEvent[] {
    return this.service.events().filter(e => this.service.isEventOnDate(e, dateStr));
  }

  getCellFreeText(dateStr: string): string {
    const summary = this.service.getFreeTimeSummary(dateStr);
    const evts = this.getEventsForDate(dateStr);
    if (evts.length === 0) {
      return '17h free';
    }
    return `${summary.freeWorkdayFormatted} free`;
  }

  getCellFreeClass(dateStr: string): string {
    const summary = this.service.getFreeTimeSummary(dateStr);
    if (summary.status === 'open') {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    } else if (summary.status === 'moderate') {
      return 'bg-amber-50 text-amber-800 border-amber-200';
    } else {
      return 'bg-rose-50 text-rose-800 border-rose-200';
    }
  }

  getCellFreeTooltip(dateStr: string): string {
    const summary = this.service.getFreeTimeSummary(dateStr);
    return `${summary.freeWorkdayFormatted} free time between 8am and 8pm (${summary.freePercentageWorkday}% free, ${summary.busyFormatted} booked)`;
  }

  getStatusBadgeClass(status: 'open' | 'moderate' | 'busy'): string {
    if (status === 'open') return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (status === 'moderate') return 'bg-amber-50 text-amber-800 border-amber-200';
    return 'bg-rose-50 text-rose-800 border-rose-200';
  }

  getStatusDotClass(status: 'open' | 'moderate' | 'busy'): string {
    if (status === 'open') return 'bg-emerald-500';
    if (status === 'moderate') return 'bg-amber-500';
    return 'bg-rose-500';
  }

  getEventLeftPercent(evt: CalendarEvent): number {
    const parts = evt.startTime.split(':');
    const mins = (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);
    // Workday: 300 (5:00) to 1320 (22:00) = 1020 mins
    const clamped = Math.max(300, Math.min(1320, mins));
    return ((clamped - 300) / 1020) * 100;
  }

  getEventWidthPercent(evt: CalendarEvent): number {
    const sParts = evt.startTime.split(':');
    const sMins = (parseInt(sParts[0], 10) || 0) * 60 + (parseInt(sParts[1], 10) || 0);
    const eParts = evt.endTime.split(':');
    let eMins = (parseInt(eParts[0], 10) || 0) * 60 + (parseInt(eParts[1], 10) || 0);
    if (eMins <= sMins) eMins = sMins + 60;

    const startClamped = Math.max(300, Math.min(1320, sMins));
    const endClamped = Math.max(300, Math.min(1320, eMins));
    const dur = Math.max(10, endClamped - startClamped);
    return (dur / 1020) * 100;
  }

  selectedEvent = signal<CalendarEvent | null>(null);

  selectEvent(evt: CalendarEvent, $event: Event) {
    $event.stopPropagation();
    this.selectedEvent.set(evt);
  }

  deleteEvent(id: string, $event: Event) {
    $event.stopPropagation();
    this.service.deleteEvent(id);
    if (this.selectedEvent()?.id === id) {
      this.selectedEvent.set(null);
    }
  }

  deleteSelectedEvent() {
    const evt = this.selectedEvent();
    if (evt) {
      this.service.deleteEvent(evt.id);
      this.selectedEvent.set(null);
    }
  }

  isNextEvent(evt: CalendarEvent): boolean {
    return this.service.nextEvent()?.event?.id === evt.id;
  }

  getCurrentTimeLeftPercent(): number | null {
    const now = this.service.currentTime();
    const mins = now.getHours() * 60 + now.getMinutes();
    if (mins < 300 || mins > 1320) return null;
    return Math.round(((mins - 300) / 1020) * 1000) / 10;
  }
}

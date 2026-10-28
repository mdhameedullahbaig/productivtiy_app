import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductivityService } from '../services/productivity.service';
import { AudioService } from '../services/audio.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Welcome header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <span class="text-xs font-semibold text-indigo-600 uppercase tracking-wider font-mono">
            {{ todayFormatted }}
          </span>
          <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            Daily Focus & Execution Center
          </h1>
        </div>

        <div class="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
          <div class="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
            ⚡
          </div>
          <div>
            <div class="text-[10px] font-mono text-emerald-800 uppercase font-semibold">Today's Free Time</div>
            <div class="text-sm font-bold text-emerald-950 font-mono">
              {{ todaySummary().freeWorkdayFormatted }} Free
              <span class="text-xs font-normal text-emerald-700">({{ todaySummary().freePercentageWorkday }}% open)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 4 Metrics Row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <div class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Deep Focus Time</div>
          <div class="text-2xl sm:text-3xl font-mono tabular-nums font-bold text-slate-900">
            {{ service.stats().focusMinutesToday }} <span class="text-xs font-normal text-slate-500">min</span>
          </div>
          <div class="text-[11px] text-slate-500 font-mono mt-1">Logged today</div>
        </div>

        <div class="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <div class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Tasks Completed</div>
          <div class="text-2xl sm:text-3xl font-mono tabular-nums font-bold text-slate-900">
            {{ service.stats().remindersCompletedToday }}
          </div>
          <div class="text-[11px] text-slate-500 font-mono mt-1">Finished today</div>
        </div>

        <div class="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <div class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Breaks Taken</div>
          <div class="text-2xl sm:text-3xl font-mono tabular-nums font-bold text-slate-900">
            {{ service.stats().breaksCompletedToday }}
          </div>
          <div class="text-[11px] text-slate-500 font-mono mt-1">Eye & stretch sessions</div>
        </div>

        <div class="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <div class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Active Streak</div>
          <div class="text-2xl sm:text-3xl font-mono tabular-nums font-bold text-slate-900">
            {{ service.stats().currentStreakDays }} <span class="text-xs font-normal text-slate-500">days</span>
          </div>
          <div class="text-[11px] text-slate-500 font-mono mt-1">Consistency</div>
        </div>
      </div>

      <!-- Quote Spotlight -->
      <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div class="space-y-2 flex-1">
            <div class="flex flex-wrap items-center gap-2 text-xs font-mono text-indigo-600">
              <span class="font-bold">Mindset Anchor</span>
              <span aria-hidden="true">·</span>
              <span>{{ service.quoteOfTheDay().category }}</span>
              <span aria-hidden="true">·</span>
              <span class="text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                Rotates in {{ service.quoteCountdownFormatted() }}
              </span>
            </div>
            <p class="text-base sm:text-lg font-medium text-slate-900 leading-relaxed">
              "{{ service.quoteOfTheDay().text }}"
            </p>
            <div class="text-xs text-slate-500 font-mono">
              — {{ service.quoteOfTheDay().author }}
            </div>
          </div>
        </div>

        <!-- Action Bar for Quote -->
        <div class="flex flex-wrap items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-100">
          <div class="flex flex-wrap items-center gap-2">
            <button
              (click)="speakQuote()"
              class="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer flex items-center gap-1.5"
            >
              <span>🔊 Listen Aloud</span>
            </button>

            <button
              (click)="copyQuote()"
              class="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <span>{{ isCopied() ? '✓ Copied to Clipboard!' : '📋 Copy Quote' }}</span>
            </button>

            <button
              (click)="service.rotateQuote()"
              class="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer flex items-center gap-1.5"
              title="Rotate to next quote"
            >
              <span>↻ Next Quote</span>
            </button>
          </div>

          <button
            (click)="service.setTab('quotes')"
            class="px-3.5 py-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg cursor-pointer flex items-center gap-1"
          >
            <span>Explore Quotes Library →</span>
          </button>
        </div>
      </div>

      <!-- Next Event Spotlight Card (High Visibility & Immaculate Alignment) -->
      @if (service.nextEvent(); as next) {
        <section
          class="relative overflow-hidden rounded-2xl border p-5 sm:p-6 shadow-sm transition-all duration-300"
          [class]="next.isHappeningNow 
            ? 'bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white border-emerald-300 ring-4 ring-emerald-100/60' 
            : (next.urgency === 'imminent' 
                ? 'bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-white border-amber-300 ring-4 ring-amber-100/60' 
                : 'bg-gradient-to-br from-indigo-50/90 via-purple-50/40 to-white border-indigo-300 ring-4 ring-indigo-100/60')"
        >
          <!-- Subtle decorative radial background glow -->
          <div
            class="absolute -right-6 -bottom-6 w-48 h-48 rounded-full blur-2xl pointer-events-none opacity-30"
            [class]="next.isHappeningNow ? 'bg-emerald-400' : (next.urgency === 'imminent' ? 'bg-amber-400' : 'bg-indigo-400')"
          ></div>

          <div class="relative flex flex-col md:flex-row md:items-start justify-between gap-5">
            <!-- Left Content: Icon + Details -->
            <div class="flex items-start gap-4 min-w-0 flex-1">
              <!-- Spotlight Icon Badge -->
              <div
                class="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl shrink-0 shadow-xs mt-0.5"
                [class]="next.isHappeningNow 
                  ? 'bg-emerald-600 text-white' 
                  : (next.urgency === 'imminent' ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white')"
              >
                ⚡
              </div>

              <!-- Main Details Stack -->
              <div class="space-y-2 min-w-0 flex-1">
                <!-- Row 1: Badges & Status Pills (Uniform height, radius, and alignment) -->
                <div class="flex items-center gap-2 flex-wrap">
                  <!-- Live Attention Status Pill -->
                  <span
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold font-mono tracking-wider shadow-2xs uppercase text-white shrink-0"
                    [class]="next.isHappeningNow 
                      ? 'bg-emerald-600' 
                      : (next.urgency === 'imminent' ? 'bg-amber-600' : 'bg-indigo-600')"
                  >
                    <span class="relative flex h-2 w-2">
                      <span
                        class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                        [class]="next.isHappeningNow ? 'bg-emerald-200' : (next.urgency === 'imminent' ? 'bg-amber-200' : 'bg-indigo-200')"
                      ></span>
                      <span class="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                    <span>{{ next.isHappeningNow ? 'Active Now' : 'Next Up' }}</span>
                  </span>

                  <!-- Live Countdown Pill -->
                  <span
                    class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-bold rounded-full border shadow-2xs shrink-0"
                    [class]="next.isHappeningNow 
                      ? 'bg-emerald-100/90 text-emerald-950 border-emerald-300' 
                      : (next.urgency === 'imminent' 
                          ? 'bg-amber-100/90 text-amber-950 border-amber-300 animate-pulse' 
                          : 'bg-indigo-100/90 text-indigo-950 border-indigo-200')"
                  >
                    <span aria-hidden="true">⏳</span>
                    <span>{{ next.timeUntilFormatted }}</span>
                  </span>

                  <!-- Category Pill -->
                  <span class="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border bg-white/90 text-slate-700 border-slate-200/90 shadow-2xs capitalize shrink-0">
                    {{ next.event.category }}
                  </span>

                  <!-- Frequency Pill (if recurring) -->
                  @if (next.event.frequency && next.event.frequency !== 'none') {
                    <span class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-semibold rounded-full bg-purple-100/90 text-purple-900 border border-purple-200 shadow-2xs shrink-0">
                      <span aria-hidden="true">🔁</span>
                      <span>{{ next.event.frequency }}</span>
                    </span>
                  }
                </div>

                <!-- Row 2: Event Title -->
                <h2 class="text-lg sm:text-xl font-bold tracking-tight text-slate-950 leading-snug">
                  {{ next.event.title }}
                </h2>

                <!-- Row 3: Event Timing, Date & Location (Clean icons and dividers) -->
                <div class="flex items-center gap-2.5 text-xs text-slate-600 font-mono flex-wrap">
                  <span class="inline-flex items-center gap-1.5 font-bold text-slate-900">
                    <span aria-hidden="true">🕒</span>
                    <span>{{ next.event.startTime }} – {{ next.event.endTime }}</span>
                  </span>

                  @if (next.event.startDate) {
                    <span class="text-slate-300 font-sans" aria-hidden="true">•</span>
                    <span class="inline-flex items-center gap-1.5 text-slate-600">
                      <span aria-hidden="true">📅</span>
                      <span>{{ next.event.startDate }}</span>
                    </span>
                  }

                  @if (next.event.locationOrLink) {
                    <span class="text-slate-300 font-sans" aria-hidden="true">•</span>
                    <span class="inline-flex items-center gap-1.5 text-slate-600 truncate max-w-xs">
                      <span aria-hidden="true">📍</span>
                      <span class="truncate">{{ next.event.locationOrLink }}</span>
                    </span>
                  }
                </div>

                <!-- Row 4: Description (if provided) -->
                @if (next.event.description) {
                  <p class="text-xs text-slate-600 leading-relaxed max-w-2xl pt-0.5">
                    {{ next.event.description }}
                  </p>
                }
              </div>
            </div>

            <!-- Right Action: Cleanly top-aligned on desktop, full-width on mobile -->
            <div class="flex items-center gap-2 shrink-0 md:pt-1 self-start md:self-start">
              <button
                type="button"
                (click)="service.setTab('calendar')"
                class="w-full md:w-auto px-4 py-2.5 text-xs font-semibold rounded-xl text-white shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                [class]="next.isHappeningNow 
                  ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800' 
                  : (next.urgency === 'imminent' ? 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800' : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800')"
              >
                <span>View on Calendar →</span>
              </button>
            </div>
          </div>
        </section>
      }

      <!-- 2 Columns: Scheduled Events & Active Reminders -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Events column -->
        <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="text-sm font-bold text-slate-900">Today's Events</h3>
              <span class="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200">
                {{ todaySummary().freeWorkdayFormatted }} Free
              </span>
              <span
                class="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border bg-slate-50 text-slate-600 border-slate-200 flex items-center gap-1 shadow-2xs"
                title="Non-recurring past events are automatically removed"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Auto-clean</span>
              </span>
            </div>
            <button (click)="service.setTab('calendar')" class="text-xs text-indigo-600 hover:underline cursor-pointer">
              View Calendar →
            </button>
          </div>

          @if (todayEvents().length === 0) {
            <div class="py-6 text-center text-xs text-slate-400">
              No events scheduled today.
            </div>
          } @else {
            <div class="space-y-2.5">
              @for (evt of todayEvents(); track evt.id) {
                <div
                  class="p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 shadow-2xs"
                  [class]="isNextEvent(evt.id) 
                    ? 'border-indigo-400 bg-indigo-50/80 ring-2 ring-indigo-200/80 shadow-xs' 
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50'"
                >
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2 flex-wrap">
                      <!-- Next Up attention badge -->
                      @if (isNextEvent(evt.id)) {
                        <span class="text-[10px] bg-indigo-600 text-white font-bold font-mono px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shrink-0 shadow-xs">
                          <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                          <span>Next Up</span>
                        </span>
                      }

                      <span class="text-xs font-semibold text-slate-900 truncate">{{ evt.title }}</span>

                      <span
                        class="text-[11px] font-mono tabular-nums shrink-0"
                        [class]="isNextEvent(evt.id) ? 'font-bold text-indigo-700' : 'text-slate-500'"
                      >
                        {{ evt.startTime }} - {{ evt.endTime }}
                      </span>

                      @if (evt.frequency && evt.frequency !== 'none') {
                        <span class="text-[10px] bg-purple-100 text-purple-800 font-mono px-2 py-0.5 rounded-full font-semibold uppercase shrink-0 border border-purple-200">
                          🔁 {{ evt.frequency }}
                        </span>
                      }
                    </div>
                    <div class="text-[11px] text-slate-400 font-mono mt-0.5 capitalize">{{ evt.category }}</div>
                  </div>

                  <button
                    type="button"
                    (click)="deleteEvent(evt.id)"
                    class="text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded text-xs transition-colors cursor-pointer shrink-0 font-medium"
                    title="Delete event"
                  >
                    🗑 Delete
                  </button>
                </div>
              }
            </div>
          }
        </div>

        <!-- Reminders column -->
        <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 class="text-sm font-bold text-slate-900">Active Reminders</h3>
            <button (click)="service.setTab('reminders')" class="text-xs text-indigo-600 hover:underline cursor-pointer">
              All Reminders →
            </button>
          </div>
          @if (todayReminders().length === 0) {
            <div class="py-6 text-center text-xs text-slate-400">
              No reminders due today.
            </div>
          } @else {
            <div class="space-y-2">
              @for (rem of todayReminders(); track rem.id) {
                <div class="p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-3 bg-white">
                  <div class="flex items-center gap-2 min-w-0">
                    <button (click)="toggleReminder(rem.id)" class="text-slate-400 hover:text-indigo-600 cursor-pointer shrink-0">
                      @if (rem.completed) {
                        <span class="text-emerald-600 font-bold">✓</span>
                      } @else {
                        <span>○</span>
                      }
                    </button>
                    <div class="min-w-0">
                      <span class="text-xs font-medium block truncate" [class.line-through]="rem.completed">{{ rem.title }}</span>
                      @if (rem.dueTime) {
                        <span class="text-[10px] font-mono text-slate-400">Due {{ rem.dueTime }}</span>
                      }
                    </div>
                  </div>
                  <button
                    type="button"
                    (click)="deleteReminder(rem.id)"
                    class="text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded text-xs transition-colors cursor-pointer shrink-0 font-medium"
                    title="Delete reminder"
                  >
                    🗑 Delete
                  </button>
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Quick Launch Break Bar -->
      <section class="bg-indigo-50/80 border border-indigo-200/80 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div class="flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs text-lg">
            ☕
          </div>
          <div>
            <h4 class="text-sm font-bold text-indigo-950">Feeling Mental Friction or Eye Strain?</h4>
            <p class="text-xs text-indigo-700 mt-0.5">
              Take a 20-second eye reset, a guided 2-minute desk stretch, or start a 25m Pomodoro focus sprint.
            </p>
          </div>
        </div>

        <button
          type="button"
          (click)="service.setTab('breaks')"
          class="px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap self-start sm:self-auto"
        >
          Open Quick Breaks →
        </button>
      </section>
    </div>
  `
})
export class DashboardComponent {
  service = inject(ProductivityService);
  audio = inject(AudioService);

  todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  todayDateStr = new Date().toISOString().split('T')[0];

  todayEvents = computed(() => this.service.events().filter(e => this.service.isEventOnDate(e, this.todayDateStr)));
  todaySummary = computed(() => this.service.getFreeTimeSummary(this.todayDateStr));
  todayReminders = computed(() => this.service.reminders().filter(r => r.dueDate === this.todayDateStr));

  isCopied = signal(false);

  speakQuote() {
    const q = this.service.quoteOfTheDay();
    this.audio.speakText(`"${q.text}" by ${q.author}`);
  }

  copyQuote() {
    const q = this.service.quoteOfTheDay();
    navigator.clipboard.writeText(`"${q.text}" — ${q.author}`);
    this.isCopied.set(true);
    setTimeout(() => this.isCopied.set(false), 2000);
  }

  toggleReminder(id: string) {
    this.audio.playSuccessChime();
    this.service.toggleReminder(id);
  }

  deleteEvent(id: string) {
    this.service.deleteEvent(id);
  }

  deleteReminder(id: string) {
    this.service.deleteReminder(id);
  }

  isNextEvent(evtId: string): boolean {
    return this.service.nextEvent()?.event?.id === evtId;
  }
}

import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductivityService } from '../services/productivity.service';
import { AudioService } from '../services/audio.service';
import { MealTiming, HealthExpertRecommendation } from '../models/productivity.models';

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
            <div class="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <div class="flex items-center gap-2">
                <span
                  class="px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[11px]"
                  [class]="service.quoteOfTheDay().category === 'Discipline' 
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                    : (service.quoteOfTheDay().category === 'Time Mastery' 
                        ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                        : 'bg-indigo-100 text-indigo-900 border border-indigo-300')"
                >
                  @if (service.quoteOfTheDay().category === 'Discipline') { ⚔️ }
                  @else if (service.quoteOfTheDay().category === 'Time Mastery') { ⏳ }
                  {{ service.quoteOfTheDay().category }}
                </span>
                <span class="text-slate-300" aria-hidden="true">·</span>
                <span class="text-slate-500 font-medium">Mindset Anchor</span>
              </div>

              <div class="flex items-center gap-2">
                <span class="text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-mono">
                  Rotates in {{ service.quoteCountdownFormatted() }}
                </span>
                <button
                  type="button"
                  (click)="toggleFavoriteQuote(service.quoteOfTheDay().id)"
                  class="p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer text-sm"
                  [class]="service.quoteOfTheDay().favorite ? 'text-amber-500 font-bold' : 'text-slate-300 hover:text-amber-400'"
                  [title]="service.quoteOfTheDay().favorite ? 'Favorited' : 'Add to favorites'"
                >
                  <span>{{ service.quoteOfTheDay().favorite ? '★' : '☆' }}</span>
                </button>
              </div>
            </div>

            <p class="text-base sm:text-lg font-medium text-slate-900 leading-relaxed font-serif pt-1">
              "{{ service.quoteOfTheDay().text }}"
            </p>

            <div class="text-xs text-slate-600 font-mono font-semibold">
              — {{ service.quoteOfTheDay().author }}
            </div>

            @if (service.quoteOfTheDay().reflectionPrompt) {
              <div class="mt-3 p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl flex items-start gap-2.5">
                <span class="text-sm shrink-0">💡</span>
                <div>
                  <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-900 block">
                    Daily Reflection
                  </span>
                  <p class="text-xs text-amber-950 font-medium leading-relaxed">
                    {{ service.quoteOfTheDay().reflectionPrompt }}
                  </p>
                </div>
              </div>
            }
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

      <!-- Top Productivity Tip of the Day Spotlight -->
      @if (service.topProductivityTip(); as tip) {
        <section class="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-2xl p-6 shadow-md border border-indigo-800/60 relative overflow-hidden">
          <!-- Subtle decorative glow -->
          <div class="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div class="relative space-y-4">
            <!-- Row 1: Badges & Controls -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-amber-400 text-slate-950 shadow-2xs">
                  <span>💡 TOP PRODUCTIVITY STRATEGY</span>
                </span>
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-white/10 text-indigo-200 border border-white/10">
                  {{ tip.category }}
                </span>
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {{ tip.impactRating }}
                </span>
              </div>

              <!-- Action Controls -->
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="speakTip()"
                  class="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  title="Listen to this productivity technique"
                >
                  <span>🔊 Listen</span>
                </button>
                <button
                  type="button"
                  (click)="copyTip()"
                  class="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  title="Copy strategy to clipboard"
                >
                  <span>{{ isTipCopied() ? '✓ Copied' : '📋 Copy' }}</span>
                </button>
                <button
                  type="button"
                  (click)="service.rotateProductivityTip()"
                  class="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  title="Cycle to next top productivity technique"
                >
                  <span>↻ Next Tip</span>
                </button>
              </div>
            </div>

            <!-- Row 2: Title & Subtitle -->
            <div>
              <div class="flex items-center gap-3">
                <span class="text-3xl shrink-0">{{ tip.icon }}</span>
                <div>
                  <h2 class="text-lg sm:text-xl font-bold tracking-tight text-white leading-snug">
                    {{ tip.title }}
                  </h2>
                  <p class="text-xs sm:text-sm text-indigo-200 mt-0.5 leading-relaxed">
                    {{ tip.subtitle }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Row 3: Mechanism & Actionable Protocol Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div class="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-1">
                <span class="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-300 block">
                  Scientific Mechanism
                </span>
                <p class="text-xs text-indigo-100/90 leading-relaxed">
                  {{ tip.mechanism }}
                </p>
                <div class="text-[10px] text-indigo-300 font-mono pt-1">
                  Research: {{ tip.source }}
                </div>
              </div>

              <div class="md:col-span-2 bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] uppercase font-mono font-bold tracking-wider text-emerald-400">
                    Execution Steps
                  </span>
                  <span class="text-[10px] font-mono text-indigo-300">
                    Time Investment: {{ tip.timeInvestment }}
                  </span>
                </div>
                <div class="space-y-1.5">
                  @for (step of tip.actionableSteps; track step) {
                    <div class="flex items-start gap-2 text-xs text-slate-200">
                      <span class="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center text-[10px] font-mono shrink-0 font-bold mt-0.5">
                        {{ $index + 1 }}
                      </span>
                      <span class="leading-relaxed">{{ step }}</span>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        </section>
      }

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

      <!-- Diet, Timings, Hydration & Health Recommendations Section -->
      <section class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-bold shadow-2xs">
                🥗
              </span>
              <h3 class="text-base font-bold text-slate-900">
                Diet, Nutrition Timings & Hydration Intelligence
              </h3>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">
              Circadian feeding alignment and cellular hydration protocols for sustained executive focus.
            </p>
          </div>

          <button
            type="button"
            (click)="service.setTab('diet')"
            class="px-3.5 py-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Explore Full Diet & Timings Protocol →</span>
          </button>
        </div>

        <!-- 3-Card Responsive Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Card 1: Active Nutrition Timing Window -->
          <div class="bg-slate-50 border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div class="space-y-2">
              <div class="flex items-center justify-between gap-2">
                <span
                  class="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  [class]="service.currentMealStatus().status === 'active' 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-indigo-50 text-indigo-800 border border-indigo-200'"
                >
                  {{ service.currentMealStatus().status === 'active' ? 'Active Window' : 'Next Feeding' }}
                </span>
                <span class="text-xs font-mono font-bold text-slate-700">
                  {{ currentMealTimeRange() }}
                </span>
              </div>

              <div class="flex items-start gap-2.5">
                <span class="text-2xl shrink-0">
                  {{ currentMealIcon() }}
                </span>
                <div class="min-w-0">
                  <h4 class="text-sm font-bold text-slate-900 truncate">
                    {{ currentMealName() }}
                  </h4>
                  <div class="text-[11px] font-mono font-semibold text-emerald-700 mt-0.5">
                    {{ service.currentMealStatus().countdownText }}
                  </div>
                </div>
              </div>

              <!-- Recommended Foods Quick Pills -->
              @if (activeMeal(); as m) {
                <div class="text-[11px] text-slate-600 bg-white rounded-lg p-2.5 border border-slate-200 space-y-1">
                  <span class="font-semibold text-slate-700 block text-[10px] uppercase font-mono">Nutrient Focus:</span>
                  <div class="flex flex-wrap gap-1">
                    @for (food of activeMealFoods(); track food) {
                      <span class="text-[10px] bg-emerald-50 text-emerald-900 px-1.5 py-0.5 rounded font-medium">
                        {{ food }}
                      </span>
                    }
                  </div>
                </div>
              } @else {
                @if (nextMeal(); as nm) {
                  <div class="text-[11px] text-slate-600 bg-white rounded-lg p-2.5 border border-slate-200 space-y-1">
                    <span class="font-semibold text-slate-700 block text-[10px] uppercase font-mono">Upcoming Fuel:</span>
                    <div class="flex flex-wrap gap-1">
                      @for (food of nextMealFoods(); track food) {
                        <span class="text-[10px] bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-medium">
                          {{ food }}
                        </span>
                      }
                    </div>
                  </div>
                }
              }
            </div>

            <!-- Card footer action -->
            @if (service.currentMealStatus().activeMeal; as m) {
              <button
                type="button"
                (click)="toggleActiveMeal(m.id)"
                class="w-full py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                [class]="isMealConsumed(m.id) 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'"
              >
                <span>{{ isMealConsumed(m.id) ? '✓ Marked Consumed' : '○ Mark As Consumed' }}</span>
              </button>
            } @else {
              <div class="text-[10px] font-mono text-slate-400 text-center py-1">
                Currently in restorative digestion interval
              </div>
            }
          </div>

          <!-- Card 2: Interactive Hydration Tracker -->
          <div class="bg-sky-50/60 border border-sky-100 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-200">
                  Hydration Target
                </span>
                <span class="text-xs font-mono font-bold text-sky-950">
                  {{ service.stats().waterGlasses * 250 }}ml / 2,000ml
                </span>
              </div>

              <div class="flex items-baseline justify-between pt-1">
                <div>
                  <div class="text-2xl font-bold font-mono text-sky-950">
                    {{ service.stats().waterGlasses }} <span class="text-xs font-normal text-sky-700">/ {{ service.targetWaterGlasses() }} glasses</span>
                  </div>
                  <div class="text-[11px] text-sky-800 font-mono mt-0.5">
                    {{ hydrationPercentage() }}% of daily cellular baseline
                  </div>
                </div>
                <div class="text-3xl">💧</div>
              </div>

              <!-- Progress bar -->
              <div class="w-full bg-sky-100 h-2.5 rounded-full overflow-hidden border border-sky-200">
                <div
                  class="bg-sky-500 h-full rounded-full transition-all duration-300"
                  [style.width]="hydrationPercentage() + '%'"
                ></div>
              </div>
            </div>

            <!-- Quick Water Actions -->
            <div class="flex items-center gap-2 pt-1">
              <button
                type="button"
                (click)="logWater()"
                class="flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 transition-colors cursor-pointer shadow-2xs flex items-center justify-center gap-1"
              >
                <span>+1 Glass</span>
              </button>
              <button
                type="button"
                (click)="decrementWater()"
                class="py-1.5 px-2.5 text-xs font-medium rounded-lg border border-sky-200 bg-white hover:bg-sky-50 text-sky-800 transition-colors cursor-pointer"
                title="Subtract 1 glass"
              >
                <span>-1</span>
              </button>
            </div>
          </div>

          <!-- Card 3: Health Expert Recommendation Spotlight -->
          @if (featuredExpertRec(); as rec) {
            <div class="bg-slate-50 border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div class="space-y-2">
                <div class="flex items-center justify-between gap-1">
                  <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-800 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    {{ rec.category }}
                  </span>
                  <span class="text-[10px] font-mono font-bold text-emerald-800">
                    {{ rec.impactBadge }}
                  </span>
                </div>

                <div>
                  <h4 class="text-xs font-bold text-slate-900 leading-snug">
                    {{ rec.title }}
                  </h4>
                  <div class="text-[10px] font-mono text-slate-500 mt-0.5">
                    {{ rec.expert }} · {{ getInstitution(rec) }}
                  </div>
                </div>

                <div class="p-2.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed shadow-2xs">
                  “{{ rec.keyRule }}”
                </div>
              </div>

              <div class="flex items-center justify-between pt-1">
                <button
                  type="button"
                  (click)="listenToExpert(rec)"
                  class="text-xs font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                >
                  <span>🔊 Listen</span>
                </button>
                <button
                  type="button"
                  (click)="service.setTab('diet')"
                  class="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  All 5 Protocols →
                </button>
              </div>
            </div>
          }
        </div>
      </section>

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
  isTipCopied = signal(false);

  hydrationPercentage = computed(() => {
    const current = this.service.stats().waterGlasses;
    const target = this.service.targetWaterGlasses();
    return Math.min(100, Math.round((current / target) * 100));
  });

  featuredExpertRec = computed(() => {
    const list = this.service.healthExpertRecommendations();
    return list && list.length > 0 ? list[0] : null;
  });

  activeMeal = computed<MealTiming | null>(() => this.service.currentMealStatus().activeMeal);
  nextMeal = computed<MealTiming | null>(() => this.service.currentMealStatus().nextMeal);
  activeMealFoods = computed<string[]>(() => this.activeMeal()?.idealFoods.slice(0, 2) || []);
  nextMealFoods = computed<string[]>(() => this.nextMeal()?.idealFoods.slice(0, 2) || []);

  currentMealTimeRange = computed<string>(() => {
    return this.activeMeal()?.timeRange || this.nextMeal()?.timeRange || '';
  });

  currentMealIcon = computed<string>(() => {
    return this.activeMeal()?.icon || this.nextMeal()?.icon || '🥗';
  });

  currentMealName = computed<string>(() => {
    return this.activeMeal()?.name || this.nextMeal()?.name || 'Upcoming Window';
  });

  getInstitution(rec: HealthExpertRecommendation | null): string {
    if (!rec) return '';
    return rec.roleAndInstitution.split(',')[0] || rec.roleAndInstitution;
  }

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

  toggleFavoriteQuote(id: string) {
    this.service.toggleFavoriteQuote(id);
  }

  speakTip() {
    const tip = this.service.topProductivityTip();
    this.audio.speakText(`${tip.title}. ${tip.subtitle}. Strategy: ${tip.mechanism}. Execution: ${tip.actionableSteps.join('. ')}`);
  }

  copyTip() {
    const tip = this.service.topProductivityTip();
    const text = `${tip.title}\n${tip.subtitle}\n\nMechanism:\n${tip.mechanism}\n\nExecution:\n${tip.actionableSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nSource: ${tip.source}`;
    navigator.clipboard.writeText(text);
    this.isTipCopied.set(true);
    setTimeout(() => this.isTipCopied.set(false), 2000);
  }

  listenToExpert(rec: HealthExpertRecommendation) {
    this.audio.speakText(`${rec.title}. Protocol by ${rec.expert}. ${rec.keyRule}. ${rec.actionableProtocol}`);
  }

  logWater() {
    this.audio.playTick();
    this.service.logHydration();
  }

  decrementWater() {
    this.service.decrementHydration();
  }

  isMealConsumed(mealId: string): boolean {
    return !!this.service.consumedMeals()[mealId];
  }

  toggleActiveMeal(mealId: string) {
    this.audio.playSuccessChime();
    this.service.toggleMealConsumed(mealId);
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

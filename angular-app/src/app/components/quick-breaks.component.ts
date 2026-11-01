import { Component, inject, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductivityService } from '../services/productivity.service';
import { AudioService } from '../services/audio.service';

export interface FocusStrategy {
  id: string;
  name: string;
  shortName: string;
  focusMinutes: number;
  breakMinutes: number;
  badge: string;
  icon: string;
  description: string;
  scienceBasis: string;
  bestFor: string;
  eyeCheckIntervalMinutes: number;
}

export const FOCUS_STRATEGIES: FocusStrategy[] = [
  {
    id: 'pomodoro',
    name: 'Classic Pomodoro',
    shortName: '25m / 5m',
    focusMinutes: 25,
    breakMinutes: 5,
    badge: 'Standard Flow',
    icon: '🍅',
    description: 'Sprint through high-resistance tasks with zero distraction, followed by a crisp mental disengagement.',
    scienceBasis: 'Francesco Cirillo Protocol: Short, bound sprints prevent decision fatigue and lower psychological activation barrier.',
    bestFor: 'Task backlog clearance, administrative tasks, and overcoming procrastination.',
    eyeCheckIntervalMinutes: 20
  },
  {
    id: 'flow-50',
    name: '50/10 Sustainable Flow',
    shortName: '50m / 10m',
    focusMinutes: 50,
    breakMinutes: 10,
    badge: 'Cognitive Depth',
    icon: '⚡',
    description: 'Deep uninterrupted focus for complex problem solving, without crossing into neurotransmitter exhaustion.',
    scienceBasis: 'Dr. Gloria Mark Attention Studies: 50 minutes allows reaching true flow state (15m ramp + 35m peak performance).',
    bestFor: 'Deep coding, architecture design, drafting essays, and strategic analysis.',
    eyeCheckIntervalMinutes: 20
  },
  {
    id: 'ultradian-90',
    name: '90m Ultradian Peak',
    shortName: '90m / 20m',
    focusMinutes: 90,
    breakMinutes: 20,
    badge: 'Biological Peak',
    icon: '🧠',
    description: 'Synchronized with your brain’s biological Basic Rest-Activity Cycle (BRAC) for maximum mental synthesis.',
    scienceBasis: 'Dr. Nathaniel Kleitman Research: Human alertness cycles through 90-minute neural peaks followed by 15-20m natural troughs.',
    bestFor: 'Complex creative breakthroughs, deep research papers, mathematical modeling, and major deliverables.',
    eyeCheckIntervalMinutes: 20
  },
  {
    id: 'sprint-15',
    name: '15m Quick Gateway Sprint',
    shortName: '15m / 3m',
    focusMinutes: 15,
    breakMinutes: 3,
    badge: 'Momentum Builder',
    icon: '🚀',
    description: 'The anti-procrastination trigger. Lower the cognitive barrier so low that starting becomes effortless.',
    scienceBasis: 'David Allen GTD Gateway Principle: 15 minutes creates immediate dopamine momentum that naturally extends into longer flow.',
    bestFor: 'High-friction tasks, dread tasks, morning warm-ups, and inbox zero.',
    eyeCheckIntervalMinutes: 15
  }
];

@Component({
  selector: 'app-quick-breaks',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Section Header -->
      <div class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-base font-bold shadow-2xs">
                🎯
              </span>
              <h2 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Focus Engine & Biological Health Checkpoints
              </h2>
            </div>
            <p class="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Science-backed focus duration protocols integrated with real-time 20-20-20 eye strain alerts and cellular hydration prompts.
            </p>
          </div>

          <!-- Top Mode Switcher -->
          <div class="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start md:self-auto border border-slate-200">
            <button
              type="button"
              (click)="activeTab.set('focus')"
              class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
              [class]="activeTab() === 'focus' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'"
            >
              <span>⏱️ Focus Protocols</span>
            </button>
            <button
              type="button"
              (click)="activeTab.set('eye')"
              class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
              [class]="activeTab() === 'eye' ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'"
            >
              <span>👁️ 20-20-20 Eye Reset</span>
            </button>
            <button
              type="button"
              (click)="activeTab.set('desk-stretch')"
              class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
              [class]="activeTab() === 'desk-stretch' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'"
            >
              <span>🧘 Desk & Posture Reset</span>
            </button>
          </div>
        </div>
      </div>

      <!-- TAB 1: FOCUS ENGINE WITH ACTIVE IN-FLIGHT HEALTH MONITORING -->
      @if (activeTab() === 'focus') {
        <div class="space-y-6">
          <!-- Strategy Selector Cards (Visible when not actively running or can switch when paused) -->
          @if (!isRunning()) {
            <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                  Select Productivity Strategy & Duration
                </span>
                <span class="text-xs font-medium text-indigo-600 font-mono">
                  Target: {{ currentStrategy().focusMinutes }}m Focus + {{ currentStrategy().breakMinutes }}m Break
                </span>
              </div>

              <!-- 4 Protocol Preset Cards Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                @for (strat of strategies; track strat.id) {
                  <button
                    type="button"
                    (click)="selectStrategy(strat)"
                    class="p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3"
                    [class]="currentStrategy().id === strat.id 
                      ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-200 shadow-xs' 
                      : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'"
                  >
                    <div class="space-y-1.5">
                      <div class="flex items-center justify-between">
                        <span class="text-xl">{{ strat.icon }}</span>
                        <span class="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                          [class]="currentStrategy().id === strat.id ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'">
                          {{ strat.badge }}
                        </span>
                      </div>
                      <h4 class="text-sm font-bold text-slate-900">{{ strat.name }}</h4>
                      <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">{{ strat.description }}</p>
                    </div>

                    <div class="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-mono">
                      <span class="font-bold text-slate-900">{{ strat.focusMinutes }} min work</span>
                      <span class="text-slate-500">{{ strat.breakMinutes }}m break</span>
                    </div>
                  </button>
                }
              </div>

              <!-- Custom Duration Accordion -->
              <div class="pt-2 flex items-center justify-between text-xs text-slate-600 border-t border-slate-100 flex-wrap gap-2">
                <span class="font-medium">Need a custom duration?</span>
                <div class="flex items-center gap-2">
                  <span class="font-mono text-slate-500">Custom Focus:</span>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    step="5"
                    [value]="customMinutes()"
                    (input)="onCustomMinutesInput($event)"
                    class="w-16 px-2 py-1 text-xs font-mono font-bold rounded-lg border border-slate-300 text-center focus:ring-2 focus:ring-indigo-500"
                  />
                  <span class="font-mono text-slate-500">mins</span>
                </div>
              </div>
            </div>
          }

          <!-- Main Focus Session Card (The Active HUD) -->
          <div
            class="rounded-3xl border p-6 sm:p-10 shadow-lg text-center max-w-3xl mx-auto space-y-6 transition-all duration-300 relative overflow-hidden"
            [class]="isBreakSession() 
              ? 'bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 text-white border-emerald-700/60' 
              : (isRunning() 
                  ? 'bg-gradient-to-br from-indigo-950 via-slate-950 to-slate-900 text-white border-indigo-700/60 ring-2 ring-indigo-500/20' 
                  : 'bg-white text-slate-900 border-slate-200 shadow-sm')"
          >
            <!-- Ambient backdrop pulse when active -->
            @if (isRunning()) {
              <div class="absolute -right-24 -top-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20"
                [class]="isBreakSession() ? 'bg-emerald-500' : 'bg-indigo-500'"></div>
            }

            <!-- Top Header & Session State Indicator -->
            <div class="relative flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div class="flex items-center gap-2">
                <span
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-2xs"
                  [class]="isBreakSession() 
                    ? 'bg-emerald-500 text-slate-950' 
                    : (isRunning() ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-700')"
                >
                  @if (isRunning()) {
                    <span class="relative flex h-2 w-2">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                        [class]="isBreakSession() ? 'bg-emerald-200' : 'bg-indigo-200'"></span>
                      <span class="relative inline-flex rounded-full h-2 w-2"
                        [class]="isBreakSession() ? 'bg-slate-950' : 'bg-white'"></span>
                    </span>
                  }
                  <span>{{ isBreakSession() ? 'Restorative Break' : (isRunning() ? 'Deep Focus Sprint' : 'Focus Ready') }}</span>
                </span>

                <span class="font-semibold" [class]="isRunning() ? 'text-slate-300' : 'text-slate-600'">
                  {{ currentStrategy().name }} ({{ currentStrategy().focusMinutes }}m)
                </span>
              </div>

              <div class="flex items-center gap-3">
                <!-- Sound Toggle -->
                <button
                  type="button"
                  (click)="toggleSound()"
                  class="px-2.5 py-1 rounded-lg border text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                  [class]="soundEnabled() 
                    ? (isRunning() ? 'bg-white/10 text-white border-white/20' : 'bg-indigo-50 text-indigo-700 border-indigo-200') 
                    : (isRunning() ? 'bg-white/5 text-slate-400 border-white/10' : 'bg-slate-100 text-slate-400 border-slate-200')"
                  [title]="soundEnabled() ? 'Audio cues enabled' : 'Muted'"
                >
                  <span>{{ soundEnabled() ? '🔔 Sound ON' : '🔕 Muted' }}</span>
                </button>
              </div>
            </div>

            <!-- Big Digital Countdown Display & Circular Progress -->
            <div class="relative py-4 flex flex-col items-center justify-center">
              <div class="text-6xl sm:text-7xl md:text-8xl font-mono font-bold tracking-tight tabular-nums select-none"
                [class]="isBreakSession() ? 'text-emerald-400' : (isRunning() ? 'text-white' : 'text-slate-900')">
                {{ formattedTime() }}
              </div>

              <!-- Linear Progress Bar -->
              <div class="w-full max-w-md h-2 rounded-full overflow-hidden mt-6"
                [class]="isRunning() ? 'bg-white/10' : 'bg-slate-100'">
                <div
                  class="h-full rounded-full transition-all duration-1000"
                  [class]="isBreakSession() ? 'bg-emerald-400' : 'bg-indigo-500'"
                  [style.width]="progressPercent() + '%'"
                ></div>
              </div>

              <div class="mt-2 text-xs font-mono" [class]="isRunning() ? 'text-slate-400' : 'text-slate-500'">
                {{ progressPercent() }}% completed · {{ formattedRemainingSubtitle() }}
              </div>
            </div>

            <!-- IN-FLIGHT HEALTH MONITORING (Active during focus timer) -->
            @if (isRunning() && !isBreakSession()) {
              <div class="space-y-3 pt-2 text-left">
                <!-- 1. Eye Strain Alert & Checkpoint -->
                <div class="p-4 rounded-2xl border transition-all"
                  [class]="isEyeBreakDue() 
                    ? 'bg-amber-500/20 border-amber-400/80 ring-2 ring-amber-400/50' 
                    : 'bg-white/5 border-white/10'">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div class="flex items-start gap-3">
                      <span class="text-2xl shrink-0">👁️</span>
                      <div>
                        <div class="flex items-center gap-2">
                          <span class="text-xs font-mono font-bold uppercase tracking-wider"
                            [class]="isEyeBreakDue() ? 'text-amber-300' : 'text-sky-300'">
                            {{ isEyeBreakDue() ? '⚠️ 20-20-20 Eye Break Due Now' : '20-20-20 Eye Health Active' }}
                          </span>
                          <span class="text-[10px] font-mono text-slate-300">
                            (Next check in {{ formatSeconds(eyeSecondsUntilCheck()) }})
                          </span>
                        </div>
                        <p class="text-xs text-slate-200 mt-0.5 leading-relaxed">
                          @if (isEyeBreakDue()) {
                            Screen blink rates dropped by 66%. Gaze 20+ feet away for 20 seconds to prevent retinal and ciliary fatigue.
                          } @else {
                            Continuous screen time is monitored. Every 20 minutes, relax your eye focal length to preserve vision stamina.
                          }
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      (click)="triggerInSessionEyeBreak()"
                      class="px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-900 transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-center shrink-0 shadow-xs"
                      [class]="isEyeBreakDue() ? 'bg-amber-300 hover:bg-amber-200 font-bold' : 'bg-white hover:bg-slate-100'"
                    >
                      <span>Take 20s Eye Break Now</span>
                    </button>
                  </div>
                </div>

                <!-- 2. Cellular Water Hydration Checkpoint -->
                <div class="p-4 rounded-2xl border transition-all"
                  [class]="isWaterBreakDue() 
                    ? 'bg-sky-500/20 border-sky-400/80 ring-2 ring-sky-400/50' 
                    : 'bg-white/5 border-white/10'">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div class="flex items-start gap-3">
                      <span class="text-2xl shrink-0">💧</span>
                      <div>
                        <div class="flex items-center gap-2">
                          <span class="text-xs font-mono font-bold uppercase tracking-wider"
                            [class]="isWaterBreakDue() ? 'text-sky-300' : 'text-slate-300'">
                            {{ isWaterBreakDue() ? '💧 Water Break Recommended' : 'Hydration Baseline' }}
                          </span>
                          <span class="text-[10px] font-mono text-slate-300">
                            Logged: {{ service.stats().waterGlasses }} / 8 glasses today
                          </span>
                        </div>
                        <p class="text-xs text-slate-200 mt-0.5 leading-relaxed">
                          @if (isWaterBreakDue()) {
                            Cognitive processing slows by 12% with mild dehydration. Drink a glass of water now to maintain brain plasma volume.
                          } @else {
                            Brain tissue is 73% water. Keep a water glass within reach during your focus session.
                          }
                        </p>
                      </div>
                    </div>

                    <div class="flex items-center gap-2 self-start sm:self-center shrink-0">
                      <button
                        type="button"
                        (click)="logWaterInSession()"
                        class="px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-900 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                        [class]="isWaterBreakDue() ? 'bg-sky-300 hover:bg-sky-200 font-bold' : 'bg-white hover:bg-slate-100'"
                      >
                        <span>💧 +1 Glass Logged</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            }

            <!-- Timer Action Controls Bar -->
            <div class="relative pt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                (click)="toggleTimer()"
                class="px-8 py-3.5 text-sm font-bold rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-2"
                [class]="isRunning() 
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black' 
                  : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white'"
              >
                <span>{{ isRunning() ? '⏸ Pause Focus' : '▶ Start Focus Sprint' }}</span>
              </button>

              @if (isRunning() || isPaused()) {
                <button
                  type="button"
                  (click)="finishEarly()"
                  class="px-4 py-3 text-xs font-semibold rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5"
                  [class]="isRunning() ? 'border-white/20 bg-white/10 hover:bg-white/20 text-white' : 'border-slate-300 hover:bg-slate-50 text-slate-700'"
                  title="Finish and log minutes completed so far"
                >
                  <span>✓ Finish Early & Log</span>
                </button>
              }

              <button
                type="button"
                (click)="resetTimer()"
                class="px-4 py-3 text-xs font-semibold rounded-xl border transition-colors cursor-pointer"
                [class]="isRunning() ? 'border-white/20 bg-white/10 hover:bg-white/20 text-slate-300' : 'border-slate-300 hover:bg-slate-50 text-slate-700'"
              >
                Reset
              </button>
            </div>

            <!-- Strategy Scientific Mechanism Footer -->
            <div class="relative pt-4 border-t text-xs font-mono"
              [class]="isRunning() ? 'border-white/10 text-slate-400' : 'border-slate-100 text-slate-500'">
              <span class="font-bold text-slate-300">Strategy Rationale:</span> {{ currentStrategy().scienceBasis }}
            </div>
          </div>
        </div>
      }

      <!-- TAB 2: STANDALONE 20-20-20 EYE BREAK MODE -->
      @if (activeTab() === 'eye') {
        <div class="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs max-w-2xl mx-auto text-center space-y-6">
          <div class="space-y-2">
            <span class="text-3xl">👁️</span>
            <h3 class="text-xl font-bold text-slate-900">The 20-20-20 Eye Strain Protocol</h3>
            <p class="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Every 20 minutes spent on screens, gaze at an object at least 20 feet (6 meters) away for a full 20 seconds.
            </p>
          </div>

          <!-- Circular Guided Eye Reset Visualizer -->
          <div class="py-8 flex flex-col items-center justify-center">
            <div
              class="w-48 h-48 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-1000 shadow-inner"
              [class]="isEyeRunning() ? 'border-sky-500 bg-sky-50/80 scale-105' : 'border-slate-200 bg-slate-50'"
            >
              <span class="text-5xl font-mono font-bold tabular-nums text-sky-950">
                {{ eyeSeconds() }}s
              </span>
              <span class="text-xs font-mono font-bold text-sky-700 mt-1 uppercase tracking-wider">
                {{ isEyeRunning() ? 'Gaze Into Distance' : 'Ready' }}
              </span>
            </div>
          </div>

          <div class="flex items-center justify-center gap-3">
            <button
              type="button"
              (click)="startEyeBreak()"
              class="px-8 py-3 text-xs font-bold rounded-xl text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 transition-colors shadow-xs cursor-pointer"
            >
              {{ isEyeRunning() ? 'Pause Eye Reset' : 'Start 20s Eye Reset' }}
            </button>
            <button
              type="button"
              (click)="resetEyeBreak()"
              class="px-4 py-3 text-xs font-medium rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
            >
              Reset
            </button>
          </div>

          <!-- Scientific Rationale -->
          <div class="p-4 bg-sky-50/70 border border-sky-100 rounded-xl text-left text-xs space-y-1">
            <span class="font-bold font-mono text-sky-950 uppercase tracking-wider block">Clinical Mechanism</span>
            <p class="text-sky-900 leading-relaxed">
              When focusing on near displays, the intraocular ciliary muscles contract constantly. Looking at distant horizons relaxes accommodation, restores tear film lubrication, and prevents digital asthenopia and tension headaches.
            </p>
          </div>
        </div>
      }

      <!-- TAB 3: DESK & POSTURE RESET MODE -->
      @if (activeTab() === 'desk-stretch') {
        <div class="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-3xl mx-auto space-y-6">
          <div class="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 class="text-lg font-bold text-slate-900">Desk Neurovascular & Posture Reset</h3>
              <p class="text-xs text-slate-500 mt-0.5">3 simple physical interventions to decompress your cervical spine and stimulate blood flow.</p>
            </div>
            <button
              type="button"
              (click)="service.logBreakCompleted()"
              class="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              ✓ Mark Break Completed
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div class="text-2xl">🧘</div>
              <h4 class="text-xs font-bold text-slate-900">Cervical Spine Retraction</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                Tuck your chin straight back like making a double chin. Hold 5s. Repeat 5 times to reverse forward head posture.
              </p>
            </div>

            <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div class="text-2xl">👐</div>
              <h4 class="text-xs font-bold text-slate-900">Doorframe Chest Opener</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                Place forearms on a doorframe or chair back. Gently lean forward to stretch the pectoralis and intercostal muscles.
              </p>
            </div>

            <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <div class="text-2xl">🌬️</div>
              <h4 class="text-xs font-bold text-slate-900">Box Breathing (4-4-4-4)</h4>
              <p class="text-xs text-slate-600 leading-relaxed">
                Inhale 4s, hold 4s, exhale 4s, hold empty 4s. Activates the parasympathetic vagal brake in under 2 minutes.
              </p>
            </div>
          </div>
        </div>
      }

      <!-- MODAL: ACTIVE IN-SESSION 20S EYE BREAK OVERLAY -->
      @if (isInSessionEyeActive()) {
        <div class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl animate-in fade-in duration-200">
            <div class="space-y-2">
              <span class="text-4xl">👁️</span>
              <h3 class="text-xl font-bold text-slate-900">Look Away into the Distance</h3>
              <p class="text-xs text-slate-500">
                Focus your eyes on an object 20+ feet away (out a window or down a hallway).
              </p>
            </div>

            <!-- Pulsing Circle -->
            <div class="py-4 flex justify-center">
              <div class="w-36 h-36 rounded-full bg-sky-50 border-4 border-sky-400 flex flex-col items-center justify-center shadow-inner">
                <span class="text-5xl font-mono font-bold text-sky-950 tabular-nums">
                  {{ inSessionEyeSeconds() }}s
                </span>
                <span class="text-[10px] font-mono text-sky-700 font-bold uppercase mt-1">Distance Focus</span>
              </div>
            </div>

            <div class="flex items-center justify-center gap-3">
              <button
                type="button"
                (click)="closeInSessionEyeBreak()"
                class="px-5 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                Resume Focus Early
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class QuickBreaksComponent implements OnDestroy {
  service = inject(ProductivityService);
  audio = inject(AudioService);

  strategies = FOCUS_STRATEGIES;
  currentStrategy = signal<FocusStrategy>(FOCUS_STRATEGIES[0]);
  activeTab = signal<'focus' | 'eye' | 'desk-stretch'>('focus');

  // Timer states
  secondsLeft = signal<number>(25 * 60);
  initialDurationSeconds = signal<number>(25 * 60);
  isRunning = signal<boolean>(false);
  isPaused = signal<boolean>(false);
  isBreakSession = signal<boolean>(false);
  soundEnabled = signal<boolean>(true);
  private timerInterval: any = null;

  // Custom minutes
  customMinutes = signal<number>(45);

  // In-session tracking
  sessionFocusMinutesElapsed = signal<number>(0);
  eyeSecondsUntilCheck = signal<number>(20 * 60); // 20 minutes countdown
  isEyeBreakDue = signal<boolean>(false);
  isWaterBreakDue = signal<boolean>(false);

  // In-session 20s eye overlay
  isInSessionEyeActive = signal<boolean>(false);
  inSessionEyeSeconds = signal<number>(20);
  private inSessionEyeInterval: any = null;

  // Standalone Eye Break
  eyeSeconds = signal<number>(20);
  isEyeRunning = signal<boolean>(false);
  private standaloneEyeInterval: any = null;

  progressPercent = computed(() => {
    const total = this.initialDurationSeconds();
    if (total <= 0) return 0;
    const elapsed = total - this.secondsLeft();
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  });

  selectStrategy(strat: FocusStrategy) {
    if (this.isRunning()) return;
    this.currentStrategy.set(strat);
    this.initialDurationSeconds.set(strat.focusMinutes * 60);
    this.secondsLeft.set(strat.focusMinutes * 60);
    this.isBreakSession.set(false);
    this.isPaused.set(false);
    this.eyeSecondsUntilCheck.set(strat.eyeCheckIntervalMinutes * 60);
    this.isEyeBreakDue.set(false);
    this.isWaterBreakDue.set(false);
  }

  setCustomMinutes(mins: number) {
    if (mins < 5 || mins > 180) return;
    this.customMinutes.set(mins);
    const customStrat: FocusStrategy = {
      id: 'custom',
      name: `Custom ${mins}m Sprint`,
      shortName: `${mins}m / ${Math.round(mins / 5)}m`,
      focusMinutes: mins,
      breakMinutes: Math.max(3, Math.round(mins / 5)),
      badge: 'Custom',
      icon: '⚙️',
      description: `Targeted ${mins}-minute focused work block tailored to your exact capacity.`,
      scienceBasis: 'Custom pacing allows matching idiosyncratic cognitive rhythms.',
      bestFor: 'Targeted single-task blocks.',
      eyeCheckIntervalMinutes: 20
    };
    this.selectStrategy(customStrat);
  }

  onCustomMinutesInput(event: Event) {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    if (!isNaN(val) && val >= 5 && val <= 180) {
      this.setCustomMinutes(val);
    }
  }

  toggleSound() {
    this.soundEnabled.update(s => !s);
  }

  toggleTimer() {
    if (this.isRunning()) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    this.isRunning.set(true);
    this.isPaused.set(false);

    if (this.soundEnabled()) {
      this.audio.playTick();
    }

    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.secondsLeft() > 0) {
        this.secondsLeft.update(s => s - 1);

        if (!this.isBreakSession()) {
          // Track 20-20-20 Eye break countdown
          if (this.eyeSecondsUntilCheck() > 0) {
            this.eyeSecondsUntilCheck.update(e => e - 1);
          } else {
            // Eye break is due!
            if (!this.isEyeBreakDue()) {
              this.isEyeBreakDue.set(true);
              if (this.soundEnabled()) {
                this.audio.playGentleChime();
              }
            }
          }

          // Track water break evaluation
          const elapsedSecs = this.initialDurationSeconds() - this.secondsLeft();
          const waterGlasses = this.service.stats().waterGlasses;
          // Trigger water reminder if:
          // 1. Logged glasses today < 4, OR
          // 2. Focused for 30+ minutes, OR
          // 3. Current session duration >= 45m and 25m has elapsed
          if (!this.isWaterBreakDue()) {
            if ((waterGlasses < 4 && elapsedSecs >= 20 * 60) || elapsedSecs >= 35 * 60) {
              this.isWaterBreakDue.set(true);
              if (this.soundEnabled()) {
                this.audio.playWaterDrop();
              }
            }
          }
        }
      } else {
        this.handleTimerComplete();
      }
    }, 1000);
  }

  pauseTimer() {
    this.isRunning.set(false);
    this.isPaused.set(true);
    clearInterval(this.timerInterval);
  }

  resetTimer() {
    this.isRunning.set(false);
    this.isPaused.set(false);
    this.isBreakSession.set(false);
    clearInterval(this.timerInterval);

    const strat = this.currentStrategy();
    this.secondsLeft.set(strat.focusMinutes * 60);
    this.initialDurationSeconds.set(strat.focusMinutes * 60);
    this.eyeSecondsUntilCheck.set(strat.eyeCheckIntervalMinutes * 60);
    this.isEyeBreakDue.set(false);
    this.isWaterBreakDue.set(false);
  }

  finishEarly() {
    const elapsedMinutes = Math.floor((this.initialDurationSeconds() - this.secondsLeft()) / 60);
    if (!this.isBreakSession() && elapsedMinutes > 0) {
      this.service.logFocusMinutes(elapsedMinutes);
    }
    this.resetTimer();
  }

  handleTimerComplete() {
    clearInterval(this.timerInterval);
    this.isRunning.set(false);

    if (!this.isBreakSession()) {
      // Completed Focus Session!
      const focusedMins = this.currentStrategy().focusMinutes;
      this.service.logFocusMinutes(focusedMins);

      if (this.soundEnabled()) {
        this.audio.playSingingBowl(3.0);
      }

      // Switch to recommended break
      const breakMins = this.currentStrategy().breakMinutes;
      this.isBreakSession.set(true);
      this.initialDurationSeconds.set(breakMins * 60);
      this.secondsLeft.set(breakMins * 60);
    } else {
      // Completed Break Session!
      this.service.logBreakCompleted();
      if (this.soundEnabled()) {
        this.audio.playSuccessChime();
      }
      this.resetTimer();
    }
  }

  // Active in-session 20s Eye Break Overlay
  triggerInSessionEyeBreak() {
    this.isInSessionEyeActive.set(true);
    this.inSessionEyeSeconds.set(20);

    if (this.soundEnabled()) {
      this.audio.playGentleChime();
    }

    clearInterval(this.inSessionEyeInterval);
    this.inSessionEyeInterval = setInterval(() => {
      if (this.inSessionEyeSeconds() > 1) {
        this.inSessionEyeSeconds.update(s => s - 1);
      } else {
        this.closeInSessionEyeBreak();
      }
    }, 1000);
  }

  closeInSessionEyeBreak() {
    clearInterval(this.inSessionEyeInterval);
    this.isInSessionEyeActive.set(false);
    this.isEyeBreakDue.set(false);
    // Reset eye countdown to 20 minutes
    this.eyeSecondsUntilCheck.set(this.currentStrategy().eyeCheckIntervalMinutes * 60);
    this.service.logBreakCompleted();

    if (this.soundEnabled()) {
      this.audio.playSingingBowl(1.5);
    }
  }

  logWaterInSession() {
    this.service.logHydration();
    this.isWaterBreakDue.set(false);
    if (this.soundEnabled()) {
      this.audio.playWaterDrop();
    }
  }

  // Standalone Eye Break Methods
  startEyeBreak() {
    if (this.isEyeRunning()) {
      this.isEyeRunning.set(false);
      clearInterval(this.standaloneEyeInterval);
    } else {
      this.isEyeRunning.set(true);
      if (this.soundEnabled()) {
        this.audio.playGentleChime();
      }

      clearInterval(this.standaloneEyeInterval);
      this.standaloneEyeInterval = setInterval(() => {
        if (this.eyeSeconds() > 1) {
          this.eyeSeconds.update(s => s - 1);
        } else {
          this.isEyeRunning.set(false);
          this.eyeSeconds.set(20);
          clearInterval(this.standaloneEyeInterval);
          this.service.logBreakCompleted();
          if (this.soundEnabled()) {
            this.audio.playSingingBowl(2.0);
          }
        }
      }, 1000);
    }
  }

  resetEyeBreak() {
    this.isEyeRunning.set(false);
    clearInterval(this.standaloneEyeInterval);
    this.eyeSeconds.set(20);
  }

  formattedTime(): string {
    const totalSecs = this.secondsLeft();
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  formattedRemainingSubtitle(): string {
    const mins = Math.ceil(this.secondsLeft() / 60);
    if (this.isBreakSession()) {
      return `${mins}m of restorative break remaining`;
    }
    return `${mins}m remaining in this sprint`;
  }

  formatSeconds(totalSecs: number): string {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${String(secs).padStart(2, '0')}s`;
  }

  ngOnDestroy() {
    clearInterval(this.timerInterval);
    clearInterval(this.inSessionEyeInterval);
    clearInterval(this.standaloneEyeInterval);
  }
}

import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductivityService } from '../services/productivity.service';
import { AudioService } from '../services/audio.service';

@Component({
  selector: 'app-quick-breaks',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h2 class="text-xl font-bold tracking-tight text-slate-900">Quick Breaks & Focus Rituals</h2>
        <p class="text-xs text-slate-500 mt-0.5">Micro-interventions to eliminate cognitive fatigue and maintain eye health.</p>

        <!-- Mode switcher -->
        <div class="flex flex-wrap gap-2 mt-4 p-1 bg-slate-100 rounded-lg w-fit">
          <button
            (click)="setMode('pomodoro')"
            [class.bg-white]="mode() === 'pomodoro'"
            class="px-3 py-1.5 text-xs font-medium rounded-md text-slate-700 cursor-pointer"
          >
            Pomodoro Focus
          </button>
          <button
            (click)="setMode('eye-strain')"
            [class.bg-white]="mode() === 'eye-strain'"
            class="px-3 py-1.5 text-xs font-medium rounded-md text-slate-700 cursor-pointer"
          >
            20-20-20 Eye Break
          </button>
        </div>
      </div>

      <!-- Pomodoro View -->
      <div *ngIf="mode() === 'pomodoro'" class="bg-white rounded-xl border border-slate-200 p-8 shadow-xs text-center max-w-xl mx-auto space-y-6">
        <div class="flex justify-center gap-2">
          <button (click)="setPreset('focus', 25)" class="px-3 py-1 text-xs border rounded-lg">25m Work</button>
          <button (click)="setPreset('break', 5)" class="px-3 py-1 text-xs border rounded-lg">5m Break</button>
        </div>

        <div class="text-5xl font-mono tabular-nums font-bold text-slate-900">
          {{ formattedTime() }}
        </div>

        <div class="flex justify-center gap-3">
          <button
            (click)="toggleTimer()"
            class="px-6 py-2.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer"
          >
            {{ isRunning() ? 'Pause' : 'Start Timer' }}
          </button>
          <button
            (click)="resetTimer()"
            class="px-4 py-2 text-xs border rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      <!-- 20-20-20 Eye Break View -->
      <div *ngIf="mode() === 'eye-strain'" class="bg-white rounded-xl border border-slate-200 p-8 shadow-xs text-center max-w-xl mx-auto space-y-6">
        <h3 class="text-lg font-bold text-slate-900">20-20-20 Rule</h3>
        <p class="text-xs text-slate-500">Every 20 minutes, gaze at an object 20 feet away for 20 seconds.</p>

        <div class="text-5xl font-mono tabular-nums font-bold text-sky-900">
          {{ eyeSeconds() }}s
        </div>

        <button
          (click)="startEyeBreak()"
          class="px-6 py-2.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs cursor-pointer"
        >
          {{ isEyeRunning() ? 'Pause' : 'Start 20s Break' }}
        </button>
      </div>
    </div>
  `
})
export class QuickBreaksComponent implements OnDestroy {
  service = inject(ProductivityService);
  audio = inject(AudioService);

  mode = signal<'pomodoro' | 'eye-strain'>('pomodoro');
  timerType = signal<'focus' | 'break'>('focus');
  secondsLeft = signal<number>(25 * 60);
  isRunning = signal<boolean>(false);
  private timerInterval: any = null;

  eyeSeconds = signal<number>(20);
  isEyeRunning = signal<boolean>(false);
  private eyeInterval: any = null;

  setMode(m: 'pomodoro' | 'eye-strain') {
    this.mode.set(m);
  }

  setPreset(type: 'focus' | 'break', mins: number) {
    this.timerType.set(type);
    this.secondsLeft.set(mins * 60);
    this.isRunning.set(false);
    clearInterval(this.timerInterval);
  }

  toggleTimer() {
    if (this.isRunning()) {
      this.isRunning.set(false);
      clearInterval(this.timerInterval);
    } else {
      this.isRunning.set(true);
      this.timerInterval = setInterval(() => {
        if (this.secondsLeft() > 0) {
          this.secondsLeft.update(s => s - 1);
        } else {
          this.audio.playBreakAlert();
          this.isRunning.set(false);
          clearInterval(this.timerInterval);
          this.service.logBreak(this.timerType() === 'focus' ? 25 : 5);
        }
      }, 1000);
    }
  }

  resetTimer() {
    this.isRunning.set(false);
    clearInterval(this.timerInterval);
    this.secondsLeft.set(25 * 60);
  }

  startEyeBreak() {
    if (this.isEyeRunning()) {
      this.isEyeRunning.set(false);
      clearInterval(this.eyeInterval);
    } else {
      this.isEyeRunning.set(true);
      this.eyeInterval = setInterval(() => {
        if (this.eyeSeconds() > 0) {
          this.eyeSeconds.update(s => s - 1);
        } else {
          this.audio.playSingingBowl();
          this.isEyeRunning.set(false);
          this.eyeSeconds.set(20);
          clearInterval(this.eyeInterval);
          this.service.logBreak(1);
        }
      }, 1000);
    }
  }

  formattedTime(): string {
    const mins = Math.floor(this.secondsLeft() / 60);
    const secs = this.secondsLeft() % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  ngOnDestroy() {
    clearInterval(this.timerInterval);
    clearInterval(this.eyeInterval);
  }
}

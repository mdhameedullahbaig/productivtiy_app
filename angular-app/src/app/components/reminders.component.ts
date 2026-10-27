import { Component, inject, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductivityService } from '../services/productivity.service';
import { AudioService } from '../services/audio.service';
import { Reminder } from '../models/productivity.models';

@Component({
  selector: 'app-reminders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Toolbar -->
      <div class="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-xl font-bold tracking-tight text-slate-900">Reminders & Tasks</h2>
            <p class="text-xs text-slate-500 mt-0.5">Time-sensitive actions, habits, and priorities.</p>
          </div>
          <button
            (click)="openAddReminder.emit()"
            class="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs cursor-pointer self-start sm:self-auto"
          >
            + Add Reminder
          </button>
        </div>

        <!-- Filter tabs -->
        <div class="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-lg w-fit">
          <button
            (click)="filter.set('all')"
            [class.bg-white]="filter() === 'all'"
            [class.shadow-xs]="filter() === 'all'"
            class="px-3 py-1 text-xs font-medium rounded-md text-slate-700 cursor-pointer"
          >
            All ({{ service.reminders().length }})
          </button>
          <button
            (click)="filter.set('today')"
            [class.bg-white]="filter() === 'today'"
            [class.shadow-xs]="filter() === 'today'"
            class="px-3 py-1 text-xs font-medium rounded-md text-slate-700 cursor-pointer"
          >
            Today
          </button>
          <button
            (click)="filter.set('completed')"
            [class.bg-white]="filter() === 'completed'"
            [class.shadow-xs]="filter() === 'completed'"
            class="px-3 py-1 text-xs font-medium rounded-md text-slate-700 cursor-pointer"
          >
            Completed
          </button>
        </div>
      </div>

      <!-- List -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100">
        <div *ngIf="filteredList().length === 0" class="p-8 text-center text-xs text-slate-400">
          No reminders in this view.
        </div>

        <div *ngFor="let rem of filteredList()" class="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
          <div class="flex items-center gap-3">
            <button (click)="toggle(rem.id)" class="text-slate-400 hover:text-indigo-600 cursor-pointer text-base">
              <span *ngIf="rem.completed" class="text-emerald-600 font-bold">✓</span>
              <span *ngIf="!rem.completed">○</span>
            </button>
            <div>
              <p class="text-sm font-medium" [class.line-through]="rem.completed" [class.text-slate-400]="rem.completed">
                {{ rem.title }}
              </p>
              <div class="text-xs text-slate-400 font-mono mt-0.5">
                {{ rem.dueDate }} <span *ngIf="rem.dueTime">· {{ rem.dueTime }}</span> · {{ rem.category }} · {{ rem.priority }}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              *ngIf="!rem.completed"
              (click)="snooze(rem.id, 60)"
              class="px-2 py-1 text-[11px] font-mono bg-slate-100 hover:bg-slate-200 rounded text-slate-600"
              title="Snooze 1 hour"
            >
              +1h
            </button>
            <button
              (click)="delete(rem.id)"
              class="p-1 text-slate-400 hover:text-rose-600"
              title="Delete"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RemindersComponent {
  service = inject(ProductivityService);
  audio = inject(AudioService);
  openAddReminder = output<void>();

  filter = signal<'all' | 'today' | 'completed'>('all');

  filteredList = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    const list = this.service.reminders();
    if (this.filter() === 'today') return list.filter(r => !r.completed && r.dueDate === today);
    if (this.filter() === 'completed') return list.filter(r => r.completed);
    return list;
  });

  toggle(id: string) {
    this.audio.playSuccessChime();
    this.service.toggleReminder(id);
  }

  snooze(id: string, mins: number) {
    this.service.snoozeReminder(id, mins);
  }

  delete(id: string) {
    this.service.deleteReminder(id);
  }
}

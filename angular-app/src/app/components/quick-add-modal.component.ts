import { Component, inject, output, signal, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductivityService } from '../services/productivity.service';
import { Priority, EventCategory, ReminderCategory, EventFrequency } from '../models/productivity.models';

@Component({
  selector: 'app-quick-add-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div class="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        <!-- Tab selector -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div class="flex gap-1 p-1 bg-slate-200 rounded-lg">
            <button
              (click)="tab.set('reminder')"
              [class.bg-white]="tab() === 'reminder'"
              class="px-3 py-1 text-xs font-medium rounded-md text-slate-800 cursor-pointer"
            >
              Reminder
            </button>
            <button
              (click)="tab.set('event')"
              [class.bg-white]="tab() === 'event'"
              class="px-3 py-1 text-xs font-medium rounded-md text-slate-800 cursor-pointer"
            >
              Calendar Event
            </button>
          </div>
          <button (click)="close.emit()" class="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">✕</button>
        </div>

        <!-- Reminder Form -->
        <form *ngIf="tab() === 'reminder'" (ngSubmit)="saveReminder()" class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Title *</label>
            <input type="text" [(ngModel)]="remTitle" name="title" required class="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. Follow up on design review">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Due Date</label>
              <input type="date" [(ngModel)]="remDate" name="date" required class="w-full px-3 py-2 border rounded-lg text-sm">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Time</label>
              <input type="time" [(ngModel)]="remTime" name="time" class="w-full px-3 py-2 border rounded-lg text-sm">
            </div>
          </div>
          <div class="flex justify-end gap-2 pt-3">
            <button type="button" (click)="close.emit()" class="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">Cancel</button>
            <button type="submit" class="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer">Save Reminder</button>
          </div>
        </form>

        <!-- Event Form -->
        <form *ngIf="tab() === 'event'" (ngSubmit)="saveEvent()" class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Event Title *</label>
            <input type="text" [(ngModel)]="evtTitle" name="title" required class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="e.g. Deep Work: Refactoring">
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Date</label>
              <input type="date" [(ngModel)]="evtDate" name="date" required class="w-full px-2 py-2 border border-slate-300 rounded-lg text-xs">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Start</label>
              <input type="time" [(ngModel)]="evtStartTime" name="start" required class="w-full px-2 py-2 border border-slate-300 rounded-lg text-xs">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">End</label>
              <input type="time" [(ngModel)]="evtEndTime" name="end" required class="w-full px-2 py-2 border border-slate-300 rounded-lg text-xs">
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Frequency / Recurrence</label>
              <select [(ngModel)]="evtFrequency" name="frequency" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 font-medium cursor-pointer">
                <option value="none">None (One-time only)</option>
                <option value="daily">Daily (Repeats every day)</option>
                <option value="weekly">Weekly (Repeats same weekday)</option>
                <option value="monthly">Monthly (Repeats same day of month)</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Category</label>
              <select [(ngModel)]="evtCategory" name="category" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 font-medium cursor-pointer">
                <option value="deep-work">Deep Work</option>
                <option value="meeting">Meeting</option>
                <option value="workout">Workout</option>
                <option value="learning">Learning</option>
                <option value="personal">Personal</option>
                <option value="review">Review</option>
              </select>
            </div>
          </div>

          <!-- Frequency Database Storage Notice -->
          <div class="p-2.5 rounded-lg text-xs flex items-start gap-2 border"
            [class.bg-indigo-50]="evtFrequency !== 'none'"
            [class.border-indigo-200]="evtFrequency !== 'none'"
            [class.text-indigo-900]="evtFrequency !== 'none'"
            [class.bg-slate-50]="evtFrequency === 'none'"
            [class.border-slate-200]="evtFrequency === 'none'"
            [class.text-slate-600]="evtFrequency === 'none'"
          >
            <span class="text-sm shrink-0">💾</span>
            <div class="leading-relaxed">
              <span class="font-semibold text-[11px] uppercase tracking-wide block mb-0.5">
                Database Storage (Specific Start Dates)
              </span>
              <span>{{ getFrequencyInfoText() }}</span>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-3">
            <button type="button" (click)="close.emit()" class="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">Cancel</button>
            <button type="submit" class="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer">Schedule Event</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class QuickAddModalComponent implements OnInit {
  service = inject(ProductivityService);
  close = output<void>();

  initialDate = input<string>(new Date().toISOString().split('T')[0]);

  tab = signal<'reminder' | 'event'>('reminder');

  remTitle = '';
  remDate = new Date().toISOString().split('T')[0];
  remTime = '17:00';

  evtTitle = '';
  evtDate = new Date().toISOString().split('T')[0];
  evtStartTime = '09:00';
  evtEndTime = '10:00';
  evtFrequency: EventFrequency = 'none';
  evtCategory: EventCategory = 'deep-work';
  evtPriority: Priority = 'medium';

  ngOnInit() {
    if (this.initialDate()) {
      this.remDate = this.initialDate();
      this.evtDate = this.initialDate();
    }
  }

  saveReminder() {
    if (!this.remTitle.trim()) return;
    this.service.addReminder({
      title: this.remTitle.trim(),
      dueDate: this.remDate,
      dueTime: this.remTime,
      priority: 'medium',
      category: 'work',
      completed: false
    });
    this.close.emit();
  }

  saveEvent() {
    if (!this.evtTitle.trim()) return;
    this.service.addEvent({
      title: this.evtTitle.trim(),
      startDate: this.evtDate,
      startTime: this.evtStartTime,
      endTime: this.evtEndTime,
      category: this.evtCategory,
      priority: this.evtPriority,
      frequency: this.evtFrequency
    });
    this.close.emit();
  }

  getFrequencyInfoText(): string {
    if (!this.evtDate) return '';
    const parts = this.evtDate.split('-');
    if (parts.length !== 3) return '';
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
    const dayNum = parseInt(parts[2], 10);

    if (this.evtFrequency === 'daily') {
      return `Database will store 60 individual event records with consecutive start dates starting from ${this.evtDate}.`;
    }
    if (this.evtFrequency === 'weekly') {
      return `Database will store 26 weekly event records on every ${dayName} starting from ${this.evtDate}.`;
    }
    if (this.evtFrequency === 'monthly') {
      return `Database will store 12 monthly event records on day ${dayNum} of each month starting from ${this.evtDate}.`;
    }
    return `Database will store 1 event record with start date ${this.evtDate}.`;
  }
}

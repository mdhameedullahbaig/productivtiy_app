import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductivityService } from '../services/productivity.service';
import { AudioService } from '../services/audio.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./dashboard.component.html"
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

  todayEvents = computed(() => this.service.events().filter(e => e.startDate === this.todayDateStr));
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
}

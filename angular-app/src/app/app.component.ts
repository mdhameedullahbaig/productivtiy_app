import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductivityService } from './services/productivity.service';
import { NavigationComponent } from './components/navigation.component';
import { DashboardComponent } from './components/dashboard.component';
import { CalendarComponent } from './components/calendar.component';
import { RemindersComponent } from './components/reminders.component';
import { QuickBreaksComponent } from './components/quick-breaks.component';
import { QuotesComponent } from './components/quotes.component';
import { QuickAddModalComponent } from './components/quick-add-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    NavigationComponent,
    DashboardComponent,
    CalendarComponent,
    RemindersComponent,
    QuickBreaksComponent,
    QuotesComponent,
    QuickAddModalComponent
  ],
  template: `
    <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <app-navigation (openQuickAdd)="showModal.set(true)" />

      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <app-dashboard *ngIf="service.currentTab() === 'dashboard'" />
        <app-calendar *ngIf="service.currentTab() === 'calendar'" (openAddEvent)="showModal.set(true)" />
        <app-reminders *ngIf="service.currentTab() === 'reminders'" (openAddReminder)="showModal.set(true)" />
        <app-quick-breaks *ngIf="service.currentTab() === 'breaks'" />
        <app-quotes *ngIf="service.currentTab() === 'quotes'" />
      </main>

      <app-quick-add-modal *ngIf="showModal()" (close)="showModal.set(false)" />

      <footer class="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500 font-mono">
        Chronos Productivity Suite (Angular 19 Standalone Architecture)
      </footer>
    </div>
  `
})
export class AppComponent {
  service = inject(ProductivityService);
  showModal = signal(false);
}

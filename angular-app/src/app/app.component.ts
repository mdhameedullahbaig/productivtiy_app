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
import { DietComponent } from './components/diet.component';

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
    QuickAddModalComponent,
    DietComponent
  ],
  template: `
    <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <app-navigation (openQuickAdd)="onOpenAddEvent()" />

      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        @switch (service.currentTab()) {
          @case ('dashboard') {
            <app-dashboard />
          }
          @case ('calendar') {
            <app-calendar (openAddEvent)="onOpenAddEvent($event)" />
          }
          @case ('reminders') {
            <app-reminders (openAddReminder)="onOpenAddEvent()" />
          }
          @case ('breaks') {
            <app-quick-breaks />
          }
          @case ('quotes') {
            <app-quotes />
          }
          @case ('diet') {
            <app-diet />
          }
        }
      </main>

      @if (showModal()) {
        <app-quick-add-modal [initialDate]="modalInitialDate()" (close)="showModal.set(false)" />
      }

      <footer class="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500 font-mono">
        Chronos Productivity Suite (Angular Standalone Architecture)
      </footer>
    </div>
  `
})
export class AppComponent {
  service = inject(ProductivityService);
  showModal = signal(false);
  modalInitialDate = signal<string>(new Date().toISOString().split('T')[0]);

  onOpenAddEvent(date?: string | void) {
    if (typeof date === 'string' && date) {
      this.modalInitialDate.set(date);
    } else {
      this.modalInitialDate.set(new Date().toISOString().split('T')[0]);
    }
    this.showModal.set(true);
  }
}

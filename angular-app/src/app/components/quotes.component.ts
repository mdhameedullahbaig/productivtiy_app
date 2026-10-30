import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductivityService } from '../services/productivity.service';
import { AudioService } from '../services/audio.service';
import { Quote, QuoteCategory } from '../models/productivity.models';

type FilterCategory = 'All' | 'Discipline' | 'Time Mastery' | 'Focus' | 'Habits' | 'Favorites';

@Component({
  selector: 'app-quotes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header Banner & Quick Insights -->
      <div class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center text-base font-bold shadow-2xs">
                ⌛
              </span>
              <h2 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Discipline & Time Wisdom Library
              </h2>
            </div>
            <p class="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Curated Stoic principles, time-allocation philosophy, and execution axioms to anchor your daily cognitive state.
            </p>
          </div>

          <!-- Quick counts pills -->
          <div class="flex items-center gap-2 flex-wrap text-xs font-mono">
            <span class="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold shadow-2xs">
              {{ disciplineCount() }} Discipline
            </span>
            <span class="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-semibold shadow-2xs">
              {{ timeMasteryCount() }} Time Mastery
            </span>
            <span class="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 font-semibold shadow-2xs">
              {{ favoritesCount() }} Saved ⭐
            </span>
          </div>
        </div>
      </div>

      <!-- Spotlight Anchor Quote -->
      <section class="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-indigo-900/40 relative overflow-hidden">
        <!-- Subtle decorative glow -->
        <div class="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative space-y-5">
          <!-- Spotlight Top Bar -->
          <div class="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 rounded-full font-bold uppercase tracking-wider text-[11px] shadow-2xs"
                [class]="getCategoryBadgeClass(service.quoteOfTheDay().category)">
                {{ service.quoteOfTheDay().category }}
              </span>
              <span class="text-slate-400">·</span>
              <span class="text-slate-300 font-medium">Daily Wisdom Spotlight</span>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-slate-300 bg-white/10 px-2.5 py-1 rounded-full text-[11px] border border-white/10">
                Rotates in {{ service.quoteCountdownFormatted() }}
              </span>
              <button
                type="button"
                (click)="toggleFavorite(service.quoteOfTheDay().id)"
                class="p-1.5 rounded-lg hover:bg-white/10 text-amber-400 transition-colors cursor-pointer"
                [title]="service.quoteOfTheDay().favorite ? 'Remove from favorites' : 'Mark as favorite'"
              >
                <span>{{ service.quoteOfTheDay().favorite ? '★ Saved' : '☆ Save' }}</span>
              </button>
            </div>
          </div>

          <!-- Spotlight Quote Text -->
          <blockquote class="text-xl sm:text-2xl font-serif font-medium leading-relaxed tracking-tight text-slate-100">
            “{{ service.quoteOfTheDay().text }}”
          </blockquote>

          <!-- Author -->
          <div class="text-sm sm:text-base font-semibold text-amber-300 font-mono">
            — {{ service.quoteOfTheDay().author }}
          </div>

          <!-- Reflection Prompt Box -->
          @if (service.quoteOfTheDay().reflectionPrompt) {
            <div class="p-3.5 bg-white/5 border border-white/10 rounded-xl space-y-1">
              <div class="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                <span>💡</span>
                <span>Active Reflection Question</span>
              </div>
              <p class="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
                {{ service.quoteOfTheDay().reflectionPrompt }}
              </p>
            </div>
          }

          <!-- Spotlight Controls -->
          <div class="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10">
            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                (click)="listen(service.quoteOfTheDay())"
                class="px-3.5 py-2 text-xs font-medium bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-lg text-white font-mono cursor-pointer transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <span>🔊 Listen Aloud</span>
              </button>

              <button
                type="button"
                (click)="copy(service.quoteOfTheDay())"
                class="px-3.5 py-2 text-xs font-medium bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-lg text-white font-mono cursor-pointer transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <span>{{ copiedQuoteId() === service.quoteOfTheDay().id ? '✓ Copied!' : '📋 Copy Quote' }}</span>
              </button>
            </div>

            <button
              type="button"
              (click)="service.rotateQuote()"
              class="px-4 py-2 text-xs font-semibold bg-white text-slate-950 hover:bg-slate-100 active:bg-slate-200 rounded-lg font-mono cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
              title="Rotate to next quote"
            >
              <span>↻ Next Quote</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Category Filter Tabs & Search Bar -->
      <div class="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <!-- Filter Tabs -->
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            @for (cat of categories; track cat) {
              <button
                type="button"
                (click)="selectedCategory.set(cat)"
                class="px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap shadow-2xs"
                [class]="selectedCategory() === cat 
                  ? 'bg-slate-900 text-white font-semibold' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'"
              >
                @if (cat === 'Discipline') { ⚔️ }
                @else if (cat === 'Time Mastery') { ⏳ }
                @else if (cat === 'Focus') { 🎯 }
                @else if (cat === 'Habits') { ⚡ }
                @else if (cat === 'Favorites') { ⭐ }
                {{ cat }}
                @if (cat === 'All') {
                  <span class="ml-1 opacity-70">({{ service.quotes().length }})</span>
                } @else if (cat === 'Discipline') {
                  <span class="ml-1 opacity-70">({{ disciplineCount() }})</span>
                } @else if (cat === 'Time Mastery') {
                  <span class="ml-1 opacity-70">({{ timeMasteryCount() }})</span>
                } @else if (cat === 'Favorites') {
                  <span class="ml-1 opacity-70">({{ favoritesCount() }})</span>
                }
              </button>
            }
          </div>

          <!-- Search Input -->
          <div class="relative w-full lg:w-72">
            <input
              type="text"
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              placeholder="Search quotes or authors..."
              class="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-300 bg-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <span class="absolute left-3 top-2.5 text-xs text-slate-400">🔍</span>
            @if (searchQuery()) {
              <button
                type="button"
                (click)="searchQuery.set('')"
                class="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Clear search"
              >
                ✕
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Quotes Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (q of filteredQuotes(); track q.id) {
          <article class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4">
            <!-- Header: Category & Favorite Star -->
            <div class="flex items-center justify-between gap-2">
              <span
                class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider"
                [class]="getCategoryBadgeClass(q.category)"
              >
                {{ q.category }}
              </span>

              <button
                type="button"
                (click)="toggleFavorite(q.id)"
                class="text-sm p-1 rounded-md transition-colors cursor-pointer"
                [class]="q.favorite ? 'text-amber-500 hover:text-amber-600' : 'text-slate-300 hover:text-amber-400'"
                [title]="q.favorite ? 'Favorited' : 'Add to favorites'"
              >
                <span>{{ q.favorite ? '★' : '☆' }}</span>
              </button>
            </div>

            <!-- Quote Text -->
            <div class="space-y-2 flex-1">
              <blockquote class="text-sm sm:text-base font-serif font-medium text-slate-900 leading-relaxed">
                “{{ q.text }}”
              </blockquote>
              <div class="text-xs font-mono font-bold text-slate-700">
                — {{ q.author }}
              </div>
            </div>

            <!-- Reflection Prompt (if present) -->
            @if (q.reflectionPrompt) {
              <div class="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                <div class="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <span>💡</span>
                  <span>Reflection</span>
                </div>
                <p class="text-xs text-slate-700 leading-relaxed">
                  {{ q.reflectionPrompt }}
                </p>
              </div>
            }

            <!-- Card Actions -->
            <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="listen(q)"
                  class="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>🔊</span>
                  <span>Listen</span>
                </button>

                <button
                  type="button"
                  (click)="copy(q)"
                  class="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>{{ copiedQuoteId() === q.id ? '✓ Copied' : '📋 Copy' }}</span>
                </button>
              </div>

              <button
                type="button"
                (click)="setAsSpotlight(q)"
                class="text-xs font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer"
                title="Make this the spotlight quote on dashboard"
              >
                Spotlight ↑
              </button>
            </div>
          </article>
        } @empty {
          <div class="md:col-span-2 py-12 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <div class="text-3xl">🔍</div>
            <h3 class="text-sm font-bold text-slate-900">No quotes match your filter</h3>
            <p class="text-xs text-slate-500 max-w-sm mx-auto">
              Try selecting "All" or clearing your search term to view all discipline and time quotes.
            </p>
            <button
              type="button"
              (click)="clearFilters()"
              class="px-4 py-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        }
      </div>
    </div>
  `
})
export class QuotesComponent {
  service = inject(ProductivityService);
  audio = inject(AudioService);

  categories: FilterCategory[] = ['All', 'Discipline', 'Time Mastery', 'Focus', 'Habits', 'Favorites'];
  selectedCategory = signal<FilterCategory>('All');
  searchQuery = signal<string>('');
  copiedQuoteId = signal<string | null>(null);

  disciplineCount = computed(() => this.service.quotes().filter(q => q.category === 'Discipline').length);
  timeMasteryCount = computed(() => this.service.quotes().filter(q => q.category === 'Time Mastery').length);
  favoritesCount = computed(() => this.service.quotes().filter(q => !!q.favorite).length);

  filteredQuotes = computed(() => {
    const list = this.service.quotes();
    const cat = this.selectedCategory();
    const query = this.searchQuery().toLowerCase().trim();

    return list.filter(q => {
      // Category filter
      if (cat === 'Favorites' && !q.favorite) return false;
      if (cat !== 'All' && cat !== 'Favorites' && q.category !== cat) return false;

      // Search query
      if (query) {
        const matchesText = q.text.toLowerCase().includes(query);
        const matchesAuthor = q.author.toLowerCase().includes(query);
        const matchesPrompt = q.reflectionPrompt?.toLowerCase().includes(query) ?? false;
        if (!matchesText && !matchesAuthor && !matchesPrompt) return false;
      }

      return true;
    });
  });

  getCategoryBadgeClass(category: QuoteCategory): string {
    switch (category) {
      case 'Discipline':
        return 'bg-emerald-100 text-emerald-900 border border-emerald-300';
      case 'Time Mastery':
        return 'bg-amber-100 text-amber-900 border border-amber-300';
      case 'Focus':
        return 'bg-indigo-100 text-indigo-900 border border-indigo-300';
      case 'Habits':
        return 'bg-purple-100 text-purple-900 border border-purple-300';
      case 'Resilience':
        return 'bg-rose-100 text-rose-900 border border-rose-300';
      case 'Clarity':
      default:
        return 'bg-sky-100 text-sky-900 border border-sky-300';
    }
  }

  listen(q: Quote) {
    this.audio.speakText(`"${q.text}" by ${q.author}`);
  }

  copy(q: Quote) {
    navigator.clipboard.writeText(`"${q.text}" — ${q.author}`);
    this.copiedQuoteId.set(q.id);
    setTimeout(() => {
      if (this.copiedQuoteId() === q.id) {
        this.copiedQuoteId.set(null);
      }
    }, 2500);
  }

  toggleFavorite(id: string) {
    this.service.toggleFavoriteQuote(id);
  }

  setAsSpotlight(q: Quote) {
    const idx = this.service.quotes().findIndex(item => item.id === q.id);
    if (idx !== -1) {
      this.service.currentQuoteIndex.set(idx);
      this.service.quoteRotationSecondsLeft.set(300);
    }
  }

  clearFilters() {
    this.selectedCategory.set('All');
    this.searchQuery.set('');
  }
}

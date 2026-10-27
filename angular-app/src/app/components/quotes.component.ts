import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductivityService } from '../services/productivity.service';
import { AudioService } from '../services/audio.service';
import { Quote } from '../models/productivity.models';

@Component({
  selector: 'app-quotes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h2 class="text-xl font-bold tracking-tight text-slate-900">Productivity & Mindset Library</h2>
        <p class="text-xs text-slate-500 mt-0.5">Stoic principles, cognitive focus research, and daily mental clarity anchors.</p>
      </div>

      <!-- Spotlight Quote -->
      <div class="bg-slate-900 text-white rounded-2xl p-8 shadow-lg space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-indigo-400">
          <span>DAILY WISDOM · {{ service.quoteOfTheDay().category }}</span>
          <span class="text-slate-300 bg-white/10 px-2 py-0.5 rounded text-[11px]">
            Rotates in {{ service.quoteCountdownFormatted() }}
          </span>
        </div>
        <blockquote class="text-xl font-medium leading-relaxed">
          "{{ service.quoteOfTheDay().text }}"
        </blockquote>
        <div class="text-sm font-semibold text-slate-300 font-mono">
          — {{ service.quoteOfTheDay().author }}
        </div>
        <div class="pt-2 flex flex-wrap items-center justify-between gap-2">
          <div class="flex gap-2">
            <button
              (click)="listen(service.quoteOfTheDay())"
              class="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 rounded-lg text-white font-mono cursor-pointer"
            >
              🔊 Listen Aloud
            </button>
            <button
              (click)="copy(service.quoteOfTheDay())"
              class="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 rounded-lg text-white font-mono cursor-pointer"
            >
              📋 Copy Quote
            </button>
          </div>

          <button
            (click)="service.rotateQuote()"
            class="px-3.5 py-1.5 text-xs bg-white text-slate-900 hover:bg-slate-100 rounded-lg font-mono cursor-pointer font-medium"
            title="Rotate to next quote"
          >
            ↻ Next Quote
          </button>
        </div>
      </div>

      <!-- Quotes Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div *ngFor="let q of service.quotes()" class="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div class="text-xs font-mono text-slate-400">{{ q.category }}</div>
          <p class="text-sm font-medium text-slate-900">"{{ q.text }}"</p>
          <div class="text-xs font-semibold text-slate-600 font-mono">— {{ q.author }}</div>
          <div class="flex gap-2 pt-2 border-t border-slate-100">
            <button (click)="listen(q)" class="text-xs text-indigo-600 hover:underline">Listen</button>
            <button (click)="copy(q)" class="text-xs text-slate-500 hover:underline">Copy</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class QuotesComponent {
  service = inject(ProductivityService);
  audio = inject(AudioService);

  listen(q: Quote) {
    this.audio.speakText(`"${q.text}" by ${q.author}`);
  }

  copy(q: Quote) {
    navigator.clipboard.writeText(`"${q.text}" — ${q.author}`);
  }
}

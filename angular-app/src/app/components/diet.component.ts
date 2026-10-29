import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductivityService } from '../services/productivity.service';
import { AudioService } from '../services/audio.service';
import { MealTiming, HealthExpertRecommendation } from '../models/productivity.models';

@Component({
  selector: 'app-diet',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8">
      <!-- Section Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div class="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-emerald-600">
            <span>🥗 Biological Optimization</span>
            <span>·</span>
            <span>Circadian Nutrition</span>
          </div>
          <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Diet, Timings & Hydration Intelligence
          </h1>
          <p class="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Align feeding windows, macronutrient anchors, and cellular hydration with your natural circadian neurobiology to sustain razor-sharp cognitive output and prevent afternoon fatigue.
          </p>
        </div>

        <!-- Live Meal Window Pill -->
        <div class="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 shrink-0">
          <div class="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-2xs">
            {{ service.currentMealStatus().activeMeal ? service.currentMealStatus().activeMeal?.icon : '⏳' }}
          </div>
          <div>
            <div class="text-[10px] font-mono text-emerald-800 uppercase font-bold tracking-wider">
              {{ service.currentMealStatus().status === 'active' ? 'Active Nutrition Window' : 'Next Nutrition Window' }}
            </div>
            <div class="text-sm font-bold text-emerald-950 font-mono">
              {{ service.currentMealStatus().label }}
            </div>
            <div class="text-[11px] text-emerald-700 font-mono mt-0.5">
              {{ service.currentMealStatus().countdownText }}
            </div>
          </div>
        </div>
      </div>

      <!-- Hydration Command Center -->
      <section class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-md bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold">💧</span>
              <h2 class="text-base sm:text-lg font-bold text-slate-900">Hydration Command Center</h2>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">
              Target: 8 glasses (2,000ml minimum baseline). Frontload before 4:00 PM for optimal kidney clearance and unbroken sleep.
            </p>
          </div>

          <!-- Quick Action Buttons -->
          <div class="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              (click)="logWater()"
              class="px-4 py-2 text-xs font-semibold rounded-xl text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>+1 Glass (250ml)</span>
            </button>
            <button
              type="button"
              (click)="decrementWater()"
              class="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
              title="Remove 1 glass"
            >
              <span>-1</span>
            </button>
            <button
              type="button"
              (click)="resetWater()"
              class="px-3 py-2 text-xs font-medium rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Reset today's water counter"
            >
              <span>Reset</span>
            </button>
          </div>
        </div>

        <!-- Metric Display & Visual Bar -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <!-- Glass Counter Card -->
          <div class="bg-sky-50/70 border border-sky-100 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span class="text-[11px] font-semibold text-sky-800 uppercase tracking-wider font-mono">Today's Intake</span>
              <div class="text-3xl font-bold font-mono text-sky-950 mt-1">
                {{ service.stats().waterGlasses }} <span class="text-base font-normal text-sky-700">/ {{ service.targetWaterGlasses() }} glasses</span>
              </div>
              <div class="text-xs text-sky-800 font-mono mt-1">
                {{ service.stats().waterGlasses * 250 }}ml consumed ({{ hydrationPercentage() }}% of goal)
              </div>
            </div>
            <div class="text-4xl">🚰</div>
          </div>

          <!-- Glass Icons Visualizer -->
          <div class="md:col-span-2 space-y-2">
            <div class="flex items-center justify-between text-xs text-slate-600 font-mono">
              <span>Goal Progress (2,000ml)</span>
              <span class="font-bold text-sky-700">{{ hydrationPercentage() }}%</span>
            </div>
            <!-- Progress Bar -->
            <div class="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                class="bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 h-full rounded-full transition-all duration-500 shadow-2xs"
                [style.width]="hydrationPercentage() + '%'"
              ></div>
            </div>
            <!-- Individual 8 glasses strip -->
            <div class="grid grid-cols-8 gap-1.5 pt-1">
              @for (glassIndex of glassArray; track glassIndex) {
                <div
                  (click)="setGlassCount(glassIndex)"
                  class="h-8 rounded-lg border flex items-center justify-center text-xs font-mono transition-all cursor-pointer select-none"
                  [class]="glassIndex <= service.stats().waterGlasses 
                    ? 'bg-sky-500 border-sky-600 text-white font-bold shadow-2xs ring-1 ring-sky-300' 
                    : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'"
                  [title]="'Glass ' + glassIndex + ' (250ml)'"
                >
                  💧
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Circadian Hydration Strategy Strip -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div class="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <div class="font-bold text-slate-900 font-mono flex items-center gap-1">
              <span>🌅 05:30 - 07:00</span>
            </div>
            <div class="font-semibold text-sky-700 mt-1">Morning Jumpstart (500ml)</div>
            <p class="text-[11px] text-slate-500 mt-1">Water + pinch of salt to restore plasma volume.</p>
          </div>

          <div class="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <div class="font-bold text-slate-900 font-mono flex items-center gap-1">
              <span>🧠 09:30 - 11:30</span>
            </div>
            <div class="font-semibold text-sky-700 mt-1">Deep Work Flow (500ml)</div>
            <p class="text-[11px] text-slate-500 mt-1">Prevents cognitive fatigue and sluggishness.</p>
          </div>

          <div class="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <div class="font-bold text-slate-900 font-mono flex items-center gap-1">
              <span>⚡ 13:30 - 15:30</span>
            </div>
            <div class="font-semibold text-sky-700 mt-1">Post-Lunch Shield (500ml)</div>
            <p class="text-[11px] text-slate-500 mt-1">Aids digestion and mitigates the 2 PM dip.</p>
          </div>

          <div class="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <div class="font-bold text-slate-900 font-mono flex items-center gap-1">
              <span>🔋 16:30 - 18:30</span>
            </div>
            <div class="font-semibold text-sky-700 mt-1">Late Day Buffer (350ml)</div>
            <p class="text-[11px] text-slate-500 mt-1">Last major hydration intake of the day.</p>
          </div>

          <div class="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <div class="font-bold text-slate-900 font-mono flex items-center gap-1">
              <span>🌙 19:30 - 21:00</span>
            </div>
            <div class="font-semibold text-purple-700 mt-1">Night Micro-Sips (150ml)</div>
            <p class="text-[11px] text-slate-500 mt-1">Small sips only to prevent sleep interruptions.</p>
          </div>
        </div>
      </section>

      <!-- Circadian Meal & Nutrient Timings (5am - 10pm) -->
      <section class="space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>⏰</span>
              <span>Circadian Meal Timings & Nutrient Protocols</span>
            </h2>
            <p class="text-xs text-slate-500">
              Synchronized to your active daytime hours (5:00 AM – 10:00 PM) and nighttime cellular restoration.
            </p>
          </div>

          <div class="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Active Window Highlighted</span>
          </div>
        </div>

        <!-- Meal Windows Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (meal of service.mealTimings(); track meal.id) {
            <div
              class="bg-white rounded-2xl border transition-all duration-300 p-5 flex flex-col justify-between shadow-xs relative overflow-hidden"
              [class]="isMealActive(meal) 
                ? 'border-emerald-400 ring-2 ring-emerald-200/80 bg-emerald-50/20' 
                : (isMealCompleted(meal.id) ? 'border-slate-200 bg-slate-50/60 opacity-90' : 'border-slate-200 hover:border-slate-300')"
            >
              @if (isMealActive(meal)) {
                <div class="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-mono font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow-2xs">
                  Active Now
                </div>
              }

              <div class="space-y-3">
                <!-- Header: Icon, Name & Phase -->
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0">
                    {{ meal.icon }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <span class="text-[10px] font-mono uppercase font-semibold text-indigo-600 tracking-wider">
                      {{ meal.phase }}
                    </span>
                    <h3 class="text-sm font-bold text-slate-900 leading-snug">
                      {{ meal.name }}
                    </h3>
                    <div class="text-xs font-mono font-semibold text-slate-700 mt-0.5">
                      🕒 {{ meal.timeRange }}
                    </div>
                  </div>
                </div>

                <!-- Summary Description -->
                <p class="text-xs text-slate-600 leading-relaxed">
                  {{ meal.summary }}
                </p>

                <!-- Ideal Foods List -->
                <div class="space-y-1.5 pt-1 border-t border-slate-100">
                  <div class="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                    <span>✓ Recommended Nutrient Focus</span>
                  </div>
                  <div class="flex flex-wrap gap-1.5">
                    @for (food of meal.idealFoods; track food) {
                      <span class="text-[11px] bg-emerald-50 text-emerald-900 border border-emerald-200/80 px-2 py-0.5 rounded-md font-medium">
                        {{ food }}
                      </span>
                    }
                  </div>
                </div>

                <!-- Foods To Avoid -->
                <div class="space-y-1 pt-1">
                  <div class="text-[11px] font-semibold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                    <span>✕ Foods to Avoid</span>
                  </div>
                  <div class="flex flex-wrap gap-1.5">
                    @for (avoid of meal.foodsToAvoid; track avoid) {
                      <span class="text-[10px] bg-rose-50 text-rose-800 border border-rose-200/80 px-2 py-0.5 rounded-md font-mono">
                        {{ avoid }}
                      </span>
                    }
                  </div>
                </div>

                <!-- Expert Guidance -->
                <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed font-sans italic">
                  💡 {{ meal.expertGuidance }}
                </div>
              </div>

              <!-- Card Footer: Checkmark button -->
              <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span class="text-[11px] text-slate-400 font-mono">
                  💧 Target: {{ meal.waterIntakeTargetMl }}ml
                </span>

                <button
                  type="button"
                  (click)="toggleMeal(meal.id)"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5"
                  [class]="isMealCompleted(meal.id) 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700'"
                >
                  <span>{{ isMealCompleted(meal.id) ? '✓ Completed' : '○ Mark Done' }}</span>
                </button>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Health Expert Recommendations Section -->
      <section class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">🔬</span>
              <h2 class="text-base sm:text-lg font-bold text-slate-900">Recommendations From Health Experts</h2>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">
              Peer-reviewed biological principles from leading neuroscientists, chronobiologists, and longevity researchers.
            </p>
          </div>

          <!-- Category filter tabs -->
          <div class="flex items-center gap-1.5 flex-wrap p-1 bg-slate-100 rounded-xl">
            <button
              (click)="selectedCategory.set('all')"
              class="px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              [class]="selectedCategory() === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'"
            >
              All Experts
            </button>
            <button
              (click)="selectedCategory.set('Energy Crash Prevention')"
              class="px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              [class]="selectedCategory() === 'Energy Crash Prevention' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'"
            >
              Energy & Caffeine
            </button>
            <button
              (click)="selectedCategory.set('Circadian Fasting')"
              class="px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              [class]="selectedCategory() === 'Circadian Fasting' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'"
            >
              Circadian Fasting
            </button>
            <button
              (click)="selectedCategory.set('Cognitive Fuel')"
              class="px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              [class]="selectedCategory() === 'Cognitive Fuel' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'"
            >
              Protein & Dopamine
            </button>
          </div>
        </div>

        <!-- Recommendations Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (rec of filteredRecommendations(); track rec.id) {
            <div class="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-5 space-y-4 hover:border-slate-300 transition-colors flex flex-col justify-between shadow-2xs">
              <div class="space-y-3">
                <!-- Header with Icon & Category -->
                <div class="flex items-start justify-between gap-3">
                  <div class="flex items-center gap-2.5">
                    <div class="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shadow-2xs shrink-0">
                      {{ rec.icon }}
                    </div>
                    <div>
                      <span class="text-[10px] font-mono uppercase font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                        {{ rec.category }}
                      </span>
                      <h3 class="text-sm font-bold text-slate-900 mt-1 leading-snug">
                        {{ rec.title }}
                      </h3>
                    </div>
                  </div>

                  <span class="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
                    {{ rec.impactBadge }}
                  </span>
                </div>

                <!-- Expert Citation -->
                <div class="text-xs text-slate-600 font-mono">
                  <span class="font-bold text-slate-900">{{ rec.expert }}</span> · {{ rec.roleAndInstitution }}
                </div>

                <!-- Key Rule Callout -->
                <div class="p-3 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 leading-relaxed shadow-2xs">
                  “{{ rec.keyRule }}”
                </div>

                <!-- Actionable Protocol -->
                <div class="text-xs text-slate-700 space-y-1">
                  <span class="font-bold uppercase tracking-wider text-[10px] text-slate-500 block font-mono">
                    Actionable Daily Protocol:
                  </span>
                  <p class="leading-relaxed">
                    {{ rec.actionableProtocol }}
                  </p>
                </div>

                <!-- Biological Mechanism -->
                <div class="text-[11px] text-slate-500 bg-slate-100/70 rounded-xl p-3 border border-slate-200/60 leading-relaxed font-sans">
                  <span class="font-semibold text-slate-700">Scientific Mechanism: </span>
                  {{ rec.scientificMechanism }}
                </div>
              </div>

              <!-- Listen button -->
              <div class="pt-3 border-t border-slate-200/60 flex justify-end">
                <button
                  type="button"
                  (click)="listenToRec(rec)"
                  class="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <span>🔊 Listen Aloud</span>
                </button>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Top 8 Neuro-Nutritive Brain Foods Section -->
      <section class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h2 class="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>🧠</span>
            <span>Top Cognitive Fuel Foods for Deep Work</span>
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">
            Nutrient-dense whole foods clinically correlated with enhanced executive function, memory retrieval, and sustained attention.
          </p>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div class="text-2xl mb-1">🫐</div>
            <div class="text-xs font-bold text-slate-900">Wild Blueberries</div>
            <div class="text-[10px] font-mono text-emerald-700 mt-0.5">Anthocyanins</div>
            <p class="text-[11px] text-slate-500 mt-1">Crosses blood-brain barrier to stimulate spatial memory.</p>
          </div>

          <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div class="text-2xl mb-1">🐟</div>
            <div class="text-xs font-bold text-slate-900">Wild Salmon</div>
            <div class="text-[10px] font-mono text-emerald-700 mt-0.5">EPA / DHA Omega-3</div>
            <p class="text-[11px] text-slate-500 mt-1">Foundational building block for neuronal cell membranes.</p>
          </div>

          <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div class="text-2xl mb-1">🥚</div>
            <div class="text-xs font-bold text-slate-900">Pasture Eggs</div>
            <div class="text-[10px] font-mono text-emerald-700 mt-0.5">Choline & L-Tyrosine</div>
            <p class="text-[11px] text-slate-500 mt-1">Precursor to acetylcholine, the neurotransmitter of focus.</p>
          </div>

          <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div class="text-2xl mb-1">🥑</div>
            <div class="text-xs font-bold text-slate-900">Avocados</div>
            <div class="text-[10px] font-mono text-emerald-700 mt-0.5">Monounsaturated Fats</div>
            <p class="text-[11px] text-slate-500 mt-1">Promotes cerebral blood perfusion and steady glucose.</p>
          </div>

          <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div class="text-2xl mb-1">🍵</div>
            <div class="text-xs font-bold text-slate-900">Green Tea / Matcha</div>
            <div class="text-[10px] font-mono text-emerald-700 mt-0.5">L-Theanine + EGCG</div>
            <p class="text-[11px] text-slate-500 mt-1">Generates alpha brain waves for relaxed hyperfocus.</p>
          </div>

          <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div class="text-2xl mb-1">🌰</div>
            <div class="text-xs font-bold text-slate-900">Raw Walnuts</div>
            <div class="text-[10px] font-mono text-emerald-700 mt-0.5">ALA & Polyphenols</div>
            <p class="text-[11px] text-slate-500 mt-1">Protects against oxidative stress and cognitive decline.</p>
          </div>

          <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div class="text-2xl mb-1">🍫</div>
            <div class="text-xs font-bold text-slate-900">Dark Chocolate 85%+</div>
            <div class="text-[10px] font-mono text-emerald-700 mt-0.5">Flavanols & Theobromine</div>
            <p class="text-[11px] text-slate-500 mt-1">Boosts nitric oxide for instantaneous brain oxygenation.</p>
          </div>

          <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div class="text-2xl mb-1">🥬</div>
            <div class="text-xs font-bold text-slate-900">Dark Leafy Greens</div>
            <div class="text-[10px] font-mono text-emerald-700 mt-0.5">Lutein & Folate</div>
            <p class="text-[11px] text-slate-500 mt-1">Slows cognitive aging and supports methylation pathways.</p>
          </div>
        </div>
      </section>
    </div>
  `
})
export class DietComponent {
  service = inject(ProductivityService);
  audio = inject(AudioService);

  selectedCategory = signal<string>('all');
  glassArray = [1, 2, 3, 4, 5, 6, 7, 8];

  hydrationPercentage = computed(() => {
    const current = this.service.stats().waterGlasses;
    const target = this.service.targetWaterGlasses();
    return Math.min(100, Math.round((current / target) * 100));
  });

  filteredRecommendations = computed(() => {
    const all = this.service.healthExpertRecommendations();
    const cat = this.selectedCategory();
    if (cat === 'all') return all;
    return all.filter(r => r.category === cat);
  });

  isMealActive(meal: MealTiming): boolean {
    return this.service.currentMealStatus().activeMeal?.id === meal.id;
  }

  isMealCompleted(mealId: string): boolean {
    return !!this.service.consumedMeals()[mealId];
  }

  toggleMeal(mealId: string) {
    this.audio.playSuccessChime();
    this.service.toggleMealConsumed(mealId);
  }

  logWater() {
    this.audio.playTick();
    this.service.logHydration();
  }

  decrementWater() {
    this.service.decrementHydration();
  }

  resetWater() {
    this.service.resetHydration();
  }

  setGlassCount(count: number) {
    this.audio.playTick();
    const current = this.service.stats().waterGlasses;
    if (count > current) {
      for (let i = current; i < count; i++) {
        this.service.logHydration();
      }
    } else {
      this.service.decrementHydration();
    }
  }

  listenToRec(rec: HealthExpertRecommendation) {
    this.audio.speakText(`${rec.title}. Protocol by ${rec.expert}. ${rec.keyRule}. ${rec.actionableProtocol}`);
  }
}

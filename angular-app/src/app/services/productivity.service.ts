import { Injectable, signal, computed, inject } from '@angular/core';
import {
  CalendarEvent,
  Reminder,
  DailyStats,
  Quote,
  ViewTab,
  FreeTimeSummary,
  FreeTimeSlot,
  NextEventInfo,
  MealTiming,
  HealthExpertRecommendation,
  ProductivityTip
} from '../models/productivity.models';
import { DatabaseService } from './database.service';

export const INITIAL_QUOTES: Quote[] = [
  // --- DISCIPLINE WISDOM ---
  {
    id: 'q-disc-1',
    text: 'Discipline equals freedom. It is not the restriction of your life, but the very mechanism that grants you autonomy over your destiny.',
    author: 'Jocko Willink',
    category: 'Discipline',
    reflectionPrompt: 'Where can establishing a strict, non-negotiable rule liberate your energy from continuous decision fatigue?'
  },
  {
    id: 'q-disc-2',
    text: 'You could be good today, but instead you choose tomorrow.',
    author: 'Marcus Aurelius',
    category: 'Discipline',
    reflectionPrompt: 'What task or standard have you been pushing off to tomorrow that you can execute in the next 15 minutes?'
  },
  {
    id: 'q-disc-3',
    text: 'We must all suffer one of two things: the pain of discipline or the pain of regret. Discipline weighs ounces; regret weighs tons.',
    author: 'Jim Rohn',
    category: 'Discipline',
    reflectionPrompt: 'Will temporary discomfort right now feel worse than looking back weeks from now with disappointment?'
  },
  {
    id: 'q-disc-4',
    text: 'How long are you going to wait before you demand the best for yourself, and in no instance bypass the discriminations of reason?',
    author: 'Epictetus',
    category: 'Discipline',
    reflectionPrompt: 'What standard are you tolerating in your work or habits that falls below your true capability?'
  },
  {
    id: 'q-disc-5',
    text: 'Discipline is choosing between what you want now and what you want most.',
    author: 'Abraham Lincoln',
    category: 'Discipline',
    reflectionPrompt: 'What short-term dopamine trap or comfort must you decline right now to protect your primary goal?'
  },
  {
    id: 'q-disc-6',
    text: 'Self-discipline is the ability to do what you should do, when you should do it, whether you feel like it or not.',
    author: 'Brian Tracy',
    category: 'Discipline',
    reflectionPrompt: 'Notice if you are waiting for emotional motivation. Act first, and let momentum follow action.'
  },
  {
    id: 'q-disc-7',
    text: 'Fix your mind on the work at hand. Do not let your spirit slacken for a single instant, and do nothing that is of no use.',
    author: 'Miyamoto Musashi',
    category: 'Discipline',
    reflectionPrompt: 'Scan your current desk and open browser tabs. Which items are of no use to your mission today?'
  },
  {
    id: 'q-disc-8',
    text: 'Only the disciplined ones in life are free. If you are undisciplined, you are a slave to your moods and your passions.',
    author: 'Eliud Kipchoge',
    category: 'Discipline',
    reflectionPrompt: 'Are you running your schedule today, or are transient moods dictating your productivity?'
  },
  {
    id: 'q-disc-9',
    text: 'I fear not the man who has practiced 10,000 kicks once, but I fear the man who has practiced one kick 10,000 times.',
    author: 'Bruce Lee',
    category: 'Discipline',
    reflectionPrompt: 'What core skill or routine do you need to practice with relentless repetition rather than chasing novelty?'
  },
  {
    id: 'q-disc-10',
    text: 'The superior person is disciplined in speech and energetic in action; they act before they speak, and afterwards speak according to their actions.',
    author: 'Confucius',
    category: 'Discipline',
    reflectionPrompt: 'Stop announcing your intentions. Let your completed output speak for itself.'
  },

  // --- TIME IMPORTANCE & TIME MASTERY WISDOM ---
  {
    id: 'q-time-1',
    text: 'People are frugal in guarding their personal property; but as soon as it comes to squandering time they are most wasteful of the one thing in which it is right to be stingy.',
    author: 'Seneca',
    category: 'Time Mastery',
    reflectionPrompt: 'If someone attempted to steal your bank balance, you would fight them. Why allow trivial distractions to steal your irreplaceable hours?'
  },
  {
    id: 'q-time-2',
    text: 'Time is the scarcest resource and unless it is managed nothing else can be managed.',
    author: 'Peter Drucker',
    category: 'Time Mastery',
    reflectionPrompt: 'Have you explicitly reserved dedicated calendar blocks for what truly moves the needle today?'
  },
  {
    id: 'q-time-3',
    text: 'Time is the coin of your life. It is the only coin you have, and only you can determine how it will be spent. Be careful lest you let other people spend it for you.',
    author: 'Carl Sandburg',
    category: 'Time Mastery',
    reflectionPrompt: 'Are you reacting to everyone else’s urgent interruptions at the expense of your own vital priorities?'
  },
  {
    id: 'q-time-4',
    text: 'If you love life, don’t waste time, for time is what life is made up of.',
    author: 'Bruce Lee',
    category: 'Time Mastery',
    reflectionPrompt: 'Treat the remaining hours of today as precious, non-refundable assets.'
  },
  {
    id: 'q-time-5',
    text: 'Lost time is never found again, and what we call time enough always proves little enough.',
    author: 'Benjamin Franklin',
    category: 'Time Mastery',
    reflectionPrompt: 'What high-leverage initiative can you start right now before the day’s golden hours vanish?'
  },
  {
    id: 'q-time-6',
    text: 'It is not that we have a short time to live, but that we waste a lot of it. Life is long enough, and sufficiently generous for the highest achievements, if it were all well invested.',
    author: 'Seneca',
    category: 'Time Mastery',
    reflectionPrompt: 'If you reclaimed just 90 minutes of unfocused passive scrolling today, what masterpiece could you build?'
  },
  {
    id: 'q-time-7',
    text: 'Time is free, but it’s priceless. You can’t own it, but you can use it. You can’t keep it, but you can spend it. Once you’ve lost it, you can never get it back.',
    author: 'Harvey MacKay',
    category: 'Time Mastery',
    reflectionPrompt: 'What is the single most valuable, compounding use of your next 60 minutes?'
  },
  {
    id: 'q-time-8',
    text: 'The way you spend your hours determines the way you live your years. Protect your prime hours and you protect your destiny.',
    author: 'Robin Sharma',
    category: 'Time Mastery',
    reflectionPrompt: 'How will you intentionally frame your next work block to honor your long-term ambitions?'
  },
  {
    id: 'q-time-9',
    text: 'Think of yourself as dead. You have lived your life. Now take what’s left and live it properly. Stop letting time drift by like smoke.',
    author: 'Marcus Aurelius',
    category: 'Time Mastery',
    reflectionPrompt: 'If today was the restart of your career, what would you immediately stop doing?'
  },
  {
    id: 'q-time-10',
    text: 'The two most powerful warriors are patience and time. Great things are accomplished not by violent spasms of effort, but by perseverance across daily time blocks.',
    author: 'Leo Tolstoy',
    category: 'Time Mastery',
    reflectionPrompt: 'Trust the compound effect of showing up focused every single day.'
  },

  // --- HABITS & FOCUS FOUNDATIONS ---
  {
    id: 'q-1',
    text: 'You do not rise to the level of your goals. You fall to the level of your systems.',
    author: 'James Clear',
    category: 'Habits',
    reflectionPrompt: 'What system in your day needs a minor tweak to make good work effortless?'
  },
  {
    id: 'q-3',
    text: 'Focus is a matter of deciding what things you are NOT going to do.',
    author: 'John Carmack',
    category: 'Focus',
    reflectionPrompt: 'What is one task you can deliberately choose to ignore or delete today?'
  },
  {
    id: 'q-4',
    text: 'Deep work is the ability to focus without distraction on a cognitively demanding task.',
    author: 'Cal Newport',
    category: 'Focus',
    reflectionPrompt: 'Protect your next block of time like a sacred reservation.'
  }
];

export const INITIAL_MEAL_TIMINGS: MealTiming[] = [
  {
    id: 'meal-1',
    name: 'Morning Hydration & Electrolytes',
    timeRange: '05:30 - 06:30',
    startMinutes: 330,
    endMinutes: 390,
    icon: '💧',
    phase: 'Early Morning',
    summary: 'Rehydrate neurological tissue immediately upon waking before cognitive work.',
    idealFoods: ['500ml filtered room-temp water', 'Pinch of Himalayan / Celtic sea salt', 'Fresh lemon squeeze'],
    foodsToAvoid: ['Immediate caffeine (delay 90-120 min)', 'Sugary juices', 'Processed pastries'],
    expertGuidance: 'Dr. Andrew Huberman: Rehydration with sodium & potassium supports neuronal action potentials. Delaying caffeine allows natural adenosine clearance and prevents 2 PM crashes.',
    caffeineAllowed: false,
    waterIntakeTargetMl: 500
  },
  {
    id: 'meal-2',
    name: 'Dopamine & Protein Anchor Breakfast',
    timeRange: '07:30 - 09:00',
    startMinutes: 450,
    endMinutes: 540,
    icon: '🍳',
    phase: 'Morning',
    summary: 'High-protein, low-glycemic fuel to stimulate sustained L-tyrosine dopamine synthesis without insulin spikes.',
    idealFoods: ['30-40g clean protein (pasture-raised eggs, Greek yogurt, or plant isolate)', 'Avocado / healthy fats', 'Wild blueberries (anthocyanins)', 'Raw walnuts'],
    foodsToAvoid: ['Refined cereals', 'Pancakes / maple syrup', 'White toast', 'High-sugar smoothies'],
    expertGuidance: 'Dr. Donald Layman & Dr. Peter Attia: Reaching 30g+ protein triggers the leucine threshold for muscle protein synthesis and blunts glucose volatility, preserving razor-sharp morning focus.',
    caffeineAllowed: true,
    waterIntakeTargetMl: 350
  },
  {
    id: 'meal-3',
    name: 'Peak Performance Focus Lunch',
    timeRange: '12:30 - 13:45',
    startMinutes: 750,
    endMinutes: 825,
    icon: '🥗',
    phase: 'Midday',
    summary: 'Fiber-rich complex meal designed to eliminate the notorious afternoon brain fog and postprandial sleepiness.',
    idealFoods: ['Wild salmon, grilled chicken breast or tempeh', 'Large dark leafy greens salad', 'Extra virgin olive oil (EVOO)', 'Quinoa or sweet potato (moderate carb)', 'Fermented kimchi / kraut'],
    foodsToAvoid: ['Heavy refined pasta', 'Deep-fried foods', 'White bread sandwiches', 'Sugary sodas / sweetened teas'],
    expertGuidance: 'Harvard T.H. Chan Public Health: Heavy carbohydrate loads trigger excessive parasympathetic redirection of blood flow to digestion. Emphasize colorful phytonutrients and polyphenol-dense EVOO.',
    caffeineAllowed: true,
    waterIntakeTargetMl: 500
  },
  {
    id: 'meal-4',
    name: 'Afternoon Neural Refresh Snack',
    timeRange: '16:00 - 16:30',
    startMinutes: 960,
    endMinutes: 990,
    icon: '🥜',
    phase: 'Afternoon',
    summary: 'Micronutrient bridge to support neurotransmitter replenishment before the final workday push.',
    idealFoods: ['Raw walnuts / almonds (omega-3 ALA)', '85%+ dark cacao (theobromine & flavanols)', 'Green tea / matcha (L-theanine for calm alertness)', 'Sliced cucumber with sea salt'],
    foodsToAvoid: ['Candy bars', 'Coffee after 2-3 PM (caffeine half-life is 5-7 hours)', 'Energy drinks', 'Commercial chips'],
    expertGuidance: 'Dr. Matthew Walker: Caffeine has a quarter-life of up to 12 hours. Switching to water or herbal teas after 2 PM protects deep stage 3/4 non-REM restorative sleep.',
    caffeineAllowed: false,
    waterIntakeTargetMl: 350
  },
  {
    id: 'meal-5',
    name: 'Restorative Digestion Dinner',
    timeRange: '19:00 - 20:15',
    startMinutes: 1140,
    endMinutes: 1215,
    icon: '🍲',
    phase: 'Evening',
    summary: 'Warm, easily digestible meal allowing complete digestion 2.5-3 hours before bed.',
    idealFoods: ['Steamed wild fish, lentils or poultry', 'Steamed broccoli / zucchini / asparagus', 'Slow-burning complex carbs (sweet potato / brown rice) to assist tryptophan serotonin conversion', 'Chamomile tea'],
    foodsToAvoid: ['Spicy dishes (increases core temp)', 'Alcohol (destroys REM sleep architecture)', 'Large red meat steaks', 'Late-night sugary snacks'],
    expertGuidance: 'Dr. Satchin Panda: The gut microbiome exhibits circadian rhythms. Completing dinner by 8:00 PM allows natural gene expression for cellular repair and autophagy during the overnight fast.',
    caffeineAllowed: false,
    waterIntakeTargetMl: 250
  },
  {
    id: 'meal-6',
    name: 'Circadian Fasting & Cellular Repair',
    timeRange: '20:30 - 05:30',
    startMinutes: 1230,
    endMinutes: 330,
    icon: '🌙',
    phase: 'Night Fast',
    summary: '12-14 hour overnight time-restricted fasting window for metabolic flexibility, autophagy, and growth hormone release.',
    idealFoods: ['Pure water if thirsty (sips)', 'Herbal teas (chamomile, peppermint, magnesium glycinate)'],
    foodsToAvoid: ['All caloric food and snacks', 'Late night drinks'],
    expertGuidance: 'Dr. Valter Longo (USC Longevity Institute): A regular 12-hour overnight fast triggers cellular housekeeping (autophagy), improves insulin sensitivity, and lowers systemic inflammatory markers.',
    caffeineAllowed: false,
    waterIntakeTargetMl: 150
  }
];

export const INITIAL_HEALTH_RECOMMENDATIONS: HealthExpertRecommendation[] = [
  {
    id: 'rec-1',
    title: 'The 90-Minute Caffeine Delay Protocol',
    expert: 'Dr. Andrew Huberman',
    roleAndInstitution: 'Professor of Neurobiology, Stanford School of Medicine',
    category: 'Energy Crash Prevention',
    keyRule: 'Delay caffeine consumption for 90 to 120 minutes after waking up.',
    actionableProtocol: 'Upon waking, drink 500ml water with sea salt and get 10 minutes of direct morning sunlight. Let natural cortisol rise to clear lingering adenosine. Enjoy your first coffee around 8:00 AM.',
    scientificMechanism: 'Adenosine builds sleep pressure. If you block adenosine receptors with caffeine immediately, the adenosine waits; once caffeine clears, all queued adenosine floods receptors, causing the severe 2 PM afternoon crash.',
    impactBadge: 'Prevents Afternoon Fatigue',
    icon: '☕',
    color: 'emerald'
  },
  {
    id: 'rec-2',
    title: 'Time-Restricted Feeding for Autophagy',
    expert: 'Dr. Satchin Panda',
    roleAndInstitution: 'Lead Circadian Biologist, Salk Institute for Biological Studies',
    category: 'Circadian Fasting',
    keyRule: 'Restrict all caloric consumption to a consistent 10-12 hour daily window.',
    actionableProtocol: 'If your first bite is at 8:00 AM, finish dinner by 7:00 PM. Leave a minimum of 2-3 hours between your last bite of food and your head touching the pillow.',
    scientificMechanism: 'Every organ and gut cell operates on clock genes. Constant feeding keeps metabolic machinery working 24/7. Fasting for 12-14 hours activates autophagy (cellular recycling) and mitochondrial rejuvenation.',
    impactBadge: 'Mitochondrial Repair',
    icon: '⏳',
    color: 'indigo'
  },
  {
    id: 'rec-3',
    title: 'The 30g Morning Protein Anchor',
    expert: 'Dr. Peter Attia & Dr. Donald Layman',
    roleAndInstitution: 'Longevity Medicine & Nutritional Biochemistry Experts',
    category: 'Cognitive Fuel',
    keyRule: 'Consume 30-40 grams of bioavailable protein in your first meal of the day.',
    actionableProtocol: 'Build breakfast around eggs, smoked salmon, whey/pea isolate, or Greek yogurt. Avoid naked carbohydrates like bagels, pastries, and instant oatmeal.',
    scientificMechanism: '30g of protein provides 2.5-3g of leucine to activate mTOR in muscle and flood the brain with L-tyrosine (dopamine/norepinephrine precursor), providing 4-5 hours of steady, distraction-free executive function.',
    impactBadge: 'Dopamine & Focus Stability',
    icon: '🍳',
    color: 'amber'
  },
  {
    id: 'rec-4',
    title: 'The Bodyweight Hydration & Sodium Rule',
    expert: 'Dr. Stacy Sims & Dr. Andy Galpin',
    roleAndInstitution: 'Human Performance & Exercise Physiology Researchers',
    category: 'Hydration Science',
    keyRule: 'Drink 30-35ml of water per kg of body weight, frontloaded before 4:00 PM.',
    actionableProtocol: 'A 70kg person needs ~2.4L daily. Add a pinch of unprocessed salt or electrolytes to your morning water to aid cellular hydration instead of rapid excretion.',
    scientificMechanism: 'Just 1-2% dehydration impairs working memory, processing speed, and executive decision-making by up to 15%. Sodium maintains plasma volume and intracellular osmotic balance.',
    impactBadge: 'Cognitive Speed',
    icon: '💧',
    color: 'sky'
  },
  {
    id: 'rec-5',
    title: 'The 3-Hour Pre-Sleep Kitchen Curfew',
    expert: 'Dr. Matthew Walker',
    roleAndInstitution: 'Director of Center for Human Sleep Science, UC Berkeley',
    category: 'Gut-Brain Axis',
    keyRule: 'Cease all food intake at least 3 hours prior to sleep bedtime.',
    actionableProtocol: 'If your target bedtime is 10:30 PM, your dinner should conclude by 7:30 PM. Swap late-night fridge raiding for magnesium L-threonate or chamomile.',
    scientificMechanism: 'Active digestion keeps core body temperature elevated and elevates resting heart rate. Sleep onset requires core temperature to drop by ~1°C; eating late prevents deep slow-wave NREM and REM restorative cycles.',
    impactBadge: 'Deep Sleep Architecture',
    icon: '🌙',
    color: 'purple'
  }
];

export const INITIAL_PRODUCTIVITY_TIPS: ProductivityTip[] = [
  {
    id: 'tip-1',
    title: 'The 90-Minute Ultradian Rhythm Cycle',
    subtitle: 'Synchronize high-friction deep work with your brain’s biological energy waves.',
    source: 'Dr. Nathaniel Kleitman & Dr. K. Anders Ericsson Research',
    category: 'Energy Cycles',
    mechanism: 'The human brain operates in 90-minute BRAC (Basic Rest-Activity Cycle) waves of peak neural vigilance, followed by a 15-20 minute trough of mental fatigue.',
    actionableSteps: [
      'Choose ONE single high-leverage objective before starting.',
      'Set an uninterrupted 90-minute timer; close email, Slack, and browser tabs.',
      'When the timer rings, step completely away from screens for 10-15 minutes (walk, hydrate, or gaze out a window).'
    ],
    timeInvestment: '90m Focus + 15m Reset',
    impactRating: '10x Multiplier',
    icon: '⚡',
    badgeText: 'Science-Backed Focus'
  },
  {
    id: 'tip-2',
    title: 'The 2-Minute Gateway Rule',
    subtitle: 'Eliminate micro-friction and cognitive residue before it accumulates.',
    source: 'David Allen, Getting Things Done (GTD)',
    category: 'Execution Speed',
    mechanism: 'Mental tasks lingering in working memory trigger the Zeigarnik effect, creating chronic background anxiety and cognitive drag.',
    actionableSteps: [
      'When reviewing reminders, messages, or incoming tasks: if it takes under 2 minutes, execute it right now.',
      'Do not write it down, do not postpone, do not bookmark.',
      'Instantly clears cognitive headspace for creative and strategic priorities.'
    ],
    timeInvestment: '< 2 Minutes',
    impactRating: 'Daily Essential',
    icon: '⏱️',
    badgeText: 'Instant Clarity'
  },
  {
    id: 'tip-3',
    title: 'Timeboxing Over Open-Ended To-Do Lists',
    subtitle: 'Convert vague task intentions into concrete temporal calendar reservations.',
    source: 'Harvard Business Review Top Productivity Method Analysis',
    category: 'Time Architecture',
    mechanism: 'To-do lists create choice fatigue and bias toward trivial low-effort tasks. Timeboxing creates visual accountability and realistic capacity constraints.',
    actionableSteps: [
      'Identify your 2 most critical outcomes for today.',
      'Assign an exact start and end time on your calendar (e.g. 09:00 - 11:00).',
      'Treat that calendar block with the same non-negotiable sanctity as a meeting with an executive.'
    ],
    timeInvestment: '5m Daily Planning',
    impactRating: '10x Multiplier',
    icon: '📅',
    badgeText: 'HBR #1 Strategy'
  },
  {
    id: 'tip-4',
    title: 'Parkinson’s Law Artificial Time Compression',
    subtitle: 'Ration allotted time to force clarity and ruthless elimination of perfectionism.',
    source: 'Cyril Northcote Parkinson & Tim Ferriss (4-Hour Workweek)',
    category: 'Execution Speed',
    mechanism: 'Work automatically expands to fill the temporal space allocated for its completion. Halving time constraints strips away unnecessary decorative fluff.',
    actionableSteps: [
      'For your next project or presentation, cut your estimated deadline in half.',
      'Identify the 20% of inputs that produce 80% of the required business value.',
      'Work with fierce urgency to deliver a robust v1 rather than over-polishing.'
    ],
    timeInvestment: 'Instant Shift',
    impactRating: 'High Impact',
    icon: '🚀',
    badgeText: 'Speed & Elimination'
  },
  {
    id: 'tip-5',
    title: 'Batch Communications & Context Defense',
    subtitle: 'Protect deep attention by confining messaging to 2 designated daily windows.',
    source: 'Cal Newport, Deep Work & Dr. Gloria Mark Attention Studies',
    category: 'Focus Mastery',
    mechanism: 'Studies show it takes an average of 23 minutes and 15 seconds to fully regain deep focus after a single message interruption.',
    actionableSteps: [
      'Process incoming emails and team chats strictly in 2 batches (e.g. 11:30 AM and 4:30 PM).',
      'Close communication clients and disable notifications during your deep work hours.',
      'Set expectations with teammates that asynchronous responses occur within 2-4 hours, not 2-4 minutes.'
    ],
    timeInvestment: 'Saves 2+ Hours Daily',
    impactRating: '10x Multiplier',
    icon: '🛡️',
    badgeText: 'Attention Shield'
  }
];

@Injectable({
  providedIn: 'root'
})
export class ProductivityService {
  private db = inject(DatabaseService);

  private readonly STORAGE_EVENTS = 'chronos_angular_events';
  private readonly STORAGE_REMINDERS = 'chronos_angular_reminders';
  private readonly STORAGE_STATS = 'chronos_angular_stats';
  private readonly STORAGE_QUOTES = 'chronos_angular_quotes';

  // Reactive state signals
  events = signal<CalendarEvent[]>(this.loadInitialEvents());
  reminders = signal<Reminder[]>(this.loadInitialReminders());
  stats = signal<DailyStats>(this.loadInitialStats());
  quotes = signal<Quote[]>(this.loadInitialQuotes());
  currentTab = signal<ViewTab>('dashboard');
  isDbConnected = signal<boolean>(true);

  // 5-minute quote rotation state (300 seconds)
  currentQuoteIndex = signal<number>(0);
  quoteRotationSecondsLeft = signal<number>(300);
  private quoteTimerInterval: any = null;

  // Computed signals
  unreadRemindersCount = computed(() => this.reminders().filter(r => !r.completed).length);

  quoteOfTheDay = computed(() => {
    const qList = this.quotes();
    if (!qList || qList.length === 0) return INITIAL_QUOTES[0];
    const idx = Math.abs(this.currentQuoteIndex()) % qList.length;
    return qList[idx] || qList[0];
  });

  quoteCountdownFormatted = computed(() => {
    const totalSecs = this.quoteRotationSecondsLeft();
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  });

  // Live clock & next event tracking
  currentTime = signal<Date>(new Date());
  private clockInterval: any = null;

  // Auto-cleanup past events tracking
  autoCleanupEnabled = signal<boolean>(true);
  totalAutoCleanedEvents = signal<number>(0);
  lastAutoCleanedTimestamp = signal<string>('');

  // Diet, health, and productivity tip signals
  private readonly STORAGE_MEALS = 'chronos_angular_meals';
  mealTimings = signal<MealTiming[]>(INITIAL_MEAL_TIMINGS);
  healthExpertRecommendations = signal<HealthExpertRecommendation[]>(INITIAL_HEALTH_RECOMMENDATIONS);
  productivityTips = signal<ProductivityTip[]>(INITIAL_PRODUCTIVITY_TIPS);
  currentTipIndex = signal<number>(0);
  consumedMeals = signal<Record<string, boolean>>(this.loadConsumedMeals());
  targetWaterGlasses = signal<number>(8);

  topProductivityTip = computed<ProductivityTip>(() => {
    const list = this.productivityTips();
    if (!list || list.length === 0) return INITIAL_PRODUCTIVITY_TIPS[0];
    const idx = Math.abs(this.currentTipIndex()) % list.length;
    return list[idx] || list[0];
  });

  currentMealStatus = computed(() => {
    const now = this.currentTime();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const meals = this.mealTimings();

    // Check if a meal window is actively open
    for (const m of meals) {
      if (m.startMinutes < m.endMinutes) {
        if (currentMins >= m.startMinutes && currentMins < m.endMinutes) {
          const remainingMins = m.endMinutes - currentMins;
          return {
            activeMeal: m,
            status: 'active' as const,
            minutesRemaining: remainingMins,
            label: `Active Window: ${m.name}`,
            countdownText: `${remainingMins}m left in window`,
            nextMeal: null as MealTiming | null
          };
        }
      } else {
        // Overnight window
        if (currentMins >= m.startMinutes || currentMins < m.endMinutes) {
          let remainingMins = 0;
          if (currentMins >= m.startMinutes) {
            remainingMins = (1440 - currentMins) + m.endMinutes;
          } else {
            remainingMins = m.endMinutes - currentMins;
          }
          return {
            activeMeal: m,
            status: 'active' as const,
            minutesRemaining: remainingMins,
            label: `Active Window: ${m.name}`,
            countdownText: `${Math.floor(remainingMins / 60)}h ${remainingMins % 60}m left`,
            nextMeal: null as MealTiming | null
          };
        }
      }
    }

    // Find next upcoming meal
    let nextMeal: MealTiming | null = null;
    let minDiff = Infinity;
    for (const m of meals) {
      let diff = m.startMinutes - currentMins;
      if (diff < 0) {
        diff += 1440;
      }
      if (diff < minDiff && diff > 0) {
        minDiff = diff;
        nextMeal = m;
      }
    }

    const hours = Math.floor(minDiff / 60);
    const mins = minDiff % 60;
    const countdown = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    return {
      activeMeal: null as MealTiming | null,
      status: 'upcoming' as const,
      minutesRemaining: minDiff,
      label: nextMeal ? `Upcoming: ${nextMeal.name}` : 'Next Window',
      countdownText: `Starts in ${countdown} (${nextMeal?.timeRange || ''})`,
      nextMeal
    };
  });

  nextEvent = computed<NextEventInfo | null>(() => {
    return this.computeNextEvent();
  });

  constructor() {
    this.hydrateFromDatabase();
    this.startQuoteRotationTimer();
    this.startClockTimer();
  }

  /**
   * Keep current time reactive for live event countdowns & next event tracking,
   * and automatically purge past elapsed events.
   */
  startClockTimer() {
    if (typeof window === 'undefined') return;
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
    this.clockInterval = setInterval(() => {
      this.currentTime.set(new Date());
      if (this.autoCleanupEnabled()) {
        this.autoRemovePastEvents();
      }
    }, 10000);
  }

  /**
   * Automatically rotates quote every 5 minutes (300 seconds)
   */
  startQuoteRotationTimer() {
    if (typeof window === 'undefined') return;
    if (this.quoteTimerInterval) {
      clearInterval(this.quoteTimerInterval);
    }

    this.quoteTimerInterval = setInterval(() => {
      if (this.quoteRotationSecondsLeft() > 1) {
        this.quoteRotationSecondsLeft.update(s => s - 1);
      } else {
        this.rotateQuote();
      }
    }, 1000);
  }

  /**
   * Rotates to the next quote and resets the 5-minute countdown
   */
  rotateQuote() {
    const qList = this.quotes();
    if (qList.length > 1) {
      this.currentQuoteIndex.update(idx => (idx + 1) % qList.length);
    }
    this.quoteRotationSecondsLeft.set(300);
  }

  /**
   * Asynchronously hydrate state from IndexedDB database and seed if empty
   */
  async hydrateFromDatabase() {
    try {
      const [dbEvents, dbReminders, dbQuotes] = await Promise.all([
        this.db.getAllEvents(),
        this.db.getAllReminders(),
        this.db.getAllQuotes(),
      ]);

      if (dbEvents && dbEvents.length > 0) {
        this.events.set(dbEvents);
      } else {
        // Seed database with initial events
        for (const evt of this.events()) {
          await this.db.saveEvent(evt);
        }
      }

      // Automatically purge any past events upon hydration
      if (this.autoCleanupEnabled()) {
        await this.autoRemovePastEvents();
      }

      if (dbReminders && dbReminders.length > 0) {
        this.reminders.set(dbReminders);
      } else {
        // Seed database with initial reminders
        for (const rem of this.reminders()) {
          await this.db.saveReminder(rem);
        }
      }

      if (dbQuotes && dbQuotes.length > 0) {
        // Merge in any new initial quotes that aren't yet in IndexedDB
        const existingIds = new Set(dbQuotes.map(q => q.id));
        const missing = INITIAL_QUOTES.filter(q => !existingIds.has(q.id));
        if (missing.length > 0) {
          const merged = [...dbQuotes, ...missing];
          this.quotes.set(merged);
          this.saveToStorage(this.STORAGE_QUOTES, merged);
          for (const nq of missing) {
            await this.db.saveQuote(nq);
          }
        } else {
          this.quotes.set(dbQuotes);
        }
      } else {
        // Seed database with initial quotes
        for (const q of this.quotes()) {
          await this.db.saveQuote(q);
        }
      }

      const today = new Date().toISOString().split('T')[0];
      const dbStats = await this.db.getDailyStats(today);
      if (dbStats) {
        this.stats.set(dbStats);
      } else {
        await this.db.saveDailyStats(this.stats());
      }

      // Check remote REST / MySQL backend sync in background
      this.db.syncWithBackend().catch(() => {});
    } catch {
      // Fallback stays active
    }
  }

  // Tab navigation
  setTab(tab: ViewTab) {
    this.currentTab.set(tab);
  }

  // Events management (Dynamic DB backed)
  async addEvent(event: Omit<CalendarEvent, 'id'>) {
    // Generate individual event records with specific start dates based on selected frequency
    const newEvents = this.generateEventsByFrequency(event);
    this.events.update(list => [...newEvents, ...list]);
    this.saveToStorage(this.STORAGE_EVENTS, this.events());
    await this.db.saveMultipleEvents(newEvents);
    if (this.autoCleanupEnabled()) {
      await this.autoRemovePastEvents();
    }
  }

  async deleteEvent(id: string) {
    this.events.update(list => list.filter(e => e.id !== id));
    this.saveToStorage(this.STORAGE_EVENTS, this.events());
    await this.db.deleteEvent(id);
  }

  async deleteEventSeries(seriesId: string) {
    const idsToDelete = this.events()
      .filter(e => e.seriesId === seriesId)
      .map(e => e.id);

    this.events.update(list => list.filter(e => e.seriesId !== seriesId));
    this.saveToStorage(this.STORAGE_EVENTS, this.events());
    await this.db.deleteMultipleEvents(idsToDelete);
  }

  /**
   * Generates event records with specific start dates based on recurrence frequency:
   * - 'daily': Generates events for 60 consecutive days starting from startDate.
   * - 'weekly': Generates events for 26 weekly occurrences (6 months) on the specific weekday of startDate.
   * - 'monthly': Generates events for 12 monthly occurrences (1 year) on the specific day-of-month of startDate.
   * - 'none': Generates 1 event with the specified startDate.
   */
  generateEventsByFrequency(baseEvent: Omit<CalendarEvent, 'id'>): CalendarEvent[] {
    const freq = baseEvent.frequency || 'none';
    const seriesId = `series-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const startParts = (baseEvent.startDate || this.getLocalDateString()).split('-');
    const baseYear = parseInt(startParts[0], 10);
    const baseMonth = parseInt(startParts[1], 10) - 1;
    const baseDay = parseInt(startParts[2], 10);

    const generated: CalendarEvent[] = [];

    if (freq === 'none') {
      generated.push({
        ...baseEvent,
        id: `evt-${Date.now()}`,
        seriesId
      });
      return generated;
    }

    if (freq === 'daily') {
      // 60 days of daily occurrences each saved with its specific startDate
      for (let i = 0; i < 60; i++) {
        const d = new Date(baseYear, baseMonth, baseDay + i);
        const dateStr = this.getLocalDateString(d);
        generated.push({
          ...baseEvent,
          id: `evt-${Date.now()}-${i}`,
          seriesId,
          startDate: dateStr,
          frequency: 'daily'
        });
      }
      return generated;
    }

    if (freq === 'weekly') {
      // 26 weekly occurrences on the specific weekday
      for (let i = 0; i < 26; i++) {
        const d = new Date(baseYear, baseMonth, baseDay + (i * 7));
        const dateStr = this.getLocalDateString(d);
        generated.push({
          ...baseEvent,
          id: `evt-${Date.now()}-${i}`,
          seriesId,
          startDate: dateStr,
          frequency: 'weekly'
        });
      }
      return generated;
    }

    if (freq === 'monthly') {
      // 12 monthly occurrences on the specific day of month
      for (let i = 0; i < 12; i++) {
        const d = new Date(baseYear, baseMonth + i, baseDay);
        // Clamp to last day of month if original day exceeds month length (e.g. 31st in a 30-day month)
        if (d.getDate() !== baseDay) {
          const lastDayOfTargetMonth = new Date(baseYear, baseMonth + i + 1, 0);
          d.setTime(lastDayOfTargetMonth.getTime());
        }
        const dateStr = this.getLocalDateString(d);
        generated.push({
          ...baseEvent,
          id: `evt-${Date.now()}-${i}`,
          seriesId,
          startDate: dateStr,
          frequency: 'monthly'
        });
      }
      return generated;
    }

    generated.push({
      ...baseEvent,
      id: `evt-${Date.now()}`,
      seriesId
    });
    return generated;
  }

  /**
   * Evaluates if an event takes place on targetDateStr (YYYY-MM-DD).
   * For events saved with specific start dates (via frequency generator),
   * the event takes place strictly on its specific startDate.
   */
  isEventOnDate(event: CalendarEvent, targetDateStr: string): boolean {
    if (!event.startDate) return false;

    // Events saved with specific start dates match their explicit startDate
    if (event.startDate === targetDateStr) {
      return true;
    }

    // If the event belongs to an expanded series, it is already mapped to its specific date
    if (event.seriesId) {
      return event.startDate === targetDateStr;
    }

    // Fallback for legacy un-expanded events
    if (targetDateStr < event.startDate) return false;
    const freq = event.frequency || 'none';
    if (freq === 'daily') return true;
    if (freq === 'weekly') {
      const startD = new Date(event.startDate + 'T00:00:00');
      const targetD = new Date(targetDateStr + 'T00:00:00');
      return startD.getDay() === targetD.getDay();
    }
    if (freq === 'monthly') {
      const startDayNum = parseInt(event.startDate.split('-')[2], 10);
      const targetDayNum = parseInt(targetDateStr.split('-')[2], 10);
      return startDayNum === targetDayNum;
    }

    return event.startDate === targetDateStr;
  }

  /**
   * Determines if a calendar event has already passed.
   * - Events saved with specific start dates: passed if their startDate < todayStr,
   *   or if today and their endTime has elapsed.
   * - Legacy recurring events without seriesId: preserved for future cycles.
   */
  isPastEvent(event: CalendarEvent, referenceDate: Date = this.currentTime()): boolean {
    if (!event.startDate) return false;

    const todayStr = this.getLocalDateString(referenceDate);

    // If this is a legacy unexpanded recurring event, don't delete the root
    if (!event.seriesId && event.frequency && event.frequency !== 'none') {
      return false;
    }

    // For events with specific start dates:
    if (event.startDate < todayStr) {
      return true;
    }

    if (event.startDate === todayStr) {
      const nowMinutes = referenceDate.getHours() * 60 + referenceDate.getMinutes();
      const startMinutes = this.parseTimeToMinutes(event.startTime);
      let endMinutes = this.parseTimeToMinutes(event.endTime);
      if (endMinutes <= startMinutes) {
        endMinutes = Math.min(1440, startMinutes + 60);
      }
      return endMinutes <= nowMinutes;
    }

    return false;
  }

  /**
   * Automatically identifies and deletes all elapsed one-time events from state,
   * local storage, and the persistent IndexedDB database.
   * Returns the count of removed past events.
   */
  async autoRemovePastEvents(): Promise<number> {
    const currentEvents = this.events();
    const now = this.currentTime();
    const pastIds = currentEvents
      .filter(e => this.isPastEvent(e, now))
      .map(e => e.id);

    if (pastIds.length === 0) {
      return 0;
    }

    // Filter out past events reactively
    const survivingEvents = currentEvents.filter(e => !pastIds.includes(e.id));
    this.events.set(survivingEvents);
    this.saveToStorage(this.STORAGE_EVENTS, survivingEvents);

    // Batch delete from IndexedDB
    try {
      await this.db.deleteMultipleEvents(pastIds);
    } catch (e) {
      console.warn('Failed to delete past events from database', e);
    }

    // Update cleanup statistics
    this.totalAutoCleanedEvents.update(total => total + pastIds.length);
    const nowTimeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    this.lastAutoCleanedTimestamp.set(nowTimeStr);

    return pastIds.length;
  }

  /**
   * Toggles automatic past event removal (default: enabled)
   */
  toggleAutoCleanup() {
    this.autoCleanupEnabled.update(enabled => !enabled);
    if (this.autoCleanupEnabled()) {
      this.autoRemovePastEvents();
    }
  }

  parseTimeToMinutes(t: string): number {
    if (!t) return 0;
    const parts = t.split(':');
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    return h * 60 + m;
  }

  getLocalDateString(d: Date = new Date()): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  /**
   * Identifies and computes the immediate next event (or current in-progress event)
   * to spotlight across dashboard and calendar views.
   */
  computeNextEvent(): NextEventInfo | null {
    const allEvents = this.events();
    if (!allEvents || allEvents.length === 0) return null;

    const now = this.currentTime();
    const todayStr = this.getLocalDateString(now);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    // 1. Check today's events first
    const todayEvents = allEvents
      .filter(e => this.isEventOnDate(e, todayStr))
      .sort((a, b) => this.parseTimeToMinutes(a.startTime) - this.parseTimeToMinutes(b.startTime));

    // Check if an event is happening right now
    for (const evt of todayEvents) {
      const startMin = this.parseTimeToMinutes(evt.startTime);
      let endMin = this.parseTimeToMinutes(evt.endTime);
      if (endMin <= startMin) endMin = Math.min(1440, startMin + 60);

      if (startMin <= nowMinutes && nowMinutes < endMin) {
        const remaining = Math.max(1, endMin - nowMinutes);
        return {
          event: evt,
          isHappeningNow: true,
          minutesUntilStart: 0,
          minutesRemaining: remaining,
          urgency: 'now',
          timeUntilFormatted: `Happening now · Ends in ${remaining}m`,
          countdownFormatted: `${remaining}m left`,
          statusLabel: 'Active Now'
        };
      }
    }

    // Check if there is an upcoming event today
    for (const evt of todayEvents) {
      const startMin = this.parseTimeToMinutes(evt.startTime);
      if (startMin > nowMinutes) {
        const diff = startMin - nowMinutes;
        const urgency = diff <= 30 ? 'imminent' : 'today';
        const countdown = diff < 60 ? `${diff}m` : `${Math.floor(diff / 60)}h ${diff % 60}m`;
        return {
          event: evt,
          isHappeningNow: false,
          minutesUntilStart: diff,
          urgency,
          timeUntilFormatted: diff < 60 ? `Starts in ${diff} min` : `Starts in ${Math.floor(diff / 60)}h ${diff % 60}m (${evt.startTime})`,
          countdownFormatted: `in ${countdown}`,
          statusLabel: diff <= 30 ? 'Starting Soon' : 'Next Up Today'
        };
      }
    }

    // 2. Check future days (up to 30 days ahead)
    for (let dayOffset = 1; dayOffset <= 30; dayOffset++) {
      const futureD = new Date(now);
      futureD.setDate(now.getDate() + dayOffset);
      const futureStr = this.getLocalDateString(futureD);
      const futureEvents = allEvents
        .filter(e => this.isEventOnDate(e, futureStr))
        .sort((a, b) => this.parseTimeToMinutes(a.startTime) - this.parseTimeToMinutes(b.startTime));

      if (futureEvents.length > 0) {
        const evt = futureEvents[0];
        const dayLabel = dayOffset === 1
          ? 'Tomorrow'
          : (dayOffset < 7
              ? futureD.toLocaleDateString('en-US', { weekday: 'long' })
              : futureD.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        return {
          event: evt,
          isHappeningNow: false,
          minutesUntilStart: dayOffset * 1440,
          urgency: 'upcoming',
          timeUntilFormatted: `${dayLabel} at ${evt.startTime}`,
          countdownFormatted: dayOffset === 1 ? 'Tomorrow' : `in ${dayOffset}d`,
          statusLabel: 'Upcoming Event'
        };
      }
    }

    return null;
  }

  /**
   * Computes comprehensive free time analysis for a given date,
   * factoring in regular and recurring events.
   */
  getFreeTimeSummary(dateStr: string): FreeTimeSummary {
    const dayEvents = this.events().filter(e => this.isEventOnDate(e, dateStr));

    const parseTimeToMinutes = (t: string): number => {
      if (!t) return 0;
      const parts = t.split(':');
      const h = parseInt(parts[0], 10) || 0;
      const m = parseInt(parts[1], 10) || 0;
      return h * 60 + m;
    };

    const formatMinutesToHuman = (mins: number): string => {
      if (mins <= 0) return '0m';
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      if (h === 0) return `${m}m`;
      if (m === 0) return `${h}h`;
      return `${h}h ${m}m`;
    };

    const minutesToTimeString = (mins: number): string => {
      const clamped = Math.max(0, Math.min(1439, mins));
      const h = Math.floor(clamped / 60);
      const m = clamped % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    // Build raw intervals
    const rawIntervals: { start: number; end: number }[] = [];
    for (const evt of dayEvents) {
      const s = parseTimeToMinutes(evt.startTime);
      let e = parseTimeToMinutes(evt.endTime);
      if (e <= s) e = Math.min(1440, s + 60);
      rawIntervals.push({ start: s, end: e });
    }

    // Sort by start
    rawIntervals.sort((a, b) => a.start - b.start);

    // Merge overlapping intervals
    const merged: { start: number; end: number }[] = [];
    for (const interval of rawIntervals) {
      if (merged.length === 0) {
        merged.push({ ...interval });
      } else {
        const last = merged[merged.length - 1];
        if (interval.start <= last.end) {
          last.end = Math.max(last.end, interval.end);
        } else {
          merged.push({ ...interval });
        }
      }
    }

    // Total busy across 24h
    let totalBusyMinutes = 0;
    for (const m of merged) {
      totalBusyMinutes += (m.end - m.start);
    }
    const totalFreeMinutes24h = Math.max(0, 1440 - totalBusyMinutes);

    // Active daytime window: 05:00 (300 min / 5 AM) to 22:00 (1320 min / 10 PM) = 1020 minutes (17 hours)
    const WORKDAY_START = 300; // 05:00 (5 AM)
    const WORKDAY_END = 1320;  // 22:00 (10 PM)
    const WORKDAY_TOTAL = WORKDAY_END - WORKDAY_START; // 1020 mins (17 hours)

    const workdayBusyIntervals: { start: number; end: number }[] = [];
    for (const m of merged) {
      const startClamped = Math.max(WORKDAY_START, Math.min(WORKDAY_END, m.start));
      const endClamped = Math.max(WORKDAY_START, Math.min(WORKDAY_END, m.end));
      if (endClamped > startClamped) {
        workdayBusyIntervals.push({ start: startClamped, end: endClamped });
      }
    }

    let busyWorkdayMinutes = 0;
    for (const w of workdayBusyIntervals) {
      busyWorkdayMinutes += (w.end - w.start);
    }
    const totalFreeMinutesWorkday = Math.max(0, WORKDAY_TOTAL - busyWorkdayMinutes);
    const freePercentageWorkday = Math.round((totalFreeMinutesWorkday / WORKDAY_TOTAL) * 100);

    // Calculate free slots in the active workday window
    const freeSlots: FreeTimeSlot[] = [];
    let cursor = WORKDAY_START;

    for (const b of workdayBusyIntervals) {
      if (b.start > cursor) {
        const dur = b.start - cursor;
        if (dur >= 15) {
          freeSlots.push({
            startTime: minutesToTimeString(cursor),
            endTime: minutesToTimeString(b.start),
            durationMinutes: dur,
            durationFormatted: formatMinutesToHuman(dur),
            isFocusBlock: dur >= 90
          });
        }
      }
      cursor = Math.max(cursor, b.end);
    }

    if (cursor < WORKDAY_END) {
      const dur = WORKDAY_END - cursor;
      if (dur >= 15) {
        freeSlots.push({
          startTime: minutesToTimeString(cursor),
          endTime: minutesToTimeString(WORKDAY_END),
          durationMinutes: dur,
          durationFormatted: formatMinutesToHuman(dur),
          isFocusBlock: dur >= 90
        });
      }
    }

    let status: 'open' | 'moderate' | 'busy' = 'open';
    let statusLabel = 'High Availability';
    if (freePercentageWorkday >= 65) {
      status = 'open';
      statusLabel = dayEvents.length === 0 ? 'Completely Open' : 'High Availability';
    } else if (freePercentageWorkday >= 30) {
      status = 'moderate';
      statusLabel = 'Moderate Schedule';
    } else {
      status = 'busy';
      statusLabel = 'Heavily Booked';
    }

    return {
      dateStr,
      totalBusyMinutes,
      totalFreeMinutesWorkday,
      freePercentageWorkday,
      totalFreeMinutes24h,
      busyFormatted: formatMinutesToHuman(totalBusyMinutes),
      freeWorkdayFormatted: formatMinutesToHuman(totalFreeMinutesWorkday),
      free24hFormatted: formatMinutesToHuman(totalFreeMinutes24h),
      freeSlots,
      status,
      statusLabel
    };
  }

  // Reminders management (Dynamic DB backed)
  async addReminder(reminder: Omit<Reminder, 'id'>) {
    const newRem: Reminder = { ...reminder, id: `rem-${Date.now()}` };
    this.reminders.update(list => [newRem, ...list]);
    this.saveToStorage(this.STORAGE_REMINDERS, this.reminders());
    await this.db.saveReminder(newRem);
  }

  async toggleReminder(id: string) {
    let updatedReminder: Reminder | null = null;
    this.reminders.update(list =>
      list.map(r => {
        if (r.id === id) {
          const nextCompleted = !r.completed;
          this.stats.update(st => ({
            ...st,
            remindersCompletedToday: nextCompleted ? st.remindersCompletedToday + 1 : Math.max(0, st.remindersCompletedToday - 1)
          }));
          this.saveToStorage(this.STORAGE_STATS, this.stats());
          this.db.saveDailyStats(this.stats());

          updatedReminder = {
            ...r,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined
          };
          return updatedReminder;
        }
        return r;
      })
    );
    this.saveToStorage(this.STORAGE_REMINDERS, this.reminders());
    if (updatedReminder) {
      await this.db.saveReminder(updatedReminder);
    }
  }

  async deleteReminder(id: string) {
    this.reminders.update(list => list.filter(r => r.id !== id));
    this.saveToStorage(this.STORAGE_REMINDERS, this.reminders());
    await this.db.deleteReminder(id);
  }

  async snoozeReminder(id: string, minutes: number) {
    let snoozedItem: Reminder | null = null;
    this.reminders.update(list =>
      list.map(r => {
        if (r.id === id) {
          if (minutes === 1440) {
            const d = new Date();
            d.setDate(d.getDate() + 1);
            snoozedItem = { ...r, dueDate: d.toISOString().split('T')[0], snoozedUntil: 'Tomorrow' };
            return snoozedItem;
          }
          const now = new Date();
          now.setMinutes(now.getMinutes() + minutes);
          const hh = String(now.getHours()).padStart(2, '0');
          const mm = String(now.getMinutes()).padStart(2, '0');
          snoozedItem = { ...r, dueTime: `${hh}:${mm}`, snoozedUntil: `${hh}:${mm}` };
          return snoozedItem;
        }
        return r;
      })
    );
    this.saveToStorage(this.STORAGE_REMINDERS, this.reminders());
    if (snoozedItem) {
      await this.db.saveReminder(snoozedItem);
    }
  }

  // Breaks and Stats (Dynamic DB backed)
  async logBreak(minutes: number) {
    this.stats.update(st => ({
      ...st,
      breaksCompletedToday: st.breaksCompletedToday + 1,
      focusMinutesToday: st.focusMinutesToday + minutes
    }));
    this.saveToStorage(this.STORAGE_STATS, this.stats());
    await this.db.saveDailyStats(this.stats());
  }

  async logHydration() {
    this.stats.update(st => ({ ...st, waterGlasses: st.waterGlasses + 1 }));
    this.saveToStorage(this.STORAGE_STATS, this.stats());
    await this.db.saveDailyStats(this.stats());
  }

  async decrementHydration() {
    this.stats.update(st => ({ ...st, waterGlasses: Math.max(0, st.waterGlasses - 1) }));
    this.saveToStorage(this.STORAGE_STATS, this.stats());
    await this.db.saveDailyStats(this.stats());
  }

  async resetHydration() {
    this.stats.update(st => ({ ...st, waterGlasses: 0 }));
    this.saveToStorage(this.STORAGE_STATS, this.stats());
    await this.db.saveDailyStats(this.stats());
  }

  rotateProductivityTip() {
    const list = this.productivityTips();
    if (list.length > 1) {
      this.currentTipIndex.update(idx => (idx + 1) % list.length);
    }
  }

  toggleMealConsumed(mealId: string) {
    this.consumedMeals.update(m => {
      const next = { ...m, [mealId]: !m[mealId] };
      this.saveToStorage(this.STORAGE_MEALS, next);
      return next;
    });
  }

  private loadConsumedMeals(): Record<string, boolean> {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(this.STORAGE_MEALS) : null;
    if (raw) {
      try { return JSON.parse(raw); } catch {}
    }
    return {};
  }

  // Quotes (Dynamic DB backed)
  async toggleFavoriteQuote(id: string) {
    let favQuote: Quote | null = null;
    this.quotes.update(list =>
      list.map(q => {
        if (q.id === id) {
          favQuote = { ...q, favorite: !q.favorite };
          return favQuote;
        }
        return q;
      })
    );
    this.saveToStorage(this.STORAGE_QUOTES, this.quotes());
    if (favQuote) {
      await this.db.saveQuote(favQuote);
    }
  }

  async addCustomQuote(quote: Omit<Quote, 'id'>) {
    const newQuote: Quote = { ...quote, id: `q-${Date.now()}` };
    this.quotes.update(list => [newQuote, ...list]);
    this.saveToStorage(this.STORAGE_QUOTES, this.quotes());
    await this.db.saveQuote(newQuote);
  }

  // Initial fallbacks
  private loadInitialEvents(): CalendarEvent[] {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(this.STORAGE_EVENTS) : null;
    if (raw) {
      try { return JSON.parse(raw); } catch {}
    }
    const today = new Date().toISOString().split('T')[0];
    return [
      {
        id: 'evt-1',
        title: 'Morning Focus: Architecture & Core Engine',
        description: 'Deep work sprint on service layer and caching mechanisms.',
        startDate: today,
        startTime: '09:00',
        endTime: '11:00',
        category: 'deep-work',
        priority: 'high',
        frequency: 'daily'
      },
      {
        id: 'evt-2',
        title: 'Sprint Retrospective & Sync',
        startDate: today,
        startTime: '14:00',
        endTime: '14:45',
        category: 'meeting',
        priority: 'medium',
        frequency: 'weekly'
      }
    ];
  }

  private loadInitialReminders(): Reminder[] {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(this.STORAGE_REMINDERS) : null;
    if (raw) {
      try { return JSON.parse(raw); } catch {}
    }
    const today = new Date().toISOString().split('T')[0];
    return [
      {
        id: 'rem-1',
        title: 'Submit quarterly performance self-assessment',
        dueDate: today,
        dueTime: '13:00',
        priority: 'high',
        category: 'work',
        completed: false
      },
      {
        id: 'rem-2',
        title: 'Hydrate and complete 2-minute posture break',
        dueDate: today,
        dueTime: '15:30',
        priority: 'medium',
        category: 'health',
        completed: true
      }
    ];
  }

  private loadInitialStats(): DailyStats {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(this.STORAGE_STATS) : null;
    if (raw) {
      try { return JSON.parse(raw); } catch {}
    }
    return {
      focusMinutesToday: 85,
      breaksCompletedToday: 3,
      remindersCompletedToday: 2,
      waterGlasses: 4,
      currentStreakDays: 6,
      lastActiveDate: new Date().toISOString().split('T')[0]
    };
  }

  private loadInitialQuotes(): Quote[] {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(this.STORAGE_QUOTES) : null;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((q: Quote) => q.id));
          const missing = INITIAL_QUOTES.filter(q => !existingIds.has(q.id));
          return missing.length > 0 ? [...parsed, ...missing] : parsed;
        }
      } catch {}
    }
    return INITIAL_QUOTES;
  }

  private saveToStorage(key: string, data: unknown) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(data));
      }
    } catch (e) {
      console.error(e);
    }
  }
}

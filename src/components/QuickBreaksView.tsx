import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Eye, 
  Activity, 
  Wind, 
  Droplets, 
  CheckCircle2, 
  Bell, 
  Sparkles,
  ArrowRight,
  Flame
} from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface QuickBreaksViewProps {
  onLogBreakCompleted: (minutes: number) => void;
  onLogHydration: () => void;
  waterGlasses: number;
}

type BreakMode = 'pomodoro' | 'eye-strain' | 'stretch' | 'breathing';

export const QuickBreaksView: React.FC<QuickBreaksViewProps> = ({
  onLogBreakCompleted,
  onLogHydration,
  waterGlasses,
}) => {
  const [activeMode, setActiveMode] = useState<BreakMode>('pomodoro');

  // Focus & Break Timer states
  const [timerType, setTimerType] = useState<'focus' | 'short-break' | 'long-break'>('focus');
  const [durationMinutes, setDurationMinutes] = useState<number>(25);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessionsCompleted, setSessionsCompleted] = useState<number>(0);

  // 20-20-20 Eye Strain Break states
  const [eyeSeconds, setEyeSeconds] = useState<number>(20);
  const [isEyeRunning, setIsEyeRunning] = useState<boolean>(false);

  // Desk Stretch Routine states
  const stretchSteps = [
    {
      title: 'Cervical Neck Release',
      instruction: 'Gently tilt your right ear toward your right shoulder for 15s, then switch to the left. Relax your shoulders downward.',
      duration: 30,
    },
    {
      title: 'Shoulder Shrugs & Backward Rolls',
      instruction: 'Inhale and shrug shoulders up toward ears, then roll them back and down, opening your chest posture.',
      duration: 30,
    },
    {
      title: 'Wrist & Forearm Flexor Stretch',
      instruction: 'Extend your right arm forward, palm facing outward. Gently pull fingers back with left hand for 15s, then switch arms.',
      duration: 30,
    },
    {
      title: 'Seated Thoracic Spinal Twist',
      instruction: 'Place right hand on left knee, twist torso gently to the left and look over shoulder. Hold 15s, then repeat for right side.',
      duration: 30,
    },
  ];
  const [currentStretchIndex, setCurrentStretchIndex] = useState<number>(0);
  const [stretchSecondsLeft, setStretchSecondsLeft] = useState<number>(stretchSteps[0].duration);
  const [isStretchRunning, setIsStretchRunning] = useState<boolean>(false);

  // Box Breathing states (4s Inhale, 4s Hold, 4s Exhale, 4s Hold)
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold (Full)' | 'Exhale' | 'Hold (Empty)'>('Inhale');
  const [breathCount, setBreathCount] = useState<number>(4);
  const [isBreathingRunning, setIsBreathingRunning] = useState<boolean>(false);
  const [completedBreathCycles, setCompletedBreathCycles] = useState<number>(0);

  // Audio / Notification banner
  const [alertBanner, setAlertBanner] = useState<string | null>(null);

  // --- Pomodoro Timer Effect ---
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && secondsRemaining === 0) {
      soundEngine.playBreakAlert();
      setIsRunning(false);

      if (timerType === 'focus') {
        setSessionsCompleted((prev) => prev + 1);
        setAlertBanner('Focus session complete! Time to stand up, stretch, and take a quick break.');
        onLogBreakCompleted(Math.round(durationMinutes));
        // Switch to short break
        setTimerType('short-break');
        setDurationMinutes(5);
        setSecondsRemaining(5 * 60);
      } else {
        setAlertBanner('Break ended! Ready to resume high-clarity focus?');
        setTimerType('focus');
        setDurationMinutes(25);
        setSecondsRemaining(25 * 60);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsRemaining, timerType, durationMinutes, onLogBreakCompleted]);

  // --- 20-20-20 Eye Strain Timer Effect ---
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isEyeRunning && eyeSeconds > 0) {
      interval = setInterval(() => {
        setEyeSeconds((prev) => prev - 1);
      }, 1000);
    } else if (isEyeRunning && eyeSeconds === 0) {
      soundEngine.playSingingBowl(3.0);
      setIsEyeRunning(false);
      setEyeSeconds(20);
      onLogBreakCompleted(1);
      setAlertBanner('Eye muscles relaxed! Great habit for preventing optical fatigue.');
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isEyeRunning, eyeSeconds, onLogBreakCompleted]);

  // --- Stretch Routine Timer Effect ---
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isStretchRunning && stretchSecondsLeft > 0) {
      interval = setInterval(() => {
        setStretchSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (isStretchRunning && stretchSecondsLeft === 0) {
      if (currentStretchIndex < stretchSteps.length - 1) {
        soundEngine.playSuccessChime();
        const nextIdx = currentStretchIndex + 1;
        setCurrentStretchIndex(nextIdx);
        setStretchSecondsLeft(stretchSteps[nextIdx].duration);
      } else {
        soundEngine.playSingingBowl(3.0);
        setIsStretchRunning(false);
        setCurrentStretchIndex(0);
        setStretchSecondsLeft(stretchSteps[0].duration);
        onLogBreakCompleted(2);
        setAlertBanner('Desk stretch routine complete! Your posture and blood flow thank you.');
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStretchRunning, stretchSecondsLeft, currentStretchIndex, onLogBreakCompleted, stretchSteps]);

  // --- Box Breathing Effect ---
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isBreathingRunning) {
      interval = setInterval(() => {
        setBreathCount((prev) => {
          if (prev > 1) {
            return prev - 1;
          }
          // Cycle to next phase
          soundEngine.playTick();
          if (breathingPhase === 'Inhale') {
            setBreathingPhase('Hold (Full)');
            return 4;
          } else if (breathingPhase === 'Hold (Full)') {
            setBreathingPhase('Exhale');
            return 4;
          } else if (breathingPhase === 'Exhale') {
            setBreathingPhase('Hold (Empty)');
            return 4;
          } else {
            setBreathingPhase('Inhale');
            setCompletedBreathCycles((c) => c + 1);
            return 4;
          }
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBreathingRunning, breathingPhase]);

  // Format mm:ss
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSelectPreset = (type: 'focus' | 'short-break' | 'long-break', mins: number) => {
    setIsRunning(false);
    setTimerType(type);
    setDurationMinutes(mins);
    setSecondsRemaining(mins * 60);
  };

  const progressPct = ((durationMinutes * 60 - secondsRemaining) / (durationMinutes * 60)) * 100;

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {alertBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-900 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-medium">{alertBanner}</span>
          </div>
          <button
            onClick={() => setAlertBanner(null)}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold px-2 py-1 rounded hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Break Mode Selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Quick Breaks & Focus Rituals
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Micro-interventions engineered to eliminate mental fatigue, restore focus, and preserve physical health.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setActiveMode('pomodoro')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeMode === 'pomodoro'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Focus & Break Timer</span>
            </button>

            <button
              onClick={() => setActiveMode('eye-strain')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeMode === 'eye-strain'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>20-20-20 Eye Break</span>
            </button>

            <button
              onClick={() => setActiveMode('stretch')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeMode === 'stretch'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Desk Stretches</span>
            </button>

            <button
              onClick={() => setActiveMode('breathing')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeMode === 'breathing'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wind className="w-3.5 h-3.5" />
              <span>Box Breathing</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mode 1: Pomodoro & Focus Timer */}
      {activeMode === 'pomodoro' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-8 shadow-xs flex flex-col items-center justify-center text-center">
            {/* Presets */}
            <div className="flex items-center gap-2 mb-8 bg-slate-100 p-1.5 rounded-lg">
              <button
                onClick={() => handleSelectPreset('focus', 25)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  timerType === 'focus' && durationMinutes === 25
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                25m Focus
              </button>
              <button
                onClick={() => handleSelectPreset('focus', 50)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  timerType === 'focus' && durationMinutes === 50
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                50m Ultradian Sprint
              </button>
              <button
                onClick={() => handleSelectPreset('short-break', 5)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  timerType === 'short-break'
                    ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                5m Quick Break
              </button>
              <button
                onClick={() => handleSelectPreset('long-break', 15)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  timerType === 'long-break'
                    ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                15m Deep Rest
              </button>
            </div>

            {/* Circular Progress & Clock */}
            <div className="relative w-64 h-64 flex items-center justify-center mb-8">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className="stroke-slate-100"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className={`transition-all duration-500 ${
                    timerType === 'focus' ? 'stroke-indigo-600' : 'stroke-emerald-500'
                  }`}
                  strokeWidth="6"
                  strokeDasharray={276.46}
                  strokeDashoffset={276.46 - (276.46 * progressPct) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl sm:text-5xl font-mono tabular-nums font-bold tracking-tight text-slate-900">
                  {formatTime(secondsRemaining)}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-2">
                  {timerType === 'focus' ? 'Deep Focus Session' : 'Restorative Break'}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  soundEngine.playTick();
                  setIsRunning(!isRunning);
                }}
                className={`px-6 py-3 rounded-xl font-medium text-sm flex items-center gap-2 transition-colors shadow-xs cursor-pointer ${
                  isRunning
                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                    : timerType === 'focus'
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pause Timer</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start {timerType === 'focus' ? 'Focus' : 'Break'}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setIsRunning(false);
                  setSecondsRemaining(durationMinutes * 60);
                }}
                className="p-3 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Reset timer"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Side Info & Tips */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Today Focus Engine</span>
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-mono font-bold tabular-nums text-slate-900">
                  {sessionsCompleted}
                </span>
                <span className="text-xs text-slate-500">completed focus cycles</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Aim for 4 cycles of 25m work followed by one 15m deep rest to sustain peak mental energy without burnout.
              </p>
            </div>

            {/* Quick Hydration Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-sky-500" />
                  <span>Hydration Tracker</span>
                </h3>
                <span className="text-xs font-mono tabular-nums text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  {waterGlasses} / 8 glasses
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Mild dehydration lowers cognitive processing speed by up to 14%. Keep a glass nearby!
              </p>
              <button
                onClick={() => {
                  soundEngine.playSuccessChime();
                  onLogHydration();
                }}
                className="w-full py-2 px-3 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Droplets className="w-3.5 h-3.5" />
                <span>+ Log 1 Glass of Water (250ml)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: 20-20-20 Eye Strain Break */}
      {activeMode === 'eye-strain' && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs max-w-2xl mx-auto text-center space-y-6">
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto">
            <Eye className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900">The 20-20-20 Rule</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
              Every 20 minutes spent looking at a screen, look at an object at least 20 feet away for at least 20 seconds.
            </p>
          </div>

          <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
            <div
              className={`absolute inset-0 rounded-full border-4 border-sky-200 transition-transform duration-1000 ${
                isEyeRunning ? 'scale-110 opacity-60' : 'scale-100 opacity-20'
              }`}
            />
            <div className="flex flex-col items-center">
              <span className="text-5xl font-mono tabular-nums font-bold text-sky-950">
                {eyeSeconds}s
              </span>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-1">
                {isEyeRunning ? 'Gaze far into distance' : 'Ready'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                soundEngine.playTick();
                setIsEyeRunning(!isEyeRunning);
              }}
              className="px-6 py-2.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
            >
              {isEyeRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isEyeRunning ? 'Pause' : 'Start 20s Eye Break'}</span>
            </button>
            <button
              onClick={() => {
                setIsEyeRunning(false);
                setEyeSeconds(20);
              }}
              className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Mode 3: Desk Stretches */}
      {activeMode === 'stretch' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-3xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider font-mono">
                Step {currentStretchIndex + 1} of {stretchSteps.length}
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                {stretchSteps[currentStretchIndex].title}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-mono tabular-nums font-bold text-slate-900">
                {stretchSecondsLeft}s
              </span>
              <button
                onClick={() => {
                  soundEngine.playTick();
                  setIsStretchRunning(!isStretchRunning);
                }}
                className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                {isStretchRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isStretchRunning ? 'Pause' : 'Begin'}</span>
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Instructions:</span>
            <p className="text-sm text-slate-700 leading-relaxed">
              {stretchSteps[currentStretchIndex].instruction}
            </p>
          </div>

          {/* Stepper overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            {stretchSteps.map((s, idx) => (
              <button
                key={s.title}
                onClick={() => {
                  setIsStretchRunning(false);
                  setCurrentStretchIndex(idx);
                  setStretchSecondsLeft(s.duration);
                }}
                className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                  currentStretchIndex === idx
                    ? 'bg-indigo-50/70 border-indigo-300 text-indigo-900'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="text-[10px] font-mono text-slate-400">Step {idx + 1}</div>
                <div className="text-xs font-medium truncate mt-0.5">{s.title}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mode 4: Box Breathing */}
      {activeMode === 'breathing' && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs max-w-xl mx-auto text-center space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Box Breathing (Sama Vritti)</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
              4-count breathing technique used by elite performers to deactivate fight-or-flight cortisol response.
            </p>
          </div>

          <div className="relative w-56 h-56 mx-auto flex items-center justify-center">
            <div
              className={`w-40 h-40 rounded-3xl border-2 border-indigo-300 transition-all duration-1000 flex items-center justify-center ${
                breathingPhase === 'Inhale'
                  ? 'scale-125 bg-indigo-50/50'
                  : breathingPhase === 'Hold (Full)'
                  ? 'scale-125 bg-indigo-100/60'
                  : breathingPhase === 'Exhale'
                  ? 'scale-90 bg-indigo-50/20'
                  : 'scale-90 bg-slate-100'
              }`}
            >
              <div className="flex flex-col items-center">
                <span className="text-3xl font-mono tabular-nums font-bold text-indigo-950">
                  {breathCount}
                </span>
                <span className="text-xs font-semibold text-indigo-700 tracking-wider uppercase mt-1">
                  {breathingPhase}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                soundEngine.playTick();
                setIsBreathingRunning(!isBreathingRunning);
              }}
              className="px-6 py-2.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
            >
              {isBreathingRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isBreathingRunning ? 'Pause Breathing' : 'Start Box Breathing'}</span>
            </button>
            <button
              onClick={() => {
                setIsBreathingRunning(false);
                setBreathCount(4);
                setBreathingPhase('Inhale');
              }}
              className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            {completedBreathCycles} breath cycles completed
          </div>
        </div>
      )}
    </div>
  );
};

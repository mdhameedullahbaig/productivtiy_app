import React, { useState } from 'react';
import { Quote } from '../types';
import { 
  Quote as QuoteIcon, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Heart, 
  Shuffle, 
  Plus, 
  BookOpen, 
  Sparkles,
  Share2
} from 'lucide-react';
import { speakText, stopSpeaking } from '../utils/audio';

interface QuotesViewProps {
  quotes: Quote[];
  onToggleFavorite: (id: string) => void;
  onAddCustomQuote: (quote: Omit<Quote, 'id'>) => void;
}

export const QuotesView: React.FC<QuotesViewProps> = ({
  quotes,
  onToggleFavorite,
  onAddCustomQuote,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeQuoteIndex, setActiveQuoteIndex] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [isAddingQuote, setIsAddingQuote] = useState<boolean>(false);

  // Form states
  const [newText, setNewText] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newCategory, setNewCategory] = useState<Quote['category']>('Focus');
  const [newReflection, setNewReflection] = useState('');

  // Filtered pool
  const filteredQuotes = quotes.filter((q) => {
    if (showFavoritesOnly && !q.favorite) return false;
    if (selectedCategory !== 'all' && q.category !== selectedCategory) return false;
    return true;
  });

  const currentQuote = filteredQuotes[activeQuoteIndex % (filteredQuotes.length || 1)] || quotes[0];

  const handleNextQuote = () => {
    if (filteredQuotes.length <= 1) return;
    let nextIdx = Math.floor(Math.random() * filteredQuotes.length);
    if (nextIdx === activeQuoteIndex) {
      nextIdx = (nextIdx + 1) % filteredQuotes.length;
    }
    setActiveQuoteIndex(nextIdx);
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    }
  };

  const handleSpeak = (text: string, author: string) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const fullText = `"${text}" by ${author}`;
      const success = speakText(fullText, () => {
        setIsSpeaking(false);
      });
      if (!success) {
        setIsSpeaking(false);
      }
    }
  };

  const handleCopy = (id: string, text: string, author: string) => {
    navigator.clipboard.writeText(`"${text}" — ${author}`);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim() || !newAuthor.trim()) return;

    onAddCustomQuote({
      text: newText.trim(),
      author: newAuthor.trim(),
      category: newCategory,
      reflectionPrompt: newReflection.trim() || undefined,
      favorite: true,
    });

    setNewText('');
    setNewAuthor('');
    setNewReflection('');
    setIsAddingQuote(false);
  };

  const categories: (Quote['category'])[] = ['Focus', 'Discipline', 'Habits', 'Resilience', 'Clarity', 'Mindset'];

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Productivity & Mindset Library
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Timeless stoic principles, cognitive focus research, and daily mental clarity anchors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
              showFavoritesOnly
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
            <span>Favorites ({quotes.filter((q) => q.favorite).length})</span>
          </button>

          <button
            onClick={() => setIsAddingQuote(true)}
            className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Quote</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills (Functional Filter Buttons per Section 1A) */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg w-fit">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Featured Spotlight Quote Card */}
      {currentQuote && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-8 sm:p-10 shadow-lg relative overflow-hidden">
          <QuoteIcon className="w-24 h-24 text-white/5 absolute -right-4 -bottom-4 pointer-events-none" />

          <div className="relative z-10 space-y-6 max-w-3xl">
            {/* Unboxed category label */}
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-300">
              <span>{currentQuote.category}</span>
              <span aria-hidden="true">·</span>
              <span>Daily Wisdom</span>
            </div>

            {/* Quote Body */}
            <blockquote className="text-xl sm:text-2xl font-serif sm:font-sans font-medium leading-relaxed tracking-normal text-slate-100">
              "{currentQuote.text}"
            </blockquote>

            {/* Author */}
            <div className="text-sm font-semibold text-slate-300 font-mono">
              — {currentQuote.author}
            </div>

            {/* Reflection Prompt */}
            {currentQuote.reflectionPrompt && (
              <div className="p-4 bg-white/10 backdrop-blur-xs rounded-xl border border-white/10 text-xs sm:text-sm text-slate-200 space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Practical Reflection:
                </span>
                <p className="italic leading-relaxed">{currentQuote.reflectionPrompt}</p>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSpeak(currentQuote.text, currentQuote.author)}
                  className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isSpeaking
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                  }`}
                  title="Read quote aloud using text-to-speech"
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>{isSpeaking ? 'Stop Reading' : 'Listen Aloud'}</span>
                </button>

                <button
                  onClick={() => handleCopy(currentQuote.id, currentQuote.text, currentQuote.author)}
                  className="px-3.5 py-2 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Copy quote"
                >
                  {copiedId === currentQuote.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedId === currentQuote.id ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={() => onToggleFavorite(currentQuote.id)}
                  className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                    currentQuote.favorite
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : 'bg-white/10 text-slate-300 border-white/10 hover:bg-white/20'
                  }`}
                  title="Bookmark favorite"
                >
                  <Heart className={`w-4 h-4 ${currentQuote.favorite ? 'fill-rose-400 text-rose-400' : ''}`} />
                </button>
              </div>

              <button
                onClick={handleNextQuote}
                className="px-4 py-2 text-xs font-medium text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm font-sans"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Next Quote</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid of All Filtered Quotes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>{filteredQuotes.length} quotes in this collection</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuotes.map((q) => (
            <div
              key={q.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2">
                {/* Clean unboxed metadata per Section 1A */}
                <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span>{q.category}</span>
                  <button
                    onClick={() => onToggleFavorite(q.id)}
                    className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                  >
                    <Heart className={`w-3.5 h-3.5 ${q.favorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                </div>

                <p className="text-sm font-medium text-slate-900 leading-relaxed">
                  "{q.text}"
                </p>
                <p className="text-xs font-semibold text-slate-600 font-mono">
                  — {q.author}
                </p>

                {q.reflectionPrompt && (
                  <p className="text-[11px] text-slate-500 italic border-t border-slate-100 pt-2">
                    {q.reflectionPrompt}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <button
                  onClick={() => handleSpeak(q.text, q.author)}
                  className="text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors cursor-pointer font-mono"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Audio</span>
                </button>

                <button
                  onClick={() => handleCopy(q.id, q.text, q.author)}
                  className="text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors cursor-pointer font-mono"
                >
                  {copiedId === q.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === q.id ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Custom Quote Modal */}
      {isAddingQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Add Personal Mantra or Quote</h3>
              <button
                onClick={() => setIsAddingQuote(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustom} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Quote Text *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="e.g. Focus on what is essential; eliminate the friction."
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Author / Source *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="e.g. Marcus Aurelius"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as Quote['category'])}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reflection Question / Prompt (Optional)
                </label>
                <input
                  type="text"
                  value={newReflection}
                  onChange={(e) => setNewReflection(e.target.value)}
                  placeholder="e.g. How does this apply to my highest priority today?"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingQuote(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
                >
                  Save Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

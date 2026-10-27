import { Quote } from '../types';

export const INITIAL_QUOTES: Quote[] = [
  {
    id: 'q-1',
    text: 'You do not rise to the level of your goals. You fall to the level of your systems.',
    author: 'James Clear',
    category: 'Habits',
    reflectionPrompt: 'What system in your day needs a minor tweak to make good work effortless?'
  },
  {
    id: 'q-2',
    text: 'It is not that we have a short time to live, but that we waste a lot of it.',
    author: 'Seneca',
    category: 'Clarity',
    reflectionPrompt: 'Which activity today is consuming your finite attention without giving you value?'
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
    text: 'Concentrate all your thoughts upon the work in hand. The sun’s rays do not burn until brought to a focus.',
    author: 'Alexander Graham Bell',
    category: 'Focus',
    reflectionPrompt: 'Single-task your next 25 minutes without switching browser tabs.'
  },
  {
    id: 'q-5',
    text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
    author: 'Will Durant (on Aristotle)',
    category: 'Discipline',
    reflectionPrompt: 'What single repeated action has compounded most in your life so far?'
  },
  {
    id: 'q-6',
    text: 'Simplicity boils down to two steps: Identify the essential. Eliminate the rest.',
    author: 'Leo Babauta',
    category: 'Clarity',
    reflectionPrompt: 'If you could only accomplish one single outcome today, what must it be?'
  },
  {
    id: 'q-7',
    text: 'Action may not always bring happiness, but there is no happiness without action.',
    author: 'William James',
    category: 'Resilience',
    reflectionPrompt: 'Start with 2 minutes of messy progress right now.'
  },
  {
    id: 'q-8',
    text: 'The impediment to action advances action. What stands in the way becomes the way.',
    author: 'Marcus Aurelius',
    category: 'Resilience',
    reflectionPrompt: 'How can the current friction you face be turned into your training ground?'
  },
  {
    id: 'q-9',
    text: 'Deep work is the ability to focus without distraction on a cognitively demanding task.',
    author: 'Cal Newport',
    category: 'Focus',
    reflectionPrompt: 'Protect your next block of time like a sacred reservation.'
  },
  {
    id: 'q-10',
    text: 'Discipline equals freedom.',
    author: 'Jocko Willink',
    category: 'Discipline',
    reflectionPrompt: 'Where can a strict routine give you more free mental headspace later?'
  },
  {
    id: 'q-11',
    text: 'Much of what we do is not necessary. If you eliminate it, you will have more tranquility.',
    author: 'Marcus Aurelius',
    category: 'Clarity',
    reflectionPrompt: 'Ask yourself on every task: Is this strictly necessary?'
  },
  {
    id: 'q-12',
    text: 'The best way to get started is to quit talking and begin doing.',
    author: 'Walt Disney',
    category: 'Mindset',
    reflectionPrompt: 'What plan have you been over-thinking? Take the first physical step.'
  },
  {
    id: 'q-13',
    text: 'Small disciplines repeated with consistency every day lead to great achievements gained slowly over time.',
    author: 'John C. Maxwell',
    category: 'Discipline',
    reflectionPrompt: 'What small 10-minute habit are you building today?'
  },
  {
    id: 'q-14',
    text: 'Nothing in life is to be feared, it is only to be understood. Now is the time to understand more, so that we may fear less.',
    author: 'Marie Curie',
    category: 'Mindset',
    reflectionPrompt: 'Break down an intimidating problem into its foundational components.'
  },
  {
    id: 'q-15',
    text: 'Being busy is a form of mental laziness—lazy thinking and indiscriminate action.',
    author: 'Tim Ferriss',
    category: 'Clarity',
    reflectionPrompt: 'Are you confusing movement with meaningful forward velocity?'
  },
  {
    id: 'q-16',
    text: 'Almost everything will work again if you unplug it for a few minutes, including you.',
    author: 'Anne Lamott',
    category: 'Habits',
    reflectionPrompt: 'Remember to take your 5-minute break when the timer sounds.'
  },
  {
    id: 'q-17',
    text: 'Do not wait; the time will never be "just right." Start where you stand, and work with whatever tools you may have.',
    author: 'George Herbert',
    category: 'Resilience',
    reflectionPrompt: 'What conditions were you waiting for that you can bypass right now?'
  },
  {
    id: 'q-18',
    text: 'Your mind is for having ideas, not holding them.',
    author: 'David Allen',
    category: 'Clarity',
    reflectionPrompt: 'Get everything out of your working memory and into your task list.'
  }
];

export function getRandomQuote(quotes: Quote[] = INITIAL_QUOTES): Quote {
  const index = Math.floor(Math.random() * quotes.length);
  return quotes[index];
}

export function getQuoteOfTheDay(quotes: Quote[] = INITIAL_QUOTES): Quote {
  // Deterministic quote based on current date string so it remains stable for the day
  const today = new Date().toISOString().split('T')[0];
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = (hash << 5) - hash + today.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % quotes.length;
  return quotes[index];
}

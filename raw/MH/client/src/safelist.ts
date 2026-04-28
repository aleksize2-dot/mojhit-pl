// This file exists only to tell Tailwind CSS to compile these classes
// so they can be dynamically loaded from the database by the admin panel.

export const safelist = [
  // RED
  'text-red-400', 'text-red-500', 'text-red-600', 'text-red-700',
  'bg-red-400', 'bg-red-500', 'bg-red-600', 'bg-red-700',
  'border-red-400', 'border-red-500', 'border-red-600', 'border-red-700',
  'border-red-400/20', 'border-red-500/20', 'border-red-600/20', 'border-red-700/20',
  'border-red-400/80', 'border-red-500/80', 'border-red-600/80', 'border-red-700/80',
  'bg-red-400/5', 'bg-red-500/5', 'bg-red-600/5', 'bg-red-700/5',
  'bg-red-400/10', 'bg-red-500/10', 'bg-red-600/10', 'bg-red-700/10',
  'shadow-red-400/30', 'shadow-red-500/30', 'shadow-red-600/30', 'shadow-red-700/30',
  'from-red-400', 'from-red-500', 'from-red-600', 'from-red-700',
  'to-red-400', 'to-red-500', 'to-red-600', 'to-red-700',
  'via-red-400', 'via-red-500', 'via-red-600', 'via-red-700',

  // BLUE
  'text-blue-400', 'text-blue-500', 'text-blue-600', 'text-blue-700',
  'bg-blue-400', 'bg-blue-500', 'bg-blue-600', 'bg-blue-700',
  'border-blue-400', 'border-blue-500', 'border-blue-600', 'border-blue-700',
  'border-blue-400/20', 'border-blue-500/20', 'border-blue-600/20', 'border-blue-700/20',
  'border-blue-400/80', 'border-blue-500/80', 'border-blue-600/80', 'border-blue-700/80',
  'bg-blue-400/5', 'bg-blue-500/5', 'bg-blue-600/5', 'bg-blue-700/5',
  'bg-blue-400/10', 'bg-blue-500/10', 'bg-blue-600/10', 'bg-blue-700/10',
  'shadow-blue-400/30', 'shadow-blue-500/30', 'shadow-blue-600/30', 'shadow-blue-700/30',
  'from-blue-400', 'from-blue-500', 'from-blue-600', 'from-blue-700',
  'to-blue-400', 'to-blue-500', 'to-blue-600', 'to-blue-700',
  'via-blue-400', 'via-blue-500', 'via-blue-600', 'via-blue-700',

  // EMERALD (Green)
  'text-emerald-400', 'text-emerald-500', 'text-emerald-600', 'text-emerald-700',
  'bg-emerald-400', 'bg-emerald-500', 'bg-emerald-600', 'bg-emerald-700',
  'border-emerald-400', 'border-emerald-500', 'border-emerald-600', 'border-emerald-700',
  'border-emerald-400/20', 'border-emerald-500/20', 'border-emerald-600/20', 'border-emerald-700/20',
  'border-emerald-400/80', 'border-emerald-500/80', 'border-emerald-600/80', 'border-emerald-700/80',
  'bg-emerald-400/5', 'bg-emerald-500/5', 'bg-emerald-600/5', 'bg-emerald-700/5',
  'bg-emerald-400/10', 'bg-emerald-500/10', 'bg-emerald-600/10', 'bg-emerald-700/10',
  'shadow-emerald-400/30', 'shadow-emerald-500/30', 'shadow-emerald-600/30', 'shadow-emerald-700/30',
  'from-emerald-400', 'from-emerald-500', 'from-emerald-600', 'from-emerald-700',
  'to-emerald-400', 'to-emerald-500', 'to-emerald-600', 'to-emerald-700',
  'via-emerald-400', 'via-emerald-500', 'via-emerald-600', 'via-emerald-700',

  // VIOLET
  'text-violet-400', 'text-violet-500', 'text-violet-600', 'text-violet-700',
  'bg-violet-400', 'bg-violet-500', 'bg-violet-600', 'bg-violet-700',
  'border-violet-400', 'border-violet-500', 'border-violet-600', 'border-violet-700',
  'border-violet-400/20', 'border-violet-500/20', 'border-violet-600/20', 'border-violet-700/20',
  'border-violet-400/80', 'border-violet-500/80', 'border-violet-600/80', 'border-violet-700/80',
  'bg-violet-400/5', 'bg-violet-500/5', 'bg-violet-600/5', 'bg-violet-700/5',
  'bg-violet-400/10', 'bg-violet-500/10', 'bg-violet-600/10', 'bg-violet-700/10',
  'shadow-violet-400/30', 'shadow-violet-500/30', 'shadow-violet-600/30', 'shadow-violet-700/30',
  'from-violet-400', 'from-violet-500', 'from-violet-600', 'from-violet-700',
  'to-violet-400', 'to-violet-500', 'to-violet-600', 'to-violet-700',
  'via-violet-400', 'via-violet-500', 'via-violet-600', 'via-violet-700',
  
  // ORANGE
  'text-orange-400', 'text-orange-500', 'text-orange-600', 'text-orange-700',
  'bg-orange-400', 'bg-orange-500', 'bg-orange-600', 'bg-orange-700',
  'border-orange-400', 'border-orange-500', 'border-orange-600', 'border-orange-700',
  'border-orange-400/20', 'border-orange-500/20', 'border-orange-600/20', 'border-orange-700/20',
  'border-orange-400/80', 'border-orange-500/80', 'border-orange-600/80', 'border-orange-700/80',
  'bg-orange-400/5', 'bg-orange-500/5', 'bg-orange-600/5', 'bg-orange-700/5',
  'bg-orange-400/10', 'bg-orange-500/10', 'bg-orange-600/10', 'bg-orange-700/10',
  'shadow-orange-400/30', 'shadow-orange-500/30', 'shadow-orange-600/30', 'shadow-orange-700/30',
  'from-orange-400', 'from-orange-500', 'from-orange-600', 'from-orange-700',
  'to-orange-400', 'to-orange-500', 'to-orange-600', 'to-orange-700',
  'via-orange-400', 'via-orange-500', 'via-orange-600', 'via-orange-700',
  
  // AMBER
  'text-amber-400', 'text-amber-500', 'text-amber-600', 'text-amber-700',
  'bg-amber-400', 'bg-amber-500', 'bg-amber-600', 'bg-amber-700',
  'border-amber-400', 'border-amber-500', 'border-amber-600', 'border-amber-700',
  'border-amber-400/20', 'border-amber-500/20', 'border-amber-600/20', 'border-amber-700/20',
  'border-amber-400/80', 'border-amber-500/80', 'border-amber-600/80', 'border-amber-700/80',
  'bg-amber-400/5', 'bg-amber-500/5', 'bg-amber-600/5', 'bg-amber-700/5',
  'bg-amber-400/10', 'bg-amber-500/10', 'bg-amber-600/10', 'bg-amber-700/10',
  'shadow-amber-400/30', 'shadow-amber-500/30', 'shadow-amber-600/30', 'shadow-amber-700/30',
  'from-amber-400', 'from-amber-500', 'from-amber-600', 'from-amber-700',
  'to-amber-400', 'to-amber-500', 'to-amber-600', 'to-amber-700',
  'via-amber-400', 'via-amber-500', 'via-amber-600', 'via-amber-700',

  // RED-800
  'text-red-800', 'bg-red-800', 'border-red-800', 'border-red-800/20', 'border-red-800/80',
  'bg-red-800/5', 'bg-red-800/10', 'shadow-red-800/30',
  'from-red-800', 'to-red-800', 'via-red-800',

  // RED-900
  'text-red-900', 'bg-red-900', 'border-red-900', 'border-red-900/20', 'border-red-900/80',
  'bg-red-900/5', 'bg-red-900/10', 'shadow-red-900/30',
  'from-red-900', 'to-red-900', 'via-red-900',

  // LIME (for Kosa)
  'text-lime-500', 'bg-lime-500', 'border-lime-500', 'border-lime-500/20', 'border-lime-500/80',
  'bg-lime-500/5', 'bg-lime-500/10', 'shadow-lime-500/30',
  'from-lime-500', 'to-lime-500', 'via-lime-500',
  'from-slate-700', 'to-slate-700',

  // YELLOW (for La Luz)
  'text-yellow-500', 'bg-yellow-500', 'border-yellow-500', 'border-yellow-500/20', 'border-yellow-500/80',
  'bg-yellow-500/5', 'bg-yellow-500/10', 'shadow-yellow-500/30',
  'from-yellow-400', 'to-yellow-400',

  // OTHERS
  'text-white', 'bg-white', 'border-white', 'border-white/20', 'border-white/80', 'bg-white/5', 'bg-white/10', 'shadow-white/30', 'from-white', 'to-white', 'via-white',
  'text-black', 'bg-black', 'border-black', 'border-black/20', 'border-black/80', 'bg-black/5', 'bg-black/10', 'shadow-black/30', 'from-black', 'to-black', 'via-black'
];

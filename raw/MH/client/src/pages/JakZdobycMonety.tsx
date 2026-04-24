import { Link } from 'react-router-dom';

export function JakZdobycMonety() {
  return (
    <div className="p-6 bg-surface-container rounded-2xl border border-outline-variant/20 max-w-2xl mx-auto mt-10">
      <h2 className="text-3xl font-bold headline-font mb-4">Jak zdobyć Monety?</h2>
      <p className="text-on-surface-variant font-body mb-8">Dowiedz się jak zdobywać darmowe monety.</p>
      
      <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-surface-container-high rounded-xl hover:bg-surface-bright transition-colors text-on-surface font-bold text-sm">
        <span className="material-symbols-outlined">arrow_back</span>
        Wróć
      </Link>
    </div>
  );
}

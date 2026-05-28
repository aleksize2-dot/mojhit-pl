import { useState } from 'react';

const AGE_GATE_KEY = 'mojhit_age_verified';

export type AgeGateStatus = 'pending' | 'verified' | 'blocked';

export function useAgeGate() {
  const [status, setStatus] = useState<AgeGateStatus>(() => {
    const stored = localStorage.getItem(AGE_GATE_KEY);
    if (stored === 'true') return 'verified';
    if (stored === 'false') return 'blocked';
    return 'pending';
  });

  const verify = () => {
    localStorage.setItem(AGE_GATE_KEY, 'true');
    setStatus('verified');
  };

  const block = () => {
    localStorage.setItem(AGE_GATE_KEY, 'false');
    setStatus('blocked');
  };

  return { status, verify, block };
}

export function AgeGateModal({ onVerify, onBlock }: { onVerify: () => void; onBlock: () => void }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-2xl p-8 max-w-md w-full border border-outline-variant/20 shadow-2xl animate-in fade-in zoom-in">
        <div className="text-center mb-6">
          <span className="material-symbols-outlined text-5xl text-primary mb-4 block">gavel</span>
          <h2 className="text-2xl font-black headline-font mb-2">Weryfikacja wieku</h2>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            Niektóre utwory na mojhit.pl zawierają wulgaryzmy i treści przeznaczone wyłącznie dla dorosłych.
          </p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
          <p className="text-amber-400 text-sm font-bold text-center">
            Czy masz ukończone 18 lat?
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onBlock}
            className="flex-1 bg-surface-container-high hover:bg-surface-variant text-on-surface-variant px-4 py-3 rounded-xl font-bold text-sm transition-colors"
          >
            Nie mam 18 lat
          </button>
          <button
            onClick={onVerify}
            className="flex-1 bg-primary hover:bg-primary-dark text-on-primary px-4 py-3 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-primary/20"
          >
            Mam 18+ lat
          </button>
        </div>

        <p className="text-[10px] text-on-surface-variant/50 text-center mt-4">
          Twoja odpowiedź zostanie zapamiętana. Możesz ją zmienić w ustawieniach.
        </p>
      </div>
    </div>
  );
}

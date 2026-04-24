import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

export function KupMonety() {
  const { user } = useUser();

  const packages = [
    {
      name: 'Small Pack',
      coins: 20,
      price: '25 PLN',
      unitPrice: '1.25 PLN',
      icon: 'toll',
      link: `https://buy.stripe.com/14AfZh2uF21Q4r61EU1Nu00?client_reference_id=${user?.id || ''}`,
      popular: false
    },
    {
      name: 'Medium Pack',
      coins: 50,
      price: '49 PLN',
      unitPrice: '0.98 PLN',
      icon: 'star',
      link: `https://buy.stripe.com/14A4gzd9j5e28Hmbfu1Nu01?client_reference_id=${user?.id || ''}`,
      popular: true
    },
    {
      name: 'Large Pack',
      coins: 150,
      price: '129 PLN',
      unitPrice: '0.86 PLN',
      icon: 'savings',
      link: `https://buy.stripe.com/cNi8wPedn7ma0aQbfu1Nu02?client_reference_id=${user?.id || ''}`,
      popular: false
    }
  ];

  return (
    <div className="p-6 md:p-10 bg-surface-container rounded-3xl border border-outline-variant/20 max-w-5xl mx-auto my-10 relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-tertiary/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="text-center mb-12 relative z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-tertiary/10 text-tertiary rounded-2xl mb-6">
          <span className="material-symbols-outlined text-4xl">database</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold headline-font mb-4 tracking-tight">Doładuj Monety</h2>
        <p className="text-on-surface-variant font-body text-lg max-w-xl mx-auto">
          Zabrakło weny i monet? Wybierz paczkę, która najbardziej Ci odpowiada i wracaj do komponowania hitów.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 mb-12">
        {packages.map((pkg, i) => (
          <div key={i} className={`bg-surface-container-low p-6 rounded-3xl border flex flex-col items-center text-center transition-all ${pkg.popular ? 'border-tertiary shadow-lg shadow-tertiary/10 scale-105' : 'border-outline-variant/20 hover:border-tertiary/40'}`}>
            {pkg.popular && (
              <div className="bg-tertiary text-on-primary font-bold uppercase tracking-widest text-[10px] px-4 py-1.5 rounded-full shadow-md mb-4 -mt-10">
                Najczęściej Wybierany
              </div>
            )}
            
            <span className={`material-symbols-outlined text-5xl mb-4 ${pkg.popular ? 'text-tertiary' : 'text-on-surface-variant'}`}>
              {pkg.icon}
            </span>
            
            <h3 className="text-xl font-bold headline-font mb-1">{pkg.name}</h3>
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-4xl font-extrabold text-on-surface">{pkg.coins}</span>
              <span className="text-on-surface-variant font-bold uppercase tracking-widest text-xs mt-2">Monet</span>
            </div>
            
            <div className="w-full bg-surface-container-high rounded-xl p-4 mb-6">
              <div className="text-2xl font-black">{pkg.price}</div>
              <div className="text-xs text-on-surface-variant mt-1">~{pkg.unitPrice} za generację</div>
            </div>
            
            <a 
              href={pkg.link}
              className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-md mt-auto ${
                pkg.popular 
                  ? 'bg-tertiary text-on-primary hover:bg-tertiary/90 hover:-translate-y-1' 
                  : 'bg-surface-variant text-on-surface-variant hover:bg-surface-bright'
              }`}
            >
              Kup teraz
            </a>
          </div>
        ))}
      </div>

      <div className="text-center relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-surface-container-high rounded-xl hover:bg-surface-bright transition-colors text-on-surface font-bold text-sm">
          <span className="material-symbols-outlined">arrow_back</span>
          Wróć
        </Link>
      </div>
    </div>
  );
}

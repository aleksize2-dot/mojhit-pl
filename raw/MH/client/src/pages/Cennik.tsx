import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';

const HitIcon = () => (
  <span className="material-symbols-outlined text-primary" style={{ fontSize: '1em', verticalAlign: 'middle' }}>stars</span>
);

const NutaIcon = () => (
  <span className="material-symbols-outlined text-tertiary" style={{ fontSize: '1em', verticalAlign: 'middle' }}>music_note</span>
);

export function Cennik() {
  const { user } = useUser();
  const [currentPlan, setCurrentPlan] = useState('Free');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoError, setPromoError] = useState('');
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  useEffect(() => {
    // Fetch site settings
    fetch('/api/settings/site')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) setSiteSettings(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!siteSettings?.pricing_timer_end) return;
    
    const targetDate = new Date(siteSettings.pricing_timer_end);
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [siteSettings?.pricing_timer_end]);

  useEffect(() => {
    // Fetch user plan
    if (user) {
      fetch('/api/user/balance', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (data && data.plan) setCurrentPlan(data.plan);
        })
        .catch(console.error);
    }
  }, [user]);

  const validatePromoCode = async () => {
    if (!promoCodeInput.trim()) return;
    setIsValidatingPromo(true);
    setPromoError('');
    try {
      const res = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCodeInput.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Błąd kodu');
      setAppliedPromo(data);
      setPromoCodeInput('');
    } catch (e: any) {
      setPromoError(e.message);
      setAppliedPromo(null);
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
  };

  const discountPercent = siteSettings?.pricing_discount_enabled ? (siteSettings?.pricing_discount_percent || 20) : 0;
  const showBanner = siteSettings?.pricing_banner_enabled;

  const calculateDiscountedPrice = (monthlyPrice: number) => {
    let finalPrice = monthlyPrice;
    
    // Apply annual discount
    if (billingCycle === 'annual' && discountPercent > 0) {
      finalPrice = finalPrice * (1 - discountPercent / 100);
    }
    
    // Apply promo code discount if valid
    if (appliedPromo) {
      if (appliedPromo.type === 'percent') {
        finalPrice = finalPrice * (1 - (appliedPromo.value / 100));
      } else if (appliedPromo.type === 'amount') {
        finalPrice = finalPrice - appliedPromo.value;
      }
    }
    
    return Math.max(0, finalPrice).toFixed(2);
  };

  const defaultPackages = [
    {
      name: 'Szybki Hit',
      hits: 1,
      price: '19,99 PLN',
      priceNum: '19.99',
      description: 'Idealny na próbę lub szybki prezent. Jeden pełnowymiarowy utwór.',
      features: [
        '1 Hit [HIT] (Premium Generacja)',
        '2 warianty muzyczne',
        'Pobierz MP3 + okładka',
        'Wszystkie style muzyczne',
      ],
      link: `https://buy.stripe.com/00wbJ19X75e27Di6Ze1Nu08?client_reference_id=${user?.id || ''}`,
      popular: false,
      type: 'one-time',
      badge: null,
    },
    {
      name: 'EP-ka',
      hits: 3,
      price: '39,99 PLN',
      priceNum: '39.99',
      description: 'Trzy hity w jednym pakiecie. Najlepsza wartość za pieniądze.',
      features: [
        '3 Hity [HIT] (Premium Generacja)',
        '2 warianty każdy utwór',
        'Pobierz MP3 + okładka',
        'Priorytetowa kolejka',
      ],
      link: `https://buy.stripe.com/00wdR98T335U2iYabq1Nu09?client_reference_id=${user?.id || ''}`,
      popular: true,
      type: 'one-time',
      badge: 'Najlepsza Wartość',
    },
    {
      name: 'Gruba Impreza',
      hits: 10,
      price: '99,99 PLN',
      priceNum: '99.99',
      description: 'Dla poważnych twórców. Pełen zapas hitów na kolejny projekt.',
      features: [
        '10 Hitów [HIT] (Premium Generacja)',
        '2 warianty każdy utwór',
        'Pobierz MP3 + okładka + MP4',
        'Najwyższy priorytet kolejki',
      ],
      link: `https://buy.stripe.com/14A4gz5GRgWKe1GdnC1Nu0a?client_reference_id=${user?.id || ''}`,
      popular: false,
      type: 'one-time',
      badge: 'Mega Oszczędność',
    },
  ];

  const defaultSubscriptions = [
    {
      name: 'Plan Free',
      hits: 0,
      basePriceNum: 0,
      description: 'Dostawaj Nuty za aktywność. 20 Nut = 1 Hit.',
      features: [
        'Nuty za codzienną aktywność',
        'Wymieniaj 20 Nut na 1 Hit [HIT]',
        'Podstawowy generator muzyki',
        'Pobierz MP3 ze znakiem wodnym',
        'Generuj wideo do utworów',
        'Standardowa kolejka'
      ],
      link: '#',
      popular: false,
      plan: 'Free',
      color: 'outline-variant',
    },
    {
      name: 'Klub VIP',
      hits: 5,
      basePriceNum: 49.99,
      description: 'Stały dostęp do ekipy producentów i comiesięczny zastrzyk Hitów.',
      features: [
        '5 Hitów [HIT] co miesiąc',
        'Wszyscy producenci odblokowani',
        'MP4 bez znaku wodnego',
        'Priorytetowa kolejka generacji',
        'Odznaka VIP w profilu',
      ],
      link: `https://buy.stripe.com/00wbJ11qBaym7Di3N21Nu06?client_reference_id=${user?.id || ''}`,
      popular: false,
      plan: 'VIP',
      color: 'primary',
    },
    {
      name: 'Legenda Sceny',
      hits: 15,
      basePriceNum: 99.99,
      description: 'Pełna moc bez limitów. Dla tych, którzy tworzą zawodowo.',
      features: [
        '15 Hitów [HIT] co miesiąc',
        'Wszyscy producenci odblokowani',
        'MP4 bez znaku wodnego',
        'Najwyższy priorytet w kolejce',
        'Dostęp do beta testów',
        'Odznaka Legenda w profilu',
      ],
      link: `https://buy.stripe.com/aFafZh6KVbCq4r62IY1Nu07?client_reference_id=${user?.id || ''}`,
      popular: true,
      plan: 'Legend',
      color: 'tertiary',
    },
  ];

  const packages = siteSettings?.pricing_packages?.length ? siteSettings.pricing_packages : defaultPackages;
  const subscriptions = siteSettings?.pricing_subscriptions?.length ? siteSettings.pricing_subscriptions : defaultSubscriptions;

  const renderFeature = (f: string) => {
    if (typeof f !== 'string') return f;
    const parts = f.split('[HIT]');
    return (
      <>
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && <HitIcon />}
          </span>
        ))}
      </>
    );
  };

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto my-6 space-y-12">

      {/* Promo Banner */}
      {showBanner && (
        <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-tertiary/20 border border-primary/30 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/20 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-tertiary/20 rounded-full blur-[80px]"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center shrink-0 border border-primary/30 shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-primary text-3xl">local_fire_department</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold headline-font mb-1 text-on-surface">
                {siteSettings.pricing_banner_text || 'Wyprzedaż!'}
              </h3>
              <p className="text-on-surface-variant font-medium">
                {siteSettings.pricing_banner_subtext || `Oszczędź ${discountPercent}% wybierając subskrypcję roczną.`}
              </p>
            </div>
          </div>
          
          <div className="relative z-10 shrink-0 flex flex-col items-center md:items-end gap-3">
            {siteSettings?.pricing_timer_end && new Date(siteSettings.pricing_timer_end).getTime() > Date.now() && (
              <div className="flex items-center gap-2 bg-surface-container-high/80 backdrop-blur-sm border border-outline-variant/30 px-4 py-2 rounded-xl text-on-surface">
                <span className="material-symbols-outlined text-primary text-sm">schedule</span>
                <div className="font-mono font-bold text-sm">
                  {timeLeft.days}d {timeLeft.hours.toString().padStart(2, '0')}:{timeLeft.minutes.toString().padStart(2, '0')}:{timeLeft.seconds.toString().padStart(2, '0')}
                </div>
              </div>
            )}
            {discountPercent > 0 && (
              <div className="bg-primary text-on-primary font-bold px-6 py-3 rounded-xl text-lg shadow-xl shadow-primary/30 rotate-3 md:origin-right">
                -{discountPercent}% Zniżki
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center relative">
        <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-[80px] pointer-events-none" />
        <div className="relative z-10 py-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            <span className="material-symbols-outlined text-sm">stars</span>
            Waluta: Hity & Nuty
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold headline-font mb-4 tracking-tight">
            Cennik & Pakiety
          </h1>
          <p className="text-on-surface-variant font-body text-lg max-w-2xl mx-auto mb-6">
            Generuj muzykę za <strong>Hity</strong> <HitIcon /> — naszą premiumową walutę.
            Na start dostajesz <strong>Nuty</strong> <NutaIcon /> za darmo (20 Nut = 1 Hit).
          </p>
          <div className="inline-flex items-center gap-6 bg-surface-container-high rounded-2xl px-6 py-3 text-sm text-on-surface-variant flex-wrap justify-center">
            <span className="flex items-center gap-1.5"><HitIcon /> <strong>1 Hit</strong> = 1 utwór premium</span>
            <span className="text-outline-variant hidden md:inline">|</span>
            <span className="flex items-center gap-1.5"><NutaIcon /> <strong>20 Nut</strong> = 1 Hit</span>
            <span className="text-outline-variant hidden md:inline">|</span>
            <span>Nuty dostajesz <strong>za darmo</strong> na start</span>
          </div>
        </div>
      </div>

      {/* Promo Code Input */}
      <div className="max-w-md mx-auto mb-12">
        <div className="bg-surface-container-high rounded-3xl p-6 border border-outline-variant/20 shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">sell</span>
            Masz kod promocyjny?
          </h3>
          
          {appliedPromo ? (
            <div className="flex items-center justify-between bg-primary/10 border border-primary/30 p-4 rounded-2xl">
              <div className="flex flex-col">
                <span className="text-primary font-bold">{appliedPromo.code}</span>
                <span className="text-sm text-on-surface-variant">
                  Zniżka: {appliedPromo.type === 'percent' ? `${appliedPromo.value}%` : `${appliedPromo.value} PLN`}
                </span>
              </div>
              <button 
                onClick={removePromoCode}
                className="text-on-surface-variant hover:text-error transition-colors p-2"
                title="Usuń kod"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                  placeholder="Wpisz kod tutaj..."
                  className="flex-1 bg-surface border border-outline-variant/30 rounded-2xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono uppercase"
                  disabled={isValidatingPromo}
                />
                <button
                  onClick={validatePromoCode}
                  disabled={!promoCodeInput.trim() || isValidatingPromo}
                  className="bg-primary text-on-primary font-bold px-6 py-3 rounded-2xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isValidatingPromo ? (
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                  ) : (
                    'Zastosuj'
                  )}
                </button>
              </div>
              {promoError && (
                <p className="text-error text-sm mt-1 px-2">{promoError}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Subscription Plans */}
      <section>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-bold headline-font mb-2 flex items-center gap-3">
              <span className="material-symbols-outlined text-tertiary text-3xl">workspace_premium</span>
              Subskrypcje
            </h2>
            <p className="text-on-surface-variant text-base">Hity co miesiąc + odblokowane funkcje premium. Anuluj kiedy chcesz.</p>
          </div>
          
          {/* Billing Cycle Toggle */}
          <div className="flex items-center bg-surface-container-high p-1.5 rounded-2xl border border-outline-variant/20 shadow-inner">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-surface text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Miesięcznie
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                billingCycle === 'annual'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Rocznie
              {discountPercent > 0 && (
                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  billingCycle === 'annual' ? 'bg-on-primary/20 text-on-primary' : 'bg-primary/20 text-primary'
                }`}>
                  -{discountPercent}%
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {subscriptions.map((sub: any, i: number) => {
            const isActive = currentPlan === sub.plan;
            const colorClass = sub.color || 'primary';
            let basePriceRaw = sub.basePriceNum !== undefined ? sub.basePriceNum : (sub.priceNum || 0);
            let basePrice = Number(basePriceRaw.toString().replace(',', '.'));
            if (isNaN(basePrice)) basePrice = 0;
            const price = calculateDiscountedPrice(basePrice);
            
            return (
              <div
                key={i}
                className={`relative bg-surface-container rounded-3xl border flex flex-col transition-all duration-300
                  ${sub.popular
                    ? `border-${colorClass} shadow-xl shadow-${colorClass}/20 scale-[1.02]`
                    : `border-outline-variant/20 hover:border-${colorClass}/50`
                  }`}
              >
                {sub.popular && (
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 bg-${colorClass} text-on-primary font-bold uppercase tracking-widest text-[10px] px-4 py-1.5 rounded-full shadow-md whitespace-nowrap`}>
                    Najbardziej Kompletny
                  </div>
                )}
                <div className="p-7 md:p-8 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold headline-font">{sub.name}</h3>
                    <div className={`flex items-center gap-1 bg-${colorClass}/10 text-${colorClass} font-bold text-sm px-3 py-1.5 rounded-full`}>
                      {sub.hits} <HitIcon />
                      <span className="text-xs font-normal opacity-80">/mies.</span>
                    </div>
                  </div>
                  <p className="text-on-surface-variant text-sm mb-6 h-10">{sub.description}</p>
                  
                  <div className="mb-8">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-4xl font-extrabold headline-font">{price.replace('.', ',')} PLN</span>
                      <span className="text-on-surface-variant text-sm font-medium">/ mies.</span>
                    </div>
                    {billingCycle === 'annual' && discountPercent > 0 && basePrice > 0 && (
                      <div className="text-sm text-primary font-medium flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">savings</span>
                        Oszczędzasz {((basePrice * 12) * (discountPercent / 100)).toFixed(2).replace('.', ',')} PLN rocznie
                      </div>
                    )}
                    {billingCycle === 'monthly' && discountPercent > 0 && basePrice > 0 && (
                      <div className="text-sm text-on-surface-variant opacity-70">
                        lub {calculateDiscountedPrice(basePrice).replace('.', ',')} PLN / mies. przy planie rocznym
                      </div>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {sub.features.map((f: any, j: number) => (
                      <li key={j} className="flex items-center gap-3 text-sm">
                        <span className={`material-symbols-outlined text-${colorClass} text-lg`}>check_circle</span>
                        <span className="font-medium text-on-surface-variant">{renderFeature(f)}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div>
                    {isActive ? (
                      <div className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm bg-${colorClass}/10 text-${colorClass} border border-${colorClass}/30`}>
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                        Twój aktualny plan
                      </div>
                    ) : (
                      <a
                        href={`${sub.link || ''}${(sub.link || '').includes('?') ? '&' : '?'}prefilled_promo_code=${appliedPromo?.code || ''}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold transition-all text-sm
                          ${sub.popular
                            ? `bg-${colorClass} text-on-primary hover:brightness-110 shadow-lg shadow-${colorClass}/30 hover:-translate-y-0.5`
                            : `bg-surface-container-high text-on-surface hover:bg-${colorClass} hover:text-on-primary border border-outline-variant/30 hover:-translate-y-0.5`
                          }`}
                      >
                        <span className="material-symbols-outlined text-lg">
                          {basePrice === 0 ? 'person' : 'workspace_premium'}
                        </span>
                        {basePrice === 0 ? 'Darmowy dostęp' : `Aktywuj ${sub.name}`}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* One-time Packages */}
      <section className="pt-8 border-t border-outline-variant/10">
        <h2 className="text-2xl font-bold headline-font mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">bolt</span>
          Pakiety Jednorazowe
        </h2>
        <p className="text-on-surface-variant text-sm mb-8">Kup ile potrzebujesz. Hity nie wygasają.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg: any, i: number) => (
            <div
              key={i}
              className={`relative bg-surface-container rounded-3xl border flex flex-col transition-all duration-200
                ${pkg.popular
                  ? 'border-primary shadow-lg shadow-primary/15 scale-[1.02]'
                  : 'border-outline-variant/20 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5'
                }`}
            >
              {pkg.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-on-primary font-bold uppercase tracking-widest text-[10px] px-4 py-1.5 rounded-full shadow-md whitespace-nowrap">
                  {pkg.badge}
                </div>
              )}
              <div className="p-7 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold headline-font">{pkg.name}</h3>
                  <div className="flex items-center gap-1 bg-primary/10 text-primary font-bold text-sm px-3 py-1 rounded-full">
                    {pkg.hits} <HitIcon />
                  </div>
                </div>
                <p className="text-on-surface-variant text-sm mb-6 flex-1">{pkg.description}</p>
                <ul className="space-y-3 mb-8">
                  {pkg.features.map((f: any, j: number) => (
                    <li key={j} className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                      <span className="font-medium text-on-surface-variant">{renderFeature(f)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto">
                  <div className="text-3xl font-extrabold headline-font mb-5">{pkg.price}</div>
                  <a
                    href={`${pkg.link || ''}${(pkg.link || '').includes('?') ? '&' : '?'}prefilled_promo_code=${appliedPromo?.code || ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold transition-all text-sm
                      ${pkg.popular
                        ? 'bg-primary text-on-primary hover:brightness-110 shadow-md shadow-primary/30 hover:-translate-y-0.5'
                        : 'bg-surface-container-high text-on-surface hover:bg-primary hover:text-on-primary border border-outline-variant/30 hover:-translate-y-0.5'
                      }`}
                  >
                    <span className="material-symbols-outlined text-base">shopping_cart</span>
                    Kup {pkg.name}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Packages omitted here... Free plan section removed */}

    </div>
  );
}

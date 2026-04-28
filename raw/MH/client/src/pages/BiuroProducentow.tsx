import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Helmet } from 'react-helmet-async';

export function BiuroProducentow() {
  const { isLoaded, isSignedIn } = useUser();
  const navigate = useNavigate();
  const [producers, setProducers] = useState<any[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [userPlan, setUserPlan] = useState<string>('Free');
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [prodRes, userProdRes, balanceRes] = await Promise.all([
        fetch('/api/producers', { credentials: 'include' }),
        fetch('/api/user-producers', { credentials: 'include' }),
        fetch('/api/user/balance', { credentials: 'include' })
      ]);

      if (prodRes.ok) {
        const pData = await prodRes.json();
        const fetchTime = Date.now();
        setProducers(pData.map((p: any) => ({...p, img: p.img ? `${p.img}${p.img.includes('?') ? '&' : '?'}v=${fetchTime}` : p.img})));
      }
      if (userProdRes.ok) {
        const upData = await userProdRes.json();
        setUnlockedIds(upData.map((up: any) => up.producer_id));
      }
      if (balanceRes.ok) {
        const bData = await balanceRes.json();
        if (bData && bData.plan) {
          setUserPlan(bData.plan);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const location = useLocation();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchData().then(() => {
        const params = new URLSearchParams(location.search);
        const prodId = params.get('producer');
        if (prodId) {
          setTimeout(() => {
            const element = document.getElementById(`producer-${prodId}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              element.classList.add('ring-4', 'ring-primary', 'ring-offset-4', 'scale-105');
              setTimeout(() => {
                element.classList.remove('ring-4', 'ring-primary', 'ring-offset-4', 'scale-105');
              }, 3000);
            }
          }, 500);
        }
      });
    } else if (isLoaded && !isSignedIn) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, location.search]);

  const handleBuy = async (producer: any) => {
    if (!isSignedIn) {
      alert('Musisz być zalogowany!');
      return;
    }
    if (buyingId) return;

    if (!confirm(`Zakontraktować ${producer.name} za ${producer.price_coins} monet?`)) return;

    setBuyingId(producer.id);
    try {
      const res = await fetch('/api/buy-producer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ producer_id: producer.id })
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Sukces! ${producer.name} jest teraz do Twojej dyspozycji.`);
        setUnlockedIds(prev => [...prev, producer.id]);
        window.dispatchEvent(new Event('updateBalance'));
      } else {
        if (data.error && (data.error.includes('Niewystarczająca') || data.error.includes('monet'))) {
          if (confirm('Masz za mało monet, aby zakontraktować tego wykonawcę. Czy chcesz doładować konto?')) {
            navigate('/cennik');
          }
        } else {
          alert(data.error || 'Wystąpił błąd podczas transakcji.');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Błąd sieci.');
    } finally {
      setBuyingId(null);
    }
  };

  const handleSelect = (id: string) => {
    localStorage.setItem('active_guest', id);
    navigate('/');
  };

  return (
    <>
      <Helmet>
        <title>Giełda Talentów AI - Najlepsi Producenci Muzyki Sztucznej Inteligencji | mojhit.pl</title>
        <meta name="description" content="Odkryj naszych ekskluzywnych producentów AI! Wybierz swojego dream producera - od Hip-Hoppo po Discolo. Stwórz profesjonalną muzykę z AI w sekundy." />
        <meta name="keywords" content="giełda talentów, producenci AI, AI producenci, sztuczna inteligencja muzyka, generator muzyki AI, wykonawcy AI, Hip-Hop AI, Disco Polo AI, producent muzyczny AI, mojhit" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="mojhit.pl" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Giełda Talentów AI - Wybierz Swojego Producenta" />
        <meta property="og:description" content="Ekskluzywni producenci AI do Twojej muzyki. Wybierz najlepszego producenta i stwórz swój hit!" />
        <meta property="og:image" content="/og-producenci.png" />
        <meta property="og:url" content="/biuro-producentow" />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Giełda Talentów AI" />
        
        {/* Canonical */}
        <link rel="canonical" href="/biuro-producentow" />
        
        {/* Schema.org for talent/experts */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Giełda Talentów AI",
            "description": "Nasi ekskluzywni producenci muzyki AI",
            "url": "/biuro-producentow",
            "inLanguage": "pl",
            "numberOfItems": producers.length,
            "itemListOrder": "https://schema.org/ItemListOrderUnordered",
            "publisher": {
              "@type": "Organization",
              "name": "mojhit.pl"
            }
          })}
        </script>
      </Helmet>

      <div className="p-8 md:p-12 bg-surface-container-lowest rounded-3xl border border-outline-variant/20 max-w-6xl mx-auto my-10 shadow-xl relative overflow-hidden">
      
      {/* Glow decorative element */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-tertiary/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-10">
            <Link to="/" className="inline-flex items-center justify-center w-12 h-12 bg-surface-container-high rounded-full hover:bg-surface-bright transition-all text-on-surface hover:-translate-x-1 shadow-sm border border-outline-variant/10">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <div>
               <h1 className="text-3xl md:text-5xl font-extrabold headline-font text-on-surface tracking-tight">Giełda Talentów</h1>
               <p className="text-tertiary font-bold text-sm tracking-widest uppercase mt-2">Ekskluzywni Producenci AI</p>
            </div>
        </div>

        {loading ? (
          <div className="text-center py-20">Ładowanie wykonawców...</div>
        ) : producers.length === 0 ? (
          <div className="text-center py-12 bg-surface-container-low rounded-3xl border border-outline-variant/10">
             <span className="material-symbols-outlined text-4xl opacity-50 mb-4">hourglass_empty</span>
             <p className="text-on-surface-variant font-bold">Brak dostępnych wykonawców w tej chwili.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {producers.map(p => {
               const isOwned = unlockedIds.includes(p.id);
               const tier = p.tier || 'basic';
               const isFreeTier = tier === 'basic' || tier === 'free' || p.price_coins === 0;
               const hasVipPlan = userPlan === 'VIP' || userPlan === 'Legend';
               const hasLegendPlan = userPlan === 'Legend';
               const isUnlocked = isOwned || isFreeTier || (tier === 'vip' && hasVipPlan) || (tier === 'legend' && hasLegendPlan);
               const theme = typeof p.theme_config === 'string' ? JSON.parse(p.theme_config || '{}') : (p.theme_config || {});
               const isActiveGuest = localStorage.getItem('active_guest') === p.id;
               
               return (
                 <div key={p.id} id={`producer-${p.id}`} className={`bg-surface-container p-6 rounded-3xl border ${isUnlocked ? 'border-primary/40 shadow-lg shadow-primary/5' : 'border-outline-variant/20'} flex flex-col items-center text-center gap-4 transition-transform hover:-translate-y-1`}>
                     <div className="relative">
                       {/* Tier Badge (Centered Above) */}
                       
                       
                       
                       <div className={`w-28 h-28 rounded-full border-4 shadow-inner flex items-center justify-center overflow-hidden relative ${theme.colorBorder || 'border-surface-container-lowest'}`}>
                         <img src={p.img} alt={p.name} className="absolute inset-0 w-full h-full object-cover" onError={(e) => e.currentTarget.style.display='none'} />
                       </div>
                       
                     </div>
                    <div>
                      <div className="flex items-center justify-center gap-2">
                        {!isUnlocked && <span className="material-symbols-outlined text-primary text-xl" style={{fontVariationSettings: "'FILL' 1"}}>lock</span>}
                        <h3 className="font-bold text-2xl text-on-surface headline-font">{p.name}</h3>
                      </div>
                      {p.tier === 'vip' && <div className="mt-2 inline-block bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm border border-white/10 uppercase">VIP</div>}
                      {p.tier === 'legend' && <div className="mt-2 inline-block bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm border border-white/10 uppercase">LEGEND</div>}
                      <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${theme.colorText || 'text-primary'}`}>{p.badge}</p>
                    </div>
                    <p className="text-sm text-on-surface-variant/80 italic font-body max-w-xs min-h-[60px] pt-1">"{p.init_msg}"</p>
                    
                    <div className="mt-auto pt-4 w-full">
                      {isUnlocked ? (
                        <button 
                          onClick={() => handleSelect(p.id)}
                          className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-md ${isActiveGuest ? 'bg-surface-variant text-on-surface-variant border border-outline-variant/20' : 'bg-primary text-on-primary hover:bg-primary-dark hover:shadow-lg'}`}
                        >
                          {isActiveGuest ? 'Aktualnie Wybrany' : 'Wybierz Wykonawcę'}
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleBuy(p)}
                          disabled={buyingId === p.id}
                          className="w-full py-3 rounded-xl bg-tertiary text-on-primary font-black uppercase tracking-widest text-sm hover:bg-tertiary/90 transition-all shadow-md flex items-center justify-center gap-2"
                        >
                          {buyingId === p.id ? (
                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                          ) : (
                            <>
                              Zakontraktuj za {p.price_coins} <span className="material-symbols-outlined text-[18px]">star</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                 </div>
               );
             })}
          </div>
        )}
</div>
      </div>
    </>
  );
}

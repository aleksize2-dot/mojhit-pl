import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

import { useNavigate } from 'react-router-dom';

type Producer = {
  id: string;
  name: string;
  genre: string;
  description: string;
  img: string;
  status: string;
  tier?: string;
  price_coins?: number;
};

export function MyProducers() {
  const navigate = useNavigate();
  const [producers, setProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);
  const [firedProducers, setFiredProducers] = useState<string[]>([]);
  const [userPlan, setUserPlan] = useState<string>('Free');
  const [ownedProducerIds, setOwnedProducerIds] = useState<string[]>([]);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    // Load fired producers from localStorage
    const saved = localStorage.getItem('firedProducers');
    if (saved) {
      try {
        setFiredProducers(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing fired producers', e);
      }
    }

    // Fetch balance/plan
    const fetchUserData = async () => {
      try {
        const [balanceRes, ownedRes, allProducersRes] = await Promise.all([
          fetch('/api/user/balance', { credentials: 'include' }),
          fetch('/api/user-producers', { credentials: 'include' }),
          fetch('/api/producers?status=active')
        ]);

        const balanceData = await balanceRes.json();
        const ownedData = await ownedRes.json();
        const allProducersData = await allProducersRes.json();

        if (balanceData && balanceData.plan) {
          setUserPlan(balanceData.plan);
        }

        if (Array.isArray(ownedData)) {
          setOwnedProducerIds(ownedData.map((item: any) => item.producer_id));
        }

        if (Array.isArray(allProducersData)) {
          setProducers(allProducersData);
        }
      } catch (err) {
        console.error('Error fetching user data/producers:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isSignedIn) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [isSignedIn]);

  const handleToggleHire = (producerId: string) => {
    setFiredProducers(prev => {
      const isFired = prev.includes(producerId);
      const updated = isFired ? prev.filter(id => id !== producerId) : [...prev, producerId];
      localStorage.setItem('firedProducers', JSON.stringify(updated));
      return updated;
    });
  };

  // De-duplicate and filter accessible producers
  const accessibleProducers = Array.from(new Map(producers.map(item => [item.id, item])).values()).filter(p => {
    const isOwned = ownedProducerIds.includes(p.id);
    const tier = p.tier || 'basic';
    const isFreeTier = tier === 'basic' || tier === 'free' || p.price_coins === 0;
    const hasVipPlan = userPlan === 'VIP' || userPlan === 'Legend';
    const hasLegendPlan = userPlan === 'Legend';
    
    return isOwned || isFreeTier || (tier === 'vip' && hasVipPlan) || (tier === 'legend' && hasLegendPlan);
  });

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <div className="flex flex-col mb-6">
        <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4">
          <div>
            <h2 className="text-3xl font-bold headline-font tracking-tight">Twoi wykonawcy</h2>
            <p className="text-on-surface-variant text-sm font-body mt-1">Zarządzaj swoją ekipą. Zatrudniaj i zwalniaj wykonawców AI.</p>
          </div>
          <a href="/biuro-producentow" className="bg-tertiary/10 border border-tertiary/30 text-tertiary px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-tertiary/20 hover:border-tertiary/50 transition-all font-bold text-sm w-full sm:w-auto shrink-0">
            <span className="material-symbols-outlined text-[20px]">store</span>
            <span>Giełda wykonawców</span>
          </a>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 min-h-[40vh]">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary text-center">cycle</span>
        </div>
      ) : accessibleProducers.length === 0 ? (
        <div className="p-12 bg-surface-container rounded-3xl border border-outline-variant/20 flex flex-col items-center text-center space-y-4 shadow-sm min-h-[40vh] justify-center">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant/40">groups</span>
          <h2 className="text-2xl font-bold headline-font">Brak wykonawców</h2>
          <p className="text-on-surface-variant font-body">
            {userPlan === 'VIP' || userPlan === 'Legend'
              ? 'Nie znaleziono aktywnych wykonawców.' 
              : 'Nie masz jeszcze żadnych zatrudnionych wykonawców. Odwiedź giełdę, aby kogoś zatrudnić!'}
          </p>
          {!(userPlan === 'VIP' || userPlan === 'Legend') && (
            <a href="/biuro-producentow" className="bg-primary text-on-primary px-6 py-2 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors">
              Przejdź do giełdy
            </a>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accessibleProducers.map(producer => {
            const isFired = firedProducers.includes(producer.id);
            return (
              <div 
                key={producer.id} 
                className={`bg-surface-container-low p-5 rounded-3xl border ${isFired ? 'border-error/20 opacity-75' : 'border-outline-variant/20 hover:border-primary/50'} flex flex-col items-center gap-4 transition-all`}
              >
                <div 
                  className="relative cursor-pointer group"
                  onClick={() => {
                    if (!isFired) {
                      localStorage.setItem('active_agent', producer.id);
                      navigate('/');
                    }
                  }}
                  title={isFired ? '' : 'Kliknij, aby stworzyć hit'}
                >
                  <div className="relative">
                    {/* Tier Badge (Centered Above) */}
                    
                    
                    
                    <div className={`w-24 h-24 rounded-full overflow-hidden border-4 ${isFired ? 'border-error/30 grayscale' : 'border-primary/30 group-hover:scale-105 group-hover:border-primary'} transition-all shadow-lg`}>
                      {producer.img ? (
                        <img src={producer.img} alt={producer.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
                          <span className="material-symbols-outlined text-4xl text-on-surface-variant/50">person</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {isFired && (
                    <div className="absolute -bottom-2 -right-2 bg-error text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm border-2 border-surface-container-low">
                      Zwolniony
                    </div>
                  )}
                </div>

                <div className="text-center w-full">
                  <h3 className={`font-bold headline-font text-lg ${isFired ? 'line-through text-on-surface-variant' : ''}`}>{producer.name}</h3>
                  {(producer.tier === 'vip' || producer.tier === 'legend') && (
                    <div className="mt-1 inline-block bg-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm border border-white/10 uppercase">
                      {producer.tier === 'vip' ? 'VIP' : 'LEGEND'}
                    </div>
                  )}
                  <p className="text-primary text-xs font-bold uppercase tracking-wider mt-0.5">{producer.genre}</p>
                  <p className="text-on-surface-variant text-sm font-body mt-2 line-clamp-3 leading-snug">
                    {producer.description}
                  </p>
                </div>

                <button
                  onClick={() => handleToggleHire(producer.id)}
                  className={`mt-2 w-full py-2.5 rounded-xl font-bold headline-font text-sm transition-colors flex items-center justify-center gap-2 ${
                    isFired 
                      ? 'bg-primary text-on-primary hover:bg-primary/80' 
                      : 'bg-error/10 text-error hover:bg-error/20'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isFired ? 'person_add' : 'person_remove'}
                  </span>
                  {isFired ? 'Zatrudnij ponownie' : 'Zerwij kontrakt'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

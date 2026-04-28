import { useState, useEffect, useRef } from 'react';
import { useAuth, useUser, SignInButton } from '@clerk/clerk-react';

export interface Review {
  id: string;
  author_name: string;
  rating: number;
  content: string;
  avatar_url?: string | null;
}

export function ReviewsCarousel() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ rating: 5, content: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setReviews(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    const speed = 0.015; // pixel per ms
    let exactScrollLeft = 0;
    let isInitialized = false;

    const animate = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      if (!isPaused && scrollRef.current && reviews.length > 0) {
        if (!isInitialized) {
          exactScrollLeft = scrollRef.current.scrollLeft;
          isInitialized = true;
        }

        const { scrollWidth } = scrollRef.current;
        exactScrollLeft += speed * delta;
        
        // Reset seamless loop when scrolling past half
        if (exactScrollLeft >= scrollWidth / 2) {
           exactScrollLeft -= scrollWidth / 2;
        }
        
        scrollRef.current.scrollLeft = exactScrollLeft;
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, reviews.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) return;
    
    setIsSubmitting(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rating: formData.rating,
          content: formData.content,
          author_name: user?.firstName || 'Użytkownik',
          avatar_url: user?.imageUrl || null
        })
      });
      
      if (res.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setIsModalOpen(false);
          setSubmitSuccess(false);
          setFormData({ rating: 5, content: '' });
        }, 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (reviews.length === 0) return null;

  return (
    <section className="space-y-8 w-full mt-16 px-2">
      <div className="text-center max-w-3xl mx-auto mb-8">
        <h2 className="text-3xl font-extrabold headline-font tracking-tight mb-4">Najlepiej oceniane przez społeczność</h2>
        <p className="text-on-surface-variant font-body leading-relaxed mb-6">
          Każdego miesiąca tysiące twórców korzysta z MojHit.pl, aby wygenerować unikalne, profesjonalne utwory w zaledwie kilka chwil. Sprawdź, co inni sądzą o naszym narzędziu – poniżej znajdziesz autentyczne opinie naszych użytkowników.
        </p>
        
        {isSignedIn ? (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-full font-bold text-sm md:text-base hover:scale-105 hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] transition-all uppercase tracking-wider relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="material-symbols-outlined relative z-10">favorite</span>
            <span className="relative z-10">Zostaw opinię i odbierz prezent</span>
          </button>
        ) : (
          <SignInButton mode="modal" signUpFallbackRedirectUrl="/">
            <button className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-full font-bold text-sm md:text-base hover:scale-105 hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] transition-all uppercase tracking-wider relative group overflow-hidden">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="material-symbols-outlined relative z-10">favorite</span>
              <span className="relative z-10">Zostaw opinię i odbierz prezent</span>
            </button>
          </SignInButton>
        )}
      </div>

      <div 
        className="full-bleed relative flex mask-image-fade"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto py-4 hide-scrollbar pb-6 -mx-2 px-2"
        >
          {[...reviews, ...reviews].map((review, i) => (
            <div 
              key={`${review.id}-${i}`} 
              className="bg-surface-container-low border border-outline-variant/10 p-6 rounded-2xl flex flex-col justify-between flex-shrink-0 w-[300px] md:w-[350px] shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex text-[#FBBC04]">
                    {[...Array(5)].map((_, index) => (
                      <span key={index} className="material-symbols-outlined text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>
                        {index < review.rating ? 'star' : 'star_outline'}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold headline-font">{review.author_name}</span>
                    {review.avatar_url ? (
                      <img src={review.avatar_url} alt={review.author_name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm text-on-surface-variant">person</span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  {review.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container-high rounded-3xl w-full max-w-md p-6 sm:p-8 border border-outline-variant/20 shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {submitSuccess ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-4xl">check_circle</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">Dziękujemy!</h3>
                <p className="text-on-surface-variant mb-4">Twoja opinia została wysłana do moderacji.</p>
                <p className="text-sm font-bold text-primary">Prezent (nuty) zostanie dodany do Twojego konta po akceptacji opinii.</p>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold mb-2">Zostaw opinię</h3>
                <p className="text-on-surface-variant text-sm mb-6">
                  Podziel się swoimi wrażenijami i odbierz prezent po pozytywnej weryfikacji przez administratora!
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-2">Twoja ocena</label>
                    <div className="flex gap-2 justify-center py-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData({ ...formData, rating: star })}
                          className={`material-symbols-outlined text-4xl transition-colors ${formData.rating >= star ? 'text-[#FBBC04]' : 'text-outline-variant/30'}`}
                          style={{fontVariationSettings: formData.rating >= star ? "'FILL' 1" : "'FILL' 0"}}
                        >
                          star
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-2">Treść opinii</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full bg-surface px-4 py-3 rounded-xl border border-outline-variant/20 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none text-on-surface"
                      placeholder="Co najbardziej podoba Ci się w naszym generatorze?"
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting || !formData.content.trim()}
                    className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Wysyłanie...' : 'Wyślij opinię'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

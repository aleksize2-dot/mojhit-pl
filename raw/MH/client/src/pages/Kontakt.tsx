import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

export function Kontakt() {
  const { isSignedIn, user } = useUser();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  // Auto-fill if user is logged in
  useEffect(() => {
    if (isSignedIn && user) {
      setName(user.fullName || user.firstName || '');
      setEmail(user.primaryEmailAddress?.emailAddress || '');
    }
  }, [isSignedIn, user]);

  return (
    <div className="p-8 md:p-12 bg-surface-container-lowest rounded-3xl border border-outline-variant/20 max-w-4xl mx-auto my-10 shadow-xl relative overflow-hidden">
      
      {/* Glow decorative element */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-8">
            <Link to="/" className="inline-flex items-center justify-center w-12 h-12 bg-surface-container-high rounded-full hover:bg-surface-bright transition-all text-on-surface hover:-translate-x-1">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <div>
               <h1 className="text-3xl md:text-5xl font-extrabold headline-font text-on-surface tracking-tight">Kontakt</h1>
               <p className="text-primary font-bold text-sm tracking-widest uppercase mt-2">Napisz do nas</p>
            </div>
        </div>

        <div className="bg-surface-container-low p-6 md:p-8 rounded-3xl border border-outline-variant/10 shadow-sm mb-8">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-sm font-bold text-on-surface-variant ml-1">Imię / Pseudonim</label>
                <input 
                  type="text" 
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSignedIn ?? false}
                  placeholder="Wpisz swoje imię" 
                  className="bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Email Field */}
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-bold text-on-surface-variant ml-1">Adres E-mail</label>
                <input 
                  type="email" 
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSignedIn ?? false}
                  placeholder="twoj@email.com" 
                  className="bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Subject Field */}
            <div className="flex flex-col gap-2">
              <label htmlFor="subject" className="text-sm font-bold text-on-surface-variant ml-1">Temat wiadomości</label>
              <input 
                type="text" 
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="W czym możemy pomóc?" 
                className="bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            {/* Message Field */}
            <div className="flex flex-col gap-2">
              <label htmlFor="message" className="text-sm font-bold text-on-surface-variant ml-1">Treść wiadomości</label>
              <textarea 
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="Opisz swój problem lub propozycję..." 
                className="bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y"
              ></textarea>
            </div>

            {/* Submit Button (Disabled for now) */}
            <div className="pt-2">
              <button 
                type="button" 
                disabled 
                className="w-full md:w-auto px-8 py-4 bg-primary text-on-primary font-bold rounded-xl flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
              >
                <span className="material-symbols-outlined">send</span>
                Wyślij wiadomość (Wkrótce)
              </button>
              <p className="text-xs text-error mt-3 font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">info</span>
                Formularz jest w trakcie prac technicznych. Użyj adresu e-mail poniżej.
              </p>
            </div>

          </form>
        </div>

        {/* Direct Contact Section */}
        <div className="p-6 bg-tertiary/10 border border-tertiary/20 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-tertiary/20 rounded-2xl flex items-center justify-center text-tertiary shrink-0">
              <span className="material-symbols-outlined text-3xl">mail</span>
            </div>
            <div>
              <h3 className="font-bold text-on-surface text-lg">Kontakt bezpośredni</h3>
              <p className="text-on-surface-variant text-sm mt-1">Napisz do nas bezpośrednio ze swojej skrzynki e-mail.</p>
            </div>
          </div>
          <a href="mailto:admin@mojhit.pl" className="px-6 py-3 bg-tertiary text-on-tertiary font-bold rounded-xl flex items-center gap-2 hover:bg-tertiary/90 transition-colors whitespace-nowrap">
            admin@mojhit.pl
          </a>
        </div>

      </div>
    </div>
  );
}

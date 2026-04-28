import { Routes, Route, useSearchParams, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Footer } from './components/Footer';
import { CookieBanner } from './components/CookieBanner';

import { Home } from './pages/Home';
import { MyTracks } from './pages/MyTracks';
import { TrackDetail } from './pages/TrackDetail';
import { Browse } from './pages/Browse';
import { Contests } from './pages/Contests';

import { Regulamin } from './pages/Regulamin';
import { PolitykaPrywatnosci } from './pages/PolitykaPrywatnosci';
import { JakZdobycMonety } from './pages/JakZdobycMonety';
import { FaqPomoc } from './pages/FaqPomoc';
import { Kontakt } from './pages/Kontakt';
import { Cennik } from './pages/Cennik';
import { KupMonety } from './pages/KupMonety';
import { InstrukcjaFaq } from './pages/InstrukcjaFaq';
import { Wsparcie } from './pages/Wsparcie';
import { TrendyTygodnia } from './pages/TrendyTygodnia';
import { Nowosci } from './pages/Nowosci';
import { BiuroProducentow } from './pages/BiuroProducentow';
import { AdminDashboard } from './pages/AdminDashboard';
import { BankTekstow } from './pages/BankTekstow';
import { TekstDetail } from './pages/TekstDetail';
import { Polecaj } from './pages/Polecaj';
import { MyProducers } from './pages/MyProducers';
import { GiftCatalogPage } from './pages/GiftFunnel/GiftCatalogPage';
import { GiftTemplatePage } from './pages/GiftFunnel/GiftTemplatePage';

function App() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      localStorage.setItem('ref_code', refCode);
    }
  }, [searchParams]);

  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isHome = location.pathname === '/';

  return (
    <div className={`bg-surface text-on-surface flex flex-col transition-colors duration-300 ${isHome ? 'h-[100dvh] overflow-hidden md:h-auto md:min-h-[100dvh] md:overflow-visible' : 'min-h-[100dvh]'}`}>
      <Header />

      <main className={isAdmin ? "w-full pt-6 flex-1 pb-[82px] md:pb-0 flex flex-col min-h-0" : `w-full max-w-7xl mx-auto ${isHome ? 'px-0' : 'px-4'} md:px-6 pt-4 space-y-4 md:space-y-10 flex-1 pb-[82px] md:pb-0 flex flex-col min-h-0`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/my-tracks" element={<MyTracks />} />
          <Route path="/track/:id" element={<TrackDetail />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/contests" element={<Contests />} />
          <Route path="/regulamin" element={<Regulamin />} />
          <Route path="/polityka-prywatnosci" element={<PolitykaPrywatnosci />} />
          <Route path="/jak-zdobyc-monety" element={<JakZdobycMonety />} />
          <Route path="/faq-pomoc" element={<FaqPomoc />} />
          <Route path="/kontakt" element={<Kontakt />} />
          <Route path="/cennik" element={<Cennik />} />
          <Route path="/kup-monety" element={<KupMonety />} />
          <Route path="/instrukcja-faq" element={<InstrukcjaFaq />} />
          <Route path="/wsparcie" element={<Wsparcie />} />
          <Route path="/trendy-tygodnia" element={<TrendyTygodnia />} />
          <Route path="/nowosci" element={<Nowosci />} />
          <Route path="/biuro-producentow" element={<BiuroProducentow />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/teksty" element={<BankTekstow />} />
          <Route path="/teksty/:slug" element={<TekstDetail />} />
          <Route path="/polecaj" element={<Polecaj />} />
          <Route path="/my-producers" element={<MyProducers />} />
          <Route path="/upominek" element={<GiftCatalogPage />} />
          <Route path="/upominek/:slug" element={<GiftTemplatePage />} />
        </Routes>
      </main>

      <div className={isHome ? "hidden md:block" : ""}>
        <Footer />
      </div>
      <BottomNav />
      <CookieBanner />
    </div>
  );
}

export default App;
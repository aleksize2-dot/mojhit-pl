import { Routes, Route, useSearchParams, useLocation } from 'react-router-dom';
import { useEffect, Suspense, lazy } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Footer } from './components/Footer';
import { CookieBanner } from './components/CookieBanner';

import { Home } from './pages/Home';
const MyTracks = lazy(() => import('./pages/MyTracks').then(module => ({ default: module.MyTracks })));
const TrackDetail = lazy(() => import('./pages/TrackDetail').then(module => ({ default: module.TrackDetail })));
const Browse = lazy(() => import('./pages/Browse').then(module => ({ default: module.Browse })));
const Contests = lazy(() => import('./pages/Contests').then(module => ({ default: module.Contests })));

const Regulamin = lazy(() => import('./pages/Regulamin').then(module => ({ default: module.Regulamin })));
const PolitykaPrywatnosci = lazy(() => import('./pages/PolitykaPrywatnosci').then(module => ({ default: module.PolitykaPrywatnosci })));
const JakZdobycMonety = lazy(() => import('./pages/JakZdobycMonety').then(module => ({ default: module.JakZdobycMonety })));
const FaqPomoc = lazy(() => import('./pages/FaqPomoc').then(module => ({ default: module.FaqPomoc })));
const Kontakt = lazy(() => import('./pages/Kontakt').then(module => ({ default: module.Kontakt })));
const Cennik = lazy(() => import('./pages/Cennik').then(module => ({ default: module.Cennik })));
const KupMonety = lazy(() => import('./pages/KupMonety').then(module => ({ default: module.KupMonety })));
const InstrukcjaFaq = lazy(() => import('./pages/InstrukcjaFaq').then(module => ({ default: module.InstrukcjaFaq })));
const Wsparcie = lazy(() => import('./pages/Wsparcie').then(module => ({ default: module.Wsparcie })));
const TrendyTygodnia = lazy(() => import('./pages/TrendyTygodnia').then(module => ({ default: module.TrendyTygodnia })));
const Nowosci = lazy(() => import('./pages/Nowosci').then(module => ({ default: module.Nowosci })));
const BiuroProducentow = lazy(() => import('./pages/BiuroProducentow').then(module => ({ default: module.BiuroProducentow })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const BankTekstow = lazy(() => import('./pages/BankTekstow').then(module => ({ default: module.BankTekstow })));
const TekstDetail = lazy(() => import('./pages/TekstDetail').then(module => ({ default: module.TekstDetail })));
const Polecaj = lazy(() => import('./pages/Polecaj').then(module => ({ default: module.Polecaj })));
const MyProducers = lazy(() => import('./pages/MyProducers').then(module => ({ default: module.MyProducers })));
const GiftCatalogPage = lazy(() => import('./pages/GiftFunnel/GiftCatalogPage').then(module => ({ default: module.GiftCatalogPage })));
const GiftTemplatePage = lazy(() => import('./pages/GiftFunnel/GiftTemplatePage').then(module => ({ default: module.GiftTemplatePage })));

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
        <Suspense fallback={<div className="flex items-center justify-center h-full min-h-[50vh]"><span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span></div>}>
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
        </Suspense>
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
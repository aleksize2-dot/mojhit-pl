import React from 'react';
import { Header } from './components/Header';
import { Generator } from './components/Generator';
import { VibeTags } from './components/VibeTags';
import { RecentTracks } from './components/RecentTracks';
import { BottomNav } from './components/BottomNav';
import { Footer } from './components/Footer';
import { CookieBanner } from './components/CookieBanner';

function App() {
  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto px-6 pt-6 space-y-10 min-h-[60vh]">
        <div className="space-y-6">
          <Generator />
          <VibeTags />
        </div>
        
        <RecentTracks />
      </main>

      <Footer />
      <BottomNav />
      <CookieBanner />
    </div>
  );
}

export default App;
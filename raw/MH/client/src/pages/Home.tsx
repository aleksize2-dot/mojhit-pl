import { useAuth } from '@clerk/clerk-react';
import { SEO, schemas } from '../components/SEO';
import { Generator } from '../components/Generator';
import { RecentTracks } from '../components/RecentTracks';
import { Welcome } from './Welcome';

export function Home() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <div className="min-h-[60vh] flex items-center justify-center"><span className="material-symbols-outlined animate-spin text-4xl text-primary">cycle</span></div>;
  }

  if (!isSignedIn) {
    return (
      <>
        <SEO
          title="Generator Muzyki AI"
          description="Stwórz własny hit z AI! Wybierz polskiego producenta, opisz pomysł i otrzymaj gotową piosenkę w 3 minuty. Personalizowane utwory na każdą okazję. Zacznij za darmo!"
          keywords="generator muzyki AI, tworzenie piosenek AI, polski generator muzyki, personalizowane piosenki, hit na zamówienie, muzyka AI, muzyka na prezent"
          schema={schemas.home}
        />
        <Welcome />
      </>
    );
  }

  return (
    <>
      <SEO
        title="Generator Muzyki AI"
        description="Stwórz własny hit z AI! Wybierz polskiego producenta, opisz pomysł i otrzymaj gotową piosenkę w 3 minuty. Personalizowane utwory na każdą okazję."
        keywords="generator muzyki AI, tworzenie piosenek AI, polski generator muzyki, personalizowane piosenki, hit na zamówienie, muzyka AI"
        schema={schemas.home}
      />
      <div className="flex-1 flex flex-col relative w-full min-h-0">
        <div className="flex-1 flex flex-col md:space-y-6 min-h-0">
          <Generator />
        </div>
        <div className="hidden md:block">
          <RecentTracks />
        </div>
      </div>
    </>
  );
}

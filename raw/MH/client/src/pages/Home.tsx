import { useAuth } from '@clerk/clerk-react';
import { Generator } from '../components/Generator';
import { RecentTracks } from '../components/RecentTracks';
import { Welcome } from './Welcome';

export function Home() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <div className="min-h-[60vh] flex items-center justify-center"><span className="material-symbols-outlined animate-spin text-4xl text-primary">cycle</span></div>;
  }

  if (!isSignedIn) {
    return <Welcome />;
  }

  return (
    <div className="flex-1 flex flex-col relative w-full min-h-0">
      <div className="flex-1 flex flex-col md:space-y-6 min-h-0">
        <Generator />
      </div>
      <div className="hidden md:block">
        <RecentTracks />
      </div>
    </div>
  );
}

import { useAuth } from '@clerk/clerk-react';
import { Generator } from '../components/Generator';
import { VibeTags } from '../components/VibeTags';
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
    <>
      <div className="space-y-6">
        <Generator />
        <VibeTags />
      </div>
      <RecentTracks />
    </>
  );
}

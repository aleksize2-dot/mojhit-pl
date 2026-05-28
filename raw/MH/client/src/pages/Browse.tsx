import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/react';
import { type Track, TrackCard } from '../components/RecentTracks';
import { SEO } from '../components/SEO';

export function Browse() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState<'recent' | 'top'>('recent');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        try { audioRef.current.pause(); } catch (e) {}
      }
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    const endpoint = sortMode === 'recent' ? '/api/tracks/recent?limit=50' : '/api/tracks/top?limit=50';
    
    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTracks(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching tracks:', err);
        setLoading(false);
      });
  }, [sortMode]);

  const handleLike = async (trackId: string) => {
    if (!isSignedIn) return;
    try {
      const res = await fetch(`/api/tracks/${trackId}/like`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        setTracks(prev => prev.map(t => t.id === trackId ? { ...t, likes: t.likes + 1 } : t));
      }
    } catch (e) {
      console.error('Like error:', e);
    }
  };

  const handlePlay = async (track: Track) => {
    if (playingId === track.id) {
      if (audioRef.current) {
        try { audioRef.current.pause(); } catch(e) {}
      }
      setPlayingId(null);
    } else {
      if ((window as any).globalAudio) {
        try { (window as any).globalAudio.pause(); } catch(e) {}
      }
      if (audioRef.current) {
        try { audioRef.current.pause(); } catch(e) {}
      }

      if (track.audio_url) {
        const audio = new Audio(track.audio_url);
        audioRef.current = audio;
        (window as any).globalAudio = audio;
        
        setPlayingId(track.id);
        try {
          await audio.play();
        } catch (e) {
          console.error("Audio playback failed:", e);
          setPlayingId(null);
        }
        
        audio.onended = () => setPlayingId(null);
      }
    }
  };

  return (
    <>
      <SEO
        title={sortMode === 'top' ? 'Popularne Hity AI 2026' : 'Ostatnie Hity AI'}
        description={sortMode === 'top' 
          ? 'Najpopularniejsze utwory wygenerowane przez AI w 2026 roku. Odkryj najlepsze hity na mojhit.pl!' 
          : 'Odkrywaj najnowsze utwory wygenerowane przez AI. Słuchaj i oceniaj hity stworzone przez społeczność mojhit.pl.'}
        canonical="/browse"
        keywords="muzyka AI, wygenerowane piosenki, AI hits, darmowa muzyka, generator muzyki AI, polskie hity AI"
        ogImage="/og-browse.png"
      />

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold headline-font tracking-tight">{sortMode === 'top' ? 'Popularne Hity AI 2026' : 'Ostatnie Hity AI'}</h1>
            <p className="text-on-surface-variant text-sm font-body mt-1">Odkrywaj hity wygenerowane przez innych użytkowników.</p>
          </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-on-surface-variant">Sortuj według:</label>
          <select 
            className="bg-surface-container-low border border-outline-variant/20 focus:border-primary p-2.5 rounded-xl outline-none text-sm font-bold shadow-sm"
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as 'recent' | 'top')}
          >
            <option value="recent">Najnowsze 🌟</option>
            <option value="top">Popularne (Lajki) 🔥</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 min-h-[40vh]">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary text-center">cycle</span>
        </div>
      ) : tracks.length === 0 ? (
        <div className="p-12 bg-surface-container rounded-3xl border border-outline-variant/20 flex flex-col items-center text-center space-y-4 shadow-sm min-h-[40vh] justify-center">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant/40">queue_music</span>
          <h2 className="text-2xl font-bold headline-font">Brak utworów</h2>
          <p className="text-on-surface-variant font-body">Nikt jeszcze nic nie wygenerował. Bądź pierwszy!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tracks.map(track => (
            <TrackCard 
              key={track.id} 
              track={track} 
              playingId={playingId} 
              handlePlay={handlePlay} 
              handleLike={handleLike} 
              isSignedIn={!!isSignedIn}
              className="flex-col !items-start hover:-translate-y-1 hover:shadow-xl duration-300"
            />
          ))}
        </div>
      )}
    </div>
    </>
  );
}

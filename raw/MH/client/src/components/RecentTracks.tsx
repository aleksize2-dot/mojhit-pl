import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { ReviewsCarousel } from './ReviewsCarousel';

export interface Track {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  cover_image_url: string | null;
  created_at: string;
  likes: number;
  producer_id?: string;
  producers?: { name: string };
  video_thumbnail_url?: string;
  video_status?: string;
}

export function TrackCard({ 
  track, 
  playingId, 
  handlePlay, 
  handleLike, 
  isSignedIn,
  className = ''
}: { 
  track: Track, 
  playingId: string | null, 
  handlePlay: (t: Track) => void, 
  handleLike: (id: string) => void, 
  isSignedIn: boolean,
  className?: string
}) {
  return (
    <Link
      to={`/track/${track.id}`}
      className={`bg-surface-container-low p-4 rounded-xl flex items-center gap-4 group hover:bg-surface-container-high transition-colors cursor-pointer flex-shrink-0 ${className}`}
    >
      <div 
        className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden shadow-lg bg-primary/20 flex items-center justify-center group/cover"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handlePlay(track); }}
      >
        {track.video_thumbnail_url || track.cover_image_url ? (
          <img src={track.video_thumbnail_url || track.cover_image_url} alt={track.title} className="w-full h-full object-cover group-hover/cover:scale-110 transition-transform duration-500" />
        ) : (
          <span className={`material-symbols-outlined text-3xl ${playingId === track.id ? 'text-primary' : 'text-on-surface-variant'}`}>
            {playingId === track.id ? 'pause_circle' : 'play_circle'}
          </span>
        )}
        
        {/* Hover / Playing / Pending Overlay */}
        {(track as any).video_status === 'pending' || (track as any).video_status === 'processing' ? (
          <div className={`absolute inset-0 bg-black/60 flex items-center justify-center`}>
            <span className="material-symbols-outlined text-white animate-spin">progress_activity</span>
          </div>
        ) : (
          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${playingId === track.id ? 'opacity-100' : 'opacity-0 group-hover/cover:opacity-100'}`}>
            <span className="material-symbols-outlined text-3xl text-white">
              {playingId === track.id ? 'pause_circle' : 'play_circle'}
            </span>
          </div>
        )}
      </div>

      <div className="flex-grow min-w-0">
        <h3 className={`font-bold truncate headline-font leading-tight ${playingId === track.id ? 'text-primary' : ''}`}>
          {track.title}
        </h3>
        <div className="flex items-center gap-2 mt-0.5">
          {track.producers?.name && (
            <span className="inline-block bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full">
              {track.producers.name}
            </span>
          )}
          <p className="text-on-surface-variant text-[11px] truncate">{track.description?.slice(0, 60)}...</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-on-surface-variant flex items-center gap-1">
          <span className="material-symbols-outlined text-base text-primary" style={{fontVariationSettings: "'FILL' 1"}}>favorite</span>
          {track.likes || 0}
        </span>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handlePlay(track); }}
          className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors p-1"
          title="Play/Pause"
        >
          {playingId === track.id ? 'pause' : 'play_arrow'}
        </button>
        {isSignedIn && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLike(track.id); }}
            className="material-symbols-outlined text-primary hover:scale-110 active:scale-90 transition-all p-1"
            style={{fontVariationSettings: "'FILL' 1"}}
            title="Polub"
          >
            favorite
          </button>
        )}
      </div>
    </Link>
  );
}

export function RecentTracks() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    const speed = 0.015; // pixels per millisecond
    let exactScrollLeft = 0;
    let isInitialized = false;

    const animate = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      if (!isPaused && scrollRef.current && tracks.length > 0) {
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
  }, [isPaused, tracks.length]);

  // Cleanup local audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        try { audioRef.current.pause(); } catch (e) {}
      }
    };
  }, []);

  useEffect(() => {
    Promise.all([
      fetch('/api/tracks/recent?limit=20').then(r => r.json()),
      fetch('/api/tracks/top?limit=10').then(r => r.json())
    ])
    .then(([recentData, topData]) => {
      if (Array.isArray(recentData)) setTracks(recentData);
      if (Array.isArray(topData)) setTopTracks(topData);
      setLoading(false);
    })
    .catch(() => setLoading(false));
  }, []);

  const handleLike = async (trackId: string) => {
    if (!isSignedIn) return;
    try {
      const res = await fetch(`/api/tracks/${trackId}/like`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        setTracks(prev => prev.map(t => t.id === trackId ? { ...t, likes: t.likes + 1 } : t));
        setTopTracks(prev => prev.map(t => t.id === trackId ? { ...t, likes: t.likes + 1 } : t));
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
      // 1. Pause any currently playing audio globally
      if ((window as any).globalAudio) {
        try { (window as any).globalAudio.pause(); } catch(e) {}
      }
      
      // 2. Pause local reference just in case
      if (audioRef.current) {
        try { audioRef.current.pause(); } catch(e) {}
      }

      if (track.audio_url) {
        const audio = new Audio(track.audio_url);
        audioRef.current = audio;
        (window as any).globalAudio = audio; // Register globally
        
        setPlayingId(track.id);
        
        try {
          await audio.play();
        } catch (e) {
          console.error("Audio playback failed:", e);
          // If it fails (e.g. user didn't interact enough), reset state
          setPlayingId(null);
        }
        
        audio.onended = () => {
          setPlayingId(null);
        };
      }
    }
  };

  if (loading) return null;
  if (tracks.length === 0) return null;

  return (
    <section className="space-y-12 w-full">
      {/* Ostatnio stworzone - Marquee */}
      <div>
        <div className="flex justify-between items-end mb-4 px-2">
          <div>
            <h2 className="text-2xl font-extrabold headline-font tracking-tight">Ostatnio stworzone</h2>
            <p className="text-on-surface-variant text-sm font-body">Hity prosto z pieca AI</p>
          </div>
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
            className="flex gap-4 overflow-x-auto py-2 hide-scrollbar pb-4 -mx-2 px-2"
          >
            {[...tracks, ...tracks].map((track, i) => (
              <TrackCard 
                key={`${track.id}-${i}`} 
                track={track} 
                playingId={playingId} 
                handlePlay={handlePlay} 
                handleLike={handleLike} 
                isSignedIn={!!isSignedIn} 
                className="w-[85vw] sm:w-[350px] shrink-0"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Top 10 - Grid */}
      {topTracks.length > 0 && (
        <div className="px-2">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-2xl font-extrabold headline-font tracking-tight">Top 10 Hity</h2>
              <p className="text-on-surface-variant text-sm font-body">Najlepiej oceniane przez społeczność</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topTracks.map((track) => (
              <TrackCard 
                key={track.id} 
                track={track} 
                playingId={playingId} 
                handlePlay={handlePlay} 
                handleLike={handleLike} 
                isSignedIn={!!isSignedIn} 
                className="w-full"
              />
            ))}
          </div>
        </div>
      )}

      {/* Reviews Carousel */}
      <ReviewsCarousel />
    </section>
  );
}

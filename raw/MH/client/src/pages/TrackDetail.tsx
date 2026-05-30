import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Modal } from '../components/ui/Modal';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';


type Track = {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  cover_image_url: string | null;
  created_at: string;
  producer_id?: string;
  producers?: { id?: string, name: string };
  users?: { email: string, clerk_id: string };
  likes?: number;
  plays?: number;
  kie_task_id?: string;
  viral_protected?: boolean;
  audio_expires_at?: string;
  explicit?: boolean;
  variants?: Array<{ audio_url: string, stream_audio_url?: string, image_url?: string }>;
};

export function TrackDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const plyrRef = useRef<Plyr | null>(null);

  
  const [track, setTrack] = useState<Track | null>(null);
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  const [activeVariant, setActiveVariant] = useState<number>(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);

  // Helper to proxy audio CDN URLs through backend
  const proxyAudio = (url: string | null | undefined) => {
    if (!url) return '';
    if (url.includes('musicfile.kie.ai') || url.includes('tempfile.aiquickdraw.com')) {
      return '/api/proxy/audio?url=' + encodeURIComponent(url);
    }
    return url;
  };

  const currentCover = track?.variants && track.variants[activeVariant] && track.variants[activeVariant].image_url 
    ? track.variants[activeVariant].image_url 
    : track?.cover_image_url;

  const activeAudioUrl = track 
    ? proxyAudio(track.variants && track.variants.length > 0 
        ? (track.variants[activeVariant].audio_url || track.variants[activeVariant].stream_audio_url) 
        : track.audio_url)
    : '';

  
  // Explicit content warning — one click per session
  const EXPLICIT_KEY = 'mojhit_explicit_ok';
  const [explicitAcknowledged, setExplicitAcknowledged] = useState(() => sessionStorage.getItem(EXPLICIT_KEY) === 'true');
  const dismissExplicitWarning = () => {
    sessionStorage.setItem(EXPLICIT_KEY, 'true');
    setExplicitAcknowledged(true);
  };
  
  // Video generation
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [videoStatus, setVideoStatus] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoDbId, setVideoDbId] = useState<string | null>(null);

  // Modal state
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'error' | 'warning' | 'success';
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => {},
  });

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));
  
  const showModal = (config: Partial<typeof modalConfig>) => {
    setModalConfig(prev => ({
      ...prev,
      ...config,
      isOpen: true,
      onConfirm: () => {
        if (config.onConfirm) config.onConfirm();
        closeModal();
      },
      onCancel: config.onCancel ? () => {
        if (config.onCancel) config.onCancel();
        closeModal();
      } : undefined
    }));
  };

  // Swipe handling
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // the required distance between touchStart and touchEnd to be detected as a swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrev();
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/tracks/${id}`, { credentials: 'include' }).then(res => res.ok ? res.json() : null),
      fetch(`/api/tracks/my`, { credentials: 'include' }).then(res => res.ok ? res.json() : [])
    ])
    .then(([trackData, tracksData]) => {
      if (!trackData) throw new Error('Utwór nie został znaleziony');
      setTrack(trackData);
      setLikesCount(trackData.likes ?? 0);
      setAllTracks([...tracksData].sort((a: Track, b: Track) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      setActiveVariant(0);
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      setError(null);
      
      // Check if there's an existing completed video for this track
      // First, check if track already has video_url from the backend (after callback update)
      if ((trackData as any).video_url) {
        setVideoStatus('completed');
        setVideoUrl((trackData as any).video_url);
      } else if (trackData.kie_task_id) {
        fetch(`/api/video/check?audio_task_id=${trackData.kie_task_id}&variant_index=${trackData.variant_index ?? 0}`, { credentials: 'include' })
          .then(res => res.ok ? res.json() : null)
          .then(videoData => {
            if (videoData && videoData.status === 'completed' && videoData.video_url) {
              setVideoStatus('completed');
              setVideoUrl(videoData.video_url);
            }
          })
          .catch(() => {});
      }
    })
    .catch(err => {
      console.error(err);
      setError(err.message);
    })
    .finally(() => {
      setLoading(false);
    });
  }, [id]);
  
  // Re-check for existing video when variant changes
  useEffect(() => {
    if (!track?.kie_task_id) return;
    setVideoUrl(null);
    setVideoStatus(null);
    setVideoDbId(null);
    // Calculate the real variant_index: the track's own index when activeVariant is 0 (main), 
    // or lookup from variants array for alternatives
    const realVariantIndex = activeVariant === 0 
      ? ((track as any).variant_index ?? 0) 
      : ((track as any).variants?.[activeVariant - 1]?.variant_index ?? activeVariant);
    fetch(`/api/video/check?audio_task_id=${track.kie_task_id}&variant_index=${realVariantIndex}`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(videoData => {
        if (videoData && videoData.status === 'completed' && videoData.video_url) {
          setVideoStatus('completed');
          setVideoUrl(videoData.video_url);
        }
      })
      .catch(() => {});
  }, [activeVariant, track?.kie_task_id]);

  useEffect(() => {
    if (audioRef.current && track) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      }
    }
  }, [activeVariant, track]);

  const currentIndex = allTracks.findIndex(t => t.id === id);
  const prevTrack = currentIndex > 0 ? allTracks[currentIndex - 1] : null;
  const nextTrack = currentIndex !== -1 && currentIndex < allTracks.length - 1 ? allTracks[currentIndex + 1] : null;

  const goToPrev = () => {
    if (prevTrack) navigate(`/track/${prevTrack.id}`);
  };

  const goToNext = () => {
    if (isShuffle && allTracks.length > 1) {
      // Pick random track that is not the current one
      const availableTracks = allTracks.filter(t => t.id !== id);
      const randomTrack = availableTracks[Math.floor(Math.random() * availableTracks.length)];
      if (randomTrack) navigate(`/track/${randomTrack.id}`);
    } else if (nextTrack) {
      navigate(`/track/${nextTrack.id}`);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play().catch(console.error);
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const bounds = e.currentTarget.getBoundingClientRect();
      let percent = (e.clientX - bounds.left) / bounds.width;
      percent = Math.max(0, Math.min(1, percent));
      audioRef.current.currentTime = percent * audioRef.current.duration;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    if (!track) return;
    fetch(`/api/tracks/${track.id}/like`, { method: 'POST', credentials: 'include' }).catch(console.error);
  };

  const handleShare = () => {
    if (!track) return;
    if (navigator.share) {
      navigator.share({
        title: track.title,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      showModal({
        title: 'Sukces!',
        message: 'Link został pomyślnie skopiowany do schowka.',
        type: 'success',
        confirmText: 'OK',
        onConfirm: closeModal
      });
    }
  };

  const handleDownload = async () => {
    if (!track) return;
    
    // If video is generated and active, download the video instead of MP3!
    if (videoUrl) {
      window.open(videoUrl, '_blank');
      return;
    }
    
    const rawUrl = track.variants && track.variants.length > 0 
      ? (track.variants[activeVariant].audio_url || track.variants[activeVariant].stream_audio_url) 
      : track.audio_url;
      
    if (!rawUrl) return;
    
    try {
      // Use our backend proxy to completely avoid CORS blocks
      const downloadUrl = proxyAudio(rawUrl);
      
      const res = await fetch(downloadUrl);
      if (!res.ok) throw new Error('Network response was not ok');
      
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = blobUrl;
      const variantSuffix = track.variants && track.variants.length > 1 ? `_v${activeVariant + 1}` : '';
      a.download = `${track.title || 'track'}${variantSuffix}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Blob download failed, falling back to window.location', err);
      // Fallback
      window.location.href = `/api/tracks/${track.id}/download?variant=${activeVariant}`;
    }
  };

  // Video generation
  const handleGenerateVideo = async () => {
    if (!track?.kie_task_id) return;
    setGeneratingVideo(true);
    setVideoError(null);
    setVideoStatus('pending');
    setVideoUrl(null);

    try {
      const res = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ audioTaskId: track.kie_task_id, variantIndex: (track as any).variant_index ?? activeVariant })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Błąd generowania wideo');
      
      if (data.existing && data.video_url) {
        // Video already exists, show it immediately
        setVideoStatus('completed');
        setVideoUrl(data.video_url);
        setGeneratingVideo(false);
      } else {
        setVideoDbId(data.dbId);
      }
      console.log('[VIDEO] Generation result:', data);
    } catch (e: any) {
      setVideoError(e.message);
      setVideoStatus('failed');
      setGeneratingVideo(false);
    }
  };

  // Poll video status
  useEffect(() => {
    if (!videoDbId) return;
    if (videoStatus !== 'pending' && videoStatus !== 'processing') return;
    
    const poll = async () => {
      try {
        const statusRes = await fetch(`/api/video/status/${videoDbId}`, {
          credentials: 'include'
        });
        if (!statusRes.ok) return;
        const statusData = await statusRes.json();
        console.log('[VIDEO] Status poll:', statusData);
        
        if (statusData.status === 'completed') {
          setVideoStatus('completed');
          setVideoUrl(statusData.video_url);
          setGeneratingVideo(false);
        } else if (statusData.status === 'failed') {
          setVideoStatus('failed');
          setVideoError(statusData.error_message || 'Generowanie wideo nie powiodło się');
          setGeneratingVideo(false);
        } else {
          setVideoStatus(statusData.status || 'processing');
        }
      } catch (e) {
        console.error('[VIDEO] Poll error:', e);
      }
    };
    
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [videoStatus, videoDbId]);

  // Keep navigation callbacks updated for Plyr
  const goToNextRef = useRef(goToNext);
  useEffect(() => {
    goToNextRef.current = goToNext;
  }, [goToNext]);

  // Initialize Plyr video player
  useEffect(() => {
    let player: Plyr | null = null;
    const wrapper = videoWrapperRef.current;

    if (videoUrl && wrapper) {
      // Clear any previous elements in the wrapper to be 100% clean
      wrapper.innerHTML = '';

      // Create a fresh HTML5 video element dynamically
      const videoEl = document.createElement('video');
      videoEl.src = videoUrl;
      videoEl.autoplay = true;
      videoEl.playsInline = true;
      videoEl.className = "w-full h-full object-cover bg-black";
      if (currentCover) {
        videoEl.poster = currentCover;
      }

      // Append it to the wrapper
      wrapper.appendChild(videoEl);

      try {
        player = new Plyr(videoEl, {
          controls: [
            'play-large',   // Large play button in center
            'play',         // Play/pause on bottom bar
            'progress',     // Progress bar
            'current-time', // Current time indicator
            'mute',         // Toggle mute
            'volume',       // Volume control
            'fullscreen'    // Toggle fullscreen
          ],
          ratio: '1:1',
          tooltips: { controls: true, seek: true }
        });

        plyrRef.current = player;

        // Listen for ending event to play next track automatically
        player.on('ended', () => {
          console.log('[PLYR] Video ended, playing next track');
          goToNextRef.current();
        });
      } catch (err) {
        console.error('[PLYR] Failed to initialize Plyr:', err);
      }
    }

    return () => {
      try {
        if (player) {
          player.destroy();
        }
      } catch (err) {
        console.error('[PLYR] Failed to destroy Plyr:', err);
      }
      if (plyrRef.current === player) {
        plyrRef.current = null;
      }
      if (wrapper) {
        wrapper.innerHTML = '';
      }
    };
  }, [videoUrl, currentCover]);


  if (loading) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-80px)] md:min-h-screen max-w-lg mx-auto bg-surface p-6 animate-pulse">
        <div className="flex items-center justify-between mb-8">
          <div className="w-10 h-10 bg-surface-container-high rounded-full"></div>
          <div className="w-32 h-4 bg-surface-container-high rounded-full"></div>
          <div className="w-10 h-10 bg-surface-container-high rounded-full"></div>
        </div>
        <div className="w-full aspect-square bg-surface-container-high rounded-3xl mb-8"></div>
        <div className="flex justify-between items-center mb-6 px-2">
          <div className="flex flex-col gap-3 w-2/3">
            <div className="h-8 bg-surface-container-high rounded-lg w-full"></div>
            <div className="h-4 bg-surface-container-high rounded-lg w-2/3"></div>
          </div>
          <div className="w-10 h-10 bg-surface-container-high rounded-full"></div>
        </div>
        <div className="px-2 mb-8">
          <div className="w-full h-1.5 bg-surface-container-high rounded-full mb-2"></div>
          <div className="flex justify-between">
            <div className="w-8 h-3 bg-surface-container-high rounded"></div>
            <div className="w-8 h-3 bg-surface-container-high rounded"></div>
          </div>
        </div>
        <div className="flex justify-between items-center px-2 mb-12">
          <div className="w-8 h-8 bg-surface-container-high rounded-full"></div>
          <div className="flex gap-6 items-center">
            <div className="w-10 h-10 bg-surface-container-high rounded-full"></div>
            <div className="w-16 h-16 bg-surface-container-high rounded-full"></div>
            <div className="w-10 h-10 bg-surface-container-high rounded-full"></div>
          </div>
          <div className="w-8 h-8 bg-surface-container-high rounded-full"></div>
        </div>
        <div className="flex-1 bg-surface-container-high rounded-3xl opacity-50"></div>
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[80vh] px-4 text-center">
        <span className="material-symbols-outlined text-6xl text-error mb-4">error</span>
        <h2 className="text-2xl font-bold headline-font mb-2">Ups, coś poszło nie tak</h2>
        <p className="text-on-surface-variant mb-6">{error || "Utwór nie został znaleziony."}</p>
        <Link to="/my-tracks" className="px-6 py-3 bg-primary text-on-primary font-bold rounded-full hover:bg-primary-dark transition-colors">Wróć do biblioteki</Link>
      </div>
    );
  }



  // SEO: Generate meta tags
  const seoTitle = `${track.title} - ${track.producers?.name || 'AI Hit'} | mojhit.pl`;
  const seoDesc = track.description 
    ? track.description.substring(0, 160) + (track.description.length > 160 ? '...' : '')
    : `Posłuchaj utworu "${track.title}" wygenerowanego przez AI. Stworzony przez ${track.producers?.name || 'mojhit.pl'} - najlepszy darmowy generator muzyki AI w Polsce.`;
  const seoImage = currentCover || '/og-default.png';
  const seoUrl = `${window.location.origin}/track/${track.id}`;
  const schemaJsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicRecording",
    "name": track.title,
    "byArtist": {
      "@type": "MusicGroup",
      "name": track.producers?.name || "AI Artist"
    },
    "dateCreated": track.created_at,
    "description": track.description || "",
    "image": currentCover,
    "audio": activeAudioUrl,
    "genre": "AI Music",
    "inLanguage": "pl",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": 4.5,
      "ratingCount": likesCount || 1,
      "bestRating": 5,
      "worstRating": 1
    },
    "interactionStatistic": [
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/LikeAction",
        "userInteractionCount": likesCount || 0
      }
    ]
  };

  // Clean lyrics - remove structural markers and vocal instructions
  const cleanLyrics = (text: string) => {
    return text
      .split('\n')
      .map(line => {
        // Remove structural markers: [Intro], [Verse], [Chorus], etc.
        line = line.replace(/^\[?(Intro|Verse \d+|Pre-Chorus|Chorus|Bridge|Outro|Build-Up|Drop( \/ Chorus)?|Hook( \/ Chorus)?|Guitar Solo|Saxophone Solo)\]?\s*[-—]?\s*/gi, '');
        // Remove vocal instructions in parentheses
        line = line.replace(/\(.*?(Vocal|Duet|Razem|Julia|Bartek|Nika|Riri|VENA|lead|backing|chór|gang|ad-lib).*?\)/gi, '');
        // Remove instrumental descriptions after em dash
        line = line.replace(/\s*[—–-]\s*(Głębokie|Ciche|Energetyczne|Saw|Gitara|Akusty|Pumping|Delikatn|Orkiestr|Tribal|Ambient|Synth|Bass|Beat|Flet|Fortepian|Piano|Szept|Oddech|Budowanie|Wybrzmienie|Eksplozja|Drop|Riser|Klawisz).*$/gi, '');
        return line.trim();
      })
      .filter(line => line.length > 0)
      .join('\n');
  };

  // Parsing lyrics
  let parsedDesc = track.description || "";
  let occasion = "";
  let voice = "";

  const lines = parsedDesc.split('\n');
  if (lines[0] && lines[0].includes('Okazja:')) {
    const parts = lines[0].split(', ');
    occasion = parts[0]?.replace('Okazja: ', '') || '';
    voice = parts[1]?.replace('Głos: ', '') || '';
    parsedDesc = lines.slice(1).join('\n').replace(/^Opis:\s*/, '').trim();
  }

  // Apply lyrics cleaning
  parsedDesc = cleanLyrics(parsedDesc);

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <meta name="keywords" content={`muzyka AI, ${track.title}, ${track.producers?.name || 'AI'}, hit AI, generator muzyki, polska muzyka AI`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:image" content={seoImage} />
        <meta property="og:url" content={seoUrl} />
        <meta property="og:type" content="music.song" />
        <meta property="og:site_name" content="mojhit.pl" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDesc} />
        <meta name="twitter:image" content={seoImage} />
        
        {/* Canonical */}
        <link rel="canonical" href={seoUrl} />
        
        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify(schemaJsonLd)}
        </script>
      </Helmet>

      <div 
      className="flex flex-col min-h-[calc(100vh-80px)] md:min-h-screen max-w-lg mx-auto bg-surface relative pb-24 md:pb-6 overflow-x-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between p-6">
        <Link to="/my-tracks" className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-variant transition-colors text-on-surface">
          <span className="material-symbols-outlined">expand_more</span>
        </Link>
        <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">Teraz Odtwarzane</span>
        <button onClick={handleShare} className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-variant transition-colors text-on-surface" title="Udostępnij">
          <span className="material-symbols-outlined text-[20px]">ios_share</span>
        </button>
      </div>

      {/* Visual Content: Video or Album Art */}
      <div className="px-6 w-full mb-8 flex justify-center">
        {videoUrl ? (
          <div className="w-full rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-surface-container-high aspect-square">
            <div ref={videoWrapperRef} className="w-full h-full" />
          </div>
        ) : (
          <div className="w-full aspect-square rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-surface-container-high relative group">
            {currentCover ? (
              <img src={currentCover} alt={track.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-tertiary/20">
                <span className="material-symbols-outlined text-8xl text-on-surface/20">music_note</span>
              </div>
            )}
            
            {/* Video Generation Status Overlay */}
            {(generatingVideo || videoStatus === 'pending' || videoStatus === 'processing') && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-md z-10 transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent animate-pulse"></div>
                <div className="relative flex flex-col items-center justify-center">
                  <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 border-4 border-primary/30 rounded-full animate-ping"></div>
                    <div className="absolute inset-2 border-4 border-primary/50 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                    <div className="absolute inset-4 border-4 border-primary rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                    <span className="absolute inset-0 flex items-center justify-center material-symbols-outlined text-3xl text-white">movie</span>
                  </div>
                  <h3 className="text-white font-black text-xl tracking-wider mb-2 animate-pulse">Montujemy teledysk</h3>
                  <div className="flex gap-1.5 mb-3">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <p className="text-white/70 text-sm font-medium tracking-wide">To magia, daj nam około minuty...</p>
                </div>
              </div>
            )}
            
            {/* Show "Generate Video" button on cover if not generating and no video URL yet, and no auto-trigger happened */}
            {!videoUrl && videoStatus !== 'pending' && videoStatus !== 'processing' && !generatingVideo && track.kie_task_id && (
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm z-10">
                 <button 
                   onClick={handleGenerateVideo}
                   className="bg-primary text-on-primary font-bold px-6 py-3 rounded-full shadow-lg flex items-center gap-2 hover:scale-105 transition-transform"
                 >
                   <span className="material-symbols-outlined">movie</span>
                   Stwórz Wideo
                 </button>
               </div>
            )}
          </div>
        )}
      </div>

      {/* Explicit Content Warning */}
      {track.explicit && !explicitAcknowledged && (
        <div className="mx-6 mb-4 bg-red-500/10 border border-red-500/30 rounded-2xl p-6 animate-in fade-in zoom-in">
          <div className="flex flex-col items-center text-center gap-3">
            <span className="text-4xl">🔞</span>
            <h3 className="text-lg font-black headline-font text-red-400">Ten utwór zawiera wulgaryzmy</h3>
            <p className="text-sm text-on-surface-variant">Tekst przeznaczony dla dorosłych odbiorców. Kliknij poniżej, aby odsłuchać.</p>
            <button onClick={dismissExplicitWarning} className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-red-500/20">Rozumiem, pokaż</button>
          </div>
        </div>
      )}

      {/* Track Info & Like */}
      <div className="px-8 flex items-center justify-between mb-6">
        <div className="flex flex-col overflow-hidden pr-4">
          <h1 className="text-2xl md:text-3xl font-black headline-font tracking-tight truncate">{track.title}</h1>
          <p className="text-on-surface-variant font-medium text-sm md:text-base mt-1 flex flex-wrap items-center gap-2">
            {track.producers?.id ? (
              <Link 
                to={`/?agent=${track.producers.id}`}
                className="hover:text-primary transition-colors"
              >
                {track.producers.name}
              </Link>
            ) : (
              <span>{track.producers?.name || 'Wykonawca AI'}</span>
            )}
            {track.users?.email && (
              <span className="text-on-surface-variant/60 text-xs"> • {track.users.email.split('@')[0]}</span>
            )}
            {track.explicit && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30" title="Treści dla dorosłych">
                E
              </span>
            )}
            {track.viral_protected && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30" title="Chroniony — viral lub PRO">
                <span className="material-symbols-outlined text-[12px]">shield_lock</span>
                CHRONIONY
              </span>
            )}
            {track.audio_expires_at && !track.viral_protected && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-container-high text-on-surface-variant" title={`Dostępny do ${new Date(track.audio_expires_at).toLocaleDateString('pl-PL')}`}>
                <span className="material-symbols-outlined text-[12px]">schedule</span>
                {Math.max(0, Math.ceil((new Date(track.audio_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} dni
              </span>
            )}
            {(occasion || voice) && (
               <span className="opacity-50 text-[10px] uppercase"> • {voice || occasion}</span>
            )}
          </p>
        </div>
        <button 
          onClick={handleLike} 
          className="flex flex-col items-center justify-center group flex-shrink-0"
        >
          <span className={`material-symbols-outlined text-3xl transition-all ${isLiked ? 'text-error scale-110 drop-shadow-[0_0_8px_rgba(255,84,73,0.5)]' : 'text-on-surface-variant group-hover:text-on-surface'}`} style={isLiked ? {fontVariationSettings: "'FILL' 1"} : {}}>
            favorite
          </span>
          <span className={`text-[10px] font-bold mt-1 ${isLiked ? 'text-error' : 'text-on-surface-variant'}`}>{likesCount}</span>
        </button>
      </div>

      {/* Variants (if any) */}
      {track.variants && track.variants.length > 1 && (
        <div className="px-8 mb-4 flex gap-2 overflow-x-auto hide-scrollbar">
          {track.variants.map((_, i) => (
            <button 
              key={i}
              onClick={() => { setActiveVariant(i); setIsPlaying(true); }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${activeVariant === i ? 'bg-on-surface text-surface border-on-surface' : 'bg-transparent text-on-surface-variant border-outline-variant/30 hover:border-on-surface/50'}`}
            >
              Wersja {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Progress Bar (Hide if video is playing since video has controls) */}
      {!videoUrl && (
        <div className="px-8 mb-6">
        <div 
          className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden cursor-pointer relative group" 
          onClick={handleSeek}
        >
          <div className="bg-on-surface h-full transition-all duration-100 ease-linear relative" style={{ width: `${progress}%` }}>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-on-surface rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"></div>
          </div>
        </div>
        <div className="flex justify-between text-[11px] text-on-surface-variant font-medium mt-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      )}

      {/* Playback Controls */}
      <div className="px-8 flex items-center justify-between mb-8">
        {!videoUrl ? (
          <button 
            onClick={() => setIsShuffle(!isShuffle)} 
            className={`transition-colors ${isShuffle ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`} 
            title="Losowe odtwarzanie"
          >
            <span className="material-symbols-outlined text-[22px]">shuffle</span>
          </button>
        ) : <div className="w-[22px]"></div>}
        
        <div className="flex items-center gap-6">
          <button 
            onClick={goToPrev} 
            disabled={!prevTrack}
            className={`text-on-surface transition-colors ${!prevTrack ? 'opacity-30 cursor-not-allowed' : 'hover:text-primary active:scale-95'}`}
          >
            <span className="material-symbols-outlined text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>skip_previous</span>
          </button>
          
          {!videoUrl && (
            <button 
              onClick={togglePlay} 
              className="w-16 h-16 bg-on-surface text-surface rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              <span className="material-symbols-outlined text-4xl ml-1" style={{fontVariationSettings: "'FILL' 1"}}>
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>
          )}
          
          <button 
            onClick={goToNext} 
            disabled={!nextTrack && !isShuffle}
            className={`text-on-surface transition-colors ${(!nextTrack && !isShuffle) ? 'opacity-30 cursor-not-allowed' : 'hover:text-primary active:scale-95'}`}
          >
            <span className="material-symbols-outlined text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>skip_next</span>
          </button>
        </div>
        
        <button onClick={handleDownload} className="text-on-surface-variant hover:text-on-surface transition-colors">
          <span className="material-symbols-outlined text-[22px]">download</span>
        </button>
      </div>

      {/* Video Generation Error */}
      {videoError && !videoUrl && (
        <div className="px-6 mb-8 text-center">
          <p className="text-error text-xs flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[14px]">error</span>
            {videoError}
          </p>
        </div>
      )}

      {/* Lyrics Section */}
      <div className="px-6 pb-12 flex-1 flex flex-col">
        <div className="bg-primary/5 rounded-3xl p-6 md:p-8 flex-1 border border-primary/10">
           <h3 className="text-lg font-bold headline-font mb-4 flex items-center gap-2">
             <span className="material-symbols-outlined text-primary">lyrics</span>
             Historia / Tekst
           </h3>
           <p className="font-body text-on-surface whitespace-pre-wrap leading-relaxed text-sm md:text-base opacity-90">
             {parsedDesc || "Brak opisu lub tekstu dla tego utworu. Ten utwór to czysta instrumentalna magia lub twórca nie dodał jeszcze tekstu."}
           </p>
        </div>
      </div>

      {/* Audio Element */}
      {activeAudioUrl && !videoUrl && (
        <audio 
          ref={audioRef} 
          src={activeAudioUrl} 
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => {
            if (nextTrack) goToNext();
            else setIsPlaying(false);
          }}
          className="hidden" 
        />
      )}
      
      <Modal {...modalConfig} />
    </div>
    </>
  );
}

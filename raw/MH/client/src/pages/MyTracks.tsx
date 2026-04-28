import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from './ui/Modal';

type Track = {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  cover_image_url: string | null;
  created_at: string;
  producer_id?: string;
  producers?: { name: string };
};

export function MyTracks() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetch('/api/tracks/my', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Błąd pobierania utworów');
        return res.json();
      })
      .then(data => {
        setTracks(data);
        setError(null);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[40vh]">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary text-center">cycle</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-error/10 text-error rounded-2xl border border-error/20 text-center">
        <p className="font-bold headline-font">{error}</p>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="p-12 bg-surface-container rounded-3xl border border-outline-variant/20 flex flex-col items-center text-center space-y-4 shadow-sm min-h-[40vh] justify-center">
        <span className="material-symbols-outlined text-6xl text-on-surface-variant/40">queue_music</span>
        <h2 className="text-2xl font-bold headline-font">Brak utworów</h2>
        <p className="text-on-surface-variant font-body">Nie wygenerowałeś jeszcze żadnego hitu.</p>
        <Link to="/" className="mt-4 px-8 py-4 bg-primary text-on-primary font-bold rounded-full hover:bg-primary/80 active:scale-95 transition-all text-sm uppercase tracking-wider inline-block shadow-lg">
          Stwórz swój pierwszy hit!
        </Link>
      </div>
    );
  }

  const handleDownload = (e: React.MouseEvent, trackId: string) => {
    e.preventDefault();
    window.open(`/api/tracks/${trackId}/download`, '_blank');
  };

  const handleLike = (e: React.MouseEvent, trackId: string) => {
    e.preventDefault();
    fetch(`/api/tracks/${trackId}/like`, { method: 'POST', credentials: 'include' })
      .then(r => r.json())
      .then(data => console.log('Liked!', data))
      .catch(console.error);
  };

  const handleShare = (e: React.MouseEvent, track: Track) => {
    e.preventDefault();
    if (navigator.share) {
      navigator.share({
        title: track.title,
        url: `${window.location.origin}/track/${track.id}`
      }).catch(console.error);
    } else {
      fetch(`/api/tracks/${track.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ platform: 'copy_link' })
      }).then(r => r.json())
        .then(data => {
          navigator.clipboard.writeText(data.url || `${window.location.origin}/track/${track.id}`);
          showModal({
            title: 'Sukces!',
            message: 'Link został pomyślnie skopiowany do schowka.',
            type: 'success',
            confirmText: 'OK',
            onConfirm: closeModal
          });
        }).catch(console.error);
    }
  };

  const handleDelete = async (e: React.MouseEvent, trackId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    showModal({
      title: 'Usuń utwór',
      message: 'Czy na pewno chcesz usunąć ten utwór? Tej akcji nie można cofnąć.',
      type: 'warning',
      confirmText: 'Usuń',
      cancelText: 'Anuluj',
      onCancel: closeModal,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/tracks/${trackId}/delete`, {
            method: 'POST',
            credentials: 'include',
          });
          if (res.ok) {
            setTracks(prev => prev.filter(t => t.id !== trackId));
          } else {
            const err = await res.json();
            showModal({
              title: 'Błąd usuwania',
              message: err.error || 'Wystąpił problem podczas usuwania utworu.',
              type: 'error',
              confirmText: 'OK',
              onConfirm: closeModal
            });
          }
        } catch (err) {
          console.error('Delete error:', err);
          showModal({
            title: 'Błąd',
            message: 'Nie udało się połączyć z serwerem. Spróbuj ponownie później.',
            type: 'error',
            confirmText: 'OK',
            onConfirm: closeModal
          });
        }
      }
    });
  };

  const getStyle = (desc: string) => {
    if (!desc) return 'Custom';
    const lines = desc.split('\n');
    if (lines[0].includes('Okazja:')) {
       return lines[0].replace('Okazja: ', '').substring(0, 15);
    }
    return lines[0].substring(0, 15) + (lines[0].length > 15 ? '...' : '');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-bold headline-font tracking-tight">Moje utwory</h2>
          <p className="text-on-surface-variant text-sm font-body mt-1">Lista Twoich wygenerowanych hitów</p>
        </div>
      </div>
      
      {/* Banner informacyjny polityki przechowywania */}
      <div className="bg-primary/5 border border-primary/20 text-on-surface p-5 rounded-2xl mb-8 flex items-start gap-4">
        <span className="material-symbols-outlined text-primary mt-0.5">info</span>
        <p className="text-sm">
          <strong>Polityka przechowywania plików:</strong> Wygenerowane utwory są przechowywane przez 14 dni. Po tym czasie pliki audio oraz ich metadane zostaną trwale usunięte z systemu. Zalecamy pobranie ważnych utworów przed upływem tego terminu.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tracks.map((track: Track) => {
          const style = getStyle(track.description);
          const dateStr = new Date(track.created_at).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
          const isVideoPending = track.video_status === 'pending' || track.video_status === 'processing';
          const imageUrl = track.video_thumbnail_url || track.cover_image_url;

          return (
            <Link key={track.id} to={`/track/${track.id}`} className="bg-surface-container-low p-4 rounded-xl flex items-center gap-4 group hover:bg-surface-container-high transition-colors cursor-pointer border border-outline-variant/10 hover:border-primary/30 relative overflow-hidden">
              <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden shadow-lg bg-gradient-to-br from-surface-container-high to-surface-container-highest flex items-center justify-center">
                {imageUrl ? (
                  <img src={imageUrl} alt={track.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-3xl text-primary/60">music_note</span>
                )}
                
                {isVideoPending ? (
                  <div className={`absolute inset-0 bg-black/60 flex items-center justify-center`}>
                    <span className="material-symbols-outlined text-white animate-spin">progress_activity</span>
                  </div>
                ) : (
                  <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100`}>
                    <span className={`material-symbols-outlined text-3xl text-white`}>
                      play_circle
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-grow min-w-0">
                <h3 className={`font-bold truncate headline-font leading-tight`}>
                  {track.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-primary/10 text-primary text-[9px] px-2 py-0.5 rounded font-bold uppercase font-label truncate max-w-[120px]">
                    {style}
                  </span>
                  {track.producers?.name && (
                    <span className="bg-tertiary/10 text-tertiary text-[9px] px-2 py-0.5 rounded font-bold uppercase font-label truncate max-w-[120px]">
                      {track.producers.name}
                    </span>
                  )}
                  <span className="text-on-surface-variant text-[11px] font-medium font-body border-l border-outline-variant/20 pl-2">
                    {dateStr}
                  </span>
                  <span className="text-on-surface-variant text-[11px] font-medium font-body border-l border-outline-variant/20 pl-2 hidden sm:inline">
                    2:45
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={(e) => handleDownload(e, track.id)}
                  className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors hover:scale-110 active:scale-90"
                  title="Pobierz MP3"
                >
                  download
                </button>
                <button 
                  onClick={(e) => handleLike(e, track.id)}
                  className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors hover:scale-110 active:scale-90"
                  title="Polub"
                >
                  favorite
                </button>
                <button 
                  onClick={(e) => handleShare(e, track)}
                  className="material-symbols-outlined text-on-surface-variant hover:text-white transition-colors hover:scale-110 active:scale-90"
                  title="Udostępnij"
                >
                  share
                </button>
                <button 
                  onClick={(e) => handleDelete(e, track.id)}
                  className="material-symbols-outlined text-error/70 hover:text-error transition-colors hover:scale-110 active:scale-90"
                  title="Usuń utwór"
                >
                  delete
                </button>
              </div>
            </Link>
          );
        })}
      </div>
      
      <Modal {...modalConfig} />
    </div>
  );
}

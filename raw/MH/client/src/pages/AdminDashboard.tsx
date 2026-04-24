import { useState, useEffect, useRef } from 'react';
import { useUser, RedirectToSignIn } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { ProducerManager } from '../components/admin/ProducerManager';
import ApiSettingsManager from '../components/admin/ApiSettingsManager';
import SiteSettingsManager from '../components/admin/SiteSettingsManager';
import { SupportAgentManager } from '../components/admin/SupportAgentManager';
import { AffiliateManager } from '../components/admin/AffiliateManager';
import { SystemLogsManager } from '../components/admin/SystemLogsManager';


const ADMIN_ID = 'user_3BiIa5lj5AiMLDvGL2OqjEDbqLh';

export function AdminDashboard() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'producers' | 'tracks' | 'roles' | 'settings' | 'support' | 'affiliates' | 'logs' | 'siteSettings'>('dashboard');
  const [stats, setStats] = useState<{ totalTracks: number; totalUsers: number; revenuePLN: number; headerCounterManualEnabled?: boolean; headerCounterManualValue?: number } | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Custom Prompt Dialog State
  const [promptDialog, setPromptDialog] = useState<{
    isOpen: boolean;
    title: string;
    value: string;
    inputType: 'text' | 'number';
    onSubmit: (val: string | null) => void;
  }>({ isOpen: false, title: '', value: '', inputType: 'text', onSubmit: () => {} });



  // Users management state
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [usersPagination, setUsersPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [systemEconomy, setSystemEconomy] = useState<{ totalCoins: number; totalNotes: number; totalUsers: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Tracks moderation state
  const [tracks, setTracks] = useState<any[]>([]);
  const [tracksLoading, setTracksLoading] = useState(false);
  const [tracksError, setTracksError] = useState<string | null>(null);
  const [tracksPagination, setTracksPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [tracksSystemStats, setTracksSystemStats] = useState<{ totalLikes: number; totalPlays: number; totalTracks: number } | null>(null);
  const [tracksSearchTerm, setTracksSearchTerm] = useState('');
  const [tracksExpiredFilter, setTracksExpiredFilter] = useState('all'); // 'all', 'true', 'false'

  // Audio player for tracks
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // RBAC Roles & Permissions state
  const [roles, setRoles] = useState<any[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [userAssignments, setUserAssignments] = useState<any[]>([]);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<any | null>(null);
  const [roleForm, setRoleForm] = useState({ name: '', description: '', permissionCodes: [] as string[] });
  const [roleSaving, setRoleSaving] = useState(false);
  const [roleDeleteConfirm, setRoleDeleteConfirm] = useState<string | null>(null);
  const [userRoleModal, setUserRoleModal] = useState<{ userId: string; email: string } | null>(null);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [userRolesLoading, setUserRolesLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'dashboard' && isSignedIn && user.id === ADMIN_ID) {
      setStatsLoading(true);
      fetch('/api/admin/stats', { credentials: 'include' })
        .then(res => {
          if (!res.ok) throw new Error('Błąd pobierania statystyk');
          return res.json();
        })
        .then(data => {
          setStats(data);
          setStatsLoading(false);
        })
        .catch(err => {
          console.error('Stats fetch error:', err);
          setStatsLoading(false);
        });
    }
  }, [activeTab, isSignedIn, user?.id]);

  const handleHeaderCounterUpdate = async (enabled: boolean, value: number) => {
    try {
      const res = await fetch('/api/admin/settings/site', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          header_counter_manual_enabled: enabled,
          header_counter_manual_value: value
        })
      });
      if (!res.ok) throw new Error('Błąd aktualizacji licznika');
      setStats(prev => prev ? {
        ...prev,
        headerCounterManualEnabled: enabled,
        headerCounterManualValue: value
      } : null);
    } catch (err) {
      console.error(err);
      alert('Nie udało się zapisać ustawień licznika.');
    }
  };

  useEffect(() => {
    if (activeTab === 'users' && isSignedIn && user.id === ADMIN_ID) {
      fetchUsers();
    }
  }, [activeTab, isSignedIn, user?.id]);

  useEffect(() => {
    if (activeTab === 'tracks' && isSignedIn && user.id === ADMIN_ID) {
      fetchTracks();
    }
  }, [activeTab, isSignedIn, user?.id]);

  useEffect(() => {
    if (activeTab === 'roles' && isSignedIn && user.id === ADMIN_ID) {
      fetchRoles();
      fetchPermissions();
    }
  }, [activeTab, isSignedIn, user?.id]);

  const fetchUsers = (page = 1, search = '') => {
    setUsersLoading(true);
    setUsersError(null);

    const params = new URLSearchParams({
      page: page.toString(),
      limit: '20',
      ...(search && { search })
    });

    fetch(`/api/admin/users?${params}`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Błąd pobierania użytkowników');
        return res.json();
      })
      .then(data => {
        setUsers(data.users);
        setUsersPagination(data.pagination);
        setSystemEconomy(data.systemEconomy);
        setUsersLoading(false);
      })
      .catch(err => {
        console.error('Users fetch error:', err);
        setUsersError(err.message);
        setUsersLoading(false);
      });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1, searchTerm);
  };

  const handlePageChange = (newPage: number) => {
    fetchUsers(newPage, searchTerm);
  };

  const handleUserUpdate = (userId: string, updates: any) => {
    fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updates)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Refresh users list
          fetchUsers(usersPagination.page, searchTerm);
        }
      })
      .catch(console.error);
  };

  const fetchTracks = (page = 1, search = '', expired = 'all') => {
    setTracksLoading(true);
    setTracksError(null);

    const params = new URLSearchParams({
      page: page.toString(),
      limit: '20',
      ...(search && { search }),
      ...(expired !== 'all' && { expired })
    });

    fetch(`/api/admin/tracks?${params}`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Błąd pobierania tracków');
        return res.json();
      })
      .then(data => {
        setTracks(data.tracks);
        setTracksPagination(data.pagination);
        setTracksSystemStats(data.systemStats);
        setTracksLoading(false);
      })
      .catch(err => {
        console.error('Tracks fetch error:', err);
        setTracksError(err.message);
        setTracksLoading(false);
      });
  };

  const handleTracksSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracks(1, tracksSearchTerm, tracksExpiredFilter);
  };

  const handleTracksPageChange = (newPage: number) => {
    fetchTracks(newPage, tracksSearchTerm, tracksExpiredFilter);
  };

  const handleTrackModerate = (trackId: string, updates: any) => {
    fetch(`/api/admin/tracks/${trackId}/moderate`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updates)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Refresh tracks list
          fetchTracks(tracksPagination.page, tracksSearchTerm, tracksExpiredFilter);
        }
      })
      .catch(console.error);
  };

  // Format time for progress display
  const formatTime = (seconds: number) => {
    if (!seconds || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Play track in admin panel
  const handlePlayTrack = (trackId: string, audioUrl: string) => {
    if (playingTrackId === trackId && audioRef.current) {
      if (!audioRef.current.paused) {
        audioRef.current.pause();
        setPlayingTrackId(null);
      } else {
        audioRef.current.play();
        setPlayingTrackId(trackId);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.play();
      setPlayingTrackId(trackId);
      setCurrentTime(0);
      setDuration(audio.duration || 0);
      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
      };
      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
      };
      audio.onended = () => {
        setPlayingTrackId(null);
        setCurrentTime(0);
        audioRef.current = null;
      };
      audio.onerror = () => {
        setPlayingTrackId(null);
        setCurrentTime(0);
        audioRef.current = null;
      };
    }
  };

  // Fetch roles with their permissions
  const fetchRoles = () => {
    setRolesLoading(true);
    setRolesError(null);

    fetch('/api/admin/roles', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Błąd pobierania ról');
        return res.json();
      })
      .then(data => {
        console.log('Roles data:', data);
        setRoles(data.roles || []);
        setRolesLoading(false);
      })
      .catch(err => {
        console.error('Roles fetch error:', err);
        setRolesError(err.message);
        setRolesLoading(false);
      });
  };

  // Fetch all permissions
  const fetchPermissions = () => {
    fetch('/api/admin/permissions', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Błąd pobierania uprawnień');
        return res.json();
      })
      .then(data => {
        console.log('Permissions data:', data);
        setPermissions(data.permissions || []);
      })
      .catch(err => {
        console.error('Permissions fetch error:', err);
      });
  };

  // Fetch user roles when opening role assignment modal
  useEffect(() => {
    if (userRoleModal) {
      setUserRolesLoading(true);
      fetch(`/api/admin/users/${userRoleModal.userId}/roles`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          setUserRoles(data.roles || []);
          setUserRolesLoading(false);
        })
        .catch(err => {
          console.error('User roles fetch error:', err);
          setUserRolesLoading(false);
        });
    }
  }, [userRoleModal]);

  // Open create role modal
  const handleCreateRole = () => {
    setEditingRole(null);
    setRoleForm({ name: '', description: '', permissionCodes: [] });
    setShowRoleModal(true);
  };

  // Open edit role modal
  const handleEditRole = (role: any) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      description: role.description || '',
      permissionCodes: role.permissions?.map((p: any) => p.code) || []
    });
    setShowRoleModal(true);
  };

  // Toggle permission in role form
  const togglePermission = (code: string) => {
    setRoleForm(prev => ({
      ...prev,
      permissionCodes: prev.permissionCodes.includes(code)
        ? prev.permissionCodes.filter(c => c !== code)
        : [...prev.permissionCodes, code]
    }));
  };

  // Select all permissions in a category
  const selectCategoryPermissions = (category: string, select: boolean) => {
    const categoryPerms = permissions.filter(p => p.category === category).map(p => p.code);
    setRoleForm(prev => ({
      ...prev,
      permissionCodes: select
        ? [...new Set([...prev.permissionCodes, ...categoryPerms])]
        : prev.permissionCodes.filter(c => !categoryPerms.includes(c))
    }));
  };

  // Save role (create or update)
  const handleSaveRole = async () => {
    if (!roleForm.name.trim()) return;
    setRoleSaving(true);
    try {
      const url = editingRole
        ? `/api/admin/roles/${editingRole.id}`
        : '/api/admin/roles';
      const method = editingRole ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(roleForm)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Błąd zapisu roli');
      }

      setShowRoleModal(false);
      fetchRoles();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRoleSaving(false);
    }
  };

  // Delete role
  const handleDeleteRole = async (roleId: string) => {
    try {
      const res = await fetch(`/api/admin/roles/${roleId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Błąd usuwania roli');
      }

      setRoleDeleteConfirm(null);
      fetchRoles();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Assign role to user
  const handleAssignRoleToUser = async (roleId: string) => {
    if (!userRoleModal) return;
    try {
      const res = await fetch(`/api/admin/users/${userRoleModal.userId}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ roleId })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Błąd przypisywania roli');
      }

      const rolesRes = await fetch(`/api/admin/users/${userRoleModal.userId}/roles`, { credentials: 'include' });
      const rolesData = await rolesRes.json();
      setUserRoles(rolesData.roles || []);
      fetchUsers(usersPagination.page, searchTerm);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Remove role from user
  const handleRemoveRoleFromUser = async (roleId: string) => {
    if (!userRoleModal) return;
    try {
      const res = await fetch(`/api/admin/users/${userRoleModal.userId}/roles/${roleId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Błąd usuwania roli');
      }

      const rolesRes = await fetch(`/api/admin/users/${userRoleModal.userId}/roles`, { credentials: 'include' });
      const rolesData = await rolesRes.json();
      setUserRoles(rolesData.roles || []);
      fetchUsers(usersPagination.page, searchTerm);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Group permissions by category
  const groupedPermissions = permissions.reduce((acc: any, perm: any) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, any[]>);

  if (!isLoaded) return <div className="text-center py-20 text-on-surface-variant">Ładowanie panelu...</div>;
  if (!isSignedIn) return <RedirectToSignIn />;
  if (user.id !== ADMIN_ID) {
    return (
      <div className="text-center py-20 max-w-lg mx-auto">
        <span className="material-symbols-outlined text-error text-6xl mb-4">gpp_bad</span>
        <h2 className="text-2xl font-bold text-error mb-2">Brak Dostępu</h2>
        <p className="text-on-surface-variant mb-6">Ten obszar jest zarezerwowany wyłącznie dla administratorów.</p>
        <Link to="/" className="btn-primary">Wróć na stronę główną</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[70vh] w-full gap-1">
      {/* Sidebar Admina */}
      <div className="w-full md:w-72 flex flex-col gap-2 bg-surface-container-low p-4 md:rounded-r-2xl border-y border-r border-outline-variant/10 h-fit md:min-h-[70vh] sticky top-24">
        <h3 className="font-bold text-lg mb-4 text-primary px-3 uppercase tracking-wider text-sm flex items-center gap-2">
          <span className="material-symbols-outlined">admin_panel_settings</span> Admin
        </h3>

        <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${activeTab === 'dashboard' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-on-surface-variant hover:bg-surface-bright'}`}>
          <span className="material-symbols-outlined text-[20px]">dashboard</span> Dashboard
        </button>
        <button onClick={() => setActiveTab('users')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${activeTab === 'users' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-on-surface-variant hover:bg-surface-bright'}`}>
          <span className="material-symbols-outlined text-[20px]">group</span> Użytkownicy
        </button>
        <button onClick={() => setActiveTab('producers')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${activeTab === 'producers' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-on-surface-variant hover:bg-surface-bright'}`}>
          <span className="material-symbols-outlined text-[20px]">mic</span> Giełda Talentów
        </button>
        <button onClick={() => setActiveTab('tracks')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${activeTab === 'tracks' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-on-surface-variant hover:bg-surface-bright'}`}>
          <span className="material-symbols-outlined text-[20px]">library_music</span> Treki i Moderacja
        </button>
        <button onClick={() => setActiveTab('roles')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${activeTab === 'roles' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-on-surface-variant hover:bg-surface-bright'}`}>
          <span className="material-symbols-outlined text-[20px]">shield</span> Role i Uprawnienia
        </button>
        <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${activeTab === 'settings' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-on-surface-variant hover:bg-surface-bright'}`}>
          <span className="material-symbols-outlined text-[20px]">settings</span> Ustawienia API
        </button>
        <button onClick={() => setActiveTab('siteSettings')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${activeTab === 'siteSettings' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-on-surface-variant hover:bg-surface-bright'}`}>
          <span className="material-symbols-outlined text-[20px]">tune</span> Ustawienia Strony
        </button>
        <button onClick={() => setActiveTab('support')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${activeTab === 'support' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-on-surface-variant hover:bg-surface-bright'}`}>
          <span className="material-symbols-outlined text-[20px]">support_agent</span> Wsparcie AI
        </button>
        <button onClick={() => setActiveTab('affiliates')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${activeTab === 'affiliates' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-on-surface-variant hover:bg-surface-bright'}`}>
          <span className="material-symbols-outlined text-[20px]">handshake</span> Afiliacja
        </button>
      
        <button onClick={() => setActiveTab('logs')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${activeTab === 'logs' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-on-surface-variant hover:bg-surface-bright'}`}>
          <span className="material-symbols-outlined text-[20px]">history</span> Logi
        </button>
      </div>

      {/* Główna Zawartość */}
      <div className="flex-1 bg-surface-container-low md:rounded-l-2xl border-y border-l border-outline-variant/10 p-4 md:p-8 overflow-hidden w-full">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-headline mb-6">Przegląd Systemu</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-surface p-5 rounded-xl border border-outline-variant/10 flex flex-col justify-between">
                <div>
                  <p className="text-on-surface-variant text-sm mb-1">Wygenerowano Tracków (Header Counter)</p>
                  {statsLoading ? (
                    <div className="flex items-center justify-center h-12">
                      <span className="material-symbols-outlined animate-spin text-primary">cycle</span>
                    </div>
                  ) : (
                    <div className="flex items-end gap-3">
                      <p className="text-3xl font-bold text-primary">
                        {stats?.headerCounterManualEnabled ? stats?.headerCounterManualValue : stats?.totalTracks ?? 0}
                      </p>
                      <span className="text-sm text-on-surface-variant pb-1">widoczne w headerze</span>
                    </div>
                  )}
                </div>
                
                {!statsLoading && stats && (
                  <div className="mt-4 pt-4 border-t border-outline-variant/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">Ustaw ręczną wartość</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={stats.headerCounterManualEnabled || false}
                          onChange={(e) => handleHeaderCounterUpdate(e.target.checked, stats.headerCounterManualValue || 0)}
                        />
                        <div className="w-11 h-6 bg-surface-bright rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    {stats.headerCounterManualEnabled && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          className="bg-surface-bright border border-outline-variant/20 rounded-lg px-3 py-1.5 text-sm w-full focus:outline-none focus:border-primary"
                          value={stats.headerCounterManualValue || 0}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setStats(prev => prev ? { ...prev, headerCounterManualValue: val } : null);
                          }}
                          onBlur={(e) => handleHeaderCounterUpdate(stats.headerCounterManualEnabled || false, parseInt(e.target.value) || 0)}
                        />
                        <button
                          className="px-3 py-1.5 bg-primary/20 text-primary hover:bg-primary hover:text-on-primary rounded-lg text-sm font-medium transition-colors"
                          onClick={() => handleHeaderCounterUpdate(stats.headerCounterManualEnabled || false, stats.headerCounterManualValue || 0)}
                        >
                          Zapisz
                        </button>
                      </div>
                    )}
                    {!stats.headerCounterManualEnabled && (
                      <p className="text-xs text-on-surface-variant">
                        Obecnie wyświetlana jest rzeczywista liczba z bazy: <strong className="text-on-surface">{stats.totalTracks}</strong>
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="bg-surface p-5 rounded-xl border border-outline-variant/10">
                <p className="text-on-surface-variant text-sm mb-1">Zarejestrowani Użytkownicy</p>
                {statsLoading ? (
                  <div className="flex items-center justify-center h-12">
                    <span className="material-symbols-outlined animate-spin text-tertiary">cycle</span>
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-tertiary">{stats?.totalUsers ?? 0}</p>
                )}
              </div>
              <div className="bg-surface p-5 rounded-xl border border-outline-variant/10">
                <p className="text-on-surface-variant text-sm mb-1">Przychód (Wkrótce)</p>
                {statsLoading ? (
                  <div className="flex items-center justify-center h-12">
                    <span className="material-symbols-outlined animate-spin text-green-500">cycle</span>
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-green-500">{stats?.revenuePLN ?? 0} PLN</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'producers' && (
          <ProducerManager />
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-headline mb-6">Użytkownicy i Ekonomia</h2>

            {/* System Economy Overview */}
            {systemEconomy && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-surface p-5 rounded-xl border border-outline-variant/10">
                  <p className="text-on-surface-variant text-sm mb-1">Łączna liczba hitów w systemie</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="material-symbols-outlined text-3xl text-primary" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                    <p className="text-3xl font-bold text-primary">{systemEconomy.totalCoins}</p>
                  </div>
                </div>
                <div className="bg-surface p-5 rounded-xl border border-outline-variant/10">
                  <p className="text-on-surface-variant text-sm mb-1">Łączna liczba not w systemie</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="material-symbols-outlined text-3xl text-tertiary" style={{fontVariationSettings: "'FILL' 1"}}>music_note</span>
                    <p className="text-3xl font-bold text-tertiary">{systemEconomy.totalNotes}</p>
                  </div>
                </div>
                <div className="bg-surface p-5 rounded-xl border border-outline-variant/10">
                  <p className="text-on-surface-variant text-sm mb-1">Aktywni użytkownicy</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="material-symbols-outlined text-3xl text-green-500" style={{fontVariationSettings: "'FILL' 1"}}>group</span>
                    <p className="text-3xl font-bold text-green-500">{systemEconomy.totalUsers}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Szukaj po email lub Clerk ID..."
                className="flex-1 px-4 py-2 bg-surface border border-outline-variant/20 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary-dark active:scale-95 transition-all"
              >
                Szukaj
              </button>
              <button
                type="button"
                onClick={() => { setSearchTerm(''); fetchUsers(1, ''); }}
                className="px-4 py-2 bg-surface-container text-on-surface font-bold rounded-xl hover:bg-surface-container-high active:scale-95 transition-all border border-outline-variant/20"
              >
                Wyczyść
              </button>
            </form>

            {/* Users Table */}
            {usersLoading ? (
              <div className="flex justify-center items-center py-12">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary">cycle</span>
              </div>
            ) : usersError ? (
              <div className="bg-error/10 text-error p-4 rounded-xl border border-error/20">
                <p className="font-bold">Błąd ładowania użytkowników:</p>
                <p>{usersError}</p>
              </div>
            ) : (
              <>
                <div className="bg-surface-container-low rounded-xl border border-outline-variant/10 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-surface-container-high">
                        <tr className="text-left text-sm text-on-surface-variant font-bold">
                          <th className="p-4">ID</th>
                          <th className="p-4">Email</th>
                          <th className="p-4">Clerk ID</th>
                          <th className="p-4">Role</th>
                          <th className="p-4">Hity</th>
                          <th className="p-4">Noty</th>
                          <th className="p-4">Tarif</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Utworzono</th>
                          <th className="p-4">Akcje</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-surface-bright transition-colors">
                            <td className="p-4 text-xs font-mono text-on-surface-variant">{user.id.substring(0, 8)}...</td>
                            <td className="p-4">{user.email || '-'}</td>
                            <td className="p-4 text-xs font-mono text-on-surface-variant">{user.clerk_id}</td>
                            <td className="p-4">
                              <button
                                onClick={() => setUserRoleModal({ userId: user.id, email: user.email || user.clerk_id })}
                                className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition-all text-xs ${user.user_admin_roles && user.user_admin_roles.length > 0 ? 'bg-primary/20 border-primary/50 text-primary hover:bg-primary/30' : 'bg-surface-container-high border-outline-variant/20 hover:border-primary/30 hover:bg-primary/10'}`}
                                title="Zarządzaj rolami"
                              >
                                <span className="material-symbols-outlined text-[14px]">shield</span>
                                Role
                              </button>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px] text-primary" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                                <span className="font-bold min-w-[24px]">{user.coins || 0}</span>
                                <button
                                  onClick={() => {
                                    setPromptDialog({
                                      isOpen: true,
                                      title: `Nowa liczba hitów dla ${user.email || user.clerk_id}:`,
                                      value: String(user.coins || 0),
                                      inputType: 'number',
                                      onSubmit: (newCoins) => {
                                        if (newCoins !== null && !isNaN(parseInt(newCoins))) {
                                          handleUserUpdate(user.id, { coins: parseInt(newCoins) });
                                        }
                                      }
                                    });
                                  }}
                                  className="material-symbols-outlined text-[16px] text-on-surface-variant hover:text-primary transition-all ml-1"
                                  title="Edytuj hitówy"
                                >
                                  edit
                                </button>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px] text-tertiary" style={{fontVariationSettings: "'FILL' 1"}}>music_note</span>
                                <span className="font-bold min-w-[24px]">{user.notes || 0}</span>
                                <button
                                  onClick={() => {
                                    setPromptDialog({
                                      isOpen: true,
                                      title: `Nowa liczba not dla ${user.email || user.clerk_id}:`,
                                      value: String(user.notes || 0),
                                      inputType: 'number',
                                      onSubmit: (newNotes) => {
                                        if (newNotes !== null && !isNaN(parseInt(newNotes))) {
                                          handleUserUpdate(user.id, { notes: parseInt(newNotes) });
                                        }
                                      }
                                    });
                                  }}
                                  className="material-symbols-outlined text-[16px] text-on-surface-variant hover:text-tertiary transition-all ml-1"
                                  title="Edytuj noty"
                                >
                                  edit
                                </button>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <select
                                  value={user.subscription_tier || 'free'}
                                  onChange={(e) => handleUserUpdate(user.id, { subscription_tier: e.target.value })}
                                  className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1.5 rounded border border-outline-variant/20 cursor-pointer outline-none appearance-none text-center min-w-[80px] ${
                                    user.subscription_tier === 'legend' ? 'bg-green-500/20 text-green-500' :
                                    user.subscription_tier === 'vip' ? 'bg-tertiary/20 text-tertiary' :
                                    'bg-surface-variant/30 text-on-surface-variant'
                                  }`}
                                >
                                  <option value="free" className="bg-surface text-on-surface">FREE</option>
                                  <option value="vip" className="bg-surface text-on-surface">VIP</option>
                                  <option value="legend" className="bg-surface text-on-surface">LEGEND</option>
                                </select>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.status === 'banned' ? 'bg-error/20 text-error' : user.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-surface-variant/20 text-on-surface-variant'}`}>
                                {user.status || 'active'}
                              </span>
                            </td>
                            <td className="p-4 text-sm text-on-surface-variant">
                              {new Date(user.created_at).toLocaleDateString('pl-PL')}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">

                                {user.status === 'banned' ? (
                                  <button
                                    onClick={() => handleUserUpdate(user.id, { status: 'active' })}
                                    className="material-symbols-outlined text-green-500 hover:text-green-400 transition-all p-1.5 rounded-lg hover:bg-green-500/10"
                                    title="Odblokuj"
                                  >
                                    lock_open
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleUserUpdate(user.id, { status: 'banned' })}
                                    className="material-symbols-outlined text-error hover:text-error-dark transition-all p-1.5 rounded-lg hover:bg-error/10"
                                    title="Zablokuj"
                                  >
                                    lock
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                {usersPagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-6">
                    <button
                      onClick={() => handlePageChange(usersPagination.page - 1)}
                      disabled={usersPagination.page === 1}
                      className="px-4 py-2 bg-surface-container text-on-surface font-bold rounded-xl hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-outline-variant/20"
                    >
                      ← Poprzednia
                    </button>
                    <span className="text-on-surface-variant font-bold">
                      Strona {usersPagination.page} z {usersPagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(usersPagination.page + 1)}
                      disabled={usersPagination.page >= usersPagination.totalPages}
                      className="px-4 py-2 bg-surface-container text-on-surface font-bold rounded-xl hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-outline-variant/20"
                    >
                      Następna →
                    </button>
                  </div>
                )}

                {users.length === 0 && !usersLoading && (
                  <div className="text-center py-12 text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-3">search_off</span>
                    <p>Nie znaleziono użytkowników.</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'tracks' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-headline mb-6">Wszystkie Treki (Moderacja)</h2>

            {/* System Stats for Tracks */}
            {tracksSystemStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-surface p-5 rounded-xl border border-outline-variant/10">
                  <p className="text-on-surface-variant text-sm mb-1">Łączna liczba polubień</p>
                  <p className="text-2xl font-bold text-primary">{tracksSystemStats.totalLikes} ❤️</p>
                </div>
                <div className="bg-surface p-5 rounded-xl border border-outline-variant/10">
                  <p className="text-on-surface-variant text-sm mb-1">Łączna liczba odtworzeń</p>
                  <p className="text-2xl font-bold text-tertiary">{tracksSystemStats.totalPlays} 🔊</p>
                </div>
                <div className="bg-surface p-5 rounded-xl border border-outline-variant/10">
                  <p className="text-on-surface-variant text-sm mb-1">Aktywne treki</p>
                  <p className="text-2xl font-bold text-green-500">{tracksSystemStats.totalTracks}</p>
                </div>
              </div>
            )}

            {/* Search Bar & Filters */}
            <form onSubmit={handleTracksSearch} className="flex flex-col md:flex-row gap-2 mb-6">
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={tracksSearchTerm}
                  onChange={(e) => setTracksSearchTerm(e.target.value)}
                  placeholder="Szukaj po tytule tracka..."
                  className="flex-1 px-4 py-2 bg-surface border border-outline-variant/20 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <select
                  value={tracksExpiredFilter}
                  onChange={(e) => setTracksExpiredFilter(e.target.value)}
                  className="px-4 py-2 bg-surface border border-outline-variant/20 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="all">Wszystkie treki</option>
                  <option value="false">Aktywne</option>
                  <option value="true">Usunięte</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary-dark active:scale-95 transition-all"
                >
                  Szukaj
                </button>
                <button
                  type="button"
                  onClick={() => { setTracksSearchTerm(''); setTracksExpiredFilter('all'); fetchTracks(1, '', 'all'); }}
                  className="px-4 py-2 bg-surface-container text-on-surface font-bold rounded-xl hover:bg-surface-container-high active:scale-95 transition-all border border-outline-variant/20"
                >
                  Wyczyść
                </button>
              </div>
            </form>

            {/* Tracks Table */}
            {tracksLoading ? (
              <div className="flex justify-center items-center py-12">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary">cycle</span>
              </div>
            ) : tracksError ? (
              <div className="bg-error/10 text-error p-4 rounded-xl border border-error/20">
                <p className="font-bold">Błąd ładowania tracków:</p>
                <p>{tracksError}</p>
              </div>
            ) : (
              <>
                <div className="bg-surface-container-low rounded-xl border border-outline-variant/10 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-surface-container-high">
                        <tr className="text-left text-sm text-on-surface-variant font-bold">
                          <th className="p-4">Okładka</th>
                          <th className="p-4">Odtwarzaj</th>
                          <th className="p-4">Tytuł</th>
                          <th className="p-4">Wariant</th>
                          <th className="p-4">Wykonawca</th>
                          <th className="p-4">Użytkownik</th>
                          <th className="p-4">Lajki</th>
                          <th className="p-4">Odtworzenia</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Utworzono</th>
                          <th className="p-4">Akcje</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10">
                        {tracks.map((track) => (
                          <tr key={track.id} className="hover:bg-surface-bright transition-colors">
                            <td className="p-4">
                              {track.cover_image_url ? (
                                <img
                                  src={track.cover_image_url}
                                  alt={track.title}
                                  className="w-12 h-12 object-cover rounded-lg border border-outline-variant/20"
                                />
                              ) : (
                                <span className="material-symbols-outlined text-2xl text-on-surface-variant">music_note</span>
                              )}
                            </td>
                            <td className="p-4">
                              {track.audio_url ? (
                                <div className="flex flex-col items-center gap-1">
                                  <button
                                    onClick={() => handlePlayTrack(track.id, track.audio_url)}
                                    className="material-symbols-outlined text-2xl text-primary hover:scale-110 transition-all"
                                    title={playingTrackId === track.id && audioRef.current && !audioRef.current.paused ? "Pauza" : "Odtwórz track"}
                                  >
                                    {playingTrackId === track.id && audioRef.current && !audioRef.current.paused ? 'pause' : 'play_arrow'}
                                  </button>
                                  {playingTrackId === track.id && (
                                    <div className="flex flex-col items-center w-full max-w-[120px]">
                                      <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                                        <div
                                          className="bg-primary h-full rounded-full"
                                          style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                                        />
                                      </div>
                                      <div className="text-xs text-on-surface-variant mt-1">
                                        {formatTime(currentTime)} / {formatTime(duration)}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="material-symbols-outlined text-2xl text-on-surface-variant/50" title="Brak audio">
                                  no_sound
                                </span>
                              )}
                            </td>
                            <td className="p-4 font-bold">{track.title}</td>
                            <td className="p-4 text-sm font-mono text-on-surface-variant">
                              {track.variant_index !== undefined ? `V${track.variant_index + 1}` : 'V1'}
                            </td>
                            <td className="p-4 text-sm text-on-surface-variant">
                              {track.producers?.name ? (
                                <span className="font-medium text-primary">{track.producers.name}</span>
                              ) : track.producer_id ? (
                                <span className="font-mono text-xs">{track.producer_id.substring(0, 8)}...</span>
                              ) : (
                                <span className="text-on-surface-variant/50">-</span>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="text-sm">
                                <p className="text-on-surface-variant">{track.users?.email || track.users?.clerk_id || 'Unknown'}</p>
                                <p className="text-xs text-on-surface-variant font-mono">{track.user_id?.substring(0, 8)}...</p>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span className="font-bold">{track.likes || 0}</span>
                                <button
                                  onClick={() => {
                                    setPromptDialog({
                                      isOpen: true,
                                      title: `Nowa liczba lajków dla "${track.title}":`,
                                      value: String(track.likes || 0),
                                      inputType: 'number',
                                      onSubmit: (newLikes) => {
                                        if (newLikes !== null && !isNaN(parseInt(newLikes))) {
                                          handleTrackModerate(track.id, { likes: parseInt(newLikes) });
                                        }
                                      }
                                    });
                                  }}
                                  className="material-symbols-outlined text-xs text-primary hover:scale-110 transition-all"
                                  title="Edytuj lajki"
                                >
                                  edit
                                </button>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span className="font-bold">{track.plays || 0}</span>
                                <button
                                  onClick={() => {
                                    setPromptDialog({
                                      isOpen: true,
                                      title: `Nowa liczba odtworzeń dla "${track.title}":`,
                                      value: String(track.plays || 0),
                                      inputType: 'number',
                                      onSubmit: (newPlays) => {
                                        if (newPlays !== null && !isNaN(parseInt(newPlays))) {
                                          handleTrackModerate(track.id, { plays: parseInt(newPlays) });
                                        }
                                      }
                                    });
                                  }}
                                  className="material-symbols-outlined text-xs text-tertiary hover:scale-110 transition-all"
                                  title="Edytuj odtworzenia"
                                >
                                  edit
                                </button>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${track.expired ? 'bg-error/20 text-error' : 'bg-green-500/20 text-green-500'}`}>
                                {track.expired ? 'Usunięty' : 'Aktywny'}
                              </span>
                            </td>
                            <td className="p-4 text-sm text-on-surface-variant">
                              {new Date(track.created_at).toLocaleDateString('pl-PL')}
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    const newExpired = !track.expired;
                                    handleTrackModerate(track.id, { expired: newExpired });
                                  }}
                                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${track.expired ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30' : 'bg-error/20 text-error hover:bg-error/30'}`}
                                >
                                  {track.expired ? 'Przywróć' : 'Usuń'}
                                </button>
                                <button
                                  onClick={() => {
                                    setPromptDialog({
                                      isOpen: true,
                                      title: 'Powód moderacji (opcjonalnie):',
                                      value: '',
                                      inputType: 'text',
                                      onSubmit: (reason) => {
                                        if (reason !== null) {
                                          handleTrackModerate(track.id, { moderation_reason: reason });
                                        }
                                      }
                                    });
                                  }}
                                  className="px-3 py-1 text-xs font-bold bg-surface-variant/20 text-on-surface-variant rounded-lg hover:bg-surface-variant/30 transition-all"
                                  title="Oznacz z powodem"
                                >
                                  Oznacz
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                {tracksPagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-6">
                    <button
                      onClick={() => handleTracksPageChange(tracksPagination.page - 1)}
                      disabled={tracksPagination.page === 1}
                      className="px-4 py-2 bg-surface-container text-on-surface font-bold rounded-xl hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-outline-variant/20"
                    >
                      ← Poprzednia
                    </button>
                    <span className="text-on-surface-variant font-bold">
                      Strona {tracksPagination.page} z {tracksPagination.totalPages}
                    </span>
                    <button
                      onClick={() => handleTracksPageChange(tracksPagination.page + 1)}
                      disabled={tracksPagination.page >= tracksPagination.totalPages}
                      className="px-4 py-2 bg-surface-container text-on-surface font-bold rounded-xl hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-outline-variant/20"
                    >
                      Następna →
                    </button>
                  </div>
                )}

                {tracks.length === 0 && !tracksLoading && (
                  <div className="text-center py-12 text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-3">search_off</span>
                    <p>Nie znaleziono tracków.</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold font-headline">Role i Uprawnienia</h2>
              <button
                onClick={handleCreateRole}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary-dark active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Nowa Rola
              </button>
            </div>

            {rolesLoading ? (
              <div className="flex justify-center items-center py-12">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary">cycle</span>
              </div>
            ) : rolesError ? (
              <div className="bg-error/10 text-error p-4 rounded-xl border border-error/20">
                <p className="font-bold">Błąd ładowania ról:</p>
                <p>{rolesError}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Lista ról */}
                  <div className="lg:col-span-2">
                    <div className="space-y-4">
                      {roles.map(role => (
                        <div key={role.id} className="bg-surface p-4 rounded-xl border border-outline-variant/10">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-lg flex items-center gap-2">
                                  <span className="material-symbols-outlined text-primary">shield</span>
                                  {role.name}
                                </h4>
                                {role.is_system && (
                                  <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-bold rounded-full">systemowa</span>
                                )}
                              </div>
                              <p className="text-on-surface-variant text-sm">{role.description || 'Brak opisu'}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEditRole(role)}
                                className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-all p-1.5 rounded-lg hover:bg-primary/10"
                                title="Edytuj rolę"
                              >
                                edit
                              </button>
                              {!role.is_system && (
                                <>
                                  {roleDeleteConfirm === role.id ? (
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => handleDeleteRole(role.id)}
                                        className="px-2 py-1 text-xs font-bold bg-error text-on-error rounded-lg hover:bg-error-dark transition-all"
                                      >
                                        Usuń
                                      </button>
                                      <button
                                        onClick={() => setRoleDeleteConfirm(null)}
                                        className="px-2 py-1 text-xs font-bold bg-surface-container text-on-surface rounded-lg hover:bg-surface-container-high transition-all"
                                      >
                                        Anuluj
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setRoleDeleteConfirm(role.id)}
                                      className="material-symbols-outlined text-on-surface-variant hover:text-error transition-all p-1.5 rounded-lg hover:bg-error/10"
                                      title="Usuń rolę"
                                    >
                                      delete
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-bold text-on-surface-variant">Uprawnienia ({role.permissions?.length || 0}):</p>
                              <span className="text-xs text-on-surface-variant">
                                {new Date(role.created_at).toLocaleDateString('pl-PL')}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {role.permissions?.map((perm: any) => (
                                <span
                                  key={perm.code}
                                  className="px-3 py-1 bg-surface-container-high text-on-surface-variant text-xs rounded-full border border-outline-variant/20"
                                  title={`${perm.description} (${perm.category})`}
                                >
                                  {perm.code}
                                </span>
                              )) || (
                                <span className="text-on-surface-variant/70 text-sm">Brak uprawnień</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {roles.length === 0 && (
                      <div className="text-center py-12 text-on-surface-variant">
                        <span className="material-symbols-outlined text-4xl mb-3">shield</span>
                        <p>Brak ról. Kliknij "Nowa Rola" aby utworzyć pierwszą.</p>
                      </div>
                    )}
                  </div>

                  {/* Panel boczny - lista uprawnień */}
                  <div>
                    <h3 className="text-lg font-bold mb-4">Wszystkie Uprawnienia ({permissions.length})</h3>
                    <div className="bg-surface p-4 rounded-xl border border-outline-variant/10 max-h-[600px] overflow-y-auto">
                      {Object.entries(groupedPermissions).map(([category, perms]: [string, any]) => (
                        <div key={category} className="mb-4 pb-4 border-b border-outline-variant/10 last:border-0 last:mb-0 last:pb-0">
                          <p className="text-xs uppercase tracking-wider font-bold text-primary mb-2">{category}</p>
                          <div className="space-y-2">
                            {(perms as any[]).map((perm: any) => (
                              <div key={perm.code} className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-bold">{perm.code}</p>
                                  <p className="text-xs text-on-surface-variant">{perm.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Modal tworzenia/edycji roli */}
            {showRoleModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => !roleSaving && setShowRoleModal(false)}>
                <div className="bg-surface-container rounded-2xl border border-outline-variant/20 p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">{editingRole ? 'Edytuj Rolę' : 'Nowa Rola'}</h3>
                    <button onClick={() => !roleSaving && setShowRoleModal(false)} className="material-symbols-outlined text-on-surface-variant hover:text-on-surface transition-all">close</button>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-on-surface-variant mb-1">Nazwa roli</label>
                      <input
                        type="text"
                        value={roleForm.name}
                        onChange={e => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="np. moderator, redaktor..."
                        className="w-full px-4 py-2.5 bg-surface border border-outline-variant/20 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                        disabled={editingRole?.is_system}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-on-surface-variant mb-1">Opis</label>
                      <input
                        type="text"
                        value={roleForm.description}
                        onChange={e => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Krótki opis roli..."
                        className="w-full px-4 py-2.5 bg-surface border border-outline-variant/20 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-on-surface-variant">Uprawnienia</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const allCodes = permissions.map(p => p.code);
                            setRoleForm(prev => ({ ...prev, permissionCodes: allCodes }));
                          }}
                          className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all"
                        >
                          Zaznacz wszystkie
                        </button>
                        <button
                          onClick={() => setRoleForm(prev => ({ ...prev, permissionCodes: [] }))}
                          className="text-xs px-3 py-1 bg-surface-variant/20 text-on-surface-variant rounded-lg hover:bg-surface-variant/30 transition-all"
                        >
                          Odznacz wszystkie
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4 max-h-[350px] overflow-y-auto bg-surface rounded-xl p-4 border border-outline-variant/10">
                      {Object.entries(groupedPermissions).map(([category, perms]: [string, any]) => (
                        <div key={category} className="border-b border-outline-variant/10 pb-3 last:border-0 last:pb-0">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs uppercase tracking-wider font-bold text-primary">{category}</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => selectCategoryPermissions(category, true)}
                                className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded"
                              >
                                wszystkie
                              </button>
                              <button
                                onClick={() => selectCategoryPermissions(category, false)}
                                className="text-[10px] px-2 py-0.5 bg-surface-variant/20 text-on-surface-variant rounded"
                              >
                                żadne
                              </button>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            {(perms as any[]).map((perm: any) => {
                              const isChecked = roleForm.permissionCodes.includes(perm.code);
                              return (
                                <label key={perm.code} className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${isChecked ? 'bg-primary/10' : 'hover:bg-surface-bright'}`}>
                                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isChecked ? 'bg-primary border-primary' : 'border-outline-variant bg-surface'}`}>
                                    {isChecked && <span className="material-symbols-outlined text-[14px] text-on-primary" style={{fontVariationSettings: "'FILL' 1"}}>check</span>}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold">{perm.code}</p>
                                    <p className="text-xs text-on-surface-variant truncate">{perm.description}</p>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-outline-variant/10">
                    <button
                      onClick={() => setShowRoleModal(false)}
                      className="px-6 py-2 bg-surface-container text-on-surface font-bold rounded-xl hover:bg-surface-container-high transition-all border border-outline-variant/20"
                      disabled={roleSaving}
                    >
                      Anuluj
                    </button>
                    <button
                      onClick={handleSaveRole}
                      disabled={!roleForm.name.trim() || roleSaving}
                      className="flex items-center gap-2 px-6 py-2 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
                    >
                      {roleSaving && <span className="material-symbols-outlined animate-spin text-[18px]">cycle</span>}
                      {editingRole ? 'Zapisz zmiany' : 'Utwórz rolę'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal zarządzania rolami użytkownika - dostępny z każdej zakładki */}
        {userRoleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setUserRoleModal(null)}>
            <div className="bg-surface-container rounded-2xl border border-outline-variant/20 p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold">Role użytkownika</h3>
                  <p className="text-sm text-on-surface-variant">{userRoleModal.email}</p>
                </div>
                <button onClick={() => setUserRoleModal(null)} className="material-symbols-outlined text-on-surface-variant hover:text-on-surface transition-all">close</button>
              </div>
              
              {userRolesLoading ? (
                <div className="flex justify-center py-8">
                  <span className="material-symbols-outlined animate-spin text-3xl text-primary">cycle</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm font-bold text-on-surface-variant">Obecne role:</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {userRoles.length === 0 ? (
                      <span className="text-sm text-on-surface-variant/70">Brak przypisanych ról</span>
                    ) : (
                      userRoles.map((r: any) => (
                        <div key={r.id} className="flex items-center gap-1 px-3 py-1.5 bg-surface-container-high rounded-full border border-outline-variant/20">
                          <span className="text-sm font-bold text-primary">{r.name}</span>
                          <button
                            onClick={() => handleRemoveRoleFromUser(r.id)}
                            className="material-symbols-outlined text-[16px] text-on-surface-variant hover:text-error transition-all"
                            title="Usuń rolę"
                          >
                            close
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <p className="text-sm font-bold text-on-surface-variant mb-2">Dodaj rolę:</p>
                  <div className="flex flex-wrap gap-2">
                    {roles
                      .filter(r => !userRoles.some((ur: any) => ur.id === r.id))
                      .map(role => (
                        <button
                          key={role.id}
                          onClick={() => handleAssignRoleToUser(role.id)}
                          className="px-3 py-1.5 bg-surface text-sm font-bold rounded-full border border-outline-variant/20 hover:bg-primary/10 hover:border-primary/30 transition-all"
                        >
                          + {role.name}
                        </button>
                      ))
                    }
                    {roles.filter(r => !userRoles.some((ur: any) => ur.id === r.id)).length === 0 && (
                      <span className="text-sm text-on-surface-variant/70">Użytkownik ma już wszystkie role</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <ApiSettingsManager />
        )}

        {activeTab === 'siteSettings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-headline mb-6">Ustawienia Strony & Cennika</h2>
            <SiteSettingsManager />
          </div>
        )}

        {activeTab === 'support' && (
          <SupportAgentManager />
        )}
        {activeTab === 'affiliates' && (
          <AffiliateManager />
        )}
      
        {activeTab === 'logs' && <SystemLogsManager />}
      </div>

      {/* Custom Prompt Dialog */}
      {promptDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-surface border border-outline-variant/20 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold font-headline mb-4 text-on-surface">{promptDialog.title}</h3>
            <input 
              autoFocus
              type={promptDialog.inputType}
              value={promptDialog.value}
              onChange={(e) => setPromptDialog({...promptDialog, value: e.target.value})}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  promptDialog.onSubmit(promptDialog.value);
                  setPromptDialog(prev => ({...prev, isOpen: false}));
                } else if (e.key === 'Escape') {
                  promptDialog.onSubmit(null);
                  setPromptDialog(prev => ({...prev, isOpen: false}));
                }
              }}
              className="w-full bg-surface-container-low border border-outline-variant/30 focus:border-primary p-3 rounded-xl outline-none text-on-surface mb-6 font-medium"
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => {
                  promptDialog.onSubmit(null);
                  setPromptDialog(prev => ({...prev, isOpen: false}));
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                Anuluj
              </button>
              <button 
                onClick={() => {
                  promptDialog.onSubmit(promptDialog.value);
                  setPromptDialog(prev => ({...prev, isOpen: false}));
                }}
                className="px-5 py-2.5 rounded-xl font-bold bg-primary text-on-primary hover:bg-primary-dark shadow-md transition-all active:scale-95"
              >
                Potwierdź
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
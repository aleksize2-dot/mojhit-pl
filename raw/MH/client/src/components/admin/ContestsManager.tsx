import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

type Contest = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'upcoming' | 'completed';
  created_at: string;
};

export function ContestsManager() {
  const { getToken } = useAuth();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContest, setEditingContest] = useState<Contest | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    start_date: '',
    end_date: '',
    status: 'active'
  });

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetch('/api/admin/contests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Błąd ładowania konkursów');
      const data = await res.json();
      setContests(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (contest?: Contest) => {
    if (contest) {
      setEditingContest(contest);
      setFormData({
        title: contest.title,
        description: contest.description || '',
        image_url: contest.image_url || '',
        start_date: contest.start_date ? new Date(contest.start_date).toISOString().slice(0, 16) : '',
        end_date: contest.end_date ? new Date(contest.end_date).toISOString().slice(0, 16) : '',
        status: contest.status
      });
    } else {
      setEditingContest(null);
      setFormData({
        title: '',
        description: '',
        image_url: '',
        start_date: '',
        end_date: '',
        status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await getToken();
      const url = editingContest 
        ? `/api/admin/contests/${editingContest.id}`
        : '/api/admin/contests';
      
      const res = await fetch(url, {
        method: editingContest ? 'PUT' : 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
          end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        })
      });

      if (!res.ok) throw new Error('Błąd zapisywania konkursu');
      
      setIsModalOpen(false);
      fetchContests();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten konkurs?')) return;
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/contests/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Błąd usuwania');
      fetchContests();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-8 text-center text-on-surface-variant">Ładowanie...</div>;
  if (error) return <div className="p-8 text-error bg-error/10 rounded-xl">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-headline">Zarządzanie Konkursami</h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors font-bold text-sm"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Nowy Konkurs
        </button>
      </div>

      <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-container border-b border-outline-variant/20 text-on-surface-variant text-sm font-label uppercase tracking-wider">
                <th className="p-4">Wydarzenie / Tytuł</th>
                <th className="p-4">Status</th>
                <th className="p-4">Start</th>
                <th className="p-4">Koniec</th>
                <th className="p-4 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {contests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-on-surface-variant">Brak konkursów. Dodaj pierwszy!</td>
                </tr>
              ) : (
                contests.map((contest) => (
                  <tr key={contest.id} className="hover:bg-surface-bright transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {contest.image_url ? (
                          <img src={contest.image_url} alt={contest.title} className="w-12 h-12 object-cover rounded-lg border border-outline-variant/20" />
                        ) : (
                          <div className="w-12 h-12 bg-surface-variant rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-on-surface-variant/50">image</span>
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-on-surface">{contest.title}</div>
                          <div className="text-xs text-on-surface-variant truncate max-w-[250px]">{contest.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        contest.status === 'active' ? 'bg-green-500/20 text-green-500' :
                        contest.status === 'upcoming' ? 'bg-tertiary/20 text-tertiary' :
                        'bg-surface-variant text-on-surface-variant'
                      }`}>
                        {contest.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-on-surface-variant">
                      {contest.start_date ? new Date(contest.start_date).toLocaleDateString('pl-PL') : '-'}
                    </td>
                    <td className="p-4 text-sm text-on-surface-variant">
                      {contest.end_date ? new Date(contest.end_date).toLocaleDateString('pl-PL') : '-'}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenModal(contest)}
                        className="p-2 text-on-surface-variant hover:text-primary transition-colors"
                        title="Edytuj"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(contest.id)}
                        className="p-2 text-on-surface-variant hover:text-error transition-colors ml-1"
                        title="Usuń"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container">
              <h3 className="text-xl font-bold headline-font">
                {editingContest ? 'Edytuj Konkurs' : 'Nowy Konkurs'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Tytuł Konkursu *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-surface-variant/30 border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary/50 focus:bg-surface-variant/50 transition-all"
                  placeholder="np. Letni Festiwal Hitów"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Opis / Tekst</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-surface-variant/30 border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary/50 focus:bg-surface-variant/50 transition-all"
                  placeholder="Zasady, nagrody, opis..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Link do obrazka (URL)</label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={e => setFormData({...formData, image_url: e.target.value})}
                  className="w-full bg-surface-variant/30 border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary/50 focus:bg-surface-variant/50 transition-all"
                  placeholder="https://example.com/image.png"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Data Startu</label>
                  <input
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={e => setFormData({...formData, start_date: e.target.value})}
                    className="w-full bg-surface-variant/30 border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary/50 transition-all [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Data Zakończenia</label>
                  <input
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={e => setFormData({...formData, end_date: e.target.value})}
                    className="w-full bg-surface-variant/30 border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary/50 transition-all [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value as any})}
                  className="w-full bg-surface-variant/30 border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="active">Aktywny</option>
                  <option value="upcoming">Nadchodzący</option>
                  <option value="completed">Zakończony</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-outline-variant/30 text-on-surface-variant font-bold hover:bg-surface-variant/30 transition-colors"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-bold hover:bg-primary/90 transition-colors"
                >
                  {editingContest ? 'Zapisz Zmiany' : 'Utwórz Konkurs'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

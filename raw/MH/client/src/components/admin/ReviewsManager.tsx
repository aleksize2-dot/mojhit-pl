import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

export interface Review {
  id: string;
  author_name: string;
  rating: number;
  content: string;
  is_published: boolean;
  avatar_url: string | null;
  user_id?: string | null;
  created_at: string;
}

export function ReviewsManager() {
  const { getToken } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  const [formData, setFormData] = useState({
    author_name: '',
    rating: 5,
    content: '',
    is_published: true,
    avatar_url: ''
  });

  const fetchReviews = async () => {
    try {
      const token = await getToken();
      const res = await fetch('/api/admin/reviews', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setReviews(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await getToken();
    const url = editingReview ? `/api/admin/reviews/${editingReview.id}` : '/api/admin/reviews';
    const method = editingReview ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingReview(null);
        setFormData({ author_name: '', rating: 5, content: '', is_published: true, avatar_url: '' });
        fetchReviews();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Na pewno usunąć tę opinię?')) return;
    const token = await getToken();
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchReviews();
    } catch (e) {
      console.error(e);
    }
  };

  const openEditModal = (review: Review) => {
    setEditingReview(review);
    setFormData({
      author_name: review.author_name,
      rating: review.rating,
      content: review.content,
      is_published: review.is_published,
      avatar_url: review.avatar_url || ''
    });
    setIsModalOpen(true);
  };

  if (loading) return <div>Ładowanie opinii...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-headline">Opinie Użytkowników</h2>
          <p className="text-sm text-on-surface-variant">Zarządzaj opiniami wyświetlanymi na stronie głównej.</p>
        </div>
        <button
          onClick={() => {
            setEditingReview(null);
            setFormData({ author_name: '', rating: 5, content: '', is_published: true, avatar_url: '' });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/30 transition-all"
        >
          <span className="material-symbols-outlined">add</span>
          Dodaj Opinię
        </button>
      </div>

      <div className="bg-surface rounded-2xl border border-outline-variant/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-bright text-on-surface-variant text-sm border-b border-outline-variant/10">
                <th className="p-4 font-medium w-12">Avatar</th>
                <th className="p-4 font-medium">Autor</th>
                <th className="p-4 font-medium">Ocena</th>
                <th className="p-4 font-medium">Treść</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                  <td className="p-4">
                    {review.avatar_url ? (
                      <img src={review.avatar_url} alt={review.author_name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm">person</span>
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="font-bold">{review.author_name}</div>
                    {review.user_id && (
                      <div className="text-[10px] text-on-surface-variant/70 font-mono mt-1" title="User ID">
                        {review.user_id}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>
                          {i < review.rating ? 'star' : 'star_outline'}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-on-surface-variant max-w-xs truncate">{review.content}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${review.is_published ? 'bg-green-500/20 text-green-500' : 'bg-surface-variant/20 text-on-surface-variant'}`}>
                      {review.is_published ? 'Opublikowana' : 'Szkic'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => openEditModal(review)} className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                    <button onClick={() => handleDelete(review.id)} className="p-2 text-on-surface-variant hover:text-error transition-colors">
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-on-surface-variant">Brak opinii w bazie.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-container-high rounded-2xl w-full max-w-lg p-6 border border-outline-variant/20 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">{editingReview ? 'Edytuj Opinię' : 'Dodaj Nową Opinię'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-on-surface-variant mb-1">Autor</label>
                <input
                  required
                  type="text"
                  value={formData.author_name}
                  onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                  className="w-full bg-surface px-4 py-2 rounded-xl border border-outline-variant/20 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="np. Szymon"
                />
              </div>
              <div>
                <label className="block text-sm text-on-surface-variant mb-1">URL Avatara (Opcjonalnie)</label>
                <input
                  type="url"
                  value={formData.avatar_url}
                  onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                  className="w-full bg-surface px-4 py-2 rounded-xl border border-outline-variant/20 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm text-on-surface-variant mb-1">Ocena (1-5)</label>
                <input
                  required
                  type="number"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                  className="w-full bg-surface px-4 py-2 rounded-xl border border-outline-variant/20 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-on-surface-variant mb-1">Treść Opinii</label>
                <textarea
                  required
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-surface px-4 py-2 rounded-xl border border-outline-variant/20 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                  placeholder="Treść opinii..."
                ></textarea>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="w-4 h-4 text-primary bg-surface border-outline-variant rounded focus:ring-primary"
                />
                <label htmlFor="is_published" className="text-sm">Opublikuj od razu</label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-on-surface-variant hover:text-on-surface transition-colors font-medium">Anuluj</button>
                <button type="submit" className="bg-primary text-on-primary px-6 py-2 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/30 transition-all">Zapisz</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

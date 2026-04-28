import { useState, useEffect } from 'react';

export function SystemLogsManager() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sortConfig, setSortConfig] = useState<{ column: string; direction: 'asc' | 'desc' }>({ column: 'created_at', direction: 'desc' });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/logs?limit=100', {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Błąd pobierania logów');
      const data = await res.json();
      setLogs(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-error bg-error/10 border-error/20';
      case 'warn': return 'text-warning bg-warning/10 border-warning/20';
      case 'info': return 'text-primary bg-primary/10 border-primary/20';
      default: return 'text-on-surface-variant bg-surface-variant/10 border-outline-variant/20';
    }
  };

  const handleSort = (column: string) => {
    const newDirection = sortConfig.column === column && sortConfig.direction === 'desc' ? 'asc' : 'desc';
    setSortConfig({ column, direction: newDirection });
  };

  const sortedLogs = [...logs].sort((a, b) => {
    let aVal = a[sortConfig.column];
    let bVal = b[sortConfig.column];

    if (aVal == null) aVal = '';
    if (bVal == null) bVal = '';

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const SortHeader = ({ label, column }: { label: string, column: string }) => (
    <th className="p-4 font-medium cursor-pointer hover:bg-surface-container transition-colors select-none group" onClick={() => handleSort(column)}>
      <div className="flex items-center gap-1">
        {label}
        <span className={`material-symbols-outlined text-[14px] transition-opacity ${sortConfig.column === column ? 'opacity-100 text-primary' : 'opacity-20 group-hover:opacity-50'}`}>
          {sortConfig.column === column && sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward'}
        </span>
      </div>
    </th>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-1">Logi Systemowe</h2>
          <p className="text-on-surface-variant text-sm">Historia zdarzeń, błędów i aktywności z backendu.</p>
        </div>
        <button onClick={fetchLogs} className="btn-secondary flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">refresh</span> Odśwież
        </button>
      </div>

      {error && (
        <div className="p-4 bg-error/10 text-error rounded-xl border border-error/20 flex items-center gap-3">
          <span className="material-symbols-outlined">error</span>
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">cycle</span>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-outline-variant/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface-container text-on-surface-variant border-b border-outline-variant/20">
                <tr>
                  <SortHeader label="Czas" column="created_at" />
                  <SortHeader label="Poziom" column="level" />
                  <SortHeader label="Akcja" column="action" />
                  <SortHeader label="Wiadomość" column="message" />
                  <th className="p-4 font-medium">Szczegóły</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {sortedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-on-surface-variant">
                      Brak logów w systemie.
                    </td>
                  </tr>
                ) : (
                  sortedLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                      <td className="p-4 text-on-surface-variant font-mono text-xs">
                        {new Date(log.created_at).toLocaleString('pl-PL')}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold border uppercase tracking-wider ${getLevelColor(log.level)}`}>
                          {log.level}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-on-surface">{log.action}</td>
                      <td className="p-4 text-on-surface-variant max-w-xs truncate" title={log.message}>
                        {log.message}
                      </td>
                      <td className="p-4">
                        <details className="text-xs">
                          <summary className="cursor-pointer text-primary hover:underline">Pokaż dane</summary>
                          <pre className="mt-2 p-2 bg-surface-container rounded border border-outline-variant/20 text-on-surface-variant overflow-x-auto max-w-sm">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';

export function ProducerManager() {
  const [producers, setProducers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'created_at', direction: 'desc' });
  const [cacheBuster, setCacheBuster] = useState(Date.now());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducers = async () => {
    try {
      const res = await fetch('/api/admin/producers', { credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        setProducers(data);
        setCacheBuster(Date.now());
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducers();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const isNew = editing._isNew;
    const method = isNew ? 'POST' : 'PUT';
    const url = isNew ? '/api/admin/producers' : `/api/admin/producers/${editing.id}`;
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...editing,
          theme_config: typeof editing.theme_config === 'string' ? JSON.parse(editing.theme_config || '{}') : (editing.theme_config || {})
        })
      });
      if (res.ok) {
        setEditing(null);
        fetchProducers();
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (err) {
      console.error(err);
      alert('Błąd zapisu');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Na pewno usunąć?')) return;
    try {
      const res = await fetch(`/api/admin/producers/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        fetchProducers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-10">Ładowanie wykonawców...</div>;

  if (editing) {
    return (
      <div className="bg-surface p-6 rounded-xl border border-outline-variant/10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">{producers.find(p => p.id === editing.id) ? 'Edytuj Wykonawcę' : 'Nowy Wykonawca'}</h3>
          <button onClick={() => setEditing(null)} className="text-on-surface-variant hover:text-on-surface">Anuluj</button>
        </div>
        
        <form onSubmit={handleSave} className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs font-bold mb-1 text-on-surface-variant">ID (np. kosa, basia)</label>
            <input required disabled={!editing._isNew} type="text" className="w-full bg-surface-container-low border border-outline-variant/20 focus:border-primary p-3 rounded-xl outline-none" value={editing.id || ''} onChange={e => setEditing({...editing, id: e.target.value})} />
          </div>
          
          <div>
            <label className="block text-xs font-bold mb-1 text-on-surface-variant">Imię / Nazwa</label>
            <input required type="text" className="w-full bg-surface-container-low border border-outline-variant/20 focus:border-primary p-3 rounded-xl outline-none" value={editing.name || ''} onChange={e => setEditing({...editing, name: e.target.value})} />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1 text-on-surface-variant">Badge (np. Ulica & Bass)</label>
            <input type="text" className="w-full bg-surface-container-low border border-outline-variant/20 focus:border-primary p-3 rounded-xl outline-none" value={editing.badge || ''} onChange={e => setEditing({...editing, badge: e.target.value})} />
          </div>
          
          <div>
            <label className="block text-xs font-bold mb-1 text-on-surface-variant">Ikona (Material Symbols)</label>
            <input type="text" className="w-full bg-surface-container-low border border-outline-variant/20 focus:border-primary p-3 rounded-xl outline-none" value={editing.icon || ''} onChange={e => setEditing({...editing, icon: e.target.value})} />
          </div>
          
          <div>
            <label className="block text-xs font-bold mb-1 text-on-surface-variant">Avatar</label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-outline-variant/20 bg-surface-container-low flex-shrink-0">
                {editing.img ? (
                  <img src={editing.img} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-2xl">person</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/webp,image/png,image/jpeg"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || !editing.id) return;
                    
                    // Convert to base64
                    const reader = new FileReader();
                    reader.onload = async (ev) => {
                      const base64 = ev.target?.result;
                      if (!base64) return;
                      
                      try {
                        const res = await fetch('/api/admin/upload-avatar', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          credentials: 'include',
                          body: JSON.stringify({ id: editing.id, image: base64 })
                        });
                        const data = await res.json();
                        if (res.ok && data.url) {
                          setEditing({...editing, img: data.url});
                        } else {
                          console.error('Upload failed:', res.status, data);
                          alert(data.error || 'Błąd zapisu avatara (status: ' + res.status + ')');
                        }
                      } catch (err) {
                        console.error('Upload error:', err);
                        alert('Błąd wysyłania pliku: ' + (err instanceof Error ? err.message : String(err)));
                      }
                    };
                    reader.readAsDataURL(file);
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-surface-container-high hover:bg-surface-variant text-on-surface px-3 py-2 rounded-xl text-xs font-bold border border-outline-variant/20 transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">upload</span>
                  Wybierz plik
                </button>
                {editing.img && (
                  <button
                    type="button"
                    onClick={() => setEditing({...editing, img: ''})}
                    className="ml-2 text-xs text-error hover:underline"
                  >
                    Usuń
                  </button>
                )}
                <p className="text-[10px] text-on-surface-variant mt-1">WebP, PNG lub JPG. Zostanie zapisany jako /avatars/{editing.id || 'nazwa'}.webp</p>
              </div>
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs font-bold mb-1 text-on-surface-variant">Wiadomość Powitalna (init_msg)</label>
            <textarea className="w-full bg-surface-container-low border border-outline-variant/20 focus:border-primary p-3 rounded-xl outline-none" rows={2} value={editing.init_msg || ''} onChange={e => setEditing({...editing, init_msg: e.target.value})} />
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs font-bold mb-1 text-on-surface-variant">System Prompt (Instrukcja dla modelu)</label>
            <textarea className="w-full bg-surface-container-low border border-outline-variant/20 focus:border-primary p-3 rounded-xl outline-none custom-scrollbar" rows={6} value={editing.system_prompt || ''} onChange={e => setEditing({...editing, system_prompt: e.target.value})} />
          </div>

          <div className="col-span-1 md:col-span-2 mt-2">
            <label className="block text-xs font-bold mb-1 text-on-surface-variant">Konfiguracja Kolorów (JSON dla Tailwind)</label>
            <textarea className="w-full bg-surface-container-low border border-outline-variant/20 focus:border-primary p-3 rounded-xl outline-none font-mono text-xs custom-scrollbar" rows={4} 
              value={typeof editing.theme_config === 'object' ? JSON.stringify(editing.theme_config, null, 2) : (editing.theme_config || '')} 
              onChange={e => setEditing({...editing, theme_config: e.target.value})} 
              placeholder={`{\n  "colorText": "text-lime-500",\n  "colorBg": "bg-lime-500",\n  "colorBorder": "border-lime-500"\n}`}
            />
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs font-bold mb-1 text-on-surface-variant">Opis / Historia (Giełda Talentów)</label>
            <textarea className="w-full bg-surface-container-low border border-outline-variant/20 focus:border-primary p-3 rounded-xl outline-none custom-scrollbar" rows={3} value={editing.description || ''} onChange={e => setEditing({...editing, description: e.target.value})} placeholder="Historia wykonawcy — skąd pochodzi, co go inspiruje, jaka jest jego misja..." />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs font-bold mb-1 text-on-surface-variant">Mocne strony (Giełda Talentów)</label>
            <textarea className="w-full bg-surface-container-low border border-outline-variant/20 focus:border-primary p-3 rounded-xl outline-none custom-scrollbar" rows={3} value={editing.strengths || ''} onChange={e => setEditing({...editing, strengths: e.target.value})} placeholder="W czym jest najlepszy? Gatunki, style, specjalności — każda w nowej linii..." />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1 text-on-surface-variant">Tytuł w nagłówku (header_title)</label>
            <input type="text" className="w-full bg-surface-container-low border border-outline-variant/20 focus:border-primary p-3 rounded-xl outline-none" value={editing.header_title || ''} onChange={e => setEditing({...editing, header_title: e.target.value})} />
          </div>
          
          <div>
            <label className="block text-xs font-bold mb-1 text-on-surface-variant">Status (header_status)</label>
            <input type="text" className="w-full bg-surface-container-low border border-outline-variant/20 focus:border-primary p-3 rounded-xl outline-none" value={editing.header_status || ''} onChange={e => setEditing({...editing, header_status: e.target.value})} />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs font-bold mb-1 text-on-surface-variant">Myśli podczas generowania (oddzielone średnikiem ; )</label>
            <input type="text" className="w-full bg-surface-container-low border border-outline-variant/20 focus:border-primary p-3 rounded-xl outline-none" value={editing.typing_msg || ''} onChange={e => setEditing({...editing, typing_msg: e.target.value})} placeholder="np: Szukam rymu...; Kminie nad bitem...; Prawie gotowe! 🔥" />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1 text-on-surface-variant">Placeholder pola tekstowego</label>
            <input type="text" className="w-full bg-surface-container-low border border-outline-variant/20 focus:border-primary p-3 rounded-xl outline-none" value={editing.placeholder || ''} onChange={e => setEditing({...editing, placeholder: e.target.value})} />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1 text-on-surface-variant">Gradients (Tailwind classes)</label>
            <input type="text" className="w-full bg-surface-container-low border border-outline-variant/20 focus:border-primary p-3 rounded-xl outline-none font-mono text-xs" value={editing.gradient || ''} onChange={e => setEditing({...editing, gradient: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 text-on-surface-variant">Button Gradient (CSS style)</label>
            <input type="text" className="w-full bg-surface-container-low border border-outline-variant/20 focus:border-primary p-3 rounded-xl outline-none font-mono text-xs" value={editing.button_gradient || ''} onChange={e => setEditing({...editing, button_gradient: e.target.value})} />
          </div>
          
          <div>
            <label className="block text-xs font-bold mb-1 text-on-surface-variant">Model AI</label>
            <select className="w-full bg-surface-container-low border border-outline-variant/20 focus:border-primary p-3 rounded-xl outline-none" value={editing.model_name || 'x-ai/grok-4.20'} onChange={e => setEditing({...editing, model_name: e.target.value})}>
              <option value="x-ai/grok-4-fast">🏆 Grok 4 Fast</option>
              <option value="x-ai/grok-4.20">🥈 Grok 4.20</option>
              <option value="x-ai/grok-4.3">Grok 4.3</option>
              <option value="google/gemini-3.1-pro-preview">Gemini 3.1 Pro</option>
              <option value="google/gemini-3.1-flash-lite">Gemini 3.1 Flash Lite</option>
              <option value="google/gemini-3.5-flash">Gemini 3.5 Flash 🆕</option>
              <option value="deepseek/deepseek-v4-flash">DeepSeek V4 Flash</option>
              <option value="deepseek/deepseek-v4-pro">DeepSeek V4 Pro</option>
              <option value="anthropic/claude-sonnet-4.6">Claude Sonnet 4.6</option>
              <option value="minimax/minimax-m2-her">🎭 Minimax M2-her</option>
              <option value="openrouter/owl-alpha">🦉 Owl Alpha (FREE)</option>
              <option value="mistral/mistral-medium-3.5">Mistral Medium 3.5</option>
              <option value="inclusionai/ring-2.6-1t:free">🔗 Ring-2.6-1T (FREE)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-bold mb-1 text-on-surface-variant">Wersja Suno</label>
            <select className="w-full bg-surface-container-low border border-outline-variant/20 focus:border-primary p-3 rounded-xl outline-none" value={editing.suno_version || 'V5'} onChange={e => setEditing({...editing, suno_version: e.target.value})}>
              <option value="V4">V4</option>
              <option value="V4_5">V4_5</option>
              <option value="V4_5PLUS">V4_5 & V4_5PLUS</option>
              <option value="V4_5ALL">V4_5ALL</option>
              <option value="V5_5">V5_5</option>
              <option value="V5">V5</option>
            </select>
          </div>

          {/* Weirdness & Style Influence — Suno advanced generation params */}
          <div className="col-span-1 md:col-span-2 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-on-surface-variant">
                    <span className="material-symbols-outlined text-[14px] align-middle mr-1">psychology</span>
                    Weirdness
                  </label>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {editing.weirdness_constraint != null ? Number(editing.weirdness_constraint).toFixed(2) : '—'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-on-surface-variant w-8 text-right">0%</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary bg-surface-container-high"
                    value={editing.weirdness_constraint ?? ''}
                    onChange={e => {
                      const val = e.target.value;
                      setEditing({...editing, weirdness_constraint: val === '' ? null : parseFloat(val)});
                    }}
                  />
                  <span className="text-[10px] text-on-surface-variant w-8">100%</span>
                  {editing.weirdness_constraint != null && (
                    <button
                      type="button"
                      onClick={() => setEditing({...editing, weirdness_constraint: null})}
                      className="text-[10px] text-error hover:underline ml-1"
                      title="Reset"
                    >
                      reset
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-on-surface-variant mt-1">Kontroluje kreatywność/nieprzewidywalność (0=bezpiecznie, 1=eksperymentalnie)</p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-on-surface-variant">
                    <span className="material-symbols-outlined text-[14px] align-middle mr-1">tune</span>
                    Style Influence
                  </label>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {editing.style_weight != null ? Number(editing.style_weight).toFixed(2) : '—'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-on-surface-variant w-8 text-right">0%</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary bg-surface-container-high"
                    value={editing.style_weight ?? ''}
                    onChange={e => {
                      const val = e.target.value;
                      setEditing({...editing, style_weight: val === '' ? null : parseFloat(val)});
                    }}
                  />
                  <span className="text-[10px] text-on-surface-variant w-8">100%</span>
                  {editing.style_weight != null && (
                    <button
                      type="button"
                      onClick={() => setEditing({...editing, style_weight: null})}
                      className="text-[10px] text-error hover:underline ml-1"
                      title="Reset"
                    >
                      reset
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-on-surface-variant mt-1">Siła wpływu prompta stylu na generację (0=ignoruj, 1=ściśle przestrzegaj)</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1 text-on-surface-variant">Płeć głosu (Suno)</label>
            <select className="w-full bg-surface-container-low border border-outline-variant/20 focus:border-primary p-3 rounded-xl outline-none" value={editing.vocal_gender || 'auto'} onChange={e => setEditing({...editing, vocal_gender: e.target.value})}>
              <option value="auto">Auto (zależy od tagów)</option>
              <option value="m">👨 Męski</option>
              <option value="f">👩 Żeński</option>
              <option value="duet">👫 Duet (M+Ż)</option>
              <option value="duet_f">👩‍👩‍ Duet (Ż+Ż)</option>
              <option value="duet_m">👨‍👨‍ Duet (M+M)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-bold mb-1 text-on-surface-variant">Głos (ElevenLabs TTS)</label>
            <select 
              className="w-full bg-surface-container-low border border-outline-variant/20 focus:border-primary p-3 rounded-xl outline-none" 
              value={(() => {
                try {
                  const tc = typeof editing.theme_config === 'string' ? JSON.parse(editing.theme_config || '{}') : (editing.theme_config || {});
                  return tc.elevenlabs_voice || '';
                } catch(e) { return ''; }
              })()} 
              onChange={e => {
                try {
                  const tc = typeof editing.theme_config === 'string' ? JSON.parse(editing.theme_config || '{}') : (editing.theme_config || {});
                  tc.elevenlabs_voice = e.target.value || null;
                  setEditing({...editing, theme_config: JSON.stringify(tc, null, 2)});
                } catch(err) { console.error('Invalid theme_config JSON'); }
              }}
            >
              <option value="">— Bez głosu —</option>
              <option value="River">River (Męski)</option>
              <option value="Roger">Roger (Męski - Głęboki)</option>
              <option value="Brian">Brian (Męski - Rezonujący)</option>
              <option value="Eric">Eric (Męski - Pewny siebie)</option>
              <option value="Callum">Callum (Męski - Husky)</option>
              <option value="Liam">Liam (Męski - Energetyczny)</option>
              <option value="Rachel">Rachel (Żeński - Profesjonalny)</option>
              <option value="Aria">Aria (Żeński - Dynamiczny)</option>
              <option value="Sarah">Sarah (Żeński - Spokojny)</option>
              <option value="Laura">Laura (Żeński - Entuzjastyczny)</option>
              <option value="Charlotte">Charlotte (Żeński - Ciepły)</option>
            </select>
          </div>
          
          
          <div>
            <label className="block text-xs font-bold mb-1 text-on-surface-variant">Cena wynajmu (Coins)</label>
            <input type="number" className="w-full bg-surface-container-low border border-outline-variant/20 focus:border-primary p-3 rounded-xl outline-none" value={editing.price_coins || 0} onChange={e => setEditing({...editing, price_coins: parseInt(e.target.value) || 0})} />
          </div>

          <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row gap-4 mt-4">
            <div className="flex items-center gap-3 bg-surface-container-low p-4 rounded-xl border border-outline-variant/10 flex-1">
              <input type="checkbox" id="isActive" checked={editing.is_active !== false} onChange={e => setEditing({...editing, is_active: e.target.checked})} className="w-5 h-5 accent-primary" />
              <label htmlFor="isActive" className="font-bold text-sm cursor-pointer select-none">Aktywny (widoczny na Giełdzie)</label>
            </div>

            <div className="flex items-center gap-3 bg-surface-container-low p-4 rounded-xl border border-outline-variant/10 flex-1">
              <input type="checkbox" id="isOnMainPage" checked={editing.is_on_main_page || false} onChange={e => setEditing({...editing, is_on_main_page: e.target.checked})} className="w-5 h-5 accent-primary" />
              <label htmlFor="isOnMainPage" className="font-bold text-sm cursor-pointer select-none">Pokaż na głównej (Generator)</label>
            </div>

            <div className="flex items-center gap-3 bg-surface-container-low p-4 rounded-xl border border-outline-variant/10 flex-1">
              <label htmlFor="tierSelect" className="font-bold text-sm whitespace-nowrap">Taryfa:</label>
              <select id="tierSelect" className="bg-surface border border-outline-variant/20 focus:border-primary p-2 rounded-lg outline-none text-sm w-full" value={editing.tier || 'basic'} onChange={e => setEditing({...editing, tier: e.target.value})}>
                <option value="basic">Free & Basic</option>
                <option value="vip">VIP</option>
                <option value="legend">Legend</option>
              </select>
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-2 mt-6 pt-6 border-t border-outline-variant/10 flex justify-end gap-3">
            <button type="button" onClick={() => setEditing(null)} className="px-6 py-3 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors">Anuluj</button>
            <button type="submit" className="px-6 py-3 rounded-xl font-bold bg-primary text-on-primary hover:bg-primary-dark transition-colors shadow-lg">Zapisz Wykonawcę</button>
          </div>
        </form>
      </div>
    );
  }

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedProducers = [...producers].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const SortHeader = ({ label, column, align = 'left' }: { label: string, column: string, align?: 'left' | 'center' | 'right' }) => (
    <th className={`px-6 py-4 font-bold text-sm text-on-surface-variant uppercase tracking-wider cursor-pointer hover:bg-surface-container transition-colors select-none group text-${align}`} onClick={() => handleSort(column)}>
      <div className={`flex items-center gap-1 ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'}`}>
        {label}
        <span className={`material-symbols-outlined text-[16px] transition-opacity ${sortConfig.key === column ? 'opacity-100 text-primary' : 'opacity-20 group-hover:opacity-50'}`}>
          {sortConfig.key === column && sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward'}
        </span>
      </div>
    </th>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-headline">Zarządzanie Wykonawcami</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => { setLoading(true); fetchProducers(); }} disabled={loading} className="bg-surface-container-high hover:bg-surface-variant text-on-surface px-3 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors border border-outline-variant/20 disabled:opacity-50">
            <span className="material-symbols-outlined text-[18px]" style={loading ? { animation: 'spin 1s linear infinite' } : {}}>refresh</span> Aktualizuj
          </button>
          <button onClick={() => setEditing({ _isNew: true, is_active: true, is_on_main_page: false, tier: 'basic', price_coins: 0, model_name: 'x-ai/grok-4.20', suno_version: 'V5_5', theme_config: '{\n  "colorText": "text-lime-500",\n  "colorBg": "bg-lime-500",\n  "colorBorder": "border-lime-500"\n}' })} className="bg-primary hover:bg-primary-dark text-on-primary px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-[18px]">add</span> Dodaj Wykonawcę
          </button>
        </div>
      </div>
      
      <div className="bg-surface rounded-2xl border border-outline-variant/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/10">
                <SortHeader label="Wykonawca" column="name" />
                <SortHeader label="Cena / Status" column="price_coins" />
                <SortHeader label="Taryfa" column="tier" align="center" />
                <SortHeader label="Aktywność" column="is_active" align="center" />
                <SortHeader label="Data utworzenia" column="created_at" />
                <th className="px-6 py-4 font-bold text-sm text-on-surface-variant uppercase tracking-wider text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {sortedProducers.map(p => {
                const date = new Date(p.created_at);
                const isToday = new Date().toDateString() === date.toDateString();
                const displayDate = isToday 
                  ? `Dzisiaj, ${date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}`
                  : date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' });
                
                return (
                  <tr key={p.id} className={`hover:bg-surface-container-lowest transition-colors ${!p.is_active ? 'opacity-70 grayscale-[30%]' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-outline-variant/20 shadow-sm flex-shrink-0">
                          <img src={p.img ? `${p.img}${p.img.includes('?') ? '&' : '?'}v=${cacheBuster}` : ''} alt={p.name} className="w-full h-full object-cover" onError={(e) => e.currentTarget.src = 'https://placehold.co/100?text=?'} />
                        </div>
                        <div>
                          <h3 className="font-bold text-base headline-font">{p.name}</h3>
                          <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-label mt-0.5">{p.badge}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="text-xs font-bold bg-surface-container px-2 py-1 rounded-md text-on-surface">
                          {p.price_coins === 0 ? 'DARMOWY' : `${p.price_coins} monet`}
                        </span>
                        {!p.is_active && <span className="text-[10px] font-bold text-error bg-error/10 px-2 py-0.5 rounded-md">UKRYTY</span>}
                        {p.is_on_main_page && <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">MAIN</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                         p.tier === 'legend' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 
                         p.tier === 'vip' ? 'bg-purple-500/20 text-purple-500 border border-purple-500/30' : 
                         'bg-surface-container text-on-surface-variant'
                       }`}>
                         {p.tier ? p.tier.toUpperCase() : 'BASIC'}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2 items-center">
                        <div className="flex items-center gap-1.5 text-on-surface" title="Wygenerowane utwory">
                          <span className="material-symbols-outlined text-[16px] text-primary" style={{fontVariationSettings: "'FILL' 1"}}>music_note</span>
                          <span className="text-sm font-bold">{p.stats?.tracks_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-on-surface-variant" title="Suma reakcji użytkowników">
                          <span className="material-symbols-outlined text-[14px] text-pink-500" style={{fontVariationSettings: "'FILL' 1"}}>favorite</span>
                          <span className="text-xs font-bold">{p.stats?.total_likes || 0}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-on-surface-variant whitespace-nowrap">{displayDate}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditing(p)} className="p-2 hover:bg-surface-container-high rounded-lg transition-colors text-on-surface" title="Edytuj">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors" title="Usuń">
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {producers.length === 0 && (
           <div className="p-12 text-center flex flex-col items-center">
             <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
               <span className="material-symbols-outlined text-4xl">group_off</span>
             </div>
             <h3 className="text-xl font-bold mb-2">Brak wykonawców</h3>
             <p className="text-on-surface-variant max-w-sm mb-6">Wypełnij giełdę talentów pierwszymi agentami, by użytkownicy mogli z nich korzystać.</p>
             <button onClick={() => setEditing({ _isNew: true, is_active: true, is_on_main_page: false, tier: 'basic', price_coins: 0, model_name: 'x-ai/grok-4.20', suno_version: 'V5_5', theme_config: '{\n  "colorText": "text-lime-500",\n  "colorBg": "bg-lime-500",\n  "colorBorder": "border-lime-500"\n}' })} className="bg-surface-container-high hover:bg-surface-variant text-on-surface px-6 py-3 rounded-xl font-bold text-sm transition-colors">
               Dodaj pierwszego
             </button>
           </div>
        )}
      </div>
    </div>
  );
}

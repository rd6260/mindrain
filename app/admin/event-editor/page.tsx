'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────

type EventRow = { id: string; title: string; code_name: string };

type EventBrief = {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  url: string;
  created_at: string;
};

type Action = 'brief' | null;

const BRIEF_BUCKET = 'competition_brief';

const ACTIONS: { key: Exclude<Action, null>; label: string }[] = [
  { key: 'brief', label: 'Edit event brief' },
];

const inputCls =
  'w-full px-4 py-2.5 bg-white border border-[#D0CEC2] rounded-xl outline-none focus:border-[#2C5F5F] focus:ring-2 focus:ring-[#2C5F5F]/10';

// Public URL -> object path inside the bucket (null if the file isn't ours, e.g. an external link).
const storagePathFromUrl = (url: string): string | null => {
  const marker = `/object/public/${BRIEF_BUCKET}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length));
};

const safeFileName = (name: string) => name.replace(/[^a-zA-Z0-9._-]+/g, '_');

// ─── Brief editor ─────────────────────────────────────────────────────────────

function BriefEditor({ event }: { event: EventRow }) {
  const supabase = createClient();

  const [briefs, setBriefs] = useState<EventBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // editingId === 'new' -> add form; a brief id -> editing that row; null -> closed
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('event_briefs')
      .select('*')
      .eq('event_id', event.id)
      .order('created_at', { ascending: true });
    if (error) setError(error.message);
    setBriefs((data as EventBrief[]) ?? []);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.id]);

  useEffect(() => {
    setEditingId(null);
    load();
  }, [load]);

  const openForm = (brief?: EventBrief) => {
    setEditingId(brief?.id ?? 'new');
    setName(brief?.name ?? '');
    setDescription(brief?.description ?? '');
    setUrl(brief?.url ?? '');
    setFile(null);
    setError(null);
  };

  const closeForm = () => {
    setEditingId(null);
    setFile(null);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Name is required');
    if (!file && !url.trim()) return setError('Upload a file or provide a URL');

    setSaving(true);
    setError(null);
    try {
      const existing = briefs.find(b => b.id === editingId);
      let finalUrl = url.trim();
      let uploadedPath: string | null = null;

      if (file) {
        uploadedPath = `${event.id}/${Date.now()}-${safeFileName(file.name)}`;
        const { error: upErr } = await supabase.storage.from(BRIEF_BUCKET).upload(uploadedPath, file);
        if (upErr) throw upErr;
        finalUrl = supabase.storage.from(BRIEF_BUCKET).getPublicUrl(uploadedPath).data.publicUrl;
      }

      const payload = { name: name.trim(), description: description.trim() || null, url: finalUrl };
      const { error: dbErr } = existing
        ? await supabase.from('event_briefs').update(payload).eq('id', existing.id)
        : await supabase.from('event_briefs').insert({ ...payload, event_id: event.id });

      if (dbErr) {
        // don't leave an orphaned upload behind
        if (uploadedPath) await supabase.storage.from(BRIEF_BUCKET).remove([uploadedPath]);
        throw dbErr;
      }

      // replaced file: clean up the old one if we own it
      if (existing && uploadedPath) {
        const old = storagePathFromUrl(existing.url);
        if (old) await supabase.storage.from(BRIEF_BUCKET).remove([old]);
      }

      closeForm();
      await load();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (brief: EventBrief) => {
    if (!window.confirm(`Delete "${brief.name}"? This also removes the uploaded file.`)) return;
    setError(null);
    const { error: dbErr } = await supabase.from('event_briefs').delete().eq('id', brief.id);
    if (dbErr) return setError(dbErr.message);
    const path = storagePathFromUrl(brief.url);
    if (path) await supabase.storage.from(BRIEF_BUCKET).remove([path]);
    await load();
  };

  return (
    <div className="bg-[#F8F7F2] border border-[#D0CEC2] rounded-2xl p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-[#1A1A1A]">Event brief</h2>
          <p className="text-sm text-[#6B6B6B]">{event.title}</p>
        </div>
        {editingId === null && (
          <button
            onClick={() => openForm()}
            className="px-4 py-2 bg-[#2C5F5F] text-white rounded-xl text-sm font-bold hover:bg-[#1A4D4D] transition-colors"
          >
            + Add file
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-[#C85D3E]/10 text-[#C85D3E] text-sm font-medium">{error}</div>
      )}

      {editingId !== null && (
        <form onSubmit={save} className="mb-5 p-4 bg-white border border-[#D0CEC2] rounded-xl space-y-3">
          <h3 className="font-bold text-[#1A1A1A]">{editingId === 'new' ? 'Add brief file' : 'Edit brief file'}</h3>
          <input className={inputCls} placeholder="Name (e.g. Complete Brief)" value={name} onChange={e => setName(e.target.value)} />
          <input className={inputCls} placeholder="Description (e.g. Full competition brief document)" value={description} onChange={e => setDescription(e.target.value)} />
          <div>
            <label className="block text-xs font-medium text-[#6B6B6B] mb-1">
              Upload file (stored in {BRIEF_BUCKET}/{event.id}/)
            </label>
            <input
              type="file"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-[#6B6B6B] file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-[#EDEBDF] file:text-[#1A1A1A] file:font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B6B6B] mb-1">
              {file ? 'URL (will be set from the upload)' : 'Or an external URL'}
            </label>
            <input className={inputCls} placeholder="https://..." value={file ? '' : url} disabled={!!file} onChange={e => setUrl(e.target.value)} />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-[#2C5F5F] text-white rounded-xl text-sm font-bold hover:bg-[#1A4D4D] disabled:opacity-50 transition-colors">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={closeForm} disabled={saving} className="px-4 py-2 border border-[#D0CEC2] rounded-xl text-sm font-medium text-[#1A1A1A] hover:bg-[#EDEBDF] transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-[#6B6B6B]">Loading…</p>
      ) : briefs.length === 0 ? (
        <p className="text-sm text-[#6B6B6B]">No brief files yet for this event.</p>
      ) : (
        <ul className="divide-y divide-[#D0CEC2]">
          {briefs.map(b => (
            <li key={b.id} className="py-3 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold text-[#1A1A1A]">{b.name}</p>
                {b.description && <p className="text-sm text-[#6B6B6B]">{b.description}</p>}
                <a href={b.url} target="_blank" rel="noreferrer" className="text-xs text-[#2C5F5F] underline break-all">
                  {b.url}
                </a>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openForm(b)} className="px-3 py-1.5 border border-[#D0CEC2] rounded-lg text-sm hover:bg-[#EDEBDF] transition-colors">Edit</button>
                <button onClick={() => remove(b)} className="px-3 py-1.5 border border-[#C85D3E]/40 text-[#C85D3E] rounded-lg text-sm hover:bg-[#C85D3E]/10 transition-colors">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EventEditorPage() {
  const supabase = createClient();

  const [events, setEvents] = useState<EventRow[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [action, setAction] = useState<Action>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('id, title, code_name')
      .order('created_at', { ascending: false });
    if (error) return setError(error.message);
    setEvents((data as EventRow[]) ?? []);
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedEvent = events.find(e => e.id === selectedEventId) ?? null;

  return (
    <div className="min-h-screen bg-[#EDEBDF] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">Event management</h1>

        {error && <div className="px-4 py-2.5 rounded-xl bg-[#C85D3E]/10 text-[#C85D3E] text-sm font-medium">{error}</div>}

        {/* Event select */}
        <div>
          <label className="block text-sm font-medium text-[#6B6B6B] mb-1.5">Event</label>
          <select
            value={selectedEventId}
            onChange={e => {
              setSelectedEventId(e.target.value);
              setAction(null);
            }}
            className={inputCls}
          >
            <option value="">Select an event…</option>
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        {selectedEvent && (
          <div className="flex flex-wrap gap-3">
            {ACTIONS.map(a => (
              <button
                key={a.key}
                onClick={() => setAction(a.key)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-colors ${
                  action === a.key
                    ? 'bg-[#2C5F5F] text-white border-[#2C5F5F]'
                    : 'bg-[#F8F7F2] text-[#1A1A1A] border-[#D0CEC2] hover:bg-white'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        )}

        {selectedEvent && action === 'brief' && <BriefEditor event={selectedEvent} />}
      </div>
    </div>
  );
}

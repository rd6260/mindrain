'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FUNCTION_FOLLOWS_FORM } from '@/config/projects';
import { fffLorPath } from '@/lib/projects/functionFollowsForm';

const MAX_LOR_BYTES = 5 * 1024 * 1024;

/**
 * Shown on the profile once the applicant is approved at the interview stage:
 * the Letter of Recommendation is mandatory from here on.
 */
export default function FunctionFollowsFormLor({
  registrationId,
  hasLor,
  onUploaded,
}: {
  registrationId: string;
  hasLor: boolean;
  onUploaded: (lorPath: string) => void;
}) {
  const supabase = createClient();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setError(null);
    if (f && f.type !== 'application/pdf') { setError('The LOR must be a PDF'); e.target.value = ''; setFile(null); return; }
    if (f && f.size > MAX_LOR_BYTES) { setError('The LOR must be under 5MB'); e.target.value = ''; setFile(null); return; }
    setFile(f);
  };

  const upload = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please log in again');

      const path = fffLorPath(user.id);
      const { error: upErr } = await supabase.storage
        .from(FUNCTION_FOLLOWS_FORM.formUploadBucket)
        .upload(path, file, { upsert: true, contentType: 'application/pdf' });
      if (upErr) throw upErr;

      const res = await fetch('/api/v3/fff/lor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration_id: registrationId }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Failed to save Letter of Recommendation');

      setFile(null);
      onUploaded(body.lor_path);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="mt-4 rounded-lg border p-4"
      style={{ backgroundColor: '#FFFFFF', borderColor: hasLor ? '#E5E3D7' : '#D97757' }}
    >
      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: hasLor ? '#2D5F4F' : '#C04B2B' }}>
        {hasLor ? 'Letter of Recommendation ✓' : 'Action required: upload your LOR'}
      </p>
      <p className="text-xs mt-1 mb-3" style={{ color: '#6B6B6B' }}>
        {hasLor
          ? 'Your Letter of Recommendation has been received. You can upload a new PDF to replace it.'
          : 'Congratulations on clearing the interview! A Letter of Recommendation from an Architectural Design faculty member who has taught you is now mandatory to continue. Upload it as a PDF (max 5MB), preferably on official college letterhead with the faculty member’s name, designation, institutional email and signature.'}
      </p>

      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <input
          type="file"
          accept="application/pdf"
          onChange={pick}
          disabled={busy}
          className="text-xs file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-[#EDEBDF] file:text-[#1A1A1A] file:font-medium"
        />
        <button
          onClick={upload}
          disabled={!file || busy}
          className="px-4 py-2 rounded-lg text-xs font-bold text-white disabled:opacity-40 transition-opacity"
          style={{ backgroundColor: '#2C5F5F' }}
        >
          {busy ? 'Uploading…' : hasLor ? 'Replace LOR' : 'Upload LOR'}
        </button>
      </div>
      {error && <p className="text-xs mt-2 font-medium" style={{ color: '#C85D3E' }}>{error}</p>}
    </div>
  );
}

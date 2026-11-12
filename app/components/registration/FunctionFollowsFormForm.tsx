'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FUNCTION_FOLLOWS_FORM } from '@/config/projects';
import {
  FFF_ACADEMIC_YEARS, FFF_ANSWER_MAX_LENGTH, FFF_QUESTION_KEYS, FFF_QUESTIONS as QUESTIONS, fffLorPath,
  FFF_DOCUMENT_MAX_BYTES, FFF_DOCUMENT_MAX_COUNT, FFF_DOCUMENT_TYPES, fffDocumentsFolder, type FffDocument,
} from '@/lib/projects/functionFollowsForm';
import { FloatingInput } from './ui';
import type { RegistrationFormProps } from './types';

const MAX_LOR_BYTES = 5 * 1024 * 1024;

const safeFileName = (name: string) => name.replace(/[^a-zA-Z0-9._-]+/g, '_');
const formatSize = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(2)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

export default function FunctionFollowsFormForm({ initialData, onSubmit }: RegistrationFormProps) {
  const supabase = createClient();
  const fd = initialData ?? {};

  const [answers, setAnswers] = useState<Record<string, string>>(
    Object.fromEntries(FFF_QUESTION_KEYS.map(k => [k, (fd[k] as string) || '']))
  );
  const [name, setName] = useState<string>(fd.name || '');
  const [email, setEmail] = useState<string>(fd.email || '');
  const [whatsapp, setWhatsapp] = useState<string>(fd.whatsapp || '');
  const [academicYear, setAcademicYear] = useState<string>(fd.academic_year || '');
  const [college, setCollege] = useState<string>(fd.college || '');
  const [lorFile, setLorFile] = useState<File | null>(null);
  const existingLorPath: string | null = fd.lor_path || null;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Documents & undertakings: already-saved ones, plus newly picked files uploaded on submit.
  const [savedDocs, setSavedDocs] = useState<FffDocument[]>(Array.isArray(fd.documents) ? fd.documents : []);
  const [newDocs, setNewDocs] = useState<File[]>([]);
  const [docError, setDocError] = useState<string | null>(null);

  // Prefill name + email from the user's profile / login, unless a saved application already has them.
  useEffect(() => {
    if (fd.name && fd.email) return;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: info } = await supabase.from('user_info').select('name').eq('id', user.id).maybeSingle();
      setName(prev => prev || info?.name || '');
      setEmail(prev => prev || user.email || '');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The LOR is optional here; it is required later if the applicant is approved at the interview stage.
  const canSubmit =
    name.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    /^\+[0-9][0-9\s-]{6,17}$/.test(whatsapp.trim()) &&
    academicYear && college.trim() &&
    FFF_QUESTION_KEYS.every(k => answers[k].trim());

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) { setLorFile(null); return; }
    if (file.type !== 'application/pdf') {
      setError('Letter of Recommendation must be a PDF'); e.target.value = ''; setLorFile(null); return;
    }
    if (file.size > MAX_LOR_BYTES) {
      setError('Letter of Recommendation must be under 5MB'); e.target.value = ''; setLorFile(null); return;
    }
    setError(null);
    setLorFile(file);
  };

  const handleDocs = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = '';
    setDocError(null);
    const accepted: File[] = [];
    for (const f of picked) {
      if (!(FFF_DOCUMENT_TYPES as readonly string[]).includes(f.type)) {
        setDocError(`"${f.name}" must be a PDF or an image (JPG, PNG, WebP)`); continue;
      }
      if (f.size > FFF_DOCUMENT_MAX_BYTES) {
        setDocError(`"${f.name}" is larger than 1MB`); continue;
      }
      accepted.push(f);
    }
    if (savedDocs.length + newDocs.length + accepted.length > FFF_DOCUMENT_MAX_COUNT) {
      setDocError(`You can attach at most ${FFF_DOCUMENT_MAX_COUNT} documents`);
      return;
    }
    setNewDocs(prev => [...prev, ...accepted]);
  };

  const handleSubmit = async () => {
    if (!canSubmit) { setError('Please complete all required fields'); return; }
    setIsLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let lorPath = existingLorPath;
      if (lorFile) {
        // Layout: <event>/<uid>/<file>. Bucket RLS checks the 2nd folder equals the user's id.
        // Fixed filename + upsert: re-submitting replaces the file instead of leaving orphans.
        const path = fffLorPath(user.id);
        const { error: uploadError } = await supabase.storage
          .from(FUNCTION_FOLLOWS_FORM.formUploadBucket)
          .upload(path, lorFile, { upsert: true, contentType: 'application/pdf' });
        if (uploadError) throw uploadError;
        lorPath = path;
      }

      // Upload newly picked documents; keep the ones that were already saved.
      const uploaded: FffDocument[] = [];
      try {
        for (const f of newDocs) {
          const path = `${fffDocumentsFolder(user.id)}/${Date.now()}-${uploaded.length}-${safeFileName(f.name)}`;
          const { error: docUpErr } = await supabase.storage
            .from(FUNCTION_FOLLOWS_FORM.formUploadBucket)
            .upload(path, f, { contentType: f.type });
          if (docUpErr) throw docUpErr;
          uploaded.push({ name: f.name, path, size: f.size, type: f.type });
        }

        await onSubmit({
          name: name.trim(),
          email: email.trim(),
          whatsapp: whatsapp.trim(),
          academic_year: academicYear,
          college: college.trim(),
          ...Object.fromEntries(FFF_QUESTION_KEYS.map(k => [k, answers[k].trim()])),
          lor_path: lorPath,
          documents: [...savedDocs, ...uploaded],
        });
      } catch (err) {
        // Don't leave orphaned uploads behind when the save failed.
        if (uploaded.length) {
          await supabase.storage.from(FUNCTION_FOLLOWS_FORM.formUploadBucket).remove(uploaded.map(d => d.path));
        }
        throw err;
      }

      // Saved: delete files the applicant removed from their application.
      const kept = new Set(savedDocs.map(d => d.path));
      const removed = (Array.isArray(fd.documents) ? (fd.documents as FffDocument[]) : []).filter(d => !kept.has(d.path));
      if (removed.length) {
        await supabase.storage.from(FUNCTION_FOLLOWS_FORM.formUploadBucket).remove(removed.map(d => d.path));
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Intro */}
      <div className="mb-6 p-6 rounded-2xl border border-[#2C5F5F]/20 bg-[#2C5F5F]/5">
        <h2 className="text-lg font-bold text-[#1A1A1A] mb-3">Before You Begin...</h2>
        <div className="space-y-2 text-sm text-[#4B4B4B] leading-relaxed">
          <p>We are not looking for perfect designers or perfect answers.</p>
          <p>We want to understand how you think, what inspires you, what challenges you, and how willing you are to explore beyond what you already know.</p>
          <p>There are no right or wrong answers. Be honest, be thoughtful, and let us understand the designer behind the drawings.</p>
          <p>Take your time. We are interested in your perspective, not just your presentation.</p>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-4 bg-[#C85D3E]/10 border border-[#C85D3E]/30 rounded-xl flex items-start gap-3">
          <span className="text-[#C85D3E] text-lg mt-0.5">⚠</span>
          <p className="text-[#C85D3E] text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2] p-6 space-y-7">
        <div>
          <p className="text-sm font-semibold text-[#1A1A1A] mb-3">Your Details</p>
          <div className="space-y-3">
            <FloatingInput label="Full name" value={name} onChange={e => setName(e.target.value)} disabled={isLoading} />
            <div>
              <FloatingInput label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} disabled={isLoading} />
              <p className="text-xs text-[#6B6B6B] mt-1.5">All communication and notifications about your application will be sent to this email.</p>
            </div>
            <div>
              <FloatingInput label="WhatsApp number with country code (e.g. +91 98765 43210)" type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} disabled={isLoading} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="relative block w-full">
                <select value={academicYear} onChange={e => setAcademicYear(e.target.value)} disabled={isLoading}
                  className="w-full px-4 pt-6 pb-2 text-[#1A1A1A] bg-[#F8F7F2] border border-[#D0CEC2] rounded-xl outline-none text-sm font-medium focus:border-[#2C5F5F] focus:ring-2 focus:ring-[#2C5F5F]/10 disabled:opacity-50">
                  <option value="" disabled>Select</option>
                  {FFF_ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <span className="absolute left-4 top-2 text-xs font-semibold text-[#6B6B6B] pointer-events-none">Academic year</span>
              </label>
              <FloatingInput label="College name" value={college} onChange={e => setCollege(e.target.value)} disabled={isLoading} />
            </div>
          </div>
        </div>

        <div className="border-t border-[#E5E3D7]" />

        {FFF_QUESTION_KEYS.map((key, i) => (
          <div key={key}>
            <label htmlFor={`fff-${key}`} className="block text-sm font-semibold text-[#1A1A1A] leading-relaxed mb-2">
              <span className="font-mono text-[#2C5F5F] mr-2">{String(i + 1).padStart(2, '0')}.</span>
              {QUESTIONS[key]}
            </label>
            <textarea
              id={`fff-${key}`}
              value={answers[key]}
              onChange={e => setAnswers({ ...answers, [key]: e.target.value })}
              disabled={isLoading}
              maxLength={FFF_ANSWER_MAX_LENGTH}
              rows={5}
              className="w-full px-4 py-3 text-sm text-[#1A1A1A] bg-white border border-[#D0CEC2] rounded-xl outline-none transition-all duration-200 focus:border-[#2C5F5F] focus:ring-2 focus:ring-[#2C5F5F]/10 disabled:opacity-50 resize-y"
            />
            <p className="text-[10px] text-[#8B8B8B] text-right mt-1">
              {answers[key].length}/{FFF_ANSWER_MAX_LENGTH}
            </p>
          </div>
        ))}

        <div>
          <p className="text-sm font-semibold text-[#1A1A1A] mb-2">
            <span className="font-mono text-[#2C5F5F] mr-2">07.</span>
            Letter of Recommendation <span className="text-[#6B6B6B]">(Optional)</span>
          </p>
          <p className="text-sm text-[#4B4B4B] leading-relaxed mb-3">
            Upload a Letter of Recommendation (LOR) from an Architectural Design faculty member who has taught you in a previous or current semester.
            You can skip this for now, but it becomes mandatory if you are selected after the interview round. You will be able to upload it from your profile page.
          </p>
          <div className="text-xs text-[#6B6B6B] leading-relaxed mb-4 p-4 bg-white rounded-xl border border-[#E5E3D7]">
            <p className="font-bold uppercase tracking-wider mb-1.5">Submission requirements</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Upload the letter in PDF format.</li>
              <li>The letter should preferably be on official college letterhead.</li>
              <li>It must include the faculty member&apos;s name, designation, institutional email address, and signature.</li>
            </ul>
          </div>
          <FloatingInput label="Upload LOR (PDF, max 5MB)" type="file" accept="application/pdf" onChange={handleFile} disabled={isLoading} />
          {existingLorPath && !lorFile && (
            <p className="text-xs text-[#2D5F4F] mt-2 font-medium">✓ Letter of Recommendation uploaded — choose a file above to replace it</p>
          )}
        </div>

        <div className="border-t border-[#E5E3D7]" />

        <div>
          <p className="text-sm font-semibold text-[#1A1A1A] mb-2">
            <span className="font-mono text-[#2C5F5F] mr-2">08.</span>
            Documents and Undertakings <span className="text-[#6B6B6B]">(Optional)</span>
          </p>
          <p className="text-sm text-[#4B4B4B] leading-relaxed mb-3">
            Attach any supporting documents or signed undertakings. You can add multiple files. Each file must be a PDF or an image
            (JPG, PNG, WebP) under 1MB, up to {FFF_DOCUMENT_MAX_COUNT} files in total.
          </p>

          {(savedDocs.length > 0 || newDocs.length > 0) && (
            <ul className="mb-3 space-y-2">
              {savedDocs.map(d => (
                <li key={d.path} className="flex items-center justify-between gap-3 px-3 py-2 bg-white rounded-xl border border-[#E5E3D7] text-sm">
                  <span className="truncate text-[#1A1A1A]">
                    <span className="text-[#2D5F4F] mr-1">✓</span>{d.name}
                    <span className="text-xs text-[#8B8B8B] ml-2">{formatSize(d.size)}</span>
                  </span>
                  <button type="button" disabled={isLoading}
                    onClick={() => setSavedDocs(prev => prev.filter(x => x.path !== d.path))}
                    className="text-xs font-semibold text-[#C85D3E] hover:underline shrink-0 disabled:opacity-50">
                    Remove
                  </button>
                </li>
              ))}
              {newDocs.map((f, i) => (
                <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-3 px-3 py-2 bg-white rounded-xl border border-dashed border-[#2C5F5F]/40 text-sm">
                  <span className="truncate text-[#1A1A1A]">
                    {f.name}
                    <span className="text-xs text-[#8B8B8B] ml-2">{formatSize(f.size)} · uploads on submit</span>
                  </span>
                  <button type="button" disabled={isLoading}
                    onClick={() => setNewDocs(prev => prev.filter((_, idx) => idx !== i))}
                    className="text-xs font-semibold text-[#C85D3E] hover:underline shrink-0 disabled:opacity-50">
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          <FloatingInput label="Add documents (PDF or image, max 1MB each)" type="file" multiple
            accept="application/pdf,image/jpeg,image/png,image/webp" onChange={handleDocs} disabled={isLoading} />
          {docError && <p className="text-xs text-[#C85D3E] mt-2 font-medium">{docError}</p>}
        </div>

        <div className="border-t border-[#E5E3D7]" />

        <div>
          <button onClick={handleSubmit} disabled={!canSubmit || isLoading}
            className={`w-full py-4 rounded-xl text-sm font-bold tracking-wide transition-all duration-200
              ${canSubmit && !isLoading
                ? 'bg-[#2C5F5F] text-white hover:bg-[#1A4D4D] shadow-lg shadow-[#2C5F5F]/20 hover:shadow-xl hover:-translate-y-0.5'
                : 'bg-[#D0CEC2] text-[#8B8B8B] cursor-not-allowed'
              }`}>
            {isLoading
              ? <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              : 'Submit Application →'
            }
          </button>
          {!canSubmit && !isLoading && (
            <p className="text-xs text-[#8B8B8B] text-center mt-2">Fill in your details and answer all questions to continue</p>
          )}
        </div>
      </div>
    </>
  );
}

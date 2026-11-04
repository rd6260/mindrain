'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FUNCTION_FOLLOWS_FORM } from '@/config/projects';
import { FFF_ANSWER_MAX_LENGTH, FFF_QUESTION_KEYS } from '@/lib/projects/functionFollowsForm';
import { FloatingInput } from './ui';
import type { RegistrationFormProps } from './types';

const QUESTIONS: Record<(typeof FFF_QUESTION_KEYS)[number], string> = {
  excitement:
    'What excites you most about the possibility of being part of this workshop? What would you like to learn, experience, or discover during these nine days?',
  motivation:
    'Why do you want to be a part of Function Follows Form? What do you hope to experience here that you might not encounter in your regular architectural education?',
  strength:
    'What do you believe is your strongest quality as an architectural designer? How does it reflect in the way you observe, imagine, or approach design problems?',
  challenge:
    'Every designer has areas they wish to explore and improve. What do you find most challenging about architectural design, and what would you like to become better at?',
  first_driver:
    'When approaching a new design problem, what usually drives your first thought — function, form, concept, context, or something entirely different? Tell us why.',
  openness:
    'Architecture often requires questioning your own ideas, stepping outside familiar approaches, and starting over. How open are you to challenging your existing design beliefs and exploring possibilities you may not have considered before?',
};

const MAX_LOR_BYTES = 5 * 1024 * 1024;

export default function FunctionFollowsFormForm({ initialData, onSubmit }: RegistrationFormProps) {
  const supabase = createClient();
  const fd = initialData ?? {};

  const [answers, setAnswers] = useState<Record<string, string>>(
    Object.fromEntries(FFF_QUESTION_KEYS.map(k => [k, (fd[k] as string) || '']))
  );
  const [lorFile, setLorFile] = useState<File | null>(null);
  const existingLorPath: string | null = fd.lor_path || null;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    FFF_QUESTION_KEYS.every(k => answers[k].trim()) && (!!lorFile || !!existingLorPath);

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
        const path = `${FUNCTION_FOLLOWS_FORM.slug}/${user.id}/letter_of_recommendation.pdf`;
        const { error: uploadError } = await supabase.storage
          .from(FUNCTION_FOLLOWS_FORM.formUploadBucket)
          .upload(path, lorFile, { upsert: true, contentType: 'application/pdf' });
        if (uploadError) throw uploadError;
        lorPath = path;
      }

      await onSubmit({
        ...Object.fromEntries(FFF_QUESTION_KEYS.map(k => [k, answers[k].trim()])),
        lor_path: lorPath,
      });
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
            Letter of Recommendation <span className="text-[#C85D3E]">(Mandatory)</span>
          </p>
          <p className="text-sm text-[#4B4B4B] leading-relaxed mb-3">
            Upload a Letter of Recommendation (LOR) from an Architectural Design faculty member who has taught you in a previous or current semester.
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
            <p className="text-xs text-[#8B8B8B] text-center mt-2">Answer all questions and upload your LOR to continue</p>
          )}
        </div>
      </div>
    </>
  );
}

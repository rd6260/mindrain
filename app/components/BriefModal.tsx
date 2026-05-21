'use client';

import { useEffect, useState } from 'react';
import { Changa } from 'next/font/google';
import { createClient } from '@/lib/supabase/client';
import { getCompetition } from '@/data/competitionBriefFiles';
import { colors } from '@/utils/colors';

const changa = Changa({ subsets: ['latin'], weight: ['500'] });

// ─── Types ────────────────────────────────────────────────────────────────────

type AuthState = 'loading' | 'guest' | 'user';
type EmailState = 'idle' | 'sending' | 'sent' | 'error';

interface BriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const downloadFile = (url: string) => {
  const a = document.createElement('a');
  a.href = url;
  a.download = decodeURIComponent(url.split('/').pop() ?? 'file.pdf');
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

// ─── Guest View: Email Capture ────────────────────────────────────────────────

function GuestView({
  eventId,
  competitionTitle,
  onClose,
}: {
  eventId: string;
  competitionTitle: string;
  onClose: () => void;
}) {
  const [email, setEmail] = useState('');
  const [emailState, setEmailState] = useState<EmailState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSend = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setEmailState('sending');
    setErrorMsg('');
    try {
      const res = await fetch('/api/send-brief-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, eventId }),
      });
      if (!res.ok) throw new Error('Failed');
      setEmailState('sent');
    } catch {
      setEmailState('error');
      setErrorMsg('Something went wrong. Please try again.');
    }
  };

  if (emailState === 'sent') {
    return (
      <>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className={`${changa.className} text-xl uppercase tracking-tight text-gray-950`}>
              Brief Sent!
            </h2>
            <p className="text-xs text-gray-600 mt-0.5">{competitionTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-8 text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-green-50">
            <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            We&apos;ve sent the brief documents to{' '}
            <span className="font-semibold text-gray-900">{email}</span>.
            <br />Check your inbox (and spam, just in case).
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="text-white text-sm font-medium px-4 py-2 hover:opacity-80 transition-opacity"
            style={{ backgroundColor: colors.accent }}
          >
            Done
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h2 className={`${changa.className} text-xl uppercase tracking-tight text-gray-950`}>
            Get the Brief
          </h2>
          <p className="text-xs text-gray-600 mt-0.5">{competitionTitle}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 transition-colors text-xl leading-none"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-6">
        <p className="text-sm text-gray-600 mb-5 leading-relaxed">
          Enter your email and we&apos;ll send you all the brief documents instantly.
        </p>
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="your@email.com"
            disabled={emailState === 'sending'}
            className="w-full px-4 py-2.5 text-sm border outline-none transition-all focus:ring-2 focus:ring-[#2C5F5F]/20 rounded"
            style={{
              borderColor: errorMsg ? '#ef4444' : '#e5e7eb',
              backgroundColor: '#F8F7F2',
              color: colors.textPrimary,
            }}
          />
          {errorMsg && (
            <p className="mt-1.5 text-xs text-red-500">{errorMsg}</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
        <button
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-600 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSend}
          disabled={emailState === 'sending'}
          className="flex items-center gap-2 text-white text-sm font-medium px-4 py-2 hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: colors.accent }}
        >
          {emailState === 'sending' ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Sending…
            </>
          ) : (
            <>
              Send to my email
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </>
          )}
        </button>
      </div>
    </>
  );
}

// ─── User View: Direct Downloads ──────────────────────────────────────────────

function UserView({
  eventId,
  title,
  subtitle,
  onClose,
}: {
  eventId: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
}) {
  const competition = getCompetition(eventId);
  const files = competition?.briefFiles ?? [];

  const downloadAll = () => {
    files.forEach((file, i) => setTimeout(() => downloadFile(file.url), i * 300));
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h2 className={`${changa.className} text-xl uppercase tracking-tight text-gray-950`}>
            {title}
          </h2>
          {subtitle && <p className="text-xs text-gray-600 mt-0.5">{subtitle}</p>}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 transition-colors text-xl leading-none"
        >
          ✕
        </button>
      </div>

      {/* File List */}
      <ul className="divide-y divide-gray-100">
        {files.map((file) => (
          <li
            key={file.url}
            className="flex items-center justify-between px-6 py-4 hover:bg-[#E5E3D7] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center bg-red-50 rounded flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">{file.description}</p>
              </div>
            </div>
            <button
              onClick={() => downloadFile(file.url)}
              className="text-gray-400 hover:text-gray-800 transition-colors p-1 flex-shrink-0"
              title="Download"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </button>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
        <button
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-600 transition-colors"
        >
          Close
        </button>
        <button
          onClick={downloadAll}
          className="flex items-center gap-2 text-white text-sm font-medium px-4 py-2 hover:opacity-80 transition-opacity"
          style={{ backgroundColor: colors.accent }}
        >
          Download all
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </button>
      </div>
    </>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="space-y-1.5 animate-pulse">
          <div className="h-5 w-32 bg-gray-100 rounded" />
          <div className="h-3 w-48 bg-gray-100 rounded" />
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 transition-colors text-xl leading-none"
        >
          ✕
        </button>
      </div>
      <ul className="divide-y divide-gray-100 animate-pulse">
        {[1, 2, 3].map((i) => (
          <li key={i} className="flex items-center gap-3 px-6 py-4">
            <div className="w-8 h-8 bg-gray-100 rounded flex-shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 w-36 bg-gray-100 rounded" />
              <div className="h-3 w-24 bg-gray-100 rounded" />
            </div>
          </li>
        ))}
      </ul>
      <div className="px-6 py-4 border-t border-gray-100 h-14" />
    </>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function BriefModal({ isOpen, onClose, eventId }: BriefModalProps) {
  const [authState, setAuthState] = useState<AuthState>('loading');

  const competition = getCompetition(eventId);
  const title = competition?.meta.title ?? 'Download Brief';
  const subtitle = `${title} — select files to download`;

  useEffect(() => {
    if (!isOpen) { setAuthState('loading'); return; }
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(session ? 'user' : 'guest');
    });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md mx-4 rounded-lg shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {authState === 'loading' && <LoadingSkeleton onClose={onClose} />}
        {authState === 'guest' && (
          <GuestView
            eventId={eventId}
            competitionTitle={title}
            onClose={onClose}
          />
        )}
        {authState === 'user' && (
          <UserView
            eventId={eventId}
            title="Download Brief"
            subtitle={subtitle}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}

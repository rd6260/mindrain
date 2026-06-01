'use client';
import { useState, useEffect } from 'react';
import { colors } from '@/utils/colors';

const DEADLINE = new Date('2026-06-02T23:59:59');

function getTimeLeft() {
  const diff = DEADLINE.getTime() - Date.now();
  if (diff <= 0) return null;
  const h = Math.floor(diff / 1000 / 3600);
  const m = Math.floor((diff / 1000 / 60) % 60);
  const s = Math.floor((diff / 1000) % 60);
  return { h, m, s };
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export default function CouponPopup() {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  useEffect(() => {
    const showTimer = setTimeout(() => setShow(true), 800);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (!show) return;
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);
    return () => clearInterval(interval);
  }, [show]);

  const handleCopy = () => {
    navigator.clipboard.writeText('MR-SPECIAL');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!show) return null;

  const expired = !timeLeft;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ backgroundColor: '#F8F7F2', border: '1px solid #E2E0D8' }}
      >
        {/* Close */}
        <button
          onClick={() => setShow(false)}
          aria-label="Close"
          className="absolute top-4 right-4 transition-colors"
          style={{ color: '#ACACAC', lineHeight: 1 }}
          onMouseEnter={e => (e.currentTarget.style.color = '#1A1A1A')}
          onMouseLeave={e => (e.currentTarget.style.color = '#ACACAC')}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        {/* Top strip */}
        <div
          className="px-6 pt-6 pb-5"
          style={{ borderBottom: '1px dashed #D4D2C8' }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: colors.accent }}
          >
            Special Offer
          </p>
          <h3
            className="text-lg font-bold leading-snug mb-1"
            style={{ color: '#1A1A1A' }}
          >
            Missed the deadline?
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: '#6B6B6B' }}>
            Regular registration for <strong style={{ color: '#1A1A1A' }}>The Unreal House</strong> is closed — but use this coupon to still pay the regular fee.
          </p>
        </div>

        {/* Coupon code */}
        <div className="px-6 py-5" style={{ borderBottom: '1px dashed #D4D2C8' }}>
          <p className="text-xs mb-2" style={{ color: '#9B9B9B' }}>Your coupon code</p>
          <div
            className="flex items-center justify-between rounded-xl px-4 py-3"
            style={{ backgroundColor: '#EEECEA', border: '1px solid #D4D2C8' }}
          >
            <span
              className="text-xl font-mono font-black tracking-widest"
              style={{ color: '#1A1A1A', letterSpacing: '0.15em' }}
            >
              MR-SPECIAL
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
              style={{
                backgroundColor: copied ? '#2D5F4F' : colors.accent,
                color: '#fff',
              }}
            >
              {copied ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M3 8H2a1 1 0 01-1-1V2a1 1 0 011-1h5a1 1 0 011 1v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Countdown */}
        <div className="px-6 py-4">
          {expired ? (
            <p className="text-xs text-center" style={{ color: '#E53E3E' }}>This offer has expired.</p>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-xs" style={{ color: '#9B9B9B' }}>Expires in</p>
              <div className="flex items-center gap-1.5">
                {[
                  { value: pad(timeLeft!.h), label: 'hr' },
                  { value: pad(timeLeft!.m), label: 'min' },
                  { value: pad(timeLeft!.s), label: 'sec' },
                ].map(({ value, label }, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    {i > 0 && <span className="text-xs font-bold" style={{ color: '#C5C3BB' }}>:</span>}
                    <div className="text-center">
                      <div
                        className="text-sm font-mono font-black rounded-md px-2 py-0.5"
                        style={{ backgroundColor: '#EEECEA', color: '#1A1A1A', minWidth: '32px' }}
                      >
                        {value}
                      </div>
                      <p className="text-[10px] mt-0.5" style={{ color: '#ACACAC' }}>{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

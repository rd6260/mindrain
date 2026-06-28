'use client';
import { useState, useEffect } from 'react';
import { colors } from '@/utils/colors';

export default function BulkDiscountPopup() {
  const [show, setShow] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => {
      setShow(true);
      // Small delay so the enter transition runs after mount
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    }, 1200);
    return () => clearTimeout(showTimer);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => setShow(false), 300);
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{
        backgroundColor: `rgba(0,0,0,${visible ? '0.55' : '0'})`,
        transition: 'background-color 0.3s ease',
      }}
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          backgroundColor: '#F8F7F2',
          border: '1px solid #E2E0D8',
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.97)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          aria-label="Close bulk discount popup"
          className="absolute top-4 right-4 transition-colors"
          style={{ color: '#ACACAC', lineHeight: 1 }}
          onMouseEnter={e => (e.currentTarget.style.color = '#1A1A1A')}
          onMouseLeave={e => (e.currentTarget.style.color = '#ACACAC')}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        {/* Top strip — label + headline */}
        <div className="px-6 pt-6 pb-5" style={{ borderBottom: '1px dashed #D4D2C8' }}>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: colors.accent }}
          >
            Institutional Offer
          </p>
          <h3 className="text-lg font-bold leading-snug mb-1" style={{ color: '#1A1A1A' }}>
            Bulk Discount — 60% Off
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: '#6B6B6B' }}>
            Bring{' '}
            <strong style={{ color: '#1A1A1A' }}>30 or more students</strong> from your
            institution and unlock an exclusive{' '}
            <strong style={{ color: colors.accent }}>60% discount</strong> on{' '}
            <strong style={{ color: '#1A1A1A' }}>The Unreal House</strong> competition registration fees.
          </p>
        </div>

        {/* Discount badge */}
        <div className="px-6 py-5" style={{ borderBottom: '1px dashed #D4D2C8' }}>
          <p className="text-xs mb-3" style={{ color: '#9B9B9B' }}>
            Minimum group size
          </p>
          <div
            className="flex items-center justify-between rounded-xl px-4 py-3"
            style={{ backgroundColor: '#EEECEA', border: '1px solid #D4D2C8' }}
          >
            {/* Left — student count */}
            <div className="flex items-center gap-3">
              <span className="text-2xl">👥</span>
              <div>
                <span
                  className="block text-xl font-mono font-black tracking-wider"
                  style={{ color: '#1A1A1A', letterSpacing: '0.1em' }}
                >
                  30+ Students
                </span>
                <span className="block text-[11px] mt-0.5" style={{ color: '#9B9B9B' }}>
                  same institution
                </span>
              </div>
            </div>

            {/* Right — discount pill */}
            <div
              className="flex flex-col items-center justify-center rounded-xl px-3 py-2 text-white font-black"
              style={{ background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})` }}
            >
              <span className="text-xl leading-none">60%</span>
              <span className="text-[10px] font-semibold tracking-wide mt-0.5 opacity-90">OFF</span>
            </div>
          </div>
        </div>

        {/* CTA footer */}
        <div className="px-6 py-4 flex items-center justify-between gap-4">
          <p className="text-[11px] leading-snug flex-1" style={{ color: '#9B9B9B' }}>
            Contact us from your official university email to apply.
          </p>
          <a
            href="mailto:support@mindrain.org"
            className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all text-white"
            style={{ backgroundColor: colors.accent }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = colors.accentHover)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = colors.accent)}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="1" y="2.5" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M1 4l5 3 5-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}

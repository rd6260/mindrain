'use client';
import { useState, useEffect } from 'react';
import { colors } from '@/utils/colors';

export default function CouponPopup() {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText('MR-SPECIAL');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#F8F7F2] rounded-2xl p-8 max-w-md w-full shadow-2xl relative border border-[#D0CEC2]">

        {/* Close button */}
        <button
          onClick={() => setShow(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col items-center text-center">

          {/* Icon */}
          <div className="w-12 h-12 bg-[#2D5F4F]/10 text-[#2D5F4F] rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M7 7h.01M17 17h.01M7 17h.01M17 7h.01M3 12h1m16 0h1M12 3v1m0 16v1M6.343 6.343l-.707-.707M18.364 18.364l-.707-.707M6.343 17.657l-.707.707M18.364 5.636l-.707.707" />
            </svg>
          </div>

          {/* Heading */}
          <h3 className="text-xl font-bold text-[#1A1A1A] mb-1">
            Late to The Unreal House?
          </h3>
          <p className="text-[#6B6B6B] text-sm leading-relaxed mb-5">
            Regular registration has closed, but you can still join at the same price. Use the coupon below to unlock the regular fee.
          </p>

          {/* Coupon box */}
          <div className="w-full border-2 border-dashed border-[#2D5F4F] rounded-xl px-5 py-4 bg-[#2D5F4F]/5 mb-2">
            <p className="text-xs text-[#2D5F4F] font-semibold uppercase tracking-widest mb-1">Your Coupon Code</p>
            <p className="text-3xl font-black tracking-widest text-[#1A1A1A] mb-3 font-mono">
              MR-SPECIAL
            </p>
            <button
              onClick={handleCopy}
              className="w-full py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2"
              style={{ backgroundColor: copied ? '#2D5F4F' : colors.accent, color: '#fff' }}
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Code
                </>
              )}
            </button>
          </div>

          {/* Expiry note */}
          <p className="text-xs text-[#9B9B9B] mt-1 mb-5">
            ⏳ Valid until <span className="font-semibold text-[#6B6B6B]">2nd June 2026</span>
          </p>

          {/* Dismiss */}
          <button
            onClick={() => setShow(false)}
            className="w-full py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg text-sm"
            style={{ backgroundColor: colors.accent, color: colors.white }}
          >
            Got it, thanks!
          </button>

        </div>
      </div>
    </div>
  );
}

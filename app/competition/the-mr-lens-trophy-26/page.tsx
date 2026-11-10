'use client';

import Image from 'next/image';
import { colors } from '@/utils/colors';
import Footer from '@/app/components/Footer';
import Navigation from '@/app/components/Navigation';
import BriefModal from '@/app/components/BriefModal';
import DownloadBriefModal from '@/app/components/DownloadModal';
import { useState } from 'react';
import { Trophy, ListOrdered, Medal } from 'lucide-react';
import localFont from 'next/font/local';
import { MR_LENS_TROPHY, type LensFeeTable } from '@/config/projects';
import { lensIsOpen, lensSlabFor, lensOrderTotal } from '@/lib/projects/lensTrophy';
import { getCdnUrl } from '@/utils/cdn'

// ─── Font ─────────────────────────────────────────────────────────────────────

const TechnorFont = localFont({ src: '../../fonts/Technor-Variable.woff2' });

// ─── Static Data ──────────────────────────────────────────────────────────────

const REGISTRATION_EVENT_ID = MR_LENS_TROPHY.eventId;
const REGISTRATION_URL = MR_LENS_TROPHY.registrationPath;

// Dates and fees live in config/projects/lensTrophy.ts. Change them there, not here.
const { dates, fees } = MR_LENS_TROPHY;

/** '2027-01-18T23:59:59+05:30' → '18 January 2027' (always shown in IST). */
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });


// ─── Registration Fees Data ───────────────────────────────────────────────────

type Origin = 'india' | 'international';

const PRICING: Record<Origin, LensFeeTable> = { india: fees.india, international: fees.international };
const MAX_IMAGES = fees.maxImages;

const formatMoney = (symbol: string, amount: number) => {
  const rounded = Math.round(amount * 100) / 100;
  return `${symbol}${Number.isInteger(rounded) ? rounded : rounded.toFixed(2)}`;
};

const slabFor = (origin: Origin, images: number) => lensSlabFor(origin, images)!;
const totalFor = (origin: Origin, images: number) => lensOrderTotal(origin, images);

// ─── Small Shared Components ──────────────────────────────────────────────────

function GradientButton({ href, onClick, children, className = '', testId }: {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  testId?: string;
}) {
  const style = { background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})` };
  const baseClass = `px-16 py-5 rounded-lg text-white font-bold text-xl transition-all duration-300 hover:scale-110 shadow-2xl hover:shadow-3xl animate-pulse-glow inline-block text-center ${className}`;

  if (href) {
    return <a href={href} className={baseClass} style={style} data-testid={testId}>{children}</a>;
  }
  return <button onClick={onClick} className={baseClass} style={style} data-testid={testId}>{children}</button>;
}

// ─── Registration Closed Popup ────────────────────────────────────────────────

function RegistrationClosedPopup({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl p-8 shadow-2xl animate-fade-in-up text-center"
        style={{ backgroundColor: '#FAFAF7', border: '1px solid #E5E3D7' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#E5E3D7] transition-all"
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Icon */}
        <div
          className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#D97757/10', border: '2px solid #D97757' }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 10v6M16 22h.01" stroke="#D97757" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="16" cy="16" r="13" stroke="#D97757" strokeWidth="2.5" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>Registrations Closed</h2>
        <p className="text-xs font-medium mb-3" style={{ color: '#D97757' }}>Registration closed on {formatDate(dates.registrationEnds)}</p>
        <p className="text-base leading-relaxed mb-6" style={{ color: '#6B6B6B' }}>
          Registration for <strong style={{ color: '#1A1A1A' }}>The Mindrain Lens Trophy</strong> is now closed.
          <br />
          If you still wish to participate, reach out to us at:
        </p>

        <a
          href="mailto:support@mindrain.org"
          className="inline-block px-6 py-3 rounded-lg text-white font-semibold text-base transition-all hover:scale-105 shadow-lg"
          style={{ background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})` }}
          data-testid="registration-closed-email-link"
        >
          support@mindrain.org
        </a>
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="relative flex-shrink-0 w-2.5 h-2.5">
        <span className="absolute inset-0 rounded-full bg-[#2C5F5F]" />
        <span className="absolute inset-0 rounded-full bg-[#2C5F5F] animate-ping opacity-50" />
      </div>
      <h2 className="text-xs font-bold uppercase tracking-widest text-[#2C5F5F]">{children}</h2>
    </div>
  );
}

function ToggleButton({ active, onClick, children }: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex-1 py-3 px-4 rounded-xl text-sm font-semibold border transition-all duration-200
        ${active
          ? 'bg-[#2C5F5F] text-white border-[#2C5F5F] shadow-md shadow-[#2C5F5F]/20'
          : 'bg-[#F8F7F2] text-[#6B6B6B] border-[#D0CEC2] hover:border-[#2C5F5F] hover:text-[#2C5F5F]'
        }
      `}
    >
      {children}
    </button>
  );
}

// ─── Sections ─────────────────────────────────────────────────────────────────

const HERO_DATES = [
  { label: 'Registration opens', date: formatDate(dates.registrationOpens) },
  { label: 'Registration ends', date: formatDate(dates.registrationEnds) },
  { label: 'Submission ends', date: formatDate(dates.submissionEnds) },
  { label: 'Results announcement', date: formatDate(dates.resultsAnnouncement) },
];

function Hero({ onBriefClick, onRegisterClick }: { onBriefClick: () => void; onRegisterClick: () => void }) {
  return (
    <section className="relative min-h-screen px-6 sm:px-10 lg:px-16 pt-28 pb-12 lg:pt-24 flex items-center">
      <div className="relative z-10 w-full max-w-7xl mx-auto grid gap-10 lg:gap-16 lg:grid-cols-[1.15fr_1fr] items-center animate-fade-in">
        {/* Text */}
        <div style={{ color: colors.textPrimary }}>
          <div className="flex items-center gap-5 mb-8 lg:mb-10">
            <span className="text-sm sm:text-lg tracking-wide uppercase" style={{ color: colors.textSecondary }}>
              Photography Competition <span className="mx-1">•</span> 2026–27
            </span>
            <span className="hidden sm:block h-px w-28 bg-current opacity-30" />
          </div>

          <h1 className="font-[family-name:var(--font-inter)] font-extrabold uppercase tracking-tight leading-[0.95]">
            <span className="block text-4xl sm:text-6xl lg:text-6xl xl:text-7xl">The Mindrain</span>
            <span className="flex flex-wrap items-baseline gap-x-4">
              <span className="block text-5xl sm:text-7xl lg:text-7xl xl:text-8xl">Lens Trophy</span>
              <span className="text-lg sm:text-2xl font-normal tracking-normal" style={{ color: colors.textSecondary }}>
                #EDITION 02
              </span>
            </span>
          </h1>

          <p className="mt-8 text-lg sm:text-2xl uppercase tracking-wide" style={{ color: colors.textSecondary }}>
            Your world. Your frame. Your story.
          </p>

          <p className="mt-8 text-sm sm:text-base uppercase tracking-wide">
            Open Photography <span className="mx-3">/</span> Architecture Photography
          </p>

          <ul className="mt-8 space-y-3 border-l border-current/30 pl-0 relative">
            {HERO_DATES.map(item => (
              <li key={item.label} className="flex items-center gap-4 text-base sm:text-lg -ml-[5px]">
                <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-current" />
                <span>
                  {item.label} <strong className="font-bold">{item.date}</strong>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <button
              onClick={onRegisterClick}
              data-testid="register-now-button"
              className="px-10 py-4 rounded-lg text-white font-bold text-lg shadow-lg transition-all duration-300 hover:opacity-90 active:scale-95 cursor-pointer"
              style={{ backgroundColor: colors.accent }}
            >
              Register Now →
            </button>
            <button
              onClick={onBriefClick}
              data-testid="download-brief-button"
              className="px-10 py-4 rounded-lg font-bold text-lg border-2 transition-all duration-300 hover:bg-black/5 active:scale-95 cursor-pointer"
              style={{ borderColor: colors.accent, color: colors.accent }}
            >
              Download Brief ↓
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="relative w-full max-w-md mx-auto lg:max-w-none lg:ml-auto lg:w-[min(100%,460px)] aspect-[3/4] rounded-xl overflow-hidden shadow-2xl">
          <Image
            src={getCdnUrl("public/competitions/the-mr-lens-trophy-26/the-mr-lens-trophy-ratio-3-4.webp")}
            alt="Photograph by Fredrik Axling: a man walking through a diagonal band of light on an orange wall"
            fill
            sizes="(min-width: 1024px) 460px, 90vw"
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}


const CATEGORIES = ['Category 1', 'Category 2'];

// Podium order is 2nd · 1st · 3rd so the winner stands in the middle.
const PODIUM = [
  { rank: '2nd', height: 'h-24', tone: 'bg-[#2C5F5F]/70', trophy: '#9AA0A6', size: 24 },
  { rank: '1st', height: 'h-32', tone: 'bg-[#2C5F5F]', trophy: '#C9A227', size: 28 },
  { rank: '3rd', height: 'h-20', tone: 'bg-[#2C5F5F]/45', trophy: '#B07A4A', size: 22 },
];

function Podium() {
  return (
    <div className="flex items-end justify-center gap-3 sm:gap-4 pt-6">
      {PODIUM.map(({ rank, height, tone, trophy, size }) => (
        <div key={rank} className="flex flex-col items-center w-20 sm:w-24">
          <Trophy size={size} strokeWidth={1.6} className="mb-2" style={{ color: trophy }} />
          <div
            className={`${height} ${tone} w-full rounded-t-xl flex items-start justify-center pt-3 text-white font-extrabold text-lg shadow-md`}
          >
            {rank}
          </div>
        </div>
      ))}
      <div className="absolute inset-x-6 bottom-6 h-px bg-[#D0CEC2]" aria-hidden />
    </div>
  );
}

function Recognition() {
  return (
    <section id="recognition" className="relative py-20 md:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-14 animate-fade-in-up">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="h-px w-10 bg-[#2C5F5F]/40" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#2C5F5F]">Recognition</span>
            <span className="h-px w-10 bg-[#2C5F5F]/40" />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight" style={{ color: colors.textPrimary }}>
            Winners &amp; Recognition
          </h2>
          <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto" style={{ color: colors.textSecondary }}>
            Two categories. Dozens of frames celebrated. Yours could be among them.
          </p>
        </div>

        {/* Category podiums */}
        <div className="grid gap-6 md:grid-cols-2">
          {CATEGORIES.map((name, idx) => (
            <div
              key={name}
              className="relative overflow-hidden rounded-3xl border p-8 md:p-10 shadow-sm animate-fade-in-up"
              style={{ backgroundColor: colors.cardBackground, borderColor: colors.borderLight, animationDelay: `${idx * 120}ms` }}
            >
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#2C5F5F]/5" aria-hidden />
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#2C5F5F] mb-2">{name}</p>
              <div className="flex items-baseline gap-3">
                <span className="text-6xl md:text-7xl font-extrabold leading-none" style={{ color: colors.textPrimary }}>3</span>
                <span className="text-2xl font-bold" style={{ color: colors.textPrimary }}>Winners</span>
              </div>
              <div className="relative mt-4 pb-6">
                <Podium />
              </div>
            </div>
          ))}
        </div>

        {/* Top 15 + Honorable mentions */}
        <div
          className="relative overflow-hidden mt-6 rounded-3xl text-white shadow-xl animate-fade-in-up"
          style={{ background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})`, animationDelay: '240ms' }}
        >
          <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-white/5" aria-hidden />
          <div className="absolute -top-20 right-1/3 w-56 h-56 rounded-full bg-white/5" aria-hidden />

          <div className="relative grid md:grid-cols-2 md:divide-x divide-white/15">
            <div className="p-8 md:p-12">
              <ListOrdered size={28} strokeWidth={1.6} className="mb-5 text-white/70" />
              <div className="flex items-baseline gap-3">
                <span className="text-6xl md:text-7xl font-extrabold leading-none">15</span>
                <span className="text-2xl font-bold">Top Winners List</span>
              </div>
              <p className="mt-3 text-white/70 text-base">Excluding the top 3 winners.</p>
            </div>

            <div className="p-8 md:p-12 border-t md:border-t-0 border-white/15">
              <Medal size={28} strokeWidth={1.6} className="mb-5 text-white/70" />
              <div className="flex items-baseline gap-3">
                <span className="text-6xl md:text-7xl font-extrabold leading-none">20+</span>
                <span className="text-2xl font-bold">Honorable Mentions</span>
              </div>
              <p className="mt-3 text-white/70 text-base">Recognising outstanding work beyond the podium.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


function FeeScheme({ origin, images }: { origin: Origin; images: number }) {
  return (
    <div className="rounded-lg overflow-hidden text-white" style={{ background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})` }}>
      <div className="grid md:grid-cols-2 md:divide-x divide-white/15 divide-y md:divide-y-0">
        {(Object.keys(PRICING) as Origin[]).map(key => {
          const { title, symbol, slabs } = PRICING[key];
          const activeSlab = key === origin ? slabFor(origin, images) : null;
          return (
            <div key={key} className="px-6 py-6 text-center">
              <h3 className="text-sm font-bold uppercase tracking-widest underline underline-offset-4 mb-5">{title}</h3>
              <ul className="space-y-3">
                {slabs.map(slab => (
                  <li
                    key={slab.label}
                    className={`rounded-xl px-4 py-3 transition-colors ${slab === activeSlab ? 'bg-white/15' : ''}`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/80">{slab.label}</p>
                    <p className="text-2xl font-bold my-1">
                      {slab.total != null
                        ? <>{formatMoney(symbol, slab.total)} <span className="text-base">TOTAL</span></>
                        : <>{formatMoney(symbol, slab.perImage as number)} <span className="text-base font-semibold">/ image</span></>}
                    </p>
                    <p className="text-xs font-semibold uppercase tracking-wide text-white/70">{slab.note}</p>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FeeCalculator({
  origin, setOrigin, images, setImages, onRegisterClick,
}: {
  origin: Origin;
  setOrigin: (o: Origin) => void;
  images: number;
  setImages: (n: number) => void;
  onRegisterClick: () => void;
}) {
  const { symbol } = PRICING[origin];
  const slab = slabFor(origin, images);
  const total = totalFor(origin, images);

  return (
    <div className="rounded-lg p-6 space-y-7" style={{ backgroundColor: colors.white }}>
      <div>
        <SectionHeading>Participant Type</SectionHeading>
        <div className="flex gap-2">
          <ToggleButton active={origin === 'india'} onClick={() => setOrigin('india')}>Indian Participant</ToggleButton>
          <ToggleButton active={origin === 'international'} onClick={() => setOrigin('international')}>International Participant</ToggleButton>
        </div>
      </div>

      <div>
        <SectionHeading>Number of Images</SectionHeading>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {Array.from({ length: MAX_IMAGES }, (_, k) => k + 1).map(n => (
            <ToggleButton key={n} active={images === n} onClick={() => setImages(n)}>{n}</ToggleButton>
          ))}
        </div>
      </div>

      <div className="border-t border-[#E5E3D7]" />

      <div>
        <SectionHeading>Your Total</SectionHeading>
        <div className="flex items-end justify-between gap-4 px-5 py-5 rounded-xl border border-[#D0CEC2] bg-[#F8F7F2]">
          <div>
            <p className="text-sm font-semibold text-[#1A1A1A]">
              {images} {images === 1 ? 'image' : 'images'}
              {slab.total == null && <span className="font-normal text-[#6B6B6B]"> × {formatMoney(symbol, slab.perImage as number)}</span>}
            </p>
            <p className="text-xs uppercase tracking-wide text-[#6B6B6B] mt-1">{slab.note}</p>
          </div>
          <p className="text-4xl font-extrabold tabular-nums leading-none text-[#2C5F5F]">{formatMoney(symbol, total)}</p>
        </div>
        <p className="text-[11px] text-[#8B8B8B] mt-3 text-right italic">*Includes fees and taxes.</p>
      </div>

      <div className="flex items-center justify-center">
        <GradientButton onClick={onRegisterClick} className="!px-12 !py-3.5 !text-sm" testId="register-now-button">
          Register Now →
        </GradientButton>
      </div>
    </div>
  );
}

function RegistrationFees({ onRegisterClick }: { onRegisterClick: () => void }) {
  const [origin, setOrigin] = useState<Origin>('india');
  const [images, setImages] = useState(1);

  return (
    <div className="space-y-6">
      <FeeScheme origin={origin} images={images} />
      <FeeCalculator origin={origin} setOrigin={setOrigin} images={images} setImages={setImages} onRegisterClick={onRegisterClick} />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CompetitionPage() {
  const [isBriefOpen, setIsBriefOpen] = useState(false);
  const [isRegClosedOpen, setIsRegClosedOpen] = useState(false);

  const registrationOpen = lensIsOpen(new Date());
  const handleRegisterClick = () => {
    if (registrationOpen) {
      window.location.href = REGISTRATION_URL;
    } else {
      setIsRegClosedOpen(true);
    }
  };

  return (
    <>
      {isRegClosedOpen && <RegistrationClosedPopup onClose={() => setIsRegClosedOpen(false)} />}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navigation />
      </div>

      <div style={{ backgroundColor: colors.background }} className="min-h-screen relative overflow-hidden">
        <div
          className="fixed top-0 right-1/4 w-[700px] h-[700px] rounded-full blur-3xl opacity-5 pointer-events-none"
          style={{ backgroundColor: colors.accent }}
        />

        <Hero onBriefClick={() => setIsBriefOpen(true)} onRegisterClick={handleRegisterClick} />
        <Recognition />

        <section id="register" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-12" style={{ color: colors.textPrimary }}>
              Registration Fees
            </h2>
            <RegistrationFees onRegisterClick={handleRegisterClick} />
          </div>
        </section>

        <Footer />
      </div>

      <BriefModal
        isOpen={isBriefOpen}
        onClose={() => setIsBriefOpen(false)}
        eventId={REGISTRATION_EVENT_ID}
      />

    </>
  );
}


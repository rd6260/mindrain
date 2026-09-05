'use client';

import Image from 'next/image';
import { colors } from '@/utils/colors';
import Footer from '@/app/components/Footer';
import Timeline from '@/app/components/Timeline';
import Navigation from '@/app/components/Navigation';
import BriefModal from '@/app/components/BriefModal';
import { useEffect, useState } from 'react';
import localFont from 'next/font/local';
import { getCompetitionMeta } from '@/data/competitionBriefFiles';
import {
  IMPORTANT_DATES,
  PRIZES,
  FEES,
  TIER_META,
  getCurrentTier,
  type EntryType,
  type FeeKey
} from '@/utils/architectureOfPlayData';

// ─── Font ─────────────────────────────────────────────────────────────────────

const TechnorFont = localFont({ src: '../../fonts/Technor-Variable.woff2' });
const NiceSchool = localFont({ src: '../../fonts/Nice-School.otf' });

// ─── Static Data ──────────────────────────────────────────────────────────────

const REGISTRATION_EVENT_ID = '1389f7d3-e98a-40dd-819a-5b756e3c2ada';
const meta = getCompetitionMeta(REGISTRATION_EVENT_ID)!;
const REGISTRATION_URL = `/registration-3?event_id=${REGISTRATION_EVENT_ID}`;



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

// ─── Registration Coming Soon Popup ───────────────────────────────────────────

function RegistrationComingSoonPopup({ onClose }: { onClose: () => void }) {
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

        <h2 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>Something went wrong!</h2>
        <p className="text-base leading-relaxed mb-6" style={{ color: '#6B6B6B' }}>
          Please try again later, or reach out to us at:
        </p>

        <a
          href="mailto:support@mindrain.org"
          className="inline-block px-6 py-3 rounded-lg text-white font-semibold text-base transition-all hover:scale-105 shadow-lg"
          style={{ background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})` }}
          data-testid="registration-coming-soon-email-link"
        >
          support@mindrain.org
        </a>
      </div>
    </div>
  );
}

// ─── Promo Discount Popup ─────────────────────────────────────────────────────

function PromoPopup({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('MINDRAIN20');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        style={{
          animation: 'promoSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes promoSlideUp {
            0% { opacity: 0; transform: translateY(24px) scale(0.96); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes promoShine {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
        `}</style>

        {/* Accent header strip */}
        <div
          className="px-6 py-5 text-center"
          style={{ background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})` }}
        >
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-white/70">Limited Time Offer</span>
          <h2 className="text-2xl font-black text-white mt-1 tracking-tight">Student Discount</h2>
        </div>

        {/* Body */}
        <div className="bg-[#FAFAF7] px-6 pt-6 pb-5">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/20 transition-all"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {/* Discount rows */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-4 p-4 rounded-xl border border-[#2C5F5F]/15 bg-[#2C5F5F]/5">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-black text-lg text-white" style={{ backgroundColor: colors.accent }}>
                20%
              </div>
              <div>
                <p className="text-sm font-bold text-[#1A1A1A]">Previously Participated Students</p>
                <p className="text-xs text-[#6B6B6B] mt-0.5">Get 20% off on your registration</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl border border-[#D97757]/15 bg-[#D97757]/5">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-black text-lg text-white bg-[#D97757]">
                10%
              </div>
              <div>
                <p className="text-sm font-bold text-[#1A1A1A]">New Student Registrations</p>
                <p className="text-xs text-[#6B6B6B] mt-0.5">Get 10% off on your first registration</p>
              </div>
            </div>
          </div>

          {/* Promo code */}
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#6B6B6B] text-center mb-2">Use Promo Code</p>
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border-2 border-dashed border-[#2C5F5F]/30 bg-[#2C5F5F]/5 hover:bg-[#2C5F5F]/10 transition-all group"
            >
              <span className="font-mono text-xl font-black tracking-[0.3em] text-[#2C5F5F]">MINDRAIN20</span>
              <span className="text-xs font-semibold text-[#2C5F5F]/60 group-hover:text-[#2C5F5F] transition-colors">
                {copied ? '✓ Copied!' : 'Copy'}
              </span>
            </button>
          </div>

          {/* CTA */}
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all duration-200 hover:opacity-90 shadow-lg"
            style={{ background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})` }}
          >
            Got it, let me register! →
          </button>

          <p className="text-[10px] text-[#8B8B8B] text-center mt-3">Apply the code during payment checkout</p>
        </div>
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

function MobileHero() {
  return (
    <section className="relative h-dvh flex flex-col items-start justify-start pt-24 px-6 md:hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/the-architecture-of-play/hero-portraint_v7.webp"
          alt="The Architecture of Play"
          fill
          className="object-cover object-center"
          priority
        />
      </div>

      <div className="relative z-10 w-full animate-fade-in">
        <h1 className="text-[#393939]">
          <span className={`${NiceSchool.className} flex flex-col gap-0 tracking-[0.1rem] font-extrabold`}>
            <span className="text-6xl leading-none">The</span>
            <span className="text-5xl leading-none -mt-3">Architecture</span>
            <span className="text-6xl leading-none -mt-3">of Play</span>
          </span>
          <span className="block text-lg font-medium tracking-wide mt-4">
            A Kindergarten Design Challenge<br/>2026-27
          </span>
          <span className="block text-lg font-medium tracking-wide mt-2">
            ARCHITECTURE<br/>COMPETITION <span className="text-sm font-light italic"># Edition 07</span>
          </span>
        </h1>
      </div>
    </section>
  );
}

function MobileCTAButtons({ onBriefClick, onRegisterClick }: { onBriefClick: () => void; onRegisterClick: () => void }) {
  return (
    <div className="md:hidden px-6 py-10" style={{ backgroundColor: colors.background }}>
      <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
        <button
          onClick={onRegisterClick}
          className="w-full px-6 py-4 rounded-lg text-white font-bold text-base transition-all duration-300 active:scale-95 shadow-xl text-center"
          style={{ background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})` }}
          data-testid="register-now-button-mobile"
        >
          Register Now →
        </button>
        <button
          className="w-full px-6 py-4 rounded-lg text-white font-bold text-base transition-all duration-300 active:scale-95 shadow-xl"
          style={{ background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})` }}
          onClick={onBriefClick}
        >
          Download Brief ↓
        </button>
      </div>
    </div>
  );
}

function DesktopHero({ onBriefClick, onRegisterClick }: { onBriefClick: () => void; onRegisterClick: () => void }) {
  return (
    <section className="relative hidden min-h-screen items-start justify-start px-4 pt-24 md:flex sm:px-6 lg:px-8">
      <Image
        src="/the-architecture-of-play/hero-landscape.png"
        alt="The Architecture of Play Competition"
        fill
        priority
        className="absolute inset-0 z-0 object-cover"
      />

      <div className="relative px-8 py-6">
        <h1 className="space-y-4 text-[#393939]">
          <span className={`${NiceSchool.className} flex flex-col gap-0 tracking-[0.2rem] font-extrabold mb-6 mt-0`}>
            <span className="text-6xl md:text-8xl lg:text-[10rem] leading-none">The</span>
            <span className="text-5xl md:text-7xl lg:text-8xl leading-none -mt-6">Architecture</span>
            <span className="text-6xl md:text-8xl lg:text-[9rem] leading-none -mt-6">of Play</span>
          </span>
          <span className="block text-2xl md:text-4xl font-medium tracking-wide">
            A Kindergarten Design Challenge <br/> 2026-27 <br/> <br/>
          </span>
          <span className="block text-2xl md:text-4xl font-medium tracking-wide">
            ARCHITECTURE <br/> COMPETITION <span className="text-xl md:text-2xl font-light italic"># Edition 07</span>
          </span>
        </h1>

        <div className="mt-20 animate-fade-in">
          <div className="flex gap-8">
            <GradientButton onClick={onRegisterClick} testId="register-now-button">
              Register Now →
            </GradientButton>
            <GradientButton onClick={onBriefClick} testId="download-brief-button">
              Download Brief ↓
            </GradientButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function PrizePool() {
  const categories = [
    'Category 1 (1st & 2nd Year)',
    'Category 2 (3rd, 4th & 5th Year)',
  ];

  return (
    <section className="py-28 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center animate-fade-in-up">Prize Pool</h2>

        <div className="grid md:grid-cols-2 gap-10">
          {categories.map((category) => (
            <div
              key={category}
              className="rounded-lg p-10 shadow-xl hover-lift animate-fade-in-up border-2"
              style={{ backgroundColor: colors.white, borderColor: colors.borderLight }}
            >
              <h3 className="text-xl font-bold mb-8 pb-4 border-b-2">{category}</h3>
              <div className="space-y-6">
                {PRIZES.map((prize) => (
                  <div key={prize.label} className="flex justify-between items-center p-4 rounded-xl transition-all">
                    <span className="text-xl font-medium flex items-center gap-3" style={{ color: colors.textSecondary }}>
                      <span className="text-2xl">{prize.emoji}</span>
                      {prize.label}
                    </span>
                    <span className="text-2xl font-black" style={{ color: colors.textPrimary }}>
                      {prize.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-sm">
          <sup>*</sup>Monetary Awards will be given to Group A Participants only. Read the full brief and
          <sup>*</sup>T&C documents carefully for more information.
        </p>
      </div>
    </section>
  );
}

function StudentDiscounts() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12" style={{ color: colors.textPrimary }}>
          Student Discounts
        </h2>

        <div className="rounded-lg p-8 md:p-12" style={{ backgroundColor: colors.white }}>
          {[
            <>Participate and avail discount <span className="font-bold">Flat 35%</span></>,
            'The Mind Rain Competition Team welcomes participation from universities, colleges, and design schools across the world.',
            <>Students can avail exclusive discounts through group registration offers (valid for <span className="font-bold">30 or more</span> participants registering from the same institution).</>,
            'This is a great opportunity for faculty and mentors to encourage students to think creatively and explore imaginative architecture.',
          ].map((text, i) => (
            <p key={i} className="text-lg mb-6 leading-relaxed" style={{ color: colors.textSecondary }}>{text}</p>
          ))}

          <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: colors.cardBackground }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: colors.textPrimary }}>
              To apply for student discounts:
            </h3>
            <ul className="space-y-2 list-disc list-inside">
              {[
                'Email us from your official university e-mail ID',
                'Include your university name, your role, and number of participants',
                'Only recognized university representatives (professors/staff) are eligible to request discounted access on behalf of students',
              ].map((item) => (
                <li key={item} style={{ color: colors.textSecondary }}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="text-center">
            <a
              href="mailto:support@mindrain.org"
              className="inline-block px-8 py-3 rounded-lg text-white font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: colors.accent }}
              data-testid="discount-email-link"
            >
              Contact for Group Discounts
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function RegistrationFees({ onRegisterClick }: { onRegisterClick: () => void }) {
  const [origin, setOrigin] = useState<'india' | 'international'>('india');
  const [monetary, setMonetary] = useState<'yes' | 'no'>('yes');
  const [teamType, setTeamType] = useState<EntryType>('solo');

  const activeTier = getCurrentTier();
  const { shortLabel, color, bg, border, dot, endsOn } = TIER_META[activeTier];

  const feeKey: FeeKey =
    origin === 'international' ? 'international'
      : monetary === 'yes' ? 'india_monetary'
        : 'india_no_monetary';

  const amount = FEES[activeTier][feeKey][teamType];

  const originLabel =
    origin === 'india'
      ? monetary === 'yes' ? 'Monetary track' : 'Non-monetary track'
      : 'International';

  return (
    <div className="rounded-lg p-6 space-y-7" style={{ backgroundColor: colors.white }}>

      {/* Application Type */}
      <div>
        <SectionHeading>Application Type</SectionHeading>
        <div className="flex gap-2">
          <ToggleButton active={origin === 'india'} onClick={() => setOrigin('india')}>Indian Application</ToggleButton>
          <ToggleButton active={origin === 'international'} onClick={() => setOrigin('international')}>International</ToggleButton>
        </div>
      </div>

      {/* Award Preference — India only */}
      {origin === 'india' && (
        <div>
          <SectionHeading>Award Preference</SectionHeading>
          <div className="flex gap-2">
            <ToggleButton active={monetary === 'yes'} onClick={() => setMonetary('yes')}>
              <span className="block text-xs font-bold">Group A</span>
              <span className="block text-[10px] opacity-70 mt-0.5">Monetary Award</span>
            </ToggleButton>
            <ToggleButton active={monetary === 'no'} onClick={() => setMonetary('no')}>
              <span className="block text-xs font-bold">Group B</span>
              <span className="block text-[10px] opacity-70 mt-0.5">No Monetary Award</span>
            </ToggleButton>
          </div>
        </div>
      )}

      {/* Entry Type */}
      <div>
        <SectionHeading>Entry Type</SectionHeading>
        <div className="flex gap-2">
          <ToggleButton active={teamType === 'solo'} onClick={() => setTeamType('solo')}>
            <span className="block text-xs font-bold">Solo</span>
            <span className="block text-[10px] opacity-70 mt-0.5">1 member</span>
          </ToggleButton>
          <ToggleButton active={teamType === 'group'} onClick={() => setTeamType('group')}>
            <span className="block text-xs font-bold">Group</span>
            <span className="block text-[10px] opacity-70 mt-0.5">up to 3 members</span>
          </ToggleButton>
        </div>
      </div>

      <div className="border-t border-[#E5E3D7]" />

      {/* Current Fee */}
      <div>
        <SectionHeading>Registration Fees</SectionHeading>
        <div className={`flex items-center justify-between px-4 py-3.5 rounded-xl border ${bg} ${border}`}>
          <div className="flex items-center gap-3">
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
            <span className="text-sm text-[#6B6B6B] font-medium">{activeTier}</span>
          </div>
          <span className={`text-base font-bold tabular-nums ${color}`}>{amount}</span>
        </div>

        <p className="text-[10px] text-[#8B8B8B] mt-3 text-center">
          {shortLabel} pricing · ends{' '}
          <span className="font-semibold text-[#D97757]">{endsOn}</span>
          {' '}· {teamType} · {originLabel}
        </p>
      </div>

      <div className="flex items-center justify-center">
        <GradientButton onClick={onRegisterClick} className="!px-12 !py-3.5 !text-sm" testId="register-now-button">
          Register Now →
        </GradientButton>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CompetitionPage() {
  const [isBriefOpen, setIsBriefOpen] = useState(false);
  const [isPromoOpen, setIsPromoOpen] = useState(false);

  // Show promo popup once per session
  useEffect(() => {
    const key = 'aop_promo_seen';
    if (!sessionStorage.getItem(key)) {
      const timer = setTimeout(() => {
        setIsPromoOpen(true);
        sessionStorage.setItem(key, '1');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleRegisterClick = () => {
    window.location.href = REGISTRATION_URL;
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navigation />
      </div>

      <div style={{ backgroundColor: colors.background }} className="min-h-screen relative overflow-hidden">
        <div
          className="fixed top-0 right-1/4 w-[700px] h-[700px] rounded-full blur-3xl opacity-5 pointer-events-none"
          style={{ backgroundColor: colors.accent }}
        />

        <MobileHero />
        <DesktopHero onBriefClick={() => setIsBriefOpen(true)} onRegisterClick={handleRegisterClick} />

        <PrizePool />
        <MobileCTAButtons onBriefClick={() => setIsBriefOpen(true)} onRegisterClick={handleRegisterClick} />

        <section id="timeline" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16" style={{ color: colors.textPrimary }}>
              Important Dates
            </h2>
            <Timeline dates={IMPORTANT_DATES} />
          </div>
        </section>

        <section id="register" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-12" style={{ color: colors.textPrimary }}>
              Registration Fees
            </h2>
            <RegistrationFees onRegisterClick={handleRegisterClick} />
          </div>
        </section>

        <StudentDiscounts />
        <Footer />
      </div>

      <BriefModal
        isOpen={isBriefOpen}
        onClose={() => setIsBriefOpen(false)}
        eventId={REGISTRATION_EVENT_ID}
      />

      {isPromoOpen && (
        <PromoPopup onClose={() => setIsPromoOpen(false)} />
      )}
    </>
  );
}

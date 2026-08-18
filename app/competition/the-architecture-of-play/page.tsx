'use client';

import Image from 'next/image';
import { colors } from '@/utils/colors';
import Footer from '@/app/components/Footer';
import Timeline from '@/app/components/Timeline';
import Navigation from '@/app/components/Navigation';
import BriefModal from '@/app/components/BriefModal';
import { useState } from 'react';
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

// ─── Static Data ──────────────────────────────────────────────────────────────

const REGISTRATION_EVENT_ID = 'b2e94f01-3c7a-4d8e-a512-9f6d2b1c0e47';
const meta = getCompetitionMeta(REGISTRATION_EVENT_ID)!;

// Registrations are currently disabled — this URL is kept for future use.
// const REGISTRATION_URL = `/registration?event_id=${REGISTRATION_EVENT_ID}`;



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

function MobileHero({ onBriefClick, onRegisterClick }: { onBriefClick: () => void; onRegisterClick: () => void }) {
  return (
    <section className="relative h-dvh flex flex-col items-center justify-end pb-16 px-6 md:hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/the-architecture-of-play/hero-portrait-v3.webp"
          alt="The Architecture of Play"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      </div>

      <div className="relative z-10 w-full text-center text-white animate-fade-in">
        <span className="block text-sm font-medium tracking-[0.2em] uppercase text-gray-300 mb-1">
          {meta?.category ?? 'Architecture Competition'}
        </span>
        <span className="block text-sm font-light italic text-gray-400 mb-4">{meta?.edition ?? 'Edition 01'}</span>
        <h1 className={`${TechnorFont.className} text-6xl font-black leading-none mb-3`}>
          The Architecture<br />of Play
        </h1>
        <p className="text-base font-medium tracking-wide text-gray-300 mb-10">
          {meta?.subtitle ?? 'A Design Competition for Young Minds'}
        </p>

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
    </section>
  );
}

function DesktopHero({ onBriefClick, onRegisterClick }: { onBriefClick: () => void; onRegisterClick: () => void }) {
  return (
    <section className="relative hidden min-h-screen items-center justify-start px-4 md:flex sm:px-6 lg:px-8">
      <Image
        src="/the-architecture-of-play/hero-portrait-v3.webp"
        alt="The Architecture of Play Competition"
        fill
        priority
        className="absolute inset-0 z-0 object-cover"
      />

      <div className="absolute bottom-[10%] left-24 z-10 max-w-5xl animate-fade-in text-left text-gray-200">
        <div className="flex gap-8">
          <GradientButton onClick={onRegisterClick} className="mt-16" testId="register-now-button">
            Register Now →
          </GradientButton>
          <GradientButton onClick={onBriefClick} className="mt-16" testId="download-brief-button">
            Download Brief ↓
          </GradientButton>
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
            'This is a great opportunity for faculty and mentors to encourage students to think creatively and explore imaginative architecture beyond textbooks.',
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
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);

  // Registrations are disabled until further notice — always show the coming-soon popup.
  const REGISTRATIONS_ENABLED = false;
  const handleRegisterClick = () => {
    if (REGISTRATIONS_ENABLED) {
      // window.location.href = REGISTRATION_URL;
    } else {
      setIsComingSoonOpen(true);
    }
  };

  return (
    <>
      {isComingSoonOpen && <RegistrationComingSoonPopup onClose={() => setIsComingSoonOpen(false)} />}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navigation />
      </div>

      <div style={{ backgroundColor: colors.background }} className="min-h-screen relative overflow-hidden">
        <div
          className="fixed top-0 right-1/4 w-[700px] h-[700px] rounded-full blur-3xl opacity-5 pointer-events-none"
          style={{ backgroundColor: colors.accent }}
        />

        <MobileHero onBriefClick={() => setIsBriefOpen(true)} onRegisterClick={handleRegisterClick} />
        <DesktopHero onBriefClick={() => setIsBriefOpen(true)} onRegisterClick={handleRegisterClick} />

        <PrizePool />

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
    </>
  );
}

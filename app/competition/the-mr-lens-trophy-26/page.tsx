'use client';

import Image from 'next/image';
import { colors } from '@/utils/colors';
import Footer from '@/app/components/Footer';
import Timeline from '@/app/components/Timeline';
import Navigation from '@/app/components/Navigation';
import BriefModal from '@/app/components/BriefModal';
import DownloadBriefModal from '@/app/components/DownloadModal';
import { useState } from 'react';
import localFont from 'next/font/local';
import { MR_LENS_TROPHY } from '@/config/projects';
import { ImportantDate } from '@/types';
import { isRegistrationOpen } from '@/utils/registration';

// ─── Font ─────────────────────────────────────────────────────────────────────

const TechnorFont = localFont({ src: '../../fonts/Technor-Variable.woff2' });

// ─── Static Data ──────────────────────────────────────────────────────────────

const REGISTRATION_EVENT_ID = MR_LENS_TROPHY.eventId;
const REGISTRATION_URL = `/registration?event_id=${REGISTRATION_EVENT_ID}`;

const PRESS_KIT_FILES = [
  {
    name: 'A4 A3 Poster',
    description: 'A4 and A3 size Campaign Posters',
    url: 'https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/the_unreal_house/A4_A3%20campaign%20poster.png',
  },
  {
    name: 'Instagram Post',
    description: 'Instagram Post sized posters',
    url: 'https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/the_unreal_house/instagram%20post%20campaign.png',
  },
];

const IMPORTANT_DATES: ImportantDate[] = [
  { label: 'Competition Starts', date: '19 February 2026' },
  { label: 'Early Bird Registration Starts', date: '19 February 2026' },
  { label: 'Early Bird Registration Ends', date: '22 March 2026' },
  { label: 'Advance Registration Starts', date: '23 March 2026' },
  { label: 'Final Submission Starts', date: '1 April 2026' },
  { label: 'Advance Registration Ends', date: '31 May 2026' },
  { label: 'Late Registration Starts', date: '1 June 2026' },
  { label: 'Late Registration Ends (Extended)', date: '25 July 2026' },
  { label: 'Final Submission Ends (Extended)', date: '30 July 2026' },
  { label: 'Announcement of Result', date: '1 September 2026' },
];

const PRIZES = [
  { label: '1st Prize', amount: '₹11,000', emoji: '🥇' },
  { label: '2nd Prize', amount: '₹8,000', emoji: '🥈' },
  { label: '3rd Prize', amount: '₹6,000', emoji: '🥉' },
];

// ─── Registration Fees Data ───────────────────────────────────────────────────

type Tier = 'Early Bird Registration' | 'Regular Registration' | 'Last Minute Registration';
type FeeKey = 'india_monetary' | 'india_no_monetary' | 'international';
type EntryType = 'solo' | 'group';

const FEES: Record<Tier, Record<FeeKey, Record<EntryType, string>>> = {
  'Early Bird Registration': {
    india_monetary: { solo: '₹549', group: '₹999' },
    india_no_monetary: { solo: '₹275', group: '₹559' },
    international: { solo: '$35', group: '$79' },
  },
  'Regular Registration': {
    india_monetary: { solo: '₹699', group: '₹1,499' },
    india_no_monetary: { solo: '₹275', group: '₹559' },
    international: { solo: '$45', group: '$99' },
  },
  'Last Minute Registration': {
    india_monetary: { solo: '₹999', group: '₹1,999' },
    india_no_monetary: { solo: '₹375', group: '₹819' },
    international: { solo: '$69', group: '$149' },
  },
};

const TIER_META: Record<Tier, { shortLabel: string; color: string; bg: string; border: string; dot: string; endsOn: string }> = {
  'Early Bird Registration': {
    shortLabel: 'Early Bird',
    color: 'text-[#2D5F4F]',
    bg: 'bg-[#2D5F4F]/8',
    border: 'border-[#2D5F4F]/20',
    dot: 'bg-[#2D5F4F]',
    endsOn: '22 March 2026',
  },
  'Regular Registration': {
    shortLabel: 'Regular',
    color: 'text-[#1A1A1A]',
    bg: 'bg-[#F8F7F2]',
    border: 'border-[#D0CEC2]',
    dot: 'bg-[#6B6B6B]',
    endsOn: '31 May 2026',
  },
  'Last Minute Registration': {
    shortLabel: 'Last Minute',
    color: 'text-[#D97757]',
    bg: 'bg-[#D97757]/8',
    border: 'border-[#D97757]/20',
    dot: 'bg-[#D97757]',
    endsOn: '25 July 2026',
  },
};

function getCurrentTier(): Tier {
  const today = new Date();
  if (today <= new Date('2026-03-23')) return 'Early Bird Registration';
  if (today <= new Date('2026-05-31')) return 'Regular Registration';
  return 'Last Minute Registration';
}

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
        <p className="text-xs font-medium mb-3" style={{ color: '#D97757' }}>Registration closed on 30 July 2026</p>
        <p className="text-base leading-relaxed mb-6" style={{ color: '#6B6B6B' }}>
          Registration for <strong style={{ color: '#1A1A1A' }}>The Unreal House</strong> is now closed.
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
  { label: 'Registration opens', date: '03 November 2026' },
  { label: 'Registration ends', date: '18 January 2027' },
  { label: 'Submission ends', date: '25 January 2027' },
  { label: 'Results announcement', date: '10 March 2027' },
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
            src="/competitions/the-mr-lens-trophy-26/the-mr-lens-trophy-ratio-3-4.webp"
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
    </section >
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
  const [isPressOpen, setIsPressOpen] = useState(false);
  const [isRegClosedOpen, setIsRegClosedOpen] = useState(false);

  const registrationOpen = isRegistrationOpen();
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

      <DownloadBriefModal
        isOpen={isPressOpen}
        onClose={() => setIsPressOpen(false)}
        title="Download Press Kit"
        subtitle="The Unreal House — select files to download"
        files={PRESS_KIT_FILES}
      />
    </>
  );
}


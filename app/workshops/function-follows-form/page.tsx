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
import { IMPORTANT_DATES } from '@/utils/functionFollowsFormData';

// ─── Font ─────────────────────────────────────────────────────────────────────
const AptosDisplay = localFont({
  src: [
    { path: '../../fonts/Aptos Display/Aptos-Display.ttf',             weight: '400', style: 'normal' },
    { path: '../../fonts/Aptos Display/Aptos-Display-Italic.ttf',      weight: '400', style: 'italic' },
    { path: '../../fonts/Aptos Display/Aptos-Display-Bold.ttf',        weight: '700', style: 'normal' },
    { path: '../../fonts/Aptos Display/Aptos-Display-Bold-Italic.ttf', weight: '700', style: 'italic' },
  ],
  display: 'swap',
});

// ─── Static Data ──────────────────────────────────────────────────────────────

const REGISTRATION_EVENT_ID = '6159b71a-f973-453a-a383-6b2bbfca707a';
const meta = getCompetitionMeta(REGISTRATION_EVENT_ID)!;
const REGISTRATION_URL = `/registration-3?event_id=${REGISTRATION_EVENT_ID}`;

const REGISTRATION_FEES = {
  india: { label: 'India', amount: '₹15,999' },
  international: { label: 'International', amount: '$330' },
} as const;

type FeeOrigin = keyof typeof REGISTRATION_FEES;

const WORKSHOP_DETAILS = [
  { label: 'Online Sessions', value: '12–14 December 2026' },
  { label: 'Offline Workshop', value: '17–22 December 2026' },
  { label: 'Location', value: 'Hyderabad, Telangana, India' },
  { label: 'Limited Seats', value: '15 Participants' },
];

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

function MobileHero() {
  return (
    <section className="relative h-dvh flex flex-col items-start justify-start pt-24 px-6 md:hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/workshops/function-follows-form/function-follows-form-hero-landscape.png"
          alt="UNDER CONSTRUCTION"
          fill
          className="object-cover object-center"
          priority
        />
      </div>

      <div className="relative z-10 w-full animate-fade-in">
        <h1 className="text-[#393939]">
          <span className={`${AptosDisplay.className} flex flex-col gap-0 tracking-[0.1rem] font-extrabold`}>
            <span className="text-6xl leading-none">Function</span>
            <span className="text-5xl leading-none -mt-3">Follows</span>
            <span className="text-5xl leading-none -mt-3">Form</span>
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
        src="/workshops/function-follows-form/function-follows-form-hero-landscape.png"
        alt="Function Follows Form Competition"
        fill
        priority
        className="absolute inset-0 z-0 object-cover"
      />

      <div className="relative px-8 py-6">
        <h1 className="space-y-4 text-[#393939]">
          <span className={`${AptosDisplay.className} flex flex-col gap-0 font-extrabold mb-6 mt-0`}>
            <span className="text-6xl md:text-8xl lg:text-[10rem] leading-none">Function</span>
            <span className="text-5xl md:text-7xl lg:text-8xl leading-none -mt-6">Follows</span>
            <span className="text-6xl md:text-8xl lg:text-[9rem] leading-none -mt-6">Form</span>
          </span>
          <span className="block text-2xl md:text-4xl font-medium tracking-wide">
            Think beyond the box. <br/> Design with intent. <br/> <br/>
          </span>
          <span className="block text-2xl md:text-4xl font-medium tracking-wide">
            ARCHITECTURE <br/> DESIGN WORKSHOP <span className="text-xl md:text-2xl font-light italic"># Edition 02</span>
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

function WorkshopOverview({ onBriefClick }: { onBriefClick: () => void }) {
  return (
    <section id="overview" className="py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-5xl mx-auto">
        {/* Workshop Details */}
        <div
          className="rounded-lg p-8 md:p-10 shadow-xl mb-10 border-2 animate-fade-in-up"
          style={{ backgroundColor: colors.white, borderColor: colors.borderLight }}
        >
          <h3 className="text-2xl font-bold mb-6 pb-4 border-b-2" style={{ color: colors.textPrimary }}>
            Workshop Details
          </h3>
          <dl className="space-y-1">
            {WORKSHOP_DETAILS.map(({ label, value }) => (
              <div
                key={label}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-4 border-b border-[#E5E3D7] last:border-b-0"
              >
                <dt className="text-base font-medium" style={{ color: colors.textSecondary }}>{label}</dt>
                <dd className="text-lg font-bold sm:text-right" style={{ color: colors.textPrimary }}>{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Interested in Applying */}
        <div
          className="rounded-lg p-8 md:p-10 animate-fade-in-up"
          style={{ backgroundColor: colors.cardBackground }}
        >
          <h3 className="text-2xl font-bold mb-4" style={{ color: colors.textPrimary }}>
            Interested in Applying?
          </h3>
          <p className="text-lg leading-relaxed mb-4" style={{ color: colors.textSecondary }}>
            Download the complete workshop brief to explore the workshop structure, eligibility,
            schedule, deliverables, accommodation, and registration process.
          </p>
          <p className="text-lg leading-relaxed mb-6" style={{ color: colors.textSecondary }}>
            Applicants are required to complete the application form, answer the design reflection
            questions, and submit a Letter of Recommendation from an Architectural Design faculty
            member who has taught them.
          </p>
          <button
            onClick={onBriefClick}
            className="px-8 py-3 rounded-lg text-white font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: colors.accent }}
            data-testid="overview-download-brief-button"
          >
            Download Brief ↓
          </button>
        </div>
      </div>
    </section>
  );
}

function RegistrationFeeCalculator({ onRegisterClick }: { onRegisterClick: () => void }) {
  const [origin, setOrigin] = useState<FeeOrigin>('india');
  const { label, amount } = REGISTRATION_FEES[origin];

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

      <div className="border-t border-[#E5E3D7]" />

      {/* Registration Fee */}
      <div>
        <SectionHeading>Registration Fee</SectionHeading>
        <div className="flex items-center justify-between px-4 py-3.5 rounded-xl border bg-[#F8F7F2] border-[#D0CEC2]">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#2C5F5F]" />
            <span className="text-sm text-[#6B6B6B] font-medium">{label}</span>
          </div>
          <span className="text-base font-bold tabular-nums text-[#2C5F5F]" data-testid="registration-fee-amount">
            {amount}
          </span>
        </div>

        <p className="text-[10px] text-[#8B8B8B] mt-3 text-center">
          Limited to 15 participants
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
    const key = 'fff_promo_seen';
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

        <MobileCTAButtons onBriefClick={() => setIsBriefOpen(true)} onRegisterClick={handleRegisterClick} />
        <WorkshopOverview onBriefClick={() => setIsBriefOpen(true)} />


        <section id="register" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-12" style={{ color: colors.textPrimary }}>
              Registration Fees
            </h2>
            <RegistrationFeeCalculator onRegisterClick={handleRegisterClick} />
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

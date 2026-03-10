'use client';

import Image from 'next/image';
import { colors } from '@/utils/colors';
import Footer from '@/app/components/Footer';
import Timeline from '@/app/components/Timeline';
import { ImportantDate } from '@/types';
import DownloadBriefModal, { BriefFile } from '@/app/components/DownloadModal';
import { useEffect, useState } from 'react';
import Navigation from '@/app/components/Navigation';
import { createClient } from '@/lib/supabase/client';
import localFont from "next/font/local";

const IBMPlexSansCondensedFont = localFont({
  src: "../../fonts/IBMPlexSans-Regular.ttf"
})


const TUHBriefFiles: BriefFile[] = [
  {
    name: "Important Dates & Calendar",
    description: "Key deadlines and schedule",
    url: "https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/the_unreal_house/Important%20Dates-Calender.pdf",
  },
  {
    name: "Terms & Conditions",
    description: "Important rules and regulations",
    url: "https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/the_unreal_house/T&C%20(Important).pdf",
  },
  {
    name: "Complete Brief",
    description: "Full competition brief document",
    url: "https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/the_unreal_house/The%20Unreal%20House%20(Complete%20Brief).pdf",
  },
  {
    name: "Brief (Print Format)",
    description: "Print-ready version of the brief",
    url: "https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/the_unreal_house/The%20Unreal%20House%20(print%20format).pdf",
  },
];

const TUHPressKitFiles: BriefFile[] = [
  {
    name: "A4 A3 Poster",
    description: "A4 and A3 size Campaign Posters",
    url: "https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/the_unreal_house/A4_A3%20campaign%20poster.png",
  },
  {
    name: "Instagram Post",
    description: "Instragram Post sized posters",
    url: "https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/the_unreal_house/instagram%20post%20campaign.png",
  },
];

const importantDates: ImportantDate[] = [
  { label: 'Competition Starts', date: '10 March 2026' },
  { label: 'Early Bird Registration Starts', date: '10 March 2026' },
  { label: 'Early Bird Registration Ends', date: '31 March 2026' },
  { label: 'Regular Registration Starts', date: '01 April 2026' },
  { label: 'Final Submission Starts', date: '10 March 2026' },
  { label: 'Regular Registration Ends', date: '30 June 2026' },
  { label: 'Late Registration Starts', date: '01 July 2026' },
  { label: 'Last date for questions & answers', date: '20 August 2026' },
  { label: 'Late Registration Ends', date: '01 September 2026' },
  { label: 'Final Submission Ends', date: '01 September 2026' },
  { label: 'Announcement of Result', date: '01 October 2026' },
];

// ─── Registration Fees Data ───────────────────────────────────────────────────

const REGISTRATION_EVENT_ID = 'c4a201ae-8bfe-48bc-a526-4ac1288dd937';
const REGISTRATION_URL = `/registration?event_id=${REGISTRATION_EVENT_ID}`;

type Tier = 'Early Bird Registration' | 'Regular Registration' | 'Late Registration';
type Group = 'group A' | 'group B';

const FEES: Record<Tier, Record<Group, number>> = {
  'Early Bird Registration': { 'group A': 799, 'group B': 275 },
  'Regular Registration':    { 'group A': 999, 'group B': 275 },
  'Late Registration':       { 'group A': 1499, 'group B': 375 },
};

const TIER_META: Record<Tier, { shortLabel: string; color: string; bg: string; border: string; dot: string; endsOn: string }> = {
  'Early Bird Registration': {
    shortLabel: 'Early Bird',
    color:  'text-[#2D5F4F]',
    bg:     'bg-[#2D5F4F]/8',
    border: 'border-[#2D5F4F]/20',
    dot:    'bg-[#2D5F4F]',
    endsOn: '31 March 2026',
  },
  'Regular Registration': {
    shortLabel: 'Regular',
    color:  'text-[#1A1A1A]',
    bg:     'bg-[#F8F7F2]',
    border: 'border-[#D0CEC2]',
    dot:    'bg-[#6B6B6B]',
    endsOn: '30 June 2026',
  },
  'Late Registration': {
    shortLabel: 'Late',
    color:  'text-[#D97757]',
    bg:     'bg-[#D97757]/8',
    border: 'border-[#D97757]/20',
    dot:    'bg-[#D97757]',
    endsOn: '01 September 2026',
  },
};

function getCurrentTier(): Tier {
  const today = new Date();
  if (today <= new Date('2026-03-31')) return 'Early Bird Registration';
  if (today <= new Date('2026-06-30')) return 'Regular Registration';
  return 'Late Registration';
}

// ─── Small Shared Components ──────────────────────────────────────────────────

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

// ─── Registration Fees Component ──────────────────────────────────────────────

function RegistrationFees() {
  const [group, setGroup] = useState<Group>('group A');

  const activeTier = getCurrentTier();
  const { shortLabel, color, bg, border, dot, endsOn } = TIER_META[activeTier];

  const amount = FEES[activeTier][group];

  return (
    <div className="rounded-lg p-6 space-y-7" style={{ backgroundColor: colors.white }}>

      {/* Group Selection */}
      <div>
        <SectionHeading>Select Group</SectionHeading>
        <div className="flex gap-2">
          <ToggleButton active={group === 'group A'} onClick={() => setGroup('group A')}>
            <span className="block text-xs font-bold">Group A</span>
            <span className="block text-[10px] opacity-70 mt-0.5">Monetary Award</span>
          </ToggleButton>
          <ToggleButton active={group === 'group B'} onClick={() => setGroup('group B')}>
            <span className="block text-xs font-bold">Group B</span>
            <span className="block text-[10px] opacity-70 mt-0.5">Non-Monetary Award</span>
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
          <span className={`text-base font-bold tabular-nums ${color}`}>₹{amount.toLocaleString('en-IN')}</span>
        </div>

        <p className="text-[10px] text-[#8B8B8B] mt-3 text-center">
          {shortLabel} pricing · ends{' '}
          <span className="font-semibold text-[#D97757]">{endsOn}</span>
          {' '}· {group === 'group A' ? 'Monetary Award' : 'Non-Monetary Award'}
        </p>
      </div>

      <div className="flex items-center justify-center">
        <a
          href={REGISTRATION_URL}
          className="px-12 py-3.5 rounded-lg text-white font-bold text-sm transition-all duration-300 hover:scale-110 shadow-2xl hover:shadow-3xl animate-pulse-glow inline-block text-center"
          style={{ background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})` }}
          data-testid="register-now-button"
        >
          Register Now →
        </a>
      </div>
    </div>
  );
}

// --- Login Required Modal ---
function LoginRequiredModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="relative rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center"
        style={{ backgroundColor: colors.white }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none"
          aria-label="Close"
        >
          &times;
        </button>

        <h3
          className="text-2xl font-bold mb-2"
          style={{ color: colors.textPrimary }}
        >
          Login Required
        </h3>
        <p
          className="text-base mb-8 leading-relaxed"
          style={{ color: colors.textSecondary }}
        >
          You need to be logged in to download the brief and press kit files.
        </p>

        <div className="flex flex-col gap-3">
          <a
            href="/login"
            className="block w-full px-6 py-3 rounded-lg text-white font-semibold text-base transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
            style={{
              background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})`,
            }}
          >
            Go to Login →
          </a>
          <button
            onClick={onClose}
            className="w-full px-6 py-3 rounded-lg font-semibold text-base border transition-all duration-200 hover:bg-gray-50"
            style={{
              color: colors.textSecondary,
              borderColor: colors.borderLight,
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Page ---
export default function CompetitionPage() {
  const [isBriefDownloadOpen, setIsBriefDownloadOpen] = useState(false);
  const [isPressDownloadOpen, setIsPressDownloadOpen] = useState(false);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // null = loading
  const [navOpacity, setNavOpacity] = useState(0);

  // Check auth status on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const fadeStart = 40;
      const fadeEnd = 200;
      const opacity = Math.min(Math.max((scrollY - fadeStart) / (fadeEnd - fadeStart), 0), 1);
      setNavOpacity(opacity);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Gate handler — opens download modal if logged in, otherwise shows login prompt
  const handleDownloadClick = (type: 'brief' | 'press') => {
    // if (!isLoggedIn) {
    //   setIsLoginPromptOpen(true);
    //   return;
    // }
    if (type === 'brief') setIsBriefDownloadOpen(true);
    else setIsPressDownloadOpen(true);
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navigation />
      </div>
      <div style={{ backgroundColor: colors.background }} className="min-h-screen relative overflow-hidden">
        {/* Decorative background elements */}
        <div
          className="fixed top-0 right-1/4 w-[700px] h-[700px] rounded-full blur-3xl opacity-5 pointer-events-none"
          style={{ backgroundColor: colors.accent }}
        />

        {/* Mobile Hero Section */}
        <section className="relative h-dvh flex flex-col items-center justify-end pb-16 px-6 md:hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/thesis-award-2026/cover.webp"
              alt="The Unreal House"
              fill
              className="object-cover object-center"
              priority
            />
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 w-full text-center text-white animate-fade-in">
            <span className="block text-sm font-medium tracking-[0.2em] uppercase text-gray-300 mb-1">
              Architecture Thesis
            </span>
            <span className="block text-sm font-light italic text-gray-400 mb-4">
              edition 02
            </span>
            <h1 className={`${IBMPlexSansCondensedFont.className} text-6xl font-black leading-none mb-3`}>
              Thesis<br />Award
            </h1>
            <p className="text-base font-medium tracking-wide text-gray-300 mb-10">
              Undergraduate Architecture Thesis Recognition Program For Thesis prepared between 2019-2026
            </p>

            <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
              <a

                href="/registration?event_id=3f123e78-60d6-494d-b307-18c5b4c8ab7f"
                className="w-full px-6 py-4 rounded-lg text-white font-bold text-base transition-all duration-300 active:scale-95 shadow-xl text-center"
                style={{
                  background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})`
                }}
              >
                Register Now →
              </a>
              <button
                className="w-full px-6 py-4 rounded-lg text-white font-bold text-base transition-all duration-300 active:scale-95 shadow-xl"
                style={{
                  background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})`
                }}
                onClick={() => handleDownloadClick('brief')}
              >
                Download Brief ↓
              </button>
              <button
                className="w-full px-6 py-4 rounded-lg font-bold text-base border border-white text-white transition-all duration-300 active:scale-95 shadow-xl"
                style={{ background: 'rgba(255,255,255,0.08)' }}
                onClick={() => handleDownloadClick('press')}
              >
                Press Kit ↓
              </button>
            </div>
          </div>
        </section >

        {/* Hero Section with Background Image — Desktop only */}
        <section className="relative min-h-screen hidden md:flex items-center justify-start px-4 sm:px-6 lg:px-8">
          {/* Background Image */}
          < div className="absolute inset-0 z-0" >
            <Image
              src="/thesis-award-2026/cover.webp"
              alt="Imaginative Home Competition"
              fill
              className="object-cover opacity-100"
              priority
            />
          </div >

          {/* Content */}
          < div className="relative z-10 ml-24 mt-10 max-w-5xl text-left text-gray-600 animate-fade-in" >
            <h1 className="">
              <span className={`${IBMPlexSansCondensedFont.className} block text-6xl md:text-8xl lg:text-9xl font-black my-6 leading-tight`}>
                Mind Rain<br />Thesis Award
              </span>
              <span className="block text-xl mb-16 md:text-4xl font-light italic">
                Edition 02
              </span>
              <span className="block text-2xl md:text-4xl font-medium tracking-wide">
                Undergraduate Architecture Thesis Recognition Program For Thesis prepared between 2019-2026
              </span>
            </h1>

            <div className="flex gap-8">
              <a
                href="/registration?event_id=3f123e78-60d6-494d-b307-18c5b4c8ab7f"
                className="mt-16 px-16 py-5 rounded-lg text-white font-bold text-xl transition-all duration-300 hover:scale-110 shadow-2xl hover:shadow-3xl animate-pulse-glow inline-block text-center"
                style={{
                  background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})`
                }}
                data-testid="register-now-button"
              >
                Register Now →
              </a>
              <button
                className="mt-16 px-16 py-5 rounded-lg text-white font-bold text-xl transition-all duration-300 hover:scale-110 shadow-2xl hover:shadow-3xl animate-pulse-glow"
                style={{
                  background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})`
                }}
                data-testid="download-brief-button"
                onClick={() => handleDownloadClick('brief')}
              >
                Download Brief ↓
              </button>
            </div>
          </div >
        </section >

        {/* Prize Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto">
            <h2
              className="text-4xl md:text-5xl font-bold text-center mb-12"
              style={{ color: colors.textPrimary }}
            >
              Prizes & Recognition
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Overall Winner Card */}
              <div
                className="md:col-span-2 relative rounded-2xl p-8 md:p-10 overflow-hidden shadow-xl"
                style={{
                  background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})`,
                }}
              >
                {/* Decorative circles */}
                <div
                  className="absolute -top-10 -right-10 w-52 h-52 rounded-full opacity-10"
                  style={{ backgroundColor: colors.white }}
                />
                <div
                  className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full opacity-10"
                  style={{ backgroundColor: colors.white }}
                />

                <div className="relative z-10">
                  <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-white/70 mb-3">
                    🏆 Overall Winner
                  </span>
                  <div
                    className={`${IBMPlexSansCondensedFont.className} text-6xl md:text-7xl font-black text-white leading-none`}
                  >
                    ₹15,000
                  </div>
                  <p className="text-white/80 text-base mt-4 leading-relaxed max-w-xs">
                    One Overall Winner receives the prize money
                  </p>
                </div>
              </div>

              {/* Honorable Mentions Card */}
              <div
                className="relative rounded-2xl p-8 overflow-hidden shadow-xl flex flex-col justify-between"
                style={{ backgroundColor: colors.white }}
              >
                <div
                  className="absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-5"
                  style={{ backgroundColor: colors.accent }}
                />
                <div className="relative z-10">
                  <span
                    className="inline-block text-xs font-semibold tracking-[0.2em] uppercase mb-3"
                    style={{ color: colors.accent }}
                  >
                    ✦ Honorable Mentions
                  </span>
                  <div
                    className={`${IBMPlexSansCondensedFont.className} text-6xl md:text-7xl font-black leading-none mb-2`}
                    style={{ color: colors.textPrimary }}
                  >
                    20+
                  </div>
                  <p
                    className="text-sm mt-4 leading-relaxed"
                    style={{ color: colors.textSecondary }}
                  >
                    Honorable Mentions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Important Dates Timeline */}
        < section id="timeline" className="py-20 px-4 sm:px-6 lg:px-8" >
          <div className="max-w-5xl mx-auto">
            <h2
              className="text-4xl md:text-5xl font-bold text-center mb-16"
              style={{ color: colors.textPrimary }}
            >
              Important Dates
            </h2>
            <Timeline dates={importantDates} />
          </div>
        </section >

        {/* Registration Fees */}
        < section id="register" className="py-20 px-4 sm:px-6 lg:px-8" >
          <div className="max-w-4xl mx-auto">
            <h2
              className="text-4xl md:text-5xl font-bold text-center mb-12"
              style={{ color: colors.textPrimary }}
            >
              Registration Fees
            </h2>
            <RegistrationFees />
          </div>
        </section >

        {/* Discount Information */}
        < section className="py-20 px-4 sm:px-6 lg:px-8" >
          <div className="max-w-4xl mx-auto">
            <h2
              className="text-4xl md:text-5xl font-bold text-center mb-12"
              style={{ color: colors.textPrimary }}
            >
              Student Discounts
            </h2>

            <div className="rounded-lg p-8 md:p-12" style={{ backgroundColor: colors.white }}>
              <p className="text-lg mb-6 leading-relaxed" style={{ color: colors.textSecondary }}>
                Participate and avail discount <span className="font-bold">Flat 30%</span>
              </p>
              <p className="text-lg mb-6 leading-relaxed" style={{ color: colors.textSecondary }}>
                The Mind Rain Competition Team welcomes participation from universities, colleges, and design schools across the world.
              </p>
              <p className="text-lg mb-6 leading-relaxed" style={{ color: colors.textSecondary }}>
                Students can avail exclusive discounts through group registration offers (valid for <span className="font-bold">20 or more</span> participants registering from the same institution).
              </p>
              <p className="text-lg mb-8 leading-relaxed" style={{ color: colors.textSecondary }}>
                This is a great opportunity for faculty and mentors to encourage students to think creatively and explore imaginative architecture beyond textbooks.
              </p>

              <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: colors.cardBackground }}>
                <h3 className="text-xl font-semibold mb-4" style={{ color: colors.textPrimary }}>
                  To apply for student discounts:
                </h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li style={{ color: colors.textSecondary }}>Email us from your official university e-mail ID</li>
                  <li style={{ color: colors.textSecondary }}>Include your university name, your role, and number of participants</li>
                  <li style={{ color: colors.textSecondary }}>Only recognized university representatives (professors/staff) are eligible to request discounted access on behalf of students</li>
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

        <Footer />
      </div >

      {/* Login Required Modal */}
      < LoginRequiredModal
        isOpen={isLoginPromptOpen}
        onClose={() => setIsLoginPromptOpen(false)
        }
      />

      {/* Download Modals (only reachable when logged in) */}
      <DownloadBriefModal
        isOpen={isBriefDownloadOpen}
        onClose={() => setIsBriefDownloadOpen(false)}
        title="Download Brief"
        subtitle="The Unreal House — select files to download"
        files={TUHBriefFiles}
      />

      <DownloadBriefModal
        isOpen={isPressDownloadOpen}
        onClose={() => setIsPressDownloadOpen(false)}
        title="Download Press"
        subtitle="The Unreal House — select files to download"
        files={TUHPressKitFiles}
      />
    </>
  );
}

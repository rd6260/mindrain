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
import localFont from 'next/font/local';

// ─── Font ─────────────────────────────────────────────────────────────────────

const TechnorFont = localFont({ src: '../../fonts/Technor-Variable.woff2' });

// ─── Static Data ──────────────────────────────────────────────────────────────

const REGISTRATION_EVENT_ID = '3f123e78-60d6-494d-b307-18c5b4c8ab7f';
const REGISTRATION_URL = `/registration?event_id=${REGISTRATION_EVENT_ID}`;

const BRIEF_FILES: BriefFile[] = [
  {
    name: 'Important Dates & Calendar',
    description: 'Key deadlines and schedule',
    url: 'https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/the_unreal_house/Important%20Dates-Calender.pdf',
  },
  {
    name: 'Terms & Conditions',
    description: 'Important rules and regulations',
    url: 'https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/the_unreal_house/T&C%20(Important).pdf',
  },
  {
    name: 'Complete Brief',
    description: 'Full competition brief document',
    url: 'https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/the_unreal_house/The%20Unreal%20House%20(Complete%20Brief).pdf',
  },
  {
    name: 'Brief (Print Format)',
    description: 'Print-ready version of the brief',
    url: 'https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/the_unreal_house/The%20Unreal%20House%20(print%20format).pdf',
  },
];

const PRESS_KIT_FILES: BriefFile[] = [
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
  { label: 'Competition Starts',           date: '19 February 2026' },
  { label: 'Early Bird Registration Starts', date: '19 February 2026' },
  { label: 'Early Bird Registration Ends',   date: '22 March 2026'   },
  { label: 'Advance Registration Starts',    date: '23 March 2026'   },
  { label: 'Final Submission Starts',        date: '1 April 2026'    },
  { label: 'Advance Registration Ends',      date: '31 May 2026'     },
  { label: 'Late Registration Starts',       date: '1 June 2026'     },
  { label: 'Late Registration Ends',         date: '25 June 2026'    },
  { label: 'Final Submission Ends',          date: '30 June 2026'    },
  { label: 'Announcement of Result',         date: '1 August 2026'   },
];

const PRIZES = [
  { label: '1st Prize', amount: '₹11,000', emoji: '🥇' },
  { label: '2nd Prize', amount: '₹8,000',  emoji: '🥈' },
  { label: '3rd Prize', amount: '₹6,000',  emoji: '🥉' },
];

// ─── Registration Fees Data ───────────────────────────────────────────────────

type Tier = 'Early Bird Registration' | 'Regular Registration' | 'Last Minute Registration';
type FeeKey = 'india_monetary' | 'india_no_monetary' | 'international';
type EntryType = 'solo' | 'group';

const FEES: Record<Tier, Record<FeeKey, Record<EntryType, string>>> = {
  'Early Bird Registration': {
    india_monetary:    { solo: '₹549',  group: '₹999'   },
    india_no_monetary: { solo: '₹275',  group: '₹559'   },
    international:     { solo: '$35',   group: '$79'    },
  },
  'Regular Registration': {
    india_monetary:    { solo: '₹699',  group: '₹1,499' },
    india_no_monetary: { solo: '₹275',  group: '₹559'   },
    international:     { solo: '$45',   group: '$99'    },
  },
  'Last Minute Registration': {
    india_monetary:    { solo: '₹999',  group: '₹1,999' },
    india_no_monetary: { solo: '₹375',  group: '₹819'   },
    international:     { solo: '$69',   group: '$149'   },
  },
};

const TIER_META: Record<Tier, { shortLabel: string; color: string; bg: string; border: string; dot: string; endsOn: string }> = {
  'Early Bird Registration': {
    shortLabel: 'Early Bird',
    color:  'text-[#2D5F4F]',
    bg:     'bg-[#2D5F4F]/8',
    border: 'border-[#2D5F4F]/20',
    dot:    'bg-[#2D5F4F]',
    endsOn: '22 March 2026',
  },
  'Regular Registration': {
    shortLabel: 'Regular',
    color:  'text-[#1A1A1A]',
    bg:     'bg-[#F8F7F2]',
    border: 'border-[#D0CEC2]',
    dot:    'bg-[#6B6B6B]',
    endsOn: '31 May 2026',
  },
  'Last Minute Registration': {
    shortLabel: 'Last Minute',
    color:  'text-[#D97757]',
    bg:     'bg-[#D97757]/8',
    border: 'border-[#D97757]/20',
    dot:    'bg-[#D97757]',
    endsOn: '25 June 2026',
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

function MobileHero({ onBriefClick, onPressClick }: { onBriefClick: () => void; onPressClick: () => void }) {
  return (
    <section className="relative h-dvh flex flex-col items-center justify-end pb-16 px-6 md:hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/the-unreal-house/TUH-cover.jpg"
          alt="The Unreal House"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      </div>

      <div className="relative z-10 w-full text-center text-white animate-fade-in">
        <span className="block text-sm font-medium tracking-[0.2em] uppercase text-gray-300 mb-1">
          Architecture Competition
        </span>
        <span className="block text-sm font-light italic text-gray-400 mb-4">edition 06</span>
        <h1 className={`${TechnorFont.className} text-6xl font-black leading-none mb-3`}>
          The Unreal<br />House
        </h1>
        <p className="text-base font-medium tracking-wide text-gray-300 mb-10">
          An Imaginary Home Design Challenge
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
          <a
            href={REGISTRATION_URL}
            className="w-full px-6 py-4 rounded-lg text-white font-bold text-base transition-all duration-300 active:scale-95 shadow-xl text-center"
            style={{ background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})` }}
          >
            Register Now →
          </a>
          <button
            className="w-full px-6 py-4 rounded-lg text-white font-bold text-base transition-all duration-300 active:scale-95 shadow-xl"
            style={{ background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})` }}
            onClick={onBriefClick}
          >
            Download Brief ↓
          </button>
          <button
            className="w-full px-6 py-4 rounded-lg font-bold text-base border border-white text-white transition-all duration-300 active:scale-95 shadow-xl"
            style={{ background: 'rgba(255,255,255,0.08)' }}
            onClick={onPressClick}
          >
            Press Kit ↓
          </button>
        </div>
      </div>
    </section>
  );
}

function DesktopHero({ onBriefClick, onPressClick }: { onBriefClick: () => void; onPressClick: () => void }) {
  return (
    <section className="relative min-h-screen hidden md:flex items-center justify-start px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 z-0">
        <Image
          src="/competition-hero.jpg"
          alt="Imaginative Home Competition"
          fill
          className="object-cover opacity-100"
          priority
        />
      </div>

      <div className="relative z-10 ml-24 mt-10 max-w-5xl text-left text-gray-200 animate-fade-in">
        <h1 className="space-y-4">
          <span className="block text-2xl md:text-4xl font-medium tracking-wide">Architecture Competition</span>
          <span className="block text-xl md:text-2xl font-light italic">edition 06</span>
          <span className="font-['Technor-Variable'] block text-6xl md:text-8xl lg:text-9xl font-black my-6 leading-tight">
            The Unreal House
          </span>
          <span className="block text-2xl md:text-4xl font-medium tracking-wide">
            An Imaginary Home Design Challenge
          </span>
        </h1>

        <div className="flex gap-8">
          <GradientButton href={REGISTRATION_URL} className="mt-16" testId="register-now-button">
            Register Now →
          </GradientButton>
          <GradientButton onClick={onBriefClick} className="mt-16" testId="download-brief-button">
            Download Brief ↓
          </GradientButton>
          <button
            className="group relative overflow-hidden border border-white mt-16 px-16 py-5 rounded-lg font-bold text-xl shadow-2xl cursor-pointer"
            onClick={onPressClick}
          >
            <span
              className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]"
              style={{ background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})` }}
            />
            <span className="relative z-10 uppercase text-white group-hover:text-white transition-colors duration-500">
              Press Kit ↓
            </span>
          </button>
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

function RegistrationFees() {
  const [origin, setOrigin]     = useState<'india' | 'international'>('india');
  const [monetary, setMonetary] = useState<'yes' | 'no'>('yes');
  const [teamType, setTeamType] = useState<EntryType>('solo');

  const activeTier = getCurrentTier();
  const { shortLabel, color, bg, border, dot, endsOn } = TIER_META[activeTier];

  const feeKey: FeeKey =
    origin === 'international' ? 'international'
    : monetary === 'yes'       ? 'india_monetary'
    :                            'india_no_monetary';

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
          <ToggleButton active={origin === 'india'}         onClick={() => setOrigin('india')}>Indian Application</ToggleButton>
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
          <ToggleButton active={teamType === 'solo'}  onClick={() => setTeamType('solo')}>
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
        <GradientButton href={REGISTRATION_URL} className="!px-12 !py-3.5 !text-sm" testId="register-now-button">
          Register Now →
        </GradientButton>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CompetitionPage() {
  const [isBriefOpen, setIsBriefOpen]   = useState(false);
  const [isPressOpen, setIsPressOpen]   = useState(false);
  const [isLoggedIn, setIsLoggedIn]     = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => setIsLoggedIn(!!session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setIsLoggedIn(!!session));
    return () => subscription.unsubscribe();
  }, []);

  const openBrief = () => setIsBriefOpen(true);
  const openPress = () => setIsPressOpen(true);

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

        <MobileHero  onBriefClick={openBrief} onPressClick={openPress} />
        <DesktopHero onBriefClick={openBrief} onPressClick={openPress} />

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
            <RegistrationFees />
          </div>
        </section>

        <StudentDiscounts />
        <Footer />
      </div>

      <DownloadBriefModal
        isOpen={isBriefOpen}
        onClose={() => setIsBriefOpen(false)}
        title="Download Brief"
        subtitle="The Unreal House — select files to download"
        files={BRIEF_FILES}
      />
      <DownloadBriefModal
        isOpen={isPressOpen}
        onClose={() => setIsPressOpen(false)}
        title="Download Press"
        subtitle="The Unreal House — select files to download"
        files={PRESS_KIT_FILES}
      />
    </>
  );
}

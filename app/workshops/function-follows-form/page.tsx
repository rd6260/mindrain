'use client';

import Image from 'next/image';
import { colors } from '@/utils/colors';
import Footer from '@/app/components/Footer';
import Timeline from '@/app/components/Timeline';
import Navigation from '@/app/components/Navigation';
import BriefModal from '@/app/components/BriefModal';
import { useEffect, useState } from 'react';
import localFont from 'next/font/local';
import { FUNCTION_FOLLOWS_FORM } from '@/config/projects';
import { getCdnUrl } from '@/utils/cdn'
import {
  MapPin,
  Clock,
  Users,
  CalendarCheck,
  Building2,
  Utensils,
  PencilRuler,
  Laptop,
  Gift,
  Award,
} from 'lucide-react';

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

const REGISTRATION_EVENT_ID = FUNCTION_FOLLOWS_FORM.eventId;
const meta = FUNCTION_FOLLOWS_FORM.brief.meta;
const REGISTRATION_URL = FUNCTION_FOLLOWS_FORM.registrationPath;

const INTRODUCTION_TEXT =
  'An immersive architectural design workshop that challenges conventional thinking through concept development, form exploration, spatial experimentation and hands-on model making. Discover how ideas evolve into meaningful architectural spaces through guided design exercises and critical discussions.';

const DESIGNED_FOR = [
  'First- and second-year architecture students.',
  'Open to students from all years of architectural education.',
  'Beginners welcome. No advanced design experience required.',
];

const WORKSHOP_OVERVIEW = [
  { label: 'Duration', icon: Clock, values: ['3 Days Online', '6 Days Offline'] },
  { label: 'Location', icon: MapPin, values: ['Hyderabad, India'] },
  { label: 'Capacity', icon: Users, values: ['20 Participants'] },
];

const WORKSHOP_SCHEDULE = [
  {
    mode: 'Online',
    dates: '12–14 December 2026',
    description: '3 Days of Online Classes',
    badgeBg: 'rgba(59, 130, 246, 0.12)',
    badgeColor: '#3B82F6',
  },
  {
    mode: 'Offline',
    dates: '18–23 December 2026',
    description: '6 Days of On-site Workshop',
    badgeBg: 'rgba(34, 197, 94, 0.12)',
    badgeColor: '#22A55A',
  },
];

const REGISTRATION_WINDOW = {
  range: '01 Nov – 10 Dec 2026',
  note: 'Applications close on 10 December 2026.',
};

const FACILITIES_HEADING = 'Your Workshop Experience';
const FACILITIES_DESCRIPTION =
  'More than just a workshop. Everything arranged to make your design journey comfortable, engaging and rewarding.';

const FACILITIES = [
  { icon: Building2,   title: 'Accommodation',    description: '3-star or above hotel stay' },
  { icon: Utensils,    title: 'Daily Meals',      description: 'Breakfast, lunch & evening snacks' },
  { icon: PencilRuler, title: 'Design Materials', description: 'Stationery & model-making supplies' },
  { icon: Laptop,      title: 'Online Sessions',  description: '3 days of online classes' },
  { icon: Gift,        title: 'Goodies',          description: 'Workshop merchandise & surprises' },
  { icon: Award,       title: 'Certification',    description: 'Completion / Best Design Certificates' },
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


// ─── Sections ─────────────────────────────────────────────────────────────────

function MobileHero() {
  return (
    <section className="relative h-dvh flex flex-col items-start justify-start pt-24 px-6 md:hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/workshops/function-follows-form/function-follows-form-hero-portrait-v2.png"
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
            Think beyond the box. <br/> Design with intent. <br/>2026-27
          </span>
          <span className="block text-lg font-medium tracking-wide mt-4">
            ARCHITECTURE<br/>DESIGN WORKSHOP <span className="text-sm font-light italic"># Edition 02</span>
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
          Apply Now →
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
              Apply Now →
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

function Introduction() {
  return (
    <section id="introduction" className="pt-24 pb-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto animate-fade-in-up">
        <h2 className="text-3xl md:text-4xl font-bold mb-5" style={{ color: colors.textPrimary }}>
          Introduction
        </h2>
        <p className="text-lg md:text-xl leading-relaxed" style={{ color: colors.textSecondary }}>
          {INTRODUCTION_TEXT}
        </p>
      </div>
    </section>
  );
}

function DesignedFor() {
  return (
    <section id="designed-for" className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto animate-fade-in-up">
        <h2
          className="text-sm md:text-base font-bold uppercase tracking-widest mb-5"
          style={{ color: colors.textPrimary }}
        >
          Designed For
        </h2>
        <ul className="space-y-3">
          {DESIGNED_FOR.map((item) => (
            <li key={item} className="flex items-start gap-3 text-lg" style={{ color: colors.textSecondary }}>
              <span
                className="mt-2.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: colors.accent }}
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function WorkshopOverview() {
  return (
    <section id="overview" className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div
          className="rounded-lg p-8 md:p-10 animate-fade-in-up"
          style={{ backgroundColor: colors.white, borderColor: colors.borderLight }}
        >
          <h3 className="text-2xl font-bold mb-6 pb-4 border-b-2" style={{ color: colors.textPrimary }}>
            Workshop Overview
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-10 gap-y-8">
            {WORKSHOP_OVERVIEW.map(({ label, icon: Icon, values }) => (
              <div key={label}>
                <div className="flex items-center gap-3 mb-3">
                  <Icon size={20} style={{ color: colors.textSecondary }} />
                  <h4 className="text-lg font-bold uppercase" style={{ color: colors.textPrimary }}>
                    {label}
                  </h4>
                </div>
                <div className="space-y-1">
                  {values.map((v) => (
                    <p key={v} className="text-lg" style={{ color: colors.textSecondary }}>
                      {v}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkshopSchedule() {
  return (
    <section id="schedule" className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div
          className="rounded-lg p-8 md:p-10 animate-fade-in-up"
          style={{ backgroundColor: colors.white, borderColor: colors.borderLight }}
        >
          <h3 className="text-2xl font-bold mb-6 pb-4 border-b-2" style={{ color: colors.textPrimary }}>
            Workshop Schedule
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
            {WORKSHOP_SCHEDULE.map(({ mode, dates, description, badgeBg, badgeColor }) => (
              <div key={mode}>
                <span
                  className="inline-block px-3 py-1 rounded-full text-sm font-medium uppercase tracking-wide mb-3"
                  style={{ backgroundColor: badgeBg, color: badgeColor }}
                >
                  {mode}
                </span>
                <h4 className="text-lg font-bold mb-1" style={{ color: colors.textPrimary }}>
                  {dates}
                </h4>
                <p className="text-lg" style={{ color: colors.textSecondary }}>
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RegistrationWindow() {
  return (
    <section id="registration-window" className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div
          className="rounded-lg p-8 md:p-10 animate-fade-in-up"
          style={{ backgroundColor: colors.white, borderColor: colors.borderLight }}
        >
          <h3 className="text-2xl font-bold mb-6 pb-4 border-b-2" style={{ color: colors.textPrimary }}>
            Registration Window
          </h3>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <CalendarCheck size={20} style={{ color: colors.textSecondary }} />
              <h4 className="text-lg font-bold uppercase" style={{ color: colors.textPrimary }}>
                {REGISTRATION_WINDOW.range}
              </h4>
            </div>
            <p className="text-lg" style={{ color: colors.textSecondary }}>
              {REGISTRATION_WINDOW.note}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Facilities() {
  return (
    <section id="facilities" className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div
          className="rounded-lg p-8 md:p-10 animate-fade-in-up"
          style={{ backgroundColor: colors.white, borderColor: colors.borderLight }}
        >
          <h3 className="text-2xl font-bold mb-3" style={{ color: colors.textPrimary }}>
            {FACILITIES_HEADING}
          </h3>
          <p className="text-lg leading-relaxed mb-6 pb-6 border-b-2" style={{ color: colors.textSecondary }}>
            {FACILITIES_DESCRIPTION}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10">
            {FACILITIES.map(({ icon: Icon, title, description }) => (
              <div key={title}>
                <Icon size={26} className="mb-5" style={{ color: colors.textSecondary }} />
                <h4 className="text-xl font-bold mb-1" style={{ color: colors.textPrimary }}>
                  {title}
                </h4>
                <p className="text-lg" style={{ color: colors.textSecondary }}>
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function InterestedInApplying({
  onBriefClick,
  onRegisterClick,
}: {
  onBriefClick: () => void;
  onRegisterClick: () => void;
}) {
  return (
    <section id="apply" className="pt-6 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
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
            questions, and may submit a LOR (Letter of Recommendation) from an Architectural Design
            faculty member who has taught them. The LOR becomes mandatory for applicants who are selected
            after the interview round.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onRegisterClick}
              className="px-8 py-3 rounded-lg text-white font-semibold transition-all hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})` }}
              data-testid="overview-apply-now-button"
            >
              Apply Now →
            </button>
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
      </div>
    </section>
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

        {/* Hero */}
        <MobileHero />
        <DesktopHero onBriefClick={() => setIsBriefOpen(true)} onRegisterClick={handleRegisterClick} />
        <MobileCTAButtons onBriefClick={() => setIsBriefOpen(true)} onRegisterClick={handleRegisterClick} />

        {/* Content flow */}
        <Introduction />
        <DesignedFor />
        <WorkshopOverview />
        <WorkshopSchedule />
        <RegistrationWindow />
        <Facilities />
        <InterestedInApplying
          onBriefClick={() => setIsBriefOpen(true)}
          onRegisterClick={handleRegisterClick}
        />

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

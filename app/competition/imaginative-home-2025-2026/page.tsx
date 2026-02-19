'use client';

import Image from 'next/image';
import { colors } from '@/utils/colors';
import Footer from '@/app/components/Footer';
import Timeline from '@/app/components/Timeline';
import { ImportantDate } from '@/types';
import DownloadBriefModal, { BriefFile } from '@/app/components/DownloadModal';
import { useEffect, useState } from 'react';
import Navigation from '@/app/components/Navigation';
import RegistrationFees from '@/app/components/RegistrationFees';
import { createClient } from '@/lib/supabase/client';


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
  { label: 'Competition Starts', date: '19 February 2026' },
  { label: 'Early Bird Registration Starts', date: '19 February 2026' },
  { label: 'Early Bird Registration Ends', date: '15 March 2026' },
  { label: 'Advance Registration Starts', date: '16 March 2026' },
  { label: 'Final Submission Starts', date: '1 April 2026' },
  { label: 'Advance Registration Ends', date: '31 May 2026' },
  { label: 'Late Registration Starts', date: '1 June 2026' },
  { label: 'Late Registration Ends', date: '25 June 2026' },
  { label: 'Final Submission Ends', date: '30 June 2026' },
  { label: 'Announcement of Result', date: '1 August 2026' },
];

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
    if (!isLoggedIn) {
      setIsLoginPromptOpen(true);
      return;
    }
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

        {/* Hero Section with Background Image */}
        <section className="relative min-h-screen flex items-center justify-start px-4 sm:px-6 lg:px-8">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/competition-hero.jpg"
              alt="Imaginative Home Competition"
              fill
              className="object-cover opacity-100"
              priority
            />
          </div>

          {/* Content */}
          <div className="relative z-10 ml-24 mt-10 max-w-5xl text-left text-gray-200 animate-fade-in">
            <h1 className="space-y-4">
              <span className="block text-2xl md:text-4xl font-medium tracking-wide">
                Architecture Competition
              </span>
              <span className="block text-xl md:text-2xl font-light italic">
                edition 06
              </span>
              <span className="font-['Technor-Variable'] block text-6xl md:text-8xl lg:text-9xl font-black my-6 leading-tight">
                The Unreal House
              </span>
              <span className="block text-2xl md:text-4xl font-medium tracking-wide">
                An Imaginary Home Design Challenge
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
              <button
                className="group relative overflow-hidden border border-white mt-16 px-16 py-5 rounded-lg font-bold text-xl shadow-2xl cursor-pointer"
                onClick={() => handleDownloadClick('press')}
              >
                <span
                  className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]"
                  style={{
                    background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})`
                  }}
                />
                <span className="relative z-10 uppercase text-white group-hover:text-white transition-colors duration-500">
                  Press Kit ↓
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Prize Pool Section */}
        <section className="py-28 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 ">
                Prize Pool
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              {/* Category 1 */}
              <div
                className="rounded-lg p-10 shadow-xl hover-lift animate-fade-in-up border-2"
                style={{ backgroundColor: colors.white, borderColor: colors.borderLight }}
              >
                <h3
                  className="text-xl font-bold mb-8 pb-4 border-b-2"
                >
                  Category 1 (1st & 2nd Year)
                </h3>
                <div className="space-y-6">
                  {[
                    { label: '1st Prize', amount: '₹11,000', emoji: '🥇' },
                    { label: '2nd Prize', amount: '₹8,000', emoji: '🥈' },
                    { label: '3rd Prize', amount: '₹6,000', emoji: '🥉' },
                  ].map((prize, idx) => (
                    <div key={idx} className="flex justify-between items-center group p-4 rounded-xl transition-all">
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

              {/* Category 2 */}
              <div
                className="rounded-lg p-10 shadow-xl hover-lift animate-fade-in-up border-2"
                style={{ backgroundColor: colors.white, borderColor: colors.borderLight, animationDelay: '0.2s' }}
              >
                <h3
                  className="text-xl font-bold mb-8 pb-4 border-b-2"
                >
                  Category 2 (3rd, 4th & 5th Year)
                </h3>
                <div className="space-y-6">
                  {[
                    { label: '1st Prize', amount: '₹11,000', emoji: '🥇' },
                    { label: '2nd Prize', amount: '₹8,000', emoji: '🥈' },
                    { label: '3rd Prize', amount: '₹6,000', emoji: '🥉' },
                  ].map((prize, idx) => (
                    <div key={idx} className="flex justify-between items-center group p-4 rounded-xl transition-all">
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
            </div>

            <div className="mt-8">
              <span className="">
                <sup>*</sup>This Monetary Awards will be given to Group A Participants only, Read full brief and <sup>*</sup>T&C Documents carefully for more information.
              </span>
            </div>
          </div>
        </section>

        {/* Important Dates Timeline */}
        <section id="timeline" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2
              className="text-4xl md:text-5xl font-bold text-center mb-16"
              style={{ color: colors.textPrimary }}
            >
              Important Dates
            </h2>
            <Timeline dates={importantDates} />
          </div>
        </section>

        {/* Registration Fees */}
        <section id="register" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2
              className="text-4xl md:text-5xl font-bold text-center mb-12"
              style={{ color: colors.textPrimary }}
            >
              Registration Fees
            </h2>
            <RegistrationFees />
          </div>
        </section>

        {/* Discount Information */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2
              className="text-4xl md:text-5xl font-bold text-center mb-12"
              style={{ color: colors.textPrimary }}
            >
              Student Discounts
            </h2>

            <div className="rounded-lg p-8 md:p-12" style={{ backgroundColor: colors.white }}>
              <p className="text-lg mb-6 leading-relaxed" style={{ color: colors.textSecondary }}>
                Participate and avail discount <span className="font-bold">Flat 35%</span>
              </p>
              <p className="text-lg mb-6 leading-relaxed" style={{ color: colors.textSecondary }}>
                The Mind Rain Competition Team welcomes participation from universities, colleges, and design schools across the world.
              </p>
              <p className="text-lg mb-6 leading-relaxed" style={{ color: colors.textSecondary }}>
                Students can avail exclusive discounts through group registration offers (valid for <span className="font-bold">30 or more</span> participants registering from the same institution).
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
                  href="mailto:contact@mindrain.org"
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

        <Footer />
      </div>

      {/* Login Required Modal */}
      <LoginRequiredModal
        isOpen={isLoginPromptOpen}
        onClose={() => setIsLoginPromptOpen(false)}
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

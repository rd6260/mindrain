'use client';

import { useState } from 'react';
import Image from 'next/image';
import { colors } from '@/utils/colors';
import Footer from '@/components/Footer';
import Timeline from '@/components/Timeline';
import RegistrationModal from '@/components/RegistrationModal';
import { ImportantDate } from '@/types';

const importantDates: ImportantDate[] = [
  { label: 'Campaign Start Date', date: '25 January 2026' },
  { label: 'Competition Starts', date: '2 February 2026' },
  { label: 'Early Bird Registration Starts', date: '2 February 2026' },
  { label: 'Early Bird Registration Ends', date: '28 February 2026' },
  { label: 'Advance Registration Starts', date: '1 March 2026' },
  { label: 'Final Submission Starts', date: '1 April 2026' },
  { label: 'Advance Registration Ends', date: '31 May 2026' },
  { label: 'Late Registration Starts', date: '1 June 2026' },
  { label: 'Late Registration Ends', date: '25 June 2026' },
  { label: 'Final Submission Ends', date: '30 June 2026' },
  { label: 'Announcement of Result', date: '27 July 2026' },
];

export default function CompetitionPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div style={{ backgroundColor: colors.background }} className="min-h-screen relative overflow-hidden">
      {/* Decorative background elements */}
      <div 
        className="fixed top-0 right-1/4 w-[700px] h-[700px] rounded-full blur-3xl opacity-5 pointer-events-none"
        style={{ backgroundColor: colors.accent }}
      />
      
      {/* Hero Section with Background Image */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/competition-hero.png"
            alt="Imaginative Home Competition"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div 
            className="absolute inset-0"
            style={{ 
              background: `linear-gradient(135deg, ${colors.background}DD, ${colors.background}EE)` 
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl text-center animate-fade-in">
          <h1 className="space-y-4">
            <span 
              className="block text-2xl md:text-4xl font-medium tracking-wide"
              style={{ color: colors.textSecondary }}
            >
              Architecture Competition
            </span>
            <span 
              className="block text-xl md:text-2xl font-light italic"
              style={{ color: colors.textLight }}
            >
              edition 05
            </span>

            <span 
              className="block text-6xl md:text-8xl lg:text-9xl font-black my-6 gradient-text leading-tight"
            >
              The Unreal House
            </span>
            <span 
              className="block text-2xl md:text-4xl font-medium tracking-wide"
              style={{ color: colors.textSecondary }}
            >
              An Imaginary Home Design Challenge
            </span>
          </h1>

          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-16 px-16 py-5 rounded-full text-white font-bold text-xl transition-all duration-300 hover:scale-110 shadow-2xl hover:shadow-3xl animate-pulse-glow"
            style={{ 
              background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})` 
            }}
            data-testid="register-now-button"
          >
            Register Now →
          </button>
        </div>
      </section>

      {/* Prize Pool Section */}
      <section className="py-28 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 
              className="text-5xl md:text-6xl font-bold mb-6 gradient-text"
            >
              Prize Pool
            </h2>
            <div 
              className="w-32 h-1.5 mx-auto rounded-full"
              style={{ 
                background: `linear-gradient(90deg, transparent, ${colors.accent}, transparent)` 
              }}
            />
          </div>

          <div 
            className="text-center mb-16 p-10 rounded-2xl shadow-2xl animate-fade-in-up glass"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
          >
            <p 
              className="text-5xl font-black gradient-text"
            >
              Total Prize Pool: ₹50,000+
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Category 1 */}
            <div 
              className="rounded-3xl p-10 shadow-xl hover-lift animate-fade-in-up border-2"
              style={{ 
                backgroundColor: colors.white,
                borderColor: colors.borderLight 
              }}
            >
              <h3 
                className="text-3xl font-bold mb-8 pb-4 border-b-2"
                style={{ 
                  color: colors.accent,
                  borderColor: colors.accent 
                }}
              >
                Category 1
              </h3>
              <div className="space-y-6">
                {[
                  { label: '1st Prize', amount: '₹11,000', emoji: '🥇' },
                  { label: '2nd Prize', amount: '₹8,000', emoji: '🥈' },
                  { label: '3rd Prize', amount: '₹6,000', emoji: '🥉' },
                ].map((prize, idx) => (
                  <div key={idx} className="flex justify-between items-center group p-4 rounded-xl transition-all hover:bg-gray-50">
                    <span 
                      className="text-xl font-medium flex items-center gap-3"
                      style={{ color: colors.textSecondary }}
                    >
                      <span className="text-3xl">{prize.emoji}</span>
                      {prize.label}
                    </span>
                    <span 
                      className="text-3xl font-black group-hover:scale-110 transition-transform"
                      style={{ color: colors.textPrimary }}
                    >
                      {prize.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category 2 */}
            <div 
              className="rounded-3xl p-10 shadow-xl hover-lift animate-fade-in-up border-2"
              style={{ 
                backgroundColor: colors.white,
                borderColor: colors.borderLight,
                animationDelay: '0.2s'
              }}
            >
              <h3 
                className="text-3xl font-bold mb-8 pb-4 border-b-2"
                style={{ 
                  color: colors.accent,
                  borderColor: colors.accent 
                }}
              >
                Category 2
              </h3>
              <div className="space-y-6">
                {[
                  { label: '1st Prize', amount: '₹11,000', emoji: '🥇' },
                  { label: '2nd Prize', amount: '₹8,000', emoji: '🥈' },
                  { label: '3rd Prize', amount: '₹6,000', emoji: '🥉' },
                ].map((prize, idx) => (
                  <div key={idx} className="flex justify-between items-center group p-4 rounded-xl transition-all hover:bg-gray-50">
                    <span 
                      className="text-xl font-medium flex items-center gap-3"
                      style={{ color: colors.textSecondary }}
                    >
                      <span className="text-3xl">{prize.emoji}</span>
                      {prize.label}
                    </span>
                    <span 
                      className="text-3xl font-black group-hover:scale-110 transition-transform"
                      style={{ color: colors.textPrimary }}
                    >
                      {prize.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
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
        <div className="max-w-6xl mx-auto">
          <h2 
            className="text-4xl md:text-5xl font-bold text-center mb-12"
            style={{ color: colors.textPrimary }}
          >
            Registration Fees
          </h2>

          <div className="space-y-8">
            {/* Early Bird */}
            <div 
              className="rounded-2xl p-8"
              style={{ backgroundColor: colors.white }}
            >
              <h3 
                className="text-2xl font-bold mb-6"
                style={{ color: colors.accent }}
              >
                Early Bird Registration
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 
                    className="font-semibold mb-3"
                    style={{ color: colors.textPrimary }}
                  >
                    Indian Applications
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span style={{ color: colors.textSecondary }}>Solo:</span>
                      <span className="font-semibold">₹349</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: colors.textSecondary }}>Group:</span>
                      <span className="font-semibold">₹999</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 
                    className="font-semibold mb-3"
                    style={{ color: colors.textPrimary }}
                  >
                    International Applications
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span style={{ color: colors.textSecondary }}>Solo:</span>
                      <span className="font-semibold">$25</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: colors.textSecondary }}>Group:</span>
                      <span className="font-semibold">$69</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Advance */}
            <div 
              className="rounded-2xl p-8"
              style={{ backgroundColor: colors.white }}
            >
              <h3 
                className="text-2xl font-bold mb-6"
                style={{ color: colors.accent }}
              >
                Advance Registration
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 
                    className="font-semibold mb-3"
                    style={{ color: colors.textPrimary }}
                  >
                    Indian Applications
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span style={{ color: colors.textSecondary }}>Solo:</span>
                      <span className="font-semibold">₹699</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: colors.textSecondary }}>Group:</span>
                      <span className="font-semibold">₹1,499</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 
                    className="font-semibold mb-3"
                    style={{ color: colors.textPrimary }}
                  >
                    International Applications
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span style={{ color: colors.textSecondary }}>Solo:</span>
                      <span className="font-semibold">$35</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: colors.textSecondary }}>Group:</span>
                      <span className="font-semibold">$99</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Late */}
            <div 
              className="rounded-2xl p-8"
              style={{ backgroundColor: colors.white }}
            >
              <h3 
                className="text-2xl font-bold mb-6"
                style={{ color: colors.accent }}
              >
                Late Minute Registration
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 
                    className="font-semibold mb-3"
                    style={{ color: colors.textPrimary }}
                  >
                    Indian Applications
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span style={{ color: colors.textSecondary }}>Solo:</span>
                      <span className="font-semibold">₹999</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: colors.textSecondary }}>Group:</span>
                      <span className="font-semibold">₹1,999</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 
                    className="font-semibold mb-3"
                    style={{ color: colors.textPrimary }}
                  >
                    International Applications
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span style={{ color: colors.textSecondary }}>Solo:</span>
                      <span className="font-semibold">$49</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: colors.textSecondary }}>Group:</span>
                      <span className="font-semibold">$129</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-12 py-4 rounded-full text-white font-semibold text-lg transition-all hover:opacity-90"
              style={{ backgroundColor: colors.accent }}
              data-testid="register-fees-button"
            >
              Register Now
            </button>
          </div>
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

          <div 
            className="rounded-2xl p-8 md:p-12"
            style={{ backgroundColor: colors.white }}
          >
            <p 
              className="text-lg mb-6 leading-relaxed"
              style={{ color: colors.textSecondary }}
            >
              Participate and avail discount <span className="font-bold">Flat 40%</span>
            </p>
            <p 
              className="text-lg mb-6 leading-relaxed"
              style={{ color: colors.textSecondary }}
            >
              The Mind Rain Competition Team welcomes participation from universities, colleges, and design schools
              across the world.
            </p>
            
            <p 
              className="text-lg mb-6 leading-relaxed"
              style={{ color: colors.textSecondary }}
            >
              Students can avail exclusive discounts through group registration offers (valid for <span className="font-bold">30 or more</span> participants
              registering from the same institution).
            </p>

            <p 
              className="text-lg mb-8 leading-relaxed"
              style={{ color: colors.textSecondary }}
            >
              This is a great opportunity for faculty and mentors to encourage students to think creatively and explore
              imaginative architecture beyond textbooks.
            </p>

            <div 
              className="rounded-xl p-6 mb-6"
              style={{ backgroundColor: colors.cardBackground }}
            >
              <h3 
                className="text-xl font-semibold mb-4"
                style={{ color: colors.textPrimary }}
              >
                To apply for student discounts:
              </h3>
              <ul className="space-y-2 list-disc list-inside">
                <li style={{ color: colors.textSecondary }}>
                  Email us from your official university e-mail ID
                </li>
                <li style={{ color: colors.textSecondary }}>
                  Include your university name, your role, and number of participants
                </li>
                <li style={{ color: colors.textSecondary }}>
                  Only recognized university representatives (professors/staff) are eligible to request discounted access on behalf of students
                </li>
              </ul>
            </div>

            <div className="text-center">
              <a
                href="mailto:contact@mindrain.org"
                className="inline-block px-8 py-3 rounded-full text-white font-medium transition-all hover:opacity-90"
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
      
      <RegistrationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}

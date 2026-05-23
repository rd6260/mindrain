'use client';
import { useState, useEffect } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { Winner } from '@/types';
import Navigation from '@/app/components/Navigation';
import Footer from '@/app/components/Footer';
import { colors } from '@/utils/colors';
import { previousWinners2019 } from '@/data/winners';
import LiveCompetitionCard from '@/app/components/LiveCompetitionCard';
import WinnerCard from '@/app/components/WinnerCard';
import localFont from "next/font/local";
import GuestJury from '../components/GuestJuryComponent';

const FEARLogo = localFont({
  src: "../fonts/FEARLogo-Regular.woff2"
})




export default function HomePage() {
  const category1Winners = previousWinners2019.categories[0].winners;
  const category2Winners = previousWinners2019.categories[1].winners;
  const honorableMentions = previousWinners2019.categories[2].winners;

  // const [showPopup, setShowPopup] = useState(false);

  // useEffect(() => {
  //   // Show the popup soon after mounting
  //   const timer = setTimeout(() => setShowPopup(true), 500);
  //   return () => clearTimeout(timer);
  // }, []);

  return (
    <div style={{ backgroundColor: colors.background }} className="min-h-screen">
      <Navigation />

      {/* Date Extension Popup */}
      {/* 
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#F8F7F2] rounded-2xl p-8 max-w-md w-full shadow-2xl relative border border-[#D0CEC2]">
            <button 
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#2D5F4F]/10 text-[#2D5F4F] rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Important Update</h3>
              <p className="text-[#6B6B6B] leading-relaxed mb-6">
                <strong>The Unreal House</strong> early bird registration last date has been extended to <span className="text-[#2D5F4F] font-bold">22nd March 2026</span>.
              </p>
              <button 
                onClick={() => setShowPopup(false)}
                className="w-full py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
                style={{ backgroundColor: colors.accent, color: colors.white }}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
      */}
      

      {/* Hero Section */}
      <section className="relative text-black w-full overflow-hidden">

        {/* hero text */}
        <div className="flex items-center px-8 md:px-24 mt-40">
          <div className="max-w-6xl text-left">
            <h1 className="font-bold text-6xl md:text-8xl mb-6 tracking-tight">
              Where Every Mind Gets Its Moment.
            </h1>
            <p className="text-xl md:text-2xl mb-8 font-light">
              <span className={`${FEARLogo.className}`}> Mind Rain </span> is the only competition platform that separates junior and senior
              categories – ensuring fair competition based on skill, not seniority.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center mt-20">
          <div className="max-w-[90%] mx-auto border-t border-neutral-400">
            <div className="grid grid-cols-1 md:grid-cols-4">
              <div className="px-10 py-14 border-b md:border-b-0 md:border-r border-neutral-400 last:border-r-0">
                <h2 className="text-5xl md:text-6xl font-semibold text-black mb-4">
                  9+
                </h2>
                <p className="text-neutral-600 text-base leading-relaxed max-w-xs">
                  Years of experience
                </p>
              </div>


              <div className="px-10 py-14 border-b md:border-b-0 md:border-r border-neutral-400 last:border-r-0">
                <h2 className="text-5xl md:text-6xl font-semibold text-black mb-4">
                  2.3k+
                </h2>
                <p className="text-neutral-600 text-base leading-relaxed max-w-xs">
                  Participants
                </p>
              </div>


              <div className="px-10 py-14 border-b md:border-b-0 md:border-r border-neutral-400 last:border-r-0">
                <h2 className="text-5xl md:text-6xl font-semibold text-black mb-4">
                  110+
                </h2>
                <p className="text-neutral-600 text-base leading-relaxed max-w-xs">
                  Winners & Honorable Mentions Announced
                </p>
              </div>


              <div className="px-10 py-14 border-b md:border-b-0 md:border-r border-neutral-400 last:border-r-0">
                <h2 className="text-5xl md:text-6xl font-semibold text-black mb-4">
                  8+
                </h2>
                <p className="text-neutral-600 text-base leading-relaxed max-w-xs">
                  successful competitions conducted
                </p>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Competition Details Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-6">

            {/* node with pulse effect */}
            <div className="ml-2">
              <div className="relative">
                {/* Pulsing ring */}
                <div
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{
                    backgroundColor: "red",
                    opacity: 0.3
                  }}
                />
                {/* Outer glow ring */}
                <div
                  className="absolute -inset-2 rounded-full blur-md"
                  style={{
                    backgroundColor: "red",
                    opacity: 0.4
                  }}
                />
                {/* Main dot */}
                <div
                  className="relative w-5 h-5 rounded-full border-4 transition-all duration-300 hover:scale-150"
                  style={{
                    backgroundColor: colors.white,
                    borderColor: "#990000",
                    boxShadow: `0 0 15px ${colors.accent}80`
                  }}
                >
                  {/* Inner dot */}
                  <div
                    className="absolute inset-1.5 rounded-full"
                    style={{ backgroundColor: colors.accent }}
                  />
                </div>
              </div>
            </div>

            <h2
              className="text-3xl md:text-5xl"
              style={{ color: colors.textPrimary }}
            >
              Live Events
            </h2>
          </div>
          <div
            className="h-px flex-1 bg-black mt-4 mb-16"
          />


          <LiveCompetitionCard
            title="THE UNREAL HOUSE"
            subtitle="An Imaginary Home Design Challenge"
            imageSrc="/the-unreal-house/TUH-cover.jpg"
            imageAlt="The Unreal House"
            prizeLabel={<>Total Prize Pool <span className="font-bold text-sm">₹50,000+</span></>}
            details={[
              { label: "Prize", value: "Monetary award" },
              { label: "Eligibility", value: "Open to all undergraduate students" },
            ]}
            deadlineLabel="Regular Registration Ends"
            deadlineValue="31 May 2026"
            findOutMoreHref="/competition/the-unreal-house-2025-2026"
            briefFiles={[
              { name: "Important Dates & Calendar", description: "Key deadlines and schedule", url: "https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/the_unreal_house/Important%20Dates-Calender.pdf" },
              { name: "Terms & Conditions", description: "Important rules and regulations", url: "https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/the_unreal_house/T&C%20(Important).pdf" },
              { name: "Complete Brief", description: "Full competition brief document", url: "https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/the_unreal_house/The%20Unreal%20House%20(Complete%20Brief).pdf" },
              { name: "Brief (Print Format)", description: "Print-ready version of the brief", url: "https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/the_unreal_house/The%20Unreal%20House%20(print%20format).pdf" },
            ]}
            briefModalTitle="Download Brief"
            briefModalSubtitle="The Unreal House — select files to download"
            eventId="3f123e78-60d6-494d-b307-18c5b4c8ab7f"
          />

          <div className="h-6" />

          <LiveCompetitionCard
            title={<>MIND RAIN<br />THESIS AWARD <span className="font-thin text-3xl">#02</span></>}
            subtitle="India's Premier Thesis Recognition Award"
            imageSrc="/thesis-award-2026/live-thumbnail.webp"
            imageAlt="Thesis Award 2026"
            prizeLabel={<>Overall Winner Prize <span className="font-bold text-sm">₹15,000</span></>}
            details={[
              { label: "Origin", value: "India" },
              { label: "Eligibility", value: "Students Completed UG from 2019-2026" },
            ]}
            deadlineLabel="Regular Registration Ends"
            deadlineValue="30 June 2026"
            findOutMoreHref="/competition/thesis-award-2026"
            briefFiles={[
              { name: "MR Thesis Award Detailed PDF", description: "Full competition brief document", url: "https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/thesis_award_26/MindRain%20Thesis%20Award%20(Detailed%20PDF).pdf" },
              { name: "Important Dates & Calendar", description: "Key deadlines and schedule", url: "https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/thesis_award_26/Important%20Dates-Calender.pdf" },
              { name: "Terms & Conditions", description: "Important rules and regulations", url: "https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/thesis_award_26/T&C%20doc..pdf" },
            ]}
            briefModalTitle="Download Brief"
            briefModalSubtitle="Thesis Award 2026 — select files to download"
            eventId="c4a201ae-8bfe-48bc-a526-4ac1288dd937"
          />

          <div className='flex justify-center items-center py-4 text-sm'>
            <span>
              More Events coming soon. Stay tuned!
            </span>
          </div>


        </div>
      </section >

      {/* Previous Winners Section */}
      < section className="py-24 px-4 sm:px-6 lg:px-8" >
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2
              className="text-5xl md:text-6xl font-bold"
              style={{ color: colors.textPrimary }}
            >
              Previous Competition Winners
            </h2>

            <div className="h-px flex-1 bg-black mt-2 mb-2" />

            <p
              className="text-xl"
              style={{ color: colors.textSecondary }}
            >
              {previousWinners2019.name} • {previousWinners2019.year}
            </p>
          </div>

          {/* Category 1 Winners */}
          <div className="mb-20">
            <div className="flex items-center gap-4 mb-8">
              <h3
                className="text-3xl font-bold"
                style={{ color: colors.textPrimary }}
              >
                Category 1
              </h3>
              <div
                className="h-px flex-1"
                style={{ backgroundColor: colors.borderLight }}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {category1Winners.map((winner, index) => (
                <WinnerCard
                  key={index}
                  winner={winner}
                />
              ))}
            </div>
          </div>

          {/* Category 2 Winners */}
          <div className="mb-20">
            <div className="flex items-center gap-4 mb-8">
              <h3
                className="text-3xl font-bold"
                style={{ color: colors.textPrimary }}
              >
                Category 2
              </h3>
              <div
                className="h-px flex-1"
                style={{ backgroundColor: colors.borderLight }}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {category2Winners.map((winner, index) => (
                <WinnerCard
                  key={index}
                  winner={winner}
                />
              ))}
            </div>
          </div>

          {/* Honorable Mentions */}
          {honorableMentions.length > 0 && (
            <div>
              <div className="flex items-center gap-4 mb-8">
                <h3
                  className="text-3xl font-bold"
                  style={{ color: colors.textPrimary }}
                >
                  Honorable Mentions
                </h3>
                <div
                  className="h-px flex-1"
                  style={{ backgroundColor: colors.borderLight }}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {honorableMentions.map((winner, index) => (
                  <WinnerCard
                    key={index}
                    winner={winner}
                  />
                ))}
              </div>
            </div>
          )}

          <div className='flex justify-center mt-20'>
            <Link
              href="/pastWinners"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 hover:translate-x-0.5"
              style={{
                backgroundColor: colors.accent,
                color: colors.textWhite,
              }}
            >
              View All Past Winners
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

        </div>
      </section >

      <GuestJury />

      <Footer />
    </div >
  );
}

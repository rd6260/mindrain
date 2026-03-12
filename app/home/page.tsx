'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Winner } from '@/types';
import Navigation from '@/app/components/Navigation';
import Footer from '@/app/components/Footer';
import { colors } from '@/utils/colors';
import { previousWinners2019 } from '@/data/winners';
import LiveCompetitionCard from '@/app/components/LiveCompetitionCard';
import localFont from "next/font/local";
import GuestJury from '../components/GuestJuryComponent';

const FEARLogo = localFont({
  src: "../fonts/FEARLogo-Regular.woff2"
})


interface WinnerCardProps {
  winner: Winner;
  position: string;
}

interface Member {
  name: string;
  profilePicture?: string;
}

function WinnerCard({ winner, position }: WinnerCardProps) {
  // Simplify member display logic
  const displayMembers: Member[] = winner.members && winner.members.length > 0
    ? winner.members
    : winner.profilePicture
      ? [{ name: winner.name, profilePicture: winner.profilePicture }]
      : [];

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-lg hover-lift group"
      style={{ backgroundColor: colors.white }}
      data-testid="winner-card"
    >
      {/* Project Image */}
      <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <Image
          src={winner.projectImage}
          alt={`${winner.name} project`}
          fill
          className="object-contain transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Winner Info */}
      <div className="p-6">
        <div
          className="inline-block px-4 py-2 rounded-full text-xs font-bold mb-4 shadow-md"
          style={{
            background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})`,
            color: colors.white
          }}
        >
          {position}
        </div>

        {/* Profile Pictures */}
        {displayMembers.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            {displayMembers.map((member, index) => (
              member.profilePicture ? (
                <div
                  key={index}
                  className="relative w-12 h-12 rounded-full border-3 shadow-md transition-transform hover:scale-110"
                  style={{ borderColor: colors.accent }}
                >
                  <Image
                    src={member.profilePicture}
                    alt={member.name}
                    fill
                    className="rounded-full object-cover"
                    sizes="48px"
                  />
                </div>
              ) : null
            ))}
          </div>
        )}

        <h3
          className="font-bold text-lg mb-2 line-clamp-2"
          style={{ color: colors.textPrimary }}
        >
          {winner.name}
        </h3>
        <p
          className="text-sm leading-relaxed line-clamp-2"
          style={{ color: colors.textSecondary }}
        >
          {winner.description}
        </p>
      </div>
    </div>
  );
}


interface WinnerWithPosition extends Winner {
  position: string;
}

export default function HomePage() {
  const category1Winners: WinnerWithPosition[] = [
    ...(previousWinners2019.categories[0].winners.first?.map((w) => ({ ...w, position: '1st Prize' })) || []),
    ...(previousWinners2019.categories[0].winners.second?.map((w) => ({ ...w, position: '2nd Prize' })) || []),
    ...(previousWinners2019.categories[0].winners.third?.map((w) => ({ ...w, position: '3rd Prize' })) || []),
  ];

  const category2Winners: WinnerWithPosition[] = [
    ...(previousWinners2019.categories[1].winners.first?.map((w) => ({ ...w, position: '1st Prize' })) || []),
    ...(previousWinners2019.categories[1].winners.second?.map((w) => ({ ...w, position: '2nd Prize' })) || []),
    ...(previousWinners2019.categories[1].winners.third?.map((w) => ({ ...w, position: '3rd Prize' })) || []),
  ];

  const honorableMentions: WinnerWithPosition[] =
    previousWinners2019.honorableMentions?.map((w) => ({ ...w, position: 'Honorable Mention' })) || [];

  return (
    <div style={{ backgroundColor: colors.background }} className="min-h-screen">
      <Navigation />

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
            deadlineLabel="Early bird registration deadline"
            deadlineValue="15 March 2026"
            findOutMoreHref="/competition/imaginative-home-2025-2026"
            briefFiles={[
              { name: "Important Dates & Calendar", description: "Key deadlines and schedule", url: "https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/the_unreal_house/Important%20Dates-Calender.pdf" },
              { name: "Terms & Conditions", description: "Important rules and regulations", url: "https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/the_unreal_house/T&C%20(Important).pdf" },
              { name: "Complete Brief", description: "Full competition brief document", url: "https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/the_unreal_house/The%20Unreal%20House%20(Complete%20Brief).pdf" },
              { name: "Brief (Print Format)", description: "Print-ready version of the brief", url: "https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/the_unreal_house/The%20Unreal%20House%20(print%20format).pdf" },
            ]}
            briefModalTitle="Download Brief"
            briefModalSubtitle="The Unreal House — select files to download"
          />

          <div className="h-6" />

          <LiveCompetitionCard
            title="THESIS AWARD 2026"
            subtitle="India's Premier Thesis Recognition Award"
            imageSrc="/thesis-award-2026/live-thumbnail.webp"
            imageAlt="Thesis Award 2026"
            prizeLabel={<>Thesis Recognition Award <span className="font-bold text-sm">2026</span></>}
            details={[
              { label: "Prize", value: "Monetary award (Group A)" },
              { label: "Eligibility", value: "Open to Indian undergraduate students" },
            ]}
            deadlineLabel="Early bird registration deadline"
            deadlineValue="31 March 2026"
            findOutMoreHref="/competition/thesis-award-2026"
            briefFiles={[
              { name: "MR Thesis Award Detailed PDF", description: "Full competition brief document", url: "https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/thesis_award_26/MindRain%20Thesis%20Award%20(Detailed%20PDF).pdf" },
              { name: "Important Dates & Calendar", description: "Key deadlines and schedule", url: "https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/thesis_award_26/Important%20Dates-Calender.pdf" },
              { name: "Terms & Conditions", description: "Important rules and regulations", url: "https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/thesis_award_26/T&C%20doc..pdf" },
            ]}
            briefModalTitle="Download Brief"
            briefModalSubtitle="Thesis Award 2026 — select files to download"
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
                  position={winner.position}
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
                  position={winner.position}
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
                    position={winner.position}
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

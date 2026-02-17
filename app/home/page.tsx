'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Winner } from '@/types';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { colors } from '@/utils/colors';
import { previousWinners } from '@/data/winners';
import LiveCompetitionCard from '@/components/LiveCompetitionCard';

import { Changa } from "next/font/google"

const changa = Changa({
  subsets: ["latin"],
  weight: ["500"],
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
    ...(previousWinners.categories[0].winners.first?.map((w) => ({ ...w, position: '1st Prize' })) || []),
    ...(previousWinners.categories[0].winners.second?.map((w) => ({ ...w, position: '2nd Prize' })) || []),
    ...(previousWinners.categories[0].winners.third?.map((w) => ({ ...w, position: '3rd Prize' })) || []),
  ];

  const category2Winners: WinnerWithPosition[] = [
    ...(previousWinners.categories[1].winners.first?.map((w) => ({ ...w, position: '1st Prize' })) || []),
    ...(previousWinners.categories[1].winners.second?.map((w) => ({ ...w, position: '2nd Prize' })) || []),
    ...(previousWinners.categories[1].winners.third?.map((w) => ({ ...w, position: '3rd Prize' })) || []),
  ];

  const honorableMentions: WinnerWithPosition[] =
    previousWinners.honorableMentions?.map((w) => ({ ...w, position: 'Honorable Mention' })) || [];

  return (
    <div style={{ backgroundColor: colors.background }} className="min-h-screen">
      <Navigation />

      {/* Hero Image Section */}
      <section className="relative w-full h-[70vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=2000"
          alt="Modern Architecture"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-transparent" />

        {/* Hero Text Overlay */}
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="text-center text-white max-w-4xl">
            <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight">
              Mind Rain
            </h1>
            <p className="text-xl md:text-2xl mb-8 font-light">
              Architecture Design and Photography Challenges and Events
            </p>
          </div>
        </div>
      </section>

      {/* Competition Details Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2
            className={`${changa.className} text-5xl md:text-6xl font-bold`}
            style={{ color: colors.textPrimary }}
          >
            Live Competitions
          </h2>
          <div
            className="h-px flex-1 bg-black mt-4 mb-16"
          />


          <LiveCompetitionCard />


        </div>
      </section >

      {/* Previous Winners Section */}
      < section className="py-24 px-4 sm:px-6 lg:px-8" >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-5xl md:text-6xl font-bold mb-4"
              style={{ color: colors.textPrimary }}
            >
              Previous Competition Winners
            </h2>
            <p
              className="text-xl"
              style={{ color: colors.textSecondary }}
            >
              {previousWinners.name} • {previousWinners.year}
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

      <Footer />
    </div >
  );
}

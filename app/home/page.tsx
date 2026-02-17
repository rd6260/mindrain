'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Winner } from '@/types';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { colors } from '@/utils/colors';
import { previousWinners } from '@/data/winners';

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

interface PrizeItem {
  label: string;
  value: string;
  emoji: string;
}

interface CompetitionCardProps {
  name: string;
  prizePool: string;
  category1First: string;
  category1Second: string;
  category1Third: string;
  category2First: string;
  category2Second: string;
  category2Third: string;
}

function CompetitionCard(props: CompetitionCardProps) {
  const category1Prizes: PrizeItem[] = [
    { label: '1st Prize', value: props.category1First, emoji: '🥇' },
    { label: '2nd Prize', value: props.category1Second, emoji: '🥈' },
    { label: '3rd Prize', value: props.category1Third, emoji: '🥉' },
  ];

  const category2Prizes: PrizeItem[] = [
    { label: '1st Prize', value: props.category2First, emoji: '🥇' },
    { label: '2nd Prize', value: props.category2Second, emoji: '🥈' },
    { label: '3rd Prize', value: props.category2Third, emoji: '🥉' },
  ];

  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{ backgroundColor: colors.white }}
      data-testid="competition-card"
    >
      <div className="flex flex-col md:flex-row">

        {/* Left — Cover Image */}
        <div className="relative md:w-2/5 w-full min-h-[280px] md:min-h-0 flex-shrink-0">
          <img
            src="/the-unreal-house/TUH-cover.jpg"
            alt="The Unreal House"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Subtle gradient overlay at bottom for blending on mobile */}
          <div
            className="absolute inset-0 md:hidden"
            style={{
              background: `linear-gradient(to top, ${colors.white} 0%, transparent 50%)`,
            }}
          />
        </div>

        {/* Right — Content */}
        <div className="flex-1 p-8 md:p-10 flex flex-col justify-between gap-7">

          {/* Header */}
          <div>
            <p
              className="text-xs uppercase tracking-widest font-semibold mb-3"
              style={{ color: colors.accent }}
            >
              Current Competition
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight mb-2"
              style={{ color: colors.textPrimary }}
            >
              The Unreal House
            </h2>
            <p
              className="text-sm"
              style={{ color: colors.textSecondary }}
            >
              Architecture design challenge 2025–2026
            </p>
          </div>

          {/* Prize Pool — plain text treatment */}
          <div
            className="flex items-baseline gap-2 border-b pb-6"
            style={{ borderColor: colors.borderLight }}
          >
            <span
              className="text-xs uppercase tracking-widest font-semibold"
              style={{ color: colors.textLight }}
            >
              Total Prize Pool
            </span>
            <span
              className="text-2xl font-bold"
              style={{ color: colors.accent }}
            >
              {props.prizePool}
            </span>
          </div>

          {/* Prize Categories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <CategoryPrizes title="Category 1 (1st, 2nd year)" prizes={category1Prizes} />
            <CategoryPrizes title="Category 2 (3rd–5th year)" prizes={category2Prizes} />
          </div>

          {/* CTA */}
          <div>
            <Link
              href="/competition/imaginative-home-2025-2026"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 hover:translate-x-0.5"
              style={{
                backgroundColor: colors.accent,
                color: colors.textWhite,
              }}
            >
              Learn More
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
      </div>
    </div>
  );
}

interface CategoryPrizesProps {
  title: string;
  prizes: PrizeItem[];
}

function CategoryPrizes({ title, prizes }: CategoryPrizesProps) {
  return (
    <div
      className="rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg"
      style={{
        borderColor: colors.borderLight,
        backgroundColor: colors.cardBackground
      }}
    >
      <h3
        className="text-xl font-bold mb-5 pb-3 border-b"
        style={{
          color: colors.accent,
          borderColor: colors.borderLight
        }}
      >
        {title}
      </h3>
      <div className="space-y-3">
        {prizes.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center">
            <span
              className="text-sm flex items-center gap-2"
              style={{ color: colors.textSecondary }}
            >
              <span className="text-lg">{item.emoji}</span>
              {item.label}
            </span>
            <span
              className="font-bold text-lg"
              style={{ color: colors.textPrimary }}
            >
              {item.value}
            </span>
          </div>
        ))}
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

          <CompetitionCard
            name="Architecture Competition Imaginative Home design challenge 2025-2026 edition 06"
            prizePool="₹50,000+"
            category1First="₹11,000"
            category1Second="₹8,000"
            category1Third="₹6,000"
            category2First="₹11,000"
            category2Second="₹8,000"
            category2Third="₹6,000"
          />
        </div>
      </section>

      {/* Previous Winners Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
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
      </section>

      <Footer />
    </div>
  );
}

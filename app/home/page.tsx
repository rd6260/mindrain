'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import CompetitionCard from '@/components/CompetitionCard';
import WinnerCard from '@/components/WinnerCard';
import { colors } from '@/utils/colors';
import { previousWinners } from '@/data/winners';

export default function HomePage() {
  const allWinners = [
    ...previousWinners.categories[0].winners.first?.map((w) => ({ ...w, position: 'Category 1 - 1st Prize' })) || [],
    ...previousWinners.categories[0].winners.second?.map((w) => ({ ...w, position: 'Category 1 - 2nd Prize' })) || [],
    ...previousWinners.categories[0].winners.third?.map((w) => ({ ...w, position: 'Category 1 - 3rd Prize' })) || [],
    ...previousWinners.categories[1].winners.first?.map((w) => ({ ...w, position: 'Category 2 - 1st Prize' })) || [],
    ...previousWinners.categories[1].winners.second?.map((w) => ({ ...w, position: 'Category 2 - 2nd Prize' })) || [],
    ...previousWinners.categories[1].winners.third?.map((w) => ({ ...w, position: 'Category 2 - 3rd Prize' })) || [],
    ...previousWinners.honorableMentions?.map((w) => ({ ...w, position: 'Honorable Mention' })) || [],
  ];

  return (
    <div style={{ backgroundColor: colors.background }} className="min-h-screen">
      <Navigation />
      
      {/* Hero Section - Current Competition */}
      <section className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-5xl w-full">
          <CompetitionCard
            name="Architecture Competition 'Imaginative Home' design challenge 2025-2026 edition"
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
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 
            className="text-4xl md:text-5xl font-bold text-center mb-12"
            style={{ color: colors.textPrimary }}
          >
            Previous Competition Winners
          </h2>
          
          <p 
            className="text-center text-xl mb-4"
            style={{ color: colors.textSecondary }}
          >
            {previousWinners.name} - {previousWinners.year}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {allWinners.map((winner, index) => (
              <WinnerCard
                key={index}
                winner={winner}
                position={winner.position}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

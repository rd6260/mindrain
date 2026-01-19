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
    <div style={{ backgroundColor: colors.background }} className="min-h-screen relative overflow-hidden">
      {/* Decorative background elements */}
      <div 
        className="fixed top-20 right-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-5 pointer-events-none"
        style={{ backgroundColor: colors.accent }}
      />
      <div 
        className="fixed bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-5 pointer-events-none"
        style={{ backgroundColor: colors.accent }}
      />
      
      <Navigation />
      
      {/* Hero Section - Current Competition */}
      <section className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 relative">
        <div className="max-w-6xl w-full">
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
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 
              className="text-5xl md:text-6xl font-bold mb-6 gradient-text"
            >
              Previous Competition Winners
            </h2>
            <div 
              className="w-32 h-1.5 mx-auto mb-8 rounded-full"
              style={{ 
                background: `linear-gradient(90deg, transparent, ${colors.accent}, transparent)` 
              }}
            />
            <p 
              className="text-2xl font-medium"
              style={{ color: colors.textSecondary }}
            >
              {previousWinners.name} - {previousWinners.year}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allWinners.map((winner, index) => (
              <div 
                key={index}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <WinnerCard
                  winner={winner}
                  position={winner.position}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

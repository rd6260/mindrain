'use client';

import { useState } from 'react';
import Navigation from '@/app/components/Navigation';
import Footer from '@/app/components/Footer';
import WinnerCard from '@/app/components/WinnerCard';
import { colors } from '@/utils/colors';
import { previousWinners2026, previousWinners2019, previousWinners2018, previousWinners2017, previousWinnersMRTA2 } from '@/data/winners';

export default function PastWinnersPage() {
  const allData = [previousWinnersMRTA2, previousWinners2026, previousWinners2019, previousWinners2018, previousWinners2017];

  // Deduplicated ordered list of years for tabs
  const years = Array.from(new LinkedSet(allData.map((d) => d.year)));
  const [selectedYear, setSelectedYear] = useState<string>(years[0]);

  // All competitions for the selected year
  const selectedCompetitions = allData.filter((d) => d.year === selectedYear);

  return (
    <div style={{ backgroundColor: colors.background }} className="min-h-screen flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navigation />
      </div>

      <div className="flex-grow pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Header Section */}
          <div className="mb-16 text-center">
            <h1
              className="text-5xl md:text-6xl font-black mb-6"
              style={{ color: colors.textPrimary }}
            >
              Past Winners
            </h1>
            <p
              className="text-xl max-w-2xl mx-auto"
              style={{ color: colors.textSecondary }}
            >
              Celebrating the brilliant minds and imaginative projects that have defined Mind Rain competitions over the years.
            </p>
          </div>

          {/* Year Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {years.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-8 py-3 rounded-xl text-lg font-bold transition-all duration-300 ${
                  selectedYear === year
                    ? 'shadow-lg scale-105'
                    : 'hover:scale-105 hover:bg-white/50 border border-transparent'
                }`}
                style={
                  selectedYear === year
                    ? {
                        background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})`,
                        color: colors.white,
                      }
                    : {
                        color: colors.textPrimary,
                        borderColor: colors.borderLight,
                      }
                }
              >
                {year}
              </button>
            ))}
          </div>

          {/* Competitions for the selected year */}
          <div className="animate-fade-in">
            {selectedCompetitions.map((competition, compIdx) => (
              <div key={competition.name} className={compIdx > 0 ? 'mt-24' : ''}>
                {/* Competition heading */}
                <div className="mb-12 text-center md:text-left">
                  <h2
                    className="text-4xl md:text-5xl font-bold mb-4"
                    style={{ color: colors.textPrimary }}
                  >
                    {competition.name}
                  </h2>
                  <div className="h-px w-full md:w-1/3 bg-black mt-2 mb-2 mx-auto md:mx-0 opacity-20" />
                </div>

                {/* Categories */}
                {competition.categories.map((categoryGroup, index) => {
                  if (!categoryGroup.winners || categoryGroup.winners.length === 0) return null;

                  const validWinners = categoryGroup.winners.filter(
                    (w) => w.institute || w.description || w.members?.length > 0 || w.entry?.big
                  );

                  if (validWinners.length === 0) return null;

                  return (
                    <div key={index} className="mb-20">
                      <div className="flex items-center gap-4 mb-8">
                        <h3
                          className="text-3xl font-bold"
                          style={{ color: colors.textPrimary }}
                        >
                          {categoryGroup.category || 'Winners'}
                        </h3>
                        <div
                          className="h-px flex-1"
                          style={{ backgroundColor: colors.borderLight }}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {validWinners.map((winner, idx) => (
                          <WinnerCard key={idx} winner={winner} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}

// Order-preserving unique values (Array.from(new Set(...)) preserves insertion order in JS)
class LinkedSet<T> extends Set<T> {}

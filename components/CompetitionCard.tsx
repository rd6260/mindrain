import Link from 'next/link';
import { colors } from '@/utils/colors';

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

export default function CompetitionCard(props: CompetitionCardProps) {
  return (
    <div 
      className="rounded-3xl p-10 md:p-14 shadow-2xl relative overflow-hidden animate-fade-in-up glass"
      style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
      }}
      data-testid="competition-card"
    >
      {/* Decorative elements */}
      <div 
        className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10"
        style={{ backgroundColor: colors.accent }}
      />
      <div 
        className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl opacity-10"
        style={{ backgroundColor: colors.accent }}
      />
      
      <div className="relative z-10">
        <h2 
          className="text-3xl md:text-5xl font-bold mb-10 leading-tight"
          style={{ color: colors.textPrimary }}
        >
          {props.name}
        </h2>
        
        <div className="mb-10">
          <div 
            className="inline-block px-8 py-4 rounded-full shadow-lg"
            style={{ 
              background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})`,
            }}
          >
            <p className="text-white font-bold text-2xl">
              Total Prize Pool: {props.prizePool}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-10 mb-10">
          {/* Category 1 */}
          <div 
            className="rounded-2xl p-8 border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            style={{ 
              borderColor: colors.borderLight,
              backgroundColor: colors.cardBackground 
            }}
          >
            <h3 
              className="text-2xl font-bold mb-6 pb-3 border-b-2"
              style={{ 
                color: colors.accent,
                borderColor: colors.accent 
              }}
            >
              Category 1
            </h3>
            <div className="space-y-4">
              {[
                { label: '1st Prize', value: props.category1First, emoji: '🥇' },
                { label: '2nd Prize', value: props.category1Second, emoji: '🥈' },
                { label: '3rd Prize', value: props.category1Third, emoji: '🥉' },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center group">
                  <span 
                    className="text-base flex items-center gap-2"
                    style={{ color: colors.textSecondary }}
                  >
                    <span className="text-xl">{item.emoji}</span>
                    {item.label}
                  </span>
                  <span 
                    className="font-bold text-xl group-hover:scale-110 transition-transform"
                    style={{ color: colors.textPrimary }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Category 2 */}
          <div 
            className="rounded-2xl p-8 border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            style={{ 
              borderColor: colors.borderLight,
              backgroundColor: colors.cardBackground 
            }}
          >
            <h3 
              className="text-2xl font-bold mb-6 pb-3 border-b-2"
              style={{ 
                color: colors.accent,
                borderColor: colors.accent 
              }}
            >
              Category 2
            </h3>
            <div className="space-y-4">
              {[
                { label: '1st Prize', value: props.category2First, emoji: '🥇' },
                { label: '2nd Prize', value: props.category2Second, emoji: '🥈' },
                { label: '3rd Prize', value: props.category2Third, emoji: '🥉' },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center group">
                  <span 
                    className="text-base flex items-center gap-2"
                    style={{ color: colors.textSecondary }}
                  >
                    <span className="text-xl">{item.emoji}</span>
                    {item.label}
                  </span>
                  <span 
                    className="font-bold text-xl group-hover:scale-110 transition-transform"
                    style={{ color: colors.textPrimary }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-5">
          <Link
            href="/competition/imaginative-home-2025-2026"
            className="px-10 py-4 rounded-full font-semibold text-center transition-all duration-300 hover:scale-105 hover:shadow-xl text-lg"
            style={{ 
              background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})`,
              color: colors.white 
            }}
            data-testid="learn-more-button"
          >
            Learn More →
          </Link>
          <Link
            href="/competition/imaginative-home-2025-2026#register"
            className="px-10 py-4 rounded-full font-semibold text-center border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl text-lg"
            style={{ 
              borderColor: colors.accent, 
              color: colors.accent,
              backgroundColor: 'transparent'
            }}
            data-testid="register-button"
          >
            Register Now
          </Link>
        </div>
      </div>
    </div>
  );
}

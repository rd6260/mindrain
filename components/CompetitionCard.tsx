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
      className="rounded-2xl p-8 md:p-12 shadow-lg"
      style={{ backgroundColor: colors.white }}
      data-testid="competition-card"
    >
      <h2 
        className="text-3xl md:text-4xl font-bold mb-8"
        style={{ color: colors.textPrimary }}
      >
        {props.name}
      </h2>
      
      <div className="mb-8">
        <div 
          className="inline-block px-6 py-2 rounded-full mb-6"
          style={{ backgroundColor: colors.accent }}
        >
          <p className="text-white font-semibold text-xl">
            Total Prize Pool: {props.prizePool}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 
            className="text-xl font-semibold mb-4"
            style={{ color: colors.accent }}
          >
            Category 1
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span style={{ color: colors.textSecondary }}>1st Prize:</span>
              <span className="font-semibold" style={{ color: colors.textPrimary }}>
                {props.category1First}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: colors.textSecondary }}>2nd Prize:</span>
              <span className="font-semibold" style={{ color: colors.textPrimary }}>
                {props.category1Second}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: colors.textSecondary }}>3rd Prize:</span>
              <span className="font-semibold" style={{ color: colors.textPrimary }}>
                {props.category1Third}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 
            className="text-xl font-semibold mb-4"
            style={{ color: colors.accent }}
          >
            Category 2
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span style={{ color: colors.textSecondary }}>1st Prize:</span>
              <span className="font-semibold" style={{ color: colors.textPrimary }}>
                {props.category2First}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: colors.textSecondary }}>2nd Prize:</span>
              <span className="font-semibold" style={{ color: colors.textPrimary }}>
                {props.category2Second}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: colors.textSecondary }}>3rd Prize:</span>
              <span className="font-semibold" style={{ color: colors.textPrimary }}>
                {props.category2Third}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/competition/imaginative-home-2025-2026"
          className="px-8 py-3 rounded-full font-medium text-center transition-all hover:opacity-90"
          style={{ backgroundColor: colors.accent, color: colors.white }}
          data-testid="learn-more-button"
        >
          Learn More
        </Link>
        <Link
          href="/competition/imaginative-home-2025-2026#register"
          className="px-8 py-3 rounded-full font-medium text-center border-2 transition-all hover:opacity-70"
          style={{ 
            borderColor: colors.accent, 
            color: colors.accent 
          }}
          data-testid="register-button"
        >
          Register Now
        </Link>
      </div>
    </div>
  );
}

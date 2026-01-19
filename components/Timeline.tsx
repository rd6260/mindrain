import { colors } from '@/utils/colors';
import { ImportantDate } from '@/types';

interface TimelineProps {
  dates: ImportantDate[];
}

export default function Timeline({ dates }: TimelineProps) {
  return (
    <div className="relative py-8">
      {/* Timeline line */}
      <div 
        className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 -translate-x-1/2"
        style={{ 
          background: `linear-gradient(180deg, ${colors.accent}, ${colors.accentHover}, ${colors.accent})` 
        }}
      />

      {/* Timeline items */}
      <div className="space-y-12">
        {dates.map((item, index) => (
          <div 
            key={index} 
            className={`relative flex items-center ${
              index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
            } flex-row animate-fade-in-up`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Dot */}
            <div className="absolute left-4 md:left-1/2 -translate-x-1/2 z-10">
              <div 
                className="w-6 h-6 rounded-full border-4 shadow-lg transition-transform hover:scale-125"
                style={{ 
                  backgroundColor: colors.accent,
                  borderColor: colors.background 
                }}
              />
            </div>

            {/* Content */}
            <div 
              className={`ml-16 md:ml-0 ${
                index % 2 === 0 ? 'md:pr-[52%] md:text-right' : 'md:pl-[52%] md:text-left'
              } md:w-1/2 w-full`}
            >
              <div 
                className="inline-block rounded-2xl p-6 shadow-lg hover-lift"
                style={{ backgroundColor: colors.white }}
              >
                <p 
                  className="font-bold text-lg mb-2"
                  style={{ color: colors.textPrimary }}
                >
                  {item.label}
                </p>
                <p 
                  className="text-base font-medium"
                  style={{ color: colors.accent }}
                >
                  {item.date}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

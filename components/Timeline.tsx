import { colors } from '@/utils/colors';
import { ImportantDate } from '@/types';

interface TimelineProps {
  dates: ImportantDate[];
}

export default function Timeline({ dates }: TimelineProps) {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div 
        className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2"
        style={{ backgroundColor: colors.border }}
      />

      {/* Timeline items */}
      <div className="space-y-8">
        {dates.map((item, index) => (
          <div 
            key={index} 
            className={`relative flex items-center ${
              index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
            } flex-row`}
          >
            {/* Dot */}
            <div 
              className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full border-4 -translate-x-1/2"
              style={{ 
                backgroundColor: colors.accent,
                borderColor: colors.background 
              }}
            />

            {/* Content */}
            <div 
              className={`ml-12 md:ml-0 ${
                index % 2 === 0 ? 'md:pr-1/2 md:text-right' : 'md:pl-1/2 md:text-left'
              } md:w-1/2`}
            >
              <div 
                className="inline-block rounded-lg p-4 shadow-sm"
                style={{ backgroundColor: colors.white }}
              >
                <p 
                  className="font-semibold mb-1"
                  style={{ color: colors.textPrimary }}
                >
                  {item.label}
                </p>
                <p 
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
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

import { colors } from '@/utils/colors';
import { ImportantDate } from '@/types';

// Timeline data
const importantDates: ImportantDate[] = [
  { label: 'Campaign Start Date', date: '25 January 2026' },
  { label: 'Competition Starts', date: '2 February 2026' },
  { label: 'Early Bird Registration Starts', date: '2 February 2026' },
  { label: 'Early Bird Registration Ends', date: '28 February 2026' },
  { label: 'Advance Registration Starts', date: '1 March 2026' },
  { label: 'Final Submission Starts', date: '1 April 2026' },
  { label: 'Advance Registration Ends', date: '31 May 2026' },
  { label: 'Late Registration Starts', date: '1 June 2026' },
  { label: 'Late Registration Ends', date: '25 June 2026' },
  { label: 'Final Submission Ends', date: '30 June 2026' },
  { label: 'Announcement of Result', date: '27 July 2026' },
];

interface TimelineProps {
  dates?: ImportantDate[];
}

export default function Timeline({ dates = importantDates }: TimelineProps) {
  return (
    <div className="relative py-16 px-4 md:px-8 overflow-hidden">
      {/* Animated background gradient */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${colors.accent}, transparent 70%)`
        }}
      />

      {/* Timeline connector line */}
      <div 
        className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 md:w-1 -translate-x-1/2"
        style={{ 
          background: `linear-gradient(180deg, transparent, ${colors.accent} 10%, ${colors.accentHover} 50%, ${colors.accent} 90%, transparent)`,
          boxShadow: `0 0 20px ${colors.accent}40`
        }}
      />

      {/* Timeline items */}
      <div className="relative space-y-8 md:space-y-16">
        {dates.map((item, index) => {
          const isLeft = index % 2 === 0;
          
          return (
            <div 
              key={index} 
              className="relative flex items-center animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Timeline node with pulse effect */}
              <div className="absolute left-8 md:left-1/2 -translate-x-1/2 z-20">
                <div className="relative">
                  {/* Pulsing ring */}
                  <div 
                    className="absolute inset-0 rounded-full animate-ping"
                    style={{ 
                      backgroundColor: colors.accent,
                      opacity: 0.3
                    }}
                  />
                  {/* Outer glow ring */}
                  <div 
                    className="absolute -inset-2 rounded-full blur-md"
                    style={{ 
                      backgroundColor: colors.accent,
                      opacity: 0.4
                    }}
                  />
                  {/* Main dot */}
                  <div 
                    className="relative w-5 h-5 rounded-full border-4 transition-all duration-300 hover:scale-150"
                    style={{ 
                      backgroundColor: colors.white,
                      borderColor: colors.accent,
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

              {/* Content card */}
              <div 
                className={`
                  ml-20 md:ml-0 w-full
                  ${isLeft ? 'md:pr-[calc(50%+3rem)] md:flex md:justify-end' : 'md:pl-[calc(50%+3rem)]'}
                `}
              >
                <div 
                  className="group relative max-w-md w-full"
                >
                  {/* Hover glow effect */}
                  <div 
                    className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"
                    style={{ 
                      background: `linear-gradient(135deg, ${colors.accent}40, ${colors.accentHover}40)`
                    }}
                  />
                  
                  {/* Card */}
                  <div 
                    className="relative rounded-3xl p-6 md:p-8 transition-all duration-300 group-hover:translate-y-[-4px] overflow-hidden"
                    style={{ 
                      backgroundColor: colors.white,
                      boxShadow: `0 10px 40px ${colors.accent}15`
                    }}
                  >
                    {/* Accent bar */}
                    <div 
                      className="absolute top-0 left-0 w-1.5 h-full transition-all duration-300 group-hover:w-2"
                      style={{ 
                        background: `linear-gradient(180deg, ${colors.accent}, ${colors.accentHover})`
                      }}
                    />
                    
                    {/* Decorative corner element */}
                    <div 
                      className="absolute top-0 right-0 w-20 h-20 opacity-5"
                      style={{
                        background: `radial-gradient(circle at top right, ${colors.accent}, transparent 70%)`
                      }}
                    />

                    {/* Content */}
                    <div className="relative pl-4">
                      <div 
                        className="text-xs font-bold uppercase tracking-wider mb-2 opacity-60"
                        style={{ color: colors.accent }}
                      >
                        Milestone {index + 1}
                      </div>
                      <h3 
                        className="text-lg md:text-xl font-bold mb-3 leading-tight"
                        style={{ color: colors.textPrimary }}
                      >
                        {item.label}
                      </h3>
                      <div className="flex items-center gap-2">
                        <svg 
                          className="w-5 h-5 flex-shrink-0" 
                          fill="none" 
                          stroke={colors.accent} 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                          />
                        </svg>
                        <p 
                          className="text-base md:text-lg font-semibold"
                          style={{ color: colors.accent }}
                        >
                          {item.date}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* End marker */}
      <div className="flex justify-center mt-12">
        <div 
          className="relative"
        >
          <div 
            className="absolute inset-0 rounded-full blur-xl animate-pulse"
            style={{ 
              backgroundColor: colors.accent,
              opacity: 0.3
            }}
          />
          <div 
            className="relative px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider"
            style={{ 
              backgroundColor: colors.accent,
              color: colors.white,
              boxShadow: `0 10px 30px ${colors.accent}40`
            }}
          >
            Journey Complete
          </div>
        </div>
      </div>
    </div>
  );
}

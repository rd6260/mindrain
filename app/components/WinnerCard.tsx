import Image from 'next/image';
import { colors } from '@/utils/colors';
import { NewWinner } from '@/types';

interface WinnerCardProps {
  winner: NewWinner;
}

export default function WinnerCard({ winner }: WinnerCardProps) {
  const displayMembers = winner.members || [];
  const projectImage = winner.entry?.big || '';

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-lg hover-lift group flex flex-col h-full"
      style={{ backgroundColor: colors.white }}
      data-testid="winner-card"
    >
      {/* Project Image */}
      <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden flex-shrink-0">
        {projectImage && (
          <Image
            src={projectImage}
            alt={`${winner.institute} project`}
            fill
            className="object-contain transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Winner Info */}
      <div className="p-6 flex flex-col flex-grow">
        {winner.position && (
          <div className="mb-4">
            <div
              className="inline-block px-4 py-2 rounded-full text-xs font-bold shadow-md"
              style={{
                background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})`,
                color: colors.white
              }}
            >
              {winner.position}
            </div>
          </div>
        )}

        {/* Profile Pictures */}
        {displayMembers.length > 0 && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {displayMembers.map((member, index) => (
              member.pfp ? (
                <div
                  key={index}
                  className="relative w-12 h-12 rounded-full border border-solid shadow-md transition-transform hover:scale-110"
                  style={{ borderColor: colors.accent, borderWidth: '3px' }}
                  title={member.name}
                >
                  <Image
                    src={member.pfp}
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
          className="font-bold text-lg mb-2"
          style={{ color: colors.textPrimary }}
        >
          {winner.institute || 'Honorable Mention'}
        </h3>
        
        {winner.description && (
          <p
            className="text-sm leading-relaxed text-balance"
            style={{ color: colors.textSecondary }}
          >
            {winner.description}
          </p>
        )}
      </div>
    </div>
  );
}

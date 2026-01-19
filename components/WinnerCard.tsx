import Image from 'next/image';
import { colors } from '@/utils/colors';
import { Winner } from '@/types';

interface WinnerCardProps {
  winner: Winner;
  position: string;
}

export default function WinnerCard({ winner, position }: WinnerCardProps) {
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
        {(winner.members && winner.members.length > 0 ? winner.members : winner.profilePicture ? [{ name: winner.name, profilePicture: winner.profilePicture }] : []).length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            {(winner.members && winner.members.length > 0 ? winner.members : [{ name: winner.name, profilePicture: winner.profilePicture }]).map((member, index) => (
              member.profilePicture && (
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
              )
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

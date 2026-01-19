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
      className="rounded-xl overflow-hidden shadow-md transition-transform hover:scale-[1.02]"
      style={{ backgroundColor: colors.white }}
      data-testid="winner-card"
    >
      {/* Project Image */}
      <div className="relative w-full aspect-[4/3] bg-gray-100">
        <Image
          src={winner.projectImage}
          alt={`${winner.name} project`}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Winner Info */}
      <div className="p-4">
        <div 
          className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3"
          style={{ backgroundColor: colors.accent, color: colors.white }}
        >
          {position}
        </div>

        {/* Profile Pictures */}
        <div className="flex items-center gap-2 mb-3">
          {winner.members && winner.members.length > 0 ? (
            winner.members.map((member, index) => (
              member.profilePicture && (
                <div key={index} className="relative w-10 h-10">
                  <Image
                    src={member.profilePicture}
                    alt={member.name}
                    fill
                    className="rounded-full object-cover border-2"
                    style={{ borderColor: colors.border }}
                    sizes="40px"
                  />
                </div>
              )
            ))
          ) : winner.profilePicture ? (
            <div className="relative w-10 h-10">
              <Image
                src={winner.profilePicture}
                alt={winner.name}
                fill
                className="rounded-full object-cover border-2"
                style={{ borderColor: colors.border }}
                sizes="40px"
              />
            </div>
          ) : null}
        </div>

        <h3 
          className="font-semibold text-base mb-2"
          style={{ color: colors.textPrimary }}
        >
          {winner.name}
        </h3>
        <p 
          className="text-sm"
          style={{ color: colors.textSecondary }}
        >
          {winner.description}
        </p>
      </div>
    </div>
  );
}

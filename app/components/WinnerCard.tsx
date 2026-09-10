'use client';

import { useState } from 'react';
import Image from 'next/image';
import { colors } from '@/utils/colors';
import { NewWinner } from '@/types';

interface WinnerCardProps {
  winner: NewWinner;
}

export default function WinnerCard({ winner }: WinnerCardProps) {
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const displayMembers = winner.members || [];
  const projectImage = winner.entry?.big || '';

  return (
    <>
      <div
        className="rounded-2xl overflow-hidden shadow-lg hover-lift group flex flex-col h-full"
        style={{ backgroundColor: colors.white }}
        data-testid="winner-card"
      >
        {/* Project Image */}
        {winner.entry?.pdf ? (
          <button 
            onClick={() => setIsPdfModalOpen(true)} 
            className="block relative w-full aspect-[5/4] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden flex-shrink-0 cursor-pointer"
          >
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
          </button>
        ) : (
          <div className="relative w-full aspect-[5/4] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden flex-shrink-0">
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
        )}

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

          {/* Members */}
          {displayMembers.length > 0 && (
            <div className="mb-2">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
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
              <h3 className="font-bold text-xl leading-tight" style={{ color: colors.textPrimary }}>
                {displayMembers.map(m => m.name).filter(Boolean).join(', ')}
              </h3>
            </div>
          )}

          <div
            className="text-sm font-medium mb-2"
            style={{ color: colors.textSecondary }}
          >
            {winner.institute || 'Honorable Mention'}
          </div>
          
          {winner.description && (
            <p
              className="text-sm leading-relaxed text-balance pt-2 mb-6"
              style={{ color: colors.textSecondary }}
            >
              {winner.description}
            </p>
          )}

          {/* Footer with Title and Button */}
          <div className="mt-auto pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div className="flex flex-col">
              {/* Short two-toned bar */}
              <div className="flex w-16 h-[2px] mb-3">
                <div className="w-1/3 bg-gray-800"></div>
                <div className="w-2/3 bg-gray-300"></div>
              </div>
              <span className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase mb-1">
                Project Title
              </span>
              <span className="text-lg text-gray-900 tracking-wide uppercase font-semibold">
                {winner.title || winner.description || 'UNTITLED'}
              </span>
            </div>
            
            {winner.entry?.pdf && (
              <button
                onClick={() => setIsPdfModalOpen(true)}
                className="whitespace-nowrap px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 hover:bg-[#113333] transition-colors text-sm shadow-md"
                style={{ backgroundColor: '#1A4D4D' }}
              >
                View Full Panel
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PDF Modal */}
      {isPdfModalOpen && winner.entry?.pdf && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 pt-24 sm:p-8 sm:pt-28 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-6xl h-full flex flex-col bg-white rounded-2xl overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200" style={{ backgroundColor: colors.background }}>
              <h3 className="font-bold text-lg truncate pr-4" style={{ color: colors.textPrimary }}>
                {winner.title || winner.description || winner.institute}
              </h3>
              <button
                onClick={() => setIsPdfModalOpen(false)}
                className="p-2 rounded-full hover:bg-black/10 transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Modal Body */}
            <div className="flex-grow w-full bg-gray-100">
              <iframe
                src={`${winner.entry.pdf}#toolbar=0`}
                className="w-full h-full border-0"
                title={`${winner.institute} Project PDF`}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

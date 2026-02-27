'use client';

import Image from 'next/image';
import { useState } from 'react';

const colors = {
  background: '#EDEBDF',
  accent: '#2C5F5F',
  accentHover: '#1A4D4D',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textLight: '#8B8B8B',
  textWhite: '#FFFFFF',
  white: '#F5F1ED',
  border: '#D0CEC2',
  borderLight: '#E5E3D7',
  cardBackground: '#F8F7F2',
};

interface JuryMember {
  name: string;
  pfp: string;
  text: string;
}

const juryMembers: JuryMember[] = [
  {
    name: 'Ayodh Vasant Kamath',
    pfp: '/images/jury/jury-ayodh-vasant-kamath.jpg',
    text: `Ayodh Vasant Kamath blends craft, design and computation in research, teaching, and professional practice. His research on bamboo gridshell design won a 'Best Paper, Runner-up' at CAADRIA 2013 and his research on 'Computationally Reclaiming Material' in Detroit won him the LTU Faculty Seed Grant in 2014. He has presented his research at international conferences in Asia, Europe and North America.

Ayodh co-coordinates the Visual Communications course sequence in the department of architecture. He teaches graduate and undergraduate design studios, and has organized an international design-build workshop with the makeLAB at LTU. Ayodh has previously taught at the Sushant School of Art & Architecture, Gurgaon, and the University School of Architecture and Planning, Delhi, India.

A practicing architect in India, Ayodh is a partner at Kamath Design Studio, New Delhi. He was involved in the design of the tallest stainless steel structure in South Asia. Projects he has worked on have appeared in various national and international publications. He has also worked on installation art projects, furniture design and photography.`,
  },
  {
    name: 'Narinderjit Kaur',
    pfp: '/images/jury/jury-narinderjit-kaur.jpg',
    text: `Narinderjit Kaur is an architect, designer and motivated environmental planner who relishes new and dynamic challenges. Her fields of interest include Natural Resource Management, Urban Environment & Climate Change and Sustainable approach in and Spatial Planning and Architecture. She has eighteen years of professional experience including six years of core field work, 11 years field work as free-lance consultant along with 11 years teaching experience.`,
  },
  {
    name: 'Pavol Griac',
    pfp: '/images/jury/jury-pavol-griac.jpg',
    text: `Pavol Griac is a resident of Slovakia, Europe. He has studied Spatial Planning at the University of Technology in Slovakia and in city of Reims in France. He has taught Urban Planning at a prestigious university in India and has traveled different parts of India during his stay. He works in real estate business. He loves to travel and experience different cultures. He is a sports enthusiast and loves to play ice hockey, football and rock climbing.`,
  },
];

function JuryCard({ member, index }: { member: JuryMember; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = member.text.length > 300;
  const paragraphs = member.text.split('\n\n').map((p) => p.trim()).filter(Boolean);
  const preview = paragraphs[0];
  const rest = paragraphs.slice(1);

  return (
    <div
      className="group relative rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl flex flex-col"
      style={{
        backgroundColor: colors.cardBackground,
        border: `1px solid ${colors.borderLight}`,
        boxShadow: '0 2px 16px rgba(44,95,95,0.06)',
      }}
    >
      {/* Accent bar top */}
      <div
        className="absolute top-0 left-0 w-full h-[3px] transition-all duration-300 group-hover:h-[4px]"
        style={{ backgroundColor: colors.accent }}
      />

      <div className="p-8 flex flex-col flex-1">
        {/* Header: photo + name */}
        <div className="flex items-center gap-5 mb-6">
          {/* Photo */}
          <div
            className="relative flex-shrink-0 w-[72px] h-[72px] rounded-full overflow-hidden transition-all duration-300"
            style={{
              outline: `2px solid ${colors.accent}`,
              outlineOffset: '3px',
            }}
          >
            <Image
              src={member.pfp}
              alt={member.name}
              fill
              className="object-cover"
              sizes="72px"
            />
          </div>

          {/* Name + label */}
          <div>
            <span
              className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-1 rounded-full mb-2"
              style={{
                backgroundColor: `${colors.accent}18`,
                color: colors.accent,
              }}
            >
              Guest Jury
            </span>
            <h3
              className="text-lg font-bold leading-tight"
              style={{ color: colors.textPrimary }}
            >
              {member.name}
            </h3>
          </div>
        </div>

        {/* Divider */}
        <div
          className="w-10 h-px mb-5"
          style={{ backgroundColor: colors.accent, opacity: 0.35 }}
        />

        {/* Bio text */}
        <div className="flex-1">
          <p className="text-sm leading-relaxed" style={{ color: colors.textSecondary }}>
            {preview}
          </p>

          {/* Expandable content */}
          {isLong && rest.length > 0 && (
            <div
              className="overflow-hidden transition-all duration-500 ease-in-out"
              style={{ maxHeight: expanded ? '600px' : '0px', opacity: expanded ? 1 : 0 }}
            >
              <div className="space-y-3 mt-3">
                {rest.map((para, i) => (
                  <p key={i} className="text-sm leading-relaxed" style={{ color: colors.textSecondary }}>
                    {para}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Read more toggle */}
        {isLong && rest.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-5 text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 hover:gap-2.5 w-fit"
            style={{ color: colors.accent }}
          >
            {expanded ? 'Read less' : 'Read more'}
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default function GuestJury() {
  return (
    <section
      className="py-24 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: colors.background }}
    >
      <div className="max-w-7xl mx-auto">

        {/* Section Header */}
        <div className="mb-16">
          <p
            className="text-xs font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: colors.accent }}
          >
            Meet the Panel
          </p>
          <div className="flex items-end gap-6">
            <h2
              className="text-5xl md:text-6xl font-bold leading-none"
              style={{ color: colors.textPrimary }}
            >
              Guest Jury
            </h2>
            <div
              className="h-px flex-1 mb-2"
              style={{ backgroundColor: colors.border }}
            />
          </div>
          <p
            className="text-base mt-4 max-w-xl"
            style={{ color: colors.textSecondary }}
          >
            Our distinguished panel of experts bring decades of experience across architecture, planning, and design to evaluate and inspire the next generation of innovators.
          </p>
        </div>

        {/* Jury Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {juryMembers.map((member, index) => (
            <JuryCard key={member.name} member={member} index={index} />
          ))}
        </div>

      </div>
    </section>
  );
}

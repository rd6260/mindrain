'use client';

import { colors } from '@/utils/colors';
import { useState } from 'react';

const fees = {
  'Early Bird Registration': {
    india_monetary: { solo: '₹549', group: '₹999' },
    india_no_monetary: { solo: '₹275', group: '₹559' },
    international: { solo: '$35', group: '$79' },
  },
  'Regular Registration': {
    india_monetary: { solo: '₹699', group: '₹1,499' },
    india_no_monetary: { solo: '₹275', group: '₹559' },
    international: { solo: '$45', group: '$99' },
  },
  'Last Minute Registration': {
    india_monetary: { solo: '₹999', group: '₹1,999' },
    india_no_monetary: { solo: '₹375', group: '₹819' },
    international: { solo: '$69', group: '$149' },
  },
};

type Tier = keyof typeof fees;
type FeeKey = 'india_monetary' | 'india_no_monetary' | 'international';

const tierMeta: Record<Tier, { label: string; shortLabel: string; color: string; bg: string; border: string; dot: string }> = {
  'Early Bird Registration': {
    label: 'Early Bird Registration',
    shortLabel: 'Early Bird',
    color: 'text-[#2D5F4F]',
    bg: 'bg-[#2D5F4F]/8',
    border: 'border-[#2D5F4F]/20',
    dot: 'bg-[#2D5F4F]',
  },
  'Regular Registration': {
    label: 'Regular Registration',
    shortLabel: 'Regular',
    color: 'text-[#1A1A1A]',
    bg: 'bg-[#F8F7F2]',
    border: 'border-[#D0CEC2]',
    dot: 'bg-[#6B6B6B]',
  },
  'Last Minute Registration': {
    label: 'Last Minute Registration',
    shortLabel: 'Last Minute',
    color: 'text-[#D97757]',
    bg: 'bg-[#D97757]/8',
    border: 'border-[#D97757]/20',
    dot: 'bg-[#D97757]',
  },
};

// Reusable toggle button matching RegistrationPage style
function ToggleBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex-1 py-3 px-4 rounded-xl text-sm font-semibold border transition-all duration-200
        ${active
          ? 'bg-[#2C5F5F] text-white border-[#2C5F5F] shadow-md shadow-[#2C5F5F]/20'
          : 'bg-[#F8F7F2] text-[#6B6B6B] border-[#D0CEC2] hover:border-[#2C5F5F] hover:text-[#2C5F5F]'
        }
      `}
    >
      {children}
    </button>
  );
}

// Section heading with animated accent dot — matching RegistrationPage's SectionHeading
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="relative flex-shrink-0 w-2.5 h-2.5">
        <span className="absolute inset-0 rounded-full bg-[#2C5F5F]" />
        <span className="absolute inset-0 rounded-full bg-[#2C5F5F] animate-ping opacity-50" />
      </div>
      <h2 className="text-xs font-bold uppercase tracking-widest text-[#2C5F5F]">{children}</h2>
    </div>
  );
}

export default function RegistrationFees() {
  const [origin, setOrigin] = useState<'india' | 'international'>('india');
  const [monetary, setMonetary] = useState<'yes' | 'no'>('yes');
  const [teamType, setTeamType] = useState<'solo' | 'group'>('solo');

  const feeKey: FeeKey =
    origin === 'international' ? 'international'
      : monetary === 'yes' ? 'india_monetary'
        : 'india_no_monetary';

  return (
    <div className="rounded-lg p-6 space-y-7" style={{ backgroundColor: colors.white }}
    >

      {/* Application Type */}
      <div>
        <SectionHeading>Application Type</SectionHeading>
        <div className="flex gap-2">
          <ToggleBtn active={origin === 'india'} onClick={() => setOrigin('india')}>
            Indian Application
          </ToggleBtn>
          <ToggleBtn active={origin === 'international'} onClick={() => setOrigin('international')}>
            International
          </ToggleBtn>
        </div>
      </div>

      {/* Award Preference — only for India */}
      {origin === 'india' && (
        <div>
          <SectionHeading>Award Preference</SectionHeading>
          <div className="flex gap-2">
            <ToggleBtn active={monetary === 'yes'} onClick={() => setMonetary('yes')}>
              <span className="block text-xs font-bold">Group A</span>
              <span className="block text-[10px] opacity-70 mt-0.5">Monetary Award</span>
            </ToggleBtn>
            <ToggleBtn active={monetary === 'no'} onClick={() => setMonetary('no')}>
              <span className="block text-xs font-bold">Group B</span>
              <span className="block text-[10px] opacity-70 mt-0.5">No Monetary Award</span>
            </ToggleBtn>
          </div>
        </div>
      )}

      {/* Entry Type */}
      <div>
        <SectionHeading>Entry Type</SectionHeading>
        <div className="flex gap-2">
          <ToggleBtn active={teamType === 'solo'} onClick={() => setTeamType('solo')}>
            <span className="block text-xs font-bold">Solo</span>
            <span className="block text-[10px] opacity-70 mt-0.5">1 member</span>
          </ToggleBtn>
          <ToggleBtn active={teamType === 'group'} onClick={() => setTeamType('group')}>
            <span className="block text-xs font-bold">Group</span>
            <span className="block text-[10px] opacity-70 mt-0.5">up to 3 members</span>
          </ToggleBtn>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#E5E3D7]" />

      {/* Fee Tiers */}
      <div>
        <SectionHeading>Registration Fees</SectionHeading>
        <div className="space-y-2">
          {(Object.keys(fees) as Tier[]).map((tier) => {
            console.log(tier)
            if (tier != "Early Bird Registration") {
              return null;
            }
            const amount = fees[tier][feeKey][teamType];
            const { label, color, bg, border, dot } = tierMeta[tier];
            return (
              <div
                key={tier}
                className={`flex items-center justify-between px-4 py-3.5 rounded-xl border ${bg} ${border}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
                  <span className="text-sm text-[#6B6B6B] font-medium">{label}</span>
                </div>
                <span className={`text-base font-bold tabular-nums ${color}`}>{amount}</span>
              </div>
            );
          })}
        </div>

        <p className="text-[10px] text-[#8B8B8B] mt-3 text-center">
          Fees shown for {teamType === 'solo' ? 'solo' : 'group'} entries ·{' '}
          {origin === 'india'
            ? monetary === 'yes' ? 'Monetary award track' : 'Non-monetary award track'
            : 'International applicants'}
        </p>
      </div>

      <div className="flex items-center justify-center">
        <a
          href="/registration?event_id=3f123e78-60d6-494d-b307-18c5b4c8ab7f"
          className="px-12 py-3.5 rounded-lg text-white font-bold text-sm transition-all duration-300 hover:scale-110 shadow-2xl hover:shadow-3xl animate-pulse-glow inline-block text-center"
          style={{
            background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentHover})`
          }}
          data-testid="register-now-button"
        >
          Register Now →
        </a>
      </div>
    </div>
  );
}

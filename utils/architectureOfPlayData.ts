import { ImportantDate } from '@/types';

export const IMPORTANT_DATES: ImportantDate[] = [
  { label: 'Early Bird Registration Starts', date: '10 August 2026' },
  { label: 'Regular Registration Starts', date: '15 September 2026' },
  { label: 'Last Minute Registration Starts', date: '15 December 2026' },
  { label: 'Last Minute Registration Ends', date: '5 January 2027' },
  { label: 'Final Submission', date: '20 January 2027' },
];

export const PRIZES = [
  { label: '1st Prize', amount: '₹12,000', emoji: '🥇' },
  { label: '2nd Prize', amount: '₹8,000', emoji: '🥈' },
  { label: '3rd Prize', amount: '₹5,000', emoji: '🥉' },
];

export type Tier = 'Early Bird Registration' | 'Regular Registration' | 'Last Minute Registration';
export type FeeKey = 'india_monetary' | 'india_no_monetary' | 'international';
export type EntryType = 'solo' | 'group';

export const FEES: Record<Tier, Record<FeeKey, Record<EntryType, string>>> = {
  'Early Bird Registration': {
    india_monetary: { solo: '₹449', group: '₹999' },
    india_no_monetary: { solo: '₹275', group: '₹559' },
    international: { solo: '$15', group: '$29' },
  },
  'Regular Registration': {
    india_monetary: { solo: '₹699', group: '₹1,499' },
    india_no_monetary: { solo: '₹275', group: '₹559' },
    international: { solo: '$21', group: '$39' },
  },
  'Last Minute Registration': {
    india_monetary: { solo: '₹999', group: '₹1,999' },
    india_no_monetary: { solo: '₹375', group: '₹819' },
    international: { solo: '$29', group: '$59' },
  },
};

export const TIER_META: Record<Tier, { shortLabel: string; color: string; bg: string; border: string; dot: string; endsOn: string }> = {
  'Early Bird Registration': {
    shortLabel: 'Early Bird',
    color: 'text-[#2D5F4F]',
    bg: 'bg-[#2D5F4F]/8',
    border: 'border-[#2D5F4F]/20',
    dot: 'bg-[#2D5F4F]',
    endsOn: '14 September 2026',
  },
  'Regular Registration': {
    shortLabel: 'Regular',
    color: 'text-[#1A1A1A]',
    bg: 'bg-[#F8F7F2]',
    border: 'border-[#D0CEC2]',
    dot: 'bg-[#6B6B6B]',
    endsOn: '14 December 2026',
  },
  'Last Minute Registration': {
    shortLabel: 'Last Minute',
    color: 'text-[#D97757]',
    bg: 'bg-[#D97757]/8',
    border: 'border-[#D97757]/20',
    dot: 'bg-[#D97757]',
    endsOn: '5 January 2027',
  },
};

export function getCurrentTier(): Tier {
  const today = new Date();
  if (today <= new Date('2026-09-14')) return 'Early Bird Registration';
  if (today <= new Date('2026-12-14')) return 'Regular Registration';
  return 'Last Minute Registration';
}

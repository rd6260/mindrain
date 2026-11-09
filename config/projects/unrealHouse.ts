import type { BriefOnlyConfig } from './types';

/** Legacy event (pre-v3 registration). Brief data only — intentionally not in the v3 project registry. */
export const THE_UNREAL_HOUSE = {
  eventId: '3f123e78-60d6-494d-b307-18c5b4c8ab7f',
  slug: 'the-unreal-house',
  brief: {
    meta: {
      title: 'The Unreal House',
      subtitle: 'An Imaginary Home Design Challenge',
      category: 'Architecture Competition',
      edition: 'Edition 06',
      registrationUrl: 'https://www.mindrain.org/competition/the-unreal-house-2025-2026',
    },
    files: [
      {
        name: 'Important Dates & Calendar',
        description: 'Key deadlines and schedule',
        url: 'https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/the_unreal_house/Important%20Dates-Calender.pdf',
      },
      {
        name: 'Terms & Conditions',
        description: 'Important rules and regulations',
        url: 'https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/the_unreal_house/T&C%20(Important).pdf',
      },
      {
        name: 'Complete Brief',
        description: 'Full competition brief document',
        url: 'https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/the_unreal_house/The%20Unreal%20House%20(Complete%20Brief).pdf',
      },
      {
        name: 'Brief (Print Format)',
        description: 'Print-ready version of the brief',
        url: 'https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/the_unreal_house/The%20Unreal%20House%20(print%20format).pdf',
      },
    ],
  },
} as const satisfies BriefOnlyConfig;

import type { BriefOnlyConfig } from './types';

/** Legacy event (pre-v3 registration). Brief data only — intentionally not in the v3 project registry. */
export const THESIS_AWARD = {
  eventId: 'c4a201ae-8bfe-48bc-a526-4ac1288dd937',
  slug: 'thesis-award-2026',
  brief: {
    meta: {
      title: 'Mind Rain Thesis Award',
      subtitle: 'Undergraduate Architecture Thesis Recognition Program',
      category: 'Thesis Award',
      edition: 'Edition 02',
      registrationUrl: 'https://www.mindrain.org/competition/thesis-award-2026',
    },
    files: [
      {
        name: 'MR Thesis Award Detailed PDF',
        description: 'Full competition brief document',
        url: 'https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/thesis_award_26/MindRain%20Thesis%20Award%20(Detailed%20PDF).pdf',
      },
      {
        name: 'Important Dates & Calendar',
        description: 'Key deadlines and schedule',
        url: 'https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/thesis_award_26/Important%20Dates-Calender.pdf',
      },
      {
        name: 'Terms & Conditions',
        description: 'Important rules and regulations',
        url: 'https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/thesis_award_26/T&C%20doc..pdf',
      },
    ],
  },
} as const satisfies BriefOnlyConfig;

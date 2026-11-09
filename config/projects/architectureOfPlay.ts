import { registrationPath, type ProjectBaseConfig } from './types';

const eventId = '1389f7d3-e98a-40dd-819a-5b756e3c2ada';

export const ARCHITECTURE_OF_PLAY = {
  eventId,
  slug: 'architecture-of-play',
  title: 'The Architecture of Play',
  kind: 'competition',
  pagePath: '/competition/the-architecture-of-play',
  registrationPath: registrationPath(eventId),
  paymentEnabled: true,
  brief: {
    meta: {
      title: 'The Architecture of Play',
      subtitle: 'A Kindergarten Design Challenge',
      category: 'Architecture Competition',
      edition: 'Edition 07',
      registrationUrl: 'https://www.mindrain.org/competition/the-architecture-of-play',
    },
    files: [
      {
        name: 'Competition Calendar',
        description: 'Key deadlines and schedule',
        url: 'https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/architecture_of_play/Competition%20Calender.pdf',
      },
      {
        name: 'Terms & Conditions',
        description: 'Important rules and regulations',
        url: 'https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/architecture_of_play/T&C%20(Important).pdf',
      },
      {
        name: 'Complete Brief',
        description: 'Full competition brief document',
        url: 'https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/architecture_of_play/Compitetion%20Brief.pdf',
      },
      {
        name: 'Printable Brief',
        description: 'Print-ready version of the brief',
        url: 'https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/architecture_of_play/Printable%20brief.pdf',
      },
    ],
  },
  /** Supabase storage bucket for institute ID uploads. */
  idUploadBucket: 'college_id/architecture_of_play',
} as const satisfies ProjectBaseConfig & { idUploadBucket: string };

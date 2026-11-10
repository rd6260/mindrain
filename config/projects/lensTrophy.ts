import type { BriefOnlyConfig } from './types';

/**
 * The MR Lens Trophy 26. Brief files are managed in the admin event editor and stored in
 * the `event_briefs` table, so `brief.files` is intentionally omitted here.
 */
export const MR_LENS_TROPHY = {
  eventId: '2fd1d6e2-0a2d-4868-986c-c1e1dcf70691',
  slug: 'the-mr-lens-trophy-26',
  brief: {
    meta: {
      title: 'The Mindrain Lens Trophy',
      subtitle: 'Your world. Your frame. Your story.',
      category: 'Photography Competition',
      edition: 'Edition 02',
      registrationUrl: 'https://www.mindrain.org/competition/the-mr-lens-trophy-26',
    },
  },
} as const satisfies BriefOnlyConfig;

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
  /** Supabase storage bucket for institute ID uploads. */
  idUploadBucket: 'college_id/architecture_of_play',
} as const satisfies ProjectBaseConfig & { idUploadBucket: string };

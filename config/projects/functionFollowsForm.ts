import { registrationPath, type ProjectBaseConfig } from './types';

const eventId = '6159b71a-f973-453a-a383-6b2bbfca707a';

export const FUNCTION_FOLLOWS_FORM = {
  eventId,
  slug: 'function-follows-form',
  title: 'Function Follows Form',
  kind: 'workshop',
  pagePath: '/workshops/function-follows-form',
  registrationPath: registrationPath(eventId),
  // Registration only for now; flip to true (and define pricing in lib/projects) to open payments.
  paymentEnabled: false,
  /** Private bucket for form uploads. Files live at `<uid>/<slug>/...` (RLS is per-uid top-level folder). */
  formUploadBucket: 'form_data',
  /** Ordered progress stages. Must match `event_progress_stages` rows in the DB. */
  progressStages: ['application', 'shortlisting', 'interview', 'final_selection', 'fee_payment'],
} as const satisfies ProjectBaseConfig & { formUploadBucket: string; progressStages: readonly string[] };

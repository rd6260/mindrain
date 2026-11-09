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
  brief: {
    meta: {
      title: 'Function Follows Form',
      subtitle: 'Think beyond the box. Design with intent',
      category: 'Architecture Deign Workhop',
      edition: 'Edition 02',
      registrationUrl: 'https://www.mindrain.org/competition/the-unreal-house-2025-2026',
    },
    files: [
      {
        name: 'Function Follows Form',
        description: 'Complete Brief',
        url: 'https://cdn.jsdelivr.net/gh/rd6260/mindrain@main/public/brief/function-follows-form/Function Follows Form 06.11.2026.pdf',
      },
    ],
  },
  /** Private bucket for form uploads. Files live at `<uid>/<slug>/...` (RLS is per-uid top-level folder). */
  formUploadBucket: 'form_data',
  /** Ordered progress stages (keys of `form_data.progress`). */
  progressStages: ['application', 'shortlisting', 'interview', 'final_selection', 'fee_payment'],
  initialProgress: {
    application: 'approved', // shown as "Submitted"
    shortlisting: 'in_progress',
    interview: 'pending',
    final_selection: 'pending',
    fee_payment: 'pending',
  },
} as const satisfies ProjectBaseConfig & { formUploadBucket: string };

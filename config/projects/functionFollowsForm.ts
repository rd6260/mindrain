import { registrationPath, type ProjectBaseConfig } from './types';

const eventId = '6159b71a-f973-453a-a383-6b2bbfca707a';

export const FUNCTION_FOLLOWS_FORM = {
  eventId,
  slug: 'function-follows-form',
  title: 'Function Follows Form',
  kind: 'workshop',
  pagePath: '/workshops/function-follows-form',
  registrationPath: registrationPath(eventId),
  // Pricing lives in lib/projects/functionFollowsForm.ts. Payment only opens per applicant once
  // they are approved at final selection (see paymentAfterStage).
  paymentEnabled: true,
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
  /** Decided at shortlisting (approved or rejected) → the application form is frozen. */
  editLockedAfterStage: 'shortlisting',
  /** During final selection the applicant can still update their LOR and documents (not the answers). */
  partialEdit: { stage: 'final_selection', status: 'in_progress', keys: ['lor_path', 'documents'] },
  /** Selected in the final round → fee payment opens. */
  paymentAfterStage: 'final_selection',
  paymentStage: 'fee_payment',
} as const satisfies ProjectBaseConfig & { formUploadBucket: string };

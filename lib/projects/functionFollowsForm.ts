import { FUNCTION_FOLLOWS_FORM } from '@/config/projects';
import type { ProjectConfig } from './types';

export const FFF_QUESTION_KEYS = [
  'excitement',
  'motivation',
  'strength',
  'challenge',
  'first_driver',
  'openness',
] as const;

export const FFF_QUESTIONS: Record<(typeof FFF_QUESTION_KEYS)[number], string> = {
  excitement:
    'What excites you most about the possibility of being part of this workshop? What would you like to learn, experience, or discover during these nine days?',
  motivation:
    'Why do you want to be a part of Function Follows Form? What do you hope to experience here that you might not encounter in your regular architectural education?',
  strength:
    'What do you believe is your strongest quality as an architectural designer? How does it reflect in the way you observe, imagine, or approach design problems?',
  challenge:
    'Every designer has areas they wish to explore and improve. What do you find most challenging about architectural design, and what would you like to become better at?',
  first_driver:
    'When approaching a new design problem, what usually drives your first thought — function, form, concept, context, or something entirely different? Tell us why.',
  openness:
    'Architecture often requires questioning your own ideas, stepping outside familiar approaches, and starting over. How open are you to challenging your existing design beliefs and exploring possibilities you may not have considered before?',
};

/** Where a user's LOR lives in the private form bucket (RLS: 2nd folder must equal the user's id). */
export const fffLorPath = (userId: string) => `${FUNCTION_FOLLOWS_FORM.slug}/${userId}/letter_of_recommendation.pdf`;

/** "Documents and undertakings": extra PDFs / images the applicant attaches to the application. */
export const FFF_DOCUMENT_MAX_BYTES = 1024 * 1024; // 1 MiB each
export const FFF_DOCUMENT_MAX_COUNT = 10;
export const FFF_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'] as const;
export const fffDocumentsFolder = (userId: string) => `${FUNCTION_FOLLOWS_FORM.slug}/${userId}/documents`;

export interface FffDocument {
  name: string;
  path: string;
  size: number;
  type: string;
}

export const FFF_ANSWER_MAX_LENGTH = 2000;

export const FFF_ACADEMIC_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'] as const;

export const functionFollowsForm: ProjectConfig = {
  eventId: FUNCTION_FOLLOWS_FORM.eventId,
  title: FUNCTION_FOLLOWS_FORM.title,

  validateFormData(fd, ctx) {
    if (typeof fd.name !== 'string' || !fd.name.trim()) return 'Please enter your name';
    if (typeof fd.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fd.email.trim())) return 'Please enter a valid email address';
    // WhatsApp number with country code, e.g. +91 98765 43210
    if (typeof fd.whatsapp !== 'string' || !/^\+[0-9][0-9\s-]{6,17}$/.test(fd.whatsapp.trim())) {
      return 'Please enter your WhatsApp number with country code (e.g. +91 98765 43210)';
    }
    if (!(FFF_ACADEMIC_YEARS as readonly string[]).includes(fd.academic_year)) return 'Please select your academic year';
    if (typeof fd.college !== 'string' || !fd.college.trim() || fd.college.length > 200) return 'Please enter your college name';
    for (const key of FFF_QUESTION_KEYS) {
      const v = fd[key];
      if (typeof v !== 'string' || !v.trim()) return 'Please answer all the questions';
      if (v.length > FFF_ANSWER_MAX_LENGTH) return `Answers must be under ${FFF_ANSWER_MAX_LENGTH} characters`;
    }
    // The LOR is optional at application time; it becomes mandatory once the applicant is
    // approved at the interview stage (uploaded from the profile page, see /api/v3/fff/lor).
    if (fd.lor_path != null && typeof fd.lor_path !== 'string') return 'Invalid Letter of Recommendation';

    if (fd.documents != null) {
      if (!Array.isArray(fd.documents) || fd.documents.length > FFF_DOCUMENT_MAX_COUNT) {
        return `You can attach at most ${FFF_DOCUMENT_MAX_COUNT} documents`;
      }
      for (const d of fd.documents) {
        const ok =
          d && typeof d.name === 'string' && typeof d.path === 'string' &&
          typeof d.size === 'number' && typeof d.type === 'string';
        if (!ok) return 'Invalid document';
        if (d.size > FFF_DOCUMENT_MAX_BYTES) return `"${d.name}" is larger than 1MB`;
        if (!(FFF_DOCUMENT_TYPES as readonly string[]).includes(d.type)) return `"${d.name}" must be a PDF or an image`;
        // Documents must live in the submitting user's own folder.
        if (ctx && !d.path.startsWith(`${fffDocumentsFolder(ctx.userId)}/`)) return 'Invalid document';
      }
    }
    return null;
  },

  buildTeamId({ codeName, sequence }) {
    return `${codeName}-${String(sequence).padStart(4, '0')}`;
  },

  getBaseFee() {
    // TODO: workshop fee has not been defined yet. Registration works; payment stays closed until this exists.
    throw new Error('Function Follows Form pricing is not configured');
  },

  getSummary(_fd, fee) {
    return [
      { label: 'Workshop', value: FUNCTION_FOLLOWS_FORM.title },
      ...(fee.badge ? [{ label: 'Registration Period', value: fee.badge }] : []),
    ];
  },

  // Essays and the LOR path don't belong on a payment receipt.
  invoiceHiddenKeys: [...FFF_QUESTION_KEYS, 'lor_path', 'documents'],
};

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

export const FFF_ANSWER_MAX_LENGTH = 2000;

export const functionFollowsForm: ProjectConfig = {
  eventId: FUNCTION_FOLLOWS_FORM.eventId,
  title: FUNCTION_FOLLOWS_FORM.title,

  validateFormData(fd) {
    for (const key of FFF_QUESTION_KEYS) {
      const v = fd[key];
      if (typeof v !== 'string' || !v.trim()) return 'Please answer all the questions';
      if (v.length > FFF_ANSWER_MAX_LENGTH) return `Answers must be under ${FFF_ANSWER_MAX_LENGTH} characters`;
    }
    if (typeof fd.lor_path !== 'string' || !fd.lor_path) return 'Letter of Recommendation is required';
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
  invoiceHiddenKeys: [...FFF_QUESTION_KEYS, 'lor_path'],
};

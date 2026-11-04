import type { ComponentType } from 'react';
import ArchitectureOfPlayForm from './ArchitectureOfPlayForm';
import type { RegistrationFormProps } from './types';

/**
 * Client-side registry: `events.id` → that project's registration form.
 * Keep in sync with `lib/projects/index.ts` (server config for the same event).
 *
 * Function Follows Form is intentionally absent until its form is built.
 */
const REGISTRATION_FORMS: Record<string, ComponentType<RegistrationFormProps>> = {
  '1389f7d3-e98a-40dd-819a-5b756e3c2ada': ArchitectureOfPlayForm,
};

export function getRegistrationForm(eventId: string) {
  return REGISTRATION_FORMS[eventId];
}

export function hasRegistrationForm(eventId: string) {
  return eventId in REGISTRATION_FORMS;
}

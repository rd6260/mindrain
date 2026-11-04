import type { ComponentType } from 'react';
import ArchitectureOfPlayForm from './ArchitectureOfPlayForm';
import { ARCHITECTURE_OF_PLAY } from '@/config/projects';
import type { RegistrationFormProps } from './types';

/**
 * Client-side registry: `events.id` → that project's registration form.
 * Keep in sync with `lib/projects/index.ts` (server config for the same event).
 *
 * Function Follows Form is intentionally absent until its form is built.
 */
const REGISTRATION_FORMS: Record<string, ComponentType<RegistrationFormProps>> = {
  [ARCHITECTURE_OF_PLAY.eventId]: ArchitectureOfPlayForm,
};

export function getRegistrationForm(eventId: string) {
  return REGISTRATION_FORMS[eventId];
}

export function hasRegistrationForm(eventId: string) {
  return eventId in REGISTRATION_FORMS;
}

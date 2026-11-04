import type { ComponentType } from 'react';
import ArchitectureOfPlayForm from './ArchitectureOfPlayForm';
import FunctionFollowsFormForm from './FunctionFollowsFormForm';
import { ARCHITECTURE_OF_PLAY, FUNCTION_FOLLOWS_FORM } from '@/config/projects';
import type { RegistrationFormProps } from './types';

/**
 * Client-side registry: `events.id` → that project's registration form.
 * Keep in sync with `lib/projects/index.ts` (server config for the same event).
 */
const REGISTRATION_FORMS: Record<string, ComponentType<RegistrationFormProps>> = {
  [ARCHITECTURE_OF_PLAY.eventId]: ArchitectureOfPlayForm,
  [FUNCTION_FOLLOWS_FORM.eventId]: FunctionFollowsFormForm,
};

export function getRegistrationForm(eventId: string) {
  return REGISTRATION_FORMS[eventId];
}

export function hasRegistrationForm(eventId: string) {
  return eventId in REGISTRATION_FORMS;
}

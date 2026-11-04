import { architectureOfPlay } from './architectureOfPlay';
import type { ProjectConfig } from './types';

/**
 * Server-side registry of projects that can take registrations + payments.
 * To onboard a new competition/workshop: add its config here and its form
 * component in `app/components/registration/registry.ts`.
 *
 * Function Follows Form is intentionally absent until its form + pricing exist.
 */
const PROJECTS: Record<string, ProjectConfig> = {
  [architectureOfPlay.eventId]: architectureOfPlay,
};

export function getProject(eventId: string): ProjectConfig | undefined {
  return PROJECTS[eventId];
}

export type { ProjectConfig, BaseFee, SummaryRow, FormData } from './types';

import { architectureOfPlay } from './architectureOfPlay';
import { functionFollowsForm } from './functionFollowsForm';
import { lensTrophy } from './lensTrophy';
import type { ProjectConfig } from './types';

/**
 * Server-side registry of projects that can take registrations + payments.
 * To onboard a new competition/workshop: add its config here and its form
 * component in `app/components/registration/registry.ts`.
 */
const PROJECTS: Record<string, ProjectConfig> = {
  [architectureOfPlay.eventId]: architectureOfPlay,
  [functionFollowsForm.eventId]: functionFollowsForm,
  [lensTrophy.eventId]: lensTrophy,
};

export function getProject(eventId: string): ProjectConfig | undefined {
  return PROJECTS[eventId];
}

export type { ProjectConfig, BaseFee, SummaryRow, FormData } from './types';

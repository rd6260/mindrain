// Static, shared (client + server) config for every live project.
// Add a new project here; don't redefine event ids anywhere else.
export { ARCHITECTURE_OF_PLAY } from './architectureOfPlay';
export { FUNCTION_FOLLOWS_FORM } from './functionFollowsForm';
export { THE_UNREAL_HOUSE } from './unrealHouse';
export { THESIS_AWARD } from './thesisAward';
export { MR_LENS_TROPHY } from './lensTrophy';
export type { ProjectBaseConfig, BriefConfig, BriefFile, BriefMeta } from './types';
export type { LensFeeSlab, LensFeeTable } from './lensTrophy';

import { ARCHITECTURE_OF_PLAY } from './architectureOfPlay';
import { FUNCTION_FOLLOWS_FORM } from './functionFollowsForm';
import { THE_UNREAL_HOUSE } from './unrealHouse';
import { THESIS_AWARD } from './thesisAward';
import { MR_LENS_TROPHY } from './lensTrophy';
import type { ProjectBaseConfig, BriefConfig } from './types';

const ALL: ProjectBaseConfig[] = [ARCHITECTURE_OF_PLAY, FUNCTION_FOLLOWS_FORM, MR_LENS_TROPHY];

export function getProjectConfig(eventId: string): ProjectBaseConfig | undefined {
  return ALL.find(p => p.eventId === eventId);
}

const BRIEF_SOURCES: { eventId: string; brief?: BriefConfig }[] = [...ALL, THE_UNREAL_HOUSE, THESIS_AWARD];

/** Brief files + marketing metadata for any event (v3 projects and legacy events). */
export function getBrief(eventId: string): BriefConfig | null {
  return BRIEF_SOURCES.find(p => p.eventId === eventId)?.brief ?? null;
}

type Json = Record<string, any>;

/** Form answers only — strips the `{ form, progress }` envelope for projects that track progress. */
export function fromStoredFormData(eventId: string, stored: Json | null | undefined): Json {
  if (!stored) return {};
  return getProjectConfig(eventId)?.progressStages ? (stored.form ?? {}) : stored;
}

/** What actually gets written to `registrations_v3.form_data`. Existing progress is never overwritten. */
export function toStoredFormData(eventId: string, form: Json, existingStored?: Json | null): Json {
  const cfg = getProjectConfig(eventId);
  // `orders` is server-owned (see lib/projects/orders.ts): never trust it from the client, keep what we have.
  const { orders: _ignored, ...clean } = form;
  form = existingStored?.orders ? { ...clean, orders: existingStored.orders } : clean;
  if (!cfg?.initialProgress) return form;
  return { form, progress: existingStored?.progress ?? { ...cfg.initialProgress } };
}

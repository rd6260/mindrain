// Static, shared (client + server) config for every live project.
// Add a new project here; don't redefine event ids anywhere else.
export { ARCHITECTURE_OF_PLAY } from './architectureOfPlay';
export { FUNCTION_FOLLOWS_FORM } from './functionFollowsForm';
export type { ProjectBaseConfig } from './types';

import { ARCHITECTURE_OF_PLAY } from './architectureOfPlay';
import { FUNCTION_FOLLOWS_FORM } from './functionFollowsForm';
import type { ProjectBaseConfig } from './types';

const ALL: ProjectBaseConfig[] = [ARCHITECTURE_OF_PLAY, FUNCTION_FOLLOWS_FORM];

export function getProjectConfig(eventId: string): ProjectBaseConfig | undefined {
  return ALL.find(p => p.eventId === eventId);
}

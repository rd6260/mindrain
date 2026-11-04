export interface ProjectBaseConfig {
  /** `events.id` in the database. The single place this id is defined. */
  eventId: string;
  /** Short stable key, e.g. for storage keys. */
  slug: string;
  title: string;
  kind: 'competition' | 'workshop';
  /** Public marketing page. */
  pagePath: string;
  /** Generic v3 registration entry point for this project. */
  registrationPath: string;
}

export const registrationPath = (eventId: string) => `/registration-3?event_id=${eventId}`;

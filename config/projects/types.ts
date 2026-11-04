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
  /** false = registration only; no payment step after submitting the form. */
  paymentEnabled: boolean;
  /**
   * Projects with progress tracking store `form_data` as `{ form, progress }`
   * instead of a flat object. `progress` maps stage -> status.
   */
  progressStages?: readonly string[];
  initialProgress?: Readonly<Record<string, string>>;
}

export const registrationPath = (eventId: string) => `/registration-3?event_id=${eventId}`;

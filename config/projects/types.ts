export interface BriefFile {
  name: string;
  description: string;
  url: string;
}

export interface BriefMeta {
  title: string;
  subtitle: string;
  category: string;
  edition: string;
  registrationUrl: string;
}

export interface BriefConfig {
  meta: BriefMeta;
  /** Hard-coded files. Omit to load them from the `event_briefs` table (see lib/briefs.ts). */
  files?: BriefFile[];
}

/** Minimal shape for events that only need brief data (no v3 registration/payment pipeline). */
export interface BriefOnlyConfig {
  eventId: string;
  slug: string;
  brief: BriefConfig;
}

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
  /** Brief downloads + marketing metadata shown on the event page and in the brief modal/email. */
  brief?: BriefConfig;
  progressStages?: readonly string[];
  initialProgress?: Readonly<Record<string, string>>;
}

export const registrationPath = (eventId: string) => `/registration-3?event_id=${eventId}`;

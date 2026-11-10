import { registrationPath, type ProjectBaseConfig } from './types';

const eventId = '2fd1d6e2-0a2d-4868-986c-c1e1dcf70691';

export interface LensFeeSlab {
  /** Order size range this slab applies to (inclusive). */
  from: number;
  to: number;
  label: string;
  /** Price per image, in major units (e.g. 99 = ₹99, 2.6 = $2.60). */
  perImage?: number;
  /** Flat price for the whole order instead of a per-image price (special package). */
  total?: number;
  /** Advertised discount (%) of this slab compared with the first slab. Shown in the "add N more" hints. */
  discountPercent?: number;
}

export interface LensFeeTable {
  currency: 'INR' | 'USD';
  symbol: string;
  title: string;
  slabs: readonly LensFeeSlab[];
}

/**
 * The MR Lens Trophy 26.
 *
 * Everything that changes between editions lives here: dates (precise ISO datetimes, IST) and fees.
 * The marketing page, the registration form, the quote/payment pipeline and the emails all read from this file.
 * Brief files are managed in the admin event editor (`event_briefs` table), so `brief.files` is omitted.
 */
export const MR_LENS_TROPHY = {
  eventId,
  slug: 'the-mr-lens-trophy-26',
  title: 'The MR Lens Trophy 26',
  kind: 'competition',
  pagePath: '/competition/the-mr-lens-trophy-26',
  registrationPath: registrationPath(eventId),
  paymentEnabled: true,

  brief: {
    meta: {
      title: 'The Mindrain Lens Trophy',
      subtitle: 'Your world. Your frame. Your story.',
      category: 'Photography Competition',
      edition: 'Edition 02',
      registrationUrl: 'https://www.mindrain.org/competition/the-mr-lens-trophy-26',
    },
  },

  /**
   * Photography categories. A participant chooses how many images they want in EACH category.
   * The `key`s are stored in registration data, so don't rename them once registrations exist.
   * The `code` is the category number used in photography ids: <mind id>-<code>-<n>.
   */
  categories: [
    { key: 'open', code: 1, label: 'Open Photography (Category 1)' },
    { key: 'architecture', code: 2, label: 'Architecture Photography (Category 2)' },
  ],

  /** ISO 8601 with offset, so comparisons are exact regardless of the viewer's timezone. */
  dates: {
    registrationOpens: '2026-11-11T00:00:00+05:30',
    registrationEnds: '2027-01-18T23:59:59+05:30',
    submissionEnds: '2027-01-25T23:59:59+05:30',
    resultsAnnouncement: '2027-03-10T00:00:00+05:30',
  },

  /**
   * Fees are per ORDER: the slab is chosen by how many images that single order contains,
   * never by the participant's running total. (3 images now + 2 later = a 1–4 order and another 1–4 order.)
   */
  fees: {
    /** Maximum images one participant can buy across all their orders. */
    maxImages: 10,
    india: {
      currency: 'INR',
      symbol: '₹',
      title: 'Indian Participants',
      slabs: [
        { from: 1, to: 4, label: '1–4 Images', perImage: 99 },
        { from: 5, to: 9, label: '5–9 Images', perImage: 84, discountPercent: 15 },
        { from: 10, to: 10, label: '10 Images', total: 799 },
      ],
    },
    international: {
      currency: 'USD',
      symbol: '$',
      title: 'International Participants',
      slabs: [
        { from: 1, to: 4, label: '1–4 Images', perImage: 3 },
        { from: 5, to: 9, label: '5–9 Images', perImage: 2.6, discountPercent: 15 },
        { from: 10, to: 10, label: '10 Images', total: 23 },
      ],
    },
  },
} as const satisfies ProjectBaseConfig & {
  categories: readonly { key: string; code: number; label: string }[];
  dates: Record<string, string>;
  fees: { maxImages: number; india: LensFeeTable; international: LensFeeTable };
};

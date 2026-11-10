import { MR_LENS_TROPHY, type LensFeeSlab } from '@/config/projects';
import type { BaseFee, ProjectConfig } from './types';

const { fees, dates, categories } = MR_LENS_TROPHY;

export type LensOrigin = 'india' | 'international';
export type LensCategoryCounts = Record<string, number>;

export const lensOriginOf = (country: unknown): LensOrigin =>
  String(country ?? '').trim().toLowerCase() === 'india' ? 'india' : 'international';

/** The slab one ORDER of `quantity` images falls into. Never based on the participant's running total. */
export function lensSlabFor(origin: LensOrigin, quantity: number): LensFeeSlab | undefined {
  return fees[origin].slabs.find(s => quantity >= s.from && quantity <= s.to);
}

/** Price of one order, in major units. */
export function lensOrderTotal(origin: LensOrigin, quantity: number): number {
  const slab = lensSlabFor(origin, quantity);
  if (!slab) throw new Error(`No fee defined for an order of ${quantity} images`);
  return slab.total ?? (slab.perImage as number) * quantity;
}

/**
 * "Add N more images to get Y% discount": nudges towards the next better slab.
 * `maxQuantity` is how many images the order can still grow to (cap minus what the participant already owns);
 * a slab that can't be reached is not suggested.
 */
export function lensUpsell(origin: LensOrigin, quantity: number, maxQuantity: number = fees.maxImages): string | null {
  if (quantity < 1) return null;
  const slabs: readonly LensFeeSlab[] = fees[origin].slabs;
  const symbol = fees[origin].symbol;
  const next = slabs.find(s => s.from > quantity);
  if (!next) return 'Best price applied';
  if (next.from > maxQuantity) return null;
  const more = next.from - quantity;
  const images = `${more} more ${more === 1 ? 'image' : 'images'}`;
  if (next.total != null) return `Add ${images} to get the special package (${symbol}${next.total} total)`;
  if (next.discountPercent) return `Add ${images} to get ${next.discountPercent}% discount`;
  return null;
}

/** Short caption for a slab in the static fee table. */
export function lensSlabCaption(slab: LensFeeSlab): string {
  if (slab.total != null) return 'Special package';
  if (slab.discountPercent) return `${slab.discountPercent}% discount from ${slab.from} images`;
  return '';
}

export const lensIsOpen = (now: Date) =>
  now >= new Date(dates.registrationOpens) && now <= new Date(dates.registrationEnds);

/** A valid per-category split ({ open: 2, architecture: 1 }) or null. Total is checked by the caller. */
export function parseCategoryCounts(input: unknown): LensCategoryCounts | null {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const src = input as Record<string, unknown>;
  const out: LensCategoryCounts = {};
  for (const { key } of categories) {
    const n = src[key] ?? 0;
    if (typeof n !== 'number' || !Number.isInteger(n) || n < 0 || n > fees.maxImages) return null;
    out[key] = n;
  }
  return out;
}

/**
 * Photography ids of a participant: <mind id>-<category code>-<number>, e.g. MRLT2-6520-1-2.
 * Numbers run 1..n per category over ALL paid orders, so buying more images later only appends new ids.
 */
export function lensPhotoIds(teamId: string, paidByCategory: LensCategoryCounts) {
  return categories.map(c => ({
    key: c.key,
    label: c.label,
    ids: Array.from({ length: paidByCategory[c.key] ?? 0 }, (_, i) => `${teamId}-${c.code}-${i + 1}`),
  }));
}

export const totalOf = (counts: LensCategoryCounts) => Object.values(counts).reduce((a, b) => a + b, 0);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INSTAGRAM_RE = /^[A-Za-z0-9._]{1,30}$/;

export const lensTrophy: ProjectConfig = {
  eventId: MR_LENS_TROPHY.eventId,
  title: MR_LENS_TROPHY.title,

  isOpen: lensIsOpen,

  orders: {
    unit: 'image',
    maxTotal: fees.maxImages,
    initialQuantity: fd => totalOf(parseCategoryCounts(fd.categories) ?? {}),
    breakdown: {
      groups: categories.map(c => ({ key: c.key, label: c.label })),
      initial: fd => parseCategoryCounts(fd.categories) ?? {},
      // Default add-on order = 1 image in the first category.
      parse: input => (input === undefined ? { ...Object.fromEntries(categories.map(c => [c.key, 0])), [categories[0].key]: 1 } : parseCategoryCounts(input)),
    },
  },

  validateFormData(fd) {
    if (typeof fd.name !== 'string' || !fd.name.trim()) return 'Name is required';
    if (typeof fd.email !== 'string' || !EMAIL_RE.test(fd.email.trim())) return 'A valid email is required';
    if (typeof fd.whatsapp !== 'string' || !/^\+?[0-9][0-9\s-]{6,17}$/.test(fd.whatsapp.trim())) {
      return 'A valid WhatsApp number is required';
    }
    if (fd.instagram != null && fd.instagram !== '' &&
        (typeof fd.instagram !== 'string' || !INSTAGRAM_RE.test(fd.instagram.replace(/^@/, '').trim()))) {
      return 'Invalid Instagram id';
    }
    if (typeof fd.country !== 'string' || !fd.country.trim()) return 'Country is required';

    const counts = parseCategoryCounts(fd.categories);
    if (!counts) return 'Invalid image counts';
    const total = totalOf(counts);
    if (total < 1 || total > fees.maxImages) return `Choose between 1 and ${fees.maxImages} images in total`;
    return null;
  },

  buildTeamId({ codeName, sequence }) {
    return `${codeName}-${String(sequence).padStart(4, '0')}`;
  },

  getBaseFee(fd, _now, quantity) {
    const qty = quantity ?? totalOf(parseCategoryCounts(fd.categories) ?? {});
    const origin = lensOriginOf(fd.country);
    const slab = lensSlabFor(origin, qty);
    if (!slab) throw new Error(`No fee defined for an order of ${qty} images`);
    return {
      amountMinor: Math.round(lensOrderTotal(origin, qty) * 100),
      currency: fees[origin].currency,
      badge: slab.label,
      description: `${qty} ${qty === 1 ? 'image' : 'images'} · ${slab.label}`,
    } satisfies BaseFee;
  },

  getSummary(fd, _fee, quantity, breakdown, remaining) {
    const counts = breakdown ?? parseCategoryCounts(fd.categories) ?? {};
    const qty = quantity ?? totalOf(counts);
    const origin = lensOriginOf(fd.country);
    const slab = lensSlabFor(origin, qty);
    const { symbol } = fees[origin];
    const rate = slab?.total != null
      ? `${symbol}${slab.total} total`
      : `${symbol}${slab?.perImage} / image`;
    const upsell = lensUpsell(origin, qty, remaining);
    return [
      { label: 'Images in this order', value: String(qty) },
      ...categories.map(c => ({ label: c.label, value: String(counts[c.key] ?? 0) })),
      { label: 'Rate', value: rate },
      ...(upsell ? [{ label: 'Tip', value: upsell }] : []),
      { label: 'Participant', value: fd.name },
      { label: 'Notifications sent to', value: fd.email },
    ];
  },

  invoiceHiddenKeys: ['orders'],
};

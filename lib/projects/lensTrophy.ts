import { MR_LENS_TROPHY, type LensFeeSlab } from '@/config/projects';
import type { BaseFee, ProjectConfig } from './types';

const { fees, dates } = MR_LENS_TROPHY;

export type LensOrigin = 'india' | 'international';

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

export const lensIsOpen = (now: Date) =>
  now >= new Date(dates.registrationOpens) && now <= new Date(dates.registrationEnds);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INSTAGRAM_RE = /^[A-Za-z0-9._]{1,30}$/;

export const lensTrophy: ProjectConfig = {
  eventId: MR_LENS_TROPHY.eventId,
  title: MR_LENS_TROPHY.title,

  isOpen: lensIsOpen,

  orders: {
    unit: 'image',
    maxTotal: fees.maxImages,
    initialQuantity: fd => Number(fd.images),
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
    if (!Number.isInteger(fd.images) || fd.images < 1 || fd.images > fees.maxImages) {
      return `Choose between 1 and ${fees.maxImages} images`;
    }
    return null;
  },

  buildTeamId({ codeName, sequence }) {
    return `${codeName}-${String(sequence).padStart(4, '0')}`;
  },

  getBaseFee(fd, _now, quantity) {
    const qty = quantity ?? Number(fd.images);
    const origin = lensOriginOf(fd.country);
    const slab = lensSlabFor(origin, qty);
    if (!slab) throw new Error(`No fee defined for an order of ${qty} images`);
    const table = fees[origin];
    return {
      amountMinor: Math.round(lensOrderTotal(origin, qty) * 100),
      currency: table.currency,
      badge: slab.label,
      description: `${qty} ${qty === 1 ? 'image' : 'images'} · ${slab.label}`,
    } satisfies BaseFee;
  },

  getSummary(fd, fee, quantity) {
    const qty = quantity ?? Number(fd.images);
    const origin = lensOriginOf(fd.country);
    const slab = lensSlabFor(origin, qty);
    const { symbol } = fees[origin];
    const rate = slab?.total != null
      ? `${symbol}${slab.total} total (${slab.note})`
      : `${symbol}${slab?.perImage} / image (${slab?.note})`;
    return [
      { label: 'Images in this order', value: String(qty) },
      { label: 'Rate', value: rate },
      { label: 'Participant', value: fd.name },
      { label: 'Notifications sent to', value: fd.email },
    ];
  },

  invoiceHiddenKeys: ['orders'],
};

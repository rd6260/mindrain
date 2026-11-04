import {
  FEES,
  getCurrentTier,
  type EntryType,
  type FeeKey,
  type Tier,
} from '@/utils/architectureOfPlayData';
import type { BaseFee, ProjectConfig } from './types';

export const ARCHITECTURE_OF_PLAY_EVENT_ID = '1389f7d3-e98a-40dd-819a-5b756e3c2ada';

function feeFor(formData: Record<string, any>, tier: Tier): BaseFee {
  const isIndian = String(formData.country ?? '').toLowerCase() === 'india';
  const feeKey: FeeKey = !isIndian
    ? 'international'
    : formData.group === 'A'
      ? 'india_monetary'
      : 'india_no_monetary';
  const entryType: EntryType = formData.team_type;

  const major = parseInt(FEES[tier][feeKey][entryType].replace(/[^0-9]/g, ''), 10);
  return {
    amountMinor: major * 100,
    currency: isIndian ? 'INR' : 'USD',
    badge: tier,
    description: `${tier} - ${formData.team_type}`,
  };
}

export const architectureOfPlay: ProjectConfig = {
  eventId: ARCHITECTURE_OF_PLAY_EVENT_ID,
  title: 'The Architecture of Play',

  validateFormData(fd) {
    if (!fd.country || typeof fd.country !== 'string') return 'Country is required';
    if (fd.group !== 'A' && fd.group !== 'B') return 'Invalid group';
    if (fd.category !== '1' && fd.category !== '2') return 'Invalid category';
    if (fd.team_type !== 'solo' && fd.team_type !== 'group') return 'Invalid entry type';
    if (fd.country.toLowerCase() !== 'india' && fd.group !== 'A') {
      return 'International registrations must be Group A';
    }

    const members = fd.members;
    if (!Array.isArray(members)) return 'Members are required';
    if (fd.team_type === 'solo' && members.length !== 1) return 'Solo entry needs exactly 1 member';
    if (fd.team_type === 'group' && (members.length < 2 || members.length > 3)) {
      return 'Group entry needs 2–3 members';
    }

    const years = fd.category === '1' ? [1, 2] : [3, 4, 5];
    for (const m of members) {
      if (!m?.name || !m?.email || !m?.phone || !m?.institute || !m?.institute_id_url) {
        return 'Every member needs name, email, phone, institute and institute ID';
      }
      if (!years.includes(Number(m.academic_year))) {
        return `Academic year must be ${years.join(' or ')} for the selected category`;
      }
    }
    return null;
  },

  buildTeamId({ codeName, formData, sequence }) {
    const group = formData.group || 'A';
    const category = formData.category === '2' ? 'II' : 'I';
    const team = formData.team_type === 'group' ? 'GRP' : 'IND';
    return `${codeName}-${group}-${category}-${team}-${String(sequence).padStart(4, '0')}`;
  },

  getBaseFee(formData, _now) {
    return feeFor(formData, getCurrentTier());
  },

  getSummary(fd, fee) {
    return [
      { label: 'Registration Period', value: fee.badge ?? '' },
      { label: 'Entry Type', value: fd.team_type === 'solo' ? 'Solo (1 member)' : 'Group (up to 3 members)' },
      { label: 'Country', value: fd.country },
      { label: 'Award Category', value: fd.group === 'A' ? 'Group A — Monetary Award' : 'Group B — No Monetary Award' },
    ];
  },

  coupons: {
    // Forces Early Bird pricing for a short window.
    'MR-EARLY': async ({ formData, now }) => {
      const from = new Date('2026-09-15T00:00:00+05:30');
      const to = new Date('2026-09-17T23:59:59+05:30');
      if (now < from || now > to) return { ok: false, error: 'This coupon is not valid at this time.' };
      return {
        ok: true,
        fee: feeFor(formData, 'Early Bird Registration'),
        title: 'Code Applied!',
        message: 'Early Bird price applied',
      };
    },

    // 10% for new participants, 20% for returning ones. Early Bird + Group A only.
    MINDRAIN20: async ({ formData, userId, base, supabase }) => {
      if (formData.group !== 'A') {
        return { ok: false, error: 'This coupon is only valid for monetary award (Group A) registrations.' };
      }
      if (getCurrentTier() !== 'Early Bird Registration') {
        return { ok: false, error: 'This coupon is only valid during the Early Bird Registration period.' };
      }

      const [v1, v2] = await Promise.all([
        supabase.from('registrations').select('id').eq('registration_by', userId).eq('paid', true).limit(1).maybeSingle(),
        supabase.from('registrations_2').select('id').eq('registration_by', userId).eq('paid', true).limit(1).maybeSingle(),
      ]);
      const returning = !!(v1.data || v2.data);
      const pct = returning ? 20 : 10;

      return {
        ok: true,
        fee: { ...base, amountMinor: Math.round(base.amountMinor * (1 - pct / 100)) },
        discountPercent: pct,
        title: 'Code Applied!',
        message: `MINDRAIN20 verified! You get ${pct}% off${returning ? ' as a returning participant' : ' as a new participant'}.`,
      };
    },
  },
};

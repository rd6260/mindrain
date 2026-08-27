export interface BriefFile {
  name: string;
  description: string;
  url: string;
}

export interface CompetitionMeta {
  title: string;
  subtitle: string;
  category: string;
  edition: string;
  registrationUrl: string;
}

interface CompetitionData {
  meta: CompetitionMeta;
  briefFiles: BriefFile[];
}

// ─── Registry ─────────────────────────────────────────────────────────────────

const COMPETITIONS: Record<string, CompetitionData> = {
  // The Unreal House
  '3f123e78-60d6-494d-b307-18c5b4c8ab7f': {
    meta: {
      title: 'The Unreal House',
      subtitle: 'An Imaginary Home Design Challenge',
      category: 'Architecture Competition',
      edition: 'Edition 06',
      registrationUrl: 'https://www.mindrain.org/competition/the-unreal-house-2025-2026',
    },
    briefFiles: [
      {
        name: 'Important Dates & Calendar',
        description: 'Key deadlines and schedule',
        url: 'https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/the_unreal_house/Important%20Dates-Calender.pdf',
      },
      {
        name: 'Terms & Conditions',
        description: 'Important rules and regulations',
        url: 'https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/the_unreal_house/T&C%20(Important).pdf',
      },
      {
        name: 'Complete Brief',
        description: 'Full competition brief document',
        url: 'https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/the_unreal_house/The%20Unreal%20House%20(Complete%20Brief).pdf',
      },
      {
        name: 'Brief (Print Format)',
        description: 'Print-ready version of the brief',
        url: 'https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/the_unreal_house/The%20Unreal%20House%20(print%20format).pdf',
      },
    ],
  },

  // The Architecture of Play
  '1389f7d3-e98a-40dd-819a-5b756e3c2ada': {
    meta: {
      title: 'The Architecture of Play',
      subtitle: 'A Kindergarten Design Challenge',
      category: 'Architecture Competition',
      edition: 'Edition 07',
      registrationUrl: 'https://www.mindrain.org/competition/the-architecture-of-play',
    },
    briefFiles: [
      {
        name: 'Competition Calendar',
        description: 'Key deadlines and schedule',
        url: 'https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/architecture_of_play/Competition%20Calender.pdf',
      },
      {
        name: 'Terms & Conditions',
        description: 'Important rules and regulations',
        url: 'https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/architecture_of_play/T&C%20(Important).pdf',
      },
      {
        name: 'Complete Brief',
        description: 'Full competition brief document',
        url: 'https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/architecture_of_play/The%20Architecture%20of%20Play%20(Complete%20brief).pdf',
      },
      {
        name: 'Printable Brief',
        description: 'Print-ready version of the brief',
        url: 'https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/architecture_of_play/The%20Architecture%20of%20Play%20(Printable%20brief).pdf',
      },
    ],
  },

  // Mind Rain Thesis Award
  'c4a201ae-8bfe-48bc-a526-4ac1288dd937': {
    meta: {
      title: 'Mind Rain Thesis Award',
      subtitle: 'Undergraduate Architecture Thesis Recognition Program',
      category: 'Thesis Award',
      edition: 'Edition 02',
      registrationUrl: 'https://www.mindrain.org/competition/thesis-award-2026',
    },
    briefFiles: [
      {
        name: 'MR Thesis Award Detailed PDF',
        description: 'Full competition brief document',
        url: 'https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/thesis_award_26/MindRain%20Thesis%20Award%20(Detailed%20PDF).pdf',
      },
      {
        name: 'Important Dates & Calendar',
        description: 'Key deadlines and schedule',
        url: 'https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/thesis_award_26/Important%20Dates-Calender.pdf',
      },
      {
        name: 'Terms & Conditions',
        description: 'Important rules and regulations',
        url: 'https://pdtlcmfanqfascgivywf.supabase.co/storage/v1/object/public/competition_brief/thesis_award_26/T&C%20doc..pdf',
      },
    ],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getCompetitionBriefFiles(eventId: string): BriefFile[] {
  return COMPETITIONS[eventId]?.briefFiles ?? [];
}

export function getCompetitionMeta(eventId: string): CompetitionMeta | null {
  return COMPETITIONS[eventId]?.meta ?? null;
}

export function getCompetition(eventId: string): CompetitionData | null {
  return COMPETITIONS[eventId] ?? null;
}

// TypeScript types for Mind Rain website

export interface Winner {
  name: string;
  profilePicture?: string;
  description: string;
  projectImage: string;
  members?: WinnerMember[];
}

export interface WinnerMember {
  name: string;
  profilePicture?: string;
}

export interface Category {
  name: string;
  winners: {
    first?: Winner[];
    second?: Winner[];
    third?: Winner[];
  };
}

export interface Competition {
  name: string;
  year: string;
  categories: Category[];
  honorableMentions?: Winner[];
}

export interface PrizePool {
  total: string;
  category1: CategoryPrizes;
  category2: CategoryPrizes;
}

export interface CategoryPrizes {
  first: string;
  second: string;
  third: string;
}

export interface ImportantDate {
  label: string;
  date: string;
}

export interface RegistrationFee {
  earlyBird: RegistrationPricing;
  advance: RegistrationPricing;
  late: RegistrationPricing;
}

export interface RegistrationPricing {
  indian: {
    solo: string;
    group: string;
  };
  international: {
    solo: string;
    group: string;
  };
}

export interface RegistrationFormData {
  name: string;
  email: string;
  phone: string;
  institution: string;
  category: 'solo' | 'group';
  nationality: 'indian' | 'international';
}

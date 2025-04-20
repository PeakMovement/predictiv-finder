import { BudgetTier, PriceRange, ServiceCategory } from "./types";

export const BUDGET_TIERS: BudgetTier[] = [
  {
    name: 'low',
    range: { min: 0, max: 1000 },
    maxSessions: 2
  },
  {
    name: 'medium',
    range: { min: 1001, max: 2500 },
    maxSessions: 3
  },
  {
    name: 'high',
    range: { min: 2501, max: 10000 },
    maxSessions: 4
  }
];

export const PRICE_RANGES: Record<ServiceCategory, Record<BudgetTier['name'], PriceRange>> = {
  'dietician': {
    low: { affordable: 150, highEnd: 300 },
    medium: { affordable: 300, highEnd: 600 },
    high: { affordable: 600, highEnd: 1000 }
  },
  'personal-trainer': {
    low: { affordable: 100, highEnd: 250 },
    medium: { affordable: 250, highEnd: 500 },
    high: { affordable: 500, highEnd: 800 }
  },
  'physiotherapist': {
    low: { affordable: 200, highEnd: 400 },
    medium: { affordable: 400, highEnd: 700 },
    high: { affordable: 700, highEnd: 1200 }
  },
  'biokineticist': {
    low: { affordable: 180, highEnd: 350 },
    medium: { affordable: 350, highEnd: 600 },
    high: { affordable: 600, highEnd: 1000 }
  },
  'coaching': {
    low: { affordable: 80, highEnd: 200 },
    medium: { affordable: 200, highEnd: 400 },
    high: { affordable: 400, highEnd: 700 }
  },
  'family-medicine': {
    low: { affordable: 250, highEnd: 450 },
    medium: { affordable: 450, highEnd: 800 },
    high: { affordable: 800, highEnd: 1400 }
  },
  'internal-medicine': {
    low: { affordable: 300, highEnd: 500 },
    medium: { affordable: 500, highEnd: 900 },
    high: { affordable: 900, highEnd: 1500 }
  },
  'pediatrics': {
    low: { affordable: 200, highEnd: 400 },
    medium: { affordable: 400, highEnd: 700 },
    high: { affordable: 700, highEnd: 1200 }
  },
  'cardiology': {
    low: { affordable: 350, highEnd: 600 },
    medium: { affordable: 600, highEnd: 1000 },
    high: { affordable: 1000, highEnd: 1800 }
  },
  'dermatology': {
    low: { affordable: 200, highEnd: 400 },
    medium: { affordable: 400, highEnd: 700 },
    high: { affordable: 700, highEnd: 1200 }
  },
  'orthopedics': {
    low: { affordable: 350, highEnd: 600 },
    medium: { affordable: 600, highEnd: 1000 },
    high: { affordable: 1000, highEnd: 1800 }
  },
  'neurology': {
    low: { affordable: 350, highEnd: 600 },
    medium: { affordable: 600, highEnd: 1000 },
    high: { affordable: 1000, highEnd: 1800 }
  },
  'gastroenterology': {
    low: { affordable: 250, highEnd: 450 },
    medium: { affordable: 450, highEnd: 800 },
    high: { affordable: 800, highEnd: 1400 }
  },
  'obstetrics-gynecology': {
    low: { affordable: 200, highEnd: 400 },
    medium: { affordable: 400, highEnd: 700 },
    high: { affordable: 700, highEnd: 1200 }
  },
  'emergency-medicine': {
    low: { affordable: 350, highEnd: 600 },
    medium: { affordable: 600, highEnd: 1000 },
    high: { affordable: 1000, highEnd: 1800 }
  },
  'psychiatry': {
    low: { affordable: 350, highEnd: 600 },
    medium: { affordable: 600, highEnd: 1000 },
    high: { affordable: 1000, highEnd: 1800 }
  },
  'anesthesiology': {
    low: { affordable: 350, highEnd: 600 },
    medium: { affordable: 600, highEnd: 1000 },
    high: { affordable: 1000, highEnd: 1800 }
  },
  'endocrinology': {
    low: { affordable: 350, highEnd: 600 },
    medium: { affordable: 600, highEnd: 1000 },
    high: { affordable: 1000, highEnd: 1800 }
  },
  'urology': {
    low: { affordable: 350, highEnd: 600 },
    medium: { affordable: 600, highEnd: 1000 },
    high: { affordable: 1000, highEnd: 1800 }
  },
  'oncology': {
    low: { affordable: 400, highEnd: 700 },
    medium: { affordable: 700, highEnd: 1200 },
    high: { affordable: 1200, highEnd: 2000 }
  },
  'neurosurgery': {
    low: { affordable: 400, highEnd: 700 },
    medium: { affordable: 700, highEnd: 1200 },
    high: { affordable: 1200, highEnd: 2000 }
  },
  'infectious-disease': {
    low: { affordable: 350, highEnd: 600 },
    medium: { affordable: 600, highEnd: 1000 },
    high: { affordable: 1000, highEnd: 1800 }
  },
  'radiology': {
    low: { affordable: 350, highEnd: 600 },
    medium: { affordable: 600, highEnd: 1000 },
    high: { affordable: 1000, highEnd: 1800 }
  },
  'geriatric-medicine': {
    low: { affordable: 250, highEnd: 450 },
    medium: { affordable: 450, highEnd: 800 },
    high: { affordable: 800, highEnd: 1400 }
  },
  'plastic-surgery': {
    low: { affordable: 400, highEnd: 800 },
    medium: { affordable: 800, highEnd: 1500 },
    high: { affordable: 1500, highEnd: 3000 }
  },
  'rheumatology': {
    low: { affordable: 350, highEnd: 600 },
    medium: { affordable: 600, highEnd: 1000 },
    high: { affordable: 1000, highEnd: 1800 }
  },
  'pain-management': {
    low: { affordable: 350, highEnd: 600 },
    medium: { affordable: 600, highEnd: 1000 },
    high: { affordable: 1000, highEnd: 1800 }
  }
};

export const determineBudgetTier = (budget: number): BudgetTier => {
  return BUDGET_TIERS.find(
    tier => budget >= tier.range.min && budget <= tier.range.max
  ) || BUDGET_TIERS[0];
};

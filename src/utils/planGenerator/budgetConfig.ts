
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

// Fix PriceRange format from affordable/highEnd to min/max to match the defined interface
export const PRICE_RANGES: Record<ServiceCategory, Record<BudgetTier['name'], PriceRange>> = {
  'physiotherapist': {
    low: { min: 200, max: 400 },
    medium: { min: 400, max: 700 },
    high: { min: 700, max: 1200 }
  },
  'biokineticist': {
    low: { min: 180, max: 350 },
    medium: { min: 350, max: 600 },
    high: { min: 600, max: 1000 }
  },
  'dietician': {
    low: { min: 150, max: 300 },
    medium: { min: 300, max: 600 },
    high: { min: 600, max: 1000 }
  },
  'personal-trainer': {
    low: { min: 100, max: 250 },
    medium: { min: 250, max: 500 },
    high: { min: 500, max: 800 }
  },
  'coaching': {
    low: { min: 80, max: 200 },
    medium: { min: 200, max: 400 },
    high: { min: 400, max: 700 }
  },
  'family-medicine': {
    low: { min: 250, max: 450 },
    medium: { min: 450, max: 800 },
    high: { min: 800, max: 1400 }
  },
  'internal-medicine': {
    low: { min: 300, max: 500 },
    medium: { min: 500, max: 900 },
    high: { min: 900, max: 1500 }
  },
  'pediatrics': {
    low: { min: 200, max: 400 },
    medium: { min: 400, max: 700 },
    high: { min: 700, max: 1200 }
  },
  'cardiology': {
    low: { min: 350, max: 600 },
    medium: { min: 600, max: 1000 },
    high: { min: 1000, max: 1800 }
  },
  'dermatology': {
    low: { min: 200, max: 400 },
    medium: { min: 400, max: 700 },
    high: { min: 700, max: 1200 }
  },
  'orthopedics': {
    low: { min: 350, max: 600 },
    medium: { min: 600, max: 1000 },
    high: { min: 1000, max: 1800 }
  },
  'neurology': {
    low: { min: 350, max: 600 },
    medium: { min: 600, max: 1000 },
    high: { min: 1000, max: 1800 }
  },
  'gastroenterology': {
    low: { min: 250, max: 450 },
    medium: { min: 450, max: 800 },
    high: { min: 800, max: 1400 }
  },
  'obstetrics-gynecology': {
    low: { min: 200, max: 400 },
    medium: { min: 400, max: 700 },
    high: { min: 700, max: 1200 }
  },
  'emergency-medicine': {
    low: { min: 350, max: 600 },
    medium: { min: 600, max: 1000 },
    high: { min: 1000, max: 1800 }
  },
  'psychiatry': {
    low: { min: 350, max: 600 },
    medium: { min: 600, max: 1000 },
    high: { min: 1000, max: 1800 }
  },
  'anesthesiology': {
    low: { min: 350, max: 600 },
    medium: { min: 600, max: 1000 },
    high: { min: 1000, max: 1800 }
  },
  'endocrinology': {
    low: { min: 350, max: 600 },
    medium: { min: 600, max: 1000 },
    high: { min: 1000, max: 1800 }
  },
  'urology': {
    low: { min: 350, max: 600 },
    medium: { min: 600, max: 1000 },
    high: { min: 1000, max: 1800 }
  },
  'oncology': {
    low: { min: 400, max: 700 },
    medium: { min: 700, max: 1200 },
    high: { min: 1200, max: 2000 }
  },
  'neurosurgery': {
    low: { min: 400, max: 700 },
    medium: { min: 700, max: 1200 },
    high: { min: 1200, max: 2000 }
  },
  'infectious-disease': {
    low: { min: 350, max: 600 },
    medium: { min: 600, max: 1000 },
    high: { min: 1000, max: 1800 }
  },
  'radiology': {
    low: { min: 350, max: 600 },
    medium: { min: 600, max: 1000 },
    high: { min: 1000, max: 1800 }
  },
  'geriatric-medicine': {
    low: { min: 250, max: 450 },
    medium: { min: 450, max: 800 },
    high: { min: 800, max: 1400 }
  },
  'plastic-surgery': {
    low: { min: 400, max: 800 },
    medium: { min: 800, max: 1500 },
    high: { min: 1500, max: 3000 }
  },
  'rheumatology': {
    low: { min: 350, max: 600 },
    medium: { min: 600, max: 1000 },
    high: { min: 1000, max: 1800 }
  },
  'pain-management': {
    low: { min: 350, max: 600 },
    medium: { min: 600, max: 1000 },
    high: { min: 1000, max: 1800 }
  },
  'psychology': {
    low: { min: 350, max: 600 },
    medium: { min: 600, max: 1000 },
    high: { min: 1000, max: 1800 }
  },
  'podiatrist': {
    low: { min: 200, max: 400 },
    medium: { min: 400, max: 700 },
    high: { min: 700, max: 1200 }
  },
  'general-practitioner': {
    low: { min: 250, max: 450 },
    medium: { min: 450, max: 800 },
    high: { min: 800, max: 1400 }
  },
  'sport-physician': {
    low: { min: 350, max: 600 },
    medium: { min: 600, max: 1000 },
    high: { min: 1000, max: 1800 }
  },
  'orthopedic-surgeon': {
    low: { min: 400, max: 800 },
    medium: { min: 800, max: 1400 },
    high: { min: 1400, max: 2200 }
  },
  'massage-therapy': {
    low: { min: 150, max: 300 },
    medium: { min: 300, max: 500 },
    high: { min: 500, max: 800 }
  },
  'nutrition-coach': {
    low: { min: 100, max: 250 },
    medium: { min: 250, max: 450 },
    high: { min: 450, max: 700 }
  },
  'occupational-therapy': {
    low: { min: 200, max: 400 },
    medium: { min: 400, max: 650 },
    high: { min: 650, max: 1000 }
  },
  'physical-therapy': {
    low: { min: 200, max: 400 },
    medium: { min: 400, max: 700 },
    high: { min: 700, max: 1200 }
  },
  'chiropractor': {
    low: { min: 150, max: 350 },
    medium: { min: 350, max: 600 },
    high: { min: 600, max: 1000 }
  },
  'nurse-practitioner': {
    low: { min: 150, max: 300 },
    medium: { min: 300, max: 500 },
    high: { min: 500, max: 800 }
  },
  'sports-medicine': {
    low: { min: 300, max: 500 },
    medium: { min: 500, max: 800 },
    high: { min: 800, max: 1400 }
  },
  'geriatrics': {
    low: { min: 250, max: 450 },
    medium: { min: 450, max: 800 },
    high: { min: 800, max: 1400 }
  },
  'all': {
    low: { min: 200, max: 400 },
    medium: { min: 400, max: 700 },
    high: { min: 700, max: 1200 }
  }
};

export const determineBudgetTier = (budget: number): BudgetTier => {
  return BUDGET_TIERS.find(
    tier => budget >= tier.range.min && budget <= tier.range.max
  ) || BUDGET_TIERS[0];
};

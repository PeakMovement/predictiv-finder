
export type ServiceCategory = 
  | 'dietician'
  | 'personal-trainer'
  | 'biokineticist'
  | 'physiotherapist'
  | 'coaching';

export type ServiceMode = 'online' | 'in-person' | 'both';

export type GoalType = string;

export interface Practitioner {
  id: string;
  name: string;
  serviceType: ServiceCategory;
  pricePerSession: number;
  serviceTags: string[];
  location: string;
  isOnline: boolean;
  availability: string;
  imageUrl: string;
  bio: string;
  rating: number;
}

export interface AIHealthPlan {
  id: string;
  name: string;
  description: string;
  services: {
    type: ServiceCategory;
    price: number;
    sessions: number;
    description: string;
  }[];
  totalCost: number;
  planType: 'best-fit' | 'high-impact' | 'progressive';
  timeFrame: string;
}

export interface UserCriteria {
  category?: ServiceCategory;
  goal?: string;
  budget?: number;
  location?: string;
  mode?: ServiceMode[];
  description?: string;
}

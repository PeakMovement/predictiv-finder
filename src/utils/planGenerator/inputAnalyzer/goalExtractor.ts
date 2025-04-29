
import { ServiceCategory } from "../types";

// Map goals to service categories
export const GOAL_TO_SERVICES: Record<string, ServiceCategory[]> = {
  'weight loss': ['personal-trainer', 'dietician', 'coaching'],
  'fitness goals': ['personal-trainer', 'coaching', 'dietician'],
  'strength': ['personal-trainer', 'physiotherapist'],
  'muscle': ['personal-trainer', 'dietician'],
  'nutrition': ['dietician', 'personal-trainer', 'coaching'],
  'recovery': ['physiotherapist', 'personal-trainer'],
  'pain management': ['physiotherapist', 'family-medicine', 'pain-management'],
  'fitness': ['personal-trainer', 'coaching', 'dietician'],
  'health': ['family-medicine', 'dietician', 'personal-trainer'],
  'cardio': ['personal-trainer', 'coaching'],
  'energy': ['dietician', 'personal-trainer', 'endocrinology'],
  'stress': ['coaching', 'physiotherapist', 'psychiatry'],
  'performance': ['personal-trainer', 'coaching', 'physiotherapist'],
  'rehabilitation': ['physiotherapist', 'personal-trainer'],
  'endurance': ['personal-trainer', 'coaching'],
  'stomach pain': ['gastroenterology', 'family-medicine'],
  'stomach issues': ['gastroenterology', 'family-medicine'],
  'digestive problems': ['gastroenterology', 'family-medicine'],
  'anxiety': ['psychiatry', 'coaching'],
  'depression': ['psychiatry', 'coaching'],
  'mental health': ['psychiatry', 'coaching'],
  'sleep issues': ['psychiatry', 'family-medicine'],
  'headaches': ['neurology', 'family-medicine'],
  'joint pain': ['physiotherapist', 'orthopedics', 'rheumatology'],
  'skin issues': ['dermatology', 'family-medicine']
};

export const mapGoalsToCategories = (inputLower: string, serviceCategories: Set<ServiceCategory>): void => {
  Object.entries(GOAL_TO_SERVICES).forEach(([goal, categories]) => {
    if (inputLower.includes(goal.toLowerCase())) {
      categories.forEach(category => {
        serviceCategories.add(category);
        console.log("Adding service from goal match:", category, "from goal:", goal);
      });
    }
  });
};

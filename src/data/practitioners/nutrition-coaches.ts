
import { Practitioner } from '@/types';

export const NUTRITION_COACHES: Practitioner[] = [
  {
    id: "nc1",
    name: "Thabo Mthembu",
    serviceType: "dietician",
    pricePerSession: 300,
    maxPrice: 900,
    serviceTags: ["meal planning", "online consultations", "group workshops"],
    location: "Kenilworth, Cape Town",
    isOnline: true,
    availability: "Mon-Fri, flexible hours",
    imageUrl: "/placeholder.svg",
    bio: "Online nutrition specialist offering meal plans and group workshops. Makes healthy eating accessible and practical.",
    rating: 4.8,
    specialtyNotes: "Online meal plans, group workshops"
  },
  {
    id: "nc2",
    name: "Lisa van der Merwe",
    serviceType: "dietician",
    pricePerSession: 350,
    maxPrice: 1000,
    serviceTags: ["weight loss", "plant-based", "nutrition planning"],
    location: "Sea Point, Cape Town",
    isOnline: true,
    availability: "By appointment",
    imageUrl: "/placeholder.svg",
    bio: "Specializes in weight loss and plant-based diets. Creates sustainable and enjoyable nutrition plans.",
    rating: 4.9,
    specialtyNotes: "Weight loss, plant-based diets"
  },
  {
    id: "nc3",
    name: "Zanele Ndlovu",
    serviceType: "dietician",
    pricePerSession: 300,
    maxPrice: 900,
    serviceTags: ["family nutrition", "budget-friendly", "meal planning"],
    location: "Claremont, Cape Town",
    isOnline: true,
    availability: "Weekdays and Saturday mornings",
    imageUrl: "/placeholder.svg",
    bio: "Family nutrition specialist focusing on budget-friendly meal plans. Makes healthy eating accessible for families.",
    rating: 4.7,
    specialtyNotes: "Family nutrition, budget-friendly plans"
  }
];

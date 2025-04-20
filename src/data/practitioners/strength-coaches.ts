
import { Practitioner } from '@/types';

export const STRENGTH_COACHES: Practitioner[] = [
  {
    id: "sc1",
    name: "Sipho Ngcobo",
    serviceType: "personal-trainer",
    pricePerSession: 300,
    maxPrice: 900,
    serviceTags: ["functional training", "group classes", "strength building"],
    location: "Wynberg, Cape Town",
    isOnline: false,
    availability: "Mon-Fri, flexible hours",
    imageUrl: "/placeholder.svg",
    bio: "Functional training specialist focusing on group gym classes. Experienced in developing comprehensive strength programs.",
    rating: 4.8,
    specialtyNotes: "Group gym classes, functional training"
  },
  {
    id: "sc2",
    name: "Anke du Plessis",
    serviceType: "personal-trainer",
    pricePerSession: 350,
    maxPrice: 1000,
    serviceTags: ["powerlifting", "personalized plans", "strength training"],
    location: "Vredehoek, Cape Town",
    isOnline: true,
    availability: "Early mornings and evenings",
    imageUrl: "/placeholder.svg",
    bio: "Powerlifting specialist offering personalized gym plans. Focuses on proper form and progressive overload.",
    rating: 4.9,
    specialtyNotes: "Powerlifting, personalized gym plans"
  },
  {
    id: "sc3",
    name: "Zanele Khumalo",
    serviceType: "personal-trainer",
    pricePerSession: 300,
    maxPrice: 800,
    serviceTags: ["women's strength", "bodyweight training", "functional fitness"],
    location: "Mowbray, Cape Town",
    isOnline: true,
    availability: "Flexible hours",
    imageUrl: "/placeholder.svg",
    bio: "Specializes in women's strength training with a focus on bodyweight exercises. Creates inclusive and supportive training environments.",
    rating: 4.7,
    specialtyNotes: "Women's strength training, bodyweight focus"
  }
];

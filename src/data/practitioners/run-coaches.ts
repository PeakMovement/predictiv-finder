
import { Practitioner } from '@/types';

export const RUN_COACHES: Practitioner[] = [
  {
    id: "rc1",
    name: "Thabo Mthembu",
    serviceType: "coaching",
    pricePerSession: 250,
    maxPrice: 800,
    serviceTags: ["running", "track sessions", "group training", "personalized plans"],
    location: "Rondebosch, Cape Town",
    isOnline: false,
    availability: "Mon-Sat, flexible hours",
    imageUrl: "/placeholder.svg",
    bio: "Group track sessions specialist offering personalized running plans. Experienced in training runners of all levels.",
    rating: 4.8,
    specialtyNotes: "Group track sessions; high-end for personalized plans"
  },
  {
    id: "rc2",
    name: "Lisa van der Merwe",
    serviceType: "coaching",
    pricePerSession: 300,
    maxPrice: 900,
    serviceTags: ["coastal trail running", "marathon preparation", "endurance training"],
    location: "Sea Point, Cape Town",
    isOnline: true,
    availability: "Early mornings and evenings",
    imageUrl: "/placeholder.svg",
    bio: "Specialized in coastal trail running and marathon preparation. Combines scenic routes with effective training.",
    rating: 4.9,
    specialtyNotes: "Coastal trail running, marathon prep"
  },
  {
    id: "rc3",
    name: "Zanele Ndlovu",
    serviceType: "coaching",
    pricePerSession: 250,
    maxPrice: 700,
    serviceTags: ["beginner-friendly", "park running", "basic training"],
    location: "Claremont, Cape Town",
    isOnline: true,
    availability: "Weekday mornings",
    imageUrl: "/placeholder.svg",
    bio: "Beginner-friendly coach specializing in park-based sessions. Makes running accessible and enjoyable for newcomers.",
    rating: 4.7,
    specialtyNotes: "Beginner-friendly, park-based sessions"
  }
];

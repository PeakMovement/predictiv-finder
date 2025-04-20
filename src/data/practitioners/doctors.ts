
import { Practitioner } from '@/types';

export const DOCTORS: Practitioner[] = [
  {
    id: "doc_1",
    name: "Dr. Naledi Mokoena",
    serviceType: "family-medicine",
    pricePerSession: 400,
    maxPrice: 1800,
    serviceTags: ["Family Medicine", "Primary Care", "General Practice"],
    location: "Rondebosch, Cape Town",
    isOnline: true,
    availability: "Monday to Friday, 8:00 - 17:00",
    imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop",
    bio: "General practitioner specializing in primary care for all ages. Experienced in family medicine with a holistic approach to healthcare.",
    rating: 4.9,
    specialtyNotes: "General practitioner, primary care for all ages."
  },
  {
    id: "doc_2",
    name: "Dr. Johan Pretorius",
    serviceType: "internal-medicine",
    pricePerSession: 500,
    maxPrice: 2000,
    serviceTags: ["Internal Medicine", "Chronic Disease Management", "Adult Care"],
    location: "Claremont, Cape Town",
    isOnline: true,
    availability: "Monday to Thursday, 9:00 - 18:00",
    imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop",
    bio: "Internal medicine specialist focusing on adult chronic diseases. Provides comprehensive care for complex medical conditions.",
    rating: 4.8,
    specialtyNotes: "Focuses on adult chronic diseases."
  },
  {
    id: "doc_3",
    name: "Dr. Thandiwe Ndlovu",
    serviceType: "pediatrics",
    pricePerSession: 350,
    maxPrice: 1500,
    serviceTags: ["Pediatrics", "Child Health", "Vaccinations", "Adolescent Care"],
    location: "Wynberg, Cape Town",
    isOnline: true,
    availability: "Monday to Friday, 8:00 - 16:00",
    imageUrl: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop",
    bio: "Dedicated pediatrician specializing in child and adolescent health. Expert in preventive care and childhood development.",
    rating: 4.9,
    specialtyNotes: "Child and adolescent health, vaccinations."
  },
  // Adding 3 more diverse examples - we can add more in chunks if needed
  {
    id: "doc_11",
    name: "Dr. Claire Newman",
    serviceType: "psychiatry",
    pricePerSession: 800,
    maxPrice: 3500,
    serviceTags: ["Psychiatry", "Mental Health", "Therapy", "Counseling"],
    location: "Green Point, Cape Town",
    isOnline: true,
    availability: "Monday to Friday, 9:00 - 17:00",
    imageUrl: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=400&h=400&fit=crop",
    bio: "Experienced psychiatrist offering comprehensive mental health care and therapy services. Specializing in anxiety, depression, and stress management.",
    rating: 4.8,
    specialtyNotes: "Mental health; high-end for extended therapy."
  },
  {
    id: "doc_17",
    name: "Dr. Grace Mwangi",
    serviceType: "infectious-disease",
    pricePerSession: 600,
    maxPrice: 2500,
    serviceTags: ["Infectious Disease", "HIV", "TB", "Tropical Diseases"],
    location: "Fish Hoek, Cape Town",
    isOnline: true,
    availability: "Tuesday to Saturday, 8:00 - 16:00",
    imageUrl: "https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?w=400&h=400&fit=crop",
    bio: "Specialist in infectious diseases with extensive experience in HIV, TB, and tropical diseases. Committed to providing comprehensive care and prevention strategies.",
    rating: 4.7,
    specialtyNotes: "HIV, TB, and tropical diseases."
  },
  {
    id: "doc_20",
    name: "Dr. Gregory Adams",
    serviceType: "plastic-surgery",
    pricePerSession: 1000,
    maxPrice: 5000,
    serviceTags: ["Plastic Surgery", "Reconstructive Surgery", "Cosmetic Procedures"],
    location: "Camps Bay, Cape Town",
    isOnline: false,
    availability: "Monday to Friday, 9:00 - 17:00",
    imageUrl: "https://images.unsplash.com/photo-1605289982774-9a6fef564df8?w=400&h=400&fit=crop",
    bio: "Board-certified plastic surgeon specializing in both reconstructive and cosmetic procedures. Committed to achieving natural-looking results.",
    rating: 4.9,
    specialtyNotes: "Reconstructive and cosmetic procedures."
  }
];

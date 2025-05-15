
import { Practitioner, ServiceCategory } from '@/types';

/**
 * Expanded practitioners dataset based on user-provided information
 * This includes practitioners with more detailed information
 */
export const EXPANDED_PRACTITIONERS: Practitioner[] = [
  // General Practitioners (family-medicine)
  {
    id: "gp_zanele_naidoo",
    name: "Dr. Zanele Naidoo",
    serviceType: "family-medicine",
    pricePerSession: 803,
    serviceTags: ["General Practice", "Preventative Care", "Family Medicine"],
    location: "Cape Town",
    isOnline: true,
    availability: "Monday to Friday, 8:00 - 16:00",
    imageUrl: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop",
    bio: "Dr. Zanele Naidoo has 2 years of experience in general practitioner services with a focus on personalized client care. She holds an MBChB from UCT and specializes in preventative healthcare.",
    rating: 4.7,
    specialtyNotes: "Special interest in women's health and preventative medicine."
  },
  {
    id: "gp_michael_nienaber",
    name: "Dr. Michael Nienaber",
    serviceType: "family-medicine",
    pricePerSession: 1074,
    serviceTags: ["General Practice", "Sports Medicine", "Men's Health"],
    location: "Johannesburg",
    isOnline: false,
    availability: "Monday to Thursday, 9:00 - 17:00",
    imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop",
    bio: "Dr. Michael Nienaber brings 4 years of specialized general practice experience with an MD in General Medicine. He has a particular interest in sports medicine and men's health issues.",
    rating: 4.8,
    specialtyNotes: "Specializes in sports-related injuries and men's health."
  },
  {
    id: "gp_david_merwe",
    name: "Dr. David van der Merwe",
    serviceType: "family-medicine",
    pricePerSession: 727,
    serviceTags: ["Family Medicine", "Geriatrics", "Chronic Disease Management"],
    location: "Pretoria",
    isOnline: true,
    availability: "Tuesday to Saturday, 7:30 - 16:30",
    imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop",
    bio: "With 31 years of medical practice, Dr. van der Merwe is one of the most experienced GPs in our network. He specializes in geriatric care and management of chronic conditions.",
    rating: 4.9,
    specialtyNotes: "Expert in geriatric care and chronic disease management."
  },
  {
    id: "gp_brandon_daniels",
    name: "Dr. Brandon Daniels",
    serviceType: "family-medicine",
    pricePerSession: 649,
    serviceTags: ["Primary Care", "Pediatrics", "Family Medicine"],
    location: "Durban",
    isOnline: true,
    availability: "Monday to Friday, 8:00 - 17:00",
    imageUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop",
    bio: "Dr. Brandon Daniels has 12 years of experience as a general practitioner with an MBBS degree. He is particularly skilled in pediatric care and family medicine.",
    rating: 4.6,
    specialtyNotes: "Family-focused practice with special interest in pediatrics."
  },
  {
    id: "gp_zinhle_baloyi",
    name: "Dr. Zinhle Baloyi",
    serviceType: "family-medicine",
    pricePerSession: 588,
    serviceTags: ["General Medicine", "Women's Health", "Mental Health"],
    location: "Cape Town",
    isOnline: true,
    availability: "Wednesday to Sunday, 9:00 - 18:00",
    imageUrl: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop",
    bio: "Dr. Zinhle Baloyi has 9 years of experience in general practice with a compassionate approach to healthcare. She holds an MD in General Medicine and focuses on holistic patient care.",
    rating: 4.7,
    specialtyNotes: "Holistic approach combining physical and mental health care."
  },
  
  // Only adding a sample of each category type for brevity - we can add more in batches as needed
  
  // Physiotherapists
  {
    id: "physio_david_botha",
    name: "David Botha",
    serviceType: "physiotherapist",
    pricePerSession: 513,
    serviceTags: ["Sports Rehabilitation", "Manual Therapy", "Post-Surgery Recovery"],
    location: "Cape Town",
    isOnline: false,
    availability: "Monday to Friday, 7:00 - 18:00",
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=400&fit=crop",
    bio: "David Botha is a physiotherapist with 8 years of experience and an MSc in Physiotherapy. He specializes in sports rehabilitation and post-operative recovery programs.",
    rating: 4.8,
    specialtyNotes: "Expert in sports injuries and post-surgical rehabilitation."
  },
  {
    id: "physio_lindiwe_daniels",
    name: "Lindiwe Daniels",
    serviceType: "physiotherapist",
    pricePerSession: 880,
    serviceTags: ["Neurological Rehabilitation", "Pediatric Physiotherapy", "Geriatric Care"],
    location: "Johannesburg",
    isOnline: true,
    availability: "Tuesday to Saturday, 8:00 - 17:00",
    imageUrl: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=400&h=400&fit=crop",
    bio: "Lindiwe Daniels brings 7 years of specialized experience in neurological rehabilitation with a BSc in Physiotherapy. She works with patients across all age groups.",
    rating: 4.9,
    specialtyNotes: "Specializes in neurological conditions and pediatric care."
  },
  
  // Biokineticists
  {
    id: "biokin_sarah_mthembu",
    name: "Sarah Mthembu",
    serviceType: "biokineticist",
    pricePerSession: 502,
    serviceTags: ["Exercise Therapy", "Orthopedic Rehabilitation", "Chronic Disease Management"],
    location: "Durban",
    isOnline: true,
    availability: "Monday to Friday, 6:00 - 19:00",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
    bio: "With 21 years in the field and a BA in Human Movement Science, Sarah Mthembu is an expert biokineticist specializing in orthopedic rehabilitation and exercise therapy.",
    rating: 4.8,
    specialtyNotes: "Specialized in orthopedic rehabilitation and chronic condition management."
  },
  {
    id: "biokin_ayanda_naidoo",
    name: "Ayanda Naidoo",
    serviceType: "biokineticist",
    pricePerSession: 736,
    serviceTags: ["Sports Performance", "Injury Prevention", "Biomechanical Analysis"],
    location: "Cape Town",
    isOnline: false,
    availability: "Monday, Wednesday, Friday, 7:00 - 18:00",
    imageUrl: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=400&h=400&fit=crop",
    bio: "Ayanda Naidoo has 24 years of experience as a biokineticist with a BSc in Biokinetics. She specializes in sports performance enhancement and biomechanical analysis.",
    rating: 4.9,
    specialtyNotes: "Expert in sports performance optimization and biomechanics."
  },
  
  // Dieticians
  {
    id: "diet_thabo_nienaber",
    name: "Thabo Nienaber",
    serviceType: "dietician",
    pricePerSession: 738,
    serviceTags: ["Clinical Nutrition", "Weight Management", "Diabetes Care"],
    location: "Pretoria",
    isOnline: true,
    availability: "Monday to Thursday, 8:00 - 17:00",
    imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop",
    bio: "Thabo Nienaber is a dietician with 29 years of experience and a BSc in Dietetics. He specializes in clinical nutrition with a focus on diabetes management and weight control.",
    rating: 4.7,
    specialtyNotes: "Specializes in diabetes management and sustainable weight loss approaches."
  },
  {
    id: "diet_nomvula_naidoo",
    name: "Nomvula Naidoo",
    serviceType: "dietician",
    pricePerSession: 895,
    serviceTags: ["Sports Nutrition", "Performance Diets", "Meal Planning"],
    location: "Johannesburg",
    isOnline: true,
    availability: "Tuesday to Saturday, 9:00 - 18:00",
    imageUrl: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop",
    bio: "Nomvula Naidoo brings 23 years of experience in dietetics with an MSc in Dietetics. She specializes in sports nutrition and performance diet planning for athletes.",
    rating: 4.8,
    specialtyNotes: "Expert in sports nutrition and performance optimization through diet."
  },
  
  // Strength Coaches
  {
    id: "str_thandiwe_sibanda",
    name: "Thandiwe Sibanda",
    serviceType: "strength-coaches",
    pricePerSession: 421,
    serviceTags: ["Strength Training", "Powerlifting", "Functional Fitness"],
    location: "Cape Town",
    isOnline: false,
    availability: "Monday to Friday, 5:00 - 20:00",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
    bio: "Thandiwe Sibanda has 18 years of experience as a strength coach with a BSc in Exercise Science. She specializes in powerlifting and functional strength development.",
    rating: 4.6,
    specialtyNotes: "Specializes in powerlifting and competition preparation."
  },
  {
    id: "str_michael_mthembu",
    name: "Michael Mthembu",
    serviceType: "strength-coaches",
    pricePerSession: 547,
    serviceTags: ["Athletic Performance", "Olympic Lifting", "Sport-Specific Training"],
    location: "Johannesburg",
    isOnline: true,
    availability: "Tuesday to Sunday, 6:00 - 19:00",
    imageUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=400&fit=crop",
    bio: "Michael Mthembu is an NCSF Certified strength coach with 31 years of experience. He specializes in Olympic lifting techniques and sport-specific strength development.",
    rating: 4.9,
    specialtyNotes: "Olympic lifting specialist with experience training professional athletes."
  },
  
  // Run Coaches
  {
    id: "run_brandon_smith",
    name: "Brandon Smith",
    serviceType: "run-coaches",
    pricePerSession: 554,
    serviceTags: ["Marathon Training", "Running Form", "Endurance Development"],
    location: "Cape Town",
    isOnline: true,
    availability: "Monday, Wednesday, Friday, 5:00 - 19:00",
    imageUrl: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=400&h=400&fit=crop",
    bio: "Brandon Smith is a Certified Endurance Coach with 12 years of experience. He specializes in marathon training and improving running efficiency through form analysis.",
    rating: 4.7,
    specialtyNotes: "Marathon specialist with focus on injury prevention through proper form."
  },
  {
    id: "run_paddy_mthembu",
    name: "Paddy Mthembu",
    serviceType: "run-coaches",
    pricePerSession: 797,
    serviceTags: ["Sprint Training", "Track Events", "Youth Development"],
    location: "Johannesburg",
    isOnline: false,
    availability: "Tuesday to Saturday, 6:00 - 18:00",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
    bio: "Paddy Mthembu is a Certified Endurance Coach with 8 years of experience. He specializes in sprint training and track events, with a focus on youth athlete development.",
    rating: 4.8,
    specialtyNotes: "Track specialist who has coached several provincial champions."
  },
  
  // Nutrition Coaches
  {
    id: "nutr_marius_ngcobo",
    name: "Marius Ngcobo",
    serviceType: "nutrition-coaches",
    pricePerSession: 547,
    serviceTags: ["Weight Loss", "Meal Planning", "Nutritional Education"],
    location: "Cape Town",
    isOnline: true,
    availability: "Monday to Friday, 7:00 - 19:00",
    imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop",
    bio: "Marius Ngcobo brings 34 years of experience as a nutrition coach with a BSc in Nutrition. He specializes in sustainable weight loss approaches and nutritional education.",
    rating: 4.8,
    specialtyNotes: "Expert in creating sustainable nutrition plans for long-term health."
  },
  {
    id: "nutr_ayanda_botha",
    name: "Ayanda Botha",
    serviceType: "nutrition-coaches",
    pricePerSession: 321,
    serviceTags: ["Sports Nutrition", "Plant-Based Diets", "Performance Optimization"],
    location: "Pretoria",
    isOnline: true,
    availability: "Tuesday to Saturday, 8:00 - 17:00",
    imageUrl: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=400&h=400&fit=crop",
    bio: "Ayanda Botha is a Precision Nutrition L1 certified coach with 15 years of experience. She specializes in plant-based nutrition for athletes and performance optimization.",
    rating: 4.7,
    specialtyNotes: "Plant-based nutrition specialist for athletes and active individuals."
  }
];

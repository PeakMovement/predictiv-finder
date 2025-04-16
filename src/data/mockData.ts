import { Practitioner, AIHealthPlan } from '../types';

export const GOALS_BY_CATEGORY = {
  'dietician': [
    'Weight loss',
    'Muscle gain',
    'Performance nutrition',
    'Managing medical conditions',
    'Healthy eating habits',
    'Specialized diets'
  ],
  'personal-trainer': [
    'Weight loss',
    'Muscle building',
    'Cardiovascular health',
    'Sport-specific training',
    'Overall fitness',
    'Strength and conditioning'
  ],
  'biokineticist': [
    'Injury rehabilitation',
    'Chronic disease management',
    'Posture correction',
    'Sports performance',
    'Fall prevention',
    'Functional movement'
  ],
  'physiotherapist': [
    'Pain management',
    'Post-surgery recovery',
    'Sports injury rehabilitation',
    'Joint mobility',
    'Chronic condition management',
    'Neurological rehabilitation'
  ],
  'coaching': [
    'Running improvement',
    'Diet adherence',
    'Strength progression',
    'Performance enhancement',
    'Form correction',
    'Competition preparation'
  ],
};

export const PRACTITIONERS: Practitioner[] = [
  // Run & Strength Coaches
  {
    id: "1",
    name: "Jack Mofokeng",
    serviceType: "coaching",
    pricePerSession: 650,
    serviceTags: ["track intervals", "long-distance progression", "strength circuits"],
    location: "Cape Town",
    isOnline: true,
    availability: "Mon-Fri, 9am-5pm",
    imageUrl: "/placeholder.svg",
    bio: "ASA Level 2 Running Coach with 10+ years experience. Run with purpose, recover with intent, and grow with discipline.",
    rating: 4.8
  },
  {
    id: "2",
    name: "Jenna Rose",
    serviceType: "coaching",
    pricePerSession: 280,
    serviceTags: ["strength for runners", "bodyweight conditioning", "beginner-friendly"],
    location: "Online Only",
    isOnline: true,
    availability: "Mon-Sat, flexible hours",
    imageUrl: "/placeholder.svg",
    bio: "Trifocus Certified Personal Trainer helping beginners fall in love with running, safely and sustainably.",
    rating: 4.6
  },
  {
    id: "3",
    name: "Neo Baloyi",
    serviceType: "coaching",
    pricePerSession: 500,
    serviceTags: ["sprint mechanics", "explosive power", "speed training"],
    location: "Johannesburg",
    isOnline: true,
    availability: "Tue-Sat, 7am-7pm",
    imageUrl: "/placeholder.svg",
    bio: "ASCA Certified coach and former sprinter specializing in sprint mechanics and explosive power development.",
    rating: 4.7
  },
  {
    id: "4",
    name: "Alex de Wet",
    serviceType: "coaching",
    pricePerSession: 750,
    serviceTags: ["triathlon training", "VO2 work", "endurance"],
    location: "Cape Town",
    isOnline: true,
    availability: "Mon-Fri, 6am-6pm",
    imageUrl: "/placeholder.svg",
    bio: "Ironman Certified Coach with 8 years experience specializing in triathlon-specific strength and VO2 training.",
    rating: 4.9
  },
  {
    id: "5",
    name: "Thando Mpumi",
    serviceType: "coaching",
    pricePerSession: 350,
    serviceTags: ["trail running", "hill strength", "outdoor training"],
    location: "Durban",
    isOnline: true,
    availability: "Weekdays and weekends",
    imageUrl: "/placeholder.svg",
    bio: "ISSA Certified Personal Trainer and trail runner focused on trail preparation and hill strength training.",
    rating: 4.5
  },
  {
    id: "6",
    name: "Melissa James",
    serviceType: "coaching",
    pricePerSession: 400,
    serviceTags: ["strength for runners", "hypertrophy", "sport science"],
    location: "Port Elizabeth",
    isOnline: true,
    availability: "Mon-Fri, 8am-6pm",
    imageUrl: "/placeholder.svg",
    bio: "BSc Sport Science and NSCA Certified coach specializing in strength development for runners and hypertrophy base training.",
    rating: 4.8
  },
  {
    id: "7",
    name: "Kuhle Ntuli",
    serviceType: "coaching",
    pricePerSession: 250,
    serviceTags: ["group training", "beginner-friendly", "bootcamp"],
    location: "Online Only",
    isOnline: true,
    availability: "Mon-Sat, various times",
    imageUrl: "/placeholder.svg",
    bio: "Athletics SA certified coach offering group strength training and beginner-friendly programs.",
    rating: 4.4
  },
  {
    id: "8",
    name: "Daniel Fourie",
    serviceType: "coaching",
    pricePerSession: 600,
    serviceTags: ["rehab-to-run", "injury prevention", "biomechanics"],
    location: "Cape Town",
    isOnline: false,
    availability: "Tue-Sat, 8am-5pm",
    imageUrl: "/placeholder.svg",
    bio: "Experienced coach with biokinetics background specializing in rehabilitation-to-run programs.",
    rating: 4.7
  },
  
  // Dietitians/Nutritionists
  {
    id: "9",
    name: "Dr. Tariq Gabru",
    serviceType: "dietician",
    pricePerSession: 900,
    serviceTags: ["chronic disease management", "sports performance", "weight loss"],
    location: "Cape Town",
    isOnline: true,
    availability: "Mon-Fri, by appointment",
    imageUrl: "/placeholder.svg",
    bio: "PhD in Clinical Nutrition with 12 years experience providing evidence-backed plans with practical, cultural, and lifestyle alignment.",
    rating: 4.9
  },
  {
    id: "10",
    name: "Candice Moyo",
    serviceType: "dietician",
    pricePerSession: 300,
    serviceTags: ["fatigue", "energy management", "body image", "weight loss"],
    location: "Online Only",
    isOnline: true,
    availability: "Flexible hours",
    imageUrl: "/placeholder.svg",
    bio: "BSc Dietetics and Mindful Eating Practitioner focusing on fatigue, energy dips, and body image recovery.",
    rating: 4.5
  },
  {
    id: "11",
    name: "Sibusiso Khumalo",
    serviceType: "dietician",
    pricePerSession: 250,
    serviceTags: ["weight management", "affordable meal plans", "basic nutrition"],
    location: "Johannesburg",
    isOnline: true,
    availability: "Mon-Thu, 9am-5pm",
    imageUrl: "/placeholder.svg",
    bio: "HPCSA Registered Dietitian with 4 years experience specializing in weight management and affordable meal plans.",
    rating: 4.6
  },
  {
    id: "12",
    name: "Amanda Lategan",
    serviceType: "dietician",
    pricePerSession: 850,
    serviceTags: ["elite athlete nutrition", "competition prep", "performance"],
    location: "Pretoria",
    isOnline: true,
    availability: "By appointment only",
    imageUrl: "/placeholder.svg",
    bio: "MSc Sports Nutrition (UK) with 7 years experience working with elite athletes on nutrition and competition preparation.",
    rating: 4.8
  },
  {
    id: "13",
    name: "Nomusa Mkhize",
    serviceType: "dietician",
    pricePerSession: 400,
    serviceTags: ["stress eating", "hormonal balance", "mindfulness"],
    location: "Durban",
    isOnline: true,
    availability: "Tue-Sat, various times",
    imageUrl: "/placeholder.svg",
    bio: "Mind-Body Nutrition certified professional focusing on stress eating, hormonal balance, and mindfulness practices.",
    rating: 4.7
  },
  {
    id: "14",
    name: "Daniela Rossi",
    serviceType: "dietician",
    pricePerSession: 750,
    serviceTags: ["digestive issues", "IBS", "anti-inflammatory diets", "gut health"],
    location: "Cape Town",
    isOnline: true,
    availability: "Mon-Fri, 8am-4pm",
    imageUrl: "/placeholder.svg",
    bio: "Clinical dietitian and gut health expert with 10 years experience specializing in digestive issues and anti-inflammatory diets.",
    rating: 4.9
  },
  {
    id: "15",
    name: "Ryan Mbatha",
    serviceType: "dietician",
    pricePerSession: 200,
    serviceTags: ["basic nutrition", "teen nutrition", "budget friendly"],
    location: "Online Only",
    isOnline: true,
    availability: "Weekdays and weekends",
    imageUrl: "/placeholder.svg",
    bio: "Certified Nutrition Coach providing basic nutrition coaching for teens and adults with affordable pricing.",
    rating: 4.3
  },
  {
    id: "16",
    name: "Leah Osman",
    serviceType: "dietician",
    pricePerSession: 500,
    serviceTags: ["plant-based", "vegan", "vegetarian", "sustainable nutrition"],
    location: "Johannesburg",
    isOnline: true,
    availability: "Mon-Thu, flexible hours",
    imageUrl: "/placeholder.svg",
    bio: "Plant-based Dietitian with 6 years experience helping clients optimize their health on vegan and vegetarian diets.",
    rating: 4.7
  },
  
  // Physiotherapists
  {
    id: "17",
    name: "Jason Mtshali",
    serviceType: "physiotherapist",
    pricePerSession: 700,
    serviceTags: ["lower back pain", "sports rehab", "dry needling"],
    location: "Cape Town (Southern Suburbs)",
    isOnline: false,
    availability: "Mon-Fri, by appointment",
    imageUrl: "/placeholder.svg",
    bio: "BSc Physiotherapy with Dry Needling certification, specializing in athletic rehabilitation and lower back pain.",
    rating: 4.8
  },
  {
    id: "18",
    name: "Claire Daniels",
    serviceType: "physiotherapist",
    pricePerSession: 400,
    serviceTags: ["postnatal", "posture", "pelvic floor", "women's health"],
    location: "Cape Town (Sea Point)",
    isOnline: true,
    availability: "Flexible schedule",
    imageUrl: "/placeholder.svg",
    bio: "Specialized in women's health with postgraduate certification, focusing on prenatal/postnatal rehabilitation and postural therapy.",
    rating: 4.7
  },
  {
    id: "19",
    name: "Ebrahim Patel",
    serviceType: "physiotherapist",
    pricePerSession: 800,
    serviceTags: ["ACL rehab", "spinal disc issues", "orthopedic", "neurological"],
    location: "Cape Town",
    isOnline: false,
    availability: "Weekdays only",
    imageUrl: "/placeholder.svg",
    bio: "Experienced orthopedic and neurological physiotherapist specializing in ACL rehabilitation and spinal disc issues.",
    rating: 4.9
  },
  {
    id: "20",
    name: "Londiwe Nxumalo",
    serviceType: "physiotherapist",
    pricePerSession: 450,
    serviceTags: ["neck tension", "migraines", "postural therapy", "MSK"],
    location: "Johannesburg",
    isOnline: true,
    availability: "Tue-Sat, various times",
    imageUrl: "/placeholder.svg",
    bio: "Musculoskeletal physiotherapist treating neck tension, migraines, and providing postural therapy solutions.",
    rating: 4.6
  },
  {
    id: "21",
    name: "James Redelinghuys",
    serviceType: "physiotherapist",
    pricePerSession: 600,
    serviceTags: ["running injuries", "biomechanics", "performance recovery"],
    location: "Pretoria",
    isOnline: true,
    availability: "Mon-Fri, 7am-6pm",
    imageUrl: "/placeholder.svg",
    bio: "Biomechanics specialist focusing on performance physiotherapy and running injury prevention/treatment.",
    rating: 4.8
  },
  {
    id: "22",
    name: "Tshepo Dlamini",
    serviceType: "physiotherapist",
    pricePerSession: 720,
    serviceTags: ["spinal adjustments", "dry needling", "chiropractic-style"],
    location: "Johannesburg",
    isOnline: false,
    availability: "By appointment only",
    imageUrl: "/placeholder.svg",
    bio: "Certified Spinal Physiotherapist offering chiropractic-style adjustments and dry needling treatments.",
    rating: 4.7
  },
  {
    id: "23",
    name: "Zara Mohamed",
    serviceType: "physiotherapist",
    pricePerSession: 300,
    serviceTags: ["stroke rehab", "mobility coaching", "community care", "post-op"],
    location: "Durban",
    isOnline: true,
    availability: "Flexible schedule",
    imageUrl: "/placeholder.svg",
    bio: "Community and post-operative physiotherapist specializing in stroke rehabilitation and mobility coaching.",
    rating: 4.5
  },
  {
    id: "24",
    name: "Luke Hendricks",
    serviceType: "physiotherapist",
    pricePerSession: 550,
    serviceTags: ["tendonitis", "sports mobility", "injury prevention"],
    location: "Port Elizabeth",
    isOnline: true,
    availability: "Mon-Sat, various times",
    imageUrl: "/placeholder.svg",
    bio: "BSc Physiotherapy with expertise in treating tendonitis and developing sports-specific mobility programs.",
    rating: 4.6
  },
  {
    id: "1",
    name: "Sarah Johnson",
    serviceType: "dietician",
    pricePerSession: 450,
    serviceTags: ["weight loss", "diabetes management", "sports nutrition"],
    location: "Cape Town",
    isOnline: true,
    availability: "Mon-Fri, 9am-5pm",
    imageUrl: "/placeholder.svg",
    bio: "Registered dietician with 10 years of experience specializing in weight management and medical nutrition therapy.",
    rating: 4.8
  },
  {
    id: "2",
    name: "Mike Peterson",
    serviceType: "personal-trainer",
    pricePerSession: 400,
    serviceTags: ["strength training", "weight loss", "functional fitness"],
    location: "Johannesburg",
    isOnline: false,
    availability: "Mon-Sat, 6am-8pm",
    imageUrl: "/placeholder.svg",
    bio: "Certified personal trainer focused on helping clients achieve sustainable results through customized workout programs.",
    rating: 4.9
  },
  {
    id: "3",
    name: "Dr. James Wilson",
    serviceType: "physiotherapist",
    pricePerSession: 600,
    serviceTags: ["sports injuries", "post-surgery", "back pain"],
    location: "Pretoria",
    isOnline: true,
    availability: "Tue-Sat, 8am-6pm",
    imageUrl: "/placeholder.svg",
    bio: "Sports physiotherapist with experience working with professional athletes and everyday patients recovering from injuries.",
    rating: 4.7
  },
  {
    id: "4",
    name: "Lisa Ndlovu",
    serviceType: "biokineticist",
    pricePerSession: 550,
    serviceTags: ["rehabilitation", "chronic conditions", "posture correction"],
    location: "Durban",
    isOnline: true,
    availability: "Mon-Fri, 7am-7pm",
    imageUrl: "/placeholder.svg",
    bio: "Specialized in orthopedic rehabilitation and chronic disease management through scientifically-based exercise programs.",
    rating: 4.6
  },
  {
    id: "5",
    name: "Trevor Makhanya",
    serviceType: "coaching",
    pricePerSession: 350,
    serviceTags: ["running", "marathon", "beginners"],
    location: "Cape Town",
    isOnline: true,
    availability: "Weekends, 5am-10am",
    imageUrl: "/placeholder.svg",
    bio: "Experienced running coach who has completed 15 marathons and helped hundreds of beginners achieve their first finish line.",
    rating: 4.9
  },
  {
    id: "6",
    name: "Anita Patel",
    serviceType: "dietician",
    pricePerSession: 500,
    serviceTags: ["plant-based", "food allergies", "digestive health"],
    location: "Johannesburg",
    isOnline: true,
    availability: "Mon-Thu, 10am-6pm",
    imageUrl: "/placeholder.svg",
    bio: "Specializing in plant-based nutrition and food sensitivities with a focus on improving digestive health naturally.",
    rating: 4.8
  },
  {
    id: "7",
    name: "David Khumalo",
    serviceType: "personal-trainer",
    pricePerSession: 450,
    serviceTags: ["bodybuilding", "sports performance", "weight loss"],
    location: "Pretoria",
    isOnline: false,
    availability: "Mon-Fri, 5am-8pm",
    imageUrl: "/placeholder.svg",
    bio: "Former competitive bodybuilder now helping clients transform their physiques and athletic performance.",
    rating: 4.7
  },
  {
    id: "8",
    name: "Emma Roberts",
    serviceType: "coaching",
    pricePerSession: 400,
    serviceTags: ["strength", "powerlifting", "technique"],
    location: "Durban",
    isOnline: true,
    availability: "Tue-Sun, 8am-8pm",
    imageUrl: "/placeholder.svg",
    bio: "National powerlifting champion coaching clients on proper lifting techniques and strength progression.",
    rating: 4.9
  },
];

export const EXAMPLE_AI_PLANS: AIHealthPlan[] = [
  {
    id: "plan1",
    name: "Knee Recovery & Return to Running Plan",
    description: "A balanced plan to rehabilitate your knee injury while preparing to resume running safely.",
    services: [
      {
        type: "physiotherapist",
        price: 600,
        sessions: 3,
        description: "Initial assessment and rehabilitation program focusing on knee stability and pain management."
      },
      {
        type: "biokineticist",
        price: 550,
        sessions: 2,
        description: "Progressive exercise therapy to rebuild strength and proper movement patterns."
      },
      {
        type: "coaching",
        price: 350,
        sessions: 1,
        description: "Running technique assessment and customized re-entry plan to prevent re-injury."
      }
    ],
    totalCost: 3250,
    planType: "best-fit",
    timeFrame: "6 weeks"
  },
  {
    id: "plan2",
    name: "High-Impact Knee Rehabilitation Focus",
    description: "Intensive physiotherapy approach to rapidly address your knee injury and establish foundation for return to running.",
    services: [
      {
        type: "physiotherapist",
        price: 600,
        sessions: 4,
        description: "Comprehensive rehabilitation program with hands-on therapy and advanced modalities."
      },
      {
        type: "coaching",
        price: 350,
        sessions: 1,
        description: "Expert guidance on running form to prevent future knee injuries."
      }
    ],
    totalCost: 2750,
    planType: "high-impact",
    timeFrame: "4 weeks"
  },
  {
    id: "plan3",
    name: "Progressive Return-to-Running Journey",
    description: "A staged approach that gradually builds from rehabilitation to running, spreading costs over time.",
    services: [
      {
        type: "physiotherapist",
        price: 600,
        sessions: 2,
        description: "Initial assessment and treatment to address pain and inflammation."
      },
      {
        type: "biokineticist",
        price: 550,
        sessions: 1,
        description: "Customized exercise program to restore function and prevent re-injury."
      },
      {
        type: "coaching",
        price: 350,
        sessions: 1,
        description: "Running program design with gradual progression milestones."
      }
    ],
    totalCost: 2100,
    planType: "progressive",
    timeFrame: "8 weeks"
  }
];

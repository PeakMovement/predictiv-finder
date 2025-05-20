import { ServiceCategory } from "../types";

// Define a mapping between conditions and specialist service categories
export const specialistMapping = {
  "kidney disease": "neurology" as ServiceCategory,
  "diabetes": "endocrinology" as ServiceCategory,
  "heart disease": "cardiology" as ServiceCategory,
  "chronic pain": "pain-management" as ServiceCategory,
  "arthritis": "rheumatology" as ServiceCategory,
  "digestive issues": "gastroenterology" as ServiceCategory,
  "neurological disorders": "neurology" as ServiceCategory,
  "skin conditions": "dermatology" as ServiceCategory,
  "hormonal imbalances": "endocrinology" as ServiceCategory,
  "musculoskeletal issues": "orthopedics" as ServiceCategory,
  "sports injuries": "sport-physician" as ServiceCategory,
  "mental health": "psychiatry" as ServiceCategory,
  "eye problems": "ophthalmology" as ServiceCategory,
  "foot problems": "podiatrist" as ServiceCategory,
  "sleep disorders": "neurology" as ServiceCategory,
  "allergies": "allergy-immunology" as ServiceCategory,
  "cancer": "oncology" as ServiceCategory,
  "lung diseases": "pulmonology" as ServiceCategory,
  "blood disorders": "hematology" as ServiceCategory,
  "infectious diseases": "infectious-disease" as ServiceCategory,
  "autoimmune diseases": "rheumatology" as ServiceCategory,
  "thyroid disorders": "endocrinology" as ServiceCategory,
  "liver diseases": "gastroenterology" as ServiceCategory,
  "bladder problems": "urology" as ServiceCategory,
  "eating disorders": "psychiatry" as ServiceCategory,
  "addiction": "psychiatry" as ServiceCategory,
  "stress management": "coaching" as ServiceCategory,
  "weight management": "dietician" as ServiceCategory,
  "fertility issues": "gynecology" as ServiceCategory,
  "pregnancy care": "obstetrics-gynecology" as ServiceCategory,
  "childhood illnesses": "pediatrics" as ServiceCategory,
  "elderly care": "geriatrics" as ServiceCategory,
  "genetic disorders": "genetics" as ServiceCategory,
  "palliative care": "oncology" as ServiceCategory,
  "rehabilitation": "physical-therapy" as ServiceCategory,
  "speech problems": "speech-therapy" as ServiceCategory,
  "hearing problems": "audiology" as ServiceCategory,
  "occupational health": "occupational-therapy" as ServiceCategory,
  "cosmetic surgery": "plastic-surgery" as ServiceCategory,
  "vascular issues": "vascular-surgery" as ServiceCategory,
  "brain surgery": "neurosurgery" as ServiceCategory,
  "spinal issues": "neurosurgery" as ServiceCategory,
  "organ transplant": "transplant-surgery" as ServiceCategory,
  "pain relief": "pain-management" as ServiceCategory,
  "sports medicine": "sport-physician" as ServiceCategory,
  "physical fitness": "personal-trainer" as ServiceCategory,
  "nutrition": "dietician" as ServiceCategory,
  "mental wellness": "psychology" as ServiceCategory,
  "family health": "family-medicine" as ServiceCategory,
  "emergency care": "emergency-medicine" as ServiceCategory,
  "anesthesia": "anesthesiology" as ServiceCategory,
  "imaging": "radiology" as ServiceCategory,
  "senior health": "geriatric-medicine" as ServiceCategory,
  "nurse care": "nurse-practitioner" as ServiceCategory,
  "general health": "general-practitioner" as ServiceCategory,
};

// Define a mapping between conditions and comorbidity groups
export const comorbidityMapping = {
  "diabetes": {
    name: "Diabetes Comorbidities",
    conditions: ["diabetes", "heart disease", "kidney disease", "eye problems"],
    recommendedServices: ["endocrinology", "cardiology", "nephrology", "ophthalmology"],
    specialConsiderations: ["Regular monitoring of blood sugar levels", "Dietary management", "Exercise"]
  },
  "heart disease": {
    name: "Heart Disease Comorbidities",
    conditions: ["heart disease", "diabetes", "high blood pressure", "high cholesterol"],
    recommendedServices: ["cardiology", "endocrinology", "general-practitioner"],
    specialConsiderations: ["Regular monitoring of blood pressure", "Dietary management", "Exercise"]
  },
  "chronic pain": {
    name: "Chronic Pain Comorbidities",
    conditions: ["chronic pain", "depression", "anxiety", "sleep disorders"],
    recommendedServices: ["pain-management", "psychiatry", "neurology"],
    specialConsiderations: ["Pain management techniques", "Mental health support", "Sleep hygiene"]
  },
  "arthritis": {
    name: "Arthritis Comorbidities",
    conditions: ["arthritis", "chronic pain", "depression", "sleep disorders"],
    recommendedServices: ["rheumatology", "pain-management", "psychiatry"],
    specialConsiderations: ["Pain management techniques", "Physical therapy", "Occupational therapy"]
  },
  "digestive issues": {
    name: "Digestive Issues Comorbidities",
    conditions: ["digestive issues", "anxiety", "depression", "malnutrition"],
    recommendedServices: ["gastroenterology", "psychiatry", "dietician"],
    specialConsiderations: ["Dietary management", "Stress management", "Nutritional support"]
  },
  "neurological disorders": {
    name: "Neurological Disorders Comorbidities",
    conditions: ["neurological disorders", "sleep disorders", "depression", "anxiety"],
    recommendedServices: ["neurology", "psychiatry", "sleep-medicine"],
    specialConsiderations: ["Medication management", "Physical therapy", "Occupational therapy"]
  },
  "skin conditions": {
    name: "Skin Conditions Comorbidities",
    conditions: ["skin conditions", "allergies", "anxiety", "depression"],
    recommendedServices: ["dermatology", "allergy-immunology", "psychiatry"],
    specialConsiderations: ["Topical treatments", "Allergy management", "Stress management"]
  },
  "hormonal imbalances": {
    name: "Hormonal Imbalances Comorbidities",
    conditions: ["hormonal imbalances", "mood swings", "weight changes", "sleep disorders"],
    recommendedServices: ["endocrinology", "psychiatry", "sleep-medicine"],
    specialConsiderations: ["Hormone replacement therapy", "Dietary management", "Stress management"]
  },
  "musculoskeletal issues": {
    name: "Musculoskeletal Issues Comorbidities",
    conditions: ["musculoskeletal issues", "chronic pain", "arthritis", "sports injuries"],
    recommendedServices: ["orthopedics", "pain-management", "rheumatology", "sport-physician"],
    specialConsiderations: ["Physical therapy", "Occupational therapy", "Pain management techniques"]
  },
  "sports injuries": {
    name: "Sports Injuries Comorbidities",
    conditions: ["sports injuries", "chronic pain", "arthritis", "musculoskeletal issues"],
    recommendedServices: ["sport-physician", "orthopedics", "pain-management", "physical-therapy"],
    specialConsiderations: ["Physical therapy", "Occupational therapy", "Pain management techniques"]
  },
  "mental health": {
    name: "Mental Health Comorbidities",
    conditions: ["mental health", "anxiety", "depression", "sleep disorders"],
    recommendedServices: ["psychiatry", "psychology", "sleep-medicine"],
    specialConsiderations: ["Medication management", "Therapy", "Stress management"]
  },
  "eye problems": {
    name: "Eye Problems Comorbidities",
    conditions: ["eye problems", "diabetes", "high blood pressure", "glaucoma"],
    recommendedServices: ["ophthalmology", "endocrinology", "cardiology"],
    specialConsiderations: ["Regular eye exams", "Medication management", "Lifestyle modifications"]
  },
  "foot problems": {
    name: "Foot Problems Comorbidities",
    conditions: ["foot problems", "diabetes", "arthritis", "neuropathy"],
    recommendedServices: ["podiatrist", "endocrinology", "rheumatology", "neurology"],
    specialConsiderations: ["Foot care", "Medication management", "Lifestyle modifications"]
  },
  "sleep disorders": {
    name: "Sleep Disorders Comorbidities",
    conditions: ["sleep disorders", "anxiety", "depression", "chronic pain"],
    recommendedServices: ["neurology", "psychiatry", "pain-management"],
    specialConsiderations: ["Sleep hygiene", "Medication management", "Therapy"]
  },
  "allergies": {
    name: "Allergies Comorbidities",
    conditions: ["allergies", "asthma", "eczema", "sinusitis"],
    recommendedServices: ["allergy-immunology", "pulmonology", "dermatology"],
    specialConsiderations: ["Allergen avoidance", "Medication management", "Immunotherapy"]
  },
  "cancer": {
    name: "Cancer Comorbidities",
    conditions: ["cancer", "chronic pain", "depression", "anxiety"],
    recommendedServices: ["oncology", "pain-management", "psychiatry"],
    specialConsiderations: ["Medication management", "Therapy", "Palliative care"]
  },
  "lung diseases": {
    name: "Lung Diseases Comorbidities",
    conditions: ["lung diseases", "heart disease", "sleep disorders", "anxiety"],
    recommendedServices: ["pulmonology", "cardiology", "sleep-medicine", "psychiatry"],
    specialConsiderations: ["Medication management", "Pulmonary rehabilitation", "Lifestyle modifications"]
  },
  "blood disorders": {
    name: "Blood Disorders Comorbidities",
    conditions: ["blood disorders", "fatigue", "weakness", "infections"],
    recommendedServices: ["hematology", "infectious-disease", "general-practitioner"],
    specialConsiderations: ["Medication management", "Blood transfusions", "Lifestyle modifications"]
  },
  "infectious diseases": {
    name: "Infectious Diseases Comorbidities",
    conditions: ["infectious diseases", "fever", "fatigue", "weakness"],
    recommendedServices: ["infectious-disease", "general-practitioner"],
    specialConsiderations: ["Medication management", "Isolation", "Vaccination"]
  },
  "autoimmune diseases": {
    name: "Autoimmune Diseases Comorbidities",
    conditions: ["autoimmune diseases", "fatigue", "chronic pain", "inflammation"],
    recommendedServices: ["rheumatology", "pain-management", "physical-therapy"],
    specialConsiderations: ["Medication management", "Physical therapy", "Lifestyle modifications"]
  },
  "thyroid disorders": {
    name: "Thyroid Disorders Comorbidities",
    conditions: ["thyroid disorders", "fatigue", "weight changes", "mood swings"],
    recommendedServices: ["endocrinology", "psychiatry"],
    specialConsiderations: ["Medication management", "Dietary management", "Lifestyle modifications"]
  },
  "liver diseases": {
    name: "Liver Diseases Comorbidities",
    conditions: ["liver diseases", "fatigue", "jaundice", "abdominal pain"],
    recommendedServices: ["gastroenterology", "hepatology"],
    specialConsiderations: ["Medication management", "Dietary management", "Lifestyle modifications"]
  },
  "bladder problems": {
    name: "Bladder Problems Comorbidities",
    conditions: ["bladder problems", "urinary incontinence", "urinary frequency", "urinary urgency"],
    recommendedServices: ["urology", "gynecology"],
    specialConsiderations: ["Medication management", "Pelvic floor exercises", "Lifestyle modifications"]
  },
  "eating disorders": {
    name: "Eating Disorders Comorbidities",
    conditions: ["eating disorders", "anxiety", "depression", "body image issues"],
    recommendedServices: ["psychiatry", "psychology", "dietician"],
    specialConsiderations: ["Therapy", "Nutritional support", "Medication management"]
  },
  "addiction": {
    name: "Addiction Comorbidities",
    conditions: ["addiction", "anxiety", "depression", "sleep disorders"],
    recommendedServices: ["psychiatry", "psychology", "addiction-medicine"],
    specialConsiderations: ["Therapy", "Medication management", "Support groups"]
  },
  "stress management": {
    name: "Stress Management Comorbidities",
    conditions: ["stress management", "anxiety", "depression", "sleep disorders"],
    recommendedServices: ["coaching", "psychology", "sleep-medicine"],
    specialConsiderations: ["Therapy", "Stress reduction techniques", "Lifestyle modifications"]
  },
  "weight management": {
    name: "Weight Management Comorbidities",
    conditions: ["weight management", "diabetes", "heart disease", "high blood pressure"],
    recommendedServices: ["dietician", "endocrinology", "cardiology"],
    specialConsiderations: ["Dietary management", "Exercise", "Lifestyle modifications"]
  },
  "fertility issues": {
    name: "Fertility Issues Comorbidities",
    conditions: ["fertility issues", "hormonal imbalances", "PCOS", "endometriosis"],
    recommendedServices: ["gynecology", "endocrinology", "fertility-specialist"],
    specialConsiderations: ["Medication management", "Assisted reproductive technologies", "Lifestyle modifications"]
  },
  "pregnancy care": {
    name: "Pregnancy Care Comorbidities",
    conditions: ["pregnancy care", "gestational diabetes", "high blood pressure", "pre-eclampsia"],
    recommendedServices: ["obstetrics-gynecology", "endocrinology", "cardiology"],
    specialConsiderations: ["Prenatal care", "Medication management", "Lifestyle modifications"]
  },
  "childhood illnesses": {
    name: "Childhood Illnesses Comorbidities",
    conditions: ["childhood illnesses", "asthma", "allergies", "ADHD"],
    recommendedServices: ["pediatrics", "allergy-immunology", "psychiatry"],
    specialConsiderations: ["Medication management", "Therapy", "Lifestyle modifications"]
  },
  "elderly care": {
    name: "Elderly Care Comorbidities",
    conditions: ["elderly care", "dementia", "arthritis", "heart disease"],
    recommendedServices: ["geriatrics", "neurology", "rheumatology", "cardiology"],
    specialConsiderations: ["Medication management", "Physical therapy", "Occupational therapy"]
  },
  "genetic disorders": {
    name: "Genetic Disorders Comorbidities",
    conditions: ["genetic disorders", "developmental delays", "intellectual disabilities", "physical disabilities"],
    recommendedServices: ["genetics", "pediatrics", "neurology", "physical-therapy"],
    specialConsiderations: ["Genetic counseling", "Therapy", "Support groups"]
  },
  "palliative care": {
    name: "Palliative Care Comorbidities",
    conditions: ["palliative care", "cancer", "end-stage organ failure", "neurodegenerative diseases"],
    recommendedServices: ["oncology", "pain-management", "psychiatry", "hospice"],
    specialConsiderations: ["Pain management", "Symptom management", "Emotional support"]
  },
  "rehabilitation": {
    name: "Rehabilitation Comorbidities",
    conditions: ["rehabilitation", "stroke", "traumatic brain injury", "spinal cord injury"],
    recommendedServices: ["physical-therapy", "occupational-therapy", "speech-therapy", "neurology"],
    specialConsiderations: ["Physical therapy", "Occupational therapy", "Speech therapy"]
  },
  "speech problems": {
    name: "Speech Problems Comorbidities",
    conditions: ["speech problems", "stroke", "traumatic brain injury", "autism"],
    recommendedServices: ["speech-therapy", "neurology", "psychiatry"],
    specialConsiderations: ["Speech therapy", "Occupational therapy", "Therapy"]
  },
  "hearing problems": {
    name: "Hearing Problems Comorbidities",
    conditions: ["hearing problems", "tinnitus", "vertigo", "balance problems"],
    recommendedServices: ["audiology", "otolaryngology", "neurology"],
    specialConsiderations: ["Hearing aids", "Therapy", "Balance training"]
  },
  "occupational health": {
    name: "Occupational Health Comorbidities",
    conditions: ["occupational health", "workplace injuries", "repetitive strain injuries", "stress"],
    recommendedServices: ["occupational-therapy", "physical-therapy", "pain-management", "psychology"],
    specialConsiderations: ["Ergonomics", "Therapy", "Stress management"]
  },
  "cosmetic surgery": {
    name: "Cosmetic Surgery Comorbidities",
    conditions: ["cosmetic surgery", "body image issues", "anxiety", "depression"],
    recommendedServices: ["plastic-surgery", "psychology"],
    specialConsiderations: ["Therapy", "Body image counseling", "Support groups"]
  },
  "vascular issues": {
    name: "Vascular Issues Comorbidities",
    conditions: ["vascular issues", "heart disease", "diabetes", "high blood pressure"],
    recommendedServices: ["vascular-surgery", "cardiology", "endocrinology"],
    specialConsiderations: ["Medication management", "Lifestyle modifications", "Surgery"]
  },
  "brain surgery": {
    name: "Brain Surgery Comorbidities",
    conditions: ["brain surgery", "stroke", "traumatic brain injury", "neurological disorders"],
    recommendedServices: ["neurosurgery", "neurology", "physical-therapy", "occupational-therapy"],
    specialConsiderations: ["Rehabilitation", "Therapy", "Medication management"]
  },
  "spinal issues": {
    name: "Spinal Issues Comorbidities",
    conditions: ["spinal issues", "back pain", "neck pain", "sciatica"],
    recommendedServices: ["neurosurgery", "orthopedics", "pain-management", "physical-therapy"],
    specialConsiderations: ["Rehabilitation", "Therapy", "Medication management"]
  },
  "organ transplant": {
    name: "Organ Transplant Comorbidities",
    conditions: ["organ transplant", "immunosuppression", "infections", "organ rejection"],
    recommendedServices: ["transplant-surgery", "infectious-disease", "nephrology", "cardiology"],
    specialConsiderations: ["Medication management", "Lifestyle modifications", "Monitoring"]
  },
  "pain relief": {
    name: "Pain Relief Comorbidities",
    conditions: ["pain relief", "chronic pain", "arthritis", "fibromyalgia"],
    recommendedServices: ["pain-management", "rheumatology", "physical-therapy", "psychology"],
    specialConsiderations: ["Medication management", "Therapy", "Lifestyle modifications"]
  },
  "sports medicine": {
    name: "Sports Medicine Comorbidities",
    conditions: ["sports medicine", "sports injuries", "musculoskeletal issues", "arthritis"],
    recommendedServices: ["sport-physician", "orthopedics", "physical-therapy", "athletic-training"],
    specialConsiderations: ["Rehabilitation", "Therapy", "Medication management"]
  },
  "physical fitness": {
    name: "Physical Fitness Comorbidities",
    conditions: ["physical fitness", "obesity", "diabetes", "heart disease"],
    recommendedServices: ["personal-trainer", "dietician", "endocrinology", "cardiology"],
    specialConsiderations: ["Exercise", "Diet", "Lifestyle modifications"]
  },
  "nutrition": {
    name: "Nutrition Comorbidities",
    conditions: ["nutrition", "obesity", "diabetes", "heart disease"],
    recommendedServices: ["dietician", "endocrinology", "cardiology"],
    specialConsiderations: ["Diet", "Exercise", "Lifestyle modifications"]
  },
  "mental wellness": {
    name: "Mental Wellness Comorbidities",
    conditions: ["mental wellness", "anxiety", "depression", "stress"],
    recommendedServices: ["psychology", "psychiatry", "coaching"],
    specialConsiderations: ["Therapy", "Medication management", "Lifestyle modifications"]
  },
  "family health": {
    name: "Family Health Comorbidities",
    conditions: ["family health", "pediatrics", "geriatrics", "obstetrics-gynecology"],
    recommendedServices: ["family-medicine", "pediatrics", "geriatrics", "obstetrics-gynecology"],
    specialConsiderations: ["Preventive care", "Vaccinations", "Screening"]
  },
  "emergency care": {
    name: "Emergency Care Comorbidities",
    conditions: ["emergency care", "trauma", "acute illnesses", "cardiac arrest"],
    recommendedServices: ["emergency-medicine", "cardiology", "trauma-surgery"],
    specialConsiderations: ["Immediate medical attention", "Life support", "Surgery"]
  },
  "anesthesia": {
    name: "Anesthesia Comorbidities",
    conditions: ["anesthesia", "surgery", "chronic pain", "critical care"],
    recommendedServices: ["anesthesiology", "pain-management", "critical-care"],
    specialConsiderations: ["Preoperative assessment", "Intraoperative monitoring", "Postoperative care"]
  },
  "imaging": {
    name: "Imaging Comorbidities",
    conditions: ["imaging", "diagnosis", "screening", "monitoring"],
    recommendedServices: ["radiology", "cardiology", "neurology"],
    specialConsiderations: ["Radiation safety", "Contrast agents", "Interpretation"]
  },
  "senior health": {
    name: "Senior Health Comorbidities",
    conditions: ["senior health", "dementia", "arthritis", "heart disease"],
    recommendedServices: ["geriatric-medicine", "neurology", "rheumatology", "cardiology"],
    specialConsiderations: ["Medication management", "Physical therapy", "Occupational therapy"]
  },
  "nurse care": {
    name: "Nurse Care Comorbidities",
    conditions: ["nurse care", "chronic illnesses", "post-surgery", "palliative care"],
    recommendedServices: ["nurse-practitioner", "home-health", "hospice"],
    specialConsiderations: ["Medication management", "Wound care", "Emotional support"]
  },
  "general health": {
    name: "General Health Comorbidities",
    conditions: ["general health", "preventive care", "screening", "vaccinations"],
    recommendedServices: ["general-practitioner", "family-medicine"],
    specialConsiderations: ["Preventive care", "Screening", "Vaccinations"]
  }
};

-- Seed symptom severity rules for Phase 2.3
INSERT INTO public.symptom_severity_rules 
(symptom_keyword, body_region, base_severity, duration_hours_threshold, escalation_severity, red_flag_triggers, is_active)
VALUES 
-- Chest symptoms (high priority)
('chest pain', 'chest', 'severe', 2, 'critical', ARRAY['radiating', 'crushing', 'shortness of breath', 'sweating', 'left arm'], true),
('chest tightness', 'chest', 'moderate', 4, 'severe', ARRAY['difficulty breathing', 'palpitations'], true),

-- Head symptoms
('headache', 'head', 'mild', 72, 'moderate', ARRAY['worst headache', 'sudden onset', 'confusion', 'vision changes', 'neck stiffness'], true),
('migraine', 'head', 'moderate', 24, 'severe', ARRAY['vision loss', 'numbness', 'weakness'], true),
('dizziness', 'head', 'mild', 48, 'moderate', ARRAY['fainting', 'confusion', 'chest pain'], true),

-- Abdominal symptoms
('abdominal pain', 'abdomen', 'mild', 24, 'moderate', ARRAY['blood in stool', 'vomiting blood', 'rigid abdomen', 'high fever'], true),
('stomach pain', 'abdomen', 'mild', 24, 'moderate', ARRAY['blood', 'unable to keep fluids', 'severe cramping'], true),
('nausea', 'abdomen', 'mild', 48, 'moderate', ARRAY['blood in vomit', 'severe dehydration'], true),

-- Breathing symptoms
('shortness of breath', 'chest', 'moderate', 2, 'severe', ARRAY['blue lips', 'unable to speak', 'chest pain'], true),
('difficulty breathing', 'chest', 'severe', 1, 'critical', ARRAY['gasping', 'choking', 'unconscious'], true),
('cough', 'chest', 'mild', 168, 'moderate', ARRAY['blood', 'high fever', 'difficulty breathing'], true),

-- Pain symptoms
('back pain', 'back', 'mild', 72, 'moderate', ARRAY['numbness', 'weakness in legs', 'loss of bladder control'], true),
('neck pain', 'neck', 'mild', 48, 'moderate', ARRAY['stiffness', 'high fever', 'numbness'], true),
('joint pain', 'musculoskeletal', 'mild', 72, 'moderate', ARRAY['swelling', 'redness', 'fever', 'inability to move'], true),

-- Mental health symptoms
('anxiety', 'mental', 'mild', 168, 'moderate', ARRAY['panic attack', 'suicidal thoughts', 'self-harm'], true),
('depression', 'mental', 'moderate', 336, 'severe', ARRAY['suicidal thoughts', 'self-harm', 'unable to function'], true),

-- Skin symptoms
('rash', 'skin', 'mild', 48, 'moderate', ARRAY['spreading rapidly', 'high fever', 'difficulty breathing', 'swelling'], true),
('swelling', 'skin', 'mild', 24, 'moderate', ARRAY['throat', 'difficulty breathing', 'face'], true),

-- Fever
('fever', 'general', 'mild', 72, 'moderate', ARRAY['above 39C', 'above 103F', 'confusion', 'stiff neck', 'rash'], true),
('high temperature', 'general', 'mild', 48, 'moderate', ARRAY['convulsions', 'confusion'], true),

-- Fatigue
('fatigue', 'general', 'mild', 336, 'moderate', ARRAY['sudden onset', 'weight loss', 'night sweats'], true),
('weakness', 'general', 'mild', 48, 'moderate', ARRAY['sudden', 'one-sided', 'facial drooping', 'slurred speech'], true)

ON CONFLICT DO NOTHING;
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ProfessionalService } from '@/services/professional-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, ChevronRight, ChevronLeft, CircleCheck as CheckCircle2, CircleUser as UserCircle, Stethoscope, Building2, DollarSign, Lock } from 'lucide-react';
import { toast } from 'sonner';

const PROFESSIONS = [
  'Physiotherapist',
  'Biokineticist',
  'Chiropractor',
  'General Practitioner (GP)',
  'Specialist Doctor',
  'Massage Therapist',
  'Dietician',
  'Nutritionist',
  'Sports Doctor',
  'Psychologist',
  'Psychiatrist',
  'Occupational Therapist',
  'Speech Therapist',
  'Podiatrist',
  'Biokinetics',
  'Personal Trainer',
  'Wellness Coach',
  'Homeopath',
  'Naturopath',
  'Acupuncturist',
];

const GOVERNING_BODIES = [
  'HPCSA (Health Professions Council of South Africa)',
  'AHPCSA (Allied Health Professions Council of South Africa)',
  'SAPC (South African Pharmacy Council)',
  'SANC (South African Nursing Council)',
  'SASOC (South African Society of Chiropractors)',
  'SASP (South African Society of Physiotherapy)',
  'ADSA (Association for Dietetics in South Africa)',
  'SASPA (SA Sports Physicians Association)',
  'SACSSP (SA Council for Social Service Professions)',
  'Other',
];

const SA_CITIES = [
  'Cape Town',
  'Johannesburg',
  'Pretoria',
  'Durban',
  'Port Elizabeth (Gqeberha)',
  'Bloemfontein',
  'East London',
  'Pietermaritzburg',
  'Nelspruit',
  'Polokwane',
  'Kimberley',
  'Rustenburg',
  'George',
  'Stellenbosch',
  'Somerset West',
  'Sandton',
  'Fourways',
  'Centurion',
  'Midrand',
  'Randburg',
];

const SPECIALITIES = [
  'Sports Injuries', 'Chronic Pain', 'Rehabilitation', 'Weight Management',
  'Stress Management', 'Posture Correction', 'Manual Therapy', 'Dry Needling',
  'Exercise Therapy', 'Nutritional Counseling', 'Spinal Rehabilitation',
  'Post-Surgical Recovery', 'Paediatric Care', 'Geriatric Care', 'Oncology Rehab',
  'Neurological Rehab', 'Cardiopulmonary Rehab', 'Women\'s Health', 'Ergonomics',
  'Performance Optimization', 'Injury Prevention', 'Mental Health', 'Anxiety & Depression',
  'Diabetes Management', 'Hypertension Management', 'Gut Health', 'Immune Support',
];

const LANGUAGES = [
  'English', 'Afrikaans', 'Zulu', 'Xhosa', 'Sotho', 'Tswana',
  'Venda', 'Tsonga', 'Swati', 'Ndebele', 'Portuguese', 'French',
];

const QUALIFICATIONS = [
  'Bachelor\'s Degree',
  'Honours Degree',
  'Master\'s Degree',
  'Doctoral Degree (PhD)',
  'Medical Degree (MBChB / MBBS)',
  'Specialist Certification',
  'Diploma',
  'National Diploma',
  'Certificate Program',
  'Postgraduate Diploma',
];

type Step = 1 | 2 | 3 | 4 | 5;

const STEPS: { id: Step; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 1, label: 'Account', icon: Lock },
  { id: 2, label: 'Personal', icon: UserCircle },
  { id: 3, label: 'Credentials', icon: Stethoscope },
  { id: 4, label: 'Practice', icon: Building2 },
  { id: 5, label: 'Pricing', icon: DollarSign },
];

export default function PractitionerPortal() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Step 1 — Account
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2 — Personal Info
  const [name, setName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [bio, setBio] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Step 3 — Credentials
  const [profession, setProfession] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [governingBody, setGoverningBody] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [qualification, setQualification] = useState('');
  const [institution, setInstitution] = useState('');
  const [specialities, setSpecialities] = useState<string[]>([]);
  const [customSpeciality, setCustomSpeciality] = useState('');
  const [expertiseAreas, setExpertiseAreas] = useState<string[]>([]);
  const [customExpertise, setCustomExpertise] = useState('');

  // Step 4 — Practice Details
  const [practiceName, setPracticeName] = useState('');
  const [location, setLocation] = useState('');
  const [consultationType, setConsultationType] = useState('');
  const [calendlyUrl, setCalendlyUrl] = useState('');
  const [googleUrl, setGoogleUrl] = useState('');

  // Step 5 — Pricing
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const addTag = (
    value: string,
    list: string[],
    setList: (v: string[]) => void,
    max = 10,
    label = 'items'
  ) => {
    if (list.length >= max) { toast.error(`Maximum ${max} ${label} allowed`); return; }
    if (!list.includes(value)) setList([...list, value]);
  };

  const removeTag = (value: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.filter((i) => i !== value));
  };

  const validateStep = (): boolean => {
    if (currentStep === 1) {
      if (!email || !password || !confirmPassword) { toast.error('Please fill in all account fields'); return false; }
      if (password.length < 6) { toast.error('Password must be at least 6 characters'); return false; }
      if (password !== confirmPassword) { toast.error('Passwords do not match'); return false; }
    }
    if (currentStep === 2) {
      if (!name) { toast.error('Full name is required'); return false; }
      if (!contactNumber) { toast.error('Contact number is required'); return false; }
    }
    if (currentStep === 3) {
      if (!profession) { toast.error('Profession type is required'); return false; }
      if (!registrationNumber) { toast.error('Registration number is required'); return false; }
      if (!governingBody) { toast.error('Governing body is required'); return false; }
      if (!qualification) { toast.error('Qualification is required'); return false; }
    }
    if (currentStep === 4) {
      if (!location) { toast.error('Location is required'); return false; }
      if (!consultationType) { toast.error('Please select consultation type'); return false; }
      if (!calendlyUrl) { toast.error('Calendly link is required'); return false; }
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    setCurrentStep((s) => Math.min(5, s + 1) as Step);
  };

  const prevStep = () => setCurrentStep((s) => Math.max(1, s - 1) as Step);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true);

    try {
      const supabaseUrl = "https://zpddlphtoeluytrejioj.supabase.co";
      const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwZGRscGh0b2VsdXl0cmVqaW9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNzMzMzMsImV4cCI6MjA2Mzk0OTMzM30.jwTdmEafWDvL-k54o9-q-hpeeqvTJPUZDI_Pp2g3nlU";

      const createRes = await fetch(`${supabaseUrl}/functions/v1/create-practitioner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify({ email, password }),
      });

      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error || 'Failed to create account');

      const userId = createData.userId;
      if (!userId) throw new Error('Authentication failed. Please try again.');

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      const user = { id: userId };

      let photoUrl: string | null = null;
      if (photoFile) {
        try {
          photoUrl = await ProfessionalService.uploadPhoto(photoFile);
        } catch {
          toast.error('Photo upload failed — your profile will be created without a photo.');
        }
      }

      const { error: insertError } = await supabase.from('professionals').insert({
        user_id: user.id,
        name,
        profession,
        specialities,
        price_min: priceMin ? parseInt(priceMin) : null,
        price_max: priceMax ? parseInt(priceMax) : null,
        location,
        google_reviews_url: googleUrl || null,
        calendly_url: calendlyUrl,
        photo_url: photoUrl,
        is_approved: false,
        registration_number: registrationNumber,
        governing_body: governingBody,
        years_experience: yearsExperience ? parseInt(yearsExperience) : null,
        qualification,
        institution: institution || null,
        practice_name: practiceName || null,
        contact_number: contactNumber,
        bio: bio || null,
        consultation_type: consultationType,
        languages,
        expertise_areas: expertiseAreas,
      } as Record<string, unknown>);

      if (insertError) throw insertError;

      toast.success('Application submitted! Your profile is under review.');
      navigate('/professional-dashboard');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to create account';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0d1321]/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white tracking-tight">Practitioner Portal</h1>
            <p className="text-sm text-white/40 mt-0.5">Join the Predictiv health network</p>
          </div>
          <div className="text-xs text-white/30 flex items-center gap-1.5">
            <Lock className="w-3 h-3" />
            Private access
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start py-10 px-4">
        <div className="w-full max-w-2xl">

          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-10">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isActive = currentStep === step.id;
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                        isCompleted
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : isActive
                          ? 'bg-sky-500 border-sky-500 text-white'
                          : 'bg-transparent border-white/20 text-white/30'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium transition-colors ${
                        isActive ? 'text-sky-400' : isCompleted ? 'text-emerald-400' : 'text-white/30'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-px mx-2 mb-5 transition-colors ${
                        currentStep > step.id ? 'bg-emerald-500/50' : 'bg-white/10'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Form Card */}
          <div className="bg-[#111827] border border-white/10 rounded-2xl overflow-hidden">
            <form onSubmit={handleSubmit}>

              {/* Step 1 — Account */}
              {currentStep === 1 && (
                <div className="p-8 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Create your account</h2>
                    <p className="text-sm text-white/50 mt-1">Your login credentials for the practitioner portal</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white/70 text-sm">Email address *</Label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@yourpractice.co.za"
                        className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-sky-500 focus:ring-sky-500/20"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-white/70 text-sm">Password *</Label>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-sky-500"
                        required
                        minLength={6}
                      />
                    </div>
                    <div>
                      <Label className="text-white/70 text-sm">Confirm password *</Label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-sky-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2 — Personal Info */}
              {currentStep === 2 && (
                <div className="p-8 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Personal information</h2>
                    <p className="text-sm text-white/50 mt-1">How you appear to patients on the platform</p>
                  </div>

                  {/* Photo Upload */}
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <UserCircle className="w-10 h-10 text-white/20" />
                      )}
                    </div>
                    <div>
                      <Label className="text-white/70 text-sm block mb-1.5">Profile photo</Label>
                      <label className="cursor-pointer">
                        <span className="text-xs bg-white/10 hover:bg-white/15 text-white/70 px-3 py-1.5 rounded-md border border-white/10 transition-colors">
                          {photoPreview ? 'Change photo' : 'Upload photo'}
                        </span>
                        <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                      </label>
                      <p className="text-xs text-white/30 mt-1.5">JPG, PNG. Max 5MB.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label className="text-white/70 text-sm">Full name *</Label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Dr. Jane Smith"
                        className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-sky-500"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-white/70 text-sm">Business Number *</Label>
                      <Input
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        placeholder="+27 82 123 4567"
                        className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-sky-500"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-white/70 text-sm">Professional bio</Label>
                      <Textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="A short summary of your background, approach, and what patients can expect working with you..."
                        rows={4}
                        className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-sky-500 resize-none"
                      />
                      <p className="text-xs text-white/30 mt-1">{bio.length}/500 characters</p>
                    </div>
                  </div>

                  {/* Languages */}
                  <div>
                    <Label className="text-white/70 text-sm mb-2 block">Languages spoken</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {languages.map((lang) => (
                        <Badge key={lang} className="bg-sky-500/20 text-sky-300 border-sky-500/30 gap-1 pr-1">
                          {lang}
                          <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => removeTag(lang, languages, setLanguages)} />
                        </Badge>
                      ))}
                    </div>
                    <Select onValueChange={(v) => addTag(v, languages, setLanguages, 8, 'languages')}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white/70">
                        <SelectValue placeholder="Add language" />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.filter((l) => !languages.includes(l)).map((lang) => (
                          <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 3 — Credentials */}
              {currentStep === 3 && (
                <div className="p-8 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Professional credentials</h2>
                    <p className="text-sm text-white/50 mt-1">Qualifications and registration details for verification</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label className="text-white/70 text-sm">Profession type *</Label>
                      <Select value={profession} onValueChange={setProfession}>
                        <SelectTrigger className="mt-1.5 bg-white/5 border-white/10 text-white/80">
                          <SelectValue placeholder="Select your profession" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROFESSIONS.map((p) => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-white/70 text-sm">Governing / regulatory body *</Label>
                      <Select value={governingBody} onValueChange={setGoverningBody}>
                        <SelectTrigger className="mt-1.5 bg-white/5 border-white/10 text-white/80">
                          <SelectValue placeholder="Select governing body" />
                        </SelectTrigger>
                        <SelectContent>
                          {GOVERNING_BODIES.map((b) => (
                            <SelectItem key={b} value={b}>{b}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-white/70 text-sm">Registration / license number *</Label>
                      <Input
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        placeholder="e.g. MP 0123456"
                        className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-sky-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white/70 text-sm">Highest qualification *</Label>
                        <Select value={qualification} onValueChange={setQualification}>
                          <SelectTrigger className="mt-1.5 bg-white/5 border-white/10 text-white/80">
                            <SelectValue placeholder="Select qualification" />
                          </SelectTrigger>
                          <SelectContent>
                            {QUALIFICATIONS.map((q) => (
                              <SelectItem key={q} value={q}>{q}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-white/70 text-sm">Years of experience</Label>
                        <Input
                          type="number"
                          min="0"
                          max="60"
                          value={yearsExperience}
                          onChange={(e) => setYearsExperience(e.target.value)}
                          placeholder="e.g. 8"
                          className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-sky-500"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-white/70 text-sm">Institution / university</Label>
                      <Input
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="e.g. University of Cape Town"
                        className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-sky-500"
                      />
                    </div>
                  </div>

                  {/* Specialities */}
                  <div>
                    <Label className="text-white/70 text-sm mb-2 block">Specialities (max 7)</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {specialities.map((s) => (
                        <Badge key={s} className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 gap-1 pr-1">
                          {s}
                          <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => removeTag(s, specialities, setSpecialities)} />
                        </Badge>
                      ))}
                    </div>
                    <Select onValueChange={(v) => addTag(v, specialities, setSpecialities, 7, 'specialities')}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white/70">
                        <SelectValue placeholder="Add speciality" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPECIALITIES.filter((s) => !specialities.includes(s)).map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={customSpeciality}
                        onChange={(e) => setCustomSpeciality(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (customSpeciality.trim()) {
                              addTag(customSpeciality.trim(), specialities, setSpecialities, 7, 'specialities');
                              setCustomSpeciality('');
                            }
                          }
                        }}
                        placeholder="Custom speciality"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-sky-500"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (customSpeciality.trim()) {
                            addTag(customSpeciality.trim(), specialities, setSpecialities, 7, 'specialities');
                            setCustomSpeciality('');
                          }
                        }}
                        className="border-white/10 text-white/70 hover:bg-white/10 shrink-0"
                      >
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Expertise Areas */}
                  <div>
                    <Label className="text-white/70 text-sm mb-2 block">Additional areas of expertise</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {expertiseAreas.map((a) => (
                        <Badge key={a} className="bg-amber-500/20 text-amber-300 border-amber-500/30 gap-1 pr-1">
                          {a}
                          <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => removeTag(a, expertiseAreas, setExpertiseAreas)} />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={customExpertise}
                        onChange={(e) => setCustomExpertise(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (customExpertise.trim()) {
                              addTag(customExpertise.trim(), expertiseAreas, setExpertiseAreas, 10, 'expertise areas');
                              setCustomExpertise('');
                            }
                          }
                        }}
                        placeholder="e.g. Corporate wellness, Athletes, Elderly care"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-sky-500"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (customExpertise.trim()) {
                            addTag(customExpertise.trim(), expertiseAreas, setExpertiseAreas, 10, 'expertise areas');
                            setCustomExpertise('');
                          }
                        }}
                        className="border-white/10 text-white/70 hover:bg-white/10 shrink-0"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4 — Practice Details */}
              {currentStep === 4 && (
                <div className="p-8 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Practice details</h2>
                    <p className="text-sm text-white/50 mt-1">Where and how you see patients</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-white/70 text-sm">Practice / clinic name</Label>
                      <Input
                        value={practiceName}
                        onChange={(e) => setPracticeName(e.target.value)}
                        placeholder="e.g. Cape Physio & Wellness"
                        className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <Label className="text-white/70 text-sm">City / location *</Label>
                      <Select value={location} onValueChange={setLocation}>
                        <SelectTrigger className="mt-1.5 bg-white/5 border-white/10 text-white/80">
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          {SA_CITIES.map((city) => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-white/70 text-sm">Consultation type *</Label>
                      <Select value={consultationType} onValueChange={setConsultationType}>
                        <SelectTrigger className="mt-1.5 bg-white/5 border-white/10 text-white/80">
                          <SelectValue placeholder="How do you see patients?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in-person">In-person only</SelectItem>
                          <SelectItem value="online">Online / telehealth only</SelectItem>
                          <SelectItem value="both">Both in-person and online</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-white/70 text-sm">Calendly booking link *</Label>
                      <Input
                        type="url"
                        value={calendlyUrl}
                        onChange={(e) => setCalendlyUrl(e.target.value)}
                        placeholder="https://calendly.com/yourname"
                        className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-sky-500"
                        required
                      />
                      <p className="text-xs text-white/30 mt-1">Patients use this link to book appointments with you directly.</p>
                    </div>

                    <div>
                      <Label className="text-white/70 text-sm">Google Business Profile URL <span className="text-white/30">(optional)</span></Label>
                      <Input
                        type="url"
                        value={googleUrl}
                        onChange={(e) => setGoogleUrl(e.target.value)}
                        placeholder="https://g.page/your-practice"
                        className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-sky-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5 — Pricing */}
              {currentStep === 5 && (
                <div className="p-8 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Session pricing</h2>
                    <p className="text-sm text-white/50 mt-1">Set your typical price range per consultation (in South African Rand)</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white/70 text-sm">Minimum price (R)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={priceMin}
                        onChange={(e) => setPriceMin(e.target.value)}
                        placeholder="e.g. 600"
                        className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <Label className="text-white/70 text-sm">Maximum price (R)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={priceMax}
                        onChange={(e) => setPriceMax(e.target.value)}
                        placeholder="e.g. 1500"
                        className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-sky-500"
                      />
                    </div>
                  </div>

                  {/* Review Summary */}
                  <div className="bg-white/5 rounded-xl border border-white/10 p-5 space-y-3">
                    <p className="text-sm font-medium text-white/80">Application summary</p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                      <div>
                        <span className="text-white/40">Name</span>
                        <p className="text-white/80 truncate">{name || '—'}</p>
                      </div>
                      <div>
                        <span className="text-white/40">Profession</span>
                        <p className="text-white/80 truncate">{profession || '—'}</p>
                      </div>
                      <div>
                        <span className="text-white/40">Location</span>
                        <p className="text-white/80">{location || '—'}</p>
                      </div>
                      <div>
                        <span className="text-white/40">Consultation</span>
                        <p className="text-white/80 capitalize">{consultationType || '—'}</p>
                      </div>
                      <div>
                        <span className="text-white/40">Registration No.</span>
                        <p className="text-white/80">{registrationNumber || '—'}</p>
                      </div>
                      <div>
                        <span className="text-white/40">Experience</span>
                        <p className="text-white/80">{yearsExperience ? `${yearsExperience} years` : '—'}</p>
                      </div>
                    </div>
                    {specialities.length > 0 && (
                      <div>
                        <span className="text-white/40 text-sm">Specialities</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {specialities.map((s) => (
                            <Badge key={s} className="bg-emerald-500/15 text-emerald-300 border-emerald-500/20 text-xs">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-white/30 pt-2 border-t border-white/10">
                      Your application will be reviewed before going live. You will receive an email once approved.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="px-8 pb-8 flex items-center justify-between border-t border-white/10 pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-0"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>

                {currentStep < 5 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-sky-500 hover:bg-sky-400 text-white px-6"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-emerald-500 hover:bg-emerald-400 text-white px-8"
                  >
                    {loading ? 'Submitting...' : 'Submit application'}
                  </Button>
                )}
              </div>
            </form>
          </div>

          <p className="text-center text-xs text-white/25 mt-6">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/pro-login')}
              className="text-sky-400/70 hover:text-sky-400 underline underline-offset-2 transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

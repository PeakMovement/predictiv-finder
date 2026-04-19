import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '@/integrations/supabase/client';
import { ProfessionalService } from '@/services/professional-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, ChevronRight, ChevronLeft, CircleCheck as CheckCircle2, CircleUser as UserCircle, Lock, Stethoscope, Building2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

type Step = 1 | 2 | 3 | 4 | 5;

const PROFESSIONS = [
  'Physiotherapist',
  'Biokineticist',
  'Chiropractor',
  'General Practitioner',
  'Massage Therapist',
  'Dietician',
  'Sports Doctor',
  'Psychologist',
  'Occupational Therapist',
  'Podiatrist',
  'Homeopath',
  'Naturopath',
  'Acupuncturist',
  'Nurse Practitioner',
];

const GOVERNING_BODIES = [
  'HPCSA (Health Professions Council of South Africa)',
  'AHPCSA (Allied Health Professions Council of SA)',
  'SANC (South African Nursing Council)',
  'SAPC (South African Pharmacy Council)',
  'BHF (Board of Healthcare Funders)',
  'Other',
];

const SA_CITIES = [
  'Cape Town',
  'Johannesburg',
  'Pretoria',
  'Durban',
  'Port Elizabeth',
  'Bloemfontein',
  'East London',
  'Pietermaritzburg',
  'Polokwane',
  'Nelspruit',
  'Kimberley',
  'George',
  'Stellenbosch',
  'Somerset West',
];

const COMMON_SPECIALITIES = [
  'Sports Injuries',
  'Chronic Pain',
  'Rehabilitation',
  'Weight Management',
  'Stress Management',
  'Posture Correction',
  'Manual Therapy',
  'Dry Needling',
  'Exercise Therapy',
  'Nutritional Counseling',
  'Pediatrics',
  'Geriatrics',
  'Post-surgical Rehab',
  'Womens Health',
];

const EXPERTISE_AREAS = [
  'Endurance Sports',
  'Strength Training',
  'Team Sports',
  'Combat Sports',
  'Yoga & Pilates',
  'Elderly Care',
  'Corporate Wellness',
  'Chronic Disease Management',
  'Mental Performance',
  'Injury Prevention',
];

const LANGUAGES = [
  'English',
  'Afrikaans',
  'Zulu',
  'Xhosa',
  'Sotho',
  'Tswana',
  'Venda',
  'Tsonga',
  'Ndebele',
  'Swati',
];

const STEPS = [
  { number: 1, label: 'Account', icon: Lock },
  { number: 2, label: 'Personal', icon: UserCircle },
  { number: 3, label: 'Credentials', icon: Stethoscope },
  { number: 4, label: 'Practice', icon: Building2 },
  { number: 5, label: 'Pricing', icon: DollarSign },
];

export default function PractitionerPortal() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>(1);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [bio, setBio] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
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
  const [practiceName, setPracticeName] = useState('');
  const [location, setLocation] = useState('');
  const [consultationType, setConsultationType] = useState('');
  const [calendlyUrl, setCalendlyUrl] = useState('');
  const [googleUrl, setGoogleUrl] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const addTag = (value: string, list: string[], setList: (v: string[]) => void, max = 7) => {
    if (list.length >= max) { toast.error(`Maximum ${max} items allowed`); return; }
    if (!list.includes(value)) setList([...list, value]);
  };

  const removeTag = (value: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.filter(v => v !== value));
  };

  const validateStep = (): boolean => {
    if (currentStep === 1) {
      if (!email || !password || !confirmPassword) { toast.error('Please fill in all required fields'); return false; }
      if (password !== confirmPassword) { toast.error('Passwords do not match'); return false; }
      if (password.length < 6) { toast.error('Password must be at least 6 characters'); return false; }
    }
    if (currentStep === 2) {
      if (!name || !contactNumber) { toast.error('Please fill in your name and contact number'); return false; }
    }
    if (currentStep === 3) {
      if (!profession || !registrationNumber || !governingBody || !qualification) {
        toast.error('Please fill in all required credential fields');
        return false;
      }
    }
    if (currentStep === 4) {
      if (!location || !consultationType || !calendlyUrl) {
        toast.error('Please fill in location, consultation type, and Calendly link');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    setCurrentStep((prev) => Math.min(prev + 1, 5) as Step);
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1) as Step);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true);

    try {
      const createRes = await fetch(`${SUPABASE_URL}/functions/v1/create-practitioner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ email, password }),
      });

      const createData = await createRes.json();
      if (!createRes.ok) {
        throw new Error(createData.error || 'Failed to create account. This email might already be in use.');
      }

      const userId = createData.userId;
      if (!userId) throw new Error('Account creation failed. No user ID returned.');

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      let photoUrl = null;
      if (photoFile) {
        try {
          photoUrl = await ProfessionalService.uploadPhoto(photoFile);
        } catch (uploadErr) {
          console.error('Photo upload failed:', uploadErr);
          toast.error('Photo upload failed, continuing without photo.');
        }
      }

      const { error: insertError } = await supabase.from('professionals').insert({
        user_id: userId,
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
      });

      if (insertError) throw insertError;

      toast.success('Application submitted! Your profile is under review.');
      navigate('/professional-dashboard');
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Join as a Practitioner</h1>
          <p className="text-slate-400">Register your professional profile to connect with patients</p>
        </div>

        <div className="flex items-center justify-between mb-8">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isComplete = currentStep > step.number;
            const isActive = currentStep === step.number;
            return (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    isComplete ? 'bg-emerald-500 border-emerald-500' :
                    isActive ? 'bg-blue-600 border-blue-500' :
                    'bg-slate-800 border-slate-600'
                  }`}>
                    {isComplete ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    )}
                  </div>
                  <span className={`text-xs mt-1 ${isActive ? 'text-blue-400' : isComplete ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {step.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-4 transition-all ${currentStep > step.number ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-slate-900/80 backdrop-blur border border-slate-700 rounded-2xl p-8">
          <form onSubmit={handleSubmit}>

            {currentStep === 1 && (
              <div className="space-y-5">
                <h2 className="text-xl font-semibold text-white mb-4">Create Your Account</h2>
                <div>
                  <Label htmlFor="email" className="text-slate-300">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 bg-slate-800 border-slate-600 text-white"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-slate-300">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 bg-slate-800 border-slate-600 text-white"
                    placeholder="Min. 6 characters"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="text-slate-300">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 bg-slate-800 border-slate-600 text-white"
                    placeholder="Repeat your password"
                    required
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-5">
                <h2 className="text-xl font-semibold text-white mb-4">Personal Information</h2>
                <div>
                  <Label htmlFor="name" className="text-slate-300">Full Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 bg-slate-800 border-slate-600 text-white"
                    placeholder="Dr. Jane Smith"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactNumber" className="text-slate-300">Contact Number *</Label>
                  <Input
                    id="contactNumber"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="mt-1 bg-slate-800 border-slate-600 text-white"
                    placeholder="+27 82 000 0000"
                    required
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Languages Spoken</Label>
                  <div className="flex flex-wrap gap-2 mb-2 mt-1">
                    {languages.map((lang) => (
                      <Badge key={lang} variant="secondary" className="gap-1 bg-blue-900/40 text-blue-300 border-blue-700">
                        {lang}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(lang, languages, setLanguages)} />
                      </Badge>
                    ))}
                  </div>
                  <Select onValueChange={(v) => addTag(v, languages, setLanguages, 10)}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue placeholder="Add language" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bio" className="text-slate-300">Professional Bio (Optional)</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="mt-1 bg-slate-800 border-slate-600 text-white"
                    placeholder="Brief description of your background and approach..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Profile Photo (Optional)</Label>
                  <div className="flex items-center gap-4 mt-1">
                    {photoPreview && (
                      <img src={photoPreview} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-slate-600" />
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="bg-slate-800 border-slate-600 text-slate-300 file:text-slate-300 file:bg-slate-700 file:border-0"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-5">
                <h2 className="text-xl font-semibold text-white mb-4">Professional Credentials</h2>
                <div>
                  <Label htmlFor="profession" className="text-slate-300">Profession *</Label>
                  <Select value={profession} onValueChange={setProfession} required>
                    <SelectTrigger className="mt-1 bg-slate-800 border-slate-600 text-white">
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
                  <Label htmlFor="registrationNumber" className="text-slate-300">Registration Number *</Label>
                  <Input
                    id="registrationNumber"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    className="mt-1 bg-slate-800 border-slate-600 text-white"
                    placeholder="e.g. PT0012345"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="governingBody" className="text-slate-300">Governing Body *</Label>
                  <Select value={governingBody} onValueChange={setGoverningBody} required>
                    <SelectTrigger className="mt-1 bg-slate-800 border-slate-600 text-white">
                      <SelectValue placeholder="Select governing body" />
                    </SelectTrigger>
                    <SelectContent>
                      {GOVERNING_BODIES.map((body) => (
                        <SelectItem key={body} value={body}>{body}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="qualification" className="text-slate-300">Highest Qualification *</Label>
                    <Input
                      id="qualification"
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      className="mt-1 bg-slate-800 border-slate-600 text-white"
                      placeholder="e.g. BSc Physiotherapy"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="yearsExperience" className="text-slate-300">Years Experience</Label>
                    <Input
                      id="yearsExperience"
                      type="number"
                      min="0"
                      max="60"
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(e.target.value)}
                      className="mt-1 bg-slate-800 border-slate-600 text-white"
                      placeholder="e.g. 5"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="institution" className="text-slate-300">Institution (Optional)</Label>
                  <Input
                    id="institution"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="mt-1 bg-slate-800 border-slate-600 text-white"
                    placeholder="e.g. University of Cape Town"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Specialities (Max 7)</Label>
                  <div className="flex flex-wrap gap-2 mb-2 mt-1">
                    {specialities.map((spec) => (
                      <Badge key={spec} variant="secondary" className="gap-1 bg-blue-900/40 text-blue-300 border-blue-700">
                        {spec}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(spec, specialities, setSpecialities)} />
                      </Badge>
                    ))}
                  </div>
                  <Select onValueChange={(v) => addTag(v, specialities, setSpecialities, 7)}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue placeholder="Add speciality" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_SPECIALITIES.map((spec) => (
                        <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Custom speciality"
                      value={customSpeciality}
                      onChange={(e) => setCustomSpeciality(e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (customSpeciality.trim()) {
                            addTag(customSpeciality.trim(), specialities, setSpecialities, 7);
                            setCustomSpeciality('');
                          }
                        }
                      }}
                    />
                    <Button type="button" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => {
                      if (customSpeciality.trim()) {
                        addTag(customSpeciality.trim(), specialities, setSpecialities, 7);
                        setCustomSpeciality('');
                      }
                    }}>
                      Add
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-slate-300">Expertise Areas</Label>
                  <div className="flex flex-wrap gap-2 mb-2 mt-1">
                    {expertiseAreas.map((area) => (
                      <Badge key={area} variant="secondary" className="gap-1 bg-emerald-900/40 text-emerald-300 border-emerald-700">
                        {area}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(area, expertiseAreas, setExpertiseAreas)} />
                      </Badge>
                    ))}
                  </div>
                  <Select onValueChange={(v) => addTag(v, expertiseAreas, setExpertiseAreas, 5)}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue placeholder="Add expertise area" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPERTISE_AREAS.map((area) => (
                        <SelectItem key={area} value={area}>{area}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Custom expertise"
                      value={customExpertise}
                      onChange={(e) => setCustomExpertise(e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (customExpertise.trim()) {
                            addTag(customExpertise.trim(), expertiseAreas, setExpertiseAreas, 5);
                            setCustomExpertise('');
                          }
                        }
                      }}
                    />
                    <Button type="button" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => {
                      if (customExpertise.trim()) {
                        addTag(customExpertise.trim(), expertiseAreas, setExpertiseAreas, 5);
                        setCustomExpertise('');
                      }
                    }}>
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-5">
                <h2 className="text-xl font-semibold text-white mb-4">Practice Details</h2>
                <div>
                  <Label htmlFor="practiceName" className="text-slate-300">Practice Name (Optional)</Label>
                  <Input
                    id="practiceName"
                    value={practiceName}
                    onChange={(e) => setPracticeName(e.target.value)}
                    className="mt-1 bg-slate-800 border-slate-600 text-white"
                    placeholder="e.g. Cape Town Physio & Rehab"
                  />
                </div>
                <div>
                  <Label htmlFor="location" className="text-slate-300">City / Location *</Label>
                  <Select value={location} onValueChange={setLocation} required>
                    <SelectTrigger className="mt-1 bg-slate-800 border-slate-600 text-white">
                      <SelectValue placeholder="Select your city" />
                    </SelectTrigger>
                    <SelectContent>
                      {SA_CITIES.map((city) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="consultationType" className="text-slate-300">Consultation Type *</Label>
                  <Select value={consultationType} onValueChange={setConsultationType} required>
                    <SelectTrigger className="mt-1 bg-slate-800 border-slate-600 text-white">
                      <SelectValue placeholder="Select consultation type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-person">In-Person Only</SelectItem>
                      <SelectItem value="online">Online Only</SelectItem>
                      <SelectItem value="both">Both In-Person & Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="calendlyUrl" className="text-slate-300">Calendly Booking Link *</Label>
                  <Input
                    id="calendlyUrl"
                    type="url"
                    value={calendlyUrl}
                    onChange={(e) => setCalendlyUrl(e.target.value)}
                    className="mt-1 bg-slate-800 border-slate-600 text-white"
                    placeholder="https://calendly.com/yourname"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="googleUrl" className="text-slate-300">Google Business Profile (Optional)</Label>
                  <Input
                    id="googleUrl"
                    type="url"
                    value={googleUrl}
                    onChange={(e) => setGoogleUrl(e.target.value)}
                    className="mt-1 bg-slate-800 border-slate-600 text-white"
                    placeholder="https://g.page/your-business"
                  />
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-5">
                <h2 className="text-xl font-semibold text-white mb-4">Pricing & Submission</h2>
                <p className="text-slate-400 text-sm">Set your consultation fee range so patients can plan accordingly.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priceMin" className="text-slate-300">Min Price (R)</Label>
                    <Input
                      id="priceMin"
                      type="number"
                      min="0"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      className="mt-1 bg-slate-800 border-slate-600 text-white"
                      placeholder="500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="priceMax" className="text-slate-300">Max Price (R)</Label>
                    <Input
                      id="priceMax"
                      type="number"
                      min="0"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      className="mt-1 bg-slate-800 border-slate-600 text-white"
                      placeholder="1500"
                    />
                  </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-2 text-sm text-slate-300">
                  <p className="font-medium text-white">Review your application:</p>
                  <p><span className="text-slate-400">Name:</span> {name}</p>
                  <p><span className="text-slate-400">Profession:</span> {profession}</p>
                  <p><span className="text-slate-400">Location:</span> {location}</p>
                  <p><span className="text-slate-400">Consultation:</span> {consultationType}</p>
                  {specialities.length > 0 && (
                    <p><span className="text-slate-400">Specialities:</span> {specialities.join(', ')}</p>
                  )}
                </div>

                <p className="text-xs text-slate-500">
                  By submitting, you confirm that all information is accurate. Your profile will be reviewed before going live.
                </p>
              </div>
            )}

            <div className="flex gap-3 mt-8">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              )}
              {currentStep < 5 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </Button>
              )}
            </div>
          </form>
        </div>

        <p className="text-center text-slate-500 text-sm mt-4">
          Already registered?{' '}
          <button
            type="button"
            onClick={() => navigate('/professional-login')}
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
}

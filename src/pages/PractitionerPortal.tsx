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

// ... (Keep your PROFESSIONS, GOVERNING_BODIES, SA_CITIES, etc. constants exactly as they were)

export default function PractitionerPortal() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Form States
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

  // Helper functions (handlePhotoChange, addTag, removeTag, validateStep) 
  // remain unchanged from your original code.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true);

    try {
      // 1. CALL EDGE FUNCTION 
      // We send both 'apikey' and 'Authorization' to satisfy CORS preflight rules
      const createRes = await fetch(`${SUPABASE_URL}/functions/v1/create-practitioner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({ email, password }),
      });

      // Handle response from function
      const createData = await createRes.json();
      if (!createRes.ok) {
        throw new Error(createData.error || 'Failed to create account. This email might already be in use.');
      }

      const userId = createData.userId;
      if (!userId) throw new Error('Account creation failed. No user ID returned.');

      // 2. SIGN IN THE NEW USER
      // We need an active session to upload files and perform inserts
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      // 3. HANDLE PHOTO UPLOAD (If applicable)
      let photoUrl = null;
      if (photoFile) {
        try {
          photoUrl = await ProfessionalService.uploadPhoto(photoFile);
        } catch (uploadErr) {
          console.error("Photo upload failed:", uploadErr);
          toast.error('Photo upload failed, but we are continuing with your profile.');
        }
      }

      // 4. INSERT INTO PROFESSIONALS TABLE
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
        is_approved: false, // Default to false for review
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

      toast.success('Application submitted! Your profile is now under review.');
      navigate('/professional-dashboard');

    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.message || 'An unexpected error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... (Keep the entire JSX Return block exactly as it was, it was perfectly styled!)
  );
}
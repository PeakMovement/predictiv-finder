import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ProfessionalService } from '@/services/professional-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { toast } from 'sonner';

const PROFESSIONS = [
  'Physiotherapist',
  'Biokineticist',
  'Chiropractor',
  'GP',
  'Massage Therapist',
  'Dietician',
  'Sports Doctor',
  'Psychologist',
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
];

export default function ProfessionalSignup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [profession, setProfession] = useState('');
  const [specialities, setSpecialities] = useState<string[]>([]);
  const [customSpeciality, setCustomSpeciality] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [location, setLocation] = useState('');
  const [googleUrl, setGoogleUrl] = useState('');
  const [calendlyUrl, setCalendlyUrl] = useState('');

  const addSpeciality = (spec: string) => {
    if (specialities.length >= 7) {
      toast.error('Maximum 7 specialities allowed');
      return;
    }
    if (!specialities.includes(spec)) {
      setSpecialities([...specialities, spec]);
    }
  };

  const removeSpeciality = (spec: string) => {
    setSpecialities(specialities.filter(s => s !== spec));
  };

  const addCustomSpeciality = () => {
    if (customSpeciality.trim() && !specialities.includes(customSpeciality.trim())) {
      addSpeciality(customSpeciality.trim());
      setCustomSpeciality('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Sign up user
      await signUp(email, password);

      // Wait for auth session to be established
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create professional profile
      await ProfessionalService.createProfessional({
        user_id: (await supabase.auth.getUser()).data.user!.id,
        name,
        profession,
        specialities,
        price_min: priceMin ? parseInt(priceMin) : null,
        price_max: priceMax ? parseInt(priceMax) : null,
        location,
        google_reviews_url: googleUrl || null,
        calendly_url: calendlyUrl,
        photo_url: null,
      });

      toast.success('Account created successfully!');
      navigate('/professional-dashboard');
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-gradient-to-br from-[#0a0118] via-[#120024] to-[#1c0038] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-background/80 backdrop-blur-lg border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl">Professional Signup</CardTitle>
          <CardDescription>Join our network of healthcare professionals</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Auth Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Profile Fields */}
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="profession">Professional Type *</Label>
              <Select value={profession} onValueChange={setProfession} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select your profession" />
                </SelectTrigger>
                <SelectContent>
                  {PROFESSIONS.map((prof) => (
                    <SelectItem key={prof} value={prof}>
                      {prof}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Specialities (Max 7)</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {specialities.map((spec) => (
                  <Badge key={spec} variant="secondary" className="gap-1">
                    {spec}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeSpeciality(spec)}
                    />
                  </Badge>
                ))}
              </div>
              <Select onValueChange={addSpeciality}>
                <SelectTrigger>
                  <SelectValue placeholder="Add speciality" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_SPECIALITIES.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Custom speciality"
                  value={customSpeciality}
                  onChange={(e) => setCustomSpeciality(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSpeciality())}
                />
                <Button type="button" onClick={addCustomSpeciality} variant="outline">
                  Add
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priceMin">Min Price (R)</Label>
                <Input
                  id="priceMin"
                  type="number"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  placeholder="500"
                />
              </div>
              <div>
                <Label htmlFor="priceMax">Max Price (R)</Label>
                <Input
                  id="priceMax"
                  type="number"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  placeholder="1500"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location *</Label>
              <Select value={location} onValueChange={setLocation} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {SA_CITIES.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="calendlyUrl">Calendly Link *</Label>
              <Input
                id="calendlyUrl"
                type="url"
                value={calendlyUrl}
                onChange={(e) => setCalendlyUrl(e.target.value)}
                placeholder="https://calendly.com/yourname"
                required
              />
            </div>

            <div>
              <Label htmlFor="googleUrl">Google Business Profile URL (Optional)</Label>
              <Input
                id="googleUrl"
                type="url"
                value={googleUrl}
                onChange={(e) => setGoogleUrl(e.target.value)}
                placeholder="https://g.page/your-business"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Professional Account'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

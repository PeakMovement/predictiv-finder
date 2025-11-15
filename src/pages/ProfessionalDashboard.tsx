import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ProfessionalService } from '@/services/professional-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, X, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type Professional = Database['public']['Tables']['professionals']['Row'];

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

export default function ProfessionalDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [professional, setProfessional] = useState<Professional | null>(null);

  const [name, setName] = useState('');
  const [profession, setProfession] = useState('');
  const [specialities, setSpecialities] = useState<string[]>([]);
  const [customSpeciality, setCustomSpeciality] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [location, setLocation] = useState('');
  const [googleUrl, setGoogleUrl] = useState('');
  const [calendlyUrl, setCalendlyUrl] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/pro-login');
      return;
    }

    loadProfessional();
  }, [isAuthenticated, navigate]);

  const loadProfessional = async () => {
    try {
      const data = await ProfessionalService.getCurrentProfessional();
      if (!data) {
        toast.error('Professional profile not found');
        navigate('/professional-signup');
        return;
      }
      setProfessional(data);
      setName(data.name);
      setProfession(data.profession);
      setSpecialities(data.specialities || []);
      setPriceMin(data.price_min?.toString() || '');
      setPriceMax(data.price_max?.toString() || '');
      setLocation(data.location || '');
      setGoogleUrl(data.google_reviews_url || '');
      setCalendlyUrl(data.calendly_url);
    } catch (error) {
      console.error('Error loading professional:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

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

  const handleSave = async () => {
    setSaving(true);
    try {
      await ProfessionalService.updateProfessional({
        name,
        profession,
        specialities,
        price_min: priceMin ? parseInt(priceMin) : null,
        price_max: priceMax ? parseInt(priceMax) : null,
        location,
        google_reviews_url: googleUrl || null,
        calendly_url: calendlyUrl,
      });
      toast.success('Profile updated successfully!');
      loadProfessional();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/pro-login');
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0a0118] via-[#120024] to-[#1c0038]">
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-gradient-to-br from-[#0a0118] via-[#120024] to-[#1c0038] p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Professional Dashboard</h1>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Edit Profile Section */}
        <Card className="bg-background/80 backdrop-blur-lg border-primary/20">
          <CardHeader>
            <CardTitle>Edit My Profile</CardTitle>
            <CardDescription>Update your professional information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="profession">Professional Type *</Label>
              <Select value={profession} onValueChange={setProfession}>
                <SelectTrigger>
                  <SelectValue />
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
                />
              </div>
              <div>
                <Label htmlFor="priceMax">Max Price (R)</Label>
                <Input
                  id="priceMax"
                  type="number"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location *</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue />
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
              />
            </div>

            <div>
              <Label htmlFor="googleUrl">Google Business Profile URL</Label>
              <Input
                id="googleUrl"
                type="url"
                value={googleUrl}
                onChange={(e) => setGoogleUrl(e.target.value)}
              />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        {/* Calendly Section */}
        <Card className="bg-background/80 backdrop-blur-lg border-primary/20">
          <CardHeader>
            <CardTitle>My Calendly Link</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input value={calendlyUrl} readOnly />
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.open(calendlyUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* How Clients See You */}
        <Card className="bg-background/80 backdrop-blur-lg border-primary/20">
          <CardHeader>
            <CardTitle>How Clients Will Find Me</CardTitle>
            <CardDescription>This is how you appear in search results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Name</p>
              <p className="font-medium">{name}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground mb-1">Profession</p>
              <p className="font-medium">{profession}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground mb-1">Specialities</p>
              <div className="flex flex-wrap gap-2">
                {specialities.map((spec) => (
                  <Badge key={spec} variant="secondary">
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground mb-1">Price Range</p>
              <p className="font-medium">
                R{priceMin || '0'} - R{priceMax || '0'}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground mb-1">Location</p>
              <p className="font-medium">{location}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground mb-1">Rating Preview</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-2 text-sm text-muted-foreground">(Reviews coming soon)</span>
              </div>
            </div>
            {!professional?.is_approved && (
              <>
                <Separator />
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <p className="text-sm text-yellow-500">
                    ⚠️ Your profile is pending approval. It will be visible to clients once approved.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

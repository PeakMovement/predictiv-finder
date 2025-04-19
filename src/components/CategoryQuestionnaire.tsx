import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { ServiceCategory, DetailedUserCriteria } from '@/types';

interface CategoryQuestionnaireProps {
  categories: ServiceCategory[];
  onSubmit: (criteria: DetailedUserCriteria) => void;
  onBack: () => void;
}

export const CategoryQuestionnaire = ({ categories: selectedCategories, onSubmit, onBack }: CategoryQuestionnaireProps) => {
  const [budget, setBudget] = useState<number>(2000);
  const [budgetPreference, setBudgetPreference] = useState<'session' | 'monthly' | 'not-sure'>('not-sure');
  const [isFlexibleBudget, setIsFlexibleBudget] = useState(false);
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [location, setLocation] = useState<string>('');
  const [locationRadius, setLocationRadius] = useState<'exact' | 'nearby' | 'anywhere'>('anywhere');
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real application, you would use a service like Google Maps API
          // to reverse geocode the coordinates into a city or area name.
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          setLocation(`Lat: ${latitude.toFixed(2)}, Lng: ${longitude.toFixed(2)}`);
          setUseCurrentLocation(true);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Error getting location. Please enter manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const criteria: DetailedUserCriteria = {
      categories: selectedCategories,
      budget: {
        monthly: budget,
        preferredSetup: budgetPreference,
        flexibleBudget: isFlexibleBudget
      },
      mode: selectedModes,
      location: location || '',
      locationRadius: locationRadius,
    };
    
    onSubmit(criteria);
  };

  return (
    <div className="container max-w-3xl mx-auto py-8">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
        ← Back
      </Button>
      
      <h2 className="text-3xl font-bold mb-6">Tell us more about your needs</h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Budget Section */}
        <div className="space-y-4">
          <Label>What's your monthly budget for these services?</Label>
          <Input
            type="number"
            placeholder="Enter your budget"
            value={budget.toString()}
            onChange={(e) => setBudget(Number(e.target.value))}
          />
          
          <Select value={budgetPreference} onValueChange={(value: 'session' | 'monthly' | 'not-sure') => setBudgetPreference(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Budget Preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly Budget</SelectItem>
              <SelectItem value="session">Per Session</SelectItem>
              <SelectItem value="not-sure">Not Sure</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="flexible"
              checked={isFlexibleBudget}
              onCheckedChange={() => setIsFlexibleBudget(!isFlexibleBudget)}
            />
            <Label htmlFor="flexible">My budget is flexible</Label>
          </div>
        </div>
        
        {/* Consultation Mode Section */}
        <div className="space-y-4">
          <Label>Preferred Consultation Mode</Label>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="online"
                checked={selectedModes.includes('online')}
                onCheckedChange={() =>
                  setSelectedModes(prev =>
                    prev.includes('online')
                      ? prev.filter(mode => mode !== 'online')
                      : [...prev, 'online']
                  )
                }
              />
              <Label htmlFor="online">Online</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="in-person"
                checked={selectedModes.includes('in-person')}
                onCheckedChange={() =>
                  setSelectedModes(prev =>
                    prev.includes('in-person')
                      ? prev.filter(mode => mode !== 'in-person')
                      : [...prev, 'in-person']
                  )
                }
              />
              <Label htmlFor="in-person">In-Person</Label>
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="space-y-4">
          <Label>City or Area (Optional)</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter your location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleGetCurrentLocation}
              className="whitespace-nowrap"
            >
              📍 Current Location
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label>Location Preference</Label>
            <RadioGroup
              value={locationRadius}
              onValueChange={(value: 'exact' | 'nearby' | 'anywhere') => setLocationRadius(value)}
            >
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="anywhere" id="anywhere" />
                  <Label htmlFor="anywhere">Show all options (in-person & online)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nearby" id="nearby" />
                  <Label htmlFor="nearby">Prefer nearby but show all</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="exact" id="exact" />
                  <Label htmlFor="exact">Only show in my area</Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        </div>
        
        <Button type="submit" className="w-full">
          Find Professionals
        </Button>
      </form>
    </div>
  );
};

export default CategoryQuestionnaire;


import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StepIndicator } from "@/components/ui/step-indicator";
import { ServiceCategory, DetailedUserCriteria, ServiceMode, BudgetPreference } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChevronLeft, ChevronRight, MapPin, DollarSign, Calendar, Users } from 'lucide-react';

interface CategoryQuestionnaireProps {
  categories: ServiceCategory[];
  onSubmit: (criteria: DetailedUserCriteria) => void;
  onBack: () => void;
}

const STEPS = ['Budget Type', 'Budget Amount', 'Consultation', 'Location'];

export const CategoryQuestionnaire = ({ categories: selectedCategories, onSubmit, onBack }: CategoryQuestionnaireProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [budget, setBudget] = useState<number>(2000);
  const [budgetPreference, setBudgetPreference] = useState<BudgetPreference>('not-sure');
  const [isFlexibleBudget, setIsFlexibleBudget] = useState(false);
  const [selectedModes, setSelectedModes] = useState<ServiceMode[]>([]);
  const [location, setLocation] = useState<string>('');
  const [locationRadius, setLocationRadius] = useState<'exact' | 'nearby' | 'anywhere'>('anywhere');
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  
  const isMobile = useIsMobile();

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
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

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const handleSubmit = () => {
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

  const canProceed = () => {
    switch (currentStep) {
      case 0: return budgetPreference !== 'not-sure';
      case 1: return budget > 0;
      case 2: return selectedModes.length > 0;
      case 3: return true; // Location is optional
      default: return false;
    }
  };

  const getBudgetLabel = () => {
    switch (budgetPreference) {
      case 'current-problem': return 'What can you afford for your current problem?';
      case 'monthly-ongoing': return 'What can you afford to pay monthly?';
      default: return 'Enter your budget';
    }
  };

  const getBudgetPlaceholder = () => {
    switch (budgetPreference) {
      case 'current-problem': return 'Total budget for treatment';
      case 'monthly-ongoing': return 'Monthly budget';
      default: return 'Enter amount';
    }
  };

  const renderStepContent = () => {
    const containerClasses = isMobile 
      ? "px-4 py-6 space-y-6" 
      : "px-8 py-8 space-y-8";

    switch (currentStep) {
      case 0:
        return (
          <Card className={containerClasses}>
            <CardHeader className="text-center">
              <DollarSign className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle className={isMobile ? "text-xl" : "text-2xl"}>
                How would you prefer to budget for your health services?
              </CardTitle>
              <CardDescription className={isMobile ? "text-sm" : "text-base"}>
                Choose the option that best fits your financial planning
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup 
                value={budgetPreference} 
                onValueChange={(value: BudgetPreference) => setBudgetPreference(value)}
                className="space-y-4"
              >
                <div 
                  className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}
                >
                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      budgetPreference === 'current-problem' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setBudgetPreference('current-problem')}
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem
                        value="current-problem"
                        id="current-problem"
                      />
                      <div>
                        <Label htmlFor="current-problem" className="font-medium cursor-pointer">
                          What I can afford for my current problem
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          One-time payment to address your specific health concern
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      budgetPreference === 'monthly-ongoing' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setBudgetPreference('monthly-ongoing')}
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem
                        value="monthly-ongoing"
                        id="monthly-ongoing"
                      />
                      <div>
                        <Label htmlFor="monthly-ongoing" className="font-medium cursor-pointer">
                          What I can afford to pay monthly
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Ongoing monthly budget for continuous health support
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card className={containerClasses}>
            <CardHeader className="text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle className={isMobile ? "text-xl" : "text-2xl"}>
                {getBudgetLabel()}
              </CardTitle>
              <CardDescription className={isMobile ? "text-sm" : "text-base"}>
                {budgetPreference === 'current-problem' 
                  ? "This will be used to find the best treatment plan within your budget"
                  : "This helps us recommend ongoing services that fit your monthly budget"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-medium">{getBudgetLabel()}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    R
                  </span>
                  <Input
                    type="number"
                    placeholder={getBudgetPlaceholder()}
                    value={budget.toString()}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="pl-8 text-lg"
                    min="0"
                    step="100"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="flexible"
                    checked={isFlexibleBudget}
                    onCheckedChange={(checked) => setIsFlexibleBudget(!!checked)}
                  />
                  <Label htmlFor="flexible" className="text-sm">
                    My budget is flexible - I'm open to slightly higher costs for better outcomes
                  </Label>
                </div>
              </div>
              
              {budget > 0 && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {budgetPreference === 'current-problem' 
                      ? `With R${budget.toLocaleString()}, you can typically access ${budget < 2000 ? '1-2' : budget < 5000 ? '2-4' : '4+'} professional services to address your health concern.`
                      : `With R${budget.toLocaleString()} monthly, you can maintain ongoing support from ${budget < 1500 ? '1' : budget < 3000 ? '1-2' : '2+'} health professionals.`
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className={containerClasses}>
            <CardHeader className="text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle className={isMobile ? "text-xl" : "text-2xl"}>
                How would you prefer to consult with professionals?
              </CardTitle>
              <CardDescription className={isMobile ? "text-sm" : "text-base"}>
                Choose all options that work for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
                {[
                  { 
                    mode: 'online' as ServiceMode, 
                    title: 'Online Consultations', 
                    description: 'Video calls, phone calls, and messaging'
                  },
                  { 
                    mode: 'in-person' as ServiceMode, 
                    title: 'In-Person Visits', 
                    description: 'Face-to-face consultations at clinics'
                  },
                  { 
                    mode: 'both' as ServiceMode, 
                    title: 'Both Options', 
                    description: 'Flexible between online and in-person'
                  }
                ].map(({ mode, title, description }) => (
                  <div 
                    key={mode}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedModes.includes(mode) 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() =>
                      setSelectedModes(prev =>
                        prev.includes(mode)
                          ? prev.filter(m => m !== mode)
                          : [...prev, mode]
                      )
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedModes.includes(mode)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedModes(prev => [...prev, mode]);
                          } else {
                            setSelectedModes(prev => prev.filter(m => m !== mode));
                          }
                        }}
                      />
                      <div>
                        <Label className="font-medium cursor-pointer">
                          {title}
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className={containerClasses}>
            <CardHeader className="text-center">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle className={isMobile ? "text-xl" : "text-2xl"}>
                Where are you located?
              </CardTitle>
              <CardDescription className={isMobile ? "text-sm" : "text-base"}>
                This helps us find nearby professionals (optional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>City or Area</Label>
                <div className={`flex gap-2 ${isMobile ? 'flex-col' : 'flex-row'}`}>
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
                    className={`whitespace-nowrap ${isMobile ? 'w-full' : ''}`}
                  >
                    📍 Use Current Location
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <Label>Location Preference</Label>
                  <RadioGroup
                    value={locationRadius}
                    onValueChange={(value: 'exact' | 'nearby' | 'anywhere') => setLocationRadius(value)}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="anywhere" id="anywhere" />
                      <Label htmlFor="anywhere" className="cursor-pointer">
                        Show all options (online & in-person)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nearby" id="nearby" />
                      <Label htmlFor="nearby" className="cursor-pointer">
                        Prefer nearby but show all options
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="exact" id="exact" />
                      <Label htmlFor="exact" className="cursor-pointer">
                        Only show professionals in my area
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-background ${isMobile ? 'px-4 py-6' : 'px-8 py-8'}`}>
      <div className="container max-w-4xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handlePrevious}
            className="mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          
          <StepIndicator 
            steps={STEPS} 
            currentStep={currentStep}
            className={isMobile ? "px-2" : "px-4"}
          />
        </div>
        
        <div className="mb-8">
          <h2 className={`font-bold text-center mb-2 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
            Tell us more about your needs
          </h2>
          <p className={`text-muted-foreground text-center ${isMobile ? 'text-sm' : 'text-base'}`}>
            Step {currentStep + 1} of {STEPS.length}
          </p>
        </div>
        
        <div className="mb-8">
          {renderStepContent()}
        </div>
        
        <div className={`flex gap-4 ${isMobile ? 'flex-col' : 'justify-between'}`}>
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            className={isMobile ? 'w-full' : 'w-32'}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          
          <Button 
            onClick={handleNext}
            disabled={!canProceed()}
            className={isMobile ? 'w-full' : 'w-32'}
          >
            {currentStep === STEPS.length - 1 ? 'Find Professionals' : 'Next'}
            {currentStep < STEPS.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CategoryQuestionnaire;

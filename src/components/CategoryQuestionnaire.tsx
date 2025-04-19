
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion } from 'framer-motion';
import { ServiceCategory, ServiceMode, DetailedUserCriteria, FitnessLevel } from '@/types';
import { GOALS_BY_CATEGORY } from '@/data/mockData';

interface CategoryQuestionnaireProps {
  categories: ServiceCategory[];
  onSubmit: (criteria: DetailedUserCriteria) => void;
  onBack: () => void;
}

export const CategoryQuestionnaire = ({ 
  categories, 
  onSubmit,
  onBack 
}: CategoryQuestionnaireProps) => {
  const [budget, setBudget] = useState<{
    monthly: number;
    preferredSetup: 'once-off' | 'monthly' | 'not-sure';
    flexibleBudget: boolean;
  }>({
    monthly: 500,
    preferredSetup: 'not-sure',
    flexibleBudget: false
  });
  
  const [location, setLocation] = useState<string>('');
  const [locationRadius, setLocationRadius] = useState<'exact' | 'nearby' | 'anywhere'>('nearby');
  const [modes, setModes] = useState<ServiceMode[]>([]);
  const [fitnessInfo, setFitnessInfo] = useState<{
    level: FitnessLevel;
    goal: string;
    injuries: string;
    trainingStyle: string;
  }>({
    level: 'beginner',
    goal: '',
    injuries: '',
    trainingStyle: ''
  });

  const handleModeToggle = (mode: ServiceMode) => {
    setModes(prev => prev.includes(mode) ? prev.filter(m => m !== mode) : [...prev, mode]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const criteria: DetailedUserCriteria = {
      categories,
      budget,
      location,
      locationRadius,
      mode: modes,
      fitness: fitnessInfo
    };
    onSubmit(criteria);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-3xl mx-auto"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack} 
            className="mr-2"
          >
            ←
          </Button>
          <h2 className="text-2xl font-semibold">Tell us about your needs</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>What's your fitness level?</Label>
            <Select 
              value={fitnessInfo.level} 
              onValueChange={(value: FitnessLevel) => 
                setFitnessInfo({...fitnessInfo, level: value})
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your fitness level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="budget">Monthly Budget (R{budget.monthly})</Label>
            <Slider
              defaultValue={[500]}
              max={2000}
              min={100}
              step={50}
              onValueChange={(values) => setBudget({...budget, monthly: values[0]})}
              className="py-4"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>R100</span>
              <span>R1000</span>
              <span>R2000</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Preferred payment setup</Label>
            <Select 
              value={budget.preferredSetup} 
              onValueChange={(value: 'once-off' | 'monthly' | 'not-sure') => 
                setBudget({...budget, preferredSetup: value})
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment setup" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="once-off">Once-off</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="not-sure">Not sure yet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Where are you located?</Label>
            <Input
              id="location"
              placeholder="City or area"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
            
            <div className="mt-3">
              <Label className="mb-2 block">Search radius</Label>
              <RadioGroup 
                value={locationRadius} 
                onValueChange={(value: 'exact' | 'nearby' | 'anywhere') => setLocationRadius(value)}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="exact" id="r1" />
                  <Label htmlFor="r1" className="cursor-pointer">Exact location only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nearby" id="r2" />
                  <Label htmlFor="r2" className="cursor-pointer">Include nearby areas (default)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="anywhere" id="r3" />
                  <Label htmlFor="r3" className="cursor-pointer">Show all professionals</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Would you prefer:</Label>
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="online"
                  checked={modes.includes('online')}
                  onCheckedChange={() => handleModeToggle('online')}
                />
                <label
                  htmlFor="online"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Online
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="in-person"
                  checked={modes.includes('in-person')}
                  onCheckedChange={() => handleModeToggle('in-person')}
                />
                <label
                  htmlFor="in-person"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  In-person
                </label>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <Button type="submit" className="w-full bg-health-purple hover:bg-health-purple-dark">
              Find Matching Professionals
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default CategoryQuestionnaire;

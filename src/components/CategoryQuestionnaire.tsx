
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';
import { ServiceCategory, ServiceMode, DetailedUserCriteria } from '@/types';
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
  const [budget, setBudget] = useState({
    monthly: 500,
    preferredSetup: 'not-sure' as const,
    flexibleBudget: false
  });
  const [location, setLocation] = useState<string>('');
  const [modes, setModes] = useState<ServiceMode[]>([]);
  const [fitnessInfo, setFitnessInfo] = useState({
    level: 'beginner' as const,
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
              onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => 
                setFitnessInfo(prev => ({ ...prev, level: value }))
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
              onValueChange={(values) => setBudget(prev => ({ ...prev, monthly: values[0] }))}
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
                setBudget(prev => ({ ...prev, preferredSetup: value }))
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

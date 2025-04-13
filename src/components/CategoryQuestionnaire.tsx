
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';
import { ServiceCategory, ServiceMode, UserCriteria } from '@/types';
import { GOALS_BY_CATEGORY } from '@/data/mockData';

interface CategoryQuestionnaireProps {
  category: ServiceCategory;
  onSubmit: (criteria: UserCriteria) => void;
  onBack: () => void;
}

export const CategoryQuestionnaire = ({ 
  category, 
  onSubmit,
  onBack 
}: CategoryQuestionnaireProps) => {
  const [goal, setGoal] = useState<string>('');
  const [budget, setBudget] = useState<number>(500);
  const [location, setLocation] = useState<string>('');
  const [modes, setModes] = useState<ServiceMode[]>([]);

  const handleModeToggle = (mode: ServiceMode) => {
    if (modes.includes(mode)) {
      setModes(modes.filter(m => m !== mode));
    } else {
      setModes([...modes, mode]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      category,
      goal,
      budget,
      location,
      mode: modes
    });
  };

  const goals = GOALS_BY_CATEGORY[category] || [];
  const categoryName = category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ');

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
          <h2 className="text-2xl font-semibold">Tell us about your {categoryName} needs</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="goal">What's your main goal?</Label>
            <Select value={goal} onValueChange={setGoal} required>
              <SelectTrigger id="goal">
                <SelectValue placeholder="Select your goal" />
              </SelectTrigger>
              <SelectContent>
                {goals.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="budget">What's your budget? (R{budget})</Label>
            <Slider
              id="budget"
              defaultValue={[500]}
              max={2000}
              min={100}
              step={50}
              onValueChange={(values) => setBudget(values[0])}
              className="py-4"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>R100</span>
              <span>R1000</span>
              <span>R2000</span>
            </div>
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
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="both"
                  checked={modes.includes('both')}
                  onCheckedChange={() => handleModeToggle('both')}
                />
                <label
                  htmlFor="both"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Both
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


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import UtilityModelExplanation from './UtilityModelExplanation';
import { generateUtilityBasedPlan } from '@/utils/planGenerator/planGenerator/utilityBasedPlanGenerator';
import { ServiceCategory } from '@/utils/planGenerator/types';
import { treatmentOptions } from '@/utils/planGenerator/data/treatmentOptions';

const timeOfDayOptions = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
];

const dayOptions = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'weekend', label: 'Weekend' },
];

// Get unique locations from the treatment data
const uniqueLocations = Array.from(
  new Set(treatmentOptions.map(t => t.location))
).filter(loc => loc.toLowerCase() !== 'online');

// Get unique categories from the treatment data
const uniqueCategories = Array.from(
  new Set(treatmentOptions.map(t => t.category))
);

export const EnhancedPlanOptimizer: React.FC = () => {
  const [budget, setBudget] = useState<number>(5000);
  const [timeAvailable, setTimeAvailable] = useState<number>(600); // 10 hours in minutes
  const [location, setLocation] = useState<string>('');
  const [preferOnline, setPreferOnline] = useState<boolean>(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | ''>('');
  const [medicalCondition, setMedicalCondition] = useState<string>('');
  const [goal, setGoal] = useState<string>('');
  const [urgency, setUrgency] = useState<number>(5);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [plan, setPlan] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [explanationExpanded, setExplanationExpanded] = useState<boolean>(false);

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const generatePlan = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      // Convert selected categories to service types
      const serviceTypes = uniqueCategories.map(cat => {
        // Find the first treatment option with this category to get its serviceType
        const treatment = treatmentOptions.find(t => t.category === cat);
        return treatment?.serviceType as ServiceCategory;
      }).filter(Boolean);
      
      const result = generateUtilityBasedPlan({
        medicalConditions: [medicalCondition || 'general health'],
        serviceTypes,
        budget,
        timeAvailability: timeAvailable,
        goal,
        urgency,
        location,
        preferOnline,
        availableDays: selectedDays,
        timeOfDay: timeOfDay as any,
        useRealTreatmentData: true // Use the real treatment data
      });
      
      console.log("Generated plan:", result);
      setPlan(result);
    } catch (error) {
      console.error("Error generating plan:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3 space-y-6">
          <Card className="p-4 space-y-4">
            <h2 className="text-lg font-semibold">Plan Parameters</h2>
            <Separator />
            
            <div className="space-y-4">
              <div>
                <Label>Budget (R)</Label>
                <Input 
                  type="number"
                  value={budget}
                  onChange={e => setBudget(Number(e.target.value))}
                  min={0}
                />
              </div>
              
              <div>
                <Label>Available Time (minutes/month)</Label>
                <Input 
                  type="number"
                  value={timeAvailable}
                  onChange={e => setTimeAvailable(Number(e.target.value))}
                  min={0}
                />
              </div>
              
              <div>
                <Label>Medical Condition</Label>
                <Select 
                  value={medicalCondition} 
                  onValueChange={setMedicalCondition}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Goal</Label>
                <Input 
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                  placeholder="e.g. reduce back pain, lose weight"
                />
              </div>
              
              <div>
                <Label>Urgency (1-10)</Label>
                <Input 
                  type="number"
                  value={urgency}
                  onChange={e => setUrgency(Number(e.target.value))}
                  min={1}
                  max={10}
                />
              </div>
            </div>
          </Card>
          
          <UtilityModelExplanation 
            expanded={explanationExpanded} 
            onToggleExpand={() => setExplanationExpanded(!explanationExpanded)}
          />
        </div>
        
        <div className="w-full md:w-1/3 space-y-6">
          <Card className="p-4 space-y-4">
            <h2 className="text-lg font-semibold">Location & Availability</h2>
            <Separator />
            
            <div className="space-y-4">
              <div>
                <Label>Location</Label>
                <Select 
                  value={location} 
                  onValueChange={setLocation}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any location</SelectItem>
                    {uniqueLocations.map(loc => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="preferOnline" 
                  checked={preferOnline} 
                  onCheckedChange={checked => setPreferOnline(!!checked)} 
                />
                <label
                  htmlFor="preferOnline"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Prefer online/remote sessions
                </label>
              </div>
              
              <div>
                <Label className="mb-2 block">Available Days</Label>
                <div className="grid grid-cols-2 gap-2">
                  {dayOptions.map(day => (
                    <div key={day.value} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`day-${day.value}`} 
                        checked={selectedDays.includes(day.value)} 
                        onCheckedChange={() => handleDayToggle(day.value)} 
                      />
                      <label
                        htmlFor={`day-${day.value}`}
                        className="text-sm font-medium leading-none"
                      >
                        {day.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label>Preferred Time</Label>
                <Select 
                  value={timeOfDay} 
                  onValueChange={setTimeOfDay as any}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time of day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any time</SelectItem>
                    {timeOfDayOptions.map(time => (
                      <SelectItem key={time.value} value={time.value}>
                        {time.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={generatePlan} 
                className="w-full"
                disabled={isGenerating}
              >
                {isGenerating ? "Generating..." : "Generate Optimized Plan"}
              </Button>
              
              {error && (
                <div className="text-red-500 text-sm">
                  {error}
                </div>
              )}
            </div>
          </Card>
        </div>
        
        <div className="w-full md:w-1/3">
          {plan ? (
            <Card className="p-4 space-y-4 h-full overflow-y-auto">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">{plan.name}</h2>
                <div className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                  {plan.planType}
                </div>
              </div>
              
              <p className="text-sm text-gray-600">{plan.description}</p>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-2">Recommended Services</h3>
                <div className="space-y-3">
                  {plan.services.map((service: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-2 rounded">
                      <div className="flex justify-between">
                        <span className="font-medium">{service.type.replace(/-/g, ' ')}</span>
                        <span>{service.sessions} sessions</span>
                      </div>
                      <div className="text-sm text-gray-600">{service.description}</div>
                      <div className="text-sm mt-1">
                        <span className="text-green-600 font-medium">R{service.price} per session</span>
                        {service.frequency && (
                          <span className="mx-2 text-gray-400">|</span>
                        )}
                        {service.frequency && (
                          <span className="text-blue-600">{service.frequency}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm text-gray-500">Total Cost</h4>
                  <p className="font-semibold">R{plan.totalCost}</p>
                </div>
                
                <div>
                  <h4 className="text-sm text-gray-500">Time Required</h4>
                  <p className="font-semibold">{(plan.timeRequiredMinutes / 60).toFixed(1)} hours/month</p>
                </div>
                
                <div>
                  <h4 className="text-sm text-gray-500">Utility Score</h4>
                  <p className="font-semibold">{plan.utilityScore?.toFixed(1) || 'N/A'}</p>
                </div>
                
                <div>
                  <h4 className="text-sm text-gray-500">Expected Timeline</h4>
                  <p className="font-semibold">{plan.expectedTimeToResults || plan.timeFrame}</p>
                </div>
              </div>
              
              {plan.optimizationNotes && plan.optimizationNotes.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-medium mb-2">Notes</h3>
                    <ul className="text-sm space-y-1">
                      {plan.optimizationNotes.map((note: string, index: number) => (
                        <li key={index} className="text-gray-600">• {note}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
              
              {plan.availabilityNotes && plan.availabilityNotes.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Availability Notes</h3>
                  <ul className="text-sm space-y-1">
                    {plan.availabilityNotes.map((note: string, index: number) => (
                      <li key={index} className="text-amber-600">• {note}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {plan.sessionBreakdown && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-medium mb-2">Session Breakdown</h3>
                    <div className="flex space-x-4">
                      <div>
                        <span className="text-sm text-gray-500">In-Person:</span> 
                        <span className="ml-1 font-medium">{plan.sessionBreakdown.inPerson} sessions</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Remote:</span> 
                        <span className="ml-1 font-medium">{plan.sessionBreakdown.remote} sessions</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </Card>
          ) : (
            <Card className="p-4 h-full flex items-center justify-center bg-gray-50">
              <div className="text-center text-gray-500">
                <p>Enter your preferences and generate a plan</p>
                <p className="text-sm mt-2">Your optimized health plan will appear here</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedPlanOptimizer;

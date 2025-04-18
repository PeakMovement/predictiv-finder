import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Slider
} from '@/components/ui/slider';
import { Check, Filter, MapPin, AlertCircle, Video, DollarSign } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Practitioner, UserCriteria } from '@/types';
import PractitionerCard from './PractitionerCard';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { PRACTITIONERS } from '@/data/mockData';

interface PractitionerListProps {
  practitioners: Practitioner[];
  criteria: UserCriteria;
  onSelectPractitioner: (practitioner: Practitioner) => void;
  onBack: () => void;
  onAIAssistant: () => void;
}

type FilterOption = 'distance' | 'price' | 'rating' | 'availability';
type GoalOption = 'pain-relief' | 'fitness' | 'nutrition' | 'rehabilitation' | 'wellness' | 'performance' | 'mental-health';

interface PractitionerWithMatchScore extends Practitioner {
  matchScore: number;
  reasons: string[];
}

export const PractitionerList = ({ 
  practitioners, 
  criteria, 
  onSelectPractitioner,
  onBack,
  onAIAssistant
}: PractitionerListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [selectedGoals, setSelectedGoals] = useState<GoalOption[]>([]);
  const [activeFilters, setActiveFilters] = useState<FilterOption[]>([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [practitionersWithScores, setPractitionersWithScores] = useState<PractitionerWithMatchScore[]>([]);
  const [showAllProfessionals, setShowAllProfessionals] = useState(false);
  const [expandedSearchCriteria, setExpandedSearchCriteria] = useState(false);

  const { toast } = useToast();
  
  const goalOptions: Record<GoalOption, string> = {
    'pain-relief': 'Pain Relief',
    'fitness': 'Fitness & Exercise',
    'nutrition': 'Nutrition & Diet',
    'rehabilitation': 'Injury Rehabilitation',
    'wellness': 'General Wellness',
    'performance': 'Sports Performance',
    'mental-health': 'Mental Health'
  };

  const scoreAllPractitioners = () => {
    const allProfessionals = showAllProfessionals ? PRACTITIONERS : practitioners;
    
    const scoredPractitioners = allProfessionals.map(practitioner => {
      let score = 100;
      const reasons: string[] = [];
      
      if (criteria.budget && criteria.budget.monthly) {
        const budgetDifference = practitioner.pricePerSession - criteria.budget.monthly;
        const percentageDifference = (budgetDifference / criteria.budget.monthly) * 100;
        
        if (percentageDifference > 50) {
          score -= 20;
          reasons.push(`Slightly above budget (R${Math.round(budgetDifference)} more)`);
        } else if (percentageDifference > 25) {
          score -= 10;
          reasons.push(`Within extended budget range`);
        }
      }
      
      if (criteria.location) {
        const locationMatch = practitioner.location.toLowerCase().includes(criteria.location.toLowerCase());
        if (!locationMatch) {
          score -= 15;
          reasons.push(`Alternative location option`);
        }
      }
      
      if (criteria.categories && criteria.categories.length > 0) {
        const serviceTypeMatch = criteria.categories.some(cat => 
          practitioner.serviceType.toLowerCase().includes(cat.toLowerCase())
        );
        if (!serviceTypeMatch) {
          score -= 20;
          reasons.push(`Related professional type`);
        }
      }
      
      if (criteria.mode) {
        const onlineMatch = criteria.mode.includes('online') && practitioner.isOnline;
        const inPersonMatch = criteria.mode.includes('in-person') && !practitioner.isOnline;
        
        if (!onlineMatch && !inPersonMatch) {
          score -= 10;
          reasons.push(`Alternative consultation method`);
        }
      }
      
      return {
        ...practitioner,
        matchScore: Math.max(0, score),
        reasons
      };
    });
    
    scoredPractitioners.sort((a, b) => b.matchScore - a.matchScore);
    setPractitionersWithScores(scoredPractitioners);
  };

  useEffect(() => {
    scoreAllPractitioners();
  }, [practitioners, criteria, priceRange, showAllProfessionals]);

  const filteredPractitioners = practitionersWithScores.filter(p => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      p.name.toLowerCase().includes(searchLower) ||
      p.serviceTags.some(tag => tag.toLowerCase().includes(searchLower)) ||
      p.location.toLowerCase().includes(searchLower) ||
      p.serviceType.toLowerCase().includes(searchLower);
    
    const matchesPrice = expandedSearchCriteria 
      ? true 
      : (p.pricePerSession >= priceRange[0] && p.pricePerSession <= priceRange[1]);
    
    return matchesSearch && matchesPrice;
  });

  const handleToggleGoal = (goal: GoalOption) => {
    setSelectedGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal) 
        : [...prev, goal]
    );
  };

  const handleToggleFilter = (filter: FilterOption) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter) 
        : [...prev, filter]
    );
  };

  const expandSearchOptions = () => {
    setExpandedSearchCriteria(true);
    const currentMax = priceRange[1];
    const newMax = Math.floor(currentMax * 1.5);
    setPriceRange([priceRange[0], newMax]);
    
    toast({
      title: "Search range expanded",
      description: `We've increased your maximum price to R${newMax} and are showing professionals from all categories.`,
      variant: "default",
    });
    
    setShowAllProfessionals(true);
  };

  const suggestOnlineOptions = () => {
    setExpandedSearchCriteria(true);
    toast({
      title: "Showing online options",
      description: "Online consultations are often more affordable and accessible. We've highlighted these for you.",
      variant: "default",
    });
    
    setShowAllProfessionals(true);
  };

  const includeNearbyLocations = () => {
    setExpandedSearchCriteria(true);
    toast({
      title: "Search area expanded",
      description: "We've expanded your search to include nearby locations and all professional types.",
      variant: "default",
    });
    
    setShowAllProfessionals(true);
  };

  const showAllOptions = () => {
    setExpandedSearchCriteria(true);
    setShowAllProfessionals(true);
    
    toast({
      title: "Showing all professionals",
      description: "We're now showing all professionals regardless of category, location, or price range.",
      variant: "default",
    });
  };

  const resetFilters = () => {
    setSearchQuery('');
    setExpandedSearchCriteria(false);
    setShowAllProfessionals(false);
    setPriceRange([0, 2000]);
    setSelectedGoals([]);
    setActiveFilters([]);
    
    toast({
      title: "Filters reset",
      description: "We've reset all filters to show options based on your original criteria.",
      variant: "default",
    });
    
    scoreAllPractitioners();
  };

  const categoryName = criteria.categories && criteria.categories.length > 0
    ? criteria.categories[0].charAt(0).toUpperCase() + criteria.categories[0].slice(1).replace('-', ' ')
    : 'Health';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full"
    >
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack} 
              className="mr-2"
            >
              ←
            </Button>
            <h2 className="text-2xl font-semibold">
              {showAllProfessionals ? 'Health Professionals' : `${categoryName} Professionals`}
            </h2>
          </div>
          
          <Button 
            variant="outline" 
            onClick={onAIAssistant}
            className="flex items-center gap-2 border-health-purple text-health-purple hover:bg-health-purple/10"
          >
            <span className="text-lg">🧠</span>
            <span>Build AI Plan</span>
          </Button>
        </div>
        
        <div className="flex items-center justify-between flex-wrap gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex flex-wrap gap-2">
            {expandedSearchCriteria && (
              <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                <span>Expanded search</span>
              </div>
            )}
            {criteria.goal && (
              <div className="bg-health-teal/20 text-health-teal-dark px-3 py-1 rounded-full text-sm">
                Goal: {criteria.goal}
              </div>
            )}
            {criteria.budget && (
              <div className="bg-health-purple/20 text-health-purple-dark px-3 py-1 rounded-full text-sm">
                Budget: R{criteria.budget.monthly}
              </div>
            )}
            {criteria.location && (
              <div className="bg-health-orange/20 text-health-orange-dark px-3 py-1 rounded-full text-sm">
                Location: {criteria.location}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Input
              placeholder="Search by name, specialty, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64"
            />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setShowFilterPanel(prev => !prev)}
                  >
                    <span>Price Range (R{priceRange[0]} - R{priceRange[1]})</span>
                    {activeFilters.includes('price') && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => handleToggleFilter('rating')}
                  >
                    <span>Top Rated</span>
                    {activeFilters.includes('rating') && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => handleToggleFilter('distance')}
                  >
                    <span>Nearest First</span>
                    {activeFilters.includes('distance') && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Health Goals</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {(Object.keys(goalOptions) as GoalOption[]).map(goal => (
                    <DropdownMenuItem
                      key={goal}
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => handleToggleGoal(goal)}
                    >
                      <span>{goalOptions[goal]}</span>
                      {selectedGoals.includes(goal) && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
                {expandedSearchCriteria && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="flex items-center justify-between cursor-pointer text-red-500"
                      onClick={resetFilters}
                    >
                      <span>Reset All Filters</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {showFilterPanel && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">Price Range (per session)</label>
                <span className="text-sm text-gray-600">R{priceRange[0]} - R{priceRange[1]}</span>
              </div>
              <Slider 
                defaultValue={[priceRange[0], priceRange[1]]} 
                min={0} 
                max={2000} 
                step={50}
                onValueChange={(value: [number, number]) => setPriceRange(value)}
                className="py-4"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {selectedGoals.map(goal => (
                <Badge 
                  key={goal}
                  variant="outline"
                  className="bg-health-purple/10 text-health-purple hover:bg-health-purple/20"
                >
                  {goalOptions[goal]}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 hover:bg-transparent"
                    onClick={() => handleToggleGoal(goal)}
                  >
                    ×
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {filteredPractitioners.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPractitioners.map(practitioner => (
              <PractitionerCard 
                key={practitioner.id} 
                practitioner={practitioner} 
                onSelect={onSelectPractitioner}
                matchScore={practitioner.matchScore}
                matchReasons={practitioner.reasons}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-3 mb-4 text-amber-600">
              <AlertCircle className="h-6 w-6" />
              <h3 className="text-lg font-medium">No exact matches found</h3>
            </div>
            
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              We couldn't find professionals that perfectly match your criteria, but we have several options to help you find suitable alternatives.
            </p>
            
            <div className="space-y-4 mt-2 mb-6">
              <div className="p-4 bg-white dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-health-purple" />
                  <span>Expand Your Search Area</span>
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Broaden your search to include professionals from nearby areas.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-health-purple border-health-purple/50"
                  onClick={includeNearbyLocations}
                >
                  Include Nearby Locations
                </Button>
              </div>
              
              <div className="p-4 bg-white dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Video className="h-4 w-4 text-health-teal" />
                  <span>Consider Online Options</span>
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Virtual consultations are often more accessible and can be more affordable.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-health-teal border-health-teal/50"
                  onClick={suggestOnlineOptions}
                >
                  Show Online Practitioners
                </Button>
              </div>
              
              <div className="p-4 bg-white dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-health-orange" />
                  <span>Adjust Your Budget Range</span>
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {criteria.budget?.monthly 
                    ? `Your current budget is R${criteria.budget.monthly}. Increasing it slightly may open up more options.`
                    : 'Adjusting your budget range can help you find more matching professionals.'}
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-health-orange border-health-orange/50"
                  onClick={expandSearchOptions}
                >
                  Increase Budget Range
                </Button>
              </div>
              
              <div className="p-4 bg-white dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>See All Available Professionals</span>
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  View all professionals regardless of exact match to your criteria.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-green-600 border-green-600/50"
                  onClick={showAllOptions}
                >
                  Show All Professionals
                </Button>
              </div>
            </div>
            
            <div className="bg-health-purple/10 p-4 rounded-lg mb-4">
              <h3 className="font-medium mb-2 text-health-purple">Get a Custom AI Plan Instead</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Our AI can create a personalized health plan that combines various services to fit your exact needs and budget.
              </p>
              <Button 
                className="w-full bg-health-purple hover:bg-health-purple-dark"
                onClick={onAIAssistant}
              >
                Create AI Wellness Plan
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PractitionerList;

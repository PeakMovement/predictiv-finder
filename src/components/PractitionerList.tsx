
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
import { PractitionerCard } from './PractitionerCard';
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

  // Immediately show all professionals if locationRadius is 'anywhere'
  useEffect(() => {
    if (criteria.locationRadius === 'anywhere') {
      setShowAllProfessionals(true);
    }
  }, [criteria]);

  const scoreAllPractitioners = () => {
    // Always show all professionals, but score them differently
    const allProfessionals = PRACTITIONERS;
    
    const scoredPractitioners = allProfessionals.map(practitioner => {
      let score = 100;
      const reasons: string[] = [];
      
      // BUDGET SCORING - Less strict
      if (criteria.budget && criteria.budget.monthly) {
        const budgetDifference = practitioner.pricePerSession - criteria.budget.monthly;
        
        // Apply a more forgiving penalty for budget
        if (budgetDifference > 0) {
          // If over budget, apply a smaller penalty
          const percentageOver = (budgetDifference / criteria.budget.monthly) * 100;
          
          if (percentageOver > 50) {
            score -= 15; // Reduced from 20
            reasons.push(`Above budget (R${Math.round(budgetDifference)} more)`);
          } else if (percentageOver > 25) {
            score -= 5; // Reduced from 10
            reasons.push(`Slightly above budget`);
          } else {
            // Within 25% of budget - no penalty
            reasons.push(`Within budget range`);
          }
        } else {
          // Under budget is good
          reasons.push(`Within your budget`);
        }
      }
      
      // LOCATION SCORING - Based on radius setting
      if (criteria.location && criteria.location.length > 0) {
        const locationMatch = practitioner.location.toLowerCase().includes(criteria.location.toLowerCase());
        
        if (!locationMatch) {
          // Check the locationRadius setting
          if (criteria.locationRadius === 'exact') {
            score -= 25; // Much higher penalty for exact match requirement
            reasons.push(`Different location`);
          } else if (criteria.locationRadius === 'nearby') {
            score -= 10; // Lower penalty for nearby
            reasons.push(`Alternative location`);
          } else {
            // 'anywhere' - very minor penalty
            score -= 5;
            reasons.push(`Location available`);
          }
        } else {
          reasons.push(`In your location`);
        }
      }
      
      // CATEGORY SCORING - Less strict
      if (criteria.categories && criteria.categories.length > 0) {
        const categoryMatch = criteria.categories.some(cat => 
          practitioner.serviceType.toLowerCase() === cat.toLowerCase()
        );
        
        const relatedCategoryMatch = criteria.categories.some(cat => {
          // Define related categories (e.g., personal-trainer and biokineticist are related)
          if (cat === 'personal-trainer' && 
              (practitioner.serviceType === 'biokineticist' || practitioner.serviceType === 'coaching')) {
            return true;
          }
          if (cat === 'biokineticist' && 
              (practitioner.serviceType === 'personal-trainer' || practitioner.serviceType === 'coaching')) {
            return true;
          }
          if (cat === 'coaching' && 
              (practitioner.serviceType === 'personal-trainer' || practitioner.serviceType === 'biokineticist')) {
            return true;
          }
          return false;
        });
        
        if (!categoryMatch) {
          if (relatedCategoryMatch) {
            score -= 10; // Smaller penalty for related category
            reasons.push(`Related professional type`);
          } else {
            score -= 15; // Reduced from 20
            reasons.push(`Different professional type`);
          }
        } else {
          reasons.push(`Exact professional type you wanted`);
        }
      }
      
      // MODE SCORING - Less strict
      if (criteria.mode && criteria.mode.length > 0) {
        const onlineMatch = criteria.mode.includes('online') && practitioner.isOnline;
        const inPersonMatch = criteria.mode.includes('in-person') && !practitioner.isOnline;
        
        if (!onlineMatch && !inPersonMatch) {
          score -= 5; // Reduced from 10
          reasons.push(`Alternative consultation method`);
        } else {
          reasons.push(`Preferred consultation method`);
        }
      }
      
      return {
        ...practitioner,
        matchScore: Math.max(10, score), // Minimum score of 10 instead of 0
        reasons
      };
    });
    
    // Sort by match score, but never filter out professionals completely
    scoredPractitioners.sort((a, b) => b.matchScore - a.matchScore);
    setPractitionersWithScores(scoredPractitioners);
  };

  useEffect(() => {
    scoreAllPractitioners();
  }, [criteria, priceRange, showAllProfessionals]);

  const filteredPractitioners = practitionersWithScores.filter(p => {
    // Text search filtering
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      p.name.toLowerCase().includes(searchLower) ||
      p.serviceTags.some(tag => tag.toLowerCase().includes(searchLower)) ||
      p.location.toLowerCase().includes(searchLower) ||
      p.serviceType.toLowerCase().includes(searchLower);
    
    // Price range filtering - but only if we're showing search panel
    const matchesPrice = !showFilterPanel || 
      (p.pricePerSession >= priceRange[0] && p.pricePerSession <= priceRange[1]);
    
    return matchesSearch && matchesPrice;
  });

  // Always ensure we show at least some results
  const resultsToShow = filteredPractitioners.length > 0 
    ? filteredPractitioners 
    : practitionersWithScores.slice(0, 6); // Show at least top 6 matches if filters are too strict

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
              <div className="bg-health-orange/20 text-health-orange-dark px-3 py-1 rounded-full text-sm flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>
                  {criteria.location} 
                  {criteria.locationRadius === 'nearby' && " (+ nearby)"}
                  {criteria.locationRadius === 'anywhere' && " (anywhere)"}
                </span>
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
        
        {resultsToShow.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resultsToShow.map(practitioner => (
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

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users } from 'lucide-react';
import { PhysicianRecommendation, findRecommendedPhysicians, HealthQuery } from '@/services/physician-recommendation-service';
import PhysicianCard from './PhysicianCard';
import { useToast } from '@/hooks/use-toast';

interface PhysicianRecommendationsViewProps {
  healthQuery: HealthQuery;
  onBack: () => void;
  onSelectPhysician?: (physician: PhysicianRecommendation) => void;
}

const PhysicianRecommendationsView: React.FC<PhysicianRecommendationsViewProps> = ({
  healthQuery,
  onBack,
  onSelectPhysician
}) => {
  const [physicians, setPhysicians] = useState<PhysicianRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Finding physicians for query:', healthQuery);
        const recommendations = await findRecommendedPhysicians(healthQuery);
        
        if (recommendations.length === 0) {
          setError('No physicians found matching your criteria. Please try adjusting your search.');
        } else {
          setPhysicians(recommendations);
        }
      } catch (err) {
        console.error('Error loading physician recommendations:', err);
        setError('Failed to load physician recommendations. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadRecommendations();
  }, [healthQuery]);

  const handleSelectPhysician = (physician: PhysicianRecommendation) => {
    toast({
      title: "Physician Selected",
      description: `You selected ${physician.Name} - ${physician.Title}`,
    });
    
    onSelectPhysician?.(physician);
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto py-8">
        <Button 
          variant="ghost" 
          onClick={onBack} 
          className="flex items-center gap-2 mb-6"
        >
          <ArrowLeft size={16} />
          Back
        </Button>
        
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Finding Your Perfect Physician</h2>
          <p className="text-muted-foreground">Analyzing your health needs and matching with specialists...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto py-8">
        <Button 
          variant="ghost" 
          onClick={onBack} 
          className="flex items-center gap-2 mb-6"
        >
          <ArrowLeft size={16} />
          Back
        </Button>
        
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No Results Found</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={onBack}>Try Different Criteria</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-8">
      <Button 
        variant="ghost" 
        onClick={onBack} 
        className="flex items-center gap-2 mb-6"
      >
        <ArrowLeft size={16} />
        Back
      </Button>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Recommended Physicians</h1>
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Your Search Criteria:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Health Issue:</span>
              <p className="font-medium">{healthQuery.issue}</p>
            </div>
            {healthQuery.budget && (
              <div>
                <span className="text-muted-foreground">Budget:</span>
                <p className="font-medium">R{healthQuery.budget}/month</p>
              </div>
            )}
            {healthQuery.location && (
              <div>
                <span className="text-muted-foreground">Preferred Location:</span>
                <p className="font-medium">{healthQuery.location}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {physicians.map((physician, index) => (
          <PhysicianCard 
            key={`${physician.Name}-${index}`}
            physician={physician}
            onSelect={handleSelectPhysician}
          />
        ))}
      </div>
      
      {physicians.length > 0 && (
        <div className="mt-8 p-4 bg-primary/5 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            Showing top {physicians.length} physicians based on your criteria. 
            Results are ranked by specialty match, budget compatibility, experience, and location preference.
          </p>
        </div>
      )}
    </div>
  );
};

export default PhysicianRecommendationsView;
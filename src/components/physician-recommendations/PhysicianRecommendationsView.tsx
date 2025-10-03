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
      <div className="w-full max-w-6xl mx-auto py-8 animate-fade-in">
        <Button 
          variant="ghost" 
          onClick={onBack} 
          className="flex items-center gap-2 mb-8 hover:bg-health-purple/5 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Search
        </Button>
        
        <div className="text-center py-16">
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-health-purple/20 border-t-health-purple rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Users className="w-8 h-8 text-health-purple animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-900">
            Finding Your Perfect Physician
          </h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Analyzing your health needs and matching with top specialists in your area...
          </p>
          <div className="flex justify-center gap-1 mt-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-health-purple rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto py-8 animate-fade-in">
        <Button 
          variant="ghost" 
          onClick={onBack} 
          className="flex items-center gap-2 mb-8 hover:bg-primary/5 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Search
        </Button>
        
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-br from-destructive/10 to-destructive/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-destructive/20">
            <Users className="w-12 h-12 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-destructive">No Results Found</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">{error}</p>
          <div className="space-y-3">
            <Button 
              onClick={onBack} 
              className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary hover:scale-105 transition-all duration-300"
              size="lg"
            >
              Try Different Criteria
            </Button>
            <p className="text-sm text-muted-foreground">
              Try adjusting your budget, location, or health concern description
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-8 animate-fade-in">
      <Button 
        variant="ghost" 
        onClick={onBack} 
        className="flex items-center gap-2 mb-8 hover:bg-health-purple/5 transition-colors text-lg"
      >
        <ArrowLeft size={18} />
        Back to Search
      </Button>
      
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-6 text-gray-900">
          Recommended Physicians
        </h1>
        <div className="bg-card/95 backdrop-blur-sm p-6 rounded-xl border border-border">
          <h3 className="font-semibold mb-3 text-lg flex items-center gap-2 text-gray-900">
            <Users className="w-5 h-5 text-health-purple" />
            Your Search Query
          </h3>
          <p className="text-gray-600 leading-relaxed bg-background/50 p-4 rounded-lg border border-border">
            "{healthQuery.prompt}"
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {physicians.map((physician, index) => (
          <div 
            key={`${physician.Name}-${index}`}
            className="animate-scale-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <PhysicianCard 
              physician={physician}
              onSelect={handleSelectPhysician}
              healthQueryPrompt={healthQuery.prompt}
            />
          </div>
        ))}
      </div>
      
      {physicians.length > 0 && (
        <div className="mt-12 p-6 bg-card/95 backdrop-blur-sm rounded-xl border border-border">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-2 h-2 bg-health-purple rounded-full animate-pulse"></div>
              <span className="font-semibold text-health-purple">Results Summary</span>
              <div className="w-2 h-2 bg-health-purple rounded-full animate-pulse"></div>
            </div>
            <p className="text-gray-600 text-lg">
              Showing <span className="font-bold text-health-purple">{physicians.length}</span> top-rated physicians 
              matched to your specific needs
            </p>
            <p className="text-sm text-gray-600">
              Results ranked by specialty match, budget compatibility, experience, and location preference
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhysicianRecommendationsView;
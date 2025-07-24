import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, DollarSign } from 'lucide-react';
import { PhysicianRecommendation } from '@/services/physician-recommendation-service';

interface PhysicianCardProps {
  physician: PhysicianRecommendation;
  onSelect?: (physician: PhysicianRecommendation) => void;
}

const PhysicianCard: React.FC<PhysicianCardProps> = ({ physician, onSelect }) => {
  return (
    <Card className="h-full flex flex-col transition-all hover:shadow-lg">
      <CardContent className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-foreground">{physician.Name}</h3>
            <p className="text-muted-foreground font-medium">{physician.Title}</p>
          </div>
          <Badge 
            variant={physician.affordability === 'Within budget' ? 'default' : 'secondary'}
            className={
              physician.affordability === 'Within budget' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100'
            }
          >
            {physician.affordability}
          </Badge>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Experience:</span>
            <span className="font-medium">{physician.Experience} years</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Location:</span>
            <span className="font-medium">{physician.Location}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Monthly Fee:</span>
            <span className="font-medium">R{physician.Price}</span>
          </div>
          
          {physician.matchReason && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">{physician.matchReason}</p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-6 pt-0">
        <Button 
          onClick={() => onSelect?.(physician)} 
          className="w-full"
          variant="default"
        >
          Select Physician
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PhysicianCard;
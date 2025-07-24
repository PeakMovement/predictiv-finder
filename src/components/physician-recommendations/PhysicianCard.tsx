import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  MapPin, 
  Clock, 
  DollarSign, 
  Star,
  Stethoscope,
  Calendar
} from 'lucide-react';
import { PhysicianRecommendation } from '@/services/physician-recommendation-service';

interface PhysicianCardProps {
  physician: PhysicianRecommendation;
  onSelect: (physician: PhysicianRecommendation) => void;
}

const PhysicianCard: React.FC<PhysicianCardProps> = ({ physician, onSelect }) => {
  const isAffordable = physician.affordability === 'Within budget';
  const initials = physician.Name.split(' ').map(n => n[0]).join('');
  
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-primary/30 bg-gradient-to-br from-background to-muted/20 animate-fade-in">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 border-4 border-primary/20 group-hover:border-primary/40 transition-colors">
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/30 text-primary font-bold text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                {physician.Name}
              </h3>
              <Badge 
                variant={isAffordable ? "default" : "secondary"}
                className={`${
                  isAffordable 
                    ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' 
                    : 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200'
                } transition-colors font-semibold`}
              >
                {physician.affordability}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-primary font-semibold">
              <Stethoscope className="w-4 h-4" />
              <span className="text-sm">{physician.Title}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm">
              <span className="font-semibold text-foreground">{physician.Experience}</span> years
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">{physician.Location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Monthly Fee</span>
          </div>
          <span className="text-xl font-bold text-primary">R{physician.Price}</span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm">Highly rated specialist</span>
        </div>

        {physician.matchReason && (
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm text-primary font-medium">
              ✓ {physician.matchReason}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-4">
        <Button 
          onClick={() => onSelect(physician)}
          className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg group-hover:shadow-xl"
          size="lg"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Select Physician
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PhysicianCard;
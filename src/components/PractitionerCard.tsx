
import { motion } from 'framer-motion';
import { Star, MapPin, Video, AlertCircle, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Practitioner } from '@/types';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PractitionerCardProps {
  practitioner: Practitioner;
  onSelect: (practitioner: Practitioner) => void;
  matchScore?: number;
  matchReasons?: string[];
  expanded?: boolean;
}

export const PractitionerCard = ({ 
  practitioner, 
  onSelect,
  matchScore,
  matchReasons = [],
  expanded = false
}: PractitionerCardProps) => {
  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 85) return 'text-green-500';
    if (score >= 65) return 'text-health-teal';
    if (score >= 45) return 'text-amber-500';
    return 'text-orange-500';
  };

  const getScoreText = (score?: number) => {
    if (!score) return 'Unknown';
    if (score >= 85) return 'Excellent match';
    if (score >= 65) return 'Good match';
    if (score >= 45) return 'Partial match';
    return 'Possible option';
  };

  const getMatchIcon = (score?: number) => {
    if (!score) return <AlertCircle className="w-4 h-4" />;
    if (score >= 65) return <Check className="w-4 h-4" />;
    if (score >= 45) return <AlertCircle className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  // Format price tag with info about session length
  const getPriceDisplay = () => {
    const baseText = `R${practitioner.pricePerSession}`;
    if (practitioner.serviceType === 'coaching') {
      return `${baseText}/session`;
    } else if (practitioner.serviceType === 'dietician') {
      return `${baseText}/consultation`;
    } else if (practitioner.serviceType === 'physiotherapist' || practitioner.serviceType === 'biokineticist') {
      return `${baseText}/session`;
    }
    return `${baseText}/session`;
  };

  // Log the practitioner when selected for debugging
  const handleSelectPractitioner = () => {
    console.log("Selected practitioner:", practitioner);
    onSelect(practitioner);
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`
        bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden relative
        ${matchScore && matchScore < 65 ? 'border border-amber-300' : ''}
        ${matchScore && matchScore < 45 ? 'border border-orange-300' : ''}
      `}
    >
      {matchScore !== undefined && (
        <div className={`absolute top-2 right-2 z-10 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 
          ${matchScore >= 85 ? 'bg-green-100 text-green-700' : 
           matchScore >= 65 ? 'bg-health-teal/20 text-health-teal-dark' : 
           matchScore >= 45 ? 'bg-amber-100 text-amber-700' : 
           'bg-orange-100 text-orange-700'}`}
        >
          {getMatchIcon(matchScore)}
          <span>{getScoreText(matchScore)}</span>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row h-full">
        <div className="md:w-1/3 h-32 md:h-auto">
          <img 
            src={practitioner.imageUrl} 
            alt={practitioner.name} 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="p-4 md:p-5 md:w-2/3 flex flex-col">
          <div className="mb-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{practitioner.name}</h3>
                <p className="text-health-purple text-sm capitalize">{practitioner.serviceType.replace('-', ' ')}</p>
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="ml-1 text-sm">{practitioner.rating}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center text-xs text-gray-600 dark:text-gray-300 mt-2 gap-x-3">
              <div className="flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                {practitioner.location}
              </div>
              
              {practitioner.isOnline && (
                <div className="flex items-center text-health-teal">
                  <Video className="w-3 h-3 mr-1" />
                  Online
                </div>
              )}
              
              <div className="font-medium text-health-purple">
                {getPriceDisplay()}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1 mb-3">
            {practitioner.serviceTags.slice(0, 3).map(tag => (
              <Badge 
                key={tag}
                variant="outline"
                className="text-xs py-0 bg-health-purple/5 border-health-purple/20"
              >
                {tag}
              </Badge>
            ))}
            {practitioner.serviceTags.length > 3 && (
              <Badge
                variant="outline"
                className="text-xs py-0 bg-gray-100 border-gray-200 text-gray-500"
              >
                +{practitioner.serviceTags.length - 3} more
              </Badge>
            )}
          </div>
          
          {matchReasons && matchReasons.length > 0 && (
            <div className="mb-3 text-xs">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1 underline underline-offset-2 decoration-dotted">
                    <span className={getScoreColor(matchScore)}>Why this match?</span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs p-3">
                    <div className="font-medium mb-1">Match details:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {matchReasons.map((reason, index) => (
                        <li key={index} className="text-xs">{reason}</li>
                      ))}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
          
          <div className="mt-auto flex items-center justify-between">
            <p className="text-xs text-gray-500">{practitioner.availability}</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  onClick={handleSelectPractitioner}
                  className="bg-health-purple hover:bg-health-purple-dark text-sm"
                  size="sm"
                >
                  View Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    <span>{practitioner.name}</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm">{practitioner.rating}</span>
                    </div>
                  </DialogTitle>
                  <DialogDescription className="capitalize">
                    {practitioner.serviceType.replace('-', ' ')}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="col-span-1">
                    <div className="rounded-lg overflow-hidden mb-4">
                      <img 
                        src={practitioner.imageUrl} 
                        alt={practitioner.name} 
                        className="w-full object-cover aspect-square"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg' }}
                      />
                    </div>
                    
                    <div className="flex items-center text-sm mb-2">
                      <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                      <span>{practitioner.location}</span>
                    </div>
                    
                    {practitioner.isOnline && (
                      <div className="flex items-center text-sm mb-4 text-health-teal">
                        <Video className="w-4 h-4 mr-2" />
                        <span>Available for online consultations</span>
                      </div>
                    )}
                    
                    <Button className="w-full bg-health-purple hover:bg-health-purple-dark mt-4">
                      Book a Consultation
                    </Button>
                  </div>
                  
                  <div className="col-span-2">
                    <div className="mb-4">
                      <h4 className="font-medium text-lg mb-2">Specialties</h4>
                      <div className="flex flex-wrap gap-2">
                        {practitioner.serviceTags.map(specialty => (
                          <Badge
                            key={specialty}
                            variant="outline"
                            className="bg-health-purple/10 text-health-purple border-health-purple/20"
                          >
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-medium text-lg mb-2">Availability</h4>
                      <p className="text-gray-700 dark:text-gray-300">
                        {practitioner.availability}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-lg mb-2">About Me</h4>
                      <p className="text-gray-700 dark:text-gray-300">
                        {practitioner.bio}
                      </p>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-medium text-lg mb-2">Price</h4>
                      <p className="text-xl font-semibold text-health-purple">
                        {getPriceDisplay()}
                      </p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PractitionerCard;

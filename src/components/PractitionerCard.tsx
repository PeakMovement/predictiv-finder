
import { Practitioner } from "@/types";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PractitionerCardProps {
  practitioner: Practitioner;
  onSelect: (practitioner: Practitioner) => void;
}

export const PractitionerCard = ({ practitioner, onSelect }: PractitionerCardProps) => {
  return (
    <motion.div
      className="rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="p-6">
        <div className="flex items-start space-x-4 mb-4">
          <div className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden bg-gray-200">
            <img 
              src={practitioner.imageUrl} 
              alt={practitioner.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-grow">
            <div className="flex justify-between">
              <h3 className="text-lg font-semibold">{practitioner.name}</h3>
              <div className="flex items-center text-yellow-500">
                <span className="mr-1">⭐</span>
                <span className="text-sm font-medium">{practitioner.rating}</span>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 capitalize text-sm mt-1">
              {practitioner.serviceType.replace('-', ' ')}
            </p>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
              <span className="mr-1">📍</span>
              <span>{practitioner.location}</span>
              {practitioner.isOnline && (
                <Badge variant="outline" className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800">
                  Online Available
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
          {practitioner.bio}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {practitioner.serviceTags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="font-bold text-lg">R{practitioner.pricePerSession}<span className="text-xs font-normal text-gray-500 dark:text-gray-400">/session</span></p>
          <Button 
            onClick={() => onSelect(practitioner)}
            className="bg-health-teal hover:bg-health-teal-dark"
          >
            Book Session
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default PractitionerCard;

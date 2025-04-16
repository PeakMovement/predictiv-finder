
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AIHealthPlan, ServiceCategory } from '@/types';
import { PRACTITIONERS } from '@/data/mockData';
import { addDays, format } from 'date-fns';

interface PlanDetailsViewProps {
  plan: AIHealthPlan;
  userQuery: string;
  onBack: () => void;
}

interface TreatmentSession {
  id: string;
  serviceType: ServiceCategory;
  practitionerName: string;
  practitionerImage: string;
  date: Date;
  description: string;
}

const PlanDetailsView: React.FC<PlanDetailsViewProps> = ({ plan, userQuery, onBack }) => {
  // Generate a realistic timeline based on the plan
  const generateTreatmentTimeline = (plan: AIHealthPlan): TreatmentSession[] => {
    const timeline: TreatmentSession[] = [];
    const startDate = new Date();
    
    // Get time frame in weeks
    const timeFrameWeeks = parseInt(plan.timeFrame.split(' ')[0]) || 8;
    
    // Get relevant practitioners for each service type
    const relevantPractitioners = plan.services.map(service => {
      const matchingPractitioners = PRACTITIONERS.filter(p => p.serviceType === service.type);
      return {
        serviceType: service.type,
        practitioner: matchingPractitioners[0] || { 
          name: `${service.type.replace('-', ' ')} specialist`,
          imageUrl: '/placeholder.svg'
        },
        sessionCount: service.sessions
      };
    });
    
    // Create timeline entries
    let currentSessionId = 1;
    relevantPractitioners.forEach(({ serviceType, practitioner, sessionCount }) => {
      // Distribute sessions evenly throughout the timeframe
      const sessionInterval = Math.floor((timeFrameWeeks * 7) / (sessionCount + 1));
      
      for (let i = 0; i < sessionCount; i++) {
        const sessionDate = addDays(startDate, (i + 1) * sessionInterval);
        
        // Generate appropriate description based on service type and progress
        let description = '';
        const progress = (i + 1) / sessionCount;
        
        if (serviceType === 'physiotherapist') {
          if (progress < 0.3) {
            description = "Initial assessment and pain management techniques";
          } else if (progress < 0.7) {
            description = "Progressive mobility exercises and targeted therapy";
          } else {
            description = "Advanced rehabilitation and prevention strategies";
          }
        } else if (serviceType === 'personal-trainer') {
          if (progress < 0.3) {
            description = "Baseline fitness assessment and introductory exercises";
          } else if (progress < 0.7) {
            description = "Progressive strength training and technique refinement";
          } else {
            description = "Advanced conditioning and performance optimization";
          }
        } else if (serviceType === 'dietician') {
          if (progress < 0.3) {
            description = "Nutritional assessment and initial dietary planning";
          } else if (progress < 0.7) {
            description = "Diet refinement and nutritional education";
          } else {
            description = "Long-term nutrition strategy and maintenance planning";
          }
        } else if (serviceType === 'biokineticist') {
          if (progress < 0.3) {
            description = "Movement pattern analysis and corrective exercises";
          } else if (progress < 0.7) {
            description = "Functional movement progression and stability training";
          } else {
            description = "Advanced biomechanical optimization and injury prevention";
          }
        } else if (serviceType === 'coaching') {
          if (progress < 0.3) {
            description = "Goal setting and wellness strategy development";
          } else if (progress < 0.7) {
            description = "Progress evaluation and motivation reinforcement";
          } else {
            description = "Long-term wellness planning and habit integration";
          }
        }
        
        timeline.push({
          id: `session-${currentSessionId++}`,
          serviceType,
          practitionerName: practitioner.name,
          practitionerImage: practitioner.imageUrl,
          date: sessionDate,
          description
        });
      }
    });
    
    // Sort by date
    timeline.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    return timeline;
  };
  
  const treatmentTimeline = generateTreatmentTimeline(plan);
  const endDate = treatmentTimeline.length > 0 
    ? treatmentTimeline[treatmentTimeline.length - 1].date 
    : addDays(new Date(), parseInt(plan.timeFrame.split(' ')[0]) * 7 || 56);
  
  // Calculate expected recovery/results date based on plan type and timeframe
  const getExpectedResultsDate = () => {
    const timeFrameWeeks = parseInt(plan.timeFrame.split(' ')[0]) || 8;
    
    switch (plan.planType) {
      case 'high-impact':
        // Faster results with high-impact plan
        return addDays(new Date(), Math.floor(timeFrameWeeks * 7 * 0.75));
      case 'progressive':
        // Gradual results with progressive plan
        return addDays(new Date(), timeFrameWeeks * 7);
      case 'best-fit':
      default:
        // Standard timeline
        return addDays(new Date(), Math.floor(timeFrameWeeks * 7 * 0.85));
    }
  };
  
  const expectedResultsDate = getExpectedResultsDate();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-6xl mx-auto"
    >
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack} 
          className="mr-2"
        >
          ←
        </Button>
        <h2 className="text-2xl font-semibold">Your Personalized Wellness Journey</h2>
      </div>
      
      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md mb-6">
        <div className="flex justify-between items-start flex-wrap">
          <div>
            <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{plan.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {plan.services.map((service, idx) => (
                <Badge key={idx} variant="outline" className="capitalize">
                  {service.type.replace('-', ' ')}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="bg-health-teal/10 p-4 rounded-lg">
            <p className="text-sm font-medium">Total Investment</p>
            <p className="text-2xl font-bold text-health-teal">R{plan.totalCost}</p>
            <p className="text-xs text-gray-500">Over {plan.timeFrame}</p>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <h4 className="font-medium mb-2">Expected Outcomes</h4>
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            Based on your goals: "{userQuery}"
          </p>
          
          <div className="flex items-center mb-2">
            <div className="w-4 h-4 rounded-full bg-health-purple mr-2"></div>
            <p>Your wellness journey starts today</p>
          </div>
          
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-health-teal mr-2"></div>
            <p>
              {plan.planType === 'high-impact' 
                ? 'Accelerated results expected by ' 
                : plan.planType === 'progressive' 
                  ? 'Sustainable progress building toward ' 
                  : 'Projected outcomes by '}
              <span className="font-bold">{format(expectedResultsDate, 'dd MMMM yyyy')}</span>
            </p>
          </div>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold mb-4">Your Treatment Schedule</h3>
      
      <div className="relative">
        {/* Timeline vertical line */}
        <div className="absolute top-0 bottom-0 left-[39px] w-0.5 bg-gray-200 dark:bg-gray-700"></div>
        
        {/* Timeline events */}
        <div className="space-y-8">
          {treatmentTimeline.map((session, index) => (
            <div key={session.id} className="relative flex items-start">
              {/* Timeline dot */}
              <div className="absolute left-[32px] w-[14px] h-[14px] rounded-full bg-health-purple border-4 border-white dark:border-gray-900"></div>
              
              {/* Date flag */}
              <div className="ml-[70px] flex-grow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                  <p className="text-health-purple font-medium">{format(session.date, 'EEEE, MMMM dd, yyyy')}</p>
                  <Badge className="capitalize my-1 sm:my-0">
                    {session.serviceType.replace('-', ' ')} Session {index + 1}
                  </Badge>
                </div>
                
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden mr-3 bg-gray-200">
                      <img 
                        src={session.practitionerImage} 
                        alt={session.practitionerName} 
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg' }}
                      />
                    </div>
                    <div>
                      <p className="font-medium">{session.practitionerName}</p>
                      <p className="text-sm text-gray-500 capitalize">{session.serviceType.replace('-', ' ')}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300">{session.description}</p>
                </div>
              </div>
            </div>
          ))}
          
          {/* Final outcome point */}
          <div className="relative flex items-start">
            <div className="absolute left-[32px] w-[14px] h-[14px] rounded-full bg-health-teal border-4 border-white dark:border-gray-900"></div>
            
            <div className="ml-[70px] flex-grow">
              <p className="text-health-teal font-medium mb-2">{format(endDate, 'MMMM dd, yyyy')}</p>
              <div className="p-4 bg-health-teal/10 border border-health-teal/20 rounded-lg">
                <h4 className="font-bold text-health-teal mb-2">
                  {plan.planType === 'high-impact' 
                    ? 'Accelerated Results Milestone' 
                    : plan.planType === 'progressive' 
                      ? 'Sustainable Progress Review' 
                      : 'Wellness Achievement Review'}
                </h4>
                <p>
                  By this milestone, you should experience significant improvement in 
                  your {plan.services.map(s => s.type.replace('-', ' ')).join(' and ')} goals,
                  with measurable progress toward your wellness objectives.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-center">
        <Button 
          onClick={() => alert('In a complete app, this would take you to payment and scheduling.')} 
          className="bg-health-purple hover:bg-health-purple-dark"
          size="lg"
        >
          Confirm & Book This Plan
        </Button>
      </div>
    </motion.div>
  );
};

export default PlanDetailsView;

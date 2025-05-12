
import React, { useState } from 'react';
import { format, addDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AIHealthPlan, ServiceCategory } from '@/types';
import { PRACTITIONERS } from '@/data/mockData';

interface TreatmentSession {
  id: string;
  serviceType: ServiceCategory;
  practitionerName: string;
  practitionerImage: string;
  date: Date;
  description: string;
}

interface TreatmentScheduleProps {
  plan: AIHealthPlan;
}

export const TreatmentSchedule: React.FC<TreatmentScheduleProps> = ({ plan }) => {
  const [activeExplanationService, setActiveExplanationService] = useState<string | null>(null);

  // Generate a realistic timeline based on the plan
  const generateTreatmentTimeline = (plan: AIHealthPlan): TreatmentSession[] => {
    const timeline: TreatmentSession[] = [];
    const startDate = new Date();
    
    // Get time frame in weeks
    const timeFrameWeeks = parseInt(plan.timeFrame.split(' ')[0]) || 8;
    
    // Get relevant practitioners for each service type
    const relevantPractitioners = plan.services.map(service => {
      let practitioner;
      
      if (service.recommendedPractitioners && service.recommendedPractitioners.length > 0) {
        // Use recommended practitioners if available
        practitioner = service.recommendedPractitioners[0];
      } else {
        // Fall back to generic practitioners
        const matchingPractitioners = PRACTITIONERS.filter(p => p.serviceType === service.type);
        practitioner = matchingPractitioners[0] || { 
          name: `${service.type.replace('-', ' ')} specialist`,
          imageUrl: '/placeholder.svg',
          serviceType: service.type
        };
      }
      
      return {
        serviceType: service.type,
        practitioner,
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
          practitionerImage: practitioner.imageUrl || "/placeholder.svg",
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

  // Toggle service explanation
  const toggleServiceExplanation = (serviceType: string) => {
    if (activeExplanationService === serviceType) {
      setActiveExplanationService(null);
    } else {
      setActiveExplanationService(serviceType);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-3">
            <h4 className="font-medium mb-4">Recommended Services</h4>
            <div className="space-y-4">
              {plan.services.map((service, idx) => (
                <div 
                  key={idx} 
                  className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="font-medium capitalize">
                      {service.type.replace('-', ' ')}
                    </h5>
                    <Badge>
                      {service.sessions} sessions
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {service.description}
                  </p>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">
                      R{service.price} per session
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => toggleServiceExplanation(service.type)}
                      className="h-7 text-health-purple hover:text-health-purple-dark hover:bg-health-purple/10"
                    >
                      {activeExplanationService === service.type ? 'Hide Detail' : 'Why This Service?'}
                    </Button>
                  </div>
                  
                  {activeExplanationService === service.type && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      {plan.rationales?.find(r => r.service === service.type) ? (
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          {plan.rationales.find(r => r.service === service.type)?.rationale}
                          
                          <div className="mt-2 flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-1.5 ${
                              plan.rationales.find(r => r.service === service.type)?.evidenceLevel === 'high' 
                                ? 'bg-green-500' 
                                : plan.rationales.find(r => r.service === service.type)?.evidenceLevel === 'medium'
                                ? 'bg-yellow-500'
                                : 'bg-gray-400'
                            }`}></div>
                            <span className="text-xs text-gray-500">
                              {plan.rationales.find(r => r.service === service.type)?.evidenceLevel === 'high' 
                                ? 'Strong evidence supports this recommendation' 
                                : plan.rationales.find(r => r.service === service.type)?.evidenceLevel === 'medium'
                                ? 'Moderate evidence supports this recommendation'
                                : 'Limited evidence supports this recommendation'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          This service was selected based on your specific health needs and goals.
                          It forms an essential part of your comprehensive treatment approach.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="md:col-span-2">
            <h4 className="font-medium mb-4">Expected Progress</h4>
            {plan.expectedOutcomes ? (
              <div className="space-y-6">
                {plan.expectedOutcomes.map((outcome, idx) => {
                  // Calculate a mock progress percentage
                  const timeframeWeeks = parseInt(outcome.timeframe) || 4;
                  const totalDays = timeframeWeeks * 7;
                  const elapsedDays = Math.min(totalDays, 1); // Just started
                  const progress = Math.round((elapsedDays / totalDays) * 100);
                  
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{outcome.milestone}</span>
                        <span className="text-xs text-gray-500">{outcome.timeframe}</span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div 
                          className="h-full bg-health-teal rounded-full" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{outcome.description}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Initial Progress</span>
                    <span className="text-xs text-gray-500">Week 2</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div className="h-full bg-health-teal rounded-full" style={{ width: '0%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500">Early adaptation and baseline improvements</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Significant Improvement</span>
                    <span className="text-xs text-gray-500">Week 6</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div className="h-full bg-health-teal rounded-full" style={{ width: '0%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500">Notable functional changes and symptom reduction</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Goal Achievement</span>
                    <span className="text-xs text-gray-500">Week 12</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div className="h-full bg-health-teal rounded-full" style={{ width: '0%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500">Reaching primary objectives with sustainable strategies</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
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
    </>
  );
};

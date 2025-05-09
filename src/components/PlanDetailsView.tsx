
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AIHealthPlan, ServiceCategory } from '@/types';
import { PRACTITIONERS } from '@/data/mockData';
import { addDays, format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Info, MessageCircle, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

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
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [activeExplanationService, setActiveExplanationService] = useState<string | null>(null);
  const { toast } = useToast();

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

  // Available time slots for booking
  const timeSlots = [
    "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"
  ];

  // Handle booking confirmation
  const handleConfirmBooking = () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      toast({
        title: "Missing information",
        description: "Please select a service, date and time to continue.",
        variant: "destructive",
      });
      return;
    }

    // Here we would normally send the booking to an API
    toast({
      title: "Booking confirmed!",
      description: `Your ${selectedService} appointment is scheduled for ${format(selectedDate, 'EEEE, MMMM dd, yyyy')} at ${selectedTime}.`,
    });
    setBookingOpen(false);
  };

  // Reset booking form when dialog is opened
  const handleOpenBooking = () => {
    setSelectedService(plan.services[0]?.type || null);
    setSelectedDate(new Date());
    setSelectedTime(null);
    setBookingOpen(true);
  };

  // Toggle service explanation
  const toggleServiceExplanation = (serviceType: string) => {
    if (activeExplanationService === serviceType) {
      setActiveExplanationService(null);
    } else {
      setActiveExplanationService(serviceType);
    }
  };
  
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
          
          {plan.expectedOutcomes ? (
            <div className="space-y-3">
              {plan.expectedOutcomes.slice(0, 3).map((outcome, idx) => (
                <div key={idx} className="flex items-start">
                  <div className="w-4 h-4 rounded-full bg-health-teal mr-2 mt-1"></div>
                  <div>
                    <p className="font-medium">{outcome.milestone} ({outcome.timeframe})</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{outcome.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
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
            </>
          )}
          
          {plan.rationales && plan.rationales.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="rationales">
                  <AccordionTrigger className="text-sm font-medium">
                    Why We Recommend This Plan
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      {plan.rationales.map((rationale, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <div className={`w-3 h-3 rounded-full mt-1 ${
                            rationale.evidenceLevel === 'high' ? 'bg-green-500' :
                            rationale.evidenceLevel === 'medium' ? 'bg-amber-500' :
                            'bg-gray-400'
                          }`} />
                          <div>
                            <p className="text-sm font-medium capitalize">
                              {rationale.service.replace('-', ' ')}
                              <span className="text-xs font-normal ml-2 text-gray-500">
                                ({rationale.evidenceLevel} evidence)
                              </span>
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{rationale.rationale}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h4 className="font-semibold mb-3 flex items-center">
            <MessageCircle className="h-4 w-4 mr-2 text-health-purple" />
            Plan Benefits
          </h4>
          <ul className="space-y-2">
            <li className="flex items-center text-sm">
              <div className="w-2 h-2 rounded-full bg-health-purple mr-2"></div>
              <span>Personalized to your specific needs</span>
            </li>
            <li className="flex items-center text-sm">
              <div className="w-2 h-2 rounded-full bg-health-purple mr-2"></div>
              <span>Expert practitioners to guide your progress</span>
            </li>
            <li className="flex items-center text-sm">
              <div className="w-2 h-2 rounded-full bg-health-purple mr-2"></div>
              <span>Comprehensive approach targeting all aspects</span>
            </li>
            <li className="flex items-center text-sm">
              <div className="w-2 h-2 rounded-full bg-health-purple mr-2"></div>
              <span>Evidence-based techniques for optimal results</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h4 className="font-semibold mb-3 flex items-center">
            <Info className="h-4 w-4 mr-2 text-health-teal" />
            Your Journey Timeline
          </h4>
          <div className="space-y-3">
            {plan.progressTimeline ? (
              plan.progressTimeline.slice(0, 3).map((milestone, idx) => (
                <div key={idx} className="flex items-center">
                  <div className="relative">
                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs">
                      {milestone.week}
                    </div>
                    {idx < 2 && <div className="absolute top-6 left-3 w-px h-12 bg-gray-200 dark:bg-gray-700"></div>}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-sm">{milestone.milestone}</p>
                    <p className="text-xs text-gray-500">{milestone.focus}</p>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs">1</div>
                  <div className="ml-3">
                    <p className="font-medium text-sm">Initial Assessment</p>
                    <p className="text-xs text-gray-500">Establish baseline and goals</p>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute left-3 w-px h-6 bg-gray-200 dark:bg-gray-700"></div>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs">
                    {Math.floor(parseInt(plan.timeFrame) / 2)}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-sm">Mid-point Review</p>
                    <p className="text-xs text-gray-500">Progress evaluation and adjustments</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h4 className="font-semibold mb-3 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
            Important Notes
          </h4>
          <div className="space-y-2 text-sm">
            <p>• Regular attendance is key to achieving optimal results</p>
            <p>• Please arrive 10 minutes early for your first session</p>
            <p>• Cancellations require 24-hour notice to avoid fees</p>
            <p>• Progress tracking will help adjust your plan as needed</p>
          </div>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold mb-4">Your Treatment Schedule</h3>
      
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
                      <Progress value={progress} className="h-2" />
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
                  <Progress value={0} className="h-2" />
                  <p className="text-xs text-gray-500">Early adaptation and baseline improvements</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Significant Improvement</span>
                    <span className="text-xs text-gray-500">Week 6</span>
                  </div>
                  <Progress value={0} className="h-2" />
                  <p className="text-xs text-gray-500">Notable functional changes and symptom reduction</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Goal Achievement</span>
                    <span className="text-xs text-gray-500">Week 12</span>
                  </div>
                  <Progress value={0} className="h-2" />
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
      
      <div className="mt-8 flex justify-center">
        <Button 
          onClick={handleOpenBooking}
          className="bg-health-purple hover:bg-health-purple-dark"
          size="lg"
        >
          Confirm & Book This Plan
        </Button>
      </div>

      {/* Booking Dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book Your First Appointment</DialogTitle>
            <DialogDescription>
              Select which specialist you'd like to see first, and choose a convenient date and time.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label htmlFor="service" className="text-sm font-medium">
                Select a Service
              </label>
              <Select
                value={selectedService || ""}
                onValueChange={setSelectedService}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a service" />
                </SelectTrigger>
                <SelectContent>
                  {plan.services.map((service) => (
                    <SelectItem key={service.type} value={service.type}>
                      {service.type.replace('-', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Select a Date
              </label>
              <div className="border rounded-md p-1">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => {
                    // Disable past dates and weekends
                    return (
                      date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                      date.getDay() === 0 ||
                      date.getDay() === 6
                    );
                  }}
                  initialFocus
                  className="rounded-md border pointer-events-auto"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Select a Time
              </label>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    type="button"
                    variant={selectedTime === time ? "default" : "outline"}
                    onClick={() => setSelectedTime(time)}
                    className="text-center"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmBooking} className="bg-health-purple hover:bg-health-purple-dark">
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default PlanDetailsView;
